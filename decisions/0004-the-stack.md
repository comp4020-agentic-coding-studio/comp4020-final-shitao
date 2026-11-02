# 4. A framework-free Node server, SQLite on the volume, server-sent events

Status: accepted, September 2026, for crit 8 ("It's alive!"). Written up
here in November from the account first given in `PROCESS.md`
([`50e0ec3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/50e0ec3)),
so it can be read on its own.

## Context

`fly.toml` fixes the shape: one `shared-cpu-1x` machine with 256 MB, one
volume at `/data`, no database server beside it, and a machine that stops
when nobody is using it. The app itself is small: mint a cookie, store one
SVG path per hand per day, render every path on one page, publish the
README at a second, and push each new mark to every open tab.

## Options

1. **Astro SSR with `better-sqlite3`.** What I used for the crit-7 booking
   app, and it worked. But Trace has two pages and three routes, so the
   framework would be most of the code. `better-sqlite3` is a native addon
   that has to compile inside the slim image.
2. **A framework-free `node:http` server with `node:sqlite`.** Node 24 runs
   TypeScript directly by stripping types, so there's no build step, and
   `node:sqlite` ships with the runtime. The only runtime dependency is
   `marked`, for `/readme/`.
3. **WebSockets for the live layer.** Two-way, which Trace doesn't need:
   nothing a tab sends has to travel over the same connection as what it
   receives.
4. **Server-sent events.** One long-lived HTTP response per tab, pushing a
   finished mark one way, server to browser, with a numbered `id:` the
   browser sends back when it reconnects.
5. **Polling.** Catches up for free, but every tab asks the server
   something every second for a wall that might change once an hour, and a
   machine that's meant to stop when idle never would.

## Decision

Options 2 and 4. The live layer is a plain `Set` of open responses in
`src/server.ts`, written to after `addMark` commits and never before, with
a 20-second heartbeat so Fly's proxy doesn't drop an idle stream. A set in
memory is enough only because `fly.toml` pins one machine.

## What it costs

- **Nothing hides concurrency from me.** The first real bug was a race a
  framework wouldn't have prevented either: `hasMarkedToday` ran before
  `await readBody`, so a client holding its body open could mark twice
  ([`7a89c68`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/7a89c68)).
  Routing, cookies, body limits and escaping are all hand-written, and
  each is mine to get right.
- **SSE needed its own recovery.** Chrome doesn't retry an `EventSource`
  whose server died, which is what every redeploy does, so the client
  reopens it itself (decision 1).
- **One machine is a ceiling.** The day there are two, an in-memory set
  stops reaching every tab, and this record needs a successor.
- **`node:sqlite` is younger than `better-sqlite3`**, with less written
  about it and fewer people who've hit its edges. The volume holds a plain
  SQLite file either way, so moving off it later is a driver change, not a
  data migration.

## How it's checked

CI builds this `Dockerfile`, starts the image with a throwaway `/data`, and
runs `pnpm check` against it before any deploy. `spec/wall.test.ts` checks
the broadcast arrives within a second, that the held-open-body race stays
closed, and that a reconnecting stream replays what it missed.

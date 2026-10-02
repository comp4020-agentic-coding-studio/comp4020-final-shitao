# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 92h to cutoff at start,
ninth run of this crit's window.** Job was plan/build/deepen, not finish ---
the prompt didn't call this the last run.

## What this run did

Took stock: `git status` clean, local `main` matches `origin/main`
(`3e51f5d`), `flyctl status` showed version 8 (`176b787`, the last app-code
commit) still live --- nothing out of date, nothing to redeploy.

Ran `pnpm check` against a scratch server (`DB_PATH`/`PORT` pointed at
`/tmp`): 15/15 green, typecheck clean.

Did a fresh cold read of `src/server.ts`, `src/db.ts`, `src/identity.ts`,
`public/wall.js` with a new framing (SSE resource lifecycle and
error-handling under abrupt disconnect --- not gesture/nonce logic, already
covered three runs running). Specifically: does a hard client disconnect
(TCP reset, not a clean close) on `/api/marks/stream` ever reach the next
`setInterval` heartbeat's `res.write()` before `req.on("close")` has removed
it from `sseClients`, and if so, does Node's unhandled 'error' event on a
dead `ServerResponse` crash the whole process (which would take down every
other hand's connection too, on this single-machine deployment)? Reproduced
with raw `net.Socket`s and `resetAndDestroy()` (no FIN handshake) against a
scratch server: single hard-reset mid-stream, and five simultaneous streams
(three hard-reset, two kept open) held across the full 20s heartbeat
interval. Server survived both --- no crash, no error in the log, still
answering `curl` afterward. This is a **clean result, not a bug**: worth
recording so a future run doesn't re-spend time on the same question. Did
not touch `broadcastMark`/`sseClients` as a result.

Followed with a real-browser pass (first one in a few runs --- the standing
"content-complete isn't sufficient, check a real render periodically" habit),
`agent-browser --session crit8-visual` against the same scratch server:
`/` and `/readme/` at both marking viewports (1920×1080, 390×844), plus one
real drag gesture at desktop size (mouse down/move×3/up) confirming the
stroke lands, the status text flips to "already on the wall today," and a
reload at mobile size renders that same already-marked state correctly with
no overflow. Console/`errors` clean throughout. Closed the browser session
and killed the scratch server afterward (confirmed port free).

No commits this run --- nothing needed fixing, and the repo was already at
the harness's own last-pushed state.

## Next action

Normal cadence continues: reread README fresh each run (still holds up, last
touched several runs ago), cold-read `src`/`public` again with yet another
*varied* framing next time (tried so far: resource lifecycle/client-state,
self-echo content-vs-token, overlapping-gesture nonce clobber, and now SSE
abrupt-disconnect error handling --- the last one came back clean, so don't
re-try that exact question again, but don't take one clean framing as
licence to stop varying either). Check `flyctl status` is current after any
run that changes app code. Whichever run the prompt calls this crit's last
still needs: `PROCESS.md` (a real decision record, still the literal
template with its `TEMPLATE:` comment), a first-cut `reflections/crit-8.md`
headed with this source's actual title ("It's alive!", confirmed from the
raw JSON `title` field), and the push itself (local and origin are
currently in sync, so whatever's unpushed by the finishing run is only
that run's own new commits).

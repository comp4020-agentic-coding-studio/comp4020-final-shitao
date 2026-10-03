# Process

Trace started from the brief's question --- what would make this app good ---
before it started from a stack. The first commit,
[`2828f3e`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/2828f3e),
landed the README's argument (a mark is a gesture, not a post; the wall grows
by care, not engagement) and `CLAUDE.md`'s rules in the same change as the
code, so every later session read the argument before it read the source.
Those rules are the harness: no text field, no accounts, one mark a day
enforced in `src/db.ts` rather than the client, no third-party requests,
broadcast only after persistence.

## Decision record: the stack

**Context.** One `shared-cpu-1x` Fly machine with 256 MB, one volume at
`/data`, no separate database server. The core interaction is tiny: mint a
cookie, store one SVG path per hand per day, render every path, push new ones
to open tabs.

**Decision.** A framework-free `node:http` server in TypeScript, run directly
by Node 24's type-stripping (no build step), with `node:sqlite` for
persistence at `DB_PATH` and server-sent events for the live layer. The only
runtime dependency is `marked`, for rendering `README.md` at `/readme/`.

**Alternatives I rejected.** Astro SSR with `better-sqlite3` is what I'd used
for the previous crit's booking app, and it worked. But Trace has two pages
and three routes; a framework would be most of the code, and
`better-sqlite3` is a native addon that has to compile inside the slim image,
where `node:sqlite` ships with the runtime. WebSockets lost to SSE because the
wall only ever pushes one thing one way --- a finished mark, server to browser
--- so a long-lived HTTP response is the smaller mechanism
([`f080752`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/f080752)).
An in-memory set of open connections is enough because `fly.toml` pins one
machine; that stops being true the day there are two, and that's when this
record needs a successor.

**Consequences.** Nothing hides concurrency from me. The first real bug was a
race: `hasMarkedToday` ran before `await readBody`, so a client holding its
body open could mark twice. Ordinary concurrent requests never reproduced it
--- Node drains one handler's microtasks before reading the next socket ---
and it only showed up once a test sent one request's headers, let a second
request finish, then released the first body
([`7a89c68`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/7a89c68)).
That held-open-body shape is now the regression test, because a
fire-two-and-hope test passes against the broken code.

## The client needed its own harness

Every early test drove the server over HTTP, so `public/wall.js` was only
ever checked by hand in a browser. After a browser session found a hand could
start a second stroke once its daily mark had landed
([`2e59190`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/2e59190)),
I added `spec/wall-client.test.ts`, which loads the real `wall.js` into jsdom
and dispatches real pointer events at it, stubbing only what jsdom lacks
(layout boxes, pointer capture, `EventSource`)
([`ec78095`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/ec78095)).
Each fix since has been checked the same way: the new test must fail against
the pre-fix file and pass against the fixed one. That caught the self-echo
filter matching marks by content rather than a nonce
([`672e486`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/672e486)),
a second gesture starting while the first was still posting
([`176b787`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/176b787)),
and a keyboard-only hand having no way to draw at all
([`5138836`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/5138836)).

The last change this crit came from a comment, not a test: `identity.ts`
said its hand colours were "not tuned for contrast," and nothing tuned them.
Five of ten failed WCAG's 3:1 non-text minimum against white or black; they
were retuned and `spec/contrast.test.ts` now reads the palette from source
([`de8164a`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/de8164a)).

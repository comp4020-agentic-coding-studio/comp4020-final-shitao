# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 124h to cutoff.

## State

Real-time (SSE), replay-on-reconnect ADR (`decisions/0001-...`) and the
touch fixes (`b3f939e`) are deployed: live `wall.js` matches `b3f939e`.
This run's two commits are local, awaiting the tick push (CI deploys).

## What this run did

`3224721`: `wall.js` reopens its stream from `lastId` on `visibilitychange`
to visible, closing the old one and clearing any pending 3s retry, so a
phone back from the background catches up at once instead of trusting a
socket the OS may have cut. Two jsdom tests (one fails on the old file, the
other caught by a mutation dropping close/clearTimeout). 55/55 green with
a server on :8080 (`DB_PATH=/tmp/x/trace.db PORT=8080 node src/server.ts`).
Real browser: dispatched `visibilitychange`, a curl-posted mark still
arrived live, console clean. `91b9c6e` notes it in the ADR.

## Next action

Not a finishing run unless the prompt says so. If it is: write
`reflections/crit-9.md` (raw JSON `title` is "All at once"), trim
PROCESS.md (~775 words) and give the touch and visibility fixes a line
each, push, verify live with two sessions on `.fly.dev`. If not: verify
this run's commits are live after the tick push, then try a new framing
(e.g. the 24h window expiring while a tab stays open never re-enables
drawing).

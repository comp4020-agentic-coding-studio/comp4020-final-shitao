# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 135h to cutoff.

## State

Replay-on-reconnect (ADR `decisions/0001-coming-back-after-a-gap.md`,
commits `7894d00`..`cffb448`) is on `origin/main` via the tick push and CI
has deployed it: the live page carries `data-since`.

## What this run did

Reread `public/wall.js` framed as "the pod draws on phones at once" and
fixed two touch gaps in `b3f939e`:
- `pointercancel` called `finish()`, so a touch the OS took over (edge
  swipe, notification) posted a half stroke as the day's one mark; now it's
  dropped like Escape
- no pointer tracking: a second finger restarted the gesture, orphaning
  the first stroke's path and zig-zagging both fingers into one line; now
  only the first `pointerId` draws

Two new jsdom tests, both failed before the fix. 53/53 green (needs a
server on :8080: `DB_PATH=/tmp/x/trace.db PORT=8080 node src/server.ts`).
Real-browser: a mouse drag still posts; a synthetic touch
down/move/cancel leaves no path and no post.

## Next action

Finishing run: write `reflections/crit-9.md` (title "All at once", raw JSON
`title`), trim PROCESS.md (~830 words) and give the touch fix a line,
push (CI deploys), then verify live with two sessions on `.fly.dev`.

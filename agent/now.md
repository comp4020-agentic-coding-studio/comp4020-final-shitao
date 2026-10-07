# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 117h to cutoff.

## State

Live `wall.js` matched `3224721` at the start of this run. This run's two
commits are local, waiting for the tick push (CI deploys).

## What this run did

`4ffc190`: a tab left open past a hand's 24 hours used to refuse drawing
until a reload, because the listeners were only attached if `canDraw` was
true at load. Now they're always attached. `setDrawable` toggles `canDraw`
along with the SVG's tabindex/role/label and the status text. The server
passes `data-next-mark-in`. A timer reopens drawing (and reschedules itself
if it fires early), and `visibilitychange` re-checks too. Two new jsdom
tests fail on the old file. 57/57 green with a server on :8080. Real
browser: seeded a mark 15s short of 24h, the tab reopened by itself, and a
real drag posted. `f0244d1` notes this in ADR 0001.

## Next action

Not a finishing run unless the prompt says so. If it is: write
`reflections/crit-9.md` (raw JSON `title` is "All at once"), trim
PROCESS.md (~775 words) and give the touch, visibility and reopen fixes a
line each, push, then verify live with two sessions on `.fly.dev`. If it
isn't: check this run's commits are live after the tick push, then try a
new framing, e.g. what a phone's narrow viewport does to drawing (scroll vs
draw, `touch-action`).

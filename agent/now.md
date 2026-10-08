# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 93h to cutoff.

## State

Live served `28aeb71` at the start of this run (`role="status"` present
on `.fly.dev`). This run's commit, `65d25d0`, is local and waiting for the
tick push (CI deploys). 60/60 green.

## What this run did

Framing: what a real pod's marks look like on the live wall. The largest
live mark already has 773 points, and `PATH_RE` in `server.ts` refuses
more than 2000 segments, but `wall.js` never capped a gesture. So a
scribble held for about half a minute was posted, refused ("That doesn't
look like a mark.") and lost whole. Now `addPoint` stops at 2001 points and
says once, in the live region, that the mark is as long as it goes. Jsdom
test failed before, passes after; curl confirmed 2000 segments → 201,
2001 → 400.

Also checked that Fly sets no default `hard_limit`, so a crit room full of
open SSE streams can't make the proxy stop sending traffic to the one
machine.

## Next action

Not a finishing run unless the prompt says so. If it is: write
`reflections/crit-9.md` (raw JSON `title` is "All at once"), trim
PROCESS.md (~775 words) and give the touch, visibility, reopen, landscape,
mid-gesture, live-region and stroke-cap fixes a line each, push, then
verify live with two sessions on `.fly.dev`. If it isn't: confirm
`65d25d0` is live, then try another framing. Untried: should one hand's
dense scribble be allowed to bury a third of the wall (ink budget by
length, not points)? That's a README-level choice, so record an ADR if
you change it.

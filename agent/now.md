# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 87h to cutoff.

## State

Live served `65d25d0` at the start of this run (stroke cap present on
`.fly.dev`). This run's commits, `9d4458f` and `b1b4a7d`, are local and
waiting for the tick push (CI deploys). 63/63 green.

## What this run did

Framing: what a failed post costs on crit day. `finish()` dropped the
stroke on any network error, and every push to `main` redeploys the one
machine (Fly answers 502 meanwhile). Now `postMark` keeps the stroke and
retries the same nonce on throw/502/503/504 at 1, 2, 4, 8, 16s, and stops
early if the mark's own echo shows a lost-reply post landed. Jsdom tests
(offline then 502, lost reply then 429, giving up after six) failed before
except the 429 one, which guards the fix. In a real browser: blocked
`/api/marks`, drew, unblocked, posted once; killed the server mid-stroke,
restarted, posted once and the other tab caught up. Decision record 1 now
covers the outgoing side of a gap.

## Next action

Not a finishing run unless the prompt says so. If it is: write
`reflections/crit-9.md` (raw JSON `title` is "All at once"), trim
PROCESS.md (~775 words) and give the touch, visibility, reopen, landscape,
mid-gesture, live-region, stroke-cap and held-mark fixes a line each, push,
then verify live with two sessions on `.fly.dev`. If it isn't: confirm
`b1b4a7d` is live, then try another framing. Untried: the
`"Couldn't reach the wall --- try again."` status in wall.js shows three
literal hyphens (not markdown); a 429 leaves `canDraw` true in that tab;
ink budget by length (README-level, ADR if changed).

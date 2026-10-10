# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 39h to cutoff.

## State

`origin/main` is `00e4a87`; CI on it succeeded and deployed (Fly v29), so
`73d89ed`'s failure was transient. Live `wall.js` is byte-identical to local,
and `/api/marks/stream?since=` replays correctly against the live wall (28
marks). Every crit-9 spec line is met: real-time over SSE, decision records
0001 (coming back after a gap) and 0002 (one hand's share of the wall),
PROCESS.md through crit 9. Only the reflection is outstanding.

## What this run did

Checked only; no commits. Measured the live wall for repeated identical
points in a path (a pointermove that rounds to the last point): 4% of points,
none in the longest mark, so a dedupe in `addPoint` isn't worth a change.

## Next action

On the run the prompt calls last: write `reflections/crit-9.md` (raw JSON
`title` is "All at once"; 150--300 words, breakthrough + developer you want
to be; the breakthrough candidate is "a deploy is a guaranteed network
failure for whoever is mid-stroke", which reframed the client), commit, push,
confirm CI deploys it (Actions API `conclusion`, then curl a changed asset),
verify live. Before then, don't manufacture scope: the brief is satisfied.

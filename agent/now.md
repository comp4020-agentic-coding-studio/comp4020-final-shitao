# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 52h to cutoff.

## State

Live serves the ink cap (`382da7d`, `data-max-ink="2500"` confirmed by curl).
This run's one commit, `efbafac`, is local, waiting for the tick push (CI
deploys). 66/66 green against a scratch server (`DB_PATH=/tmp/... PORT=8090
node src/server.ts`, then `APP_URL=http://localhost:8090 pnpm check`).

## What this run did

On a portrait phone the wall was 342×207 px with ~450px of empty page below
--- and phones are where the pod draws at the crit. `public/style.css` now
runs the wall to the screen's edges under `(max-width: 30rem) and
(orientation: portrait)` (390×236 at 390×844, ~30% more area), drops the side
border/radius there, and insets the focus ring so it isn't clipped. Drew a
real gesture at 390×844 on a scratch server: x=20px mapped to 51 units, as
`toViewBox` predicts; no horizontal overflow; console clean. 844×390 and
1920×1080 unchanged.

## Next action

If the prompt calls a run the last: confirm `efbafac` is live, write
`reflections/crit-9.md` (raw JSON `title` is "All at once"; 150--300 words,
breakthrough + developer you want to be), trim PROCESS.md (775 words) and give
ADR 2, the crit-9 fixes and this phone layout a line each, push, verify live
with two sessions. Otherwise: the live wall still carries the two pre-cap
floods (one covers a third of it); whether old marks over today's cap stay is
an undecided question worth an ADR 2 sentence, not a deletion.

# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 45h to cutoff.

## State

Live serves `efbafac` (portrait-phone layout), deployed by hand with
`flyctl deploy` this run: CI on `73d89ed` failed at "Build and start the app"
with no readable log (gh unauthenticated), and the same image built, ran and
passed 66/66 locally, so it looked transient. This run's commit, `0a518b1`
(PROCESS.md), is local, waiting for the tick push; that push re-runs CI.

## What this run did

- found the stale deploy via the public Actions API
  (`api.github.com/repos/.../actions/runs`), redeployed, confirmed by curl
- checked a crit-day risk: no `concurrency` block in `fly.toml`, and Fly sets
  no `hard_limit` by default; 40 open SSE streams against live plus a page
  load gave 200 in 53 ms. Not a risk, nothing to change
- brought PROCESS.md through crit 9 (redeploy-proof client, ink cap from live
  data, phone sizes) and condensed crit 8's sections; check:evidence green

## Next action

Check the next CI run on `0a518b1` succeeded (Actions API, `conclusion`); if
it failed again, it isn't transient --- reproduce with `sudo -n docker build`.
On the run the prompt calls last: write `reflections/crit-9.md` (raw JSON
`title` is "All at once"; 150--300 words, breakthrough + developer you want
to be; the breakthrough candidate is "a deploy is a guaranteed network
failure for whoever is mid-stroke", which reframed the client), push, confirm
CI deploys it, verify live with two sessions.

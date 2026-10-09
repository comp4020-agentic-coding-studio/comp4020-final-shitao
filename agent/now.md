# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 63h to cutoff.

## State

Live served `a8b3bec` at the start of this run. This run's four commits
(`c2b152b`, `66dc0b5`, `c37ffec`, `382da7d`) are local, waiting for the tick
push (CI deploys). 66/66 green.

## What this run did

Measured the live wall's 27 marks by path length: most a few hundred
viewBox units, longest ordinary one ~1,700, and two floods (6,100, and a
774-point scribble at 34,600 covering a third of the wall). One mark a day
didn't stop one hand flooding. Added an ink cap: `src/ink.ts` (`MAX_INK`
2,500, `inkLength`), server 400s over it, `pages.ts` passes it as
`data-max-ink`, `wall.js` stops the stroke there (spent for good, says so
once, lifting still posts). Old specs' `M${Date.now() % 100_000}` x coords
blew the cap, so they're now `M1.${...}`. New client test fails against the
old `wall.js`. Browser-checked at 390×844 on a scratch server. Recorded as
`decisions/0002-one-hands-share-of-the-wall.md`; README lists it as enforced
and ends with a short section pointing at ADR 2.

`agent-browser`'s mise shim now errors "No version is set"; call
`/home/ben/.local/share/mise/installs/npm-agent-browser/0.38.2/node_modules/.bin/agent-browser`
directly.

## Next action

Confirm the four commits went live (`curl` the page for `data-max-ink`).
If the prompt calls a run the last: write `reflections/crit-9.md` (raw JSON
`title` is "All at once"), trim PROCESS.md (~775 words) and give it ADR 2 and
the crit-9 fixes a line each, push, verify live with two sessions. Otherwise,
untried: the small portrait wall (344×207, ~450px empty below) as a README
sentence or a narrow-screen padding tweak.

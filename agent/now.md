# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 100h to cutoff. Deepening.**

## State

At start, `origin/main` was `59d69f9`: CI green, live 200, Fly v64. Local
`main` is one commit ahead (`9587287`), which I didn't push; the tick
snapshot carries it. Tree clean. `pnpm check` passes 85/85 against a scratch
app (`APP_URL=http://localhost:8091`), and `check:evidence` is green.
README is 599 words, PROCESS 1099, both at their ceilings, so any addition
needs a cut.

## What this run did

Took the hand-off's untried angle: two hands drawing at the same moment in
real browsers (sessions `ca`/`cb`, scratch DB). A held its stroke while B
posted a whole mark. B's mark appeared in A mid-gesture, underneath A's
stroke. A's stroke then posted whole. Both tabs ended correct at 1280 wide
and 390×844, with no errors. No bug found.
`9587287` pins it in `spec/wall-client.test.ts`. I planted a bug that
appended arrivals on top: the test went red, then I restored the file.

## Next action

Confirm CI is green for the tick that carries `9587287`, and that live is
on the new release. Untried angles: a slow connection (the brief's top
band), with the `agent-browser network route` abort combinations on live
assets; and a fresh cold read of README → CLAUDE.md → spec/ as the marker
does, looking for one idea in all three. On the final run, verify live at
both viewports with two separate sessions, `/readme/` included. No
reflection.

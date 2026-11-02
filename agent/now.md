# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 165h to cutoff. Deepening.**

## State

Local `main` is five commits ahead of `origin/main` (tip `990b25e`, live and
CI-green). Not pushed. The tree is clean. `pnpm check` 76/76,
`check:evidence` green. Live still serves the crit-10 version.

## What this run did

Read the assessment brief against the repo. It has bars the crits didn't:
README 400–600 words (it was 1,680), PROCESS 900–1100 and rewritten, with a
case for the stack *and* the agent workflow (it was 668, stack only).

- `4a0545f` decisions/0004: the stack as its own ADR (options, costs)
- `e5b44a7`/`33190ab` README rewritten to ~600 words: a one-sentence
  definition of good, Sloan + Balkan, and r/place (Reddit's engineering
  post + Wikipedia) as the alternative argued against; enforced/judged
  list kept, detail moved to `decisions/`
- `977a635` PROCESS rewritten to ~1,030 words with a "The workflow" section
- `8f532d1` `/readme/` now links to the wall (markers start there with only
  the URL); new spec test fails without it
- Two-session browser pass locally at 390×844 + 1920×1080: mark drawn in
  one appeared in the other with no reload, no console errors

## Next action

Have a cold reader (subagent, sonnet) read README → CLAUDE.md → spec/ → app
the way the brief's "Response to the brief" marker does, looking for the
same idea in each; CLAUDE.md doesn't yet mention the no-overwrite/no-undo
rule the README now leads with. On the final run: push, watch CI deploy,
verify live at both viewports, `/readme/` included. No reflection (an
assessment has none). COMP4020 only: no research note.

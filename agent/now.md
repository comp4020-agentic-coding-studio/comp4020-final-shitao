# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 159h to cutoff. Deepening.**

## State

Local `main` is eight commits ahead of `origin/main` (tip `990b25e`, live and
CI-green). Not pushed. The tree is clean. `pnpm check` 78/78 (against a
local app on :8080 with a scratch `DB_PATH`), `check:evidence` green. Live
still serves the crit-10 version. README 592 words.

## What this run did

Closed the gap the last hand-off named: README leads with "no mark is ever
replaced or removed" (the stand against r/place), but CLAUDE.md and spec/
never said it.

- `95a23ac` CLAUDE.md rule (never replaced, edited or removed, no
  `UPDATE`/`DELETE` on `marks`); two `spec/wall.test.ts` checks: the
  drawing hand's own DELETE/PUT/PATCH on `/api/marks[/id]` all fail and
  the mark survives; no `src/` file has SQL that deletes or rewrites
  `marks` (confirmed it fails on a planted `DELETE FROM marks`)
- `6939a0e` README's enforced list names that check; trimmed to stay
  under 600

## Next action

PROCESS.md doesn't yet mention the no-removal rule landing in the harness;
weigh whether it earns a sentence (PROCESS is ~1,030 words). Then a cold
reader (subagent, sonnet) reading README → CLAUDE.md → spec/ → app as the
"Response to the brief" marker does. On the final run: push, watch CI
deploy, verify live at both viewports, `/readme/` included. No reflection
(an assessment has none). COMP4020 only: no research note.

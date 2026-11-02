# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 148h to cutoff. Deepening.**

## State

Local `main` is three commits ahead of `origin/main` (`a45bf0f`, live and
CI-green). Not pushed. The tree is clean. `pnpm check` 78/78 (against a
local app on :8080 with a scratch `DB_PATH`), `check:evidence` green. README
599 words, PROCESS 1,054.

## What this run did

A cold marker read (sonnet subagent) of README → CLAUDE.md → spec/ → code
found these:

- `e197162` PROCESS cites `95a23ac`: the no-removal rule reached CLAUDE.md and spec/
- `96cc6c8` the "within a second" broadcast test only failed after its 3s
  timeout. It now asserts under 1,000 ms. A planted 1.2s delay made it fail
  at 1,220 ms.
- `cbf27a2` README's enforced list no longer says every check runs "even
  from a bare `curl`". Client checks run the real `wall.js`. The judged
  paragraph now says what each judgement found, not just the method.

Left alone from the same read:

- CLAUDE.md rules with no test: no accounts, `DB_PATH`, broadcast-after-persist
  ordering, and "every route logs"
- README's keyboard and contrast claims have no CLAUDE.md rule
- `placeholder/` is tracked but unexplained

## Next action

Decide whether keyboard drawing and the 3:1 palette contrast become
CLAUDE.md rules. README calls both enforced, and the harness is marked on
the three agreeing. Keep it to one line each. On the final run: push, watch
CI deploy, and verify live at both viewports, `/readme/` included. No
reflection (it's an assessment). No research note (COMP4020 only).

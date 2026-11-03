# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 141h to cutoff. Deepening.**

## State

`origin/main` is `477ca61`, live and CI-green. Local `main` is two commits
ahead, not pushed, and the tree is clean. `pnpm check` 78/78 (against a local
app on :8080 with a scratch `DB_PATH`), `check:evidence` green.

## What this run did

- `728a421` CLAUDE.md now has rules for keyboard drawing and the 3:1 hand
  contrast, each pointing at its spec file. README already listed both as
  enforced, so README, CLAUDE.md and spec/ now agree on them.
- `10672cb` removed `placeholder/`, the template's first page. Nothing serves
  or copies it; dropped the one spec comment that mentioned it.

## Still open from the cold marker read

CLAUDE.md rules with no test: no accounts, `DB_PATH`, broadcast-after-persist
ordering, every route logs. README's judged paragraph could say these are
rules held by review, not checks.

## Next action

Decide whether to test broadcast-after-persist (e.g. a stream client
receiving a mark, then a fresh GET showing it) or name the untested rules as
judged in README. PROCESS could cite `728a421` as harness catching up with
README. On the final run: push, watch CI deploy, verify live at both
viewports, `/readme/` included. No reflection, no research note.

# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 135h to cutoff. Deepening.**

## State

`origin/main` is `a311058`, live (200) and CI-green. Local `main` is four
commits ahead, not pushed, and the tree is clean. `pnpm check` 79/79 (against
a local app on :8080 with a scratch `DB_PATH`), `check:evidence` green.
README is exactly 600 words, PROCESS 1054.

## What this run did

- `fef399e` new spec: a fresh `GET /` already shows any mark the stream
  announces. To prove it catches a breach, I planted broadcast-then-persist
  with 100ms between them: it failed, along with two replay tests. Then I
  restored the code.
- `6aa8bf1` CLAUDE.md's persist-first rule and README's enforced list now
  point at that check.

## Still open

CLAUDE.md rules with no test: no accounts, `DB_PATH`, every route logs.
README is at its 600-word ceiling, so naming those rules as "held by review"
would mean cutting something else.

## Next action

PROCESS could cite `728a421`/`6aa8bf1` as the harness catching up with
README, keeping within 1100 words. On the final run: push, watch CI deploy,
verify live at both viewports, `/readme/` included. No reflection.

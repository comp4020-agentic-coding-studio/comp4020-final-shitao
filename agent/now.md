# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 117h to cutoff. Deepening.**

## State

`origin/main` was `a95bfba` at the start of this run (CI green, live 200,
Fly v62). Local `main` is three commits ahead, not pushed by me (the tick
snapshot will carry them), tree clean. `pnpm check` 83/83 against a scratch
local app on :8080, `check:evidence` green (30 citations). README 600 words,
PROCESS 1088.

## What this run did

- `2472a42` two new `spec/wall.test.ts` checks: the Dockerfile's `DB_PATH`
  sits under `fly.toml`'s mount and only `src/db.ts` opens storage; the
  server's route list is pinned and neither `/` nor `/readme/` serves a
  form. Planted a `/login` route and a `DB_PATH` off the volume: both red,
  then restored.
- `985f406` CLAUDE.md points both rules at those checks, and corrects its
  claim that `/data/trace.db` is the default (it's the Dockerfile's `ENV`;
  `src/db.ts` falls back to `./data/`).
- PROCESS's rule-audit sentence cites `2472a42`.

Every CLAUDE.md rule now has a check except "fix the check or the harness
too", which is a process rule.

## Next action

After the tick pushes these, confirm CI went green and live caught up
(Actions API, `flyctl releases`). On the final run: verify live at both
viewports with two separate sessions, `/readme/` included. No reflection.

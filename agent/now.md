# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 124h to cutoff. Deepening.**

## State

`origin/main` was `7507178` at the start of this run (CI green, live 200).
Local `main` is three commits ahead, not pushed by me (the tick snapshot
will carry them), tree clean. `pnpm check` 81/81 against a scratch local
app on :8080, `check:evidence` green (29 citations). README 600 words,
PROCESS 1074.

## What this run did

- `5c13687` `formatEvent` now writes any UUID (a hand id is its cookie) as
  `uuid`; `spec/log.test.ts` checks that, and that every answer
  `POST /api/marks` gives calls `logEvent` first, with no bare
  `console.log` in `server.ts` but the startup line. Planted a dropped
  refusal log and a bare `console.log`: both went red, then restored.
- `f31860e` CLAUDE.md's logging rule points at those checks.
- `6b087c5` PROCESS cites `728a421`/`6aa8bf1`/`5c13687` as the rule audit.

## Still open

CLAUDE.md rules still held only by review: no accounts, `DB_PATH`.

## Next action

After the tick pushes these, confirm CI went green and the live app picked
them up (Actions API, `flyctl releases`). On the final run: verify live at
both viewports with two separate sessions, `/readme/` included. No
reflection.

# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 111h to cutoff. Deepening.**

## State

`origin/main` was `848ce4a` at the start (CI green, live 200, Fly v63
carrying the previous run's commits). Local `main` is three commits ahead,
not pushed by me (the tick snapshot carries them), tree clean. `pnpm check`
84/84 against a scratch app on :8080, `check:evidence` green (31
citations). README 599 words, PROCESS 1099.

## What this run did

Framing: the brief's showcase, a room full of people at once.

- Load-tested live: 30, then 100, concurrent `curl -sN` streams on
  `/api/marks/stream` all connected and `/` still answered in ~40ms. Fly's
  default concurrency limit didn't bite, so `fly.toml` is unchanged.
- `878b3f3` a `spec/wall.test.ts` check that one mark reaches 40 open
  streams within a second. Planted a broadcast to only the first 10
  clients: it went red, then I restored it.
- `d782d4e` README's enforced list mentions forty tabs. `bd76607` PROCESS
  cites it.

## Next action

Confirm CI is green for the pushed tick and live is on the new release
(Actions API, `flyctl releases`). Untried angle: several hands drawing *at
the same moment* in a real browser (two sessions mid-gesture as each
other's mark arrives). On the final run, verify live at both viewports with
two separate sessions, `/readme/` included. No reflection.

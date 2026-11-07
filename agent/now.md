# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 28h to cutoff. Deepening; next run is likely the last.**

## State

`origin/main` is `801a62a` (CI green; it carries `e22faca`). Live returns 200
and serves 38 marks; `/readme/` opens with a link to the wall. Local `main`
has one unpushed commit, `2a996fd` (decisions only), which the tick will
carry. `pnpm check` 92/92 against a scratch server on :8093, which has been
stopped. README 599 words, PROCESS 1,098.

## What this run did

Reread the brief's marking section, then delegated a check of all four ADRs
against the current code. Two figures had drifted: 0002 said the portrait
phone wall is 344 px (since `efbafac` it runs full-bleed, so 390 px and about
975 px of ink), and 0004 said "three routes" (two pages and two API routes).
Both fixed in `2a996fd`. Everything else in the ADRs, including every
"How it's checked" claim, matched the source.

## Next action

Final run: confirm CI is green on the tick carrying `2a996fd` and live
returns 200, then start nothing new. No reflection is due.

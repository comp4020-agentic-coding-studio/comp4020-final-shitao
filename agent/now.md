# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 52h to cutoff at start,
fourteenth run of this crit's window.** Plan/build/deepen run, not the last.

## What this run did

Read the README literally as a pod member would. "A hand can't draw a second
mark before a day has passed" / UI "Come back tomorrow" were false: the limit
was the UTC calendar day, which reopens at 11am in Canberra (mark twice 30 min
apart across it; refused "tomorrow" morning). Fixed:

- `79989b6` `db.ts` `msUntilNextMark` (rolling 24h since last mark, replaces
  `hasMarkedToday`); wall and 429 say "You can add another in about N
  hours"; new `spec/day.test.ts` drives `db.ts` directly against a scratch
  `DB_PATH` with an injected clock (42/42 green)
- `7e58da7` README enforced-list wording + CLAUDE.md harness rule
- `39571cc` PROCESS.md sentence citing it (now ~660 words; trim on final run)

Browser-checked locally (draw → status → reload), console clean. Deployed and
verified live: fresh hand draws (201), second POST 429 with the new wording,
`/readme/` updated. Left one more tiny scratch mark at the wall's top-left.
Unpushed local commits are correct under the push gate.

## Next action

On the run the prompt calls last: write `reflections/crit-8.md` headed
"It's alive!", 150--300 words, both prompts (breakthrough candidate: reading
the spec/README literally caught two gaps 12 green runs missed; or the jsdom
harness for `wall.js`); trim PROCESS.md toward 600; `pnpm check` (start the
app on :8080 with a scratch `DB_PATH`; read the `Tests` line, not the pipe's
exit) + `check:evidence`; push; deploy; verify live. Before then, untried
framing: the wall at many marks (density/legibility at both viewports).

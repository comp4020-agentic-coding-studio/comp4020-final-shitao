# now

**`comp4020-final-shitao`, crit-10 ("Fly by instruments") --- sixth run,
124h to cutoff. Nothing pushed (push waits for the inside-24h finishing
run).**

## State

Local `main` is `da910b4`, working tree clean, 75/75 green. Live is Fly v42,
deployed by hand from `72a0398` (code identical to `da910b4`), serving 200.
`origin/main` is `74f4d89`; last three CI runs green.

## What this run did

Read the spec line "the logging outlives the crit" literally. `flyctl logs
--no-tail` returned ~100 lines, all machine restarts plus one monitor view:
every hand action from the last rehearsal was already gone. Now `logEvent`
also writes each line to a capped `events` table on the volume
(`bdf17ab`), read with
`flyctl ssh console -a comp4020-final-shitao -C "node src/events.ts 200 [filter]"`.
Confirmed live. Decision record 3, README, CLAUDE.md and PROCESS updated.

## Next action

Final run: write `reflections/crit-10.md` titled "Fly by instruments"
(breakthrough: rehearsing the crit literally --- hex vs colour words, the
monitor's phantom hands, then finding the logs didn't outlive a night),
push, confirm CI deploys and live serves it. At the crit, narrate with
`mise exec -- flyctl logs -a comp4020-final-shitao` tailing.

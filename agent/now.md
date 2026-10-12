# now

**`comp4020-final-shitao`, crit-10 ("Fly by instruments") --- second run,
159h to cutoff. Nothing pushed (push waits for the inside-24h finishing
run).**

## State

Local `main` is `bea8bab`, eight commits ahead of `origin/main` (`028c2bd`).
Live Fly deployed by hand from `1d1d73d` (same code as `bea8bab`; only
PROCESS changed after). `pnpm check` 72/72, `check:evidence` green. Working
tree clean.

## What this run did

Rehearsed the crit literally: two fresh `agent-browser` sessions, narrated
only from the log. Finding: `colour=#4e8067` can't be pointed at on a wall.
`mark.add` now logs `colour=<word>` (`COLOUR_WORDS` in `src/identity.ts`) and
`at=<ninth of wall>` (`placeOf` in `src/log.ts`), with tests. On live, the
rehearsal gave both hands orange; only `at=` told them apart --- now cited in
PROCESS.md's new crit-10 section and decisions/0003.

## Next action

PROCESS.md is 754 words (400--600 guidance, not enforced): trim on a later
run. Open candidate: an hourly cookieless visitor (likely an uptime monitor)
mints a new hand on every `GET /` (296 hands, 32 marks); `hand.new` noise at
the crit and junk rows. Consider minting the hand lazily (only on POST, or
only when the page's stream opens), checking `mine` and the 24h rule still
hold. Final run: `reflections/crit-10.md` titled "Fly by instruments"
(breakthrough: rehearsing the crit literally, hex vs colour words), push,
confirm CI deploy.

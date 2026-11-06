# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 63h to cutoff. Deepening.**

## State

`origin/main` is `107f681` (CI green, live v69 current). Local `main` has
three unpushed commits the tick snapshot will carry: `b5a02b0` (spec),
`6b22cb9` (CLAUDE.md), `691395d` (PROCESS citation). Tree clean. `pnpm check`
92/92 against a scratch app (`APP_URL=http://localhost:8091`),
`check:evidence` green. README 598 words, PROCESS 1,099: both at their
ceilings.

## What this run did

A delegated "marker walks README → CLAUDE.md → spec/" read found three
README claims with no check, or only a weak one. Each now has a check that
fails on a planted breach:
- "no third-party request" only covered `script[src]`/stylesheets on `/`.
  It now covers both pages, everything the browser fetches, CSS `url()`/
  `@import`, and wall.js's fetch/EventSource targets
- `/` serving `data-max-ink` from `MAX_INK` was untested
- the landscape-phone scroll-swipe fix (svh width cap, `touch-action` only
  on `#wall[tabindex]`) was cited in the README as "became a check" but had
  no check

CLAUDE.md now matches the wider third-party rule. It also notes that a
palette change can't recolour stored marks.

Rejected two of the read's findings: "never before it's stored" (the event
needs `mark.id`, so the order is forced by construction), and a restart test
(DB_PATH/volume test is the guard).

## Next action

Confirm CI passes on the tick that carries these three commits. A remaining
unclaimed credit: the README doesn't say the no-text/no-accounts choices,
logging, and hold-and-retry are checked; there's no room without cuts. On the
final run, verify live at both viewports, `/readme/` included. No reflection.

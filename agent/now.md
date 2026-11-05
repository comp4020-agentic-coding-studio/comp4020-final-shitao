# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 87h to cutoff. Deepening.**

## State

At start, `origin/main` was `8642ba1`: CI green, live serving the
"Getting the wall ready" page. Local `main` is three commits ahead
(`44f559a`, `149f969`, `9d0043a`), not pushed; the tick snapshot carries them.
Tree clean. `pnpm check` passes 89/89 against a scratch app
(`APP_URL=http://localhost:8091`), and `check:evidence` is green. README is 600
words, PROCESS 1098: both at their ceilings.

## What this run did

A delegated cold read of README → CLAUDE.md → spec/, building a claim-to-rule-to-test
table. It found two README claims with no real check: "your own marks draw
thicker" (only the `mine` class was tested, not the CSS) and "nobody can find
out who drew which mark" (nothing checked that pages and streams carry no hand
id or name, and the server log does name hands). `44f559a` added both tests,
each shown to fail on a planted breach, plus a CLAUDE.md rule with an
allow-list of mark-event fields. `149f969` scoped the README claim to visitors
("only the server's log knows") and folded the judged paragraph. `9d0043a`
cites it in PROCESS.

Leftovers from the same read, judged minor: contrast is tested against pure
`#000`, not Chrome's dark Canvas (~`#121212`); "marks fill in quietly" has
no check; the log rule and hold-and-retry aren't in README's enforced list.

## Next action

Confirm CI is green on the tick that carries `44f559a`. Then try a fresh
framing: two real browser sessions on live at once, one at each marking
viewport, read as the marker's "multi-user/real-time/persists" script.
On the final run, verify live at both viewports, `/readme/` included. No
reflection.

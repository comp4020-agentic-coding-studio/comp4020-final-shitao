# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 93h to cutoff. Deepening.**

## State

At start, `origin/main` was `666ede8`: CI green, live 200, Fly v65. Local
`main` is two commits ahead (`6b5c003`, then a PROCESS commit), not pushed;
the tick snapshot carries them. Tree clean. `pnpm check` passes 87/87 against
a scratch app (`APP_URL=http://localhost:8091`), and `check:evidence` is
green. README is 599 words, PROCESS 1100: both at their ceilings, so anything
added needs a matching cut.

## What this run did

Tested the slow-connection angle from the brief's top band. I put a Node TCP
proxy (`/tmp/slow/proxy.mjs`) that delays every chunk 1.5s in front of a
scratch server. A mark drawn through it posted, and its status stayed
accurate. A second, direct session saw the mark arrive. Then I blocked
`wall.js` with `agent-browser network route --abort` and found a real gap:
the served page said "Draw one mark…" and the wall had `tabindex="0"` and
`touch-action: none`, but nothing could take a mark. Fixed in `6b5c003`. The
server now serves the wall as a picture ("Getting the wall ready…"), and
`wall.js` makes it drawable when it runs. There's a new server check and a
client check, plus a CLAUDE.md rule. I verified the keyboard path at 1280
wide and the pointer path at 390×844 in a real browser.

## Next action

Confirm CI is green for the tick that carries `6b5c003`, and that live serves
"Getting the wall ready" in the raw HTML (`curl -s .../ | grep ready`).
Untried: a cold read of README → CLAUDE.md → spec/ as the marker reads them,
looking for one idea running through all three. On the final run, verify
live at both viewports with two separate sessions, `/readme/` included. No
reflection.

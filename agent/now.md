# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 69h to cutoff. Deepening.**

## State

`origin/main` is `e1f7a25` (CI green; live serves the new `--ground`
`style.css`, and dark mode on live paints `#000` with every mark legible).
Local `main` has three unpushed commits the tick snapshot will carry:
`b634d25` (spec), `88a11f1` (README), and the PROCESS citation after them. Tree
clean. `pnpm check` 90/90 against a scratch app
(`APP_URL=http://localhost:8091`), `check:evidence` green. README 598 words,
PROCESS 1,100: both at their ceilings, so any addition needs a trim first.

## What this run did

Closed "marks fill in quietly has no check". The new `wall-client` test
emits five other-hand marks and asserts the status live region, the
`document.title` and the body's children stay unchanged and no stroke gets
a class. A planted `document.title = '(1) new'` fails it. README's enforced
list now says marks arrive "unannounced", and PROCESS's README-to-check
sentence cites `b634d25`.

## Next action

Confirm CI passes on the tick that carries these three commits. Still not
in README's enforced list: the logging rule and hold-and-retry, and there's
no room without cutting words. Try a cold read of README → CLAUDE.md →
spec agreement with a fresh framing, e.g. "a marker checking the three
places agree". On the final run, verify live at both viewports, `/readme/`
included. No reflection.

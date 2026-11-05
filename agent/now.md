# now

**`comp4020-final-shitao`, Final Project (assessment, due 2026-11-09 12:00),
run at 76h to cutoff. Deepening.**

## State

`origin/main` is `ae1bbb0` (CI green, live current to it). Local `main` has one
unpushed commit, `7954181`, which the tick snapshot will carry. Tree clean.
`pnpm check` 89/89 against a scratch app (`APP_URL=http://localhost:8091`).
README 600 words, PROCESS 1,098: both at their ceilings.

## What this run did

Ran the marker's script live: two sessions, 1920×1080 and 390×844. A desktop
mark reached the phone in about 120 ms with no reload; a phone mark reached
the desktop; after a reload each saw only its own mark as `mine`; `/readme/`
rendered at both sizes; no console errors.

Then closed last run's leftover. Chrome's dark Canvas is `#121212`, not the
`#000` the contrast test assumed, and plum `#6d597a` came out at 2.998:1
against it (Firefox's `#1c1b22` was worse). `7954181` makes the page paint its
own `--ground: light-dark(#fff, #000)`, gives the halo the same ground, and
has `spec/contrast.test.ts` read the ground from `style.css`. Planting
`#121212` fails plum; the real ground passes.

## Next action

Confirm CI passes on the tick carrying `7954181` and that live serves the new
`style.css` (`curl .../style.css | grep ground`), and check live in dark mode.
Not yet covered: "marks fill in quietly" has no check, and the log rule and
hold-and-retry aren't in README's enforced list. On the final run, verify live
at both viewports, `/readme/` included. No reflection.

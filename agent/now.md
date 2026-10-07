# now

**`comp4020-final-shitao`, crit-9 ("All at once") --- built, live, mid-week.**
Run at 111h to cutoff.

## State

Live matched local `main` (`4ffc190`) at the start of this run. This run's
one commit, `54361a5`, is local and waiting for the tick push (CI deploys).

## What this run did

The phone framing. On a landscape phone (844×390) the full-width wall was
444px tall, its bottom and the status line loaded below the fold, and the
wall covered most of the screen's width, so a swipe to scroll down posted a
mark the hand couldn't take back for 24h. `style.css` now caps the wall's
width at `(100svh - 2rem) * 5/3` (still 5:3, so `toViewBox` stays exact),
centres it, and only applies `touch-action: none`/crosshair to
`#wall[tabindex]`, so a hand that has already marked scrolls and
pinch-zooms over it. Checked in a real browser: 599×360 at 844×390,
unchanged at 390×844 and desktop, a drag still maps to the right viewBox
point, and `touch-action` goes back to `auto` after the mark. 57/57 green.

## Next action

Not a finishing run unless the prompt says so. If it is: write
`reflections/crit-9.md` (raw JSON `title` is "All at once"), trim
PROCESS.md (~775 words) and give the touch, visibility, reopen and
landscape fixes a line each, push, then verify live with two sessions on
`.fly.dev`. If it isn't: confirm `54361a5` is live, then try another new
framing, e.g. what a pod of four sees when they all draw within the same
second (status text and halo ordering across tabs).

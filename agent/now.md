# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 75h to cutoff at start,
eleventh run of this crit's window.** Job was plan/build/deepen, not finish
--- the prompt didn't call this the last run.

## What this run did

Took stock: clean tree, local `main` matched `origin/main` (`c09556b`),
`flyctl status` showed version 9 (`3ceb76c`, the keyboard-access work) still
live, stopped (normal auto-sleep).

Followed up on the one untried accessibility angle the previous hand-off
named: WCAG contrast of `src/identity.ts`'s ten-colour hand palette (its own
comment admitted it was "not tuned for contrast against any one background
--- the wall itself decides that," but nothing ever did). Computed WCAG
contrast ratios for all ten against both white and near-black (the two
backgrounds `color-scheme: light dark` can actually resolve to, since the
`#wall` SVG has no explicit background of its own --- it shows the page's).
Five colours failed or nearly failed the 3:1 non-text-contrast minimum
(WCAG 1.4.11, the right criterion for a drawn stroke, not text) against
white: `#f2cc8f` (1.52:1), `#f4a261` (2.06:1), `#81b29a` (2.4:1), `#e07a5f`
(2.95:1), `#3d5a80` (2.97:1 against black). Confirmed live before touching
code: screenshotted a scratch wall with all ten original colours drawn as
swatches under `agent-browser set media light`/`dark` --- several were
genuinely hard to make out against white.

Fixed by lightness-adjusting (hue/saturation kept via HSL) just the five
failing colours so each clears 3:1 against *both* backgrounds with margin
(~4.58:1 each) --- found the adjusted values with a small per-colour
lightness search, didn't touch the five that already passed. Also swapped
the `#wall:focus-visible` outline colour (the old `#3d5a80`, which failed
2.97:1 against black) to the new tuned `#5177aa`. Added
`spec/contrast.test.ts`: reads `COLOURS` straight out of `identity.ts` via
regex rather than a hardcoded copy (same pattern as the standing
`spec/contrast.test.ts` precedent from a different repo in `MEMORY.md`), so
a future palette edit can't silently reintroduce a near-invisible colour.
38/38 green against a scratch server (`PORT`/`DB_PATH` pointed at
`/tmp/trace-scratch`), typecheck clean. Re-screenshotted all ten *new*
colours as swatches under both light and dark media emulation in
`agent-browser` --- all read clearly against both now. Closed the browser
session and killed the scratch server, confirmed the port free afterward.

Committed as two scoped commits (`de8164a` the palette+CSS+test fix,
`88fb744` the README note). Real app-code change, so redeployed per
doctrine's "redeploy whenever the live app should catch up with your
commits" --- `flyctl deploy --remote-only --ha=false -a
comp4020-final-shitao`, then confirmed via a direct `curl` (not just the
deploy log) that the live page's `data-hand-colour` attribute is already one
of the new tuned values.

## Next action

Normal cadence continues: reread README fresh each run, cold-read
`src`/`public` again with yet another varied framing (tried so far across
this crit's runs: resource lifecycle/client-state, self-echo
content-vs-token, overlapping-gesture nonce clobber, SSE abrupt-disconnect
error handling, keyboard accessibility, and now colour contrast --- all came
back with either a real fix or a confirmed-clean result; don't re-try any of
these exact questions, but keep varying). Check `flyctl status -a
comp4020-final-shitao` early next run to confirm it's still caught up (should
show the image from this run's deploy). Whichever run the prompt calls this
crit's last still needs: `PROCESS.md` (still the literal template,
deliberately untouched so far --- it's a finishing-step item, not a
build-phase one), a first-cut `reflections/crit-8.md` headed with this
source's actual title ("It's alive!", confirmed again this run from the raw
JSON `title` field), and the push itself (local and origin are currently in
sync at `c09556b`+this run's two commits unpushed, so whatever's unpushed by
the finishing run is only the accumulated backlog from runs since the last
push).

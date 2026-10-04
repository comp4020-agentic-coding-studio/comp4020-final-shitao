# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 45h to cutoff at start,
fifteenth run of this crit's window.** Plan/build/deepen run, not the last.

## What this run did

Tried the untried framing: the wall at heavy density. Seeded a scratch
`DB_PATH` with 300 marks and opened it as one of their hands --- the
"thicker stroke" was unfindable, buried under ~200 later marks in a shared
colour. Fixed:

- `a9d92f3` `pages.ts` paints a hand's own marks last, each over a `.halo`
  path (`stroke: Canvas`, so it follows light/dark); `wall.js` gives the
  live stroke a halo too (`dropLive()` removes both) and inserts other
  hands' SSE echoes *before* the first `.halo, .mine`. Specs: client tests
  count `path:not(.halo)`; Escape test asserts zero paths incl. halo; new
  ordering assertions in both spec files, confirmed failing on pre-fix code
- `6f3a767` README paragraph on finding your own mark

42/42 green. Browser-checked dense wall at 1920x1080 light and 390x844 dark,
a real pointer gesture on the dense wall, reload; console clean. Deployed;
live serves the new CSS and `/readme/`. Unpushed local commits are correct
under the push gate.

## Next action

On the run the prompt calls last: write `reflections/crit-8.md` headed
"It's alive!", 150--300 words, both prompts (breakthrough candidate: reading
the spec line "find their trace" literally caught three gaps --- shared
colours, UTC day, density burial --- that green runs missed); add a PROCESS.md
sentence for `a9d92f3` while trimming it toward 600 words; `pnpm check` (app
on :8080 with a scratch `DB_PATH`; read the `Tests` line) + `check:evidence`;
push; deploy; verify live. Minor known gap if a run before then wants it: the
footer's "Your mark is the thicker stroke" hint only appears after reload,
not right after a first live mark.

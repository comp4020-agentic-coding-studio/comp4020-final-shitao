# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 62h to cutoff at start,
thirteenth run of this crit's window.** Plan/build/deepen run, not the last.

## What this run did

New framing: read each spec line literally against the app. "A stranger can
... find their trace still there when they come back" was only ever tested
as "the mark persists" --- but ten colours are shared across all hands, so a
returning hand couldn't tell which stroke was theirs. Fixed:

- `c6183e5` stale `server.ts` comment (said echo matched by path; named a
  `min_machines_running` reason that isn't the real one)
- `6e07998` a hand's own marks render with `class="mine"` (thicker stroke),
  server-side only, no hand id ever sent to the page; footer says "Your mark
  is / N marks are the thicker stroke(s)"; live gesture in `wall.js` gets the
  class too. New `spec/wall.test.ts` test, A/B-checked (fails against old
  server). Its path is made unique per run because the app under test keeps
  its DB between runs.
- `3492268` README paragraph on it, and dropped "until this run" agent-
  narration from the keyboard paragraph
- `97c71c2` PROCESS.md paragraph citing `6e07998` (now ~627 words; trim
  toward 600 on the final run)

Deployed (v11) and verified live: CSS rule, `/readme/` paragraph, and a
scratch hand's POST came back as `class="mine"` (left one small test mark at
the wall's top-left). Browser-checked at 390×844 locally, console clean.
Unpushed local commits are correct under the push gate.

Known small gap, deliberately left: a *second tab of the same hand* draws the
first tab's mark via SSE echo without `mine` until reload (the broadcast
carries no hand id, by design).

## Next action

On the run the prompt calls last: write `reflections/crit-8.md` headed
"It's alive!", 150--300 words, both prompts (breakthrough candidates: the
jsdom harness for `wall.js`, the held-open-body race test, or reading the
spec line literally); trim PROCESS.md; `pnpm check` (needs the app running
on :8080 --- start it with a scratch `DB_PATH`) + `check:evidence`; push;
deploy; verify live. Before then, untried framings: the README read cold as
a pod member deciding whether the app lives up to it; the wall at many marks
(density/legibility).

# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 164h to cutoff at start,
first run of the final project.** Job was plan/build/deepen, not finish.

## What this run did

Read the crit-8 brief (ship a first working slice on Fly, doing the app's
core thing for a stranger, with a persistent trace) and the final-project
brief (eventual app: multi-user, real-time ~1s, persistent across restarts,
README/CLAUDE.md/spec arguing and enforcing one coherent "good"). No starter
app existed yet --- this is the first build.

Built **Trace**: a shared wall where a hand (anonymous, cookie-identified,
no accounts) draws one SVG stroke per UTC day, and it never resets. Stack
chosen and justified: plain `node:http` (no framework), `node:sqlite`'s
`DatabaseSync` for persistence at `DB_PATH` (matching `fly.toml`'s volume),
vanilla JS pointer-capture for the drawing gesture, `marked` for rendering
`README.md` at `/readme/`. TypeScript runs directly via Node 24's native
type-stripping --- no build step, single-stage Dockerfile.

Wrote `README.md` (the crit's real material: a first version of what "good"
means here, grounded in Robin Sloan's "An app can be a home-cooked meal" and
Aral Balkan's "What is the Small Web?", both fetched and confirmed before
citing) and `CLAUDE.md` (rules that hold the code to that argument: a mark
is a path never text, no accounts ever, the rate limit enforced server-side
not client-side, no third-party requests, persistence only at `DB_PATH`).
Added `spec/wall.test.ts` (5 tests: hand-cookie minting, mark persists
across a fresh request, second mark same day refused, non-path input
rejected, no third-party script/stylesheet) alongside the course's fixed
`spec/invariants.test.ts` --- 7/7 green.

Committed locally (`2828f3e`, 14 files) --- **not pushed**, correctly gated
to the finishing run per doctrine (164h remained). Deployed to Fly
(`flyctl deploy --remote-only --ha=false -a comp4020-final-shitao`): this
step is *not* gated by the push rule, and this was the first deploy for
this repo (previously nothing was running). Verified the live URL
end-to-end, not just the deploy command's own success: `curl` 200 on `/`,
`/readme/`, `/style.css`, `/wall.js`; a real `agent-browser` pass drove an
actual pointer-drag gesture against the live `.fly.dev` wall (not just a
DOM/API check), confirmed the mark persisted through a page reload, and
confirmed the rate limit correctly blocked a second draw; checked both
marking viewports (1920x1080, 390x844) and `/readme/`, all clean consoles,
headings in order.

## Next action

Next crit (9) asks for the real-time layer and a decision about concurrent
hands --- that's new work, not yet started. Before touching it: reread
`README.md`/`CLAUDE.md` here since they're this repo's first draft of "what
good means" and may need revising once real-time changes what "a stranger's
trace" implies (e.g. does a second hand see the first hand's mark land
live, and does that change the one-mark-a-day argument at all). PROCESS.md
and `reflections/crit-8.md` are correctly untouched --- those, plus the
push, belong to whichever run the next prompt calls "last" for this crit.

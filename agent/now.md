# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 68h to cutoff at start,
twelfth run of this crit's window.** Plan/build/deepen run, not the last.

## What this run did

Took stock: clean tree, `flyctl status` showed version 10 (the contrast fix,
`de8164a`) live and auto-stopped --- caught up. Live `/`, `/readme/`,
`/style.css`, `/wall.js` all 200, existing marks still rendered.

Rereading the brief: it explicitly says "`PROCESS.md` says why" the stack was
chosen, ideally as a decision record --- that's brief content, not just a
finishing step, so I wrote a first version now
([`50e0ec3`]): a decision record (context: one 256 MB Fly machine + volume;
decision: framework-free `node:http` + Node 24 type-stripping + `node:sqlite`
+ SSE, only runtime dep `marked`; rejected: Astro SSR + `better-sqlite3` from
crit-7, WebSockets; consequence: concurrency isn't hidden, cited the
held-open-body race `7a89c68`), then the jsdom client harness story
(`2e59190`, `ec78095`, `672e486`, `176b787`, `5138836`) and the contrast fix
(`de8164a`). ~570 words. Docs-only, so no redeploy. Local `main` is ahead of
origin by the unpushed commits since the last push --- correct under the
inside-24h push gate.

`pnpm check:evidence` now fails only on the missing `reflections/crit-8.md`
(a finishing step).

## Next action

On whichever run the prompt calls last: write `reflections/crit-8.md` headed
"It's alive!" (raw JSON `title`, reconfirmed this run), 150--300 words, both
prompts --- the natural breakthrough is the jsdom harness that made
`wall.js`'s own logic testable, and the held-open-body race test; reread
`PROCESS.md` against final state, then `pnpm check` + `check:evidence`,
push, deploy, verify live. Before then, keep varying cold-read framings of
`src`/`public` (tried: lifecycle/client-state, self-echo token, overlapping
gesture, SSE disconnect, keyboard access, colour contrast) and update
`PROCESS.md` if anything new lands.

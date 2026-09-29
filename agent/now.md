# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 158h to cutoff at start,
second run of this crit's window (proof of life already shipped at 164h).**
Job was plan/build/deepen, not finish --- crit-8's own spec was already fully
met; this run deepened toward the final project's real-time requirement
ahead of crit-9 explicitly asking for it, since 158h remained and nothing in
doctrine says to wait for a future crit's own prompt before building toward
where the deliverable is headed.

## What this run did

Reread `README.md`/`CLAUDE.md`/`PROCESS.md` and the full source (82--126
lines each across `db.ts`/`identity.ts`/`pages.ts`/`server.ts`/`wall.js`) to
take real stock rather than trust the prior hand-off's characterisation.
Fetched the final-project brief itself (not just the crit-8 brief) to confirm
what "real-time" means there: "a change one person makes appears in every
other open session... within about a second, with no reload."

Built that: `GET /api/marks/stream` (plain SSE over `node:http`, no
framework/library) holds one `ServerResponse` per open tab in an in-memory
`Set`; every successful `POST /api/marks` broadcasts the new mark to all of
them right after `addMark` persists it (never before --- `CLAUDE.md` now says
so explicitly). A 20s heartbeat comment line keeps Fly's proxy from dropping
an idle connection. `wall.js` now keeps its stream open regardless of
`canDraw`, so a hand that already marked today still watches the wall live;
it tells its own gesture apart from the echo by matching path strings, not
by asking the server to suppress it (so a second tab for the *same* hand
still sees its own mark land). Added
`spec/wall.test.ts`'s `"broadcasts a new mark ... within a second"` test
(reads the SSE stream with a raw `fetch`+`ReadableStream` reader, no
`EventSource` needed in vitest's node environment) --- 8/8 green.

Caught and fixed a real regression before committing, the standard way (a
screenshot, not just green checks): the first attempt set `style="color:
${handColour}"` directly on `<svg id="wall">` so the live-drawn stroke's
`stroke="currentColor"` would pick up the hand's own colour --- but
`style.css`'s `#wall { border: 1px solid currentColor; }` inherited the same
property, tinting the *border* to the hand's colour too, a side effect
invisible in the diff and only caught by an actual screenshot. Fixed by
passing the colour through a `data-hand-colour` attribute on the script tag
instead of leaning on CSS inheritance, so only the one JS-drawn path element
gets it.

Verified end-to-end before and after deploying: local scratch server (fresh
`DB_PATH`), two independent `agent-browser` sessions (`--session live-a`/
`live-b` equivalents), dragged a real gesture in one and confirmed the mark
appeared in the other with no reload, no duplicate render in the drawing
tab itself, both consoles clean, both marking viewports (1920x1080, 390x844)
and `/readme/` all render correctly. `flyctl status` showed the live machine
still pinned at the *first* deploy's image version (three commits and 6+
hours behind local `main`) --- redeployed
(`flyctl deploy --remote-only --ha=false -a comp4020-final-shitao`) per the
standing "deploying isn't gated the same way pushing is" note, then repeated
the identical two-session live-browser check against the real
`https://comp4020-final-shitao.fly.dev/` URL, not just the local build.

Committed locally (`f080752`) --- **not pushed**, correctly gated to the
finishing run (158h remained).

## Next action

Crit-8's own bar and the real-time layer are both done and deployed. What's
genuinely still open, per README's own "still to come" line: a decision
about what happens with several hands drawing *at the same moment* ---
whether the one-mark-a-day pace still holds once marks arrive live, and
what a stranger's very first visit should show if marks land mid-visit.
That's a judgement call to make deliberately, not a mechanical feature to
add reflexively --- worth thinking through before touching code, the same
way the original README's "what I chose not to build" section argued for
each existing constraint. `PROCESS.md` and `reflections/crit-8.md` are
correctly still untouched; those, plus the push, belong to whichever run
the next prompt calls "last" for this crit.

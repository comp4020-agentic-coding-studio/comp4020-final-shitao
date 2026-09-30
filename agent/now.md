# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 147h to cutoff at start,
third run of this crit's window.** Job was plan/build/deepen, not finish ---
crit-8's own bar and the real-time layer were both already done and deployed
(prior run, 158h to cutoff). Read the prior hand-off's "next action" (a
judgement call about several hands drawing at once) but before touching that,
reread the full source fresh rather than trusting it was otherwise clean, per
the standing "content-complete... isn't sufficient evidence" habit extended to
backend logic, not just rendering.

## What this run did

Found a real bug reading `server.ts`'s POST handler cold: `hasMarkedToday`
ran *before* `await readBody(req)`, with `addMark` after --- a genuine
check-then-insert gap with a real yield point in between, unlike the several
past-repo races in `MEMORY.md` that turned out safe because nothing separated
check and insert at all. This is exactly the invariant `CLAUDE.md` calls out
by name: "the server must independently refuse a second `POST /api/marks`
from the same hand within the same UTC day even if the client is a bare
`curl`."

Spent real effort establishing whether it was *actually* reachable before
fixing anything, since the shape looked plausible but past runs have learned
not to trust that alone:
- Two curl processes, same cookie, fired with `&`/`wait`: no race (1 of 2
  always won cleanly).
- 30 rounds of two concurrent Node `fetch` calls per fresh hand: no race.
- 10 rounds of 10 concurrent `fetch` calls per fresh hand: still exactly one
  201 every time.
- Raw pre-connected `net.Socket`s, both requests' bytes written back-to-back
  with zero `await` between the two `.write()` calls (40 rounds), even with
  a body large enough (~35KB, near `PATH_RE`'s 2000-segment cap) to force
  multiple TCP reads: still 0/60 combined.

All of those came back clean because Node fully drains one connection's
microtask chain (the whole rest of the async handler, since there's only one
`await` and the body is already fully buffered by the time it's read) before
the event loop's poll phase moves on to the next socket's data --- ordinary
concurrent requests don't actually interleave inside this handler shape, even
genuinely simultaneous ones. The real reproduction needed a client that holds
one request's body open past the other's full completion: send request A's
headers only, wait, send request B's *complete* request (headers+body) and
let it finish (checks false, inserts, 201), *then* release A's already-parsed
headers' body --- A's check ran before B inserted, so it also passes and
inserts. 10/10 hits with this shape
(`race5.mjs`, not committed --- scratch verification only). This is not a
contrived attack: a slow network, a deliberately slow client, or Fly's proxy
buffering behaviour could all produce exactly this shape for a real stranger.

Fixed by moving the `hasMarkedToday` check to immediately before `addMark`,
with no `await` between them --- matching the actually-safe pattern (nothing
can interleave two fully-synchronous statements on `node:sqlite`'s
`DatabaseSync` in a single-threaded process). Re-ran the slow-body exploit
against the fixed server: 0/10. Re-ran the plain concurrency tests too:
still 0/60, now for the right reason. Added a deterministic regression test
to `spec/wall.test.ts` using the same slow-body-then-fast-body technique
(not a timing-dependent "hope they race" test, which the four clean-looking
trials above prove wouldn't reliably catch this) --- 9/9 tests green,
typecheck clean. Real-browser pass after (fresh scratch server, both pages,
a real dragged gesture, console clean at both) to make sure a backend-only
change hadn't broken anything rendering-side, per the standing habit.

Committed (`7a89c68`) and, since deploying isn't gated the way pushing is,
redeployed immediately (`flyctl deploy --remote-only --ha=false`) --- this is
a real correctness/security fix affecting the live app, not something to sit
on until a finishing run. Confirmed the live URL responds 200 with the right
title after deploy. Did not push (correctly gated to the finishing run).

## Next action

The concurrent-hands judgement call the prior hand-off flagged (what several
hands drawing at once should look like, whether a stranger's first visit
should show marks landing mid-visit) is still genuinely open and still a
judgement call, not a mechanical bug --- worth picking up deliberately next,
now that the mechanical enforcement underneath it is actually sound.
`PROCESS.md` and `reflections/crit-8.md` are still correctly untouched;
those, plus the push, belong to whichever run the next prompt calls "last"
for this crit/deliverable.

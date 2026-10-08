# 1. Coming back after a gap replays what you missed

Status: accepted, October 2026, for crit 9 ("All at once").

## Context

Every open tab holds one server-sent events stream, and a mark reaches
every tab within a second of landing. That holds only while the stream
is up, and at a crit it won't always be. A phone locks halfway through,
or someone switches apps and comes back. And every push to `main` now
redeploys the one Fly machine, which drops every open connection at once.

Before this decision a tab that lost its stream showed whatever it had
when the stream dropped. Marks drawn in the gap were missing until a
reload, with nothing to say so. Testing it turned up a worse version:
when the server process dies mid-stream (which is what a redeploy does),
Chrome doesn't retry at all. The `EventSource` goes to `CLOSED`, and the
tab stays frozen until someone reloads.

The README sets the bar: "come back tomorrow and your mark, and everyone
else's, is still there", and the wall should read "as a wall, not an
activity feed". A tab quietly missing marks breaks the first. A "3 new
marks, reload" banner breaks the second.

## Options

1. **Live only, reload to catch up.** The status quo. No code, but two
   people at the same crit end up looking at different walls, and neither
   can tell.
2. **Reload, or refetch the whole wall, on reconnect.** Simple and always
   right. But a reload throws away a gesture in progress (the one thing a
   hand does here). A refetch-and-redraw needs a second way to render the
   wall, as JSON for the client, next to the server-rendered page, and the
   two would drift.
3. **Replay from the last mark the tab has.** Every mark already has a
   row id that only increases. Send it as the SSE `id:`, and on reconnect
   the stream sends exactly the marks after it, oldest first.
4. **Poll instead of streaming.** A poll asking "anything since id N?"
   catches up for free, but makes every tab ask the server something every
   second, forever, for a wall that might change once an hour.

## Decision

Option 3. The page records the id of the newest mark it rendered, and
`public/wall.js` opens its stream with `?since=` that id. That also covers
a mark landing between the page render and the stream connecting, which
used to vanish too. A browser that retries on its own sends
`Last-Event-ID`, and the server prefers that. When Chrome gives up instead,
`wall.js` reopens the stream from the newest id it has seen. It also
reopens the moment a backgrounded tab is visible again, rather than trust
a stream a sleeping phone may have lost without saying so. Replay and
subscribe happen in one synchronous turn in `src/server.ts`, so a mark
can't land between them and be missed or sent twice.

A replayed mark arrives the same way a live one does, with no banner and
no "while you were away". The wall fills in and goes on being a wall.

The same change fixes a smaller gap. The stream request carries the
hand cookie, so the server can flag `mine` on marks sent to that hand's
own connections. Another tab of the same hand now paints the mark as
that hand's own, thicker and on top, and stops offering a second mark.
No hand id goes to the page. If that echo is lost to a gap anyway, the
server's refusal says the same thing: a 429 carries `Retry-After`, and the
tab stops offering a mark until it's up.

Coming back the next day to a tab that never closed works the same way. When
the hand's 24 hours run out, the tab offers a mark again on its own, or the
moment it's back in view if a sleeping phone stalled the timer. A reload is
not needed for this either.

The gap cuts the other way too. A hand that lifts its finger while the
wall is out of reach (a redeploy restarting the machine, a phone off the
Wi-Fi) keeps its stroke on the wall, and `wall.js` posts it again with the
same nonce for about half a minute before giving up. If the first post
landed and only its reply was lost, the echo says so and the retry stops.

## What it costs

- **A tab asleep for a week gets a week of marks at once.** They all land
  in the same instant, with no sense of when each was drawn. That suits
  a wall, but someone who wants to see what changed while they were away
  gets nothing to help them. Option 4's pod would say that's the point of
  coming back.
- **The client has to de-duplicate by id.** The nonce `wall.js` uses to
  recognise its own echo is never stored, so a replay can't carry it. A
  tab that posts and then drops before the echo arrives recognises the
  replayed copy by the id its POST returned instead. That's one more piece
  of state in a client that already has several.
- **A held mark can land late.** A stroke drawn during a redeploy reaches
  the other tabs up to half a minute after the hand lifted its finger, and
  out of order with marks drawn meanwhile. Order on the wall is order of
  arrival, so this is invisible unless you were watching.
- **Every stream connect reads the database.** It's cheap at this size.
  But it's the first time the real-time layer reads persistence rather
  than just following it.
- **Row ids go over the wire.** They show how many marks exist, which the
  wall already shows anyone who counts.
- **It only works on one machine.** Replay leans on the same assumption
  as the in-memory connection set: one machine, one database. A second
  machine would need a shared event log, and a successor to this record.

## How it's checked

`spec/wall.test.ts` checks that a stream opened with `Last-Event-ID`
replays the missed marks in order with matching SSE ids, that `?since=`
from the rendered page catches a mark posted before the stream existed,
and that only the drawing hand's own streams get `mine`.
`spec/wall-client.test.ts` drives the real `wall.js`: it opens from the
page's id, ignores a replayed copy of its own mark, draws each replayed
mark once, reopens a stream Chrome closed, reopens on coming back into view without leaving a second stream
open, treats a `mine` mark from another tab as this hand's, holds a mark through
an offline post and a 502 then posts it once, and keeps the mark when its
echo shows a lost post landed, and stops offering a mark a 429 refused until its
`Retry-After` is up. In a real browser I killed the server with a
tab open, restarted it, and posted a mark before the tab reconnected. The
mark appeared without a reload. I also killed the server between a hand
lifting its finger and its post: the stroke stayed, and posted once when
the server came back.

# 3. What a hand may see and change, and what the logs say about it

Status: accepted, October 2026, for crit 10 ("Fly by instruments").

## Context

Trace's person is a hand: the `hand` cookie `src/identity.ts` mints on a
first visit, with a colour and a name stored beside it. Two Chrome profiles
are two hands, and nothing on the page asks for more, which is what the
crit needs ("anything they need to get in has to be on the page"). Crit 10
asks two further things of that: that what each hand may see and change is
decided on the server and written down, and that the server's logs can say
which hand did what.

## Decision

A hand **may see** every mark on the wall and its colour, and which of those
marks are its own. It may not see which hand drew any other mark, or that
two marks share a hand. `pages.ts` decides `mine` per request from the
cookie, and `server.ts` decides it per stream connection. The page never
receives a hand id or name, so nothing in the browser can widen this.

A hand **may change** one thing: it can add a mark, at most one in any 24
hours (`msUntilNextMark`, a rolling window), at most 2,500 units of ink
(decisions/0002), and only as a path (`PATH_RE`). It can't edit or remove
any mark, its own included. A cookie the wall has no hand for gets a fresh
hand, never the one it named, so making up a cookie gets you a new hand and
nobody else's.

The logs name a hand as `name#row` (`idle-orchard#7`), one line per event:
`hand.new`, `wall.view`, `stream.open`/`stream.close`, `mark.add`, and
`mark.refused` with its reason. `src/log.ts` holds the format. A hand is
stored, and gets its name and `hand.new` line, when its page opens the stream
or posts a mark, not when the page is served: until then its id waits in
memory and its view logs as `hand=new`. The live log showed why: a cookieless
visitor, likely an uptime check, fetched `/` every hour and each fetch logged
a new hand, 296 hands for 32 marks. At the crit one of those would read as a
third person arriving. Something that never runs `wall.js` never becomes a
hand. An id the server didn't mint, or lost in a restart, still gets a fresh
hand. The row number
is there because names collide: the first test run against a fresh wall gave
`idle-orchard` to hands 1 and 7.

A mark is logged by what the room can see, not by its hex: a colour word
(`colour=sage`, from `COLOUR_WORDS` in `src/identity.ts`) and the ninth of
the 1000x600 wall its middle falls in (`at=top-left`, `placeOf` in
`src/log.ts`). Rehearsing the crit against a fresh wall, the log said
`colour=#4e8067` and `colour=#457b9d`, and I couldn't say which was "the
green one" without a colour picker. With ten colours two pod members also
share one about one time in ten, and then only the place tells them apart.

## Options I turned down

1. **Let a hand undo its own mark.** This is the obvious addition, and it's
   cheap. But undo-and-redraw is unlimited redrafting, so the one gesture a
   day becomes a composition. Removals would also have to broadcast, and a
   wall that loses marks breaks "come back tomorrow and your mark, and
   everyone else's, is still there."
2. **Show each mark's hand name.** This would make narration easy, but the
   README promises that nobody can find out who drew which mark unless they
   tell you. The name stays server-side, a handle for logs only.
3. **A moderator who can remove marks.** That needs an account, which
   CLAUDE.md rules out, and the README puts the constraint upstream, in what
   a mark can be.
4. **Log the cookie, an IP or a user agent.** Any of these would identify
   the person better. But the cookie is the hand's only credential, and
   anyone who reads it from a log can draw as that hand. The other two
   track people, which the README says this app doesn't do. A row number
   tells two hands apart without any of them.

## What it costs

- **A hand is a browser, not a person.** Clearing cookies or opening a
  private window makes a new hand that can mark straight away. The daily
  limit slows the wall down. It doesn't stop a determined flooder, and only
  an account could.
- **The cookie is a bearer token.** Whoever holds it is that hand. It's
  `HttpOnly`, `SameSite=Lax` and `Secure` on Fly, which covers scripts and
  cross-site posts but not someone with the device.
- **Logs don't keep long.** `flyctl logs` reads Fly's recent buffer, not an
  archive. The record that lasts is the `marks` table (`hand_id`,
  `created_at`) on the volume. The logs add what the table can't hold:
  views, streams and refusals.
- **The narrator can't see a view without a page load.** A second stroke
  started after a hand has marked is stopped in `wall.js` before any
  request, so it never shows up in the log. Only a hand-built request does,
  as `mark.refused reason=too-soon`.

## How it's checked

`spec/wall.test.ts` already checks the server's half of every rule above:
a second mark within 24 hours, over-ink and malformed paths are refused even
from a bare request, and `mine` reaches the hand that drew a mark and not a
different hand. `spec/log.test.ts` checks the log format and that a label
carries no part of the cookie. In two separate `agent-browser` sessions
against a fresh wall, each drew a mark. Reading only the log, I could say
which colour each hand drew, in what order, and how many tabs saw each mark
arrive. Each browser marked only its own stroke as `mine`. A second rehearsal,
after the colour words and places, read as "gentle-ember drew red in the top
left, quick-pebble drew orange in the bottom right and then tried again and
was refused", from the log alone.

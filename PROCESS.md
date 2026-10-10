# Process

Trace started from the brief's question --- what would make this app good ---
before it started from a stack. The first commit,
[`2828f3e`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/2828f3e),
landed the README's argument (a mark is a gesture, not a post; the wall grows
by care, not engagement) and `CLAUDE.md`'s rules in the same change as the
code, so every later session read the argument before it read the source.
Those rules are the harness: no text field, no accounts, one mark a day
enforced in `src/db.ts` rather than the client, no third-party requests,
broadcast only after persistence.

## The stack

A framework-free `node:http` server in TypeScript, run directly by Node 24's
type-stripping, with `node:sqlite` at `DB_PATH` and server-sent events for
the live layer. Astro with `better-sqlite3`, which I'd used the crit before,
was most of the code for two pages, and its native addon has to compile in
the slim image. SSE beat WebSockets because the wall only pushes a finished
mark one way
([`f080752`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/f080752)).
An in-memory set of connections is enough while `fly.toml` pins one machine.

Nothing hides concurrency from me. The first real bug was a race:
`hasMarkedToday` ran before `await readBody`, so a client holding its body
open could mark twice. Ordinary concurrent requests never reproduced it; a
test that held one body open while a second request finished did, and is
now the regression test
([`7a89c68`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/7a89c68)).

## Correcting the work

Early tests only drove the server. After a browser session found a hand
could start a second stroke once its mark had landed
([`2e59190`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/2e59190)),
`spec/wall-client.test.ts` began loading the real `wall.js` into jsdom and
dispatching real events at it
([`ec78095`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/ec78095)).
Each fix since must fail its new test against the pre-fix file. That caught
a self-echo filter matching by content, not a nonce
([`672e486`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/672e486)),
and a keyboard-only hand with no way to draw
([`5138836`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/5138836)).

Rereading the spec one line at a time found what no test looked for. "Find
their trace still there" was checked as "the mark persists," but ten shared
colours meant a stranger couldn't tell which stroke was theirs; a hand's own
marks now render thicker, on top, for that hand only
([`6e07998`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/6e07998),
[`a9d92f3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/a9d92f3)).
"One mark a day" meant a UTC day, which reopens at 11am in Canberra; it is
now 24 hours since a hand's last mark
([`79989b6`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/79989b6)).

## Several people at once

Crit 9 asked for one decision about several people using the app together.
I chose what a tab sees after its stream drops, because every push now
redeploys the one machine. A real browser settled it: with a tab open, I
killed the server, restarted it, and posted a mark. Chrome hadn't retried.
Its `EventSource` sat `CLOSED`, and the tab would have stayed frozen until
a reload. The stream now replays everything after the last mark id a tab
has
([`7894d00`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/7894d00)),
and `wall.js` reopens a stream the browser gave up on
([`a1d5567`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/a1d5567)).
[`decisions/0001`](decisions/0001-coming-back-after-a-gap.md) holds the
rejected options and the costs.

The same fact, that a deploy is a network failure for whoever is mid-stroke,
reframed the client. A failed post used to drop the stroke; now it holds the
mark and posts it again with the same nonce
([`9d4458f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/9d4458f)),
and a refused tab waits out the server's `Retry-After` instead of offering a
mark it can't have
([`403d9c7`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/403d9c7)).
I tested each by killing the server between a gesture and its post.

The second decision came from data, not a hunch. Measuring every path on the
live wall showed ordinary marks under 1,750 units and two floods at 6,100 and
34,600, one covering a third of the wall. That gap set an ink cap of 2,500,
refused by the server
([`c2b152b`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/c2b152b))
and met by a stroke that stops growing rather than failing on lift
([`66dc0b5`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/66dc0b5)),
with its costs in
[`decisions/0002`](decisions/0002-one-hands-share-of-the-wall.md)
([`c37ffec`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/c37ffec)).

The pod will draw on phones, so I checked phone sizes the spec never names.
On a landscape phone the wall overflowed the screen and a scroll swipe
posted a mark
([`54361a5`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/54361a5));
on a portrait one it left half the screen empty, so it now runs to the edges
([`efbafac`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/efbafac)).

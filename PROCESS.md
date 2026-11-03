# Process

Trace started from the brief's question --- what would make this app good ---
not from a stack. The first commit,
[`2828f3e`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/2828f3e),
landed the README's argument (a mark is a gesture, not a post) and
`CLAUDE.md`'s rules with the code, so every later session read the argument
before the source. Those rules are the harness: no text, no accounts, the
daily limit enforced on the server, broadcast only after persistence.

## The workflow

I'm a crit agent, so the workflow is unusual and worth stating plainly. Each
run is one non-interactive Claude Code session with no memory of the last;
the only continuity is the commit history and a `memory/` directory of my
own, which carries a hand-off note and the lessons I decided were worth
keeping. Nobody reviews a change before it lands. That shaped three choices.

First, the rules had to live in the repo, not in my head, because the next
run doesn't have my head. `CLAUDE.md` states what the app must never do, and
when a run found a mistake the fix went into the rule or the check as well as
the code: the one-mark limit was restated as 24 hours once a calendar day was
shown to be wrong
([`7e58da7`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/7e58da7)),
and the logging rule was added the moment logging existed
([`deb758c`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/deb758c)).

Second, with no reviewer, a test had to prove it could fail. Every client fix
since crit 8 was checked against the pre-fix file, and kept only if the new
test went red there. The alternative, trusting a green run, is what let the
bugs below sit for days.

Third, small commits, each green and each scoped to one file or idea, so a
later run (or a marker) can read what changed and why from the log alone.

The cost is that a lone agent inherits its own framing. Most of what mattered
was found not by more tests but by changing the question a run asked, which
the sections below trace.

## The stack

A framework-free `node:http` server with `node:sqlite` at `DB_PATH`. Astro
would have been most of the code for two pages, and `better-sqlite3` needs a
native build in the slim image; server-sent events beat WebSockets because
the wall only pushes a finished mark one way
([`f080752`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/f080752)).
[`decisions/0004`](decisions/0004-the-stack.md) holds the options and the
costs. The main cost showed up at once: nothing hides concurrency. The first
real bug was a race: `hasMarkedToday` ran before `await readBody`, so a
client holding its body open could mark twice. Ordinary concurrent requests
never reproduced it; holding one body open while a second request finished
did, and is now the regression test
([`7a89c68`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/7a89c68)).

## Correcting the work

Early tests only drove the server. After a browser found a hand could start
a second stroke once its mark had landed
([`2e59190`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/2e59190)),
`spec/wall-client.test.ts` began loading the real `wall.js` into jsdom and
dispatching real events at it
([`ec78095`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/ec78095)).
That harness then caught a self-echo filter matching by content
([`672e486`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/672e486)),
and a keyboard-only hand with no way to draw
([`5138836`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/5138836)).

Rereading the spec line by line found what no test looked for. "Find their
trace still there" had been checked as "the mark persists," but with ten
shared colours nobody could tell which stroke was theirs; a hand's own marks
now render thicker and on top
([`6e07998`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/6e07998),
[`a9d92f3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/a9d92f3)).
"One mark a day" meant a UTC day, which reopens at 11am in Canberra; it is
now 24 hours since a hand's last mark
([`79989b6`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/79989b6)).

## Several people at once

Crit 9 asked for a decision about several people at once. I chose what a
tab sees after its stream drops, because every push redeploys the one
machine. Restarting the server under an open tab showed Chrome never
retried. The stream now replays everything after a tab's last mark id
([`7894d00`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/7894d00)),
and `wall.js` reopens a stream the browser gave up on
([`a1d5567`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/a1d5567)).
[`decisions/0001`](decisions/0001-coming-back-after-a-gap.md) holds the
rejected options. A failed post now holds the mark and retries with the
same nonce
([`9d4458f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/9d4458f)),
tested by killing the server between a gesture and its post.

The second decision came from data: every live path measured under 1,750
units except two floods, so the ink cap is 2,500, refused by the server
([`c2b152b`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/c2b152b))
and met by a stroke that stops growing rather than failing on lift
([`66dc0b5`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/66dc0b5)),
with its costs in
[`decisions/0002`](decisions/0002-one-hands-share-of-the-wall.md).

The pod draws on phones: on a landscape one a scroll swipe posted a mark
([`54361a5`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/54361a5));
on a portrait one it left half the screen empty, so it now runs to the edges
([`efbafac`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/efbafac)).

## Telling hands apart from the logs

Crit 10 has me narrate two pod members from `flyctl logs` alone. Each hand
action logs one line naming the hand as `name#row`, never its cookie
([`1e9e428`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/1e9e428)),
with the reasoning in
[`decisions/0003`](decisions/0003-what-a-hand-may-see-and-change.md).

Rehearsing the crit literally showed what that missed: two fresh browsers
drew and the log said `colour=#4e8067`, correct and no use to someone
pointing at a wall. A mark now logs a colour word and the ninth of the wall
it sits in
([`d140f70`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/d140f70)).
Reading the live log as the narrator would found an hourly cookieless
monitor minting a hand per page view, 296 hands for 32 marks. A hand is now
stored only when its page opens the stream or posts
([`c27924c`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/c27924c)).
Fly keeps about a hundred log lines, and overnight restarts had pushed every
hand action out, so each line now also goes to a capped table on the volume
([`bdf17ab`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/bdf17ab)).

## Finishing

The last week rewrote the README to the brief's length and gave it the
alternative it had been missing: r/place, the shared canvas where any tile
can be painted over, which is the design Trace's one rule most directly
refuses
([`e5b44a7`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/e5b44a7)).
Leading with that rule exposed that neither `CLAUDE.md` nor `spec/` had ever
stated it; both do now, and the check fails on a planted `DELETE FROM marks`
([`95a23ac`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/95a23ac)).
The same audit, run over every rule, gave keyboard drawing, contrast,
persist-before-broadcast and logging their own checks
([`728a421`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/728a421),
[`6aa8bf1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/6aa8bf1),
[`5c13687`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/5c13687)).
The stack argument, which had shrunk to a paragraph as this file was
rewritten each crit, moved into its own record
([`4a0545f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/4a0545f)).

What I'd do differently: the habits that found the most --- reading a spec
line as a stranger would, rehearsing the crit literally, reading the live
data --- arrived one crit at a time, each after a stretch of green runs that
had stopped telling me anything. Next time I'd start each crit with them.

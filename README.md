# Trace

Trace is a wall with one rule: draw a single mark, and it joins everyone
else's. Press on the wall (or focus it and press Enter, then use the arrow
keys) and drag; when you lift, your mark is on every open screen within a
second, and it's still there tomorrow. Then you wait 24 hours. You're a
*hand*: a cookie and a colour. Your own marks draw thicker, and only you
can tell they're yours.

## What good means here

Trace is good if a room full of strangers can make one drawing together
without anyone being able to take it over, and if each of them can come
back and find their own stroke still in it.

Robin Sloan's
["An app can be a home-cooked meal"](https://www.robinsloan.com/notes/home-cooked-app/)
gave me the scale: software for a few people, made with care rather than
for growth, that "stays put." Aral Balkan's
["What is the Small Web?"](https://ar.al/2020/08/07/what-is-the-small-web/)
gave me what to refuse: the Big Web's habit of watching everyone and never
sitting still. So nothing here grows: no invites, no follows, and nobody
can find out who drew which mark unless they tell you. Marks drawn while
you're away fill in quietly, so it reads as a wall, not an activity feed.

The alternative I argued against was Reddit's
[r/place](https://www.redditinc.com/blog/how-we-built-rplace/): one tile every five minutes, and any tile can be
painted over. That made it a contest organised groups won
([Wikipedia](https://en.wikipedia.org/wiki/R/place) records subreddits and
streamers coordinating to draw over each other). Trace takes the other
side. No mark is ever replaced or removed, so come back tomorrow and your
mark, and everyone else's, is still there; and a day
between marks, with a fixed amount of ink each, means nobody out-draws
anyone, because a wall that everyone can flood stops being a wall anyone
wants to add to.

## What I chose not to build

No text, captions or typed names: a mark is a gesture, not a post, and a
gesture can't be unkind the way a sentence can. No accounts: a hand is a
browser, so a new phone is a new hand, and I'd rather pay that than ask
for an email. No undo: one gesture a day would become as many drafts as you
like. No moderation queue: the constraint sits upstream, in what a mark
can be.

## What's enforced, and what's judged

`spec/` checks these against the running app, even from a bare `curl`:

- a stranger gets a hand on first visit, and a made-up cookie never gets
  someone else's
- a mark is still there on a fresh request, and reaches every open tab
  within a second; a tab that dropped its stream gets what it missed
- a second mark within 24 hours is refused (a rolling window, not a
  calendar day), as is any path over 2,500 units of ink
- only the hand that drew a mark is told it's theirs
- no third-party request, every hand colour meets WCAG's 3:1 contrast on
  light and dark, and a keyboard alone can draw

What's judged: whether the wall is worth looking at once a room has drawn, whether a day is the right pace, and whether "no login" survives
people wanting their marks on a new phone. I judged the first two by
seeding 300 marks into a scratch wall and by drawing with three hands at
once, and at three crits with a pod on their own phones. The third I've
only argued.

Each larger call, with the options I turned down and what it costs, has a
record in [`decisions/`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/tree/main/decisions).

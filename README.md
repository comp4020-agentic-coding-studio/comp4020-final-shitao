# Trace

Trace is a wall with one rule: draw a single mark, and it joins everyone
else's. There's no feed, no likes, no comments, no account --- just a hand
(yours, anonymous, remembered only by a cookie) adding one stroke to a
drawing that never resets. Come back tomorrow and your mark, and everyone
else's, is still there.

## What good means here

I read two things while deciding what this app should and shouldn't do.
Robin Sloan's
["An app can be a home-cooked meal"](https://www.robinsloan.com/notes/home-cooked-app/)
describes BoopSnoop, a photo-sharing app he built for exactly four people ---
his family --- with no login, no contact list, nothing to configure: "software
that stays put," made out of care rather than growth. Aral Balkan's
["What is the Small Web?"](https://ar.al/2020/08/07/what-is-the-small-web/)
names the pattern this is reacting against: the "Big Web" trusts servers
over people, and grows by trusting nobody, watching everybody, and never
sitting still.

Trace can't be single-tenant the way Balkan means (a marking crawler and a
stranger both need to reach it at the same URL), but I took the same stance
on what the *inside* of the app should feel like: nothing here is trying to
grow. There's no way to invite anyone, follow anyone, or find out who drew
which mark unless they tell you. A hand is a cookie and a colour, not a
profile. You get one mark a day, the same way you'd only add one line to a
guestbook --- not because the server can't take more, but because a wall
that everyone can flood stops being a wall anyone wants to add to.

## What I chose not to build

No text. No titles, no captions, no usernames you type in --- a mark is a
gesture, not a post, and a gesture can't be unkind in the way a sentence can.
No accounts: identity is a browser cookie, so "coming back" means the same
browser, not a login you can carry between devices (yet --- that trade-off
is worth revisiting once more than one hand at a time is actually drawing on
it, in the crit after this one). No moderation queue: the constraint is
upstream, in what a mark is even allowed to be.

## What's enforced, and what's judged

`spec/` checks the claims that are actually mechanical: a first-time visitor
gets a hand (a cookie, minted once); a mark they draw shows up on the wall
and is still there on a completely fresh request; a hand can't draw a second
mark before a day has passed; the page ships no third-party script or
tracking request. Whether the wall is actually *good to look at* once more
than one hand has drawn on it, whether one mark a day is the right pace, and
whether "no login, ever" survives contact with people who want their marks
back on a new phone --- those are judgement calls, not tests, and the crit is
where I find out if they were the right ones.

This is the first version, proof of life: one hand, one mark, one wall. The
brief's next two crits ask for real-time (so a second hand watching sees the
first hand's mark land) and for a decision about what happens with several
hands drawing at once; both are still to come.

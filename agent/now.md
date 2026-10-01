# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 99h to cutoff at start,
eighth run of this crit's window.** Job was plan/build/deepen, not finish ---
the prompt didn't call this the last run.

## What this run did

Confirmed the build was in good shape (`git status` clean, up to date with
origin, `flyctl status` showed version 7 --- the last app-code commit --- still
live) and reran `pnpm check` against a scratch server: 14/14 green.

Did a fresh cold read of `src/server.ts`, `src/db.ts`, `src/identity.ts`,
`src/pages.ts` and `public/wall.js` with a new framing (resource lifecycle and
client-state correctness, not the self-echo logic already fixed twice). Found
a real bug in `wall.js`: `pointerdown` only checked `canDraw`, which stays
true until the first post *succeeds* --- so a hand could start a second
gesture while the first mark's POST was still in flight (a plausible real
sequence: draw, lift, draw again before the network round-trip completes).
Both gestures post; the server's one-mark-a-day check correctly rejects the
loser, but the single `pendingNonce` variable belongs to whichever gesture
started last, orphaning the winner's own nonce --- so when the winner's own
SSE echo arrives, it no longer matches `pendingNonce` and gets drawn again,
producing a visible duplicate of a stroke already on the wall.

Confirmed this was real, not hypothetical, with a scratch jsdom repro before
touching the fix (same harness as `spec/wall-client.test.ts`): two gestures
fired back-to-back with the first's fetch deferred actually produced 2 posts
and a 3rd duplicate `<path>` once the first gesture's own echo arrived.
Fixed with one new flag (`submitting`, set for the duration of the in-flight
POST, checked alongside `canDraw` in the `pointerdown` guard) rather than
switching `pendingNonce` to a set --- preventing the overlapping gesture
outright is simpler and also closes a UX gap (no point letting someone drag
out a second stroke that can only ever be rejected). Added a new regression
test to `spec/wall-client.test.ts`; verified it actually discriminates by
swapping in the pre-fix `wall.js` (`git show HEAD~1:public/wall.js`
temporarily) and confirming the new test fails there while the four existing
tests still pass, then restored the fix and reran `pnpm check` clean
(15/15). Did a live single-gesture check in `agent-browser` against the
scratch server too (console clean, mark lands, status text correct) to
confirm the fix doesn't regress the ordinary one-gesture path.

Committed (`176b787`) and deployed to Fly (`flyctl deploy --remote-only
--ha=false`, now version 8, confirmed live `/wall.js` serves the new
`submitting` guard and `/` still returns 200). Committed locally only beyond
that --- push is gated to inside 24h of cutoff, and we're at 99h. Note
`origin/main` already carries the *previous* run's `672e486` (the harness's
own tick-snapshot commits do a plain `git push` of whatever's on local
`main`, picking up anything left unpushed by an earlier run --- this is the
standing "out-of-band commits are normal" behaviour, not something this run
did deliberately). Only this run's `176b787` is genuinely unpushed right now
(`git log origin/main` confirms).

README/PROCESS.md/`reflections/crit-8.md` untouched, correctly --- still
template placeholders, which is right: they belong to whichever run the
prompt calls this crit's last.

## Next action

Normal cadence continues: reread README fresh each run, cold-read
`src`/`public` again periodically with a *varied* framing (this is the third
run in a row to find a real bug this way --- gesture-flag, self-echo nonce,
now the overlapping-gesture nonce clobber --- all in the same small client
file; don't assume `wall.js` is clean just because the last framing's bug is
fixed, each pass has been catching something the others didn't), check
`flyctl status` is current after any run that changes app code, watch for
out-of-band convenor commits. Whichever run the prompt calls this crit's last
still needs: `PROCESS.md` (a real decision record, not the template), at
least a first-cut `reflections/crit-8.md` headed with this source's actual
title ("It's alive!", confirmed from the raw JSON `title` field, not a
rendered heading), and the push itself (`176b787` is the one commit
currently unpushed).

# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 110h to cutoff at start,
seventh run of this crit's window.** Job was plan/build/deepen, not finish ---
proof of life, the real-time layer, the DB race fix, the client gesture-flag
fix (with a jsdom regression test added last run) were all already done and
deployed.

## What this run did

Confirmed the build was still in good shape (`git status` clean, up to date
with origin, `flyctl status` showed version 6 --- the last app-code commit ---
still live), then did a real-browser pass at both marking viewports
(1920x1080, 390x844) plus `/readme/`: all render cleanly, headings match
README in order, no console errors. Drove an actual drag gesture through a
scratch server and confirmed persistence across reload and the server-side
429 guard holds independent of the client's `canDraw` flag.

Also dispatched the flagged periodic cold-read of `src`/`public` (a
general-purpose subagent, sonnet, read-only). It found two real, non-
hypothetical bugs in `public/wall.js`'s SSE self-echo filter, both missed by
every existing check (the jsdom client test stubs `fetch`/`EventSource`, so
none of this logic runs under test, and no HTTP-level test touches it
either):

1. The filter compared the *incoming mark's path string* to `justPosted`
   (the path this tab just posted) to decide "is this my own echo." Two
   different hands drawing byte-identical short strokes --- a real
   possibility, since paths are rounded to integer coordinates in a
   1000x600 viewBox and a short stroke is the common case --- would make one
   hand's tab silently swallow the *other* hand's genuine mark as if it were
   its own echo.
2. `server.ts` broadcasts a mark over SSE *before* replying 201 to the POST
   that created it (deliberately, so SSE clients see it as soon as it's
   committed). That means the echo can genuinely arrive at the *same* tab
   before its own `fetch` promise resolves and `justPosted` gets set --- in
   which case the old code drew a visible duplicate `<path>` for its own
   mark.

Fixed both with one mechanism: a client-generated nonce (`crypto.randomUUID()`),
recorded in a `pendingNonce` variable *synchronously before the fetch call is
even issued* (not after it resolves), sent in the POST body, and echoed back
unchanged in the broadcast payload. The SSE handler now compares by this
opaque token instead of path content, and the token exists before either I/O
operation (the broadcast write or the fetch response) can complete, so the
race is closed by construction, not by timing luck.

Added two new regression tests to `spec/wall-client.test.ts` for exactly these
two scenarios (dispatching a synthetic "mark" SSE event with a different nonce
but identical path; and dispatching the matching-nonce echo before releasing
a deliberately-deferred fetch promise). Verified both actually discriminate
before trusting them: swapped in the pre-fix `public/wall.js` via `git show
<old-sha>:public/wall.js`, confirmed both new tests fail against it (and the
three pre-existing tests still pass), then restored the fix and reran
`pnpm check` clean (14/14, typecheck clean). Did a live two-browser-session
check too (two separate `agent-browser` sessions as two independent hands):
one hand drew, the other hand's already-open tab picked up exactly one new
path, no duplicate, no drop.

Committed (`672e486`) and deployed to Fly (`flyctl deploy --remote-only
--ha=false`, now version 7, confirmed live `/wall.js` serves the new code and
`/` still returns 200). Committed locally only beyond that --- push is gated
to inside 24h of cutoff, and we're at 110h, so `origin/main` is intentionally
one commit behind.

README/PROCESS.md/`reflections/crit-8.md` untouched, correctly --- still
template placeholders, which is right: they belong to whichever run the
prompt calls this crit's last.

## Next action

Normal cadence continues: reread README fresh each run, cold-read
`src`/`public` again periodically (this run's pass found two real bugs after
several prior clean passes, so don't assume the well is dry even after a
quiet run --- vary what you're looking for, per the standing "content-complete
isn't sufficient" habit's own lesson about varying framings), check `flyctl
status` is current after any run that changes app code, watch for out-of-band
convenor commits. Whichever run the prompt calls this crit's last still
needs: `PROCESS.md` (a real decision record, not the template), at least a
first-cut `reflections/crit-8.md` headed with this source's actual title
("It's alive!", confirmed from the raw JSON `title` field in an earlier run,
not a rendered heading), and the push itself.

# now

**`comp4020-final-shitao`, crit-8 ("It's alive!") --- 134h to cutoff at start,
fourth run of this crit's window.** Job was plan/build/deepen, not finish ---
proof of life, the real-time layer, and the check-then-insert race fix were
all already done and deployed (prior run, 147h to cutoff). Picked up that
run's flagged next action deliberately: the "several hands drawing at once"
judgement call, now that the mechanical enforcement underneath it is sound.

## What this run did

Ran a genuine multi-hand concurrency playtest against a scratch server (three
`agent-browser` sessions, each its own cookie jar = its own hand, not one tab
role-playing three): one hand started a stroke and held its pointer down
while a second hand drew and posted a complete mark; the first hand's
in-progress gesture wasn't disturbed by the other's mark streaming in via SSE
underneath it, and it posted cleanly right after. A tab left open the whole
time picked up every hand's mark with no reload, no duplicates, in order.
Screenshotted both marking viewports (1920×1080, 390×844) with several
hands' strokes on the wall at once --- reads as one drawing, not a pile-up.
This doesn't resolve the actual judgement call (whether the one-mark-a-day
*pace* still feels right with several hands in an hour --- that needs real
people, not driven browser tabs) but it does rule out any mechanical
interference or dropped-event risk underneath that question, so recorded the
finding in README rather than leaving the open question exactly as the prior
run phrased it. Committed (`2d27ed0`), redeployed (deploying isn't gated the
way pushing is), confirmed the live `/readme/` serves the new paragraph.
`pnpm check` stayed green throughout (9/9 tests, typecheck clean) --- README
prose only, no app code touched this run.

**Real finding, not app-related:** the previous run's own hand-off commit
(`235909b`) added a real lesson (marked's README renderer has no smartypants,
so `---` never becomes an em dash in `/readme/`) directly to the repo's
`agent/MEMORY.md` instead of here. The harness's own tick-snapshot commit ten
seconds later (`95e841c`) reverted exactly that addition, because `agent/` is
harness-synced *from* this directory, one-way, not the other way around. The
finding was gone from durable memory until I noticed the commit message
promised something the repo's memory no longer contained, diffed the two
commits to confirm the mechanism, and re-added it here (see MEMORY.md's new
entries). Lesson recorded for real this time: **always write hand-offs and
lessons to `shitao/memory/{now.md,MEMORY.md}`, never to `<repo>/agent/*.md`.**

## Next action

The one-mark-a-day pace-under-load judgement call is still genuinely open
and still needs real people, not another browser-driven test --- it's a crit
question, not a build task. Otherwise this deliverable is in good shape:
proof-of-life bar met, real-time layer solid, the one real race closed and
regression-tested, README's "what good means" and its open questions both
current. Worth a normal-cadence pass next run: reread README fresh (does
anything else need resolving or updating), reread `src/` cold once more per
the standing "content-complete isn't sufficient evidence" habit (last full
cold read was run 4, found the race), and check `flyctl status` is still
current. `PROCESS.md` and `reflections/crit-8.md` are still correctly
untouched --- those, plus the push, belong to whichever run the next prompt
calls "last" for this crit/deliverable, not before.

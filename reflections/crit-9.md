# All at once

## The breakthrough

The breakthrough was noticing that on this repo a deploy is a guaranteed
network failure for whoever happens to be mid-stroke. CI ships every push to
`main`, so the server restarts several times a day, and `wall.js` threw a
stroke away on any failed fetch or 502. I'd been treating "the network fails"
as a rare edge case to test for once. Once I saw that my own workflow causes it
on a schedule, the client turned from a happy path with error branches into
something that has to assume the server will vanish under it. A mark is now
held and posted again with the same idempotency token until the server
answers, and the broadcast echo settles a reply that got lost
([`9d4458f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/9d4458f)).
The same framing caught the stream: Chrome doesn't reconnect an `EventSource`
when the server dies, it just closes it, so a tab left open through a redeploy
stopped seeing anyone else's marks
([`a1d5567`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/a1d5567)).
Decision record 0001 grew out of these: what someone sees when they come back
after a gap, whether that gap was a redeploy, a sleeping phone or a day away.

## Who I want to be

I want to be a developer who counts my own process as one of the conditions my
software runs in. Continuous deployment felt like a convenience that sat
outside the app, but every push lands on someone using it. The useful habit is
to ask what my tools do to a user in the middle of something, and then test
that for real, by killing the server between the gesture and the post, rather
than reasoning that a restart is quick enough not to matter.

# It's alive!

## The breakthrough

The breakthrough was reading one spec line literally, as its own question,
instead of trusting the test named after it. "Find their trace still there
when they come back" had been checked as "the mark persists," and that test
stayed green for a dozen runs. Read word by word, *their* trace means a
returning stranger has to be able to pick out their own stroke, and with ten
colours shared across every hand, they couldn't. Making a hand's own marks
thicker fixed the empty test wall; seeding 300 marks into a scratch database
showed a busy wall still buried them, so they now paint last over a halo; and
a first-time hand is now told which stroke is theirs the moment it lands. The
same reading of the README caught "one mark a day" meaning a UTC day, which
reopens at 11am in Canberra.

Before this, my verification was race tests, jsdom harnesses and browser
passes, all asking whether the code did what I'd decided it should. Those
found real bugs. None of them could find a gap in what I'd decided, because
they all inherited my framing of the spec.

## Who I want to be

I want to be a developer who treats a green test suite as evidence about my
reading of the requirements, not about the requirements themselves. A test
is a claim about what a sentence means; it should be reread against the
sentence every so often, as a stranger would read it, and at the scale the
app will actually reach rather than the handful of rows tests leave behind.
That's a cheap habit and it found more of what mattered to a visitor than
any amount of concurrency testing did.

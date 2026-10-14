# Fly by instruments

## The breakthrough

The breakthrough was rehearsing the crit literally instead of checking that the
logs existed. The first version logged every hand action, named each hand as
`name#row` and never the cookie, and passed its tests. Then I opened two fresh
browsers, drew with each, and tried to narrate from the log alone. I couldn't:
`colour=#4e8067` can't be pointed at in a room, so marks now log a colour word
and a ninth of the wall
([`d140f70`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/d140f70)).
Reading the live log the same way turned up 296 hands for 32 marks, because an
hourly monitor minted a hand on every page view; a hand is now stored only once
its page runs
([`c27924c`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/c27924c)).
Coming back the next morning, `flyctl logs` held nothing from the rehearsal at
all: Fly keeps about a hundred lines, and a night of restarts had cycled past
them. "The logging outlives the crit" was false until every line also went to
the volume
([`bdf17ab`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-shitao/commit/bdf17ab)).

## Who I want to be

I want to be a developer who tests a log by reading it the way someone will
actually have to, under the conditions they'll have. Every line was correct;
none of that made it useful to a narrator in a room, or to me the morning after.
The habit is to treat each audience for an output, a pod, a future agent
debugging the live app, as a user, and to sit in their seat before calling the
output done, the same way I'd open a page at a phone's width before trusting it.

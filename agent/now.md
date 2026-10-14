# now

**`comp4020-final-shitao`, crit-10 ("Fly by instruments"), ninth run,
100h to cutoff.**

## State

Local `main` matches `origin/main` (`caef62e`), working tree clean. The last
three CI runs succeeded and the live URL serves 200. 75/75 green against a
scratch server, `check:evidence` green (3 reflections, 22 citations).

## What this run did

Checked only, built nothing. The brief is unchanged. The volume log
(`flyctl ssh console -C "node src/events.ts 60"`) shows only the hourly
monitor as `hand=new`, plus one real visitor (`idle-heron#310`) who opened
the stream and left without drawing: logged correctly, no phantom hands.
I reran the two-session rehearsal at 390×844 against a scratch server: two
hands drew, and the log told them apart as `quiet-heron#17 colour=ochre
at=top-left` and `…-sparrow#18 colour=red at=bottom-right`, each
`tabs_told=2`, and the other tab got the mark live. No browser errors.

## Next action

Finishing run: reread PROCESS.md (757 words, over the 400–600 guidance, which
no check enforces; trim it if time allows) and the crit-10 reflection
against the brief, then confirm `git status` is clean, `origin` is in sync
and CI deployed. At the crit, narrate with
`mise exec -- flyctl logs -a comp4020-final-shitao` tailing. Don't add
features: the brief is met. Run `agent-browser` from inside the repo clone;
from `/tmp` its mise shim has no version.

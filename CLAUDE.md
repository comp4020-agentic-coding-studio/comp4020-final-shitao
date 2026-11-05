# Your harness

Trace's argument (`README.md`) is that a mark is a gesture, not a post, and
that the wall grows by care, not by engagement. These rules keep the code
honest to that, not just the README:

- **A mark is a path, never text.** No route ever accepts a caption, a
  username the visitor types, or an uploaded image. If a future feature
  wants words attached to a mark, that's a README rewrite first, not a
  quiet field addition.
- **No accounts, ever.** Identity is the `hand` cookie `src/identity.ts`
  mints, nothing else. Don't add a login, an email field, or anything that
  outlives the cookie. `spec/wall.test.ts` pins the route list and checks
  no page serves a form; a new route updates that test deliberately.
- **No browser learns who drew a mark.** A page or stream event carries a
  mark's path, colour and whether it's the viewer's own (`mine`), never a
  hand id or name; only the server log names hands. A new field on a mark
  event is added to the allow-list in `spec/wall.test.ts` deliberately.
- **A mark, once stored, is never replaced, edited or removed** --- not by
  its own hand, not by an admin route, not by a cleanup job. That is what
  separates the wall from r/place's paint-over canvas (README). No undo, no
  delete endpoint, no `UPDATE`/`DELETE` on `marks`; `spec/wall.test.ts`
  checks both the routes and the source.
- **The one-mark-a-day limit is enforced in `src/db.ts`, not the client.**
  The drawing UI can hide the button after a mark lands, but the server must
  independently refuse a second `POST /api/marks` from the same hand within
  24 hours of its last mark (a rolling window, never a calendar day) even if
  the client is a bare `curl`.
- **No third-party requests.** No analytics, no CDN-hosted fonts or scripts,
  no embeds. Every `<script>` and `<link>` the server sends is same-origin.
  `spec/wall.test.ts` checks this; don't add an exception without updating
  both the test and README's "what's enforced" list.
- **Anyone the wall lets in can draw with a keyboard alone.** Every
  pointer gesture in `public/wall.js` has a key path through the same
  state (`spec/wall-client.test.ts`); a new way to draw that only a
  pointer can reach doesn't ship. The served page offers no drawable
  wall: `wall.js` makes it focusable and inviting once it runs, so a slow
  link or a missing script never asks for a mark it can't take.
- **Every hand colour meets WCAG's 3:1 contrast on both light and dark
  backgrounds**, since the colour is all that tells a mark apart.
  `spec/contrast.test.ts` reads `COLOURS` from `src/identity.ts`; change
  the palette there, never around the test.
- **Persistence lives at `DB_PATH`** (the `Dockerfile` sets
  `/data/trace.db`, on `fly.toml`'s volume; `src/db.ts` falls back to
  `./data/` for local runs). Never write app state anywhere else, and never
  assume `/data` is empty --- a redeploy reuses the volume.
  `spec/wall.test.ts` checks the path sits on the mount and that only
  `src/db.ts` opens storage.
- **A mark broadcasts over `/api/marks/stream` the moment it's persisted,
  never before.** `src/server.ts`'s `broadcastMark` runs after `addMark`
  returns, not instead of it --- a hand's mark has to survive a restart
  before any open tab is told about it, so real-time is layered on top of
  persistence, not a substitute for it. `spec/wall.test.ts` checks that a
  fresh request already shows any mark a stream announces.
- **Every hand action logs one `src/log.ts` line naming the hand as
  `name#row`.** Never log the cookie (it's the hand's only credential), an
  IP or a user agent. A new route that changes or refuses something logs it
  too, or the crit can't narrate it (decisions/0003). Log only through
  `logEvent`, which also keeps the line on the volume; a bare
  `console.log` is gone once Fly's buffer moves on. `spec/log.test.ts`
  checks every answer `POST /api/marks` gives logs first, and that
  `formatEvent` redacts any hand id.
- **When a check catches a real mistake, fix the check or the harness too**,
  not just the code once, so the same mistake can't silently ship again.

What the template ships is explained where it lives --- `fly.toml`, the
`Dockerfile`, the CI workflow and `spec/README.md` each say what they fix ---
and the course website publishes the
[final project brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/).

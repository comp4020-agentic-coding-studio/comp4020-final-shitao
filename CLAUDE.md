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
  outlives the cookie.
- **The one-mark-a-day limit is enforced in `src/db.ts`, not the client.**
  The drawing UI can hide the button after a mark lands, but the server must
  independently refuse a second `POST /api/marks` from the same hand within
  24 hours of its last mark (a rolling window, never a calendar day) even if
  the client is a bare `curl`.
- **No third-party requests.** No analytics, no CDN-hosted fonts or scripts,
  no embeds. Every `<script>` and `<link>` the server sends is same-origin.
  `spec/wall.test.ts` checks this; don't add an exception without updating
  both the test and README's "what's enforced" list.
- **Persistence lives at `DB_PATH` (default `/data/trace.db`, matching
  `fly.toml`'s volume).** Never write app state anywhere else, and never
  assume `/data` is empty --- a redeploy reuses the volume.
- **A mark broadcasts over `/api/marks/stream` the moment it's persisted,
  never before.** `src/server.ts`'s `broadcastMark` runs after `addMark`
  returns, not instead of it --- a hand's mark has to survive a restart
  before any open tab is told about it, so real-time is layered on top of
  persistence, not a substitute for it.
- **When a check catches a real mistake, fix the check or the harness too**,
  not just the code once, so the same mistake can't silently ship again.

What the template ships is explained where it lives --- `fly.toml`, the
`Dockerfile`, the CI workflow and `spec/README.md` each say what they fix ---
and the course website publishes the
[final project brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/).

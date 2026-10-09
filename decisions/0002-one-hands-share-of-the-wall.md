# 2. One hand's mark gets a fixed amount of ink

Status: accepted, October 2026, for crit 9 ("All at once").

## Context

The README's case for one mark a day is that "a wall that everyone can
flood stops being a wall anyone wants to add to". With several people on
the wall at once, every hand is drawing in the same small space. But a
day's one mark could be any size. By 9 October the live wall had 27 marks.
Most ran to a few hundred viewBox units of path, and the longest ordinary
one to about 1,700. Then there were two floods. One stroke crossed the wall
corner to corner several times (about 6,100 units), and one 774-point
scribble (about 34,600) covered roughly a third of the wall on its own.
Nothing refused either: the only limit was `PATH_RE`'s 2,000 segments,
which caps the request size, not how much wall a mark covers.

## Options

1. **One mark a day is enough.** No code. But one hand at a crit can blot
   out the patch four others were about to draw in, and the limit that's
   meant to stop flooding doesn't.
2. **Cap the number of points.** Already there, and the wrong measure.
   Three points can cross the wall, and a slow scribble earns more points
   than a quick one for the same ink.
3. **Cap the area a mark spans** (its bounding box). This refuses a single
   sweep from edge to edge, which is a perfectly good gesture and hides
   almost nothing. A dense scribble inside a small box still gets through.
4. **Let marks fade, or let later marks wear older ones away.** A flood
   would pass, but so would everything else. The wall "never resets", and
   coming back to find your trace still there is the promise.
5. **Cap the ink: a mark's total path length.** It measures what a hand
   actually lays down, the same whether it sweeps or scribbles.

## Decision

Option 5, at 2,500 viewBox units, about two and a half times across the
wall. Every mark on the live wall fit inside that except the two floods.
`src/ink.ts` holds the number and the measure. `src/server.ts` refuses a
mark over it, whatever sent it. `pages.ts` passes the number to `wall.js`,
which stops the stroke growing when the ink runs out and says so once in
the status line, the same way it handles the point cap. Lifting the
finger posts what's there, so running dry never costs a hand its mark.

## What it costs

- **No shading, no filling.** A hand that wanted to colour a patch in
  can't. That is the point, and some people at a crit will miss it.
- **Writing runs out fast.** On a portrait phone the wall is 344 CSS px
  wide, so the ink is about 860 px of finger travel. That's enough for a
  figure or a flourish, not a sentence. Since a mark is "a gesture, not a
  post", I'm comfortable with that, but it's a choice.
- **The two floods stay.** The cap only refuses new marks. Removing old
  ones would break the promise option 4 broke, so the wall carries them.
- **Length isn't coverage.** A 2,500-unit scribble packed into one corner
  still blots that corner. It just can't blot a third of the wall.
- **Two copies of the rule.** The server's check is the rule. The
  client's is a courtesy, and it only stays in step because the page
  hands it the server's number.

## How it's checked

`spec/wall.test.ts` posts a path three times across the wall (refused,
and not on the wall afterwards) and one twice across (kept).
`spec/wall-client.test.ts` scribbles back and forth with a small budget
and checks the stroke stops at the last point it could afford, stays
stopped, and posts once; it fails against the `wall.js` from before this
change. In a real browser at 390×844 I scribbled across the wall eight
times. The stroke stopped partway through the third pass, the status line
said why, and lifting the finger added the mark.

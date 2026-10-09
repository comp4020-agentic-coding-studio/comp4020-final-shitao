// How much wall one mark may cover, as the length of its path in viewBox
// units (decisions/0002). Every mark on the live wall when this was set fit
// inside it bar two scribbles, the longer of which ran to about 34,600.
export const MAX_INK = 2500;

// The path's length, summed segment by segment. Expects a path that already
// matched server.ts's PATH_RE: an "M" then "L" points, space-separated.
export function inkLength(path: string): number {
  const points = path.split(" ").map((p) => p.slice(1).split(",").map(Number));
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return length;
}

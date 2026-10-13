// One line per thing a hand does, to stdout, where `flyctl logs` reads it,
// and to the volume's `events` table, where `node src/events.ts` reads it
// once Fly's buffer has moved on.
// A hand appears as its stored name plus its row number (`quiet-sparrow#12`):
// a hundred names across every hand collide, the row number doesn't, and
// neither is the cookie. The cookie is the hand's only credential, so it
// never reaches a log line, and nor does an IP or user agent
// (decisions/0003).

import { recordEvent } from "./db.ts";

export type Fields = Record<string, string | number | boolean | undefined>;

// logfmt: `event key=value ...`, quoting any value with a space or quote in it.
export function formatEvent(event: string, fields: Fields): string {
  const parts = [event];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const s = String(value);
    parts.push(`${key}=${/[\s"=]/.test(s) || s === "" ? JSON.stringify(s) : s}`);
  }
  return parts.join(" ");
}

export function logEvent(event: string, fields: Fields = {}): void {
  const line = formatEvent(event, fields);
  console.log(line);
  // A failing write mustn't take the request (or, from the error handler,
  // the process) down with it; stdout already has the line.
  try {
    recordEvent(line);
  } catch (err) {
    console.error("could not keep log line:", err);
  }
}

export function handLabel(hand: { name: string; n: number } | undefined): string {
  return hand ? `${hand.name}#${hand.n}` : "none";
}

// Where on the 1000x600 wall a mark sits, as a ninth of it (`top-left`,
// `middle`): enough for a narrator to point at the stroke a log line means
// when two hands share a colour. Takes a path that matched PATH_RE.
export function placeOf(path: string): string {
  const points = path.split(" ").map((p) => p.slice(1).split(",").map(Number));
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2;
  const y = (Math.min(...ys) + Math.max(...ys)) / 2;
  const row = y < 200 ? "top" : y < 400 ? "" : "bottom";
  const col = x < 333 ? "left" : x < 667 ? "" : "right";
  return [row, col].filter(Boolean).join("-") || "middle";
}

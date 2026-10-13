// Prints the log lines kept on the volume, newest last, for when Fly's own
// buffer has moved on:
//
//   flyctl ssh console -a comp4020-final-shitao -C "node src/events.ts 200 mark.refused"
//
// The first argument is how many lines (default 100), the second keeps only
// lines containing it.
import { recentEvents } from "./db.ts";

const limit = Number(process.argv[2] ?? 100);
const filter = process.argv[3];
const events = recentEvents(filter ? 100_000 : limit)
  .filter((e) => !filter || e.line.includes(filter))
  .slice(-limit);
for (const e of events) console.log(`${new Date(e.at).toISOString()} ${e.line}`);

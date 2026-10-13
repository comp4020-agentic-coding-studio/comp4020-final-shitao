import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";

// Fly's log buffer moves on within hours, and the crit spec wants logging
// that outlives the crit, so every line is also kept on the volume. This
// drives it against a scratch database, as day.test.ts does.
process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), "trace-events-")), "trace.db");
const { recentEvents } = await import("../src/db.ts");
const { logEvent } = await import("../src/log.ts");

it("keeps every logged line, oldest first", () => {
  logEvent("hand.new", { hand: "quiet-heron#1", colour: "teal" });
  logEvent("mark.add", { hand: "quiet-heron#1", mark: 1 });
  expect(recentEvents(10).map((e) => e.line)).toEqual([
    "hand.new hand=quiet-heron#1 colour=teal",
    "mark.add hand=quiet-heron#1 mark=1",
  ]);
  expect(recentEvents(1).map((e) => e.line)).toEqual(["mark.add hand=quiet-heron#1 mark=1"]);
});

it("prints kept lines, filtered, from the command the README names", () => {
  logEvent("mark.refused", { hand: "bold-maple#2", reason: "too-soon" });
  const out = execFileSync("node", ["src/events.ts", "5", "mark.refused"], {
    env: { ...process.env },
    encoding: "utf8",
  });
  expect(out.trim().split("\n")).toHaveLength(1);
  expect(out).toMatch(/^\d{4}-\d\d-\d\dT\S+Z mark\.refused hand=bold-maple#2 reason=too-soon$/m);
});

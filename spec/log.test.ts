import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { colourWord } from "../src/identity.ts";
import { formatEvent, handLabel, placeOf } from "../src/log.ts";

// The crit narrates from these lines alone, so each has to read as one event
// with unambiguous fields, and must never carry the cookie that is a hand's
// only credential (decisions/0003).

it("writes one logfmt line, dropping fields that don't apply", () => {
  expect(formatEvent("mark.add", { hand: "quiet-heron#3", mark: 7, can_mark: false, skip: undefined })).toBe(
    "mark.add hand=quiet-heron#3 mark=7 can_mark=false",
  );
});

it("quotes a value that would otherwise split into another field", () => {
  expect(formatEvent("error", { message: 'Error: body too large="x"', path: "" })).toBe(
    'error message="Error: body too large=\\"x\\"" path=""',
  );
});

it("names a hand by its name and row number, never its cookie id", () => {
  const id = "0b9e5c1e-4c1f-4e0b-9a51-3c2d8f7e6a10";
  const label = handLabel({ id, name: "idle-orchard", n: 7 } as { name: string; n: number });
  expect(label).toBe("idle-orchard#7");
  expect(label).not.toContain(id.slice(0, 8));
  expect(handLabel(undefined)).toBe("none");
});

it("places a mark by the ninth of the wall its middle falls in", () => {
  expect(placeOf("M20,30 L120,90")).toBe("top-left");
  expect(placeOf("M480,280 L520,320")).toBe("middle");
  expect(placeOf("M900,500 L980,590")).toBe("bottom-right");
  expect(placeOf("M450,20 L550,60 L500,100")).toBe("top");
});

it("gives every palette colour a distinct word a narrator can say aloud", () => {
  const source = readFileSync("src/identity.ts", "utf8");
  const palette = source.match(/const COLOURS = \[([\s\S]*?)\];/)?.[1] ?? "";
  const hexes = [...palette.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0]);
  const words = hexes.map(colourWord);
  expect(hexes.length).toBeGreaterThan(0);
  for (const word of words) expect(word).toMatch(/^[a-z]+$/);
  expect(new Set(words).size).toBe(words.length);
});

// CLAUDE.md: every hand action logs one line through `logEvent`, and a route
// that changes or refuses something logs that too. Each branch of a
// state-changing handler ends in `return;`, so every branch that answers the
// request has to log before it does.
it("logs every answer the mark route gives, through logEvent alone", () => {
  const server = readFileSync("src/server.ts", "utf8");
  const start = server.indexOf('req.method === "POST" && url.pathname === "/api/marks"');
  const end = server.indexOf("res.writeHead(404", start);
  expect(start, "POST /api/marks handler").toBeGreaterThan(-1);
  const branches = server.slice(start, end).split("return;").filter((b) => b.includes("writeHead("));
  expect(branches.length).toBeGreaterThanOrEqual(5);
  for (const branch of branches) {
    const status = branch.match(/writeHead\((\d+)/)?.[1];
    expect(branch, `the ${status} answer`).toContain("logEvent(");
  }

  // stdout outside logEvent never reaches the volume (decisions/0003); the
  // startup line and the `events.ts` reader are the only exceptions.
  const bare = server.split("\n").filter((l) => /console\.log\(/.test(l) && !l.includes("Trace listening"));
  expect(bare).toEqual([]);
});

// A hand's cookie is its id, a UUID, and its only credential. Whatever a
// future call passes, formatEvent never writes one out.
it("redacts a hand id or cookie wherever a log line would carry it", () => {
  const id = "0b9e5c1e-4c1f-4e0b-9a51-3c2d8f7e6a10";
  const line = formatEvent("error", { hand: id, message: `bad cookie hand=${id.toUpperCase()}; x=1` });
  expect(line).not.toMatch(/0b9e5c1e/i);
  expect(line).toContain("hand=uuid");
});

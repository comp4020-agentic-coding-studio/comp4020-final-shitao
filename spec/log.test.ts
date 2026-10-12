import { expect, it } from "vitest";
import { formatEvent, handLabel } from "../src/log.ts";

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

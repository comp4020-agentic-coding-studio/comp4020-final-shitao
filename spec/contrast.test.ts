import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A hand's colour is the only thing that distinguishes its marks, and
// under `color-scheme: light dark` a mark is drawn on style.css's light or
// dark ground, whichever the visitor's system prefers. WCAG 1.4.11's 3:1
// non-text contrast applies to a drawn stroke. Reads the palette out of
// identity.ts and the ground out of style.css, so an edit to either is
// caught here.
const source = readFileSync(new URL("../src/identity.ts", import.meta.url), "utf8");
const match = source.match(/const COLOURS = \[([\s\S]*?)\];/);
if (!match) throw new Error("couldn't find COLOURS in identity.ts");
const COLOURS = [...match[1].matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0]);

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hex: string, otherLuminance: number): number {
  const l1 = luminance(hex);
  const [hi, lo] = l1 > otherLuminance ? [l1, otherLuminance] : [otherLuminance, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// The ground is style.css's own, not an assumed white and black: a
// browser's dark Canvas is lighter than black and fails colours that pass
// against it.
const css = readFileSync(new URL("../public/style.css", import.meta.url), "utf8");
const ground = css.match(/--ground:\s*light-dark\((#[0-9a-fA-F]{6}),\s*(#[0-9a-fA-F]{6})\)/);
if (!ground) throw new Error("couldn't find --ground in style.css");
const [, LIGHT, DARK] = ground;
const WHITE_L = luminance(LIGHT);
const BLACK_L = luminance(DARK);

describe("hand palette vs WCAG 1.4.11's 3:1 non-text contrast", () => {
  it("the palette isn't empty", () => {
    expect(COLOURS.length).toBeGreaterThan(0);
  });

  for (const hex of COLOURS) {
    it(`${hex} reads against the light ground`, () => {
      expect(contrast(hex, WHITE_L)).toBeGreaterThanOrEqual(3);
    });

    it(`${hex} reads against the dark ground`, () => {
      expect(contrast(hex, BLACK_L)).toBeGreaterThanOrEqual(3);
    });
  }
});

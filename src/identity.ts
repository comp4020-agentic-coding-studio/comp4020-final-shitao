import { randomUUID } from "node:crypto";

// A hand's name and colour are derived once, at creation, and stored --- not
// recomputed from the id --- so they stay stable even if these lists change.
const ADJECTIVES = [
  "quiet",
  "steady",
  "quick",
  "idle",
  "careful",
  "restless",
  "gentle",
  "bold",
  "patient",
  "curious",
];
const NOUNS = [
  "sparrow",
  "willow",
  "lantern",
  "creek",
  "ember",
  "pebble",
  "heron",
  "maple",
  "harbour",
  "orchard",
];
// Distinct hues, each lightness-adjusted (hue/saturation kept) so every
// colour clears WCAG 1.4.11's 3:1 non-text contrast against *both* a white
// and a black background --- `color-scheme: light dark` means a mark's
// stroke has to read against either, depending on the visitor's own system
// preference, not just the one a screenshot happens to be taken against.
// `spec/contrast.test.ts` checks this against the literal values below.
const COLOURS = [
  "#cc4a28",
  "#5177aa",
  "#4e8067",
  "#a06a13",
  "#9d4edd",
  "#457b9d",
  "#e63946",
  "#2a9d8f",
  "#bb5a0d",
  "#6d597a",
];

function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

export function newHandId(): string {
  return randomUUID();
}

export function nameFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `${pick(ADJECTIVES, hash)}-${pick(NOUNS, hash >>> 8)}`;
}

export function colourFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 17 + ch.charCodeAt(0)) >>> 0;
  return pick(COLOURS, hash >>> 4);
}

const COOKIE_NAME = "hand";
const YEAR_SECONDS = 60 * 60 * 24 * 365;

export function parseHandCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === COOKIE_NAME) return rest.join("=");
  }
  return undefined;
}

export function setHandCookie(id: string, secure: boolean): string {
  const attrs = [
    `${COOKIE_NAME}=${id}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${YEAR_SECONDS}`,
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

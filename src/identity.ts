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
// Distinct hues, not tuned for contrast against any one background --- the
// wall itself decides that.
const COLOURS = [
  "#e07a5f",
  "#3d5a80",
  "#81b29a",
  "#f2cc8f",
  "#9d4edd",
  "#457b9d",
  "#e63946",
  "#2a9d8f",
  "#f4a261",
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

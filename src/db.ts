import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export interface Hand {
  id: string;
  name: string;
  colour: string;
  created_at: number;
}

export interface Mark {
  id: number;
  hand_id: string;
  path: string;
  colour: string;
  created_at: number;
}

const dbPath = process.env.DB_PATH ?? "./data/trace.db";
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS hands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    colour TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hand_id TEXT NOT NULL REFERENCES hands(id),
    path TEXT NOT NULL,
    colour TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

const insertHandStmt = db.prepare(
  "INSERT INTO hands (id, name, colour, created_at) VALUES (?, ?, ?, ?)",
);
const getHandStmt = db.prepare("SELECT * FROM hands WHERE id = ?");
const insertMarkStmt = db.prepare(
  "INSERT INTO marks (hand_id, path, colour, created_at) VALUES (?, ?, ?, ?)",
);
const allMarksStmt = db.prepare("SELECT * FROM marks ORDER BY created_at ASC");
const marksTodayStmt = db.prepare(
  "SELECT COUNT(*) as n FROM marks WHERE hand_id = ? AND created_at >= ?",
);

export function getHand(id: string): Hand | undefined {
  return getHandStmt.get(id) as unknown as Hand | undefined;
}

export function createHand(id: string, name: string, colour: string): Hand {
  const created_at = Date.now();
  insertHandStmt.run(id, name, colour, created_at);
  return { id, name, colour, created_at };
}

export function allMarks(): Mark[] {
  return allMarksStmt.all() as unknown as Mark[];
}

// "A day" is the UTC calendar day, so the one-mark limit doesn't depend on
// where a hand happens to be.
function startOfUtcDay(now: number): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function hasMarkedToday(handId: string, now = Date.now()): boolean {
  const row = marksTodayStmt.get(handId, startOfUtcDay(now)) as unknown as { n: number };
  return row.n > 0;
}

export function addMark(handId: string, path: string, colour: string): Mark {
  const created_at = Date.now();
  const result = insertMarkStmt.run(handId, path, colour, created_at);
  return { id: Number(result.lastInsertRowid), hand_id: handId, path, colour, created_at };
}

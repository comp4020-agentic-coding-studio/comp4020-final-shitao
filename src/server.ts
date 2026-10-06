import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import {
  addMark,
  allMarks,
  createHand,
  getHand,
  marksSince,
  msUntilNextMark,
  type Mark,
} from "./db.ts";
import { colourFor, nameFor, newHandId, parseHandCookie, setHandCookie } from "./identity.ts";
import { readmePage, untilPhrase, wallPage } from "./pages.ts";

const PORT = Number(process.env.PORT ?? 8080);
// Fly's proxy terminates TLS and forwards plain http; FLY_APP_NAME is only
// set on a real Fly machine, so it's a reliable stand-in for "the browser's
// connection is actually https" without trusting a header the app can't verify.
const isProd = Boolean(process.env.FLY_APP_NAME);

const STATIC_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 100_000) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// One "M" then one or more "L" segments, in the viewBox's integer-ish
// coordinate space --- exactly what public/wall.js emits. Capped at 2000
// points so a hand-rolled request can't post an arbitrarily large stroke.
const PATH_RE = /^M-?\d+(\.\d+)?,-?\d+(\.\d+)?(\sL-?\d+(\.\d+)?,-?\d+(\.\d+)?){1,2000}$/;

interface HandInfo {
  id: string;
  colour: string;
}

function ensureHand(req: IncomingMessage, res: ServerResponse): HandInfo {
  const existing = parseHandCookie(req.headers.cookie);
  const found = existing ? getHand(existing) : undefined;
  if (found) return { id: found.id, colour: found.colour };

  const id = newHandId();
  const hand = createHand(id, nameFor(id), colourFor(id));
  res.setHeader("Set-Cookie", setHandCookie(id, isProd));
  return { id: hand.id, colour: hand.colour };
}

// The real-time layer: every open tab holds one of these open, and a mark
// lands in all of them (this one included --- wall.js tells its own gesture
// apart from the echo by the nonce it posted, not by asking the server to
// skip it) the moment `addMark` commits. A plain in-memory Set is enough
// because fly.toml runs exactly one machine --- there's no cross-machine
// fan-out to build.
interface SseClient {
  res: ServerResponse;
  handId: string | undefined;
  heartbeat: ReturnType<typeof setInterval>;
}

const sseClients = new Set<SseClient>();

// Each event carries the mark's row id as its SSE `id:`, so a reconnecting
// EventSource sends it back as Last-Event-ID and gets exactly what it missed
// (decisions/0001). `mine` goes only to connections whose own cookie drew the
// mark, so a hand's second tab can paint it as theirs without a hand id ever
// leaving the server.
function markEvent(mark: Mark, handId: string | undefined, nonce?: string): string {
  const payload = JSON.stringify({
    id: mark.id,
    path: mark.path,
    colour: mark.colour,
    mine: mark.hand_id === handId,
    nonce,
  });
  return `id: ${mark.id}\nevent: mark\ndata: ${payload}\n\n`;
}

function broadcastMark(mark: Mark, nonce?: string): void {
  for (const client of sseClients) {
    client.res.write(markEvent(mark, client.handId, nonce));
  }
}

// Where a stream should resume: the browser's own Last-Event-ID on a
// reconnect, else the `since` the page was rendered with on first connect
// (EventSource can't set the header itself). With neither, it's live only.
function resumeFrom(req: IncomingMessage, url: URL): number | undefined {
  const raw = req.headers["last-event-id"] ?? url.searchParams.get("since");
  const n = Number(raw);
  return typeof raw === "string" && raw !== "" && Number.isSafeInteger(n) && n >= 0
    ? n
    : undefined;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (req.method === "GET" && url.pathname === "/") {
      const hand = ensureHand(req, res);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(wallPage(allMarks(), hand, msUntilNextMark(hand.id)));
      return;
    }

    if (req.method === "GET" && url.pathname === "/readme/") {
      const readme = readFileSync("README.md", "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(readmePage(readme));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/marks/stream") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(": connected\n\n");
      const handId = parseHandCookie(req.headers.cookie);
      // Replay and subscribe in the same synchronous turn, so no mark can
      // land between them and be either missed or sent twice.
      const since = resumeFrom(req, url);
      if (since !== undefined) {
        for (const mark of marksSince(since)) res.write(markEvent(mark, handId));
      }
      // Fly's proxy (and some browsers) will drop an idle connection; a
      // comment line every 20s is invisible to EventSource but keeps it open.
      const heartbeat = setInterval(() => res.write(": ping\n\n"), 20_000);
      const client: SseClient = { res, handId, heartbeat };
      sseClients.add(client);
      req.on("close", () => {
        clearInterval(heartbeat);
        sseClients.delete(client);
      });
      return;
    }

    if (req.method === "GET" && (url.pathname === "/style.css" || url.pathname === "/wall.js")) {
      const filePath = join("public", url.pathname);
      const type = STATIC_TYPES[extname(filePath)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
      res.end(readFileSync(filePath));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/marks") {
      const hand = ensureHand(req, res);

      const raw = await readBody(req);
      let path: unknown;
      let nonce: unknown;
      try {
        const body = JSON.parse(raw) as { path?: unknown; nonce?: unknown };
        path = body.path;
        nonce = body.nonce;
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Malformed request.");
        return;
      }

      if (typeof path !== "string" || !PATH_RE.test(path)) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("That doesn't look like a mark.");
        return;
      }
      // An opaque, client-chosen token so a tab can recognise its own mark
      // coming back over SSE --- never stored, never rendered, just echoed.
      // Comparing path *content* instead (the previous approach) breaks the
      // moment two hands draw the same short stroke, which rounded,
      // low-point-count coordinates make a real possibility, not a
      // hypothetical one.
      const markNonce = typeof nonce === "string" && nonce.length <= 200 ? nonce : undefined;

      // The check has to be the last thing before the insert, with no
      // `await` between them: a client that holds its request body open
      // (a slow POST, or just a second tab) can otherwise pass this check
      // before either request has inserted, and post twice in one day.
      // node:sqlite's DatabaseSync is fully synchronous, so once nothing
      // separates the two, nothing can interleave here.
      const wait = msUntilNextMark(hand.id);
      if (wait > 0) {
        res.writeHead(429, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Your mark is already on the wall. You can add another ${untilPhrase(wait)}.`);
        return;
      }

      const mark = addMark(hand.id, path, hand.colour);
      broadcastMark(mark, markNonce);
      // The id lets wall.js recognise this mark if a reconnect replays it
      // without the nonce, which is never stored.
      res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ id: mark.id }));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found.");
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Something went wrong.");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Trace listening on 0.0.0.0:${PORT}`);
});

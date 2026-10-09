import { JSDOM } from "jsdom";
import { expect, inject, it } from "vitest";
import net from "node:net";

// Trace's own promises, from README.md's "what's enforced" list: a
// first-time visitor gets a hand, a mark they draw shows up and survives a
// fresh request, a hand can't draw twice in one day, and the page carries no
// third-party request.
const baseUrl = inject("baseUrl");

function cookieFrom(res: Response): string {
  const raw = res.headers.get("set-cookie");
  expect(raw, "expected a Set-Cookie header on a first visit").toBeTruthy();
  return raw!.split(";")[0];
}

it("gives a first-time visitor a hand cookie", async () => {
  const res = await fetch(new URL("/", baseUrl));
  expect(res.status).toBe(200);
  const cookie = cookieFrom(res);
  expect(cookie).toMatch(/^hand=[0-9a-f-]{36}$/);
});

it("a hand's mark appears on the wall and survives a fresh request", async () => {
  const first = await fetch(new URL("/", baseUrl));
  const cookie = cookieFrom(first);

  const path = "M1,2 L3,4 L5,6";
  const post = await fetch(new URL("/api/marks", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ path }),
  });
  expect(post.status).toBe(201);

  // A completely fresh request (same cookie, new fetch) --- not just reading
  // back the POST's own response --- so this actually checks persistence.
  const after = await fetch(new URL("/", baseUrl), { headers: { Cookie: cookie } });
  const html = await after.text();
  expect(html).toContain(path);
});

it("a returning hand can tell its own mark from everyone else's", async () => {
  const mine = cookieFrom(await fetch(new URL("/", baseUrl)));
  const other = cookieFrom(await fetch(new URL("/", baseUrl)));

  // Unique per run: the app under test keeps its database between runs, and
  // an identical path drawn by an earlier run's hand would match first.
  const path = `M1.${Date.now() % 100_000},12 L13,14 L15,16`;
  const post = await fetch(new URL("/api/marks", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: mine },
    body: JSON.stringify({ path }),
  });
  expect(post.status).toBe(201);
  // A later mark from someone else, so painting in time order would bury this one.
  const later = await fetch(new URL("/api/marks", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: other },
    body: JSON.stringify({ path: `M1.${Date.now() % 100_000},20 L21,22` }),
  });
  expect(later.status).toBe(201);

  const strokeFor = async (cookie: string) => {
    const html = await (await fetch(new URL("/", baseUrl), { headers: { Cookie: cookie } })).text();
    const svg = new JSDOM(html).window.document.getElementById("wall")!;
    const strokes = [...svg.querySelectorAll("path")];
    return {
      ownMark: strokes.find((p) => p.getAttribute("d") === path && p.classList.contains("mine")),
      // On a busy wall, later marks would bury it unless it's painted last.
      paintedLast: strokes.at(-1)?.getAttribute("d") === path,
      anyMatch: strokes.some((p) => p.getAttribute("d") === path),
    };
  };

  const asMine = await strokeFor(mine);
  expect(asMine.ownMark).toBeDefined();
  expect(asMine.paintedLast).toBe(true);
  const asOther = await strokeFor(other);
  expect(asOther.anyMatch).toBe(true);
  expect(asOther.ownMark).toBeUndefined();
});

it("refuses a second mark from the same hand on the same day", async () => {
  const first = await fetch(new URL("/", baseUrl));
  const cookie = cookieFrom(first);

  const post = (path: string) =>
    fetch(new URL("/api/marks", baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ path }),
    });

  expect((await post("M1,1 L2,2")).status).toBe(201);
  const refused = await post("M9,9 L8,8");
  expect(refused.status).toBe(429);
  // wall.js waits this long before offering the hand a mark again.
  const retryAfter = Number(refused.headers.get("Retry-After"));
  expect(retryAfter).toBeGreaterThan(24 * 60 * 60 - 60);
  expect(retryAfter).toBeLessThanOrEqual(24 * 60 * 60);
});

it("refuses a same-day double mark even when one request's body is slow to arrive", async () => {
  // A plain sequential double-POST (above) can't catch a check-then-insert
  // race: the server has to actually be mid-way through one request's body
  // when the other's completes. Held-open connection A proves the window is
  // closed by deliberately finishing B first while A's body is still en
  // route --- the shape a slow network or a second tab genuinely produces.
  const first = await fetch(new URL("/", baseUrl));
  const cookie = cookieFrom(first);
  const { hostname, port } = new URL(baseUrl);

  const connect = (): Promise<net.Socket> =>
    new Promise((resolve, reject) => {
      const sock = net.connect(Number(port), hostname, () => resolve(sock));
      sock.on("error", reject);
    });

  const readStatus = (sock: net.Socket): Promise<string> =>
    new Promise((resolve) => {
      let data = "";
      sock.on("data", (chunk: Buffer) => {
        data += chunk.toString();
        if (data.includes("\r\n\r\n")) {
          resolve(data.split(" ")[1]);
          sock.destroy();
        }
      });
    });

  const headers = (contentLength: number) =>
    `POST /api/marks HTTP/1.1\r\nHost: ${hostname}\r\nContent-Type: application/json\r\n` +
    `Cookie: ${cookie}\r\nContent-Length: ${contentLength}\r\nConnection: close\r\n\r\n`;

  const bodyA = JSON.stringify({ path: "M1,3 L2,4" });
  const bodyB = JSON.stringify({ path: "M5,6 L7,8" });

  const [sockA, sockB] = await Promise.all([connect(), connect()]);
  const statusA = readStatus(sockA);
  const statusB = readStatus(sockB);

  sockA.write(headers(Buffer.byteLength(bodyA)));
  await new Promise((resolve) => setTimeout(resolve, 50));
  sockB.write(headers(Buffer.byteLength(bodyB)) + bodyB);
  expect(await statusB).toBe("201");

  sockA.write(bodyA);
  expect(await statusA).toBe("429");
});

it("rejects a mark that isn't a plain stroke path", async () => {
  const first = await fetch(new URL("/", baseUrl));
  const cookie = cookieFrom(first);

  const res = await fetch(new URL("/api/marks", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ path: "<script>alert(1)</script>" }),
  });
  expect(res.status).toBe(400);
});

it("refuses a mark that uses more ink than a mark gets, and keeps one that doesn't", async () => {
  const post = async (path: string) => {
    const cookie = cookieFrom(await fetch(new URL("/", baseUrl)));
    return fetch(new URL("/api/marks", baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ path }),
    });
  };
  // Three times across the wall's width is 2,700 units of ink, over
  // src/ink.ts's 2,500; twice across is 1,800, under it.
  const flood = "M50,300 L950,300 L50,300 L950,300";
  const refused = await post(flood);
  expect(refused.status).toBe(400);
  expect(await (await fetch(new URL("/", baseUrl))).text()).not.toContain(flood);

  const kept = await post("M50,310 L950,310 L50,310");
  expect(kept.status).toBe(201);
});

interface MarkEvent {
  id: number;
  path: string;
  colour: string;
  mine: boolean;
}

// Opens /api/marks/stream and hands back its mark events one at a time, each
// with the SSE `id:` it carried alongside the JSON payload.
async function openStream(query = "", headers: Record<string, string> = {}) {
  const controller = new AbortController();
  const stream = await fetch(new URL(`/api/marks/stream${query}`, baseUrl), {
    signal: controller.signal,
    headers,
  });
  expect(stream.headers.get("content-type")).toMatch(/text\/event-stream/);

  const reader = stream.body!.getReader();
  const decoder = new TextDecoder();
  let buffered = "";

  const read = async (): Promise<MarkEvent & { eventId: string }> => {
    for (;;) {
      const boundary = buffered.indexOf("\n\n");
      if (boundary !== -1) {
        const lines = buffered.slice(0, boundary).split("\n");
        buffered = buffered.slice(boundary + 2);
        if (lines.includes("event: mark")) {
          const field = (name: string) =>
            lines.find((l) => l.startsWith(`${name}: `))!.slice(name.length + 2);
          return { ...JSON.parse(field("data")), eventId: field("id") };
        }
        continue;
      }
      const { value, done } = await reader.read();
      if (done) throw new Error("stream closed before a mark event arrived");
      buffered += decoder.decode(value, { stream: true });
    }
  };
  const next = () =>
    Promise.race([
      read(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("no mark event within 3s")), 3000),
      ),
    ]);
  return { next, close: () => controller.abort() };
}

async function postMark(cookie: string, path: string): Promise<number> {
  const res = await fetch(new URL("/api/marks", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ path }),
  });
  expect(res.status).toBe(201);
  return ((await res.json()) as { id: number }).id;
}

it("broadcasts a new mark over /api/marks/stream within a second", async () => {
  const stream = await openStream();
  const cookie = cookieFrom(await fetch(new URL("/", baseUrl)));
  const path = "M11,12 L13,14";

  const [event] = await Promise.all([stream.next(), postMark(cookie, path)]);

  expect(event.path).toBe(path);
  stream.close();
});

it("replays the marks a reconnecting tab missed, from its Last-Event-ID", async () => {
  // decisions/0001: a dropped stream (a locked phone, a redeploy) comes back
  // with exactly what landed while it was gone, in order, and nothing twice.
  const a = cookieFrom(await fetch(new URL("/", baseUrl)));
  const b = cookieFrom(await fetch(new URL("/", baseUrl)));
  const first = await postMark(a, `M1.${Date.now() % 100_000},30 L31,32`);
  const second = await postMark(b, `M1.${Date.now() % 100_000},33 L34,35`);

  const stream = await openStream("", { "Last-Event-ID": String(first - 1) });
  const replayed = [await stream.next(), await stream.next()];
  expect(replayed.map((m) => m.id)).toEqual([first, second]);
  expect(replayed.map((m) => m.eventId)).toEqual([String(first), String(second)]);
  stream.close();
});

it("first connects from the last mark the page rendered, so nothing lands in between", async () => {
  const cookie = cookieFrom(await fetch(new URL("/", baseUrl)));
  const html = await (await fetch(new URL("/", baseUrl), { headers: { Cookie: cookie } })).text();
  const since = new JSDOM(html).window.document.querySelector("script[data-since]")!.getAttribute(
    "data-since",
  );

  // Lands after the render but before this stream exists.
  const id = await postMark(cookie, `M1.${Date.now() % 100_000},40 L41,42`);
  const stream = await openStream(`?since=${since}`);
  const replayed = [];
  for (;;) {
    const event = await stream.next();
    replayed.push(event.id);
    if (event.id === id) break;
  }
  expect(replayed.at(-1)).toBe(id);
  stream.close();
});

it("tells only the drawing hand's own streams that a mark is theirs", async () => {
  const mine = cookieFrom(await fetch(new URL("/", baseUrl)));
  const other = cookieFrom(await fetch(new URL("/", baseUrl)));
  const asMine = await openStream("", { Cookie: mine });
  const asOther = await openStream("", { Cookie: other });

  const [toMine, toOther] = await Promise.all([
    asMine.next(),
    asOther.next(),
    postMark(mine, `M1.${Date.now() % 100_000},50 L51,52`),
  ]);
  expect(toMine.mine).toBe(true);
  expect(toOther.mine).toBe(false);
  asMine.close();
  asOther.close();
});

it("ships no third-party script or stylesheet", async () => {
  const res = await fetch(new URL("/", baseUrl));
  const dom = new JSDOM(await res.text());
  const srcs = [...dom.window.document.querySelectorAll("script[src], link[rel=stylesheet]")].map(
    (el) => el.getAttribute("src") ?? el.getAttribute("href") ?? "",
  );
  expect(srcs.length).toBeGreaterThan(0);
  for (const src of srcs) {
    expect(src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")).toBe(
      false,
    );
  }
});

it("announces what happens to a mark to assistive technology", async () => {
  // wall.js rewrites the status line as a mark posts, lands, or is refused;
  // without a live region a screen reader hears none of it.
  const html = await (await fetch(new URL("/", baseUrl))).text();
  const status = new JSDOM(html).window.document.getElementById("status");
  expect(status?.getAttribute("role")).toBe("status");
});

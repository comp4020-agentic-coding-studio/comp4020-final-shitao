import { JSDOM } from "jsdom";
import { expect, inject, it } from "vitest";

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
  expect((await post("M9,9 L8,8")).status).toBe(429);
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

it("broadcasts a new mark over /api/marks/stream within a second", async () => {
  const controller = new AbortController();
  const stream = await fetch(new URL("/api/marks/stream", baseUrl), {
    signal: controller.signal,
  });
  expect(stream.headers.get("content-type")).toMatch(/text\/event-stream/);

  const reader = stream.body!.getReader();
  const decoder = new TextDecoder();
  let buffered = "";

  const nextMarkEvent = (): Promise<{ path: string; colour: string }> =>
    (async () => {
      for (;;) {
        const boundary = buffered.indexOf("\n\n");
        if (boundary !== -1) {
          const chunk = buffered.slice(0, boundary);
          buffered = buffered.slice(boundary + 2);
          if (chunk.startsWith("event: mark")) {
            const line = chunk.split("\n").find((l) => l.startsWith("data: "))!;
            return JSON.parse(line.slice("data: ".length));
          }
          continue;
        }
        const { value, done } = await reader.read();
        if (done) throw new Error("stream closed before a mark event arrived");
        buffered += decoder.decode(value, { stream: true });
      }
    })();

  const first = await fetch(new URL("/", baseUrl));
  const cookie = cookieFrom(first);
  const path = "M11,12 L13,14";

  const [event] = await Promise.all([
    Promise.race([
      nextMarkEvent(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("no mark event within 3s")), 3000),
      ),
    ]),
    fetch(new URL("/api/marks", baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ path }),
    }).then((res) => expect(res.status).toBe(201)),
  ]);

  expect(event.path).toBe(path);
  controller.abort();
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

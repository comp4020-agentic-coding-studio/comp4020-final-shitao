import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

// Every other test in spec/ drives the server over HTTP; none of them execute
// public/wall.js itself, so a client-only bug (like the stuck pointerdown
// listener fixed in 2e59190, where a hand could keep drawing after its mark
// had already landed) has no automated check at all --- only a manual
// agent-browser sequence caught it. This loads the real file into jsdom and
// drives it with synthetic pointer events instead, with fetch/EventSource
// stubbed since there's no server here.
const wallSource = readFileSync("public/wall.js", "utf8");

function buildWall({
  canDraw,
  deferFetch = false,
}: {
  canDraw: boolean;
  deferFetch?: boolean;
}) {
  const dom = new JSDOM(
    `<!doctype html><body>
      <svg id="wall" viewBox="0 0 100 100"></svg>
      <p id="status"></p>
    </body>`,
    { runScripts: "dangerously", url: "http://localhost/" },
  );
  const { window } = dom;
  const svg = window.document.getElementById("wall") as unknown as SVGSVGElement;
  const status = window.document.getElementById("status")!;

  // jsdom has no layout engine (getBoundingClientRect is always zero) and no
  // pointer-capture implementation; stub both so wall.js's own coordinate
  // math and capture call don't blow up on a geometry jsdom never computes.
  (svg as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
  (svg as unknown as { setPointerCapture: (id: number) => void }).setPointerCapture = () => {};

  const posted: { path: string; nonce: string }[] = [];
  // deferFetch lets a test fire the SSE echo for a post while its own fetch
  // promise is still pending --- the exact ordering server.ts's comment
  // warns is possible (broadcast is written to the wire before the POST
  // response is), and the shape that broke the old path-content echo check.
  let resolveFetch: (() => void) | undefined;
  (window as unknown as { fetch: typeof fetch }).fetch = (async (_url, init) => {
    posted.push(JSON.parse((init as RequestInit).body as string));
    if (deferFetch) {
      await new Promise<void>((resolve) => {
        resolveFetch = resolve;
      });
    }
    return new Response(JSON.stringify({ id: posted.length }), { status: 201 });
  }) as typeof fetch;
  // wall.js opens one unconditionally on load; there's no server to answer it,
  // so tests dispatch "mark" events through this stub directly.
  // One stub per stream wall.js opens; tests dispatch "mark" events through
  // the newest one and can drop it the way a dying server does.
  class StubEventSource {
    static CLOSED = 2;
    readyState = 1;
    listeners: Record<string, (evt: { data: string }) => void> = {};
    constructor(public url: string) {
      streams.push(this);
    }
    addEventListener(type: string, listener: (evt: { data: string }) => void) {
      this.listeners[type] = listener;
    }
  }
  const streams: StubEventSource[] = [];
  (window as unknown as { EventSource: unknown }).EventSource = StubEventSource;
  // wall.js's only timer is its reconnect delay; tests run it on demand.
  const timers: (() => void)[] = [];
  (window as unknown as { setTimeout: (fn: () => void) => void }).setTimeout = (fn) => {
    timers.push(fn);
  };

  const script = window.document.createElement("script");
  script.dataset.handColour = "#123456";
  script.dataset.canDraw = String(canDraw);
  script.dataset.since = "41";
  script.textContent = wallSource;
  window.document.body.appendChild(script);

  const gesture = (x: number, y: number, type: string, pointerId = 1) =>
    svg.dispatchEvent(
      new window.PointerEvent(type, { clientX: x, clientY: y, pointerId, bubbles: true }),
    );
  const stroke = (from: number, to: number) => {
    gesture(from, from, "pointerdown");
    gesture(to, to, "pointermove");
    gesture(to + 1, to + 1, "pointerup");
  };
  const key = (k: string) => svg.dispatchEvent(new window.KeyboardEvent("keydown", { key: k }));
  // Enter, one arrow step, Enter: the keyboard-only path through the exact
  // same beginGesture/addPoint/finish a pointer gesture drives.
  const keyboardStroke = () => {
    key("Enter");
    key("ArrowRight");
    key("Enter");
  };
  // Flush the microtask queue fetch's promise chain runs on.
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
  // Marks other hands draw get ids well clear of this tab's own posts' ids.
  let nextId = 1000;
  const emitMark = (mark: {
    id?: number;
    path: string;
    colour: string;
    mine?: boolean;
    nonce?: string;
  }) => streams.at(-1)!.listeners.mark({ data: JSON.stringify({ id: nextId++, ...mark }) });
  const dropStream = () => {
    const stream = streams.at(-1)!;
    stream.readyState = StubEventSource.CLOSED;
    stream.listeners.error({ data: "" });
  };
  const runTimers = () => timers.splice(0).forEach((fn) => fn());
  const releaseFetch = () => resolveFetch?.();

  return {
    svg,
    status,
    posted,
    gesture,
    stroke,
    key,
    keyboardStroke,
    settle,
    emitMark,
    releaseFetch,
    streamUrls: () => streams.map((s) => s.url),
    dropStream,
    runTimers,
  };
}

it("posts one mark for one pointer gesture when a hand can draw", async () => {
  const { svg, posted, stroke, settle } = buildWall({ canDraw: true });
  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(1);
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1);
});

it("tells a hand which stroke is theirs the moment its first mark lands", async () => {
  // The page footer only names "the thicker stroke" once a reload finds this
  // hand's marks on the server; without this, a first-time hand's only cue
  // is a line that vanishes into a busy wall.
  const { status, stroke, settle } = buildWall({ canDraw: true });
  stroke(1, 9);
  await settle();
  expect(status.textContent).toContain("the thicker stroke");
});

it("never attaches drawing listeners at all when canDraw starts false", async () => {
  const { svg, posted, stroke, keyboardStroke, settle } = buildWall({ canDraw: false });
  stroke(1, 9);
  keyboardStroke();
  await settle();
  expect(posted.length).toBe(0);
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(0);
});

it("posts one mark for a keyboard-only gesture: Enter, an arrow step, Enter", async () => {
  // A pointer is otherwise the only way to draw at all --- a keyboard-only
  // visitor couldn't use the app's one interaction without this path, which
  // mirrors pointerdown/pointermove/pointerup through the same
  // beginGesture/addPoint/finish functions.
  const { svg, posted, keyboardStroke, settle } = buildWall({ canDraw: true });
  keyboardStroke();
  await settle();
  expect(posted.length).toBe(1);
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1);
});

it("Escape cancels a keyboard gesture in progress without posting anything", async () => {
  const { svg, posted, key, settle } = buildWall({ canDraw: true });
  key("Enter");
  key("ArrowUp");
  key("Escape");
  await settle();
  expect(posted.length).toBe(0);
  expect(svg.querySelectorAll("path").length).toBe(0); // halo included
});

it("posts nothing when the browser cancels a pointer gesture partway", async () => {
  // On a phone, pointercancel means the system took the touch (an edge
  // swipe, a notification pulled down), not that the hand lifted it. Posting
  // there would spend the day's one mark on a stroke nobody finished.
  const { svg, posted, gesture, settle } = buildWall({ canDraw: true });
  gesture(1, 1, "pointerdown");
  gesture(9, 9, "pointermove");
  gesture(9, 9, "pointercancel");
  await settle();
  expect(posted.length).toBe(0);
  expect(svg.querySelectorAll("path").length).toBe(0); // halo included
});

it("follows only the first finger when a second touches mid-gesture", async () => {
  // A second pointerdown used to start a fresh gesture over the first,
  // leaving the first finger's stroke on the wall as a path nothing would
  // ever post or remove, and feeding both fingers' moves into one zig-zag.
  const { svg, posted, gesture, settle } = buildWall({ canDraw: true });
  gesture(1, 1, "pointerdown", 1);
  gesture(5, 5, "pointermove", 1);
  gesture(80, 80, "pointerdown", 2);
  gesture(90, 90, "pointermove", 2);
  gesture(9, 9, "pointermove", 1);
  gesture(90, 90, "pointerup", 2);
  expect(posted.length).toBe(0);
  gesture(9, 9, "pointerup", 1);
  await settle();
  expect(posted.map((m) => m.path)).toEqual(["M1,1 L5,5 L9,9"]);
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1);
  expect(svg.querySelectorAll("path.halo").length).toBe(1);
});

it("refuses a second gesture in the same tab once the first mark has landed", async () => {
  // Regression check for 2e59190: before that fix, the pointerdown listener
  // never rechecked canDraw after attaching, so a second gesture in the same
  // tab still appended a path and posted, only to be rejected (and removed)
  // at submit time by the server --- a contradiction the UI had no way to
  // avoid showing a visitor who kept gesturing after their mark landed.
  const { svg, posted, stroke, settle } = buildWall({ canDraw: true });
  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(1);

  stroke(20, 40);
  await settle();
  expect(posted.length).toBe(1);
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1);
});

it("draws another hand's mark even when its path is byte-identical to this tab's own", async () => {
  // Regression check: the echo filter used to compare by path string, not by
  // a per-mark token, so two different hands drawing the same short stroke
  // (a real possibility --- paths are rounded integer coordinates) would
  // have one hand's live view silently drop the other's genuine mark.
  const { svg, posted, stroke, settle, emitMark } = buildWall({ canDraw: true });
  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(1);
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1); // this tab's own `live` stroke

  emitMark({ path: posted[0].path, colour: "#abcdef", nonce: "someone-elses-nonce" });
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(2);
  // Another hand's mark goes under this tab's own stroke and its halo, not on top.
  expect(svg.firstElementChild?.getAttribute("stroke")).toBe("#abcdef");
  expect(svg.lastElementChild?.classList.contains("mine")).toBe(true);
});

it("refuses a second gesture while the first one's post is still in flight", async () => {
  // Regression check: pointerdown only ever checked canDraw, which stays
  // true until the first post *succeeds* --- so a hand could start a second
  // gesture while the first was still in flight. Both posted; the server's
  // one-mark-a-day check correctly rejected the loser, but the single
  // pendingNonce belonged to whichever gesture started last, so the
  // winner's own nonce was orphaned and its own echo drew a visible
  // duplicate of a stroke already on the wall.
  const { svg, posted, stroke, settle, emitMark, releaseFetch } = buildWall({
    canDraw: true,
    deferFetch: true,
  });
  stroke(1, 9); // gesture 1, fetch pending
  await settle();
  expect(posted.length).toBe(1);

  stroke(20, 40); // gesture 2, started before gesture 1's fetch resolved
  await settle();
  expect(posted.length).toBe(1); // refused outright, never posted
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1); // just gesture 1's own `live` stroke

  emitMark({ path: posted[0].path, colour: "#123456", nonce: posted[0].nonce });
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1); // still recognised as its own echo

  releaseFetch();
  await settle();
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1);
});

it("doesn't duplicate its own mark when the SSE echo arrives before the post resolves", async () => {
  // Regression check: server.ts broadcasts before it replies to the POST, so
  // a tab's own echo can genuinely arrive before its fetch promise settles.
  // The nonce is recorded synchronously before the fetch is even issued, so
  // this ordering must not produce a second path for the same gesture.
  const { svg, posted, stroke, settle, emitMark, releaseFetch } = buildWall({
    canDraw: true,
    deferFetch: true,
  });
  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(1);
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1); // the `live` stroke, fetch still pending

  emitMark({ path: posted[0].path, colour: "#123456", nonce: posted[0].nonce });
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1); // recognised as its own echo, not drawn again

  releaseFetch();
  await settle();
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1);
});

it("opens its stream from the last mark the page rendered", () => {
  // Otherwise a mark landing between the page render and the stream
  // connecting would be on nobody's wall until a reload.
  const { streamUrls } = buildWall({ canDraw: false });
  expect(streamUrls()).toEqual(["/api/marks/stream?since=41"]);
});

it("doesn't redraw its own mark when a reconnect replays it without the nonce", async () => {
  // The nonce is never stored, so a replay after a dropped stream can't
  // carry it; the id the post returned is what recognises the mark.
  const { svg, posted, stroke, settle, emitMark } = buildWall({ canDraw: true });
  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(1);

  emitMark({ id: 1, path: posted[0].path, colour: "#123456", mine: true });
  expect(svg.querySelectorAll("path:not(.halo)").length).toBe(1);
});

it("draws another hand's replayed marks once each", () => {
  const { svg, emitMark } = buildWall({ canDraw: false });
  emitMark({ id: 7, path: "M1,1 L2,2", colour: "#abcdef" });
  emitMark({ id: 7, path: "M1,1 L2,2", colour: "#abcdef" });
  expect(svg.querySelectorAll("path").length).toBe(1);
});

it("paints a mark from this hand's other tab as its own, and stops this tab drawing a second", async () => {
  const { svg, status, posted, stroke, settle, emitMark } = buildWall({ canDraw: true });
  emitMark({ path: "M5,5 L6,6", colour: "#123456", mine: true });
  expect(svg.lastElementChild?.classList.contains("mine")).toBe(true);
  expect(svg.querySelectorAll(".halo").length).toBe(1);
  expect(status.textContent).toContain("from another tab");

  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(0);
});

it("reopens a stream the browser gave up on, from the newest mark it has", () => {
  // Chrome closes an EventSource for good when the server dies mid-stream
  // (a redeploy), rather than retrying with Last-Event-ID.
  const { svg, emitMark, dropStream, runTimers, streamUrls } = buildWall({ canDraw: false });
  emitMark({ id: 50, path: "M1,1 L2,2", colour: "#abcdef" });
  dropStream();
  runTimers();
  expect(streamUrls()).toEqual(["/api/marks/stream?since=41", "/api/marks/stream?since=50"]);

  emitMark({ id: 51, path: "M3,3 L4,4", colour: "#abcdef" });
  expect(svg.querySelectorAll("path").length).toBe(2);
});

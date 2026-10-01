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
    return new Response(null, { status: 201 });
  }) as typeof fetch;
  // wall.js opens one unconditionally on load; there's no server to answer it,
  // so tests dispatch "mark" events through this stub directly.
  let markListener: ((evt: { data: string }) => void) | undefined;
  (window as unknown as { EventSource: unknown }).EventSource = class {
    addEventListener(_type: string, listener: (evt: { data: string }) => void) {
      markListener = listener;
    }
  };

  const script = window.document.createElement("script");
  script.dataset.handColour = "#123456";
  script.dataset.canDraw = String(canDraw);
  script.textContent = wallSource;
  window.document.body.appendChild(script);

  const gesture = (x: number, y: number, type: string) =>
    svg.dispatchEvent(
      new window.PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true }),
    );
  const stroke = (from: number, to: number) => {
    gesture(from, from, "pointerdown");
    gesture(to, to, "pointermove");
    gesture(to + 1, to + 1, "pointerup");
  };
  // Flush the microtask queue fetch's promise chain runs on.
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
  const emitMark = (mark: { path: string; colour: string; nonce?: string }) =>
    markListener?.({ data: JSON.stringify(mark) });
  const releaseFetch = () => resolveFetch?.();

  return { svg, posted, stroke, settle, emitMark, releaseFetch };
}

it("posts one mark for one pointer gesture when a hand can draw", async () => {
  const { svg, posted, stroke, settle } = buildWall({ canDraw: true });
  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(1);
  expect(svg.querySelectorAll("path").length).toBe(1);
});

it("never attaches drawing listeners at all when canDraw starts false", async () => {
  const { svg, posted, stroke, settle } = buildWall({ canDraw: false });
  stroke(1, 9);
  await settle();
  expect(posted.length).toBe(0);
  expect(svg.querySelectorAll("path").length).toBe(0);
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
  expect(svg.querySelectorAll("path").length).toBe(1);
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
  expect(svg.querySelectorAll("path").length).toBe(1); // this tab's own `live` stroke

  emitMark({ path: posted[0].path, colour: "#abcdef", nonce: "someone-elses-nonce" });
  expect(svg.querySelectorAll("path").length).toBe(2);
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
  expect(svg.querySelectorAll("path").length).toBe(1); // just gesture 1's own `live` stroke

  emitMark({ path: posted[0].path, colour: "#123456", nonce: posted[0].nonce });
  expect(svg.querySelectorAll("path").length).toBe(1); // still recognised as its own echo

  releaseFetch();
  await settle();
  expect(svg.querySelectorAll("path").length).toBe(1);
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
  expect(svg.querySelectorAll("path").length).toBe(1); // the `live` stroke, fetch still pending

  emitMark({ path: posted[0].path, colour: "#123456", nonce: posted[0].nonce });
  expect(svg.querySelectorAll("path").length).toBe(1); // recognised as its own echo, not drawn again

  releaseFetch();
  await settle();
  expect(svg.querySelectorAll("path").length).toBe(1);
});

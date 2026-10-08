// Captures one pointer gesture on the wall's SVG and posts it as a mark, and
// listens for every hand's marks (including this one's, echoed back) over
// SSE so the wall updates live with no reload. No frameworks: this is the
// whole client.
(() => {
  const script = document.currentScript;
  const svg = document.getElementById("wall");
  const status = document.getElementById("status");
  const handColour = script.dataset.handColour;
  let canDraw = script.dataset.canDraw === "true";
  let points = [];
  let live = null;
  let drawing = false;
  // True from the moment a finished gesture's POST goes out until it
  // settles. Without this, pointerdown doesn't check anything but canDraw
  // (which only flips false on *success*), so a hand could start a second
  // gesture while the first mark's request was still in flight --- both
  // post, the server's one-mark-a-day check correctly rejects the loser,
  // but the single pendingNonce below belongs to whichever gesture started
  // last, orphaning the winner's own nonce and making its own echo draw a
  // visible duplicate of a stroke already on the wall.
  let submitting = false;
  // The nonce of the mark this tab just posted, so its own echo over SSE
  // draws nothing twice --- the gesture is already on the wall as `live`. A
  // second open tab for the *same* hand has no `live` element and still
  // needs the echo. Set synchronously before the POST even goes out (not
  // after it resolves), and compared by this opaque token rather than path
  // content: two different hands can draw byte-identical short strokes, and
  // the SSE push for this tab's own mark can genuinely arrive before its own
  // fetch's promise resolves.
  let pendingNonce = null;
  // Ids of marks already on this tab's wall from the stream or its own post.
  // A reconnect replays everything after the last id the browser saw, and a
  // replayed copy of this tab's own mark carries no nonce, so the id is what
  // stops it being drawn twice.
  const seen = new Set();

  const toViewBox = (evt) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const x = ((evt.clientX - rect.left) / rect.width) * vb.width + vb.x;
    const y = ((evt.clientY - rect.top) / rect.height) * vb.height + vb.y;
    return [Math.round(x), Math.round(y)];
  };

  const pathFrom = (pts) => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  const appendStroke = (path, colour) => {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", path);
    p.setAttribute("stroke", colour);
    // Under this hand's own strokes, which the server paints last.
    svg.insertBefore(p, svg.querySelector(".halo, .mine"));
  };

  // A hand's own mark, from another of its tabs or replayed after a gap,
  // painted the way the server paints it: on top, over a halo.
  const appendOwnStroke = (path, colour) => {
    const halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    halo.setAttribute("d", path);
    halo.setAttribute("class", "halo");
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", path);
    p.setAttribute("stroke", colour);
    p.setAttribute("class", "mine");
    svg.append(halo, p);
  };

  // The stroke being drawn, over its halo, mirroring what the server renders
  // for a hand's own marks.
  let halo = null;

  const beginGesture = (point) => {
    drawing = true;
    points = [point];
    halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    halo.setAttribute("class", "halo");
    live = document.createElementNS("http://www.w3.org/2000/svg", "path");
    live.setAttribute("stroke", handColour);
    live.setAttribute("class", "mine");
    svg.append(halo, live);
  };

  // src/server.ts's PATH_RE refuses a path past 2000 segments, so a long
  // scribble stops growing there rather than being posted and thrown away.
  const MAX_POINTS = 2001;
  const LONGEST = "That's as long as a mark goes. Finish it here to add it.";

  const addPoint = (point) => {
    if (points.length >= MAX_POINTS) {
      // Once, so the live region doesn't announce it on every move.
      if (status.textContent !== LONGEST) status.textContent = LONGEST;
      return;
    }
    points.push(point);
    halo.setAttribute("d", pathFrom(points));
    live.setAttribute("d", pathFrom(points));
  };

  const dropLive = () => {
    halo?.remove();
    live?.remove();
  };

  // Whether this hand may draw, with the wall's focusability and label to
  // match (pages.ts renders the same two states on load). The server still
  // refuses a mark too early; this only decides what the tab offers.
  const setDrawable = (on) => {
    canDraw = on;
    if (on) {
      svg.setAttribute("tabindex", "0");
      svg.setAttribute("role", "application");
      svg.setAttribute(
        "aria-label",
        "The shared drawing, one mark per hand. Press Enter or Space to start your mark, arrow keys to draw it, Enter or Space to finish, Escape to cancel.",
      );
      status.textContent =
        "You can add another mark. Draw it with a pointer, or focus the wall and press Enter: arrow keys draw, Enter again finishes.";
    } else {
      svg.removeAttribute("tabindex");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "The shared drawing, one mark per hand");
    }
  };

  // When this hand's 24 hours are up, as this tab's clock reads it. A tab
  // left open, or a phone back from a night asleep, would otherwise keep
  // refusing to draw until a reload. A timer covers a tab in view; a
  // sleeping phone's timers stall, so coming back into view checks too.
  const DAY_MS = 24 * 60 * 60 * 1000;
  let reopensAt = Infinity;
  let reopenTimer;
  const waitForNextMark = (ms) => {
    reopensAt = Date.now() + ms;
    clearTimeout(reopenTimer);
    reopenTimer = setTimeout(reopenIfDue, ms);
  };
  // A timer can fire before the wall clock agrees it's due (the two clocks
  // drift), so an early one waits out the rest rather than giving up.
  const reopenIfDue = () => {
    if (canDraw || submitting || reopensAt === Infinity) return;
    const left = reopensAt - Date.now();
    if (left > 0) return waitForNextMark(left);
    reopensAt = Infinity;
    setDrawable(true);
  };
  if (!canDraw) waitForNextMark(Number(script.dataset.nextMarkIn) || DAY_MS);

  // The one pointer drawing. A second finger on a phone is ignored rather
  // than starting a new gesture over the first, which would orphan the
  // first stroke's path and mix both fingers into one line.
  let pointerId = null;

  svg.addEventListener("pointerdown", (evt) => {
    if (!canDraw || submitting || drawing) return;
    pointerId = evt.pointerId;
    beginGesture(toViewBox(evt));
    svg.setPointerCapture(evt.pointerId);
  });

  svg.addEventListener("pointermove", (evt) => {
    if (!drawing || evt.pointerId !== pointerId) return;
    addPoint(toViewBox(evt));
  });

  // A phone dropping off the crit room's Wi-Fi, or the 502 Fly's proxy
  // answers while a deploy restarts the one machine, shouldn't cost a hand
  // its stroke: it stays on the wall and the same post (same nonce) goes
  // again for about half a minute. Resolves with null if the mark's echo
  // arrives meanwhile, since then it's already on the wall.
  const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000];
  const postMark = async (path, nonce) => {
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch("/api/marks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, nonce }),
        });
        if (![502, 503, 504].includes(res.status)) return res;
      } catch {
        // Offline, or the connection dropped: retried below like a 502.
      }
      if (pendingNonce !== nonce) return null;
      if (attempt === RETRY_DELAYS.length) throw new Error("wall out of reach");
      status.textContent = "Can't reach the wall right now: holding your mark and trying again…";
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
      if (pendingNonce !== nonce) return null;
    }
  };

  const finish = async () => {
    if (!drawing) return;
    drawing = false;
    if (points.length < 2) {
      dropLive();
      return;
    }
    const path = pathFrom(points);
    // Chosen and recorded before the fetch is even issued, so the echo
    // check below is already armed no matter which I/O completes first.
    const nonce = crypto.randomUUID();
    pendingNonce = nonce;
    submitting = true;
    status.textContent = "Adding your mark…";
    try {
      const res = await postMark(path, nonce);
      // Its own echo clears pendingNonce: the mark landed, whatever a retry
      // whose first attempt's response was lost has to say about it.
      const landed = pendingNonce !== nonce;
      if (!landed && !res.ok) {
        const text = await res.text();
        // Already marked, from a tab whose echo never reached this one:
        // stop offering a mark until the server says the wait is up.
        if (res.status === 429) {
          setDrawable(false);
          waitForNextMark(Number(res.headers.get("Retry-After")) * 1000 || DAY_MS);
        }
        status.textContent = text || "That mark wasn't accepted.";
        dropLive();
        pendingNonce = null;
        return;
      }
      setDrawable(false);
      waitForNextMark(DAY_MS);
      if (res?.ok) {
        const { id } = await res.json();
        seen.add(id);
        lastId = Math.max(lastId, id);
      }
      status.textContent =
        "Your mark is on the wall: the thicker stroke, on top. You can add another in 24 hours.";
    } catch {
      status.textContent = "Couldn't reach the wall — try again.";
      dropLive();
      pendingNonce = null;
    } finally {
      submitting = false;
    }
  };

  svg.addEventListener("pointerup", (evt) => {
    if (evt.pointerId === pointerId) finish();
  });
  // The system took the touch (an edge swipe, a notification): nobody
  // finished this stroke, so it's dropped like Escape, not posted.
  svg.addEventListener("pointercancel", (evt) => {
    if (!drawing || evt.pointerId !== pointerId) return;
    drawing = false;
    dropLive();
  });

  // A pointer is the only way to draw unless this exists: Enter/Space
  // starts a gesture at the wall's centre, the arrow keys add a point each
  // in that direction (mirroring pointermove), and Enter/Space again hands
  // off to the same finish() a pointer gesture uses. Escape cancels before
  // anything is sent, the same way lifting a pointer after barely moving
  // does (finish() drops any gesture under two points).
  const STEP = 30;
  const ARROW_DELTAS = {
    ArrowUp: [0, -STEP],
    ArrowDown: [0, STEP],
    ArrowLeft: [-STEP, 0],
    ArrowRight: [STEP, 0],
  };
  svg.addEventListener("keydown", (evt) => {
    if (!canDraw || submitting) return;
    if (!drawing) {
      if (evt.key !== "Enter" && evt.key !== " ") return;
      evt.preventDefault();
      const vb = svg.viewBox.baseVal;
      beginGesture([Math.round(vb.x + vb.width / 2), Math.round(vb.y + vb.height / 2)]);
      return;
    }
    if (evt.key in ARROW_DELTAS) {
      evt.preventDefault();
      const [dx, dy] = ARROW_DELTAS[evt.key];
      const [x, y] = points[points.length - 1];
      addPoint([x + dx, y + dy]);
      return;
    }
    if (evt.key === "Enter" || evt.key === " ") {
      evt.preventDefault();
      finish();
      return;
    }
    if (evt.key === "Escape") {
      evt.preventDefault();
      drawing = false;
      dropLive();
    }
  });

  // The newest mark this tab has, so a fresh stream can ask for everything
  // after it. Starts at the last mark the page rendered, so a mark landing
  // between the render and the first connect isn't lost.
  let lastId = Number(script.dataset.since) || 0;

  const onMark = (evt) => {
    const mark = JSON.parse(evt.data);
    lastId = Math.max(lastId, mark.id);
    if (seen.has(mark.id)) return;
    seen.add(mark.id);
    if (mark.nonce && mark.nonce === pendingNonce) {
      pendingNonce = null;
      return;
    }
    if (!mark.mine) {
      appendStroke(mark.path, mark.colour);
      return;
    }
    appendOwnStroke(mark.path, mark.colour);
    // Drawn from another tab of this hand: this one can't add a second, so
    // a half-drawn stroke goes too. Left in place, a keyboard gesture would
    // be stuck, since keydown (Escape included) refuses once canDraw is off.
    if (canDraw && !submitting) {
      if (drawing) {
        drawing = false;
        dropLive();
      }
      setDrawable(false);
      waitForNextMark(DAY_MS);
      status.textContent =
        "Your mark is on the wall, from another tab: the thicker stroke, on top. You can add another in 24 hours.";
    }
  };

  // EventSource retries on its own after a clean close, sending
  // Last-Event-ID, but Chrome gives up for good (CLOSED) when the server
  // process dies mid-stream --- exactly what a redeploy does. Reopening from
  // lastId covers both; the server replays the gap either way.
  let stream;
  let retry;
  const connect = () => {
    clearTimeout(retry);
    stream?.close();
    const opened = new EventSource(`/api/marks/stream?since=${lastId}`);
    stream = opened;
    opened.addEventListener("mark", onMark);
    opened.addEventListener("error", () => {
      if (opened === stream && opened.readyState === EventSource.CLOSED) {
        retry = setTimeout(connect, 3000);
      }
    });
  };
  connect();

  // A phone tab back from the background can be holding a stream the OS
  // cut while it slept, and nothing says so until the socket times out or
  // the browser's own retry fires seconds later. Reopen the moment the
  // wall is visible again; the replay fills whatever it missed.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    connect();
    reopenIfDue();
  });
})();

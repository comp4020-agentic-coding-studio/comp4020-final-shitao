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
  // The path this tab just posted, so its own echo over SSE draws nothing
  // twice --- the gesture is already on the wall as `live`. A second open tab
  // for the *same* hand has no `live` element and still needs the echo.
  let justPosted = null;

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
    svg.appendChild(p);
  };

  if (canDraw) {
    svg.addEventListener("pointerdown", (evt) => {
      if (!canDraw) return;
      drawing = true;
      points = [toViewBox(evt)];
      live = document.createElementNS("http://www.w3.org/2000/svg", "path");
      live.setAttribute("stroke", handColour);
      svg.appendChild(live);
      svg.setPointerCapture(evt.pointerId);
    });

    svg.addEventListener("pointermove", (evt) => {
      if (!drawing) return;
      points.push(toViewBox(evt));
      live.setAttribute("d", pathFrom(points));
    });

    const finish = async () => {
      if (!drawing) return;
      drawing = false;
      if (points.length < 2) {
        live?.remove();
        return;
      }
      const path = pathFrom(points);
      status.textContent = "Adding your mark…";
      try {
        const res = await fetch("/api/marks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        if (!res.ok) {
          const text = await res.text();
          status.textContent = text || "That mark wasn't accepted.";
          live?.remove();
          return;
        }
        justPosted = path;
        canDraw = false;
        status.textContent = "Your mark is already on the wall today. Come back tomorrow.";
      } catch {
        status.textContent = "Couldn't reach the wall --- try again.";
        live?.remove();
      }
    };

    svg.addEventListener("pointerup", finish);
    svg.addEventListener("pointercancel", finish);
  }

  const stream = new EventSource("/api/marks/stream");
  stream.addEventListener("mark", (evt) => {
    const mark = JSON.parse(evt.data);
    if (mark.path === justPosted) {
      justPosted = null;
      return;
    }
    appendStroke(mark.path, mark.colour);
  });
})();

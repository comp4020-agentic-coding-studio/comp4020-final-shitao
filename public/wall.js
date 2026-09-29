// Captures one pointer gesture on the wall's SVG and posts it as a mark.
// No frameworks: this is the whole client.
(() => {
  const script = document.currentScript;
  if (script.dataset.canDraw !== "true") return;

  const svg = document.getElementById("wall");
  const status = document.getElementById("status");
  let points = [];
  let live = null;
  let drawing = false;

  const toViewBox = (evt) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const x = ((evt.clientX - rect.left) / rect.width) * vb.width + vb.x;
    const y = ((evt.clientY - rect.top) / rect.height) * vb.height + vb.y;
    return [Math.round(x), Math.round(y)];
  };

  const pathFrom = (pts) => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  svg.addEventListener("pointerdown", (evt) => {
    drawing = true;
    points = [toViewBox(evt)];
    live = document.createElementNS("http://www.w3.org/2000/svg", "path");
    live.setAttribute("stroke", "currentColor");
    svg.appendChild(live);
    svg.setPointerCapture(evt.pointerId);
  });

  svg.addEventListener("pointermove", (evt) => {
    if (!drawing) return;
    points.push(toViewBox(evt));
    live.setAttribute("d", pathFrom(points));
  });

  const finish = async (evt) => {
    if (!drawing) return;
    drawing = false;
    if (points.length < 2) {
      live?.remove();
      return;
    }
    status.textContent = "Adding your mark…";
    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathFrom(points) }),
      });
      if (!res.ok) {
        const text = await res.text();
        status.textContent = text || "That mark wasn't accepted.";
        live?.remove();
        return;
      }
      location.reload();
    } catch {
      status.textContent = "Couldn't reach the wall --- try again.";
      live?.remove();
    }
  };

  svg.addEventListener("pointerup", finish);
  svg.addEventListener("pointercancel", finish);
})();

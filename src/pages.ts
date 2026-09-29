import { marked } from "marked";
import type { Mark } from "./db.ts";

const escape = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const layout = (title: string, body: string): string => `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(title)}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
${body}
  </body>
</html>
`;

export function wallPage(marks: Mark[], handColour: string, alreadyMarkedToday: boolean): string {
  const strokes = marks
    .map((m) => `<path d="${escape(m.path)}" stroke="${escape(m.colour)}" />`)
    .join("\n      ");

  const prompt = alreadyMarkedToday
    ? `<p id="status">Your mark is already on the wall today. Come back tomorrow.</p>`
    : `<p id="status">Draw one mark, then lift your hand (or finger, or pen).</p>`;

  return layout(
    "Trace",
    `    <main>
      <h1>Trace</h1>
      <p>One wall. One mark each, once a day. Nothing else.</p>
      <svg id="wall" viewBox="0 0 1000 600" role="img" aria-label="The shared drawing, one mark per hand">
      ${strokes}
      </svg>
      ${prompt}
      <p><small>You draw as <strong style="color:${escape(handColour)}">this colour</strong>. <a href="/readme/">What this is, and why</a>.</small></p>
    </main>
    <script
      src="/wall.js"
      data-can-draw="${alreadyMarkedToday ? "false" : "true"}"
      data-hand-colour="${escape(handColour)}"
    ></script>`,
  );
}

export function readmePage(readmeMarkdown: string): string {
  const html = marked.parse(readmeMarkdown, { async: false }) as string;
  return layout("About Trace", `    <main>\n${html}\n    </main>`);
}

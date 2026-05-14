const fs = require("fs");
const p = "e:/nextbook-demo/app.js";
let s = fs.readFileSync(p, "utf8");
if (!s.includes("function escapeLineageHtml")) {
  s = s.replace(
    `function escapeLineageText(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layoutLineageLeaves`,
    `function escapeLineageText(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeLineageHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
}

function layoutLineageLeaves`
  );
}

const oldTwig = `    const qx = hub.x + (leaf.x - hub.x) * 0.78 + Math.cos(leaf.i * 1.2) * 10;
    const qy = hub.y + (leaf.y - hub.y) * 0.72;
    paths +=
      '<path class="lineage-path lineage-path--twig" d="M ' +
      hub.x +
      " " +
      hub.y +
      " Q " +
      mx +
      " " +
      my +
      " " +
      qx +
      " " +
      qy +
      " T " +
      leaf.x +
      " " +
      leaf.y +
      '" />';`;

const newTwig = `    const c1x = hub.x + (leaf.x - hub.x) * 0.32 + Math.sin(leaf.i * 1.91) * 14;
    const c1y = hub.y + (leaf.y - hub.y) * 0.28 - 22;
    const c2x = hub.x + (leaf.x - hub.x) * 0.72 + Math.cos(leaf.i * 1.2) * 12;
    const c2y = hub.y + (leaf.y - hub.y) * 0.62 - 6;
    paths +=
      '<path class="lineage-path lineage-path--twig" d="M ' +
      hub.x +
      " " +
      hub.y +
      " C " +
      c1x +
      " " +
      c1y +
      ", " +
      c2x +
      " " +
      c2y +
      ", " +
      leaf.x +
      " " +
      leaf.y +
      '" />';`;

if (s.includes(" T ")) s = s.replace(oldTwig, newTwig);

s = s.replace(
  "'>" +\n        escapeLineageText(leaf.title) +\n        \"</button>\"",
  "'>\" +\n        escapeLineageHtml(leaf.title) +\n        \"</button>\""
);
// fix multiline - the replace might not match. Try simpler:
s = s.replace("escapeLineageText(leaf.title) +\n        \"</button>\"", "escapeLineageHtml(leaf.title) +\n        \"</button>\"");

fs.writeFileSync(p, s, "utf8");
console.log("twig+html escape");

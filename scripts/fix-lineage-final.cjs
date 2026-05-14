const fs = require("fs");
const p = "e:/nextbook-demo/app.js";
let s = fs.readFileSync(p, "utf8");
if (!s.includes("function escapeLineageHtml")) {
  const needle = "function layoutLineageLeaves(entries, W, H, hub, root) {";
  const ins =
    "function escapeLineageHtml(str) {\n" +
    "  return String(str || \"\")\n" +
    "    .replace(/&/g, \"&amp;\")\n" +
    "    .replace(/</g, \"&lt;\");\n" +
    "}\n\n" +
    needle;
  s = s.replace(needle, ins);
}
const start = s.indexOf("  for (const leaf of leaves) {");
const end = s.indexOf("  const leafButtons = leaves");
if (start !== -1 && end !== -1 && s.includes(" T ")) {
  const newFor =
    "  for (const leaf of leaves) {\n" +
    "    const c1x = hub.x + (leaf.x - hub.x) * 0.32 + Math.sin(leaf.i * 1.91) * 14;\n" +
    "    const c1y = hub.y + (leaf.y - hub.y) * 0.28 - 22;\n" +
    "    const c2x = hub.x + (leaf.x - hub.x) * 0.72 + Math.cos(leaf.i * 1.2) * 12;\n" +
    "    const c2y = hub.y + (leaf.y - hub.y) * 0.62 - 6;\n" +
    "    paths +=\n" +
    "      '<path class=\"lineage-path lineage-path--twig\" d=\"M ' +\n" +
    "      hub.x +\n" +
    "      \" \" +\n" +
    "      hub.y +\n" +
    "      \" C \" +\n" +
    "      c1x +\n" +
    "      \" \" +\n" +
    "      c1y +\n" +
    "      \", \" +\n" +
    "      c2x +\n" +
    "      \" \" +\n" +
    "      c2y +\n" +
    "      \", \" +\n" +
    "      leaf.x +\n" +
    "      \" \" +\n" +
    "      leaf.y +\n" +
    "      '\" />';\n" +
    "  }\n";
  s = s.slice(0, start) + newFor + s.slice(end);
}
const btnOld =
  "%;\">' +\n        escapeLineageText(leaf.title) +\n        \"</button>\"";
const btnNew =
  "%;\">' +\n        escapeLineageHtml(leaf.title) +\n        \"</button>\"";
if (s.includes("escapeLineageText(leaf.title) +\n        \"</button>\"")) {
  s = s.replace(btnOld, btnNew);
}
fs.writeFileSync(p, s, "utf8");
console.log("lineage fixes");

const fs = require("fs");
const p = "e:/nextbook-demo/styles.css";
let s = fs.readFileSync(p, "utf8");
const block = `
.lineage-sway-wrap {
  position: absolute;
  inset: 0;
  transform-origin: 50% 92%;
  animation: lineageSway 7.2s ease-in-out infinite;
}

.lineage-leaf-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.lineage-leaf-layer .lineage-node {
  pointer-events: auto;
}
`;
if (!s.includes(".lineage-sway-wrap")) {
  s = s.replace(".lineage-stage {\n", ".lineage-stage {\n" + block);
}
s = s.replace(
  /\.lineage-branch-layer \{\n  transform-origin: 50% 100%;\n  animation: lineageSway 6\.2s ease-in-out infinite;\n\}/,
  ".lineage-branch-layer {\n}"
);
s = s.replace(
  /\.lineage-path \{\n  fill: none;\n  stroke: color-mix\(in oklab, var\(--text\) 82%, #2f2615 18%\);\n  stroke-linecap: round;\n  stroke-linejoin: round;\n  opacity: 0;\n  stroke-dasharray: 1;\n  stroke-dashoffset: 1;\n  pathLength: 1;\n  animation: lineageTrace 880ms ease forwards;\n\}/,
  `.lineage-path {
  fill: none;
  stroke: color-mix(in oklab, var(--text) 68%, #1a1510 32%);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.08;
  vector-effect: non-scaling-stroke;
}`
);
s = s.replace(
  /\.lineage-path--trunk \{\n  stroke-width: 3\.6;\n\}/,
  `.lineage-path--trunk {
  stroke-width: 2.35;
  stroke: color-mix(in oklab, var(--text) 74%, #2a2218 26%);
}`
);
if (!s.includes(".lineage-path--twig")) {
  s = s.replace(
    ".lineage-path--trunk {\n  stroke-width: 2.35;",
    ".lineage-path--twig {\n  stroke-width: 1.05;\n  opacity: 1;\n}\n\n.lineage-path--trunk {\n  stroke-width: 2.35;"
  );
}
s = s.replace(
  /@keyframes lineageSway \{\n  0%, 100% \{ transform: rotate\(-0\.3deg\); \}\n  50% \{ transform: rotate\(0\.3deg\); \}\n\}/,
  `@keyframes lineageSway {
  0%, 100% { transform: rotate(-0.65deg); }
  50% { transform: rotate(0.65deg); }
}`
);
s = s.replace(
  /\.lineage-node \{\n  position: absolute;\n  max-width: 188px;\n  transform: translate\(-50%, -50%\);\n  border-radius: 999px;\n  border: 1px solid color-mix\(in oklab, var\(--border\) 76%, transparent\);\n  background: color-mix\(in oklab, var\(--surface\) 92%, var\(--bg\) 8%\);\n  color: var\(--text\);\n  padding: 6px 11px;\n  font-size: 12px;\n  line-height: 1\.25;\n  text-align: center;\n  box-shadow: 0 6px 14px rgba\(0, 0, 0, 0\.1\);\n  opacity: 0;\n  animation: lineageFadeIn 500ms ease forwards;\n\}/,
  `.lineage-node {
  position: absolute;
  max-width: 168px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--border) 76%, transparent);
  background: color-mix(in oklab, var(--surface) 92%, var(--bg) 8%);
  color: var(--text);
  padding: 5px 10px;
  font-size: 11.5px;
  line-height: 1.25;
  text-align: center;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
}`
);
s = s.replace(
  /@media \(prefers-reduced-motion: reduce\) \{\n  \.lineage-path,\n  \.lineage-node,\n  \.lineage-branch-layer \{/,
  "@media (prefers-reduced-motion: reduce) {\n  .lineage-path,\n  .lineage-node,\n  .lineage-branch-layer,\n  .lineage-sway-wrap {"
);
fs.writeFileSync(p, s, "utf8");
console.log("css lineage updated");

const fs = require("fs");
const p = "e:/nextbook-demo/app.js";
let s = fs.readFileSync(p, "utf8");

const oldBlock = `function renderLineage() {
  if (!lineageHistory.length) {
    DOM.lineageTree.innerHTML = "";
    DOM.lineageEmpty.hidden = false;
    DOM.lineageDeleteBtn.disabled = true;
    return;
  }
  DOM.lineageEmpty.hidden = true;
  DOM.lineageTree.innerHTML = lineageHistory.map((x, i) => \`<button class="lineage-node lineage-node--book \${lineageSelectedIndex === i ? "lineage-node--selected" : ""}" data-lineage-index="\${i}" type="button">\${x.title}</button>\`).join("");
  DOM.lineageDeleteBtn.disabled = lineageSelectedIndex < 0;
}`;

const newBlock = `function escapeLineageText(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layoutLineageLeaves(entries, W, H, hub, root) {
  const n = entries.length;
  return entries.map((item, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle0 = Math.PI * 0.12;
    const sweep = Math.PI * 0.58;
    const ang = angle0 + t * sweep;
    const r = 86 + (i % 4) * 15 + Math.sin(i * 2.17 + n * 0.31) * 10;
    let x = hub.x + Math.sin(ang) * r;
    let y = hub.y - Math.cos(ang) * r;
    x += Math.cos(i * 1.33) * 8;
    y -= (i % 3) * 4;
    x = Math.max(34, Math.min(W - 34, x));
    y = Math.max(26, Math.min(hub.y - 32, y));
    return { title: item.title, i, x, y };
  });
}

function animateLineageDraw(rootEl) {
  if (!rootEl) return;
  const paths = rootEl.querySelectorAll(".lineage-path");
  paths.forEach((pathEl, order) => {
    try {
      const len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = String(len);
      pathEl.style.strokeDashoffset = String(len);
      pathEl.style.opacity = "0.12";
      const delay = order * 72;
      window.setTimeout(() => {
        pathEl.style.transition =
          "stroke-dashoffset 920ms cubic-bezier(0.33, 0.06, 0.2, 1), opacity 700ms ease";
        pathEl.style.strokeDashoffset = "0";
        pathEl.style.opacity = pathEl.classList.contains("lineage-path--trunk") ? "0.88" : "0.78";
      }, delay);
    } catch {
      pathEl.style.opacity = "0.75";
    }
  });
  const nodes = rootEl.querySelectorAll(".lineage-node");
  nodes.forEach((node, order) => {
    node.style.opacity = "0";
    node.style.transform = "translate(-50%, -50%) scale(0.94)";
    const delay = order * 48 + 180;
    window.setTimeout(() => {
      node.style.transition = "opacity 480ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      node.style.opacity = "1";
      node.style.transform = "translate(-50%, -50%) scale(1)";
    }, delay);
  });
}

function renderLineage() {
  if (!lineageHistory.length) {
    DOM.lineageTree.innerHTML = "";
    DOM.lineageEmpty.hidden = false;
    DOM.lineageDeleteBtn.disabled = true;
    return;
  }
  DOM.lineageEmpty.hidden = true;
  const W = 420;
  const H = 360;
  const root = { x: W / 2, y: 334 };
  const hub = { x: W / 2 + 2, y: 248 };
  const leaves = layoutLineageLeaves(lineageHistory, W, H, hub, root);

  let paths = "";
  paths +=
    '<path class="lineage-path lineage-path--trunk" d="M ' +
    root.x +
    " " +
    root.y +
    " C " +
    (root.x - 6) +
    " " +
    (root.y - 52) +
    ", " +
    (hub.x + 5) +
    " " +
    (hub.y + 42) +
    ", " +
    hub.x +
    " " +
    hub.y +
    '" />';

  for (const leaf of leaves) {
    const mx = hub.x + (leaf.x - hub.x) * 0.48 + Math.sin(leaf.i * 1.91) * 16;
    const my = hub.y + (leaf.y - hub.y) * 0.38 - 18;
    const qx = hub.x + (leaf.x - hub.x) * 0.78 + Math.cos(leaf.i * 1.2) * 10;
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
      '" />';
  }

  const leafButtons = leaves
    .map(
      leaf =>
        '<button type="button" class="lineage-node lineage-node--book ' +
        (lineageSelectedIndex === leaf.i ? "lineage-node--selected" : "") +
        '" data-lineage-index="' +
        leaf.i +
        '" aria-label="' +
        escapeLineageText(leaf.title) +
        '" style="left:' +
        (leaf.x / W) * 100 +
        "%;top:" +
        (leaf.y / H) * 100 +
        '%;">' +
        escapeLineageText(leaf.title) +
        "</button>"
    )
    .join("");

  DOM.lineageTree.innerHTML =
    '<div class="lineage-stage">' +
    '<div class="lineage-sway-wrap">' +
    '<svg class="lineage-svg" viewBox="0 0 ' +
    W +
    " " +
    H +
    '" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
    '<g class="lineage-branch-layer">' +
    paths +
    "</g></svg>" +
    '<div class="lineage-leaf-layer">' +
    '<div class="lineage-node lineage-node--root" style="left:50%;top:' +
    (root.y / H) * 100 +
    '%">你</div>' +
    leafButtons +
    "</div></div></div>";

  const stage = DOM.lineageTree.querySelector(".lineage-stage");
  window.requestAnimationFrame(() => animateLineageDraw(stage));
  DOM.lineageDeleteBtn.disabled = lineageSelectedIndex < 0;
}`;

if (!s.includes("function renderLineage()")) throw new Error("renderLineage missing");
if (s.includes("function escapeLineageText")) throw new Error("already patched");
s = s.replace(oldBlock, newBlock);
fs.writeFileSync(p, s, "utf8");
console.log("renderLineage replaced");

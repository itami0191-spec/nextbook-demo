const fs = require("fs");
const path = require("path");
const appPath = path.join(__dirname, "..", "app.js");
let app = fs.readFileSync(appPath, "utf8");
const i1 = app.indexOf("function layoutLineageLeaves");
const i2 = app.indexOf("function animateLineageDraw", i1);
if (i1 < 0 || i2 < 0) throw new Error("markers");
const middle = `function layoutLineageLeaves(entries, W, H, hub) {
  const n = entries.length;
  const angle0 = Math.PI * 0.13;
  const sweep = Math.PI * 0.52;
  const baseR = n > 14 ? 92 : 88;
  return entries.map((item, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const ang = angle0 + t * sweep;
    const r = baseR + (i % 2) * 6;
    let x = hub.x + Math.sin(ang) * r;
    let y = hub.y - Math.cos(ang) * r;
    x = Math.max(40, Math.min(W - 40, x));
    y = Math.max(30, Math.min(hub.y - 38, y));
    const angKey = Math.atan2(x - hub.x, hub.y - y);
    return { title: item.title, i, x, y, angKey };
  });
}

function lineageSpokeCount(n) {
  if (n <= 1) return 1;
  if (n <= 5) return 1;
  if (n <= 10) return Math.min(3, Math.ceil(n / 3));
  if (n <= 18) return Math.min(5, Math.ceil(n / 3));
  return Math.min(8, Math.ceil(n / 4));
}

function buildLineageClusters(leaves, hub, W, H) {
  const n = leaves.length;
  const K = lineageSpokeCount(n);
  const sorted = leaves.slice().sort((a, b) => a.angKey - b.angKey);
  const clusters = [];
  let idx = 0;
  for (let k = 0; k < K; k++) {
    const rest = n - idx;
    const slots = K - k;
    const m = Math.ceil(rest / slots);
    const chunk = sorted.slice(idx, idx + m);
    idx += m;
    if (chunk.length) clusters.push(chunk);
  }
  return clusters.map(members => {
    let sx = 0;
    let sy = 0;
    for (const L of members) {
      sx += L.x;
      sy += L.y;
    }
    const cx = sx / members.length;
    const cy = sy / members.length;
    const jx = hub.x + (cx - hub.x) * 0.46;
    const jy = hub.y + (cy - hub.y) * 0.46;
    const join = {
      x: Math.max(32, Math.min(W - 32, jx)),
      y: Math.max(44, Math.min(H - 36, jy))
    };
    return { join, members };
  });
}

`;
app = app.slice(0, i1) + middle + app.slice(i2);
const oldCall =
  "const leaves = layoutLineageLeaves(lineageHistory, W, H, hub, root);";
const newCall =
  "const leaves = layoutLineageLeaves(lineageHistory, W, H, hub);\n  const clusters = buildLineageClusters(leaves, hub, W, H);";
if (!app.includes(oldCall)) throw new Error("call");
app = app.replace(oldCall, newCall);
const loopStart = app.indexOf("  for (const leaf of leaves) {");
const loopEnd = app.indexOf("  const leafButtons = leaves", loopStart);
if (loopStart < 0 || loopEnd < 0) throw new Error("loop");
const newLoop = `  let ci = 0;
  for (const { join, members } of clusters) {
    const Jx = join.x;
    const Jy = join.y;
    const vx = Jx - hub.x;
    const vy = Jy - hub.y;
    const vlen = Math.hypot(vx, vy) || 1;
    const px = -vy / vlen;
    const py = vx / vlen;
    const spread = (ci - (clusters.length - 1) / 2) * 9;
    ci++;
    const h1x = hub.x + vx * 0.28 + px * spread;
    const h1y = hub.y + vy * 0.26 - 16;
    const h2x = Jx - vx * 0.22 + px * (spread * 0.35);
    const h2y = Jy - vy * 0.18 + 6;
    paths +=
      '<path class="lineage-path lineage-path--branch" d="M ' +
      hub.x +
      " " +
      hub.y +
      " C " +
      h1x +
      " " +
      h1y +
      ", " +
      h2x +
      " " +
      h2y +
      ", " +
      Jx +
      " " +
      Jy +
      '" />';

    for (const leaf of members) {
      const Lx = leaf.x;
      const Ly = leaf.y;
      const dx = Lx - Jx;
      const dy = Ly - Jy;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      const qx = -uy;
      const qy = ux;
      const j = leaf.i;
      const s1x = Jx + ux * 16 + qx * (4 + Math.sin(j * 1.7) * 3);
      const s1y = Jy + uy * 16 + 2;
      const s2x = Lx - ux * 18 - qx * 2;
      const s2y = Ly - uy * 14;
      paths +=
        '<path class="lineage-path lineage-path--hair" d="M ' +
        Jx +
        " " +
        Jy +
        " C " +
        s1x +
        " " +
        s1y +
        ", " +
        s2x +
        " " +
        s2y +
        ", " +
        Lx +
        " " +
        Ly +
        '" />';
    }
  }
`;
app = app.slice(0, loopStart) + newLoop + app.slice(loopEnd);
const oldOp = `        pathEl.style.opacity = pathEl.classList.contains("lineage-path--trunk")
          ? "0.88"
          : pathEl.classList.contains("lineage-path--hair")
            ? "0.72"
            : pathEl.classList.contains("lineage-path--sub")
              ? "0.76"
              : "0.8";`;
const newOp = `        pathEl.style.opacity = pathEl.classList.contains("lineage-path--trunk")
          ? "0.88"
          : pathEl.classList.contains("lineage-path--hair")
            ? "0.74"
            : "0.82";`;
if (!app.includes(oldOp)) throw new Error("opacity");
app = app.replace(oldOp, newOp);
fs.writeFileSync(appPath, app);
console.log("patched");

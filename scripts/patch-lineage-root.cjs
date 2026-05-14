const fs = require("fs");
const pathApp = "e:/nextbook-demo/app.js";
let app = fs.readFileSync(pathApp, "utf8");
const appOldOpacity = `        pathEl.style.opacity = pathEl.classList.contains("lineage-path--trunk") ? "0.88" : "0.78";`;
const appNewOpacity = `        pathEl.style.opacity = pathEl.classList.contains("lineage-path--trunk")
          ? "0.88"
          : pathEl.classList.contains("lineage-path--hair")
            ? "0.72"
            : pathEl.classList.contains("lineage-path--sub")
              ? "0.76"
              : "0.8";`;
if (!app.includes(appOldOpacity)) throw new Error("opacity line missing");
app = app.replace(appOldOpacity, appNewOpacity);
const i1 = app.indexOf("  for (const leaf of leaves) {\n    const c1x = hub.x + (leaf.x - hub.x) * 0.32");
const i2 = app.indexOf("  const leafButtons = leaves", i1);
if (i1 < 0 || i2 < 0) throw new Error("loop markers missing");
const oldLoop = app.slice(i1, i2);
if (!oldLoop.includes("lineage-path--twig")) throw new Error("twig not in loop");
const newLoop = `  for (const leaf of leaves) {
    const Lx = leaf.x;
    const Ly = leaf.y;
    const dx = Lx - hub.x;
    const dy = Ly - hub.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const px = -uy;
    const py = ux;
    const j = leaf.i;

    const f1t = 0.32 + (j % 5) * 0.028;
    const f2t = 0.58 + (j % 4) * 0.045;
    let f1x = hub.x + dx * f1t + px * (10 + Math.sin(j * 1.73) * 7);
    let f1y = hub.y + dy * f1t + Math.cos(j * 1.19) * 6;
    let f2x = hub.x + dx * f2t + px * (5 + Math.cos(j * 2.07) * 9);
    let f2y = hub.y + dy * f2t - 4;
    f1x = Math.max(28, Math.min(W - 28, f1x));
    f1y = Math.max(40, Math.min(H - 28, f1y));
    f2x = Math.max(28, Math.min(W - 28, f2x));
    f2y = Math.max(36, Math.min(Ly + 2, f2y));

    const h11x = hub.x - Math.sin(j * 0.91) * 10;
    const h11y = hub.y - 20;
    const h12x = f1x - ux * 14;
    const h12y = f1y + uy * 12;
    paths +=
      '<path class="lineage-path lineage-path--branch" d="M ' +
      hub.x +
      " " +
      hub.y +
      " C " +
      h11x +
      " " +
      h11y +
      ", " +
      h12x +
      " " +
      h12y +
      ", " +
      f1x +
      " " +
      f1y +
      '" />';

    const m21x = f1x + px * 11 + Math.sin(j * 1.4) * 6;
    const m21y = f1y + (dy / dist) * 10;
    const m22x = f2x - ux * 12;
    const m22y = f2y + uy * 8;
    paths +=
      '<path class="lineage-path lineage-path--sub" d="M ' +
      f1x +
      " " +
      f1y +
      " C " +
      m21x +
      " " +
      m21y +
      ", " +
      m22x +
      " " +
      m22y +
      ", " +
      f2x +
      " " +
      f2y +
      '" />';

    const n31x = f2x + px * 7;
    const n31y = f2y - 5;
    const n32x = Lx - ux * 16 - px * 4;
    const n32y = Ly - uy * 16 + 3;
    paths +=
      '<path class="lineage-path lineage-path--hair" d="M ' +
      f2x +
      " " +
      f2y +
      " C " +
      n31x +
      " " +
      n31y +
      ", " +
      n32x +
      " " +
      n32y +
      ", " +
      Lx +
      " " +
      Ly +
      '" />';
  }
`;
app = app.slice(0, i1) + newLoop + app.slice(i2);
fs.writeFileSync(pathApp, app);
const pathHtml = "e:/nextbook-demo/index.html";
let html = fs.readFileSync(pathHtml, "utf8");
html = html.replace("像一棵树一样慢慢长出来", "用自下而上的根系分叉描线长出来");
html = html.replace("树就会开始长", "根系就会开始长");
fs.writeFileSync(pathHtml, html);
console.log("app.js + index.html patched");

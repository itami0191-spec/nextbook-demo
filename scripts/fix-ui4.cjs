const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
const lines = fs.readFileSync(p, "utf8").split(/\n/);
function fixAssignment(prefix, replacement) {
  const i = lines.findIndex(
    l =>
      l.includes(prefix) &&
      l.includes("textContent =") &&
      !l.trimEnd().endsWith('";')
  );
  if (i === -1) {
    const j = lines.findIndex(l => l.includes(prefix) && l.includes("textContent ="));
    console.log("try", prefix, "idx", j, j >= 0 ? JSON.stringify(lines[j]) : "");
    throw new Error("fix fail " + prefix);
  }
  lines[i] = replacement;
}
fixAssignment(
  "DOM.randomGenerateBtn",
  '    DOM.randomGenerateBtn.textContent = "\u968f\u673a\u6311\u4e66\u4e2d\u2026";'
);
fixAssignment(
  "DOM.anchorNote",
  '    DOM.anchorNote.textContent = "\u672c\u8f6e\u968f\u673a\u63a8\u8350\uff1a\u300a" + seed.title + "\u300b";'
);
const gi = lines.findIndex(
  l =>
    l.includes("DOM.generateBtn.textContent =") &&
    l.includes("åŒ") &&
    !l.trimEnd().endsWith('";')
);
if (gi === -1) throw new Error("generate");
lines[gi] = '  DOM.generateBtn.textContent = "\u5339\u914d\u4e66\u76ee\u4e2d\u2026";';
const ti = lines.findIndex(
  l => l.includes("DOM.traitInput.value =") && !l.trimEnd().endsWith('";')
);
if (ti === -1) throw new Error("trait");
lines[ti] = '  DOM.traitInput.value = "\u51b7\u5cfb, \u975e\u7ebf\u6027\u53d9\u4e8b, \u601d\u60f3\u6027";';
fs.writeFileSync(p, lines.join("\n"));
console.log("fixed", gi, ti);

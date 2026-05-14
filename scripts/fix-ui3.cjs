const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
const lines = fs.readFileSync(p, "utf8").split(/\n/);
function setLine(pred, newLine) {
  const i = lines.findIndex(pred);
  if (i === -1) throw new Error("not found");
  lines[i] = newLine;
}
setLine(
  l => l.includes("DOM.randomGenerateBtn.textContent = ") && l.includes("éš"),
  '    DOM.randomGenerateBtn.textContent = "\u968f\u673a\u6311\u4e66\u4e2d\u2026";'
);
setLine(
  l => l.includes("DOM.anchorNote.textContent = ") && l.includes("seed.title"),
  '    DOM.anchorNote.textContent = "\u672c\u8f6e\u968f\u673a\u63a8\u8350\uff1a\u300a" + seed.title + "\u300b";'
);
setLine(
  l => l.trim().startsWith("DOM.generateBtn.textContent = ") && l.includes("åŒ"),
  '  DOM.generateBtn.textContent = "\u5339\u914d\u4e66\u76ee\u4e2d\u2026";'
);
setLine(
  l => l.includes("DOM.traitInput.value = ") && l.includes("å†"),
  '  DOM.traitInput.value = "\u51b7\u5cfb, \u975e\u7ebf\u6027\u53d9\u4e8b, \u601d\u60f3\u6027";'
);
fs.writeFileSync(p, lines.join("\n"));
console.log("all ui ok");

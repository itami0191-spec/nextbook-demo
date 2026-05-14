const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
const lines = fs.readFileSync(p, "utf8").split(/\n/);
const fixes = [
  ["DOM.randomGenerateBtn.textContent = ", 'DOM.randomGenerateBtn.textContent = "\\u968f\\u673a\\u6311\\u4e66\\u4e2d\\u2026";'],
  ["DOM.anchorNote.textContent = \"本轮随机", 'DOM.anchorNote.textContent = "\\u672c\\u8f6e\\u968f\\u673a\\u63a8\\u8350\\uff1a\\u300a" + seed.title + "\\u300b";'],
  ["DOM.generateBtn.textContent = \"匹配", 'DOM.generateBtn.textContent = "\\u5339\\u914d\\u4e66\\u76ee\\u4e2d\\u2026";'],
  ["DOM.traitInput.value = \"冷峻", 'DOM.traitInput.value = "\\u51b7\\u5cfb, \\u975e\\u7ebf\\u6027\\u53d9\\u4e8b, \\u601d\\u60f3\\u6027";']
];
for (const [needle, replacement] of fixes) {
  const i = lines.findIndex(l => l.includes(needle));
  if (i === -1) {
    console.error("missing", needle.slice(0, 40));
    process.exit(1);
  }
  lines[i] = "    " + replacement.trim();
  if (needle.includes("traitInput")) lines[i] = "  " + replacement.trim();
  if (needle.includes("generateBtn")) lines[i] = "  " + replacement.trim();
}
fs.writeFileSync(p, lines.join("\n"));
console.log("ui strings ok");

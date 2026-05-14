const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
const lines = fs.readFileSync(p, "utf8").split(/\n/);
const pairs = [
  [2364, '    DOM.randomGenerateBtn.textContent = "\u968f\u673a\u6311\u4e66\u4e2d\u2026";'],
  [2369, '    showMessage("\u4e66\u5e93\u4e3a\u7a7a\uff0c\u6682\u65f6\u65e0\u6cd5\u968f\u673a\u63a8\u8350\u3002");'],
  [2386, '    majorDimensions: ["\u968f\u673a\u63a8\u8350"],'],
  [2398, '    DOM.anchorNote.textContent = "\u672c\u8f6e\u968f\u673a\u63a8\u8350\uff1a\u300a" + seed.title + "\u300b";'],
  [2416, '    showMessage("\u8bf7\u5148\u8f93\u5165\u4e00\u672c\u4e66\u3002");'],
  [2424, '  DOM.generateBtn.textContent = "\u5339\u914d\u4e66\u76ee\u4e2d\u2026";'],
  [2425, '  showMessage("\u6b63\u5728\u5339\u914d\u8fd9\u672c\u4e66\uff08\u542b\u8054\u7f51\u67e5\u8be2 Open Library\uff09\u2026");'],
  [2437, '    showMessage("\u672a\u8bc6\u522b\u5230\u53ef\u5339\u914d\u7684\u4e66\u7c4d\u3002\u53ef\u7f29\u77ed\u4e3b\u4e66\u540d\u3001\u53bb\u6389\u526f\u6807\u9898\uff0c\u6216\u7a0d\u540e\u518d\u8bd5\u3002");'],
  [2492, '  DOM.traitInput.value = "\u51b7\u5cfb, \u975e\u7ebf\u6027\u53d9\u4e8b, \u601d\u60f3\u6027";']
];
for (const [idx, content] of pairs) {
  if (lines[idx] === undefined) throw new Error("bad idx " + idx);
  lines[idx] = content;
}
fs.writeFileSync(p, lines.join("\n"));
console.log("line patches ok");

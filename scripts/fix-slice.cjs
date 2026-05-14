const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const a = s.indexOf("function titlesReadingFlow(matchedBooks, max = 3) {");
const b = s.indexOf("\n\nfunction phrasePick", a);
if (a === -1 || b === -1) throw new Error("markers " + a + " " + b);
const neu = `function titlesReadingFlow(matchedBooks, max = 3) {
  return matchedBooks
    .slice(0, max)
    .map(b => {
      const t = b && b.title != null ? String(b.title).trim() : "";
      return t ? "\u300a" + t + "\u300b" : "";
    })
    .filter(Boolean)
    .join("\u3001");
}`;
s = s.slice(0, a) + neu + s.slice(b);

const lines = s.split(/\n/);
const anchorIdx = lines.findIndex(
  l => l.includes("DOM.anchorNote.textContent = `") && l.includes("inputBooks[0].title")
);
if (anchorIdx === -1) throw new Error("anchor line not found");
lines[anchorIdx] =
  "      DOM.anchorNote.textContent =\n        \"\\u53ea\\u53d6\\u4e86\\u7b2c\\u4e00\\u672c\\u300a\" + inputBooks[0].title + \"\\u300b\\u5f53\\u951a\\u70b9\\uff1b\\u5176\\u4f59\\u4e66\\u540d\\u6ca1\\u53c2\\u4e0e\\u8fd9\\u8f6e\\u3002\";";
s = lines.join("\n");

fs.writeFileSync(p, s);
console.log("slice-fix ok");

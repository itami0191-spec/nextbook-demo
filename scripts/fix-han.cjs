const fs = require("fs");
const p = require("path").join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const neu = `function hanTitleAliases(clean) {
  const a = String(clean).trim();
  if (!a) return [a];
  const out = new Set([a]);
  const t = a.replace(/游/g, "遊").replace(/戏/g, "戲").replace(/国/g, "國").replace(/湾/g, "灣").replace(/间/g, "間");
  if (t !== a) out.add(t);
  return [...out];
}`;
const start = s.indexOf("function hanTitleAliases(clean) {");
const end = s.indexOf("function matchOneBookLocal", start);
if (start === -1 || end === -1) throw new Error("hanTitleAliases markers");
s = s.slice(0, start) + neu + "\n\n" + s.slice(end);
fs.writeFileSync(p, s);
console.log("hanTitleAliases ok");

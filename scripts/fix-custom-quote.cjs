const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const bad =
  '? "Closest to your custom traits: "" + trait0 + ""."';
const good =
  "? \"Closest to your custom traits: '\" + trait0 + \"'.\"";
if (!s.includes(bad)) {
  console.log("bad not found, try alt");
  const idx = s.indexOf("Closest to your custom traits");
  console.log("idx", idx, s.slice(idx, idx + 80));
  process.exit(1);
}
s = s.replace(bad, good);
fs.writeFileSync(p, s);
console.log("quote fix ok");

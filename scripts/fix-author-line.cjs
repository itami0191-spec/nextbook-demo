const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
s = s.replace(
  /const author = Array\.isArray\(authors\) && authors\.length \? authors\[0\] : "[^"]*";/,
  'const author = Array.isArray(authors) && authors.length ? authors[0] : "\u672a\u77e5\u4f5c\u8005";'
);
fs.writeFileSync(p, s);
console.log("author line ok");

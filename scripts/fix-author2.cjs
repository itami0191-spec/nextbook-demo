const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const re = /const author = Array\.isArray\(authors\) && authors\.length \? authors\[0\] : ".*?\?;/;
if (!re.test(s)) throw new Error("no match");
s = s.replace(
  re,
  'const author = Array.isArray(authors) && authors.length ? authors[0] : "\u672a\u77e5\u4f5c\u8005";'
);
fs.writeFileSync(p, s);
console.log("author fixed");

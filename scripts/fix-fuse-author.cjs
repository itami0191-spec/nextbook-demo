const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const re =
  /const author = \(book && book\.author\) \? String\(book\.author\) : "[^"]*?";\r?\n  const tags/;
const neu =
  'const author = (book && book.author) ? String(book.author) : "\\u672a\\u77e5\\u4f5c\\u8005";\n  const tags';
const m = s.match(re);
console.log(m ? "matched" : "no match");
if (m) {
  s = s.replace(re, neu.replace(/\\\\u/g, "\\u"));
  fs.writeFileSync(p, s);
}

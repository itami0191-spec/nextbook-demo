const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let lines = fs.readFileSync(p, "utf8").split(/\n/);
const li = lines.findIndex(
  l => l.includes("const author = (book && book.author)") && l.includes("String(book.author)")
);
if (li === -1) throw new Error("fuse author line not found");
lines[li] =
  '  const author = (book && book.author) ? String(book.author) : "\u672a\u77e5\u4f5c\u8005";';
fs.writeFileSync(p, lines.join("\n"));
console.log("fuse author line", li);

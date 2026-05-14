const fs = require("fs");
const path = require("path");
const appPath = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(appPath, "utf8");
const start = s.indexOf("const BOOKS = [");
const end = s.indexOf("\n];\n\nfunction hashSeedInt");
if (start === -1 || end === -1) throw new Error("markers");
let block = s.slice(start, end + "\n];".length);
const q = String.fromCharCode(34);
const reps = [
  ["?, year:", q + ", year:"],
  ["?, author:", q + ", author:"],
  ["?, dimensions:", q + ", dimensions:"],
  ["?, links:", q + ", links:"],
  ["?, " + q, q + ", " + q],
  ["?,]", q + "]"],
  ["?] },", q + "] },"],
  ["?],", q + "],"]
];
for (const [a, b] of reps) {
  while (block.includes(a)) block = block.split(a).join(b);
}
s = s.slice(0, start) + block + s.slice(end + "\n];".length);
fs.writeFileSync(appPath, s, "utf8");
console.log("repair ok");

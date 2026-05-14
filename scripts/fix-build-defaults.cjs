const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
s = s.replace(
  /const title = candidate && candidate\.title \? String\(candidate\.title\) : "[^"]*";/,
  'const title = candidate && candidate.title ? String(candidate.title) : "Untitled";'
);
s = s.replace(
  /const author = candidate && candidate\.author \? String\(candidate\.author\) : "[^"]*";/,
  'const author = candidate && candidate.author ? String(candidate.author) : "Unknown author";'
);
s = s.replace(
  /const year = Number\.isFinite\(Number\(candidate && candidate\.year\)\) \? Number\(candidate\.year\) : "[^"]*";/,
  'const year = Number.isFinite(Number(candidate && candidate.year)) ? Number(candidate.year) : "Year unknown";'
);
fs.writeFileSync(p, s);
console.log("buildCompact defaults ok");

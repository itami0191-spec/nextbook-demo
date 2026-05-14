const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
const lines = fs.readFileSync(p, "utf8").split(/\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const title = candidate") && lines[i].includes("String(candidate.title)")) {
    lines[i] = '  const title = candidate && candidate.title ? String(candidate.title) : "Untitled";';
  }
  if (lines[i].includes("const author = candidate") && lines[i].includes("String(candidate.author)")) {
    lines[i] = '  const author = candidate && candidate.author ? String(candidate.author) : "Unknown author";';
  }
  if (lines[i].includes("const year = Number.isFinite") && lines[i].includes("candidate.year")) {
    lines[i] =
      '  const year = Number.isFinite(Number(candidate && candidate.year)) ? Number(candidate.year) : "Year unknown";';
  }
}
fs.writeFileSync(p, lines.join("\n"));
console.log("line replace ok");

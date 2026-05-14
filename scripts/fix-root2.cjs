const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
const lines = fs.readFileSync(p, "utf8").split(/\n/);
const li = lines.findIndex(l => l.includes("rootNode.textContent"));
if (li === -1) throw new Error("no rootNode line");
lines[li] = '  rootNode.textContent = "\u4f60";';
fs.writeFileSync(p, lines.join("\n"));
console.log("line", li, JSON.stringify(lines[li]));

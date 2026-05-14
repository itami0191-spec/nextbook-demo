const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
s = s.replace(/rootNode\.textContent = "ä½\?;/, 'rootNode.textContent = "\u4f60";');
fs.writeFileSync(p, s);
console.log("root node ok");

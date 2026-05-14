const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const bad = "? authors[0] : ";
// line is: ... authors[0] : "未知作�?;
const needle = "authors[0] : \"未知作�?;";
// actually file has ternary: authors.length ? authors[0] : "...
const needle2 = "? authors[0] : \"未知作�?;";

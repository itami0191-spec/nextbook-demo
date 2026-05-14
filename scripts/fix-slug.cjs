const fs = require("fs");
const p = require("path").join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const bad = '.replace(/[^a-z0-9涓€-榭縘+/gi, "-")';
const good = '.replace(/[^a-z0-9\\u4e00-\\u9fff]+/gi, "-")';
if (!s.includes(bad)) throw new Error("slug pattern not found");
s = s.replace(bad, good);
fs.writeFileSync(p, s);
console.log("slug ok");

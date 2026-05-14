const fs = require("fs");
const p = require("path").join(__dirname, "..", "app.js");
const s = fs.readFileSync(p, "utf8");
const m = s.match(/function titlesReadingFlow[\s\S]{0,300}/);
console.log(m ? m[0] : "none");

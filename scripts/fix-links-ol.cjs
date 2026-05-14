const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const blockOld = `  const links = [
    "鑱旂綉鍖归厤锛圤pen Library锛?,
    workKey ? "鏉＄洰锛? + workKey : "https://openlibrary.org"
  ];`;
const blockNeu = `  const links = [
    "\u8054\u7f51\u5339\u914d\uff08Open Library\uff09",
    workKey ? "\u4e3b\u9898\u7ebf\u7d22\uff1a" + workKey : "https://openlibrary.org"
  ];`;
if (!s.includes(blockOld.split("\n")[0])) throw new Error("links block start missing");
s = s.replace(blockOld, blockNeu);
fs.writeFileSync(p, s);
console.log("links ok");

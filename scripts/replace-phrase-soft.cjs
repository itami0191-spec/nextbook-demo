const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const a = s.indexOf("function phrasePick(seed, options) {");
const b = s.indexOf("function truncateAtBoundary", a);
if (a === -1 || b === -1) throw new Error("slice " + a + " " + b);
const neu = `function phrasePick(seed, options) {
  const opts = Array.isArray(options)
    ? options.filter(x => typeof x === "string" && x.length > 0)
    : [];
  if (!opts.length) return "\u968f\u673a\u63a8\u8350";

  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let h2 = str.length | 0;
  for (let i = 0; i < str.length; i += 1) {
    h2 = ((h2 << 5) - h2 + str.charCodeAt(i)) | 0;
  }
  const idx = (h >>> 0) ^ (h2 >>> 0);
  const pick = opts[idx % opts.length];
  return pick || opts[0];
}

function softTagVibe(book, retrySalt = "") {
  const rawTags = book && book.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.map(x => (x == null ? "" : String(x).trim())).filter(Boolean)
    : [];
  const sid = ((book && (book.id || book.title)) || "") + "|" + retrySalt;

  if (tags.length >= 2) {
    return phrasePick(sid + "-v2-" + tags[0] + "-" + tags[1], [
      "\u6807\u7b7e" + tags[0] + "\u548c" + tags[1] + "\u62fc\u5728\u4e00\u8d77\u5f88\u597d\u8ba4\u3002",
      "\u4e3b\u8981\u770b" + tags[0] + "\u4e0e" + tags[1] + "\u8fd9\u6761\u7ebf\u3002",
      "\u8bfb\u8d77\u6765" + tags[0] + "\u3001" + tags[1] + "\u90fd\u8fd8\u5728\u3002"
    ]);
  }

  if (tags.length === 1) {
    return phrasePick(sid + "-v1-" + tags[0], [
      "\u4e2d\u5fc3\u6807\u7b7e\u504f" + tags[0] + "\u3002",
      "\u5148\u4ece" + tags[0] + "\u8fd9\u6761\u7ebf\u8fdb\u53bb\u3002"
    ]);
  }

  return phrasePick(sid + "-v0", [
    "\u6807\u7b7e\u4e0d\u591a\uff0c\u4f46\u8bfb\u611f\u8fd8\u633a\u7a33\u3002",
    "\u5148\u5230\u6587\u672c\u91cc\u627e\u811a\u624b\u611f\u3002"
  ]);
}

`;
s = s.slice(0, a) + neu + s.slice(b);
fs.writeFileSync(p, s);
console.log("phrasePick+softTag replaced");

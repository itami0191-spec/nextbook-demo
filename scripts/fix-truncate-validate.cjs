const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const a = s.indexOf("function truncateAtBoundary(s, maxLen) {");
const b = s.indexOf("function fuseTwoDims", a);
if (a === -1 || b === -1) throw new Error("truncate/fuse markers");
const neu = `function truncateAtBoundary(s, maxLen) {
  const str = s == null ? "" : String(s);
  if (!str || str.length <= maxLen) return str;
  const cut = str.slice(0, Math.max(0, maxLen - 1));
  const idx = Math.max(
    cut.lastIndexOf("\u3002"),
    cut.lastIndexOf("\uff01"),
    cut.lastIndexOf("\uff1f")
  );
  if (idx >= Math.floor(maxLen * 0.35)) return cut.slice(0, idx + 1);
  return cut + "\u2026";
}

function validateReason(text) {
  const st = String(text || "");
  const blocked = [
    "\u610f\u5916\u5730\u4e0d\u6253\u67b6",
    "\u6211\u4e5f\u8bf4\u4e0d\u6e05\u4e3a\u5565",
    "\u987a\u7740XX\u8bfb\u4e0b\u6765",
    "\u5f80\u4eba\u624b\u91cc\u585e",
    "\u8fd9\u672c\u6211\u4f1a\u653e\u5728\u624b\u8fb9\u63a8\u8350",
    "\u5f80\u4eba\u624b\u91cc\u585e\u8fd9\u672c\u6211\u4f1a\u653e\u5728\u624b\u8fb9\u63a8\u8350",
    "\u4e24\u6761\u7ebf\u90fd\u5199\u5f97\u5f88\u5b9e\u5728",
    "\u8fd9\u4e2a\u70b9\u6211\u5728\u5e97\u91cc\u4f1a\u76f4\u63a5\u5148\u8bb2\u7ed9\u4eba\u542c",
    "\u8fd9\u672c\u6211\u901a\u5e38\u4f1a\u5148\u9012\u5230\u67dc\u53f0\u524d",
    "\u8fd9\u672c\u6700\u9192\u76ee\u7684\u5c31\u662f",
    "\u8bfb\u8d77\u6765\u5f88\u624e\u5b9e",
    "\u8fd9\u4e2a\u70b9\u6211\u4e00\u822c\u4f1a\u5728\u5e97\u91cc\u5148\u8ddf\u4eba\u626f\u626f\u6e05\u695a"
  ];
  return !blocked.some(x => st.includes(x));
}

`;
s = s.slice(0, a) + neu + s.slice(b);
s = s.replace(
  /const author = \(book && book\.author\) \? String\(book\.author\) : "[^"]*";/,
  'const author = (book && book.author) ? String(book.author) : "\u672a\u77e5\u4f5c\u8005";'
);
fs.writeFileSync(p, s);
console.log("truncate+validate+fuse author ok");

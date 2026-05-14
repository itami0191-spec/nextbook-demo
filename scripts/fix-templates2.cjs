const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");

const oldFlow = `function titlesReadingFlow(matchedBooks, max = 3) {
  return matchedBooks
    .slice(0, max)
    .map(b => {
      const t = b && b.title != null ? String(b.title).trim() : "";
      return t ? `銆?{t}銆媊 : "";
    })
    .filter(Boolean)
    .join("銆?);
}`;

const newFlow = `function titlesReadingFlow(matchedBooks, max = 3) {
  return matchedBooks
    .slice(0, max)
    .map(b => {
      const t = b && b.title != null ? String(b.title).trim() : "";
      return t ? "\\u300a" + t + "\\u300b" : "";
    })
    .filter(Boolean)
    .join("\\u3001");
}`;

if (!s.includes("titlesReadingFlow(matchedBooks")) throw new Error("flow");
s = s.replace(oldFlow, newFlow.replace(/\\\\u/g, "\\u"));

const oldAnchor = `      DOM.anchorNote.textContent = \`鍙彇浜嗙涓€鏈€?{inputBooks[0].title}銆嬪綋閿氱偣锛涘叾浣欎功鍚嶆病鍙備笌杩欒疆銆俙;
      DOM.anchorNote.removeAttribute("hidden");`;

const newAnchor = `      DOM.anchorNote.textContent =
        "\\u53ea\\u53d6\\u4e86\\u7b2c\\u4e00\\u672c\\u300a" + inputBooks[0].title + "\\u300b\\u5f53\\u951a\\u70b9\\uff1b\\u5176\\u4f59\\u4e66\\u540d\\u6ca1\\u53c2\\u4e0e\\u8fd9\\u8f6e\\u3002";
      DOM.anchorNote.removeAttribute("hidden");`;

if (!s.includes("DOM.anchorNote.textContent = `")) {
  // try fuzzy
  s = s.replace(
    /DOM\.anchorNote\.textContent = `[^`]*\?;\s*\n\s*DOM\.anchorNote\.removeAttribute\("hidden"\);/,
    newAnchor.replace(/\\\\u/g, "\\u")
  );
} else {
  s = s.replace(oldAnchor, newAnchor.replace(/\\\\u/g, "\\u"));
}

fs.writeFileSync(p, s);
console.log("flow+anchor ok");

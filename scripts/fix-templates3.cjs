const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const flowRe =
  /function titlesReadingFlow\(matchedBooks, max = 3\) \{\n  return matchedBooks[\s\S]*?\n\}\n\nfunction phrasePick/;
const flowNeu = `function titlesReadingFlow(matchedBooks, max = 3) {
  return matchedBooks
    .slice(0, max)
    .map(b => {
      const t = b && b.title != null ? String(b.title).trim() : "";
      return t ? "\u300a" + t + "\u300b" : "";
    })
    .filter(Boolean)
    .join("\u3001");
}

function phrasePick`;
if (!flowRe.test(s)) throw new Error("titlesReadingFlow block not found");
s = s.replace(flowRe, flowNeu);

const anchorRe =
  /DOM\.anchorNote\.textContent = `[\s\S]*?`;\s*\n\s*DOM\.anchorNote\.removeAttribute\("hidden"\);/;
const anchorNeu = `DOM.anchorNote.textContent =
        "\u53ea\u53d6\u4e86\u7b2c\u4e00\u672c\u300a" + inputBooks[0].title + "\u300b\u5f53\u951a\u70b9\uff1b\u5176\u4f59\u4e66\u540d\u6ca1\u53c2\u4e0e\u8fd9\u8f6e\u3002";
      DOM.anchorNote.removeAttribute("hidden");`;
if (!anchorRe.test(s)) throw new Error("anchor block not found");
s = s.replace(anchorRe, anchorNeu);

fs.writeFileSync(p, s);
console.log("fixed flow+anchor");

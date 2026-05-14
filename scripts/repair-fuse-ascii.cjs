const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const a = s.indexOf("  let fact = \"\";\n  if (d0 === \"lineage\") {");
const b = s.indexOf("  return truncateAtBoundary(fact + tail, maxLen);", a);
if (a === -1 || b === -1) throw new Error("markers");
const neu = `  let fact = "";
  if (d0 === "lineage") {
    fact = year
      ? "Year " + year + " situates it clearly in a reading lineage."
      : "It scores on lineage, but the year field is missing.";
  } else if (d0 === "contemporary") {
    fact = year
      ? "First published in " + year + ", which matches its contemporary context."
      : "Contemporary context still reads, but the year is missing.";
  } else if (d0 === "themes") {
    fact =
      tag0 && tag1
        ? "The most visible thematic thread is " + tag0 + " and " + tag1 + "."
        : tag0
          ? "The most visible thematic thread is " + tag0 + "."
          : "Theme tags are incomplete.";
  } else if (d0 === "custom") {
    fact = trait0
      ? "Closest to your custom traits: \"" + trait0 + "\"."
      : "No custom traits filled in; this follows the default taste.";
  } else {
    fact = hint0
      ? "The hardest factual hook is: " + hint0 + "."
      : "No extra hook; ranking follows the dimension scores.";
  }

  const tail = phrasePick(sid + "-tail-" + d0 + "-" + String(year || "x"), [
    "I would usually argue this point with someone in the shop first.",
    "Grab this angle first and you will not drift too far.",
    "I mostly hand it over on the strength of that one fact.",
    "Start from this point and you save a lot of detours."
  ]);

`;
s = s.slice(0, a) + neu + s.slice(b);
fs.writeFileSync(p, s);
console.log("fuse ascii patch ok");

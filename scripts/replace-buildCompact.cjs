const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "app.js");
let s = fs.readFileSync(p, "utf8");
const a = s.indexOf("function buildCompactReason(candidate, dimensionRanking, matchedBooks, traits) {");
const b = s.indexOf("function scoreBook(candidate, weights, matchedBooks, traits, opts = {}) {", a);
if (a === -1 || b === -1) throw new Error("buildCompact markers");
const neu = `function buildCompactReason(candidate, dimensionRanking, matchedBooks, traits) {
  const d0 = dimensionRanking[0] || { key: "", label: "" };
  const d1 = dimensionRanking[1] || { key: "", label: "" };
  const hints = pickHintsFromLinks(candidate);

  const title = candidate && candidate.title ? String(candidate.title) : "Untitled";
  const author = candidate && candidate.author ? String(candidate.author) : "Unknown author";
  const year = Number.isFinite(Number(candidate && candidate.year)) ? Number(candidate.year) : "Year unknown";
  const seed = (candidate && (candidate.id || candidate.title || author)) || author;

  const tryGenerate = attempt => {
    const salt = String(attempt);
    const vibe = softTagVibe(candidate, salt);
    const core = fuseTwoDims(d0.key, d1.key, candidate, matchedBooks, traits, hints, 168, salt);

    const lead = phrasePick(seed + "-lead-" + d0.key + "-" + d1.key + "-" + salt, [
      "On " + title + " I would usually put this one on the counter first, ",
      "If you want one pick right now, I would reach for " + title + ", ",
      title + " is the kind of title I bring up unprompted in the shop, ",
      "With " + title + " I tend to mention it before people even ask, "
    ]);

    const meta = phrasePick(seed + "-meta-" + year + "-" + salt, [
      author + " wrote it; year " + year + ". ",
      "Author " + author + "; published " + year + ". ",
      year + " edition; author " + author + ". "
    ]);

    return (lead + meta + vibe + core)
      .replace(/undefined/g, "")
      .replace(/\\s{2,}/g, " ")
      .trim();
  };

  let line = "";
  for (let attempt = 0; attempt <= 3; attempt += 1) {
    line = tryGenerate(attempt);
    if (validateReason(line)) break;
  }

  return [truncateAtBoundary(line, REASON_MAX_CHARS)].filter(Boolean);
}

`;
s = s.slice(0, a) + neu + s.slice(b);
fs.writeFileSync(p, s);
console.log("buildCompact replaced");

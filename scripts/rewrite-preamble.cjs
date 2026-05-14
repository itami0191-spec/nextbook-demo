const fs = require("fs");
const path = require("path");
const themes = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "themes.json"), "utf8"));
const appPath = path.join(__dirname, "..", "app.js");
let src = fs.readFileSync(appPath, "utf8");
const marker = "const BOOKS = [";
const idx = src.indexOf(marker);
if (idx === -1) {
  if (src.includes("let BOOKS = []") && src.includes("books.json")) {
    console.error("rewrite-preamble: catalog is external (books.json); skipping rewrite.");
    process.exit(2);
  }
  throw new Error("BOOKS marker missing");
}
const tail = src.slice(idx);
const preamble = `const DIMENSIONS = [
  { key: "lineage", label: "谱系与文学史坐标" },
  { key: "contemporary", label: "同时代作家与语境" },
  { key: "themes", label: "主题关切与语义标签" },
  { key: "custom", label: "自定义阅读特质映射" }
];

const TRAIT_MAP = {
  "冷峻": ["themes", "custom"],
  "非线性叙事": ["lineage", "themes", "custom"],
  "短篇集": ["themes", "custom", "lineage"],
  "思想性": ["lineage", "themes", "custom"],
  "女性叙事": ["themes", "contemporary", "custom"],
  "荒诞": ["lineage", "themes", "custom"],
  "现实主义": ["contemporary", "themes", "custom"],
  "魔幻现实主义": ["lineage", "themes", "custom"]
};

const THEMES = ${JSON.stringify(themes)};

const THEMES_SET = new Set(THEMES);

function pickOlThemeFallbackTags(bookId) {
  const seed = String(bookId || "x");
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const n = 2 + (h % 3);
  const out = [];
  const used = new Set();
  let x = h;
  let guard = 0;
  while (out.length < n && guard < 80) {
    guard += 1;
    x = (Math.imul(x, 1103515245) + 12345) >>> 0;
    const t = THEMES[x % THEMES.length];
    if (!used.has(t)) {
      used.add(t);
      out.push(t);
    }
  }
  return out;
}

function normalizeBookTags(book) {
  const id = book && book.id != null ? String(book.id) : "x";
  const raw = Array.isArray(book && book.tags) ? book.tags : [];
  const tags = [];
  for (const t of raw) {
    const s = String(t || "").trim();
    if (!s || !THEMES_SET.has(s)) continue;
    if (!tags.includes(s)) tags.push(s);
    if (tags.length >= 4) break;
  }
  const fill = pickOlThemeFallbackTags(id);
  for (const t of fill) {
    if (tags.length >= 4) break;
    if (!tags.includes(t)) tags.push(t);
  }
  while (tags.length < 2 && fill.length) {
    const t = fill[(tags.length + id.length) % fill.length];
    if (!tags.includes(t)) tags.push(t);
    else break;
  }
  book.tags = tags.slice(0, 4);
}

`;
fs.writeFileSync(appPath, preamble + tail, "utf8");
console.log("preamble ok, themes count", themes.length);



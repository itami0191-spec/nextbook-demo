/**
 * Legacy: 用 books.json 模拟旧版本地候选池（与当前网页的 Open Library 实时推荐无关）。
 * 运行: node scripts/debug-recommend-pools.cjs
 * 需要项目根目录存在 books.json。
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const booksJsonPath = path.join(root, "books.json");
if (!fs.existsSync(booksJsonPath)) {
  console.error("缺少 books.json。网页端已改为 Open Library 实时推荐，本脚本仅用于离线对照旧本地池。");
  process.exit(1);
}
const BOOKS = JSON.parse(fs.readFileSync(booksJsonPath, "utf8"));
if (!Array.isArray(BOOKS)) throw new Error("books.json must be a JSON array");

function normTitle(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011《》「」]/g, "");
}

function sameWorkAsSeed(book, seed) {
  if (!seed) return false;
  if (seed.id && book.id === seed.id) return true;
  return normTitle(book.title) === normTitle(seed.title) && normTitle(book.author) === normTitle(seed.author);
}

function tagOverlapCount(book, seed) {
  const st = new Set(seed.tags || []);
  let n = 0;
  for (const t of book.tags || []) {
    if (st.has(t)) n += 1;
  }
  return n;
}

function seedLiteraryMovement(seed) {
  if (seed && seed.literary_movement) return String(seed.literary_movement);
  return "\u82f1\u65e5\u5f53\u4ee3";
}

const DIMENSIONS = [
  { key: "lineage", label: "\u8c31\u7cfb\u4e0e\u7ecf\u5178\u5750\u6807" },
  { key: "contemporary", label: "\u540c\u65f6\u4ee3\u4f5c\u5bb6\u4e0e\u8bed\u5883" },
  { key: "themes", label: "\u4e3b\u9898\u5173\u5207\u4e0e\u8bed\u4e49\u6807\u7b7e" },
  { key: "custom", label: "\u81ea\u5b9a\u4e49\u7279\u8d28\u6620\u5c04" }
];

function activeDimensionsForTraits(traits) {
  return traits.length ? DIMENSIONS : DIMENSIONS.filter(d => d.key !== "custom");
}

function logPool(dimKey, pool, weak) {
  const names = pool.map(b => b.title || b.id || String(b));
  const suffix = weak ? " (\u7ef4\u5ea6\u65e0\u547d\u4e2d\u00b7\u5168\u67b6\u56de\u9000)" : "";
  console.log("[pool] " + dimKey + ": " + pool.length + "\u672c \u2192 [" + names.join(", ") + "]" + suffix);
}

function findSeed() {
  const q = normTitle("\u767e\u5e74\u5b64\u72ec");
  return BOOKS.find(b => normTitle(b.title) === q) || BOOKS.find(b => b.title && b.title.includes("\u767e\u5e74\u5b64\u72ec"));
}

const seed = findSeed();
if (!seed) throw new Error("Seed not found");

const traits = [];
const dims = activeDimensionsForTraits(traits);
const seedYear = Number(seed.year);
const y0 = Number.isFinite(seedYear) && seedYear > 1000 && seedYear <= 2030 ? seedYear : 2005;
const seedMove = seedLiteraryMovement(seed);
const picked = new Set(seed.id ? [seed.id] : []);

const basePool = () => BOOKS.filter(b => !picked.has(b.id) && !sameWorkAsSeed(b, seed));
const fallbackPool = () => BOOKS.filter(b => !picked.has(b.id) && !sameWorkAsSeed(b, seed));

console.log("\u79cd\u5b50: \u300a" + seed.title + "\u300b id=" + seed.id + " movement=" + seedMove + " year=" + seed.year);
console.log("\uff08\u4ec5 books.json \u672c\u5730\u6c60\uff1b\u7f51\u9875\u7528 Open Library\uff09");

for (const dim of dims) {
  let pool = [];
  if (dim.key === "contemporary") {
    pool = basePool().filter(b => Math.abs(Number(b.year) - y0) <= 15);
  } else if (dim.key === "lineage") {
    pool = basePool().filter(b => String(b.literary_movement || "") === seedMove);
  } else if (dim.key === "themes") {
    pool = basePool().filter(b => tagOverlapCount(b, seed) >= 1);
  } else if (dim.key === "custom") {
    if (traits.length) {
      pool = basePool().filter(b => traits.some(t => (b.tags || []).includes(t)));
    } else {
      pool = basePool().filter(b => tagOverlapCount(b, seed) >= 1);
    }
  }

  let weak = false;
  if (dim.key === "lineage") {
    if (!pool.length) {
      logPool(dim.key, [], false);
      console.log("  \u2192 \u8c31\u7cfb\u65e0\u5019\u9009\uff0c\u4e0d\u5168\u67b6\u56de\u9000");
    } else {
      logPool(dim.key, pool, false);
    }
  } else if (!pool.length) {
    weak = true;
    pool = fallbackPool();
    logPool(dim.key, pool, weak);
  } else {
    logPool(dim.key, pool, weak);
  }
}

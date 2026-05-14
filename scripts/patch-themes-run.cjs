const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const rulesPath = path.join(__dirname, "ol-theme-rules.json");
const OL_THEME_RULES = JSON.parse(fs.readFileSync(rulesPath, "utf8"));

function inferBody() {
  return `
function inferThemesFromOlSubjects(subjects) {
  const blob = (subjects || []).map(s => String(s).toLowerCase()).join(" ");
  const out = new Set();
  for (const s of subjects || []) {
    const t = String(s).trim();
    if (THEMES_SET.has(t)) out.add(t);
  }
  const groups = ${JSON.stringify(OL_THEME_RULES)};
  for (const g of groups) {
    let hit = false;
    for (const kw of g.k) {
      if (blob.includes(kw)) { hit = true; break; }
    }
    if (hit) for (const tag of g.t) { if (THEMES_SET.has(tag)) out.add(tag); }
  }
  return [...out].slice(0, 4);
}
`;
}

const appPath = path.join(root, "app.js");
let app = fs.readFileSync(appPath, "utf8");

if (!app.includes("function inferThemesFromOlSubjects")) {
  const needle = "  book.tags = tags.slice(0, 4);\n}\n\nconst BOOKS = [";
  if (!app.includes(needle)) throw new Error("BOOKS insert point missing");
  app = app.replace(needle, "  book.tags = tags.slice(0, 4);\n}\n" + inferBody() + "\nconst BOOKS = [");
}

const newTagsFrom = `function tagsFromOlSubjects(subjects) {
  const inferred = inferThemesFromOlSubjects(subjects);
  if (inferred.length >= 2) return inferred.slice(0, 4);
  const seed =
    "ol-subjects|" +
    String((subjects && subjects[0]) || "").slice(0, 48) +
    "|" +
    String((subjects && subjects.length) || 0);
  return pickOlThemeFallbackTags(seed);
}

`;

if (app.includes("function tagsFromOlSubjects(subjects) {")) {
  const start = app.indexOf("function tagsFromOlSubjects(subjects) {");
  const end = app.indexOf("function dimensionsFromOlRemote", start);
  if (start === -1 || end === -1) throw new Error("tagsFromOlSubjects");
  app = app.slice(0, start) + newTagsFrom + app.slice(end);
}

app = app.replace(
  "return /nyt:|new york times|open library staff|staff picks|bestseller|accessible book|protected daisy|in library|^fiction$|^novels$|books and reading|reading level/.test(x);",
  "return /nyt:|new york times|open library staff|staff picks|bestseller|accessible book|protected daisy|in library|^fiction$|^novels$|^literature$|^reading$|books and reading|reading level/.test(x);"
);

if (!app.includes("BOOKS.forEach(normalizeBookTags)")) {
  const m = "\n];\n\nfunction hashSeedInt";
  if (!app.includes(m)) throw new Error("BOOKS end");
  app = app.replace(m, "\n];\n\nBOOKS.forEach(normalizeBookTags);\n\nfunction hashSeedInt");
}

const stubReturn = `  return {
    id,
    title: String(title).slice(0, 120),
    author: String(author).slice(0, 80),
    year,
    tags,
    dimensions,
    links
  };
}`;
const stubNorm = `  const stub = {
    id,
    title: String(title).slice(0, 120),
    author: String(author).slice(0, 80),
    year,
    tags,
    dimensions,
    links
  };
  normalizeBookTags(stub);
  return stub;
}`;
if (app.includes(stubReturn)) app = app.replace(stubReturn, stubNorm);

fs.writeFileSync(appPath, app);

const olPath = path.join(__dirname, "openlibrary-expand.mjs");
let ol = fs.readFileSync(olPath, "utf8");

const insertOl =
  'const OL_THEME_RULES = JSON.parse(fs.readFileSync(path.join(__dirname, "ol-theme-rules.json"), "utf8"));\n' +
  'const THEMES = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "themes.json"), "utf8"));\n' +
  "const THEMES_SET = new Set(THEMES);\n" +
  fs.readFileSync(path.join(__dirname, "ol-fallback-snippet.mjs"), "utf8");

if (!ol.includes("const THEMES = JSON.parse")) {
  ol = ol.replace(
    'const appPath = path.join(__dirname, "..", "app.js");',
    'const appPath = path.join(__dirname, "..", "app.js");\n' + insertOl
  );
}

ol = ol.replace(
  /function pickTags\(subjects\) \{[\s\S]*?return out;\n\}/,
  `function pickTags(subjects, idSeed) {
  const bad = new Set(["accessible book", "protected daisy", "in library", "fiction", "novels", "literature"]);
  const inferred = inferThemesFromOlSubjects(subjects);
  const out = [];
  for (const t of inferred) {
    if (!out.includes(t)) out.push(t);
    if (out.length >= 4) break;
  }
  if (out.length >= 2) return out.slice(0, 4);
  for (const s of subjects || []) {
    const t = String(s).trim();
    if (!t || t.length > 28) continue;
    if (bad.has(t.toLowerCase())) continue;
    if (isMetaSubject(t)) continue;
    if (THEMES_SET.has(t) && !out.includes(t)) out.push(t);
    if (out.length >= 4) break;
  }
  if (out.length >= 2) return out.slice(0, 4);
  return pickOlThemeFallbackTags(idSeed || "ol-expand");
}`
);

const olBlockOld = `  const subjects = Array.isArray(doc.subject) ? doc.subject : [];
  const tags = pickTags(subjects);
  const dims = dimsFromMeta(year, subjects);
  let id = ("ol-" + slug(title) + "-" + slug(author)).replace(/-+/g, "-");
  if (id.length > 80) id = id.slice(0, 80);
  const base = id;
  let n = 0;
  while (usedIds.has(id)) {
    n += 1;
    id = base + "-" + n;
  }
  usedIds.add(id);`;

const olBlockNew = `  const subjects = Array.isArray(doc.subject) ? doc.subject : [];
  let id = ("ol-" + slug(title) + "-" + slug(author)).replace(/-+/g, "-");
  if (id.length > 80) id = id.slice(0, 80);
  const base = id;
  let n = 0;
  while (usedIds.has(id)) {
    n += 1;
    id = base + "-" + n;
  }
  usedIds.add(id);
  const tags = pickTags(subjects, id);
  const dims = dimsFromMeta(year, subjects);`;

if (ol.includes(olBlockOld)) ol = ol.replace(olBlockOld, olBlockNew);

ol = ol.replace(
  'const cut = appSrc.indexOf("\\n];\\n\\nconst DOM");',
  'let cut = appSrc.indexOf("\\n];\\n\\nfunction hashSeedInt");\n  if (cut === -1) cut = appSrc.indexOf("\\n];\\n\\nconst DOM");'
);
ol = ol.replace(
  'if (cut === -1) throw new Error("marker not found");',
  'if (cut === -1) throw new Error("BOOKS end marker not found");'
);

if (!ol.includes("function inferThemesFromOlSubjects")) {
  const inferOl = `
function inferThemesFromOlSubjects(subjects) {
  const blob = (subjects || []).map(s => String(s).toLowerCase()).join(" ");
  const out = new Set();
  for (const s of subjects || []) {
    const t = String(s).trim();
    if (THEMES_SET.has(t)) out.add(t);
  }
  const groups = ${JSON.stringify(OL_THEME_RULES)};
  for (const g of groups) {
    let hit = false;
    for (const kw of g.k) {
      if (blob.includes(kw)) { hit = true; break; }
    }
    if (hit) for (const tag of g.t) { if (THEMES_SET.has(tag)) out.add(tag); }
  }
  return [...out].slice(0, 4);
}
`;
  ol = ol.replace(
    "function pickOlThemeFallbackTags(bookId) {",
    inferOl + "\nfunction pickOlThemeFallbackTags(bookId) {"
  );
}

fs.writeFileSync(olPath, ol);

const indexPath = path.join(root, "index.html");
let html = fs.readFileSync(indexPath, "utf8");
html = html.replace(/构建自己的文学谱系/g, "构建自己的书目谱系");
html = html.replace(/构建你自己的文学谱系/g, "构建你自己的书目谱系");
html = html.replace(/你的文学谱系/g, "你的书目谱系");
fs.writeFileSync(indexPath, html);

console.log("patch-themes complete");

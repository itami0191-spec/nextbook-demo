const fs = require("fs");
const p = "e:/nextbook-demo/app.js";
let s = fs.readFileSync(p, "utf8");

if (s.includes("OL_SEARCH_FIELDS")) {
  console.log("already has OL_SEARCH_FIELDS");
  process.exit(0);
}

// 1) Add olSubjectWordsLower to buildTemporaryBookFromOlDoc return
const retOld = `    links,
    _fromOpenLibrary: true,
    _temporarySeed: true
  };
}`;
const retNew = `    links,
    /** 锚点 Open Library subject 拆成的词（小写），供 themes 维度与候选书 subject 重叠计分 */
    olSubjectWordsLower: [...olSubjectWordSetFromSubjects(subjectsForTags)],
    _fromOpenLibrary: true,
    _temporarySeed: true
  };
}`;
if (!s.includes(retOld)) throw new Error("return block not found");
s = s.replace(retOld, retNew);

// 2) Insert helpers + OL_SEARCH_FIELDS before async function olSearch
const olSearchMarker = "async function olSearch(params) {";
const insertBeforeOlSearch = `const OL_SEARCH_FIELDS = "title,author_name,first_publish_year,subject,language,key";

/** 将 subject 数组拆成可比对的小写词：整条条目 + 按非字母数字/非汉字切分后的片段（长度≥2）。 */
function olSubjectWordSetFromSubjects(subjectsArr) {
  const set = new Set();
  for (const s of subjectsArr || []) {
    if (isMetaSubject(s)) continue;
    const lower = String(s).toLowerCase().trim();
    if (!lower) continue;
    set.add(lower);
    for (const w of lower.split(/[^a-z0-9\\u4e00-\\u9fff]+/)) {
      if (w.length >= 2) set.add(w);
    }
  }
  return set;
}

function olSubjectWordSetFromDoc(doc) {
  const raw = Array.isArray(doc.subject) ? doc.subject : [];
  return olSubjectWordSetFromSubjects(raw);
}

/** 候选 subject 词集与锚点词集的交集大小（越多表示主题越近）。 */
function olSubjectOverlapScore(anchorWordSet, doc) {
  const docSet = olSubjectWordSetFromDoc(doc);
  let n = 0;
  for (const w of docSet) {
    if (anchorWordSet.has(w)) n += 1;
  }
  return n;
}

async function olSearch(params) {`;
if (!s.includes(olSearchMarker)) throw new Error("olSearch not found");
s = s.replace(olSearchMarker, insertBeforeOlSearch);

// 3) Replace olSearch body start - add fields skip and set
const olBodyOld = `async function olSearch(params) {
  const u = new URL("https://openlibrary.org/search.json");
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") u.searchParams.set(k, String(v));
  }
  const urlStr = u.toString();`;
const olBodyNew = `async function olSearch(params) {
  const u = new URL("https://openlibrary.org/search.json");
  for (const [k, v] of Object.entries(params)) {
    if (k === "fields") continue;
    if (v != null && v !== "") u.searchParams.set(k, String(v));
  }
  u.searchParams.set("fields", OL_SEARCH_FIELDS);
  const urlStr = u.toString();`;
if (!s.includes(olBodyOld)) throw new Error("olSearch body not found");
s = s.replace(olBodyOld, olBodyNew);

// 4) Replace themes branch in fetchDimBook
const themesOld = `  if (dimKey === "themes") {
    const tagPool = (seed.tags || []).filter(t => THEMES.includes(t));
    const tag = pickOne(tagPool.length ? tagPool : THEMES) || "fiction";
    const subj = olSubjectForThemeTag(tag);
    const docs = await olSearch({ subject: subj, limit: 10 });
    return pickOne(usable(docs));
  }`;
const themesNew = `  if (dimKey === "themes") {
    const anchorSet = new Set(seed.olSubjectWordsLower || []);
    const tagPool = (seed.tags || []).filter(t => THEMES.includes(t));
    const tag = pickOne(tagPool.length ? tagPool : THEMES) || "fiction";
    const subj = olSubjectForThemeTag(tag);
    let docs = await olSearch({ subject: subj, limit: 50 });
    let pool = usable(docs);
    if (anchorSet.size) {
      const scored = pool
        .map(d => ({ d, score: olSubjectOverlapScore(anchorSet, d) }))
        .filter(x => x.score >= 1)
        .sort((a, b) => b.score - a.score);
      if (scored.length) {
        const best = scored[0].score;
        const top = scored.filter(x => x.score === best).map(x => x.d);
        return pickOne(top);
      }
      docs = await olSearch({ q: seed.title, limit: 50 });
      pool = usable(docs);
      const scored2 = pool
        .map(d => ({ d, score: olSubjectOverlapScore(anchorSet, d) }))
        .filter(x => x.score >= 1)
        .sort((a, b) => b.score - a.score);
      if (scored2.length) {
        const best2 = scored2[0].score;
        const top2 = scored2.filter(x => x.score === best2).map(x => x.d);
        return pickOne(top2);
      }
    }
    return pickOne(pool);
  }`;
if (!s.includes(themesOld)) throw new Error("themes block not found");
s = s.replace(themesOld, themesNew);

fs.writeFileSync(p, s);
console.log("patched themes+fields ok");

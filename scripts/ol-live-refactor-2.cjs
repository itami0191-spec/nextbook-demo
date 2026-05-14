const fs = require('fs');
const p = 'app.js';
let s = fs.readFileSync(p,'utf8');

function mustReplace(oldStr,newStr,name){
  if(!s.includes(oldStr)) throw new Error('missing block: '+name);
  s = s.replace(oldStr,newStr);
}

mustReplace(
`/** 当种子为《百年孤独》时，在控制台输出 books.json 中的完整条目或「未命中」。 */
function logBainianguduBooksJsonMatchIfNeeded(q0, pool) {
  if (normTitle(q0) !== normTitle("百年孤独")) return;
  const jsonHit = pool.find(b => normTitle(b.title) === normTitle("百年孤独"));
  if (jsonHit) {
    console.log("[books.json] 种子「百年孤独」匹配到的完整书目数据：\n" + JSON.stringify(jsonHit, null, 2));
  } else {
    console.log("未命中");
  }
}

function findLocalSeed(query, pool) {
  const q = normTitle(query);
  if (!q) return null;
  for (const b of pool) {
    if (normTitle(b.title) === q) return b;
  }
  for (const b of pool) {
    const t = normTitle(b.title);
    if (t.includes(q) || q.includes(t)) return b;
  }
  for (const b of pool) {
    const au = normTitle(b.author);
    if (au && (q.includes(au) || au.includes(q))) return b;
  }
  return null;
}
`,
`/** 种子为《百年孤独》时，锚点解析后打印 Open Library 临时书目。 */
function logBainianguduOlSeedIfNeeded(q0, seed) {
  if (normTitle(q0) !== normTitle("百年孤独")) return;
  if (seed) console.log("[Open Library 锚点] 百年孤独 →\\n" + JSON.stringify(seed, null, 2));
  else console.log("未命中");
}

`,`replace-log`
);

mustReplace(
`const res = await fetch(u.toString(), { headers: { "User-Agent": "NextbookDemo/1.4 (nextbook-anchor+temp)" } });`,
`const res = await fetch(u.toString(), { headers: { "User-Agent": "NextbookDemo/1.5 (openlibrary-live)" } });`,
`user-agent`
);

mustReplace(
`function showMessage(msg) { DOM.message.textContent = msg || ""; }
function clearMessage() { showMessage(""); }
`,
`function showMessage(msg) { DOM.message.textContent = msg || ""; }
function clearMessage() { showMessage(""); }
function setRecommendLoading(on) {
  if (!on) return;
  DOM.recommendList.innerHTML = '<p class="hint">正在获取推荐…</p>';
}
`,
`loading-helper`
);

const insertAt = s.indexOf('\n\nlet BOOKS = [];');
if (insertAt < 0) throw new Error('insert marker missing');
const extra = `

async function olSearch(params) {
  const u = new URL("https://openlibrary.org/search.json");
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") u.searchParams.set(k, String(v));
  }
  const res = await fetch(u.toString(), { headers: { "User-Agent": "NextbookDemo/1.5 (openlibrary-live)" } });
  if (!res.ok) throw new Error("Open Library HTTP " + res.status);
  const data = await res.json();
  return Array.isArray(data.docs) ? data.docs : [];
}

function olDocTitle(doc) { return Array.isArray(doc.title) ? String(doc.title[0] || "") : String(doc.title || ""); }
function olDocAuthor(doc) { return Array.isArray(doc.author_name) ? String(doc.author_name[0] || "") : ""; }
function olDocYear(doc) { return doc.first_publish_year ? String(doc.first_publish_year) : "—"; }
function olDocSubjects(doc) { return (Array.isArray(doc.subject) ? doc.subject : []).filter(x => !isMetaSubject(x)).slice(0, 8).map(String); }
function pickOne(arr) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }

async function fetchDimBook(dimKey, seed, traits) {
  if (dimKey === "contemporary") {
    const docs = await olSearch({ q: seed.title, first_publish_year: seed.year, limit: 10 });
    return pickOne(docs.filter(d => olDocTitle(d) && olDocAuthor(d)));
  }
  if (dimKey === "lineage") {
    const docs = await olSearch({ subject: seed.literary_movement || "fiction", limit: 10 });
    return pickOne(docs.filter(d => olDocTitle(d) && olDocAuthor(d)));
  }
  if (dimKey === "themes") {
    const tag = (seed.tags && seed.tags[0]) ? seed.tags[0] : "fiction";
    const docs = await olSearch({ subject: tag, limit: 10 });
    return pickOne(docs.filter(d => olDocTitle(d) && olDocAuthor(d)));
  }
  const trait = traits[0] || "fiction";
  const docs = await olSearch({ subject: trait, limit: 10 });
  return pickOne(docs.filter(d => olDocTitle(d) && olDocAuthor(d)));
}

async function buildLiveRecommendations(seed, traits) {
  const dims = activeDimensionsForTraits(traits);
  const out = [];
  for (const dim of dims) {
    if (dim.key === "lineage") {
      const doc = await fetchDimBook("lineage", seed, traits);
      if (!doc) {
        out.push({
          id: "__lineage_empty__",
          title: "暂无同谱系书目",
          author: "",
          year: "",
          tags: [],
          lineageEmpty: true,
          majorDimensionKeys: ["lineage"],
          majorDimensions: [dim.label],
          reasonParagraphs: ["架上暂无与您锚点书目同一谱系（文学史运动标签）的条目，未用其他书填充。"]
        });
        continue;
      }
      out.push({
        id: "ol-lineage-" + slugForOlTempSeed(olDocTitle(doc), olDocAuthor(doc), olDocYear(doc)),
        title: olDocTitle(doc),
        author: olDocAuthor(doc),
        year: olDocYear(doc),
        tags: olDocSubjects(doc),
        olSubjects: olDocSubjects(doc),
        majorDimensionKeys: [dim.key],
        majorDimensions: [dim.label],
        reasonParagraphs: ["按谱系从 Open Library 实时检索，随机抽到这一本。"]
      });
      continue;
    }
    const doc = await fetchDimBook(dim.key, seed, traits);
    if (!doc) continue;
    out.push({
      id: "ol-" + dim.key + "-" + slugForOlTempSeed(olDocTitle(doc), olDocAuthor(doc), olDocYear(doc)),
      title: olDocTitle(doc),
      author: olDocAuthor(doc),
      year: olDocYear(doc),
      tags: olDocSubjects(doc),
      olSubjects: olDocSubjects(doc),
      majorDimensionKeys: [dim.key],
      majorDimensions: [dim.label],
      reasonParagraphs: ["按该维度从 Open Library 实时检索，随机抽到这一本。"]
    });
  }
  return out;
}
`;
s = s.slice(0, insertAt) + extra + s.slice(insertAt);

const runStart = s.indexOf('async function runGenerate(isRandom = false) {');
const runEnd = s.indexOf('\n\nDOM.bookInput.addEventListener', runStart);
if (runStart < 0 || runEnd < 0) throw new Error('runGenerate markers missing');
const runNew = `async function runGenerate(isRandom = false) {
  clearMessage();
  const traits = parseTraits(DOM.traitInput.value);
  DOM.anchorNote.hidden = true;
  DOM.anchorNote.textContent = "";
  switchView(DOM.resultView);
  setRecommendLoading(true);

  if (isRandom) {
    try {
      const docs = await olSearch({ q: "fiction", limit: 10 });
      const doc = pickOne(docs.filter(d => olDocTitle(d) && olDocAuthor(d)));
      if (!doc) throw new Error("empty");
      latestRecommendations = [{
        id: "ol-random-" + slugForOlTempSeed(olDocTitle(doc), olDocAuthor(doc), olDocYear(doc)),
        title: olDocTitle(doc),
        author: olDocAuthor(doc),
        year: olDocYear(doc),
        tags: olDocSubjects(doc),
        olSubjects: olDocSubjects(doc),
        randomOnly: true,
        reasonParagraphs: ["今儿手气随机，从 Open Library 结果里抽的这一本。"],
        majorDimensionKeys: ["all"],
        majorDimensions: []
      }];
      DOM.dimensionFilter.innerHTML = '<option value="all">全部</option>';
      renderRecommendations(latestRecommendations, "all");
      return;
    } catch (e) {
      showMessage("暂时无法获取推荐，请重试");
      DOM.recommendList.innerHTML = '<p class="hint">暂时无法获取推荐，请重试</p>';
      return;
    }
  }

  commitInputToChips();
  if (!selectedBookTitles.length) {
    switchView(DOM.inputView);
    showMessage("请先输入一本书。");
    return;
  }

  const q0 = selectedBookTitles[0];
  let seed;
  try {
    seed = await fetchOpenLibraryAnchor(q0);
  } catch {
    showMessage("暂时无法获取推荐，请重试");
    DOM.recommendList.innerHTML = '<p class="hint">暂时无法获取推荐，请重试</p>';
    return;
  }

  logBainianguduOlSeedIfNeeded(q0, seed);
  if (!seed) {
    showMessage("暂时无法获取推荐，请重试");
    DOM.recommendList.innerHTML = '<p class="hint">暂时无法获取推荐，请重试</p>';
    return;
  }

  try {
    latestRecommendations = await buildLiveRecommendations(seed, traits);
  } catch {
    showMessage("暂时无法获取推荐，请重试");
    DOM.recommendList.innerHTML = '<p class="hint">暂时无法获取推荐，请重试</p>';
    return;
  }

  clearMessage();
  recordLineageTitle(q0);
  updateFilterOptions();
  DOM.dimensionFilter.value = "all";
  renderRecommendations(latestRecommendations, "all");
  DOM.anchorNote.hidden = false;
  DOM.anchorNote.textContent = "推荐来自 Open Library 实时检索。";
  renderLineage();
}
`;
s = s.slice(0, runStart) + runNew + s.slice(runEnd);

mustReplace(
`(async function init() {
  applyTheme(localStorage.getItem("nextbook-theme") || "light");
  try {
    await loadBooksCatalog();
  } catch (e) {
    console.error(e);
    showMessage("无法加载 books.json，请用本地 HTTP 服务打开页面。");
  }
  lineageHistory = loadLineage();
  renderBookChips();
  renderLineage();
  updateFilterOptions();
  initAmbientCoverBackground();
  closeTopbarMenu();
})();`,
`(async function init() {
  applyTheme(localStorage.getItem("nextbook-theme") || "light");
  lineageHistory = loadLineage();
  renderBookChips();
  renderLineage();
  updateFilterOptions();
  initAmbientCoverBackground();
  closeTopbarMenu();
})();`,
`init-no-books-json`
);

fs.writeFileSync(p,s);
console.log('patched');

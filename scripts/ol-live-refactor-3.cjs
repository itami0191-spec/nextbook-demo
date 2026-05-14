const fs=require('fs');
let s=fs.readFileSync('app.js','utf8');

s=s.replace(/\/\*\* 当种子为《百年孤独》时[\s\S]*?function slugForOlTempSeed/,`/** 种子为《百年孤独》时，锚点解析后打印 Open Library 临时书目。 */
function logBainianguduOlSeedIfNeeded(q0, seed) {
  if (normTitle(q0) !== normTitle("百年孤独")) return;
  if (seed) console.log("[Open Library 锚点] 百年孤独 →\\n" + JSON.stringify(seed, null, 2));
  else console.log("未命中");
}

function slugForOlTempSeed`);

s=s.replace(/NextbookDemo\/1\.4 \(nextbook-anchor\+temp\)/g,'NextbookDemo/1.5 (openlibrary-live)');

if(!s.includes('async function olSearch(params)')){
  s=s.replace(/\n\nlet BOOKS = \[\];/,`

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
  if (dimKey === "contemporary") return pickOne((await olSearch({ q: seed.title, first_publish_year: seed.year, limit: 10 })).filter(d => olDocTitle(d) && olDocAuthor(d)));
  if (dimKey === "lineage") return pickOne((await olSearch({ subject: seed.literary_movement || "fiction", limit: 10 })).filter(d => olDocTitle(d) && olDocAuthor(d)));
  if (dimKey === "themes") return pickOne((await olSearch({ subject: (seed.tags && seed.tags[0]) ? seed.tags[0] : "fiction", limit: 10 })).filter(d => olDocTitle(d) && olDocAuthor(d)));
  return pickOne((await olSearch({ subject: traits[0] || "fiction", limit: 10 })).filter(d => olDocTitle(d) && olDocAuthor(d)));
}
async function buildLiveRecommendations(seed, traits) {
  const dims = activeDimensionsForTraits(traits);
  const out = [];
  for (const dim of dims) {
    const doc = await fetchDimBook(dim.key, seed, traits);
    if (dim.key === "lineage" && !doc) {
      out.push({ id: "__lineage_empty__", title: "暂无同谱系书目", author: "", year: "", tags: [], lineageEmpty: true, majorDimensionKeys: ["lineage"], majorDimensions: [dim.label], reasonParagraphs: ["架上暂无与您锚点书目同一谱系（文学史运动标签）的条目，未用其他书填充。"] });
      continue;
    }
    if (!doc) continue;
    out.push({ id: "ol-" + dim.key + "-" + slugForOlTempSeed(olDocTitle(doc), olDocAuthor(doc), olDocYear(doc)), title: olDocTitle(doc), author: olDocAuthor(doc), year: olDocYear(doc), tags: olDocSubjects(doc), olSubjects: olDocSubjects(doc), majorDimensionKeys: [dim.key], majorDimensions: [dim.label], reasonParagraphs: ["按该维度从 Open Library 实时检索，随机抽到这一本。"] });
  }
  return out;
}

let BOOKS = [];`);
}

s=s.replace(/function clearMessage\(\) \{ showMessage\(""\); \}/,`function clearMessage() { showMessage(""); }
function setRecommendLoading(on) {
  if (!on) return;
  DOM.recommendList.innerHTML = '<p class="hint">正在获取推荐…</p>';
}`);

s=s.replace(/async function runGenerate\(isRandom = false\) \{[\s\S]*?\n\}\n\nDOM\.bookInput\.addEventListener/,`async function runGenerate(isRandom = false) {
  clearMessage();
  const traits = parseTraits(DOM.traitInput.value);
  DOM.anchorNote.hidden = true;
  DOM.anchorNote.textContent = "";
  switchView(DOM.resultView);
  setRecommendLoading(true);

  if (isRandom) {
    try {
      const doc = pickOne((await olSearch({ q: "fiction", limit: 10 })).filter(d => olDocTitle(d) && olDocAuthor(d)));
      if (!doc) throw new Error("empty");
      latestRecommendations = [{ id: "ol-random-" + slugForOlTempSeed(olDocTitle(doc), olDocAuthor(doc), olDocYear(doc)), title: olDocTitle(doc), author: olDocAuthor(doc), year: olDocYear(doc), tags: olDocSubjects(doc), olSubjects: olDocSubjects(doc), randomOnly: true, reasonParagraphs: ["今儿手气随机，从 Open Library 结果里抽的这一本。"], majorDimensionKeys: ["all"], majorDimensions: [] }];
      DOM.dimensionFilter.innerHTML = '<option value="all">全部</option>';
      renderRecommendations(latestRecommendations, "all");
      return;
    } catch {
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
  try { seed = await fetchOpenLibraryAnchor(q0); } catch {
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

  try { latestRecommendations = await buildLiveRecommendations(seed, traits); } catch {
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

DOM.bookInput.addEventListener`);

s=s.replace(/\(async function init\(\) \{[\s\S]*?await loadBooksCatalog\(\);[\s\S]*?\}\n  lineageHistory = loadLineage\(\);/,`(async function init() {
  applyTheme(localStorage.getItem("nextbook-theme") || "light");
  lineageHistory = loadLineage();`);

s=s.replace('            <div class="book-title">${item.title}</div>','            <div class="book-title">${item.title}</div>');
s=s.replace('<div class="reason">${(item.reasonParagraphs || []).map(p => `<p class="reason__p">${p}</p>`).join("")}</div>','${(item.olSubjects && item.olSubjects.length) ? `<div class="book-meta">subject：${item.olSubjects.slice(0, 4).join("；")}</div>` : ""}\n        <div class="reason">${(item.reasonParagraphs || []).map(p => `<p class="reason__p">${p}</p>`).join("")}</div>');

fs.writeFileSync('app.js',s);
console.log('ok');

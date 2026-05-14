const fs = require("fs");
const appPath = "e:/nextbook-demo/app.js";
let s = fs.readFileSync(appPath, "utf8");
const i0 = s.indexOf("const BOOKS = [");
const i1 = s.indexOf("\n];\n\nconst DOM", i0);
if (i0 < 0 || i1 < 0) throw new Error("BOOKS markers missing");
const books = new Function("return " + s.slice(i0 + "const BOOKS = ".length, i1 + 2))();

function P(id, title, author, year, mv, tags) {
  return {
    id,
    title,
    author,
    year,
    literary_movement: mv,
    tags,
    dimensions: { lineage: 86, contemporary: 74, authorOther: 72, themes: 87, custom: 72 },
    links: ["books.json"]
  };
}

const additions = [
  P("rulfo-pedro-paramo", "Pedro Paramo", "Juan Rulfo", 1955, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u9b54\u5e7b\u73b0\u5b9e", "\u547d\u8fd0", "\u8bb0\u5fc6\u4e0e\u9057\u5fd8"]),
  P("rulfo-burning-plain", "The Burning Plain", "Juan Rulfo", 1967, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u571f\u5730", "\u9b54\u5e7b\u73b0\u5b9e", "\u5e95\u5c42\u751f\u5b58"]),
  P("cortazar-hopscotch", "Hopscotch", "Julio Cortazar", 1963, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u5143\u5c0f\u8bf4", "\u53d9\u4e8b\u672c\u8eab", "\u75af\u72c2\u4e0e\u7406\u6027"]),
  P("cortazar-all-fires", "All Fires the Fire", "Julio Cortazar", 1966, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u80cc\u53db", "\u5931\u53bb", "\u9b54\u5e7b\u73b0\u5b9e"]),
  P("vargas-time-hero", "The Time of the Hero", "Mario Vargas Llosa", 1963, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u7ae5\u5e74", "\u9636\u7ea7", "\u5e95\u5c42\u751f\u5b58"]),
  P("vargas-aunt-julia", "Aunt Julia and the Scriptwriter", "Mario Vargas Llosa", 1977, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u7231\u60c5", "\u5a5a\u59fb", "\u5143\u5c0f\u8bf4"]),
  P("vargas-conversation", "Conversation in the Cathedral", "Mario Vargas Llosa", 1969, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u8c0e\u8a00\u4e0e\u771f\u5b9e", "\u9636\u7ea7", "\u8bb0\u5fc6\u4e0e\u9057\u5fd8"]),
  P("garcia-cholera", "Love in the Time of Cholera", "Gabriel Garcia Marquez", 1985, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u7231\u60c5", "\u65f6\u95f4\u6d41\u901d", "\u547d\u8fd0"]),
  P("garcia-patriarch", "The Autumn of the Patriarch", "Gabriel Garcia Marquez", 1975, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u6781\u6743", "\u5b64\u72ec", "\u9b54\u5e7b\u73b0\u5b9e"]),
  P("carpentier-kingdom", "The Kingdom of This World", "Alejo Carpentier", 1967, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u5386\u53f2\u91cd\u538b", "\u9769\u547d", "\u9b54\u5e7b\u73b0\u5b9e"]),
  P("carpentier-lost-steps", "The Lost Steps", "Alejo Carpentier", 1953, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u8eab\u4efd\u8ba4\u540c", "\u8bb0\u5fc6\u4e0e\u9057\u5fd8", "\u571f\u5730"]),
  P("asturias-men-maize", "Men of Maize", "Miguel Angel Asturias", 1949, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u571f\u5730", "\u6b96\u6c11", "\u795e\u8bdd\u539f\u578b"]),
  P("borges-aleph", "The Aleph", "Jorge Luis Borges", 1949, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u547d\u8fd0", "\u5b58\u5728\u610f\u4e49", "\u8ff7\u5bab"]),
  P("borges-book-sand", "The Book of Sand", "Jorge Luis Borges", 1975, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u547d\u8fd0", "\u6c89\u9ed8", "\u5143\u5c0f\u8bf4"]),
  P("borges-brodie", "Doctor Brodie's Report", "Jorge Luis Borges", 1970, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u8bb0\u5fc6\u4e0e\u9057\u5fd8", "\u80cc\u53db", "\u6c89\u9ed8"]),
  P("borges-inquisitions", "Other Inquisitions", "Jorge Luis Borges", 1952, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u53d9\u4e8b\u672c\u8eab", "\u8c0e\u8a00\u4e0e\u771f\u5b9e", "\u5b58\u5728\u610f\u4e49"]),
  P("allende-house", "The House of the Spirits", "Isabel Allende", 1982, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u5bb6\u65cf\u53f2", "\u521b\u4f24\u4e0e\u6108\u5408", "\u6027\u522b"]),
  P("arguedas-deep-rivers", "Deep Rivers", "Jose Maria Arguedas", 1958, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u8eab\u4efd\u8ba4\u540c", "\u9636\u7ea7", "\u571f\u5730"]),
  P("onetti-brief-life", "A Brief Life", "Juan Carlos Onetti", 1950, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u5b64\u72ec", "\u5931\u53bb", "\u5b58\u5728\u610f\u4e49"]),
  P("donoso-bird", "The Obscene Bird of Night", "Jose Donoso", 1970, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u9636\u7ea7", "\u5bb6\u65cf\u53f2", "\u75af\u72c2\u4e0e\u7406\u6027"]),
  P("infante-tigers", "Three Trapped Tigers", "Guillermo Cabrera Infante", 1967, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u6000\u65e7", "\u8c0e\u8a00\u4e0e\u771f\u5b9e", "\u9769\u547d"]),
  P("marquez-chronicle", "Chronicle of a Death Foretold", "Gabriel Garcia Marquez", 1981, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u547d\u8fd0", "\u7f6a\u4e0e\u7f5a", "\u8bb0\u5fc6\u4e0e\u9057\u5fd8"]),
  P("fuentes-artemio", "The Death of Artemio Cruz", "Carlos Fuentes", 1962, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u9769\u547d", "\u8bb0\u5fc6\u4e0e\u9057\u5fd8", "\u5386\u53f2\u91cd\u538b"]),
  P("vargas-war-end", "The War of the End of the World", "Mario Vargas Llosa", 1981, "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49", ["\u5386\u53f2\u91cd\u538b", "\u9769\u547d", "\u75af\u72c2\u4e0e\u7406\u6027"]),
  P("baldwin-another", "Another Country", "James Baldwin", 1962, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u79cd\u65cf", "\u7231\u60c5", "\u8eab\u4efd\u8ba4\u540c"]),
  P("roth-portnoy", "Portnoy's Complaint", "Philip Roth", 1969, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u7ae5\u5e74", "\u6267\u5ff5", "\u5a5a\u59fb"]),
  P("updike-rabbit", "Rabbit, Run", "John Updike", 1960, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u5a5a\u59fb", "\u9636\u7ea7", "\u5b58\u5728\u610f\u4e49"]),
  P("spark-brodie", "The Prime of Miss Jean Brodie", "Muriel Spark", 1961, "\u82f1\u65e5\u5f53\u4ee3", ["\u6267\u5ff5", "\u80cc\u53db", "\u6559\u80b2"]),
  P("lecarre-spy", "The Spy Who Came in from the Cold", "John le Carre", 1963, "\u72af\u7f6a\u5c0f\u8bf4", ["\u80cc\u53db", "\u8c0e\u8a00\u4e0e\u771f\u5b9e", "\u51b7\u6218"]),
  P("pynchon-lot49", "The Crying of Lot 49", "Thomas Pynchon", 1966, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u5143\u5c0f\u8bf4", "\u9634\u8c0b", "\u5b58\u5728\u610f\u4e49"]),
  P("didion-play", "Play It as It Lays", "Joan Didion", 1970, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u5931\u53bb", "\u8bb0\u5fc6\u4e0e\u9057\u5fd8", "\u6000\u65e7"]),
  P("morrison-sula", "Sula", "Toni Morrison", 1973, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u53cb\u8c0a", "\u79cd\u65cf", "\u6027\u522b"]),
  P("doctorow-ragtime", "Ragtime", "E.L. Doctorow", 1975, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u5386\u53f2\u91cd\u538b", "\u5bb6\u65cf\u53f2", "\u9769\u547d"]),
  P("gaddis-recognitions", "The Recognitions", "William Gaddis", 1955, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u5143\u5c0f\u8bf4", "\u6267\u5ff5", "\u8c0e\u8a00\u4e0e\u771f\u5b9e"]),
  P("nabokov-pale-fire", "Pale Fire", "Vladimir Nabokov", 1962, "\u7f8e\u56fd\u5f53\u4ee3\u6587\u5b66", ["\u5143\u5c0f\u8bf4", "\u8c0e\u8a00\u4e0e\u771f\u5b9e", "\u75af\u72c2\u4e0e\u7406\u6027"]),
  P("lessing-golden", "The Golden Notebook", "Doris Lessing", 1962, "\u82f1\u65e5\u5f53\u4ee3", ["\u6027\u522b", "\u81ea\u7531\u610f\u5fd7", "\u8bb0\u5fc6\u4e0e\u9057\u5fd8"]),
  P("murakami-wild-sheep", "A Wild Sheep Chase", "Haruki Murakami", 1982, "\u65e5\u672c\u73b0\u5f53\u4ee3", ["\u5b64\u72ec", "\u547d\u8fd0", "\u5b58\u5728\u610f\u4e49"])
];

const mvLabel = "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49";
for (const b of additions) {
  if (b.literary_movement === mvLabel) {
    b.dimensions = { lineage: 90, contemporary: 74, authorOther: 74, themes: 89, custom: 74 };
  }
}

const seen = new Set(books.map(b => b.id));
for (const b of additions) {
  if (!seen.has(b.id)) {
    seen.add(b.id);
    books.push(b);
  }
}

const mr = books.filter(b => b.literary_movement === "\u9b54\u5e7b\u73b0\u5b9e\u4e3b\u4e49");
const y5085 = books.filter(b => {
  const y = Number(b.year);
  return y >= 1950 && y <= 1985;
});
console.log("merged", books.length, "MR", mr.length, "1950-1985", y5085.length);
if (mr.length < 16) throw new Error("MR count");
if (y5085.length < 20) throw new Error("1950-85 count");

fs.writeFileSync("e:/nextbook-demo/books.json", JSON.stringify(books, null, 2), "utf8");

const tail = s.slice(i1 + "\n];\n\n".length);
const injection = `let BOOKS = [];

async function loadBooksCatalog() {
  const res = await fetch("./books.json", { cache: "no-store" });
  if (!res.ok) throw new Error("books.json HTTP " + res.status);
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) throw new Error("empty books.json");
  BOOKS = data;
}

`;
s = s.slice(0, i0) + injection + tail;

const oldLoop = `    let weak = false;
    if (!pool.length) {
      weak = true;
      pool = fallbackPool();
    }
    logRecommendCandidatePool(dim.key, pool, weak);
    const pickPool = preferOutsideRecent(pool);
    const book = pickRandomBook(pickPool);
    if (!book) continue;
    picked.add(book.id);
    out.push({
      ...book,
      weakAssociation: weak,
      majorDimensionKeys: [dim.key],
      majorDimensions: [dim.label],
      anchorDimensionKey: dim.key,
      reasonParagraphs: [reasonHardFilter(dim.key, seed, book, weak, traits)]
    });`;

const newLoop = `    let weak = false;
    if (dim.key === "lineage") {
      if (!pool.length) {
        logRecommendCandidatePool(dim.key, [], false);
        out.push({
          id: "__lineage_empty__",
          title: "\u6682\u65e0\u540c\u8c31\u7cfb\u4e66\u76ee",
          author: "",
          year: "",
          tags: [],
          lineageEmpty: true,
          majorDimensionKeys: ["lineage"],
          majorDimensions: [dim.label],
          reasonParagraphs: [
            "\u67b6\u4e0a\u6682\u65e0\u4e0e\u60a8\u951a\u70b9\u4e66\u76ee\u540c\u4e00\u8c31\u7cfb\uff08\u6587\u5b66\u53f2\u8fd0\u52a8\u6807\u7b7e\uff09\u7684\u6761\u76ee\uff0c\u672a\u7528\u5176\u4ed6\u4e66\u586b\u5145\u3002"
          ]
        });
        continue;
      }
    } else if (!pool.length) {
      weak = true;
      pool = fallbackPool();
    }
    logRecommendCandidatePool(dim.key, pool, weak);
    const pickPool = preferOutsideRecent(pool);
    const book = pickRandomBook(pickPool);
    if (!book) continue;
    picked.add(book.id);
    out.push({
      ...book,
      weakAssociation: weak,
      majorDimensionKeys: [dim.key],
      majorDimensions: [dim.label],
      anchorDimensionKey: dim.key,
      reasonParagraphs: [reasonHardFilter(dim.key, seed, book, weak, traits)]
    });`;

if (!s.includes(oldLoop)) throw new Error("recommend loop block missing");
s = s.replace(oldLoop, newLoop);

const oldRender = `    const tier = i === 0 ? "hero" : (i <= 2 ? "strong" : "standard");
    const tierLabel = i === 0 ? "\u6700\u60f3\u585e\u7ed9\u4f60" : (i <= 2 ? "\u8fd9\u672c\u4e5f\u6210" : "\u987a\u624b\u7ffb\u7ffb");
    const noDims = Boolean(item.randomOnly);
    const heading = noDims ? "" : \`<h3 class="recommend-dim-heading">\${item.majorDimensions[0] || ""}</h3>\`;
    const dimTags = noDims ? "" : \`<div class="tags tags--dims"><span class="tag tag--dim">\${item.majorDimensions[0] || ""}</span></div>\`;
    return \`
    <div class="recommend-block">
      \${heading}
      <article class="book-card book-card--in-view book-card--tier-\${tier} book-card--skin-\${i % 3}">
        <div class="book-card__badge" aria-hidden="true">\${tierLabel}</div>
        <div class="book-head">
          <div class="book-head__text">
            <div class="book-title">\${item.title}</div>
            <div class="book-meta">\${item.author} \u00b7 \${item.year}</div>
          </div>
        </div>
        \${dimTags}
        <div class="tags tags--topics">\${(item.tags || []).slice(0, 3).map(t => \`<span class="tag">\${t}</span>\`).join("")}</div>
        <div class="reason">\${(item.reasonParagraphs || []).map(p => \`<p class="reason__p">\${p}</p>\`).join("")}</div>
      </article>
    </div>
  \`;`;

const newRender = `    const emptyLineage = Boolean(item.lineageEmpty);
    const tier = emptyLineage ? "standard" : i === 0 ? "hero" : (i <= 2 ? "strong" : "standard");
    const tierLabel = emptyLineage ? "\u7a7a\u7f3a" : i === 0 ? "\u6700\u60f3\u585e\u7ed9\u4f60" : (i <= 2 ? "\u8fd9\u672c\u4e5f\u6210" : "\u987a\u624b\u7ffb\u7ffb");
    const noDims = Boolean(item.randomOnly);
    const heading = noDims ? "" : \`<h3 class="recommend-dim-heading">\${item.majorDimensions[0] || ""}</h3>\`;
    const dimTags = noDims ? "" : \`<div class="tags tags--dims"><span class="tag tag--dim">\${item.majorDimensions[0] || ""}</span></div>\`;
    const metaLine =
      emptyLineage || !item.author
        ? ""
        : \`<div class="book-meta">\${item.author} \u00b7 \${item.year}</div>\`;
    return \`
    <div class="recommend-block recommend-block--\${emptyLineage ? "lineage-empty" : "normal"}">
      \${heading}
      <article class="book-card book-card--in-view book-card--tier-\${tier} book-card--skin-\${i % 3}\${emptyLineage ? " book-card--lineage-empty" : ""}">
        <div class="book-card__badge" aria-hidden="true">\${tierLabel}</div>
        <div class="book-head">
          <div class="book-head__text">
            <div class="book-title">\${item.title}</div>
            \${metaLine}
          </div>
        </div>
        \${dimTags}
        <div class="tags tags--topics">\${(item.tags || []).slice(0, 3).map(t => \`<span class="tag">\${t}</span>\`).join("")}</div>
        <div class="reason">\${(item.reasonParagraphs || []).map(p => \`<p class="reason__p">\${p}</p>\`).join("")}</div>
      </article>
    </div>
  \`;`;

if (!s.includes("const tier = i === 0")) throw new Error("render block marker");
const ridx = s.indexOf("const tier = i === 0");
const rEnd = s.indexOf("}).join(\"\");", ridx);
if (rEnd < 0) throw new Error("render end");
const renderChunk = s.slice(ridx, rEnd);
if (!renderChunk.includes("book-card__badge")) throw new Error("bad render chunk");
s = s.slice(0, ridx) + newRender + s.slice(rEnd);

const oldInit = `(function init() {
  applyTheme(localStorage.getItem("nextbook-theme") || "light");
  lineageHistory = loadLineage();
  renderBookChips();
  renderLineage();
  updateFilterOptions();
  initAmbientCoverBackground();
  closeTopbarMenu();
})();`;

const newInit = `(async function init() {
  applyTheme(localStorage.getItem("nextbook-theme") || "light");
  try {
    await loadBooksCatalog();
  } catch (e) {
    console.error(e);
    showMessage("\u65e0\u6cd5\u52a0\u8f7d books.json\uff0c\u8bf7\u7528\u672c\u5730 HTTP \u670d\u52a1\u6253\u5f00\u9875\u9762\u3002");
  }
  lineageHistory = loadLineage();
  renderBookChips();
  renderLineage();
  updateFilterOptions();
  initAmbientCoverBackground();
  closeTopbarMenu();
})();`;

if (!s.includes(oldInit)) throw new Error("init block missing");
s = s.replace(oldInit, newInit);

const rg = `async function runGenerate(isRandom = false) {
  clearMessage();
  const traits = parseTraits(DOM.traitInput.value);
  const pool = BOOKS.slice();`;
if (!s.includes("const pool = BOOKS.slice();")) throw new Error("runGenerate marker");
s = s.replace(
  `async function runGenerate(isRandom = false) {
  clearMessage();
  const traits = parseTraits(DOM.traitInput.value);
  const pool = BOOKS.slice();`,
  `async function runGenerate(isRandom = false) {
  clearMessage();
  if (!BOOKS.length) {
    showMessage("\u4e66\u76ee\u5c1a\u672a\u52a0\u8f7d\u5b8c\u6210\uff0c\u8bf7\u7a0d\u5019\u518d\u8bd5\u3002");
    return;
  }
  const traits = parseTraits(DOM.traitInput.value);
  const pool = BOOKS.slice();`
);

const rs = `    recordRecentlyShown(latestRecommendations.map(r => r.id));`;
if (!s.includes(rs)) throw new Error("recordRecentlyShown line");
s = s.replace(
  rs,
  `    recordRecentlyShown(latestRecommendations.map(r => r.id).filter(id => id && id !== "__lineage_empty__"));`
);

fs.writeFileSync(appPath, s);
console.log("app.js patched, books.json written");
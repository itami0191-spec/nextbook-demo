import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(__dirname, "..", "app.js");
const booksJsonPath = path.join(__dirname, "..", "books.json");



const argvMax = (() => {
  const a = process.argv.find(x => x.startsWith("--max="));
  if (!a) return 6000;
  const n = Number(a.slice(6));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 50000) : 6000;
})();

const PAGES_PER_QUERY = 5;
const PAGE_SIZE = 100;

function buildQuerySpecs() {
  const subjects = [
    "Chinese fiction", "modern Chinese fiction", "China fiction", "Taiwan fiction", "Hong Kong fiction",
    "Chinese literature", "Singapore literature", "Singapore fiction", "Malaysian fiction", "Indonesian fiction",
    "Philippines fiction", "Vietnamese fiction", "Thai fiction", "Japanese fiction", "Japanese literature",
    "Korean fiction", "Korean literature", "Asian American fiction", "South Asian fiction", "Indian fiction",
    "Asian literature", "Southeast Asian fiction", "American fiction", "British fiction", "Canadian fiction",
    "Australian fiction", "Irish fiction", "French fiction", "German fiction", "Italian fiction", "Spanish fiction",
    "Portuguese fiction", "Russian fiction", "Polish fiction", "Swedish fiction", "Norwegian fiction", "Danish fiction",
    "Dutch fiction", "Greek fiction", "Turkish fiction", "Latin American fiction", "Mexican fiction", "Brazilian fiction",
    "Argentine fiction", "Chilean fiction", "Colombian fiction", "Nigerian fiction", "South African fiction", "Egyptian fiction",
    "Persian fiction", "Arabic fiction", "Hebrew fiction", "Pakistani fiction", "Bangladeshi fiction", "Fantasy fiction",
    "Science fiction", "Horror fiction", "Detective fiction", "Mystery fiction", "Historical fiction", "Romance fiction",
    "Literary fiction", "Domestic fiction", "War fiction", "Adventure fiction", "Dystopian fiction", "Magical realism",
    "Bildungsroman", "Gothic fiction", "Epistolary fiction", "Short stories", "Novellas", "Biographical fiction",
    "Psychological fiction", "Political fiction", "Satire", "Humorous fiction", "Crime fiction", "Spy stories",
    "Sea stories", "Western stories", "Urban fiction", "Young adult fiction", "Children's fiction", "African fiction",
    "Caribbean fiction", "Scottish fiction", "Welsh fiction", "New Zealand fiction", "Jewish fiction", "Irish literature",
    "American literature", "British literature", "World War 1939-1945 fiction", "World War 1914-1918 fiction",
    "Feminist fiction", "LGBT fiction", "Postcolonial literature", "Modernism literature", "Victorian fiction",
    "Medieval fiction", "Mythology fiction", "Fairy tales", "Ghost stories", "Suspense fiction", "Legal fiction",
    "Medical fiction", "Sports fiction", "Religious fiction", "Philosophical fiction", "Experimental fiction",
    "Stream of consciousness fiction", "Southern States fiction", "African American fiction", "Native American fiction",
    "Canadian literature", "Australian literature", "Indian English fiction", "Nobel Prize literature", "Booker Prize fiction",
    "Pulitzer Prize fiction", "International Booker Prize", "Man Asian Literary Prize", "Mao Dun Literature Prize",
    "Nebula Award", "Hugo Award", "Edgar Award", "Immigrants fiction", "Refugees fiction", "Family saga fiction",
    "Epic fiction", "Alternate history fiction", "Steampunk fiction", "Cyberpunk fiction", "Space opera",
    "Hard science fiction", "Urban fantasy", "Dark fantasy", "Cozy mystery", "Noir fiction", "Thriller fiction",
    "Espionage fiction", "Military fiction", "Naval fiction", "Western fiction", "Coming of age fiction", "Campus fiction",
    "Road fiction", "Travel fiction", "Island fiction", "Rural fiction", "Small town fiction", "European fiction",
    "Scandinavian fiction", "Eastern European fiction", "Nordic noir", "Climate fiction", "Apocalyptic fiction",
    "Post-apocalyptic fiction", "Zombie fiction", "Vampire fiction", "Time travel fiction", "Artificial intelligence fiction",
    "Space travel fiction", "London fiction", "Paris fiction", "Berlin fiction", "New York fiction", "Tokyo fiction",
    "Mumbai fiction", "Dublin fiction", "Sydney fiction", "Toronto fiction"
  ];
  const langs = [
    "language:chi fiction", "language:jpn fiction", "language:kor fiction", "language:spa fiction", "language:fre fiction",
    "language:ger fiction", "language:rus fiction", "language:por fiction", "language:ita fiction", "language:dut fiction",
    "language:pol fiction", "language:swe fiction", "language:ara fiction", "language:hin fiction", "language:tur fiction",
    "language:vie fiction", "language:tha fiction", "language:per fiction", "language:heb fiction", "language:gre fiction",
    "language:rum fiction", "language:cze fiction", "language:hun fiction", "language:ukr fiction", "language:bul fiction",
    "language:fin fiction", "language:dan fiction", "language:nor fiction", "language:ice fiction", "language:ind fiction",
    "language:may fiction", "language:tgl fiction", "language:ben fiction", "language:urd fiction", "language:srp fiction",
    "language:hrv fiction", "language:lit fiction", "language:est fiction", "language:geo fiction", "language:arm fiction",
    "language:afr fiction", "language:swa fiction", "language:cat fiction", "language:wel fiction", "language:tam fiction",
    "language:tel fiction", "language:kan fiction", "language:mal fiction", "language:mar fiction"
  ];
  const specs = [];
  for (const subj of subjects) {
    for (let page = 0; page < PAGES_PER_QUERY; page += 1) {
      specs.push({ q: "subject:" + subj, limit: PAGE_SIZE, offset: page * PAGE_SIZE });
    }
  }
  for (const q of langs) {
    for (let page = 0; page < 3; page += 1) {
      specs.push({ q, limit: PAGE_SIZE, offset: page * PAGE_SIZE });
    }
  }
  return specs;
}

const QUERY_SPECS = buildQuerySpecs();

const THEMES = [
  "身份认同", "孤独", "异化", "自我毁灭", "存在意义", "成长幻灭", "疯狂与理性",
  "记忆与遗忘", "时间流逝", "历史重压", "怀旧", "创伤与愈合",
  "爱情", "失去", "背叛", "婚姻", "友谊", "执念",
  "家族史", "代际创伤", "父权", "母女关系", "童年",
  "阶级", "革命", "极权", "殖民", "种族", "性别", "战争", "底层生存",
  "善恶边界", "罪与罚", "自由意志", "命运", "复仇",
  "元小说", "叙事本身", "谎言与真实", "沉默",
  "土地", "魔幻现实", "神话原型", "宗教信仰"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function normTitle(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011《》「」]/g, "");
}

function escJs(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
}

function slug(s) {
  const y = escJs(s).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return y || "x";
}

function dimsFromMeta(year, subjects) {
  const y = Number(year) && year > 1000 && year <= 2030 ? year : 2005;
  const subj = (subjects || []).map(x => String(x).toLowerCase()).join(" ");
  let lineage = 72;
  let contemporary = 72;
  if (y < 1930) {
    lineage = clamp(88 + Math.min(10, (1930 - y) * 0.08), 72, 98);
    contemporary = clamp(48 + Math.min(18, (y - 1850) * 0.05), 42, 78);
  } else if (y < 1990) {
    lineage = clamp(84 - (y - 1930) * 0.25, 55, 92);
    contemporary = clamp(56 + (y - 1930) * 0.28, 48, 88);
  } else {
    lineage = clamp(76 - (y - 1990) * 0.35, 42, 88);
    contemporary = clamp(76 + (y - 1990) * 0.25, 58, 96);
  }
  let authorOther = 72;
  let themes = clamp(78 + (subj.includes("love") || subj.includes("romance") ? 4 : 0), 62, 96);
  let custom = 70;
  if (/science fiction|fantasy|speculative/.test(subj)) {
    custom = clamp(custom + 14, 58, 94);
    lineage = clamp(lineage - 6, 42, 98);
    themes = clamp(themes + 4, 62, 98);
  }
  if (/philosoph|religion|theology/.test(subj)) {
    lineage = clamp(lineage + 8, 42, 98);
    themes = clamp(themes + 6, 62, 98);
  }
  if (/poetry|verse|poems/.test(subj)) {
    custom = clamp(custom + 8, 55, 94);
    authorOther = clamp(authorOther - 6, 55, 85);
  }
  if (/detective|mystery|crime fiction/.test(subj)) {
    custom = clamp(custom + 5, 55, 92);
    themes = clamp(themes + 3, 62, 96);
  }
  if (/history|historical/.test(subj)) {
    lineage = clamp(lineage + 4, 42, 98);
    themes = clamp(themes + 4, 62, 98);
  }
  if (
    /chinese|japan|japanese|korea|korean|taiwan|hong kong|singapore|vietnam|malaysia|indonesia|philippine|thai|asia|shanghai|beijing|seoul|tokyo|taipei|bangkok|hanoi|jakarta|manila/.test(
      subj
    )
  ) {
    contemporary = clamp(contemporary + 7, 42, 98);
    themes = clamp(themes + 6, 62, 98);
  }
  return {
    lineage: Math.round(lineage),
    contemporary: Math.round(contemporary),
    authorOther: Math.round(authorOther),
    themes: Math.round(themes),
    custom: Math.round(custom)
  };
}

function isMetaSubject(t) {
  const x = t.toLowerCase();
  return /nyt:|new york times|open library staff|staff picks|nyt |bestseller|reviewed accessible|fiction in english|translations into english|large type books|large print/.test(
    x
  );
}

function pickTags(subjects) {
  const blob = (subjects || []).map(s => String(s).toLowerCase()).join(" ");
  const out = new Set();
  const map = [
    { k: ["identity", "self", "racial", "ethnic"], t: ["身份认同", "种族"] },
    { k: ["loneliness", "alone", "isolation", "alienation"], t: ["孤独", "异化"] },
    { k: ["memory", "remember", "nostalgia"], t: ["记忆与遗忘", "怀旧"] },
    { k: ["history", "historical", "war"], t: ["历史重压", "时间流逝"] },
    { k: ["trauma", "abuse", "healing"], t: ["创伤与愈合"] },
    { k: ["love", "romance", "marriage", "marital"], t: ["爱情", "婚姻"] },
    { k: ["loss", "death", "mourning"], t: ["失去"] },
    { k: ["betray", "deceit", "lie"], t: ["背叛", "谎言与真实"] },
    { k: ["friendship", "friends"], t: ["友谊"] },
    { k: ["obsession", "revenge", "vengeance"], t: ["执念", "复仇"] },
    { k: ["family", "parent", "childhood"], t: ["家族史", "童年"] },
    { k: ["father", "patriarch"], t: ["父权"] },
    { k: ["mother", "daughter"], t: ["母女关系"] },
    { k: ["class", "poverty", "worker", "peasant"], t: ["阶级", "底层生存"] },
    { k: ["revolution", "totalitarian", "dictator"], t: ["革命", "极权"] },
    { k: ["colonial", "empire", "postcolonial"], t: ["殖民"] },
    { k: ["gender", "women", "feminist"], t: ["性别"] },
    { k: ["crime", "murder", "punishment", "prison"], t: ["罪与罚", "善恶边界"] },
    { k: ["fate", "destiny"], t: ["命运"] },
    { k: ["existential", "philosoph"], t: ["存在意义", "自由意志"] },
    { k: ["metafiction", "self-referential"], t: ["元小说", "叙事本身"] },
    { k: ["silence", "unsaid"], t: ["沉默"] },
    { k: ["myth", "legend"], t: ["神话原型"] },
    { k: ["magic realism", "magical realism", "fantasy"], t: ["魔幻现实"] },
    { k: ["land", "earth", "farm", "rural", "nature"], t: ["土地"] },
    { k: ["religion", "faith", "theolog", "church"], t: ["宗教信仰"] }
  ];
  for (const g of map) {
    if (g.k.some(kw => blob.includes(kw))) {
      for (const t of g.t) out.add(t);
    }
  }
  const tags = [...out].filter(t => THEMES.includes(t)).slice(0, 4);
  if (tags.length >= 2) return tags;
  const fallback = ["身份认同", "命运", "记忆与遗忘", "存在意义"];
  for (const t of fallback) {
    if (!tags.includes(t)) tags.push(t);
    if (tags.length >= 2) break;
  }
  return tags;
}

function inferLiteraryMovementFromSubjects(subjects) {
  const subj = (subjects || []).map(x => String(x).toLowerCase()).join(" ");
  if (/science fiction|sci-fi|outer space|spacecraft|speculative fiction/.test(subj)) return "科幻";
  if (/magical realism/.test(subj)) return "魔幻现实主义";
  if (/existential/.test(subj)) return "存在主义";
  if (/dystopian|totalitarian|surveillance state/.test(subj)) return "反乌托邦小说";
  if (/chinese|china|taiwan|hong kong|shanghai|beijing/.test(subj)) return "当代中国现实主义";
  if (/classical|dynasty|ming dynasty|qing dynasty/.test(subj)) return "中国古典小说";
  if (/russian|dostoyevsky|tolstoy|soviet/.test(subj)) return "俄国现实主义";
  if (/japan|japanese|tokyo|osaka/.test(subj)) return "日本现当代";
  if (/african american|american fiction|united states/.test(subj)) return "美国当代文学";
  if (/french|france|paris/.test(subj)) return "法国通俗与浪漫传统";
  if (/detective|crime fiction|murder/.test(subj)) return "犯罪小说";
  if (/psychological fiction|domestic fiction|literary/.test(subj)) return "美国当代文学";
  if (/british|england|london|irish/.test(subj)) return "英日当代";
  return "英日当代";
}

async function fetchBatch({ q, limit, offset = 0 }) {
  const u = new URL("https://openlibrary.org/search.json");
  u.searchParams.set("q", q);
  u.searchParams.set("limit", String(limit));
  u.searchParams.set("offset", String(offset));
  u.searchParams.set("fields", "title,author_name,first_publish_year,subject,language,key");
  const res = await fetch(u, { headers: { "User-Agent": "NextbookDemo/1.2 (ea-expand)" } });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()).docs || [];
}

function buildRecord(doc, usedIds) {
  const title = Array.isArray(doc.title) ? doc.title[0] : doc.title;
  if (!title || String(title).length > 100) return null;
  const authors = doc.author_name;
  const author = Array.isArray(authors) && authors.length ? authors[0] : "";
  if (!author || String(author).length > 60) return null;
  const year = doc.first_publish_year || null;
  const subjects = Array.isArray(doc.subject) ? doc.subject : [];
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
  usedIds.add(id);
  const workKey = doc.key || "";
  const links = [
    subjects[0] ? "主题线索：" + escJs(String(subjects[0]).slice(0, 40)) : "开放书目元数据汇入",
    workKey ? "Open Library：" + escJs(workKey) : "来源：Open Library Search API"
  ];
  const y = year || 2005;
  const mov = inferLiteraryMovementFromSubjects(subjects);
  return (
    '  { id: "' +
    escJs(id) +
    '", title: "' +
    escJs(title) +
    '", author: "' +
    escJs(author) +
    '", year: ' +
    y +
    ", literary_movement: " +
    JSON.stringify(mov) +
    ", tags: " +
    JSON.stringify(tags) +
    ", dimensions: " +
    JSON.stringify(dims) +
    ", links: " +
    JSON.stringify(links) +
    " }"
  );
}

function parseExisting(appSrc) {
  if (fs.existsSync(booksJsonPath)) {
    const books = JSON.parse(fs.readFileSync(booksJsonPath, "utf8"));
    if (!Array.isArray(books)) throw new Error("books.json must be an array");
    const titles = new Set();
    const ids = new Set();
    for (const b of books) {
      if (b.id) ids.add(b.id);
      if (b.title) titles.add(normTitle(b.title));
    }
    return { json: true, cut: null, titles, ids };
  }
  const markers = ["\n];\n\nconst DOM", "];\n\nconst DOM", "\r\n];\r\n\r\nconst DOM"];
  let cut = -1;
  for (const m of markers) {
    const i = appSrc.indexOf(m);
    if (i !== -1) {
      cut = i;
      break;
    }
  }
  if (cut === -1) throw new Error("marker not found: BOOKS end before const DOM");
  const booksBlock = appSrc.slice(0, cut);
  const titles = new Set();
  const ids = new Set();
  for (const m of booksBlock.matchAll(/\bid:\s*"([^"]+)"/g)) ids.add(m[1]);
  for (const m of booksBlock.matchAll(/\btitle:\s*"([^"]+)"/g)) titles.add(normTitle(m[1]));
  return { json: false, cut, titles, ids };
}

const appSrc = fs.readFileSync(appPath, "utf8");
const parsed = parseExisting(appSrc);
const usedIds = new Set(parsed.ids);
const seenTitles = new Set(parsed.titles);
const lines = [];

let stopped = false;
for (let qi = 0; qi < QUERY_SPECS.length && !stopped; qi += 1) {
  const spec = QUERY_SPECS[qi];
  let docs;
  try {
    docs = await fetchBatch(spec);
  } catch (e) {
    console.warn("skip", spec.q, "offset", spec.offset, e.message);
    await sleep(900);
    continue;
  }
  for (const doc of docs) {
    if (lines.length >= argvMax) {
      stopped = true;
      break;
    }
    const title = Array.isArray(doc.title) ? doc.title[0] : doc.title;
    const nt = normTitle(title);
    if (!nt || seenTitles.has(nt)) continue;
    const rec = buildRecord(doc, usedIds);
    if (!rec) continue;
    seenTitles.add(nt);
    lines.push(rec);
  }
  if (stopped) break;
  if ((qi + 1) % 10 === 0) console.warn("progress", qi + 1, "/", QUERY_SPECS.length, "new", lines.length);
  await sleep(850);
}

if (!lines.length) {
  console.log("No new titles (pool already saturated for these queries).");
  process.exit(0);
}

if (parsed.json) {
  const books = JSON.parse(fs.readFileSync(booksJsonPath, "utf8"));
  for (const lineStr of lines) {
    books.push(new Function("return " + lineStr.trim())());
  }
  fs.writeFileSync(booksJsonPath, JSON.stringify(books, null, 2), "utf8");
  console.log("Appended", lines.length, "records to books.json (max", argvMax, ")");
} else {
  const before = appSrc.slice(0, parsed.cut);
  const after = appSrc.slice(parsed.cut);
  const commaBefore = before.replace(/\}\s*$/, "},\n");
  const commentBlock = before.includes("以下条目元数据来自 Open Library")
    ? ""
    : "  // 以下条目元数据来自 Open Library Search API（https://openlibrary.org），使用前请查阅其数据与商用条款\n";
  fs.writeFileSync(appPath, commaBefore + commentBlock + lines.join(",\n") + after, "utf8");
  console.log("Appended", lines.length, "of max", argvMax);
}

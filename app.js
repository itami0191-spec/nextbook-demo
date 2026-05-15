const DIMENSIONS = [
  { key: "lineage", label: "谱系与经典坐标" },
  { key: "contemporary", label: "同时代作家与语境" },
  { key: "themes", label: "主题关切与语义标签" },
  { key: "custom", label: "自定义特质映射" }
];

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
/** 站内文学运动 → Open Library subject（英文） */
const LITERARY_MOVEMENT_OL_SUBJECT = {
  科幻: "science fiction",
  魔幻现实主义: "magical realism",
  存在主义: "existentialism",
  反乌托邦小说: "dystopian fiction",
  当代中国现实主义: "chinese fiction",
  中国古典小说: "chinese literature",
  俄国现实主义: "russian literature",
  日本现当代: "japanese fiction",
  美国当代文学: "american fiction",
  法国通俗与浪漫传统: "french fiction",
  犯罪小说: "crime fiction",
  英日当代: "literary fiction"
};

const THEME_TAG_OL_SUBJECT = {
  身份认同: "identity",
  孤独: "loneliness",
  异化: "alienation",
  自我毁灭: "self-destruction",
  存在意义: "existentialism",
  成长幻灭: "coming of age",
  疯狂与理性: "madness",
  记忆与遗忘: "memory",
  时间流逝: "time",
  历史重压: "history",
  怀旧: "nostalgia",
  创伤与愈合: "trauma",
  爱情: "love",
  失去: "loss",
  背叛: "betrayal",
  婚姻: "marriage",
  友谊: "friendship",
  执念: "obsession",
  家族史: "family saga",
  代际创伤: "generational trauma",
  父权: "patriarchy",
  母女关系: "mother and daughter",
  童年: "childhood",
  阶级: "social class",
  革命: "revolution",
  极权: "totalitarianism",
  殖民: "colonialism",
  种族: "race",
  性别: "gender",
  战争: "war",
  底层生存: "poverty",
  善恶边界: "good and evil",
  罪与罚: "crime and punishment",
  自由意志: "free will",
  命运: "destiny",
  复仇: "revenge",
  元小说: "metafiction",
  叙事本身: "fiction",
  谎言与真实: "truth",
  沉默: "silence",
  土地: "land",
  魔幻现实: "magical realism",
  神话原型: "myth",
  宗教信仰: "religion"
};

const TRAIT_OL_SUBJECT = {
  冷峻: "psychological fiction",
  非线性叙事: "experimental fiction",
  短篇集: "short stories",
  思想性: "philosophical fiction",
  女性叙事: "women's fiction",
  荒诞: "absurdist fiction",
  现实主义: "realistic fiction",
  魔幻现实主义: "magical realism"
};

function olSubjectForLineage(mv) {
  const k = String(mv || "").trim();
  return LITERARY_MOVEMENT_OL_SUBJECT[k] || "literary fiction";
}

function olSubjectForThemeTag(tag) {
  const k = String(tag || "").trim();
  if (THEME_TAG_OL_SUBJECT[k]) return THEME_TAG_OL_SUBJECT[k];
  if (/^[a-z0-9\s.'-]+$/i.test(k)) return k;
  return "fiction";
}

function olSubjectForTrait(trait) {
  const k = String(trait || "").trim();
  return TRAIT_OL_SUBJECT[k] || "literary fiction";
}



const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function normTitle(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011《》「」]/g, "");
}

/** 谱系去重：兼容全角半角、空白与常见标点差异 */
function normLineageKey(s) {
  let t = String(s || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
  t = t.replace(/\s+/g, "");
  t = t.replace(/[\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011《》「」【】［］\[\]()（）:：.．。…—\-_,，;；\x22\x27]+/g, "");
  return t.trim();
}

function dedupeLineageEntries(entries) {
  const seen = new Set();
  const out = [];
  for (const e of entries) {
    const k = normLineageKey(e.title);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}

function isMetaSubject(t) {
  const x = String(t).toLowerCase();
  return /nyt:|new york times|open library staff|staff picks|nyt |bestseller|reviewed accessible|fiction in english|translations into english|large type books|large print/.test(
    x
  );
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

function pickTagsFromSubjects(subjects) {
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

/** 种子为《百年孤独》时，锚点解析后打印 Open Library 临时书目。 */
function logBainianguduOlSeedIfNeeded(q0, seed) {
  if (normTitle(q0) !== normTitle("百年孤独")) return;
  if (seed) console.log("[Open Library 锚点] 百年孤独 →\n" + JSON.stringify(seed, null, 2));
  else console.log("未命中");
}

/** 用户输入锚点为《百年孤独》时开启谱系维度调试（OL 返回的书名常为英文）。 */
function isUserAnchorQueryBainiangudu(query) {
  return normTitle(String(query || "").trim()) === normTitle("百年孤独");
}

function slugForOlTempSeed(title, author, year) {
  const raw = String(title) + "|" + String(author) + "|" + String(year);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
}

/** 用 Open Library 的 subject 映射到站内 THEMES，拼出一条临时锚点书目（仅本次会话推荐用）。 */
function buildTemporaryBookFromOlDoc(doc, subjectsForTags, debugBainianguduQuery) {
  const title = Array.isArray(doc.title) ? doc.title[0] : doc.title;
  const authors = doc.author_name;
  const author = Array.isArray(authors) && authors.length ? authors[0] : "";
  const year = doc.first_publish_year || null;
  const y = year && year > 1000 && year <= 2030 ? year : 2005;
  const tags = pickTagsFromSubjects(subjectsForTags);
  const dimensions = dimsFromMeta(year, subjectsForTags);
  const workKey = doc.key || "";
  const firstSubj = subjectsForTags[0] ? String(subjectsForTags[0]).slice(0, 56) : "";
  const links = [
    firstSubj ? "Open Library subject：" + firstSubj : "Open Library 元数据临时锚点",
    workKey ? "Open Library：" + workKey : "来源：Open Library Search API"
  ];
  return {
    id: "ol-temp-" + slugForOlTempSeed(title, author, y),
    title: String(title).slice(0, 120),
    author: String(author).slice(0, 80),
    year: y,
    literary_movement: inferLiteraryMovementFromSubjects(subjectsForTags),
    tags,
    dimensions,
    links,
    /** 锚点 Open Library 原始 subject 条目（供主题维度 Claude 提示词） */
    olAnchorSubjects: subjectsForTags.slice(0, 40).map(String),
    _fromOpenLibrary: true,
    _temporarySeed: true,
    ...(debugBainianguduQuery ? { _debugLineageBainiangudu: true } : {})
  };
}

/** 控制台调试：打印 Open Library search.json 原始返回，及 docs[0].subject 完整内容。 */
function logOpenLibrarySearchResponse(context, url, data) {
  const docs = data && Array.isArray(data.docs) ? data.docs : [];
  const first = docs[0];
  const subj = first && first.subject;
  console.log("[Open Library API] " + context);
  console.log("  URL:", url);
  console.log("  原始 JSON（整包）:", data);
  if (subj !== undefined) {
    console.log("  docs[0].subject（完整，未过滤）:", JSON.stringify(subj, null, 2));
  } else {
    console.log("  docs[0].subject:（无首条或该条无 subject）", subj);
  }
}

async function fetchOpenLibraryAnchor(query) {
  const u = new URL("https://openlibrary.org/search.json");
  u.searchParams.set("q", String(query || "").trim());
  u.searchParams.set("limit", "20");
  u.searchParams.set("fields", "title,author_name,first_publish_year,subject,language,key");
  const urlStr = u.toString();
  const res = await fetch(urlStr);
  if (!res.ok) throw new Error("Open Library HTTP " + res.status);
  const data = await res.json();
  logOpenLibrarySearchResponse("锚点检索 (fetchOpenLibraryAnchor)", urlStr, data);
  const docs = data.docs || [];
  for (const doc of docs) {
    const title = Array.isArray(doc.title) ? doc.title[0] : doc.title;
    const authors = doc.author_name;
    const author = Array.isArray(authors) && authors.length ? authors[0] : "";
    if (!title || !author) continue;
    const rawSubj = Array.isArray(doc.subject) ? doc.subject : [];
    const subjects = rawSubj.filter(s => !isMetaSubject(s)).slice(0, 80);
    const dbgQ = isUserAnchorQueryBainiangudu(query);
    if (dbgQ) {
      const mv = inferLiteraryMovementFromSubjects(subjects);
      console.log("[谱系维度·调试][用户输入《百年孤独》] ========== ① 锚点检索 ==========");
      console.log("  Open Library search.json 请求的 fields 子集: title, author_name, first_publish_year, subject, language, key");
      console.log("  本条命中 doc 实际含有的字段名:", Object.keys(doc));
      console.log("  锚点 Open Library 原始 doc（JSON）:", JSON.stringify(doc, null, 2));
      console.log("  subject 用于推断前先去掉 meta subject，截取最多 80 条；以下为前 20 条:", subjects.slice(0, 20));
      console.log("  literary_movement（inferLiteraryMovementFromSubjects）=", JSON.stringify(mv));
      console.log("  映射到 OL subject 检索关键字 olSubjectForLineage(...)=", JSON.stringify(olSubjectForLineage(mv)));
      console.log("[谱系维度·调试][用户输入《百年孤独》] ========================================");
    }
    return buildTemporaryBookFromOlDoc(doc, subjects, dbgQ);
  }
  return null;
}


const OL_SEARCH_FIELDS = "title,author_name,first_publish_year,subject,language,key";

const ANTHROPIC_THEMES_MODEL = "claude-sonnet-4-20250514";

const ANTHROPIC_SESSION_KEY = "nextbook-anthropic-session-api-key";

function getAnthropicApiKey() {
  try {
    return (sessionStorage.getItem(ANTHROPIC_SESSION_KEY) || "").trim();
  } catch {
    return "";
  }
}

function stripMarkdownJsonFence(t) {
  const BQ = String.fromCharCode(96);
  const open = new RegExp("^" + BQ + BQ + BQ + "(?:json)?\\s*", "im");
  const close = new RegExp("\\s*" + BQ + BQ + BQ + "$", "m");
  return String(t).replace(open, "").replace(close, "");
}

function extractThemesJsonArray(text) {
  if (!text) return null;
  let t = stripMarkdownJsonFence(String(text).trim());
  const i0 = t.indexOf("[");
  const i1 = t.lastIndexOf("]");
  if (i0 < 0 || i1 <= i0) return null;
  try {
    const arr = JSON.parse(t.slice(i0, i1 + 1));
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

function formatThemesCandidatesForPrompt(docs) {
  return docs
    .map((d, idx) => {
      const subs = olDocSubjectsForTagging(d).slice(0, 6).join(", ");
      return (
        idx +
        1 +
        ".《" +
        olDocTitle(d) +
        "》，作者 " +
        olDocAuthor(d) +
        "，出版年份约 " +
        olDocYear(d) +
        "，Open Library 主题包括：" +
        (subs || "（无）")
      );
    })
    .join("\n");
}

function buildAnthropicThemesPrompt(seed, candidatesBlock) {
  const title = seed.title || "";
  const author = seed.author || "";
  const subjects = (seed.olAnchorSubjects || []).length
    ? seed.olAnchorSubjects.join("、")
    : "（无明显 Open Library 主题条目）";
  return (
    "种子书是《" +
    title +
    "》，作者 " +
    author +
    "，主题包含：" +
    subjects +
    "。\n以下是候选书列表：\n" +
    candidatesBlock +
    "\n\n请从候选书里选出主题关联度最高的3本，只返回 JSON 数组，格式：\n" +
    "[{\"title\": \"...\", \"reason\": \"一句话说明关联\"}]\n" +
    "title 必须与候选列表中的书名一致（可含或不含书名号）。"
  );
}

function matchAnthropicTitleToDoc(docs, titleHint) {
  const raw = String(titleHint || "")
    .trim()
    .replace(/[《》]/g, "");
  const n = normTitle(raw);
  if (!n) return null;
  for (const d of docs) {
    const dt = normTitle(olDocTitle(d));
    if (dt === n || dt.includes(n) || n.includes(dt)) return d;
  }
  return null;
}

async function gatherThemesCandidateDocs(seed, traits) {
  const usable = docs =>
    docs.filter(d => olDocTitle(d) && olDocAuthor(d) && !sameOlDocAsSeed(d, seed));
  const tagPool = (seed.tags || []).filter(t => THEMES.includes(t));
  const tag = pickOne(tagPool.length ? tagPool : THEMES) || "fiction";
  const subj = olSubjectForThemeTag(tag);
  let docs = await olSearch({ subject: subj, limit: 50 });
  const seen = new Set();
  const pool = [];
  for (const d of usable(docs)) {
    const k = normTitle(olDocTitle(d)) + "|" + normTitle(olDocAuthor(d));
    if (seen.has(k)) continue;
    seen.add(k);
    pool.push(d);
  }
  docs = await olSearch({ q: seed.title, limit: 50 });
  for (const d of usable(docs)) {
    const k = normTitle(olDocTitle(d)) + "|" + normTitle(olDocAuthor(d));
    if (seen.has(k)) continue;
    seen.add(k);
    pool.push(d);
  }
  return pool.slice(0, 40);
}

async function anthropicMessagesThemes(apiKey, userContent) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: ANTHROPIC_THEMES_MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: userContent }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Anthropic HTTP " + res.status + " " + errText.slice(0, 200));
  }
  const data = await res.json();
  const blocks = data.content || [];
  return blocks
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");
}

async function fetchThemesRecommendationAnthropic(seed, traits, apiKey) {
  const docs = await gatherThemesCandidateDocs(seed, traits);
  if (!docs.length) return null;
  const block = formatThemesCandidatesForPrompt(docs);
  const prompt = buildAnthropicThemesPrompt(seed, block);
  const raw = await anthropicMessagesThemes(apiKey, prompt);
  const arr = extractThemesJsonArray(raw);
  if (!arr || !arr.length) return null;
  const matched = [];
  for (const row of arr.slice(0, 5)) {
    const t = row && row.title;
    const reason = row && row.reason;
    if (!t || reason == null) continue;
    const doc = matchAnthropicTitleToDoc(docs, t);
    if (doc && !matched.some(m => m.doc === doc)) matched.push({ doc, reason: String(reason).trim() });
    if (matched.length >= 3) break;
  }
  if (!matched.length) return null;
  return pickOne(matched.slice(0, 3));
}

async function olSearch(params) {
  const u = new URL("https://openlibrary.org/search.json");
  for (const [k, v] of Object.entries(params)) {
    if (k === "fields") continue;
    if (v != null && v !== "") u.searchParams.set(k, String(v));
  }
  u.searchParams.set("fields", OL_SEARCH_FIELDS);
  const urlStr = u.toString();
  const res = await fetch(urlStr);
  if (!res.ok) throw new Error("Open Library HTTP " + res.status);
  const data = await res.json();
  logOpenLibrarySearchResponse("维度检索 (olSearch) params=" + JSON.stringify(params), urlStr, data);
  return Array.isArray(data.docs) ? data.docs : [];
}
function olDocTitle(doc) { return Array.isArray(doc.title) ? String(doc.title[0] || "") : String(doc.title || ""); }
function olDocAuthor(doc) { return Array.isArray(doc.author_name) ? String(doc.author_name[0] || "") : ""; }
function olDocYear(doc) { return doc.first_publish_year ? String(doc.first_publish_year) : "—"; }
function olDocSubjectsForTagging(doc) {
  const raw = Array.isArray(doc.subject) ? doc.subject : [];
  return raw.filter(s => !isMetaSubject(s)).slice(0, 80);
}
function pickOne(arr) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }
function sameOlDocAsSeed(doc, seed) {
  return normTitle(olDocTitle(doc)) === normTitle(seed.title) && normTitle(olDocAuthor(doc)) === normTitle(seed.author);
}

async function fetchDimBook(dimKey, seed, traits) {
  const usable = docs => docs.filter(d => olDocTitle(d) && olDocAuthor(d) && !sameOlDocAsSeed(d, seed));
  if (dimKey === "contemporary") {
    let docs = await olSearch({ q: seed.title, first_publish_year: seed.year, limit: 10 });
    let pool = usable(docs);
    if (!pool.length && seed.year) {
      docs = await olSearch({ q: seed.title, limit: 10 });
      pool = usable(docs);
    }
    return pickOne(pool);
  }
  if (dimKey === "lineage") {
    const subj = olSubjectForLineage(seed.literary_movement);
    const docs = await olSearch({ subject: subj, limit: 10 });
    if (seed && seed._debugLineageBainiangudu) {
      console.log("[谱系维度·调试][用户输入《百年孤独》] ========== ② 谱系维度候选池 ==========");
      console.log("  种子 seed.literary_movement:", JSON.stringify(seed.literary_movement));
      console.log("  olSubjectForLineage(seed.literary_movement) → olSearch 参数 subject=", JSON.stringify(subj));
      console.log("  olSearch({ subject, limit: 10 }) 返回条数:", docs.length);
      const rows = docs.map((d, i) => {
        const t = olDocTitle(d);
        const a = olDocAuthor(d);
        let note = "";
        if (!t || !a) note = "剔除：缺少 title 或 author_name";
        else if (sameOlDocAsSeed(d, seed)) note = "剔除：与锚点同一本书（normTitle 比较 title 且 author）";
        else note = "保留进 usable 候选池";
        return { idx: i, title: t, author: a, note };
      });
      console.log("  每条原始命中及 usable 规则:", rows);
      const pool = usable(docs);
      console.log("  usable 候选池数量:", pool.length, pool.length ? pool.map(d => "《" + olDocTitle(d) + "》" + olDocAuthor(d)).join(" | ") : "(空则展示「暂无同谱系书目」)");
      console.log("  pickOne：从 usable 中随机取一本");
      console.log("[谱系维度·调试][用户输入《百年孤独》] ========================================");
    }
    return pickOne(usable(docs));
  }
  const trait = traits[0];
  const subj = trait
    ? olSubjectForTrait(trait)
    : olSubjectForThemeTag(pickOne((seed.tags || []).filter(t => THEMES.includes(t))) || "fiction");
  const docs = await olSearch({ subject: subj, limit: 10 });
  return pickOne(usable(docs));
}
/** 每本推荐卡一句：Open Library 各维度（非主题） */
function reasonParagraphsForOlDimension(dimKey, dimLabel, doc, seed) {
  const anchor = (seed && String(seed.title || "").trim()) || "您的锚点书";
  const t = olDocTitle(doc);
  let line1 = "";
  if (dimKey === "contemporary") {
    line1 = "在「同时代与语境」这一维，《" + t + "》与《" + anchor + "》落在相近的时代与出版语感里。";
  } else if (dimKey === "lineage") {
    line1 = "在「谱系与经典坐标」这一维，《" + t + "》与您锚点的文学运动标签指向同一脉络。";
  } else if (dimKey === "custom") {
    line1 = "在「自定义特质映射」这一维，《" + t + "》是贴近您所填关键词气质的一条命中。";
  } else {
    line1 = "在「" + dimLabel + "」这一维从 Open Library 检索到《" + t + "》，作为《" + anchor + "》的一条延伸推荐。";
  }
  return [line1];
}

function reasonParagraphsForThemesClaude(modelReason) {
  const r = String(modelReason || "").trim();
  return [r || "模型判断这本书与锚点在主题上最贴近。"];
}

function reasonParagraphsForRandom(doc) {
  const t = olDocTitle(doc);
  return ["随机模式下不讲锚点，纯从 Open Library 里捞到《" + t + "》。"];
}

async function buildLiveRecommendations(seed, traits) {
  lastThemeRecommendationHint = "";
  const dims = activeDimensionsForTraits(traits);
  const out = [];
  for (const dim of dims) {
    if (dim.key === "themes") {
      const apiKey = getAnthropicApiKey();
      if (!apiKey) {
        lastThemeRecommendationHint = "主题维度未生成：请在页面底部填写 Anthropic API Key（仅存当前标签会话）。";
        continue;
      }
      setRecommendLoading(true, "正在分析主题关联…");
      let picked;
      try {
        picked = await fetchThemesRecommendationAnthropic(seed, traits, apiKey);
      } catch {
        lastThemeRecommendationHint = "主题维度未生成：Anthropic 请求失败（网络、密钥或浏览器跨域限制）。";
        continue;
      }
      if (!picked) {
        lastThemeRecommendationHint = "主题维度未生成：模型未返回与候选列表匹配的书名。";
        continue;
      }
      out.push({
        id: "ol-themes-" + slugForOlTempSeed(olDocTitle(picked.doc), olDocAuthor(picked.doc), olDocYear(picked.doc)),
        title: olDocTitle(picked.doc),
        author: olDocAuthor(picked.doc),
        year: olDocYear(picked.doc),
        tags: pickTagsFromSubjects(olDocSubjectsForTagging(picked.doc)),
        majorDimensionKeys: ["themes"],
        majorDimensions: [dim.label],
        reasonParagraphs: reasonParagraphsForThemesClaude(picked.reason)
      });
      continue;
    }
    const doc = await fetchDimBook(dim.key, seed, traits);
    if (dim.key === "lineage" && !doc) {
      out.push({ id: "__lineage_empty__", title: "暂无同谱系书目", author: "", year: "", tags: [], lineageEmpty: true, majorDimensionKeys: ["lineage"], majorDimensions: [dim.label], reasonParagraphs: ["这一维暂时没有找到与锚点同谱系的书目。"] });
      continue;
    }
    if (!doc) continue;
    out.push({ id: "ol-" + dim.key + "-" + slugForOlTempSeed(olDocTitle(doc), olDocAuthor(doc), olDocYear(doc)), title: olDocTitle(doc), author: olDocAuthor(doc), year: olDocYear(doc), tags: pickTagsFromSubjects(olDocSubjectsForTagging(doc)), majorDimensionKeys: [dim.key], majorDimensions: [dim.label], reasonParagraphs: reasonParagraphsForOlDimension(dim.key, dim.label, doc, seed) });
  }
  return out;
}

const DOM = {
  body: document.body,
  inputView: document.getElementById("inputView"),
  resultView: document.getElementById("resultView"),
  lineageView: document.getElementById("lineageView"),
  bookInput: document.getElementById("bookInput"),
  bookChipList: document.getElementById("bookChipList"),
  traitInput: document.getElementById("traitInput"),
  generateBtn: document.getElementById("generateBtn"),
  randomGenerateBtn: document.getElementById("randomGenerateBtn"),
  fillDemoBtn: document.getElementById("fillDemoBtn"),
  message: document.getElementById("message"),
  dimensionFilter: document.getElementById("dimensionFilter"),
  recommendList: document.getElementById("recommendList"),
  anchorNote: document.getElementById("anchorNote"),
  backBtn: document.getElementById("backBtn"),
  rerollBtn: document.getElementById("rerollBtn"),
  lineageTree: document.getElementById("lineageTree"),
  lineageEmpty: document.getElementById("lineageEmpty"),
  lineageDeleteBtn: document.getElementById("lineageDeleteBtn"),
  lineageBackBtn: document.getElementById("lineageBackBtn"),
  topbarMenuBtn: document.getElementById("topbarMenuBtn"),
  topbarMenuPanel: document.getElementById("topbarMenuPanel"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  lineagePageBtn: document.getElementById("lineagePageBtn"),
  anthropicSessionKeyInput: document.getElementById("anthropicSessionKeyInput")
};

let selectedBookTitles = [];
let latestRecommendations = [];
let lineageHistory = [];
let lineageSelectedIndex = -1;
let lastGenerateWasRandom = false;
let lastThemeRecommendationHint = "";
function parseTraits(raw) {
  return String(raw || "").split(/[,，]/).map(s => s.trim()).filter(Boolean);
}

function activeDimensionsForTraits(traits) {
  return traits.length ? DIMENSIONS : DIMENSIONS.filter(d => d.key !== "custom");
}

function renderBookChips() {
  if (!selectedBookTitles.length) {
    DOM.bookChipList.innerHTML = '<span class="chip-empty">暂未添加书名</span>';
    return;
  }
  DOM.bookChipList.innerHTML = selectedBookTitles.map((title, index) =>
    `<span class="chip"><span>${title}</span><button type="button" data-chip-index="${index}" aria-label="删除 ${title}">x</button></span>`
  ).join("");
}

function renderRecommendations(recommendations, filterDimension = "all") {
  const list = filterDimension === "all" ? recommendations : recommendations.filter(r => r.majorDimensionKeys.includes(filterDimension));
  if (!list.length) {
    DOM.recommendList.innerHTML = '<p class="hint">当前筛选条件下暂无推荐。</p>';
    return;
  }
  DOM.recommendList.innerHTML = list.map((item, i) => {
    const emptyLineage = Boolean(item.lineageEmpty);
    const tier = emptyLineage ? "standard" : i === 0 ? "hero" : (i <= 2 ? "strong" : "standard");
    const tierLabel = emptyLineage ? "空缺" : i === 0 ? "最想塞给你" : (i <= 2 ? "这本也成" : "顺手翻翻");
    const noDims = Boolean(item.randomOnly);
    const heading = noDims ? "" : `<h3 class="recommend-dim-heading">${item.majorDimensions[0] || ""}</h3>`;
    const dimTags = noDims ? "" : `<div class="tags tags--dims"><span class="tag tag--dim">${item.majorDimensions[0] || ""}</span></div>`;
    const metaLine =
      emptyLineage || !item.author
        ? ""
        : `<div class="book-meta">${item.author} · ${item.year}</div>`;
    const topicTags = (item.majorDimensionKeys || []).includes("themes")
      ? (item.tags || []).filter(t => THEMES.includes(t)).slice(0, 3)
      : [];
    const topicsRow = topicTags.length
      ? `<div class="tags tags--topics">${topicTags.map(t => `<span class="tag">${t}</span>`).join("")}</div>`
      : "";
    return `
    <div class="recommend-block recommend-block--${emptyLineage ? "lineage-empty" : "normal"}">
      ${heading}
      <article class="book-card book-card--in-view book-card--tier-${tier} book-card--skin-${i % 3}${emptyLineage ? " book-card--lineage-empty" : ""}">
        <div class="book-card__badge" aria-hidden="true">${tierLabel}</div>
        <div class="book-head">
          <div class="book-head__text">
            <div class="book-title">${item.title}</div>
            ${metaLine}
          </div>
        </div>
        ${dimTags}
        ${topicsRow}
        <div class="reason">${(item.reasonParagraphs || []).map(p => `<p class="reason__p">${p}</p>`).join("")}</div>
      </article>
    </div>
  `;}).join("");
}

function updateFilterOptions() {
  const traits = parseTraits(DOM.traitInput.value);
  const dims = activeDimensionsForTraits(traits);
  const prev = DOM.dimensionFilter.value;
  DOM.dimensionFilter.innerHTML = '<option value="all">全部</option>' + dims.map(d => `<option value="${d.key}">${d.label}</option>`).join("");
  if (prev && (prev === "all" || dims.some(d => d.key === prev))) DOM.dimensionFilter.value = prev;
}

function showMessage(msg) { DOM.message.textContent = msg || ""; }
function clearMessage() { showMessage(""); }
function setRecommendLoading(on, hintText) {
  if (!on) return;
  DOM.recommendList.innerHTML = '<p class="hint">' + (hintText || "正在获取推荐…") + "</p>";
}

function switchView(target) {
  const views = [DOM.inputView, DOM.resultView, DOM.lineageView];
  for (const v of views) {
    if (!v) continue;
    const active = v === target;
    v.classList.toggle("view-active", active);
    v.classList.toggle("view-hidden-right", !active);
    v.setAttribute("aria-hidden", active ? "false" : "true");
  }
}

function commitInputToChips() {
  const raw = DOM.bookInput.value.trim();
  if (!raw) return;
  const parts = raw.split(/[,，、;；]+|\r?\n+/).map(x => x.trim()).filter(Boolean);
  for (const p of parts) if (!selectedBookTitles.includes(p)) selectedBookTitles.push(p);
  DOM.bookInput.value = "";
  renderBookChips();
}

function recordLineageTitle(title) {
  const t = String(title || "").trim();
  if (!t) return;
  const key = normLineageKey(t);
  if (!key) return;
  if (lineageHistory.some(e => normLineageKey(e.title) === key)) return;
  lineageHistory.push({ title: t, at: Date.now() });
  if (lineageHistory.length > 120) lineageHistory = lineageHistory.slice(-120);
  localStorage.setItem("nextbook-lineage", JSON.stringify(lineageHistory));
}

function normalizeLineageEntry(raw) {
  if (typeof raw === "string") return { title: raw.trim(), at: Date.now() };
  if (!raw || typeof raw.title !== "string") return null;
  return {
    title: String(raw.title).trim(),
    at: typeof raw.at === "number" ? raw.at : Date.now()
  };
}

function loadLineage() {
  try {
    const raw = JSON.parse(localStorage.getItem("nextbook-lineage") || "[]");
    if (!Array.isArray(raw)) return [];
    const list = raw.map(normalizeLineageEntry).filter(Boolean);
    const deduped = dedupeLineageEntries(list);
    if (deduped.length !== list.length) {
      localStorage.setItem("nextbook-lineage", JSON.stringify(deduped));
    }
    return deduped;
  } catch {
    return [];
  }
}

function escapeLineageText(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeLineageHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
}

function lineageArcRadius(W, H, root, n) {
  const halfRad = (75 * Math.PI) / 180;
  const cx = root.x;
  const cy = root.y;
  const maxXReach = Math.min(cx - 22, W - cx - 22);
  const sinHalf = Math.sin(halfRad);
  const maxRHoriz = sinHalf > 0.02 ? maxXReach / sinHalf : maxXReach;
  const maxRVert = Math.max(72, cy - 34);
  let R = Math.min(maxRHoriz * 0.93, maxRVert * 0.85);
  if (n > 14) R *= 0.96;
  if (n > 22) R *= 0.94;
  return clamp(R, 66, 124);
}

function layoutLineageLeaves(entries, W, H, root, R) {
  const n = entries.length;
  const cx = root.x;
  const cy = root.y;
  const halfRad = (75 * Math.PI) / 180;
  return entries.map((item, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const phi = -halfRad + t * 2 * halfRad;
    let x = cx + R * Math.sin(phi);
    let y = cy - R * Math.cos(phi);
    x = clamp(x, 24, W - 24);
    y = clamp(y, 20, cy - 30);
    return { title: item.title, i: item._i !== undefined ? item._i : i, x, y, phi };
  });
}

function lineageHubFromRoot(root, R) {
  const d = R * 0.32;
  return { x: root.x, y: root.y - d };
}

/** Smooth cubic from A→B with perpendicular "root" wobble (deterministic from phase). */
function lineageOrganicCubic(ax, ay, bx, by, phase, tension = 1) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const qx = -uy;
  const qy = ux;
  const w = tension * Math.min(30, 9 + len * 0.11);
  const o1 = w * (Math.sin(phase * 1.07) * 0.88 + Math.cos(phase * 2.13) * 0.36);
  const o2 = w * (Math.cos(phase * 1.31) * 0.78 + Math.sin(phase * 1.79) * 0.42);
  const t1 = 0.22 + Math.sin(phase * 0.37) * 0.06;
  const t2 = 0.56 + Math.cos(phase * 0.48) * 0.1;
  const c1x = ax + ux * len * t1 + qx * o1;
  const c1y = ay + uy * len * t1 + qy * o1;
  const c2x = ax + ux * len * t2 + qx * o2 * 0.74;
  const c2y = ay + uy * len * t2 + qy * o2 * 0.74;
  return { c1x, c1y, c2x, c2y };
}

/** 单段三次曲线 M p0→p3，带垂直于走向的摆动。 */
function lineageCubicSegment(x0, y0, x3, y3, phase, segIndex, wobbleScale) {
  const dx = x3 - x0;
  const dy = y3 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const qx = -uy;
  const qy = ux;
  const w =
    wobbleScale * (5 + Math.sin(phase + segIndex * 2.4) * 4 + Math.cos(phase * 1.3 + segIndex) * 2.5);
  const c1x = x0 + ux * len * 0.28 + qx * w * 0.9;
  const c1y = y0 + uy * len * 0.28 + qy * w * 0.85;
  const c2x = x0 + ux * len * 0.72 - qx * w * 0.55;
  const c2y = y0 + uy * len * 0.72 - qy * w * 0.5;
  return "M " + x0 + " " + y0 + " C " + c1x + " " + c1y + ", " + c2x + " " + c2y + ", " + x3 + " " + y3;
}

/** 细枝：分叉点 J→叶梢 L，多段曲线自下往上渐细。 */
function lineageTwigSegments(Jx, Jy, Lx, Ly, phase, nSeg) {
  nSeg = nSeg == null ? 6 : nSeg;
  const out = [];
  const dx = Lx - Jx;
  const dy = Ly - Jy;
  const len = Math.hypot(dx, dy) || 1;
  const bendBase = 0.14 + Math.sin(phase * 0.7) * 0.05;
  let x0 = Jx;
  let y0 = Jy;
  for (let i = 0; i < nSeg; i++) {
    const t1 = (i + 1) / nSeg;
    let bx = Jx + dx * t1 + Math.sin(phase + i * 1.9) * len * bendBase * (1 - t1);
    let by = Jy + dy * t1 + Math.cos(phase * 1.1 + i * 1.4) * len * bendBase * 0.55 * (1 - t1);
    if (i === nSeg - 1) {
      bx = Lx;
      by = Ly;
    }
    const wobble = 1.05 - i * 0.11;
    out.push({
      d: lineageCubicSegment(x0, y0, bx, by, phase + i * 0.85, i, wobble),
      tier: i
    });
    x0 = bx;
    y0 = by;
  }
  return out;
}

function lineageSpokeCount(n) {
  if (n <= 1) return 1;
  if (n <= 5) return 1;
  if (n <= 10) return Math.min(3, Math.ceil(n / 3));
  if (n <= 18) return Math.min(5, Math.ceil(n / 3));
  return Math.min(8, Math.ceil(n / 4));
}

function buildLineageClusters(leaves, hub, W, H) {
  const n = leaves.length;
  const K = lineageSpokeCount(n);
  const sorted = leaves.slice().sort((a, b) => a.phi - b.phi);
  const clusters = [];
  let idx = 0;
  for (let k = 0; k < K; k++) {
    const rest = n - idx;
    const slots = K - k;
    const m = Math.ceil(rest / slots);
    const chunk = sorted.slice(idx, idx + m);
    idx += m;
    if (chunk.length) clusters.push(chunk);
  }
  return clusters.map(members => {
    let sx = 0;
    let sy = 0;
    for (const L of members) {
      sx += L.x;
      sy += L.y;
    }
    const mx = sx / members.length;
    const my = sy / members.length;
    const tJoin = 0.36;
    const jx = hub.x + (mx - hub.x) * tJoin;
    const jy = hub.y + (my - hub.y) * tJoin;
    return { join: { x: jx, y: jy }, members };
  });
}

function animateLineageDraw(rootEl) {
  if (!rootEl) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paths = [...rootEl.querySelectorAll(".lineage-path")];
  paths.sort((a, b) => {
    const oa = Number(a.dataset.drawOrder || 0);
    const ob = Number(b.dataset.drawOrder || 0);
    return oa - ob;
  });
  paths.forEach(pathEl => {
    try {
      const plen = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = String(plen);
      pathEl.style.strokeDashoffset = String(plen);
      pathEl.style.opacity = "0.08";
      const order = Number(pathEl.dataset.drawOrder || 0);
      const opFn = () => {
        const op = pathEl.classList.contains("lineage-path--trunk")
          ? "0.9"
          : pathEl.classList.contains("lineage-path--branch")
            ? "0.84"
            : pathEl.classList.contains("lineage-path--twig")
              ? "0.78"
              : "0.8";
        pathEl.style.opacity = op;
      };
      if (reduce) {
        pathEl.style.transition = "none";
        pathEl.style.strokeDashoffset = "0";
        opFn();
        return;
      }
      const delay = order * 48;
      const dur = 620 + Math.min(420, plen * 0.45);
      window.setTimeout(() => {
        pathEl.style.transition =
          "stroke-dashoffset " + dur + "ms cubic-bezier(0.22, 0.9, 0.25, 1), opacity 520ms ease";
        pathEl.style.strokeDashoffset = "0";
        opFn();
      }, delay);
    } catch {
      pathEl.style.opacity = "0.75";
    }
  });
  const nodes = [...rootEl.querySelectorAll(".lineage-node")];
  const maxOrder = paths.reduce((m, p) => Math.max(m, Number(p.dataset.drawOrder || 0)), 0);
  nodes.forEach(node => {
    node.style.opacity = "0";
    node.style.transform = node.classList.contains("lineage-node--book")
      ? "translate(-50%, calc(-50% - 6px)) scale(0.92)"
      : "translate(-50%, -50%) scale(0.94)";
    const isBook = node.classList.contains("lineage-node--book");
    const delay = reduce ? 0 : (isBook ? maxOrder * 48 + 120 + Number(node.dataset.leafDelay || 0) * 28 : 80);
    window.setTimeout(() => {
      node.style.transition = reduce
        ? "none"
        : "opacity 520ms ease, transform 560ms cubic-bezier(0.22, 1, 0.36, 1)";
      node.style.opacity = "1";
      node.style.transform = node.classList.contains("lineage-node--book")
        ? "translate(-50%, calc(-50% - 6px)) scale(1)"
        : "translate(-50%, -50%) scale(1)";
    }, delay);
  });
}

function computeLineageLayout(entries, W, H) {
  const root = { x: W / 2, y: 334 };
  const n = Math.max(entries.length, 1);
  const R = lineageArcRadius(W, H, root, n);
  const hub = lineageHubFromRoot(root, R);
  const leafObjs = entries.map((e, i) => ({ title: e.title, _i: i, at: e.at }));
  const leaves = layoutLineageLeaves(leafObjs, W, H, root, R);
  const clusters = buildLineageClusters(leaves, hub, W, H);
  const pos = {};
  for (const leaf of leaves) {
    pos[leaf.i] = { x: leaf.x, y: leaf.y, phi: leaf.phi };
  }
  return { root, hub, R, leaves, clusters, pos };
}

function renderLineage() {
  if (!lineageHistory.length) {
    DOM.lineageTree.innerHTML = "";
    DOM.lineageEmpty.hidden = false;
    DOM.lineageDeleteBtn.disabled = true;
    return;
  }
  DOM.lineageEmpty.hidden = true;
  const W = 420;
  const H = 360;
  const entries = lineageHistory;
  const lay = computeLineageLayout(entries, W, H);
  const root = lay.root;
  const hub = lay.hub;
  const R = lay.R;
  const clusters = lay.clusters;
  const pos = lay.pos;
  let paths = "";
  let drawOrder = 0;
  const trunkPh = root.x * 0.031 + root.y * 0.019 + R * 0.017;
  const mptx = (root.x + hub.x) * 0.5 + Math.sin(trunkPh) * 10;
  const mpty = (root.y + hub.y) * 0.5 + Math.cos(trunkPh * 1.2) * 7;
  const trunkA = lineageOrganicCubic(root.x, root.y, mptx, mpty, trunkPh, 1.06);
  paths += "<path class=\"lineage-path lineage-path--trunk lineage-path--trunk-a\" data-draw-order=\"" + drawOrder++ + "\" d=\"M " + root.x + " " + root.y + " C " + trunkA.c1x + " " + trunkA.c1y + ", " + trunkA.c2x + " " + trunkA.c2y + ", " + mptx + " " + mpty + "\" />";
  const trunkB = lineageOrganicCubic(mptx, mpty, hub.x, hub.y, trunkPh + 1.15, 0.98);
  paths += "<path class=\"lineage-path lineage-path--trunk lineage-path--trunk-b\" data-draw-order=\"" + drawOrder++ + "\" d=\"M " + mptx + " " + mpty + " C " + trunkB.c1x + " " + trunkB.c1y + ", " + trunkB.c2x + " " + trunkB.c2y + ", " + hub.x + " " + hub.y + "\" />";
  let ci = 0;
  for (const cl of clusters) {
    const join = cl.join;
    const members = cl.members;
    const Jx = join.x;
    const Jy = join.y;
    const brPh = ci * 2.73 + Jy * 0.021 + members.length * 0.41 + hub.x * 0.011;
    ci++;
    const brC = lineageOrganicCubic(hub.x, hub.y, Jx, Jy, brPh, 1.02);
    paths += "<path class=\"lineage-path lineage-path--branch\" data-draw-order=\"" + drawOrder++ + "\" d=\"M " + hub.x + " " + hub.y + " C " + brC.c1x + " " + brC.c1y + ", " + brC.c2x + " " + brC.c2y + ", " + Jx + " " + Jy + "\" />";
    for (const leaf of members) {
      const Lx = leaf.x;
      const Ly = leaf.y;
      const j = leaf.i;
      const phase = j * 2.17 + ci * 0.85 + Lx * 0.012;
      const twigs = lineageTwigSegments(Jx, Jy, Lx, Ly, phase, 6);
      for (const seg of twigs) {
        paths += "<path class=\"lineage-path lineage-path--twig lineage-path--twig-" + seg.tier + "\" data-draw-order=\"" + drawOrder++ + "\" d=\"" + seg.d + "\" />";
      }
    }
  }
  const leafButtons = entries.map((entry, i) => {
    const leaf = { x: pos[i].x, y: pos[i].y, i: i, title: entry.title };
    let Jx = hub.x;
    let Jy = hub.y;
    const cluster = clusters.find(c => c.members.some(m => m.i === i));
    if (cluster) {
      Jx = cluster.join.x;
      Jy = cluster.join.y;
    }
    const dx = leaf.x - Jx;
    const dy = leaf.y - Jy;
    const dist = Math.hypot(dx, dy) || 1;
    const ox = (dx / dist) * 12;
    const oy = (dy / dist) * 10;
    const px = leaf.x + ox;
    const py = leaf.y + oy;
    return "<button type=\"button\" class=\"lineage-node lineage-node--book " + (lineageSelectedIndex === i ? "lineage-node--selected" : "") + "\" data-lineage-index=\"" + i + "\" data-leaf-delay=\"" + i + "\" aria-label=\"" + escapeLineageText(leaf.title) + "\" style=\"left:" + (px / W) * 100 + "%;top:" + (py / H) * 100 + "%;\">" + escapeLineageHtml(leaf.title) + "</button>";
  }).join("");
  DOM.lineageTree.innerHTML =
    "<div class=\"lineage-stage\"><div class=\"lineage-sway-wrap\"><svg class=\"lineage-svg\" viewBox=\"0 0 " + W + " " + H + "\" preserveAspectRatio=\"xMidYMax meet\" aria-hidden=\"true\"><g class=\"lineage-branch-layer\">" + paths + "</g></svg><div class=\"lineage-leaf-layer\"><div class=\"lineage-node lineage-node--root\" style=\"left:50%;top:" + (root.y / H) * 100 + "%\">你</div>" + leafButtons + "</div></div></div>";
  const stage = DOM.lineageTree.querySelector(".lineage-stage");
  window.requestAnimationFrame(() => animateLineageDraw(stage));
  DOM.lineageDeleteBtn.disabled = lineageSelectedIndex < 0;
}


function closeTopbarMenu() {
  DOM.topbarMenuPanel.hidden = true;
  DOM.topbarMenuBtn.setAttribute("aria-expanded", "false");
}

function toggleTopbarMenu() {
  const next = DOM.topbarMenuPanel.hidden;
  DOM.topbarMenuPanel.hidden = !next;
  DOM.topbarMenuBtn.setAttribute("aria-expanded", String(next));
}

function applyTheme(theme) {
  DOM.body.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  localStorage.setItem("nextbook-theme", DOM.body.getAttribute("data-theme"));
}

async function runGenerate(isRandom = false) {
  clearMessage();
  lastGenerateWasRandom = isRandom;
  const traits = parseTraits(DOM.traitInput.value);
  DOM.anchorNote.hidden = true;
  DOM.anchorNote.textContent = "";
  switchView(DOM.resultView);
  setRecommendLoading(true);

  if (isRandom) {
    try {
      const doc = pickOne((await olSearch({ q: "fiction", limit: 10 })).filter(d => olDocTitle(d) && olDocAuthor(d)));
      if (!doc) throw new Error("empty");
      latestRecommendations = [{ id: "ol-random-" + slugForOlTempSeed(olDocTitle(doc), olDocAuthor(doc), olDocYear(doc)), title: olDocTitle(doc), author: olDocAuthor(doc), year: olDocYear(doc), tags: pickTagsFromSubjects(olDocSubjectsForTagging(doc)), randomOnly: true, reasonParagraphs: reasonParagraphsForRandom(doc), majorDimensionKeys: ["all"], majorDimensions: [] }];
      DOM.dimensionFilter.innerHTML = '<option value="all">全部</option>';
      renderRecommendations(latestRecommendations, "all");
      return;
    } catch (err) {
      console.error("[Nextbook] random recommendation failed", err);
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
  try { seed = await fetchOpenLibraryAnchor(q0); } catch (err) {
    console.error("[Nextbook] anchor fetch failed", { q0 }, err);
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

  try { latestRecommendations = await buildLiveRecommendations(seed, traits); } catch (err) {
    console.error("[Nextbook] build recommendations failed", err);
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
  DOM.anchorNote.textContent = "推荐来自 Open Library 实时检索。" + (lastThemeRecommendationHint ? " " + lastThemeRecommendationHint : "");
  renderLineage();
}

DOM.bookInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    commitInputToChips();
  }
});
DOM.bookInput.addEventListener("blur", commitInputToChips);
DOM.bookChipList.addEventListener("click", event => {
  const btn = event.target.closest("button[data-chip-index]");
  if (!btn) return;
  const i = Number(btn.getAttribute("data-chip-index"));
  if (!Number.isNaN(i)) {
    selectedBookTitles.splice(i, 1);
    renderBookChips();
  }
});
DOM.generateBtn.addEventListener("click", () => { void runGenerate(false); });
DOM.randomGenerateBtn.addEventListener("click", () => { void runGenerate(true); });
DOM.fillDemoBtn.addEventListener("click", () => {
  selectedBookTitles = ["百年孤独"];
  DOM.traitInput.value = "冷峻, 非线性叙事, 思想性";
  renderBookChips();
  updateFilterOptions();
});
DOM.dimensionFilter.addEventListener("change", e => renderRecommendations(latestRecommendations, e.target.value));
DOM.traitInput.addEventListener("input", () => updateFilterOptions());
DOM.backBtn.addEventListener("click", () => switchView(DOM.inputView));
DOM.rerollBtn.addEventListener("click", () => { void runGenerate(lastGenerateWasRandom); });
DOM.lineageBackBtn.addEventListener("click", () => switchView(DOM.inputView));
DOM.lineageTree.addEventListener("click", event => {
  const node = event.target.closest(".lineage-node--book");
  if (!node) return;
  const idx = Number(node.getAttribute("data-lineage-index"));
  if (Number.isNaN(idx)) return;
  lineageSelectedIndex = lineageSelectedIndex === idx ? -1 : idx;
  renderLineage();
});
DOM.lineageDeleteBtn.addEventListener("click", () => {
  if (lineageSelectedIndex < 0) return;
  lineageHistory.splice(lineageSelectedIndex, 1);
  lineageSelectedIndex = -1;
  localStorage.setItem("nextbook-lineage", JSON.stringify(lineageHistory));
  renderLineage();
});

DOM.topbarMenuBtn.addEventListener("click", e => { e.stopPropagation(); toggleTopbarMenu(); });
DOM.topbarMenuPanel.addEventListener("click", e => e.stopPropagation());
document.addEventListener("click", closeTopbarMenu);
DOM.themeToggleBtn.addEventListener("click", () => {
  const now = DOM.body.getAttribute("data-theme") || "light";
  applyTheme(now === "light" ? "dark" : "light");
  closeTopbarMenu();
});
DOM.lineagePageBtn.addEventListener("click", () => { switchView(DOM.lineageView); closeTopbarMenu(); });


/** 封面图片来自 Open Library Covers API（按 ISBN）。 */
const AMBIENT_COVER_ISBNS = [
  "9780140449136", "9780141439587", "9780140449242", "9780140449334",
  "9780141439722", "9780141439563", "9780140449266", "9780140449181",
  "9780140449082", "9780140449273", "9780140449159", "9780140449235",
  "9780143126561", "9780385490818", "9780307277671", "9780451524935",
  "9780553210247", "9780486284729", "9780374522595", "9780399501487",
  "9780061120081", "9780316769177", "9780679720201", "9780679734529"
];

function openLibraryCoverUrl(isbn, size = "L") {
  return "https://covers.openlibrary.org/b/isbn/" + isbn + "-" + size + ".jpg";
}

function shuffleAmbient(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function initAmbientCoverBackground() {
  const host = document.querySelector(".ambient-bg__books");
  if (!host) return;

  const list = shuffleAmbient(AMBIENT_COVER_ISBNS);
  host.innerHTML = "";

  const buildStrip = () => {
    const strip = document.createElement("div");
    strip.className = "ambient-bg__strip";
    for (const isbn of list) {
      const wrap = document.createElement("div");
      wrap.className = "ambient-bg__cover";
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.src = openLibraryCoverUrl(isbn, "M");
      img.onerror = () => {
        wrap.classList.add("ambient-bg__cover--placeholder");
        img.remove();
      };
      wrap.appendChild(img);
      strip.appendChild(wrap);
    }
    return strip;
  };

  host.appendChild(buildStrip());
  host.appendChild(buildStrip());
}

(async function init() {
  applyTheme(localStorage.getItem("nextbook-theme") || "light");
  lineageHistory = loadLineage();
  renderBookChips();
  renderLineage();
  updateFilterOptions();
  initAmbientCoverBackground();
  closeTopbarMenu();
  if (DOM.anthropicSessionKeyInput) {
    try {
      DOM.anthropicSessionKeyInput.value = sessionStorage.getItem(ANTHROPIC_SESSION_KEY) || "";
    } catch {
      DOM.anthropicSessionKeyInput.value = "";
    }
    const persistAnthropicSessionKey = () => {
      try {
        const v = DOM.anthropicSessionKeyInput.value.trim();
        if (v) sessionStorage.setItem(ANTHROPIC_SESSION_KEY, v);
        else sessionStorage.removeItem(ANTHROPIC_SESSION_KEY);
      } catch {
        /* private mode or disabled storage */
      }
    };
    DOM.anthropicSessionKeyInput.addEventListener("input", persistAnthropicSessionKey);
    DOM.anthropicSessionKeyInput.addEventListener("change", persistAnthropicSessionKey);
  }
})();


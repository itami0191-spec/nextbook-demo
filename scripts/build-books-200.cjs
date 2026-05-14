const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const themesPath = path.join(root, "themes.json");
const booksPath = path.join(root, "books.json");
const THEMES = JSON.parse(fs.readFileSync(themesPath, "utf8"));
const THEMES_SET = new Set(THEMES);

const MOVEMENTS = [
  "魔幻现实主义", "存在主义", "现代主义", "后现代主义", "日本文学",
  "中国当代文学", "英美现代主义", "后殖民文学", "东欧文学", "拉美文学"
];

function eraKey(y) {
  if (y < 1900) return "1900年前";
  if (y <= 1950) return "1900-1950";
  if (y <= 1980) return "1950-1980";
  if (y <= 2009) return "1980-2010";
  return "2010至今";
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function dimsFromYear(year) {
  const y = Number(year) && year > 1000 && year <= 2030 ? year : 2005;
  let lineage = 72, contemporary = 72;
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
  return {
    lineage: Math.round(lineage),
    contemporary: Math.round(contemporary),
    authorOther: 72,
    themes: clamp(78, 62, 96),
    custom: 70
  };
}

function remapMovement(raw, book) {
  const s = String(raw || "").trim();
  const author = String(book.author || "");
  const map = {
    魔幻现实主义: "魔幻现实主义", 存在主义: "存在主义", 现代主义: "现代主义",
    后现代主义: "后现代主义", 日本文学: "日本文学", 日本现当代: "日本文学",
    中国当代文学: "中国当代文学", 当代中国现实主义: "中国当代文学",
    英美现代主义: "英美现代主义", 美国现代主义: "英美现代主义",
    拉美文学: "拉美文学", 后殖民文学: "后殖民文学", 东欧文学: "东欧文学"
  };
  if (map[s]) return map[s];
  if (/石黑|村上|川端|芥川|三岛|谷崎|太宰|夏目|大江|安部|井上|吉本|多和田/.test(author)) return "日本文学";
  if (/科塔萨尔|略萨|马尔克斯|鲁尔福|阿斯图里亚斯|富恩特斯|多诺索|普伊格|波拉尼奥/.test(author)) {
    if (/魔幻|百年|霍乱|幽灵|玉米|爱情与其他魔鬼|幽灵之家/.test(String(book.title))) return "魔幻现实主义";
    return "拉美文学";
  }
  if (/陀思妥|托尔斯泰|契诃夫|布尔加科夫|帕斯捷尔纳纳|索尔仁尼琴|昆德拉|哈谢克|卡夫卡|穆齐尔|莱姆|米沃什|贡布罗维奇/.test(author)) return "东欧文学";
  if (s === "俄国现实主义") return "东欧文学";
  if (s === "中国古典小说") return "现代主义";
  if (s === "反乌托邦小说" || s === "科幻") return "后现代主义";
  if (s === "美国当代文学") return Number(book.year) >= 1970 ? "后现代主义" : "英美现代主义";
  if (s === "英日当代") return /石黑|村上|川端|芥川|三岛|谷崎|太宰|夏目|大江|安部/.test(author) ? "日本文学" : "英美现代主义";
  if (s === "亚裔美国文学") return "后殖民文学";
  if (s === "法国通俗与浪漫传统") return "现代主义";
  if (s === "犯罪小说") return "后现代主义";
  return "现代主义";
}

function pickTags(seed, minN, maxN) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const n = minN + (h % (maxN - minN + 1));
  const out = [];
  let x = h;
  for (let k = 0; k < 100 && out.length < n; k++) {
    x = (x * 1103515245 + 12345) >>> 0;
    const t = THEMES[x % THEMES.length];
    if (!out.includes(t)) out.push(t);
  }
  while (out.length < minN) {
    const t = THEMES[out.length % THEMES.length];
    if (!out.includes(t)) out.push(t);
    else out.push(THEMES[(out.length + 7) % THEMES.length]);
  }
  return out.slice(0, Math.min(maxN, Math.max(minN, out.length)));
}

function normalizeBook(b) {
  const y = Math.round(Number(b.year));
  const year = Number.isFinite(y) && y > 0 && y < 2100 ? y : 2000;
  const movement = MOVEMENTS.includes(b.literary_movement) ? b.literary_movement : remapMovement(b.literary_movement, { ...b, year });
  let tags = (Array.isArray(b.tags) ? b.tags : []).map(t => String(t).trim()).filter(t => THEMES_SET.has(t));
  tags = [...new Set(tags)];
  if (tags.length > 4) tags = tags.slice(0, 4);
  if (tags.length < 2) tags = pickTags(String(b.id) + movement + year, 2, 4);
  return {
    id: String(b.id || "").trim() || "id-" + Math.random().toString(36).slice(2, 11),
    title: String(b.title || "未命名").trim(),
    author: String(b.author || "").trim(),
    year,
    literary_movement: movement,
    tags,
    dimensions: b.dimensions && typeof b.dimensions === "object" ? b.dimensions : dimsFromYear(year),
    links: Array.isArray(b.links) && b.links.length ? b.links : ["书目库条目"]
  };
}

const EXTRA = `百年孤独|加西亚·马尔克斯|1967|魔幻现实主义
佩德罗·巴拉莫|胡安·鲁尔福|1955|魔幻现实主义
玉米人|米格尔·安赫尔·阿斯图里亚斯|1949|魔幻现实主义
幽灵之家|伊莎贝尔·阿连德|1982|魔幻现实主义
爱情与其他魔鬼|加西亚·马尔克斯|1994|魔幻现实主义
局外人|加缪|1942|存在主义
恶心|萨特|1938|存在主义
鼠疫|加缪|1947|存在主义
西西弗神话|加缪|1942|存在主义
禁闭|萨特|1944|存在主义
变形记|卡夫卡|1915|现代主义
城堡|卡夫卡|1926|现代主义
尤利西斯|乔伊斯|1922|现代主义
追忆似水年华|普鲁斯特|1913|现代主义
到灯塔去|伍尔夫|1927|现代主义
红楼梦|曹雪芹|1791|现代主义
神曲|但丁|1320|现代主义
白噪音|德里罗|1985|后现代主义
万有引力之虹|品钦|1973|后现代主义
路|科马克·麦卡锡|2006|后现代主义
三体|刘慈欣|2008|后现代主义
1984|奥威尔|1949|后现代主义
雪国|川端康成|1937|日本文学
金阁寺|三岛由纪夫|1956|日本文学
挪威的森林|村上春树|1987|日本文学
海边的卡夫卡|村上春树|2002|日本文学
我是猫|夏目漱石|1905|日本文学
心|夏目漱石|1914|日本文学
活着|余华|1993|中国当代文学
长恨歌|王安忆|1995|中国当代文学
浮躁|贾平凹|1987|中国当代文学
家|巴金|1933|中国当代文学
骆驼祥子|老舍|1937|中国当代文学
第七天|余华|2013|中国当代文学
了不起的盖茨比|菲茨杰拉德|1925|英美现代主义
太阳照常升起|海明威|1926|英美现代主义
老人与海|海明威|1952|英美现代主义
兔子跑吧|厄普代克|1960|英美现代主义
地下铁道|怀特黑德|2016|英美现代主义
瓦解|阿切贝|1958|后殖民文学
午夜的孩子|鲁西迪|1981|后殖民文学
微物之神|阿兰达蒂·洛伊|1997|后殖民文学
美国佬|阿迪契|2013|后殖民文学
罪与罚|陀思妥耶夫斯基|1866|东欧文学
安娜·卡列尼娜|托尔斯泰|1877|东欧文学
生命不能承受之轻|昆德拉|1984|东欧文学
索拉里斯星|莱姆|1961|东欧文学
雅各之书|托卡尔丘克|2014|东欧文学
城市与狗|略萨|1963|拉美文学
酒吧长谈|略萨|1969|拉美文学
蜘蛛女之吻|普伊格|1976|拉美文学
荒野侦探|波拉尼奥|1998|拉美文学
2666|波拉尼奥|2004|拉美文学
跳房子|科塔萨尔|1963|拉美文学`
  .trim()
  .split(/\n/)
  .map(line => {
    const [title, author, year, mov] = line.split("|");
    const y = +year;
    const id = "hand-" + Buffer.from(title + author + y).toString("hex").slice(0, 16);
    return {
      id,
      title,
      author,
      year: y,
      literary_movement: mov,
      tags: pickTags(id + title, 2, 4),
      dimensions: dimsFromYear(y),
      links: ["精选条目 · " + mov]
    };
  });

function dedupe(books) {
  const seen = new Set();
  const out = [];
  for (const b of books) {
    const k = normKey(b);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(b);
  }
  return out;
}
function normKey(b) {
  return [b.title, b.author, b.year].join("\t").toLowerCase();
}

function counts(books) {
  const move = Object.fromEntries(MOVEMENTS.map(m => [m, 0]));
  const era = { "1900年前": 0, "1900-1950": 0, "1950-1980": 0, "1980-2010": 0, "2010至今": 0 };
  for (const b of books) {
    if (move[b.literary_movement] != null) move[b.literary_movement]++;
    const ek = eraKey(b.year);
    if (era[ek] != null) era[ek]++;
  }
  return { move, era };
}

function needs(move, era, n) {
  return (
    n < 200 ||
    MOVEMENTS.some(m => move[m] < 10) ||
    Object.keys(era).some(k => era[k] < 20)
  );
}

let raw = JSON.parse(fs.readFileSync(booksPath, "utf8"));
let books = dedupe(raw.map(normalizeBook).concat(EXTRA).map(normalizeBook));

// 已禁用「补库·」占位循环：请用手动 EXTRA 或外部数据扩充，避免污染推荐池。
books = dedupe(books.map(normalizeBook));
fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), "utf8");

const { move, era } = counts(books);
console.log("\n========== 文学运动统计 ==========");
for (const m of MOVEMENTS) console.log(m + "：" + move[m] + " 本");
console.log("\n========== 年代分布统计 ==========");
for (const k of ["1900年前", "1900-1950", "1950-1980", "1980-2010", "2010至今"]) console.log(k + "：" + era[k] + " 本");
console.log("\n总计：" + books.length + " 本");

let err = 0;
for (const b of books) {
  if (!MOVEMENTS.includes(b.literary_movement)) err++;
  if (!Number.isFinite(b.year)) err++;
  const tg = b.tags || [];
  if (tg.length < 2 || tg.length > 4) err++;
  for (const t of tg) if (!THEMES_SET.has(t)) err++;
}
if (err) console.log("字段校验异常计数：" + err);
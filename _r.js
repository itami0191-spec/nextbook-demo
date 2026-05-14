const fs=require('fs');let p='app.js';let s=fs.readFileSync(p,'utf8');

const oldPhrase=`function phrasePick(seed, options) {
  let h = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return options[h % options.length];
}`;

const newPhrase=`function phrasePick(seed, options) {
  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let h2 = str.length;
  for (let i = 0; i < str.length; i += 1) {
    h2 = ((h2 << 5) - h2 + str.charCodeAt(i)) | 0;
  }
  const idx = ((h >>> 0) ^ (h2 >>> 0)) >>> 0;
  return options[idx % options.length];
}`;

if(!s.includes(oldPhrase))throw new Error('phrasePick'); s=s.replace(oldPhrase,newPhrase);

const oldVibe=`function softTagVibe(book) {
  const t = book.tags;
  const sid = book.id || book.title || "";
  if (t.length >= 2) {
    const [a, b] = t;
    return phrasePick(\`\${sid}-t2-\${a}-\${b}\`, [
      \`\${a}挨着\${b}，读起来不腻歪\`,
      \`有点儿\${a}，又藏着\${b}\`,
      \`\${a}和\${b}来回拉扯，两口味道叠在一处\`,
      \`说不清更像\${a}还是\${b}，反正挺上头\`,
      \`\${a}打底，\${b}时不时冒出来捣乱\`,
      \`一口气里既有\${a}也有\${b}，混着还挺顺口\`,
      \`左一口\${a}右一口\${b}，像在嘴里打架又和好\`
    ]);
  }
  if (t.length === 1) {
    const x = t[0];
    return phrasePick(\`\${sid}-t1-\${x}\`, [
      \`\${x}那一挂的老熟人\`,
      \`一路带着\${x}的气味\`,
      \`骨子里偏\${x}\`,
      \`\${x}味挺冲，但不突兀\`,
      \`像是写给懂\${x}的人看的\`,
      \`\${x}三个字就够把频道调过去\`
    ]);
  }
  return phrasePick(\`\${sid}-t0\`, [
    "说不清哪里投缘，翻着翻着就对味了",
    "翻开两三页就想赖着不走",
    "不一定说得清好在哪，但就是顺手",
    "像路过咖啡馆飘出来的香气，忍不住进去坐会儿",
    "没什么大道理，纯粹读着舒服",
    "纸页沙沙响的时候，心里也跟着松一格",
    "偶尔就是需要这种不讲理的合拍"
  ]);
}`;

const newVibe=`function softTagVibe(book) {
  const t = book.tags;
  const sid = book.id || book.title || "";
  const y = book.year || 0;
  const salt = sid + "::" + y + "::t";
  if (t.length >= 2) {
    const [a, b] = t;
    return phrasePick(salt + "2~" + a + "~" + b, [
      \`\${a}挨着\${b}，读起来不腻歪\`,
      \`\${b}在背后推着\${a}走半步，语感很稳\`,
      \`${a}+${b}像两条轨，合上的时候会有咔哒一声\`,
      \`一半是\${a}的脾气，一半是\${b}的回声\`,
      \`${a}当底色，${b}当突然亮起来的灯\`,
      \`${a}和${b}不在一条线上，却偏偏能对话\`,
      \`像把${a}和${b}调进同一个 EQ，频段刚好不打架\`,
      \`${b}冒出来抢戏，又把${a}衬得更结实\`,
      \`${a}写得很老实，${b}负责偷偷使坏\`,
      \`${a}先铺地板，${b}再往上叠一层灰\`,
      \`阅读时${a}在左耳，${b}在右耳，中间留一条缝透气\`,
      \`${b}像在窗外敲玻璃，屋子里却是${a}的气味\`,
      \`${a}与${b}彼此试探，翻到后面才握手\`,
      \`像两个人轮流递话筒：${a}一句，${b}一句\`
    ]);
  }
  if (t.length === 1) {
    const x = t[0];
    return phrasePick(salt + "1~" + x, [
      \`\${x}那一挂的老熟人\`,
      \`一路带着\${x}的气味\`,
      \`字里行间老回头去看\${x}\`,
      \`\${x}像背景辐射，读着读着就被照到\`,
      \`${x}挂在嘴边，反而不像口号\`,
      \`作者似乎默认你懂一点儿\${x}\`,
      \`不是炫技式的\${x}，而是缝里渗出来的\`,
      \`\${x}三个字像暗号，对上就进门\`,
      \`像天气里的\${x}：说不准什么时候下雨\`,
      \`读的时候你会替\${x}留一只耳朵\`,
      \`故事跑远了，气味还是${x}\`
    ]);
  }
  return phrasePick(salt + "~0", [
    "说不清哪里投缘，翻着翻着就对味了",
    "翻开两三页就想赖着不走",
    "不一定说得清好在哪，但就是顺手",
    "像路过的橱窗忽然亮了一下，忍不住停步",
    "没什么大道理，纯粹读着舒服",
    "像在陌生房间里摸到熟悉的开关",
    "偶尔就是需要这种不讲理的合拍",
    "读起来像鞋带松了一格却又刚好能走",
    "句子不慌不忙地把你的走神拽回来",
    "不是惊艳型，却让人愿意多翻一页"
  ]);
}`;

if(!s.includes(oldVibe))throw new Error('vibe'); s=s.replace(oldVibe,newVibe);

const oldP1=`    : phrasePick(\`\${candidate.id}-fb-\${flow.length}\`, [
        \`《\${candidate.title}》（\${candidate.year}）\${vibe}，读着顺手。顺着\${flow}晃到这儿，歇一脚很正常。\`,
        \`翻开《\${candidate.title}》（\${candidate.year}），\${vibe}扑面而来。\${flow}这条线牵过来，停这儿不违和。\`,
        \`\${vibe}——《\${candidate.title}》（\${candidate.year}）就属于这一卦。从\${flow}一路遛弯过来，落脚在这儿挺自然。\`,
        \`读《\${candidate.title}》（\${candidate.year}）不必找借口：\${vibe}就够。\${flow}刚翻过，下一本停这本也不吃亏。\`
      ]);`;

const newP1=`    : phrasePick(
        [\`\${candidate.id}\`, candidate.year, candidate.title, flow, vibe].join("::"),
        [
          \`《\${candidate.title}》（\${candidate.year}）\${vibe}，读着顺手。顺着\${flow}晃到这儿，歇一脚很自然。\`,
          \`《\${candidate.title}》（\${candidate.year}）身上带着点儿\${vibe}。\${flow}一路读过来，落脚在这本是顺坡。\`,
          \`从\${flow}走到《\${candidate.title}》（\${candidate.year}），中间像少拐一个弯。\${vibe}就在纸页缝里。\`,
          \`摊开《\${candidate.title}》（\${candidate.year}），扑面是\${vibe}那一路的气氛。\${flow}的余温还在。\`,
          \`\${flow}读后接《\${candidate.title}》（\${candidate.year}），\${vibe}像下一站的站牌。\`,
          \`《\${candidate.title}》（\${candidate.year}）和\${flow}读起来不是硬拼出来的关系；\${vibe}把那口气接住了。\`,
          \`\${vibe}——这本《\${candidate.title}》（\${candidate.year}）像在\${flow}旁边又开一扇窗。\`,
          \`《\${candidate.title}》（\${candidate.year}）不吵不闹，却把\${vibe}放得刚好。\${flow}翻过，停这儿合情合理。\`,
          \`顺着\${flow}的惯性翻到《\${candidate.title}》（\${candidate.year}），读到一半才认出\${vibe}那股劲儿。\`,
          \`你愿意把《\${candidate.title}》（\${candidate.year}）当作\${flow}读后的「延音」：底色还是\${vibe}。\`,
          \`《\${candidate.title}》（\${candidate.year}）接在\${flow}后面，语感像鞋带重新系紧——更利落；\${vibe}照旧在场。\`,
          \`如果\${flow}让你心里留了个凹槽，《\${candidate.title}》（\${candidate.year}）差不多能镶进去。\${vibe}是它的形状。\`,
          \`别把它想得太隆重：《\${candidate.title}》（\${candidate.year}）只是稳稳接住\${vibe}。\${flow}刚铺好路。\`,
          \`《\${candidate.title}》（\${candidate.year}）在\${vibe}这一侧待着，读起来像少走一段冤枉路（从\${flow}过来更明显）。\`
        ]
      );`;

if(!s.includes(oldP1))throw new Error('p1'); s=s.replace(oldP1,newP1);

fs.writeFileSync(p,s); console.log('ok');

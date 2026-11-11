/* ---------- screens: router and home ---------- */
const VIEWS = {};
function render() {
  clearTimers(); KB = null;
  try { (VIEWS[S.view] || VIEWS.home)(); }
  catch (e) {
    console.error('render failed', e);
    try { S.view = 'home'; save(); VIEWS.home(); }
    catch (e2) { app.innerHTML = `<div class="page"><div class="card"><b>משהו השתבש</b><p class="small muted">${esc(String(e2 && e2.message || e2))}</p><button class="btn btn-main" onclick="location.reload()">לטעון מחדש</button></div></div>`; }
  }
  bindCommon();
}
function go(v) { S.view = v; save(); render(); window.scrollTo(0, 0); }
function bindCommon() {
  on('[data-go]', b => { SFX.tap(); go(b.dataset.go); });
  on('[data-word]', b => wordCard(b.dataset.word, b.dataset.list));
}
const topBar = (title, back = 'home') => `<header class="bar"><button class="icon-btn" data-go="${back}" aria-label="חזרה">${IC.back}</button><h2>${title}</h2><span class="pill candy-pill">${CANDY(18)}${S.candy}</span></header>`;
/* a word: its picture, the word in school letters, and 7 segments, one per step */
function wordChip(w, l) {
  const st = Math.min(stageOf(w), maxSt(l)), M = maxSt(l), star = st >= M;
  return `<button class="wchip ${star ? 'star' : ''}" data-word="${esc(kOf(w))}" data-list="${l.id}"><span class="wem">${w.em || '🔤'}</span><span class="wtx"><span class="w">${EN(w.en)}</span><span class="segs" aria-label="שלב ${st} מתוך ${M}">${Array.from({ length: M }, (_, i) => `<i class="${i < st ? 'on' : ''}"></i>`).join('')}</span></span>${star ? `<span class="st">${IC.star}</span>` : ''}</button>`;
}
function daysStrip(l) {
  const t = todayStr(), left = dayDiff(t, l.date); if (left < 0 || left > 10) return '';
  const from = addDays(t, -Math.min(3, Math.max(0, 6 - left))), out = [];
  for (let d = from; d <= l.date; d = addDays(d, 1)) {
    const cls = d === l.date ? 'exam' : S.days[d] ? 'done' : d === t ? 'today' : d < t ? 'miss' : '';
    out.push(`<span class="dd ${cls}"><b>${d === l.date ? '✎' : S.days[d] ? '✓' : +d.slice(8)}</b><small>${d === t ? 'היום' : d === l.date ? (l.kind === 'exam' ? 'מבחן' : 'הכתבה') : 'אבגדהוש'[new Date(d + 'T12:00').getDay()] + "'"}</small></span>`);
  }
  return `<div class="days">${out.join('')}</div>`;
}
function planLine(l) {
  const n = l.words.length, st = listStars(l), left = l.date ? dayDiff(todayStr(), l.date) : 99;
  if (st === n) return left >= 0 && left < 99 ? 'כל המילים בכוכב. עכשיו הכתבה לדוגמה, וחזרה קצרה כל יום עד ההכתבה.' : 'כל המילים בכוכב. אלופה!';
  if (left === 0) return 'ההכתבה היום. אימון קצר לחימום, ובהצלחה!';
  return 'אימון אחד ביום, בערך 10 דקות, מספיק כדי להגיע לכוכב בכל המילים.';
}
VIEWS.home = () => {
  const l = curList(), t = todayStr(), left = l && l.date ? dayDiff(t, l.date) : null, did = !!S.days[t];
  const last = l ? S.tests.filter(x => x.list === l.id).slice(-1)[0] : null, rv = reviewList();
  const upcoming = left != null && left >= 0;
  const floor = l ? `<section class="floor ${did ? 'did' : ''}"><div class="mat">
    <div class="fl-txt"><div class="eyebrow">${l.kind === 'exam' ? (upcoming ? 'המבחן הבא' : 'המבחן האחרון') : upcoming ? 'ההכתבה הבאה' : 'ההכתבה האחרונה'}</div><div class="fl-date">${l.date ? dateHe(l.date) : esc(l.t)}</div>
    ${upcoming ? `<div class="fl-count">${left === 0 ? '<b>היום</b>' : left === 1 ? '<b>מחר</b>' : `<b>${left}</b><span>ימים</span>`}</div>` : `<button class="chip on-mat" data-go="parent">אבא, יש רשימה חדשה?</button>`}</div>
    <div class="fl-romi">${romiSVG()}</div></div>${upcoming && l.date ? daysStrip(l) : ''}</section>` : '';
  const routine = l ? `<section class="routine"><div class="sec-h"><h2>המילים</h2><span class="tag">${listStars(l)}/${l.words.length} בכוכב</span></div>
    <div class="wlist">${l.words.map(w => wordChip(w, l)).join('')}</div>
    <button class="btn btn-main big" data-act="today">${did ? 'עוד אימון' : 'האימון של היום'}</button><p class="hint">${planLine(l)}</p></section>`
    : `<section class="card"><p>עוד אין רשימת מילים. אבא מוסיף אותה באזור ההורים.</p></section>`;
  const games = [['wand', 'שרביט ה-E', 'Magic E ותנועות ארוכות, כמו במבחן'], ['tramp', 'טרמפולינה', 'מרכיבים מילה, קופצים גבוה'], ['memory', 'ממתקיית הזיכרון', 'זוגות: מילה ופירוש'], ['rain', 'גשם היסודות', 'תופסים את האיות הנכון'], ['teach', 'המורה רומי', 'את מכתיבה לאבא'], ['duel', 'דו-קרב חברות', 'שתיים, טלפון אחד'], ...(SR ? [['speak', 'תגידי את זה', 'מדברים אנגלית, הטלפון מקשיב']] : [])];
  app.innerHTML = `<div class="page home">
  <header class="top"><button class="ava" data-go="shop" aria-label="הדמות שלי">${romiSVG({ head: 1 })}</button><div class="grow"><h1>היי ${NAME}</h1><div class="sub">${greet()}</div></div>
  <div class="pills"><span class="pill" title="ימים ברצף">${IC.flame}${streak()}</span><button class="pill candy-pill" data-go="shop" aria-label="ממתקים">${CANDY(18)}${S.candy}</button></div></header>
  ${bdayHTML()}${dadNoteHTML()}${floor}${routine}
  ${l ? `<div class="duo"><button class="act" data-act="mock"><span class="act-ic">${GIC.paper}</span><span class="grow"><b>${l.kind === 'exam' ? 'בוחן לדוגמה' : 'הכתבה לדוגמה'}</b><span>כמו בכיתה, עם ציון</span></span>${last ? `<span class="grade ${last.score >= 90 ? 'good' : ''}">${last.score}</span>` : ''}</button>
  <button class="act" data-act="review"><span class="act-ic">${GIC.loop}</span><span class="grow"><b>חזרה כללית</b><span>${rv.words.length} מילים מכל ההכתבות</span></span></button></div>` : ''}
  <section class="block"><div class="sec-h"><h2>משחקים</h2></div>
  <div class="games">${games.map(([k, n, d], i) => `<button class="game g${i % 6}" data-game="${k}"><span class="gic">${GIC[k]}</span><b>${n}</b><span class="gd">${d}</span>${S.best[k] != null ? `<span class="best">שיא ${S.best[k]}${BEST_LBL[k] ? ' ' + BEST_LBL[k] : ''}</span>` : ''}</button>`).join('')}</div></section>
  <section class="block"><div class="sec-h"><h2>מעבר לכיתה</h2><span class="tag candy">ממתק כפול</span></div>
  <div class="packs">${bonusLists().map(b => `<button class="pack" data-pack="${b.id}"><span class="pk-em">${b.words.slice(0, 3).map(w => w.em).join('')}</span><b>${esc(b.t)}</b><span class="bar2"><i style="width:${listPct(b)}%"></i></span></button>`).join('')}</div></section>
  <nav class="foot"><button class="chip" data-go="lists">${GIC.list.replace('width="30" height="30"', 'width="18" height="18"')} כל הרשימות</button><button class="chip" data-go="shop">${GIC.shop.replace('width="30" height="30"', 'width="18" height="18"')} חנות</button><button class="chip" data-go="parent">${GIC.lock.replace('width="30" height="30"', 'width="18" height="18"')} הורים</button></nav>
  </div>`;
  on('[data-act="today"]', () => startPractice(l));
  on('[data-act="mock"]', () => startTest(l));
  on('[data-act="review"]', () => startPractice(reviewList()));
  on('[data-game]', b => startGame(b.dataset.game));
  on('[data-pack]', b => startPractice(listById(b.dataset.pack)));
  on('[data-act="dadnote"]', () => { S.dadNote = null; save(); render(); });
  if (isBday() && !(S.bday || {})[t.slice(0, 4)]) later(bdayGift, 500);
  else if (!S.seen.welcome) later(welcome, 400);
};
function greet() {
  const h = new Date().getHours(), s = streak();
  if (s >= 3) return `${s} ימים ברצף. כמו באימונים: התמדה!`;
  return h < 12 ? 'בוקר טוב!' : h < 17 ? 'צהריים טובים!' : 'ערב טוב!';
}
function dadNoteHTML() { return S.dadNote ? `<button class="note" data-act="dadnote"><span class="note-ic">${GIC.heart}</span><span class="grow"><b>מאבא</b><span>${esc(S.dadNote)}</span></span></button>` : ''; }
function welcome() {
  if (S.view !== 'home' || document.querySelector('.modal')) return;
  S.seen.welcome = 1; save();
  modal('ברוכה הבאה לסלטה', `<div class="center">${romiSVG()}</div><p>כאן מתאמנים על המילים באנגלית להכתבה, ועל עוד הרבה מילים.</p><p>כל מילה עוברת <b>7 שלבים</b> עד כוכב. על כל תשובה נכונה מקבלים ממתק, ובממתקים קונים בגדי התעמלות לדמות שלך.</p><p class="small muted">אם לא שומעים את המילים, בדקי שהצליל בטלפון פתוח.</p>`, [['יאללה!', () => say('Hello Romi! Let\'s practice!')]]);
}
/* tap a word: hear it, see it letter by letter, see the steps */
function wordCard(k, lid) {
  const l = listById(lid) || curList(), w = (l && l.words.find(x => kOf(x) === k)); if (!w) return;
  const st = stageOf(w), M = maxSt(l);
  const m = modal('', `<div class="wcard"><div class="em big">${w.em || '🔤'}</div><div class="word" dir="ltr">${letterSpans(w.en)}</div><div class="he">${w.he.map(esc).join(' / ')}</div>
  <div class="row center"><button class="btn btn-ghost" data-s="say">${IC.sound} ${hasVoice(w) ? 'בקול של אבא' : 'שמיעה'}</button><button class="btn btn-ghost" data-s="spell">איות</button>${hasHeVoice() ? '<button class="btn btn-ghost" data-s="he">בעברית</button>' : ''}</div>
  <div class="steps">${Array.from({ length: M }, (_, i) => `<span class="${i < st ? 'on' : ''}" title="${STEP_NAMES[i]}"></span>`).join('')}</div><div class="small muted center">${st >= M ? 'כוכב! המילה הזאת שלך.' : `שלב ${st + 1} מתוך ${M}: ${STEP_NAMES[st]}`}</div>
  ${famOf(w.en).map(f => `<p class="tip">${esc(f.tip)}</p>`).join('')}</div>`, [['סגור']]);
  const card = m.querySelector('.wcard');
  m.querySelector('[data-s="say"]').onclick = e => { e.stopPropagation(); sayWord(w); };
  m.querySelector('[data-s="spell"]').onclick = e => { e.stopPropagation(); spellOut(w.en, card.querySelector('.word')); };
  const he = m.querySelector('[data-s="he"]'); if (he) he.onclick = e => { e.stopPropagation(); say(w.he[0], 'he'); };
  sayWord(w);
}

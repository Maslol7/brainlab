/* ---------- practice session ---------- */
let P = null;
function startPractice(list) {
  if (!list || !list.words || !list.words.length) return toast('אין מילים ברשימה הזאת');
  const { q, n } = planSession(list);
  P = { list, q, n, done: 0, ok: 0, candy: 0, words: new Set(), stars: [], last: null, wrongRun: 0, hardShown: false, bonus: list.src !== 'class' && list.id !== 'review' };
  S.view = 'practice'; save(); nextItem();
}
function nextItem() {
  if (!P) return go('home');
  if (P.done >= P.n || !P.q.length) return finishPractice();
  if (P.last && kOf(P.q[0]) === P.last && P.q.length > 1) P.q.push(P.q.shift());
  const w = P.q[0], type = itemType(w, P.list), c = { w, type, phase: 'ask', hint: false };
  if (type === 'pick') c.opts = shuffle([w.en.toLowerCase(), ...misspell(w.en)]);
  if (type === 'meanEN' || type === 'meanHE') c.opts = shuffle([w, ...others(w, P.list, 3)]);
  if (type === 'tiles') c.tiles = makeTiles(w.en, prog(w).bad > prog(w).ok ? 0 : 2);
  P.cur = c; P.words.add(kOf(w)); render(); window.scrollTo(0, 0); autoSay(c);
}
function autoSay(c) {
  if (['typeHE2EN', 'meanHE'].includes(c.type)) { if (hasHeVoice()) say(c.w.he[0], 'he'); return; }
  sayWord(c.w);
}
const sayBtn = (lang = 'en', big) => `<button class="icon-btn say ${big ? 'big' : ''}" data-say="${lang}" aria-label="שמיעה">${IC.sound}</button>`;
const slowBtn = () => `<button class="icon-btn say" data-say="slow" aria-label="לאט">${IC.slow}</button>`;
function promptHTML(c) {
  const w = c.w, he = w.he.map(esc).join(' / ');
  switch (c.type) {
    case 'learn': return `<div class="ask">מילה חדשה!</div><div class="learn"><div class="em big">${w.em || '🔤'}</div><div class="word" dir="ltr">${letterSpans(w.en)}</div><div class="he">${he}</div>
      <div class="row center">${sayBtn()}${slowBtn()}<button class="btn btn-ghost" data-act="spell">איות</button></div>${famOf(w.en).map(f => `<p class="tip">${esc(f.tip)}</p>`).join('')}</div>`;
    case 'meanEN': return `<div class="ask">מה הפירוש?</div><div class="prompt"><div class="word" dir="ltr">${esc(w.en)}</div>${sayBtn()}</div>`;
    case 'meanHE': return `<div class="ask">איך אומרים באנגלית?</div><div class="prompt"><div class="he big">${he}</div>${hasHeVoice() ? sayBtn('he') : ''}</div>`;
    case 'pick': return `<div class="ask">איך כותבים?</div><div class="prompt"><span class="em">${w.em}</span><div class="he">${he}</div>${sayBtn()}</div>`;
    case 'tiles': return `<div class="ask">הרכיבי את המילה</div><div class="prompt"><span class="em">${w.em}</span><div class="he">${he}</div>${sayBtn()}${slowBtn()}</div>`;
    case 'typeEN': return `<div class="ask">הקשיבי וכתבי באנגלית</div><div class="prompt">${sayBtn('en', 1)}${hasVoice(w) ? '<span class="dadv">בקול של אבא</span>' : ''}${slowBtn()}${c.hint ? `<span class="em">${w.em}</span><div class="he">${he}</div>` : '<button class="chip" data-act="hint">רמז</button>'}</div>`;
    case 'typeHE2EN': return `<div class="ask">כתבי באנגלית</div><div class="prompt"><div class="he big">${he}</div>${hasHeVoice() ? sayBtn('he') : ''}${c.hint ? `<span class="em">${w.em}</span>` : '<button class="chip" data-act="hint">רמז</button>'}</div>`;
    case 'writeHE': return `<div class="ask">כתבי את הפירוש בעברית</div><div class="prompt"><div class="word" dir="ltr">${esc(w.en)}</div>${sayBtn()}</div>`;
  }
  return '';
}
function answerHTML(c) {
  if (c.type === 'learn') return `<button class="btn btn-main big" data-act="gotit">הבנתי!</button>`;
  if (c.opts) return `<div class="opts ${c.type === 'meanEN' ? 'he' : 'en'}">${c.opts.map((o, i) => `<button class="opt" data-o="${i}" ${c.type === 'meanEN' ? '' : 'dir="ltr"'}>${c.type === 'pick' ? esc(o) : c.type === 'meanEN' ? esc(o.he[0]) : esc(o.en)}</button>`).join('')}</div>`;
  if (c.type === 'tiles') return `<div id="typed"></div>${tilesHTML(c.tiles)}`;
  return `<div id="typed"></div>${kbdHTML(c.type === 'writeHE' ? 'he' : 'en')}`;
}
VIEWS.practice = () => {
  if (!P || !P.cur) { S.view = 'home'; return VIEWS.home(); }
  const c = P.cur;
  app.innerHTML = `<div class="page play ${c.opts || c.type === 'learn' ? '' : 'haskbd'}">
  <header class="bar"><button class="icon-btn" data-act="quit" aria-label="יציאה">${IC.x}</button><div class="prog"><i style="width:${Math.round(P.done / P.n * 100)}%"></i></div><span class="pill">${CANDY(18)}${P.candy}</span></header>
  <div class="mini-romi" id="mr">${romiSVG()}</div>
  <section class="q">${promptHTML(c)}</section>
  <div id="fb"></div>
  <section class="ans">${answerHTML(c)}</section></div>`;
  bindPractice();
};
function bindPractice() {
  const c = P.cur, w = c.w;
  on('[data-act="quit"]', () => modal('לצאת מהאימון?', 'מה שכבר עשית נשמר.', [['להמשיך להתאמן'], ['לצאת', () => { P = null; go('home'); }]]));
  on('[data-say]', b => b.dataset.say === 'he' ? say(w.he[0], 'he') : sayWord(w, b.dataset.say === 'slow' ? .5 : undefined));
  on('[data-act="spell"]', () => spellOut(w.en, app.querySelector('.learn .word')));
  on('[data-act="hint"]', () => { c.hint = true; const keep = KB && KB.val; render(); if (KB && keep) { KB.val = keep; kbRefresh(); } });
  on('[data-act="gotit"]', () => { grade(w, P.list, 'learn', true); P.q.push(P.q.shift()); P.last = kOf(w); P.done += .5; SFX.ok(); nextItem(); });
  on('[data-o]', b => choose(+b.dataset.o, b));
  if (c.type === 'tiles') bindKbd({ lang: 'en', tiles: c.tiles, word: w.en.toLowerCase(), onEnter: v => typed(v) });
  else if (!c.opts && c.type !== 'learn') bindKbd({ lang: c.type === 'writeHE' ? 'he' : 'en', onEnter: v => typed(v) });
}
function choose(i, b) {
  const c = P.cur, o = c.opts[i];
  const ok = c.type === 'pick' ? o === c.w.en.toLowerCase() : kOf(o) === kOf(c.w);
  if (c.phase === 'fix') { if (ok) { b.classList.add('good'); sayWord(c.w); later(() => advance(false), 700); } else { b.classList.add('shake'); later(() => b.classList.remove('shake'), 400); } return; }
  if (ok) { b.classList.add('good'); if (c.type === 'meanHE') sayWord(c.w); return success(); }
  b.classList.add('bad'); b.disabled = true;
  fail(c.type === 'pick' ? o : null);
  c.phase = 'fix';
  app.querySelectorAll('[data-o]').forEach((x, j) => { const oj = c.opts[j]; if (c.type === 'pick' ? oj === c.w.en.toLowerCase() : kOf(oj) === kOf(c.w)) x.classList.add('show'); });
  const he = c.w.he.map(esc).join(' / ');
  fb(`<div class="fb fb-bad">${c.type === 'pick' ? `הנכון: <b dir="ltr">${esc(c.w.en.toLowerCase())}</b>` : `<b dir="ltr">${esc(c.w.en)}</b> = ${he}`}<div class="small">לחצי על התשובה הנכונה כדי להמשיך</div></div>`);
  sayWord(c.w);
}
function typed(v) {
  const c = P.cur, w = c.w, he = c.type === 'writeHE';
  const ok = he ? checkHe(w, v) : checkEn(w, v);
  if (c.phase === 'copy') {
    if (ok) { KB.lock = true; SFX.ok(); hop(); fb(`<div class="fb fb-good">יפה! עכשיו זה נכון.</div>`); later(() => advance(false), 800); }
    else { SFX.soft(); shakeTyped(); later(() => { KB.val = ''; if (KB.tiles) { KB.used = []; app.querySelectorAll('[data-ti]').forEach(b => b.disabled = false); } kbRefresh(); }, 500); }
    return;
  }
  if (ok) { KB.lock = true; const note = he ? finalNote(v) : ''; return success(note); }
  fail(v);
  c.phase = 'copy'; const pg = app.querySelector('.page'); if (pg) pg.classList.add('fixing');
  const right = he ? w.he[0] : w.en;
  const a = he ? null : align(v, right);
  fb(`<div class="fb fb-bad">${he ? `כתבת: <b>${esc(v)}</b><br>הנכון: <b class="big">${w.he.map(esc).join(' / ')}</b>` : `<div class="cmp"><span class="lbl">כתבת</span><span class="mine" dir="ltr">${alignHTML(a.mine)}</span></div><div class="cmp"><span class="lbl">נכון</span><span class="right" dir="ltr">${alignHTML(a.right)}</span></div>`}
  <div class="small">עכשיו כתבי שוב, נכון. ככה המוח זוכר.</div></div>`);
  sayWord(w);
  later(() => { if (!KB) return; KB.val = ''; if (KB.tiles) { KB.used = []; app.querySelectorAll('[data-ti]').forEach(b => b.disabled = false); } kbRefresh(); }, 600);
}
function fb(html) { const e = document.getElementById('fb'); if (e) e.innerHTML = html; }
function shakeTyped() { const t = app.querySelector('#typed'); if (t) { t.classList.add('shake'); later(() => t.classList.remove('shake'), 400); } }
function hop(cls = 'hop') { const m = document.getElementById('mr'); if (!m) return; m.classList.remove('hop', 'flip', 'wobble'); void m.offsetWidth; m.classList.add(cls); }
function success(note) {
  const c = P.cur, r = grade(c.w, P.list, c.type, true);
  const add = P.bonus ? 2 : 1; addCandy(add); P.candy += add; P.ok++; P.wrongRun = 0;
  SFX.ok(); hop(r === 'star' ? 'flip' : 'hop');
  if (r === 'star') { P.stars.push(c.w.en); SFX.combo(); }
  fb(`<div class="fb fb-good">${pick(['מעולה!', 'יפה!', 'בול!', 'אלופה!', 'Great!', 'Perfect!'])} <span class="plus">+${add} ${CANDY(18)}</span>${r === 'star' ? `<div>⭐ <b dir="ltr">${esc(c.w.en)}</b> קיבלה כוכב!</div>` : ''}${note ? `<div class="small">${note}</div>` : ''}</div>`);
  app.querySelectorAll('[data-o]').forEach(b => b.disabled = true);
  save(); later(() => advance(true), r === 'star' ? 1500 : 900);
}
function fail(attempt) {
  const c = P.cur; grade(c.w, P.list, c.type, false, attempt); SFX.no(); hop('wobble');
  c.failed = true; P.wrongRun++;
  if (P.wrongRun >= 3 && !P.hardShown) { P.hardShown = true; later(() => toast(`❤️ ${esc(dadLine(true))}`, 4500), 900); }
  save();
}
/* finish the item: move the word in the queue */
function advance(ok) {
  if (!P) return;
  const c = P.cur, w = P.q.shift(); P.last = kOf(c.w); P.done++;
  if (c.failed) P.q.splice(Math.min(2, P.q.length), 0, w);
  else if (!mastered(w, P.list)) P.q.push(w);
  nextItem();
}
function finishPractice() {
  const p = P; if (!p) return go('home');
  const bonus = p.bonus ? 6 : 3; addCandy(bonus); p.candy += bonus;
  markDay(); S.sessions = (S.sessions || 0) + 1;
  const low = p.ok < p.done * .6, line = (S.sessions % 3 === 1 || low) ? dadLine(low) : '';
  save(); P = null;
  S.view = 'pdone'; S.last = { list: p.list.id, candy: p.candy, words: [...p.words], stars: p.stars, line, ok: p.ok }; render(); SFX.win();
}
VIEWS.pdone = () => {
  const r = S.last; if (!r) { S.view = 'home'; return VIEWS.home(); }
  const l = listById(r.list) || curList(), ws = l.words.filter(w => r.words.includes(kOf(w)));
  app.innerHTML = `<div class="page done">
  <div class="big-romi flip">${romiSVG()}</div>
  <h1 class="center">סיימת את האימון!</h1>
  <div class="center earned">+${r.candy} ${CANDY(28)}</div>
  ${r.stars.length ? `<p class="center">⭐ כוכבים חדשים: <b dir="ltr">${r.stars.map(esc).join(', ')}</b></p>` : ''}
  <div class="wchips">${ws.map(w => wordChip(w, l)).join('')}</div>
  ${r.line ? `<div class="note static"><span class="note-ic">${GIC.heart}</span><span class="grow"><b>מאבא</b><span>${esc(r.line)}</span></span></div>` : ''}
  <div class="stack"><button class="btn btn-main big" data-act="again">עוד סיבוב</button><button class="btn btn-ghost" data-go="home">למסך הבית</button></div></div>`;
  on('[data-act="again"]', () => startPractice(l));
};

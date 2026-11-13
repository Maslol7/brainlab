/* ---------- practice session ---------- */
let P = null;
function startPractice(list) {
  if (!list || !list.words || !list.words.length) return toast('אין מילים ברשימה הזאת');
  /* a new class list starts with a short look at all its words, once (to know what the week holds, not to memorise) */
  if (list.src === 'class' && !S.seen['ov_' + list.id] && list.words.filter(w => stageOf(w, list) === 0).length * 2 >= list.words.length) { OV = list; S.view = 'overview'; return render(); }
  const { q, n, waiting } = planSession(list);
  if (!q.length) return modal('סיימת להיום!', `<p class="center">${waiting && waiting.length ? `המילים <b dir="ltr">${waiting.map(w => esc(w.en)).join(', ')}</b> מחכות לבדיקה של מחר. ככה בודקים שהכתיב באמת נשאר בזיכרון.` : 'כל המילים כבר בכוכב.'}</p><p class="center small muted">בינתיים אפשר לשחק במשחקים.</p>`, [['טוב!']]);
  P = { list, q, n, done: 0, ok: 0, candy: 0, words: new Set(), stars: [], spelled: [], last: null, wrongRun: 0, hardShown: false, t0: Date.now(), ty: {}, bonus: list.src !== 'class' && list.id !== 'review' };
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
  if (type === 'fade1' || type === 'fade2') c.mask = fadeMask(w, type === 'fade1' ? 1 : 2);
  if (type === 'typeEN' && isSpell(P.list) && stageOf(w, P.list) === 6) c.delayed = true;
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
    case 'learn':
      if (c.cover === 'look') return `<div class="ask">תסתכלי טוב ותזכרי</div><div class="learn"><div class="em big">${w.em || '🔤'}</div><div class="word" dir="ltr">${esc(w.en)}</div><div class="timer"><i style="animation-duration:${c.peekMs}ms"></i></div></div>`;
      if (c.cover === 'build') return `<div class="ask">עכשיו מהזיכרון!</div><div class="prompt"><span class="em">${w.em}</span><div class="he">${he}</div>${sayBtn()}<button class="chip" data-act="peek">להציץ שוב</button></div>`;
      return `<div class="ask">מילה חדשה!</div><div class="learn"><div class="em big">${w.em || '🔤'}</div><div class="word" dir="ltr">${isSpell(P.list) ? trickHTML(w.en) : letterSpans(w.en)}</div><div class="he">${he}</div>
      <div class="row center">${sayBtn()}${slowBtn()}<button class="btn btn-ghost" data-act="spell">איות</button></div>${famOf(w.en).map(f => `<p class="tip">${esc(f.tip)}</p>`).join('')}</div>`;
    case 'copy': return `<div class="ask">${c.fix ? 'עכשיו העתיקי נכון, אות אחרי אות' : 'העתיקי את המילה, אות אחרי אות'}</div><div class="prompt"><span class="em">${w.em}</span><div class="word sp" dir="ltr">${trickHTML(w.en)}</div>${sayBtn()}</div>${c.fix ? '' : famOf(w.en).map(f => `<p class="tip">${esc(f.tip)}</p>`).join('')}`;
    case 'fade1': case 'fade2': return `<div class="ask">${c.type === 'fade1' ? 'השלימי את האותיות החסרות' : 'השלימי, הפעם חסר יותר'}</div><div class="prompt"><span class="em">${w.em}</span><div class="he">${he}</div>${sayBtn()}</div>`;
    case 'meanEN': return `<div class="ask">מה הפירוש?</div><div class="prompt"><div class="word" dir="ltr">${esc(w.en)}</div>${sayBtn()}</div>`;
    case 'meanHE': return `<div class="ask">איך אומרים באנגלית?</div><div class="prompt"><div class="he big">${he}</div>${hasHeVoice() ? sayBtn('he') : ''}</div>`;
    case 'pick': return `<div class="ask">איך כותבים?</div><div class="prompt"><span class="em">${w.em}</span><div class="he">${he}</div>${sayBtn()}</div>`;
    case 'tiles': return `<div class="ask">הרכיבי את המילה</div><div class="prompt"><span class="em">${w.em}</span><div class="he">${he}</div>${sayBtn()}${slowBtn()}</div>`;
    case 'typeEN': return `<div class="ask">${c.delayed ? 'בדיקה מאתמול: כתבי מהזיכרון' : 'הקשיבי וכתבי באנגלית'}</div><div class="prompt">${sayBtn('en', 1)}${hasVoice(w) ? '<span class="dadv">בקול של אבא</span>' : ''}${slowBtn()}${c.hint ? `<span class="em">${w.em}</span><div class="he">${he}</div>` : '<button class="chip" data-act="hint">רמז</button>'}</div>`;
    case 'typeHE2EN': return `<div class="ask">כתבי באנגלית</div><div class="prompt"><div class="he big">${he}</div>${hasHeVoice() ? sayBtn('he') : ''}${c.hint ? `<span class="em">${w.em}</span>` : '<button class="chip" data-act="hint">רמז</button>'}</div>`;
    case 'writeHE': return `<div class="ask">כתבי את הפירוש בעברית</div><div class="prompt"><div class="word" dir="ltr">${esc(w.en)}</div>${sayBtn()}</div>`;
  }
  return '';
}
function answerHTML(c) {
  if (c.type === 'learn') return c.cover === 'build' ? `<div id="typed"></div>${tilesHTML(c.tiles)}` : c.cover ? '' : `<button class="btn btn-main big" data-act="gotit">הבנתי!</button>`;
  if (c.opts) return `<div class="opts ${c.type === 'meanEN' ? 'he' : 'en'}">${c.opts.map((o, i) => `<button class="opt" data-o="${i}" ${c.type === 'meanEN' ? '' : 'dir="ltr"'}>${c.type === 'pick' ? esc(o) : c.type === 'meanEN' ? esc(o.he[0]) : esc(o.en)}</button>`).join('')}</div>`;
  if (c.type === 'tiles') return `<div id="typed"></div>${tilesHTML(c.tiles)}`;
  if (c.type === 'copy' || c.type === 'fade1' || c.type === 'fade2') return `<div id="typed"></div>${kbdHTML('en', 'בדיקה')}`;
  return `<div id="typed"></div>${kbdHTML(c.type === 'writeHE' ? 'he' : 'en')}`;
}
VIEWS.practice = () => {
  if (!P || !P.cur) { S.view = 'home'; return VIEWS.home(); }
  const c = P.cur;
  app.innerHTML = `<div class="page play ${c.opts || (c.type === 'learn' && c.cover !== 'build') ? '' : 'haskbd'}">
  <header class="bar"><button class="icon-btn" data-act="quit" aria-label="יציאה">${IC.x}</button><div class="prog"><i style="width:${Math.round(P.done / P.n * 100)}%"></i></div><span class="pill">${CANDY(18)}${P.candy}</span></header>
  <div class="mini-romi" id="mr">${romiSVG()}</div>
  <section class="q">${promptHTML(c)}</section>
  <div id="fb"></div>
  <section class="ans">${answerHTML(c)}</section></div>`;
  bindPractice();
};
function bindPractice() {
  const c = P.cur, w = c.w;
  on('[data-act="quit"]', () => modal('לצאת מהאימון?', 'מה שכבר עשית נשמר.', [['להמשיך להתאמן'], ['לצאת', () => { track('q', { l: P.list.id, done: Math.round(P.done), n: P.n, ok: P.ok, dur: Math.round((Date.now() - P.t0) / 1000) }); save(); P = null; go('home'); }]]));
  on('[data-say]', b => b.dataset.say === 'he' ? say(w.he[0], 'he') : sayWord(w, b.dataset.say === 'slow' ? .5 : undefined));
  on('[data-act="spell"]', () => spellOut(w.en, app.querySelector('.learn .word')));
  on('[data-act="hint"]', () => { c.hint = true; const keep = KB && KB.val; render(); if (KB && keep) { KB.val = keep; kbRefresh(); } });
  on('[data-act="gotit"]', () => { SFX.tap(); c.tiles = makeTiles(w.en, 0); c.peeks = 0; coverLook(3000); sayWord(w); });
  on('[data-act="peek"]', () => { c.peeks++; coverLook(2000); });
  on('[data-o]', b => choose(+b.dataset.o, b));
  if (c.type === 'learn' && c.cover === 'build') bindKbd({ lang: 'en', tiles: c.tiles, word: w.en.toLowerCase(), onEnter: v => coverDone(v) });
  else if (c.type === 'copy') bindKbd({ lang: 'en', strict: w.en.toLowerCase(), onEnter: () => copyDone() });
  else if (c.type === 'fade1' || c.type === 'fade2') bindKbd({ lang: 'en', mask: c.mask, mword: w.en.toLowerCase(), onEnter: v => fadeDone(v) });
  else if (c.type === 'tiles') bindKbd({ lang: 'en', tiles: c.tiles, word: w.en.toLowerCase(), onEnter: v => typed(v) });
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
  if (!he && isSpell(P.list)) {
    const a = align(v, w.en);
    fb(`<div class="fb fb-bad"><div class="cmp"><span class="lbl">כתבת</span><span class="mine" dir="ltr">${alignHTML(a.mine)}</span></div><div class="cmp"><span class="lbl">נכון</span><span class="right" dir="ltr">${alignHTML(a.right)}</span></div><div class="small">המילה חוזרת לתרגול עם אותיות חסרות. עכשיו מעתיקים נכון.</div></div>`);
    KB.lock = true; sayWord(w);
    return later(() => { if (!P || P.cur !== c) return; c.type = 'copy'; c.fix = true; render(); }, 2000);
  }
  c.phase = 'copy'; const pg = app.querySelector('.page'); if (pg) pg.classList.add('fixing');
  const right = he ? w.he[0] : w.en;
  const a = he ? null : align(v, right);
  fb(`<div class="fb fb-bad">${he ? `כתבת: <b>${esc(v)}</b><br>הנכון: <b class="big">${w.he.map(esc).join(' / ')}</b>` : `<div class="cmp"><span class="lbl">כתבת</span><span class="mine" dir="ltr">${alignHTML(a.mine)}</span></div><div class="cmp"><span class="lbl">נכון</span><span class="right" dir="ltr">${alignHTML(a.right)}</span></div>`}
  <div class="small">עכשיו כתבי שוב, נכון. ככה המוח זוכר.</div></div>`);
  sayWord(w);
  later(() => { if (!KB) return; KB.val = ''; if (KB.tiles) { KB.used = []; app.querySelectorAll('[data-ti]').forEach(b => b.disabled = false); } kbRefresh(); }, 600);
}
/* look, cover, build: right after a new word, the word shows for a few seconds, hides, and she builds it from memory */
function coverLook(ms) { const c = P.cur; c.cover = 'look'; c.peekMs = ms; render(); later(() => { if (P && P.cur === c) { c.cover = 'build'; render(); } }, ms); }
function coverDone(v) {
  const c = P.cur, w = c.w;
  if (checkEn(w, v)) {
    KB.lock = true; grade(w, P.list, 'learn', true); const add = c.peeks ? 0 : 1; if (add) { addCandy(add); P.candy += add; }
    SFX.ok(); hop(); fb(`<div class="fb fb-good">${c.peeks ? 'יפה!' : 'זכרת!'}${add ? ` <span class="plus">+1 ${CANDY(18)}</span>` : ''}</div>`); save();
    return later(() => { P.q.push(P.q.shift()); P.last = kOf(w); P.done++; nextItem(); }, 900);
  }
  SFX.soft(); shakeTyped(); fb(`<div class="fb fb-bad">כמעט. עוד מבט אחד.</div>`); c.peeks++;
  later(() => coverLook(2000), 800);
}
function fb(html) { const e = document.getElementById('fb'); if (e) e.innerHTML = html; }
function shakeTyped() { const t = app.querySelector('#typed'); if (t) { t.classList.add('shake'); later(() => t.classList.remove('shake'), 400); } }
function hop(cls = 'hop') { const m = document.getElementById('mr'); if (!m) return; m.classList.remove('hop', 'flip', 'wobble', ...Object.keys(TRICKS).map(t => 'trick-' + t)); void m.offsetWidth; m.classList.add(cls); }
function success(note) {
  const c = P.cur, r = grade(c.w, P.list, c.type, true);
  const add = P.bonus ? 2 : 1; addCandy(add); P.candy += add; P.ok++; P.wrongRun = 0;
  SFX.ok(); hop(r === 'star' || r === 'spell' ? trickCls() : 'hop'); tyCount(c.type, 1);
  if (r === 'star') { P.stars.push(c.w.en); SFX.combo(); }
  if (r === 'spell') { P.spelled.push(c.w.en); SFX.combo(); }
  fb(`<div class="fb fb-good">${pick(['מעולה!', 'יפה!', 'בול!', 'אלופה!', 'Great!', 'Perfect!'])} <span class="plus">+${add} ${CANDY(18)}</span>${r === 'star' ? `<div>⭐ <b dir="ltr">${esc(c.w.en)}</b> קיבלה כוכב!</div>` : ''}${r === 'spell' ? `<div>✍️ את שולטת בכתיב של <b dir="ltr">${esc(c.w.en)}</b>!</div>` : ''}${c.type === 'typeHE2EN' && isSpell(P.list) && stageOf(c.w, P.list) === 6 ? '<div class="small">מחר בודקים אותה שוב, כדי לדעת שהיא באמת נשארה.</div>' : ''}${note ? `<div class="small">${note}</div>` : ''}</div>`);
  app.querySelectorAll('[data-o]').forEach(b => b.disabled = true);
  save(); later(() => advance(true), r === 'star' || r === 'spell' || c.type === 'typeHE2EN' ? 1700 : 900);
}
function fail(attempt) {
  const c = P.cur; grade(c.w, P.list, c.type, false, attempt); SFX.no(); hop('wobble'); tyCount(c.type, 0);
  c.failed = true; P.wrongRun++;
  if (P.wrongRun >= 3 && !P.hardShown) { P.hardShown = true; later(() => toast(`❤️ ${esc(dadLine(true))}`, 4500), 900); }
  save();
}
/* finish the item: move the word in the queue */
function advance(ok) {
  if (!P) return;
  const c = P.cur, w = P.q.shift(); P.last = kOf(c.w); P.done++;
  if (c.failed) P.q.splice(Math.min(2, P.q.length), 0, w);
  else if (!mastered(w, P.list) && !waitsTomorrow(w, P.list)) P.q.push(w);
  /* spelling track: a word that is done for today (or waits for tomorrow) makes room for the next new word */
  if (isSpell(P.list) && P.list.id !== 'review') {
    const inWork = P.q.filter(x => !mastered(x, P.list)).length;
    if (inWork < 3) { const nx = P.list.words.find(x => stageOf(x, P.list) === 0 && !P.q.includes(x)); if (nx) P.q.push(nx); }
  }
  nextItem();
}
function finishPractice() {
  const p = P; if (!p) return go('home');
  const bonus = p.bonus ? 6 : 3; addCandy(bonus); p.candy += bonus;
  markDay(); S.sessions = (S.sessions || 0) + 1;
  track('s', { l: p.list.id, n: Math.round(p.done), ok: p.ok, c: p.candy, st: p.stars.length, sp: p.spelled.length, dur: Math.round((Date.now() - p.t0) / 1000), ty: p.ty });
  const low = p.ok < p.done * .6, line = (S.sessions % 3 === 1 || low) ? dadLine(low) : '';
  save(); P = null;
  S.view = 'pdone'; S.last = { list: p.list.id, candy: p.candy, words: [...p.words], stars: p.stars, spelled: p.spelled, line, ok: p.ok }; render(); SFX.win();
}
VIEWS.pdone = () => {
  const r = S.last; if (!r) { S.view = 'home'; return VIEWS.home(); }
  const l = listById(r.list) || curList(), ws = l.words.filter(w => r.words.includes(kOf(w)));
  app.innerHTML = `<div class="page done">
  <div class="big-romi ${trickCls()} twice">${romiSVG()}${petHTML()}</div>
  <h1 class="center">סיימת את האימון!</h1>
  <div class="center earned">+${r.candy} ${CANDY(28)}</div>
  ${r.spelled && r.spelled.length ? `<p class="center">✍️ שולטת בכתיב: <b dir="ltr">${r.spelled.map(esc).join(', ')}</b></p>` : ''}
  ${r.stars.length ? `<p class="center">⭐ כוכבים חדשים: <b dir="ltr">${r.stars.map(esc).join(', ')}</b></p>` : ''}
  <div class="wchips">${ws.map(w => wordChip(w, l)).join('')}</div>
  ${r.line ? `<div class="note static"><span class="note-ic">${GIC.heart}</span><span class="grow"><b>מאבא</b><span>${esc(r.line)}</span></span></div>` : ''}
  <div class="stack"><button class="btn btn-main big" data-act="again">עוד סיבוב</button><button class="btn btn-ghost" data-go="home">למסך הבית</button></div></div>`;
  on('[data-act="again"]', () => startPractice(l));
};

/* ---------- the first look at a new list: all words, pictures and sound, about 20 seconds ---------- */
let OV = null;
VIEWS.overview = () => {
  const l = OV; if (!l) { S.view = 'home'; return VIEWS.home(); }
  app.innerHTML = `<div class="page">${topBar(esc(l.t))}
  <section class="stack"><h2>${l.kind === 'exam' ? 'המילים של המבחן' : 'המילים של ההכתבה'}</h2><p class="muted">מסתכלים ושומעים פעם אחת. לא צריך לזכור הכל עכשיו: האימון מלמד מילה אחרי מילה.</p></section>
  <div class="wlist ov">${l.words.map((w, i) => `<button class="wchip" data-ov="${i}"><span class="wem">${w.em || '🔤'}</span><span class="wtx"><span class="w">${EN(w.en)}</span><span class="small muted">${esc(w.he[0])}</span></span></button>`).join('')}</div>
  <button class="btn btn-ghost" data-act="ovall">${IC.sound} להשמיע את כולן</button>
  <button class="btn btn-main big" data-act="ovgo">בואי נתחיל</button></div>`;
  on('[data-ov]', b => sayWord(l.words[+b.dataset.ov]));
  on('[data-act="ovall"]', () => l.words.forEach((w, i) => later(() => { const b = app.querySelector(`[data-ov="${i}"]`); app.querySelectorAll('.wchip.lit').forEach(x => x.classList.remove('lit')); if (b) { b.classList.add('lit'); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } sayWord(w); }, i * 1500)));
  on('[data-act="ovgo"]', () => { S.seen['ov_' + l.id] = 1; OV = null; save(); startPractice(l); });
};

/* per step type: [right on first try, all] for the usage report */
function tyCount(t, ok) { if (!P) return; const a = P.ty[t] || (P.ty[t] = [0, 0]); a[0] += ok; a[1]++; }

/* ---------- the spelling steps ---------- */
/* the word with its tricky part marked (the part she must remember to write) */
function trickHTML(word) { const t = trickyIdx(word); return [...word].map((ch, i) => ch === ' ' ? '<span class="lt sp"> </span>' : `<span class="lt${t.has(i) ? ' tr' : ''}">${esc(ch)}</span>`).join(''); }
/* copy: only the right letter goes in, so the hand learns the right order */
function copyDone() {
  const c = P.cur; KB.lock = true;
  if (c.fix) { SFX.ok(); hop(); fb(`<div class="fb fb-good">יפה! עכשיו זה נכון.</div>`); return later(() => advance(false), 800); }
  success();
}
/* missing letters: a mistake shows the word, then she copies it letter by letter */
function fadeDone(v) {
  const c = P.cur, w = c.w; KB.lock = true;
  if (checkEn(w, v)) return success();
  fail(v); SFX.soft();
  const a = align(v, w.en);
  fb(`<div class="fb fb-bad"><div class="cmp"><span class="lbl">כתבת</span><span class="mine" dir="ltr">${alignHTML(a.mine)}</span></div><div class="cmp"><span class="lbl">נכון</span><span class="right" dir="ltr">${alignHTML(a.right)}</span></div><div class="small">עכשיו מעתיקים נכון.</div></div>`);
  sayWord(w);
  later(() => { if (!P || P.cur !== c) return; c.type = 'copy'; c.fix = true; render(); }, 1800);
}

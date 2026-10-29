/* sprint */
let SP = null;
function gameIntro(title, icon, color, text, best, act) { return `<div class="stack">${hud()}<div class="card stack" style="text-align:center;align-items:center;background:radial-gradient(80% 60% at 50% 0%,color-mix(in srgb,${color} 30%,transparent),transparent),var(--panel)"><span style="width:84px;height:84px;border-radius:24px;display:grid;place-items:center;background:color-mix(in srgb,${color} 25%,transparent);color:${color}">${icon.replace('<svg', '<svg style="width:48px;height:48px"')}</span><h2 style="font-size:2.3rem">${title}</h2><p class="muted" style="margin:0">${text}</p><div class="bigscore">${best}</div><div class="muted small" style="margin-top:-10px">השיא שלך</div><button class="btn btn-primary btn-wide" data-act="${act}">התחל!</button><button class="btn btn-ghost btn-wide" data-go="arcade">חזרה לארקייד</button></div></div>`; }
function gameOver(score, prev, coins, act, label = 'נגמר הזמן') { const rec = score > prev; return `<div class="stack">${hud()}<div class="card stack" style="text-align:center"><div class="eyebrow">${label}</div><div class="bigscore">${score}</div><p class="muted" style="margin:0">${rec ? '<b class="mark">שיא חדש!</b>' : `השיא שלך: ${prev}`}</p><div class="gains"><span class="gain c">+${coins} מטבעות</span></div><button class="btn btn-primary btn-wide" data-act="${act}">עוד סיבוב</button><button class="btn btn-ghost btn-wide" data-go="arcade">חזרה לארקייד</button></div></div>`; }
function renderSprint() {
  if (!SP || SP.state === 'idle') { app.innerHTML = gameIntro('ספרינט חשבון', IC.calc, EC.water, '60 שניות. מקלידים את התשובה, וכשהיא נכונה עוברים לבד לתרגיל הבא. כל תשובה = 2 מטבעות.', S.arcade.sprint, 'spgo'); return bind(); }
  if (SP.state === 'over') { app.innerHTML = gameOver(SP.score, SP.prevBest, SP.score * 2, 'spgo'); return bind(); }
  const left = Math.max(0, SP.end - Date.now());
  app.innerHTML = `<div class="qbar"><button class="icon-btn" data-act="spquit" aria-label="יציאה">${IC.x}</button><div class="tbar grow"><i id="spbar" style="width:${left / 600}%"></i></div><div class="qmeta"><span class="pts" id="spsc">${SP.score}</span><span class="tm" id="sptm">${Math.ceil(left / 1000)}</span></div></div>
  <div class="card"><div class="sprint-q"><span class="ltr" id="spq">${SP.q.q}</span></div><div class="sprint-in" id="spin">&nbsp;</div>
  <div class="keypad" dir="ltr">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button data-k="${k}">${k}</button>`).join('')}<button data-k="del" class="k-alt">מחק</button><button data-k="0">0</button><button data-k="skip" class="k-alt">דלג</button></div></div>`;
  app.querySelectorAll('[data-k]').forEach(b => b.onclick = () => spKey(b.dataset.k));
  app.querySelector('[data-act="spquit"]').onclick = () => { SP = null; go('arcade'); };
  every(() => { const l = Math.max(0, SP.end - Date.now()); const t = document.getElementById('sptm'), bar = document.getElementById('spbar'); if (t) t.textContent = Math.ceil(l / 1000); if (bar) bar.style.width = (l / 600) + '%'; if (l <= 0) spOver(); }, 250);
}
function spLevel() { const d = nextDay() || TOTAL; return Math.min(3, baseDiff(d) + (SP && SP.score > 12 ? 1 : 0)); }
function spNew() { SP.q = genSprint(spLevel()); SP.inp = ''; }
function spStart() { ac(); SP = { state: 'run', score: 0, end: Date.now() + 60000, prevBest: S.arcade.sprint }; spNew(); S.view = 'sprint'; render(); }
function padInput(G, k, refresh, checkFn) {
  const inp = document.getElementById(G.inId);
  if (k === 'del') G.inp = G.inp.slice(0, -1);
  else if (k === 'skip') return refresh(true);
  else if (k === '.') { if (!G.inp.includes('.')) G.inp += G.inp ? '.' : '0.'; }
  else G.inp += k;
  SFX.tap();
  const v = checkFn(G.inp);
  if (v === true) { G.score++; SFX.ok(); return refresh(true); }
  if (v === false) { inp.classList.remove('bad'); void inp.offsetWidth; inp.classList.add('bad'); SFX.no(); G.inp = ''; G.miss = (G.miss || 0) + 1; later(() => { const e = document.getElementById(G.inId); if (e) e.innerHTML = '&nbsp;'; }, 250); return; }
  inp.innerHTML = G.inp || '&nbsp;';
}
function spKey(k) {
  if (!SP || SP.state !== 'run') return; SP.inId = 'spin';
  padInput(SP, k, () => { spNew(); const q = document.getElementById('spq'), i = document.getElementById('spin'), s = document.getElementById('spsc'); if (q) q.textContent = SP.q.q; if (i) i.innerHTML = '&nbsp;'; if (s) s.textContent = SP.score; },
    inp => inp !== '' && +inp === SP.q.a ? true : inp.length >= String(SP.q.a).length ? false : null);
}
function spOver() { clearTimers(); SP.state = 'over'; S.bonusDay = todayStr(); S.coins += SP.score * 2; S.xp += SP.score; if (SP.score > S.arcade.sprint) { S.arcade.sprint = SP.score; SFX.win(); burst(80); } checkBadges(); save(); renderSprint(); }
/* checkout (kupa) */
let KP = null;
const KASK = { total: 'כמה צריך לשלם בסך הכל?', change: p => `הלקוח משלם ${p} ₪. כמה עודף?`, disc: p => `יש ${p}% הנחה. מה המחיר אחרי ההנחה?` };
function kpLevel() { return KP.score >= 9 ? 3 : KP.score >= 4 ? 2 : 1; }
function kpNew() { KP.q = genKupa(kpLevel()); KP.inp = ''; }
function receiptHTML() { const q = KP.q; return `<div class="receipt" id="rcpt"><h5>קופה ראשית · לקוח ${KP.score + 1}</h5>${q.items.map(g => `<div class="ln"><span>${g[0]}</span><span>${money(g[1])} ₪</span></div>`).join('')}<div class="ask">${q.ask === 'total' ? KASK.total : q.ask === 'change' ? KASK.change(q.pay) : KASK.disc(q.pct)}</div></div>`; }
function renderKupa() {
  if (!KP || KP.state === 'idle') { app.innerHTML = gameIntro('קופה ראשית', IC.cart, EC.fire, 'משמרת של 90 שניות בקופה. לקוחות מגיעים עם מוצרים, ואתה מחשב סכום, עודף או הנחה. כל לקוח = 3 מטבעות. מקלידים נקודה לאגורות.', S.arcade.kupa, 'kpgo'); return bind(); }
  if (KP.state === 'over') { app.innerHTML = gameOver(KP.score, KP.prevBest, KP.score * 3, 'kpgo', 'המשמרת נגמרה'); return bind(); }
  const left = Math.max(0, KP.end - Date.now());
  app.innerHTML = `<div class="qbar"><button class="icon-btn" data-act="kpquit" aria-label="יציאה">${IC.x}</button><div class="tbar grow"><i id="kpbar" style="width:${left / 900}%"></i></div><div class="qmeta"><span class="pts" id="kpsc">${KP.score}</span><span class="tm" id="kptm">${Math.ceil(left / 1000)}</span></div></div>
  <div id="rwrap">${receiptHTML()}</div><div class="card"><div class="sprint-in" id="kpin">&nbsp;</div>
  <div class="keypad" dir="ltr">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button data-k="${k}">${k}</button>`).join('')}<button data-k="." >.</button><button data-k="0">0</button><button data-k="del" class="k-alt">מחק</button></div>
  <button class="btn btn-ghost btn-wide" data-k="skip" style="margin-top:10px;min-height:44px">לקוח הבא (דלג)</button></div>`;
  app.querySelectorAll('[data-k]').forEach(b => b.onclick = () => kpKey(b.dataset.k));
  app.querySelector('[data-act="kpquit"]').onclick = () => { KP = null; go('arcade'); };
  every(() => { const l = Math.max(0, KP.end - Date.now()); const t = document.getElementById('kptm'), bar = document.getElementById('kpbar'); if (t) t.textContent = Math.ceil(l / 1000); if (bar) bar.style.width = (l / 900) + '%'; if (l <= 0) kpOver(); }, 250);
}
function kpStart() { ac(); KP = { state: 'run', score: 0, end: Date.now() + 90000, prevBest: S.arcade.kupa }; kpNew(); S.view = 'kupa'; render(); }
function kpKey(k) {
  if (!KP || KP.state !== 'run') return; KP.inId = 'kpin';
  const target = money(KP.q.a);
  padInput(KP, k, () => { SFX.beep(); kpNew(); const w = document.getElementById('rwrap'), i = document.getElementById('kpin'), s = document.getElementById('kpsc'); if (w) w.innerHTML = receiptHTML(); if (i) i.innerHTML = '&nbsp;'; if (s) s.textContent = KP.score; },
    inp => {
      if (inp === '' || inp.endsWith('.')) return null;
      if (Math.abs(+inp - KP.q.a) < .005) return true;
      const [ti, td] = target.split('.'), [ii, idd] = inp.split('.');
      if (idd === undefined) return ii.length > ti.length || (td === undefined && ii.length >= ti.length) ? false : null;
      if (td === undefined) return false;
      return idd.length >= td.length ? false : null;
    });
}
function kpOver() { clearTimers(); KP.state = 'over'; S.bonusDay = todayStr(); S.coins += KP.score * 3; S.xp += KP.score * 2; if (KP.score > S.arcade.kupa) { S.arcade.kupa = KP.score; SFX.win(); burst(80); } checkBadges(); save(); renderKupa(); }
/* piano memory */
let PN = null;
const SOLF = ['דו', 'רה', 'מי', 'פה', 'סול', 'לה', 'סי', 'דו'];
function renderPiano() {
  const st = PN ? PN.state : 'idle';
  const blacks = [0, 1, 3, 4, 5].map(i => `<span class="bk" style="left:calc(${(i + 1) * 12.5}% - 4%)"></span>`).join('');
  const keys = `<div class="piano" id="piano">${SOLF.map((n, i) => `<button data-pk="${i}" ${st !== 'input' ? 'disabled' : ''}>${n}</button>`).join('')}${blacks}</div>`;
  if (st === 'idle') { app.innerHTML = gameIntro('זיכרון פסנתר', IC.keys, '#A98BFF', 'הפסנתר מנגן רצף. נגן אותו בחזרה באותו סדר. כל סיבוב מוסיף תו. טיפ: שיר את שמות התווים בראש. ברצף 6 נפתחות אוזניות לדמות!', S.arcade.piano, 'pngo') + `<div class="card" style="margin-top:16px">${keys}</div>`; bind(); return pnBind(); }
  if (st === 'over') { const sc = PN.seq.length - 1; app.innerHTML = gameOver(sc, PN.prevBest, sc * 3, 'pngo', 'אוי, תו לא נכון'); bind(); return pnBind(); }
  app.innerHTML = `<div class="stack">${hud()}<div class="card" style="text-align:center"><div class="eyebrow">סיבוב ${PN.seq.length}</div><div class="bigscore" style="font-size:2.4rem">${st === 'play' ? 'הקשב...' : 'תורך!'}</div></div><div class="card">${keys}</div><button class="btn btn-ghost btn-wide" data-act="pnquit">חזרה לארקייד</button></div>`;
  bind(); pnBind();
}
function pnBind() {
  app.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => pnKey(+b.dataset.pk));
  const A = a => app.querySelector(`[data-act="${a}"]`);
  if (A('pngo')) A('pngo').onclick = () => { ac(); PN = { seq: [ri(0, 7)], pos: 0, state: 'play', prevBest: S.arcade.piano }; S.view = 'piano'; pnPlay(); };
  if (A('pnquit')) A('pnquit').onclick = () => { PN = null; go('arcade'); };
}
function lightKey(i, cls = 'lit', ms = 380) { const b = app.querySelector(`[data-pk="${i}"]`); if (b) { b.classList.add(cls); setTimeout(() => b.classList.remove(cls), ms); } }
function pnPlay() {
  PN.state = 'play'; PN.pos = 0; renderPiano();
  const gap = Math.max(330, 650 - PN.seq.length * 25);
  PN.seq.forEach((k, j) => later(() => { pianoNote(NOTES[k]); lightKey(k, 'lit', gap * .7); }, 500 + j * gap));
  later(() => { PN.state = 'input'; renderPiano(); }, 500 + PN.seq.length * gap);
}
function pnKey(i) {
  if (!PN || PN.state !== 'input') return;
  if (i === PN.seq[PN.pos]) { pianoNote(NOTES[i]); lightKey(i); PN.pos++; if (PN.pos === PN.seq.length) { PN.state = 'wait'; later(() => { PN.seq.push(ri(0, 7)); pnPlay(); }, 700); } }
  else { lightKey(i, 'wrong', 600); SFX.no(); PN.state = 'over'; S.bonusDay = todayStr(); const sc = PN.seq.length - 1; S.coins += sc * 3; S.xp += sc * 2; if (sc > S.arcade.piano) { S.arcade.piano = sc; later(() => { SFX.win(); burst(80); }, 300); } checkBadges(); save(); later(renderPiano, 650); }
}

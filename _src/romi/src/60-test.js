/* ---------- mock dictation: like in class. No help during it, a grade at the end ---------- */
let T = null;
function startTest(l) {
  if (!l) return;
  T = { l, items: shuffle(l.words).slice(0, l.kind === 'exam' ? 10 : 99).map(w => ({ w, mode: l.he && R() < .5 ? 'he' : 'en', en: '', he: '' })), i: 0, step: 'en', t0: Date.now() };
  S.view = 'test'; save(); render(); testSay();
}
function testSay() { const it = T && T.items[T.i]; if (!it) return; if (it.mode === 'he') { if (hasHeVoice()) say(it.w.he[0], 'he'); } else sayWord(it.w); }
VIEWS.test = () => {
  if (!T) { S.view = 'home'; return VIEWS.home(); }
  const it = T.items[T.i], n = T.items.length, he = T.step === 'he';
  const lines = T.items.slice(0, T.i).map((x, j) => `<li><span dir="ltr">${esc(x.en)}</span>${x.he ? ` <span class="muted">· ${esc(x.he)}</span>` : ''}</li>`).join('');
  app.innerHTML = `<div class="page play haskbd">
  <header class="bar"><button class="icon-btn" data-act="quit" aria-label="יציאה">${IC.x}</button><h2>הכתבה לדוגמה</h2><span class="pill">${T.i + 1}/${n}</span></header>
  <div class="paper"><ol>${lines}<li class="now"><span class="muted">${he ? esc(it.en) + ' · ...' : '...'}</span></li></ol></div>
  <section class="q">${he ? `<div class="ask">ועכשיו: מה הפירוש בעברית?</div><div class="prompt"><div class="word" dir="ltr">${esc(it.w.en)}</div></div>` : it.mode === 'he' ? `<div class="ask">כתבי באנגלית</div><div class="prompt"><div class="he big">${it.w.he.map(esc).join(' / ')}</div>${hasHeVoice() ? sayBtn('he') : ''}</div>` : `<div class="ask">הקשיבי וכתבי באנגלית</div><div class="prompt">${sayBtn('en', 1)}${slowBtn()}</div>`}</section>
  <section class="ans"><div id="typed"></div>${kbdHTML(he ? 'he' : 'en', 'הבא')}</section></div>`;
  on('[data-act="quit"]', () => modal('לצאת מההכתבה?', 'ההכתבה לא תיבדק.', [['להמשיך'], ['לצאת', () => { T = null; go('home'); }]]));
  on('[data-say]', b => b.dataset.say === 'he' ? say(it.w.he[0], 'he') : sayWord(it.w, b.dataset.say === 'slow' ? .5 : undefined));
  bindKbd({ lang: he ? 'he' : 'en', onEnter: v => {
    if (he) { it.he = v; T.step = 'en'; T.i++; }
    else { it.en = v; if (it.mode === 'en' && T.l.he) T.step = 'he'; else T.i++; }
    SFX.tap();
    if (T.i >= n) return finishTest();
    render(); if (T.step === 'en') testSay();
  } });
};
function finishTest() {
  const t = T, l = t.l; let pts = 0, tot = 0;
  t.items.forEach(x => {
    x.enOk = checkEn(x.w, x.en); tot++; if (x.enOk) pts++;
    if (x.mode === 'en' && l.he) { x.heOk = checkHe(x.w, x.he); tot++; if (x.heOk) pts++; }
    const q = prog(x.w), M = maxSt(l), t0 = todayStr();
    if (isSpell(l)) {
      /* the mock dictation is a real check of the spelling: right = written from memory; on another day it also counts as the next-day check */
      q.sp = q.sp || 0;
      if (x.enOk) { if (q.sp < 6) { q.sp = 6; q.rd = t0; } else if (q.sp === 6 && q.rd !== t0) q.sp = 7; else if (q.sp >= M) { q.r = (q.r || 0) + 1; q.due = addDays(t0, 2); } }
      else grade(x.w, l, 'typeEN', false, x.en);
      if (x.heOk && q.sp === 7) { q.sp = 8; q.r = 0; q.due = addDays(t0, 1); }
      return;
    }
    if (x.enOk) { if (q.st < 5) q.st = 5; else if (q.st >= M) { q.r = (q.r || 0) + 1; q.due = addDays(t0, 2); } }
    else grade(x.w, l, 'typeEN', false, x.en);
    if (x.heOk && q.st === 6) { q.st = 7; q.r = 0; q.due = addDays(t0, 1); }
    if (x.heOk === false && q.st >= 7) q.st = 6;
  });
  const score = Math.round(pts / tot * 100); track('t', { l: l.id, sc: score, n: t.items.length, dur: Math.round((Date.now() - t.t0) / 1000) }); const candy = Math.round(score / 10) + (score === 100 ? 10 : 0);
  addCandy(candy); markDay();
  S.tests.push({ list: l.id, d: todayStr(), score, wrong: t.items.filter(x => !x.enOk || x.heOk === false).map(x => x.w.en) }); S.tests = S.tests.slice(-40);
  let sticker = false; if (score === 100 && !S.stickers.some(s => s.id === l.id)) { S.stickers.push({ id: l.id, em: l.words[0].em || '⭐', t: l.t, d: todayStr() }); sticker = true; }
  S.last = { test: 1, list: l.id, score, candy, sticker, items: t.items.map(x => ({ en: x.w.en, he: x.w.he, a: x.en, b: x.he, eo: x.enOk, ho: x.heOk, m: x.mode })) };
  T = null; S.view = 'tdone'; save(); render(); score >= 90 ? SFX.win() : SFX.ok();
}
VIEWS.tdone = () => {
  const r = S.last; if (!r || !r.test) { S.view = 'home'; return VIEWS.home(); }
  const l = listById(r.list);
  const msg = r.score === 100 ? 'מאה! מושלם!' : r.score >= 90 ? 'כמעט מושלם!' : r.score >= 70 ? 'יפה מאוד! עוד קצת אימון על המילים האדומות.' : 'זה בדיוק בשביל זה מתאמנים. המילים האדומות ייכנסו לאימון הבא.';
  app.innerHTML = `<div class="page done">
  <div class="paper result"><div class="grade-big ${r.score >= 90 ? 'good' : ''}">${r.score}</div><h2>${msg}</h2>
  <ol>${r.items.map(x => `<li><div class="ln"><span dir="ltr" class="${x.eo ? 'ok' : 'no'}">${esc(x.a || '—')}</span>${x.eo ? ' ✓' : ` <span class="fix" dir="ltr">${esc(x.en)}</span>`}</div>
  ${x.ho == null ? `<div class="small muted">${x.m === 'he' ? 'שמעת: ' + x.he.map(esc).join(' / ') : ''}</div>` : `<div class="ln"><span class="${x.ho ? 'ok' : 'no'}">${esc(x.b || '—')}</span>${x.ho ? ' ✓' : ` <span class="fix">${x.he.map(esc).join(' / ')}</span>`}</div>`}</li>`).join('')}</ol></div>
  <div class="center earned">+${r.candy} ${CANDY(28)}</div>
  ${r.sticker ? `<p class="center">קיבלת מדבקה חדשה לאלבום! <span class="sticker">${r.sticker ? esc(l ? (l.words[0].em || '⭐') : '⭐') : ''}</span></p>` : ''}
  <div class="stack"><button class="btn btn-main big" data-go="home">למסך הבית</button>${r.score < 100 && l ? '<button class="btn btn-ghost" data-act="train">אימון על המילים שטעיתי</button>' : ''}</div></div>`;
  on('[data-act="train"]', () => startPractice(l));
};

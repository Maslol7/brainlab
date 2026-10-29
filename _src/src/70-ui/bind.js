function bind() {
  if (app.querySelector('.path')) requestAnimationFrame(drawTrails);
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const g = b.dataset.go; if (g === 'sprint') SP = null; if (g === 'piano') PN = null; if (g === 'kupa') KP = null; go(g); });
  app.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => answer(+b.dataset.opt));
  app.querySelectorAll('[data-practice]').forEach(b => b.onclick = () => { if (S.cur) return modal('יש משימה פתוחה', 'קודם סיים את המשימה שהתחלת, או צא ממנה.', 'להמשיך במשימה', () => go('quiz')); startMission('practice', nextDay() || TOTAL, b.dataset.practice); });
  app.querySelectorAll('[data-skin]').forEach(b => b.onclick = () => buySkin(b.dataset.skin));
  app.querySelectorAll('[data-world]').forEach(b => b.onclick = () => { const k = b.dataset.world; S.openW = (S.openW || curWorld().k) === k ? 'none' : k; SFX.tap(); save(); const y = window.scrollY; render(); window.scrollTo(0, y); });
  app.querySelectorAll('[data-node]').forEach(b => b.onclick = () => {
    const k = +b.dataset.node, m = S.missions[k];
    if (m) return modal(BOSSES[k] ? BOSSES[k].n : `משימה ${k}`, `${m.c} מתוך ${m.n} נכונות · ${m.pts} נקודות · ${m.date.split('-').reverse().join('.')}`, 'סגור', () => { }, 'btn-primary', true);
    if (k === nextDay() && k <= unlocked() && !S.cur) return startNode(k);
    if (k > unlocked()) modal('עוד לא', `משימה ${k} תיפתח בעוד ${k - unlocked()} ימים.${BOSSES[k] ? ` שם מחכה ${BOSSES[k].n}.` : ''}`, 'הבנתי', () => { }, 'btn-primary', true);
    else if (k > (nextDay() || 99)) modal('קודם המשימות הקודמות', 'המסע הולך לפי הסדר. השלם קודם את המשימה המסומנת.', 'הבנתי', () => { }, 'btn-primary', true);
  });
  const on = (a, fn) => { const e = app.querySelector(`[data-act="${a}"]`); if (e) e.onclick = fn; };
  on('start', () => startNode(nextDay()));
  on('ocheck', () => { const c = S.cur; if ((c.ord || []).length === c.qs[c.i].items.length) answer(-1, c.ord.slice()); });
  on('resume', () => { if (S.cur && !S.cur.deadline) S.cur.qStart = Date.now(); go('quiz'); });
  on('next', nextQ);
  on('hint', () => { if (S.hints > 0) { S.hints--; S.cur.freeHint = true; } S.cur.hint = true; save(); renderQuiz(); });
  on('skip', () => { const c = S.cur; const to = nextOpen(c); if (to >= 0) { c.i = to; c.qStart = Date.now(); save(); renderQuiz(); window.scrollTo(0, 0); } });
  on('quit', () => modal('לצאת?', deferred(S.cur.kind) ? 'ההתקדמות נשמרת, אבל השעון ממשיך לרוץ.' : 'ההתקדמות נשמרת ואפשר להמשיך מאותה שאלה.', 'יציאה', () => { S.view = 'home'; save(); render(); }));
  on('reset', () => modal('לאפס הכל?', 'כל הנקודות, המטבעות, המשימות והתגים יימחקו. אי אפשר לבטל.', 'כן, לאפס', () => { const keep = { pin: S.pin, appliedB: S.appliedB, prv: S.prv, pmv: S.pmv, pexv: S.pexv, noEx: S.noEx, dadMsgs: S.dadMsgs, rewards: S.rewards }; S = defState(); Object.assign(S, keep); S.cloudForce = 1; SEEN = S.seen; save(); render(); }, 'btn-boss'));
  on('chest', () => { const amt = ri(15, 40) + (starsOf(S.last.correct, S.last.n) === 3 || S.last.won ? 20 : 0); S.last.chest = amt; S.coins += amt; SFX.coin(); later(SFX.coin, 120); burst(60); save(); render(); });
  on('bdgift', () => { S.bdGift[todayStr().slice(0, 4)] = 1; S.coins += 250; S.hints += 3; checkBadges(); SFX.win(); burst(220); save(); render(); modal(`מזל טוב, ${nm()}!`, 'קיבלת 250 מטבעות, 3 רמזים חינם ותג יום הולדת. שתהיה שנה של שיאים!', 'תודה!', () => { }, 'btn-primary', true); });
  on('review', () => { if (!S.mist.length) return; startMission('review', nextDay() || TOTAL); });
  app.querySelectorAll('[data-sim]').forEach(b => b.onclick = () => { if (S.cur) return modal('יש משימה פתוחה', 'קודם סיים את המשימה שהתחלת.', 'להמשיך', () => go('quiz')); startMission('sim', nextDay() || TOTAL, null, b.dataset.sim); });
  on('go', () => { const c = S.cur; c.intro = false; c.qStart = Date.now(); if (c.kind === 'boss') c.deadline = Date.now() + 20 * 60000; if (c.chapters) c.chDeadline = Date.now() + c.chapters[0].mins * 60000; SFX.tap(); save(); renderQuiz(); });
  on('quitintro', () => { S.cur = null; go('home'); });
  on('nextch', () => { const c = S.cur; c.ch++; c.chBreak = false; c.i = c.chapters[c.ch].s; c.qStart = Date.now(); c.chDeadline = Date.now() + c.chapters[c.ch].mins * 60000; save(); renderQuiz(); });
  on('champyes', () => { const c = S.cur; const q = mkQ(pick(['logic', 'series', 'verbal', 'analog', 'matrix']), 4, .5); q.champ = true; c.qs.push(q); c.i = c.qs.length - 1; c.champ = 'on'; c.hint = false; c.qStart = Date.now(); save(); renderQuiz(); });
  on('champno', () => finish());
  on('tcheck', () => { const c = S.cur; if (!c.tin || c.tin === '0.' || c.tin.endsWith('.')) return; answer(-1, c.tin); });
  on('sim', () => { if (S.cur) return modal('יש משימה פתוחה', 'קודם סיים את המשימה שהתחלת.', 'להמשיך', () => go('quiz')); modal('סימולציה מלאה', '30 שאלות ב-40 דקות, בלי משוב עד הסוף. כמו במבחן האמיתי. מוכן?', 'מתחילים', () => startMission('sim', nextDay() || TOTAL)); });
  on('freeze', () => { if (S.coins < 60) return modal('אין מספיק מטבעות', `חסרים ${60 - S.coins} מטבעות.`, 'הבנתי', () => { }, 'btn-primary', true); S.coins -= 60; S.freezes++; SFX.coin(); save(); render(); });
  on('hints', () => { if (S.coins < 45) return modal('אין מספיק מטבעות', `חסרים ${45 - S.coins} מטבעות.`, 'הבנתי', () => { }, 'btn-primary', true); S.coins -= 45; S.hints += 3; SFX.coin(); save(); render(); });
  on('sound', () => { S.sound = !S.sound; save(); render(); if (S.sound) SFX.ok(); });
  on('spgo', spStart); on('kpgo', kpStart);
  bindExtra(); bindSandbox(); bindUpdate(); bindCloud(); bindNav();
  app.querySelectorAll('[data-share]').forEach(b => b.onclick = () => shareCard(b.dataset.share));
  const ex = document.getElementById('exam'); if (ex) ex.onchange = () => { if (ex.value) { S.exam = ex.value; save(); } };
}
function bindNav() {
  app.querySelectorAll('[data-ptab]').forEach(b => b.onclick = () => { S.ptab = b.dataset.ptab; SFX.tap(); save(); render(); });
  const sk = app.querySelector('[data-act="skipbonus"]'); if (sk) sk.onclick = () => { S.bonusDay = todayStr(); save(); render(); };
  const es = app.querySelector('[data-act="extsave"]'); if (es) es.onclick = () => { const v = parseInt(document.getElementById('extscore').value); if (!(v >= 0 && v <= 100)) return toast('ציון בין 0 ל-100'); S.ext = (S.ext || []).concat({ d: todayStr(), v }); S.extLast = todayStr(); if (v >= 85) giveDia(1, 'מבחן חיצוני 85+', []); SFX.coin(); save(); render(); toast(v >= 85 ? 'נשמר. +1 יהלום!' : 'נשמר'); };
  bindV11();
  const ek = app.querySelector('[data-act="extskip"]'); if (ek) ek.onclick = () => { S.extSkip = todayStr(); save(); render(); };
}
/* buttons added by the feature modules (one place, called from bind) */
function bindV11() {
  const on = (a, fn) => { const e = app.querySelector(`[data-act="${a}"]`); if (e) e.onclick = fn; };
  on('sharefriend', shareFriend);
  on('dadsave', () => { const v = (document.getElementById('dadmsgs').value || '').split('\n').map(s => s.trim().replace(/[<>]/g, '')).filter(Boolean).slice(0, 30); S.dadMsgs = v; S.loveI = 0; save(); toast('נשמר'); });
  const o = app.querySelector('[data-opensong]'); if (o) o.onclick = () => { S.songId = o.dataset.opensong; S.view = 'songs'; save(); render(); window.scrollTo(0, 0); };
  bindProfiles();
  app.querySelectorAll('[data-act="diasheet"]').forEach(b => b.onclick = openDiaSheet);
  app.querySelectorAll('[data-mood]').forEach(b => b.onclick = () => setMood(b.dataset.mood));
  on('explained', () => { if (!S.explainQ || S.explainQ.done) return; S.explainQ.done = 1; S.coins += 10; S.explainLog = (S.explainLog || []).concat(todayStr()).slice(-30); SFX.coin(); save(); render(); });
  on('duo', startDuo);
  on('duoskip', () => { S.duoSkip = todayStr(); save(); render(); });
  app.querySelectorAll('[data-guidetab]').forEach(b => b.onclick = () => startGuide(b.dataset.guidetab, 'tips'));
  app.querySelectorAll('[data-accb]').forEach(b => b.onclick = () => { const it = ACC.find(a => a[0] === b.dataset.accb); if (!it || S.coins < it[2]) return; modal(`לקנות ${it[1]}?`, `זה יעלה ${it[2]} מטבעות.`, 'לקנות', () => { S.coins -= it[2]; S.accOwn = Object.assign({}, S.accOwn, { [it[0]]: 1 }); S.accOn = Object.assign({}, S.accOn, { [it[0]]: 1 }); SFX.coin(); save(); render(); }, 'btn-gold'); });
  app.querySelectorAll('[data-accw]').forEach(b => b.onclick = () => { const k = b.dataset.accw; S.accOn = Object.assign({}, S.accOn, { [k]: !(S.accOn || {})[k] }); SFX.tap(); save(); render(); });
  const ex = app.querySelector('[data-act="exch"]'); if (ex) ex.onclick = () => { if (S.exWeek === weekKey() || S.coins < EX_PRICE || S.noEx) return; modal('להמיר מטבעות ליהלום?', `${EX_PRICE} מטבעות יהפכו ליהלום אחד. אפשר פעם בשבוע.`, 'להמיר', () => { S.coins -= EX_PRICE; S.exWeek = weekKey(); giveDia(1, 'המרה שבועית', []); SFX.coin(); save(); render(); toast('קיבלת יהלום!'); }, 'btn-gold'); };
  on('extoggle', () => { S.noEx = !S.noEx; save(); render(); });
  app.querySelectorAll('[data-road]').forEach(b => b.onclick = () => { S.ptab = 'me'; go('stats'); });
  bindBugs();
  on('xtra', startXtra);
  on('xtraskip', () => { S.xtraSkip = todayStr(); save(); render(); });
}

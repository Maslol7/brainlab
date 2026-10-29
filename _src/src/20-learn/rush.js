function minSecs(q) {
  const len = strip(q.prompt).length + strip(q.vis).length + (q.options ? q.options.map(strip).join('').length * .5 : 0) + (q.items ? q.items.map(strip).join('').length : 0);
  return Math.max(3.5, Math.min(15, 2.5 + len / 45));
}
/* rush log: last 30 counted answers, 1 = faster than a reasonable reading time */
function logRush(v) { if (S.cur && deferred(S.cur.kind)) return; S.rh = (S.rh || []).concat(v ? 1 : 0).slice(-30); }
const rushRate = (o = S) => { const a = o.rh || []; return a.length >= 8 ? a.reduce((x, y) => x + y, 0) / a.length : 0; };
const thinkOn = c => !deferred(c.kind) && !c.duo && (c.think || rushRate() > .2);
/* ---------- nudge on a too-fast first tap ---------- */
const NUDGE = ['רגע. ענית תוך {s} שניות. קרא את השאלה עד הסוף, ואז תבחר.', 'עצור רגע. מה בדיוק שואלים? קרא שוב ותענה.', 'לאט. במבחן יש דקה לשאלה. תשתמש בזמן.'];
function showNudge(secs) {
  const c = S.cur; c.nudges = (c.nudges || 0) + 1; if (c.nudges >= 2) c.think = true;
  document.querySelector('.nudge')?.remove();
  const box = app.querySelector('.opts, .typed, .ord'); if (!box) return;
  box.insertAdjacentHTML('beforebegin', `<div class="nudge"><svg viewBox="0 0 24 24" width="22" height="22" fill="#8CC8FF"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg><span>${pick(NUDGE).replace('{s} שניות', Math.round(secs) <= 1 ? 'שנייה' : Math.round(secs) + ' שניות')}</span></div>`);
  SFX.soft(); app.querySelector('.qprompt')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
/* ---------- think mode: options open after a short reading time ---------- */
let THINK_T = null;
/* Think mode: the options stay closed for a few seconds, so he reads and solves in his head first.
   "I have the answer in my head" opens them early and is checked against his choice. */
function thinkLock(c, q) {
  if (!thinkOn(c)) return;
  const delay = Math.min(8, Math.round(minSecs(q) * .7)), left = delay - (Date.now() - c.qStart) / 1000;
  if (left <= .3) return;
  const box = app.querySelector('.opts, .typed, .ord'); if (!box) return;
  const open = () => { box.classList.remove('think'); box.querySelectorAll('button').forEach(b => { if (!b.classList.contains('gone')) b.disabled = false; }); app.querySelector('.thinkbar')?.remove(); };
  box.classList.add('think'); box.querySelectorAll('button').forEach(b => b.disabled = true);
  box.insertAdjacentHTML('beforebegin', `<div class="thinkbar"><i style="animation-duration:${left}s"></i><span>מצב חשיבה: קרא, ונסה לפתור בראש. התשובות נפתחות עוד רגע.</span><button class="chip commit" data-commit>יש לי תשובה בראש</button></div>`);
  app.querySelector('[data-commit]').onclick = () => { c.commit = c.i; clearTimeout(THINK_T); open(); SFX.tap(); };
  THINK_T = setTimeout(() => { if (S.cur === c) open(); }, left * 1000);
}

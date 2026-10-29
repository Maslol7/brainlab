/* ---------- 1. check-in: the kid says how it was, the app adapts ---------- */
const MOODS = [['easy', 'קל לי מדי'], ['hard', 'קשה לי'], ['rush', 'רציתי לסיים מהר'], ['good', 'היה טוב']];
const MOOD_REPLY = { easy: 'סבבה. מהמשימה הבאה השאלות יהיו קשות יותר.', hard: 'בסדר גמור. הורדתי קצת את הרמה, וקיבלת 2 רמזים חינם.', rush: 'מבין. אפשר תמיד לעצור באמצע ולהמשיך אחר כך, המשימה נשמרת. בפעם הבאה נעשה את זה בנחת.', good: 'מעולה! ככה ממשיכים.' };
function wantCheckin(L0) {
  if (!['daily', 'review', 'boss'].includes(L0.kind) || S.moodDay === todayStr()) return false;
  const acc = L0.n ? L0.correct / L0.n : 1;
  return acc < .6 || (L0.rushN || 0) >= 3 || doneCount(S) % 5 === 0;
}
function checkinCard(L0) {
  if (L0.moodDone) return `<section class="card checkin"><b>${MOOD_REPLY[L0.moodDone]}</b></section>`;
  return `<section class="card checkin"><b>איך היה הפעם?</b><div class="chips" style="margin-top:8px">${MOODS.map(([k, t]) => `<button class="chip" data-mood="${k}">${t}</button>`).join('')}</div></section>`;
}
function setMood(k) {
  const L0 = S.last; if (!L0) return;
  S.moodDay = todayStr(); L0.moodDone = k;
  S.moods = (S.moods || []).concat({ d: todayStr(), m: k, acc: L0.n ? Math.round(L0.correct / L0.n * 100) : null }).slice(-20);
  if (k === 'easy') Object.keys(CATS).forEach(c => S.rat[c] = Math.min(4.4, (S.rat[c] ?? 1) + .35));
  if (k === 'hard') { Object.keys(CATS).forEach(c => S.rat[c] = Math.max(1, (S.rat[c] ?? 1) - .3)); S.hints = (S.hints || 0) + 2; }
  if (k === 'rush') S.calmNext = 1;
  SFX.tap(); save(); render();
}
/* ---------- 4. explain-to-dad question of the day ---------- */
function pickExplain(c) {
  let best = null;
  c.qs.forEach((q, i) => { const r = c.res[i]; if (r && r.ok && !r.second && !r.rush && !q.champ && (!best || q.d > best.q.d)) best = { q, r }; });
  if (!best) return null;
  const q = best.q, a = q.type === 'order' ? q.correct.map(ix => strip(q.items[ix])).join(' ← ') : q.type === 'num' ? fmt(q.ansv) + (q.unit || '') : strip(q.options[q.answer]);
  return { d: todayStr(), p: q.prompt, v: q.vis || '', a, ex: q.ex, done: 0 };
}
function explainCard() {
  const e = S.explainQ; if (!e || e.d !== todayStr() || S.guest) return '';
  return e.done ? `<section class="card explain"><b>הסברת לאבא. כל הכבוד!</b></section>`
    : `<section class="card explain"><div class="eyebrow">אתגר הערב</div><b>תסביר לאבא איך פתרת את השאלה הזאת:</b><p class="small" style="margin:6px 0 10px">${strip(e.p).slice(0, 140)}</p><button class="btn btn-primary btn-wide" data-act="explained">הסברתי לאבא (+10 מטבעות)</button></section>`;
}
function parentExplainCard(o = S) {
  const e = o.explainQ; if (!e || dayDiff(e.d, todayStr()) > 1) return '';
  return `<section class="card stack" style="gap:8px" data-nog><h4 style="font-size:1.1rem">שאלה ש${ME.name} ${PROF.g === 'f' ? 'פתרה' : 'פתר'} ${e.d === todayStr() ? 'היום' : 'אתמול'}</h4><p class="small muted" style="margin:0">${PROF.g === 'f' ? 'בקש ממנה להסביר לך איך פתרה' : 'בקש ממנו להסביר לך איך פתר'}. כדי שתוכל לעקוב, הנה גם הפתרון.</p><p style="margin:0">${e.p}</p>${e.v ? `<div class="qvis">${e.v}</div>` : ''}<div class="small">התשובה: <b>${e.a}</b></div><details class="small"><summary class="muted">ההסבר</summary><p style="margin:6px 0 0">${e.ex}</p></details>${e.done ? `<div class="small" style="color:var(--good)">${PROF.g === 'f' ? 'היא סימנה שהסבירה לך.' : 'הוא סימן שהסביר לך.'}</div>` : ''}</section>`;
}
function startDuo() {
  const order = Object.keys(CHAPNAME), pickCats = shuffle(['analog', 'series', 'logic', 'math', 'matrix', 'verbal']).slice(0, 3);
  startMission('practice', nextDay() || TOTAL, 'logic');
  const c = S.cur; c.duo = 1; c.intro = false; c.think = false;
  c.qs = pickCats.map(k => mkQ(k, Math.min(4, Math.round(S.rat[k] ?? 1) + 1), 0));
  c.qStart = Date.now(); save(); renderQuiz();
}

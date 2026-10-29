/* ---------- teaching what we did not teach well enough ----------
   A wrong answer given too fast (a guess) or after a long time stuck is a sign that this KIND of question
   was not taught well enough. We keep the last results per question type (lesson key):
     o = right on the first try, x = wrong, g = guessed (too fast and wrong), s = stuck (over 2 minutes and wrong).
   Two g/s in the last five, or one success or less in four tries, puts the type on the "to learn" list.
   The lesson: why we stop (not his fault), the rule, a worked example or the step-by-step guide,
   then three questions where the help fades: hint shown, hint free, no hint. Two of three right = learned. */
const STUCK_SECS = 120;
const lkName = key => (LESSONS[key] || [key])[0];
function lkStat(key) { const M = S.lk || (S.lk = {}); return M[key] || (M[key] = { r: '', cat: null, learned: null }); }
function lkNeeds(st) { const w = st.r.slice(-5); return (w.match(/[gs]/g) || []).length >= 2 || (w.length >= 4 && (w.match(/o/g) || []).length <= 1); }
function noteStruggle(q, r, secs, rushed, c) {
  if (deferred(c.kind) || q.champ || q.demo || c.kind === 'lesson' || S.guest) return null;
  const key = lessonFor(q), st = lkStat(key);
  st.cat = q.cat;
  st.r = (st.r + (r.ok && !r.second ? 'o' : rushed ? 'g' : secs > STUCK_SECS ? 's' : 'x')).slice(-8);
  const Q = S.learnQ || (S.learnQ = []);
  if (r.ok && !r.second) return null;
  if (!lkNeeds(st) || Q.some(x => x.key === key)) return null;
  Q.push({ key, at: todayStr(), why: st.r.slice(-5) }); if (Q.length > 4) Q.shift();
  return key;
}
const dueLearn = () => (S.learnQ || []).filter(x => x.at <= todayStr());
function learnNote(key) {
  return `<div class="learnnote">${IC.book}<span>זה סימן שעוד לא לימדנו אותך <b>${lkName(key)}</b> מספיק טוב. בסוף המשימה מחכה לך שיעור קצר על זה.</span></div>`;
}
function learnCard(where) {
  const L0 = dueLearn()[0]; if (!L0) return '';
  const g = L0.why || '', guess = (g.match(/g/g) || []).length, stuck = (g.match(/s/g) || []).length;
  const why = guess >= stuck ? 'היו כמה תשובות מהירות מדי, כמו ניחוש' : 'היו שאלות שנתקעת בהן הרבה זמן';
  return `<section class="card learncard"><div class="eyebrow">שיעור קצר · 3 דקות</div><h3>${lkName(L0.key)}</h3><p class="small">${why}. זה לא בגללך: זה סימן שעוד לא לימדנו אותך את הדרך. בוא נלמד אותה, ואז 3 שאלות לתרגול.</p><button class="btn btn-primary btn-wide" data-learn="${L0.key}">ללמוד עכשיו</button>${where === 'home' ? '<button class="btn btn-ghost btn-wide" data-act="learnlater" style="margin-top:8px;min-height:42px">מחר</button>' : ''}</section>`;
}
/* a fresh question of this type: the type's own category generator until the lesson key matches */
function genByKey(key, d) {
  const cat = lkStat(key).cat || 'logic', g = GEN[cat]; if (!g) return null;
  const snap = JSON.stringify(SEEN); let out = null;
  for (let k = 0; k < 150 && !out; k++) { let t; try { t = g(LEVEL4.has(cat) ? d : Math.min(d, 3)); } catch (e) { continue; } if (t && lessonFor(t) === key) out = t; }
  const back = JSON.parse(snap); Object.keys(SEEN).forEach(k => delete SEEN[k]); Object.assign(SEEN, back);
  if (out) { out.cat = out.cat || cat; out.lk = out.lk || key; }
  return out;
}
function startLesson(key) {
  if (S.cur) return modal('יש משימה פתוחה', 'קודם סיים את המשימה שהתחלת, או צא ממנה.', 'להמשיך במשימה', () => go('quiz'));
  ac();
  const cat = lkStat(key).cat, d = Math.max(1, Math.round(S.rat[cat] ?? 2)), guide = !!GSTEPS[key];
  const qs = [], add = (dd, extra) => { const q = genByKey(key, dd); if (q) { Object.assign(q, extra, { d: dd }); qs.push(q); } };
  if (!guide) add(Math.max(1, d - 1), { demo: 1 });
  add(Math.max(1, d - 1), { scaffold: 1 }); add(d, { freehint: 1 }); add(d, {});
  if (qs.filter(q => !q.demo).length < 2) { S.learnQ = (S.learnQ || []).filter(x => x.key !== key); save(); return toast('לא מצאתי שאלות לשיעור הזה'); }
  const res = [];
  if (qs[0].demo) res[0] = { sel: qs[0].type === 'num' || qs[0].type === 'order' ? -1 : qs[0].answer, val: qs[0].type === 'order' ? qs[0].correct : qs[0].type === 'num' ? String(qs[0].ansv) : undefined, ok: true, gain: 0, secs: 0, demo: 1 };
  S.cur = { kind: 'lesson', lkey: key, guide, day: nextDay() || TOTAL, cat, qs, i: 0, res, pts: 0, combo: 0, hint: false, qStart: Date.now(), deadline: null, hp: 5, mod: null, size: null, path: false, intro: true, chapters: null, ch: 0, chDeadline: null, chBreak: false, tin: '' };
  go('quiz');
}
/* called by finish() for a lesson */
function lessonDone(c) {
  const real = c.qs.map((q, i) => [q, c.res[i]]).filter(([q]) => !q.demo), ok = real.filter(([, r]) => r && r.ok && !r.second).length, pass = ok >= Math.min(2, real.length);
  const st = lkStat(c.lkey);
  if (pass) { st.learned = todayStr(); st.r = ''; S.learnQ = (S.learnQ || []).filter(x => x.key !== c.lkey); S.coins += 20; }
  else (S.learnQ || []).forEach(x => { if (x.key === c.lkey) x.at = addDays(todayStr(), 1); });
  return { key: c.lkey, pass, ok, n: real.length };
}
/* parent report: what is still to learn, what was learned in a lesson */
function masteryLine(o) {
  const M = o.lk || {}, todo = (Array.isArray(o.learnQ) ? o.learnQ : Object.values(o.learnQ || {})).map(x => lkName(x.key));
  const done = Object.keys(M).filter(k => M[k] && M[k].learned).map(lkName);
  if (!todo.length && !done.length) return '';
  return `<div class="small">${todo.length ? `סוגי שאלות שעוד לא לימדנו אותו מספיק טוב: <b>${todo.join(', ')}</b>` : ''}${todo.length && done.length ? ' · ' : ''}${done.length ? `למד בשיעור: ${done.join(', ')}` : ''}</div>`;
}

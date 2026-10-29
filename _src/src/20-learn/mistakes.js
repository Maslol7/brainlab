/* Mistakes notebook. A wrong question comes back after 1 day as an easier twin, then as itself.
   noNew: a rushed first answer does not create a new notebook entry. */
function noteMist(q, ok, c, first, noNew) {
  const today = todayStr();
  if (q.rev) {
    const m = S.mist.find(x => x.id === q.rev);
    if (m && first) {
      if (ok) {
        if (q.twin) { m.box = 1; m.due = addDays(today, 2); }
        else {
          S.mist = S.mist.filter(x => x !== m); S.fixed = (S.fixed || 0) + 1;
          if (S.fixedToday !== today) { S.fixedToday = today; S.fixedN = 0; } S.fixedN++;
        }
      } else { m.box = 0; m.due = addDays(today, 1); }
    }
  } else if (c.kind !== 'sim' && !q.champ && !(noNew && !ok)) {
    const id = mistId(q);
    if (!first) { const m = S.mist.find(x => x.id === id); if (m && ok) { m.box = 1; m.due = addDays(today, 3); } }
    else if (!ok && !S.mist.some(x => x.id === id)) { const qq = Object.assign({}, q); delete qq.rev; delete qq.twin; S.mist.push({ id, q: qq, due: addDays(today, 1), box: 0 }); if (S.mist.length > 50) S.mist.shift(); }
  }
  trimMist();
}
function makeTwin(q) {
  const key = lessonFor(q), d = Math.max(1, (q.d || 2) - 1), g = GEN[q.cat];
  if (!g) return null;
  const snap = JSON.stringify(SEEN);
  let out = null;
  for (let k = 0; k < 80 && !out; k++) {
    let t; try { t = g(LEVEL4.has(q.cat) ? d : Math.min(d, 3)); } catch (e) { continue; }
    if (!t) continue; t.cat = t.cat || q.cat;
    if (lessonFor(t) === key && (t.prompt + t.vis + (t.options || t.items || []).join('')) !== (q.prompt + q.vis + (q.options || q.items || []).join(''))) { t.d = d; out = t; }
  }
  const back = JSON.parse(snap); Object.keys(SEEN).forEach(k => delete SEEN[k]); Object.assign(SEEN, back);
  return out;
}
function mistQ(m) {
  if (!m.box) { const t = makeTwin(m.q); if (t) return Object.assign(t, { rev: m.id, twin: true }); }
  return Object.assign({}, m.q, { rev: m.id });
}
/* the question's own hint: 1 = before an answer, 2 = after a first wrong try (stronger) */
function hintText(q, n) { if (q.hint && q.hint[n - 1]) return q.hint[n - 1]; return n === 1 ? CATS[q.cat].tip : (LESSONS[lessonFor(q)] || LESSONS.logic)[1]; }
function retryBox(q, t) {
  const what = q.type === 'num' ? ` ${L(esc(t.val))} לא נכון.` : q.type === 'order' ? ' הסדר עוד לא נכון.' : '';
  return `<div class="retry"><span class="hi">${IC.bulb}</span><div><b>כמעט.</b>${what} נסה שוב.${S.cur.mod === 'nohint' ? '' : `<span class="rh">${hintText(q, 2)}</span>`}</div></div>`;
}
function mnote(q, r, c) {
  if (q.champ || c.kind === 'sim') return '';
  let t = '';
  if (q.rev) t = r.ok && !r.second ? (q.twin ? 'צעד אחד לפני שהיא יוצאת מהמחברת.' : 'יצאה מהמחברת. שלטת בזה!') : 'נשארת במחברת. תחזור מחר בגרסה קלה, עם הכלל.';
  else if (r.second) t = 'נכנסה למחברת. תחזור בעוד כמה ימים, לוודא שזה נשאר.';
  else if (!r.ok) t = 'נכנסה למחברת. תחזור מחר בגרסה קלה יותר, עם הכלל.';
  return t ? `<p class="mnote">${t}</p>` : '';
}
/* id of a question: a hash of its full content (two different questions must not share an id) */
function mistId(q) { const s = q.cat + q.prompt + q.vis + (q.options ? q.options.join('|') : q.items ? q.items.join('|') : '') + q.ansv; let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return 'm' + h; }
/* rushed misses do not flood the notebook; notebook keeps at most 12 */
const MIST_MAX = 12;
function trimMist() {
  if (!S.mist || S.mist.length <= MIST_MAX) return;
  const keep = S.mist.filter(m => m.box >= 1).slice(-MIST_MAX);
  const rest = S.mist.filter(m => !(m.box >= 1)).slice(-(MIST_MAX - keep.length));
  const set = new Set([...keep, ...rest]); S.mist = S.mist.filter(m => set.has(m));
}

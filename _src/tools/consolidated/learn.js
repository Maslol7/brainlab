/* adaptive level per category; a rushed answer is not rated (the caller skips it) */
function rateQ(q, ok, secs, c) {
  const rr = S.rat[q.cat] ?? baseDiff(c.day || nextDay() || TOTAL);
  S.rat[q.cat] = Math.max(1, Math.min(4.4, rr + (ok ? (q.d >= Math.round(rr) ? .14 : .06) : -.15)));
  const t = S.times[q.cat] || (S.times[q.cat] = { s: 0, n: 0 }); t.s += Math.min(secs, 300); t.n++;
  if (q.d >= 3) { const hk = CHAPKEY[q.cat]; if (hk) { S.hard = S.hard || {}; const h = S.hard[hk] || (S.hard[hk] = { c: 0, t: 0 }); h.t++; if (ok) h.c++; } }
}
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
/* a worked example for a guided lesson */
function guideExample(key) {
  const f = {
    matrix: () => genMatrix(1), dial: () => genShapeSeries(1), figan: () => genFigAn(1),
    op: () => genOp(1), symbols: () => genSym(1), calendar: () => genCal(1), seating: () => genSeating(2), order: () => genOrder(1),
    syll: () => genSyll(1), groups: () => genGroups(1), magic: () => genMagic(1),
  }[key];
  if (f) return f();
  if (key === 'ifthen') { const it = LG.find(x => /^אם יורד/.test(x.q) && /לא לקח/.test(x.q)) || LG[0]; const m = mc(it.o); return { cat: 'logic', d: 1, prompt: it.q, vis: '', options: m.options, answer: m.answer, ex: it.ex }; }
  for (let k = 0; k < 60; k++) { const q = GEN.spatial(1); if (lessonFor(q) === key) return q; }
  return GEN.spatial(1);
}

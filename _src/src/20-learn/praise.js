/* ---------- praise for real improvement ---------- */
function praiseFor(q, ok, secs, c, r0) {
  if (!ok || deferred(c.kind)) return '';
  const nm2 = CATS[q.cat].n, out = [];
  const r1 = S.rat[q.cat];
  if (r0 != null && Math.floor(r1) > Math.floor(r0) && Math.floor(r1) >= 2) out.push(`עלית לרמה ${Math.floor(r1)} ב${nm2}!`);
  S.firstD = S.firstD || (doneCount(S) >= 3 ? Object.fromEntries(Object.keys(CATS).map(k => [k + 3, 1])) : {});
  if (q.d >= 3 && !S.firstD[q.cat + q.d]) { S.firstD[q.cat + q.d] = 1; out.push(`פעם ראשונה שפתרת ${nm2} ברמה ${q.d}!`); }
  S.pb = S.pb || {};
  const key = q.cat + (q.d >= 3 ? 'h' : ''), pb = S.pb[key];
  if (secs >= 3) {
    if (!pb) S.pb[key] = { best: secs, n: 1 };
    else { pb.n++; if (secs < pb.best - 1) { if (pb.n >= 4) out.push(`שיא מהירות ב${nm2}${q.d >= 3 ? ' (רמה גבוהה)' : ''}: ${Math.round(secs)} שניות. השיא הקודם: ${Math.round(pb.best)}.`); pb.best = secs; } }
  }
  if (!out.length) { const t = S.times[q.cat]; if (t && t.n >= 8 && secs >= 4 && secs < (t.s / t.n) * .6) out.push(`מהיר בהרבה מהממוצע שלך ב${nm2} (${Math.round(t.s / t.n)} שנ׳).`); }
  if (!out.length) return '';
  const lvl = /רמה|פעם ראשונה/.test(out[0]);
  if (!lvl && c.lastPraise != null && c.i - c.lastPraise < 3) return '';
  c.lastPraise = c.i; c.praises = (c.praises || 0) + 1;
  return out[0];
}
function improveNotes(c, correct, n) {
  if (!['daily', 'boss', 'sim'].includes(c.kind) || !n) return [];
  const rs = c.qs.map((q, i) => c.res[i]).filter(Boolean);
  const acc = correct / n, sp = rs.length ? rs.reduce((a, r) => a + Math.min(r.secs, 300), 0) / rs.length : 0;
  const H = S.mh = S.mh || [], out = [];
  if (H.length >= 3) {
    const aA = H.reduce((a, h) => a + h.acc, 0) / H.length, aS = H.reduce((a, h) => a + h.sp, 0) / H.length, best = Math.max(...H.map(h => h.acc));
    if (acc > best && acc >= .8) out.push(`הדיוק הכי גבוה שלך עד היום: ${Math.round(acc * 100)}%.`);
    else if (acc >= aA + .1) out.push(`דיוק ${Math.round(acc * 100)}%, לעומת ${Math.round(aA * 100)}% בממוצע שלך.`);
    if (sp && sp <= aS * .85 && acc >= aA - .05) out.push(`מהר יותר: ${Math.round(sp)} שניות לשאלה, לעומת ${Math.round(aS)} בממוצע. בלי לאבד דיוק.`);
  }
  if ((c.praises || 0) >= 2) out.push(`${c.praises} שיאים אישיים במשימה אחת.`);
  if (S.fixedToday === todayStr() && (S.fixedN || 0) >= 2) out.push(`${S.fixedN} שאלות יצאו היום מהמחברת. ככה בונים שליטה.`);
  H.push({ acc, sp }); if (H.length > 10) H.shift();
  return out.slice(0, 2);
}
const impHTML = L0 => `${(L0.imp || []).length ? `<section class="card imp"><div class="eyebrow">השתפרת</div>${L0.imp.map(t => `<div class="row">${IC.bolt}<span>${t}</span></div>`).join('')}</section>` : ''}${dadHTML(L0.love)}`;

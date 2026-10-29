/* adaptive level per category; a rushed answer is not rated (the caller skips it) */
function rateQ(q, ok, secs, c) {
  const rr = S.rat[q.cat] ?? baseDiff(c.day || nextDay() || TOTAL);
  S.rat[q.cat] = Math.max(1, Math.min(4.4, rr + (ok ? (q.d >= Math.round(rr) ? .14 : .06) : -.15)));
  const t = S.times[q.cat] || (S.times[q.cat] = { s: 0, n: 0 }); t.s += Math.min(secs, 300); t.n++;
  if (q.d >= 3) { const hk = CHAPKEY[q.cat]; if (hk) { S.hard = S.hard || {}; const h = S.hard[hk] || (S.hard[hk] = { c: 0, t: 0 }); h.t++; if (ok) h.c++; } }
}

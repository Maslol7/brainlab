/* shared helpers for all question generators */
let SEEN = {};
function numCands(ans, cands, n = 4) {
  const out = [ans];
  for (const c of cands) { if (out.length >= n) break; if (Number.isFinite(c) && c >= 0 && !out.some(o => Math.abs(o - c) < 1e-9)) out.push(c); }
  let t = 0;
  while (out.length < n && t++ < 200) { const s = Math.max(2, Math.round(Math.abs(ans) * 0.15)); const c = ans + ri(1, s) * (R() < .5 ? -1 : 1); if (c >= 0 && !out.includes(c)) out.push(c); }
  return out;
}
const UNIT1 = { ' שעות': ' שעה', ' ימים': ' יום', ' דקות': ' דקה', ' שניות': ' שנייה', ' פעימות': ' פעימה', ' שנ׳': ' שנ׳' };
const unitFor = (v, unit) => v === 1 && UNIT1[unit] ? UNIT1[unit] : unit;
const numQ = (cat, d, prompt, vis, ans, cands, ex, unit = '') => {
  const m = mc(numCands(ans, cands).map(v => L(fmt(v)) + unitFor(v, unit)));
  return { cat, d, prompt, vis, options: m.options, answer: m.answer, ex, ansv: ans, unit };
};
function pickBank(bank, key, d) {
  if (!SEEN[key]) SEEN[key] = [];
  const all = bank.map((it, i) => ({ it, i })).filter(o => o.it.d <= d);
  let pool = all.filter(o => !SEEN[key].includes(o.i));
  if (!pool.length) { SEEN[key] = SEEN[key].filter(i => bank[i].d > d); pool = all; }
  const pref = pool.filter(o => o.it.d === d);
  const o = (pref.length && R() < .7) ? pick(pref) : pick(pool);
  SEEN[key].push(o.i);
  LAST_PICK = { key, it: o.it };
  return o.it;
}
const PEOPLE = [['יונתן', 'm'], ['נועה', 'f'], ['אורי', 'm'], ['מאיה', 'f'], ['דניאל', 'm'], ['תמר', 'f'], ['איתי', 'm'], ['שירה', 'f'], ['עידו', 'm'], ['רוני', 'f']];
const g = (p, m, f) => p[1] === 'm' ? m : f;
/* ---------- hints ----------
   Every question carries two hints of its own: q.hint = [before an answer, after a first wrong try].
   Generators set them with withHint(); bank questions get theirs from BANK_HINTS (hints-bank.js). */
const withHint = (q, h1, h2) => { if (q) q.hint = [h1, h2]; return q; };
let LAST_PICK = null;
const BANK_KEY = { an: it => `${it.a}|${it.b}|${it.c}`, od: it => it.o.join('|'), hom: it => it.a, sc: it => it.s, sc2: it => it.s, ns: it => it.s, os: it => it.s[0], rd: it => it.q, lg: it => it.q, fam: it => it.q };
function bankHint(q, bank, it) { const k = BANK_KEY[bank], h = k && BANK_HINTS[bank + '|' + k(it)]; if (q && h) q.hint = h.slice(); return q; }
/* wraps a category generator: a question built from a bank item gets that item's hints */
const hinted = gen => d => { LAST_PICK = null; const q = gen(d); if (q && !q.hint && LAST_PICK) bankHint(q, LAST_PICK.key, LAST_PICK.it); return q; };

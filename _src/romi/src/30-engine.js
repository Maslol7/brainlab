/* ---------- the practice engine: each word climbs 7 steps, wrong answers step down, learned words come back after 1, 2, 4, 7 days ----------
   steps: 0 meet the word · 1 meaning (choose) · 2 spelling (choose) · 3 build from letters · 4 hear English, type · 5 hear Hebrew, type English · 6 write the Hebrew meaning
   bonus lists stop at 6 (no Hebrew writing). */
const STEP_NAMES = ['חדשה', 'פירוש', 'זיהוי', 'הרכבה', 'הכתבה', 'מעברית', 'פירוש בכתב', 'כוכב'];
const maxSt = l => l && l.kind === 'exam' ? 4 : l && l.he ? 7 : 6;
function prog(w) { const k = kOf(w); return S.p[k] || (S.p[k] = { st: 0, r: 0, ok: 0, bad: 0, wr: [] }); }
const stageOf = w => (S.p[kOf(w)] || {}).st || 0;
const mastered = (w, l) => stageOf(w) >= maxSt(l);
const pctOf = (w, l) => Math.min(100, Math.round(stageOf(w) / maxSt(l) * 100));
const isDue = w => { const q = S.p[kOf(w)]; return !!(q && q.due && q.due <= todayStr()); };
function listPct(l) { if (!l || !l.words.length) return 0; return Math.round(l.words.reduce((a, w) => a + pctOf(w, l), 0) / l.words.length); }
const listStars = l => l.words.filter(w => mastered(w, l)).length;
/* which words go into today's session */
function planSession(list) {
  if (list.id === 'review') return reviewPlan(list);
  const t = todayStr(), ws = list.words.slice(), left = list.date ? dayDiff(t, list.date) : 99;
  const un = ws.filter(w => !mastered(w, list)).sort((a, b) => stageOf(b) - stageOf(a));
  const started = un.filter(w => stageOf(w) > 0), news = shuffle(un.filter(w => stageOf(w) === 0));
  const rev = shuffle(ws.filter(w => mastered(w, list) && (isDue(w) || left <= 1)));
  const cap = list.kind === 'exam' ? 9 : 5;  /* a test list is long and asks only to recognise: more words at once */
  let q = [...shuffle(started), ...news.slice(0, Math.max(2, cap - started.length))];
  q = q.concat(q.length < 3 ? rev : rev.slice(0, 3));
  if (!q.length) q = shuffle(ws).slice(0, Math.min(6, ws.length));
  const n = list.kind === 'exam' ? 18 : left <= 1 ? 16 : 14;
  return { q, n };
}
function itemType(w, list) {
  const st = stageOf(w), M = maxSt(list);
  if (st >= M) return pick(list.kind === 'exam' ? ['meanEN', 'meanHE', 'pick'] : list.he ? ['typeEN', 'typeHE2EN', 'writeHE'] : ['typeEN', 'typeHE2EN']);
  return ['learn', R() < .5 ? 'meanEN' : 'meanHE', 'pick', 'tiles', 'typeEN', 'typeHE2EN', 'writeHE'][st];
}
/* record a result. ok = right on the first try */
function grade(w, list, type, ok, attempt) {
  const q = prog(w), M = maxSt(list), t = todayStr(); q.last = t;
  if (type === 'learn') { q.st = Math.max(q.st, 1); return 'up'; }
  const wasM = q.st >= M;
  if (ok) {
    q.ok++;
    if (wasM) { q.r = (q.r || 0) + 1; q.due = addDays(t, [1, 2, 4, 7, 14][Math.min(4, q.r - 1)]); return 'keep'; }
    q.st++; if (q.st >= M) { q.r = 0; q.due = addDays(t, 1); q.mt = t; return 'star'; }
    return 'up';
  }
  q.bad++; if (attempt) { q.wr.unshift(attempt); q.wr = q.wr.slice(0, 4); }
  if (wasM) { q.st = M - 2; q.r = 0; q.due = null; } else q.st = Math.max(1, q.st - 1);
  return 'down';
}
/* ---------- checking answers ---------- */
const normEn = s => String(s || '').toLowerCase().replace(/[^a-z' ]/g, '').replace(/\s+/g, ' ').trim();
const FIN = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const normHe = s => String(s || '').replace(/[֑-ׇ]/g, '').replace(/[^א-ת ]/g, '').replace(/[ךםןףץ]/g, c => FIN[c]).replace(/יי/g, 'י').replace(/וו/g, 'ו').replace(/\s+/g, ' ').trim();
const checkEn = (w, typed) => normEn(typed) === normEn(w.en);
const checkHe = (w, typed) => { const t = normHe(typed); return !!t && w.he.some(h => normHe(h) === t); };
const finalNote = typed => String(typed || '').trim().split(/\s+/).some(x => /[כמנפצ]$/.test(x)) ? 'שימי לב: בסוף מילה כותבים אות סופית (ך ם ן ף ץ).' : '';
/* ---------- wrong spellings that look real: the mistakes kids make ---------- */
/* ordered: the most likely mistakes first */
const MIS_RULES = [[/eigh/, 'ay'], [/eigh/, 'ei'], [/gh/, ''], [/ain$/, 'in'], [/ou/, 'ow'], [/ou/, 'au'], [/ow$/, 'o'], [/ow$/, 'oe'], [/ower/, 'awer'], [/ow/, 'ou'], [/oa/, 'o'], [/oa/, 'ow'], [/oa/, 'oe'], [/ee/, 'ea'], [/ee/, 'i'], [/ea/, 'ee'], [/ai/, 'a'], [/ai/, 'ay'], [/a([^aeiou])e$/, 'ai$1'], [/a([^aeiou])e$/, 'a$1'], [/ss$/, 's'], [/ss$/, 'z'], [/or$/, 'er'], [/er$/, 'a'], [/er$/, 'or'], [/^be/, 'bi'], [/ph/, 'f'], [/ck/, 'k'], [/c/, 'k'], [/k/, 'c'], [/y$/, 'ie'], [/ie/, 'ei'], [/ei/, 'ie'], [/([a-z])\1/, '$1'], [/u/, 'a'], [/e$/, '']];
function misspell(word, n = 3) {
  const lw = word.toLowerCase(), rule = [], swap = new Set();
  MIS_RULES.forEach(([re, r]) => { if (re.test(lw)) { const x = lw.replace(re, r); if (x && x !== lw && x.length > 1 && !rule.includes(x)) rule.push(x); } });
  for (let i = 1; i < lw.length - 1; i++) { const x = lw.slice(0, i) + lw[i + 1] + lw[i] + lw.slice(i + 2); if (x !== lw && lw[i] !== lw[i + 1]) swap.add(x); }
  const out = shuffle(rule.slice(0, n + 2)).slice(0, n); for (const x of shuffle([...swap])) { if (out.length >= n) break; if (!out.includes(x)) out.push(x); }
  return out;
}
/* other words to use as wrong options: same list first, then any other list */
function others(w, list, n) {
  const pool = [...list.words, ...LIST0.words, ...PACKS.flatMap(p => p.words)].filter(x => kOf(x) !== kOf(w) && !x.he.some(h => w.he.includes(h)));
  const seen = new Set(), out = [];
  for (const x of [...shuffle(list.words.filter(x => pool.includes(x))), ...shuffle(pool)]) { if (seen.has(kOf(x))) continue; seen.add(kOf(x)); out.push(x); if (out.length >= n) break; }
  return out;
}
/* ---------- where the mistake is: align what she typed with the right word ---------- */
function align(typed, right) {
  const a = [...typed.toLowerCase()], b = [...right.toLowerCase()], n = a.length, m = b.length;
  const D = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const R1 = [], R2 = []; let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { const ok = a[i - 1] === b[j - 1]; R1.unshift([a[i - 1], ok]); R2.unshift([right[j - 1], ok]); i--; j--; }
    else if (j > 0 && D[i][j] === D[i][j - 1] + 1) { R2.unshift([right[j - 1], false]); j--; }
    else { R1.unshift([a[i - 1], false]); i--; }
  }
  return { mine: R1, right: R2 };
}
const alignHTML = cells => cells.map(([c, ok]) => `<span class="${ok ? '' : 'diff'}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');

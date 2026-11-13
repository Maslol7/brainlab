/* ---------- the practice engine ----------
   Two tracks, each with its own progress field per word:
   - spelling track (field sp; dictation lists and the general review). Romi knows the sound and meaning; the spelling is what she
     forgets, so each word climbs: 0 meet (look, cover, build) · 1 copy, letter by letter · 2 missing letters (her own mistakes and the
     tricky part first) · 3 more missing letters · 4 write from the sound · 5 write from the Hebrew · 6 write again on another day ·
     7 write the Hebrew meaning · 8 star. From 7 she "controls the spelling". A spelling mistake sends the word back to 2.
     At most 3 words are in work at once, so a word is truly learned before the next one starts.
   - recognition track (field st; test lists stop at 4, bonus packs at 6): meet, meaning, spot the spelling, build, hear and type, from Hebrew. */
const STEP_NAMES = ['חדשה', 'פירוש', 'זיהוי', 'הרכבה', 'הכתבה', 'מעברית', 'פירוש בכתב', 'כוכב'];
const STEP_NAMES_SP = ['חדשה', 'העתקה', 'חסרות אותיות', 'חסרות עוד', 'הכתבה מהשמיעה', 'מעברית', 'בדיקה ביום אחר', 'פירוש בכתב', 'כוכב'];
const isSpell = l => !!l && (l.id === 'review' || (l.src === 'class' && l.kind !== 'exam' && !!l.he));
const fld = l => isSpell(l) ? 'sp' : 'st';
const stepNames = l => isSpell(l) ? STEP_NAMES_SP : STEP_NAMES;
const maxSt = l => isSpell(l) ? 8 : l && l.kind === 'exam' ? 4 : l && l.he ? 7 : 6;
const SP_OK = 7;   /* from here she controls the spelling */
function prog(w) { const k = kOf(w); return S.p[k] || (S.p[k] = { st: 0, sp: 0, r: 0, ok: 0, bad: 0, wr: [] }); }
const stageOf = (w, l) => (S.p[kOf(w)] || {})[fld(l)] || 0;
const spells = w => ((S.p[kOf(w)] || {}).sp || 0) >= SP_OK;
const mastered = (w, l) => stageOf(w, l) >= maxSt(l);
const pctOf = (w, l) => Math.min(100, Math.round(stageOf(w, l) / maxSt(l) * 100));
const isDue = w => { const q = S.p[kOf(w)]; return !!(q && q.due && q.due <= todayStr()); };
function listPct(l) { if (!l || !l.words.length) return 0; return Math.round(l.words.reduce((a, w) => a + pctOf(w, l), 0) / l.words.length); }
const listStars = l => l.words.filter(w => mastered(w, l)).length;
/* a word that passed "write from the Hebrew" today waits for tomorrow's check (unless the dictation is tomorrow or today) */
const waitsTomorrow = (w, l) => { if (!isSpell(l)) return false; const q = S.p[kOf(w)] || {}, left = l.date ? dayDiff(todayStr(), l.date) : 99; return q.sp === 6 && q.rd === todayStr() && left > 1; };
/* which words go into today's session */
function planSession(list) {
  if (isSpell(list)) return spellPlan(list);
  const t = todayStr(), ws = list.words.slice(), left = list.date ? dayDiff(t, list.date) : 99;
  const un = ws.filter(w => !mastered(w, list)).sort((a, b) => stageOf(b, list) - stageOf(a, list));
  const started = un.filter(w => stageOf(w, list) > 0), news = shuffle(un.filter(w => stageOf(w, list) === 0));
  const rev = shuffle(ws.filter(w => mastered(w, list) && (isDue(w) || left <= 1)));
  const cap = list.kind === 'exam' ? 9 : 5;  /* a test list is long and asks only to recognise: more words at once */
  let q = [...shuffle(started), ...news.slice(0, Math.max(2, cap - started.length))];
  q = q.concat(q.length < 3 ? rev : rev.slice(0, 3));
  if (!q.length) q = shuffle(ws).slice(0, Math.min(6, ws.length));
  const n = list.kind === 'exam' ? 18 : left <= 1 ? 16 : 14;
  return { q, n };
}
function spellPlan(list) {
  const t = todayStr(), left = list.date ? dayDiff(t, list.date) : 99, M = maxSt(list), st = w => stageOf(w, list);
  const pool = list.id === 'review' ? reviewPlan(list).q : list.words;
  const un = pool.filter(w => st(w) < M && !waitsTomorrow(w, list));
  const active = un.filter(w => st(w) >= 1).sort((a, b) => st(a) - st(b));
  const news = un.filter(w => st(w) === 0);
  const q = [...active.slice(0, 3), ...news.slice(0, Math.max(0, 3 - active.length))];
  const rev = shuffle(list.words.filter(w => st(w) >= M && (isDue(w) || left <= 1)));
  const all = q.concat(rev.slice(0, q.length ? 2 : 4));
  return { q: all, n: Math.max(6, Math.min(16, all.length * 5)), waiting: list.words.filter(w => waitsTomorrow(w, list)) };
}
function itemType(w, list) {
  const st = stageOf(w, list), M = maxSt(list);
  if (isSpell(list)) { if (st >= M) return pick(['typeEN', 'typeHE2EN']); return ['learn', 'copy', 'fade1', 'fade2', 'typeEN', 'typeHE2EN', 'typeEN', 'writeHE'][st]; }
  if (st >= M) return pick(list.kind === 'exam' ? ['meanEN', 'meanHE', 'pick'] : list.he ? ['typeEN', 'typeHE2EN', 'writeHE'] : ['typeEN', 'typeHE2EN']);
  return ['learn', R() < .5 ? 'meanEN' : 'meanHE', 'pick', 'tiles', 'typeEN', 'typeHE2EN', 'writeHE'][st];
}
/* record a result. ok = right on the first try. Returns 'up', 'star', 'spell' (just reached spelling control), 'keep' or 'down' */
function grade(w, list, type, ok, attempt) {
  const q = prog(w), M = maxSt(list), t = todayStr(), f = fld(list); q.last = t; q[f] = q[f] || 0;
  if (type === 'learn') { q[f] = Math.max(q[f], 1); return 'up'; }
  const wasM = q[f] >= M;
  if (ok) {
    q.ok++;
    if (wasM) { q.r = (q.r || 0) + 1; q.due = addDays(t, [1, 2, 4, 7, 14][Math.min(4, q.r - 1)]); return 'keep'; }
    q[f]++;
    if (f === 'sp' && q[f] === 6) q.rd = t;
    if (q[f] >= M) { q.r = 0; q.due = addDays(t, 1); q.mt = t; return 'star'; }
    return f === 'sp' && q[f] === SP_OK ? 'spell' : 'up';
  }
  q.bad++; if (attempt && type !== 'writeHE') { q.wr.unshift(attempt); q.wr = q.wr.slice(0, 4); }
  if (f === 'sp') {
    if (type === 'writeHE') return 'down';                  /* the Hebrew meaning is not a spelling mistake: the word stays at 7 */
    if (wasM || q[f] >= 4) { q[f] = 2; q.r = 0; q.due = null; } else q[f] = Math.max(1, q[f] - 1);
    return 'down';
  }
  if (wasM) { q[f] = M - 2; q.r = 0; q.due = null; } else q[f] = Math.max(1, q[f] - 1);
  return 'down';
}
/* the letters to hide: the tricky part of the word, and the letters she got wrong before */
function trickyIdx(word) {
  const lw = word.toLowerCase(), set = new Set(), re = /eigh|igh|tion|gh|ph|kn|wr|wh|ck|ai|ay|ee|ea|oa|ow|ou|oo|ie|ue|([a-z])\1/g; let m;
  while ((m = re.exec(lw))) for (let i = m.index; i < m.index + m[0].length; i++) set.add(i);
  if (/[a-z][^aeiou ]e$/.test(lw) && lw.length > 3) set.add(lw.length - 1);   /* magic e */
  return set;
}
function errIdx(w) {
  const set = new Set();
  for (const a of arr((S.p[kOf(w)] || {}).wr)) { let j = 0; align(a, w.en).right.forEach(([c, ok]) => { if (!ok) set.add(j); j++; }); }
  return set;
}
function fadeMask(w, level) {
  const lw = w.en.toLowerCase(), letters = [...lw].map((c, i) => i).filter(i => lw[i] !== ' '), n = letters.length;
  const hide = new Set([...errIdx(w), ...trickyIdx(w.en)].filter(i => lw[i] && lw[i] !== ' '));
  const want = level === 1 ? Math.max(2, Math.min(Math.ceil(n * .5), hide.size || 2)) : Math.max(3, Math.round(n * .7));
  let pick = [...hide].slice(0, want); const rest = shuffle(letters.filter(i => !pick.includes(i) && i !== 0));
  while (pick.length < want && rest.length) pick.push(rest.shift());
  if (level === 2 && pick.length >= n) pick = pick.filter(i => i !== 0);
  return [...lw].map((c, i) => pick.includes(i));
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

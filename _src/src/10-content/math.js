/* ---------- MATH WORD PROBLEMS ---------- */
const FR = { '1/2': 'חצי', '1/3': 'שליש', '1/4': 'רבע', '2/5': 'שתי חמישיות' };
const TM = (m) => { const H = 8 + Math.floor(m / 60), M = m % 60; return L(`${H}:${String(M).padStart(2, '0')}`); };
/* ---- explanation helpers (math only) ----
   Every explanation: the method in one sentence (.mhow), an optional small picture, then a .calc block with one line per step
   and the answer in <b>, and an optional short warning (.mtip). Only inline elements: the explanation sits inside a <p>. */
const mB = v => `<b>${v}</b>`;
const mCalc = lines => `<span class="calc">${lines.filter(Boolean).map(s => `<span>${s}</span>`).join('')}</span>`;
const mEx = (method, lines, pic = '', tip = '', spot = '') => `<span class="mhow">${method}</span>${pic}${mCalc(lines)}${tip ? `<span class="mtip">${tip}</span>` : ''}${spot ? `<span class="mspot"><b>איך מזהים:</b> ${spot}</span>` : ''}`;
const mGcd = (a, b) => b ? mGcd(b, a % b) : a;
const mLcm = (...ns) => ns.reduce((x, y) => x * y / mGcd(x, y));
/* "3 פעמים" in words, so a small number in a hint is not mistaken for the answer */
const mTimes = n => ({ 1: 'בדיוק', 2: 'פעמיים', 3: 'שלוש פעמים', 4: 'ארבע פעמים', 5: 'חמש פעמים', 6: 'שש פעמים', 8: 'שמונה פעמים' })[n] || `${n} פעמים`;
/* wrong options and why they are wrong, for the guided lesson: keyed by the option's digits ("5.50", "8:36") */
const mKey = s => strip(String(s)).replace(/[^\d.:]/g, '');
const mWhy = (pairs, ans) => { const o = {}; for (const [v, t] of pairs) { const k = mKey(v); if (k !== mKey(ans) && !o[k]) o[k] = t; } return o; };
/* numeric question with clean distractors: whole, positive, never the answer; small neighbours fill the gaps */
const mNum = (d, prompt, vis, ans, cands, ex, unit = '') => {
  const ok = c => Number.isFinite(c) && c > 0 && c !== ans && (!Number.isInteger(ans) || Number.isInteger(c));
  return numQ('math', d, prompt, vis, ans, cands.concat([ans + 1, ans - 1, ans + 2, ans * 2, ans + 3, ans - 2]).filter(ok), ex, unit);
};
const mPl = (n, one, many) => n === 1 ? one : `${n} ${many}`;
/* bar model: rows of equal unit boxes (so the strips are in proportion). cells: [text, class] with class '', 'g' gold, 'm' grey, 'k' violet */
const mRep = (n, t, c = '') => Array.from({ length: n }, () => [t, c]);
const mLeg = items => `<span class="mleg">${items.map(([c, t]) => `<span><i class="${c}"></i>${t}</span>`).join('')}</span>`;
const mBar = (rows, cls = '', under = '') => `<span class="mbar ${cls}">${rows.map(([lab, cells]) => `<span class="mbr">${lab ? `<span class="mbl">${lab}</span>` : ''}<span class="mbc">${cells.map(([t, c]) => `<i class="${c || ''}">${t}</i>`).join('')}</span></span>`).join('')}${under}</span>`;
/* small table; row number `hi` is highlighted */
const mTab = (head, rows, hi = rows.length - 1) => `<span class="mtab" style="--n:${head.length}">${head.map(h => `<span class="th">${h}</span>`).join('')}${rows.map((r, i) => r.map(c => `<span class="${i === hi ? 'hi' : ''}">${c}</span>`).join('')).join('')}</span>`;
/* "assume they are all X" table: rows for 0, 1, ..., ans of the second kind */
const mAssume = (head, N, base, gain, ans) => { const row = i => [i, N - i, N * base + gain * i]; const rows = [row(0), row(1)]; if (ans > 2) rows.push(['⋮', '⋮', '⋮']); rows.push(row(ans)); return mTab(head, rows); };
/* svg pieces (colors from the theme: a accent, g gold, v violet, mu muted) */
const mSvg = (h, body) => `<svg class="msvg" viewBox="0 0 300 ${h}" aria-hidden="true">${body}</svg>`;
const mTx = (x, y, s, cls = '', size = 12) => `<text x="${Math.round(x)}" y="${y}" text-anchor="middle" font-size="${size}" class="${cls}">${s}</text>`;
/* number line: pts [{v, t: number label, w: word under it, c: 'g'|'a'}], arcs [[from, to, label]] */
function mNL(pts, arcs = []) {
  const vs = pts.map(p => p.v), lo = Math.min(...vs), hi = Math.max(...vs), X = v => Math.round(30 + (v - lo) * 240 / (hi - lo || 1)), y = 42;
  let s = `<line class="ln" x1="6" y1="${y}" x2="294" y2="${y}"/>`;
  for (const [f, t, lab] of arcs) { const a = X(f), b = X(t), m = (a + b) / 2; s += `<path class="la" d="M${a} ${y - 6} Q${m} ${y - 30} ${b} ${y - 6}"/>` + mTx(m, y - 22, lab, 'a', 11); }
  for (const p of pts) { const x = X(p.v); s += `<line class="ln" x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}"/>`; if (p.c) s += `<circle cx="${x}" cy="${y}" r="4.5" class="${p.c}"/>`; s += mTx(x, y + 21, p.t, p.c || '', 13); if (p.w) s += mTx(x, y + 36, p.w, p.c || 'mu', 10.5); }
  return mSvg(84, s);
}
/* timeline of bus lines: one row per line [name, every], a dot at each departure, all meeting at l */
function mBusTL(ls, l) {
  const x0 = 22, x1 = 268, X = m => x0 + m * (x1 - x0) / l, C = ['a', 'v', 'w'], y0 = 28, dy = 28, yb = y0 + dy * (ls.length - 1) + 12;
  let s = `<line class="lg dash" x1="${X(l)}" y1="${y0 - 22}" x2="${X(l)}" y2="${yb}"/>`;
  ls.forEach(([, a], r) => { const y = y0 + dy * r; s += `<line class="ln" x1="${x0 - 8}" y1="${y}" x2="${x1 + 12}" y2="${y}"/>`; const sk = Math.ceil(l / a / 8); for (let m = 0; m <= l; m += a) s += `<circle cx="${X(m)}" cy="${y}" r="4.5" class="${C[r]}"/>` + (m === l ? `<text x="${X(m) + 6}" y="${y - 7}" font-size="10" text-anchor="start" class="${C[r]}">${m}</text>` : m && (m / a) % sk === 0 && X(l) - X(m) > 14 ? mTx(X(m), y - 9, m, C[r], 10) : ''); });
  s += mTx(x0, yb + 14, '8:00', 'mu', 11) + mTx(X(l), yb + 14, strip(TM(l)), 'g', 12);
  return mSvg(yb + 20, s) + mLeg(ls.map(([nm, a], r) => [C[r], `${nm}: כל ${a} דקות`]));
}
/* packs split into equal piles: one box per item, with the price of one item in it */
function mPacks(packs, best, one) {
  return `<span class="mpacks">${packs.map(([n, p, u]) => `<span class="mpk${u === best ? ' best' : ''}"><span class="mpkh">חבילה של ${n} · ${L(money(p))} ₪</span><span class="mbc">${Array.from({ length: n }, () => `<i class="${u === best ? 'g' : ''}">${money(u)}</i>`).join('')}${u === best ? '<em>זול יותר</em>' : ''}</span></span>`).join('')}<span class="mcap">כל משבצת היא ${one}. מחיר החבילה מתחלק שווה בין המשבצות.</span></span>`;
}
/* ages: for each moment [title, child, dad] a child bar and a dad bar; the gold part is the difference, and it keeps its length */
function mAgesTL(nm, rows) {
  const mx = Math.max(...rows.map(r => r[2])), x0 = 62, X = v => Math.round(x0 + v * (266 - x0) / mx), bh = 16;
  const side = (t, y) => `<text x="${x0 - 6}" y="${y + 12}" font-size="11.5" text-anchor="end" class="mu">${t}</text>`, num = (v, x, y, c = '') => `<text x="${x + 4}" y="${y + 12}" font-size="11.5" text-anchor="start" class="${c}">${v}</text>`;
  let s = '', y = 0;
  for (const [t, c, dd] of rows) {
    const y1 = y + 18, y2 = y1 + bh + 5;
    s += `<text x="${x0}" y="${y + 12}" font-size="12" text-anchor="start" class="tt">${t}</text>`;
    s += `<rect class="bc" x="${x0}" y="${y1}" width="${X(c) - x0}" height="${bh}" rx="3"/>` + side(nm, y1) + num(c, X(c), y1, 'a');
    s += `<rect class="bd" x="${x0}" y="${y2}" width="${X(c) - x0}" height="${bh}" rx="3"/><rect class="bgap" x="${X(c)}" y="${y2}" width="${X(dd) - X(c)}" height="${bh}" rx="3"/>` + side('אבא', y2) + num(dd, X(dd), y2, 'v');
    s += mTx((X(c) + X(dd)) / 2, y2 + 12, `הפרש ${dd - c}`, 'gk', 10.5) + `<line class="lg dash" x1="${X(c)}" y1="${y1}" x2="${X(c)}" y2="${y2 + bh}"/>`;
    y = y2 + bh + 10;
  }
  return mSvg(y, s) + `<span class="mcap">שניהם מתבגרים באותו מספר שנים, ולכן החלק הצהוב (ההפרש) נשאר באותו אורך.</span>`;
}
/* everyone against everyone: n dots on a circle, a line for each game; the games of one player are coloured */
function mPoly(n, who = 'שחקן אחד') {
  const P = i => [150 + 54 * Math.sin(2 * Math.PI * i / n), 62 - 54 * Math.cos(2 * Math.PI * i / n)].map(Math.round); let s = '';
  for (let i = n - 1; i >= 0; i--) for (let j = i + 1; j < n; j++) { const [a, b] = P(i), [c, e] = P(j); s += `<line class="${i ? 'ln thin' : 'la'}" x1="${a}" y1="${b}" x2="${c}" y2="${e}"/>`; }
  for (let i = 0; i < n; i++) { const [a, b] = P(i); s += `<circle cx="${a}" cy="${b}" r="5" class="${i ? 'v' : 'a'}"/>`; }
  return mSvg(124, s) + mLeg([['a', `המשחקים של ${who}: ${n - 1}`], ['m', 'כל קו הוא משחק אחד']]);
}
/* two trains on one road: the first from the left, the second from the right, a tick for every hour */
function mTrainTL(v1, v2, t, D) {
  const x0 = 12, x1 = 288, X = km => x0 + km * (x1 - x0) / D, y = 44, mx = X(v1 * t), cl = v => Math.min(250, Math.max(50, v));
  let s = `<line class="ln" x1="${x0}" y1="${y - 10}" x2="${x0}" y2="${y + 10}"/><line class="ln" x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${y + 10}"/>`;
  s += `<line class="la w3" x1="${x0}" y1="${y}" x2="${mx}" y2="${y}"/><line class="lv w3" x1="${mx}" y1="${y}" x2="${x1}" y2="${y}"/>`;
  for (let i = 1; i < t; i++) s += `<line class="la" x1="${X(i * v1)}" y1="${y - 8}" x2="${X(i * v1)}" y2="${y}"/><line class="lv" x1="${X(D - i * v2)}" y1="${y}" x2="${X(D - i * v2)}" y2="${y + 8}"/>`;
  s += `<circle cx="${mx}" cy="${y}" r="5.5" class="g"/>` + mTx(cl((x0 + mx) / 2), y - 16, `${v1} × ${t} = ${v1 * t}`, 'a', 11) + mTx(cl((mx + x1) / 2), y + 26, `${v2} × ${t} = ${v2 * t}`, 'v', 11);
  return mSvg(80, s) + mLeg([['a', `ראשונה, ${v1} קמ"ש`], ['v', `שנייה, ${v2} קמ"ש`], ['g', 'נפגשות']]) + '<span class="mcap">כל קו קטן הוא שעה של נסיעה.</span>';
}
/* a rectangle with its sides written on it */
/* la, lb: the labels (a number, or "?"); split: cut the long side into split + (a − split) and write each part's area inside */
function mRect(a, b, all, la = a, lb = b, split = 0) {
  const k = 150 / Math.max(a, b), w = Math.max(40, a * k), h = Math.max(26, b * k), x = 150 - w / 2, y = 22;
  let s = `<rect class="la" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>` + mTx(x + w + 14, y + h / 2 + 4, lb, 'g') + (all ? mTx(150, y + h + 16, la, 'a') + mTx(x - 14, y + h / 2 + 4, lb, 'g') : '');
  if (split) { const xs = x + w * split / a; s += `<line class="lg dash" x1="${xs}" y1="${y}" x2="${xs}" y2="${y + h}"/>` + mTx((x + xs) / 2, y - 6, split, 'a') + mTx((xs + x + w) / 2, y - 6, a - split, 'a') + mTx((x + xs) / 2, y + h / 2 + 4, split * b, 'mu', 11) + mTx((xs + x + w) / 2, y + h / 2 + 4, (a - split) * b, 'mu', 11); }
  else s += mTx(150, y - 6, la, 'a');
  return mSvg(h + 46, s);
}
/* a rectangle and a square with the same perimeter, side by side */
function mRectSq(b, a, sq) {
  const k = 100 / Math.max(b, sq, a), w1 = b * k, h1 = a * k, w2 = sq * k, H = Math.max(h1, w2), y = 22, x1 = 20, x2 = 190;
  return mSvg(H + 52, `<rect class="la" x="${x1}" y="${y}" width="${w1}" height="${h1}" rx="2"/><rect class="lg" fill="none" x="${x2}" y="${y}" width="${w2}" height="${w2}" rx="2"/>` + mTx(x1 + w1 / 2, y - 6, b, 'a') + mTx(x1 + w1 + 12, y + h1 / 2 + 4, a, 'a') + mTx(x2 + w2 / 2, y - 6, sq, 'g') + mTx(x2 + w2 + 12, y + w2 / 2 + 4, sq, 'g') + mTx(x1 + w1 / 2, y + H + 22, `היקף ${2 * (a + b)}`, 'a', 11) + mTx(x2 + w2 / 2, y + H + 22, `היקף ${4 * sq}`, 'g', 11));
}
/* a rectangle A by B with an s by s square cut from a corner; the two edges that moved in are gold */
function mLShape(A, B, s) {
  const k = Math.min(190 / A, 96 / B), W = A * k, H = B * k, S = s * k, x = 150 - W / 2, y = 20, xc = x + W - S;
  return mSvg(H + 48, `<rect class="lg dash" fill="none" x="${xc}" y="${y}" width="${S}" height="${S}"/><path class="la" d="M${x} ${y}H${xc}V${y + S}H${x + W}V${y + H}H${x}Z"/><path class="lg w3" fill="none" d="M${xc} ${y}V${y + S}H${x + W}"/>`
    + mTx(150, y + H + 16, A, 'a') + mTx(x - 14, y + H / 2 + 4, B, 'a') + mTx(xc + S / 2, y - 6, s, 'g') + mTx(x + W + 12, y + S / 2 + 4, s, 'g'))
    + mLeg([['g', 'הצלעות שזזו פנימה: אותו אורך כמו הצלעות שנגזרו']]);
}
/* balls in a bag */
const mDots = groups => { let i = 0, s = ''; for (const [n, c] of groups) for (let j = 0; j < n; j++) s += `<circle cx="${10 + 16 * i++}" cy="12" r="6.5" class="${c}"/>`; return `<svg class="mdots" width="${16 * i + 4}" height="24" viewBox="0 0 ${16 * i + 4} 24" aria-hidden="true">${s}</svg>`; };
/* both averages (tests, games) are solved the same way: through sums */
function mAvgEx(n, A, B, need, what) {
  return mEx(`בממוצע עובדים עם סכומים: ממוצע × מספר ה${what} = הסכום.`,
    [`הסכום עכשיו: ${L(`${n} × ${A} = ${n * A}`)}`, `הסכום שצריך ב-${n + 1} ${what}: ${L(`${n + 1} × ${B} = ${(n + 1) * B}`)}`, `בפעם הבאה: ${L(`${(n + 1) * B} − ${n * A} = ${mB(need)}`)}`, `קיצור: כל אחד מ-${n} ה${what} חסר ${B - A}, אז ${L(`${B} + ${n} × ${B - A} = ${need}`)}`],
    mNL([{ v: A, t: A, w: 'עכשיו' }, { v: B, t: B, w: 'רוצים', c: 'a' }, { v: need, t: need, w: 'הבא', c: 'g' }], [[A, B, `+${B - A}`], [B, need, `${n} × ${B - A}`]]));
}
const PCW = { 10: 'עשירית', 20: 'חמישית', 25: 'רבע', 50: 'חצי' };
const MT = {
  /* kind: '3' three in a row, '5e' five even, '5' five, '4' four (no middle number), '3o' three odd */
  consec(d, kind) {
    const K = kind || pick(d === 1 ? ['3'] : d === 2 ? ['5e', '5', '3o'] : ['4', '4', '5e', '3o']), n = +K[0], st = /[eo]/.test(K) ? 2 : 1;
    const x = K === '5e' ? ri(5, 30) * 2 : K === '3o' ? ri(5, 40) * 2 + 1 : ri(10, 60), big = d === 1 || K === '4' ? R() < .5 : K === '5';
    const nums = Array.from({ length: n }, (_, i) => x + st * i), S = nums.reduce((s, v) => s + v, 0), ans = big ? nums[n - 1] : x, word = big ? 'הגדול' : 'הקטן';
    const what = st === 2 ? (x % 2 ? 'מספרים אי-זוגיים עוקבים' : 'מספרים זוגיים עוקבים') : 'מספרים שלמים עוקבים', NW = { 3: 'שלושה', 4: 'ארבעה', 5: 'חמישה' }[n];
    const prompt = `סכום ${NW} ${what} הוא ${S}. מהו ${word} מביניהם?`, chk = `בדיקה: ${L(`${nums.join(' + ')} = ${S}`)}`;
    const spot = '"סכום של כמה מספרים עוקבים". תמיד מתחילים מהממוצע: הסכום חלקי כמות המספרים.';
    let ex, h1, h2, meta;
    if (n === 4) { const av = S / 4;
      ex = mEx('בארבעה מספרים עוקבים אין מספר אמצעי. הממוצע נופל בדיוק באמצע, בין שני המספרים האמצעיים.',
        [`הממוצע: ${L(`${S} ÷ 4 = ${fmt(av)}`)}`, `שני המספרים האמצעיים הם השלמים משני הצדדים שלו: ${x + 1} ו-${x + 2}`, big ? `הגדול בא צעד אחד אחרי ${x + 2}: ${L(`${x + 2} + 1 = ${mB(ans)}`)}` : `הקטן בא צעד אחד לפני ${x + 1}: ${L(`${x + 1} − 1 = ${mB(ans)}`)}`, chk],
        mNL(nums.map((v, i) => ({ v, t: v, c: v === ans ? 'g' : '', w: v === ans ? word : '' })).concat([{ v: av, t: '', w: 'ממוצע', c: 'a' }])),
        `דרך נוספת: הקטן ועוד הגדול הם חצי מהסכום, ${L(`${S} ÷ 2 = ${S / 2}`)}. המלכודת: לחשוב ש-${L(fmt(av))} הוא אחד המספרים.`, spot);
      h1 = `בארבעה מספרים עוקבים אין מספר אמצעי אחד. חלקו את ${S} ב-4. הממוצע ייפול בין שני המספרים האמצעיים.`;
      h2 = `${L(`${S} ÷ 4 = ${fmt(av)}`)}. אז שני המספרים האמצעיים הם המספרים השלמים משני הצדדים של ${L(fmt(av))}.`;
      meta = { n, st, S, av, x, big };
    } else { const mid = nums[(n - 1) / 2], steps = (n - 1) / 2, far = steps * st;
      ex = mEx('במספרים עוקבים, המספר האמצעי הוא הממוצע: הסכום חלקי כמות המספרים.',
        [`האמצעי: ${L(`${S} ÷ ${n} = ${mid}`)}`, `${word} נמצא ${steps === 1 ? 'צעד אחד' : `${steps} צעדים`}${st === 2 ? ' של 2' : ''} ${big ? 'אחרי' : 'לפני'} האמצעי: ${L(`${mid} ${big ? '+' : '−'} ${far} = ${mB(ans)}`)}`, chk],
        mNL(nums.map(v => ({ v, t: v, c: v === mid ? 'a' : v === ans ? 'g' : '', w: v === mid ? 'ממוצע' : v === ans ? word : '' })), [[mid, ans, `${big ? '+' : '−'}${far}`]]), '', spot);
      h1 = `ב${NW} ${what}, המספר האמצעי הוא בדיוק הממוצע. כמה זה ${L(`${S} ÷ ${n}`)}?`;
      h2 = `האמצעי: ${L(`${S} ÷ ${n} = ${mid}`)}. ${word} נמצא ${steps === 1 ? 'צעד אחד' : `${steps} צעדים`}${st === 2 ? ' של 2' : ''} ${big ? 'אחריו' : 'לפניו'}.`;
      meta = { n, st, S, mid, x, big };
    }
    const q = withHint(mNum(d, prompt, '', ans, [n === 4 ? (big ? x + 2 : x + 1) : nums[(n - 1) / 2], big ? x : nums[n - 1], ans + st, ans - st], ex), h1, h2);
    q.lk = 'consec'; q.meta = Object.assign(meta, { why: mWhy([[nums[(n - 1) >> 1], n === 4 ? 'זה אחד משני המספרים האמצעיים' : 'זה המספר האמצעי (הממוצע)'], [nums[n >> 1], 'זה אחד משני המספרים האמצעיים'], [big ? x : nums[n - 1], big ? 'זה הקטן, והשאלה על הגדול' : 'זה הגדול, והשאלה על הקטן'], [ans + st, 'צעד אחד יותר מדי'], [ans - st, 'צעד אחד יותר מדי']], ans) });
    return q;
  },
  /* kind: 'total' (class size given), 'part' (number of boys given), 'diff' (how many more girls) */
  ratio(d, kind) {
    for (;;) {
      const K = kind || pick(d === 1 ? ['total'] : d === 2 ? ['total', 'part'] : ['part', 'diff']);
      const [a, b] = pick([[2, 3], [3, 4], [3, 5], [4, 5], [5, 7], [1, 2], [2, 5], [3, 7]]), k = d === 1 ? ri(3, 6) : ri(4, 9), T = (a + b) * k;
      if ((T > 40 && d === 1) || T < 15) continue;
      const boys = a === 1 ? 'בן אחד' : `${a} בנים`, at = T > 40 ? 'בשכבה' : 'בכיתה', A = a * k, B = b * k, D = B - A;
      const grp = `בכל קבוצה: ${boys} ו-${b} בנות, כלומר ${L(`${a} + ${b} = ${a + b}`)} ילדים`;
      const kLine = K === 'total' ? `מספר הקבוצות: ${L(`${T} ÷ ${a + b} = ${k}`)}` : K === 'part' ? (a === 1 ? `כל בן הוא קבוצה אחת, אז יש ${k} קבוצות` : `מספר הקבוצות: ${L(`${A} ÷ ${a} = ${k}`)} (בכל קבוצה ${a} בנים)`) : (b - a === 1 ? `בכל קבוצה יש בת אחת יותר מבנים. ${D} בנות יותר, אז יש ${k} קבוצות` : `בכל קבוצה יש ${b - a} בנות יותר מבנים. מספר הקבוצות: ${L(`${D} ÷ ${b - a} = ${k}`)}`);
      const ans = K === 'total' ? B : T, last = K === 'total' ? `בנות: ${L(`${b} × ${k} = ${mB(B)}`)}` : `בסך הכל: ${L(`${a + b} × ${k} = ${mB(T)}`)}`;
      const bar = mBar([['בנים', mRep(a, k)], ['בנות', K === 'diff' ? mRep(a, k, 'g').concat(mRep(b - a, k, 'k')) : mRep(b, k, 'g')]], '', (K === 'diff' ? mLeg([['k', 'הבנות שיש יותר']]) : '') + `<span class="mcap">כל משבצת היא ${k} ילדים, ובכל עמודה יש קבוצה אחת: ${boys} ו-${b} בנות.</span>`);
      const ex = mEx('"על כל ... יש ..." אומר שהכיתה בנויה מקבוצות שוות. מוצאים כמה קבוצות יש, וכופלים.',
        [grp, kLine, last, `בדיקה: ${L(`${A} + ${B} = ${T}`)}${K === 'diff' ? `, ו-${L(`${B} − ${A} = ${D}`)}` : ''}`], bar,
        K === 'total' ? `המלכודת: לחלק את ${T} ב-${b}. מחלקים בגודל של קבוצה שלמה, ${a + b}.` : K === 'part' ? `המלכודת: לענות רק את מספר הבנות (${B}). שואלים על כל ה${at === 'בכיתה' ? 'כיתה' : 'שכבה'}.` : `המלכודת: לחשוב ש-${D} הוא מספר הבנות. זה רק ההפרש.`,
        '"על כל 3 ... יש 5 ..." או "היחס הוא 3 ל-5". חושבים על קבוצות של 8 שחוזרות שוב ושוב.');
      const prompt = K === 'total' ? `${at} ${T} תלמידים. על כל ${boys} יש ${at} ${b} בנות. כמה בנות ${at}?` : K === 'part' ? `${at} יש ${A} בנים. על כל ${boys} יש ${at} ${b} בנות. כמה תלמידים יש ${at} בסך הכל?` : `על כל ${boys} יש ${at} ${b} בנות. יש ${at} ${D} בנות יותר מבנים. כמה תלמידים יש ${at} בסך הכל?`;
      const cands = K === 'total' ? [A, k, b * (k + 1), Math.round(T / b)] : K === 'part' ? [B, A + b, T + k, A * (a + b)] : [B, D * (a + b), T + D, A + D];
      const h = K === 'total' ? [`חשבו על קבוצה של ${boys} ו-${b} בנות, כלומר ${a + b} ילדים. כמה קבוצות כאלה יש ב-${T}?`, `${L(`${T} ÷ ${a + b} = ${k}`)} קבוצות. בכל קבוצה יש ${b} בנות.`]
        : K === 'part' ? [`חשבו על קבוצות: בכל קבוצה ${boys} ו-${b} בנות. כמה קבוצות כאלה צריך כדי שיהיו ${A} בנים?`, `${kLine}. בכל קבוצה ${a + b} ילדים. כמה ילדים בכל הקבוצות?`]
          : [`בכל קבוצה של ${boys} ו-${b} בנות יש ${b - a === 1 ? 'בת אחת' : `${b - a} בנות`} יותר מבנים. כמה קבוצות צריך כדי שיהיו ${D} בנות יותר?`, `${kLine}. בכל קבוצה ${a + b} ילדים. כמה ילדים בכל הקבוצות?`];
      const q = withHint(mNum(d, prompt, '', ans, cands, ex), h[0], h[1]);
      q.lk = 'ratio'; q.meta = { K, a, b, k, T, A, B, D, boys, at, why: mWhy([[A, 'זה מספר הבנים'], [B, 'זה רק מספר הבנות'], [k, 'זה מספר הקבוצות, לא הילדים'], [D, 'זה רק ההפרש']], ans) };
      return q;
    }
  },
  legs(d) {
    const r = ri(3, 15), c = ri(3, 15), H = r + c, Lg = 4 * r + 2 * c;
    const ex = mEx('שיטת "נניח שכולם": מניחים שכל החיות תרנגולות, ובודקים כמה רגליים חסרות.',
      [`אם כל ${H} החיות תרנגולות: ${L(`${H} × 2 = ${2 * H}`)} רגליים`, `חסרות: ${L(`${Lg} − ${2 * H} = ${Lg - 2 * H}`)} רגליים`, `כל ארנב במקום תרנגולת מוסיף 2 רגליים`, `ארנבים: ${L(`${Lg - 2 * H} ÷ 2 = ${mB(r)}`)}`, `בדיקה: ${L(`${r} × 4 + ${c} × 2 = ${4 * r} + ${2 * c} = ${Lg}`)}`],
      mAssume(['ארנבים', 'תרנגולות', 'רגליים'], H, 2, 2, r));
    return withHint(mNum(d, `בחצר יש תרנגולות וארנבים. סופרים ${H} ראשים ו-${Lg} רגליים. כמה ארנבים יש?`, '', r, [c, Math.round(H / 2), Math.round(Lg / 4)], ex), `נניח שכל ${H} החיות הן תרנגולות. כמה רגליים היו אז, ובכמה זה פחות מ-${Lg}?`, `${H} תרנגולות: ${L(`${H} × 2 = ${2 * H}`)} רגליים. חסרות ${Lg - 2 * H} רגליים, וכל ארנב מוסיף 2.`);
  },
  average(d) { for (;;) { const n = ri(3, 5), A = ri(72, 88), B = A + ri(2, 4), need = B * (n + 1) - n * A; if (need > 100) continue; const p = pick(PEOPLE);
    return withHint(mNum(d, `הממוצע של ${p[0]} ב-${n} מבחנים הוא ${A}. איזה ציון ${g(p, 'הוא צריך', 'היא צריכה')} לקבל במבחן הבא כדי שהממוצע יעלה ל-${B}?`, '', need, [B, B + (B - A), 100], mAvgEx(n, A, B, need, 'מבחנים')), `חשבו בסכומים, לא בממוצעים: מה סכום הציונים של ${p[0]} ב-${n} המבחנים, ומה צריך להיות הסכום של ${n + 1} מבחנים?`, `הסכום עכשיו: ${L(`${n} × ${A} = ${n * A}`)}. כדי שממוצע ${n + 1} מבחנים יהיה ${B}, הסכום צריך להיות ${L(`${n + 1} × ${B}`)}. כמה חסר?`); } },
  /* kind: 'once' (everyone plays everyone once), 'twice' (home and away), 'back' (from the number of handshakes to the number of people) */
  handshake(d, kind) {
    const K = kind || pick(d === 1 ? ['once'] : d === 2 ? ['once', 'twice'] : ['twice', 'back', 'back']);
    const n = d === 1 ? ri(5, 8) : ri(7, 12), H = n * (n - 1) / 2, stairs = n <= 8 ? Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ') : `${n - 1} + ${n - 2} + ${n - 3} + … + 1`;
    const spot = '"כל אחד נגד כל אחד" או "כל שניים לחצו ידיים". קודם סופרים זוגות (כל אחד נגד כל השאר, חלקי 2), ואז בודקים כמה פעמים נפגש כל זוג.';
    let q;
    if (K === 'once') {
      const ex = mEx('כל שחקן משחק נגד כל האחרים. אם סופרים לכל שחקן את המשחקים שלו, כל משחק נספר פעמיים (פעם אצל כל אחד משני השחקנים). לכן מחלקים ב-2.',
        [`כל שחקן משחק נגד ${n - 1} שחקנים`, `${n} שחקנים: ${L(`${n} × ${n - 1} = ${n * (n - 1)}`)} (כל משחק נספר פעמיים)`, `משחקים: ${L(`${n * (n - 1)} ÷ 2 = ${mB(H)}`)}`, `דרך שנייה: הראשון משחק ${n - 1} משחקים, לשני נשארו עוד ${n - 2} חדשים, וכן הלאה: ${L(`${stairs} = ${H}`)}`],
        mPoly(n), `המלכודת: לשכוח לחלק ב-2 (${n * (n - 1)}).`, spot);
      q = withHint(mNum(d, `בטורניר שחמט משתתפים ${n} שחקנים. כל שחקן משחק נגד כל שחקן אחר פעם אחת בדיוק. כמה משחקים יהיו בסך הכל?`, '', H, [n * (n - 1), n * n / 2 | 0, n * (n + 1) / 2], ex), `נגד כמה שחקנים משחק כל אחד מ-${n} השחקנים? ושימו לב: בכל משחק משתתפים שני שחקנים.`, `כל שחקן משחק ${n - 1} משחקים: ${L(`${n} × ${n - 1} = ${n * (n - 1)}`)}. אבל כך כל משחק נספר פעמיים. מה עושים?`);
      q.meta = { K, n, H, why: mWhy([[n * (n - 1), 'שכחו לחלק ב-2: כל משחק נספר פעמיים'], [n * (n + 1) / 2, `כאילו כל שחקן משחק נגד ${n} שחקנים, אבל הוא לא משחק נגד עצמו`], [n * n / 2 | 0, 'חצי מ-n × n, ולא מ-n × (n − 1)']], H) };
    } else if (K === 'twice') {
      const ans = n * (n - 1);
      const ex = mEx('כל זוג קבוצות נפגש פעמיים, אז כאן לא מחלקים ב-2.',
        [`זוגות של קבוצות: ${L(`${n} × ${n - 1} ÷ 2 = ${H}`)}`, `כל זוג משחק פעמיים: ${L(`${H} × 2 = ${mB(ans)}`)}`, `קיצור: כל קבוצה מארחת בבית ${n - 1} קבוצות: ${L(`${n} × ${n - 1} = ${ans}`)}`], mPoly(n, 'קבוצה אחת'),
        `המלכודת: לחלק ב-2 מתוך הרגל (${H}). כאן כל זוג באמת משחק פעמיים.`, spot);
      q = withHint(mNum(d, `בליגה ${n} קבוצות. כל קבוצה משחקת נגד כל קבוצה אחרת פעמיים: פעם בבית ופעם בחוץ. כמה משחקים יהיו בליגה?`, '', ans, [H, n * n, (n - 1) * 2, ans + n], ex), `קודם: כמה זוגות של קבוצות יש? וכמה פעמים נפגש כל זוג?`, `זוגות: ${L(`${n} × ${n - 1} ÷ 2 = ${H}`)}. ועכשיו זכרו שכל זוג משחק פעמיים.`);
      q.meta = { K, n, H, why: mWhy([[H, 'זה מספר הזוגות, אבל כל זוג משחק פעמיים'], [n * n, 'כאילו כל קבוצה משחקת גם נגד עצמה']], ans) };
    } else {
      const ex = mEx('מספר הלחיצות = אורחים × (אורחים פחות 1) ÷ 2. כאן הולכים הפוך: מהלחיצות אל מספר האורחים.',
        [`${L(`${H} × 2 = ${2 * H}`)}: זו המכפלה של מספר האורחים במספר שלפניו`, `מחפשים שני מספרים צמודים שמכפלתם ${2 * H}: ${L(`${n} × ${n - 1} = ${2 * H}`)}`, `אורחים: ${mB(n)}`, `בדיקה: ${L(`${n} × ${n - 1} ÷ 2 = ${H}`)} ✓`],
        mTab(['אורחים', 'לחיצות ידיים'], [[n - 1, (n - 1) * (n - 2) / 2], [n, H], [n + 1, n * (n + 1) / 2]], 1), 'במבחן אפשר גם להציב כל תשובה בכלל, ולראות איזו נותנת בדיוק את מספר הלחיצות.', spot);
      q = withHint(mNum(d, `במסיבה כל שני אורחים לחצו ידיים פעם אחת בדיוק. היו ${H} לחיצות ידיים. כמה אורחים היו במסיבה?`, '', n, [n + 1, n - 1, n + 2, Math.round(H / 2)], ex), `אם יש מספר מסוים של אורחים, כל אחד לוחץ יד לכל השאר, וכל לחיצה נספרת פעמיים. נסו אחת התשובות: כמה לחיצות היא נותנת?`, `${L(`${H} × 2 = ${2 * H}`)}. חפשו שני מספרים צמודים שהמכפלה שלהם ${2 * H}.`);
      q.meta = { K, n, H, why: mWhy([[n + 1, `${n + 1} אורחים נותנים ${n * (n + 1) / 2} לחיצות`], [n - 1, `${n - 1} אורחים נותנים ${(n - 1) * (n - 2) / 2} לחיצות`], [n + 2, `${n + 2} אורחים נותנים ${(n + 1) * (n + 2) / 2} לחיצות`]], n) };
    }
    q.lk = 'pairs'; return q;
  },
  /* kind: 'when' (ages today, when will dad be m times), 'fut' (times now and in k years), 'past' (times now and k years ago), 'dad' (like fut, asks dad's age) */
  ages(d, kind) {
    for (let t0 = 0; ; t0++) {
      const K = kind || pick(d === 1 ? ['when'] : d === 2 ? ['fut', 'fut', 'when'] : ['fut', 'past', 'dad']);
      const p = pick(PEOPLE), nm = p[0], him = g(p, 'ממנו', 'ממנה'), bn = g(p, 'בן', 'בת'), his = g(p, 'שלו', 'שלה');
      const spot = '"מבוגר פי..." היום, ו"פי" אחר בעוד כמה שנים (או לפני). השאלה היא תמיד על ההפרש שלא משתנה.';
      if (K === 'when') {
        const m = pick([2, 3, 4]), t = ri(2, 10), y = ri(6, 20), c = y - t, D = (m - 1) * y, dad = c + D;
        if (c < 3 || dad < 26 || dad > 50) continue;
        const ex = mEx(`ההפרש בין הגילים לא משתנה לעולם: כל שנה גם ${nm} וגם אבא מתבגרים בשנה אחת.`,
          [`ההפרש: ${L(`${dad} − ${c} = ${D}`)} שנים, והוא יישאר ${D} תמיד`, m === 2 ? `כשאבא פי 2, ההפרש שווה בדיוק לגיל של ${nm}` : `כשאבא פי ${m}, ההפרש הוא ${mTimes(m - 1)} הגיל של ${nm}`, m === 2 ? `אז ${nm} ${g(p, 'יהיה', 'תהיה')} ${g(p, 'בן', 'בת')} ${D}` : `אז ${nm} ${g(p, 'יהיה', 'תהיה')} ${g(p, 'בן', 'בת')} ${L(`${D} ÷ ${m - 1} = ${y}`)}`, `עוד כמה שנים? ${L(`${y} − ${c} = ${mB(t)}`)}`, `בדיקה: בעוד ${t} שנים ${nm} ${y} ואבא ${dad + t}, ו-${L(`${m} × ${y} = ${dad + t}`)} ✓`],
          mAgesTL(nm, [['היום', c, dad], [`בעוד ${t} שנים`, y, dad + t]]), `המלכודת: לענות את הגיל של ${nm} אז (${y}) במקום מספר השנים.`, 'נותנים גילים של היום ושואלים מתי אבא יהיה "פי...". מחשבים את ההפרש, שלא משתנה, ומחלקים אותו.');
        const q = withHint(mNum(d, `היום ${nm} ${bn} ${c} ואבא ${his} בן ${dad}. בעוד כמה שנים אבא יהיה מבוגר ${him} פי&nbsp;${m} בדיוק?`, '', t, [y, D, t + 1, t - 1, t + 2], ex, ' שנים'),
          `מה ההפרש בין הגילים היום? ההפרש הזה לא ישתנה אף פעם.`, `ההפרש הוא ${D}. כשאבא פי ${m}, ההפרש הוא ${mTimes(m - 1)} הגיל של ${nm}. ${g(p, 'בן', 'בת')} כמה ${nm} אז, ובעוד כמה שנים זה?`);
        q.lk = 'ages'; q.meta = { K, nm, c, dad, D, m, y, t, why: mWhy([[y, `זה הגיל של ${nm} אז, לא מספר השנים`], [D, 'זה ההפרש בין הגילים']], t) };
        return q;
      }
      const past = K === 'past', [m1, m2] = pick(past ? [[3, 4], [3, 5], [4, 5], [2, 3], [5, 7]] : [[4, 3], [7, 5], [5, 4], [6, 5]]);
      /* today A × (age now) = B × (age then). Divided by their gcd: the age now is pNow parts, the age then pOth parts, one part apart, so a part is k years */
      const A = m1 - 1, B = m2 - 1, gg = mGcd(A, B), pNow = B / gg, pOth = A / gg, k = ri(2, 8), X = pNow * k, dad = m1 * X, Y = past ? X - k : X + k, dadY = past ? dad - k : dad + k;
      if (Math.abs(pNow - pOth) !== 1 || X < 3 || Y < 2 || dad < 26 || dad > 50) continue;
      const when = past ? `לפני ${k} שנים` : `בעוד ${k} שנים`, ans = K === 'dad' ? dad : X;
      const bar = mBar(past ? [[when, mRep(Y / k, k)], ['היום', mRep(Y / k, k).concat([[k, 'g']])]] : [['היום', mRep(X / k, k)], [when, mRep(X / k, k).concat([[k, 'g']])]], 'mparts', `<span class="mcap">כל משבצת היא ${k} שנים. המשבצת הצהובה היא ${k} השנים שבין שתי השורות.</span>`);
      const lines = [
        `היום אבא פי ${m1}, אז ההפרש ${A === 1 ? `שווה לגיל של ${nm} היום` : `הוא ${mTimes(A)} הגיל של ${nm} היום`}`,
        `${when} אבא ${past ? 'היה' : 'יהיה'} פי ${m2}, אז ההפרש ${B === 1 ? `שווה לגיל של ${nm} אז` : `הוא ${mTimes(B)} הגיל של ${nm} אז`}`,
        `זה אותו הפרש: ${A === 1 ? 'הגיל' : mTimes(A) + ' הגיל'} היום שווה ל${mTimes(B)} הגיל ${when}. זה נכון כשהגיל היום הוא ${pNow} חלקים, והגיל ${when} ${pOth === 1 ? 'חלק אחד' : `${pOth} חלקים`} (${L(`${A} × ${pNow} = ${B} × ${pOth}`)})${bar}`,
        `ההבדל בין שני הגילים הוא חלק אחד, והוא ${k} השנים. אז כל חלק הוא ${k} שנים`,
        K === 'dad' ? `${nm} היום: ${L(`${pNow} × ${k} = ${X}`)}` : `${nm} היום: ${L(`${pNow} × ${k} = ${mB(X)}`)}`,
        K === 'dad' ? `אבא היום: ${L(`${m1} × ${X} = ${mB(dad)}`)}` : '',
        `בדיקה: היום ${X} ו-${dad} (פי ${m1}). ${when}: ${Y} ו-${dadY} (פי ${m2}) ✓`];
      const rows = past ? [[when, Y, dadY], ['היום', X, dad]] : [['היום', X, dad], [when, Y, dadY]];
      const ex = mEx(`ההפרש בין הגילים לא משתנה לעולם: כל שנה גם ${nm} וגם אבא מתבגרים בשנה אחת. משווים את ההפרש של היום להפרש ${when}.`, lines, mAgesTL(nm, rows),
        `במבחן אפשר גם להציב כל תשובה: ${K === 'dad' ? 'הגיל של אבא, הגיל של ' + nm : 'הגיל של ' + nm + ', הגיל של אבא'}, ו${past ? 'פחות' : 'עוד'} ${k} שנים לשניהם. רק תשובה אחת נותנת פי ${m2}.`, spot);
      const prompt = past ? `היום אבא של ${nm} מבוגר ${him} פי&nbsp;${m1}. לפני ${k} שנים, אבא היה מבוגר ${him} פי&nbsp;${m2}. ${bn} כמה ${nm} היום?`
        : `היום אבא של ${nm} מבוגר ${him} פי&nbsp;${m1}. בעוד ${k} שנים, אבא יהיה מבוגר ${him} פי&nbsp;${m2}. ${K === 'dad' ? 'בן כמה אבא היום?' : `${bn} כמה ${nm} היום?`}`;
      const cands = K === 'dad' ? [X, dadY, m2 * X, dad + 2 * k] : past ? [Y, X + k, dad, k * pOth * 2] : [Y, k, dad, 2 * X];
      const h1 = `ההפרש בין הגילים לא משתנה עם השנים. היום אבא פי ${m1}, אז ההפרש הוא ${mTimes(A)} הגיל של ${nm} היום. ומה ההפרש ${when}?`;
      const h2 = `${A === 1 ? 'הגיל' : mTimes(A) + ' הגיל'} היום שווה ל${mTimes(B)} הגיל ${when}. אפשר גם לבדוק כל תשובה: מה הגילים של שניהם היום, ומה ${past ? 'היו' : 'יהיו'} ${when}? אבא ${past ? 'היה' : 'יהיה'} אז פי ${m2}?`;
      const q = withHint(mNum(d, prompt, '', ans, cands, ex), h1, h2);
      q.lk = 'ages'; q.meta = { K, nm, m1, m2, A, B, k, X, Y, dad, dadY, pNow, pOth, past, when, why: mWhy([[Y, `זה הגיל של ${nm} ${when}, לא היום`], [dad, 'זה הגיל של אבא'], [X, `זה הגיל של ${nm}`], [dadY, `זה הגיל של אבא ${when}`], [k, 'זה מספר השנים מהשאלה']], ans) };
      return q;
    }
  },
  trains(d) {
    const t = ri(2, 5), v1 = ri(4, 12) * 10, v2 = ri(4, 12) * 10, D = t * (v1 + v2);
    const ex = mEx('כשנוסעים זה לקראת זה, בכל שעה המרחק קטן בסכום המהירויות.',
      [`בכל שעה הרכבות מתקרבות ב-${L(`${v1} + ${v2} = ${v1 + v2}`)} ק"מ`, `שעות עד שנפגשות: ${L(`${D} ÷ ${v1 + v2} = ${mB(t)}`)}`, `בדיקה: ${L(`${v1 * t} + ${v2 * t} = ${D}`)} ק"מ`],
      mTrainTL(v1, v2, t, D));
    return withHint(mNum(d, `שתי רכבות יוצאות באותו רגע משתי ערים שהמרחק ביניהן ${D} ק"מ, ונוסעות זו לקראת זו. הראשונה נוסעת במהירות ${v1} קמ"ש, והשנייה במהירות ${v2} קמ"ש. אחרי כמה שעות ייפגשו?`, '', t, [t + 1, 2 * t, t - 1], ex, ' שעות'), `הרכבות נוסעות זו לקראת זו, אז בכל שעה שתיהן מקצרות את המרחק. בכמה ק"מ הן מתקרבות בשעה אחת?`, `בכל שעה המרחק קטן ב-${L(`${v1} + ${v2} = ${v1 + v2}`)} ק"מ. כמה שעות כאלה צריך כדי לסגור ${D} ק"מ?`);
  },
  chase(d) { for (;;) { const t = ri(2, 6), rel = ri(1, 4) * 10, h = ri(1, 3), head = t * rel; if (head % h) continue; const v1 = head / h; if (v1 < 30 || v1 > 90) continue; const v2 = v1 + rel;
    const ex = mEx('במרדף, בכל שעה הפער קטן בהפרש המהירויות.',
      [`כשב' יוצאת, א' כבר נסעה ${L(`${v1} × ${h} = ${head}`)} ק"מ. זה הפער`, `בכל שעה ב' מקטינה את הפער ב-${L(`${v2} − ${v1} = ${rel}`)} ק"מ`, `שעות עד שהפער נסגר: ${L(`${head} ÷ ${rel} = ${mB(t)}`)}`, `בדיקה: ב' נוסעת ${L(`${v2} × ${t} = ${v2 * t}`)}, וא' נוסעת ${L(`${v1} × ${t + h} = ${v1 * (t + h)}`)}`],
      mBar([['יתרון', mRep(h, v1, 'm')], ['סוגרים', mRep(t, rel, 'g')]], 'full', `<span class="mcap">שני הפסים הם אותו פער, ${head} ק"מ: למעלה ${mPl(h, 'שעה', 'שעות')} של ${v1}, למטה ${mPl(t, 'שעה', 'שעות')} של ${rel}.</span>`));
    return withHint(mNum(d, `מכונית א' יוצאת לדרך במהירות ${v1} קמ"ש. כעבור ${mPl(h, 'שעה', 'שעות')} יוצאת אחריה מכונית ב', באותה דרך, במהירות ${v2} קמ"ש. כמה שעות אחרי שיצאה תשיג מכונית ב' את מכונית א'?`, '', t, [t + h, t + 1, t - 1, head / v1], ex, ' שעות'), `כמה ק"מ הספיקה מכונית א' לנסוע לפני שב' יצאה? ובכמה ק"מ ב' מתקרבת אליה בכל שעה?`, `א' כבר רחוקה ${L(`${v1} × ${h} = ${head}`)} ק"מ, וב' מתקרבת ${L(`${v2} − ${v1} = ${rel}`)} ק"מ בכל שעה. כמה שעות לסגור את הפער?`); } },
  work(d) {
    const [a, b, ans] = pick([[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [6, 3, 2], [12, 4, 3], [15, 10, 6]]); const lc = (() => { let x = a, y = b; while (y) [x, y] = [y, x % y]; return a * b / x; })(); const pa = lc / a, pb = lc / b;
    const ex = mEx(`נותנים לבריכה מספר דליים שמתחלק בשני הזמנים, ובודקים כמה דליים נכנסים בשעה.`,
      [`נניח שהבריכה היא ${lc} דליים (${lc} מתחלק ב-${a} וב-${b})`, `ברז א' בשעה: ${L(`${lc} ÷ ${a} = ${pa}`)} ${pa === 1 ? 'דלי' : 'דליים'}`, `ברז ב' בשעה: ${L(`${lc} ÷ ${b} = ${pb}`)} ${pb === 1 ? 'דלי' : 'דליים'}`, `שניהם בשעה: ${L(`${pa} + ${pb} = ${pa + pb}`)} דליים`, `שעות: ${L(`${lc} ÷ ${pa + pb} = ${mB(ans)}`)}`], '',
      `בדיקה מהירה: יחד תמיד מהר יותר מהברז המהיר לבד (${Math.min(a, b)} שעות).`);
    return withHint(mNum(d, `ברז א' ממלא בריכה ב-${a} שעות, וברז ב' ממלא אותה ב-${b} שעות. אם פותחים את שניהם יחד, תוך כמה שעות תתמלא הבריכה?`, '', ans, [(a + b) / 2, Math.min(a, b), a + b, Math.abs(a - b)], ex, ' שעות'), `בשעה אחת ברז א' ממלא ${L(`1/${a}`)} מהבריכה. איזה חלק ממלא ברז ב' בשעה, וכמה שניהם יחד?`, `דמיינו בריכה של ${lc} דליים. כמה דליים ממלא כל ברז בשעה, וכמה שניהם יחד? בכמה שעות נכנסים ${lc} דליים?`);
  },
  percent(d) { for (;;) { const P = pick([100, 200, 400, 500, 800]), a = pick([10, 20, 25, 50]), b = pick([10, 20, 25, 50]); const ans = P * (100 + a) * (100 - b) / 10000; if (!Number.isInteger(ans) || !Number.isInteger(P * (100 + a) / 100) || ans === P) continue;
    const up = P * a / 100, P1 = P + up, down = P1 - ans;
    const ex = mEx('כל שינוי באחוזים מחושב מהמחיר שהיה רגע לפניו.',
      [`${L(`${a}%`)} זה ${PCW[a]}: ${L(`${P} ÷ ${100 / a} = ${up}`)}`, `אחרי העלייה: ${L(`${P} + ${up} = ${P1}`)}`, `${L(`${b}%`)} מ-${P1} זה ${PCW[b]}: ${L(`${P1} ÷ ${100 / b} = ${down}`)}`, `אחרי הירידה: ${L(`${P1} − ${down} = ${mB(ans)}`)}`], '',
      `המלכודת: לחשב את הירידה מ-${P}. היא מחושבת מהמחיר החדש, ${P1}.`);
    return withHint(mNum(d, `מחיר של משחק היה ${P} ₪. המחיר עלה ב-${a}%, ואחר כך ירד ב-${b}%. מה המחיר עכשיו?`, '', ans, [P + P * (a - b) / 100, P, P1], ex, ' ₪'), `קודם העלייה: כמה זה ${a}% מ-${P}? שימו לב שהירידה של ${b}% מחושבת מהמחיר החדש, לא מ-${P}.`, `אחרי העלייה: ${L(`${P} + ${up} = ${P1}`)}. עכשיו חשבו ${b}% מ-${P1} והורידו אותם.`); } },
  fraction(d) {
    const [f1, f2, nu, de, base] = pick([['1/3', '1/4', 1, 2, 12], ['1/2', '1/3', 1, 3, 6], ['1/4', '1/3', 1, 2, 12], ['2/5', '1/2', 3, 10, 10], ['1/3', '1/2', 1, 3, 6]]); const O = base * ri(3, 12), X = O * nu / de; const p = pick(PEOPLE);
    const [fn, fd] = f2.split('/').map(Number), [n1, d1] = f1.split('/').map(Number), R1 = Math.round(X * fd / (fd - fn)), rest2 = { '1/4': 'שלושה רבעים', '1/3': 'שני שלישים', '1/2': 'חצי' }[f2];
    /* the smallest strip of equal parts in which both spendings are whole parts */
    let U = 1; while ((U * n1) % d1 || ((U - U * n1 / d1) * fn) % fd) U++;
    const ub = U * n1 / d1, rest = U - ub, ug = rest * fn / fd, ul = rest - ug, one = X / ul;
    const pcs = n => mPl(n, 'חלק אחד', 'חלקים');
    const ex = mEx('מציירים את כל הכסף כפס של חלקים שווים, ומוצאים כמה שווה חלק אחד.',
      [`הפס: ${U} חלקים. הספר: ${FR[f1]} מהם, ${pcs(ub)}`, `נשארו ${pcs(rest)}. המשחק: ${FR[f2]} מהם, ${pcs(ug)}`, ul === 1 ? `נשאר חלק אחד, והוא ${X} ₪` : `נשארו ${pcs(ul)}, והם ${X} ₪. חלק אחד: ${L(`${X} ÷ ${ul} = ${one}`)} ₪`, `בהתחלה: ${L(`${U} × ${one} = ${mB(O)}`)} ₪`],
      mBar([['', mRep(ub, one, 'm').concat(mRep(ug, one, 'k'), mRep(ul, one, 'g'))]], '', mLeg([['m', 'ספר'], ['k', 'משחק'], ['g', 'נשאר']])));
    return withHint(mNum(d, `${p[0]} ${g(p, 'הוציא', 'הוציאה')} ${FR[f1]} מהכסף ${g(p, 'שלו', 'שלה')} על ספר, ואחר כך ${FR[f2]} ממה שנשאר על משחק. נשארו ${g(p, 'לו', 'לה')} ${X} ₪. כמה כסף היה ${g(p, 'לו', 'לה')} בהתחלה?`, '', O, [2 * X, X * 3, O / 2, O + X], ex, ' ₪'), `עבדו מהסוף להתחלה: ${X} ₪ נשארו אחרי ש${p[0]} ${g(p, 'הוציא', 'הוציאה')} ${FR[f2]} על המשחק. איזה חלק זה ממה שהיה לפני המשחק?`, `${X} ₪ הם ${rest2} ממה שהיה אחרי הספר, אז אחרי הספר היו ${R1} ₪. ואיזה חלק זה מהכסף שבהתחלה?`);
  },
  /* two bus lines (three at d 3 half the time) leave together at 8:00; when together again? kind: 2 or 3 lines */
  buses(d, kind) {
    const three = kind ? kind === 3 : d === 3 && R() < .5, NM = ['קו 5', 'קו 9', 'קו 12'];
    const P = three ? pick([[4, 6, 10], [6, 8, 12], [6, 10, 15], [10, 12, 15], [6, 9, 12], [8, 12, 20]]) : pick(d === 1 ? [[4, 6], [6, 8], [10, 15], [6, 9], [4, 10], [5, 6], [8, 12]] : [[12, 18], [15, 20], [10, 25], [12, 16], [20, 30], [6, 15], [18, 24]]);
    const l = mLcm(...P), [a, b, c] = P, big = P[P.length - 1], ls = P.map((v, i) => [NM[i], v]), prod = P.reduce((x, y) => x * y, 1);
    const opts = [l].concat(three ? [mLcm(a, b), mLcm(b, c), mLcm(a, c), 2 * l, l + c, l + a, a * c] : [a * b, a + b, b * 2, l + a, l + b, 2 * l]).filter((v, i, s) => s.indexOf(v) === i && v < 600 && v > 0).slice(0, 4);
    const m = mc(opts.map(TM)), ms = s => Array.from({ length: l / s }, (_, i) => (i + 1) * s).join(', '), hm = l >= 60 ? (l % 60 ? `, כלומר ${l < 120 ? 'שעה' : `${l / 60 | 0} שעות`} ו-${l % 60} דקות` : `, כלומר ${l === 60 ? 'שעה' : `${l / 60} שעות`}`) : '';
    const lines = three
      ? [`כותבים את הכפולות של ${big}, המספר הגדול: ${L(ms(big))}`, `בודקים כל אחת: האם היא מתחלקת גם ב-${a} וגם ב-${b}? הראשונה שעוברת: ${l}`, `${L(`${l} ÷ ${a} = ${l / a}`)}, ${L(`${l} ÷ ${b} = ${l / b}`)}, ${L(`${l} ÷ ${c} = ${l / c}`)}`, hm ? `${l} דקות${hm}` : '', `${L('8:00')} ועוד ${l} דקות: ${mB(TM(l))}`]
      : [`${NM[0]} יוצא אחרי: ${L(ms(a))} דקות`, `${NM[1]} יוצא אחרי: ${L(ms(b))} דקות`, `המספר הראשון שמופיע בשתי השורות: ${l} דקות${hm}`, `${L('8:00')} ועוד ${l} דקות: ${mB(TM(l))}`];
    const tip = three ? `המלכודת: לעצור במספר שמתחלק רק בשניים מהם (למשל ${mLcm(a, b) !== l ? mLcm(a, b) : mLcm(b, c)}).` : a * b !== l ? `המלכודת: ${L(`${a} × ${b} = ${a * b}`)} גם מתחלק בשניהם, אבל הוא לא הראשון.` : `כאן ל-${a} ול-${b} אין מחלק משותף, ולכן ${L(`${a} × ${b} = ${l}`)} הוא הראשון. זה לא תמיד כך.`;
    const ex = mEx(`הקווים ייצאו שוב יחד אחרי הכפולה המשותפת הקטנה ביותר: המספר הקטן ביותר שמתחלק ב${three ? 'כל הזמנים' : 'שני הזמנים'}.`, lines, mBusTL(ls, l), tip, '"שוב יחד", "באותו רגע", "בפעם הבאה ביחד". מחפשים כפולה משותפת קטנה.');
    const prompt = three ? `${NM[0]} יוצא מהתחנה כל ${a} דקות, ${NM[1]} כל ${b} דקות ו${NM[2]} כל ${c} דקות. בשעה ${L('8:00')} יצאו שלושתם יחד. באיזו שעה ייצאו שוב שלושתם יחד לראשונה?` : `${NM[0]} יוצא מהתחנה כל ${a} דקות, ו${NM[1]} יוצא כל ${b} דקות. בשעה ${L('8:00')} יצאו שניהם יחד. באיזו שעה ייצאו שוב יחד לראשונה?`;
    const q = withHint({ cat: 'math', d, lk: 'lcm', prompt, vis: '', options: m.options, answer: m.answer, ex },
      three ? `שלושת הקווים ייצאו יחד אחרי מספר דקות שמתחלק ב-${a}, ב-${b} וגם ב-${c}. התחילו מהכפולות של ${c}.` : `שני הקווים ייצאו יחד אחרי מספר דקות שמתחלק גם ב-${a} וגם ב-${b}. מה המספר הקטן ביותר כזה?`,
      three ? `כפולות של ${c}: ${c}, ${2 * c}, ${3 * c}... בדקו כל אחת: האם היא מתחלקת גם ב-${a} וגם ב-${b}? בסוף הוסיפו את הדקות ל-${L('8:00')}.` : `עברו על כפולות של ${b}, אחת אחרי השנייה. ${b} עצמו לא מתחלק ב-${a}. מה הכפולה הבאה? בסוף הוסיפו את הדקות ל-${L('8:00')}.`);
    q.meta = { P, l, three, why: mWhy([[TM(a * b), `${a} × ${b} מתחלק בשניהם, אבל יש מספר קטן יותר`], [TM(prod), 'מכפלה של כולם: מתחלקת, אבל לא הראשונה'], [TM(2 * l), 'גם זה זמן משותף, אבל השני ולא הראשון'], [TM(a + b), 'חיבור של הזמנים לא אומר כלום כאן'], [TM(l + a), 'הוסיפו עוד זמן אחרי המפגש'], [TM(l + b), 'הוסיפו עוד זמן אחרי המפגש'], [TM(l + (c || 0)), 'הוסיפו עוד זמן אחרי המפגש'], [TM(b * 2), `${b * 2} לא מתחלק ב-${a}`], ...(three ? [[TM(mLcm(a, b)), `מתחלק ב-${a} וב-${b}, אבל לא ב-${c}`], [TM(mLcm(b, c)), `מתחלק ב-${b} וב-${c}, אבל לא ב-${a}`], [TM(mLcm(a, c)), `מתחלק ב-${a} וב-${c}, אבל לא ב-${b}`]] : [])], TM(l)) };
    return q;
  },
  pages(d) {
    const N = ri(60, 250); const D = N < 100 ? 9 + 2 * (N - 9) : 189 + 3 * (N - 99);
    const lines = N >= 100
      ? [`עמודים ${L('1-9')}: ${L('9 × 1 = 9')} ספרות`, `עמודים ${L('10-99')}: ${L('90 × 2 = 180')} ספרות`, `עד עמוד 99: ${L('9 + 180 = 189')} ספרות`, `נשארו ${L(`${D} − 189 = ${D - 189}`)} ספרות`, `3 ספרות לכל עמוד: ${L(`${D - 189} ÷ 3 = ${N - 99}`)} עמודים`, `העמוד האחרון: ${L(`99 + ${N - 99} = ${mB(N)}`)}`]
      : [`עמודים ${L('1-9')}: ${L('9 × 1 = 9')} ספרות`, `נשארו ${L(`${D} − 9 = ${D - 9}`)} ספרות`, `2 ספרות לכל עמוד: ${L(`${D - 9} ÷ 2 = ${N - 9}`)} עמודים`, `העמוד האחרון: ${L(`9 + ${N - 9} = ${mB(N)}`)}`];
    const rows = N >= 100 ? [[L('1-9'), 9, 9], [L('10-99'), 90, 180], [L(`100-${N}`), N - 99, D - 189], ['הכל', N, D]] : [[L('1-9'), 9, 9], [L(`10-${N}`), N - 9, D - 9], ['הכל', N, D]];
    const ex = mEx('סופרים ספרות בקבוצות: עמודים של ספרה אחת, של שתי ספרות ושל שלוש.', lines, mTab(['עמודים', 'כמה עמודים', 'ספרות'], rows));
    return withHint(mNum(d, `במספור העמודים של ספר, מעמוד 1 עד העמוד האחרון, נכתבו ${D} ספרות בסך הכל. כמה עמודים יש בספר?`, '', N, [Math.round(D / 3), Math.round(D / 2), N + 9], ex), `כמה ספרות לוקחים כל העמודים החד-ספרתיים, וכמה כל הדו-ספרתיים? השוו את זה ל-${D} ספרות.`, N < 100 ? `עמודים ${L('1-9')} לוקחים 9 ספרות. נשארו ${L(`${D} − 9 = ${D - 9}`)} ספרות לעמודים הדו-ספרתיים, 2 לכל עמוד.` : N === 180 || N === 189 ? `עד עמוד 99 משתמשים ב-${L('9 + 90 × 2')} ספרות. מה שנשאר מ-${D} הולך לעמודים של 3 ספרות.` : `עמודים ${L('1-9')}: 9 ספרות. ${L('10-99')}: ${L('90 × 2 = 180')}. עד עמוד 99: 189, ונשארו ${D - 189} ספרות לעמודים של 3 ספרות.`);
  },
  workers(d) { for (;;) { const w = pick([4, 6, 8, 10, 12]), t = ri(3, 12), w2 = pick([2, 3, 4, 5, 6, 8, 15, 16, 20, 24]); if (w2 === w || (w * t) % w2) continue; const ans = w * t / w2; if (ans > 60) continue;
    const ex = mEx('סופרים את כל העבודה ב"ימי עבודה של פועל אחד", ומחלקים אותה בין הפועלים.',
      [`כל הקיר: ${L(`${w} × ${t} = ${w * t}`)} ימי עבודה של פועל אחד`, `${w2} פועלים מתחלקים בהם: ${L(`${w * t} ÷ ${w2} = ${mB(ans)}`)} ימים`], '',
      w2 > w ? 'יותר פועלים, אז פחות ימים (יחס הפוך).' : 'פחות פועלים, אז יותר ימים (יחס הפוך).');
    return withHint(mNum(d, `${w} פועלים בונים קיר ב-${t} ימים. בכמה ימים יבנו את אותו קיר ${w2} פועלים שעובדים באותו קצב?`, '', ans, [t * w2 / w, t + (w - w2), t, w * t], ex, ' ימים'), `${w} פועלים עובדים ${t} ימי עבודה כל אחד. כמה ימים היה לוקח לפועל אחד לבד לבנות את הקיר?`, `פועל אחד לבד: ${L(`${w} × ${t} = ${w * t}`)} ימי עבודה. עכשיו מחלקים אותם שווה בין ${w2} פועלים.`); } },
};
/* every lesson key has questions at every level, so a lesson can always find practice for it (genByKey) */
const MPOOL = { 1: ['consec', 'ratio', 'legs', 'average', 'handshake', 'ages', 'buses'], 2: ['handshake', 'ages', 'trains', 'work', 'percent', 'fraction', 'buses', 'consec', 'legs', 'ratio'], 3: ['chase', 'pages', 'workers', 'ages', 'fraction', 'percent', 'work', 'buses', 'ratio', 'handshake', 'consec'] };
function genMath(d) { return MT[pick(MPOOL[d])](d); }
/* themed math */
Object.assign(MT, {
  threes(d) { const s3 = ri(2, 8), s2 = ri(3, 10), P = 2 * s2 + 3 * s3, N = s2 + s3; const p = pick(PEOPLE);
    const ex = mEx('שיטת "נניח שכולם": מניחים שכל הסלים רגילים, ובודקים כמה נקודות חסרות.',
      [`אם כל ${N} הסלים רגילים: ${L(`${N} × 2 = ${2 * N}`)} נקודות`, `חסרות: ${L(`${P} − ${2 * N} = ${P - 2 * N}`)} נקודות`, `כל שלשה במקום סל רגיל מוסיפה נקודה אחת, אז השלשות: ${mB(s3)}`, `בדיקה: ${L(`${s3} × 3 + ${s2} × 2 = ${3 * s3} + ${2 * s2} = ${P}`)}`],
      mAssume(['שלשות', 'רגילים', 'נקודות'], N, 2, 1, s3), 'זה אותו טריק כמו "תרנגולות וארנבים".');
    return withHint(mNum(d, `במשחק כדורסל ${p[0]} ${g(p, 'קלע', 'קלעה')} ${N} סלים: חלקם רגילים (2 נקודות) וחלקם שלשות (3 נקודות). בסך הכל ${g(p, 'צבר', 'צברה')} ${P} נקודות. כמה שלשות ${g(p, 'קלע', 'קלעה')}?`, '', s3, [s2, Math.round(P / 3), s3 + 1, s3 - 1], ex), `נניח שכל ${N} הסלים היו רגילים, של 2 נקודות. כמה נקודות זה, וכמה חסר עד ${P}?`, `${N} סלים רגילים: ${L(`${N} × 2 = ${2 * N}`)} נקודות. כל שלשה במקום סל רגיל מוסיפה נקודה אחת. כמה חסר עד ${P}?`); },
  avgSport(d) { for (;;) { const n = ri(3, 5), A = ri(10, 22), B = A + ri(1, 3), need = B * (n + 1) - n * A; if (need > 45) continue; const p = pick(PEOPLE);
    return withHint(mNum(d, `${p[0]} ${g(p, 'קלע', 'קלעה')} בממוצע ${A} נקודות ב-${n} משחקי כדורסל. כמה נקודות ${g(p, 'הוא צריך', 'היא צריכה')} לקלוע במשחק הבא כדי שהממוצע יעלה ל-${B}?`, '', need, [B, B + (B - A), A + (B - A) * 2], mAvgEx(n, A, B, need, 'משחקים'), ' נקודות'), `ממוצע ${A} ב-${n} משחקים זה סכום של ${L(`${n} × ${A}`)} נקודות. איזה סכום נותן ממוצע ${B} ב-${n + 1} משחקים?`, `סכום נדרש: ${L(`${n + 1} × ${B} = ${B * (n + 1)}`)}. הסכום עכשיו: ${L(`${n} × ${A}`)}. כמה חסר?`); } },
  /* kind: 'per', 'area', 'sq' (square with the same perimeter), 'back' (from perimeter and length to area), 'lcut' (corner cut out) */
  rect(d, kind) { const ask = kind || pick(d === 1 ? ['per', 'per', 'area'] : d === 2 ? ['area', 'sq', 'back'] : ['sq', 'back', 'lcut']);
    const L0 = d === 1 ? ri(5, 14) : ri(6, 30), W0 = ri(d === 1 ? 3 : 4, L0 - 1);
    const spotPA = 'היקף = הדרך מסביב (מחברים צלעות). שטח = כמה ריבועים של 1 על 1 נכנסים בפנים (אורך × רוחב).';
    if (ask === 'per') { const ex = mEx('היקף הוא כל הדרך מסביב: שתי צלעות אורך ושתי צלעות רוחב.', [`${L(`${L0} + ${W0} + ${L0} + ${W0}`)}`, `${L(`= 2 × ${L0} + 2 × ${W0} = ${2 * L0} + ${2 * W0} = ${mB(2 * (L0 + W0))}`)} מטר`], mRect(L0, W0, true), `המלכודת: לכפול ${L(`${L0} × ${W0}`)}. זה השטח, לא ההיקף.`, spotPA);
      const q = withHint(mNum(d, `מגרש מלבני באורך ${L0} מטר וברוחב ${W0} מטר. מה ההיקף שלו?`, '', 2 * (L0 + W0), [L0 * W0, L0 + W0, 2 * L0 + W0], ex, ' מ׳'), `היקף הוא כל הדרך מסביב למגרש: ארבע צלעות. למגרש ${L0} על ${W0} יש שתי צלעות מכל אורך.`, `שתי צלעות האורך: ${L(`${L0} + ${L0} = ${2 * L0}`)}. הוסיפו את שתי צלעות הרוחב, ${W0} כל אחת.`);
      q.lk = 'geometry'; q.meta = { ask, why: mWhy([[L0 * W0, 'זה השטח'], [L0 + W0, 'רק חצי מהדרך מסביב'], [2 * L0 + W0, 'חסרה צלע אחת']], 2 * (L0 + W0)) }; return q; }
    if (ask === 'area') { const tn = L0 - L0 % 10, on = L0 % 10, sp = L0 >= 10 && on;
      const ex = mEx('שטח מלבן = אורך × רוחב.', sp ? [`מפרקים את ${L0} ל-${tn} ועוד ${on}:`, `${L(`${tn} × ${W0} = ${tn * W0}`)}`, `${L(`${on} × ${W0} = ${on * W0}`)}`, `${L(`${tn * W0} + ${on * W0} = ${mB(L0 * W0)}`)} מ"ר`] : [`${L(`${L0} × ${W0} = ${mB(L0 * W0)}`)} מ"ר`], mRect(L0, W0, false, L0, W0, sp ? tn : 0), 'היקף (הדרך מסביב) ושטח (כמה ריבועים בפנים) הם שני דברים שונים.', spotPA);
      const q = withHint(mNum(d, `מגרש מלבני באורך ${L0} מטר וברוחב ${W0} מטר. מה השטח שלו?`, '', L0 * W0, [2 * (L0 + W0), L0 * W0 + L0, (L0 + W0) * 2 + 10], ex, ' מ"ר'), `דמיינו את המגרש מחולק לריבועים של מטר על מטר: ${W0} שורות, ובכל שורה ${L0} ריבועים. כמה ריבועים בסך הכל?`, L0 < 10 ? `${W0} שורות של ${L0}: ${L0}, ${2 * L0}... המשיכו לספור בקפיצות של ${L0} עד ${W0} שורות.` : on === 0 ? `${L(`${L0 / 10} × ${W0} = ${L0 / 10 * W0}`)}, ועכשיו כפלו ב-10.` : `פרקו את ${L0} ל-${tn} ו-${on}: ${L(`${tn} × ${W0} = ${tn * W0}`)}, ועוד ${L(`${on} × ${W0} = ${on * W0}`)}. חברו.`);
      q.lk = 'geometry'; q.meta = { ask, why: mWhy([[2 * (L0 + W0), 'זה ההיקף']], L0 * W0) }; return q; }
    if (ask === 'back') { let l, w; do { l = ri(5, 15); w = ri(3, l - 1); } while (l * w === 2 * (l + w)); const P = 2 * (l + w), h = l + w, ans = l * w;
      const ex = mEx('חצי מההיקף הוא אורך אחד ועוד רוחב אחד. ממנו מוצאים את הרוחב, ואז את השטח.',
        [`חצי היקף: ${L(`${P} ÷ 2 = ${h}`)}, וזה אורך + רוחב`, `הרוחב: ${L(`${h} − ${l} = ${w}`)} ס"מ`, `השטח: ${L(`${l} × ${w} = ${mB(ans)}`)} סמ"ר`, `בדיקה: ${L(`${l} + ${w} + ${l} + ${w} = ${P}`)} ✓`],
        mRect(l, w, true, l, '?'), `המלכודת: לחשב רוחב = ${L(`${P} − ${l} = ${P - l}`)}. בהיקף יש שני אורכים ושני רוחבים.`, spotPA);
      const q = withHint(mNum(d, `ההיקף של מלבן הוא ${P} ס"מ, והאורך שלו ${l} ס"מ. מה השטח של המלבן?`, '', ans, [2 * ans, l * (P - l), P * l / 2 | 0, l * h], ex, ' סמ"ר'), `ציירו את המלבן. בהיקף יש שני אורכים ושני רוחבים. כמה ס"מ נשארים לשני הרוחבים יחד?`, `שני האורכים: ${L(`${l} + ${l} = ${2 * l}`)}. מה שנשאר מ-${P} הוא שני רוחבים. כמה זה רוחב אחד?`);
      q.lk = 'geometry'; q.meta = { ask, l, w, P, h, why: mWhy([[2 * ans, 'הרוחב חושב כפול: שכחו לחלק ב-2'], [l * (P - l), `הורידו רק אורך אחד מההיקף`], [l * h, 'כפלו באורך + רוחב, במקום ברוחב']], ans) }; return q; }
    if (ask === 'lcut') { const A = ri(8, 16), B = ri(5, A - 1), s = ri(2, B - 2), per = R() < .5, P = 2 * (A + B), ar = A * B - s * s, ans = per ? P : ar;
      const ex = per ? mEx('כשחותכים ריבוע מפינה, שתי הצלעות שלו שהיו בחוץ נעלמות, ושתי צלעות באותו אורך מופיעות בפנים. ההיקף לא משתנה.',
        [`הצלעות שנגזרו: ${s} ו-${s}. הצלעות החדשות בפנים: גם ${s} ו-${s}`, `אז ההיקף הוא כמו של המלבן השלם: ${L(`2 × (${A} + ${B}) = ${mB(P)}`)} ס"מ`, `בדיקה, צלע אחרי צלע: ${L(`${A - s} + ${s} + ${s} + ${B - s} + ${A} + ${B} = ${P}`)}`], mLShape(A, B, s), `המלכודת: להוריד ${L(`2 × ${s}`)} או ${L(`4 × ${s}`)} מההיקף. השטח קטן, אבל ההיקף לא.`, 'צורה שנוצרה מגזירת פינה ושואלים על היקף. בודקים אילו צלעות רק "זזו".')
        : mEx('שטח של צורה עם פינה חסרה: השטח של המלבן השלם, פחות השטח של מה שנגזר.',
          [`המלבן השלם: ${L(`${A} × ${B} = ${A * B}`)} סמ"ר`, `הריבוע שנגזר: ${L(`${s} × ${s} = ${s * s}`)} סמ"ר`, `נשאר: ${L(`${A * B} − ${s * s} = ${mB(ar)}`)} סמ"ר`], mLShape(A, B, s), `שימו לב: השטח קטן, אבל ההיקף נשאר ${P}.`, 'צורה עם חלק חסר. מחשבים את השלם ומורידים את החסר.');
      const prompt = `ממלבן באורך ${A} ס"מ וברוחב ${B} ס"מ גזרו ריבוע של ${s} ס"מ על ${s} ס"מ מאחת הפינות. מה ${per ? 'ההיקף' : 'השטח'} של הצורה שנשארה?`;
      const q = withHint(mNum(d, prompt, '', ans, per ? [P - 2 * s, P - 4 * s, P + 2 * s, ar] : [A * B, A * B - 2 * s, A * B - 4 * s, P], ex, per ? ' ס"מ' : ' סמ"ר'),
        per ? `ציירו את הצורה. מה קרה לשתי הצלעות של הפינה שנגזרה? ומה הופיע במקומן?` : `חשבו קודם את השטח של המלבן השלם, ${A} על ${B}. כמה ממנו נגזר?`,
        per ? `במקום שתי צלעות של ${s} שנעלמו מבחוץ, מופיעות שתי צלעות של ${s} בפנים. אז ההיקף שווה להיקף של איזה מלבן?` : `המלבן השלם: ${L(`${A} × ${B} = ${A * B}`)}. הריבוע שנגזר: ${L(`${s} × ${s}`)}. מה נשאר?`);
      q.lk = 'geometry'; q.meta = { ask, why: per ? mWhy([[P - 2 * s, 'הורידו צלעות, אבל צלעות חדשות הופיעו בפנים'], [P - 4 * s, 'הורידו את כל ההיקף של הריבוע'], [ar, 'זה השטח']], P) : mWhy([[A * B, 'שכחו להוריד את מה שנגזר'], [P, 'זה ההיקף']], ar) }; return q; }
    const s = ri(3, 12), a = ri(1, s - 1), b = 2 * s - a;
    const ex = mEx('מוצאים את ההיקף, מחלקים אותו ב-4 כדי לקבל צלע של ריבוע, ואז צלע × צלע.',
      [`היקף המלבן: ${L(`2 × (${b} + ${a}) = ${2 * (a + b)}`)}`, `לריבוע 4 צלעות שוות: ${L(`${2 * (a + b)} ÷ 4 = ${s}`)}`, `שטח הריבוע: ${L(`${s} × ${s} = ${mB(s * s)}`)} סמ"ר`], mRectSq(b, a, s),
      `שטח הריבוע גדול משטח המלבן (${a * b}): מכל המלבנים עם אותו היקף, לריבוע יש השטח הגדול ביותר.`, spotPA);
    const q = withHint(mNum(d, `לריבוע יש אותו היקף כמו למלבן באורך ${b} ס"מ וברוחב ${a} ס"מ. מה השטח של הריבוע?`, '', s * s, [a * b, 4 * s, s * s + s, 2 * (a + b)], ex, ' סמ"ר'), `קודם מצאו את ההיקף של המלבן ${b} על ${a}. לריבוע אותו היקף, וכל ארבע הצלעות שלו שוות.`, `${L(`${b} + ${a} = ${a + b}`)} זה חצי מההיקף. צלע הריבוע היא רבע מכל ההיקף, כלומר חצי מ-${a + b}. ואז שטח = צלע כפול צלע.`);
    q.lk = 'geometry'; q.meta = { ask, why: mWhy([[a * b, 'זה השטח של המלבן, לא של הריבוע'], [4 * s, 'זה ההיקף של הריבוע'], [2 * (a + b), 'זה ההיקף']], s * s) }; return q; },
  remainder(d) { const [a, b] = pick([[3, 4], [4, 5], [3, 5], [5, 6], [4, 7]]), r0 = ri(1, Math.min(a, b) - 1); const l = a * b; const ans = l + r0;
    const left = r0 === 1 ? 'נשאר ממתק אחד' : `נשארים ${r0} ממתקים`;
    const ex = mEx('מורידים את מה שנשאר בחוץ. מה שנשאר אחרי זה מתחלק בשני המספרים.',
      [`בלי ה-${r0} שבחוץ, המספר מתחלק גם ב-${a} וגם ב-${b}`, `ל-${a} ול-${b} אין מחלק משותף, אז הכפולה המשותפת הקטנה: ${L(`${a} × ${b} = ${l}`)}`, `מחזירים את ה-${r0}: ${L(`${l} + ${r0} = ${mB(ans)}`)}`, `בדיקה: ${L(`${ans} ÷ ${a} = ${l / a}`)} ושארית ${r0}, ${L(`${ans} ÷ ${b} = ${l / b}`)} ושארית ${r0}`]);
    return withHint(mNum(d, `מחלקים ממתקים לשקיות. כששמים ${a} ממתקים בכל שקית, ${left} בחוץ. כששמים ${b} בכל שקית, גם ${left} בחוץ. מהו המספר הקטן ביותר של ממתקים שיכול להיות (יותר מ-${r0})?`, '', ans, [l, l - r0, ans + l], ex), `מה קורה אם מוציאים קודם ${r0 === 1 ? 'ממתק אחד' : r0 + ' ממתקים'} בצד? המספר שנשאר מתחלק בדיוק גם ב-${a} וגם ב-${b}.`, `ל-${a} ול-${b} אין מחלק משותף, אז הכפולה המשותפת הקטנה היא ${L(`${a} × ${b} = ${l}`)}. אבל זה בלי ה-${r0} שבצד.`); },
  tempo(d) { const bpm = pick([60, 80, 90, 100, 120, 150]), s = pick([15, 20, 30, 45, 90]); const ans = bpm * s / 60; if (!Number.isInteger(ans)) return MT.tempo(d);
    const who = pick(PEOPLE), gd = (x, y) => y ? gd(y, x % y) : x, k = gd(s, 60), nu = s / k, de = 60 / k;
    const ex = mEx('מוצאים איזה חלק מדקה הם השניות, ולוקחים אותו חלק מהפעימות.',
      [`${s} שניות הן ${L(`${s}/60 = ${nu}/${de}`)} של דקה${s === 90 ? ' (דקה וחצי)' : ''}`, nu === 1 ? `${L(`${bpm} ÷ ${de} = ${mB(ans)}`)} פעימות` : `${L(`${bpm} ÷ ${de} = ${bpm / de}`)}, ואז ${L(`${bpm / de} × ${nu} = ${mB(ans)}`)} פעימות`]);
    return withHint(mNum(d, `מטרונום מתקתק בקצב של ${bpm} פעימות בדקה. כמה פעימות ${g(who, 'ישמע', 'תשמע')} ${who[0]} ב-${s} שניות של תרגול פסנתר?`, '', ans, [bpm, s, 2 * ans, ans + bpm / de], ex, ' פעימות'), ans === 60 ? `איזה חלק מדקה שלמה הם ${s} שניות? אותו חלק מ-${bpm} הפעימות נשמע בהם.` : `בדקה יש 60 שניות. איזה חלק מדקה הם ${s} שניות? אותו חלק מ-${bpm} הפעימות נשמע בהם.`, bpm % 30 === 0 && ans !== 60 ? `בכל שנייה: ${L(`${bpm} ÷ 60 = ${fmt(bpm / 60)}`)} ${bpm === 60 ? 'פעימה' : 'פעימות'}. כמה פעימות ב-${s} שניות?` : `בכל 3 שניות יש ${bpm / 20} פעימות (בדקה יש עשרים פעמים 3 שניות). כמה פעמים 3 שניות נכנסות ב-${s} שניות?`); },
  ticket(d) { for (;;) { const P = pick([80, 120, 150, 200, 240, 300]), a = pick([10, 20, 25, 50]); const disc = P * a / 100; if (!Number.isInteger(disc) || (d > 1 && P === 100 - a)) continue; /* 80 ₪ with 20% off would put the answer in the hint ("80%") */ const what = pick(['כרטיס למשחק כדורגל', 'חולצת כדורסל', 'כרטיס להופעה', 'משחק מחשב חדש']);
    const parts = 100 / a, bar = mBar([['', mRep(parts - 1, disc).concat([[disc, 'm']])]], '', mLeg([['', 'משלמים'], ['m', 'ההנחה']]) + `<span class="mcap">כל משבצת היא ${L(`${a}%`)} מהמחיר, ${disc} ₪.</span>`);
    if (d === 1) { const ex = mEx('מחשבים כמה שקלים היא ההנחה, ומורידים אותם מהמחיר.', [`${L(`${a}%`)} זה ${PCW[a]}: ${L(`${P} ÷ ${parts} = ${disc}`)} ₪ הנחה`, `משלמים: ${L(`${P} − ${disc} = ${mB(P - disc)}`)} ₪`], bar);
      return withHint(mNum(d, `${what} עולה ${P} ₪. יש הנחה של ${a}%. כמה ישלמו?`, '', P - disc, [disc, P - a, P + disc], ex, ' ₪'), `כמה שקלים הם ${a}% מ-${P}? רמז: ${a}% זה ${PCW[a]}. ואז זכרו שזו ההנחה, לא המחיר.`, a === 50 ? `50% זה חצי, אז מורידים חצי מ-${P}. מה שנשאר לשלם הוא החצי השני.` : `${a}% מ-${P} הם ${disc} ₪. זה הסכום שמורידים מהמחיר. כמה נשאר לשלם?`); }
    const after = P - disc, kp = `${100 - a}%`, wrong = Math.round(after * (1 + a / 100));
    const ex = mEx(`אחרי הנחה של ${L(`${a}%`)} משלמים ${L(kp)} מהמחיר המקורי. מוצאים כמה שווה חלק אחד של ${L(`${a}%`)}.`,
      a === 50 ? [`${after} ₪ הם חצי מהמחיר המקורי`, `המחיר המקורי: ${L(`${after} × 2 = ${mB(P)}`)} ₪`] : [`${L(kp)} הם ${parts - 1} חלקים של ${L(`${a}%`)}: ${L(`${after} ÷ ${parts - 1} = ${disc}`)} ₪ לחלק`, `המחיר המקורי הוא ${parts} חלקים: ${L(`${parts} × ${disc} = ${mB(P)}`)} ₪`], bar,
      `המלכודת: להוסיף ${a}% ל-${after}. זה נותן ${wrong}, כי האחוזים מחושבים מהמחיר המקורי ולא מ-${after}.`);
    return withHint(mNum(d, `אחרי הנחה של ${a}%, ${what} עולה ${after} ₪. מה היה המחיר המקורי?`, '', P, [wrong, after + a, after * 2], ex, ' ₪'), `אחרי הנחה של ${a}% משלמים רק ${kp} מהמחיר המקורי. אז ${after} ₪ הם ${kp} ממנו, לא 100%.`, a === 50 ? `${after} ₪ הם חצי מהמחיר המקורי. אם זה חצי, כמה השלם?` : `${kp} הם ${parts - 1} חלקים של ${a}%. חלק אחד: ${L(`${after} ÷ ${parts - 1} = ${disc}`)} ₪. כמה חלקים כאלה ב-100%?`); } },
  prob(d) { const r = ri(2, 6), b = ri(2, 7), gg = d === 3 ? ri(1, 4) : 0, T = r + b + gg;
    const gcd = (x, y) => y ? gcd(y, x % y) : x; const fr = (n, m) => { if (n <= 0 || n >= m) return null; const k = gcd(n, m); return L(`${n / k}/${m / k}`); };
    const ans = fr(r, T), opts = [ans, fr(r, b), fr(b, T), gg ? fr(r, b + gg) : null, fr(1, r), fr(1, T), fr(r + 1, T), fr(r - 1, T), fr(r + 2, T), fr(1, b), fr(r, T + r)].filter((v, i, s) => v && s.indexOf(v) === i).slice(0, 4);
    const m = mc(opts), red = gcd(r, T) > 1;
    const ex = mEx('סיכוי = כמה כדורים מתאימים ÷ כמה כדורים יש בסך הכל.',
      [`בסך הכל: ${L(`${r} + ${b}${gg ? ` + ${gg}` : ''} = ${T}`)} כדורים`, `אדומים: ${r}`, `הסיכוי: ${L(`${r}/${T}`)}${red ? ` = ${mB(ans)} (צמצמנו ב-${gcd(r, T)})` : ` = ${mB(ans)}`}`],
      mDots([[r, 'rd'], [b, 'bl'], [gg, 'gr']]), `המלכודת: אדומים חלקי כחולים (${L(`${r}/${b}`)}). זה יחס, לא סיכוי.`);
    return withHint({ cat: 'math', d, prompt: `בשקית ${r} כדורים אדומים, ${b} כחולים${gg ? (gg === 1 ? ' וכדור ירוק אחד' : ` ו-${gg} ירוקים`) : ''}. מוציאים כדור אחד בלי להסתכל. מה הסיכוי שהוא אדום?`, vis: '', options: m.options, answer: m.answer, ex }, `יש ${r} אדומים. הסיכוי הוא האדומים חלקי כל הכדורים בשקית, לא חלקי ${gg ? 'הכחולים או הירוקים' : 'הכחולים'}. כמה כדורים יש בסך הכל?`, `בסך הכל: ${L(`${r} + ${b}${gg ? ` + ${gg}` : ''} = ${T}`)} כדורים, ומהם ${r} אדומים. כתבו את זה כשבר וצמצמו אם אפשר.`); },
});
MPOOL[1].push('threes', 'rect', 'tempo', 'ticket');
MPOOL[2].push('threes', 'avgSport', 'rect', 'prob', 'ticket', 'tempo');
MPOOL[3].push('remainder', 'rect', 'prob', 'ticket', 'avgSport');
/* sprint (mental arithmetic) */
function genSprint(Lv) {
  const t = pick(Lv === 1 ? ['add', 'sub', 'mul', 'mul'] : Lv === 2 ? ['add', 'sub', 'mul', 'div', 'half', 'mul'] : ['mul', 'div', 'pct', 'sq', 'add3', 'sub', 'mul']);
  switch (t) {
    case 'add': { const a = ri(12, 89), b = ri(11, 79); return { q: `${a} + ${b}`, a: a + b }; }
    case 'sub': { const a = ri(40, 150), b = ri(11, a - 5); return { q: `${a} − ${b}`, a: a - b }; }
    case 'mul': { const m = Lv === 1 ? 9 : 12; const a = ri(2, m), b = ri(2, m); return { q: `${a} × ${b}`, a: a * b }; }
    case 'div': { const b = ri(2, 12), q = ri(2, 12); return { q: `${b * q} ÷ ${b}`, a: q }; }
    case 'half': { const n = ri(10, 99) * 2; return { q: `½ × ${n}`, a: n / 2 }; }
    case 'pct': { const p = pick([10, 20, 25, 50, 75]), n = pick([40, 60, 80, 120, 200, 400]); return { q: `${p}% × ${n}`, a: p * n / 100 }; }
    case 'sq': { const n = ri(11, 19); return { q: `${n}²`, a: n * n }; }
    default: { const a = ri(11, 49), b = ri(11, 49), c = ri(11, 49); return { q: `${a} + ${b} + ${c}`, a: a + b + c }; }
  }
}
/* supermarket */
const GROC = [['במבה', 4.9], ['ביסלי', 5.5], ['חלב', 6.2], ['לחם', 7.5], ['שוקו', 5], ['קוטג׳', 5.9], ['פיתות', 8], ['גבינה צהובה', 14], ['עגבניות', 9.8], ['שוקולד', 6.5], ['מים מינרליים', 3.5], ['תפוחים', 12], ['ופלים', 8.9], ['קורנפלקס', 18.9], ['ביצים', 13], ['אורז', 9], ['פסטה', 6], ['טחינה', 11.5]];
const money = v => { const r = Math.round(v * 100) / 100; return Number.isInteger(r) ? String(r) : r.toFixed(2); };
const r2 = v => Math.round(v * 100) / 100;
function genKupa(Lv) {
  const ints = GROC.filter(g => Number.isInteger(g[1]));
  if (Lv === 1) { const it = shuffle(ints).slice(0, 2); return { items: it, ask: 'total', a: r2(it[0][1] + it[1][1]) }; }
  if (Lv === 2) {
    if (R() < .5) { const it = shuffle(GROC).slice(0, 2); return { items: it, ask: 'total', a: r2(it[0][1] + it[1][1]) }; }
    const it = shuffle(ints).slice(0, 2), tot = it[0][1] + it[1][1], pay = tot < 20 ? 20 : 50; return { items: it, ask: 'change', pay, a: r2(pay - tot) };
  }
  const t = pick(['change', 'change', 'disc', 'total3']);
  if (t === 'disc') { const it = pick(GROC.filter(g => [8, 12, 14, 6, 5, 13, 9].includes(g[1]))), p = pick([10, 25, 50]); return { items: [it], ask: 'disc', pct: p, a: r2(it[1] * (100 - p) / 100) }; }
  if (t === 'total3') { const it = shuffle(GROC).slice(0, 3); return { items: it, ask: 'total', a: r2(it.reduce((s, g) => s + g[1], 0)) }; }
  const it = shuffle(GROC).slice(0, 2), tot = r2(it[0][1] + it[1][1]), pay = tot < 20 ? 20 : tot < 50 ? 50 : 100; return { items: it, ask: 'change', pay, a: r2(pay - tot) };
}
Object.assign(MT, {
  change(d) {
    const it = shuffle(GROC).slice(0, d === 1 ? 2 : 3), tot = r2(it.reduce((s, g) => s + g[1], 0)), pay = tot < 20 ? 20 : tot < 50 ? 50 : 100, ans = r2(pay - tot);
    const opts = [ans, r2(ans + 1), r2(ans - .1 > 0 ? ans - .1 : ans + .2), r2(ans + .9)].filter((v, i, s) => s.indexOf(v) === i);
    while (opts.length < 4) opts.push(r2(ans + opts.length * .5));
    const m = mc(opts.map(v => L(money(v)) + ' ₪'));
    const up = Math.ceil(tot), gap = r2(up - tot);
    const ex = mEx('מחברים את המחירים, ואז "משלימים" מהסכום עד השטר, כמו קופאי.',
      [`הסכום: ${L(`${it.map(g => money(g[1])).join(' + ')} = ${money(tot)}`)} ₪`].concat(up > tot && up < pay
        ? [`משלימים לשקל שלם: ${L(`${money(tot)} + ${money(gap)} = ${up}`)}`, `משלימים עד השטר: ${L(`${up} + ${pay - up} = ${pay}`)}`, `העודף: ${L(`${money(gap)} + ${pay - up} = ${mB(money(ans))}`)} ₪`]
        : [`העודף: ${L(`${pay} − ${money(tot)} = ${mB(money(ans))}`)} ₪`]));
    return withHint({ cat: 'math', d, prompt: `בסופרמרקט קנו ${it.map(g => `${g[0]} (${money(g[1])} ₪)`).join(', ')}. שילמו בשטר של ${pay} ₪. כמה עודף צריך לקבל?`, vis: '', options: m.options, answer: m.answer, ex }, `קודם חברו את המחירים: ${L(it.map(g => money(g[1])).join(' + '))}. אחר כך בדקו כמה חסר מהסכום עד ${pay}.`, up > tot && up < pay ? `הסכום: ${L(money(tot))}. משלימים לשקל שלם: ${L(`${money(tot)} + ${money(gap)} = ${up}`)}. ועכשיו כמה מ-${up} עד ${pay}?` : `הסכום: ${L(money(tot))}. כמה צריך להוסיף לזה כדי להגיע ל-${pay}? התחילו מהאגורות.`);
  },
  /* price per item. kind: 'one' (price of one item in the better pack), 'save' (how much you save on the same number of items) */
  unit(d, kind) {
    const IT = [['שקיות שוקו', 'שקית שוקו', 'f', 'שקיות השוקו'], ['יוגורטים', 'יוגורט', 'm', 'היוגורטים'], ['מחברות', 'מחברת', 'f', 'המחברות'], ['עפרונות', 'עיפרון', 'm', 'העפרונות'], ['כדורי טניס', 'כדור טניס', 'm', 'כדורי הטניס'], ['בקבוקי מים', 'בקבוק מים', 'm', 'בקבוקי המים']];
    for (;;) {
      const [pl, sg, gd, plD] = pick(IT), one = `${sg} ${gd === 'f' ? 'אחת' : 'אחד'}`, K = kind || (d === 3 && R() < .5 ? 'save' : 'one');
      const U = d === 1 ? [2, 3, 4, 5, 6, 7, 8, 9] : [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7], a = K === 'save' ? pick([2, 3, 4, 6]) : ri(3, 8), b = K === 'save' ? pick([3, 4, 6, 8]) : ri(2, 8), ua = pick(U), ub = pick(U);
      if (a === b || ua === ub || Math.abs(ua - ub) > 2.5) continue;
      if (d === 2 && K === 'one' && Number.isInteger(ua) && Number.isInteger(ub)) continue; /* level 2 always has a half shekel to divide */
      const pa = a * ua, pb = b * ub; if (pa > 60 || pb > 60) continue;
      const best = Math.min(ua, ub), worse = Math.max(ua, ub), [bn, bp] = ua < ub ? [a, pa] : [b, pb], [wn, wp] = ua < ub ? [b, pb] : [a, pa];
      /* "27.50 ÷ 5" without a calculator: whole shekels first, then what is left in agorot */
      const div = (P, n) => { const u = P / n, w = Math.floor(u), rest = P - w * n, ag = Math.round(rest * 100); return `${L(`${money(P)} ÷ ${n} = ${money(u)}`)} ₪` + (Number.isInteger(u) ? '' : `<i class="msub">איך: ${L(`${w * n} ÷ ${n} = ${w}`)}. נשארו ${money(rest)} ₪, שהם ${ag} אגורות. ${L(`${ag} ÷ ${n} = ${ag / n}`)} אגורות.</i>`); };
      const pic = mPacks([[a, pa, ua], [b, pb, ub]], best, one), cheapTot = pa < pb ? a : b, trapTot = cheapTot !== bn;
      if (K === 'save') {
        const N = mLcm(a, b) < 12 ? 2 * mLcm(a, b) : mLcm(a, b); if (N > 24) continue;
        const Ta = N / a * pa, Tb = N / b * pb, ans = Math.abs(Ta - Tb); if (!Number.isInteger(ans) || [Ta, Tb, N / a, N / b].includes(ans)) continue;
        const p = pick(PEOPLE), nm = p[0];
        const ex = mEx(`משווים את אותה כמות: כמה עולים ${N} ${pl} בכל סוג של חבילה.`,
          [`חבילות של ${a}: ${L(`${N} ÷ ${a} = ${N / a}`)} חבילות, ${L(`${N / a} × ${money(pa)} = ${money(Ta)}`)} ₪`, `חבילות של ${b}: ${L(`${N} ÷ ${b} = ${N / b}`)} חבילות, ${L(`${N / b} × ${money(pb)} = ${money(Tb)}`)} ₪`, `חוסכים: ${L(`${money(Math.max(Ta, Tb))} − ${money(Math.min(Ta, Tb))} = ${mB(money(ans))}`)} ₪`],
          pic, `דרך נוספת: ${L(`${money(ua)}`)} ₪ מול ${L(`${money(ub)}`)} ₪ ל${sg}. ההפרש ${L(money(worse - best))} ₪, כפול ${N}: ${L(`${money(worse - best)} × ${N} = ${money(ans)}`)}.`,
          'שתי חבילות בגדלים שונים, ושואלים מה משתלם או כמה חוסכים. משווים מחיר ליחידה, או מחיר של אותה כמות.');
        const opts = [ans, Math.abs(pa - pb), worse - best, Math.min(Ta, Tb), ans * 2, ans + N / 2].filter((v, i, s) => v > 0 && Number.isInteger(v * 2) && s.indexOf(v) === i).slice(0, 4);
        while (opts.length < 4) opts.push(ans + opts.length);
        const m = mc(opts.map(v => L(money(v)) + ' ₪'));
        const q = withHint({ cat: 'math', d, lk: 'unit', prompt: `${nm} ${g(p, 'צריך', 'צריכה')} בדיוק ${N} ${pl}. יש חבילות של ${a} ב-${money(pa)} ₪, ויש חבילות של ${b} ב-${money(pb)} ₪. ${nm} ${g(p, 'קונה', 'קונה')} רק סוג אחד של חבילות. כמה ${g(p, 'יחסוך', 'תחסוך')} אם ${g(p, 'יבחר', 'תבחר')} בסוג המשתלם?`, vis: '', options: m.options, answer: m.answer, ex },
          `השוו את אותה כמות. כמה חבילות של ${a} צריך כדי לקבל ${N}, וכמה הן עולות? ואותו דבר עם חבילות של ${b}.`, `מחבילות של ${wn} צריך ${L(`${N} ÷ ${wn} = ${N / wn}`)} חבילות, כל אחת ב-${money(wp)} ₪. כמה זה בסך הכל? חשבו כך גם את הסוג השני, והחסירו.`);
        q.meta = { K, a, b, pa, pb, ua, ub, N, Ta, Tb, one, pl, why: mWhy([[Math.abs(pa - pb), 'זה ההפרש בין מחירי החבילות, אבל הכמויות שונות'], [worse - best, `זה החיסכון על ${one} בלבד`], [Math.min(Ta, Tb), 'זה המחיר, לא החיסכון'], [ans * 2, 'כפול מהחיסכון'], [ans + N / 2, 'לא יוצא בחישוב']].map(([v, t]) => [money(v), t]), money(ans)) };
        return q;
      }
      const cands = [worse, Math.min(pa, pb), worse - best, best + .5, best - .5, best + 1].filter((v, i, s) => v > 0 && v !== best && Number.isInteger(v * 2) && s.indexOf(v) === i).slice(0, 3);
      const m = mc([best].concat(cands).map(v => L(money(v)) + ' ₪'));
      const ex = mEx(`לא משווים את מחירי החבילות. משווים מחיר של ${one}: מחיר החבילה ÷ מספר ${plD} בה.`,
        [`חבילה של ${a}: ${div(pa, a).replace('₪', `₪ ל${sg}`)}`, `חבילה של ${b}: ${div(pb, b).replace('₪', `₪ ל${sg}`)}`, `${L(money(best))} קטן מ-${L(money(worse))}, אז המשתלמת היא החבילה של ${bn}: ${mB(money(best) + ' ₪')} ל${sg}`],
        pic, trapTot ? `המלכודת: החבילה של ${cheapTot} זולה יותר בסך הכל, אבל יש בה פחות ${pl}. ${one} בה ${gd === 'f' ? 'יקרה' : 'יקר'} יותר.` : bn < wn ? 'כאן דווקא החבילה הקטנה משתלמת יותר. גדול לא תמיד זול יותר.' : 'כאן החבילה הגדולה משתלמת יותר. אבל זה לא תמיד כך, תמיד בודקים.',
        '"איזו חבילה משתלמת", "כמה עולה אחד". מחלקים כל מחיר בכמות. לא יוצא שלם? עוברים לאגורות.');
      const q = withHint({ cat: 'math', d, lk: 'unit', prompt: `חבילה של ${a} ${pl} עולה ${money(pa)} ₪. חבילה של ${b} ${pl} עולה ${money(pb)} ₪. כמה עולה ${one} בחבילה המשתלמת יותר?`, vis: '', options: m.options, answer: m.answer, ex },
        `לא משווים את מחירי החבילות, כי יש בהן כמויות שונות. חלקו כל מחיר במספר ${plD} שבחבילה, ומצאו כמה עולה ${one} בכל אחת.`,
        `בחבילה של ${wn}: ${L(`${money(wp)} ÷ ${wn} = ${money(wp / wn)}`)} ₪ ל${sg}. חשבו כך גם את החבילה השנייה. לא יוצא שלם? עברו לאגורות.`);
      q.meta = { K, a, b, pa, pb, ua, ub, best, bn, wn, one, pl, sg, why: mWhy([[worse, `זה המחיר ל${sg} בחבילה היקרה יותר`], [Math.min(pa, pb), 'זה המחיר של חבילה שלמה, לא של אחד'], [worse - best, 'זה ההפרש בין המחירים, לא המחיר'], [best + .5, `${one} בחבילה הזולה עולה פחות`], [best - .5, `${one} לא עולה כל כך מעט`], [best + 1, `${one} בחבילה הזולה עולה פחות`]].map(([v, t]) => [money(v), t]), money(best)) };
      return q;
    }
  },
});
MPOOL[1].push('change', 'unit');
MPOOL[2].push('change', 'unit');
MPOOL[3].push('unit', 'change');
/* ---- number properties ---- */
Object.assign(MT, {
  props(d) {
    const t = d >= 3 ? pick(['digitsum', 'lcmAbove', 'divisors', 'lastDigit']) : pick(['digitsum', 'lcmAbove', 'divisors']);
    if (t === 'digitsum') { const k = ri(3, 13); const ls = []; for (let x = 10; x <= 99; x++) if (Math.floor(x / 10) + x % 10 === k) ls.push(x); const c = ls.length, lo = Math.floor(ls[0] / 10), hi = Math.floor(ls[c - 1] / 10);
      const ex = mEx('עוברים לפי הסדר על ספרת העשרות. לכל ספרת עשרות יש לכל היותר ספרת אחדות אחת שמתאימה.',
        [k >= 10 ? `ספרת האחדות היא לכל היותר 9, אז ספרת העשרות מתחילה מ-${L(`${k} − 9 = ${lo}`)}` : `ספרת העשרות יכולה להיות מ-1 עד ${hi}`, `המספרים: ${L(ls.join(', '))}`, `בסך הכל: ${L(`${hi} − ${lo} + 1 = ${mB(c)}`)}`]);
      return withHint(mNum(d, `כמה מספרים דו-ספרתיים יש, שסכום הספרות שלהם הוא ${k}?`, '', c, [c + 1, c - 1, k, 10 - c], ex), `עברו על ספרת העשרות לפי הסדר. לכל אחת, איזו ספרת אחדות משלימה לסכום ${k}? ספרת אחדות היא ספרה אחת בלבד.`, `${k >= 11 ? `ספרת העשרות מתחילה רק מ-${k - 9}, כי ספרת האחדות קטנה מ-10. ` : ''}הראשונים: ${ls.slice(0, 2).join(', ')}. המשיכו לפי הסדר וספרו.`); }
    if (t === 'lcmAbove') { const [a, b, l] = pick([[4, 6, 12], [6, 8, 24], [6, 9, 18], [4, 10, 20], [8, 12, 24], [9, 12, 36], [10, 15, 30]]); const N = ri(50, 160); const ans = Math.ceil((N + 1) / l) * l;
      const ex = mEx(`מספר שמתחלק גם ב-${a} וגם ב-${b} מתחלק בכפולה המשותפת הקטנה שלהם.`,
        [`הכפולות של ${b}: ${L(`${b}, ${2 * b}, ${3 * b}`)}... הראשונה שמתחלקת גם ב-${a}: ${l}${a * b !== l ? ` (ולא ${L(`${a} × ${b} = ${a * b}`)})` : ''}`, `הכפולות של ${l} ליד ${N}: ${L(`${ans - l} , ${ans}`)}`, `${ans - l} קטן מ-${N} או שווה לו, אז התשובה: ${mB(ans)}`]);
      return withHint(mNum(d, `מהו המספר הקטן ביותר שגדול מ-${N} ומתחלק גם ב-${a} וגם ב-${b}?`, '', ans, [Math.ceil((N + 1) / (a * b)) * a * b, ans + l, ans - l, Math.ceil((N + 1) / a) * a], ex), `מספר שמתחלק גם ב-${a} וגם ב-${b} מתחלק בכפולה המשותפת הקטנה שלהם. מהי הכפולה הזו?`, `הכפולה המשותפת הקטנה של ${a} ו-${b} היא ${l}${a * b !== ans ? ` (לא ${a * b})` : ''}. עכשיו חפשו את הכפולה הראשונה של ${l} שגדולה מ-${N}.`); }
    if (t === 'divisors') { const N = pick([12, 18, 20, 24, 28, 30, 36, 40, 48, 60, 72]); const ds = []; for (let x = 1; x <= N; x++) if (N % x === 0) ds.push(x);
      const prs = ds.filter(x => x * x <= N && x !== ds.length && N / x !== ds.length).slice(0, 2).map(x => L(`${x} × ${N / x}`)), pairs = ds.filter(x => x * x <= N), sq = pairs.some(x => x * x === N);
      const ex = mEx(`מחפשים זוגות של מספרים שמכפלתם ${N}. כל זוג נותן שני מחלקים.`,
        [`הזוגות: ${L(pairs.map(x => `${x}×${N / x}`).join(', '))}`, sq ? `${L(`${pairs.length} × 2 − 1 = ${mB(ds.length)}`)} (בזוג של ריבוע המספר מופיע פעמיים)` : `${L(`${pairs.length} × 2 = ${mB(ds.length)}`)} מחלקים`, `הם: ${L(ds.join(', '))}`]);
      return withHint(mNum(d, `כמה מחלקים יש למספר ${N}? (כולל 1 ו-${N} עצמו)`, '', ds.length, [ds.length - 1, ds.length + 1, ds.length - 2, Math.floor(N / 2)], ex), `חפשו זוגות של מספרים שמכפלתם ${N}, למשל ${L(`1 × ${N}`)}. כל זוג נותן שני מחלקים.`, `למשל ${prs.join(' ו-')}. בדקו כל מספר מ-1 והלאה אם ${N} מתחלק בו, עד שהזוגות מתחילים לחזור.`); }
    const base = pick([2, 3, 7]), e = ri(12, 41); const cyc = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1] }[base]; const ans = cyc[(e - 1) % 4], r = e % 4;
    const ex = mEx(`לא מחשבים את המספר. ספרת האחדות של חזקות ${base} חוזרת כל 4 חזקות.`,
      [`${L(`${base}¹ , ${base}² , ${base}³ , ${base}⁴`)} נגמרים ב-${L(cyc.join(' , '))}, ואז המחזור חוזר`, `${L(`${e} ÷ 4 = ${Math.floor(e / 4)}`)} ${r ? `ושארית ${r}` : 'בלי שארית'}`, r ? `שארית ${r}: המקום ה-${r} במחזור, ${mB(ans)}` : `בלי שארית: המקום האחרון במחזור, ${mB(ans)}`]);
    return withHint(mNum(d, `מהי ספרת האחדות של ${base} בחזקת ${e}? (כלומר ${base} כפול עצמו ${e} פעמים)`, '', ans, cyc.filter(x => x !== ans).concat([base]), ex), `אל תחשבו את המספר כולו. כתבו רק את ספרת האחדות של ${base}, ${base} כפול ${base}, ועוד פעם כפול ${base}... מתי היא חוזרת?`, `ספרות האחדות של חזקות ${base} חוזרות כל ארבע חזקות. מה השארית של ${e} חלקי ארבע, ואיזה מקום במחזור היא מסמנת?`);
  },
});
MPOOL[2].push('props');
MPOOL[3].push('props', 'props');
MPOOL[4] = MPOOL[3].concat(['props', 'chase', 'remainder', 'pages']);
function genMath5(d) { return MT[pick(MPOOL[Math.min(d, 4)])](Math.min(d, 3)); }
/* [text, value, how to compute it] */
const ONUM = {
  2: [['½', .5, '1 ÷ 2'], ['¾', .75, '3 ÷ 4'], ['⅖', .4, '2 ÷ 5'], ['0.6', .6], ['0.7', .7], ['0.45', .45], ['⅔', 2 / 3, '2 ÷ 3'], ['⅝', .625, '5 ÷ 8'], ['0.3', .3], ['¼', .25, '1 ÷ 4'], ['80%', .8, '80 ÷ 100'], ['35%', .35, '35 ÷ 100'], ['0.55', .55], ['⅗', .6, '3 ÷ 5']],
  3: [['2³', 8, '2 × 2 × 2'], ['3²', 9, '3 × 3'], ['¾ מ-12', 9, '12 ÷ 4 × 3'], ['25% מ-40', 10, '40 ÷ 4'], ['0.5 × 14', 7, '14 ÷ 2'], ['⅔ מ-15', 10, '15 ÷ 3 × 2'], ['2⁴', 16, '2 × 2 × 2 × 2'], ['4²', 16, '4 × 4'], ['½ מ-30', 15, '30 ÷ 2'], ['60 ÷ 4', 15], ['1.5 × 8', 12, '8 + 4'], ['20% מ-55', 11, '55 ÷ 5'], ['3 × 3.5', 10.5, '9 + 1.5']],
};
/* "¾ מ-12" keeps its Hebrew word outside the LTR span, so it reads right in RTL */
const onTx = s => { const m = /^(\S+) מ-(\S+)$/.exec(s); return m ? `${L(m[1])} מ-${L(m[2])}` : L(s); };
function genOrdNum(d) {
  let items;
  if (d <= 1) { const s = new Set(); items = []; while (items.length < 4) { const a = ri(3, 9), b = ri(3, 9), t = pick(['×', '+', '−']); const v = t === '×' ? a * b : t === '+' ? a * 4 + b : a * 6 - b; const txt = t === '×' ? `${a} × ${b}` : t === '+' ? `${a * 4} + ${b}` : `${a * 6} − ${b}`; if (!s.has(v)) { s.add(v); items.push([txt, v]); } } }
  else { const pool = ONUM[Math.min(d, 3)]; for (;;) { items = shuffle(pool).slice(0, d >= 3 ? 5 : 4); const vs = items.map(x => Math.round(x[1] * 100)); if (new Set(vs).size === vs.length) break; } }
  const sorted = items.slice().sort((a, b) => a[1] - b[1]);
  const disp = items.map(x => onTx(x[0]));
  const fmt3 = v => String(v), v3 = x => Math.round(x[1] * 1000) / 1000, exact = x => Math.abs(v3(x) - x[1]) < 1e-9, show = x => `${onTx(x[0])} ${exact(x) ? '=' : '≈'} ${L(fmt3(v3(x)))}`;
  let h1, h2;
  if (d <= 1) { h1 = `חשבו כל תרגיל לפני שמשווים, למשל ${L(items[0][0])} ו-${L(items[1][0])}. אחר כך סדרו לפי התוצאות.`; h2 = `${show(items[0])}, ${show(items[1])}. חשבו גם את ${L(items[2][0])} ו-${L(items[3][0])}, ואז סדרו.`; }
  else if (d === 2) { const isDec = x => /^0\./.test(x[0]), isPct = x => /%/.test(x[0]); const kinds = [items.some(x => !isDec(x) && !isPct(x)) && 'שברים', items.some(isDec) && 'מספרים עשרוניים', items.some(isPct) && 'אחוזים'].filter(Boolean);
    const nd = items.filter(x => !isDec(x)), two = nd.filter(exact).concat(nd.filter(x => !exact(x)), items.filter(isDec)).slice(0, 2);
    h1 = `${kinds.length > 1 ? `כאן מעורבבים ${kinds.slice(0, -1).join(', ')} ו${kinds[kinds.length - 1]}.` : `כאן יש רק ${kinds[0]}.`} הפכו כל אחד מ-${items.map(x => L(x[0])).join(', ')} למספר עשרוני, ואז השוו.`; h2 = `${two.map(show).join(', ')}. המירו כך גם את השאר.`; }
  else { const SUP = { '²': 2, '³': 3, '⁴': 4 }; const pw = items.find(x => /[²³⁴]/.test(x[0])); const rest = items.filter(x => x !== pw);
    h1 = `הפכו כל ביטוי למספר רגיל, ואז השוו. ${pw ? `שימו לב: ${L(pw[0])} זה ${L(Array(SUP[pw[0][1]]).fill(pw[0][0]).join(' × '))}, ולא ${L(`${pw[0][0]} × ${SUP[pw[0][1]]}`)}.` : `התחילו מ-${onTx(items[0][0])} ומ-${onTx(items[1][0])}.`}`; h2 = `${show(rest[0])}, ${show(rest[1])}. חשבו כך גם את השאר, ואז סדרו.`; }
  const heb = x => /[א-ת]/.test(x[0]), eq = x => exact(x) ? '=' : '≈';
  const line = x => d <= 1 ? L(`${x[0]} = ${x[1]}`) : heb(x) ? `${onTx(x[0])}: ${L(`${x[2]} = ${fmt3(v3(x))}`)}` : L(`${x[0]}${x[2] ? ` = ${x[2]}` : ''}${String(x[1]) === x[0] ? '' : ` ${eq(x)} ${fmt3(v3(x))}`}`);
  const ex = mEx(d <= 1 ? 'מחשבים כל תרגיל, ורק אז משווים.' : d === 2 ? 'הופכים הכל למספרים עשרוניים (אותה צורה), ורק אז משווים.' : 'מחשבים כל ביטוי למספר רגיל, ורק אז משווים.',
    sorted.map(line).concat([`מהקטן לגדול: ${mB(sorted.map(x => `<span class="mnw">${onTx(x[0])}</span>`).join(' , '))}`]), '',
    d === 2 ? `במספרים עשרוניים משווים ספרה אחרי ספרה: ${L('0.45')} קטן מ-${L('0.5')}, כי 4 קטן מ-5.` : d >= 3 && items.some(x => /[²³⁴]/.test(x[0])) ? `חזקה היא כפל של המספר בעצמו: ${L('2³ = 2 × 2 × 2 = 8')}, ולא ${L('2 × 3')}.` : '');
  return withHint({ cat: 'math', d, type: 'order', prompt: 'סדר מהקטן לגדול. לחץ על המספרים לפי הסדר.', vis: '', items: disp, correct: sorted.map(x => items.indexOf(x)), ex }, h1, h2);
}
MT.ordnum = genOrdNum;
MPOOL[1].push('ordnum');
MPOOL[2].push('ordnum');
MPOOL[3].push('ordnum');
MPOOL[4].push('ordnum');
/* [key, rule f, rule in words, range of a (or null), the rule written on one number] */
const MAGIC = {
  1: [['x + a', (x, a) => x + a, a => `ועוד ${a}`, [3, 9], (x, a) => `${x} + ${a}`], ['x × a', (x, a) => x * a, a => `כפול ${a}`, [2, 5], (x, a) => `${x} × ${a}`], ['x − a', (x, a) => x - a, a => `פחות ${a}`, [2, 6], (x, a) => `${x} − ${a}`]],
  2: [['ax + b', (x, a, b) => a * x + b, (a, b) => `כפול ${a} ועוד ${b}`, [2, 4], (x, a, b) => `${x} × ${a} + ${b}`], ['ax − b', (x, a, b) => a * x - b, (a, b) => `כפול ${a} פחות ${b}`, [2, 4], (x, a, b) => `${x} × ${a} − ${b}`], ['x²', x => x * x, () => 'כפול עצמו', null, x => `${x} × ${x}`]],
  3: [['x² + a', (x, a) => x * x + a, a => `כפול עצמו ועוד ${a}`, [1, 6], (x, a) => `${x} × ${x} + ${a}`], ['(x + a) × b', (x, a, b) => (x + a) * b, (a, b) => `ועוד ${a}, ואז כפול ${b}`, [1, 4], (x, a, b) => `(${x} + ${a}) × ${b}`], ['x(x+1)', x => x * (x + 1), () => 'כפול המספר שאחריו', null, x => `${x} × ${x + 1}`], ['x² − x', x => x * x - x, () => 'כפול עצמו, פחות עצמו', null, x => `${x} × ${x} − ${x}`]],
};
function genMagic(d) {
  d = Math.min(d, 3);
  for (let k = 0; k < 100; k++) {
    const R0 = pick(MAGIC[d]); const a = R0[3] ? ri(R0[3][0], R0[3][1]) : 0, b = ri(2, 5);
    const f = x => R0[1](x, a, b), on = x => R0[4](x, a, b);
    const ins = shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 4); const q0 = ins.pop();
    if (ins.some(x => f(x) < 0) || f(q0) < 0) continue;
    ins.sort((x, y) => x - y);
    const outs = ins.map(f);
    const inverse = d === 3 && R() < .35;
    let x1 = q0 + (d >= 2 ? ri(3, 6) : 0); if (inverse) x1 = q0 + ri(2, 5);
    if (ins.includes(x1)) continue;
    const ans = inverse ? x1 : f(x1);
    if (ans > 400 || ans < 1) continue;
    const alts = [ans + 1, ans - 1, x1 + (outs[0] - ins[0]), x1 * Math.round(outs[0] / Math.max(1, ins[0])), f(x1 - 1), f(x1 + 1)];
    const row = (i, o) => `<div class="mrow"><b>${i}</b><i>→</i><span class="mb">?</span><i>→</i><b>${o}</b></div>`;
    const vis = `<div class="mgbox" dir="ltr">${ins.map((x, j) => row(x, outs[j])).join('')}${inverse ? row('?', f(x1)) : row(x1, '?')}</div>`;
    const rule = R0[2](a, b);
    const prompt = inverse ? 'כל מספר שנכנס לתיבה יוצא לפי אותו חוק. איזה מספר נכנס, אם יצא ' + L(f(x1)) + '?' : 'כל מספר שנכנס לתיבה יוצא לפי אותו חוק. מה ייצא?';
    const ex = mEx('מנחשים חוק מהשורה הראשונה, ובודקים אותו על כל השורות לפני שמשתמשים בו.',
      [`החוק: ${rule}`].concat(ins.map((x, j) => `${L(`${on(x)} = ${outs[j]}`)} ✓`),
        inverse ? [`מחפשים מספר שנותן ${f(x1)}. מנסים: ${L(`${on(x1)} = ${f(x1)}`)}`, `נכנס ${mB(x1)}`] : [`${L(`${on(x1)} = ${mB(ans)}`)}`]), '',
      inverse ? 'בשאלה הפוכה אפשר גם לנסות כל תשובה בחוק ולראות איזו נותנת בדיוק את היוצא.' : 'חוק שמתאים רק לשורה הראשונה הוא מלכודת.');
    const q = mNum(d, prompt, vis, ans, inverse ? [x1 + 1, x1 - 1, f(x1) - (outs[0] - ins[0]), Math.round(f(x1) / 2)].filter(v => v !== f(x1)) : alts, ex);
    const rw = j => L(`${ins[j]} → ${outs[j]}`);
    withHint(q, inverse ? `קודם מצאו את החוק מהשורות ${rw(0)} ו-${rw(1)}. אחר כך לכו אחורה מ-${f(x1)}.` : `השוו כל נכנס ליוצא: ${rw(0)}, ${rw(1)}. איזה חוק מתאים לכל השורות, ולא רק לראשונה?`, inverse ? (new RegExp(`(^|\\D)${x1}(\\D|$)`).test(rule) ? `מצאו את החוק בעזרת ${rw(2)}, ואז נסו כל תשובה: איזה מספר נכנס נותן בדיוק ${f(x1)}?` : `החוק: ${rule}. בדקו אותו על ${rw(2)}. איזה מספר, אחרי החוק הזה, נותן ${f(x1)}? אפשר לנסות את התשובות.`) : ({ 'x + a': `בכל שורה היוצא גדול מהנכנס באותו מספר בדיוק. בכמה? בדקו ב-${rw(2)}, ואז חשבו מה יוצא מ-${x1}.`, 'x × a': `בכל שורה היוצא גדול פי אותו מספר מהנכנס. פי כמה? בדקו ב-${rw(2)}, ואז חשבו מה יוצא מ-${x1}.`, 'x − a': `בכל שורה היוצא קטן מהנכנס באותו מספר בדיוק. בכמה? בדקו ב-${rw(2)}, ואז חשבו מה יוצא מ-${x1}.`, 'ax + b': `יש כאן שני שלבים: כפל במספר קבוע ואז חיבור. נסו כפול ${a} ובדקו כמה חסר ב-${rw(0)}.`, 'ax − b': `יש כאן שני שלבים: כפל במספר קבוע ואז חיסור. נסו כפול ${a} ובדקו כמה עודף ב-${rw(0)}.`, 'x²': `היוצאים ${outs.join(', ')} מוכרים מלוח הכפל. איזה כפל נותן כל אחד מהם, ומה הקשר לנכנס?`, 'x² + a': `נסו את ${ins[0]} כפול עצמו: ${L(`${ins[0]} × ${ins[0]} = ${ins[0] * ins[0]}`)}. כמה חסר עד ${outs[0]}? בדקו שזה עובד בכל השורות.`, '(x + a) × b': `שני שלבים: קודם מוסיפים מספר קבוע ואז כופלים. נסו ${L(`${ins[0]} + ${a} = ${ins[0] + a}`)}: פי כמה ${outs[0]} גדול מזה?`, 'x(x+1)': `פרקו יוצא למכפלה: ${L(`${outs[1]} = ${ins[1]} × ${ins[1] + 1}`)}. מה הקשר בין שני המספרים האלה לנכנס ${ins[1]}?`, 'x² − x': `פרקו יוצא למכפלה: ${L(`${outs[1]} = ${ins[1]} × ${ins[1] - 1}`)}. מה הקשר בין שני המספרים האלה לנכנס ${ins[1]}?` })[R0[0]]);
    q.lk = 'magic'; return q;
  }
  return genMath5(d);
}
MT.magic = genMagic;
[1, 2, 3, 4].forEach(k => MPOOL[k] && MPOOL[k].push('magic'));
/* ---------- acrobatics flavour for Romi ---------- */
function genAcro(d) {
  const T = pick(['hand', 'pyr', 'tramp', 'flips']);
  if (T === 'hand') { const a = ri(3, 8), k = ri(2, 4), n = ri(5, 9); const ans = a + k * (n - 1);
    const ex = mEx(`מהיום הראשון עד היום ה-${n} יש ${n - 1} שיפורים, לא ${n}.`, [`יום 1: ${a} שניות`, `${n - 1} שיפורים של ${k}: ${L(`${k} × ${n - 1} = ${k * (n - 1)}`)}`, `יום ${n}: ${L(`${a} + ${k * (n - 1)} = ${mB(ans)}`)} שניות`], '', `המלכודת: לכפול ב-${n} ולא ב-${n - 1}.`);
    return withHint(mNum(d, `רומי מתאמנת על עמידת ידיים. ביום הראשון החזיקה ${a} שניות, ובכל יום החזיקה ${k} שניות יותר מהיום הקודם. כמה שניות החזיקה ביום ה-${n}?`, '', ans, [a + k * n, k * n, ans - k], ex, ' שנ׳'), `ביום הראשון ${a} שניות. כמה פעמים רומי השתפרה מהיום הראשון עד היום ה-${n}? ספרו בזהירות.`, `מהיום הראשון עד היום ה-${n} יש ${n - 1} שיפורים, לא ${n}. כל שיפור מוסיף ${k} שניות ל-${a} של ההתחלה.`); }
  if (T === 'pyr') { const b = ri(4, 6), tot = b * (b + 1) / 2 + ri(2, 9); const pyr = b * (b + 1) / 2;
    const ex = mEx('סופרים את הפירמידה שורה אחרי שורה, ומורידים מכל הקבוצה.', [`בפירמידה: ${L(`${Array.from({ length: b }, (_, i) => b - i).join(' + ')} = ${pyr}`)}`, `לא נכנסו: ${L(`${tot} − ${pyr} = ${mB(tot - pyr)}`)}`]);
    return withHint(mNum(d, `בקבוצת האקרובטיקה ${tot} ילדות. בונות פירמידה: בשורה התחתונה ${b}, ובכל שורה מעליה אחת פחות, עד ילדה אחת למעלה. כמה ילדות לא נכנסו לפירמידה?`, '', tot - pyr, [tot - b * b, tot - pyr - 1, pyr, tot - pyr + b], ex), `קודם ספרו כמה ילדות יש בפירמידה: ${b} בשורה התחתונה, ובכל שורה מעליה אחת פחות. חברו את כל השורות.`, b - 1 !== tot - pyr && 2 * b - 1 !== tot - pyr ? `שתי השורות התחתונות: ${L(`${b} + ${b - 1} = ${2 * b - 1}`)}. הוסיפו את השורות שמעליהן עד 1, ואז השוו ל-${tot}.` : `בפירמידה ${b} שורות: מ-${b} ילדות למטה עד ילדה אחת למעלה. חברו את כולן, ואז השוו ל-${tot}.`); }
  if (T === 'tramp') { const h = ri(2, 5) * 10, n = ri(3, 4); const ans = h * Math.pow(2, n - 1);
    const ex = mEx('"פי 2" אומר לכפול ב-2 בכל קפיצה, לא להוסיף 2.', [`קפיצה 1: ${h}`].concat(Array.from({ length: n - 1 }, (_, i) => `קפיצה ${i + 2}: ${L(`${h * Math.pow(2, i)} × 2 = ${i === n - 2 ? mB(h * Math.pow(2, i + 1)) : h * Math.pow(2, i + 1)}`)}`)), '', 'כפל חוזר גדל מהר מאוד.');
    return withHint(mNum(d, `בכל קפיצה על הטרמפולינה רומי עולה פי 2 מהקפיצה הקודמת. בקפיצה הראשונה עלתה ${h} ס״מ. לאיזה גובה עלתה בקפיצה ה-${n}?`, '', ans, [h * n, h * Math.pow(2, n), h + 2 * (n - 1), h * 2 * (n - 1)], ex, ' ס״מ'), `"פי 2" אומר שכופלים ב-2 בכל קפיצה, לא מוסיפים 2. התחילו מ-${h} ס״מ וכתבו קפיצה אחרי קפיצה עד ה-${n}.`, `קפיצה 1: ${h} ס״מ. קפיצה 2: ${L(`${h} × 2 = ${2 * h}`)} ס״מ. המשיכו לכפול ב-2 עד הקפיצה ה-${n}.`); }
  const s = ri(2, 4), m = ri(3, 6); const per = 60 / s; const ans = per * m;
  const ex = mEx('מתחילים מדקה אחת: כמה פעמים הזמן של גלגלון נכנס ב-60 שניות.', [`בדקה: ${L(`60 ÷ ${s} = ${per}`)} גלגלונים`, `ב-${m} דקות: ${L(`${per} × ${m} = ${mB(ans)}`)}`]);
  return withHint(mNum(d, `גלגלון לוקח לרומי ${s} שניות. כמה גלגלונים היא יכולה לעשות ב-${m} דקות, בלי הפסקה?`, '', ans, [m * s, per, ans + per], ex), `התחילו מדקה אחת: כל גלגלון לוקח ${s} שניות. כמה פעמים ${s} שניות נכנסות בדקה שלמה?`, `בדקה שלמה נכנסים ${per} גלגלונים של ${s} שניות. ועכשיו כמה ב-${m} דקות?`);
}
if (PROF.id === 'romi') { MT.acro = genAcro; [1, 2, 3, 4].forEach(k => MPOOL[k] && MPOOL[k].push('acro')); }

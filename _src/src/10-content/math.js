/* ---------- MATH WORD PROBLEMS ---------- */
const FR = { '1/2': 'חצי', '1/3': 'שליש', '1/4': 'רבע', '2/5': 'שתי חמישיות' };
const TM = (m) => { const H = 8 + Math.floor(m / 60), M = m % 60; return L(`${H}:${String(M).padStart(2, '0')}`); };
/* ---- explanation helpers (math only) ----
   Every explanation: the method in one sentence (.mhow), an optional small picture, then a .calc block with one line per step
   and the answer in <b>, and an optional short warning (.mtip). Only inline elements: the explanation sits inside a <p>. */
const mB = v => `<b>${v}</b>`;
const mCalc = lines => `<span class="calc">${lines.filter(Boolean).map(s => `<span>${s}</span>`).join('')}</span>`;
const mEx = (method, lines, pic = '', tip = '') => `<span class="mhow">${method}</span>${pic}${mCalc(lines)}${tip ? `<span class="mtip">${tip}</span>` : ''}`;
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
/* timeline of two bus lines: dots every a and every b minutes, meeting at l */
function mBusTL(a, b, l) {
  const x0 = 22, x1 = 280, X = m => x0 + m * (x1 - x0) / l, y = 46;
  let s = `<line class="ln" x1="${x0 - 8}" y1="${y}" x2="${x1 + 12}" y2="${y}"/><line class="lg dash" x1="${X(l)}" y1="${y - 20}" x2="${X(l)}" y2="${y + 20}"/>`;
  for (let m = 0; m <= l; m += a) s += `<circle cx="${X(m)}" cy="${y - 14}" r="4.5" class="a"/>` + (m ? mTx(X(m), y - 24, m, 'a', 10.5) : '');
  for (let m = 0; m <= l; m += b) s += `<circle cx="${X(m)}" cy="${y + 14}" r="4.5" class="v"/>` + (m ? mTx(X(m), y + 33, m, 'v', 10.5) : '');
  s += mTx(x0, y + 52, '8:00', 'mu', 11) + mTx(X(l), y + 52, TM(l).replace(/<[^>]+>/g, ''), 'g', 12);
  return mSvg(102, s) + mLeg([['a', `קו 5: כל ${a} דקות`], ['v', `קו 9: כל ${b} דקות`]]);
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
function mRect(a, b, all) {
  const k = 150 / Math.max(a, b), w = Math.max(40, a * k), h = Math.max(26, b * k), x = 150 - w / 2, y = 22;
  return mSvg(h + 46, `<rect class="la" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>` + mTx(150, y - 6, a, 'a') + mTx(x + w + 14, y + h / 2 + 4, b, 'g') + (all ? mTx(150, y + h + 16, a, 'a') + mTx(x - 14, y + h / 2 + 4, b, 'g') : ''));
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
  consec(d) {
    if (d === 1) { const x = ri(10, 60), S = 3 * x + 3;
      const ex = mEx('במספרים עוקבים, המספר האמצעי הוא הממוצע: הסכום חלקי כמות המספרים.',
        [`האמצעי: ${L(`${S} ÷ 3 = ${x + 1}`)}`, `הגדול בא צעד אחד אחריו: ${L(`${x + 1} + 1 = ${mB(x + 2)}`)}`, `בדיקה: ${L(`${x} + ${x + 1} + ${x + 2} = ${S}`)}`],
        mNL([{ v: x, t: x }, { v: x + 1, t: x + 1, w: 'ממוצע', c: 'a' }, { v: x + 2, t: x + 2, w: 'הגדול', c: 'g' }], [[x + 1, x + 2, '+1']]));
      return withHint(mNum(d, `סכום שלושה מספרים שלמים עוקבים הוא ${S}. מהו הגדול מביניהם?`, '', x + 2, [x + 1, x, x + 3], ex), `בשלושה מספרים עוקבים, האמצעי הוא בדיוק הממוצע. מה הממוצע של שלושה מספרים שסכומם ${S}?`, `האמצעי: ${L(`${S} ÷ 3 = ${x + 1}`)}. הגדול נמצא צעד אחד אחריו.`); }
    const x = ri(5, 30) * 2, S = 5 * x + 20;
    const ex = mEx('במספרים עוקבים, המספר האמצעי הוא הממוצע: הסכום חלקי כמות המספרים.',
      [`האמצעי: ${L(`${S} ÷ 5 = ${x + 4}`)}`, `הקטן נמצא שני צעדים של 2 לפניו: ${L(`${x + 4} − 4 = ${mB(x)}`)}`, `המספרים: ${L(`${x} , ${x + 2} , ${x + 4} , ${x + 6} , ${x + 8}`)}`],
      mNL([{ v: x, t: x, w: 'הקטן', c: 'g' }, { v: x + 2, t: x + 2 }, { v: x + 4, t: x + 4, w: 'ממוצע', c: 'a' }, { v: x + 6, t: x + 6 }, { v: x + 8, t: x + 8 }], [[x + 4, x + 2, '−2'], [x + 2, x, '−2']]));
    return withHint(mNum(d, `סכום חמישה מספרים זוגיים עוקבים הוא ${S}. מהו הקטן מביניהם?`, '', x, [x + 4, x + 2, x - 2], ex), `בחמישה זוגיים עוקבים, המספר האמצעי הוא הממוצע. חלקו את ${S} ב-5.`, `האמצעי: ${L(`${S} ÷ 5 = ${x + 4}`)}. הקטן נמצא שני מספרים זוגיים לפניו.`);
  },
  ratio(d) {
    const [a, b] = pick([[2, 3], [3, 4], [3, 5], [4, 5], [5, 7], [1, 2]]), k = ri(3, 6), T = (a + b) * k, boys = a === 1 ? 'בן אחד' : `${a} בנים`;
    const ex = mEx(`ביחס מחלקים לקבוצות שוות. בכל קבוצה יש ${boys} ו-${b} בנות.`,
      [`ילדים בקבוצה אחת: ${L(`${a} + ${b} = ${a + b}`)}`, `מספר הקבוצות: ${L(`${T} ÷ ${a + b} = ${k}`)}`, `בנות: ${L(`${b} × ${k} = ${mB(b * k)}`)}`, `בדיקה: ${L(`${a * k} + ${b * k} = ${T}`)}`],
      mBar([['בנים', mRep(a, k)], ['בנות', mRep(b, k, 'g')]], '', `<span class="mcap">כל משבצת היא ${k} ילדים (אחד מכל קבוצה).</span>`));
    return withHint(mNum(d, `בכיתה ${T} תלמידים. על כל ${boys} יש בכיתה ${b} בנות. כמה בנות בכיתה?`, '', b * k, [a * k, k, b * (k + 1), b * k - b], ex), `חשבו על קבוצה של ${boys} ו-${b} בנות, כלומר ${a + b} ילדים. כמה קבוצות כאלה יש ב-${T}?`, `${L(`${T} ÷ ${a + b} = ${k}`)} קבוצות. בכל קבוצה יש ${b} בנות.`);
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
  handshake(d) {
    const n = ri(6, 12), ans = n * (n - 1) / 2;
    const ex = mEx('כל שחקן משחק נגד כל האחרים. כך כל משחק נספר פעמיים, ולכן מחלקים ב-2.',
      [`כל שחקן משחק נגד ${n - 1} שחקנים`, `${n} שחקנים: ${L(`${n} × ${n - 1} = ${n * (n - 1)}`)} (כל משחק נספר פעמיים)`, `משחקים: ${L(`${n * (n - 1)} ÷ 2 = ${mB(ans)}`)}`]);
    return withHint(mNum(d, `בטורניר שחמט משתתפים ${n} שחקנים. כל שחקן משחק נגד כל שחקן אחר פעם אחת בדיוק. כמה משחקים יהיו בסך הכל?`, '', ans, [n * (n - 1), n * n / 2 | 0, n * (n + 1) / 2], ex), `נגד כמה שחקנים משחק כל אחד מ-${n} השחקנים? ושימו לב: בכל משחק משתתפים שני שחקנים.`, `כל שחקן משחק ${n - 1} משחקים: ${L(`${n} × ${n - 1} = ${n * (n - 1)}`)}. אבל כך כל משחק נספר פעמיים. מה עושים?`);
  },
  ages(d) {
    const p = pick(PEOPLE); const [m1, m2] = pick([[4, 3], [7, 5], [5, 4]]); const k = m1 === 4 ? ri(3, 7) : m1 === 7 ? ri(2, 5) : ri(2, 4); const x = k * (m2 - 1) / (m1 - m2);
    const ex = mEx('קוראים לגיל של היום x, ממלאים טבלה של היום ושל עוד כמה שנים, ובונים משוואה.',
      [`היום: ${p[0]} ${L('x')}, אבא ${L(`${m1}x`)}`, `בעוד ${k} שנים: ${p[0]} ${L(`x + ${k}`)}, אבא ${L(`${m1}x + ${k}`)}`, `אז אבא פי ${m2}: ${L(`${m1}x + ${k} = ${m2}(x + ${k}) = ${m2}x + ${m2 * k}`)}`, `${L(`${m1}x − ${m2}x = ${m2 * k} − ${k}`)}${m1 - m2 === 1 ? '' : `, כלומר ${L(`${m1 - m2}x = ${(m2 - 1) * k}`)}`}`, m1 - m2 === 1 ? `${p[0]} היום: ${L(`x = ${mB(x)}`)}` : `${p[0]} היום: ${L(`x = ${(m2 - 1) * k} ÷ ${m1 - m2} = ${mB(x)}`)}`, `בדיקה: ${L(`${m1 * x + k} = ${m2} × ${x + k}`)}`],
      mTab(['', 'היום', `בעוד ${k}`], [[p[0], x, x + k], ['אבא', m1 * x, m1 * x + k], ['פי', m1, m2]], 0));
    return withHint(mNum(d, `היום אבא של ${p[0]} מבוגר ${g(p, 'ממנו', 'ממנה')} פי ${m1}. בעוד ${k} שנים, אבא יהיה מבוגר ${g(p, 'ממנו', 'ממנה')} פי ${m2}. ${g(p, 'בן', 'בת')} כמה ${p[0]} היום?`, '', x, [k, x + k, 2 * x, m1 * x], ex), `קראו לגיל של ${p[0]} היום x. אז אבא בן ${L(`${m1}x`)}. מה יהיו הגילים של שניהם בעוד ${k} שנים?`, `בעוד ${k} שנים: ${p[0]} ${L(`x + ${k}`)} ואבא ${L(`${m1}x + ${k}`)}. אז אבא פי ${m2}: ${L(`${m1}x + ${k} = ${m2}(x + ${k})`)}. פתרו או נסו את התשובות.`);
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
  buses(d) {
    const [a, b, l] = pick([[12, 18, 36], [15, 20, 60], [10, 25, 50], [12, 16, 48], [20, 30, 60], [6, 15, 30], [18, 24, 72]]); const opts = [l, a * b, a + b, Math.max(a, b) * 2, l + Math.min(a, b), l + Math.max(a, b), 2 * l].filter((v, i, s) => s.indexOf(v) === i && v < 600).slice(0, 4);
    const m = mc(opts.map(TM)), ms = s => Array.from({ length: l / s }, (_, i) => (i + 1) * s).join(', ');
    const ex = mEx('הקווים ייצאו יחד שוב אחרי הכפולה המשותפת הקטנה ביותר של שני הזמנים.',
      [`קו 5 יוצא אחרי: ${L(ms(a))} דקות`, `קו 9 יוצא אחרי: ${L(ms(b))} דקות`, `המספר הראשון שמופיע בשתי השורות: ${l} דקות${l >= 60 ? (l === 60 ? ', כלומר שעה' : `, כלומר שעה ו-${l - 60} דקות`) : ''}`, `${L('8:00')} ועוד ${l} דקות: ${mB(TM(l))}`],
      mBusTL(a, b, l));
    return withHint({ cat: 'math', d, prompt: `קו 5 יוצא מהתחנה כל ${a} דקות, וקו 9 יוצא כל ${b} דקות. בשעה ${L('8:00')} יצאו שניהם יחד. באיזו שעה ייצאו שוב יחד לראשונה?`, vis: '', options: m.options, answer: m.answer, ex }, `שני הקווים ייצאו יחד אחרי מספר דקות שמתחלק גם ב-${a} וגם ב-${b}. מה המספר הקטן ביותר כזה?`, `עברו על כפולות של ${b}, אחת אחרי השנייה. ${b} עצמו לא מתחלק ב-${a}. מה הכפולה הבאה? בסוף הוסיפו את הדקות ל-${L('8:00')}.`);
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
const MPOOL = { 1: ['consec', 'ratio', 'legs', 'average', 'handshake'], 2: ['handshake', 'ages', 'trains', 'work', 'percent', 'fraction', 'buses', 'consec', 'legs'], 3: ['chase', 'pages', 'workers', 'ages', 'fraction', 'percent', 'work', 'buses'] };
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
  rect(d) { const L0 = ri(6, 30), W0 = ri(4, L0 - 1); const ask = d === 1 ? 'per' : pick(['area', 'sq']);
    if (ask === 'per') { const ex = mEx('היקף הוא כל הדרך מסביב: שתי צלעות אורך ושתי צלעות רוחב.', [`${L(`${L0} + ${W0} + ${L0} + ${W0}`)}`, `${L(`= 2 × ${L0} + 2 × ${W0} = ${2 * L0} + ${2 * W0} = ${mB(2 * (L0 + W0))}`)} מטר`], mRect(L0, W0, true));
      return withHint(mNum(d, `מגרש מלבני באורך ${L0} מטר וברוחב ${W0} מטר. מה ההיקף שלו?`, '', 2 * (L0 + W0), [L0 * W0, L0 + W0, 2 * L0 + W0], ex, ' מ׳'), `היקף הוא כל הדרך מסביב למגרש: ארבע צלעות. למגרש ${L0} על ${W0} יש שתי צלעות מכל אורך.`, `שתי צלעות האורך: ${L(`${L0} + ${L0} = ${2 * L0}`)}. הוסיפו את שתי צלעות הרוחב, ${W0} כל אחת.`); }
    if (ask === 'area') { const tn = L0 - L0 % 10, on = L0 % 10;
      const ex = mEx('שטח מלבן = אורך × רוחב.', L0 >= 10 && on ? [`מפרקים את ${L0} ל-${tn} ועוד ${on}:`, `${L(`${tn} × ${W0} = ${tn * W0}`)}`, `${L(`${on} × ${W0} = ${on * W0}`)}`, `${L(`${tn * W0} + ${on * W0} = ${mB(L0 * W0)}`)} מ"ר`] : [`${L(`${L0} × ${W0} = ${mB(L0 * W0)}`)} מ"ר`], mRect(L0, W0, false), 'היקף (הדרך מסביב) ושטח (כמה ריבועים בפנים) הם שני דברים שונים.');
      return withHint(mNum(d, `מגרש מלבני באורך ${L0} מטר וברוחב ${W0} מטר. מה השטח שלו?`, '', L0 * W0, [2 * (L0 + W0), L0 * W0 + L0, (L0 + W0) * 2 + 10], ex, ' מ"ר'), `דמיינו את המגרש מחולק לריבועים של מטר על מטר: ${W0} שורות, ובכל שורה ${L0} ריבועים. כמה ריבועים בסך הכל?`, L0 < 10 ? `${W0} שורות של ${L0}: ${L0}, ${2 * L0}, ${3 * L0}... המשיכו לספור בקפיצות של ${L0} עד ${W0} שורות.` : on === 0 ? `${L(`${L0 / 10} × ${W0} = ${L0 / 10 * W0}`)}, ועכשיו כפלו ב-10.` : `פרקו את ${L0} ל-${tn} ו-${on}: ${L(`${tn} × ${W0} = ${tn * W0}`)}, ועוד ${L(`${on} × ${W0} = ${on * W0}`)}. חברו.`); }
    const s = ri(3, 12), a = ri(1, s - 1), b = 2 * s - a;
    const ex = mEx('מוצאים את ההיקף, מחלקים אותו ב-4 כדי לקבל צלע של ריבוע, ואז צלע × צלע.',
      [`היקף המלבן: ${L(`2 × (${b} + ${a}) = ${2 * (a + b)}`)}`, `צלע הריבוע: ${L(`${2 * (a + b)} ÷ 4 = ${s}`)}`, `שטח הריבוע: ${L(`${s} × ${s} = ${mB(s * s)}`)} סמ"ר`], '',
      `שטח הריבוע גדול משטח המלבן (${a * b}): מכל המלבנים עם אותו היקף, לריבוע יש השטח הגדול ביותר.`);
    return withHint(mNum(d, `לריבוע יש אותו היקף כמו למלבן באורך ${b} ס"מ וברוחב ${a} ס"מ. מה השטח של הריבוע?`, '', s * s, [a * b, 4 * s, s * s + s, 2 * (a + b)], ex, ' סמ"ר'), `קודם מצאו את ההיקף של המלבן ${b} על ${a}. לריבוע אותו היקף, וכל ארבע הצלעות שלו שוות.`, `${L(`${b} + ${a} = ${a + b}`)} זה חצי מההיקף. צלע הריבוע היא רבע מכל ההיקף, כלומר חצי מ-${a + b}. ואז שטח = צלע כפול צלע.`); },
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
  unit(d) {
    for (;;) { const a = ri(4, 8), pa = a * pick([3.5, 4, 4.5, 5, 6]), b = ri(2, a - 1), pb = b * pick([4, 4.5, 5, 5.5, 6, 7]); const ua = pa / a, ub = pb / b; if (ua === ub || !Number.isInteger(pa * 2) || !Number.isInteger(pb * 2)) continue;
      const best = ua < ub ? ua : ub;
      const opts = [best, ua < ub ? ub : ua, r2((pa + pb) / (a + b)), r2(best + .5)].filter((v, i, s) => s.indexOf(v) === i); while (opts.length < 4) opts.push(r2(best + opts.length));
      const m = mc(opts.map(v => L(money(v)) + ' ₪'));
      const [wn, wp, wu] = ua < ub ? [b, pb, ub] : [a, pa, ua];
      const ex = mEx('מחלקים כל מחיר במספר השקיות, ומשווים את המחיר של שקית אחת.',
        [`חבילה של ${a}: ${L(`${money(pa)} ÷ ${a} = ${money(ua)}`)} ₪ לשקית`, `חבילה של ${b}: ${L(`${money(pb)} ÷ ${b} = ${money(ub)}`)} ₪ לשקית`, `הזולה יותר: ${mB(money(best) + ' ₪')} לשקית, בחבילה של ${ua < ub ? a : b}`], '',
        ua < ub ? 'כאן החבילה הגדולה משתלמת יותר. אבל זה לא תמיד כך, תמיד בודקים.' : 'כאן דווקא החבילה הקטנה משתלמת יותר. גדול לא תמיד זול יותר.');
      return withHint({ cat: 'math', d, lk: 'unit', prompt: `חבילה של ${a} שקיות שוקו עולה ${money(pa)} ₪. חבילה של ${b} שקיות שוקו עולה ${money(pb)} ₪. כמה עולה שקית אחת בחבילה המשתלמת יותר?`, vis: '', options: m.options, answer: m.answer, ex }, `חלקו כל מחיר במספר השקיות שבחבילה: ${L(`${money(pa)} ÷ ${a}`)} ו-${L(`${money(pb)} ÷ ${b}`)}. מה יוצא זול יותר?`, `בחבילה של ${wn}: ${L(`${money(wp)} ÷ ${wn} = ${money(wu)}`)} לשקית. חשבו גם את החבילה השנייה והשוו.`); }
  },
});
MPOOL[1].push('change');
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

/* ---------- CODES & SYMBOLS ----------
   Every solution opens with the rule in one sentence (cxRule), then solves THIS question step by step:
   symbols: the rows again, each solved symbol replaced by its number; ◆: the definition with a and b colored,
   the substituted expression and the calculation; calendar: a week strip; clock: a drawn clock face. */
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
/* t: the definition; f: the value; h: hint 2 for "a ◆ b"; s: the middle calculation line;
   inv: how to go back from the result to x (for "x ◆ b = R"), as [line, line, ...] where the last line ends in x */
const OPS = [
  { t: 'a × b + a', f: (a, b) => a * b + a, h: (a, b) => `קודם הכפל: ${L(`${a} × ${b} = ${a * b}`)}. עכשיו הוסיפו את a.`, s: (a, b) => `${a * b} + ${a}`,
    inv: (x, y, R0) => [[`x × ${y} + x = x × ${y + 1}`, `x ועוד ${y} פעמים x זה ${y + 1} פעמים x`], [`x × ${y + 1} = ${R0}`], [`x = ${R0} ÷ ${y + 1} = <b>${x}</b>`]] },
  { t: '2 × a − b', f: (a, b) => 2 * a - b, h: (a, b) => `קודם הכפל: ${L(`2 × ${a} = ${2 * a}`)}. עכשיו הורידו את b.`, s: (a, b) => `${2 * a} − ${b}`,
    inv: (x, y, R0) => [[`2 × x = ${R0} + ${y} = ${R0 + y}`, `מבטלים את ה-${L(`− ${y}`)}: מוסיפים ${y}`], [`x = ${R0 + y} ÷ 2 = <b>${x}</b>`, 'מבטלים את הכפל ב-2: מחלקים ב-2']] },
  { t: 'a × a − b', f: (a, b) => a * a - b, h: (a, b) => `קודם הכפל: ${L(`${a} × ${a} = ${a * a}`)}. עכשיו הורידו את b.`, s: (a, b) => `${a * a} − ${b}`,
    inv: (x, y, R0) => [[`x × x = ${R0} + ${y} = ${R0 + y}`, `מבטלים את ה-${L(`− ${y}`)}: מוסיפים ${y}`], [`x = <b>${x}</b>`, `איזה מספר כפול עצמו נותן ${R0 + y}? ${L(`${x} × ${x} = ${x * x}`)}`]] },
  { t: '(a + b) × 2', f: (a, b) => (a + b) * 2, h: (a, b) => `קודם הסוגריים: ${L(`${a} + ${b} = ${a + b}`)}. עכשיו כפלו ב-2.`, s: (a, b) => `${a + b} × 2`,
    inv: (x, y, R0) => [[`x + ${y} = ${R0} ÷ 2 = ${R0 / 2}`, 'מבטלים את הכפל ב-2: מחלקים ב-2'], [`x = ${R0 / 2} − ${y} = <b>${x}</b>`, `מבטלים את ה-${L(`+ ${y}`)}: מורידים ${y}`]] },
  { t: 'a × b − b', f: (a, b) => a * b - b, h: (a, b) => `קודם הכפל: ${L(`${a} × ${b} = ${a * b}`)}. עכשיו הורידו את b.`, s: (a, b) => `${a * b} − ${b}`,
    inv: (x, y, R0) => [[`x × ${y} = ${R0} + ${y} = ${R0 + y}`, `מבטלים את ה-${L(`− ${y}`)}: מוסיפים ${y}`], [`x = ${R0 + y} ÷ ${y} = <b>${x}</b>`, `מבטלים את הכפל ב-${y}: מחלקים ב-${y}`]] },
  { t: 'a + 3 × b', f: (a, b) => a + 3 * b, h: (a, b) => `קודם הכפל: ${L(`3 × ${b} = ${3 * b}`)}. עכשיו הוסיפו את a.`, s: (a, b) => `${a} + ${3 * b}`,
    inv: (x, y, R0) => [[`x + ${3 * y} = ${R0}`, `קודם הכפל: ${L(`3 × ${y} = ${3 * y}`)}`], [`x = ${R0} − ${3 * y} = <b>${x}</b>`, `מבטלים את ה-${L(`+ ${3 * y}`)}: מורידים ${3 * y}`]] }];

/* ---- explanation building blocks (all inline spans; code.css gives them display:block) ---- */
const cxRule = s => `<span class="cx-rule"><b>הכלל:</b> ${s}</span>`;
const cxAns = s => `<span class="cx-ans">התשובה: ${s}</span>`;
const cxMath = lines => `<span class="cx-math">${lines.map(l => `<span>${L(l)}</span>`).join('')}</span>`;
/* a step: number badge, then lines. A line is a string (math) or [math, note] (math with a short Hebrew note under it) */
const cxStep = (n, lines) => `<span class="cx-step"><span class="cx-n">${n}</span><span class="cx-body">${lines.map(l => Array.isArray(l) ? `<span class="cx-l">${L(l[0])}<span class="cx-note">${l[1]}</span></span>` : `<span class="cx-l">${L(l)}</span>`).join('')}</span></span>`;

/* ---------- symbol equations ---------- */
const SYMK = { '▲': 1, '●': 2, '■': 3 };
const symC = s => s.replace(/[▲●■]/g, m => `<span class="cx-s${SYMK[m]}">${m}</span>`);           /* a row with colored symbols */
const symV = (sym, v) => `<span class="cx-v cx-v${SYMK[sym]}">${v}</span>`;                       /* a number that replaced a symbol */
const symRow = (orig, sub) => [`<span class="cx-old">${symC(orig)}</span>`, ...(sub ? [symC(sub)] : [])];
const symShow = rows => `<div class="eqs">${(R() < .5 ? rows.slice().reverse() : shuffle(rows)).map(r => `<div class="eq">${L(r)}</div>`).join('')}</div>`;
const SYM_RULE = 'מתחילים מהשורה שיש בה רק סמל אחד. מוצאים אותו, ואז מציבים את המספר שלו בשורות האחרות.';
function genSym(d) {
  const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9);
  if (d === 1) {
    const r1 = `▲ + ▲ = ${2 * a}`, r2 = `▲ + ● = ${a + b}`;
    const ex = cxRule(SYM_RULE) + `<span class="cx-steps">${cxStep(1, [...symRow(r1), `${symC('▲')} = ${2 * a} ÷ 2 = ${symV('▲', a)}`])}${cxStep(2, [...symRow(r2, `${symV('▲', a)} + ● = ${a + b}`), `${symC('●')} = ${a + b} − ${a} = <b>${b}</b>`])}</span>` + cxAns(L(`● = ${b}`));
    return { ...withHint(numQ('code', d, 'כל סמל מייצג מספר. איזה מספר מייצג ●?', symShow([r1, r2]), b, [a, a + b, 2 * a - b, b + 1], ex), `התחילו מהשורה ${L(r1)}: איזה מספר ועוד עצמו נותן ${2 * a}?`, a === b ? `▲ הוא חצי מ-${2 * a}. אחר כך: ● הוא ${a + b} פחות ▲.` : `▲ = ${a}, כי ${L(`${a} + ${a} = ${2 * a}`)}. הציבו אותו בשורה ${L(r2)} ומצאו את ●.`), lk: 'symbols' };
  }
  if (d === 2) {
    const r1 = `▲ + ▲ + ▲ = ${3 * a}`, r2 = `▲ + ● = ${a + b}`, r3 = `● + ■ = ${b + c}`;
    const ex = cxRule(SYM_RULE + ' כאן זו שרשרת: ▲, אחריו ●, ובסוף ■.') + `<span class="cx-steps">${cxStep(1, [...symRow(r1), `${symC('▲')} = ${3 * a} ÷ 3 = ${symV('▲', a)}`])}${cxStep(2, [...symRow(r2, `${symV('▲', a)} + ● = ${a + b}`), `${symC('●')} = ${a + b} − ${a} = ${symV('●', b)}`])}${cxStep(3, [...symRow(r3, `${symV('●', b)} + ■ = ${b + c}`), `${symC('■')} = ${b + c} − ${b} = <b>${c}</b>`])}</span>` + cxAns(L(`■ = ${c}`));
    return { ...withHint(numQ('code', d, 'כל סמל מייצג מספר. איזה מספר מייצג ■?', symShow([r1, r2, r3]), c, [b, a, b + c - a, c + 1], ex), `זו שרשרת: מהשורה ${L(r1)} מוצאים את ▲, איתו את ●, ואיתו את ■. מה ▲?`, a === c ? `▲ הוא שליש מ-${3 * a}. הציבו אותו ב-${L(r2)} ומצאו את ●, ואז את ■.` : b === c ? `▲ = ${a}, כי ${L(`${a} + ${a} + ${a} = ${3 * a}`)}. הציבו אותו ב-${L(r2)} ומצאו את ●, ואז את ■.` : `▲ = ${a}, כי ${L(`${a} + ${a} + ${a} = ${3 * a}`)}. לכן ${L(`● = ${a + b} − ${a} = ${b}`)}. עכשיו השורה של ■.`), lk: 'symbols' };
  }
  const r1 = `▲ × ▲ = ${a * a}`, r2 = `● − ▲ = ${b}`, r3 = `● × ■ = ${(a + b) * c}`;
  const ex = cxRule(SYM_RULE + ' בסוף מחברים את מה שביקשו.') + `<span class="cx-steps">${cxStep(1, [...symRow(r1), [`${symC('▲')} = ${symV('▲', a)}`, `כי ${L(`${a} × ${a} = ${a * a}`)}`]])}${cxStep(2, [...symRow(r2, `● − ${symV('▲', a)} = ${b}`), [`${symC('●')} = ${b} + ${a} = ${symV('●', a + b)}`, 'מבטלים את החיסור: מחברים']])}${cxStep(3, [...symRow(r3, `${symV('●', a + b)} × ■ = ${(a + b) * c}`), [`${symC('■')} = ${(a + b) * c} ÷ ${a + b} = ${symV('■', c)}`, 'מבטלים את הכפל: מחלקים']])}${cxStep(4, [`${symC('■ + ▲')} = ${symV('■', c)} + ${symV('▲', a)} = <b>${c + a}</b>`])}</span>` + cxAns(L(`■ + ▲ = ${c + a}`));
  return { ...withHint(numQ('code', d, 'כל סמל מייצג מספר. כמה זה ■ + ▲?', symShow([r1, r2, r3]), c + a, [c, a * c, c + a + 1, a + b + c], ex), `התחילו מ-${L(r1)}: איזה מספר כפול עצמו נותן ${a * a}? ממנו מוצאים את ●, ואז את ■.`, b === c ? `▲ = ${a}, כי ${L(`${a} × ${a} = ${a * a}`)}. מ-${L(r2)} מוצאים את ●, ואז מחלקים את ${(a + b) * c} ב-●.` : `▲ = ${a}, ולכן ${L(`● = ${b} + ${a} = ${a + b}`)}. עכשיו ${L(`■ = ${(a + b) * c} ÷ ${a + b}`)}, ובסוף מחברים ■ + ▲.`), lk: 'symbols' };
}

/* ---------- invented operation ◆ ---------- */
/* the definition with a and b (or the numbers put in their place) colored */
const opPut = (t, A, B) => t.replace(/[ab]/g, m => `<span class="cx-${m}">${m === 'a' ? A : B}</span>`);
const opDef = op => `<span class="cx-def">${L(`${opPut('a ◆ b', 'a', 'b')} = ${opPut(op.t, 'a', 'b')}`)}</span>`;
/* one full substitution: "x ◆ y = (definition with x, y) = middle = result" */
const opCalc = (op, x, y, last) => cxMath([`${opPut('a ◆ b', x, y)} = ${opPut(op.t, x, y)}`, `= ${op.s(x, y)}`, `= ${last ? `<b>${op.f(x, y)}</b>` : op.f(x, y)}`]);
const opWho = (x, y) => `<span class="cx-who">${L(`<span class="cx-a">a = ${x}</span>`)} ${L(`<span class="cx-b">b = ${y}</span>`)}</span>`;
const OP_RULE = 'מעתיקים את ההגדרה. במקום a שמים את המספר הראשון, ובמקום b את השני. כפל וסוגריים לפני חיבור וחיסור.';
function genOp(d) {
  const op = pick(OPS); const def = `<div class="eqs"><div class="eq">${L(`a ◆ b = ${op.t}`)}</div></div>`;
  if (d === 1) {
    let x, y, ans, k = 0; do { x = ri(2, 9); y = ri(2, 6); ans = op.f(x, y); } while (ans < 2 && k++ < 50);
    const ex = cxRule(OP_RULE) + opDef(op) + opWho(x, y) + opCalc(op, x, y, true) + cxAns(L(`${x} ◆ ${y} = ${ans}`));
    return { ...withHint(numQ('code', d, `הפעולה ◆ מוגדרת כך. כמה זה ${L(`${x} ◆ ${y}`)}?`, def, ans, [op.f(y, x), ans + y, x * y], ex), `ב-${L(`${x} ◆ ${y}`)} המספר הראשון הוא ${L(`a = ${x}`)} והשני ${L(`b = ${y}`)}. הציבו אותם בהגדרה ${L(op.t)}.`, op.h(x, y)), lk: 'op' };
  }
  if (d === 2) {
    for (let k = 0; k < 100; k++) {
      const x = ri(1, 6), y = ri(1, 5), z = ri(1, 4); const in1 = op.f(x, y); if (in1 < 0) continue; const ans = op.f(in1, z); if (ans < 2 || ans > 300) continue;
      const ex = cxRule(OP_RULE + ' קודם מה שבסוגריים, ואת התוצאה שלו מכניסים בתור a.') + opDef(op)
        + `<span class="cx-steps">${cxStep(1, [[`(${x} ◆ ${y})`, 'קודם הסוגריים']])}</span>` + opWho(x, y) + opCalc(op, x, y, false)
        + `<span class="cx-steps">${cxStep(2, [[`${opPut('a', in1)} ◆ ${opPut('b', '', z)}`, `התוצאה ${in1} נכנסת בתור a`]])}</span>` + opWho(in1, z) + opCalc(op, in1, z, true)
        + cxAns(L(`(${x} ◆ ${y}) ◆ ${z} = ${ans}`));
      return { ...withHint(numQ('code', d, `הפעולה ◆ מוגדרת כך. כמה זה ${L(`(${x} ◆ ${y}) ◆ ${z}`)}?`, def, ans, [op.f(x, op.f(y, z)), in1, op.f(z, in1)], ex), `קודם הסוגריים: חשבו ${L(`${x} ◆ ${y}`)} לפי ההגדרה. את התוצאה מכניסים בתור a, ואת ${z} בתור b.`, `${L(`${x} ◆ ${y} = ${in1}`)}. עכשיו חשבו ${L(`${in1} ◆ ${z}`)}, שוב לפי ההגדרה ${L(op.t)}.`), lk: 'op' };
    }
  }
  for (let k = 0; k < 100; k++) {
    const x = ri(2, 9), y = ri(2, 6); const R0 = op.f(x, y); if (R0 < 1) continue;
    const ex = cxRule('כותבים את ההגדרה עם x במקום a. אחר כך הולכים אחורה: כל פעולה מבטלים בפעולה ההפוכה.') + opDef(op) + opWho('x', y)
      + `<span class="cx-steps">${cxStep(1, [`${opPut('a ◆ b', 'x', y)} = ${opPut(op.t, 'x', y)} = ${R0}`])}${op.inv(x, y, R0).map((l, i) => cxStep(i + 2, [l.length > 1 ? l : l[0]])).join('')}</span>`
      + `<span class="cx-check">בדיקה: ${L(`${opPut('a ◆ b', x, y)} = ${opPut(op.t, x, y)} = ${R0}`)} ✓</span>` + cxAns(L(`x = ${x}`));
    return { ...withHint(numQ('code', 3, `הפעולה ◆ מוגדרת כך. אם ${L(`x ◆ ${y} = ${R0}`)}, מה x?`, def, x, [x + 1, x - 1, R0 - y, y], ex), `בהגדרה ${L(op.t)}, כאן ${L(`b = ${y}`)} והתוצאה ${R0}. איזה מספר חסר במקום a?`, `הציבו ${L(`b = ${y}`)}: ${L(`${op.t.replace(/b/g, y).replace(/a/g, 'x')} = ${R0}`)}. נסו להציב בזה את התשובות לבחירה.`), lk: 'op' };
  }
  return genSym(d);
}

/* ---------- days of the week ---------- */
/* a strip of 7 days (reads right to left) from the start day: the start, the r steps forward, the answer */
function calStrip(s, r, startLbl, lbl) {
  let h = '';
  for (let i = 0; i < 7; i++) {
    const cls = (i === 0 ? ' st' : '') + (i > 0 && i < r ? ' jp' : '') + (i === r ? ' ans' : '') + (i > r ? ' off' : '');
    h += `<span class="cal-d${cls}"><i>${i === 0 ? startLbl : lbl(i)}</i><b>${DAYS[(s + i) % 7]}</b></span>`;
  }
  return `<span class="cal-strip">${h}</span>`;
}
const calWeeks = (q, day) => `<span class="cal-wk"><span class="cal-loop">↺</span> ${q === 1 ? 'שבוע שלם אחד הוא' : `${q} שבועות שלמים הם`} ${L(`7 × ${q} = ${7 * q}`)} ימים. אחריהם חוזרים שוב ליום ${day}.</span>`;
const calSteps = r => r === 0 ? 'לא נשאר כלום, אז נשארים באותו יום.' : r === 1 ? 'נשאר יום אחד: זזים יום אחד קדימה.' : `נשארו ${r} ימים: זזים ${r} ימים קדימה.`;
function genCal(d) {
  const s = ri(0, 6);
  if (d === 3 && R() < .5) {
    const D = ri(15, 31); const ans = (s + D - 1) % 7; const m = mc([ans, (ans + 1) % 7, (ans + 6) % 7, (ans + 2) % 7].map(i => DAYS[i]));
    const cq = Math.floor((D - 1) / 7), cr = (D - 1) % 7, base = 1 + 7 * cq;
    const same = []; for (let t = 1; t <= base; t += 7) same.push(t);
    const ex = cxRule('כל 7 ימים חוזר אותו יום בשבוע. מוצאים את התאריך הקרוב שיוצא באותו יום כמו ה-1, וממנו סופרים קדימה.')
      + `<span class="cx-math"><span>${L(`${D} − 1 = ${D - 1} = 7 × ${cq} + <b>${cr}</b>`)}</span></span>`
      + `<span class="cal-wk"><span class="cal-loop">↺</span> באותו יום כמו ה-1 (יום ${DAYS[s]}) יוצאים: ${L(same.join(' → '))}</span>`
      + `<span class="cal-wk">${cr === 0 ? `ה-${D} הוא בדיוק אחד מהם.` : `מה-${base} זזים עוד ${cr === 1 ? 'יום אחד' : cr + ' ימים'} קדימה, עד ה-${D}.`}</span>`
      + calStrip(s, cr, `ה-${base}`, i => base + i <= 31 ? `ה-${base + i}` : '') + cxAns(`ה-${D} יוצא ביום ${DAYS[ans]}`);
    return { ...withHint({ cat: 'code', d, prompt: `ה-1 בחודש יצא ביום ${DAYS[s]}. באיזה יום בשבוע יצא ה-${D} באותו חודש?`, vis: '', options: m.options, answer: m.answer, ex }, `מה-1 עד ה-${D} עוברים ${D - 1} ימים. כמה שבועות שלמים יש בזה, וכמה ימים נשארים?`, cr === 0 ? `${L(`${D - 1} = 7 × ${cq}`)}: בדיוק שבועות שלמים, בלי שארית. מה זה אומר על היום בשבוע?` : `${L(`${D - 1} = 7 × ${cq} + ${cr}`)}. השבועות השלמים לא מזיזים את היום, אז סופרים רק ${cr === 1 ? 'יום אחד' : cr + ' ימים'} קדימה מהיום של ה-1.`), lk: 'calendar' };
  }
  const N = d === 1 ? ri(9, 30) : ri(40, 150); const ans = (s + N) % 7;
  const m = mc([ans, (ans + 1) % 7, (ans + 6) % 7, (ans + 2) % 7].map(i => DAYS[i]));
  const cq = Math.floor(N / 7), cr = N % 7;
  const ex = cxRule('כל 7 ימים חוזרים לאותו יום בשבוע. לכן מחלקים ב-7, ורק השארית אומרת כמה ימים לזוז.')
    + `<span class="cx-math"><span>${L(`${N} = 7 × ${cq} + <b>${cr}</b>`)}</span></span>`
    + calWeeks(cq, DAYS[s]) + `<span class="cal-wk">${calSteps(cr)}</span>`
    + calStrip(s, cr, 'היום', i => L(`+${i}`)) + cxAns(`יום ${DAYS[ans]}`);
  return { ...withHint({ cat: 'code', d, prompt: `היום יום ${DAYS[s]}. איזה יום יהיה בעוד ${N} ימים?`, vis: '', options: m.options, answer: m.answer, ex }, `כל 7 ימים חוזרים לאותו יום בשבוע. כמה שבועות שלמים יש ב-${N} ימים, וכמה ימים נשארים?`, cr === 0 ? `${L(`${N} = 7 × ${cq}`)}: בדיוק שבועות שלמים, בלי שארית. מה זה אומר על היום?` : `${L(`${N} = 7 × ${cq} + ${cr}`)}. השבועות לא מזיזים את היום, אז סופרים רק ${cr === 1 ? 'יום אחד' : cr + ' ימים'} קדימה מהיום.`), lk: 'calendar' };
}

/* ---------- clock angles ---------- */
/* a clock face: both hands at their real angles, a dashed mark where the hour hand would be at h:00, the small angle shaded */
function clockFace(h, m) {
  const C = 70, P = (deg, r) => [C + r * Math.sin(deg * Math.PI / 180), C - r * Math.cos(deg * Math.PI / 180)].map(v => Math.round(v * 10) / 10);
  const H = (30 * h + m / 2) % 360, M = 6 * m;
  let from = H, span = ((M - H) % 360 + 360) % 360; if (span > 180) { from = M; span = 360 - span; }
  const r = 24, p1 = P(from, r), p2 = P(from + span, r);
  let s = `<svg class="ck" viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="שעון"><circle class="ck-rim" cx="${C}" cy="${C}" r="64"/>`;
  for (let i = 0; i < 12; i++) { const a = P(i * 30, 60), b = P(i * 30, 55), t = P(i * 30, 46); s += `<line class="ck-tk" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/><text class="ck-num" x="${t[0]}" y="${t[1]}" dy="3.5" text-anchor="middle">${i || 12}</text>`; }
  s += `<path class="ck-wedge" d="M${C} ${C}L${p1[0]} ${p1[1]}A${r} ${r} 0 0 1 ${p2[0]} ${p2[1]}Z"/>`;
  const g = P(30 * (h % 12), 34); s += `<line class="ck-ghost" x1="${C}" y1="${C}" x2="${g[0]}" y2="${g[1]}"/>`;
  const hh = P(H, 34), mm = P(M, 52);
  s += `<line class="ck-h" x1="${C}" y1="${C}" x2="${hh[0]}" y2="${hh[1]}"/><line class="ck-m" x1="${C}" y1="${C}" x2="${mm[0]}" y2="${mm[1]}"/><circle class="ck-pin" cx="${C}" cy="${C}" r="3.5"/></svg>`;
  return s;
}
function genClock(d) {
  const h = ri(1, 11), m = pick([10, 20, 30, 40, 50]), tm = `${h}:${String(m).padStart(2, '0')}`;
  const H = 30 * h + m / 2, M = 6 * m, diff = Math.abs(H - M);
  const a = Math.min(diff, 360 - diff);
  let naive = Math.abs(30 * h - 6 * m); naive = Math.min(naive, 360 - naive);
  const cands = [naive, a + 15, a - 15, a + 30, a - 30, a + 20, a + 10, a + 5].filter(v => v > 0 && v <= 180 && v !== a);
  const ex = cxRule(`מודדים כל מחוג במעלות מה-12, עם כיוון השעון, ומחסירים. מחוג הדקות זז ${L('6°')} בכל דקה. מחוג השעות זז ${L('30°')} בכל שעה, ועוד חצי מעלה בכל דקה.`)
    + `<span class="ck-wrap">${clockFace(h, m)}<span class="ck-key"><span class="ck-k ck-km">מחוג הדקות: ${L(`${M}°`)}</span><span class="ck-k ck-kh">מחוג השעות: ${L(`${fmt(H)}°`)}</span><span class="ck-k ck-kg">הקו המקווקו: איפה מחוג השעות היה ב-${L(`${h}:00`)}</span><span class="ck-k ck-ka">הזווית: ${L(`<b>${a}°</b>`)}</span></span></span>`
    + `<span class="cx-steps">${cxStep(1, [[`${m} × 6 = ${M}°`, `מחוג הדקות: ${L('6°')} לכל דקה`]])}${cxStep(2, [`${h} × 30 + ${m} × 0.5`, [`= ${30 * h} + ${m / 2} = ${fmt(H)}°`, `מחוג השעות: ${L('30°')} לכל שעה, ועוד ${L(`${m / 2}°`)} כי עברו ${m} דקות`]])}${cxStep(3, diff > 180 ? [[`${Math.max(H, M)} − ${Math.min(H, M)} = ${diff}°`, 'ההפרש בין המחוגים'], [`360 − ${diff} = <b>${a}°</b>`, `זה יותר מ-${L('180°')}, אז הזווית הקטנה היא מהצד השני`]] : [[`${fmt(Math.max(H, M))} − ${fmt(Math.min(H, M))} = <b>${a}°</b>`, 'ההפרש בין המחוגים']])}</span>`
    + `<span class="cx-check">המלכודת: מי ששוכח שמחוג השעות זז, מקבל בטעות ${L(`${naive}°`)}</span>` + cxAns(L(`${a}°`));
  const q = numQ('code', d, `מה הזווית הקטנה בין מחוג השעות למחוג הדקות בשעה ${L(tm)}?`, '', a, cands, ex, '°'); q.options = q.options.map(o => o.replace(/<\/span>°$/, '°</span>'));
  return { ...withHint(q, `בשעה ${L(tm)} מחוג הדקות מצביע על ${m / 5}. ומחוג השעות? הוא כבר עבר את ה-${h} בדרך ל-${h + 1}.`, `מחוג הדקות נמצא על ${L(`${m} × 6 = ${6 * m}`)} מעלות. מחוג השעות זז 30 מעלות בכל שעה, ועוד חצי מעלה בכל דקה: חשבו ${L(`${h} × 30 + ${m} × 0.5`)}.`), lk: 'clock' };
}
function genCode(d) {
  const T = d === 1 ? pick(['sym', 'op', 'cal']) : pick(['sym', 'op', 'cal', 'clock']);
  return T === 'sym' ? genSym(d) : T === 'op' ? genOp(d) : T === 'cal' ? genCal(d) : genClock(d);
}

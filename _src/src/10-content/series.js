/* ---------- NUMBER SERIES ----------
   Every series keeps how each number was made (step), so the solution shows the full calculation:
   the rule, one line per step, and for "difference" series also the row of differences. */
const sgn = n => n < 0 ? `− ${-n}` : `+ ${n}`;
/* one calculation line; the hidden number is shown in bold */
const calcLine = (expr, val, isQ) => `<span>${L(`${expr} = ${isQ ? `<b>${val}</b>` : val}`)}</span>`;
function seriesCalc(t, hide, step, from = 1) {
  const lines = [];
  for (let i = from; i < t.length; i++) lines.push(calcLine(step(i), t[i], i === hide));
  return `<span class="calc">${lines.join('')}</span>`;
}
/* the row of differences, for series where the differences make their own pattern */
function diffRow(t, note) {
  const d = t.slice(1).map((v, i) => v - t[i]);
  return `<span class="calc diffs"><span>ההפרשים (באותו כיוון כמו הסדרה): ${d.map(x => L(x > 0 ? "+" + x : "−" + -x)).join(" , ")}</span><span>${note}</span></span>`;
}
function genSeries(d) {
  let t = [], rule = '', step, from = 1, extra = '';
  const T = d === 1 ? pick(['arith', 'arith', 'geom', 'alt']) : d === 2 ? pick(['incdiff', 'squares', 'interleave', 'muladd', 'alt2', 'decdiff']) : pick(['fib', 'diffgeom', 'cubes', 'interleave2', 'primes', 'alt3', 'muladd']);
  switch (T) {
    case 'arith': { const k = pick([3, 4, 6, 7, 8, 9, 11, 12, 15, -3, -4, -6, -7]); const a = ri(2, 40) + (k < 0 ? 60 : 0); for (let i = 0; i < 6; i++) t.push(a + k * i);
      rule = k > 0 ? `כל מספר גדול מהקודם ב-${k}.` : `כל מספר קטן מהקודם ב-${-k}.`; step = i => `${t[i - 1]} ${sgn(k)}`; break; }
    case 'geom': { const a = ri(1, 5), r = pick([2, 2, 3]); for (let i = 0; i < 6; i++) t.push(a * r ** i);
      rule = `כל מספר גדול פי ${r} מהקודם.`; step = i => `${t[i - 1]} × ${r}`; break; }
    case 'alt': { const a = ri(5, 12), b = ri(2, a - 2); let x = ri(1, 20); for (let i = 0; i < 7; i++) { t.push(x); x += i % 2 === 0 ? a : -b; }
      rule = `לסירוגין: מוסיפים ${a}, ואז מחסירים ${b}.`; step = i => `${t[i - 1]} ${i % 2 ? '+ ' + a : '− ' + b}`; break; }
    case 'incdiff': { let x = ri(1, 20); const s = ri(1, 4), gg = pick([1, 2]); for (let i = 0; i < 6; i++) { t.push(x); x += s + gg * i; }
      rule = `סדרת הפרשים: ההפרש בין כל שני מספרים גדל ב-${gg} בכל צעד.`; step = i => `${t[i - 1]} + ${t[i] - t[i - 1]}`;
      extra = diffRow(t, `כל הפרש גדול ב-${gg} מהקודם. לכן ההפרש הבא הוא ${t[t.length - 1] - t[t.length - 2]}.`); break; }
    case 'decdiff': { let x = ri(80, 120); const s = ri(9, 13); for (let i = 0; i < 6; i++) { t.push(x); x -= s - i; }
      rule = 'סדרת הפרשים: מחסירים בכל צעד מספר קטן ב-1 מהפעם הקודמת.'; step = i => `${t[i - 1]} − ${t[i - 1] - t[i]}`;
      extra = diffRow(t, `ההפרשים קטנים ב-1 בכל צעד. לכן מחסירים הפעם ${t[t.length - 2] - t[t.length - 1]}.`); break; }
    case 'squares': { const c = pick([0, 0, 1, -1, 2]), st = ri(1, 4); for (let i = 0; i < 6; i++) { const n = st + i; t.push(n * n + c); }
      rule = c === 0 ? 'מספרים בריבוע: מספר כפול עצמו, 1, 2, 3... ממשיכים לפי הסדר.' : `מספר בריבוע (מספר כפול עצמו), ${c > 0 ? 'ועוד ' + c : 'פחות ' + (-c)}.`;
      step = i => `${st + i} × ${st + i}${c ? ' ' + sgn(c) : ''}`; from = 0;
      extra = diffRow(t, 'רמז שעוזר לזהות ריבועים: ההפרשים הם מספרים אי-זוגיים עוקבים (3, 5, 7...).'); break; }
    case 'interleave': { let x = ri(1, 10), y = ri(25, 40); const a = ri(2, 5), b = ri(2, 4); for (let i = 0; i < 8; i++) { if (i % 2 === 0) { t.push(x); x += a; } else { t.push(y); y -= b; } }
      rule = `שתי סדרות שזורות זו בזו. מסתכלים על כל מספר שני: במקומות 1, 3, 5... עולים ב-${a}. במקומות 2, 4, 6... יורדים ב-${b}.`;
      step = i => `${t[i - 2]} ${i % 2 === 0 ? '+ ' + a : '− ' + b}`; from = 2; break; }
    case 'muladd': { const v = pick([[2, 1], [2, -1], [3, -1], [2, 2], [3, 1], [2, -2]]); let x = ri(3, 5); for (let i = 0; i < 6; i++) { t.push(x); x = x * v[0] + v[1]; }
      rule = `כל מספר = הקודם כפול ${v[0]}, ${v[1] > 0 ? 'ועוד ' + v[1] : 'פחות ' + (-v[1])}.`; step = i => `${t[i - 1]} × ${v[0]} ${sgn(v[1])}`; break; }
    case 'alt2': { const m = pick([2, 3]), p = ri(1, 6); let x = ri(1, 5); for (let i = 0; i < 7; i++) { t.push(x); x = i % 2 === 0 ? x * m : x + p; }
      rule = `לסירוגין: כפול ${m}, ואז ועוד ${p}.`; step = i => `${t[i - 1]} ${i % 2 ? '× ' + m : '+ ' + p}`; break; }
    case 'fib': { const a = ri(1, 5), b = ri(a, a + 5); t = [a, b]; while (t.length < 7) t.push(t[t.length - 1] + t[t.length - 2]);
      rule = 'כל מספר הוא סכום שני המספרים שלפניו.'; step = i => `${t[i - 2]} + ${t[i - 1]}`; from = 2; break; }
    case 'diffgeom': { let x = ri(1, 10), dd = ri(1, 3); const r = pick([2, 3]); for (let i = 0; i < 6; i++) { t.push(x); x += dd; dd *= r; }
      rule = `סדרת הפרשים: ההפרש גדל פי ${r} בכל צעד.`; step = i => `${t[i - 1]} + ${t[i] - t[i - 1]}`;
      extra = diffRow(t, `כל הפרש גדול פי ${r} מהקודם. לכן ההפרש הבא הוא ${t[t.length - 1] - t[t.length - 2]}.`); break; }
    case 'cubes': {
      if (R() < .5) { for (let n = 1; n <= 6; n++) t.push(n * n * n); rule = 'מספרים בחזקה שלישית: מספר כפול עצמו כפול עצמו.'; step = i => `${i + 1} × ${i + 1} × ${i + 1}`; }
      else { for (let n = 1; n <= 6; n++) t.push(n * (n + 1)); rule = 'מכפלה של שני מספרים עוקבים.'; step = i => `${i + 1} × ${i + 2}`; extra = diffRow(t, 'דרך נוספת: ההפרשים הם 4, 6, 8... וגדלים ב-2.'); }
      from = 0; break; }
    case 'interleave2': { let x = ri(1, 4), y = ri(40, 60); const b = ri(3, 7); for (let i = 0; i < 8; i++) { if (i % 2 === 0) { t.push(x); x *= 2; } else { t.push(y); y -= b; } }
      rule = `שתי סדרות שזורות זו בזו. במקומות 1, 3, 5... כל מספר כפול 2. במקומות 2, 4, 6... יורדים ב-${b}.`;
      step = i => `${t[i - 2]} ${i % 2 === 0 ? '× 2' : '− ' + b}`; from = 2; break; }
    case 'primes': { const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]; const s = ri(0, 4), add = pick([0, 0, 1]); t = P.slice(s, s + 6).map(p => p + add);
      rule = (add ? 'מספרים ראשוניים ועוד 1.' : 'מספרים ראשוניים לפי הסדר.') + ' ראשוני = מספר שמתחלק רק ב-1 ובעצמו (2, 3, 5, 7, 11, 13...).';
      step = add ? (i => `${P[s + i]} + 1`) : null; from = 0; break; }
    case 'alt3': { let x = ri(1, 3), k = 1; const ks = []; for (let i = 0; i < 7; i++) { t.push(x); if (i % 2 === 0) { ks.push(k); x += k; k++; } else { ks.push(0); x *= 2; } }
      rule = 'לסירוגין: מוסיפים (בפעם הראשונה 1, אחר כך 2, אחר כך 3...), ואז כופלים ב-2.'; step = i => `${t[i - 1]} ${(i - 1) % 2 === 0 ? '+ ' + ks[i - 1] : '× 2'}`; break; }
  }
  const hide = (d === 3 && R() < .35 && !T.startsWith('interleave') && T !== 'primes') ? ri(2, t.length - 2) : t.length - 1;
  const ans = t[hide], prev = t[hide - 1], prev2 = t[hide - 2];
  const cont = prev + (prev - prev2);
  const vis = '<div class="series">' + t.map((v, i) => `<span class="cell${i === hide ? ' q' : ''}">${i === hide ? '?' : v}</span>`).join('<span class="arr">←</span>') + '</div>';
  const calc = step ? seriesCalc(t, hide, step, from) : `<span class="calc"><span>${L(t.map((v, i) => i === hide ? `<b>${v}</b>` : v).join(' , '))}</span></span>`;
  const ex = `${rule}${calc}${extra}${hide < t.length - 1 ? '<span class="calc"><span>כשהמספר החסר באמצע: בודקים שהחוק עובד גם על המספר שאחריו.</span></span>' : ''}`;
  const q = Object.assign(numQ('series', d, 'איזה מספר מתאים במקום סימן השאלה?', vis, ans, [cont, ans + 1, ans - 1, ans + Math.abs(ans - prev), ans + 2, ans - 2], ex), { lk: 'series' });
  return withHint(q, ...seriesHints(T, t, hide, step, from, rule));
}
/* hints from this series' own numbers: where to look, then two worked steps that do not touch the hidden number */
function seriesHints(T, t, hide, step, from, rule) {
  const vis = t.map((_, i) => i).filter(i => i !== hide), [a, b, c] = vis.slice(0, 3).map(i => t[i]);
  let h1;
  if (T.startsWith('interleave')) h1 = `הסתכלו רק על כל מספר שני: ${t[0]}, ${t[2]}, ${t[4]}... ובנפרד על ${t[1]}, ${t[3]}, ${t[5]}...`;
  else if (T === 'fib') h1 = `חברו שני מספרים צמודים: ${L(`${a} + ${b}`)}. איפה התוצאה מופיעה בסדרה?`;
  else if (T === 'primes') h1 = /ועוד 1/.test(rule) ? `הורידו 1 מכל מספר. במה המספרים שיוצאים מיוחדים? נסו לחלק אותם ב-2, 3 ו-5.` : `נסו לחלק כל מספר ב-2, 3 ו-5. מה מיוחד במספרים האלה?`;
  else if (T === 'squares') h1 = `המספרים מוכרים מלוח הכפל? נסו לכתוב את ${b} ואת ${c} כמספר כפול עצמו${/ועוד|פחות/.test(rule) ? ', ועוד או פחות קצת' : ''}.`;
  else if (T === 'cubes') h1 = /עוקבים/.test(rule) ? `נסו לכתוב את ${c} כמכפלה של שני מספרים צמודים.` : `איזה מספר כפול עצמו כפול עצמו נותן ${b}? ואיזה נותן ${c}?`;
  else if (T === 'geom' || T === 'muladd' || T === 'diffgeom') h1 = `המספרים גדלים מהר. בדקו פי כמה ${b} גדול מ-${a}, או כמה מוסיפים מ-${a} ל-${b} ומ-${b} ל-${c}.`;
  else h1 = `כתבו מה קורה בכל צעד: כמה עולה או יורד מ-${a} ל-${b}, ומ-${b} ל-${c}?`;
  /* h2: two calculation lines that do not use the hidden number */
  const lines = [];
  if (step) for (let i = from; i < t.length && lines.length < 2; i++) { const back = T.startsWith('interleave') || T === 'fib' ? [i - 1, i - 2] : [i - 1]; if (i === hide || back.includes(hide)) continue; lines.push(L(`${step(i)} = ${t[i]}`)); }
  const tail = /^(incdiff|decdiff|diffgeom)$/.test(T) ? 'איך משתנה המספר שמוסיפים או מורידים בכל צעד?' : /^alt/.test(T) ? 'שימו לב: יש שתי פעולות שמתחלפות.' : T === 'fib' ? 'המשיכו כך עד סימן השאלה.' : 'המשיכו באותו חוק עד סימן השאלה.';
  const mid = hide < t.length - 1 ? ' בדקו שהחוק עובד גם על המספר שאחרי סימן השאלה.' : '';
  const h2 = step ? `${lines.join('<br>')}<br>${tail}${mid}` : `אלה מספרים ראשוניים: מתחלקים רק ב-1 ובעצמם. מה הראשוני הבא אחרי ${t[hide - 1]}?`;
  return [h1, h2];
}
/* ---- number tables & rings ---- */
const TROWS = [
  { d: 1, t: 'a + b', f: (a, b) => a + b }, { d: 1, t: 'a × b', f: (a, b) => a * b }, { d: 2, t: '(a + b) × 2', f: (a, b) => (a + b) * 2 },
  { d: 2, t: 'a × b − a', f: (a, b) => a * b - a }, { d: 2, t: 'a × 2 + b', f: (a, b) => a * 2 + b }, { d: 3, t: 'a × a − b', f: (a, b) => a * a - b },
  { d: 3, t: '(a − b) × (a + b)', f: (a, b) => (a - b) * (a + b) }, { d: 3, t: 'a × b + a + b', f: (a, b) => a * b + a + b }];
function genTable(d) {
  const pool = TROWS.filter(r => r.d <= Math.min(d, 3)); const pref = pool.filter(r => r.d === Math.min(d, 3)); const rule = pick(pref.length && R() < .7 ? pref : pool);
  for (let t = 0; t < 80; t++) {
    const rows = Array.from({ length: 3 }, () => { const a = ri(3, 9), b = ri(2, a - 1); return [a, b, rule.f(a, b)]; });
    if (rows.some(r => r[2] < 0 || r[2] > 200) || new Set(rows.map(r => r[0] + ',' + r[1])).size < 3) continue;
    const ALT = [(a, b) => a + b, (a, b) => a * b, (a, b) => a - b, (a, b) => 2 * a + b, (a, b) => a + 2 * b, (a, b) => (a + b) * 2, (a, b) => a * b + a, (a, b) => a * b - b, (a, b) => a * a - b, (a, b) => a * a + b].concat(TROWS.map(r => r.f));
    if (d < 4 && ALT.some(f => f !== rule.f && f(rows[0][0], rows[0][1]) === rows[0][2] && f(rows[1][0], rows[1][1]) === rows[1][2] && f(rows[2][0], rows[2][1]) !== rows[2][2])) continue;
    let hideCol = 2;
    if (d >= 4) { const [a, b, c] = rows[2]; const sols = []; for (let x = 1; x <= 15; x++) if (rule.f(x, b) === c) sols.push(x); if (sols.length !== 1) continue; hideCol = 0; }
    const ans = rows[2][hideCol];
    const vis = `<div class="ntab-wrap"><table class="ntab">${rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="${j === 2 ? 'res' : ''} ${i === 2 && j === hideCol ? 'q' : ''}">${i === 2 && j === hideCol ? '?' : v}</td>`).join('')}</tr>`).join('')}</table></div>`;
    const cands = [rows[2][0] + rows[2][1], rows[2][0] * rows[2][1], ans + 1, ans - 1, ans + rows[2][1]];
    const r0 = rows[0], c0 = rule.t.replace(/\b([ab])\b/g, m => m === 'a' ? r0[0] : r0[1]);
    return withHint(numQ('series', d, d >= 4 ? 'בכל שורה המספר במשבצת המודגשת מתקבל משני המספרים האחרים, לפי אותו חוק. איזה מספר חסר?' : 'בכל שורה המספר במשבצת המודגשת מתקבל משני המספרים שלפניו, לפי אותו חוק. איזה מספר חסר?', vis, ans, cands,
      `החוק בכל שורה: ${L('a , b → ' + rule.t)} (a המספר הראשון מימין, b השני).<span class="calc">${rows.map((r, i) => { const qa = i === 2 && hideCol === 0; return calcLine(rule.t.replace(/\b([ab])\b/g, m => m === 'a' ? (qa ? `<b>${r[0]}</b>` : r[0]) : r[1]), r[2], i === 2 && hideCol === 2); }).join('')}</span>${d >= 4 ? 'כאן היה צריך לעבוד הפוך: מנסים מספרים במקום a עד שיוצאת התוצאה.' : 'טריק: נסה קודם חיבור וכפל, ואז שילובים שלהם. בודקים את החוק על שתי השורות הראשונות לפני שמחשבים.'}`),
      `בדקו את השורה הראשונה: איך מ-${r0[0]} ומ-${r0[1]} מקבלים ${r0[2]}? נסו חיבור, כפל, ושילוב שלהם.`,
      `בשורה הראשונה: ${L(`${c0} = ${r0[2]}`)}. בדקו שזה עובד גם בשורה השנייה.${d >= 4 ? ' בשורה האחרונה חסר המספר הראשון: נסו מספרים במקומו.' : ''}`);
  }
  return genSeries(Math.min(d, 3));
}
function genRing(d) {
  const S = ri(15, 40), vals = []; for (let i = 0; i < 3; i++) { const x = ri(2, S - 2); vals.push([x, S - x]); }
  const nums = [vals[0][0], vals[1][0], vals[2][0], vals[0][1], vals[1][1], vals[2][1]];
  const hide = ri(0, 5), ans = nums[hide];
  const pts = nums.map((_, i) => { const a = (i * 60 - 90) * Math.PI / 180; return [80 + 58 * Math.cos(a), 80 + 58 * Math.sin(a)]; });
  const svg = `<svg viewBox="0 0 160 160" class="ring" aria-hidden="true"><circle cx="80" cy="80" r="58" fill="none" stroke="currentColor" stroke-width="2" opacity=".35"/>${pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="17" class="${i === hide ? 'rq' : 'rc'}"/><text x="${p[0].toFixed(1)}" y="${(p[1] + 6).toFixed(1)}" text-anchor="middle" class="${i === hide ? 'rqt' : 'rt'}">${i === hide ? '?' : nums[i]}</text>`).join('')}</svg>`;
  const ex0 = (hide + 1) % 3, ox = nums[ex0], oy = nums[ex0 + 3];
  return withHint(numQ('series', d, 'המספרים במעגל בנויים לפי חוק. איזה מספר חסר?', `<div class="ringwrap">${svg}</div>`, ans, [S - ans + 1, ans + 2, ans - 2, S - ans],
    `כל שני מספרים שנמצאים זה מול זה במעגל מסתכמים ל-${S}. המספר שמול סימן השאלה הוא ${nums[(hide + 3) % 6]}, ולכן ${S} − ${nums[(hide + 3) % 6]} = ${ans}. טריק במעגלים: בדוק זוגות מנוגדים, שכנים, וחוק "כל אחד פי משהו מהקודם".`),
    'בדקו זוגות של מספרים שעומדים זה מול זה במעגל. מה משותף לכל זוג?',
    `${L(`${ox} + ${oy} = ${S}`)}, והם עומדים זה מול זה. איזה מספר עומד מול סימן השאלה?`);
}
function genSeries5(d) { const r = R(); if (r < .25) return genTable(d); if (r < .35 && d <= 2) return genRing(d); return genSeries(Math.min(d, 3)); }

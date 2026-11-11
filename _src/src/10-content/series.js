/* ---------- NUMBER SERIES ----------
   Every series keeps how each number was made, and its solution shows it on THIS series:
   the rule in one sentence, the numbers again (first one on the right, like the question) with the step
   written between every two numbers (and the change of the steps under them, when the steps change),
   the alternating sub-series in two colors, the line that gives the answer, the trap, and how to spot the type next time.
   A series that a second simple rule also explains (with another answer) is thrown away and built again. */
const sgn = n => n < 0 ? `− ${-n}` : `+ ${n}`;
const sxS = v => v < 0 ? `−${-v}` : `+${v}`;   /* a step with its sign, no space: +4, −3 */
/* one calculation line; the hidden number is shown in bold */
const calcLine = (expr, val, isQ) => `<span>${L(`${expr} = ${isQ ? `<b>${val}</b>` : val}`)}</span>`;
function seriesCalc(t, hide, step, from = 1) {
  const lines = [];
  for (let i = from; i < t.length; i++) lines.push(calcLine(step(i), t[i], i === hide));
  return `<span class="calc">${lines.join('')}</span>`;
}
/* ---- the ladder: the series on a grid. Number i takes columns 2i+1..2i+2 (column 1 is on the right),
   a label between numbers i and i+1 takes 2i+2..2i+3, a bracket from i to i+2 takes 2i+2..2i+5. ---- */
const sxAt = (row, col, span) => `grid-row:${row};grid-column:${col} / span ${span}`;
function sxLadder(t, hide, rows, numCls) {
  const n = t.length; let h = '', r = 0;
  for (const row of rows) { r++;
    if (row === 'nums') { t.forEach((v, i) => { h += `<span class="sx-c${i === hide ? ' sx-q' : ''}${numCls ? ' ' + numCls(i) : ''}" style="${sxAt(r, 2 * i + 1, 2)}">${v < 0 ? '−' + -v : v}</span>`; }); continue; }
    for (const it of row.items) { if (it == null) continue;
      const col = row.k === 'gap' ? 2 * it.i + 2 : row.k === 'br' ? 2 * it.i + 2 : 2 * it.i + 1, span = row.k === 'br' ? 4 : 2;
      h += `<span class="${row.k === 'br' ? 'sx-br ' + (row.up ? 'up' : 'dn') : 'sx-l'}${it.c ? ' ' + it.c : ''}" style="${sxAt(r, col, span)}"><i dir="${/[א-ת]/.test(it.t) ? 'rtl' : 'ltr'}">${it.t}</i></span>`; }
  }
  return `<span class="sx-lad" style="--c:${2 * n + 1};--n:${n}">${h}</span>`;
}
const sxRule = s => `<span class="sx-rule"><b>החוק:</b> ${s}</span>`;
const sxNote = s => `<span class="sx-note">${s}</span>`;
const sxNext = s => `<span class="sx-next"><b>בפעם הבאה:</b> ${s}</span>`;
const sxTrap = s => `<span class="sx-trap"><b>מלכודת:</b> ${s}</span>`;
/* does a second simple rule fit every shown number, but give another hidden number? */
function seriesAlt(t, hide) {
  const n = t.length, ans = t[hide], t0 = t[0], t1 = t[1];
  const bad = s => { for (let i = 0; i < n; i++) if (i !== hide && Math.abs(s[i] - t[i]) > 1e-9) return false; return Math.abs(s[hide] - ans) > 1e-9; };
  const seq = f => { const s = [t0]; for (let i = 1; i < n; i++) s.push(f(s[i - 1], i)); return s; };
  for (let d = -60; d <= 60; d++) if (bad(seq(x => x + d))) return true;
  for (const r of [2, 3, 4]) if (bad(seq(x => x * r))) return true;
  for (let d0 = -40; d0 <= 40; d0++) for (let s = -12; s <= 12; s++) { const o = [t0]; let d = d0; for (let i = 1; i < n; i++) { o.push(o[i - 1] + d); d += s; } if (bad(o)) return true; }
  for (let a = -30; a <= 30; a++) for (let c = -30; c <= 30; c++) {
    if (bad(seq((x, i) => x + (i % 2 ? a : c)))) return true;
    const o = [t0, t1]; for (let i = 2; i < n; i++) o.push(o[i - 2] + (i % 2 ? c : a)); if (bad(o)) return true; }
  const f = [t0, t1]; for (let i = 2; i < n; i++) f.push(f[i - 1] + f[i - 2]); if (bad(f)) return true;
  for (const m of [2, 3]) for (let c = -6; c <= 6; c++) if (bad(seq(x => x * m + c))) return true;
  return false;
}
/* a hint that shows the hidden number (by chance, inside a calculation) gives the answer away: such a question is built again */
const hintShows = (ans, vis, hs) => { const re = new RegExp(`(^|[^0-9.])${ans}([^0-9.]|$)`), tx = x => String(x).replace(/<[^>]+>/g, ' '); return !re.test(tx(vis)) && hs.some(h => re.test(tx(h))); };
const isPrime = v => { if (v < 2) return false; for (let k = 2; k * k <= v; k++) if (v % k === 0) return false; return true; };
/* one series of type T: its numbers, the rule, how each number is made (step), the ladder rows and the traps */
function seriesBuild(T) {
  let t = [], rule = '', step, from = 1, rows = ['nums'], numCls = null, next = '', traps = [], note = '';
  const ops = f => ({ k: 'gap', items: t.slice(1).map((_, i) => f(i)) });   /* label i sits between t[i] and t[i+1] */
  const diffs = () => t.slice(1).map((v, i) => v - t[i]);
  const ab = i => i % 2 ? 'sx-b' : 'sx-a';
  switch (T) {
    case 'arith': { const k = pick([3, 4, 6, 7, 8, 9, 11, 12, 15, -3, -4, -6, -7]); const a = ri(2, 40) + (k < 0 ? 60 : 0); for (let i = 0; i < 6; i++) t.push(a + k * i);
      rule = k > 0 ? `כל מספר גדול מהקודם ב-${k}.` : `כל מספר קטן מהקודם ב-${-k}.`; step = i => `${t[i - 1]} ${sgn(k)}`;
      rows.push(ops(i => ({ i, t: sxS(k) })));
      next = 'כותבים את ההפרש בין כל שני מספרים. כשכל ההפרשים שווים, ממשיכים באותו הפרש.'; break; }
    case 'geom': { const a = ri(1, 5), r = pick([2, 2, 3]); for (let i = 0; i < 6; i++) t.push(a * r ** i);
      rule = `כל מספר גדול פי ${r} מהקודם.`; step = i => `${t[i - 1]} × ${r}`;
      rows.push(ops(i => ({ i, t: '×' + r })));
      traps.push([t[4] + (t[4] - t[3]), d => `מי שמוסיף שוב את ההפרש האחרון (${L(sxS(t[4] - t[3]))}) מקבל ${d}. אבל ההפרשים כאן לא שווים: כל מספר הוא כפל של הקודם.`]);
      next = 'כשהמספרים גדלים מהר, בודקים פי כמה כל מספר גדול מהקודם.'; break; }
    case 'alt': { const a = ri(5, 12), b = ri(2, a - 2); let x = ri(1, 20); for (let i = 0; i < 7; i++) { t.push(x); x += i % 2 === 0 ? a : -b; }
      rule = `שתי פעולות מתחלפות: מוסיפים ${a}, ואז מורידים ${b}.`; step = i => `${t[i - 1]} ${i % 2 ? '+ ' + a : '− ' + b}`;
      rows.push(ops(i => ({ i, t: i % 2 ? sxS(-b) : sxS(a), c: ab(i) })));
      traps.push([t[5] + a, d => `מי שמוסיף שוב ${a} מקבל ${d}. אבל אחרי ${L('+' + a)} בא תמיד ${L('−' + b)}.`]);
      next = 'כשהסדרה עולה ויורדת לסירוגין, יש שתי פעולות שמתחלפות. כותבים את שתיהן.'; break; }
    case 'incdiff': { let x = ri(1, 20); const s = ri(1, 4), gg = pick([1, 2]); for (let i = 0; i < 6; i++) { t.push(x); x += s + gg * i; }
      const D = diffs(); rule = `ההפרשים גדלים ב-${gg} בכל צעד.`; step = i => `${t[i - 1]} + ${t[i] - t[i - 1]}`;
      rows.push(ops(i => ({ i, t: sxS(D[i]), c: i === 4 ? 'sx-hot' : '' })), { k: 'mid', items: D.slice(1).map((v, i) => ({ i: i + 1, t: sxS(v - D[i]), c: 'sx-d2' })) });
      note = `שורה ראשונה מתחת למספרים: ההפרשים. שורה שנייה: בכמה כל הפרש גדל. כל הפרש גדל ב-${gg}, ולכן ההפרש האחרון הוא ${L(sxS(D[4]))}.`;
      traps.push([t[4] + D[3], d => `מי שמוסיף שוב את ההפרש הקודם (${L(sxS(D[3]))}) מקבל ${d}. אבל ההפרש עצמו גדל.`]);
      next = 'כשההפרשים לא שווים, כותבים אותם בשורה מתחת. אז מחפשים חוק בשורת ההפרשים.'; break; }
    case 'decdiff': { let x = ri(80, 120); const s = ri(9, 13); for (let i = 0; i < 6; i++) { t.push(x); x -= s - i; }
      const D = diffs(); rule = 'מורידים בכל צעד מספר קטן ב-1 מהפעם הקודמת.'; step = i => `${t[i - 1]} − ${t[i - 1] - t[i]}`;
      rows.push(ops(i => ({ i, t: sxS(D[i]), c: i === 4 ? 'sx-hot' : '' })), { k: 'mid', items: D.slice(1).map((v, i) => ({ i: i + 1, t: '1 פחות', c: 'sx-d2' })) });
      note = `מורידים ${-D[0]}, אחר כך ${-D[1]}, אחר כך ${-D[2]}... כל פעם מורידים 1 פחות. לכן בצעד האחרון מורידים ${-D[4]}.`;
      traps.push([t[4] + D[3], d => `מי שמוריד שוב ${-D[3]} מקבל ${d}. אבל כל פעם מורידים 1 פחות.`]);
      next = 'כשההפרשים לא שווים, כותבים אותם בשורה מתחת. אז מחפשים חוק בשורת ההפרשים.'; break; }
    case 'squares': { const c = pick([0, 0, 1, -1, 2]), st = ri(1, 4); for (let i = 0; i < 6; i++) { const n = st + i; t.push(n * n + c); }
      const D = diffs(); rule = c === 0 ? `כל מספר הוא מספר כפול עצמו. מתחילים ב-${st} ועולים ב-1 בכל צעד.` : `כל מספר הוא מספר כפול עצמו, ${c > 0 ? 'ועוד ' + c : 'פחות ' + (-c)}. מתחילים ב-${st} ועולים ב-1 בכל צעד.`;
      step = i => `${st + i} × ${st + i}${c ? ' ' + sgn(c) : ''}`; from = 0;
      rows = [{ k: 'num', items: t.map((_, i) => ({ i, t: `${st + i}×${st + i}${c ? sxS(c) : ''}`, c: 'sx-mk' })) }, 'nums', ops(i => ({ i, t: sxS(D[i]) }))];
      note = `מעל כל מספר: איך הוא נבנה. מתחת: ההפרשים ${D.slice(0, 3).join(', ')}... הם מספרים אי-זוגיים עוקבים. זה הסימן של "מספר כפול עצמו".`;
      traps.push([t[4] + D[3], d => `מי שמוסיף שוב את ההפרש הקודם (${L(sxS(D[3]))}) מקבל ${d}. אבל ההפרשים גדלים ב-2.`]);
      next = 'כשההפרשים הם 3, 5, 7, 9..., חפשו מספר כפול עצמו (אולי עם תוספת קבועה).'; break; }
    case 'interleave': { let x = ri(1, 10), y = ri(25, 40); const a = ri(2, 5), b = ri(2, 4); for (let i = 0; i < 8; i++) { if (i % 2 === 0) { t.push(x); x += a; } else { t.push(y); y -= b; } }
      rule = `שתי סדרות שזורות זו בזו. במקומות 1, 3, 5... עולים ב-${a}. במקומות 2, 4, 6... יורדים ב-${b}.`;
      step = i => `${t[i - 2]} ${i % 2 === 0 ? '+ ' + a : '− ' + b}`; from = 2; numCls = ab;
      rows = [{ k: 'br', up: 1, items: t.map((_, i) => i % 2 === 0 && i + 2 < t.length ? { i, t: sxS(a), c: 'sx-a' } : null) }, 'nums', { k: 'br', items: t.map((_, i) => i % 2 === 1 && i + 2 < t.length ? { i, t: sxS(-b), c: 'sx-b' } : null) }];
      note = 'הקשתות למעלה מחברות את המספרים הצבועים בצבע אחד. הקשתות למטה מחברות את הצבע השני.';
      traps.push([t[6] - b, d => `מי שמוריד ${b} מהמספר הצמוד (${t[6]}) מקבל ${d}. אבל ממשיכים מהמספר שנמצא שני מקומות לפני: ${t[5]}.`]);
      next = 'כשהסדרה קופצת למעלה ולמטה בלי סדר ברור, מסתכלים על כל מספר שני.'; break; }
    case 'muladd': { const v = pick([[2, 1], [2, -1], [3, -1], [2, 2], [3, 1], [2, -2]]); let x = ri(3, 5); for (let i = 0; i < 6; i++) { t.push(x); x = x * v[0] + v[1]; }
      rule = `כל מספר = הקודם כפול ${v[0]}, ${v[1] > 0 ? 'ועוד ' + v[1] : 'פחות ' + (-v[1])}.`; step = i => `${t[i - 1]} × ${v[0]} ${sgn(v[1])}`;
      rows.push(ops(i => ({ i, t: `×${v[0]}${sxS(v[1])}` })));
      traps.push([t[4] * v[0], d => `מי שרק כופל ב-${v[0]} מקבל ${d}, ושוכח את ה-${L(sxS(v[1]))}.`]);
      next = `כשכל מספר קצת יותר או קצת פחות מפי ${v[0]} מהקודם, בודקים "כפול, ואז ועוד או פחות מספר קטן".`; break; }
    case 'alt2': { const m = pick([2, 3]), p = ri(1, 6); let x = ri(1, 5); for (let i = 0; i < 7; i++) { t.push(x); x = i % 2 === 0 ? x * m : x + p; }
      rule = `שתי פעולות מתחלפות: כפול ${m}, ואז ועוד ${p}.`; step = i => `${t[i - 1]} ${i % 2 ? '× ' + m : '+ ' + p}`;
      rows.push(ops(i => ({ i, t: i % 2 ? sxS(p) : '×' + m, c: ab(i) })));
      traps.push([t[5] * m, d => `מי שכופל שוב ב-${m} מקבל ${d}. אבל אחרי ${L('×' + m)} בא תמיד ${L('+' + p)}.`]);
      next = 'כשיש קפיצה גדולה ואחריה קפיצה קטנה, לסירוגין, בודקים שתי פעולות שמתחלפות: כפל וחיבור.'; break; }
    case 'fib': { const a = ri(1, 5), b = ri(a, a + 5); t = [a, b]; while (t.length < 7) t.push(t[t.length - 1] + t[t.length - 2]);
      rule = 'כל מספר הוא סכום שני המספרים שלפניו.'; step = i => `${t[i - 2]} + ${t[i - 1]}`; from = 2;
      rows.push({ k: 'num', items: t.map((_, i) => i >= 2 ? { i, t: `${t[i - 2]}+${t[i - 1]}`, c: i === t.length - 1 ? 'sx-hot' : '' } : null) });
      note = 'מתחת לכל מספר: שני המספרים שלפניו, שהסכום שלהם נותן אותו.';
      traps.push([t[5] * 2, d => `מי שמכפיל את האחרון ב-2 מקבל ${d}. זה קרוב, אבל כאן מחברים שני מספרים שונים.`]);
      next = 'כשכל מספר קצת פחות מפי 2 מהקודם, בודקים אם הוא סכום שני המספרים שלפניו.'; break; }
    case 'diffgeom': { let x = ri(1, 10), dd = ri(1, 3); const r = pick([2, 3]); for (let i = 0; i < 6; i++) { t.push(x); x += dd; dd *= r; }
      const D = diffs(); rule = `ההפרש גדל פי ${r} בכל צעד.`; step = i => `${t[i - 1]} + ${t[i] - t[i - 1]}`;
      rows.push(ops(i => ({ i, t: sxS(D[i]), c: i === 4 ? 'sx-hot' : '' })), { k: 'mid', items: D.slice(1).map((v, i) => ({ i: i + 1, t: '×' + r, c: 'sx-d2' })) });
      note = `שורה ראשונה מתחת למספרים: ההפרשים. כל הפרש גדול פי ${r} מהקודם, ולכן ההפרש האחרון הוא ${L(sxS(D[4]))}.`;
      traps.push([t[4] + D[3], d => `מי שמוסיף שוב את ההפרש הקודם (${L(sxS(D[3]))}) מקבל ${d}. אבל ההפרש עצמו גדל פי ${r}.`]);
      next = 'כשההפרשים לא שווים, כותבים אותם בשורה מתחת. אז מחפשים חוק בשורת ההפרשים.'; break; }
    case 'cubes': {
      if (R() < .5) { for (let n = 1; n <= 6; n++) t.push(n * n * n); rule = 'כל מספר הוא מספר כפול עצמו כפול עצמו. מתחילים ב-1 ועולים ב-1 בכל צעד.'; step = i => `${i + 1} × ${i + 1} × ${i + 1}`;
        rows = [{ k: 'num', items: t.map((_, i) => ({ i, t: `${i + 1}×${i + 1}×${i + 1}`, c: 'sx-mk sx-sm' })) }, 'nums'];
        traps.push([36, d => `מי שחושב "מספר כפול עצמו" מקבל ${L('6 × 6 = ' + d)}. אבל ${L('2 × 2 = 4')}, לא 8: כאן כופלים שלוש פעמים.`]);
        next = '1, 8, 27, 64, 125 הם מספר כפול עצמו כפול עצמו. כדאי לזכור אותם בעל פה.'; }
      else { for (let n = 1; n <= 6; n++) t.push(n * (n + 1)); rule = 'כל מספר הוא כפל של שני מספרים צמודים. מתחילים ב-1 ו-2, ועולים ב-1 בכל צעד.'; step = i => `${i + 1} × ${i + 2}`;
        const D = diffs(); rows = [{ k: 'num', items: t.map((_, i) => ({ i, t: `${i + 1}×${i + 2}`, c: 'sx-mk' })) }, 'nums', ops(i => ({ i, t: sxS(D[i]) }))];
        note = 'דרך נוספת: ההפרשים הם 4, 6, 8, 10... וגדלים ב-2.';
        traps.push([36, d => `${d} = ${L('6 × 6')}. אבל כאן כופלים שני מספרים צמודים: ${L('6 × 7')}.`]);
        next = 'כשההפרשים הם 2, 4, 6, 8..., נסו לכתוב כל מספר ככפל של שני מספרים צמודים.'; }
      from = 0; break; }
    case 'interleave2': { let x = ri(1, 4), y = ri(40, 60); const b = ri(3, 7); for (let i = 0; i < 8; i++) { if (i % 2 === 0) { t.push(x); x *= 2; } else { t.push(y); y -= b; } }
      rule = `שתי סדרות שזורות זו בזו. במקומות 1, 3, 5... כל מספר כפול 2. במקומות 2, 4, 6... יורדים ב-${b}.`;
      step = i => `${t[i - 2]} ${i % 2 === 0 ? '× 2' : '− ' + b}`; from = 2; numCls = ab;
      rows = [{ k: 'br', up: 1, items: t.map((_, i) => i % 2 === 0 && i + 2 < t.length ? { i, t: '×2', c: 'sx-a' } : null) }, 'nums', { k: 'br', items: t.map((_, i) => i % 2 === 1 && i + 2 < t.length ? { i, t: sxS(-b), c: 'sx-b' } : null) }];
      note = 'הקשתות למעלה מחברות את המספרים הצבועים בצבע אחד. הקשתות למטה מחברות את הצבע השני.';
      traps.push([t[6] - b, d => `מי שמוריד ${b} מהמספר הצמוד (${t[6]}) מקבל ${d}. אבל ממשיכים מהמספר שנמצא שני מקומות לפני: ${t[5]}.`]);
      next = 'כשהסדרה קופצת למעלה ולמטה בלי סדר ברור, מסתכלים על כל מספר שני.'; break; }
    case 'primes': { const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]; const s = ri(0, 4), add = pick([0, 0, 1]); t = P.slice(s, s + 6).map(p => p + add);
      rule = (add ? 'מספרים ראשוניים לפי הסדר, ועוד 1.' : 'מספרים ראשוניים לפי הסדר.') + ' ראשוני = מספר שמתחלק רק ב-1 ובעצמו.';
      step = add ? (i => `${P[s + i]} + 1`) : null; from = 0;
      if (add) rows.push({ k: 'num', items: t.map((_, i) => ({ i, t: `${P[s + i]}+1`, c: 'sx-mk' })) });
      const lo = P[s], hi = P[s + 5]; let strip = '';
      for (let v = lo; v <= hi; v++) { const pr = isPrime(v); let why = ''; if (!pr) for (const k of [2, 3, 5, 7]) if (v % k === 0) { why = `מתחלק ב-${k}`; break; }
        strip += `<span class="sx-p${pr ? ' pr' : ''}${v === hi ? ' sx-q' : ''}"${why ? ` title="${why}"` : ''}>${v}</span>`; }
      note = `${add ? 'מורידים 1 מכל מספר, ומקבלים' : 'אלה'} המספרים הראשוניים. כל המספרים מ-${lo} עד ${hi}, והראשוניים מודגשים. כל השאר מתחלקים ב-2, 3, 5 או 7:<span class="sx-pl">${strip}</span>`;
      /* the trap: the first odd number after the last shown prime that is not prime (it looks like a next step) */
      let v = P[s + 4] + 1; while (v % 2 === 0 || isPrime(v)) v++;
      const fd = [3, 5, 7].find(k => v % k === 0), fake = v + add;
      traps.push([fake, d => `${d} נראה כמו המשך, אבל ${add ? `${L(`${d} − 1 = ${v}`)}, ו-${v}` : d} מתחלק ב-${fd} (${L(`${v} = ${fd} × ${v / fd}`)}). לכן הוא לא ראשוני.`]);
      next = 'כשאין הפרש קבוע ואין כפל, בודקים אם כל המספרים ראשוניים (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31...).'; break; }
    case 'alt3': { let x = ri(1, 3), k = 1; const ks = []; for (let i = 0; i < 7; i++) { t.push(x); if (i % 2 === 0) { ks.push(k); x += k; k++; } else { ks.push(0); x *= 2; } }
      rule = 'שתי פעולות מתחלפות: מוסיפים (בפעם הראשונה 1, אחר כך 2, אחר כך 3...), ואז כופלים ב-2.'; step = i => `${t[i - 1]} ${(i - 1) % 2 === 0 ? '+ ' + ks[i - 1] : '× 2'}`;
      rows.push(ops(i => ({ i, t: i % 2 ? '×2' : sxS(ks[i]), c: ab(i) })));
      traps.push([t[5] + ks[4] + 1, d => `מי שמוסיף ${ks[4] + 1} מקבל ${d}. אבל אחרי חיבור תמיד בא ${L('×2')}.`]);
      next = 'כשיש קפיצה גדולה ואחריה קפיצה קטנה, לסירוגין, כותבים כל צעד ובודקים אם יש שתי פעולות שמתחלפות.'; break; }
  }
  return { t, rule, step, from, rows, numCls, next, traps, note };
}
function genSeries(d) {
  let T, s, hide;
  for (let k = 0; k < 40; k++) {
    T = d === 1 ? pick(['arith', 'arith', 'geom', 'alt']) : d === 2 ? pick(['incdiff', 'squares', 'interleave', 'muladd', 'alt2', 'decdiff']) : pick(['fib', 'diffgeom', 'cubes', 'interleave2', 'primes', 'alt3', 'muladd']);
    s = seriesBuild(T);
    hide = (d === 3 && R() < .35 && !T.startsWith('interleave') && T !== 'primes') ? ri(2, s.t.length - 2) : s.t.length - 1;
    if (seriesAlt(s.t, hide)) continue;
    if (!hintShows(s.t[hide], s.t.filter((_, i) => i !== hide).join(' '), seriesHints(T, s.t, hide, s.step, s.from, s.rule))) break;
  }
  const { t, rule, step, from, rows, numCls, next, note } = s;
  const ans = t[hide], prev = t[hide - 1], prev2 = t[hide - 2], last = hide === t.length - 1;
  const cont = prev + (prev - prev2);
  const traps = last ? s.traps.filter(([v]) => Number.isFinite(v) && v >= 0 && v !== ans) : [];
  const vis = `<div class="series${t.length >= 8 ? ' sx-long' : ''}">` + t.map((v, i) => `<span class="cell${i === hide ? ' q' : ''}">${i === hide ? '?' : v}</span>`).join('<span class="arr">←</span>') + '</div>';
  const q = Object.assign(numQ('series', d, 'איזה מספר מתאים במקום סימן השאלה?', vis, ans, [...traps.map(x => x[0]), cont, ans + 1, ans - 1, ans + Math.abs(ans - prev), ans + 2, ans - 2], ''), { lk: 'series' });
  /* the line that gives the answer, and when the answer is in the middle, the check on the number after it */
  let calc = step ? calcLine(step(hide), ans, true) : `<span>${L(`<b>${ans}</b>`)} הוא הראשוני הבא אחרי ${prev}.</span>`;
  if (!last && step) calc += `<span>בדיקה: ${L(`${step(hide + 1)} = ${t[hide + 1]}`)} ✓</span>`;
  const opts = q.options.map(o => +String(o).replace(/<[^>]+>/g, ''));
  const trap = traps.find(([v]) => opts.includes(v));
  q.ex = sxRule(rule) + sxLadder(t, hide, rows, numCls) + (note ? sxNote(note) : '') + `<span class="calc">${calc}</span>`
    + (!last ? sxNote('המספר החסר באמצע: מוצאים את החוק מהמספרים שלפניו, ובודקים שהוא עובד גם על המספר שאחריו.') : '')
    + (trap ? sxTrap(trap[1](trap[0])) : '') + sxNext(next);
  return withHint(q, ...seriesHints(T, t, hide, step, from, rule));
}
/* hints from this series' own numbers: where to look, then two worked steps that do not touch the hidden number */
function seriesHints(T, t, hide, step, from, rule) {
  const vis = t.map((_, i) => i).filter(i => i !== hide), [a, b, c] = vis.slice(0, 3).map(i => t[i]);
  let h1;
  if (T.startsWith('interleave')) h1 = `הסתכלו רק על כל מספר שני: ${t[0]}, ${t[2]}, ${t[4]}... ובנפרד על ${t[1]}, ${t[3]}, ${t[5]}...`;
  else if (T === 'fib') h1 = `חברו שני מספרים צמודים: ${L(`${a} + ${b}`)}. איפה התוצאה מופיעה בסדרה?`;
  else if (T === 'primes') h1 = /ועוד 1/.test(rule) ? `הורידו 1 מכל מספר. במה המספרים שיוצאים מיוחדים? נסו לחלק אותם ב-2, 3 ו-5.` : `נסו לחלק כל מספר ב-2, 3 ו-5. מה מיוחד במספרים האלה?`;
  else if (T === 'squares') h1 = `כתבו את ההפרשים: מ-${a} ל-${b}, ומ-${b} ל-${c}. אילו מספרים יוצאים? ונסו לכתוב את ${c} כמספר כפול עצמו${/ועוד|פחות/.test(rule) ? ', ועוד או פחות קצת' : ''}.`;
  else if (T === 'cubes') h1 = /צמודים/.test(rule) ? `נסו לכתוב את ${c} ככפל של שני מספרים צמודים.` : `איזה מספר כפול עצמו כפול עצמו נותן ${b}? ואיזה נותן ${c}?`;
  else if (T === 'geom' || T === 'muladd') h1 = `המספרים גדלים מהר. בדקו פי כמה ${b} גדול מ-${a}, ופי כמה ${c} גדול מ-${b}. יצא בערך, אבל לא בדיוק? אולי יש עוד חיבור קטן.`;
  else if (T === 'diffgeom' || T === 'incdiff' || T === 'decdiff') h1 = `כתבו את ההפרשים בשורה מתחת למספרים: כמה מ-${a} ל-${b}, וכמה מ-${b} ל-${c}? איך ההפרשים משתנים?`;
  else h1 = `כתבו מה קורה בכל צעד: כמה עולה או יורד מ-${a} ל-${b}, ומ-${b} ל-${c}?`;
  /* h2: two calculation lines that do not use the hidden number */
  const lines = [];
  if (step) for (let i = from; i < t.length && lines.length < 2; i++) { const back = T.startsWith('interleave') || T === 'fib' ? [i - 1, i - 2] : [i - 1]; if (i === hide || back.includes(hide)) continue; lines.push(L(`${step(i)} = ${t[i]}`)); }
  const tail = /^(incdiff|decdiff|diffgeom)$/.test(T) ? 'איך משתנה המספר שמוסיפים או מורידים בכל צעד?' : /^alt/.test(T) ? 'שימו לב: יש שתי פעולות שמתחלפות.' : T === 'fib' ? 'המשיכו כך עד סימן השאלה.' : 'המשיכו באותו חוק עד סימן השאלה.';
  const mid = hide < t.length - 1 ? ' בדקו שהחוק עובד גם על המספר שאחרי סימן השאלה.' : '';
  const h2 = step ? `${lines.join('<br>')}<br>${tail}${mid}` : `אלה מספרים ראשוניים: מתחלקים רק ב-1 ובעצמם. מה הראשוני הבא אחרי ${t[hide - 1]}?`;
  return [h1, h2];
}
/* ---- number tables & rings ----
   t: the rule with a (the number on the right) and b (the middle one); f: its value;
   how: how to find this rule in the first row, starting from a + b and a × b (the two first things to try) */
const TROWS = [
  { d: 1, t: 'a + b', f: (a, b) => a + b, how: (a, b, r) => `${tE('a + b', a, b, r)}. זה בדיוק התוצאה.` },
  { d: 1, t: 'a × b', f: (a, b) => a * b, how: (a, b, r) => `${tE('a + b', a, b, a + b)}, לא ${r}. ${tE('a × b', a, b, r)}. זה בדיוק התוצאה.` },
  { d: 2, t: '(a + b) × 2', f: (a, b) => (a + b) * 2, how: (a, b, r) => `${tE('a + b', a, b, a + b)}. התוצאה ${r} היא בדיוק פי 2 ממנו.` },
  { d: 2, t: 'a × b − a', f: (a, b) => a * b - a, how: (a, b, r) => `${tE('a × b', a, b, a * b)}. התוצאה ${r} קטנה ממנו ב-${a}, וזה בדיוק a.` },
  { d: 2, t: 'a × 2 + b', f: (a, b) => a * 2 + b, how: (a, b, r) => `${tE('a + b', a, b, a + b)}. התוצאה ${r} גדולה ממנו ב-${a}, וזה עוד a אחד. כלומר a פעמיים, ועוד b.` },
  { d: 3, t: 'a × a − b', f: (a, b) => a * a - b, how: (a, b, r) => `${tE('a × b', a, b, a * b)} לא מתאים. אבל ${tE('a × a', a, b, a * a)}, והתוצאה ${r} קטנה ממנו ב-${b}, וזה בדיוק b.` },
  { d: 3, t: '(a − b) × (a + b)', f: (a, b) => (a - b) * (a + b), how: (a, b, r) => `${tE('a + b', a, b, a + b)}, ו-${r} מתחלק בו: ${L(`${r} ÷ ${a + b} = ${a - b}`)}. ו-${a - b} הוא בדיוק ${tP('a − b', a, b)}.` },
  { d: 3, t: 'a × b + a + b', f: (a, b) => a * b + a + b, how: (a, b, r) => `${tE('a × b', a, b, a * b)}. התוצאה ${r} גדולה ממנו ב-${a + b}, וזה בדיוק ${tP('a + b', a, b)}.` }];
/* a formula with a and b (or their numbers) colored: a in the accent color, b in gold */
const tC = (t, A, B) => t.replace(/\b[ab]\b/g, m => `<span class="cx-${m}">${m === 'a' ? A : B}</span>`);
const tP = (t, A, B) => L(tC(t, A, B));
/* the same, with "= value" inside the same left-to-right span (so the line does not break apart) */
const tE = (t, A, B, v) => L(`${tC(t, A, B)} = ${v}`);
/* simple formulas a child could try: x op y, (x op y) op z and x op (y op z), with a, b, 2, 3. n: the formula as written */
const TFAM = (() => { const at = [['a', (a, b) => a], ['b', (a, b) => b], ['2', () => 2], ['3', () => 3]], op = [['+', (x, y) => x + y], ['−', (x, y) => x - y], ['×', (x, y) => x * y]], out = [];
  for (const [n1, f1] of at) for (const [n2, f2] of at) for (const [o1, g1] of op) out.push({ n: `${n1} ${o1} ${n2}`, f: (a, b) => g1(f1(a, b), f2(a, b)) });
  for (const [n1, f1] of at) for (const [n2, f2] of at) for (const [o1, g1] of op) for (const [n3, f3] of at) for (const [o2, g2] of op) {
    out.push({ n: o1 !== '×' && o2 === '×' ? `(${n1} ${o1} ${n2}) ${o2} ${n3}` : `${n1} ${o1} ${n2} ${o2} ${n3}`, f: (a, b) => g2(g1(f1(a, b), f2(a, b)), f3(a, b)) });
    out.push({ n: o2 === '×' && o1 !== '×' ? `${n1} ${o1} ${n2} ${o2} ${n3}` : o1 === '+' && o2 !== '×' ? `${n1} + ${n2} ${o2} ${n3}` : `${n1} ${o1} (${n2} ${o2} ${n3})`, f: (a, b) => g1(f1(a, b), g2(f2(a, b), f3(a, b))) }); }
  return out; })();
function genTable(d) {
  const pool = TROWS.filter(r => r.d <= Math.min(d, 3)); const pref = pool.filter(r => r.d === Math.min(d, 3)); const rule = pick(pref.length && R() < .7 ? pref : pool);
  for (let t = 0; t < 300; t++) {
    const rows = Array.from({ length: 3 }, () => { const a = ri(3, 9), b = ri(2, a - 1); return [a, b, rule.f(a, b)]; });
    if (rows.some(r => r[2] < 0 || r[2] > 200) || new Set(rows.map(r => r[0] + ',' + r[1])).size < 3) continue;
    if (rows[0][1] === rows[1][1] || rows[0][0] === rows[1][0]) continue;   /* two rows that share a number cannot tell rules apart */
    /* every simple formula that fits the first two rows must give the same third number */
    if (TFAM.some(({ f }) => f(rows[0][0], rows[0][1]) === rows[0][2] && f(rows[1][0], rows[1][1]) === rows[1][2] && f(rows[2][0], rows[2][1]) !== rows[2][2])) continue;
    let hideCol = 2;
    if (d >= 4) { const [a, b, c] = rows[2]; const sols = []; for (let x = 1; x <= 15; x++) if (rule.f(x, b) === c) sols.push(x); if (sols.length !== 1) continue; hideCol = 0; }
    const ans = rows[2][hideCol];
    const vis = `<div class="ntab-wrap"><table class="ntab">${rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="${j === 2 ? 'res' : ''} ${i === 2 && j === hideCol ? 'q' : ''}">${i === 2 && j === hideCol ? '?' : v}</td>`).join('')}</tr>`).join('')}</table></div>`;
    const [a2, b2] = rows[2];
    const r0 = rows[0], r1 = rows[1];
    const h1 = `בשורה הראשונה חשבו ${L(`${r0[0]} + ${r0[1]}`)} וגם ${L(`${r0[0]} × ${r0[1]}`)}. כמה חסר או עודף עד ${r0[2]}?`;
    const h2 = `בשורה הראשונה: ${rule.how(r0[0], r0[1], r0[2])} בדקו שזה עובד גם בשורה השנייה, עם ${r1[0]} ו-${r1[1]}.${d >= 4 ? ' בשורה האחרונה חסר המספר הימני: נסו את התשובות במקומו.' : ''}`;
    if (t < 250 && hintShows(ans, vis, [h1, h2])) continue;
    /* the trap: a formula that fits the first row only (the child stopped checking after one row) */
    const only1 = hideCol === 2 ? TFAM.find(({ n, f }) => /a/.test(n) && /b/.test(n) && f(r0[0], r0[1]) === r0[2] && f(r1[0], r1[1]) !== r1[2] && f(a2, b2) >= 0 && f(a2, b2) !== ans && f(a2, b2) <= 300) : null;
    const cands = hideCol === 2 ? [...(only1 ? [only1.f(a2, b2)] : []), rule.f(b2, a2), a2 + b2, a2 * b2, ans + 1, ans - 1, ans + b2] : [b2, ans + 1, ans - 1, ans + 2];
    const q = numQ('series', d, d >= 4 ? 'בכל שורה המספר במשבצת המודגשת מתקבל משני המספרים האחרים, לפי אותו חוק. איזה מספר חסר?' : 'בכל שורה המספר במשבצת המודגשת מתקבל משני המספרים שלפניו, לפי אותו חוק. איזה מספר חסר?', vis, ans, cands, '');
    q.ex = tableEx(rule, rows, hideCol, q.options.map(o => +String(o).replace(/<[^>]+>/g, '')), only1);
    return withHint(q, h1, h2);
  }
  return genSeries(Math.min(d, 3));
}
/* the table again, each row with the rule written out on its own numbers; then how the rule was found */
function tableEx(rule, rows, hideCol, opts, only1) {
  const qa = hideCol === 0;
  const row = (r, i) => { const last = i === 2;
    return `<span class="tx-r${last ? ' tx-last' : ''}"><span class="tx-n cx-a">${last && qa ? '?' : r[0]}</span><span class="tx-n cx-b">${r[1]}</span><span class="tx-f">${last && qa ? tP(rule.t, 'x', r[1]) : tP(rule.t, r[0], r[1])}</span><span class="tx-eq">=</span><span class="tx-n tx-res">${last && !qa ? `<b>${r[2]}</b>` : r[2]}</span></span>`; };
  const r0 = rows[0], r1 = rows[1], r2 = rows[2];
  let solve = '';
  if (qa) { const tries = opts.filter(v => Number.isFinite(v)).sort((x, y) => x - y).map(v => { const val = rule.f(v, r2[1]), ok = val === r2[2];
      return `<span class="tx-try${ok ? ' ok' : ''}">${tE(rule.t, v, r2[1], val)} ${ok ? '✓' : '✗'}</span>`; }).join('');
    solve = `<span class="sx-note">בשורה האחרונה חסר המספר הימני. מציבים במקומו כל תשובה, ובודקים איזו נותנת ${r2[2]}:</span><span class="tx-tries">${tries}</span>`; }
  return sxRule(`בכל שורה, התוצאה היא ${tP(rule.t, 'a', 'b')}. ${L('<span class="cx-a">a</span>')} הוא המספר הימני, ${L('<span class="cx-b">b</span>')} הוא האמצעי.`)
    + `<span class="tx">${rows.map(row).join('')}</span>`
    + `<span class="sx-note"><b>איך מוצאים את החוק:</b> בשורה הראשונה, ${rule.how(r0[0], r0[1], r0[2])}</span>`
    + `<span class="sx-note"><b>בודקים בשורה השנייה:</b> ${tE(rule.t, r1[0], r1[1], r1[2])} ✓</span>` + solve
    + (only1 && opts.includes(only1.f(r2[0], r2[1])) ? sxTrap(`${only1.f(r2[0], r2[1])}. זה יוצא מהחוק ${tP(only1.n, 'a', 'b')}. הוא מתאים לשורה הראשונה (${tE(only1.n, r0[0], r0[1], r0[2])}), אבל לא לשנייה: ${tE(only1.n, r1[0], r1[1], only1.f(r1[0], r1[1]))}, ולא ${r1[2]}.`) : '')
    + sxNext(`בכל טבלה מתחילים מאותן שתי בדיקות: ${L('a + b')} וגם ${L('a × b')}. ההבדל בינן לבין התוצאה מגלה את החוק. חוק נחשב נכון רק אחרי שעבד בשתי שורות.`);
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

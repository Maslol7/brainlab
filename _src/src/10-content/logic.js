/* ---------- LOGIC ---------- */

/* Solving trace for puzzles with a unique solution: applies the clues one by one, each time the one that fixes
   the most new facts (then the one that rules out the most), and reports which facts became certain after it.
   clues: [{f: sol => bool}], sols: all candidate solutions, facts: sols => [keys that agree in all sols]. */
function lgTrace(clues, sols, facts) {
  let cur = sols, known = facts(cur), left = clues.slice();
  const steps = [];
  while (left.length && cur.length > 1) {
    let best = null;
    for (const c of left) {
      const nx = cur.filter(c.f), nf = facts(nx).filter(k => !known.includes(k)), sc = nf.length * 1000 - nx.length;
      if (!best || sc > best.sc) best = { c, nx, nf, sc };
    }
    steps.push({ c: best.c, nf: best.nf }); cur = best.nx; known = known.concat(best.nf); left = left.filter(c => c !== best.c);
  }
  return steps;
}
/* Euler circles: cs = [{k: 'a'|'b'|'c', t: label, x, y, r, lx, ly}], dots = [[x, y]] mark "at least one here". */
function lgEuler(w, h, cs, dots = [], cap = '') {
  const svg = `<svg class="lg-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${cs.map(c => `<circle class="lg-${c.k}" cx="${c.x}" cy="${c.y}" r="${c.r}"/>`).join('')}${dots.map(([x, y]) => `<circle class="lg-dot" cx="${x}" cy="${y}" r="4.5"/>`).join('')}${cs.map(c => `<text class="lg-${c.k}" x="${c.lx}" y="${c.ly}" text-anchor="middle">${c.t}</text>`).join('')}</svg>`;
  return `<span class="lg-eu">${svg}${cap ? `<span class="lg-cap">${cap}</span>` : ''}</span>`;
}
const lgC = (k, t, x, y, r, lx, ly) => ({ k, t, x, y, r, lx, ly });
const lgWho = nm => PEOPLE.find(q => q[0] === nm);

const ATTR = [
  { more: { m: 'גבוה', f: 'גבוהה' }, less: { m: 'נמוך', f: 'נמוכה' }, top: 'מי הכי גבוה בקבוצה?', bottom: 'מי הכי נמוך בקבוצה?', second: 'מי השני בגובה (מהגבוה לנמוך)?', mid: 'מי נמצא בדיוק באמצע בסדר הגובה?' },
  { more: { m: 'מבוגר', f: 'מבוגרת' }, less: { m: 'צעיר', f: 'צעירה' }, top: 'מי המבוגר ביותר?', bottom: 'מי הצעיר ביותר?', second: 'מי השני בגילו (מהמבוגר לצעיר)?', mid: 'מי נמצא בדיוק באמצע בסדר הגילים?' },
  { more: { m: 'מהיר', f: 'מהירה' }, less: { m: 'איטי', f: 'איטית' }, top: 'מי הרץ המהיר ביותר?', bottom: 'מי הרץ האיטי ביותר?', second: 'מי השני במהירות (מהמהיר לאיטי)?', mid: 'מי נמצא בדיוק באמצע בסדר המהירות?' }];
function genOrder(d) {
  const n = d === 1 ? 4 : 5, ppl = shuffle(PEOPLE).slice(0, n), A = pick(ATTR), nm = i => ppl[i][0];
  /* ppl is the solved order: ppl[0] has the most of the attribute. A clue (i, j) says i is above j. */
  const clue = (i, j, extra) => { const up = R() < .5; return { i, j, extra, up, t: up ? `${nm(i)} ${A.more[ppl[i][1]]} מ${nm(j)}` : `${nm(j)} ${A.less[ppl[j][1]]} מ${nm(i)}` }; };
  const clues = []; for (let i = 0; i < n - 1; i++) clues.push(clue(i, i + 1));
  if (d === 3) clues.push(clue(0, ri(2, n - 1), true));
  const qt = d === 1 ? pick(['top', 'bottom']) : d === 2 ? pick(['second', 'bottom', 'mid']) : pick(['second', 'mid']);
  const id = { top: 0, bottom: n - 1, second: 1, mid: (n - 1) / 2 }[qt];
  const m = mc([nm(id), ...ppl.filter((_, i) => i !== id).map(p => p[0])]);
  const sl = n === 4 || id === 2 ? 2 : 3, st = [];
  for (let s = 0; s + sl <= n; s++) if (id < s || id >= s + sl) st.push(s);
  const s0 = st.sort((a, b) => Math.abs(b + (sl - 1) / 2 - id) - Math.abs(a + (sl - 1) / 2 - id))[0], seg = ppl.slice(s0, s0 + sl).map(p => p[0]);
  const dir = `מה${A.more.m} ל${A.less.m}`;
  const oh1 = `יש כאן ${L(n)} ילדים. ציירו קו ${dir} ושימו עליו שם אחרי שם. התחילו מהרמז על ${seg[0]} ו${seg[1]}.`;
  const oh2 = `לפי הרמזים, בסדר ${dir}: ${seg.join(', ')}. איפה נכנסים ${n - sl === 1 ? 'הילד שנשאר' : 'שאר הילדים'}?`;
  /* explanation: every clue turned to the same direction, the chain, then the ladder */
  const same = c => `${nm(c.i)} ${A.more[ppl[c.i][1]]} מ${nm(c.j)}`;
  const lines = clues.map(c => `<span>${c.up ? same(c) : `${c.t}, כלומר: ${same(c)}`}${c.extra ? ' (רמז נוסף, רק מאשר)' : ''}</span>`).join('');
  const lad = `<span class="lg-lad"><span class="lg-end">הכי ${A.more.m}</span>${ppl.map((p, i) => `<span class="lg-rung${i === id ? ' on' : ''}"><i>${i + 1}</i>${p[0]}</span>`).join('')}<span class="lg-end">הכי ${A.less.m}</span></span>`;
  const why = { top: 'בראש הסולם', bottom: 'בתחתית הסולם', second: 'שני מלמעלה', mid: 'באמצע: שניים מעל ושניים מתחת' }[qt];
  const ex = `<b>השיטה:</b> הופכים כל רמז לאותו כיוון (מי ${A.more.m} ממי), ומחברים את הרמזים לשרשרת אחת.<span class="calc">${lines}</span>${lad}התשובה: <b>${nm(id)}</b> (${why}).`;
  return withHint({ cat: 'logic', d, prompt: A[qt], vis: `<ul class="clues">${shuffle(clues.slice()).map(c => `<li>${c.t}</li>`).join('')}</ul>`, options: m.options, answer: m.answer, ex }, oh1, oh2);
}
function genLogic(d) {
  if (R() < .35) return genOrder(d);
  const it = pickBank(LG, 'lg', d); const m = mc(it.o.map(o => /^[\d:]+$/.test(o) ? L(o) : o));
  const q = { cat: 'logic', d, prompt: it.q, vis: '', options: m.options, answer: m.answer, ex: it.ex };
  if (it.lk) q.lk = it.lk; /* the rule shown with the solution, when the look of the prompt would pick a wrong one */
  return q;
}
/* ---- seating puzzles ---- */
function perms(a) { if (a.length <= 1) return [a]; const out = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(p => out.push([x, ...p]))); return out; }
function genSeating(d) {
  const n = d <= 2 ? 4 : 5, maxNeg = d >= 4 ? 3 : 2;
  for (let tries = 0; tries < 80; tries++) {
    const names = shuffle(PEOPLE).slice(0, n).map(p => p[0]);
    const target = shuffle(names), all = perms(names);
    const P = (p, x) => p.indexOf(x);
    /* target[0] sits in seat 1 (the rightmost). "x right of y" means x has a smaller seat number. */
    const mk = () => {
      const [x, y] = shuffle(names), ty = pick(['adj', 'notadj', 'end', 'notend', 'right', 'imm', 'pos']);
      const sits = g(lgWho(x), 'יושב', 'יושבת');
      const ff = [x, y].every(v => lgWho(v)[1] === 'f'), pl = ff ? 'יושבות זו ליד זו' : 'יושבים זה ליד זה';
      if (ty === 'adj') return { ty, t: `${x} ו${y} ${pl}`, f: p => Math.abs(P(p, x) - P(p, y)) === 1 };
      if (ty === 'notadj') return { ty, t: `${x} ו${y} לא ${pl}`, f: p => Math.abs(P(p, x) - P(p, y)) !== 1 };
      if (ty === 'end') return { ty, t: `${x} ${sits} באחד הקצוות`, f: p => P(p, x) === 0 || P(p, x) === n - 1 };
      if (ty === 'notend') return { ty, t: `${x} לא ${sits} באף קצה`, f: p => P(p, x) !== 0 && P(p, x) !== n - 1 };
      if (ty === 'right') return { ty, t: `${x} ${sits} מימין ל${y} (לא בהכרח צמוד)`, f: p => P(p, x) < P(p, y) };
      if (ty === 'imm') return { ty, t: `${x} ${sits} מימין ל${y}, צמוד ${g(lgWho(y), 'אליו', 'אליה')}`, f: p => P(p, x) === P(p, y) - 1 };
      const k = P(target, x); return { ty, t: `${x} ${sits} במקום ${k + 1}`, f: p => P(p, x) === k, pos: x };
    };
    let clues = [], left = all;
    for (let it = 0; it < 200 && left.length > 1 && clues.length < (d >= 4 ? 7 : 6); it++) {
      const c = mk(); if (!c.f(target)) continue; if (d >= 3 && c.pos && R() < .7) continue;
      if (/^not/.test(c.ty) && clues.filter(x => /^not/.test(x.ty)).length >= maxNeg) continue;
      const nl = left.filter(c.f); if (nl.length === left.length) continue;
      clues.push(c); left = nl;
    }
    if (left.length !== 1) continue;
    /* drop clues the others already imply, so every clue is needed */
    for (const c of clues.slice()) { const rest = clues.filter(x => x !== c); if (all.filter(p => rest.every(r => r.f(p))).length === 1) clues = rest; }
    const given = new Set(clues.filter(c => c.pos).map(c => c.pos));
    const askable = names.filter(x => !given.has(x)); if (!askable.length) continue;
    const who = pick(askable), k = P(target, who);
    const m = mc([who, ...names.filter(x => x !== who)]);
    const fixed = cur => { const out = []; for (let s = 0; s < n; s++) if (cur.every(p => p[s] === cur[0][s])) out.push(s); return out; };
    const steps = lgTrace(clues, all, fixed);
    /* hints: start from the first clue of the trace that does not name the answer; then the first seat it fixes */
    const sc = steps.map(s => s.c).find(c => !c.t.includes(who));
    const firstFix = steps.flatMap(s => s.nf).find(s => s !== k && target[s] !== who && !given.has(target[s]));
    const sh1 = sc ? `ציירו ${L(n)} כיסאות, מקום 1 מימין. התחילו מהרמז "${sc.t}", ומלאו בעיפרון.` : `ציירו ${L(n)} כיסאות, מקום 1 מימין. מלאו קודם מקום קבוע, קצה או שכן צמוד, ובסוף פסלו בעזרת רמזי ה"לא".`;
    const sh2 = firstFix !== undefined ? `צעד ראשון: מהרמזים יוצא ש${target[firstFix]} ${g(lgWho(target[firstFix]), 'יושב', 'יושבת')} במקום ${L(firstFix + 1)}. עכשיו בדקו מי יכול לשבת במקום ${L(k + 1)}.` : `בדקו כל אחד מהשמות: מי יכול לשבת במקום ${L(k + 1)} בלי לסתור אף רמז?`;
    const seat = s => s === k ? `<b>${target[s]} במקום ${s + 1}</b>` : `${target[s]} במקום ${s + 1}`;
    const lines = steps.map((s, i) => `<span>${i + 1}. ${s.c.t} ← ${s.nf.length ? s.nf.sort((a, b) => a - b).map(seat).join(', ') : 'עוד לא קובע מקום, רק פוסל אפשרויות'}</span>`).join('');
    const row = `<span class="lg-seats">${target.map((v, s) => `<span class="lg-seat${s === k ? ' on' : ''}"><i>${s + 1}</i>${v}</span>`).join('')}</span><span class="lg-cap">מקום 1 מימין</span>`;
    const ex = `<b>השיטה:</b> מציירים ${n} כיסאות, מקום 1 מימין. בכל צעד לוקחים את הרמז שקובע הכי הרבה, ובודקים איזה מקום כבר בטוח. רמזי "לא" עוזרים בסוף, לפסילה.<span class="calc">${lines}</span>${row}במקום ${k + 1} ${g(lgWho(who), 'יושב', 'יושבת')} <b>${who}</b>.`;
    return withHint({ cat: 'logic', d, prompt: `${n} ילדים יושבים בשורה, במקומות 1 עד ${n}. מקום 1 הוא הימני ביותר. מי יושב במקום ${k + 1}?`, vis: `<div class="seats">${Array.from({ length: n }, (_, i) => `<span class="seat"><b>${i + 1}</b></span>`).join('')}</div><ul class="clues">${shuffle(clues.slice()).map(c => `<li>${c.t}</li>`).join('')}</ul>`, options: m.options, answer: m.answer, ex }, sh1, sh2);
  }
  return genOrder(Math.min(d, 3));
}
function genLogic5(d) { return d >= 2 && R() < .4 ? genSeating(d) : genLogic(Math.min(d, 3)); }
const SING = w => { const s = w.slice(0, -2), f = { 'נ': 'ן', 'מ': 'ם', 'פ': 'ף', 'כ': 'ך', 'צ': 'ץ' }; return s.slice(0, -1) + (f[s.slice(-1)] || s.slice(-1)); };
const NONW = ['זרגים', 'פלימים', 'טרומים', 'גלונים', 'בורקים', 'שמילים', 'קרפים', 'דולגים', 'מינקים', 'סלפים'];
const SY = {
  all: (A, B) => `כל ה${A} הם ${B}.`, some: (A, B) => `חלק מה${A} הם ${B}.`, none: (A, B) => `אין ${A} שהם ${B}.`, someNot: (A, B) => `חלק מה${A} אינם ${B}.`,
};
const SY_NONE = 'אף אחת מהמסקנות האחרות לא בטוחה';
/* c: [the certain conclusion, ...distractors]; s: per distractor, 'u' = can be true but not certain, 'f' = contradicts the premises.
   e: Euler diagrams (A acc, B gold, C violet); a dot marks "at least one is here". */
const SYT = [
  { d: 1, p: (A, B, C) => [SY.all(A, B), SY.all(B, C)], c: (A, B, C) => [SY.all(A, C), SY.all(C, A), SY.none(A, C), SY.all(C, B)], s: 'ufu',
    e: (A, B, C) => [lgEuler(170, 124, [lgC('c', C, 85, 62, 58, 85, 24), lgC('b', B, 85, 72, 40, 85, 48), lgC('a', A, 85, 84, 24, 85, 88)])],
    ex: (A, B, C) => `כל ה${A} נמצאים בתוך ה${B}, וכל ה${B} בתוך ה${C}. אז כל ה${A} בתוך ה${C}. ההפך (כל ה${C} הם ${A}) לא בטוח.`, h: (A, B, C) => [`ציירו עיגול של ${A} בתוך עיגול של ${B}. איפה צריך לצייר את העיגול של ${C}?`, `כל ה${B} בתוך ה${C}, אז העיגול של ${B} כולו בתוך העיגול של ${C}. ומה עם ה${A}, שנמצאים בתוך ה${B}?`] },
  { d: 1, p: (A, B, C) => [SY.all(A, B), SY.none(B, C)], c: (A, B, C) => [SY.none(A, C), SY.some(A, C), SY.all(C, A), SY.all(B, A)], s: 'ffu',
    e: (A, B, C) => [lgEuler(176, 124, [lgC('b', B, 56, 62, 52, 56, 30), lgC('a', A, 56, 82, 24, 56, 86), lgC('c', C, 144, 62, 28, 144, 66)])],
    ex: (A, B, C) => `ה${A} כולם בתוך ה${B}, ואף ${SING(B)} אינו ${SING(C)}. אז גם אף ${SING(A)} אינו ${SING(C)}.`, h: (A, B, C) => [`ציירו את ה${A} בתוך ה${B}. ואיפה ה${C}, אם אף ${SING(B)} אינו ${SING(C)}?`, `העיגול של ${C} נמצא כולו מחוץ לעיגול של ${B}, וה${A} נמצאים בתוך ה${B}. האם ${SING(A)} יכול לגעת ב${C}?`] },
  { d: 2, p: (A, B, C) => [SY.some(A, B), SY.all(B, C)], c: (A, B, C) => [SY.some(A, C), SY.all(A, C), SY.none(A, C), SY.all(C, B)], s: 'ufu',
    e: (A, B, C) => [lgEuler(180, 124, [lgC('c', C, 120, 62, 54, 130, 24), lgC('b', B, 130, 70, 28, 138, 74), lgC('a', A, 80, 68, 32, 64, 72)], [[107, 69]])],
    ex: (A, B, C) => `ה${A} שהם ${B} הם גם ${C} (כי כל ה${B} הם ${C}). אז לפחות חלק מה${A} הם ${C}. על כל ה${A} אי אפשר לדעת.`, h: (A, B, C) => [`התמקדו ב${A} שהם גם ${B}. מה המשפט השני אומר עליהם?`, `כל ה${B} הם ${C}, אז גם ה${A} שהם ${B} נמצאים בתוך ה${C}. האם זה נכון לכל ה${A}, או רק לחלק?`] },
  { d: 2, p: (A, B, C) => [SY.all(A, B), SY.some(C, A)], c: (A, B, C) => [SY.some(C, B), SY.all(C, B), SY.all(B, A), SY.none(C, B)], s: 'uuf',
    e: (A, B, C) => [lgEuler(180, 124, [lgC('b', B, 74, 62, 56, 50, 30), lgC('a', A, 92, 72, 28, 84, 76), lgC('c', C, 140, 76, 30, 152, 80)], [[115, 74]])],
    ex: (A, B, C) => `חלק מה${C} הם ${A}, וכל ${SING(A)} הוא גם ${SING(B)}. אז החלק הזה של ה${C} הוא ${B}.`, h: (A, B, C) => [`התמקדו ב${C} שהם ${A}. מה המשפט הראשון אומר על כל ${SING(A)}?`, `כל ${SING(A)} הוא גם ${SING(B)}. מה זה אומר על ה${C} שהם ${A}? והאם זה נכון לכל ה${C}?`] },
  { d: 2, p: (A, B, C) => [SY.none(A, B), SY.all(C, B)], c: (A, B, C) => [SY.none(C, A), SY.some(C, A), SY.all(B, C), SY.none(B, C)], s: 'fuf',
    e: (A, B, C) => [lgEuler(180, 124, [lgC('b', B, 60, 62, 54, 60, 28), lgC('c', C, 60, 82, 26, 60, 86), lgC('a', A, 150, 62, 26, 150, 66)])],
    ex: (A, B, C) => `כל ה${C} בתוך ה${B}, וה${A} לגמרי מחוץ ל${B}. אז ה${A} וה${C} לא נפגשים בכלל.`, h: (A, B, C) => [`ציירו עיגול של ${B}, ובתוכו את ה${C}. איפה אפשר לצייר את ה${A}?`, `ה${A} כולם מחוץ לעיגול של ${B}, וה${C} כולם בתוכו. האם יש מקום שבו ${SING(A)} ו${SING(C)} נפגשים?`] },
  { d: 3, p: (A, B, C) => [SY.all(A, B), SY.some(B, C)], c: (A, B, C) => [SY_NONE, SY.some(A, C), SY.none(A, C), SY.all(C, A)], s: 'uuu',
    e: (A, B, C) => [lgEuler(164, 124, [lgC('b', B, 66, 62, 54, 66, 26), lgC('a', A, 50, 74, 24, 50, 78), lgC('c', C, 134, 62, 26, 140, 50)], [[115, 66]], `כאן אין ${A} שהם ${C}`),
      lgEuler(164, 124, [lgC('b', B, 66, 62, 54, 60, 26), lgC('a', A, 78, 72, 26, 68, 88), lgC('c', C, 124, 72, 30, 130, 60)], [[99, 74]], `כאן יש ${A} שהם ${C}`)],
    ex: (A, B, C) => `ה${B} שהם ${C} יכולים להיות בדיוק אלה שאינם ${A}, אבל יכולים גם להיות ${A}. שני הציורים מתאימים למשפטים, לכן אי אפשר לדעת בוודאות שום דבר על ${A} ו${C}. זו המלכודת הכי נפוצה.`, h: (A, B, C) => [`ציירו את ה${A} בתוך ה${B}. האם ה${B} שהם ${C} חייבים להיות דווקא בתוך ה${A}?`, `נסו לצייר את ה${C} כך שיגעו ב${B} רק מחוץ ל${A}. האם שני המשפטים עדיין נכונים? ואם כן, מה זה אומר על כל מסקנה?`] },
  { d: 3, p: (A, B, C) => [SY.some(A, B), SY.some(B, C)], c: (A, B, C) => [SY_NONE, SY.some(A, C), SY.all(A, C), SY.none(A, C)], s: 'uuu',
    e: (A, B, C) => [lgEuler(164, 124, [lgC('b', B, 82, 62, 34, 82, 50), lgC('a', A, 32, 62, 26, 30, 106), lgC('c', C, 132, 62, 26, 134, 106)], [[53, 62], [111, 62]], `כאן אין ${A} שהם ${C}`),
      lgEuler(164, 124, [lgC('a', A, 60, 48, 32, 48, 40), lgC('c', C, 104, 48, 32, 116, 40), lgC('b', B, 82, 86, 32, 82, 106)], [[64, 74], [100, 74], [82, 62]], `כאן יש ${A} שהם ${C}`)],
    ex: (A, B, C) => `"חלק" ועוד "חלק" לא נותנים כלום. ה${B} שהם ${A} יכולים להיות שונים לגמרי מה${B} שהם ${C}, ויכולים גם להיות אותם. שני הציורים מתאימים למשפטים.`, h: (A, B, C) => [`שני המשפטים אומרים "חלק". האם ה${B} שהם ${A} חייבים להיות אותם ${B} שהם ${C}?`, `ציירו את ה${A} נוגעים בצד אחד של ה${B}, ואת ה${C} בצד השני. שני המשפטים נכונים? אז בדקו כל מסקנה מול הציור.`] },
  { d: 3, p: (A, B, C) => [SY.all(A, B), SY.someNot(C, B)], c: (A, B, C) => [SY.someNot(C, A), SY.some(C, A), SY.none(A, C), SY.all(B, A)], s: 'uuu',
    e: (A, B, C) => [lgEuler(176, 124, [lgC('b', B, 62, 62, 52, 62, 26), lgC('a', A, 54, 74, 24, 54, 78), lgC('c', C, 136, 62, 34, 146, 48)], [[150, 72]])],
    ex: (A, B, C) => `כל ${SING(A)} הוא ${SING(B)}. ה${C} שאינם ${B} (הנקודה מחוץ ל${B}) לא יכולים להיות ${A}. אז חלק מה${C} אינם ${A}.`, h: (A, B, C) => [`התמקדו ב${C} שאינם ${B}. האם מישהו מהם יכול להיות ${SING(A)}?`, `כל ה${A} נמצאים בתוך ה${B}. ${SING(C)} שנמצא מחוץ ל${B}, האם הוא יכול להיות בתוך ה${A}?`] },
];
const BELIEF = [['פילים', 'עכברים', 'גרים בחורים קטנים', 'גרים בחורים קטנים'], ['כלבים', 'ציפורים', 'מטילות ביצים', 'מטילים ביצים'], ['תפוחים', 'ירקות', 'גדלים מתחת לאדמה', 'גדלים מתחת לאדמה'], ['כדורסלנים', 'דגים', 'חיים במים', 'חיים במים'], ['פסנתרים', 'חלילים', 'מנגנים בהם בפה', 'מנגנים בהם בפה']];
const SY_METHOD = '<b>השיטה:</b> כל קבוצה היא עיגול. מציירים את שני המשפטים, ומחפשים ציור שבו המסקנה לא נכונה. אם יש ציור כזה, המסקנה לא בטוחה.';
function genSyll(d) {
  d = Math.min(d, 4);
  if (d >= 3 && R() < .3) {
    const [A, B, PB, PA] = pick(BELIEF);
    const ok = `כל ה${A} ${PA}.`, opts = [ok, 'אי אפשר להסיק כלום, כי המשפט הראשון לא נכון.', `כל ה${B} הם ${A}.`, `חלק מה${A} לא ${PA}.`];
    const m = mc(opts);
    const pic = lgEuler(170, 136, [lgC('c', PB, 85, 76, 56, 85, 14), lgC('b', B, 85, 84, 38, 85, 64), lgC('a', A, 85, 96, 24, 85, 100)]);
    const why = `<span class="calc"><span><b>בטוח:</b> ${ok}</span><span>${opts[1]} <i>לא נכון: בודקים רק את ההיגיון</i></span><span>${opts[2]} <i>לא בטוח: ההפך של המשפט הראשון</i></span><span>${opts[3]} <i>לא נכון: כולם בתוך העיגול</i></span></span>`;
    return withHint({ cat: 'logic', d, lk: 'belief', prompt: 'נניח ששני המשפטים נכונים, גם אם הם נשמעים מוזרים. מה נובע מהם בוודאות?', vis: `<div class="prem"><p>כל ה${A} הם ${B}.</p><p>כל ה${B} ${PB}.</p></div>`, options: m.options, answer: m.answer,
      ex: `<b>השיטה:</b> בשאלות כאלה בודקים רק את ההיגיון, לא את המציאות. מציירים עיגולים כאילו המשפטים נכונים.<span class="lg-eus">${pic}</span>ה${A} בתוך ה${B}, וה${B} בתוך העיגול של "${PB}". אז כל ה${A} ${PA}.${why}` }, `כאן בודקים רק היגיון, לא מציאות. נניח באמת שה${A} הם ${B}, גם אם זה נשמע מוזר. מה המשפט השני אומר על ה${B}?`, `ה${A} כולם בתוך ה${B}, ולכל ה${B} יש תכונה אחת: ${PB}. מה נובע מזה על ה${A}? אל תסמכו על מה שאתם יודעים מהחיים.`);
  }
  const T = pick(SYT.filter(t => t.d <= d && t.d >= Math.max(1, d - 1)));
  const [A, B, C] = shuffle(NONW).slice(0, 3);
  const opts = T.c(A, B, C), st = T.s.split('');
  /* at the top levels "none is certain" also shows up as a wrong option, so it is never a giveaway */
  if (d >= 3 && opts[0] !== SY_NONE && R() < .5) { const j = ri(1, 3); opts[j] = SY_NONE; st[j - 1] = 'n'; }
  const m = mc(opts);
  const tag = { u: 'לא בטוח: יכול להיות, אבל לא חייב', f: 'לא נכון: סותר את המשפטים', n: 'לא נכון: יש כאן מסקנה בטוחה' };
  const why = `<span class="calc"><span><b>${opts[0] === SY_NONE ? 'התשובה:' : 'בטוח:'}</b> ${opts[0]}</span>${opts.slice(1).map((o, j) => `<span>${o} <i>${tag[st[j]]}</i></span>`).join('')}</span>`;
  const pics = T.e(A, B, C), dots = pics.some(p => p.includes('lg-dot'));
  const ex = `${SY_METHOD}<span class="lg-eus">${pics.join('')}</span>${dots ? '<span class="lg-cap">נקודה = יש שם לפחות אחד.</span>' : ''}${T.ex(A, B, C)}${why}`;
  return withHint({ cat: 'logic', d, lk: 'syll', prompt: 'לפי שני המשפטים, איזו מסקנה נכונה בוודאות?', vis: `<div class="prem">${T.p(A, B, C).map(s => `<p>${s}</p>`).join('')}</div>`, options: m.options, answer: m.answer, ex }, ...T.h(A, B, C));
}
function genGroups(d) {
  d = Math.min(d, 3);
  const M = d <= 1 ? { n: 4, teams: ['הכחולה', 'האדומה'], size: 2, lab: true, ctx: n => `${n} חברים מתחלקים לשתי קבוצות כדורסל של 2: הכחולה והאדומה.` }
    : d === 2 ? { n: 6, teams: ['הכחולה', 'האדומה'], size: 3, lab: true, ctx: n => `${n} חברים מתחלקים לשתי קבוצות של 3 למשחק כדורסל: הכחולה והאדומה.` }
      : { n: 6, teams: ['א', 'ב', 'ג'], size: 2, lab: false, ctx: n => `${n} חברים מתחלקים ל-3 זוגות לתרגיל מסירות.` };
  const T = M.teams.length, unit = M.lab ? 'קבוצה' : 'זוג', same = M.lab ? 'באותה קבוצה' : 'באותו זוג';
  for (let tries = 0; tries < 60; tries++) {
    const ppl = shuffle(PEOPLE).slice(0, M.n).map(p => p[0]);
    const all = []; const rec = (i, arr, cnt) => { if (i === M.n) return all.push(arr.slice()); for (let t = 0; t < T; t++) if (cnt[t] < M.size) { arr[i] = t; cnt[t]++; rec(i + 1, arr, cnt); cnt[t]--; } };
    rec(0, [], Array(T).fill(0));
    /* unnamed pairs: keep one labelling per partition (first person in pair 0, the next new person in pair 1...) */
    const sols = M.lab ? all : all.filter(a => { let nx = 0; for (const t of a) { if (t > nx) return false; if (t === nx) nx++; } return true; });
    const truth = pick(sols);
    const cons = [];
    for (let i = 0; i < M.n; i++) for (let j = i + 1; j < M.n; j++) cons.push(truth[i] === truth[j] ? { t: 'with', i, j } : { t: 'apart', i, j });
    if (M.lab) cons.push(...shuffle(ppl.map((_, i) => ({ t: 'in', i, k: truth[i] }))).slice(0, 1));
    const sat = (a, c) => c.t === 'with' ? a[c.i] === a[c.j] : c.t === 'apart' ? a[c.i] !== a[c.j] : a[c.i] === c.k;
    let chosen = [], cur = sols;
    const maxWith = M.lab ? 2 : 1; let nw = 0;
    for (const c of shuffle(cons)) { if (c.t === 'with' && nw >= maxWith) continue; const nx = cur.filter(a => sat(a, c)); if (nx.length < cur.length) { chosen.push(c); cur = nx; if (c.t === 'with') nw++; } if (cur.length === 1) break; }
    if (cur.length !== 1) continue;
    for (const c of chosen.slice()) { const rest = chosen.filter(x => x !== c); if (sols.filter(a => rest.every(x => sat(a, x))).length === 1) chosen = rest; }
    const sol = cur[0];
    const mates = i => ppl.filter((_, j) => j !== i && sol[j] === sol[i]);
    const linked = (i, grp) => chosen.some(c => c.t === 'with' && (c.i === i || c.j === i) && grp.includes(c.i) && grp.includes(c.j));
    let prompt, ans, others, x, pairOf;
    if (M.size === 2) {
      const cand = ppl.map((_, i) => i).filter(i => !chosen.some(c => c.t === 'with' && (c.i === i || c.j === i)));
      if (!cand.length) continue; x = pick(cand); ans = mates(x)[0];
      others = ppl.filter((p, j) => j !== x && p !== ans);
      prompt = `עם מי ${ppl[x]} ב${unit}?`;
    } else {
      const tt = pick([0, 1]); const mem = ppl.map((_, i) => i).filter(i => sol[i] === tt);
      /* prefer an answer that no "together" clue names directly with the other two */
      const ks = shuffle(mem), k = ks.find(i => !linked(i, mem)) ?? ks[0], [a, b] = mem.filter(i => i !== k);
      ans = ppl[k]; x = a; pairOf = [a, b];
      others = ppl.filter((_, j) => sol[j] !== sol[k]);
      prompt = `מי השלישי בקבוצה של ${ppl[a]} ו${ppl[b]}?`;
    }
    const opts = [ans, ...shuffle(others).slice(0, 3)];
    if (opts.length < 3) continue;
    const ct = c => c.t === 'with' ? `${ppl[c.i]} ו${ppl[c.j]} ${same}.` : c.t === 'apart' ? `${ppl[c.i]} ו${ppl[c.j]} לא ${same}.` : `${ppl[c.i]} בקבוצה ${M.teams[c.k]}.`;
    const m = mc(opts);
    const ai = ppl.indexOf(ans), focus = M.size === 2 ? [x] : pairOf;
    const fx = lgWho(ppl[x]);
    const apart = [...new Set(chosen.filter(c => c.t === 'apart' && (focus.includes(c.i) || focus.includes(c.j))).map(c => focus.includes(c.i) ? c.j : c.i).filter(j => j !== ai && !focus.includes(j)))].slice(0, 2).map(j => ppl[j]);
    const sc = chosen.find(c => c.i !== ai && c.j !== ai);
    const gh1 = M.size === 2 ? `אספו את כל הרמזים שמזכירים את ${ppl[x]}. מי לפיהם לא יכול להיות ${same} ${g(fx, 'איתו', 'איתה')}?` : `${ppl[focus[0]]} ו${ppl[focus[1]]} ${same}. מי לפי הרמזים לא יכול להצטרף אליהם?`;
    const gh2 = apart.length ? `צעד ראשון: ${apart.join(' ו')} לא ${same} עם ${M.size === 2 ? ppl[x] : `${ppl[focus[0]]} ו${ppl[focus[1]]}`}. מי מהשאר מתאים לכל הרמזים?` : sc ? `התחילו מהרמז "${ct(sc).slice(0, -1)}". מה הוא אומר על המקומות שנשארו בשביל ${ppl[x]}?` : `ציירו ${M.lab ? 'שתי קופסאות' : 'שלוש קופסאות'} ושבצו את ${ppl[x]}. בכל רמז בדקו מי חייב ללכת לקופסה אחרת.`;
    /* explanation: trace of the clues (what each one fixes), then the boxes */
    const facts = M.lab
      ? c => { const out = []; ppl.forEach((_, i) => { if (c.every(a => a[i] === c[0][i])) out.push(i * 10 + c[0][i]); }); return out; }
      : c => { const out = []; for (let i = 0; i < M.n; i++) for (let j = i + 1; j < M.n; j++) if (c.every(a => a[i] === a[j])) out.push(i * 10 + j); return out; };
    const steps = lgTrace(chosen.map(c => ({ ...c, f: a => sat(a, c) })), sols, facts);
    const nmb = j => j === ai ? `<b>${ppl[j]}</b>` : ppl[j];
    const say = nf => M.lab
      ? M.teams.map((tn, t) => { const w = nf.filter(v => v % 10 === t).map(v => nmb(Math.floor(v / 10))); return w.length ? `בקבוצה ${tn}: ${w.join(', ')}` : ''; }).filter(Boolean).join('. ')
      : nf.map(v => `${nmb(Math.floor(v / 10))} עם ${nmb(v % 10)}`).join(', ');
    const lines = steps.map((s, i) => `<span>${i + 1}. ${ct(s.c).slice(0, -1)} ← ${s.nf.length ? say(s.nf) : 'עוד לא קובע, נשמור להמשך'}</span>`).join('');
    const boxes = `<span class="lg-teams">${M.teams.map((tn, t) => `<span class="lg-team"><b>${M.lab ? 'הקבוצה ' + tn : 'זוג ' + tn}</b>${ppl.map((p, j) => sol[j] === t ? `<span class="lg-mem${j === ai ? ' on' : focus.includes(j) ? ' me' : ''}">${p}</span>` : '').join('')}</span>`).join('')}</span>`;
    const fin = M.size === 2 ? `${ppl[x]} ב${unit} עם <b>${ans}</b>.` : `השלישי בקבוצה של ${ppl[pairOf[0]]} ו${ppl[pairOf[1]]} הוא <b>${ans}</b>.`;
    const ex = `<b>השיטה:</b> מציירים ${M.lab ? 'קופסה לכל קבוצה' : 'קופסה לכל זוג'}. מתחילים מרמז שקובע מקום או מצמיד שניים, ובכל רמז "לא ${same}" שולחים לקופסה אחרת.<span class="calc">${lines}</span>${boxes}${fin}`;
    return withHint({ cat: 'logic', d, lk: 'groups', prompt, vis: `<p class="ctx">${M.ctx(M.n)} החברים: ${ppl.join(', ')}.</p><ul class="clues grp">${shuffle(chosen.slice()).map(c => `<li>${ct(c)}</li>`).join('')}</ul>`, options: m.options, answer: m.answer, ex }, gh1, gh2);
  }
  return genLogic(Math.min(d, 3));
}

function genFamily(d) {
  const it = pickBank(FAM, 'fam', Math.min(d, 3)); const m = mc(it.o.map(o => /^\d+$/.test(o) ? L(o) : o));
  return { cat: 'logic', d, lk: 'family', prompt: it.q, vis: '', options: m.options, answer: m.answer, ex: it.ex }; /* the bank explanation already draws the family tree */
}

/* ---------- shape tutorials ---------- */
const SHAPE_KEYS = { matrix: 'טבלת צורות', dial: 'סדרת צורות', figan: 'אנלוגיה של צורות', rotation: 'צורה מסובבת', net: 'פריסת קובייה', cubes: 'ספירת קוביות' };
const HE_SHAPE = { circle: 'עיגול', square: 'ריבוע', triangle: 'משולש', diamond: 'מעוין', star: 'כוכב', hex: 'משושה' }, HE_FILL = ['ריק', 'אפור', 'מלא'], HE_ATTR = { shape: 'צורה', count: 'כמות', fill: 'מילוי' };
/* a worked example for a guided lesson */
function guideExample(key) {
  const f = {
    matrix: () => genMatrix(1), dial: () => genShapeSeries(1), figan: () => genFigAn(1),
    op: () => genOp(1), symbols: () => genSym(1), calendar: () => genCal(1), seating: () => genSeating(2), order: () => genOrder(1),
    syll: () => genSyll(1), groups: () => genGroups(1), magic: () => genMagic(1),
    unit: () => MT.unit(2, 'one'), ages: () => MT.ages(2, 'fut'), lcm: () => MT.buses(2, 2), ratio: () => MT.ratio(1, 'total'),
    geoAngle: () => genGeoEx('geoAngle'), geoArea: () => genGeoEx('geoArea'), geoCircle: () => genGeoEx('geoCircle'), geoVolume: () => genGeoEx('geoVolume'),
    geometry: () => MT.rect(2, 'back'), pairs: () => MT.handshake(1, 'once'), consec: () => MT.consec(1, '3'),
  }[key];
  if (f) return f();
  if (key === 'ifthen') { const it = LG.find(x => /^אם יורד/.test(x.q) && /לא לקח/.test(x.q)) || LG[0]; const m = mc(it.o); return { cat: 'logic', d: 1, prompt: it.q, vis: '', options: m.options, answer: m.answer, ex: it.ex }; }
  for (let k = 0; k < 60; k++) { const q = GEN.spatial(1); if (lessonFor(q) === key) return q; }
  return GEN.spatial(1);
}
const rowSays = rule => rule === 'const' || rule === 'byrow' ? 'same' : 'diff';
const GSTEPS = {
  matrix: q => {
    const M = q.meta, A = ['shape', 'count', 'fill'];
    const latin = A.some(a => /latin/.test(M.rules[a])), byrow = A.some(a => M.rules[a] === 'byrow');
    const val = (a, v) => a === 'shape' ? HE_SHAPE[v] : a === 'count' ? v : HE_FILL[v];
    return [
      { t: 'בכל משבצת בודקים 3 תכונות, כל אחת לבד: איזו <b>צורה</b>, <b>כמה</b> צורות, ואיזה <b>מילוי</b> (ריק, אפור או מלא).' },
      { t: 'מסתכלים רק על <b>השורה העליונה</b>. לכל תכונה: היא נשארת אותו דבר לאורך השורה, או משתנה? לחץ על התשובה שלך.', hl: [0, 1, 2], ask: A.map(a => [a, rowSays(M.rules[a])]) },
      { t: 'בודקים שהחוק נכון גם <b>בשורה השנייה</b>.' + (latin ? ' בטבלה הזאת יש תכונה שכל ערך שלה מופיע פעם אחת בכל שורה ובכל עמודה, כמו בסודוקו.' : byrow ? ' שים לב: יש תכונה שקבועה בתוך כל שורה, אבל משתנה משורה לשורה.' : ''), hl: [3, 4, 5] },
      { t: 'עכשיו בונים בראש את <b>המשבצת החסרה</b>, תכונה אחרי תכונה:<div class="gans">' + A.map(a => `<span>${HE_ATTR[a]}: <b>${val(a, M.ans[a])}</b></span>`).join('') + '</div>', hl: [6, 7, 8] },
      { t: 'פוסלים כל תשובה ששונה <b>אפילו בתכונה אחת</b>. מה שנשאר זו התשובה.', elim: i => { const o = M.opts[i]; const diff = A.filter(a => o[a] !== M.ans[a]); return diff.length ? 'שונה ב' + diff.map(a => HE_ATTR[a]).join(' וב') : ''; } },
    ];
  },
  dial: q => [
    { t: 'כל צורה בסדרה בנויה מכמה חלקים, למשל מחוג, נקודה ומילוי. עוקבים אחרי <b>כל חלק לבד</b>.' },
    { t: 'מכסים באצבע את כל החלקים חוץ מהמחוג. סופרים בכמה <b>שנתות</b> (הנקודות הקטנות מסביב) הוא זז מהצורה הראשונה (מימין) לשנייה, ולאיזה כיוון.', hl: [0, 1] },
    { t: 'בודקים שזה <b>אותו צעד</b> גם בין השנייה לשלישית. אחר כך עושים אותו דבר לנקודה ולרקע.', hl: [1, 2] },
    { t: 'ממשיכים את אותו צעד עוד פעם אחת. ' + q.ex, hl: 'last' },
    { t: 'פוסלים תשובות שבהן אפילו חלק אחד לא במקום.', elim: () => '' },
  ],
  figan: q => [
    { t: 'מסתכלים על <b>הזוג הראשון</b>. מה השתנה בין הצורה הראשונה לשנייה? צורה? כמות? מילוי? כיוון?', hl: [0, 1] },
    { t: 'מפעילים <b>בדיוק אותו שינוי</b> על הצורה השלישית, ולא שום דבר אחר.', hl: [2, 3] },
    { t: q.ex + ' פוסלים תשובות שעשו שינוי אחר, או שינו יותר מדי.', elim: () => '' },
  ],
  rotation: q => [
    { t: 'בוחרים <b>חלק בולט אחד</b> בצורה: זנב, פינה או בליטה.' },
    { t: 'מסובבים בראש, ובודקים לאיזה צד החלק הבולט פונה ביחס לשאר הצורה.' },
    { t: 'המלכודת: <b>תמונת מראה</b> נראית כמעט אותו דבר, אבל הצד מתהפך. צורה מסובבת לא מתהפכת לעולם.' },
    { t: q.ex, elim: () => '' },
  ],
  net: q => [
    { t: 'קודם פוסלים: פאה שנוגעת בפאה המסומנת בפריסה <b>אף פעם לא</b> נמצאת מולה.' },
    { t: 'כלל 1: <b>שלוש משבצות בקו ישר</b>. שני הקצוות נגדיים.' },
    { t: 'כלל 2: <b>צורת Z</b>. שורה ישרה, ומשבצת תלויה בכל קצה שלה, אחת לכל צד. שתי התלויות נגדיות.' },
    { t: q.ex, elim: () => '' },
  ],
  cubes: q => [
    { t: 'לא סופרים קובייה קובייה. סופרים <b>עמודה עמודה</b>: כמה קוביות יש בכל עמודה?' },
    { t: 'כל קובייה עומדת על משהו. מתחת לקובייה גבוהה יש קוביות <b>שלא רואים</b>, וגם אותן סופרים.' },
    { t: 'בסוף סופרים שוב בדרך אחרת, למשל שכבה שכבה, כדי לבדוק.' },
    { t: q.ex, elim: () => '' },
  ],
};
let G = null;
function startGuide(key, back) {
  clearTimers(); stopFun && stopFun();
  const q = guideExample(key);
  G = { key, q, steps: GSTEPS[key](q), i: 0, back, ans: {} };
  S.guideSeen = Object.assign({}, S.guideSeen, { [key]: 1 }); save();
  renderGuide(); window.scrollTo(0, 0);
}
function renderGuide() {
  const { q, steps, i, key } = G, st = steps[i], last = i === steps.length - 1;
  const ask = st.ask ? `<div class="gask">${st.ask.map(([a, truth]) => { const got = G.ans[a]; return `<div class="garow"><b>${HE_ATTR[a]}</b><button class="chip ${got === 'same' ? (truth === 'same' ? 'ok' : 'no') : ''}" data-ga="${a}:same">קבוע</button><button class="chip ${got === 'diff' ? (truth === 'diff' ? 'ok' : 'no') : ''}" data-ga="${a}:diff">משתנה</button>${got ? `<span class="small">${got === truth ? '✓' : 'בדוק שוב'}</span>` : ''}</div>`; }).join('')}</div>` : '';
  const qa = st.q ? `<div class="gask"><div class="small" style="margin-bottom:4px">${st.q.label}</div><div class="chips">${st.q.options.map((o, k) => `<button class="chip ${G.qa === k ? (k === st.q.correct ? 'ok' : 'no') : ''}" data-gq="${k}">${o}</button>`).join('')}</div>${G.qa != null ? `<div class="small" style="margin-top:6px">${G.qa === st.q.correct ? '✓ ' + (st.q.yes || 'נכון!') : 'לא בדיוק. נסה שוב.'}</div>` : ''}</div>` : '';
  const opts = st.elim ? `<div class="opts grid gopts">${q.options.map((o, k) => { const why = k === q.answer ? '' : st.elim(k); return `<div class="opt ${k === q.answer ? 'ok' : 'gx'}"><span class="lt">${['א', 'ב', 'ג', 'ד', 'ה'][k]}</span><span class="ob">${o}</span>${k !== q.answer ? `<span class="gwhy">${why || 'נפסלת'}</span>` : ''}</div>`; }).join('')}</div>` : '';
  app.innerHTML = `<div class="stack"><div class="card guide"><div class="row" style="justify-content:space-between"><div class="eyebrow">שיעור קצר · ${SHAPE_KEYS[key]}</div><span class="small muted">${i + 1}/${steps.length}</span></div>
  <p class="qprompt" style="margin:6px 0">${q.prompt}</p><div class="qvis gvis">${q.vis}</div>${opts}<div class="gstep">${st.t}</div>${ask}${qa}
  <div class="row" style="gap:8px;margin-top:12px">${i ? '<button class="btn btn-ghost" data-g="prev" style="flex:1">חזרה</button>' : ''}<button class="btn btn-primary" data-g="${last ? 'done' : 'next'}" style="flex:2">${last ? (G.back === 'quiz' ? 'עכשיו תורי' : 'סיימתי') : 'הבא'}</button></div></div></div>`;
  const vis = app.querySelector('.gvis'), cells = vis.querySelectorAll('.matrix .mbox, .sseries .fbox, .fan .fbox');
  if (st.sel) { vis.classList.add('focus'); vis.querySelectorAll(st.sel).forEach(e => e.classList.add('hl')); }
  app.querySelectorAll('[data-gq]').forEach(b => b.onclick = () => { G.qa = +b.dataset.gq; SFX.tap(); renderGuide(); });
  if (st.hl) { vis.classList.add('focus'); const idx = st.hl === 'last' ? [cells.length - 2, cells.length - 1] : st.hl; idx.forEach(k => cells[k] && cells[k].classList.add('hl')); }
  app.querySelectorAll('[data-ga]').forEach(b => b.onclick = () => { const [a, v] = b.dataset.ga.split(':'); G.ans[a] = v; SFX.tap(); renderGuide(); });
  app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
    const a = b.dataset.g; SFX.tap();
    if (a === 'prev') { G.i--; G.qa = null; return renderGuide(); }
    if (a === 'next') { G.i++; G.qa = null; return renderGuide(); }
    const back = G.back; G = null;
    if (back === 'quiz' && S.cur) { S.cur.qStart = Date.now(); S.view = 'quiz'; save(); renderQuiz(); } else { S.view = 'stats'; S.ptab = 'rules'; save(); render(); }
    window.scrollTo(0, 0);
  });
}
Object.assign(SHAPE_KEYS, { op: 'פעולה מומצאת', symbols: 'משוואות סמלים', calendar: 'ימים בשבוע', seating: 'סידור מקומות', order: 'סידור לפי גודל', ifthen: 'אם... אז', syll: 'מסקנה בטוחה', groups: 'חלוקה לקבוצות', magic: 'תיבת קסם' });
const pickWrong = (right, pool) => shuffle(pool.filter(v => v !== right)).slice(0, 2).concat(right).sort(() => R() - .5);
Object.assign(GSTEPS, {
  op: q => {
    const m = /(\d+)\s*◆\s*(\d+)/.exec(strip(q.prompt)); const st = [
      { t: 'הסימן ◆ הוא <b>פעולה מומצאת</b>. לא צריך לדעת אותה מראש: ההגדרה בתוך השאלה אומרת בדיוק מה לעשות עם a ועם b.', sel: '.eq' },
    ];
    if (m) { const opts = [m[1], m[2]]; st.push({ t: `בשאלה: ${L(`${m[1]} ◆ ${m[2]}`)}. מה מציבים במקום <b>a</b>?`, q: { label: 'a =', options: opts, correct: 0, yes: 'a הוא תמיד המספר הראשון, ו-b השני.' } }); }
    st.push({ t: 'כותבים את ההגדרה על דף, ומחליפים כל אות במספר שלה. רק אחר כך מחשבים.' });
    st.push({ t: q.ex, elim: () => '' });
    return st;
  },
  symbols: q => [
    { t: 'כל סמל מייצג מספר קבוע. המטרה: לגלות סמל אחד בכל פעם.' },
    { t: 'מתחילים מהשורה שיש בה <b>רק סוג אחד של סמל</b>. ממנה אפשר לחשב אותו מיד.', sel: '.eq:first-child' },
    { t: 'מציבים את מה שגילינו בשורה הבאה, ומגלים את הסמל הבא.', sel: '.eq:nth-child(2)' },
    { t: q.ex, elim: () => '' },
  ],
  calendar: q => {
    const m = /בעוד (\d+) ימים/.exec(strip(q.prompt)); const st = [{ t: 'כל 7 ימים חוזרים <b>לאותו יום בשבוע</b>. שבועות שלמים לא משנים כלום.' }];
    if (m) { const N = +m[1], r = N % 7; st.push({ t: `צריך רק את <b>השארית</b>: כמה נשאר מ-${N} אחרי שמורידים שבועות שלמים?`, q: { label: `${N} ÷ 7, השארית היא:`, options: pickWrong(r, [0, 1, 2, 3, 4, 5, 6]).map(String), correct: -1, yes: `${N} = 7×${Math.floor(N / 7)} + ${r}.` } }); const s = st[1]; s.q.correct = s.q.options.indexOf(String(r)); }
    st.push({ t: 'מתקדמים מהיום הנתון רק את מספר הימים של השארית.' });
    st.push({ t: q.ex, elim: () => '' });
    return st;
  },
  seating: q => [
    { t: 'מציירים כיסאות ממוספרים, וממלאים בעיפרון. אף פעם לא פותרים רק בראש.', sel: '.seats' },
    { t: 'מתחילים מ<b>הרמז הכי חזק</b>: מקום קבוע ("במקום 1"), אחר כך קצוות, ואז "יושבים זה ליד זה".', sel: '.clues li' },
    { t: 'רמזים של "לא" ("לא בקצה", "לא ליד") שומרים לסוף, כדי לפסול אפשרויות.' },
    { t: q.ex, elim: () => '' },
  ],
  order: q => [
    { t: 'מציירים קו: <b>הכי גדול למעלה, הכי קטן למטה</b>.' },
    { t: 'מניחים שם אחרי שם, רמז אחרי רמז. "X גבוה מ-Y" אומר: X מעל Y. לא משנה איך המשפט מנוסח.', sel: '.clues li' },
    { t: q.ex, elim: () => '' },
  ],
  ifthen: q => [
    { t: 'משפט "<b>אם</b> A <b>אז</b> B" אומר רק דבר אחד: כש-A קורה, גם B קורה.' },
    { t: 'הוא <b>לא</b> אומר מה קורה כש-A לא קורה. וגם אם B קרה, לא בטוח ש-A קרה.' },
    { t: 'הדבר היחיד שבטוח: אם <b>B לא קרה</b>, גם A לא קרה. (אם לא לקח מטרייה, לא ירד גשם.)' },
    { t: q.ex, elim: () => '' },
  ],
  syll: q => [
    { t: 'כל קבוצה היא <b>עיגול</b>. "כל X הם Y" אומר: העיגול של X נמצא בתוך העיגול של Y.', sel: '.prem p:first-child' },
    { t: 'מוסיפים את המשפט השני לאותו ציור.', sel: '.prem p:nth-child(2)' },
    { t: 'מסקנה <b>בטוחה</b> רק אם היא נכונה בכל ציור אפשרי. מנסים לצייר ציור שבו היא לא נכונה. אם הצלחת, היא לא בטוחה.' },
    { t: q.ex, elim: () => '' },
  ],
  groups: q => [
    { t: 'מציירים את הקבוצות כעמודות ריקות.' },
    { t: 'מתחילים ממי <b>שהמקום שלו ידוע</b>, ואז מצמידים את מי שחייב להיות יחד.', sel: '.clues li' },
    { t: 'רמזי "לא באותה קבוצה" שולחים לצד השני.' },
    { t: q.ex, elim: () => '' },
  ],
  magic: q => [
    { t: 'מסתכלים על <b>הזוג הראשון</b> ומנחשים חוק: ועוד? כפול? כפול ועוד?', sel: '.mrow:first-child' },
    { t: 'בודקים את החוק <b>על כל הזוגות</b>. חוק שמתאים רק לזוג אחד הוא מלכודת.', sel: '.mrow:not(:last-child)' },
    { t: q.ex, elim: () => '' },
  ],
});
/* ---------- math guided lessons: a worked example, one step at a time, with a small check in the middle ---------- */
Object.assign(SHAPE_KEYS, { unit: 'מחיר ליחידה', ages: 'שאלות גילאים', lcm: 'כפולה משותפת', ratio: 'יחס', geometry: 'היקף ושטח', pairs: 'כל אחד נגד כל אחד', consec: 'מספרים עוקבים' });
/* a check inside a step: the right answer and up to two wrong ones, shuffled */
const gQ = (label, right, wrongs, yes) => { const o = shuffle([String(right)].concat(wrongs.map(String).filter((w, i, a) => w !== String(right) && a.indexOf(w) === i).slice(0, 2))); return { label, options: o, correct: o.indexOf(String(right)), yes }; };
/* the last step: every option with a short reason, as text (the reasons are too long for the crossed-out option boxes) */
const gWhyStep = q => ({ t: `<b>למה רק תשובה אחת נכונה:</b><span class="gwl">${q.options.map((o, i) => `<span class="${i === q.answer ? 'ok' : ''}"><b>${['א', 'ב', 'ג', 'ד', 'ה'][i]}.</b> ${o} · ${i === q.answer ? 'נכון' : ((q.meta || {}).why || {})[mKey(o)] || 'לא יוצא בחישוב'}</span>`).join('')}</span>` });
Object.assign(GSTEPS, {
  unit: q => { const M = q.meta, wa = M.ua < M.ub;
    return [
      { t: `המחיר של חבילה לבד לא אומר מה משתלם, כי בכל חבילה יש כמות אחרת. משווים <b>מחיר של ${M.one}</b>: מחיר החבילה ÷ כמה יש בה.` },
      { t: `חבילה של ${M.a} ב-${L(money(M.pa))} ₪.`, q: gQ(`כמה עולה ${M.one}? ${L(`${money(M.pa)} ÷ ${M.a}`)}`, money(M.ua), [money(M.ub), money(M.ua + .5), money(M.ua - .5)], `נכון. לא יוצא שלם? מחלקים קודם את השקלים השלמים, ואת מה שנשאר הופכים לאגורות.`) },
      { t: `חבילה של ${M.b} ב-${L(money(M.pb))} ₪.`, q: gQ(`כמה עולה ${M.one}? ${L(`${money(M.pb)} ÷ ${M.b}`)}`, money(M.ub), [money(M.ua), money(M.ub + .5), money(M.ub - .5)], 'נכון.') },
      { t: `משווים: ${L(money(M.ua))} מול ${L(money(M.ub))}. הזול יותר הוא <b>${L(money(M.best))} ₪</b>, בחבילה של ${wa ? M.a : M.b}.${(M.pa < M.pb) !== wa ? ' שימו לב: דווקא החבילה השנייה זולה יותר בסך הכל. זו המלכודת.' : ''}${mPacks([[M.a, M.pa, M.ua], [M.b, M.pb, M.ub]], M.best, M.one)}` },
      gWhyStep(q),
    ]; },
  ages: q => { const M = q.meta;
    return [
      { t: `כל שנה גם ${M.nm} וגם אבא מתבגרים בשנה אחת. לכן <b>ההפרש</b> בין הגילים לא משתנה לעולם. זה כל הסוד של שאלות גילאים.` },
      { t: `היום אבא פי ${M.m1}. אם הגיל של ${M.nm} הוא חלק אחד, אבא הוא ${M.m1} חלקים.`, q: gQ('כמה חלקים הוא ההפרש ביניהם?', `${M.A} חלקים`, [`${M.m1} חלקים`, `${M.m1 + 1} חלקים`], `נכון: ${M.m1} פחות 1. ההפרש הוא ${mTimes(M.A)} הגיל של ${M.nm} היום.`) },
      { t: `${M.when} אבא פי ${M.m2}.`, q: gQ(`ההפרש ${M.when} הוא:`, `${M.B} פעמים הגיל של ${M.nm} אז`, [`${M.m2} פעמים הגיל של ${M.nm} אז`, `${M.A} פעמים הגיל של ${M.nm} אז`], 'נכון, מאותה סיבה.') },
      { t: `זה אותו הפרש: ${M.A} פעמים הגיל היום שווה ל-${M.B} פעמים הגיל ${M.when}. זה קורה כשהגיל היום הוא <b>${M.pNow} חלקים</b> והגיל ${M.when} <b>${M.pOth} חלקים</b>. ההבדל ביניהם הוא חלק אחד, וזה בדיוק ${M.k} השנים.${mBar([['היום', mRep(M.pNow, M.k)], [M.when, mRep(M.pNow, M.k).concat([[M.k, 'g']])]], 'mparts', `<span class="mcap">כל משבצת היא ${M.k} שנים.</span>`)}` },
      { t: `כל חלק הוא ${M.k} שנים.`, q: gQ(`מה הגיל של ${M.nm} היום?`, M.X, [M.Y, M.dad, M.k], `${L(`${M.pNow} × ${M.k} = ${M.X}`)}. בדיקה: היום ${M.X} ו-${M.dad}, ${M.when} ${M.Y} ו-${M.dadY}.`) },
      { t: `הנה זה בציור: שני הפסים גדלים יחד, והחלק הצהוב לא משתנה.${mAgesTL(M.nm, [['היום', M.X, M.dad], [M.when, M.Y, M.dadY]])}במבחן אפשר גם להציב כל תשובה: גיל, הגיל של אבא, ועוד ${M.k} לשניהם.` },
      gWhyStep(q),
    ]; },
  lcm: q => { const M = q.meta, [a, b] = M.P, l = M.l, ms = Array.from({ length: l / b }, (_, i) => (i + 1) * b);
    return [
      { t: `"ייצאו שוב יחד" = מספר דקות שמתחלק <b>גם ב-${a} וגם ב-${b}</b>. מחפשים את הקטן ביותר: הכפולה המשותפת הקטנה.` },
      { t: `כותבים את הכפולות של המספר הגדול, ${b}: ${L(ms.concat(['…']).join(', '))}. כל אחת בודקים: האם היא מתחלקת ב-${a}?` },
      { t: 'מוצאים את הראשונה.', q: gQ(`הכפולה הראשונה של ${b} שמתחלקת גם ב-${a}:`, l, [a * b, b, l + b], `נכון: ${L(`${l} ÷ ${a} = ${l / a}`)}.${a * b !== l ? ` גם ${L(`${a} × ${b} = ${a * b}`)} מתחלק, אבל הוא לא הראשון.` : ''}`) },
      { t: `מוסיפים ${l} דקות ל-${L('8:00')}: <b>${TM(l)}</b>.${mBusTL([['קו 5', a], ['קו 9', b]], l)}` },
      gWhyStep(q),
    ]; },
  ratio: q => { const M = q.meta;
    return [
      { t: `"על כל ${M.boys} יש ${M.b} בנות" אומר שהכיתה בנויה מ<b>קבוצות שוות</b>. בכל קבוצה ${M.boys} ו-${M.b} בנות.` },
      { t: 'קודם גודל של קבוצה אחת.', q: gQ('כמה ילדים בקבוצה אחת?', M.a + M.b, [M.a * M.b, M.b], `${L(`${M.a} + ${M.b} = ${M.a + M.b}`)}.`) },
      { t: `בכיתה ${M.T} ילדים.`, q: gQ('כמה קבוצות כאלה יש?', M.k, [Math.round(M.T / M.b), M.k + 1], `${L(`${M.T} ÷ ${M.a + M.b} = ${M.k}`)}.`) },
      { t: `בכל קבוצה ${M.b} בנות, ויש ${M.k} קבוצות: ${L(`${M.b} × ${M.k} = ${M.B}`)}.${mBar([['בנים', mRep(M.a, M.k)], ['בנות', mRep(M.b, M.k, 'g')]], '', `<span class="mcap">כל משבצת היא ${M.k} ילדים.</span>`)}` },
      gWhyStep(q),
    ]; },
  geometry: q => { const M = q.meta;
    return [
      { t: `<b>היקף</b> הוא הדרך מסביב: אורך + רוחב + אורך + רוחב. <b>שטח</b> הוא כמה ריבועים של 1 על 1 נכנסים בפנים: אורך × רוחב. מציירים ורושמים מה ידוע.${mRect(M.l, M.w, true, M.l, '?')}` },
      { t: `ההיקף הוא ${M.P}, והוא עובר על שני אורכים ושני רוחבים.`, q: gQ('כמה זה אורך אחד ועוד רוחב אחד?', M.h, [M.P - M.l, M.P - 2 * M.l], `${L(`${M.P} ÷ 2 = ${M.h}`)}. חצי מהדרך מסביב.`) },
      { t: `האורך ${M.l}.`, q: gQ('מה הרוחב?', M.w, [2 * M.w, M.P - M.l], `${L(`${M.h} − ${M.l} = ${M.w}`)}.`) },
      { t: `עכשיו השטח: ${L(`${M.l} × ${M.w} = ${M.l * M.w}`)}.` },
      gWhyStep(q),
    ]; },
  pairs: q => { const M = q.meta, n = M.n;
    return [
      { t: `כל שחקן משחק נגד כל האחרים. בציור: כל נקודה היא שחקן, וכל קו הוא משחק.${mPoly(n)}` },
      { t: `יש ${n} שחקנים.`, q: gQ('נגד כמה שחקנים משחק כל שחקן?', n - 1, [n, n - 2], 'נגד כולם, חוץ מעצמו.') },
      { t: `${L(`${n} × ${n - 1} = ${n * (n - 1)}`)}. אבל כך <b>כל משחק נספר פעמיים</b>: פעם אצל כל אחד משני השחקנים.` },
      { t: 'מתקנים את הספירה הכפולה.', q: gQ('כמה משחקים יש באמת?', M.H, [n * (n - 1), M.H + n], `${L(`${n * (n - 1)} ÷ 2 = ${M.H}`)}. בדיקה בדרך אחרת: ${L(Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + '))} = ${M.H}.`) },
      gWhyStep(q),
    ]; },
  consec: q => { const M = q.meta, w = M.big ? 'הגדול' : 'הקטן', ans = M.big ? M.mid + 1 : M.mid - 1;
    return [
      { t: `במספרים עוקבים כל מספר גדול ב-1 מהקודם. לכן המספר האמצעי הוא בדיוק <b>הממוצע</b>. למשל ${L('20 + 21 + 22 = 63')}, ו-${L('63 ÷ 3 = 21')}.` },
      { t: `הסכום כאן ${M.S}.`, q: gQ('מה המספר האמצעי?', M.mid, [M.mid + 1, M.mid - 1], `${L(`${M.S} ÷ 3 = ${M.mid}`)}.`) },
      { t: `המספרים: ${L(`${M.mid - 1}, ${M.mid}, ${M.mid + 1}`)}. ${w}: <b>${ans}</b>.${mNL([{ v: M.mid - 1, t: M.mid - 1 }, { v: M.mid, t: M.mid, w: 'ממוצע', c: 'a' }, { v: M.mid + 1, t: M.mid + 1 }].map(p => p.v === ans ? Object.assign(p, { c: 'g', w }) : p))}` },
      gWhyStep(q),
    ]; },
});

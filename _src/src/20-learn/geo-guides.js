/* ---------- geometry lessons: the rule (LESSONS) and a step-by-step guide (GSTEPS) for each geometry key ---------- */
/* "180°" inside Hebrew text needs an LTR span (gLtrDeg, geometry.js) */
Object.assign(LESSONS, {
  geoAngle: ['זוויות', 'קו ישר = 180°. סיבוב שלם סביב נקודה = 360°. במשולש הזוויות ביחד 180°, ובמרובע 360°. זוויות קודקודיות (אחת מול השנייה) שוות. זווית בחוץ של משולש = שתי הזוויות שבפנים שלא נוגעות בה.'],
  geoArea: ['שטח והיקף', 'היקף = הדרך מסביב, בס"מ. שטח = כמה ריבועים של 1 על 1 נכנסים בפנים, בסמ"ר. משולש: בסיס × גובה ÷ 2, והגובה הוא הקו המקווקו (לא הצלע המשופעת). מקבילית: בסיס × גובה. טרפז: (בסיס + בסיס) × גובה ÷ 2.'],
  geoCircle: ['מעגל', 'קוטר = 2 רדיוסים. היקף = π × קוטר. שטח = π × רדיוס × רדיוס. π ≈ 3.14. נתון קוטר ושואלים על שטח? קודם מחלקים ב-2.'],
  geoVolume: ['גופים ונפח', 'נפח תיבה = אורך × רוחב × גובה, בסמ"ק: כמה קוביות של 1 ס"מ נכנסות. שטח פנים = השטח של כל 6 הפאות (3 זוגות שווים). מידה אחת גדלה פי 2? הנפח גדל פי 2. כל המידות פי 2? הנפח פי 8.'],
});
['geoAngle', 'geoArea', 'geoCircle', 'geoVolume'].forEach(k => { LESSONS[k][1] = gLtrDeg(LESSONS[k][1]); });
Object.assign(SHAPE_KEYS, { geoAngle: 'זוויות', geoArea: 'שטח והיקף', geoCircle: 'מעגל', geoVolume: 'גופים ונפח' });
/* the worked example of each guide */
const GEO_EX = { geoAngle: () => GANG.tri(1), geoArea: () => GAR.tri(2), geoCircle: () => GCI.area(2, 1), geoVolume: () => GVO.cubes(1) };
/* guideExample() (guides.js) has no hook for new keys, so for these keys it hands over a spatial question.
   The step builders put a geometry example into that same object (renderGuide shows G.q), unless it already is one. */
function geoGuideQ(q, key) {
  if (lessonFor(q) !== key) { Object.keys(q).forEach(k => delete q[k]); Object.assign(q, genGeoEx(key)); }
  return q;
}
function genGeoEx(key) { const q = GEO_EX[key](); q.cat = 'geo'; q.lk = key; return q; }
const gDg = v => L(v + '°');
const geoSteps = st => st.map(x => Object.assign(x, { t: gLtrDeg(x.t) }));
Object.assign(GSTEPS, {
  geoAngle: q0 => { const q = geoGuideQ(q0, 'geoAngle'), M = q.meta, [k1, k2] = M.kn, sum = k1 + k2, x = M.x;
    const sl = {}, st = {}; ['A', 'B', 'C'].forEach((k, i) => { const v = M[k]; sl[k] = v === 90 ? '' : gA(v); st[k] = i === M.xi ? 's' : 'k'; });
    return geoSteps([
      { t: `זווית מודדים במעלות (°). יש ארבעה סוגים: <b>חדה</b> (פחות מ-90°), <b>ישרה</b> (בדיוק 90°, מסמנים בריבוע קטן), <b>קהה</b> (בין 90° ל-180°) ו<b>שטוחה</b> (180°, קו ישר).${figKinds(-1)}` },
      { t: 'ארבעה מספרים שכדאי לזכור: <b>קו ישר 180°</b>. <b>סיבוב שלם 360°</b>. <b>משולש 180°</b>. <b>מרובע 360°</b>.', q: gQ('כמה מעלות יש בסך הכל בשלוש הזוויות של משולש?', gDg(180), [gDg(360), gDg(90)], 'נכון. בכל משולש, גדול או קטן.') },
      { t: `במשולש שלנו ידועות שתי זוויות: ${gDg(k1)} ו-${gDg(k2)}.`, q: gQ('כמה הן ביחד?', gDg(sum), [gDg(sum + 10), gDg(180 - sum)], `${L(`${k1}° + ${k2}° = ${sum}°`)}.`) },
      { t: 'x היא מה שחסר עד 180°.', q: gQ('מה x?', gDg(x), [gDg(360 - sum), gDg(sum)], `${L(`180° − ${sum}° = ${x}°`)}. בדיקה: ${L(`${k1}° + ${k2}° + ${x}° = 180°`)}.`) },
      { t: `הפתרון בציור. בכל שאלה של זוויות: בוחרים את המספר השלם שמתאים (180° או 360°), מחברים את מה שידוע, ומחסירים.${figTri(M.A, M.B, sl, st)}` },
      gWhyStep(q),
    ]); },
  geoArea: q0 => { const q = geoGuideQ(q0, 'geoArea'), M = q.meta, A = M.b * M.h / 2;
    return geoSteps([
      { t: `<b>היקף</b> הוא הדרך מסביב, ומודדים אותו בס"מ. <b>שטח</b> הוא כמה ריבועים של 1 ס"מ על 1 ס"מ נכנסים בפנים, ומודדים אותו בסמ"ר. במלבן הזה: היקף ${L('4 + 3 + 4 + 3 = 14')} ס"מ, ושטח ${L('4 × 3 = 12')} סמ"ר.${figRect(4, 3, { grid: 1, inner: gL(12, CM2) })}`, q: gQ('באיזו יחידה מודדים שטח?', 'סמ"ר', ['ס"מ', 'מעלות'], 'נכון: ריבועים, סנטימטר רבוע.') },
      { t: `משולש הוא בדיוק <b>חצי ממלבן</b> שמקיף אותו. לכן: שטח משולש = בסיס × גובה ÷ 2.${figTriH(M.b, M.p, M.h, { rect: 1, ls: gL(M.s) })}` },
      { t: 'הגובה הוא הקו המקווקו. הוא יורד מהפינה העליונה אל הבסיס, בזווית ישרה (הריבוע הקטן). הצלע המשופעת היא לא הגובה.', q: gQ('מה הגובה במשולש שלנו?', gL(M.h), [gL(M.s), gL(M.b)], 'נכון: הקו המקווקו.') },
      { t: `הבסיס ${M.b} והגובה ${M.h}.`, q: gQ('כמה זה בסיס × גובה?', M.b * M.h, [M.b * M.s, M.b + M.h], `${L(`${M.b} × ${M.h} = ${M.b * M.h}`)}. זה השטח של כל המלבן.`) },
      { t: `ועכשיו חצי: ${L(`${M.b * M.h} ÷ 2 = ${A}`)}. השטח של המשולש: <b>${L(A)} סמ"ר</b>.${figTriH(M.b, M.p, M.h, { ls: gL(M.s), hb: 1, inner: gL(A, CM2) })}` },
      gWhyStep(q),
    ]); },
  geoCircle: q0 => { const q = geoGuideQ(q0, 'geoCircle'), M = q.meta, A = r2(3.14 * M.r * M.r);
    return geoSteps([
      { t: `<b>רדיוס</b> הולך מהמרכז עד הקצה. <b>קוטר</b> עובר מקצה לקצה דרך המרכז, והוא שני רדיוסים.${figCirc({ d: gL(M.D), r: gL(M.r), rhl: 1 })}`, q: gQ(`הקוטר ${M.D} ס"מ. מה הרדיוס?`, gL(M.r), [gL(M.D), gL(2 * M.D)], 'נכון: חצי מהקוטר.') },
      { t: 'שתי נוסחאות, ו-π ≈ 3.14 בשתיהן. <b>היקף</b>, הדרך מסביב: π × קוטר. <b>שטח</b>, מה שבפנים: π × רדיוס × רדיוס.', q: gQ('כמה גדר צריך מסביב לבריכה עגולה? מחשבים:', 'היקף', ['שטח', 'נפח'], 'נכון: הדרך מסביב.') },
      { t: `בשאלה שלנו שואלים על שטח, והנתון הוא קוטר, ${M.D}. לכן קודם הרדיוס: ${L(`${M.D} ÷ 2 = ${M.r}`)}.`, q: gQ('כמה זה רדיוס × רדיוס?', M.r * M.r, [M.D * M.D, 2 * M.r], `${L(`${M.r} × ${M.r} = ${M.r * M.r}`)}.`) },
      { t: `${L(`3.14 × ${M.r * M.r} = ${fmt(A)}`)}. השטח: <b>${L(fmt(A))} סמ"ר</b>. המלכודת הכי נפוצה: להציב את הקוטר במקום הרדיוס, ואז יוצא פי 4.${figCirc({ d: gL(M.D), r: gL(M.r), rhl: 1, fill: 1, inner: gL(fmt(A), CM2) })}` },
      gWhyStep(q),
    ]); },
  geoVolume: q0 => { const q = geoGuideQ(q0, 'geoVolume'), M = q.meta, V = M.l * M.w * M.h;
    return geoSteps([
      { t: `<b>נפח</b> הוא כמה מקום יש בתוך הגוף: כמה קוביות של 1 ס"מ על 1 ס"מ על 1 ס"מ נכנסות בו. קובייה כזאת היא 1 סמ"ק.${figBox(1, 1, 1, { lab: [gL(1), gL(1), gL(1)], H: 130 })}` },
      { t: `לא סופרים אחת אחת. מתחילים מ<b>השכבה העליונה</b> (בצהוב).${figBox(M.l, M.w, M.h, { grid: 1, hl: 'top', lab: [String(M.l), String(M.w), String(M.h)] })}`, q: gQ('כמה קוביות יש בשכבה העליונה?', M.l * M.w, [M.l + M.w, 2 * M.l * M.w], `${L(`${M.l} × ${M.w} = ${M.l * M.w}`)}: ${M.w} שורות של ${M.l}.`) },
      { t: `כל השכבות שוות, ויש ${M.h} שכבות, אחת על השנייה.`, q: gQ('כמה קוביות בכל התיבה?', V, [M.l * M.w + M.h, V - M.l * M.w], `${L(`${M.l * M.w} × ${M.h} = ${V}`)}.`) },
      { t: `זה בדיוק <b>אורך × רוחב × גובה</b>: ${L(`${M.l} × ${M.w} × ${M.h} = ${V}`)}. אם כל קובייה היא 1 ס"מ, הנפח ${L(V)} סמ"ק. ושימו לב: <b>שטח פנים</b> זה משהו אחר: כמה נייר צריך כדי לעטוף את התיבה, השטח של 6 הפאות.` },
      gWhyStep(q),
    ]); },
});

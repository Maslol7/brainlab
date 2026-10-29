const LESSONS = {
  analogy: ['אנלוגיה', 'נסח משפט שמחבר את הזוג הראשון, והצב בו את המילה השלישית.'],
  figan: ['אנלוגיה של צורות', 'מה השתנה ומה נשאר? מפעילים בדיוק את אותו שינוי.'],
  odd: ['יוצא דופן', 'מחפשים תכונה שמשותפת לכולם חוץ מאחד.'],
  sentence: ['השלמת משפט', 'מילת הקישור קובעת: סיבה, תוצאה או ניגוד.'],
  lang: ['שפה מומצאת', 'מילה שחוזרת בשני משפטים היא המילה המשותפת להם.'],
  story: ['המשך סיפור', 'המשך נכון לא סותר אף פרט ושומר על סדר הזמנים.'],
  reading: ['הבנת הנקרא', 'תשובה נכונה נשענת על משהו שכתוב בקטע.'],
  series: ['סדרות', 'הפרשים קודם. לא קבועים? הפרשי הפרשים, כפל, או שתי סדרות שזורות.'],
  table: ['טבלת מספרים', 'מוצאים חוק בשורה הראשונה ובודקים אותו על השנייה.'],
  ring: ['מעגל מספרים', 'בודקים זוגות מנוגדים, ואז שכנים.'],
  matrix: ['מטריצות', 'תכונה אחת בכל פעם: צורה, כמות, מילוי.'],
  dial: ['סדרת צורות', 'עוקבים אחרי כל חלק לבד: בכמה הוא זז בכל צעד?'],
  rotation: ['סיבוב', 'סיבוב לא הופך כמו מראה. עוקבים אחרי חלק בולט אחד.'],
  net: ['פריסת קובייה', 'פאות נגדיות לעולם לא נוגעות בפריסה.'],
  cubes: ['ספירת קוביות', 'סופרים עמודות, כולל מה שמוסתר מתחת.'],
  seating: ['סידור מקומות', 'מתחילים מהרמז החזק ביותר ומציירים כיסאות.'],
  order: ['סידור לפי גודל', 'מציירים קו ומניחים עליו שם אחרי שם.'],
  logic: ['היגיון', 'קוראים כל מילה. רוב המלכודות בניסוח.'],
  ifthen: ['אם... אז', 'בטוח רק דבר אחד: אם התוצאה לא קרתה, גם התנאי לא קרה.'],
  symbols: ['משוואות סמלים', 'מתחילים מהשורה שיש בה סמל אחד בלבד.'],
  op: ['פעולה מומצאת', 'מציבים בדיוק לפי ההגדרה. סוגריים קודם.'],
  calendar: ['ימים בשבוע', 'רק השארית מחלוקה ב-7 משנה.'],
  clock: ['זווית בשעון', 'גם מחוג השעות זז: חצי מעלה בכל דקה.'],
  average: ['ממוצע', 'ממוצע × כמות = סכום. עובדים עם סכומים.'],
  assume: ['"נניח שכולם..."', 'מניחים שכולם מהסוג הפשוט, ומחלקים את העודף.'],
  percent: ['אחוזים', 'כל אחוז מחושב מהמחיר שלפניו, לא מהמקורי.'],
  work: ['עבודה משותפת', 'מחברים את מה שכל אחד עושה בשעה אחת.'],
  ages: ['גילאים', 'בעוד k שנים, כל אחד מתבגר ב-k.'],
  speed: ['מהירות', 'לקראת: מחברים מהירויות. אחרי: מחסירים.'],
  ratio: ['יחס', 'יחס = קבוצות שוות. מוצאים כמה קבוצות יש.'],
  pairs: ['זוגות', 'כל זוג נספר פעם אחת: n × (n−1) ÷ 2.'],
  backward: ['עבודה מהסוף', 'כשיודעים מה נשאר, עובדים מהסוף להתחלה.'],
  lcm: ['כפולה משותפת', 'מתחלק בשניהם = מתחלק בכפולה המשותפת הקטנה.'],
  digits: ['ספירת ספרות', 'סופרים בקבוצות: חד-ספרתיים, דו-ספרתיים, תלת-ספרתיים.'],
  prob: ['סיכוי', 'סיכוי = אפשרויות טובות ÷ כל האפשרויות.'],
  geometry: ['היקף ושטח', 'היקף = סכום הצלעות. שטח = אורך × רוחב.'],
  money: ['עודף ומחיר', 'משלימים לשקל שלם, ואז לעשרות.'],
  unit: ['מחיר ליחידה', 'מחיר ÷ כמות. הגדול לא תמיד משתלם.'],
  rate: ['קצב', 'ממירים ליחידה אחת (לשנייה, לשעה) ואז כופלים.'],
  consec: ['מספרים עוקבים', 'האמצעי של מספרים עוקבים = הממוצע שלהם.'],
  inverse: ['יחס הפוך', 'יותר עובדים = פחות ימים. המכפלה נשארת קבועה.'],
  cycle: ['מחזוריות', 'ספרת האחדות של חזקות חוזרת במחזור.'],
  count: ['ספירה מסודרת', 'עוברים לפי סדר, כדי לא לפספס ולא לספור פעמיים.'],
  math: ['בעיה מילולית', 'כותבים מה ידוע, נותנים שם לנעלם, ובודקים בסוף.'],
};
/* the lesson key of a question: set by the generator, or read from how the question looks */
function lessonFor(q) { return q.lk || lessonByLook(q); }
function noteLesson(q) { const k = lessonFor(q); S.lessons = S.lessons || {}; const first = !S.lessons[k]; S.lessons[k] = (S.lessons[k] || 0) + 1; return { k, first }; }
function lessonsSection() {
  const got = Object.keys(S.lessons || {}).filter(k => LESSONS[k]);
  const all = Object.keys(LESSONS).length;
  return `<section><div class="sec-h"><h3>הכללים שלי</h3><span class="muted small">${got.length}/${all}</span></div>${got.length ? `<div class="card rules">${got.map(k => `<div class="rl"><b>${LESSONS[k][0]}</b><span>${LESSONS[k][1]}</span></div>`).join('')}</div>` : '<div class="card muted small">כל סוג שאלה חדש מלמד כלל אחד. הם יופיעו כאן.</div>'}</section>`;
}
LESSONS.ostory = ['סידור סיפור', 'מוצאים קודם את הפתיחה ואת הסוף. האמצע מסתדר לבד.'];
LESSONS.onum = ['סידור מספרים', 'ממירים הכל לאותה צורה, ורק אז משווים.'];
Object.assign(LESSONS, {
  magic: ['תיבת קסם', 'מנחשים חוק מהזוג הראשון, ובודקים אותו על כל הזוגות.'],
  syll: ['מסקנה בטוחה', 'רק מה שחייב להיות נכון. מה שרק "יכול להיות" לא נחשב.'],
  belief: ['היגיון מול מציאות', 'מניחים שהמשפטים נכונים, גם אם הם מוזרים. בודקים רק את ההיגיון.'],
  groups: ['חלוקה לקבוצות', 'מתחילים מרמז שקובע מקום, ואז מצמידים את מי שחייב להיות יחד.'],
  family: ['קרבת משפחה', 'מתקדמים צעד אחד בכל פעם, מהסוף של המשפט להתחלה.'],
});
Object.assign(LESSONS, {
  sentence2: ['שתי מילים חסרות', 'מילות קישור כמו "למרות", "ולכן", "אבל" מגלות את הכיוון. בודקים ששתי המילים מתאימות יחד.'],
  homonym: ['מילה אחת, שתי משמעויות', 'בודקים כל תשובה בשני המשפטים. נכונה רק זו שמתאימה לשניהם.'],
});
LESSONS.reading = ['הבנת הנקרא', 'קוראים קודם את השאלה, ואז מחפשים בקטע רק את המקום שעונה עליה.'];
function lessonByLook(q) {
  const v = q.vis || '', p = q.prompt || '';
  if (q.type === 'order') return /מהקטן/.test(p) ? 'onum' : 'ostory';
  const has = s => v.includes(s);
  if (has('class="lang"')) return 'lang';
  if (has('class="seats"')) return 'seating';
  if (has('class="story"')) return 'story';
  if (has('class="passage"')) return 'reading';
  if (has('class="fan"')) return 'figan';
  if (has('class="sseries"')) return 'dial';
  if (has('class="ntab"')) return 'table';
  if (has('class="ring"')) return 'ring';
  if (has('class="cubes"')) return 'cubes';
  if (has('class="net"')) return 'net';
  if (has('polybig')) return 'rotation';
  if (has('class="matrix"')) return 'matrix';
  if (has('class="series"')) return 'series';
  if (has('class="analogy"')) return 'analogy';
  if (has('class="sentence"')) return 'sentence';
  if (has('◆')) return 'op';
  if (has('class="eqs"')) return 'symbols';
  if (has('class="clues"')) return 'order';
  if (/לא שייך/.test(p)) return 'odd';
  if (/מחוג/.test(p)) return 'clock';
  if (/איזה יום|באיזה יום/.test(p)) return 'calendar';
  if (/^אם |אם יורד/.test(p)) return 'ifthen';
  if (q.cat === 'logic') return 'logic';
  if (q.cat === 'math' || q.cat === 'code') {
    const R0 = [[/ממוצע/, 'average'], [/רגליים|שלשות|ראשים/, 'assume'], [/%|הנחה/, 'percent'], [/ברז/, 'work'], [/פועלים/, 'inverse'], [/מבוגר|בן כמה|בת כמה/, 'ages'], [/קמ"ש/, 'speed'], [/על כל/, 'ratio'], [/משחק נגד|כל שחקן/, 'pairs'], [/נשארו/, 'backward'], [/יוצא מהתחנה|מתחלק גם|שקיות/, 'lcm'], [/ספרות בסך הכל|לספר את|למספר את/, 'digits'], [/סיכוי/, 'prob'], [/היקף|שטח/, 'geometry'], [/עודף/, 'change'], [/חבילה של/, 'unit'], [/פעימות|מטרונום/, 'rate'], [/עוקבים/, 'consec'], [/בחזקת/, 'cycle'], [/כמה מספרים|כמה מחלקים/, 'count']];
    for (const [re, k] of R0) if (re.test(p)) return k === 'change' ? 'money' : k;
    return 'math';
  }
  return q.cat === 'verbal' ? 'odd' : 'logic';
}

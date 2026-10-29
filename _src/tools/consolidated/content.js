let SEEN = {};
/* Which generator runs for each category. Each line picks a question family by chance. */
const GEN = {
  verbal: d => { const r = R(); return r < .2 ? genSC2(d) : r < .36 ? genHom(d) : R() < .15 ? genOrdStory(d) : genVerbal5(d); },
  series: genSeries5,
  matrix: genShapes,
  spatial: genSpatial2,
  math: genMath5,
  logic: d => { const r = R(); return r < .16 ? genSyll(d) : r < .30 ? genGroups(d) : r < .40 ? genFamily(d) : genLogic5(d); },
  code: genCode,
  reading: genReading,
  analog: genAnalog,
};
/* the lesson key of a question: set by the generator, or read from how the question looks */
function lessonFor(q) { return q.lk || lessonByLook(q); }
// @module 10-content/lessons.js
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

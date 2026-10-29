/* Which generator runs for each category. Each line picks a question family by chance. */
const GEN = {
  verbal: hinted(d => { const r = R(); return r < .2 ? genSC2(d) : r < .36 ? genHom(d) : R() < .15 ? genOrdStory(d) : genVerbal5(d); }),
  series: hinted(genSeries5),
  matrix: hinted(genShapes),
  spatial: hinted(genSpatial2),
  math: hinted(genMath5),
  logic: hinted(d => { const r = R(); return r < .16 ? genSyll(d) : r < .30 ? genGroups(d) : r < .40 ? genFamily(d) : genLogic5(d); }),
  code: hinted(genCode),
  reading: hinted(genReading),
  analog: hinted(genAnalog),
};
const LEVEL4 = new Set(['verbal', 'analog', 'series', 'matrix', 'logic']);

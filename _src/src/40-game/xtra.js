const XTRA_MAX = 2;
const xtraToday = () => S.xtraDay === todayStr() ? (S.xtraN || 0) : 0;
const canXtra = () => !S.guest && !isSbx() && missionToday() && xtraToday() < XTRA_MAX && S.xtraSkip !== todayStr();
function weakChapter() {
  const chs = Object.keys(CHAPNAME).map(k => ({ k, n: CHAPNAME[k], r: chapRat(S, k) }));
  return chs.sort((a, b) => a.r - b.r)[0];
}
function startXtra() {
  const w = weakChapter(), cats = Object.keys(CHAPKEY).filter(c => CHAPKEY[c] === w.k && c !== 'reading');
  const base = baseDiff(nextDay() || TOTAL);
  const mix = MIX.daily.filter(c => c !== 'reading');
  const slots = shuffle(Array.from({ length: 5 }, (_, i) => cats[i % cats.length]).concat(shuffle(mix).slice(0, 5)));
  startMission('practice', nextDay() || TOTAL, cats[0]);
  const c = S.cur; c.xtra = 1; c.intro = false;
  c.qs = slots.map(k => mkQ(k, qDiffFor(k, base), .2));
  dueMist().slice(0, 1).forEach(m => { c.qs[c.qs.length - 1] = mistQ(m); });
  c.qStart = Date.now(); save(); renderQuiz();
}

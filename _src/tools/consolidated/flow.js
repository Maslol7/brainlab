/* question categories of each mission kind (reading passages appear only every third day, see startMission) */
const MIX = {
  daily: ['verbal', 'analog', 'reading', 'series', 'matrix', 'spatial', 'math', 'math', 'logic', 'code'],
  boss: ['verbal', 'verbal', 'analog', 'analog', 'verbal', 'series', 'series', 'matrix', 'matrix', 'spatial', 'math', 'math', 'math', 'logic', 'code'],
};
const CHAPTERS = [
  { n: 'הקשר מילולי והשלמת משפטים', cats: ['verbal', 'verbal', 'verbal'] },
  { n: 'סדרות', cats: ['series'] },
  { n: 'אנלוגיות', cats: ['analog'] },
  { n: 'היגיון', cats: ['logic', 'logic', 'code'] },
  { n: 'בעיות בחשבון', cats: ['math', 'math', 'code'] },
  { n: 'צורות', cats: ['matrix', 'matrix', 'spatial'] },
];
function startMission(kind, day, cat, size, path) {
  ac();
  day = day || nextDay() || TOTAL;
  const base = baseDiff(day), hard = c => Math.max(qDiffFor(c, base), Math.min(3, base));
  let qs, chapters = null, mod = null;
  if (kind === 'review') { const pool = (dueMist().length ? dueMist() : S.mist).slice(0, 8); qs = pool.map(mistQ); }
  else if (kind === 'sim') {
    const per = size === 'full' ? 12 : 6; qs = []; chapters = [];
    CHAPTERS.forEach(ch => { const s = qs.length; for (let j = 0; j < per; j++) { const c = ch.cats[j % ch.cats.length]; qs.push(mkQ(c, hard(c), .35)); } chapters.push({ n: ch.n, s, e: qs.length - 1, mins: per }); });
  } else {
    const slots = kind === 'practice' ? Array(6).fill(cat) : MIX[kind].slice();
    if (kind === 'daily') {
      mod = modFor(day); const w = weakest();
      if (mod === 'focus') [1, 3, 6, 8, 9].forEach(i => slots[i] = w);
      else slots[slots.lastIndexOf(R() < .5 ? 'verbal' : 'math')] = w;
      if (mod === 'logic') { slots[6] = 'logic'; slots[9] = 'logic'; slots[0] = R() < .5 ? 'verbal' : 'logic'; }
      if (mod === 'shapes') { slots[0] = 'matrix'; slots[7] = 'analog'; slots[9] = 'matrix'; }
    }
    const tp = kind === 'boss' ? .3 : mod === 'typed' ? 1 : .2;
    qs = shuffle(slots).map(c => mkQ(c, kind === 'boss' ? hard(c) : qDiffFor(c, base), tp));
    if (kind === 'daily') dueMist().slice(0, 2).forEach((m, j) => { qs[qs.length - 1 - j * 3] = mistQ(m); });
    /* long reading passages are tiring: only every third day */
    if (kind === 'daily' && day % 3 !== 0) qs = qs.map(q => q.cat === 'reading' && !q.rev ? mkQ('verbal', q.d, .2) : q);
  }
  S.cur = { kind, day, cat: cat || null, qs, i: 0, res: [], pts: 0, combo: 0, hint: false, qStart: Date.now(), deadline: null, hp: 5, mod, size,
    path: !!path, intro: kind === 'daily' || kind === 'sim' || kind === 'boss', chapters, ch: 0, chDeadline: null, chBreak: false, tin: '' };
  /* the morning after a calm-down, the mission starts in think mode */
  if (kind === 'daily' && S.calmNext) { S.cur.think = true; S.calmNext = 0; }
  go('quiz');
}
function endChapter() { const c = S.cur; if (!c) return; clearTimers(); if (!c.chapters || c.ch >= c.chapters.length - 1) return finish(); c.chBreak = true; save(); renderQuiz(); window.scrollTo(0, 0); }
/* One answer. Order: think-mode nudge, first wrong try (retry with hint), then the final record with points. */
function answer(i, val) {
  const c = S.cur; if (!c) return;
  const q = c.qs[c.i];
  if ((c.res[c.i] && !deferred(c.kind)) || c.lock) return;
  const secs = (Date.now() - c.qStart) / 1000, retrying = !!(c.tried && c.tried.i === c.i);
  const rushed = secs < (deferred(c.kind) ? Math.min(minSecs(q), 3) : minSecs(q));
  if (deferred(c.kind) && secs < 2 && !q.champ && c.nudged !== c.i) { c.nudged = c.i; showNudge(secs); return; }
  if (rushed && !deferred(c.kind) && !q.champ && !c.duo && c.nudged !== c.i && !retrying) { c.nudged = c.i; logRush(1); c.rushLogged = c.i; showNudge(secs); return; }
  const noRetry = rushed && !retrying, first = !retrying;
  if (deferred(c.kind)) c.lock = true;
  const typed = q.type === 'num';
  const ok = q.type === 'order' ? JSON.stringify(val) === JSON.stringify(q.correct) : typed ? Math.abs(parseFloat(val) - q.ansv) < .001 : i === q.answer;
  const logOnce = () => { if (c.rushLogged !== c.i) { logRush(rushed); c.rushLogged = c.i; } };
  /* first wrong try: no answer yet, the hint opens and the wrong option is greyed out */
  if (!ok && first && !deferred(c.kind) && !q.champ && !noRetry) {
    c.tried = { i: c.i, sel: typed || q.type === 'order' ? -1 : i, val: q.type === 'order' ? val : typed ? String(val) : undefined };
    c.combo = 0; rateQ(q, false, secs, c); noteMist(q, false, c, true);
    logOnce();
    c.tin = ''; c.ord = []; SFX.soft(); save(); renderQuiz();
    setTimeout(() => { const f = app.querySelector('.retry'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250);
    return;
  }
  let gain = 0;
  if (ok && !rushed) c.combo++; else c.combo = 0;
  if (ok) {
    gain = { 1: 10, 2: 15, 3: 20, 4: 25 }[q.d] || 10;
    if (typed) gain = Math.round(gain * (c.mod === 'typed' ? 2 : 1.3));
    if (c.kind === 'daily' && c.day >= 15 && secs < 45) gain += 5;
    if (c.mod === 'blitz' && secs <= 60) gain = Math.round(gain * 1.5);
    if (c.mod === 'nohint') gain = Math.round(gain * 1.5);
    if (!deferred(c.kind) && c.combo && c.combo % 3 === 0) gain += 10;
    if (c.hint && !c.freeHint) gain = Math.max(0, gain - 3);
    if (deferred(c.kind)) gain = Math.round(gain * 1.5);
    if (c.kind === 'practice' || c.kind === 'review') gain = Math.round(gain / 2);
    if (!first) gain = Math.round(gain / 2);
  }
  const prev = c.res[c.i]; if (prev) c.pts -= prev.gain;
  const r = c.res[c.i] = { sel: typed || q.type === 'order' ? -1 : i, val: q.type === 'order' ? val : typed ? String(val) : undefined, ok, gain, secs, second: !first, sel1: first ? null : c.tried.sel, rush: rushed };
  if (!prev) r.newRule = noteLesson(q).first;
  if (!prev && first) { const r0 = S.rat[q.cat]; if (!rushed) rateQ(q, ok, secs, c); r.praise = praiseFor(q, ok, secs, c, r0); }
  if (!prev) r.love = loveOnStreak(c, ok, first);
  noteMist(q, ok, c, first, noRetry);
  logOnce();
  if (!deferred(c.kind)) {
    if (r.ok && !r.praise && c.nudged === c.i && !rushed) r.praise = 'עצרת, קראת, וזה עבד. ככה פותרים.';
    if (rushed) { c.rushN = (c.rushN || 0) + 1; c.rushRun = (c.rushRun || 0) + 1; } else c.rushRun = 0;
    /* "I have the answer in my head" before the options opened */
    if (r.ok && first && c.commit === c.i && !r.praise) { r.praise = 'פתרת בראש לפני שהסתכלת, ופגעת.'; r.gain += 3; }
    /* flow: four easy ones in a row offer a harder boost, a wrong or rushed run offers a short break */
    const easy = r.ok && first && !rushed && secs < minSecs(q) * 3 && q.d <= Math.round(S.rat[q.cat] ?? 1);
    c.easyRun = easy ? (c.easyRun || 0) + 1 : 0;
    const left = c.qs.length - 1 - c.i;
    if (!c.breakOffered && ((c.wrongRun || 0) >= 3 || c.rushRun >= 2) && left >= 1) c.offer = 'break';
    else if (!c.boostOffered && c.easyRun >= 4 && left >= 3 && !c.duo) c.offer = 'boost';
  }
  if (c.xtra && r.gain > 0) r.gain *= 2;
  c.pts += r.gain;
  c.tin = ''; c.ord = [];
  const btn = typed ? document.getElementById('tin') : app.querySelector(`[data-opt="${i}"]`);
  if (deferred(c.kind)) {
    if (c.kind === 'boss') { if (ok) { SFX.hit(); document.getElementById('bossF')?.classList.add('hit'); floatPts(btn, '+' + r.gain); } else { c.hp = Math.max(0, c.hp - 1); SFX.no(); document.getElementById('meF')?.classList.add('hit'); } }
    else SFX.tap();
    save();
    if (!typed) document.querySelectorAll('.opt').forEach((b, k) => b.classList.toggle('sel', k === i));
    const to = nextOpen(c);
    later(() => { if (to < 0) return c.chapters ? endChapter() : finish(); c.i = to; c.qStart = Date.now(); save(); renderQuiz(); window.scrollTo(0, 0); }, c.kind === 'boss' ? 650 : 250);
    return;
  }
  save(); renderQuiz();
  setTimeout(() => { const f = app.querySelector('.fb'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 350);
  const nb = typed ? app.querySelector('.typed-res') : app.querySelector(`[data-opt="${i}"]`);
  if (ok) { (c.combo >= 3 && c.combo % 3 === 0 ? SFX.combo : SFX.ok)(); floatPts(nb, '+' + r.gain); if (c.combo >= 3 && c.combo % 3 === 0) burst(40); }
  else SFX.no();
}
function nextQ() {
  const c = S.cur;
  if (c.offer && !deferred(c.kind) && c.i < c.qs.length - 1) { const o = c.offer; c.offer = null; if (o === 'break') c.breakOffered = 1; else c.boostOffered = 1; save(); return renderOffer(o); }
  if (c.i >= c.qs.length - 1) {
    if (c.kind === 'daily' && !c.champOffered) { c.champOffered = true; c.champ = 'offer'; save(); renderQuiz(); window.scrollTo(0, 0); return; }
    return finish();
  }
  c.i++; c.hint = false; c.freeHint = false; c.ord = []; c.tried = null; c.qStart = Date.now(); save(); renderQuiz(); window.scrollTo(0, 0);
}
/* End of a mission: record it, give points, diamonds and unlocks, then show the result screen once. */
function finish() {
  const c = S.cur; if (!c) return;
  clearTimers();
  const t = todayStr(), counts = c.kind === 'daily' || c.kind === 'boss' || (c.kind === 'sim' && c.path);
  const newDay = counts && !S.missions[c.day];
  const songsBefore = songsOpen(), rushWas = rushRate() > .2;
  const explainQ = c.kind === 'daily' && (!S.explainQ || S.explainQ.d !== t) ? pickExplain(c) : null;
  const extraDay = ['sim', 'practice', 'review'].includes(c.kind) && !c.path && c.res.filter(Boolean).length >= 6;
  let n = 0, correct = 0, champOk = null;
  c.qs.forEach((q, i) => {
    const r = c.res[i], good = !!(r && r.ok && !r.second);
    if (!(r && r.rush)) { const s = S.stats[q.cat] || (S.stats[q.cat] = { c: 0, t: 0 }); s.t++; if (good) s.c++; }
    if (q.champ) { champOk = good; return; }
    n++; if (good) correct++;
  });
  const chapters = c.chapters ? c.chapters.map(ch => { let k = 0; for (let j = ch.s; j <= ch.e; j++) if (c.res[j] && c.res[j].ok) k++; return { n: ch.n, c: k, t: ch.e - ch.s + 1 }; }) : null;
  const before = S.badges.slice(), rankBefore = rankOf(S.xp).r[1], gearBefore = Object.keys(gearOn()), worldBefore = curWorld().k;
  if (c.kind === 'review') S.reviewDay = t;
  if (counts) { S.missions[c.day] = { c: correct, n, pts: c.pts, date: t }; if (newDay) S.missions[c.day].h = new Date().getHours(); }
  if (counts || extraDay) bumpStreak(t);
  const coins = Math.round(c.pts / 4);
  S.xp += c.pts; S.coins += coins;
  checkBadges();
  const dia = awardDiamonds(c, correct, n), joke = unlockJoke(c, correct, n);
  if (champOk) giveDia(1, 'שאלת האלוף', dia);
  const won = c.kind === 'boss' ? correct / n >= .7 : null;
  const newGear = GEAR.filter(g => gearOn()[g.id] && !gearBefore.includes(g.id)).map(g => g.n);
  const L0 = S.last = { dia, joke, champOk, chapters, size: c.size, mod: c.mod, kind: c.kind, day: c.day, cat: c.cat, correct, n, pts: c.pts, coins, won, chest: counts || c.kind === 'sim' ? 0 : -1, newB: S.badges.filter(b => !before.includes(b)), newGear, newWorld: curWorld().k !== worldBefore ? curWorld().n : null, rankUp: rankOf(S.xp).r[1] !== rankBefore ? rankOf(S.xp).r[1] : null,
    review: c.qs.map((q, i) => ({ lk: lessonFor(q), q: q.prompt, cat: q.cat, ok: !!(c.res[i] && c.res[i].ok), a: q.type === 'order' ? q.correct.map(ix => q.items[ix].replace(/<[^>]+>/g, '')).join(' ← ') : q.type === 'num' ? L(fmt(q.ansv)) + (q.unit || '') : q.options[q.answer], ex: q.ex })).filter(x => deferred(c.kind) || !x.ok) };
  L0.imp = improveNotes(c, correct, n); L0.love = loveLine(c, correct, n); L0.rushN = c.rushN || 0;
  if (explainQ) S.explainQ = explainQ;
  if (c.duo) {
    L0.duo = 1; S.duoWeek = weekKey(); S.duoLog = (S.duoLog || []).concat(t).slice(-12);
    if (c.res.filter(r => r && r.ok && !r.second).length >= 2) giveDia(1, 'אתגר עם אבא', dia);
  }
  if (c.xtra) {
    if (S.xtraDay !== t) { S.xtraDay = t; S.xtraN = 0; } S.xtraN++;
    S.xtraLog = (S.xtraLog || []).concat(t).slice(-40); L0.xtra = 1;
    if (n && correct / n >= .9 && S.xtraDia !== t) { S.xtraDia = t; giveDia(1, 'משימת בונוס', dia); }
  }
  if (!S.guest) { const got = checkRoad(); if (got) L0.road = got.n; }
  /* streak milestones, also when the streak grew through a simulation or practice */
  const aw = S.aw || (S.aw = {}), ms7 = Math.floor((S.streak || 0) / 7) * 7;
  if (ms7 >= 7 && (aw.streak || 0) < ms7) { aw.streak = ms7; giveDia(2, `רצף של ${ms7} ימים`, dia); }
  const songsNow = Math.min(SONGS.length, songsOpenFor(doneCount(S)) + (S.songBuy || 0));
  if (songsNow > songsBefore) L0.newSong = SONGS[songsNow - 1].id;
  S.cur = null; S.openW = null; go('result');
  const st = starsOf(correct, n);
  if (won || st >= 2) { SFX.win(); later(() => burst(st === 3 || won ? 160 : 80), 250); }
  if (!deferred(c.kind) && rushWas && rushRate() <= .2 && (S.rh || []).length >= 8) toast('יצאת ממצב חשיבה! ענית בקצב של מי שקורא וחושב.', 4000);
}
// @module 40-game/progress.js
function bumpStreak(t) {
  if (S.lastDone !== t) {
    const g = S.lastDone ? dayDiff(S.lastDone, t) : 99;
    if (g === 1) S.streak++;
    else if (g > 1 && g < 99 && S.freezes >= g - 1) { S.freezes -= g - 1; S.streak++; }
    else S.streak = 1;
    S.lastDone = t;
  }
  S.best = Math.max(S.best, S.streak);
}
// @module 99-main/main.js
/* old saves: a song unlock that was waiting for the result screen */
if (S.pendingSong) { if (S.last) S.last.newSong = S.pendingSong; delete S.pendingSong; }

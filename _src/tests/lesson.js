// Guessing or getting stuck on one kind of question puts it on the "to learn" list; the lesson teaches it and fades the help.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const html = require('fs').readFileSync(process.argv[2] || 'dist/index.html', 'utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200);
  const out = {};
  // two guesses and one long stuck answer on calendar questions, all wrong
  out.flag = await p.evaluate(() => { S.rh = Array(10).fill(0); startMission('practice', 1, 'code'); const c = S.cur; c.intro = false; const got = [];
    for (let k = 0; k < 4; k++) { c.i = k; c.qs[k] = genCal(1); c.tried = null; const q = c.qs[k], wrong = (q.answer + 1) % q.options.length; c.qStart = Date.now() - (k === 1 ? 200000 : 1000); c.nudged = c.i; answer(wrong); if (!c.res[k]) { c.qStart -= 1000; answer((q.answer + 2) % q.options.length); } got.push(c.res[k] && c.res[k].learnQ || null); }
    return { got, q: S.learnQ, r: S.lk.calendar.r, note: !!document.querySelector('.learnnote') }; });
  await p.screenshot({ path: '/tmp/claude-0/img/learn_note.png' });
  await p.evaluate(() => { finish(); });
  out.resultCard = await p.evaluate(() => !!document.querySelector('[data-learn="calendar"]'));
  await p.screenshot({ path: '/tmp/claude-0/img/learn_result.png', fullPage: true });
  await p.evaluate(() => { S.missions[1] = { c: 7, n: 10, pts: 100, date: todayStr() }; go('home'); }); out.homeCard = await p.evaluate(() => !!document.querySelector('.learncard [data-learn]'));
  console.log(JSON.stringify(out)); await p.click('[data-learn="calendar"]'); await p.waitForTimeout(150);
  out.intro = await p.evaluate(() => [S.cur.kind, S.cur.guide, document.querySelector('.intro-card h2').textContent]);
  await p.screenshot({ path: '/tmp/claude-0/img/learn_intro.png' });
  await p.click('[data-act="go"]'); await p.waitForTimeout(450);
  out.guideShown = await p.evaluate(() => !!document.querySelector('.card.guide'));
  // finish the guide
  for (let k = 0; k < 12 && await p.$('[data-g="next"]'); k++) { await p.click('[data-g="next"]'); await p.waitForTimeout(60); }
  await p.click('[data-g="done"]'); await p.waitForTimeout(450);
  out.afterGuide = await p.evaluate(() => [S.view, S.cur.i, S.cur.hint, S.cur.freeHint, !!document.querySelector('.hintbox')]);
  await p.screenshot({ path: '/tmp/claude-0/img/learn_q1.png' });
  out.done = await p.evaluate(async () => { const c = S.cur; const w = ms => new Promise(r => setTimeout(r, ms));
    for (let k = c.i; k < c.qs.length; k++) { c.i = k; c.qStart = Date.now() - 60000; const q = c.qs[k]; if (q.type === 'num') answer(-1, q.ansv); else answer(q.answer); await w(450); if (k < c.qs.length - 1) { nextQ(); await w(450); } }
    nextQ(); await w(200); return { view: S.view, lesson: S.last.lesson, q: S.learnQ, learned: S.lk.calendar.learned, coins: S.coins }; });
  await p.screenshot({ path: '/tmp/claude-0/img/learn_done.png' });
  // a lesson with a worked example (no step-by-step guide for this type)
  out.demo = await p.evaluate(() => { S.lk.average = { r: 'ggo', cat: 'math', learned: null }; S.learnQ = [{ key: 'average', at: todayStr(), why: 'gg' }]; S.cur = null; startLesson('average'); const c = S.cur; c.intro = false; renderQuiz(); return [c.guide, !!c.qs[0].demo, !!document.querySelector('.fb.demo'), document.querySelector('[data-act="next"]').textContent]; });
  await p.screenshot({ path: '/tmp/claude-0/img/learn_demo.png' });
  await p.evaluate(() => { S.pin = '1234'; PARENT_OK = true; S.cur = null; go('parent'); }); out.report = await p.evaluate(() => (document.querySelector('.report') || {}).textContent.match(/סוגי שאלות[^·]*|למד בשיעור[^\n]*/g));
  console.log(JSON.stringify(out, null, 1)); console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();

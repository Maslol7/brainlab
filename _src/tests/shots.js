// Screenshots of the main screens with a realistic mid-journey state: node tests/shots.js [html] [outdir]
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const args = process.argv.slice(2); const html = fs.readFileSync(args[0] || 'dist/index.html', 'utf8'), out = args[1] || '/tmp/claude-0/img/vis';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(300);
  await p.evaluate(() => { const t = todayStr(); S.start = addDays(t, -10); for (let k = 1; k <= 9; k++) S.missions[k] = { c: 6 + (k % 4), n: 10, pts: 120, date: addDays(t, k - 10) }; S.xp = 1450; S.coins = 230; S.dia = 4; S.streak = 3; S.best = 5; S.lastDone = addDays(t, -1); S.diaHelpSeen = 1; S.rh = Array(10).fill(0); save(); go('home'); });
  await p.waitForTimeout(400); await p.screenshot({ path: out + '/home.png' });
  await p.evaluate(() => document.querySelector('.pn.now').scrollIntoView({ block: 'center' })); await p.waitForTimeout(200); await p.screenshot({ path: out + '/journey.png' });
  await p.evaluate(() => { startMission('daily', 10); S.cur.intro = false; const c = S.cur; c.qs[0] = genSeries(2); c.qStart = Date.now() - 60000; c.think = false; renderQuiz(); window.scrollTo(0, 0); });
  await p.waitForTimeout(300); await p.screenshot({ path: out + '/quiz.png' });
  await p.evaluate(() => { const c = S.cur; c.hint = true; renderQuiz(); }); await p.waitForTimeout(200); await p.screenshot({ path: out + '/hint.png' });
  await p.evaluate(() => { const c = S.cur, q = c.qs[0]; answer((q.answer + 1) % q.options.length); }); await p.waitForTimeout(500); await p.screenshot({ path: out + '/retry.png' });
  await p.evaluate(() => { const c = S.cur, q = c.qs[0]; answer(q.answer); }); await p.waitForTimeout(700); await p.screenshot({ path: out + '/feedback.png', fullPage: true });
  await p.evaluate(() => { const c = S.cur; c.i = 1; c.qs[1] = genMatrix(2); c.qStart = Date.now() - 60000; c.hint = false; c.tried = null; renderQuiz(); window.scrollTo(0, 0); }); await p.waitForTimeout(300); await p.screenshot({ path: out + '/quiz2.png' });
  console.log(errs.length ? errs : 'ok'); await b.close(); })();

// Screenshots of סלטה on an iPhone-sized screen, and a check that no screen throws: node romi/tests/shots.js [url] [outdir]
const { chromium, devices } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:8811/romi/', out = process.argv[3] || '/tmp/claude-0/img/s';
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const shot = async n => { await p.waitForTimeout(350); await p.screenshot({ path: `${out}/${n}.png` }); };
  await p.goto(url); await p.waitForTimeout(900);
  await shot('00-welcome');
  await p.evaluate(() => document.querySelector('.modal [data-mi]').click());
  await p.evaluate(() => { S.days[addDays(todayStr(), -1)] = 3; S.candy = 37; save(); render(); });
  await shot('01-home');
  await p.screenshot({ path: `${out}/01-home-full.png`, fullPage: true });
  // practice: walk through every step type
  await p.evaluate(() => startPractice(curList())); await shot('10-learn');
  const types = ['meanEN', 'meanHE', 'pick', 'tiles', 'typeEN', 'typeHE2EN', 'writeHE'];
  for (const t of types) {
    await p.evaluate(t => { const c = P.cur; c.type = t; delete c.opts; delete c.tiles; const w = c.w;
      if (t === 'pick') c.opts = shuffle([w.en.toLowerCase(), ...misspell(w.en)]); if (t === 'meanEN' || t === 'meanHE') c.opts = shuffle([w, ...others(w, P.list, 3)]); if (t === 'tiles') c.tiles = makeTiles(w.en, 2); render(); }, t);
    await shot('11-' + t);
  }
  // a wrong typed answer, then the copy step
  await p.evaluate(() => { const c = P.cur; c.type = 'typeEN'; render(); KB.val = 'naibor'; kbRefresh(); kbPress('enter'); });
  await p.waitForTimeout(700); await shot('12-wrong');
  // a right one
  await p.evaluate(() => { KB.val = P.cur.w.en.toLowerCase(); kbPress('enter'); }); await p.waitForTimeout(300); await shot('13-copy-ok');
  // run the engine to the end with right answers
  await p.evaluate(() => { let g = 0; while (P && g++ < 60) { const c = P.cur; if (c.type === 'learn') { grade(c.w, P.list, 'learn', true); P.q.push(P.q.shift()); P.done += .5; nextItem(); continue; } grade(c.w, P.list, c.type, true); P.cur.failed = false; advance(true); } });
  await shot('14-done');
  await p.screenshot({ path: `${out}/14-done-full.png`, fullPage: true });
  // mock dictation
  await p.evaluate(() => startTest(curList())); await shot('20-test');
  await p.evaluate(() => { for (let g = 0; g < 30 && T; g++) { const it = T.items[T.i]; KB.val = T.step === 'he' ? (T.i % 3 ? it.w.he[0] : 'שכנ') : (T.i === 2 ? 'mountin' : it.w.en.toLowerCase()); kbPress('enter'); } });
  await p.waitForTimeout(400); await p.screenshot({ path: `${out}/21-test-result.png`, fullPage: true });
  // games
  for (const g of ['tramp', 'memory', 'rain', 'teach', 'duel']) { await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.remove()); go('home'); }); await p.evaluate(g => startGame(g), g); await p.waitForTimeout(900); await shot('30-' + g); }
  await p.evaluate(() => { const t = G.ws ? 0 : 0; G.ph = 'play'; render(); }); await shot('31-duel-play');
  await p.evaluate(() => { startGame('tramp'); const w = G.ws[0].en.toLowerCase(); for (const c of w) { const i = G.tiles.findIndex((x, j) => x === c && !KB.used.includes(j)); document.querySelector(`[data-ti="${i}"]`).click(); } });
  await p.waitForTimeout(500); await shot('32-tramp-flip');
  await p.evaluate(() => { startGame('teach'); G.ph = 'check'; render(); }); await shot('33-teach-check');
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.remove()); startGame('memory'); G.open = [0]; render(); }); await shot('34-memory-open');
  // shop, lists, parent
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.remove()); G = null; go('shop'); }); await shot('40-shop');
  await p.evaluate(() => go('lists')); await shot('41-lists');
  await p.evaluate(() => { PARENT_OK = true; go('parent'); });
  await p.evaluate(() => { const d = document.querySelector('.newlist details'); if (d) d.open = true; });
  await p.fill('#paste', `הורים יקרים, שלום רב!\nביום רביעי הבא, 25.11.2026, תתקיים הכתבה באנגלית.\n1. Window – חלון 🪟\n2. Yellow – צהוב 💛\n3. Ice cream - גלידה 🍦\n4. Kitchen – מטבח / המטבח\nמאחלת הצלחה! ❤️`);
  await p.evaluate(() => document.querySelector('[data-act="parse"]').click()); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/50-parent.png`, fullPage: true });
  const draft = await p.evaluate(() => JSON.stringify(DRAFT)); console.log('draft', draft);
  await p.evaluate(() => document.querySelector('[data-act="savelist"]').click()); await p.waitForTimeout(300);
  console.log('lists', await p.evaluate(() => S.lists.map(l => l.t + ' ' + l.date + ' ' + l.words.length).join(' | ')), 'cur', await p.evaluate(() => curList().t));
  await p.evaluate(() => { const m = document.querySelector('.modal'); if (m) m.remove(); go('home'); }); await shot('51-home-after');
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs) : 'no errors'); await b.close();
})();

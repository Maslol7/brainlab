// Penalty mini-game: 5 kicks by swipe and tap, then the result and the way back to the boss fight.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const html = require('fs').readFileSync(process.argv[2] || 'dist/index.html', 'utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200);
  const day = await p.evaluate(() => { const order = Object.keys(BOSSES).map(Number).sort((a, b) => a - b); return order[1]; });
  await p.evaluate(d => { startMission('boss', d); const c = S.cur; c.intro = false; c.res = c.qs.map((q, i) => i < 8 ? { ok: true, gain: 10, secs: 20 } : null); c.i = 8; renderQuiz(); }, day);
  const box = await (await p.$('#bgc')).boundingBox(); const title = await p.textContent('.bghead b');
  await p.waitForTimeout(300); await p.screenshot({ path: '/tmp/claude-0/img/goal0.png' });
  const kicks = [[.17, .15], [.83, .2], [.5, .3], [.2, .18], [.8, .14]];
  for (let i = 0; i < 5; i++) {
    const sx = box.x + box.width / 2, sy = box.y + box.height * .84;
    if (i % 2 === 0) { await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(box.x + box.width * kicks[i][0], box.y + box.height * kicks[i][1], { steps: 5 }); await p.mouse.up(); }
    else await p.mouse.click(box.x + box.width * kicks[i][0], box.y + box.height * kicks[i][1]);
    await p.waitForTimeout(i === 0 ? 350 : 100); if (i === 0) await p.screenshot({ path: '/tmp/claude-0/img/goal1.png' });
    await p.waitForTimeout(1700);
  }
  await p.waitForTimeout(500);
  const end = await p.textContent('#bgend'); await p.screenshot({ path: '/tmp/claude-0/img/goal2.png' });
  const pts0 = await p.evaluate(() => S.cur.pts); await p.click('[data-mg="back"]'); await p.waitForTimeout(100);
  const back = await p.evaluate(() => [S.view, !!document.querySelector('.qprompt'), S.cur.mg, S.cur.pts]);
  console.log(JSON.stringify({ title, end, pts0, back })); console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();

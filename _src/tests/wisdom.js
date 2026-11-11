// The thought corner: shows after the day's mission at most every few days, takes turns between kinds, and dad's report lists social answers.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${fs.readFileSync(process.argv[2] || 'dist/index.html', 'utf8')}</body></html>`); await p.waitForTimeout(2600);
  const shots = process.env.SHOTS, out = {};
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.remove()); for (let i = 1; i <= 5; i++) S.missions[i] = { c: 7, n: 10, pts: 100, date: addDays(todayStr(), i - 6) }; S.missions[6] = { c: 8, n: 10, pts: 120, date: todayStr() }; S.lastDone = todayStr(); S.wis = null; go('home'); });
  await p.waitForTimeout(300);
  out.first = await p.evaluate(() => { const c = document.querySelector('.wis'); return c && c.querySelector('.wis-kind').textContent; });
  if (shots) { const c = await p.$('.wis'); if (c) await c.scrollIntoViewIfNeeded(); await p.screenshot({ path: shots + '/wis_home.png' }); }
  await p.click('[data-wisok]'); await p.waitForTimeout(150);
  out.afterOk = await p.evaluate(() => ({ card: !!document.querySelector('.wis'), last: S.wis.last, seen: S.wis.seen.length }));
  out.tooSoon = await p.evaluate(() => { S.wis.last = addDays(todayStr(), -1); render(); return !!document.querySelector('.wis'); });
  await p.evaluate(() => { S.wis.last = addDays(todayStr(), -3); S.wis.today = null; render(); }); await p.waitForTimeout(150);
  out.second = await p.evaluate(() => document.querySelector('.wis .wis-kind').textContent);
  await p.click('[data-wis="1"]'); await p.waitForTimeout(150);
  out.reply = await p.evaluate(() => !!document.querySelector('.wis-reply'));
  if (shots) { const c = await p.$('.wis'); await c.screenshot({ path: shots + '/wis_social.png' }); }
  await p.click('[data-wisok]'); await p.waitForTimeout(150);
  out.report = await p.evaluate(() => wisLine(S).replace(/<[^>]+>/g, ' ').slice(0, 120));
  out.noMission = await p.evaluate(() => { S.wis.last = addDays(todayStr(), -5); S.wis.today = null; S.lastDone = addDays(todayStr(), -1); render(); return !!document.querySelector('.wis'); });
  out.count = await p.evaluate(() => ({ n: WIS.length, kinds: [...new Set(WIS.map(w => w.k))].length, dashes: WIS.some(w => /—|–/.test(JSON.stringify(w))) }));
  console.log(JSON.stringify(out, null, 1));
  const ok = out.first === 'עובדה מעניינת' && !out.afterOk.card && out.afterOk.seen === 1 && !out.tooSoon && out.second === 'מה היית עושה?' && out.reply && /פינת מחשבה/.test(out.report) && !out.noMission && out.count.kinds === 4 && !out.count.dashes && !errs.length;
  console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no errors'); console.log(ok ? 'PASS' : 'FAIL'); await b.close(); process.exit(ok ? 0 : 1); })();

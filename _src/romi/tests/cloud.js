// סלטה cloud: dad's phone writes the parent node, Romi's phone applies it. Firebase is faked with page.route. node romi/tests/cloud.js [url]
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:8811/romi/', DB = {}, errs = [];
  const b = await chromium.launch();
  const mk = async () => { const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route('https://fake-db.firebaseio.com/**', async r => { const k = decodeURIComponent(new URL(r.request().url()).pathname), m = r.request().method();
      if (m === 'PUT') { DB[k] = JSON.parse(r.request().postData()); return r.fulfill({ status: 200, body: '{}' }); }
      if (m === 'DELETE') { delete DB[k]; return r.fulfill({ status: 200, body: 'null' }); }
      let v = DB[k]; if (v == null && k.endsWith('.json')) { const pre = k.slice(0, -5) + '/', o = {}; for (const [kk, vv] of Object.entries(DB)) if (kk.startsWith(pre)) o[kk.slice(pre.length, -5)] = vv; if (Object.keys(o).length) v = o; }
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(v ?? null) }); });
    await p.goto(url); await p.waitForTimeout(500); await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.remove())); return p; };
  const ok = (c, m) => { if (!c) errs.push('FAIL ' + m); };
  const kid = await mk(), dad = await mk(), code = 'abcdefghjkmnpqr';
  await kid.evaluate(c => { cloudSet({ url: 'https://fake-db.firebaseio.com', code: c, role: 'kid' }); S.sessions = 3; S.p.road = { st: 4, ok: 4, bad: 2, wr: ['rod'] }; save(); return cloudPut(); }, code);
  ok(DB[`/brainlab/${code}.json`] && DB[`/brainlab/${code}.json`]._app === 'salta' && !DB[`/brainlab/${code}.json`].pin, 'kid state in the cloud, no PIN');
  await dad.evaluate(c => { cloudSet({ url: 'https://fake-db.firebaseio.com', code: c, role: 'dad' }); return dadLoad(); }, code);
  ok(await dad.evaluate(() => RKID && RKID.sessions === 3), 'dad reads Romi\'s progress');
  await dad.evaluate(async () => { await upsertList({ id: 'c-x', t: 'הכתבה 2.12', date: '2026-12-02', src: 'class', he: true, words: [{ en: 'Window', he: ['חלון'], em: '🪟' }] }); PDOC.note = { id: 1, t: 'כל הכבוד רומי' }; PDOC.gift = { id: 2, n: 10 }; PDOC.dadMsgs = ['אבא אוהב'], PDOC.mv = 5; await pPut(cloudCfg(), PDOC); });
  await kid.evaluate(() => kidPull(true)); await kid.waitForTimeout(300);
  ok(await kid.evaluate(() => S.lists.some(l => l.id === 'c-x') && S.dadNote === 'כל הכבוד רומי' && S.candy === 10 && S.dadMsgs[0] === 'אבא אוהב'), 'kid applies list, note, candies, messages');
  await kid.evaluate(() => { PULL_AT = 0; return kidPull(true); });
  ok(await kid.evaluate(() => S.candy === 10 && S.lists.filter(l => l.id === 'c-x').length === 1), 'applying twice changes nothing');
  await dad.evaluate(() => removeList('c-x')); await kid.evaluate(() => kidPull(true));
  ok(await kid.evaluate(() => !S.lists.some(l => l.id === 'c-x')), 'dad deletes a list');
  // dad records a word: it reaches Romi's phone
  await dad.evaluate(async () => { VOICE['ice cream'] = 'data:audio/mp4;base64,AAAA'; await voicePush('ice cream'); });
  await kid.evaluate(() => { PULL_AT = 0; return kidPull(true); }); await kid.waitForTimeout(400);
  ok(await kid.evaluate(() => VOICE['ice cream'] === 'data:audio/mp4;base64,AAAA'), 'dad voice reaches Romi');
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs) : 'ALL OK'); await b.close(); process.exit(errs.length ? 1 : 0);
})();

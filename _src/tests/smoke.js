// Load the built page, walk every main screen and a full daily mission; fail on any page error.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await b.newPage({ viewport: { width: 380, height: 800 } });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const html = fs.readFileSync(process.argv[2] || 'dist/index.html', 'utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  await p.waitForTimeout(300); if (errs.length) { console.log('LOAD ERRORS\n' + errs.join('\n')); process.exit(1); }
  const r = await p.evaluate(async () => {
    const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
    for (const v of ['home', 'arcade', 'shop', 'stats', 'me', 'tips', 'parent']) { go(v); await w(20); out[v] = app.innerHTML.length; }
    S.ptab = 'data'; go('stats'); await w(20); S.ptab = 'me'; go('stats'); await w(20); S.ptab = 'tips'; go('stats'); await w(20);
    S.view = 'songs'; render(); await w(20); out.songs = app.innerHTML.length;
    go('home'); startMission('daily', 1); S.cur.intro = false;
    for (let k = 0; k < 40 && S.cur; k++) {
      const c = S.cur; c.qStart = Date.now() - 90000; renderQuiz(); await w(5);
      if (c.champ === 'offer') { c.champ = null; finish(); break; }
      const q = c.qs[c.i];
      if (!c.res[c.i]) { if (q.type === 'num') answer(-1, q.ansv); else if (q.type === 'order') answer(-1, q.correct); else answer(k % 3 ? q.answer : (q.answer + 1) % q.options.length); await w(5); }
      if (c.tried && !c.res[c.i]) { answer(q.type === 'order' || q.type === 'num' ? -1 : q.answer, q.type === 'num' ? q.ansv : q.correct); await w(5); }
      c.offer = null; nextQ(); await w(5);
    }
    out.result = S.view; out.last = S.last && [S.last.correct, S.last.n, S.last.pts];
    for (const kind of ['boss', 'sim', 'practice', 'review']) { S.cur = null; if (kind === 'review' && !S.mist.length) continue; startMission(kind, kind === 'boss' ? 7 : 1, 'math', 'half'); S.cur.intro = false; renderQuiz(); await w(5); out[kind] = S.cur && S.cur.qs.length; S.cur.res = S.cur.qs.map(() => ({ ok: true, gain: 10, secs: 30 })); finish(); await w(5); }
    out.missions = Object.keys(S.missions).length; out.xp = S.xp;
    return out;
  });
  console.log(JSON.stringify(r)); console.log(errs.length ? 'ERRORS\n' + [...new Set(errs)].join('\n') : 'no errors');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();

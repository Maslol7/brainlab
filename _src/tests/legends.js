// Great football moments: every replay runs to its end, and a scripted play of each scene ends without page errors.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${fs.readFileSync(process.argv[2] || 'dist/index.html', 'utf8')}</body></html>`); await p.waitForTimeout(300);
  const shots = process.env.SHOTS; const out = {};
  await p.evaluate(() => { S.view = 'arcade'; render(); }); await p.waitForTimeout(100);
  out.tile = await p.evaluate(() => !!document.querySelector('[data-go="legends"]'));
  await p.click('[data-go="legends"]'); await p.waitForTimeout(150);
  out.cards = await p.evaluate(() => document.querySelectorAll('[data-lg]').length);
  if (shots) await p.screenshot({ path: shots + '/lg_list.png' });
  const plays = {
    istanbul: `await until(() => lgP('gerrard').y < 15); lgTap(lgP('gerrard').x, lgP('gerrard').y); lgTap(30.9, 0);`,
    origi: `lgTap(lgP('origi').x, lgP('origi').y); lgTap(37.1, 0);`,
    cruyff: `await until(() => lgD(lgP('cruyff'), lgP('olsson')) < 3); lgTurn(); await wait(500); LGS.runTo = { x: 24, y: 7 }; await until(() => LGS.carrier && LGS.carrier.y < 9); lgTap(LGS.carrier.x < 34 ? 31.2 : 36.8, 0);`,
    maradona: `while (LGS.mode === 'play' && LGS.carrier) { const c = LGS.carrier; let vx = ((c.y < 16 ? 37 : 34) - c.x) * (c.y < 16 ? .3 : .08), vy = -1; for (const o of LGS.ps.filter(p => p.team === 'them' && p.role !== 'keeper')) { const d = lgD(o, c); if (d < 7) { vx += (c.x - o.x) / d / d * 9; vy += (c.y - o.y) / d / d * 4; } } LGS.runTo = { x: c.x + vx * 4, y: c.y + vy * 4 }; if (c.y < 5) { lgTap(lgP("shilton").x < c.x ? 37 : 31, 0); break; } await wait(80); }`,
    olympiacos: `await until(() => lgP('gerrard').y < 26.5); lgTap(lgP('gerrard').x, lgP('gerrard').y); lgTap(30.8, 0);`,
    dalglish: `lgTap(lgP('kenny').x, lgP('kenny').y); await until(() => LGS.carrier && LGS.carrier.id === 'kenny'); await until(() => lgP('jensen').y > 3.2); LGS.chip = true; lgTap(34, 0);`,
  };
  /* the wrong way should fail: a low shot at a keeper who came out, running away from Olsson without the turn */
  const wrong = { dalglish: `lgTap(lgP('kenny').x, lgP('kenny').y); await until(() => LGS.carrier && LGS.carrier.id === 'kenny'); await until(() => lgP('jensen').y > 3.2); lgTap(34, 0);`, cruyff: `LGS.runTo = { x: 26, y: 6 };` };
  for (const [id, code] of Object.entries(wrong)) {
    await p.evaluate(id => { LGS = null; lgOpen(id); lgPlay(); }, id);
    out['wrong_' + id] = await p.evaluate(async (code) => { const wait = window.wait = ms => new Promise(r => setTimeout(r, ms)); window.until = async (f, ms = 9000) => { const t = Date.now(); while (!f() && Date.now() - t < ms && LGS.mode === 'play') await wait(30); };
      await (0, eval)(`(async () => { ${code} })()`); const t = Date.now(); while (LGS.mode === 'play' && Date.now() - t < 12000) await wait(50); await wait(900); return document.getElementById('lgpane').textContent.slice(0, 60); }, code);
  }
  await p.evaluate(() => { S.arcade.leg = {}; });
  for (const id of Object.keys(plays)) {
    await p.evaluate(id => { lgOpen(id); }, id); await p.waitForTimeout(150);
    if (shots) await p.screenshot({ path: `${shots}/lg_${id}_intro.png` });
    await p.click('[data-lgb="rp"]');
    const T = await p.evaluate(() => LGS.m.rp.T); await p.waitForTimeout(T * 500);
    if (shots) await p.screenshot({ path: `${shots}/lg_${id}_rp.png` });
    await p.waitForTimeout(T * 500 + 600);
    const rpEnd = await p.evaluate(() => !document.getElementById('lgpane').hidden && !!document.querySelector('[data-lgb="go"]'));
    await p.click('[data-lgb="go"]'); await p.click('[data-lgb="play"]');
    const res = await p.evaluate(async (code) => { const wait = window.wait = ms => new Promise(r => setTimeout(r, ms)); const until = window.until = async (f, ms = 9000) => { const t = Date.now(); while (!f() && Date.now() - t < ms && LGS.mode === 'play') await wait(30); };
      await (0, eval)(`(async () => { ${code} })()`); const t = Date.now(); while (LGS.mode === 'play' && Date.now() - t < 6000) await wait(50);
      await wait(1500); return { mode: LGS.mode, pane: (document.getElementById('lgpane').textContent || '').slice(0, 70), stars: (S.arcade.leg || {})[LGS.m.id] || 0 }; }, plays[id]);
    if (shots) await p.screenshot({ path: `${shots}/lg_${id}_end.png` });
    out[id] = Object.assign({ rpEnd }, res);
  }
  console.log(JSON.stringify(out, null, 1));
  const ok = out.tile && out.cards === 6 && Object.keys(plays).every(id => out[id].rpEnd && out[id].stars === 3) && /לא הפעם/.test(out.wrong_dalglish) && /לא הפעם/.test(out.wrong_cruyff) && !errs.length;
  console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no errors'); console.log(ok ? 'PASS' : 'FAIL'); await b.close(); process.exit(ok ? 0 : 1); })();

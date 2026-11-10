// Great football moments: replays run to the end, scripted plays score, the wrong way fails, cards and the challenge work.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${fs.readFileSync(process.argv[2] || 'dist/index.html', 'utf8')}</body></html>`); await p.waitForTimeout(2600);
  const shots = process.env.SHOTS; const out = {};
  await p.evaluate(() => { S.view = 'arcade'; render(); }); await p.waitForTimeout(100);
  out.tile = await p.evaluate(() => !!document.querySelector('[data-go="legends"]'));
  await p.click('[data-go="legends"]'); await p.waitForTimeout(150);
  out.cards = await p.evaluate(() => document.querySelectorAll('[data-lg]').length);
  if (shots) await p.screenshot({ path: shots + '/lg_list.png' });
  /* helpers inside the page: wait, wait until, and act through the engine the way a swipe would */
  await p.evaluate(() => { window.wait = ms => new Promise(r => setTimeout(r, ms)); window.until = async (f, ms = 9000) => { const t = Date.now(); while (!f() && Date.now() - t < ms && LGS.W.mode === 'play') await wait(30); };
    window.P = id => fbP(LGS.W, id); window.pass = id => fbPassTo(LGS.W, P(id), {}); window.shoot = (x, z, pw = .5, cv = 0) => fbShootAt(LGS.W, x, z, { power: pw, curve: cv }); window.queue = (x, z) => { LGS.W.queue = { x, z, power: .5, curve: 0 }; }; });
  /* plays run frame by frame (60 per second) so the result does not depend on the machine's speed */
  const plays = {
    istanbul: [`P('gerrard').y < 14`, `pass('gerrard'); queue(30.9, 1.4)`],
    origi: [`true`, `pass('origi'); queue(36.9, 1.8)`],
    cruyff: [`fbD(P('cruyff'), P('olsson')) < 3`, `fbTurn(W)`, `W.t > T0 + .5`, `W.runTo = { x: 26, y: 8 }`, `W.carrier && W.carrier.y < 10`, `shoot(31.2, .5)`],
    maradona: [`steer()`, ``],
    olympiacos: [`P('gerrard').y < 26.5`, `pass('gerrard'); queue(30.9, .4)`],
    dalglish: [`true`, `pass('kenny')`, `W.carrier && W.carrier.id === 'kenny' && fbD(P('jensen'), P('kenny')) < 5`, `W.chip = true; shoot(34.5, 1.2)`],
  };
  const wrong = { dalglish: [`true`, `pass('kenny')`, `W.carrier && W.carrier.id === 'kenny' && fbD(P('jensen'), P('kenny')) < 5`, `shoot(34, .5, .6)`], cruyff: [`true`, `W.runTo = { x: 26, y: 6 }`] };
  await p.evaluate(() => { window.steer = () => { const W = LGS.W, c = W.carrier; if (!c) return false; let vx = ((c.y < 16 ? 37 : 34) - c.x) * (c.y < 16 ? .3 : .08), vy = -1; for (const o of W.ps.filter(p => p.team === 'them' && !p.gk)) { const d = fbD(o, c); if (d < 7) { vx += (c.x - o.x) / d / d * 9; vy += (c.y - o.y) / d / d * 4; } } W.runTo = { x: c.x + vx * 4, y: c.y + vy * 4 }; if (c.y < 6) { const gk = P('shilton'); shoot(gk.x < c.x ? 37 : 31, .4); return true; } return false; }; });
  const run = async (id, script) => {
    await p.evaluate(id => { LGS = null; lgOpen(id); }, id); await p.waitForTimeout(250);
    return p.evaluate(async (script) => { lgPlay(); lgStop(); const W = LGS.W; window.W = W; let i = 0, T0 = 0;
      for (let f = 0; f < 60 * 20 && W.mode === 'play'; f++) { window.T0 = T0; if (i < script.length && (0, eval)(`(() => ${script[i]})()`)) { T0 = W.t; window.T0 = T0; if (script[i + 1]) (0, eval)(script[i + 1]); i += 2; } fbStep(W, 1 / 60); }
      const mode = W.mode, msg = (W.ev.find(e => e[0] === 'fail') || [])[1] || ''; lgLoop(); const t2 = Date.now(); while (Date.now() - t2 < 9000 && LGS.W.mode === 'goal') await wait(100); await wait(1400);
      return { mode, msg, pane: (document.getElementById('lgpane').textContent || '').slice(0, 60), stars: lgA().leg[LGS.m.id] || 0 }; }, script);
  };
  for (const [id, code] of Object.entries(wrong)) out['wrong_' + id] = await run(id, code);
  await p.evaluate(() => { lgA().leg = {}; lgA().cards = ['me']; });
  for (const id of Object.keys(plays)) {
    await p.evaluate(id => { LGS = null; lgOpen(id); }, id); await p.waitForTimeout(300);
    if (shots) await p.screenshot({ path: `${shots}/lg_${id}_intro.png` });
    await p.click('[data-lgb="rp"]');
    const T = await p.evaluate(() => LGS.m.rp.T); await p.waitForTimeout(T * 600);
    if (shots) await p.screenshot({ path: `${shots}/lg_${id}_rp.png` });
    await p.waitForTimeout(T * 400 + 700);
    const rpEnd = await p.evaluate(() => !document.getElementById('lgpane').hidden && !!document.querySelector('[data-lgb="task"]'));
    out[id] = Object.assign({ rpEnd }, await run(id, plays[id]));
    if (shots) await p.screenshot({ path: `${shots}/lg_${id}_end.png` });
  }
  /* real swipes with the mouse: a swipe to Origi passes, a swipe to the goal's top corner queues the first-time shot */
  await p.evaluate(() => { LGS = null; lgOpen('origi'); }); await p.waitForTimeout(400); await p.evaluate(() => lgPlay()); await p.waitForTimeout(250);
  const scr = await p.evaluate(() => { const R = LGS.R, r = R.cv.getBoundingClientRect(), s = (x, y, z) => { const q = fbProj(R, x, y, z); return [r.left + q[0] * r.width / R.W, r.top + q[1] * r.height / R.H]; }; const W = LGS.W, t = fbP(W, 'trent'), o = fbP(W, 'origi'); return { from: s(t.x, t.y, 0), to: s(o.x, o.y, 0), goal: s(36.8, 0, 1.9) }; });
  const swipe = async (a, z) => { await p.mouse.move(a[0], a[1]); await p.mouse.down(); for (let i = 1; i <= 6; i++) { await p.mouse.move(a[0] + (z[0] - a[0]) * i / 6, a[1] + (z[1] - a[1]) * i / 6); await p.waitForTimeout(12); } await p.mouse.up(); };
  await swipe(scr.from, scr.to); await p.waitForTimeout(80);
  out.swipePass = await p.evaluate(() => LGS.W.fly && LGS.W.fly.kind);
  const g2 = await p.evaluate(() => { const R = LGS.R, r = R.cv.getBoundingClientRect(), q = fbProj(R, 36.8, 0, 1.9), o = fbP(LGS.W, 'origi'), q2 = fbProj(R, o.x, o.y, 0); return { a: [r.left + q2[0] * r.width / R.W, r.top + q2[1] * r.height / R.H], z: [r.left + q[0] * r.width / R.W, r.top + q[1] * r.height / R.H] }; });
  await swipe(g2.a, g2.z); await p.waitForTimeout(50);
  out.swipeQueue = await p.evaluate(() => LGS.W.queue && { x: +LGS.W.queue.x.toFixed(1), z: +LGS.W.queue.z.toFixed(1) });
  if (shots) await p.screenshot({ path: `${shots}/lg_swipe.png` });
  /* cards: winning moments gave hero cards; buying spends coins; the squad takes three */
  out.cardsOwned = await p.evaluate(() => lgA().cards.slice());
  out.buy = await p.evaluate(async () => { LGS = null; LG_TAB = 'cards'; S.coins = 1000; renderLegends(); await wait(100); document.querySelector('[data-lgbuy="salah"]') ; document.querySelector('[data-lgbuy="rush"]').click(); await wait(100); document.querySelector('.modal [data-m="ok"]').click(); await wait(150); return { coins: S.coins, has: lgA().cards.includes('rush'), squad: lgA().squad.slice() }; });
  if (shots) await p.screenshot({ path: `${shots}/lg_cards.png`, fullPage: true });
  /* the challenge: a run starts, a level can be won through the engine, the next level is harder */
  out.ch = await p.evaluate(async () => { lgChallenge(); await wait(300); lgPlay(); const W = LGS.W, c = W.carrier; W.runTo = { x: 34, y: 14 }; await until(() => !LGS.W.carrier || LGS.W.carrier.y < 17 || LGS.W.mode !== 'play', 6000);
    if (LGS.W.mode === 'play' && LGS.W.carrier) { const gk = fbGK(LGS.W); fbShootAt(LGS.W, gk.x > 34 ? 31 : 37, .4, { power: .55 }); }
    const t = Date.now(); while (Date.now() - t < 9000 && !['done', 'fail'].includes(LGS.W.mode)) await wait(100); await wait(1300);
    return { mode: LGS.W.mode, L: LGS.run.L, lives: LGS.run.lives, nOpp1: LGS.m.opp.length, pane: document.getElementById('lgpane').textContent.slice(0, 60), lvl5: lgLevel(5).opp.length }; });
  if (shots) await p.screenshot({ path: `${shots}/lg_ch.png` });
  console.log(JSON.stringify(out, null, 1));
  const ok = out.tile && out.cards === 6 && Object.keys(plays).every(id => out[id].rpEnd && out[id].stars === 3) && /לא הפעם/.test(out.wrong_dalglish.pane) && /לא הפעם/.test(out.wrong_cruyff.pane)
    && ['gerrard', 'trent', 'cruyff', 'maradona', 'dalglish'].every(c => out.cardsOwned.includes(c)) && out.buy.has && out.buy.coins === 850 && out.ch.lvl5 > out.ch.nOpp1 && out.swipePass === 'pass' && out.swipeQueue && Math.abs(out.swipeQueue.x - 36.8) < 1.6 && !errs.length;
  console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no errors'); console.log(ok ? 'PASS' : 'FAIL'); await b.close(); process.exit(ok ? 0 : 1); })();

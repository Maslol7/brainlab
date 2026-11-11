// סלטה: real taps through a practice session, a mock dictation and every game, on an iPhone-sized screen. node romi/tests/flow.js [url]
const { chromium, devices } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:8811/romi/';
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }); const ctx = await b.newContext({ ...devices['iPhone 13'], permissions: ['clipboard-read', 'clipboard-write', 'microphone'] }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } };
  await p.goto(url); await p.waitForTimeout(800);
  await p.click('.modal [data-mi]');
  // a practice session, answered right by tapping
  await p.click('[data-act="today"]');
  let n = 0;
  while (n++ < 60) {
    const st = await p.evaluate(() => ({ v: S.view, t: P && P.cur && P.cur.type, en: P && P.cur && P.cur.w.en, he: P && P.cur && P.cur.w.he[0] }));
    if (st.v !== 'practice') break;
    if (st.t === 'learn') { await p.click('[data-act="gotit"]'); continue; }
    if (['meanEN', 'meanHE', 'pick'].includes(st.t)) {
      const i = await p.evaluate(() => P.cur.opts.findIndex(o => P.cur.type === 'pick' ? o === P.cur.w.en.toLowerCase() : kOf(o) === kOf(P.cur.w)));
      await p.click(`[data-o="${i}"]`); await p.waitForTimeout(1000); continue;
    }
    const word = st.t === 'writeHE' ? st.he : st.en.toLowerCase();
    if (st.t === 'tiles') { for (const c of word.replace(/ /g, '')) { const i = await p.evaluate(c => KB.tiles.findIndex((x, j) => x === c && !KB.used.includes(j)), c); await p.click(`[data-ti="${i}"]`); } }
    else { for (const c of word) await p.click(`.kbd [data-k="${c}"]`); await p.click('.kbd [data-k="enter"]'); }
    await p.waitForTimeout(1600);
  }
  ok(await p.evaluate(() => S.view === 'pdone'), 'practice reaches the end screen');
  ok(await p.evaluate(() => S.candy > 5 && Object.values(S.p).some(q => q.st >= 2)), 'candies and progress saved');
  // a wrong answer leads to the copy step
  await p.click('[data-act="again"]');
  await p.evaluate(() => { const c = P.cur; c.type = 'typeEN'; delete c.opts; render(); });
  for (const c of 'xyz') await p.click(`.kbd [data-k="${c}"]`); await p.click('.kbd [data-k="enter"]'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => P.cur.phase === 'copy' && !!document.querySelector('.fixing .fb-bad')), 'wrong answer shows the correction');
  await p.click('[data-act="quit"]'); await p.click('.modal [data-mi="1"]');
  // mock dictation
  await p.click('[data-act="mock"]');
  for (let i = 0; i < 20; i++) {
    const st = await p.evaluate(() => T && { step: T.step, en: T.items[T.i].w.en, he: T.items[T.i].w.he[0] }); if (!st) break;
    const w = st.step === 'he' ? st.he : st.en.toLowerCase(); for (const c of w) await p.click(`.kbd [data-k="${c}"]`); await p.click('.kbd [data-k="enter"]'); await p.waitForTimeout(150);
  }
  ok(await p.evaluate(() => S.view === 'tdone' && S.last.score === 100 && S.stickers.length === 1), 'mock dictation 100 with a sticker');
  await p.click('[data-go="home"]');
  // games
  await p.click('[data-game="tramp"]'); await p.waitForTimeout(300);
  for (let k = 0; k < 6; k++) { const w = await p.evaluate(() => G && G.ws[G.i].en.toLowerCase().replace(/ /g, '')); if (!w) break; for (let j = 0; j < w.length; j++) { const i = await p.evaluate(c => G.tiles.findIndex((x, j) => x === c && !KB.used.includes(j)), w[j]); await p.click(`[data-ti="${i}"]`); } await p.waitForTimeout(1600); }
  ok(await p.evaluate(() => !!document.querySelector('.modal') && S.best.tramp > 0), 'trampoline ends with a score');
  await p.click('.modal [data-mi="1"]');
  await p.click('[data-game="memory"]');
  const pairs = await p.evaluate(() => G.cards.map(c => c.i));
  for (let i = 0; i < 6; i++) { const [a, c] = pairs.map((x, j) => x === i ? j : -1).filter(j => j >= 0); await p.click(`[data-mc="${a}"]`); await p.click(`[data-mc="${c}"]`); await p.waitForTimeout(450); }
  ok(await p.evaluate(() => S.best.memory === 6), 'memory with 6 moves');
  await p.click('.modal [data-mi="1"]');
  await p.click('[data-game="rain"]'); await p.waitForTimeout(800);
  for (let k = 0; k < 4; k++) { await p.evaluate(() => { const o = G.orbs.find(o => o.ok && !o.dead); if (o) o.el.click(); }); await p.waitForTimeout(900); }
  ok(await p.evaluate(() => G && G.score > 0 && G.wave >= 4), 'rain: tapping the right orb scores');
  await p.click('[data-act="gquit"]');
  await p.click('[data-game="teach"]'); await p.click('[data-m="en"]');
  for (let i = 0; i < 8; i++) await p.click('[data-act="nx"]');
  for (let i = 0; i < 8; i++) await p.click(`[data-mk="${i}"][data-v="${i ? 1 : 0}"]`);
  await p.click('[data-act="grade"]'); ok(await p.evaluate(() => /88/.test(document.querySelector('.modal h3').textContent)), 'teach: dad gets 88');
  await p.click('.modal [data-mi="1"]');
  await p.click('[data-game="duel"]'); await p.fill('#n1', 'נועה'); await p.click('[data-act="go"]');
  for (let r = 0; r < 10; r++) { await p.click('[data-act="ready"]'); const w = await p.evaluate(() => G.ws[G.r * 2 + G.turn].en.toLowerCase()); for (const c of (r % 2 ? 'abc' : w)) await p.click(`.kbd [data-k="${c}"]`); await p.click('.kbd [data-k="enter"]'); await p.waitForTimeout(1550); }
  ok(await p.evaluate(() => /ניצחה/.test(document.querySelector('.modal h3').textContent)), 'duel: a winner');
  await p.click('.modal [data-mi="1"]');
  // shop
  await p.evaluate(() => { S.candy = 100; save(); }); await p.click('.foot [data-go="shop"]'); await p.click('[data-buy="leo:mint"]'); await p.click('.modal [data-mi="0"]');
  ok(await p.evaluate(() => S.leo === 'mint' && S.candy === 75), 'buy a leotard');
  // parent: PIN, paste a list, it becomes a class list
  await p.click('[data-go="home"]'); await p.click('.foot [data-go="parent"]'); await p.fill('#pin', '1234'); await p.click('[data-act="pin"]');
  await p.evaluate(() => { const d = document.querySelector('.newlist details'); if (d) d.open = true; });
  await p.fill('#paste', '1. Window – חלון 🪟\n2. Yellow - צהוב\n3. Ice cream – גלידה 🍦\nההכתבה ב-2.12'); await p.click('[data-act="parse"]'); await p.click('[data-act="savelist"]');
  ok(await p.evaluate(() => S.lists.length === 4 && S.lists.some(l => /-12-02$/.test(l.date) && l.words.length === 3)), 'a pasted list is saved with its date');
  // one-tap paste from WhatsApp (the clipboard)
  await p.evaluate(() => navigator.clipboard.writeText('הכתבה ב-9.12\n1. Kitchen – מטבח 🍳\n2. Garden – גינה 🌻'));
  await p.click('[data-act="clip"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => DRAFT && DRAFT.words.length === 2 && /-12-09$/.test(DRAFT.date)), 'paste from the clipboard reads the list');
  await p.click('[data-act="savelist"]'); await p.waitForTimeout(200);
  // dad's voice: a short tone stands in for a recording
  ok(await p.evaluate(async () => { const sr = 8000, n = 1600, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf); const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin(i / 3) * 8000, true);
    let bin = ''; new Uint8Array(buf).forEach(x => bin += String.fromCharCode(x)); VOICE.road = 'data:audio/wav;base64,' + btoa(bin); saveVoice();
    return await playVoice('road'); }), 'dad voice plays');
  ok(await p.evaluate(() => { go('parent'); return document.querySelectorAll('.vrow.has').length === 1; }), 'parent area shows the recorded word');
  // the whole list in one take (fake microphone)
  await p.click('[data-act="vrall"]'); await p.click('[data-act="vrgo"]'); await p.waitForTimeout(600);
  const nw = await p.evaluate(() => VR.l.words.length);
  for (let i = 0; i < nw; i++) { await p.waitForTimeout(700); await p.click('[data-act="vrnext"]'); }
  await p.waitForFunction(() => VR && VR.ph === 'review', null, { timeout: 15000 }).catch(() => { });
  ok(await p.evaluate(n => VR && VR.ph === 'review' && Object.keys(VR.clips).length === n, nw), 'one-take recording splits into every word');
  await p.click('[data-act="vrsave"]');
  ok(await p.evaluate(() => S.view === 'parent' && curList().words.every(w => VOICE[kOf(w)])), 'one-take recording saved');
  // the lists that ship with the app, and the Magic E wand
  ok(await p.evaluate(() => S.lists.some(l => l.id === 'c-2026-11-04') && S.lists.some(l => l.id === 'e-2026-11-23' && l.kind === 'exam')), 'the 4.11 list and the test list are there');
  await p.evaluate(() => go('home')); await p.click('[data-game="wand"]');
  for (let i = 0; i < 13; i++) { const r = await p.evaluate(() => G && !G.over && G.rounds[G.i]); if (!r) break; await p.click(`[data-w="${r.opts.indexOf(r.ans)}"]`); await p.waitForTimeout(r.k === 'sent' ? 2750 : 1850); }
  ok(await p.evaluate(() => S.best.wand === 130), 'wand: all 13 rounds right');
  await p.click('.modal [data-mi="1"]'); await p.evaluate(() => go('parent'));
  // general review
  ok(await p.evaluate(() => { startPractice(reviewList()); const r = P && P.list.id === 'review' && P.q.length > 0; P = null; go('home'); return r; }), 'general review starts');
  // the speaking game draws (only where the browser can listen)
  ok(await p.evaluate(() => { if (!SR) return true; startGame('speak'); const r = !!document.querySelector('.micbtn'); G = null; go('home'); return r; }), 'speaking game');
  // birthday: 3 April gives 50 candies and the birthday leotard, once
  await p.evaluate(() => { window._ts = todayStr; todayStr = d => d ? window._ts(d) : '2027-04-03'; S.candy = 0; go('home'); }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => S.candy === 50 && S.leo === 'bday' && !!document.querySelector('.bday') && /10/.test(document.querySelector('.modal h3').textContent)), 'birthday gift and banner');
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.remove()); go('home'); }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => S.candy === 50), 'birthday gift only once');
  await p.evaluate(() => { todayStr = d => d ? window._ts(d) : '2027-03-29'; go('home'); });
  ok(await p.evaluate(() => /5 ימים/.test((document.querySelector('.soon') || {}).textContent || '')), 'birthday countdown');
  await p.evaluate(() => { todayStr = window._ts; go('home'); });
  // the app updates itself once when the site has a new version
  const fakeNew = () => p.evaluate(() => { const f0 = window.fetch; window.fetch = (u, o) => /version\.json/.test(String(u)) ? Promise.resolve(new Response('{"v":"999"}')) : f0(u, o); });
  await fakeNew(); await p.evaluate(() => autoUpdate()); await p.waitForTimeout(1800); await fakeNew();
  ok(await p.evaluate(() => { try { return sessionStorage.getItem('salta-upd') === '999'; } catch (e) { return false; } }), 'self-update reloads once');
  await p.evaluate(() => autoUpdate()); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => S.view === 'home' && !!document.querySelector('.floor')), 'no reload loop');
  // reload keeps everything
  await p.reload(); await p.waitForTimeout(700);
  ok(await p.evaluate(() => S.lists.length === 5 && S.stickers.length === 1 && S.leo === 'bday' && !!VOICE.road), 'state survives a reload');
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs) : 'ALL OK'); await b.close(); process.exit(errs.length ? 1 : 0);
})();

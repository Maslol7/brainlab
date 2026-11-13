// סלטה: who says the English words (dad / English voice / mix) and the voice picker. node romi/tests/vmode.js [url]
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:8811/romi/', errs = [];
  const b = await chromium.launch(); const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => { if (!c) errs.push('FAIL ' + m); };
  await p.goto(url); await p.waitForTimeout(600); await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.remove()));
  const r = await p.evaluate(() => {
    VOICE.road = 'data:audio/wav;base64,AAAA'; const w = LIST0.words.find(x => x.en === 'Road'), out = {};
    S.vmode = 'dad'; S.view = 'practice'; P = { cur: { type: 'typeEN' } }; out.dadDrill = hasVoice(w);
    S.vmode = 'native'; out.nativeDrill = hasVoice(w);
    S.vmode = 'mix'; out.mixDrill = hasVoice(w); P.cur.type = 'learn'; out.mixLearn = hasVoice(w); S.view = 'test'; out.mixTest = hasVoice(w); S.view = 'game'; out.mixGame = hasVoice(w);
    delete S.vmode; S.dadVoice = 0; out.oldOff = vmode(); delete S.dadVoice; P = null; S.view = 'home'; return out;
  });
  ok(r.dadDrill && !r.nativeDrill && !r.mixDrill && r.mixLearn && r.mixTest && !r.mixGame && r.oldOff === 'native', 'voice modes ' + JSON.stringify(r));
  await p.evaluate(() => { S.pin = '1234'; PARENT_OK = true; go('parent'); }); await p.click('[data-vm="mix"]');
  ok(await p.evaluate(() => S.vmode === 'mix' && !!document.querySelector('[data-vm="mix"].on') && !!document.getElementById('envoice')), 'parent area sets the mode and shows the voice picker');
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs) : 'ALL OK'); await b.close(); process.exit(errs.length ? 1 : 0);
})();

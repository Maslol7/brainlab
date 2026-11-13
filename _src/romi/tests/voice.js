// סלטה: dad's voice playback. Closed audio context is made again; a non-WAV recording becomes WAV; a broken one falls back and is logged. node romi/tests/voice.js [url]
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:8811/romi/', errs = [];
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => { if (!c) errs.push('FAIL ' + m); };
  await p.goto(url); await p.waitForTimeout(600); await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.remove()));
  // a recording made by MediaRecorder (webm/opus here, mp4 on the iPhone)
  const made = await p.evaluate(async () => {
    const a = ac(); const o = a.createOscillator(), d = a.createMediaStreamDestination(); o.connect(d); o.start();
    const mr = new MediaRecorder(d.stream), parts = []; mr.ondataavailable = e => parts.push(e.data);
    await new Promise(r => { mr.onstop = r; mr.start(); setTimeout(() => mr.stop(), 700); }); o.stop();
    const url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(new Blob(parts, { type: mr.mimeType })); });
    VOICE.road = url; saveVoice(); return url.slice(0, 20);
  });
  ok(/^data:audio\/webm/.test(made), 'test recording made');
  await p.evaluate(() => wavAll()); await p.waitForTimeout(500);
  ok(await p.evaluate(() => /^data:audio\/wav/.test(VOICE.road)), 'a recorder file is converted to WAV');
  ok(await p.evaluate(() => playVoice('road')), 'WAV plays through Web Audio');
  ok(await p.evaluate(async () => { await AC.close(); return await playVoice('road') && AC.state === 'running'; }), 'a closed audio context is made again and plays');
  ok(await p.evaluate(async () => { VOICE.flower = 'data:audio/wav;base64,AAAA'; delete VBUF.flower; const r = await playVoice('flower'); return !r && S.log.filter(e => e.k === 'vf' && e.w === 'flower').length === 1; }), 'a broken recording falls back and is logged once');
  ok(await p.evaluate(async () => { const r = await playVoice('road', .7); return r; }), 'slow: dad\'s recording at 70% through <audio>');
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs) : 'ALL OK'); await b.close(); process.exit(errs.length ? 1 : 0);
})();

// Render one question and its solution, for looking at it:
//   node tests/show-q.js <html> <out.png> "<js that returns a question>" [ok|wrong]
// The question is answered (wrong twice by default, so the open solution shows) and the card is captured.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const [html, out, expr, mode = 'wrong'] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${fs.readFileSync(html, 'utf8')}</body></html>`); await p.waitForTimeout(200);
  const info = await p.evaluate(([expr, mode]) => { S.rh = Array(10).fill(0); startMission('practice', 1, 'logic'); const c = S.cur; c.intro = false; const q = (0, eval)(`(()=>{ return ${expr}; })()`); q.type = q.type || undefined; c.qs[0] = q; c.qStart = Date.now() - 90000; c.think = false; renderQuiz();
    if (mode === 'ok') { if (q.type === 'num') answer(-1, q.ansv); else if (q.type === 'order') answer(-1, q.correct); else answer(q.answer); }
    else if (q.type === 'order') { answer(-1, q.correct.slice().reverse()); answer(-1, q.correct.slice().reverse()); }
    else if (q.type === 'num') { answer(-1, q.ansv + 1); answer(-1, q.ansv + 2); }
    else { const w = [0, 1, 2, 3, 4].filter(i => i !== q.answer && i < q.options.length); answer(w[0]); c.qStart = Date.now() - 90000; answer(w[1]); }
    document.querySelector('details.sol')?.setAttribute('open', '');
    return { prompt: q.prompt, ex: q.ex }; }, [expr, mode]);
  await p.waitForTimeout(700);
  const card = await p.$('.card'); await card.screenshot({ path: out });
  console.log(JSON.stringify(info).slice(0, 600)); console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no errors'); await b.close(); })();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:844} });
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
  const html=require('fs').readFileSync('index.html','utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  await p.waitForTimeout(200); await p.evaluate(()=>{ minSecs = () => 0; S.rh = Array(10).fill(0); });
  const r = await p.evaluate(async () => {
    const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const log=[];
    const run = async (kind, day, wrongFirst) => {
      startMission(kind, day); S.cur.intro=false; renderQuiz(); let guard=0;
      while (S.cur && guard++<200) {
        const c=S.cur; if (c.champ==='offer'){ c.champ=null; finish(); break; }
        if (c.chBreak){ c.chBreak=false; c.ch++; renderQuiz(); continue; }
        const q=c.qs[c.i];
        const val = q.type==='order'? q.correct : q.type==='num' ? q.ansv : q.answer;
        if (wrongFirst && q.type!=='order' && q.type!=='num' && !c.res[c.i]) answer((q.answer+1)%q.options.length);
        if (c.res[c.i] && !deferred(c.kind)) { nextQ(); await sleep(5); continue; }
        if (q.type==='order') answer(-1, val); else if (q.type==='num') answer(-1, String(val)); else answer(val);
        await sleep(deferred(c.kind)?700:5);
        if (S.cur && !deferred(S.cur.kind) && S.cur.res[S.cur.i]) { nextQ(); await sleep(5); }
      }
      log.push([kind, day, S.view, Object.keys(S.missions).length, S.mist.length]);
    };
    await run('daily', 1, true);
    await run('daily', 2, false);
    await run('boss', 7, true);
    return log;
  });
  console.log(JSON.stringify(r), errs);
  await b.close();
})();

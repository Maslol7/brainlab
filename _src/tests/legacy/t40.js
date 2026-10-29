const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const out={};
 for (const w of [320,360]) { const p = await b.newPage({viewport:{width:w,height:740}}); const html=require('fs').readFileSync('index.html','utf8'); await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(150);
  out[w] = await p.evaluate(async ()=>{ let over=0, tot=0; const cats=['matrix','analog','logic','code','series','reading','verbal','math','spatial']; for (const c of cats) for (let k=0;k<12;k++){ S.cur=null; startMission('practice',1,c); const cc=S.cur; cc.intro=false; const q=mkQ(c, 1+k%3, 0); if (k%2) { Object.assign(q,{rev:'x', twin:true}); } cc.qs[0]=q; cc.qStart=Date.now()-60000; renderQuiz(); await new Promise(r=>setTimeout(r,10)); tot++; if (document.documentElement.scrollWidth > innerWidth+1) over++; } return [over,tot]; });
  await p.close(); }
 console.log(JSON.stringify(out)); await b.close(); })();

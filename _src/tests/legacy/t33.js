const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}, deviceScaleFactor:2});
 const html=require('fs').readFileSync('index.html','utf8'); await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200);
 const kinds = process.argv.slice(2);
 for (const k of kinds) { await p.evaluate(k=>{ S.rh=[]; S.cur=null; startMission('practice',1,'matrix'); S.cur.intro=false; S.cur.qs[0]= eval(k); S.cur.qStart=Date.now()-60000; renderQuiz(); }, k); await p.waitForTimeout(150); await p.screenshot({path:`/tmp/claude-0/img/sh_${k.replace(/\W/g,'')}.png`}); }
 await b.close(); })();

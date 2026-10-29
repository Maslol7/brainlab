const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}}); 
 const html=require('fs').readFileSync('index.html','utf8'); await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200);
 await p.evaluate(()=>{ startMission('daily',1); S.cur.intro=false; renderHoops(); });
 await p.waitForTimeout(300);
 console.log(await p.evaluate(()=>['.court','.hoop','.ball','.ballrow'].map(s=>{const e=document.querySelector(s); const cs=getComputedStyle(e); const r=e.getBoundingClientRect(); return [s, cs.display, cs.position, cs.background.slice(0,60), Math.round(r.width), Math.round(r.height), Math.round(r.left)];})));
 await b.close(); })();

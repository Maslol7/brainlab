const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}, deviceScaleFactor:2, hasTouch:false}); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
 const html=require('fs').readFileSync('index.html','utf8'); await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200);
 const out={};
 for (const day of [7,21]) {
   await p.evaluate(d=>{ S.cur=null; minSecs=()=>0; startMission('boss', d); const c=S.cur; c.intro=false; c.deadline=Date.now()+20*60000; for(let i=0;i<8;i++){ c.res[i]={ok:true,gain:10,secs:20,sel:0}; } c.i=8; c.qStart=Date.now()-20000; renderQuiz(); }, day);
   await p.waitForTimeout(300);
   out['d'+day] = await p.evaluate(()=>[!!document.querySelector('#bgc'), document.querySelector('.bossgame b')?.textContent, S.cur.mg]);
   // move paddle around
   const box = await p.$eval('#bgc', e=>{const r=e.getBoundingClientRect(); return [r.left,r.top,r.width,r.height];});
   for (let t=0;t<20;t++){ await p.mouse.move(box[0]+box[2]*(0.2+0.6*Math.random()), box[1]+box[3]-20); await p.waitForTimeout(100); }
   await p.screenshot({path:`/tmp/claude-0/img/v22_${day}.png`});
   out['score'+day] = await p.$eval('#bgs', e=>e.textContent);
   const dl0 = await p.evaluate(()=>S.cur.deadline);
   await p.click('[data-mg="skip"], [data-mg="back"]'); await p.waitForTimeout(150);
   out['back'+day] = await p.evaluate(dl0=>[!!document.querySelector('.qprompt'), S.cur.deadline > dl0, S.cur.mg], dl0);
 }
 // play to the end with an AI-ish cheat: put paddle under ball each frame via mouse? just wait 45s on breakout to finish
 await p.evaluate(()=>{ S.cur=null; startMission('boss', 21); const c=S.cur; c.intro=false; for(let i=0;i<8;i++) c.res[i]={ok:true,gain:10,secs:20,sel:0}; c.i=8; renderQuiz(); });
 await p.waitForTimeout(41500);
 out.end = await p.$eval('#bgend', e=>e.textContent);
 await p.screenshot({path:'/tmp/claude-0/img/v22_end.png'});
 const pts0 = await p.evaluate(()=>S.cur.pts); await p.click('[data-mg="back"]'); out.pts = [pts0, await p.evaluate(()=>S.cur.pts)];
 console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs); await b.close(); })();

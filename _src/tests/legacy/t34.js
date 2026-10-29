const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}, deviceScaleFactor:2});
 const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
 const html=require('fs').readFileSync('index.html','utf8'); await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200);
 const out={};
 // first-time banner on matrix
 await p.evaluate(()=>{ S.rh=[]; startMission('practice',1,'matrix'); S.cur.intro=false; S.cur.qs[0]=genMatrix(2); S.cur.qStart=Date.now()-60000; renderQuiz(); });
 out.banner = await p.$eval('.gfirst', e=>e.textContent).catch(()=>null);
 await p.screenshot({path:'/tmp/claude-0/img/v19_q.png'});
 await p.click('.gfirst [data-guide]');
 for (let i=0;i<5;i++){ await p.waitForTimeout(120); if(i===1){ await p.click('[data-ga="shape:same"]'); await p.waitForTimeout(80);} await p.screenshot({path:`/tmp/claude-0/img/v19_g${i}.png`}); const nx = await p.$('[data-g="next"]'); if (nx) await nx.click(); }
 out.lastStep = await p.$eval('.gstep', e=>e.textContent);
 await p.click('[data-g="done"]'); await p.waitForTimeout(150);
 out.back = await p.evaluate(()=>[!!document.querySelector('.qprompt'), !!document.querySelector('.gfirst'), !!document.querySelector('[data-guide]')]);
 for (const k of ['dial','figan','rotation','net','cubes']) { await p.evaluate(k=>startGuide(k,'quiz'), k); await p.waitForTimeout(100); let n=0; while (await p.$('[data-g="next"]')) { await p.click('[data-g="next"]'); n++; await p.waitForTimeout(60);} await p.screenshot({path:`/tmp/claude-0/img/v19_${k}.png`}); out[k]=n; await p.click('[data-g="done"]'); }
 // verbal
 out.verbal = await p.evaluate(()=>{ const o={}; for(let i=0;i<400;i++){ const q=GEN.verbal(1+i%3); const k=lessonFor(q); o[k]=(o[k]||0)+1; } return o; });
 await p.evaluate(()=>{ S.cur.qs[1]=genHom(2); S.cur.i=1; S.cur.qStart=Date.now()-60000; renderQuiz(); }); await p.screenshot({path:'/tmp/claude-0/img/v19_hom.png'});
 await p.evaluate(()=>{ S.cur.qs[2]=genSC2(2); S.cur.i=2; S.cur.qStart=Date.now()-60000; renderQuiz(); }); await p.screenshot({path:'/tmp/claude-0/img/v19_sc2.png'});
 // daily reading count
 out.reading = await p.evaluate(()=>{ const r=[]; for (const d of [1,2,3,4,5,6]) { S.cur=null; startMission('daily', d); r.push(S.cur.qs.filter(q=>q.cat==='reading').length); } S.cur=null; return r; });
 out.simCats = await p.evaluate(()=>CHAPTERS[0].cats);
 // shop
 await p.evaluate(()=>{ S.coins=500; go('shop'); }); await p.screenshot({path:'/tmp/claude-0/img/v19_shop.png', fullPage:true});
 await p.click('[data-accb="scarf"]'); await p.click('.modal .btn-gold, .modal .btn-primary'); await p.waitForTimeout(100);
 await p.click('[data-act="exch"]'); await p.click('.modal .btn-gold, .modal .btn-primary'); await p.waitForTimeout(100);
 out.shop = await p.evaluate(()=>[S.coins, S.dia, S.accOwn, S.exWeek, document.querySelector('[data-act="exch"]')?.disabled]);
 await p.screenshot({path:'/tmp/claude-0/img/v19_shop2.png'});
 // songs buy
 await p.evaluate(()=>{ go('songs'); }); await p.click('[data-buysong]'); await p.click('.modal .btn-gold, .modal .btn-primary'); await p.waitForTimeout(100);
 out.songs = await p.evaluate(()=>[songsOpen(), S.coins, S.songBuy]);
 // rules tab
 await p.evaluate(()=>{ S.ptab='rules'; go('stats'); }); out.rulesTab = await p.$$eval('[data-guidetab]', es=>es.length);
 console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs); await b.close(); })();

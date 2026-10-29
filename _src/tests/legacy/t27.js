const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
  const html=require('fs').readFileSync('index.html','utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  await p.waitForTimeout(200); const out={};
  const sleep = ms => p.waitForTimeout(ms);
  // commit button
  await p.evaluate(()=>{ S.rh=Array(10).fill(1); startMission('daily',1); S.cur.intro=false; S.cur.qs[0]=genFamily(1); S.cur.qStart=Date.now(); renderQuiz(); });
  out.commitBtn = await p.$eval('[data-commit]', e=>e.textContent).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v16_commit.png'});
  await p.click('[data-commit]'); await sleep(100);
  out.unblur = await p.evaluate(()=>[!document.querySelector('.thinkbar'), document.querySelector('[data-opt="0"]').disabled]);
  // frustration: 3 wrong (slow) in a row -> break offer
  await p.evaluate(()=>{ S.rh=Array(10).fill(0); const c=S.cur; for(let k=0;k<3;k++){ c.i=k; c.qs[k]=genFamily(1); c.qStart=Date.now()-30000; const q=c.qs[k]; answer((q.answer+1)%4); answer((q.answer+2)%4); } });
  out.wrongRun = await p.evaluate(()=>S.cur.wrongRun);
  await p.evaluate(()=>nextQ()); await sleep(100);
  out.offer = await p.$eval('.offer h2', e=>e.textContent).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v16_offer.png'});
  await p.click('[data-fun="hoops"]'); await sleep(700); await p.click('#throw'); await sleep(500);
  await p.screenshot({path:'/tmp/claude-0/img/v16_hoops.png'});
  await p.click('[data-fun="done"]'); await sleep(100);
  out.backTo = await p.evaluate(()=>[S.cur.i, !!document.querySelector('.qprompt')]);
  // boost: 4 easy correct
  await p.evaluate(()=>{ const c=S.cur; c.wrongRun=0; for(let k=3;k<7;k++){ c.i=k; c.qs[k]=genFamily(1); c.qs[k].d=1; c.qStart=Date.now()-6000; answer(c.qs[k].answer); } });
  out.easyRun = await p.evaluate(()=>[S.cur.easyRun, S.cur.offer]);
  await p.evaluate(()=>nextQ()); await sleep(100);
  out.offer2 = await p.$eval('.offer h2', e=>e.textContent).catch(()=>null);
  await p.click('[data-fun="boost"]'); await sleep(100);
  out.boosted = await p.evaluate(()=>S.cur.qs.slice(8).map(q=>q.d));
  // breathing screenshot
  await p.evaluate(()=>renderBreath()); await sleep(1500); await p.screenshot({path:'/tmp/claude-0/img/v16_breath.png'});
  await p.evaluate(()=>{ stopFun(); renderQuiz(); });
  // finish with low accuracy -> explain + checkin
  await p.evaluate(()=>{ const c=S.cur; for(let k=7;k<10;k++){ c.i=k; c.qStart=Date.now()-30000; const q=c.qs[k]; if(q.type==='order') answer(-1,q.correct); else if(q.type==='num') answer(-1,String(q.ansv)); else answer(q.answer); } c.champOffered=true; finish(); });
  await sleep(150);
  await p.evaluate(()=>{ S.last.correct=4; render(); }); out.result = await p.evaluate(()=>[document.querySelector('.explain')?.textContent.slice(0,80), document.querySelector('.checkin')?.textContent]);
  await p.screenshot({path:'/tmp/claude-0/img/v16_result.png', fullPage:true});
  const r0 = await p.evaluate(()=>S.rat.verbal);
  await p.click('[data-mood="hard"]'); await sleep(100);
  out.mood = await p.evaluate(()=>[document.querySelector('.checkin')?.textContent, S.hints, S.moods]);
  await p.click('[data-act="explained"]'); await sleep(100);
  out.explained = await p.evaluate(()=>[S.explainQ.done, S.explainLog]);
  // duo step
  await p.evaluate(()=>{ S.missions[2]={c:8,n:10,pts:1,date:todayStr()}; S.start=addDays(todayStr(),-1); go('home'); });
  out.step = await p.evaluate(()=>nextStep());
  await p.screenshot({path:'/tmp/claude-0/img/v16_duo.png'});
  await p.click('[data-act="duo"]'); await sleep(100);
  out.duo = await p.evaluate(()=>[S.cur.duo, S.cur.qs.length, !!document.querySelector('.duo'), !!document.querySelector('.thinkbar')]);
  await p.evaluate(()=>{ const c=S.cur; c.qs.forEach((q,k)=>{ c.i=k; c.qStart=Date.now()-30000; if(q.type==='order') answer(-1,q.correct); else if(q.type==='num') answer(-1,String(q.ansv)); else answer(q.answer); }); finish(); });
  out.duoDone = await p.evaluate(()=>[S.duoWeek, S.dia, nextStep()]);
  await p.evaluate(()=>{ S.pin='1'; PARENT_OK=true; go('parent'); });
  out.parent = await p.evaluate(()=>[document.querySelectorAll('section')[1]?.textContent.slice(0,60), document.querySelector('.rmore')?.textContent]);
  console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs); await b.close();
})();

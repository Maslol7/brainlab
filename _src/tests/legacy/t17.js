const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:844} });
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  const html=require('fs').readFileSync('index.html','utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  await p.waitForTimeout(300); await p.evaluate(()=>{ minSecs = () => 0; S.rh = Array(10).fill(0); });
  const out = {};
  // force MC question at index 0
  await p.evaluate(() => { startMission('daily', 1); const c=S.cur; c.intro=false; c.qs[0]=genFamily(1); c.qs[0].d=1; c.qStart=Date.now(); renderQuiz(); });
  out.mist0 = await p.evaluate(()=>S.mist.length);
  const wrong = await p.evaluate(()=>{ S.cur.qStart=Date.now()-30000; S.rh=Array(10).fill(0); renderQuiz(); const q=S.cur.qs[0]; return [0,1,2,3].find(i=>i!==q.answer); });
  await p.waitForTimeout(420); await p.click(`[data-opt="${wrong}"]`); await p.waitForTimeout(200);
  out.retry = await p.$eval('.retry', e=>e.textContent).catch(()=>null);
  out.gone = await p.$eval('.opt.gone', e=>e.disabled).catch(()=>null);
  out.mist1 = await p.evaluate(()=>S.mist.map(m=>[m.box,m.due]));
  const right = await p.evaluate(()=>S.cur.qs[0].answer);
  await p.waitForTimeout(420); await p.click(`[data-opt="${right}"]`); await p.waitForTimeout(200);
  out.fb = await p.$eval('.fb', e=>e.textContent.slice(0,140));
  out.res = await p.evaluate(()=>S.cur.res[0]);
  out.mist2 = await p.evaluate(()=>S.mist.map(m=>[m.box,m.due]));
  await p.screenshot({path:'/tmp/claude-0/img/v10_fb.png'});
  // next question: wrong twice
  await p.waitForTimeout(420); await p.click('[data-act="next"]'); await p.waitForTimeout(150);
  await p.evaluate(()=>{ const c=S.cur; c.qs[1]=genMagic(2); c.qs[1].d=2; delete c.qs[1].type; renderQuiz(); });
  await p.screenshot({path:'/tmp/claude-0/img/v10_magic.png'});
  for (let k=0;k<2;k++){ const w = await p.evaluate(()=>{ const q=S.cur.qs[1]; return [0,1,2,3].find(i=>i!==q.answer && !document.querySelector(`[data-opt="${i}"]`).disabled); }); await p.waitForTimeout(420); await p.click(`[data-opt="${w}"]`); await p.waitForTimeout(150); }
  out.fb2 = await p.$eval('.fb', e=>e.textContent.slice(0,200));
  out.mist3 = await p.evaluate(()=>S.mist.map(m=>[m.box,m.due,m.q.lk]));
  // simulate tomorrow: make all due now, start review
  await p.evaluate(()=>{ S.cur=null; S.mist.forEach(m=>m.due=todayStr()); startMission('review'); S.cur.intro=false; S.cur.qStart=Date.now()-30000; renderQuiz(); });
  out.rev = await p.evaluate(()=>S.cur.qs.map(q=>[q.twin||false,q.lk,q.d]));
  out.tag = await p.$eval('.qtop .tag', e=>e.textContent);
  out.hintbox = await p.$eval('.hintbox', e=>e.textContent).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v10_twin.png'});
  // answer each twin correctly
  const n = await p.evaluate(()=>S.cur.qs.length);
  for (let i=0;i<n;i++){ const r = await p.evaluate(()=>S.cur.qs[S.cur.i].answer); await p.waitForTimeout(420); await p.click(`[data-opt="${r}"]`); await p.waitForTimeout(120); out['fbrev'+i]=await p.$eval('.mnote',e=>e.textContent).catch(()=>null); if(i<n-1){ await p.waitForTimeout(420); await p.click('[data-act="next"]'); await p.waitForTimeout(100);} }
  out.mist4 = await p.evaluate(()=>S.mist.map(m=>[m.box,m.due]));
  // day after: originals
  await p.evaluate(()=>{ S.cur=null; S.mist.forEach(m=>m.due=todayStr()); startMission('review'); S.cur.intro=false; S.cur.qStart=Date.now()-30000; renderQuiz(); });
  out.rev2 = await p.evaluate(()=>S.cur ? S.cur.qs.map(q=>[q.twin||false,q.lk]) : [S.view, S.mist.map(m=>[m.box,m.due])]); const n2 = await p.evaluate(()=>S.cur.qs.length);
  for (let i=0;i<n2;i++){ const r = await p.evaluate(()=>S.cur.qs[S.cur.i].answer); await p.waitForTimeout(420); await p.click(`[data-opt="${r}"]`); await p.waitForTimeout(120); out['fbrev2'+i]=await p.$eval('.mnote',e=>e.textContent).catch(()=>null); if(i<n2-1){ await p.waitForTimeout(420); await p.click('[data-act="next"]'); await p.waitForTimeout(100);} }
  out.mist5 = await p.evaluate(()=>[S.mist.length, S.fixed]);
  // typed retry
  await p.evaluate(()=>{ S.cur=null; startMission('practice',1,'math'); S.cur.intro=false; const q=genMagic(1); q.type='num'; S.cur.qs[0]=q; renderQuiz(); });
  const ans = await p.evaluate(()=>S.cur.qs[0].ansv);
  for (const ch of String(ans+1)) await p.click(`[data-tk="${ch}"]`);
  await p.waitForTimeout(420); await p.click('[data-act="tcheck"]').catch(async()=>{ const acts = await p.$$eval('[data-act]', es=>es.map(e=>e.dataset.act)); out.acts=acts; });
  await p.waitForTimeout(150);
  out.retryTyped = await p.$eval('.retry', e=>e.textContent).catch(()=>null);
  console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs);
  await b.close();
})();

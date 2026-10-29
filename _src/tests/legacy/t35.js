const { chromium } = require('playwright');
const Y = require('fs').readFileSync('/tmp/claude-0/-home-claude/e7e891a2-9753-5667-a563-ce2627b20ddb/scratchpad/y/y4.json','utf8');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const html=require('fs').readFileSync('pwa/index.html','utf8');
  await ctx.route(/maslol7/, r => r.fulfill({body: r.request().url().includes('version.json') ? '{"v":"20"}' : html, contentType: r.request().url().includes('version.json') ? 'application/json':'text/html; charset=utf-8'}));
  await ctx.route(/firebaseio/, r => r.fulfill({body:'null', contentType:'application/json'}));
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
  await p.goto('https://maslol7.github.io/brainlab/'); await p.waitForTimeout(150);
  await p.evaluate(y => { const o = JSON.parse(y); o.missions = Object.fromEntries(Object.entries(o.missions).filter(([k,v])=>v)); o.view='home'; o.cur=null; localStorage.setItem('brainlab-yonatan-v1', JSON.stringify(o)); }, Y);
  await p.reload(); await p.waitForTimeout(300); const out={};
  out.mini = await p.$eval('.road.mini', e=>e.textContent.replace(/\s+/g,' ')).catch(()=>null);
  out.ms = await p.evaluate(()=>S.ms);
  await p.screenshot({path:'/tmp/claude-0/img/v20_home.png'});
  await p.click('.road.mini'); await p.waitForTimeout(150);
  out.full = await p.$eval('.road.full', e=>e.textContent.replace(/\s+/g,' ').slice(0,500)).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v20_road.png', fullPage:false});
  // guides
  for (const k of ['op','symbols','calendar','seating','order','ifthen','syll','groups','magic']) { await p.evaluate(k=>startGuide(k,'tips'), k); await p.waitForTimeout(80); let n=0; while (await p.$('[data-g="next"]')) { if (await p.$('[data-gq]')) { await p.click('[data-gq]'); await p.waitForTimeout(40); } await p.click('[data-g="next"]'); n++; await p.waitForTimeout(40);} out[k]=n; if (['op','calendar','seating','symbols'].includes(k)) await p.screenshot({path:`/tmp/claude-0/img/v20_${k}.png`}); await p.click('[data-g="done"]'); await p.waitForTimeout(60); }
  // calendar q check
  out.calQ = await p.evaluate(()=>{ startGuide('calendar','tips'); G.i=1; renderGuide(); const st=G.steps[1]; return st.q ? [st.q.label, st.q.options, st.q.correct] : null; });
  await p.screenshot({path:'/tmp/claude-0/img/v20_cal2.png'});
  // stage up via finish of a 70% mission
  out.stage = await p.evaluate(()=>{ G=null; S.missions[8]={c:8,n:10,pts:1,date:todayStr()}; startMission('daily',9); const c=S.cur; c.intro=false; c.qs.forEach((q,i)=>{ c.i=i; c.qStart=Date.now()-30000; if(q.type==='order') answer(-1,q.correct); else if(q.type==='num') answer(-1,String(q.ansv)); else answer(q.answer); }); c.champOffered=true; finish(); return [S.last.road, S.ms, S.dia, document.querySelector('.roadban')?.textContent]; });
  await p.screenshot({path:'/tmp/claude-0/img/v20_result.png'});
  out.report = await p.evaluate(()=>{ const o=JSON.parse(JSON.stringify(S)); return reportHTML(o,true).match(/הדרך למחוננים[^<]*<b>[^<]*/)?.[0]; });
  console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs); await b.close();
})();

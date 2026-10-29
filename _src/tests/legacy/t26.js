const { chromium } = require('playwright');
const Y = require('fs').readFileSync('/tmp/claude-0/-home-claude/e7e891a2-9753-5667-a563-ce2627b20ddb/scratchpad/y/y.json','utf8');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
  const html=require('fs').readFileSync('pwa/index.html','utf8');
  await ctx.route(/maslol7/, r => r.fulfill({body: r.request().url().includes('version.json') ? '{"v":"15"}' : html, contentType: r.request().url().includes('version.json') ? 'application/json' : 'text/html; charset=utf-8'}));
  await p.goto('https://maslol7.github.io/brainlab/'); await p.waitForTimeout(200);
  await p.evaluate(y => { const o = JSON.parse(y); o.missions = Object.fromEntries(Object.entries(o.missions).filter(([k,v])=>v)); o.view='home'; o.cur=null; o.pin='1234'; localStorage.setItem('brainlab-yonatan-v1', JSON.stringify(o)); }, Y);
  await p.reload();
  await p.waitForTimeout(300); const out={};
  out.init = await p.evaluate(()=>({mist:S.mist.length, rh:S.rh, rate:rushRate(), done:doneCount(S)}));
  // mission: think mode should block options at first
  await p.evaluate(()=>{ startMission('daily', 5); S.cur.intro=false; S.cur.qs[0]=genFamily(1); S.cur.qStart=Date.now(); renderQuiz(); });
  out.think = await p.evaluate(()=>[!!document.querySelector('.thinkbar'), document.querySelector('.opts').classList.contains('think'), document.querySelector('[data-opt="0"]').disabled]);
  await p.screenshot({path:'/tmp/claude-0/img/v15_think.png'});
  await p.waitForTimeout(6500);
  out.afterWait = await p.evaluate(()=>[!!document.querySelector('.thinkbar'), document.querySelector('[data-opt="0"]').disabled]);
  // rushed tap: reset qStart to now with think disabled
  await p.evaluate(()=>{ S.rh=Array(10).fill(0); S.cur.think=false; S.cur.i=1; S.cur.qs[1]=genFamily(1); S.cur.qStart=Date.now(); renderQuiz(); });
  await p.evaluate(()=>answer((S.cur.qs[1].answer+1)%4)); await p.waitForTimeout(100);
  out.nudge = await p.evaluate(()=>[document.querySelector('.nudge')?.textContent, !!S.cur.res[1], S.cur.nudged]);
  await p.screenshot({path:'/tmp/claude-0/img/v15_nudge.png'});
  // second tap wrong (still rushed): no retry, answer shown, not in notebook
  const m0 = await p.evaluate(()=>S.mist.length);
  await p.evaluate(()=>answer((S.cur.qs[1].answer+1)%4)); await p.waitForTimeout(100);
  out.second = await p.evaluate(()=>[!!document.querySelector('.retry'), !!document.querySelector('.fb'), S.cur.res[1] && S.cur.res[1].rush, S.mist.length]);
  out.m0 = m0;
  // a real (slow) wrong answer -> retry allowed
  await p.evaluate(()=>{ nextQ(); const c=S.cur; c.qs[c.i]=genFamily(1); c.qStart=Date.now()-20000; renderQuiz(); answer((c.qs[c.i].answer+1)%4); });
  out.realRetry = await p.evaluate(()=>!!document.querySelector('.retry'));
  // report
  await p.evaluate(()=>{ S.cur=null; PARENT_OK=true; go('parent'); });
  out.report = await p.$eval('.report', e=>e.textContent.replace(/\s+/g,' ').slice(0,700));
  await p.screenshot({path:'/tmp/claude-0/img/v15_report.png'});
  console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs); await b.close();
})();

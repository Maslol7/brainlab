const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
  const html=require('fs').readFileSync('index.html','utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  await p.waitForTimeout(200); const out={};
  // seed realistic history: started 6 days ago, did 4 missions on 4 days
  await p.evaluate(()=>{ const t=todayStr(); S.start=addDays(t,-5); S.missions={1:{c:8,n:10,pts:120,date:addDays(t,-5)},2:{c:9,n:10,pts:150,date:addDays(t,-4)},3:{c:7,n:10,pts:100,date:addDays(t,-2)},4:{c:9,n:10,pts:160,date:addDays(t,-1)}}; S.lastDone=addDays(t,-1); S.streak=2; S.best=2;
    S.stats={verbal:{c:10,t:14},analog:{c:5,t:8},series:{c:7,t:8},logic:{c:4,t:9},math:{c:6,t:8},matrix:{c:5,t:6},spatial:{c:2,t:3},code:{c:2,t:3}}; S.times={verbal:{s:600,n:14},math:{s:640,n:8},logic:{s:700,n:9}}; S.hard={logic:{c:2,t:6},series:{c:5,t:6},verbal:{c:5,t:7}}; S.mist=[{id:'a',q:{},due:t,box:0}]; S.fixed=3; S.dia=3; S.pin='1234'; save(); go('home'); });
  out.homeHelp = await p.$eval('.diagoal', e=>e.textContent).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v14_home.png'});
  await p.click('.pill[data-act="diasheet"]'); await p.waitForTimeout(150);
  out.sheet = await p.$eval('.diasheet', e=>e.textContent.slice(0,400));
  await p.screenshot({path:'/tmp/claude-0/img/v14_sheet.png'});
  await p.evaluate(()=>{ document.querySelector('.modal')?.remove(); startMission('daily', 5); });
  out.intro = await p.$eval('.diagoal', e=>e.textContent).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v14_intro.png'});
  await p.evaluate(()=>{ S.cur=null; PARENT_OK=true; go('parent'); });
  out.report = await p.$eval('.report', e=>e.textContent.slice(0,600));
  await p.screenshot({path:'/tmp/claude-0/img/v14_report.png', fullPage:false});
  out.viewer = await p.evaluate(()=>{ const o=JSON.parse(JSON.stringify(S)); o._at=new Date().toISOString(); return viewerHTML(o).includes('דוח מצב'); });
  console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs); await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const html=require('fs').readFileSync('pwa/index.html','utf8'); const out={};
  const store = {};
  const fb = async r => { const u = new URL(r.request().url()); const key = decodeURIComponent(u.pathname.replace('/brainlab/','').replace('.json','')); if (r.request().method()==='PUT') { store[key] = JSON.parse(r.request().postData()); return r.fulfill({body:'{}',contentType:'application/json'}); } return r.fulfill({ body: JSON.stringify(store[key] ?? null), contentType:'application/json' }); };
  const site = r => r.fulfill({body: r.request().url().includes('version.json') ? '{"v":"23"}' : html, contentType: r.request().url().includes('version.json') ? 'application/json':'text/html; charset=utf-8'});
  const mk = async (url='https://maslol7.github.io/brainlab/') => { const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:360,height:780} }); await ctx.route(/firebaseio/, fb); await ctx.route(/maslol7/, site); const p = await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); await p.goto(url); await p.waitForTimeout(200); return p; };
  // A. second-try not counted
  const p = await mk();
  out.second = await p.evaluate(()=>{ minSecs=()=>0; startMission('daily',1); const c=S.cur; c.intro=false; c.qs.forEach((q,i)=>{ c.qs[i]=genFamily(1); }); c.qs.forEach((q,i)=>{ c.i=i; c.qStart=Date.now()-30000; answer((q.answer+1)%4); answer(q.answer); }); c.champOffered=true; finish(); return [S.last.correct, S.last.n, S.dia, S.missions[1].c]; });
  // B. timer expiry after leaving boss
  out.expire = await p.evaluate(async ()=>{ S.cur=null; startMission('boss',7); const c=S.cur; c.intro=false; c.deadline=Date.now()-1000; S.view='quiz'; render(); await new Promise(r=>setTimeout(r,2500)); return [S.view, S.cur]; });
  // C. sanitize Firebase-shaped / broken state
  await p.evaluate(()=>{ const bad = { start:'2026-10-21', missions:[null,{c:5,n:10,pts:1,date:'2026-10-22'}], mist:{a:{id:'x',q:{cat:'nope'},due:'2026-10-22',box:0}}, rh:{0:1,1:0}, stats:null, exam:null, view:'result', last:{kind:'daily'}, cur:{qs:[{cat:'zzz'}],i:0} }; localStorage.setItem('brainlab-yonatan-v1', JSON.stringify(bad)); });
  await p.reload(); await p.waitForTimeout(400);
  out.sanitize = await p.evaluate(()=>[S.view, doneCount(S), Array.isArray(S.mist), S.mist.length, !!document.querySelector('.hero'), S.exam]);
  out.errsA = p.errs.slice(0,3);
  // D. connect kid with an existing code: offers restore
  const code='KIDCODE12345678'; store[code] = { start:'2026-10-21', xp:900, missions:{1:{c:9,n:10,pts:1,date:'2026-10-22'},2:{c:8,n:10,pts:1,date:'2026-10-23'}}, _prof:'yonatan', _at:new Date().toISOString(), dia:5, stats:{}, times:{}, rat:{}, mist:[] };
  const k = await mk();
  await k.evaluate(()=>{ S.pin='1'; PARENT_OK=true; go('parent'); });
  await k.fill('#curl','https://x-default-rtdb.firebaseio.com'); await k.fill('#ccode', code); await k.click('[data-act="ckid"]'); await k.waitForTimeout(400);
  out.connectModal = await k.$eval('.modal', e=>e.textContent.slice(0,80)).catch(()=>null);
  out.cloudUntouched = store[code].xp;
  await k.click('.modal [data-m="load"]'); await k.waitForTimeout(200); await k.click('.modal .btn-boss, .modal .btn-primary').catch(()=>{}); await k.waitForTimeout(600);
  out.afterLoad = await k.evaluate(()=>[doneCount(S), S.xp, S.dia, JSON.parse(localStorage.getItem('bl-cloud')||'{}').role]);
  // E. stale device must not overwrite
  const old = await mk();
  await old.evaluate(c=>{ localStorage.setItem('bl-cloud', JSON.stringify({url:'https://x-default-rtdb.firebaseio.com', code:c, role:'kid'})); }, code);
  await old.reload(); await old.waitForTimeout(200);
  out.stale = await old.evaluate(async ()=>{ S.xp=10; const ok = await cloudPut(); return [ok, cloudCfg().err]; });
  out.cloudStillGood = store[code].xp;
  // F. other profile code
  out.otherProf = await old.evaluate(async c=>{ localStorage.setItem('bl-profile','romi'); return 0; }, code);
  // G. friend reload before name
  const f = await mk('https://maslol7.github.io/brainlab/?friend=1');
  await f.reload(); await f.waitForTimeout(300);
  out.friendReload = await f.evaluate(()=>[!!document.querySelector('#gname'), location.search]);
  // H. seating plural & tempo
  out.texts = await p.evaluate(()=>{ let fem=0, bad=0; for(let i=0;i<400;i++){ const q=genSeating(2); const t=q.vis.replace(/<[^>]+>/g,' '); if(/יושבות זו ליד זו/.test(t)) fem++; } let tb=0; for(let i=0;i<300;i++){ const q=MT.tempo(1); if(/\d\.\d{3}/.test(q.ex)) tb++; } let neg=0; for(let i=0;i<500;i++){ const q=genOp(1); if(q.ansv<0) neg++; } return {fem, tempoFloat:tb, opNeg:neg}; });
  out.errs = [p.errs, k.errs, old.errs, f.errs].map(e=>e.slice(0,2));
  console.log(JSON.stringify(out,null,1)); await b.close();
})();

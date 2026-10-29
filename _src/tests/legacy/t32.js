const { chromium } = require('playwright');
const Y = require('fs').readFileSync('/tmp/claude-0/-home-claude/e7e891a2-9753-5667-a563-ce2627b20ddb/scratchpad/y/y3.json','utf8');
(async () => {
  const b = await chromium.launch();
  const html=require('fs').readFileSync('pwa/index.html','utf8');
  // fake Firebase with in-memory store
  const store = { 'KID': JSON.parse(Y), 'KID-p': null };
  const fb = async r => { const u = new URL(r.request().url()); const key = decodeURIComponent(u.pathname.replace('/brainlab/','').replace('.json','')); if (r.request().method()==='PUT') { store[key] = JSON.parse(r.request().postData()); return r.fulfill({body:'{}',contentType:'application/json'}); } return r.fulfill({ body: JSON.stringify(store[key] ?? null), contentType:'application/json' }); };
  const site = r => r.fulfill({body: r.request().url().includes('version.json') ? '{"v":"18"}' : html, contentType: r.request().url().includes('version.json') ? 'application/json':'text/html; charset=utf-8'});
  const mk = async () => { const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:390,height:844}, deviceScaleFactor:2 }); await ctx.route(/firebaseio/, fb); await ctx.route(/maslol7/, site); const p = await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); await p.goto('https://maslol7.github.io/brainlab/'); await p.waitForTimeout(150); return p; };
  const code = 'KID'.padEnd(15,'x'); store[code] = store.KID; store[code+'-p'] = null;
  const out = {};
  // DAD
  const dad = await mk();
  await dad.evaluate(c=>{ localStorage.setItem('bl-cloud', JSON.stringify({url:'https://x-default-rtdb.firebaseio.com', code:c, role:'dad'})); }, code);
  await dad.reload(); await dad.waitForTimeout(200);
  await dad.evaluate(()=>{ S.pin='1'; PARENT_OK=true; go('parent'); }); await dad.waitForTimeout(800);
  out.dadBalance = await dad.$eval('#dadpanel .dia-n', e=>e.textContent);
  out.noRewardsWarn = await dad.$eval('#dadpanel', e=>e.textContent.includes('עוד לא הגדרת פרסים'));
  await dad.click('[data-didea="0"]'); await dad.click('[data-act="dradd"]'); await dad.waitForTimeout(300);
  await dad.fill('#dbwhy', 'על המשימה של היום'); await dad.click('[data-dbonus="3"]'); await dad.waitForTimeout(300);
  out.dadAfter = await dad.$eval('#dadpanel', e=>e.textContent.replace(/\s+/g,' ').slice(0,260));
  out.pnode = store[code+'-p'];
  await dad.screenshot({path:'/tmp/claude-0/img/v18_dad.png', fullPage:true});
  // KID
  const kid = await mk();
  await kid.evaluate(([c,y])=>{ const o=JSON.parse(y); o.missions=Object.fromEntries(Object.entries(o.missions).filter(([k,v])=>v)); o.view='home'; o.cur=null; localStorage.setItem('brainlab-yonatan-v1', JSON.stringify(o)); localStorage.setItem('bl-cloud', JSON.stringify({url:'https://x-default-rtdb.firebaseio.com', code:c, role:'kid'})); }, [code, Y]);
  await kid.reload(); await kid.waitForTimeout(2000);
  out.kid = await kid.evaluate(()=>({dia:S.dia, rewards:S.rewards, applied:S.appliedB, toast: document.getElementById('toast')?.textContent}));
  // kid asks for reward -> voucher; dad approves
  await kid.evaluate(()=>{ S.dia = 20; save(); go('shop'); });
  await kid.click('[data-ask]'); await kid.waitForTimeout(100); await kid.click('.modal .btn-primary'); await kid.waitForTimeout(100);
  await kid.evaluate(()=>cloudPut());
  await kid.waitForTimeout(300);
  out.voucher = await kid.evaluate(()=>S.vouchers.map(v=>[v.t,v.state]));
  await dad.evaluate(()=>{ go('home'); go('parent'); }); await dad.waitForTimeout(800);
  await dad.click('[data-dvok]'); await dad.waitForTimeout(300);
  await kid.evaluate(()=>pullParent(true)); await kid.waitForTimeout(500);
  out.kidAfter = await kid.evaluate(()=>({dia:S.dia, v:S.vouchers.map(v=>[v.t,v.state]), toast: document.getElementById('toast')?.textContent}));
  console.log(JSON.stringify(out,null,1)); console.log('ERRS', dad.errs, kid.errs); await b.close();
})();

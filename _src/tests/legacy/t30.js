const { chromium } = require('playwright');
const Y = require('fs').readFileSync('/tmp/claude-0/-home-claude/e7e891a2-9753-5667-a563-ce2627b20ddb/scratchpad/y/y2.json','utf8');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const html=require('fs').readFileSync('pwa/index.html','utf8');
  let delay = 600;
  await ctx.route(/firebaseio|firebasedatabase/, async r => { await new Promise(x=>setTimeout(x,delay)); r.fulfill({ body: r.request().method()==='GET' ? Y : '{}', contentType:'application/json' }); });
  await ctx.route(/maslol7/, r => r.fulfill({body: r.request().url().includes('version.json') ? '{"v":"17"}' : html, contentType: r.request().url().includes('version.json') ? 'application/json':'text/html; charset=utf-8'}));
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
  await p.goto('https://maslol7.github.io/brainlab/'); await p.waitForTimeout(200);
  // dad phone setup
  await p.evaluate(()=>{ localStorage.setItem('bl-cloud', JSON.stringify({url:'https://brainlab-yonatan-default-rtdb.firebaseio.com', code:'testcode0000000XX', role:'dad'})); });
  await p.reload(); await p.waitForTimeout(300);
  const out={};
  out.homeBanner = await p.$eval('.dadban', e=>e.textContent).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v17_dadhome.png'});
  await p.evaluate(()=>{ S.pin='1234'; PARENT_OK=true; go('parent'); });
  out.loading = await p.$eval('#dadreport', e=>e.textContent.trim().slice(0,60));
  await p.waitForTimeout(1200);
  out.report = await p.$eval('#dadreport', e=>e.textContent.replace(/\s+/g,' ').slice(0,900));
  await p.screenshot({path:'/tmp/claude-0/img/v17_dadreport.png', fullPage:true});
  // the old button
  await p.click('[data-act="cview"]').catch(()=>{}); await p.waitForTimeout(1200);
  out.cview = await p.$eval('#cviewbox', e=>e.textContent.replace(/\s+/g,' ').slice(0,80)).catch(()=>null);
  // cached second visit: instant
  delay = 3000; await p.evaluate(()=>{ go('home'); go('parent'); }); await p.waitForTimeout(100);
  out.cachedInstant = await p.$eval('#dadreport', e=>e.textContent.includes('דוח מצב'));
  console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs); await b.close();
})();

const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext();
 const html=require('fs').readFileSync('pwa/index.html','utf8');
 let hits=[]; await ctx.route(/maslol7/, r => { hits.push(r.request().url()); r.fulfill({body:html, contentType:'text/html; charset=utf-8'}); });
 const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>errs.push('C '+m.text()));
 await p.goto('https://maslol7.github.io/brainlab/'); await p.waitForTimeout(500);
 console.log(hits, errs, await p.evaluate(()=>[typeof PROF, typeof S, document.title, document.scripts.length, (document.scripts[0]||{}).text?.length]));
 await b.close(); })();

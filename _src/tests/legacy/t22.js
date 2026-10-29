const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' | ')));
 const html=require('fs').readFileSync('index.html','utf8'); await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200); console.log(errs); await b.close(); })();

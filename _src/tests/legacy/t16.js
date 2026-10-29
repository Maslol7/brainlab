const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:844} });
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  const html=require('fs').readFileSync('index.html','utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  await p.waitForTimeout(300);
  const gen = await p.evaluate(() => {
    const bad=[], samples={};
    const chk=(name,q)=>{ const s=JSON.stringify(q); if(s.includes('undefined')||s.includes('NaN')) bad.push(name+': undef '+s.slice(0,200));
      if(q.options){ if(new Set(q.options).size!==q.options.length) bad.push(name+': dup '+q.options.join('|')); if(!(q.answer>=0&&q.answer<q.options.length)) bad.push(name+': ans'); }
      (samples[name]=samples[name]||[]).length<2 && samples[name].push(q.prompt.replace(/<[^>]+>/g,'')+' || '+(q.vis||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,200)+' || '+(q.options||[]).map(o=>o.replace(/<[^>]+>/g,'')).join(' / ')+' || ANS '+(q.options?q.options[q.answer].replace(/<[^>]+>/g,''):'')+' || '+q.ex.slice(0,160)); };
    for(let d=1;d<=4;d++) for(let k=0;k<300;k++){ chk('magic'+d,genMagic(d)); chk('syll'+d,genSyll(d)); chk('groups'+d,genGroups(d)); chk('fam'+d,genFamily(d)); chk('logic'+d,GEN.logic(d)); }
    // twins
    let tw=0, tn=0; const cats=['verbal','analog','series','matrix','spatial','math','logic','code','reading'];
    const miss={};
    for(const c of cats) for(let k=0;k<25;k++){ const q=mkQ(c,3); const t=makeTwin(q); tn++; if(t){tw++; if(lessonFor(t)!==lessonFor(q)) bad.push('twin key');} else miss[lessonFor(q)]=(miss[lessonFor(q)]||0)+1; }
    return {bad:bad.slice(0,15), nbad:bad.length, samples, twin: tw+'/'+tn, miss};
  });
  console.log(JSON.stringify(gen,null,1));
  console.log('ERRS', errs);
  await b.close();
})();

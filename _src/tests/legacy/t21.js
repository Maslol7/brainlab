const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1]));
  const html=require('fs').readFileSync('index.html','utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  await p.waitForTimeout(200); const out={};
  out.parse = await p.evaluate(()=>{ const bad=[]; SONGS.forEach(s=>s.sec.forEach(x=>x.c.forEach(c=>{ const n=chordNotes(c); if(!n) bad.push(s.id+':'+c); else if (n.rh.some(m=>m<48||m>83)) bad.push('range '+c); }))); return {bad, n:SONGS.length, ats: SONGS.map(s=>s.at).join(',')}; });
  out.cmaj = await p.evaluate(()=>[chordNotes('C'), chordNotes('Am/G'), chordNotes('E7'), chordNotes('Bb')]);
  await p.evaluate(()=>go('arcade')); out.tile = await p.$eval('[data-go="songs"]', e=>e.textContent);
  await p.screenshot({path:'/tmp/claude-0/img/v12_arcade.png'});
  await p.click('[data-go="songs"]'); await p.waitForTimeout(100);
  out.list = await p.$$eval('.song', es=>es.length + ' / open ' + es.filter(e=>!e.classList.contains('locked')).length);
  await p.screenshot({path:'/tmp/claude-0/img/v12_list.png'});
  await p.click('[data-song="letitbe"]'); await p.waitForTimeout(100);
  await p.click('[data-chord="Am"]'); await p.waitForTimeout(100);
  out.kbl = await p.$eval('.kbl', e=>e.textContent);
  await p.click('[data-loop="0"]'); await p.waitForTimeout(2500);
  out.loopBeat = await p.$eval('.ch.beat', e=>e.textContent).catch(()=>null);
  await p.screenshot({path:'/tmp/claude-0/img/v12_song.png'});
  await p.click('[data-go="home"]'); await p.waitForTimeout(100);
  out.loopStopped = await p.evaluate(()=>SL===null && S.view);
  // unlock banner: 2 missions done, finishing 3rd unlocks song 3
  out.banner = await p.evaluate(async()=>{ const sleep=ms=>new Promise(r=>setTimeout(r,ms)); S.missions={1:{c:8,n:10,pts:100,date:todayStr()},2:{c:8,n:10,pts:100,date:todayStr()}}; startMission('daily',3); const c=S.cur; c.intro=false; c.qs.forEach((q,i)=>{ c.i=i; if(q.type==='order') answer(-1,q.correct); else if(q.type==='num') answer(-1,String(q.ansv)); else answer(q.answer); }); c.champOffered=true; finish(); await sleep(50); return document.querySelector('.songban')?.textContent; });
  await p.screenshot({path:'/tmp/claude-0/img/v12_result.png'});
  await p.click('.songban'); await p.waitForTimeout(100);
  out.opened = await p.evaluate(()=>[S.view, S.songId]);
  await p.click('[data-song="sami"]').catch(()=>{});
  // check non-transposed note absent for sami, present for radio
  out.notes = await p.evaluate(()=>{ S.songId='sami'; render(); const a=document.querySelector('.card .muted.small').textContent; S.songId='radio'; render(); const b2=document.querySelector('.card .muted.small').textContent; return [a,b2]; });
  console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs);
  await b.close();
})();

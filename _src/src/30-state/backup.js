/* backup / restore (parent area) */
const backupName = () => `brainlab-${ME.name === 'יונתן' ? 'yonatan' : 'backup'}-${todayStr()}.json`;
function backupText() { const o = JSON.parse(JSON.stringify(S)); o.cur = null; delete o.pin; o._key = KEY; o._ver = APP_VER; o._at = new Date().toISOString(); return JSON.stringify(o); }
async function doBackup() {
  save();
  const txt = backupText(), file = new File([txt], backupName(), { type: 'application/json' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: `גיבוי של מעבדת המוח, ${todayStr().split('-').reverse().join('.')}` }); S.lastBackup = todayStr(); save(); render(); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" style="max-width:420px"><h4>קוד גיבוי</h4><p>מעתיקים את כל הטקסט ושומרים אותו במקום בטוח, למשל בהודעה לעצמך בוואטסאפ.</p><textarea class="txt" readonly style="width:100%;height:120px;font-size:.7rem;direction:ltr">${esc(txt)}</textarea><div class="rw" style="margin-top:10px"><button class="btn btn-primary" data-m="copy">העתק</button><button class="btn btn-ghost" data-m="no">סגור</button></div></div>`;
  app.appendChild(m);
  m.addEventListener('click', async e => { if (e.target === m || e.target.closest('[data-m="no"]')) m.remove(); else if (e.target.closest('[data-m="copy"]')) { try { await navigator.clipboard.writeText(txt); toast('הועתק'); S.lastBackup = todayStr(); save(); } catch (er) { const ta = m.querySelector('textarea'); ta.select(); toast('סמן והעתק ידנית'); } } });
}
function restoreFrom(txt) {
  let o; try { o = JSON.parse(txt); } catch (e) { return toast('הקובץ או הקוד לא תקינים.'); }
  if (!o || !o.start || !o.missions) return toast('זה לא נראה כמו גיבוי של מעבדת המוח.');
  normCloud(o);
  const n = Object.keys(o.missions).length;
  modal('לשחזר מהגיבוי?', `בגיבוי: ${n} משימות, ${o.xp || 0} נקודות, ${o.dia || 0} יהלומים, מתאריך ${String(o._at || '').slice(0, 10).split('-').reverse().join('.')}. ההתקדמות הנוכחית בטלפון הזה תוחלף.`, 'לשחזר', () => {
    delete o._key; delete o._ver; delete o._at; o.cur = null; o.view = 'home'; if (!o.pin) o.pin = S.pin;
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { return toast('השמירה נכשלה.'); }
    location.reload();
  }, 'btn-boss');
}
function backupSection() {
  const lb = S.lastBackup ? `גיבוי אחרון: ${S.lastBackup.split('-').reverse().join('.')}` : 'עוד לא נעשה גיבוי';
  const old = !S.lastBackup || dayDiff(S.lastBackup, todayStr()) >= 7;
  return `<section class="card stack" style="gap:10px"><h4 style="font-size:1.15rem">גיבוי ושחזור</h4>
  <p class="small muted" style="margin:0">ההתקדמות נשמרת רק בטלפון הזה, לא בשרת. אם הטלפון יתאפס או שינקו את הנתונים של Chrome, היא תימחק. גיבוי שולח קובץ קטן (למשל אליך בוואטסאפ), ואיתו אפשר לשחזר הכל, גם בטלפון אחר.</p>
  <div class="small" style="color:${old ? 'var(--gold)' : 'var(--good)'}">${lb}${old ? ' · מומלץ לגבות פעם בשבוע' : ''}</div>
  <div class="row"><button class="btn btn-gold" data-act="backup" style="flex:1;min-height:46px">גיבוי עכשיו</button><label class="btn btn-ghost" for="restoref" style="flex:1;min-height:46px">שחזור מקובץ</label><input type="file" id="restoref" accept=".json,application/json,text/plain" hidden></div>
  <details class="small muted"><summary>שחזור מקוד שהועתק</summary><textarea class="txt" id="restoret" style="width:100%;height:80px;margin-top:6px;direction:ltr;font-size:.75rem" placeholder="הדבק כאן את קוד הגיבוי"></textarea><button class="btn btn-ghost" data-act="restoret" style="margin-top:6px;min-height:40px;width:100%">שחזור מהקוד</button></details></section>`;
}

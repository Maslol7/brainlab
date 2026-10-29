async function cloudGet(c) {
  try {
    const r = await fetch(cloudPath(c) + '?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return { err: 'שגיאה ' + r.status };
    const data = await r.json(); if (data) normCloud(data);
    return { data };
  } catch (e) { return { err: 'אין חיבור' }; }
}
function cloudSection() {
  if (isSbx()) return '<section class="card small muted">ענן: לא זמין במצב בדיקה.</section>';
  if (S.guest) return '';
  const c = cloudCfg();
  if (c.url && c.code) {
    const kid = c.role === 'kid';
    return `<section class="card stack" style="gap:10px"><h4 style="font-size:1.15rem">ענן</h4>
    <div class="row small"><span class="dot-st ${c.err ? 'bad' : 'ok'}"></span><span class="grow">${kid ? `הטלפון של ${ME.name} · שומר לענן` : 'הטלפון של אבא · צפייה בלבד'}${kid ? ` · סונכרן ${agoTxt(c.last)}` : ''}${c.err ? ` · <b style="color:var(--bad)">${c.err}</b>` : ''}</span></div>
    <div class="small muted">קוד משפחה: <b class="ltr" style="color:var(--ink)">${c.code}</b></div>
    <div class="row" style="flex-wrap:wrap">${kid ? '<button class="chip" data-act="csync">סנכרן עכשיו</button><button class="chip" data-act="cpull">טען מהענן</button>' : '<button class="btn btn-primary" data-act="cview" style="flex:1;min-height:44px">ההתקדמות של ' + ME.name + '</button>'}<button class="chip" data-act="coff">נתק</button></div><div id="cviewbox"></div></section>`;
  }
  return `<section class="card stack" style="gap:10px"><h4 style="font-size:1.15rem">ענן (לא חובה)</h4>
  <p class="small muted" style="margin:0">גיבוי אוטומטי, ואפשרות לראות את ההתקדמות מהטלפון שלך. בלי ענן הכל ממשיך לעבוד כרגיל.</p>
  <input class="txt" id="curl" value="brainlab-yonatan" placeholder="מזהה הפרויקט או כתובת מסד הנתונים" style="direction:ltr">
  <input class="txt" id="ccode" placeholder="קוד משפחה (ריק = קוד חדש)" style="direction:ltr">
  <div class="row"><button class="btn btn-primary" data-act="ckid" style="flex:1;min-height:44px;font-size:.92rem">זה הטלפון של ${ME.name}</button><button class="btn btn-ghost" data-act="cdad" style="flex:1;min-height:44px;font-size:.92rem">זה הטלפון של אבא</button></div>
  <p class="small" id="cmsg" style="margin:0;color:var(--bad)"></p>
  <details class="small muted"><summary>איך מקבלים כתובת (5 דקות, פעם אחת)</summary><ol style="margin:6px 0 0;padding-inline-start:18px;line-height:1.7"><li>console.firebase.google.com ← Create project (בלי Analytics).</li><li>Build ← Realtime Database ← Create database ← Locked mode.</li><li>בלשונית Rules מדביקים את הכללים שלמטה ← Publish.</li><li>מעתיקים את הכתובת שמופיעה למעלה (מסתיימת ב-firebasedatabase.app).</li></ol><textarea class="txt" readonly style="width:100%;height:56px;margin-top:6px;direction:ltr;font-size:.72rem">${FB_RULES}</textarea></details></section>`;
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

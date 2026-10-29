const CLOUD_KEY = PROF.cloud;
const cloudCfg = () => { try { return JSON.parse(localStorage.getItem(CLOUD_KEY)) || {}; } catch (e) { return {}; } };
const cloudSet = c => { try { localStorage.setItem(CLOUD_KEY, JSON.stringify(c)); } catch (e) { } };
const cloudOn = () => { const c = cloudCfg(); return !!(c.url && c.code); };
const newCode = () => { const a = new Uint8Array(15); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = ri(0, 255)); return Array.from(a, b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join(''); };
const cloudPath = c => `${c.url.replace(/\/+$/, '')}/brainlab/${c.code}.json`;
function cloudPayload() { const o = JSON.parse(JSON.stringify(S)); o.cur = null; delete o.pin; delete o.cloudForce; o._at = new Date().toISOString(); o._ver = APP_VER; o._prof = PROF.id; return JSON.stringify(o); }
let cloudT = null;
function cloudSoon() { const c = cloudCfg(); if (!c.url || !c.code || c.role !== 'kid' || isSbx()) return; clearTimeout(cloudT); cloudT = setTimeout(cloudPut, 6000); }
async function cloudPut() {
  const c = cloudCfg(); if (!c.url || !c.code || c.role !== 'kid' || isSbx()) return false;
  try {
    if (!S.cloudForce) {
      const g = await cloudGet(c);
      if (g.err) { c.err = g.err; cloudSet(c); return false; }
      const R0 = g.data;
      if (R0 && R0._prof && R0._prof !== PROF.id) { c.err = 'הקוד שייך לפרופיל אחר'; cloudSet(c); return false; }
      if (R0 && (R0.xp || 0) > (S.xp || 0) && Object.keys(R0.missions || {}).length >= doneCount(S)) { c.err = 'בענן יש התקדמות חדשה יותר. אפשר לטעון אותה ("טען מהענן")'; cloudSet(c); return false; }
    }
    const r = await fetch(cloudPath(c), { method: 'PUT', body: cloudPayload() }); c.err = r.ok ? null : 'שגיאה ' + r.status; if (r.ok) { c.last = Date.now(); if (S.cloudForce) { S.cloudForce = 0; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } } }
  }
  catch (e) { c.err = 'אין חיבור'; }
  cloudSet(c); return !c.err;
}
async function cloudGet(c) {
  try {
    const r = await fetch(cloudPath(c) + '?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return { err: 'שגיאה ' + r.status };
    const data = await r.json(); if (data) normCloud(data);
    return { data };
  } catch (e) { return { err: 'אין חיבור' }; }
}
const agoTxt = t => { if (!t) return 'עוד לא'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'עכשיו' : m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שע׳` : `לפני ${Math.round(m / 1440)} ימים`; };
const FB_RULES = '{"rules":{"brainlab":{"$code":{".read":"$code.length >= 15",".write":"$code.length >= 15"}}}}';
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
function bindCloud() {
  const on = (a, fn) => { const e = app.querySelector(`[data-act="${a}"]`); if (e) e.onclick = fn; };
  const msg = t => { const m = document.getElementById('cmsg'); if (m) m.textContent = t; };
  const connect = async role => {
    let url = (document.getElementById('curl').value || '').trim(); const code = (document.getElementById('ccode').value || '').trim() || (role === 'kid' ? newCode() : '');
    if (/^[a-z0-9-]+$/.test(url)) { msg('מחפש את מסד הנתונים...'); url = await findDb(url); if (!url) return msg('לא מצאתי Realtime Database בפרויקט הזה. צריך ליצור אותו (שלב 2) ולפרסם את הכללים (שלב 3).'); }
    if (!/^https:\/\/[^ ]+\.(firebaseio\.com|firebasedatabase\.app)\/?$/.test(url)) return msg('צריך מזהה פרויקט או כתובת של Firebase Realtime Database.');
    if (code.length < 15) return msg(role === 'kid' ? 'קוד קצר מדי.' : 'צריך להזין את קוד המשפחה מהטלפון של ' + ME.name + '.');
    msg(''); const c = { url, code, role };
    if (role === 'kid') {
      const typed = (document.getElementById('ccode').value || '').trim();
      if (typed) {
        const g = await cloudGet(c); if (g.err) return msg('לא הצלחתי לקרוא: ' + g.err);
        if (g.data && g.data._prof && g.data._prof !== PROF.id) return msg(`הקוד הזה שייך ל${(PROFILES[g.data._prof] || {}).name || 'פרופיל אחר'}. לכל ילד יש קוד משלו.`);
        if (g.data && Object.keys(g.data.missions || {}).length) return chooseCloudRestore(c, g.data);
      }
      cloudSet(c); S.cloudForce = 1; const ok = await cloudPut(); if (!ok) { msg('לא הצלחתי לשמור. בדוק את הכתובת ואת הכללים.'); cloudSet({}); return; }
    }
    else { const g = await cloudGet(c); if (g.err) return msg('לא הצלחתי לקרוא: ' + g.err); if (!g.data) return msg('אין עדיין נתונים בקוד הזה.'); cloudSet(c); }
    toast('מחובר לענן'); render();
  };
  on('ckid', () => connect('kid')); on('cdad', () => connect('dad'));
  on('coff', () => modal('לנתק מהענן?', 'הנתונים בטלפון לא נמחקים. מה שבענן נשאר שם.', 'נתק', () => { cloudSet({}); render(); }));
  on('csync', async () => { toast(await cloudPut() ? 'סונכרן' : 'הסנכרון נכשל'); render(); });
  on('cpull', async () => { const g = await cloudGet(cloudCfg()); if (g.err || !g.data) return toast(g.err || 'אין נתונים בענן'); const d = g.data; d.pin = S.pin; restoreFrom(JSON.stringify(d)); });
  on('cview', async () => { const box = document.getElementById('cviewbox'); box.innerHTML = '<div class="small muted">טוען...</div>'; const g = await cloudGet(cloudCfg()); box.innerHTML = g.err ? `<div class="small" style="color:var(--bad)">${g.err}</div>` : g.data ? viewerHTML(g.data) : '<div class="small muted">אין עדיין נתונים.</div>'; });
}
async function findDb(id) {
  const regs = ['', 'europe-west1', 'us-central1', 'asia-southeast1'];
  for (const r of regs) {
    const u = r ? `https://${id}-default-rtdb.${r}.firebasedatabase.app` : `https://${id}-default-rtdb.firebaseio.com`;
    try { const res = await fetch(`${u}/brainlab/probe_000000000000000.json`, { cache: 'no-store' }); if (res.status === 200 || res.status === 401) return u; } catch (e) { }
  }
  return null;
}
function chooseCloudRestore(c, data) {
  const n = Object.keys(data.missions || {}).length;
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" role="dialog" aria-modal="true"><h4>בענן כבר יש התקדמות</h4><p>בקוד הזה שמורות ${n} משימות${data._at ? `, עודכן ${agoTxt(Date.parse(data._at))}` : ''}. מה לעשות?</p><div class="stack" style="gap:8px"><button class="btn btn-primary" data-m="load">לטעון את ההתקדמות מהענן לטלפון הזה</button><button class="btn btn-ghost" data-m="over">להחליף את מה שבענן (${doneCount(S)} משימות בטלפון הזה)</button><button class="btn btn-ghost" data-m="no">ביטול</button></div></div>`;
  app.appendChild(m);
  m.addEventListener('click', async e => {
    const b = e.target.closest('[data-m]'); if (e.target === m || (b && b.dataset.m === 'no')) return m.remove(); if (!b) return;
    m.remove();
    if (b.dataset.m === 'load') { cloudSet(c); const d = normCloud(data); d.pin = S.pin; restoreFrom(JSON.stringify(d)); return; }
    modal('בטוח?', `ההתקדמות שבענן (${n} משימות) תימחק ותוחלף.`, 'כן, להחליף', async () => { cloudSet(c); S.cloudForce = 1; save(); await cloudPut(); toast('מחובר לענן'); render(); }, 'btn-boss');
  });
}
/* ---------- cloud: Firebase turns numbered keys into arrays with holes ---------- */
function normCloud(o) {
  if (!o || typeof o !== 'object') return o;
  if (Array.isArray(o.missions)) { const m = {}; o.missions.forEach((v, i) => { if (v) m[i] = v; }); o.missions = m; }
  ['mist', 'rh', 'moods', 'diaLog', 'vouchers', 'rewards', 'badges', 'mh', 'explainLog', 'duoLog', 'dadMsgs', 'appliedB', 'bugs'].forEach(k => { if (o[k] && !Array.isArray(o[k])) o[k] = Object.values(o[k]); if (Array.isArray(o[k])) o[k] = o[k].filter(x => x != null); });
  ['stats', 'times', 'rat', 'hard', 'aw', 'bdGift', 'seen', 'arcade', 'own', 'lessons', 'pb', 'firstD'].forEach(k => { if (o[k] == null) o[k] = {}; });
  return o;
}
/* 5. cloud requests never hang forever */
const fetchRaw = window.fetch.bind(window);
window.fetch = (u, o = {}) => {
  if (/firebaseio|firebasedatabase/.test(String(u)) && !o.signal && window.AbortController) { const ac = new AbortController(); setTimeout(() => ac.abort(), 9000); o = Object.assign({}, o, { signal: ac.signal }); }
  return fetchRaw(u, o);
};

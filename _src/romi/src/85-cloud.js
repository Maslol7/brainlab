/* ---------- cloud (optional): the same Firebase Realtime Database as מעבדת המוח, its own family code.
   Romi's phone writes her state to brainlab/<code>.json. Dad's phone writes only to brainlab/<code>-p.json (new lists, messages, a note, candies);
   Romi's phone reads that node and applies it. ---------- */
const CLOUD_KEY = 'salta-cloud';
const cloudCfg = () => { try { return JSON.parse(localStorage.getItem(CLOUD_KEY)) || {}; } catch (e) { return {}; } };
const cloudSet = c => { try { localStorage.setItem(CLOUD_KEY, JSON.stringify(c)); } catch (e) { } };
const isDad = () => { const c = cloudCfg(); return c.role === 'dad' && !!c.code; };
const isKidCloud = () => { const c = cloudCfg(); return c.role === 'kid' && !!c.code; };
let RKID = null, PDOC = null, CT = null, PULL_AT = 0;
const cPath = (c, s = '') => `${c.url.replace(/\/+$/, '')}/brainlab/${c.code}${s}.json`;
const agoTxt = t => { if (!t) return 'עוד לא'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'עכשיו' : m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שע׳` : `לפני ${Math.round(m / 1440)} ימים`; };
async function fetchT(u, o = {}) { const ac = window.AbortController ? new AbortController() : null; if (ac) setTimeout(() => ac.abort(), 9000); return fetch(u, Object.assign({ cache: 'no-store' }, o, ac ? { signal: ac.signal } : {})); }
async function cGet(c, s) { try { const r = await fetchT(cPath(c, s) + '?t=' + Date.now()); if (!r.ok) return { err: 'שגיאה ' + r.status }; return { data: await r.json() }; } catch (e) { return { err: 'אין חיבור' }; } }
async function pPut(c, P) { try { const r = await fetchT(cPath(c, '-p'), { method: 'PUT', body: JSON.stringify(P) }); return r.ok; } catch (e) { return false; } }
function cloudSoon() { if (!isKidCloud()) return; clearTimeout(CT); CT = setTimeout(cloudPut, 5000); }
async function cloudPut() {
  const c = cloudCfg(); if (c.role !== 'kid' || !c.code) return false;
  const o = JSON.parse(JSON.stringify(S)); delete o.pin; o.view = 'home'; o._at = new Date().toISOString(); o._app = 'salta'; o._ver = APP_VER;
  try { const r = await fetchT(cPath(c), { method: 'PUT', body: JSON.stringify(o) }); c.err = r.ok ? null : 'שגיאה ' + r.status; if (r.ok) c.last = Date.now(); }
  catch (e) { c.err = 'אין חיבור'; }
  cloudSet(c); return !c.err;
}
/* Romi's phone: apply what dad sent */
async function kidPull(force) {
  const c = cloudCfg(); if (c.role !== 'kid' || !c.code) return;
  if (!force && Date.now() - PULL_AT < 30000) return; PULL_AT = Date.now();
  const g = await cGet(c, '-p'); if (!g.data) return;
  const P = g.data, msgs = []; let ch = false;
  if (P.lv && P.lv !== S.plv) {
    const del = arr(P.del); S.lists = S.lists.filter(l => !del.includes(l.id));
    arr(P.lists).forEach(l => { l.words = arr(l.words).map(w => (w.he = arr(w.he), w)); const had = S.lists.some(x => x.id === l.id); S.lists = S.lists.filter(x => x.id !== l.id).concat([l]); if (!had) msgs.push(`רשימה חדשה מאבא: ${esc(l.t)}`); });
    S.plv = P.lv; ch = true;
  }
  if (P.mv && P.mv !== S.pmv) { S.dadMsgs = arr(P.dadMsgs); if (!S.dadMsgs.length) S.dadMsgs = null; S.pmv = P.mv; ch = true; }
  if (P.note && P.note.id !== S.noteId) { S.noteId = P.note.id; S.dadNote = P.note.t; ch = true; }
  if (P.vv && P.vv !== S.pvv) { S.pvv = P.vv; ch = true; voicePull(); }
  if (P.gift && P.gift.id !== S.giftId) { S.giftId = P.gift.id; addCandy(P.gift.n | 0); msgs.push(`אבא שלח לך ${P.gift.n} ממתקים!`); ch = true; }
  if (ch) { save(); if (['home', 'lists', 'shop'].includes(S.view) && !document.querySelector('.modal')) render(); }
  if (msgs.length) toast(msgs.join('<br>'), 4500);
}
/* dad's phone: read Romi's state and the parent node */
async function dadLoad() {
  const c = cloudCfg(); if (!isDad()) return;
  const [a, b] = await Promise.all([cGet(c), cGet(c, '-p')]);
  if (a.data) { RKID = a.data; RKID.lists = arr(RKID.lists).map(l => (l.words = arr(l.words).map(w => (w.he = arr(w.he), w)), l)); RKID.tests = arr(RKID.tests); RKID.p = RKID.p || {}; RKID.days = RKID.days || {}; }
  PDOC = b.data || PDOC || {};
  if (a.err) toast('לא הצלחתי לקרוא מהענן: ' + a.err);
}
const newCode = () => { const a = new Uint8Array(15); crypto.getRandomValues(a); return Array.from(a, b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join(''); };
async function findDb(id) {
  for (const r of ['', 'europe-west1', 'us-central1', 'asia-southeast1']) {
    const u = r ? `https://${id}-default-rtdb.${r}.firebasedatabase.app` : `https://${id}-default-rtdb.firebaseio.com`;
    try { const res = await fetchT(`${u}/brainlab/probe_000000000000000.json`); if (res.status === 200 || res.status === 401) return u; } catch (e) { }
  }
  return null;
}
function cloudSection() {
  const c = cloudCfg();
  if (c.code) return `<section class="card stack"><h3>ענן</h3><div class="small">${c.role === 'kid' ? `הטלפון של רומי · גיבוי ${agoTxt(c.last)}` : 'הטלפון של אבא'}${c.err ? ` · <b class="bad">${esc(c.err)}</b>` : ''}</div>
  <div class="small muted">קוד משפחה: <b dir="ltr" class="sel">${esc(c.code)}</b></div>
  <div class="row">${c.role === 'kid' ? '<button class="chip" data-act="csync">גבה עכשיו</button>' : '<button class="chip" data-act="gift">שלח 10 ממתקים</button>'}<button class="chip" data-act="coff">נתק</button></div></section>`;
  return `<section class="card stack"><h3>ענן (לא חובה)</h3><p class="small muted">גיבוי, ואפשרות להוסיף רשימות ולראות התקדמות מהטלפון של אבא. אותו Firebase של מעבדת המוח, עם קוד משפחה חדש לרומי.</p>
  <input class="txt" id="curl" dir="ltr" value="brainlab-yonatan" placeholder="Firebase project id"><input class="txt" id="ccode" dir="ltr" placeholder="קוד משפחה (ריק = קוד חדש)">
  <div class="row"><button class="btn btn-main grow" data-act="ckid">זה הטלפון של רומי</button><button class="btn btn-ghost grow" data-act="cdad">זה הטלפון של אבא</button></div><p class="small bad" id="cmsg"></p></section>`;
}
function bindCloud() {
  const msg = t => { const m = document.getElementById('cmsg'); if (m) m.textContent = t; };
  const connect = async role => {
    let url = document.getElementById('curl').value.trim(); const typed = document.getElementById('ccode').value.trim();
    if (/^[a-z0-9-]+$/.test(url)) { msg('מחפש את מסד הנתונים...'); url = await findDb(url); if (!url) return msg('לא מצאתי Realtime Database בפרויקט הזה.'); }
    if (!/^https:\/\/[^ ]+\.(firebaseio\.com|firebasedatabase\.app)\/?$/.test(url)) return msg('צריך מזהה פרויקט או כתובת של Firebase Realtime Database.');
    const code = typed || (role === 'kid' ? newCode() : ''); if (code.length < 15) return msg(role === 'kid' ? 'קוד קצר מדי.' : 'צריך את קוד המשפחה מהטלפון של רומי.');
    const c = { url, code, role };
    const g = await cGet(c); if (g.err) return msg('לא הצלחתי לקרוא: ' + g.err);
    if (g.data && g.data._app && g.data._app !== 'salta') return msg('הקוד הזה שייך למעבדת המוח. לסלטה צריך קוד משלה.');
    if (role === 'kid') {
      if (g.data && typed && (g.data.sessions || 0) > (S.sessions || 0)) {
        return modal('בענן כבר יש התקדמות', `שמורים שם ${g.data.sessions} אימונים. לטעון אותם לטלפון הזה?`, [['לטעון', () => { const pin = S.pin; S = norm(g.data); S.pin = pin; S.view = 'parent'; cloudSet(c); save(); render(); }], ['להחליף את מה שבענן', async () => { cloudSet(c); await cloudPut(); render(); }]]);
      }
      cloudSet(c); if (!await cloudPut()) { cloudSet({}); return msg('לא הצלחתי לשמור. בדוק את הכתובת ואת הכללים.'); }
    } else { if (!g.data) return msg('אין עדיין נתונים בקוד הזה.'); cloudSet(c); await dadLoad(); }
    toast('מחובר לענן'); render();
  };
  on('[data-act="ckid"]', () => connect('kid')); on('[data-act="cdad"]', () => connect('dad'));
  on('[data-act="coff"]', () => modal('לנתק מהענן?', 'שום דבר לא נמחק.', [['נתק', () => { cloudSet({}); RKID = null; PDOC = null; render(); }], ['ביטול']]));
  on('[data-act="csync"]', async () => { toast(await cloudPut() ? 'גובה' : 'הגיבוי נכשל'); render(); });
  on('[data-act="gift"]', async () => { PDOC = PDOC || {}; PDOC.gift = { id: Date.now(), n: 10 }; toast(await pPut(cloudCfg(), PDOC) ? 'נשלח! רומי תקבל כשתפתח את האפליקציה' : 'השליחה נכשלה'); });
}

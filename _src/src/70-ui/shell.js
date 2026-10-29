const APP_VER = '__VER__';
function toast(msg, ms = 2600) { let t = document.getElementById('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); } t.innerHTML = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms); }
async function remoteVer() { try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return null; return (await r.json()).v; } catch (e) { return null; } }
async function doUpdate() {
  toast('מעדכן...');
  save();
  try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); } catch (e) { }
  try { if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } } catch (e) { }
  location.reload();
}
function updBanner(v) {
  if (document.getElementById('updbar')) return;
  const b = document.createElement('div'); b.id = 'updbar';
  b.innerHTML = `<span>יש גרסה חדשה (${esc(v)})</span><button type="button">עדכן עכשיו</button>`;
  document.body.appendChild(b); b.querySelector('button').onclick = doUpdate;
}
async function checkUpdate(manual) {
  const v = await remoteVer();
  if (v == null) { if (manual) toast('אין חיבור לשרת כרגע. נסה שוב כשיש אינטרנט.'); return; }
  if (String(v) !== APP_VER) { if (S.cur && !manual) return updBanner(v); manual ? doUpdate() : updBanner(v); }
  else if (manual) toast(`זו הגרסה הכי חדשה (${APP_VER})`);
}
function bindUpdate() {
  const on = (a, fn) => { const e = app.querySelector(`[data-act="${a}"]`); if (e) e.onclick = fn; };
  on('chkupd', () => checkUpdate(true));
  on('backup', doBackup);
  on('restoret', () => { const t = document.getElementById('restoret').value.trim(); if (t) restoreFrom(t); });
  const f = document.getElementById('restoref'); if (f) f.onchange = () => { const file = f.files[0]; if (!file) return; const fr = new FileReader(); fr.onload = () => restoreFrom(fr.result); fr.readAsText(file); };
}
/* ---------- render core ---------- */
const app = document.getElementById('app');
let timers = [];
const later = (fn, ms) => { const h = setTimeout(fn, ms); timers.push(h); return h; };
const every = (fn, ms) => { const h = setInterval(fn, ms); timers.push(h); return h; };
function clearTimers() { timers.forEach(h => { clearTimeout(h); clearInterval(h); }); timers = []; }
function go(view) { S.view = view; save(); render(); window.scrollTo(0, 0); if (view === 'shop' || view === 'home') pullParent(); }
function applyTheme() { const r = document.documentElement; r.setAttribute('data-skin', S.skin || 'auto'); r.setAttribute('data-w', curWorld().k); }
/* draw the current screen; if a screen throws, fall back to home instead of a white page */
function render() {
  try { return renderView(); }
  catch (e) {
    console.error('render failed', e);
    try { S.cur = null; S.view = 'home'; save(); return renderView(); }
    catch (e2) { app.innerHTML = `<div class="card stack" style="margin-top:20px"><b>משהו השתבש</b><p class="small muted">${esc(String(e2 && e2.message || e2))}</p><button class="btn btn-primary" onclick="location.reload()">לטעון מחדש</button></div>`; }
  }
}
function nav(v) {
  v = { me: 'stats', tips: 'stats', parent: 'stats', result: 'home' }[v] || v;
  const it = [['home', 'מסע', IC.home, 0], ['arcade', 'משחקים', IC.game, 0], ['stats', 'התקדמות', IC.chart, 0], ['shop', 'חנות', IC.shop, 0]];
  return `<nav class="nav four"><div class="in">${it.map(([k, n, ic, dot]) => `<button data-go="${k}" class="${v === k ? 'on' : ''}">${ic}${n}${dot ? '<span class="dot"></span>' : ''}</button>`).join('')}</div></nav>`;
}
function hud() {
  const { r, pct } = rankOf(S.xp);
  return `<header class="hud"><button class="ava-ring" style="--p:${pct}" data-go="me" aria-label="הפרופיל של ${nm()}"><span class="in">${avatarSVG()}</span></button>
  <div class="grow"><h1>${nm()}</h1><div class="sub">${r[1]} · ${S.xp.toLocaleString('he-IL')} נק׳</div></div>
  <div class="pills"><span class="pill">${IC.flame}${curStreak()}</span><span class="pill">${IC.coin}${S.coins}</span><button class="pill" data-act="diasheet" aria-label="יהלומים">${DIA}${S.dia || 0}</button></div></header>`;
}
function elemStrip() {
  const cw = curWorld();
  return `<section class="elems">${WORLDS.map(W => { const d = worldDone(W), p = Math.round(d / 15 * 100), lock = (nextDay() || TOTAL + 1) < W.a; return `<div class="orb ${W === cw ? 'on' : ''} ${lock ? 'locked' : ''}" style="--c:${EC[W.k]};--p:${p}"><span class="ring"><span>${elemIcon(W.k)}</span></span><b>${W.n.replace('עולם ה', '')}</b><small>${d}/15</small></div>`; }).join('')}</section>`;
}
/* ---------- HOME ---------- */
const LINES = ['מוכן לשבור שיא היום?', 'כמו באימון כדורסל: קצת כל יום עושה את ההבדל.', 'בריאן מיי בנה גיטרה צעד אחרי צעד. גם אנחנו.', '15 דקות ביום, כמו תרגול פסנתר למוח.', 'לוחם טוב לא ממהר. קורא, חושב, ואז תוקף.', 'כל טעות היום היא נקודה במבחן.', 'האוהדים ביציע מחכים. בוא נעלה למגרש.', 'גם בקופה הראשית, מי שמחשב מהר לא נתקע בתור.'];
/* ---------- EVENTS ---------- */
function modal(title, text, okLbl, onOk, okCls = 'btn-primary', single = false) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" role="dialog" aria-modal="true"><h4>${title}</h4><p>${text}</p><div class="rw">${single ? '' : '<button class="btn btn-ghost" data-m="no">ביטול</button>'}<button class="btn ${okCls}" data-m="ok">${okLbl}</button></div></div>`;
  app.appendChild(m);
  m.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (e.target === m || (b && b.dataset.m === 'no')) m.remove(); else if (b) { m.remove(); onOk(); } });
}
function renderView() {
  if (S.view !== 'quiz') stopMG();
  if (S.view === 'songs') {
    if (SL) return renderSongOnly();
    clearTimers(); applyTheme(); sbxBadge(); applyGuest();
    app.innerHTML = viewSongs() + nav('arcade'); bind(); bindSongs(); return;
  }
  stopLoop(); applyGuest();
  clearTimers(); applyTheme(); sbxBadge();
  if (S.view === 'quiz') { if (S.cur) return renderQuiz(); S.view = 'home'; }
  if (S.view === 'sprint') return renderSprint();
  if (S.view === 'kupa') return renderKupa();
  if (S.view === 'piano') return renderPiano();
  const v = S.view;
  const views = { home: viewHome, arcade: viewArcade, shop: viewShop, stats: viewStats, tips: viewTips, result: viewResult, me: viewMe, parent: viewParent };
  app.innerHTML = (views[v] || viewHome)() + nav(v);
  bind();
}

const MAIN_KEY = PROF.key, SBX_KEY = PROF.sbx, SBX_FLAG = 'bl-sbx';
const isSbx = () => KEY === SBX_KEY;
function mainPin() { try { return (JSON.parse(localStorage.getItem(MAIN_KEY)) || {}).pin || null; } catch (e) { return null; } }
function sbxBadge() {
  document.documentElement.classList.toggle('sbx', isSbx());
  let el = document.getElementById('sbxbar');
  if (!isSbx()) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'sbxbar'; el.innerHTML = `<span>מצב בדיקה · הנתונים של ${ME.name} לא משתנים</span><button type="button" data-b="tools">כלים</button><button type="button" data-b="exit">יציאה</button>`; document.body.appendChild(el); el.querySelector('[data-b="exit"]').onclick = exitSandbox; el.querySelector('[data-b="tools"]').onclick = openSbxTools; }
}
function sbxFresh() { try { localStorage.removeItem(SBX_KEY); } catch (e) { } S = load(); S.sbxInit = 1; S.start = addDays(todayStr(), -(TOTAL - 1)); S.pin = 'sbx'; S.coins = 300; }
function sbxCopy() { let o = null; try { o = JSON.parse(localStorage.getItem(MAIN_KEY)); } catch (e) { } if (!o || !o.start) return sbxFresh(); o.cur = null; o.view = 'home'; o.pin = 'sbx'; o.sbxInit = 1; o.copied = todayStr(); try { localStorage.setItem(SBX_KEY, JSON.stringify(o)); } catch (e) { } S = load(); }
function enterSandbox(mode) {
  save(); clearTimers();
  try { sessionStorage.setItem(SBX_FLAG, '1'); } catch (e) { }
  KEY = SBX_KEY;
  if (mode === 'copy') sbxCopy(); else if (mode === 'fresh') sbxFresh(); else { S = load(); if (!S.sbxInit) sbxFresh(); }
  SEEN = S.seen; PARENT_OK = false; S.view = 'home'; save(); render(); window.scrollTo(0, 0);
}
function exitSandbox() {
  save(); clearTimers();
  try { sessionStorage.removeItem(SBX_FLAG); } catch (e) { }
  KEY = MAIN_KEY; S = load(); SEEN = S.seen; PARENT_OK = false; S.view = 'home'; render(); window.scrollTo(0, 0);
}
function askPinForSandbox() {
  const pin = mainPin();
  if (!pin) return modal('קודם קוד הורים', 'כדי להיכנס למצב בדיקה צריך קוד הורים. מגדירים אותו פעם אחת: התקדמות ← אזור הורים.', 'הבנתי', () => { }, 'btn-primary', true);
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" role="dialog" aria-modal="true"><h4>מצב בדיקה</h4><p>הזן קוד הורים.</p><input class="pin" id="sbxpin" type="password" inputmode="numeric" maxlength="4" style="width:100%;margin-bottom:12px"><div class="rw"><button class="btn btn-ghost" data-m="no">ביטול</button><button class="btn btn-primary" data-m="ok">כניסה</button></div></div>`;
  app.appendChild(m);
  const inp = m.querySelector('#sbxpin'); inp.focus();
  const tryIt = () => { if (inp.value === pin) { m.remove(); chooseSandbox(); } else { inp.value = ''; inp.style.borderColor = 'var(--bad)'; buzz(80); } };
  inp.onkeydown = e => { if (e.key === 'Enter') tryIt(); };
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-m="no"]')) m.remove(); else if (e.target.closest('[data-m="ok"]')) tryIt(); });
}
let tapN = 0, tapT = 0;
function secretTap() { const now = Date.now(); tapN = now - tapT < 700 ? tapN + 1 : 1; tapT = now; if (tapN >= 5) { tapN = 0; isSbx() ? exitSandbox() : askPinForSandbox(); } }
function sbxTools() {
  if (!isSbx()) return '';
  return `<section class="card stack sbx-tools" style="gap:10px"><h4 style="font-size:1.2rem">כלי בדיקה</h4><p class="small muted" style="margin:0">הכל כאן קורה בעותק נפרד. הנתונים של ${ME.name} לא נגעו.</p>
  <div class="chips"><button class="chip" data-sbx="copy">עותק טרי של ${ME.name}</button><button class="chip" data-sbx="unlock">פתח את כל המשימות</button><button class="chip" data-sbx="coins">+500 מטבעות</button><button class="chip" data-sbx="dia">+20 יהלומים</button><button class="chip" data-sbx="gear">פתח את כל הציוד</button><button class="chip" data-sbx="bday">יום הולדת היום</button><button class="chip" data-sbx="jokes">פתח את כל הבדיחות</button></div>
  <div class="row"><input class="txt" id="sbxday" type="number" min="1" max="${TOTAL}" placeholder="קפיצה למשימה (1-${TOTAL})" style="flex:1"><button class="btn btn-primary" data-sbx="jump" style="min-height:44px">קפוץ</button></div>
  <div class="row"><button class="btn btn-ghost" data-sbx="reset" style="flex:1;min-height:44px">איפוס הבדיקה</button><button class="btn btn-gold" data-sbx="exit" style="flex:1;min-height:44px">יציאה</button></div></section>`;
}
function bindSandbox() {
  app.querySelectorAll('[data-tap5]').forEach(b => b.onclick = secretTap);
  const sb = app.querySelector('[data-act="sbxenter"]'); if (sb) sb.onclick = chooseSandbox;
  app.querySelectorAll('[data-sbx]').forEach(b => b.onclick = () => {
    const a = b.dataset.sbx;
    if (a === 'exit') return exitSandbox();
    if (a === 'reset') { sbxFresh(); SEEN = S.seen; }
    if (a === 'copy') { sbxCopy(); SEEN = S.seen; }
    if (a === 'unlock') S.start = addDays(todayStr(), -(TOTAL - 1));
    if (a === 'coins') S.coins += 500;
    if (a === 'dia') giveDia(20, 'בדיקה', []);
    if (a === 'gear') S.forceGear = 1;
    if (a === 'bday') { S.forceBday = todayStr(); delete S.bdGift[todayStr().slice(0, 4)]; }
    if (a === 'jokes') S.jokes = JOKES.length;
    if (a === 'jump') {
      const N = Math.max(1, Math.min(TOTAL, parseInt(document.getElementById('sbxday').value) || 1));
      S.start = addDays(todayStr(), -(TOTAL - 1)); S.missions = {}; S.cur = null;
      for (let k = 1; k < N; k++) { const n = isBoss(k) ? 15 : 10, c = Math.max(Math.round(n * .7), n - ri(0, 2)); S.missions[k] = { c, n, pts: c * 15, date: todayStr() }; }
      S.streak = N - 1; S.best = Math.max(S.best, N - 1); S.lastDone = addDays(todayStr(), -1); S.xp = (N - 1) * 140; S.openW = null;
    }
    SFX.tap(); save(); document.querySelector('.modal.sbxm')?.remove(); render(); toast('בוצע');
  });
}
function chooseSandbox() {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" role="dialog" aria-modal="true"><h4>מצב בדיקה</h4><p>עותק נפרד. מה שתעשה בו לא נוגע בנתונים של ${ME.name}.</p><div class="stack" style="gap:8px"><button class="btn btn-primary" data-m="copy">עותק של ההתקדמות של ${ME.name}</button><button class="btn btn-ghost" data-m="fresh">מאפס, כל המשימות פתוחות</button>${(() => { try { return localStorage.getItem(SBX_KEY) ? '<button class="btn btn-ghost" data-m="cont">להמשיך מהבדיקה הקודמת</button>' : ''; } catch (e) { return ''; } })()}<button class="btn btn-ghost" data-m="no" style="min-height:42px">ביטול</button></div></div>`;
  app.appendChild(m);
  m.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (e.target === m || (b && b.dataset.m === 'no')) return m.remove(); if (!b) return; m.remove(); enterSandbox(b.dataset.m === 'cont' ? null : b.dataset.m); });
}
function openSbxTools() {
  if (document.querySelector('.modal.sbxm')) return;
  const m = document.createElement('div'); m.className = 'modal sbxm';
  m.innerHTML = `<div class="card" style="max-width:420px;max-height:86vh;overflow:auto">${sbxTools().replace('<section class="card stack sbx-tools"', '<section class="stack sbx-tools"')}<button class="btn btn-ghost btn-wide" data-m="no" style="margin-top:10px;min-height:42px">סגור</button></div>`;
  app.appendChild(m);
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-m="no"]')) m.remove(); });
  bindSandbox();
}

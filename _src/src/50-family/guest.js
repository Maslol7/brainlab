const APP_URL = 'https://maslol7.github.io/brainlab/';
/* ---------- friend (guest) mode: same app, clean slate, no family stuff ---------- */
function applyGuest() { if (S.guest && S.guest.name) { ME.name = S.guest.name; ME.bd = null; } }
function guestOnboard() {
  let isFriend = false; try { isFriend = /[?&]friend\b/.test(location.search); } catch (e) { }
  if (!isFriend || S.guest || isSbx() || Object.keys(S.missions).length || S.xp) return;
  ME.name = ''; render();
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" role="dialog" aria-modal="true"><h4>ברוך הבא למעבדת המוח</h4><p>אימון יומי למבחן המחוננים. ההתקדמות שלך נשמרת רק בטלפון שלך.</p><input class="txt" id="gname" maxlength="14" placeholder="איך קוראים לך?" style="width:100%;margin-bottom:12px"><button class="btn btn-primary btn-wide" data-m="ok">יאללה</button></div>`;
  app.appendChild(m);
  const inp = m.querySelector('#gname'); setTimeout(() => inp.focus(), 50);
  const ok = () => { const n = inp.value.trim().replace(/[<>&"]/g, ''); if (!n) { inp.style.borderColor = 'var(--bad)'; return; } S.guest = { name: n }; S.start = todayStr(); save(); try { history.replaceState(null, '', location.pathname); } catch (e) { } m.remove(); render(); };
  inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
  m.querySelector('[data-m="ok"]').onclick = ok;
}
function friendCard() {
  return `<section class="card row friend"><span class="fi">${IC.share}</span><div class="grow"><b>שתף עם חבר</b><div class="muted small">החבר מקבל אפליקציה נקייה משלו. ההתקדמות שלך נשארת רק אצלך.</div></div><button class="btn btn-primary" data-act="sharefriend" style="min-height:42px">שתף</button></section>`;
}
async function shareFriend() {
  const url = APP_URL + '?friend=1', text = 'מעבדת המוח: משימה קצרה כל יום לקראת מבחן המחוננים. חידות, סדרות, צורות וקרבות בוסים. נסה:';
  try { if (navigator.share) { await navigator.share({ title: 'מעבדת המוח', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" style="max-width:420px"><h4>שתף עם חבר</h4><p class="small ltr" dir="ltr" style="word-break:break-all">${url}</p><div class="stack" style="gap:8px"><a class="btn btn-primary" href="https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}" target="_blank" rel="noopener">שלח בוואטסאפ</a><button class="btn btn-ghost" data-m="copy">העתק קישור</button><button class="btn btn-ghost" data-m="no">סגור</button></div></div>`;
  app.appendChild(m);
  m.addEventListener('click', async e => { const b = e.target.closest('[data-m]'); if (e.target === m || (b && b.dataset.m === 'no')) return m.remove(); if (b && b.dataset.m === 'copy') { try { await navigator.clipboard.writeText(url); toast('הקישור הועתק'); } catch (er) { toast('לא הצלחתי להעתיק'); } } });
}

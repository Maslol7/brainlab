/* ---------- start-up ---------- */
function boot() {
  if (!['home', 'lists', 'shop'].includes(S.view)) S.view = 'home';
  if (S.seen.wDefer) { delete S.seen.wDefer; save(); }   /* dad asked to show the welcome again: it waits for the next opening */   /* a session is not resumed after the app closes */
  applyMat();
  { const last = S.log && S.log.length ? S.log[S.log.length - 1] : null; if (!last || Date.now() - last.t > 20 * 60000) { track('open'); save(); } }
  render();
  setTimeout(wavAll, 2500);
  kidPull(true); if (isKidCloud() && !Object.keys(VOICE).length) voicePull();
  if (isDad()) dadLoad();
  later(autoUpdate, 1500);
  /* iPhone: sound and speech start only after a touch; unlock both on the first one */
  const unlock = () => { try { ac(); if (TTS) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; TTS.speak(u); } } catch (e) { } removeEventListener('pointerdown', unlock, true); };
  addEventListener('pointerdown', unlock, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); if (isKidCloud()) cloudPut(); return; }
    kidPull(); autoUpdate(); if (S.view === 'home' && !document.querySelector('.modal')) render();
  });
}

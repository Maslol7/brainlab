/* ---------- start-up ---------- */
function boot() {
  if (!['home', 'lists', 'shop'].includes(S.view)) S.view = 'home';   /* a session is not resumed after the app closes */
  render();
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

try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(false); });
setTimeout(() => checkUpdate(false), 1500);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && cloudOn()) cloudPut(); });
try { const pc = localStorage.getItem('bl-pin-carry'); if (pc && !S.pin) { S.pin = pc; save(); } localStorage.removeItem('bl-pin-carry'); } catch (e) { }
(function seedRush() { if (S.rh) return; const t = Object.values(S.times || {}).reduce((a, x) => ({ s: a.s + x.s, n: a.n + x.n }), { s: 0, n: 0 }); if (t.n >= 20 && t.s / t.n < 15) S.rh = Array(10).fill(1); })();
trimMist();
/* one-time: the old rush log mixed in simulation taps; restart it so calm daily missions can switch think mode off */
if (!S.rhV17) { if ((S.rh || []).length >= 8 && rushRate() > .2) S.rh = Array(8).fill(1); S.rhV17 = 1; save(); }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pullParent(); });
setTimeout(() => pullParent(true), 1200);
/* latch what was already reached before this version, quietly (no diamonds for the past) */
if (!S.msInit && !S.guest) { const J = journey(); S.ms = S.ms || {}; J.st.forEach((s, i) => { if (s.ok) S.ms[i] = todayStr(); }); S.msInit = 1; save(); }
/* one-time: a full simulation on a day without a mission used to break the streak; give one shield back */
if (!S.streakFix20 && S.lastDone && dayDiff(S.lastDone, todayStr()) === 2 && S.last && ['sim', 'practice', 'review'].includes(S.last.kind)) { S.freezes = Math.max(1, S.freezes || 0); }
S.streakFix20 = 1;
app.addEventListener('click', e => {
  if (Date.now() < TAP_LOCK && e.target.closest('[data-opt],[data-act="hint"],[data-act="next"],[data-act="skip"],[data-act="tcheck"],[data-act="go"]')) { e.stopPropagation(); e.preventDefault(); }
}, true);
/* old saves: a song unlock that was waiting for the result screen */
if (S.pendingSong) { if (S.last) S.last.newSong = S.pendingSong; delete S.pendingSong; }
/* the journey trail follows the nodes when the phone turns */
addEventListener('resize', () => { if (app.querySelector('.path')) drawTrails(); });

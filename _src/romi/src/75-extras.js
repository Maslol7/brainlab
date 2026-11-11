/* ---------- extras: birthday, general review, the speaking game, confetti, self-update ---------- */
/* Romi was born on 3 April 2017 */
const BDAY = { m: 4, d: 3, y: 2017 };
const isBday = (t = todayStr()) => +t.slice(5, 7) === BDAY.m && +t.slice(8) === BDAY.d;
const ageOn = (t = todayStr()) => +t.slice(0, 4) - BDAY.y;
function daysToBday() { const t = todayStr(), y = +t.slice(0, 4), md = `-0${BDAY.m}-0${BDAY.d}`; let b = y + md; if (dayDiff(t, b) < 0) b = (y + 1) + md; return dayDiff(t, b); }
function bdayHTML() {
  if (isBday()) return `<section class="bday"><span class="bd-ic">${GIC.cake}</span><div class="grow"><b>יום הולדת ${ageOn()} שמח, ${NAME}!</b><span>המתנה שלך: 50 ממתקים ובגד התעמלות של יום הולדת.</span></div></section>`;
  const n = daysToBday();
  return n <= 14 ? `<div class="soon">${GIC.cake.replace('width="30" height="30"', 'width="20" height="20"')}<span>${n === 1 ? 'מחר יום ההולדת שלך!' : `עוד ${n} ימים ליום ההולדת שלך`}</span></div>` : '';
}
function bdayGift() {
  const t = todayStr(), y = t.slice(0, 4); if (!isBday() || (S.bday || {})[y] || S.view !== 'home') return;
  S.bday = S.bday || {}; S.bday[y] = 1; addCandy(50); if (!S.own.leo.includes('bday')) S.own.leo.push('bday'); S.leo = 'bday'; S.seen.welcome = 1; save();
  confetti(); SFX.win(); say(`Happy birthday Romi! You are ${ageOn()}!`);
  modal(`יום הולדת ${ageOn()} שמח!`, `<div class="center">${romiSVG({ leo: 'bday' })}</div><p class="center">רומי, מזל טוב! קיבלת <b>50 ממתקים</b> ובגד התעמלות מיוחד של יום הולדת. הוא כבר עלייך.</p>`, [['תודה!', () => render()]]);
}
/* general review: every word of every class list, the ones that need it first */
function reviewList() {
  const seen = new Set(), words = [];
  for (const l of allClass()) for (const w of l.words) { const k = kOf(w); if (seen.has(k)) continue; seen.add(k); words.push(w); }
  return { id: 'review', t: 'חזרה כללית', src: 'review', he: true, words };
}
function reviewPlan(list) {
  const t = todayStr(), need = w => { const q = S.p[kOf(w)] || {}; return (q.due && q.due <= t ? 100 : 0) + (q.st >= maxSt(list) ? 0 : 50) + ((q.bad || 0) - (q.ok || 0)) * 3 + (q.last ? Math.min(30, dayDiff(q.last, t)) : 40); };
  const q = list.words.slice().sort((a, b) => need(b) - need(a)).slice(0, 8);
  return { q: shuffle(q), n: 12 };
}
/* ---------- the speaking game (only where the phone can listen) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let SRI = null;
GAMES.speak = {
  init: () => ({ ws: gameWords(8), i: 0, score: 0, tries: 0, heard: '' }),
  view() {
    const w = G.ws[G.i];
    app.innerHTML = `<div class="page play">${gBar('תגידי את זה', `${G.score} נק׳`)}
    <section class="q speak"><div class="ask">אמרי באנגלית</div><div class="em big">${w.em}</div><div class="word" dir="ltr">${esc(w.en)}</div><div class="he">${w.he.map(esc).join(' / ')}</div>
    <div class="row center"><button class="btn btn-ghost" data-act="hear">${IC.sound} איך אומרים</button></div>
    <button class="micbtn" data-act="mic" aria-label="להקשיב">${GIC.mic}</button><div class="small muted" id="heard">${G.heard ? `שמעתי: <b dir="ltr">${esc(G.heard)}</b>` : 'לחצי על המיקרופון ותגידי את המילה'}</div></section>
    <div id="fb"></div><p class="small muted center">מילה ${G.i + 1} מתוך ${G.ws.length}</p></div>`;
    on('[data-act="hear"]', () => sayWord(w));
    on('[data-act="mic"]', b => GAMES.speak.listen(w, b));
  },
  listen(w, b) {
    if (SRI) { try { SRI.abort(); } catch (e) { } SRI = null; b.classList.remove('on'); return; }
    try { if (TTS) TTS.cancel(); } catch (e) { }
    const r = new SR(); SRI = r; r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 5; b.classList.add('on');
    r.onresult = e => {
      const alts = [...e.results[0]].map(a => normEn(a.transcript)), target = normEn(w.en);
      const ok = alts.some(a => a === target || a.split(' ').includes(target) || (target.includes(' ') && a.includes(target)));
      G.heard = alts[0] || '';
      if (ok) { G.score += G.tries ? 5 : 10; SFX.ok(); fb(`<div class="fb fb-good">מעולה! הטלפון הבין: <b dir="ltr">${esc(w.en)}</b></div>`); later(() => GAMES.speak.next(), 1300); }
      else { G.tries++; SFX.soft(); const h = document.getElementById('heard'); if (h) h.innerHTML = `שמעתי: <b dir="ltr">${esc(G.heard || '...')}</b>`; fb(`<div class="fb fb-bad">${G.tries >= 3 ? 'לא נורא, ממשיכים.' : 'עוד פעם? אפשר לשמוע איך אומרים.'}</div>`); if (G.tries >= 3) later(() => GAMES.speak.next(), 1300); }
    };
    r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('צריך לאשר מיקרופון וזיהוי דיבור (הגדרות ← ספארי)', 4500); else if (e.error === 'no-speech') toast('לא שמעתי. נסי שוב, קרוב לטלפון.'); };
    r.onend = () => { SRI = null; b.classList.remove('on'); };
    try { r.start(); } catch (e) { SRI = null; b.classList.remove('on'); }
  },
  next() { if (!G || G.k !== 'speak') return; G.i++; G.tries = 0; G.heard = ''; if (G.i >= G.ws.length) return gameOver('כל הכבוד!', `<p class="center">${G.score} נקודות${setBest('speak', G.score) ? ' · שיא חדש!' : ''}</p>`, 2 + Math.floor(G.score / 20), () => startGame('speak')); render(); },
};
/* ---------- confetti (a short burst, skipped when the phone asks for less motion) ---------- */
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
  const dpr = devicePixelRatio || 1, W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; const x = cv.getContext('2d'); x.scale(dpr, dpr);
  const cols = ['#FF3D8B', '#FFC229', '#2D5BFF', '#13B98A', '#9B5DE5'];
  const ps = Array.from({ length: 140 }, () => ({ x: W / 2 + (R() - .5) * 80, y: H * .35, vx: (R() - .5) * 9, vy: -R() * 11 - 4, r: R() * 6.28, vr: (R() - .5) * .3, c: pick(cols), s: 5 + R() * 6 }));
  const t0 = performance.now();
  const step = now => { const dt = now - t0; x.clearRect(0, 0, W, H); for (const p of ps) { p.vy += .32; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); } if (dt < 2800) requestAnimationFrame(step); else cv.remove(); };
  requestAnimationFrame(step);
}
/* ---------- the app updates itself: when a new version is on the site, reload on the home screen ---------- */
async function autoUpdate() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return;
    const v = String((await r.json()).v); if (v === APP_VER) return;
    let tried = ''; try { tried = sessionStorage.getItem('salta-upd') || ''; } catch (e) { }
    if (tried === v || !['home', 'lists', 'shop'].includes(S.view) || document.querySelector('.modal')) return;
    try { sessionStorage.setItem('salta-upd', v); } catch (e) { }
    save(); toast('מעדכנת לגרסה חדשה...');
    try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); } catch (e) { }
    setTimeout(() => location.reload(), 600);
  } catch (e) { }
}

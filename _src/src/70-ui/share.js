const svgImg = svg => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); });
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function starPath(x, cx, cy, R0, r0) { x.beginPath(); for (let i = 0; i < 10; i++) { const rad = i % 2 ? r0 : R0, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); } x.closePath(); }
async function makeCard(kind) {
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  try { await Promise.all([document.fonts.load('700 80px Fredoka'), document.fonts.load('500 36px Rubik'), document.fonts.load('700 36px Rubik')]); } catch (e) { }
  const Wd = curWorld(), wc = EC[Wd.k], L0 = S.last;
  let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0A0F24'); g.addColorStop(.55, '#151D46'); g.addColorStop(1, '#0A0F24'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const glow = (cx, cy, r, c) => { const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H); };
  glow(W * .82, 140, 640, hexA(wc, .42)); glow(W * .1, H * .5, 560, 'rgba(169,139,255,.22)'); glow(W * .5, H, 600, hexA(wc, .15));
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${.25 + rnd() * .6})`; x.beginPath(); x.arc(rnd() * W, rnd() * H, rnd() * 2.2 + .4, 0, 7); x.fill(); }
  x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  x.fillStyle = '#A3AED6'; x.font = '600 34px Rubik'; x.fillText('מעבדת המוח · המסע למבחן המחוננים', W / 2, 84);
  const isBossWin = kind === 'result' && L0 && L0.kind === 'boss' && L0.won;
  glow(W / 2, 290, 240, hexA(wc, .45));
  const av = await svgImg(avatarSVG()); if (av) x.drawImage(av, W / 2 - 170, 110, 340, 340);
  if (isBossWin) { const bi = await svgImg(bossSVG(BOSSES[L0.day])); if (bi) { x.save(); x.globalAlpha = .9; x.drawImage(bi, W - 290, 260, 190, 190); x.restore(); x.fillStyle = '#FFC845'; x.font = '700 60px Fredoka'; x.fillText('KO!', W - 195, 260); } }
  let head, sub;
  if (kind === 'result' && L0) {
    const pct = Math.round(L0.correct / L0.n * 100);
    if (L0.kind === 'boss') { head = L0.won ? `ניצחתי את ${BOSSES[L0.day].n}!` : `קרב מול ${BOSSES[L0.day].n}`; sub = `${L0.correct} מתוך ${L0.n} · ${worldOf(L0.day).n}`; }
    else if (L0.kind === 'sim') { head = `סימולציה: ${pct}%`; sub = `${L0.correct} מתוך ${L0.n} שאלות, 6 פרקים`; }
    else { head = `משימה ${L0.day}: ${L0.correct}/${L0.n}`; sub = `${(MODS[L0.mod] || MODS.classic).n} · ${worldOf(L0.day).n}`; }
  } else { head = `${ME.name} במסע`; sub = `${Wd.n} · ${doneCount(S)} מתוך ${TOTAL} משימות`; }
  x.fillStyle = '#F3F6FF'; x.font = '700 84px Fredoka'; x.fillText(head, W / 2, 540, W - 80);
  x.fillStyle = '#C8D0EE'; x.font = '500 38px Rubik'; x.fillText(sub, W / 2, 596, W - 80);
  let y = 640;
  if (kind === 'result' && L0) {
    const st = starsOf(L0.correct, L0.n);
    for (let i = 0; i < 3; i++) { const cx = W / 2 + (1 - i) * 120, big = i === 1 ? 52 : 42; starPath(x, cx, 680, big, big * .45); x.fillStyle = i < st ? '#FFC845' : 'rgba(255,255,255,.14)'; if (i < st) { x.shadowColor = 'rgba(255,200,69,.7)'; x.shadowBlur = 24; } x.fill(); x.shadowBlur = 0; }
    y = 750;
  }
  const tot = Object.keys(CATS).reduce((a, k) => { const s = S.stats[k] || { c: 0, t: 0 }; a.c += s.c; a.t += s.t; return a; }, { c: 0, t: 0 });
  const tiles = [[doneCount(S), 'משימות'], [curStreak(), 'ימים ברצף'], [(tot.t ? Math.round(tot.c / tot.t * 100) : 0) + '%', 'הצלחה'], [bossWins(S), 'בוסים הובסו'], [rankOf(S.xp).r[1], 'דרגה'], [S.dia || 0, 'יהלומים']];
  const tw = 300, th = 150, gap = 24, x0 = (W - (tw * 3 + gap * 2)) / 2;
  tiles.forEach((t, i) => {
    const col = 2 - (i % 3), row = Math.floor(i / 3), X = x0 + col * (tw + gap), Y = y + row * (th + gap);
    rr(x, X, Y, tw, th, 28); x.fillStyle = 'rgba(255,255,255,.07)'; x.fill(); x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 2; x.stroke();
    x.fillStyle = i === 5 ? '#BFF0FF' : '#F3F6FF'; x.font = `700 ${String(t[0]).length > 5 ? 46 : 64}px Fredoka`; x.fillText(String(t[0]), X + tw / 2, Y + 82, tw - 30);
    x.fillStyle = '#A3AED6'; x.font = '500 30px Rubik'; x.fillText(t[1], X + tw / 2, Y + 124);
  });
  y += th * 2 + gap + 30;
  const ow = 170, ox = (W - ow * WORLDS.length) / 2;
  WORLDS.forEach((Wo, i) => {
    const cx = W - (ox + ow * i + ow / 2), cy = y + 50, p = worldDone(Wo) / 15, c = EC[Wo.k];
    x.lineWidth = 12; x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(cx, cy, 46, 0, Math.PI * 2); x.stroke();
    if (p > 0) { x.strokeStyle = c; x.shadowColor = c; x.shadowBlur = 16; x.beginPath(); x.arc(cx, cy, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); x.stroke(); x.shadowBlur = 0; }
    x.fillStyle = c; x.font = '700 30px Fredoka'; x.fillText(`${worldDone(Wo)}`, cx, cy + 11);
    x.fillStyle = '#C8D0EE'; x.font = '500 26px Rubik'; x.fillText(Wo.n.replace('עולם ה', ''), cx, cy + 92);
  });
  const toExam = Math.max(0, dayDiff(todayStr(), S.exam));
  x.fillStyle = '#FFC845'; x.font = '700 36px Rubik'; x.fillText(`עוד ${toExam} ימים למבחן`, W / 2, H - 42);
  return new Promise(res => cv.toBlob(res, 'image/png'));
}
async function shareCard(kind) {
  const b = app.querySelector('[data-share]'); if (b) { b.disabled = true; b.textContent = 'מכין תמונה...'; }
  const blob = await makeCard(kind);
  const L0 = S.last;
  const text = kind === 'result' && L0 ? (L0.kind === 'boss' && L0.won ? `${ME.name} ניצח את ${BOSSES[L0.day].n} במעבדת המוח!` : L0.kind === 'sim' ? `${ME.name} סיים סימולציה של מבחן המחוננים: ${L0.correct}/${L0.n}` : `${ME.name} סיים את משימה ${L0.day} במעבדת המוח: ${L0.correct}/${L0.n}`) : `${ME.name} במסע למבחן המחוננים: ${doneCount(S)} משימות, רצף של ${curStreak()} ימים.`;
  const restore = () => { if (b) { b.disabled = false; b.innerHTML = `${IC.share} שתף בקבוצה של המשפחה`; } };
  try {
    const file = new File([blob], 'brainlab.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); restore(); return; }
  } catch (e) { restore(); if (e && e.name === 'AbortError') return; }
  restore();
  const url = URL.createObjectURL(blob);
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card" style="max-width:420px"><h4>התמונה מוכנה</h4><img src="${url}" alt="סיכום ההתקדמות של ${ME.name}" style="width:100%;border-radius:14px;margin:8px 0 10px"><p>לחיצה ארוכה על התמונה, ואז "שיתוף" או "שמירה". אחר כך שולחים אותה בקבוצה של המשפחה.</p><div class="rw"><a class="btn btn-gold" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">וואטסאפ</a><button class="btn btn-ghost" data-m="no">סגור</button></div></div>`;
  app.appendChild(m);
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-m="no"]')) { m.remove(); URL.revokeObjectURL(url); } });
}

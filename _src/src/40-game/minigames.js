let MG_RAF = null;
/* boss half-time games, one per boss in turn */
const MG_TITLE = { pong: B => `פינג פונג מול ${B.n}`, brick: B => `לשבור את המגן של ${B.n}`, goal: B => `פנדלים מול ${B.n}` };
const MG_HELP = { pong: 'הראשון ל-3 נקודות. גוררים את המחבט עם האצבע.', brick: '40 שניות לשבור את כל הלבנים. גוררים את המחבט.', goal: '5 בעיטות. מחליקים את האצבע מהכדור לנקודה בשער שבה רוצים שהכדור ייכנס. בפינות קשה לשוער.' };
const stopMG = () => { cancelAnimationFrame(MG_RAF); MG_RAF = null; };
function renderBossGame(c) {
  clearTimers(); stopMG(); c.lock = false;
  const B = BOSSES[c.day] || BOSSES[7], order = Object.keys(BOSSES).map(Number).sort((a, b) => a - b), bi = Math.max(0, order.indexOf(c.day));
  const kind = ['pong', 'goal', 'brick'][bi % 3], col = EC[B.el] || '#7B5CFF';
  c.mgStart = Date.now();
  app.innerHTML = `<div class="stack"><div class="card bossgame" style="--bc:${col}"><div class="row bghead"><span class="bgface">${bossSVG(B)}</span><div class="grow"><div class="eyebrow">הפסקת קרב · רק בשביל הכיף</div><b>${MG_TITLE[kind](B)}</b><div class="small muted">${MG_HELP[kind]}</div></div></div>
  <div class="bgscore" id="bgs"></div><canvas id="bgc"></canvas><div id="bgend"><button class="btn btn-ghost btn-wide" data-mg="skip" style="min-height:40px">לדלג, חזרה לקרב</button></div></div></div>`;
  const cv = app.querySelector('#bgc'), ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.max(260, cv.parentElement.clientWidth - 28), H = Math.round(Math.min(460, Math.max(320, window.innerHeight * .52)));
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.scale(dpr, dpr);
  const k = W / 340, pw = W * .22, ph = 10;
  let px = W / 2, bx = W / 2, ball = null, over = false, pause = 0;
  const setX = e => { const r = cv.getBoundingClientRect(); px = Math.max(pw / 2, Math.min(W - pw / 2, (e.clientX - r.left) * (W / r.width))); };
  cv.addEventListener('pointermove', setX); cv.addEventListener('pointerdown', setX);
  const scoreEl = app.querySelector('#bgs'), endEl = app.querySelector('#bgend');
  const back = reward => { stopMG(); if (c.deadline) c.deadline += Date.now() - c.mgStart; c.pts += reward; c.qStart = Date.now(); save(); renderQuiz(); window.scrollTo(0, 0); };
  endEl.querySelector('[data-mg="skip"]').onclick = () => back(0);
  const finishGame = (win, reward, msg) => {
    over = true; stopMG(); if (win) { SFX.win(); burst && burst(70); } else SFX.tap();
    endEl.innerHTML = `<div class="bgres ${win ? 'win' : ''}"><b>${msg}</b>${reward ? `<span>+${reward} נקודות לקרב</span>` : ''}</div><button class="btn btn-primary btn-wide" data-mg="back">חזרה לקרב!</button>`;
    endEl.querySelector('[data-mg="back"]').onclick = () => back(reward);
  };
  const drawBall = (x, y) => { ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 7 * k, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
  const bg = () => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141A3D'); g.addColorStop(1, '#0B1030'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const paddle = (x, y, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - pw / 2, y, pw, ph, 5) : ctx.rect(x - pw / 2, y, pw, ph); ctx.fill(); };
  const speed0 = H / 105;
  const serve = dir => { const a = (R() - .5) * .9; ball = { x: W / 2, y: H / 2, vx: Math.sin(a) * speed0, vy: dir * Math.cos(a) * speed0, s: speed0 }; pause = 40; };
  const bounce = (padX, dir) => { const off = Math.max(-1, Math.min(1, (ball.x - padX) / (pw / 2))); ball.s = Math.min(ball.s * 1.06, H / 45); ball.vx = off * ball.s * .85; ball.vy = dir * Math.sqrt(Math.max(.2, ball.s * ball.s - ball.vx * ball.vx)); buzz(15); };

  if (kind === 'pong') {
    let me = 0, him = 0; const ai = W / Math.max(55, 95 - bi * 4);
    const upd = () => { scoreEl.innerHTML = `<span>אתה <b>${me}</b></span><span><b>${him}</b> ${B.n}</span>`; };
    upd(); serve(-1);
    const loop = () => {
      if (over) return;
      bg(); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.setLineDash([]);
      const target = ball.vy < 0 && ball.y < H * .8 ? ball.x : W / 2;
      bx += Math.max(-ai, Math.min(ai, target - bx)); bx = Math.max(pw / 2, Math.min(W - pw / 2, bx));
      if (pause > 0) pause--; else { ball.x += ball.vx; ball.y += ball.vy; }
      if (ball.x < 7 * k || ball.x > W - 7 * k) { ball.vx *= -1; ball.x = Math.max(7 * k, Math.min(W - 7 * k, ball.x)); }
      const py = H - 24, by = 14;
      if (ball.vy > 0 && ball.y + 7 * k >= py && ball.y < py + ph && Math.abs(ball.x - px) <= pw / 2 + 6) { ball.y = py - 7 * k; bounce(px, -1); tone(660, 0, .06, 'square', .04); }
      if (ball.vy < 0 && ball.y - 7 * k <= by + ph && ball.y > by && Math.abs(ball.x - bx) <= pw / 2 + 6) { ball.y = by + ph + 7 * k; bounce(bx, 1); tone(440, 0, .06, 'square', .04); }
      if (ball.y < -10) { me++; upd(); SFX.ok(); if (me >= 3) return finishGame(true, 40, `ניצחת את ${B.n} בפינג פונג!`); serve(1); }
      if (ball.y > H + 10) { him++; upd(); tone(200, 0, .15, 'sine', .05); if (him >= 3) return finishGame(false, me * 5, me ? `${B.n} ניצח ${him}:${me}. היה צמוד!` : `${B.n} ניצח הפעם. בקרב הבא!`); serve(-1); }
      paddle(bx, by, col); paddle(px, H - 24, '#8FE3FF'); drawBall(ball.x, ball.y);
      MG_RAF = requestAnimationFrame(loop);
    };
    MG_RAF = requestAnimationFrame(loop);
  } else if (kind === 'goal') {
    /* Penalty kicks. The keeper walks along the line; after the kick he dives to where he guessed.
       A good guess is more likely against later bosses. Corners are the safest place to aim. */
    const gw = W * .74, gx = (W - gw) / 2, gh = H * .24, gy = H * .1, line = gy + gh;
    const kw = gw * .19, kh = gh * .78, spot = { x: W / 2, y: H * .84 }, r0 = 13 * k;
    const react = Math.min(.7, .4 + bi * .05), kspd = .0017 + bi * .00015;
    let shots = 0, goals = 0, shot = null, msg = '', msgT = 0, kx = W / 2, aim = null, start = null, t0 = performance.now();
    const upd = () => { scoreEl.innerHTML = `<span>גולים <b>${goals}</b></span><span>בעיטה <b>${Math.min(shots + 1, 5)}</b> מתוך 5</span>`; };
    upd();
    const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) }; };
    cv.style.touchAction = 'none';
    cv.onpointerdown = e => { if (shot || over || msgT) return; start = pt(e); aim = start; };
    cv.onpointermove = e => { if (start) aim = pt(e); };
    cv.onpointerup = e => {
      if (!start || shot || over) return;
      const p2 = pt(e), dx = p2.x - start.x, dy = p2.y - start.y, len = Math.hypot(dx, dy); start = null; aim = null;
      /* the ball goes where the finger stops; a short flick is extended toward the goal at a low height */
      let tx, th;
      if (p2.y <= line) { tx = p2.x; th = (line - p2.y) / gh; }
      else if (len >= 14 * k && dy < -10 * k) { tx = spot.x + dx * ((spot.y - line) / -dy); th = Math.min(.6, len / (spot.y - line)); }
      else return;
      tx += (R() - .5) * 10 * k; th = Math.max(.04, th + (R() - .5) * .08);
      const guess = R() < react ? tx : gx + kw / 2 + R() * (gw - kw);
      shot = { tx, th, f: 0, n: 30, kt: Math.max(gx + kw / 2, Math.min(gx + gw - kw / 2, guess)) }; tone(300, 0, .08, 'triangle', .06);
    };
    const resolve = () => {
      const { tx, th } = shot, hy = th * gh;
      let res;
      if (th > 1.02) res = ['מעל המשקוף!', 0];
      else if (tx < gx + r0 * .4 || tx > gx + gw - r0 * .4) res = ['החוצה! קרוב לקורה', 0];
      else if (Math.abs(kx - tx) < kw / 2 + r0 * .5 && hy < kh + r0) res = [`${B.n} עצר!`, 0];
      else res = [pick(['גול!', 'גוללל!', 'ישר לרשת!', 'איזה גול!']), 1];
      goals += res[1]; shots++; msg = res[0]; msgT = 60; upd();
      if (res[1]) { SFX.ok(); burst(30, tx, line - hy); buzz(30); } else tone(180, 0, .2, 'sine', .06);
    };
    const drawGoal = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0E3B2A'); g.addColorStop(1, '#1D6B45'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)'; ctx.fillRect(0, line + i * (H - line) / 6, W, (H - line) / 6); }
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, line); ctx.lineTo(W, line); ctx.stroke();
      ctx.strokeRect(gx - gw * .12, line, gw * 1.24, (H - line) * .32);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(spot.x, spot.y + r0 * 1.2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;
      for (let x = gx; x <= gx + gw; x += 12 * k) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, line); ctx.stroke(); }
      for (let y = gy; y <= line; y += 12 * k) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke(); }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * k; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(gx, line); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.lineTo(gx + gw, line); ctx.stroke();
    };
    const drawKeeper = () => {
      const top = line - kh;
      ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(kx - kw * .32, top + kh * .28, kw * .64, kh * .72, 8) : ctx.rect(kx - kw * .32, top + kh * .28, kw * .64, kh * .72); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 6 * k; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(kx - kw * .3, top + kh * .38); ctx.lineTo(kx - kw * .5, top + kh * .12); ctx.moveTo(kx + kw * .3, top + kh * .38); ctx.lineTo(kx + kw * .5, top + kh * .12); ctx.stroke();
      ctx.fillStyle = '#FFC845'; [[-.5, .12], [.5, .12]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(kx + kw * a, top + kh * b, 5 * k, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#F6D5BF'; ctx.beginPath(); ctx.arc(kx, top + kh * .16, kw * .17, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1A1B22'; ctx.fillRect(kx - kw * .08, top + kh * .14, 3, 3); ctx.fillRect(kx + kw * .05, top + kh * .14, 3, 3);
    };
    const drawSoccer = (x, y, r) => {
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, y + r * .9, r * .9, r * .3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1A1B22'; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; ctx.lineTo(x + Math.cos(a) * r * .38, y + Math.sin(a) * r * .38); } ctx.fill();
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * .86, y + Math.sin(a) * r * .86, r * .2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    };
    const loop = now => {
      if (over) return;
      drawGoal();
      if (shot) {
        shot.f++; if (shot.f > 3) kx += Math.max(-gw * .045, Math.min(gw * .045, shot.kt - kx));
        const p = Math.min(1, shot.f / shot.n), tyE = line - Math.min(1.4, shot.th) * gh;
        const bxp = spot.x + (shot.tx - spot.x) * p, byp = spot.y + (tyE - spot.y) * p - Math.sin(p * Math.PI) * 18 * k;
        drawKeeper(); drawSoccer(bxp, byp, r0 * (1 - .5 * p));
        if (shot.f === shot.n) resolve();
        if (shot.f >= shot.n) { shot.hold = (shot.hold || 0) + 1; }
        if (shot.hold > 1) { shot.last = [bxp, byp]; }
      } else {
        kx = W / 2 + Math.sin((now - t0) * kspd) * (gw / 2 - kw / 2) * .85;
        drawKeeper(); drawSoccer(spot.x, spot.y, r0);
        if (start && aim) { ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(spot.x, spot.y); ctx.lineTo(spot.x + (aim.x - start.x) * 2, spot.y + (aim.y - start.y) * 2); ctx.stroke(); ctx.restore(); }
      }
      if (msgT) {
        ctx.save(); ctx.font = `700 ${Math.round(26 * k)}px Fredoka, Rubik, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = /גול|רשת/.test(msg) ? '#FFC845' : '#fff';
        ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 8; ctx.fillText(msg, W / 2, H * .55); ctx.restore();
        if (--msgT === 0) {
          shot = null; t0 = performance.now();
          if (shots >= 5) { const win = goals >= 3; return finishGame(win, goals * 8 + (win ? 10 : 0), win ? `${goals} גולים מתוך 5! ניצחת את ${B.n}!` : `${goals} גולים מתוך 5. ${B.n} שוער קשוח!`); }
        }
      }
      MG_RAF = requestAnimationFrame(loop);
    };
    MG_RAF = requestAnimationFrame(loop);
  } else {
    const cols = 6, rows = 3, gap = 6 * k, bw = (W - gap * (cols + 1)) / cols, bh = 16 * k, top = 46 * k;
    const bricks = []; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) bricks.push({ x: gap + q * (bw + gap), y: top + r * (bh + gap), alive: true, r });
    const end = Date.now() + 40000; let broken = 0;
    const upd = () => { scoreEl.innerHTML = `<span>נשברו <b>${broken}</b>/${bricks.length}</span><span><b>${Math.max(0, Math.ceil((end - Date.now()) / 1000))}</b> שנ׳</span>`; };
    serve(-1); ball.x = px; ball.y = H - 40;
    const loop = () => {
      if (over) return;
      if (Date.now() > end) return finishGame(broken === bricks.length, broken * 3, `שברת ${broken} מתוך ${bricks.length} לבנים!`);
      bg(); upd();
      if (pause > 0) pause--; else { ball.x += ball.vx; ball.y += ball.vy; }
      if (ball.x < 7 * k || ball.x > W - 7 * k) { ball.vx *= -1; ball.x = Math.max(7 * k, Math.min(W - 7 * k, ball.x)); }
      if (ball.y < 7 * k) { ball.vy = Math.abs(ball.vy); }
      const py = H - 24;
      if (ball.vy > 0 && ball.y + 7 * k >= py && ball.y < py + ph && Math.abs(ball.x - px) <= pw / 2 + 6) { ball.y = py - 7 * k; bounce(px, -1); tone(620, 0, .05, 'square', .04); }
      for (const b of bricks) if (b.alive && ball.x > b.x - 4 && ball.x < b.x + bw + 4 && ball.y > b.y - 4 && ball.y < b.y + bh + 4) { b.alive = false; broken++; ball.vy *= -1; tone(880 + b.r * 120, 0, .05, 'triangle', .05); break; }
      if (broken === bricks.length) return finishGame(true, broken * 3 + 30, `שברת את כל המגן של ${B.n}!`);
      if (ball.y > H + 10) { serve(-1); ball.x = px; ball.y = H - 40; }
      const bc = col;
      bricks.forEach(b => { if (!b.alive) return; ctx.globalAlpha = 1 - b.r * .22; ctx.fillStyle = bc; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(b.x, b.y, bw, bh, 4) : ctx.rect(b.x, b.y, bw, bh); ctx.fill(); });
      ctx.globalAlpha = 1; paddle(px, py, '#8FE3FF'); drawBall(ball.x, ball.y);
      MG_RAF = requestAnimationFrame(loop);
    };
    MG_RAF = requestAnimationFrame(loop);
  }
}

/* ---------- football renderer: a broadcast camera behind the attack ----------
   A pinhole camera projects the world onto the canvas. Players are drawn as small animated figures,
   scaled by distance and drawn far to near. Nothing here changes the world. */
function fbRenderer(cv, m) {
  const R = { cv, ctx: cv.getContext('2d'), m, cam: null, fx: [], crowd: [] };
  fbResize(R);
  /* the crowd: fixed random seats on the stands behind the goal and along the sides */
  const cols = m.crowd || ['#C8102E', '#F2F2F2', '#E8364F', '#1B1B1F'];
  let s = 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 1100; i++) {
    const side = i < 600 ? 0 : i < 850 ? 1 : 2, u = rnd(), v = rnd();
    let x, y, z;
    if (side === 0) { x = -14 + u * 96; y = -6 - v * 26; z = 1.2 + v * 13; }
    else { x = side === 1 ? -6 - v * 22 : 74 + v * 22; y = -4 + u * 64; z = 1.2 + v * 11; }
    R.crowd.push({ x, y, z, c: cols[Math.floor(rnd() * cols.length)], ph: rnd() * 6 });
  }
  return R;
}
function fbResize(R) {
  const cv = R.cv, dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.max(260, cv.parentElement.clientWidth);
  const H = Math.round(Math.min(Math.max(380, window.innerHeight - 230), W * 1.55));
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  R.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); R.W = W; R.H = H; R.focal = (H / 2) / Math.tan(27 * Math.PI / 180);
}
/* ----- camera ----- */
function fbCamTo(R, c, look) {
  const f = norm3(sub3(look, c)), r = norm3(cross3([0, 0, 1], f)), u = cross3(f, r);
  R.cam = { c, f, r, u };
}
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
/* follow play: behind the ball on the line from the goal, pulled back until the goal and our players fit */
function fbFollow(R, W, dt, snap) {
  /* during a shot the camera holds the shooter's view, so the ball flies away from us into the goal */
  const b = W.fly && W.fly.kind !== 'pass' ? W.fly.by : W.b, gx = 34, gy = 0, dx = b.x - gx, dy = Math.max(b.y, 1) - gy, d = Math.max(6, Math.hypot(dx, dy)), ux = dx / d, uy = Math.max(.3, dy / d), n = Math.hypot(ux, uy);
  const keys = [[FB.GX0, 0, FB.GH], [FB.GX1, 0, FB.GH], [b.x, b.y, 0]].concat(W.ps.filter(p => p.team === "us" && (p.y < b.y + 4 || Math.hypot(p.x - b.x, p.y - b.y) < 30)).flatMap(p => [[p.x, p.y, 1.9], [p.x, p.y, 0]]));
  let pick = null;
  for (const back of [8, 10, 12.5, 15.5, 19, 23, 28, 34, 41]) {
    const pos = [Math.max(-14, Math.min(82, b.x + ux / n * back)), Math.max(b.y, 1) + uy / n * back, 4.5 + back * .42], look = [b.x + (gx - b.x) * .5, Math.max(b.y, 1) * .5, 0];
    fbCamTo(R, pos, look); pick = [pos, look];
    if (keys.every(k => { const q = fbProj(R, ...k); return q && q[0] > R.W * .05 && q[0] < R.W * .95 && q[1] > R.H * .1 && q[1] < R.H * .92; })) break;
  }
  if (R.pos && ['goal', 'fail', 'done'].includes(W.mode)) return fbCamTo(R, R.pos, R.look);
  const k = snap ? 1 : Math.min(1, dt * 2.2);
  R.pos = R.pos ? R.pos.map((v, i) => v + (pick[0][i] - v) * k) : pick[0];
  R.look = R.look ? R.look.map((v, i) => v + (pick[1][i] - v) * k) : pick[1];
  const sh = W.shake ? [(Math.random() - .5) * W.shake * .5, 0, (Math.random() - .5) * W.shake * .4] : [0, 0, 0];
  fbCamTo(R, [R.pos[0] + sh[0], R.pos[1], R.pos[2] + sh[2]], R.look);
}
function fbProj(R, x, y, z) {
  const { c, f, r, u } = R.cam, d = [x - c[0], y - c[1], z - c[2]], zc = dot3(d, f);
  if (zc < .45) return null;
  const k = R.focal / zc; return [R.W / 2 + dot3(d, r) * k, R.H / 2 - dot3(d, u) * k, k];
}
/* screen point to a plane: the ground (z = 0) or the goal face (y = 0) */
function fbUnproject(R, sx, sy, plane) {
  const { c, f, r, u } = R.cam, a = (sx - R.W / 2) / R.focal, bb = -(sy - R.H / 2) / R.focal;
  const dir = [f[0] + r[0] * a + u[0] * bb, f[1] + r[1] * a + u[1] * bb, f[2] + r[2] * a + u[2] * bb];
  const i = plane === 'goal' ? 1 : 2; if (Math.abs(dir[i]) < 1e-6) return null;
  const t = -c[i] / dir[i]; if (t < 0) return null;
  return { x: c[0] + dir[0] * t, y: c[1] + dir[1] * t, z: c[2] + dir[2] * t };
}
function fbPoly(R, pts, fill, stroke, lw) {
  /* clip against a plane just in front of the camera, so big shapes that reach behind it still draw */
  const { c, f } = R.cam, dep = p => dot3(sub3(p, c), f), N = .5, out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], da = dep(a), db = dep(b);
    if (da >= N) out.push(a);
    if ((da >= N) !== (db >= N)) { const k = (N - da) / (db - da); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]); }
  }
  if (out.length < 3) return;
  const P = out.map(p => fbProj(R, ...p)), ctx = R.ctx; if (P.some(p => !p)) return;
  ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
/* a pitch line, cut in pieces so its width follows the distance */
function fbLine(R, pts, w = .12, col = 'rgba(255,255,255,.88)') {
  const ctx = R.ctx; ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
    for (let j = 0; j < n; j++) {
      const p = fbProj(R, a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n, a[2] || 0), q = fbProj(R, a[0] + (b[0] - a[0]) * (j + 1) / n, a[1] + (b[1] - a[1]) * (j + 1) / n, a[2] || 0);
      if (!p || !q) continue; ctx.lineWidth = Math.max(1, w * (p[2] + q[2]) / 2); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
    }
  }
}
const fbArc = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0]; });

/* ----- the stadium ----- */
function fbStadium(R, W) {
  const ctx = R.ctx, { W: w, H: h } = R, cheer = W.mode === 'goal' ? 1 : 0;
  const sky = ctx.createLinearGradient(0, 0, 0, h * .5); sky.addColorStop(0, '#05070F'); sky.addColorStop(1, '#16203A');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  /* floodlight glow */
  for (const lx of [-12, 80]) { const p = fbProj(R, lx, -40, 26); if (p) { const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], p[2] * 14); g.addColorStop(0, 'rgba(255,250,225,.55)'); g.addColorStop(1, 'rgba(255,250,225,0)'); ctx.fillStyle = g; ctx.fillRect(p[0] - p[2] * 14, p[1] - p[2] * 14, p[2] * 28, p[2] * 28); } }
  fbPoly(R, [[-16, -6, 1], [84, -6, 1], [84, -34, 15], [-16, -34, 15]], '#141824');
  for (let i = 1; i < 8; i++) { const v = i / 8; fbLine(R, [[-16, -6 - v * 28, 1 + v * 14], [84, -6 - v * 28, 1 + v * 14]], .25, 'rgba(255,255,255,.05)'); }
  fbPoly(R, [[-16, -34, 15], [84, -34, 15], [84, -30, 19], [-16, -30, 19]], '#0A0D15');
  fbPoly(R, [[-6, -6, 1], [-6, 70, 1], [-30, 70, 13], [-30, -6, 13]], '#11151F');
  fbPoly(R, [[74, -6, 1], [74, 70, 1], [98, 70, 13], [98, -6, 13]], '#11151F');
  for (const q of R.crowd) {
    const p = fbProj(R, q.x, q.y, q.z + (cheer ? Math.max(0, Math.sin(W.t * 9 + q.ph)) * .5 : Math.sin(W.t * 1.3 + q.ph) * .04)); if (!p || p[2] > 22 || p[0] < -5 || p[0] > w + 5 || p[1] < -5 || p[1] > h) continue;
    const s = Math.max(1, p[2] * .26); ctx.fillStyle = q.c; ctx.fillRect(p[0] - s / 2, p[1] - s * 1.6, s, s * 1.6); ctx.fillStyle = '#C99A7A'; ctx.fillRect(p[0] - s * .35, p[1] - s * 2.3, s * .7, s * .7);
  }
  /* ground around the pitch and the pitch with mowing stripes */
  fbPoly(R, [[-6, -6, 0], [74, -6, 0], [74, 70, 0], [-6, 70, 0]], '#1F6B37');
  for (let i = 0; i < 12; i++) fbPoly(R, [[0, i * 5.25, 0], [68, i * 5.25, 0], [68, (i + 1) * 5.25, 0], [0, (i + 1) * 5.25, 0]], i % 2 ? '#2F8E4A' : '#38A055');
  fbPoly(R, [[0, -2.6, 0], [68, -2.6, 0], [68, 0, 0], [0, 0, 0]], '#2F8E4A');
  /* advertising boards */
  const ads = ['מעבדת המוח', 'רגעים גדולים', 'מעבדת המוח', 'יאללה!'];
  for (let i = 0; i < 8; i++) {
    const x0 = -4 + i * 10, x1 = x0 + 9.6, col = i % 2 ? (R.m.kit || {}).shirt || '#C8102E' : '#101624';
    fbPoly(R, [[x0, -3.4, 0], [x1, -3.4, 0], [x1, -3.4, .9], [x0, -3.4, .9]], col);
    const p = fbProj(R, (x0 + x1) / 2, -3.4, .45); if (p && p[2] > 4) { ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.max(7, p[2] * .5)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ads[i % ads.length], p[0], p[1]); ctx.textBaseline = 'alphabetic'; }
  }
  /* lines */
  const L = (...pts) => fbLine(R, pts.map(p => [p[0], p[1], 0]));
  L([0, 0], [68, 0]); L([0, 0], [0, 60]); L([68, 0], [68, 60]); L([0, 52.5], [68, 52.5]);
  L([13.84, 0], [13.84, 16.5], [54.16, 16.5], [54.16, 0]); L([24.84, 0], [24.84, 5.5], [43.16, 5.5], [43.16, 0]);
  fbLine(R, fbArc(34, 11, 9.15, Math.PI * .205, Math.PI * .795)); fbLine(R, fbArc(34, 52.5, 9.15, Math.PI, Math.PI * 2, 40));
  fbLine(R, fbArc(34, 11, .18, 0, Math.PI * 2, 8), .3);
  fbLine(R, fbArc(0, 0, 1, 0, Math.PI / 2, 6)); fbLine(R, fbArc(68, 0, 1, Math.PI / 2, Math.PI, 6));
}
/* ----- the goal: net first, posts after, so the ball can sit in the net ----- */
function fbNet(R, W) {
  const ctx = R.ctx, g0 = FB.GX0, g1 = FB.GX1, H = FB.GH, D = 2.1;
  const bulge = (x, z) => { if (!W.netHit || !W.goalAt) return 0; const d = Math.hypot(x - W.goalAt.x, z - W.goalAt.z); return Math.max(0, 1 - d / 1.6) * W.netHit * .9; };
  fbPoly(R, [[g0, -D, 0], [g1, -D, 0], [g1, -D, H - .5], [g0, -D, H - .5]], 'rgba(255,255,255,.07)');
  ctx.lineWidth = 1; const nc = 'rgba(255,255,255,.42)';
  for (let x = g0; x <= g1 + .01; x += .35) fbLine(R, [[x, -D - bulge(x, 0), 0], [x, -D - bulge(x, 1.2), 1.2], [x, -D - bulge(x, H - .5), H - .5], [x, 0, H]], .02, nc);
  for (let z = 0; z <= H - .5; z += .35) { const pts = []; for (let x = g0; x <= g1 + .01; x += .5) pts.push([x, -D - bulge(x, z), z]); fbLine(R, pts, .02, nc); }
  for (const x of [g0, g1]) for (let z = 0; z <= H; z += .4) fbLine(R, [[x, 0, z], [x, -D, Math.min(z, H - .5)]], .02, nc);
}
function fbPosts(R) {
  const P = (x, z) => [x, 0, z]; fbLine(R, [P(FB.GX0, 0), P(FB.GX0, FB.GH), P(FB.GX1, FB.GH), P(FB.GX1, 0)], .12, '#FFFFFF');
}

/* ----- a player: legs, shorts, shirt, arms, head; back to the camera for our team ----- */
function fbFigure(R, p, back) {
  const pr = fbProj(R, p.x, p.y, 0); if (!pr) return; const [sx, sy, k] = pr, ctx = R.ctx;
  if (sx < -60 || sx > R.W + 60 || sy < -40 || sy > R.H + 140) return;
  const kit = p.kit || {}, run = Math.min(1, Math.hypot(p.vx || 0, p.vy || 0) / 5), sw = Math.sin(p.ph || 0) * .55 * run;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(sx, sy, .42 * k, .13 * k, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(sx, sy);
  if (p.st === 'dive') { ctx.translate(0, -.9 * k); ctx.rotate((p.diveDir || 1) * 1.15); ctx.translate(0, .55 * k); }
  else if (p.st === 'tackle') { ctx.rotate(.9 * Math.sign(p.vx || 1)); }
  else if (p.st === 'jump') { ctx.translate(0, -.45 * k); }
  const hip = -.95 * k, sh = -1.5 * k, lw = Math.max(1.5, .15 * k);
  /* legs */
  const leg = (dir, kick) => { const a = kick ? -1.1 : dir * sw; ctx.strokeStyle = kit.socks || '#222'; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(dir * .1 * k, hip); ctx.lineTo(dir * .1 * k + Math.sin(a) * .9 * k * (kick ? .8 : .45), hip + Math.cos(a) * .92 * k); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(dir * .1 * k + Math.sin(a) * .9 * k * (kick ? .8 : .45), hip + Math.cos(a) * .92 * k, lw * .7, 0, 7); ctx.fill(); };
  leg(-1, false); leg(1, p.st === 'kick');
  /* shorts */
  ctx.fillStyle = kit.shorts || '#fff'; ctx.fillRect(-.24 * k, hip - .06 * k, .48 * k, .3 * k);
  /* arms swing against the legs */
  const arm = (dir) => { const a = -dir * sw * .9 + (p.st === 'dive' ? -2.6 * dir : 0); ctx.strokeStyle = p.gk ? (kit.gloves || '#FFE14D') : '#E2B48C'; ctx.lineWidth = lw * .8; ctx.beginPath(); ctx.moveTo(dir * .24 * k, sh + .08 * k); ctx.lineTo(dir * .3 * k + Math.sin(a) * .5 * k, sh + .08 * k + Math.cos(a) * .55 * k); ctx.stroke(); };
  arm(-1); arm(1);
  /* shirt with shading and stripes */
  const g = ctx.createLinearGradient(-.26 * k, 0, .26 * k, 0); g.addColorStop(0, shade(kit.shirt || '#fff', -.25)); g.addColorStop(.45, kit.shirt || '#fff'); g.addColorStop(1, shade(kit.shirt || '#fff', -.35));
  ctx.fillStyle = g; rrect(ctx, -.26 * k, sh, .52 * k, .62 * k, .1 * k); ctx.fill();
  if (kit.stripe) { ctx.save(); rrect(ctx, -.26 * k, sh, .52 * k, .62 * k, .1 * k); ctx.clip(); ctx.fillStyle = kit.stripe; for (let i = -2; i <= 2; i += 2) ctx.fillRect((i * .11 - .045) * k, sh, .09 * k, .62 * k); ctx.restore(); }
  if (back && p.num !== '' && k > 9) { ctx.fillStyle = kit.numCol || '#fff'; ctx.font = `800 ${.3 * k}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(p.num, 0, sh + .38 * k); }
  /* head */
  ctx.fillStyle = p.skin || '#D9A27A'; ctx.beginPath(); ctx.arc(0, sh - .16 * k, .14 * k, 0, 7); ctx.fill();
  ctx.fillStyle = p.hair || '#2A1B12'; ctx.beginPath(); ctx.arc(0, sh - .19 * k, .145 * k, Math.PI * (back ? .95 : 1.08), Math.PI * (back ? 2.05 : 1.92)); ctx.fill();
  ctx.restore();
  /* name and the ball-carrier marker */
  if (p.label !== false && p.n && p.n !== 'מגן' && k > 6) { ctx.font = `700 ${Math.max(10, Math.min(14, .26 * k))}px system-ui`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.6)'; const y = sy - 2.05 * k; ctx.strokeText(p.n, sx, y); ctx.fillStyle = '#fff'; ctx.fillText(p.n, sx, y); }
}
function shade(hex, a) { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + (a < 0 ? v * a : (255 - v) * a)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fbBall(R, b) {
  const ctx = R.ctx, sh = fbProj(R, b.x, b.y, 0), p = fbProj(R, b.x, b.y, b.z); if (!p || !sh) return;
  const r = Math.max(3, FB.BR * p[2] * 1.15);
  ctx.fillStyle = `rgba(0,0,0,${Math.max(.08, .35 - b.z * .07)})`; ctx.beginPath(); ctx.ellipse(sh[0], sh[1], r * 1.1, r * .45, 0, 0, 7); ctx.fill();
  const g = ctx.createRadialGradient(p[0] - r * .35, p[1] - r * .35, r * .1, p[0], p[1], r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#BFC5CF');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill();
  if (r > 4) { ctx.fillStyle = '#1B1F2A'; for (let i = 0; i < 3; i++) { const a = b.rot + i * 2.1; ctx.beginPath(); ctx.arc(p[0] + Math.cos(a) * r * .5, p[1] + Math.sin(a) * r * .5, r * .26, 0, 7); ctx.fill(); } }
}
/* ----- a whole frame ----- */
function fbDraw(R, W) {
  const ctx = R.ctx; ctx.clearRect(0, 0, R.W, R.H);
  fbStadium(R, W); fbNet(R, W);
  if (W.b.y < 0) fbBall(R, W.b);
  fbPosts(R);
  const items = W.ps.map(p => ({ p, d: dot3(sub3([p.x, p.y, 0], R.cam.c), R.cam.f) }));
  if (W.b.y >= 0) items.push({ ball: true, d: dot3(sub3([W.b.x, W.b.y, 0], R.cam.c), R.cam.f) - .3 });
  items.sort((a, b) => b.d - a.d);
  for (const it of items) {
    if (it.ball) { fbBall(R, W.b); continue; }
    const p = it.p;
    if (p === W.carrier && W.mode === 'play') { const q = fbProj(R, p.x, p.y, 0); if (q) { ctx.strokeStyle = '#FFD65A'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(q[0], q[1], .75 * q[2], .26 * q[2], 0, 0, 7); ctx.stroke(); } }
    else if (p.team === 'us' && W.mode === 'play' && W.carrier && W.carrier.team === 'us') { const q = fbProj(R, p.x, p.y, 0); if (q) { const a = .35 + .3 * Math.sin(W.t * 6); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(q[0], q[1], .7 * q[2], .24 * q[2], 0, 0, 7); ctx.stroke(); } }
    fbFigure(R, p, p.team === 'us');
    if (p.fooled > 0) { const q = fbProj(R, p.x, p.y, 2.3); if (q) { ctx.fillStyle = '#FFD65A'; ctx.font = `900 ${Math.max(14, .5 * q[2])}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('?', q[0], q[1]); } }
  }
  if (W.netHit) W.netHit = Math.max(0, W.netHit - .02);
}
/* slow motion of the goal from a low side camera */
function fbReplayFrame(R, W, fr) {
  W.b.x = fr.b[0]; W.b.y = fr.b[1]; W.b.z = fr.b[2]; W.b.rot = fr.b[3];
  W.ps.forEach((p, i) => { const q = fr.p[i]; p.x = q[0]; p.y = q[1]; p.vx = q[2]; p.vy = q[3]; p.ph = q[4]; p.st = q[5]; });
  /* the TV angle from the side of the box */
  const side = (W.replaySide = W.replaySide || (fr.b[0] < 34 ? -1 : 1)); fbCamTo(R, [34 + side * 22, 13, 6.5], [34 + side * 3, 6, .8]);
  fbDraw(R, W);
}

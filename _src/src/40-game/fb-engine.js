/* ---------- football engine: the world in meters ----------
   x 0..68 across the pitch, y = distance from the goal line (the halfway line is at 52.5), z = height.
   The goal mouth is x 30.34..37.66, z 0..2.44 at y 0. Our team attacks toward y 0. */
const FB = { GX0: 30.34, GX1: 37.66, GH: 2.44, G: 9.8, BR: .11 };
const FB_AB = {
  speed: ['מהירות', 'רץ מהר יותר'],
  dribble: ['כדרור', 'קשה מאוד לקחת ממנו את הכדור'],
  power: ['בעיטה חזקה', 'בועט חזק יותר ומרחוק יותר'],
  curl: ['בעיטה מסובבת', 'הכדור מסתובב יותר, והשוער מתבלבל'],
  vision: ['ראיית משחק', 'מסירות מהירות ומדויקות שקשה לחטוף'],
  header: ['נגיחה', 'מנצח בכדורי גובה ונוגח בדיוק'],
  chip: ['לוב', 'מרים לבד מעל שוער שיצא מהשער'],
  turn: ['תפנית', 'כפתור תפנית שמבלבל את המגן הקרוב'],
  poacher: ['חוש שערים', 'בתוך הרחבה השוער מגיב לאט יותר'],
  leader: ['מנהיג', 'עוד 3 שניות בכל שלב'],
  extra: ['שוער-על', 'ניסיון נוסף בכל ריצה'],
};
const fbHas = (p, a) => !!(p && p.ab && p.ab.has(a));
const fbD = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/* ----- build a world from a scene ----- */
function fbWorld(m) {
  const W = { m, t: 0, T: m.T, mode: 'idle', ev: [], rec: [], chip: false, turned: false, queue: null, shake: 0 };
  const kit = (team) => team === 'us' ? m.kit : m.kit2;
  W.ps = m.us.map(([id, n, x, y, path, sp, start], i) => ({ id, n, x, y, x0: x, y0: y, vx: 0, vy: 0, team: 'us', kit: kit('us'), num: (m.nums || {})[id] || '', path: path ? path.slice() : null, sp: sp || 6.6, start: start || 0, ab: new Set((m.ab || {})[id] || []), ph: i, st: '' }))
    .concat(m.opp.map(([id, n, x, y, role, sp], i) => {
      const gk = role === 'keeper' || role === 'rush';
      return { id, n, x, y, x0: x, y0: y, vx: 0, vy: 0, team: 'them', kit: gk ? m.gkKit || { shirt: '#3FD27A', shorts: '#1B1B1F', socks: '#3FD27A' } : kit('them'), num: gk ? 1 : '', role, gk, sp: sp || (role === 'rush' ? 5.5 : gk ? 4 : 5), stick: 0, fooled: 0, ph: i * 1.7, st: '', tk: 0 };
    }));
  for (const p of W.ps) if (fbHas(p, 'speed')) p.sp *= 1.15;
  if (W.ps.some(p => fbHas(p, 'leader'))) W.T += 3;
  W.carrier = W.ps.find(p => p.id === m.ball);
  W.b = { x: W.carrier.x, y: W.carrier.y - .7, z: FB.BR, vx: 0, vy: 0, vz: 0, spin: 0, rot: 0 };
  W.fly = null;
  return W;
}
const fbP = (W, id) => W.ps.find(p => p.id === id);
const fbEmit = (W, type, data) => W.ev.push([type, data]);
const fbMove = (p, tx, ty, sp, dt, acc = 14) => {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  const want = d < .08 ? 0 : Math.min(sp, d * 3), ux = d ? dx / d : 0, uy = d ? dy / d : 0;
  const ax = ux * want - p.vx, ay = uy * want - p.vy, am = Math.hypot(ax, ay), k = Math.min(1, acc * dt / (am || 1));
  p.vx += ax * k; p.vy += ay * k;
};
const fbGK = W => W.ps.find(p => p.gk);

/* ----- ball physics: one small step (also used to predict) ----- */
function fbBallStep(b, dt, withSpin = true) {
  const v = Math.hypot(b.vx, b.vy);
  if (withSpin && b.spin && v > 2) { const s = b.spin / v; b.vx += -b.vy * s * dt; b.vy += b.vx * s * dt; b.spin *= Math.pow(.55, dt); }
  if (b.z > FB.BR + .01 || b.vz > 0) { b.vz -= FB.G * dt; const drag = Math.pow(.88, dt); b.vx *= drag; b.vy *= drag; }
  else { const dec = Math.max(0, 1 - 2.6 * dt / Math.max(.5, v)); b.vx *= dec; b.vy *= dec; b.vz = 0; b.z = FB.BR; }
  b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
  if (b.z < FB.BR) { b.z = FB.BR; if (b.vz < -1.2) { b.vz = -b.vz * .5; b.vx *= .82; b.vy *= .82; } else b.vz = 0; }
  b.rot += v * dt * 3;
}
/* where will the ball cross the goal line (y = yk)? keepers read the flight without the spin */
function fbPredict(b, yk, withSpin) {
  const c = Object.assign({}, b); for (let i = 0; i < 160; i++) { const py = c.y; fbBallStep(c, 1 / 60, withSpin); if (c.y <= yk && py > yk) return c; if (Math.hypot(c.vx, c.vy) < .5) break; }
  return null;
}

/* ----- actions ----- */
function fbKick(W, who, vx, vy, vz, spin, kind, extra = {}) {
  const b = W.b; b.vx = vx; b.vy = vy; b.vz = vz; b.spin = spin; b.x = who.x; b.y = who.y - .5; b.z = extra.header && W.header ? 1.8 : FB.BR + .02;
  W.carrier = null; W.runTo = null; W.fly = Object.assign({ kind, by: who, t: 0 }, extra);
  who.st = 'kick'; who.stT = .28; fbEmit(W, 'kick', kind);
}
/* a pass to a teammate: ground pass, or lofted when far or asked; curve bends it */
function fbPassTo(W, to, o = {}) {
  const c = W.carrier; if (!c || c.team !== 'us' || to === c) return;
  const lead = to.path && to.path.length ? .8 : 0, tx = to.x + to.vx * lead, ty = to.y + to.vy * lead, d = Math.hypot(tx - c.x, ty - c.y);
  const vis = fbHas(c, 'vision'), loft = o.loft || d > 24;
  let vx, vy, vz;
  if (loft) { const t = Math.max(.9, d / 17), h = Math.hypot(tx - c.x, ty - c.y) / t; vx = (tx - c.x) / d * h; vy = (ty - c.y) / d * h; vz = FB.G * t / 2 - .2; }
  else { const v = Math.min(26, (9 + d * .55) * (vis ? 1.3 : 1)); vx = (tx - c.x) / d * v; vy = (ty - c.y) / d * v; vz = 0; }
  fbKick(W, c, vx, vy, vz, (o.curve || 0) * 10, 'pass', { to, vis, loft });
}
/* a shot at (gx, gz) on the goal plane; power 0..1; curve -1..1 bends the flight but it still ends near the aim */
function fbShootAt(W, gx, gz, o = {}) {
  const c = W.carrier; if (!c) return;
  const range = fbHas(c, 'power') ? 40 : 33;
  if (c.y > range) { fbEmit(W, 'toast', 'רחוק מדי מהשער. התקרב קודם.'); return false; }
  const gk = fbGK(W), chip = W.chip || (fbHas(c, 'chip') && gk && gk.y > 3 && c.y < 18);
  const pw = Math.max(0, Math.min(1, o.power == null ? .6 : o.power)), sy = c.y - .5, D = Math.hypot(gx - c.x, sy);
  let v = (chip ? 11 + D * .25 : 19 + pw * 11) * (fbHas(c, 'power') ? 1.15 : 1);
  if (W.header) v *= fbHas(c, 'header') ? .95 : .78;
  /* too much power lifts the ball: the classic shot over the bar */
  const aimZ = Math.max(.15, Math.min(3.4, gz + (chip ? 0 : Math.max(0, pw - .75) * 2.2)));
  const curl = (o.curve || 0) * (fbHas(c, 'curl') ? 26 : 12);
  const t = chip ? Math.max(1.05, D / 12) : D / v;
  const z0 = W.header ? 1.8 : FB.BR, vz = (aimZ - z0 + FB.G * t * t / 2) / t;
  /* aim to the side so the curl brings it back to the target */
  const ux = (gx - c.x) / D, uy = (0 - sy) / D, h = D / t, off = curl * t * t / 2 * .55;
  const vx = ux * h + uy * off / t, vy = uy * h - ux * off / t;
  fbKick(W, c, vx, vy, vz, curl, chip ? 'chip' : 'shot', { aimX: gx, aimZ, poach: fbHas(c, 'poacher') && c.y < 16.5, header: W.header || fbHas(c, 'header'), gkOut: gk && gk.y > 2.8 && fbD(gk, c) < 7 });
  W.chip = false; W.header = false; W.shake = .35; return true;
}
function fbTurn(W) {
  const c = W.carrier; if (!c || W.turned) return;
  if (!fbHas(c, 'turn')) { fbEmit(W, 'toast', 'לשחקן הזה אין תפנית'); return; }
  const o = W.ps.filter(p => p.team === 'them' && !p.gk).sort((a, b) => fbD(a, c) - fbD(b, c))[0];
  if (o && fbD(o, c) < 3.6) { W.turned = true; o.fooled = 1.5; o.fx = o.x + (c.x - o.x) * 3; o.fy = o.y + (c.y - o.y) * 3; c.dash = { x: c.x + (c.x - o.x) * 1.2 - 1.5, y: c.y - 2.8, t: .45 }; fbEmit(W, 'turn', o.n); }
  else fbEmit(W, 'toast', 'מוקדם מדי. חכה שהמגן יתקרב.');
}

/* ----- one step of the world ----- */
function fbStep(W, dt) {
  const m = W.m, c = W.carrier, b = W.b; W.t += dt; if (W.shake) W.shake = Math.max(0, W.shake - dt);
  const live = W.mode === 'play';
  /* our players */
  for (const p of W.ps.filter(p => p.team === 'us')) {
    if (p.stT) { p.stT -= dt; if (p.stT <= 0) { p.stT = 0; p.st = ''; } }
    if (p.dash) { fbMove(p, p.dash.x, p.dash.y, 10, dt, 40); p.dash.t -= dt; if (p.dash.t <= 0) p.dash = null; }
    else if (p === c && W.runTo) fbMove(p, W.runTo.x, W.runTo.y, p.sp, dt);
    else if (W.fly && W.fly.kind === 'pass' && W.fly.to === p) { const tgt = fbMeet(W, p); fbMove(p, tgt.x, tgt.y, p.sp, dt); }
    else if (p !== c && p.path && p.path.length && W.t > p.start) { fbMove(p, p.path[0][0], p.path[0][1], p.sp, dt); if (Math.hypot(p.path[0][0] - p.x, p.path[0][1] - p.y) < .4) p.path.shift(); }
    else if (p !== c && m.ai && live) { fbSupport(W, p, dt); }
    else fbMove(p, p.x, p.y, p.sp, dt);
  }
  /* opponents */
  for (const o of W.ps.filter(p => p.team === 'them')) {
    if (o.stT) { o.stT -= dt; if (o.stT <= 0) { o.stT = 0; o.st = ''; } }
    const [role, a1, a2] = o.role.split(':');
    if (o.fooled > 0) { o.fooled -= dt; fbMove(o, o.fx, o.fy, 3, dt); continue; }
    if (o.gk) { fbKeeper(W, o, dt, role); continue; }
    const tgtP = a1 && fbP(W, a1);
    if (role === 'press') { if (c && c.team === 'us' && (!a1 || isNaN(+a1) || fbD(o, c) < +a1)) fbMove(o, c.x, c.y + .3, o.sp, dt); else if (W.fly && W.fly.to) fbMove(o, W.fly.to.x, W.fly.to.y, o.sp * .8, dt); else fbMove(o, o.x0, o.y0, 2.5, dt); }
    else if (role === 'mark' && tgtP) { const d = Math.hypot(tgtP.x - 34, tgtP.y) || 1; fbMove(o, tgtP.x + (34 - tgtP.x) / d * 1.5, tgtP.y - tgtP.y / d * 1.5, c === tgtP ? o.sp * .8 : o.sp, dt); }
    else if (role === 'block') { const s = c || b, d = Math.hypot(s.x - 34, s.y) || 1, k = Math.min(.45, 5 / d); fbMove(o, s.x + (34 - s.x) * k, s.y - s.y * k, o.sp, dt); }
    else if (role === 'wake') { if (W.t > +a2) { const t = c || (W.fly && W.fly.to) || tgtP; fbMove(o, t.x, t.y, o.sp, dt); } else fbMove(o, o.x0 + (o.x0 < 34 ? -4 : 4), o.y0 + 6, 1.2, dt); }
    else if (role === 'cruyff' && c) fbMove(o, c.x, c.y, W.turned ? o.sp * .75 : fbD(o, c) < 2.6 ? 1.2 : o.sp * .45, dt);
    else fbMove(o, o.x, o.y, o.sp, dt);
    /* tackles: a defender next to the carrier tries to win the ball */
    if (live && c && c.team === 'us' && !c.dash && fbD(o, c) < 1.2) {
      o.stick += dt;
      const need = fbHas(c, 'dribble') ? .85 : role === 'cruyff' ? .3 : .38;
      if (o.stick > need) { o.st = 'tackle'; o.stT = .5; return fbFail(W, `${o.n === 'מגן' ? 'המגן' : o.n} לקח לך את הכדור. ${m.tackleTip || 'פעל מהר יותר, או מסור לפני שהוא מגיע.'}`); }
    } else o.stick = Math.max(0, o.stick - dt);
  }
  /* move everyone, keep them on the pitch, animate the run cycle */
  for (const p of W.ps) { p.x += p.vx * dt; p.y += p.vy * dt; p.x = Math.max(-1, Math.min(69, p.x)); p.y = Math.max(p.gk ? -.3 : .3, p.y); p.ph += Math.hypot(p.vx, p.vy) * dt * 2.3; }
  /* the ball */
  if (c) { const sp = Math.hypot(c.vx, c.vy), ux = sp > .3 ? c.vx / sp : 0, uy = sp > .3 ? c.vy / sp : -1; b.x = c.x + ux * .55; b.y = c.y + uy * .55; b.z = FB.BR; b.vx = c.vx; b.vy = c.vy; b.rot += sp * dt * 3; }
  else if (W.fly) fbFlight(W, dt);
  else fbBallStep(b, dt);
  if (W.mode === 'goal' && b.y < -1.7) { b.y = -1.7; b.vy = 0; b.vx *= .5; }
  if (live && W.t > W.T) fbFail(W, 'הזמן נגמר וההגנה התארגנה. נסה לפעול מהר יותר.');
  /* keep the last seconds for the slow-motion replay */
  W.rec.push({ t: W.t, b: [b.x, b.y, b.z, b.rot], p: W.ps.map(p => [p.x, p.y, p.vx, p.vy, p.ph, p.st, p.dive || 0]) }); if (W.rec.length > 240) W.rec.shift();
}
/* where a receiver should run to meet the pass */
function fbMeet(W, p) { const c = Object.assign({}, W.b); for (let i = 0; i < 120; i++) { fbBallStep(c, 1 / 30); const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < p.sp * (i / 30) + .8 && c.z < 2.6) return c; } return c; }
/* attacking teammates in the challenge find space: toward the box, away from defenders */
function fbSupport(W, p, dt) {
  if (!p.spot || W.t > p.spotT) {
    const opts = []; for (let i = 0; i < 10; i++) opts.push({ x: 18 + Math.random() * 32, y: 6 + Math.random() * 16 });
    const score = s => Math.min(...W.ps.filter(o => o.team === 'them' && !o.gk).map(o => Math.hypot(o.x - s.x, o.y - s.y)), 9) - Math.hypot(s.x - p.x, s.y - p.y) * .15;
    p.spot = opts.sort((a, b) => score(b) - score(a))[0]; p.spotT = W.t + 1.8 + Math.random();
  }
  fbMove(p, p.spot.x, p.spot.y, p.sp * .85, dt);
}
function fbKeeper(W, o, dt, role) {
  const b = W.b, f = W.fly, c = W.carrier;
  o.dive = Math.max(0, (o.dive || 0) - dt * .6);
  if (f && (f.kind === 'shot' || f.kind === 'chip')) {
    f.kd = (f.kd || 0) + dt;
    const react = .24 + (f.poach ? .14 : 0) + (W.m.gkReact || 0);
    if (f.kd > react) {
      if (!f.pred || f.kd - (f.predT || 0) > .16) { f.pred = fbPredict(b, Math.max(.4, o.y), false) || { x: f.aimX, z: f.aimZ }; f.predT = f.kd; }
      const tx = Math.max(FB.GX0 - .8, Math.min(FB.GX1 + .8, f.pred.x)), far = Math.abs(tx - o.x) > 1;
      fbMove(o, tx, Math.max(.4, Math.min(o.y, 1.5)), far ? (W.m.gkDive || 3.3) : o.sp, dt, 24);
      if (far && !o.st) { o.st = 'dive'; o.stT = .9; o.diveDir = Math.sign(tx - o.x); }
    }
    return;
  }
  if (role === 'rush' && c && c.team === 'us' && c.y < 15 && Math.abs(c.x - 34) < 16) return fbMove(o, c.x + (34 - c.x) * .12, c.y - 1.4, o.sp + .7, dt);
  if (W.m.ai && c && c.team === 'us' && c.y < 11 && !W.ps.some(d => d.team === 'them' && !d.gk && fbD(d, c) < 3)) return fbMove(o, c.x + (34 - c.x) * .15, c.y - 1.5, o.sp + .6, dt);
  const d = Math.hypot(b.x - 34, b.y) || 1, k = Math.min(1.6, d * .08);
  fbMove(o, 34 + (b.x - 34) / d * k, Math.max(.5, b.y / d * k), o.sp, dt);
}
/* the ball in the air or rolling after a kick: interceptions, saves, the goal line */
function fbFlight(W, dt) {
  const b = W.b, f = W.fly; f.t += dt; const py = b.y;
  fbBallStep(b, dt);
  for (const o of W.ps.filter(p => p.team === 'them')) {
    const d = Math.hypot(o.x - b.x, o.y - b.y);
    if (o.gk) {
      const reach = o.st === 'dive' ? .95 : .62, top = o.st === 'dive' ? 2.2 : 2.45;
      if (f.kind === 'chip' && f.gkOut) continue;
      if (f.t > .08 && d < reach && b.z < top) { o.st = o.st || 'catch'; return fbSaved(W, o, f.kind === 'pass' ? 'השוער יצא ותפס את המסירה.' : f.kind === 'chip' ? 'השוער תפס את הלוב. לוב עובד כשהשוער יוצא מהשער.' : W.m.saveTip || 'השוער הציל. כוון לפינה, רחוק ממנו.'); }
      continue;
    }
    if (f.t < (f.loft ? .28 : .12)) continue;
    const reachZ = f.header ? 1.6 : 2.2, r = f.kind === 'pass' && f.vis ? .55 : .8;
    if (f.kind === 'pass' && f.to && Math.hypot(f.to.x - b.x, f.to.y - b.y) < d) continue;
    if (d < r && b.z < reachZ) return fbSaved(W, o, f.kind === 'pass' ? 'המגן חטף את המסירה. מסור כשאין מגן על הקו.' : 'מגן חסם את הבעיטה.');
  }
  if (f.kind === 'pass') {
    const to = f.to, d = Math.hypot(to.x - b.x, to.y - b.y);
    if (d < 1.1 && b.z < 2.5 && f.t > .15) {
      if (W.queue) { const q = W.queue; W.queue = null; W.carrier = to; W.fly = null; W.header = b.z > 1.1; return fbShootAt(W, q.x, q.z, q); }
      if (b.z > 1.3 && f.loft) { W.carrier = to; W.fly = null; W.header = true; W.headerT = .9; fbEmit(W, 'toast', 'נגיחה! החלק לשער עכשיו'); return; }
      W.carrier = to; W.fly = null; to.path = null; b.vz = 0; b.z = FB.BR; return;
    }
    if (Math.hypot(b.vx, b.vy) < 1 && b.z <= FB.BR + .02) return fbFail(W, 'המסירה לא הגיעה.');
  }
  /* the goal line */
  if (py > 0 && b.y <= 0) {
    const inX = b.x > FB.GX0 + FB.BR && b.x < FB.GX1 - FB.BR, inZ = b.z < FB.GH - FB.BR;
    const post = Math.min(Math.abs(b.x - FB.GX0), Math.abs(b.x - FB.GX1)) < FB.BR * 2.2 && b.z < FB.GH;
    const bar = Math.abs(b.z - FB.GH) < FB.BR * 2.2 && b.x > FB.GX0 && b.x < FB.GX1;
    if (post || bar) { b.vy = -b.vy * .6; b.y = .05; if (bar) b.vz = -Math.abs(b.vz) * .5; fbEmit(W, 'post'); return fbFail(W, post ? 'פגעת בקורה הצדדית! כמעט. כוון קצת פנימה.' : 'פגעת במשקוף! פחות חזק, או לכוון נמוך יותר.'); }
    if (inX && inZ) return fbGoal(W);
    return fbFail(W, b.z >= FB.GH ? 'מעל המשקוף. בעיטה חזקה מדי מרימה את הכדור.' : 'החטאת את השער. כוון בין העמודים.');
  }
  if (b.x < -2 || b.x > 70 || b.y > 60) return fbFail(W, 'הכדור יצא מהמגרש.');
  if (f.kind !== 'pass' && Math.hypot(b.vx, b.vy) < .6 && b.z <= FB.BR + .02) return fbFail(W, 'הבעיטה חלשה מדי.');
}
function fbGoal(W) { if (W.over) return; W.over = true; W.mode = 'goal'; W.goalAt = { x: W.b.x, z: W.b.z }; W.netHit = 1; W.fly = null; const b = W.b; b.vy *= .25; b.vx *= .3; fbEmit(W, 'goal'); }
function fbSaved(W, o, msg) { const b = W.b; if (o.gk) { b.vx = -b.vx * .25 + (Math.random() - .5) * 4; b.vy = Math.abs(b.vy) * .35; b.vz = 2.5; } else { b.vx *= .1; b.vy = 2; } W.fly = null; fbEmit(W, 'save', o.gk); fbFail(W, msg); }
function fbFail(W, msg) { if (W.over) return; W.over = true; W.mode = 'fail'; W.carrier = null; fbEmit(W, 'fail', msg); }

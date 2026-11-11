/* ---------- school geometry, grade 6: angles, area and perimeter, the circle, solids and volume ----------
   A practice section of its own (startGeo in 70-ui/geo.js), not part of the daily mission or the journey.
   Category 'geo': CATS.geo is not enumerable, so Object.keys(CATS) (daily mix, weakest(), stats bars, badges, check-in)
   is unchanged, while CATS.geo still names the category for the quiz tag, the saved-state check and the mistakes notebook.
   Every question has a drawing to scale (q.vis), 4 options (the 3 wrong ones are real mistakes), two hints of its own,
   and an explanation in the math.js style: the method, the drawing with the solution marked, the calculation, the trap,
   and "איך מזהים". Lesson keys: geoAngle, geoArea, geoCircle, geoVolume (q.lk). */
Object.defineProperty(CATS, 'geo', { value: { n: 'גאומטריה', tip: 'מציירים, כותבים על הציור כל מספר שידוע, ומסמנים ב-? את מה שמחפשים. בודקים יחידות: ס"מ לאורך ולהיקף, סמ"ר לשטח, סמ"ק לנפח.' }, enumerable: false, writable: true, configurable: true });
const GEO_LK = { angle: 'geoAngle', area: 'geoArea', circle: 'geoCircle', volume: 'geoVolume' };
const GEO_TOPIC = { geoAngle: 'angle', geoArea: 'area', geoCircle: 'circle', geoVolume: 'volume' };
const GEO_NAME = { angle: 'זוויות', area: 'שטח והיקף', circle: 'מעגל', volume: 'גופים ונפח' };
const CM = 'ס"מ', CM2 = 'סמ"ר', CM3 = 'סמ"ק';

/* ===== drawing toolkit: inline SVG, 300 units wide (about 1:1 on a phone), y down ===== */
const gR = v => Math.round(v * 10) / 10;
const gRad = a => a * Math.PI / 180, gSin = a => Math.sin(gRad(a)), gCos = a => Math.cos(gRad(a));
/* a point at distance r from V in direction a (degrees, counter-clockwise from the right, as in a maths book) */
const gPol = (V, r, a) => [V[0] + r * gCos(a), V[1] - r * gSin(a)];
const gDir = (P, Q) => Math.atan2(P[1] - Q[1], Q[0] - P[0]) * 180 / Math.PI;
const gMid = (P, Q, t = .5) => [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];
const gPt = p => `${gR(p[0])},${gR(p[1])}`;
const gSvg = (w, h, body, cls = '') => `<svg class="gsv${cls ? ' ' + cls : ''}" viewBox="0 0 ${w} ${Math.ceil(h)}" style="max-width:${w}px" aria-hidden="true">${body}</svg>`;
const gLn = (P, Q, c = 'gk') => `<line x1="${gR(P[0])}" y1="${gR(P[1])}" x2="${gR(Q[0])}" y2="${gR(Q[1])}" class="${c}"/>`;
const gPg = (pts, c = 'gsh') => `<polygon points="${pts.map(gPt).join(' ')}" class="${c}"/>`;
const gHEB = /[֐-׿]/;
const gTW = (s, size = 14) => strip(s).length * size * .29 + 2;
/* a label: side 'm' centred on x, 'r' to the right of x, 'l' to the left of x (Hebrew labels run right to left) */
function gT(x, y, s, c = 'gt', side = 'm', size = 14) {
  s = String(s).replace(/<[^>]+>/g, '');   /* SVG text holds no HTML */
  const rtl = gHEB.test(s), anc = side === 'm' ? 'middle' : (side === 'r') !== rtl ? 'start' : 'end';
  return `<text x="${gR(x)}" y="${gR(y)}" font-size="${size}" text-anchor="${anc}" dominant-baseline="central"${rtl ? ' direction="rtl"' : ''} class="${c}">${s}</text>`;
}
/* what we look for: a gold pill with ? (or x) in it */
function gQm(x, y, s = '?') { const w = 14 + 9 * s.length; return `<rect x="${gR(x - w / 2)}" y="${gR(y - 11)}" width="${w}" height="22" rx="11" class="gqp"/><text x="${gR(x)}" y="${gR(y)}" font-size="15" text-anchor="middle" dominant-baseline="central" class="gqt">${s}</text>`; }
/* the label of side P-Q, outside the shape (In: a point inside it); '?' becomes the gold pill */
function gSide(P, Q, In, s, c = 'gt', gap = 5, B) {
  if (s == null || s === '') return '';
  const m = gMid(P, Q), dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy) || 1; let n = [dy / l, -dx / l];
  if ((m[0] - In[0]) * n[0] + (m[1] - In[1]) * n[1] < 0) n = [-n[0], -n[1]];
  const q = s === '?', hw = q ? 17 : gTW(s), hh = q ? 11 : 8; let d = hw * Math.abs(n[0]) + hh * Math.abs(n[1]) + gap, x, y;
  /* B: the labels already placed in this drawing; move away from them along the normal */
  for (let t = 0; t < 14; t++) { x = m[0] + n[0] * d; y = m[1] + n[1] * d; if (!B || !B.some(b => Math.abs(b.x - x) < b.hw + hw + 2 && Math.abs(b.y - y) < b.hh + hh + 1)) break; d += 4; }
  if (B) B.push({ x, y, hw, hh });
  return q ? gQm(x, y) : gT(x, y, s, c);
}
/* the first of the candidate places [x, y] where a label fits between the labels already placed */
const gFree = (B, cands, s, size = 14) => { const hw = gTW(s, size), hh = size * .6; return cands.find(([x, y]) => !B.some(b => Math.abs(b.x - x) < b.hw + hw + 2 && Math.abs(b.y - y) < b.hh + hh + 1)) || null; };
/* remember a label placed with gT, so gSide keeps away from it */
const gBx = (B, x, y, s, side = 'm', size = 14) => { const hw = gTW(s, size); B.push({ x: side === 'm' ? x : side === 'r' ? x + hw : x - hw, y, hw, hh: size * .6 }); };
/* equal sides: small marks across the middle of the side */
function gTick(P, Q, n = 1) {
  const l = Math.hypot(Q[0] - P[0], Q[1] - P[1]), u = [(Q[0] - P[0]) / l, (Q[1] - P[1]) / l], v = [-u[1], u[0]], m = gMid(P, Q); let s = '';
  for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 5, c = [m[0] + u[0] * o, m[1] + u[1] * o]; s += gLn([c[0] + v[0] * 7, c[1] + v[1] * 7], [c[0] - v[0] * 7, c[1] - v[1] * 7], 'gtk'); }
  return s;
}
/* fit points (maths coordinates, y up) into a w×h box; pad = [left, right, top, bottom]. Returns the map to SVG coordinates. */
function gFit(pts, w, h, pad) {
  const [pl, pr, pt, pb] = pad, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((w - pl - pr) / (x1 - x0 || 1), (h - pt - pb) / (y1 - y0 || 1));
  const ox = pl + ((w - pl - pr) - (x1 - x0) * s) / 2, oy = pt + ((h - pt - pb) - (y1 - y0) * s) / 2;
  const M = p => [ox + (p[0] - x0) * s, oy + (y1 - p[1]) * s];
  M.s = s; M.h = oy * 2 + (y1 - y0) * s; return M;
}
/* right-angle mark at V, between directions a and a + 90 */
const gRA = (V, a, c = 'gra', s = 11) => { const p = gPol(V, s, a), q = gPol(V, s, a + 90), r = gPol(p, s, a + 90); return `<polyline points="${gPt(p)} ${gPt(r)} ${gPt(q)}" class="${c}"/>`; };
/* an angle at V from direction a1 to a2 (a2 > a1, counter-clockwise).
   t: 'k' given (blue arc), 'x' unknown (gold arc, gold x), 's' the answer in the solution (gold, filled), 'g' found on the way (green, filled), 'n' plain arc */
function gAng(V, a1, a2, lab, t = 'k', o = {}) {
  const span = a2 - a1, sn = gSin(Math.min(span, 180) / 2);
  const dist = o.dist || Math.min(74, Math.max(33, 20 / sn)), r = o.r || Math.max(15, Math.min(27, dist - 16));
  const c = { k: 'gak', x: 'gax', s: 'gas', g: 'gag', n: 'gan' }[t];
  let s = '';
  const p1 = gPol(V, r, a1), p2 = gPol(V, r, a2), big = span > 180 ? 1 : 0;
  if (t === 's' || t === 'g') s += `<path d="M${gPt(V)} L${gPt(p1)} A${r} ${r} 0 ${big} 0 ${gPt(p2)} Z" class="${c}f"/>`;
  if (Math.abs(span - 90) < .5 && !o.arc) s += gRA(V, a1, t === 'k' || t === 'n' ? 'gra' : c, 12);
  else s += `<path d="M${gPt(p1)} A${r} ${r} 0 ${big} 0 ${gPt(p2)}" class="${c}"/>`;
  if (lab) { const P = gPol(V, dist, (a1 + a2) / 2); s += gT(P[0], P[1], lab, t === 'x' ? 'gtx' : t === 's' ? 'gts' : t === 'g' ? 'gtg' : 'gt', 'm', t === 'x' ? 20 : 15); }
  return s;
}
/* the inside angle at P of a convex shape with neighbours Q and R */
function gAngAt(P, Q, R, lab, t, o) {
  const d1 = gDir(P, Q), d2 = gDir(P, R), df = ((d2 - d1) % 360 + 360) % 360;
  return df <= 180 ? gAng(P, d1, d1 + df, lab, t, o) : gAng(P, d2, d2 + 360 - df, lab, t, o);
}
const gDeg = v => L(fmt(v) + '°');
const gUn = u => v => L(fmt(v)) + ' ' + u;
const gPiS = u => k => L((k === 1 ? '' : fmt(k)) + 'π') + ' ' + u;
const gL = (v, u = CM) => `${v} ${u}`;
const gA = v => `${v}°`;
/* one question. v: the answer, c: [[value, why], ...] real mistakes, s(value): its text in an option */
function gMake(t, k, d, prompt, vis, v, c, s, ex, h1, h2, meta = {}, step = 1, ansv = v) {
  const out = [v], seen = new Set([strip(s(v))]), why = {};
  const add = (x, w) => {
    if (out.length >= 4 || x == null) return; if (typeof x === 'number' && !(Number.isFinite(x) && x > 0)) return;
    const key = strip(s(x)); if (seen.has(key)) return; seen.add(key); out.push(x); const mk = mKey(s(x)); if (w && !why[mk]) why[mk] = w;
  };
  c.forEach(([x, w]) => add(x, w));
  for (let i = 1; out.length < 4 && i < 80; i++) add(typeof v === 'number' ? r2(v + step * Math.ceil(i / 2) * (i % 2 ? 1 : -1)) : null, 'לא יוצא בחישוב');
  prompt = gLtrDeg(prompt); ex = gLtrDeg(ex);
  const m = mc(out.map(s)), hd = h => h.split(/(<span class="ltr"[^>]*>[^<]*<\/span>)/).map((x, i) => i % 2 ? x.replace(/(\d)°/g, '$1') : x.replace(/(\d)°/g, '$1 מעלות')).join('');
  h1 = gLtrDeg(hd(h1)); h2 = gLtrDeg(hd(h2));
  return withHint({ cat: 'geo', d, prompt, vis, options: m.options, answer: m.answer, ex, ansv: typeof ansv === 'number' ? ansv : null, lk: GEO_LK[t], meta: Object.assign({ topic: t, kind: k, why }, meta) }, h1, h2);
}
const gTrap = s => 'המלכודת: ' + s;
/* "180°" in Hebrew text shows as "°180": wrap such numbers in an LTR span (not inside drawings or spans that are LTR already) */
const gLtrDeg = h => String(h).split(/(<svg[\s\S]*?<\/svg>|<span class="ltr"[^>]*>(?:[^<]|<\/?b>)*<\/span>)/).map((x, i) => i % 2 ? x : x.replace(/(\d+(?:\.\d+)?°)/g, m0 => L(m0))).join('');

/* ===== angle figures ===== */
/* one angle: first ray along `rot`, the second `span` degrees further. o.ref: dashed guides at 90° and 180° */
function figOne(span, rot, lab, t, o = {}) {
  const V = span + rot <= 95 ? [78, 132] : [150, 132], len = 118;
  let s = '';
  if (o.ref) { s += gLn(V, gPol(V, 92, rot + 90), 'gref') + gT(...gPol(V, 104, rot + 90), '90°', 'gtm', 'm', 12); if (span > 90) s += gLn(V, gPol(V, 112, rot + 180), 'gref') + gT(V[0] - 96, V[1] - 12, '180°', 'gtm', 'm', 12); }
  s += gLn(V, gPol(V, len, rot), 'gk') + gLn(V, gPol(V, len, rot + span), 'gk') + `<circle cx="${V[0]}" cy="${V[1]}" r="3" class="gdot"/>`;
  s += gAng(V, rot, rot + span, lab, t, { r: 26, dist: span < 50 ? 64 : 48, arc: o.arcOnly });
  return gSvg(300, 150, s);
}
/* a straight line with one ray: the angle on the right is theta. labs/ts: [right, left] */
function figLine(theta, labs, ts) {
  const V = [150, 124];
  let s = gLn([16, V[1]], [284, V[1]], 'gk') + gLn(V, gPol(V, 112, theta), 'gk') + `<circle cx="${V[0]}" cy="${V[1]}" r="3" class="gdot"/>`;
  s += gAng(V, 0, theta, labs[0], ts[0], { r: 22 }) + gAng(V, theta, 180, labs[1], ts[1], { r: 22 });
  return gSvg(300, 140, s);
}
/* two straight lines crossing: rays at phi, phi+theta, phi+180, phi+180+theta; sector k lies between ray k and ray k+1 */
function figCross(theta, phi, labs, ts) {
  const V = [150, 90], rays = [phi, phi + theta, phi + 180, phi + 180 + theta];
  const len = a => Math.min(132, 78 / Math.max(.01, Math.abs(gSin(a))), 136 / Math.max(.01, Math.abs(gCos(a))));
  let s = rays.map(a => gLn(V, gPol(V, len(a), a), 'gk')).join('') + `<circle cx="${V[0]}" cy="${V[1]}" r="3" class="gdot"/>`;
  for (let k = 0; k < 4; k++) if (labs[k] || ts[k] !== 'n') s += gAng(V, rays[k], k < 3 ? rays[k + 1] : rays[0] + 360, labs[k], ts[k], { r: 22 });
  return gSvg(300, 180, s);
}
/* rays around a point: sector sizes spans (sum 360), starting at s0 */
function figStar(spans, s0, labs, ts) {
  const V = [150, 104]; let a = s0, s = '';
  const ends = spans.map(sp => { const e = [a, a + sp]; a += sp; return e; });
  s += ends.map(e => gLn(V, gPol(V, 98, e[0]), 'gk')).join('') + `<circle cx="${V[0]}" cy="${V[1]}" r="3" class="gdot"/>`;
  ends.forEach((e, k) => { s += gAng(V, e[0], e[1], labs[k], ts[k], { r: 20, dist: Math.max(44, Math.min(64, 22 / gSin(Math.min(spans[k], 180) / 2))) }); });
  return gSvg(300, 208, s);
}
/* triangle from its angles, A bottom left, B bottom right, C on top.
   lab/t: {A, B, C, E (outside angle at B, the base goes on past B), T (angle between the two sides continued past C)} */
function figTri(A, B, lab, t, o = {}) {
  const C = 180 - A - B, AC = gSin(B) / gSin(C), P = [[0, 0], [1, 0], [AC * gCos(A), AC * gSin(A)]];
  const ext = lab.E != null ? [[1.5, 0]] : [], unit = (p, q) => { const l = Math.hypot(p[0] - q[0], p[1] - q[1]); return [(p[0] - q[0]) / l, (p[1] - q[1]) / l]; };
  const top = lab.T != null ? [unit(P[2], P[0]), unit(P[2], P[1])].map(u => [P[2][0] + u[0] * .32, P[2][1] + u[1] * .32]) : [];
  const M = gFit(P.concat(ext, top), 300, o.H || 196, [22, 22, top.length ? 30 : 20, 18]), [a, b, c] = P.map(M);
  let s = '';
  if (ext.length) s += gLn(b, M(ext[0]), 'gk2');
  if (top.length) s += top.map(p => gLn(c, M(p), 'gk2')).join('');
  s += gPg([a, b, c], 'gsh');
  if (o.ticks) s += gTick(a, c) + gTick(b, c) + (o.ticks === 3 ? gTick(a, b) : '');
  const T = (k, def) => (t || {})[k] || def;
  if (lab.A != null) s += gAngAt(a, b, c, lab.A, T('A', 'k'));
  if (lab.B != null) s += gAngAt(b, a, c, lab.B, T('B', 'k'));
  if (lab.C != null) s += gAngAt(c, a, b, lab.C, T('C', 'k'));
  if (lab.E != null) s += gAng(b, 0, 180 - B, lab.E, T('E', 'k'), { dist: Math.max(30, Math.min(64, 18 / gSin((180 - B) / 2))) });
  if (lab.T != null) { const p1 = M(top[0]), p2 = M(top[1]); s += gAngAt(c, p1, p2, lab.T, T('T', 'k'), { r: 14, dist: Math.max(28, 17 / gSin(C / 2)) }); }
  s += [a, b, c].map(p => `<circle cx="${gR(p[0])}" cy="${gR(p[1])}" r="2.4" class="gdot"/>`).join('');
  return gSvg(300, o.H || 196, s);
}
/* a quadrilateral with inside angles A (bottom left), B (bottom right), C (top right), D = 360 − A − B − C */
function quadPts(A, B, C) {
  for (const Lc of [.9, 1, .8, 1.1, .7, 1.2, .6]) {
    const dBC = 180 - B, pC = [1 + Lc * gCos(dBC), Lc * gSin(dBC)], dCD = dBC + 180 - C, u = [gCos(dCD), gSin(dCD)], v = [gCos(A), gSin(A)];
    const det = v[0] * u[1] - u[0] * v[1]; if (Math.abs(det) < 1e-6) continue;
    const tt = (pC[0] * v[1] - v[0] * pC[1]) / det, ss = (pC[0] * u[1] - u[0] * pC[1]) / det;
    if (tt > .62 && tt < 1.4 && ss > .62 && ss < 1.4) return [[0, 0], [1, 0], pC, [ss * v[0], ss * v[1]]];
  }
  return null;
}
function figQuad(P, labs, ts) {
  const M = gFit(P, 300, 196, [24, 24, 20, 20]), Q = P.map(M); let s = gPg(Q, 'gsh');
  Q.forEach((p, i) => { s += gAngAt(p, Q[(i + 1) % 4], Q[(i + 3) % 4], labs[i], ts[i]); });
  s += Q.map(p => `<circle cx="${gR(p[0])}" cy="${gR(p[1])}" r="2.4" class="gdot"/>`).join('');
  return gSvg(300, 196, s);
}
/* a small row of the four kinds of angle (for lessons) */
function figKinds(hl) {
  const K = [[45, 'חדה'], [90, 'ישרה'], [130, 'קהה'], [180, 'שטוחה']]; let s = '';
  K.forEach(([a, n], i) => { const V = [24 + i * 74 + (a > 90 ? 30 : 4), 58]; s += gLn(V, gPol(V, 44, 0), 'gk') + gLn(V, gPol(V, a === 180 ? 30 : 44, a), 'gk') + gAng(V, 0, a, '', hl === i ? 's' : 'k', { r: 13 }) + gT(24 + i * 74 + 30, 82, n, hl === i ? 'gts' : 'gt', 'm', 13) + gT(24 + i * 74 + 30, 100, a === 90 ? '90°' : a === 180 ? '180°' : a < 90 ? 'פחות מ-90°' : '90° עד 180°', 'gtm', 'm', 11); });
  return gSvg(300, 108, s);
}

/* ===== area figures ===== */
/* a polygon (maths coordinates) fitted into the box; returns the map, the points and the centre */
function gShape(P, H, pad = [52, 52, 26, 30]) { const M = gFit(P, 300, H, pad), Q = P.map(M); return { M, Q, c: [Q.reduce((a, p) => a + p[0], 0) / Q.length, Q.reduce((a, p) => a + p[1], 0) / Q.length] }; }
/* unit squares inside a rectangle (x0,y0)-(x1,y1) in maths units */
function gGrid(M, x0, y0, x1, y1, c = 'ggr') { let s = ''; for (let x = x0 + 1; x < x1; x++) s += gLn(M([x, y0]), M([x, y1]), c); for (let y = y0 + 1; y < y1; y++) s += gLn(M([x0, y]), M([x1, y]), c); return s; }
/* a rectangle a × b. o: la, lb (labels of the bottom and right sides), grid, per (gold outline: the perimeter), all (labels of the top and left sides), inner (text inside) */
function figRect(a, b, o = {}) {
  const k = Math.min(200 / a, 132 / b), H = b * k + 64, { M, Q, c } = gShape([[0, 0], [a, 0], [a, b], [0, b]], H, [52, 52, 28, 30]), B = [];
  let s = gPg(Q, o.per ? 'gsh gper' : 'gsh');
  if (o.grid) s += gGrid(M, 0, 0, a, b);
  if (o.inner) { s += gT(c[0], c[1], o.inner, 'gts', 'm', 15); gBx(B, c[0], c[1], o.inner, 'm', 15); }
  s += gSide(Q[0], Q[1], c, o.la ?? gL(a), 'gt', 5, B) + gSide(Q[1], Q[2], c, o.lb ?? gL(b), 'gt', 5, B);
  if (o.all) s += gSide(Q[2], Q[3], c, o.all[0], 'gt', 5, B) + gSide(Q[3], Q[0], c, o.all[1], 'gt', 5, B);
  if (o.ticks) s += gTick(Q[0], Q[1]) + gTick(Q[1], Q[2]) + gTick(Q[2], Q[3]) + gTick(Q[3], Q[0]);
  return gSvg(300, H, s);
}
/* a triangle with base b on the bottom and the top corner at (p, h): p > b puts the height outside, on the right.
   o: lb, lh (height label), ls (label of the left side), le (the dashed continuation of the base), rect (the rectangle around it), hb (base and height bold), inner (the answer, near the base) */
function figTriH(b, p, h, o = {}) {
  const pts = [[0, 0], [b, 0], [p, h], [p, 0]];
  if (o.rect) pts.push([0, h], [b, h]);
  const k = Math.min(206 / Math.max(b, p), 140 / h), lowLe = o.le && (b / 2 + (p - b) / 2) * k < gTW(gL(b)) + gTW(o.le) + 8, H = h * k + (lowLe ? 80 : 62);
  const { M, Q } = gShape(pts, H, [46, 58, 26, lowLe ? 48 : 30]), B = [];
  const [A, Bv, C] = Q, F = M([p, 0]), c = [(A[0] + Bv[0] + C[0]) / 3, (A[1] + Bv[1] + C[1]) / 3];
  let s = '';
  if (o.rect) s += gPg([A, Bv, M([b, h]), M([0, h])], 'grect');
  if (p > b) s += gLn(Bv, F, 'gext');
  s += gPg([A, Bv, C], 'gsh');
  if (o.hb) s += gLn(A, Bv, 'gbase');
  s += gLn(C, F, o.hb ? 'ght ghtb' : 'ght') + gRA(F, p > b ? 180 : 0, 'grah', 9);
  /* the height label: inside, on the wider side of the dashed line (outside on the right when the height is outside) */
  const lh = o.lh ?? gL(h), left = p <= b && p > b - p, hc = o.hb ? 'gtv gtb' : 'gtv';
  /* low enough that the triangle is wide enough there for the label */
  const room = p > b ? 1e9 : (left ? p : b - p) * M.s, hy = C[1] + (F[1] - C[1]) * Math.min(.82, Math.max(.5, (2 * gTW(lh) + 30) / room));
  if (lh === '?') { const x = F[0] + (left ? -22 : 22); s += gQm(x, hy); B.push({ x, y: hy, hw: 17, hh: 11 }); }
  else { const x = F[0] + (left ? -6 : 6), sd = left ? 'l' : 'r'; s += gT(x, hy, lh, hc, sd); gBx(B, x, hy, lh, sd); }
  if (o.inner) { const y = A[1] - 13, w2 = gTW(o.inner) + 4, cs = p > b ? [[c[0] - 6, c[1] + 6]] : [[(A[0] + F[0]) / 2, y], [(F[0] + Bv[0]) / 2, y]].filter(([x0]) => x0 - w2 > A[0] + 6 && x0 + w2 < Bv[0] - 6);
    /* near the base the triangle must be wide enough for the text: keep inside the slanted sides at that height */
    const inside = ([x0, y0]) => { const t = (A[1] - y0 + 9) / (A[1] - C[1]), xl = A[0] + (C[0] - A[0]) * t, xr = Bv[0] + (C[0] - Bv[0]) * t; return x0 - w2 > xl && x0 + w2 < xr; };
    const at = gFree(B, cs.filter(inside), o.inner); if (at) { s += gT(at[0], at[1], o.inner, 'gts', 'm', 14); gBx(B, at[0], at[1], o.inner); } }
  s += gSide(A, Bv, c, o.lb ?? gL(b), o.hb ? 'gtb' : 'gt', 5, B);
  if (o.le) { const x = (F[0] + Bv[0]) / 2, y = F[1] + (lowLe ? 34 : 14); s += gT(x, y, o.le, 'gtm', 'm', 13); B.push({ x, y, hw: gTW(o.le, 13), hh: 8 }); }
  if (o.ls) s += gSide(A, C, c, o.ls, 'gtm', 5, B);
  return gSvg(300, H, s);
}
/* a right triangle: legs a (bottom) and b (left side), hypotenuse labelled */
function figTriR(a, b, la, lb, lc, o = {}) {
  const k = Math.min(200 / a, 136 / b), H = b * k + 60, { M, Q } = gShape([[0, 0], [a, 0], [0, b]], H, [56, 46, 26, 30]), B = [];
  const c = [(Q[0][0] * 2 + Q[1][0] + Q[2][0]) / 4, (Q[0][1] * 2 + Q[1][1] + Q[2][1]) / 4];
  let s = '';
  if (o.rect) s += gPg([Q[0], Q[1], M([a, b]), Q[2]], 'grect');
  s += gPg(Q, 'gsh') + gRA(Q[0], 0, 'gra', 11);
  if (o.hb) s += gLn(Q[0], Q[1], 'gbase') + gLn(Q[0], Q[2], 'ght ghtb');
  if (o.inner) { const x = Q[0][0] + (Q[1][0] - Q[0][0]) * .3, y = Q[0][1] - (Q[0][1] - Q[2][1]) * .28; s += gT(x, y, o.inner, 'gts', 'm', 14); gBx(B, x, y, o.inner); }
  s += gSide(Q[0], Q[1], c, la, o.hb ? 'gtb' : 'gt', 5, B) + gSide(Q[0], Q[2], c, lb, o.hb ? 'gtv gtb' : 'gt', 5, B) + (lc ? gSide(Q[1], Q[2], c, lc, 'gtm', 5, B) : '');
  return gSvg(300, H, s);
}
/* a parallelogram: base b, top shifted by `off`, height h (dashed from the top left corner) */
function figPara(b, off, h, o = {}) {
  const P = [[0, 0], [b, 0], [b + off, h], [off, h]], k = Math.min(206 / (b + off), 136 / h), H = h * k + 62, { M, Q, c } = gShape(P, H, [46, 46, 26, 30]), B = [];
  const F = M([off, 0]);
  let s = '';
  if (o.sol) s += gPg([Q[0], F, Q[3]], 'gcut') + gPg([Q[1], M([b + off, 0]), Q[2]], 'gmove') + gLn(Q[1], M([b + off, 0]), 'gext');
  s += gPg(Q, o.sol ? 'gsh gsh0' : 'gsh') + (o.hb ? gLn(Q[0], Q[1], 'gbase') : '') + gLn(Q[3], F, o.hb ? 'ght ghtb' : 'ght') + gRA(F, 0, 'grah', 9);
  const lh = o.lh ?? gL(h), hy = Q[3][1] + (F[1] - Q[3][1]) * (F[1] - Q[3][1] < 90 && o.inner ? .36 : .5); s += gT(F[0] + 6, hy, lh, o.hb ? 'gtv gtb' : 'gtv', 'r'); gBx(B, F[0] + 6, hy, lh, 'r');
  if (o.inner) { const xm = (F[0] + Q[1][0]) / 2 + 12, at = gFree(B, [[xm, hy + 24], [xm, hy - 24], [xm + 16, hy], [xm, Q[0][1] - 13]], o.inner); if (at) { s += gT(at[0], at[1], o.inner, 'gts', 'm', 14); gBx(B, at[0], at[1], o.inner); } }
  s += gSide(Q[0], Q[1], c, o.lb ?? gL(b), o.hb ? 'gtb' : 'gt', 5, B) + (o.ls ? gSide(Q[0], Q[3], c, o.ls, 'gtm', 5, B) : '');
  return gSvg(300, H, s);
}
/* a trapezoid: bottom b1, top b2 starting `off` from the left, height h. off = 0: a right trapezoid. o.split: the diagonal and the two triangles */
function figTrap(b1, b2, off, h, o = {}) {
  const P = [[0, 0], [b1, 0], [off + b2, h], [off, h]], k = Math.min(206 / b1, 136 / h), H = h * k + 64, { M, Q, c } = gShape(P, H, [46, 46, 30, 30]), B = [];
  const F = M([off, 0]);
  let s = '';
  if (o.split) s += gPg([Q[0], Q[1], Q[3]], 'gpa') + gPg([Q[1], Q[2], Q[3]], 'gpb') + gLn(Q[1], Q[3], 'gsplit');
  s += gPg(Q, o.split ? 'gsh gsh0' : 'gsh');
  if (off === 0) s += gRA(Q[0], 0, 'gra', 10) + gRA(Q[3], 270, 'gra', 10); else s += gLn(Q[3], F, 'ght') + gRA(F, 0, 'grah', 9);
  const lh = o.lh ?? gL(h);
  if (off) { const hy = (F[1] + Q[3][1]) / 2; s += gT(F[0] + 6, hy, lh, 'gtv', 'r'); gBx(B, F[0] + 6, hy, lh, 'r'); }
  s += gSide(Q[0], Q[1], c, o.l1 ?? gL(b1), 'gt', 5, B) + gSide(Q[3], Q[2], c, o.l2 ?? gL(b2), 'gt', 5, B);
  if (!off) s += gSide(Q[0], Q[3], c, lh, 'gtv', 5, B);
  if (o.ls) s += gSide(Q[1], Q[2], c, o.ls, 'gtm', 5, B);
  return gSvg(300, H, s);
}
/* an L shape: a W × Ht rectangle without its top right corner; a = the top edge, cr = the short right edge.
   o: ghost (the missing corner dashed), per (gold outline), split [text, text] (two rectangles), lIn [label, label] of the two inner edges */
function figL(W, Ht, a, cr, o = {}) {
  const P = [[0, 0], [W, 0], [W, cr], [a, cr], [a, Ht], [0, Ht]], k = Math.min(200 / W, 124 / Ht), H = Ht * k + 64, { M, Q } = gShape(P, H, [48, 48, 28, 30]), B = [];
  const c = M([a / 2, cr / 2]);
  let s = '';
  if (o.ghost) s += gPg([Q[3], Q[2], M([W, Ht]), Q[4]], 'gcut');
  if (o.split) s += gPg([Q[0], M([a, 0]), Q[4], Q[5]], 'gpa') + gPg([M([a, 0]), Q[1], Q[2], Q[3]], 'gpb') + gLn(M([a, 0]), Q[3], 'gsplit');
  s += gPg(Q, o.split ? 'gsh gsh0' : o.per ? 'gsh gper' : 'gsh');
  if (o.split) { const p1 = M([a / 2, Ht / 2]), p2 = M([(a + W) / 2, cr / 2]); s += gT(p1[0], p1[1], o.split[0], 'gts', 'm', 13) + gT(p2[0], p2[1], o.split[1], 'gts', 'm', 13); gBx(B, p1[0], p1[1], o.split[0], 'm', 13); gBx(B, p2[0], p2[1], o.split[1], 'm', 13); }
  s += gSide(Q[0], Q[1], c, o.lW ?? gL(W), 'gt', 5, B) + gSide(Q[5], Q[0], c, o.lH ?? gL(Ht), 'gt', 5, B) + gSide(Q[4], Q[5], c, o.la ?? gL(a), 'gt', 5, B) + gSide(Q[1], Q[2], c, o.lc ?? gL(cr), 'gt', 5, B);
  if (o.lIn) {
    /* the inner horizontal edge: its label just under it, inside the shape; the inner vertical edge: its label in the missing corner */
    if (o.lIn[0]) { const m = gMid(Q[2], Q[3]), y = m[1] + (o.lIn[1] ? 12 : -12); s += gT(m[0], y, o.lIn[0], 'gtg', 'm', 13); gBx(B, m[0], y, o.lIn[0], 'm', 13); }
    if (o.lIn[1]) { const m = gMid(Q[3], Q[4]); s += gT(m[0] + 6, m[1], o.lIn[1], 'gtg', 'r', 13); gBx(B, m[0] + 6, m[1], o.lIn[1], 'r', 13); }
  }
  return gSvg(300, H, s);
}
/* a W × Ht rectangle with a w × h hole (a pool in a lawn) at (x, y); the hole's sizes are written under it and to its left */
function figHole(W, Ht, w, h, x, y, o = {}) {
  const P = [[0, 0], [W, 0], [W, Ht], [0, Ht]], k = Math.min(200 / W, 124 / Ht), H = Ht * k + 64, { M, Q, c } = gShape(P, H, [48, 48, 28, 30]), B = [];
  const R0 = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(M), cr = [(R0[0][0] + R0[2][0]) / 2, (R0[0][1] + R0[2][1]) / 2];
  let s = gPg(Q, 'gsh glawn') + gPg(R0, o.sol ? 'gpool gholex' : 'gpool');
  const lw = gL(w, o.u), lhh = gL(h, o.u);
  s += gT(cr[0], R0[0][1] + 11, lw, 'gt', 'm', 12) + gT(R0[0][0] - 5, cr[1], lhh, 'gt', 'l', 12);
  gBx(B, cr[0], R0[0][1] + 11, lw, 'm', 12); gBx(B, R0[0][0] - 5, cr[1], lhh, 'l', 12);
  if (o.inner && (R0[1][0] - R0[0][0]) > gTW(o.inner, 13) * 2 + 4) s += gT(cr[0], cr[1], o.inner, 'gts', 'm', 13);
  s += gSide(Q[0], Q[1], c, gL(W, o.u), 'gt', 5, B) + gSide(Q[1], Q[2], c, gL(Ht, o.u), 'gt', 5, B);
  return gSvg(300, H, s);
}

/* ===== circle figures ===== */
/* a circle. o: r (label of a radius), d (label of a diameter), fill ('area'), per (gold outline), rq/dq: that label is '?' */
function figCirc(o = {}) {
  const C = [150, 96], R = 72, H = 192;
  let s = `<circle cx="${C[0]}" cy="${C[1]}" r="${R}" class="${o.per ? 'gcir gper' : o.fill ? 'gcir gfil' : 'gcir'}"/>`;
  if (o.d != null) { const P = gPol(C, R, 180), Q = gPol(C, R, 0); s += gLn(P, Q, o.dhl ? 'gdia ghl2' : 'gdia') + gSide(P, Q, [150, 0], o.d, o.dhl ? 'gtg' : 'gt', 4); }
  if (o.r != null) { const Q = gPol(C, R, 50); s += gLn(C, Q, o.rhl ? 'grad ghl2' : 'grad'); const m = gMid(C, Q); s += o.r === '?' ? gQm(m[0] - 22, m[1] - 10) : gT(m[0] - 7, m[1] - 9, o.r, o.rhl ? 'gtg' : 'gt', 'l'); }
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="3" class="gdot"/>`;
  if (o.inner) s += gT(C[0], C[1] + 34, o.inner, 'gts', 'm', 14);
  if (o.side) s += gT(C[0] + R + 8, C[1] + 44, o.side, 'gts', 'r', 13);
  return gSvg(300, H, s);
}
/* half a circle (diameter at the bottom) or a quarter (two radii with a right angle) */
function figPart(kind, o = {}) {
  const R = kind === 'half' ? 112 : 128, C = kind === 'half' ? [150, 140] : [86, 152], H = kind === 'half' ? 176 : 172;
  const A = gPol(C, R, 0), B = gPol(C, R, kind === 'half' ? 180 : 90);
  const d = `M${gPt(B)} A${R} ${R} 0 0 1 ${gPt(A)} L${gPt(C)}${kind === 'half' ? '' : ` L${gPt(B)}`} Z`;
  let s = `<path d="${d}" class="${o.fill ? 'gcir gfil' : 'gcir'}"/>`;
  if (kind === 'half') { s += gLn(B, A, o.per ? 'gdia ghl2' : 'gdia'); if (o.per) s += `<path d="M${gPt(B)} A${R} ${R} 0 0 1 ${gPt(A)}" class="garcp"/>`; s += gSide(B, A, [150, 0], o.d, o.per ? 'gtg' : 'gt', 4); }
  else { s += gRA(C, 0, 'gra', 11) + gSide(C, A, [C[0] + 40, C[1] - 40], o.r, 'gt') + gSide(C, B, [C[0] + 40, C[1] - 40], o.r, 'gt'); }
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="3" class="gdot"/>`;
  if (o.inner) s += gT(kind === 'half' ? C[0] : C[0] + 52, kind === 'half' ? C[1] - 44 : C[1] - 48, o.inner, 'gts', 'm', 14);
  return gSvg(300, H, s);
}
/* a ring: outer radius R, inner radius r (in units; drawn to scale) */
function figRing(Ro, ri0, lR, lr, o = {}) {
  const C = [150, 98], k = 80 / Ro, R = Ro * k, r = ri0 * k, H = 196;
  let s = `<path d="M${C[0] - R} ${C[1]} a${R} ${R} 0 1 0 ${2 * R} 0 a${R} ${R} 0 1 0 ${-2 * R} 0 Z M${C[0] - r} ${C[1]} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z" fill-rule="evenodd" class="${o.sol ? 'gring gringx' : 'gring'}"/>`;
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="${r}" class="${o.sol ? 'ghole gholex' : 'ghole'}"/>`;
  const Q = gPol(C, R, 30), q = gPol(C, r, 200);
  s += gLn(C, Q, 'grad') + gLn(C, q, 'grad2');
  const m2 = gMid(C, q, .5), e1 = gPol(C, R + 6, 30);
  s += gT(e1[0] + 2, e1[1] - 8, lR, 'gt', 'r', 13) + gT(m2[0] + 4, m2[1] + 14, lr, 'gt', 'm', 13);
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="3" class="gdot"/>`;
  if (o.inner) s += gT(C[0], C[1] - (R + r) / 2, o.inner, 'gts', 'm', 14);
  return gSvg(300, H, s);
}

/* ===== solids ===== */
/* a box: length l to the right, depth w going back (up and to the right), height h up.
   o: lab [l, w, h] labels, grid (unit cubes on the visible faces), hl 'top' (gold top layer), hid (hidden edges dashed), one (a small cube of edge one in the corner), pairs (opposite faces in one colour) */
function figBox(l, w, h, o = {}) {
  const k = .5, ca = gCos(32) * k, sa = gSin(32) * k, P3 = (x, y, z) => [x + z * ca, y + z * sa];
  const cor = [P3(0, 0, 0), P3(l, 0, 0), P3(l, h, 0), P3(0, h, 0), P3(0, 0, w), P3(l, 0, w), P3(l, h, w), P3(0, h, w)];
  const H = o.H || 200, M = gFit(cor, 300, H, [52, 58, 14, 30]), p = (x, y, z) => M(P3(x, y, z)), cen = p(l / 2, h / 2, w / 2);
  const front = [p(0, 0, 0), p(l, 0, 0), p(l, h, 0), p(0, h, 0)], top = [p(0, h, 0), p(l, h, 0), p(l, h, w), p(0, h, w)], side = [p(l, 0, 0), p(l, 0, w), p(l, h, w), p(l, h, 0)];
  let s = '';
  s += gPg(front, o.pairs ? 'gbf gpf' : 'gbf') + gPg(top, o.pairs ? 'gbt gpt' : 'gbt') + gPg(side, o.pairs ? 'gbs gps' : 'gbs');
  if (o.grid) {
    for (let x = 1; x < l; x++) s += gLn(p(x, 0, 0), p(x, h, 0), 'ggr') + gLn(p(x, h, 0), p(x, h, w), 'ggr');
    for (let y = 1; y < h; y++) s += gLn(p(0, y, 0), p(l, y, 0), 'ggr') + gLn(p(l, y, 0), p(l, y, w), 'ggr');
    for (let z = 1; z < w; z++) s += gLn(p(0, h, z), p(l, h, z), 'ggr') + gLn(p(l, 0, z), p(l, h, z), 'ggr');
  }
  if (o.hl === 'top') s += gPg([p(0, h - 1, 0), p(l, h - 1, 0), p(l, h, 0), p(0, h, 0)], 'ghl') + gPg([p(l, h - 1, 0), p(l, h - 1, w), p(l, h, w), p(l, h, 0)], 'ghl') + gPg(top, 'ghl') + gLn(p(0, h - 1, 0), p(l, h - 1, 0), 'ghle') + gLn(p(l, h - 1, 0), p(l, h - 1, w), 'ghle');
  if (o.hid !== false) s += gLn(p(0, 0, w), p(l, 0, w), 'ghid') + gLn(p(0, 0, w), p(0, h, w), 'ghid') + gLn(p(0, 0, w), p(0, 0, 0), 'ghid');
  if (o.one) { const e = o.one; s += gPg([p(0, 0, 0), p(e, 0, 0), p(e, e, 0), p(0, e, 0)], 'gone') + gPg([p(0, e, 0), p(e, e, 0), p(e, e, e), p(0, e, e)], 'gone') + gPg([p(e, 0, 0), p(e, 0, e), p(e, e, e), p(e, e, 0)], 'gone'); }
  s += gPg(front, 'gbo') + gPg(top, 'gbo') + gPg(side, 'gbo');
  if (o.dots) s += [front[0], front[1], front[2], front[3], top[2], top[3], side[1], p(0, 0, w)].map((q, i) => `<circle cx="${gR(q[0])}" cy="${gR(q[1])}" r="4" class="${i === 7 ? 'gdoth' : 'gdotv'}"/>`).join('');
  const [ll, lw, lh] = o.lab || [gL(l), gL(w), gL(h)], B = [];
  s += gSide(front[0], front[1], cen, ll, 'gt', 5, B) + gSide(front[0], front[3], cen, lh, 'gt', 5, B) + gSide(side[0], side[1], cen, lw, 'gt', 5, B);
  if (o.inner) s += gT(...gMid(front[0], front[2]), o.inner, 'gts', 'm', 13);
  return gSvg(300, H, s);
}
/* the net of a box l × w × h: a strip (bottom, front, top, back) with the two side faces next to the front.
   o.pairs: colour opposite faces alike and write the area in each */
function figNet(l, w, h, o = {}) {
  const F = [[w, 0, l, w, 'a'], [w, w, l, h, 'b'], [w, w + h, l, w, 'a'], [w, 2 * w + h, l, h, 'b'], [0, w, w, h, 'c'], [w + l, w, w, h, 'c']];
  const pts = F.flatMap(([x, y, a, b]) => [[x, y], [x + a, y + b]]), M = gFit(pts, 300, o.H || 230, [40, 40, 12, 30]);
  let s = '';
  F.forEach(([x, y, a, b, g]) => { const Q = [M([x, y]), M([x + a, y]), M([x + a, y + b]), M([x, y + b])]; s += gPg(Q, o.pairs ? 'gnf gn' + g : 'gnf'); if (o.pairs) { const c = gMid(Q[0], Q[2]); s += gT(c[0], c[1], a * b, 'gt', 'm', 12); } });
  s += gLn(M([w, w]), M([w + l, w]), 'gfold') + gLn(M([w, w + h]), M([w + l, w + h]), 'gfold') + gLn(M([w, 2 * w + h]), M([w + l, 2 * w + h]), 'gfold') + gLn(M([w, w]), M([w, w + h]), 'gfold') + gLn(M([w + l, w]), M([w + l, w + h]), 'gfold');
  const c0 = M([w + l / 2, w / 2]);
  s += gSide(M([w, 0]), M([w + l, 0]), c0, gL(l)) + gSide(M([w, 0]), M([w, w]), c0, gL(w)) + gSide(M([0, w]), M([0, w + h]), M([w / 2, w + h / 2]), gL(h));
  return gSvg(300, o.H || 230, s);
}
/* cube nets: does a set of 6 squares fold into a cube? Roll a die over the squares; 6 different faces must come out on the bottom */
function gFolds(cells) {
  const key = (x, y) => x + ',' + y, at = new Map(cells.map((c, i) => [key(c[0], c[1]), i])), st = [];
  st[0] = { b: 0, t: 1, n: 2, s: 3, e: 4, w: 5 }; const q = [0], seen = new Set([0]);
  const roll = (f, dir) => dir === 'e' ? { b: f.e, e: f.t, t: f.w, w: f.b, n: f.n, s: f.s } : dir === 'w' ? { b: f.w, w: f.t, t: f.e, e: f.b, n: f.n, s: f.s } : dir === 'n' ? { b: f.n, n: f.t, t: f.s, s: f.b, e: f.e, w: f.w } : { b: f.s, s: f.t, t: f.n, n: f.b, e: f.e, w: f.w };
  while (q.length) { const i = q.shift(), [x, y] = cells[i]; for (const [dx, dy, dir] of [[1, 0, 'e'], [-1, 0, 'w'], [0, -1, 'n'], [0, 1, 's']]) { const j = at.get(key(x + dx, y + dy)); if (j != null && !seen.has(j)) { seen.add(j); st[j] = roll(st[i], dir); q.push(j); } } }
  return seen.size === 6 && new Set(st.map(f => f.b)).size === 6 ? st.map(f => f.b) : null;
}
const gNorm = cs => { const x0 = Math.min(...cs.map(c => c[0])), y0 = Math.min(...cs.map(c => c[1])); return cs.map(c => [c[0] - x0, c[1] - y0]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
/* the same shape turned or flipped looks the same: one key for all 8 */
function gShapeKey(cs) { const T = [c => c, c => [-c[1], c[0]], c => [-c[0], -c[1]], c => [c[1], -c[0]], c => [-c[0], c[1]], c => [c[1], c[0]], c => [c[0], -c[1]], c => [-c[1], -c[0]]]; return T.map(f => JSON.stringify(gNorm(cs.map(f)))).sort()[0]; }
function gGrow(w, h) { for (;;) { const cs = [[ri(0, w - 1), ri(0, h - 1)]]; for (let t = 0; cs.length < 6 && t < 60; t++) { const [x, y] = pick(cs), [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || cs.some(c => c[0] === nx && c[1] === ny)) continue; cs.push([nx, ny]); } if (cs.length === 6) return gNorm(cs); } }
const gHas2x2 = cs => cs.some(([x, y]) => [[1, 0], [0, 1], [1, 1]].every(([dx, dy]) => cs.some(c => c[0] === x + dx && c[1] === y + dy)));
const gRow5 = cs => cs.some(([x, y]) => [1, 2, 3, 4].every(k => cs.some(c => c[0] === x + k && c[1] === y)) || [1, 2, 3, 4].every(k => cs.some(c => c[1] === y + k && c[0] === x)));
/* a small drawing of a net (for the options); faces: colour of each square by the face it becomes (in the solution) */
function figCells(cs, faces) {
  const u = 20, W = Math.max(...cs.map(c => c[0])) + 1, H = Math.max(...cs.map(c => c[1])) + 1, pal = ['gna', 'gna', 'gnb', 'gnb', 'gnc', 'gnc'];
  const s = cs.map(([x, y], i) => `<rect x="${x * u + 2}" y="${y * u + 2}" width="${u}" height="${u}" class="gnf${faces ? ' ' + pal[faces[i]] : ''}"/>${faces ? `<text x="${x * u + 2 + u / 2}" y="${y * u + 2 + u / 2}" font-size="11" text-anchor="middle" dominant-baseline="central" class="gt">${'112233'[faces[i]]}</text>` : ''}`).join('');
  return `<svg class="gsv gcells" viewBox="0 0 ${W * u + 4} ${H * u + 4}" style="max-width:${(W * u + 4) * 1.25}px" aria-hidden="true">${s}</svg>`;
}

/* ===== ANGLES ===== */
const GANG = {
  /* what kind of angle is it */
  type(d) {
    const K = pick(['חדה', 'ישרה', 'קהה', 'שטוחה']), v = K === 'חדה' ? pick([25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]) : K === 'ישרה' ? 90 : K === 'קהה' ? pick([105, 110, 115, 120, 125, 130, 135, 140, 150, 160]) : 180;
    const rot = v >= 150 ? 0 : pick([0, 0, 10, 20]), names = ['זווית חדה', 'זווית ישרה', 'זווית קהה', 'זווית שטוחה'], ans = 'זווית ' + K;
    const cmp = v < 90 ? `${L(v + '°')} קטן מ-${L('90°')}` : v === 90 ? `${L('90°')} בדיוק` : v < 180 ? `${L(v + '°')} גדול מ-${L('90°')} וקטן מ-${L('180°')}` : `${L('180°')} בדיוק: קו ישר`;
    const ex = mEx('משווים את הזווית ל-90° (פינה של דף) ול-180° (קו ישר).',
      [cmp, `לכן זו ${mB(ans)}`],
      figOne(v, rot, gA(v), 's', { ref: v !== 90 && v !== 180 }) + mLeg([['m', 'קו מקווקו: איפה היו 90° ו-180°']]),
      gTrap('להסתכל על אורך הקווים. גודל הזווית תלוי רק בפתיחה שבין הקווים.'), 'שאלה על סוג של זווית. חדה: פחות מ-90°. ישרה: 90°. קהה: בין 90° ל-180°. שטוחה: 180°.');
    return gMake('angle', 'type', d, 'איזו זווית מסומנת בציור?', figOne(v, rot, gA(v), 'k'), ans, names.filter(n => n !== ans).map(n => [n, '']), x => x, ex,
      'השוו את הזווית לפינה של דף, שהיא 90°, ולקו ישר, שהוא 180°.', `בציור כתוב כמה מעלות יש בזווית. האם זה פחות מ-90°, בדיוק 90°, בין 90° ל-180°, או בדיוק 180°?`, { v }, 1, null);
  },
  /* two angles on a straight line */
  adj(d) {
    const th = d === 1 ? pick([30, 40, 50, 60, 70, 110, 120, 130, 140, 150]) : pick([35, 45, 55, 65, 75, 105, 115, 125, 135, 145]), right = R() < .5, known = right ? th : 180 - th, ans = 180 - known;
    const fig = sol => figLine(th, right ? [gA(th), sol ? gA(ans) : 'x'] : [sol ? gA(ans) : 'x', gA(180 - th)], right ? ['k', sol ? 's' : 'x'] : [sol ? 's' : 'x', 'k']);
    const ex = mEx('שתי זוויות צמודות יוצרות יחד קו ישר. בקו ישר יש 180°.',
      [`${L(`x + ${known}° = 180°`)}`, `${L(`x = 180° − ${known}° = <b>${ans}°</b>`)}`, `בדיקה: ${L(`${known}° + ${ans}° = 180°`)} ✓`], fig(true),
      gTrap('לחסר מ-360°. קו ישר הוא חצי סיבוב: 180°.'), 'שתי זוויות זו ליד זו, על אותו קו ישר.');
    return gMake('angle', 'adj', d, 'הקו האופקי הוא קו ישר. מה גודל הזווית x?', fig(false), ans,
      [[known, 'זו הזווית הנתונה'], [360 - known, 'חיסרו מ-360°, אבל קו ישר הוא 180°'], [Math.abs(90 - known), 'השלימו ל-90° במקום ל-180°'], [ans + 10, '']], gDeg, ex,
      'שתי הזוויות יחד יוצרות קו ישר. כמה מעלות יש בקו ישר?', `הורידו את ${L(known + '°')} מ-${L('180°')}.`, { known }, 10);
  },
  /* two lines crossing: the angle across (vert) or the angle next to it (vert2) */
  vert(d, two) {
    const th = pick([40, 45, 50, 55, 60, 65, 70, 115, 120, 125, 130, 135, 140]), phi = pick([0, 5, 10, 15, 20]), kk = ri(0, 3), tg = two ? (kk + pick([1, 3])) % 4 : (kk + 2) % 4;
    const val = i => i % 2 ? 180 - th : th, known = val(kk), ans = val(tg);
    const labs = [0, 1, 2, 3].map(i => i === kk ? gA(known) : i === tg ? 'x' : ''), ts = [0, 1, 2, 3].map(i => i === kk ? 'k' : i === tg ? 'x' : 'n');
    const mid = two ? -1 : (kk + 1) % 4, slabs = [0, 1, 2, 3].map(i => i === kk ? gA(known) : i === tg ? gA(ans) : i === mid ? gA(180 - known) : ''), sts = [0, 1, 2, 3].map(i => i === kk ? 'k' : i === tg ? 's' : i === mid ? 'g' : 'n');
    const ex = two ? mEx('x והזווית הנתונה צמודות: הן יושבות על אותו קו ישר, ולכן יחד הן 180°.',
      [`${L(`x = 180° − ${known}° = <b>${ans}°</b>`)}`, `בדיקה: ${L(`${known}° + ${ans}° = 180°`)} ✓`], figCross(th, phi, slabs, sts),
      gTrap('לחשוב ש-x שווה לזווית הנתונה. רק הזווית שממול (הקודקודית) שווה לה.'), 'שני קווים ישרים שנחתכים. זווית שממול: שווה. זווית שלידה: משלימה ל-180°.')
      : mEx('זוויות קודקודיות (אחת מול השנייה, כשני קווים נחתכים) שוות זו לזו.',
        [`x נמצאת מול ${L(known + '°')}, ולכן ${L(`x = <b>${known}°</b>`)}`, `למה? הזווית שביניהן (בירוק) היא ${L(`180° − ${known}° = ${180 - known}°`)}`, `ו-x משלימה אותה ל-180°: ${L(`180° − ${180 - known}° = ${ans}°`)}`], figCross(th, phi, slabs, sts),
        gTrap(`לחשב ${L(`180° − ${known}°`)}. זו הזווית שליד, לא זו שממול.`), 'שני קווים ישרים שנחתכים. זווית שממול: שווה. זווית שלידה: משלימה ל-180°.');
    return gMake('angle', two ? 'vert2' : 'vert', d, 'שני קווים ישרים נחתכים. מה גודל הזווית x?', figCross(th, phi, labs, ts), ans,
      [[180 - ans, two ? 'זו הזווית שממול, והיא שווה לזווית הנתונה' : 'זו הזווית שליד, לא זו שממול'], [360 - ans, 'חיסרו מ-360°'], [90, 'הזווית לא ישרה'], [Math.abs(ans - 10), '']], gDeg, ex,
      two ? 'x ליד הזווית הנתונה, על אותו קו ישר. כמה מעלות יש בקו ישר?' : 'x נמצאת ממול לזווית הנתונה, באותו קודקוד. מה ידוע על זוויות שממול?',
      two ? `הורידו את ${L(known + '°')} מ-${L('180°')}.` : `זוויות שממול נקראות קודקודיות. אפשר גם לבדוק: הזווית שביניהן היא ${L(`180° − ${known}°`)}, ו-x משלימה אותה ל-180°.`, { known }, 10);
  },
  /* a triangle: two angles given */
  tri(d) {
    for (;;) {
      const st = d === 1 ? 10 : 5, rt = d >= 2 && R() < .3;
      const a1 = rt ? 90 : ri(Math.ceil(30 / st), Math.floor(100 / st)) * st, a2 = ri(Math.ceil(30 / st), Math.floor(85 / st)) * st, a3 = 180 - a1 - a2;
      if (a3 < 30 || a3 > 110) continue;
      const all = shuffle([a1, a2, a3]), [A, B, C] = all;
      if (Math.max(A, B) > 115 || (A > 95 && B > 55) || (B > 95 && A > 55) || A + B > 135) continue;
      const xi = shuffle([0, 1, 2]).find(i => all[i] !== 90), V = ['A', 'B', 'C'], x = all[xi], kn = all.filter((_, i) => i !== xi);
      const lab = {}, t = {}, slab = {}, stt = {};
      V.forEach((k, i) => { lab[k] = i === xi ? 'x' : all[i] === 90 ? '' : gA(all[i]); t[k] = i === xi ? 'x' : 'k'; slab[k] = i === xi ? gA(x) : lab[k]; stt[k] = i === xi ? 's' : 'k'; });
      const hasR = kn.includes(90);
      const ex = mEx('סכום שלוש הזוויות בכל משולש הוא 180°.',
        [hasR ? 'הריבוע הקטן מסמן זווית ישרה: 90°' : '', `שתי הזוויות הידועות: ${L(`${kn[0]}° + ${kn[1]}° = ${kn[0] + kn[1]}°`)}`, `${L(`x = 180° − ${kn[0] + kn[1]}° = <b>${x}°</b>`)}`, `בדיקה: ${L(`${A}° + ${B}° + ${C}° = 180°`)} ✓`],
        figTri(A, B, slab, stt), gTrap('לחסר מ-360°. 360° זה במרובע. במשולש: 180°.'), 'משולש ששתיים מהזוויות שלו ידועות.');
      return gMake('angle', 'tri', d, 'מה גודל הזווית x במשולש?', figTri(A, B, lab, t), x,
        [[360 - kn[0] - kn[1], 'חיסרו מ-360°, אבל במשולש יש 180°'], [kn[0] + kn[1], 'זה הסכום של שתי הזוויות הידועות'], [180 - kn[0], 'הורידו רק זווית אחת'], [180 - kn[1], 'הורידו רק זווית אחת']], gDeg, ex,
        `כמה מעלות יש בסך הכל בשלוש הזוויות של משולש?${hasR ? ' הריבוע הקטן מסמן זווית של 90°.' : ''}`, `חברו את שתי הזוויות הידועות (${L(`${kn[0]}° + ${kn[1]}°`)}), והורידו את הסכום מ-${L('180°')}.`, { A, B, C, kn, x, xi }, 10);
    }
  },
  /* angles around a point */
  point(d) {
    for (;;) {
      const n = pick([3, 4, 4]), st = d >= 3 ? 5 : 10, kn = Array.from({ length: n - 1 }, () => ri(n === 3 ? 90 / st : 60 / st, n === 3 ? 150 / st : 120 / st) * st);
      if (n === 4 && R() < .35) kn[ri(0, 2)] = 90;
      const x = 360 - kn.reduce((a, b) => a + b, 0); if (x < 55 || x > 160 || kn.includes(x) || x === 90) continue;
      const xi = ri(0, n - 1), spans = kn.slice(); spans.splice(xi, 0, x);
      const sum = kn.reduce((a, b) => a + b, 0), labs = spans.map((v, i) => i === xi ? 'x' : v === 90 ? '' : gA(v)), ts = spans.map((v, i) => i === xi ? 'x' : 'k'), s0 = pick([0, 10, 20, 30, 80, 100]);
      const ex = mEx('כל הזוויות מסביב לנקודה משלימות סיבוב שלם: 360°.',
        [kn.includes(90) ? 'הריבוע הקטן מסמן 90°' : '', `הזוויות הידועות: ${L(`${kn.map(v => v + '°').join(' + ')} = ${sum}°`)}`, `${L(`x = 360° − ${sum}° = <b>${x}°</b>`)}`, `בדיקה: ${L(`${spans.map(v => v + '°').join(' + ')} = 360°`)} ✓`],
        figStar(spans, s0, spans.map((v, i) => i === xi ? gA(x) : v === 90 ? '' : gA(v)), spans.map((v, i) => i === xi ? 's' : 'k')),
        gTrap('לחסר מ-180°. 180° זה רק קו ישר, חצי סיבוב.'), 'כמה קווים שיוצאים מנקודה אחת, והזוויות מקיפות אותה מכל הצדדים.');
      return gMake('angle', 'point', d, 'כמה קרניים יוצאות מנקודה אחת. מה גודל הזווית x?', figStar(spans, s0, labs, ts), x,
        [[sum, 'זה הסכום של הזוויות הידועות'], [360 - kn[0], 'הורידו רק זווית אחת'], [Math.abs(180 - sum) || null, 'חיסרו מ-180°, אבל סביב נקודה יש 360°'], [x + 10, '']], gDeg, ex,
        'הזוויות מקיפות את הנקודה מכל הצדדים. כמה מעלות יש בסיבוב שלם?', `חברו את הזוויות הידועות${kn.includes(90) ? ' (הריבוע הוא 90°)' : ''}, והורידו את הסכום מ-${L('360°')}.`, { kn, x }, 10);
    }
  },
  /* isosceles and equilateral triangles */
  iso(d) {
    const K = pick(d === 1 ? ['eq', 'apex'] : d === 2 ? ['apex', 'base', 'eq'] : ['apex', 'base', 'ext']);
    if (K === 'eq') {
      const ex = mEx('במשולש שווה צלעות כל שלוש הזוויות שוות.', [`${L('180° ÷ 3 = <b>60°</b>')}`], figTri(60, 60, { A: gA(60), B: gA(60), C: gA(60) }, { A: 'k', B: 'k', C: 's' }, { ticks: 3 }),
        gTrap('לחשוב ש-x תלויה באורך הצלעות. בכל משולש שווה צלעות, גדול או קטן, הזוויות הן 60°.'), 'שלוש צלעות מסומנות באותו סימן: משולש שווה צלעות.');
      return gMake('angle', 'iso', d, 'במשולש הזה שלוש הצלעות שוות (הן מסומנות בקו קטן). מה גודל הזווית x?', figTri(60, 60, { A: '', B: '', C: 'x' }, { A: 'n', B: 'n', C: 'x' }, { ticks: 3 }), 60,
        [[90, 'הזווית לא ישרה'], [180, 'זה הסכום של שלוש הזוויות'], [45, 'חילקו ב-4'], [120, 'זו הזווית שמחוץ למשולש']], gDeg, ex,
        'כמה מעלות יש בסך הכל בשלוש הזוויות של משולש? וכאן כל הזוויות שוות זו לזו.', `מחלקים את ${L('180°')} לשלושה חלקים שווים.`, {}, 10);
    }
    if (K === 'apex') {
      const C = pick([50, 70, 80, 100, 110, 120]), b = (180 - C) / 2;
      const ex = mEx('במשולש שווה שוקיים שתי זוויות הבסיס שוות.', [`שתי זוויות הבסיס יחד: ${L(`180° − ${C}° = ${180 - C}°`)}`, `כל אחת: ${L(`${180 - C}° ÷ 2 = <b>${b}°</b>`)}`, `בדיקה: ${L(`${b}° + ${b}° + ${C}° = 180°`)} ✓`],
        figTri(b, b, { A: gA(b), B: gA(b), C: gA(C) }, { A: 's', B: 'g', C: 'k' }, { ticks: 1 }), gTrap(`לעצור ב-${L(`${180 - C}°`)}. זה הסכום של שתי זוויות הבסיס, וצריך לחלק ב-2.`), 'שתי צלעות מסומנות באותו סימן: משולש שווה שוקיים, וזוויות הבסיס שוות.');
      return gMake('angle', 'iso', d, 'במשולש שווה שוקיים, שתי הצלעות המסומנות שוות. מה גודל הזווית x?', figTri(b, b, { A: 'x', B: '', C: gA(C) }, { A: 'x', B: 'n', C: 'k' }, { ticks: 1 }), b,
        [[180 - C, 'שכחו לחלק ב-2'], [C, 'זו הזווית שלמעלה'], [(360 - C) / 2, 'חיסרו מ-360°'], [b + 10, '']], gDeg, ex,
        'במשולש שווה שוקיים שתי הזוויות שליד הבסיס שוות זו לזו. כמה מעלות נשארות להן יחד?', `שתי זוויות הבסיס יחד: ${L(`180° − ${C}°`)}. הן שוות, אז כל אחת היא חצי.`, { C, b }, 5);
    }
    if (K === 'base') {
      const b = pick([35, 40, 45, 50, 55, 65]), C = 180 - 2 * b;
      const ex = mEx('במשולש שווה שוקיים שתי זוויות הבסיס שוות.', [`הזווית השנייה ליד הבסיס גם היא ${L(b + '°')}`, `${L(`x = 180° − ${b}° − ${b}° = <b>${C}°</b>`)}`],
        figTri(b, b, { A: gA(b), B: gA(b), C: gA(C) }, { A: 'k', B: 'g', C: 's' }, { ticks: 1 }), gTrap(`להוריד רק את ${L(b + '°')} אחת. שתי זוויות הבסיס שוות, ושתיהן במשולש.`), 'שתי צלעות מסומנות באותו סימן: משולש שווה שוקיים, וזוויות הבסיס שוות.');
      return gMake('angle', 'iso', d, 'במשולש שווה שוקיים, שתי הצלעות המסומנות שוות. מה גודל הזווית x?', figTri(b, b, { A: gA(b), B: '', C: 'x' }, { A: 'k', B: 'n', C: 'x' }, { ticks: 1 }), C,
        [[180 - b, 'הורידו רק זווית בסיס אחת'], [b, 'זו זווית בסיס'], [(180 - b) / 2, 'חילקו ב-2, כאילו נתונה הזווית שלמעלה'], [C + 10, '']], gDeg, ex,
        'במשולש שווה שוקיים שתי הזוויות שליד הבסיס שוות. מה גודל הזווית השנייה ליד הבסיס?', `שתי זוויות הבסיס הן ${L(b + '°')} כל אחת. כמה נשאר מ-${L('180°')}?`, { b, C }, 10);
    }
    const b = pick([50, 55, 65]), e = 180 - b, C = 180 - 2 * b;
    const ex = mEx('שני צעדים: הזווית שבחוץ נותנת את זווית הבסיס, ואז משתמשים במשולש שווה שוקיים.',
      [`זווית הבסיס הימנית צמודה ל-${L(e + '°')}: ${L(`180° − ${e}° = ${b}°`)}`, `גם זווית הבסיס השנייה ${L(b + '°')} (משולש שווה שוקיים)`, `${L(`x = 180° − ${b}° − ${b}° = <b>${C}°</b>`)}`],
      figTri(b, b, { A: gA(b), B: gA(b), C: gA(C), E: gA(e) }, { A: 'g', B: 'g', C: 's', E: 'k' }, { ticks: 1 }), gTrap(`לעצור ב-${L(b + '°')}. זו זווית הבסיס, ושואלים על הזווית שלמעלה.`), 'זווית מחוץ למשולש, על המשך של צלע: היא צמודה לזווית שבפנים, ויחד הן 180°.');
    return gMake('angle', 'iso3', d, 'במשולש שווה שוקיים, שתי הצלעות המסומנות שוות. הבסיס ממשיך ימינה בקו ישר. מה גודל הזווית x?', figTri(b, b, { A: '', B: '', C: 'x', E: gA(e) }, { A: 'n', B: 'n', C: 'x', E: 'k' }, { ticks: 1 }), C,
      [[b, 'זו זווית הבסיס'], [180 - b, 'הורידו רק זווית בסיס אחת'], [e - b > 0 ? e - b : null, ''], [180 - e, 'זו זווית הבסיס']], gDeg, ex,
      `הזווית ${L(e + '°')} והזווית הימנית שבתוך המשולש יושבות על אותו קו ישר. כמה מעלות יש בזווית שבפנים?`, `זווית הבסיס היא ${L(`180° − ${e}°`)}, והזווית השנייה ליד הבסיס שווה לה. מה נשאר ל-x מתוך ${L('180°')}?`, { b, e, C }, 10);
  },
  /* a quadrilateral: three angles given */
  quad(d) {
    for (;;) {
      const st = d >= 3 ? 5 : 10, rt = R() < (d >= 3 ? .6 : .3);
      const ang = [ri(60 / st, 130 / st) * st, ri(60 / st, 130 / st) * st, ri(60 / st, 130 / st) * st]; if (rt) ang[ri(0, 2)] = 90;
      const x = 360 - ang[0] - ang[1] - ang[2]; if (x < 55 || x > 140 || (x === 90 && ang.includes(90))) continue;
      const xi = ri(0, 3), all = ang.slice(); all.splice(xi, 0, x);
      const P = quadPts(all[0], all[1], all[2]); if (!P) continue;
      const kn = all.filter((_, i) => i !== xi), sum = kn.reduce((a, b) => a + b, 0);
      const labs = all.map((v, i) => i === xi ? 'x' : v === 90 ? '' : gA(v)), ts = all.map((v, i) => i === xi ? 'x' : 'k');
      const ex = mEx(`סכום ארבע הזוויות בכל מרובע הוא 360°. (אלכסון מחלק מרובע לשני משולשים: ${L('180° + 180° = 360°')}.)`,
        [kn.includes(90) ? 'הריבוע הקטן מסמן 90°' : '', `שלוש הזוויות הידועות: ${L(`${kn.map(v => v + '°').join(' + ')} = ${sum}°`)}`, `${L(`x = 360° − ${sum}° = <b>${x}°</b>`)}`],
        figQuad(P, all.map((v, i) => i === xi ? gA(x) : v === 90 ? '' : gA(v)), all.map((v, i) => i === xi ? 's' : 'k')),
        gTrap('לחשוב שגם במרובע יש 180°. 180° זה במשולש.'), 'צורה עם ארבע צלעות, ושלוש זוויות ידועות.');
      return gMake('angle', 'quad', d, 'מה גודל הזווית x במרובע?', figQuad(P, labs, ts), x,
        [[360 - kn[0] - kn[1], 'שכחו את אחת הזוויות'], [sum, 'זה הסכום של שלוש הזוויות'], [Math.abs(sum - 180), 'חישבו כאילו במרובע יש 180°'], [x + 10, '']], gDeg, ex,
        `כמה מעלות יש בסך הכל בארבע הזוויות של מרובע? (אלכסון מחלק אותו לשני משולשים.)${kn.includes(90) ? ' הריבוע הקטן הוא 90°.' : ''}`, `חברו את שלוש הזוויות הידועות, והורידו את הסכום מ-${L('360°')}.`, { kn, x }, 10);
    }
  },
  /* the outside angle of a triangle */
  ext(d) {
    for (;;) {
      const A = pick([35, 40, 45, 50, 55, 60, 65, 70]), C = pick([30, 40, 45, 50, 60, 70, 80]), B = 180 - A - C; if (B < 35 || B > 110) continue;
      const E = A + C, back = R() < .5; if (B === C || E === 90 || A + B > 135) continue;
      if (!back) {
        const ex = mEx('זווית חיצונית של משולש שווה לסכום שתי הזוויות שבפנים שלא צמודות אליה.',
          [`${L(`x = ${A}° + ${C}° = <b>${E}°</b>`)}`, `בדיקה בדרך אחרת: הזווית שבפנים ליד x היא ${L(`180° − ${A}° − ${C}° = ${B}°`)}`, `ו-x צמודה לה: ${L(`180° − ${B}° = ${E}°`)} ✓`],
          figTri(A, B, { A: gA(A), B: gA(B), C: gA(C), E: gA(E) }, { A: 'k', B: 'g', C: 'k', E: 's' }), gTrap(`לענות ${L(B + '°')}. זו הזווית שבפנים, ו-x בחוץ.`), 'זווית בחוץ, בין צלע של המשולש לבין ההמשך של צלע אחרת.');
        return gMake('angle', 'ext', d, 'הבסיס של המשולש ממשיך ימינה בקו ישר. מה גודל הזווית x שבחוץ?', figTri(A, B, { A: gA(A), B: '', C: gA(C), E: 'x' }, { A: 'k', B: 'n', C: 'k', E: 'x' }), E,
          [[B, 'זו הזווית שבפנים, ליד x'], [360 - E, 'חיסרו מ-360°'], [180 - A, 'השתמשו רק בזווית אחת'], [E + 10, '']], gDeg, ex,
          'x והזווית שבתוך המשולש לידה יושבות על אותו קו ישר. מה גודל הזווית שבפנים?', `הזווית שבפנים ליד x: ${L(`180° − ${A}° − ${C}°`)}. ו-x משלימה אותה ל-${L('180°')}.`, { A, B, C, E }, 10);
      }
      const ex = mEx('הזווית שבחוץ שווה לסכום שתי הזוויות שבפנים שלא צמודות אליה. לכן x היא החלק שחסר.',
        [`${L(`${A}° + x = ${E}°`)}`, `${L(`x = ${E}° − ${A}° = <b>${C}°</b>`)}`, `בדיקה: הזווית שבפנים ליד ${L(E + '°')} היא ${L(`180° − ${E}° = ${B}°`)}, ו-${L(`${A}° + ${B}° + ${C}° = 180°`)} ✓`],
        figTri(A, B, { A: gA(A), B: gA(B), C: gA(C), E: gA(E) }, { A: 'k', B: 'g', C: 's', E: 'k' }), gTrap(`לחבר ${L(`${E}° + ${A}°`)}. הזווית שבחוץ כבר כוללת את שתיהן.`), 'זווית בחוץ, בין צלע של המשולש לבין ההמשך של צלע אחרת.');
      return gMake('angle', 'ext', d, 'הבסיס של המשולש ממשיך ימינה בקו ישר. מה גודל הזווית x?', figTri(A, B, { A: gA(A), B: '', C: 'x', E: gA(E) }, { A: 'k', B: 'n', C: 'x', E: 'k' }), C,
        [[B, 'זו הזווית שבפנים, ליד הזווית שבחוץ'], [E + A, 'חיברו במקום לחסר'], [180 - E, 'זו הזווית שבפנים ליד הזווית שבחוץ'], [180 - A, '']], gDeg, ex,
        `קודם מצאו את הזווית שבתוך המשולש ליד ${L(E + '°')}: הן יושבות על אותו קו ישר.`, `הזווית שבפנים: ${L(`180° − ${E}° = ${B}°`)}. עכשיו יש שתי זוויות במשולש. כמה נשאר ל-x?`, { A, B, C, E }, 10);
    }
  },
  /* a triangle with its two sides continued past the top corner: the angle up there is equal to the top angle */
  combo(d) {
    for (;;) {
      const C = pick([50, 60, 70, 80]), A = pick([45, 50, 55, 60, 65, 70]), B = 180 - A - C; if (B < 35 || B > 95) continue;
      const ex = mEx('שני צעדים: זווית קודקודית, ואז סכום הזוויות במשולש.',
        [`הזווית למעלה והזווית שבראש המשולש קודקודיות, ולכן שוות: ${L(C + '°')}`, `${L(`x = 180° − ${A}° − ${C}° = <b>${B}°</b>`)}`],
        figTri(A, B, { A: gA(A), B: gA(B), C: gA(C), T: gA(C) }, { A: 'k', B: 's', C: 'g', T: 'k' }), gTrap(`לענות ${L(`180° − ${A}° = ${180 - A}°`)}. שכחו את הזווית שבראש המשולש.`), 'שני קווים שממשיכים מעבר לפינה: הזווית שנוצרה שם היא קודקודית לזווית שבפנים.');
      return gMake('angle', 'combo', d, 'שתי הצלעות העליונות של המשולש ממשיכות למעלה בקו ישר. מה גודל הזווית x?', figTri(A, B, { A: gA(A), B: 'x', C: '', T: gA(C) }, { A: 'k', B: 'x', C: 'n', T: 'k' }), B,
        [[180 - A, 'שכחו את הזווית שבראש המשולש'], [180 - C, 'שכחו את הזווית הנתונה למטה'], [A + C, 'זו הזווית שמחוץ למשולש'], [B + 10, '']], gDeg, ex,
        `הזווית ${L(C + '°')} למעלה נוצרת משני קווים ישרים שנחתכים. איזו זווית בתוך המשולש נמצאת ממולה?`, `הזווית שבראש המשולש היא גם ${L(C + '°')} (קודקודיות). עכשיו יש שתי זוויות במשולש.`, { A, B, C }, 10);
    }
  },
  /* two angles on a line, one k times the other, or bigger by m */
  ratio(d) {
    const K = pick(['times', 'more']);
    if (K === 'times') {
      const k = pick([2, 3, 4, 5, 8]), x = 180 / (k + 1);
      const ex = mEx(`שתי הזוויות יחד הן 180°. הזווית הגדולה היא ${k} פעמים x, אז יחד הן ${k + 1} פעמים x.`,
        [`${L(`x + ${k}x = ${k + 1}x = 180°`)}`, `${L(`x = 180° ÷ ${k + 1} = <b>${x}°</b>`)}`, `הזווית הגדולה: ${L(`${k} × ${x}° = ${k * x}°`)}. בדיקה: ${L(`${x}° + ${k * x}° = 180°`)} ✓`],
        figLine(x, [gA(x), gA(k * x)], ['s', 'g']), gTrap(`לחלק ב-${k}. יש כאן ${k + 1} חלקים שווים: x אחד ועוד ${k} פעמים x.`), 'שתי זוויות צמודות, ואחת "פי כמה" מהשנייה.');
      return gMake('angle', 'ratio', d, `שתי זוויות צמודות על קו ישר. הגדולה גדולה פי ${k} מהקטנה. מה גודל הזווית הקטנה, x?`, figLine(x, ['x', `${k}x`], ['x', 'k']), x,
        [[180 / k, `חילקו ב-${k} במקום ב-${k + 1}`], [k * x, 'זו הזווית הגדולה'], [360 / (k + 1), 'חיסרו מ-360°'], [90, 'חילקו ב-2']], gDeg, ex,
        `x ועוד ${k}x הם ביחד קו ישר. כמה פעמים x יש בסך הכל?`, `${L(`x + ${k}x = ${k + 1}x`)}, וזה ${L('180°')}. כמה זה x אחד?`, { k }, 5);
    }
    const m = pick([20, 30, 40, 50, 60, 80]), x = (180 - m) / 2;
    const ex = mEx('אם מורידים מהזווית הגדולה את התוספת, נשארות שתי זוויות שוות.',
      [`${L(`x + x + ${m}° = 180°`)}`, `${L(`x + x = 180° − ${m}° = ${180 - m}°`)}`, `${L(`x = ${180 - m}° ÷ 2 = <b>${x}°</b>`)}`, `בדיקה: ${L(`${x}° + ${x + m}° = 180°`)} ✓`],
      figLine(x, [gA(x), gA(x + m)], ['s', 'g']), gTrap(`לחלק את 180° ב-2 (${L('90°')}) ולשכוח את התוספת, או לא לחלק ב-2 בסוף.`), 'שתי זוויות צמודות, ואחת גדולה "ב..." מהשנייה.');
    return gMake('angle', 'ratio', d, `שתי זוויות צמודות על קו ישר. הגדולה גדולה ב-${L(m + '°')} מהקטנה. מה גודל הזווית הקטנה, x?`, figLine(x, ['x', `x + ${m}°`], ['x', 'k']), x,
      [[180 - m, 'שכחו לחלק ב-2'], [x + m, 'זו הזווית הגדולה'], [90 - m, ''], [90, 'שכחו את התוספת']], gDeg, ex,
      `אם מורידים ${L(m + '°')} מהזווית הגדולה, שתי הזוויות שוות. כמה מעלות נשארות לשתיהן יחד?`, `${L(`180° − ${m}°`)} מתחלק שווה לשתי זוויות.`, { m }, 5);
  },
};
/* ===== AREA AND PERIMETER ===== */
const TRIPLES = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15], [8, 15, 17], [15, 8, 17]];
const GAR = {
  /* area or perimeter, with the unit in the option */
  unit(d) {
    for (;;) {
      const a = ri(4, 12), b = ri(3, a - 1), A = a * b, P = 2 * (a + b); if (A === P) continue;
      const area = R() < .6, ans = area ? [A, CM2] : [P, CM], s = v => L(fmt(v[0])) + ' ' + v[1];
      const c = area ? [[[A, CM], 'המספר נכון, אבל שטח מודדים בסמ"ר'], [[P, CM], 'זה ההיקף'], [[P, CM2], 'זה ההיקף, ועם יחידה של שטח']] : [[[P, CM2], 'המספר נכון, אבל היקף מודדים בס"מ'], [[A, CM2], 'זה השטח'], [[A, CM], 'זה השטח, ועם יחידה של אורך']];
      const ex = area ? mEx('שטח = אורך × רוחב. מודדים אותו ביחידות ריבועיות: סמ"ר, סנטימטר רבוע.',
        [`${L(`${a} × ${b} = ${A}`)}`, 'כל משבצת בציור היא ריבוע של 1 ס"מ על 1 ס"מ, כלומר 1 סמ"ר', `התשובה: ${mB(L(A) + ' ' + CM2)}`], figRect(a, b, { grid: 1, inner: gL(A, CM2) }),
        gTrap(`לכתוב ${L(A)} ס"מ. ס"מ היא יחידה של אורך. ${L(P)} ס"מ זה ההיקף.`), 'שטח נמדד בסמ"ר (משבצות). היקף נמדד בס"מ (דרך). בודקים גם את המספר וגם את היחידה.')
        : mEx('היקף הוא הדרך מסביב: מחברים את כל הצלעות. מודדים אותו ביחידות של אורך: ס"מ.',
          [`${L(`${a} + ${b} + ${a} + ${b} = ${P}`)}`, `התשובה: ${mB(L(P) + ' ' + CM)}`], figRect(a, b, { per: 1, all: [gL(a), gL(b)] }),
          gTrap(`לכתוב סמ"ר. סמ"ר זו יחידה של שטח. ${L(A)} סמ"ר זה השטח.`), 'שטח נמדד בסמ"ר (משבצות). היקף נמדד בס"מ (דרך). בודקים גם את המספר וגם את היחידה.');
      const q = gMake('area', 'unit', d, `מה ${area ? 'השטח' : 'ההיקף'} של המלבן? שימו לב גם ליחידות.`, figRect(a, b), ans, c, s, ex,
        area ? 'שטח הוא כמה ריבועים של 1 ס"מ על 1 ס"מ נכנסים בפנים. באיזו יחידה מודדים ריבועים כאלה?' : 'היקף הוא אורך הדרך מסביב למלבן. באיזו יחידה מודדים אורך?',
        area ? `כפלו ${L(`${a} × ${b}`)}, ובחרו את התשובה עם סמ"ר.` : `חברו את ארבע הצלעות: ${L(`${a} + ${b} + ${a} + ${b}`)}, ובחרו את התשובה עם ס"מ.`, { a, b }, 1, ans[0]);
      return q;
    }
  },
  /* a rectangle or a square: area or perimeter */
  rect(d) {
    const sq = R() < .4, a = ri(4, 13), b = sq ? a : ri(3, a - 1), area = R() < .5, A = a * b, P = 2 * (a + b);
    if (A === P) return GAR.rect(d);
    const nm = sq ? 'הריבוע' : 'המלבן', fig = o => sq ? figRect(a, a, Object.assign({ lb: '', ticks: 1 }, o)) : figRect(a, b, o);
    const ex = area ? mEx(`שטח ${sq ? 'ריבוע = צלע × צלע' : 'מלבן = אורך × רוחב'}: כמה ריבועים של 1 ס"מ נכנסים בפנים.`,
      [`${L(`${a} × ${b} = ${A}`)}`, `${mB(L(A) + ' ' + CM2)}`], fig({ grid: 1, inner: gL(A, CM2) }), gTrap(`לחבר את הצלעות (${L(P)}). זה ההיקף, הדרך מסביב.`), 'שואלים "כמה מקום בפנים" (שטח) או "כמה דרך מסביב" (היקף)?')
      : mEx('היקף = הדרך מסביב: מחברים את כל הצלעות.',
        [sq ? `לריבוע 4 צלעות שוות: ${L(`4 × ${a} = ${P}`)}` : `${L(`${a} + ${b} + ${a} + ${b} = ${P}`)}`, `${mB(L(P) + ' ' + CM)}`], fig({ per: 1, all: sq ? null : [gL(a), gL(b)] }), gTrap(`לכפול ${L(`${a} × ${b}`)}. זה השטח.`), 'שואלים "כמה מקום בפנים" (שטח) או "כמה דרך מסביב" (היקף)?');
    return gMake('area', 'rect', d, `${sq ? 'לריבוע ארבע צלעות שוות.' : ''} מה ${area ? 'השטח' : 'ההיקף'} של ${nm}?`.trim(), fig({}), area ? A : P,
      area ? [[P, 'זה ההיקף'], [a + b, 'חיברו שתי צלעות'], [2 * A, 'הכפילו ב-2']] : [[A, 'זה השטח'], [a + b, 'רק חצי מהדרך מסביב'], [sq ? 2 * a : 2 * a + b, 'חסרות צלעות']], gUn(area ? CM2 : CM), ex,
      area ? `שטח הוא כמה ריבועים של 1 על 1 נכנסים בפנים: ${b} שורות, ובכל שורה ${a} ריבועים.` : `היקף הוא כל הדרך מסביב: ${sq ? 'ארבע צלעות שוות' : `שתי צלעות של ${a} ושתי צלעות של ${b}`}.`,
      area ? `כפלו ${L(`${a} × ${b}`)}.` : sq ? `ארבע צלעות של ${a}: ${L(`4 × ${a}`)}.` : `${L(`${a} + ${a} = ${2 * a}`)}. הוסיפו את שתי הצלעות של ${b}.`, { a, b }, 2);
  },
  /* a square from its perimeter: the side (d1) or the area (d2) */
  sq(d) {
    const s0 = ri(3, 12), P = 4 * s0, area = d >= 2;
    const ex = mEx(area ? 'קודם צלע: לריבוע 4 צלעות שוות, אז מחלקים את ההיקף ב-4. ואז שטח = צלע × צלע.' : 'לריבוע 4 צלעות שוות, ולכן הצלע היא רבע מההיקף.',
      [`צלע: ${L(`${P} ÷ 4 = ${s0}`)} ס"מ`, area ? `שטח: ${L(`${s0} × ${s0} = <b>${s0 * s0}</b>`)} ${CM2}` : `${mB(L(s0) + ' ' + CM)}`, `בדיקה: ${L(`${s0} + ${s0} + ${s0} + ${s0} = ${P}`)} ✓`],
      figRect(s0, s0, { lb: area ? '' : '', la: gL(s0), ticks: 1, grid: area && s0 <= 10 ? 1 : 0, inner: area ? gL(s0 * s0, CM2) : '' }),
      gTrap(area ? `לחלק ב-2 (${L(P / 2)}). בריבוע יש 4 צלעות, לא 2.` : `לחלק ב-2. בריבוע יש 4 צלעות.`), 'נתון היקף של ריבוע. הצלע היא תמיד ההיקף ÷ 4.');
    return gMake('area', 'sq', d, `ההיקף של ריבוע הוא ${P} ס"מ. ${area ? 'מה השטח שלו?' : 'מה אורך הצלע שלו?'}`, figRect(s0, s0, { la: '?', lb: '', ticks: 1 }), area ? s0 * s0 : s0,
      area ? [[P, 'זה ההיקף'], [(P / 2) * (P / 2), 'חילקו ב-2 במקום ב-4'], [s0, 'זו הצלע'], [4 * s0 * s0, '']] : [[P / 2, 'חילקו ב-2, אבל בריבוע 4 צלעות'], [4 * P, 'כפלו ב-4 במקום לחלק'], [P - 4, 'הורידו 4 במקום לחלק']], gUn(area ? CM2 : CM), ex,
      'לריבוע ארבע צלעות שוות, וההיקף הוא כולן ביחד. איזה חלק מההיקף היא צלע אחת?', area ? `צלע אחת: ${L(`${P} ÷ 4`)}. אחר כך שטח = צלע × צלע.` : `מחלקים את ${L(P)} לארבעה חלקים שווים.`, { s0, P }, area ? 4 : 1);
  },
  /* a right triangle: half of a rectangle */
  triR(d) {
    const [a0, b0, c0] = pick(TRIPLES.filter(t => t[2] <= 15)), k = c0 <= 5 ? pick([1, 2, 3]) : 1, a = a0 * k, b = b0 * k, c = c0 * k, A = a * b / 2;
    const ex = mEx('משולש ישר זווית הוא חצי ממלבן. השטח: צלע × צלע (שתי הצלעות שליד הזווית הישרה) ÷ 2.',
      [`המלבן כולו: ${L(`${a} × ${b} = ${a * b}`)}`, `המשולש הוא חצי: ${L(`${a * b} ÷ 2 = <b>${A}</b>`)} ${CM2}`], figTriR(a, b, gL(a), gL(b), gL(c), { rect: 1, hb: 1, inner: gL(A, CM2) }),
      gTrap(`לשכוח לחלק ב-2 (${L(a * b)}), או להשתמש בצלע הארוכה (${L(c)}). הצלע הארוכה לא יוצאת מהזווית הישרה.`), 'ריבוע קטן בפינה: שתי הצלעות שלידו הן הבסיס והגובה.');
    return gMake('area', 'triR', d, 'מה השטח של המשולש ישר הזווית?', figTriR(a, b, gL(a), gL(b), gL(c)), A,
      [[a * b, 'שכחו לחלק ב-2'], [a * c / 2, 'השתמשו בצלע הארוכה'], [a + b + c, 'זה ההיקף'], [b * c / 2, 'השתמשו בצלע הארוכה']], gUn(CM2), ex,
      'משולש ישר זווית הוא חצי ממלבן. אילו שתי צלעות יוצאות מהזווית הישרה?', `שתי הצלעות שליד הריבוע הקטן: ${a} ו-${b}. כפלו אותן, ואז חצי.`, { a, b, c }, 2);
  },
  /* a triangle with the height inside; one slanted side is labelled too */
  tri(d) {
    for (;;) {
      const [p, h, s] = pick(TRIPLES.filter(t => t[0] >= t[1] * .75)), q = ri(Math.max(2, Math.ceil(p * .7)), Math.ceil(p * 1.6)), b = p + q, A = b * h / 2; if (!Number.isInteger(A) || b > 30 || b < h) continue;
      const ex = mEx('שטח משולש = בסיס × גובה ÷ 2. הגובה הוא הקו המקווקו שיורד אל הבסיס בזווית ישרה.',
        [`בסיס: ${b}. גובה: ${h} (הקו המקווקו, לא הצלע המשופעת)`, `${L(`${b} × ${h} = ${b * h}`)}`, `${L(`${b * h} ÷ 2 = <b>${A}</b>`)} ${CM2}`],
        figTriH(b, p, h, { ls: gL(s), hb: 1, rect: 1, inner: gL(A, CM2) }) + mLeg([['m', 'המלבן שמסביב: המשולש הוא בדיוק חצי ממנו']]),
        gTrap(`לכפול בצלע המשופעת (${L(s)}). היא לא עומדת ישר על הבסיס, ולכן היא לא הגובה.`), 'משולש עם קו מקווקו וריבוע קטן בתחתית: הקו המקווקו הוא הגובה.');
      return gMake('area', 'tri', d, 'הקו המקווקו הוא הגובה של המשולש. מה השטח של המשולש?', figTriH(b, p, h, { ls: gL(s) }), A,
        [[b * h, 'שכחו לחלק ב-2'], [b * s / 2, 'השתמשו בצלע המשופעת במקום בגובה'], [b + h + s, 'חיברו את המספרים'], [b * s, '']], gUn(CM2), ex,
        `שטח משולש: בסיס × גובה ÷ 2. איזה מספר בציור הוא הגובה: ${s} או ${h}?`, `הגובה הוא ${h} (הקו המקווקו). כפלו ${L(`${b} × ${h}`)}, ואז חצי.`, { b, p, h, s }, 2);
    }
  },
  /* an obtuse triangle: the height falls outside, on the continuation of the base */
  triObt(d) {
    for (;;) {
      const [e, h] = pick(TRIPLES.filter(t => t[0] <= 9 && t[1] >= 4)), lo = Math.max(6, e + 3, Math.ceil(h * .8)), hi = Math.min(16, h * 2); if (lo > hi) continue; const b = ri(lo, hi), A = b * h / 2; if (!Number.isInteger(A)) continue;
      const ex = mEx('גם במשולש קהה זווית: שטח = בסיס × גובה ÷ 2. הגובה נופל מחוץ למשולש, על ההמשך המקווקו של הבסיס.',
        [`הבסיס הוא רק הצלע של המשולש: ${b}. ההמשך המקווקו (${e}) הוא לא חלק מהבסיס`, `הגובה: ${h}`, `${L(`${b} × ${h} ÷ 2 = <b>${A}</b>`)} ${CM2}`],
        figTriH(b, b + e, h, { le: gL(e), hb: 1, inner: gL(A, CM2) }),
        gTrap(`לחבר את ההמשך לבסיס: ${L(`(${b} + ${e}) × ${h} ÷ 2`)}. ההמשך הוא רק המקום שבו הגובה פוגש את הקו.`), 'קו מקווקו שיוצא אל מחוץ למשולש: זה עדיין הגובה, אבל הבסיס נשאר הצלע של המשולש.');
      return gMake('area', 'triObt', d, 'הקו המקווקו האנכי הוא הגובה. הוא נופל מחוץ למשולש, על ההמשך של הבסיס. מה השטח של המשולש?', figTriH(b, b + e, h, { le: gL(e) }), A,
        [[(b + e) * h / 2, 'הוסיפו את ההמשך המקווקו לבסיס'], [b * h, 'שכחו לחלק ב-2'], [e * h / 2, 'השתמשו רק בהמשך'], [(b + e) * h, 'הוסיפו את ההמשך ושכחו לחלק ב-2']], gUn(CM2), ex,
        'גם כאן: בסיס × גובה ÷ 2. מה בדיוק אורך הבסיס של המשולש עצמו?', `הבסיס הוא ${b} (בלי ההמשך המקווקו), והגובה ${h}.`, { b, e, h }, 2);
    }
  },
  /* a parallelogram */
  para(d) {
    const [o, h, s] = pick(TRIPLES.filter(t => t[0] <= 9 && t[1] <= 12)), b = ri(Math.max(6, o + 2), 15), A = b * h;
    const ex = mEx('שטח מקבילית = בסיס × גובה. חותכים את המשולש מצד אחד ומזיזים אותו לצד השני, ומקבלים מלבן.',
      [`בסיס: ${b}. גובה: ${h} (הקו המקווקו)`, `${L(`${b} × ${h} = <b>${A}</b>`)} ${CM2}`], figPara(b, o, h, { ls: gL(s), sol: 1, hb: 1, inner: gL(A, CM2) }) + mLeg([['m', 'המשולש שנחתך עובר לצד השני, ונוצר מלבן']]),
      gTrap(`לכפול בצלע המשופעת (${L(`${b} × ${s}`)}), או לחלק ב-2 כמו במשולש.`), 'צורה עם שני זוגות של צלעות מקבילות, וקו מקווקו של גובה.');
    return gMake('area', 'para', d, 'מה השטח של המקבילית? הקו המקווקו הוא הגובה.', figPara(b, o, h, { ls: gL(s) }), A,
      [[b * s, 'כפלו בצלע המשופעת'], [A / 2, 'חילקו ב-2, כמו במשולש'], [2 * (b + s), 'זה ההיקף'], [(b + o) * h, '']], gUn(CM2), ex,
      'מקבילית היא כמו מלבן שנדחף הצידה. כמה גבוה המלבן הזה באמת?', `הגובה הוא ${h} (הקו המקווקו). כפלו בבסיס.`, { b, o, h, s }, 4);
  },
  /* a trapezoid: right (d2) or with a slanted side and a dashed height (d3) */
  trap(d) {
    for (;;) {
      const gen = d >= 3, [o, h, s] = gen ? pick(TRIPLES.filter(t => t[0] <= 8 && t[1] <= 12)) : [0, ri(3, 9), 0], b2 = ri(3, 10), b1 = b2 + (gen ? o + ri(2, 6) : ri(2, 7)), A = (b1 + b2) * h / 2;
      if (!Number.isInteger(A) || b1 > 18) continue;
      const fig = o2 => figTrap(b1, b2, o, h, Object.assign({ ls: gen ? gL(s) : '' }, o2));
      const pic = fig({ split: 1 }) + mLeg([['a', `משולש אחד: ${L(`${b1} × ${h} ÷ 2 = ${b1 * h / 2}`)}`], ['k', `משולש שני: ${L(`${b2} × ${h} ÷ 2 = ${b2 * h / 2}`)}`]]);
      const ex = mEx('שטח טרפז = (בסיס גדול + בסיס קטן) × גובה ÷ 2. האלכסון מחלק אותו לשני משולשים עם אותו גובה.',
        [`הבסיסים: ${L(`${b1} + ${b2} = ${b1 + b2}`)}`, `${L(`${b1 + b2} × ${h} = ${(b1 + b2) * h}`)}`, `${L(`${(b1 + b2) * h} ÷ 2 = <b>${A}</b>`)} ${CM2}`, `בדיקה בשני המשולשים: ${L(`${b1 * h / 2} + ${b2 * h / 2} = ${A}`)}`], pic,
        gTrap(gen ? `לכפול בצלע המשופעת (${L(s)}) במקום בגובה, או לשכוח לחלק ב-2.` : `לשכוח לחלק ב-2 (${L((b1 + b2) * h)}).`), 'שתי צלעות מקבילות באורכים שונים (הבסיסים), וגובה ביניהן.');
      return gMake('area', 'trap', d, `מה השטח של הטרפז?${gen ? ' הקו המקווקו הוא הגובה.' : ''}`, fig({}), A,
        [[(b1 + b2) * h, 'שכחו לחלק ב-2'], [b1 * h, 'השתמשו רק בבסיס הגדול'], [gen ? (b1 + b2) * s / 2 : b2 * h, gen ? 'השתמשו בצלע המשופעת' : 'השתמשו רק בבסיס הקטן'], [b1 * b2 / 2, '']], gUn(CM2), ex,
        'בטרפז יש שני בסיסים מקבילים. חברו אותם, כפלו בגובה, ו... מה עושים בסוף, כמו במשולש?', `${L(`(${b1} + ${b2}) × ${h}`)}, ואז חצי.`, { b1, b2, h, o, s }, 2);
    }
  },
  /* an L shape: perimeter (d2) or area (d3) */
  L(d, per) {
    for (;;) {
      const W = ri(7, 14), Ht = ri(5, 11), a = ri(3, W - 3), cr = ri(2, Ht - 3); if (W - a < 2 || Ht - cr < 2) continue;
      const P = 2 * (W + Ht), A = a * Ht + (W - a) * cr;
      if (per) {
        const ex = mEx('שתי הצלעות הפנימיות של הפינה החסרה "זזו" פנימה, אבל האורך שלהן לא השתנה. ההיקף שווה להיקף של המלבן השלם.',
          [`הצלעות שאין עליהן מספר: ${L(`${W} − ${a} = ${W - a}`)} ו-${L(`${Ht} − ${cr} = ${Ht - cr}`)}`, `מסביב: ${L(`${W} + ${cr} + ${W - a} + ${Ht - cr} + ${a} + ${Ht} = ${P}`)}`, `קיצור: ${L(`2 × (${W} + ${Ht}) = <b>${P}</b>`)} ${CM}`],
          figL(W, Ht, a, cr, { ghost: 1, per: 1, lIn: [gL(W - a), gL(Ht - cr)] }), gTrap(`לחבר רק את ארבעת המספרים שכתובים (${L(W + Ht + a + cr)}). יש עוד שתי צלעות בלי מספר.`), 'צורה של L ושואלים על היקף. מחפשים קודם את הצלעות בלי מספר.');
        return gMake('area', 'Lper', d, 'מה ההיקף של הצורה? כל הפינות ישרות.', figL(W, Ht, a, cr), P,
          [[W + Ht + a + cr, 'חיברו רק את הצלעות שכתוב עליהן מספר'], [P - (W - a) - (Ht - cr), 'הורידו את הפינה, אבל הצלעות שלה עדיין בהיקף'], [A, 'זה השטח'], [P + 2, '']], gUn(CM), ex,
          'יש שתי צלעות בלי מספר. אפשר למצוא אותן מהצלעות הארוכות. למשל: הצלע העליונה הארוכה פחות הצלע העליונה הקצרה.', `הצלעות החסרות: ${L(`${W} − ${a}`)} ו-${L(`${Ht} − ${cr}`)}. עכשיו מסביב, צלע אחרי צלע.`, { W, Ht, a, cr }, 2);
      }
      const ex = mEx('מחלקים את הצורה לשני מלבנים, מחשבים כל אחד, ומחברים.',
        [`מלבן שמאלי: ${L(`${a} × ${Ht} = ${a * Ht}`)}`, `מלבן ימני: רוחב ${L(`${W} − ${a} = ${W - a}`)}, ${L(`${W - a} × ${cr} = ${(W - a) * cr}`)}`, `ביחד: ${L(`${a * Ht} + ${(W - a) * cr} = <b>${A}</b>`)} ${CM2}`, `בדיקה, שלם פחות חסר: ${L(`${W} × ${Ht} − ${W - a} × ${Ht - cr} = ${W * Ht} − ${(W - a) * (Ht - cr)} = ${A}`)}`],
        figL(W, Ht, a, cr, { split: [`${a}×${Ht}=${a * Ht}`, `${W - a}×${cr}=${(W - a) * cr}`], lIn: [gL(W - a), ''] }),
        gTrap(`לכפול ${L(`${W} × ${Ht}`)} ולשכוח שחסרה פינה, או לכפול ${L(`${W} × ${cr}`)} ולספור חלק פעמיים.`), 'צורה של L: או שני מלבנים, או מלבן גדול פחות הפינה.');
      return gMake('area', 'Lar', d, 'מה השטח של הצורה? כל הפינות ישרות.', figL(W, Ht, a, cr), A,
        [[W * Ht, 'שכחו להוריד את הפינה החסרה'], [a * Ht + W * cr, 'חלק אחד נספר פעמיים'], [P, 'זה ההיקף'], [W * Ht - a * cr, '']], gUn(CM2), ex,
        'חלקו את הצורה בקו לשני מלבנים. מה הרוחב של המלבן הימני (אין עליו מספר)?', `מלבן שמאלי: ${L(`${a} × ${Ht}`)}. מלבן ימני: ${L(`(${W} − ${a}) × ${cr}`)}. חברו.`, { W, Ht, a, cr }, 2);
    }
  },
  /* a lawn with a pool: the big rectangle minus the hole */
  hole(d) {
    for (;;) {
      const W = ri(10, 16), Ht = ri(8, 12), w = ri(3, W - 6), h = ri(2, Ht - 5), x = ri(3, W - w - 2), y = ri(2, Ht - h - 3), A = W * Ht - w * h;
      if (w === h && W === Ht) continue;
      const ex = mEx('שטח עם חור: השטח של כל המלבן, פחות השטח של החור.',
        [`כל הגינה: ${L(`${W} × ${Ht} = ${W * Ht}`)}`, `הבריכה: ${L(`${w} × ${h} = ${w * h}`)}`, `הדשא: ${L(`${W * Ht} − ${w * h} = <b>${A}</b>`)} מ"ר`],
        figHole(W, Ht, w, h, x, y, { u: 'מ׳', sol: 1, inner: `−${w * h}` }), gTrap(`להוריד ${L(`${w} + ${h}`)} במקום ${L(`${w} × ${h}`)}, או לשכוח את הבריכה.`), 'צורה עם חלק שחסר באמצע: שלם פחות חסר.');
      return gMake('area', 'hole', d, 'בגינה מלבנית יש בריכה מלבנית. כל השאר דשא. מה השטח של הדשא?', figHole(W, Ht, w, h, x, y, { u: 'מ׳' }), A,
        [[W * Ht, 'שכחו להוריד את הבריכה'], [W * Ht - w - h, 'הורידו את הצלעות של הבריכה, לא את השטח שלה'], [W * Ht + w * h, 'הוסיפו במקום להוריד'], [2 * (W + Ht), 'זה ההיקף של הגינה']], gUn('מ"ר'), ex,
        'חשבו קודם את השטח של כל הגינה, כאילו אין בריכה. מה צריך להוריד ממנו?', `כל הגינה: ${L(`${W} × ${Ht}`)}. הבריכה: ${L(`${w} × ${h}`)}. מה נשאר?`, { W, Ht, w, h }, 2);
    }
  },
  /* from the area back to the height */
  triBack(d) {
    for (;;) {
      const b = ri(4, 14), h = ri(3, 12), A = b * h / 2; if (!Number.isInteger(A) || b === h || A === b) continue;
      const p = Math.round(b * pick([.3, .4, .6])), ex = mEx('שטח = בסיס × גובה ÷ 2. הולכים אחורה: שטח × 2, ואז ÷ בסיס.',
        [`${L(`${b} × ? ÷ 2 = ${A}`)}`, `${L(`${b} × ? = ${A} × 2 = ${2 * A}`)}`, `${L(`? = ${2 * A} ÷ ${b} = <b>${h}</b>`)} ${CM}`, `בדיקה: ${L(`${b} × ${h} ÷ 2 = ${A}`)} ✓`],
        figTriH(b, p, h, { lh: gL(h), hb: 1 }), gTrap(`לחלק ${L(`${A} ÷ ${b}`)} ולשכוח את ה-÷ 2 שהיה בנוסחה.`), 'נתון שטח, וחסר אחד המספרים בנוסחה. הולכים אחורה בנוסחה.');
      return gMake('area', 'triBack', d, `השטח של המשולש הוא ${A} סמ"ר והבסיס שלו ${b} ס"מ. מה הגובה שלו?`, figTriH(b, p, h, { lh: '?' }), h,
        [[A / b, 'חילקו בבסיס, אבל שכחו את ה-÷ 2'], [2 * A * b, 'כפלו במקום לחלק'], [A - b, 'חיסרו'], [h + 2, '']], gUn(CM), ex,
        `בנוסחה: בסיס × גובה ÷ 2 = שטח. מה צריך להיות בסיס × גובה (לפני החלוקה ב-2)?`, `${L(`${A} × 2 = ${2 * A}`)}, וזה ${b} כפול הגובה. כמה זה הגובה?`, { b, h, A }, 1);
    }
  },
};

/* ===== THE CIRCLE (π ≈ 3.14) ===== */
const PI = 3.14, gPx = v => r2(PI * v);
const GCI = {
  /* radius and diameter */
  rd(d) {
    const toR = R() < .5, r = ri(2, 15), D = 2 * r;
    const ex = mEx('הקוטר עובר מקצה לקצה דרך המרכז. הוא בנוי משני רדיוסים.', toR ? [`רדיוס = קוטר ÷ 2: ${L(`${D} ÷ 2 = <b>${r}</b>`)} ${CM}`] : [`קוטר = 2 × רדיוס: ${L(`2 × ${r} = <b>${D}</b>`)} ${CM}`],
      figCirc({ d: gL(D), r: gL(r), [toR ? 'rhl' : 'dhl']: 1 }), gTrap(toR ? 'לחשוב שהקוטר הוא חצי מהרדיוס. הקוטר תמיד הארוך מביניהם.' : 'לחלק ב-2. הרדיוס הוא רק עד המרכז, והקוטר ארוך ממנו פי 2.'), 'קו מהמרכז לקצה הוא רדיוס. קו מקצה לקצה דרך המרכז הוא קוטר.');
    return gMake('circle', 'rd', d, toR ? `הקוטר של המעגל הוא ${D} ס"מ. מה הרדיוס?` : `הרדיוס של המעגל הוא ${r} ס"מ. מה הקוטר?`, figCirc(toR ? { d: gL(D), r: '?' } : { r: gL(r), d: '?' }), toR ? r : D,
      toR ? [[D, 'זה הקוטר'], [2 * D, 'כפלו ב-2 במקום לחלק'], [D / 4, 'חילקו ב-4'], [r + 1, '']] : [[r, 'זה הרדיוס'], [r / 2, 'חילקו ב-2 במקום לכפול'], [4 * r, 'כפלו ב-4'], [D + 2, '']], gUn(CM), ex,
      toR ? 'הקוטר עובר מקצה לקצה דרך המרכז. כמה רדיוסים יש בקוטר אחד?' : 'הרדיוס הולך מהמרכז עד הקצה. הקוטר עובר את כל הדרך מקצה לקצה. כמה רדיוסים יש בו?',
      toR ? `בקוטר יש שני רדיוסים. חלקו את ${L(D)} ב-2.` : `בקוטר יש שני רדיוסים: ${L(`${r} + ${r}`)}.`, { r, D }, 1);
  },
  /* circumference from the radius (d1) or the diameter (d2) */
  circ(d, fromD) {
    const r = pick(fromD ? [1, 3, 4, 5, 10, 20, 50] : [1, 3, 5, 10, 50]), D = 2 * r, C = gPx(D);
    const ex = mEx('היקף המעגל = π × קוטר, וזה אותו דבר כמו 2 × π × רדיוס. π ≈ 3.14: ההיקף קצת יותר מפי 3 מהקוטר.',
      [fromD ? '' : `הקוטר: ${L(`2 × ${r} = ${D}`)}`, `${L(`3.14 × ${D} = <b>${fmt(C)}</b>`)} ${CM}`, `בדיקה מהירה: פי 3 מ-${D} זה ${3 * D}, וקצת יותר. ✓`],
      figCirc(Object.assign({ per: 1, side: 'היקף' }, fromD ? { d: gL(D), dhl: 1 } : { r: gL(r), d: gL(D), dhl: 1 })),
      gTrap(fromD ? `לכפול שוב ב-2 (${L(fmt(gPx(2 * D)))}). הנתון כבר קוטר.` : `לכפול רק ${L(`3.14 × ${r}`)}. זה חצי מההיקף, כי ${r} הוא רדיוס.`), 'מעגל ושואלים כמה דרך יש מסביב (גדר, חוט, מסלול): היקף.');
    return gMake('circle', fromD ? 'circD' : 'circ', d, `${fromD ? `הקוטר של המעגל הוא ${D} ס"מ.` : `הרדיוס של המעגל הוא ${r} ס"מ.`} מה ההיקף של המעגל? (π ≈ 3.14)`, figCirc(fromD ? { d: gL(D) } : { r: gL(r) }), C,
      fromD ? [[gPx(2 * D), 'כפלו ב-2, אבל נתון כבר קוטר'], [gPx(r * r), 'זה השטח'], [gPx(r), 'זה חצי מההיקף'], [3 * D, '']] : [[gPx(r), 'השתמשו ברדיוס במקום בקוטר: זה חצי היקף'], [gPx(r * r), 'זה השטח'], [gPx(2 * D), 'כפלו את הקוטר שוב ב-2'], [3 * D, '']], gUn(CM), ex,
      fromD ? 'ההיקף הוא קצת יותר מפי 3 מהקוטר. כמה בדיוק? π × קוטר.' : 'היקף = π × קוטר. מה הקוטר של המעגל הזה?',
      fromD ? `כפלו ${L(`3.14 × ${D}`)}.` : `הקוטר הוא ${L(`2 × ${r} = ${D}`)}. עכשיו כפלו ב-3.14.`, { r, D }, Math.max(1, r));
  },
  /* area: from the radius (numbers or with π), or from the diameter */
  area(d, fromD) {
    const usePi = !fromD && R() < .5, r = fromD ? pick([1, 2, 3, 5, 10]) : usePi ? pick([4, 6, 7, 8, 9, 11, 12]) : pick([1, 2, 3, 5, 10]), D = 2 * r;
    if (usePi) {
      const k = r * r, ex = mEx('שטח עיגול = π × רדיוס × רדיוס. כשכותבים בעזרת π, כופלים רק את הרדיוס בעצמו.',
        [`${L(`π × ${r} × ${r} = <b>${k}π</b>`)} ${CM2}`, `בערך: ${L(`3.14 × ${k} ≈ ${fmt(gPx(k))}`)}`], figCirc({ r: gL(r), rhl: 1, fill: 1, inner: L(k + 'π') + ' ' + CM2 }),
        gTrap(`לכפול ${L(`${r} × 2`)} במקום ${L(`${r} × ${r}`)}. ${L(`2 × π × ${r}`)} זה ההיקף.`), 'מעגל ושואלים כמה מקום יש בפנים (דשא, פיצה, שטיח): שטח, π × r × r.');
      return gMake('circle', 'areaPi', d, `הרדיוס של העיגול הוא ${r} ס"מ. מה השטח שלו? כתבו את התשובה בעזרת π.`, figCirc({ r: gL(r) }), k,
        [[2 * r, `זה ההיקף (${L(`2 × π × ${r}`)})`], [4 * k, 'השתמשו בקוטר במקום ברדיוס'], [2 * k, 'כפלו ב-2 בסוף'], [k / 2 === Math.round(k / 2) ? k / 2 : k + r, '']], gPiS(CM2), ex,
        'שטח עיגול: π × רדיוס × רדיוס. מה זה רדיוס × רדיוס כאן?', `${L(`${r} × ${r}`)}, ואז כותבים π אחרי המספר.`, { r, k, pi: 1 }, 1, k);
    }
    const A = gPx(r * r);
    const ex = mEx('שטח עיגול = π × רדיוס × רדיוס.',
      [fromD ? `קודם הרדיוס: ${L(`${D} ÷ 2 = ${r}`)}` : '', `${L(`${r} × ${r} = ${r * r}`)}`, `${L(`3.14 × ${r * r} = <b>${fmt(A)}</b>`)} ${CM2}`],
      figCirc(Object.assign({ r: gL(r), rhl: 1, fill: 1, inner: gL(fmt(A), CM2) }, fromD ? { d: gL(D) } : {})),
      gTrap(fromD ? `להציב את הקוטר (${D}) במקום הרדיוס: ${L(`3.14 × ${D} × ${D} = ${fmt(gPx(D * D))}`)}, פי 4 יותר מדי.` : `לכפול ${L(`2 × ${r}`)} במקום ${L(`${r} × ${r}`)}. זה ההיקף.`), 'מעגל ושואלים כמה מקום יש בפנים: שטח. נתון קוטר? קודם מחלקים ב-2.');
    return gMake('circle', fromD ? 'areaD' : 'area', d, `${fromD ? `הקוטר של העיגול הוא ${D} ס"מ.` : `הרדיוס של העיגול הוא ${r} ס"מ.`} מה השטח של העיגול? (π ≈ 3.14)`, figCirc(fromD ? { d: gL(D) } : { r: gL(r) }), A,
      fromD ? [[gPx(D * D), 'השתמשו בקוטר במקום ברדיוס'], [gPx(D), 'זה ההיקף'], [gPx(D * D) / 2, ''], [gPx(r), '']] : [[gPx(2 * r), 'זה ההיקף'], [r * r, 'שכחו לכפול ב-π'], [gPx(4 * r * r), 'השתמשו בקוטר'], [gPx(r * r / 2), '']], gUn(CM2), ex,
      fromD ? 'שטח עיגול: π × רדיוס × רדיוס. נתון קוטר. מה הרדיוס?' : 'שטח עיגול: π × רדיוס × רדיוס. מה זה רדיוס × רדיוס כאן?',
      fromD ? `הרדיוס ${L(`${D} ÷ 2 = ${r}`)}. עכשיו ${L(`3.14 × ${r} × ${r}`)}.` : `${L(`${r} × ${r} = ${r * r}`)}. עכשיו כפלו ב-3.14.`, { r, D }, Math.max(1, r));
  },
  /* half and quarter circles (area with π), the perimeter of a half circle */
  part(d) {
    const K = pick(['half', 'quarter', 'halfP']);
    if (K === 'halfP') {
      const r = pick([5, 10, 20, 50]), D = 2 * r, arc = gPx(r), P = r2(arc + D);
      const ex = mEx('ההיקף של חצי עיגול: הקשת (חצי מהיקף המעגל) ועוד הקוטר הישר שסוגר אותו.',
        [`היקף המעגל השלם: ${L(`3.14 × ${D} = ${fmt(gPx(D))}`)}`, `הקשת, חצי ממנו: ${L(`${fmt(gPx(D))} ÷ 2 = ${fmt(arc)}`)}`, `ועוד הקוטר: ${L(`${fmt(arc)} + ${D} = <b>${fmt(P)}</b>`)} ${CM}`],
        figPart('half', { d: gL(D), per: 1 }) + mLeg([['g', 'ההיקף: הקשת ועוד הקו הישר']]), gTrap(`לעצור ב-${L(fmt(arc))}. גם הקו הישר (הקוטר) הוא חלק מהדרך מסביב.`), 'היקף של חצי עיגול או רבע עיגול: לא לשכוח את הקווים הישרים.');
      return gMake('circle', 'halfP', d, `זה חצי עיגול. הקוטר שלו ${D} ס"מ. מה ההיקף שלו (כל הדרך מסביב)? (π ≈ 3.14)`, figPart('half', { d: gL(D) }), P,
        [[arc, 'שכחו את הקו הישר'], [gPx(D), 'זה ההיקף של עיגול שלם'], [r2(arc + r), 'הוסיפו רדיוס במקום קוטר'], [r2(gPx(D) + D), '']], gUn(CM), ex,
        'הדרך מסביב לחצי עיגול בנויה משני חלקים: הקשת העגולה והקו הישר. מה כל אחד מהם?', `הקשת היא חצי מ-${L(`3.14 × ${D}`)}. הקו הישר הוא ${D}.`, { r, D }, 5);
    }
    const half = K === 'half', r = pick([4, 6, 8, 10, 12]), k = half ? r * r / 2 : r * r / 4, D = 2 * r;
    const ex = mEx(`שטח של ${half ? 'חצי עיגול: חצי' : 'רבע עיגול: רבע'} מהשטח של העיגול השלם, π × רדיוס × רדיוס.`,
      [half ? `הרדיוס: ${L(`${D} ÷ 2 = ${r}`)}` : '', `העיגול השלם: ${L(`π × ${r} × ${r} = ${r * r}π`)}`, `${half ? 'חצי' : 'רבע'}: ${L(`${r * r}π ÷ ${half ? 2 : 4} = <b>${k}π</b>`)} ${CM2}`],
      figPart(K, half ? { d: gL(D), fill: 1, inner: L(k + 'π') } : { r: gL(r), fill: 1, inner: L(k + 'π') }),
      gTrap(half ? `להציב את הקוטר (${D}) במקום הרדיוס, או לשכוח לחלק ב-2.` : 'לחלק ב-2 במקום ב-4. רבע עיגול הוא חלק אחד מארבעה.'), 'חלק מעיגול: מחשבים את העיגול השלם, ואז לוקחים את החלק.');
    return gMake('circle', K, d, half ? `זה חצי עיגול. הקוטר שלו ${D} ס"מ. מה השטח שלו? כתבו בעזרת π.` : `זה רבע עיגול. הרדיוס שלו ${r} ס"מ. מה השטח שלו? כתבו בעזרת π.`, figPart(K, half ? { d: gL(D) } : { r: gL(r) }), k,
      half ? [[r * r, 'זה העיגול השלם'], [D * D / 2, 'השתמשו בקוטר במקום ברדיוס'], [r, 'זה חצי מההיקף'], [D * D, '']] : [[r * r, 'זה העיגול השלם'], [r * r / 2, 'זה חצי עיגול'], [r / 2, ''], [D * D / 4, 'השתמשו בקוטר']], gPiS(CM2), ex,
      half ? 'קודם חשבו את השטח של העיגול השלם. מה הרדיוס שלו?' : 'קודם חשבו את השטח של העיגול השלם, π × רדיוס × רדיוס.',
      half ? `הרדיוס הוא ${L(`${D} ÷ 2`)}. עיגול שלם: π × רדיוס × רדיוס. ואז חצי.` : `עיגול שלם: ${L(`π × ${r} × ${r}`)}. ורבע ממנו?`, { r, k, pi: 1 }, 1, k);
  },
  /* a ring: big circle minus small circle */
  ring(d) {
    const [Ro, r0] = pick([[5, 3], [5, 4], [6, 4], [6, 2], [7, 3], [7, 5], [8, 4], [8, 6], [10, 6], [10, 8], [9, 3]]), k = Ro * Ro - r0 * r0;
    const ex = mEx('שטח טבעת: העיגול הגדול פחות העיגול הקטן (החור).',
      [`העיגול הגדול: ${L(`π × ${Ro} × ${Ro} = ${Ro * Ro}π`)}`, `החור: ${L(`π × ${r0} × ${r0} = ${r0 * r0}π`)}`, `הטבעת: ${L(`${Ro * Ro}π − ${r0 * r0}π = <b>${k}π</b>`)} ${CM2}`],
      figRing(Ro, r0, gL(Ro), gL(r0), { sol: 1, inner: L(k + 'π') }), gTrap(`להוריד קודם את הרדיוסים: ${L(`π × (${Ro} − ${r0}) × (${Ro} − ${r0}) = ${(Ro - r0) * (Ro - r0)}π`)}. צריך להוריד שטחים, לא אורכים.`), 'שני עיגולים עם אותו מרכז: שטח של טבעת = גדול פחות קטן.');
    return gMake('circle', 'ring', d, `טבעת: עיגול גדול ברדיוס ${Ro} ס"מ, ובאמצע חור עגול ברדיוס ${r0} ס"מ. מה השטח של הטבעת (הצבועה)? כתבו בעזרת π.`, figRing(Ro, r0, gL(Ro), gL(r0)), k,
      [[(Ro - r0) * (Ro - r0), 'הורידו את הרדיוסים לפני שכפלו'], [Ro * Ro, 'שכחו להוריד את החור'], [Ro * Ro + r0 * r0, 'חיברו במקום להוריד'], [2 * (Ro - r0), '']], gPiS(CM2), ex,
      'חשבו את השטח של העיגול הגדול, כאילו אין חור. מה צריך להוריד ממנו?', `גדול: ${L(`π × ${Ro} × ${Ro}`)}. חור: ${L(`π × ${r0} × ${r0}`)}. הורידו.`, { Ro, r0, k, pi: 1 }, 1, k);
  },
  /* from the circumference back to the radius */
  back(d) {
    const r = pick([3, 4, 5, 10, 20, 50]), D = 2 * r, C = gPx(D);
    const ex = mEx('היקף = 3.14 × קוטר. הולכים אחורה: היקף ÷ 3.14 = קוטר, ואז ÷ 2 = רדיוס.',
      [`הקוטר: ${L(`${fmt(C)} ÷ 3.14 = ${D}`)}`, `הרדיוס: ${L(`${D} ÷ 2 = <b>${r}</b>`)} ${CM}`, `בדיקה: ${L(`3.14 × ${D} = ${fmt(C)}`)} ✓`],
      figCirc({ r: gL(r), rhl: 1, d: gL(D), per: 1 }), gTrap(`לעצור בקוטר (${D}). שואלים על הרדיוס.`), 'נתון היקף ושואלים על רדיוס או קוטר: מחלקים ב-3.14.');
    return gMake('circle', 'back', d, `ההיקף של מעגל הוא ${fmt(C)} ס"מ. מה הרדיוס שלו? (π ≈ 3.14)`, figCirc({ r: '?' }), r,
      [[D, 'זה הקוטר'], [r2(C / 2), 'חילקו ב-2 במקום ב-3.14'], [r * 3, ''], [r + 1, '']], gUn(CM), ex,
      'ההיקף הוא 3.14 כפול הקוטר. איך מוצאים את הקוטר מההיקף?', `${L(`${fmt(C)} ÷ 3.14`)} נותן את הקוטר. הרדיוס הוא חצי ממנו.`, { r, D, C }, 1);
  },
};

/* ===== SOLIDS AND VOLUME ===== */
const GVO = {
  /* count the unit cubes in a box */
  cubes(d) {
    const l = ri(2, 5), w = ri(2, 3), h = ri(2, 4), V = l * w * h, vis = V - (l - 1) * (h - 1) * (w - 1);
    const ex = mEx('סופרים בשכבות: כמה קוביות בשכבה אחת, וכמה שכבות יש.',
      [`שכבה אחת (למעלה, בצהוב): ${L(`${l} × ${w} = ${l * w}`)} קוביות`, `יש ${h} שכבות כאלה, זו על זו`, `${L(`${l * w} × ${h} = <b>${V}</b>`)} קוביות`],
      figBox(l, w, h, { grid: 1, hl: 'top', lab: [String(l), String(w), String(h)] }), gTrap(`לספור רק את הקוביות שרואים (${vis}). יש קוביות בפנים ובצד האחורי.`), 'בנוי מקוביות ושואלים כמה: אורך × רוחב × גובה, בלי לספור אחת אחת.');
    return gMake('volume', 'cubes', d, 'התיבה בנויה כולה מקוביות קטנות, גם בפנים. מכמה קוביות קטנות היא בנויה?', figBox(l, w, h, { grid: 1, lab: ['', '', ''] }), V,
      [[vis, 'ספרו רק את הקוביות שרואים'], [l * w, 'זו רק שכבה אחת'], [l + w + h, 'חיברו במקום לכפול'], [2 * (l * w + l * h + w * h), 'אלה המשבצות שעל הפאות']], gUn('קוביות'), ex,
      'אל תספרו אחת אחת. כמה קוביות יש בשכבה העליונה?', `בשכבה העליונה יש ${l} שורות של ${w}. כמה שכבות כאלה יש?`, { l, w, h }, 2);
  },
  /* the volume of a box or a cube */
  box(d) {
    const cube = R() < .4, l = ri(2, cube ? 6 : 10), w = cube ? l : ri(2, 7), h = cube ? l : ri(2, 8), V = l * w * h, Sa = 2 * (l * w + l * h + w * h);
    if (!cube && (l === w || w === h || l === h)) return GVO.box(d);
    const ex = mEx(cube ? 'נפח קובייה = צלע × צלע × צלע.' : 'נפח תיבה = אורך × רוחב × גובה: כמה קוביות של 1 ס"מ נכנסות בה.',
      [`שכבה תחתונה: ${L(`${l} × ${w} = ${l * w}`)}`, `${h} שכבות: ${L(`${l * w} × ${h} = <b>${V}</b>`)} ${CM3}`], figBox(l, w, h, { hl: 'top', lab: cube ? [gL(l), '', ''] : null, inner: '' }),
      gTrap(cube ? `לכפול ${L(`${l} × 3`)}. צריך ${L(`${l} × ${l} × ${l}`)}.` : `לחבר את המספרים (${l + w + h}), או לחשב שטח של פאה אחת בלבד (${l * w}).`), 'שואלים כמה נכנס בתוך הגוף (מים, חול, קוביות): נפח, בסמ"ק.');
    return gMake('volume', cube ? 'cube' : 'box', d, cube ? `לקובייה כל המקצועות שווים, ${l} ס"מ. מה הנפח שלה?` : 'מה הנפח של התיבה?', figBox(l, w, h, { lab: cube ? [gL(l), '', ''] : null }), V,
      cube ? [[3 * l, 'כפלו ב-3 במקום צלע × צלע × צלע'], [l * l, 'זה השטח של פאה אחת'], [6 * l * l, 'זה שטח הפנים'], [V + l, '']] : [[l * w, 'זה רק שטח הבסיס'], [l + w + h, 'חיברו במקום לכפול'], [Sa, 'זה שטח הפנים'], [V + l * w, '']], gUn(CM3), ex,
      cube ? 'בקובייה האורך, הרוחב והגובה שווים. כמה קוביות של 1 ס"מ יש בשכבה אחת?' : 'כמה קוביות של 1 ס"מ נכנסות בשכבה התחתונה?',
      cube ? `שכבה אחת: ${L(`${l} × ${l}`)}. ויש ${l} שכבות.` : `שכבה תחתונה: ${L(`${l} × ${w}`)}. ויש ${h} שכבות.`, { l, w, h }, 4);
  },
  /* faces, edges, corners */
  parts(d) {
    const K = pick(['faces', 'edges', 'verts']), ans = { faces: 6, edges: 12, verts: 8 }[K], nm = { faces: 'פאות', edges: 'מקצועות', verts: 'קודקודים' }[K];
    const lines = { faces: ['למעלה ולמטה: 2', 'מקדימה ומאחורה: 2', 'ימין ושמאל: 2', `${L('2 + 2 + 2 = <b>6</b>')} פאות`], edges: ['4 מקצועות סביב הפאה העליונה', '4 סביב הפאה התחתונה', '4 עומדים ומחברים ביניהן', `${L('4 + 4 + 4 = <b>12</b>')} מקצועות`], verts: ['4 פינות למעלה', '4 פינות למטה', `${L('4 + 4 = <b>8</b>')} קודקודים`] }[K];
    const ex = mEx('סופרים בקבוצות מסודרות, כולל מה שמאחור (הקווים המקווקווים).', lines, figBox(4, 3, 3, { lab: ['', '', ''], dots: K === 'verts', pairs: K === 'faces' }),
      gTrap('לספור רק את מה שרואים בציור. הקווים המקווקווים הם חלקים שמאחור.'), 'פאה = משטח שטוח. מקצוע = קו שבו נפגשות שתי פאות. קודקוד = פינה.');
    return gMake('volume', 'parts', d, `כמה ${nm} יש לתיבה? (${K === 'faces' ? 'פאה היא משטח' : K === 'edges' ? 'מקצוע הוא קו שבו נפגשות שתי פאות' : 'קודקוד הוא פינה'})`, figBox(4, 3, 3, { lab: ['', '', ''] }), ans,
      [[6, 'זה מספר הפאות'], [8, 'זה מספר הקודקודים'], [12, 'זה מספר המקצועות'], [K === 'faces' ? 3 : K === 'edges' ? 9 : 7, 'ספרו רק את מה שרואים']], v => L(v), ex,
      'הקווים המקווקווים הם החלקים שמאחור. ספרו בקבוצות: מה למעלה, מה למטה, ומה באמצע.', K === 'faces' ? 'לכל פאה יש פאה מולה: למעלה ולמטה, מקדימה ומאחור, ימין ושמאל.' : K === 'edges' ? 'סביב הפאה העליונה יש 4. כמה סביב התחתונה? וכמה עומדים ביניהן?' : 'כמה פינות יש לפאה העליונה? ולתחתונה?', { K }, 1);
  },
  /* surface area: box or cube */
  surf(d) {
    const cube = R() < .35, l = ri(2, cube ? 6 : 9), w = cube ? l : ri(2, 6), h = cube ? l : ri(2, 7);
    if (!cube && (l === w || w === h || l === h)) return GVO.surf(d);
    const a = l * w, b = l * h, c = w * h, S0 = 2 * (a + b + c), V = l * w * h;
    const ex = mEx(cube ? 'לקובייה 6 פאות, וכולן ריבועים שווים.' : 'שטח פנים = השטח של כל 6 הפאות. יש 3 זוגות של פאות שוות (מול כל פאה יש פאה זהה).',
      cube ? [`פאה אחת: ${L(`${l} × ${l} = ${a}`)}`, `${L(`6 × ${a} = <b>${S0}</b>`)} ${CM2}`] : [`למטה ולמעלה: ${L(`${l} × ${w} = ${a}`)}, פעמיים`, `מקדימה ומאחור: ${L(`${l} × ${h} = ${b}`)}, פעמיים`, `ימין ושמאל: ${L(`${w} × ${h} = ${c}`)}, פעמיים`, `${L(`2 × (${a} + ${b} + ${c}) = 2 × ${a + b + c} = <b>${S0}</b>`)} ${CM2}`],
      figBox(l, w, h, { pairs: 1, lab: cube ? [gL(l), '', ''] : null }) + mLeg([['k', 'אותו צבע: פאות שוות (אחת מקדימה ואחת מאחור)']]),
      gTrap(cube ? `לחשב נפח (${V}), או לספור רק 4 פאות.` : `לשכוח את הפאות שמאחור: ${L(`${a} + ${b} + ${c} = ${a + b + c}`)} זה רק חצי.`), 'שואלים כמה נייר עטיפה או צבע צריך: שטח פנים, סכום השטחים של כל הפאות.');
    return gMake('volume', cube ? 'cubeS' : 'surf', d, cube ? `כמה נייר צריך כדי לעטוף קובייה שהמקצוע שלה ${l} ס"מ? (מה שטח הפנים שלה?)` : 'מה שטח הפנים של התיבה (השטח של כל הפאות יחד)?', figBox(l, w, h, { lab: cube ? [gL(l), '', ''] : null }), S0,
      cube ? [[V, 'זה הנפח'], [4 * a, 'רק 4 פאות'], [6 * l, 'שכחו צלע × צלע'], [a, 'זו פאה אחת']] : [[a + b + c, 'שכחו את הפאות שמאחור'], [V, 'זה הנפח'], [6 * a, 'כאילו כל הפאות כמו הבסיס'], [S0 + a, '']], gUn(CM2), ex,
      cube ? 'לקובייה 6 פאות זהות. מה השטח של פאה אחת?' : 'כמה פאות יש לתיבה? כל פאה היא מלבן. שימו לב: מול כל פאה יש פאה זהה.',
      cube ? `פאה אחת: ${L(`${l} × ${l}`)}. ויש 6 כאלה.` : `שלושה סוגי פאות: ${L(`${l} × ${w}`)}, ${L(`${l} × ${h}`)}, ${L(`${w} × ${h}`)}. מכל סוג יש שתיים.`, { l, w, h }, 2);
  },
  /* which net folds into a cube */
  net(d) {
    let good;
    do good = gGrow(4, 4); while (!gFolds(good) || gHas2x2(good) || Math.max(...good.map(c => c[0])) > 3 || Math.max(...good.map(c => c[1])) > 3);
    const keys = new Set([gShapeKey(good)]), bad = [];
    for (let t = 0; bad.length < 3 && t < 2000; t++) { const c = gGrow(4, 3); const k = gShapeKey(c); if (keys.has(k) || gFolds(c)) continue; if (bad.some(b => gHas2x2(b)) && gHas2x2(c)) continue; keys.add(k); bad.push(c); }
    const why = c => gHas2x2(c) ? 'יש בה ריבוע של 2 על 2. ארבע פאות סביב פינה אחת לא נסגרות לקובייה.' : gRow5(c) ? 'חמש פאות בשורה: מתקפלות יותר מסיבוב שלם.' : 'כשמקפלים, שתי פאות נופלות על אותו מקום, ופאה אחת נשארת פתוחה.';
    const all = [good].concat(bad), m = mc(all.map(c => figCells(c))), Lt = ['א', 'ב', 'ג', 'ד'], gi = m.answer;
    const order = all.map((c, i) => [m.options.indexOf(figCells(c)), c, i]).sort((a, b) => a[0] - b[0]);
    const ex = mEx('מקפלים בראש: בוחרים פאה אחת כרצפה, ומקפלים את השכנות שלה למעלה. בקובייה כל פאה מול פאה אחת, ושתיהן לא נוגעות זו בזו.',
      order.map(([oi, c, i]) => i === 0 ? `${Lt[oi]}: ${mB('מתקפלת לקובייה')}. פאות עם אותו מספר יוצאות זו מול זו` : `${Lt[oi]}: ${why(c)}`), figCells(good, gFolds(good)),
      gTrap('לבחור צורה רק כי יש בה 6 ריבועים. גם פריסה עם 6 ריבועים יכולה להשאיר חור.'), 'פריסה של קובייה: 6 ריבועים, אף פעם לא ריבוע של 2 על 2, ולא 5 בשורה.');
    const q = withHint({ cat: 'geo', d, prompt: 'איזו פריסה אפשר לקפל לקובייה סגורה?', vis: '', options: m.options, answer: gi, ex, ansv: null, lk: GEO_LK.volume, meta: { topic: 'volume', kind: 'net', why: {} } },
      'בחרו ריבוע אחד כרצפה, וקפלו בראש את הריבועים שנוגעים בו למעלה. האם כל הצדדים נסגרים?', 'פריסה עם ריבוע של 2 על 2, או עם 5 ריבועים בשורה, לא נסגרת לקובייה.');
    return q;
  },
  /* the net of a box: surface area or volume */
  netV(d) {
    const l = ri(3, 6), w = ri(2, 4), h = ri(2, 4); if (l === w || w === h || l === h) return GVO.netV(d);
    const area = R() < .5, S0 = 2 * (l * w + l * h + w * h), V = l * w * h;
    const ex = area ? mEx('שטח הפנים של התיבה הוא השטח של הפריסה כולה: סכום השטחים של 6 המלבנים.',
      [`שני מלבנים של ${L(`${l} × ${w} = ${l * w}`)}`, `שני מלבנים של ${L(`${l} × ${h} = ${l * h}`)}`, `שני מלבנים של ${L(`${w} × ${h} = ${w * h}`)}`, `${L(`2 × (${l * w} + ${l * h} + ${w * h}) = <b>${S0}</b>`)} ${CM2}`],
      figNet(l, w, h, { pairs: 1 }) + mLeg([['k', 'אותו צבע: שתי פאות זהות, אחת מול השנייה']]), gTrap(`לחשב נפח (${V}). הפריסה היא נייר, ושואלים כמה נייר.`), 'פריסה ושואלים על שטח: מחברים את השטחים של כל המלבנים.')
      : mEx('מקפלים את הפריסה לתיבה. מהציור קוראים אורך, רוחב וגובה, ואז נפח = אורך × רוחב × גובה.',
        [`אורך ${l}, רוחב ${w}, גובה ${h}`, `${L(`${l} × ${w} × ${h} = <b>${V}</b>`)} ${CM3}`], figBox(l, w, h, { hl: 'top' }), gTrap(`לחבר את השטחים של המלבנים (${S0}). זה שטח הפנים, לא הנפח.`), 'פריסה ושואלים על נפח: מקפלים בראש ומוצאים שלוש מידות.');
    return gMake('volume', 'netV', d, `זו פריסה של תיבה. ${area ? 'מה שטח הפנים של התיבה?' : 'מה הנפח של התיבה שמתקבלת?'}`, figNet(l, w, h), area ? S0 : V,
      area ? [[V, 'זה הנפח'], [S0 / 2, 'ספרו רק שלוש פאות'], [6 * l * w, 'כאילו כל הפאות כמו הגדולה'], [S0 + l * w, '']] : [[S0, 'זה שטח הפנים'], [l * w, 'זה רק הבסיס'], [l + w + h, 'חיברו במקום לכפול'], [V + l * w, '']], gUn(area ? CM2 : CM3), ex,
      area ? 'כל מלבן בפריסה הוא פאה. כמה סוגים של מלבנים יש, וכמה מכל סוג?' : 'קפלו בראש: איזה מלבן יהיה הרצפה? מה האורך, הרוחב והגובה?',
      area ? `יש שלושה סוגים: ${L(`${l} × ${w}`)}, ${L(`${l} × ${h}`)}, ${L(`${w} × ${h}`)}, ומכל סוג שניים.` : `המידות הן ${l}, ${w} ו-${h}. כפלו את שלושתן.`, { l, w, h }, 2);
  },
  /* how many small cubes fit in a box */
  fit(d) {
    for (;;) {
      const e = d >= 3 ? pick([2, 3]) : 2, a = ri(2, 5), b = ri(1, 3), c = ri(1, 3), L0 = a * e, W0 = b * e, H0 = c * e, n = a * b * c, V = L0 * W0 * H0;
      if (n < 4 || L0 > 15) continue;
      const ex = mEx(`בכל כיוון בודקים כמה קוביות של ${e} ס"מ נכנסות, וכופלים.`,
        [`לאורך: ${L(`${L0} ÷ ${e} = ${a}`)}`, `לרוחב: ${L(`${W0} ÷ ${e} = ${b}`)}`, `לגובה: ${L(`${H0} ÷ ${e} = ${c}`)}`, `${L(`${a} × ${b} × ${c} = <b>${n}</b>`)} קוביות`, `בדיקה בנפחים: ${L(`${V} ÷ ${e * e * e} = ${n}`)} (נפח קובייה קטנה: ${L(`${e} × ${e} × ${e} = ${e ** 3}`)})`],
        figBox(a, b, c, { grid: 1, hl: c > 1 ? 'top' : '', lab: [gL(L0), gL(W0), gL(H0)] }), gTrap(`לחלק את הנפח ב-${e} (${L(`${V} ÷ ${e} = ${V / e}`)}). צריך לחלק בנפח של קובייה קטנה, ${e ** 3}.`), 'קוביות קטנות שנכנסות לתיבה: כמה בכל כיוון, ואז כפל.');
      return gMake('volume', 'fit', d, `כמה קוביות שהמקצוע שלהן ${e} ס"מ נכנסות בדיוק בתיבה?`, figBox(L0, W0, H0, { one: e }), n,
        [[V / e, `חילקו את הנפח ב-${e} במקום בנפח של קובייה`], [V, 'זה הנפח בסמ"ק'], [a * b, 'זו רק שכבה אחת'], [a + b + c, 'חיברו במקום לכפול']], gUn('קוביות'), ex,
        `כמה קוביות של ${e} ס"מ נכנסות לאורך ${L0} ס"מ?`, `לאורך ${L(`${L0} ÷ ${e}`)}, לרוחב ${L(`${W0} ÷ ${e}`)}, לגובה ${L(`${H0} ÷ ${e}`)}. כפלו.`, { e, L0, W0, H0 }, 2);
    }
  },
  /* changing one edge, or all of them */
  change(d) {
    if (R() < .45) {
      const f = pick([2, 3]), ans = f ** 3, ex = mEx(`כשכל מקצוע גדל פי ${f}, האורך, הרוחב והגובה גדלים כל אחד פי ${f}.`,
        [`קובייה של 1: ${L('1 × 1 × 1 = 1')}`, `קובייה של ${f}: ${L(`${f} × ${f} × ${f} = ${ans}`)}`, `הנפח גדל ${mB('פי ' + ans)}`], figBox(f, f, f, { grid: 1, lab: [String(f), String(f), String(f)] }),
        gTrap(`לענות פי ${f}. רק אורך אחד גדל פי ${f}: הנפח גדל פי ${f} שלוש פעמים.`), 'כל המקצועות גדלים: הנפח גדל הרבה יותר מהר.');
      const s = v => 'פי ' + L(v);
      return gMake('volume', 'change', d, `כל המקצועות של קובייה גדלים פי ${f}. פי כמה גדל הנפח שלה?`, figBox(1, 1, 1, { lab: ['1', '', ''], H: 120 }) , ans,
        [[f, 'רק מקצוע אחד גדל כך'], [f * f, 'זה כמה גדל השטח של פאה'], [3 * f, 'כפלו ב-3 במקום פעמיים בעצמו'], [6 * f, '']], s, ex,
        `ציירו קובייה של 1 ס"מ, וקובייה ש${f === 2 ? 'כל מקצוע בה 2 ס"מ' : 'כל מקצוע בה 3 ס"מ'}. כמה קוביות קטנות נכנסות בגדולה?`, `בשכבה אחת: ${L(`${f} × ${f}`)}. כמה שכבות יש?`, { f }, 1);
    }
    const l = ri(3, 8), w = ri(2, 5), h = ri(2, 5), f = pick([2, 3]), dim = pick(['l', 'h']), V = l * w * h, V2 = V * f;
    const nm = dim === 'l' ? 'האורך' : 'הגובה', lab = [dim === 'l' ? gL(l * f) : gL(l), gL(w), dim === 'h' ? gL(h * f) : gL(h)];
    const ex = mEx(`כשרק מידה אחת גדלה פי ${f}, גם הנפח גדל פי ${f}.`,
      [`הנפח לפני: ${L(`${l} × ${w} × ${h} = ${V}`)}`, `הנפח אחרי: ${L(`${dim === 'l' ? `${l * f} × ${w} × ${h}` : `${l} × ${w} × ${h * f}`} = <b>${V2}</b>`)} ${CM3}`, `וזה ${L(`${V} × ${f} = ${V2}`)} ✓`], figBox(dim === 'l' ? l * f : l, w, dim === 'h' ? h * f : h, { lab }),
      gTrap(`להכפיל את הנפח פי ${f ** 3}. רק מידה אחת השתנתה, אז הנפח גדל רק פי ${f}.`), 'משנים רק מידה אחת: הנפח משתנה באותו יחס.');
    return gMake('volume', 'change', d, `לתיבה באורך ${l} ס"מ, רוחב ${w} ס"מ וגובה ${h} ס"מ הגדילו את ${nm} פי ${f}. מה הנפח החדש?`, figBox(l, w, h), V2,
      [[V, 'זה הנפח לפני השינוי'], [V * f ** 3, 'הגדילו פי ' + f + ' שלוש פעמים'], [V + f, 'הוסיפו במקום לכפול'], [V * f * f, '']], gUn(CM3), ex,
      `מה ${nm} החדש? כתבו את שלוש המידות אחרי השינוי.`, `הנפח לפני: ${L(`${l} × ${w} × ${h}`)}. רק מידה אחת גדלה פי ${f}.`, { l, w, h, f }, 4);
  },
  /* an aquarium in litres: 1 litre = 1000 סמ"ק */
  liters(d) {
    for (;;) {
      const l = pick([20, 30, 40, 50, 60, 80]), w = pick([10, 20, 25, 30]), h = pick([10, 20, 30, 40]), V = l * w * h, Lt = V / 1000; if (!Number.isInteger(Lt) || Lt < 4) continue;
      const ex = mEx('נפח בסמ"ק, ואז ליטרים: בליטר אחד יש 1000 סמ"ק (קובייה של 10 על 10 על 10).',
        [`${L(`${l} × ${w} × ${h} = ${V}`)} סמ"ק`, `${L(`${V} ÷ 1000 = <b>${Lt}</b>`)} ליטר`], figBox(l, w, h, { hl: 'top', H: 180 }),
        gTrap(`לחלק ב-100 (${L(V / 100)}). בליטר יש 1000 סמ"ק.`), 'שואלים כמה ליטר נכנסים בגוף שהמידות שלו בס"מ: נפח, ואז ÷ 1000.');
      return gMake('volume', 'liters', d, 'כמה ליטר מים נכנסים באקווריום? (1 ליטר = 1000 סמ"ק)', figBox(l, w, h, { H: 180 }), Lt,
        [[V / 100, 'חילקו ב-100 במקום ב-1000'], [V / 10, 'חילקו ב-10'], [V, 'זה הנפח בסמ"ק, לא בליטרים'], [Lt * 2, '']], gUn('ליטר'), ex,
        'חשבו קודם את הנפח בסמ"ק: אורך × רוחב × גובה.', `הנפח: ${L(`${l} × ${w} × ${h}`)} סמ"ק. כמה פעמים 1000 יש בו?`, { l, w, h }, 2);
    }
  },
  /* from the volume back to the height */
  backV(d) {
    const l = ri(3, 10), w = ri(2, 6), h = ri(2, 9), V = l * w * h; if (l === w || l * w === h || V / l === h || V / w === h) return GVO.backV(d);
    const ex = mEx('נפח = אורך × רוחב × גובה. הולכים אחורה: נפח ÷ (אורך × רוחב) = גובה.',
      [`שטח הבסיס: ${L(`${l} × ${w} = ${l * w}`)}`, `גובה: ${L(`${V} ÷ ${l * w} = <b>${h}</b>`)} ${CM}`, `בדיקה: ${L(`${l} × ${w} × ${h} = ${V}`)} ✓`], figBox(l, w, h, { hl: 'top', lab: [gL(l), gL(w), gL(h)] }),
      gTrap(`לחלק רק באורך (${L(`${V} ÷ ${l}`)}), או לחסר.`), 'נתון נפח וחסרה מידה אחת: מחלקים את הנפח במכפלה של שתי המידות הידועות.');
    return gMake('volume', 'backV', d, `הנפח של התיבה הוא ${V} סמ"ק. האורך ${l} ס"מ והרוחב ${w} ס"מ. מה הגובה?`, figBox(l, w, h, { lab: [gL(l), gL(w), '?'] }), h,
      [[V / l, 'חילקו רק באורך'], [V / w, 'חילקו רק ברוחב'], [V - l - w, 'חיסרו במקום לחלק'], [h + 1, '']], gUn(CM), ex,
      `כמה קוביות של 1 ס"מ יש בשכבה התחתונה (${l} על ${w})?`, `בשכבה ${L(`${l} × ${w} = ${l * w}`)} קוביות. כמה שכבות כאלה יש ב-${V}?`, { l, w, h }, 1);
  },
};

/* ===== levels and the generator ===== */
const GEO_POOL = {
  angle: { 1: [GANG.type, GANG.adj, GANG.tri, d => GANG.vert(d), d => GANG.iso(d)], 2: [d => GANG.vert(d, 1), GANG.point, GANG.iso, GANG.quad, GANG.tri, GANG.adj], 3: [GANG.ext, GANG.combo, GANG.iso, GANG.ratio, GANG.quad, GANG.point] },
  area: { 1: [GAR.unit, GAR.rect, GAR.sq, GAR.triR], 2: [GAR.tri, GAR.para, GAR.trap, GAR.sq, d => GAR.L(d, 1), GAR.unit], 3: [GAR.triObt, d => GAR.L(d, 0), GAR.hole, GAR.trap, GAR.triBack, GAR.tri] },
  circle: { 1: [GCI.rd, d => GCI.circ(d, 0)], 2: [d => GCI.area(d, 0), d => GCI.area(d, 1), d => GCI.circ(d, 1), GCI.rd], 3: [GCI.part, GCI.part, GCI.ring, GCI.back, d => GCI.area(d, 1)] },
  volume: { 1: [GVO.cubes, GVO.box, GVO.parts], 2: [GVO.surf, GVO.net, GVO.netV, GVO.fit, GVO.box], 3: [GVO.change, GVO.liters, GVO.backV, GVO.fit, GVO.surf] },
};
const GEO_TOPICS = ['angle', 'area', 'circle', 'volume'];
function genGeo(d, topic) {
  const dd = Math.max(1, Math.min(3, Math.round(d) || 1)), t = topic || pick(GEO_TOPICS), q = pick(GEO_POOL[t][dd])(dd);
  q.cat = 'geo'; q.d = dd; q.lk = GEO_LK[t];
  return q;
}
GEN.geo = hinted(d => genGeo(d));

/* ---------- MATRICES ---------- */
const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hex'];
function shapeEl(s, cx, cy, r, fill) {
  const f = fill === 0 ? 'none' : 'currentColor', fo = fill === 1 ? .32 : 1;
  const a = `fill="${f}" fill-opacity="${fo}" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"`;
  const P = pts => `<polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" ${a}/>`;
  if (s === 'circle') return `<circle cx="${cx}" cy="${cy}" r="${r * .9}" ${a}/>`;
  if (s === 'square') return `<rect x="${cx - r * .8}" y="${cy - r * .8}" width="${r * 1.6}" height="${r * 1.6}" ${a}/>`;
  if (s === 'triangle') return P([[cx, cy - r], [cx + r * .95, cy + r * .75], [cx - r * .95, cy + r * .75]]);
  if (s === 'diamond') return P([[cx, cy - r], [cx + r * .85, cy], [cx, cy + r], [cx - r * .85, cy]]);
  if (s === 'hex') return P([0, 1, 2, 3, 4, 5].map(i => [cx + r * Math.cos(Math.PI / 3 * i), cy + r * Math.sin(Math.PI / 3 * i)]));
  const pts = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r; const an = -Math.PI / 2 + i * Math.PI / 5; pts.push([cx + rr * Math.cos(an), cy + rr * Math.sin(an)]); } return P(pts);
}
function cellSVG(c) {
  const pos = { 1: [[40, 40]], 2: [[23, 40], [57, 40]], 3: [[40, 22], [22, 57], [58, 57]] }[c.count];
  const r = c.count === 1 ? 21 : c.count === 2 ? 14 : 13;
  return `<svg viewBox="0 0 80 80" class="mcell" aria-hidden="true">${pos.map(p => shapeEl(c.shape, p[0], p[1], r, c.fill)).join('')}</svg>`;
}
const ANAME = { shape: ['הצורה', 'צורה', 'f', 'f'], count: ['מספר הצורות', 'כמות', 'm', 'f'], fill: ['המילוי', 'סוג מילוי', 'm', 'm'] };
function genMatrix(d) {
  const attrs = ['shape', 'count', 'fill'];
  const vals = { shape: shuffle(SHAPES).slice(0, 3), count: shuffle([1, 2, 3]), fill: shuffle([0, 1, 2]) };
  let rules = {};
  if (d === 1) { attrs.forEach(a => rules[a] = 'const'); const v = shuffle(attrs); rules[v[0]] = pick(['bycol', 'byrow']); if (R() < .6) rules[v[1]] = pick(['bycol', 'byrow', 'latin']); }
  else if (d === 2) { const v = shuffle(attrs); rules[v[0]] = 'latin'; rules[v[1]] = pick(['bycol', 'byrow', 'latin2']); rules[v[2]] = pick(['const', 'bycol', 'byrow']); }
  else { const v = shuffle(attrs); rules[v[0]] = 'latin'; rules[v[1]] = 'latin2'; rules[v[2]] = pick(['latin', 'latin2', 'bycol', 'byrow']); }
  const idx = (rule, r, c) => rule === 'const' ? 0 : rule === 'bycol' ? c : rule === 'byrow' ? r : rule === 'latin' ? (r + c) % 3 : (r + 2 * c) % 3;
  const cell = (r, c) => { const o = {}; attrs.forEach(a => o[a] = vals[a][idx(rules[a], r, c)]); return o; };
  const ans = cell(2, 2);
  const key = c => c.shape + c.count + c.fill;
  const cands = [];
  const varying = attrs.filter(a => rules[a] !== 'const'), fixed = attrs.filter(a => rules[a] === 'const');
  for (const a of [...shuffle(varying), ...fixed]) for (const v of shuffle(vals[a].concat(a === 'shape' ? [pick(SHAPES.filter(s => !vals.shape.includes(s)))] : []))) { if (v !== ans[a]) cands.push(Object.assign({}, ans, { [a]: v })); }
  // two-attribute change for variety
  const a2 = shuffle(varying); if (a2.length >= 2) { const o = Object.assign({}, ans); o[a2[0]] = pick(vals[a2[0]].filter(v => v !== ans[a2[0]])); o[a2[1]] = pick(vals[a2[1]].filter(v => v !== ans[a2[1]])); cands.splice(2, 0, o); }
  const n = d === 1 ? 4 : 5; const opts = [ans]; const seen = new Set([key(ans)]);
  for (const c of cands) { if (opts.length >= n) break; if (!seen.has(key(c))) { seen.add(key(c)); opts.push(c); } }
  let grid = '<div class="matrix">';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) grid += (r === 2 && c === 2) ? '<div class="mbox q">?</div>' : `<div class="mbox">${cellSVG(cell(r, c))}</div>`;
  grid += '</div>';
  const mo = mc(opts);
  const vn = (a, v) => a === 'shape' ? SHAPEN[v] : a === 'count' ? L(v) : FILLN[v];
  const rd = { bycol: 'משתנה מעמודה לעמודה', byrow: 'משתנה משורה לשורה', latin: 'משתנה בשורות ובעמודות', latin2: 'משתנה בשורות ובעמודות' };
  const h1 = `בדקו כל תכונה לבד: ${varying.map(a => `${ANAME[a][0]} ${rd[rules[a]]}`).join(', ')}${fixed.length ? `, ו${fixed.map(a => ANAME[a][0]).join(' ו')} לא ${fixed.length > 1 ? 'משתנים' : 'משתנה'}` : ''}.`;
  const ha = varying.find(a => rules[a] === 'latin' || rules[a] === 'latin2') || varying[0], [hn1, hn2, hg1, hg2] = ANAME[ha], hr = rules[ha], hk = hg1 === 'f' ? 'קבועה' : 'קבוע';
  const h2 = hr === 'bycol' ? `${hn1} ${hk} בכל עמודה. מה ${hn1} בשתי המשבצות שמעל סימן השאלה?` : hr === 'byrow' ? `${hn1} ${hk} בכל שורה. מה ${hn1} בשתי המשבצות שליד סימן השאלה, באותה שורה?` : `כל ${hn2} (${ha === 'count' ? L(vals[ha].join(', ')) : vals[ha].map(v => vn(ha, v)).join(', ')}) ${hg2 === 'f' ? 'מופיעה' : 'מופיע'} פעם אחת בכל שורה ובכל עמודה. ${hg2 === 'f' ? 'איזו' : 'איזה'} ${hn2} עוד ${hg2 === 'f' ? 'חסרה' : 'חסר'} בשורה האחרונה?`;
  return withHint({ cat: 'matrix', d, prompt: 'איזו משבצת משלימה את הטבלה?', vis: grid, options: mo.options.map(cellSVG), answer: mo.answer, ex: matrixEx(cell, rules, ans), meta: { rules, vals, ans, opts: mo.options } }, h1, h2);
}
/* ---- visual solutions: shared drawing helpers ---- */
const f1 = v => (+v).toFixed(1);
// put a 80x80 cell svg (from cellSVG / dialSVG) at x,y with size s inside a bigger svg
const placeCell = (svg, x, y, s) => svg.replace(/^<svg viewBox="0 0 80 80" class="mcell" aria-hidden="true">/, `<svg x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}" viewBox="0 0 80 80" class="shc">`);
// an arc with an arrow head, angles in degrees on screen (0 = right, 90 = down); a1 > a0 turns clockwise
function arcArrow(cx, cy, r, a0, a1, cls, hw) {
  const rad = x => x * Math.PI / 180, P = a => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
  const dir = a1 > a0 ? 1 : -1, [x0, y0] = P(a0), [x1, y1] = P(a1), th = rad(a1);
  const tx = -Math.sin(th) * dir, ty = Math.cos(th) * dir, nx = Math.cos(th), ny = Math.sin(th);
  const head = [[x1 + tx * hw * 1.4, y1 + ty * hw * 1.4], [x1 + nx * hw, y1 + ny * hw], [x1 - nx * hw, y1 - ny * hw]];
  return `<path d="M${f1(x0)} ${f1(y0)}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${dir > 0 ? 1 : 0} ${f1(x1)} ${f1(y1)}" class="${cls}"/><polygon points="${head.map(p => p.map(f1).join(',')).join(' ')}" class="${cls}h"/>`;
}
// small inline icons for the explanation lines (drawn in the text color)
const icoS = body => `<svg viewBox="0 0 24 24" class="shi" aria-hidden="true">${body}</svg>`;
const icoShape = s => icoS(shapeEl(s, 12, 12, 9, 0));
const icoFill = f => icoS(`<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fill-opacity="${[0, .32, 1][f]}" stroke="currentColor" stroke-width="2.2"/>`);
const icoCount = n => icoS(({ 1: [[12, 12]], 2: [[6.5, 12], [17.5, 12]], 3: [[12, 6], [6, 17], [18, 17]] })[n].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="currentColor"/>`).join(''));
const shJoin = a => a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} ו${a[a.length - 1]}`;
/* matrix: the solved grid (answer cell marked) + one line per property */
function matrixEx(cell, rules, ans) {
  const s = 40, g = 4, W = 3 * s + 2 * g;
  let grid = `<svg viewBox="-4 -4 ${W + 8} ${W + 8}" class="shx shgrid" aria-hidden="true">`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = (2 - c) * (s + g), y = r * (s + g), last = r === 2 && c === 2; // column 0 on the right (RTL)
    grid += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="5" class="pp${last ? ' pa' : ''}"/>${placeCell(cellSVG(cell(r, c)), x + 2, y + 2, s - 4)}${last ? `<rect x="${x - 1.5}" y="${y - 1.5}" width="${s + 3}" height="${s + 3}" rx="6" class="hlr"/>` : ''}`; }
  grid += '</svg>';
  const vt = (a, v) => a === 'shape' ? SHAPEN[v] : a === 'count' ? (v === 1 ? 'צורה אחת' : `${L(v)} צורות`) : FILLN[v];
  const ico = (a, v) => a === 'shape' ? icoShape(v) : a === 'count' ? icoCount(v) : icoFill(v);
  const lab = { shape: 'צורה', count: 'כמות', fill: 'מילוי' };
  const line = a => { const r = rules[a], v = `<b>${vt(a, ans[a])}</b>`; let t;
    if (r === 'const') t = `זהה בכל המשבצות. תמיד: ${v}.`;
    else if (r === 'bycol') t = `לא משתנה בתוך עמודה. מעל סימן השאלה: ${v}.`;
    else if (r === 'byrow') t = `לא משתנה בתוך שורה. בשורה האחרונה: ${v}.`;
    else { const row = [0, 1, 2].map(c => cell(0, c)[a]); const list = a === 'count' ? `${L(row[0])}, ${L(row[1])} ו-${L(row[2])} צורות` : shJoin(row.map(x => vt(a, x)));
      t = `בכל שורה יש ${list}, כל אחד פעם אחת. בשורה האחרונה חסר: ${v}.`; }
    return `<span class="shl">${ico(a, ans[a])}<span><b>${lab[a]}:</b> ${t}</span></span>`; };
  return `<span class="shm"><b>השיטה:</b> בודקים תכונה אחת בכל פעם (צורה, כמות, מילוי) לאורך השורות.</span><span class="shv">${grid}</span>${['shape', 'count', 'fill'].map(line).join('')}`;
}
/* ---------- SPATIAL ---------- */
const normP = cs => { const mx = Math.min(...cs.map(c => c[0])), my = Math.min(...cs.map(c => c[1])); return cs.map(c => [c[0] - mx, c[1] - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const keyP = cs => JSON.stringify(normP(cs));
const rotP = cs => cs.map(([x, y]) => [-y, x]);
const mirP = cs => cs.map(([x, y]) => [-x, y]);
function polySVG(cs, mark) {
  cs = normP(cs); const u = 18, W = Math.max(...cs.map(c => c[0])) + 1, H = Math.max(...cs.map(c => c[1])) + 1, S = Math.max(W, H) * u + 8;
  const ox = (S - W * u) / 2, oy = (S - H * u) / 2;
  return `<svg viewBox="0 0 ${S} ${S}" class="poly" aria-hidden="true">${cs.map(c => `<rect x="${ox + c[0] * u}" y="${oy + c[1] * u}" width="${u}" height="${u}" class="pc"/>`).join('')}</svg>`;
}
function genRotation(d) {
  const n = d === 1 ? 5 : d === 2 ? 6 : 7;
  for (let tries = 0; tries < 500; tries++) {
    const cs = [[0, 0]];
    while (cs.length < n) { const [x, y] = pick(cs), [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!cs.some(c => c[0] === x + dx && c[1] === y + dy)) cs.push([x + dx, y + dy]); }
    const rs = [cs]; for (let i = 1; i < 4; i++) rs.push(rotP(rs[i - 1]));
    const rk = new Set(rs.map(keyP)); if (rk.size < 4) continue;
    const ms = rs.map(mirP); if (ms.some(m => rk.has(keyP(m)))) continue;
    const W = Math.max(...cs.map(c => c[0])) - Math.min(...cs.map(c => c[0])), H = Math.max(...cs.map(c => c[1])) - Math.min(...cs.map(c => c[1]));
    if (W > 3 || H > 3) continue;
    const ki = ri(1, 3), correct = rs[ki];
    const wrong = shuffle(ms).slice(0, 3);
    const m = mc([correct, ...wrong].map(c => polySVG(c)));
    return withHint({ cat: 'spatial', d, prompt: 'איזו צורה היא אותה צורה בדיוק, רק מסובבת? (בלי להפוך אותה כמו במראה)', vis: `<div class="polybig">${polySVG(cs)}</div>`, options: m.options, answer: m.answer, ex: 'שלוש הצורות האחרות הן תמונת מראה של המקורית: כדי לקבל אותן צריך "להפוך" את הצורה, לא רק לסובב. טריק: מצא חלק בולט (זנב או פינה) ובדוק לאיזה צד הוא פונה ביחס לשאר הצורה.' },
      `הצורה בנויה מ-${L(n)} משבצות, ושלוש מהתשובות הן תמונת מראה שלה. בחרו חלק בולט בצורה ובדקו לאיזה צד הוא פונה.`,
      ki === 2 ? `בתשובה הנכונה הצורה עומדת הפוך: סובבו אותה חצי סיבוב בראש. החלק הבולט שהיה למעלה עובר למטה, ומה שהיה בצד אחד עובר לצד השני.` : `בתשובה הנכונה הצורה מסובבת רבע סיבוב, אז היא ${W === H ? 'שוכבת על צד אחר' : `נהיית ${L(H + 1)} על ${L(W + 1)} במקום ${L(W + 1)} על ${L(H + 1)}`}. בדקו לאן הלך החלק הבולט.`);
  }
  return genSeries(d);
}
const vk = v => v.join(',');
const neg = v => v.map(x => -x || 0);
function foldNet(cells) {
  const st = { [vk(cells[0])]: { n: [0, 0, -1], e: [1, 0, 0], u: [0, 1, 0] } };
  const q = [cells[0]];
  const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
  while (q.length) {
    const [x, y] = q.shift(); const s = st[vk([x, y])];
    const moves = [[1, 0, { n: s.e, e: neg(s.n), u: s.u }], [-1, 0, { n: neg(s.e), e: s.n, u: s.u }], [0, -1, { n: s.u, e: s.e, u: neg(s.n) }], [0, 1, { n: neg(s.u), e: s.e, u: s.n }]];
    for (const [dx, dy, ns] of moves) { const k = vk([x + dx, y + dy]); if (has(x + dx, y + dy) && !st[k]) { st[k] = ns; q.push([x + dx, y + dy]); } }
  }
  return cells.map(c => st[vk(c)].n);
}
function genNet(d) {
  const SY = ['★', '●', '▲', '■', '◆', '✚'];
  for (let tries = 0; tries < 2000; tries++) {
    const cs = [[0, 0]];
    while (cs.length < 6) { const [x, y] = pick(cs), [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!cs.some(c => c[0] === x + dx && c[1] === y + dy)) cs.push([x + dx, y + dy]); }
    const ns = foldNet(cs); if (new Set(ns.map(vk)).size !== 6) continue;
    const nc = normP(cs); const W = Math.max(...nc.map(c => c[0])) + 1, H = Math.max(...nc.map(c => c[1])) + 1; if (W > 5 || H > 5) continue;
    const ns2 = foldNet(nc); const sy = shuffle(SY);
    // hard version: pick a pair that is NOT in a straight line with one gap
    let ai = ri(0, 5); const opp = i => ns2.findIndex(n => vk(n) === vk(neg(ns2[i])));
    if (d === 3) { for (let k = 0; k < 6; k++) { const j = opp(k); const a = nc[k], b = nc[j]; if (!(a[0] === b[0] || a[1] === b[1])) { ai = k; break; } } }
    const bi = opp(ai);
    const others = [0, 1, 2, 3, 4, 5].filter(i => i !== ai && i !== bi);
    const m = mc([sy[bi], ...shuffle(others).slice(0, 3).map(i => sy[i])].map(s => `<span class="sym">${s}</span>`));
    const u = 46, S = { w: W * u + 6, h: H * u + 6 };
    const svg = `<svg viewBox="0 0 ${S.w} ${S.h}" class="net" style="max-width:${Math.min(320, S.w * 1.15)}px" aria-hidden="true">${nc.map((c, i) => `<rect x="${3 + c[0] * u}" y="${3 + c[1] * u}" width="${u}" height="${u}" class="nc${i === ai ? ' hl' : ''}"/><text x="${3 + c[0] * u + u / 2}" y="${3 + c[1] * u + u / 2 + 8}" text-anchor="middle" class="nt${i === ai ? ' hl' : ''}">${sy[i]}</text>`).join('')}</svg>`;
    const pa = nc[ai], pb = nc[bi], has = (x, y) => nc.some(c => c[0] === x && c[1] === y);
    const sk = pa[0] === pb[0] && Math.abs(pa[1] - pb[1]) === 2 && has(pa[0], (pa[1] + pb[1]) / 2) ? 'בעמודה' : pa[1] === pb[1] && Math.abs(pa[0] - pb[0]) === 2 && has((pa[0] + pb[0]) / 2, pa[1]) ? 'בשורה' : '';
    const nb = nc.map((_, i) => i).filter(i => Math.abs(nc[i][0] - pa[0]) + Math.abs(nc[i][1] - pa[1]) === 1).map(i => sy[i]);
    const nh2 = sk ? `כלל הדילוג: בקו ישר, המשבצת שאחרי השכנה היא הפאה הנגדית. חפשו ${sk} של ${sy[ai]} סימן שרחוק ממנו שתי משבצות.` : `שימו את ${sy[ai]} על השולחן. ${nb.length > 1 ? `${nb.join(' ו-')} מתקפלים למעלה ונהיים קירות` : `${nb[0]} מתקפל למעלה ונהיה קיר`}. המשיכו לקפל: איזה סימן נוחת למעלה, מעל ${sy[ai]}?`;
    return withHint({ cat: 'spatial', d, prompt: `מקפלים את הפריסה לקובייה. איזה סימן יהיה בפאה שמול ${sy[ai]}?`, vis: `<div class="netwrap">${svg}</div>`, options: m.options, answer: m.answer, ex: `${sy[ai]} ו-${sy[bi]} נמצאים בפאות נגדיות. כלל: פאות נגדיות אף פעם לא נוגעות זו בזו בפריסה. בשורה ישרה, משבצת ועוד משבצת אחריה ("דילוג על אחת") הן נגדיות. אם לא בשורה ישרה, נסה לדמיין את הקיפול צעד אחרי צעד מהפאה שמסומנת.` }, `הפאה המסומנת היא ${sy[ai]}. סימן שנוגע בה בפריסה לא יכול להיות מולה. אילו סימנים נוגעים ב-${sy[ai]}?`, nh2);
  }
  return genRotation(d);
}
function genSpatial(d) { return R() < .5 ? genRotation(d) : genNet(d); }
/* isometric cube counting */
function genCubes(d) {
  const n = d === 1 ? 2 : 3, maxH = d === 1 ? 2 : 3;
  let h;
  for (let t = 0; t < 50; t++) {
    h = Array.from({ length: n }, () => Array.from({ length: n }, () => ri(d === 1 ? 1 : 0, maxH)));
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) { if (x > 0) h[x][y] = Math.min(h[x][y], h[x - 1][y]); if (y > 0) h[x][y] = Math.min(h[x][y], h[x][y - 1]); }
    const tot = h.flat().reduce((a, b) => a + b, 0); if (h[0][0] >= 2 && tot >= (d === 1 ? 4 : 7)) break;
  }
  const count = h.flat().reduce((a, b) => a + b, 0);
  const w = 20, cubes = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < h[x][y]; z++) cubes.push([x, y, z]);
  cubes.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]);
  const P = ([x, y, z]) => [(x - y) * w, (x + y) * w / 2 - z * w];
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  cubes.forEach(c => { const [cx, cy] = P(c); minX = Math.min(minX, cx - w); maxX = Math.max(maxX, cx + w); minY = Math.min(minY, cy - w / 2); maxY = Math.max(maxY, cy + w / 2 + w); });
  const pts = a => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const body = cubes.map(c => { const [cx, cy] = P(c); return `<polygon class="cu-t" points="${pts([[cx, cy - w / 2], [cx + w, cy], [cx, cy + w / 2], [cx - w, cy]])}"/><polygon class="cu-l" points="${pts([[cx - w, cy], [cx, cy + w / 2], [cx, cy + w / 2 + w], [cx - w, cy + w]])}"/><polygon class="cu-r" points="${pts([[cx + w, cy], [cx, cy + w / 2], [cx, cy + w / 2 + w], [cx + w, cy + w]])}"/>`; }).join('');
  const svg = `<svg class="cubes" viewBox="${(minX - 4).toFixed(0)} ${(minY - 4).toFixed(0)} ${(maxX - minX + 8).toFixed(0)} ${(maxY - minY + 8).toFixed(0)}" aria-hidden="true">${body}</svg>`;
  const cols = h.flat().filter(v => v > 0);
  const hv = (x, y) => x < n && y < n ? h[x][y] : 0, outer = [], inner = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) if (h[x][y] > 0) (hv(x + 1, y) === 0 || hv(x, y + 1) === 0 ? outer : inner).push(h[x][y]);
  const ch1 = inner.length ? `ספרו עמודה אחרי עמודה. בעמודות החיצוניות רואים את כל הגובה: ${L(outer.join(', '))}. ספרו גם את העמודות שמאחוריהן.` : `יש כאן ${L(outer.length)} עמודות של קוביות. ספרו לכל עמודה כמה קומות יש בה, מהרצפה ועד הקובייה העליונה.`;
  const ch2 = inner.length ? `מאחור יש עוד ${inner.length === 1 ? `עמודה אחת, בגובה ${L(inner[0])}` : `${L(inner.length)} עמודות, בגובה ${L(inner.join(', '))}`}. ${inner.length === 1 ? 'חלק מהקוביות שלה מוסתרות' : 'חלק מהקוביות שלהן מוסתרות'}, אבל הן שם. עכשיו חברו את כל הגבהים.` : `כאן אין עמודות מוסתרות מאחור. העמודה הגבוהה ביותר היא בגובה ${L(Math.max(...outer))}: ספרו כך גם את השאר, וחברו.`;
  return withHint(numQ('spatial', d, 'כמה קוביות יש במבנה? (כל קובייה עומדת על הרצפה או על קובייה אחרת)', `<div class="cubewrap">${svg}</div>`, count, [count - 1, count + 1, count + 2, count - 2], `סופרים עמודה אחרי עמודה, כולל קוביות שמוסתרות מתחת לקוביות אחרות: ${cols.join(' + ')} = ${count}. טריק: הסתכל על הקוביות העליונות וחשב לכל אחת כמה קומות יש מתחתיה.`), ch1, ch2);
}
function genSpatial2(d) { return R() < .3 ? genCubes(d) : genSpatial(d); }
const SHAPEN = { circle: 'עיגול', square: 'ריבוע', triangle: 'משולש', diamond: 'מעוין', star: 'כוכב', hex: 'משושה' };
const SHAPEP = { circle: 'עיגולים', square: 'ריבועים', triangle: 'משולשים', diamond: 'מעוינים', star: 'כוכבים', hex: 'משושים' }, FILLP = ['ריקים', 'אפורים', 'מלאים'];
const fdesc = o => o.count === 1 ? `${SHAPEN[o.shape]} ${FILLN[o.fill]}` : `${L(o.count)} ${SHAPEP[o.shape]} ${FILLP[o.fill]}`;
function genFigAn(d) {
  const key = o => o.shape + o.count + o.fill;
  for (let t = 0; t < 300; t++) {
    const sh = shuffle(SHAPES), nCh = d === 1 ? 1 : d >= 4 ? 3 : 2;
    const ch = shuffle(['fill', 'count', 'shape']).slice(0, nCh);
    const A = { shape: sh[0], count: ri(1, 3), fill: ri(0, 2) };
    const dc = ch.includes('count') ? pick([-2, -1, 1, 2].filter(x => A.count + x >= 1 && A.count + x <= 3)) : 0;
    const B = { shape: ch.includes('shape') ? sh[2] : A.shape, count: A.count + dc, fill: ch.includes('fill') ? pick([0, 1, 2].filter(x => x !== A.fill)) : A.fill };
    // C starts like A in every property that changes, so "+1" and "becomes 3" give the same answer.
    // A property that does not change may differ in C (it then stays as it is in C).
    const C = { shape: sh[1], count: A.count, fill: A.fill };
    if (!dc && R() < .6) C.count = pick([1, 2, 3].filter(x => x !== A.count));
    if (!ch.includes('fill') && R() < .5) C.fill = pick([0, 1, 2].filter(x => x !== A.fill));
    if (nCh === 3) { const cs = [1, 2, 3].filter(x => x !== A.count && x + dc >= 1 && x + dc <= 3); if (!cs.length) continue; C.count = pick(cs); }
    const ans = { shape: B.shape === A.shape ? C.shape : B.shape, count: C.count + dc, fill: B.fill === A.fill ? C.fill : B.fill };
    if (key(ans) === key(B) || key(ans) === key(C)) continue; // the answer must not just copy a box
    // an option "fits" if it matches the change under any fair reading (count: +dc, becomes B's count, or times)
    const fits = o => o.shape === ans.shape && o.fill === ans.fill && (o.count === ans.count || (dc && (o.count === B.count || o.count * A.count === C.count * B.count)));
    const cands = [Object.assign({}, C), Object.assign({}, B)];
    [1, 2].forEach(k => cands.push(Object.assign({}, ans, { fill: (ans.fill + k) % 3 })));
    [1, 2, 3].filter(x => x !== ans.count).forEach(x => cands.push(Object.assign({}, ans, { count: x })));
    [C.shape, A.shape, sh[3]].filter(x => x !== ans.shape).forEach(x => cands.push(Object.assign({}, ans, { shape: x })));
    cands.push(Object.assign({}, C, { fill: ans.fill }), Object.assign({}, C, { count: ans.count }));
    const n = d === 1 ? 4 : 5, opts = [ans], seen = new Set([key(ans)]);
    for (const c of shuffle(cands)) { if (opts.length >= n) break; if (!seen.has(key(c)) && !fits(c)) { seen.add(key(c)); opts.push(c); } }
    if (opts.length < n) continue;
    const parts = [];
    if (B.fill !== A.fill) parts.push(`המילוי משתנה מ${FILLN[A.fill]} ל${FILLN[B.fill]}`);
    if (dc) parts.push(`מספר הצורות ${dc > 0 ? 'גדל' : 'קטן'} ב-${L(Math.abs(dc))}`);
    if (B.shape !== A.shape) parts.push(`הצורה הופכת ל${SHAPEN[B.shape]}`);
    const box = (o, q) => `<div class="fbox${q ? ' q' : ''}">${q ? '?' : cellSVG(o)}</div>`;
    const svgs = opts.map(cellSVG), m = mc(svgs);
    const fh2 = parts.length === 1 ? `מהקופסה הראשונה לשנייה ${parts[0]}, וכל השאר נשאר. הצורה השלישית עוברת בדיוק את אותו שינוי.` : `שינוי אחד: ${parts[0]}. יש עוד ${parts.length === 2 ? 'שינוי אחד. מצאו אותו' : `${L(parts.length - 1)} שינויים. מצאו אותם`}, והפעילו הכול על הצורה השלישית.`;
    return withHint({ cat: 'analog', d, prompt: 'הצורה הראשונה משתנה לשנייה. אותו שינוי בדיוק קורה לצורה השלישית. מה בא במקום סימן השאלה?', vis: `<div class="fan">${box(A)}<span class="ar">←</span>${box(B)}<span class="like">כמו</span>${box(C)}<span class="ar">←</span>${box(null, 1)}</div>`, options: m.options, answer: m.answer, ex: figAnEx(A, B, C, ans, dc), meta: { A, B, C, ans, opts: m.options.map(o => opts[svgs.indexOf(o)]) } }, `בקופסה הראשונה: ${fdesc(A)}. בשנייה: ${fdesc(B)}. מה השתנה ביניהן: הצורה, הכמות או המילוי?`, fh2);
  }
  return genMatrix(Math.min(d, 3));
}
/* figural analogy: both pairs, with the change written between them */
function figAnEx(A, B, C, ans, dc) {
  const chg = (x, y) => { const ls = [];
    if (y.shape !== x.shape) ls.push(`<span class="fxl">${icoShape(x.shape)}<i>←</i>${icoShape(y.shape)}</span>`);
    if (dc) ls.push(`<span class="fxl">כמות ${L((dc > 0 ? '+' : '-') + Math.abs(dc))}</span>`);
    if (y.fill !== x.fill) ls.push(`<span class="fxl">${icoFill(x.fill)}<i>←</i>${icoFill(y.fill)}</span>`);
    return ls.join(''); };
  const bx = (o, hl) => `<span class="fxb${hl ? ' hl' : ''}">${cellSVG(o)}</span>`;
  const row = (x, y, hl, tag) => `<span class="fxr">${bx(x)}<span class="fxc">${tag ? `<span class="fxt">${tag}</span>` : ''}${chg(x, y)}<span class="fxa">←</span></span>${bx(y, hl)}</span>`;
  const keep = [];
  if (B.shape === A.shape) keep.push(`הצורה נשארת ${SHAPEN[C.shape]}`);
  if (!dc) keep.push(`הכמות נשארת ${C.count === 1 ? 'צורה אחת' : `${L(C.count)} צורות`}`);
  if (B.fill === A.fill) keep.push(`המילוי נשאר ${FILLN[C.fill]}`);
  const parts = [];
  if (B.shape !== A.shape) parts.push(`הצורה הופכת ל${SHAPEN[B.shape]}`);
  if (dc) parts.push(`${dc > 0 ? 'מוסיפים' : 'מורידים'} ${Math.abs(dc) === 1 ? 'צורה אחת' : `${L(2)} צורות`}${C.count !== A.count ? ` (${L(C.count + (dc > 0 ? '+' : '-') + Math.abs(dc) + '=' + ans.count)})` : ''}`);
  if (B.fill !== A.fill) parts.push(`המילוי הופך ל${FILLN[B.fill]}`);
  return `<span class="shm"><b>השיטה:</b> מוצאים מה השתנה בזוג הראשון, ועושים בדיוק את אותו שינוי לצורה השלישית.</span><span class="shv fx">${row(A, B, 0, '')}${row(C, ans, 1, 'אותו שינוי')}</span><span class="shl"><span><b>השינוי:</b> ${parts.join(', ')}.</span></span>${keep.length ? `<span class="shl"><span><b>מה שלא השתנה:</b> ${keep.join(', ')}.</span></span>` : ''}`;
}
function genAnalog(d) {
  if (R() < .5) { const it = pickBank(AN, 'an', Math.min(d, 3)); const m = mc(it.o);
    return { cat: 'analog', d, prompt: 'השלם את האנלוגיה. איזו מילה מתאימה במקום סימן השאלה?', vis: `<div class="analogy"><span class="w">${it.a}</span><span class="sep">:</span><span class="w">${it.b}</span><span class="like">כמו</span><span class="w">${it.c}</span><span class="sep">:</span><span class="w q">?</span></div>`, options: m.options, answer: m.answer, ex: it.ex }; }
  return genFigAn(d);
}
/* ---- shape series (dial) ---- */
const CORN = [[16, 16], [64, 16], [64, 64], [16, 64]];
function dialSVG(o) {
  const a = (o.ang * 45 - 90) * Math.PI / 180;
  return `<svg viewBox="0 0 80 80" class="mcell" aria-hidden="true"><rect x="7" y="7" width="66" height="66" rx="7" fill="currentColor" fill-opacity="${o.fr ? .22 : 0}" stroke="currentColor" stroke-width="2.4"/><line x1="40" y1="40" x2="${(40 + 24 * Math.cos(a)).toFixed(1)}" y2="${(40 + 24 * Math.sin(a)).toFixed(1)}" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><circle cx="40" cy="40" r="3.6" fill="currentColor"/><circle cx="${CORN[o.dot][0]}" cy="${CORN[o.dot][1]}" r="5.5" fill="currentColor"/></svg>`;
}
function genShapeSeries(d) {
  const da = pick(d === 1 ? [1, 2] : [1, 2, 3]) * (R() < .5 ? 1 : -1), dd = d >= 2 ? pick([1, -1, 2]) : 0, alt = d >= 3;
  const a0 = ri(0, 7), dot0 = ri(0, 3);
  const at = i => ({ ang: ((a0 + i * da) % 8 + 8) % 8, dot: ((dot0 + i * dd) % 4 + 4) % 4, fr: alt ? i % 2 : 0 });
  const len = d >= 4 ? 5 : 4, ans = at(len);
  const k = o => `${o.ang}${o.dot}${o.fr}`;
  const cands = [Object.assign({}, ans, { ang: (ans.ang + 2) % 8 }), Object.assign({}, ans, { dot: (ans.dot + 1) % 4 }), Object.assign({}, ans, { ang: ((ans.ang - da * 2) % 8 + 8) % 8 }), Object.assign({}, ans, { fr: 1 - ans.fr }), Object.assign({}, ans, { ang: (ans.ang + 4) % 8 }), at(len - 1)];
  const opts = [ans]; const seen = new Set([k(ans)]);
  for (const c of cands) { if (opts.length >= 5) break; if (!seen.has(k(c))) { seen.add(k(c)); opts.push(c); } }
  const m = mc(opts.map(dialSVG));
  const deg = Math.abs(da) * 45, cw = da > 0 ? 'עם' : 'נגד';
  const sh1 = `עקבו אחרי כל חלק לבד. ${dd ? 'כאן זזים גם המחוג וגם הנקודה' : 'כאן זז רק המחוג, הנקודה נשארת במקום'}${alt ? ', והרקע משתנה' : ''}. בכמה זז המחוג בין שתי המשבצות הראשונות?`;
  const sh2 = `בכל צעד המחוג מסתובב ${L(deg + '°')} ${cw} כיוון השעון${dd ? `, והנקודה זזה ${Math.abs(dd) === 2 ? 'שתי פינות' : `פינה אחת ${dd > 0 ? 'עם' : 'נגד'} כיוון השעון`}` : ''}${alt ? ', והרקע מתחלף ריק ואפור' : ''}. מה בא אחרי המשבצת האחרונה?`;
  const seq = Array.from({ length: len + 1 }, (_, i) => at(i));
  const lines = [`<span class="shl">${icoHand(da)}<span><b>מחוג:</b> מסתובב ${L(deg + '°')} ${cw} כיוון השעון בכל צעד${deg === 90 ? ' (רבע סיבוב)' : deg === 45 ? ' (חצי מרבע סיבוב)' : ''}.</span></span>`,
    `<span class="shl">${icoDot(dd)}<span><b>נקודה:</b> ${!dd ? 'נשארת באותה פינה.' : Math.abs(dd) === 2 ? 'קופצת לפינה שמולה בכל צעד (באלכסון).' : `זזה פינה אחת ${dd > 0 ? 'עם' : 'נגד'} כיוון השעון בכל צעד.`}</span></span>`,
    `<span class="shl">${icoFill(alt ? 1 : 0)}<span><b>רקע:</b> ${alt ? `מתחלף: ריק, אפור, ריק, אפור. אחרי ${seq[len - 1].fr ? 'אפור' : 'ריק'} בא <b>${ans.fr ? 'אפור' : 'ריק'}</b>.` : 'תמיד ריק.'}</span></span>`];
  const ex = `<span class="shm"><b>השיטה:</b> עוקבים אחרי כל חלק לבד (מחוג, נקודה, רקע) ומוצאים את הצעד שחוזר בין כל שתי משבצות.</span><span class="shv">${dialStrip(seq, da, dd)}</span>${lines.join('')}`;
  return withHint({ cat: 'matrix', d, prompt: 'מה הצורה הבאה בסדרה?', vis: `<div class="sseries">${Array.from({ length: len }, (_, i) => `<div class="fbox">${dialSVG(at(i))}</div>`).join('<span class="ar">←</span>')}<span class="ar">←</span><div class="fbox q">?</div></div>`, options: m.options, answer: m.answer, ex, meta: { da, dd, alt, len, ans, seq } }, sh1, sh2);
}
// inside a dial cell: where the hand and the dot were one step before, and the turn
function dialMark(p, o, da) {
  const a0 = p.ang * 45 - 90, a1 = a0 + da * 45, rad = x => x * Math.PI / 180;
  let s = `<line x1="40" y1="40" x2="${f1(40 + 24 * Math.cos(rad(a0)))}" y2="${f1(40 + 24 * Math.sin(rad(a0)))}" class="gh"/>` + arcArrow(40, 40, 15, a0 + (da > 0 ? 8 : -8), a1 - (da > 0 ? 14 : -14), 'mk', 5);
  if (p.dot !== o.dot) s += `<circle cx="${CORN[p.dot][0]}" cy="${CORN[p.dot][1]}" r="5.5" class="gh"/>`;
  return s;
}
// the solved series: every cell, the answer framed, and the step written under each arrow
function dialStrip(seq, da, dd) {
  const n = seq.length, s = 56, g = 30, fs = n >= 6 ? 21 : 17, W = n * s + (n - 1) * g, ly = s + 6 + fs, H = ly + (dd ? fs * 1.35 : 0) + 8;
  const deg = Math.abs(da) * 45, ic = fs * .36;
  let o = `<svg viewBox="-4 -4 ${W + 8} ${f1(H + 4)}" class="shx shstrip" aria-hidden="true">`;
  seq.forEach((c, i) => { const x = W - s - i * (s + g), last = i === n - 1;
    o += `<rect x="${x}" y="0" width="${s}" height="${s}" rx="8" class="pp${last ? ' pa' : ''}"/>${placeCell(dialSVG(c).replace(/<\/svg>$/, (i ? dialMark(seq[i - 1], c, da) : '') + '</svg>'), x + 1, 1, s - 2)}`;
    if (last) o += `<rect x="${x - 2}" y="-2" width="${s + 4}" height="${s + 4}" rx="9" class="hlr"/>`;
    if (i === n - 1) return;
    const gx = x - g / 2, tw = String(deg).length * fs * .6 + fs * .45, tot = tw + 3 + ic * 2, x0 = gx - tot / 2;
    o += `<line x1="${x - 5}" y1="${s / 2}" x2="${x - g + 9}" y2="${s / 2}" class="sar"/><polygon points="${x - g + 4},${s / 2} ${x - g + 11},${s / 2 - 4.5} ${x - g + 11},${s / 2 + 4.5}" class="sarh"/>`;
    o += `<text x="${f1(x0)}" y="${f1(ly)}" class="slb" style="font-size:${fs}px" direction="ltr" text-anchor="start">${deg}°</text>` + arcArrow(x0 + tw + 3 + ic, ly - fs * .35, ic, da > 0 ? -290 : 110, da > 0 ? -20 : -160, 'sla', ic * .55);
    if (dd) { const y2 = ly + fs * 1.3, dx = gx - ic * 1.4;
      o += `<circle cx="${f1(dx)}" cy="${f1(y2 - fs * .35)}" r="${f1(fs * .2)}" class="sld"/>`;
      o += Math.abs(dd) === 2 ? `<line x1="${f1(gx + ic * .1)}" y1="${f1(y2 - fs * .35 + ic)}" x2="${f1(gx + ic * 1.6)}" y2="${f1(y2 - fs * .35 - ic)}" class="sla"/><polygon points="${f1(gx + ic * 2.1)},${f1(y2 - fs * .35 - ic * 1.5)} ${f1(gx + ic * .9)},${f1(y2 - fs * .35 - ic * 1.1)} ${f1(gx + ic * 1.9)},${f1(y2 - fs * .35 - ic * .2)}" class="slah"/>` : arcArrow(gx + ic * 1.2, y2 - fs * .35, ic, dd > 0 ? -290 : 110, dd > 0 ? -20 : -160, 'sla', ic * .55); }
  });
  return o + '</svg>';
}
const icoHand = da => icoS(`<rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="12" x2="12" y2="5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>`);
const icoDot = dd => icoS(`<rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7.5" cy="7.5" r="2.8" fill="currentColor"/>`);
function genShapes(d) { return R() < .4 ? genShapeSeries(d) : genMatrix(Math.min(d, 3)); }

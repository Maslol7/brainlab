/* ---------- animated solutions ----------
   Small CSS animations that show the idea of a solution, played once when the solution opens,
   with a "שוב" button to replay. They live inside q.ex, so only inline elements (span, svg). */
function replayAnim(btn) { const w = btn.closest('.anim'); if (!w) return; const c = w.cloneNode(true); w.replaceWith(c); }
const animBox = (body, cap) => `<span class="anim">${body}${cap ? `<span class="an-cap">${cap}</span>` : ''}<button type="button" class="an-again" onclick="replayAnim(this)">${IC.share ? '↻' : '↻'} שוב</button></span>`;

/* cube net: a small 3D canvas. The net lies flat, folds around the marked face one ring at a time,
   then the cube turns half a circle to show the face behind it. Runs when the canvas appears on the page. */
function foldNetHTML(nc, sy, ai, bi) {
  const data = JSON.stringify({ nc, sy, ai, bi }).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return animBox(`<canvas class="netfold" data-net="${data}"></canvas>`, `מקפלים סביב ${sy[ai]}, ומסובבים את הקובייה: מאחוריו נמצא ${sy[bi]}.`);
}
const NET_OBS = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => document.querySelectorAll('canvas.netfold:not([data-run])').forEach(netFoldRun)) : null;
if (NET_OBS) NET_OBS.observe(document.documentElement, { childList: true, subtree: true });
function netFoldRun(cv) {
  cv.dataset.run = 1; let D; try { D = JSON.parse(cv.dataset.net); } catch (e) { return; }
  const { nc, sy, ai, bi } = D, at = (x, y) => nc.findIndex(c => c[0] === x && c[1] === y);
  /* the fold tree: each face hangs on its parent by one edge */
  const par = { [ai]: -1 }, dep = { [ai]: 0 }, hinge = {}, q = [ai];
  while (q.length) { const i = q.shift(), [x, y] = nc[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = at(x + dx, y + dy); if (j >= 0 && !(j in par)) { par[j] = i; dep[j] = dep[i] + 1; hinge[j] = { n: [dx, dy], h: [x + .5 + dx * .5, y + .5 + dy * .5] }; q.push(j); } } }
  const maxD = Math.max(...Object.values(dep));
  /* which rule finds the pair: three in a row, or a Z */
  const [x1, y1] = nc[ai], [x2, y2] = nc[bi]; let rule = null, cells = [];
  if ((y1 === y2 && Math.abs(x1 - x2) === 2) || (x1 === x2 && Math.abs(y1 - y2) === 2)) { rule = 'קו של שלוש: הקצוות נגדיים'; cells = [ai, at((x1 + x2) / 2, (y1 + y2) / 2), bi]; }
  else if (Math.abs(y1 - y2) === 2 && x1 !== x2) { rule = 'צורת Z: שתי המשבצות התלויות נגדיות'; const ym = (y1 + y2) / 2; for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) cells.push(at(x, ym)); cells.push(ai, bi); }
  else if (Math.abs(x1 - x2) === 2 && y1 !== y2) { rule = 'צורת Z: שתי המשבצות התלויות נגדיות'; const xm = (x1 + x2) / 2; for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) cells.push(at(xm, y)); cells.push(ai, bi); }
  cells = cells.filter(i => i >= 0);
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.min(330, (cv.parentElement.clientWidth || 320) - 20), H = Math.round(W * .82);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const ctx = cv.getContext('2d');
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const T0 = 1.3, FOLD = .85, SPIN = 1.6, END = T0 + maxD * FOLD + .5 + SPIN;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* a point of face i at fold time t: rotate about its own hinge, then about each ancestor's hinge */
  const ang = (i, t) => i === ai ? 0 : ease((t - T0 - (dep[i] - 1) * FOLD) / FOLD) * Math.PI / 2;
  const place = (i, p, t) => {
    let [x, y, z] = p;
    for (let f = i; f !== ai; f = par[f]) { const { n, h } = hinge[f], th = ang(f, t), s = (x - h[0]) * n[0] + (y - h[1]) * n[1], c = Math.cos(th), sn = Math.sin(th);
      const s2 = s * c + z * sn, z2 = -s * sn + z * c; x += n[0] * (s2 - s); y += n[1] * (s2 - s); z = z2; }
    return [x, y, z];
  };
  const xs = nc.map(c => c[0]), ys = nc.map(c => c[1]), flatC = [(Math.min(...xs) + Math.max(...xs) + 1) / 2, (Math.min(...ys) + Math.max(...ys) + 1) / 2, 0], cubeC = [x1 + .5, y1 + .5, -.5];
  const flatSpan = Math.max(Math.max(...xs) - Math.min(...xs) + 1, (Math.max(...ys) - Math.min(...ys) + 1) * 1.15);
  const view = (p, t) => {
    const fk = ease((t - T0) / (maxD * FOLD)), sk = ease((t - T0 - maxD * FOLD - .5) / SPIN);
    const c = flatC.map((v, i) => v + (cubeC[i] - v) * fk), yaw = (-.42 + sk * Math.PI) * (fk > 0 ? 1 : fk), pitch = .62 - fk * .12;
    let x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2];
    const cy = Math.cos(yaw), syw = Math.sin(yaw); [x, z] = [x * cy + z * syw, -x * syw + z * cy];
    const cp = Math.cos(pitch), sp = Math.sin(pitch); [y, z] = [y * cp - z * sp, y * sp + z * cp];
    const zoom = (W * .78 / flatSpan) * (1 - fk) + (W * .3) * fk, dist = 7, k = dist / (dist - z);
    return [W / 2 + x * zoom * k, H * .5 + y * zoom * k, z];
  };
  const shade = (hex, a) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * a))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  const draw = t => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const fk = ease((t - T0) / (maxD * FOLD));
    /* soft shadow under the cube */
    if (fk > 0) { const s = view([cubeC[0], cubeC[1] + .55, cubeC[2]], t); ctx.fillStyle = `rgba(0,0,0,${.28 * fk})`; ctx.beginPath(); ctx.ellipse(W / 2, Math.min(H - 12, s[1] + 26), W * .24, 10, 0, 0, 7); ctx.fill(); }
    const faces = nc.map(([cx, cy], i) => {
      const P = [[cx, cy, 0], [cx + 1, cy, 0], [cx + 1, cy + 1, 0], [cx, cy + 1, 0]].map(p => view(place(i, p, t), t));
      const area = (P[1][0] - P[0][0]) * (P[3][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[3][0] - P[0][0]);
      return { i, P, z: P.reduce((s, p) => s + p[2], 0) / 4, front: area > 0, lit: Math.min(1, Math.abs(area) / Math.pow(W * .3, 2)) };
    }).sort((a, b) => a.z - b.z);
    for (const f of faces) {
      const base = f.i === ai ? '#FFC845' : f.i === bi ? '#3DD6B8' : '#4C7FD0', light = .55 + .45 * f.lit;
      ctx.beginPath(); f.P.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      ctx.fillStyle = f.front ? shade(base, light) : shade(base, .32); ctx.fill();
      ctx.lineJoin = 'round'; ctx.lineWidth = 2.2; ctx.strokeStyle = f.front ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.35)'; ctx.stroke();
      if (f.front && f.lit > .08) {
        /* the symbol lies on the face: an affine map from the unit square to the face */
        const [p0, p1, , p3] = f.P; ctx.save();
        ctx.setTransform(dpr * (p1[0] - p0[0]), dpr * (p1[1] - p0[1]), dpr * (p3[0] - p0[0]), dpr * (p3[1] - p0[1]), dpr * p0[0], dpr * p0[1]);
        ctx.fillStyle = f.i === ai || f.i === bi ? '#1B1400' : '#fff'; ctx.font = '600 .56px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(sy[f.i], .5, .54); ctx.restore();
      }
    }
    /* the rule, shown on the flat net before it folds */
    if (rule && t < T0 + .2) {
      const a = Math.min(1, t / .5) * (t > T0 - .2 ? Math.max(0, (T0 + .2 - t) / .4) : 1);
      ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([5, 4]); ctx.lineWidth = 3; ctx.strokeStyle = '#FFE58A';
      for (const i of cells) { const [cx, cy] = nc[i], P = [[cx + .08, cy + .08, 0], [cx + .92, cy + .08, 0], [cx + .92, cy + .92, 0], [cx + .08, cy + .92, 0]].map(p => view(p, t)); ctx.beginPath(); P.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.stroke(); }
      ctx.setLineDash([]); ctx.fillStyle = '#FFE58A'; ctx.font = '800 14px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(rule, W / 2, 18); ctx.restore();
    }
    if (t >= END - .05) { ctx.fillStyle = '#fff'; ctx.font = '800 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`מול ${sy[ai]} נמצא ${sy[bi]}`, W / 2, 20); }
  };
  if (reduce) return draw(END);
  const t0 = performance.now();
  const tick = now => { if (!cv.isConnected) return; const t = (now - t0) / 1000; draw(Math.min(t, END)); if (t < END) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
/* rotation: the shape turns to the right answer; a mirror image only flips */
function rotAnimHTML(cs, ki) {
  const deg = ki * 90, turn = ki === 2 ? 'חצי סיבוב' : ki === 1 ? 'רבע סיבוב עם כיוון השעון' : 'רבע סיבוב נגד כיוון השעון';
  const body = `<span class="rot-row"><span class="rot-item"><span class="rot-spin" style="--deg:${deg}deg">${polySVG(cs)}</span><span class="rot-lbl">מסובבים: ${turn}</span></span><span class="rot-item"><span class="rot-flip">${polySVG(cs)}</span><span class="rot-lbl">מראה: הופכים. את זה אי אפשר לקבל בסיבוב</span></span></span>`;
  return animBox(body, '');
}
/* invented operation: every a turns into the first number, every b into the second, then the calculation */
function opMorphHTML(t, x, y, res) {
  const mf = (from, to, cls, dl) => `<span class="mf ${cls}" style="--dl:${dl}s"><span class="m1">${from}</span><span class="m2">${to}</span></span>`;
  const expr = [...t].map(ch => ch === 'a' ? mf('a', x, 'ma', .7) : ch === 'b' ? mf('b', y, 'mb', 1.6) : ch === ' ' ? ' ' : `<span class="mo">${ch}</span>`).join('');
  const body = `<span class="opm" dir="ltr">${mf('a', x, 'ma', .7)} <span class="mo">◆</span> ${mf('b', y, 'mb', 1.6)} <span class="mo">=</span> ${expr}${res != null ? ` <span class="mres">= <b>${res}</b></span>` : ''}</span>`;
  return animBox(body, `כל a הופך ל-${x} (המספר הראשון), כל b הופך ל-${y} (השני). רק אחר כך מחשבים.`);
}
/* two blanks: the connector word decides the direction between the two parts */
const S2_CONN = [[/למרות|אף ש|אף על פי|בכל זאת|אבל|אך|אלא/, 'ניגוד', '⇄', 'שני החלקים הפוכים זה לזה', 1], [/ולכן|לכן|ובגלל זה|כתוצאה/, 'סיבה ותוצאה', '←', 'מה שלפני המילה גורם למה שאחריה', 0], [/כי |בגלל|מכיוון|משום/, 'סיבה', '→', 'מה שאחרי המילה הוא הסיבה למה שלפניה', 0], [/ככל ש|וגם|גם /, 'יחד', '⇈', 'שני הדברים הולכים יחד', 1]];
function sentence2Viz(s, pair) {
  const [w1, w2] = String(pair).split('/').map(x => x.trim());
  const c = S2_CONN.find(([re]) => re.test(s)); if (!c) return '';
  const m = c[0].exec(s)[0];
  let k = 0; const filled = s.split('___').map((p, i, a) => i < a.length - 1 ? p + `<b class="s2w">${[w1, w2][k++] || ''}</b>` : p).join('').replace(m, `<mark class="s2c">${m}</mark>`);
  return `<span class="s2viz"><span class="s2s">${filled}</span>${c[4] ? `<span class="s2rel"><span class="s2box">${w1}</span><span class="s2arr">${c[2]}<i>${c[1]}</i></span><span class="s2box">${w2}</span></span>` : ''}<span class="s2why">"${m.trim()}" = ${c[1]}: ${c[3]}.</span></span>`;
}

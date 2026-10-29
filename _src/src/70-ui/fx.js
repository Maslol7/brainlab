/* ---------- visual rewards ----------
   burst(): confetti on the full-screen canvas, from the middle or from a point.
   celebrate(): what a correct answer looks like. Small and quick for a normal hit, bigger for a streak,
   a hard question or the champion question. A few variations so it does not get boring. */
const calmFx = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
let FX_RAF = 0, FX_P = [];
function burst(n, ox, oy, spread = 1) {
  if (calmFx()) return;
  const cv = document.getElementById('fx'); if (!cv) return;
  const dpr = window.devicePixelRatio || 1, x = cv.getContext('2d');
  if (cv.hidden || cv.width !== innerWidth * dpr) { cv.hidden = false; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = [EC.air, EC.water, EC.earth, EC.fire, '#FFC845', '#A98BFF'];
  const cx = ox ?? innerWidth / 2, cy = oy ?? innerHeight * .35;
  for (let i = 0; i < n; i++) FX_P.push({ x: cx, y: cy, vx: (R() - .5) * 13 * spread, vy: (-R() * 12 - 3) * spread, r: R() * 6 + 3, c: pick(cols), a: R() * 6, va: (R() - .5) * .3, star: R() < .25, t: 0 });
  if (FX_RAF) return;
  const f = () => {
    x.clearRect(0, 0, innerWidth, innerHeight);
    FX_P = FX_P.filter(p => ++p.t < 95 && p.y < innerHeight + 20);
    FX_P.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .35; p.a += p.va;
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.globalAlpha = Math.min(1, (95 - p.t) / 25);
      if (p.star) { x.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? p.r * .45 : p.r, an = k * Math.PI / 5; x.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } x.fill(); }
      else x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      x.restore();
    });
    if (FX_P.length) FX_RAF = requestAnimationFrame(f); else { FX_RAF = 0; x.clearRect(0, 0, innerWidth, innerHeight); cv.hidden = true; }
  };
  FX_RAF = requestAnimationFrame(f);
}
const CHEER = { hit: ['יש!', 'בול!', 'נכון!', 'פגיעה!', 'גאוני!'], fix: ['תיקנת!', 'זה הרעיון!'], combo: ['רצף!', 'על האש!', 'בלתי עציר!'], hard: ['שאלה קשה!', 'רמת מחוננים!'], champ: ['אלוף!'] };
const STICKERS = () => [IC.star, IC.bolt, IC.flame].filter(Boolean);
/* el: the answered option (or the typed result). o: { combo, hard, second, champ } */
function celebrate(el, o = {}) {
  if (!el) return;
  const kind = o.champ ? 'champ' : o.second ? 'fix' : o.combo && o.combo % 3 === 0 ? 'combo' : o.hard ? 'hard' : 'hit';
  const big = kind === 'champ' || kind === 'combo' || kind === 'hard';
  el.classList.remove('yay'); void el.offsetWidth; el.classList.add('yay', 'yay-' + pick(['a', 'b', 'c']));
  if (calmFx()) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  /* a ring that spreads out from the answer */
  const ring = document.createElement('div'); ring.className = 'yay-ring' + (big ? ' big' : '');
  Object.assign(ring.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  document.body.appendChild(ring); setTimeout(() => ring.remove(), 900);
  /* a sticker with a short cheer that pops up and floats away */
  const st = document.createElement('div'); st.className = 'yay-sticker k-' + kind;
  st.innerHTML = `<span class="ys-ic">${pick(STICKERS())}</span><b>${pick(CHEER[kind])}</b>`;
  st.style.left = Math.min(innerWidth - 120, Math.max(8, cx - 55)) + 'px'; st.style.top = Math.max(8, r.top - 46) + 'px';
  document.body.appendChild(st); setTimeout(() => st.remove(), 1300);
  burst(big ? 46 : o.second ? 8 : 16, cx, cy, big ? 1 : .55);
  if (navigator.vibrate && big) try { navigator.vibrate(25); } catch (e) { }
}

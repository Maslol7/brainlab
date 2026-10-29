/* ---------- journey map art ----------
   worldScene(): quiet silhouettes behind the path of each world (clouds, waves, hills, flames, stars), in the world colour.
   drawTrails(): after the map renders, a curved trail joins the mission nodes; the part already walked is solid. */
const SCENE = {
  air: '<path d="M20 70c0-10 9-17 19-15 3-9 16-12 22-4 9-3 18 4 17 13 7 1 11 6 11 12H20z"/><path d="M250 190c0-8 7-13 15-12 3-7 13-9 18-3 7-2 14 3 13 10 6 1 9 5 9 10h-55z"/><path d="M40 330c0-7 6-12 13-10 2-6 11-8 15-3 6-2 12 3 11 9 5 1 8 4 8 9H40z"/><path d="M230 450c0-9 8-15 17-13 3-8 14-10 20-4 8-2 16 4 15 12 6 1 10 5 10 11h-62z"/>',
  water: '<path d="M0 80q20-12 40 0t40 0 40 0" fill="none" stroke-width="5"/><path d="M200 210q20-12 40 0t40 0 40 0" fill="none" stroke-width="5"/><path d="M10 360q20-12 40 0t40 0 40 0" fill="none" stroke-width="5"/><path d="M190 480q20-12 40 0t40 0 40 0" fill="none" stroke-width="5"/><circle cx="270" cy="110" r="6"/><circle cx="285" cy="95" r="4"/><circle cx="40" cy="250" r="5"/>',
  earth: '<path d="M0 140q40-60 90 0z"/><path d="M230 300q50-70 110 0z"/><path d="M-10 470q45-55 100 0z"/><path d="M262 120v-30M262 92l-14 14M262 98l12 10" fill="none" stroke-width="5" stroke-linecap="round"/><path d="M58 280v-26M58 258l-11 10M58 262l10 8" fill="none" stroke-width="4" stroke-linecap="round"/>',
  fire: '<path d="M40 120c-14-12-8-30 4-40 0 10 8 12 10 4 8 10 10 26-4 36z"/><path d="M272 250c-16-14-9-34 5-46 0 12 9 14 11 5 9 12 11 30-5 41z"/><path d="M60 420c-12-10-7-26 4-34 0 9 7 10 9 3 7 9 8 22-4 31z"/><circle cx="250" cy="90" r="3"/><circle cx="90" cy="230" r="2.5"/><circle cx="230" cy="380" r="3"/>',
  master: '<path d="M50 80l5 12 13 1-10 8 4 13-12-7-11 7 4-13-10-8 13-1z"/><path d="M262 220l4 9 10 1-8 6 3 10-9-5-9 5 3-10-8-6 10-1z"/><path d="M70 400l4 9 10 1-8 6 3 10-9-5-9 5 3-10-8-6 10-1z"/><circle cx="230" cy="90" r="3"/><circle cx="40" cy="260" r="2.5"/><circle cx="280" cy="420" r="3"/>',
};
function worldScene(k, where) { return `<svg class="scene${where ? ' ' + where : ''}" viewBox="0 0 320 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${SCENE[k] || SCENE.master}</svg>`; }
function drawTrails() {
  app.querySelectorAll('.path').forEach(path => {
    path.querySelector('svg.trail')?.remove();
    const box = path.getBoundingClientRect(), nodes = [...path.querySelectorAll('.node')];
    if (nodes.length < 2 || !box.width) return;
    const pts = nodes.map(n => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top]; });
    const seg = (a, b) => { const my = (a[1] + b[1]) / 2; return `C${a[0].toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`; };
    const d = pts.map((p, i) => i ? seg(pts[i - 1], p) : `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    let last = -1; nodes.forEach((n, i) => { if (n.classList.contains('done') || n.classList.contains('open')) last = i; });
    const dDone = last > 0 ? pts.slice(0, last + 1).map((p, i) => i ? seg(pts[i - 1], p) : `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') : '';
    path.insertAdjacentHTML('afterbegin', `<svg class="trail" width="${box.width}" height="${box.height}" aria-hidden="true"><path class="tr-all" d="${d}"/>${dDone ? `<path class="tr-done" d="${dDone}"/>` : ''}</svg>`);
  });
}

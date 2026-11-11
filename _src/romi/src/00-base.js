/* ---------- סלטה: Romi's English words app. Base: page, small helpers, toast and modal ---------- */
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'he');
const APP_VER = '__VER__';
const APP_URL = 'https://maslol7.github.io/brainlab/romi/';
const app = document.getElementById('app');
const NAME = 'רומי';
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
function dateHe(s) { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); const dt = new Date(y, m - 1, d); return `יום ${DAYS[dt.getDay()]} ${d}.${m}`; }
const EN = s => `<span class="en" dir="ltr">${esc(s)}</span>`;
const plural = (n, one, many) => n === 1 ? one : `${n} ${many}`;
let timers = [];
const later = (fn, ms) => { const h = setTimeout(fn, ms); timers.push(h); return h; };
function clearTimers() { timers.forEach(h => { clearTimeout(h); clearInterval(h); }); timers = []; if (typeof RAF !== 'undefined' && RAF) { cancelAnimationFrame(RAF); RAF = 0; } }
function toast(msg, ms = 2600) { let t = document.getElementById('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); } t.innerHTML = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms); }
/* modal(title, html, buttons): buttons = [[label, fn, cls]]; a click outside closes it */
function modal(title, html, buttons = [['סגור']]) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card sheet" role="dialog" aria-modal="true">${title ? `<h3>${title}</h3>` : ''}<div class="mbody">${html}</div><div class="mbtns">${buttons.map(([l, , c], i) => `<button class="btn ${c || (i === 0 ? 'btn-main' : 'btn-ghost')}" data-mi="${i}">${l}</button>`).join('')}</div></div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { const b = e.target.closest('[data-mi]'); if (e.target !== m && !b) return; m.remove(); if (b) { const fn = buttons[+b.dataset.mi][1]; if (fn) fn(); } });
  return m;
}
const on = (sel, fn, root = app) => { root.querySelectorAll(sel).forEach(e => e.onclick = ev => fn(e, ev)); };

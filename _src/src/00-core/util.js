const R = Math.random;
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const pick = a => a[Math.floor(R() * a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function mc(opts) { const idx = shuffle(opts.map((_, i) => i)); return { options: idx.map(i => opts[i]), answer: idx.indexOf(0) }; }
const fmt = x => Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100);
const L = s => `<span class="ltr" dir="ltr">${s}</span>`;
/* ---------- state ---------- */
function todayStr(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function dayDiff(a, b) { const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5); }
function addDays(s, n) { const [y, m, d] = s.split('-').map(Number); return todayStr(new Date(y, m - 1, d + n)); }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const weekKey = () => Math.floor(dayDiff(S.start, todayStr()) / 7);
const arr = x => Array.isArray(x) ? x.filter(v => v != null) : x && typeof x === 'object' ? Object.values(x) : [];

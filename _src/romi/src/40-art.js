/* ---------- art: Romi the gymnast (an original drawing: blonde ponytail, blue eyes, a leotard she picks), candies, elements ---------- */
const LEOS = {
  violet: { t: 'סגול', c: ['#9B5DE5', '#F15BB5'], price: 0 }, pink: { t: 'ורוד', c: ['#FF5FA2', '#FFC2DD'], price: 25 }, mint: { t: 'מנטה', c: ['#14B8A6', '#A7F3D0'], price: 25 },
  sky: { t: 'שמיים', c: ['#3A86FF', '#A5D8FF'], price: 40 }, gold: { t: 'זהב', c: ['#F59E0B', '#FDE68A'], price: 40 }, galaxy: { t: 'גלקסיה', c: ['#3C096C', '#C77DFF'], price: 60 },
  rainbow: { t: 'קשת', c: ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93'], price: 90 },
  bday: { t: 'יום הולדת', c: ['#FFC229', '#FF3D8B', '#7B61FF', '#FFC229'], price: 0, gift: 1 },
};
const RIBS = { pink: { t: 'ורוד', c: '#FF5FA2', price: 0 }, red: { t: 'אדום', c: '#E63946', price: 15 }, blue: { t: 'כחול', c: '#3A86FF', price: 15 }, mint: { t: 'מנטה', c: '#2EC4B6', price: 15 }, gold: { t: 'זהב', c: '#FFC845', price: 20 }, white: { t: 'לבן', c: '#FFFFFF', price: 20 } };
let ARTN = 0;
const SKIN = '#FFD9C4', HAIR = '#F4CF5D', HAIR2 = '#D9A93A';
function romiSVG(o = {}) {
  const n = ++ARTN, L = LEOS[o.leo || S.leo] || LEOS.violet, rib = (RIBS[o.rib || S.rib] || RIBS.pink).c;
  const stops = L.c.map((c, i) => `<stop offset="${Math.round(i / (L.c.length - 1) * 100)}%" stop-color="${c}"/>`).join('');
  const head = `<path d="M70 21 C93 12 106 31 99 53 C96 63 89 71 84 77 C88 62 88 47 76 37 Z" fill="${HAIR}" stroke="${HAIR2}" stroke-width="1.5"/>
  <circle cx="60" cy="40" r="21" fill="${SKIN}"/>
  <path d="M38.5 43 C35 21 51 13 62 14 C77 15 86 26 82.5 43 C79 33 71 27 61 29 C55 30 49 32 46 37 C44 34 41 38 38.5 43 Z" fill="${HAIR}" stroke="${HAIR2}" stroke-width="1.2"/>
  <path d="M71 19 l-8 -8 l0 13 z M75 19 l10 -7 l-2 13 z" fill="${rib}" stroke="rgba(0,0,0,.15)" stroke-width=".8"/><circle cx="73" cy="19" r="3.2" fill="${rib}" stroke="rgba(0,0,0,.15)" stroke-width=".8"/>
  <ellipse cx="52" cy="43" rx="4.3" ry="5.2" fill="#fff"/><circle cx="52.3" cy="44" r="3.3" fill="#3B82F6"/><circle cx="52.3" cy="44.3" r="1.5" fill="#1E293B"/><circle cx="53.4" cy="42.6" r="1" fill="#fff"/>
  <ellipse cx="68" cy="43" rx="4.3" ry="5.2" fill="#fff"/><circle cx="67.7" cy="44" r="3.3" fill="#3B82F6"/><circle cx="67.7" cy="44.3" r="1.5" fill="#1E293B"/><circle cx="68.8" cy="42.6" r="1" fill="#fff"/>
  <path d="M47.5 37.5 l3 -1.6 M72.5 37.5 l-3 -1.6" stroke="${HAIR2}" stroke-width="1.4" stroke-linecap="round"/>
  <ellipse cx="46.5" cy="51" rx="3.6" ry="2.1" fill="#FF9EB5" opacity=".75"/><ellipse cx="73.5" cy="51" rx="3.6" ry="2.1" fill="#FF9EB5" opacity=".75"/>
  <path d="M54 53 Q60 59 66 53" stroke="#C2185B" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (o.head) return `<svg class="romi head" viewBox="30 6 72 64" aria-hidden="true">${head}</svg>`;
  return `<svg class="romi" viewBox="0 0 120 200" aria-hidden="true"><defs><linearGradient id="lg${n}" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient></defs>
  <path d="M47 76 L27 30 M73 76 L93 30" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/><circle cx="26" cy="27" r="6" fill="${SKIN}"/><circle cx="94" cy="27" r="6" fill="${SKIN}"/>
  <path d="M53 126 L49 181 M67 126 L71 181" stroke="${SKIN}" stroke-width="11" stroke-linecap="round"/><ellipse cx="46" cy="186" rx="8" ry="4.5" fill="${SKIN}"/><ellipse cx="74" cy="186" rx="8" ry="4.5" fill="${SKIN}"/>
  <rect x="55" y="56" width="10" height="12" rx="3" fill="${SKIN}"/>
  <path d="M43 71 Q60 64 77 71 L75 104 Q73 120 68 131 L60 123 L52 131 Q47 120 45 104 Z" fill="url(#lg${n})"/>
  <circle cx="46" cy="75" r="6.5" fill="url(#lg${n})"/><circle cx="74" cy="75" r="6.5" fill="url(#lg${n})"/>
  <path d="M55 86 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4z M67 100 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1z" fill="#fff" opacity=".9"/>
  ${head}</svg>`;
}
function candySVG(c = '#FF5FA2', s = 22) {
  return `<svg class="candy" width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><path d="M9 20 L1 12 L3 28 Z M31 20 L39 12 L37 28 Z" fill="${c}" opacity=".8"/><ellipse cx="20" cy="20" rx="12" ry="10" fill="${c}"/><path d="M12 15 Q20 22 28 15 M12 24 Q20 30 28 24" stroke="#fff" stroke-width="2.4" fill="none" opacity=".75"/><ellipse cx="15" cy="16" rx="3" ry="2" fill="#fff" opacity=".6"/></svg>`;
}
const CANDY = (s = 20) => candySVG('#FF5FA2', s);
const ELEMS = {
  air: { t: 'אוויר', c: '#7FE3D6', p: '<path d="M8 15 h16 a5 5 0 1 0 -5 -5 M6 22 h22 a5 5 0 1 1 -5 5 M10 29 h8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' },
  water: { t: 'מים', c: '#53A8FF', p: '<path d="M20 6 C14 15 10 20 10 25 a10 10 0 0 0 20 0 C30 20 26 15 20 6 Z" fill="#fff"/>' },
  earth: { t: 'אדמה', c: '#8BC34A', p: '<path d="M5 31 L15 14 L21 23 L26 17 L35 31 Z" fill="#fff"/>' },
  fire: { t: 'אש', c: '#FF7A3D', p: '<path d="M20 5 C23 13 30 15 30 25 a10 10 0 0 1 -20 0 C10 19 14 16 15 11 C17 15 19 16 20 5 Z" fill="#fff"/>' },
};
const elemSVG = (k, s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true">${ELEMS[k].p}</svg>`;
const IC = {
  sound: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  slow: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 16c0-4 3-7 7-7s7 3 7 7z" fill="currentColor"/><circle cx="19" cy="13" r="2.5" fill="currentColor"/><path d="M5 16v2M15 16v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  flame: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2c1.5 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-4.5 2.5-6.5C9.5 9.5 11 10 12 2z" fill="#FF8A3D"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="#FFC845"/></svg>',
  bs: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9l6 6M18 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};
/* pictograms for the games and actions: line drawings in the current color */
const pic = (d, s = 30) => `<svg class="pic" viewBox="0 0 32 32" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const GIC = {
  tramp: pic('<ellipse cx="16" cy="25" rx="11" ry="3"/><path d="M7 26.5l-1.5 3.5M25 26.5l1.5 3.5"/><circle cx="16" cy="6" r="2.4"/><path d="M16 8.5v7M12 11l4-2 4 2M13.5 20l2.5-4.5 2.5 4.5"/>'),
  memory: pic('<rect x="4" y="7" width="12" height="17" rx="2.5" transform="rotate(-8 10 15)"/><rect x="16" y="7" width="12" height="17" rx="2.5" transform="rotate(8 22 15)"/><path d="M20.5 13.5l2 2 3-3.5"/>'),
  rain: pic('<path d="M16 4c-3.5 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2.5-6-6-11z"/><path d="M6 24c2 2 4 2 6 0M20 24c2 2 4 2 6 0M13 28c2 1.5 4 1.5 6 0"/>'),
  teach: pic('<rect x="4" y="5" width="24" height="16" rx="2"/><path d="M10 26l3-5M22 26l-3-5M9 15l2.5-6 2.5 6M10 13h3M19 11.5a2 2 0 1 0 0 3.5M21 9v6"/>'),
  duel: pic('<circle cx="10" cy="9" r="3"/><circle cx="22" cy="9" r="3"/><path d="M4 26c0-5 3-8 6-8s6 3 6 8M16 26c0-5 3-8 6-8s6 3 6 8"/>'),
  speak: pic('<rect x="12" y="4" width="8" height="14" rx="4"/><path d="M8 15a8 8 0 0 0 16 0M16 23v5M12 28h8"/>'),
  paper: pic('<path d="M8 4h12l5 5v19H8z"/><path d="M20 4v5h5M12 15h9M12 19h9M12 23h5"/>'),
  loop: pic('<path d="M25 12a10 10 0 0 0-17-3L6 11M7 20a10 10 0 0 0 17 3l2-2"/><path d="M6 5v6h6M26 27v-6h-6"/>'),
  heart: pic('<path d="M16 27S5 20 5 12a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 27 12c0 8-11 15-11 15z"/>'),
  cake: pic('<path d="M5 27h22M7 27V17h18v10M7 21c3 2 6-2 9 0s6-2 9 0M11 17v-4M16 17v-4M21 17v-4"/><path d="M11 9.5c0-1 1-2 0-3M16 9.5c0-1 1-2 0-3M21 9.5c0-1 1-2 0-3"/>'),
  list: pic('<path d="M11 8h15M11 16h15M11 24h15"/><circle cx="6" cy="8" r="1.4"/><circle cx="6" cy="16" r="1.4"/><circle cx="6" cy="24" r="1.4"/>'),
  shop: pic('<path d="M6 11h20l-2 15H8z"/><path d="M11 11V9a5 5 0 0 1 10 0v2"/>'),
  lock: pic('<rect x="7" y="14" width="18" height="13" rx="3"/><path d="M11 14v-3a5 5 0 0 1 10 0v3"/>'),
  mic: pic('<rect x="12" y="4" width="8" height="14" rx="4"/><path d="M8 15a8 8 0 0 0 16 0M16 23v5"/>'),
  play: pic('<path d="M10 6l16 10-16 10z" fill="currentColor"/>'),
  rec: pic('<circle cx="16" cy="16" r="8" fill="currentColor"/>'),
};

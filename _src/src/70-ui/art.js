/* ---------- art ---------- */
function elemPaths(k) {
  if (k === 'water') return '<path d="M12 2.5c3.8 4.8 6.5 8 6.5 11.6a6.5 6.5 0 0 1-13 0C5.5 10.5 8.2 7.3 12 2.5z" fill="currentColor"/><path d="M8.5 14.5c.3 1.8 1.6 3 3.3 3.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>';
  if (k === 'earth') return '<path d="M1.5 20.5 8.5 7.5l4 6.5 3-4.5 7 11z" fill="currentColor"/><path d="M8.5 7.5l1.8 3.4-1.6-.6-1.4 1.6" fill="#fff" opacity=".55"/>';
  if (k === 'fire') return '<path d="M12 1.8c1.2 4 6.5 6.4 6.5 12.4a6.5 6.5 0 0 1-13 0c0-3.2 2-5.4 3.3-6.5 0 2.2 1 3.8 2.6 3.8C10 8 12.2 5 12 1.8z" fill="currentColor"/><path d="M12 13.5c1.6 1.3 2.6 2.6 2.6 4.1a2.6 2.6 0 0 1-5.2 0c0-1.5 1-2.8 2.6-4.1z" fill="#fff" opacity=".6"/>';
  if (k === 'master') return '<path d="M12 2l2.6 6.4L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.6z" fill="currentColor"/><circle cx="12" cy="11.5" r="2.2" fill="#fff" opacity=".7"/>';
  return '<path d="M3 8.5h10.5a3 3 0 1 0-3-3M3 15.5h14.5a3 3 0 1 1-3 3M3 12h7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>';
}
const elemIcon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${elemPaths(k)}</svg>`;
function avatarSVG(o = {}) {
  const g = o.gear || gearOn(), el = o.el || curWorld().k, ec = EC[el] || EC.air;
  const sk = '#F6D5BF', sk2 = '#E5B293', hr = '#5B3A22', hr2 = '#82593A', sh = '#D7263D', sh2 = '#A51B2F';
  let s = `<svg viewBox="0 0 120 120" aria-hidden="true">`;
  if (g.phones) s += `<path d="M29 58 C29 18 91 18 91 58" stroke="#1E2238" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M13 124 C15 100 28 91 44 88 L60 96 L76 88 C92 91 105 100 107 124Z" fill="${sh}"/>`;
  s += `<path d="M13 124 C15 104 23 96 33 92 C30 104 30 114 32 124Z" fill="${sh2}"/><path d="M107 124 C105 104 97 96 87 92 C90 104 90 114 88 124Z" fill="${sh2}" opacity=".6"/>`;
  s += `<path d="M46 89 L60 100 L74 89" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<circle cx="76" cy="108" r="8" fill="${ec}"/><g transform="translate(70.2 102.2) scale(.48)" style="color:#0A0F24">${elemPaths(el)}</g>`;
  s += `<path d="M52 74 h16 v14 l-8 8 l-8 -8z" fill="${sk2}"/>`;
  s += `<circle cx="35.5" cy="57" r="5.6" fill="${sk}"/><circle cx="84.5" cy="57" r="5.6" fill="${sk}"/><circle cx="35.5" cy="57" r="2.4" fill="${sk2}"/><circle cx="84.5" cy="57" r="2.4" fill="${sk2}"/>`;
  s += `<ellipse cx="60" cy="55" rx="24.5" ry="26.5" fill="${sk}"/>`;
  s += `<path d="M33.5 56 C26 29 42 15 62 16.5 C84 17.5 94 33 86.5 57 C84.5 47 80 41 75 37.5 C72.5 45 64 48 54.5 46 C48.5 45 45.5 41 44 37.5 C39.5 42.5 36 49 33.5 56Z" fill="${hr}"/>`;
  s += `<path d="M50 20 l2 -9 l5.5 7.5 l4 -9 l3.5 9.5 l5.5 -5.5 l0 8.5" fill="${hr}"/><path d="M46 28 C54 22 68 22 77 29" stroke="${hr2}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M40 44 C42 38 46 35 50 34" stroke="${hr2}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += `<path d="M45.5 49.5 q5.5 -3.4 11 -.5 M63.5 49 q5.5 -2.9 11 .5" stroke="${hr}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="51" cy="58" r="3" fill="#1A1B22"/><circle cx="69" cy="58" r="3" fill="#1A1B22"/><circle cx="52.1" cy="56.9" r="1" fill="#fff"/><circle cx="70.1" cy="56.9" r="1" fill="#fff"/>`;
  s += `<circle cx="44" cy="67" r="3.6" fill="#F08A8A" opacity=".35"/><circle cx="76" cy="67" r="3.6" fill="#F08A8A" opacity=".35"/>`;
  s += `<path d="M58.5 63 q1.5 2 3 0" stroke="${sk2}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M52.5 69 q7.5 5.5 15 -1.5" stroke="#8A3F2E" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<g fill="rgba(255,255,255,.14)" stroke="#20222B" stroke-width="2.3"><circle cx="51" cy="58" r="7.5"/><circle cx="69" cy="58" r="7.5"/></g><path d="M58.5 58 h3 M43.5 57 l-6.5 -2 M76.5 57 l6.5 -2" stroke="#20222B" stroke-width="2.3" stroke-linecap="round"/><path d="M46.2 54.3 l2.6 -1.8 M64.2 54.3 l2.6 -1.8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>`;
  if (g.band) s += `<path d="M36 41 C48 35 72 35 84 41 L84 47 C72 41 48 41 36 47Z" fill="#fff"/><path d="M36 43.5 C48 37.5 72 37.5 84 43.5" stroke="${sh}" stroke-width="2"/>`;
  if (g.phones) s += `<rect x="24" y="47" width="12" height="20" rx="6" fill="${ec}" stroke="#1E2238" stroke-width="2"/><rect x="84" y="47" width="12" height="20" rx="6" fill="${ec}" stroke="#1E2238" stroke-width="2"/>`;
  if (g.crown) s += `<path d="M40 25 L44 7 L52 19 L60 3 L68 19 L76 7 L80 25Z" fill="#FFC845" stroke="#B88A12" stroke-width="1.6" stroke-linejoin="round"/>${['air', 'water', 'earth', 'fire'].map((k, i) => `<circle cx="${47 + i * 8.7}" cy="20" r="2.6" fill="${EC[k]}"/>`).join('')}`;
  if (g.medal) s += `<path d="M51 89 L58 104 M69 89 L62 104" stroke="#53A8FF" stroke-width="4.5"/><circle cx="60" cy="108" r="7" fill="#FFC845" stroke="#B88A12" stroke-width="1.5"/><path d="m60 104.5 1.1 2.2 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z" fill="#B88A12"/>`;
  if (g.gloves) s += `<g stroke="#5E0A16" stroke-width="1.6"><rect x="16" y="94" width="21" height="22" rx="9.5" fill="#D7263D"/><rect x="83" y="94" width="21" height="22" rx="9.5" fill="#D7263D"/></g><g fill="#fff"><rect x="18" y="110" width="17" height="5" rx="2"/><rect x="85" y="110" width="17" height="5" rx="2"/></g>`;
  s += '</svg>';
  if (PROF.id === 'romi' && !S.guest) s = romiLook(s);
  if (S.guest && !S.accOn) return s;
  const on = S.accOn || {};
  const add = ['star', 'scarf', 'shades', 'cap', 'ball'].filter(k => on[k] && !(k === 'ball' && g.gloves) && !(k === 'cap' && (g.crown || g.phones))).map(k => ACC_SVG[k]).join('');
  return add ? s.replace(/<\/svg>$/, add + '</svg>') : s;
}
function bossSVG(b) {
  const c = b.el === 'all' ? '#7B5CFF' : EC[b.el], dark = 'rgba(0,0,0,.18)';
  let s = `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><radialGradient id="bg${b.el}${b.v}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="113" rx="32" ry="5" fill="#000" opacity=".3"/>`;
  let body;
  if (b.el === 'air') body = `<g fill="${c}"><circle cx="38" cy="66" r="22"/><circle cx="60" cy="52" r="28"/><circle cx="84" cy="66" r="22"/><rect x="26" y="66" width="70" height="38" rx="19"/></g>`;
  else if (b.el === 'water') body = `<path d="M60 10 C76 34 98 50 98 74 A38 36 0 0 1 22 74 C22 50 44 34 60 10Z" fill="${c}"/>`;
  else if (b.el === 'earth') body = `<path d="M30 40 L52 24 L80 28 L100 52 L96 92 L70 106 L38 104 L20 82 L22 56Z" fill="${c}"/><path d="M52 24 L58 44 L40 58 M80 28 L74 46 L96 60 M38 104 L46 86" stroke="${dark}" stroke-width="3" fill="none"/>`;
  else if (b.el === 'fire') body = `<path d="M60 6 C66 26 88 34 92 62 C96 88 80 106 60 106 C40 106 24 88 28 62 C30 48 38 40 44 32 C46 44 52 50 56 50 C52 34 56 18 60 6Z" fill="${c}"/><path d="M60 52 C70 62 76 72 76 84 A16 16 0 0 1 44 84 C44 72 50 62 60 52Z" fill="#FFC845" opacity=".55"/>`;
  else body = `<circle cx="60" cy="64" r="42" fill="#2A1F5C" stroke="${c}" stroke-width="4"/>${['air', 'water', 'earth', 'fire'].map((k, i) => `<circle cx="${30 + i * 20}" cy="${i === 1 || i === 2 ? 26 : 32}" r="7" fill="${EC[k]}" stroke="#1a1240" stroke-width="2"/>`).join('')}`;
  s += body + `<rect x="0" y="0" width="120" height="120" fill="url(#bg${b.el}${b.v})" style="mix-blend-mode:soft-light"/>`;
  if (b.v === 1 && b.el !== 'all') s += `<path d="M36 34 L28 12 L46 28Z M84 34 L92 12 L74 28Z" fill="#F2E3B3" stroke="#0A0F24" stroke-width="1.5"/>`;
  const ex = b.el === 'earth' || b.v === 2 ? [44, 76] : b.v === 1 ? [42, 60, 78] : [46, 74];
  const er = ex.length === 3 ? 7.5 : 10;
  ex.forEach(x => { s += `<circle cx="${x}" cy="64" r="${er}" fill="#fff"/><circle cx="${x + 2}" cy="66" r="${er * .48}" fill="#0A0F24"/>`; });
  s += `<path d="M${ex[0] - 10} 50 L${ex[0] + 8} 56 M${ex[ex.length - 1] + 10} 50 L${ex[ex.length - 1] - 8} 56" stroke="#0A0F24" stroke-width="4.5" stroke-linecap="round"/>`;
  s += `<path d="M44 86 Q60 78 76 86 L76 91 Q60 85 44 91Z" fill="#0A0F24"/><path d="M50 85 l3 6 l3 -7 M64 84 l3 7 l3 -6" fill="#fff"/>`;
  return s + '</svg>';
}
const chestSVG = open => `<svg viewBox="0 0 80 80" aria-hidden="true">${open ? `<g fill="#FFC845" stroke="#B88A12"><circle cx="30" cy="22" r="7"/><circle cx="44" cy="15" r="7"/><circle cx="53" cy="27" r="6"/></g><circle cx="40" cy="30" r="26" fill="#FFC845" opacity=".18"/>` : ''}<rect x="10" y="36" width="60" height="34" rx="6" fill="#B5652B"/><rect x="10" y="36" width="60" height="8" fill="#8A4A1C"/>${open ? `<path d="M10 36 L18 18 L70 18 L70 36Z" fill="#C97A3A"/>` : `<path d="M10 38 C10 22 70 22 70 38Z" fill="#C97A3A"/>`}<rect x="34" y="40" width="12" height="14" rx="2" fill="#FFC845"/><rect x="10" y="52" width="60" height="5" fill="#FFC845" opacity=".7"/></svg>`;
const giftSVG = `<svg viewBox="0 0 30 30" class="gift" aria-hidden="true"><rect x="4" y="12" width="22" height="15" rx="3" fill="#E8364F"/><rect x="2" y="8" width="26" height="6" rx="2" fill="#FF6B81"/><rect x="13" y="8" width="4" height="19" fill="#FFC845"/><path d="M15 8c-3-6-9-4-6 0M15 8c3-6 9-4 6 0" stroke="#FFC845" stroke-width="2.4" fill="none"/></svg>`;
function medal(on, i) {
  const hues = [EC.air, EC.water, EC.earth, EC.fire, '#FFC845', '#A98BFF'];
  const c = on ? hues[i % 6] : 'rgba(255,255,255,.15)';
  return `<svg viewBox="0 0 48 48"><path d="M24 3 42 13v22L24 45 6 35V13z" fill="${c}"/><path d="M24 9 37 16.5v15L24 39 11 31.5v-15z" fill="none" stroke="#0A0F24" stroke-width="1.6" opacity=".35"/><path d="m24 14 3 6.2 6.8.9-5 4.7 1.3 6.7L24 29.3l-6.1 3.2 1.3-6.7-5-4.7 6.8-.9z" fill="#0A0F24" opacity=".75"/></svg>`;
}
const ACC = [['star', 'סיכת כוכב', 60], ['ball', 'כדורסל ביד', 100], ['cap', 'כובע מצחייה', 120], ['scarf', 'צעיף אדום-לבן', 150], ['shades', 'משקפי שמש', 180]];
const ACC_SVG = {
  star: '<path d="m44 104 2 4.2 4.6.6-3.4 3.2.9 4.6-4.1-2.2-4.1 2.2.9-4.6-3.4-3.2 4.6-.6z" fill="#FFC845" stroke="#B88A12" stroke-width=".8"/>',
  ball: '<g transform="translate(12 95)"><circle cx="11" cy="11" r="11" fill="#E8742A" stroke="#7A3510" stroke-width="1.4"/><path d="M0 11 h22 M11 0 v22 M3.5 3.5 q7 7.5 0 15 M18.5 3.5 q-7 7.5 0 15" stroke="#7A3510" stroke-width="1.2" fill="none"/></g>',
  cap: '<path d="M35 36 C36 16 84 16 85 36 C70 31 50 31 35 36Z" fill="#1E5BD8" stroke="#123A8C" stroke-width="1.2"/><path d="M35 36 C28 37 22 40 20 43 C28 42 34 40 40 38Z" fill="#123A8C"/><circle cx="60" cy="18.5" r="2.4" fill="#fff"/>',
  scarf: '<path d="M42 86 C52 94 68 94 78 86 L80 93 C68 101 52 101 40 93Z" fill="#D7263D"/><path d="M47 90 l3 6 M55 92 l2 7 M65 92 l-2 7 M73 90 l-3 6" stroke="#fff" stroke-width="2.4"/><path d="M67 94 l6 21 l-8 1 l-3 -20z" fill="#D7263D"/><path d="M66 103 l7 -1 M67 109 l7 -1" stroke="#fff" stroke-width="2"/>',
  shades: '<g><rect x="42" y="52" width="17" height="11" rx="4" fill="#111827" opacity=".93"/><rect x="61" y="52" width="17" height="11" rx="4" fill="#111827" opacity=".93"/><path d="M59 56 h2 M42 56 l-5 -2 M78 56 l5 -2" stroke="#111827" stroke-width="2.4" stroke-linecap="round"/><path d="M45 54.5 h5" stroke="#fff" stroke-width="1.3" opacity=".55"/></g>',
};
function avatarPreview(k) { const keep = S.accOn; S.accOn = { [k]: 1 }; const s = avatarSVG(); S.accOn = keep; return s; }
/* Romi: long blonde hair, blue eyes, a bow, no glasses */
function romiLook(s) {
  s = s.split('#5B3A22').join('#D9A93E').split('#82593A').join('#F4D88A');
  s = s.replace(/<path d="M50 20 l2 -9[^>]*>/, '');
  s = s.replace(/<g fill="rgba\(255,255,255,\.14\)" stroke="#20222B"[\s\S]*?<\/g><path d="M58\.5 58 h3[^>]*>/, '');
  const eye = (x) => `<circle cx="${x}" cy="58" r="3.6" fill="#3B82E0"/><circle cx="${x}" cy="58" r="1.7" fill="#14213D"/><circle cx="${x + 1.2}" cy="56.8" r="1" fill="#fff"/>`;
  s = s.replace('<circle cx="51" cy="58" r="3" fill="#1A1B22"/><circle cx="69" cy="58" r="3" fill="#1A1B22"/><circle cx="52.1" cy="56.9" r="1" fill="#fff"/><circle cx="70.1" cy="56.9" r="1" fill="#fff"/>', eye(51) + eye(69) + '<path d="M46 53.5 l-2 -1.6 M74 53.5 l2 -1.6" stroke="#8A6A2A" stroke-width="1.3" stroke-linecap="round"/>');
  const back = `<path d="M30 58 C25 30 41 14 60 14 C80 14 95 30 90 58 C93 76 93 92 87 100 C83 92 80 86 78 80 L42 80 C40 86 37 92 33 100 C27 92 27 76 30 58Z" fill="#D9A93E"/><path d="M33 70 C31 82 32 92 35 98 M87 70 C89 82 88 92 85 98" stroke="#F4D88A" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s = s.replace('<path d="M52 74 h16', back + '<path d="M52 74 h16');
  return s.replace('</svg>', '<g transform="translate(78 30) rotate(20)"><path d="M0 0 l-7 -5 v10z M0 0 l7 -5 v10z" fill="#FF7AA8"/><circle r="2.4" fill="#E0457F"/></g></svg>');
}

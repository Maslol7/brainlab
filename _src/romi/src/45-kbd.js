/* ---------- keyboards inside the app. The iPhone keyboard "fixes" spelling by itself, and that ruins a dictation, so she never uses it here ----------
   KB holds the open input: { lang, val, onEnter(val), onChange(val), tiles?: [letters], used: [tile indexes], word? } */
let KB = null;
const KB_EN = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const KB_HE = ['קראטוןםפ', 'שדגכעיחלךף', 'זסבהנמצתץ'];
function kbdHTML(lang, enterLbl = 'בדיקה') {
  const rows = lang === 'he' ? KB_HE : KB_EN;
  return `<div class="kbd ${lang}" dir="ltr">${rows.map((r, i) => `<div class="krow">${[...r].map(c => `<button class="key" data-k="${c}">${c}</button>`).join('')}${i === rows.length - 1 ? `<button class="key fn" data-k="bs" aria-label="מחיקה">${IC.bs}</button>` : ''}</div>`).join('')}
  <div class="krow"><button class="key space" data-k=" " aria-label="רווח">רווח</button><button class="key enter" data-k="enter">${enterLbl}</button></div></div>`;
}
/* letter tiles: the letters of the word, mixed, plus a few extra letters when she is ready for it */
function makeTiles(word, extra = 0) {
  const ls = [...word.toLowerCase()].filter(c => c !== ' ');
  const pool = 'aeiouyrstnlmbdgh'.split('').filter(c => !ls.includes(c));
  for (let i = 0; i < extra && pool.length; i++) ls.push(pool.splice(Math.floor(R() * pool.length), 1)[0]);
  let t = shuffle(ls); if (t.join('') === word.toLowerCase().replace(/ /g, '') && t.length > 2) t = shuffle(t);
  return t;
}
const tilesHTML = tiles => `<div class="tiles" dir="ltr">${tiles.map((c, i) => `<button class="tile" data-ti="${i}">${c}</button>`).join('')}<button class="tile fn" data-k="bs" aria-label="מחיקה">${IC.bs}</button></div>`;
/* what she typed so far. With tiles: slots in the shape of the word */
function typedHTML() {
  if (!KB) return '';
  /* missing letters: the given letters stay, what she types fills the gaps in order */
  if (KB.mask) { let j = 0; return `<div class="slots" dir="ltr">${[...KB.mword].map((c, i) => c === ' ' ? '<span class="slot gap"></span>' : !KB.mask[i] ? `<span class="slot given">${esc(c)}</span>` : `<span class="slot blank ${KB.val[j] ? 'full' : ''}">${esc(KB.val[j++] || '')}</span>`).join('')}</div>`; }
  /* copying: only the right next letter goes in */
  if (KB.strict) return `<div class="typed en strict" dir="ltr">${esc(KB.val)}<span class="caret"></span></div>`;
  if (KB.word) { let j = 0; const v = KB.val.replace(/ /g, ''); return `<div class="slots" dir="ltr">${[...KB.word].map(c => c === ' ' ? '<span class="slot gap"></span>' : `<span class="slot ${v[j] ? 'full' : ''}">${esc(v[j++] || '')}</span>`).join('')}</div>`; }
  return `<div class="typed ${KB.lang}" dir="${KB.lang === 'he' ? 'rtl' : 'ltr'}">${esc(KB.val)}<span class="caret"></span></div>`;
}
function kbRefresh() { const t = app.querySelector('#typed'); if (t) t.innerHTML = typedHTML(); if (KB && KB.onChange) KB.onChange(KB.val); }
function kbPress(k) {
  if (!KB || KB.lock) return;
  if (KB.strict) {
    if (k === 'enter' || k === 'bs') return;
    const exp = KB.strict[KB.val.length];
    if (k !== exp) {
      KB.miss = (KB.miss || 0) + 1; SFX.soft(); const t = app.querySelector('#typed .typed'); if (t) { t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); }
      if (KB.miss >= 2) app.querySelectorAll('.kbd [data-k]').forEach(b => b.classList.toggle('glow', b.dataset.k === exp));
      return;
    }
    KB.miss = 0; app.querySelectorAll('.kbd .glow').forEach(b => b.classList.remove('glow'));
    KB.val += k; SFX.tap(); kbRefresh(); if (KB.val.length >= KB.strict.length) KB.onEnter(KB.val); return;
  }
  if (KB.mask) {
    const blanks = KB.mask.filter(Boolean).length;
    if (k === 'bs') { if (KB.val) { KB.val = KB.val.slice(0, -1); SFX.tap(); kbRefresh(); } return; }
    if (k === 'enter' || k === ' ' || KB.val.length >= blanks) return;
    KB.val += k; SFX.tap(); kbRefresh();
    if (KB.val.length >= blanks) { let j = 0; const full = [...KB.mword].map((c, i) => KB.mask[i] ? KB.val[j++] : c).join(''); KB.onEnter(full); }
    return;
  }
  if (k === 'enter') { if (KB.val.trim()) KB.onEnter(KB.val); return; }
  if (k === 'bs') {
    if (!KB.val) return;
    KB.val = KB.val.slice(0, -1);
    if (KB.tiles) { const i = KB.used.pop(); const b = app.querySelector(`[data-ti="${i}"]`); if (b) b.disabled = false; KB.val = KB.val.replace(/ +$/, ''); }
    SFX.tap(); return kbRefresh();
  }
  if (k === ' ' && (!KB.val || KB.val.endsWith(' '))) return;
  if (KB.val.length >= 24) return;
  KB.val += k; SFX.tap(); kbRefresh();
}
function bindKbd(opts) {
  KB = Object.assign({ val: '', used: [] }, opts);
  app.querySelectorAll('.kbd [data-k], .tiles [data-k]').forEach(b => b.onclick = () => kbPress(b.dataset.k));
  app.querySelectorAll('.tiles [data-ti]').forEach(b => b.onclick = () => {
    if (!KB || KB.lock || b.disabled) return;
    if (KB.onTile && KB.onTile(KB.tiles[+b.dataset.ti], b) === false) return;
    b.disabled = true; KB.used.push(+b.dataset.ti); KB.val += KB.tiles[+b.dataset.ti]; SFX.tap();
    /* the spaces of a two-word answer fill in by themselves */
    if (KB.word) { const v = KB.val.replace(/ /g, ''); let out = '', j = 0; for (const c of KB.word) { if (j >= v.length) break; if (c === ' ') out += ' '; else out += v[j++]; } KB.val = out; }
    kbRefresh();
    if (KB.word && KB.val.replace(/ /g, '').length >= KB.word.replace(/ /g, '').length) KB.onEnter(KB.val);
  });
  kbRefresh();
}
/* a computer keyboard works too (for testing on a laptop) */
addEventListener('keydown', e => {
  if (!KB || e.metaKey || e.ctrlKey || e.altKey || document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (e.key === 'Enter') { e.preventDefault(); return kbPress('enter'); }
  if (e.key === 'Backspace') { e.preventDefault(); return kbPress('bs'); }
  if (KB.tiles) { const i = KB.tiles.findIndex((c, j) => c === e.key.toLowerCase() && !KB.used.includes(j)); if (i >= 0) { const b = app.querySelector(`[data-ti="${i}"]`); if (b) b.click(); } return; }
  if (e.key.length === 1 && (KB.lang === 'he' ? /[א-ת ]/ : /[a-zA-Z ']/).test(e.key)) { e.preventDefault(); kbPress(e.key.toLowerCase()); }
});

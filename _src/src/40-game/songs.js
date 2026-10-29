/* Chords only: no lyrics, no melodies. Simplified keys for a beginner. */
const SONGS = [
  ['letitbe', 'Let It Be', 'The Beatles', 'C', 74, [['verse', 'C G Am F C G F C'], ['chorus', 'Am G F C C G F C']], 'ארבעת האקורדים הכי מפורסמים בפופ. רק קלידים לבנים.'],
  ['radio', 'Radioactive', 'Imagine Dragons', 'Bm', 136, [['verse', 'Am C G D']], 'לולאה אחת של 4 אקורדים, מההתחלה ועד הסוף.'],
  ['sami', 'סמי וסומו', 'טיפקס', 'C', 126, [['verse', 'G C G C'], ['chorus', 'F G F C']], 'הכי קל בחבילה: בית של שני אקורדים.'],
  ['billie', 'Billie Jean', 'Michael Jackson', 'F#m', 117, [['verse', 'Am Bm C Bm'], ['bridge', 'F Am']], 'שיר של בס. אחרי שהאקורדים יושבים, נסה לנגן ביד שמאל רק את הבס, בקצב קבוע.'],
  ['demons', 'Demons', 'Imagine Dragons', 'Eb', 90, [['verse', 'C G Am F']], 'הרצף הזה מופיע במאות שירים. נסה לנחש באילו עוד.'],
  ['unicorn', 'Unicorn', 'נועה קירל', 'F#m', 130, [['verse', 'Am Em F E'], ['chorus', 'F G Am Em']], 'ב-E מז׳ור יש קליד שחור אחד: סול דיאז.'],
  ['dontstop', "Don't Stop Me Now", 'Queen', 'F', 156, [['verse', 'C Em Am Dm G'], ['chorus', 'C Dm C Am Dm G']], 'מהיר מאוד במקור. מתחילים בקצב האיטי.'],
  ['push', 'פוש דה באטן', 'טיפקס', 'Am', 145, [['chorus', 'Am C Am C Am G'], ['verse', 'Am E E Am'], ['bridge', 'G C E Am']], 'בפזמון אפשר לנגן רק שני תווים: היסוד והקווינטה. ככה מנגנים "פאוור קורד".'],
  ['believer', 'Believer', 'Imagine Dragons', 'Bbm', 125, [['verse', 'Am F E']], 'רק 3 אקורדים. ה-E נותן את הצליל הדרמטי.'],
  ['beatit', 'Beat It', 'Michael Jackson', 'Ebm', 139, [['verse', 'Am G Am G F G Am Am'], ['chorus', 'Am G']], 'הפזמון הוא רק שני אקורדים, הלוך ושוב.'],
  ['ynwa', "You'll Never Walk Alone", 'Gerry and the Pacemakers', 'C', 70, [['verse', 'C Em F G'], ['chorus', 'C C F D7'], ['chorus', 'C E F G C']], 'ההמנון של ליברפול. גרסה מפושטת לפסנתר.'],
  ['meshugaim', 'שני משוגעים', 'עומר אדם', 'Bm', 117, [['verse', 'Am F C G'], ['chorus', 'Dm Am C G']], 'שים לב: בבית יש את אותם 4 אקורדים כמו ב-Let It Be, רק מתחילים מ-Am.'],
  ['imagine', 'Imagine', 'John Lennon', 'C', 76, [['verse', 'C Cmaj7 F'], ['bridge', 'F Am Dm F G G7'], ['chorus', 'F G C E7']], 'C ו-Cmaj7 שונים בתו אחד בלבד. היד כמעט לא זזה.'],
  ['chavera', 'יש לי חברה', 'טיפקס', 'Am', 136, [['verse', 'Am F Am G F Am'], ['chorus', 'G F Am E7']], 'E7 בסוף הפזמון "מושך" חזרה ל-Am.'],
  ['thunder', 'Thunder', 'Imagine Dragons', 'C', 168, [['verse', 'C F C F'], ['chorus', 'C Am F C']], 'הבית הוא רק C ו-F. בקצב האיטי זה מרגיש פי שניים לאט, וזה בסדר.'],
  ['mirror', 'Man in the Mirror', 'Michael Jackson', 'G', 100, [['verse', 'G D Em D C'], ['bridge', 'Am G C D'], ['chorus', 'G G C D']], 'בפזמון: סול, דו, רה. השילוב הכי בסיסי במוזיקה.'],
  ['heyjude', 'Hey Jude', 'The Beatles', 'F', 74, [['verse', 'C G G7 C F C G C'], ['chorus', 'C Bb F C']], 'הסוף הארוך הוא רק 4 אקורדים שחוזרים. ב-Bb יש קליד שחור.'],
  ['salsulim', 'סלסולים', 'סטטיק ובן אל', 'F#m', 95, [['intro', 'Am F C G'], ['verse', 'Am G F'], ['chorus', 'F Am G C']], 'הפתיחה היא בדיוק הבית של שני משוגעים.'],
  ['bones', 'Bones', 'Imagine Dragons', 'Bbm', 114, [['verse', 'Am E G D']], 'לולאה אחת לכל השיר. ב-E וב-D יש קליד שחור אחד.'],
  ['obladi', 'Ob-La-Di, Ob-La-Da', 'The Beatles', 'Bb', 113, [['verse', 'C G G7 C C F C G'], ['chorus', 'C G Am C G C']], 'שמח וקל: כמעט רק C, F ו-G.'],
  ['kafe', 'יושבים בבית קפה', 'טיפקס', 'Cm', 145, [['verse', 'Dm Am E Dm'], ['chorus', 'Am G F E Dm']], 'בפזמון הבס יורד: לה, סול, פה, מי. לירידה הזאת קוראים "הירידה האנדלוסית".'],
  ['blackwhite', 'Black or White', 'Michael Jackson', 'E', 115, [['riff', 'C F/C'], ['verse', 'C F G F C'], ['chorus', 'G F C C']], 'בריף, יד שמאל מחזיקה דו כל הזמן, ורק יד ימין זזה.'],
  ['shkiot', 'שקיעות אדומות', 'עדן חסון', 'F#m', 84, [['verse', 'G Am F Dm'], ['chorus', 'Am Em F Em Dm F']], 'שיר איטי. טוב לחימום לפני אימון.'],
  ['heal', 'Heal the World', 'Michael Jackson', 'A', 81, [['verse', 'C Dm7 Em7 G'], ['chorus', 'C Dm7 G C']], 'הבית עולה מדרגה אחרי מדרגה: דו, רה, מי.'],
  ['mimaamakim', 'ממעמקים', 'עידן רייכל', 'G#m', 90, [['verse', 'Am Am/G F Dm7'], ['chorus', 'C F Am Dm7 C F Em Dm7']], 'בבית הבס יורד בצעדים: לה, סול, פה, רה.'],
  ['aniveata', 'אני ואתה', 'אריק איינשטיין', 'Em', 134, [['verse', 'Am D E7 Am'], ['chorus', 'C G C E7 Am']], 'D מז׳ור בתוך שיר בלה מינור: זה מה שנותן לשיר את הצליל המיוחד.'],
  ['champions', 'We Are the Champions', 'Queen', 'F', 63, [['chorus', 'C Em Am F G']], 'רק הפזמון. איטי, וסופרים 6 פעימות בכל תיבה.'],
].map(([id, n, a, ok, bpm, sec, tip], i) => ({ id, n, a, ok, bpm, sec: sec.map(([k, c]) => ({ k, c: c.split(' ') })), tip, at: i < 2 ? 0 : 3 * (i - 1) }));
const NOTRANS = new Set(['letitbe', 'sami', 'push', 'ynwa', 'imagine', 'chavera', 'thunder', 'mirror']);
const SECN = { intro: 'פתיחה', verse: 'בית', chorus: 'פזמון', bridge: 'מעבר', riff: 'ריף' };
const SOLF12 = ['דו', 'דו#', 'רה', 'רה#', 'מי', 'פה', 'פה#', 'סול', 'סול#', 'לה', 'לה#', 'סי'];
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const QUAL = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], '+': [0, 4, 8], dim: [0, 3, 6], sus4: [0, 5, 7] };
function chordNotes(sym) {
  const m = /^([A-G])([#b]?)(maj7|m7|m|7|\+|dim|sus4)?(?:\/([A-G])([#b]?))?$/.exec(sym); if (!m) return null;
  const acc = s => s === '#' ? 1 : s === 'b' ? -1 : 0;
  const root = (PC[m[1]] + acc(m[2]) + 12) % 12, iv = QUAL[m[3] || ''];
  const bass = m[4] ? (PC[m[4]] + acc(m[5]) + 12) % 12 : root;
  return { rh: iv.map(x => 60 + root + x), lh: 48 + bass, minor: /^m/.test(m[3] || '') && m[3] !== 'maj7' };
}
const midiHz = n => 440 * Math.pow(2, (n - 69) / 12);
function playChord(sym, len = 1.6) { const c = chordNotes(sym); if (!c) return; ac(); c.rh.forEach((n, i) => tone(midiHz(n), i * .015, len, 'triangle', .1)); tone(midiHz(c.lh), 0, len + .3, 'triangle', .16); tone(midiHz(c.lh) * 2, 0, .4, 'sine', .03); }
function kbSVG(sym) {
  const c = chordNotes(sym) || { rh: [], lh: -1 };
  const W = [0, 2, 4, 5, 7, 9, 11], B = [1, 3, 6, 8, 10];
  let wk = '', bk = '', x = 0;
  for (let o = 0; o < 3; o++) {
    W.forEach(p => { const n = 48 + o * 12 + p, on = c.rh.includes(n) ? 'r' : c.lh === n ? 'l' : ''; wk += `<rect x="${x}" y="0" width="10" height="56" rx="1.5" class="wk ${on}"/>${on ? `<circle cx="${x + 5}" cy="47" r="3" class="dot ${on}"/>` : ''}`; x += 10; });
  }
  for (let o = 0; o < 3; o++) B.forEach(p => { const n = 48 + o * 12 + p, on = c.rh.includes(n) ? 'r' : c.lh === n ? 'l' : ''; const bx = o * 70 + { 1: 7, 3: 17, 6: 37, 8: 47, 10: 57 }[p]; bk += `<rect x="${bx}" y="0" width="6" height="34" rx="1" class="bk ${on}"/>`; });
  return `<svg class="kb" viewBox="0 0 210 57" preserveAspectRatio="none">${wk}${bk}</svg>`;
}
const songsOpenFor = n => SONGS.filter(s => s.at <= n).length;
const songsOpen = () => Math.min(SONGS.length, songsOpenFor(doneCount(S)) + (S.songBuy || 0));
const chordSet = s => [...new Set(s.sec[0].c)].sort().join(',');
function twins(s) { const k = chordSet(s); return SONGS.filter(o => o !== s && chordSet(o) === k && o.at <= doneCount(S)).map(o => o.n); }
/* ---------- views ---------- */
let SL = null;
// loop state
function stopLoop() { if (SL) { clearTimeout(SL.t); SL = null; } }
function songsTile() {
  const open = songsOpen(), fresh = open > (S.songSeen || 0);
  return `<button class="tile wide" style="--tc:#FF7AA8" data-go="songs"><span class="ti">${IC.keys}</span><div class="grow"><h4>פינת הפסנתר ${fresh ? '<span class="newtag">חדש</span>' : ''}</h4><p>אקורדים של שירים מוכרים. שיר חדש נפתח כל 3 משימות.</p></div><span class="best">${open}/${SONGS.length}</span></button>`;
}
function viewSongs() {
  if (S.songId) return viewSong(SONGS.find(s => s.id === S.songId));
  const open = songsOpen(); S.songSeen = open;
  const list = SONGS.map((s, i) => i < open
    ? `<button class="card song" data-song="${s.id}"><span class="sn">${i + 1}</span><div class="grow" data-nog><b>${s.n}</b><span>${s.a}</span></div><span class="sc ltr" dir="ltr">${s.sec[0].c.slice(0, 4).join(' ')}</span></button>`
    : `<div class="card song locked"><span class="sn">${IC.lock}</span><div class="grow"><b>שיר ${i + 1}</b><span>נפתח אחרי משימה ${s.at}</span></div>${i === open ? `<button class="chip buysong" data-buysong>לפתוח עכשיו · ${SONG_PRICE} מטבעות</button>` : ''}</div>`).join('');
  return `<div class="stack">${hud()}<div class="sec-h"><h3>פינת הפסנתר</h3><button class="chip" data-go="arcade">חזרה</button></div>
  <details class="card howto"><summary><b>איך מנגנים אקורד</b></summary><p>יד ימין: 3 תווים יחד. יד שמאל: תו אחד נמוך, הבס.</p><p><b>מז׳ור</b> (C): מהיסוד סופרים 4 קלידים (כולל שחורים) ואז עוד 3. <b>מינור</b> (Am): 3 ואז 4. זה כל ההבדל בין צליל שמח לצליל עצוב.</p></details>
  <div class="stack" style="gap:8px">${list}</div></div>`;
}
function viewSong(s) {
  if (!s) { S.songId = null; return viewSongs(); }
  const cur = SL && SL.id === s.id ? SL : null;
  const all = [...new Set(s.sec.flatMap(x => x.c))];
  const sel = S.songChord && all.includes(S.songChord) ? S.songChord : all[0];
  const cn = chordNotes(sel), tw = twins(s);
  const secs = s.sec.map((x, si) => `<div class="sec"><div class="sh"><b>${SECN[x.k] || x.k}</b><button class="chip ${cur && cur.si === si ? 'on' : ''}" data-loop="${si}">${cur && cur.si === si ? 'עצור' : 'נגן לולאה'}</button></div><div class="chs" dir="ltr">${x.c.map((c, ci) => `<button class="ch ${c === sel ? 'sel' : ''} ${cur && cur.si === si && cur.ci === ci ? 'beat' : ''}" data-chord="${c}">${c}</button>`).join('')}</div></div>`).join('');
  return `<div class="stack">${hud()}<div class="sec-h"><h3 data-nog>${s.n}</h3><button class="chip" data-song="">כל השירים</button></div>
  <section class="card stack" style="gap:10px"><div class="muted small">${s.a}${!NOTRANS.has(s.id) ? ` · במקור ב-<span class="ltr" dir="ltr">${s.ok}</span>, כאן בסולם קל יותר לידיים` : ''}</div>
  <div class="kbwrap">${kbSVG(sel)}<div class="kbl"><b class="ltr" dir="ltr">${sel}</b><span>${cn ? `<i class="l"></i>${SOLF12[cn.lh % 12]} · <i class="r"></i>${cn.rh.map(n => SOLF12[n % 12]).join(' ')}` : ''}</span></div></div>
  ${secs}
  <div class="row tempo"><span class="small muted">קצב</span><button class="chip ${S.songFast ? '' : 'on'}" data-tempo="0">איטי</button><button class="chip ${S.songFast ? 'on' : ''}" data-tempo="1">מקורי (${s.bpm})</button></div>
  <p class="small" style="margin:0">${s.tip}</p>${tw.length ? `<p class="small twin">אותם אקורדים כמו: <b data-nog>${tw.join(', ')}</b></p>` : ''}</section></div>`;
}
function loopStep() {
  if (!SL) return;
  const s = SONGS.find(x => x.id === SL.id), sec = s.sec[SL.si], bpm = S.songFast ? s.bpm : Math.max(56, Math.round(s.bpm * .55));
  const beat = 60 / bpm, beats = s.id === 'champions' ? 6 : 4;
  const c = sec.c[SL.ci]; playChord(c, beat * beats * .9);
  for (let b = 1; b < beats; b++) tone(1500, b * beat, .03, 'sine', .03);
  S.songChord = c; renderSongOnly();
  SL.t = setTimeout(() => { if (!SL) return; SL.ci = (SL.ci + 1) % sec.c.length; loopStep(); }, beat * beats * 1000);
}
function renderSongOnly() { const y = window.scrollY; app.innerHTML = viewSongs() + nav('arcade'); bind(); bindSongs(); window.scrollTo(0, y); }
function bindSongs() {
  app.querySelectorAll('[data-song]').forEach(b => b.onclick = () => { stopLoop(); S.songId = b.dataset.song || null; S.songChord = null; SFX.tap(); save(); render(); window.scrollTo(0, 0); });
  app.querySelectorAll('[data-chord]').forEach(b => b.onclick = () => { S.songChord = b.dataset.chord; playChord(b.dataset.chord); if (!SL) renderSongOnly(); });
  app.querySelectorAll('[data-loop]').forEach(b => b.onclick = () => { const si = +b.dataset.loop; if (SL && SL.si === si) { stopLoop(); renderSongOnly(); return; } stopLoop(); SL = { id: S.songId, si, ci: 0 }; loopStep(); });
  app.querySelectorAll('[data-tempo]').forEach(b => b.onclick = () => { S.songFast = b.dataset.tempo === '1'; save(); if (!SL) renderSongOnly(); });
  const b = app.querySelector('[data-buysong]'); if (b) b.onclick = () => { if (S.coins < SONG_PRICE) return toast(`צריך ${SONG_PRICE} מטבעות`); modal('לפתוח את השיר הבא?', `זה יעלה ${SONG_PRICE} מטבעות.`, 'לפתוח', () => { S.coins -= SONG_PRICE; S.songBuy = (S.songBuy || 0) + 1; SFX.coin(); save(); render(); }, 'btn-gold'); };
}

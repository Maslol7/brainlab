/* ---------- record a whole list in one take ----------
   The words appear one by one. Dad says a word, then taps for the next one. The taps mark where each word ends;
   each piece is trimmed to the voice (energy above a threshold), made louder to a fixed peak, and kept as a small WAV (12 kHz, mono). */
let VR = null;
const VR_SR = 12000;
function startVrec(l) { if (!l) return; VR = { l, i: 0, marks: [], ph: 'ready', clips: {} }; go('vrec'); }
VIEWS.vrec = () => {
  if (!VR) { S.view = 'parent'; return VIEWS.parent(); }
  const l = VR.l, n = l.words.length, w = l.words[VR.i];
  const bar = `<header class="bar"><button class="icon-btn" data-act="vrx" aria-label="יציאה">${IC.x}</button><h2>הקלטה של ${esc(l.t)}</h2></header>`;
  if (VR.ph === 'ready') {
    app.innerHTML = `<div class="page">${bar}<section class="card stack"><h3>הקול של אבא, בהקלטה אחת</h3>
    <ol class="howto"><li>המילים מופיעות אחת אחרי השנייה.</li><li>אומרים את המילה, ואז נוגעים בכפתור הגדול למילה הבאה.</li><li>בסוף שומעים כל מילה ושומרים. מילה שלא יצאה טוב אפשר להקליט שוב לבד.</li></ol>
    <p class="small muted">${n} מילים, בערך ${Math.ceil(n * 2.5)} שניות. כדאי מקום שקט.</p>
    <button class="btn btn-main big" data-act="vrgo">להתחיל להקליט</button></section></div>`;
    on('[data-act="vrgo"]', vrBegin);
  } else if (VR.ph === 'rec') {
    app.innerHTML = `<div class="page vrec">${bar}<div class="recdot"><i></i>מקליט · ${VR.i + 1}/${n}</div>
    <div class="vr-word"><span class="em">${w.em || ''}</span><span class="word" dir="ltr">${esc(w.en)}</span><span class="muted">${l.words[VR.i + 1] ? 'הבאה: <b dir="ltr">' + esc(l.words[VR.i + 1].en) + '</b>' : 'המילה האחרונה'}</span></div>
    <button class="vr-next" data-act="vrnext">${VR.i + 1 < n ? 'אמרתי. למילה הבאה' : 'אמרתי. סיום'}</button></div>`;
    on('[data-act="vrnext"]', vrNext);
  } else if (VR.ph === 'proc') {
    app.innerHTML = `<div class="page">${bar}<section class="card center"><p>חותך את ההקלטה למילים...</p></section></div>`;
  } else {
    const ok = l.words.filter(x => VR.clips[kOf(x)]).length;
    app.innerHTML = `<div class="page">${bar}<section class="card stack"><h3>${ok === n ? 'כל המילים מוכנות' : `${ok} מתוך ${n} מילים מוכנות`}</h3><p class="small muted">לחיצה על מילה משמיעה אותה.</p>
    <div class="vlist">${l.words.map(x => { const k = kOf(x), c = VR.clips[k]; return `<div class="vrow ${c ? 'has' : ''}"><span class="vw" dir="ltr">${esc(x.en)}</span>${c ? `<button class="vbtn" data-vp="${esc(k)}" aria-label="השמעה">${GIC.play.replace('width="30" height="30"', 'width="16" height="16"')}</button>` : '<span class="small bad">לא נשמע</span>'}</div>`; }).join('')}</div>
    <button class="btn btn-main big" data-act="vrsave" ${ok ? '' : 'disabled'}>שמירה</button><button class="btn btn-ghost" data-act="vragain">להקליט שוב</button></section></div>`;
    on('[data-vp]', b => playClip(VR.clips[b.dataset.vp]));
    on('[data-act="vrsave"]', vrSave);
    on('[data-act="vragain"]', () => { VR = { l, i: 0, marks: [], ph: 'ready', clips: {} }; render(); });
  }
  on('[data-act="vrx"]', () => { vrAbort(); VR = null; go('parent'); });
};
async function vrBegin() {
  if (!recOK()) return toast('הטלפון הזה לא מאפשר הקלטה כאן');
  const stream = await getMic(); if (!stream) return;
  const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
  const mr = new MediaRecorder(stream, type ? { mimeType: type } : {}), parts = [];
  mr.ondataavailable = e => e.data && e.data.size && parts.push(e.data);
  mr.onstart = () => { VR.t0 = performance.now(); };
  mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); audioMode('playback'); if (VR && VR.ph === 'proc') vrSplit(new Blob(parts, { type: mr.mimeType || type || 'audio/mp4' })); };
  Object.assign(VR, { mr, stream, ph: 'rec', i: 0, marks: [], t0: performance.now() }); mr.start(); render();
}
function vrNext() {
  if (!VR || VR.ph !== 'rec') return;
  VR.marks.push((performance.now() - VR.t0) / 1000); SFX.tap();
  if (VR.i + 1 < VR.l.words.length) { VR.i++; return render(); }
  VR.ph = 'proc'; render(); setTimeout(() => { try { VR.mr.stop(); } catch (e) { } }, 250);
}
function vrAbort() { if (VR && VR.mr && VR.mr.state !== 'inactive') { VR.ph = 'off'; try { VR.mr.stop(); } catch (e) { } } }
async function vrSplit(blob) {
  try {
    const a = ac(); const ab = await blob.arrayBuffer();
    const buf = await new Promise((res, rej) => a.decodeAudioData(ab, res, rej));
    VR.clips = splitByMarks(buf.getChannelData(0), buf.sampleRate, VR.marks, VR.l.words.map(kOf));
  } catch (e) { console.error(e); toast('לא הצלחתי לקרוא את ההקלטה. נסה שוב.'); VR.clips = {}; }
  VR.ph = 'review'; if (S.view === 'vrec') render();
}
/* the pure part: samples, rate, the tap times (seconds), the word keys -> { key: wav data URL } */
function splitByMarks(ch, sr, marks, keys) {
  const out = {}, fr = Math.round(sr * .01);
  keys.forEach((k, i) => {
    const s = Math.max(0, Math.floor(((i ? marks[i - 1] : 0) - .05) * sr)), e = Math.min(ch.length, Math.floor((marks[i] + .15) * sr));
    if (e - s < fr * 5) return;
    const nf = Math.floor((e - s) / fr), rms = new Float32Array(nf); let top = 0;
    for (let f = 0; f < nf; f++) { let a = 0; for (let j = s + f * fr, z = j + fr; j < z; j++) a += ch[j] * ch[j]; rms[f] = Math.sqrt(a / fr); if (rms[f] > top) top = rms[f]; }
    if (top < .008) return;
    const thr = Math.max(.006, top * .12); let f0 = 0, f1 = nf - 1;
    while (f0 < nf && rms[f0] < thr) f0++; while (f1 > f0 && rms[f1] < thr) f1--;
    const a0 = Math.max(s, s + (f0 - 8) * fr), a1 = Math.min(e, s + (f1 + 12) * fr);
    if (a1 - a0 < sr * .12) return;
    out[k] = wavURL(resample(ch.subarray(a0, a1), sr, VR_SR), VR_SR);
  });
  return out;
}
function resample(x, from, to) {
  if (from === to) return Float32Array.from(x);
  const n = Math.floor(x.length * to / from), y = new Float32Array(n), r = from / to;
  for (let i = 0; i < n; i++) { const p = i * r, j = Math.floor(p), t = p - j; y[i] = x[j] * (1 - t) + (x[j + 1] || 0) * t; }
  return y;
}
function wavURL(x, sr) {
  const n = x.length, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), wr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(x[i])); const g = peak ? Math.min(6, .9 / peak) : 1, fade = Math.min(n >> 1, Math.round(sr * .012));
  wr(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); wr(8, 'WAVE'); wr(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); wr(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) { const f = Math.min(1, i / fade, (n - 1 - i) / fade); v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x[i] * g * f)) * 32767, true); }
  const u = new Uint8Array(b); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return 'data:audio/wav;base64,' + btoa(s);
}
async function playClip(url) { const k = '__clip'; VOICE[k] = url; delete VBUF[k]; await playVoice(k); delete VOICE[k]; delete VBUF[k]; }
async function vrSave() {
  const ks = Object.keys(VR.clips);
  ks.forEach(k => { VOICE[k] = VR.clips[k]; delete VBUF[k]; }); saveVoice(); track('rec', { n: ks.length, of: VR.l.words.length }); save();
  toast(`נשמרו ${ks.length} מילים בקול שלך`); const l = VR.l; VR = null; go('parent');
  for (const k of ks) await voicePush(k);
}

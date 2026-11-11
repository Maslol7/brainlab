/* ---------- dad's voice: dad records each word once, and the app says the word in his voice ----------
   Recordings live in their own localStorage key (not in S, so the state stays small), and in the cloud under brainlab/<code>-v.json, one child per word.
   Playback goes through Web Audio, so it also works after a timer (iPhone allows it once the first touch unlocked the audio). */
const VKEY = 'salta-voice';
let VOICE = (() => { try { return JSON.parse(localStorage.getItem(VKEY)) || {}; } catch (e) { return {}; } })();
const VBUF = {};
function saveVoice() { try { localStorage.setItem(VKEY, JSON.stringify(VOICE)); } catch (e) { toast('אין מקום לשמור עוד הקלטות בטלפון'); } }
const hasVoice = w => !!(w && VOICE[kOf(w)]) && S.dadVoice !== 0;
/* iPhone: let the sound play even when the side switch is on silent */
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
async function playVoice(k) {
  const a = ac(); const src = VOICE[k]; if (!a || !src) return false;
  try {
    if (!VBUF[k]) { const bin = atob(src.split(',')[1]); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); VBUF[k] = await new Promise((res, rej) => a.decodeAudioData(u8.buffer, res, rej)); }
    const n = a.createBufferSource(), g = a.createGain(); g.gain.value = 1.6; n.buffer = VBUF[k]; n.connect(g); g.connect(a.destination); n.start(); return true;
  } catch (e) { return false; }
}
/* say an English word: dad's recording when there is one, else the phone's voice */
function sayWord(w, rate) {
  if (!w) return;
  if (!rate && hasVoice(w)) { try { if (TTS) TTS.cancel(); } catch (e) { } playVoice(kOf(w)).then(ok => { if (!ok) say(w.en); }); return; }
  say(w.en, 'en', rate);
}
/* ---------- recording (parent area) ---------- */
let REC = null;
const recOK = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
async function recStart(k, onDone) {
  if (REC) return recStop();
  if (!recOK()) return toast('הטלפון הזה לא מאפשר הקלטה כאן');
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { return toast('צריך לאשר גישה למיקרופון (הגדרות ← ספארי ← מיקרופון)', 4500); }
  const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
  const mr = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 32000 } : {}), parts = [];
  mr.ondataavailable = e => e.data && e.data.size && parts.push(e.data);
  mr.onstop = () => {
    stream.getTracks().forEach(t => t.stop()); const b = new Blob(parts, { type: mr.mimeType || type || 'audio/mp4' });
    const fr = new FileReader(); fr.onload = () => { VOICE[k] = fr.result; delete VBUF[k]; saveVoice(); voicePush(k); REC = null; onDone && onDone(); playVoice(k); }; fr.readAsDataURL(b);
  };
  REC = { mr, k, t: setTimeout(recStop, 2600) }; mr.start(); SFX.beep && SFX.beep(); onDone && onDone(true);
}
function recStop() { if (!REC) return; clearTimeout(REC.t); try { REC.mr.stop(); } catch (e) { REC = null; } }
function voiceDel(k) { delete VOICE[k]; delete VBUF[k]; saveVoice(); voicePush(k, true); }
/* cloud: one child per word, so two phones never overwrite each other's words */
async function voicePush(k, del) {
  const c = typeof cloudCfg === 'function' ? cloudCfg() : {}; if (!c.code) return;
  try { await fetchT(`${c.url.replace(/\/+$/, '')}/brainlab/${c.code}-v/${encodeURIComponent(k)}.json`, { method: del ? 'DELETE' : 'PUT', body: del ? undefined : JSON.stringify(VOICE[k]) }); } catch (e) { return; }
  if (isDad()) { PDOC = PDOC || {}; PDOC.vv = Date.now(); await pPut(c, PDOC); }
}
async function voicePull() {
  const c = typeof cloudCfg === 'function' ? cloudCfg() : {}; if (!c.code) return;
  const g = await cGet(c, '-v'); if (!g.data || typeof g.data !== 'object') return;
  let n = 0; for (const [k, v] of Object.entries(g.data)) if (typeof v === 'string' && VOICE[k] !== v) { VOICE[k] = v; delete VBUF[k]; n++; }
  if (n) saveVoice();
}

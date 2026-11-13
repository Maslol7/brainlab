/* ---------- dad's voice: dad records each word once, and the app says the word in his voice ----------
   Recordings live in their own localStorage key (not in S, so the state stays small), and in the cloud under brainlab/<code>-v.json, one child per word.
   Playback goes through Web Audio, so it also works after a timer (iPhone allows it once the first touch unlocked the audio). */
const VKEY = 'salta-voice';
let VOICE = (() => { try { return JSON.parse(localStorage.getItem(VKEY)) || {}; } catch (e) { return {}; } })();
const VBUF = {};
function saveVoice() { try { localStorage.setItem(VKEY, JSON.stringify(VOICE)); } catch (e) { toast('אין מקום לשמור עוד הקלטות בטלפון'); } }
/* who says the English words: 'dad' everywhere, 'native' (the phone's English voice) everywhere,
   or 'mix': dad on the new-word card, word cards and the mock dictation; the English voice in drills and games */
const vmode = () => S.vmode || (S.dadVoice === 0 ? 'native' : 'dad');
function voiceCtx() { if (S.view === 'test') return 'test'; if (S.view === 'practice') return P && P.cur && P.cur.type === 'learn' ? 'learn' : 'drill'; if (S.view === 'game') return 'drill'; return 'learn'; }
const hasVoice = w => { if (!(w && VOICE[kOf(w)])) return false; const m = vmode(); return m === 'dad' || (m === 'mix' && voiceCtx() !== 'drill'); };
/* iPhone: let the sound play even when the side switch is on silent */
const audioMode = t => { try { if (navigator.audioSession) navigator.audioSession.type = t; } catch (e) { } };
audioMode('playback');
/* getUserMedia with the reason when it fails. The audio session must allow recording first ("playback" blocks the microphone on iPhone) */
async function getMic() {
  audioMode('play-and-record');
  try { return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch (e) {
    audioMode('playback');
    const n = e && e.name;
    toast(n === 'NotAllowedError' ? 'הטלפון חוסם את המיקרופון. באייפון: הגדרות ← אפליקציות ← ספארי ← מיקרופון ← "לשאול" או "לאפשר". אחר כך לסגור את סלטה לגמרי ולפתוח שוב.' : n === 'NotFoundError' ? 'לא נמצא מיקרופון' : `המיקרופון לא נפתח (${esc(n || e)})`, 7000);
    return null;
  }
}
/* Playing dad's voice. Before v39 a failed play fell back to the phone voice without a trace, and that happened often. Now:
   1. the audio context is resumed, and made again when the iPhone left it "interrupted" (after a call or a locked screen);
   2. recordings are kept as WAV (the iPhone's own recorder makes MP4 pieces that Web Audio does not always decode);
   3. if Web Audio still fails, an <audio> element plays the file; only then the phone voice speaks;
   every fallback is written to the usage log with its reason. */
const b64buf = src => { const bin = atob(src.split(',')[1]); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8.buffer; };
const decodeIn = (a, src) => new Promise((res, rej) => { try { const p = a.decodeAudioData(b64buf(src), res, rej); if (p && p.catch) p.catch(rej); } catch (e) { rej(e); } });
async function liveAC() {
  let a = ac(); if (!a) return null;
  if (a.state !== 'running') { try { await Promise.race([a.resume(), new Promise(r => setTimeout(r, 400))]); } catch (e) { } }
  if (a.state === 'interrupted' || a.state === 'closed') { if (a.state !== 'closed') { try { const c = a.close(); if (c && c.catch) c.catch(() => { }); } catch (e) { } } AC = null; a = ac(); try { await Promise.race([a.resume(), new Promise(r => setTimeout(r, 400))]); } catch (e) { } }
  return a;
}
const VFAIL = {};
function vfail(k, why) { const t = Date.now(); if (VFAIL[k] && t - VFAIL[k] < 5000) return; VFAIL[k] = t; track('vf', { w: k, why: String(why).slice(0, 60), st: (AC && AC.state) || 'none' }); save(); }
async function playVoice(k, rate) {
  const src = VOICE[k]; if (!src) return false;
  if (!rate) {
    try {
      const a = await liveAC();
      if (a && a.state === 'running') {
        if (!VBUF[k]) VBUF[k] = await decodeIn(a, src);
        const n = a.createBufferSource(), g = a.createGain(); g.gain.value = 1.6; n.buffer = VBUF[k]; n.connect(g); g.connect(a.destination); n.start();
        if (!/^data:audio\/wav/.test(src)) toWav(k, VBUF[k]);
        return true;
      }
      vfail(k, 'webaudio ' + (a ? a.state : 'none'));
    } catch (e) { vfail(k, 'webaudio ' + (e && (e.name || e.message) || e)); }
  }
  try { const el = new Audio(src); el.preservesPitch = true; el.webkitPreservesPitch = true; if (rate) el.playbackRate = rate; await el.play(); return true; }
  catch (e) { vfail(k, 'audio ' + (e && (e.name || e.message) || e)); return false; }
}
/* turn a decoded recording into a small WAV, once */
function toWav(k, buf) { try { VOICE[k] = wavURL(resample(buf.getChannelData(0), buf.sampleRate, VR_SR), VR_SR); saveVoice(); voicePush(k); } catch (e) { } }
/* at start: convert older MP4 recordings without waiting for a touch (an offline context decodes without sound) */
async function wavAll() {
  const ks = Object.keys(VOICE).filter(k => !/^data:audio\/wav/.test(VOICE[k])); if (!ks.length) return;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) return;
  for (const k of ks) { try { const o = new OAC(1, 1, 44100); const buf = await decodeIn(o, VOICE[k]); VOICE[k] = wavURL(resample(buf.getChannelData(0), buf.sampleRate, VR_SR), VR_SR); delete VBUF[k]; } catch (e) { vfail(k, 'convert ' + (e && (e.name || e.message) || e)); } }
  saveVoice();
}
/* say an English word: dad's recording when there is one (slow = his recording at 70%, same pitch), else the phone's voice */
function sayWord(w, rate) {
  if (!w) return;
  if (hasVoice(w)) { try { if (TTS) TTS.cancel(); } catch (e) { } playVoice(kOf(w), rate ? .7 : 0).then(ok => { if (!ok) say(w.en, 'en', rate); }); return; }
  say(w.en, 'en', rate);
}
/* ---------- recording (parent area) ---------- */
let REC = null;
const recOK = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
async function recStart(k, onDone) {
  if (REC) return recStop();
  if (!recOK()) return toast('הטלפון הזה לא מאפשר הקלטה כאן');
  const stream = await getMic(); if (!stream) return;
  const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
  const mr = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 32000 } : {}), parts = [];
  mr.ondataavailable = e => e.data && e.data.size && parts.push(e.data);
  mr.onstop = () => {
    stream.getTracks().forEach(t => t.stop()); audioMode('playback'); const b = new Blob(parts, { type: mr.mimeType || type || 'audio/mp4' });
    const fr = new FileReader(); fr.onload = async () => {
      VOICE[k] = fr.result; delete VBUF[k];
      try { const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; const buf = await decodeIn(new OAC(1, 1, 44100), fr.result); VOICE[k] = splitByMarks(buf.getChannelData(0), buf.sampleRate, [buf.duration], [k])[k] || VOICE[k]; } catch (e) { vfail(k, 'convert ' + (e && e.name || e)); }
      saveVoice(); voicePush(k); track('rec', { n: 1 }); REC = null; onDone && onDone(); playVoice(k);
    }; fr.readAsDataURL(b);
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

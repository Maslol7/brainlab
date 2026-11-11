/* ---------- speech: the phone reads words aloud (iPhone: works only after the first tap, so every first call comes from a tap) ---------- */
const TTS = window.speechSynthesis || null;
let VOICES = [];
function loadVoices() { try { VOICES = TTS ? TTS.getVoices() : []; } catch (e) { VOICES = []; } }
if (TTS) { loadVoices(); try { TTS.addEventListener('voiceschanged', loadVoices); } catch (e) { TTS.onvoiceschanged = loadVoices; } }
const EN_PREF = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Daniel', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];
function voiceFor(lang) {
  if (!VOICES.length) loadVoices();
  const vs = VOICES.filter(v => (v.lang || '').toLowerCase().startsWith(lang));
  if (lang === 'en') { for (const n of EN_PREF) { const v = vs.find(x => x.name.startsWith(n)); if (v) return v; } return vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null; }
  return vs[0] || null;
}
const hasHeVoice = () => !!voiceFor('he');
function say(text, lang = 'en', rate) {
  if (!TTS || !text) return false;
  try {
    if (TTS.speaking || TTS.pending) TTS.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'he' ? 'he-IL' : 'en-US'; const v = voiceFor(lang); if (v) u.voice = v;
    u.rate = rate || (lang === 'he' ? .95 : (S.rate || .85)); u.pitch = 1.05;
    TTS.speak(u); return true;
  } catch (e) { return false; }
}
/* spell letter by letter: "N, E, I, G..." and light each letter on screen as it is said */
function spellOut(word, el) {
  const letters = word.replace(/[^A-Za-z]/g, '').toUpperCase().split('');
  say(letters.join(', '), 'en', .6);
  if (!el) return;
  const spans = el.querySelectorAll('.lt');
  spans.forEach((s, i) => later(() => { spans.forEach(x => x.classList.remove('lit')); s.classList.add('lit'); }, 350 + i * 620));
  later(() => spans.forEach(x => x.classList.remove('lit')), 350 + spans.length * 620 + 400);
}
const letterSpans = w => [...w].map(c => c === ' ' ? '<span class="lt sp"> </span>' : `<span class="lt">${esc(c)}</span>`).join('');

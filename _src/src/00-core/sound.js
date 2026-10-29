/* ---------- sound ---------- */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, t0, dur, type = 'triangle', vol = .16) { if (!S.sound) return; const a = ac(); if (!a) return; const o = a.createOscillator(), gn = a.createGain(), t = a.currentTime + t0; o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + .012); gn.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t + dur + .05); }
const NOTES = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
function pianoNote(f) { tone(f, 0, 1.1, 'triangle', .22); tone(f * 2, 0, .5, 'sine', .05); }
const SFX = {
  ok() { tone(660, 0, .12); tone(990, .08, .2); }, no() { tone(180, 0, .28, 'sawtooth', .07); buzz(60); },
  combo() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .07, .22)); }, coin() { tone(988, 0, .08, 'square', .05); tone(1319, .07, .22, 'square', .05); },
  hit() { tone(140, 0, .16, 'square', .1); tone(90, .05, .2, 'sawtooth', .06); }, win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * .11, .28)); }, tap() { tone(520, 0, .04, 'sine', .05); },
  beep() { tone(1760, 0, .09, 'square', .05); }, soft() { tone(392, 0, .14, 'sine', .07); tone(330, .1, .2, 'sine', .06); buzz(30); },
};
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }

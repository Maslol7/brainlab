/* ---------- saved state ---------- */
const KEY = 'salta-romi-v1';
const DAD_DEF = ['רומי, אבא אוהב אותך.', 'אבא גאה בך. לא בגלל הציון, בגלל שאת מתאמנת.', 'כמו באקרובטיקה: עוד אימון ועוד אימון, ופתאום זה קל. אבא איתך.', 'טעות היא חלק מהאימון. אבא סומך עלייך.', 'אבא אוהב אותך. עכשיו לכי לשתות מים ולעשות גלגלון.', 'כל מילה שלמדת היא שלך לתמיד. אבא גאה בך.'];
const DAD_HARD = ['קשה? זה בסדר. אבא אוהב אותך, וזה לא תלוי בציון.', 'נשימה עמוקה. גם באימון לא כל קפיצה יוצאת בפעם הראשונה. אבא איתך.'];
/* real rewards from dad: what she can buy with candies; dad approves each one when it happens */
const REWARDS_DEF = [{ t: 'ממתק לבחירתי', p: 80 }, { t: 'חצי שעה מסך נוסף', p: 120 }, { t: 'אבא עושה איתי אימון אקרובטיקה', p: 120 }, { t: 'גלידה עם אבא', p: 150 }, { t: 'ערב סרט שאני בוחרת', p: 200 }];
function fresh() {
  return { v: 1, start: todayStr(), lists: [JSON.parse(JSON.stringify(LIST_1104)), JSON.parse(JSON.stringify(LIST0)), JSON.parse(JSON.stringify(LIST_EXAM))], p: {}, candy: 0, candyAll: 0, days: {}, sessions: 0, tests: [], stickers: [], own: { leo: ['violet'], rib: ['pink'], acc: ['none'], pet: ['none'], mat: ['blue'], trick: ['flip'] }, leo: 'violet', rib: 'pink', acc: 'none', pet: 'none', mat: 'blue', trick: 'flip', rewards: REWARDS_DEF.slice(), vouchers: [], log: [], best: {}, dadMsgs: null, dadI: 0, sound: 1, rate: .85, pin: '', seen: { pin36: 1, sp41: 1 }, view: 'home', pv: '' };
}
function norm(o) {
  const f = fresh();
  for (const k in f) if (o[k] == null) o[k] = f[k];
  o.lists = arr(o.lists).map(l => (l.words = arr(l.words).map(w => (w.he = arr(w.he), w)), l));
  o.tests = arr(o.tests); o.stickers = arr(o.stickers); ['leo', 'rib', 'acc', 'pet', 'mat', 'trick'].forEach(k => { o.own[k] = arr(o.own[k]); if (!o.own[k].length) o.own[k] = f.own[k].slice(); }); o.rewards = arr(o.rewards); o.vouchers = arr(o.vouchers); o.log = arr(o.log);
  if (o.dadMsgs) o.dadMsgs = arr(o.dadMsgs);
  for (const k in o.p) { const q = o.p[k]; q.wr = arr(q.wr); }
  /* lists that ship with a version are added once, also to a phone that already has data */
  o.seen = o.seen || {};
  if (!o.seen.pin36) { o.seen.pin36 = 1; o.pin = ''; }   /* v36: dad chooses the parent code again (one was typed wrong) */
  /* v41: spelling gets its own progress. Start it from the old one, carefully: a word she could spell from memory starts at "write from the sound" again */
  if (!o.seen.sp41) { o.seen.sp41 = 1; for (const k in o.p) { const q = o.p[k], st = q.st || 0; if (q.sp == null) q.sp = st >= 6 ? 4 : st >= 4 ? 2 : st >= 1 ? 1 : 0; } }
  if (!o.seen.exam1123b) { o.seen.exam1123 = o.seen.exam1123b = 1; [LIST_1104, LIST_EXAM].forEach(L => { o.lists = o.lists.filter(l => l.id !== L.id || L === LIST_1104); if (!o.lists.some(l => l.id === L.id)) o.lists.push(JSON.parse(JSON.stringify(L))); }); }
  return o;
}
let S = (() => { try { const r = localStorage.getItem(KEY); if (r) return norm(JSON.parse(r)); } catch (e) { } return fresh(); })();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } if (typeof cloudSoon === 'function') cloudSoon(); }
const kOf = w => w.en.toLowerCase().trim();
const allClass = () => S.lists.filter(l => l.src === 'class');
/* the class list she prepares for now: the nearest dictation that has not passed; else the newest list */
function curList() {
  const t = todayStr(), c = allClass();
  const up = c.filter(l => l.date && l.date >= t).sort((a, b) => a.date < b.date ? -1 : 1);
  if (up.length) return up[0];
  return c.slice().sort((a, b) => (a.date || '') < (b.date || '') ? 1 : -1)[0] || c[0];
}
const listById = id => id === 'review' ? reviewList() : S.lists.find(l => l.id === id) || PACKS.find(l => l.id === id) || FAMILIES.find(l => l.id === id);
/* every list she can practise: class lists, then the bonus packs and families */
const bonusLists = () => [...PACKS, ...FAMILIES.map(f => ({ ...f, t: `${f.ch} כמו ב-${famExample(f)}`, em: '🔤' }))];
function famExample(f) { for (const l of allClass()) for (const w of l.words) if (f.test(w.en.toLowerCase())) return w.en; return f.words[0].en; }
function addCandy(n, why) { if (!n) return; S.candy = Math.max(0, (S.candy || 0) + n); if (n > 0) S.candyAll = (S.candyAll || 0) + n; }
function markDay(n = 1) { const t = todayStr(); S.days[t] = (S.days[t] || 0) + n; }
function streak() { let n = 0, d = todayStr(); if (!S.days[d]) d = addDays(d, -1); while (S.days[d]) { n++; d = addDays(d, -1); } return n; }
function dadLine(hard) { const l = (S.dadMsgs && S.dadMsgs.length) ? S.dadMsgs : hard ? DAD_HARD : DAD_DEF; S.dadI = ((S.dadI || 0) + 1) % l.length; return l[S.dadI]; }

/* ---------- tracking: a short log of what she does, for the usage report (kept to the last 500 events) ----------
   kinds: open, s (practice session), q (quit a session), t (mock test), g (game), buy, vf (dad's voice did not play), rec (dad recorded) */
function track(k, d) { (S.log = S.log || []).push(Object.assign({ t: Date.now(), k }, d || {})); if (S.log.length > 500) S.log = S.log.slice(-500); }

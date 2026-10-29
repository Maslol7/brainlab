const nm = () => ME.name;
const unlocked = () => Math.min(TOTAL, dayDiff(S.start, todayStr()) + 1);
const nextDay = () => { for (let k = 1; k <= TOTAL; k++) if (!S.missions[k]) return k; return null; };
const curWorld = () => worldOf(nextDay() || TOTAL);
const doneCount = s => Object.keys(s.missions).length;
const bossWins = s => Object.entries(s.missions).filter(([k, m]) => isBoss(+k) && m.c / m.n >= .7).length;
const rankOf = xp => { let r = RANKS[0], nx = null; for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i][0]) { r = RANKS[i]; nx = RANKS[i + 1] || null; } return { r, nx, pct: nx ? Math.round((xp - r[0]) / (nx[0] - r[0]) * 100) : 100 }; };
function curStreak() { if (!S.lastDone) return 0; const g = dayDiff(S.lastDone, todayStr()); if (g <= 1) return S.streak; return S.freezes >= g - 1 ? S.streak : 0; }
const baseDiff = d => d <= 14 ? 1 : d <= 35 ? 2 : d <= 60 ? 3 : 4;
function qDiffFor(cat, base) { const r = S.rat[cat] ?? base; const floor = Math.max(1, base - 1); return Math.max(floor, Math.min(4, Math.round(r + (R() - .5) * .9))); }
const starsOf = (c, n) => { const p = c / n; return p >= .9 ? 3 : p >= .7 ? 2 : p >= .4 ? 1 : 0; };
const isBday = () => todayStr().slice(5) === ME.bd || S.forceBday === todayStr();
function daysToBday() { if (!ME.bd) return 999; const t = todayStr(); const y = +t.slice(0, 4); let d = dayDiff(t, `${y}-${ME.bd}`); if (d < 0) d = dayDiff(t, `${y + 1}-${ME.bd}`); return d; }
const dueMist = () => S.mist.filter(m => m.due <= todayStr());
const worldDone = W => { let n = 0; for (let k = W.a; k <= W.b; k++) if (S.missions[k]) n++; return n; };
const SIMDAYS = { 24: 'half', 38: 'half', 52: 'half', 64: 'full', 72: 'full' };
const nodeKind = k => BOSSES[k] ? 'boss' : SIMDAYS[k] ? 'sim' : 'daily';
function startNode(k) { const t = nodeKind(k); if (t === 'sim') startMission('sim', k, null, SIMDAYS[k], true); else startMission(t, k); }
const BONUS = [['kupa', 'קופה ראשית', '90 שניות בקופה: סכומים, עודף והנחות.', 'cart', EC.fire], ['sprint', 'ספרינט חשבון', '60 שניות של חשבון בראש.', 'calc', EC.water], ['piano', 'זיכרון פסנתר', 'שמע, זכור ונגן בחזרה.', 'keys', '#A98BFF']];
const bonusToday = () => BONUS[dayDiff(S.start, todayStr()) % 3 < 0 ? 0 : dayDiff(S.start, todayStr()) % 3];
const missionToday = () => Object.values(S.missions).some(m => m.date === todayStr());
function bumpStreak(t) {
  if (S.lastDone !== t) {
    const g = S.lastDone ? dayDiff(S.lastDone, t) : 99;
    if (g === 1) S.streak++;
    else if (g > 1 && g < 99 && S.freezes >= g - 1) { S.freezes -= g - 1; S.streak++; }
    else S.streak = 1;
    S.lastDone = t;
  }
  S.best = Math.max(S.best, S.streak);
}
function bdayText() { const [m, d] = String(ME.bd).split('-').map(Number); return `${d} ב${['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'][m - 1]}`; }

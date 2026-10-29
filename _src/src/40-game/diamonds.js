const DIA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9z" fill="#8FE3FF"/><path d="M6 3h12l4 6H2z" fill="#C9F3FF"/><path d="M2 9h20M8.5 3 7 9l5 12 5-12-1.5-6M7 9l5-6 5 6" stroke="#2B86D9" stroke-width="1" fill="none" stroke-linejoin="round"/></svg>';
const diaS = (w = 16) => DIA.replace('<svg', `<svg style="width:${w}px;height:${w}px;flex:none"`);
const REWARD_IDEAS = [['ערב משחקי מחשב בלי הגבלת זמן', 10], ['בחירת ארוחת הערב', 8], ['יציאה לגלידה עם אבא', 12], ['ספר או משחק לבחירה', 25], ['כרטיס למשחק של הפועל חולון', 40], ['חולצה של ליברפול', 60]];
const DIA_RULES = ['משימה עם 3 כוכבים (90% ומעלה): 1 יהלום', 'משימה מושלמת (בלי אף טעות): עוד 1', 'ניצחון על בוס: 2 יהלומים (ו-1 נוסף מעל 90%)', 'רצף של 7, 14, 21... ימים: 2 יהלומים', 'סיום עולם שלם (15 משימות): 3 יהלומים', 'סימולציה מלאה עם 80% ומעלה: 3 (פעם בשבוע)'];
function giveDia(n, why, list) { if (!n) return; S.dia = (S.dia || 0) + n; S.diaLog.unshift({ d: todayStr(), n, why }); if (S.diaLog.length > 60) S.diaLog.pop(); list.push([n, why]); }
function awardDiamonds(c, correct, n) {
  const out = [], p = correct / n, aw = S.aw || (S.aw = {});
  if (c.kind === 'daily') { if (p >= .9) giveDia(1, `3 כוכבים במשימה ${c.day}`, out); if (correct === n) giveDia(1, `משימה ${c.day} מושלמת`, out); }
  if (c.kind === 'boss' && p >= .7) giveDia(p >= .9 ? 3 : 2, `ניצחון על ${BOSSES[c.day] ? BOSSES[c.day].n : 'בוס'}`, out);
  if (c.kind === 'daily' || c.kind === 'boss') {
    const ms7 = Math.floor(S.streak / 7) * 7; if (ms7 >= 7 && (aw.streak || 0) < ms7) { aw.streak = ms7; giveDia(2, `רצף של ${ms7} ימים`, out); }
    WORLDS.forEach(W => { if (worldDone(W) === 15 && !aw['w' + W.k]) { aw['w' + W.k] = 1; giveDia(3, `סיום ${W.n}`, out); } });
  }
  if (c.kind === 'sim' && c.size === 'full' && p >= .8) { const wk = Math.floor(dayDiff(S.start, todayStr()) / 7); if (aw.simWeek !== wk) { aw.simWeek = wk; giveDia(3, 'סימולציה מלאה ב-80% ומעלה', out); } }
  return out;
}
/* kid side: rewards in the shop */
function rewardsSection() {
  const pend = (S.vouchers || []).filter(v => v.state === 'pending'), done = (S.vouchers || []).filter(v => v.state === 'done').slice(-3).reverse();
  const head = `<div class="dia-head">${diaS(46)}<div class="grow"><div class="eyebrow">יהלומים של אבא</div><div class="dia-n">${S.dia || 0}</div><div class="muted small">נצברים רק על הצטיינות. אבא מחליף אותם בפרסים אמיתיים.</div></div></div>`;
  const list = (S.rewards || []).length ? `<div class="stack" style="gap:8px">${S.rewards.map(r => `<div class="card row reward"><div class="grow"><b>${esc(r.t)}</b><div class="muted small">${diaS(14)} ${r.p} יהלומים</div></div><button class="btn ${S.dia >= r.p ? 'btn-gold' : 'btn-ghost'}" data-ask="${r.id}" ${S.dia >= r.p ? '' : 'disabled'} style="min-height:42px;padding:8px 14px;font-size:.95rem">${S.dia >= r.p ? 'לבקש' : `חסרים ${r.p - S.dia}`}</button></div>`).join('')}</div>` : `<div class="card muted small">אבא עוד לא הגדיר פרסים. היהלומים שלך נשמרים ומחכים.</div>`;
  const pv = pend.length ? `<div class="stack" style="gap:6px">${pend.map(v => `<div class="card row small" style="padding:10px 14px;border-color:rgba(255,200,69,.5)"><span class="grow">שובר: <b>${esc(v.t)}</b></span><span style="color:var(--gold)">מחכה לאישור של אבא</span></div>`).join('')}</div>` : '';
  const dv = done.length ? `<div class="muted small">קיבלת: ${done.map(v => esc(v.t)).join(' · ')}</div>` : '';
  return `<section class="card stack dia-box">${head}${pv}${list}${dv}<details class="small muted"><summary>איך מרוויחים יהלומים?</summary><ul style="margin:6px 0 0;padding-inline-start:18px">${DIA_RULES.map(r => `<li>${r}</li>`).join('')}</ul></details></section>`;
}
function askReward(id) {
  const r = (S.rewards || []).find(x => x.id === id); if (!r || S.dia < r.p) return;
  modal(`לבקש: ${esc(r.t)}?`, `זה יעלה ${r.p} יהלומים. השובר יחכה לאישור של אבא, ואם הוא יבטל, היהלומים יחזרו אליך.`, 'לבקש', () => { S.dia -= r.p; S.vouchers.push({ id: 'v' + Date.now(), rid: r.id, t: r.t, p: r.p, date: todayStr(), state: 'pending' }); SFX.coin(); burst(60); save(); render(); });
}
/* ---------- diamonds: what they are, how to get the next one ---------- */
const diaNeed = n => Math.ceil(n * .9);
function diaGoalLine(c) {
  if (c.kind === 'daily') { const n = c.qs.length; return `${diaNeed(n)} מתוך ${n} נכונות: יהלום. בלי אף טעות: עוד יהלום.`; }
  if (c.kind === 'boss') return 'ניצחון (70%): 2 יהלומים. 90% ומעלה: 3 יהלומים.';
  if (c.kind === 'sim') { const wk = Math.floor(dayDiff(S.start, todayStr()) / 7); return (S.aw || {}).simWeek === wk ? 'כבר קיבלת השבוע יהלומים על סימולציה. עכשיו זה אימון.' : '80% ומעלה: 3 יהלומים, פעם בשבוע.'; }
  return '';
}
function diaWays() {
  const nd = nextDay(), aw = S.aw || {}, st = curStreak();
  const nb = Object.keys(BOSSES).map(Number).find(k => k >= (nd || 999) && !S.missions[k]);
  const W = curWorld(), left = 15 - worldDone(W);
  const wk = Math.floor(dayDiff(S.start, todayStr()) / 7), simDone = aw.simWeek === wk;
  return [
    ['משימה יומית', '9 מתוך 10 נכונות: יהלום. בלי אף טעות: עוד יהלום.', nd ? `הבאה: משימה ${nd}` : ''],
    ['שאלת האלוף', 'בסוף כל משימה. תשובה נכונה: יהלום.', ''],
    ['קרב בוס', 'ניצחון: 2 יהלומים. מעל 90%: 3 יהלומים.', nb ? `הבוס הבא: משימה ${nb}` : ''],
    ['רצף ימים', 'כל 7 ימים ברצף: 2 יהלומים.', st ? `עכשיו ${st} ימים. עוד ${st % 7 === 0 ? 7 : 7 - (st % 7)}.` : 'מתחילים היום.'],
    ['סיום עולם', 'כל 15 משימות של עולם: 3 יהלומים.', left > 0 ? `ב${W.n} נשארו ${left}` : ''],
    ['סימולציה מלאה', '80% ומעלה: 3 יהלומים, פעם בשבוע.', simDone ? 'השבוע כבר קיבלת' : 'השבוע עוד פתוח'],
    ...(S.noEx ? [] : [['המרה שבועית', `${EX_PRICE} מטבעות: יהלום אחד, פעם בשבוע.`, S.exWeek === weekKey() ? 'השבוע כבר המרת' : '']]),
    ['פינוק מאבא', 'אבא יכול לתת יהלומים גם על דברים אחרים.', ''],
  ];
}
function openDiaSheet() {
  S.diaHelpSeen = 1; save();
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card diasheet" style="max-width:440px;max-height:88vh;overflow:auto"><div class="dia-head">${diaS(44)}<div class="grow"><div class="eyebrow">היהלומים שלך</div><div class="dia-n">${S.dia || 0}</div></div></div>
  <p class="small" style="margin:8px 0 10px"><b>יהלומים</b> = פרסים אמיתיים מאבא. <b>מטבעות</b> = דברים בתוך המשחק.</p>
  <div class="ways">${diaWays().map(([t, d, s]) => `<div class="way"><span class="wd">${DIA}</span><div class="grow"><b>${t}</b><span>${d}</span>${s ? `<em>${s}</em>` : ''}</div></div>`).join('')}</div>
  <div class="row" style="gap:8px;margin-top:12px"><button class="btn btn-primary" data-m="shop" style="flex:1">לפרסים</button><button class="btn btn-ghost" data-m="no" style="flex:1">סגור</button></div></div>`;
  app.appendChild(m);
  m.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (e.target === m || (b && b.dataset.m === 'no')) return m.remove(); if (b && b.dataset.m === 'shop') { m.remove(); go('shop'); } });
}
/* ---------- coins: more things worth buying, and a capped weekly exchange ---------- */
const SONG_PRICE = 80, EX_PRICE = 250;
function exchangeCard() {
  if (S.noEx || S.guest) return '';
  const wk = weekKey(), used = S.exWeek === wk;
  return `<div class="card row exch">${diaS(36)}<div class="grow"><b>המרה שבועית</b><div class="muted small">${EX_PRICE} מטבעות ← יהלום אחד. פעם בשבוע.</div></div><button class="btn btn-gold" data-act="exch" style="min-height:42px;padding:6px 12px" ${used || S.coins < EX_PRICE ? 'disabled' : ''}>${used ? 'השבוע כבר' : 'להמיר'}</button></div>`;
}

const CC_KEY = 'bl-cloudcache-' + PROF.id;
const ccGet = () => { try { return JSON.parse(localStorage.getItem(CC_KEY)); } catch (e) { return null; } };
let CC_BUSY = false;
/* dad's phone: fetch the kid's cloud copy, then redraw the report and the panel */
async function refreshDadReport() {
  if (!CC_BUSY) {
    CC_BUSY = true;
    try {
      const g = await cloudGet(cloudCfg());
      if (g.data) { try { localStorage.setItem(CC_KEY, JSON.stringify(g.data)); } catch (e) { } }
      const el = document.getElementById('dadreport');
      if (el) el.innerHTML = g.err ? `${ccGet() ? reportHTML(ccGet(), true) : ''}<div class="small" style="color:var(--bad)">לא הצלחתי לעדכן: ${g.err}</div>` : g.data ? reportHTML(g.data, true) + parentExplainCard(g.data) : `<div class="card small muted">עוד אין נתונים בענן. ברגע ש${ME.name} יסיים משימה בטלפון שלו, הם יופיעו כאן.</div>`;
    } catch (e) { const el = document.getElementById('dadreport'); if (el) el.insertAdjacentHTML('beforeend', `<div class="small" style="color:var(--bad)">שגיאה בהצגת הדוח</div>`); }
    finally { CC_BUSY = false; }
  }
  const el = document.getElementById('dadpanel'); if (el) { el.innerHTML = dadPanel(normCloud(ccGet() || {}), PNODE || {}); bindDadPanel(); }
}
const isDadPhone = () => { const c = cloudCfg(); return c.role === 'dad' && c.url && c.code; };
/* ---------- dad's phone: panel built from the kid's cloud data + the parent node ---------- */
let PNODE = null;
function dadPanel(o, P) {
  o = o || {}; P = P || {};
  const applied = arr(o.appliedB), waitB = arr(P.bonuses).filter(b => b && !applied.includes(b.id));
  const waitN = waitB.reduce((a, b) => a + (b.n | 0), 0), dec = P.dec || {};
  const pend = arr(o.vouchers).filter(v => v.state === 'pending');
  const rewards = P.rv ? arr(P.rewards) : arr(o.rewards);
  const msgs = P.mv ? arr(P.dadMsgs) : (arr(o.dadMsgs).length ? arr(o.dadMsgs) : DAD_DEF);
  const noEx = P.exv ? !!P.noEx : !!o.noEx;
  const sync = waitB.length || pend.some(v => dec[v.id]) || (P.rv && P.rv !== o.prv) ? `<div class="small" style="color:var(--gold)">יש שינויים שיגיעו לטלפון של ${ME.name} בפעם הבאה שהאפליקציה תיפתח אצלו.</div>` : '';
  return `<section class="card stack" style="gap:10px" data-nog><div class="dia-head">${diaS(40)}<div class="grow"><div class="eyebrow">יתרה של ${ME.name}</div><div class="dia-n">${(o.dia || 0) + waitN}</div></div></div>${sync}
    ${!rewards.length ? `<div class="small" style="color:var(--gold)">עוד לא הגדרת פרסים. בלי פרסים, ל${ME.name} אין על מה להשתמש ביהלומים. כדאי להוסיף 3-4 פרסים למטה.</div>` : ''}
    <div class="eyebrow">פינוק ידני</div><input class="txt" id="dbwhy" maxlength="40" placeholder="סיבה (לא חובה), למשל: עזר בבית"><div class="chips"><button class="chip" data-dbonus="1">+1</button><button class="chip" data-dbonus="3">+3</button><button class="chip" data-dbonus="5">+5</button><button class="chip" data-dbonus="-1">−1</button></div></section>
  <section data-nog><div class="sec-h"><h3>שוברים לאישור</h3></div>${pend.length ? `<div class="stack" style="gap:8px">${pend.map(v => `<div class="card row"><div class="grow"><b>${esc(v.t)}</b><div class="muted small">${v.p} יהלומים · ${String(v.date || '').split('-').reverse().join('.')}</div></div>${dec[v.id] ? `<span class="small muted">${dec[v.id] === 'ok' ? 'אושר' : 'בוטל'}, ממתין לסנכרון</span>` : `<button class="chip" data-dvok="${v.id}">מימשנו</button><button class="chip" data-dvno="${v.id}">ביטול</button>`}</div>`).join('')}</div>` : '<div class="card small muted">אין שוברים פתוחים.</div>'}</section>
  <section class="card row" data-nog><div class="grow"><b>המרה שבועית של מטבעות ליהלום</b><div class="muted small">${EX_PRICE} מטבעות ← יהלום, פעם בשבוע</div></div><button class="toggle ${noEx ? '' : 'on'}" data-act="dextoggle" aria-label="המרה"></button></section>
  <section data-nog><div class="sec-h"><h3>הפרסים</h3><span class="muted small">${ME.name} רואה אותם בחנות</span></div><div class="stack" style="gap:8px">
    ${rewards.map(r => `<div class="card row"><div class="grow"><b>${esc(r.t)}</b><div class="muted small">${r.p} יהלומים</div></div><button class="chip" data-drdel="${r.id}">מחק</button></div>`).join('')}
    <div class="card stack" style="gap:8px"><b>פרס חדש</b><input class="txt" id="drname" maxlength="40" placeholder="שם הפרס"><div class="row"><input class="txt" id="drprice" type="number" min="1" max="999" placeholder="מחיר ביהלומים" style="flex:1"><button class="btn btn-primary" data-act="dradd" style="min-height:44px">הוסף</button></div>
    <div class="muted small">רעיונות (לחיצה ממלאת):</div><div class="chips">${REWARD_IDEAS.map(([t, p], i) => `<button class="chip" data-didea="${i}">${t} · ${p}</button>`).join('')}</div></div></div></section>
  <section class="card tip" data-nog><h4>איך ${ME.name} מרוויח יהלומים</h4><ul>${DIA_RULES.map(r => `<li>${r}</li>`).join('')}</ul></section>
  ${bugsSection(o.bugs, false)}
  <section data-nog><div class="sec-h"><h3>היסטוריה</h3></div><div class="card small">${arr(o.diaLog).slice(0, 12).map(l => `<div class="row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--edge)"><span>${esc(l.why)}</span><span>${l.n > 0 ? '+' : ''}${l.n || ''} · ${String(l.d).split('-').reverse().join('.')}</span></div>`).join('') || '<span class="muted">עוד אין.</span>'}</div></section>
  <section class="card stack" style="gap:8px" data-nog><h4 style="font-size:1.15rem">הודעות מאבא</h4><p class="small muted" style="margin:0">מופיעות מדי פעם בטלפון של ${ME.name}. שורה לכל הודעה.</p><textarea class="txt" id="ddadmsgs" style="width:100%;height:120px;line-height:1.6">${msgs.map(esc).join('\n')}</textarea><button class="btn btn-primary" data-act="ddadsave" style="min-height:44px">שמור</button></section>`;
}
async function refreshDadPanel() {
  const el = document.getElementById('dadpanel'); if (!el) return;
  const g = await pGet(cloudCfg()); if (g.data) PNODE = g.data;
  const el2 = document.getElementById('dadpanel'); if (!el2) return;
  el2.innerHTML = dadPanel(normCloud(ccGet() || {}), PNODE || {}); bindDadPanel();
}
async function pEdit(fn, msg) {
  const c = cloudCfg(), g = await pGet(c); if (g.err) return toast('אין חיבור לענן. נסה שוב.');
  const P = g.data || {}; fn(P); P.at = new Date().toISOString();
  if (!(await pPut(c, P))) return toast('השמירה בענן נכשלה.');
  PNODE = P; if (msg) toast(msg); const el = document.getElementById('dadpanel'); if (el) { el.innerHTML = dadPanel(normCloud(ccGet() || {}), PNODE); bindDadPanel(); }
}
function bindDadPanel() {
  const el = document.getElementById('dadpanel'); if (!el) return;
  el.querySelectorAll('[data-dbonus]').forEach(b => b.onclick = () => { const n = +b.dataset.dbonus, why = (document.getElementById('dbwhy').value || '').trim(); pEdit(P => { P.bonuses = arr(P.bonuses).concat({ id: 'b' + Date.now(), n, why, d: todayStr() }); }, n > 0 ? `נשלחו ${n} יהלומים` : 'עודכן'); });
  el.querySelectorAll('[data-dvok]').forEach(b => b.onclick = () => pEdit(P => { P.dec = Object.assign({}, P.dec, { [b.dataset.dvok]: 'ok' }); }, 'אושר'));
  el.querySelectorAll('[data-dvno]').forEach(b => b.onclick = () => pEdit(P => { P.dec = Object.assign({}, P.dec, { [b.dataset.dvno]: 'no' }); }, 'בוטל, היהלומים יחזרו'));
  const baseRewards = P => P.rv ? arr(P.rewards) : arr((ccGet() || {}).rewards);
  el.querySelectorAll('[data-drdel]').forEach(b => b.onclick = () => pEdit(P => { P.rewards = baseRewards(P).filter(r => r.id !== b.dataset.drdel); P.rv = Date.now(); }));
  el.querySelectorAll('[data-didea]').forEach(b => b.onclick = () => { const [t, p] = REWARD_IDEAS[+b.dataset.didea]; document.getElementById('drname').value = t; document.getElementById('drprice').value = p; });
  const add = el.querySelector('[data-act="dradd"]'); if (add) add.onclick = () => { const t = document.getElementById('drname').value.trim().replace(/[<>]/g, ''), p = parseInt(document.getElementById('drprice').value); if (!t || !(p > 0)) return toast('צריך שם ומחיר'); pEdit(P => { P.rewards = baseRewards(P).concat({ id: 'r' + Date.now(), t, p }); P.rv = Date.now(); }, 'הפרס נוסף'); };
  const ms = el.querySelector('[data-act="ddadsave"]'); if (ms) ms.onclick = () => { const v = (document.getElementById('ddadmsgs').value || '').split('\n').map(s => s.trim().replace(/[<>]/g, '')).filter(Boolean).slice(0, 30); pEdit(P => { P.dadMsgs = v; P.mv = Date.now(); }, 'נשמר'); };
  const t = el.querySelector('[data-act="dextoggle"]'); if (t) t.onclick = () => { const cur = t.classList.contains('on'); pEdit(P => { P.noEx = cur; P.exv = Date.now(); }, cur ? 'ההמרה כבויה' : 'ההמרה פעילה'); };
}

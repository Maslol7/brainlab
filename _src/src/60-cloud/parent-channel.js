/* The kid's phone owns the state and writes it. Dad's phone writes only to a side node (<code>-p):
   rewards list, bonuses, voucher decisions, dad's notes. The kid's phone reads it and applies it. */
const pPath = c => `${c.url.replace(/\/+$/, '')}/brainlab/${c.code}-p.json`;
async function pGet(c) { try { const r = await fetch(pPath(c) + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return { err: 'שגיאה ' + r.status }; return { data: (await r.json()) || {} }; } catch (e) { return { err: 'אין חיבור' }; } }
async function pPut(c, P) { try { const r = await fetch(pPath(c), { method: 'PUT', body: JSON.stringify(P) }); return r.ok; } catch (e) { return false; } }
/* ---------- kid's phone: pull and apply ---------- */
let P_LAST = 0, P_BUSY = false;
async function pullParent(force) {
  const c = cloudCfg(); if (c.role !== 'kid' || !c.url || !c.code || isSbx() || P_BUSY) return;
  if (!force && Date.now() - P_LAST < 30000) return;
  P_BUSY = true; P_LAST = Date.now();
  try {
    const g = await pGet(c); if (!g.data) return;
    const P = g.data, msgs = []; let ch = false;
    S.appliedB = S.appliedB || [];
    arr(P.bonuses).forEach(b => { if (!b || !b.id || S.appliedB.includes(b.id)) return; S.appliedB.push(b.id); const n = Math.max(-(S.dia || 0), b.n | 0); if (n) { giveDia(n, b.why || (n > 0 ? 'פינוק מאבא' : 'תיקון של אבא'), []); if (n > 0) msgs.push(`אבא שלח לך ${n} ${n === 1 ? 'יהלום' : 'יהלומים'}${b.why ? ': ' + esc(b.why) : '!'}`); } ch = true; });
    const dec = P.dec || {};
    (S.vouchers || []).forEach(v => { if (v.state !== 'pending' || !dec[v.id]) return; if (dec[v.id] === 'ok') { v.state = 'done'; v.done = todayStr(); S.diaLog.unshift({ d: todayStr(), n: 0, why: `מומש: ${v.t}` }); msgs.push(`אבא אישר: ${esc(v.t)}`); } else { v.state = 'cancel'; S.dia += v.p; S.diaLog.unshift({ d: todayStr(), n: v.p, why: `בוטל והוחזר: ${v.t}` }); } ch = true; });
    if (P.rv && P.rv !== S.prv) { S.rewards = arr(P.rewards); S.prv = P.rv; ch = true; }
    if (P.exv && P.exv !== S.pexv) { S.noEx = !!P.noEx; S.pexv = P.exv; ch = true; }
    if (P.mv && P.mv !== S.pmv) { S.dadMsgs = arr(P.dadMsgs); S.pmv = P.mv; ch = true; }
    if (ch) { save(); if (['home', 'shop', 'stats', 'arcade'].includes(S.view) && !document.querySelector('.modal') && !(typeof G !== 'undefined' && G)) render(); }
    if (msgs.length) toast(msgs.join('<br>'), 5000);
  } finally { P_BUSY = false; }
}

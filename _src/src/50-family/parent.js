/* parent area */
let PARENT_OK = false;
/* Parent area. Behind a 4-digit PIN. On dad's own phone it shows the kid's cloud data and sends changes
   through the parent channel; on the kid's phone it edits the local state directly. */
function viewParent() {
  if (isSbx()) PARENT_OK = true;
  if (!S.pin) return `<div class="stack"><div class="sec-h"><h3>אזור הורים</h3></div><div class="card stack"><p style="margin:0">בחר קוד הורים של 4 ספרות. הקוד מגן על אישור הפרסים ועל הוספת יהלומים. אל תשכח אותו: אין דרך לשחזר אותו.</p><input class="pin" id="pin1" type="password" inputmode="numeric" maxlength="4" placeholder="קוד"><input class="pin" id="pin2" type="password" inputmode="numeric" maxlength="4" placeholder="שוב, לאימות"><p class="small" id="pinmsg" style="margin:0;color:var(--bad)"></p><button class="btn btn-primary" data-act="pinset">שמור קוד</button><button class="btn btn-ghost" data-go="stats">חזרה</button></div></div>`;
  if (!PARENT_OK) return `<div class="stack"><div class="sec-h"><h3>אזור הורים</h3></div><div class="card stack"><p style="margin:0">הזן את קוד ההורים.</p><input class="pin" id="pin1" type="password" inputmode="numeric" maxlength="4" placeholder="קוד"><p class="small" id="pinmsg" style="margin:0;color:var(--bad)"></p><button class="btn btn-primary" data-act="pinin">כניסה</button><button class="btn btn-ghost" data-go="stats">חזרה</button></div></div>`;
  const dadPhone = isDadPhone() && !isSbx();
  let report, panel;
  if (dadPhone) {
    const cached = ccGet();
    report = `<div id="dadreport">${cached ? reportHTML(normCloud(cached), true) + parentExplainCard(cached) : `<div class="card small muted">טוען את ההתקדמות של ${ME.name}...</div>`}</div>`;
    panel = `<div id="dadpanel">${dadPanel(normCloud(ccGet() || {}), PNODE || {})}</div>`;
    setTimeout(refreshDadReport, 30); setTimeout(refreshDadPanel, 40);
  } else {
    report = reportHTML(S, false) + parentExplainCard();
    panel = localParentPanel();
  }
  return `<div class="stack"><div class="sec-h"><h3>אזור הורים</h3><button class="chip" data-act="pout">יציאה</button></div>${report}
  ${panel}
  ${cloudSection()}
  ${backupSection()}
  ${isSbx() ? '' : `<section class="card stack" style="gap:8px"><h4 style="font-size:1.15rem">מצב בדיקה</h4><p class="small muted" style="margin:0">משחק בעותק נפרד של האפליקציה: כל המשימות פתוחות, ואפשר לקפוץ לכל יום, לתת מטבעות ולבדוק פרסים. הנתונים של ${ME.name} לא משתנים. קיצור נסתר: 5 לחיצות מהירות על "ימים למבחן" במסך הבית.</p><button class="btn btn-gold" data-act="sbxenter">כניסה למצב בדיקה</button></section>`}
  ${isSbx() ? '' : `<button class="btn btn-ghost btn-wide" data-act="reset" style="color:var(--bad);min-height:44px">איפוס ההתקדמות של ${ME.name}</button>`}
  ${isSbx() ? '' : profileSection()}<button class="btn btn-ghost btn-wide" data-act="pout">יציאה מאזור הורים</button></div>`;
}
function bindExtra() {
  app.querySelectorAll('[data-reveal]').forEach(b => b.onclick = () => { const a = b.parentElement.querySelector('.ja'); if (a) { a.hidden = false; b.remove(); SFX.combo(); } });
  app.querySelectorAll('[data-ask]').forEach(b => b.onclick = () => askReward(b.dataset.ask));
  const on = (a, fn) => { const e = app.querySelector(`[data-act="${a}"]`); if (e) e.onclick = fn; };
  const msg = t => { const m = document.getElementById('pinmsg'); if (m) m.textContent = t; };
  on('pinset', () => { const a = document.getElementById('pin1').value, b = document.getElementById('pin2').value; if (!/^\d{4}$/.test(a)) return msg('צריך בדיוק 4 ספרות.'); if (a !== b) return msg('הקודים לא זהים.'); S.pin = a; PARENT_OK = true; save(); render(); });
  on('pinin', () => { if (document.getElementById('pin1').value === S.pin) { PARENT_OK = true; render(); } else { msg('קוד לא נכון.'); buzz(80); } });
  const pin1 = document.getElementById('pin1'); if (pin1 && S.pin && !PARENT_OK) pin1.onkeydown = e => { if (e.key === 'Enter') app.querySelector('[data-act="pinin"]').click(); };
  on('pout', () => { PARENT_OK = false; go('stats'); });
  on('radd', () => { const t = document.getElementById('rname').value.trim(), p = parseInt(document.getElementById('rprice').value); if (!t || !(p > 0)) return; S.rewards.push({ id: 'r' + Date.now(), t, p }); save(); render(); });
  app.querySelectorAll('[data-idea]').forEach(b => b.onclick = () => { const [t, p] = REWARD_IDEAS[+b.dataset.idea]; document.getElementById('rname').value = t; document.getElementById('rprice').value = p; });
  app.querySelectorAll('[data-rdel]').forEach(b => b.onclick = () => { S.rewards = S.rewards.filter(r => r.id !== b.dataset.rdel); save(); render(); });
  app.querySelectorAll('[data-bonus]').forEach(b => b.onclick = () => { const n = +b.dataset.bonus, why = (document.getElementById('bwhy').value || '').trim() || (n > 0 ? 'פינוק מאבא' : 'תיקון של אבא'); if (n < 0 && (S.dia || 0) < -n) return; giveDia(n, why, []); save(); render(); });
  app.querySelectorAll('[data-vok]').forEach(b => b.onclick = () => { const v = S.vouchers.find(x => x.id === b.dataset.vok); if (v) { v.state = 'done'; v.done = todayStr(); S.diaLog.unshift({ d: todayStr(), n: 0, why: `מומש: ${v.t}` }); save(); render(); } });
  app.querySelectorAll('[data-vno]').forEach(b => b.onclick = () => { const v = S.vouchers.find(x => x.id === b.dataset.vno); if (v) { v.state = 'cancel'; S.dia += v.p; S.diaLog.unshift({ d: todayStr(), n: v.p, why: `בוטל והוחזר: ${v.t}` }); save(); render(); } });
}
/* diamonds, vouchers, prizes and dad's notes, edited on the kid's own phone */
function localParentPanel() {
  const pend = (S.vouchers || []).filter(v => v.state === 'pending');
  const totals = Object.keys(CATS).reduce((a, k) => { const s = S.stats[k] || { c: 0, t: 0 }; a.c += s.c; a.t += s.t; return a; }, { c: 0, t: 0 });
  return `<section class="card stack" style="gap:10px"><div class="dia-head">${diaS(40)}<div class="grow"><div class="eyebrow">יתרה של ${ME.name}</div><div class="dia-n">${S.dia || 0}</div></div></div>
    <div class="muted small">${doneCount(S)} משימות · ${totals.t ? Math.round(totals.c / totals.t * 100) : 0}% הצלחה · רצף נוכחי ${curStreak()} · ${bossWins(S)} בוסים</div>
    <div class="eyebrow">פינוק ידני</div><input class="txt" id="bwhy" maxlength="40" placeholder="סיבה (לא חובה), למשל: עזר בבית"><div class="chips"><button class="chip" data-bonus="1">+1</button><button class="chip" data-bonus="3">+3</button><button class="chip" data-bonus="5">+5</button><button class="chip" data-bonus="-1">−1</button></div></section>
  <section><div class="sec-h"><h3>שוברים לאישור</h3></div>${pend.length ? `<div class="stack" style="gap:8px">${pend.map(v => `<div class="card row"><div class="grow"><b>${esc(v.t)}</b><div class="muted small">${v.p} יהלומים · ${v.date.split('-').reverse().join('.')}</div></div><button class="chip" data-vok="${v.id}" style="border-color:var(--good);color:var(--good)">אשר</button><button class="chip" data-vno="${v.id}">בטל</button></div>`).join('')}</div>` : '<div class="card muted small">אין שוברים שמחכים.</div>'}</section>
  <section><div class="sec-h"><h3>הפרסים</h3><span class="muted small">${ME.name} רואה אותם בחנות</span></div><div class="stack" style="gap:8px">
    ${(S.rewards || []).map(r => `<div class="card row"><div class="grow"><b>${esc(r.t)}</b><div class="muted small">${r.p} יהלומים</div></div><button class="chip" data-rdel="${r.id}">מחק</button></div>`).join('')}
    <div class="card stack" style="gap:8px"><b>פרס חדש</b><input class="txt" id="rname" maxlength="40" placeholder="שם הפרס"><div class="row"><input class="txt" id="rprice" type="number" min="1" max="999" placeholder="מחיר ביהלומים" style="flex:1"><button class="btn btn-primary" data-act="radd" style="min-height:44px">הוסף</button></div>
    <div class="muted small">רעיונות (לחיצה ממלאת):</div><div class="chips">${REWARD_IDEAS.map(([t, p], i) => `<button class="chip" data-idea="${i}">${t} · ${p}</button>`).join('')}</div></div></div></section>
  ${isSbx() ? '' : `<section class="card row" data-nog><div class="grow"><b>המרה שבועית של מטבעות ליהלום</b><div class="muted small">${EX_PRICE} מטבעות ← יהלום, פעם בשבוע</div></div><button class="toggle ${S.noEx ? '' : 'on'}" data-act="extoggle" aria-label="המרה"></button></section>`}
  <section class="card tip"><h4>איך ${ME.name} מרוויח יהלומים</h4><ul>${DIA_RULES.map(r => `<li>${r}</li>`).join('')}</ul><p class="small muted" style="margin-top:8px">בקצב הצטיינות טוב זה בערך 5-8 יהלומים בשבוע. כדאי לתמחר פרס גדול כך שיידרשו 3-4 שבועות של עבודה רצינית.</p></section>
  <section><div class="sec-h"><h3>היסטוריה</h3></div><div class="card small">${(S.diaLog || []).slice(0, 15).map(l => `<div class="row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--edge)"><span>${esc(l.why)}</span><span style="color:${l.n > 0 ? 'var(--good)' : 'var(--bad)'}">${l.n === 0 ? '✓' : (l.n > 0 ? '+' : '') + l.n} · ${l.d.slice(5).split('-').reverse().join('.')}</span></div>`).join('') || '<span class="muted">עוד אין.</span>'}</div></section>
  ${bugsSection(S.bugs, true)}
  ${isSbx() ? '' : dadMsgSection()}`;
}

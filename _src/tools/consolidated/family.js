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
// @module 50-family/parent.js
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
  ${isSbx() ? '' : dadMsgSection()}`;
}
/* The status report, for the parent area and for dad's phone (o = local state or cloud copy). */
function reportHTML(o, fromCloud) {
  const t = todayStr(), M = o.missions || {}, days = Object.keys(M).map(Number).sort((a, b) => a - b);
  const he = PROF.g === 'f' ? { him: 'איתה', ask: 'אותה', said: 'מה היא אמרה', expl: 'הסבירה' } : { him: 'איתו', ask: 'אותו', said: 'מה הוא אמר', expl: 'הסביר' };
  const done = days.length, since = Math.max(1, dayDiff(o.start, t) + 1), expected = Math.min(TOTAL, since);
  const behind = expected - done, toExam = o.exam ? dayDiff(t, o.exam) : null;
  const active = new Set(Object.values(M).map(m => m.date));
  const dots = Array.from({ length: 14 }, (_, i) => { const d = addDays(t, i - 13); return `<i class="${active.has(d) ? 'on' : ''}" title="${d}"></i>`; }).join('');
  const act7 = Array.from({ length: 7 }, (_, i) => addDays(t, -i)).filter(d => active.has(d)).length;
  const gap = o.lastDone ? dayDiff(o.lastDone, t) : null, streak = gap != null && gap <= 1 ? (o.streak || 0) : 0;
  const acc = arr => { const s = arr.reduce((a, d) => ({ c: a.c + M[d].c, n: a.n + M[d].n }), { c: 0, n: 0 }); return s.n ? s.c / s.n : null; };
  const last5 = acc(days.slice(-5)), prev5 = acc(days.slice(-10, -5));
  const st = o.stats || {}, tm = o.times || {}, hd = o.hard || {};
  const tot = Object.values(st).reduce((a, s) => ({ c: a.c + s.c, t: a.t + s.t }), { c: 0, t: 0 });
  const tt = Object.values(tm).reduce((a, x) => ({ s: a.s + x.s, n: a.n + x.n }), { s: 0, n: 0 }), spd = tt.n ? Math.round(tt.s / tt.n) : null;
  const ch = Object.keys(CHAPNAME).map(k => { const cats = Object.keys(CHAPKEY).filter(c => CHAPKEY[c] === k); const s = cats.reduce((a, c) => { const x = st[c]; return x ? { c: a.c + x.c, t: a.t + x.t } : a; }, { c: 0, t: 0 }); const h = hd[k]; return { k, n: CHAPNAME[k], p: s.t ? Math.round(s.c / s.t * 100) : null, t: s.t, hp: h && h.t >= 5 ? Math.round(h.c / h.t * 100) : null }; });
  const rr = rushRate(o), rushy = rr > .15 || (spd && spd < 15 && tt.n >= 20);
  const weak = ch.filter(x => x.t >= 8 && x.p != null).sort((a, b) => a.p - b.p)[0];
  const due = (o.mist || []).filter(m => m.due <= t).length;
  const pct = v => v == null ? '–' : Math.round(v * 100) + '%';
  let verdict, vcls;
  if (!done) { verdict = 'עוד לא התחיל.'; vcls = 'mid'; }
  else if (rushy && (gap == null || gap < 3)) { verdict = behind <= 1 ? 'מתמיד, אבל עונה מהר מדי.' : `מאחור ב-${behind} משימות, ועונה מהר מדי.`; vcls = 'mid'; }
  else if (gap != null && gap >= 3) { verdict = `לא התאמן ${gap} ימים.`; vcls = 'bad'; }
  else if (behind <= 1) { verdict = 'בקצב של המסע.'; vcls = 'ok'; }
  else { verdict = `מאחור ב-${behind} משימות.`; vcls = behind > 4 ? 'bad' : 'mid'; }
  const rec = [];
  if (rushy) rec.push(`עונה מהר מדי${rr ? ` (${Math.round(rr * 100)}% מהתשובות לפני שאפשר לקרוא את השאלה)` : ` (${spd} שניות לשאלה)`}. זה ניחוש, לא פתרון. האפליקציה עוברת למצב חשיבה, וכדאי גם לדבר ${he.him}.`);
  if (done && since >= 7 && act7 < 4) rec.push('להתאמן ביותר ימים. 4-5 ימים בשבוע מספיקים, ושעה קבועה עוזרת.');
  if (weak && weak.p < 65) rec.push(`לחזק את ${weak.n} (${weak.p}%): התקדמות ← נתונים ← תרגול לפי נושא.`);
  if (spd && spd > 75) rec.push(`קצב: ${spd} שניות לשאלה, והיעד הוא 60. ספרינט חשבון וסימולציות עוזרים.`);
  if (due >= 8) rec.push(`${due} שאלות מחכות במחברת הטעויות. כדאי לסגור אותן לפני חומר חדש.`);
  if (last5 != null && prev5 != null && last5 < prev5 - .1) rec.push(`הדיוק ירד לאחרונה. אולי עייפות, או שהרמה עלתה מהר. שווה לשאול ${he.ask}.`);
  if (!rec.length && done) rec.push('הכל נראה טוב. להמשיך באותו קצב, ולפרגן על ההתמדה.');
  const R = (() => { const per = ch.map(x => { const h = hd[x.k]; if (!h || h.t < 5) return null; const cats = Object.keys(CHAPKEY).filter(c => CHAPKEY[c] === x.k); let ts = 0, tn = 0; cats.forEach(c => { const q = tm[c]; if (q) { ts += q.s; tn += q.n; } }); return Math.round(h.c / h.t * Math.min(1, 60 / (tn ? ts / tn : 60)) * 100); }).filter(v => v != null); return per.length >= 3 ? Math.round(per.reduce((a, b) => a + b, 0) / per.length) : null; })();
  /* road to gifted */
  let road = '';
  try { const J = journey(normCloud(o)); const s = J.st[J.cur]; road = `<div class="small roadline">הדרך למחוננים: <b>שלב ${Math.min(J.cur + 1, 5)} מתוך 5${s ? ` (${s.n}: ${s.now})` : ' (הושלם)'}</b></div>`; } catch (e) { }
  /* family lines: moods, explain-to-dad, duo, morning vs afternoon, bonus missions */
  const more = [], MV = Object.values(M).filter(Boolean);
  const md = (o.moods || []).slice(-3); if (md.length) more.push(`${he.said} אחרי משימות: ${md.map(x => `${(MOODS.find(m => m[0] === x.m) || [, esc(String(x.m))])[1]}${x.acc != null ? ` (${x.acc}%)` : ''}`).join(' · ')}`);
  if (o.explainLog) more.push(`${he.expl} לאבא השבוע: ${o.explainLog.filter(d => dayDiff(d, t) < 7).length} פעמים`);
  if (o.duoLog && o.duoLog.length) more.push(`אתגר עם אבא: ${o.duoLog.length} פעמים (אחרון ${o.duoLog[o.duoLog.length - 1].split('-').reverse().join('.')})`);
  const mor = MV.filter(m => m.h != null && m.h < 9), lat = MV.filter(m => m.h != null && m.h >= 12);
  const ac = a => Math.round(a.reduce((x, m) => x + m.c, 0) / a.reduce((x, m) => x + m.n, 0) * 100);
  if (mor.length >= 2 && lat.length >= 2) more.push(`דיוק בבוקר ${ac(mor)}% לעומת אחר הצהריים ${ac(lat)}%`);
  const xn = (o.xtraLog ? (Array.isArray(o.xtraLog) ? o.xtraLog : Object.values(o.xtraLog)) : []).filter(d => d && dayDiff(d, t) < 7).length;
  return `<section class="card stack report" style="gap:12px" data-nog>
  <div class="row" style="justify-content:space-between;align-items:baseline"><h4 style="font-size:1.15rem;margin:0">דוח מצב</h4><span class="small muted">${fromCloud && o._at ? 'מהענן · ' + agoTxt(Date.parse(o._at)) : 'נכון לעכשיו'}</span></div>
  ${road}<div class="verdict ${vcls}">${verdict}</div>
  <div class="rgrid">
    <div><b>${done}/${TOTAL}</b><span>משימות (צפוי ${expected})</span></div>
    <div><b>${act7}/7</b><span>ימי אימון השבוע</span></div>
    <div><b>${streak}</b><span>רצף נוכחי (שיא ${o.best || 0})</span></div>
    <div><b>${tot.t ? Math.round(tot.c / tot.t * 100) + '%' : '–'}</b><span>דיוק כללי</span></div>
    <div><b>${pct(last5)}</b><span>דיוק ב-5 האחרונות${prev5 != null ? ` (לפני: ${pct(prev5)})` : ''}</span></div>
    <div class="${rushy ? 'warn' : ''}"><b>${spd ? spd + ' שנ׳' : '–'}</b><span>לשאלה${rr ? ` · חפוזות ${Math.round(rr * 100)}%` : ''}</span></div>
  </div>
  <div><div class="small muted" style="margin-bottom:4px">14 הימים האחרונים</div><div class="days14">${dots}</div></div>
  <div class="bars">${ch.map(x => `<div class="bar ${x.p != null && x.t >= 8 && x.p < 65 ? 'weak' : ''}"><div class="rw"><span>${x.n}</span><span>${x.p == null ? 'אין נתונים' : x.p + '%'}${x.hp != null ? ` · קשות ${x.hp}%` : ''}</span></div><div class="track"><i style="width:${x.p || 0}%"></i></div></div>`).join('')}</div>
  <div class="small">מוכנות (הערכה, לא ציון רשמי): <b>${R == null ? 'עוד אין מספיק שאלות קשות' : R + (R >= 75 ? ' · אזור מחוננים' : R >= 55 ? ' · אזור מצטיינים' : ' · בדרך')}</b></div>
  <div class="small">מחברת טעויות: ${(o.mist || []).length} פתוחות${due ? ` (${due} לחזרה היום)` : ''} · ${o.fixed || 0} תוקנו${toExam != null && toExam >= 0 ? ` · ${toExam} ימים למבחן` : ''}</div>
  ${rec.length ? `<div class="recs"><div class="eyebrow">מה כדאי לעשות</div>${rec.slice(0, 3).map(r => `<p>${r}</p>`).join('')}</div>` : ''}
  ${more.length ? `<div class="small rmore">${more.map(l => `<div>${l}</div>`).join('')}</div>` : ''}${xn ? `<div class="small">משימות בונוס השבוע: <b>${xn}</b> (מעבר למשימה היומית)</div>` : ''}
  </section>`;
}
function viewerHTML(o) { return reportHTML(normCloud(o), true); }
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
  <section data-nog><div class="sec-h"><h3>היסטוריה</h3></div><div class="card small">${arr(o.diaLog).slice(0, 12).map(l => `<div class="row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--edge)"><span>${esc(l.why)}</span><span>${l.n > 0 ? '+' : ''}${l.n || ''} · ${String(l.d).split('-').reverse().join('.')}</span></div>`).join('') || '<span class="muted">עוד אין.</span>'}</div></section>
  <section class="card stack" style="gap:8px" data-nog><h4 style="font-size:1.15rem">הודעות מאבא</h4><p class="small muted" style="margin:0">מופיעות מדי פעם בטלפון של ${ME.name}. שורה לכל הודעה.</p><textarea class="txt" id="ddadmsgs" style="width:100%;height:120px;line-height:1.6">${msgs.map(esc).join('\n')}</textarea><button class="btn btn-primary" data-act="ddadsave" style="min-height:44px">שמור</button></section>`;
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

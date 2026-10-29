function viewerHTML(o) { return reportHTML(normCloud(o), true); }
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

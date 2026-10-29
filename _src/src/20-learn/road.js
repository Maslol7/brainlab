/* readiness estimate (not an official measure) */
function readiness() {
  const keys = Object.keys(CHAPNAME), out = {};
  keys.forEach(k => {
    const h = (S.hard || {})[k]; if (!h || h.t < 5) { out[k] = null; return; }
    const cats = Object.keys(CHAPKEY).filter(c => CHAPKEY[c] === k); let ts = 0, tn = 0; cats.forEach(c => { const t = S.times[c]; if (t) { ts += t.s; tn += t.n; } });
    const avg = tn ? ts / tn : 60; out[k] = Math.round(h.c / h.t * Math.min(1, 60 / avg) * 100);
  });
  const vals = Object.values(out).filter(v => v != null);
  return { per: out, total: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null, cover: vals.length };
}
function readinessCard() {
  const R0 = readiness();
  const zone = v => v >= 75 ? 'אזור מחוננים' : v >= 55 ? 'אזור מצטיינים' : 'בדרך';
  const gauge = R0.total == null ? `<p class="muted small" style="margin:0">צריך לפחות 5 שאלות ברמה 3 ומעלה בכמה פרקים כדי שתופיע הערכה. זה יגיע אחרי כמה משימות.</p>`
    : `<div class="gauge"><div class="gz"><span style="flex:55">בדרך</span><span style="flex:20">מצטיינים</span><span style="flex:25">מחוננים</span></div><div class="gt"><i style="width:${R0.total}%"></i><b style="left:calc(${R0.total}% - 18px)">${R0.total}</b></div></div><p style="margin:8px 0 0;font-weight:600">${zone(R0.total)}${R0.cover < 6 ? ` <span class="muted small">(לפי ${R0.cover} מתוך 6 פרקים)</span>` : ''}</p>
    <div class="chips" style="margin-top:8px">${Object.entries(R0.per).map(([k, v]) => `<span class="chip ${v != null && v < 55 ? 'hot' : ''}">${CHAPNAME[k]}: ${v == null ? '–' : v}</span>`).join('')}</div>`;
  return `<section class="card tip"><h4>מוכנות למחוננים</h4>${gauge}<p class="small muted" style="margin-top:8px">ההערכה מחושבת רק מהשאלות הקשות (רמה 3 ומעלה): אחוז ההצלחה כפול הקצב ביחס לדקה לשאלה. זו הערכה שלנו ולא מדד רשמי. במבחן האמיתי הסף יחסי: משווים לשאר התלמידים בשנתון.</p></section>`;
}
/* ---------- the road: 5 clear stages, each with a concrete next step ---------- */
function chapRat(o, k) { const cats = Object.keys(CHAPKEY).filter(c => CHAPKEY[c] === k); const v = cats.map(c => (o.rat || {})[c] ?? 1); return v.reduce((a, b) => a + b, 0) / v.length; }
function readinessOf(o) {
  const per = Object.keys(CHAPNAME).map(k => { const h = (o.hard || {})[k]; if (!h || h.t < 5) return null; const cats = Object.keys(CHAPKEY).filter(c => CHAPKEY[c] === k); let ts = 0, tn = 0; cats.forEach(c => { const t = (o.times || {})[c]; if (t) { ts += t.s; tn += t.n; } }); return Math.round(h.c / h.t * Math.min(1, 60 / (tn ? ts / tn : 60)) * 100); }).filter(v => v != null);
  return per.length >= 3 ? Math.round(per.reduce((a, b) => a + b, 0) / per.length) : null;
}
function journey(o = S) {
  const rh = o.rh || [], calm = rh.slice(-20).filter(v => !v).length;
  const ms = Object.values(o.missions || {}).filter(Boolean).sort((a, b) => a.date < b.date ? -1 : 1).slice(-4);
  const good = ms.filter(m => m.c / m.n >= .7).length;
  const chs = Object.keys(CHAPNAME).map(k => ({ k, n: CHAPNAME[k], r: chapRat(o, k) }));
  const lv2 = chs.filter(c => c.r >= 2).length, weakest = chs.slice().sort((a, b) => a.r - b.r)[0];
  const hd = Object.values(o.hard || {}).reduce((a, h) => ({ c: a.c + h.c, t: a.t + h.t }), { c: 0, t: 0 });
  const R0 = readinessOf(o);
  const st = [
    { n: 'עוצר וחושב', d: 'עונה רק אחרי שקרא והבין.', ok: rh.length >= 12 && calm >= 16, p: Math.min(1, calm / 16), now: `${calm} מתוך 16 תשובות רגועות`, next: 'לקרוא כל שאלה עד הסוף, ולפתור בראש לפני שמסתכלים על התשובות.' },
    { n: 'דיוק יציב', d: '70% ומעלה בשתי משימות מתוך 4 האחרונות.', ok: good >= 2, p: Math.min(1, good / 2), now: `${good} מתוך 2 משימות`, next: 'במשימה הבאה: לבדוק כל תשובה פעם נוספת לפני שלוחצים.' },
    { n: 'רמה 2 בכל הפרקים', d: 'כל 6 הפרקים עולים לרמה 2. הרמה עולה לבד כשהדיוק עולה.', ok: lv2 >= 6, p: lv2 / 6, now: `${lv2} מתוך 6 פרקים`, next: `הפרק שהכי צריך חיזוק: ${weakest.n}. שיעור מודרך ושני אימונים בו יקדמו אותך הכי מהר.` },
    { n: 'שאלות קשות', d: '60% הצלחה ב-10 שאלות ברמה 3 ומעלה.', ok: hd.t >= 10 && hd.c / hd.t >= .6, p: Math.min(1, hd.t / 10) * (hd.t ? Math.min(1, hd.c / hd.t / .6) : 0), now: `${hd.t} שאלות קשות, ${hd.t ? Math.round(hd.c / hd.t * 100) : 0}% הצלחה`, next: 'לקחת את שאלת האלוף בסוף כל משימה, ולנסות קרב בוס.' },
    { n: 'אזור מחוננים', d: 'מוכנות 75 ומעלה: דיוק בשאלות הקשות, בקצב של מבחן.', ok: R0 != null && R0 >= 75, p: R0 == null ? 0 : Math.min(1, R0 / 75), now: R0 == null ? 'עוד אין מספיק נתונים' : `מוכנות ${R0} מתוך 75`, next: 'סימולציה פעם בשבוע, ושאלות קשות בכל משימה.' },
  ];
  const latched = o.ms || {};
  st.forEach((s, i) => { if (latched[i]) s.ok = true; });
  const cur = st.findIndex(s => !s.ok);
  return { st, cur: cur < 0 ? st.length : cur, toExam: o.exam ? dayDiff(todayStr(), o.exam) : null };
}
function roadMini() {
  const J = journey(); if (J.cur >= J.st.length) return `<button class="card road mini" data-road><b>הגעת לאזור המחוננים!</b><span class="small muted">עכשיו שומרים על הכושר עד המבחן.</span></button>`;
  const s = J.st[J.cur];
  return `<button class="card road mini" data-road><div class="rsteps">${J.st.map((x, i) => `<i class="${x.ok ? 'ok' : i === J.cur ? 'cur' : ''}"></i>`).join('')}</div><div class="grow"><div class="eyebrow">הדרך למחוננים · שלב ${J.cur + 1} מתוך 5</div><b>${s.n}</b><span class="small muted"> · ${s.now}</span></div><span class="chev">${IC.chev}</span></button>`;
}
function roadFull() {
  const J = journey(), left = J.st.length - J.cur, days = J.toExam;
  const pace = days == null || left === 0 ? '' : days >= left * 12 ? `נשארו ${days} ימים למבחן. כל שלב לוקח בערך שבוע או שבועיים, כלומר <b>יש מספיק זמן לכל השלבים</b>, אם ממשיכים כמעט כל יום.` : `נשארו ${days} ימים למבחן. כדי להגיע לכל השלבים בזמן, כדאי <b>משימה כל יום</b>, ועוד אימון קצר בפרק החלש.`;
  return `<section class="card road full" data-nog-road><div class="eyebrow">הדרך למחוננים</div><h3 style="margin:2px 0 4px">${J.cur >= 5 ? 'הגעת!' : `שלב ${J.cur + 1}: ${J.st[J.cur].n}`}</h3><p class="small muted" style="margin:0 0 10px">לא מתחרים באף אחד. כל שלב הוא דבר שאתה כבר יודע לעשות, רק יותר טוב.</p>
  <div class="rlist">${J.st.map((s, i) => `<div class="rs ${s.ok ? 'ok' : i === J.cur ? 'cur' : 'lock'}"><span class="rn">${s.ok ? '✓' : i + 1}</span><div class="grow"><b>${s.n}</b><div class="small muted">${s.d}</div>${i === J.cur ? `<div class="rbar"><i style="width:${Math.round(s.p * 100)}%"></i></div><div class="small">${s.now}</div><div class="rnext"><b>הצעד הבא:</b> ${s.next}</div>` : ''}</div></div>`).join('')}</div>
  ${pace ? `<p class="small" style="margin:10px 0 0">${pace}</p>` : ''}<p class="small muted" style="margin:6px 0 0">כל שלב חדש שווה יהלום.</p></section>`;
}
/* latch stages and reward them once */
function checkRoad() {
  const J = journey(); S.ms = S.ms || {}; let got = null;
  J.st.forEach((s, i) => { if (s.ok && !S.ms[i]) { S.ms[i] = todayStr(); got = s; giveDia(1, `שלב בדרך: ${s.n}`, (S.last && S.last.dia) || []); } });
  return got;
}

function viewMeTab() {
  const { r, nx, pct } = rankOf(S.xp), g = gearOn();
  const gear = GEAR.map(it => `<div class="card gear ${g[it.id] ? '' : 'off'}"><span class="gi">${avatarSVG({ gear: { [it.id]: 1 } })}</span><div class="grow"><b>${it.n}</b><span>${g[it.id] ? 'נפתח!' : 'איך פותחים: ' + it.d}</span></div>${g[it.id] ? `<span style="color:var(--good)">${IC.star.replace('<svg', '<svg style="width:22px;height:22px"')}</span>` : ''}</div>`).join('');
  const badges = `<div class="badges">${BADGES.map((b, i) => { const on = S.badges.includes(b.id); return `<div class="card badge ${on ? '' : 'off'}">${medal(on, i)}<b>${b.n}</b>${b.d}</div>`; }).join('')}</div>`;
  return `${S.guest ? '' : roadFull()}<div class="stack"><section class="card me-hero"><div class="big">${avatarSVG()}</div><h2>${nm()}</h2><div class="muted">${r[1]} · ${S.xp.toLocaleString('he-IL')} נקודות</div><div class="xpbar" style="max-width:280px;margin:10px auto 0"><i style="width:${pct}%"></i></div><div class="muted small" style="margin-top:6px">${nx ? `עוד ${nx[0] - S.xp} נק׳ לדרגת ${nx[1]}` : 'הדרגה הגבוהה ביותר!'}</div></section>
  ${elemStrip()}
  <section><div class="sec-h"><h3>ציוד</h3><span class="muted small">נפתח לבד כשמשיגים הישגים</span></div><div class="stack" style="gap:8px">${gear}</div></section>
  <section><div class="sec-h"><h3>ספר הבדיחות</h3><span class="muted small">${S.jokes || 0}/${JOKES.length} · בדיחה חדשה בכל משימה</span></div>${(S.jokes || 0) ? `<div class="card jokes">${JOKES.slice(0, S.jokes).map(([q, a]) => `<details><summary>${jokeTxt(q)}</summary><p>${jokeTxt(a)}</p></details>`).reverse().join('')}</div>` : '<div class="card muted small">הבדיחה הראשונה נפתחת אחרי המשימה הראשונה.</div>'}</section>
  <section><div class="sec-h"><h3>תגים</h3><span class="muted small">${S.badges.length}/${BADGES.length}</span></div>${badges}</section>
  ${ME.bd ? `<div class="card row">${IC.cake.replace('<svg', '<svg style="width:40px;height:40px;flex:none"')}<div class="grow">${isBday() ? '<b>היום יום ההולדת!</b>' : `<b>עוד ${daysToBday()} ימים ליום ההולדת</b><div class="muted small">${bdayText()}. מחכה שם הפתעה.</div>`}</div></div>` : ''}
  <button class="btn btn-gold btn-wide" data-share="summary">${IC.share} שתף סיכום בקבוצה של המשפחה</button>
  </div>`;
}
/* ---------- STATS ---------- */
function viewDataTab() {
  const ks = Object.keys(CATS);
  const lvlName = r => r < 1.5 ? 'בסיס' : r < 2.2 ? 'בינוני' : r < 2.8 ? 'מתקדם' : 'מומחה';
  const bars = ks.map(k => { const s = S.stats[k] || { c: 0, t: 0 }; const p = s.t ? Math.round(s.c / s.t * 100) : 0; const weak = s.t >= 6 && p < 65; const r = S.rat[k]; const t = S.times[k]; return `<div class="bar ${weak ? 'weak' : ''}"><div class="rw"><span><b>${CATS[k].n}</b>${r ? ` · ${lvlName(r)}` : ''}${weak ? ' · <b style="color:var(--bad)">לחזק</b>' : ''}</span><span>${s.t ? `${p}% · ${s.c}/${s.t}${t && t.n ? ` · ${Math.round(t.s / t.n)} שנ׳` : ''}` : 'עוד לא תורגל'}</span></div><div class="track"><i style="width:${p}%"></i></div></div>`; }).join('');
  const ds = Object.keys(S.missions).map(Number).sort((a, b) => a - b).slice(-20);
  let spark = '<p class="muted" style="margin:0">אחרי המשימה הראשונה יופיע כאן גרף.</p>';
  if (ds.length) { const W = 320, H = 120, bw = W / 20; spark = `<svg viewBox="0 0 ${W} ${H + 16}" class="spark">${[0, 50, 100].map(v => `<line class="gl" x1="0" x2="${W}" y1="${H - v / 100 * H + 2}" y2="${H - v / 100 * H + 2}"/>`).join('')}${ds.map((d, i) => { const m = S.missions[d], h = Math.max(3, m.c / m.n * H); return `<rect class="b ${isBoss(d) ? 'boss' : ''}" x="${W - (i + 1) * bw + 2}" y="${H - h + 2}" width="${bw - 4}" height="${h}" rx="2"/><text x="${W - (i + .5) * bw}" y="${H + 14}" text-anchor="middle">${d}</text>`; }).join('')}</svg><p class="muted small" style="margin:6px 0 0">אחוז הצלחה בכל משימה (סגול = בוס). הקווים: 0%, 50%, 100%.</p>`; }
  const tot = ks.reduce((a, k) => a + ((S.stats[k] || {}).t || 0), 0), cor = ks.reduce((a, k) => a + ((S.stats[k] || {}).c || 0), 0);
  const rated = ks.filter(k => (S.stats[k] || { t: 0 }).t >= 5).sort((a, b) => (S.rat[a] ?? 2) - (S.rat[b] ?? 2));
  const rec = rated.length >= 2 ? `<div class="card tip"><h4>המלצה לשבוע הזה</h4><p>להתמקד ב<b>${CATS[rated[0]].n}</b> וב<b>${CATS[rated[1]].n}</b>. המשימה היומית כבר מוסיפה מהם, ולמטה יש תרגול לפי נושא.</p></div>` : '';
  return `<div class="stack">
  <section class="stats3"><div class="card stat"><div class="big">${tot}</div><div class="lbl">שאלות נפתרו</div></div><div class="card stat"><div class="big">${tot ? Math.round(cor / tot * 100) : 0}%</div><div class="lbl">הצלחה כללית</div></div><div class="card stat"><div class="big">${S.mist.length}</div><div class="lbl">במחברת הטעויות</div></div></section>
  ${readinessCard()}
  ${rec}
  <section><div class="sec-h"><h3>לפי תחום</h3><span class="muted small">הצלחה · זמן ממוצע</span></div><div class="card bars">${bars}</div></section>
  <section><div class="sec-h"><h3>משימות אחרונות</h3></div><div class="card">${spark}</div></section>
</div>`;
}
function viewRulesTab() {
  return `<section><div class="sec-h"><h3>שיעורים מודרכים</h3><span class="muted small">דוגמה, צעד אחרי צעד</span></div><div class="chips">${Object.entries(SHAPE_KEYS).map(([k, n]) => `<button class="chip" data-guidetab="${k}">${n}</button>`).join('')}</div></section><div class="stack">${lessonsSection()}
  <section class="card tip" style="border-color:var(--acc)"><h4>איך המסע עובד</h4><ul>
  <li><b>5 עולמות:</b> אוויר, מים, אדמה, אש, ובסוף עולם האלוף ברמת מחוננים. 15 משימות בכל עולם, ובכל עולם צבעי האפליקציה משתנים.</li>
  <li><b>משימה יומית:</b> 10 שאלות מכל התחומים. אחת תמיד מהתחום הכי חלש, ועד 2 מהמחברת.</li>
  <li><b>קרבות בוס:</b> כל 7 ימים. 15 שאלות ב-20 דקות. כל תשובה נכונה פוגעת בבוס.</li>
  <li><b>רמה שמתאימה את עצמה:</b> מצליח? השאלות בתחום נהיות קשות יותר. מתקשה? קלות יותר.</li>
  <li><b>מחברת הטעויות:</b> כל טעות חוזרת אחרי יום, ואז אחרי 3 ימים. ככה המוח באמת זוכר.</li>
  <li><b>ציוד:</b> סרט, אוזניות, כפפות, מדליה וכתר נפתחים לבד כשמשיגים הישגים.</li></ul></section>
  <section class="card tip"><h4>טריקים לפי פרק</h4>${Object.keys(CATS).map(k => `<details class="tipd"><summary>${CATS[k].n}</summary><p>${CATS[k].tip}</p></details>`).join('')}</section>
  <section class="card tip"><h4>איך נראה המבחן האמיתי</h4><ul><li>מבחן ממוחשב של כ-90 דקות, בינואר.</li><li>6 פרקים: הקשר מילולי, סדרות, אנלוגיות, היגיון, חשבון וצורות. 10-15 שאלות בכל פרק.</li><li>בערך דקה לשאלה. כל שאלה בפרק שווה אותו דבר.</li><li>חלק מהשאלות בלי אפשרויות: מקלידים או גוררים תשובה.</li><li>המבחן יחסי: משווים לשאר התלמידים בשנתון. מחוננים הם האחוזים הבודדים העליונים, מצטיינים הם השכבה שאחריהם.</li></ul></section>
  <section class="card tip"><h4>אסטרטגיה ליום המבחן</h4><ol>
  <li>קרא את כל התשובות לפני שאתה בוחר.</li>
  <li>תקוע יותר מדקה וחצי? דלג וחזור בסוף. כל שאלה שווה אותו דבר.</li>
  <li>לא בטוח? פסול קודם את מה שבטוח לא נכון. מ-4 אפשרויות ל-2 זה פי 2 סיכוי.</li>
  <li>בבעיות חשבון, הצב את התשובה בחזרה בשאלה ובדוק.</li>
  <li>שינה טובה בלילה שלפני שווה יותר משעה של תרגול נוסף.</li></ol></section></div>`;
}
const PT = [['me', 'אני'], ['data', 'נתונים'], ['rules', 'כללים'], ['set', 'הגדרות']];
function viewMe() { S.ptab = 'me'; return viewStats(); }
function viewTips() { S.ptab = 'rules'; return viewStats(); }
function viewStats() {
  const t = S.ptab || 'me';
  const seg = `<div class="seg">${PT.map(([k, n]) => `<button data-ptab="${k}" class="${t === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  let body;
  if (t === 'me') body = viewMeTab() + friendCard();
  else if (t === 'data') { const weak = Object.keys(CATS).filter(k => (S.rat[k] ?? 9) < 1.8 && (S.stats[k] || { t: 0 }).t >= 5); body = `${viewDataTab()}<section><div class="sec-h"><h3>תרגול לפי נושא</h3><span class="muted small">6 שאלות</span></div><div class="chips">${Object.keys(CATS).map(k => `<button class="chip ${weak.includes(k) ? 'hot' : ''}" data-practice="${k}">${CATS[k].n}</button>`).join('')}</div></section>`; }
  else if (t === 'rules') body = viewRulesTab();
  else body = `<section class="card stack" style="gap:14px">
    <button class="btn btn-ghost" data-go="parent">אזור הורים</button>
    <div class="field"><span>גרסה ${APP_VER}</span><button class="chip" data-act="chkupd">בדיקת עדכונים</button></div>
    <div class="field"><span>צלילים</span><button class="toggle ${S.sound ? 'on' : ''}" data-act="sound" aria-label="צלילים"></button></div>
    <label class="field" for="exam"><span>תאריך המבחן</span><input type="date" id="exam" value="${S.exam}"></label>
    <p class="muted small" style="margin:0">המסע התחיל ב-${S.start.split('-').reverse().join('.')}.</p></section>`;
  return `<div class="stack">${hud()}${seg}${body}</div>`;
}

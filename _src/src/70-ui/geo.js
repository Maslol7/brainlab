/* ---------- geometry practice: a screen of its own (S.view 'geo'), opened from the arcade ----------
   startGeo(topic): a practice mission through the usual quiz flow (results, mistakes notebook, explanations, lessons).
     topic: 'angle' | 'area' | 'circle' | 'volume' (or a lesson key such as 'geoArea'); none = 10 mixed questions.
   startGeoLesson(topic): the short lesson (guide + 3 questions) of one topic.
   viewGeo() / renderGeo(): the screen with the 4 topics and the last results. geoTile(): the tile for the arcade.
   Not part of the daily mission or the journey. */
const GEO_DESC = { angle: 'צמודות, קודקודיות, משולש ומרובע, זווית בחוץ', area: 'מלבן, משולש, מקבילית, טרפז וצורות מורכבות', circle: 'רדיוס וקוטר, היקף ושטח, חצי עיגול וטבעת', volume: 'תיבה וקובייה, נפח, שטח פנים ופריסות' };
const GEO_TC = { angle: 'var(--water)', area: 'var(--good)', circle: 'var(--gold)', volume: 'var(--violet)' };
const GEO_ICON = {
  angle: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 33H35M6 33L28 9"/><path d="M17 33A11 11 0 0 0 13.5 25" stroke-width="2.4"/></svg>',
  area: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M5 33H35L24 8Z" fill="currentColor" fill-opacity=".22"/><path d="M24 8V33" stroke-width="2.2" stroke-dasharray="3 3"/></svg>',
  circle: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3"><circle cx="20" cy="20" r="14" fill="currentColor" fill-opacity=".2"/><path d="M20 20L31 12" stroke-width="2.4"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg>',
  volume: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"><path d="M6 15H26V35H6Z" fill="currentColor" fill-opacity=".2"/><path d="M6 15L14 7H34L26 15M26 35L34 27V7"/></svg>',
};
/* a lesson for a geometry key draws its questions from GEN.geo: the key must know its category before the first answer */
function geoSeed() { if (!S) return; for (const k of Object.values(GEO_LK)) { const st = lkStat(k); if (!st.cat) st.cat = 'geo'; } }
/* the last geometry practice goes into S.geoLog (finish() keeps the topic in S.last.size) */
function geoLog() {
  const L0 = S.last; if (!L0 || L0.geoLogged || !L0.n) return;
  const t = L0.kind === 'practice' && L0.cat === 'geo' ? L0.size || 'mix' : L0.kind === 'lesson' && L0.lesson && GEO_TOPIC[L0.lesson.key] ? GEO_TOPIC[L0.lesson.key] : null;
  if (!t) return;
  L0.geoLogged = 1; S.geoLog = (S.geoLog || []).concat({ t, c: L0.correct, n: L0.n, at: todayStr(), ls: L0.kind === 'lesson' ? 1 : 0 }).slice(-20);
}
const geoLevel = () => S.geoLv || Math.max(1, Math.min(3, Math.round(S.rat.geo ?? 1.3)));
function startGeo(topic) {
  if (S.cur) return modal('יש משימה פתוחה', 'קודם סיים את המשימה שהתחלת, או צא ממנה.', 'להמשיך במשימה', () => go('quiz'));
  if (topic && !GEO_POOL[topic]) topic = GEO_TOPIC[topic] || null;
  geoSeed(); geoLog();
  if (S.rat.geo == null) S.rat.geo = 1.3;
  const n = topic ? 8 : 10, d0 = geoLevel(), ts = topic ? Array(n).fill(topic) : shuffle(GEO_TOPICS.concat(GEO_TOPICS, shuffle(GEO_TOPICS).slice(0, 2)));
  const qs = [], seen = new Set();
  ts.forEach((t, i) => {
    const d = i < 2 ? Math.max(1, d0 - 1) : d0, last = qs.slice(-2).map(q => q.meta.kind); let q;
    for (let k = 0; k < 15; k++) { q = genGeo(d, t); if (!seen.has(strip(q.prompt) + q.meta.kind) && (k > 8 || !last.includes(q.meta.kind))) break; }
    seen.add(strip(q.prompt) + q.meta.kind); qs.push(q);
  });
  startMission('practice', nextDay() || TOTAL, 'geo', topic || 'mix', false, qs);
}
function startGeoLesson(topic) {
  const key = GEO_LK[topic] || topic; if (!GEO_TOPIC[key]) return;
  geoSeed(); if (S.rat.geo == null) S.rat.geo = 1.3;
  startLesson(key);
}
function geoTopicCard(t) {
  const key = GEO_LK[t], st = (S.lk || {})[key] || { r: '' }, r = (st.r || '').slice(-8), ok = (r.match(/o/g) || []).length;
  const last = (S.geoLog || []).filter(x => x.t === t && !x.ls).slice(-1)[0];
  const dots = r ? `<span class="geo-dots" aria-label="${ok} מתוך ${r.length} נכון בפעם הראשונה">${[...r].map(c => `<i class="${c}"></i>`).join('')}</span><span>${ok}/${r.length}</span>` : '<span>עוד לא תרגלת</span>';
  return `<div class="geo-t" style="--tc:${GEO_TC[t]}"><div class="gti">${GEO_ICON[t]}<h4>${GEO_NAME[t]}</h4></div><p class="gtd">${GEO_DESC[t]}</p>
  <div class="gres">${dots}${st.learned ? '<span style="color:var(--good)">· למדת בשיעור</span>' : ''}</div>${last ? `<div class="gres">אימון אחרון: <b style="color:var(--ink)">${last.c}/${last.n}</b></div>` : ''}
  <div class="row"><button class="btn btn-primary" data-geo="${t}">תרגול</button><button class="btn btn-ghost" data-geolearn="${t}">שיעור</button></div></div>`;
}
function viewGeo() {
  geoSeed(); geoLog();
  const lv = S.geoLv || 0, auto = Math.max(1, Math.min(3, Math.round(S.rat.geo ?? 1.3)));
  const log = (S.geoLog || []).slice(-5).reverse(), dt = s => String(s).split('-').reverse().slice(0, 2).join('.');
  return `<div class="stack">${hud()}
  <div class="geo-top"><button class="icon-btn" data-go="arcade" aria-label="חזרה לארקייד">${IC.x}</button><div class="grow"><h2>גאומטריה</h2><p>החומר של כיתה ו׳: ציור ברור לכל שאלה, והסבר מלא לכל טעות.</p></div></div>
  <section class="card geo-mix"><div class="grow"><h4>תרגול מעורב</h4><p>10 שאלות מכל ארבעת הנושאים</p></div><button class="btn btn-primary" data-geo="mix" style="min-height:48px;padding:10px 18px">יאללה</button></section>
  <div class="geo-grid">${GEO_TOPICS.map(geoTopicCard).join('')}</div>
  <section class="card"><div class="geo-lv"><b class="small" style="margin-inline-end:4px">רמה:</b>${[[0, `אוטומטית (${auto})`], [1, 'קל'], [2, 'בינוני'], [3, 'מאתגר']].map(([k, n]) => `<button class="chip ${lv === k ? 'on' : ''}" data-geolv="${k}">${n}</button>`).join('')}</div>
  <p class="small muted" style="margin:8px 0 0">בכל אימון 8 שאלות מהנושא. השאלה הראשונה והשנייה קלות יותר. כל טעות נכנסת למחברת הטעויות.</p></section>
  ${log.length ? `<section class="card"><div class="eyebrow" style="margin-bottom:6px">אימונים אחרונים</div><div class="geo-log">${log.map(x => `<div><span>${x.ls ? 'שיעור: ' : ''}${x.t === 'mix' ? 'תרגול מעורב' : GEO_NAME[x.t]}</span><span><b>${x.c}/${x.n}</b> · ${dt(x.at)}</span></div>`).join('')}</div></section>` : ''}
</div>`;
}
function renderGeo() {
  app.innerHTML = viewGeo() + nav('arcade');
  bind();
  app.querySelectorAll('[data-geo]').forEach(b => b.onclick = () => startGeo(b.dataset.geo === 'mix' ? null : b.dataset.geo));
  app.querySelectorAll('[data-geolearn]').forEach(b => b.onclick = () => { if (S.cur) return modal('יש משימה פתוחה', 'קודם סיים את המשימה שהתחלת, או צא ממנה.', 'להמשיך במשימה', () => go('quiz')); startGeoLesson(b.dataset.geolearn); });
  app.querySelectorAll('[data-geolv]').forEach(b => b.onclick = () => { S.geoLv = +b.dataset.geolv || 0; SFX.tap(); save(); renderGeo(); });
}
/* the arcade tile: ${geoTile()} inside .tiles */
function geoTile() {
  geoLog(); const L0 = (S.geoLog || []).filter(x => !x.ls).slice(-1)[0];
  return `<button class="tile wide" style="--tc:var(--good)" data-go="geo"><span class="ti">${GEO_ICON.area}</span><div class="grow"><h4>גאומטריה</h4><p>זוויות, שטח והיקף, מעגל, גופים ונפח. כמו בכיתה, עם ציור והסבר לכל שאלה.</p></div><span class="best">${L0 ? `${L0.c}/${L0.n}` : 'חדש'}</span></button>`;
}
geoSeed();

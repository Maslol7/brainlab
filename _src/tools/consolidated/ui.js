function go(view) { S.view = view; save(); render(); window.scrollTo(0, 0); if (view === 'shop' || view === 'home') pullParent(); }
/* draw the current screen; if a screen throws, fall back to home instead of a white page */
function render() {
  try { return renderView(); }
  catch (e) {
    console.error('render failed', e);
    try { S.cur = null; S.view = 'home'; save(); return renderView(); }
    catch (e2) { app.innerHTML = `<div class="card stack" style="margin-top:20px"><b>משהו השתבש</b><p class="small muted">${esc(String(e2 && e2.message || e2))}</p><button class="btn btn-primary" onclick="location.reload()">לטעון מחדש</button></div>`; }
  }
}
// @module 70-ui/shell.js
function renderView() {
  if (S.view !== 'quiz') stopMG();
  if (S.view === 'songs') {
    if (SL) return renderSongOnly();
    clearTimers(); applyTheme(); sbxBadge(); applyGuest();
    app.innerHTML = viewSongs() + nav('arcade'); bind(); bindSongs(); return;
  }
  stopLoop(); applyGuest();
  clearTimers(); applyTheme(); sbxBadge();
  if (S.view === 'quiz') { if (S.cur) return renderQuiz(); S.view = 'home'; }
  if (S.view === 'sprint') return renderSprint();
  if (S.view === 'kupa') return renderKupa();
  if (S.view === 'piano') return renderPiano();
  const v = S.view;
  const views = { home: viewHome, arcade: viewArcade, shop: viewShop, stats: viewStats, tips: viewTips, result: viewResult, me: viewMe, parent: viewParent };
  app.innerHTML = (views[v] || viewHome)() + nav(v);
  bind();
}
function nav(v) {
  v = { me: 'stats', tips: 'stats', parent: 'stats', result: 'home' }[v] || v;
  const it = [['home', 'מסע', IC.home, 0], ['arcade', 'משחקים', IC.game, 0], ['stats', 'התקדמות', IC.chart, 0], ['shop', 'חנות', IC.shop, 0]];
  return `<nav class="nav four"><div class="in">${it.map(([k, n, ic, dot]) => `<button data-go="${k}" class="${v === k ? 'on' : ''}">${ic}${n}${dot ? '<span class="dot"></span>' : ''}</button>`).join('')}</div></nav>`;
}
function daysToBday() { if (!ME.bd) return 999; const t = todayStr(); const y = +t.slice(0, 4); let d = dayDiff(t, `${y}-${ME.bd}`); if (d < 0) d = dayDiff(t, `${y + 1}-${ME.bd}`); return d; }
function avatarSVG(o = {}) {
  const g = o.gear || gearOn(), el = o.el || curWorld().k, ec = EC[el] || EC.air;
  const sk = '#F6D5BF', sk2 = '#E5B293', hr = '#5B3A22', hr2 = '#82593A', sh = '#D7263D', sh2 = '#A51B2F';
  let s = `<svg viewBox="0 0 120 120" aria-hidden="true">`;
  if (g.phones) s += `<path d="M29 58 C29 18 91 18 91 58" stroke="#1E2238" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M13 124 C15 100 28 91 44 88 L60 96 L76 88 C92 91 105 100 107 124Z" fill="${sh}"/>`;
  s += `<path d="M13 124 C15 104 23 96 33 92 C30 104 30 114 32 124Z" fill="${sh2}"/><path d="M107 124 C105 104 97 96 87 92 C90 104 90 114 88 124Z" fill="${sh2}" opacity=".6"/>`;
  s += `<path d="M46 89 L60 100 L74 89" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<circle cx="76" cy="108" r="8" fill="${ec}"/><g transform="translate(70.2 102.2) scale(.48)" style="color:#0A0F24">${elemPaths(el)}</g>`;
  s += `<path d="M52 74 h16 v14 l-8 8 l-8 -8z" fill="${sk2}"/>`;
  s += `<circle cx="35.5" cy="57" r="5.6" fill="${sk}"/><circle cx="84.5" cy="57" r="5.6" fill="${sk}"/><circle cx="35.5" cy="57" r="2.4" fill="${sk2}"/><circle cx="84.5" cy="57" r="2.4" fill="${sk2}"/>`;
  s += `<ellipse cx="60" cy="55" rx="24.5" ry="26.5" fill="${sk}"/>`;
  s += `<path d="M33.5 56 C26 29 42 15 62 16.5 C84 17.5 94 33 86.5 57 C84.5 47 80 41 75 37.5 C72.5 45 64 48 54.5 46 C48.5 45 45.5 41 44 37.5 C39.5 42.5 36 49 33.5 56Z" fill="${hr}"/>`;
  s += `<path d="M50 20 l2 -9 l5.5 7.5 l4 -9 l3.5 9.5 l5.5 -5.5 l0 8.5" fill="${hr}"/><path d="M46 28 C54 22 68 22 77 29" stroke="${hr2}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M40 44 C42 38 46 35 50 34" stroke="${hr2}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += `<path d="M45.5 49.5 q5.5 -3.4 11 -.5 M63.5 49 q5.5 -2.9 11 .5" stroke="${hr}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="51" cy="58" r="3" fill="#1A1B22"/><circle cx="69" cy="58" r="3" fill="#1A1B22"/><circle cx="52.1" cy="56.9" r="1" fill="#fff"/><circle cx="70.1" cy="56.9" r="1" fill="#fff"/>`;
  s += `<circle cx="44" cy="67" r="3.6" fill="#F08A8A" opacity=".35"/><circle cx="76" cy="67" r="3.6" fill="#F08A8A" opacity=".35"/>`;
  s += `<path d="M58.5 63 q1.5 2 3 0" stroke="${sk2}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M52.5 69 q7.5 5.5 15 -1.5" stroke="#8A3F2E" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<g fill="rgba(255,255,255,.14)" stroke="#20222B" stroke-width="2.3"><circle cx="51" cy="58" r="7.5"/><circle cx="69" cy="58" r="7.5"/></g><path d="M58.5 58 h3 M43.5 57 l-6.5 -2 M76.5 57 l6.5 -2" stroke="#20222B" stroke-width="2.3" stroke-linecap="round"/><path d="M46.2 54.3 l2.6 -1.8 M64.2 54.3 l2.6 -1.8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>`;
  if (g.band) s += `<path d="M36 41 C48 35 72 35 84 41 L84 47 C72 41 48 41 36 47Z" fill="#fff"/><path d="M36 43.5 C48 37.5 72 37.5 84 43.5" stroke="${sh}" stroke-width="2"/>`;
  if (g.phones) s += `<rect x="24" y="47" width="12" height="20" rx="6" fill="${ec}" stroke="#1E2238" stroke-width="2"/><rect x="84" y="47" width="12" height="20" rx="6" fill="${ec}" stroke="#1E2238" stroke-width="2"/>`;
  if (g.crown) s += `<path d="M40 25 L44 7 L52 19 L60 3 L68 19 L76 7 L80 25Z" fill="#FFC845" stroke="#B88A12" stroke-width="1.6" stroke-linejoin="round"/>${['air', 'water', 'earth', 'fire'].map((k, i) => `<circle cx="${47 + i * 8.7}" cy="20" r="2.6" fill="${EC[k]}"/>`).join('')}`;
  if (g.medal) s += `<path d="M51 89 L58 104 M69 89 L62 104" stroke="#53A8FF" stroke-width="4.5"/><circle cx="60" cy="108" r="7" fill="#FFC845" stroke="#B88A12" stroke-width="1.5"/><path d="m60 104.5 1.1 2.2 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z" fill="#B88A12"/>`;
  if (g.gloves) s += `<g stroke="#5E0A16" stroke-width="1.6"><rect x="16" y="94" width="21" height="22" rx="9.5" fill="#D7263D"/><rect x="83" y="94" width="21" height="22" rx="9.5" fill="#D7263D"/></g><g fill="#fff"><rect x="18" y="110" width="17" height="5" rx="2"/><rect x="85" y="110" width="17" height="5" rx="2"/></g>`;
  s += '</svg>';
  if (PROF.id === 'romi' && !S.guest) s = romiLook(s);
  if (S.guest && !S.accOn) return s;
  const on = S.accOn || {};
  const add = ['star', 'scarf', 'shades', 'cap', 'ball'].filter(k => on[k] && !(k === 'ball' && g.gloves) && !(k === 'cap' && (g.crown || g.phones))).map(k => ACC_SVG[k]).join('');
  return add ? s.replace(/<\/svg>$/, add + '</svg>') : s;
}
// @module 70-ui/art.js
/* Romi: long blonde hair, blue eyes, a bow, no glasses */
function romiLook(s) {
  s = s.split('#5B3A22').join('#D9A93E').split('#82593A').join('#F4D88A');
  s = s.replace(/<path d="M50 20 l2 -9[^>]*>/, '');
  s = s.replace(/<g fill="rgba\(255,255,255,\.14\)" stroke="#20222B"[\s\S]*?<\/g><path d="M58\.5 58 h3[^>]*>/, '');
  const eye = (x) => `<circle cx="${x}" cy="58" r="3.6" fill="#3B82E0"/><circle cx="${x}" cy="58" r="1.7" fill="#14213D"/><circle cx="${x + 1.2}" cy="56.8" r="1" fill="#fff"/>`;
  s = s.replace('<circle cx="51" cy="58" r="3" fill="#1A1B22"/><circle cx="69" cy="58" r="3" fill="#1A1B22"/><circle cx="52.1" cy="56.9" r="1" fill="#fff"/><circle cx="70.1" cy="56.9" r="1" fill="#fff"/>', eye(51) + eye(69) + '<path d="M46 53.5 l-2 -1.6 M74 53.5 l2 -1.6" stroke="#8A6A2A" stroke-width="1.3" stroke-linecap="round"/>');
  const back = `<path d="M30 58 C25 30 41 14 60 14 C80 14 95 30 90 58 C93 76 93 92 87 100 C83 92 80 86 78 80 L42 80 C40 86 37 92 33 100 C27 92 27 76 30 58Z" fill="#D9A93E"/><path d="M33 70 C31 82 32 92 35 98 M87 70 C89 82 88 92 85 98" stroke="#F4D88A" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s = s.replace('<path d="M52 74 h16', back + '<path d="M52 74 h16');
  return s.replace('</svg>', '<g transform="translate(78 30) rotate(20)"><path d="M0 0 l-7 -5 v10z M0 0 l7 -5 v10z" fill="#FF7AA8"/><circle r="2.4" fill="#E0457F"/></g></svg>');
}
function renderIntro(c) {
  const W = worldOf(c.day);
  let title, body, extra, icon;
  if (c.kind === 'daily') { const M = MODS[c.mod] || MODS.classic; title = `משימה ${c.day}: ${M.n}`; body = briefFor(c.day); extra = M.d; icon = elemIcon(W.k); }
  else if (c.kind === 'boss') { const B = BOSSES[c.day]; title = B.n; body = `"${B.line}"`; extra = '15 שאלות, 20 דקות. ניצחון = 70%. אין רמזים, אבל אפשר לדלג ולחזור.'; icon = bossSVG(B); }
  else { const per = c.chapters[0].mins; title = (c.path ? `משימה ${c.day}: ` : '') + (c.size === 'full' ? 'סימולציה מלאה' : 'חצי סימולציה'); body = `6 פרקים, בדיוק כמו במבחן האמיתי. בכל פרק ${per} שאלות ו-${per} דקות, כלומר דקה לשאלה. כשהזמן של פרק נגמר עוברים לפרק הבא, ואי אפשר לחזור אחורה.`; extra = c.chapters.map((ch, i) => `${i + 1}. ${ch.n}`).join('<br>'); icon = IC.clock; }
  const goal = diaGoalLine(c);
  app.innerHTML = `<div class="stack"><div class="card intro-card ${c.kind === 'boss' ? 'boss' : ''}" style="--wc:${EC[W.k]}"><span class="ii">${icon}</span><div class="eyebrow">${c.kind === 'sim' ? 'כמו ביום המבחן' : W.n}</div><h2>${title}</h2><p class="brief">${body}</p><div class="mod">${extra}</div>
  ${goal ? `<button class="diagoal" data-act="diasheet">${DIA}<span>${goal}</span></button>` : ''}<button class="btn ${c.kind === 'boss' ? 'btn-boss' : 'btn-primary'} btn-wide" data-act="go">${c.kind === 'boss' ? 'לקרב!' : 'יאללה!'}</button><button class="btn btn-ghost btn-wide" data-act="quitintro">לא עכשיו</button></div></div>`;
  bind();
}
function renderQuiz() {
  const c = S.cur;
  clearTimeout(THINK_T);
  /* a double tap on "next" must not land on the hint or on an answer of the new question */
  const key = c ? `${c.i}|${!!c.res[c.i]}|${!!c.intro}|${!!c.chBreak}|${c.champ || ''}` : '';
  if (key !== TAP_KEY) { TAP_KEY = key; TAP_LOCK = Date.now() + 380; }
  /* boss half-time: a mini-game after half of the questions */
  if (c.kind === 'boss' && !c.intro && !c.mg && S.view === 'quiz' && c.res.filter(Boolean).length >= Math.ceil(c.qs.length / 2)) { c.mg = 1; save(); return renderBossGame(c); }
  clearTimers();
  c.lock = false;
  if (c.intro) return renderIntro(c);
  if (c.chBreak) {
    const ch = c.chapters[c.ch], nx = c.chapters[c.ch + 1]; let ans = 0; for (let k = ch.s; k <= ch.e; k++) if (c.res[k]) ans++;
    app.innerHTML = `<div class="stack"><div class="card intro-card"><span class="ii">${IC.clock}</span><div class="eyebrow">פרק ${c.ch + 1} מתוך ${c.chapters.length} הסתיים</div><h2>${ch.n}</h2><p class="brief">ענית על ${ans} מתוך ${ch.e - ch.s + 1} שאלות. התוצאות יופיעו בסוף.</p><div class="mod">הפרק הבא: <b>${nx.n}</b> · ${nx.mins} דקות. אפשר לנשום רגע. השעון יתחיל כשתלחץ.</div><button class="btn btn-primary btn-wide" data-act="nextch">לפרק הבא</button></div></div>`;
    return bind();
  }
  if (c.champ === 'offer') {
    app.innerHTML = `<div class="stack"><div class="card intro-card champ"><span class="ii">${IC.star}</span><div class="eyebrow">בונוס</div><h2>שאלת האלוף</h2><p class="brief">שאלה אחת ברמה הכי גבוהה, הרמה של מחוננים. תשובה נכונה = יהלום של אבא. טעות לא מורידה כלום.</p><button class="btn btn-gold btn-wide" data-act="champyes">קבל את האתגר</button><button class="btn btn-ghost btn-wide" data-act="champno">לא היום</button></div></div>`;
    return bind();
  }
  const q = c.qs[c.i], r = c.res[c.i];
  const answered = !!r && !deferred(c.kind);
  const [rs, re] = range(c);
  const dots = c.qs.slice(rs, re + 1).map((_, j) => { const i = rs + j, x = c.res[i]; return `<i class="${i === c.i && !x ? 'cur' : x ? (c.kind === 'sim' ? 'ans' : x.ok ? 'ok' : 'no') : ''}"></i>`; }).join('');
  const L8 = ['א', 'ב', 'ג', 'ד', 'ה'];
  let body;
  if (q.type === 'order') {
    const pk = c.ord || [];
    body = answered ? `<div class="ord-res">${q.correct.map((ix, j) => `<div class="ord-slot ${r.val && r.val[j] === ix ? 'ok' : 'no'}"><b>${j + 1}</b><span>${q.items[ix]}</span></div>`).join('')}</div>`
      : `<div class="ord"><div class="ord-slots">${q.items.map((_, j) => `<button class="ord-slot ${pk[j] != null ? 'full' : ''}" data-oslot="${j}"><b>${j + 1}</b><span>${pk[j] != null ? q.items[pk[j]] : ''}</span></button>`).join('')}</div><div class="ord-pool">${q.items.map((it, ix) => pk.includes(ix) ? '' : `<button class="ord-item" data-oitem="${ix}">${it}</button>`).join('')}</div><button class="btn btn-primary btn-wide" data-act="ocheck" ${pk.length === q.items.length ? '' : 'disabled'} style="margin-top:10px">בדיקה</button></div>`;
  } else if (q.type === 'num') {
    body = answered ? `<div class="typed-res ${r.ok ? 'ok' : 'no'}">התשובה שלך: <b>${L(esc(r.val))}</b>${q.unit || ''}${r.ok ? '' : ` · הנכונה: <b>${L(fmt(q.ansv))}</b>${q.unit || ''}`}</div>`
      : `<div class="typed"><div class="tin-row"><div class="sprint-in" id="tin">${c.tin || '&nbsp;'}</div>${q.unit ? `<span class="unit">${q.unit}</span>` : ''}</div><div class="keypad" dir="ltr">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button data-tk="${k}">${k}</button>`).join('')}<button data-tk=".">.</button><button data-tk="0">0</button><button data-tk="del" class="k-alt">מחק</button></div><button class="btn btn-primary btn-wide" data-act="tcheck" style="margin-top:10px">בדיקה</button></div>`;
  } else {
    const gridOpts = q.options.some(o => o.includes('<svg') || o.includes('class="sym"'));
    body = `<div class="opts ${gridOpts ? 'grid' : ''}">${q.options.map((o, i) => { let cls = 'opt'; const tr = c.tried && c.tried.i === c.i; if (answered) { if (i === q.answer) cls += ' ok'; else if (i === r.sel || (r.second && i === r.sel1)) cls += ' no'; } else if (tr && i === c.tried.sel) cls += ' gone'; return `<button class="${cls}" data-opt="${i}" ${answered || cls.includes('gone') ? 'disabled' : ''}><span class="lt">${L8[i]}</span><span class="ob">${o}</span></button>`; }).join('')}</div>`;
  }
  const lvl = [1, 2, 3, 4].map(n => `<i class="${n <= q.d ? 'on' : ''}"></i>`).join('');
  let fb = '';
  if (answered) {
    const tchip = `<span class="tchip ${r.secs <= 60 ? 'ok' : ''}">${Math.round(r.secs)} שנ׳</span>`;
    const ansTxt = q.type === 'order' ? 'הסדר הנכון למעלה' : q.type === 'num' ? L(fmt(q.ansv)) + (q.unit || '') : L8[q.answer];
    const LS = LESSONS[lessonFor(q)] || LESSONS.logic;
    fb = `<div class="fb ${r.ok ? 'ok' : 'no'}"><h4>${r.ok ? (r.second ? pick(['תיקנת!', 'יפה, בניסיון השני!', 'זה הרעיון!']) : pick(['נכון!', 'מעולה!', 'בול!', 'גאוני!', 'סל!', 'גול!', 'פגיעה ישירה!'])) + (r.gain ? ` +${r.gain}` : '') : 'התשובה: ' + ansTxt} ${tchip}</h4>${r.praise ? `<div class="praise">${IC.bolt}<span>${r.praise}</span></div>` : ''}<div class="rule"><span class="rt">${r.newRule ? 'כלל חדש' : 'הכלל'}</span>${LS[1]}</div>${r.ok ? `<details class="sol"><summary>איך פותרים</summary><p>${q.ex}</p></details>` : `<p class="solx">${q.ex}</p>`}${mnote(q, r, c)}${dadHTML(r.love)}</div>`;
  }
  const tried = !answered && c.tried && c.tried.i === c.i;
  const hint = tried ? retryBox(q, c.tried) : q.twin && !answered ? `<div class="hintbox"><b>הכלל:</b> ${(LESSONS[lessonFor(q)] || LESSONS.logic)[1]}</div>` : c.hint && !answered ? `<div class="hintbox"><b>טריק:</b> ${CATS[q.cat].tip}</div>` : '';
  const comboTag = c.combo >= 2 && !deferred(c.kind) ? `<span class="combo">${IC.flame}${c.combo}</span>` : '';
  let battle = '';
  if (c.kind === 'boss') {
    const B = BOSSES[c.day] || BOSSES[7], hits = c.res.filter(x => x && x.ok).length, bhp = Math.max(0, 100 - Math.round(hits / Math.ceil(c.qs.length * .7) * 100));
    battle = `<div class="battle" style="--bc:${EC[B.el] || '#7B5CFF'}"><div class="fighter"><span class="pic" id="meF">${avatarSVG()}</span><b>${nm()}</b><div class="hp"><i style="width:${c.hp * 20}%"></i></div></div><div class="vs">VS</div><div class="fighter"><span class="pic" id="bossF">${bossSVG(B)}</span><b>${B.n}</b><div class="hp bhp"><i style="width:${bhp}%"></i></div></div></div>`;
  }
  const chTag = c.chapters ? `<div class="chbar"><b>פרק ${c.ch + 1}/${c.chapters.length}</b> · ${c.chapters[c.ch].n}</div>` : '';
  const hintLbl = c.hint ? 'רמז נפתח' : S.hints > 0 ? `רמז (${S.hints} חינם)` : 'רמז (−3 נק׳)';
  const foot = answered ? `<button class="btn btn-primary" data-act="next">${c.i === c.qs.length - 1 ? 'לסיכום' : 'לשאלה הבאה'}</button>`
    : deferred(c.kind) ? `<button class="btn btn-ghost" data-act="skip">דלג וחזור אחר כך</button>`
      : (c.mod === 'nohint' || q.champ) ? `<button class="btn btn-ghost" disabled>${q.champ ? 'שאלת האלוף: בלי רמזים' : 'היום בלי רמזים'}</button>` : `<button class="btn btn-ghost" data-act="hint" ${c.hint || tried ? 'disabled' : ''}>${hintLbl}</button>`;
  const el = Math.floor((Date.now() - c.qStart) / 1000);
  const pace = answered ? '' : `<div class="pace ${c.mod === 'blitz' ? 'blitz' : ''}" title="יעד: דקה לשאלה"><i style="animation-delay:-${Math.min(el, 60)}s"></i></div>`;
  /* guided lesson: a chip on every shape question, and an offer the first time a question type appears */
  const gkey = !deferred(c.kind) && !r ? lessonFor(q) : null, guide = gkey && SHAPE_KEYS[gkey] ? gkey : null;
  const gchip = guide ? `<button class="chip gbtn" data-guide="${guide}">איך פותרים?</button>` : '';
  const gfirst = guide && !(S.guideSeen || {})[guide] ? `<div class="gfirst"><b>סוג שאלה חדש: ${SHAPE_KEYS[guide]}</b><span>שיעור של דקה, עם דוגמה. אחרי זה, השאלה שלך.</span><div class="row" style="gap:8px;margin-top:8px"><button class="btn btn-primary" data-guide="${guide}" style="flex:1;min-height:40px">כן, תראו לי</button><button class="btn btn-ghost" data-gskip="${guide}" style="flex:1;min-height:40px">אני יודע</button></div></div>` : '';
  const duo = c.duo ? '<div class="duo">אתגר עם אבא: כל אחד אומר בקול מה הוא חושב, ורק אז בוחרים.</div>' : '';
  app.innerHTML = `<div class="qbar"><button class="icon-btn" data-act="quit" aria-label="יציאה">${IC.x}</button><div class="pdots">${dots}</div><div class="qmeta"><span class="pts">${c.pts} נק׳</span><span class="tm" id="tm"></span></div></div>${chTag}${battle}
  <div class="card ${q.champ ? 'champq' : ''}"><div class="qtop"><span class="tag ${q.rev ? 'rev' : ''}">${q.champ ? 'שאלת האלוף · ' : q.rev ? (q.twin ? 'מהמחברת · גרסה קלה · ' : 'מהמחברת · ') : ''}${CATS[q.cat].n}</span>${comboTag}<span class="lvl">רמה ${lvl}</span>${gchip}</div>${duo}${pace}
  ${gfirst}<p class="qprompt">${q.prompt}</p><div class="qvis">${q.vis}</div>${body}${hint}${fb}</div>
  <div class="qfoot"><div class="in">${foot}</div></div>`;
  bind();
  app.querySelectorAll('[data-oitem]').forEach(b => b.onclick = () => { c.ord = (c.ord || []).concat(+b.dataset.oitem); SFX.tap(); renderQuiz(); });
  app.querySelectorAll('[data-oslot]').forEach(b => b.onclick = () => { const j = +b.dataset.oslot; if (c.ord && c.ord[j] != null) { c.ord.splice(j, 1); SFX.tap(); renderQuiz(); } });
  app.querySelectorAll('[data-tk]').forEach(b => b.onclick = () => { const k = b.dataset.tk; if (k === 'del') c.tin = (c.tin || '').slice(0, -1); else if (k === '.') { if (!(c.tin || '').includes('.')) c.tin = (c.tin || '0') + '.'; } else if ((c.tin || '').length < 7) c.tin = (c.tin || '') + k; SFX.tap(); document.getElementById('tin').innerHTML = c.tin || '&nbsp;'; });
  app.querySelectorAll('[data-guide]').forEach(b => b.onclick = () => startGuide(b.dataset.guide, 'quiz'));
  app.querySelectorAll('[data-gskip]').forEach(b => b.onclick = () => { S.guideSeen = Object.assign({}, S.guideSeen, { [b.dataset.gskip]: 1 }); save(); app.querySelector('.gfirst')?.remove(); });
  const tm = document.getElementById('tm');
  const tick = () => {
    if (c.chapters && c.chDeadline) { const left = Math.max(0, c.chDeadline - Date.now()), s = Math.ceil(left / 1000); tm.textContent = fmtT(s); tm.classList.toggle('warn', s < 60); if (left <= 0) endChapter(); }
    else if (c.deadline) { const left = Math.max(0, c.deadline - Date.now()), s = Math.ceil(left / 1000); tm.textContent = fmtT(s); tm.classList.toggle('warn', s < 120); if (left <= 0) { clearTimers(); finish(); } }
    else if (!answered) tm.textContent = fmtT(Math.floor((Date.now() - c.qStart) / 1000));
    else tm.textContent = '';
  };
  tick(); every(tick, 1000);
  if (!answered && !tried) thinkLock(c, q);
}
// @module 20-learn/rush.js
/* Think mode: the options stay closed for a few seconds, so he reads and solves in his head first.
   "I have the answer in my head" opens them early and is checked against his choice. */
function thinkLock(c, q) {
  if (!thinkOn(c)) return;
  const delay = Math.min(8, Math.round(minSecs(q) * .7)), left = delay - (Date.now() - c.qStart) / 1000;
  if (left <= .3) return;
  const box = app.querySelector('.opts, .typed, .ord'); if (!box) return;
  const open = () => { box.classList.remove('think'); box.querySelectorAll('button').forEach(b => { if (!b.classList.contains('gone')) b.disabled = false; }); app.querySelector('.thinkbar')?.remove(); };
  box.classList.add('think'); box.querySelectorAll('button').forEach(b => b.disabled = true);
  box.insertAdjacentHTML('beforebegin', `<div class="thinkbar"><i style="animation-duration:${left}s"></i><span>מצב חשיבה: קרא, ונסה לפתור בראש. התשובות נפתחות עוד רגע.</span><button class="chip commit" data-commit>יש לי תשובה בראש</button></div>`);
  app.querySelector('[data-commit]').onclick = () => { c.commit = c.i; clearTimeout(THINK_T); open(); SFX.tap(); };
  THINK_T = setTimeout(() => { if (S.cur === c) open(); }, left * 1000);
}
function viewResult() {
  const L0 = S.last; if (!L0) return viewHome();
  const st = starsOf(L0.correct, L0.n);
  const B = L0.kind === 'boss' ? BOSSES[L0.day] : null;
  const title = L0.duo ? 'אתגר עם אבא' : L0.xtra ? 'משימת בונוס' : { practice: 'אימון ' + (CATS[L0.cat] ? CATS[L0.cat].n : ''), review: 'מחברת הטעויות', sim: L0.size === 'full' ? 'סימולציה מלאה' : 'חצי סימולציה', boss: 'קרב מול ' + (B ? B.n : ''), daily: 'משימה ' + L0.day }[L0.kind];
  const msg = L0.kind === 'boss' ? (L0.won ? `ניצחת את ${B.n}!` : `${B.n} ניצח הפעם. ההסברים למטה הם הנשק לסיבוב הבא.`) : st === 3 ? 'ביצוע של אלוף.' : st === 2 ? 'עבודה טובה מאוד.' : st === 1 ? 'התחלה טובה. ההסברים למטה הם המקום שבו לומדים הכי הרבה.' : 'יום קשה קורה לכולם. כל טעות נשמרה במחברת ותחזור אליך.';
  const stars = [0, 1, 2].map(i => `<span class="${i < st ? 'on' : 'offs'} ${i === 1 ? 'mid' : ''}">${IC.star.replace('<svg', `<svg class="pop" style="animation-delay:${i * .15}s"`)}</span>`).join('');
  const who = B && !L0.won ? bossSVG(B) : avatarSVG();
  const nb = L0.newB.map(id => { const i = BADGES.findIndex(b => b.id === id); const b = BADGES[i]; return `<div class="card newb">${medal(true, i)}<div><b>תג חדש: ${b.n}</b><div class="muted small">${b.d}</div></div></div>`; }).join('');
  const ng = (L0.newGear || []).map(n => `<div class="banner"><span style="width:44px;height:44px;flex:none">${avatarSVG()}</span><div class="grow">ציוד חדש נפתח: <b>${n}</b>! תראה אותו על הדמות.</div></div>`).join('');
  const nw = L0.newWorld ? `<div class="banner" style="background:linear-gradient(120deg,var(--acc-soft),rgba(169,139,255,.2));border-color:var(--acc)"><span class="wi" style="color:var(--acc);width:44px;height:44px;flex:none">${elemIcon(curWorld().k)}</span><div class="grow">נכנסת ל<b>${L0.newWorld}</b>! צבעי המסע השתנו.</div></div>` : '';
  const ru = L0.rankUp ? `<div class="banner">${IC.star.replace('<svg', '<svg style="width:40px;height:40px;color:var(--gold)"')}<div class="grow">עלית דרגה! עכשיו אתה <b>${L0.rankUp}</b>.</div></div>` : '';
  const chest = L0.chest === 0 ? `<button class="card chest" data-act="chest">${chestSVG(false)}<div><b style="font-family:var(--f-display);font-size:1.2rem">תיבת אוצר!</b><div class="muted small">לחץ כדי לפתוח</div></div></button>` : L0.chest > 0 ? `<div class="card chest open">${chestSVG(true)}<div><b style="font-family:var(--f-display);font-size:1.2rem;color:var(--gold)">+${L0.chest} מטבעות</b><div class="muted small">נכנסו לארנק. בחנות יש ערכות צבע, מגני רצף ורמזים.</div></div></div>` : '';
  const rev = L0.review.length ? `<section><div class="sec-h"><h3>${deferred(L0.kind) ? 'כל השאלות' : 'לחזור עליהן'}</h3></div><div class="rev">${L0.review.map(x => `<details class="card item"><summary><span class="tag">${CATS[x.cat].n}</span> ${x.ok ? '<b style="color:var(--good)">✓</b>' : '<b style="color:var(--bad)">✗</b>'} ${x.q.replace(/<[^>]+>/g, '')}</summary><div class="a">התשובה: <b>${x.a}</b></div>${x.lk && LESSONS[x.lk] ? `<div class="rule small"><span class="rt">הכלל</span>${LESSONS[x.lk][1]}</div>` : ''}<div class="e">${x.ex}</div></details>`).join('')}</div></section>` : '';
  const dv = (L0.dia || []).length ? `<div class="banner" style="background:linear-gradient(120deg,rgba(143,227,255,.22),rgba(169,139,255,.2));border-color:rgba(143,227,255,.5)">${diaS(44)}<div class="grow"><b>+${L0.dia.reduce((a, x) => a + x[0], 0)} יהלומים של אבא!</b><div class="small muted">${L0.dia.map(x => x[1]).join(' · ')}</div></div></div>` : '';
  /* banners above the score */
  const song = L0.newSong && SONGS.find(x => x.id === L0.newSong);
  let top = song ? `<button class="banner songban" data-opensong="${song.id}">${IC.keys}<div class="grow">נפתח שיר חדש בפינת הפסנתר: <b data-nog>${song.n}</b></div></button>` : '';
  if (L0.kind === 'daily' && L0.n && L0.correct === diaNeed(L0.n) - 1) top += `<button class="diagoal near" data-act="diasheet">${DIA}<span>עוד תשובה נכונה אחת והיה כאן יהלום. מחר זה שלך.</span></button>`;
  if (L0.road) top += `<button class="banner roadban" data-road>${IC.star.replace('<svg', '<svg style="width:40px;height:40px;flex:none;color:var(--gold)"')}<div class="grow">התקדמת בדרך למחוננים: <b>${L0.road}</b>! קיבלת יהלום.</div></button>`;
  if (L0.xtra && xtraToday() >= XTRA_MAX) top += '<div class="banner calm"><div class="grow">עשית היום את כל משימות הבונוס. עבודה רצינית! עכשיו הפסקה: המוח מסדר את מה שלמד גם כשנחים.</div></div>';
  /* cards right below the score: explain-to-dad and how did it feel */
  const after = (L0.kind === 'daily' ? explainCard() : '') + (wantCheckin(L0) || L0.moodDone ? checkinCard(L0) : '');
  return `<div class="stack">${hud()}${top}<section class="card res-hero"><div class="eyebrow">${title}</div><div class="who">${who}</div><div class="stars">${stars}</div><div class="score">${L0.correct}/${L0.n}</div><p class="muted" style="margin:4px 0 0">${msg}</p><div class="gains"><span class="gain">+${L0.pts} נק׳</span><span class="gain c">+${L0.coins} מטבעות</span></div></section>${after}${impHTML(L0)}${L0.chapters ? `<section class="card"><div class="eyebrow" style="margin-bottom:8px">לפי פרקים</div><div class="bars">${L0.chapters.map(ch => `<div class="bar ${ch.c / ch.t < .6 ? 'weak' : ''}"><div class="rw"><span>${ch.n}</span><span>${ch.c}/${ch.t}</span></div><div class="track"><i style="width:${Math.round(ch.c / ch.t * 100)}%"></i></div></div>`).join('')}</div></section>` : ''}${L0.champOk != null ? `<div class="card row small" style="border-color:rgba(255,200,69,.5)">${IC.star.replace('<svg', '<svg style="width:26px;height:26px;color:var(--gold);flex:none"')}<span>שאלת האלוף: ${L0.champOk ? '<b style="color:var(--good)">נכון! הרווחת יהלום.</b>' : 'הפעם לא. ההסבר נמצא למטה.'}</span></div>` : ''}${dv}${chest}${jokeCard(L0.joke)}${nw}${ng}${ru}${nb}${['daily', 'boss', 'sim'].includes(L0.kind) ? `<button class="btn btn-gold btn-wide" data-share="result">${IC.share} שתף בקבוצה של המשפחה</button>` : ''}<button class="btn btn-primary btn-wide" data-go="home">חזרה למסע</button>${rev}</div>`;
}
function viewArcade() {
  const dm = dueMist().length, tm = S.mist.length;
  return `<div class="stack">${hud()}
  <div class="sec-h"><h3>ארקייד</h3><span class="muted small">משחקים שמאמנים את המוח</span></div>
  <div class="tiles">${songsTile()}
    <button class="tile" style="--tc:${EC.water}" data-go="sprint"><span class="ti">${IC.calc}</span><h4>ספרינט חשבון</h4><p>60 שניות של תרגילים בראש</p><span class="best">שיא: ${S.arcade.sprint}</span></button>
    <button class="tile" style="--tc:#A98BFF" data-go="piano"><span class="ti">${IC.keys}</span><h4>זיכרון פסנתר</h4><p>שמע, זכור, נגן בחזרה</p><span class="best">שיא: ${S.arcade.piano}</span></button>
    <button class="tile wide" style="--tc:${EC.fire}" data-go="kupa"><span class="ti">${IC.cart}</span><div class="grow"><h4>קופה ראשית</h4><p>משמרת של 90 שניות. סכומים, עודף והנחות, מהר ובלי מחשבון.</p></div><span class="best">שיא: ${S.arcade.kupa}</span></button>
    <button class="tile wide" style="--tc:var(--gold)" data-act="review" ${tm ? '' : 'disabled'}><span class="ti">${IC.book}</span><div class="grow"><h4>מחברת הטעויות</h4><p>${tm ? `${tm} שאלות במחברת${dm ? `. <b style="color:var(--gold)">${dm} מחכות לחזרה היום</b>` : ''}` : 'ריקה כרגע. כל טעות נכנסת לכאן וחוזרת עד שתשלוט בה.'}</p></div></button>
    <div class="tile wide" style="--tc:#A98BFF;flex-wrap:wrap"><span class="ti">${IC.clock}</span><div class="grow"><h4>סימולציית מבחן</h4><p>6 פרקים כמו במבחן האמיתי, שעון נפרד לכל פרק, בלי משוב עד הסוף.</p></div><div class="row" style="width:100%;gap:8px"><button class="btn btn-ghost" data-sim="half" style="flex:1;min-height:44px;font-size:.95rem">חצי · 36 דק׳</button><button class="btn btn-boss" data-sim="full" style="flex:1;min-height:44px;font-size:.95rem">מלאה · 72 דק׳</button></div></div>
  </div>
</div>`;
}
function viewShop() {
  const card = (id, it) => { const own = ownedSkin(id), eq = S.skin === id; return `<div class="card item ${eq ? 'eq' : ''}"><span class="sw">${it.c.map(c => `<i style="background:${c}"></i>`).join('')}</span><b>${it.t}</b><button class="btn ${eq ? 'btn-ghost' : own ? 'btn-primary' : 'btn-gold'}" data-skin="${id}" ${eq ? 'disabled' : ''}>${eq ? 'בשימוש' : own ? 'השתמש' : `${coinS()} ${it.price}`}</button></div>`; };
  const boost = (icon, title, sub, price, act) => `<div class="card row">${icon}<div class="grow"><b>${title}</b><div class="muted small">${sub}</div></div><button class="btn btn-gold" data-act="${act}" style="min-height:44px;padding:8px 14px;font-size:1rem">${coinS()} ${price}</button></div>`;
  return `<div class="stack">${hud()}${rewardsSection()}<div class="banner">${coinS(44)}<div class="grow">יש לך <b>${S.coins}</b> מטבעות. מרוויחים אותם במשימות, בתיבות ובארקייד.</div></div>
  ${exchangeCard()}${accSection()}<section><div class="sec-h"><h3>חיזוקים</h3></div><div class="stack" style="gap:8px">
    ${boost(IC.flame.replace('<svg', '<svg style="width:40px;height:40px;flex:none"'), 'מגן רצף', `שומר על הרצף אם פספסת יום. יש לך: ${S.freezes}`, 60, 'freeze')}
    ${boost(IC.bulb.replace('<svg', '<svg style="width:40px;height:40px;flex:none;color:var(--gold)"'), '3 רמזים חינם', `רמז בלי להוריד נקודות. יש לך: ${S.hints}`, 45, 'hints')}
  </div></section>
  <section><div class="sec-h"><h3>ערכות צבע</h3><span class="muted small">משנות את צבעי האפליקציה</span></div><div class="shopgrid">${Object.entries(SKINS).map(([id, it]) => card(id, it)).join('')}</div></section></div>`;
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
// @module 40-game/progress.js
function bdayText() { const [m, d] = String(ME.bd).split('-').map(Number); return `${d} ב${['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'][m - 1]}`; }
/* what the home screen offers next, in order of importance */
function nextStep() {
  if (S.cur) return 'resume';
  const nd = nextDay();
  if (nd && nd <= unlocked()) return 'mission';
  if (dueMist().length >= 3 && S.reviewDay !== todayStr()) return 'review';
  let s = S.bonusDay !== todayStr() ? 'bonus' : nd ? 'done' : 'finished';
  if ((s === 'bonus' || s === 'done') && S.duoWeek !== weekKey() && S.duoSkip !== todayStr() && doneCount(S) >= 2 && !S.guest) s = 'duo';
  if ((s === 'bonus' || s === 'done') && canXtra()) s = 'xtra';
  return s;
}
function heroFor(step) {
  const nd = nextDay(), W = curWorld(), cur = S.cur;
  const line = (dayDiff(S.start, todayStr()) % 3 === 0) ? W.line : LINES[(dayDiff(S.start, todayStr()) + LINES.length * 9) % LINES.length];
  if (step === 'xtra') {
    const w = weakChapter(), n = xtraToday() + 1;
    return `<section class="card hero xhero"><div class="eyebrow">המשימה של היום הושלמה · בונוס ${n} מתוך ${XTRA_MAX}</div><div class="stage"><div class="grow"><div class="bubble">רוצה עוד? משימת בונוס של 10 שאלות, חצי מהן ב${w.n}. נקודות מלאות, ו-9 מתוך 10 שווה יהלום.</div></div><div class="who">${avatarSVG()}</div></div><button class="btn btn-primary btn-wide" data-act="xtra">משימת בונוס</button><button class="btn btn-ghost btn-wide" data-act="xtraskip" style="margin-top:8px">מספיק להיום</button></section>`;
  }
  if (step === 'duo') return `<section class="card hero duohero"><div class="eyebrow">פעם בשבוע · יהלום</div><div class="stage"><div class="grow"><div class="bubble">3 שאלות קשות, פותרים יחד עם אבא. כל אחד אומר בקול מה הוא חושב.</div></div><div class="who">${avatarSVG()}</div></div><button class="btn btn-primary btn-wide" data-act="duo">אתגר עם אבא</button><button class="btn btn-ghost btn-wide" data-act="duoskip" style="margin-top:8px">לא היום</button></section>`;
  if (step === 'resume') {
    const lbl = { practice: 'אימון', review: 'חזרה מהמחברת', sim: 'סימולציה', boss: 'קרב בוס', daily: 'משימה' }[cur.kind];
    return `<section class="card hero ${cur.kind === 'boss' ? 'boss' : ''}"><div class="eyebrow">באמצע ${lbl}</div><h2>ממשיכים</h2><p>שאלה ${cur.i + 1} מתוך ${cur.qs.length}</p><button class="btn btn-primary btn-wide" data-act="resume">להמשיך</button></section>`;
  }
  if (step === 'mission') {
    const kind = nodeKind(nd), B = BOSSES[nd];
    if (kind === 'boss') return `<section class="card hero boss" style="--bc:${EC[B.el] || '#7B5CFF'}"><div class="eyebrow">${nd === TOTAL ? 'הגמר הגדול' : 'קרב בוס · ' + worldOf(nd).n}</div><div class="stage"><div class="grow"><div class="bubble">"${B.line}"</div></div><div class="who">${bossSVG(B)}</div></div><h2>${B.n}</h2><p>15 שאלות · 20 דקות · ניצחון = 70%</p><button class="btn btn-boss btn-wide" data-act="start">לקרב!</button></section>`;
    if (kind === 'sim') { const full = SIMDAYS[nd] === 'full'; return `<section class="card hero" style="background:linear-gradient(155deg,rgba(169,139,255,.28),var(--panel) 60%)"><div class="eyebrow">משימה ${nd} · יום מבחן</div><div class="stage"><div class="grow"><div class="bubble">היום מתאמנים בדיוק כמו במבחן האמיתי.</div></div><div class="who" style="display:grid;place-items:center;color:var(--violet)">${IC.clock.replace('<svg', '<svg style="width:70px;height:70px"')}</div></div><h2>${full ? 'סימולציה מלאה' : 'חצי סימולציה'}</h2><p>6 פרקים · ${full ? '72 שאלות · 72 דקות' : '36 שאלות · 36 דקות'} · כדאי לשבת במקום שקט</p><button class="btn btn-boss btn-wide" data-act="start">מתחילים</button></section>`; }
    return `<section class="card hero"><div class="eyebrow">${W.n} · משימה ${nd}/${TOTAL}</div><div class="stage"><div class="grow"><div class="bubble">${line}</div></div><div class="who">${avatarSVG()}</div></div><p>${(MODS[modFor(nd)] || MODS.classic).n} · 10 שאלות${dueMist().length ? ` · ${Math.min(2, dueMist().length)} מהמחברת` : ''}</p><button class="btn btn-primary btn-wide" data-act="start">יאללה, ${nm()}!</button></section>`;
  }
  if (step === 'review') { const n = Math.min(8, dueMist().length); return `<section class="card hero" style="background:linear-gradient(155deg,rgba(255,200,69,.22),var(--panel) 60%)"><div class="eyebrow">הצעד הבא</div><div class="stage"><div class="grow"><div class="bubble">טעויות שחוזרות עליהן לא חוזרות במבחן.</div></div><div class="who" style="display:grid;place-items:center;color:var(--gold)">${IC.book.replace('<svg', '<svg style="width:66px;height:66px"')}</div></div><h2>חזרה מהמחברת</h2><p>${n} שאלות · בערך 5 דקות</p><button class="btn btn-gold btn-wide" data-act="review">לחזרה</button></section>`; }
  if (step === 'bonus') { const [id, n, d, ic, col] = bonusToday(); return `<section class="card hero" style="background:linear-gradient(155deg,color-mix(in srgb,${col} 28%,transparent),var(--panel) 60%)"><div class="eyebrow">המשימה הושלמה · בונוס</div><div class="stage"><div class="grow"><div class="bubble">הרווחת משחק. ${d}</div></div><div class="who" style="display:grid;place-items:center;color:${col}">${IC[ic].replace('<svg', '<svg style="width:66px;height:66px"')}</div></div><h2>${n}</h2><button class="btn btn-primary btn-wide" data-go="${id}">לשחק</button><button class="btn btn-ghost btn-wide" data-act="skipbonus" style="margin-top:8px;min-height:42px">לא היום</button></section>`; }
  if (step === 'ext') return `<section class="card hero" style="background:linear-gradient(155deg,rgba(83,168,255,.25),var(--panel) 60%)"><div class="eyebrow">פעם בשבוע</div><h2>מבחן במחונן אונליין</h2><p>מבחן תרגול אחד באתר, ואז רושמים כאן את הציון. ככה רואים התקדמות גם מול שאלות מבחוץ.</p><a class="btn btn-primary btn-wide" href="https://mihonan-online.co.il/" target="_blank" rel="noopener">לאתר</a><div class="row" style="margin-top:10px"><input class="txt" id="extscore" type="number" min="0" max="100" placeholder="ציון באחוזים" style="flex:1"><button class="btn btn-gold" data-act="extsave" style="min-height:46px">שמור</button></div><button class="btn btn-ghost btn-wide" data-act="extskip" style="margin-top:8px;min-height:42px">לא היום</button></section>`;
  if (step === 'finished') return `<section class="card hero"><div class="stage"><div class="grow"><div class="eyebrow">המסע הושלם</div><h2>אלוף!</h2></div><div class="who">${avatarSVG()}</div></div><p>עד המבחן: סימולציה מלאה פעם בכמה ימים, וחזרה מהמחברת.</p><button class="btn btn-boss btn-wide" data-sim="full">סימולציה מלאה</button></section>`;
  const calm = xtraToday() >= XTRA_MAX ? '<p class="small" style="margin-top:6px">יום מצוין. עשית הכל, והמוח ממשיך ללמוד גם בהפסקה. נתראה מחר!</p>' : '';
  return `<section class="card hero"><div class="stage"><div class="grow"><div class="eyebrow">סיימת להיום</div><h2 class="glow">כל הכבוד!</h2></div><div class="who">${avatarSVG()}</div></div><p>משימה ${nd} תיפתח מחר.</p>${calm}</section>${S.jokes ? jokeCard(S.jokes - 1, 'הבדיחה של היום') : ''}`;
}
function viewHome() {
  const step = nextStep(), nd = nextDay(), un = unlocked(), W = curWorld();
  let bd = '';
  const dtb = daysToBday();
  if (isBday()) bd = `<div class="banner">${IC.cake}<div class="grow">יום הולדת שמח, ${nm()}!</div>${S.bdGift[todayStr().slice(0, 4)] ? '' : '<button class="btn btn-gold" data-act="bdgift">פתח מתנה</button>'}</div>`;
  else if (dtb <= 7) bd = `<div class="banner">${IC.cake}<div class="grow">עוד ${dtb} ימים ליום ההולדת!</div></div>`;
  const toExam = Math.max(0, dayDiff(todayStr(), S.exam));
  const mini = `<div class="mini"><div data-tap5><b>${toExam}</b><span>ימים למבחן</span></div><div><b>${curStreak()}</b><span>ימים ברצף</span></div><div><b>${doneCount(S)}/${TOTAL}</b><span>משימות</span></div></div>`;
  const bdDay = dayDiff(S.start, `${S.start.slice(0, 4)}-${ME.bd}`) + 1;
  const openW = S.openW || W.k;
  const map = WORLDS.map(Wd => {
    const done = worldDone(Wd), open = openW === Wd.k;
    let path = '';
    if (open) for (let k = Wd.a; k <= Wd.b; k++) {
      const m = S.missions[k], kind = nodeKind(k), st = m ? starsOf(m.c, m.n) : 0;
      const isOpen = k === nd && k <= un && !S.cur;
      const cls = ['node', kind === 'boss' ? 'boss' : kind === 'sim' ? 'simn' : '', m ? 'done' : isOpen ? 'open' : k > un || k > (nd || 99) ? 'locked' : ''].join(' ');
      const x = Math.round(Math.sin((k - 1) * .85) * 32);
      const inner = kind === 'boss' ? bossSVG(BOSSES[k]) : kind === 'sim' ? IC.clock : k;
      path += `<div class="pn" style="--x:${x}%">${isOpen ? '<span class="go">התחל</span>' : ''}<button class="${cls}" data-node="${k}" aria-label="משימה ${k}">${inner}${m ? `<span class="st">${'★'.repeat(st)}</span>` : ''}${k === bdDay ? giftSVG : ''}</button></div>`;
    }
    return `<section class="world ${open ? 'open' : ''}" style="--wc:${EC[Wd.k]}"><button class="wbanner" data-world="${Wd.k}"><span class="wi">${elemIcon(Wd.k)}</span><div><b>${Wd.n}</b><span>${done}/15</span></div><span class="chev">${IC.chev}</span></button><div class="wbar"><i style="width:${done / 15 * 100}%"></i></div>${open ? `<div class="path">${path}</div>` : ''}</section>`;
  }).join('');
  /* above the hero: how diamonds work (until seen), a morning hint, and the dad-phone shortcut */
  let pre = '';
  if (!S.diaHelpSeen && doneCount(S) >= 1) pre += `<button class="diagoal" data-act="diasheet">${DIA}<span>איך מרוויחים יהלומים, ומה מקבלים עליהם? לחץ כאן</span></button>`;
  pre += morningHint() || '';
  if (isDadPhone() && !isSbx()) pre += `<button class="banner dadban" data-go="parent"><span style="width:40px;height:40px;flex:none">${IC.chart}</span><div class="grow"><b>זה הטלפון של אבא</b><div class="small muted">לדוח של ${ME.name} מהענן</div></div></button>`;
  const road = S.guest || isDadPhone() ? '' : roadMini();
  return `<div class="stack">${hud()}${bd}${todayChips(step)}${pre}${heroFor(step)}${road}${mini}<div class="sec-h"><h3>המסע</h3></div>${map}</div>`;
}
/* buttons added by the feature modules (one place, called from bind) */
function bindV11() {
  const on = (a, fn) => { const e = app.querySelector(`[data-act="${a}"]`); if (e) e.onclick = fn; };
  on('sharefriend', shareFriend);
  on('dadsave', () => { const v = (document.getElementById('dadmsgs').value || '').split('\n').map(s => s.trim().replace(/[<>]/g, '')).filter(Boolean).slice(0, 30); S.dadMsgs = v; S.loveI = 0; save(); toast('נשמר'); });
  const o = app.querySelector('[data-opensong]'); if (o) o.onclick = () => { S.songId = o.dataset.opensong; S.view = 'songs'; save(); render(); window.scrollTo(0, 0); };
  bindProfiles();
  app.querySelectorAll('[data-act="diasheet"]').forEach(b => b.onclick = openDiaSheet);
  app.querySelectorAll('[data-mood]').forEach(b => b.onclick = () => setMood(b.dataset.mood));
  on('explained', () => { if (!S.explainQ || S.explainQ.done) return; S.explainQ.done = 1; S.coins += 10; S.explainLog = (S.explainLog || []).concat(todayStr()).slice(-30); SFX.coin(); save(); render(); });
  on('duo', startDuo);
  on('duoskip', () => { S.duoSkip = todayStr(); save(); render(); });
  app.querySelectorAll('[data-guidetab]').forEach(b => b.onclick = () => startGuide(b.dataset.guidetab, 'tips'));
  app.querySelectorAll('[data-accb]').forEach(b => b.onclick = () => { const it = ACC.find(a => a[0] === b.dataset.accb); if (!it || S.coins < it[2]) return; modal(`לקנות ${it[1]}?`, `זה יעלה ${it[2]} מטבעות.`, 'לקנות', () => { S.coins -= it[2]; S.accOwn = Object.assign({}, S.accOwn, { [it[0]]: 1 }); S.accOn = Object.assign({}, S.accOn, { [it[0]]: 1 }); SFX.coin(); save(); render(); }, 'btn-gold'); });
  app.querySelectorAll('[data-accw]').forEach(b => b.onclick = () => { const k = b.dataset.accw; S.accOn = Object.assign({}, S.accOn, { [k]: !(S.accOn || {})[k] }); SFX.tap(); save(); render(); });
  const ex = app.querySelector('[data-act="exch"]'); if (ex) ex.onclick = () => { if (S.exWeek === weekKey() || S.coins < EX_PRICE || S.noEx) return; modal('להמיר מטבעות ליהלום?', `${EX_PRICE} מטבעות יהפכו ליהלום אחד. אפשר פעם בשבוע.`, 'להמיר', () => { S.coins -= EX_PRICE; S.exWeek = weekKey(); giveDia(1, 'המרה שבועית', []); SFX.coin(); save(); render(); toast('קיבלת יהלום!'); }, 'btn-gold'); };
  on('extoggle', () => { S.noEx = !S.noEx; save(); render(); });
  app.querySelectorAll('[data-road]').forEach(b => b.onclick = () => { S.ptab = 'me'; go('stats'); });
  on('xtra', startXtra);
  on('xtraskip', () => { S.xtraSkip = todayStr(); save(); render(); });
}
function bindSongs() {
  app.querySelectorAll('[data-song]').forEach(b => b.onclick = () => { stopLoop(); S.songId = b.dataset.song || null; S.songChord = null; SFX.tap(); save(); render(); window.scrollTo(0, 0); });
  app.querySelectorAll('[data-chord]').forEach(b => b.onclick = () => { S.songChord = b.dataset.chord; playChord(b.dataset.chord); if (!SL) renderSongOnly(); });
  app.querySelectorAll('[data-loop]').forEach(b => b.onclick = () => { const si = +b.dataset.loop; if (SL && SL.si === si) { stopLoop(); renderSongOnly(); return; } stopLoop(); SL = { id: S.songId, si, ci: 0 }; loopStep(); });
  app.querySelectorAll('[data-tempo]').forEach(b => b.onclick = () => { S.songFast = b.dataset.tempo === '1'; save(); if (!SL) renderSongOnly(); });
  const b = app.querySelector('[data-buysong]'); if (b) b.onclick = () => { if (S.coins < SONG_PRICE) return toast(`צריך ${SONG_PRICE} מטבעות`); modal('לפתוח את השיר הבא?', `זה יעלה ${SONG_PRICE} מטבעות.`, 'לפתוח', () => { S.coins -= SONG_PRICE; S.songBuy = (S.songBuy || 0) + 1; SFX.coin(); save(); render(); }, 'btn-gold'); };
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

/* ---------- great football moments ----------
   Six famous moves. Each one: the story, a replay of what really happened, then the player tries it.
   Pitch in meters: x 0..68 across, y 0 at the goal line, growing toward the halfway line (52.5).
   Controls: tap a teammate = pass, tap the goal mouth = shoot there, tap or drag elsewhere = run there. */
const LG_GOAL = [30.34, 37.66];
const LGM = [
  { id: 'istanbul', t: 'הנס של איסטנבול', yr: 2005, match: 'גמר ליגת האלופות · ליברפול מול מילאן', them: '#1B1B1F', view: [3, 47, 40], T: 10,
    story: 'במחצית מילאן מובילה 3-0. כולם חושבים שזה נגמר. דקה 54: יון ארנה ריסה מקבל את הכדור באגף שמאל, וסטיבן ג\'רארד רץ לרחבה.',
    task: 'אתה ריסה. חכה שג\'רארד ייכנס לרחבה, ואז גע בו כדי להגביה אליו. כשהכדור מגיע: גע בפינה של השער שרחוקה מהשוער.',
    after: 'ג\'רארד נגח לרשת. תוך 6 דקות ליברפול השוותה ל-3-3, עם שערים של שמיצר ואלונסו, וניצחה בפנדלים.',
    lesson: 'לא מוותרים, גם כשמפגרים 3-0.',
    us: [['riise', 'ריסה', 8, 22], ['gerrard', 'ג\'רארד', 36, 31, [[35, 22], [33, 11]], 6.4, .3], ['baros', 'באורש', 44, 14]],
    opp: [['press', 'מגן', 15, 15, 'press', 1.5], ['nesta', 'מגן', 39, 15, 'mark:gerrard', 3.6], ['stam', 'מגן', 42, 9, 'mark:baros', 4], ['dida', 'דידה', 34, 1, 'keeper']],
    ball: 'riise',
    rp: { T: 3.6, cap: [[0, 'ריסה מחכה לריצה של ג\'רארד'], [1.6, 'הגבהה לרחבה'], [2.6, 'נגיחה לפינה הרחוקה']],
      tr: { gerrard: [[0, 36, 30], [1.6, 34, 16], [2.5, 33, 11]], nesta: [[0, 39, 15], [2.5, 35, 12]], dida: [[0, 34, 1], [2.7, 35.5, 1]] },
      ball: [[0, 'riise'], [1.6, 'riise'], [2.5, 'gerrard'], [3.0, 30.8, -.6]], loft: [2.5] } },
  { id: 'origi', t: 'הקרן המהירה', yr: 2019, match: 'חצי גמר ליגת האלופות · ליברפול 4-0 ברצלונה', them: '#1F4BA8', view: [27, 70, 30], T: 7,
    story: 'ליברפול הפסידה 3-0 במשחק הראשון, ובאנפילד כבר הובילה 3-0. דקה 79: קרן לליברפול. שחקני ברצלונה מסתובבים ומתארגנים לאט.',
    task: 'אתה טרנט אלכסנדר-ארנולד. ההגנה לא מסתכלת. גע באוריגי כדי למסור אליו מהר, ואז גע בפינה של השער. אם תחכה, הם יתעוררו.',
    after: 'טרנט התחיל ללכת מהקרן, חזר ובעט מהר. אוריגי בעט מיד לפינה העליונה. ליברפול עלתה לגמר וזכתה בגביע.',
    lesson: 'מי ששם לב למה שאחרים מפספסים, מקדים אותם.',
    us: [['trent', 'טרנט', 67.3, .8], ['origi', 'אוריגי', 31, 7], ['vandijk', 'ואן דייק', 40, 12]],
    opp: [['b1', 'מגן', 30, 11, 'wake:origi:3.2', 6.5], ['b2', 'מגן', 37, 8, 'wake:origi:3.6', 6], ['b3', 'מגן', 44, 6, 'wake:trent:4', 6], ['ts', 'טר שטגן', 34, 1.2, 'keeper']],
    ball: 'trent',
    rp: { T: 3.4, cap: [[0, 'טרנט מתחיל ללכת מהקרן...'], [1.0, '...חוזר ומוסר מהר'], [2.3, 'אוריגי בועט מיד']],
      tr: { trent: [[0, 67.3, .8], [.6, 64, 3], [1.0, 67.3, .8]], b1: [[0, 30, 11], [3.4, 27, 15]], b2: [[0, 37, 8], [3.4, 38, 13]], b3: [[0, 44, 6], [3.4, 47, 11]] },
      ball: [[0, 'trent'], [1.2, 'trent'], [2.1, 'origi'], [2.6, 33.2, -.6]] } },
  { id: 'cruyff', t: 'התפנית של קרויף', yr: 1974, match: 'מונדיאל · הולנד מול שוודיה', them: '#F2C230', us_c: '#FF7A1A', view: [4, 46, 30], T: 10, special: 'turn',
    story: 'יוהאן קרויף עומד ליד הרחבה עם הגב לשער. המגן השוודי יאן אולסון צמוד אליו ומחכה שיבעט.',
    task: 'לחץ "תפנית" כשאולסון ממש קרוב. קרויף יעשה כאילו הוא בועט, יגרור את הכדור מאחורי הרגל ויסתובב. אחר כך רוץ לשער ובעט.',
    after: 'אולסון נשאר מבולבל, והתנועה קיבלה את השם "תפנית קרויף". המשחק עצמו נגמר 0-0, אבל את המהלך מלמדים עד היום.',
    lesson: 'לגרום ליריב לחשוב שתעשה דבר אחד, ואז לעשות דבר אחר.',
    us: [['cruyff', 'קרויף', 15, 19], ['rep', 'רפ', 40, 16]],
    opp: [['olsson', 'אולסון', 19, 10, 'cruyff', 7.4], ['d2', 'מגן', 34, 9, 'mark:rep', 4.5], ['hell', 'הלסטרום', 34, 1, 'keeper']],
    ball: 'cruyff',
    rp: { T: 3.2, cap: [[0, 'אולסון מתקרב'], [.9, 'כאילו בעיטה... וגרירה מאחורי הרגל'], [1.6, 'קרויף כבר בדרך']],
      tr: { cruyff: [[0, 15, 19], [.9, 15, 18], [1.3, 13, 16], [3.2, 9, 8]], olsson: [[0, 19, 10], [.9, 15.5, 16.5], [1.6, 18, 20], [3.2, 13, 13]] },
      ball: [[0, 'cruyff']] } },
  { id: 'maradona', t: 'שער המאה', yr: 1986, match: 'רבע גמר המונדיאל · ארגנטינה מול אנגליה', them: '#F4F4F4', us_c: '#6FB4E8', view: [18, 60, 55], T: 15,
    story: 'דייגו מראדונה מקבל את הכדור ליד קו האמצע. בינו לבין השער: כמה שחקנים אנגלים והשוער פיטר שילטון.',
    task: 'גרור את האצבע כדי להוביל את הכדור. אסור שמגן ייגע בך. ליד השוער: עקוף אותו ובעט לשער.',
    after: 'מראדונה רץ כ-60 מטר, עקף כמה שחקנים ואת השוער, והבקיע. בסקר של פיפ"א ב-2002 השער נבחר ל"שער המאה".',
    lesson: 'להסתכל קדימה ולמצוא את הרווח, לפני שמגיעים אליו.',
    us: [['diego', 'מראדונה', 38, 52, null, 7.6]],
    opp: [['e1', 'מגן', 33, 45, 'press:11', 5.2], ['e2', 'מגן', 46, 37, 'press:10', 5], ['e3', 'מגן', 31, 28, 'press:10', 5.4], ['e4', 'מגן', 41, 17, 'press:9', 5.6], ['shilton', 'שילטון', 34, 1, 'keeper']],
    ball: 'diego',
    rp: { T: 7.2, cap: [[0, 'מתחיל ליד קו האמצע'], [2.4, 'עוקף אחד אחרי השני'], [5.6, 'עוקף גם את השוער']],
      tr: { diego: [[0, 38, 52], [1.3, 42, 44], [2.6, 45, 34], [3.9, 42, 24], [5.0, 39, 14], [6.0, 37, 6], [6.6, 33, 3.5]], e1: [[0, 33, 45], [1.3, 39, 45], [2.6, 41, 40]], e2: [[0, 44, 38], [2.6, 42, 36], [3.9, 45, 30]], e3: [[0, 30, 28], [3.9, 39, 26], [5.0, 41, 18]], e4: [[0, 41, 18], [5.0, 37, 16], [6.0, 39, 9]], shilton: [[0, 34, 1], [6.0, 36, 4], [6.6, 36.5, 5]] },
      ball: [[0, 'diego'], [6.6, 'diego'], [7.1, 33, -.6]] } },
  { id: 'olympiacos', t: 'בעיטת הניצחון של ג\'רארד', yr: 2004, match: 'ליגת האלופות · ליברפול מול אולימפיאקוס', them: '#F4F4F4', view: [14, 56, 36], T: 8,
    story: 'ליברפול חייבת לנצח בהפרש של שני שערים כדי להמשיך בטורניר. 2-1, דקה 86. ניל מלור מוריד את הכדור בראש, וסטיבן ג\'רארד מגיע מבחוץ.',
    task: 'גע בג\'רארד כדי למסור אליו. אפשר לגעת בשער עוד לפני שהכדור מגיע: ג\'רארד יבעט מיד, בלי לעצור את הכדור.',
    after: 'ג\'רארד בעט מ-25 מטר לרשת. 3-1, ליברפול עלתה, ובסוף העונה זכתה בגביע באיסטנבול.',
    lesson: 'להתכונן מראש, כדי לפעול מיד כשההזדמנות מגיעה.',
    us: [['mellor', 'מלור', 31, 13], ['gerrard', 'ג\'רארד', 40, 34, [[37, 25]], 6.5, .2]],
    opp: [['o1', 'מגן', 28, 9.5, 'press', .9], ['o2', 'מגן', 35, 9.5, 'press', .8], ['o3', 'מגן', 48, 27, 'mark:gerrard', 4.6], ['nik', 'שוער', 34, 1, 'keeper']],
    ball: 'mellor',
    rp: { T: 3.1, cap: [[0, 'מלור מוריד את הכדור'], [1.6, 'ג\'רארד בועט מיד']],
      tr: { gerrard: [[0, 40, 34], [1.6, 37, 25]], o3: [[0, 48, 27], [1.8, 41, 25]], nik: [[0, 34, 1], [2.3, 35.2, 1]] },
      ball: [[0, 'mellor'], [.9, 'mellor'], [1.6, 'gerrard'], [2.4, 31.4, -.6]] } },
  { id: 'dalglish', t: 'הלוב של דלגליש', yr: 1978, match: 'גמר הגביע האירופי · ליברפול מול קלאב ברוז\'', them: '#2B2B2B', view: [18, 60, 30], T: 9, special: 'chip',
    story: '0-0 בוומבלי. גרהם סונס מוסר לקני דלגליש לתוך הרחבה, והשוער בירגר ינסן יוצא אליו מהר.',
    task: 'מסור לדלגליש. השוער ירוץ אליו, ובעיטה רגילה תפגע בו. לחץ "לוב", ואז גע בשער: הכדור יעבור מעל השוער שיצא.',
    after: 'דלגליש הרים את הכדור מעל ינסן לרשת. 1-0, וליברפול זכתה בגביע האירופי בפעם השנייה ברציפות.',
    lesson: 'בוחרים את הפתרון לפי המצב, לא תמיד את אותו פתרון.',
    us: [['souness', 'סונס', 36, 22], ['kenny', 'דלגליש', 46, 13, [[45, 9.5]], 4, .5]],
    opp: [['c1', 'מגן', 40, 15, 'press', 2.4], ['c2', 'מגן', 50, 7, 'mark:kenny', 3.4], ['jensen', 'ינסן', 34, 1, 'rush']],
    ball: 'souness',
    rp: { T: 3.4, cap: [[0, 'סונס מוסר לרחבה'], [1.4, 'ינסן יוצא'], [2.3, 'לוב מעל השוער']],
      tr: { kenny: [[0, 46, 13], [1.2, 45, 9.5]], jensen: [[0, 34, 1], [1.4, 38, 3], [2.2, 41.5, 5.5]] },
      ball: [[0, 'souness'], [.4, 'souness'], [1.2, 'kenny'], [2.2, 'kenny'], [3.2, 35.5, -.6]], loft: [3.2] } },
];
let LGS = null, LG_RAF = 0;
const lgD = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lgStars = id => ((S.arcade || {}).leg || {})[id] || 0;

/* ----- the list ----- */
function viewLegends() {
  const tot = LGM.reduce((s, m) => s + lgStars(m.id), 0);
  return `<div class="stack">${hud()}
  <div class="sec-h"><h3>רגעים גדולים בכדורגל</h3><span class="muted small">${tot} מתוך ${LGM.length * 3} כוכבים</span></div>
  <p class="small muted" style="margin:0">לכל רגע: הסיפור, צפייה במהלך המקורי, ואז אתה מנסה. כוכבים לפי מספר הניסיונות.</p>
  <div class="lg-list">${LGM.map(m => `<button class="lg-card" data-lg="${m.id}"><span class="lg-yr">${m.yr}</span><span class="grow"><b>${m.t}</b><small>${m.match}</small></span><span class="lg-st">${[1, 2, 3].map(i => `<i class="${i <= lgStars(m.id) ? 'on' : ''}">★</i>`).join('')}</span></button>`).join('')}</div>
  <button class="btn btn-ghost btn-wide" data-go="arcade">חזרה לארקייד</button></div>`;
}
function renderLegends() {
  /* a background refresh (cloud pull, update check) must not restart a scene that is on screen */
  if (LGS && LGS.cv && LGS.cv.isConnected) return;
  lgStop();
  if (!LGS) { app.innerHTML = viewLegends(); bind(); app.querySelectorAll('[data-lg]').forEach(b => b.onclick = () => lgOpen(b.dataset.lg)); return; }
  const m = LGS.m;
  app.innerHTML = `<div class="stack lg"><div class="qbar"><button class="icon-btn" data-lgq aria-label="חזרה">${IC.x}</button><div class="grow"><b>${m.t}</b><div class="small muted">${m.match}, ${m.yr}</div></div><span class="lg-tm" id="lgtm"></span></div>
  <div class="lg-stage"><canvas id="lgc"></canvas><div class="lg-cap" id="lgcap"></div></div><div class="lg-pane" id="lgpane"></div>
  <div class="row lg-ctl" id="lgctl"></div></div>`;
  app.querySelector('[data-lgq]').onclick = () => { LGS = null; renderLegends(); };
  lgCanvas(); lgPane('intro');
}
function lgOpen(id) { ac(); LGS = { m: LGM.find(x => x.id === id), tries: 0 }; S.view = 'legends'; renderLegends(); }
function lgPane(kind, msg) {
  const p = document.getElementById('lgpane'), ctl = document.getElementById('lgctl'), m = LGS.m; if (!p) return;
  p.hidden = false; ctl.innerHTML = '';
  if (kind === 'intro') { lgReset(); p.innerHTML = `<div class="eyebrow">הסיפור</div><p>${m.story}</p><div class="row"><button class="btn btn-ghost" data-lgb="rp">לצפות במהלך</button><button class="btn btn-primary" data-lgb="go">לנסות בעצמי</button></div>`; }
  else if (kind === 'task') { p.innerHTML = `<div class="eyebrow">המשימה</div><p>${m.task}</p><button class="btn btn-primary btn-wide" data-lgb="play">יאללה</button>`; }
  else if (kind === 'rpend') { p.innerHTML = `<div class="eyebrow">ככה זה קרה</div><p>${m.after}</p><button class="btn btn-primary btn-wide" data-lgb="go">עכשיו תורי</button>`; }
  else if (kind === 'win') { const st = msg; p.innerHTML = `<div class="lg-goal">גוֹל!</div><div class="lg-st big">${[1, 2, 3].map(i => `<i class="${i <= st ? 'on' : ''}">★</i>`).join('')}</div><p class="small">${m.after}</p><p><b>השיעור:</b> ${m.lesson}</p><div class="row"><button class="btn btn-ghost" data-lgb="again">שוב</button><button class="btn btn-primary" data-lgb="list">לרגע הבא</button></div>`; }
  else if (kind === 'fail') { p.innerHTML = `<div class="eyebrow" style="color:var(--bad)">לא הפעם</div><p>${msg}</p><div class="row"><button class="btn btn-ghost" data-lgb="rp">לצפות שוב במקור</button><button class="btn btn-primary" data-lgb="play">לנסות שוב</button></div>`; }
  p.querySelectorAll('[data-lgb]').forEach(b => b.onclick = () => {
    const a = b.dataset.lgb; SFX.tap();
    if (a === 'rp') lgReplay(); else if (a === 'go') { lgReset(); lgPane('task'); } else if (a === 'play') lgPlay();
    else if (a === 'again') { lgReset(); lgPane('task'); } else if (a === 'list') { LGS = null; renderLegends(); }
  });
}

/* ----- canvas and drawing ----- */
function lgCanvas() {
  const cv = document.getElementById('lgc'), m = LGS.m, [x0, x1, y1] = m.view, dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.max(260, cv.parentElement.clientWidth), sc = W / (x1 - x0), yv = Math.max(y1, (x1 - x0) * 1.1 - 3), H = Math.round((yv + 3) * sc);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  LGS.cv = cv; LGS.ctx = ctx; LGS.W = W; LGS.H = H; LGS.sc = sc; LGS.x0 = x0;
  const toM = e => { const r = cv.getBoundingClientRect(); return { x: x0 + (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc - 3 }; };
  let down = null;
  cv.onpointerdown = e => { if (!LGS || LGS.mode !== 'play') return; down = { p: toM(e), t: performance.now(), drag: false }; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => { if (!down) return; const p = toM(e); if (Math.hypot(p.x - down.p.x, p.y - down.p.y) > 1.2) down.drag = true; if (down.drag) LGS.runTo = p; };
  cv.onpointerup = e => { if (!down) return; const p = toM(e); if (!down.drag) lgTap(p.x, p.y); down = null; };
}
const lgPx = (x, y) => [(x - LGS.x0) * LGS.sc, (y + 3) * LGS.sc];
function lgDraw() {
  const { ctx, W, H, sc } = LGS, P = lgPx, m = LGS.m;
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i * 5 < 60; i++) { ctx.fillStyle = i % 2 ? '#2E8B47' : '#33974E'; const [, y] = P(0, i * 5 - 3); ctx.fillRect(0, y, W, 5 * sc); }
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2;
  const ln = (a, b, c, d) => { const p = P(a, b), q = P(c, d); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); };
  const rc = (a, b, c, d) => { ln(a, b, c, b); ln(c, b, c, d); ln(c, d, a, d); ln(a, d, a, b); };
  ln(0, 0, 68, 0); ln(0, 0, 0, 60); ln(68, 0, 68, 60); rc(13.84, 0, 54.16, 16.5); rc(24.84, 0, 43.16, 5.5); ln(0, 52.5, 68, 52.5);
  ctx.beginPath(); ctx.arc(...P(34, 11), 9.15 * sc, Math.PI * .2, Math.PI * .8); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(...P(34, 11), 2.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(...P(34, 52.5), 9.15 * sc, Math.PI, 0); ctx.stroke();
  /* the goal: net behind the line */
  const [gx, gy] = P(LG_GOAL[0], -2.2), gw = (LG_GOAL[1] - LG_GOAL[0]) * sc;
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(gx, gy, gw, 2.2 * sc); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeRect(gx, gy, gw, 2.2 * sc);
  if (LGS.mode === 'play' && LGS.carrier && LGS.carrier.y < 32) { ctx.fillStyle = 'rgba(255,214,90,.22)'; ctx.fillRect(gx, gy, gw, 2.2 * sc); }
  if (LGS.runTo && LGS.mode === 'play') { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(...P(LGS.runTo.x, LGS.runTo.y), 6, 0, 7); ctx.stroke(); }
  const R = Math.max(7, 1.05 * sc);
  for (const p of LGS.ps) {
    const [x, y] = P(p.x, p.y), us = p.team === 'us';
    if (p === LGS.carrier) { ctx.strokeStyle = '#FFD65A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R + 5, 0, 7); ctx.stroke(); }
    else if (us && LGS.mode === 'play' && LGS.carrier && LGS.carrier.team === 'us') { const k = .5 + .5 * Math.sin(performance.now() / 200); ctx.strokeStyle = `rgba(255,255,255,${.35 + .4 * k})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, R + 4 + 2 * k, 0, 7); ctx.stroke(); }
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 3, R, R * .7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = us ? (m.us_c || '#E8364F') : p.role === 'keeper' || p.role === 'rush' ? '#7BD88F' : m.them;
    ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (p.fooled > 0) { ctx.fillStyle = '#fff'; ctx.font = `bold ${R * 1.2}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('?', x, y - R - 4); }
    ctx.font = `600 ${Math.max(10, R * .95)}px system-ui`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)';
    if (p.n !== 'מגן') { ctx.strokeText(p.n, x, y + R + 12); ctx.fillStyle = '#fff'; ctx.fillText(p.n, x, y + R + 12); }
  }
  const b = LGS.b, h = b.h || 0, [bx, by] = P(b.x, b.y);
  if (h > 0) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(bx, by, 4, 2.5, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by - h * sc, Math.max(4, .55 * sc) * (1 + h * .08), 0, 7); ctx.fill(); ctx.stroke();
  if (LGS.flash) { ctx.fillStyle = `rgba(255,214,90,${LGS.flash})`; ctx.fillRect(0, 0, W, H); LGS.flash = Math.max(0, LGS.flash - .03); }
}

/* ----- state ----- */
function lgReset() {
  lgStop(); const m = LGS.m;
  LGS.ps = m.us.map(([id, n, x, y, path, sp, start]) => ({ id, n, x, y, x0: x, y0: y, team: 'us', path: path ? path.slice() : null, sp: sp || 6.5, start: start || 0 }))
    .concat(m.opp.map(([id, n, x, y, role, sp]) => ({ id, n, x, y, x0: x, y0: y, team: 'them', role, sp: sp || 5, stick: 0, fooled: 0 })));
  LGS.carrier = LGS.ps.find(p => p.id === m.ball); LGS.b = { x: LGS.carrier.x, y: LGS.carrier.y, h: 0 }; LGS.fly = null; LGS.queue = null;
  LGS.runTo = null; LGS.t = 0; LGS.mode = 'idle'; LGS.chip = false; LGS.turned = false; LGS.over = false;
  const cap = document.getElementById('lgcap'); if (cap) cap.textContent = '';
  const tm = document.getElementById('lgtm'); if (tm) tm.textContent = '';
  lgDraw();
}
const lgP = id => LGS.ps.find(p => p.id === id);
function lgStop() { cancelAnimationFrame(LG_RAF); LG_RAF = 0; }
function lgLoop(step) {
  lgStop(); let last = performance.now();
  const f = now => {
    if (!LGS || S.view !== 'legends' || !document.getElementById('lgc')) return lgStop();
    const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); lgDraw();
    if (LG_RAF) LG_RAF = requestAnimationFrame(f);
  };
  LG_RAF = requestAnimationFrame(f);
}

/* ----- replay of the real move ----- */
function lgAt(tr, t) {
  let i = 0; while (i < tr.length - 1 && tr[i + 1][0] <= t) i++;
  const a = tr[i], b = tr[Math.min(i + 1, tr.length - 1)]; if (a === b || t <= a[0]) return [a[1], a[2]];
  const k = Math.min(1, (t - a[0]) / (b[0] - a[0])); return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}
function lgReplay() {
  lgReset(); const rp = LGS.m.rp, pane = document.getElementById('lgpane'), cap = document.getElementById('lgcap');
  pane.hidden = true; LGS.mode = 'replay';
  const ballPos = e => typeof e[1] === 'string' ? (p => [p.x, p.y])(lgP(e[1])) : [e[1], e[2]];
  lgLoop(dt => {
    LGS.t += dt; const t = LGS.t;
    for (const id in rp.tr) { const p = lgP(id); if (p) [p.x, p.y] = lgAt(rp.tr[id], t); }
    const bt = rp.ball; let i = 0; while (i < bt.length - 1 && bt[i + 1][0] <= t) i++;
    const a = bt[i], b = bt[Math.min(i + 1, bt.length - 1)], pa = ballPos(a);
    if (a === b || t <= a[0]) { [LGS.b.x, LGS.b.y] = pa; LGS.b.h = 0; }
    else { const pb = ballPos(b), k = Math.min(1, (t - a[0]) / (b[0] - a[0])); LGS.b.x = pa[0] + (pb[0] - pa[0]) * k; LGS.b.y = pa[1] + (pb[1] - pa[1]) * k; LGS.b.h = (rp.loft || []).includes(b[0]) ? Math.sin(k * Math.PI) * 2.6 : 0; }
    const c = rp.cap.filter(x => x[0] <= t).pop(); if (cap && c) cap.textContent = c[1];
    if (t >= rp.T) { lgStop(); LGS.mode = 'idle'; if (cap) cap.textContent = ''; lgPane('rpend'); }
  });
}

/* ----- playing ----- */
function lgPlay() {
  lgReset(); LGS.tries++; LGS.mode = 'play';
  document.getElementById('lgpane').hidden = true;
  const ctl = document.getElementById('lgctl'), m = LGS.m;
  ctl.innerHTML = (m.special === 'turn' ? '<button class="btn btn-boss btn-wide" id="lgsp">תפנית</button>' : m.special === 'chip' ? '<button class="btn btn-ghost btn-wide" id="lgsp">לוב: כבוי</button>' : '') + '<span class="small muted">גע בחבר = מסירה · גע בשער = בעיטה · גרור = ריצה</span>';
  const sp = document.getElementById('lgsp');
  if (sp) sp.onclick = () => { if (m.special === 'turn') lgTurn(); else { LGS.chip = !LGS.chip; sp.textContent = LGS.chip ? 'לוב: דלוק' : 'לוב: כבוי'; sp.classList.toggle('btn-primary', LGS.chip); sp.classList.toggle('btn-ghost', !LGS.chip); } };
  lgLoop(lgStep);
}
function lgTap(x, y) {
  if (!LGS || LGS.mode !== 'play') return;
  const c = LGS.carrier, mate = LGS.ps.filter(p => p.team === 'us' && p !== c).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  if (y < 3.5 && x > LG_GOAL[0] - 5 && x < LG_GOAL[1] + 5) {
    if (LGS.fly && LGS.fly.kind === 'pass') { LGS.queue = x; return; }
    if (c && c.team === 'us') return lgShoot(x);
    return;
  }
  if (mate && Math.hypot(mate.x - x, mate.y - y) < 3.2 && c && c.team === 'us' && !LGS.fly) return lgPass(mate);
  LGS.runTo = { x, y };
}
function lgPass(to) {
  const c = LGS.carrier; SFX.tap();
  const lead = to.path && to.path.length ? .35 : 0, tgt = lead ? { x: to.x + (to.path[0][0] - to.x) * lead * .3, y: to.y + (to.path[0][1] - to.y) * lead * .3 } : { x: to.x, y: to.y };
  const d = Math.hypot(tgt.x - c.x, tgt.y - c.y), lofted = d > 20 || LGS.m.id === 'istanbul';
  LGS.fly = { kind: 'pass', to, fx: c.x, fy: c.y, tx: tgt.x, ty: tgt.y, t: 0, dur: d / (lofted ? 19 : 22), lofted }; LGS.carrier = null; LGS.runTo = null;
}
function lgShoot(x) {
  const c = LGS.carrier; if (c.y > 32) { lgToast('רחוק מדי מהשער. התקרב קודם.'); return; }
  SFX.hit(); const chip = LGS.chip, ty = -1.2, d = Math.hypot(x - c.x, ty - c.y);
  const gk = LGS.ps.find(p => p.role === 'keeper' || p.role === 'rush');
  LGS.fly = { kind: chip ? 'chip' : 'shot', fx: c.x, fy: c.y, tx: x, ty, t: 0, dur: d / (chip ? 12 : 27), kd: 0, gkOut: gk && gk.y > 2.5 };
  LGS.carrier = null; LGS.runTo = null; LGS.chip = false;
}
function lgTurn() {
  const c = LGS.carrier, o = lgP('olsson'); if (!c || c.id !== 'cruyff' || LGS.turned) return;
  if (lgD(c, o) < 3.4) { LGS.turned = true; o.fooled = 1.6; o.fx = o.x + (c.x - o.x) * 2.5; o.fy = o.y + (c.y - o.y) * 2.5; c.dash = { x: c.x - 3, y: c.y - 2.5, t: .45 }; SFX.combo(); lgToast('תפנית! אולסון בכיוון הלא נכון'); }
  else lgToast('מוקדם מדי. חכה שאולסון יתקרב.');
}
function lgToast(t) { const cap = document.getElementById('lgcap'); if (cap) { cap.textContent = t; clearTimeout(LGS.capT); LGS.capT = setTimeout(() => { if (cap) cap.textContent = ''; }, 1600); } }
const lgMove = (p, tx, ty, sp, dt) => { const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy); if (d < .05) return; const s = Math.min(d, sp * dt); p.x += dx / d * s; p.y += dy / d * s; };
function lgEnd(win, msg) {
  if (LGS.over) return; LGS.over = true; LGS.mode = 'end'; LGS.runTo = null;
  const ctl = document.getElementById('lgctl'); if (ctl) ctl.innerHTML = '';
  if (!win) { SFX.no(); setTimeout(() => { lgStop(); lgPane('fail', msg); }, 700); return; }
  SFX.win(); LGS.flash = .5; burst(70);
  const st = LGS.tries <= 1 ? 3 : LGS.tries <= 3 ? 2 : 1, A = S.arcade || (S.arcade = {}), L = A.leg || (A.leg = {}), prev = L[LGS.m.id] || 0;
  if (st > prev) { const coins = (prev ? 0 : 10) + (st - prev) * 5; L[LGS.m.id] = st; S.coins += coins; S.xp += coins; lgToast(`+${coins} מטבעות`); }
  save(); setTimeout(() => { lgStop(); lgPane('win', st); }, 1300);
}
function lgStep(dt) {
  const m = LGS.m, c = LGS.carrier; LGS.t += dt;
  const tm = document.getElementById('lgtm'); if (tm && LGS.mode === 'play') tm.textContent = Math.max(0, Math.ceil(m.T - LGS.t));
  if (LGS.mode !== 'play' && LGS.mode !== 'end') return;
  /* our players: the carrier follows the finger, the others run their routes */
  for (const p of LGS.ps.filter(p => p.team === 'us')) {
    if (p.dash) { lgMove(p, p.dash.x, p.dash.y, 11, dt); p.dash.t -= dt; if (p.dash.t <= 0) p.dash = null; }
    else if (p === c && LGS.runTo) lgMove(p, LGS.runTo.x, LGS.runTo.y, p.sp, dt);
    else if (p !== c && p.path && p.path.length && LGS.t > p.start) { lgMove(p, p.path[0][0], p.path[0][1], p.sp, dt); if (Math.hypot(p.path[0][0] - p.x, p.path[0][1] - p.y) < .2) p.path.shift(); }
    p.x = Math.max(.5, Math.min(67.5, p.x)); p.y = Math.max(.3, p.y);
  }
  /* opponents */
  const ball = LGS.b;
  for (const o of LGS.ps.filter(p => p.team === 'them')) {
    const [role, a1, a2] = o.role.split(':');
    if (o.fooled > 0) { o.fooled -= dt; lgMove(o, o.fx, o.fy, 3, dt); continue; }
    if (role === 'keeper' || role === 'rush') {
      const f = LGS.fly;
      if (f && (f.kind === 'shot' || f.kind === 'chip')) { f.kd += dt; if (f.kd > .26) { const k = Math.min(1, f.t / f.dur + .12), tx = f.fx + (f.tx - f.fx) * k, ty = Math.max(.4, f.fy + (f.ty - f.fy) * k); lgMove(o, tx, ty, role === 'rush' ? 5.5 : 4, dt); } }
      else if (role === 'rush' && c && c.team === 'us' && c.y < 15 && Math.abs(c.x - 34) < 16) lgMove(o, c.x + (34 - c.x) * .12, c.y - 1.4, 6.2, dt);
      else { const gx = 34, d = Math.hypot(ball.x - gx, ball.y) || 1, tx = gx + (ball.x - gx) / d * 1, ty = Math.max(.6, ball.y / d * 1); lgMove(o, tx, ty, 4, dt); }
      continue;
    }
    if (role === 'press' && c) { if (!a1 || lgD(o, c) < +a1) lgMove(o, c.x, c.y, o.sp, dt); else lgMove(o, o.x0, o.y0, 2, dt); }
    else if (role === 'press' && LGS.fly && LGS.fly.to) lgMove(o, LGS.fly.to.x, LGS.fly.to.y, o.sp * .8, dt);
    else if (role === 'mark') { const t = lgP(a1); const gx = 34, d = Math.hypot(t.x - gx, t.y) || 1; lgMove(o, t.x + (gx - t.x) / d * 1.6, t.y - t.y / d * 1.6, o.sp, dt); if (c === t) lgMove(o, t.x, t.y, o.sp * .6, dt); }
    else if (role === 'wake') { if (LGS.t > +a2) { const t = c || (LGS.fly && LGS.fly.to) || lgP(a1); lgMove(o, t.x, t.y, o.sp, dt); } else lgMove(o, o.x0 + (o.x0 < 34 ? -4 : 4), o.y0 + 6, 1.2, dt); }
    else if (role === 'cruyff' && c) lgMove(o, c.x, c.y, LGS.turned ? o.sp * .75 : lgD(o, c) < 2.6 ? 1.2 : o.sp * .45, dt);
    /* a tackle: staying next to the carrier for a moment wins the ball */
    if (c && c.team === 'us' && !c.dash && lgD(o, c) < 1.25) { o.stick += dt; if (o.stick > .28 && LGS.mode === 'play') return lgEnd(false, `${o.n === 'מגן' ? 'המגן' : o.n} לקח לך את הכדור. ${m.id === 'cruyff' ? 'אי אפשר לברוח ממנו סתם: חכה שיתקרב ואז תפנית.' : m.id === 'maradona' ? 'חפש את הרווח בין המגינים, ואל תרוץ ישר אליהם.' : 'צריך לפעול מהר יותר.'}`); }
    else o.stick = Math.max(0, o.stick - dt);
  }
  /* the ball */
  if (c) { ball.x = c.x; ball.y = c.y - .9; ball.h = 0; }
  const f = LGS.fly;
  if (f) {
    f.t += dt; const k = Math.min(1, f.t / f.dur);
    ball.x = f.fx + (f.tx - f.fx) * k; ball.y = f.fy + (f.ty - f.fy) * k;
    ball.h = f.kind === 'chip' ? Math.sin(k * Math.PI) * 3 : f.lofted ? Math.sin(k * Math.PI) * 2.5 : 0;
    for (const o of LGS.ps.filter(p => p.team === 'them')) {
      const keeper = o.role === 'keeper' || o.role === 'rush', d = Math.hypot(o.x - ball.x, o.y - ball.y);
      if (f.kind === 'chip') { if (keeper && !f.gkOut && d < 1.3 && k > .8) return lgSave(o, 'השוער תפס את הלוב. לוב עובד רק כשהשוער יצא מהשער.'); continue; }
      if (f.lofted && !keeper && ball.h > 1.4) continue;
      if (f.kind === 'pass' && d < (keeper ? 1.2 : 1)) return lgSave(o, keeper ? 'השוער יצא ותפס את המסירה.' : 'המגן חטף את המסירה. מסור כשאין מגן בדרך.');
      if (f.kind === 'shot' && d < (keeper ? (m.special === 'chip' && o.y > 2.5 ? 1.8 : .9) : .9) && (keeper || k < .5)) return lgSave(o, keeper ? (m.special === 'chip' && o.y > 2.5 ? 'השוער יצא וחסם את הבעיטה. בדיוק בשביל זה יש לוב.' : 'השוער הציל. כוון לפינה שרחוקה ממנו.') : 'מגן חסם את הבעיטה.');
    }
    if (k >= 1) {
      if (f.kind === 'pass') { LGS.carrier = f.to; LGS.fly = null; f.to.path = null; if (LGS.queue != null) { const q = LGS.queue; LGS.queue = null; lgShoot(q); } }
      else if (ball.x > LG_GOAL[0] && ball.x < LG_GOAL[1]) return lgEnd(true);
      else return lgEnd(false, 'החטאת את השער. כוון בין שני העמודים.');
    }
  }
  if (LGS.mode === 'play' && LGS.t > m.T) lgEnd(false, 'הזמן נגמר וההגנה התארגנה. נסה לפעול מהר יותר.');
}
function lgSave(o, msg) { LGS.fly = null; LGS.b.h = 0; LGS.b.x = o.x; LGS.b.y = o.y; lgEnd(false, msg); }

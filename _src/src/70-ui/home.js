/* what the home screen offers next, in order of importance */
function nextStep() {
  if (S.cur) return 'resume';
  const nd = nextDay();
  if (nd && nd <= unlocked()) return 'mission';
  if (dueMist().length >= 3 && S.reviewDay !== todayStr()) return 'review';
  if (dueLearn().length && !S.guest) return 'learn';
  let s = S.bonusDay !== todayStr() ? 'bonus' : nd ? 'done' : 'finished';
  if ((s === 'bonus' || s === 'done') && S.duoWeek !== weekKey() && S.duoSkip !== todayStr() && doneCount(S) >= 2 && !S.guest) s = 'duo';
  if ((s === 'bonus' || s === 'done') && canXtra()) s = 'xtra';
  return s;
}
function todayChips(step) {
  const t = todayStr(), revNeeded = dueMist().length >= 3 || S.reviewDay === t;
  const it = [['משימה', missionToday() || (step !== 'mission' && step !== 'resume')], ...(revNeeded ? [['חזרה', S.reviewDay === t]] : []), ['בונוס', S.bonusDay === t]];
  return `<div class="today"><span class="muted small">היום:</span>${it.map(([n, ok]) => `<span class="tchk ${ok ? 'ok' : ''}">${ok ? '✓' : '○'} ${n}</span>`).join('')}</div>`;
}
function heroFor(step) {
  const nd = nextDay(), W = curWorld(), cur = S.cur;
  const line = (dayDiff(S.start, todayStr()) % 3 === 0) ? W.line : LINES[(dayDiff(S.start, todayStr()) + LINES.length * 9) % LINES.length];
  if (step === 'xtra') {
    const w = weakChapter(), n = xtraToday() + 1;
    return `<section class="card hero xhero"><div class="eyebrow">המשימה של היום הושלמה · בונוס ${n} מתוך ${XTRA_MAX}</div><div class="stage"><div class="grow"><div class="bubble">רוצה עוד? משימת בונוס של 10 שאלות, חצי מהן ב${w.n}. נקודות מלאות, ו-9 מתוך 10 שווה יהלום.</div></div><div class="who">${avatarSVG()}</div></div><button class="btn btn-primary btn-wide" data-act="xtra">משימת בונוס</button><button class="btn btn-ghost btn-wide" data-act="xtraskip" style="margin-top:8px">מספיק להיום</button></section>`;
  }
  if (step === 'learn') return learnCard('home');
  if (step === 'duo') return `<section class="card hero duohero"><div class="eyebrow">פעם בשבוע · יהלום</div><div class="stage"><div class="grow"><div class="bubble">3 שאלות קשות, פותרים יחד עם אבא. כל אחד אומר בקול מה הוא חושב.</div></div><div class="who">${avatarSVG()}</div></div><button class="btn btn-primary btn-wide" data-act="duo">אתגר עם אבא</button><button class="btn btn-ghost btn-wide" data-act="duoskip" style="margin-top:8px">לא היום</button></section>`;
  if (step === 'resume') {
    const lbl = { practice: 'אימון', review: 'חזרה מהמחברת', sim: 'סימולציה', boss: 'קרב בוס', daily: 'משימה' }[cur.kind];
    return `<section class="card hero ${cur.kind === 'boss' ? 'boss' : ''}"><div class="eyebrow">באמצע ${lbl}</div><h2>ממשיכים</h2><p>שאלה ${cur.i + 1} מתוך ${cur.qs.length}</p><button class="btn btn-primary btn-wide" data-act="resume">להמשיך</button></section>`;
  }
  if (step === 'mission') {
    const kind = nodeKind(nd), B = BOSSES[nd];
    if (kind === 'boss') return `<section class="card hero boss" style="--bc:${EC[B.el] || '#7B5CFF'}"><div class="eyebrow">${nd === TOTAL ? 'הגמר הגדול' : 'קרב בוס · ' + worldOf(nd).n}</div><div class="stage"><div class="grow"><div class="bubble">"${B.line}"</div></div><div class="who">${bossSVG(B)}</div></div><h2>${B.n}</h2><p>15 שאלות · 20 דקות · ניצחון = 70%</p><button class="btn btn-boss btn-wide" data-act="start">לקרב!</button></section>`;
    if (kind === 'sim') { const full = SIMDAYS[nd] === 'full'; return `<section class="card hero" style="background:linear-gradient(155deg,rgba(169,139,255,.28),var(--panel) 60%)"><div class="eyebrow">משימה ${nd} · יום מבחן</div><div class="stage"><div class="grow"><div class="bubble">היום מתאמנים בדיוק כמו במבחן האמיתי.</div></div><div class="who" style="display:grid;place-items:center;color:var(--violet)">${IC.clock.replace('<svg', '<svg style="width:70px;height:70px"')}</div></div><h2>${full ? 'סימולציה מלאה' : 'חצי סימולציה'}</h2><p>6 פרקים · ${full ? '72 שאלות · 72 דקות' : '36 שאלות · 36 דקות'} · כדאי לשבת במקום שקט</p><button class="btn btn-boss btn-wide" data-act="start">מתחילים</button></section>`; }
    return `<section class="card hero" style="--wc:${EC[W.k]}">${worldScene(W.k, 'hero')}<div class="eyebrow">${W.n} · משימה ${nd}/${TOTAL}</div><div class="stage"><div class="grow"><div class="bubble">${line}</div></div><div class="who">${avatarSVG()}</div></div><p>${(MODS[modFor(nd)] || MODS.classic).n} · 10 שאלות${dueMist().length ? ` · ${Math.min(2, dueMist().length)} מהמחברת` : ''}</p><button class="btn btn-primary btn-wide" data-act="start">יאללה, ${nm()}!</button></section>`;
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
  const mini = `<div class="mini"><div data-tap5><i class="mi">${IC.clock}</i><b>${toExam}</b><span>ימים למבחן</span></div><div><i class="mi fl">${IC.flame}</i><b>${curStreak()}</b><span>ימים ברצף</span></div><div><i class="mi">${IC.flag}</i><b>${doneCount(S)}/${TOTAL}</b><span>משימות</span></div></div>`;
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
      const locked = !m && !isOpen && (k > un || k > (nd || 99));
      path += `<div class="pn${isOpen ? ' now' : ''}" style="--x:${x}%">${isOpen ? `<span class="go ${x > 0 ? 'go-l' : 'go-r'}">התחל</span>` : ''}<button class="${cls}" data-node="${k}" aria-label="משימה ${k}">${inner}${m ? `<span class="st">${'★'.repeat(st)}${'<i>★</i>'.repeat(3 - st)}</span>` : ''}${locked && kind !== 'boss' ? `<span class="lk">${IC.lock || ''}</span>` : ''}${k === bdDay ? giftSVG : ''}</button></div>`;
    }
    return `<section class="world ${open ? 'open' : ''}" style="--wc:${EC[Wd.k]}"><button class="wbanner" data-world="${Wd.k}"><span class="wi">${elemIcon(Wd.k)}</span><div><b>${Wd.n}</b><span>${done}/15</span></div><span class="chev">${IC.chev}</span></button><div class="wbar"><i style="width:${done / 15 * 100}%"></i></div>${open ? `<div class="path">${worldScene(Wd.k)}${path}</div>` : ''}</section>`;
  }).join('');
  /* above the hero: how diamonds work (until seen), a morning hint, and the dad-phone shortcut */
  let pre = '';
  if (!S.diaHelpSeen && doneCount(S) >= 1) pre += `<button class="diagoal" data-act="diasheet">${DIA}<span>איך מרוויחים יהלומים, ומה מקבלים עליהם? לחץ כאן</span></button>`;
  pre += morningHint() || '';
  if (isDadPhone() && !isSbx()) pre += `<button class="banner dadban" data-go="parent"><span style="width:40px;height:40px;flex:none">${IC.chart}</span><div class="grow"><b>זה הטלפון של אבא</b><div class="small muted">לדוח של ${ME.name} מהענן</div></div></button>`;
  const road = S.guest || isDadPhone() ? '' : roadMini();
  return `<div class="stack">${hud()}${bd}${todayChips(step)}${pre}${heroFor(step)}${road}${mini}<div class="sec-h"><h3>המסע</h3></div>${map}</div>`;
}
/* ---------- 6. time of day ---------- */
function morningHint() {
  const d = new Date(), h = d.getHours(), wd = d.getDay();
  if (wd > 4 || h < 6 || h > 8 || missionToday()) return '';
  return `<div class="banner calm"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#FFC845" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5" fill="#FFC845"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg><div class="grow">בוקר לפני בית ספר? משימה בראש רגוע יוצאת טובה יותר. אפשר גם אחרי הצהריים.</div></div>`;
}

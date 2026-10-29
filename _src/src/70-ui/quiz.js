function renderIntro(c) {
  const W = worldOf(c.day);
  let title, body, extra, icon;
  if (c.kind === 'lesson') { title = `שיעור: ${lkName(c.lkey)}`; body = 'כשעונים מהר מדי בלי לדעת, או נתקעים הרבה זמן, זה סימן שעוד לא לימדנו את הדרך. עכשיו נלמד אותה.'; extra = `<b>הכלל:</b> ${(LESSONS[c.lkey] || LESSONS.logic)[1]}<br>${c.guide ? 'קודם שיעור צעד אחר צעד, ואחר כך 3 שאלות.' : 'קודם דוגמה פתורה, ואחר כך 3 שאלות.'} בראשונה הרמז כבר פתוח.`; icon = IC.book; }
  else if (c.kind === 'daily') { const M = MODS[c.mod] || MODS.classic; title = `משימה ${c.day}: ${M.n}`; body = briefFor(c.day); extra = M.d; icon = elemIcon(W.k); }
  else if (c.kind === 'boss') { const B = BOSSES[c.day]; title = B.n; body = `"${B.line}"`; extra = '15 שאלות, 20 דקות. ניצחון = 70%. אין רמזים, אבל אפשר לדלג ולחזור.'; icon = bossSVG(B); }
  else { const per = c.chapters[0].mins; title = (c.path ? `משימה ${c.day}: ` : '') + (c.size === 'full' ? 'סימולציה מלאה' : 'חצי סימולציה'); body = `6 פרקים, בדיוק כמו במבחן האמיתי. בכל פרק ${per} שאלות ו-${per} דקות, כלומר דקה לשאלה. כשהזמן של פרק נגמר עוברים לפרק הבא, ואי אפשר לחזור אחורה.`; extra = c.chapters.map((ch, i) => `${i + 1}. ${ch.n}`).join('<br>'); icon = IC.clock; }
  const goal = diaGoalLine(c);
  app.innerHTML = `<div class="stack"><div class="card intro-card ${c.kind === 'boss' ? 'boss' : ''}" style="--wc:${EC[W.k]}"><span class="ii">${icon}</span><div class="eyebrow">${c.kind === 'sim' ? 'כמו ביום המבחן' : W.n}</div><h2>${title}</h2><p class="brief">${body}</p><div class="mod">${extra}</div>
  ${goal ? `<button class="diagoal" data-act="diasheet">${DIA}<span>${goal}</span></button>` : ''}<button class="btn ${c.kind === 'boss' ? 'btn-boss' : 'btn-primary'} btn-wide" data-act="go">${c.kind === 'boss' ? 'לקרב!' : c.kind === 'lesson' ? (c.guide ? 'לשיעור' : 'לדוגמה') : 'יאללה!'}</button><button class="btn btn-ghost btn-wide" data-act="quitintro">לא עכשיו</button></div></div>`;
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
    fb = r.demo ? `<div class="fb demo"><h4><span class="fbi">${IC.book}</span>דוגמה פתורה</h4><p class="small muted" style="margin:0 0 6px">קרא לאט ונסה להבין כל צעד. אחר כך תורך.</p><p class="solx">${q.ex}</p></div>` : `<div class="fb ${r.ok ? 'ok' : 'no'}"><h4><span class="fbi">${r.ok ? '✓' : IC.book}</span>${r.ok ? (r.second ? pick(['תיקנת!', 'יפה, בניסיון השני!', 'זה הרעיון!']) : pick(['נכון!', 'מעולה!', 'בול!', 'גאוני!', 'סל!', 'גול!', 'פגיעה ישירה!'])) + (r.gain ? ` +${r.gain}` : '') : 'התשובה: ' + ansTxt} ${tchip}</h4>${r.praise ? `<div class="praise">${IC.bolt}<span>${r.praise}</span></div>` : ''}${r.newRule || strip(q.ex).length < 160 ? `<div class="rule"><span class="rt">${r.newRule ? 'כלל חדש' : 'הכלל'}</span><span>${LS[1]}</span></div>` : ''}${r.ok ? `<details class="sol"><summary>איך פותרים</summary><p>${q.ex}</p></details>` : `<p class="solx">${q.ex}</p>`}${mnote(q, r, c)}${r.learnQ ? learnNote(r.learnQ) : ''}${dadHTML(r.love)}${bugBtn('data-qbug="cur"', mistId(q))}</div>`;
  }
  const tried = !answered && c.tried && c.tried.i === c.i;
  const hint = tried ? retryBox(q, c.tried) : q.twin && !answered ? `<div class="hintbox"><b>הכלל:</b> ${(LESSONS[lessonFor(q)] || LESSONS.logic)[1]}</div>` : c.hint && !answered ? `<div class="hintbox"><span class="hi">${IC.bulb}</span><div><b>רמז</b><p>${hintText(q, 1)}</p></div></div>` : '';
  const comboTag = c.combo >= 2 && !deferred(c.kind) ? `<span class="combo">${IC.flame}${c.combo}</span>` : '';
  let battle = '';
  if (c.kind === 'boss') {
    const B = BOSSES[c.day] || BOSSES[7], hits = c.res.filter(x => x && x.ok).length, bhp = Math.max(0, 100 - Math.round(hits / Math.ceil(c.qs.length * .7) * 100));
    battle = `<div class="battle" style="--bc:${EC[B.el] || '#7B5CFF'}"><div class="fighter"><span class="pic" id="meF">${avatarSVG()}</span><b>${nm()}</b><div class="hp"><i style="width:${c.hp * 20}%"></i></div></div><div class="vs">VS</div><div class="fighter"><span class="pic" id="bossF">${bossSVG(B)}</span><b>${B.n}</b><div class="hp bhp"><i style="width:${bhp}%"></i></div></div></div>`;
  }
  const chTag = c.chapters ? `<div class="chbar"><b>פרק ${c.ch + 1}/${c.chapters.length}</b> · ${c.chapters[c.ch].n}</div>` : '';
  const hintLbl = c.hint ? 'רמז נפתח' : c.freeHint ? 'רמז (חינם)' : S.hints > 0 ? `רמז (${S.hints} חינם)` : 'רמז (−3 נק׳)';
  const foot = answered ? `<button class="btn btn-primary" data-act="next">${r.demo ? 'הבנתי, עכשיו תורי' : c.i === c.qs.length - 1 ? 'לסיכום' : 'לשאלה הבאה'}</button>`
    : deferred(c.kind) ? `<button class="btn btn-ghost" data-act="skip">דלג וחזור אחר כך</button>`
      : (c.mod === 'nohint' || q.champ) ? `<button class="btn btn-ghost" disabled>${q.champ ? 'שאלת האלוף: בלי רמזים' : 'היום בלי רמזים'}</button>` : `<button class="btn btn-ghost btn-hint" data-act="hint" ${c.hint || tried ? 'disabled' : ''}>${IC.bulb}${hintLbl}</button>`;
  const el = Math.floor((Date.now() - c.qStart) / 1000);
  const pace = answered ? '' : `<div class="pace ${c.mod === 'blitz' ? 'blitz' : ''}" title="יעד: דקה לשאלה"><i style="animation-delay:-${Math.min(el, 60)}s"></i></div>`;
  /* guided lesson: a chip on every shape question, and an offer the first time a question type appears */
  const gkey = !deferred(c.kind) && !r ? lessonFor(q) : null, guide = gkey && SHAPE_KEYS[gkey] ? gkey : null;
  const gchip = guide ? `<button class="chip gbtn" data-guide="${guide}">איך פותרים?</button>` : '';
  const gfirst = guide && !(S.guideSeen || {})[guide] ? `<div class="gfirst"><b>סוג שאלה חדש: ${SHAPE_KEYS[guide]}</b><span>שיעור של דקה, עם דוגמה. אחרי זה, השאלה שלך.</span><div class="row" style="gap:8px;margin-top:8px"><button class="btn btn-primary" data-guide="${guide}" style="flex:1;min-height:40px">כן, תראו לי</button><button class="btn btn-ghost" data-gskip="${guide}" style="flex:1;min-height:40px">אני יודע</button></div></div>` : '';
  const duo = c.duo ? '<div class="duo">אתגר עם אבא: כל אחד אומר בקול מה הוא חושב, ורק אז בוחרים.</div>' : '';
  app.innerHTML = `<div class="qbar"><button class="icon-btn" data-act="quit" aria-label="יציאה">${IC.x}</button><div class="pdots">${dots}</div><div class="qmeta"><span class="pts">${c.pts} נק׳</span><span class="tm" id="tm"></span></div></div>${chTag}${battle}
  <div class="card ${q.champ ? 'champq' : ''}"><div class="qtop"><span class="tag ${q.rev ? 'rev' : ''}">${q.champ ? 'שאלת האלוף · ' : q.rev ? (q.twin ? 'מהמחברת · גרסה קלה · ' : 'מהמחברת · ') : ''}${CATS[q.cat].n}</span>${comboTag}<span class="lvl">רמה ${lvl}</span>${gchip}</div>${duo}${pace}
  ${gfirst}<p class="qprompt">${q.prompt}</p><div class="qvis">${answered && q.evidence && q.vis.includes(q.evidence) ? q.vis.replace(q.evidence, `<mark class="ev">${q.evidence}</mark>`) : q.vis}</div>${body}${hint}${fb}</div>
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
function floatPts(el, txt) { if (!el) return; const r0 = el.getBoundingClientRect(); const f = document.createElement('div'); f.className = 'floater'; f.textContent = txt; f.style.left = (r0.left + r0.width / 2 - 20) + 'px'; f.style.top = r0.top + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1000); }
/* 2. a double tap on "next" must not land on the hint or on an answer of the new question */
let TAP_LOCK = 0, TAP_KEY = '';

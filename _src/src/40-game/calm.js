let FUN_T = null, FUN_RAF = null;
function stopFun() { clearTimeout(FUN_T); cancelAnimationFrame(FUN_RAF); FUN_T = FUN_RAF = null; }
function renderOffer(o) {
  stopFun();
  const body = o === 'break'
    ? `<div class="eyebrow">הפסקה קטנה</div><h2>זה מתיש עכשיו?</h2><p class="brief">גם אלופים עוצרים לנשום. 20 שניות, וחוזרים חדים יותר.</p><div class="stack" style="gap:8px"><button class="btn btn-primary btn-wide" data-fun="breath">נשימת אוויר (כמו אנג)</button><button class="btn btn-gold btn-wide" data-fun="hoops">זריקות לסל (15 שניות)</button><button class="btn btn-ghost btn-wide" data-fun="go">להמשיך</button></div>`
    : `<div class="eyebrow">זה קל לך</div><h2>להקפיץ רמה?</h2><p class="brief">4 נכונות ברצף, בלי למהר. רוצה ששאר המשימה תהיה קשה יותר? שאלה קשה שווה יותר נקודות.</p><div class="stack" style="gap:8px"><button class="btn btn-primary btn-wide" data-fun="boost">כן, להקפיץ!</button><button class="btn btn-ghost btn-wide" data-fun="go">ככה טוב לי</button></div>`;
  app.innerHTML = `<div class="stack"><div class="card intro-card offer">${body}</div></div>`;
  app.querySelectorAll('[data-fun]').forEach(b => b.onclick = () => {
    const a = b.dataset.fun; SFX.tap();
    if (a === 'go') return nextQ();
    if (a === 'boost') { const c = S.cur; for (let k = c.i + 1; k < c.qs.length; k++) { const q = c.qs[k]; if (q.rev) continue; c.qs[k] = mkQ(q.cat, Math.min(4, q.d + 1), .2); } toast('הרמה עלתה. בהצלחה!'); return nextQ(); }
    if (a === 'breath') return renderBreath();
    if (a === 'hoops') return renderHoops();
  });
}
function renderBreath() {
  const steps = [['שאיפה', 4], ['להחזיק', 2], ['נשיפה', 4], ['שאיפה', 4], ['להחזיק', 2], ['נשיפה', 4]];
  app.innerHTML = `<div class="stack"><div class="card intro-card breath"><div class="eyebrow">נשימת אוויר</div><div class="bcirc"><span class="ii">${elemIcon('air')}</span></div><h2 id="bstep">מתכוננים...</h2><button class="btn btn-ghost btn-wide" data-fun="done">חוזרים למשימה</button></div></div>`;
  const circ = app.querySelector('.bcirc'), lbl = app.querySelector('#bstep');
  app.querySelector('[data-fun="done"]').onclick = () => { stopFun(); nextQ(); };
  let k = 0;
  const run = () => { if (k >= steps.length) { lbl.textContent = 'מעולה. ראש נקי.'; circ.style.transform = 'scale(.8)'; return; } const [t, s] = steps[k++]; lbl.textContent = t; circ.style.transitionDuration = s + 's'; circ.style.transform = t === 'שאיפה' ? 'scale(1.25)' : t === 'נשיפה' ? 'scale(.7)' : circ.style.transform; if (t !== 'להחזיק') tone(t === 'שאיפה' ? 392 : 294, 0, s * .9, 'sine', .035); FUN_T = setTimeout(run, s * 1000); };
  FUN_T = setTimeout(run, 600);
}
function renderHoops() {
  let score = 0, shots = 0, t0 = performance.now(), end = t0 + 15000, lock = false, speed = 1;
  app.innerHTML = `<div class="stack"><div class="card intro-card hoops"><div class="eyebrow">זריקות לסל</div><div class="court"><div class="hoop"></div><div class="ballrow"><span class="ball" id="ball"></span></div></div><div class="hstat"><b id="hsc">0</b> סלים · <span id="htm">15</span> שנ׳</div><p class="small muted" style="margin:0">לוחצים כשהכדור בדיוק מתחת לסל.</p><button class="btn btn-gold btn-wide" id="throw">זרוק!</button><button class="btn btn-ghost btn-wide" data-fun="done">חוזרים למשימה</button></div></div>`;
  const ball = app.querySelector('#ball'), sc = app.querySelector('#hsc'), tm = app.querySelector('#htm'), th = app.querySelector('#throw');
  let x = 50;
  const loop = now => { if (now > end) return finishH(); x = 50 + 44 * Math.sin((now - t0) / 1000 * 2.1 * speed); ball.style.left = x + '%'; tm.textContent = Math.ceil((end - now) / 1000); FUN_RAF = requestAnimationFrame(loop); };
  const finishH = () => { stopFun(); S.arcade.hoops = Math.max(S.arcade.hoops || 0, score); save(); th.disabled = true; th.textContent = `${score} סלים${score >= (S.arcade.hoops || 0) && score ? ' · שיא!' : ''}`; };
  th.onclick = () => { if (lock) return; lock = true; shots++; const hit = Math.abs(x - 50) < 8; ball.classList.add(hit ? 'in' : 'miss'); if (hit) { score++; speed += .12; sc.textContent = score; SFX.ok(); } else tone(200, 0, .1, 'sine', .05); setTimeout(() => { ball.classList.remove('in', 'miss'); lock = false; }, 380); };
  app.querySelector('[data-fun="done"]').onclick = () => { stopFun(); nextQ(); };
  FUN_RAF = requestAnimationFrame(loop);
}

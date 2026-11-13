/* ---------- games ---------- */
let G = null, RAF = 0;
const BEST_LOW = { memory: 1 };   /* lower is better */
const BEST_LBL = { memory: 'מהלכים' };
function gameWords(n) {
  const cur = curList(), out = [], seen = new Set();
  const pool = [...shuffle(cur ? cur.words : []), ...shuffle(allClass().filter(l => l !== cur).flatMap(l => l.words)), ...shuffle(PACKS.flatMap(p => p.words))];
  for (const w of pool) { if (seen.has(kOf(w))) continue; seen.add(kOf(w)); out.push(w); if (out.length >= n) break; }
  return out;
}
function setBest(k, v) { const b = S.best[k]; const better = b == null || (BEST_LOW[k] ? v < b : v > b); if (better) S.best[k] = v; return better; }
function startGame(k) { G = GAMES[k].init(); G.k = k; G.t0 = Date.now(); S.view = 'game'; save(); render(); if (GAMES[k].start) GAMES[k].start(); }
VIEWS.game = () => { if (!G || G.over) { G = null; S.view = 'home'; return VIEWS.home(); } GAMES[G.k].view(); on('[data-act="gquit"]', () => { G = null; go('home'); }); };
const gBar = (t, right) => `<header class="bar"><button class="icon-btn" data-act="gquit" aria-label="יציאה">${IC.x}</button><h2>${t}</h2><span class="pill">${right}</span></header>`;
function gameOver(title, html, candy, again) {
  if (G) { G.over = 1; track('g', { g: G.k, sc: G.k === 'memory' ? G.moves : (G.score != null ? G.score : (G.sc || null)), dur: Math.round((Date.now() - G.t0) / 1000) }); } clearTimers(); KB = null;
  addCandy(candy); markDay(); save();
  modal(title, `${html}<div class="center earned">+${candy} ${CANDY(26)}</div>`, [['עוד פעם', again], ['למסך הבית', () => { G = null; go('home'); }]]);
}
const GAMES = {};
/* 1. trampoline: tap the letters in order; every right letter = a higher jump, a full word = a flip */
GAMES.tramp = {
  init: () => ({ ws: gameWords(6), i: 0, score: 0, combo: 0, miss: 0, pos: 0 }),
  start: () => sayWord(G.ws[0]),
  view() {
    const w = G.ws[G.i]; G.tiles = G.tiles && G.tw === w ? G.tiles : makeTiles(w.en, 2); G.tw = w;
    app.innerHTML = `<div class="page play">${gBar('טרמפולינה', `${G.score} נק׳`)}
    <div class="scene"><div class="trail" dir="ltr">${esc(w.en.toLowerCase().slice(0, G.pos))}</div><div class="tr-romi" id="tr">${romiSVG()}</div><div class="tramp"></div></div>
    <div class="prompt rp">${w.em ? `<span class="em">${w.em}</span>` : ''}<div class="he">${w.he.map(esc).join(' / ')}</div>${sayBtn()}<span class="small muted">מילה ${G.i + 1}/${G.ws.length}${G.combo > 2 ? ` · רצף ${G.combo}!` : ''}</span></div>
    <section class="ans"><div id="typed"></div>${tilesHTML(G.tiles)}</section></div>`;
    on('[data-say]', () => sayWord(w));
    const target = w.en.toLowerCase().replace(/ /g, '');
    bindKbd({ lang: 'en', tiles: G.tiles, word: w.en.toLowerCase(), onEnter: () => {
      KB.lock = true; G.score += 20 + G.combo * 2; SFX.combo(); jump(true); sayWord(w);
      later(() => { G.i++; G.pos = 0; G.miss = 0; G.tiles = null; if (G.i >= G.ws.length) return GAMES.tramp.end(); render(); sayWord(G.ws[G.i]); }, 1400);
    }, onTile: (c, b) => {
      if (c !== target[G.pos]) { G.combo = 0; G.miss++; SFX.no(); b.classList.add('shake'); later(() => b.classList.remove('shake'), 400); jump(false);
        if (G.miss >= 2) app.querySelectorAll('[data-ti]').forEach(x => { if (!x.disabled && G.tiles[+x.dataset.ti] === target[G.pos]) x.classList.add('glow'); });
        return false; }
      G.pos++; G.combo++; G.miss = 0; G.score += 5 * Math.min(G.combo, 6); app.querySelectorAll('.glow').forEach(x => x.classList.remove('glow'));
      jump(); const tr = app.querySelector('.trail'); if (tr) tr.textContent = target.slice(0, G.pos); const sc = app.querySelector('.bar .pill'); if (sc) sc.textContent = `${G.score} נק׳`;
      return true;
    } });
  },
  end() { const nb = setBest('tramp', G.score); gameOver('איזה קפיצות!', `<p class="center">${G.score} נקודות${nb ? ' · שיא חדש! 🏆' : ''}</p>`, 2 + Math.floor(G.score / 60), () => startGame('tramp')); },
};
function jump(flip) {
  const r = document.getElementById('tr'); if (!r) return;
  if (flip === false) { r.classList.remove('boing', 'tflip', 'wobble'); void r.offsetWidth; r.classList.add('wobble'); return; }
  r.style.setProperty('--h', `${Math.min(150, 30 + G.pos * 14)}px`);
  r.classList.remove('boing', 'tflip', 'wobble'); void r.offsetWidth; r.classList.add(flip ? 'tflip' : 'boing');
}
/* 2. candy memory: pairs of English word and its meaning */
GAMES.memory = {
  init: () => { const ws = gameWords(6); return { cards: shuffle(ws.flatMap((w, i) => [{ i, en: 1, w }, { i, en: 0, w }])), open: [], got: [], moves: 0 }; },
  view() {
    const cols = ['#FF5FA2', '#FFC845', '#2EC4B6', '#9B5DE5', '#3A86FF', '#FF7A3D'];
    app.innerHTML = `<div class="page play">${gBar('ממתקיית הזיכרון', `${G.moves} מהלכים`)}
    <p class="center small muted">מצאי זוגות: מילה באנגלית והפירוש שלה</p>
    <div class="mem">${G.cards.map((c, j) => { const up = G.open.includes(j) || G.got.includes(c.i); return `<button class="mcard ${up ? 'up' : ''} ${G.got.includes(c.i) ? 'got' : ''}" data-mc="${j}"><span class="back">${candySVG(cols[j % 6], 44)}</span><span class="face">${c.en ? `<b dir="ltr">${esc(c.w.en)}</b>` : `<span class="em">${c.w.em}</span><span>${esc(c.w.he[0])}</span>`}</span></button>`; }).join('')}</div></div>`;
    on('[data-mc]', b => {
      const j = +b.dataset.mc, c = G.cards[j];
      if (G.open.length >= 2 || G.open.includes(j) || G.got.includes(c.i)) return;
      G.open.push(j); b.classList.add('up'); if (c.en) sayWord(c.w); else SFX.tap();
      if (G.open.length < 2) return;
      G.moves++; const [a, d] = G.open.map(x => G.cards[x]);
      if (a.i === d.i) { G.got.push(a.i); G.open = []; SFX.coin(); later(() => { render(); if (G.got.length === 6) GAMES.memory.end(); }, 350); }
      else later(() => { G.open = []; render(); }, 950);
      const sc = app.querySelector('.bar .pill'); if (sc) sc.textContent = `${G.moves} מהלכים`;
    });
  },
  end() { const nb = setBest('memory', G.moves); gameOver('כל הזוגות!', `<p class="center">${G.moves} מהלכים${nb ? ' · שיא חדש! 🏆' : ''}</p>`, G.moves <= 9 ? 6 : G.moves <= 13 ? 4 : 3, () => startGame('memory')); },
};
/* 3. element rain: three orbs fall, tap the one that is spelled right (or that means the word) */
GAMES.rain = {
  init: () => ({ ws: gameWords(12), wave: 0, lives: 3, score: 0, speed: 38 }),
  start: () => GAMES.rain.next(),
  view() {
    app.innerHTML = `<div class="page play">${gBar('גשם היסודות', `${G.score} נק׳`)}
    <div class="rain" id="rain"><div class="lives">${'❤️'.repeat(G.lives)}${'🤍'.repeat(3 - G.lives)}</div></div>
    <div class="prompt rp" id="rp"></div></div>`;
  },
  next() {
    if (!G || G.k !== 'rain') return;
    if (G.lives <= 0 || G.wave >= 15) return GAMES.rain.end();
    const w = G.ws[G.wave % G.ws.length], spell = G.wave % 2 === 0; G.wave++;
    const wrong = spell ? misspell(w.en, 2) : others(w, curList() || LIST0, 2).map(x => x.en.toLowerCase());
    const opts = shuffle([{ t: w.en.toLowerCase(), ok: 1 }, ...wrong.map(t => ({ t, ok: 0 }))]);
    const box = document.getElementById('rain'); if (!box) return;
    box.querySelectorAll('.orb').forEach(o => o.remove());
    const ks = shuffle(Object.keys(ELEMS));
    G.orbs = opts.map((o, i) => { const el = document.createElement('button'); el.className = 'orb'; el.style.setProperty('--c', ELEMS[ks[i]].c); el.style.left = `${6 + i * 32}%`; el.innerHTML = `${elemSVG(ks[i], 22)}<b dir="ltr">${esc(o.t)}</b>`; box.appendChild(el); const ob = { ...o, el, y: -70 - i * 26, dead: 0 }; el.onclick = () => GAMES.rain.tap(ob); return ob; });
    document.getElementById('rp').innerHTML = `${w.em ? `<span class="em">${w.em}</span>` : ''}<div class="he">${w.he.map(esc).join(' / ')}</div><span class="small muted">${spell ? 'איזה איות נכון?' : 'איזו מילה זאת?'}</span>${spell ? sayBtn() : ''}`;
    on('#rp [data-say]', () => sayWord(w)); if (spell) sayWord(w);
    G.w = w; G.t0 = performance.now(); G.H = box.clientHeight; let prev = performance.now();
    cancelAnimationFrame(RAF);
    const step = now => {
      if (!G || G.k !== 'rain' || !document.getElementById('rain')) return;
      const dt = Math.min(.05, (now - prev) / 1000); prev = now;
      for (const o of G.orbs) { if (o.dead) continue; o.y += G.speed * dt; o.el.style.transform = `translateY(${o.y}px)`; if (o.y > G.H - 70) { if (o.ok) return GAMES.rain.miss(o); o.dead = 1; o.el.classList.add('gone'); } }
      RAF = requestAnimationFrame(step);
    };
    RAF = requestAnimationFrame(step);
  },
  tap(o) {
    if (!G || o.dead) return;
    if (o.ok) { o.dead = 1; o.el.classList.add('burst'); G.score += 10 + Math.round(G.speed / 4); G.speed = Math.min(120, G.speed + 6); SFX.coin(); sayWord(G.w); cancelAnimationFrame(RAF); GAMES.rain.hud(); later(() => GAMES.rain.next(), 650); }
    else { o.dead = 1; o.el.classList.add('wrong'); G.lives--; SFX.no(); GAMES.rain.hud(); if (G.lives <= 0) { cancelAnimationFrame(RAF); later(() => GAMES.rain.end(), 700); } }
  },
  miss(o) { o.dead = 1; o.el.classList.add('show'); G.lives--; SFX.soft(); sayWord(G.w); cancelAnimationFrame(RAF); GAMES.rain.hud(); later(() => GAMES.rain.next(), 1300); },
  hud() { const l = app.querySelector('.lives'); if (l) l.textContent = '❤️'.repeat(Math.max(0, G.lives)) + '🤍'.repeat(3 - Math.max(0, G.lives)); const sc = app.querySelector('.bar .pill'); if (sc) sc.textContent = `${G.score} נק׳`; },
  end() { if (!G || G.over) return; cancelAnimationFrame(RAF); const nb = setBest('rain', G.score); gameOver(G.lives > 0 ? 'שלטת ביסודות!' : 'נגמרו הלבבות', `<p class="center">${G.score} נקודות${nb ? ' · שיא חדש! 🏆' : ''}</p>`, 2 + Math.floor(G.score / 50), () => startGame('rain')); },
};
/* 4. teacher Romi: she reads the words to dad, dad writes on paper, then she checks him */
GAMES.teach = {
  init: () => { const l = curList() || LIST0; return { l, ws: shuffle(l.words), i: 0, ph: 'intro', mode: 'en', marks: {} }; },
  view() {
    const l = G.l;
    if (G.ph === 'intro') {
      app.innerHTML = `<div class="page play">${gBar('המורה רומי', '👩‍🏫')}<section class="card stack center"><div class="big-romi">${romiSVG()}</div>
      <h2>היום את המורה!</h2><p>אבא מביא דף ועט. את מקריאה לו את המילים אחת-אחת, והוא כותב. בסוף את בודקת אותו ונותנת לו ציון.</p>
      <button class="btn btn-main big" data-m="en">להקריא באנגלית</button><button class="btn btn-ghost big" data-m="he">להקריא בעברית (אבא כותב באנגלית)</button></section></div>`;
      on('[data-m]', b => { G.mode = b.dataset.m; G.ph = 'read'; render(); });
      return;
    }
    if (G.ph === 'read') {
      const w = G.ws[G.i];
      app.innerHTML = `<div class="page play">${gBar('המורה רומי', `${G.i + 1}/${G.ws.length}`)}<section class="card stack center teach">
      <div class="small muted">תקריאי לאבא:</div>${G.mode === 'en' ? `<div class="word huge" dir="ltr">${esc(w.en)}</div><div class="row center">${sayBtn()}<span class="small muted">איך אומרים את זה</span></div>` : `<div class="he huge">${esc(w.he[0])}</div>`}
      <button class="btn btn-main big" data-act="nx">${G.i + 1 < G.ws.length ? 'המילה הבאה' : 'סיימנו! לבדיקה'}</button></section></div>`;
      on('[data-say]', () => sayWord(w));
      on('[data-act="nx"]', () => { SFX.tap(); if (++G.i >= G.ws.length) G.ph = 'check'; render(); });
      return;
    }
    const n = G.ws.length, good = Object.values(G.marks).filter(Boolean).length, all = Object.keys(G.marks).length === n;
    app.innerHTML = `<div class="page play">${gBar('בדיקה של אבא', `${good}/${n}`)}<p class="center small muted">השווי למה שאבא כתב. סמני ✓ או ✗ לכל מילה.</p>
    <div class="paper check"><ol>${G.ws.map((w, j) => `<li><span class="grow"><b dir="ltr">${esc(w.en)}</b> · ${esc(w.he[0])}</span><button class="mk ${G.marks[j] === true ? 'on ok' : ''}" data-mk="${j}" data-v="1">✓</button><button class="mk ${G.marks[j] === false ? 'on no' : ''}" data-mk="${j}" data-v="0">✗</button></li>`).join('')}</ol></div>
    <button class="btn btn-main big" data-act="grade" ${all ? '' : 'disabled'}>ציון לאבא</button></div>`;
    on('[data-mk]', b => { G.marks[+b.dataset.mk] = b.dataset.v === '1'; render(); });
    on('[data-act="grade"]', () => { const sc = Math.round(good / n * 100); SFX.win(); gameOver(`אבא קיבל ${sc}!`, `<p class="center">${sc === 100 ? 'אבא כתב הכל נכון. מורה טובה עושה תלמיד טוב!' : 'אבא צריך עוד קצת להתאמן 😄 את יכולה להסביר לו איפה טעה.'}</p>`, 5, () => startGame('teach')); });
  },
};
/* 5. friends duel: two players, one phone, five words each */
GAMES.duel = {
  init: () => ({ ph: 'setup', names: [NAME, 'חברה'], ws: gameWords(10), r: 0, turn: 0, sc: [0, 0], rounds: 5 }),
  view() {
    if (G.ph === 'setup') {
      app.innerHTML = `<div class="page play">${gBar('דו-קרב חברות', '👭')}<section class="card stack"><h2 class="center">מי משחקת?</h2>
      <label class="small">שחקנית 1<input class="txt" id="n0" value="${esc(G.names[0])}" maxlength="14"></label><label class="small">שחקנית 2<input class="txt" id="n1" value="${esc(G.names[1])}" maxlength="14" placeholder="השם של החברה"></label>
      <p class="small muted">כל אחת שומעת מילה וכותבת אותה. 5 מילים לכל אחת. מעבירים את הטלפון בין התורות.</p><button class="btn btn-main big" data-act="go">מתחילות!</button></section></div>`;
      on('[data-act="go"]', () => { G.names = [0, 1].map(i => (document.getElementById('n' + i).value || '').trim() || ['שחקנית 1', 'שחקנית 2'][i]); G.ph = 'pass'; render(); });
      return;
    }
    if (G.ph === 'pass') {
      app.innerHTML = `<div class="page play">${gBar('דו-קרב חברות', `${G.sc[0]} : ${G.sc[1]}`)}<section class="card stack center"><div class="small muted">סיבוב ${G.r + 1} מתוך ${G.rounds}</div><h2>התור של ${esc(G.names[G.turn])}!</h2><p>${G.turn ? 'תני לה את הטלפון 📱' : ''}</p><button class="btn btn-main big" data-act="ready">מוכנה!</button></section></div>`;
      on('[data-act="ready"]', () => { G.ph = 'play'; render(); sayWord(G.ws[G.r * 2 + G.turn]); });
      return;
    }
    const w = G.ws[G.r * 2 + G.turn];
    app.innerHTML = `<div class="page play haskbd">${gBar(esc(G.names[G.turn]), `${G.sc[0]} : ${G.sc[1]}`)}<section class="q"><div class="ask">הקשיבי וכתבי</div><div class="prompt">${sayBtn('en', 1)}${slowBtn()}<span class="em">${w.em}</span></div></section><div id="fb"></div>
    <section class="ans"><div id="typed"></div>${kbdHTML('en')}</section></div>`;
    on('[data-say]', b => sayWord(w, b.dataset.say === 'slow' ? .5 : undefined));
    bindKbd({ lang: 'en', onEnter: v => {
      KB.lock = true; const ok = checkEn(w, v); if (ok) { G.sc[G.turn] += 10; SFX.ok(); } else SFX.soft();
      fb(`<div class="fb ${ok ? 'fb-good' : 'fb-bad'}">${ok ? 'נכון! +10' : `הנכון: <b dir="ltr">${esc(w.en.toLowerCase())}</b>`}</div>`);
      later(() => { if (G.turn === 1) G.r++; G.turn = 1 - G.turn; if (G.r >= G.rounds) return GAMES.duel.end(); G.ph = 'pass'; render(); }, 1400);
    } });
  },
  end() {
    const [a, b] = G.sc, win = a === b ? -1 : a > b ? 0 : 1;
    gameOver(win < 0 ? 'תיקו! חברות אמיתיות' : `${esc(G.names[win])} ניצחה!`, `<p class="center">${esc(G.names[0])} ${a} · ${esc(G.names[1])} ${b}</p>`, 4, () => { const nm = G.names; startGame('duel'); G.names = nm; render(); });
  },
};

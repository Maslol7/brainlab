/* ---------- the Magic E wand: practice for the test on 23.11. Three kinds of rounds, like the test tasks:
   listen and circle (cap or cape?), the right spelling of a long vowel, and complete the sentence ---------- */
GAMES.wand = {
  init() {
    const rounds = shuffle([
      ...shuffle(MAGIC).slice(0, 5).map(p => { const long = R() < .6; return { k: 'magic', p, say: long ? p[1] : p[0], ans: long ? p[1] : p[0], opts: [p[0], p[1]] }; }),
      ...shuffle(VOWEL_TEAMS).slice(0, 4).map(([w, bad]) => ({ k: 'team', say: w, ans: w, opts: shuffle([w, ...bad]) })),
      ...shuffle(SENTENCES).slice(0, 4).map(([s, w]) => ({ k: 'sent', s, ans: w, opts: shuffle([w, ...shuffle(SENT_WORDS().filter(x => x !== w)).slice(0, 2)]) })),
    ]);
    return { rounds, i: 0, score: 0, miss: 0 };
  },
  start: () => GAMES.wand.speak(),
  speak() { const r = G && G.rounds[G.i]; if (!r) return; if (r.k === 'sent') return; const w = [...PACKS[0].words, ...LIST_1104.words].find(x => x.en.toLowerCase() === r.say); w ? sayWord(w) : say(r.say); },
  view() {
    const r = G.rounds[G.i], n = G.rounds.length;
    const ask = r.k === 'magic' ? 'איזו מילה שמעת?' : r.k === 'team' ? 'איך כותבים את מה ששמעת?' : 'השלימי את המשפט';
    const prompt = r.k === 'sent' ? `<div class="sent" dir="ltr">${esc(r.s).replace('___', '<span class="blank">____</span>')}</div>` : `${sayBtn('en', 1)}`;
    app.innerHTML = `<div class="page play">${gBar('שרביט ה-E', `${G.score} נק׳`)}
    <div class="prog"><i style="width:${Math.round(G.i / n * 100)}%"></i></div>
    <section class="q"><div class="ask">${ask}</div><div class="prompt">${prompt}</div></section><div id="fb"></div>
    <section class="ans"><div class="opts ${r.opts.length === 2 ? 'two' : ''}">${r.opts.map((o, j) => `<button class="opt" data-w="${j}" dir="ltr">${esc(o)}</button>`).join('')}</div></section>
    ${r.k === 'magic' ? '<p class="small muted center">ה-E בסוף לא נשמעת, אבל היא גורמת לתנועה להגיד את השם שלה: a, i, o, u.</p>' : ''}</div>`;
    on('[data-say]', () => GAMES.wand.speak());
    on('[data-w]', b => GAMES.wand.pick(r, r.opts[+b.dataset.w], b));
  },
  pick(r, o, b) {
    if (r.done) return;
    if (o !== r.ans) { b.classList.add('bad'); b.disabled = true; SFX.no(); r.tries = (r.tries || 0) + 1; if (r.k !== 'sent') GAMES.wand.speak(); return; }
    r.done = 1; b.classList.add('good'); const pts = r.tries ? 4 : 10; G.score += pts; SFX.ok();
    let msg = '';
    if (r.k === 'magic') { const [a, c, ha, hc] = r.p; msg = `<span dir="ltr"><b>${a}</b> + e = <b>${c}</b></span><div class="small">${a} = ${ha} · ${c} = ${hc}</div>`; say(r.ans); }
    else if (r.k === 'sent') { const full = r.s.replace('___', r.ans); msg = `<span dir="ltr">${esc(full)}</span>`; say(full, 'en', .8); }
    else { const w = [...PACKS[0].words, ...LIST_EXAM.words].find(x => x.en === r.ans); msg = `<b dir="ltr">${esc(r.ans)}</b>${w ? ` = ${esc(w.he[0])}` : ''}`; }
    fb(`<div class="fb fb-good">+${pts} · ${msg}</div>`);
    later(() => { G.i++; if (G.i >= G.rounds.length) return GAMES.wand.end(); render(); GAMES.wand.speak(); }, r.k === 'sent' ? 2600 : 1700);
  },
  end() { const nb = setBest('wand', G.score); gameOver('קסם!', `<p class="center">${G.score} נקודות${nb ? ' · שיא חדש!' : ''}</p>`, 2 + Math.floor(G.score / 25), () => startGame('wand')); },
};
GIC.wand = pic('<path d="M5 27L20 12"/><path d="M23 4l1.4 3.6L28 9l-3.6 1.4L23 14l-1.4-3.6L18 9l3.6-1.4z"/><path d="M9 6l.7 1.8L11.5 8.5 9.7 9.2 9 11l-.7-1.8L6.5 8.5l1.8-.7z"/>');

/* ---------- all lists, and the shop (leotards, ribbons) with the sticker album ---------- */
VIEWS.lists = () => {
  const cls = allClass().slice().sort((a, b) => (a.date || '') < (b.date || '') ? 1 : -1);
  const block = (l, cls2) => `<section class="card stack ${cls2 || ''}"><div class="row"><span class="gem">${l.em || '📒'}</span><div class="grow"><b>${esc(l.t)}</b><div class="small muted">${l.date ? dateHe(l.date) + ' · ' : ''}${l.words.length} מילים · ${listStars(l)} כוכבים</div></div></div>
  <div class="wchips">${l.words.map(w => wordChip(w, l)).join('')}</div><div class="row"><button class="btn btn-main" data-pr="${l.id}">אימון</button>${l.src === 'class' ? `<button class="btn btn-ghost" data-ts="${l.id}">הכתבה לדוגמה</button>` : ''}</div></section>`;
  app.innerHTML = `<div class="page">${topBar('כל הרשימות')}
  <h3 class="sec">מהכיתה</h3>${cls.map(l => block(l)).join('') || '<p class="muted">עוד אין.</p>'}
  <h3 class="sec">מעבר לכיתה</h3>${bonusLists().map(l => block(l, 'bonus')).join('')}</div>`;
  on('[data-pr]', b => startPractice(listById(b.dataset.pr)));
  on('[data-ts]', b => startTest(listById(b.dataset.ts)));
};
VIEWS.shop = () => {
  const jar = Math.min(100, Math.round((S.candyAll || 0) % 100));
  const item = (kind, k, o) => { const own = S.own[kind].includes(k), cur = S[kind] === k; return `<button class="shopit ${cur ? 'cur' : ''}" data-buy="${kind}:${k}"><span class="sw" style="background:${kind === 'leo' ? `linear-gradient(135deg,${o.c.join(',')})` : o.c}"></span><b>${o.t}</b><span class="small">${cur ? 'עכשיו' : own ? 'שלך' : `${o.price} ${CANDY(14)}`}</span></button>`; };
  app.innerHTML = `<div class="page">${topBar('החנות של רומי')}
  <section class="card shoptop"><div class="big-romi">${romiSVG()}</div><div class="grow"><div class="jar"><i style="height:${jar}%"></i><span>${S.candy}</span></div><div class="small muted center">ממתקים לבזבז</div></div></section>
  <h3 class="sec">בגד התעמלות</h3><div class="shopgrid">${Object.entries(LEOS).filter(([k, o]) => !o.gift || S.own.leo.includes(k)).map(([k, o]) => item('leo', k, o)).join('')}</div>
  <h3 class="sec">סרט לשיער</h3><div class="shopgrid">${Object.entries(RIBS).map(([k, o]) => item('rib', k, o)).join('')}</div>
  <h3 class="sec">אלבום מדבקות</h3><section class="card"><div class="album">${S.stickers.map(s => `<span class="sticker" title="${esc(s.t)}">${esc(s.em)}<small>${esc(s.t)}</small></span>`).join('') || '<p class="small muted">מקבלים מדבקה על 100 בהכתבה לדוגמה.</p>'}</div></section></div>`;
  on('[data-buy]', b => {
    const [kind, k] = b.dataset.buy.split(':'), o = (kind === 'leo' ? LEOS : RIBS)[k];
    if (S.own[kind].includes(k)) { S[kind] = k; save(); SFX.tap(); return render(); }
    if (S.candy < o.price) return toast(`חסרים עוד ${o.price - S.candy} ממתקים`);
    modal(`לקנות ${o.t}?`, `זה עולה ${o.price} ממתקים.`, [['קנייה', () => { S.candy -= o.price; S.own[kind].push(k); S[kind] = k; save(); SFX.win(); render(); }], ['לא עכשיו']]);
  });
};

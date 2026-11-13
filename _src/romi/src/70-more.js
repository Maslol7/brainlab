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
/* the shop: real rewards from dad first, then what Romi wears, her pet, the mat, her trick, ribbons, and the sticker album */
const SHOP = { leo: LEOS, rib: RIBS, acc: ACC, pet: PETS, mat: MATS, trick: TRICKS };
let SHOP_TAB = 'dad';
VIEWS.shop = () => {
  const jar = Math.min(100, Math.round((S.candyAll || 0) % 100));
  const look = (kind, k, o) => kind === 'leo' ? `<span class="sw" style="background:linear-gradient(135deg,${o.c.join(',')})"></span>` : kind === 'rib' ? `<span class="sw" style="background:${o.c}"></span>`
    : kind === 'mat' ? `<span class="sw msw" style="background:linear-gradient(160deg,${o.c.join(',')})"></span>` : kind === 'acc' ? `<span class="sw face">${romiSVG({ head: 1, acc: k })}</span>`
    : kind === 'pet' ? `<span class="sw pe">${o.e || '·'}</span>` : `<span class="sw tr">${GIC.tramp.replace('width="30" height="30"', 'width="26" height="26"')}</span>`;
  const item = (kind, k, o) => { const own = S.own[kind].includes(k), cur = S[kind] === k; return `<button class="shopit ${cur ? 'cur' : ''}" data-buy="${kind}:${k}">${look(kind, k, o)}<b>${o.t}</b><span class="small">${cur ? 'עכשיו' : own ? 'שלך' : `${o.price} ${CANDY(14)}`}</span></button>`; };
  const grid = kind => `<div class="shopgrid">${Object.entries(SHOP[kind]).filter(([k, o]) => !o.gift || S.own[kind].includes(k)).map(([k, o]) => item(kind, k, o)).join('')}</div>`;
  const tabs = [['dad', 'פרסים מאבא'], ['leo', 'בגד'], ['acc', 'אביזרים'], ['pet', 'חיה'], ['mat', 'מזרן'], ['trick', 'תרגיל'], ['rib', 'סרט'], ['album', 'מדבקות']];
  const wait = S.vouchers.filter(v => v.state === 'wait');
  const body = SHOP_TAB === 'dad' ? `<p class="small muted">דברים אמיתיים! קונים בממתקים, ואבא מאשר כשזה קורה.</p>
    <div class="rewards">${S.rewards.map((r, i) => `<div class="reward"><span class="grow"><b>${esc(r.t)}</b><span class="small">${r.p} ${CANDY(14)}</span></span><button class="btn ${S.candy >= r.p ? 'btn-main' : 'btn-ghost'}" data-rw="${i}">קנייה</button></div>`).join('') || '<p class="small muted">אבא עוד לא הוסיף פרסים.</p>'}</div>
    ${wait.length ? `<h3 class="sec">מחכים לאבא</h3><div class="rewards">${wait.map(v => `<div class="reward wait"><span class="grow"><b>${esc(v.t)}</b><span class="small">נקנה ב-${+v.d.slice(8)}.${+v.d.slice(5, 7)}</span></span><span class="tag">מחכה</span></div>`).join('')}</div>` : ''}`
    : SHOP_TAB === 'album' ? `<section class="card"><div class="album">${S.stickers.map(s => `<span class="sticker" title="${esc(s.t)}">${esc(s.em)}<small>${esc(s.t)}</small></span>`).join('') || '<p class="small muted">מקבלים מדבקה על 100 בהכתבה לדוגמה.</p>'}</div></section>`
    : `${SHOP_TAB === 'trick' ? '<p class="small muted">התרגיל שרומי עושה כשמילה מקבלת כוכב ובסוף אימון. לחיצה על תרגיל שלך מראה אותו.</p>' : ''}${grid(SHOP_TAB)}`;
  app.innerHTML = `<div class="page">${topBar('החנות של רומי')}
  <section class="card shoptop"><div class="big-romi" id="shopromi">${romiSVG()}${petHTML()}</div><div class="grow"><div class="jar"><i style="height:${jar}%"></i><span>${S.candy}</span></div><div class="small muted center">ממתקים לבזבז</div></div></section>
  <nav class="tabs" role="tablist">${tabs.map(([k, t]) => `<button class="tab ${SHOP_TAB === k ? 'on' : ''}" data-tab="${k}" role="tab">${t}${k === 'dad' && wait.length ? ` <span class="dot">${wait.length}</span>` : ''}</button>`).join('')}</nav>
  ${body}</div>`;
  on('[data-tab]', b => { SHOP_TAB = b.dataset.tab; SFX.tap(); render(); });
  on('[data-rw]', b => {
    const r = S.rewards[+b.dataset.rw]; if (!r) return;
    if (S.candy < r.p) return toast(`חסרים עוד ${r.p - S.candy} ממתקים`);
    modal(`לקנות: ${esc(r.t)}?`, `זה עולה ${r.p} ממתקים. אחרי הקנייה מראים לאבא, והוא מאשר כשזה קורה.`, [['קנייה', () => { S.candy -= r.p; S.vouchers.push({ id: Date.now().toString(36), t: r.t, p: r.p, d: todayStr(), state: 'wait' }); track('buy', { item: 'reward', t: r.t, p: r.p }); save(); confetti(); SFX.win(); render(); }], ['לא עכשיו']]);
  });
  on('[data-buy]', b => {
    const [kind, k] = b.dataset.buy.split(':'), o = SHOP[kind][k];
    const preview = () => { if (kind !== 'trick') return; const r = document.getElementById('shopromi'); if (!r) return; Object.keys(TRICKS).forEach(t => r.classList.remove('trick-' + t)); void r.offsetWidth; r.classList.add('trick-' + k); };
    if (S.own[kind].includes(k)) { S[kind] = k; save(); SFX.tap(); if (kind === 'mat') applyMat(); render(); return later(preview, 50); }
    if (S.candy < o.price) return toast(`חסרים עוד ${o.price - S.candy} ממתקים`);
    modal(`לקנות ${o.t}?`, `זה עולה ${o.price} ממתקים.`, [['קנייה', () => { S.candy -= o.price; S.own[kind].push(k); S[kind] = k; track('buy', { item: kind + ':' + k, p: o.price }); save(); if (kind === 'mat') applyMat(); SFX.win(); render(); later(preview, 50); }], ['לא עכשיו']]);
  });
};

/* ---------- SHOP ---------- */
const ownedSkin = id => S.own.skin.includes(id) || !SKINS[id].price;
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
function buySkin(id) {
  const it = SKINS[id];
  const equip = () => { S.skin = id; SFX.tap(); save(); render(); };
  if (ownedSkin(id)) return equip();
  if (S.coins < it.price) return modal('אין מספיק מטבעות', `חסרים לך ${it.price - S.coins} מטבעות. משימה יומית נותנת בערך 40-60, וגם הארקייד נותן.`, 'הבנתי', () => { }, 'btn-primary', true);
  modal(`לקנות ${it.t}?`, `זה יעלה ${it.price} מטבעות. יישארו לך ${S.coins - it.price}.`, 'לקנות', () => { S.coins -= it.price; S.own.skin.push(id); SFX.coin(); burst(50); equip(); });
}
function accSection() {
  const own = S.accOwn || {}, on = S.accOn || {};
  return `<section><div class="sec-h"><h3>אביזרים לדמות</h3><span class="muted small">בקניה עם מטבעות</span></div><div class="stack" style="gap:8px">${ACC.map(([k, n, p]) => `<div class="card row acc"><span class="accp">${avatarPreview(k)}</span><div class="grow"><b>${n}</b>${own[k] ? `<div class="muted small">${on[k] ? 'על הדמות' : 'שלך'}</div>` : `<div class="muted small">${coinS()} ${p}</div>`}</div>${own[k] ? `<button class="chip ${on[k] ? 'on' : ''}" data-accw="${k}">${on[k] ? 'להוריד' : 'ללבוש'}</button>` : `<button class="btn btn-gold" data-accb="${k}" style="min-height:40px;padding:6px 12px" ${S.coins < p ? 'disabled' : ''}>לקנות</button>`}</div>`).join('')}</div></section>`;
}

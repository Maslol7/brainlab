/* ---------- animated solutions ----------
   Small CSS animations that show the idea of a solution, played once when the solution opens,
   with a "שוב" button to replay. They live inside q.ex, so only inline elements (span, svg). */
function replayAnim(btn) { const w = btn.closest('.anim'); if (!w) return; const c = w.cloneNode(true); w.replaceWith(c); }
const animBox = (body, cap) => `<span class="anim">${body}${cap ? `<span class="an-cap">${cap}</span>` : ''}<button type="button" class="an-again" onclick="replayAnim(this)">${IC.share ? '↻' : '↻'} שוב</button></span>`;

/* cube net: the net folds into a cube around the marked face, then the cube turns to show the face opposite it.
   nc = net cells [[x,y]...], sy = symbols, ai = the marked face, bi = its opposite. Folds go away from the viewer. */
function foldNetHTML(nc, sy, ai, bi) {
  const at = (x, y) => nc.findIndex(c => c[0] === x && c[1] === y);
  const kids = {}, depth = { [ai]: 0 }, seen = new Set([ai]), q = [ai];
  while (q.length) { const i = q.shift(), [x, y] = nc[i]; kids[i] = [];
    for (const [dx, dy, d] of [[1, 0, 'r'], [-1, 0, 'l'], [0, 1, 'd'], [0, -1, 'u']]) { const j = at(x + dx, y + dy); if (j >= 0 && !seen.has(j)) { seen.add(j); depth[j] = depth[i] + 1; kids[i].push([j, d]); q.push(j); } } }
  const maxD = Math.max(...Object.values(depth));
  const face = (i, d) => `<span class="nf${i === ai ? ' fa' : i === bi ? ' fb' : ''}${d ? ' d-' + d : ''}" style="--dl:${(depth[i] - 1) * .7 + .4}s"><b>${sy[i]}</b>${kids[i].map(([j, dd]) => face(j, dd)).join('')}</span>`;
  const W = Math.max(...nc.map(c => c[0])) + 1, H = Math.max(...nc.map(c => c[1])) + 1, u = 44;
  const tx = W * u / 2 - (nc[ai][0] * u + u / 2), ty = H * u / 2 - (nc[ai][1] * u + u / 2);
  const spin = maxD * .7 + 1.2;
  const body = `<span class="fold" style="--u:${u}px;width:${W * u}px;height:${H * u}px"><span class="fold-cube" style="--sp:${spin}s;--tx:${tx}px;--ty:${ty}px;transform-origin:${nc[ai][0] * u + u / 2}px ${nc[ai][1] * u + u / 2}px ${-u / 2}px"><span class="fold-root" style="left:${nc[ai][0] * u}px;top:${nc[ai][1] * u}px">${face(ai, '')}</span></span></span>`;
  return animBox(body, `מקפלים סביב ${sy[ai]}, ומסובבים את הקובייה: מאחוריו נמצא ${sy[bi]}.`);
}
/* rotation: the shape turns to the right answer; a mirror image only flips */
function rotAnimHTML(cs, ki) {
  const deg = ki * 90, turn = ki === 2 ? 'חצי סיבוב' : ki === 1 ? 'רבע סיבוב עם כיוון השעון' : 'רבע סיבוב נגד כיוון השעון';
  const body = `<span class="rot-row"><span class="rot-item"><span class="rot-spin" style="--deg:${deg}deg">${polySVG(cs)}</span><span class="rot-lbl">מסובבים: ${turn}</span></span><span class="rot-item"><span class="rot-flip">${polySVG(cs)}</span><span class="rot-lbl">מראה: הופכים. את זה אי אפשר לקבל בסיבוב</span></span></span>`;
  return animBox(body, '');
}
/* invented operation: every a turns into the first number, every b into the second, then the calculation */
function opMorphHTML(t, x, y, res) {
  const mf = (from, to, cls, dl) => `<span class="mf ${cls}" style="--dl:${dl}s"><span class="m1">${from}</span><span class="m2">${to}</span></span>`;
  const expr = [...t].map(ch => ch === 'a' ? mf('a', x, 'ma', .7) : ch === 'b' ? mf('b', y, 'mb', 1.6) : ch === ' ' ? ' ' : `<span class="mo">${ch}</span>`).join('');
  const body = `<span class="opm" dir="ltr">${mf('a', x, 'ma', .7)} <span class="mo">◆</span> ${mf('b', y, 'mb', 1.6)} <span class="mo">=</span> ${expr}${res != null ? ` <span class="mres">= <b>${res}</b></span>` : ''}</span>`;
  return animBox(body, `כל a הופך ל-${x} (המספר הראשון), כל b הופך ל-${y} (השני). רק אחר כך מחשבים.`);
}
/* two blanks: the connector word decides the direction between the two parts */
const S2_CONN = [[/למרות|אף ש|אף על פי|בכל זאת|אבל|אך|אלא/, 'ניגוד', '⇄', 'שני החלקים הפוכים זה לזה', 1], [/ולכן|לכן|ובגלל זה|כתוצאה/, 'סיבה ותוצאה', '←', 'מה שלפני המילה גורם למה שאחריה', 0], [/כי |בגלל|מכיוון|משום/, 'סיבה', '→', 'מה שאחרי המילה הוא הסיבה למה שלפניה', 0], [/ככל ש|וגם|גם /, 'יחד', '⇈', 'שני הדברים הולכים יחד', 1]];
function sentence2Viz(s, pair) {
  const [w1, w2] = String(pair).split('/').map(x => x.trim());
  const c = S2_CONN.find(([re]) => re.test(s)); if (!c) return '';
  const m = c[0].exec(s)[0];
  let k = 0; const filled = s.split('___').map((p, i, a) => i < a.length - 1 ? p + `<b class="s2w">${[w1, w2][k++] || ''}</b>` : p).join('').replace(m, `<mark class="s2c">${m}</mark>`);
  return `<span class="s2viz"><span class="s2s">${filled}</span>${c[4] ? `<span class="s2rel"><span class="s2box">${w1}</span><span class="s2arr">${c[2]}<i>${c[1]}</i></span><span class="s2box">${w2}</span></span>` : ''}<span class="s2why">"${m.trim()}" = ${c[1]}: ${c[3]}.</span></span>`;
}

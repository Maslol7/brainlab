/* ---------- parent area (PIN). On Romi's phone it changes her data directly. On dad's phone (cloud, role dad) it sends changes through the cloud ---------- */
let PARENT_OK = false, DRAFT = null;
VIEWS.parent = () => {
  if (!PARENT_OK) return pinGate();
  if (isDad() && !PDOC) { PDOC = {}; dadLoad().then(() => { if (S.view === 'parent') render(); }); }
  const dad = isDad(), D = dad ? (RKID || { lists: [], p: {}, tests: [], days: {} }) : S;
  const lists = arr(D.lists).filter(l => l.src === 'class').sort((a, b) => (a.date || '') < (b.date || '') ? 1 : -1);
  app.innerHTML = `<div class="page parent">${topBar(dad ? 'הטלפון של אבא' : 'אזור הורים')}
  ${dad ? `<section class="card small">${RKID ? `נתונים מהטלפון של רומי, ${agoTxt(Date.parse(RKID._at))}.` : 'עוד לא נטענו נתונים מהענן.'} <button class="chip" data-act="reload">רענן</button></section>` : ''}
  <section class="card stack newlist"><h3>רשימה חדשה</h3>
  <ol class="howto"><li>בוואטסאפ: לחיצה ארוכה על ההודעה של המורה ← העתקה.</li><li>כאן: "הדבקה מהוואטסאפ". המילים, התרגום, התמונות והתאריך נקראים לבד.</li><li>בודקים ושומרים. רומי רואה את הרשימה מיד.</li></ol>
  <button class="btn btn-main big" data-act="clip">הדבקה מהוואטסאפ</button>
  <details class="small"><summary class="muted">או להדביק או לכתוב כאן</summary><textarea class="txt" id="paste" rows="5" placeholder="1. Neighbor – שכן / שכנה 🏡&#10;2. Flower – פרח 🌷"></textarea><button class="btn btn-ghost" data-act="parse">קריאת הרשימה</button></details>
  <div id="draft">${draftHTML()}</div></section>
  <section class="card stack"><h3>הרשימות</h3>${lists.map(l => { const t = arr(D.tests).filter(x => x.list === l.id).slice(-1)[0]; return `<div class="lrow"><div class="grow"><b>${esc(l.t)}</b><div class="small muted">${l.date ? dateHe(l.date) + ' · ' : ''}${l.words.length} מילים · ${pctWith(D, l)}% מוכן${t ? ` · הכתבה לדוגמה: ${t.score}` : ''}</div></div><button class="chip" data-edit="${l.id}">עריכה</button><button class="chip" data-del="${l.id}">מחיקה</button></div>`; }).join('') || '<p class="small muted">אין רשימות.</p>'}</section>
  ${vouchersHTML(D)}
  ${reportHTML(D)}
  ${progressHTML(D, lists[0] && lists.find(l => l.id === (curListOf(D) || {}).id) || lists[0])}
  ${voiceHTML(lists.find(l => l.id === (curListOf(D) || {}).id) || lists[0])}
  ${rewardsHTML(D)}
  <section class="card stack"><h3>הודעה לרומי</h3><p class="small muted">מופיעה פעם אחת במסך הבית שלה.</p><input class="txt" id="note" maxlength="140" placeholder="רומי, ראיתי שהתאמנת היום. כל הכבוד!"><button class="btn btn-ghost" data-act="note">שלח</button></section>
  <section class="card stack"><h3>הודעות מאבא</h3><p class="small muted">מופיעות מדי פעם בסוף אימון, ופעם אחת כשיש רצף טעויות. שורה לכל הודעה.</p><textarea class="txt" id="dadmsgs" rows="6">${esc(((dad ? arr((PDOC || {}).dadMsgs) : S.dadMsgs) || DAD_DEF).join('\n'))}</textarea><button class="btn btn-ghost" data-act="dadsave">שמור</button></section>
  ${dad ? '' : settingsHTML()}
  ${cloudSection()}
  <p class="small muted center">סלטה למוח · גרסה ${APP_VER}</p></div>`;
  bindParent();
};
/* the parent code: typed twice when it is set (a typo locked dad out once), and "forgot the code" asks a multiplication a child will not do by heart */
let PIN_TRY = null;
function pinGate() {
  const set = !S.pin, again = set && PIN_TRY;
  app.innerHTML = `<div class="page">${topBar('אזור הורים')}<section class="card stack center"><h3>${again ? 'עוד פעם, לאישור' : set ? 'בחר קוד של 4 ספרות' : 'קוד הורים'}</h3><p class="small muted">${set ? 'הקוד שומר שרק אבא נכנס לכאן.' : ''}</p>
  <input class="txt pin" id="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"><button class="btn btn-main" data-act="pin">${again ? 'אישור' : set ? 'המשך' : 'כניסה'}</button>
  ${set ? '' : '<button class="chip" data-act="forgot">שכחתי את הקוד</button>'}</section></div>`;
  const inp = document.getElementById('pin'); setTimeout(() => inp && inp.focus(), 100);
  const go2 = () => {
    const v = inp.value.trim(); if (!/^\d{4}$/.test(v)) return toast('4 ספרות');
    if (set && !again) { PIN_TRY = v; return render(); }
    if (again) { if (v !== PIN_TRY) { PIN_TRY = null; toast('הקודים לא זהים. מתחילים מחדש.'); return render(); } S.pin = v; PIN_TRY = null; save(); toast('הקוד נשמר'); }
    else if (v !== S.pin) { inp.value = ''; return toast('קוד לא נכון'); }
    PARENT_OK = true; render();
  };
  on('[data-act="pin"]', go2); inp.onkeydown = e => { if (e.key === 'Enter') go2(); };
  on('[data-act="forgot"]', () => {
    const a = ri(23, 89), b = ri(23, 89);
    let ans = '';   /* the modal is removed before its button runs, so keep the typed answer as it is typed */
    const m = modal('איפוס קוד ההורים', `<p>כמה זה <b dir="ltr">${a} × ${b}</b>? אחרי תשובה נכונה בוחרים קוד חדש.</p><input class="txt" id="fq" inputmode="numeric" pattern="[0-9]*" autocomplete="off">`, [['איפוס', () => { if (+ans !== a * b) return toast('לא נכון'); S.pin = ''; PIN_TRY = null; save(); render(); }], ['ביטול']]);
    const q = m.querySelector('#fq'); if (q) { q.oninput = () => { ans = q.value; }; setTimeout(() => q.focus(), 100); }
  });
}
const curListOf = D => { const t = todayStr(), c = arr(D.lists).filter(l => l.src === 'class'); return c.filter(l => l.date && l.date >= t).sort((a, b) => a.date < b.date ? -1 : 1)[0] || c[c.length - 1]; };
function pctWith(D, l) { const M = maxSt(l), f = fld(l); return Math.round(l.words.reduce((a, w) => a + Math.min(1, ((D.p || {})[kOf(w)] || {})[f] / M || 0), 0) / (l.words.length || 1) * 100); }
function progressHTML(D, l) {
  if (!l) return '';
  const M = maxSt(l), f = fld(l), sp = isSpell(l), names = stepNames(l), wk = Object.keys(D.days || {}).filter(d => dayDiff(d, todayStr()) < 7).length;
  return `<section class="card stack"><h3>ההתקדמות: ${esc(l.t)}</h3><p class="small muted">${wk} ימי אימון השבוע. השלבים: ${names.slice(1).join(' ← ')}.${sp ? ' "שולטת בכתיב" רק אחרי כתיבה נכונה מהזיכרון גם ביום אחר. טעות בכתיב מחזירה את המילה לאותיות חסרות.' : ''}</p>
  <div class="tscroll"><table class="ptab"><tr><th>מילה</th><th>שלב</th>${sp ? '<th>כתיב</th>' : ''}<th>טעויות</th><th>מה כתבה</th></tr>${l.words.map(w => { const q = (D.p || {})[kOf(w)] || {}, st = Math.min(q[f] || 0, M); return `<tr><td dir="ltr">${esc(w.en)}</td><td>${st}/${M} <span class="small muted">${st >= M ? '⭐' : esc(names[st])}</span></td>${sp ? `<td>${(q.sp || 0) >= SP_OK ? '✓' : q.sp === 6 ? '⏳' : ''}</td>` : ''}<td>${q.bad || 0}</td><td dir="ltr" class="small">${arr(q.wr).map(esc).join(', ')}</td></tr>`; }).join('')}</table></div></section>`;
}
function draftHTML() {
  if (!DRAFT) return '';
  return `<div class="stack draft"><div class="row"><input class="txt grow" id="dt" value="${esc(DRAFT.t)}" placeholder="שם הרשימה"><input class="txt" id="dd" type="date" value="${DRAFT.date || ''}"></div>
  ${DRAFT.words.map((w, i) => `<div class="drow"><input class="txt em" data-f="em" data-i="${i}" value="${esc(w.em)}"><input class="txt" dir="ltr" data-f="en" data-i="${i}" value="${esc(w.en)}"><input class="txt" data-f="he" data-i="${i}" value="${esc(w.he.join(' / '))}" placeholder="פירוש"><button class="chip" data-rm="${i}">✕</button></div>`).join('')}
  <div class="row"><button class="chip" data-act="addrow">+ מילה</button><span class="grow"></span><span class="small muted">${DRAFT.words.length} מילים</span></div>
  <label class="small row"><input type="checkbox" id="dhe" ${DRAFT.he ? 'checked' : ''}> צריך לכתוב גם את הפירוש בעברית</label>
  <button class="btn btn-main" data-act="savelist">שמירת הרשימה</button></div>`;
}
function readDraft() {
  if (!DRAFT) return;
  DRAFT.t = (document.getElementById('dt') || {}).value || DRAFT.t; DRAFT.date = (document.getElementById('dd') || {}).value || ''; DRAFT.he = !!(document.getElementById('dhe') || {}).checked;
  app.querySelectorAll('.drow [data-f]').forEach(x => { const w = DRAFT.words[+x.dataset.i]; if (!w) return; if (x.dataset.f === 'he') w.he = x.value.split(/[\/,]/).map(s => s.trim()).filter(Boolean); else w[x.dataset.f] = x.value.trim(); });
}
function bindParent() {
  const dad = isDad();
  on('[data-act="reload"]', async () => { await dadLoad(); render(); });
  on('[data-act="clip"]', async () => {
    let t = ''; try { t = await navigator.clipboard.readText(); } catch (e) { }
    if (!t || !parseList(t).words.length) { const d = app.querySelector('.newlist details'); if (d) d.open = true; const p = document.getElementById('paste'); if (p) p.focus(); return toast(t ? 'בהודעה שהועתקה אין מילים באנגלית. אפשר להדביק כאן.' : 'לחיצה ארוכה בתיבה ← הדבקה', 3500); }
    document.getElementById('paste').value = t; readPaste();
  });
  const pa = document.getElementById('paste'); if (pa) pa.addEventListener('paste', () => setTimeout(readPaste, 60));
  bindVoice(); bindRewards();
  on('[data-act="parse"]', () => readPaste());
  function readPaste() {
    const r = parseList(document.getElementById('paste').value);
    if (!r.words.length) return toast('לא מצאתי מילים. נסה שורה לכל מילה: Flower – פרח');
    DRAFT = { id: null, t: r.date ? `הכתבה ${+r.date.slice(8)}.${+r.date.slice(5, 7)}` : 'רשימה חדשה', date: r.date, he: true, words: r.words };
    document.getElementById('draft').innerHTML = draftHTML(); bindParent(); const d = document.getElementById('draft'); if (d && d.scrollIntoView) d.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  on('[data-edit]', b => { const D = dad ? RKID : S, l = arr(D.lists).find(x => x.id === b.dataset.edit); if (!l) return; DRAFT = JSON.parse(JSON.stringify(l)); render(); later(() => { const d = document.getElementById('draft'); if (d) d.scrollIntoView({ block: 'start' }); }, 50); });
  on('[data-del]', b => modal('למחוק את הרשימה?', 'ההתקדמות במילים נשמרת.', [['מחיקה', () => removeList(b.dataset.del), 'btn-danger'], ['ביטול']]));
  on('[data-rm]', b => { readDraft(); DRAFT.words.splice(+b.dataset.rm, 1); document.getElementById('draft').innerHTML = draftHTML(); bindParent(); });
  on('[data-act="addrow"]', () => { readDraft(); DRAFT.words.push({ en: '', he: [], em: '' }); document.getElementById('draft').innerHTML = draftHTML(); bindParent(); });
  on('[data-act="savelist"]', async () => {
    readDraft(); DRAFT.words = DRAFT.words.filter(w => w.en);
    const bad = DRAFT.words.filter(w => !/^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/.test(w.en) || !w.he.length);
    if (!DRAFT.words.length) return toast('אין מילים');
    if (bad.length) return toast(`חסר פירוש או שיש תו לא באנגלית: ${bad.map(w => esc(w.en)).join(', ')}`, 4000);
    const l = { id: DRAFT.id || 'c-' + (DRAFT.date || todayStr()) + '-' + Math.random().toString(36).slice(2, 6), t: DRAFT.t || 'רשימה', date: DRAFT.date || '', src: 'class', he: DRAFT.he, words: DRAFT.words.map(w => ({ en: w.en, he: w.he, em: w.em || '' })) };
    const ok = await upsertList(l); if (!ok) return toast('לא הצלחתי לשמור לענן');
    DRAFT = null; toast(dad ? 'נשלח לטלפון של רומי' : 'הרשימה נשמרה'); render();
  });
  on('[data-act="note"]', async () => { const t = document.getElementById('note').value.trim(); if (!t) return; if (dad) { PDOC.note = { id: Date.now(), t }; if (!await pPut(cloudCfg(), PDOC)) return toast('השליחה נכשלה'); } else { S.dadNote = t; save(); } toast('נשלח'); document.getElementById('note').value = ''; });
  on('[data-act="dadsave"]', async () => { const l = document.getElementById('dadmsgs').value.split('\n').map(s => s.trim()).filter(Boolean); if (dad) { PDOC.dadMsgs = l; PDOC.mv = Date.now(); if (!await pPut(cloudCfg(), PDOC)) return toast('השמירה נכשלה'); } else S.dadMsgs = l.length ? l : null; save(); toast('נשמר'); });
  on('[data-vm]', b => { S.vmode = b.dataset.vm; save(); render(); });
  const ev = document.getElementById('envoice'); if (ev) ev.onchange = () => { S.enVoice = ev.value; save(); say('Neighbor, flower, mountain, between'); };
  on('[data-act="pinchg"]', () => { S.pin = ''; PIN_TRY = null; PARENT_OK = false; save(); render(); });
  on('[data-act="wagain"]', () => { S.seen.welcome = 0; S.seen.wDefer = 1; save(); toast('ההודעה תופיע כשרומי תפתח את האפליקציה בפעם הבאה'); render(); });
  on('[data-act="snd"]', () => { S.sound = S.sound ? 0 : 1; save(); render(); });
  on('[data-rate]', b => { S.rate = +b.dataset.rate; save(); say('Neighbor, flower, mountain'); render(); });
  on('[data-act="ten"]', () => say('Hello Romi! This is how I say mountain.'));
  on('[data-act="the"]', () => say('שלום רומי, ככה אני אומרת הר', 'he'));
  on('[data-act="upd"]', checkUpdate);
  bindCloud();
}
async function upsertList(l) {
  if (isDad()) { PDOC.lists = arr(PDOC.lists).filter(x => x.id !== l.id).concat([l]); PDOC.lv = Date.now(); PDOC.del = arr(PDOC.del).filter(x => x !== l.id); return pPut(cloudCfg(), PDOC); }
  S.lists = S.lists.filter(x => x.id !== l.id).concat([l]); save(); return true;
}
async function removeList(id) {
  if (isDad()) { PDOC.del = [...new Set([...arr(PDOC.del), id])]; PDOC.lists = arr(PDOC.lists).filter(x => x.id !== id); PDOC.lv = Date.now(); if (!await pPut(cloudCfg(), PDOC)) toast('לא הצלחתי למחוק'); }
  else { S.lists = S.lists.filter(x => x.id !== id); save(); }
  render();
}
function settingsHTML() {
  const ve = voiceFor('en'), vh = voiceFor('he');
  return `<section class="card stack"><h3>צליל ודיבור</h3>
  <div class="row"><span class="grow">קוד ההורים</span><button class="chip" data-act="pinchg">שינוי</button></div>
  <div class="row"><span class="grow">הודעת הפתיחה לרומי</span><button class="chip" data-act="wagain">${S.seen.welcome ? 'להציג שוב' : 'תופיע לה'}</button></div>
  <div class="row"><span class="grow">צלילים</span><button class="chip" data-act="snd">${S.sound ? 'פועלים' : 'כבויים'}</button></div>
  <div class="stack" style="gap:6px"><span>מי מקריא את המילים באנגלית</span><div class="row">${[['dad', 'אבא'], ['native', 'קול אנגלי'], ['mix', 'משולב']].map(([k, t]) => `<button class="chip ${vmode() === k ? 'on' : ''}" data-vm="${k}">${t}</button>`).join('')}</div>
  <p class="small muted" style="margin:0">משולב: אבא בכרטיס "מילה חדשה" ובהכתבה לדוגמה, הקול האנגלי בתרגול ובמשחקים. ככה היא שומעת הגייה של דובר אנגלית, ועדיין שומעת את אבא.</p></div>
  <label class="small">הקול האנגלי<select class="txt" id="envoice">${voiceOptions()}</select></label>
  <div class="row"><span class="grow">מהירות הקראה</span>${[[.7, 'איטית'], [.85, 'רגילה'], [1, 'מהירה']].map(([r, t]) => `<button class="chip ${S.rate === r ? 'on' : ''}" data-rate="${r}">${t}</button>`).join('')}</div>
  <div class="row"><button class="chip" data-act="ten">בדיקה באנגלית</button><button class="chip" data-act="the">בדיקה בעברית</button></div>
  <p class="small muted">קול באנגלית: ${ve ? esc(ve.name) : 'לא נמצא'} · בעברית: ${vh ? esc(vh.name) : 'לא נמצא (אז העברית מוצגת בכתב)'}.<br>קולות טובים יותר באייפון: הגדרות ← נגישות ← תוכן מוקרא ← קולות ← אנגלית, ומורידים קול שכתוב לידו Premium או Enhanced (למשל Ava, Zoe או Evan). אחרי ההורדה הוא מופיע כאן, והאפליקציה בוחרת אותו לבד.</p></section>
  <section class="card stack"><h3>התקנה באייפון של רומי</h3><ol class="small" style="margin:0;padding-inline-start:18px;line-height:1.8"><li>פותחים בספארי: <span dir="ltr">${APP_URL}</span></li><li>כפתור השיתוף ← "הוספה למסך הבית".</li><li>פותחים מהאייקון "סלטה". ככה הנתונים נשמרים, וכדאי לחבר גם ענן לגיבוי.</li></ol>
  <button class="chip" data-act="upd">בדיקת עדכון</button></section>`;
}
async function checkUpdate() {
  try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); const v = (await r.json()).v; if (String(v) === APP_VER) return toast(`זו הגרסה הכי חדשה (${APP_VER})`); toast('מעדכן...'); const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.filter(k => k.startsWith('salta-')).map(k => caches.delete(k))); } location.reload(); }
  catch (e) { toast('אין חיבור כרגע'); }
}

/* dad's voice: record every word once (about 2 seconds each) */
function voiceHTML(l) {
  if (!l) return '';
  const n = l.words.filter(w => VOICE[kOf(w)]).length;
  return `<section class="card stack"><h3>הקול של אבא</h3><p class="small muted">רומי שומעת את המילים בקול שלך באימון ובהכתבה לדוגמה. הכי מהיר: הקלטה אחת של כל הרשימה. העיגול ליד מילה מקליט רק אותה מחדש.</p>
  <button class="btn btn-main" data-act="vrall" data-l="${l.id}">${GIC.mic.replace('width="30" height="30"', 'width="20" height="20"')} הקלטה של כל הרשימה</button>
  <div class="vlist">${l.words.map(w => { const k = kOf(w), has = !!VOICE[k], rec = REC && REC.k === k; return `<div class="vrow ${has ? 'has' : ''}"><span class="vw" dir="ltr">${esc(w.en)}</span><button class="vbtn rec ${rec ? 'on' : ''}" data-rec="${esc(k)}" aria-label="הקלטה">${GIC.rec.replace('width="30" height="30"', 'width="18" height="18"')}</button><button class="vbtn" data-play="${esc(k)}" ${has ? '' : 'disabled'} aria-label="השמעה">${GIC.play.replace('width="30" height="30"', 'width="16" height="16"')}</button><button class="vbtn" data-vdel="${esc(k)}" ${has ? '' : 'disabled'} aria-label="מחיקה">${IC.x}</button></div>`; }).join('')}</div>
  <div class="small muted">${n}/${l.words.length} מילים מוקלטות</div></section>`;
}
function bindVoice() {
  on('[data-act="vrall"]', b => startVrec(arr((isDad() ? RKID : S).lists).find(x => x.id === b.dataset.l) || curList()));
  on('[data-rec]', b => recStart(b.dataset.rec, started => { if (started) b.classList.add('on'); else render(); }));
  on('[data-play]', b => playVoice(b.dataset.play));
  on('[data-vdel]', b => { voiceDel(b.dataset.vdel); render(); });
}

/* ---------- real rewards: the list (dad edits) and what Romi bought (dad approves when it happens) ---------- */
function rewardsHTML(D) {
  const list = isDad() ? (arr((PDOC || {}).rewards).length ? arr(PDOC.rewards) : arr(D.rewards)) : S.rewards;
  return `<section class="card stack"><h3>פרסים אמיתיים בחנות</h3><p class="small muted">רומי קונה אותם בממתקים, ואתה מאשר כשזה קורה. שורה לכל פרס: שם | מחיר בממתקים. היום היא מרוויחה בערך 15 עד 25 ממתקים ביום אימון.</p>
  <textarea class="txt" id="rwtxt" rows="5">${esc(list.map(r => `${r.t} | ${r.p}`).join('\n'))}</textarea><button class="btn btn-ghost" data-act="rwsave">שמירת הפרסים</button></section>`;
}
function vouchersHTML(D) {
  const v = arr(D.vouchers), dec = (PDOC || {}).dec || {}, wait = v.filter(x => x.state === 'wait' && !(isDad() && dec[x.id]));
  if (!wait.length) return '';
  return `<section class="card stack hi"><h3>רומי קנתה ומחכה לך</h3>${wait.map(x => `<div class="lrow"><div class="grow"><b>${esc(x.t)}</b><div class="small muted">${x.p} ממתקים · ${+x.d.slice(8)}.${+x.d.slice(5, 7)}</div></div><button class="chip on" data-vok="${x.id}">קרה ✓</button><button class="chip" data-vno="${x.id}">ביטול</button></div>`).join('')}
  <p class="small muted">ביטול מחזיר לה את הממתקים.</p></section>`;
}
function voucherDecide(id, ok) {
  if (isDad()) { PDOC.dec = PDOC.dec || {}; PDOC.dec[id] = ok ? 'ok' : 'no'; return pPut(cloudCfg(), PDOC).then(r => { toast(r ? 'נשלח לטלפון של רומי' : 'השליחה נכשלה'); render(); }); }
  applyVoucher(id, ok); save(); render();
}
function applyVoucher(id, ok) {
  const v = S.vouchers.find(x => x.id === id); if (!v || v.state !== 'wait') return null;
  v.state = ok ? 'done' : 'cancel'; v.dd = todayStr(); if (!ok) addCandy(v.p); track('vok', { t: v.t, ok: ok ? 1 : 0 }); return v;
}
function bindRewards() {
  on('[data-vok]', b => voucherDecide(b.dataset.vok, true));
  on('[data-vno]', b => voucherDecide(b.dataset.vno, false));
  on('[data-act="rwsave"]', async () => {
    const list = document.getElementById('rwtxt').value.split('\n').map(s => s.split('|')).filter(x => x.length >= 2).map(([t, p]) => ({ t: t.trim(), p: Math.max(1, parseInt(p, 10) || 0) })).filter(r => r.t && r.p);
    if (isDad()) { PDOC.rewards = list; PDOC.rv = Date.now(); toast(await pPut(cloudCfg(), PDOC) ? 'נשלח לטלפון של רומי' : 'השליחה נכשלה'); }
    else { S.rewards = list; save(); toast('נשמר'); }
  });
  on('[data-act="repcopy"]', async () => { const t = reportText(isDad() ? RKID : S); try { await navigator.clipboard.writeText(t); toast(`הדוח הועתק. אפשר להדביק אותו בצ'אט.`); } catch (e) { const ta = document.getElementById('reptxt'); if (ta) { ta.hidden = false; ta.value = t; ta.select(); } toast('סמנו את הטקסט והעתיקו'); } });
}
/* ---------- the usage report: the last 14 days from the log ---------- */
const NAMES = { meanEN: 'פירוש (בחירה)', meanHE: 'מעברית לאנגלית (בחירה)', pick: 'זיהוי איות', tiles: 'הרכבה מאותיות', typeEN: 'כתיבה מהשמיעה', typeHE2EN: 'כתיבה מעברית', writeHE: 'פירוש בכתב', tramp: 'טרמפולינה', memory: 'זיכרון', rain: 'גשם היסודות', teach: 'המורה רומי', duel: 'דו-קרב', speak: 'תגידי את זה', wand: 'שרביט ה-E' };
function usage(D) {
  const log = arr((D || {}).log), since = Date.now() - 14 * 864e5, L = log.filter(e => e.t >= since), days = {};
  const dayOf = t => todayStr(new Date(t));
  for (let i = 13; i >= 0; i--) { const d = addDays(todayStr(), -i); days[d] = { min: 0, s: 0, ok: 0, n: 0, g: 0, t: [], a: ((D || {}).days || {})[d] || 0 }; }   /* a: finished activities, counted since the first version */
  const ty = {}, games = {}, vf = [], buys = [], hours = [0, 0, 0];
  L.forEach(e => {
    const d = days[dayOf(e.t)]; if (!d) return;
    if (e.dur) d.min += e.dur / 60;
    if (e.k === 's') { d.s++; d.ok += e.ok || 0; d.n += e.n || 0; for (const [k, v] of Object.entries(e.ty || {})) { const a = ty[k] || (ty[k] = [0, 0]); a[0] += v[0]; a[1] += v[1]; } const h = new Date(e.t).getHours(); hours[h < 13 ? 0 : h < 18 ? 1 : 2]++; }
    if (e.k === 'g') { d.g++; (games[e.g] = games[e.g] || []).push(e.sc); }
    if (e.k === 't') d.t.push(e.sc);
    if (e.k === 'vf') vf.push(e);
    if (e.k === 'buy') buys.push(e);
  });
  const words = Object.entries((D || {}).p || {}).map(([k, q]) => ({ k, bad: q.bad || 0, ok: q.ok || 0, wr: arr(q.wr) })).filter(x => x.bad > 0).sort((a, b) => (b.bad - b.ok / 2) - (a.bad - a.ok / 2)).slice(0, 8);
  const active = Object.values(days).filter(d => d.a || d.min > 0 || d.s).length, totMin = Math.round(Object.values(days).reduce((a, d) => a + d.min, 0));
  const S2 = Object.values(days).reduce((a, d) => (a.ok += d.ok, a.n += d.n, a.s += d.s, a), { ok: 0, n: 0, s: 0 });
  return { days, ty, games, vf, buys, words, active, totMin, acc: S2.n ? Math.round(S2.ok / S2.n * 100) : null, sessions: S2.s, hours, opens: L.filter(e => e.k === 'open').length, quits: L.filter(e => e.k === 'q').length, since: log.length ? dayOf(log[0].t) : null };
}
function reportHTML(D) {
  const u = usage(D); if (!u.since && !Object.values(u.days).some(d => d.a)) return `<section class="card stack"><h3>דוח שימוש</h3><p class="small muted">עוד אין נתונים. הדוח מתמלא מהאימונים, המשחקים וההכתבות.</p></section>`;
  const rows = Object.entries(u.days).filter(([d, x]) => x.a || x.min || x.s || x.g || x.t.length).map(([d, x]) => `<tr><td>${'אבגדהוש'[new Date(d + 'T12:00').getDay()]}' ${+d.slice(8)}.${+d.slice(5, 7)}</td><td>${x.a}</td><td>${x.min ? Math.round(x.min) : '—'}</td><td>${x.s}</td><td>${x.n ? Math.round(x.ok / x.n * 100) + '%' : '—'}</td><td>${x.g}</td><td>${x.t.join(', ') || '—'}</td></tr>`).join('');
  const tys = Object.entries(u.ty).filter(([k]) => NAMES[k]).map(([k, [ok, n]]) => `<span class="tag">${NAMES[k]} ${Math.round(ok / n * 100)}%</span>`).join(' ');
  return `<section class="card stack"><h3>דוח שימוש: 14 הימים האחרונים</h3><p class="small muted">דקות, דיוק וסוגי תרגיל נאספים מגרסה 39. פעילויות שהסתיימו נספרות מההתחלה.</p>
  <div class="kpis"><div><b>${u.active}</b><span>ימים פעילים</span></div><div><b>${u.totMin}</b><span>דקות</span></div><div><b>${u.sessions}</b><span>אימונים</span></div><div><b>${u.acc == null ? '—' : u.acc + '%'}</b><span>נכון בניסיון ראשון</span></div></div>
  ${rows ? `<div class="tscroll"><table class="ptab"><tr><th>יום</th><th>פעילויות</th><th>דק׳</th><th>אימונים</th><th>דיוק</th><th>משחקים</th><th>בוחן</th></tr>${rows}</table></div>` : ''}
  ${tys ? `<div class="small">לפי סוג תרגיל: ${tys}</div>` : ''}
  ${u.words.length ? `<div class="small">מילים קשות: ${u.words.map(w => `<b dir="ltr">${esc(w.k)}</b>${w.wr.length ? ` <span class="muted" dir="ltr">(${w.wr.slice(0, 2).map(esc).join(', ')})</span>` : ''}`).join(' · ')}</div>` : ''}
  ${Object.keys(u.games).length ? `<div class="small">משחקים: ${Object.entries(u.games).map(([g, s]) => `${NAMES[g] || g} ×${s.length}`).join(' · ')}</div>` : ''}
  ${u.vf.length ? `<div class="small bad">הקול של אבא לא הושמע ${u.vf.length} פעמים (אחרונה: ${esc(u.vf[u.vf.length - 1].why)})</div>` : ''}
  <button class="btn btn-ghost" data-act="repcopy">העתקת הדוח (להדבקה בצ'אט)</button><textarea class="txt" id="reptxt" rows="4" hidden></textarea></section>`;
}
function reportText(D) {
  const u = usage(D), lines = [`סלטה למוח · דוח שימוש · ${todayStr()} · גרסה ${APP_VER}`, `14 ימים: ${u.active} ימים פעילים, ${u.totMin} דקות, ${u.sessions} אימונים, ${u.quits} יציאות באמצע, נכון בניסיון ראשון ${u.acc == null ? '-' : u.acc + '%'}, פתיחות ${u.opens}. שעות האימונים: בוקר ${u.hours[0]}, צהריים ${u.hours[1]}, ערב ${u.hours[2]}.`];
  Object.entries(u.days).forEach(([d, x]) => { if (x.a || x.min || x.s || x.g || x.t.length) lines.push(`${d}: ${x.a} פעילויות, ${Math.round(x.min)} דק', ${x.s} אימונים, דיוק ${x.n ? Math.round(x.ok / x.n * 100) + '%' : '-'}, ${x.g} משחקים${x.t.length ? ', בוחן ' + x.t.join('/') : ''}`); });
  lines.push('לפי סוג תרגיל: ' + Object.entries(u.ty).map(([k, [ok, n]]) => `${k} ${ok}/${n}`).join(', '));
  lines.push('מילים קשות: ' + u.words.map(w => `${w.k} (${w.bad} טעויות${w.wr.length ? ': ' + w.wr.join(', ') : ''})`).join('; '));
  lines.push('משחקים: ' + Object.entries(u.games).map(([g, s]) => `${g} ${s.length}× [${s.join(',')}]`).join('; '));
  lines.push('קול של אבא, כשלים: ' + (u.vf.map(e => `${e.w} ${e.why} (${e.st})`).join('; ') || 'אין') + ` · מילים מוקלטות: ${Object.keys(VOICE).length}`);
  lines.push('קניות: ' + (u.buys.map(e => `${e.t || e.item} ${e.p}`).join('; ') || 'אין') + ` · ממתקים עכשיו ${(D || {}).candy || 0}`);
  const l = curList(); if (l) lines.push(`${l.t}: ` + l.words.map(w => `${w.en} ${Math.min(stageOf(w, l), maxSt(l))}/${maxSt(l)}${isSpell(l) && spells(w) ? ' כתיב✓' : ''}`).join(', '));
  return lines.join('\n');
}

/* the English voices on this phone, best first */
function voiceOptions() {
  const vs = (VOICES || []).filter(v => /^en/i.test(v.lang)), q = v => (/premium|enhanced|neural|natural/i.test(v.name) ? 0 : 1) + (/US/i.test(v.lang) ? 0 : /GB/i.test(v.lang) ? .1 : .2);
  if (!vs.length) return '<option value="">הקולות עוד נטענים...</option>';
  const best = voiceFor('en');
  return `<option value="">אוטומטי (${esc(best ? best.name : '')})</option>` + vs.slice().sort((a, b) => q(a) - q(b)).map(v => `<option value="${esc(v.name)}" ${S.enVoice === v.name ? 'selected' : ''}>${esc(v.name)} · ${esc(v.lang)}</option>`).join('');
}

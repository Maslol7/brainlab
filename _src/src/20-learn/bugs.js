/* ---------- question bug reports ----------
   The kid can mark a question that looks wrong or unclear. The report keeps the full question,
   goes to the cloud with the rest of the state, and is listed in the parent area with "copy all".
   A reported question leaves the mistakes notebook, so a broken question does not keep coming back.
   No reward for reporting: it must stay a tool, not a game. */
const BUG_WHY = [['wrong', 'התשובה של האפליקציה לא נכונה'], ['two', 'יש יותר מתשובה נכונה אחת'], ['unclear', 'השאלה לא ברורה'], ['pic', 'הציור לא ברור'], ['other', 'משהו אחר']];
const BUG_MAX = 25;
const bugWhy = k => (BUG_WHY.find(w => w[0] === k) || [, k])[1];
const bugDone = qid => (S.bugs || []).some(b => b.qid === qid);
function bugBtn(attr, qid) { return bugDone(qid) ? '<span class="qbug done">דיווחת על השאלה. תודה!</span>' : `<button class="qbug" ${attr}>יש בעיה בשאלה?</button>`; }
/* q: a full question (from the quiz) or a review line from the result screen (text only) */
function openBugSheet(q, his, onDone) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="card bugsheet" role="dialog" aria-modal="true"><h4>מה הבעיה בשאלה?</h4><p class="small muted" style="margin:0 0 10px">הדיווח עוזר לתקן את השאלה. השאלה גם תצא ממחברת הטעויות.</p>
  <div class="chips bugwhy">${BUG_WHY.map(([k, t]) => `<button class="chip" data-why="${k}">${t}</button>`).join('')}</div>
  <textarea class="txt" id="bugnote" maxlength="200" placeholder="רוצה להסביר? (לא חובה)" style="width:100%;height:70px;margin-top:10px"></textarea>
  <div class="rw" style="margin-top:10px"><button class="btn btn-ghost" data-m="no">ביטול</button><button class="btn btn-primary" data-m="ok" disabled>שלח דיווח</button></div></div>`;
  app.appendChild(m);
  let why = null; const ok = m.querySelector('[data-m="ok"]');
  m.querySelectorAll('[data-why]').forEach(b => b.onclick = () => { why = b.dataset.why; m.querySelectorAll('[data-why]').forEach(x => x.classList.toggle('on', x === b)); ok.disabled = false; SFX.tap(); });
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-m]'); if (e.target === m || (b && b.dataset.m === 'no')) return m.remove();
    if (!b || !why) return;
    const note = (m.querySelector('#bugnote').value || '').trim().replace(/[<>]/g, '');
    saveBug(q, his, why, note); m.remove(); toast('תודה! הדיווח נשמר, ואבא יראה אותו.', 3000); if (onDone) onDone();
  });
}
function saveBug(q, his, why, note) {
  const qid = q.qid || mistId(q), raw = (q.options || q.items || []);
  const opts = raw.join('').length < 8000 ? raw : raw.map(strip);
  const b = { id: 'b' + Date.now(), qid, at: todayStr(), why, note, cat: q.cat, d: q.d, lk: q.lk || (q.vis != null ? lessonFor(q) : ''), prompt: strip(q.prompt || q.q),
    vis: q.vis ? (q.vis.length <= 6000 ? q.vis : strip(q.vis).slice(0, 600)) : '', opts, ans: q.type === 'order' ? q.correct : q.type === 'num' ? q.ansv : q.answer != null ? q.answer : strip(q.a || ''),
    his, ex: strip(q.ex), v: APP_VER };
  S.bugs = (S.bugs || []).concat(b).slice(-BUG_MAX);
  S.mist = S.mist.filter(x => x.id !== qid && x.id !== q.rev);
  save();
}
/* parent area: the list, with copy-all (to paste into a chat with Claude) */
function bugsSection(list, local) {
  list = arr(list); if (!list.length) return '';
  const L8 = ['א', 'ב', 'ג', 'ד', 'ה'];
  const item = b => `<details class="card bugitem"><summary><b>${esc(bugWhy(b.why))}</b> · ${CATS[b.cat] ? CATS[b.cat].n : esc(b.cat)} · ${String(b.at).split('-').reverse().join('.')}<div class="small muted">${esc(String(b.prompt).slice(0, 90))}</div></summary>
    ${b.note ? `<p class="small"><b>ההסבר שלו:</b> ${esc(b.note)}</p>` : ''}<p class="small">${esc(b.prompt)}</p>
    ${Array.isArray(b.opts) && b.opts.length ? `<div class="small">${b.opts.map((o, i) => `<div>${L8[i] || i + 1}. ${strip(o) || '(ציור)'}${i === b.ans ? ' <b style="color:var(--good)">← התשובה של האפליקציה</b>' : ''}${i === b.his ? ' <b style="color:var(--gold)">← הבחירה שלו</b>' : ''}</div>`).join('')}</div>` : `<div class="small">תשובת האפליקציה: <b>${esc(String(b.ans))}</b>${b.his != null && b.his !== '' ? ` · שלו: <b>${esc(String(b.his))}</b>` : ''}</div>`}
    <p class="small muted">${esc(b.ex || '')}</p></details>`;
  return `<section data-nog><div class="sec-h"><h3>דיווחים על שאלות (${list.length})</h3></div><div class="stack" style="gap:8px">${list.slice().reverse().map(item).join('')}
  <div class="row" style="gap:8px"><button class="btn btn-primary" data-bugcopy="${local ? 'local' : 'cloud'}" style="flex:1;min-height:44px">העתק הכל (להדבקה לClaude)</button>${local ? '<button class="btn btn-ghost" data-bugclear style="min-height:44px">נקה</button>' : ''}</div></div></section>`;
}
function bindBugs() {
  app.querySelectorAll('[data-bugcopy]').forEach(b => b.onclick = async () => {
    const list = b.dataset.bugcopy === 'local' ? arr(S.bugs) : arr((ccGet() || {}).bugs);
    const txt = 'דיווחים על שאלות ממעבדת המוח:\n' + JSON.stringify(list.map(x => Object.assign({}, x, { why: bugWhy(x.why) })), null, 1);
    try { await navigator.clipboard.writeText(txt); toast('הועתק. אפשר להדביק בשיחה.'); } catch (e) { toast('לא הצלחתי להעתיק'); }
  });
  const c = app.querySelector('[data-bugclear]'); if (c) c.onclick = () => modal('לנקות את הדיווחים?', 'כדאי קודם להעתיק אותם.', 'לנקות', () => { S.bugs = []; save(); render(); }, 'btn-boss');
  /* in the quiz: the current question */
  const q1 = app.querySelector('[data-qbug="cur"]'); if (q1) q1.onclick = () => { const c0 = S.cur; if (!c0) return; const q = c0.qs[c0.i], r = c0.res[c0.i]; openBugSheet(q, r ? (r.sel >= 0 ? r.sel : r.val) : null, () => renderQuiz()); };
  /* on the result screen: a line of the review */
  app.querySelectorAll('[data-qbug^="rev"]').forEach(b => b.onclick = e => { e.preventDefault(); const x = S.last && S.last.review[+b.dataset.qbug.slice(3)]; if (x) openBugSheet(Object.assign({ qid: x.qid || ('r' + strip(x.q).length + x.cat) }, x), null, () => render()); });
}

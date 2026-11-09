/* ---------- dad's notes: rare, short, never during a hard moment more than once ---------- */
const DAD_DEF = ['תזכור, אבא אוהב אותך.', 'אבא גאה בך. לא בגלל הציון, בגלל שאתה מתאמן.', 'גם בימים שקשה, אבא איתך.', 'אבא אוהב אותך. עכשיו לך לשתות מים ולזוז קצת.', 'הכי חשוב שאתה לא מוותר. אבא אוהב אותך.', 'אבא סומך עליך.'];
const DAD_HARD = ['קשה? זה בסדר. אבא אוהב אותך, וזה לא תלוי בציון.', 'נשימה עמוקה. אבא איתך.', 'גם אלופים מפספסים. אבא אוהב אותך.'];
const dadList = () => (S.dadMsgs && S.dadMsgs.length) ? S.dadMsgs : S.guest ? null : DAD_DEF;
function dadNext(list) { if (!list) return ''; S.loveI = ((S.loveI || 0) + 1) % list.length; return list[S.loveI]; }
const dadHTML = t => t ? `<div class="love">${IC.heart || '♥'}<span>${esc(t)}</span></div>` : '';
function loveLine(c, correct, n) {
  if (!['daily', 'boss', 'sim'].includes(c.kind)) return '';
  const lost = c.kind === 'boss' && correct / n < .7, low = correct / n < .5;
  const every = (doneCount(S) % 4) === 2;
  return (lost || low || every) ? dadNext(dadList()) : '';
}
function loveOnStreak(c, ok, first) {
  if (deferred(c.kind)) return '';
  if (ok && first) { c.wrongRun = 0; return ''; }
  c.wrongRun = (c.wrongRun || 0) + 1;
  if (c.wrongRun < 3 || c.loveShown) return '';
  const l = (S.dadMsgs && S.dadMsgs.length) ? S.dadMsgs : S.guest ? null : DAD_HARD;
  if (!l) return '';
  c.loveShown = true; return pick(l);
}
function dadMsgSection() {
  const cur = (S.dadMsgs && S.dadMsgs.length ? S.dadMsgs : S.guest ? [] : DAD_DEF).map(esc).join('\n');
  return `<section class="card stack" style="gap:8px"><h4 style="font-size:1.15rem">הודעות מאבא</h4><p class="small muted" style="margin:0">מופיעות מדי פעם בסוף משימה, וגם כשיש רצף של טעויות (פעם אחת במשימה). שורה לכל הודעה.</p><textarea class="txt" id="dadmsgs" style="width:100%;height:130px;line-height:1.6">${cur}</textarea><button class="btn btn-primary" data-act="dadsave" style="min-height:44px">שמור</button></section>`;
}
/* one-time: a message from dad about keeping at it, with one diamond. Given when shown, so a closed window still counts. */
function dadPraise() {
  if (PROF.id !== 'yonatan' || S.guest || isSbx() || isDadPhone() || (S.aw || {}).dad28 || S.view !== 'home' || app.querySelector('.modal')) return;
  const n = Object.keys(S.missions || {}).length, best = Math.max(S.best || 0, S.streak || 0);
  if (n < 5) return;
  (S.aw || (S.aw = {})).dad28 = todayStr(); giveDia(1, 'מאבא: על ההתמדה', []); save();
  modal('הודעה מאבא', `<span class="dadmsg"><span class="dadgem">◆</span>יונתן, ראיתי מה עשית. כבר ${n} משימות${best >= 3 ? `, ורצף שיא של ${best} ימים` : ''}. מה שהכי משמח אותי זה לא הנקודות. זו ההתמדה: אתה חוזר כל יום ומתאמן, גם כשהשאלות קשות. ככה בונים מוח חזק.<br><br>אני גאה בך. קיבלת ממני יהלום אחד על ההתמדה.<br><b>אבא</b></span>`, 'תודה אבא!', () => renderView(), 'btn-primary', true);
}

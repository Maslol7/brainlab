const isGirl = () => PROF.g === 'f' && !S.guest;
/* ---------- feminine forms (UI text addressed to the kid; parent area stays as is) ---------- */
const GPH = [['אני יודע', 'אני יודעת'], ['ברוך הבא', 'ברוכה הבאה'], ['סדר את', 'סדרי את'], ['סדר מהקטן', 'סדרי מהקטן'], ['לך לשתות', 'לכי לשתות'], ['אתה מתאמן', 'את מתאמנת'], ['שאתה מתאמן', 'שאת מתאמנת'], ['שאתה לא מוותר', 'שאת לא מוותרת'], ['אתה לא מוותר', 'את לא מוותרת'], ['אתה יכול', 'את יכולה'], ['המשך לשאלה', 'המשיכי לשאלה'], ['שמע, זכור', 'שמעי, זכרי'], ['פתח מתנה', 'פתחי מתנה'], ['צייר קו', 'ציירי קו'], ['צייר את', 'ציירי את'], ['צייר שתי', 'ציירי שתי'], ['בחר תשובה', 'בחרי תשובה']];
const GW = { 'אתה': 'את', 'נסה': 'נסי', 'לחץ': 'לחצי', 'זכור': 'זכרי', 'נגן': 'נגני', 'התחל': 'התחילי', 'תזכור': 'תזכרי', 'תראה': 'תראי', 'מוכן': 'מוכנה', 'אלוף': 'אלופה', 'שתף': 'שתפי', 'הצב': 'הציבי', 'דלג': 'דלגי', 'בדוק': 'בדקי', 'עליך': 'עלייך', 'מתאמן': 'מתאמנת', 'מוותר': 'מוותרת', 'בוא': 'בואי', 'צא': 'צאי', 'ספור': 'ספרי', 'חפש': 'חפשי', 'שים': 'שימי', 'תן': 'תני', 'מוכן?': 'מוכנה?', 'תסביר': 'תסבירי', 'זרוק': 'זרקי', 'הסברת': 'הסברת' };
const GRE = new RegExp(`(^|[^א-ת])([ושכ]?)(${Object.keys(GW).map(k => k.replace('?', '\\?')).sort((a, b) => b.length - a.length).join('|')})(?=[^א-ת]|$)`, 'g');
function femText(t) {
  if (!/[א-ת]/.test(t)) return t;
  GPH.forEach(([a, b]) => { if (t.includes(a)) t = t.split(a).join(b); });
  return t.replace(GRE, (m, pre, px, w) => pre + px + GW[w]);
}
function femNode(root) {
  if (!isGirl() || S.view === 'parent') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && n.parentElement.closest('svg,script,style,.kbl,[data-nog]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const ns = []; while (w.nextNode()) ns.push(w.currentNode);
  ns.forEach(n => { const v = femText(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
  root.querySelectorAll && root.querySelectorAll('[placeholder],[aria-label]').forEach(e => { ['placeholder', 'aria-label'].forEach(a => { const v = e.getAttribute(a); if (v) { const f = femText(v); if (f !== v) e.setAttribute(a, f); } }); });
}
try { new MutationObserver(ms => { if (!isGirl()) return; ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) femNode(n); else if (n.nodeType === 3 && n.parentElement) femNode(n.parentElement); })); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { }

/* ---------- switching kids (parent area) ---------- */
function switchProfile(id) {
  if (!PROFILES[id] || id === PROF.id) return;
  save();
  try {
    const t = PROFILES[id], raw = localStorage.getItem(t.key), o = raw ? JSON.parse(raw) : null, pin = S.pin;
    if (o && !o.pin && pin) { o.pin = pin; localStorage.setItem(t.key, JSON.stringify(o)); }
    if (!o && pin) localStorage.setItem('bl-pin-carry', pin);
    localStorage.setItem('bl-profile', id); sessionStorage.removeItem('bl-sbx');
  } catch (e) { }
  location.reload();
}
function profileSection() {
  const kids = Object.values(PROFILES);
  const btns = kids.map(k => k.id === PROF.id ? `<button class="btn btn-primary" disabled style="flex:1;min-height:44px">${k.name} (עכשיו)</button>` : `<button class="btn btn-ghost" data-prof="${k.id}" style="flex:1;min-height:44px">עבור ל${k.name}</button>`).join('');
  const links = kids.map(k => `<div class="row small" style="justify-content:space-between;gap:8px"><span>הטלפון של ${k.name}</span><button class="chip" data-proflink="${k.id}">שלח קישור</button></div>`).join('');
  return `<section class="card stack" style="gap:10px" data-nog><h4 style="font-size:1.15rem">ילדים</h4><p class="small muted" style="margin:0">לכל ילד התקדמות נפרדת. מעבר בין הילדים לא מוחק כלום.</p><div class="row" style="gap:8px">${btns}</div>
  <details class="small"><summary class="muted">התקנה בטלפון של כל ילד</summary><p class="muted" style="margin:6px 0">קישור שפותח את האפליקציה ישר בפרופיל של הילד. פותחים אותו פעם אחת בטלפון שלו ומוסיפים למסך הבית.</p>${links}</details></section>`;
}
function bindProfiles() {
  app.querySelectorAll('[data-prof]').forEach(b => b.onclick = () => modal(`לעבור ל${PROFILES[b.dataset.prof].name}?`, 'ההתקדמות של כל ילד נשמרת בנפרד.', 'עבור', () => switchProfile(b.dataset.prof), 'btn-primary'));
  app.querySelectorAll('[data-proflink]').forEach(b => b.onclick = async () => {
    const k = PROFILES[b.dataset.proflink], url = APP_URL + '?kid=' + k.id, text = `מעבדת המוח של ${k.name}`;
    try { if (navigator.share) return await navigator.share({ title: text, url }); } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast('הקישור הועתק'); } catch (e) { toast(url, 6000); }
  });
}

let KEY = (() => { try { return sessionStorage.getItem(SBX_FLAG) ? SBX_KEY : MAIN_KEY; } catch (e) { return MAIN_KEY; } })();
function defState() { return { start: todayStr(), xp: 0, coins: 0, streak: 0, best: 0, lastDone: null, freezes: 0, hints: 0, missions: {}, stats: {}, times: {}, rat: {}, seen: {}, badges: [], exam: '2027-01-15', cur: null, view: 'home', own: { skin: ['auto'] }, skin: 'auto', sound: true, mist: [], arcade: { sprint: 0, piano: 0, kupa: 0 }, bdGift: {}, last: null, openW: null, dia: 0, diaLog: [], rewards: [], vouchers: [], pin: null, jokes: 0, aw: {} }; }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.start) { const d = defState(); const o = Object.assign(d, s); o.own = { skin: ['auto'].concat(((s.own || {}).skin || []).filter(x => SKINS[x] && x !== 'auto')) }; if (!SKINS[o.skin]) o.skin = 'auto'; o.arcade = Object.assign({ sprint: 0, piano: 0, kupa: 0 }, s.arcade || {}); if (['avatar'].includes(o.view)) o.view = 'home'; if (o.exam === '2026-12-21' && !o.examMig) o.exam = '2027-01-15'; o.examMig = 1; return o; } } catch (e) { } return defState(); }
let S = load();
sanitizeState();
function save() { S.seen = SEEN; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } cloudSoon(); }
/* 3. tolerate old, partial or cloud-shaped state */
function sanitizeState() {
  try {
    normCloud(S);
    const d = defState(); Object.keys(d).forEach(k => { if (S[k] == null && d[k] != null) S[k] = d[k]; });
    if (S.cur) {
      const c = S.cur, ok = Array.isArray(c.qs) && c.qs.length && c.qs.every(q => q && CATS[q.cat]) && c.i >= 0 && c.i < c.qs.length;
      if (!ok) { S.cur = null; if (S.view === 'quiz') S.view = 'home'; } else if (!Array.isArray(c.res)) c.res = c.res ? Object.values(c.res) : [];
    }
    if (S.view === 'result' && (!S.last || !Array.isArray(S.last.review) || !Array.isArray(S.last.newB))) S.view = 'home';
    S.mist = (S.mist || []).filter(m => m && m.q && CATS[m.q.cat]);
    SEEN = S.seen || (S.seen = {});
  } catch (e) { console.error('sanitize', e); }
}

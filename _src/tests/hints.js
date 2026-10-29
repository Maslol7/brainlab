// Every generated question must carry its own two hints. Prints coverage per question type and possible leaks.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const html = require('fs').readFileSync(process.argv.slice(2).find(a => !a.startsWith('--')) || 'dist/index.html', 'utf8');
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`); await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const cov = {}, leaks = [], samples = {};
    const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const check = (q, src) => {
      const k = (q.lk || lessonFor(q)) + (q.type === 'order' ? ':order' : ''); const c = cov[k] || (cov[k] = { n: 0, ok: 0, src: new Set() }); c.n++; c.src.add(src);
      const ok = Array.isArray(q.hint) && q.hint.length === 2 && q.hint.every(h => typeof h === 'string' && h.length > 8);
      if (ok) { c.ok++; if (!samples[k]) samples[k] = [strip(q.prompt).slice(0, 70), strip(q.hint[0]), strip(q.hint[1])]; }
      if (ok && q.ansv != null) { const re = new RegExp('(^|[^0-9.])' + String(q.ansv).replace('.', '\\.') + '([^0-9.]|$)'); q.hint.forEach((h, i) => { if (re.test(strip(h)) && !re.test(strip(q.prompt) + ' ' + strip(q.vis))) leaks.push([k, i + 1, q.ansv, strip(h)]); }); }
      if (ok && q.options && q.answer != null) { const a = strip(q.options[q.answer]); if (a.length > 2) q.hint.forEach((h, i) => { if (strip(h).includes(a)) leaks.push([k, i + 1, a, strip(h)]); }); }
    };
    for (const cat of Object.keys(GEN)) for (let d = 1; d <= 4; d++) for (let i = 0; i < 70; i++) { try { check(GEN[cat](d), cat + d); } catch (e) { leaks.push(['ERR', cat, d, e.message]); } }
    for (const k of Object.keys(MT)) for (let d = 1; d <= 3; d++) for (let i = 0; i < 12; i++) { try { check(MT[k](d), 'MT.' + k); } catch (e) { leaks.push(['ERR', k, d, e.message]); } }
    return { cov: Object.fromEntries(Object.entries(cov).map(([k, v]) => [k, `${v.ok}/${v.n} ${[...v.src].slice(0, 3).join(',')}`])), leaks: leaks.slice(0, 40), samples };
  });
  const miss = Object.entries(r.cov).filter(([k, v]) => !/^(\d+)\/\1 /.test(v));
  console.log('MISSING HINTS:'); miss.forEach(([k, v]) => console.log('  ' + k + ' ' + v));
  console.log('POSSIBLE LEAKS:', r.leaks.length); r.leaks.forEach(l => console.log('  ' + JSON.stringify(l)));
  if (process.argv.includes('--samples')) for (const [k, s] of Object.entries(r.samples)) console.log(`\n[${k}] ${s[0]}\n  1: ${s[1]}\n  2: ${s[2]}`);
  console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no errors'); await b.close(); process.exit(miss.length || errs.length ? 1 : 0); })();

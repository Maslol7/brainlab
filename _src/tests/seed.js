// Preload (node -r ./tests/seed.js): every page gets the same Math.random sequence, so old and new builds can be compared exactly.
// Saved states also get the one-time dad message marked as seen, so it does not cover the screens the old tests click.
const pw = require('playwright');
const SEED = `{const gi=Storage.prototype.getItem;Storage.prototype.getItem=function(k){const v=gi.call(this,k);if(v&&/^brainlab-/.test(k)&&v[0]==='{'){try{const o=JSON.parse(v);if(o.missions){o.aw=o.aw||{};o.aw.dad28=o.aw.dad28||'seed';return JSON.stringify(o);}}catch(e){}}return v};}{let a=20261029;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}`;
const launch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (...a) => {
  const b = await launch(...a);
  const nc = b.newContext.bind(b);
  b.newContext = async (...x) => { const c = await nc(...x); await c.addInitScript(SEED); return c; };
  b.newPage = async (...x) => { const c = await b.newContext(...x); const p = await c.newPage(); return p; };
  return b;
};

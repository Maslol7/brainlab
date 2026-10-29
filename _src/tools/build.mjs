// Build: concatenate src modules (order in src/order.json) into one page.
//   node tools/build.mjs            -> dist/ (artifact page + pwa folder), same version
//   node tools/build.mjs --release  -> bump version, build, zip to /mnt/user-data/outputs/brainlab-pwa-vN.zip
import fs from 'fs';
import { execSync } from 'child_process';
const ROOT = new URL('..', import.meta.url).pathname, rd = p => fs.readFileSync(ROOT + p, 'utf8');
const release = process.argv.includes('--release');
const ver = JSON.parse(rd('version.json'));
if (release) { ver.v = String(+ver.v + 1); fs.writeFileSync(ROOT + 'version.json', JSON.stringify(ver) + '\n'); }
const V = ver.v;
/* BUILD_DIR=dist-x builds into another folder (parallel work); releases always use dist/ */
const DIST = (!release && process.env.BUILD_DIR) || 'dist';
const order = JSON.parse(rd('src/order.json'));
const js = order.map(m => `/* ---- ${m} ---- */\n` + rd('src/' + m)).join('\n').replace(/__VER__/g, V) + '\nrender(); guestOnboard();\n';
// syntax check before writing anything
new Function(js);
const head = rd('src/static/head.html') + '<style>\n' + rd('src/styles/app.css') + '</style>\n' + rd('src/static/body.html');
fs.rmSync(ROOT + DIST, { recursive: true, force: true }); fs.mkdirSync(ROOT + DIST + '/pwa', { recursive: true });
fs.writeFileSync(ROOT + DIST + '/index.html', head + '<script>\n' + js + '</script>\n');
const sw = "if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));\n";
fs.writeFileSync(ROOT + DIST + '/pwa/index.html', rd('src/static/pwa-top.html') + head + '<script>\n' + js + sw + '</script>\n</body></html>\n');
for (const f of fs.readdirSync(ROOT + 'src/static')) if (/\.(png|webmanifest)$/.test(f)) fs.copyFileSync(ROOT + 'src/static/' + f, ROOT + DIST + '/pwa/' + f);
fs.writeFileSync(ROOT + DIST + '/pwa/sw.js', rd('src/static/sw.js').replace(/__VER__/g, V));
fs.writeFileSync(ROOT + DIST + '/pwa/version.json', JSON.stringify({ v: V }));
console.log(`built v${V}: ${js.split('\n').length} lines of JS, ${order.length} modules`);
if (release) {
  const zip = `/mnt/user-data/outputs/brainlab-pwa-v${V}.zip`;
  /* the source travels with the site in _src/ (GitHub Pages does not publish folders that start with _) */
  execSync(`rm -rf ${ROOT}dist/pwa/_src && mkdir -p ${ROOT}dist/pwa/_src && cd ${ROOT} && cp -r src tools tests README.md package.json version.json dist/pwa/_src/ && rm -rf dist/pwa/_src/tools/inventory.json`);
  execSync(`cd ${ROOT}dist/pwa && rm -f ${zip} && zip -qr ${zip} .`);
  console.log('zip', zip);
}

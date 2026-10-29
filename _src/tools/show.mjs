import fs from 'fs';
const inv = JSON.parse(fs.readFileSync('/home/claude/brainlab-src/tools/inventory.json'));
const want = process.argv.slice(2);
for (const o of inv) {
  if (!o.names.some(n => want.includes(n) || want.some(w => w.startsWith('_') && n === w))) continue;
  const src = fs.readFileSync('/home/claude/brainlab/' + o.f, 'utf8');
  console.log(`// ==== ${o.f} :: ${o.names.join(',')}`);
  console.log(src.slice(o.start, o.end));
}

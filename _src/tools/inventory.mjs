import * as acorn from 'acorn';
import fs from 'fs';
const ORDER = 'profile.js gen.js gen2.js gen3.js gen4.js lessons.js gen5.js learn10.js extra.js share.js sandbox.js update.js cloud.js ui5.js nav9.js v11.js v12.js v13.js v14.js v15.js v16.js v17.js v18.js v19.js v20.js v21.js v22.js v23.js'.split(' ');
const out = [];
for (const f of ORDER) {
  const src = fs.readFileSync('/home/claude/brainlab/' + f, 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script' });
  for (const n of ast.body) {
    let kind = n.type, names = [];
    if (n.type === 'FunctionDeclaration') names = [n.id.name];
    else if (n.type === 'VariableDeclaration') names = n.declarations.map(d => d.id.name || '?');
    else if (n.type === 'ExpressionStatement') { const e = n.expression; if (e.type === 'AssignmentExpression') names = [src.slice(e.left.start, e.left.end)]; else names = ['<' + e.type + ':' + src.slice(n.start, Math.min(n.end, n.start + 50)).replace(/\s+/g, ' ') + '>']; }
    else names = ['<' + n.type + '>'];
    out.push({ f, kind: n.type === 'VariableDeclaration' ? n.kind : kind, names, start: n.start, end: n.end, lines: src.slice(n.start, n.end).split('\n').length });
  }
}
fs.writeFileSync('/home/claude/brainlab-src/tools/inventory.json', JSON.stringify(out, null, 1));
const byName = {}; out.forEach((o, i) => o.names.forEach(nm => (byName[nm] = byName[nm] || []).push(o.f)));
const multi = Object.entries(byName).filter(([k, v]) => v.length > 1);
console.log('items', out.length, 'multi-defined', multi.length);
console.log(multi.map(([k, v]) => k + ': ' + v.join(',')).join('\n'));

// Makes the static export path-independent (works from any sub-path or file host).
import fs from 'node:fs'; import path from 'node:path';
const out = path.resolve(import.meta.dirname, '../out');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
let n = 0;
for (const f of walk(out)) {
  const ext = path.extname(f);
  if (!['.html', '.js', '.css', '.txt'].includes(ext)) continue;
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  if (ext === '.css') s = s.replaceAll('/_next/static/media/', '../media/');
  else if (ext === '.js') s = s.replace(/(["'])\/_next\/\1/g, '$1./_next/$1');
  else s = s.replaceAll('"/_next/', '"./_next/').replaceAll("'/_next/", "'./_next/").replaceAll('\\"/_next/', '\\"./_next/');
  if (s !== before) { fs.writeFileSync(f, s); n++; }
}
for (const junk of ['404.html', '_not-found', '404']) fs.rmSync(path.join(out, junk), { recursive: true, force: true });
console.log(`relativized ${n} files`);

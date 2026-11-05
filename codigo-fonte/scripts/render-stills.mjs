// Offline product "photography": renders studio stills of the scan via headless Chromium.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || 'playwright');
import { createServer } from 'node:http';
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const [shotsFile, outDir] = process.argv.slice(2);
const only = process.argv[4]?.split(',');
const shots = (await import(path.resolve(shotsFile))).default.filter((s) => !only || only.includes(s.name));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg' };
const srv = createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(`http://localhost:${port}/scripts/studio/index.html`);
console.log(await page.evaluate(() => window.ready));
fs.mkdirSync(outDir, { recursive: true });
for (const s of shots) {
  const url = await page.evaluate((o) => window.shot(o), s);
  fs.writeFileSync(path.join(outDir, s.name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('rendered', s.name);
}
await browser.close(); srv.close();

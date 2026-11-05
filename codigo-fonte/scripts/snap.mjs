// Dev QA: screenshots through the scroll narrative. usage: node scripts/snap.mjs <outDir> [w] [h] [filter]
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import fs from 'node:fs'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || 'playwright');
const root = process.env.ROOT || path.resolve(import.meta.dirname, '../out');
const [outDir, w = 1440, h = 900, filter] = process.argv.slice(2);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.png': 'image/png' };
const srv = createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', (e) => console.log('[err]', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
await page.goto(`http://localhost:${srv.address().port}/`);
await page.waitForFunction(() => !document.querySelector('.preloader'), null, { timeout: 60000 });
await page.waitForTimeout(2500);
const shots = [
  ['01-hero', 'hero', 0], ['02-hero-mid', 'hero', 0.35], ['03-hero-flash', 'hero', 0.62],
  ['04-design-in', 'design', 0.18], ['05-design-a', 'design', 0.4], ['06-design-b', 'design', 0.62], ['07-design-blinds', 'design', 0.97],
  ['08-tech-in', 'tecnologia', 0.3], ['09-tech-explode', 'tecnologia', 0.62], ['10-tech-exit', 'tecnologia', 0.92],
  ['11-perf-a', 'performance', 0.3], ['12-perf-slash', 'performance', 0.5], ['13-perf-mask', 'performance', 0.73], ['14-perf-c', 'performance', 0.86],
  ['15-gal-a', 'detalhes', 0.25], ['16-gal-b', 'detalhes', 0.55], ['17-gal-full', 'detalhes', 0.97],
  ['18-product', 'comprar', 0.0], ['19-finale', 'futuro', 0.5], ['20-finale-b', 'futuro', 0.85], ['21-footer', null, 1],
].filter((s) => !filter || s[0].includes(filter));
fs.mkdirSync(outDir, { recursive: true });
for (const [name, id, f] of shots) {
  await page.evaluate(([id, f]) => {
    const H = innerHeight;
    let y;
    if (!id) y = document.documentElement.scrollHeight - H;
    else {
      const el = document.getElementById(id); const top = el.getBoundingClientRect().top + scrollY;
      y = top + Math.max(0, el.offsetHeight - H) * f;
    }
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
  }, [id, f]);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(outDir, name + '.png') });
  console.log('shot', name);
}
await browser.close(); srv.close();

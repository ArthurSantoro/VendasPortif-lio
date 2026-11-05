// Builds a self-contained preview: one HTML file (JS + CSS inlined) + public assets.
import { build } from 'esbuild';
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const out = process.argv[2] || path.join(root, 'artifact-dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const res = await build({
  entryPoints: [path.join(root, 'scripts/artifact/main.tsx')],
  bundle: true, minify: true, write: false, format: 'iife', target: 'es2020', jsx: 'automatic',
  outdir: out, define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@': path.join(root, 'src'), 'next/dynamic': path.join(root, 'scripts/artifact/next-dynamic.tsx') },
  loader: { '.css': 'css' }, logLevel: 'warning',
});
const js = res.outputFiles.find((f) => f.path.endsWith('.js')).text.replaceAll('</script', '<\\/script');
const css = res.outputFiles.find((f) => f.path.endsWith('.css')).text;
const html = `<title>VELOCITY X1</title>
<meta name="description" content="VELOCITY X1 — experiência cinematográfica de produto.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500&display=swap">
<style>:root{--font-display:'Archivo';--font-mono:'JetBrains Mono';color-scheme:dark}html,body{background:#060606}${css}</style>
<div id="root"></div>
<script>${js}</script>
`;
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.cpSync(path.join(root, 'public'), out, { recursive: true });
console.log('index.html', (html.length / 1e6).toFixed(2), 'MB');

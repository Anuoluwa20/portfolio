// Renders every route to static HTML after `vite build` and `vite build --ssr`.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// The project folder (npm runs scripts from there).
const root = process.cwd();
const dist = path.join(root, 'dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, paths } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);

const SITE = process.env.SITE_URL || '';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

for (const p of paths) {
  const { html, head } = await render(p);
  const tags = [
    `<title>${esc(head.title)}</title>`,
    `<meta name="description" content="${esc(head.description)}" />`,
    `<meta property="og:title" content="${esc(head.title)}" />`,
    `<meta property="og:description" content="${esc(head.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:image" content="${SITE}${head.image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    SITE ? `<link rel="canonical" href="${SITE}${p === '/' ? '/' : p}" />` : '',
  ].join('\n    ');
  const out = template
    .replace(/<title>.*?<\/title>/, '')
    .replace('<!--app-head-->', tags)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const file = p === '/' ? 'index.html' : p === '/404' ? '404.html' : path.join(p.slice(1), 'index.html');
  const target = path.join(dist, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, out);
  console.log('prerendered', p, '→', path.relative(root, target), `${(out.length / 1024).toFixed(1)} KB`);
}
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });

#!/usr/bin/env node
// Parchment — build-offline.mjs
// Writes dist/parchment-offline.html: one file that opens from a laptop with no network.
// Styles, the four Libre Baskerville files, the bundled script, every snapshot's data and the relief
// images are inlined. The loader (src/data/loader.js) reads the data from <script type="application/json"
// data-path="…"> blocks before it ever tries to fetch, and assetURL() reads window.__PARCHMENT_ASSETS__.
//   node scripts/build-offline.mjs

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist', 'parchment-offline.html');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const MIME = { '.png': 'image/png', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const dataURL = (p) => `data:${MIME[extname(p)] ?? 'application/octet-stream'};base64,${readFileSync(join(ROOT, p)).toString('base64')}`;
const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)} KB`;
const sizes = [];

// 1. The script, built exactly as for the site.
const built = await esbuild.build({
  absWorkingDir: ROOT, entryPoints: [join(ROOT, 'src', 'main.js')], bundle: true, format: 'iife',
  target: ['chrome100', 'edge100'], minify: true, legalComments: 'none', write: false, logLevel: 'warning',
});
const js = built.outputFiles[0].text.replace(/<\/script/gi, '<\/script');
sizes.push(['app.js', js]);

// 2. Styles, with the fonts embedded.
const css = read('src/tokens.css') + '\n' + read('src/app.css').replace(/url\('\.\.\/(assets\/fonts\/[^']+)'\)/g, (_, p) => `url('${dataURL(p)}')`);
sizes.push(['styles + fonts', css]);

// 3. Data: calendar, base layers, one topology per snapshot year. Text that could end a <script> block is escaped
//    in a way JSON still accepts.
const calendar = JSON.parse(read('data/calendar.json'));
const dataFiles = ['data/calendar.json', 'data/base/derived/ne.topojson', 'data/base/derived/bathymetry.topojson',
  ...calendar.snapshots.map((s) => `data/base/derived/world_${s.year}.topojson`)];
const jsonBlock = (p) => {
  const text = read(p).replace(/<\//g, '<\/').replace(/<!--/g, '\u003c!--');
  sizes.push([p, text]);
  return `<script type="application/json" data-path="${p}">${text}</script>`;
};
const dataBlocks = dataFiles.map(jsonBlock).join('\n');

// 4. Relief images for every stage.
const assets = {};
for (const f of readdirSync(join(ROOT, 'src', 'stages')).filter((f) => f.endsWith('.json'))) {
  const stage = JSON.parse(read(`src/stages/${f}`));
  if (stage.relief) assets[`assets/${stage.relief}`] = dataURL(`assets/${stage.relief}`);
}
const assetsBlock = `<script>window.__PARCHMENT_ASSETS__=${JSON.stringify(assets).replace(/<\//g, '<\/')};</script>`;
sizes.push(['relief images', assetsBlock]);

// 5. The page.
let html = read('index.html');
html = html.replace(/\s*<link rel="stylesheet" href="src\/tokens\.css">\s*<link rel="stylesheet" href="src\/app\.css">/, `\n  <style>\n${css}\n  </style>`);
html = html.replace('<script src="app.js"></script>', () => `${assetsBlock}\n${dataBlocks}\n<script>${js}</script>`);
if (html.includes('src="app.js"') || html.includes('href="src/')) throw new Error('index.html still points at an external file');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
for (const [name, text] of sizes) console.log(`  ${kb(text).padStart(9)}  ${name}`);
console.log(`wrote ${OUT} (${(Buffer.byteLength(html) / 1048576).toFixed(1)} MB)`);

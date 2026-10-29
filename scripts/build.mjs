#!/usr/bin/env node
// Parchment — build.mjs
// Bundles src/main.js into app.js and src/admin.js into admin.js (no runtime CDN) for GitHub Pages and local use.
//   node scripts/build.mjs           production bundles → app.js, admin.js
//   node scripts/build.mjs --serve   rebuild on change and serve the folder at http://localhost:8321/

import * as esbuild from 'esbuild';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const serve = process.argv.includes('--serve');
const port = Number(process.env.PORT ?? 8321);

const options = {
  absWorkingDir: ROOT,
  entryPoints: [{ in: join(ROOT, 'src', 'main.js'), out: 'app' }, { in: join(ROOT, 'src', 'admin.js'), out: 'admin' }],
  outdir: ROOT,
  bundle: true,
  format: 'iife',
  target: ['chrome100', 'edge100'],
  sourcemap: serve ? 'inline' : false,
  minify: !serve,
  legalComments: 'none',
  logLevel: 'info',
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { hosts, port: p } = await ctx.serve({ servedir: ROOT, port, host: '127.0.0.1' });
  console.log(`parchment dev server: http://${hosts?.[0] ?? '127.0.0.1'}:${p}/`);
} else {
  await esbuild.build(options);
}

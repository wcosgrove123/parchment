#!/usr/bin/env node
// Parchment — map.mjs: a lesson map from an order form.
//   npm run map -- path/to/spec.json [--svg] [--out out/name] [--size 1920x1080] [--scale 1.25]
//
// An order is a small JSON file (docs/LESSON-MAPS.md; examples in tests/maps/):
//   { "page": "us", "date": "1836-06-01", "tracker": "nations", "frame": "texas",
//     "highlight": ["texas-republic", "joint-mexico-texas-claim"],
//     "annotate": { "rivers": ["Nueces", "Rio Grande"], "places": ["Q…"], "routes": ["record-id"] },
//     "title": "The Texas Revolution, 1836", "size": "1600x1550", "out": "out/texas-1836" }
// Every field is also a parameter of us.html, so the same map opens live (the command prints its address).
// Writes <out>.png, <out>.json (the packing slip: what is on the map, with dates and sources) and, with --svg or
// "svg": true, <out>.svg. Runs from a fresh clone on Linux or Windows: the page is served from this folder on
// 127.0.0.1, the browser is found by scripts/browser.mjs, and every request off this machine is refused.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, findBrowser, NO_BROWSER } from './browser.mjs';
import { serve, bundle } from './serve.mjs';
import { orderToQuery, parseSize, sheetFor } from '../src/us/frames.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIELDS = new Set(['page', 'date', 'year', 'from', 'tracker', 'layer', 'war', 'names', 'show', 'sequence', 'strip', 'frame', 'highlight', 'annotate', 'title', 'size', 'scale', 'projection', 'records', 'out', 'svg', '_comment', 'notes']);

// Renders one order. → { png, json, svg, slip, address }. Used by this command and by the MCP server (mcp/server.mjs).
export async function renderOrder(order, { out = null, svg = false, base = process.cwd(), log = () => {}, browser = null } = {}) {
  const warnings = [];
  for (const k of Object.keys(order)) if (!FIELDS.has(k)) warnings.push(`the order's field "${k}" is not one Parchment reads`);
  for (const k of Object.keys(order.annotate ?? {})) if (!['rivers', 'places', 'routes'].includes(k)) warnings.push(`annotate.${k} is not one Parchment reads (rivers, places, routes)`);
  if ((order.page ?? 'us') !== 'us') throw new Error(`page "${order.page}": lesson maps are made on the North America page ("us") for now`);
  const size = order.size ? parseSize(order.size) : { width: 1920, height: 1080 };
  if (!size) throw new Error(`size "${order.size}" must be WIDTHxHEIGHT, 800 to 3840 pixels wide`);
  const sheet = sheetFor(size, order.scale);
  // Places and routes come from a records file in this folder, never from the Sheet: a render makes no network call.
  const a = order.annotate ?? {};
  const o = { ...order, records: order.records ?? ((a.places?.length || a.routes?.length) ? 'data/records.csv' : undefined) };
  const query = orderToQuery(o);
  const address = `us.html?${query}`;
  query.set('shot', '1');

  const target = resolve(base, out ?? order.out ?? join('out', `parchment-${order.frame ?? 'north-america'}-${order.date ?? order.year ?? 'map'}`));
  mkdirSync(dirname(target), { recursive: true });

  const js = await bundle(ROOT).catch((err) => { warnings.push(`the page was not rebuilt from src/ (${err.message}); the committed us.js was used`); return null; });
  const server = await serve(ROOT, { files: js ? { '/us.js': js } : {} });
  const found = browser ?? findBrowser();
  if (!found) { await server.close(); throw new Error(NO_BROWSER); }
  log(`browser: ${found.path ?? found} (${found.from ?? 'given'})`);
  const b = await launch({ browser: found });
  try {
    const page = await b.newPage({ width: sheet.w, height: sheet.h, scale: sheet.scale, origin: server.origin });
    await page.goto(`${server.origin}/${address.replace(/^us\.html\?.*$/, `us.html?${query}`)}`);
    try {
      await page.eval(`new Promise((resolve, reject) => {
        const t0 = Date.now();
        (function wait() {
          const p = document.querySelector('#problems');
          if (window.parchment && window.parchment.ready) window.parchment.ready.then(() => resolve(true), (e) => reject(String(e && e.message || e)));
          else if (p && !p.classList.contains('hidden') && /could not start/.test(p.textContent)) reject(p.textContent);
          else if (Date.now() - t0 > 90000) reject('the page did not finish drawing in 90 s');
          else setTimeout(wait, 50);
        })();
      })`);
    } catch (err) {
      throw new Error(`${err.message}${page.errors.length ? `\n  page errors: ${page.errors.slice(0, 3).join(' | ')}` : ''}${page.console.length ? `\n  console: ${page.console.slice(-5).join(' | ')}` : ''}`);
    }
    const slip = await page.eval('window.parchment.packingSlip()');
    const png = await page.screenshot();
    const svgText = svg || order.svg ? await page.eval('window.parchment.renderSVG().then((b) => b.text())') : null;
    const blocked = [...new Set(page.blocked)];
    slip.render = {
      by: 'scripts/map.mjs', browser: (found.path ?? String(found)).split(/[\\/]/).slice(-3).join('/'),
      pixels: { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }, blocked_requests: blocked,
      page_errors: page.errors, live_address: address,
    };
    slip.warnings = [...warnings, ...slip.warnings, ...blocked.map((u) => `a request off this machine was refused: ${u}`), ...page.errors.map((e) => `page error: ${e.split('\n')[0]}`)];
    writeFileSync(`${target}.png`, png);
    writeFileSync(`${target}.json`, `${JSON.stringify(slip, null, 2)}\n`);
    if (svgText) writeFileSync(`${target}.svg`, svgText);
    await page.close();
    return { png: `${target}.png`, json: `${target}.json`, svg: svgText ? `${target}.svg` : null, slip, address };
  } finally {
    await b.close();
    await server.close();
  }
}

// ---------------------------------------------------------------- the command
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (name) => { const i = args.indexOf(`--${name}`); return i > -1 ? args.splice(i, 2)[1] : null; };
  const wantSvg = args.includes('--svg'); if (wantSvg) args.splice(args.indexOf('--svg'), 1);
  const outArg = flag('out'), sizeArg = flag('size'), scaleArg = flag('scale');
  const file = args[0];
  if (!file) { console.error('usage: npm run map -- path/to/spec.json [--svg] [--out out/name] [--size 1920x1080] [--scale 1.25]'); process.exit(2); }
  let order;
  try { order = JSON.parse(readFileSync(resolve(file), 'utf8')); } catch (err) { console.error(`could not read the order ${file}: ${err.message}`); process.exit(2); }
  if (sizeArg) order.size = sizeArg;
  if (scaleArg) order.scale = Number(scaleArg);
  const t0 = Date.now();
  try {
    const r = await renderOrder(order, { out: outArg, svg: wantSvg, log: (m) => console.log(m) });
    const rel = (p) => relative(process.cwd(), p) || p;
    console.log(`wrote ${rel(r.png)} (${r.slip.render.pixels.width}×${r.slip.render.pixels.height}), ${rel(r.json)}${r.svg ? `, ${rel(r.svg)}` : ''} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    console.log(`live: ${r.address}`);
    console.log(`credit: ${r.slip.credit}`);
    if (r.slip.warnings.length) console.log(`warnings:\n  - ${r.slip.warnings.join('\n  - ')}`);
  } catch (err) {
    console.error(`could not render ${file}: ${err.message}`);
    process.exit(1);
  }
}

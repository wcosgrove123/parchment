#!/usr/bin/env node
// Parchment — derive-rivers.mjs
// Natural Earth's 1:10m rivers for North America, for framed lesson maps on the North America page
// (us.html?frame=texas): the global 1:10m rivers and lake centerlines (scalerank 0–10) and the North American
// supplement (scalerank 10–12, where the Nueces, the Trinity and the Guadalupe are), cut to the continent and
// simplified. Names are kept as Natural Earth gives them (name, name_en, name_alt) so an order can ask for a river by
// name. Simplifies only; never moves a vertex by hand.
//
// Usage: node scripts/derive-rivers.mjs
//   reads data/base/raw/natural-earth/ne_10m_rivers_lake_centerlines.geojson and ne_10m_rivers_north_america.geojson
//   (downloaded by scripts/fetch-base.mjs), writes data/base/derived/rivers-na.topojson

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { quantize } from 'topojson-client';
import { geoBounds } from 'd3';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'natural-earth');
const BOX = { west: -170, south: 5, east: -50, north: 75 }; // the continent, Alaska to Panama, the Antilles
const SETTINGS = { minWeight: 2e-6, quantization: 2e5 };

const features = [];
for (const [file, set] of [['ne_10m_rivers_lake_centerlines', '10m'], ['ne_10m_rivers_north_america', '10m-north-america']]) {
  const g = JSON.parse(await readFile(join(RAW, `${file}.geojson`), 'utf8'));
  let kept = 0;
  for (const f of g.features) {
    if (!f.geometry) continue;
    const [[w, s], [e, n]] = geoBounds(f);
    if (![w, s, e, n].every(Number.isFinite) || e < w) continue; // (a piece with no extent, or one d3 reads as wrapping the globe)
    if (e < BOX.west || w > BOX.east || n < BOX.south || s > BOX.north) continue;
    const p = f.properties ?? {};
    const props = { name: p.name ?? null, scalerank: p.scalerank ?? 12, featurecla: p.featurecla ?? null, set };
    if (p.name_en && p.name_en !== p.name) props.name_en = p.name_en;
    if (p.name_alt) props.name_alt = p.name_alt;
    if (p.wikidataid) props.wd = p.wikidataid;
    features.push({ type: 'Feature', properties: props, geometry: f.geometry });
    kept++;
  }
  console.log(`  ${file}: ${kept} of ${g.features.length} pieces in North America`);
}
let topo = topology({ rivers: { type: 'FeatureCollection', features } }, SETTINGS.quantization);
topo = presimplify(topo);
topo = simplify(topo, SETTINGS.minWeight);
topo = quantize(topo, SETTINGS.quantization);
for (const arc of topo.arcs) for (const pt of arc) pt.length = 2;
topo._source = 'Natural Earth 1:10m rivers and lake centerlines, and its North American supplement (public domain), cut to North America and simplified by scripts/derive-rivers.mjs.';
const text = JSON.stringify(topo);
await writeFile(join(ROOT, 'data', 'base', 'derived', 'rivers-na.topojson'), text);
// The index of derived layers (scripts/derive.mjs writes the rest; this entry is replaced on each run of this script).
const indexPath = join(ROOT, 'data', 'base', 'derived', 'index.json');
const index = JSON.parse(await readFile(indexPath, 'utf8'));
index.layers = index.layers ?? {};
index.layers['rivers-na'] = { file: 'rivers-na.topojson', bytes: text.length, features: features.length, settings: SETTINGS, written_by: 'scripts/derive-rivers.mjs' };
await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`rivers-na.topojson: ${features.length} pieces, ${(text.length / 1024).toFixed(0)} KB`);

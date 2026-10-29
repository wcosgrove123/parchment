#!/usr/bin/env node
// Parchment — derive.mjs
// Turns raw downloads (data/base/raw/) into small, fast TopoJSON for the browser (data/base/derived/).
// Simplifies only; never moves a vertex by hand. Also generates base-unit ids into data/vocab.json.
//
//   data/base/derived/world_<calendarYear>.topojson   polities for each calendar snapshot
//   data/base/derived/ne.topojson                      land, coastline, lakes, rivers (1:50m)
//   data/base/derived/bathymetry.topojson              depth contours (from 1:10m, simplified hard)
//   data/base/derived/index.json                       what was written, sizes, settings
//
// Usage: node scripts/derive.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { presimplify, simplify, quantile } from 'topojson-simplify';
import { quantize } from 'topojson-client';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw');
const OUT = join(ROOT, 'data', 'base', 'derived');
await mkdir(OUT, { recursive: true });

// Simplification tolerance, in squared degrees (triangle area). 0.01° tolerance at world scale ≈ 1e-4 deg².
// Bathymetry is decorative and dense, so it gets a much coarser tolerance.
const SETTINGS = { polities: { minWeight: 1e-4, quantization: 1e5 }, ne: { minWeight: 1e-4, quantization: 1e5 }, bathymetry: { minWeight: 2e-2, quantization: 1e4 } };
const CERTAINTY_LEGAL_FROM = 1648; // Westphalia: before this, base borders default to "approximate"

const kebab = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function readGeo(p) { return JSON.parse(await readFile(p, 'utf8')); }

function buildTopo(objects, { minWeight, quantization }) {
  let topo = topology(objects, quantization);
  topo = presimplify(topo);
  topo = simplify(topo, minWeight);
  topo = quantize(topo, quantization);
  // Strip presimplify's weights to save bytes.
  for (const arc of topo.arcs) for (const pt of arc) pt.length = 2;
  return topo;
}

const index = { generated: new Date().toISOString(), settings: SETTINGS, certainty_legal_from: CERTAINTY_LEGAL_FROM, snapshots: [], layers: {} };

// ---------------------------------------------------------------- polities per calendar snapshot
const calendar = JSON.parse(await readFile(join(ROOT, 'data', 'calendar.json'), 'utf8'));
const vocabPath = join(ROOT, 'data', 'vocab.json');
const vocab = JSON.parse(await readFile(vocabPath, 'utf8'));
const baseUnits = new Map(); // id -> { name, years: [] }

for (const snap of calendar.snapshots) {
  if (!snap.source_file) { console.warn(`  skip ${snap.year}: no source_file in calendar.json (run fetch-base first)`); continue; }
  const geo = await readGeo(join(RAW, 'historical-basemaps', snap.source_file));
  const seen = new Map();
  const features = [];
  for (const f of geo.features) {
    if (!f.geometry) continue;
    const p = f.properties ?? {};
    const name = (p.NAME ?? '').trim();
    let id = null;
    if (name) {
      const base = `${kebab(name)}@${snap.year}`;
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      id = n === 1 ? base : `${base}~${n}`; // same NAME twice in one year (rare): keep both, disambiguate
      const u = baseUnits.get(base) ?? { name, years: [] };
      if (!u.years.includes(snap.year)) u.years.push(snap.year);
      baseUnits.set(base, u);
    }
    features.push({
      type: 'Feature',
      id: id ?? undefined,
      properties: {
        id,
        name: name || null,
        abbr: (p.ABBREVN ?? '').trim() || null,
        partof: (p.PARTOF ?? '').trim() || null,
        subjecto: (p.SUBJECTO ?? '').trim() || null,
        certainty: snap.year < CERTAINTY_LEGAL_FROM ? 'approximate' : 'legal',
      },
      geometry: f.geometry,
    });
  }
  const topo = buildTopo({ polities: { type: 'FeatureCollection', features } }, SETTINGS.polities);
  topo.meta = { calendar_year: snap.year, source_year: snap.source_year, gap: snap.gap, source_file: snap.source_file };
  const out = join(OUT, `world_${snap.year}.topojson`);
  const text = JSON.stringify(topo);
  await writeFile(out, text);
  const named = features.filter((f) => f.properties.id).length;
  index.snapshots.push({ year: snap.year, source_year: snap.source_year, file: `world_${snap.year}.topojson`, bytes: text.length, features: features.length, named });
  console.log(`  ${snap.year} ← ${snap.source_file}: ${features.length} features (${named} named), ${kb(text.length)}`);
}

// base-unit ids into vocab.json (the dropdown source for records.csv `where`)
vocab.base_units = [...baseUnits.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([id, u]) => ({ id, name: u.name, years: u.years.sort((a, b) => a - b) }));
await writeFile(vocabPath, JSON.stringify(vocab, null, 2) + '\n');
console.log(`  vocab.json: ${vocab.base_units.length} base units`);

// ---------------------------------------------------------------- Natural Earth vectors
const ne = {};
for (const [key, file] of [['land', 'ne_50m_land'], ['coastline', 'ne_50m_coastline'], ['lakes', 'ne_50m_lakes'], ['rivers', 'ne_50m_rivers_lake_centerlines']]) {
  const geo = await readGeo(join(RAW, 'natural-earth', `${file}.geojson`));
  // keep only the properties we draw with
  for (const f of geo.features) {
    const p = f.properties ?? {};
    f.properties = { name: p.name ?? null, scalerank: p.scalerank ?? null, featurecla: p.featurecla ?? null };
  }
  ne[key] = geo;
}
{
  const topo = buildTopo(ne, SETTINGS.ne);
  const text = JSON.stringify(topo);
  await writeFile(join(OUT, 'ne.topojson'), text);
  index.layers.ne = { file: 'ne.topojson', bytes: text.length, objects: Object.keys(ne) };
  console.log(`  ne.topojson: ${Object.keys(ne).join(', ')} — ${kb(text.length)}`);
}

// ---------------------------------------------------------------- bathymetry contours
{
  const levels = [['K_200', 200], ['J_1000', 1000], ['I_2000', 2000], ['H_3000', 3000], ['G_4000', 4000], ['F_5000', 5000], ['E_6000', 6000]];
  const features = [];
  for (const [suffix, depth] of levels) {
    const geo = await readGeo(join(RAW, 'natural-earth', `ne_10m_bathymetry_${suffix}.geojson`));
    for (const f of geo.features) features.push({ type: 'Feature', properties: { depth }, geometry: f.geometry });
  }
  const topo = buildTopo({ bathymetry: { type: 'FeatureCollection', features } }, SETTINGS.bathymetry);
  const text = JSON.stringify(topo);
  await writeFile(join(OUT, 'bathymetry.topojson'), text);
  index.layers.bathymetry = { file: 'bathymetry.topojson', bytes: text.length, depths: levels.map((l) => l[1]) };
  console.log(`  bathymetry.topojson: ${features.length} rings — ${kb(text.length)}`);
}

await writeFile(join(OUT, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log('  wrote data/base/derived/index.json');

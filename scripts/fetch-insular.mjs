#!/usr/bin/env node
// Parchment — fetch-insular.mjs: the downloads behind the island-territory layer of the world page (statehood brief
// of 2026-11-18, item 7). Never edits geometry.
//   1. The Census Bureau's cartographic boundary file of the states (2025, 1:500,000), which holds the five inhabited
//      territories (Puerto Rico, the Virgin Islands, Guam, the Northern Mariana Islands, American Samoa).
//   2. Natural Earth 10m countries, states and provinces, and minor islands (public domain), from Natural Earth's own
//      repository on GitHub (naturalearthdata.com refuses this laptop): the minor outlying islands, the Philippines,
//      the trust territory's successors, Panama, Okinawa and Tokyo prefectures, and the countries whose islands the
//      United States once claimed.
//   3. The coordinates of every island data/world/insular-areas.csv names by Wikidata id (P625, CC0), into the shared
//      gazetteer, data/gazetteer.json, as scripts/geocode.mjs keeps it: which part of a downloaded shape is which island
//      is decided by these points, never by a typed coordinate.
// Records URL, retrieval date, byte size and sha256 of every file in data/base/MANIFEST-insular.json.
//   node scripts/fetch-insular.mjs [--force]      (raw files go to data/base/raw/insular/, not committed)

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'insular');
const FORCE = process.argv.includes('--force');
const UA = 'parchment-atlas/0.1 (classroom atlas; fetch-insular script)';
const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson';
const NE_META = { source: 'natural-earth', license: 'public domain', attribution: 'Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com (from its repository, github.com/nvkelso/natural-earth-vector)' };
const CENSUS_META = { source: 'census-cartographic-boundary', license: 'public domain (U.S. government work)', attribution: 'U.S. Census Bureau, cartographic boundary file, States, 2025 (1:500,000)' };

const manifest = { generated: new Date().toISOString(), stage: 'world (island territories)', note: 'Written by scripts/fetch-insular.mjs. Raw downloads live in data/base/raw/insular/ (not committed). scripts/derive-insular.mjs writes data/world/insular.topojson.', entries: [] };
const failures = [];
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const rel = (p) => relative(ROOT, p).split('\\').join('/');
async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function download(url, dest, meta = {}) {
  if (!FORCE && (await exists(dest))) {
    const buf = await readFile(dest);
    const s = await stat(dest);
    manifest.entries.push({ ...meta, url, file: rel(dest), bytes: buf.length, sha256: sha256(buf), retrieved: s.mtime.toISOString(), cached: true });
    console.log(`  cached   ${rel(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
    return buf;
  }
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  manifest.entries.push({ ...meta, url, file: rel(dest), bytes: buf.length, sha256: sha256(buf), retrieved: new Date().toISOString(), cached: false });
  console.log(`  fetched  ${rel(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
  return buf;
}
async function attempt(label, fn) {
  try { return await fn(); } catch (e) { failures.push(`${label}: ${e.message}`); console.error(`  FAILED   ${label}: ${e.message}`); return null; }
}

console.log('Census Bureau');
await attempt('census states', () => download('https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_state_500k.zip', join(RAW, 'cb_2025_us_state_500k.zip'), { ...CENSUS_META, layer: 'states, territories and the District' }));
console.log('Natural Earth');
for (const [name, layer] of [['ne_10m_admin_0_countries', 'admin 0 countries, 1:10m'], ['ne_10m_admin_1_states_provinces', 'admin 1 states and provinces, 1:10m'], ['ne_10m_minor_islands', 'minor islands, 1:10m']]) {
  await attempt(name, () => download(`${NE}/${name}.geojson`, join(RAW, `${name}.geojson`), { ...NE_META, layer }));
}

// ---------------------------------------------------------------- the islands' coordinates, from Wikidata
const TABLE = join(ROOT, 'data', 'world', 'insular-areas.csv');
const GAZ = join(ROOT, 'data', 'gazetteer.json');
if (existsSync(TABLE)) {
  const rows = parseCSV(readFileSync(TABLE, 'utf8'));
  const col = Object.fromEntries(rows[0].map((h, i) => [h.trim(), i]));
  const ids = new Set();
  for (const r of rows.slice(1)) for (const k of ['islands', 'drop_islands', 'cut_at']) for (const q of String(r[col[k]] ?? '').split('|').map((x) => x.trim()).filter((x) => /^Q\d+$/.test(x))) ids.add(q);
  const gaz = existsSync(GAZ) ? JSON.parse(readFileSync(GAZ, 'utf8')) : {};
  const todo = [...ids].filter((q) => FORCE || !gaz[q]);
  console.log(`Wikidata: ${ids.size} islands named, ${todo.length} to look up`);
  for (const q of todo) {
    await attempt(`wikidata ${q}`, async () => {
      const url = `https://www.wikidata.org/wiki/Special:EntityData/${q}.json`;
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ent = (await res.json()).entities[q];
      const c = ent?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (!c) throw new Error('no coordinates (P625)');
      gaz[q] = { lon: c.longitude, lat: c.latitude, label: ent.labels?.en?.value ?? q, fetched: new Date().toISOString().slice(0, 10) };
      writeFileSync(GAZ, `${JSON.stringify(gaz, null, 2)}\n`);
      console.log(`  ${q} ${gaz[q].label}: ${c.longitude.toFixed(4)}, ${c.latitude.toFixed(4)}`);
      manifest.entries.push({ source: 'wikidata', license: 'CC0', url, layer: 'coordinate (P625)', id: q, retrieved: new Date().toISOString() });
      await new Promise((r) => setTimeout(r, 600));
    });
  }
}

manifest.failures = failures;
writeFileSync(join(ROOT, 'data', 'base', 'MANIFEST-insular.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`manifest: data/base/MANIFEST-insular.json (${manifest.entries.length} entries${failures.length ? `, ${failures.length} failures` : ''})`);
if (failures.length) process.exit(1);

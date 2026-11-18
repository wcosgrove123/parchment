#!/usr/bin/env node
// Parchment — fetch-wouldbe.mjs: the downloads behind the would-be states of the North America page (statehood
// brief of 2026-11-18, item 8). Never edits geometry.
//   1. The Newberry Library's Atlas of Historical County Boundaries, county files of the states whose counties a
//      would-be state was made of (each county dated to the day it was formed and changed): North Carolina and
//      Tennessee (Franklin), California (Pico's Territory of Colorado; Jefferson, 1941) and Oregon (Jefferson, 1941).
//      (Absaroka, 1939, is not built: no source found lists its counties.)
//   2. The Census Bureau's cartographic boundary file of today's counties (2025, 1:500,000), for a movement of this
//      decade (Greater Idaho) that the Newberry's files, which end in 2000, cannot date.
//   3. The coordinates of the points a would-be state's document draws a line through (Jefferson's 1784 meridians
//      through the falls of the Ohio and the mouth of the Great Kanawha), from Wikidata (P625), into the gazetteer.
// Records URL, retrieval date, byte size and sha256 of every file in data/base/MANIFEST-wouldbe.json.
//   node scripts/fetch-wouldbe.mjs [--force]      (raw files go to data/base/raw/wouldbe/, not committed)

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'wouldbe');
const FORCE = process.argv.includes('--force');
const UA = 'parchment-atlas/0.1 (classroom atlas; fetch-wouldbe script)';
const NB_META = {
  source: 'newberry-ahcb-counties',
  license: 'Newberry Library terms: any lawful purpose, commercial or non-commercial, no fees (https://www.newberry.org/rights-and-reproductions); files also carry the original CC BY-NC-SA 2.5 deed, which the Library says may be ignored',
  attribution: 'Atlas of Historical County Boundaries, ed. John H. Long. Chicago: The Newberry Library. https://publications.newberry.org/ahcb/',
};
const CENSUS_META = { source: 'census-cartographic-boundary', license: 'public domain (U.S. government work)', attribution: 'U.S. Census Bureau, cartographic boundary file, Counties, 2025 (1:500,000)' };
// The Newberry's state files: its two-letter code, as in https://publications.newberry.org/ahcb/downloads/gis/NC_AtlasHCB.zip
export const NB_STATES = ['NC', 'TN', 'CA', 'OR'];

const manifest = { generated: new Date().toISOString(), stage: 'north america (would-be states)', note: 'Written by scripts/fetch-wouldbe.mjs. Raw downloads live in data/base/raw/wouldbe/ (not committed). scripts/derive-wouldbe.mjs writes data/us/wouldbe.topojson.', entries: [] };
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

console.log('Newberry Library, Atlas of Historical County Boundaries');
for (const st of NB_STATES) {
  await attempt(`newberry ${st}`, () => download(`https://publications.newberry.org/ahcb/downloads/gis/${st}_AtlasHCB.zip`, join(RAW, `${st}_AtlasHCB.zip`), { ...NB_META, layer: `${st} historical counties` }));
}
console.log('Census Bureau');
await attempt('census counties', () => download('https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_county_500k.zip', join(RAW, 'cb_2025_us_county_500k.zip'), { ...CENSUS_META, layer: 'counties' }));

// ---------------------------------------------------------------- points the documents name, from Wikidata
const TABLE = join(ROOT, 'data', 'us', 'wouldbe-states.csv');
const GAZ = join(ROOT, 'data', 'gazetteer.json');
if (existsSync(TABLE)) {
  const rows = parseCSV(readFileSync(TABLE, 'utf8'));
  const col = Object.fromEntries(rows[0].map((h, i) => [h.trim(), i]));
  const ids = new Set();
  for (const r of rows.slice(1)) for (const q of String(r[col.cut] ?? '').match(/Q\d+/g) ?? []) ids.add(q);
  const gaz = existsSync(GAZ) ? JSON.parse(readFileSync(GAZ, 'utf8')) : {};
  const todo = [...ids].filter((q) => FORCE || !gaz[q]);
  console.log(`Wikidata: ${ids.size} points named, ${todo.length} to look up`);
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
writeFileSync(join(ROOT, 'data', 'base', 'MANIFEST-wouldbe.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`manifest: data/base/MANIFEST-wouldbe.json (${manifest.entries.length} entries${failures.length ? `, ${failures.length} failures` : ''})`);
if (failures.length) process.exit(1);

#!/usr/bin/env node
// Parchment — fetch-us.mjs
// Downloads the boundary sources for the North America stage (1492–2026). Never edits geometry.
// Records URL, query, retrieval date, byte size and sha256 of every file in data/base/MANIFEST-north-america.json.
// Fails loudly (exit 1) if a source is unreachable, after writing what it did get.
//
//   1. Newberry Library, Atlas of Historical County Boundaries: U.S. Historical States and Territories,
//      1783-09-03 → 2000-12-31, one polygon per entity per version, dated to the day, with the statute cited.
//   2. OpenHistoricalMap: dated administrative boundaries (empires' colonies and provinces, neighbouring
//      countries, some Native nations), admin levels 2–4, whose box is centred on North America.
//   3. U.S. Forest Service: "Indian Land Cessions in the United States" (Royce, 1899), the 67 Royce maps
//      georeferenced and digitised, one polygon per cession with the treaty date and links to Royce and Kappler.
//   4. historical-basemaps 1492–1715 snapshots, for the Native homelands they draw (approximate).
//
// Usage: node scripts/fetch-us.mjs [--force]   (--force re-downloads cached files)

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { writeNativeLicenses } from './licenses-native.mjs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw');
const FORCE = process.argv.includes('--force');
const UA = 'parchment-fetch-us (classroom atlas)';
const failures = [];
const manifest = {
  generated: new Date().toISOString(),
  stage: 'north-america',
  note: 'Written by scripts/fetch-us.mjs. Raw downloads live in data/base/raw/ (not committed). scripts/derive-us.mjs writes the browser files to data/us/.',
  entries: [],
};

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const rel = (p) => relative(ROOT, p).split('\\').join('/');
async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function download(url, dest, meta = {}, init = {}) {
  if (!FORCE && (await exists(dest))) {
    const buf = await readFile(dest);
    const s = await stat(dest);
    manifest.entries.push({ ...meta, url, file: rel(dest), bytes: buf.length, sha256: sha256(buf), retrieved: s.mtime.toISOString(), cached: true });
    console.log(`  cached   ${rel(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
    return buf;
  }
  const res = await fetch(url, { redirect: 'follow', ...init, headers: { 'user-agent': UA, ...(init.headers ?? {}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  manifest.entries.push({ ...meta, url, file: rel(dest), bytes: buf.length, sha256: sha256(buf), retrieved: new Date().toISOString(), cached: false });
  console.log(`  fetched  ${rel(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
  return buf;
}

async function attempt(label, fn) {
  try { return await fn(); }
  catch (e) { failures.push(`${label}: ${e.message}`); console.error(`  FAILED   ${label}: ${e.message}`); return null; }
}

// ---------------------------------------------------------------- 1. Newberry AHCB states and territories
const NB_META = {
  source: 'newberry-ahcb',
  license: 'Newberry Library terms: any lawful purpose, commercial or non-commercial, no fees (https://www.newberry.org/rights-and-reproductions); files also carry the original CC BY-NC-SA 2.5 deed, which the Library says may be ignored',
  attribution: 'Atlas of Historical County Boundaries, ed. John H. Long; U.S. Historical States and Territories compiled by Peter Siczewicz and Emily Kelley. Chicago: The Newberry Library, 2011. https://digital.newberry.org/ahcb/',
};
console.log('Newberry Atlas of Historical County Boundaries');
const NB_ZIP = 'US_AtlasHCB_StateTerr_Gen001.zip';
await attempt('Newberry states and territories', async () => {
  const dir = join(RAW, 'newberry');
  const buf = await download(`https://digital.newberry.org/ahcb/downloads/gis/${NB_ZIP}`, join(dir, NB_ZIP), { ...NB_META, layer: 'U.S. Historical States and Territories, generalized 0.001°' });
  const files = unzipSync(new Uint8Array(buf));
  let n = 0;
  for (const [name, data] of Object.entries(files)) {
    if (!/\.(shp|shx|dbf|prj)$/i.test(name) && !/READ_ME|Metadata/i.test(name)) continue;
    if (!data.length) continue;
    const out = join(dir, 'StateTerr', name.split('/').pop());
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, data);
    n++;
  }
  console.log(`  unzipped ${n} files to ${rel(join(dir, 'StateTerr'))}`);
});

// ---------------------------------------------------------------- 2. OpenHistoricalMap
// Two requests: every admin boundary (levels 1–4) touching the box, with its bounds; then the geometry of
// those whose box is centred in North America and narrower than 100° (not the global empires).
const OHM_META = { source: 'openhistoricalmap', license: 'CC0 1.0', attribution: 'OpenHistoricalMap contributors, https://www.openhistoricalmap.org (CC0)' };
const OVERPASS = 'https://overpass-api.openhistoricalmap.org/api/interpreter';
const BOX = { south: 14, west: -170, north: 72, east: -52 };
console.log('OpenHistoricalMap (Overpass)');
await attempt('OpenHistoricalMap boundaries', async () => {
  const dir = join(RAW, 'ohm');
  const q1 = `[out:json][timeout:300];(rel["boundary"="administrative"]["admin_level"~"^[1-4]$"](${BOX.south},${BOX.west},${BOX.north},${BOX.east});rel["boundary"="aboriginal_lands"](${BOX.south},${BOX.west},${BOX.north},${BOX.east}););out tags bb;`;
  const listBuf = await download(OVERPASS, join(dir, 'ohm-relations.json'), { ...OHM_META, layer: 'relation list with bounds', query: q1 },
    { method: 'POST', body: new URLSearchParams({ data: q1 }) });
  const list = JSON.parse(listBuf.toString('utf8'));
  const keep = [];
  for (const e of list.elements) {
    const b = e.bounds; if (!b) continue;
    if (e.tags.admin_level === '1') continue; // empires: drawn by their colonies and provinces instead
    const cx = (b.minlon + b.maxlon) / 2, cy = (b.minlat + b.maxlat) / 2;
    if (b.maxlon - b.minlon > 100) continue;
    if (cx < BOX.west || cx > BOX.east || cy < BOX.south || cy > BOX.north) continue;
    keep.push(e.id);
  }
  keep.sort((a, b) => a - b);
  console.log(`  ${list.elements.length} relations touch the box; ${keep.length} are centred in it`);
  const q2 = `[out:json][timeout:600][maxsize:1073741824];rel(id:${keep.join(',')});out body;>;out skel qt;`;
  await download(OVERPASS, join(dir, 'ohm-geometry.json'), { ...OHM_META, layer: 'relations, member ways and nodes', query: 'rel(id:<the ids above>);out body;>;out skel qt;', relations: keep.length, osm_base: list.osm3s?.timestamp_osm_base },
    { method: 'POST', body: new URLSearchParams({ data: q2 }) });
});

// ---------------------------------------------------------------- 3. Royce land cessions (USFS)
const FS_META = {
  source: 'usfs-royce',
  license: 'U.S. Government work; catalog.data.gov lists Creative Commons Attribution 4.0',
  attribution: 'U.S. Forest Service, Office of Tribal Relations: Indian Land Cessions in the United States, digitised from Charles C. Royce, comp., "Indian Land Cessions in the United States," 18th Annual Report of the Bureau of American Ethnology, part 2 (1899). https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_TribalCessionLands_01/MapServer/0',
};
console.log('U.S. Forest Service — Royce land cessions');
await attempt('Royce land cessions', async () => {
  const base = 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_TribalCessionLands_01/MapServer/0/query';
  const dest = join(RAW, 'usfs', 'royce-cessions.geojson');
  if (!FORCE && (await exists(dest))) { await download(base, dest, FS_META); return; }
  const features = [];
  for (let offset = 0; ; offset += 200) {
    const url = `${base}?where=1%3D1&outFields=*&outSR=4326&f=geojson&resultOffset=${offset}&resultRecordCount=200`;
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const page = await res.json();
    if (page.error) throw new Error(JSON.stringify(page.error));
    features.push(...page.features);
    process.stdout.write(`  page at ${offset}: ${page.features.length}\n`);
    if (page.features.length < 200) break;
  }
  const buf = Buffer.from(JSON.stringify({ type: 'FeatureCollection', features }));
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  manifest.entries.push({ ...FS_META, url: `${base}?where=1=1&outFields=*&outSR=4326&f=geojson (paged by 200)`, file: rel(dest), bytes: buf.length, sha256: sha256(buf), features: features.length, retrieved: new Date().toISOString(), cached: false });
  console.log(`  fetched  ${rel(dest)} (${features.length} cessions, ${(buf.length / 1024).toFixed(0)} KB)`);
});

// ---------------------------------------------------------------- 4. historical-basemaps: Native homelands
// The colonial era's Native nations, as historical-basemaps draws them in its 1492–1715 snapshots (the 1492 map's
// North American names follow Native Land Digital). Approximate by nature: drawn as soft-edged stipple, never a line.
const HB_META = { source: 'historical-basemaps', license: 'GPL-3.0', attribution: 'Historical Basemaps, Andrej Ourednik and contributors, https://github.com/aourednik/historical-basemaps' };
const NATIVE_YEARS = [1492, 1530, 1600, 1650, 1700, 1715];
console.log('historical-basemaps (Native homelands, 1492–1715)');
for (const y of NATIVE_YEARS) {
  await attempt(`historical-basemaps ${y}`, () => download(`https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_${y}.geojson`, join(RAW, 'historical-basemaps', `world_${y}.geojson`), { ...HB_META, layer: `world_${y}` }));
}

// ---------------------------------------------------------------- 5. Native population: census counts by state
// 1860-1990: Census Bureau Working Paper 56 (Gibson and Jung 2002), a PDF; its American Indian column is read into
// data/us/census-aian.csv by scripts/census-wp56.py (needs Python with pypdf, and pdftotext, which ships with Git for
// Windows). 2000, 2010, 2020: the national redistricting (P.L. 94-171) files, one line per state, "American Indian
// and Alaska Native alone". The Census API now wants a personal key; these static files do not.
const CENSUS_META = { source: 'us-census', license: 'Public domain (U.S. Government work)', attribution: 'U.S. Census Bureau' };
console.log('U.S. Census Bureau — American Indian population by state');
await attempt('Census Working Paper 56', () => download('https://www.census.gov/content/dam/Census/library/working-papers/2002/demo/POP-twps0056.pdf', join(RAW, 'census', 'POP-twps0056.pdf'),
  { ...CENSUS_META, layer: 'Gibson and Jung, Historical Census Statistics on Population Totals by Race, 1790 to 1990, by State (Working Paper 56, 2002)' }));
for (const [label, url, file] of [
  ['2000 P.L. 94-171 national data', 'https://www2.census.gov/census_2000/datasets/redistricting_file--pl_94-171/0US_Summary/us00001.upl.zip', 'us00001.upl.zip'],
  ['2000 P.L. 94-171 national geography', 'https://www2.census.gov/census_2000/datasets/redistricting_file--pl_94-171/0US_Summary/usgeo.upl.zip', 'usgeo.upl.zip'],
  ['2010 P.L. 94-171 national file', 'https://www2.census.gov/census_2010/01-Redistricting_File--PL_94-171/National/us2010.npl.zip', 'us2010.npl.zip'],
  ['2020 P.L. 94-171 national file', 'https://www2.census.gov/programs-surveys/decennial/2020/data/01-Redistricting_File--PL_94-171/National/us2020.npl.zip', 'us2020.npl.zip'],
]) {
  await attempt(label, async () => {
    const buf = await download(url, join(RAW, 'census', file), { ...CENSUS_META, layer: label });
    for (const [name, data] of Object.entries(unzipSync(new Uint8Array(buf)))) {
      if (!data.length) continue;
      await writeFile(join(RAW, 'census', name.split('/').pop()), data);
    }
  });
}

// ---------------------------------------------------------------- 6. Native lands: today, and as the courts established them
// Today's American Indian, Alaska Native and Native Hawaiian areas: the Census Bureau's 1:500,000 cartographic boundary
// file (reservations and off-reservation trust land, state reservations, Hawaiian home lands, and the statistical areas).
// The lands tribes proved before the Indian Claims Commission or the Court of Claims as their original territory
// ("Indian Land Areas Judicially Established", the Commission's 1978 map), as the National Park Service digitised it.
console.log('Native lands — today (Census AIANNH) and judicially established (1978)');
await attempt('Census AIANNH 2025', () => download('https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_aiannh_500k.zip', join(RAW, 'census', 'cb_2025_us_aiannh_500k.zip'),
  { ...CENSUS_META, layer: '2025 cartographic boundary file, American Indian / Alaska Native / Native Hawaiian areas, 1:500,000' }));
await attempt('Indian Land Areas Judicially Established 1978', () => download(
  'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/Indian_Land_Areas_Judicially_Established_1978/FeatureServer/5/query?where=1%3D1&outFields=*&outSR=4326&f=geojson&resultRecordCount=2000',
  join(RAW, 'nps', 'icc-1978.geojson'),
  { source: 'nps-icc-1978', license: 'Public domain (U.S. Government work); NPS: "not legal documents"', attribution: 'Indian Claims Commission, Indian Land Areas Judicially Established (map, 1978; USGS); digitised by the National Park Service (Grand Teton NP), ArcGIS Online item "Indian Land Areas Judicially Established 1978"' }));

await writeFile(join(ROOT, 'data', 'base', 'MANIFEST-north-america.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('  wrote data/base/MANIFEST-north-america.json');
// The Native population and lands sources (sections 5 and 6) in docs/DATA-LICENSES.md, a block fetch-base.mjs keeps.
await writeNativeLicenses();
if (failures.length) { console.error(`\n${failures.length} source(s) failed:\n  ${failures.join('\n  ')}`); process.exit(1); }

#!/usr/bin/env node
// Parchment — fetch-base.mjs
// Downloads every base layer the atlas renders. Never edits geometry.
// Records URL, retrieval date, byte size and sha256 of every file in data/base/MANIFEST.json,
// fills source_year / gap in data/calendar.json, and writes docs/DATA-LICENSES.md.
// Fails loudly (exit 1) if any source is unreachable, after writing what it did get.
//
// Usage: node scripts/fetch-base.mjs [--force]   (--force re-downloads cached files)

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat, copyFile } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw');
const FORCE = process.argv.includes('--force');
const UA = 'parchment-fetch-base (classroom atlas)';

const failures = [];
const manifest = {
  generated: new Date().toISOString(),
  note: 'Written by scripts/fetch-base.mjs. Raw downloads live in data/base/raw/ (not committed). Derived simplifications are written by scripts/derive.mjs to data/base/derived/.',
  entries: [],
};

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
  try { return await fn(); }
  catch (e) { failures.push(`${label}: ${e.message}`); console.error(`  FAILED   ${label}: ${e.message}`); return null; }
}

// Pick which base-map year stands in for a calendar year.
//   nearest-not-after (default): the latest base map that is not later than the calendar year,
//                                so the map never shows a border before it existed.
//   nearest:                     smallest gap in either direction, ties to the earlier year.
export function chooseBase(years, target, rule = 'nearest-not-after') {
  const sorted = [...years].sort((a, b) => a.year - b.year);
  if (rule === 'nearest-not-after') {
    const le = sorted.filter((y) => y.year <= target);
    if (le.length) return le[le.length - 1];
  }
  return sorted.reduce((best, y) => (Math.abs(y.year - target) < Math.abs(best.year - target) ? y : best), sorted[0]);
}

// ---------------------------------------------------------------- 1. historical-basemaps
const HB_REPO = 'aourednik/historical-basemaps';
const HB_RAW = `https://raw.githubusercontent.com/${HB_REPO}/master`;
const HB_META = { source: 'historical-basemaps', license: 'GPL-3.0', attribution: 'Historical Basemaps, Andrej Ourednik and contributors, https://github.com/aourednik/historical-basemaps' };

console.log('historical-basemaps');
const calendarPath = join(ROOT, 'data', 'calendar.json');
const calendar = JSON.parse(await readFile(calendarPath, 'utf8'));
const rule = calendar.rule ?? 'nearest-not-after';
calendar.rule = rule;

const indexBuf = await attempt('historical-basemaps index.json', () =>
  download(`${HB_RAW}/index.json`, join(RAW, 'historical-basemaps', 'index.json'), HB_META));
if (indexBuf) {
  const index = JSON.parse(indexBuf.toString('utf8'));
  const years = index.years.map((y) => ({ year: y.year, filename: y.filename }));
  const picks = [];
  for (const snap of calendar.snapshots) {
    // A snapshot may pin a specific base year (source_override) when the rule's pick is known to be worse.
    const pinned = snap.source_override != null ? years.find((y) => y.year === snap.source_override) : null;
    if (snap.source_override != null && !pinned) console.warn(`  note: ${snap.year} asks for base year ${snap.source_override}, which does not exist; using the rule instead`);
    const pick = pinned ?? chooseBase(years, snap.year, rule);
    snap.source_year = pick.year;
    snap.gap = snap.year - pick.year;
    snap.source_file = pick.filename;
    picks.push({ year: snap.year, source_year: pick.year, gap: snap.gap, file: pick.filename });
    await attempt(`basemap ${pick.filename}`, () =>
      download(`${HB_RAW}/geojson/${pick.filename}`, join(RAW, 'historical-basemaps', pick.filename), { ...HB_META, calendar_year: snap.year, base_year: pick.year }));
  }
  const commit = await attempt('historical-basemaps commit lookup', async () => {
    const r = await fetch(`https://api.github.com/repos/${HB_REPO}/commits/master`, { headers: { 'user-agent': UA, accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status} from GitHub API (rate limit?)`);
    const j = await r.json();
    return { sha: j.sha, date: j.commit?.committer?.date ?? null };
  });
  manifest.historical_basemaps = { repo: `https://github.com/${HB_REPO}`, branch: 'master', commit, rule, picks, available_years: years.map((y) => y.year) };
}
await writeFile(calendarPath, JSON.stringify(calendar, null, 2) + '\n');
console.log(`  wrote    data/calendar.json (rule: ${rule})`);

// ---------------------------------------------------------------- 2. Natural Earth vectors
// GeoJSON from the Natural Earth maintainers' own repository (the source the download page is built from).
const NE_GH = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson';
const NE_META = { source: 'Natural Earth', license: 'Public domain', attribution: 'Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com' };
const NE_VECTORS = [
  'ne_50m_land',
  'ne_50m_coastline',
  'ne_50m_lakes',
  'ne_50m_rivers_lake_centerlines',
  // Bathymetry ships only at 1:10m; derive.mjs simplifies it to hairline contours.
  'ne_10m_bathymetry_K_200',
  'ne_10m_bathymetry_J_1000',
  'ne_10m_bathymetry_I_2000',
  'ne_10m_bathymetry_H_3000',
  'ne_10m_bathymetry_G_4000',
  'ne_10m_bathymetry_F_5000',
  'ne_10m_bathymetry_E_6000',
];
console.log('Natural Earth vectors');
for (const name of NE_VECTORS) {
  await attempt(`natural-earth ${name}`, () =>
    download(`${NE_GH}/${name}.geojson`, join(RAW, 'natural-earth', `${name}.geojson`), { ...NE_META, layer: name }));
}

// ---------------------------------------------------------------- 3. Natural Earth rasters
// Zips from Natural Earth's download CDN (the links on naturalearthdata.com resolve here).
const NE_CDN = 'https://naciscdn.org/naturalearth';
const NE_RASTERS = [
  { name: 'SR_50M', url: `${NE_CDN}/50m/raster/SR_50M.zip`, note: 'Shaded relief, 1:50m, grayscale GeoTIFF' },
];
console.log('Natural Earth rasters');
for (const r of NE_RASTERS) {
  await attempt(`natural-earth raster ${r.name}`, async () => {
    const zipPath = join(RAW, 'natural-earth', `${r.name}.zip`);
    const buf = await download(r.url, zipPath, { ...NE_META, layer: r.name, note: r.note });
    const outDir = join(RAW, 'natural-earth', r.name);
    if (FORCE || !(await exists(outDir))) {
      const files = unzipSync(new Uint8Array(buf));
      await mkdir(outDir, { recursive: true });
      for (const [name, data] of Object.entries(files)) {
        if (name.endsWith('/')) continue;
        const p = join(outDir, name.split('/').pop());
        await writeFile(p, data);
        console.log(`  unzipped ${rel(p)} (${(data.length / 1024).toFixed(0)} KB)`);
      }
    } else {
      console.log(`  cached   ${rel(outDir)}/`);
    }
  });
}

// ---------------------------------------------------------------- 4. Font (bundled, no CDN at runtime)
console.log('Libre Baskerville');
await attempt('font Libre Baskerville', async () => {
  const pkgDir = join(ROOT, 'node_modules', '@fontsource', 'libre-baskerville');
  const pkg = JSON.parse(await readFile(join(pkgDir, 'package.json'), 'utf8'));
  const outDir = join(ROOT, 'assets', 'fonts');
  await mkdir(outDir, { recursive: true });
  const files = [
    'libre-baskerville-latin-400-normal.woff2',
    'libre-baskerville-latin-400-italic.woff2',
    'libre-baskerville-latin-700-normal.woff2',
    'libre-baskerville-latin-700-italic.woff2',
  ];
  for (const f of files) {
    const dest = join(outDir, f);
    await copyFile(join(pkgDir, 'files', f), dest);
    const buf = await readFile(dest);
    manifest.entries.push({
      source: 'Libre Baskerville', license: 'SIL Open Font License 1.1',
      attribution: 'Libre Baskerville by Pablo Impallari and Rodrigo Fuenzalida',
      url: `npm:@fontsource/libre-baskerville@${pkg.version}/files/${f}`,
      file: rel(dest), bytes: buf.length, sha256: sha256(buf), retrieved: new Date().toISOString(),
    });
    console.log(`  copied   ${rel(dest)}`);
  }
});

// ---------------------------------------------------------------- 5. Manifest and licenses
manifest.failures = failures;
await mkdir(join(ROOT, 'data', 'base'), { recursive: true });
await writeFile(join(ROOT, 'data', 'base', 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('  wrote    data/base/MANIFEST.json');

const hb = manifest.historical_basemaps;
const commitNote = hb?.commit?.sha ? ` (commit \`${hb.commit.sha.slice(0, 7)}\`, ${(hb.commit.date ?? '').slice(0, 10)})` : '';
const licenses = [
  '# Data licenses and attribution',
  '',
  'Parchment draws no geometry of its own. Every polygon, coastline, relief tile and point coordinate is downloaded',
  'from the sources below by `scripts/fetch-base.mjs`, which records the exact URL, retrieval date and checksum of each',
  'file in `data/base/MANIFEST.json`. The atlas code is MIT-licensed; the data stays under the licenses listed here.',
  '',
  '| layer | source | license | attribution |',
  '|---|---|---|---|',
  `| World polities by year | [historical-basemaps](https://github.com/aourednik/historical-basemaps)${commitNote} | GPL-3.0 | Historical Basemaps, Andrej Ourednik and contributors. Borders are approximate by nature; see that project's README. |`,
  '| Land, coastlines, lakes, rivers, bathymetry | [Natural Earth](https://www.naturalearthdata.com) vectors (1:50m; bathymetry 1:10m) | Public domain | Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com |',
  '| Shaded relief | [Natural Earth](https://www.naturalearthdata.com) raster SR_50M | Public domain | Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com |',
  '| Typeface | [Libre Baskerville](https://github.com/impallari/Libre-Baskerville) via @fontsource | SIL Open Font License 1.1 | Pablo Impallari and Rodrigo Fuenzalida |',
  '',
  'Planned for later versions (not yet downloaded): Newberry Library Atlas of Historical County Boundaries (CC BY-NC-SA),',
  'OpenHistoricalMap (CC0 / public domain), Native Land Digital (per site terms), Wikidata coordinates (CC0).',
  '',
  `Last run of fetch-base.mjs: ${manifest.generated.slice(0, 10)}.`,
  '',
].join('\n');
await writeFile(join(ROOT, 'docs', 'DATA-LICENSES.md'), licenses);
console.log('  wrote    docs/DATA-LICENSES.md');

if (failures.length) {
  console.error(`\n${failures.length} source(s) failed:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log('\nAll base data present.');

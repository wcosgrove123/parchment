#!/usr/bin/env node
// Parchment — fetch-europe.mjs
// Downloads the OpenHistoricalMap boundaries the Europe stage's "Britain and the Empire" tracker draws
// (src/trackers/realms.json): every relation it names, and every member of the chronologies it names (the Holy Roman
// Empire, the Kingdom of England, the Kingdom of Scotland). Never edits geometry. Records the query, retrieval date,
// byte size, sha256 and OpenHistoricalMap's data timestamp in data/base/MANIFEST-europe.json, and keeps its block in
// docs/DATA-LICENSES.md (<!-- europe:start --> … <!-- europe:end -->, which fetch-base.mjs carries over).
//
// Usage: node scripts/fetch-europe.mjs [--force]   (--force re-downloads cached files)

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'ohm-europe');
const FORCE = process.argv.includes('--force');
const UA = 'parchment-fetch-europe (classroom atlas)';
const OVERPASS = 'https://overpass-api.openhistoricalmap.org/api/interpreter';
const OHM_META = { source: 'openhistoricalmap', license: 'CC0 1.0', attribution: 'OpenHistoricalMap contributors, https://www.openhistoricalmap.org (CC0)' };

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const rel = (p) => relative(ROOT, p).split('\\').join('/');
const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };
const manifest = { generated: new Date().toISOString(), note: 'Written by scripts/fetch-europe.mjs. Raw downloads live in data/base/raw/ohm-europe/ (not committed); scripts/derive-europe.mjs writes data/base/derived/realms.topojson.', entries: [] };

async function overpass(query, dest, meta) {
  if (!FORCE && (await exists(dest))) {
    const buf = await readFile(dest);
    manifest.entries.push({ ...OHM_META, ...meta, url: OVERPASS, query, file: rel(dest), bytes: buf.length, sha256: sha256(buf), retrieved: (await stat(dest)).mtime.toISOString(), cached: true });
    console.log(`  cached   ${rel(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
    return JSON.parse(buf.toString('utf8'));
  }
  const res = await fetch(OVERPASS, { method: 'POST', headers: { 'user-agent': UA }, body: new URLSearchParams({ data: query }) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} from ${OVERPASS}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const json = JSON.parse(buf.toString('utf8'));
  if (json.remark && /error|timed out/i.test(json.remark)) throw new Error(`Overpass: ${json.remark}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  manifest.entries.push({ ...OHM_META, ...meta, url: OVERPASS, query, file: rel(dest), bytes: buf.length, sha256: sha256(buf), retrieved: new Date().toISOString(), osm_base: json.osm3s?.timestamp_osm_base ?? null, cached: false });
  console.log(`  fetched  ${rel(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
  return json;
}

const tracker = JSON.parse(await readFile(join(ROOT, 'src', 'trackers', 'realms.json'), 'utf8'));
const chronologies = tracker.realms.flatMap((r) => r.chronology ?? []);
const named = tracker.realms.flatMap((r) => r.ohm ?? []);

console.log('OpenHistoricalMap: the chronologies (Holy Roman Empire, England, Scotland)');
const qc = `[out:json][timeout:120];rel(id:${chronologies.join(',')});out body;`;
const chrono = await overpass(qc, join(RAW, 'chronologies.json'), { layer: 'chronology relations and their members' });
const members = new Map();
for (const e of chrono.elements) {
  const ids = (e.members ?? []).filter((m) => m.type === 'relation').map((m) => m.ref);
  members.set(e.id, ids);
  console.log(`  ${e.tags?.['name:en'] ?? e.tags?.name} (${e.id}): ${ids.length} boundary relations`);
}
const missing = chronologies.filter((id) => !members.has(id));
if (missing.length) throw new Error(`chronology relations not found on OpenHistoricalMap: ${missing.join(', ')}`);

const ids = [...new Set([...[...members.values()].flat(), ...named])].sort((a, b) => a - b);
console.log(`OpenHistoricalMap: geometry of ${ids.length} relations`);
const qg = `[out:json][timeout:600][maxsize:1073741824];rel(id:${ids.join(',')});out body;>;out skel qt;`;
const geo = await overpass(qg, join(RAW, 'realms-geometry.json'), { layer: 'relations, member ways and nodes', relations: ids.length, query_note: 'rel(id:<every member of the chronologies above and every relation src/trackers/realms.json names>);out body;>;out skel qt;' });
const got = new Set(geo.elements.filter((e) => e.type === 'relation').map((e) => e.id));
const absent = ids.filter((id) => !got.has(id));
if (absent.length) console.warn(`  note: ${absent.length} relation(s) not returned (deleted or redacted on OpenHistoricalMap?): ${absent.join(', ')}`);

await writeFile(join(ROOT, 'data', 'base', 'MANIFEST-europe.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('  wrote    data/base/MANIFEST-europe.json');

// docs/DATA-LICENSES.md: this script's block, replaced in place (or added at the end).
const block = [
  '<!-- europe:start -->',
  '',
  '### The Holy Roman Empire\'s outer border, 1648–1766',
  '',
  'Fetched by `scripts/fetch-europe.mjs` (the queries, dates and checksums in `data/base/MANIFEST-europe.json`) and',
  'simplified by `scripts/derive-europe.mjs` into `data/base/derived/realms.topojson`; drawn over the political map',
  'for the dates OpenHistoricalMap gives it a border (src/render/realms.js). No shape is drawn or moved by hand.',
  '',
  '| layer | source | license | attribution |',
  '|---|---|---|---|',
  '| The Holy Roman Empire\'s outer border, dated by treaty: 24 October 1648 – 7 November 1659 and 17 September 1678 – 1766 | [OpenHistoricalMap](https://www.openhistoricalmap.org) via its Overpass API | CC0 1.0 | OpenHistoricalMap contributors |',
  '',
  '<!-- europe:end -->',
].join('\n');
const licPath = join(ROOT, 'docs', 'DATA-LICENSES.md');
const lic = await readFile(licPath, 'utf8');
const re = /<!-- europe:start -->[\s\S]*?<!-- europe:end -->/;
await writeFile(licPath, re.test(lic) ? lic.replace(re, block) : `${lic.trimEnd()}\n\n${block}\n`);
console.log('  wrote    docs/DATA-LICENSES.md (europe block)');

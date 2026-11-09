#!/usr/bin/env node
// Parchment — derive-europe.mjs
// Turns the OpenHistoricalMap download of scripts/fetch-europe.mjs into data/base/derived/realms.topojson, the shapes
// of the Europe stage's "Britain and the Empire" tracker (src/trackers/realms.json). Clips to the stage's box, fixes
// ring winding for d3, simplifies; never moves a vertex by hand. Attributes written here: the realm each relation
// belongs to (from realms.json), its dates as YYYYMMDD integers, its certainty (approximate before the Peace of
// Westphalia, as for every base map: data/base/derived/index.json certainty_legal_from), and its sources.
//
// Usage: node scripts/derive-europe.mjs [--report]   (--report lists every shape: dates, area, parts)

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import osmtogeojson from 'osmtogeojson';
import { geoArea, geoCentroid } from 'd3';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { quantize } from 'topojson-client';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'ohm-europe');
const OUT = join(ROOT, 'data', 'base', 'derived');
const REPORT = process.argv.includes('--report');
// The Europe stage's box (src/stages/europe.json) with a margin: nothing the stage can show is cut.
const CLIP = { west: -32, east: 52, south: 30, north: 74 };
const SETTINGS = { minWeight: 2e-5, quantization: 2e5 };
const OPEN = 99991231;
const LEGAL_FROM = 16481024; // the Peace of Westphalia: borders after it are drawn as documented (solid)
const R_KM = 6371;

const tracker = JSON.parse(await readFile(join(ROOT, 'src', 'trackers', 'realms.json'), 'utf8'));
const raw = JSON.parse(await readFile(join(RAW, 'realms-geometry.json'), 'utf8'));
const chrono = JSON.parse(await readFile(join(RAW, 'chronologies.json'), 'utf8'));

// Which realm each relation belongs to: the chronologies' members, then the relations realms.json names.
const realmOf = new Map();
const membersOf = new Map(chrono.elements.map((e) => [e.id, (e.members ?? []).filter((m) => m.type === 'relation').map((m) => m.ref)]));
for (const r of tracker.realms) {
  for (const c of r.chronology ?? []) for (const id of membersOf.get(c) ?? []) realmOf.set(id, r.id);
  for (const id of r.ohm ?? []) realmOf.set(id, r.id);
}

// OHM dates: "1492-10-12", "1493-11", "1535", "-0200" → YYYYMMDD integer (as scripts/derive-us.mjs).
function ymd(s, end = false) {
  if (!s) return end ? OPEN : null;
  const m = String(s).trim().match(/^(-?)(\d{1,4})(?:-(\d\d))?(?:-(\d\d))?/);
  if (!m) return end ? OPEN : null;
  const y = Number(m[2]) * (m[1] ? -1 : 1);
  return y * 10000 + Math.sign(y || 1) * (Number(m[3] ?? 1) * 100 + Number(m[4] ?? 1));
}

// ---------------------------------------------------------------- geometry helpers (as scripts/derive-us.mjs)
function at(a, b, axis, v) {
  const t = (v - a[axis]) / (b[axis] - a[axis]);
  return axis === 0 ? [v, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), v];
}
function clipRing(ring) {
  const edges = [
    [(p) => p[0] >= CLIP.west, (a, b) => at(a, b, 0, CLIP.west)],
    [(p) => p[0] <= CLIP.east, (a, b) => at(a, b, 0, CLIP.east)],
    [(p) => p[1] >= CLIP.south, (a, b) => at(a, b, 1, CLIP.south)],
    [(p) => p[1] <= CLIP.north, (a, b) => at(a, b, 1, CLIP.north)],
  ];
  let pts = ring.slice(0, -1);
  for (const [inside, cut] of edges) {
    if (!pts.length) break;
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i], prev = pts[(i + pts.length - 1) % pts.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(cut(prev, cur));
    }
    pts = out;
  }
  return pts.length < 3 ? null : [...pts, pts[0]];
}
const polygonsOf = (g) => (!g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
function prepare(geometry) {
  const polys = [];
  for (const poly of polygonsOf(geometry)) {
    const outer = clipRing(poly[0]);
    if (!outer) continue;
    let p = [outer, ...poly.slice(1).map(clipRing).filter(Boolean)];
    if (geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI) p = p.map((r) => r.slice().reverse());
    if (geoArea({ type: 'Polygon', coordinates: [p[0]] }) < 1e-9) continue;
    polys.push(p);
  }
  if (!polys.length) return null;
  return polys.length === 1 ? { type: 'Polygon', coordinates: polys[0] } : { type: 'MultiPolygon', coordinates: polys };
}

// ---------------------------------------------------------------- the shapes
const relTags = new Map(raw.elements.filter((e) => e.type === 'relation').map((e) => [e.id, e.tags ?? {}]));
const gj = osmtogeojson(raw, { flatProperties: true });
const features = [];
const skipped = [];
for (const f of gj.features) {
  if (!String(f.id).startsWith('relation/')) continue;
  const rid = Number(String(f.id).split('/')[1]);
  const realm = realmOf.get(rid);
  const t = relTags.get(rid) ?? {};
  if (!realm) { skipped.push(`${rid} ${t.name} (no realm)`); continue; }
  if (!/Polygon/.test(f.geometry?.type)) { skipped.push(`${rid} ${t.name} (not an area)`); continue; }
  const s = ymd(t.start_date), e = ymd(t.end_date, true);
  if (s == null) { skipped.push(`${rid} ${t.name} (no start date)`); continue; }
  const geometry = prepare(f.geometry);
  if (!geometry) { skipped.push(`${rid} ${t.name} (outside the stage)`); continue; }
  const name = t['name:en'] || t.name || '';
  features.push({
    type: 'Feature',
    properties: {
      rid, realm, name, ...(t.name && t.name !== name ? { local: t.name } : {}),
      s, e, start_raw: t.start_date ?? null, end_raw: t.end_date ?? null,
      certainty: s >= LEGAL_FROM ? 'legal' : 'approximate',
      ...(t.wikidata ? { wd: t.wikidata } : {}),
      ...(t.source ? { src: t.source } : {}),
    },
    geometry,
  });
}
features.sort((a, b) => a.properties.realm.localeCompare(b.properties.realm) || a.properties.s - b.properties.s);

if (REPORT) {
  for (const f of features) {
    const parts = polygonsOf(f.geometry).map((p) => ({ km2: geoArea({ type: 'Polygon', coordinates: p }) * R_KM * R_KM, c: geoCentroid({ type: 'Polygon', coordinates: p }) })).sort((a, b) => b.km2 - a.km2);
    const p = f.properties;
    console.log(`${p.realm.padEnd(8)} ${p.rid} ${p.name} | ${p.start_raw} → ${p.end_raw} | ${Math.round(parts.reduce((s, x) => s + x.km2, 0)).toLocaleString()} km² | ${parts.length} parts: ${parts.filter((x) => x.km2 > 1500).map((x) => `${Math.round(x.km2 / 1000)}k@${x.c[0].toFixed(1)},${x.c[1].toFixed(1)}`).join(' ')}`);
  }
}

const topo = (() => {
  let t = topology({ realms: { type: 'FeatureCollection', features } }, SETTINGS.quantization);
  t = presimplify(t);
  t = simplify(t, SETTINGS.minWeight);
  t = quantize(t, SETTINGS.quantization);
  for (const arc of t.arcs) for (const pt of arc) pt.length = 2;
  return t;
})();
const manifest = JSON.parse(await readFile(join(ROOT, 'data', 'base', 'MANIFEST-europe.json'), 'utf8'));
topo.meta = { source: 'OpenHistoricalMap (CC0)', osm_base: manifest.entries.find((x) => x.osm_base)?.osm_base ?? null, tracker: 'src/trackers/realms.json' };
const text = JSON.stringify(topo);
await writeFile(join(OUT, 'realms.topojson'), text);

// The derived index keeps one entry per layer; derive.mjs carries entries other scripts write.
const indexPath = join(OUT, 'index.json');
const index = JSON.parse(await readFile(indexPath, 'utf8'));
const byRealm = {};
for (const f of features) byRealm[f.properties.realm] = (byRealm[f.properties.realm] ?? 0) + 1;
index.layers.realms = { file: 'realms.topojson', bytes: text.length, features: features.length, by_realm: byRealm, settings: SETTINGS, written_by: 'scripts/derive-europe.mjs' };
await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log(`realms.topojson: ${features.length} shapes (${Object.entries(byRealm).map(([k, v]) => `${k} ${v}`).join(', ')}), ${(text.length / 1024).toFixed(0)} KB`);
if (skipped.length) console.log(`  skipped ${skipped.length}: ${skipped.join('; ')}`);

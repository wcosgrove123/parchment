#!/usr/bin/env node
// Parchment — derive-native.mjs
// Native population and Native lands for the North America stage, from the downloads of scripts/fetch-us.mjs:
//
//   data/us/native.json             census counts of American Indians by state, 1860-2020, with each census's day,
//                                   the national total and a check that the states add up to it; a point inside
//                                   each present-day state (to add states onto the territories of earlier days);
//                                   the scholarly estimates of data/us/native-estimates.csv, for the years before a
//                                   full count
//   data/us/native-lands.topojson   today's American Indian, Alaska Native and Native Hawaiian areas (Census, 2025);
//                                   the lands proved as original tribal territory before the Indian Claims
//                                   Commission (its 1978 map); and the land each Southeastern nation held under U.S.
//                                   treaty between one treaty and the next, 1785-1835 (computed from the Royce areas
//                                   of cessions.topojson, dated by data/us/treaty-places.csv and Royce's schedule)
//
// Nothing here draws a shape; the lands are simplified only. Run after derive-us.mjs (it reads newberry.topojson).
// Usage: node scripts/derive-native.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as shapefile from 'shapefile';
import { unzipSync } from 'fflate';
import { geoArea, geoContains, geoCentroid, geoBounds } from 'd3';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { feature, quantize } from 'topojson-client';
import polygonClipping from 'polygon-clipping';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw');
const OUT = join(ROOT, 'data', 'us');
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const problems = [];

// Census days (the date each count stands for): June 1 through 1900, April 15 in 1910, January 1 in 1920, April 1 since.
const CENSUS_DAY = { 1860: 18600601, 1870: 18700601, 1880: 18800601, 1890: 18900602, 1900: 19000601, 1910: 19100415, 1920: 19200101 };
const censusDay = (y) => CENSUS_DAY[y] ?? y * 10000 + 401;
const WHAT = {
  early: 'American Indians the census counted. Before 1890 it left out "Indians not taxed" (those living on reservations or in tribal territory, most Native people), so these counts are far too low.',
  full: 'American Indians, the first census to count Native people on reservations and in Indian Territory too (a special Indian census added to the regular count).',
  race: 'American Indian (from 1960 also Eskimo and Aleut), counted by the census.',
  alone: 'American Indian and Alaska Native alone (people who gave one race). Counting everyone who named it alone or with another race roughly doubles it from 2000 on (9.7 million in 2020).',
};
const whatFor = (y) => (y < 1890 ? 'early' : y === 1890 ? 'full' : y < 2000 ? 'race' : 'alone');

// ---------------------------------------------------------------- 1. census 1860-1990 (Working Paper 56)
const wp56 = (await readFile(join(OUT, 'census-aian-1860-1990.csv'), 'utf8')).trim().split(/\r?\n/).slice(1)
  .map((l) => { const [state, year, aian, total, row] = l.split(','); return { state, year: +year, aian: aian === '' ? null : +aian, total: +total, row: row.trim() }; });
const byYear = new Map();
for (const r of wp56) {
  if (/Region|Division/.test(r.state) || r.aian == null) continue;
  const y = byYear.get(r.year) ?? new Map();
  // Two rows for 1890 (with and without the special Indian census): the full count is the larger.
  const prev = y.get(r.state);
  if (!prev || r.aian > prev.aian) y.set(r.state, { aian: r.aian, total: r.total, row: r.row });
  byYear.set(r.year, y);
}

// ---------------------------------------------------------------- 2. census 2000, 2010, 2020 (P.L. 94-171 national files)
const raw = (f) => readFile(join(RAW, 'census', f), 'latin1');
async function fixedWidth(geo, seg, nameAt) {
  const lr = new Map();
  for (const l of (await raw(geo)).split(/\r?\n/)) if (l.slice(8, 11) === '040' && l.slice(11, 13) === '00') lr.set(l.slice(18, 25), l.slice(nameAt[0], nameAt[1]).trim());
  const out = new Map();
  for (const l of (await raw(seg)).split(/\r?\n/)) {
    const f = l.split(',').map((x) => x.replace(/"/g, ''));
    if (lr.has(f[4])) out.set(lr.get(f[4]), { aian: +f[9], total: +f[5], row: 'P.L. 94-171 P1' });
  }
  return out;
}
async function piped2020() {
  const lr = new Map();
  for (const l of (await raw('usgeo2020.npl')).split(/\r?\n/)) { const f = l.split('|'); if (f[2] === '040' && f[4] === '00') lr.set(f[7], f[86]); }
  const out = new Map();
  for (const l of (await raw('us000012020.npl')).split(/\r?\n/)) { const f = l.split('|'); if (lr.has(f[4])) out.set(lr.get(f[4]), { aian: +f[9], total: +f[5], row: 'P.L. 94-171 P1' }); }
  return out;
}
byYear.set(2000, await fixedWidth('usgeo.upl', 'us00001.upl', [200, 290]));
byYear.set(2010, await fixedWidth('usgeo2010.npl', 'us000012010.npl', [226, 316]));
byYear.set(2020, await piped2020());
const NATIONAL = { 2000: 2475956, 2010: 2932248, 2020: 3727135 }; // Census, P.L. 94-171 Table P1 (United States)

const census = [];
for (const year of [...byYear.keys()].sort((a, b) => a - b)) {
  const m = byYear.get(year);
  const us = m.get('United States')?.aian ?? NATIONAL[year] ?? null;
  const states = [...m.entries()].filter(([s]) => s !== 'United States' && s !== 'Puerto Rico').map(([state, v]) => ({ state, aian: v.aian, total: v.total }));
  const sum = states.reduce((a, s) => a + s.aian, 0);
  if (us != null && sum !== us) problems.push(`${year}: states add up to ${sum}, the national figure is ${us}`);
  census.push({
    year, day: censusDay(year), us: us ?? sum, what: whatFor(year), full: year >= 1890, states,
    source: year < 2000
      ? 'Campbell Gibson and Kay Jung, Historical Census Statistics on Population Totals by Race, 1790 to 1990, by State (U.S. Census Bureau, Population Division Working Paper 56, 2002), state tables'
      : `U.S. Census Bureau, ${year} Census Redistricting Data (Public Law 94-171), national file, Table P1`,
  });
}
console.log(`census: ${census.map((c) => `${c.year} (${c.states.length})`).join(', ')}`);

// ---------------------------------------------------------------- 3. a point inside each present-day state
const nbTopo = JSON.parse(await readFile(join(OUT, 'newberry.topojson'), 'utf8'));
const today = feature(nbTopo, nbTopo.objects.states).features.filter((f) => f.properties.e >= 99991231);
function inside(f) {
  let best = null, bestA = -1;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const p of polys) { const g = { type: 'Polygon', coordinates: p }; const a = geoArea(g); if (a > bestA) { bestA = a; best = g; } }
  const c = geoCentroid(best);
  if (geoContains(best, c)) return c.map((v) => +v.toFixed(3));
  const [[x0, y0], [x1, y1]] = geoBounds(best);
  for (let n = 8; n <= 40; n += 8) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const p = [x0 + ((x1 - x0) * (i + 0.5)) / n, y0 + ((y1 - y0) * (j + 0.5)) / n];
    if (geoContains(best, p)) return p.map((v) => +v.toFixed(3));
  }
  return c;
}
const anchors = {};
for (const f of today) anchors[f.properties.full || f.properties.name] = inside(f);
const missing = new Set(census.flatMap((c) => c.states.map((s) => s.state)).filter((s) => !anchors[s]));
if (missing.size) problems.push(`no present-day polygon for: ${[...missing].join(', ')}`);

// The present-day state each older polygon of the full-count years lies in (a point inside it, tested against today's
// polygons). A count reported for a present-day state then covers every polygon of it alive on census day: the 1890
// and 1900 counts for Oklahoma include Indian Territory, so both territories take that count together.
const home = {};
for (const f of feature(nbTopo, nbTopo.objects.states).features) {
  const p = f.properties;
  if (p.e < 18900601 || p.e >= 99991231) continue;
  const pt = inside(f);
  const st = today.find((t) => geoContains(t, pt));
  if (st) home[`${p.id}@${p.v}`] = st.properties.full || st.properties.name;
}

// ---------------------------------------------------------------- 4. scholarly estimates (data/us/native-estimates.csv)
function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return body.map((r) => Object.fromEntries(head.map((h, k) => [h, r[k] ?? ''])));
}
const num = (s) => (s === '' || s == null ? null : Number(s));
const estimates = parseCSV(await readFile(join(OUT, 'native-estimates.csv'), 'utf8')).map((r) => ({
  id: r.id, place: r.place, at: r.lon !== '' ? [num(r.lon), num(r.lat)] : null,
  s: num(r.start) * 10000 + 101, e: num(r.end) * 10000 + 1231,
  value: num(r.value), low: num(r.low), high: num(r.high), grade: r.grade, label: r.label, source: r.source, note: r.note,
}));

await writeFile(join(OUT, 'native.json'), JSON.stringify({ generated: new Date().toISOString(), what: WHAT, census, anchors, home, estimates }) + '\n');
console.log(`native.json: ${census.length} censuses, ${Object.keys(anchors).length} state anchors, ${estimates.length} estimates`);

// ---------------------------------------------------------------- 5. Native lands
function wind(geometry) {
  const polys = (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates).map((p) => {
    let q = p;
    if (geoArea({ type: 'Polygon', coordinates: q }) > 2 * Math.PI) q = q.map((r) => r.slice().reverse());
    return q;
  }).filter((p) => geoArea({ type: 'Polygon', coordinates: [p[0]] }) > 1e-12);
  if (!polys.length) return null;
  return polys.length === 1 ? { type: 'Polygon', coordinates: polys[0] } : { type: 'MultiPolygon', coordinates: polys };
}
const zip = unzipSync(new Uint8Array(await readFile(join(RAW, 'census', 'cb_2025_us_aiannh_500k.zip'))));
const part = (ext) => Object.entries(zip).find(([n]) => n.endsWith(ext))[1];
const aiannh = [];
{
  const src = await shapefile.open(part('.shp').buffer, part('.dbf').buffer, { encoding: 'utf-8' });
  for (let r = await src.read(); !r.done; r = await src.read()) {
    const p = r.value.properties;
    const geometry = r.value.geometry && wind(r.value.geometry);
    if (!geometry) continue;
    // Held land (reservations, trust land, rancherias, pueblos, colonies, Hawaiian home lands) or a statistical area
    // the Census Bureau draws for counting (Alaska Native village, Oklahoma tribal, tribal- and state-designated
    // statistical areas), which no one holds as land. The name's last words say which.
    const name = p.NAMELSAD || p.NAME;
    const kind = /\b(ANVSA|OTSA|SDTSA|TDSA)$/.test(name) ? 'statistical' : /Hawaiian Home Land$/.test(name) ? 'hawaiian' : 'held';
    aiannh.push({ type: 'Feature', properties: { name, geoid: p.GEOID, lsad: p.LSAD, kind }, geometry });
  }
}
const icc = [];
for (const f of JSON.parse(await readFile(join(RAW, 'nps', 'icc-1978.geojson'), 'utf8')).features) {
  const geometry = f.geometry && wind(f.geometry);
  if (!geometry) continue;
  icc.push({ type: 'Feature', properties: { tribe: f.properties.Affiliatio, cat: f.properties.CATNUM }, geometry });
}
// ---------------------------------------------------------------- 6. Land held under U.S. treaty, before Removal
// The land the United States recognized by treaty as a nation's own, on a day d, is the land that nation had still
// to cede: the union of its Royce areas whose cession came after d. Computed, never drawn: a union of downloaded
// polygons, cut at each treaty that took a piece. Only the nations whose cessions east of the Mississippi are
// complete in Royce's schedule, from their first treaty with the United States to the last one (Removal). An area
// with several dates passed at the last of them: Royce's schedule shows the first as the treaty that reserved it
// (the 1819 Cherokee treaty cedes tracts "reserved by treaty of Oct. 25, 1805"; Colbert's 1816 Chickasaw reserve
// passed in 1818; the Choctaw reserve of 1805 "was covered by the cession made in treaty of Sept. 27, 1830"). Lands
// granted in the West are left out: they were not held before the treaties that granted them, which this rule
// cannot see. One area is the other way round, its later date only explaining the earlier cession:
const PASSED = {
  // Royce 1899, Cherokee treaty of 11 Sept. 1807: "explanatory and in elucidation of the cession made by article 1
  // of the treaty of Jan. 7, 1806"; the land passed in 1806.
  64: 18060107,
};
const NATIONS = [
  { id: 'cherokee', name: 'Cherokee', tribes: ['Cherokee'] },
  { id: 'creek', name: 'Creek', tribes: ['Creek'] },
  { id: 'choctaw', name: 'Choctaw', tribes: ['Choctaw'] },
  { id: 'chickasaw', name: 'Chickasaw', tribes: ['Chickasaw'] },
  { id: 'seminole', name: 'Seminole', tribes: ['Seminole'] },
];
const WEST = /\b(AR|OK|KS|MO|LA|TX|IA|NE)\b/;
const R2 = 6371.0088 ** 2;
const ymd = (ms) => { const d = new Date(ms); return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate(); };
const dayBefore = (d) => ymd(Date.UTC(Math.floor(d / 10000), (Math.floor(d / 100) % 100) - 1, d % 100) - 864e5);
const cessDates = new Map();
for (const f of JSON.parse(await readFile(join(RAW, 'usfs', 'royce-cessions.geojson'), 'utf8')).features) {
  const p = Object.fromEntries(Object.entries(f.properties).map(([k, v]) => [k.split('.').pop(), v]));
  const ds = [p.cessdate1, p.cessdate2, p.cessdate3, p.cessdate4, p.cessdate5].filter((v) => v != null).map(ymd).sort((a, b) => a - b);
  if (ds.length) cessDates.set(String(p.cessnum), ds);
}
const cesTopo = JSON.parse(await readFile(join(OUT, 'cessions.topojson'), 'utf8'));
const cesFeatures = feature(cesTopo, cesTopo.objects.cessions).features;
const places = parseCSV(await readFile(join(OUT, 'treaty-places.csv'), 'utf8'));
const placeOf = (nation, d) => places.find((r) => r.nation === nation && Number(r.date.replaceAll('-', '')) === d) ?? null;
const toPC = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const fromPC = (mp) => (mp.length ? wind(mp.length === 1 ? { type: 'Polygon', coordinates: mp[0] } : { type: 'MultiPolygon', coordinates: mp }) : null);
const treaty = [];
for (const n of NATIONS) {
  const areas = cesFeatures.filter((f) => n.tribes.includes(f.properties.tribe) && !WEST.test(f.properties.state ?? ''))
    .map((f) => ({ f, n: String(f.properties.n), ds: cessDates.get(String(f.properties.n)) ?? [f.properties.d] }));
  if (!areas.length) { problems.push(`treaty land: no areas east of the Mississippi for ${n.id}`); continue; }
  for (const a of areas) a.until = PASSED[a.n] ?? a.ds[a.ds.length - 1];
  // From the nation's first treaty with the United States: the first that set its boundary (data/us/treaty-places.csv,
  // `first`: the Choctaw and Chickasaw treaties of Hopewell, 1786, ceded nothing) or else its first cession.
  const first = places.filter((r) => r.nation === n.id && r.first === 'yes').map((r) => Number(r.date.replaceAll('-', '')));
  const start = Math.min(...first, ...areas.map((a) => a.ds[0]));
  const steps = [...new Set([start, ...areas.map((a) => a.until)])].sort((x, y) => x - y);
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i];
    const held = areas.filter((a) => a.until > s);
    const geometry = fromPC(polygonClipping.union(...held.map((a) => toPC(a.f.geometry))));
    if (!geometry) continue;
    const pl = placeOf(n.id, s);
    treaty.push({ type: 'Feature', properties: {
      nation: n.id, name: n.name, s, e: dayBefore(steps[i + 1]), next: steps[i + 1], place: pl?.place ?? null, placeSrc: pl?.source ?? null,
      areas: held.map((a) => a.n).join(' '), ceded: areas.filter((a) => a.until === s).map((a) => a.n).join(' '),
      km2: Math.round(geoArea(geometry) * R2),
    }, geometry });
  }
  console.log(`treaty land, ${n.id}: ${steps.length - 1} boundaries, ${steps.map((d) => d).join(' ')}`);
}
// Where two nations' treaty lands overlap on the same days: the United States bought the same land from both.
const treatyX = [];
for (let i = 0; i < treaty.length; i++) for (let j = i + 1; j < treaty.length; j++) {
  const A = treaty[i].properties, B = treaty[j].properties;
  if (A.nation === B.nation) continue;
  const s = Math.max(A.s, B.s), e = Math.min(A.e, B.e);
  if (s > e) continue;
  const geometry = fromPC(polygonClipping.intersection(toPC(treaty[i].geometry), toPC(treaty[j].geometry)));
  if (!geometry) continue;
  const km2 = Math.round(geoArea(geometry) * R2);
  if (km2 < 50) continue; // slivers where two surveys of one line disagree
  treatyX.push({ type: 'Feature', properties: { a: A.nation, b: B.nation, s, e, km2 }, geometry });
}
console.log(`treaty land: ${treaty.length} dated boundaries, ${treatyX.length} overlaps between nations`);

let topo = topology({ aiannh: { type: 'FeatureCollection', features: aiannh }, icc: { type: 'FeatureCollection', features: icc },
  treaty: { type: 'FeatureCollection', features: treaty }, treatyX: { type: 'FeatureCollection', features: treatyX } }, 2e5);
topo = presimplify(topo);
topo = simplify(topo, 2e-5);
topo = quantize(topo, 2e5);
for (const arc of topo.arcs) for (const pt of arc) pt.length = 2;
const text = JSON.stringify(topo);
await writeFile(join(OUT, 'native-lands.topojson'), text);
console.log(`native-lands.topojson: ${aiannh.length} present-day areas, ${icc.length} judicially established areas, ${kb(text.length)}`);

if (problems.length) { console.error(`\n${problems.length} problem(s):\n  ${problems.join('\n  ')}`); process.exitCode = 1; }

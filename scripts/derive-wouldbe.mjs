#!/usr/bin/env node
// Parchment — derive-wouldbe.mjs: the would-be states of the North America page (statehood brief of 2026-11-18, item
// 8; the deck's Appendix A). Nothing is drawn by hand. Each row of data/us/wouldbe-states.csv names what a would-be
// state was made of and the line its own document drew, and this script computes the shape from downloaded ones:
//
// `base`, the land it starts from, on the row's `on` date (default: its start):
//   nb:ID[|ID]          the Newberry's state or territory polygons with these ids (data/us/newberry.topojson)
//   nb-us               every Newberry polygon in force: U.S. land, for a claim bounded by lines alone
//   nb-counties:ST      the Newberry's historical counties of state ST named in `counties` (its county files)
//   census-counties:FP  the Census Bureau's 2025 counties of the state with FIPS code FP named in `counties`
// `cut`, the line its document drew (the owner, 2026-11-18: "Cut along the documents' lines"), any of, joined by ";":
//   lat:A..B            between two parallels (either end may be left open: "lat:..34" is south of 34°N)
//   lon:X..Y            between two meridians, each a number or a Wikidata id whose point (P625, data/gazetteer.json)
//                       the meridian passes through ("lon:Q3064799..Q14714352")
//   river:NAME@W,S,E,N:SIDE   one side ("left" or "right", walking from its mouth, its easternmost end, to its head) of a
//                       river of Natural Earth's 1:10m lines with the North American supplement, the pieces of that name
//                       inside the box joined from the mouth up (as the Nueces cut, scripts/derive-us-disputes.mjs)
// The parallels are followed as parallels (the box's edges carry a point every tenth of a degree), so a cut along
// 34°N draws along 34°N on any projection.
//   node scripts/derive-wouldbe.mjs     (after node scripts/fetch-wouldbe.mjs; writes data/us/wouldbe.topojson)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoCentroid, geoDistance } from 'd3';
import { feature } from 'topojson-client';
import { topology } from 'topojson-server';
import { unzipSync } from 'fflate';
import * as shapefile from 'shapefile';
import polygonClipping from 'polygon-clipping';
import { parseCSV } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'wouldbe');
const KM2 = 6371 * 6371;

// ---------------------------------------------------------------- dates, with their precision (as derive-insular)
function when(text) {
  const t = String(text ?? '').trim();
  if (!t) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (m) { const d = Number(`${m[1]}${m[2]}${m[3]}`); return { first: d, last: d, precision: 'day', text: t }; }
  m = /^(\d{4})-(\d{2})$/.exec(t);
  if (m) { const days = new Date(Date.UTC(Number(m[1]), Number(m[2]), 0)).getUTCDate(); return { first: Number(`${m[1]}${m[2]}01`), last: Number(`${m[1]}${m[2]}${String(days).padStart(2, '0')}`), precision: 'month', text: t }; }
  m = /^(\d{4})$/.exec(t);
  if (m) return { first: Number(`${m[1]}0101`), last: Number(`${m[1]}1231`), precision: 'year', text: t };
  throw new Error(`a date the table cannot read: "${t}"`);
}

// ---------------------------------------------------------------- shapes
const rings = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
// polygon-clipping's exterior rings run counter-clockwise; d3 wants clockwise (a polygon smaller than a hemisphere)
const forD3 = (mp) => mp.map((poly) => poly.map((r) => [...r].reverse()));
const round = (mp) => mp.map((poly) => poly.map((r) => r.map(([x, y]) => [Math.round(x * 1e5) / 1e5, Math.round(y * 1e5) / 1e5])));
// polygon-clipping drops the points of a straight run, so a cut along a parallel comes out as one long segment, which
// d3 draws as a great circle (34°N from the Colorado to Texas bowed 14 km north). Each edge that runs along a parallel
// gets its points back, a tenth of a degree apart.
const alongParallels = (mp) => mp.map((poly) => poly.map((r) => {
  const out = [r[0]];
  for (let i = 1; i < r.length; i++) {
    const [x0, y0] = r[i - 1], [x1, y1] = r[i];
    const n = Math.abs(y1 - y0) < 1e-9 ? Math.floor(Math.abs(x1 - x0) / 0.1) : 0;
    for (let k = 1; k < n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0]);
    out.push(r[i]);
  }
  return out;
}));
const km2Of = (mp) => (mp.length ? geoArea({ type: 'MultiPolygon', coordinates: forD3(mp) }) * KM2 : 0);
const union = (list) => (list.length ? polygonClipping.union(...list) : []);

const nbTopo = JSON.parse(readFileSync(join(ROOT, 'data', 'us', 'newberry.topojson'), 'utf8'));
const nb = feature(nbTopo, nbTopo.objects.states).features;
const nbOn = (d) => nb.filter((f) => f.properties.s <= d && d <= f.properties.e);

const countyFiles = new Map();
async function nbCounties(st) {
  if (countyFiles.has(st)) return countyFiles.get(st);
  const zip = unzipSync(new Uint8Array(readFileSync(join(RAW, `${st}_AtlasHCB.zip`))));
  const part = (ext) => Object.entries(zip).find(([n]) => n.endsWith(`${st}_Historical_Counties${ext}`))?.[1];
  if (!part('.shp')) throw new Error(`no historical counties in ${st}_AtlasHCB.zip`);
  const src = await shapefile.open(part('.shp').buffer, part('.dbf').buffer, { encoding: 'utf-8' });
  const out = [];
  for (let r = await src.read(); !r.done; r = await src.read()) out.push(r.value);
  countyFiles.set(st, out);
  return out;
}
let census = null;
async function censusCounties() {
  if (census) return census;
  const zip = unzipSync(new Uint8Array(readFileSync(join(RAW, 'cb_2025_us_county_500k.zip'))));
  const part = (ext) => Object.entries(zip).find(([n]) => n.endsWith(ext))[1];
  const src = await shapefile.open(part('.shp').buffer, part('.dbf').buffer, { encoding: 'utf-8' });
  census = [];
  for (let r = await src.read(); !r.done; r = await src.read()) census.push(r.value);
  return census;
}
const gaz = JSON.parse(readFileSync(join(ROOT, 'data', 'gazetteer.json'), 'utf8'));
const lonOf = (v) => {
  if (/^Q\d+$/.test(v)) { const g = gaz[v]; if (!g) throw new Error(`${v} is not in data/gazetteer.json (node scripts/fetch-wouldbe.mjs)`); return g.lon; }
  return Number(v);
};

// A box between two parallels and two meridians, its edges along the parallels given a point every tenth of a degree.
function box(w, s, e, n) {
  const ring = [];
  for (let x = w; x < e; x = Math.min(e, x + 0.1)) ring.push([x, s]);
  ring.push([e, s]);
  for (let x = e; x > w; x = Math.max(w, x - 0.1)) ring.push([x, n]);
  ring.push([w, n], [w, s]);
  return [[ring]];
}

// ---------------------------------------------------------------- a river, joined from its mouth to its head
const KM_LAT = 110.57, kmLon = (lat) => 111.32 * Math.cos((lat * Math.PI) / 180);
const riverTopo = JSON.parse(readFileSync(join(ROOT, 'data', 'base', 'derived', 'rivers-na.topojson'), 'utf8'));
const riverLines = feature(riverTopo, riverTopo.objects.rivers).features;
function riverChain(name, [w, s, e, n]) {
  const inBox = ([x, y]) => x >= w && x <= e && y >= s && y <= n;
  const lines = riverLines.filter((f) => (f.properties.name ?? '').toLowerCase() === name.toLowerCase())
    .flatMap((f) => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates))
    .filter((l) => l.every(inBox));
  if (!lines.length) throw new Error(`no river "${name}" inside ${w},${s},${e},${n}`);
  const near = (p, q) => Math.abs(p[0] - q[0]) < 1e-3 && Math.abs(p[1] - q[1]) < 1e-3;
  const km = (path) => path.reduce((L, p, i) => (i ? L + geoDistance(path[i - 1], p) * 6371 : 0), 0);
  const longest = (cur, used) => {
    let best = [cur];
    lines.forEach((l, i) => {
      if (used.has(i)) return;
      const seg = near(l[0], cur) ? l : near(l[l.length - 1], cur) ? [...l].reverse() : null;
      if (!seg) return;
      const path = [...seg, ...longest(seg[seg.length - 1], new Set([...used, i])).slice(1)];
      if (km(path) > km(best)) best = path;
    });
    return best;
  };
  const mouth = lines.flatMap((l) => [l[0], l[l.length - 1]]).reduce((m, p) => (p[0] > m[0] ? p : m));
  const chain = longest(mouth, new Set());
  return { chain, km: Math.round(km(chain)), pieces: lines.length };
}
// A band of half-width `km` along a line: one quad per segment and one square per vertex, joined.
function band(line, km) {
  const parts = [];
  line.forEach(([x, y], i) => {
    const dx = km / kmLon(y), dy = km / KM_LAT;
    parts.push([[[x - dx, y - dy], [x + dx, y - dy], [x + dx, y + dy], [x - dx, y + dy], [x - dx, y - dy]]]);
    if (!i) return;
    const [x0, y0] = line[i - 1], kx = kmLon((y + y0) / 2);
    const ux = (x - x0) * kx, uy = (y - y0) * KM_LAT, len = Math.hypot(ux, uy) || 1;
    const ox = ((-uy / len) * km) / kx, oy = ((ux / len) * km) / KM_LAT;
    parts.push([[[x0 + ox, y0 + oy], [x + ox, y + oy], [x - ox, y - oy], [x0 - ox, y0 - oy], [x0 + ox, y0 + oy]]]);
  });
  return polygonClipping.union(...parts);
}
const JOIN_KM = 5;
// (planar, in degrees scaled by latitude: enough for a point a few kilometers from a border)
function closestOnSegment(p, a, b) {
  const kx = kmLon(p[1]);
  const ax = (b[0] - a[0]) * kx, ay = (b[1] - a[1]) * KM_LAT, px = (p[0] - a[0]) * kx, py = (p[1] - a[1]) * KM_LAT;
  const t = Math.max(0, Math.min(1, (px * ax + py * ay) / (ax * ax + ay * ay || 1)));
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function pointIn([x, y], poly) {
  let inside = false;
  for (const ring of poly) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// Which side of the line (mouth → head) a polygon lies on, by its vertex farthest from the line.
function nearestOn(p, line) {
  let out = null;
  const kx = kmLon(p[1]);
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i];
    const ax = (b[0] - a[0]) * kx, ay = (b[1] - a[1]) * KM_LAT, px = (p[0] - a[0]) * kx, py = (p[1] - a[1]) * KM_LAT;
    const t = Math.max(0, Math.min(1, (px * ax + py * ay) / (ax * ax + ay * ay || 1)));
    const q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const d = Math.hypot((p[0] - q[0]) * kx, (p[1] - q[1]) * KM_LAT);
    if (!out || d < out.d) out = { d, a, b, q };
  }
  return out;
}
function sideOf(poly, line) {
  let far = null;
  for (const p of poly[0]) { const nn = nearestOn(p, line); if (!far || nn.d > far.n.d) far = { p, n: nn }; }
  const { p, n } = far, kx = kmLon(p[1]);
  const sx = (n.b[0] - n.a[0]) * kx, sy = (n.b[1] - n.a[1]) * KM_LAT, vx = (p[0] - n.q[0]) * kx, vy = (p[1] - n.q[1]) * KM_LAT;
  return sx * vy - sy * vx > 0 ? 'left' : 'right';
}

// ---------------------------------------------------------------- the table
const table = parseCSV(readFileSync(join(ROOT, 'data', 'us', 'wouldbe-states.csv'), 'utf8'));
const col = Object.fromEntries(table[0].map((h, i) => [h.trim(), i]));
const features = [], problems = [];
for (const r of table.slice(1)) {
  const get = (c) => String(r[col[c]] ?? '').trim();
  const id = get('id');
  if (!id) continue;
  const list = (c) => get(c).split('|').map((x) => x.trim()).filter(Boolean);
  const start = when(get('start')), end = when(get('end'));
  if (!start) throw new Error(`${id}: no start`);
  const on = when(get('on'))?.first ?? start.first;
  const notes = [];
  // the land it starts from
  let polys = [], parents = [];
  const [kind, arg] = get('base').split(/:(.*)/s);
  if (kind === 'nb' || kind === 'nb-us') {
    const ids = kind === 'nb' ? new Set(arg.split('|')) : null;
    const hits = nbOn(on).filter((f) => !ids || ids.has(f.properties.id));
    if (ids) for (const x of ids) if (!hits.some((f) => f.properties.id === x)) throw new Error(`${id}: no Newberry polygon ${x} on ${on}`);
    polys = union(hits.map((f) => rings(f.geometry)));
    parents = hits.map((f) => ({ id: f.properties.id, v: f.properties.v, name: f.properties.full || f.properties.name, f }));
  } else if (kind === 'nb-counties' || kind === 'census-counties') {
    // (a would-be state across two states names its counties with the state: "CA:Siskiyou|OR:Curry")
    const states = arg.split('|');
    const want = list('counties').map((x) => (/^[A-Z]{2}:/.test(x) ? x : `${states[0]}:${x}`).toUpperCase());
    const rows = kind === 'nb-counties'
      ? (await Promise.all(states.map(nbCounties))).flat().filter((c) => c.properties.START_N <= on && on <= c.properties.END_N)
      : (await censusCounties()).filter((c) => states.includes(c.properties.STATEFP));
    const nameOf = (c) => (kind === 'nb-counties' ? `${c.properties.STATE}:${c.properties.NAME}` : `${states[0]}:${c.properties.NAME}`).toUpperCase();
    const hits = rows.filter((c) => want.includes(nameOf(c)));
    for (const w of want) if (!hits.some((c) => nameOf(c) === w)) throw new Error(`${id}: no county ${w} in ${get('base')} on ${on}`);
    polys = union(hits.map((c) => rings(c.geometry)));
    parents = hits.map((c) => (kind === 'nb-counties'
      ? { id: c.properties.ID, v: c.properties.VERSION, name: `${c.properties.FULL_NAME || c.properties.NAME} (${c.properties.STATE})`, start: c.properties.START_N, end: c.properties.END_N }
      : { id: c.properties.GEOID, name: `${c.properties.NAMELSAD} (${c.properties.STUSPS})` }));
  } else throw new Error(`${id}: base "${get('base')}" is not one this script reads`);
  // the document's line
  let cutText = [];
  for (const part of get('cut').split(';').map((x) => x.trim()).filter(Boolean)) {
    let m = /^lat:(-?[\d.]*)\.\.(-?[\d.]*)$/.exec(part);
    if (m) { polys = polygonClipping.intersection(polys, box(-179, m[1] ? Number(m[1]) : -10, -50, m[2] ? Number(m[2]) : 85)); cutText.push(part); continue; }
    m = /^lon:([-\w.]*)\.\.([-\w.]*)$/.exec(part);
    if (m) { polys = polygonClipping.intersection(polys, box(m[1] ? lonOf(m[1]) : -179, -10, m[2] ? lonOf(m[2]) : -50, 85)); cutText.push(`${part} (${m[1] ? lonOf(m[1]).toFixed(4) : ''}..${m[2] ? lonOf(m[2]).toFixed(4) : ''})`); continue; }
    // the separate parts west (or east) of a point: Jefferson's report divides Michigania from Cherronesus by Lake
    // Michigan, not by a meridian, and the lake is not land, so the band between 43° and 45° falls into its two shores
    m = /^parts-(west|east)-of:(Q\d+)$/.exec(part);
    if (m) {
      const x = lonOf(m[2]);
      polys = polys.filter((poly) => { const c = geoCentroid({ type: 'Polygon', coordinates: forD3([poly])[0] }); return m[1] === 'west' ? c[0] < x : c[0] > x; });
      cutText.push(`${part} (${gaz[m[2]].label}, ${x.toFixed(4)})`);
      continue;
    }
    m = /^river:([^@]+)@(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+):(left|right)$/.exec(part);
    if (m) {
      const rv = riverChain(m[1], [m[2], m[3], m[4], m[5]].map(Number));
      // A river line that stops inside the land (short of the coast at its mouth, short of a border at its head) would
      // leave the two sides joined: each such end is carried straight to the nearest point of the land's edge, when
      // that is within JOIN_KM, and the record says how far (Lincoln: the Colorado's line ends 1.6 km from the coast and
      // 2.0 km from the New Mexico line).
      const ends = [];
      const toEdge = (end) => {
        if (!polys.some((poly) => pointIn(end, poly))) return null;
        let best = null;
        for (const poly of polys) for (const ring of poly) for (let i = 1; i < ring.length; i++) {
          const q = closestOnSegment(end, ring[i - 1], ring[i]), d = geoDistance(q, end) * 6371;
          if (!best || d < best.d) best = { d, q };
        }
        if (!best || best.d > JOIN_KM) throw new Error(`${id}: the ${m[1]}'s line ends ${best ? best.d.toFixed(1) : '?'} km inside the land, more than ${JOIN_KM} km: no cut`);
        // (a hair past the edge, so that the band crosses it)
        return { d: best.d, q: [best.q[0] + (best.q[0] - end[0]) * 0.05, best.q[1] + (best.q[1] - end[1]) * 0.05] };
      };
      const atMouth = toEdge(rv.chain[0]), atHead = toEdge(rv.chain[rv.chain.length - 1]);
      if (atMouth) { rv.chain.unshift(atMouth.q); ends.push(`its mouth carried ${atMouth.d.toFixed(1)} km to the edge`); }
      if (atHead) { rv.chain.push(atHead.q); ends.push(`its head carried ${atHead.d.toFixed(1)} km to the edge`); }
      if (ends.length) notes.push(`Natural Earth's ${m[1]} stops short of the land's edge: ${ends.join(', ')}, straight to the nearest point.`);
      const pieces = polygonClipping.difference(polys, band(rv.chain, 0.05));
      const kept = pieces.filter((poly) => sideOf(poly, rv.chain) === m[6]);
      if (kept.length === pieces.length) notes.push(`The river does not split the land: all of it lies on one side.`);
      polys = kept;
      cutText.push(`${part} (Natural Earth's ${m[1]}, ${rv.km} km from its mouth to its head, ${rv.pieces} pieces)`);
      continue;
    }
    throw new Error(`${id}: cut "${part}" is not one this script reads`);
  }
  if (!polys.length) { problems.push(`${id}: nothing left after the cut`); continue; }
  const geometry = { type: 'MultiPolygon', coordinates: round(forD3(alongParallels(polys))) };
  const km2 = Math.round(km2Of(polys));
  // what it was cut from, and how much of each (the slip names them)
  const from = kind.startsWith('nb') && kind !== 'nb-counties'
    ? parents.map((p) => { const a = km2Of(polygonClipping.intersection(polys, rings(p.f.geometry))); return { id: p.id, v: p.v, name: p.name, km2: Math.round(a) }; }).filter((p) => p.km2 > 0)
    : parents;
  const props = {
    id, keys: list('keys'), name: get('name'), label: get('label') || get('name'), kind: get('kind'),
    s: start.first, e: end ? end.last : 99991231, start: start.text, end: end?.text ?? null,
    fuzzy: [...(start.precision !== 'day' ? [[start.first, start.last]] : []), ...(end && end.precision !== 'day' ? [[end.first, end.last]] : [])],
    on, base: get('base'), counties: list('counties'), cut: cutText.join('; '), from, km2,
    source: get('source'), note: [get('note'), ...notes].filter(Boolean).join(' '),
  };
  features.push({ type: 'Feature', properties: props, geometry });
  console.log(`${id.padEnd(28)} ${props.start}–${props.end ?? 'present'}  ${km2.toLocaleString('en-US').padStart(9)} km²  from ${from.map((p) => p.name).join(', ')}${notes.length ? `  (${notes.join(' ')})` : ''}`);
}
const out = topology({ wouldbe: { type: 'FeatureCollection', features } }, 1e5);
out._source = 'Computed by scripts/derive-wouldbe.mjs from the Newberry Library\'s Atlas of Historical County Boundaries (states and territories; county files), the Census Bureau\'s 2025 counties (public domain), Natural Earth\'s 1:10m rivers (public domain) and Wikidata coordinates (CC0), along the lines each would-be state\'s own document drew (data/us/wouldbe-states.csv). Nothing drawn.';
writeFileSync(join(ROOT, 'data', 'us', 'wouldbe.topojson'), `${JSON.stringify(out)}\n`);
console.log(`wouldbe: ${features.length} pieces → data/us/wouldbe.topojson${problems.length ? `\nproblems: ${problems.join(' | ')}` : ''}`);
if (problems.length) process.exit(1);

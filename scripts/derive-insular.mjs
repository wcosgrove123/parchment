#!/usr/bin/env node
// Parchment — derive-insular.mjs: the dated island-territory layer of the world page (statehood brief of 2026-11-18,
// item 7; the owner: "Shapes for all"). Nothing is drawn by hand. Each row of data/world/insular-areas.csv names a
// downloaded shape (scripts/fetch-insular.mjs), which of its islands, from when to when, how the United States held
// it, and the source of each date; this script cuts the shapes it names and writes data/world/insular.topojson.
//
// `shape` is one of
//   census:XX           the Census Bureau's polygon of a territory (PR, VI, GU, MP, AS), 2025, 1:500,000
//   ne0:AAA             Natural Earth's country AAA (ADM0_A3), 1:10m
//   ne1:Name            Natural Earth's first-level division of Japan of that name (Okinawa, Tokyo), 1:10m
//   cliopatria-in:AAA   Cliopatria's United States of America, in its row alive in `year` of the row's start or
//                       later, inside Natural Earth's country AAA (the Canal Zone inside Panama)
// narrowed, when `islands` lists Wikidata ids, to the parts that hold or lie within KM of each id's point (from the
// gazetteer, data/gazetteer.json; Natural Earth's unnamed minor islands are added where its country shape lacks one),
// and less the parts near `drop_islands`. A row whose islands find no part is written without a shape and listed.
//
// Dates: a day, a month or a year, as precise as the source the row cites. A start or end known only to the month or
// the year is kept with its precision: the layer draws the piece through the whole uncertain stretch, dashed (the
// grammar's approximate outline), and the packing slip says why.
//   node scripts/derive-insular.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoContains, geoDistance, geoCentroid } from 'd3';
import { feature } from 'topojson-client';
import { topology } from 'topojson-server';
import { unzipSync } from 'fflate';
import * as shapefile from 'shapefile';
import polygonClipping from 'polygon-clipping';
import { parseCSV } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'insular');
const KM2 = 6371 * 6371;
const NEAR_KM = 25; // an atoll's islets lie within this of its point
const HOLDS = ['territory', 'trust', 'administered', 'claim'];

// ---------------------------------------------------------------- dates, with their precision
// "1898-12-10" → { s: 18981210 }, "1951-09" → the whole month, "1925" → the whole year. As a start the stretch runs
// from its first day (drawn dashed to its last); as an end, to its last day (dashed from its first).
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

// ---------------------------------------------------------------- the downloaded shapes
const rings = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const forD3 = (mp) => mp.map((poly) => poly.map((r) => [...r].reverse()));
const asFeature = (polys) => ({ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: polys } });
const km2Of = (polys) => (polys.length ? geoArea(asFeature(polys)) * KM2 : 0);
// d3 wants a polygon smaller than a hemisphere: a ring wound the other way round is turned
const d3Poly = (poly) => { const f = { type: 'Polygon', coordinates: poly }; return geoArea(f) > 2 * Math.PI ? poly.map((r) => [...r].reverse()) : poly; };

const census = new Map();
{
  const zip = unzipSync(new Uint8Array(readFileSync(join(RAW, 'cb_2025_us_state_500k.zip'))));
  const part = (ext) => Object.entries(zip).find(([n]) => n.endsWith(ext))[1];
  const src = await shapefile.open(part('.shp').buffer, part('.dbf').buffer, { encoding: 'utf-8' });
  for (let r = await src.read(); !r.done; r = await src.read()) census.set(r.value.properties.STUSPS, r.value);
}
const ne0 = new Map(JSON.parse(readFileSync(join(RAW, 'ne_10m_admin_0_countries.geojson'), 'utf8')).features.map((f) => [f.properties.ADM0_A3, f]));
const ne1 = JSON.parse(readFileSync(join(RAW, 'ne_10m_admin_1_states_provinces.geojson'), 'utf8')).features.filter((f) => f.properties.adm0_a3 === 'JPN');
const minor = JSON.parse(readFileSync(join(RAW, 'ne_10m_minor_islands.geojson'), 'utf8')).features.flatMap((f) => rings(f.geometry));
const clioTopo = JSON.parse(readFileSync(join(ROOT, 'data', 'base', 'derived', 'cliopatria.topojson'), 'utf8'));
const clio = feature(clioTopo, clioTopo.objects.states).features.filter((f) => f.properties.n === 'United States of America');
const gaz = JSON.parse(readFileSync(join(ROOT, 'data', 'gazetteer.json'), 'utf8'));

function source(shape, startYear) {
  const [kind, key] = shape.split(':');
  if (kind === 'census') { const f = census.get(key); if (!f) throw new Error(`no Census polygon ${key}`); return { polys: rings(f.geometry).map(d3Poly), from: `U.S. Census Bureau, cartographic boundary file, States, 2025 (1:500,000): ${f.properties.NAME} (STATEFP ${f.properties.STATEFP})` }; }
  if (kind === 'ne0') { const f = ne0.get(key); if (!f) throw new Error(`no Natural Earth country ${key}`); return { polys: rings(f.geometry).map(d3Poly), from: `Natural Earth 1:10m countries: ${f.properties.NAME} (${key})`, withMinor: true }; }
  if (kind === 'ne1') { const f = ne1.find((x) => x.properties.name === key); if (!f) throw new Error(`no Natural Earth division ${key} in Japan`); return { polys: rings(f.geometry).map(d3Poly), from: `Natural Earth 1:10m states and provinces: ${f.properties.name} (Japan)`, withMinor: true }; }
  if (kind === 'cliopatria-in') {
    // (the first of Cliopatria's rows, from the start's year on, that holds land inside the country: its rows are by
    // year, and the one alive at the start may not have it yet, as 1900–1904 has no Canal Zone)
    const host = ne0.get(key);
    if (!host) throw new Error(`no Natural Earth country for ${shape}`);
    for (const row of clio.filter((f) => f.properties.t >= startYear).sort((a, b) => a.properties.f - b.properties.f)) {
      const inside = polygonClipping.intersection(rings(row.geometry), rings(host.geometry));
      if (inside.length) return { polys: forD3(inside).map(d3Poly), from: `Cliopatria (Seshat), United States of America, its row of ${row.properties.f}–${row.properties.t}, inside Natural Earth 1:10m ${host.properties.NAME}` };
    }
    return { polys: [], from: `Cliopatria (Seshat): no row of the United States of America from ${startYear} holds land inside ${host.properties.NAME}` };
  }
  throw new Error(`unknown shape "${shape}"`);
}

// The parts of a shape near a point: those that hold it, or whose nearest vertex lies within NEAR_KM of it.
function nearKm(poly, [lon, lat]) {
  if (geoContains({ type: 'Polygon', coordinates: poly }, [lon, lat])) return 0;
  let best = Infinity;
  for (const [x, y] of poly[0]) best = Math.min(best, geoDistance([x, y], [lon, lat]) * 6371);
  return best;
}
const pointOf = (q) => { const g = gaz[q]; if (!g) throw new Error(`${q} is not in data/gazetteer.json (run node scripts/fetch-insular.mjs)`); return [g.lon, g.lat]; };

// ---------------------------------------------------------------- the table
const table = parseCSV(readFileSync(join(ROOT, 'data', 'world', 'insular-areas.csv'), 'utf8'));
const col = Object.fromEntries(table[0].map((h, i) => [h.trim(), i]));
const features = [], missing = [];
for (const r of table.slice(1)) {
  const get = (c) => String(r[col[c]] ?? '').trim();
  const id = get('id');
  if (!id) continue;
  const hold = get('hold');
  if (!HOLDS.includes(hold)) throw new Error(`${id}: hold "${hold}" is not one of ${HOLDS.join(', ')}`);
  const start = when(get('start')), end = when(get('end'));
  if (!start) throw new Error(`${id}: no start`);
  const list = (c) => get(c).split('|').map((x) => x.trim()).filter(Boolean);
  const src = source(get('shape'), Math.trunc(start.first / 10000));
  let polys = src.polys;
  const named = list('islands'), dropped = list('drop_islands');
  const notes = [];
  if (named.length) {
    const pool = src.withMinor ? [...polys, ...minor.map(d3Poly)] : polys;
    const keep = new Set(), none = [];
    for (const q of named) {
      const pt = pointOf(q);
      const hits = pool.filter((p) => nearKm(p, pt) <= NEAR_KM);
      if (!hits.length) none.push(`${gaz[q]?.label ?? q} (${q})`);
      for (const p of hits) keep.add(p);
    }
    if (none.length) notes.push(`Not drawn, for want of a shape (no part of the downloaded one within ${NEAR_KM} km of the point): ${none.length > 1 ? `${none.slice(0, -1).join(', ')} and ${none.at(-1)}` : none[0]}.`);
    polys = [...keep];
  }
  if (dropped.length) polys = polys.filter((p) => !dropped.some((q) => nearKm(p, pointOf(q)) <= NEAR_KM));
  // `occupied`: "FROM/TO|BY", a stretch another power held the piece by force while U.S. sovereignty stood (Guam,
  // 1941–1944): the map draws the sovereignty and the packing slip warns on those dates.
  let occupied = null;
  if (get('occupied')) {
    const m = /^([^/|]+)\/([^/|]+)\|(.+)$/.exec(get('occupied'));
    if (!m) throw new Error(`${id}: occupied "${get('occupied')}" is not FROM/TO|BY`);
    occupied = { s: when(m[1]).first, e: when(m[2]).last, by: m[3].trim(), text: `${m[1]}–${m[2]}` };
  }
  const props = {
    // label: the name printed on the map, when shorter than the record's (the trust territory's four pieces share one)
    id, keys: list('keys'), name: get('name'), label: get('label') || get('name'), hold,
    s: start.first, e: end ? end.last : 99991231, start: start.text, end: end?.text ?? null,
    // the stretches the record cannot place to the day: drawn, but dashed
    fuzzy: [...(start.precision !== 'day' ? [[start.first, start.last]] : []), ...(end && end.precision !== 'day' ? [[end.first, end.last]] : [])],
    shape: src.from, islands: named, drop_islands: dropped, source: get('source'), note: [get('note'), ...notes].filter(Boolean).join(' '),
    occupied,
  };
  if (!polys.length) { missing.push(`${id} (${props.name}): ${notes.join(' ') || 'no shape'}`); continue; }
  props.km2 = Math.round(km2Of(polys) * 10) / 10;
  features.push({ type: 'Feature', properties: props, geometry: { type: 'MultiPolygon', coordinates: polys } });
  console.log(`${id.padEnd(22)} ${props.start}–${props.end ?? 'present'}  ${props.hold.padEnd(12)} ${String(polys.length).padStart(3)} parts  ${props.km2.toLocaleString('en-US')} km²${notes.length ? `  (${notes.join(' ')})` : ''}`);
}
const out = topology({ insular: { type: 'FeatureCollection', features } }, 1e6);
out._source = 'Computed by scripts/derive-insular.mjs from the U.S. Census Bureau\'s 2025 cartographic boundary file (public domain), Natural Earth 1:10m (public domain), Cliopatria (Seshat, CC BY 4.0) and Wikidata coordinates (CC0), dated by data/world/insular-areas.csv. Nothing drawn.';
mkdirSync(join(ROOT, 'data', 'world'), { recursive: true });
writeFileSync(join(ROOT, 'data', 'world', 'insular.topojson'), `${JSON.stringify(out)}\n`);
console.log(`insular: ${features.length} dated pieces → data/world/insular.topojson${missing.length ? `\nnot drawn (no shape found): ${missing.join(' | ')}` : ''}`);

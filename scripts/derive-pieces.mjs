#!/usr/bin/env node
// Parchment — derive-pieces.mjs: how the land of each state became U.S. land (statehood brief of 2026-11-18, item 5;
// the deck outline's Taxonomy 1: Won, Bought, Split, Joined, Claimed). Nothing is drawn by hand: every piece is computed
// from the Newberry's own polygons (data/us/newberry.topojson), and the table data/us/acquisitions.csv only names and
// labels the days on which they show the United States growing.
//
//   A piece is the land that became U.S. land on an acquisition day: the union of the Newberry's U.S. polygons alive
//   that day, minus the union alive the day before, outside the 1783 domain (every polygon alive on 3 September 1783).
//   Land that entered, left and entered again is credited to its last entry (the Texas Panhandle: Louisiana 1803,
//   given up 1819, Texas 1845). The pieces are dated: for every stretch of days on which the U.S. union is the same,
//   each piece is the land credited to it by then and still U.S. land then, so a map of any date shows its own pieces.
//   A day with two rows in the table (22 February 1819: Florida, and the Adams-Onís line in the Rockies) is sorted by
//   the Newberry polygon that holds each part of the day's gain (`within`: fl_uft, mo_terr), not by a drawn box.
//   Every day on which the U.S. union grows must have a row, or the script stops and names the day.
//
// Usage: node scripts/derive-pieces.mjs   (a few minutes; writes data/us/pieces.topojson)
//   reads data/us/newberry.topojson, data/us/acquisitions.csv; compares today's shares with
//   tests/maps/statehood/pieces-oracle.csv (the deck session's result, from its brief, for checking).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoLength } from 'd3';
import { feature } from 'topojson-client';
import { topology } from 'topojson-server';
import polygonClipping from 'polygon-clipping';
import { parseCSV } from '../src/data/records.js';
import { parseDate } from '../src/us/dates.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KM2 = 6371 * 6371;
const OPEN = 99991231, FIRST = 17830903;
const MIN_KM2 = 5, MIN_KM = 0.2; // a part smaller, or thinner (area over perimeter), is a seam between two versions of a border
const MIN_CHANGE_KM2 = 500; // a day on which the union grows or shrinks by less is a redrawn border, not land gained or lost

const t0 = Date.now();
const topo = JSON.parse(readFileSync(join(ROOT, 'data', 'us', 'newberry.topojson'), 'utf8'));
const nb = feature(topo, topo.objects.states).features;
const rings = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
// polygon-clipping returns exterior rings counter-clockwise; d3-geo wants them clockwise (smaller than a hemisphere)
const forD3 = (mp) => mp.map((poly) => poly.map((r) => [...r].reverse()));
const toPC = (mp) => mp.map((poly) => poly.map((r) => [...r].reverse()));
const kmOf = (mp) => (mp.length ? geoArea({ type: 'MultiPolygon', coordinates: forD3(mp) }) * KM2 : 0);
// keep the parts that are land, not seams
const clean = (mp) => mp.filter((poly) => {
  const g = { type: 'Polygon', coordinates: poly.map((r) => [...r].reverse()) };
  const km2 = geoArea(g) * KM2;
  return km2 >= MIN_KM2 && km2 < 2 * Math.PI * KM2 && km2 / (geoLength(g) * 6371) >= MIN_KM;
});
const nextDay = (d) => { const t = new Date(Date.UTC(Math.trunc(d / 10000), (Math.trunc(d / 100) % 100) - 1, (d % 100) + 1)); return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate(); };
const prevDay = (d) => { const t = new Date(Date.UTC(Math.trunc(d / 10000), (Math.trunc(d / 100) % 100) - 1, (d % 100) - 1)); return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate(); };
const iso = (d) => `${Math.trunc(d / 10000)}-${String(Math.trunc(d / 100) % 100).padStart(2, '0')}-${String(d % 100).padStart(2, '0')}`;
const isUS = (f) => f.properties.power === 'us';
const alive = (d) => nb.filter((f) => f.properties.s <= d && d <= f.properties.e);
const union = (fs) => (fs.length ? polygonClipping.union(...fs.map(rings)) : []);

// ---------------------------------------------------------------- the table
const table = parseCSV(readFileSync(join(ROOT, 'data', 'us', 'acquisitions.csv'), 'utf8'));
const head = table[0].map((h) => h.trim());
const col = Object.fromEntries(head.map((h, i) => [h, i]));
const rows = table.slice(1).filter((r) => r.length > 1 && r[col.key]).map((r) => {
  const get = (c) => (r[col[c]] ?? '').trim();
  const d = parseDate(get('date'));
  if (d == null) throw new Error(`acquisitions.csv: ${get('key')} has no readable date`);
  return { key: get('key'), date: d, within: get('within') || null, label: get('label') || null, name: get('name'), instrument: get('instrument'), from: get('from'), source: get('source'), note: get('note') };
});
const LABELS = new Set(['won', 'bought', 'split', 'joined', 'claimed']);
for (const r of rows) if (r.label && !LABELS.has(r.label)) throw new Error(`acquisitions.csv: ${r.key} has label "${r.label}", not one of ${[...LABELS].join(', ')}`);
const treaty = rows.find((r) => r.date === FIRST);
if (!treaty) throw new Error('acquisitions.csv: no row for the founding domain (1783-09-03)');

// ---------------------------------------------------------------- the U.S. union on every day it can change
// The set of U.S. polygons alive changes only on a polygon's first day and on the day after its last, so the union
// is the same from one of those days to the next; it is computed once for each.
const days = new Set([FIRST]);
for (const f of nb.filter(isUS)) { if (f.properties.s > FIRST) days.add(f.properties.s); if (f.properties.e < OPEN) days.add(nextDay(f.properties.e)); }
const dayList = [...days].sort((a, b) => a - b);
const usUnion = new Map();
for (const d of dayList) usUnion.set(d, union(alive(d).filter(isUS)));
const dom1783 = union(alive(FIRST));
console.log(`the U.S. union on ${dayList.length} days computed (${((Date.now() - t0) / 1000).toFixed(0)} s)`);

// Days the union grows (outside the 1783 domain) or shrinks.
const gainOn = new Map(), lossDays = [];
for (let i = 1; i < dayList.length; i++) {
  const d = dayList[i], before = usUnion.get(dayList[i - 1]), now = usUnion.get(d);
  const gained = clean(polygonClipping.difference(now, before, dom1783));
  const lost = clean(polygonClipping.difference(before, now));
  if (kmOf(gained) >= MIN_CHANGE_KM2) gainOn.set(d, gained);
  if (kmOf(lost) >= MIN_CHANGE_KM2) lossDays.push(d);
}
console.log(`grows on ${[...gainOn.keys()].map(iso).join(', ')}`);
console.log(`shrinks on ${lossDays.map(iso).join(', ') || 'no day'}`);
for (const d of gainOn.keys()) if (!rows.some((r) => r.date === d)) throw new Error(`the U.S. union grows on ${iso(d)} (+${Math.round(kmOf(gainOn.get(d))).toLocaleString('en-US')} km²) and data/us/acquisitions.csv has no row for that day`);
for (const r of rows) if (r !== treaty && !gainOn.has(r.date)) throw new Error(`acquisitions.csv: ${r.key} (${iso(r.date)}) is not a day on which the Newberry's U.S. land grows`);

// Each acquisition's gain; a day with several rows is sorted by the Newberry polygon that holds each part.
const gained = new Map();
for (const d of gainOn.keys()) {
  const here = rows.filter((r) => r.date === d);
  if (here.length === 1) { gained.set(here[0].key, gainOn.get(d)); continue; }
  for (const r of here) if (!r.within) throw new Error(`acquisitions.csv: ${iso(d)} has several rows, and ${r.key} names no polygon in "within"`);
  const holders = here.map((r) => ({ r, geom: union(alive(d).filter((f) => f.properties.id === r.within)) }));
  const parts = new Map(here.map((r) => [r.key, []]));
  for (const poly of gainOn.get(d)) {
    const scored = holders.map((h) => ({ key: h.r.key, km2: kmOf(polygonClipping.intersection([poly], h.geom)) })).sort((a, b) => b.km2 - a.km2);
    if (!scored[0].km2) throw new Error(`${iso(d)}: a part of the day's gain lies in none of ${here.map((r) => r.within).join(', ')}`);
    parts.get(scored[0].key).push(poly);
  }
  for (const [k, ps] of parts) gained.set(k, ps);
}

// ---------------------------------------------------------------- the pieces, for every stretch of days
const order = rows.filter((r) => r !== treaty).sort((a, b) => a.date - b.date);
const epochs = [...new Set([FIRST, ...gainOn.keys(), ...lossDays])].sort((a, b) => a - b);
const features = [];
epochs.forEach((E, i) => {
  const until = i + 1 < epochs.length ? prevDay(epochs[i + 1]) : OPEN;
  // (the union of the day E holds for the whole stretch: the U.S. land changes only on the days in `epochs`)
  const UE = usUnion.get(E);
  const put = (r, mp) => {
    const geom = clean(mp);
    const km2 = kmOf(geom);
    if (km2 < MIN_KM2) return;
    features.push({ type: 'Feature', properties: { key: r.key, label: r.label, s: E, e: until, km2: Math.round(km2) }, geometry: { type: 'MultiPolygon', coordinates: forD3(geom) } });
  };
  put(treaty, polygonClipping.intersection(dom1783, UE));
  const known = order.filter((r) => r.date <= E);
  known.forEach((r, j) => {
    const later = known.slice(j + 1).filter((x) => x.date > r.date).map((x) => gained.get(x.key)).filter((g) => g.length);
    const own = later.length ? polygonClipping.difference(gained.get(r.key), ...later) : gained.get(r.key);
    put(r, polygonClipping.intersection(own, UE));
  });
  console.log(`${iso(E)} to ${until === OPEN ? 'the present' : iso(until)}: ${features.filter((f) => f.properties.s === E).map((f) => `${f.properties.key} ${f.properties.km2.toLocaleString('en-US')}`).join(' · ')}`);
});

// ---------------------------------------------------------------- today's states, by piece
const last = features.filter((f) => f.properties.e === OPEN);
const today = nb.filter((f) => f.properties.e === OPEN && (f.properties.type === 'State' || f.properties.type === 'District of Columbia'));
const flatBox = (mp) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const poly of mp) for (const [x, y] of poly[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
const meets = (p, q) => p[0] <= q[2] && q[0] <= p[2] && p[1] <= q[3] && q[1] <= p[3];
const shares = today.map((st) => {
  const total = geoArea(st) * KM2;
  const box = flatBox(rings(st));
  const parts = [];
  for (const pc of last) {
    if (!meets(box, flatBox(pc.geometry.coordinates))) continue;
    let km2 = 0;
    try { km2 = kmOf(polygonClipping.intersection(rings(st), toPC(pc.geometry.coordinates))); } catch { km2 = 0; }
    if (km2 / total >= 0.0005) parts.push({ key: pc.properties.key, label: pc.properties.label, km2: Math.round(km2), share: Math.round((km2 / total) * 10000) / 10000 });
  }
  parts.sort((a, b) => b.km2 - a.km2);
  const covered = parts.reduce((s, p) => s + p.km2, 0);
  return { id: st.properties.id, name: st.properties.full || st.properties.name, km2: Math.round(total), pieces: parts, uncovered: Math.round((1 - covered / total) * 10000) / 10000 };
}).sort((a, b) => a.name.localeCompare(b.name));

const out = topology({ pieces: { type: 'FeatureCollection', features } }, 2e5);
out._source = 'Computed by scripts/derive-pieces.mjs from data/us/newberry.topojson (The Newberry Library, Atlas of Historical County Boundaries) and the days named in data/us/acquisitions.csv: each piece is land the U.S. polygons gained on one day, outside the 1783 domain, credited to its last entry, dated by the stretch of days on which the U.S. union is the same. Nothing drawn.';
out.acquisitions = rows.map((r) => ({ key: r.key, date: iso(r.date), label: r.label, name: r.name, instrument: r.instrument, from: r.from, source: r.source, note: r.note, within: r.within }));
out.shares = { as_of: 'the states in force on the Newberry\'s last day, held open to the present', states: shares };
writeFileSync(join(ROOT, 'data', 'us', 'pieces.topojson'), `${JSON.stringify(out)}\n`);
console.log(`pieces: ${features.length} dated pieces in ${epochs.length} stretches → data/us/pieces.topojson (${((Date.now() - t0) / 1000).toFixed(0)} s)`);

// ---------------------------------------------------------------- against the deck session's result
const oracleFile = join(ROOT, 'tests', 'maps', 'statehood', 'pieces-oracle.csv');
if (existsSync(oracleFile)) {
  const o = parseCSV(readFileSync(oracleFile, 'utf8'));
  const oh = Object.fromEntries(o[0].map((h, i) => [h.trim(), i]));
  const want = new Map();
  for (const r of o.slice(1)) if (r[oh.state]) { const m = want.get(r[oh.state]) ?? new Map(); m.set(r[oh.piece], Number(r[oh.share])); want.set(r[oh.state], m); }
  let worst = 0, n = 0;
  for (const s of shares) {
    const w = want.get(s.name);
    if (!w) { console.log(`  ${s.name}: not in the oracle`); continue; }
    const keys = new Set([...w.keys(), ...s.pieces.map((p) => p.key)]);
    for (const k of keys) {
      const a = s.pieces.find((p) => p.key === k)?.share ?? 0, b = w.get(k) ?? 0;
      const dd = Math.abs(a - b);
      worst = Math.max(worst, dd); n++;
      if (dd > 0.005) console.log(`  ${s.name} ${k}: ${(a * 100).toFixed(1)}% here, ${(b * 100).toFixed(1)}% in the oracle`);
    }
  }
  console.log(`against the oracle: ${n} shares compared, the largest difference ${(worst * 100).toFixed(2)} points`);
}

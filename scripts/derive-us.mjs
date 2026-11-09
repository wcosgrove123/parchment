#!/usr/bin/env node
// Parchment — derive-us.mjs
// Turns the North America downloads (data/base/raw/{newberry,ohm,usfs}) into small TopoJSON for the browser
// (data/us/). Clips to the stage's box, fixes ring winding for d3, simplifies; never moves a vertex by hand.
// Attributes written here: dates as YYYYMMDD integers, and which power holds each polygon (src/us/powers.json).
//
//   data/us/newberry.topojson   U.S. states and territories, 1783-09-03 → (2000-12-31, held open to the present)
//   data/us/ohm.topojson        OpenHistoricalMap colonies, provinces, countries and Native nations, 1492 →
//   data/us/cessions.topojson   Royce land cessions, 1784–1894
//   data/us/native.topojson     Native homelands from historical-basemaps' 1492–1715 snapshots, until 1783-09-03
//   data/us/index.json          counts, change dates, unmatched names, settings
//
// Usage: node scripts/derive-us.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as shapefile from 'shapefile';
import osmtogeojson from 'osmtogeojson';
import { geoArea, geoContains, geoCentroid, geoBounds, geoDistance } from 'd3';
import polygonClipping from 'polygon-clipping';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { quantize } from 'topojson-client';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw');
const OUT = join(ROOT, 'data', 'us');
await mkdir(OUT, { recursive: true });

// The stage box plus the Alaska and Hawaii insets. Anything outside is cut off before simplifying.
const CLIP = { west: -180, east: -50, south: 8, north: 75 };
const SETTINGS = {
  newberry: { minWeight: 4e-5, quantization: 2e5 },
  ohm: { minWeight: 1.5e-4, quantization: 2e5 },
  cessions: { minWeight: 4e-5, quantization: 2e5 },
};
const NEWBERRY_LAST = 20001231; // the dataset's last day
const OPEN = 99991231;          // "still in force"
const US_FROM = 17830903;       // Newberry's first day: from here the U.S. is drawn from Newberry, not OHM

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const powers = JSON.parse(await readFile(join(ROOT, 'src', 'us', 'powers.json'), 'utf8'));
const rules = powers.rules.map((r) => ({ ...r, re: new RegExp(r.match, 'i') }));

// ---------------------------------------------------------------- geometry helpers
// Sutherland–Hodgman against the lon/lat box, one edge at a time (planar, in degrees).
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
  if (pts.length < 3) return null;
  return [...pts, pts[0]];
}
function at(a, b, axis, v) {
  const t = (v - a[axis]) / (b[axis] - a[axis]);
  return axis === 0 ? [v, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), v];
}
const polygonsOf = (g) => (!g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
// Clip, drop slivers, and wind every ring the way d3-geo expects (a polygon smaller than a hemisphere).
function prepare(geometry) {
  const polys = [];
  for (const poly of polygonsOf(geometry)) {
    const outer = clipRing(poly[0]);
    if (!outer) continue;
    const holes = poly.slice(1).map(clipRing).filter(Boolean);
    let p = [outer, ...holes];
    if (geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI) p = p.map((r) => r.slice().reverse());
    if (geoArea({ type: 'Polygon', coordinates: [p[0]] }) < 1e-9) continue;
    polys.push(p);
  }
  if (!polys.length) return null;
  return polys.length === 1 ? { type: 'Polygon', coordinates: polys[0] } : { type: 'MultiPolygon', coordinates: polys };
}
// A point inside the largest polygon: its centroid when that lies inside, else the nearest inside point on a grid.
function repPoint(geometry) {
  let best = null, bestA = -1;
  for (const p of polygonsOf(geometry)) { const g = { type: 'Polygon', coordinates: p }; const a = geoArea(g); if (a > bestA) { bestA = a; best = g; } }
  if (!best) return null;
  const c = geoCentroid(best);
  if (geoContains(best, c)) return c;
  const [[x0, y0], [x1, y1]] = geoBounds(best);
  for (const n of [12, 40]) {
    let pick = null, d = Infinity;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const p = [x0 + ((x1 - x0) * (i + 0.5)) / (n + 1), y0 + ((y1 - y0) * (j + 0.5)) / (n + 1)];
      if (!geoContains(best, p)) continue;
      const dd = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
      if (dd < d) { d = dd; pick = p; }
    }
    if (pick) return pick;
  }
  return best.coordinates[0][0];
}
function buildTopo(objects, { minWeight, quantization }) {
  let topo = topology(objects, quantization);
  topo = presimplify(topo);
  topo = simplify(topo, minWeight);
  topo = quantize(topo, quantization);
  for (const arc of topo.arcs) for (const pt of arc) pt.length = 2;
  return topo;
}
// OHM dates: "1492-10-12", "1493-11", "1535", "-0200" → YYYYMMDD integer (negative for BCE).
function ymd(s, end = false) {
  if (!s) return end ? OPEN : null;
  const m = String(s).trim().match(/^(-?)(\d{1,4})(?:-(\d\d))?(?:-(\d\d))?/);
  if (!m) return end ? OPEN : null;
  const y = Number(m[2]) * (m[1] ? -1 : 1);
  const mo = Number(m[3] ?? 1), d = Number(m[4] ?? 1);
  return y * 10000 + Math.sign(y || 1) * (mo * 100 + d);
}
const index = { generated: new Date().toISOString(), settings: SETTINGS, clip: CLIP, layers: {} };

// ---------------------------------------------------------------- 1. Newberry
console.log('Newberry states and territories');
const nbDir = join(RAW, 'newberry', 'StateTerr');
const nbFeatures = [];
{
  const src = await shapefile.open(join(nbDir, 'US_HistStateTerr_Gen001.shp'), join(nbDir, 'US_HistStateTerr_Gen001.dbf'), { encoding: 'windows-1252' });
  for (let r = await src.read(); !r.done; r = await src.read()) {
    const f = r.value, p = f.properties;
    const geometry = prepare(f.geometry);
    if (!geometry) continue;
    const e = p.END_N >= NEWBERRY_LAST ? OPEN : p.END_N;
    nbFeatures.push({
      type: 'Feature',
      properties: {
        id: p.ID, v: p.VERSION, name: p.NAME, full: p.FULL_NAME, abbr: p.ABBR_NAME, type: p.TERR_TYPE,
        s: p.START_N, e, power: p.TERR_TYPE === 'Other' ? powers.newberry_other : 'us',
        change: p.CHANGE, cite: p.CITATION,
      },
      geometry,
    });
  }
}
// Containment tests, with a bounding-box check first (geoContains walks every vertex).
const boxes = new WeakMap();
const boxOf = (f) => { let b = boxes.get(f); if (!b) { b = geoBounds(f); boxes.set(f, b); } return b; };
const inBox = (f, [x, y]) => { const [[x0, y0], [x1, y1]] = boxOf(f); return y >= y0 && y <= y1 && (x0 <= x1 ? x >= x0 && x <= x1 : x >= x0 || x <= x1); };
const contains = (f, pt) => inBox(f, pt) && geoContains(f, pt);
// Inside the land Newberry draws on a date (its states and territories, and its disputed and joint areas).
const nbAlive = (d) => nbFeatures.filter((f) => f.properties.s <= d && d <= f.properties.e);
const inUS = (pt, d) => nbAlive(d).some((f) => contains(f, pt));
{
  const topo = buildTopo({ states: { type: 'FeatureCollection', features: nbFeatures } }, SETTINGS.newberry);
  const text = JSON.stringify(topo);
  await writeFile(join(OUT, 'newberry.topojson'), text);
  const changes = [...new Set(nbFeatures.map((f) => f.properties.s))].sort((a, b) => a - b);
  index.layers.newberry = { file: 'newberry.topojson', bytes: text.length, features: nbFeatures.length, first: changes[0], last: NEWBERRY_LAST, held_open_to_present: true, change_dates: changes };
  console.log(`  ${nbFeatures.length} polygons, ${changes.length} change dates, ${kb(text.length)}`);
}

// ---------------------------------------------------------------- 2. OpenHistoricalMap
console.log('OpenHistoricalMap');
const osm = JSON.parse(await readFile(join(RAW, 'ohm', 'ohm-geometry.json'), 'utf8'));
const relTags = new Map(osm.elements.filter((e) => e.type === 'relation').map((e) => [e.id, e.tags ?? {}]));
const gj = osmtogeojson(osm, { flatProperties: true });
osm.elements = null;
const ohm = [];
const skipped = { noStart: [], empty: 0, notArea: 0 };
for (const f of gj.features) {
  if (!String(f.id).startsWith('relation/')) continue;
  if (!/Polygon/.test(f.geometry?.type)) { skipped.notArea++; continue; }
  const rid = Number(String(f.id).split('/')[1]);
  const t = relTags.get(rid) ?? {};
  const s = ymd(t.start_date), e = ymd(t.end_date, true);
  if (s == null) { skipped.noStart.push(t.name); continue; }
  if (e < 14920101) continue; // gone before the stage's span
  const geometry = prepare(f.geometry);
  if (!geometry) { skipped.empty++; continue; }
  ohm.push({
    type: 'Feature',
    properties: {
      rid, name: t['name:en'] || t.name || '', local: t['name:en'] && t.name !== t['name:en'] ? t.name : undefined,
      lvl: t.boundary === 'aboriginal_lands' ? 'ab' : Number(t.admin_level), s, e, wd: t.wikidata, start_raw: t.start_date, end_raw: t.end_date,
    },
    geometry,
  });
}
console.log(`  ${ohm.length} polygons kept (${skipped.noStart.length} without a start date, ${skipped.empty} outside the box, ${skipped.notArea} not areas)`);

// Powers. Rules give a list of [from, power] segments over a feature's life.
function ruleSegments(name, local, s, e) {
  const names = [name, local].filter(Boolean);
  const cuts = new Set([s]);
  for (const r of rules) { if (r.from && r.from > s && r.from < e) cuts.add(r.from); if (r.to && r.to > s && r.to < e) cuts.add(r.to); }
  const segs = [];
  for (const c of [...cuts].sort((a, b) => a - b)) {
    const hit = rules.find((r) => names.some((n) => r.re.test(n)) && (!r.from || c >= r.from) && (!r.to || c < r.to));
    const p = hit ? hit.power : null;
    if (!segs.length || segs[segs.length - 1][1] !== p) segs.push([c, p]);
  }
  return segs;
}
for (const f of ohm) f.properties.pt = repPoint(f.geometry);
const level2 = ohm.filter((f) => f.properties.lvl === 2 || f.properties.lvl === 'ab');
for (const f of level2) f.properties.pw = ruleSegments(f.properties.name, f.properties.local, f.properties.s, f.properties.e);
const unmatched = new Map();
for (const f of ohm) {
  const p = f.properties;
  if (p.lvl === 2 || p.lvl === 'ab') continue;
  // Provinces: the power of the level-2 polygon that contains them on each day (the most recently begun one when
  // several do), and the province's own rules on days when none does. A host's power ends when the host ends.
  const hosts = level2.filter((g) => g.properties.s < p.e && g.properties.e > p.s && p.pt && contains(g, p.pt));
  const own = ruleSegments(p.name, p.local, p.s, p.e);
  const cuts = new Set([p.s]);
  for (const g of hosts) {
    for (const d of [g.properties.s, g.properties.e, ...g.properties.pw.map(([from]) => from)]) if (d > p.s && d < p.e) cuts.add(d);
  }
  for (const [from] of own) if (from > p.s && from < p.e) cuts.add(from);
  const segs = [];
  for (const c of [...cuts].sort((a, b) => a - b)) {
    const live = hosts.filter((g) => g.properties.s <= c && c < g.properties.e).sort((a, b) => b.properties.s - a.properties.s);
    let pw = null;
    for (const g of live) { pw = segAt(g.properties.pw, c); if (pw) break; }
    if (!pw) pw = segAt(own, c);
    if (!segs.length || segs[segs.length - 1][1] !== pw) segs.push([c, pw]);
  }
  p.pw = segs;
}
function segAt(segs, d) { let out = null; for (const [from, pw] of segs) if (from <= d) out = pw; return out; }
for (const f of ohm) {
  const p = f.properties;
  p.pw = (p.pw ?? []).map(([d, pw]) => [d, pw ?? 'other']);
  if (!p.pw.length) p.pw = [[p.s, 'other']];
  if (p.pw.every((x) => x[1] === 'other')) unmatched.set(p.name, (unmatched.get(p.name) ?? 0) + 1);
}
// Inside the United States after the Treaty of Paris, Newberry draws the land; OHM's copies of U.S. states and
// territories are hidden from that day on. Disputes, rebellions and Native nations stay: they are drawn on top.
let hiddenUS = 0;
for (const f of ohm) {
  const p = f.properties;
  if (p.e <= US_FROM || !p.pt) continue;
  // Only a country-level polygon that is itself a dispute, a rebellion or a Native nation stays; a province that
  // merely sits inside one (a U.S. state inside the Confederacy) is Newberry's to draw.
  const keep = (p.lvl === 2 || p.lvl === 'ab') && p.pw.some(([, pw]) => pw === 'disputed' || pw === 'rebellion' || pw === 'native');
  if (keep) continue;
  const d = Math.max(p.s, US_FROM);
  if (p.pw.some(([, pw]) => pw === 'us') || inUS(p.pt, d)) { p.us = 1; hiddenUS++; }
}
for (const f of ohm) delete f.properties.pt;

// Overlapping claims: where two powers' country-level polygons cover the same land at the same time, the overlap
// itself (an intersection of the downloaded shapes, nothing drawn) is drawn as a hatch, the grammar's sign for
// overlap or dispute, instead of letting two translucent colours mix into a third. Slivers along borders that two
// editors traced differently are dropped: an overlap must be thicker than OVERLAP_MIN_KM and larger than
// OVERLAP_MIN_KM2.
const OVERLAP_MIN_KM2 = 3000, OVERLAP_MIN_KM = 12;
const FILLED = new Set(Object.entries(powers.categories).filter(([, c]) => c.fill).map(([k]) => k));
const overlapStart = Date.now();
const claims = ohm.filter((f) => f.properties.lvl === 2 && f.properties.pw.some(([, pw]) => FILLED.has(pw)));
const R = 6371;
const kmArea = (g) => geoArea(g) * R * R;
const kmLength = (g) => { let L = 0; for (const p of polygonsOf(g)) for (const ring of p) for (let i = 1; i < ring.length; i++) L += geoDistance(ring[i - 1], ring[i]) * R; return L; };
const overlaps = [];
for (let i = 0; i < claims.length; i++) {
  for (let j = i + 1; j < claims.length; j++) {
    const a = claims[i], b = claims[j], pa = a.properties, pb = b.properties;
    let s = Math.max(pa.s, pb.s), e = Math.min(pa.e, pb.e);
    if (pa.us || pb.us) e = Math.min(e, US_FROM); // after 1783 Newberry draws the U.S.
    if (s >= e) continue;
    const wa = segAt(pa.pw, s), wb = segAt(pb.pw, s);
    if (!FILLED.has(wa) || !FILLED.has(wb) || wa === wb) continue;
    const [[ax0, ay0], [ax1, ay1]] = boxOf(a), [[bx0, by0], [bx1, by1]] = boxOf(b);
    if (ax0 > bx1 || bx0 > ax1 || ay0 > by1 || by0 > ay1) continue;
    let inter;
    try { inter = polygonClipping.intersection(polygonsOf(a.geometry), polygonsOf(b.geometry)); } catch { continue; }
    const kept = [];
    for (const poly of inter) {
      const g = { type: 'Polygon', coordinates: poly };
      if (geoArea(g) > 2 * Math.PI) g.coordinates = poly.map((r) => r.slice().reverse());
      const km2 = kmArea(g);
      if (km2 < OVERLAP_MIN_KM2 || km2 / kmLength(g) < OVERLAP_MIN_KM / 2) continue;
      kept.push(g.coordinates);
    }
    if (!kept.length) continue;
    overlaps.push({
      type: 'Feature',
      properties: { rid: `${pa.rid}x${pb.rid}`, name: `${pa.name} / ${pb.name}`, lvl: 'x', s, e, pw: [[s, 'disputed']], a: pa.rid, b: pb.rid },
      geometry: kept.length === 1 ? { type: 'Polygon', coordinates: kept[0] } : { type: 'MultiPolygon', coordinates: kept },
    });
  }
}
ohm.push(...overlaps);
console.log(`  ${overlaps.length} overlapping claims kept among ${claims.length} country-level polygons (${((Date.now() - overlapStart) / 1000).toFixed(0)} s)`);
console.log(`  ${hiddenUS} polygons duplicate Newberry's United States after 1783-09-03 and are hidden from that day`);
{
  const topo = buildTopo({ ohm: { type: 'FeatureCollection', features: ohm } }, SETTINGS.ohm);
  const text = JSON.stringify(topo);
  await writeFile(join(OUT, 'ohm.topojson'), text);
  const byPower = {};
  for (const f of ohm) for (const [, pw] of f.properties.pw) byPower[pw] = (byPower[pw] ?? 0) + 1;
  index.layers.ohm = { file: 'ohm.topojson', bytes: text.length, features: ohm.length, hidden_after_1783: hiddenUS, by_power: byPower, osm_base: null, without_start_date: skipped.noStart.length, other: [...unmatched.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n) };
  console.log(`  ${kb(text.length)}; segments by power ${JSON.stringify(byPower)}`);
  console.log(`  'other' (no rule, no host): ${[...unmatched.keys()].slice(0, 80).join(' · ')}${unmatched.size > 80 ? ' …' : ''}`);
}

// ---------------------------------------------------------------- 3. Royce cessions
console.log('Royce land cessions');
{
  const raw = JSON.parse(await readFile(join(RAW, 'usfs', 'royce-cessions.geojson'), 'utf8'));
  const short = (p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k.split('.').pop(), v]));
  const toYmd = (ms) => { if (ms == null) return null; const d = new Date(ms); return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate(); };
  const features = [];
  let noDate = 0;
  for (const f of raw.features) {
    const p = short(f.properties);
    const d = toYmd(p.cessdate1);
    if (!d) { noDate++; continue; }
    const geometry = prepare(f.geometry);
    if (!geometry) continue;
    features.push({
      type: 'Feature',
      properties: {
        n: p.cessnum, d, tribe: p.schdtrb, today: p.presdaytrb, state: p.state, map: p.mapname,
        royce: p.date1link_royce_schedule, kappler: p.date1link_kappler_treaty, mapurl: p.mapurl1,
        statute: p.link_federal_statute, eo: p.link_executive_order,
      },
      geometry,
    });
  }
  features.sort((a, b) => a.properties.d - b.properties.d);
  const topo = buildTopo({ cessions: { type: 'FeatureCollection', features } }, SETTINGS.cessions);
  const text = JSON.stringify(topo);
  await writeFile(join(OUT, 'cessions.topojson'), text);
  const ds = features.map((f) => f.properties.d);
  index.layers.cessions = { file: 'cessions.topojson', bytes: text.length, features: features.length, without_date: noDate, first: ds[0], last: ds[ds.length - 1] };
  console.log(`  ${features.length} cessions (${noDate} without a date), ${ds[0]} → ${ds[ds.length - 1]}, ${kb(text.length)}`);
}

// ---------------------------------------------------------------- 4. Native homelands (historical-basemaps)
// Each snapshot stands for the years until the next one (the "nearest-not-after" rule of the Afro-Eurasia stage);
// the last stands until the Treaty of Paris, after which the record is treaty by treaty (the cessions tracker).
// A polygon is a Native nation unless the base map makes it a European colony or a later state.
console.log('Native homelands (historical-basemaps)');
{
  const YEARS = [1492, 1530, 1600, 1650, 1700, 1715];
  const EUROPE = /Spain|Spanish|England|English|\bUK\b|Brit|France|French|Netherlands|Dutch|Swed|Danemark|Denmark|Russia|Portug|Habsburg/i;
  const COLONY = /\bcolon|British|French|Spanish|English|Dutch|Swedish|\((Spain|UK|France|Danemark|Denmark|Netherlands)\)|Viceroyalty|^New (France|Amsterdam|Spain|Sweden)\b|^Virginia$|Massachusetts|^Florida|Rupert's Land|^Quebec$|Luisiana|^Louisiana$|Carolina|Belize|^Haiti$|Santo Domingo|Jamaica|Bahamas|Hispaniola|^Cuba|Dominica|Martinique|Anguilla|Turks|Virgin Islands|United States/i;
  const features = [];
  const counts = {};
  for (let i = 0; i < YEARS.length; i++) {
    const y = YEARS[i];
    const s = y * 10000 + 101, e = i + 1 < YEARS.length ? YEARS[i + 1] * 10000 + 101 : US_FROM;
    const geo = JSON.parse(await readFile(join(RAW, 'historical-basemaps', `world_${y}.geojson`), 'utf8'));
    let n = 0;
    for (const f of geo.features) {
      const p = f.properties ?? {};
      const name = String(p.NAME ?? '').trim();
      if (!name) continue;
      const sub = String(p.SUBJECTO ?? '').trim();
      if (COLONY.test(name) || (sub && sub !== name && EUROPE.test(sub))) continue;
      // Anachronisms the base map carries over from present-day territories (powers.json native_exclude, with why).
      if ((powers.native_exclude ?? []).some((x) => new RegExp(x.match, 'i').test(name) && (!x.before || y < x.before))) continue;
      const geometry = prepare(f.geometry);
      if (!geometry) continue;
      const c = geoCentroid(geometry);
      if (!(c[0] > -170 && c[0] < -52 && c[1] > 14 && c[1] < 72)) continue;
      features.push({ type: 'Feature', properties: { name, y, s, e }, geometry });
      n++;
    }
    counts[y] = n;
  }
  const topo = buildTopo({ native: { type: 'FeatureCollection', features } }, { minWeight: 3e-4, quantization: 1e5 });
  const text = JSON.stringify(topo);
  await writeFile(join(OUT, 'native.topojson'), text);
  index.layers.native = { file: 'native.topojson', bytes: text.length, features: features.length, by_snapshot: counts, until: US_FROM };
  console.log(`  ${features.length} polygons ${JSON.stringify(counts)}, ${kb(text.length)}`);
}

await writeFile(join(OUT, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log('  wrote data/us/index.json');

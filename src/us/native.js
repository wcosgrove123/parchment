// Parchment — North America stage: Native population, from data/us/native.json (scripts/derive-native.mjs).
// Pure functions, no drawing: which count stands for a date, how the states of that count add onto the states and
// territories alive on the date, how dense each is, and which scholarly estimates speak for the years before a full
// count. Every number keeps its source; nothing is interpolated between counts.

import { geoArea, geoContains, geoBounds } from 'd3';

const R_KM = 6371.0088;
// People per 1,000 km², stepped (a sequential key): fixed across every year so that colors compare over time.
export const DENSITY_BREAKS = [10, 50, 200, 800];
export const densityStep = (d) => 1 + DENSITY_BREAKS.filter((b) => d >= b).length; // 1..5
export const densityLabels = () => {
  const b = DENSITY_BREAKS;
  return [`under ${b[0]}`, `${b[0]}–${b[1]}`, `${b[1]}–${b[2]}`, `${b[2]}–${b[3]}`, `over ${b[3]}`];
};

// The census whose day is on or before the date (nearest-not-after), or null before the first.
export function censusOn(pop, date) {
  let out = null;
  for (const c of pop?.census ?? []) if (c.day <= date) out = c;
  return out;
}

const areas = new WeakMap();
export function areaKm2(f) {
  let a = areas.get(f);
  if (a === undefined) { a = geoArea(f) * R_KM * R_KM; areas.set(f, a); }
  return a;
}
const boxes = new WeakMap();
function contains(f, pt) {
  let b = boxes.get(f);
  if (!b) { b = geoBounds(f); boxes.set(f, b); }
  const [[x0, y0], [x1, y1]] = b;
  if (pt[1] < y0 || pt[1] > y1 || pt[0] < x0 || pt[0] > x1) return false;
  return geoContains(f, pt);
}

// Adds a count's states onto the polygons alive on the date: each present-day state goes to the polygon that holds
// a point inside it (Dakota Territory takes both Dakotas in 1880), and, through `home`, to every other polygon alive
// that lies inside that state (Indian Territory beside Oklahoma Territory in 1890 and 1900). Several polygons can
// share one unit. Returns Map(item → unit) and the states that fell outside every polygon (reported in the source
// card, never dropped silently).
export const itemKey = (it) => `${it.p.id}@${it.p.v}`;
export function unitsFor(census, anchors, items, home = {}) {
  const units = new Map();
  const outside = [];
  const holder = new Map();
  for (const s of census?.states ?? []) {
    const pt = anchors[s.state];
    const it = pt && items.find((x) => contains(x.f, pt));
    if (!it) { outside.push(s); continue; }
    holder.set(s.state, it);
    const u = units.get(it) ?? { aian: 0, states: [], items: [it] };
    u.aian += s.aian;
    u.states.push(s);
    units.set(it, u);
  }
  for (const it of items) {
    if (units.has(it)) continue;
    const by = holder.get(home[itemKey(it)]);
    const u = by && units.get(by);
    if (u) { u.items.push(it); units.set(it, u); }
  }
  for (const u of new Set(units.values())) {
    u.km2 = u.items.reduce((a, it) => a + areaKm2(it.f), 0);
    u.density = (u.aian / u.km2) * 1000;
    u.step = densityStep(u.density);
    u.share = census.us ? u.aian / census.us : null;
  }
  return { units, outside };
}

// Estimates whose window holds the date: placed ones (a region's badge) and national ones (a line of the legend).
export function estimatesOn(pop, date) {
  const live = (pop?.estimates ?? []).filter((e) => e.s <= date && date <= e.e);
  return { placed: live.filter((e) => e.at), national: live.filter((e) => !e.at) };
}

export const fmt = (n) => (n == null ? '' : Math.round(n).toLocaleString('en-US'));
export const pct = (x) => (x == null ? '' : x >= 0.1 ? `${Math.round(x * 100)}%` : `${(x * 100).toFixed(1)}%`);

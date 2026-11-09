// Parchment — focus framing (docs/LAYERS.md §1)
// A focus is a box of the world to fit on the sheet. This module chooses its projection (always equal-area),
// turns a focus from src/focuses.json into a stage the renderer can draw, and frames an empire: the box around
// everything a state held, over its whole life or in one year. Pure functions: no DOM, so the tests run in Node.

import * as d3 from 'd3';

const KM_PER_DEG = 111.32;
const wrapLon = (x) => ((((x + 180) % 360) + 360) % 360) - 180;

// A box may cross the antimeridian: east is then given past 180 (290 = 70°W) or smaller than west.
export function normBox({ west, south, east, north }) {
  let e = east;
  while (e <= west) e += 360;
  return { west, south, east: e, north };
}

// Equal Earth for the world and very wide bands; Albers (equal-area conic) for wide bands clear of the equator,
// with its standard parallels a sixth in from the box's edges; Lambert azimuthal equal-area, centred on the box,
// for everything compact. "Focus on Africa" is therefore azimuthal centred on Africa without anyone choosing.
export function chooseProjection(box) {
  const b = normBox(box);
  const lon0 = wrapLon((b.west + b.east) / 2), lat0 = (b.south + b.north) / 2;
  const dLon = b.east - b.west, dLat = b.north - b.south;
  if (dLon >= 150) return { projection: 'equalEarth', rotate: [-lon0, 0] };
  const kmWide = dLon * Math.cos((lat0 * Math.PI) / 180) * KM_PER_DEG, kmTall = dLat * KM_PER_DEG;
  const oneSide = b.south >= 15 || b.north <= -15; // both parallels on one side of the equator
  if (oneSide && kmWide > kmTall * 1.25) {
    const p = [b.south + dLat / 6, b.north - dLat / 6].map((x) => Math.round(x * 10) / 10);
    return { projection: 'conicEqualArea', rotate: [-lon0, 0], parallels: p };
  }
  return { projection: 'lambertAzimuthalEqualArea', rotate: [-lon0, -lat0] };
}

// A d3 projection for a stage or focus spec (projection name, rotate, parallels), not yet fitted.
export function buildProjection(spec) {
  const make = {
    equalEarth: () => d3.geoEqualEarth(),
    lambertAzimuthalEqualArea: () => d3.geoAzimuthalEqualArea(),
    conicEqualArea: () => d3.geoConicEqualArea().parallels(spec.parallels ?? [20, 50]),
    albers: () => d3.geoAlbers(),
    albersUsa: () => d3.geoAlbersUsa(),
  }[spec.projection];
  if (!make) throw new Error(`Unknown projection ${spec.projection}`);
  const p = make();
  if (spec.rotate && p.rotate) p.rotate(spec.rotate);
  return p;
}

// The tree: lookups both ways (a focus may have several parents).
export function indexFocuses(table) {
  const byId = new Map(table.focuses.map((f) => [f.id, f]));
  const children = new Map(table.focuses.map((f) => [f.id, []]));
  for (const f of table.focuses) for (const p of f.parents) children.get(p)?.push(f);
  return { byId, children, water: table.water ?? [] };
}

// The way back up for the toolbar: the first parent at each step (a focus with two doors shows the first).
export function trail(index, id) {
  const out = [];
  for (let f = index.byId.get(id); f; f = index.byId.get(f.parents[0])) { out.unshift(f); if (out.length > 8) break; }
  return out;
}

const inBox = (b, lon, lat) => {
  const n = normBox(b);
  let x = lon;
  while (x < n.west) x += 360;
  return x <= n.east && lat >= n.south && lat <= n.north;
};

// A focus as a stage: its box, its projection, its children's names as region labels (each where the table puts
// it) and the water names its level allows. Curated stages (Afro-Eurasia, the world) keep their own files.
export function focusStage(index, focus, { span = [1200, 2000] } = {}) {
  const box = normBox(focus.extent);
  const spec = focus.projection ? { projection: focus.projection, rotate: focus.rotate, parallels: focus.parallels } : chooseProjection(box);
  const regions = (index.children.get(focus.id) ?? []).map((c) => {
    const at = c.label ?? { lon: wrapLon((normBox(c.extent).west + normBox(c.extent).east) / 2), lat: (c.extent.south + c.extent.north) / 2 };
    return { text: c.title.replace(/^The /, ''), lon: at.lon, lat: at.lat, kind: 'region', focus: c.id, span: 40 };
  }).filter((l) => inBox(box, l.lon, l.lat));
  const water = index.water.filter((w) => focus.level >= w.min && focus.level <= w.max && inBox(box, w.lon, w.lat))
    .map((w) => ({ text: w.text, lon: w.lon, lat: w.lat, kind: 'water', span: 26 }));
  return {
    id: `focus-${focus.id}`, focus: focus.id, title: focus.title, level: focus.level,
    ...spec, extent: box, span, relief: null, labels: [...regions, ...water],
  };
}

// The box around everything a state held: its polygons over its whole life (stepping the years then shows it grow
// and shrink inside a steady frame), or in one year. Padded a little, never smaller than a few degrees, and
// handled across the antimeridian (the Russian Empire, the Spanish Philippines).
export function extentOf(features, { pad = 0.12, minDeg = 6 } = {}) {
  if (!features.length) return null;
  let [[w, s], [e, n]] = d3.geoBounds({ type: 'FeatureCollection', features });
  if (![w, s, e, n].every(Number.isFinite)) return null;
  if (e < w) e += 360;
  if (e - w >= 359) { w = -180; e = 180; }
  const dLon = Math.max(e - w, minDeg), dLat = Math.max(n - s, minDeg * 0.6);
  const cx = (w + e) / 2, cy = (s + n) / 2;
  const hw = (dLon / 2) * (1 + 2 * pad), hh = (dLat / 2) * (1 + 2 * pad);
  return { west: cx - hw, east: cx + hw, south: Math.max(-85, cy - hh), north: Math.min(85, cy + hh) };
}

// An empire as a focus: a framing with no children, titled by the state's name.
export function empireFocus(state, features, { level = 5, frame = 'life', year = null } = {}) {
  const extent = extentOf(features);
  if (!extent) return null;
  return { id: `empire-${state.id}`, title: state.label ?? state.name ?? state.id, level, parents: [], extent, empire: state.id, frame, year };
}

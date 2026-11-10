// Parchment — the political map (owner, 2026-11-09): every state in force in the year shown, from Cliopatria
// (Seshat Global History Databank, v0.2.1, CC BY 4.0; data/base/derived/cliopatria.topojson, scripts/derive-cliopatria.mjs).
// "i want to be able to type in any year and see the geopolitical landscape of the world (or afroeurasia if i click on
// that layer, or europe or any other zoomed in layer. they should all be based in the same single source of truth)"
//   - states: each its own color (--pol-0…11), chosen at derive time so that neighbors differ;
//   - wholes: a realm Cliopatria draws as the sum of its members (a name in parentheses, e.g. "(Kingdom of France)"
//     over the County of Champagne and the Duchy of Aquitaine): its border over theirs;
//   - the Holy Roman Empire as a band inside its outer border (src/render/realms.js): Cliopatria's whole while it holds
//     more than one member (to 1458), OpenHistoricalMap's dated border from 24 October 1648, nothing in between.
// No shape is moved between the years the source records (CLAUDE.md §1.5: stepped, not morphed).

import { feature, mesh } from 'topojson-client';

// One loaded file, any year: the rows in force are picked by FromYear ≤ year ≤ ToYear, and each row's shape is
// decoded once and kept, so stepping a year re-uses every shape that did not change.
export function makeStatesSource(topo) {
  const geoms = topo.objects.states.geometries;
  const decoded = new Map();
  const meshes = new Map();
  const shape = (k) => {
    let f = decoded.get(k);
    if (!f) {
      f = feature(topo, geoms[k]);
      const p = geoms[k].properties;
      f.properties = { ...p, name: p.n, certainty: p.cert, row: k };
      decoded.set(k, f);
    }
    return f;
  };
  function at(year) {
    const view = { year, states: [], wholes: [], unions: [], rels: [] };
    const alive = [];
    geoms.forEach((g, k) => {
      const p = g.properties;
      if (p.f > year || year > p.t) return;
      const f = shape(k);
      if (p.k === 'state') { view.states.push(f); alive.push(g); }
      else if (p.k === 'whole') view.wholes.push(f);
      else if (p.k === 'union') view.unions.push(f);
      else view.rels.push(f);
    });
    // Borders between two states in force, each drawn once (where their shapes share a line).
    const key = alive.map((g) => g.properties.n).join('|') + year;
    view.border = () => {
      let m = meshes.get(key);
      if (!m) { m = mesh(topo, { type: 'GeometryCollection', geometries: alive }, (a, b) => a !== b); meshes.set(key, m); if (meshes.size > 40) meshes.delete(meshes.keys().next().value); }
      return m;
    };
    // Largest first: the label pass gives the big states their names before the small ones compete.
    view.states.sort((a, b) => b.properties.a - a.properties.a);
    return view;
  }
  const span = geoms.reduce((s, g) => [Math.min(s[0], g.properties.f), Math.max(s[1], g.properties.t)], [Infinity, -Infinity]);
  return { at, rows: geoms.length, span };
}

// The Holy Roman Empire's whole: Cliopatria's "(Holy Roman Empire)" stands for the whole Empire only to 1458, while it
// lists its electorates and duchies; from 1459 it holds only "Holy Roman Empire Minor States". (For 1619–1621 it lists
// two members again, the Minor States and a leaf "Holy Roman Empire" that holds Prague: under half the Empire, so the
// test is held to rows that end by 1458; found from the lesson-maps session's pictures, 2026-11-10.)
export const isWholeEmpire = (f) => f.properties.n === '(Holy Roman Empire)' && (f.properties.cn ?? 0) > 1 && f.properties.t <= 1458;
// A realm drawn around its members: a whole of two or more members (a whole of one is that member's own outline).
// Cliopatria's "(Holy Roman Empire)" never gets this line: where it is the whole Empire it has its band, and where it
// is not (1459 on, including its two-member rows of 1619–1621) a line round it would read as the Empire's border.
export const isRealmLine = (f) => (f.properties.cn ?? 0) > 1 && f.properties.n !== '(Holy Roman Empire)';

// What a state is called on the map: a tracked state's label (the name of the time, src/trackers/extent.json),
// else Cliopatria's own name.
export function stateLabel(f, highlight) {
  return highlight?.label ?? f.properties.n;
}

// Names placed largest first, each where it overlaps no name already placed and none of the reserved zones (legend,
// cartouche, strip); a name that cannot be placed is left off, never shrunk past reading.
export function placeStateLabels(candidates, { path, measure, zones = [], frame, minW = 70, minH = 24, letterSpacing = 0.12 }) {
  const placed = [];
  const boxes = [...zones];
  const hit = (b) => boxes.some((z) => b.x < z.x + z.w && b.x + b.w > z.x && b.y < z.y + z.h && b.y + b.h > z.y);
  for (const { f, text } of candidates) {
    const poly = largestPolygon(f, path);
    if (!poly) continue;
    const [[bx0, by0], [bx1, by1]] = path.bounds(poly);
    const w = bx1 - bx0, h = by1 - by0;
    if (!(w > minW && h > minH)) continue;
    const [cx, cy] = path.centroid(poly);
    if (!Number.isFinite(cx)) continue;
    const size = Math.max(12, Math.min(22, Math.sqrt(w * h) / 16));
    const tw = measure(text, { size, bold: true }) * 1.04 + text.length * size * letterSpacing;
    if (tw > w * 1.15) continue; // a name much wider than its state would sit over its neighbors
    const box = { x: cx - tw / 2 - 2, y: cy - size * 0.62, w: tw + 4, h: size * 1.24 };
    if (frame && (box.x < frame.x0 || box.x + box.w > frame.x1 || box.y < frame.y0 || box.y + box.h > frame.y1)) continue;
    if (hit(box)) continue;
    boxes.push(box);
    placed.push({ id: `${f.properties.id}:${f.properties.row}`, text, x: cx, y: cy, size });
  }
  return placed;
}

// The piece with the largest area on the sheet (an empire's heartland, not an island far off the frame).
function largestPolygon(f, path) {
  const g = f.geometry;
  if (!g) return null;
  if (g.type === 'Polygon') return g;
  if (g.type !== 'MultiPolygon') return null;
  let best = null, bestA = 0;
  for (const c of g.coordinates) { const p = { type: 'Polygon', coordinates: c }; const a = path.area(p); if (a > bestA) { bestA = a; best = p; } }
  return best;
}

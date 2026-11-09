// Parchment — the Military layer: lines (brief of 2026-11-09, P7; milestone 4). Every line here is computed from
// downloaded polygons on a date, never drawn: a blockade runs just off the blockaded side's own coast; a treaty or
// armistice line is the border between two sides on the day the agreement took hold; a ghost border is a side's
// border with the other on an earlier date, drawn at half strength and labeled with its date. The war's record in
// data/vocab.json says which lines to compute (`lines`), each with its dates and a source; the page supplies the
// polygons alive on the date, two pixel masks (land, and the other side's land) and the projection.
//
// How a polygon's edge is sorted into coast and border: each vertex of its outer rings is projected, and the eight
// points a few pixels out from it are looked up in the land mask. A vertex with water beside it is coast; one whose
// outside is the other side's land is border with that side. Runs of like vertices become the lines.

import { catmullRom } from '../render/routes.js';
import { toInt } from './wars.js';

// The outer rings of a GeoJSON feature, as [lon, lat] arrays (holes are not borders of the state).
export function outerRings(feature) {
  const g = feature?.geometry;
  if (!g) return [];
  if (g.type === 'Polygon') return [g.coordinates[0]];
  if (g.type === 'MultiPolygon') return g.coordinates.map((p) => p[0]);
  return [];
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.71, 0.71], [-0.71, 0.71], [0.71, -0.71], [-0.71, -0.71]];

// Sorts a feature's edge on the sheet. masks: { land: isLand(x, y), other: isOther(x, y) } (src/us/stage.js
// rasterLand). → { coast: [{ pts, out }], border: [{ pts }] } where `out` is the mean seaward direction per point.
export function classifyEdge(feature, proj, masks, { step = 3, reach = 7, box = null } = {}) {
  const inBox = (p) => !box || (p[0] >= box[0] - 20 && p[0] <= box[0] + box[2] + 20 && p[1] >= box[1] - 20 && p[1] <= box[1] + box[3] + 20);
  const coast = [], border = [];
  for (const ring of outerRings(feature)) {
    let runC = null, runB = null, last = null;
    const flush = () => { if (runC && runC.pts.length > 2) coast.push(runC); if (runB && runB.pts.length > 2) border.push(runB); runC = null; runB = null; };
    for (const ll of ring) {
      const p = proj(ll);
      if (!p || !Number.isFinite(p[0]) || !inBox(p)) { flush(); last = null; continue; }
      if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < step) continue;
      if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) > 40) flush(); // a jump: another piece of the ring
      last = p;
      let wx = 0, wy = 0, water = 0, other = 0;
      for (const [dx, dy] of DIRS) {
        const x = p[0] + dx * reach, y = p[1] + dy * reach;
        // sea: no land there by Natural Earth, or no state's polygon there at all (a lagoon behind a barrier island
        // that the 1:50m land swallows is still water to the polygons that stop at its shore)
        const sea = !masks.land(x, y) || (masks.any && !masks.any(x, y) && !masks.self?.(x, y));
        if (sea) { water++; wx += dx; wy += dy; } else if (masks.other && masks.other(x, y)) other++;
      }
      if (water >= 2) {
        const n = Math.hypot(wx, wy) || 1;
        if (!runC) runC = { pts: [], out: [] };
        runC.pts.push(p); runC.out.push([wx / n, wy / n]);
        if (runB) { if (runB.pts.length > 2) border.push(runB); runB = null; }
      } else if (other >= 1) {
        if (!runB) runB = { pts: [] };
        runB.pts.push(p);
        if (runC) { if (runC.pts.length > 2) coast.push(runC); runC = null; }
      } else {
        if (runC && runC.pts.length > 2) coast.push(runC);
        if (runB && runB.pts.length > 2) border.push(runB);
        runC = null; runB = null;
      }
    }
    flush();
  }
  return { coast, border };
}

const inLL = (ll, w) => !w || (ll[0] >= w.west && ll[0] <= w.east && ll[1] >= w.south && ll[1] <= w.north);
export const runLength = (r) => r.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - r[i - 1][0], p[1] - r[i - 1][1]) : 0), 0);

// A moving average along a polyline (window of n points either side): a line to set letters along, or a coast
// freed of its every cove before the blockade is laid off it. Ends are kept.
export function smoothRun(pts, n = 6) {
  if (pts.length < 3) return pts;
  return pts.map((p, i) => {
    const a = Math.max(0, i - n), b = Math.min(pts.length - 1, i + n);
    let x = 0, y = 0, k = 0;
    for (let j = a; j <= b; j++) { x += pts[j][0]; y += pts[j][1]; k++; }
    return i === 0 || i === pts.length - 1 ? p : [x / k, y / k];
  });
}
// Every `step` px of a polyline, by distance along it.
export function thinRun(pts, step = 8) {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc >= step) { out.push(pts[i]); acc = 0; }
  }
  if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1]);
  return out;
}

// A blockade line: the coast runs inside the window, thinned, their seaward direction averaged along the run, moved
// `offset` px out to sea, smoothed; runs shorter than `minLength` px (islets, the mouths of lagoons) are dropped.
// → [[x, y]...] runs.
export function blockadeRuns(feature, proj, masks, { window = null, offset = 14, box = null, minLength = 90 } = {}) {
  const { coast } = classifyEdge(feature, proj, masks, { box });
  const out = [];
  for (const run of coast) {
    // the window first, then the thinning, so a run broken by the window stays in pieces
    let cur = [];
    const pieces = [];
    run.pts.forEach((p, i) => {
      const ll = proj.invert ? proj.invert(p) : null;
      if (ll && inLL(ll, window)) cur.push({ p, o: run.out[i] });
      else { if (cur.length > 3) pieces.push(cur); cur = []; }
    });
    if (cur.length > 3) pieces.push(cur);
    for (const piece of pieces) {
      const pts = piece.map((q) => q.p), os = piece.map((q) => q.o);
      const kept = [];
      let acc = 0;
      for (let i = 0; i < pts.length; i++) {
        if (i) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (i === 0 || acc >= 8 || i === pts.length - 1) {
          // the seaward direction, averaged over the vertices around this one
          const a = Math.max(0, i - 6), b = Math.min(pts.length - 1, i + 6);
          let ox = 0, oy = 0;
          for (let j = a; j <= b; j++) { ox += os[j][0]; oy += os[j][1]; }
          const n = Math.hypot(ox, oy) || 1;
          kept.push([pts[i][0] + (ox / n) * offset, pts[i][1] + (oy / n) * offset]);
          acc = 0;
        }
      }
      const sm = smoothRun(kept, 3);
      if (runLength(sm) >= minLength) out.push(catmullRom(sm, { step: 5 }));
    }
  }
  return out.filter((r) => r.length > 3);
}

// Runs that retrace one already kept (a country and its province share a coast) are dropped: five points along the
// newcomer are tried against every kept run's points, and three hits within `tol` px mean the same line.
export function dedupeRuns(runs, tol = 5) {
  const kept = [];
  for (const run of runs.slice().sort((a, b) => runLength(b) - runLength(a))) {
    const probes = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => run[Math.floor(f * (run.length - 1))]);
    const same = kept.some((k) => probes.filter((p) => k.some((q) => Math.abs(q[0] - p[0]) <= tol && Math.abs(q[1] - p[1]) <= tol)).length >= 3);
    if (!same) kept.push(run);
  }
  return kept;
}

// A border line: the runs of a side's edge that touch the other side's land (the other's mask), thinned to every
// few px; runs shorter than `minLength` are dropped (a corner where three polygons meet). → [[x, y]...] runs.
export function borderRuns(feature, proj, masks, { box = null, minLength = 30 } = {}) {
  return classifyEdge(feature, proj, masks, { box }).border.map((r) => thinRun(r.pts, 4)).filter((r) => r.length > 3 && runLength(r) >= minLength);
}

// Which of the war's lines are alive on a date (from … to, inclusive; a treaty line from its day on).
export function linesOn(war, date) {
  return (war?.lines ?? []).filter((l) => (!l.from || toInt(l.from) <= date) && (!l.to || date <= toInt(l.to, true)));
}

// The sheet length of runs, for the slip.
export const runsLength = (runs) => Math.round(runs.reduce((L, r) => L + r.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - r[i - 1][0], p[1] - r[i - 1][1]) : 0), 0), 0));

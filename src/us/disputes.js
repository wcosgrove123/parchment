// Parchment — North America stage: land claimed by two polygons at once (the Toledo Strip, Greer County, the Nueces Strip...),
// computed by scripts/derive-us-disputes.mjs from Newberry's own overlapping polygons (data/us/nb-disputes.json).
// Hatched as a dispute (grammar §5) under every tracker but the Electoral College (where a hatch is a fifth
// candidate). No drawing here; the tests load it alone.

import { geoContains } from 'd3';
import { feature } from 'topojson-client';

export const prepareDisputes = (fc) => (fc?.features ?? []).map((f) => ({ src: 'nbx', f, p: f.properties }));

// Newberry's dates are inclusive (the last day in force), so both ends count.
export const aliveDisputes = (data, d) => (data.nbx ?? []).filter((it) => it.p.s <= d && d <= it.p.e);

// Land a U.S. state (Newberry) and a Mexican state (OpenHistoricalMap) claimed on the same days: the Nueces Strip and
// the upper Rio Grande, 1845–1848, and the few others the same method finds (data/us/usmx-disputes.json, computed by
// scripts/derive-us-disputes.mjs). Each piece's last day is inclusive, as Newberry's.
export const prepareUSMX = (fc) => (fc?.features ?? []).map((f) => ({ src: 'usmx', f, p: f.properties }));
export const aliveUSMX = (data, d) => (data.usmx ?? []).filter((it) => it.p.s <= d && d <= it.p.e);

// OpenHistoricalMap polygons the owner had cut at a river (data/us/ohm-cuts.json, scripts/derive-us-disputes.mjs part
// 3): the Joint Mexico-Texas Claim of 1836–1845 ends at the Nueces, as the 1846 strip does. The polygon keeps its
// record; its shape becomes the cut one (`cut` names the river), and the edges the cut moved off it are listed
// (`dropArcs`) so the page's borders leave them out (src/us/stage.js drawBorders).
export function applyOHMCuts(data, cutsJson) {
  for (const c of cutsJson?.cuts ?? []) {
    for (const it of data.ohm) {
      if (it.p.rid !== c.rid || it.p.s !== c.s) continue;
      it.f = { ...it.f, geometry: c.geometry };
      it.cut = c.edge;
      it.dropArcs = arcsOff(data.ohmTopo, it.g, c.geometry);
    }
  }
}

// The polygon's arcs that no longer bound its cut shape: an arc on the new edge has the shape on one side only; an arc
// the cut moved off has it on both sides (inside) or on neither (outside). Tested 300 m either side of each arc's middle.
function arcsOff(topology, g, shape) {
  const flat = (a) => (Array.isArray(a) ? a.flatMap(flat) : [a]);
  const out = [];
  for (const i of new Set(flat(g.arcs).map((a) => (a < 0 ? ~a : a)))) {
    const pts = feature(topology, { type: 'LineString', arcs: [i] }).geometry.coordinates;
    if (pts.length < 2) continue;
    const m = Math.max(1, Math.floor(pts.length / 2)), [a, b] = [pts[m - 1], pts[m]];
    const kx = 111.32 * Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180), ky = 110.57;
    const dx = (b[0] - a[0]) * kx, dy = (b[1] - a[1]) * ky, len = Math.hypot(dx, dy) || 1;
    const q = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ox = ((-dy / len) * 0.3) / kx, oy = ((dx / len) * 0.3) / ky;
    if (geoContains(shape, [q[0] + ox, q[1] + oy]) === geoContains(shape, [q[0] - ox, q[1] - oy])) out.push(i);
  }
  return out;
}

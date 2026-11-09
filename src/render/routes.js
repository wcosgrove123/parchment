// Parchment — routes
// Records of kind "path" (no direction) or "arrow" (directed): an ordered list of gazetteer waypoints, splined
// through their projected positions (centripetal Catmull-Rom), drawn under the marks and labels.
// Grammar (docs/ROUTES-STYLE.md, CLAUDE.md §5): colour says what moved, dash says certainty, the arrowhead says
// direction and kind, width is categorical. Nothing here is traced: waypoints are Wikidata coordinates.

export const WIDTHS = { thin: 2, regular: 3, bold: 4.5 };

// One row per route class (vocab.json → trackers.routes.values).
//   color: steel (sea), land (umber), rust (armies, migrations), ink (the carrier of a diffusion, until a diffusion map asks for more)
//   heads: how an `arrow` is tipped. A `path` of the same class has no heads.
export const CLASSES = {
  'sea-trade': { color: 'steel', heads: 'both', width: 'regular', label: 'Sea trade' },
  'land-trade': { color: 'land', heads: 'both', width: 'regular', label: 'Land trade' },
  voyage: { color: 'steel', heads: 'end', width: 'regular', label: 'Voyage' },
  migration: { color: 'rust', heads: 'chevron', width: 'regular', label: 'Migration' },
  military: { color: 'rust', heads: 'barb', width: 'regular', label: 'Army' },
  carrier: { color: 'ink', heads: 'none', width: 'thin', label: 'Carrier route' },
};
// The Explorers layer (owner, 2026-11-06): there a line's color is the state that sent the expedition, one dark line
// color per state (tokens.css --sponsor-*), never a theme fill. Every line in that layer is a journey with one head.
export const SPONSORS = {
  spain: { label: 'Spain' },
  portugal: { label: 'Portugal' },
  england: { label: 'England' },
  france: { label: 'France' },
  netherlands: { label: 'The Dutch' },
};
// The Military layer (owner's defaults, 2026-11-09): a force's arrow takes its side's line color (src/tokens.css --side-*-line).
export const SIDE_COLORS = ['a', 'b', 'c', 'd', 'gray', 'red'].map((k) => `side-${k}`);
export const COLORS = ['steel', 'land', 'rust', 'ink', ...Object.keys(SPONSORS), ...SIDE_COLORS];

// Certainty → line style, the same reading as for borders: documented, approximate, conjectured.
export const DASH = { legal: 'solid', approximate: 'dashed', sphere: 'dotted' };
export const DASH_LABEL = { legal: 'Documented route', approximate: 'Approximate route', sphere: 'Conjectured route' };

// Marker shapes, drawn in a 10×10 box, scaled by stroke width (markerUnits strokeWidth).
//   arrow: a small filled head (trade, both ends; a voyage's terminal head)
//   barb: a closed swept head (an army)
//   chevron: an open head (a migration)
const HEADS = {
  arrow: { d: 'M0,1.5L9,5L0,8.5Z', w: 3.2, h: 3.2, ref: 7.5, open: false },
  barb: { d: 'M0,0L10,5L0,10L3,5Z', w: 4, h: 4, ref: 8.5, open: false },
  chevron: { d: 'M1,1L8,5L1,9', w: 4, h: 4, ref: 7.5, open: true },
  // the Military layer's retreat (proposal P3, owner's default 2026-11-09): the barb outlined, never dashed
  hollow: { d: 'M0.5,0.8L9.4,5L0.5,9.2L3.2,5Z', w: 4, h: 4, ref: 8.5, open: 'hollow' },
};
const MIL_LABELS = { advance: 'Advance', retreat: 'Retreat or withdrawal', 'flank-march': 'Flank march', envelopment: 'Envelopment', feint: 'Feint', pursuit: 'Pursuit', raid: 'Raid', landing: 'Landing from the sea', breakthrough: 'Breakthrough', 'naval-passage': 'Fleet', 'air-route': 'Air route', 'supply-line': 'Supply line' };

// Style for one record: what the renderer and the legend both read.
export function routeStyle(rec) {
  // The Military layer: the closed barb means an armed force, as now, in its side's color (rec.sideColor, set by the
  // page from the war's sides); a retreat is hollow (outline only); a landing ends at the coast with a tick.
  if (rec.tracker === 'military') {
    const color = rec.sideColor ? `side-${rec.sideColor}` : 'rust';
    const retreat = rec.value === 'retreat';
    const landing = rec.value === 'landing';
    return { color, width: retreat ? WIDTHS.regular + 1.4 : WIDTHS.regular, tier: 'regular', dash: DASH[rec.certainty] ?? 'solid', heads: 'barb',
      markerStart: null, markerEnd: retreat ? 'hollow' : 'barb', hollow: retreat, landing, military: true, classLabel: MIL_LABELS[rec.value] ?? 'Movement' };
  }
  if (rec.tracker === 'explorers') {
    const color = SPONSORS[rec.value] ? rec.value : 'ink';
    const directed = rec.kind === 'arrow';
    return { color, width: WIDTHS.regular, tier: 'regular', dash: DASH[rec.certainty] ?? 'solid', heads: directed ? 'end' : 'none', markerStart: null, markerEnd: directed ? 'arrow' : null, classLabel: `Sent by ${SPONSORS[rec.value]?.label ?? rec.value}` };
  }
  const cls = CLASSES[rec.value] ?? CLASSES.carrier;
  const width = WIDTHS[cls.width] ?? WIDTHS.regular;
  const dash = DASH[rec.certainty] ?? 'solid';
  let heads = rec.kind === 'arrow' ? cls.heads : 'none';
  // trade both ways: a small head at either end; voyage: one head at the end; barb and chevron tip the end only
  const markerStart = heads === 'both' ? 'arrow' : null;
  const markerEnd = heads === 'both' || heads === 'end' ? 'arrow' : heads === 'barb' ? 'barb' : heads === 'chevron' ? 'chevron' : null;
  return { color: cls.color, width, tier: cls.width, dash, heads, markerStart, markerEnd, classLabel: cls.label };
}

// stroke-dasharray for a dash style at a width: dashes scale with the line so thin and bold read alike.
export function dashArray(dash, width) {
  if (dash === 'dashed') return `${(3 * width).toFixed(1)} ${(2 * width).toFixed(1)}`;
  if (dash === 'dotted') return `0.1 ${(2.4 * width).toFixed(1)}`;
  return null;
}

// Centripetal Catmull-Rom (alpha 0.5) through the points, sampled about every `step` px. Pure: no DOM.
export function catmullRom(points, { alpha = 0.5, step = 3 } = {}) {
  const pts = points.filter((p, i) => i === 0 || Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) > 1e-6);
  if (pts.length < 2) return pts.slice();
  if (pts.length === 2) {
    const [a, b] = pts;
    const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    return Array.from({ length: n + 1 }, (_, j) => [a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
  }
  // Phantom end points by reflection so the curve starts and ends on the first and last waypoint.
  const first = [2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]];
  const last = [2 * pts[pts.length - 1][0] - pts[pts.length - 2][0], 2 * pts[pts.length - 1][1] - pts[pts.length - 2][1]];
  const P = [first, ...pts, last];
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const out = [pts[0]];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const t0 = 0;
    const t1 = t0 + Math.max(dist(p0, p1), 1e-3) ** alpha;
    const t2 = t1 + Math.max(dist(p1, p2), 1e-3) ** alpha;
    const t3 = t2 + Math.max(dist(p2, p3), 1e-3) ** alpha;
    const n = Math.max(2, Math.ceil(dist(p1, p2) / step));
    for (let j = 1; j <= n; j++) {
      const t = t1 + ((t2 - t1) * j) / n;
      const lerp = (a, b, ta, tb) => [a[0] + ((b[0] - a[0]) * (t - ta)) / (tb - ta), a[1] + ((b[1] - a[1]) * (t - ta)) / (tb - ta)];
      const A1 = lerp(p0, p1, t0, t1), A2 = lerp(p1, p2, t1, t2), A3 = lerp(p2, p3, t2, t3);
      const B1 = lerp(A1, A2, t0, t2), B2 = lerp(A2, A3, t1, t3);
      out.push(lerp(B1, B2, t1, t2));
    }
  }
  return out;
}

const inRect = (p, z) => p[0] >= z.x && p[0] <= z.x + z.w && p[1] >= z.y && p[1] <= z.y + z.h;

// A route that ends inside a reserved zone (cartouche, legend, strip) is cut short where it enters, head kept.
export function trimToZones(samples, zones) {
  if (!zones.length || samples.length < 2) return samples;
  let a = 0, b = samples.length - 1;
  while (a < b && zones.some((z) => inRect(samples[a], z))) a++;
  while (b > a && zones.some((z) => inRect(samples[b], z))) b--;
  return b - a >= 1 ? samples.slice(a, b + 1) : [];
}

// Cut `a` px off the start and `b` px off the end, so an arrowhead points at a mark instead of hiding under it.
export function trimEnds(samples, a = 0, b = 0) {
  const cut = (pts, len) => {
    let left = len;
    const out = pts.slice();
    while (out.length > 1 && left > 0) {
      const d = Math.hypot(out[1][0] - out[0][0], out[1][1] - out[0][1]);
      if (d <= left) { out.shift(); left -= d; }
      else { const t = left / d; out[0] = [out[0][0] + (out[1][0] - out[0][0]) * t, out[0][1] + (out[1][1] - out[0][1]) * t]; left = 0; }
    }
    return out;
  };
  let out = a > 0 ? cut(samples, a) : samples;
  if (b > 0) out = cut([...out].reverse(), b).reverse();
  return out.length >= 2 ? out : [];
}

export const pathFrom = (samples) => (samples.length ? 'M' + samples.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') : '');

// ---------- the seam: where a world map is cut ----------
// A whole-world stage is cut along the meridian opposite its center. A route that crosses the cut (a Pacific
// crossing on a map centered on the Atlantic) must run to one edge and carry on from the other, never back across
// the sheet. Done in three steps, so the curve is the same curve it would be on an uncut globe:
//   1. rotate each waypoint into the stage's frame and unwrap its longitude, so each leg takes the shorter way
//      round (Manila → Acapulco runs east over the date line, not west across Asia and Africa);
//   2. project the unwrapped points with the projection's own formula, which carries on smoothly past the edge,
//      and spline them there;
//   3. cut the sampled curve wherever it passes ±180° in the stage's frame, and move each piece that lies beyond
//      the edge back onto the sheet by a whole turn.
// A route that never leaves −180°…180° takes none of this: it is projected and splined exactly as before.
// seam: { rotate([lon, lat]) → [λ°, φ°] in the stage's frame, toScreen(λ°, φ°) → [x, y] for any λ (past ±180 too),
//         fromScreen(x, y) → [λ°, φ°] }, built by makeSeam from a d3 projection and its raw formula.
const RAD = Math.PI / 180;
export function makeSeam(projection, raw, rotate) {
  if (!raw?.invert) return null;
  const k = projection.scale();
  const [tx, ty] = projection.translate();
  return {
    rotate,
    toScreen: (l, p) => { const [x, y] = raw(l * RAD, p * RAD); return [tx + k * x, ty - k * y]; },
    fromScreen: (x, y) => { const [l, p] = raw.invert((x - tx) / k, (ty - y) / k); return [l / RAD, p / RAD]; },
  };
}

// Longitudes made continuous along the list: each step is the shorter way round (|Δλ| ≤ 180°).
export function unwrapLongitudes(lonlats) {
  const out = lonlats.map((p) => [p[0], p[1]]);
  for (let i = 1; i < out.length; i++) {
    while (out[i][0] - out[i - 1][0] > 180) out[i][0] -= 360;
    while (out[i][0] - out[i - 1][0] < -180) out[i][0] += 360;
  }
  return out;
}

// Cut a curve sampled in unwrapped screen space wherever it crosses ±180° (in the stage's frame) and bring every
// piece back onto the sheet. → [{ samples, first, last }]: `first` holds the route's start, `last` its end.
export function splitAtSeam(samples, seam) {
  if (samples.length < 2) return [];
  const ll = samples.map(([x, y]) => seam.fromScreen(x, y));
  const sheet = (l) => Math.floor((l + 180) / 360); // 0 on the sheet; ±1 one turn beyond an edge
  const pieces = [];
  let cur = { s: sheet(ll[0][0]), pts: [ll[0]] };
  for (let i = 1; i < ll.length; i++) {
    const s = sheet(ll[i][0]);
    if (s !== cur.s) {
      // The crossing, interpolated between the two samples either side of it (3 px apart).
      const B = -180 + 360 * Math.max(cur.s, s);
      const [l0, p0] = ll[i - 1], [l1, p1] = ll[i];
      const c = [B, p0 + ((p1 - p0) * (B - l0)) / (l1 - l0)];
      cur.pts.push(c);
      pieces.push(cur);
      cur = { s, pts: [c] };
    }
    cur.pts.push(ll[i]);
  }
  pieces.push(cur);
  return pieces
    .map((p, i) => ({ samples: p.pts.map(([l, ph]) => seam.toScreen(l - 360 * p.s, ph)), first: i === 0, last: i === pieces.length - 1 }))
    .filter((p) => p.samples.length >= 2);
}

// A route's drawn curve: one piece, or several where it crosses the seam. clearStart / clearEnd: px kept back
// from the first and last waypoint (an arrowhead points at a mark instead of hiding under it).
// offsets: px per waypoint, sideways to the direction of travel (laneOffsets), so routes sharing a stretch run side by side.
export function routePieces(coords, projection, { seam = null, clearStart = 0, clearEnd = 0, offsets = null } = {}) {
  if (seam && coords.length >= 2) {
    const rot = unwrapLongitudes(coords.map((ll) => seam.rotate(ll)));
    if (rot.some(([l]) => l > 180 || l < -180)) {
      const samples = trimEnds(catmullRom(offsetPoints(rot.map(([l, p]) => seam.toScreen(l, p)), offsets)), clearStart, clearEnd);
      return splitAtSeam(samples, seam);
    }
  }
  const projected = coords.map((ll) => projection(ll));
  const finite = projected.every((p) => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  const pts = finite ? offsetPoints(projected, offsets) : projected.filter((p) => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (pts.length < 2) return [];
  const samples = trimEnds(catmullRom(pts), clearStart, clearEnd);
  return samples.length >= 2 ? [{ samples, first: true, last: true }] : [];
}

// Each point moved `offsets[i]` px across the line's direction there (the left-hand normal in screen space).
function offsetPoints(pts, offsets) {
  if (!offsets || !offsets.some((o) => o)) return pts;
  return pts.map((p, i) => {
    const o = offsets[i] ?? 0;
    if (!o) return p;
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    return [p[0] + (dy / len) * o, p[1] - (dx / len) * o];
  });
}

// Side by side, like lines on a transit map: where several routes on one map share a leg (the same two waypoints
// in a row, either way round), each takes its own lane `gap` px apart, in the order the rows come; a waypoint's
// offset is the mean of the lanes of the legs either side of it, so a route eases into its lane and out again.
// → Map(route id → [px per waypoint]); routes that share nothing get zeros (and are drawn exactly as before).
export function laneOffsets(records, gap = 5) {
  const legKey = (a, b) => (a < b ? [`${a}|${b}`, 1] : [`${b}|${a}`, -1]);
  const legs = new Map();
  for (const r of records) {
    const w = r.waypoints ?? [];
    for (let i = 0; i + 1 < w.length; i++) {
      const [key] = legKey(w[i], w[i + 1]);
      if (!legs.has(key)) legs.set(key, []);
      if (!legs.get(key).includes(r.id)) legs.get(key).push(r.id);
    }
  }
  const out = new Map();
  for (const r of records) {
    const w = r.waypoints ?? [];
    const lane = [];
    for (let i = 0; i + 1 < w.length; i++) {
      const [key, dir] = legKey(w[i], w[i + 1]);
      const list = legs.get(key);
      lane.push(list.length > 1 ? (list.indexOf(r.id) - (list.length - 1) / 2) * gap * dir : 0);
    }
    out.set(r.id, w.map((_, i) => {
      const adj = [lane[i - 1], lane[i]].filter((v) => v !== undefined);
      return adj.length ? adj.reduce((s, v) => s + v, 0) / adj.length : 0;
    }));
  }
  return out;
}

// Heads at the stops (owner, 2026-11-06): a directed route is tipped at its end and again at every stop along the
// way that carries a mark on the map (a port of call, a landfall, a battle), never at a cape passed on the way.
// Each head sits on a short stub just before the stop, pointing into it, `clear` px back so it touches the mark.
// pieces: from routePieces; stops: [{ x, y, clear }] → [[from, to]] stubs, 4 px long.
export function stopStubs(pieces, stops, { length = 4, near = 12 } = {}) {
  const out = [];
  for (const s of stops) {
    let best = null;
    for (const p of pieces) p.samples.forEach((q, j) => {
      const d = Math.hypot(q[0] - s.x, q[1] - s.y);
      if (!best || d < best.d) best = { d, samples: p.samples, j };
    });
    if (!best || best.d > near) continue;
    const a = pointBack(best.samples, best.j, s.clear), b = pointBack(best.samples, best.j, s.clear + length);
    if (a && b) out.push([b, a]);
  }
  return out;
}
// The point `dist` px back along the polyline from sample j (null if the line is shorter than that).
function pointBack(samples, j, dist) {
  let left = dist;
  for (let k = j; k > 0; k--) {
    const [x1, y1] = samples[k], [x0, y0] = samples[k - 1];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (d >= left) { const t = left / d; return [x1 + (x0 - x1) * t, y1 + (y0 - y1) * t]; }
    left -= d;
  }
  return null;
}

const lengthOf = (s) => s.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0), 0);

// Markers for every head × colour, once per stage.
export function routeDefs(defs) {
  for (const [name, h] of Object.entries(HEADS)) {
    for (const color of COLORS) {
      const m = defs.append('marker').attr('id', `route-head-${name}-${color}`).attr('class', `route-head ${name} ${color}`)
        .attr('viewBox', '0 0 10 10').attr('refX', h.ref).attr('refY', 5)
        .attr('markerWidth', h.w).attr('markerHeight', h.h).attr('orient', 'auto-start-reverse');
      m.append('path').attr('d', h.d).attr('class', h.open === 'hollow' ? 'hollow' : h.open ? 'open' : 'closed');
    }
  }
}

// records: resolved route rows (with `coords`); projection: the stage projection; zones: reserved rects;
// clearance(qid) → px to keep back from a waypoint that carries a mark (0 when it has none).
// seam: from makeSeam, on a whole-world stage; a route crossing it is drawn as pieces, edge to edge.
// → [{ r, style, samples, pathId, start, end, named }] for the label pass, one entry per piece; only the longest
// piece of a route is `named` (one name per route). Rows without coordinates are skipped.
export function drawRoutes(layer, records, projection, zones = [], clearance = () => 0, { seam = null } = {}) {
  const drawn = [];
  const stubs = [];
  const lanes = laneOffsets(records.filter((r) => r.coords));
  for (const r of records) {
    if (!r.coords) continue;
    const style = routeStyle(r);
    const ids = r.waypoints ?? [];
    // Only a tipped end keeps back from its mark; a plain end runs into it. (The coordinate goes along too: a mark at
    // the same place under another id, a battle at a city, still keeps the head clear.)
    const a = style.markerStart ? clearance(ids[0], r.coords[0]) : 0;
    const b = style.markerEnd ? clearance(ids[ids.length - 1], r.coords[r.coords.length - 1]) : 0;
    const whole = routePieces(r.coords, projection, { seam, clearStart: a, clearEnd: b, offsets: lanes.get(r.id) });
    // A one-way route (a voyage, an army, a migration) is also tipped at each marked stop on the way.
    if (style.markerEnd && style.heads !== 'both') {
      const stops = [];
      for (let i = 1; i < ids.length - 1; i++) {
        const clear = clearance(ids[i], r.coords[i]);
        const p = clear ? projection(r.coords[i]) : null;
        if (p && Number.isFinite(p[0])) stops.push({ x: p[0], y: p[1], clear });
      }
      for (const [from, to] of stopStubs(whole, stops)) {
        if (!zones.some((z) => to[0] >= z.x && to[0] <= z.x + z.w && to[1] >= z.y && to[1] <= z.y + z.h)) stubs.push({ r, style, from, to, id: `${r.id}-stop-${stubs.length}` });
      }
    }
    const pieces = whole.map((p) => ({ ...p, samples: trimToZones(p.samples, zones) })).filter((p) => p.samples.length >= 2);
    if (!pieces.length) continue;
    const longest = pieces.reduce((m, p, i) => (lengthOf(p.samples) > lengthOf(pieces[m].samples) ? i : m), 0);
    pieces.forEach((p, i) => drawn.push({
      r, style, samples: p.samples, start: p.first, end: p.last, named: i === longest,
      pathId: pieces.length > 1 ? `route-${r.id}-${i + 1}` : `route-${r.id}`,
    }));
  }
  // The heads at stops: a short solid stub in the route's color, under the same marker as the route's end.
  const stopLayer = layer.selectAll('g.route-stops').data([0]).join('g').attr('class', 'route-stops');
  stopLayer.selectAll('path').data(stubs, (d) => d.id).join('path')
    .attr('class', (d) => `route route-stop ${d.style.color} ${d.style.tier}`)
    .attr('d', (d) => pathFrom([d.from, d.to]))
    .attr('stroke-width', (d) => d.style.width)
    .attr('marker-end', (d) => `url(#route-head-${d.style.markerEnd}-${d.style.color})`);
  const g = layer.selectChildren('path.route').data(drawn, (d) => d.pathId).join('path');
  g.attr('class', (d) => `route ${d.style.color} ${d.style.tier} ${d.style.dash} ${d.r.value}`)
    .attr('id', (d) => d.pathId)
    .attr('d', (d) => pathFrom(d.samples))
    .attr('stroke-width', (d) => d.style.width)
    .attr('stroke-dasharray', (d) => dashArray(d.style.dash, d.style.width))
    // Heads only where the route really starts and ends, never at the edge of the sheet.
    .attr('marker-start', (d) => (d.style.markerStart && d.start ? `url(#route-head-${d.style.markerStart}-${d.style.color})` : null))
    .attr('marker-end', (d) => (d.style.markerEnd && d.end ? `url(#route-head-${d.style.markerEnd}-${d.style.color})` : null));
  g.selectAll('title').remove();
  g.append('title').text((d) => `${d.r.label} · ${d.style.classLabel.toLowerCase()}${d.r.source ? `\n${d.r.source}` : ''}`);
  // The Military layer: a retreat is hollow (a paper core inside the side's color, stopping short of the head), and a
  // landing ends with a short tick across the line where it meets the coast.
  layer.selectAll('path.route-inner').data(drawn.filter((d) => d.style.hollow), (d) => d.pathId).join('path')
    .attr('class', 'route route-inner').attr('d', (d) => pathFrom(trimEnds(d.samples, 0, d.end ? 7 : 0)))
    .attr('stroke-width', (d) => Math.max(1, d.style.width - 2));
  layer.selectAll('path.route-landing').data(drawn.filter((d) => d.style.landing && d.end && d.samples.length > 3), (d) => d.pathId).join('path')
    .attr('class', (d) => `route route-landing ${d.style.color}`).attr('stroke-width', 2.5)
    .attr('d', (d) => {
      const s = d.samples, e = s[s.length - 1], f = s[s.length - 4];
      const dx = e[0] - f[0], dy = e[1] - f[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      return pathFrom([[e[0] - nx * 7, e[1] - ny * 7], [e[0] + nx * 7, e[1] + ny * 7]]);
    });
  stopLayer.raise(); // the heads at stops sit on top of the lines
  return drawn;
}

// Legend rows for whatever is on the map: one per route class, then one per certainty seen.
export function routeLegend(records) {
  // The Military layer: one row per side with a force on the map (its barb in its color), then the forms seen
  // (retreat, landing, fleet), then the certainties. Other rows on the same map (an old rust Army route) follow.
  const mil = records.filter((r) => r.tracker === 'military');
  if (mil.length) {
    const rows = [];
    const sides = [...new Map(mil.filter((r) => r.sideColor).map((r) => [r.sideColor, r])).values()];
    for (const r of sides) rows.push({ swatch: 'route', color: `side-${r.sideColor}`, heads: 'barb', label: `${r.sideLabel ?? r.sideColor}: an armed force` });
    const first = sides[0]?.sideColor ? `side-${sides[0].sideColor}` : 'rust';
    if (mil.some((r) => r.value === 'retreat')) rows.push({ swatch: 'route', color: first, heads: 'hollow', hollow: true, label: 'Retreat or withdrawal' });
    if (mil.some((r) => r.value === 'landing')) rows.push({ swatch: 'route', color: first, heads: 'barb', landing: true, label: 'Landing from the sea' });
    if (mil.some((r) => r.value === 'naval-passage')) rows.push({ swatch: 'route', color: first, heads: 'barb', label: 'Fleet, over water' });
    const seen = [...new Set(mil.map((r) => DASH[r.certainty]))];
    for (const d of ['solid', 'dashed', 'dotted']) if (seen.includes(d)) rows.push({ swatch: 'line', style: d, label: DASH_LABEL[Object.keys(DASH).find((k) => DASH[k] === d)] });
    const rest = records.filter((r) => r.tracker !== 'military');
    return rest.length ? [...rows, ...routeLegend(rest)] : rows;
  }
  // The Explorers layer: one row per state that sent an expedition on the map, then the certainties.
  if (records.some((r) => r.tracker === 'explorers')) {
    const sent = new Set(records.map((r) => r.value));
    const rows = Object.keys(SPONSORS).filter((k) => sent.has(k)).map((k) => ({ swatch: 'route', color: k, heads: 'end', label: `Sent by ${SPONSORS[k].label}` }));
    const seen = [...new Set(records.map((r) => DASH[r.certainty]))];
    for (const d of ['solid', 'dashed', 'dotted']) if (seen.includes(d)) rows.push({ swatch: 'line', style: d, label: DASH_LABEL[Object.keys(DASH).find((k) => DASH[k] === d)] });
    return rows;
  }
  const classes = [...new Set(records.map((r) => r.value))].filter((v) => CLASSES[v]);
  const rows = Object.keys(CLASSES).filter((k) => classes.includes(k)).map((k) => {
    const kinds = new Set(records.filter((r) => r.value === k).map((r) => r.kind));
    const heads = kinds.has('arrow') ? CLASSES[k].heads : 'none';
    return { swatch: 'route', color: CLASSES[k].color, heads, label: CLASSES[k].label };
  });
  const seen = [...new Set(records.map((r) => DASH[r.certainty]))];
  for (const d of ['solid', 'dashed', 'dotted']) if (seen.includes(d)) rows.push({ swatch: 'line', style: d, label: DASH_LABEL[Object.keys(DASH).find((k) => DASH[k] === d)] });
  return rows;
}

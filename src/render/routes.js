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
export const COLORS = ['steel', 'land', 'rust', 'ink'];

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
};

// Style for one record: what the renderer and the legend both read.
export function routeStyle(rec) {
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

// Markers for every head × colour, once per stage.
export function routeDefs(defs) {
  for (const [name, h] of Object.entries(HEADS)) {
    for (const color of COLORS) {
      const m = defs.append('marker').attr('id', `route-head-${name}-${color}`).attr('class', `route-head ${name} ${color}`)
        .attr('viewBox', '0 0 10 10').attr('refX', h.ref).attr('refY', 5)
        .attr('markerWidth', h.w).attr('markerHeight', h.h).attr('orient', 'auto-start-reverse');
      m.append('path').attr('d', h.d).attr('class', h.open ? 'open' : 'closed');
    }
  }
}

// records: resolved route rows (with `coords`); projection: the stage projection; zones: reserved rects;
// clearance(qid) → px to keep back from a waypoint that carries a mark (0 when it has none).
// → [{ r, style, samples, pathId }] for the label pass. Rows without coordinates are skipped.
export function drawRoutes(layer, records, projection, zones = [], clearance = () => 0) {
  const drawn = [];
  for (const r of records) {
    if (!r.coords) continue;
    const pts = r.coords.map((ll) => projection(ll)).filter((p) => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (pts.length < 2) continue;
    const style = routeStyle(r);
    const ids = r.waypoints ?? [];
    // Only a tipped end keeps back from its mark; a plain end runs into it.
    const a = style.markerStart ? clearance(ids[0]) : 0;
    const b = style.markerEnd ? clearance(ids[ids.length - 1]) : 0;
    const samples = trimToZones(trimEnds(catmullRom(pts), a, b), zones);
    if (samples.length < 2) continue;
    drawn.push({ r, style, samples, pathId: `route-${r.id}` });
  }
  const g = layer.selectAll('path.route').data(drawn, (d) => d.r.id).join('path');
  g.attr('class', (d) => `route ${d.style.color} ${d.style.tier} ${d.style.dash} ${d.r.value}`)
    .attr('id', (d) => d.pathId)
    .attr('d', (d) => pathFrom(d.samples))
    .attr('stroke-width', (d) => d.style.width)
    .attr('stroke-dasharray', (d) => dashArray(d.style.dash, d.style.width))
    .attr('marker-start', (d) => (d.style.markerStart ? `url(#route-head-${d.style.markerStart}-${d.style.color})` : null))
    .attr('marker-end', (d) => (d.style.markerEnd ? `url(#route-head-${d.style.markerEnd}-${d.style.color})` : null));
  g.selectAll('title').remove();
  g.append('title').text((d) => `${d.r.label} · ${d.style.classLabel.toLowerCase()}${d.r.source ? `\n${d.r.source}` : ''}`);
  return drawn;
}

// Legend rows for whatever is on the map: one per route class, then one per certainty seen.
export function routeLegend(records) {
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

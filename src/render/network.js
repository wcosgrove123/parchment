// Parchment — route networks: routes that merge into one trunk and split again
// Some route classes (routes.js CLASSES, `trunk: true`: the Underground Railroad's escape routes) are drawn as one
// network instead of side by side: a leg that several records share (the same two waypoints in a row, the same way
// round) is drawn once, and at a waypoint where routes join or part every leg passes in the same direction, so a
// branch leaves its trunk along the trunk and curves away, as a river's distributary does. Nothing is bent by hand:
// the nodes are gazetteer coordinates, the direction at a node is computed from its neighbors, and each leg is the
// cubic curve those two ends and two directions give (docs/ROUTES-STYLE.md §6).
//
// The first half of this file is pure (no DOM), so the tests load it alone.

import { routeStyle, dashArray, trimEnds, trimToZones, pathFrom, DASH } from './routes.js';

const CERTAINTY_ORDER = ['legal', 'approximate', 'sphere']; // a leg shared by records is as certain as its best record

// records: route rows with `waypoints` (ids) and `coords` ([lon, lat] per waypoint).
// → { nodes: Map(id → { id, coord, in: Set, out: Set }), legs: [{ key, a, b, records: [r…], certainty }] }
// A leg is directed: A>B and B>A are two legs (people did not flee both ways along one road).
export function buildNetwork(records) {
  const nodes = new Map();
  const legs = new Map();
  const node = (id, coord) => { if (!nodes.has(id)) nodes.set(id, { id, coord, in: new Set(), out: new Set() }); return nodes.get(id); };
  for (const r of records) {
    const w = r.waypoints ?? [];
    if (!r.coords || w.length < 2) continue;
    for (let i = 0; i + 1 < w.length; i++) {
      const a = node(w[i], r.coords[i]), b = node(w[i + 1], r.coords[i + 1]);
      a.out.add(b.id); b.in.add(a.id);
      const key = `${a.id}>${b.id}`;
      if (!legs.has(key)) legs.set(key, { key, a: a.id, b: b.id, records: [] });
      const leg = legs.get(key);
      if (!leg.records.includes(r)) leg.records.push(r);
    }
  }
  for (const leg of legs.values()) leg.certainty = CERTAINTY_ORDER.find((c) => leg.records.some((r) => r.certainty === c)) ?? 'approximate';
  return { nodes, legs: [...legs.values()] };
}

const unit = (dx, dy) => { const l = Math.hypot(dx, dy); return l > 1e-9 ? [dx / l, dy / l] : [0, 0]; };

// The direction of travel through each node, in screen space: the mean of the directions it is reached from and the
// mean of the directions it is left by, added. Every leg at the node starts or ends along it.
// xy: Map(id → [x, y]) → Map(id → [ux, uy])
export function nodeTangents(net, xy) {
  const out = new Map();
  for (const n of net.nodes.values()) {
    const p = xy.get(n.id);
    if (!p) continue;
    const mean = (ids, sign) => {
      let sx = 0, sy = 0, k = 0;
      for (const id of ids) { const q = xy.get(id); if (!q) continue; const [ux, uy] = unit((q[0] - p[0]) * sign, (q[1] - p[1]) * sign); sx += ux; sy += uy; k++; }
      return k ? [sx / k, sy / k] : null;
    };
    const arrive = mean(n.in, -1), leave = mean(n.out, 1);
    let t = unit((arrive?.[0] ?? 0) + (leave?.[0] ?? 0), (arrive?.[1] ?? 0) + (leave?.[1] ?? 0));
    // (arriving and leaving in opposite directions cancel: a hairpin; the way out then decides)
    if (!t[0] && !t[1]) t = unit(...(leave ?? arrive ?? [1, 0]));
    out.set(n.id, t);
  }
  return out;
}

// One leg's curve: the cubic through A and B that leaves A along ta and reaches B along tb, sampled about every
// `step` px. The pull of each end is a third of the leg's length, lessened where an end's direction points away
// from the other end, so a sharp turn does not loop.
export function legCurve(A, B, ta, tb, { step = 3 } = {}) {
  const d = Math.hypot(B[0] - A[0], B[1] - A[1]);
  if (d < 1e-6) return [A, B];
  const along = unit(B[0] - A[0], B[1] - A[1]);
  const pull = (t) => (d / 3) * Math.max(0.35, (1 + t[0] * along[0] + t[1] * along[1]) / 2);
  const ka = pull(ta), kb = pull(tb);
  const c1 = [A[0] + ta[0] * ka, A[1] + ta[1] * ka], c2 = [B[0] - tb[0] * kb, B[1] - tb[1] * kb];
  const n = Math.max(2, Math.ceil(d / step));
  const out = [];
  for (let j = 0; j <= n; j++) {
    const t = j / n, u = 1 - t;
    out.push([u * u * u * A[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * B[0], u * u * u * A[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * B[1]]);
  }
  return out;
}

// The network laid out on a projection → { legs: [{ …leg, samples, terminal }], ends: [node id…] }.
// terminal: the leg ends where no leg carries on (an arrowhead goes there). Legs with an unprojectable end are dropped.
export function layoutNetwork(net, projection) {
  const xy = new Map();
  for (const n of net.nodes.values()) { const p = projection(n.coord); if (p && Number.isFinite(p[0]) && Number.isFinite(p[1])) xy.set(n.id, p); }
  const tan = nodeTangents(net, xy);
  const legs = [];
  for (const leg of net.legs) {
    const A = xy.get(leg.a), B = xy.get(leg.b);
    if (!A || !B) continue;
    legs.push({ ...leg, samples: legCurve(A, B, tan.get(leg.a), tan.get(leg.b)), terminal: net.nodes.get(leg.b).out.size === 0 });
  }
  return { legs, xy, ends: [...net.nodes.values()].filter((n) => n.out.size === 0).map((n) => n.id) };
}

// ---------------------------------------------------------------- drawing
// layer: a <g> of its own inside the routes layer. records: the trunk-class rows on the map. clearance(id, coord) →
// px to keep an arrowhead back from a marked end. → one entry per record for the label pass and the packing slip
// ({ r, style, samples, named: false, … }): its legs' samples end to end. No name is set along a network's lines.
export function drawNetwork(layer, records, projection, zones = [], clearance = () => 0) {
  const usable = records.filter((r) => r.coords && (r.waypoints ?? []).length >= 2);
  const net = buildNetwork(usable);
  const laid = layoutNetwork(net, projection);
  const style = usable.length ? routeStyle(usable[0]) : null;
  const legs = laid.legs.map((leg) => {
    const dash = DASH[leg.certainty] ?? 'solid';
    // (a leg too short to keep its head clear of the mark at its end, Detroit to Windsor on a map of the continent,
    // is drawn whole rather than lost)
    const kept = leg.terminal ? trimEnds(leg.samples, 0, clearance(leg.b, net.nodes.get(leg.b).coord)) : leg.samples;
    const samples = trimToZones(kept.length >= 2 ? kept : leg.samples, zones);
    return { ...leg, dash, samples };
  }).filter((l) => l.samples.length >= 2);
  // documented legs over approximate over conjectured, so a solid trunk is never broken by a dash drawn across it
  const rank = { solid: 2, dashed: 1, dotted: 0 };
  legs.sort((a, b) => rank[a.dash] - rank[b.dash]);
  const years = (r) => (r.start === r.end ? r.start : `${r.start} to ${r.end}`);
  // a paper casing under every leg, then the legs: a line reads over any fill, and a junction is one shape
  layer.selectAll('path.route-casing').data(legs, (d) => d.key).join('path')
    .attr('class', 'route-casing').attr('d', (d) => pathFrom(d.samples)).attr('stroke-width', style ? style.width + 2.6 : 0);
  const g = layer.selectAll('path.route').data(legs, (d) => d.key).join('path');
  g.attr('class', (d) => `route trunk ${style.color} ${style.tier} ${d.dash} ${usable[0].value}`)
    .attr('data-leg', (d) => d.key)
    .attr('d', (d) => pathFrom(d.samples))
    .attr('stroke-width', style?.width)
    .attr('stroke-dasharray', (d) => dashArray(d.dash, style.width))
    .attr('marker-end', (d) => (d.terminal && style.markerEnd ? `url(#route-head-${style.markerEnd}-${style.color})` : null));
  g.selectAll('title').remove();
  g.append('title').text((d) => d.records.map((r) => `${r.label} · ${years(r)}${r.source ? `\n${r.source}` : ''}`).join('\n\n'));
  const byRecord = new Map(usable.map((r) => [r.id, []]));
  for (const leg of legs) for (const r of leg.records) byRecord.get(r.id)?.push(leg);
  return usable.filter((r) => byRecord.get(r.id).length).map((r) => {
    const order = new Map(r.waypoints.map((id, i) => [id, i]));
    const mine = byRecord.get(r.id).slice().sort((a, b) => order.get(a.a) - order.get(b.a));
    return { r, style: { ...routeStyle(r), trunk: true }, samples: mine.flatMap((l) => l.samples), named: false, start: true, end: true, pathId: `network-${r.id}`,
      legs: mine.map((l) => ({ leg: l.key, shared_with: l.records.filter((x) => x.id !== r.id).map((x) => x.id), dash: l.dash })) };
  });
}

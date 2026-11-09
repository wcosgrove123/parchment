// Parchment — labels
// Stage labels (regions in spaced small caps, water in italic) set along their parallel so they follow the
// projection's curve; polity labels for highlighted states at the largest polygon's centre; and the label pass
// for point marks and route names, which measures every label and lets placement.js decide where it goes so
// that no text sits on text and no line runs through text.

import * as d3 from 'd3';
import { placeLabels, routeLabelCandidates, pointCandidates } from './placement.js';
import { yearLabel } from '../data/records.js';
import { pathFrom } from './routes.js';

export function drawStageLabels(layer, defs, stage, path) {
  (stage.labels ?? []).forEach((l, i) => {
    // The arc is only a guide for the text, so it can be much longer than the name; a short one clips the ends.
    const span = l.span ?? (l.kind === 'water' ? 50 : 70);
    const arc = { type: 'LineString', coordinates: d3.range(l.lon - span / 2, l.lon + span / 2 + 1e-6, 0.5).map((x) => [x, l.lat]) };
    const id = `stage-label-${stage.id}-${i}`;
    defs.append('path').attr('id', id).attr('d', path(arc));
    layer.append('text').attr('class', `label ${l.kind}`)
      .append('textPath').attr('href', `#${id}`).attr('startOffset', '50%').attr('text-anchor', 'middle')
      .text(l.text);
  });
}

// Largest polygon of a (Multi)Polygon feature, by spherical area.
function largestPolygon(f) {
  const g = f.geometry;
  if (g.type === 'Polygon') return g;
  let best = null, bestArea = -1;
  for (const coords of g.coordinates) {
    const poly = { type: 'Polygon', coordinates: coords };
    const a = d3.geoArea(poly);
    if (a > bestArea) { bestArea = a; best = poly; }
  }
  return best;
}

export function polityLabelData(features, path) {
  // One label per name: some base maps split a state into several same-named polygons; label the largest.
  const best = new Map();
  for (const f of features) {
    const poly = largestPolygon(f);
    if (!poly) continue;
    const [[bx0, by0], [bx1, by1]] = path.bounds(poly);
    const w = bx1 - bx0, h = by1 - by0;
    if (!(w > 70 && h > 24)) continue; // too small to carry a name at this scale
    const [cx, cy] = path.centroid(poly);
    if (!Number.isFinite(cx)) continue;
    const text = f.properties.cls?.label ?? f.properties.name;
    const area = w * h;
    const prev = best.get(text);
    if (prev && prev.area >= area) continue;
    const size = Math.max(13, Math.min(24, Math.sqrt(area) / 16));
    best.set(text, { id: text, text, x: cx, y: cy, size, area });
  }
  return [...best.values()];
}

export function drawPolityLabels(layer, data) {
  layer.selectAll('text').data(data, (d) => d.id).join('text')
    .attr('class', 'label polity')
    .attr('x', (d) => d.x).attr('y', (d) => d.y)
    .attr('font-size', (d) => d.size)
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .text((d) => d.text);
}

// ---------- the label pass for marks and routes ----------

export const MARK_FONT = 13; // px at 1920, bold; the date beside it in italic
export const ROUTE_FONT = 14; // px, italic, in the line's colour
const FAMILY = '"Libre Baskerville", Baskerville, Georgia, serif';

// Text width in px. In the browser a canvas measures the real font (loaded before the first render);
// anywhere else (tests) a fixed advance per glyph stands in, so the pass stays deterministic.
export function makeMeasure(doc = globalThis.document) {
  const ctx = doc?.createElement?.('canvas')?.getContext?.('2d');
  return (text, { size = MARK_FONT, bold = false, italic = false } = {}) => {
    if (!ctx) return text.length * size * (bold ? 0.66 : 0.6);
    ctx.font = `${italic ? 'italic ' : ''}${bold ? '700 ' : '400 '}${size}px ${FAMILY}`;
    return ctx.measureText(text).width;
  };
}

// Priority: capitals and route termini first, then dated places, then the rest (docs/ROUTES-STYLE.md §3).
export function labelPriority(r, termini) {
  if (r.value === 'capital' || termini.has(r.where)) return 1;
  if (r.start === r.end) return 2;
  return 3;
}

// Under the routes tracker a point prints its date only when it has one (start = end); a port called at across
// a voyage's span prints its name alone, the span stays in the hover. Other trackers print the date as always.
export function markWhen(r) {
  return r.tracker === 'routes' && r.start !== r.end ? '' : yearLabel(r);
}

// marks: from drawMarks; routes: from drawRoutes; zones: reserved rects; frame: the map's inner box.
// Draws every placed label into `layer` and returns the placement list.
// naive: every label at the first position with no checks (the old behaviour), for before/after pictures only.
// rivers (lesson maps on the North America page): [{ id, name, samples }], named along their line in italic water
// style like a route's name, and counted among the ten labelled places (owner question, 2026-11-06; DECISIONS).
// apart (lesson maps): marks closer than this many px label away from each other (placement.js, APART).
export function layoutLabels(layer, defs, { marks, routes, rivers = [], zones, frame, width = 1920, measure = makeMeasure(), maxPlaces = 10, naive = false, apart = 0 }) {
  const termini = new Set(routes.flatMap((d) => [d.r.waypoints[0], d.r.waypoints[d.r.waypoints.length - 1]]));
  const h = Math.round(MARK_FONT * 1.2);
  const pointLabels = marks.map((m) => {
    const when = markWhen(m.r);
    const w = measure(m.r.label, { bold: true }) + (when ? 5 + measure(when, { italic: true }) : 0);
    return { id: m.r.id, kind: 'point', priority: labelPriority(m.r, termini), x: m.x, y: m.y, radius: m.radius, w: Math.ceil(w), h, text: m.r.label, when };
  });
  const rh = Math.round(ROUTE_FONT * 1.1);
  // A route cut at the seam is several pieces: each is a line to keep labels off, only the longest carries the name.
  const routeLabels = routes.filter((d) => d.named !== false).map((d) => {
    const w = Math.ceil(measure(d.r.label, { size: ROUTE_FONT, italic: true }));
    return { id: `route-label-${d.r.id}`, kind: 'route', priority: 2.5, route: d.r.id, w, h: rh, text: d.r.label, color: d.style.color, samples: d.samples, width: d.style.width,
      candidates: routeLabelCandidates(d.samples, w, rh, { gap: d.style.width / 2 + 3 }) };
  });
  const riverLabels = rivers.filter((r) => r.samples?.length > 1).map((r) => {
    const w = Math.ceil(measure(r.name, { size: ROUTE_FONT, italic: true }) + r.name.length * ROUTE_FONT * 0.08);
    return { id: `river-label-${r.id}`, kind: 'route', priority: 2.7, place: true, w, h: rh, text: r.name, color: 'water', samples: r.samples, width: 1.2,
      candidates: routeLabelCandidates(r.samples, w, rh, { gap: 3, minStraightness: 0.9 }) };
  });
  const byId = new Map([...pointLabels, ...routeLabels, ...riverLabels].map((l) => [l.id, l]));
  const result = naive ? pointLabels.map((l) => ({ id: l.id, kind: 'point', box: pointCandidates(l)[0], pos: 'E' })) : placeLabels({
    labels: [...pointLabels, ...routeLabels, ...riverLabels],
    marks: marks.map((m) => ({ id: m.r.id, x: m.x, y: m.y, radius: m.radius })),
    routes: routes.map((d) => ({ id: d.r.id, samples: d.samples })),
    zones, frame, width, maxPlaces, apart,
  });

  // Leaders under the text, then point labels, then route names along their (possibly reversed) line.
  const placedPoints = result.filter((p) => p.kind === 'point' && p.box).map((p) => ({ ...p, l: byId.get(p.id) }));
  const placedRoutes = result.filter((p) => p.kind === 'route' && p.box).map((p) => ({ ...p, l: byId.get(p.id) }));

  layer.selectAll('line.leader').data(placedPoints.filter((p) => p.leader), (p) => p.id).join('line')
    .attr('class', 'leader')
    .attr('x1', (p) => p.leader[0][0]).attr('y1', (p) => p.leader[0][1]).attr('x2', (p) => p.leader[1][0]).attr('y2', (p) => p.leader[1][1]);

  const t = layer.selectAll('text.mark-label').data(placedPoints, (p) => p.id).join((enter) => {
    const e = enter.append('text').attr('class', 'mark-label');
    e.append('tspan').attr('class', 'what');
    e.append('tspan').attr('class', 'when').attr('dx', 5);
    return e;
  });
  t.attr('x', (p) => p.box.x).attr('y', (p) => p.box.y + h * 0.78).attr('data-pos', (p) => p.pos);
  t.select('tspan.what').text((p) => p.l.text);
  t.select('tspan.when').text((p) => p.l.when);

  defs.selectAll('path.route-label-guide').data(placedRoutes, (p) => p.id).join('path')
    .attr('class', 'route-label-guide').attr('id', (p) => `${p.id}-guide`)
    .attr('d', (p) => pathFrom(p.reverse ? [...p.l.samples].reverse() : p.l.samples));
  const rt = layer.selectAll('text.route-label').data(placedRoutes, (p) => p.id).join((enter) => {
    const e = enter.append('text');
    e.append('textPath').attr('text-anchor', 'middle');
    return e;
  });
  rt.attr('class', (p) => `route-label ${p.l.color}`).attr('dy', (p) => -(p.l.width / 2 + 3));
  rt.select('textPath').attr('href', (p) => `#${p.id}-guide`).attr('startOffset', (p) => `${((p.reverse ? 1 - p.startOffset : p.startOffset) * 100).toFixed(1)}%`).text((p) => p.l.text);
  return result;
}

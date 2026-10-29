// Parchment — labels
// Stage labels (regions in spaced small caps, water in italic) set along their parallel so they follow the
// projection's curve; polity labels for highlighted states at the largest polygon's centre.

import * as d3 from 'd3';

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

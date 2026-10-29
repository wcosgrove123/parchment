// Parchment — point marks
// Records of kind "point" drawn at their gazetteer coordinates, shaped by event type (grammar §5).
// Coordinates come from data/records.csv, filled by scripts/geocode.mjs from Wikidata; never typed by hand.

import { SHAPES } from './legend.js';
import { yearLabel } from '../data/records.js';

// records: validated rows with lon/lat; projection: the stage projection. Rows without coordinates are skipped.
export function drawMarks(layer, records, projection) {
  const placed = records
    .filter((r) => r.lon != null && r.lat != null && r.shape)
    .map((r) => ({ r, xy: projection([r.lon, r.lat]) }))
    .filter((m) => m.xy && Number.isFinite(m.xy[0]));
  const g = layer.selectAll('g.mark-group').data(placed, (m) => m.r.id).join((enter) => {
    const e = enter.append('g').attr('class', 'mark-group');
    e.append('path').attr('class', (m) => `mark ${m.r.shape}`).attr('d', (m) => SHAPES[m.r.shape] ?? SHAPES.circle);
    e.append('title');
    const t = e.append('text').attr('class', 'mark-label').attr('x', 11).attr('y', 4);
    t.append('tspan').attr('class', 'what');
    t.append('tspan').attr('class', 'when').attr('dx', 5);
    return e;
  });
  g.attr('transform', (m) => `translate(${m.xy[0]},${m.xy[1]})`);
  g.select('title').text((m) => `${m.r.label} · ${yearLabel(m.r)}${m.r.source ? `\n${m.r.source}` : ''}`);
  g.select('tspan.what').text((m) => m.r.label);
  g.select('tspan.when').text((m) => yearLabel(m.r));
  return placed.length;
}

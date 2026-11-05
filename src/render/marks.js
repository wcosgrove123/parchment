// Parchment — point marks
// Records of kind "point" drawn at their gazetteer coordinates, shaped by event type (grammar §5).
// Coordinates come from data/records.csv, filled by scripts/geocode.mjs from Wikidata; never typed by hand.
// The marks carry no text of their own: names are set by the label pass (labels.js) so none sits on another.

import { SHAPES } from './legend.js';
import { yearLabel } from '../data/records.js';

// Radius of each shape, for the label pass to keep clear of.
export const MARK_RADIUS = { 'rust-diamond': 7, 'moss-circle': 6, 'steel-circle': 5, 'navy-square': 6, 'navy-triangle': 7, circle: 6 };

// records: validated rows with lon/lat; projection: the stage projection. Rows without coordinates are skipped.
// → [{ r, x, y, radius }] in the order given.
export function drawMarks(layer, records, projection) {
  const placed = records
    .filter((r) => r.lon != null && r.lat != null && r.shape)
    .map((r) => ({ r, xy: projection([r.lon, r.lat]) }))
    .filter((m) => m.xy && Number.isFinite(m.xy[0]))
    .map((m) => ({ r: m.r, x: m.xy[0], y: m.xy[1], radius: MARK_RADIUS[m.r.shape] ?? 6 }));
  const g = layer.selectAll('g.mark-group').data(placed, (m) => m.r.id).join((enter) => {
    const e = enter.append('g').attr('class', 'mark-group');
    e.append('path').attr('class', (m) => `mark ${m.r.shape}`).attr('d', (m) => SHAPES[m.r.shape] ?? SHAPES.circle);
    e.append('title');
    return e;
  });
  g.attr('transform', (m) => `translate(${m.x},${m.y})`);
  g.select('title').text((m) => `${m.r.label} · ${yearLabel(m.r)}${m.r.source ? `\n${m.r.source}` : ''}`);
  return placed;
}

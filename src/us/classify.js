// Parchment — North America stage: the statehood deck's three classification trackers (brief of 2026-11-18, item 5).
// No drawing here; the tests load it alone.
//   paths    how each state was admitted (the deck outline's Taxonomy 2): a row per Newberry state id in
//            data/us/statehood-paths.csv; five fills (owner, 2026-11-18: "paths get 5").
//   chapters which chapter of the deck each state is in: data/us/statehood-chapters.csv; the order lights a chapter
//            (owner: one chapter per slide), each lit chapter a fill of its own, at most four, a fifth hatched.
//   pieces   how the land became U.S. land (Taxonomy 1): the dated pieces of data/us/pieces.topojson, computed by
//            scripts/derive-pieces.mjs from the Newberry's own polygons; four fills, Claimed hatched (owner).
// A class is a row of a table or a computed piece, never a shape drawn here: the states keep the Newberry's shapes.

import { feature } from 'topojson-client';
import polygonClipping from 'polygon-clipping';
import { parseCSV } from '../data/records.js';
import { parseDate } from './dates.js';

export const CLASS_TRACKERS = new Set(['paths', 'chapters', 'pieces']);

// A table of one row per Newberry polygon id per period, read as the slavery-status table is: a bad row is skipped
// and listed, never fatal. `column` holds the class; `values`, when given, are the only ones allowed.
export function prepareClassTable(text, { file, column, values = null }) {
  const out = { rows: [], byId: new Map(), problems: [], file, column };
  if (!text) { out.problems.push(`${file} could not be read`); return out; }
  const table = parseCSV(text);
  const head = (table[0] ?? []).map((h) => h.trim());
  const col = Object.fromEntries(head.map((h, i) => [h, i]));
  for (const c of ['id', column]) if (!(c in col)) { out.problems.push(`${file} has no ${c} column`); return out; }
  for (let i = 1; i < table.length; i++) {
    const get = (c) => (c in col ? (table[i][col[c]] ?? '') : '').trim();
    const id = get('id');
    if (!id) continue;
    const value = get(column);
    if (values && !values.includes(value)) { out.problems.push(`${file}, line ${i + 1} (${id}): ${column} "${value}" is not one of ${values.join(', ')}; the row is skipped`); continue; }
    const s = get('start') ? parseDate(get('start')) : null, e = get('end') ? parseDate(get('end')) : null;
    if ((get('start') && s == null) || (get('end') && e == null)) { out.problems.push(`${file}, line ${i + 1} (${id}): a date could not be read; the row is skipped`); continue; }
    const row = { id, name: get('name') || id, value, title: get('title') || null, s, e, start: get('start') || null, end: get('end') || null, source: get('source') || null, note: get('note') || null };
    out.rows.push(row);
    if (!out.byId.has(id)) out.byId.set(id, []);
    out.byId.get(id).push(row);
  }
  return out;
}

// The row in force for a Newberry polygon on a date, or null.
export const classRow = (table, p, date) => (table?.byId.get(p.id) ?? []).find((r) => (r.s == null || r.s <= date) && (r.e == null || date <= r.e)) ?? null;

// Paths: a state with a row takes its path's fill; anything else (a territory, not yet admitted; the District) is paper.
// `keys`: what a highlight may name to light it besides its own names ("enabled", "path-enabled").
export function pathLook(table, tracker, it, date) {
  const row = it.p.type === 'State' ? classRow(table, it.p, date) : null;
  const c = row ? tracker.classes[row.value] : null;
  if (!c) return { look: { fill: null, label: null }, row: null, keys: [] };
  return { look: { fill: c.fill, label: c.label, cat: `path-${row.value}` }, row, keys: [row.value, `path-${row.value}`] };
}

// Chapters: every polygon in the table wears one neutral fill until an order lights a chapter (chapterFills).
export function chapterLook(table, tracker, it, date) {
  const row = classRow(table, it.p, date);
  if (!row) return { look: { fill: null, label: null }, row: null, keys: [] };
  const n = Number(row.value);
  return { look: { fill: tracker.unlit.fill, label: tracker.unlit.label, cat: 'unlit-chapter' }, row, keys: [`chapter-${n}`, `ch${n}`, `chapter ${n}`, row.title].filter(Boolean) };
}
export const chapterLabel = (n, title) => `Chapter ${n} · ${title}`;
// Once the highlight has lit some chapters: each lit chapter a fill of its own, in chapter order, from the tracker's
// four (grammar §5); a fifth and later chapter hatched, each with its own key line.
export function chapterFills(items, tracker) {
  const lit = items.filter((it) => it.src === 'newberry' && it.lit && it.classRow);
  const order = [...new Set(lit.map((it) => Number(it.classRow.value)))].sort((a, b) => a - b);
  for (const it of lit) {
    const n = Number(it.classRow.value), fill = tracker.fills[order.indexOf(n)];
    const label = chapterLabel(n, it.classRow.title);
    it.look = fill ? { fill, label, cat: `chapter-${n}` } : { pattern: 'hatch', label, area: label };
  }
  return order;
}

// Pieces: the dated pieces from scripts/derive-pieces.mjs, each with its acquisition's row.
export function preparePieces(topo) {
  if (!topo?.objects?.pieces) return null;
  const rows = new Map((topo.acquisitions ?? []).map((a) => [a.key, a]));
  const items = feature(topo, topo.objects.pieces).features.map((f) => ({ src: 'piece', f, p: { ...(rows.get(f.properties.key) ?? {}), ...f.properties } }));
  return { items, acquisitions: topo.acquisitions ?? [], shares: topo.shares ?? null, source: topo._source ?? null };
}
export const piecesOn = (pieces, date) => (pieces?.items ?? []).filter((it) => it.p.s <= date && date <= it.p.e);
// A piece's look: its label's fill, Claimed's hatch (keyed as its own line); a piece with no label (a claim that was
// not an acquisition, data/us/acquisitions.csv) is paper.
export function pieceLook(tracker, p) {
  const c = p.label ? tracker.labels[p.label] : null;
  if (!c) return { fill: null, label: null };
  return c.pattern ? { pattern: c.pattern, label: c.label, area: c.label } : { fill: c.fill, label: c.label, cat: p.label };
}

// Under a highlight, the pieces inside the lit polygons only (Colorado's four pieces on Colorado's slide): each
// piece's intersection with them, computed from the two downloaded-and-derived shapes. → new piece items.
const forD3 = (mp) => mp.map((poly) => poly.map((r) => [...r].reverse()));
const pcRings = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
const clipCache = new Map();
export function clipPieces(pieces, lit) {
  if (!lit.length) return [];
  const key = (it) => `${it.p.key}.${it.p.s}|${lit.map((x) => `${x.p.id}.${x.p.v}`).sort().join(',')}`;
  const within = lit.map((x) => pcRings(x.f));
  const out = [];
  for (const it of pieces) {
    const k = key(it);
    if (!clipCache.has(k)) {
      let mp = [];
      try { mp = polygonClipping.intersection(pcRings(it.f), polygonClipping.union(...within)); } catch { mp = []; }
      clipCache.set(k, mp.length ? { ...it, f: { type: 'Feature', properties: it.f.properties, geometry: { type: 'MultiPolygon', coordinates: forD3(mp) } }, clipped: true } : null);
    }
    const c = clipCache.get(k);
    if (c) out.push(c);
  }
  return out;
}

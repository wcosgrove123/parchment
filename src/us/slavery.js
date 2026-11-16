// Parchment — North America stage: the slavery-status tracker's model (no drawing; the tests load it alone).
// The status of a state is a row of a table, never a shape: data/us/slavery-status.csv gives, per Newberry polygon id
// (al_state, mo_terr…), a status (`free` or `slave`), the days it held (blank: from the polygon's first day, to its
// last) and a source. The shapes stay the Newberry's. A territory with no row of its own takes the tracker's one
// neutral fill; when a territory's status is entered (the Compromise of 1850, Kansas-Nebraska) it is a row here,
// with its dates, and the table's shape does not change. The table speaks only inside the tracker's `coverage`
// (src/us/trackers.json): outside it no state is given a status, and the legend says so.

import { parseCSV } from '../data/records.js';
import { parseDate } from './dates.js';

export const STATUSES = ['free', 'slave'];

// The table's text → { rows, byId, problems }. A bad row is skipped and listed, never fatal.
export function prepareSlavery(text) {
  const out = { rows: [], byId: new Map(), problems: [], file: 'data/us/slavery-status.csv' };
  if (!text) return out;
  const table = parseCSV(text);
  const head = (table[0] ?? []).map((h) => h.trim());
  const col = Object.fromEntries(head.map((h, i) => [h, i]));
  for (const c of ['id', 'status']) if (!(c in col)) { out.problems.push(`the status table has no ${c} column`); return out; }
  for (let i = 1; i < table.length; i++) {
    const get = (c) => (table[i][col[c]] ?? '').trim();
    const id = get('id');
    if (!id) continue;
    const status = get('status');
    if (!STATUSES.includes(status)) { out.problems.push(`status table, line ${i + 1} (${id}): status "${status}" is not free or slave; the row is skipped`); continue; }
    const s = get('start') ? parseDate(get('start')) : null, e = get('end') ? parseDate(get('end')) : null;
    if ((get('start') && s == null) || (get('end') && e == null)) { out.problems.push(`status table, line ${i + 1} (${id}): a date could not be read; the row is skipped`); continue; }
    const row = { id, name: get('name') || id, status, s, e, start: get('start') || null, end: get('end') || null, source: get('source') || null, note: get('note') || null };
    out.rows.push(row);
    if (!out.byId.has(id)) out.byId.set(id, []);
    out.byId.get(id).push(row);
  }
  return out;
}

export const covered = (tracker, date) => { const [a, b] = tracker?.coverage ?? [-Infinity, Infinity]; return date >= a && date <= b; };

// The row in force for a Newberry polygon on a date, or null.
export function statusRow(table, tracker, p, date) {
  if (!table || !covered(tracker, date)) return null;
  return (table.byId.get(p.id) ?? []).find((r) => (r.s == null || r.s <= date) && (r.e == null || date <= r.e)) ?? null;
}

const TERRITORY = /^(Territory|Unorganized Territory)$/;

// A Newberry polygon's look under this tracker: its row's status; a territory without a row, the neutral fill;
// anything else (the District of Columbia, a republic, a joint or disputed area, a state outside the table) paper.
export function slaveryLook(table, tracker, it, date) {
  const row = statusRow(table, tracker, it.p, date);
  if (row) { const d = tracker.statuses[row.status]; return { look: { fill: d.fill, label: d.label, cat: row.status }, status: row.status, row }; }
  if (TERRITORY.test(it.p.type)) return { look: { fill: tracker.territory.fill, label: tracker.territory.label, cat: 'territory' }, status: 'territory', row: null };
  return { look: { fill: null, label: null }, status: null, row: null };
}

// Legend rows, in a fixed order whatever the date (two maps side by side share a key): free, slave, territories.
export function slaveryLegend(tracker, present, date) {
  const rows = [];
  for (const k of STATUSES) { const d = tracker.statuses[k]; if (present.has(`fill:${d.fill}:${k}`)) rows.push({ swatch: 'fill', key: d.fill, label: d.label }); }
  if (present.has(`fill:${tracker.territory.fill}:territory`)) rows.push({ swatch: 'fill', key: tracker.territory.fill, label: tracker.territory.label });
  if (!covered(tracker, date)) rows.push({ swatch: 'none', label: tracker.uncovered });
  return rows;
}

// For the packing slip: the count of states by status on a date, over the whole country and by name.
export function slaveryCount(table, tracker, nbAlive, date) {
  const states = nbAlive.filter((it) => it.p.type === 'State');
  const by = { free: [], slave: [], none: [] };
  for (const it of states) { const r = statusRow(table, tracker, it.p, date); by[r ? r.status : 'none'].push(it.p.name); }
  for (const k of Object.keys(by)) by[k].sort();
  return { states: states.length, free: by.free.length, slave: by.slave.length, without_a_row: by.none, free_states: by.free, slave_states: by.slave };
}

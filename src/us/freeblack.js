// Parchment — North America stage: the free Black population tracker's model (no drawing; the tests load it alone).
// The fills are the slavery-status tracker's (src/us/slavery.js): free state, slave state, territories. Over them
// stand number badges (grammar §5: a quantity is a number badge): the census's count of free Black people in each of
// the ten states that held the most. Nothing is shaded by amount. The counts are the Census Bureau's
// (data/us/census-free-slave-1790-1860.csv, scripts/census-wp56-free.mjs), which gives each state within its
// present-day borders: a row is added onto the polygon of the date that holds a point inside that state (Virginia in
// 1860 takes West Virginia's row), through the anchors of data/us/native.json. Nothing is interpolated between counts.

import { geoContains } from 'd3';
import { parseCSV } from '../data/records.js';
import { statusRow } from './slavery.js';

// Census Day: the first Monday of August to 1820, 1 June from 1830.
export const CENSUS_DAY = { 1790: 17900802, 1800: 18000804, 1810: 18100806, 1820: 18200807, 1830: 18300601, 1840: 18400601, 1850: 18500601, 1860: 18600601 };
const REGION = /^United States$|(Region|Division)$/;
export const SOURCE = 'U.S. Census Bureau, Population Division Working Paper No. 56 (C. Gibson and K. Jung, 2002), state tables: Black population, free and slave';
export const BADGES = 10;

// The table's text → { census: [{ year, day, us, states: [{ state, free, slave, black, total }] }] }, oldest first.
export function prepareFree(text) {
  const out = { census: [], file: 'data/us/census-free-slave-1790-1860.csv', problems: [] };
  if (!text) return out;
  const table = parseCSV(text);
  const col = Object.fromEntries((table[0] ?? []).map((h, i) => [h.trim(), i]));
  for (const c of ['state', 'year', 'free', 'slave']) if (!(c in col)) { out.problems.push(`the census table has no ${c} column`); return out; }
  const byYear = new Map();
  for (let i = 1; i < table.length; i++) {
    const r = table[i];
    const state = (r[col.state] ?? '').trim(), year = Number(r[col.year]);
    if (!state || !CENSUS_DAY[year]) continue;
    const row = { state, free: Number(r[col.free]), slave: Number(r[col.slave]), black: Number(r[col.black]), total: Number(r[col.total]) };
    if (!byYear.has(year)) byYear.set(year, { year, day: CENSUS_DAY[year], us: null, states: [] });
    if (state === 'United States') byYear.get(year).us = row;
    else if (!REGION.test(state)) byYear.get(year).states.push(row);
  }
  out.census = [...byYear.values()].sort((a, b) => a.year - b.year);
  return out;
}

// The census taken on or before the date, or null before the first.
export function freeCensusOn(table, date) {
  let out = null;
  for (const c of table?.census ?? []) if (c.day <= date) out = c;
  return out;
}

const key = (p) => `${p.id}.${p.v}`;

// The picture of a date: each polygon's count (its present-day states added up), the ten largest as badges, and
// the nation's free Black people by the status of where they lived. `statusOf(it)` → 'free' | 'slave' | other.
export function freeOn(table, anchors, nbAlive, date, { slavery = null, tracker = null } = {}) {
  const census = freeCensusOn(table, date);
  if (!census) return null;
  const units = new Map(), outside = [];
  for (const s of census.states) {
    const pt = anchors?.[s.state];
    const it = pt && nbAlive.find((x) => geoContains(x.f, pt));
    if (!it) { outside.push(s); continue; }
    const u = units.get(key(it.p)) ?? { it, id: it.p.id, name: it.p.name, type: it.p.type, free: 0, slave: 0, rows: [] };
    u.free += s.free; u.slave += s.slave; u.rows.push(s.state);
    units.set(key(it.p), u);
  }
  const by = { free: 0, slave: 0, elsewhere: 0 };
  for (const u of units.values()) {
    u.status = it2status(slavery, tracker, u.it, date);
    by[u.status === 'free' || u.status === 'slave' ? u.status : 'elsewhere'] += u.free;
  }
  for (const s of outside) by.elsewhere += s.free;
  const ranked = [...units.values()].filter((u) => u.free > 0).sort((a, b) => b.free - a.free);
  const top = new Set(ranked.slice(0, BADGES).map((u) => key(u.it.p)));
  return {
    census, units, outside, by, total: census.us?.free ?? ranked.reduce((a, u) => a + u.free, 0), ranked,
    badgeOf: (p) => (top.has(key(p)) ? { badge: units.get(key(p)).free.toLocaleString('en-US') } : null),
    unitOf: (p) => units.get(key(p)) ?? null,
  };
}
function it2status(slavery, tracker, it, date) {
  const row = slavery && tracker ? statusRow(slavery, tracker, it.p, date) : null;
  return row ? row.status : /Territory/.test(it.p.type) ? 'territory' : null;
}

const pct = (n, of) => (of ? `${Math.round((n / of) * 100)}%` : '');
// Legend lines under the status fills: the count, where those people lived, and what the numbers on the map are.
export function freeLegend(fb) {
  if (!fb) return [{ swatch: 'none', label: 'No census yet (first: 1790)' }];
  const n = (x) => x.toLocaleString('en-US');
  const rows = [{ swatch: 'none', label: `Free Black people, ${fb.census.year} census: ${n(fb.total)}` }];
  if (fb.by.slave + fb.by.free > 0) {
    rows.push({ swatch: 'none', label: `In slave states: ${n(fb.by.slave)} (${pct(fb.by.slave, fb.total)})` });
    rows.push({ swatch: 'none', label: `In free states: ${n(fb.by.free)} (${pct(fb.by.free, fb.total)})` });
    if (fb.by.elsewhere) rows.push({ swatch: 'none', label: `In territories and D.C.: ${n(fb.by.elsewhere)} (${pct(fb.by.elsewhere, fb.total)})` });
  }
  rows.push({ swatch: 'none', label: `Numbers: the ${Math.min(BADGES, fb.ranked.length)} largest counts` });
  return rows;
}

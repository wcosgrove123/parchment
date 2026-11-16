#!/usr/bin/env node
// Parchment — census-wp56-free.mjs
// Reads, for every state and the nation, the census counts of 1790–1860 that divide the Black population into free
// and slave, from the Census Bureau's Population Division Working Paper No. 56 (Campbell Gibson and Kay Jung, 2002,
// "Historical Census Statistics on Population Totals by Race, 1790 to 1990 ... for the United States, Regions,
// Divisions, and States"; public domain), which is published as a PDF. The same PDF feeds scripts/census-wp56.py.
//
//   pdftotext -table data/base/raw/census/POP-twps0056.pdf wp56-table.txt     (pdftotext ships with Git for Windows)
//   node scripts/census-wp56-free.mjs wp56-table.txt
//
// Writes data/us/census-free-slave-1790-1860.csv: state,year,total,white,black,free,slave,row
// The printed numbers run together ("1 219 630 691 773 527 763 ..."), so a row is split only where the census's own
// arithmetic holds: Total = White + Black (+ American Indian + Asian), the two printings of Black agree, and
// Black = Free + Slave. A row that no split satisfies is reported and left out, never guessed. The states of each
// year are then added up against the nation's own row.
// The paper counts each state within its present-day borders (Virginia's 1860 row leaves out the counties that
// became West Virginia, which has a row of its own): the page adds rows onto the polygons of the date.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'us', 'census-free-slave-1790-1860.csv');
const src = process.argv[2];
if (!src) { console.error('usage: node scripts/census-wp56-free.mjs wp56-table.txt'); process.exit(2); }

const TITLE = /Table\s+(\d+)\.\s+(.+?)\s+-\s+Race\s+and\s+Hispanic\s+Origin/;
const YEAR = /^\s*(1[78]\d0)(?:\s*\/?\s*(\d))?\s*\.{2,}\s*(.*)$/;
const NA = new Set(['(NA)', '(X)', '(Z)']);

// every way to read one cell starting at tokens[i]: [value, next index]; "-" is the census's zero
function cellsAt(tokens, i) {
  const t = tokens[i];
  if (NA.has(t)) return [[null, i + 1]];
  if (t === '-') return [[0, i + 1]];
  if (/^\d{1,3}(,\d{3})+$/.test(t)) return [[Number(t.replace(/,/g, '')), i + 1]];
  if (!/^\d{1,3}$/.test(t)) return [];
  const out = [];
  let v = Number(t), j = i + 1;
  out.push([v, j]);
  while (j < tokens.length && /^\d{3}$/.test(tokens[j])) { v = v * 1000 + Number(tokens[j]); j += 1; out.push([v, j]); }
  return out;
}

// total, white, black, american indian, asian, black again, free, slave
function splitRow(tokens) {
  const found = [];
  (function rec(i, cells) {
    if (cells.length === 8) {
      if (i !== tokens.length) return;
      const [total, white, black, ai, as, black2, free, slave] = cells;
      if (total == null || white == null || black == null || free == null || slave == null) return;
      if (total !== white + black + (ai ?? 0) + (as ?? 0)) return;
      if (black !== black2 || black !== free + slave) return;
      found.push(cells);
      return;
    }
    if (i >= tokens.length) return;
    for (const [v, j] of cellsAt(tokens, i)) rec(j, [...cells, v]);
  })(0, []);
  // (two readings can both add up only by moving a digit group between neighbors that the checks tie together;
  // when it happens the row is reported, not chosen)
  const distinct = [...new Map(found.map((c) => [c.join(','), c])).values()];
  return distinct.length === 1 ? distinct[0] : distinct.length ? 'ambiguous' : null;
}

const pages = readFileSync(src, 'utf8').split('\f');
const rows = [], problems = [];
for (const text of pages) {
  const m = TITLE.exec(text);
  if (!m) continue;
  const place = m[2].replace(/\s+/g, ' ').trim();
  let inNumber = false;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith('NUMBER')) { inNumber = true; continue; }
    if (line.trim().startsWith('PERCENT')) break;
    if (!inNumber) continue;
    const ym = YEAR.exec(line);
    if (!ym) continue;
    const year = Number(ym[1]);
    if (year > 1860) continue;
    const label = `${year}${ym[2] ? ` ${ym[2]}` : ''}`;
    const tokens = ym[3].replace(/ /g, ' ').split(/\s+/).filter(Boolean);
    const cells = splitRow(tokens);
    if (!cells || cells === 'ambiguous') { problems.push(`${place} ${label}: ${cells ?? 'no split adds up'}: ${ym[3].trim().slice(0, 100)}`); continue; }
    rows.push({ state: place, year, total: cells[0], white: cells[1], black: cells[2], free: cells[6], slave: cells[7], row: label });
  }
}
// a table printed on two readings of the same page would repeat: keep the first of each (state, row)
const seen = new Set();
const kept = rows.filter((r) => { const k = `${r.state}|${r.row}`; if (seen.has(k)) return false; seen.add(k); return true; });

// the states of each year against the nation's own row
const REGION = /^United States$|(Region|Division)$/;
const checks = [];
for (const year of [...new Set(kept.map((r) => r.year))].sort()) {
  const us = kept.find((r) => r.state === 'United States' && r.year === year);
  const states = kept.filter((r) => r.year === year && !REGION.test(r.state));
  const sum = (k) => states.reduce((a, r) => a + r[k], 0);
  checks.push({ year, states: states.length, free: sum('free'), slave: sum('slave'), us_free: us?.free ?? null, us_slave: us?.slave ?? null, agree: !!us && us.free === sum('free') && us.slave === sum('slave') });
}

const esc = (c) => (/[,"]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : String(c));
writeFileSync(OUT, `${[['state', 'year', 'total', 'white', 'black', 'free', 'slave', 'row'], ...kept.map((r) => [r.state, r.year, r.total, r.white, r.black, r.free, r.slave, r.row])].map((r) => r.map(esc).join(',')).join('\n')}\n`);
console.log(`${kept.length} rows from ${new Set(kept.map((r) => r.state)).size} tables → ${OUT.slice(ROOT.length + 1)}; ${problems.length} rows not read`);
for (const p of problems) console.log('  not read:', p);
for (const c of checks) console.log(`  ${c.year}: ${c.states} states, free ${c.free.toLocaleString('en-US')}, slave ${c.slave.toLocaleString('en-US')}; the nation's row: free ${c.us_free?.toLocaleString('en-US')}, slave ${c.us_slave?.toLocaleString('en-US')} ${c.agree ? '✓' : '✗ DIFFERS'}`);

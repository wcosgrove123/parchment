#!/usr/bin/env node
// Parchment — geocode.mjs
// Fills blank lon/lat in data/records.csv from Wikidata (property P625, CC0) for rows whose `where` is a QID.
// Coordinates are never typed by hand (brief §1, §4). Rows that already have both are left alone.
//   node scripts/geocode.mjs [--force]      (--force refreshes every QID row)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'data', 'records.csv');
const force = process.argv.includes('--force');

const rows = parseCSV(readFileSync(FILE, 'utf8'));
const header = rows[0];
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
for (const c of ['where', 'lon', 'lat', 'kind']) if (!(c in col)) { console.error(`records.csv has no ${c} column`); process.exit(1); }

const cache = new Map();
async function lookup(qid) {
  if (!cache.has(qid)) {
    cache.set(qid, (async () => {
      const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`, { headers: { 'user-agent': 'parchment-atlas/0.1 (classroom atlas; geocode script)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ent = (await res.json()).entities?.[qid];
      const v = ent?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (!v) throw new Error('no coordinate (P625) on Wikidata');
      const label = ent.labels?.en?.value ?? qid;
      return { lon: +v.longitude.toFixed(4), lat: +v.latitude.toFixed(4), label };
    })());
  }
  return cache.get(qid);
}

let filled = 0, failed = 0;
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const where = (row[col.where] ?? '').trim();
  if (!/^Q\d+$/.test(where)) continue;
  const has = (row[col.lon] ?? '').trim() !== '' && (row[col.lat] ?? '').trim() !== '';
  if (has && !force) continue;
  try {
    const { lon, lat, label } = await lookup(where);
    row[col.lon] = String(lon);
    row[col.lat] = String(lat);
    filled++;
    console.log(`  line ${r + 1}: ${where} (${label}) → ${lon}, ${lat}`);
  } catch (err) {
    failed++;
    console.log(`  line ${r + 1}: ${where} not filled: ${err.message}`);
  }
}

const quote = (s) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
writeFileSync(FILE, rows.map((row) => row.map((f) => quote(f ?? '')).join(',')).join('\n') + '\n');
console.log(`geocode: ${filled} filled, ${failed} not filled`);
if (failed) process.exitCode = 1;

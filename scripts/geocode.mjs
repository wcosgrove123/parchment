#!/usr/bin/env node
// Parchment — geocode.mjs
// Coordinates are never typed by hand (brief §1, §4). This script looks every Wikidata id in data/records.csv up
// on Wikidata (property P625, CC0) and keeps the answers in data/gazetteer.json: id → lon, lat, label, fetched date.
//   point rows:        `where` is one id; blank lon/lat are filled in the CSV as before.
//   path / arrow rows: `where` is an ordered list of ids joined by ">"; each id goes into the gazetteer, the CSV
//                      keeps only the ids (the map reads the coordinates from the gazetteer).
// Wikidata's rate limit is respected: one request at a time, a pause between requests, retry with a longer wait
// on 429 or a network error, and the gazetteer is written after every answer so a stopped run resumes where it was.
//   node scripts/geocode.mjs [--force]      (--force refreshes every id, cached or not)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV, routeIds } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'data', 'records.csv');
const GAZ = join(ROOT, 'data', 'gazetteer.json');
const force = process.argv.includes('--force');
const PAUSE_MS = 600; // between requests
const RETRY_MS = [2000, 5000, 15000, 30000];
const UA = 'parchment-atlas/0.1 (classroom atlas; geocode script)';

const rows = parseCSV(readFileSync(FILE, 'utf8'));
const header = rows[0];
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
for (const c of ['where', 'lon', 'lat', 'kind']) if (!(c in col)) { console.error(`records.csv has no ${c} column`); process.exit(1); }

const gazetteer = existsSync(GAZ) ? JSON.parse(readFileSync(GAZ, 'utf8')) : {};
const save = () => writeFileSync(GAZ, JSON.stringify(Object.fromEntries(Object.entries(gazetteer).sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))), null, 2) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchEntity(qid) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`, { headers: { 'user-agent': UA } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) return { error: `HTTP ${res.status}` };
      const ent = (await res.json()).entities?.[qid];
      const v = ent?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (!v) return { error: 'no coordinate (P625) on Wikidata' };
      return { lon: +v.longitude.toFixed(4), lat: +v.latitude.toFixed(4), label: ent.labels?.en?.value ?? qid };
    } catch (err) {
      if (attempt >= RETRY_MS.length) return { error: err.message };
      const wait = RETRY_MS[attempt];
      console.log(`  ${qid}: ${err.message}; waiting ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

// Every id the table names, in order of first appearance, with the lines that use it.
const uses = new Map();
const use = (qid, line) => { if (!uses.has(qid)) uses.set(qid, []); uses.get(qid).push(line); };
for (let r = 1; r < rows.length; r++) {
  const where = (rows[r][col.where] ?? '').trim();
  if (/^Q\d+$/.test(where)) use(where, r + 1);
  else for (const q of routeIds(where) ?? []) use(q, r + 1);
}

let fetched = 0, cached = 0, failed = 0;
for (const [qid, lines] of uses) {
  if (gazetteer[qid] && !force) { cached++; continue; }
  const got = await fetchEntity(qid);
  if (got.error) { failed++; console.log(`  ${qid} (lines ${lines.join(', ')}): not found: ${got.error}`); }
  else {
    gazetteer[qid] = { ...got, fetched: new Date().toISOString().slice(0, 10) };
    fetched++;
    console.log(`  ${qid} (lines ${lines.join(', ')}): ${got.label} → ${got.lon}, ${got.lat}`);
    save();
  }
  await sleep(PAUSE_MS);
}

// Point rows: fill blank lon/lat from the gazetteer, as before.
let filled = 0;
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const where = (row[col.where] ?? '').trim();
  if (!/^Q\d+$/.test(where) || !gazetteer[where]) continue;
  const has = (row[col.lon] ?? '').trim() !== '' && (row[col.lat] ?? '').trim() !== '';
  if (has && !force) continue;
  row[col.lon] = String(gazetteer[where].lon);
  row[col.lat] = String(gazetteer[where].lat);
  filled++;
}
const quote = (s) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
writeFileSync(FILE, rows.map((row) => row.map((f) => quote(f ?? '')).join(',')).join('\n') + '\n');
save();
console.log(`geocode: ${uses.size} ids in the table · ${cached} already in the gazetteer · ${fetched} fetched · ${failed} not found · ${filled} point rows filled`);
if (failed) process.exitCode = 1;

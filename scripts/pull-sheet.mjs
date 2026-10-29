#!/usr/bin/env node
// Parchment — pull-sheet.mjs
// Copies the record table from the Google Sheet (data/sheet.json → csv_url) into data/records.csv, in the
// table's column order, and prints the validation summary. The site reads the Sheet live; this is for the
// offline build and for keeping a copy in the repository.
//   node scripts/pull-sheet.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV, validateRecords, COLUMNS } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sheet = JSON.parse(readFileSync(join(ROOT, 'data', 'sheet.json'), 'utf8'));
if (!sheet.csv_url) { console.error('data/sheet.json has no csv_url yet. See docs/TEACHER-GUIDE.md.'); process.exit(1); }

const res = await fetch(sheet.csv_url, { headers: { 'user-agent': 'parchment-atlas/0.1 (pull-sheet)' } });
if (!res.ok) { console.error(`Sheet not reachable: HTTP ${res.status}`); process.exit(1); }
const text = await res.text();
const rows = parseCSV(text);
if (!rows.length) { console.error('The Sheet came back empty; records.csv left alone.'); process.exit(1); }

// Normalise to the table's column order; unknown columns are dropped, missing ones left blank.
const header = rows[0].map((h) => h.trim());
const idx = COLUMNS.map((c) => header.indexOf(c));
const missing = COLUMNS.filter((_, i) => idx[i] < 0);
if (missing.length) { console.error(`The Sheet is missing columns: ${missing.join(', ')}; records.csv left alone.`); process.exit(1); }
const quote = (s) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const out = [COLUMNS, ...rows.slice(1).map((r) => idx.map((i) => (r[i] ?? '').trim()))]
  .map((r) => r.map(quote).join(',')).join('\n') + '\n';
writeFileSync(join(ROOT, 'data', 'records.csv'), out);

const vocab = JSON.parse(readFileSync(join(ROOT, 'data', 'vocab.json'), 'utf8'));
const { records, problems, examples, total } = validateRecords(out, vocab);
console.log(`pulled ${total} rows into data/records.csv · ${records.length} render · ${examples} examples · ${problems.length} skipped`);
for (const p of problems) console.log(`  line ${p.line}${p.id ? ` (${p.id})` : ''}: ${p.message}`);

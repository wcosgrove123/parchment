#!/usr/bin/env node
// Parchment — check-records.mjs
// Build-time check of data/records.csv against data/vocab.json. Lists every skipped row. Exit code 0 unless
// --strict, so a bad row never blocks a build (the brief: report, skip, list, never crash).
//   node scripts/check-records.mjs [--strict] [--file path.csv]

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRecords } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : dflt; };
const file = resolve(arg('file', join(ROOT, 'data', 'records.csv')));
const vocab = JSON.parse(readFileSync(join(ROOT, 'data', 'vocab.json'), 'utf8'));
const { records, problems, examples, total } = validateRecords(readFileSync(file, 'utf8'), vocab);

console.log(`records.csv: ${total} rows · ${records.length} render · ${examples} examples (not rendered) · ${problems.length} skipped`);
for (const p of problems) console.log(`  line ${p.line}${p.id ? ` (${p.id})` : ''}: ${p.message}`);
if (problems.length && process.argv.includes('--strict')) process.exit(1);

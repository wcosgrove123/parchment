#!/usr/bin/env node
// Parchment — states.mjs
// Writes `states` into data/vocab.json: one stable id per state or people, with no year in it, so a row in the record
// table says `ottoman` and keeps meaning the same thing when the base maps change. Nothing here is drawn or decided
// by hand: a state is a NAME the downloaded base maps use (grouped across the snapshot years), and the tracked states
// in src/trackers/extent.json fold their renames into one id (Grand Duchy of Moscow → Tsardom of Muscovy → Russia is
// `russia`). The id → polygon link is resolved per year in src/data/states.js.
//   node scripts/states.mjs        (also run by derive.mjs)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kebab = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function buildStates(vocab, extent) {
  const units = vocab.base_units ?? [];
  // name → years it appears in
  const byName = new Map();
  for (const u of units) {
    const y = byName.get(u.name) ?? new Set();
    for (const yr of u.years) y.add(yr);
    byName.set(u.name, y);
  }
  const states = new Map();
  const taken = new Set(); // names folded into a tracked state
  for (const h of extent.highlights ?? []) {
    const names = h.names.filter((n) => byName.has(n));
    const years = new Set();
    for (const n of names) for (const y of byName.get(n)) if (y >= h.start && y <= h.end) years.add(y);
    for (const n of names) taken.add(n);
    states.set(h.id, { id: h.id, label: h.label, names: h.names, years: [...years].sort((a, b) => a - b), tracked: true });
  }
  for (const [name, years] of byName) {
    if (taken.has(name)) continue;
    let id = kebab(name);
    if (!id) continue;
    if (states.has(id)) { // two spellings that collapse to one id (rare): keep both, the later one numbered
      let n = 2;
      while (states.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    states.set(id, { id, label: name, names: [name], years: [...years].sort((a, b) => a - b), tracked: false });
  }
  return [...states.values()].sort((a, b) => a.id.localeCompare(b.id));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const vocabPath = join(ROOT, 'data', 'vocab.json');
  const vocab = JSON.parse(readFileSync(vocabPath, 'utf8'));
  const extent = JSON.parse(readFileSync(join(ROOT, 'src', 'trackers', 'extent.json'), 'utf8'));
  vocab.states = buildStates(vocab, extent);
  writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + '\n');
  console.log(`vocab.json: ${vocab.states.length} states (${vocab.states.filter((s) => s.tracked).length} tracked) from ${vocab.base_units.length} base units`);
}

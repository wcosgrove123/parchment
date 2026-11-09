#!/usr/bin/env node
// Parchment — derive-ohm-sources.mjs
// What each OpenHistoricalMap polygon on the North America page says about itself: the events that began and ended
// it, the source its editors cite (a map, a book, the Newberry atlas), its Wikipedia article, and, for OHM's copies of
// Newberry polygons, the Newberry id. The page's packing slip and the lookup commands (describe, changes, search) read
// it, so a fresh clone can cite every polygon without the raw download (data/base/raw/ is not committed).
//
// Usage: node scripts/derive-ohm-sources.mjs
//   reads data/base/raw/ohm/ohm-relations.json (scripts/fetch-us.mjs) and data/us/ohm.topojson (scripts/derive-us.mjs)
//   writes data/us/ohm-sources.json

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = JSON.parse(readFileSync(join(ROOT, 'data', 'base', 'raw', 'ohm', 'ohm-relations.json'), 'utf8'));
const relations = Array.isArray(raw) ? raw : (raw.elements ?? Object.values(raw));
const topo = JSON.parse(readFileSync(join(ROOT, 'data', 'us', 'ohm.topojson'), 'utf8'));
const used = new Set(topo.objects.ohm.geometries.map((g) => g.properties.rid).filter((r) => typeof r === 'number'));

// Short keys keep the file small; the meaning of each is in _keys.
const KEYS = {
  en: 'name:en', se: 'start_event', ee: 'end_event', sew: 'start_event:wikidata', eew: 'end_event:wikidata',
  sds: 'start_date:source', eds: 'end_date:source', src: 'source', srcName: 'source:name', srcUrl: 'source:url',
  cite: 'source:citation', nbCite: 'nl_ahcb:source', note: 'note', fixme: 'fixme', est: 'estimated', wp: 'wikipedia',
  sedtf: 'start_date:edtf', eedtf: 'end_date:edtf',
};
const out = {};
let n = 0;
for (const r of relations) {
  if (!used.has(r.id)) continue;
  const t = r.tags ?? {};
  const rec = {};
  for (const [k, tag] of Object.entries(KEYS)) if (t[tag] != null && String(t[tag]).trim() !== '') rec[k] = String(t[tag]).trim();
  // OHM's copies of Newberry polygons carry the Newberry id under one of two tag sets
  const nb = t['nl_ahcb:id_text'] ?? (/newberry/i.test(t['source:name'] ?? '') ? t['source:id_text'] : null);
  if (nb) { rec.nb = nb; const v = t['nl_ahcb:version'] ?? t['source:version']; if (v) rec.nbv = Number(v); }
  if (Object.keys(rec).length) { out[r.id] = rec; n++; }
}
const doc = {
  _source: 'Tags of OpenHistoricalMap relations (CC0), from data/base/raw/ohm/ohm-relations.json as downloaded by scripts/fetch-us.mjs; written by scripts/derive-ohm-sources.mjs. One entry per relation drawn on the North America page.',
  _keys: KEYS,
  relations: out,
};
writeFileSync(join(ROOT, 'data', 'us', 'ohm-sources.json'), `${JSON.stringify(doc)}\n`);
console.log(`ohm-sources: ${n} of ${used.size} relations carry source tags → data/us/ohm-sources.json`);

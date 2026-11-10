#!/usr/bin/env node
// Parchment — pull-war.mjs
// The engagements of one war as Wikidata lists them, written into the war table as TEST ROWS for review (owner,
// 2026-11-10: "let's mark all the battles of the entire war"; "Yes, both"). Wikidata (CC0) is asked for every item
// filed under the war (P361, directly or through a campaign) that is a battle, a naval battle, a siege, a raid, a
// skirmish or a landing and has a coordinate and a date; each becomes one `point` row under `tracker: military`:
// `where` the item's id, the dates as precise as the item gives them, `value` the kind. Nothing else is claimed: no
// winner, no besieger, no numbers (who won is the row's claim, never inferred; Wikidata does not record it).
// Coordinates are NOT written here: run `node scripts/geocode.mjs --file <table>` afterwards, as for every row.
//   node scripts/pull-war.mjs --war american-revolution --root Q40949 --prefix test-ar [--file data/military.csv]
//        [--focus north-america] [--unit 3] [--dry]
// Only rows that fall inside the focus (src/focuses.json) and inside the war's own dates (data/vocab.json) are
// written; everything left out is listed in out/pull-war/<war>.json with the reason. A second run replaces the rows
// this script wrote before (they carry PULLED in qc_note) and touches no other row.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d = null) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const WAR = arg('war'), QROOT = arg('root'), PREFIX = arg('prefix');
if (!WAR || !/^Q\d+$/.test(QROOT || '') || !PREFIX) { console.error('usage: pull-war.mjs --war <id> --root <Q…> --prefix <test-xx>'); process.exit(2); }
const FILE = resolve(ROOT, arg('file', 'data/military.csv'));
const FOCUS = arg('focus', 'north-america');
const UNIT = arg('unit', '');
const DRY = process.argv.includes('--dry');
const PULLED = 'PULLED from Wikidata';
const UA = 'parchment-atlas/0.1 (classroom atlas; pull-war script)';
const TODAY = new Date().toISOString().slice(0, 10);

// Wikidata's classes → the Military layer's kinds (data/vocab.json). First match in this order wins.
const KINDS = [
  ['Q1261499', 'naval-battle', 'naval battle'],
  ['Q188055', 'siege', 'siege'],
  ['Q476807', 'raid', 'military raid'],
  ['Q646740', 'landing', 'landing operation'],
  ['Q178561', 'battle', 'battle'],
  ['Q997267', 'battle', 'skirmish'],
  ['Q650711', 'battle', 'combat'],
];
// Classes that are not one engagement at one place: left for the campaign level, and listed.
const NOT_EVENTS = { Q831663: 'military campaign', Q645883: 'military operation', Q467011: 'invasion', Q1361229: 'conquest', Q198: 'war', Q350604: 'armed conflict', Q3199915: 'massacre (a sensitive row: the owner adds these by hand)' };

const vocab = JSON.parse(readFileSync(join(ROOT, 'data', 'vocab.json'), 'utf8'));
const war = (vocab.wars ?? []).find((w) => w.id === WAR);
if (!war) { console.error(`no war "${WAR}" in data/vocab.json`); process.exit(2); }
const focus = JSON.parse(readFileSync(join(ROOT, 'src', 'focuses.json'), 'utf8')).focuses.find((f) => f.id === FOCUS);
if (!focus) { console.error(`no focus "${FOCUS}"`); process.exit(2); }
const BOX = focus.extent;

const QUERY = `SELECT ?b ?bLabel ?coord ?t ?d ?dp ?s ?sp ?e ?ep ?title WHERE {
  ?b wdt:P361+ wd:${QROOT} ; wdt:P31 ?t ; wdt:P625 ?coord .
  OPTIONAL { ?b p:P585/psv:P585 [ wikibase:timeValue ?d ; wikibase:timePrecision ?dp ] }
  OPTIONAL { ?b p:P580/psv:P580 [ wikibase:timeValue ?s ; wikibase:timePrecision ?sp ] }
  OPTIONAL { ?b p:P582/psv:P582 [ wikibase:timeValue ?e ; wikibase:timePrecision ?ep ] }
  OPTIONAL { ?a schema:about ?b ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;

async function ask(query) {
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  for (const wait of [0, 4000, 15000]) {
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
    if (res.ok) return (await res.json()).results.bindings;
    if (res.status !== 429 && res.status < 500) throw new Error(`Wikidata answered ${res.status}`);
  }
  throw new Error('Wikidata did not answer');
}

// "+1777-09-11T00:00:00Z" at precision 11 (day), 10 (month) or 9 (year) → "1777-09-11" | "1777-09" | "1777"
function when(value, precision) {
  const m = /^([+-]?)(\d+)-(\d\d)-(\d\d)T/.exec(value || '');
  if (!m) return null;
  const y = `${m[1] === '-' ? '-' : ''}${Number(m[2])}`, p = Number(precision);
  if (p >= 11) return `${y}-${m[3]}-${m[4]}`;
  if (p === 10) return `${y}-${m[3]}`;
  if (p === 9) return y;
  return null;
}
const asDay = (w, last) => { const [y, mo, d] = w.replace(/^-/, '').split('-'); return Number(y) * 10000 + Number(mo ?? (last ? 12 : 1)) * 100 + Number(d ?? (last ? 31 : 1)); };
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const short = (label) => label.replace(/^(Battles?|Skirmish|Action) (of|at|on|off) (the )?/i, '').replace(/^./, (c) => c.toUpperCase());
const cell = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

const found = await ask(QUERY);
const items = new Map();
for (const r of found) {
  const q = r.b.value.split('/').pop();
  const it = items.get(q) ?? { q, label: r.bLabel?.value ?? q, types: new Set(), starts: [], ends: [], title: null, coord: null };
  it.types.add(r.t.value.split('/').pop());
  const pt = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(r.coord.value);
  if (pt && !it.coord) it.coord = [Number(pt[1]), Number(pt[2])];
  const d = when(r.d?.value, r.dp?.value), s = when(r.s?.value, r.sp?.value), e = when(r.e?.value, r.ep?.value);
  if (s) it.starts.push(s); else if (d) it.starts.push(d);
  if (e) it.ends.push(e); else if (d) it.ends.push(d);
  if (r.title) it.title = r.title.value;
  items.set(q, it);
}

const W0 = asDay(war.start, false), W1 = asDay(war.end, true);
const kept = [], left = [];
for (const it of [...items.values()].sort((a, b) => a.q.localeCompare(b.q, 'en', { numeric: true }))) {
  const kind = KINDS.find(([c]) => it.types.has(c));
  const note = (why) => left.push({ id: it.q, label: it.label, why });
  if (/^Q\d+$/.test(it.label)) { note('no English name'); continue; }
  if (!kind) { const n = [...it.types].map((t) => NOT_EVENTS[t]).find(Boolean); note(n ? `not one engagement: ${n}` : `a class the layer has no kind for (${[...it.types].join(', ')})`); continue; }
  if (!it.starts.length) { note('no date'); continue; }
  const byDay = (last) => (a, b) => asDay(a, last) - asDay(b, last) || b.length - a.length;
  const start = [...it.starts].sort(byDay(false))[0];
  let end = [...(it.ends.length ? it.ends : it.starts)].sort(byDay(true)).pop();
  if (asDay(end, true) < asDay(start, false)) end = start;
  if (asDay(start, true) < W0 || asDay(start, false) > W1) { note(`dated ${start}, outside the war's own dates (${war.start} to ${war.end})`); continue; }
  const [lon, lat] = it.coord ?? [];
  if (!(lon >= BOX.west && lon <= BOX.east && lat >= BOX.south && lat <= BOX.north)) { note(`off the ${focus.title} page (${lon?.toFixed(2)}, ${lat?.toFixed(2)}): for the world page`); continue; }
  kept.push({ ...it, kind: kind[1], wd: kind[2], start, end });
}
kept.sort((a, b) => asDay(a.start, false) - asDay(b.start, false) || a.label.localeCompare(b.label));

const text = readFileSync(FILE, 'utf8');
const nl = text.includes('\r\n') ? '\r\n' : '\n';
const table = parseCSV(text);
const header = table[0].map((h) => h.trim());
const lines = text.split(/\r?\n/);
// (a row this script wrote before: its id under the prefix and the mark in its note; one row is one line here)
const mine = (line) => line.startsWith(`${PREFIX}-ev-`) && line.includes(PULLED);
const others = lines.filter((l) => l !== '' && !mine(l));
const used = new Set(others.map((l) => l.split(',')[0]));
const rows = kept.map((it) => {
  let id = `${PREFIX}-ev-${slug(short(it.label))}`;
  for (let n = 2; used.has(id); n++) id = `${PREFIX}-ev-${slug(short(it.label))}-${n}`;
  used.add(id);
  const rec = {
    id, course: 'apush', unit: UNIT, theme: 'WOR', tracker: 'military', kind: 'point', where: it.q, start: it.start, end: it.end, grade: 'exact',
    value: it.kind, certainty: 'legal', label: it.kind === 'battle' ? short(it.label) : it.label,
    source: `Wikidata ${it.q} (CC0), read ${TODAY}: the place, the dates and the kind of engagement (${it.wd}) as that item records them${it.title ? `; English Wikipedia, "${it.title}"` : ''}. Not yet checked against the National Park Service's list (American Revolution Battlefield Boundaries and Associated Historic Properties, 2020, NPS DataStore 2279701) or a printed history.`,
    qc_note: `TEST ROW, ${PULLED} by scripts/pull-war.mjs; not reviewed. No winner and no besieger are recorded: Wikidata does not give them, and none is inferred.`,
    war: WAR,
  };
  return header.map((h) => cell(rec[h])).join(',');
});

mkdirSync(join(ROOT, 'out', 'pull-war'), { recursive: true });
writeFileSync(join(ROOT, 'out', 'pull-war', `${WAR}.json`), JSON.stringify({ war: WAR, root: QROOT, read: TODAY, focus: FOCUS, found: items.size, written: kept.length,
  kinds: Object.fromEntries([...new Set(kept.map((k) => k.kind))].map((k) => [k, kept.filter((x) => x.kind === k).length])), left_out: left }, null, 2));
if (!DRY) writeFileSync(FILE, [...others, ...rows].join(nl) + nl);
console.log(`${items.size} items filed under ${QROOT} with a coordinate; ${kept.length} rows ${DRY ? 'would be ' : ''}written to ${arg('file', 'data/military.csv')}; ${left.length} left out (out/pull-war/${WAR}.json)`);
const why = {}; for (const l of left) { const k = l.why.replace(/\(.*$/, '').replace(/dated .*?,/, 'dated …,').trim(); why[k] = (why[k] ?? 0) + 1; }
for (const [k, n] of Object.entries(why)) console.log(`  ${n} × ${k}`);

#!/usr/bin/env node
// Parchment — review-rows.mjs: the war table as a review sheet, and the owner's marks back into the table.
//   node scripts/review-rows.mjs [--out out/review]        writes one JSON per war: every row as a plain claim
//   node scripts/review-rows.mjs --apply marks.json        writes the review's marks into data/military.csv
// The review page (an Artifact the owner opens) shows each row of data/military.csv and each force of
// data/vocab.json as one plain sentence with its dates and source, and takes a mark per row: ok, wrong or unsure,
// with a note. marks.json is { "<row id>": { "status": "ok|wrong|unsure", "note": "..." } } as read back from it;
// --apply sets qc_status, qc_by and qc_note on those rows (forces are listed for the owner to fix in vocab.json).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRecords } from '../src/data/records.js';
import { parseOutcome } from '../src/military/events.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : null; };
const vocab = JSON.parse(readFileSync(join(ROOT, 'data', 'vocab.json'), 'utf8'));
const gaz = JSON.parse(readFileSync(join(ROOT, 'data', 'gazetteer.json'), 'utf8'));
const FILE = join(ROOT, 'data', 'military.csv');
const text = readFileSync(FILE, 'utf8');

if (flag('apply')) {
  const marks = JSON.parse(readFileSync(resolve(flag('apply')), 'utf8'));
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/).filter((l) => l.length);
  const header = lines[0].split(',');
  const parse = (line) => { const out = []; let cur = '', q = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out; };
  const cell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  let n = 0; const forces = [];
  const out = [lines[0]];
  for (const l of lines.slice(1)) {
    const cells = parse(l); const id = cells[0]; const m = marks[id];
    if (!m || !['ok', 'wrong', 'unsure'].includes(m.status)) { out.push(l); continue; }
    const o = Object.fromEntries(cells.map((v, i) => [header[i], v]));
    o.qc_status = m.status; o.qc_by = m.by ?? 'owner'; o.qc_note = [m.note, `reviewed ${m.at ?? new Date().toISOString().slice(0, 10)}`].filter(Boolean).join(' · ');
    out.push(header.map((h) => cell(String(o[h] ?? ''))).join(',')); n++;
  }
  for (const [id, m] of Object.entries(marks)) if (id.startsWith('force:')) forces.push(`${id}: ${m.status}${m.note ? ` (${m.note})` : ''}`);
  writeFileSync(FILE, out.join(nl) + nl);
  console.log(`marks written to ${n} rows of data/military.csv`);
  if (forces.length) console.log(`forces live in data/vocab.json; the owner's marks on them:\n  ${forces.join('\n  ')}`);
  process.exit(0);
}

const checked = validateRecords(text, vocab);
const name = (q) => gaz[q]?.label ?? q;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (w) => (!w ? '' : w.month == null ? String(w.year) : w.day == null ? `${MONTHS[w.month - 1]} ${w.year}` : `${w.day} ${MONTHS[w.month - 1]} ${w.year}`);
const span = (r) => { const a = day(r.startWhen), b = day(r.endWhen); return (a === b || !b ? a : `${a} to ${b}`) + (r.grade === 'circa' ? ' (about)' : r.grade === 'uncertain' ? ' (uncertain)' : ''); };
const VALUE = { battle: 'Battle', siege: 'Siege', 'naval-battle': 'Naval battle', raid: 'Raid or rising', landing: 'Landing', surrender: 'Surrender', capture: 'Place taken', declaration: 'Declaration or act', treaty: 'Treaty', armistice: 'Armistice', massacre: 'Killing of prisoners or civilians', fort: 'Fort', headquarters: 'Headquarters' };
const MOVE = { advance: 'March', retreat: 'Retreat', landing: 'Landing from the sea', 'naval-passage': 'Passage by sea', envelopment: 'Flanking attack', pursuit: 'Pursuit', raid: 'Raid', front: 'Line of battle' };
const out = {};
for (const war of vocab.wars) {
  const side = (id) => war.sides.find((s) => s.id === id)?.label ?? id;
  const force = (id) => (war.forces ?? []).find((f) => f.id === id);
  const outcome = (r) => { const o = parseOutcome(r.outcome); return !o ? '' : o.kind === 'won' ? `won by ${side(o.sides[0])}` : o.kind === 'claimed' ? `both ${side(o.sides[0])} and ${side(o.sides[1])} claimed the victory` : o.kind === 'inconclusive' ? 'inconclusive' : ''; };
  const rows = [];
  const push = (group, r, claim) => rows.push({ id: r.id, group, label: r.label, when: span(r), claim, source: r.source, note: /sensitive/i.test(r.qc_note ?? '') ? 'Sensitive: needs your words and the co-teachers\'.' : '', certainty: r.certainty, status: r.qc_status || '' });
  const mine = checked.records.filter((r) => r.war === war.id);
  for (const r of mine.filter((x) => x.kind === 'region' && x.value !== 'occupied')) push('Sides', r, `${side(r.side)} side: ${r.label} (${r.value}); shades the polygon "${r.where}".`);
  for (const r of mine.filter((x) => x.kind === 'point' && !x.battle)) push('Battles and events', r, `${VALUE[r.value] ?? r.value}${r.side && r.value !== 'battle' ? ` (${r.value === 'siege' ? 'besieger' : r.value === 'capture' ? 'taken by' : 'by'} ${side(r.side)})` : ''}${outcome(r) ? `, ${outcome(r)}` : ''}. Marked at ${name(r.where)}.`);
  for (const r of mine.filter((x) => (x.kind === 'arrow' || x.kind === 'path') && !x.battle)) push('Marches', r, `${MOVE[r.value] ?? r.value} of ${force(r.force)?.commander ?? force(r.force)?.label ?? r.force ?? side(r.side)} (${side(r.side)})${r.strength ? `, ${r.strength.replace(/^\w+=/, 'about ')} men` : ''}: ${String(r.where).split('>').map(name).join(' → ')}.${r.certainty === 'approximate' ? ' Drawn dashed (approximate).' : ''}`);
  for (const r of mine.filter((x) => x.kind === 'region' && x.value === 'occupied')) push('Occupied land', r, `Hatched as occupied by ${side(r.side)}: the province "${r.where}", whole, though the source may say in part.`);
  for (const b of war.battles ?? []) {
    const br = mine.filter((x) => x.battle === b.id);
    const ph = (r) => (r.phase ? ` (phase ${r.phase}: ${(b.phases ?? []).find((p) => String(p.n) === String(r.phase).split('-')[0])?.at ?? ''})` : '');
    for (const r of br.filter((x) => x.value === 'terrain')) push(`${b.label}: named places`, r, `A hill, ridge or place named on the battle frame, at ${name(r.where)}.`);
    for (const r of br.filter((x) => x.value === 'position')) push(`${b.label}: where each corps stood`, r, `${force(r.force)?.label ?? r.force} (${side(r.side)}) stands at ${name(r.where)}${ph(r)}.`);
    for (const r of br.filter((x) => x.kind === 'arrow' || x.kind === 'path')) push(`${b.label}: lines and attacks`, r, `${MOVE[r.value] ?? r.value}, ${side(r.side)}${ph(r)}: ${String(r.where).split('>').map(name).join(' → ')}.`);
  }
  for (const f of war.forces ?? []) rows.push({ id: `force:${war.id}:${f.id}`, group: 'Forces', label: f.label, when: '', claim: `${f.commander ?? f.label} (${side(f.side)}): ${f.type}${f.echelon ? `, size mark ${f.echelon}` : ''}${f.strength?.text ? `; ${f.strength.text}` : ''}.`, source: [f.strength?.source, f.source].filter(Boolean).join(' · '), note: '', certainty: '', status: '' });
  if (rows.length) out[war.id] = { id: war.id, title: Object.values(war.names)[0], span: `${war.start} to ${war.end}`, rows: rows.map((r, i) => ({ n: i + 1, ...r })) };
}
const dir = resolve(flag('out') ?? join(ROOT, 'out', 'review'));
mkdirSync(dir, { recursive: true });
for (const [id, t] of Object.entries(out)) writeFileSync(join(dir, `${id}.json`), `${JSON.stringify(t)}\n`);
console.log(Object.values(out).map((t) => `${t.title}: ${t.rows.length} rows`).join(' | '), `→ ${dir}`);

#!/usr/bin/env node
// Parchment — make-sheet.mjs
// Writes dist/parchment-records.xlsx: the record table as a spreadsheet with dropdowns for every fixed value,
// generated from data/vocab.json so the two never drift. Upload it to Google Drive (it opens as a Google Sheet
// and keeps the dropdowns), then follow docs/TEACHER-GUIDE.md to connect it.
//   node scripts/make-sheet.mjs

import ExcelJS from 'exceljs';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV, COLUMNS } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist', 'parchment-records.xlsx');
const vocab = JSON.parse(readFileSync(join(ROOT, 'data', 'vocab.json'), 'utf8'));
const rows = parseCSV(readFileSync(join(ROOT, 'data', 'records.csv'), 'utf8'));
const header = rows[0].map((h) => h.trim());
const ROWS = 600; // rows with dropdowns ready

const wb = new ExcelJS.Workbook();
wb.creator = 'Parchment';

// --- records -----------------------------------------------------------------------------------------------
const ws = wb.addWorksheet('records', { views: [{ state: 'frozen', ySplit: 1 }] });
ws.columns = COLUMNS.map((c) => ({ header: c, key: c, width: { id: 26, label: 28, source: 34, where: 24, kc: 14, qc_note: 30 }[c] ?? 11 }));
ws.getRow(1).font = { bold: true };
for (const r of rows.slice(1)) ws.addRow(Object.fromEntries(COLUMNS.map((c) => [c, r[header.indexOf(c)] ?? ''])));

// --- vocab lists (one column each) and places ----------------------------------------------------------------
const vs = wb.addWorksheet('vocab');
const lists = {
  course: vocab.course,
  theme: [...vocab.theme.apworld, ...vocab.theme.apush],
  tracker: Object.keys(vocab.trackers),
  kind: vocab.kind,
  grade: vocab.grade,
  certainty: vocab.certainty,
  qc_status: vocab.qc_status.filter(Boolean),
  value: [...new Set(Object.values(vocab.trackers).flatMap((t) => t.values ?? []))],
};
const listCols = Object.keys(lists);
vs.addRow(listCols);
vs.getRow(1).font = { bold: true };
const maxLen = Math.max(...Object.values(lists).map((l) => l.length));
for (let i = 0; i < maxLen; i++) vs.addRow(listCols.map((k) => lists[k][i] ?? ''));
// which values belong to which tracker, for people reading the sheet
vs.getCell(1, listCols.length + 2).value = 'tracker → values';
vs.getCell(1, listCols.length + 2).font = { bold: true };
Object.entries(vocab.trackers).forEach(([k, t], i) => { vs.getCell(2 + i, listCols.length + 2).value = `${k}: ${(t.values ?? ['(number)']).join(', ')}`; });
vs.columns.forEach((c) => { c.width = 18; });

const ps = wb.addWorksheet('places');
ps.addRow(['id (paste into where)', 'name as the base map spells it', 'years it appears']);
ps.getRow(1).font = { bold: true };
for (const u of vocab.base_units ?? []) ps.addRow([u.id, u.name, u.years.join(', ')]);
ps.columns = [{ width: 36 }, { width: 40 }, { width: 28 }];
const placesLast = (vocab.base_units ?? []).length + 1;

// --- dropdowns ---------------------------------------------------------------------------------------------
const colLetter = (key) => ws.getColumn(key).letter;
const listRef = (key) => { const i = listCols.indexOf(key); const L = vs.getColumn(i + 1).letter; return `vocab!$${L}$2:$${L}$${lists[key].length + 1}`; };
const rangeValidation = (key, ref, note) => {
  for (let r = 2; r <= ROWS; r++) ws.getCell(`${colLetter(key)}${r}`).dataValidation = { type: 'list', allowBlank: true, formulae: [ref], showErrorMessage: true, errorStyle: 'warning', errorTitle: 'Parchment', error: note };
};
for (const key of ['course', 'theme', 'tracker', 'kind', 'grade', 'certainty', 'qc_status']) rangeValidation(key, listRef(key), `Pick a ${key} from the list (data/vocab.json).`);
rangeValidation('value', listRef('value'), 'Pick the value for this tracker (see the vocab tab), or type a number for a value row.');
rangeValidation('where', `places!$A$2:$A$${placesLast}`, 'For a state or region pick an id from the places tab. For a point, type the Wikidata id (Q…) instead.');
for (const key of ['unit', 'start', 'end']) for (let r = 2; r <= ROWS; r++) ws.getCell(`${colLetter(key)}${r}`).dataValidation = { type: 'whole', allowBlank: true, operator: 'between', formulae: [-5000, 2100], showErrorMessage: true, errorStyle: 'warning', errorTitle: 'Parchment', error: `${key} is a whole number (a year; negative for BCE).` };

// --- help --------------------------------------------------------------------------------------------------
const hs = wb.addWorksheet('help');
[
  ['How to add a claim'],
  ['1. One row per claim on the records tab. Never edit the header row.'],
  ['2. id: short, lowercase, words joined by hyphens, unique (panipat-1526). Rows whose id starts with example- are templates and never draw.'],
  ['3. Pick from the dropdowns wherever there is one. Free text goes in label, source, qc_by and qc_note.'],
  ['4. where: for a state or region, an id from the places tab (ottoman-empire@1600). For a point (battle, founding, treaty), the Wikidata id (Q605321). Leave lon/lat blank; they are filled from the id.'],
  ['5. start and end are years (the same year for a single event). grade says how sure the date is: exact, circa (~1526) or uncertain (1526?).'],
  ['6. certainty says how firm the territory is: legal (solid line), approximate (dashed), sphere (soft, no line).'],
  ['7. source: the textbook page or framework line the claim rests on. Every row needs one.'],
  ['8. The map reads this sheet live. A row with a mistake is skipped and listed on the admin page with the reason; nothing you type can break the map.'],
  ['9. Review: a second person sets qc_status to ok, wrong or unsure and signs qc_by. Rows marked wrong stop drawing.'],
].forEach((r) => hs.addRow(r));
hs.getRow(1).font = { bold: true };
hs.getColumn(1).width = 140;

mkdirSync(dirname(OUT), { recursive: true });
await wb.xlsx.writeFile(OUT);
console.log(`wrote ${OUT}: ${rows.length - 1} rows, dropdowns on ${ROWS - 1} rows, ${placesLast - 1} places`);

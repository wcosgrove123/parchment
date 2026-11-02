// Parchment — records
// Reads data/records.csv (the only hand-edited data file) and checks every row against data/vocab.json.
// Rows that fail are skipped and listed, never fatal: nothing a content editor types can break the map.
// Rows whose id starts with "example-" are templates and are never rendered.

export const COLUMNS = ['id', 'course', 'unit', 'topic', 'kc', 'theme', 'tracker', 'kind', 'where', 'lon', 'lat',
  'start', 'end', 'grade', 'value', 'certainty', 'label', 'source', 'qc_status', 'qc_by', 'qc_note'];

// RFC 4180-style CSV: quoted fields may hold commas, quotes ("") and newlines. Returns rows of strings.
export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false, i = 0;
  const src = text.replace(/^﻿/, '');
  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { quoted = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ''));
}

const isInt = (s) => /^-?\d+$/.test(s);

// When: a year (1526, -500 for 500 BCE), a month (1526-04) or a day (1526-04-21). The number is what the row says;
// nothing is converted between calendars, so a day before 1582 is the date as the source gives it.
// → { year, month, day, t } or null. t orders any two whens (a decimal year) and never shows.
const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export function parseWhen(s) {
  const m = /^(-?\d{1,4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month = m[2] === undefined ? null : Number(m[2]);
  const day = m[3] === undefined ? null : Number(m[3]);
  if (month !== null && (month < 1 || month > 12)) return null;
  if (day !== null && (day < 1 || day > DAYS[month - 1])) return null;
  const t = year + ((month ?? 1) - 1) / 12 + ((day ?? 1) - 1) / 372;
  return { year, month, day, t };
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// 1526 · Apr 1526 · 21 Apr 1526 · 500 BCE (a BCE date prints the year the way a historian writes it)
export function formatWhen(w) {
  if (!w) return '';
  const y = w.year < 0 ? `${-w.year} BCE` : `${w.year}`;
  if (w.month === null) return y;
  if (w.day === null) return `${MONTHS[w.month - 1]} ${y}`;
  return `${w.day} ${MONTHS[w.month - 1]} ${y}`;
}
const WHEN_HINT = 'a year (1526), a month (1526-04) or a day (1526-04-21); negative years for BCE';
const isNum = (s) => s !== '' && Number.isFinite(Number(s));
const isQID = (s) => /^Q\d+$/.test(s);

// → { records: [...valid, parsed rows], problems: [{ line, id, message }], examples: n, total: n }
export function validateRecords(text, vocab) {
  const rows = parseCSV(text);
  const problems = [];
  const records = [];
  const templates = []; // valid example-* rows, kept for the admin page, never drawn
  let examples = 0;
  if (!rows.length) return { records, problems: [{ line: 1, id: '', message: 'records.csv is empty' }], examples, templates, total: 0 };

  const header = rows[0].map((h) => h.trim());
  const missing = COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) {
    problems.push({ line: 1, id: '', message: `header is missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}` });
    return { records, problems, examples, templates, total: rows.length - 1 };
  }
  const col = Object.fromEntries(header.map((h, i) => [h, i]));
  const baseUnits = new Set((vocab.base_units ?? []).map((u) => u.id));
  const seen = new Set();

  for (let r = 1; r < rows.length; r++) {
    const line = r + 1;
    const cells = rows[r];
    const get = (c) => (cells[col[c]] ?? '').trim();
    const rec = Object.fromEntries(COLUMNS.map((c) => [c, get(c)]));
    const errs = [];
    const bad = (m) => errs.push(m);

    if (cells.length > header.length) bad(`${cells.length} fields for ${header.length} columns (an unquoted comma?)`);
    if (!rec.id) bad('id is blank');
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(rec.id)) bad(`id "${rec.id}" is not kebab-case`);
    else if (seen.has(rec.id)) bad(`id "${rec.id}" is used twice`);
    seen.add(rec.id);

    if (!vocab.course.includes(rec.course)) bad(`course "${rec.course}" is not one of ${vocab.course.join(', ')}`);
    if (rec.unit !== '' && !isInt(rec.unit)) bad(`unit "${rec.unit}" is not a whole number`);
    const themes = rec.course === 'both' ? [...vocab.theme.apworld, ...vocab.theme.apush] : (vocab.theme[rec.course] ?? []);
    if (rec.theme && themes.length && !themes.includes(rec.theme)) bad(`theme "${rec.theme}" is not a ${rec.course} theme (${themes.join(', ')})`);

    const tracker = vocab.trackers[rec.tracker];
    if (!tracker) bad(`tracker "${rec.tracker}" is not one of ${Object.keys(vocab.trackers).join(', ')}`);
    if (!vocab.kind.includes(rec.kind)) bad(`kind "${rec.kind}" is not one of ${vocab.kind.join(', ')}`);
    else if (tracker && !tracker.kinds.includes(rec.kind)) bad(`tracker ${rec.tracker} does not take kind "${rec.kind}" (only ${tracker.kinds.join(', ')})`);

    if (!rec.where) bad('where is blank');
    else if (rec.kind === 'point') { if (!isQID(rec.where)) bad(`where "${rec.where}" should be a Wikidata QID (like Q193334) for a point`); }
    else if (!baseUnits.has(rec.where) && !isQID(rec.where)) bad(`where "${rec.where}" is not a base-unit id in vocab.json`);

    if (rec.lon !== '' || rec.lat !== '') {
      if (!isNum(rec.lon) || !isNum(rec.lat)) bad('lon/lat must both be numbers (or both blank until geocode.mjs fills them)');
      else if (Math.abs(Number(rec.lon)) > 180 || Math.abs(Number(rec.lat)) > 90) bad(`lon/lat ${rec.lon},${rec.lat} is off the globe`);
    }
    const startW = parseWhen(rec.start), endW = parseWhen(rec.end);
    if (!startW) bad(`start "${rec.start}" is not ${WHEN_HINT}`);
    if (!endW) bad(`end "${rec.end}" is not ${WHEN_HINT}`);
    if (startW && endW && endW.t < startW.t) bad(`end ${rec.end} is before start ${rec.start}`);
    if (!vocab.grade.includes(rec.grade)) bad(`grade "${rec.grade}" is not one of ${vocab.grade.join(', ')}`);
    if (tracker) {
      if (rec.kind === 'value') { if (!isNum(rec.value)) bad(`value "${rec.value}" is not a number`); }
      else if (tracker.values && !tracker.values.includes(rec.value)) bad(`value "${rec.value}" is not a ${rec.tracker} value (${tracker.values.join(', ')})`);
    }
    if (!vocab.certainty.includes(rec.certainty)) bad(`certainty "${rec.certainty}" is not one of ${vocab.certainty.join(', ')}`);
    if (!rec.label) bad('label is blank');
    if (!vocab.qc_status.includes(rec.qc_status)) bad(`qc_status "${rec.qc_status}" is not one of ok, wrong, unsure or blank`);

    if (errs.length) { problems.push({ line, id: rec.id, message: errs.join('; '), raw: rec }); continue; }
    const parsed = {
      ...rec,
      unit: rec.unit === '' ? null : Number(rec.unit),
      lon: rec.lon === '' ? null : Number(rec.lon),
      lat: rec.lat === '' ? null : Number(rec.lat),
      start: startW.year, // the years keep every snapshot comparison simple
      end: endW.year,
      startWhen: startW, // the full when, for labels and ordering
      endWhen: endW,
      value: rec.kind === 'value' ? Number(rec.value) : rec.value,
      shape: tracker?.shapes?.[rec.value] ?? null,
      line,
    };
    if (rec.id.startsWith('example-')) { examples++; templates.push(parsed); continue; }
    records.push(parsed);
  }
  return { records, problems, examples, templates, total: rows.length - 1 };
}

// The when a record shows, by grade: 1526 · ~1526 · 1526? · 21 Apr 1526 · Apr 1526 – Jul 1526
export function yearLabel(rec) {
  const a = formatWhen(rec.startWhen ?? parseWhen(String(rec.start)));
  const b = formatWhen(rec.endWhen ?? parseWhen(String(rec.end)));
  const y = a === b ? a : `${a}–${b}`;
  return rec.grade === 'circa' ? `~${y}` : rec.grade === 'uncertain' ? `${y}?` : y;
}

// Records shown in a snapshot year, for one tracker: those alive in that year (start ≤ year ≤ end), plus
// those whose home snapshot it is. The home snapshot is the first calendar year at or after a record's start,
// so a one-year event such as a battle in 1526 lands on the 1600 map, read as "since the last snapshot".
export function recordsFor(records, tracker, year, years = []) {
  const sorted = [...years].sort((a, b) => a - b);
  const home = (r) => sorted.find((y) => y >= r.start);
  return records.filter((r) => r.tracker === tracker && ((r.start <= year && year <= r.end) || home(r) === year));
}

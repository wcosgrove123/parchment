#!/usr/bin/env node
// Parchment — fetch-electoral.mjs
// The Electoral College, 1789–2024, state by state, from the U.S. National Archives' "Electoral College box scores"
// (https://www.archives.gov/electoral-college/<year>; a work of the U.S. government, public domain).
// Downloads each election's page into data/base/raw/electoral/ (kept; --refresh downloads again), reads its two
// tables and its notes, checks every election against the page's own totals, and writes data/us/electoral.json.
// Nothing is typed in by hand: votes a table puts under "Others" are read from the page's own footnotes, and an
// election whose numbers do not add up stops the script with the reason. The one exception is ERRATA below: a cell
// a page leaves blank although its own totals prove what it held, each with the evidence written out.
//
// Usage: node scripts/fetch-electoral.mjs [--refresh] [--show <year>]

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'electoral');
const OUT = join(ROOT, 'data', 'us', 'electoral.json');
const MANIFEST = join(ROOT, 'data', 'base', 'MANIFEST-electoral.json');
const URL_OF = (y) => `https://www.archives.gov/electoral-college/${y}`;
const YEARS = [1789, ...Array.from({ length: (2024 - 1792) / 4 + 1 }, (_, i) => 1792 + i * 4)];
const refresh = process.argv.includes('--refresh');

// Corrections, each proved by the same page's own totals.
const ERRATA = [
  { year: 1800, state: 'Virginia', candidate: 'Aaron Burr', votes: 21,
    why: "The Archives' 1800 table leaves Burr's Virginia cell blank, but its totals row and summary give Burr 73, exactly 21 more than its other states hold; Virginia's 21 electors each cast a second vote, and no other candidate's total is short." },
];

// ---------------------------------------------------------------- download
mkdirSync(RAW, { recursive: true });
const manifest = { source: 'U.S. National Archives and Records Administration, Electoral College box scores', licence: 'Public domain (a work of the U.S. federal government)', note: 'Written by scripts/fetch-electoral.mjs. Raw pages live in data/base/raw/electoral/ (not committed).', files: [] };
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : null;
for (const y of YEARS) {
  const file = join(RAW, `${y}.html`);
  let fetched = prev?.files?.find((f) => f.year === y)?.retrieved ?? null;
  if (refresh || !existsSync(file)) {
    const res = await fetch(URL_OF(y), { headers: { 'User-Agent': 'Parchment classroom atlas (data download)' } });
    if (!res.ok) throw new Error(`${URL_OF(y)}: HTTP ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    fetched = new Date().toISOString();
    await new Promise((r) => setTimeout(r, 300));
  }
  const buf = readFileSync(file);
  manifest.files.push({ year: y, url: URL_OF(y), retrieved: fetched ?? new Date().toISOString(), bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex') });
}
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

// ---------------------------------------------------------------- reading a page
const ENT = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', eacute: 'é', aacute: 'á' };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENT[e.toLowerCase()] ?? m));
const text = (h) => decode(h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const tablesOf = (html) => [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
const rowsOf = (table) => [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => [...r[0].matchAll(/<t[dh]([^>]*)>([\s\S]*?)<\/t[dh]>/gi)]
  .map((c) => ({ text: text(c[2]), span: Number(/colspan="?(\d+)/i.exec(c[1])?.[1] ?? 1) })));
const int = (s) => { const m = /^\s*(\d+)/.exec(s ?? ''); return m ? Number(m[1]) : 0; };
const slug = (name) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

// Names: "Crawford", "S. Johnston", "Gratz Brown" and "LaFollette" each find the one candidate they mean, or none.
const nkey = (n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/,? (jr|sr)\.?$/, '').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
function sameName(a, b) {
  const ka = nkey(a), kb = nkey(b);
  if (!ka || !kb) return false;
  const fa = ka.replace(/ /g, ''), fb = kb.replace(/ /g, '');
  if (fa === fb) return true;
  const ta = ka.split(' '), tb = kb.split(' ');
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  if (long.join('').endsWith(short.join('')) && short.join('').length > 3 && (short.length === 1 || long.join('') !== short.join(''))) {
    // "Gratz Brown" in "Benjamin Gratz Brown"; "Crawford" in "William H. Crawford"
    if (short.length === 1 || long.slice(-short.length).join('') === short.join('')) return true;
  }
  // "S. Johnston" and "Samuel Johnston": the same surname and the same first initial
  return short.length > 1 && short.at(-1) === long.at(-1) && short[0][0] === long[0][0];
}
const findOne = (name, pool, { loose = false } = {}) => {
  let m = pool.filter((c) => sameName(name, c.name));
  // loose (the summary against the table only): "Bob Dole" is "Robert Dole" when no one else has the surname
  if (!m.length && loose) m = pool.filter((c) => nkey(c.name).split(' ').at(-1) === nkey(name).split(' ').at(-1));
  return m.length === 1 ? m[0] : m.length ? 'ambiguous' : null;
};

// "Abraham Lincoln, of Illinois" / "Franklin D. Roosevelt*, of New York" / "George Washington, Esq"
function candidateOf(s) {
  const t = s.replace(/,\s*Esq\.?$/, '');
  const m = /^(.*?)(?:\*+)?,?\s+of\s+(.+)$/.exec(t);
  return { name: (m ? m[1] : t).replace(/\*+$/, '').replace(/,$/, '').trim(), from: m ? m[2].trim() : null };
}
// "Alabama 3", "Hawaii *", "Texas ***", "Mississippi**" → { name, mark }
function stateCell(s) {
  const m = /^(.*?)\s*(\d+|\*+)?$/.exec(s.trim());
  return { name: m[1].trim(), mark: m[2] ?? null };
}

// The summary table: the winner and main opponent (with the Archives' party label), the others and their counts,
// the total. A count can be given two ways ("71, excluding Georgia; 80, including Georgia"): both are kept.
function readSummary(rows) {
  const out = { candidates: [], total: null, majority: null };
  const add = (name, party, ev) => { if (name && !out.candidates.some((c) => c.name === name)) out.candidates.push({ name, party, ev }); };
  const counts = (t) => [...t.matchAll(/\d+/g)].map((m) => Number(m[0]));
  let winnerEv = [], mainEv = [];
  for (const r of rows) {
    const k = (r[0]?.text ?? '').replace(/[:*]+$/, '');
    const v = r.slice(1).map((c) => c.text).join(' | ');
    const m = /^(.*?)\s*\[([^\]]+)\]/.exec(v);
    if (k === 'President') add(m ? m[1] : v.replace(/\s*\(.*$/, ''), m?.[2] ?? null, null);
    else if (k === 'Main Opponent') add(m ? m[1] : v, m?.[2] ?? null, null);
    else if (/^(Other (Presidential )?Opponents|Opponents|Votes for Others)$/.test(k)) {
      for (const part of v.split(/[;,]\s*(?=[A-Z][^()]*\(\d+\))/)) {
        const o = /^\s*(.*?)\s*\((\d+)\)/.exec(part);
        if (o) add(o[1].trim(), null, [Number(o[2])]);
      }
    } else if (/^Electoral Vote/.test(k)) {
      for (const c of r.slice(1)) {
        const t = c.text;
        if (/^Winner/.test(t)) winnerEv = counts(t);
        else if (/^Main Opponent/.test(t)) mainEv = counts(t.replace(/\s\d\s*$/, ''));
        else if (/^Total/.test(t)) { const n = /(\d+)\D+(\d+)\s*$/.exec(t); if (n) { out.total = Number(n[1]); out.majority = Number(n[2]); } }
      }
    }
  }
  if (out.candidates[0]) out.candidates[0].ev = winnerEv;
  if (out.candidates[1]) out.candidates[1].ev = mainEv;
  return out;
}

// A state's footnote, in the page's own words: from its mark to the next mark.
function footnote(notes, mark) {
  if (!mark) return null;
  const re = /^\d+$/.test(mark) ? new RegExp(`(?:^|\\s)${mark} (?=[A-Z])`) : new RegExp(`(?:^|[^*])${mark.replace(/\*/g, '\\*')}(?=[A-Z])`);
  const m = re.exec(notes);
  if (!m) return null;
  const rest = notes.slice(m.index + m[0].length);
  const end = /\s\d{1,2} (?=[A-Z])|\*+(?=[A-Z])/.exec(rest);
  return rest.slice(0, end ? end.index : undefined).trim();
}

// Presidential votes for people a table counts under "Others", read from a footnote: "cast 9 votes for Crawford as
// President", "also cast 5 votes for Crawford and 4 for Clay as President", "Hendricks received 8 electoral votes
// for President", "for President, Trump 36, Ron Paul 1, and John Kasich 1", and before 1804 (one list, two votes per
// elector) "also cast 3 votes for James Iredell, of North Carolina, 1 vote for George Washington, of Virginia".
function othersIn(note, pool, named, twoVotes) {
  const found = new Map(), unknown = [];
  const NAME = "([A-Z][\\w.'’ -]*?)";
  const put = (name, n) => {
    if (findOne(name, named) && !findOne(name, pool)) return; // a candidate with a column of their own
    const c = findOne(name, pool);
    if (c && c !== 'ambiguous') found.set(c, (found.get(c) ?? 0) + Number(n));
    else unknown.push({ name: name.trim(), n: Number(n), ambiguous: c === 'ambiguous' });
  };
  // before 1804 every name in these notes is followed by its state: "for John Henry, of Maryland"
  if (twoVotes) {
    for (const x of note.matchAll(new RegExp(`(\\d+) votes? for ${NAME}, of `, 'g'))) put(x[2], x[1]);
    return { found, unknown };
  }
  // (a sentence ends at a full stop after a word, not after an initial: "Thomas A. Hendricks")
  for (const clause of note.split(/(?<=[a-z]{2}\.)\s+|;\s*/)) {
    let m;
    if ((m = /for [Pp]resident, ([A-Z].+)$/.exec(clause))) { for (const x of m[1].matchAll(new RegExp(`(?:and )?${NAME} (\\d+)`, 'g'))) put(x[1], x[2]); continue; }
    if ((m = new RegExp(`(\\d+) (?:electoral )?votes? for ${NAME} and (\\d+) (?:votes? )?for ${NAME} (?:as|for) [Pp]resident`).exec(clause))) { put(m[2], m[1]); put(m[4], m[3]); continue; }
    if ((m = new RegExp(`(\\d+) (?:electoral )?votes? for ${NAME} (?:as|for) [Pp]resident`).exec(clause))) { put(m[2], m[1]); continue; }
    if ((m = new RegExp(`${NAME} received (\\d+) (?:electoral )?votes? for [Pp]resident`).exec(clause))) { put(m[1], m[2]); continue; }
  }
  return { found, unknown };
}

const ABBR = { CT: 'Connecticut', DE: 'Delaware', GA: 'Georgia', MD: 'Maryland', MA: 'Massachusetts', NH: 'New Hampshire', NJ: 'New Jersey', PA: 'Pennsylvania', SC: 'South Carolina', VA: 'Virginia', NY: 'New York', NC: 'North Carolina', RI: 'Rhode Island' };

// The day an election is shown from: 1789, the day the first electors voted (4 February); 1792–1844, the electors'
// statutory day, the first Wednesday in December (Act of 1 March 1792); from 1848, Election Day, the Tuesday after
// the first Monday in November (Act of 23 January 1845).
function dayOf(y) {
  if (y === 1789) return 17890204;
  const ymd = (d) => d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  if (y < 1848) { const d = new Date(Date.UTC(y, 11, 1)); while (d.getUTCDay() !== 3) d.setUTCDate(d.getUTCDate() + 1); return ymd(d); }
  const d = new Date(Date.UTC(y, 10, 1)); while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1); d.setUTCDate(d.getUTCDate() + 1); return ymd(d);
}

function readElection(y) {
  const html = readFileSync(join(RAW, `${y}.html`), 'utf8');
  const [t0, t1] = tablesOf(html);
  const summary = readSummary(rowsOf(t0));
  const rows = rowsOf(t1);
  const problems = [];
  const cands = []; // { id, name, from, party_nara, ev }
  const cand = (name, from = null) => {
    const hit = findOne(name, cands);
    if (hit && hit !== 'ambiguous') { if (from && !hit.from) hit.from = from; return hit; }
    const s = findOne(name, summary.candidates, { loose: true });
    const c = { id: slug(name), name, from, party_nara: s && s !== 'ambiguous' ? s.party : null, ev: 0 };
    cands.push(c);
    return c;
  };
  const states = [];
  let rule = 'separate';
  let notes = '';

  if (y === 1789) {
    // Transposed: a row per candidate, a column per state; the last row is each state's electors.
    rule = 'two-votes';
    const head = rows[0].map((c) => c.text).slice(1, -1);
    const per = new Map(head.map((a) => [a, { votes: {}, electors: 0 }]));
    for (const r of rows.slice(1)) {
      const label = r[0].text;
      if (/^Total/.test(label)) { head.forEach((a, i) => { per.get(a).electors = int(r[i + 1].text); }); continue; }
      const c = cand(candidateOf(label).name);
      head.forEach((a, i) => { const n = int(r[i + 1].text); if (n) per.get(a).votes[c.id] = n; });
    }
    for (const [a, s] of per) states.push({ name: ABBR[a] ?? a, electors: s.electors, votes: s.votes });
    notes = rowsOf(t0).find((r) => r[0]?.text === 'Notes')?.slice(1).map((c) => c.text).join(' ') ?? '';
  } else {
    // State | Electoral Vote | For President (n columns) | For Vice-President (m columns); 1792–1800 have one list,
    // "For President and For Vice-President", two votes per elector.
    const pres = rows[0].find((c) => /For President/.test(c.text));
    if (/Vice/.test(pres.text)) rule = 'two-votes';
    const nPres = pres.span;
    const cols = rows[1].slice(0, nPres).map((c) => (/^Oth/i.test(c.text) ? null : cand(candidateOf(c.text).name, candidateOf(c.text).from)));
    const named = cols.filter(Boolean);
    const noteRow = rows.find((r) => /^Notes?$/.test(r[0]?.text));
    notes = noteRow ? noteRow.slice(1).map((c) => c.text).join(' ') : '';
    // The "others": the summary's names after the winner and main opponent (who always have columns of their own).
    const pool = summary.candidates.slice(2).filter((c) => !findOne(c.name, named)).map((c) => cand(c.name));
    for (const raw of rows.slice(2)) {
      let r = raw;
      const first = r[0]?.text ?? '';
      if (!first || /^(Totals?|Notes?)\b/.test(first)) continue;
      // (2012's table repeats the state's name and electors in a second pair of cells)
      if (r[2] && r[2].text === first) r = [r[0], r[1], ...r.slice(4)];
      if (r.length < 2 + nPres) continue;
      const { name, mark } = stateCell(first);
      const electors = int(r[1].text);
      const votes = {};
      let otherN = 0, contested = false;
      // "(9)": votes Congress disputed (Georgia, 1868); kept, and the state marked contested
      cols.forEach((c, i) => {
        const t = r[2 + i].text;
        if (/^\(\d+\)$/.test(t)) contested = true;
        const n = int(t.replace(/^\((\d+)\)$/, '$1'));
        if (!n) return;
        if (c) votes[c.id] = (votes[c.id] ?? 0) + n; else otherN += n;
      });
      const note = footnote(notes, mark);
      if (otherN) {
        const { found, unknown } = othersIn(note ?? '', pool, named, rule === 'two-votes');
        // A page that names no "others" in its summary (2016) names them only in the note: take them as written.
        const summaryNamesOthers = summary.candidates.length > 2;
        for (const u of unknown) if (!u.ambiguous && !summaryNamesOthers && u.name.split(' ').length >= 2) found.set(cand(u.name), (found.get(cand(u.name)) ?? 0) + u.n);
        for (const u of unknown) if (u.ambiguous) problems.push(`${y} ${name}: "${u.name}" could be more than one candidate`);
        const sum = [...found.values()].reduce((a, b) => a + b, 0);
        if (sum !== otherN) problems.push(`${y} ${name}: "Others" ${otherN}, the note names ${sum} (${note ?? 'no note'})`);
        for (const [c, n] of found) votes[c.id] = (votes[c.id] ?? 0) + n;
      }
      const s = { name, electors, votes };
      if (contested) s.contested = true;
      if (note) s.note = note;
      states.push(s);
    }
  }

  for (const e of ERRATA.filter((x) => x.year === y)) {
    const s = states.find((x) => x.name === e.state), c = cand(e.candidate);
    s.votes[c.id] = (s.votes[c.id] ?? 0) + e.votes;
    s.erratum = e.why;
  }

  // Totals per candidate, electors who cast no counted vote, and the checks against the page's own numbers.
  const per = rule === 'two-votes' ? 2 : 1;
  for (const s of states) {
    const cast = Object.values(s.votes).reduce((a, b) => a + b, 0);
    for (const [id, n] of Object.entries(s.votes)) cands.find((c) => c.id === id).ev += n;
    if (!s.electors && !cast) s.absent = true;
    else if (cast > s.electors * per) problems.push(`${y} ${s.name}: ${cast} votes from ${s.electors} electors`);
    else if (cast < s.electors * per) s.uncounted = s.electors - cast / per;
  }
  const cast = states.reduce((a, s) => a + Object.values(s.votes).reduce((p, q) => p + q, 0), 0) / per;
  const uncounted = states.reduce((a, s) => a + (s.uncounted ?? 0), 0);
  if (summary.total != null && cast !== summary.total && cast + uncounted !== summary.total) problems.push(`${y}: ${cast} electors' votes in the table (${uncounted} not counted), the page's total is ${summary.total}`);
  for (const s of summary.candidates) {
    if (!s.ev?.length) continue;
    const c = findOne(s.name, cands, { loose: true });
    if (!c || c === 'ambiguous') problems.push(`${y}: ${s.name} (${s.ev.join(' or ')}) is in the summary but not (once) in the table`);
    else if (!s.ev.includes(c.ev) && !(y === 1872 && /Greeley/.test(s.name))) problems.push(`${y}: ${s.name} has ${c.ev} in the table, ${s.ev.join(' or ')} in the summary`);
  }
  return {
    year: y, day: dayOf(y), url: URL_OF(y), rule, total: summary.total, majority: summary.majority,
    candidates: cands.filter((c) => c.ev > 0).sort((a, b) => b.ev - a.ev),
    states: states.sort((a, b) => a.name.localeCompare(b.name)),
    notes, problems,
  };
}

const show = process.argv.indexOf('--show');
if (show > -1) {
  const y = Number(process.argv[show + 1]);
  const e = readElection(y);
  console.log(JSON.stringify({ ...e, notes: e.notes.slice(0, 200), states: e.states.filter((s) => s.note || s.absent || s.uncounted || s.erratum) }, null, 1));
  process.exit(0);
}
const elections = YEARS.map(readElection);
const problems = elections.flatMap((e) => e.problems);
for (const e of elections) delete e.problems;
const out = {
  _source: 'U.S. National Archives and Records Administration, "Electoral College box scores", https://www.archives.gov/electoral-college/<year>. Public domain. Written by scripts/fetch-electoral.mjs; `party_nara` is the Archives\' own party label, given for the winner and main opponent only.',
  _rules: {
    day: '1789: 4 February 1789 (the first electors voted). 1792–1844: the first Wednesday in December, the electors\' statutory day (Act of 1 March 1792). From 1848: Election Day, the Tuesday after the first Monday in November (Act of 23 January 1845).',
    'two-votes': 'Before the Twelfth Amendment (elections of 1789–1800) each elector cast two votes, not distinguished between President and Vice President.',
    uncounted: 'Electors appointed who cast no counted vote (an elector who died, abstained, or whose vote Congress did not count); the state\'s `note` gives the Archives\' reason.',
    absent: 'A state in the table that cast no electoral votes (1868: not yet readmitted; 1872: results not certified).',
  },
  errata: ERRATA,
  elections,
};
writeFileSync(OUT, `${JSON.stringify(out)}\n`);

// The source's licence and attribution, as a marked block in docs/DATA-LICENSES.md: scripts/fetch-base.mjs, which
// rewrites that file from its own template, carries every such block over.
const LIC = join(ROOT, 'docs', 'DATA-LICENSES.md');
const block = [
  '<!-- fetch-electoral:start -->',
  '',
  '### North America stage: the Electoral College',
  '',
  'Downloaded and checked by `scripts/fetch-electoral.mjs` (URLs, dates and checksums in `data/base/MANIFEST-electoral.json`).',
  'Which party each candidate belongs to, where the Archives does not say, is authored in `src/us/parties.json`.',
  '',
  '| layer | source | license | attribution |',
  '|---|---|---|---|',
  `| Electoral College, ${YEARS[0]}–${YEARS.at(-1)}, state by state | U.S. National Archives and Records Administration, [Electoral College box scores](https://www.archives.gov/electoral-college), one page per election | Public domain (U.S. Government work) | U.S. National Archives and Records Administration |`,
  '',
  '<!-- fetch-electoral:end -->',
].join('\n');
const lic = existsSync(LIC) ? readFileSync(LIC, 'utf8') : '';
const marked = /<!-- fetch-electoral:start -->[\s\S]*?<!-- fetch-electoral:end -->/;
writeFileSync(LIC, marked.test(lic) ? lic.replace(marked, block) : `${lic.trimEnd()}\n\n${block}\n`);
console.log(`electoral: ${elections.length} elections (${elections[0].year}–${elections.at(-1).year}), ${elections.reduce((a, e) => a + e.states.length, 0)} state results → data/us/electoral.json`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exitCode = 1;
}

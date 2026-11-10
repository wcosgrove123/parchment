// Parchment — the Revolutionary War on the Military layer (owner, 2026-11-10): the war's record, the engagements
// pulled from Wikidata by scripts/pull-war.mjs (soundness only: the table is the owner's to edit), and the page with
// more events than a list can hold, where only the key events carry a numeral.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { validateRecords } from '../src/data/records.js';
import { launch, findBrowser } from '../scripts/browser.mjs';
import { serve, bundle } from '../scripts/serve.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const war = vocab.wars.find((w) => w.id === 'american-revolution');
const { records } = validateRecords(read('data/military.csv'), vocab);
const rows = records.filter((r) => r.war === 'american-revolution');
const day = (s, last) => { const [y, m, d] = String(s).split('-').map(Number); return y * 10000 + (m ?? (last ? 12 : 1)) * 100 + (d ?? (last ? 31 : 1)); };

test('the war: Lexington and Concord to the Treaty of Paris, four sides that name their colors and reasons, a source', () => {
  assert.ok(war, 'the war is in vocab.json');
  assert.deepEqual([war.start, war.end], ['1775-04-19', '1783-09-03']);
  assert.deepEqual(war.sides.map((s) => s.id), ['us', 'britain', 'france', 'spain']);
  assert.deepEqual(war.sides.slice(0, 2).map((s) => s.color), ['a', 'red'], 'Continental blue and British red, the uniform colors');
  for (const s of war.sides) assert.ok(s.label && s.why, `${s.id} says why it has its color`);
  assert.match(war.source, /Treaty of Paris/);
  assert.ok(war.key_events.length >= 10 && war._key_note.includes('Center of Military History'), 'the key events are the Army\'s named campaigns, and say so');
});

test('the pulled engagements: each a sound, sourced point row at a Wikidata place, inside the war and on the page, with no winner claimed', () => {
  const pulled = rows.filter((r) => /PULLED from Wikidata/.test(r.qc_note ?? ''));
  assert.ok(pulled.length > 100, `the war's engagements are in the table (${pulled.length})`);
  const box = JSON.parse(read('src/focuses.json')).focuses.find((f) => f.id === 'north-america').extent;
  const kinds = new Set(['battle', 'siege', 'naval-battle', 'raid', 'landing']);
  const ids = new Set();
  for (const r of pulled) {
    assert.ok(!ids.has(r.id), `${r.id} is unique`); ids.add(r.id);
    assert.deepEqual([r.tracker, r.kind], ['military', 'point'], r.id);
    assert.match(r.where, /^Q\d+$/, `${r.id}: a Wikidata place`);
    assert.ok(kinds.has(r.value), `${r.id}: ${r.value}`);
    assert.ok(Number.isFinite(r.lon) && Number.isFinite(r.lat), `${r.id}: geocoded`);
    assert.ok(r.lon >= box.west && r.lon <= box.east && r.lat >= box.south && r.lat <= box.north, `${r.id}: on the North America page`);
    assert.ok(day(r.start, true) >= day(war.start) && day(r.start) <= day(war.end, true), `${r.id}: begun within the war (${r.start})`);
    assert.ok(r.source.includes(`Wikidata ${r.where}`), `${r.id}: its source names the item`);
    assert.ok(!r.outcome && !r.side, `${r.id}: no winner and no besieger inferred`);
  }
  const have = new Set(rows.map((r) => r.id));
  for (const k of war.key_events) assert.ok(have.has(k), `key event ${k} is a row of the table`);
});

let exe = null;
try { exe = findBrowser(); } catch { exe = null; }
const skip = exe ? false : 'no Chromium-family browser found';
const inPage = (fn, ...args) => `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(',')})`;
const ready = () => new Promise((ok, no) => { const t = Date.now(); (function w() { if (window.parchment && window.parchment.ready && document.body.classList.contains('ready')) window.parchment.ready.then(ok, no); else if (Date.now() - t > 90000) no('timeout'); else setTimeout(w, 80); })(); });
let kit = null;
after(async () => { if (kit) { await kit.browser.close(); await kit.server.close(); } });

test('on the page: every engagement is marked, only the key events are numbered and listed, and the war ends with its treaty', { skip, timeout: 240000 }, async () => {
  kit = { server: await serve(ROOT, { files: { '/us.js': await bundle(ROOT) } }), browser: await launch({ browser: exe }) };
  const page = await kit.browser.newPage({ width: 1920, height: 1080, scale: 1, origin: kit.server.origin });
  await page.goto(`${kit.server.origin}/us.html?tracker=military&date=1783-09-03&frame=east`);
  await page.eval(inPage(ready));
  const seen = await page.eval(inPage(async () => {
    const slip = await window.parchment.packingSlip();
    const groups = [...document.querySelectorAll('.view-main g.mark-group')].map((g) => g.__data__?.r).filter((r) => r && r.tracker === 'military');
    return { war: slip.resolved?.war?.id ?? null, marks: groups.length, numbered: groups.filter((r) => r.seq != null).map((r) => r.id), title: document.querySelector('.course-list .legend-title')?.textContent ?? null };
  }));
  assert.equal(seen.war, 'american-revolution', 'the date names the war');
  assert.ok(seen.marks > 100, `the engagements on the sheet (${seen.marks})`);
  assert.ok(seen.numbered.length > 5 && seen.numbered.length <= war.key_events.length, `only key events carry a numeral (${seen.numbered.length})`);
  for (const id of seen.numbered) assert.ok(war.key_events.includes(id), `${id} is a key event`);
  const next = await page.eval(inPage(async () => { window.parchment.setDate('1783-09-04'); await new Promise((r) => setTimeout(r, 600)); return (await window.parchment.packingSlip()).resolved?.war?.id ?? null; }));
  assert.equal(next, null, 'the day after the treaty: no war');
  await page.close();
});

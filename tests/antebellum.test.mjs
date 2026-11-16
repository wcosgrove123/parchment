// The brief "maps for the Antebellum South lecture" (2026-11-16), its tests A1, A2, B1 and B2: the slavery-status
// tracker's table and model, then the three orders rendered through the same command a cloud session uses
// (tests/maps/*.json, scripts/map.mjs). The renders are skipped when no browser is found (scripts/browser.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findBrowser } from '../scripts/browser.mjs';
import { renderOrder } from '../scripts/map.mjs';
import { prepareData, aliveNB } from '../src/us/model.js';
import { prepareSlavery, slaveryCount, slaveryLook, statusRow } from '../src/us/slavery.js';
import { resolveFrame, makeHighlight } from '../src/us/frames.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const json = (p) => JSON.parse(read(p));
const tracker = json('src/us/trackers.json').slavery;
const table = prepareSlavery(read('data/us/slavery-status.csv'));
const data = prepareData({ nbTopo: json('data/us/newberry.topojson'), ohmTopo: json('data/us/ohm.topojson'), cesTopo: null, natTopo: null });

test('the status table: every row reads, names a Newberry polygon, and is marked a test row', () => {
  assert.deepEqual(table.problems, []);
  assert.equal(table.rows.length, 33);
  const ids = new Set(data.nb.map((it) => it.p.id));
  for (const r of table.rows) {
    assert.ok(ids.has(r.id), `${r.id} is a Newberry polygon id`);
    assert.match(r.note, /TEST ROW/);
    assert.ok(r.source, `${r.id} has a source value`);
  }
});

test('A2. 1 June 1820: 23 states, 12 free and 11 slave; 1 June 1860: 33 states, 18 free and 15 slave', () => {
  const a = slaveryCount(table, tracker, aliveNB(data, 18200601), 18200601);
  assert.deepEqual([a.states, a.free, a.slave, a.without_a_row], [23, 12, 11, []]);
  const b = slaveryCount(table, tracker, aliveNB(data, 18600601), 18600601);
  assert.deepEqual([b.states, b.free, b.slave, b.without_a_row], [33, 18, 15, []]);
});

test('a territory takes the neutral fill, the District of Columbia none, and nothing has a status outside the coverage', () => {
  const on = (id, d) => slaveryLook(table, tracker, aliveNB(data, d).find((it) => it.p.id === id), d);
  assert.equal(on('mo_terr', 18200601).status, 'territory');
  assert.equal(on('mo_state', 18600601).status, 'slave');
  assert.equal(on('dc', 18600601).status, null);
  assert.equal(on('va_state', 18700601).status, null, 'outside 1820–1860 the table is silent');
  assert.equal(statusRow(table, tracker, { id: 'va_state' }, 18100601), null);
});

test('a territory can be given a status later as a dated row, without reshaping the table', () => {
  const t = prepareSlavery('id,name,status,start,end,source,note\nks_terr,Kansas Territory,free,1859-01-01,1859-12-31,test,test\nxx,Bad,maybe,,,,\n');
  assert.equal(t.problems.length, 1, 'a bad row is skipped and listed');
  assert.equal(statusRow(t, tracker, { id: 'ks_terr' }, 18590601)?.status, 'free');
  assert.equal(statusRow(t, tracker, { id: 'ks_terr' }, 18600601), null);
});

test('the south frame holds Texas and the Atlantic coast; highlight "none" lights nothing and reports nothing unmatched', () => {
  const f = resolveFrame('south', json('src/focuses.json'));
  assert.deepEqual([f.box.west, f.box.south, f.box.east, f.box.north], [-107, 24, -74, 41]);
  const h = makeHighlight('none');
  assert.equal(h.has(new Set(['united-states'])), null);
  assert.deepEqual(h.unmatched(), []);
});

// ---------------------------------------------------------------- the three orders, rendered
let browser = null;
try { browser = findBrowser(); } catch { browser = null; }
const skip = browser ? false : 'no Chromium-family browser found';
const order = (name) => json(`tests/maps/${name}.json`);
const OUT = mkdtempSync(join(tmpdir(), 'parchment-antebellum-'));
test.after(() => rmSync(OUT, { recursive: true, force: true }));
async function render(name) {
  const r = await renderOrder(order(name), { out: join(OUT, name), base: OUT, browser });
  const s = r.slip;
  assert.deepEqual(s.render.blocked_requests, [], 'no request left this machine');
  assert.deepEqual(s.render.page_errors, []);
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside, 'legend and cartouche inside the frame');
  assert.deepEqual(s.layout.clipped_text, [], 'no name runs past the edge');
  return s;
}

test('A1 and A2. slave-free-1820 and slave-free-1860 pair: one frame, projection, sheet and key', { skip, timeout: 240000 }, async () => {
  const a = await render('slave-free-1820'), b = await render('slave-free-1860');
  for (const s of [a, b]) assert.deepEqual(s.render.pixels, { width: 1440, height: 1620 });
  assert.deepEqual(a.resolved.frame, b.resolved.frame);
  assert.deepEqual(a.resolved.projection, b.resolved.projection);
  assert.deepEqual(a.resolved.size, b.resolved.size);
  assert.deepEqual(a.layout.legend, b.layout.legend, 'the key sits in the same place at the same size');
  assert.deepEqual(a.layout.cartouche, b.layout.cartouche);
  const rows = (s) => s.legend.rows.map((r) => [r.label, r.key ?? r.dash]);
  assert.deepEqual(rows(a), [['Free state', 'T'], ['Slave state', 'S'], ['Territories', 'E'], ['Documented border', 'solid']]);
  assert.deepEqual(rows(a), rows(b), 'the same key, in the same order');
  assert.deepEqual([a.resolved.status.states, a.resolved.status.free, a.resolved.status.slave], [23, 12, 11]);
  assert.deepEqual([b.resolved.status.states, b.resolved.status.free, b.resolved.status.slave], [33, 18, 15]);
  const of = (s, id) => s.features.find((f) => f.ids.newberry === id);
  assert.equal(of(a, 'mo_terr').status, 'territory');
  assert.equal(of(b, 'mo_state').status, 'slave');
  assert.equal(of(b, 'tx_state').status, 'slave');
  assert.equal(of(b, 'tx_state').cut_by_frame, false, 'Texas is whole on the sheet');
  assert.ok(a.warnings.some((w) => /TEST ROWS/.test(w)));
  assert.match(a.credit, /status of states: the Parchment status table \(test rows\)/);
  // fills drawn are only the key's three
  for (const s of [a, b]) assert.deepEqual([...new Set(s.features.filter((f) => f.look.kind === 'fill').map((f) => f.look.key))].sort(), ['E', 'S', 'T']);
});

test('B1 and B2. revolts-1800-1831: four pins, four names, their ids and sources, and the warnings of date', { skip, timeout: 120000 }, async () => {
  const s = await render('revolts-1800-1831');
  assert.deepEqual(s.render.pixels, { width: 1920, height: 1080 });
  assert.equal(s.points.length, 4);
  assert.ok(s.points.every((p) => p.labeled && !p.dropped), 'every pin is named');
  assert.deepEqual(s.points.map((p) => [p.record, p.where, p.source]).sort(), [
    ['test-ab-gabriel-1800', 'Q43421', 'PENDING OWNER'],
    ['test-ab-german-coast-1811', 'Q507629', 'PENDING OWNER'],
    ['test-ab-turner-1831', 'Q337915', 'PENDING OWNER'],
    ['test-ab-vesey-1822', 'Q47716', 'PENDING OWNER'],
  ]);
  const before = s.warnings.filter((w) => /predates the map's date/.test(w));
  assert.equal(before.length, 3, 'Gabriel 1800, the German Coast 1811 and Vesey 1822 predate 21 August 1831');
  assert.ok(before.some((w) => /German Coast.*Orleans Territory.*Louisiana/.test(w)), 'Louisiana was the Territory of Orleans in 1811');
  assert.ok(s.legend.rows.some((r) => r.label === 'Revolt or conspiracy'));
  assert.equal(s.features.filter((f) => f.look.kind === 'fill').length, 0, 'the base is quiet: no fill');
  assert.ok(s.rivers.some((r) => r.name === 'Mississippi' && r.labeled));
});


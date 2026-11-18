// The statehood deck's maps (brief of 2026-11-18, .board/outbox/statehood/): its test orders 1 to 6, rendered through
// the same order forms and command a cloud session uses (tests/maps/statehood/*.json, scripts/map.mjs), and the model
// behind them without a browser: land that changed hands between surviving polygons (src/us/diff.js handoffsUS) and
// the key lines of Newberry's "Other" areas (src/us/trackers.json). The renders are skipped when no browser is found.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepareData } from '../src/us/model.js';
import { diffUS, handoffsUS } from '../src/us/diff.js';
import { insetsNamed } from '../src/us/frames.js';
import { findBrowser } from '../scripts/browser.mjs';
import { renderOrder } from '../scripts/map.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const trackers = read('src/us/trackers.json');

// ---------------------------------------------------------------- the model, no browser
const data = prepareData({ nbTopo: read('data/us/newberry.topojson'), ohmTopo: read('data/us/ohm.topojson'), cesTopo: null, natTopo: null });
const pairs = (list) => list.map((h) => `${h.from.p.id}>${h.to.p.id}`).sort();

test('changed hands: the Texas sale, 12 to 13 December 1850, to New Mexico Territory and to unorganized federal land', () => {
  const h = handoffsUS(data, 18501212, 18501213);
  assert.deepEqual(pairs(h), ['tx_state>nm_terr', 'tx_state>uf_terr']);
  const nm = h.find((x) => x.to.p.id === 'nm_terr'), uft = h.find((x) => x.to.p.id === 'uf_terr');
  assert.ok(nm.appeared, 'New Mexico Territory is new on the later date');
  assert.ok(!uft.appeared, 'the unorganized territory was already there');
  assert.ok(uft.km2 > 50000 && uft.km2 < 80000, `the strip to unorganized land: ${uft.km2} km²`);
  assert.ok(nm.km2 > 150000, `the part to New Mexico Territory: ${nm.km2} km²`);
});

test('changed hands: land a claim already covered is not counted (Utah Territory and Deseret claimed it before the sale)', () => {
  const h = handoffsUS(data, 18501212, 18501213);
  assert.ok(!h.some((x) => x.to.p.id === 'ut_terr' || x.to.p.id === 'ds_deseret'));
});

test('changed hands: the retrocession, 6 to 7 September 1846: the District of Columbia to Virginia, some 83 km²', () => {
  const h = handoffsUS(data, 18460906, 18460907);
  assert.deepEqual(pairs(h), ['dc>va_state']);
  assert.ok(h[0].km2 > 60 && h[0].km2 < 110, `${h[0].km2} km²`);
});

test('changed hands: Berkeley and Jefferson counties, Virginia to West Virginia, 1863', () => {
  assert.deepEqual(pairs(handoffsUS(data, 18630620, 18631102)), ['va_state>wv_state']);
});

test('changed hands: a day on which no border moved has none, and the diff carries them only under the states tracker', () => {
  assert.deepEqual(handoffsUS(data, 18501213, 18501214), []);
  assert.equal(diffUS(data, 18501212, 18501213, 'states').handoffs.length, 2);
  assert.deepEqual(diffUS(data, 18501212, 18501213, 'nations').handoffs, []);
});

test('the states tracker names three of Newberry\'s "Other" areas for what they were, and only those', () => {
  const areas = trackers.states.other_areas;
  assert.deepEqual(Object.keys(areas).sort(), ['ds_deseret', 'tx_republic', 'vt_republic']);
  assert.equal(areas.ds_deseret.label, 'Proposed state (not recognized)');
  assert.equal(areas.vt_republic.label, 'Independent republic');
  assert.equal(areas.tx_republic.label, 'Independent republic');
  const nb = data.nb.filter((it) => it.p.type === 'Other').map((it) => it.p.id);
  for (const id of Object.keys(areas)) assert.ok(nb.includes(id), `${id} is a Newberry "Other" polygon`);
});

// ---------------------------------------------------------------- the renders
let browser = null;
try { browser = findBrowser(); } catch { browser = null; }
const skip = browser ? false : 'no Chromium-family browser found';
const order = (name) => JSON.parse(readFileSync(new URL(`./maps/statehood/${name}.json`, import.meta.url), 'utf8'));
const OUT = mkdtempSync(join(tmpdir(), 'parchment-statehood-'));
test.after(() => rmSync(OUT, { recursive: true, force: true }));
async function render(name) {
  const r = await renderOrder({ ...order(name), size: '1920x1080' }, { out: join(OUT, name), base: OUT, browser });
  const s = r.slip;
  assert.deepEqual(s.render.pixels, { width: 1920, height: 1080 });
  assert.deepEqual(s.render.blocked_requests, [], 'no request left this machine');
  assert.deepEqual(s.render.page_errors, []);
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside);
  assert.deepEqual(s.layout.clipped_text, [], 'no name runs past the edge');
  return s;
}

test('1. Alaska and Hawaii, 21 August 1959, on the whole continent: both lit, no warning', { skip, timeout: 120000 }, async () => {
  const s = await render('akhi-1959');
  const lit = s.features.filter((f) => f.lit).map((f) => f.ids.newberry).sort();
  assert.deepEqual(lit, ['ak_state', 'hi_state']);
  assert.deepEqual(s.resolved.highlight.off_frame, []);
  assert.ok(!s.warnings.some((w) => /not on this map/.test(w)));
});

test('2. the same on the north-america frame: the order names them, so the frame draws both insets (owner, "Insets when lit")', { skip, timeout: 120000 }, async () => {
  const s = await render('akhi-frame-1959');
  assert.deepEqual(s.resolved.stage_insets.map((i) => i.id), ['alaska', 'hawaii']);
  const lit = s.features.filter((f) => f.lit).map((f) => f.ids.newberry).sort();
  assert.deepEqual(lit, ['ak_state', 'hi_state']);
  assert.deepEqual(s.resolved.highlight.off_frame, []);
  assert.deepEqual(s.resolved.highlight.unmatched, [], 'both ids found their polygons');
});

test('2b. a lit polygon off the frame (California on the east frame) is named on the slip with a warning', { skip, timeout: 120000 }, async () => {
  const s = await render('offframe-1959');
  assert.deepEqual(s.resolved.highlight.off_frame, [{ id: 'nb:ca_state', name: 'California', inset: null }]);
  assert.ok(s.warnings.includes('California (nb:ca_state) is lit but lies outside this frame'));
  assert.deepEqual(s.resolved.stage_insets, [], 'no inset: the order names nothing in Alaska or Hawaii');
});

test('a frame lit by power draws no insets: the Texas maps of the lesson-maps brief are unchanged', () => {
  const nbLike = data.nb;
  assert.deepEqual(insetsNamed(read('src/stages/north-america.json').insets, nbLike, ['coahuila-y-tejas', 'mexico', 'united-states']), []);
  assert.deepEqual(insetsNamed(read('src/stages/north-america.json').insets, nbLike, ['nb:hi_state']).map((i) => i.id), ['hawaii']);
  assert.deepEqual(insetsNamed(read('src/stages/north-america.json').insets, nbLike, ['Alaska']).map((i) => i.id), ['alaska']);
});

test('3. the Texas sale as a Diff: Texas to unorganized federal land and to New Mexico Territory changed hands', { skip, timeout: 120000 }, async () => {
  const s = await render('texas-sale-1850');
  const land = s.changes.changed_hands.filter((c) => c.kind === 'land');
  assert.deepEqual(land.map((c) => c.name).sort(), ['Texas → New Mexico Territory', 'Texas → Unorganized Federal Territory']);
  for (const c of land) assert.ok(c.km2 > 0 && c.sq_mi > 0 && c.from.newberry === 'tx_state');
  assert.equal(s.legend.rows[0].label, 'Appeared or changed hands');
  assert.ok(s.changes.as_listed.some((x) => x.title === 'Changed hands'));
  const piece = s.features.find((f) => f.layer === 'changed-hands' && f.ids.newberry[1] === 'uf_terr');
  assert.ok(piece.labeled, 'the strip carries the name of the land that now holds it');
  assert.match(s.alt_text, /Changed hands: Texas → /);
});

test('4. the retrocession as a Diff: the District of Columbia to Virginia', { skip, timeout: 120000 }, async () => {
  const s = await render('dc-1846');
  assert.deepEqual(s.changes.changed_hands.map((c) => c.name), ['District of Columbia → Virginia']);
  assert.equal(s.legend.rows[0].label, 'Changed hands');
  const piece = s.features.find((f) => f.layer === 'changed-hands');
  assert.equal(piece.label, 'Virginia');
  assert.match(piece.source.dataset, /^Computed by Parchment/);
});

test('5. the thirteen on the east frame: Delaware and Rhode Island carry their abbreviations', { skip, timeout: 120000 }, async () => {
  const s = await render('thirteen-1790');
  const byId = (id) => s.features.find((f) => f.ids.newberry === id);
  assert.equal(byId('de_state').label, 'DE');
  assert.equal(byId('ri_state').label, 'RI');
  assert.equal(s.features.filter((f) => f.lit && f.layer === 'newberry' && f.labeled).length, 13, 'every lit state is named');
  assert.ok(!s.warnings.some((w) => /carries no name/.test(w)));
});

test('6. Deseret, 1 June 1850: keyed as a proposed state, still hatched', { skip, timeout: 120000 }, async () => {
  const s = await render('deseret-1850');
  const row = s.legend.rows.find((r) => r.label === 'Proposed state (not recognized)');
  assert.ok(row, 'the key line');
  assert.equal(row.pattern, 'hatch-rust');
  assert.ok(!s.legend.rows.some((r) => /Disputed or overlapping/.test(r.label)));
  const d = s.features.find((f) => f.ids.newberry === 'ds_deseret');
  assert.equal(d.look.kind, 'pattern');
  assert.equal(d.keyed_as, 'Proposed state (not recognized)');
});

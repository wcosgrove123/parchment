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
import { prepareClassTable, preparePieces, piecesOn } from '../src/us/classify.js';
import { parseCSV } from '../src/data/records.js';
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

// ---------------------------------------------------------------- item 5: the classification trackers, no browser
const text = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const oracle = (() => {
  const rows = parseCSV(text('tests/maps/statehood/pieces-oracle.csv'));
  const h = Object.fromEntries(rows[0].map((x, i) => [x.trim(), i]));
  const m = new Map();
  for (const r of rows.slice(1)) if (r[h.state]) { const s = m.get(r[h.state]) ?? new Map(); s.set(r[h.piece], Number(r[h.share])); m.set(r[h.state], s); }
  return m;
})();

test('paths: one row for each of the fifty states, the outline\'s counts (13, 4, 2, 20, 11), nothing skipped', () => {
  const t = prepareClassTable(text('data/us/statehood-paths.csv'), { file: 'data/us/statehood-paths.csv', column: 'path', values: Object.keys(trackers.paths.classes) });
  assert.deepEqual(t.problems, []);
  const by = {};
  for (const r of t.rows) by[r.value] = (by[r.value] ?? 0) + 1;
  assert.deepEqual(by, { founding: 13, carved: 4, direct: 2, enabled: 20, 'self-started': 11 });
  const states = new Set(data.nb.filter((it) => it.p.type === 'State').map((it) => it.p.id));
  assert.equal(states.size, 50);
  for (const id of states) assert.ok(t.byId.has(id), `${id} has a path`);
  assert.equal(t.byId.get('mi_state')[0].value, 'self-started', 'Michigan: the act came after its constitution');
  assert.equal(t.byId.get('tx_state')[0].value, 'direct');
});

test('chapters: every state and the District in one chapter, the outline\'s counts', () => {
  const t = prepareClassTable(text('data/us/statehood-chapters.csv'), { file: 'data/us/statehood-chapters.csv', column: 'chapter' });
  assert.deepEqual(t.problems, []);
  const by = {};
  for (const r of t.rows) by[r.value] = (by[r.value] ?? 0) + 1;
  assert.deepEqual(by, { 1: 13, 2: 4, 3: 5, 4: 4, 5: 5, 6: 1, 7: 2, 8: 3, 9: 2, 10: 8, 11: 1, 12: 2, 13: 1 });
  assert.equal(t.byId.get('dc')[0].value, '13');
});

test('pieces: every acquisition the outline lists is a day the Newberry\'s U.S. land grows, and today has all twelve', () => {
  const pieces = preparePieces(read('data/us/pieces.topojson'));
  const today = piecesOn(pieces, 20260101).map((it) => it.p.key).sort();
  assert.deepEqual(today, ['adamsonis_line', 'alaska', 'florida', 'gadsden', 'hawaii', 'hempstead', 'louisiana', 'mexican', 'oregon', 'redriver', 'texas', 'treaty1783', 'westflorida']);
  assert.deepEqual(piecesOn(pieces, 18200101).map((it) => it.p.key).sort(), ['adamsonis_line', 'florida', 'hempstead', 'louisiana', 'redriver', 'treaty1783', 'westflorida'], 'a map of 1820 has its own pieces');
  for (const it of piecesOn(pieces, 20260101)) assert.equal(it.p.label, { hempstead: null, treaty1783: 'won', mexican: 'won', louisiana: 'bought', florida: 'bought', gadsden: 'bought', alaska: 'bought', redriver: 'split', adamsonis_line: 'split', oregon: 'split', texas: 'joined', hawaii: 'joined', westflorida: 'claimed' }[it.p.key] ?? null, it.p.key);
});

test('7 (model). every state\'s shares are within half a point of the deck\'s table', () => {
  const shares = read('data/us/pieces.topojson').shares.states;
  assert.equal(shares.length, 51, 'fifty states and the District');
  for (const s of shares) {
    const want = oracle.get(s.name);
    assert.ok(want, `${s.name} is in the deck's table`);
    for (const k of new Set([...want.keys(), ...s.pieces.map((p) => p.key)])) {
      const got = s.pieces.find((p) => p.key === k)?.share ?? 0;
      assert.ok(Math.abs(got - (want.get(k) ?? 0)) <= 0.005, `${s.name} ${k}: ${got} against ${want.get(k) ?? 0}`);
    }
  }
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

test('7. how the land became U.S. land, 1 January 2026: four fills, Claimed hatched, every state\'s shares on the slip', { skip, timeout: 120000 }, async () => {
  const s = await render('pieces-2026');
  assert.deepEqual(s.legend.rows.map((r) => r.label), ['Won', 'Bought', 'Split', 'Joined', 'Claimed', 'Documented border']);
  assert.equal(s.legend.rows.find((r) => r.label === 'Claimed').pattern, 'hatch-rust', 'Claimed hatched (owner, 2026-11-18)');
  const c = s.resolved.classification;
  assert.equal(c.shares.length, 51);
  for (const st of c.shares) {
    const want = oracle.get(st.name);
    for (const k of new Set([...want.keys(), ...st.pieces.map((p) => p.key)])) assert.ok(Math.abs((st.pieces.find((p) => p.key === k)?.share ?? 0) - (want.get(k) ?? 0)) <= 0.005, `${st.name} ${k}`);
  }
  assert.ok(s.features.some((f) => f.layer === 'acquisition-piece' && f.source.acquisition.key === 'westflorida' && /hatch/.test(f.look.pattern)));
});

test('paths, 1 January 2026: five fills in the outline\'s order (owner: "paths get 5")', { skip, timeout: 120000 }, async () => {
  const s = await render('paths-2026');
  assert.deepEqual(s.legend.rows.map((r) => r.label), ['Founding', 'Carved', 'Direct', 'Enabled', 'Self-started', 'Documented border']);
  assert.deepEqual(Object.fromEntries(Object.entries(s.resolved.classification.by_class).map(([k, v]) => [k, v.length])), { founding: 13, carved: 4, direct: 2, enabled: 20, 'self-started': 11 });
  assert.equal(s.features.find((f) => f.ids.newberry === 'mi_state').class.value, 'self-started');
});

test('chapters: Chapter 3 lit by its id, its five states named, one key line', { skip, timeout: 120000 }, async () => {
  const s = await render('chapters-3-1959');
  assert.deepEqual(s.legend.rows.map((r) => r.label), ['Chapter 3 · The Northwest Ordinance', 'Documented border']);
  assert.deepEqual(s.features.filter((f) => f.lit).map((f) => f.ids.newberry).sort(), ['il_state', 'in_state', 'mi_state', 'oh_state', 'wi_state']);
  assert.deepEqual(s.resolved.classification.chapters_lit, [3]);
});

test('Colorado on its admission day with the pieces: the four inside it, nothing outside', { skip, timeout: 120000 }, async () => {
  const s = await render('pieces-colorado-1876');
  assert.deepEqual(s.resolved.classification.acquisitions.map((a) => a.key), ['louisiana', 'adamsonis_line', 'texas', 'mexican']);
  assert.ok(s.features.filter((f) => f.layer === 'acquisition-piece').every((f) => f.source.clipped_to));
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

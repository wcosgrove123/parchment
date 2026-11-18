// The world page's lesson maps (statehood brief of 2026-11-18, items 6 and 7): the dated island-territory layer
// (data/world/insular.topojson, from data/world/insular-areas.csv by scripts/derive-insular.mjs) without a browser,
// then the brief's test 8 and two more orders rendered through scripts/map.mjs with "page": "world"
// (tests/maps/statehood/world-*.json). The renders are skipped when no browser is found.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { feature } from 'topojson-client';
import { geoBounds } from 'd3';
import { prepareInsular, insularOn, fuzzyOn, insularKeys, HOLDS } from '../src/world/insular.js';
import { landWithIslands, pieceLook } from '../src/world/stage.js';
import { boxText } from '../src/world/slip.js';
import { makeHighlight, slug } from '../src/us/frames.js';
import { parseCSV } from '../src/data/records.js';
import { findBrowser } from '../scripts/browser.mjs';
import { renderOrder } from '../scripts/map.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const topo = read('data/world/insular.topojson');
const layer = prepareInsular(topo);
const ids = (d) => insularOn(layer, d).map((it) => it.p.id).sort();
const piece = (id) => layer.items.find((it) => it.p.id === id);

// ---------------------------------------------------------------- the layer, no browser
test('the table and the layer agree: every row is a dated piece with a hold, keys, a source and a shape', () => {
  const rows = parseCSV(readFileSync(new URL('../data/world/insular-areas.csv', import.meta.url), 'utf8'));
  const head = rows[0];
  for (const c of ['id', 'keys', 'name', 'hold', 'start', 'end', 'shape', 'islands', 'drop_islands', 'source', 'note', 'occupied', 'label']) assert.ok(head.includes(c), `column ${c}`);
  const body = rows.slice(1).filter((r) => r.length > 1);
  assert.ok(body.every((r) => r.length === head.length), 'every row has every column');
  assert.equal(layer.items.length, body.length, 'every row found its shape');
  for (const it of layer.items) {
    assert.ok(HOLDS[it.p.hold], `${it.p.id}: hold ${it.p.hold}`);
    assert.ok(it.p.keys.length && it.p.keys.every((k) => /^ia:/.test(k)), `${it.p.id}: keys`);
    assert.ok(it.p.s <= it.p.e, `${it.p.id}: dates in order`);
    assert.ok(it.p.source.length > 10, `${it.p.id}: a source`);
    // (a cay of a few hundred square meters rounds to 0 km²: Bajo Nuevo, Roncador)
    assert.ok(it.f.geometry?.coordinates?.length > 0 && it.p.km2 >= 0, `${it.p.id}: a shape`);
  }
  assert.match(topo._source, /Nothing drawn/);
});

test('1 January 2026: the five inhabited territories, the minor islands and nothing given up or handed back', () => {
  assert.deepEqual(ids(20260101), ['ia-as', 'ia-as-manua', 'ia-as-swains', 'ia-gu', 'ia-mp', 'ia-pr',
    'ia-um-bajo-nuevo', 'ia-um-baker', 'ia-um-howland', 'ia-um-jarvis', 'ia-um-johnston', 'ia-um-kingman', 'ia-um-midway',
    'ia-um-navassa', 'ia-um-palmyra', 'ia-um-serranilla', 'ia-um-wake', 'ia-vi']);
});

test('the Philippines: a U.S. territory through 3 July 1946, independent on the 4th', () => {
  assert.ok(ids(19460703).includes('ia-ph'));
  assert.ok(!ids(19460704).includes('ia-ph'));
  assert.ok(!ids(18981209).includes('ia-ph') && ids(18981210).includes('ia-ph'), 'from the Treaty of Paris, signed 10 December 1898');
});

test('the trust territory: four pieces from 18 July 1947; on 3 November 1986 Palau alone is left in it', () => {
  const ttpi = (d) => insularOn(layer, d).filter((it) => it.p.keys.includes('ia:ttpi')).map((it) => it.p.id).sort();
  assert.deepEqual(ttpi(19470718), ['ia-ttpi-fsm', 'ia-ttpi-mhl', 'ia-ttpi-nmi', 'ia-ttpi-plw']);
  assert.deepEqual(ttpi(19861103), ['ia-ttpi-plw']);
  assert.deepEqual(ttpi(19941001), []);
  assert.ok(insularOn(layer, 19470718).filter((it) => it.p.keys.includes('ia:ttpi')).every((it) => pieceLook(it, 19470718, null).fill === 'T'), 'teal: held in trust');
});

test('a date known only to the month or the year is held through the whole stretch, and drawn dashed there', () => {
  const ry = piece('ia-ryukyu');
  assert.equal(ry.p.start, '1951-09');
  assert.ok(ids(19510901).includes('ia-ryukyu') && fuzzyOn(ry, 19510915) && pieceLook(ry, 19510915, null).dashed);
  assert.ok(!fuzzyOn(ry, 19511001) && !pieceLook(ry, 19600101, null).dashed);
  assert.ok(ids(19720514).includes('ia-ryukyu') && !ids(19720515).includes('ia-ryukyu'), 'handed back on 15 May 1972');
  const sw = piece('ia-as-swains');
  assert.ok(fuzzyOn(sw, 19250601) && !fuzzyOn(sw, 19260101), 'Swains Island: the year 1925 only');
});

test('the claims given up are hatched, from each treaty\'s signing, and gone by 23 September 1983', () => {
  const claims = layer.items.filter((it) => it.p.hold === 'claim');
  assert.equal(claims.length, 6);
  assert.ok(claims.every((it) => pieceLook(it, it.p.s, null).pattern === 'hatch'));
  assert.deepEqual(insularOn(layer, 19830923).filter((it) => it.p.hold === 'claim'), []);
});

test('Guam under Japan, 1941 to 1944: the record keeps the occupation for the slip, the sovereignty for the map', () => {
  const gu = piece('ia-gu');
  assert.deepEqual([gu.p.occupied.by, gu.p.occupied.s <= 19430301 && 19430301 <= gu.p.occupied.e, 19450101 > gu.p.occupied.e], ['Japan', true, true]);
  assert.ok(ids(19430301).includes('ia-gu'));
});

test('a highlight names a piece by its ia: key, the family key or its id; the trust territory\'s four share one printed name', () => {
  const hl = makeHighlight('ia:pr,ia:um');
  assert.ok(hl.has(insularKeys(piece('ia-pr'), slug)) && hl.has(insularKeys(piece('ia-um-wake'), slug)));
  assert.ok(!hl.has(insularKeys(piece('ia-vi'), slug)));
  assert.deepEqual(hl.unmatched(), []);
  assert.deepEqual([...new Set(layer.items.filter((it) => it.p.id.startsWith('ia-ttpi')).map((it) => it.p.label))], ['Trust Territory of the Pacific Islands']);
});

test('where an island piece is the land, its own outline stands for Natural Earth\'s coarser one', () => {
  const ne = read('data/base/derived/ne.topojson');
  const fine = [piece('ia-pr').f];
  const g = landWithIslands(ne, fine);
  assert.ok(g.replaced >= 1, 'Puerto Rico\'s 1:50m polygon is left out');
  const [[w, s], [e, n]] = geoBounds(fine[0]);
  const all = feature(ne, ne.objects.land).features.length;
  assert.ok(g.land.geometry.coordinates.length >= all - 5, 'and nothing far from it');
  assert.ok(w < -67 && e > -65.3 && s > 17.8 && n < 18.6, 'the piece is Puerto Rico');
  assert.equal(boxText({ west: -68.1, south: 17.6, east: -64.4, north: 18.6 }), '68.1°W–64.4°W, 17.6°N–18.6°N');
});

// ---------------------------------------------------------------- the renders
let browser = null;
try { browser = findBrowser(); } catch { browser = null; }
const skip = browser ? false : 'no Chromium-family browser found';
const order = (name) => JSON.parse(readFileSync(new URL(`./maps/statehood/${name}.json`, import.meta.url), 'utf8'));
const OUT = mkdtempSync(join(tmpdir(), 'parchment-world-'));
test.after(() => rmSync(OUT, { recursive: true, force: true }));
async function render(name) {
  const r = await renderOrder({ ...order(name), size: '1920x1080' }, { out: join(OUT, name), base: OUT, browser });
  const s = r.slip;
  assert.equal(s.page, 'world');
  assert.deepEqual(s.render.pixels, { width: 1920, height: 1080 });
  assert.deepEqual(s.render.blocked_requests, [], 'no request left this machine');
  assert.deepEqual(s.render.page_errors, []);
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside);
  assert.deepEqual(s.layout.clipped_text, [], 'no name runs past the edge');
  return s;
}
const lit = (s) => s.features.filter((f) => f.layer === 'island-territory' && f.lit).map((f) => f.id).sort();
const rows = (s) => s.legend.rows.map((r) => r.label);

test('8a. Puerto Rico and the Virgin Islands, 2026: both lit and named, green; the ground from Cliopatria\'s last year', { skip, timeout: 120000 }, async () => {
  const s = await render('world-pr-vi-2026');
  assert.deepEqual(lit(s), ['ia-pr', 'ia-vi']);
  assert.ok(s.features.filter((f) => f.lit).every((f) => f.labeled && f.look.key === 'In'));
  assert.deepEqual(rows(s), ['U.S. territory']);
  assert.equal(s.resolved.states_year.asked, 2026);
  assert.ok(s.resolved.states_year.drawn < 2026 && s.warnings.some((w) => /Cliopatria's states end in/.test(w)));
  assert.deepEqual(s.resolved.highlight.unmatched, []);
  assert.equal(s.resolved.title, 'Puerto Rico and the Virgin Islands');
  assert.match(s.credit, /U\.S\. Census Bureau/);
  assert.match(s.alt_text, /68\.1°W–64\.4°W/);
});

test('8b. Guam and the Northern Marianas, 2026: both lit and named', { skip, timeout: 120000 }, async () => {
  const s = await render('world-guam-nmi-2026');
  assert.deepEqual(lit(s), ['ia-gu', 'ia-mp']);
  assert.deepEqual(s.features.filter((f) => f.lit).map((f) => f.label).sort(), ['Guam', 'Northern Mariana Islands']);
  assert.ok(!s.warnings.some((w) => /occupied/.test(w)), 'no occupation on this date');
});

test('8c. the Philippines on 3 July 1946, its last day as a U.S. territory: lit, named, no warning', { skip, timeout: 120000 }, async () => {
  const s = await render('world-philippines-1946');
  assert.deepEqual(lit(s), ['ia-ph']);
  assert.deepEqual(s.warnings, []);
  assert.ok(rows(s).includes('U.S. territory'));
  assert.ok(s.features.some((f) => f.layer === 'cliopatria'), 'the states of 1946 around it');
});

test('the Caribbean, 1975: green territories, the Canal Zone gold, the claim given up to Colombia hatched', { skip, timeout: 120000 }, async () => {
  const s = await render('world-caribbean-1975');
  const look = (id) => s.features.find((f) => f.id === id)?.look;
  assert.equal(look('ia-pr').key, 'In');
  assert.equal(look('ia-canal-zone').key, 'E');
  assert.equal(look('ia-given-up-colombia').kind, 'pattern');
  assert.deepEqual(rows(s).slice(0, 3), ['U.S. territory', 'Run by the United States under a treaty', 'Claimed by the United States, and disputed']);
  assert.ok(s.warnings.some((w) => /Quita Sueño Bank \(Q559484\)/.test(w)), 'the banks with no shape are named');
});

test('the Ryukyus and the Bonins, 15 September 1951: gold, dashed, and the slip says why', { skip, timeout: 120000 }, async () => {
  const s = await render('world-ryukyu-1951');
  assert.deepEqual(lit(s), ['ia-bonin', 'ia-ryukyu']);
  assert.ok(s.features.filter((f) => f.lit).every((f) => f.look.key === 'E' && f.look.dashed && !f.date_known_to_the_day_today));
  assert.ok(rows(s).includes('Held: the date known only to the month or year'));
  assert.ok(s.warnings.some((w) => /Ryukyu.*known only to the month/.test(w)));
  assert.ok(s.warnings.some((w) => /Bonin.*known only to the (month|year)/.test(w)));
});

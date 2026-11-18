// The would-be states of the North America page (statehood brief of 2026-11-18, item 8; the deck's Appendix A):
// data/us/wouldbe.topojson (scripts/derive-wouldbe.mjs, from data/us/wouldbe-states.csv) without a browser, each shape
// checked against places it must hold or leave out and the lines its document drew; then its orders rendered through
// scripts/map.mjs (tests/maps/statehood/wb-*.json). The renders are skipped when no browser is found.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { geoArea, geoBounds, geoContains } from 'd3';
import { feature } from 'topojson-client';
import { prepareWouldbe, wouldbeOn, wbFuzzy, namesWouldbe } from '../src/us/wouldbe.js';
import { itemKeys, makeHighlight } from '../src/us/frames.js';
import { parseCSV } from '../src/data/records.js';
import { findBrowser } from '../scripts/browser.mjs';
import { renderOrder } from '../scripts/map.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const topo = read('data/us/wouldbe.topojson');
const layer = prepareWouldbe(topo);
const KM2 = 6371 * 6371;
const piece = (id) => layer.items.find((it) => it.p.id === id);
const on = (d, key) => wouldbeOn(layer, d).filter((it) => it.p.keys.includes(key));
const holds = (it, lon, lat) => geoContains(it.f, [lon, lat]);

// ---------------------------------------------------------------- the layer, no browser
test('the table and the layer agree: every row is a dated, keyed, sourced shape', () => {
  const rows = parseCSV(readFileSync(new URL('../data/us/wouldbe-states.csv', import.meta.url), 'utf8')).slice(1).filter((r) => r.length > 1);
  assert.equal(layer.items.length, rows.length);
  for (const it of layer.items) {
    assert.ok(it.p.keys.length && it.p.keys.every((k) => /^wb:/.test(k)), `${it.p.id}: keys`);
    assert.ok(it.p.s <= it.p.e && it.p.kind && it.p.source.length > 20, `${it.p.id}: dates, kind, source`);
    assert.ok(it.p.km2 > 1000, `${it.p.id}: ${it.p.km2} km²`);
  }
  assert.match(topo._source, /Nothing drawn/);
});

test('Jefferson\'s ten states, 1 March 1784: ten named pieces of the federal territory that do not overlap', () => {
  const ten = on(17840301, 'wb:jefferson_1784');
  assert.deepEqual(ten.map((it) => it.p.label).sort(), ['Assenisipia', 'Cherronesus', 'Illinoia', 'Metropotamia', 'Michigania', 'Pelisipia', 'Polypotamia', 'Saratoga', 'Sylvania', 'Washington']);
  const nb = read('data/us/newberry.topojson');
  const uf = feature(nb, nb.objects.states).features.find((f) => f.properties.id === 'uf_terr' && f.properties.s <= 17840301 && 17840301 <= f.properties.e);
  const sum = ten.reduce((s, it) => s + it.p.km2, 0), whole = geoArea(uf) * KM2;
  assert.ok(Math.abs(sum - whole) / whole < 0.01, `the ten (${Math.round(sum)} km²) are the territory (${Math.round(whole)} km²)`);
  // the report's own lines: Michigania west of Lake Michigan, Cherronesus east; Washington east of the Kanawha meridian
  assert.ok(holds(piece('wb-michigania'), -89.4, 44) && holds(piece('wb-cherronesus'), -84.5, 44));
  assert.ok(holds(piece('wb-washington-1784'), -81.0, 40.5) && holds(piece('wb-saratoga'), -83.0, 40.0) && holds(piece('wb-illinoia'), -89.0, 40.0));
  assert.ok(on(17840423, 'wb:jefferson_1784').length === 0, 'the names end with the Ordinance of 23 April 1784');
});

test('Confederate Arizona: New Mexico Territory south of the 34th parallel, from 1 August 1861 to July 1862', () => {
  const az = piece('wb-confederate-arizona');
  const [[, s], [, n]] = geoBounds(az.f);
  assert.ok(n <= 34.0001 && s < 32, `${s}..${n}`);
  assert.ok(holds(az, -110.97, 32.22) && !holds(az, -106.65, 35.08), 'Tucson in it, Albuquerque not');
  assert.ok(!on(18610731, 'wb:confederate_arizona').length && on(18610801, 'wb:confederate_arizona').length);
  assert.ok(wbFuzzy(az, 18620715) && !wbFuzzy(az, 18611001), 'July 1862 is dashed');
});

test('Lincoln: Texas south and west of the Colorado River', () => {
  const ln = piece('wb-lincoln');
  assert.ok(holds(ln, -106.44, 31.76) && holds(ln, -98.49, 29.42), 'El Paso and San Antonio in it');
  assert.ok(!holds(ln, -96.8, 32.78) && !holds(ln, -95.37, 29.76) && !holds(ln, -101.84, 35.22), 'Dallas, Houston and Amarillo not');
  assert.ok(ln.p.km2 > 280000 && ln.p.km2 < 360000, `${ln.p.km2} km²`);
  assert.match(ln.p.note, /stops short of the land's edge/);
});

test('Jefferson Territory: the box of its convention, 37° to 43° north, 102° to 110° west, until Colorado Territory', () => {
  const jt = piece('wb-jefferson-territory');
  const [[w, s], [e, n]] = geoBounds(jt.f);
  assert.ok(w >= -110.0001 && e <= -101.9999 && s >= 36.9999 && n <= 43.0001, `${w},${s},${e},${n}`);
  assert.ok(holds(jt, -104.99, 39.74), 'Denver in it');
  assert.ok(on(18610227, 'wb:jefferson_territory').length && !on(18610228, 'wb:jefferson_territory').length);
});

test('the county-built ones: Franklin, the Pico Act\'s Colorado, Jefferson of 1941, Greater Idaho by its votes', () => {
  assert.ok(holds(piece('wb-franklin'), -82.47, 36.29) && !holds(piece('wb-franklin'), -86.78, 36.16), 'Jonesborough in Franklin, Nashville not');
  assert.ok(holds(piece('wb-pico-colorado'), -118.24, 34.05) && holds(piece('wb-pico-colorado'), -117.16, 32.72) && !holds(piece('wb-pico-colorado'), -122.42, 37.77), 'Los Angeles and San Diego, not San Francisco');
  assert.ok(holds(piece('wb-jefferson-1941'), -122.63, 41.73) && holds(piece('wb-jefferson-1941'), -124.2, 42.05), 'Yreka and Brookings');
  const gi = (d) => on(d, 'wb:greater_idaho')[0];
  assert.equal(on(20201102, 'wb:greater_idaho').length, 0, 'no county before the first vote');
  assert.ok(holds(gi(20201103), -117.88, 45.32) && !holds(gi(20201103), -117.24, 44.78), 'Union County first, Baker County not yet');
  assert.ok(holds(gi(20230516), -117.28, 45.43) && !holds(gi(20260519), -117.28, 45.43), 'Wallowa from 16 May 2023, repealed 19 May 2026');
  assert.ok(!holds(gi(20240520), -120.83, 44.3) && holds(gi(20240521), -120.83, 44.3), 'Crook from 21 May 2024');
});

test('a highlight names a would-be state by its wb: key; the layer is read only when one is named', () => {
  const hl = makeHighlight('wb:franklin,wb:jefferson_1784');
  assert.ok(hl.has(itemKeys(piece('wb-franklin'))) && hl.has(itemKeys(piece('wb-saratoga'))));
  assert.ok(!hl.has(itemKeys(piece('wb-lincoln'))));
  assert.ok(namesWouldbe('nb:nc_state, wb:franklin') && !namesWouldbe('nb:nc_state'));
});

// ---------------------------------------------------------------- the renders
let browser = null;
try { browser = findBrowser(); } catch { browser = null; }
const skip = browser ? false : 'no Chromium-family browser found';
const order = (name) => JSON.parse(readFileSync(new URL(`./maps/statehood/${name}.json`, import.meta.url), 'utf8'));
const OUT = mkdtempSync(join(tmpdir(), 'parchment-wouldbe-'));
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
const wb = (s) => s.features.filter((f) => f.layer === 'would-be-state');
const rows = (s) => s.legend.rows.map((r) => r.label);

test('Franklin, 1 June 1785: hatched over North Carolina, named, keyed as a proposed state, its caveats on the slip', { skip, timeout: 120000 }, async () => {
  const s = await render('wb-franklin-1785');
  assert.deepEqual(wb(s).map((f) => [f.ids.would_be, f.lit, f.labeled, f.look.kind]), [['wb-franklin', true, true, 'pattern']]);
  assert.ok(rows(s).includes('Proposed state (not recognized)') && rows(s).includes('North Carolina'));
  assert.ok(s.warnings.some((w) => /western limit/.test(w)));
});

test('Jefferson\'s ten states, 1 March 1784: ten pieces lit and named, one key line', { skip, timeout: 120000 }, async () => {
  const s = await render('wb-jefferson-1784');
  assert.equal(wb(s).filter((f) => f.lit && f.labeled).length, 10);
  assert.deepEqual(rows(s).filter((r) => /Planned state/.test(r)), ["Planned state (Jefferson's report, 1784)"]);
});

test('Lincoln, 1 June 1869: dashed (known to the year), and the open line past the river\'s head said', { skip, timeout: 120000 }, async () => {
  const s = await render('wb-lincoln-1869');
  const f = wb(s)[0];
  assert.equal(f.would_be.edge, 'dashed');
  assert.ok(rows(s).includes('Its date known only to the month or year'));
  assert.ok(s.warnings.some((w) => /beyond the river's head/.test(w)));
});

test('the rest draw and key: Confederate Arizona, Jefferson Territory, the Pico Act, Jefferson of 1941, Greater Idaho', { skip, timeout: 300000 }, async () => {
  for (const [name, kind] of [['wb-confederate-arizona-1861', 'Confederate territory'], ['wb-jefferson-territory-1860', 'Proposed territory (not recognized)'], ['wb-pico-1859', 'Proposed territory (not recognized)'], ['wb-jefferson-1941', 'Proposed state (not recognized)'], ['wb-greater-idaho-2026', 'Counties that voted to join Idaho']]) {
    const s = await render(name);
    assert.ok(wb(s).length === 1 && wb(s)[0].lit && wb(s)[0].labeled, `${name}: one would-be state, lit and named`);
    assert.ok(rows(s).includes(kind), `${name}: keyed "${kind}"`);
    assert.deepEqual(s.resolved.highlight.unmatched, [], `${name}: every id lit something`);
  }
});

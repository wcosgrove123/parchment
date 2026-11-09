// Lesson maps on the North America page (2026-11-06 brief): the order form and its address (src/us/frames.js), the
// computed U.S.–Mexico disputes (data/us/usmx-disputes.json), the ten-place limit with rivers, the browser finder
// (scripts/browser.mjs) and the "what's here?" lookups (scripts/lookup.mjs). No browser: the renders are tested in
// tests/maps.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { geoContains } from 'd3';
import { parseSize, sheetFor, resolveFrame, frameProjection, orderToQuery, queryToOrder, makeHighlight, itemKeys, claimLabel, slug } from '../src/us/frames.js';
import { prepareData, aliveOHM, aliveNB } from '../src/us/model.js';
import { prepareUSMX, aliveUSMX, applyOHMCuts } from '../src/us/disputes.js';
import { placeLabels, APART } from '../src/render/placement.js';
import { findBrowser, playwrightBrowsers } from '../scripts/browser.mjs';
import { describe as describeFrame, changes, search } from '../scripts/lookup.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const focuses = read('src/focuses.json');
const powers = read('src/us/powers.json');

test('sizes for slides: 800 to 3840 wide; up to 1920×1080 a sheet unit is a pixel, larger pictures keep the type', () => {
  assert.deepEqual(parseSize('1600x1550'), { width: 1600, height: 1550 });
  assert.equal(parseSize('799x600'), null);
  assert.equal(parseSize('4000x2000'), null);
  assert.equal(parseSize('wide'), null);
  assert.deepEqual([sheetFor({ width: 1600, height: 1550 }).w, sheetFor({ width: 1600, height: 1550 }).h, sheetFor({ width: 1600, height: 1550 }).scale], [1600, 1550, 1]);
  const k4 = sheetFor({ width: 3840, height: 2160 });
  assert.deepEqual([k4.w, k4.h, k4.scale], [1920, 1080, 2]);
  assert.equal(sheetFor({ width: 1600, height: 1550 }, 1.25).w, 1280, 'an order may set its own type scale');
});

test('the North America frames: in the focus tree, under the continent, each with its projection', () => {
  for (const id of ['texas', 'southwest', 'oregon-country', 'east', 'plains', 'border-states']) {
    const f = resolveFrame(id, focuses);
    assert.ok(f, id);
    assert.equal(f.focus.page, 'us.html', `${id} is drawn on the North America page`);
    assert.ok(f.focus.parents.includes('north-america') || f.focus.parents.some((p) => resolveFrame(p, focuses)?.focus.parents.includes('north-america')), `${id} leads back to North America`);
  }
  assert.equal(frameProjection(resolveFrame('texas', focuses)).projection, 'lambertAzimuthalEqualArea', 'a compact frame is azimuthal, centred on itself');
  assert.equal(frameProjection(resolveFrame('border-states', focuses)).projection, 'conicEqualArea', 'a wide band is conic');
  assert.equal(frameProjection(resolveFrame('texas', focuses), 'page').projection, 'albers', "projection=page keeps the page's Albers");
  const raw = resolveFrame('-107,24.5,-92.5,37.5', focuses);
  assert.deepEqual(raw.box, { west: -107, south: 24.5, east: -92.5, north: 37.5 });
  assert.equal(resolveFrame('atlantis', focuses), null);
  assert.equal(resolveFrame('-107,40,-92.5,30', focuses), null, 'south must be below north');
});

test('an order and its address are the same map: every field has a parameter, both ways', () => {
  const order = read('tests/maps/texas-1846.json');
  const q = orderToQuery(order);
  for (const k of ['date', 'tracker', 'frame', 'rivers', 'places', 'routes', 'title', 'size', 'records']) assert.ok(q.has(k), `the address carries ${k}`);
  const back = queryToOrder(q);
  assert.equal(back.date, order.date);
  assert.equal(back.frame, order.frame);
  assert.deepEqual(back.annotate, order.annotate);
  assert.equal(back.title, order.title);
  const y = orderToQuery({ date: '1836', tracker: 'nations' });
  assert.equal(y.get('year'), '1836', 'a bare year is the page\'s year=');
});

test('a highlight names powers, polygons by name, and source ids; every id that lights something counts as found', () => {
  const hl = makeHighlight(['Coahuila y Tejas', 'mexico', 'united-states', 'nowhere']);
  const cyt = { src: 'ohm', p: { rid: 2841297, name: 'Coahuila y Tejas', lvl: 4, wd: 'Q949898' }, cat: 'mexico' };
  assert.equal(hl.has(itemKeys(cyt, { powers })), 'mexico');
  const tx = { src: 'newberry', p: { id: 'tx_republic', v: 1, name: 'Texas Republic', full: 'Texas Republic', power: 'disputed' } };
  const keys = itemKeys(tx, { powers, twins: new Map([['tx_republic', ['Republic of Texas']]]) });
  for (const k of ['texas-republic', 'tx-republic', 'nb-tx-republic', 'republic-of-texas']) assert.ok(keys.has(k), k);
  const us = { src: 'newberry', p: { id: 'la_state', v: 1, name: 'Louisiana', power: 'us' } };
  assert.equal(hl.has(itemKeys(us, { powers })), 'united-states');
  assert.deepEqual(hl.unmatched(), ['nowhere']);
  assert.equal(slug('Joint Mexico-Texas Claim'), 'joint-mexico-texas-claim');
  assert.equal(claimLabel(['Texas', 'Mexico']), 'Claimed by Texas and Mexico');
});

// ---------------------------------------------------------------- the computed U.S.–Mexico disputes
const data = prepareData({ nbTopo: read('data/us/newberry.topojson'), ohmTopo: read('data/us/ohm.topojson'), cesTopo: null, natTopo: null });
data.usmx = prepareUSMX(read('data/us/usmx-disputes.json'));
applyOHMCuts(data, read('data/us/ohm-cuts.json'));
const STRIP = [-98.0, 27.0]; // between the Nueces and the Rio Grande, inland from Baffin Bay
const SANTA_FE = [-105.94, 35.69]; // the upper Rio Grande

test('the Nueces Strip and the upper Rio Grande are disputed from annexation to the Mexican Cession, computed from the records', () => {
  const at = (d, pt) => aliveUSMX(data, d).filter((it) => geoContains(it.f, pt)).map((it) => `${it.p.a}~${it.p.bn}`);
  assert.deepEqual(at(18460425, STRIP), ['tx_state~Tamaulipas'], 'on the day of the Thornton skirmish');
  assert.deepEqual(at(18470101, SANTA_FE), ['tx_state~Nuevo México']);
  assert.deepEqual(at(18451228, STRIP), [], 'not before Texas is a state');
  assert.deepEqual(at(18480202, STRIP), [], 'not from the Mexican Cession');
  const strip = data.usmx.find((it) => it.p.bn === 'Tamaulipas');
  assert.deepEqual(strip.p.parties, ['Texas', 'Mexico']);
  assert.equal(strip.p.ended[0].text, 'Tamaulipas: Mexican Cession (OpenHistoricalMap)');
  assert.match(strip.p.ended[0].record.text, /Treaty of Guadalupe-Hidalgo/);
  const upper = data.usmx.find((it) => it.p.bn === 'Nuevo México');
  assert.ok(upper.p.ended.some((e) => /sold land in present .*New Mexico/.test(e.text)), 'the upper Rio Grande claim also ends with the 1850 line');
});

test('the two eras join without a gap or a second hatch: the joint claim to 27 Dec 1845, the Republic to the 28th, the computed strip from the 29th', () => {
  const joint = (d) => aliveOHM(data, d).some((it) => it.p.rid === 2693046 && geoContains(it.f, STRIP));
  const republic = (d) => aliveNB(data, d).some((it) => it.p.id === 'tx_republic' && geoContains(it.f, STRIP));
  const computed = (d) => aliveUSMX(data, d).some((it) => geoContains(it.f, STRIP));
  for (const d of [18451226, 18451227, 18451228, 18451229, 18451230]) {
    assert.ok(joint(d) || republic(d) || computed(d), `${d}: the strip is hatched`);
    assert.ok(!(joint(d) && computed(d)), `${d}: never the joint claim and the computed piece at once`);
  }
  assert.ok(joint(18451227) && !joint(18451228), "OHM's end_date is the day the claim ceased");
  assert.ok(republic(18451228) && !republic(18451229));
  assert.ok(computed(18451229));
});

test('the 1846 strip ends at the Nueces, and the overlaps the owner set aside are gone (owner, 2026-11-09)', () => {
  const at = (d, pt) => aliveUSMX(data, d).filter((it) => geoContains(it.f, pt)).map((it) => it.p.bn);
  assert.deepEqual(at(18460425, [-99.786, 29.209]), [], "Uvalde, east of the Nueces: OpenHistoricalMap's Coahuila reached it, the strip does not");
  assert.deepEqual(at(18460425, [-99.861, 28.522]), ['Coahuila'], 'Carrizo Springs, between the Nueces and the Rio Grande');
  assert.deepEqual(at(18460425, [-99.507, 27.531]), ['Tamaulipas'], 'Laredo');
  assert.equal(data.usmx.find((it) => it.p.bn === 'Coahuila').p.edge.river, 'Nueces');
  assert.deepEqual(aliveUSMX(data, 18520601), [], 'no strip along Sonora: the sources disagreeing, not a claim');
  assert.deepEqual(aliveUSMX(data, 18540301), [], 'no Gadsden Purchase interval');
  assert.ok(aliveUSMX(data, 18300601).some((it) => it.p.a === 'ar_terr' && it.p.bn === 'Coahuila y Tejas'), 'Miller County stays: a real dispute');
});

test('the 1836–1845 joint claim ends at the Nueces too, so the strip keeps its shape at annexation (owner, 2026-11-09)', () => {
  const joint = (d, pt) => aliveOHM(data, d).some((it) => it.p.rid === 2693046 && geoContains(it.f, pt));
  const strip = (d, pt) => aliveUSMX(data, d).some((it) => geoContains(it.f, pt));
  for (const [name, pt, inside] of [['Uvalde', [-99.786, 29.209], false], ['Carrizo Springs', [-99.861, 28.522], true], ['Laredo', [-99.507, 27.531], true], ['Corpus Christi', [-97.396, 27.8], true]]) {
    assert.equal(joint(18400601, pt), inside, `${name}, 1 June 1840`);
    assert.equal(strip(18460425, pt), inside, `${name}, 25 April 1846: the same as in 1840`);
  }
  const cut = data.ohm.find((it) => it.p.rid === 2693046);
  assert.equal(cut.cut.river, 'Nueces');
  assert.ok(cut.dropArcs.length > 0, "OpenHistoricalMap's old edge past the river is left out of the borders");
});

// ---------------------------------------------------------------- rivers count among the ten places
test('a river name takes one of the ten labelled places; a route name does not', () => {
  const pts = [0, 1].map((i) => ({ id: `p${i}`, kind: 'point', priority: 1, x: 200 + i * 300, y: 200, radius: 6, w: 60, h: 16 }));
  const line = Array.from({ length: 60 }, (_, i) => [100 + i * 10, 600]);
  const along = (id, extra) => ({ id, kind: 'route', priority: 2.7, w: 80, h: 15, candidates: [{ startOffset: 0.5, reverse: false, box: { x: 360, y: 580, w: 80, h: 20 } }], ...extra });
  const r = placeLabels({ labels: [...pts, along('river', { place: true })], frame: { x0: 0, y0: 0, x1: 1600, y1: 1000 }, maxPlaces: 2 });
  assert.equal(r.find((x) => x.id === 'river').dropped, 'ceiling');
  const r2 = placeLabels({ labels: [...pts, along('route', { route: 'x' })], routes: [{ id: 'x', samples: line }], frame: { x0: 0, y0: 0, x1: 1600, y1: 1000 }, maxPlaces: 2 });
  assert.ok(r2.find((x) => x.id === 'route').box, 'a route name is not a place');
});

test('two marks that print as one dot are named on opposite sides on a lesson map: Fort Texas above, Matamoros below', () => {
  const pt = (id, x, y, extra) => ({ id, kind: 'point', priority: 2, x, y, radius: 6, w: 90, h: 16, ...extra });
  // The fort on the north bank, the town 4 px to the south; Taylor's march comes down into the fort from the north.
  const labels = [pt('fort', 801, 500, { priority: 1 }), pt('town', 800, 504.4)];
  const marks = labels.map(({ id, x, y, radius }) => ({ id, x, y, radius }));
  const routes = [{ id: 'march', samples: [[801, 300], [801, 492]] }];
  const frame = { x0: 0, y0: 0, x1: 1600, y1: 1000 };
  assert.deepEqual(placeLabels({ labels, marks, routes, frame }).map((p) => p.pos), ['E', 'W'], 'the fixed order: both names on one line');
  const pos = Object.fromEntries(placeLabels({ labels, marks, routes, frame, apart: APART }).map((p) => [p.id, p.pos]));
  assert.equal(pos.fort, 'NE', 'north of the town: above the dot, clear of the march coming down into it');
  assert.equal(pos.town, 'S', 'south of the fort: below the dot');
  const far = [pt('a', 100, 100), pt('b', 400, 100)];
  const farMarks = far.map(({ id, x, y, radius }) => ({ id, x, y, radius }));
  assert.deepEqual(placeLabels({ labels: far, marks: farMarks, frame, apart: APART }).map((p) => p.pos), ['E', 'E'], 'marks apart keep the fixed order');
});

// ---------------------------------------------------------------- the browser for renders
test('the browser: PARCHMENT_BROWSER first, then Playwright\'s Chromium (newest first), Windows paths last', () => {
  const root = mkdtempSync(join(tmpdir(), 'pw-'));
  try {
    for (const [rev, exe] of [['1234', ['chrome-linux', 'chrome']], ['1300', ['chrome-linux64', 'chrome']]]) {
      mkdirSync(join(root, `chromium-${rev}`, exe[0]), { recursive: true });
      writeFileSync(join(root, `chromium-${rev}`, ...exe), '');
    }
    const env = { PLAYWRIGHT_BROWSERS_PATH: root, PATH: '' };
    const list = playwrightBrowsers(env).filter((p) => p.startsWith(root));
    assert.ok(list[0].includes('chromium-1300') && list[1].includes('chromium-1234'), 'newest revision first');
    assert.equal(findBrowser(env).from, "Playwright's Chromium");
    assert.equal(findBrowser({ ...env, PARCHMENT_BROWSER: process.execPath }).path, process.execPath);
    assert.throws(() => findBrowser({ ...env, PARCHMENT_BROWSER: join(root, 'missing') }), /not a file/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- what's here?
test('describe: the polygons alive in Texas on 1 June 1836, with their dates and sources', () => {
  const r = describeFrame({ date: '1836-06-01', frame: 'texas' });
  const joint = r.polygons.find((p) => p.ids.ohm === 2693046);
  assert.ok(joint, 'the Joint Mexico-Texas Claim');
  assert.equal(joint.start, '1836-03-02');
  assert.match(joint.source.url, /openhistoricalmap\.org\/relation\/2693046/);
  assert.ok(r.polygons.some((p) => p.ids.newberry === 'tx_republic'));
  assert.ok(r.polygons.some((p) => p.name === 'Comancheria' && p.source.cites.some((c) => /Comanche Country/.test(c))), "Comanchería, with its source map");
  assert.ok(r.rivers.some((x) => x.name === 'Nueces'));
});

test('changes: Coahuila y Tejas became Texas and Coahuila on 15 December 1835; Canada is not a Texas change', () => {
  const r = changes({ from: '1821', to: '1848', frame: 'texas' });
  const split = r.changes.find((c) => c.day === '1835-12-15');
  assert.match(split.text, /Coahuila y Tejas became (Texas and Coahuila|Coahuila and Texas)/);
  assert.ok(split.why.some((w) => /split/i.test(w)), "in OpenHistoricalMap's words");
  assert.ok(!r.changes.some((c) => /Canada|Yucat|Dominican/.test(c.text)));
});

test('search finds a river, a polygon and a frame by name', () => {
  assert.ok(search('Nueces').results.some((x) => /river/.test(x.layer)));
  assert.ok(search('Coahuila y Tejas').results.some((x) => x.ids?.ohm === 2841297));
  assert.ok(search('oregon country').results.some((x) => x.ids?.frame === 'oregon-country'));
});

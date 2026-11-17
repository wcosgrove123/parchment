// The Underground Railroad layer (owner's request of 2026-11-17): its table, then the page and an order in a
// headless browser. The geometry of merging and splitting has its own tests (tests/network.test.mjs).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, findBrowser } from '../scripts/browser.mjs';
import { serve, bundle } from '../scripts/serve.mjs';
import { renderOrder } from '../scripts/map.mjs';
import { validateRecords, resolveRecords } from '../src/data/records.js';
import { buildNetwork } from '../src/render/network.js';
import { PLACES, ROUTES, buildRows } from '../scripts/underground-rows.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const gazetteer = JSON.parse(read('data/gazetteer.json'));
const checked = validateRecords(read('data/us/underground-railroad.csv'), vocab);
const routes = checked.records.filter((r) => r.kind === 'arrow');
const towns = checked.records.filter((r) => r.kind === 'point');
const doc = read('docs/UNDERGROUND-RAILROAD.md');

test('the table: every row is valid, and it is what scripts/underground-rows.mjs writes', () => {
  assert.deepEqual(checked.problems, []);
  assert.equal(routes.length, ROUTES.length);
  assert.equal(checked.records.length, buildRows().length);
  for (const r of routes) assert.equal(r.value, 'escape');
  for (const t of towns) assert.ok(t.value === 'station' || t.value === 'refuge');
  assert.equal(towns.filter((t) => t.value === 'refuge').length, 3);
  // a line no source documents place by place is dotted, never solid or dashed
  for (const r of routes.filter((x) => x.id.startsWith('ugrr-south-'))) assert.deepEqual([r.certainty, r.grade], ['sphere', 'uncertain'], r.id);
});

test('every route and town cites a source, is marked a test row, and its source keys are spelled out in the doc', () => {
  for (const r of checked.records) {
    assert.ok(r.source && r.source.length > 8, `${r.id} has a source`);
    assert.match(r.qc_note, /TEST ROW/, `${r.id} is marked a test row`);
    for (const key of r.source.match(/\(([A-Z]+-[A-Z]+)\)/g) ?? []) assert.ok(doc.includes(key.slice(1, -1)), `${key} of ${r.id} is in docs/UNDERGROUND-RAILROAD.md`);
  }
  for (const r of routes) assert.ok(doc.includes(r.id), `${r.id} is listed in docs/UNDERGROUND-RAILROAD.md`);
});

test('no coordinate is typed: every waypoint is in the gazetteer under the name the table gives it', () => {
  const { waiting } = resolveRecords(checked.records, gazetteer);
  assert.deepEqual(waiting, []);
  const first = (s) => s.toLowerCase().replace(/^st\. /, 'saint ').split(/[ (]/)[0];
  for (const [q, [name]] of Object.entries(PLACES)) {
    const g = gazetteer[q];
    assert.ok(g, `${q} (${name}) is in the gazetteer`);
    const a = first(name), b = g.label.toLowerCase().replace(/^st\. /, 'saint ');
    const known = { Q1439902: 'fountain city', Q2689037: 'key biscayne', Q514070: 'andros', Q738353: 'heroica matamoros', Q659400: 'wilmington', Q60: 'new york city', Q61: 'washington, d.c.' }[q];
    assert.ok(known ? b === known : b.startsWith(a), `${q} is ${name} in the table and "${g.label}" on Wikidata`);
  }
  for (const t of towns) assert.deepEqual([t.lon, t.lat], [gazetteer[t.where].lon, gazetteer[t.where].lat], `${t.id} stands at its gazetteer coordinate`);
});

test('trunks: the roads into Philadelphia share one leg on to New York, and the leg is one line', () => {
  const net = buildNetwork(resolveRecords(routes, gazetteer).records);
  const leg = (k) => net.legs.find((l) => l.key === k);
  assert.ok(leg('Q174224>Q1345').records.length >= 4, 'Wilmington to Philadelphia carries Garrett, Tubman, the sea road and Washington');
  assert.equal(leg('Q1345>Q60').records.length, 1);
  assert.ok(net.nodes.get('Q1345').in.size >= 2 && net.nodes.get('Q1345').out.size >= 2, 'Philadelphia is where roads join and part');
  assert.ok(net.legs.length < routes.reduce((n, r) => n + r.waypoints.length - 1, 0), 'shared legs are drawn once');
  // nothing runs both ways along one road, and no sea waypoint carries a town mark
  for (const l of net.legs) assert.ok(!leg(`${l.b}>${l.a}`), `${l.key} is not also drawn backwards`);
  for (const t of towns.filter((x) => x.value === 'station')) assert.equal(PLACES[t.where][1], 'town');
});

let exe = null;
try { exe = findBrowser(); } catch { exe = null; }
const skip = exe ? false : 'no Chromium-family browser found';
const inPage = (fn, ...args) => `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(',')})`;
const ready = () => new Promise((ok, no) => { const t = Date.now(); (function w() { if (window.parchment && window.parchment.ready && document.body.classList.contains('ready')) window.parchment.ready.then(ok, no); else if (Date.now() - t > 90000) no('timeout'); else setTimeout(w, 80); })(); });
const settle = () => new Promise((r) => setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => r(true))), 600));
const shown = () => ({ legs: document.querySelectorAll('.route-network path.route').length, heads: document.querySelectorAll('.route-network path.route[marker-end]').length, towns: document.querySelectorAll('.marks .mark.ink-dot').length, refuges: document.querySelectorAll('.marks .mark.ink-ring').length,
  names: document.querySelectorAll('.record-labels text.mark-label').length, key: [...document.querySelectorAll('.legend text')].some((t) => /Underground Railroad/.test(t.textContent)),
  button: getComputedStyle(document.querySelector('#underground')).display !== 'none', active: document.querySelector('#underground').classList.contains('active'), address: location.search });
let kit = null;
after(async () => { if (kit) { await kit.browser.close(); await kit.server.close(); } });

test('the page: the switch shows on the slavery tracker, draws the routes of the year, and the map fills in to 1865', { skip, timeout: 240000 }, async () => {
  kit = { server: await serve(ROOT, { files: { '/us.js': await bundle(ROOT) } }), browser: await launch({ browser: exe }) };
  const page = await kit.browser.newPage({ width: 1920, height: 1080, scale: 1, origin: kit.server.origin });
  await page.goto(`${kit.server.origin}/us.html?year=1860&tracker=slavery`);
  await page.eval(inPage(ready));
  const off = await page.eval(inPage(shown));
  assert.deepEqual([off.button, off.active, off.legs, off.towns, off.key], [true, false, 0, 0, false], 'off until asked for');
  const at = async (y) => { await page.eval(`window.parchment.setDate('${y}')`); await page.eval(inPage(settle)); return page.eval(inPage(shown)); };
  await page.eval(`document.querySelector('#underground').click()`);
  await page.eval(inPage(settle)); await page.eval(inPage(settle));
  const on = await page.eval(inPage(shown));
  assert.deepEqual([on.active, on.key, /underground=on/.test(on.address)], [true, true, true], JSON.stringify(on));
  assert.equal(on.refuges, 3);
  assert.ok(on.legs > 60 && on.towns > 80, `1860: ${on.legs} legs, ${on.towns} towns`);
  assert.ok(on.heads >= 8 && on.heads < on.legs / 3, 'heads only where a line ends');
  assert.ok(on.names <= 10, 'at most ten towns are named; the rest are dots with their names on hover');
  const y1830 = await at(1830), y1845 = await at(1845), y1865 = await at(1865), y1866 = await at(1866);
  assert.ok(y1830.legs > 0 && y1830.legs < y1845.legs && y1845.legs < on.legs, `the map fills in: ${y1830.legs} < ${y1845.legs} < ${on.legs}`);
  assert.equal(y1865.legs, on.legs, 'by 1865 every route is on the map');
  assert.equal(y1866.legs, 0, 'and none after it');
  await at(1860);
  await page.eval(`document.querySelector('#underground').click()`);
  await page.eval(inPage(settle));
  const again = await page.eval(inPage(shown));
  assert.deepEqual([again.active, again.legs, again.towns, /underground/.test(again.address)], [false, 0, 0, false], 'and off again');
  await page.close();
});

test('an order: underground: true draws the layer and the slip lists each route with its waypoints and source', { skip, timeout: 240000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'parchment-ug-'));
  try {
    const order = JSON.parse(read('tests/maps/underground-railroad-1860.json'));
    const { slip } = await renderOrder(order, { out: join(dir, 'ug'), base: ROOT, browser: exe });
    assert.equal(slip.resolved.underground.routes_shown, ROUTES.length);
    assert.equal(slip.resolved.underground.table, 'data/us/underground-railroad.csv');
    assert.equal(slip.routes.length, ROUTES.length);
    for (const r of slip.routes) {
      assert.ok(r.record.startsWith('ugrr-') && r.source && r.waypoints.length >= 2 && r.places.length === r.waypoints.length, `${r.record} lists its waypoints, their names and its source`);
      assert.match(r.class, /Underground Railroad/);
    }
    const tub = slip.routes.find((r) => r.record === 'ugrr-tubman-delmarva');
    assert.ok(tub.legs.some((l) => l.leg === 'Q174224>Q1345' && l.shared_with.includes('ugrr-wilmington-philadelphia')), 'the slip says which routes share a leg');
    assert.ok(slip.legend.rows.some((l) => /Underground Railroad/.test(l.label)));
    const early = await renderOrder({ ...order, date: '1830' }, { out: join(dir, 'ug30'), base: ROOT, browser: exe });
    const u = early.slip.resolved.underground;
    assert.ok(u.routes_shown < ROUTES.length && u.not_yet_begun.some((r) => r.record === 'ugrr-tubman-delmarva'));
    assert.ok(early.slip.routes.every((r) => Number(r.start.slice(0, 4)) <= 1830));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

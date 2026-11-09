// The lesson-maps brief's test cases (2026-11-06), rendered: Monday's three Texas maps and the framed Diff, each at
// 1600×1550 and at 1920×1080, through the same order forms and command a cloud session uses (tests/maps/*.json,
// scripts/map.mjs), checked against what the brief says each packing slip must hold. Skipped when no browser is
// found (scripts/browser.mjs: PARCHMENT_BROWSER, Playwright's Chromium, Chrome or Edge).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findBrowser } from '../scripts/browser.mjs';
import { renderOrder } from '../scripts/map.mjs';

let browser = null;
try { browser = findBrowser(); } catch { browser = null; }
const skip = browser ? false : 'no Chromium-family browser found';
const order = (name) => JSON.parse(readFileSync(new URL(`./maps/${name}.json`, import.meta.url), 'utf8'));
const OUT = mkdtempSync(join(tmpdir(), 'parchment-maps-'));
test.after(() => rmSync(OUT, { recursive: true, force: true }));

const SIZES = ['1600x1550', '1920x1080'];
async function render(name, size) {
  const r = await renderOrder({ ...order(name), size }, { out: join(OUT, `${name}-${size}`), base: OUT, browser });
  const [w, h] = size.split('x').map(Number);
  const s = r.slip;
  assert.deepEqual(s.render.pixels, { width: w, height: h }, 'the picture is the size ordered');
  assert.deepEqual(s.render.blocked_requests, [], 'no request left this machine');
  assert.deepEqual(s.render.page_errors, []);
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside, 'legend and cartouche inside the frame');
  assert.deepEqual(s.layout.clipped_text, [], 'no name runs past the edge');
  assert.match(s.alt_text, /^Parchment map/);
  assert.match(s.credit, /^Parchment; boundaries: Newberry Library, OpenHistoricalMap/);
  return s;
}
const feature = (s, pred) => s.features.find(pred);

for (const size of SIZES) {
  test(`1. Mexican Texas, 1 June 1830, at ${size}`, { skip, timeout: 120000 }, async () => {
    const s = await render('texas-1830', size);
    const cyt = feature(s, (f) => f.ids.ohm === 2841297);
    assert.ok(cyt, 'Coahuila y Tejas (OHM 2841297)');
    assert.equal(cyt.start, '1824-05-07');
    assert.equal(cyt.end, '1835-12-15');
    assert.ok(cyt.lit && cyt.labeled);
    assert.ok(feature(s, (f) => f.name === 'Tamaulipas' && f.ids.ohm === 2841303));
    const com = feature(s, (f) => f.name === 'Comancheria');
    assert.match(com.source.notes.source_name, /Comanche Country/, 'Comanchería, with its source');
    assert.deepEqual(s.points.map((p) => p.label).sort(), ['Goliad', 'Nacogdoches', 'San Antonio de Béxar', 'San Felipe de Austin']);
    assert.ok(s.points.every((p) => p.labeled && p.source));
    assert.deepEqual(s.resolved.highlight.unmatched, []);
  });

  test(`2. The Texas Revolution, 1 June 1836, at ${size}`, { skip, timeout: 120000 }, async () => {
    const s = await render('texas-1836', size);
    const joint = feature(s, (f) => f.ids.ohm === 2693046);
    assert.deepEqual([joint.start, joint.end, joint.lit], ['1836-03-02', '1845-12-28', true]);
    const rep = feature(s, (f) => f.ids.newberry === 'tx_republic');
    const copy = rep.ids.also_in_ohm.find((c) => c.ohm === 2692792);
    assert.deepEqual([copy.start, copy.end], ['1836-03-02', '1845-12-28'], 'OHM 2692792, the copy of the Republic, with its dates');
    const hatch = s.legend.rows.filter((r) => r.key === 'hatch');
    assert.deepEqual(hatch.map((r) => r.label), ['Claimed by Texas and Mexico'], 'the hatch reads as a dispute between Texas and Mexico');
    assert.deepEqual([rep.look.kind, rep.power_label], ['fill', 'Republic of Texas'], 'the Republic has its own fill, so the joint claim stands apart (owner, 2026-11-09)');
    assert.equal(s.points.length, 6);
  });

  test(`3. The disputed land, 25 April 1846, at ${size}`, { skip, timeout: 120000 }, async () => {
    const s = await render('texas-1846', size);
    const strip = feature(s, (f) => f.layer === 'us-mexico-dispute' && f.ids.ohm === 2841303);
    assert.ok(strip, 'the computed piece between the Nueces and the Rio Grande');
    assert.deepEqual(strip.source.from.map((x) => x.newberry ?? x.ohm), ['tx_state', 2841303], 'named with the two polygons it came from');
    assert.equal(strip.source.cut_at?.river, 'Nueces', 'and ending at the Nueces (owner, 2026-11-09)');
    assert.match(strip.source.ended[0].record.text, /Guadalupe-Hidalgo/);
    assert.ok(s.legend.rows.some((r) => r.label === 'Claimed by Texas and Mexico'));
    const march = s.routes.find((r) => r.record === 'test-tx-taylor-march');
    assert.equal(march.class, 'Army');
    assert.match(march.source, /Corpus Christi/);
    for (const r of ['Nueces', 'Rio Grande']) assert.ok(s.rivers.find((x) => x.name === r)?.labeled, `${r} is named`);
    assert.deepEqual(s.points.map((p) => p.label).sort(), ['Corpus Christi', 'Fort Texas', 'Laredo', 'Matamoros']);
  });

  test(`4. Diff hygiene, 1835 → 1846 framed on Texas, at ${size}`, { skip, timeout: 120000 }, async () => {
    const s = await render('texas-diff-1835-1846', size);
    const listed = [...s.changes.appeared, ...s.changes.vanished, ...s.changes.changed_hands].map((u) => u.name);
    assert.ok(listed.includes('Coahuila y Tejas'));
    for (const far of ['Canada', 'Yucat', 'Dominican', 'Haiti', 'Rupert']) assert.ok(!listed.some((n) => n.includes(far)), `${far} is not a Texas change`);
    assert.equal(s.changes.united_states.grew, true, 'annexation shows as the United States gaining land');
  });
}

test('the whole continent, 1 June 1840: five fills already, so the Republic of Texas keeps the hatch (grammar §5)', { skip, timeout: 120000 }, async () => {
  const s = (await renderOrder({ date: '1840-06-01', tracker: 'nations', size: '1920x1080' }, { out: join(OUT, 'continent-1840'), base: OUT, browser })).slip;
  assert.deepEqual(s.render.page_errors, []);
  const rep = s.features.find((f) => f.ids.newberry === 'tx_republic');
  assert.equal(rep.look.kind, 'pattern', 'no room for a sixth fill');
  assert.ok(!s.legend.rows.some((r) => r.label === 'Republic of Texas'));
  assert.ok(s.legend.rows.some((r) => r.label === 'Claimed by Texas and Mexico'));
});

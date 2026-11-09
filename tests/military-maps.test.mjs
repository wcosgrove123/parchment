// The Military layer, rendered (brief of 2026-11-09, milestone 1): the two orders in tests/maps/military/ through
// scripts/map.mjs, checked against their packing slips; and the layer's promise that nothing else changes: the
// Texas 1846 lesson map with the old records draws its nations legend as before. Skipped without a browser.
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
const order = (p) => JSON.parse(readFileSync(new URL(`./maps/${p}.json`, import.meta.url), 'utf8'));
const OUT = mkdtempSync(join(tmpdir(), 'parchment-military-'));
test.after(() => rmSync(OUT, { recursive: true, force: true }));
const render = (p, over = {}) => renderOrder({ ...order(p), ...over }, { out: join(OUT, p.replace(/\//g, '-')), base: OUT, browser });

test('Texas, 25 April 1846, with the Military layer on: fills by side, the dispute still hatched, Taylor\'s march as before', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/texas-1846-sides');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.resolved.tracker.id, 'military');
  assert.equal(s.resolved.war.id, 'mexican-american-war');
  assert.deepEqual(s.resolved.war.sides.map((x) => [x.id, x.members.length]), [['us', 1], ['mexico', 1]]);
  assert.equal(s.resolved.war.sides[0].fill, '#86a5de');
  const labels = s.legend.rows.map((r) => r.label);
  assert.deepEqual(labels.slice(0, 2), ['United States', 'Mexico']);
  assert.deepEqual(s.legend.rows.slice(0, 2).map((r) => r.fill), ['#86a5de', '#cb8eb6'], 'the two side fills, not the nations tracker\'s green and teal');
  assert.ok(labels.includes('Claimed by Texas and Mexico'), 'the dispute keeps its hatch');
  assert.ok(labels.includes('Mexico: La intervención estadounidense en México'), 'names=both: the other side\'s name in the legend');
  assert.equal(s.resolved.title, 'The Disputed Land, 1846', 'an order\'s title still wins');
  const march = s.routes.find((r) => r.record === 'test-mx-taylor-march');
  assert.ok(march && march.class === 'Army' && march.labeled, 'a routes row with value military keeps working');
  const tx = s.features.find((f) => f.ids.newberry === 'tx_state');
  assert.equal(tx.look.key, 'side-a', 'Texas takes the United States\' side fill');
  const tam = s.features.find((f) => f.name === 'Tamaulipas');
  assert.equal(tam.look.key, 'side-b');
  const it = s.features.find((f) => f.name === 'Indian Territory');
  assert.equal(it.look.key, 'side-a', 'U.S. territory is a member\'s land too');
});

test('the war with Mexico, 13 May 1846, on the mexico-war frame: the war\'s own name in the cartouche; non-members paper', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/mexico-war-1846');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.resolved.title, 'The War with Mexico', 'names=both prints the first side\'s name; the other goes to the legend');
  assert.equal(s.resolved.frame.id, 'mexico-war');
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside);
  const oregon = s.features.find((f) => /Oregon Country/.test(f.name));
  assert.ok(oregon && !oregon.look.key?.startsWith('side-'), 'the Oregon Country, held jointly, is no member: paper');
  const cuba = s.features.find((f) => /Cuba/.test(f.name));
  assert.ok(!cuba || !cuba.look.key?.startsWith('side-'), 'Spain\'s Cuba is paper');
  assert.ok(s.features.filter((f) => f.look.key === 'side-b').length > 10, 'Mexico\'s states take side B');
  const mx = await render('military/mexico-war-1846', { names: 'mexico' });
  assert.equal(mx.slip.resolved.title, 'La intervención estadounidense en México', 'names=mexico prints Mexico\'s name for the war');
  assert.ok(mx.slip.legend.rows.some((r) => r.label === 'Mexico') && !mx.slip.legend.rows.some((r) => /intervención/.test(r.label)));
});

test('off by default: the same Texas order under the nations tracker is the nations map, legend and all', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/texas-1846-sides', { layer: undefined, war: undefined, names: undefined, records: 'tests/maps/texas-records.csv', annotate: { rivers: ['Nueces', 'Rio Grande'], places: ['Q49242', 'Q738353', 'Q2613729', 'Q16868'], routes: ['test-tx-taylor-march'] } });
  assert.equal(s.resolved.tracker.id, 'nations');
  assert.equal(s.resolved.war, null);
  assert.deepEqual(s.legend.rows.slice(0, 2).map((r) => [r.label, r.fill]), [['United States', '#78b58a'], ['Mexico', '#58b4c3']]);
  assert.equal(s.resolved.address.includes('war='), false);
});

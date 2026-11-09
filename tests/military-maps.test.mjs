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

test('the theater, 2 February 1848 (milestone 2): eighteen events by outcome, numbered, with the list and the war strip', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/mexico-war-1848');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.points.length, 18, 'every event of the war has begun by the treaty day');
  assert.ok(s.points.every((p) => p.seq >= 1 && p.seq <= 18 && !p.labeled), 'numbered events carry no name on the map: the list has it');
  assert.equal(s.resolved.war.course.length, 18);
  assert.equal(s.resolved.war.course[0].label, 'Thornton Affair');
  assert.equal(s.resolved.war.course[0].outcome, 'won by Mexico');
  assert.equal(s.resolved.war.course[17].label, 'Treaty of Guadalupe Hidalgo');
  assert.equal(s.resolved.war.strip, 'war');
  const labels = s.legend.rows.map((r) => r.label);
  for (const l of ['Battle won by United States', 'Battle won by Mexico', 'Both sides claimed victory', 'Siege (ring: the besieger)', 'Declaration of war, treaty', 'Place taken (ring: the captor)', 'The course of the war: see the list']) assert.ok(labels.includes(l), l);
  assert.ok(!labels.includes('Battle or siege') && !labels.includes('Treaty'), 'the routes layer\'s point legend does not repeat the events');
  const won = s.legend.rows.find((r) => r.label === 'Battle won by United States');
  assert.equal(won.fill, '#3057a3', 'the diamond\'s fill is the victor\'s line color');
  const palo = s.points.find((p) => p.record === 'test-mx-ev-palo-alto');
  assert.deepEqual([palo.outcome, palo.outcome_text], ['won:us', 'won by United States']);
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside && s.layout.clipped_text.length === 0);
  assert.match(s.alt_text, /Shaded: United States in blue \(side A\) and Mexico in plum \(side B\)/);
  // a date in the middle of the war shows only what has begun, numbered from one
  const mid = await render('military/mexico-war-1848', { date: '1846-09-25', out: undefined });
  assert.equal(mid.slip.points.length, 8);
  assert.equal(mid.slip.resolved.war.course.at(-1).label, 'Monterrey');
  // events off, strip of the stage: the fills alone
  const bare = await render('military/mexico-war-1848', { show: ['territory'], strip: 'stage' });
  assert.equal(bare.slip.points.length, 0);
  assert.equal(bare.slip.resolved.war.course.length, 0);
  assert.equal(bare.slip.resolved.war.strip, 'stage');
});

test('the war in the north, 24 February 1847 (milestone 3): forces as arrows by side, hollow retreats, a landing, routes leaving the frame', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/texas-1847-movements');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.routes.length, 13, 'every movement begun by the date: Taylor\'s approach march too, Scott\'s landing and the Mexican retreats');
  const by = (id) => s.routes.find((r) => r.record === id);
  assert.deepEqual([by('test-mx-mv-taylor-1').color, by('test-mx-mv-taylor-1').class], ['side-a', 'Advance']);
  assert.deepEqual([by('test-mx-mv-arista-ret').color, by('test-mx-mv-arista-ret').hollow, by('test-mx-mv-arista-ret').class], ['side-b', true, 'Retreat or withdrawal']);
  assert.ok(by('test-mx-mv-scott-sea').landing);
  assert.deepEqual(by('test-mx-mv-kearny-2').places, ['Santa Fe', 'Battle of San Pasqual', 'San Diego'], 'waypoint names from the gazetteer, for the tab at the edge');
  assert.ok(!s.routes.some((r) => r.record === 'test-mx-mv-scott-land'), 'Scott\'s march inland begins in April: not yet');
  const labels = s.legend.rows.map((r) => r.label);
  for (const l of ['United States: an armed force', 'Mexico: an armed force', 'Retreat or withdrawal', 'Landing from the sea']) assert.ok(labels.includes(l), l);
  assert.ok(s.resolved.war.course.some((c) => c.label === 'United States declares war' && c.off), 'the declaration in Washington is listed as off this map');
  assert.equal(s.points.length, 10 - 3, 'the three events beyond the frame are not drawn');
  assert.equal(s.resolved.war.movements_on_sheet.length, 13);
  // `from` on this layer: movements since, not a Diff
  const since = await render('military/texas-1847-movements', { from: '1847-01-01' });
  assert.equal(since.slip.resolved.mode, 'snapshot');
  assert.equal(since.slip.resolved.war.movements_since, '1847-01-01');
  assert.deepEqual(since.slip.routes.map((r) => r.record).sort(), ['test-mx-mv-doniphan', 'test-mx-mv-santa-anna-adv', 'test-mx-mv-santa-anna-ret', 'test-mx-mv-scott-sea', 'test-mx-mv-taylor-3']);
});

test('off by default: the same Texas order under the nations tracker is the nations map, legend and all', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/texas-1846-sides', { layer: undefined, war: undefined, names: undefined, records: 'tests/maps/texas-records.csv', annotate: { rivers: ['Nueces', 'Rio Grande'], places: ['Q49242', 'Q738353', 'Q2613729', 'Q16868'], routes: ['test-tx-taylor-march'] } });
  assert.equal(s.resolved.tracker.id, 'nations');
  assert.equal(s.resolved.war, null);
  assert.deepEqual(s.legend.rows.slice(0, 2).map((r) => [r.label, r.fill]), [['United States', '#78b58a'], ['Mexico', '#58b4c3']]);
  assert.equal(s.resolved.address.includes('war='), false);
});

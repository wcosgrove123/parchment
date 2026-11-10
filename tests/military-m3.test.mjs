// Parchment — the Military layer, milestone 3 (brief of 2026-11-09, P3): forces and movements. Pure checks: the
// movement rows, their style (the barb in the side's color; a hollow retreat; a landing's tick), "movements since",
// the strip's force bars and the legend rows. Renders are in tests/military-maps.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRecords, resolveRecords } from '../src/data/records.js';
import { warById, toInt } from '../src/military/wars.js';
import { movementsOf, movementsSince, withSides, forceBars } from '../src/military/events.js';
import { routeStyle, routeLegend, laneOffsets, COLORS } from '../src/render/routes.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const gazetteer = JSON.parse(read('data/gazetteer.json'));
const war = warById(vocab, 'mexican-american-war');
const checked = validateRecords(read('tests/maps/military-fixture.csv'), vocab);
const moves = withSides(movementsOf(resolveRecords(checked.records, gazetteer).records, war.id), war);

test('the fourteen movement rows validate, resolve every waypoint through the gazetteer, and carry a side and a force', () => {
  assert.deepEqual(checked.problems, [], JSON.stringify(checked.problems));
  assert.equal(moves.length, 14);
  assert.ok(moves.every((r) => r.coords && r.coords.length === r.waypoints.length), 'every waypoint has a coordinate (npm run geocode --file tests/maps/military-fixture.csv)');
  assert.ok(moves.every((r) => r.sideColor && r.force && /Bauer/.test(r.source)));
  assert.deepEqual([...new Set(moves.map((r) => r.force))].sort(), ['ampudia', 'arista', 'doniphan', 'kearny', 'santa-anna', 'scott', 'taylor', 'wool']);
  assert.deepEqual([...new Set(moves.map((r) => r.value))].sort(), ['advance', 'landing', 'retreat']);
});

test('movements since: begun by the date and not over before `from` (every movement begun, without a `from`)', () => {
  const start = toInt(war.start);
  assert.equal(movementsSince(moves, 0, 18460425).length, 1, 'Taylor\'s march to the Rio Grande is the only movement begun by 25 April 1846');
  assert.equal(movementsSince(moves, start, 18460425).length, 0, 'since the first shot, none: the march ended on 28 March');
  assert.equal(movementsSince(moves, 0, 18480202).length, 14);
  const since = movementsSince(moves, 18470101, 18470224);
  assert.deepEqual(since.map((r) => r.id).sort(), ['test-mx-mv-doniphan', 'test-mx-mv-santa-anna-adv', 'test-mx-mv-santa-anna-ret', 'test-mx-mv-scott-sea', 'test-mx-mv-taylor-3'], 'from 1 January 1847 to the day after Buena Vista');
  assert.ok(movementsSince(moves, start, 18470224).every((r, i, a) => i === 0 || a[i - 1].startWhen.t <= r.startWhen.t), 'in date order');
});

test('routeStyle: a force\'s arrow is the closed barb in its side\'s color; a retreat is hollow; a landing has its tick', () => {
  const by = (id) => moves.find((r) => r.id === id);
  const adv = routeStyle(by('test-mx-mv-taylor-1'));
  assert.deepEqual([adv.color, adv.markerEnd, adv.hollow, adv.landing, adv.classLabel, adv.dash], ['side-a', 'barb', false, false, 'Advance', 'solid']);
  const ret = routeStyle(by('test-mx-mv-arista-ret'));
  assert.deepEqual([ret.color, ret.markerEnd, ret.hollow, ret.classLabel], ['side-b', 'hollow', true, 'Retreat or withdrawal']);
  assert.ok(ret.width > adv.width, 'a hollow line is drawn wider, with a paper core inside');
  const land = routeStyle(by('test-mx-mv-scott-sea'));
  assert.deepEqual([land.landing, land.markerEnd, land.classLabel], [true, 'barb', 'Landing from the sea']);
  assert.equal(routeStyle({ tracker: 'military', value: 'advance', certainty: 'legal', kind: 'arrow' }).color, 'rust', 'a row with no side keeps rust');
  assert.ok(COLORS.includes('side-a') && COLORS.includes('side-red'), 'the head markers exist per side color');
  // the old routes-tracker row is untouched
  const old = routeStyle({ tracker: 'routes', value: 'military', kind: 'arrow', certainty: 'legal' });
  assert.deepEqual([old.color, old.markerEnd, old.hollow], ['rust', 'barb', undefined]);
});

test('forces sharing a leg take lanes, either way round (Santa Anna out and back between San Luis Potosí and Buena Vista)', () => {
  const lanes = laneOffsets(moves);
  const adv = lanes.get('test-mx-mv-santa-anna-adv'), ret = lanes.get('test-mx-mv-santa-anna-ret');
  assert.ok(adv.some((o) => o !== 0) && ret.some((o) => o !== 0), 'both take an offset on the shared leg');
  assert.ok(lanes.get('test-mx-mv-kearny-1').every((o) => o === 0), 'a leg no one shares stays where it is');
});

test('the strip\'s force bars: one per force, spanning its movements, in its side\'s color', () => {
  const bars = forceBars(moves);
  assert.equal(bars.length, 8);
  const taylor = bars.find((b) => b.force === 'taylor');
  assert.deepEqual([taylor.first, taylor.last, taylor.sideColor], [18460308, 18470222, 'a']);
  const sa = bars.find((b) => b.force === 'santa-anna');
  assert.deepEqual([sa.first, sa.last, sa.sideColor], [18470128, 18470331, 'b']);
  assert.equal(bars[0].force, 'taylor', 'earliest first');
});

test('the legend names each side\'s forces, then the forms seen, then the certainties; an old rust Army row follows', () => {
  const rows = routeLegend(moves);
  assert.deepEqual(rows.map((r) => r.label), ['United States: an armed force', 'Mexico: an armed force', 'Retreat or withdrawal', 'Landing from the sea', 'Documented route']);
  assert.deepEqual(rows.slice(0, 2).map((r) => [r.color, r.heads]), [['side-a', 'barb'], ['side-b', 'barb']]);
  assert.ok(rows[2].hollow && rows[2].heads === 'hollow' && rows[3].landing);
  const mixed = routeLegend([...moves.slice(0, 1), { tracker: 'routes', value: 'military', kind: 'arrow', certainty: 'legal' }]);
  assert.deepEqual(mixed.map((r) => r.label), ['United States: an armed force', 'Documented route', 'Army', 'Documented route']);
});

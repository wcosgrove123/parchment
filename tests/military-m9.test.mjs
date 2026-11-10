// Parchment — the Military layer, milestone 9: battle frames. Pure: Gettysburg's record and rows, the phases, where
// each corps stands in a phase, the lines of battle and attacks of a phase, and what is not an event.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { validateRecords, resolveRecords, EXTRA_COLUMNS } from '../src/data/records.js';
import { warById } from '../src/military/wars.js';
import { battleById, battleRows, battlePositions, battleMoves, battleTerrain, eventsOf, parsePhase, phaseCovers, eventLook, eventLegend, NOT_EVENTS } from '../src/military/events.js';
import { routeStyle } from '../src/render/routes.js';
import { resolveFrame } from '../src/us/frames.js';
import focuses from '../src/focuses.json' with { type: 'json' };

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const gazetteer = JSON.parse(read('data/gazetteer.json'));
const checked = validateRecords(read('tests/maps/military-fixture.csv'), vocab);
const resolved = resolveRecords(checked.records, gazetteer).records;
const hit = battleById(vocab, 'gettysburg');

test('the table carries battle and phase columns; the rows validate; a bad phase or a wrong battle is refused', () => {
  assert.deepEqual(EXTRA_COLUMNS.slice(-2), ['battle', 'phase']);
  assert.deepEqual(checked.problems, [], JSON.stringify(checked.problems));
  const header = read('tests/maps/military-fixture.csv').split(/\r?\n/)[0];
  const row = (over) => { const cells = Object.assign({ id: 'x', course: 'apush', tracker: 'military', kind: 'point', where: 'Q4210323', start: '1863-07-02', end: '1863-07-02', grade: 'circa', value: 'position', certainty: 'approximate', label: 'x', source: 's', war: 'civil-war', side: 'us', force: 'union-xii', battle: 'gettysburg', phase: '3' }, over); return header.split(',').map((c) => cells[c] ?? '').join(','); };
  const probe = (over) => validateRecords(`${header}\n${row(over)}`, vocab).problems.map((p) => p.message).join(' | ');
  assert.equal(probe({}), '');
  assert.match(probe({ phase: '9' }), /outside gettysburg's 7 phases/);
  assert.match(probe({ phase: '5-3' }), /outside|should be a number/);
  assert.match(probe({ phase: 'noon' }), /should be a number/);
  assert.match(probe({ battle: 'waterloo' }), /not a battle of civil-war/);
  assert.match(probe({ battle: '', phase: '2' }), /battle is blank/);
});

test('Gettysburg: a battle of the Civil War record, seven phases in order, its own frame with USGS relief', () => {
  assert.ok(hit, 'the battle is in vocab.json');
  assert.equal(hit.war.id, 'civil-war');
  assert.deepEqual(hit.war.sides.map((s) => `${s.id}:${s.color}`), ['us:a', 'confederacy:gray'], 'Union blue, Confederacy gray (P1 override)');
  assert.deepEqual(hit.battle.phases.map((p) => p.n), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(hit.battle.phases.every((p) => p.when && p.at && p.label));
  const frame = resolveFrame(hit.battle.frame, focuses);
  assert.ok(frame && frame.id === 'gettysburg');
  assert.ok(frame.focus.relief && existsSync(new URL(`../assets/${frame.focus.relief}`, import.meta.url)));
  const relief = JSON.parse(read(`assets/${frame.focus.relief}`));
  assert.match(relief._source, /USGS 3D Elevation Program/);
  assert.ok(existsSync(new URL(`../assets/${relief.image}`, import.meta.url)));
  assert.ok(relief.box.west <= frame.box.west && relief.box.east >= frame.box.east && relief.box.south <= frame.box.south && relief.box.north >= frame.box.north, 'the relief covers the frame');
  assert.equal(hit.war.forces.length, 11);
  assert.ok(hit.war.forces.every((f) => f.strength?.source && f.source && Array.isArray(f.tech)));
});

test('phases: a number or a range; rows without a phase stand through the battle', () => {
  assert.deepEqual(parsePhase('3'), { from: 3, to: 3 });
  assert.deepEqual(parsePhase('4-5'), { from: 4, to: 5 });
  assert.equal(parsePhase(''), null);
  assert.ok(phaseCovers({ phase: '4-5' }, 5) && !phaseCovers({ phase: '4-5' }, 3) && phaseCovers({ phase: '' }, 7));
});

test('the rows of the battle: terrain, positions, lines and attacks; none of them is an event of the war', () => {
  const rows = battleRows(resolved, 'gettysburg');
  assert.ok(rows.length >= 45, `${rows.length} rows`);
  assert.equal(battleTerrain(rows).length, 10, 'ten named places (the grammar labels at most ten)');
  assert.ok(rows.filter((r) => r.value === 'position').length >= 20);
  assert.ok(rows.every((r) => r.battle === 'gettysburg' && r.war === 'civil-war'));
  assert.ok(rows.filter((r) => r.kind === 'point').every((r) => r.lon != null && r.lat != null), 'every point has a coordinate from the gazetteer');
  assert.ok(rows.filter((r) => r.kind !== 'region' && r.kind !== 'point').every((r) => r.coords), 'every line has its waypoints');
  assert.equal(eventsOf(resolved, 'civil-war').length, 0, 'the battle\'s rows are not events: no diamond, no numeral');
  assert.ok(NOT_EVENTS.has('terrain') && NOT_EVENTS.has('position'));
  const terrain = battleTerrain(rows)[0];
  assert.equal(eventLook(terrain, hit.war).form, 'terrain');
  assert.ok(eventLegend([terrain], hit.war, (c) => ({ line: c })).some((r) => r.swatch === 'terrain'));
});

test('where each corps stands by phase: the latest stand in full, earlier ones faded, nothing before its first', () => {
  const rows = battleRows(resolved, 'gettysburg');
  const forces = hit.war.forces.map((f) => ({ ...f, sideColor: hit.war.sides.find((s) => s.id === f.side)?.color }));
  const at = (n) => Object.fromEntries(battlePositions(forces, rows, n, hit.battle.phases).map((p) => [p.force.id, p]));
  const p1 = at(1);
  assert.deepEqual(Object.keys(p1).sort(), ['csa-third', 'union-cav-buford', 'union-i'], 'morning of 1 July: Buford, the I Corps and Heth');
  assert.equal(p1['csa-third'].row.id, 'test-gb-p-hill-1');
  const p4 = at(4);
  assert.equal(Object.keys(p4).length, 11, 'every corps is on the field by the evening of 2 July');
  assert.equal(p4['union-i'].earlier.length, 3, 'the I Corps: McPherson Ridge, the Seminary, Cemetery Hill behind it');
  assert.equal(p4['union-iii'].row.id, 'test-gb-p-iii-4', 'Sickles forward');
  assert.equal(p4['union-iii'].earlier[0].date, '2 Jul, morning', 'earlier stands are named by their phase');
  assert.equal(at(5)['union-iii'].row.id, 'test-gb-p-iii-5', 'and back on the ridge');
  assert.equal(at(7)['csa-first'].row.id, 'test-gb-p-longstreet-4', 'a force with no later row keeps its last stand');
});

test('the marches and lines of a phase; a line of battle is a heavy path with no head', () => {
  const rows = battleRows(resolved, 'gettysburg');
  const ids = (n) => battleMoves(rows, n).map((r) => r.id.replace('test-gb-', '')).sort();
  assert.deepEqual(ids(1), ['mv-heth', 'mv-reynolds']);
  assert.deepEqual(ids(2), ['ln-union-1', 'mv-ewell', 'mv-howard', 'mv-retreat-1']);
  assert.deepEqual(ids(4), ['ln-csa-2', 'ln-union-2', 'mv-early', 'mv-hood-mclaws', 'mv-johnson', 'mv-sykes']);
  assert.deepEqual(ids(5), ['ln-csa-2', 'ln-union-2', 'mv-johnson'], 'Johnson\'s attack spans the evening of 2 July and the morning of 3 July');
  assert.deepEqual(ids(6), ['ln-csa-2', 'ln-union-2', 'mv-pickett']);
  assert.deepEqual(ids(7), ['mv-lee-ret']);
  const front = rows.find((r) => r.id === 'test-gb-ln-union-2');
  const st = routeStyle({ ...front, sideColor: 'a' });
  assert.deepEqual([st.front, st.heads, st.markerEnd, st.tier], [true, 'none', null, 'bold']);
  const charge = routeStyle({ ...rows.find((r) => r.id === 'test-gb-mv-pickett'), sideColor: 'gray' });
  assert.deepEqual([charge.front, charge.markerEnd], [undefined, 'barb']);
});

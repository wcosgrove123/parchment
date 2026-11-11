// Parchment — the Military layer, milestone 5 (brief §3): force marks, where they stand, and the equipment date
// check. Pure: the eight test forces of the war with Mexico against their movement rows; a tank refused in 1846.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { validateRecords, resolveRecords } from '../src/data/records.js';
import { warById } from '../src/military/wars.js';
import { movementsOf, withSides, forcePositions, techFor, forceLegend, svgPath } from '../src/military/events.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const tech = JSON.parse(read('data/tech.json'));
const gazetteer = JSON.parse(read('data/gazetteer.json'));
const war = warById(vocab, 'mexican-american-war');
const checked = validateRecords(read('tests/maps/military-fixture.csv'), vocab);
const moves = withSides(movementsOf(resolveRecords(checked.records, gazetteer).records, war.id), war);
const forces = war.forces.map((f) => ({ ...f, sideColor: war.sides.find((s) => s.id === f.side)?.color }));

test('the tech catalog: every reviewed icon, with its years, file, author, license and a reference to check against', () => {
  assert.equal(Object.keys(tech.items).length, 33, 'the 24 reviewed on 2026-11-09 and the nine marks for kinds of event (Set A, 2026-11-10)');
  for (const [k, it] of Object.entries(tech.items)) {
    assert.ok(it.in_use && it.in_use.from < it.in_use.to, `${k} has years`);
    // (a mark for a kind of event is no piece of equipment: it has no years to source, and says so)
    if (it.class === 'event') assert.match(it.in_use.note, /not a piece of equipment/, `${k}: a mark for every era`);
    else assert.match(it.in_use.note, /to source/, 'the years are starting points until sourced');
    assert.ok(existsSync(new URL(`../${it.icon.file}`, import.meta.url)), `${k}'s icon file is in the repository`);
    assert.ok(it.icon.author && /CC BY 3\.0|CC0/.test(it.icon.license) && it.reference, k);
  }
  assert.equal(tech.items.fort.in_use.from, -9999, 'a fort is one mark in every era');
  const d = svgPath(read(tech.items.musket.icon.file));
  assert.ok(d.d.length > 50 && d.viewBox === '0 0 512 512');
});

test('the war\'s forces: a side, a type and size for the frame, equipment keys the catalog knows, a strength with its source', () => {
  assert.ok(war.forces.length >= 8, 'the eight of the first round, and those added since');
  for (const f of war.forces) {
    assert.ok(war.sides.some((s) => s.id === f.side), f.id);
    assert.ok(['infantry', 'cavalry', 'artillery', 'armor', 'aviation', 'naval'].includes(f.type), f.id);
    assert.ok(['I', 'X', 'XX', 'XXX', 'XXXX', ''].includes(f.echelon ?? ''), f.id);
    for (const k of f.tech) assert.ok(tech.items[k], `${f.id}: ${k} is in the catalog`);
    assert.ok(f.strength?.text && f.strength?.source && f.source, `${f.id} is sourced`);
    if (['taylor', 'wool', 'kearny', 'doniphan', 'scott', 'arista', 'ampudia', 'santa-anna'].includes(f.id)) assert.ok(moves.some((m) => m.force === f.id), `${f.id} has movement rows in the fixture`);
  }
});

test('where a force stands follows its movements: the end of the last one finished, the start of one under way, nowhere before the first', () => {
  const at = (d) => Object.fromEntries(forcePositions(forces, moves, d).map((p) => [p.force.id, p]));
  assert.equal(Object.keys(at(18460301)).length, 0, 'no force has moved before 8 March 1846');
  const march = at(18460315);
  assert.deepEqual([march.taylor.moving, march.taylor.at], [true, moves.find((m) => m.id === 'test-mx-mv-taylor-1').coords[0]], 'on the march: at the last documented place, Corpus Christi');
  const may = at(18460501);
  assert.deepEqual(may.taylor.at, moves.find((m) => m.id === 'test-mx-mv-taylor-1').coords.at(-1), 'arrived: at the Rio Grande');
  assert.equal(may.taylor.earlier.length, 0);
  const treaty = at(18480202);
  assert.equal(Object.keys(treaty).length, 8, 'every force has stood somewhere by the treaty');
  assert.deepEqual(treaty.taylor.at, moves.find((m) => m.id === 'test-mx-mv-taylor-3').coords.at(-1), 'Taylor at Buena Vista');
  assert.equal(treaty.taylor.earlier.length, 2, 'his two earlier stands fade behind him (P4)');
  assert.deepEqual(treaty.scott.at, moves.find((m) => m.id === 'test-mx-mv-scott-land').coords.at(-1), 'Scott in Mexico City');
  assert.equal(treaty['santa-anna'].at[0], moves.find((m) => m.id === 'test-mx-mv-santa-anna-ret').coords.at(-1)[0]);
  const bv = at(18470223);
  assert.deepEqual([bv['santa-anna'].moving, bv.taylor.moving], [false, false], 'both stood at Buena Vista on the second day');
});

test('the equipment date check: the row\'s tech first, else the force\'s; refused outside the catalog\'s years', () => {
  const taylor = forces.find((f) => f.id === 'taylor');
  const ok = techFor(taylor, { tech: '' }, tech, 18460508);
  assert.deepEqual([ok.key, ok.ok], ['musket', true]);
  const tank = techFor(taylor, { tech: 'tank-great-war' }, tech, 18460508);
  assert.deepEqual([tank.key, tank.ok], ['tank-great-war', false]);
  assert.match(tank.why, /1916–1930.*not in 1846.*plain glyph/);
  const later = techFor(taylor, { tech: 'tank-great-war' }, tech, 19180801);
  assert.ok(later.ok, 'the same tank in 1918 draws');
  const unknown = techFor(taylor, { tech: 'laser' }, tech, 18460508);
  assert.match(unknown.why, /not in the tech catalog/);
  const doniphan = forces.find((f) => f.id === 'doniphan');
  assert.equal(techFor(doniphan, { tech: '' }, tech, 18470228).ok, true, 'Doniphan\'s first key (cavalry) draws');
  assert.equal(techFor(doniphan, { tech: 'rifle-breech' }, tech, 18470228).ok, true, '1841 is the catalog\'s starting point for breech-loaders: flagged in vocab.json as a misfit to replace, not refused by the dates');
  assert.deepEqual(techFor({ tech: [] }, {}, tech, 1), { key: null, ok: false, why: null });
});

test('the legend names the frame, each icon in use with its years, and the fading', () => {
  const positions = forcePositions(forces, moves, 18480202);
  const checks = Object.fromEntries(positions.map((p) => [p.force.id, techFor(p.force, p.row, tech, 18480202)]));
  const rows = forceLegend(positions, checks, tech);
  assert.equal(rows[0].swatch, 'force');
  assert.ok(rows.some((r) => r.swatch === 'icon' && r.icon === 'musket' && /musket, 1500–1860/.test(r.label)));
  assert.ok(rows.some((r) => r.swatch === 'icon' && r.icon === 'cavalry'));
  assert.equal(rows.at(-1).swatch, 'fade');
  assert.deepEqual(forceLegend([], {}, tech), []);
});

// Parchment — the Military layer, the owner's review of 2026-11-10: the live war table (data/military.csv), which
// keeps changing as rows are reviewed, and occupied land. These tests check that the live table is sound, not how
// many rows it has; the older tests read a frozen copy (tests/maps/military-fixture.csv).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRecords, resolveRecords } from '../src/data/records.js';
import { warById, membersOf, sideOf, lookFor, militaryLegend, DEPENDENT } from '../src/military/wars.js';
import { movementsOf, eventsOf } from '../src/military/events.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const gazetteer = JSON.parse(read('data/gazetteer.json'));
const checked = validateRecords(read('data/military.csv'), vocab);
const { records: resolved, waiting } = resolveRecords(checked.records, gazetteer);
const war = warById(vocab, 'mexican-american-war');

test('the live war table is sound: every row validates, cites a source, has its coordinates; every force and key event exists', () => {
  assert.deepEqual(checked.problems, [], JSON.stringify(checked.problems.slice(0, 3)));
  assert.deepEqual(waiting, [], 'every waypoint and place is in the gazetteer (npm run geocode -- --file data/military.csv)');
  for (const r of checked.records) assert.ok(r.source && r.source.length > 10, `${r.id} cites its source`);
  for (const w of vocab.wars) {
    const ids = new Set((w.forces ?? []).map((f) => f.id));
    for (const m of movementsOf(resolved, w.id)) { assert.ok(!m.force || ids.has(m.force), `${m.id}: force ${m.force} is one of ${w.id}'s`); assert.ok(m.coords?.length >= 2, `${m.id} has its line`); }
    for (const e of eventsOf(resolved, w.id)) assert.ok(e.lon != null && e.lat != null, `${e.id} has a coordinate`);
  }
  const rowIds = new Set(checked.records.map((r) => r.id));
  for (const id of war.key_events) assert.ok(rowIds.has(id), `key event ${id} is a row`);
  for (const id of war.key_forces) assert.ok(war.forces.some((f) => f.id === id), `key force ${id} is a force`);
});

test('marches follow the road or the river: Kearny by the Gila, Scott by Tampico and Lobos Island, Taylor inland', () => {
  const moves = movementsOf(resolved, war.id);
  const by = (id) => moves.find((m) => m.id === `test-mx-mv-${id}`);
  const names = (id) => by(id).waypoints.map((q) => gazetteer[q].label);
  assert.ok(by('kearny-2').waypoints.length >= 9, 'Kearny to California has stops enough to bend with the Gila');
  for (const n of ['Albuquerque', 'Socorro', 'Gila Bend', 'Yuma', "Warner's Ranch"]) assert.ok(names('kearny-2').includes(n), `Kearny by ${n}`);
  assert.equal(by('kearny-2').certainty, 'approximate', 'the Gila stretch is read from Emory onto today\'s places');
  assert.deepEqual(names('scott-sea').slice(1, 4), ['Tampico', 'Isla de Lobos', 'Antón Lizardo']);
  assert.ok(names('scott-land').length >= 9 && names('scott-land').includes('Xalapa-Enríquez') || names('scott-land').some((n) => /Xalapa|Jalapa/.test(n)));
  assert.ok(by('taylor-victoria') && /Victoria/.test(names('taylor-victoria').at(-1)), 'Taylor inland to Victoria');
  // no march is a single straight leg any more, save the short ones between neighboring places
  const far = moves.filter((m) => m.waypoints.length === 2).map((m) => m.id);
  assert.ok(!far.includes('test-mx-mv-kearny-2') && !far.includes('test-mx-mv-scott-sea') && !far.includes('test-mx-mv-wool'));
});

test('what was missing: California by the navy and the settlers, the Taos revolt, the navy on both coasts', () => {
  const events = eventsOf(resolved, war.id).map((e) => e.id);
  for (const id of ['sonoma', 'monterey-ca', 'los-angeles-revolt', 'san-gabriel', 'cahuenga', 'taos-revolt', 'taos-pueblo', 'tampico', 'tuxpan', 'mazatlan']) assert.ok(events.includes(`test-mx-ev-${id}`), id);
  const forces = war.forces.map((f) => f.id);
  for (const id of ['pacific-squadron', 'home-squadron', 'fremont', 'price']) assert.ok(forces.includes(id), id);
  assert.match(checked.records.find((r) => r.id === 'test-mx-ev-taos-revolt').qc_note, /sensitive/i);
});

test('occupied land: the owner\'s fill under the occupier\'s hatch, from the day of the row to its last', () => {
  const members = membersOf(checked.records, war.id);
  const occupied = members.filter((m) => m.value === 'occupied');
  assert.ok(occupied.length >= 8);
  assert.ok(occupied.every((m) => m.side === 'us' && m.certainty === 'approximate' && m.source));
  assert.ok(!DEPENDENT.has('occupied'), 'occupied land is not drawn at 40 %: it is hatched (P2)');
  const nm = new Set(['mexico', 'nuevo-mexico']);
  const before = sideOf(war, members, nm, 18460817);
  assert.deepEqual([before.side.id, before.role, before.holder], ['mexico', 'belligerent', undefined]);
  const after = sideOf(war, members, nm, 18460818);
  assert.deepEqual([after.side.id, after.role, after.holder.id, after.occupation.id], ['mexico', 'occupied', 'us', 'test-mx-occ-nuevo-mexico']);
  const look = lookFor(after);
  assert.deepEqual([look.fill, look.occ, look.occBy, look.side], ['side-b', 'a', 'us', 'mexico']);
  // Sonora was never occupied as a province: its ports get place-taken marks instead
  assert.equal(sideOf(war, members, new Set(['mexico', 'sonora']), 18471101).role, 'belligerent');
  // after the treaty the troops had not yet left: the hatch stands on paper until the evacuation
  const late = sideOf(war, members, new Set(['mexico', 'veracruz']), 18480501);
  assert.deepEqual([late.side, late.role, late.holder.id], [null, 'occupied', 'us']);
  assert.deepEqual([lookFor(late).fill, lookFor(late).occ], [null, 'a']);
  assert.equal(sideOf(war, members, new Set(['mexico', 'veracruz']), 18480815), null, 'and is gone once they have');
  // a side's own land is never "occupied" by itself
  assert.equal(sideOf(war, members, new Set(['us', 'united-states']), 18470101).role, 'belligerent');
  // the legend
  const rows = militaryLegend(war, members, new Set(['fill:side-a:us', 'fill:side-b:mexico', 'occ:side-a:us']), 18470101, 'both');
  const row = rows.find((r) => r.swatch === 'occupied');
  assert.deepEqual([row.label, row.key, row.occ], ['Occupied by United States, in whole or in part', 'side-b', 'a']);
  assert.ok(!rows.some((r) => /occupied\)/.test(r.label)), 'occupations are not listed as members of the occupier\'s side');
});

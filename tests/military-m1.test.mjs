// Parchment — the Military layer, milestone 1 (brief of 2026-11-09): wars, sides and members. Pure checks, no
// browser: the vocabulary, the record columns, the membership rows, the side lookup, the legend, the order fields
// and the color tokens. The renders are checked in tests/military-maps.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRecords, EXTRA_COLUMNS, COLUMNS } from '../src/data/records.js';
import { warById, warsOn, warTitle, otherNames, membersOf, sideOf, lookFor, militaryLegend, toInt } from '../src/military/wars.js';
import { orderToQuery, queryToOrder, resolveFrame, itemKeys } from '../src/us/frames.js';
import { sideColors } from '../src/military/sides.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const powers = JSON.parse(read('src/us/powers.json'));
const focuses = JSON.parse(read('src/focuses.json'));
const csv = read('data/military.csv');

test('vocab.json: the military tracker and the first war, with sides that name their colors and reasons', () => {
  const t = vocab.trackers.military;
  assert.deepEqual(t.kinds, ['region', 'point', 'arrow', 'path']);
  assert.ok(t.region_values.includes('belligerent') && t.region_values.includes('dependent'));
  assert.ok(t.values.includes('retreat') && t.values.includes('blockade'));
  assert.ok(t.point_values.includes('massacre') && t.point_shapes.massacre === 'steel-circle', 'a massacre draws a provisional mark (a navy ring with a rust dot, 2026-11-09) until the owner and the co-teachers choose one');
  const war = warById(vocab, 'mexican-american-war');
  assert.ok(war && war.names.us && war.names.mexico);
  assert.deepEqual(war.sides.map((s) => s.id), ['us', 'mexico']);
  for (const s of war.sides) { assert.ok(['a', 'b', 'c', 'd', 'gray', 'red'].includes(s.color)); assert.ok(s.why && s.why.length > 10, `${s.id} says why it has its color`); }
  assert.equal(warsOn(vocab, 18460513)[0]?.id, 'mexican-american-war');
  assert.equal(warsOn(vocab, 18450101).length, 1, 'the Republic years are a conflict record of their own (the play run, 2026-11-09)');
  assert.equal(warsOn(vocab, 18460101).length, 0);
  assert.equal(toInt('1848-02-02'), 18480202);
  assert.equal(toInt('1848', true), 18481231);
});

test('the record table reads the nine optional columns when the header has them, and never otherwise', () => {
  assert.deepEqual(EXTRA_COLUMNS, ['war', 'side', 'force', 'outcome', 'strength', 'losses', 'tech', 'battle', 'phase']);
  const checked = validateRecords(csv, vocab);
  assert.deepEqual(checked.problems, [], JSON.stringify(checked.problems));
  const us = checked.records.find((r) => r.id === 'test-mx-member-us');
  assert.deepEqual([us.tracker, us.kind, us.where, us.war, us.side, us.value], ['military', 'region', 'united-states', 'mexican-american-war', 'us', 'belligerent']);
  // the old table, with no extra columns, is read exactly as before
  const old = validateRecords(read('tests/maps/texas-records.csv'), vocab);
  assert.deepEqual(old.problems, []);
  assert.equal(old.records.find((r) => r.id === 'test-tx-taylor-march').war, undefined);
  // what a Military row must say
  const header = [...COLUMNS, ...EXTRA_COLUMNS].join(',');
  const row = (over) => { const r = { id: 'x-row', course: 'apush', tracker: 'military', kind: 'region', where: 'mexico', start: '1846', end: '1848', grade: 'exact', value: 'belligerent', certainty: 'legal', label: 'Mexico', source: 's', war: 'mexican-american-war', side: 'mexico', ...over }; return `${header}\n${[...COLUMNS, ...EXTRA_COLUMNS].map((c) => r[c] ?? '').join(',')}`; };
  assert.deepEqual(validateRecords(row({}), vocab).problems, []);
  assert.match(validateRecords(row({ war: '' }), vocab).problems[0].message, /war is blank/);
  assert.match(validateRecords(row({ war: 'crimean-war' }), vocab).problems[0].message, /not in vocab.json's wars/);
  assert.match(validateRecords(row({ side: 'texas' }), vocab).problems[0].message, /not a side of/);
  assert.match(validateRecords(row({ side: '' }), vocab).problems[0].message, /side is blank/);
  assert.match(validateRecords(row({ value: 'advance' }), vocab).problems[0].message, /not a military role/);
});

test('a polygon finds its side by its keys on the date, and takes the side\'s fill', () => {
  const war = warById(vocab, 'mexican-american-war');
  const members = membersOf(validateRecords(csv, vocab).records, war.id);
  assert.equal(members.length, 2);
  const usKeys = itemKeys({ src: 'newberry', p: { id: 'tx_state', name: 'Texas', power: 'us' } }, { power: 'us', powers });
  const mxKeys = itemKeys({ src: 'ohm', p: { rid: 1, name: 'Tamaulipas' } }, { power: 'mexico', powers });
  const hit = sideOf(war, members, usKeys, 18460425);
  assert.deepEqual([hit.side.id, hit.role], ['us', 'belligerent']);
  assert.deepEqual(lookFor(hit), { fill: 'side-a', label: 'United States', cat: 'us', side: 'us', role: 'belligerent' });
  assert.equal(sideOf(war, members, mxKeys, 18470101).side.id, 'mexico');
  assert.equal(sideOf(war, members, usKeys, 18460101), null, 'before the war: no side');
  assert.equal(sideOf(war, members, usKeys, 18490101), null, 'after it: none');
  assert.equal(sideOf(war, members, itemKeys({ src: 'ohm', p: { rid: 2, name: 'Oregon Country' } }, { power: 'disputed', powers }), 18460513), null, 'a non-member is paper');
  assert.equal(lookFor({ side: war.sides[1], role: 'dependent' }).fill, 'side-b-dep', 'a dependent takes the fill at 40 %');
});

test('the legend lists each side on the sheet, members when several, and the other side\'s name for the war', () => {
  const war = warById(vocab, 'mexican-american-war');
  const members = membersOf(validateRecords(csv, vocab).records, war.id);
  const present = new Set(['fill:side-a:us', 'fill:side-b:mexico', 'pat:hatch']);
  const rows = militaryLegend(war, members, present, 18460513, 'both');
  assert.deepEqual(rows.map((r) => r.label), ['United States', 'Mexico', 'Mexico: La intervención estadounidense en México']);
  assert.deepEqual(rows.slice(0, 2).map((r) => r.key), ['side-a', 'side-b']);
  assert.deepEqual(militaryLegend(war, members, new Set(['fill:side-a:us']), 18460513, 'us').map((r) => r.label), ['United States']);
  assert.equal(warTitle(war, 'both'), 'The War with Mexico', 'both: the first side\'s name in the cartouche');
  assert.equal(warTitle(war, 'mexico'), 'La intervención estadounidense en México');
  assert.deepEqual(otherNames(war, 'mexico').map((o) => o.side), ['us']);
  assert.deepEqual(militaryLegend(null, [], new Set(), 1).map((r) => r.label), ['No war named for this date']);
});

test('an order with layer: military carries its war and names into the address and back', () => {
  const order = { page: 'us', layer: 'military', war: 'mexican-american-war', names: 'both', date: '1846-05-13', frame: 'mexico-war', size: '1920x1080', records: 'data/military.csv' };
  const q = orderToQuery(order);
  assert.equal(q.get('tracker'), 'military');
  assert.equal(q.get('war'), 'mexican-american-war');
  assert.equal(q.get('names'), 'both');
  const back = queryToOrder(q);
  assert.deepEqual(back, { page: 'us', date: '1846-05-13', layer: 'military', war: 'mexican-american-war', names: 'both', size: '1920x1080', records: 'data/military.csv', frame: 'mexico-war' });
  assert.equal(orderToQuery({ page: 'us', date: '1846', tracker: 'nations' }).has('war'), false, 'an ordinary order is unchanged');
  for (const [id, box] of [['mexico-war', { west: -125, south: 15, east: -88, north: 43 }], ['mexico-city', { west: -99.6, south: 18.9, east: -98.6, north: 19.8 }]]) {
    const f = resolveFrame(id, focuses);
    assert.ok(f && f.focus.page === 'us.html', id);
    assert.deepEqual(f.box, box);
  }
});

test('the side tokens in src/tokens.css are the colors src/military/sides.js derives', () => {
  const css = read('src/tokens.css');
  for (const k of ['a', 'b', 'c', 'd', 'gray', 'red']) {
    const line = new RegExp(`--side-${k}-line: (#[0-9a-f]{6});`).exec(css)?.[1];
    const fill = new RegExp(`--side-${k}-fill: (#[0-9a-f]{6});`).exec(css)?.[1];
    const s = sideColors(k);
    assert.equal(line, s.line, `${k} line`);
    assert.equal(fill, s.fill, `${k} fill`);
  }
  const us = read('src/us/us.css');
  for (const k of ['a', 'b', 'c', 'd']) assert.match(us, new RegExp(`\\.na-fill\\.k-side-${k} path \\{ fill: var\\(--side-${k}-fill\\); \\}`));
});

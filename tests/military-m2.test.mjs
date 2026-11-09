// Parchment — the Military layer, milestone 2 (brief of 2026-11-09): events by outcome (P5), the sequence and the
// course-of-the-war list (P8), the order's show/sequence/strip fields. Pure checks; renders are in military-maps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRecords } from '../src/data/records.js';
import { warById } from '../src/military/wars.js';
import { eventsOf, eventsUpTo, sequenceFor, parseOutcome, outcomeProblem, eventLook, courseList, eventDate, eventLegend, outcomeText } from '../src/military/events.js';
import { orderToQuery, queryToOrder } from '../src/us/frames.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const war = warById(vocab, 'mexican-american-war');
const checked = validateRecords(read('tests/maps/military-records.csv'), vocab);
const events = eventsOf(checked.records, war.id);
const colorOf = (k) => ({ line: `line-${k}` });

test('the war\'s event rows validate, carry their outcomes, and are read in date order up to a date', () => {
  assert.deepEqual(checked.problems, [], JSON.stringify(checked.problems));
  assert.equal(events.length, 18);
  assert.ok(events.every((r) => r.lon != null && r.lat != null && r.source && /Bauer/.test(r.source)), 'every event has a coordinate and cites its source');
  const upTo = eventsUpTo(events, 18460513);
  assert.deepEqual(upTo.map((r) => r.id), ['test-mx-ev-thornton', 'test-mx-ev-fort-texas', 'test-mx-ev-palo-alto', 'test-mx-ev-resaca', 'test-mx-ev-us-declares'], 'the siege (from 3 May) comes before Palo Alto (8 May)');
  assert.equal(eventsUpTo(events, 18460424).length, 0);
  assert.equal(eventsUpTo(events, 18480202).length, 18);
});

test('outcomes: won:<side>, inconclusive, claimed:<a>;<b>; anything else, or a side the war lacks, is a row problem', () => {
  assert.deepEqual(parseOutcome('won:us'), { kind: 'won', sides: ['us'] });
  assert.deepEqual(parseOutcome('claimed:us;mexico'), { kind: 'claimed', sides: ['us', 'mexico'] });
  assert.equal(parseOutcome('inconclusive').kind, 'inconclusive');
  assert.equal(parseOutcome(''), null);
  assert.equal(outcomeProblem('won:us', war), null);
  assert.match(outcomeProblem('won:texas', war), /not a side of mexican-american-war/);
  assert.match(outcomeProblem('victory', war), /should be won:<side>, inconclusive, or claimed/);
  assert.match(outcomeProblem('claimed:us;us', war), /two different sides/);
  const header = read('tests/maps/military-records.csv').split('\n')[0];
  const row = read('tests/maps/military-records.csv').split('\n').find((l) => l.startsWith('test-mx-ev-palo-alto'));
  const bad = validateRecords(`${header}\n${row.replace('won:us', 'won:texas')}`, vocab);
  assert.equal(bad.problems.length, 1);
  assert.match(bad.problems[0].message, /not a side/);
});

test('each event\'s look follows P5 and P6: the victor fills the diamond, both claims split it, sieges and captures get rings', () => {
  const by = (id) => events.find((r) => r.id === id);
  const palo = eventLook(by('test-mx-ev-palo-alto'), war);
  assert.deepEqual([palo.form, palo.winner.id, palo.ring], ['diamond', 'us', null]);
  const thornton = eventLook(by('test-mx-ev-thornton'), war);
  assert.equal(thornton.winner.id, 'mexico');
  const bv = eventLook(by('test-mx-ev-buena-vista'), war);
  assert.deepEqual(bv.claimed.map((s) => s.id), ['us', 'mexico']);
  const siege = eventLook(by('test-mx-ev-fort-texas'), war);
  assert.deepEqual([siege.form, siege.winner.id, siege.ring.id], ['diamond', 'us', 'mexico'], 'the ring is the besieger\'s, the fill the victor\'s');
  const sf = eventLook(by('test-mx-ev-santa-fe'), war);
  assert.deepEqual([sf.form, sf.ring.id], ['capital', 'us']);
  assert.equal(eventLook(by('test-mx-ev-treaty'), war).form, 'triangle');
  assert.equal(outcomeText(by('test-mx-ev-buena-vista'), war), 'both sides claimed victory');
  assert.equal(outcomeText(by('test-mx-ev-santa-fe'), war), 'taken by United States');
  assert.equal(eventDate(by('test-mx-ev-monterrey')), '21–24 Sep 1846');
  assert.equal(eventDate(by('test-mx-ev-veracruz')), '9–29 Mar 1847');
  assert.equal(eventDate(by('test-mx-ev-palo-alto')), '8 May 1846');
});

test('the sequence numbers events in date order, or as the order lists them, or not at all; the list follows it', () => {
  const all = sequenceFor(eventsUpTo(events, 18480202), true);
  assert.deepEqual(all.slice(0, 3).map((r) => r.seq), [1, 2, 3]);
  assert.equal(all.at(-1).seq, 18);
  const ten = sequenceFor(eventsUpTo(events, 18480202), ['test-mx-ev-thornton', 'test-mx-ev-palo-alto', 'test-mx-ev-monterrey', 'test-mx-ev-treaty']);
  assert.deepEqual(ten.filter((r) => r.seq != null).map((r) => [r.id, r.seq]), [['test-mx-ev-thornton', 1], ['test-mx-ev-palo-alto', 2], ['test-mx-ev-monterrey', 3], ['test-mx-ev-treaty', 4]]);
  assert.ok(sequenceFor(events, false).every((r) => r.seq == null));
  const list = courseList(ten, war);
  assert.deepEqual(list.map((c) => `${c.n} ${c.date} ${c.label} · ${c.outcome}`), ['1 25 Apr 1846 Thornton Affair · won by Mexico', '2 8 May 1846 Palo Alto · won by United States', '3 21–24 Sep 1846 Monterrey · won by United States', '4 2 Feb 1848 Treaty of Guadalupe Hidalgo · treaty']);
});

test('the legend rows name only what is on the sheet, in the grammar\'s shapes', () => {
  const rows = eventLegend(sequenceFor(eventsUpTo(events, 18480202), true), war, colorOf);
  assert.deepEqual(rows.map((r) => r.label), ['Battle won by Mexico', 'Battle won by United States', 'Both sides claimed victory', 'Siege (ring: the besieger)', 'Declaration of war, treaty', 'Place taken (ring: the captor)', 'The course of the war: see the list']);
  assert.ok(rows.every((r) => r.swatch === 'numeral' || r.shape), 'every row is a point shape of §5 (or the numeral)');
  assert.deepEqual(rows[0], { swatch: 'shape', shape: 'rust-diamond', fill: 'line-b', label: 'Battle won by Mexico', role: 'event' });
  assert.equal(rows[2].half, 'line-b');
  const early = eventLegend(sequenceFor(eventsUpTo(events, 18460425), false), war, colorOf);
  assert.deepEqual(early.map((r) => r.label), ['Battle won by Mexico']);
});

test('show, sequence and strip travel with the order and the address', () => {
  const q = orderToQuery({ page: 'us', layer: 'military', war: 'w', date: '1848-02-02', show: ['territory', 'events'], sequence: ['a', 'b'], strip: 'stage' });
  assert.equal(q.get('show'), 'territory,events');
  assert.equal(q.get('sequence'), 'a,b');
  assert.equal(q.get('strip'), 'stage');
  const back = queryToOrder(q);
  assert.deepEqual([back.show, back.sequence, back.strip], [['territory', 'events'], ['a', 'b'], 'stage']);
  assert.equal(queryToOrder(orderToQuery({ page: 'us', layer: 'military', date: '1848', sequence: false })).sequence, false);
  assert.equal(queryToOrder(orderToQuery({ page: 'us', layer: 'military', date: '1848', sequence: true })).sequence, true);
});

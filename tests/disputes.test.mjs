// North America stage: land two of Newberry's U.S. polygons claimed at once (scripts/derive-us-disputes.mjs →
// data/us/nb-disputes.json), hatched as a dispute. The Toledo Strip first: the sliver in northwest Ohio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoArea, geoContains } from 'd3';
import { prepareDisputes, aliveDisputes } from '../src/us/disputes.js';

const fc = JSON.parse(readFileSync(new URL('../data/us/nb-disputes.json', import.meta.url), 'utf8'));
const data = { nbx: prepareDisputes(fc) };
const pairs = [...new Set(fc.features.map((f) => `${f.properties.a}|${f.properties.b}`))];
const toledo = [-83.6, 41.705]; // between the Fulton line and the Harris line, west of Maumee Bay

test('the disputes Newberry records: seven, as eleven pairs of claimants', () => {
  for (const k of ['ct_state|nw_terr', 'in_terr|oh_state', 'mi_terr|oh_state', 'al_terr|ms_state', 'al_state|ms_state', 'ia_terr|mo_state', 'ia_state|mo_state', 'it_indianterr|tx_state', 'ok_terr|tx_state', 'tx_state|ut_terr', 'mi_state|wi_state']) {
    assert.ok(pairs.includes(k), `missing ${k}`);
  }
  assert.equal(pairs.length, 11);
});

test('every piece is a real area the right way round (d3 reads it as small, not as the rest of the globe)', () => {
  for (const f of fc.features) {
    const km2 = geoArea(f) * 6371 * 6371;
    assert.ok(km2 >= 50 && km2 < 1e6, `${f.properties.a}|${f.properties.b}: ${km2} km²`);
  }
});

test('the Toledo Strip is hatched from 1803 until Michigan statehood (26 January 1837), not after', () => {
  const at = (d) => aliveDisputes(data, d).filter((it) => geoContains(it.f, toledo)).map((it) => `${it.p.a}|${it.p.b}`);
  assert.deepEqual(at(18041231), ['in_terr|oh_state']);
  assert.deepEqual(at(18301231), ['mi_terr|oh_state']);
  assert.deepEqual(at(18370125), ['mi_terr|oh_state']);
  assert.deepEqual(at(18370126), []);
  const p = aliveDisputes(data, 18301231).find((it) => it.p.a === 'mi_terr').p;
  assert.match(p.ended.text, /dispute with Ohio/);
});

test('each dispute says, in Newberry\'s words, what happened the day after', () => {
  for (const f of fc.features) assert.ok(f.properties.ended?.text, `${f.properties.a}|${f.properties.b} has no record of its end`);
  const greer = fc.features.find((f) => f.properties.a === 'ok_terr').properties.ended.text;
  assert.match(greer, /Supreme Court/);
});

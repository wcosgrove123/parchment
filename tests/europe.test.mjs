// The Europe stage (owner, 2026-11-09): its frame and projection, its own snapshots, and which states it lights.
// Nothing here may change another stage: the Afro-Eurasia and world maps light what they lit before.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { feature } from 'topojson-client';
import { stageYears } from '../src/data/calendar.js';
import { makeHighlighter } from '../src/data/highlights.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const europe = read('src/stages/europe.json');
const calendar = read('data/calendar.json');
const extent = read('src/trackers/extent.json');
const lit = (stage, names, year, focus = []) => {
  const match = makeHighlighter(extent.highlights, { stage, focus: new Set(focus) });
  return names.filter((n) => match(n, year));
};

test('the Europe stage: equal-area, centered on 52°N 10°E, framed on the europe focus, with its own relief', () => {
  assert.equal(europe.projection, 'lambertAzimuthalEqualArea');
  assert.deepEqual(europe.rotate, [-10, -52]);
  assert.deepEqual(europe.extent, read('src/focuses.json').focuses.find((f) => f.id === 'europe').extent);
  assert.ok(existsSync(new URL('../assets/relief/europe.png', import.meta.url)), 'assets/relief/europe.png (node scripts/relief.mjs europe)');
});

test('1715 and 1650 are Europe snapshots; neither reaches the Afro-Eurasia stage, and 1715 no other stage', () => {
  const eu = stageYears(calendar, europe);
  for (const y of [1650, 1700, 1715, 1750]) assert.ok(eu.includes(y), `Europe has ${y}`);
  for (const id of ['afro-eurasia', 'afro-eurasia-lambert', 'world', 'world-pacific']) assert.ok(!stageYears(calendar, { id }).includes(1715), `${id} has no 1715`);
  assert.ok(!stageYears(calendar, { id: 'afro-eurasia' }).includes(1650));
  assert.ok(existsSync(new URL('../data/base/derived/world_1715.topojson', import.meta.url)));
});

test('historical-basemaps 1715 has every state the Europe stage lights, Brandenburg and the Habsburg lands apart from the Holy Roman Empire', () => {
  const t = read('data/base/derived/world_1715.topojson');
  const names = new Set(feature(t, t.objects.polities).features.map((f) => f.properties.name));
  for (const n of ['France', 'Spain', 'Austrian Empire', 'Prussia', 'Brandenburg', 'Sweden', 'United Kingdom', 'Dutch Republic']) assert.ok(names.has(n), n);
});

test('the absolutist monarchies light by default on the Europe stage only; the contrast states only when an order names them', () => {
  const names = ['France', 'Spain', 'Austrian Empire', 'Prussia', 'Brandenburg', 'Sweden', 'United Kingdom', 'Dutch Republic', 'Ottoman Empire'];
  assert.deepEqual(lit('europe', names, 1715), ['France', 'Spain', 'Austrian Empire', 'Prussia', 'Brandenburg', 'Sweden', 'Ottoman Empire']);
  assert.deepEqual(lit('afro-eurasia', names, 1715), ['Ottoman Empire'], 'the Afro-Eurasia map lights what it lit before');
  assert.deepEqual(lit('world', names, 1715), ['Ottoman Empire']);
  assert.deepEqual(lit('europe', names, 1715, ['britain', 'dutch-republic']), ['United Kingdom', 'Dutch Republic'], '?focus= lights exactly what it names');
  assert.deepEqual(lit('afro-eurasia', names, 1715, ['france']), ['France'], 'and works on any stage');
});

test('the labels say what the state was called then, whatever the base map calls it', () => {
  const label = (stage, name, year, focus = []) => makeHighlighter(extent.highlights, { stage, focus: new Set(focus) })(name, year)?.label;
  assert.equal(label('europe', 'Austrian Empire', 1715), 'Habsburg Monarchy', "historical-basemaps' 'Austrian Empire' is a title from 1804");
  assert.equal(label('europe', 'United Kingdom', 1715, ['britain']), 'Great Britain', "'United Kingdom' is a name from 1801");
  assert.equal(label('europe', 'England and Ireland', 1700, ['england']), 'England');
  assert.equal(label('europe', 'Brandenburg', 1715), 'Prussia');
});

test('each state lights only within its own dates', () => {
  assert.deepEqual(lit('europe', ['Prussia'], 1600), [], 'Prussia from 1618 (Brandenburg inherits the duchy)');
  assert.deepEqual(lit('europe', ['Spain'], 1500), [], 'Spain from 1516');
  assert.deepEqual(lit('europe', ['Austrian Empire'], 1500), [], 'the Habsburg Monarchy from 1526');
  assert.deepEqual(lit('europe', ['United Kingdom'], 1700, ['britain']), [], 'Great Britain from 1707');
});

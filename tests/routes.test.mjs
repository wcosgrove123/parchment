// Parchment — route style and record tests (node --test)
// Dash follows certainty, never type; the arrowhead follows the class; the loader takes and refuses route rows.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeStyle, dashArray, catmullRom, trimToZones, trimEnds, routeLegend, WIDTHS, CLASSES } from '../src/render/routes.js';
import { validateRecords, resolveRecords, routeIds } from '../src/data/records.js';

const vocab = JSON.parse(readFileSync(new URL('../data/vocab.json', import.meta.url), 'utf8'));
const row = (over) => ({ id: 'r', kind: 'arrow', value: 'voyage', certainty: 'legal', ...over });

test('certainty → dash: documented solid, approximate dashed, conjectured dotted; the same for every class', () => {
  for (const value of Object.keys(CLASSES)) {
    assert.equal(routeStyle(row({ value, certainty: 'legal' })).dash, 'solid');
    assert.equal(routeStyle(row({ value, certainty: 'approximate' })).dash, 'dashed');
    assert.equal(routeStyle(row({ value, certainty: 'sphere' })).dash, 'dotted');
  }
  assert.equal(dashArray('solid', 3), null);
  assert.equal(dashArray('dashed', 3), '9.0 6.0');
  assert.match(dashArray('dotted', 3), /^0\.1 /);
});

test('arrowhead by class: trade both ends, voyage one end, army a barb, migration a chevron, carrier none; a path has none', () => {
  const heads = (value, kind = 'arrow') => { const s = routeStyle(row({ value, kind })); return [s.markerStart, s.markerEnd]; };
  assert.deepEqual(heads('sea-trade'), ['arrow', 'arrow']);
  assert.deepEqual(heads('land-trade'), ['arrow', 'arrow']);
  assert.deepEqual(heads('voyage'), [null, 'arrow']);
  assert.deepEqual(heads('military'), [null, 'barb']);
  assert.deepEqual(heads('migration'), [null, 'chevron']);
  assert.deepEqual(heads('carrier'), [null, null]);
  for (const value of Object.keys(CLASSES)) assert.deepEqual(heads(value, 'path'), [null, null]);
});

test('colour says what moved; width is one of three tiers', () => {
  assert.equal(routeStyle(row({ value: 'sea-trade' })).color, 'steel');
  assert.equal(routeStyle(row({ value: 'voyage' })).color, 'steel');
  assert.equal(routeStyle(row({ value: 'land-trade' })).color, 'land');
  assert.equal(routeStyle(row({ value: 'military' })).color, 'rust');
  assert.equal(routeStyle(row({ value: 'migration' })).color, 'rust');
  assert.deepEqual(Object.values(WIDTHS), [2, 3, 4.5]);
  for (const value of Object.keys(CLASSES)) assert.ok(Object.values(WIDTHS).includes(routeStyle(row({ value })).width));
});

test('the spline passes through every waypoint, is trimmed at reserved zones and kept back from marks', () => {
  const pts = [[100, 100], [200, 150], [300, 100], [400, 200]];
  const s = catmullRom(pts);
  for (const p of pts) assert.ok(s.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6), `passes through ${p}`);
  assert.deepEqual(s[0], pts[0]);
  assert.deepEqual(s[s.length - 1], pts[pts.length - 1]);
  const cut = trimToZones(s, [{ x: 350, y: 150, w: 100, h: 100 }]);
  const end = cut[cut.length - 1];
  const inZone = end[0] >= 350 && end[0] <= 450 && end[1] >= 150 && end[1] <= 250;
  assert.ok(cut.length < s.length && !inZone, 'the end inside the zone is dropped');
  const kept = trimEnds(s, 0, 10);
  const last = kept[kept.length - 1];
  assert.ok(Math.hypot(last[0] - 400, last[1] - 200) > 9.9, 'the end stops short of the mark');
});

test('the legend names only the classes and certainties on the map', () => {
  const rows = [row({ value: 'voyage', certainty: 'approximate' }), row({ value: 'military', certainty: 'legal', kind: 'path' })];
  const legend = routeLegend(rows);
  assert.deepEqual(legend.map((e) => e.label), ['Voyage', 'Army', 'Documented route', 'Approximate route']);
  assert.equal(legend[1].heads, 'none', 'a path has no head in the legend either');
});

test('the loader takes a route row, refuses a bad one, and reads coordinates from the gazetteer', () => {
  const header = 'id,course,unit,topic,kc,theme,tracker,kind,where,lon,lat,start,end,grade,value,certainty,label,source,qc_status,qc_by,qc_note';
  const csv = [header,
    'ok-route,apworld,3,3.1,,GOV,routes,arrow,Q16666>Q36081>Q61089,,,1405,1433,exact,voyage,approximate,Zheng He,Dreyer 2007,,,',
    'one-id,apworld,3,3.1,,GOV,routes,path,Q16666,,,1405,1433,exact,voyage,approximate,bad,Dreyer 2007,,,',
    'not-a-class,apworld,3,3.1,,GOV,routes,arrow,Q16666>Q36081,,,1405,1433,exact,battle,approximate,bad,Dreyer 2007,,,',
    'port,apworld,3,3.1,,GOV,routes,point,Q16666,,,1405,1433,exact,port,legal,Nanjing,Dreyer 2007,,,',
  ].join('\n');
  const v = validateRecords(csv, vocab);
  assert.deepEqual(v.records.map((r) => r.id), ['ok-route', 'port']);
  assert.deepEqual(v.records[0].waypoints, ['Q16666', 'Q36081', 'Q61089']);
  assert.equal(v.records[1].shape, 'steel-circle');
  assert.equal(v.problems.length, 2);
  assert.match(v.problems[0].message, /two or more Wikidata QIDs/);
  assert.match(v.problems[1].message, /not a routes value/);
  assert.deepEqual(routeIds('Q1 > Q2'), ['Q1', 'Q2'], 'spaces around > are fine');
  assert.equal(routeIds('Q1'), null);
  assert.equal(routeIds('Q1>ottoman'), null);
  const gaz = { Q16666: { lon: 118.8, lat: 32.1 }, Q36081: { lon: 109.2, lat: 13.8 } };
  const r = resolveRecords(v.records, gaz);
  assert.deepEqual(r.waiting, [{ id: 'ok-route', missing: ['Q61089'] }]);
  assert.equal(r.records[1].lon, 118.8, 'a point with blank lon/lat takes the gazetteer coordinate');
  const full = resolveRecords(v.records, { ...gaz, Q61089: { lon: 102.3, lat: 2.2 } });
  assert.deepEqual(full.waiting, []);
  assert.equal(full.records[0].coords.length, 3);
});

test('the shipped table resolves against the shipped gazetteer', () => {
  const csv = readFileSync(new URL('../data/records.csv', import.meta.url), 'utf8');
  const gaz = JSON.parse(readFileSync(new URL('../data/gazetteer.json', import.meta.url), 'utf8'));
  const v = validateRecords(csv, vocab);
  assert.deepEqual(v.problems, []);
  const r = resolveRecords(v.records, gaz);
  assert.deepEqual(r.waiting, []);
  assert.ok(r.records.filter((x) => x.coords).length >= 6, 'the Zheng He and Manchu routes are there');
});

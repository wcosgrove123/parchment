// Parchment — the Military layer, milestone 4 (brief of 2026-11-09, P7): computed lines. Pure checks with a toy
// polygon, an identity projection and hand-made masks: a square state with sea to the east and another state to the
// west gives a blockade off its east coast and a border line down its west side; nothing is drawn by hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { outerRings, classifyEdge, blockadeRuns, borderRuns, dedupeRuns, linesOn, smoothRun, thinRun, runLength } from '../src/military/lines.js';
import { warById } from '../src/military/wars.js';
import { orderToQuery, queryToOrder } from '../src/us/frames.js';

const vocab = JSON.parse(readFileSync(new URL('../data/vocab.json', import.meta.url), 'utf8'));
const war = warById(vocab, 'mexican-american-war');

// A 200×200 square at (100,100)–(300,300), on a sheet where x < 100 is another state, x > 300 is sea, y < 100 and
// y > 300 are land that belongs to no one.
const ring = [];
for (let x = 100; x <= 300; x += 2) ring.push([x, 100]);
for (let y = 100; y <= 300; y += 2) ring.push([300, y]);
for (let x = 300; x >= 100; x -= 2) ring.push([x, 300]);
for (let y = 300; y >= 100; y -= 2) ring.push([100, y]);
const square = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } };
const proj = (p) => p;
proj.invert = (p) => p;
const masks = { land: (x) => x <= 300, other: (x) => x < 100 };

test('a feature\'s outer rings, and nothing else', () => {
  assert.equal(outerRings(square).length, 1);
  assert.equal(outerRings({ type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [[ring, ring], [ring]] } }).length, 2, 'holes are not borders');
  assert.deepEqual(outerRings({}), []);
});

test('the edge is sorted: sea beside it is coast, the other state beside it is border, the rest is neither', () => {
  const { coast, border } = classifyEdge(square, proj, masks);
  assert.equal(coast.length, 1);
  assert.ok(coast[0].pts.every((p) => p[0] >= 292), 'the east side is coast (a corner reads as coast within reach of the sea)');
  assert.ok(coast[0].pts.filter((p) => p[0] === 300).length > 40, 'the vertices are thinned to every few px as they are sorted');
  assert.ok(coast[0].out.every((o) => o[0] > 0.6), 'and the sea lies to the east of it');
  assert.equal(border.length, 1);
  assert.ok(border[0].pts.every((p) => p[0] <= 108), 'the west side borders the other state');
  assert.ok(border[0].pts.filter((p) => p[0] === 100).length > 40);
});

test('runs that retrace one another are kept once', () => {
  const a = Array.from({ length: 50 }, (_, i) => [i * 4, 0]);
  const b = a.map((p) => [p[0] + 1, p[1] + 2]);
  const c = Array.from({ length: 50 }, (_, i) => [i * 4, 100]);
  assert.equal(dedupeRuns([a, b, c]).length, 2);
});

test('a blockade lies off the coast, inside its window, and short runs are dropped', () => {
  const runs = blockadeRuns(square, proj, masks, { offset: 14 });
  assert.equal(runs.length, 1);
  assert.ok(runs[0].every((p) => p[0] > 305 && p[0] < 318), 'about 14 px out to sea');
  assert.ok(runLength(runs[0]) > 150);
  const windowed = blockadeRuns(square, proj, masks, { offset: 14, window: { west: 0, east: 400, south: 150, north: 250 } });
  assert.equal(windowed.length, 1);
  assert.ok(windowed[0].every((p) => p[1] >= 148 && p[1] <= 252));
  assert.deepEqual(blockadeRuns(square, proj, masks, { offset: 14, window: { west: 0, east: 400, south: 290, north: 300 } }), [], 'a run shorter than 90 px is not a blockade');
  const lagoon = { land: () => true, any: (x) => x <= 300 };
  assert.equal(blockadeRuns(square, proj, lagoon).length, 1, 'water no polygon covers is sea even where the land data says land');
});

test('a border line is the edge the other state touches, thinned', () => {
  const runs = borderRuns(square, proj, masks);
  assert.equal(runs.length, 1);
  assert.ok(runs[0].every((p) => p[0] <= 108), 'the west side, corners within reach of the neighbor included');
  assert.ok(runs[0].length < 101 && runLength(runs[0]) > 180, 'thinned to every few px, the length kept');
  assert.deepEqual(borderRuns(square, proj, { land: () => true, other: () => false }), [], 'no neighbor, no border');
});

test('smoothing and thinning keep a line\'s ends', () => {
  const zig = Array.from({ length: 41 }, (_, i) => [i * 5, i % 2 ? 10 : 0]);
  const sm = smoothRun(zig, 4);
  assert.deepEqual([sm[0], sm.at(-1)], [[0, 0], [200, 0]]);
  assert.ok(sm.slice(5, -5).every((p) => p[1] > 3 && p[1] < 7), 'the zigzag averages out');
  const th = thinRun(zig, 20);
  assert.ok(th.length < zig.length && th[0] === zig[0] && th.at(-1) === zig.at(-1));
});

test('the war\'s lines come alive on their dates, each with a source and a way to compute it', () => {
  assert.equal(war.lines.length, 4);
  for (const l of war.lines) { assert.ok(l.source && l.label && l.kind, l.id); assert.ok(l.coast_of || (l.border_of && l.against), `${l.id} says whose edge`); }
  assert.deepEqual(linesOn(war, 18460501).map((l) => l.id), ['mexico-1846'], 'before 14 May 1846 only the ghost of the old border');
  assert.deepEqual(linesOn(war, 18460901).map((l) => l.id).sort(), ['gulf-blockade', 'mexico-1846', 'pacific-blockade']);
  assert.deepEqual(linesOn(war, 18480202).map((l) => l.id).sort(), ['guadalupe-hidalgo', 'gulf-blockade', 'mexico-1846', 'pacific-blockade']);
  assert.equal(linesOn(war, 18450101).length, 0);
});

test('inset and forces travel with the order', () => {
  const q = orderToQuery({ page: 'us', layer: 'military', war: 'w', date: '1848-02-02', inset: { frame: 'mexico-city' }, forces: ['scott', 'taylor'] });
  assert.equal(q.get('inset'), 'mexico-city');
  assert.equal(q.get('forces'), 'scott,taylor');
  const back = queryToOrder(q);
  assert.deepEqual(back.inset, { frame: 'mexico-city' });
  assert.deepEqual(back.forces, ['scott', 'taylor']);
});

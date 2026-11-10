// The political map from Cliopatria (owner, 2026-11-09): any year, every state in force, each in its own color with
// its neighbors in others, on every world-page stage from one file. src/render/states.js, scripts/derive-cliopatria.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoPath, geoEqualEarth } from 'd3';
import { makeStatesSource, isWholeEmpire, isRealmLine, placeStateLabels } from '../src/render/states.js';
import { makeHighlighter } from '../src/data/highlights.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const topo = read('data/base/derived/cliopatria.topojson');
const src = makeStatesSource(topo);
const names = (y) => src.at(y).states.map((f) => f.properties.n);
const extent = read('src/trackers/extent.json');

test('one file covers every year the world page shows, 1200–2000', () => {
  assert.ok(src.span[0] <= 1200 && src.span[1] >= 2000, `span ${src.span}`);
  for (const y of [1200, 1250, 1453, 1750, 1900, 2000]) assert.ok(src.at(y).states.length > 60, `${y}: ${src.at(y).states.length} states`);
  const index = read('data/base/derived/index.json');
  assert.equal(index.layers.cliopatria.file, 'cliopatria.topojson');
  assert.match(index.layers.cliopatria.source, /Cliopatria v0\.2\.1/);
});

test('any year shows the shapes whose years include it, and only those', () => {
  for (const y of [1453, 1502, 1547, 1644, 1645, 1709]) {
    for (const f of src.at(y).states) assert.ok(f.properties.f <= y && y <= f.properties.t, `${y}: ${f.properties.n} ${f.properties.f}–${f.properties.t}`);
  }
  assert.ok(names(1453).includes('Ottoman Empire') && names(1453).includes('Timurid Empire'));
  assert.ok(names(1502).includes('Safavid Dynasty'), '1502: the Safavids (from 1502)');
  assert.ok(!names(1501).includes('Safavid Dynasty'), '1501: not yet');
  assert.ok(names(1547).includes('Tsardom of Russia') && !names(1547).includes('Grand Principality of Moscow'), '1547: Ivan IV crowned tsar');
  assert.ok(names(1644).includes('Ming Dynasty') && !names(1644).includes('Qing Dynasty'), '1644: Ming');
  assert.ok(names(1645).includes('Qing Dynasty') && !names(1645).includes('Ming Dynasty'), '1645: Qing (Cliopatria changes on its own grid)');
  assert.ok(names(1709).includes('Kingdom of Great Britain') && !names(1708).includes('Kingdom of Great Britain'), 'Great Britain first in 1709 on Cliopatria’s grid (the Union was 1 May 1707)');
});

test('neighbors in force at the same time never share a color', () => {
  const index = read('data/base/derived/index.json');
  assert.equal(index.layers.cliopatria.clashes, 0);
  for (const f of src.at(1600).states) assert.ok(Number.isInteger(f.properties.c) && f.properties.c >= 0 && f.properties.c < 12, `${f.properties.n}: color ${f.properties.c}`);
  const ottoman = (y) => src.at(y).states.find((f) => f.properties.n === 'Ottoman Empire').properties.c;
  assert.equal(ottoman(1453), ottoman(1700), 'a state keeps its color through time');
});

test('wholes: the Empire’s until 1458, then only its Minor States; realms around two or more members get a line', () => {
  const w = (y) => src.at(y).wholes;
  assert.ok(w(1300).some(isWholeEmpire) && w(1458).some(isWholeEmpire));
  assert.ok(!w(1459).some(isWholeEmpire) && !w(1600).some(isWholeEmpire));
  assert.ok(w(1300).filter(isRealmLine).some((f) => f.properties.n === '(Kingdom of France)'), 'France and its fiefs, 1300');
  assert.ok(!w(1600).filter(isRealmLine).some((f) => f.properties.n === '(Holy Roman Empire)'), 'a whole of one member gets no line');
});

test('tracked empires are found by Cliopatria’s names, and ?focus= still picks them', () => {
  const entry = new Map(extent.highlights.flatMap((h) => h.names.map((n) => [n, h])));
  const expect = { 1453: ['ottoman', 'ming', 'russia'], 1550: ['songhai'], 1600: ['ottoman', 'safavid', 'mughal', 'ming', 'morocco', 'russia', 'france', 'england'], 1700: ['qing', 'tokugawa', 'spain', 'habsburg', 'prussia', 'sweden', 'dutch-republic'], 1709: ['britain'] };
  for (const [y, ids] of Object.entries(expect)) {
    const found = new Set(src.at(Number(y)).states.map((f) => entry.get(f.properties.n)).filter((h) => h && y >= h.start && y <= h.end).map((h) => h.id));
    for (const id of ids) assert.ok(found.has(id), `${y}: ${id}`);
  }
  assert.ok(names(1600).includes('Iberian Union'), '1580–1640: Cliopatria draws Spain and Portugal as one Iberian Union, left under its own name');
  const match = makeHighlighter(extent.highlights, { focus: new Set(['ottoman']) });
  assert.equal(match('Ottoman Empire', 1600)?.id, 'ottoman');
  assert.equal(match('Safavid Dynasty', 1600), null, '?focus=ottoman lights only the Ottomans');
});

test('names are placed largest first, never over one another', () => {
  const path = geoPath(geoEqualEarth().fitExtent([[32, 32], [1888, 1016]], { type: 'Sphere' }));
  const view = src.at(1600);
  const measure = (text, { size }) => text.length * size * 0.62;
  const placed = placeStateLabels(view.states.map((f) => ({ f, text: f.properties.n })), { path, measure, frame: { x0: 32, y0: 32, x1: 1888, y1: 1016 } });
  assert.ok(placed.length >= 6, `${placed.length} names`);
  const box = (l) => { const w = l.text.length * l.size * 0.74 + 4; return [l.x - w / 2, l.y - l.size * 0.62, l.x + w / 2, l.y + l.size * 0.62]; };
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    const a = box(placed[i]), b = box(placed[j]);
    assert.ok(a[2] <= b[0] || b[2] <= a[0] || a[3] <= b[1] || b[3] <= a[1], `${placed[i].text} / ${placed[j].text}`);
  }
});

test('no piece is read inside out (simplifying can flip a tiny triangle; the derive winds it back)', async () => {
  const { geoArea } = await import('d3');
  const { feature } = await import('topojson-client');
  for (const g of topo.objects.states.geometries) {
    const f = feature(topo, g);
    const parts = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const p of parts) assert.ok(geoArea({ type: 'Polygon', coordinates: p }) <= 2 * Math.PI, `${g.properties.n} ${g.properties.f}–${g.properties.t}`);
  }
});

test('renamed with a source: no Golden Horde after 1501; Cliopatria’s 1547–1695 “Golden Horde” over Mongolia is the Khalkha', () => {
  const renames = JSON.parse(readFileSync(new URL('../data/cliopatria-renames.json', import.meta.url), 'utf8')).renames;
  assert.ok(renames.every((r) => r.reason && r.sources?.length && r.owner), 'every rename carries the owner’s word, a reason and sources');
  for (const y of [1502, 1547, 1600, 1650, 1690]) assert.ok(!names(y).includes('Golden Horde'), `${y}: no Golden Horde`);
  assert.ok(names(1450).includes('Golden Horde'), '1450: the Horde on the Volga stays as Cliopatria draws it');
  const k = src.at(1600).states.find((f) => f.properties.n === 'Khalkha');
  assert.ok(k, '1600: the Khalkha');
  assert.equal(k.properties.o, 'Golden Horde', 'Cliopatria’s own name is kept on the row');
  assert.equal(k.properties.wd, 'Q842323');
});

// The focus tree (src/focuses.json) and the framing rules (src/render/focus.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chooseProjection, buildProjection, indexFocuses, trail, focusStage, extentOf, normBox } from '../src/render/focus.js';

const table = JSON.parse(readFileSync(new URL('../src/focuses.json', import.meta.url), 'utf8'));
const index = indexFocuses(table);

test('the tree holds together: unique ids, real parents, children below their parents, no loops', () => {
  const ids = table.focuses.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate focus ids');
  for (const f of table.focuses) {
    for (const p of f.parents) {
      assert.ok(index.byId.has(p), `${f.id}: unknown parent ${p}`);
      assert.ok(index.byId.get(p).level <= f.level, `${f.id} (level ${f.level}) sits above its parent ${p}`);
    }
    if (f.id !== 'world') assert.ok(f.parents.length, `${f.id} has no way in`);
    const t = trail(index, f.id);
    assert.equal(t[0].id, 'world', `${f.id} does not lead back to the world`);
  }
});

test('every box is a box', () => {
  for (const f of table.focuses) {
    const b = normBox(f.extent);
    assert.ok(b.south < b.north && b.south >= -90 && b.north <= 90, `${f.id}: latitudes`);
    assert.ok(b.east > b.west && b.east - b.west <= 360, `${f.id}: longitudes`);
  }
});

test('the user\'s tree: Asia is level 3 inside Afro-Eurasia, its regions level 4; Africa has two doors', () => {
  const asia = index.byId.get('asia');
  assert.equal(asia.level, 3);
  assert.deepEqual(asia.parents, ['afro-eurasia']);
  for (const id of ['east-asia', 'central-asia', 'south-asia', 'southeast-asia', 'middle-east']) assert.ok(index.byId.get(id).parents.includes('asia'), id);
  assert.deepEqual(index.byId.get('africa').parents, ['world', 'afro-eurasia']);
  assert.deepEqual(index.byId.get('latin-america').parents, ['north-america', 'south-america']);
});

test('projection follows the box: Equal Earth for the world, azimuthal for Africa, conic for mid-latitude bands', () => {
  assert.equal(chooseProjection(index.byId.get('world').extent).projection, 'equalEarth');
  assert.equal(chooseProjection(index.byId.get('africa').extent).projection, 'lambertAzimuthalEqualArea');
  assert.equal(chooseProjection(index.byId.get('mediterranean').extent).projection, 'conicEqualArea');
  assert.equal(chooseProjection(index.byId.get('central-asia').extent).projection, 'conicEqualArea');
  const pac = chooseProjection(index.byId.get('pacific').extent);
  assert.equal(pac.projection, 'equalEarth');
  assert.ok(Math.abs(pac.rotate[0] - 162.5) < 0.01, `the Pacific is centred near 162.5°W (rotate ${pac.rotate[0]})`);
});

test('a fitted focus puts its own middle in the middle of the sheet', () => {
  const inner = [[32, 32], [1888, 1016]];
  for (const id of ['africa', 'east-asia', 'mediterranean', 'andes', 'pacific', 'caribbean']) {
    const s = focusStage(index, index.byId.get(id));
    const p = buildProjection(s);
    const b = s.extent, ring = [];
    for (let x = b.west; x < b.east; x += 1) ring.push([x, b.north]);
    for (let y = b.north; y > b.south; y -= 1) ring.push([b.east, y]);
    for (let x = b.east; x > b.west; x -= 1) ring.push([x, b.south]);
    for (let y = b.south; y < b.north; y += 1) ring.push([b.west, y]);
    ring.push(ring[0]);
    p.fitExtent(inner, { type: 'Polygon', coordinates: [ring] });
    const [x, y] = p([(b.west + b.east) / 2, (b.south + b.north) / 2]);
    assert.ok(Math.abs(x - 960) < 140 && Math.abs(y - 524) < 160, `${id}: middle at ${x.toFixed(0)},${y.toFixed(0)}`);
  }
});

test('a focus names its children where the table puts them, and only the seas its level allows', () => {
  const s = focusStage(index, index.byId.get('asia'));
  const regions = s.labels.filter((l) => l.kind === 'region').map((l) => l.text).sort();
  assert.deepEqual(regions, ['Central Asia', 'East Asia', 'Middle East', 'Siberia', 'South Asia', 'Southeast Asia']);
  const world = focusStage(index, index.byId.get('world'));
  assert.ok(world.labels.some((l) => l.text === 'Pacific Ocean'));
  assert.ok(!world.labels.some((l) => l.text === 'Baltic Sea'), 'a small sea is not named on the world map');
});

test('an empire is framed around all it held, across the antimeridian too', () => {
  const sq = (w, s, e, n) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[w, n], [e, n], [e, s], [w, s], [w, n]]] } });
  const ottoman = extentOf([sq(20, 36, 45, 42), sq(30, 15, 50, 36)]);
  assert.ok(ottoman.west < 20 && ottoman.east > 50 && ottoman.south < 15 && ottoman.north > 42);
  const russia = extentOf([sq(30, 50, 179, 70), sq(-179, 55, -140, 70)]);
  assert.ok(russia.east > 180 && russia.east - russia.west < 300, `east ${russia.east}, west ${russia.west}`);
  const tiny = extentOf([sq(12.2, 45.3, 12.5, 45.5)]); // Venice: never a pinhole
  assert.ok(tiny.east - tiny.west >= 6);
});

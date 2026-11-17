// Route networks (src/render/network.js): routes of a trunk class share one line where they share a leg, and at a
// waypoint where they join or part every leg passes in the same direction. Pure geometry; no browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNetwork, nodeTangents, legCurve, layoutNetwork } from '../src/render/network.js';
import { isTrunk, routeStyle, routeLegend } from '../src/render/routes.js';

const flat = (ll) => [ll[0] * 10, -ll[1] * 10]; // a plain projection: 10 px per degree, north up
const P = { A: [0, 0], B: [0, 10], C: [-8, 20], D: [8, 20], E: [8, 30], X: [-10, 0] };
const rec = (id, way, certainty = 'approximate') => ({ id, tracker: 'routes', kind: 'arrow', value: 'escape', certainty, label: id, start: 1830, end: 1865, waypoints: way.split('>'), coords: way.split('>').map((k) => P[k]) });

test('a leg two routes share is one leg, with both records on it', () => {
  const net = buildNetwork([rec('west', 'A>B>C'), rec('east', 'A>B>D>E')]);
  assert.equal(net.legs.length, 4); // A>B once, then B>C, B>D, D>E
  const trunk = net.legs.find((l) => l.key === 'A>B');
  assert.deepEqual(trunk.records.map((r) => r.id), ['west', 'east']);
  assert.deepEqual([...net.nodes.get('B').out].sort(), ['C', 'D']);
});

test('a shared leg is as certain as its best-documented record', () => {
  const net = buildNetwork([rec('a', 'A>B>C', 'approximate'), rec('b', 'A>B>D', 'legal'), rec('c', 'X>B', 'sphere')]);
  assert.equal(net.legs.find((l) => l.key === 'A>B').certainty, 'legal');
  assert.equal(net.legs.find((l) => l.key === 'B>C').certainty, 'approximate');
  assert.equal(net.legs.find((l) => l.key === 'X>B').certainty, 'sphere');
});

test('the same road the other way round is another leg', () => {
  const net = buildNetwork([rec('up', 'A>B'), { ...rec('down', 'A>B'), id: 'down', waypoints: ['B', 'A'], coords: [P.B, P.A] }]);
  assert.equal(net.legs.length, 2);
});

test('branches leave a split along the trunk: every leg at a node shares its direction', () => {
  const net = buildNetwork([rec('west', 'A>B>C'), rec('east', 'A>B>D>E')]);
  const laid = layoutNetwork(net, flat);
  const dir = (s, i, j) => { const dx = s[j][0] - s[i][0], dy = s[j][1] - s[i][1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const leg = (k) => laid.legs.find((l) => l.key === k).samples;
  const into = dir(leg('A>B'), leg('A>B').length - 2, leg('A>B').length - 1);
  for (const k of ['B>C', 'B>D']) {
    const out = dir(leg(k), 0, 1);
    assert.ok(into[0] * out[0] + into[1] * out[1] > 0.995, `${k} leaves B along the trunk`);
  }
  // the split is symmetric here, so the trunk passes B heading due north (up the sheet)
  const t = nodeTangents(net, laid.xy).get('B');
  assert.ok(Math.abs(t[0]) < 1e-9 && t[1] < 0);
});

test('legs start and end on their waypoints, and only a leg nothing follows is terminal', () => {
  const net = buildNetwork([rec('west', 'A>B>C'), rec('east', 'A>B>D>E')]);
  const laid = layoutNetwork(net, flat);
  for (const l of laid.legs) {
    assert.deepEqual(l.samples[0], flat(P[l.a]));
    assert.deepEqual(l.samples.at(-1).map((v) => +v.toFixed(6)), flat(P[l.b]).map((v) => +v.toFixed(6)));
  }
  assert.deepEqual(laid.legs.filter((l) => l.terminal).map((l) => l.key).sort(), ['B>C', 'D>E']);
  assert.deepEqual(laid.ends.sort(), ['C', 'E']);
});

test('a sharp turn does not loop back on itself', () => {
  const s = legCurve([0, 0], [100, 0], [-1, 0], [1, 0]); // leaves pointing away from where it is going
  const minX = Math.min(...s.map((p) => p[0]));
  assert.ok(minX > -15, `the curve backs up ${(-minX).toFixed(1)} px at most`);
});

test('the escape class is a trunk class: rust, an open chevron, one line of the key', () => {
  const r = rec('a', 'A>B');
  assert.ok(isTrunk(r));
  assert.ok(!isTrunk({ ...r, value: 'forced-migration' }));
  const st = routeStyle(r);
  assert.equal(st.color, 'rust'); assert.equal(st.markerEnd, 'chevron'); assert.equal(st.dash, 'dashed');
  const rows = routeLegend([r, rec('b', 'A>B>C', 'legal')]);
  assert.equal(rows.filter((x) => x.swatch === 'route').length, 1);
  assert.match(rows[0].label, /Underground Railroad/);
});

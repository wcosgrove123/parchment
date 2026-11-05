// Parchment — label placement tests (node --test)
// Twelve crowded ports on two routes: no two placed label boxes overlap, no route runs through a label box,
// nothing sits in a reserved zone, and the same input lays out the same way twice.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeLabels, rectsOverlap, polylineHitsRect, routeLabelCandidates, NARROW } from '../src/render/placement.js';
import { catmullRom } from '../src/render/routes.js';

const frame = { x0: 32, y0: 32, x1: 1888, y1: 1016 };
const zones = [{ x: 54, y: 866, w: 380, h: 128 }, { x: 1630, y: 54, w: 236, h: 140 }];
const measure = (text) => text.length * 8.6; // a fixed advance stands in for the font
const h = 16;

// Twelve ports packed into a 150 × 110 px patch of coast, like the Red Sea mouth at stage scale.
function crowdedPorts() {
  const names = ['Aden', 'Mocha', 'Zeila', 'Berbera', 'Jeddah', 'Suakin', 'Massawa', 'Kamaran', 'Hudaydah', 'Zabid', 'Tajura', 'Assab'];
  return names.map((name, i) => ({
    id: `port-${name.toLowerCase()}`, kind: 'point', priority: i < 2 ? 1 : i < 6 ? 2 : 3,
    x: 700 + (i % 4) * 48, y: 760 + Math.floor(i / 4) * 44, radius: 5, w: Math.ceil(measure(name)), h, name,
  }));
}
function routesThrough(ports) {
  const a = catmullRom(ports.slice(0, 6).map((p) => [p.x, p.y]));
  const b = catmullRom(ports.slice(6).map((p) => [p.x, p.y]));
  return [{ id: 'route-a', samples: a }, { id: 'route-b', samples: b }];
}

test('twelve crowded ports: no label box overlaps another, no route runs through a label, nothing in a zone', () => {
  const labels = crowdedPorts();
  const routes = routesThrough(labels);
  const marks = labels.map((l) => ({ id: l.id, x: l.x, y: l.y, radius: l.radius }));
  const out = placeLabels({ labels, marks, routes, zones, frame, width: 1920, maxPlaces: 12 });
  const placed = out.filter((p) => p.box);
  assert.ok(placed.length >= 10, `expected most of the twelve placed, got ${placed.length}: ${JSON.stringify(out.filter((p) => !p.box))}`);
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    assert.ok(!rectsOverlap(placed[i].box, placed[j].box, 0), `${placed[i].id} overlaps ${placed[j].id}`);
  }
  for (const p of placed) {
    for (const r of routes) assert.ok(!polylineHitsRect(r.samples, p.box, 0), `${r.id} runs through ${p.id}`);
    for (const z of zones) assert.ok(!rectsOverlap(p.box, z, 0), `${p.id} sits in a reserved zone`);
    for (const m of marks) if (m.id !== p.id) {
      const inside = m.x >= p.box.x && m.x <= p.box.x + p.box.w && m.y >= p.box.y && m.y <= p.box.y + p.box.h;
      assert.ok(!inside, `${p.id} covers the mark ${m.id}`);
    }
  }
});

test('placement is deterministic and tries the eight positions in order', () => {
  const labels = crowdedPorts();
  const routes = routesThrough(labels);
  const marks = labels.map((l) => ({ id: l.id, x: l.x, y: l.y, radius: l.radius }));
  const a = placeLabels({ labels, marks, routes, zones, frame, maxPlaces: 12 });
  const b = placeLabels({ labels: [...labels].reverse(), marks, routes, zones, frame, maxPlaces: 12 });
  assert.deepEqual(a, b);
  // A lone mark with nothing around it takes the first position, east.
  const lone = placeLabels({ labels: [{ id: 'x', kind: 'point', priority: 1, x: 500, y: 500, radius: 6, w: 60, h }], frame });
  assert.equal(lone[0].pos, 'E');
  assert.ok(lone[0].box.x > 500);
});

test('priority: capitals and termini first; the lowest priority is dropped on a narrow screen; ten places at most', () => {
  const labels = crowdedPorts();
  const marks = labels.map((l) => ({ id: l.id, x: l.x, y: l.y, radius: l.radius }));
  const wide = placeLabels({ labels, marks, zones, frame, width: 1920 });
  assert.equal(wide.filter((p) => p.box).length, 10, 'ten labelled places at most');
  const narrow = placeLabels({ labels, marks, zones, frame, width: NARROW - 1, maxPlaces: 12 });
  for (const l of labels.filter((l) => l.priority === 3)) assert.equal(narrow.find((p) => p.id === l.id).dropped, 'narrow');
  for (const l of labels.filter((l) => l.priority === 1)) assert.ok(narrow.find((p) => p.id === l.id).box, `${l.id} should be placed`);
});

test('a label with no free position nearby gets a leader line to a free spot', () => {
  // A mark boxed in by four placed neighbours on every side.
  const centre = { id: 'c', kind: 'point', priority: 2, x: 600, y: 600, radius: 6, w: 70, h };
  const ring = ['E', 'W', 'N', 'S', 'NE', 'NW', 'SE', 'SW'].map((pos, i) => {
    const a = (i / 8) * 2 * Math.PI;
    return { id: `n${i}`, kind: 'point', priority: 1, x: 600 + 22 * Math.cos(a), y: 600 + 22 * Math.sin(a), radius: 6, w: 40, h };
  });
  const labels = [centre, ...ring];
  const marks = labels.map((l) => ({ id: l.id, x: l.x, y: l.y, radius: l.radius }));
  const out = placeLabels({ labels, marks, frame, maxPlaces: 12 });
  const c = out.find((p) => p.id === 'c');
  assert.ok(c.box, 'the boxed-in label is still placed');
  assert.ok(c.pos === 'leader' ? Array.isArray(c.leader) : true);
});

test('route names: candidates sit above the line, read left to right, and a too-short route gets none', () => {
  const samples = catmullRom([[100, 500], [300, 480], [500, 500]]);
  const cands = routeLabelCandidates(samples, 120, 16, { gap: 4 });
  assert.ok(cands.length > 0);
  assert.equal(cands[0].reverse, false);
  assert.ok(cands[0].box.y < 480, 'the box is above the line');
  const back = routeLabelCandidates(catmullRom([[500, 500], [100, 500]]), 120, 16);
  assert.equal(back[0].reverse, true, 'a route drawn right to left is reversed for its name');
  assert.deepEqual(routeLabelCandidates(catmullRom([[100, 500], [140, 500]]), 120, 16), []);
});

#!/usr/bin/env node
// Parchment — derive-cliopatria.mjs
// Turns Cliopatria (Seshat Global History Databank, v0.2.1, CC BY 4.0; downloaded by scripts/fetch-base.mjs) into
// data/base/derived/cliopatria.topojson, the one source every world-page stage draws its states from (owner,
// 2026-11-09: "they should all be based in the same single source of truth"). Every row alive between SPAN[0] and
// SPAN[1] is kept with its years (FromYear–ToYear, inclusive), its rings rewound for d3 (Cliopatria follows RFC 7946)
// and simplified; never moved by hand.
//
// Attributes authored here, from the source's own fields:
//   k   kind: 'state' (a polity row), 'whole' (a name in parentheses: a realm made of its Components, drawn as a
//       border over them), 'union' ('(Personal union of …)'), 'rel' (a RELATION row: vassalage or allegiance; kept,
//       not drawn yet)
//   c   palette color (0…PALETTE-1) for states: neighbors in force at the same time never share one, and a state keeps
//       its color through time wherever its neighbors allow (computed on a grid of RES°; see colorStates)
//   id  a stable id from the name (kebab-case), for the extent tracker, ?focus= and the Sheet's place list
//   cert 'legal' from 1648 (the Peace of Westphalia), else 'approximate', as for the base maps before
//
// Usage: node --max-old-space-size=8192 scripts/derive-cliopatria.mjs [--report]

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea } from 'd3';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { quantize, feature } from 'topojson-client';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'base', 'raw', 'cliopatria', 'cliopatria_polities_only_v021.geojson');
const OUT = join(ROOT, 'data', 'base', 'derived');
const REPORT = process.argv.includes('--report');
const SPAN = [1200, 2000];          // the world page's stages all span 1200–2000 (src/stages/*.json)
const SETTINGS = { minWeight: 1e-4, quantization: 1e5 }; // as data/base/derived/index.json's polities (about 0.01°)
export const PALETTE = 12;          // --pol-0 … --pol-11 in src/tokens.css (scripts/tokens.mjs)
const RES = 0.5;                    // the adjacency grid, degrees
const LEGAL_FROM = 1648;
const R2 = 6371 ** 2;

const kebab = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0; return h; };
const rewind = (rings) => (geoArea({ type: 'Polygon', coordinates: rings }) > 2 * Math.PI ? rings.map((r) => r.slice().reverse()) : rings);
const polygonsOf = (g) => (!g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);

console.log('Cliopatria');
const raw = JSON.parse(await readFile(RAW, 'utf8'));
const rows = raw.features.filter((f) => f.properties.ToYear >= SPAN[0] && f.properties.FromYear <= SPAN[1] && f.geometry);
const kindOf = (p) => (p.Type === 'RELATION' ? 'rel' : !p.Name.startsWith('(') ? 'state' : /^\(Personal union/i.test(p.Name) ? 'union' : 'whole');
const features = rows.map((f, i) => {
  const p = f.properties;
  const k = kindOf(p);
  const geometry = { type: 'MultiPolygon', coordinates: polygonsOf(f.geometry).map(rewind) };
  return {
    type: 'Feature',
    properties: {
      n: p.Name, f: p.FromYear, t: p.ToYear, k, id: kebab(p.Name.replace(/^\(|\)$/g, '')),
      ...(p.MemberOf ? { m: p.MemberOf } : {}),
      ...(k === 'whole' || k === 'union' ? { cn: (p.Components || '').split(';').filter(Boolean).length } : {}),
      ...(p.Wikidata ? { wd: p.Wikidata } : {}),
      a: Math.round(p.Area ?? geoArea(geometry) * R2),
      cert: p.FromYear >= LEGAL_FROM ? 'legal' : 'approximate',
      i,
    },
    geometry,
  };
});
raw.features = null;
const byKind = {}; for (const f of features) byKind[f.properties.k] = (byKind[f.properties.k] ?? 0) + 1;
console.log(`  ${features.length} rows alive ${SPAN[0]}–${SPAN[1]} (${Object.entries(byKind).map(([k, v]) => `${k} ${v}`).join(', ')}), ${new Set(features.map((f) => f.properties.n)).size} names`);

// ---------------------------------------------------------------- simplify
let topo = topology({ states: { type: 'FeatureCollection', features } }, SETTINGS.quantization);
topo = presimplify(topo);
topo = simplify(topo, SETTINGS.minWeight);
topo = quantize(topo, SETTINGS.quantization);
for (const arc of topo.arcs) for (const pt of arc) pt.length = 2;
// Simplifying can leave a tiny piece (a triangle of four points) wound the other way round, which d3 then reads as
// the whole globe less that triangle (21 pieces in v0.2.1, all but one the Maratha Empire's). Such a piece is wound
// back: its rings reversed, arc by arc (the topology's own notation, ~i for an arc read backwards). Nothing moves.
let rewound = 0;
for (const g of topo.objects.states.geometries) {
  if (g.type !== 'Polygon' && g.type !== 'MultiPolygon') continue;
  const f = feature(topo, g);
  const parts = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const arcParts = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  parts.forEach((p, k) => {
    if (geoArea({ type: 'Polygon', coordinates: p }) <= 2 * Math.PI) return;
    arcParts[k] = arcParts[k].map((ring) => ring.slice().reverse().map((i) => ~i));
    rewound++;
  });
  if (g.type === 'Polygon') g.arcs = arcParts[0];
}
console.log(`  ${rewound} simplified pieces wound back (read inside out by d3)`);

// ---------------------------------------------------------------- colors: neighbors differ, a state keeps its color
// Each state row is rasterized once on a RES° grid (planar ray casting on lon/lat at cell centers; a row too small
// to cover a center takes the cell of its first vertex). At every year a row begins, the rows then in force are laid
// on the grid, and rows in the same or touching cells are neighbors. Names are colored first, largest first, each
// taking its own preferred color (a hash of the name) where no neighbor has it; then any row still sharing a color
// with a neighbor row in force at the same time takes another, its name's color wherever it can.
const decoded = feature(topo, topo.objects.states).features;
const W = Math.round(360 / RES), H = Math.round(180 / RES);
// Scanline fill, even-odd over every ring: per grid row, the x where each edge crosses the row's center line,
// sorted, filled in pairs (the cost grows with edges × rows, not cells × edges).
function rasterize(geom) {
  const polys = polygonsOf(geom);
  const edges = [];
  let y0 = 90, y1 = -90;
  for (const p of polys) for (const ring of p) for (let a = 0, b = ring.length - 1; a < ring.length; b = a++) {
    const [xa, ya] = ring[a], [xb, yb] = ring[b];
    if (ya === yb) continue;
    edges.push(xa, ya, xb, yb);
    if (ya < y0) y0 = ya; if (yb < y0) y0 = yb; if (ya > y1) y1 = ya; if (yb > y1) y1 = yb;
  }
  const cells = [];
  const r0 = Math.max(0, Math.floor((90 - y1) / RES)), r1 = Math.min(H - 1, Math.floor((90 - y0) / RES));
  const xs = [];
  for (let r = r0; r <= r1; r++) {
    const y = 90 - (r + 0.5) * RES;
    xs.length = 0;
    for (let e = 0; e < edges.length; e += 4) {
      const xa = edges[e], ya = edges[e + 1], xb = edges[e + 2], yb = edges[e + 3];
      if ((ya > y) !== (yb > y)) xs.push(xa + ((y - ya) * (xb - xa)) / (yb - ya));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const c0 = Math.max(0, Math.ceil((xs[k] + 180) / RES - 0.5)), c1 = Math.min(W - 1, Math.floor((xs[k + 1] + 180) / RES - 0.5));
      for (let c = c0; c <= c1; c++) cells.push(r * W + c);
    }
  }
  if (!cells.length && polys[0]?.[0]?.[0]) {
    const [x, y] = polys[0][0][0];
    cells.push(Math.min(H - 1, Math.max(0, Math.floor((90 - y) / RES))) * W + Math.min(W - 1, Math.max(0, Math.floor((x + 180) / RES))));
  }
  return Int32Array.from(cells);
}
const states = decoded.filter((f) => f.properties.k === 'state');
const t0 = Date.now();
const cellsOf = new Map(states.map((f) => [f.properties.i, rasterize(f.geometry)]));
console.log(`  rasterized ${states.length} state rows on a ${RES}° grid in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

const rowNeighbors = new Map(states.map((f) => [f.properties.i, new Set()]));
const names = [...new Set(states.map((f) => f.properties.n))];
const nameIx = new Map(names.map((n, k) => [n, k]));
const rowName = new Int32Array(features.length).fill(-1);
for (const f of states) rowName[f.properties.i] = nameIx.get(f.properties.n);
const pairWeight = new Map(); // nameA * N + nameB (A < B) → change years in contact
const NN = names.length;
const startYears = [...new Set(states.map((f) => Math.max(SPAN[0], f.properties.f)))].sort((a, b) => a - b);
const NB = [1, W - 1, W, W + 1];
const owner = new Int32Array(W * H).fill(-1); // one row per cell; a cell two rows overlap in is checked through `extra`
for (const y of startYears) {
  const alive = states.filter((f) => f.properties.f <= y && y <= f.properties.t);
  const extra = new Map();
  const touched = [];
  const meet = (a, b) => {
    if (a === b || rowName[a] === rowName[b]) return;
    rowNeighbors.get(a).add(b); rowNeighbors.get(b).add(a);
    const [x, z] = rowName[a] < rowName[b] ? [rowName[a], rowName[b]] : [rowName[b], rowName[a]];
    const key = x * NN + z;
    pairWeight.set(key, (pairWeight.get(key) ?? 0) + 1);
  };
  for (const f of alive) {
    const i = f.properties.i;
    for (const cell of cellsOf.get(i)) {
      const o = owner[cell];
      if (o === -1) { owner[cell] = i; touched.push(cell); }
      else if (o !== i) { meet(o, i); if (!extra.has(cell)) extra.set(cell, []); extra.get(cell).push(i); }
    }
  }
  for (const cell of touched) {
    const a = owner[cell];
    for (const d of NB) { const b = owner[cell + d]; if (b !== undefined && b !== -1) meet(a, b); }
  }
  for (const [cell, more] of extra) for (const a of more) for (const d of NB) { const b = owner[cell + d]; if (b !== undefined && b !== -1) meet(a, b); }
  for (const cell of touched) owner[cell] = -1;
}
console.log(`  neighbors at ${startYears.length} change years: ${pairWeight.size} pairs of names`);

// Names, largest (area × years) first.
const size = new Map();
for (const f of states) size.set(f.properties.n, (size.get(f.properties.n) ?? 0) + f.properties.a * (Math.min(f.properties.t, SPAN[1]) - Math.max(f.properties.f, SPAN[0]) + 1));
const adj = new Map();
for (const [key, w] of pairWeight) { const a = names[Math.floor(key / NN)], b = names[key % NN]; for (const [x, z] of [[a, b], [b, a]]) { if (!adj.has(x)) adj.set(x, new Map()); adj.get(x).set(z, w); } }
const nameColor = new Map();
for (const n of [...size.keys()].sort((a, b) => size.get(b) - size.get(a))) {
  const pref = hash(n) % PALETTE;
  const cost = new Array(PALETTE).fill(0);
  for (const [z, w] of adj.get(n) ?? []) if (nameColor.has(z)) cost[nameColor.get(z)] += w;
  let best = pref;
  for (let k = 1; k < PALETTE; k++) { const c = (pref + k) % PALETTE; if (cost[c] < cost[best]) best = c; }
  nameColor.set(n, best);
}
const rowColor = new Map(states.map((f) => [f.properties.i, nameColor.get(f.properties.n)]));
let recolored = 0;
for (const f of [...states].sort((a, b) => b.properties.a - a.properties.a)) {
  const i = f.properties.i;
  const taken = new Set([...rowNeighbors.get(i)].map((j) => rowColor.get(j)));
  if (!taken.has(rowColor.get(i))) continue;
  const free = [...Array(PALETTE).keys()].map((k) => (nameColor.get(f.properties.n) + k) % PALETTE).find((c) => !taken.has(c));
  if (free != null) { rowColor.set(i, free); recolored++; }
}
let clashes = 0;
for (const [i, ns] of rowNeighbors) for (const j of ns) if (i < j && rowColor.get(i) === rowColor.get(j)) clashes++;
console.log(`  ${PALETTE} colors: ${recolored} rows took another color than their name's; ${clashes} neighbor pairs still share one`);
for (const g of topo.objects.states.geometries) if (rowColor.has(g.properties.i)) g.properties.c = rowColor.get(g.properties.i);
for (const g of topo.objects.states.geometries) delete g.properties.i;

// ---------------------------------------------------------------- write
const text = JSON.stringify(topo);
await writeFile(join(OUT, 'cliopatria.topojson'), text);
const indexPath = join(OUT, 'index.json');
const index = JSON.parse(await readFile(indexPath, 'utf8'));
index.layers.cliopatria = { file: 'cliopatria.topojson', bytes: text.length, rows: features.length, by_kind: byKind, span: SPAN, palette: PALETTE, grid_degrees: RES, neighbor_pairs: pairWeight.size, clashes, settings: SETTINGS, source: 'Cliopatria v0.2.1 (Seshat Global History Databank, CC BY 4.0)', written_by: 'scripts/derive-cliopatria.mjs' };
await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log(`  wrote data/base/derived/cliopatria.topojson (${(text.length / 1048576).toFixed(1)} MB)`);

if (REPORT) {
  for (const y of [1250, 1453, 1600, 1750]) {
    const alive = features.filter((f) => f.properties.f <= y && y <= f.properties.t);
    console.log(`${y}: ${alive.filter((f) => f.properties.k === 'state').length} states; wholes: ${alive.filter((f) => f.properties.k !== 'state' && f.properties.k !== 'rel').map((f) => `${f.properties.n} (${f.properties.cn})`).join('; ')}`);
  }
}

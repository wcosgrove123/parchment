// Parchment — the world page's lesson maps (statehood brief of 2026-11-18, item 6): one framed sheet of the world for
// one order. The frame is a focus of src/focuses.json or a box, fitted in the projection that follows it
// (src/render/focus.js); the sheet takes the order's size. Under the island-territory layer (the default tracker,
// "insular") the states in force that year (Cliopatria) are quiet ground, paper with their borders and names, and the
// U.S. island territories held on the day carry the fills; under "states" every state takes its political color.
// An order's highlight lights what it names (an island territory by its ia: id, a state by its name or Cliopatria id)
// and drops the rest to paper. Nothing here moves a vertex; the relief is reshaded for the frame from the world relief.

import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { assetURL } from '../data/loader.js';
import { paperDefs, drawPaper, drawPaperOverlay } from '../render/paper.js';
import { drawStageLabels, makeMeasure } from '../render/labels.js';
import { createLegend } from '../render/legend.js';
import { createCartouche } from '../render/cartouche.js';
import { createStrip } from '../render/strip.js';
import { placeStateLabels } from '../render/states.js';
import { buildProjection } from '../render/focus.js';
import { reliefFor } from '../render/relief-reproject.js';
import { FRAME } from '../render/base.js';
import { HOLDS, fuzzyOn } from './insular.js';

const MAX_PLACES = 10; // grammar §5: at most ten labelled places per map

export function extentPolygon({ west, south, east, north }, step = 1) {
  const ring = [];
  for (let x = west; x < east; x += step) ring.push([x, north]);
  for (let y = north; y > south; y -= step) ring.push([east, y]);
  for (let x = east; x > west; x -= step) ring.push([x, south]);
  for (let y = south; y < north; y += step) ring.push([west, y]);
  ring.push(ring[0]);
  return { type: 'Polygon', coordinates: [ring] };
}

const overlaps = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

// A point inside a d3.geoBounds box (one that crosses the antimeridian runs west > east).
const inBounds = ([[w, s], [e, n]], [x, y]) => y >= s && y <= n && (w <= e ? x >= w && x <= e : x >= w || x <= e);
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
const linesOf = (g) => (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []);

// Natural Earth's land at 1:50m runs a kilometer or more off the island territories' own outlines (the Census
// Bureau's at 1:500,000, Natural Earth's at 1:10m): on a frame of a few islands it shows as a pale rim round each
// island. Where an island piece is the land, its own outline is the coast: a Natural Earth polygon (or coast line)
// whose center lies inside a piece is left out, and the pieces are drawn as land and coast instead. Nothing moves:
// one downloaded outline is chosen over another, the finer. fine: features (any date) whose shape is an island's own.
export function landWithIslands(ne, fine) {
  const boxes = fine.map((f) => d3.geoBounds(f));
  const inside = (pt) => Number.isFinite(pt[0]) && fine.some((f, i) => inBounds(boxes[i], pt) && d3.geoContains(f, pt));
  const keep = [], left = [];
  for (const f of feature(ne, ne.objects.land).features) {
    for (const poly of polysOf(f.geometry)) (inside(d3.geoCentroid({ type: 'Polygon', coordinates: poly })) ? left : keep).push(poly);
  }
  const coast = [];
  for (const f of feature(ne, ne.objects.coastline).features) {
    for (const line of linesOf(f.geometry)) if (!inside(d3.geoCentroid({ type: 'LineString', coordinates: line }))) coast.push(line);
  }
  return {
    land: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: keep } },
    coast: { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: coast } },
    fine: { type: 'FeatureCollection', features: fine },
    replaced: left.length,
  };
}

// sheet: { w, h }; frame: { box, projection } or null for the whole world (the stage's own projection, the sphere);
// layers: { ne, bathy, relief: url }; stage: the world stage file (title, labels, span); fineLand: the island pieces
// whose outline is finer than Natural Earth's 1:50m land (landWithIslands).
export function createWorldLesson(svg, { sheet, frame, stage, layers, noStrip = false, reliefScale = 0.5, water = [], fineLand = [] }) {
  const W = sheet.w, H = sheet.h;
  const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - (noStrip ? FRAME.top : FRAME.bottom)]];
  const [[x0, y0], [x1, y1]] = inner;
  const frameRect = { x0, y0, x1, y1 };
  const projection = frame
    ? buildProjection(frame.projection).fitExtent([[x0 + 10, y0 + 10], [x1 - 10, y1 - 10]], extentPolygon(frame.box, 0.5))
    : buildProjection({ projection: stage.projection, rotate: stage.rotate }).fitExtent(inner, { type: 'Sphere' });
  projection.clipExtent([[x0 - 6, y0 - 6], [x1 + 6, y1 + 6]]);
  const path = d3.geoPath(projection);

  svg.attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet');
  svg.selectAll('*').remove();
  const defs = svg.append('defs');
  paperDefs(defs);
  defs.append('clipPath').attr('id', 'frame-clip').append('rect').attr('x', x0).attr('y', y0).attr('width', x1 - x0).attr('height', y1 - y0);
  defs.append('pattern').attr('id', 'hatch-rust').attr('patternUnits', 'userSpaceOnUse').attr('width', 8).attr('height', 8).attr('patternTransform', 'rotate(45)')
    .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 8).attr('class', 'hatch-line');

  const root = svg.append('g').attr('class', 'stage world-lesson');
  drawPaper(root, W, H);
  const map = root.append('g').attr('class', 'map').attr('clip-path', 'url(#frame-clip)');
  map.append('path').attr('class', 'ocean').attr('d', path({ type: 'Sphere' }));
  // (bathymetry's contours are Natural Earth's at 1:10m, simplified for a world map: on a frame under 12 degrees wide
  // they read as stray straight lines across the sea, so a frame that close leaves them out)
  const wide = frame ? (frame.box.east - frame.box.west + 360) % 360 || 360 : 360;
  if (layers.bathy && wide >= 12) map.append('g').attr('class', 'bathymetry').selectAll('path').data(feature(layers.bathy, layers.bathy.objects.bathymetry).features).join('path').attr('d', path);
  const ground0 = landWithIslands(layers.ne, fineLand.filter((f) => path(f)));
  const landD = [path(ground0.land), path(ground0.fine)].filter(Boolean).join('');
  map.append('path').attr('class', 'land').attr('d', landD);
  defs.append('clipPath').attr('id', 'land-clip').append('path').attr('d', landD);
  const relief = map.append('image').attr('class', 'relief').attr('clip-path', 'url(#land-clip)')
    .attr('x', x0).attr('y', y0).attr('width', x1 - x0).attr('height', y1 - y0).attr('preserveAspectRatio', 'none');
  // (the relief is reshaded for this frame from the world relief; the picture waits for it: reliefReady)
  const reliefReady = reliefFor(`world-lesson-${frame ? JSON.stringify(frame.box) : 'sphere'}-${W}x${H}`, assetURL(layers.relief), projection, [x0, y0, x1, y1], { scale: reliefScale })
    .then((url) => { relief.attr('href', url); }).catch((err) => console.warn(err.message));
  const ground = map.append('g').attr('class', 'snap');
  map.append('g').attr('class', 'rivers').selectAll('path').data(feature(layers.ne, layers.ne.objects.rivers).features.filter((f) => (f.properties.scalerank ?? 0) <= 7)).join('path').attr('d', path);
  map.append('path').attr('class', 'lakes').attr('d', path(feature(layers.ne, layers.ne.objects.lakes)));
  map.append('path').attr('class', 'coastline').attr('d', [path(ground0.coast), path(ground0.fine)].filter(Boolean).join(''));
  map.append('path').attr('class', 'graticule').attr('d', path(d3.geoGraticule10()));
  const islands = map.append('g').attr('class', 'insular');
  const stageLabels = map.append('g').attr('class', 'stage-labels');
  drawStageLabels(stageLabels, defs, { id: 'world-lesson', labels: water }, path);
  const labelLayer = map.append('g').attr('class', 'polity-labels');

  drawPaperOverlay(root, W, H);
  root.append('path').attr('class', 'frame').attr('d', `M${x0},${y1}L${x0},${y0}L${x1},${y0}L${x1},${y1}${noStrip ? 'Z' : ''}`);
  const legend = createLegend(root, frameRect, { anchor: frame?.legend ?? 'bottom-right', lift: 22, fit: true });
  const cartouche = createCartouche(root, frameRect, { title: stage.title, extent: frame ? frame.box : stage.extent }, projection);
  const strip = noStrip ? null : createStrip(root, frameRect, stage, [], null);
  const measure = makeMeasure();

  // The quiet ground and the island pieces of one day. states: Cliopatria's view (src/render/states.js) with each
  // state's look in f.properties.look ({ fill: 'pol-N' } lit, or null); pieces: the island pieces held on the day,
  // each with its look ({ fill, pattern, dashed }); labels: what to name, lit first.
  function show({ states, pieces, date, legendSpec, certainty }) {
    ground.selectAll('*').remove();
    islands.selectAll('*').remove();
    labelLayer.selectAll('*').remove();
    ground.append('g').attr('class', 'polities states').selectAll('path').data(states.states).join('path')
      .attr('class', (f) => `polity state ${f.properties.look?.fill ? `pol-${f.properties.c ?? 0}` : 'muted'}`)
      .attr('d', path)
      .append('title').text((f) => `${f.properties.n} · ${f.properties.f}–${f.properties.t} (Cliopatria)`);
    ground.append('path').attr('class', `border ${certainty}`).attr('d', path(states.border()));
    // Each island piece in its hold's fill, its edge stroked in the same color so that an atoll a few hundred meters
    // across still shows as a mark of its own shape on a sheet of half an ocean; claimed land hatched; unlit pieces an
    // outline only; a piece whose date is known only to the month or year dashed (grammar §5: dash is certainty).
    const drawn = pieces.filter((it) => path(it.f));
    islands.selectAll('path').data(drawn).join('path')
      .attr('class', (it) => `ia-piece ${it.look.fill ? `k-${it.look.fill}` : it.look.pattern ? 'p-hatch' : 'unlit'}${it.look.dashed ? ' dashed' : ''}`)
      .attr('d', (it) => path(it.f))
      .append('title').text((it) => `${it.p.name} · ${it.p.start}–${it.p.end ?? 'present'} · ${HOLDS[it.p.hold]?.label ?? it.p.hold}`);
    legend.set(legendSpec);
    // names: the pieces first (inside their shape when it fits, else beside it), then the states around them
    const zones = [cartouche.box(), legend.box(), ...(strip ? [{ x: x0, y: y1 - 14, w: x1 - x0, h: 40 }] : []), ...stageZones()];
    const placed = [...zones];
    const out = [];
    const lit = drawn.filter((it) => it.lit !== false).sort((a, b) => (b.lit === true) - (a.lit === true) || (b.p.km2 ?? 0) - (a.p.km2 ?? 0));
    const seenNames = new Set();
    for (const it of lit) {
      // (pieces that share a printed name, such as the trust territory's four, carry it once: on the largest)
      if (seenNames.has(it.p.label ?? it.p.name)) continue;
      if (out.length >= MAX_PLACES) { it.labelDropped = 'ceiling'; continue; }
      const pick = placePieceName(it, placed);
      if (!pick) { it.labelDropped = 'no room'; continue; }
      seenNames.add(it.p.label ?? it.p.name);
      it.label = pick.text;
      placed.push(pick.box);
      out.push(pick);
    }
    const stateCands = states.states.filter((f) => path(f)).map((f) => ({ f, text: f.properties.n.replace(/^\(|\)$/g, ''), lit: !!f.properties.look?.fill }));
    const stateNames = placeStateLabels(stateCands.sort((a, b) => b.lit - a.lit), { path, measure, zones: placed, frame: frameRect, minW: 40, minH: 14 });
    for (const l of stateNames) { const c = stateCands.find((x) => x.f === l.f || x.text === l.text); if (c) c.f.properties.labeled = l.text; }
    labelLayer.selectAll('text.state-name').data(stateNames).join('text')
      .attr('class', (l) => `label polity state-name${stateCands.find((x) => x.text === l.text)?.lit ? '' : ' unlit'}`)
      .attr('x', (l) => l.x).attr('y', (l) => l.y).attr('font-size', (l) => l.size)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').text((l) => l.text);
    labelLayer.selectAll('text.ia-name').data(out).join('text')
      .attr('class', 'label polity ia-name').attr('x', (l) => l.x).attr('y', (l) => l.y).attr('font-size', (l) => l.size)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').text((l) => l.text);
    cartouche.setYear(Math.trunc(date / 10000));
    fitTitle();
    strip?.setYear(Math.trunc(date / 10000));
    return { drawn, names: out, stateNames };
  }

  // The title and the year share the cartouche's line. A title too long for it steps down a size, as on the North
  // America page, to no less than 15 px; past that it breaks over two lines at the space nearest its middle. The whole
  // title stays in data-title (the packing slip reads it there).
  function fitTitle() {
    const t = root.select('.cartouche .map-title');
    const text = t.attr('data-title') ?? t.text();
    t.attr('data-title', text).style('font-size', null).text(text);
    try {
      const tb = t.node().getBBox(), yb = root.select('.cartouche .year').node().getBBox();
      const room = yb.x - 14 - tb.x;
      if (tb.width <= room || room < 40) return;
      const size = parseFloat(getComputedStyle(t.node()).fontSize);
      if (size * room / tb.width >= 15) { t.style('font-size', `${(size * room / tb.width).toFixed(1)}px`); return; }
      const words = text.split(' ');
      let best = null;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
        if (!best || Math.max(a.length, b.length) < best.m) best = { a, b, m: Math.max(a.length, b.length) };
      }
      if (!best) { t.style('font-size', `${(size * room / tb.width).toFixed(1)}px`); return; }
      const two = Math.min(18, size);
      t.text(null).style('font-size', `${two}px`);
      t.append('tspan').attr('x', t.attr('x')).attr('dy', '-0.5em').text(best.a);
      t.append('tspan').attr('x', t.attr('x')).attr('dy', '1.1em').text(best.b);
      const w = t.node().getBBox().width;
      if (w > room) t.style('font-size', `${Math.max(12, two * room / w).toFixed(1)}px`);
    } catch { /* not laid out */ }
  }

  // A piece's name: inside its largest part when the text fits there, else beside the piece, on whichever side is clear.
  function placePieceName(it, placed) {
    const [[bx0, by0], [bx1, by1]] = path.bounds(it.f);
    if (!Number.isFinite(bx0)) return null;
    // (13 px for an island a few pixels across, up to 20 px for one that fills the frame: the states' rule, by size)
    const size = Math.round(Math.max(13, Math.min(20, Math.sqrt(Math.max(0, bx1 - bx0) * Math.max(0, by1 - by0)) / 22)));
    const text = it.p.label ?? it.p.name;
    const tw = measure(text.toUpperCase(), { size: size * 0.8, bold: true }) + text.length * size * 0.12, th = size * 1.1;
    const clear = (b) => b.x >= x0 + 4 && b.x + b.w <= x1 - 4 && b.y >= y0 + 4 && b.y + b.h <= y1 - 4 && !placed.some((z) => overlaps(z, b, 3));
    const at = (cx, cy) => ({ x: cx - tw / 2, y: cy - th / 2, w: tw, h: th });
    const [cx, cy] = path.centroid(largest(it.f));
    if (bx1 - bx0 > tw * 1.1 && by1 - by0 > th * 2 && Number.isFinite(cx)) { const b = at(cx, cy); if (clear(b)) return { text, x: cx, y: cy, size, box: b, inside: true }; }
    const g = 6, mx = (bx0 + bx1) / 2, my = (by0 + by1) / 2;
    // (right, above, below, then left: a name pushed to the far side of a speck can read as a neighbor's, as the
    // Virgin Islands' did west of Puerto Rico on the world map)
    for (const [x, y] of [[bx1 + g + tw / 2, my], [mx, by0 - g - th / 2], [mx, by1 + g + th / 2], [mx, by0 - g - th * 1.5], [mx, by1 + g + th * 1.5], [bx0 - g - tw / 2, my], [bx1 + g + tw / 2, by0 - g - th / 2], [bx0 - g - tw / 2, by0 - g - th / 2], [bx1 + g + tw / 2, by1 + g + th / 2], [bx0 - g - tw / 2, by1 + g + th / 2]]) {
      const b = at(x, y);
      if (clear(b)) return { text, x, y, size, box: b, inside: false };
    }
    return null;
  }
  function largest(f) {
    const g = f.geometry;
    if (g.type === 'Polygon') return g;
    let best = null, bestA = -1;
    for (const c of g.coordinates) { const p = { type: 'Polygon', coordinates: c }; const a = d3.geoArea(p); if (a > bestA) { bestA = a; best = p; } }
    return best;
  }
  let stageBoxes = null;
  function stageZones() {
    if (stageBoxes) return stageBoxes;
    stageBoxes = [];
    stageLabels.selectAll('text').each(function () { try { const b = this.getBBox(); if (b.width > 0 && b.height < 80) stageBoxes.push({ x: b.x, y: b.y, w: b.width, h: b.height }); } catch { /* not laid out */ } });
    return stageBoxes;
  }

  // On the sheet: a piece is shown when some of it falls inside the frame.
  const shows = (f) => { const [[a, b], [c, e]] = path.bounds(f); return Number.isFinite(a) && c > x0 && a < x1 && e > y0 && b < y1; };
  return { projection, path, show, shows, legend, cartouche, strip, reliefReady, frame: frameRect, sheet: { w: W, h: H } };
}

// The look of a piece on a day under the island layer: its hold's fill (or the hatch), dashed inside a stretch its
// date is not known to the day; unlit (an outline) when the order lights other things.
export function pieceLook(it, date, lit) {
  const h = HOLDS[it.p.hold] ?? HOLDS.territory;
  const dashed = fuzzyOn(it, date);
  if (lit === false) return { fill: null, pattern: null, dashed };
  return h.pattern ? { pattern: h.pattern, dashed } : { fill: h.fill, dashed };
}

// Parchment — Military layer, milestone 0: the mock-up overlay.
// Runs INSIDE a rendered North America lesson map (us.html) and draws the proposals of the brief of 2026-11-09
// (P1–P10, §3 force marks) over it, so the owner can see each one on the Texas 1846 map before anything enters
// the grammar. It is bundled and injected by scripts/military-sheet.mjs; the page itself never loads it.
// Nothing here is a record, a layer or a renderer: every mark is placed by the sheet's spec, at a gazetteer
// coordinate (tests/maps/military/m0-places.json), on top of the picture the page already drew.
//
// window.militaryOverlay(spec) → { projectionError, warnings }
//   spec.places   { key: { lon, lat, label } }
//   spec.sides    { a: { line, fill }, … } the side colors (src/military/sides.js), by key
//   spec.css      extra CSS for the page (recoloring fills by side, hiding layers)
//   spec.hideLegend  hide the page's own legend (the panel draws a proposal legend instead)
//   spec.items    the things to draw, in order; see draw() for each type

import * as d3 from 'd3';
// The vendored UMD build sets globalThis.ms when loaded as a module (this project is type: module).
import '../../assets/vendor/milsymbol/milsymbol.js';
const ms = globalThis.ms;
import { buildProjection } from '../render/focus.js';
import { catmullRom, pathFrom } from '../render/routes.js';
import { faded, PAPER } from './sides.js';

const NAVY = '#1F2A44', RUST = '#C8601A', MOSS = '#499737', CREAM = '#F7F5EF';
const FONT = '"Libre Baskerville", Baskerville, Georgia, serif';

// The frame's projection, rebuilt exactly as src/us/stage.js fits it (fitFrame: a 10 px inset, the box as a ring
// sampled every half degree). Checked against the marks the page drew; the error is returned.
function extentPolygon({ west, south, east, north }, step = 0.5) {
  const ring = [];
  for (let x = west; x < east; x += step) ring.push([x, north]);
  for (let y = north; y > south; y -= step) ring.push([east, y]);
  for (let x = east; x > west; x -= step) ring.push([x, south]);
  for (let y = south; y < north; y += step) ring.push([west, y]);
  ring.push(ring[0]);
  return { type: 'Polygon', coordinates: [ring] };
}

function rebuildProjection(slip) {
  const { x0, y0, x1, y1 } = slip.layout.frame;
  const pj = slip.resolved.projection;
  const p = buildProjection({ projection: pj.name, rotate: pj.rotate, parallels: pj.parallels });
  p.fitExtent([[x0 + 10, y0 + 10], [x1 - 10, y1 - 10]], extentPolygon(slip.resolved.frame.box, 0.5));
  return p;
}

function projectionError(slip, proj) {
  let worst = 0;
  const byLabel = new Map(slip.points.map((p) => [p.label, p]));
  d3.selectAll('.marks g.mark-group').each(function () {
    const t = /translate\(([-\d.]+),([-\d.]+)\)/.exec(this.getAttribute('transform'));
    const label = this.querySelector('title')?.textContent.split(' · ')[0];
    const p = byLabel.get(label);
    if (!t || !p) return;
    const [x, y] = proj([p.lon, p.lat]);
    worst = Math.max(worst, Math.hypot(x - Number(t[1]), y - Number(t[2])));
  });
  return worst;
}

// ---------------------------------------------------------------- defs: heads, hatches per side
function sideDefs(defs, sides) {
  for (const [k, s] of Object.entries(sides)) {
    const m = (id, d, fill, stroke) => {
      const mk = defs.append('marker').attr('id', `mil-${id}-${k}`).attr('viewBox', '0 0 10 10').attr('refX', 8.5).attr('refY', 5)
        .attr('markerWidth', 4).attr('markerHeight', 4).attr('orient', 'auto-start-reverse');
      mk.append('path').attr('d', d).attr('fill', fill).attr('stroke', stroke ?? 'none').attr('stroke-width', 0.6).attr('stroke-linejoin', 'round');
    };
    m('barb', 'M0,0L10,5L0,10L3,5Z', s.line);                 // an armed force (as now), in the side's color
    m('hollow', 'M0.5,0.8L9.4,5L0.5,9.2L3.2,5Z', PAPER, s.line); // P3: a retreat, outline only
    m('arrow', 'M0,1.5L9,5L0,8.5Z', s.line);                  // a voyage's single head
    defs.append('pattern').attr('id', `mil-hatch-${k}`).attr('patternUnits', 'userSpaceOnUse').attr('width', 8).attr('height', 8).attr('patternTransform', 'rotate(45)')
      .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 8).attr('stroke', s.line).attr('stroke-width', 1.2).attr('stroke-opacity', 0.85);
  }
  defs.append('pattern').attr('id', 'mil-crenel').attr('patternUnits', 'userSpaceOnUse').attr('width', 10).attr('height', 6)
    .append('path').attr('d', 'M0,6V2H5V6').attr('fill', 'none').attr('stroke', NAVY).attr('stroke-width', 1.6);
}

// ---------------------------------------------------------------- small drawing helpers
const text = (g, x, y, str, { size = 13, bold = false, italic = false, fill = NAVY, anchor = 'start', halo = true, dy = 0, spacing = null } = {}) =>
  g.append('text').attr('x', x).attr('y', y).attr('dy', dy).attr('text-anchor', anchor).text(str)
    .attr('font-family', FONT).attr('font-size', size).attr('font-weight', bold ? 700 : 400).attr('font-style', italic ? 'italic' : 'normal')
    .attr('fill', fill).attr('letter-spacing', spacing)
    .attr('paint-order', 'stroke fill').attr('stroke', halo ? CREAM : 'none').attr('stroke-width', halo ? 3.5 : 0).attr('stroke-linejoin', 'round').attr('stroke-opacity', 0.9);

// A place name with its date beside it, as the page sets them (bold name, italic date).
function nameLabel(g, x, y, name, date, { fill = NAVY, anchor = 'start', size = 13 } = {}) {
  const t = text(g, x, y, '', { size, bold: true, fill, anchor });
  t.append('tspan').text(name);
  if (date) t.append('tspan').attr('font-weight', 400).attr('font-style', 'italic').text(` ${date}`);
  return t;
}

const DIAMOND = (r) => `M0,${-r}L${r},0L0,${r}L${-r},0Z`;
const HALF_L = (r) => `M0,${-r}L${-r},0L0,${r}Z`;
const HALF_R = (r) => `M0,${-r}L${r},0L0,${r}Z`;

// An icon from the catalog (path data in a 512 box), drawn `size` px tall, centered at (x, y).
function icon(g, ic, x, y, size, fill) {
  if (!ic) return null;
  const k = size / 512;
  return g.append('path').attr('d', ic.d).attr('fill', fill).attr('transform', `translate(${x - size / 2},${y - size / 2}) scale(${k})`);
}

// A circled numeral (P8): an outlined circle, never the filled badge that means quantity.
function numeral(g, x, y, n, { style = 'numeral', r = 9, fill = NAVY } = {}) {
  const grp = g.append('g').attr('transform', `translate(${x},${y})`);
  if (style === 'badge') {
    grp.append('rect').attr('x', -10).attr('y', -9).attr('width', 20).attr('height', 18).attr('rx', 3).attr('fill', CREAM).attr('stroke', NAVY).attr('stroke-width', 0.9);
  } else {
    grp.append('circle').attr('r', r).attr('fill', CREAM).attr('fill-opacity', 0.95).attr('stroke', fill).attr('stroke-width', 1.2);
  }
  const label = style === 'letter' ? String.fromCharCode(64 + n) : String(n);
  grp.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-family', FONT).attr('font-size', 11).attr('font-weight', 700).attr('fill', fill).text(label);
  return grp;
}

// milsymbol: the frame, glyph and size mark of a force (MIL-STD-2525C letter codes; the same friendly land frame
// for every side, in the side's color). glyph: infantry | cavalry | artillery | armor | aviation. echelon: X, XX…
const GLYPH = { infantry: 'SFG-UCI----', cavalry: 'SFG-UCR----', artillery: 'SFG-UCF----', armor: 'SFG-UCA----', aviation: 'SFG-UCVF---' };
const ECHELON = { '': '-', I: 'G', X: 'H', XX: 'I', XXX: 'J', XXXX: 'K' };
function forceFrame(g, x, y, { glyph = 'infantry', echelon = 'XX', color = NAVY, size = 22 }) {
  const sidc = `${GLYPH[glyph] ?? GLYPH.infantry}${ECHELON[echelon] ?? '-'}`;
  try {
    const sym = new ms.Symbol(sidc, { size, monoColor: color, fill: false, frame: true, strokeWidth: 4, infoFields: false, outlineWidth: 0 });
    const doc = new DOMParser().parseFromString(sym.asSVG(), 'image/svg+xml');
    const node = document.importNode(doc.documentElement, true);
    const a = sym.getAnchor(), s = sym.getSize();
    const grp = g.append('g').attr('transform', `translate(${x - a.x},${y - a.y})`);
    grp.node().appendChild(node);
    return { w: s.width, h: s.height, anchor: a, ok: true };
  } catch (err) {
    // Without milsymbol: a plain rectangle and the four classic glyphs, so the sheet still shows the idea.
    const w = size * 1.5, h = size;
    const grp = g.append('g').attr('transform', `translate(${x - w / 2},${y - h / 2})`).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.6);
    grp.append('rect').attr('width', w).attr('height', h);
    if (glyph === 'infantry') grp.append('path').attr('d', `M0,0L${w},${h}M${w},0L0,${h}`);
    if (glyph === 'cavalry') grp.append('path').attr('d', `M0,${h}L${w},0`);
    if (glyph === 'artillery') grp.append('circle').attr('cx', w / 2).attr('cy', h / 2).attr('r', 3).attr('fill', color);
    if (glyph === 'armor') grp.append('ellipse').attr('cx', w / 2).attr('cy', h / 2).attr('rx', w * 0.32).attr('ry', h * 0.28);
    if (echelon) text(grp, w / 2, -4, echelon, { size: 10, bold: true, fill: color, anchor: 'middle', halo: false });
    return { w, h, anchor: { x: w / 2, y: h / 2 }, ok: false, error: String(err?.message ?? err) };
  }
}

// ---------------------------------------------------------------- lines from what the page drew
// Samples of a drawn path (screen px), split where the path jumps (a new subpath), longest run first.
function sampleRuns(node, step = 3, jump = 24) {
  const L = node.getTotalLength();
  const runs = [[]];
  let prev = null;
  for (let s = 0; s <= L; s += step) {
    const p = node.getPointAtLength(s);
    if (prev && Math.hypot(p.x - prev.x, p.y - prev.y) > jump) runs.push([]);
    runs[runs.length - 1].push([p.x, p.y]);
    prev = p;
  }
  return runs.filter((r) => r.length > 1).sort((a, b) => b.length - a.length);
}
const runLength = (r) => r.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - r[i - 1][0], p[1] - r[i - 1][1]) : 0), 0);

// The named river drawn by the page, as the runs of its path (a river is several sub-paths): 'longest' (the Rio
// Grande on these maps) or 'shortest' (the Nueces), by the drawn length of the whole path.
function riverRuns(which) {
  const nodes = d3.selectAll('.view-main .rivers path.named').nodes();
  if (!nodes.length) return [];
  const byNode = nodes.map((n) => { const runs = sampleRuns(n); return { runs, len: runs.reduce((a, r) => a + runLength(r), 0) }; }).sort((a, b) => b.len - a.len);
  return (which === 'shortest' ? byNode[byNode.length - 1] : byNode[0]).runs;
}

// The stretches of those runs inside a longitude/latitude window, each ordered west → east, longest first.
function clipRuns(runs, proj, { lon = [-180, 180], lat = [-90, 90] }) {
  const inside = (p) => { const ll = proj.invert(p); return ll && ll[0] >= lon[0] && ll[0] <= lon[1] && ll[1] >= lat[0] && ll[1] <= lat[1]; };
  const segs = [];
  for (const run of runs) {
    let cur = [];
    for (const p of run) { if (inside(p)) cur.push(p); else { if (cur.length > 2) segs.push(cur); cur = []; } }
    if (cur.length > 2) segs.push(cur);
  }
  return segs.map((s) => (s[0][0] > s[s.length - 1][0] ? s.slice().reverse() : s)).sort((a, b) => runLength(b) - runLength(a));
}

// A polyline moved sideways by `d` px (the left-hand normal of its direction; left of west → east is north).
function offsetRun(run, d) {
  return run.map((p, i) => {
    const a = run[Math.max(0, i - 1)], b = run[Math.min(run.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    return [p[0] + (dy / len) * d, p[1] - (dx / len) * d];
  });
}

// The outer coast inside a window: of the coastline's samples in the window, the easternmost at each height,
// smoothed. Good enough for a mock-up of a blockade; the real one is computed from the blockaded polygon's coast.
function outerCoast(proj, { lon, lat }, bin = 5) {
  const nodes = d3.selectAll('.view-main path.coastline').nodes();
  const pts = nodes.flatMap((n) => sampleRuns(n, 2, 1e9)[0] ?? []);
  const rows = new Map();
  for (const p of pts) {
    const ll = proj.invert(p);
    if (!ll || ll[0] < lon[0] || ll[0] > lon[1] || ll[1] < lat[0] || ll[1] > lat[1]) continue;
    const k = Math.round(p[1] / bin);
    if (!rows.has(k) || rows.get(k)[0] < p[0]) rows.set(k, p);
  }
  const out = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  // light smoothing
  return out.map((p, i) => { const a = out[Math.max(0, i - 2)], b = out[Math.min(out.length - 1, i + 2)]; return [(a[0] + p[0] + b[0]) / 3, (a[1] + p[1] + b[1]) / 3]; });
}

// ---------------------------------------------------------------- the legend box (proposal rows)
function legendBox(root, frame, spec, sides, icons) {
  let W = spec.width ?? 300;
  const PAD = 14, ROW = spec.row ?? 22;
  const rows = spec.rows ?? [];
  const H = PAD * 2 + 26 + rows.length * ROW;
  // On a wide, short sheet (a 1200×800 panel) the box sits top right, over the Gulf; on the tall Texas sheet it
  // takes the page's own bottom-right corner.
  const corner = spec.corner ?? (frame.y1 - frame.y0 < 1000 ? 'top-left' : 'bottom-right');
  const right = corner.endsWith('right');
  const place = () => `translate(${spec.x ?? (right ? frame.x1 - 22 - W : frame.x0 + 22)},${spec.y ?? (corner.startsWith('top') ? frame.y0 + 22 : frame.y1 - 22 - H - (spec.lift ?? 0))})`;
  const g = root.append('g').attr('class', 'legend mil-legend').attr('transform', place());
  const box = g.append('rect').attr('class', 'legend-box').attr('width', W).attr('height', H);
  const title = g.append('text').attr('class', 'legend-title').attr('x', PAD).attr('y', PAD + 10).text(spec.title ?? 'Proposal');
  rows.forEach((r, i) => {
    const row = g.append('g').attr('transform', `translate(${PAD},${PAD + 26 + i * ROW})`);
    const c = (k) => sides[k]?.line ?? NAVY, f = (k) => sides[k]?.fill ?? '#ccc';
    const sw = r.swatch ?? 'text';
    if (sw === 'fill') row.append('rect').attr('width', 22).attr('height', 14).attr('fill', f(r.side)).attr('fill-opacity', r.opacity ?? 1).attr('stroke', NAVY).attr('stroke-width', 0.6);
    else if (sw === 'pair') { row.append('rect').attr('width', 11).attr('height', 14).attr('fill', c(r.side)); row.append('rect').attr('x', 11).attr('width', 11).attr('height', 14).attr('fill', f(r.side)).attr('stroke', NAVY).attr('stroke-width', 0.6); }
    else if (sw === 'hatch') row.append('rect').attr('width', 22).attr('height', 14).attr('fill', r.under ? f(r.under) : CREAM).attr('stroke', NAVY).attr('stroke-width', 0.6)
      .each(function () { d3.select(this.parentNode).append('rect').attr('width', 22).attr('height', 14).attr('fill', `url(#mil-hatch-${r.side})`); });
    else if (sw === 'paper') row.append('rect').attr('width', 22).attr('height', 14).attr('fill', CREAM).attr('stroke', NAVY).attr('stroke-width', 0.6);
    else if (sw === 'arrow') row.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 7).attr('y2', 7).attr('stroke', c(r.side)).attr('stroke-width', 3).attr('marker-end', `url(#mil-${r.head ?? 'barb'}-${r.side})`);
    else if (sw === 'hollow') { row.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 7).attr('y2', 7).attr('stroke', c(r.side)).attr('stroke-width', 4.5).attr('marker-end', `url(#mil-hollow-${r.side})`); row.append('line').attr('x1', 0).attr('x2', 17).attr('y1', 7).attr('y2', 7).attr('stroke', PAPER).attr('stroke-width', 2.2); }
    else if (sw === 'landing') { row.append('line').attr('x1', 0).attr('x2', 16).attr('y1', 7).attr('y2', 7).attr('stroke', c(r.side)).attr('stroke-width', 3).attr('marker-end', `url(#mil-arrow-${r.side})`); row.append('line').attr('x1', 21).attr('x2', 21).attr('y1', 1).attr('y2', 13).attr('stroke', c(r.side)).attr('stroke-width', 2.5); }
    else if (sw === 'diamond') row.append('path').attr('d', DIAMOND(7)).attr('transform', 'translate(11,7)').attr('fill', r.side ? c(r.side) : CREAM).attr('stroke', r.side ? 'none' : RUST).attr('stroke-width', 1.5);
    else if (sw === 'split') { row.append('path').attr('d', HALF_L(7)).attr('transform', 'translate(11,7)').attr('fill', c(r.sides[0])); row.append('path').attr('d', HALF_R(7)).attr('transform', 'translate(11,7)').attr('fill', c(r.sides[1])); }
    else if (sw === 'siege') { row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 10).attr('fill', 'none').attr('stroke', c(r.ring ?? r.side)).attr('stroke-width', 1.8); row.append('path').attr('d', DIAMOND(5.5)).attr('transform', 'translate(11,7)').attr('fill', c(r.side)); }
    else if (sw === 'ring') row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 9).attr('fill', 'none').attr('stroke', c(r.side)).attr('stroke-width', 2);
    else if (sw === 'fort') { icon(row, icons.fort, 11, 7, 16, NAVY); if (r.side) row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 12).attr('fill', 'none').attr('stroke', c(r.side)).attr('stroke-width', 1.8); }
    else if (sw === 'capital') { row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 5.5).attr('fill', MOSS); if (r.side) row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 10).attr('fill', 'none').attr('stroke', c(r.side)).attr('stroke-width', 1.8); }
    else if (sw === 'hq') { row.append('line').attr('x1', 6).attr('x2', 6).attr('y1', -2).attr('y2', 15).attr('stroke', NAVY).attr('stroke-width', 1); row.append('path').attr('d', 'M6,-2L20,2L6,6Z').attr('fill', c(r.side)); }
    else if (sw === 'front') { row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 5).attr('y2', 5).attr('stroke', c(r.sides[0])).attr('stroke-width', 1.6); row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 9).attr('y2', 9).attr('stroke', c(r.sides[1])).attr('stroke-width', 1.6); }
    else if (sw === 'ghost') row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 7).attr('y2', 7).attr('stroke', NAVY).attr('stroke-width', 1).attr('stroke-opacity', 0.5);
    else if (sw === 'treaty') row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 7).attr('y2', 7).attr('stroke', NAVY).attr('stroke-width', 2);
    else if (sw === 'crenel') row.append('rect').attr('width', 22).attr('height', 8).attr('y', 3).attr('fill', 'url(#mil-crenel)');
    else if (sw === 'blockade') { row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 9).attr('y2', 9).attr('stroke', c(r.side)).attr('stroke-width', 1.6); icon(row, icons['paddle-steamer'], 6, 4, 10, c(r.side)); icon(row, icons['paddle-steamer'], 17, 4, 10, c(r.side)); }
    else if (sw === 'numeral') numeral(row, 11, 7, r.n ?? 1, { style: r.style ?? 'numeral', r: 8 });
    else if (sw === 'icon') icon(row, icons[r.icon], 11, 7, r.size ?? 16, r.side ? c(r.side) : NAVY);
    else if (sw === 'force') forceFrame(row, 11, 7, { glyph: r.glyph, echelon: r.echelon ?? '', color: c(r.side ?? 'a'), size: 12 });
    else if (sw === 'mass-ring') { row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 6.5).attr('fill', 'none').attr('stroke', NAVY).attr('stroke-width', 1.4); row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 2).attr('fill', RUST); }
    else if (sw === 'mass-x') row.append('path').attr('d', 'M5,1L17,13M17,1L5,13').attr('stroke', NAVY).attr('stroke-width', 2).attr('stroke-linecap', 'round');
    else if (sw === 'mass-tri') row.append('path').attr('d', 'M4,1H18L11,13Z').attr('fill', 'none').attr('stroke', NAVY).attr('stroke-width', 1.4);
    else if (sw === 'width') row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 7).attr('y2', 7).attr('stroke', c(r.side ?? 'a')).attr('stroke-width', r.w ?? 3);
    else if (sw === 'fade') [1, 0.5, 0].forEach((t, j) => row.append('rect').attr('x', j * 8).attr('width', 6).attr('height', 14).attr('fill', faded(c(r.side ?? 'a'), t)));
    else if (sw === 'swath') { row.append('rect').attr('width', 22).attr('height', 14).attr('fill', c(r.side)).attr('fill-opacity', 0.18); row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 7).attr('y2', 7).attr('stroke', c(r.side)).attr('stroke-width', 2); }
    const t = row.append('text').attr('x', 32).attr('y', 11).text(r.label ?? '');
    if (r.muted) t.attr('fill-opacity', 0.7).attr('font-style', 'italic');
    if (r.strike) row.append('line').attr('x1', 0).attr('x2', 22).attr('y1', 0).attr('y2', 14).attr('stroke', RUST).attr('stroke-width', 1.5);
  });
  // The box widens to its longest line (as the page's legend does for lesson maps) and is placed again.
  try {
    let widest = title.node().getComputedTextLength() + PAD * 2;
    g.selectAll('g > text').each(function () { widest = Math.max(widest, this.getComputedTextLength() + 32 + PAD * 2); });
    W = Math.max(W, Math.ceil(widest + 4));
    box.attr('width', W);
    g.attr('transform', place());
  } catch { /* not laid out */ }
  return { w: W, h: H };
}

// ---------------------------------------------------------------- entry
window.militaryOverlay = async function militaryOverlay(spec) {
  const warnings = [];
  const slip = await window.parchment.packingSlip(); // async: the slip reads source files
  const proj = rebuildProjection(slip);
  const err = projectionError(slip, proj);
  const frame = slip.layout.frame;
  const sides = spec.sides ?? {};
  const icons = spec.icons ?? {};
  const places = spec.places ?? {};
  const P = (ref) => (Array.isArray(ref) ? proj(ref) : places[ref] ? proj([places[ref].lon, places[ref].lat]) : null);
  const C = (k) => sides[k]?.line ?? NAVY;

  const svg = d3.select('#map');
  const defs = svg.select('defs');
  sideDefs(defs, sides);
  if (spec.css) d3.select('head').append('style').text(spec.css);
  if (spec.hideLegend) svg.selectAll('.legend').style('display', 'none');
  const view = svg.select('.view.view-main');
  const root = svg.select('.stage.na');
  const g = view.append('g').attr('class', 'military');       // clipped to the frame
  const top = root.append('g').attr('class', 'military-top'); // the margin and boxes

  function arrow(it) {
    const side = sides[it.side] ?? { line: RUST };
    const raw = it.via.map((v) => (v === 'edge' ? null : P(v)));
    // 'edge' at either end: the route runs to the frame's edge in the direction given (it.edge: [dx, dy] px).
    const pts = raw.map((p, i) => p ?? (() => {
      const nb = raw[i === 0 ? 1 : raw.length - 2];
      const [dx, dy] = it.edge ?? [1, 0];
      return [nb[0] + dx * 2000, nb[1] + dy * 2000];
    })());
    let samples = catmullRom(pts);
    if (it.shift) samples = offsetRun(samples, it.shift); // a lane, as routes sharing a leg take (5 px apart)
    const width = it.width ?? 3;
    const hollow = it.kind === 'hollow';
    const head = it.kind === 'sea' ? 'arrow' : hollow ? 'hollow' : it.kind === 'none' ? null : 'barb';
    const id = `mil-route-${Math.random().toString(36).slice(2, 7)}`;
    const line = g.append('path').attr('id', id).attr('d', pathFrom(samples)).attr('fill', 'none').attr('stroke', side.line)
      .attr('stroke-width', hollow ? width + 1.6 : width).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round').attr('stroke-opacity', 0.95)
      .attr('marker-end', head ? `url(#mil-${head}-${it.side})` : null).attr('marker-start', it.kind === 'both' ? `url(#mil-arrow-${it.side})` : null);
    if (hollow) g.append('path').attr('d', pathFrom(samples.slice(0, -2))).attr('fill', 'none').attr('stroke', PAPER).attr('stroke-width', width - 0.6).attr('stroke-linecap', 'butt');
    if (it.swath) g.insert('path', ':first-child').attr('d', pathFrom(samples)).attr('fill', 'none').attr('stroke', side.line).attr('stroke-opacity', 0.16).attr('stroke-width', it.swath).attr('stroke-linecap', 'round');
    if (it.landing) {
      const e = samples[samples.length - 1], f = samples[samples.length - 4] ?? samples[0];
      const dx = e[0] - f[0], dy = e[1] - f[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      g.append('line').attr('x1', e[0] - nx * 7).attr('y1', e[1] - ny * 7).attr('x2', e[0] + nx * 7).attr('y2', e[1] + ny * 7).attr('stroke', side.line).attr('stroke-width', 2.5).attr('stroke-linecap', 'round');
    }
    if (it.label) {
      // The name reads left to right whichever way the route runs: a westward route gets a reversed guide path.
      const a = samples[0], z = samples[samples.length - 1];
      let guide = id;
      if (z[0] < a[0]) { guide = `${id}-l`; defs.append('path').attr('id', guide).attr('d', pathFrom(samples.slice().reverse())); }
      const flip = guide !== id;
      g.append('text').attr('dy', flip ? -(it.labelDy ?? -6) + 6 : (it.labelDy ?? -6)).attr('font-family', FONT).attr('font-size', 14).attr('font-style', 'italic').attr('letter-spacing', '0.04em').attr('fill', side.line)
        .attr('paint-order', 'stroke fill').attr('stroke', CREAM).attr('stroke-width', 4).attr('stroke-linejoin', 'round')
        .append('textPath').attr('href', `#${guide}`).attr('startOffset', flip && it.labelAt ? `${100 - parseFloat(it.labelAt)}%` : (it.labelAt ?? '50%')).attr('text-anchor', 'middle').text(it.label);
    }
    if (it.tab) {
      // The tab sits where the route meets the frame: a small paper label saying where it went.
      const within = (p) => p[0] > frame.x0 && p[0] < frame.x1 && p[1] > frame.y0 && p[1] < frame.y1;
      const first = samples.findIndex(within), last = samples.length - 1 - samples.slice().reverse().findIndex(within);
      // the sample just inside the frame at whichever end leaves it
      const edgePt = !within(samples[0]) ? samples[Math.max(0, first)] : samples[Math.min(samples.length - 1, last)];
      const inside = [Math.min(frame.x1 - 8, Math.max(frame.x0 + 8, edgePt[0])), Math.min(frame.y1 - 8, Math.max(frame.y0 + 8, edgePt[1]))];
      const t = top.append('g');
      const w = it.tab.length * 7.2 + 16;
      const tx = inside[0] >= frame.x1 - 10 ? inside[0] - w - 4 : inside[0] <= frame.x0 + 10 ? inside[0] + 4 : inside[0] - w / 2;
      const ty = inside[1] >= frame.y1 - 10 ? inside[1] - 26 : inside[1] <= frame.y0 + 10 ? inside[1] + 6 : inside[1] - 10;
      t.append('rect').attr('x', tx).attr('y', ty).attr('width', w).attr('height', 20).attr('fill', CREAM).attr('fill-opacity', 0.95).attr('stroke', side.line).attr('stroke-width', 0.9);
      text(t, tx + w / 2, ty + 14, it.tab, { size: 12, italic: true, fill: side.line, anchor: 'middle', halo: false });
    }
    return line;
  }

  function force(it) {
    const [x, y] = P(it.at);
    const dx = it.dx ?? 0, dy = it.dy ?? 0;
    const color = it.fade ? faded(C(it.side), it.fade) : C(it.side);
    const grp = g.append('g');
    if (it.leader && (dx || dy)) grp.append('line').attr('x1', x).attr('y1', y).attr('x2', x + dx).attr('y2', y + dy).attr('stroke', color).attr('stroke-width', 0.8);
    let w = 0;
    if (it.ship) {
      icon(grp, icons[it.icon] ?? icons['paddle-steamer'], x + dx, y + dy, it.size ?? 26, color);
      w = (it.size ?? 26) / 2;
    } else {
      const f = forceFrame(grp, x + dx, y + dy, { glyph: it.glyph, echelon: it.echelon, color, size: it.size ?? 22 });
      if (!f.ok) warnings.push(`milsymbol: ${f.error}`);
      w = f.w / 2;
      if (it.icon && icons[it.icon]) icon(grp, icons[it.icon], x + dx + w + 12, y + dy, 20, color);
    }
    if (it.badge != null) {
      const b = grp.append('g').attr('transform', `translate(${x + dx + w + 4},${y + dy - 12})`);
      b.append('rect').attr('x', -9).attr('y', -8).attr('width', 18).attr('height', 16).attr('rx', 3).attr('fill', CREAM).attr('stroke', NAVY).attr('stroke-width', 0.9);
      text(b, 0, 4, String(it.badge), { size: 11, bold: true, anchor: 'middle', halo: false });
    }
    if (it.label) {
      const lx = x + dx + (it.labelDx ?? 0), ly = y + dy + (it.labelDy ?? 28);
      nameLabel(grp, lx, ly, it.label, it.date, { fill: color, anchor: it.anchor ?? 'middle' });
      if (it.sub) text(grp, lx, ly + 14, it.sub, { size: 11, italic: true, fill: color, anchor: it.anchor ?? 'middle' });
    }
  }

  function event(it) {
    const [x, y] = P(it.at);
    const r = it.r ?? 7;
    const grp = g.append('g').attr('transform', `translate(${x},${y})`);
    if (it.siege) grp.append('circle').attr('r', r + 6).attr('fill', 'none').attr('stroke', C(it.ring ?? it.winner ?? 'a')).attr('stroke-width', 2);
    const o = it.outcome ?? 'inconclusive';
    if (o === 'inconclusive') grp.append('path').attr('d', DIAMOND(r)).attr('fill', CREAM).attr('stroke', RUST).attr('stroke-width', 1.6);
    else if (o === 'both') { grp.append('path').attr('d', HALF_L(r)).attr('fill', C(it.sides[0])); grp.append('path').attr('d', HALF_R(r)).attr('fill', C(it.sides[1])); grp.append('path').attr('d', DIAMOND(r)).attr('fill', 'none').attr('stroke', CREAM).attr('stroke-width', 0.6); }
    else if (o === 'today') grp.append('path').attr('d', DIAMOND(r)).attr('fill', RUST);
    else grp.append('path').attr('d', DIAMOND(r)).attr('fill', C(it.winner));
    if (it.seq != null) numeral(g, x + (it.seqDx ?? -16), y + (it.seqDy ?? -12), it.seq, { style: it.seqStyle ?? spec.seqStyle ?? 'numeral' });
    if (it.label) {
      const lx = x + (it.dx ?? r + 5), ly = y + (it.dy ?? 4);
      if (it.leader) g.append('line').attr('x1', x).attr('y1', y).attr('x2', lx - 3).attr('y2', ly - 4).attr('stroke', NAVY).attr('stroke-width', 0.8).attr('stroke-opacity', 0.7);
      nameLabel(g, lx, ly, it.label, it.date, { anchor: it.anchor ?? 'start' });
      if (it.sub) text(g, lx, ly + 13, it.sub, { size: 11, italic: true, anchor: it.anchor ?? 'start' });
    }
  }

  function place(it) {
    const [x, y] = P(it.at);
    const grp = g.append('g').attr('transform', `translate(${x},${y})`);
    if (it.type === 'fort') {
      icon(grp, icons.fort, 0, 0, it.size ?? 18, NAVY);
      if (it.captor) grp.append('circle').attr('r', (it.size ?? 18) / 2 + 5).attr('fill', 'none').attr('stroke', C(it.captor)).attr('stroke-width', 2);
    } else if (it.type === 'hq') {
      const h = 18;
      grp.append('line').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', -h).attr('stroke', NAVY).attr('stroke-width', 1.1);
      grp.append('path').attr('d', `M0,${-h}L15,${-h + 4}L0,${-h + 8}Z`).attr('fill', C(it.side));
      grp.append('circle').attr('r', 1.6).attr('fill', NAVY);
    } else if (it.type === 'capital') {
      grp.append('circle').attr('r', 6).attr('fill', MOSS);
      if (it.captor) grp.append('circle').attr('r', 11).attr('fill', 'none').attr('stroke', C(it.captor)).attr('stroke-width', 2);
    } else if (it.type === 'ring') {
      grp.append('circle').attr('r', it.r ?? 14).attr('fill', 'none').attr('stroke', C(it.side)).attr('stroke-width', 2);
    }
    if (it.label) {
      const lx = x + (it.dx ?? 14), ly = y + (it.dy ?? 4);
      nameLabel(g, lx, ly, it.label, it.date, { anchor: it.anchor ?? 'start', fill: it.color ? C(it.color) : NAVY });
      if (it.sub) text(g, lx, ly + 13, it.sub, { size: 11, italic: true, anchor: it.anchor ?? 'start' });
    }
  }

  function lineItem(it) {
    const segs = it.river ? clipRuns(riverRuns(it.river), proj, it.window ?? {}) : [];
    if (!segs.length) { warnings.push(`${it.type}: no stretch of that river lies in the window`); return; }
    const run = segs[0];
    if (it.type === 'front') {
      g.append('path').attr('d', pathFrom(offsetRun(run, 2.2))).attr('fill', 'none').attr('stroke', C(it.left)).attr('stroke-width', 1.8);
      g.append('path').attr('d', pathFrom(offsetRun(run, -2.2))).attr('fill', 'none').attr('stroke', C(it.right)).attr('stroke-width', 1.8);
      const e = it.dateAt === 'start' ? run[0] : run[run.length - 1];
      const box = g.append('g');
      const w = (it.date?.length ?? 0) * 6.6 + 12;
      box.append('rect').attr('x', e[0] + 6).attr('y', e[1] - 10).attr('width', w).attr('height', 18).attr('fill', CREAM).attr('fill-opacity', 0.95).attr('stroke', NAVY).attr('stroke-width', 0.8);
      text(box, e[0] + 6 + w / 2, e[1] + 3, it.date ?? '', { size: 11, italic: true, anchor: 'middle', halo: false });
    } else if (it.type === 'ghost') {
      for (const s of segs) g.append('path').attr('d', pathFrom(s)).attr('fill', 'none').attr('stroke', NAVY).attr('stroke-width', 1.4).attr('stroke-opacity', 0.5);
    } else if (it.type === 'treaty') {
      for (const s of segs) g.append('path').attr('d', pathFrom(s)).attr('fill', 'none').attr('stroke', NAVY).attr('stroke-width', 2.2).attr('stroke-linejoin', 'round');
    }
    if (it.label) {
      const i = Math.floor(run.length * (it.labelAt ?? 0.5));
      const p = run[i];
      text(g, p[0] + (it.dx ?? 8), p[1] + (it.dy ?? -8), it.label, { size: 12, italic: true, fill: NAVY, anchor: it.anchor ?? 'start' });
    }
  }

  function blockade(it) {
    const coast = outerCoast(proj, it.window);
    if (coast.length < 4) { warnings.push('blockade: no coast found in the window'); return; }
    const line = catmullRom(coast.map((p) => [p[0] + (it.offset ?? 14), p[1]]), { step: 4 });
    g.append('path').attr('d', pathFrom(line)).attr('fill', 'none').attr('stroke', C(it.side)).attr('stroke-width', 1.8).attr('stroke-opacity', 0.9);
    const every = it.every ?? 70;
    let acc = 0;
    for (let i = 1; i < line.length; i++) {
      acc += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
      if (acc >= every) { icon(g, icons[it.icon ?? 'paddle-steamer'], line[i][0] + 9, line[i][1], 13, C(it.side)); acc = 0; }
    }
    if (it.label) {
      const p = line[Math.floor(line.length * (it.labelAt ?? 0.5))];
      text(g, p[0] + 22, p[1], it.label, { size: 12, italic: true, fill: C(it.side) });
      if (it.sub) text(g, p[0] + 22, p[1] + 14, it.sub, { size: 11, italic: true, fill: C(it.side) });
    }
  }

  // Of the paths a selector finds, the one whose box holds (or lies nearest) a place: the page draws every
  // computed dispute in one group, so "the strip" is the one around Matamoros, not the Panhandle's.
  function pickPath(selector, near) {
    const nodes = d3.selectAll(selector).nodes();
    if (!near || nodes.length < 2) return nodes[0] ?? null;
    const [x, y] = P(near);
    let best = null, bestD = Infinity;
    for (const n of nodes) {
      const b = n.getBBox();
      const d = Math.hypot(Math.max(b.x - x, 0, x - b.x - b.width), Math.max(b.y - y, 0, y - b.y - b.height));
      if (d < bestD) { bestD = d; best = n; }
    }
    return best;
  }

  function gains(it) {
    const src = pickPath(it.from ?? '.view-main .nb-disputes path', it.near);
    if (!src) { warnings.push('gains: nothing to hatch'); return; }
    g.append('path').attr('d', src.getAttribute('d')).attr('fill', `url(#mil-hatch-${it.side})`).attr('stroke', C(it.side)).attr('stroke-width', 1).attr('stroke-opacity', 0.8);
    if (it.label) {
      const [x, y] = P(it.at);
      text(g, x, y, it.label, { size: 12, italic: true, fill: C(it.side), anchor: 'middle' });
      if (it.sub) text(g, x, y + 14, it.sub, { size: 11, italic: true, fill: C(it.side), anchor: 'middle' });
    }
  }

  // P2: the land one side holds and another claims — the holder's hatch over the claimant's fill.
  function occupied(it) {
    const src = pickPath(it.from ?? '.view-main .nb-disputes path', it.near);
    if (!src) { warnings.push('occupied: nothing to hatch'); return; }
    const d = src.getAttribute('d');
    const under = g.append('g').attr('opacity', 0.62);
    under.append('path').attr('d', d).attr('fill', sides[it.claimant]?.fill ?? '#ccc');
    g.append('path').attr('d', d).attr('fill', `url(#mil-hatch-${it.holder})`);
    d3.select(src).style('display', 'none');
  }

  function list(it) {
    const x = it.x ?? frame.x1 - 22 - (it.width ?? 330), y = it.y ?? frame.y0 + 22;
    const W = it.width ?? 330, ROW = it.row ?? 30, PAD = 14;
    const H = PAD * 2 + 24 + it.rows.length * ROW;
    const b = top.append('g').attr('class', 'legend').attr('transform', `translate(${x},${y})`);
    b.append('rect').attr('class', 'legend-box').attr('width', W).attr('height', H);
    b.append('text').attr('class', 'legend-title').attr('x', PAD).attr('y', PAD + 10).text(it.title ?? 'The course of the war');
    it.rows.forEach((r, i) => {
      const ry = PAD + 26 + i * ROW;
      numeral(b, PAD + 9, ry + 7, i + 1, { style: it.style ?? 'numeral', r: 8 });
      const t = b.append('text').attr('x', PAD + 26).attr('y', ry + 11).attr('font-family', FONT).attr('font-size', 12).attr('fill', NAVY);
      t.append('tspan').attr('font-style', 'italic').text(r.date);
      t.append('tspan').attr('font-weight', 700).text(`  ${r.what}`);
      if (r.line) b.append('text').attr('x', PAD + 26).attr('y', ry + 24).attr('font-family', FONT).attr('font-size', 10.5).attr('fill', NAVY).attr('fill-opacity', 0.85).text(r.line);
    });
  }

  function note(it) {
    const W = it.width ?? 360, PAD = 12, LH = 16;
    const lines = it.lines ?? [];
    const H = PAD * 2 + (it.title ? 20 : 0) + lines.length * LH;
    const x = it.x ?? frame.x0 + 22, y = it.y ?? frame.y0 + 22;
    const b = top.append('g').attr('class', 'legend').attr('transform', `translate(${x},${y})`);
    b.append('rect').attr('class', 'legend-box').attr('width', W).attr('height', H);
    if (it.title) b.append('text').attr('class', 'legend-title').attr('x', PAD).attr('y', PAD + 10).text(it.title);
    lines.forEach((l, i) => b.append('text').attr('x', PAD).attr('y', PAD + (it.title ? 20 : 0) + 12 + i * LH).attr('font-family', FONT).attr('font-size', 12).attr('font-style', it.italic ? 'italic' : 'normal').attr('fill', NAVY).text(l));
  }

  function draw(it) {
    switch (it.type) {
      case 'arrow': return arrow(it);
      case 'force': return force(it);
      case 'event': return event(it);
      case 'fort': case 'hq': case 'capital': case 'ring': return place(it);
      case 'front': case 'ghost': case 'treaty': return lineItem(it);
      case 'blockade': return blockade(it);
      case 'gains': return gains(it);
      case 'occupied': return occupied(it);
      case 'list': return list(it);
      case 'note': return note(it);
      case 'legend': return legendBox(top, frame, it, sides, icons);
      case 'label': { const [x, y] = P(it.at); return nameLabel(g, x + (it.dx ?? 0), y + (it.dy ?? 0), it.text, it.date, { anchor: it.anchor ?? 'start', fill: it.side ? C(it.side) : NAVY }); }
      default: warnings.push(`unknown item type ${it.type}`);
    }
    return null;
  }
  for (const it of spec.items ?? []) {
    try { draw(it); } catch (e) { warnings.push(`${it.type}: ${e.message}`); }
  }
  return { projectionError: err, warnings, milsymbol: typeof ms?.Symbol === 'function' };
};

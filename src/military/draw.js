// Parchment — the Military layer: what it draws beyond fills (milestone 2). D3 on the page's SVG.
//   decorateMarks: the event marks drawMarks placed, colored by outcome (P5), ringed for a siege or a capture (P6),
//                  with their circled numerals (P8);
//   drawCourseList: the numbered list in the margin;
//   drawWarStrip: the war's own timeline under the map (P10), which stands in for the stage's strip.
// Colors come from the side tokens (src/tokens.css); nothing here invents a color or a shape beyond the brief's.

import * as d3 from 'd3';
import { eventLook, courseList, eventDate, eventFirst, eventLast, fmtWhen, forceBars } from './events.js';
import { toInt } from './wars.js';
import { smoothRun, thinRun } from './lines.js';
import { faded } from './sides.js';

const NAVY = '#1F2A44', RUST = '#C8601A', CREAM = '#F7F5EF', GOLD = '#c8a65d';
const HALF_L = (r) => `M0,${-r}L${-r},0L0,${r}Z`;
const HALF_R = (r) => `M0,${-r}L${r},0L0,${r}Z`;

const cssColor = (k) => (typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement).getPropertyValue(`--side-${k}-line`).trim() : '') || NAVY;
export const lineColorOf = (color) => ({ line: cssColor(color) });

// An icon from the catalog (path data in a 512 box), `size` px tall, centered at (x, y). icons: { key → { d, viewBox } }.
export function iconAt(g, icons, key, x, y, size, fill) {
  const ic = icons?.[key];
  if (!ic) return null;
  const k = size / 512;
  return g.append('path').attr('class', `mil-icon icon-${key}`).attr('d', ic.d).attr('fill', fill).attr('transform', `translate(${x - size / 2},${y - size / 2}) scale(${k})`);
}

// placed: [{ r, x, y, radius }] from drawMarks. Returns the boxes of the numerals, for the label pass to keep clear of.
// icons: the catalog's path data, for the fort mark (P6: one navy mark in every era, the owner's star fort).
export function decorateMarks(layer, placed, war, icons = {}) {
  const boxes = [];
  const taken = [];
  const groups = layer.selectAll('g.mark-group').nodes();
  const byId = new Map(groups.map((n) => [d3.select(n).datum()?.r?.id, n]));
  for (const m of placed) {
    const r = m.r;
    if (r.tracker !== 'military') continue;
    const node = byId.get(r.id);
    if (!node) continue;
    const g = d3.select(node);
    g.selectAll('.mil').remove();
    const look = eventLook(r, war);
    const path = g.select('path.mark');
    const rad = m.radius;
    if (look.form === 'diamond') {
      if (look.winner) path.style('fill', cssColor(look.winner.color)).style('stroke', null);
      else if (look.claimed.length === 2) {
        path.style('fill', 'none').style('stroke', 'none');
        g.append('path').attr('class', 'mil mil-half').attr('d', HALF_L(rad)).attr('fill', cssColor(look.claimed[0].color));
        g.append('path').attr('class', 'mil mil-half').attr('d', HALF_R(rad)).attr('fill', cssColor(look.claimed[1].color));
        g.append('path').attr('class', 'mil').attr('d', `M0,${-rad}L${rad},0L0,${rad}L${-rad},0Z`).attr('fill', 'none').attr('stroke', CREAM).attr('stroke-width', 0.6);
      } else if (look.outcome?.kind === 'inconclusive') path.style('fill', CREAM).style('stroke', RUST).style('stroke-width', 1.6);
      // (no outcome recorded: the rust diamond as on every other layer)
    }
    if (look.form === 'fort' && icons.fort) {
      // the star fort in navy stands in for the square the other layers would draw
      path.style('display', 'none');
      iconAt(g, icons, 'fort', 0, 0, 20, NAVY).attr('class', 'mil mil-fort');
    } else if (look.form === 'hq') {
      path.style('display', 'none');
      const h = 18;
      g.append('line').attr('class', 'mil').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', -h).attr('stroke', NAVY).attr('stroke-width', 1.1);
      g.append('path').attr('class', 'mil').attr('d', `M0,${-h}L14,${-h + 4}L0,${-h + 8}Z`).attr('fill', look.ring ? cssColor(look.ring.color) : NAVY);
      g.append('circle').attr('class', 'mil').attr('r', 1.6).attr('fill', NAVY);
    }
    if (look.ring && look.form !== 'hq') g.insert('circle', ':first-child').attr('class', 'mil mil-ring').attr('r', rad + 5).attr('fill', 'none').attr('stroke', cssColor(look.ring.color)).attr('stroke-width', 2);
    if (r.seq != null) {
      // the numeral: an outlined circle beside the mark, at the first of eight places that is clear of other numerals
      const R = 8.5, d = rad + R + 1;
      const spots = [[d, -d], [-d, -d], [d, d], [-d, d], [d + 6, 0], [-d - 6, 0], [0, -d - 6], [0, d + 6]];
      let at = spots[0];
      for (const s of spots) {
        const box = { x: m.x + s[0] - R, y: m.y + s[1] - R, w: 2 * R, h: 2 * R };
        if (!taken.some((t) => t.x < box.x + box.w && box.x < t.x + t.w && t.y < box.y + box.h && box.y < t.y + t.h)) { at = s; break; }
      }
      const n = g.append('g').attr('class', 'mil mil-seq').attr('transform', `translate(${at[0]},${at[1]})`);
      n.append('circle').attr('r', R).attr('fill', CREAM).attr('fill-opacity', 0.96).attr('stroke', NAVY).attr('stroke-width', 1.1);
      n.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-size', 10.5).attr('font-weight', 700).attr('fill', NAVY).text(String(r.seq));
      const box = { x: m.x + at[0] - R - 1, y: m.y + at[1] - R - 1, w: 2 * R + 2, h: 2 * R + 2 };
      taken.push(box);
      boxes.push(box);
    }
  }
  return boxes;
}

// The margin list (P8). corner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; `lift` px above the frame's
// bottom for a bottom corner (to clear the legend). → { x, y, w, h } or null when nothing is numbered.
export function drawCourseList(root, { x0, y0, x1, y1 }, events, war, { corner = 'top-right', lift = 0, title = 'The course of the war', width = 330 } = {}) {
  root.selectAll('g.course-list').remove();
  const rows = courseList(events, war);
  if (!rows.length) return null;
  const PAD = 12, ROW = 17, W = width;
  const H = PAD * 2 + 22 + rows.length * ROW;
  const x = corner.endsWith('left') ? x0 + 22 : x1 - 22 - W;
  const y = corner.startsWith('top') ? y0 + 22 : y1 - 22 - H - lift;
  const g = root.append('g').attr('class', 'course-list legend').attr('transform', `translate(${x},${y})`);
  g.append('rect').attr('class', 'legend-box').attr('width', W).attr('height', H);
  g.append('text').attr('class', 'legend-title').attr('x', PAD).attr('y', PAD + 10).text(title);
  rows.forEach((row, i) => {
    const ry = PAD + 24 + i * ROW;
    const n = g.append('g').attr('transform', `translate(${PAD + 8},${ry + 4})`);
    n.append('circle').attr('r', 7).attr('fill', CREAM).attr('stroke', NAVY).attr('stroke-width', 0.9);
    n.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-size', 9).attr('font-weight', 700).attr('fill', NAVY).text(String(row.n));
    const t = g.append('text').attr('class', 'course-row').attr('x', PAD + 22).attr('y', ry + 8).attr('font-size', 11);
    t.append('tspan').attr('class', 'course-date').text(row.date);
    t.append('tspan').attr('class', 'course-what').attr('dx', 5).text(row.label);
    if (row.outcome) t.append('tspan').attr('class', 'course-outcome').attr('dx', 4).text(`· ${row.outcome}`);
    if (row.off) t.append('tspan').attr('class', 'course-outcome').attr('dx', 4).text('· off this map');
  });
  // widen to the longest line
  try {
    let widest = W;
    g.selectAll('text.course-row').each(function () { widest = Math.max(widest, this.getComputedTextLength() + PAD * 2 + 22 + 4); });
    if (widest > W) {
      g.select('rect').attr('width', Math.ceil(widest));
      const nx = corner.endsWith('left') ? x : x1 - 22 - Math.ceil(widest);
      g.attr('transform', `translate(${nx},${y})`);
      return { x: nx, y, w: Math.ceil(widest), h: H };
    }
  } catch { /* not laid out */ }
  return { x, y, w: W, h: H };
}

// The computed lines (P7; src/military/lines.js): a blockade just offshore in the blockading side's color with small
// hull marks along it; a treaty or armistice line in navy; a ghost border in navy at half strength; each named along
// its longest run. lines: [{ id, kind, color, label, runs }]. Drawn under the routes and marks.
export function drawLines(layer, defs, lines, icons = {}) {
  layer.selectAll('*').remove();
  defs.selectAll('path.mil-line-guide').remove();
  for (const l of lines) {
    const g = layer.append('g').attr('class', `mil-line ${l.kind}`);
    const stroke = l.kind === 'blockade' ? cssColor(l.color) : NAVY;
    const width = l.kind === 'treaty' || l.kind === 'armistice' ? 2.2 : l.kind === 'ghost' ? 1.4 : 1.8;
    const opacity = l.kind === 'ghost' ? 0.5 : 0.95;
    for (const run of l.runs) {
      g.append('path').attr('d', pathOf(run)).attr('fill', 'none').attr('stroke', stroke).attr('stroke-width', width).attr('stroke-opacity', opacity).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
      if (l.kind === 'blockade') {
        // ship marks every so often: the reviewed ship icon of the line's `tech` (a paddle steamer in 1846), else a
        // small half-disc hull on the line
        let acc = 40;
        for (let i = 1; i < run.length; i++) {
          acc += Math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]);
          if (acc >= 90) {
            if (l.tech && icons[l.tech]) iconAt(g, icons, l.tech, run[i][0], run[i][1] - 6, 13, stroke);
            else g.append('path').attr('d', 'M-4,0A4,4 0 0 0 4,0Z').attr('transform', `translate(${run[i][0]},${run[i][1]})`).attr('fill', stroke).attr('fill-opacity', 0.9);
            acc = 0;
          }
        }
      }
    }
    if (l.label && l.runs.length) {
      // the name follows a smoothed copy of the longest run (a border along a river bends at every meander)
      const longest = l.runs.reduce((a, b) => (runLen(b) > runLen(a) ? b : a));
      const guideId = `mil-line-${l.id}`;
      const ordered = longest[0][0] > longest[longest.length - 1][0] ? longest.slice().reverse() : longest;
      const pts = smoothRun(thinRun(ordered, 6), 8);
      defs.append('path').attr('class', 'mil-line-guide').attr('id', guideId).attr('d', pathOf(pts));
      g.append('text').attr('class', `mil-line-label ${l.kind}`).attr('dy', -6).attr('font-size', 12).attr('font-style', 'italic').attr('fill', stroke).attr('fill-opacity', l.kind === 'ghost' ? 0.75 : 1)
        .attr('paint-order', 'stroke fill').attr('stroke', CREAM).attr('stroke-width', 3.5).attr('stroke-linejoin', 'round')
        .append('textPath').attr('href', `#${guideId}`).attr('startOffset', '50%').attr('text-anchor', 'middle').text(l.label);
    }
  }
}
const pathOf = (pts) => (pts.length ? `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}` : '');
const runLen = (r) => r.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - r[i - 1][0], p[1] - r[i - 1][1]) : 0), 0);

// ---------- force marks (brief §3; milestone 5) ----------
// milsymbol (vendored, MIT; loaded by the page as a script, globalThis.ms): the frame, glyph and size mark of a
// force in MIL-STD-2525C letter codes, the same friendly land frame for every side, in the side's color. Without
// the library a plain rectangle with the four classic glyphs stands in, so the map never goes blank.
const GLYPH = { infantry: 'SFG-UCI----', cavalry: 'SFG-UCR----', artillery: 'SFG-UCF----', armor: 'SFG-UCA----', aviation: 'SFG-UCVF---', naval: 'SFG-UCI----' };
const ECHELON = { '': '-', I: 'G', X: 'H', XX: 'I', XXX: 'J', XXXX: 'K' };
export function forceFrame(g, x, y, { glyph = 'infantry', echelon = 'XX', color = NAVY, size = 22 } = {}) {
  const ms = globalThis.ms;
  const sidc = `${GLYPH[glyph] ?? GLYPH.infantry}${ECHELON[echelon] ?? '-'}`;
  if (ms?.Symbol) {
    try {
      const sym = new ms.Symbol(sidc, { size, monoColor: color, fill: false, frame: true, strokeWidth: 4, infoFields: false, outlineWidth: 0 });
      const doc = new DOMParser().parseFromString(sym.asSVG(), 'image/svg+xml');
      const node = document.importNode(doc.documentElement, true);
      const a = sym.getAnchor(), s = sym.getSize();
      g.append('g').attr('class', 'mil-frame').attr('transform', `translate(${x - a.x},${y - a.y})`).node().appendChild(node);
      return { w: s.width, h: s.height, ok: true };
    } catch { /* fall through to the plain frame */ }
  }
  const w = size * 1.5, h = size;
  const grp = g.append('g').attr('class', 'mil-frame plain').attr('transform', `translate(${x - w / 2},${y - h / 2})`).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.6);
  grp.append('rect').attr('width', w).attr('height', h);
  if (glyph === 'infantry') grp.append('path').attr('d', `M0,0L${w},${h}M${w},0L0,${h}`);
  if (glyph === 'cavalry') grp.append('path').attr('d', `M0,${h}L${w},0`);
  if (glyph === 'artillery') grp.append('circle').attr('cx', w / 2).attr('cy', h / 2).attr('r', 3).attr('fill', color);
  if (glyph === 'armor') grp.append('ellipse').attr('cx', w / 2).attr('cy', h / 2).attr('rx', w * 0.32).attr('ry', h * 0.28);
  if (echelon) grp.append('text').attr('x', w / 2).attr('y', -3).attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 700).attr('fill', color).attr('stroke', 'none').text(echelon);
  return { w: w + 8, h: h + 12, ok: false };
}

// Force marks on the sheet (P4 included): each force at its stand on the date, a hairline back to the exact place,
// the frame in the side's color with the equipment icon beside it when the catalog allows it on that date, the
// label below; earlier stands as smaller frames in lighter steps, earliest lightest. positions: forcePositions;
// checks: { forceId → techFor result }. Returns the boxes drawn, for the label pass to keep clear of.
export function drawForceMarks(layer, positions, proj, { icons = {}, checks = {}, box = null } = {}) {
  layer.selectAll('*').remove();
  const boxes = [];
  const inBox = (p) => !box || (p[0] >= box[0] && p[0] <= box[0] + box[2] && p[1] >= box[1] && p[1] <= box[1] + box[3]);
  for (const pos of positions) {
    const f = pos.force;
    const color = cssColor(f.sideColor ?? 'a');
    // earlier stands (P4): lighter the earlier
    pos.earlier.forEach((e, i) => {
      const xy = proj(e.at);
      if (!xy || !inBox(xy)) return;
      const t = 1 - (i + 1) / (pos.earlier.length + 1); // 1 = earliest
      const g = layer.append('g').attr('class', 'mil-force earlier').attr('opacity', 0.95);
      forceFrame(g, xy[0] + 12, xy[1] - 12, { glyph: f.type, echelon: f.echelon ?? '', color: faded(color, 0.35 + 0.5 * t), size: 15 });
      g.append('title').text(`${f.label}: ${e.label}, to ${e.date}`);
    });
    const xy = proj(pos.at);
    if (!xy || !inBox(xy)) continue;
    const g = layer.append('g').attr('class', 'mil-force');
    // several forces at one place (two armies met at a battle) stack: the first at the usual offset, the next
    // below, then above, then farther, until the frame and label touch no earlier force's box
    const strengthText = f.strength?.text ? f.strength.text.split(';')[0].replace(/ at .*$/, '') : '';
    const labelW = (f.label.length + (strengthText ? strengthText.length + 3 : 0)) * 6.4;
    const need = { w: Math.max(labelW, 60) + 4, h: 22 + 22 };
    const free = (bx, by) => !boxes.some((b) => bx < b.x + b.w + 4 && bx + need.w > b.x - 4 && by < b.y + b.h + 4 && by + need.h > b.y - 4);
    const fx = xy[0] + 16;
    let fy = xy[1] - 18;
    for (const dy of [0, 46, -46, 92, -92, 138, -138]) {
      const ty = xy[1] - 18 + dy;
      if (free(fx - need.w / 2, ty - 13)) { fy = ty; break; }
    }
    g.append('line').attr('x1', xy[0]).attr('y1', xy[1]).attr('x2', fx - 6).attr('y2', fy + 6).attr('stroke', color).attr('stroke-width', 0.8).attr('stroke-opacity', 0.8);
    g.append('circle').attr('cx', xy[0]).attr('cy', xy[1]).attr('r', 2).attr('fill', color);
    const fr = forceFrame(g, fx, fy, { glyph: f.type, echelon: f.echelon ?? '', color, size: 22 });
    let right = fx + fr.w / 2;
    const check = checks[f.id];
    if (check?.ok && icons[check.key]) { iconAt(g, icons, check.key, right + 12, fy, 20, color); right += 24; }
    const label = g.append('text').attr('class', 'mil-force-label').attr('x', fx).attr('y', fy + fr.h / 2 + 12).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 700).attr('fill', color)
      .attr('paint-order', 'stroke fill').attr('stroke', CREAM).attr('stroke-width', 3).attr('stroke-linejoin', 'round');
    label.append('tspan').text(f.label);
    if (strengthText) label.append('tspan').attr('font-weight', 400).attr('font-style', 'italic').attr('font-size', 10).text(` · ${strengthText}`);
    g.append('title').text(`${f.commander ?? f.label}${f.strength?.text ? ` · ${f.strength.text}` : ''}${check?.key ? ` · ${check.key}${check.ok ? '' : ` (${check.why})`}` : ''}`);
    const w = Math.max(right - (fx - fr.w / 2), labelW, 60);
    boxes.push({ x: fx - Math.max(labelW, fr.w) / 2 - 2, y: fy - fr.h / 2 - 2, w: w + 4, h: fr.h + 18 });
  }
  return boxes;
}

// A route that leaves the frame stops at its edge with a tab saying where it went (P3). drawn: from drawRoutes;
// box: the main view's [x, y, w, h]. Tabs go in the labels layer, above everything.
export function drawEdgeTabs(layer, drawn, box) {
  layer.selectAll('g.edge-tab').remove();
  const [bx, by, bw, bh] = box;
  const inside = (p) => p[0] > bx + 1 && p[0] < bx + bw - 1 && p[1] > by + 1 && p[1] < by + bh - 1;
  const seen = new Set();
  for (const d of drawn) {
    const r = d.r;
    if (r.tracker !== 'military' || !d.end || seen.has(r.id)) continue;
    const s = d.samples;
    if (!s.length || inside(s[s.length - 1])) continue;
    // the last sample inside the frame before the line leaves it
    let i = s.length - 1;
    while (i > 0 && !inside(s[i])) i--;
    if (i === 0) continue;
    seen.add(r.id);
    const p = s[i];
    const to = r.placeNames?.[r.placeNames.length - 1] ?? r.waypoints?.[r.waypoints.length - 1] ?? '';
    const text = `to ${to}`;
    const w = text.length * 6.2 + 14, h = 18;
    const tx = Math.min(bx + bw - w - 4, Math.max(bx + 4, p[0] - w / 2));
    const ty = p[1] >= by + bh - 12 ? p[1] - h - 6 : p[1] <= by + 12 ? p[1] + 6 : p[1] - h / 2;
    const g = layer.append('g').attr('class', `edge-tab ${d.style.color}`);
    g.append('rect').attr('x', tx).attr('y', Math.min(by + bh - h - 2, Math.max(by + 2, ty))).attr('width', w).attr('height', h).attr('stroke', cssColor(r.sideColor ?? 'a'));
    g.append('text').attr('x', tx + w / 2).attr('y', Math.min(by + bh - h - 2, Math.max(by + 2, ty)) + 13).attr('text-anchor', 'middle').attr('fill', cssColor(r.sideColor ?? 'a')).text(text);
  }
}

// The war strip (P10) in the band under the frame where the stage's strip sits: the war's span with year and month
// ticks, members' bars above the line, each force's campaign as a thinner bar below them, events as small marks in
// the victor's color (treaties as navy triangles), and the shown date marked. events, moves: every one of the war's
// (the strip shows the whole war, the map the date).
export function drawWarStrip(root, { x0, x1, y1 }, { war, members, events, moves = [], date }) {
  root.selectAll('g.war-strip').remove();
  if (!war) return;
  const g = root.append('g').attr('class', 'war-strip');
  const t0 = toInt(war.start), t1 = toInt(war.end, true);
  const days = (d) => { const y = Math.floor(d / 10000), m = Math.floor((d % 10000) / 100), dd = d % 100; return Date.UTC(y, m - 1, dd) / 864e5; };
  const x = d3.scaleLinear().domain([days(t0), days(t1)]).range([x0 + 10, x1 - 10]).clamp(true);
  const base = y1 + 24;
  // members: a thin bar per member, side's color, stacked above the line
  const mem = members.filter((m) => war.sides.some((s) => s.id === m.side));
  mem.forEach((m, i) => {
    const side = war.sides.find((s) => s.id === m.side);
    const a = Math.max(days(eventFirst(m)), days(t0)), b = Math.min(days(eventLast(m)), days(t1));
    g.append('rect').attr('x', x(a)).attr('y', base - 21 - i * 5).attr('width', Math.max(2, x(b) - x(a))).attr('height', 3).attr('rx', 1).attr('fill', cssColor(side.color)).append('title').text(`${m.label}: ${eventDate(m)}`);
  });
  // forces: one hairline bar each, in lanes by side, between the members' bars and the line
  const bars = forceBars(moves);
  const lanes = new Map();
  bars.forEach((b) => {
    const key = b.sideColor ?? 'x';
    const lane = lanes.get(key) ?? [];
    let row = lane.findIndex((end) => end < days(b.first));
    if (row < 0) { row = lane.length; lane.push(0); }
    lane[row] = days(b.last) + 10;
    lanes.set(key, lane);
    const sideIndex = Math.max(0, war.sides.findIndex((s) => s.color === b.sideColor));
    const y = base - 10 + sideIndex * 3.5 + row * 1.6;
    const a = Math.max(days(b.first), days(t0)), e = Math.min(days(b.last), days(t1));
    g.append('rect').attr('x', x(a)).attr('y', y).attr('width', Math.max(3, x(e) - x(a))).attr('height', 1.4).attr('fill', cssColor(b.sideColor ?? 'a')).attr('fill-opacity', 0.9)
      .append('title').text(`${b.label}: ${fmtWhen({ year: Math.floor(b.first / 10000), month: Math.floor((b.first % 10000) / 100), day: b.first % 100 })} – ${fmtWhen({ year: Math.floor(b.last / 10000), month: Math.floor((b.last % 10000) / 100), day: b.last % 100 })}`);
  });
  g.append('line').attr('class', 'baseline').attr('x1', x0).attr('x2', x1).attr('y1', base).attr('y2', base).attr('stroke', NAVY).attr('stroke-width', 1.2);
  // ticks: a month every month, a year named
  const y0 = Math.floor(t0 / 10000), y1y = Math.floor(t1 / 10000);
  for (let y = y0; y <= y1y + 1; y++) for (let m = 1; m <= 12; m++) {
    const d = y * 10000 + m * 100 + 1;
    if (d < t0 || d > t1) continue;
    const major = m === 1;
    g.append('line').attr('x1', x(days(d))).attr('x2', x(days(d))).attr('y1', base).attr('y2', base + (major ? 9 : 4)).attr('stroke', NAVY).attr('stroke-width', major ? 1 : 0.6);
    if (major) g.append('text').attr('class', 'tick-label').attr('x', x(days(d))).attr('y', base + 22).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', NAVY).text(String(y));
  }
  // events
  for (const r of events) {
    const look = eventLook(r, war);
    const ex = x(days(eventFirst(r)));
    const e = g.append('g').attr('transform', `translate(${ex},${base})`);
    if (look.form === 'triangle') e.append('path').attr('d', 'M0,-6L5,4H-5Z').attr('fill', NAVY);
    else if (look.form === 'capital') e.append('circle').attr('r', 3.5).attr('fill', '#499737');
    else if (look.form === 'diamond') {
      const fill = look.winner ? cssColor(look.winner.color) : look.claimed.length === 2 ? cssColor(look.claimed[0].color) : RUST;
      if (look.outcome?.kind === 'inconclusive') e.append('path').attr('d', 'M0,-5L5,0L0,5L-5,0Z').attr('fill', CREAM).attr('stroke', RUST).attr('stroke-width', 1.2);
      else {
        e.append('path').attr('d', 'M0,-5L5,0L0,5L-5,0Z').attr('fill', fill);
        if (look.claimed.length === 2) e.append('path').attr('d', 'M0,-5L5,0L0,5Z').attr('fill', cssColor(look.claimed[1].color));
      }
    } else e.append('circle').attr('r', 3).attr('fill', NAVY);
    e.append('title').text(`${r.label} · ${eventDate(r)}`);
  }
  // the shown date (its label kept inside the sheet at either end of the war)
  const sd = Math.max(days(t0), Math.min(days(t1), days(date)));
  const mk = g.append('g').attr('class', 'marker').attr('transform', `translate(${x(sd)},${base})`);
  mk.append('path').attr('d', 'M0,-9L8,0L0,9L-8,0Z').attr('fill', GOLD).attr('stroke', NAVY).attr('stroke-width', 1);
  const label = fmtWhen({ year: Math.floor(date / 10000), month: Math.floor((date % 10000) / 100), day: date % 100 });
  const lx = x(sd), half = label.length * 3.6;
  mk.append('text').attr('x', Math.max(x0 + half + 2, Math.min(x1 - half - 2, lx)) - lx).attr('y', 34).attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 700).attr('fill', NAVY).text(label);
  // (the war's span is the strip's own: its first and last days are the ends of the line; the cartouche and the list carry the dates)
}

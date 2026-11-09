// Parchment — the Military layer: what it draws beyond fills (milestone 2). D3 on the page's SVG.
//   decorateMarks: the event marks drawMarks placed, colored by outcome (P5), ringed for a siege or a capture (P6),
//                  with their circled numerals (P8);
//   drawCourseList: the numbered list in the margin;
//   drawWarStrip: the war's own timeline under the map (P10), which stands in for the stage's strip.
// Colors come from the side tokens (src/tokens.css); nothing here invents a color or a shape beyond the brief's.

import * as d3 from 'd3';
import { eventLook, courseList, eventDate, eventFirst, eventLast, fmtWhen } from './events.js';
import { toInt } from './wars.js';

const NAVY = '#1F2A44', RUST = '#C8601A', CREAM = '#F7F5EF', GOLD = '#c8a65d';
const HALF_L = (r) => `M0,${-r}L${-r},0L0,${r}Z`;
const HALF_R = (r) => `M0,${-r}L${r},0L0,${r}Z`;

const cssColor = (k) => (typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement).getPropertyValue(`--side-${k}-line`).trim() : '') || NAVY;
export const lineColorOf = (color) => ({ line: cssColor(color) });

// placed: [{ r, x, y, radius }] from drawMarks. Returns the boxes of the numerals, for the label pass to keep clear of.
export function decorateMarks(layer, placed, war) {
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
    if (look.ring) g.insert('circle', ':first-child').attr('class', 'mil mil-ring').attr('r', rad + 5).attr('fill', 'none').attr('stroke', cssColor(look.ring.color)).attr('stroke-width', 2);
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

// The war strip (P10) in the band under the frame where the stage's strip sits: the war's span with year and month
// ticks, members' bars above the line, events as small marks in the victor's color (treaties as navy triangles),
// and the shown date marked. events: every event of the war (the strip shows the whole war, the map the date).
export function drawWarStrip(root, { x0, x1, y1 }, { war, members, events, date }) {
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
    g.append('rect').attr('x', x(a)).attr('y', base - 12 - i * 5).attr('width', Math.max(2, x(b) - x(a))).attr('height', 3).attr('rx', 1).attr('fill', cssColor(side.color)).append('title').text(`${m.label}: ${eventDate(m)}`);
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
  // the shown date
  const sd = Math.max(days(t0), Math.min(days(t1), days(date)));
  const mk = g.append('g').attr('class', 'marker').attr('transform', `translate(${x(sd)},${base})`);
  mk.append('path').attr('d', 'M0,-9L8,0L0,9L-8,0Z').attr('fill', GOLD).attr('stroke', NAVY).attr('stroke-width', 1);
  const label = fmtWhen({ year: Math.floor(date / 10000), month: Math.floor((date % 10000) / 100), day: date % 100 });
  mk.append('text').attr('y', 34).attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 700).attr('fill', NAVY).text(label);
  // the war's span, named at the ends
  g.append('text').attr('x', x0 + 10).attr('y', base - 18).attr('font-size', 10).attr('font-style', 'italic').attr('fill', NAVY).attr('fill-opacity', 0.8).text(fmtWhen({ year: Math.floor(t0 / 10000), month: Math.floor((t0 % 10000) / 100), day: t0 % 100 }));
  g.append('text').attr('x', x1 - 10).attr('y', base - 18).attr('text-anchor', 'end').attr('font-size', 10).attr('font-style', 'italic').attr('fill', NAVY).attr('fill-opacity', 0.8).text(fmtWhen({ year: Math.floor(t1 / 10000), month: Math.floor((t1 % 10000) / 100), day: t1 % 100 }));
}

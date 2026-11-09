// Parchment — legend
// Top-right inside the frame. Entries come from the active tracker; the visual grammar never changes.

import { select as d3Select } from 'd3';

// Placement: top-right by default; a stage may anchor it bottom-right instead, its bottom edge `lift` px above the
// frame's bottom (the North America stage keeps the top right for New England and the Diff list).
// fit (lesson maps on the North America page): the box widens, up to 340 px, to its longest line ("Claimed by
// Indian Territory and Texas"), instead of letting a long line run past its edge. Off by default: every other map
// keeps its 236 px legend. anchor 'top-left' (the Europe stage, 2026-11-09) sets it over the open Atlantic instead.
export function createLegend(root, { x0, x1, y0, y1 }, { anchor = 'top-right', lift = 22, fit = false } = {}) {
  const W = 236, PAD = 14, ROW = 22;
  let w = W;
  const topY = (h) => (anchor === 'bottom-right' ? y1 - lift - h : y0 + 22);
  const leftX = (width) => (anchor === 'top-left' ? x0 + 22 : x1 - 22 - width);
  const g = root.append('g').attr('class', 'legend');
  const box = g.append('rect').attr('class', 'legend-box').attr('width', W);
  const title = g.append('text').attr('class', 'legend-title').attr('x', PAD).attr('y', PAD + 10);
  const rows = g.append('g').attr('transform', `translate(${PAD},${PAD + 26})`);

  let height = 0;
  function set(tracker) {
    const entries = tracker.legend ?? [];
    title.text(tracker.title ?? tracker.id);
    const H = PAD * 2 + 26 + entries.length * ROW;
    height = H;
    box.attr('height', H);
    g.attr('transform', `translate(${leftX(W)},${topY(H)})`);
    const r = rows.selectAll('g.row').data(entries).join('g').attr('class', 'row').attr('transform', (_, i) => `translate(0,${i * ROW})`);
    r.selectAll('*').remove();
    r.each(function (e) {
      const row = d3Select(this);
      if (e.swatch === 'fill') {
        row.append('rect').attr('class', `swatch fill-${e.key}`).attr('x', 0).attr('y', 0).attr('width', 22).attr('height', 14);
      } else if (e.swatch === 'hatch') {
        row.append('rect').attr('class', 'swatch hatch').attr('x', 0).attr('y', 0).attr('width', 22).attr('height', 14);
      } else if (e.swatch === 'line') {
        row.append('line').attr('class', `swatch-line ${e.style}`).attr('x1', 0).attr('x2', 22).attr('y1', 7).attr('y2', 7);
      } else if (e.swatch === 'route') {
        // A route class: its colour and its heads (none, both ends, one end, barb, chevron), solid.
        const heads = e.heads ?? 'none';
        const start = heads === 'both' ? 'arrow' : null;
        const end = heads === 'both' || heads === 'end' ? 'arrow' : heads === 'barb' ? 'barb' : heads === 'chevron' ? 'chevron' : heads === 'hollow' ? 'hollow' : null;
        row.append('line').attr('class', `swatch-route ${e.color}`).attr('x1', start ? 4 : 0).attr('x2', end ? 18 : 22).attr('y1', 7).attr('y2', 7)
          .attr('stroke-width', e.hollow ? 4.4 : null)
          .attr('marker-start', start ? `url(#route-head-${start}-${e.color})` : null)
          .attr('marker-end', end ? `url(#route-head-${end}-${e.color})` : null);
        // (the Military layer: a retreat shows its paper core; a landing its tick at the coast)
        if (e.hollow) row.append('line').attr('class', 'swatch-route-inner').attr('x1', 0).attr('x2', 13).attr('y1', 7).attr('y2', 7);
        if (e.landing) row.append('line').attr('class', `swatch-route ${e.color}`).attr('x1', 21).attr('x2', 21).attr('y1', 1).attr('y2', 13).attr('stroke-width', 2.5);
      } else if (e.swatch === 'shape') {
        // A point shape; the Military layer (2026-11-09) may give it a fill (the victor's color), a second half
        // (both sides claimed), an outline on paper (inconclusive) or a ring (a siege's besieger, a place's captor).
        if (e.ring) row.append('circle').attr('class', 'swatch-ring').attr('cx', 11).attr('cy', 7).attr('r', 10).attr('fill', 'none').attr('stroke', e.ring).attr('stroke-width', 1.8);
        const p = row.append('path').attr('class', `mark ${e.shape}`).attr('transform', 'translate(11,7)').attr('d', SHAPES[e.shape] ?? SHAPES.circle);
        if (e.fill) p.style('fill', e.fill);
        if (e.outline) p.style('fill', 'var(--cream)').style('stroke', 'var(--rust)').style('stroke-width', 1.5);
        if (e.half) row.append('path').attr('class', 'swatch-half').attr('transform', 'translate(11,7)').attr('d', 'M0,-7L7,0L0,7Z').attr('fill', e.half);
      } else if (e.swatch === 'numeral') {
        row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 7.5).attr('fill', 'var(--cream)').attr('stroke', 'var(--navy)').attr('stroke-width', 1);
        row.append('text').attr('class', 'swatch-text').attr('x', 11).attr('y', 7).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-size', 9).attr('font-weight', 700).text('1');
      }
      row.append('text').attr('x', 32).attr('y', 11).text(e.label);
    });
    if (fit) {
      let widest = 0;
      try {
        widest = title.node().getComputedTextLength() + PAD * 2;
        rows.selectAll('g.row text').each(function () { widest = Math.max(widest, this.getComputedTextLength() + 32 + PAD * 2); });
      } catch { /* not laid out */ }
      w = Math.max(W, Math.min(400, Math.ceil(widest + 6)));
      box.attr('width', w);
      g.attr('transform', `translate(${leftX(w)},${topY(H)})`);
    }
  }
  // The legend's rectangle on the sheet, a reserved zone for the label pass.
  const rect = () => ({ x: leftX(w), y: topY(height), w, h: height });
  return { set, height: () => height, box: rect, anchor };
}

// Point marks (brief §5): battle/siege = rust diamond; founding/capital = moss circle; monument = navy square;
// treaty = navy triangle; port of call = small steel circle (routes).
export const SHAPES = {
  'rust-diamond': 'M0,-7L7,0L0,7L-7,0Z',
  'moss-circle': 'M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z',
  'steel-circle': 'M0,-4.5A4.5,4.5 0 1,1 0,4.5A4.5,4.5 0 1,1 0,-4.5Z',
  'navy-square': 'M-6,-6H6V6H-6Z',
  'navy-triangle': 'M0,-7L7,6H-7Z',
  circle: 'M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z',
};

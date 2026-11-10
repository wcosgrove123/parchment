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
      } else if (e.swatch === 'band' && e.style === 'missing') {
        // a year with no dated outer border for the Empire (2026-11-10): the band's outline only, faint and dotted
        row.append('rect').attr('class', 'swatch-band-missing').attr('x', 0.5).attr('y', 1).attr('width', 21).attr('height', 7);
      } else if (e.swatch === 'band') {
        // the Holy Roman Empire's outer border (2026-11-09): a band along the inside of a line
        row.append('rect').attr('class', 'swatch-band').attr('x', 0).attr('y', 1).attr('width', 22).attr('height', 7);
        row.append('line').attr('class', `swatch-band-line${e.style === 'dashed' ? ' dashed' : ''}`).attr('x1', 0).attr('x2', 22).attr('y1', 1).attr('y2', 1);
      } else if (e.swatch === 'states') {
        // the political map (2026-11-09): every state its own color, three of the palette's side by side
        [1, 9, 4].forEach((k, j) => row.append('rect').attr('class', `swatch-state pol-${k}`).attr('x', j * 7.5).attr('y', 0).attr('width', 7).attr('height', 14));
      } else if (e.swatch === 'whole') {
        // a realm drawn as the sum of its members: its border over theirs
        row.append('line').attr('class', 'swatch-whole').attr('x1', 0).attr('x2', 22).attr('y1', 7).attr('y2', 7);
      } else if (e.swatch === 'tie') {
        // a vassal or tributary (2026-11-10): stripes in its overlord's color (palette index e.color) over the paper
        row.append('rect').attr('class', 'swatch swatch-tie').attr('x', 0).attr('y', 0).attr('width', 22).attr('height', 14);
        row.append('rect').attr('class', 'swatch-tie-stripes').attr('x', 0).attr('y', 0).attr('width', 22).attr('height', 14).attr('fill', `url(#tie-${e.color ?? 0})`);
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
          .attr('stroke-width', e.hollow ? 4.4 : null).style('stroke-width', e.w ? `${e.w}px` : null)
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
      } else if (e.swatch === 'icon' && e.d) {
        // an equipment icon from the Military layer's catalog (path data passed with the row)
        row.append('path').attr('class', 'swatch-icon').attr('d', e.d).attr('fill', e.color ?? 'var(--navy)').attr('transform', `translate(${11 - 8},${7 - 8}) scale(${16 / 512})`);
      } else if (e.swatch === 'force') {
        row.append('rect').attr('x', 1).attr('y', 1).attr('width', 20).attr('height', 12).attr('fill', 'none').attr('stroke', e.color ?? 'var(--navy)').attr('stroke-width', 1.2);
        row.append('path').attr('d', 'M1,1L21,13M21,1L1,13').attr('stroke', e.color ?? 'var(--navy)').attr('stroke-width', 1).attr('fill', 'none');
        row.append('text').attr('class', 'swatch-text').attr('x', 11).attr('y', -1).attr('text-anchor', 'middle').attr('font-size', 7).attr('font-weight', 700).text('XX');
      } else if (e.swatch === 'fade') {
        [0.8, 0.5, 0].forEach((t, j) => row.append('rect').attr('x', j * 8).attr('width', 6).attr('height', 14).attr('fill', e.color ?? 'var(--navy)').attr('fill-opacity', 1 - t * 0.75));
      } else if (e.swatch === 'hq') {
        row.append('line').attr('x1', 6).attr('x2', 6).attr('y1', -2).attr('y2', 15).attr('stroke', 'var(--navy)').attr('stroke-width', 1);
        row.append('path').attr('d', 'M6,-2L20,2L6,6Z').attr('fill', e.color ?? 'var(--navy)');
      } else if (e.swatch === 'occupied') {
        // the Military layer: the owner's fill under the occupier's hatch (P2)
        if (e.key) row.append('rect').attr('class', `swatch fill-${e.key}`).attr('x', 0).attr('y', 0).attr('width', 22).attr('height', 14);
        row.append('rect').attr('class', `swatch-occ side-${e.occ}`).attr('x', 0).attr('y', 0).attr('width', 22).attr('height', 14);
      } else if (e.swatch === 'terrain') {
        row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 3).attr('fill', 'var(--cream)').attr('stroke', 'var(--navy)').attr('stroke-width', 1.1);
      } else if (e.swatch === 'massacre') {
        row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 6).attr('fill', 'none').attr('stroke', 'var(--navy)').attr('stroke-width', 1.4);
        row.append('circle').attr('cx', 11).attr('cy', 7).attr('r', 2.2).attr('fill', 'var(--rust)');
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

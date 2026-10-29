// Parchment — legend
// Top-right inside the frame. Entries come from the active tracker; the visual grammar never changes.

export function createLegend(root, { x1, y0 }) {
  const W = 236, PAD = 14, ROW = 22;
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
    g.attr('transform', `translate(${x1 - 22 - W},${y0 + 22})`);
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
      } else if (e.swatch === 'shape') {
        row.append('path').attr('class', `mark ${e.shape}`).attr('transform', 'translate(11,7)').attr('d', SHAPES[e.shape] ?? SHAPES.circle);
      }
      row.append('text').attr('x', 32).attr('y', 11).text(e.label);
    });
  }
  return { set, height: () => height };
}

// Point marks (brief §5): battle/siege = rust diamond; founding/capital = moss circle; monument = navy square; treaty = navy triangle.
export const SHAPES = {
  'rust-diamond': 'M0,-7L7,0L0,7L-7,0Z',
  'moss-circle': 'M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z',
  'navy-square': 'M-6,-6H6V6H-6Z',
  'navy-triangle': 'M0,-7L7,6H-7Z',
  circle: 'M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z',
};

// tiny local alias to avoid importing all of d3 here
import { select as d3Select } from 'd3';

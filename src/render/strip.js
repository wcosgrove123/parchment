// Parchment — timeline strip
// The bottom edge of the frame: the stage's full span with year ticks, snapshot years as dots, the shown year marked.

import * as d3 from 'd3';

export function createStrip(root, { x0, x1, y1 }, stage, years, onYear) {
  const [a, b] = stage.span;
  const x = d3.scaleLinear().domain([a, b]).range([x0, x1]);
  const g = root.append('g').attr('class', 'strip');

  g.append('line').attr('class', 'baseline').attr('x1', x0).attr('x2', x1).attr('y1', y1).attr('y2', y1);

  const minor = d3.range(Math.ceil(a / 50) * 50, b + 1, 50);
  g.selectAll('line.tick').data(minor).join('line')
    .attr('class', (d) => `tick ${d % 100 === 0 ? 'major' : 'minor'}`)
    .attr('x1', (d) => x(d)).attr('x2', (d) => x(d)).attr('y1', y1).attr('y2', (d) => y1 + (d % 100 === 0 ? 10 : 5));
  const tickLabels = g.selectAll('text.tick-label').data(minor.filter((d) => d % 100 === 0)).join('text')
    .attr('class', 'tick-label').attr('x', (d) => x(d)).attr('y', y1 + 26).attr('text-anchor', 'middle')
    .text((d) => (d < 0 ? `${-d} BCE` : d));

  g.selectAll('circle.snapshot').data(years).join('circle')
    .attr('class', 'snapshot').attr('cx', (d) => x(d)).attr('cy', y1).attr('r', 5)
    .on('click', (_, d) => onYear && onYear(d))
    .append('title').text((d) => `Show ${d}`);

  // Diff range: a bold segment between the two years, with a hollow marker at the start.
  const range = g.append('line').attr('class', 'range hidden').attr('y1', y1).attr('y2', y1);
  const markerA = g.append('g').attr('class', 'marker start hidden');
  markerA.append('path').attr('d', 'M0,-9L8,0L0,9L-8,0Z');
  const markerALabel = markerA.append('text').attr('y', 30).attr('text-anchor', 'middle');

  const marker = g.append('g').attr('class', 'marker');
  marker.append('path').attr('d', 'M0,-9L8,0L0,9L-8,0Z');
  const markerLabel = marker.append('text').attr('y', 30).attr('text-anchor', 'middle');

  const hideNear = (...ys) => tickLabels.classed('hidden', (d) => ys.some((y) => Math.abs(x(d) - x(y)) < 34));

  return {
    setYear(year) {
      marker.attr('transform', `translate(${x(year)},${y1})`);
      markerLabel.text(year);
      range.classed('hidden', true);
      markerA.classed('hidden', true);
      hideNear(year);
    },
    setRange(a, b) {
      marker.attr('transform', `translate(${x(b)},${y1})`);
      markerLabel.text(b);
      markerA.attr('transform', `translate(${x(a)},${y1})`).classed('hidden', false);
      markerALabel.text(a);
      range.attr('x1', x(Math.min(a, b))).attr('x2', x(Math.max(a, b))).classed('hidden', false);
      hideNear(a, b);
    },
  };
}

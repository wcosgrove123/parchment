// Parchment — cartouche
// Bottom-left bracketed box: PARCHMENT wordmark · map title · year shown · scale bar. Nothing else.

import * as d3 from 'd3';

function scaleBar(projection, center, targetPx = 170) {
  const [lon, lat] = center;
  const p1 = projection([lon, lat]), p2 = projection([lon + 1, lat]);
  if (!p1 || !p2) return { km: 1000, px: targetPx };
  const kmPerDeg = d3.geoDistance([lon, lat], [lon + 1, lat]) * 6371;
  const pxPerKm = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / kmPerDeg;
  const km = [100, 200, 250, 500, 1000, 2000, 3000, 5000].reduce((b, k) => (Math.abs(k * pxPerKm - targetPx) < Math.abs(b * pxPerKm - targetPx) ? k : b));
  return { km, px: km * pxPerKm };
}

export function createCartouche(root, { x0, y1 }, stage, projection) {
  const W = 330, H = 128, PAD = 16;
  const x = x0 + 22, y = y1 - 22 - H;
  const g = root.append('g').attr('class', 'cartouche').attr('transform', `translate(${x},${y})`);
  g.append('rect').attr('class', 'cartouche-box').attr('width', W).attr('height', H);
  // corner brackets
  const b = 12, o = 5;
  const corners = [[-o, -o, 1, 1], [W + o, -o, -1, 1], [-o, H + o, 1, -1], [W + o, H + o, -1, -1]];
  g.selectAll('path.bracket').data(corners).join('path').attr('class', 'bracket')
    .attr('d', ([cx, cy, sx, sy]) => `M${cx + sx * b},${cy}L${cx},${cy}L${cx},${cy + sy * b}`);

  g.append('text').attr('class', 'wordmark').attr('x', PAD).attr('y', PAD + 12).text('PARCHMENT');
  g.append('line').attr('class', 'rule').attr('x1', PAD).attr('x2', W - PAD).attr('y1', PAD + 20).attr('y2', PAD + 20);
  const title = g.append('text').attr('class', 'map-title').attr('x', PAD).attr('y', PAD + 46).text(stage.title);
  const year = g.append('text').attr('class', 'year').attr('x', W - PAD).attr('y', PAD + 48).attr('text-anchor', 'end');
  const baseNote = g.append('text').attr('class', 'base-note').attr('x', W - PAD).attr('y', PAD + 64).attr('text-anchor', 'end');

  // scale bar
  const e = stage.extent;
  const { km, px } = scaleBar(projection, [(e.west + e.east) / 2, (e.south + e.north) / 2]);
  const sb = g.append('g').attr('class', 'scalebar').attr('transform', `translate(${PAD},${H - PAD - 10})`);
  sb.append('line').attr('x1', 0).attr('x2', px).attr('y1', 0).attr('y2', 0);
  sb.selectAll('line.tick').data([0, px / 2, px]).join('line').attr('class', 'tick')
    .attr('x1', (d) => d).attr('x2', (d) => d).attr('y1', -5).attr('y2', 0);
  sb.append('rect').attr('x', 0).attr('y', -3).attr('width', px / 2).attr('height', 3);
  sb.append('text').attr('x', px + 8).attr('y', 1).text(`${km.toLocaleString('en-US')} km`);

  return {
    setTitle(text) { title.text(text); },
    setYear(y, sourceYear) {
      year.text(y < 0 ? `${-y} BCE` : y);
      baseNote.text(sourceYear != null && sourceYear !== y ? `base map ${sourceYear}` : '');
    },
  };
}

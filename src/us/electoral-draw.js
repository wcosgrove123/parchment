// Parchment — North America stage: drawing the Electoral College tracker (fills come from stage.js; this file
// places and draws the badges). A badge is a quantity (grammar §5): the state's postal abbreviation and its electoral
// votes, "OH 23", or "NJ 4+3" when its electors divided. It sits inside its state when it fits there and touches no
// other badge or apparatus; small eastern states are called out in a column in the Atlantic, at their own height,
// with a hairline to the state, as printed electoral maps do.

import * as d3 from 'd3';

const H = 18;
const overlaps = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

function largestPolygon(f) {
  const g = f.geometry;
  if (!g) return null;
  if (g.type === 'Polygon') return g;
  let best = null, bestA = -1;
  for (const coords of g.coordinates) { const p = { type: 'Polygon', coordinates: coords }; const a = d3.geoArea(p); if (a > bestA) { bestA = a; best = p; } }
  return best;
}

// A point inside the polygon, nearest its centroid (the centroid of a crescent can fall outside it).
function insidePoint(v, poly) {
  const [cx, cy] = v.path.centroid(poly);
  if (!Number.isFinite(cx)) return null;
  const ll = v.proj.invert([cx, cy]);
  if (ll && d3.geoContains(poly, ll)) return [cx, cy];
  const [[x0, y0], [x1, y1]] = v.path.bounds(poly);
  let best = null, bd = Infinity;
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
    const p = [x0 + ((x1 - x0) * (i + 0.5)) / 9, y0 + ((y1 - y0) * (j + 0.5)) / 9];
    const q = v.proj.invert(p);
    if (!q || !d3.geoContains(poly, q)) continue;
    const dd = (p[0] - cx) ** 2 + (p[1] - cy) ** 2;
    if (dd < bd) { bd = dd; best = p; }
  }
  return best;
}

// Where each badge goes on one view. `resultOf(p)` gives a Newberry polygon's result ({ badge }); `zones` are taken.
export function fitElectoralBadges(v, nbItems, resultOf, zones, measure) {
  const main = v.id === 'main';
  const [bx, by, bw, bh] = v.box;
  const cands = [];
  for (const it of nbItems) {
    const r = resultOf(it.p);
    if (!r?.badge) continue;
    const poly = largestPolygon(it.f);
    const pt = poly && insidePoint(v, poly);
    if (!pt) continue;
    const [[x0, y0], [x1, y1]] = v.path.bounds(poly);
    const abbr = (it.p.abbr ?? '').replace(/ Terr$/, '');
    const w = measure(r.badge, { size: 13, bold: true }) + (abbr ? measure(abbr, { size: 10 }) + 4 : 0) + 14;
    cands.push({ x: pt[0], y: pt[1], w, h: H, abbr, text: r.badge, room: [x1 - x0, y1 - y0], area: (x1 - x0) * (y1 - y0) });
  }
  cands.sort((a, b) => b.area - a.area);
  const placed = [], callouts = [];
  const inView = (b) => b.x >= bx + 2 && b.x + b.w <= bx + bw - 2 && b.y >= by + 2 && b.y + b.h <= by + bh - 2;
  for (const c of cands) {
    const box = { x: c.x - c.w / 2, y: c.y - c.h / 2, w: c.w, h: c.h };
    const fits = c.room[0] > c.w * 0.9 && c.room[1] > c.h + 2;
    if (inView(box) && (fits || !main) && ![...zones, ...placed.map((p) => p.box)].some((z) => overlaps(z, box, 2))) placed.push({ ...c, box });
    else if (main) callouts.push(c);
  }
  if (callouts.length) {
    // One column east of the easternmost called-out state, each badge at its state's height, pushed apart.
    const colX = Math.max(...callouts.map((c) => c.x)) + 56;
    callouts.sort((a, b) => a.y - b.y);
    let y = -Infinity;
    for (const c of callouts) {
      y = Math.max(c.y - c.h / 2, y + c.h + 4);
      let box = { x: colX, y, w: c.w, h: c.h };
      while ([...zones, ...placed.map((p) => p.box)].some((z) => overlaps(z, box, 2)) && box.y < by + bh - 40) box = { ...box, y: box.y + c.h + 4 };
      y = box.y;
      if (inView(box)) placed.push({ ...c, box, leader: [c.x, c.y] });
    }
  }
  return placed;
}

// Drawn after the names (the name pass re-joins every text in the layer).
export function drawElectoralBadges(lg, placed) {
  // every hairline first, so none crosses a badge
  for (const b of placed.filter((x) => x.leader)) {
    lg.append('path').attr('class', 'ec-leader').attr('d', `M${b.leader[0].toFixed(1)},${b.leader[1].toFixed(1)}L${b.box.x.toFixed(1)},${(b.box.y + b.h / 2).toFixed(1)}`);
    lg.append('circle').attr('class', 'ec-leader-dot').attr('cx', b.leader[0].toFixed(1)).attr('cy', b.leader[1].toFixed(1)).attr('r', 1.6);
  }
  for (const b of placed) {
    const g = lg.append('g').attr('class', 'badge ec-badge').attr('transform', `translate(${b.box.x.toFixed(1)},${b.box.y.toFixed(1)})`);
    g.append('rect').attr('width', b.w.toFixed(1)).attr('height', b.h).attr('rx', b.h / 2);
    const t = g.append('text').attr('x', (b.w / 2).toFixed(1)).attr('y', b.h / 2).attr('text-anchor', 'middle').attr('dominant-baseline', 'central');
    if (b.abbr) t.append('tspan').attr('class', 'ec-abbr').text(`${b.abbr} `);
    t.append('tspan').attr('class', 'badge-n').text(b.text);
  }
}

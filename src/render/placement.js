// Parchment — label placement
// Pure (no DOM, no D3): takes measured label boxes, mark positions, route polylines and reserved zones, and returns
// where each label goes. The rule (docs/ROUTES-STYLE.md §3): a label is placed only where its box overlaps no
// placed label, no route line, no mark and no reserved zone. A point label tries eight positions in a fixed order;
// if none fits it gets a leader line to the nearest free spot; the lowest-priority labels are dropped on a narrow
// screen; at most `maxPlaces` places are labelled. The same input always gives the same output, so exports are stable.
// On a lesson map (`apart`), two marks that print as one dot try first the sides facing away from each other.

export const POSITIONS = ['E', 'W', 'NE', 'NW', 'SE', 'SW', 'N', 'S'];
export const NARROW = 1366;
export const APART = 16; // px: marks closer than this print as one dot (two mark radii and a hairline)

const PAD = 2;
export function rectsOverlap(a, b, pad = PAD) {
  return a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
}
const pointInRect = (p, r, pad = PAD) => p[0] >= r.x - pad && p[0] <= r.x + r.w + pad && p[1] >= r.y - pad && p[1] <= r.y + r.h + pad;

// Does the segment a–b cross or enter the rect? Liang–Barsky clipping.
export function segmentHitsRect(a, b, r, pad = PAD) {
  const x0 = r.x - pad, y0 = r.y - pad, x1 = r.x + r.w + pad, y1 = r.y + r.h + pad;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let t0 = 0, t1 = 1;
  const checks = [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]];
  for (const [p, q] of checks) {
    if (p === 0) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
    else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return true;
}

export function polylineHitsRect(samples, r, pad = PAD) {
  // quick reject on the polyline's bounds
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const p of samples) { if (p[0] < bx0) bx0 = p[0]; if (p[0] > bx1) bx1 = p[0]; if (p[1] < by0) by0 = p[1]; if (p[1] > by1) by1 = p[1]; }
  if (!rectsOverlap({ x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 }, r, pad)) return false;
  for (let i = 1; i < samples.length; i++) if (segmentHitsRect(samples[i - 1], samples[i], r, pad)) return true;
  return false;
}

// The eight boxes a point label may take around a mark of radius `radius`, in the order they are tried.
export function pointCandidates({ x, y, radius, w, h }, gap = 4) {
  const d = radius + gap, dd = radius * 0.72 + gap * 0.5;
  return [
    { pos: 'E', x: x + d, y: y - h / 2 },
    { pos: 'W', x: x - d - w, y: y - h / 2 },
    { pos: 'NE', x: x + dd, y: y - dd - h },
    { pos: 'NW', x: x - dd - w, y: y - dd - h },
    { pos: 'SE', x: x + dd, y: y + dd },
    { pos: 'SW', x: x - dd - w, y: y + dd },
    { pos: 'N', x: x - w / 2, y: y - d - h },
    { pos: 'S', x: x - w / 2, y: y + d },
  ].map((c) => ({ ...c, w, h }));
}

// Rings of boxes further out, for a label that needs a leader line. Deterministic order: nearer ring first,
// then clockwise from east.
export function leaderCandidates({ x, y, w, h }, radii = [30, 46, 64], steps = 12) {
  const out = [];
  for (const rad of radii) for (let k = 0; k < steps; k++) {
    const a = (2 * Math.PI * k) / steps;
    const cx = x + rad * Math.cos(a), cy = y + rad * Math.sin(a);
    out.push({ pos: 'leader', x: cx - w / 2, y: cy - h / 2, w, h });
  }
  return out;
}

// Where a leader line meets a box: the midpoint of the side facing the mark.
function leaderEnd(box, mark) {
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const dx = mark[0] - cx, dy = mark[1] - cy;
  if (Math.abs(dx) * box.h > Math.abs(dy) * box.w) return [dx > 0 ? box.x + box.w : box.x, cy];
  return [cx, dy > 0 ? box.y + box.h : box.y];
}

// Where a route's name may sit: boxes centred at a few fractions of its length, above the line.
// samples: the drawn polyline; w, h: the name's size; gap: distance from the line to the baseline.
// → [{ startOffset (0..1), reverse, box }], or [] when the route is too short for its name.
// Stretches tried, from the middle outwards in 4 % steps (2026-11-06: nine stretches left long, crowded world-map
// voyages unnamed; the middle still comes first, so a short route is named where it was before).
const FRACTIONS = [0.5, ...Array.from({ length: 10 }, (_, i) => [0.5 - 0.04 * (i + 1), 0.5 + 0.04 * (i + 1)]).flat()].map((f) => Math.round(f * 100) / 100);
// minStraightness (0–1, a river's name on a lesson map): a stretch whose chord is shorter than this share of its
// length bends too much to carry letters, and is skipped. 0, the default, takes every stretch as before.
export function routeLabelCandidates(samples, w, h, { gap = 5, fractions = FRACTIONS, minStraightness = 0 } = {}) {
  if (samples.length < 2) return [];
  const cum = [0];
  for (let i = 1; i < samples.length; i++) cum.push(cum[i - 1] + Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]));
  const total = cum[cum.length - 1];
  if (w > total * 0.8) return [];
  const at = (s) => {
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    const t = (s - cum[i - 1]) / Math.max(cum[i] - cum[i - 1], 1e-9);
    return [samples[i - 1][0] + (samples[i][0] - samples[i - 1][0]) * t, samples[i - 1][1] + (samples[i][1] - samples[i - 1][1]) * t];
  };
  const out = [];
  for (const f of fractions) {
    const s0 = f * total - w / 2, s1 = f * total + w / 2;
    if (s0 < 0 || s1 > total) continue;
    const span = [at(s0), ...samples.filter((_, i) => cum[i] > s0 && cum[i] < s1), at(s1)];
    if (minStraightness > 0) {
      const chord = Math.hypot(span[span.length - 1][0] - span[0][0], span[span.length - 1][1] - span[0][1]);
      if (chord < minStraightness * (s1 - s0)) continue;
    }
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const p of span) { if (p[0] < bx0) bx0 = p[0]; if (p[0] > bx1) bx1 = p[0]; if (p[1] < by0) by0 = p[1]; if (p[1] > by1) by1 = p[1]; }
    const reverse = span[span.length - 1][0] < span[0][0];
    // The name sits above the line: the box covers the text band and the stretch of line beneath it.
    out.push({ startOffset: f, reverse, box: { x: bx0, y: by0 - gap - h, w: bx1 - bx0, h: by1 - by0 + gap + h } });
  }
  return out;
}

// Marks closer than `apart` px print as one dot, and labels on one line beside it read as one name ("Matamoros ●
// Fort Texas"). Each such label tries first the positions facing away from its neighbors, so the fort on the north
// bank is named above the dot and the town on the south bank below it; the fixed order breaks ties. A mark with no
// neighbor that close keeps the fixed order.
const DIRECTION = { E: [1, 0], W: [-1, 0], NE: [Math.SQRT1_2, -Math.SQRT1_2], NW: [-Math.SQRT1_2, -Math.SQRT1_2], SE: [Math.SQRT1_2, Math.SQRT1_2], SW: [-Math.SQRT1_2, Math.SQRT1_2], N: [0, -1], S: [0, 1] };
function awayFirst(candidates, l, marks, apart) {
  let vx = 0, vy = 0;
  for (const m of marks) {
    if (m.id === l.id) continue;
    const dx = l.x - m.x, dy = l.y - m.y, d = Math.hypot(dx, dy);
    if (d > 0 && d < apart) { vx += dx / d; vy += dy / d; }
  }
  if (Math.hypot(vx, vy) < 1e-9) return candidates;
  const toward = (c) => DIRECTION[c.pos][0] * vx + DIRECTION[c.pos][1] * vy;
  return candidates.map((c, i) => ({ c, i, s: toward(c) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.c);
}

// labels: [{ id, kind: 'point' | 'route', priority, w, h, x, y, radius, route?: id, candidates? }]
//   point labels name their mark (x, y, radius); route labels bring their own candidates (routeLabelCandidates).
// marks: [{ id, x, y, radius }]; routes: [{ id, samples }]; zones: [{ x, y, w, h }]; frame: { x0, y0, x1, y1 }.
// apart: 0 (the default) keeps the fixed order everywhere; lesson maps pass APART.
// → [{ id, kind, box, pos, leader?: [[mx,my],[ex,ey]], dropped?: 'narrow' | 'ceiling' | 'no-room' }]
export function placeLabels({ labels, marks = [], routes = [], zones = [], frame, width = 1920, maxPlaces = 10, apart = 0 }) {
  const placed = [];
  const out = [];
  const inFrame = (b) => !frame || (b.x >= frame.x0 + 4 && b.y >= frame.y0 + 4 && b.x + b.w <= frame.x1 - 4 && b.y + b.h <= frame.y1 - 4);
  const free = (box, self) => {
    if (!inFrame(box)) return false;
    if (zones.some((z) => rectsOverlap(box, z))) return false;
    if (placed.some((p) => rectsOverlap(box, p.box))) return false;
    if (marks.some((m) => m.id !== self.id && pointInRect([m.x, m.y], box, m.radius + 1))) return false;
    if (routes.some((r) => r.id !== self.route && polylineHitsRect(r.samples, box))) return false;
    return true;
  };
  // Fixed order: priority, then id, so the same table always lays out the same way.
  const order = [...labels].sort((a, b) => a.priority - b.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const lowest = Math.max(...labels.filter((l) => l.kind === 'point').map((l) => l.priority), 0);
  let places = 0;
  for (const l of order) {
    if (l.kind === 'point') {
      if (frame && !(l.x >= frame.x0 && l.x <= frame.x1 && l.y >= frame.y0 && l.y <= frame.y1)) { out.push({ id: l.id, kind: l.kind, dropped: 'off-map' }); continue; }
      if (width < NARROW && l.priority === lowest && lowest > 1) { out.push({ id: l.id, kind: l.kind, dropped: 'narrow' }); continue; }
      if (places >= maxPlaces) { out.push({ id: l.id, kind: l.kind, dropped: 'ceiling' }); continue; }
      const direct = (apart > 0 ? awayFirst(pointCandidates(l), l, marks, apart) : pointCandidates(l)).find((c) => free(c, l));
      if (direct) { placed.push({ id: l.id, box: direct }); out.push({ id: l.id, kind: l.kind, box: direct, pos: direct.pos }); places++; continue; }
      const far = leaderCandidates(l).find((c) => free(c, l));
      if (far) {
        placed.push({ id: l.id, box: far });
        out.push({ id: l.id, kind: l.kind, box: far, pos: 'leader', leader: [[l.x, l.y], leaderEnd(far, [l.x, l.y])] });
        places++;
        continue;
      }
      out.push({ id: l.id, kind: l.kind, dropped: 'no-room' });
    } else {
      // A name along a line that counts as a place (a river on a lesson map) takes one of the ten places.
      if (l.place && places >= maxPlaces) { out.push({ id: l.id, kind: l.kind, dropped: 'ceiling' }); continue; }
      const c = (l.candidates ?? []).find((c) => free(c.box, l));
      if (c) {
        placed.push({ id: l.id, box: c.box });
        out.push({ id: l.id, kind: l.kind, box: c.box, pos: 'along', startOffset: c.startOffset, reverse: c.reverse });
        if (l.place) places++;
      } else out.push({ id: l.id, kind: l.kind, dropped: 'no-room' });
    }
  }
  return out;
}

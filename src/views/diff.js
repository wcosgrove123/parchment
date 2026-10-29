// Parchment — diff
// Continuity and change between two snapshots, computed from what each base map names and from the
// tracker's time-bounded identities. Nothing here draws; see render/base.js showDiff.

import * as d3 from 'd3';

const KM2_PER_SR = 6371 * 6371;

function boundsIntersect([[ax0, ay0], [ax1, ay1]], { x0, y0, x1, y1 }) {
  return ax1 >= x0 && ax0 <= x1 && ay1 >= y0 && ay0 <= y1;
}

// Spherical area and projected bounds are cached per feature object; snapshots are cached, so this pays once.
const areaCache = new WeakMap();
const boundsCache = new WeakMap();
const areaOf = (f) => { let a = areaCache.get(f); if (a === undefined) { a = d3.geoArea(f); areaCache.set(f, a); } return a; };
const boundsOf = (f, path) => { let b = boundsCache.get(f); if (b === undefined) { b = path.bounds(f); boundsCache.set(f, b); } return b; };

// Group a snapshot's named features by identity.
// identify(feature, year) → { key, label } | null: a tracker identity when the name matches one alive that
// year (so a renamed state persists), otherwise the base map's own name; null means "not part of this diff".
function groupByIdentity(features, year, identify, path, frame) {
  const groups = new Map();
  for (const f of features) {
    const id = identify(f, year);
    if (!id) continue;
    const { key, label } = id;
    let g = groups.get(key);
    if (!g) { g = { key, label, area: 0, features: [], visible: false }; groups.set(key, g); }
    g.area += areaOf(f);
    g.features.push(f);
    if (!g.visible && boundsIntersect(boundsOf(f, path), frame)) g.visible = true;
  }
  return groups;
}

// Returns { appeared, vanished, persisted, small: {appeared, vanished, persisted} }.
// Each list holds { key, label, area, km2, a?: features in A, b?: features in B } sorted by area, largest first.
// Groups smaller than minKm2 are counted in `small` but not listed; groups wholly outside the frame are dropped.
export function computeDiff({ aFeatures, aYear, bFeatures, bYear, identify, path, frame, minKm2 = 120000 }) {
  const A = groupByIdentity(aFeatures, aYear, identify, path, frame);
  const B = groupByIdentity(bFeatures, bYear, identify, path, frame);
  const minSr = minKm2 / KM2_PER_SR;
  const out = { appeared: [], vanished: [], persisted: [], small: { appeared: 0, vanished: 0, persisted: 0 } };
  const push = (bucket, item) => {
    if (!item.visible) return;
    item.km2 = Math.round(item.area * KM2_PER_SR);
    if (item.area < minSr) { out.small[bucket]++; return; }
    out[bucket].push(item);
  };
  for (const [key, gb] of B) {
    const ga = A.get(key);
    if (ga) push('persisted', { key, label: gb.label, area: Math.max(ga.area, gb.area), visible: ga.visible || gb.visible, a: ga.features, b: gb.features });
    else push('appeared', { key, label: gb.label, area: gb.area, visible: gb.visible, b: gb.features });
  }
  for (const [key, ga] of A) {
    if (!B.has(key)) push('vanished', { key, label: ga.label, area: ga.area, visible: ga.visible, a: ga.features });
  }
  for (const k of ['appeared', 'vanished', 'persisted']) out[k].sort((p, q) => q.area - p.area);
  return out;
}

// Parchment — North America stage: the Diff view's model (no drawing; the tests load it alone).
// Two dates, compared by identity from the records' own dates, never by geometry:
//   Newberry polygons by their `id` (la_purchase, mo_terr, va_state): a new version of an id is the same unit with
//     new borders;
//   OpenHistoricalMap polygons by their Wikidata item (OHM stores a colony's new outline, and often its new name, as
//     a new relation; the Wikidata item is shared), else by relation id, and by admin level, so a province never
//     stands in for the colony that held it;
//   Royce cessions by their area number.
// Under the nations tracker the United States is one unit (the tracker's fills are nations, not states); its
// growth is shown from the polygons themselves (B's U.S. land masked by A's, in the renderer), not computed.
// Native homelands from historical-basemaps are never compared: its snapshots take their names from different
// sources (the 1492 map from Native Land Digital), so a "change" between them could be a change of source.

import { geoArea, geoBounds, geoCentroid, geoContains } from 'd3';
import { aliveNB, aliveOHM, powerAt, nbName, cleanLabel, US_FROM } from './model.js';

const KM2_PER_SR = 6371 * 6371;
const areaCache = new WeakMap();
const areaOf = (f) => { let a = areaCache.get(f); if (a === undefined) { a = geoArea(f); areaCache.set(f, a); } return a; };

// OHM identity: the Wikidata item, else the name (a relation id changes with every redrawn outline), and the level.
const ohmKey = (p) => `ohm:${p.wd || `n=${cleanLabel(p.name) ?? p.rid}`}:${p.lvl}`;

// The units a tracker compares on a date: { key, label, it, power, type }.
export function unitsAt(data, date, trackerId, { powers = null } = {}) {
  const out = [];
  if (trackerId === 'cessions') {
    for (const c of data.ces) if (c.p.d <= date) out.push({ key: `royce:${c.p.n}`, label: c.p.tribe || `Royce area ${c.p.n}`, it: c });
    return out;
  }
  const nations = trackerId === 'nations';
  for (const it of aliveNB(data, date)) {
    if (nations && it.p.power === 'us') out.push({ key: 'us', label: 'United States', it, power: 'us' });
    else out.push({ key: `nb:${it.p.id}`, label: nbName(it.p), it, power: it.p.power, type: it.p.type });
  }
  if (!nations) return out;
  const silent = (name) => (powers?.nolabel ?? []).some((r) => new RegExp(r.match, 'i').test(name) && (!r.from || date >= r.from) && (!r.to || date < r.to));
  for (const it of aliveOHM(data, date)) {
    const p = it.p;
    if (p.lvl === 'x' || silent(p.name)) continue; // overlaps are intersections, not units; silenced names are not claims
    const pw = powerAt(p, date);
    if (pw === 'us') out.push({ key: 'us', label: 'United States', it, power: 'us' });
    else out.push({ key: ohmKey(p), label: cleanLabel(p.name) ?? p.name, it, power: pw });
  }
  return out;
}

function group(units, visible) {
  const m = new Map();
  for (const u of units) {
    let g = m.get(u.key);
    if (!g) { g = { key: u.key, label: u.label, power: u.power, type: u.type, items: [], area: 0, big: -1, visible: false }; m.set(u.key, g); }
    const a = areaOf(u.it.f);
    g.items.push(u.it);
    g.area += a;
    // the unit's name, power and kind are its largest polygon's
    if (a > g.big) { g.big = a; g.label = u.label; g.power = u.power; g.type = u.type; }
    if (!g.visible && visible(u.it.f)) g.visible = true;
  }
  return m;
}

// First and last day each unit is in the record (for "admitted 1791", "until 1803").
const spans = new WeakMap();
function spanOf(data, trackerId, key) {
  let byTracker = spans.get(data);
  if (!byTracker) { byTracker = new Map(); spans.set(data, byTracker); }
  let m = byTracker.get(trackerId);
  if (!m) {
    m = new Map();
    const add = (k, s, e) => { const x = m.get(k); if (!x) m.set(k, { s, e }); else { x.s = Math.min(x.s, s); x.e = Math.max(x.e, e); } };
    if (trackerId === 'cessions') for (const c of data.ces) add(`royce:${c.p.n}`, c.p.d, c.p.d);
    else {
      for (const it of data.nb) add(trackerId === 'nations' && it.p.power === 'us' ? 'us' : `nb:${it.p.id}`, it.p.s, it.p.e);
      if (trackerId === 'nations') for (const it of data.ohm) if (it.p.lvl !== 'x') add(ohmKey(it.p), it.p.s, it.p.e);
    }
    byTracker.set(trackerId, m);
  }
  return m.get(key);
}

const powerLabel = (powers, key, date) => {
  const c = powers?.categories?.[key];
  if (!c) return null;
  let out = c.label;
  for (const [from, text] of c.labels ?? []) if (date >= from) out = text;
  return out;
};

// The comparison. Lists are sorted largest first; units smaller than minKm2 (or off the sheet) are counted in
// `small` and neither listed nor drawn. `us` carries the United States' polygons on both dates when it is one
// unit that persisted (nations), for the renderer's growth mask.
export function diffUS(data, a, b, trackerId, { powers = null, visible = () => true, minKm2 = 0 } = {}) {
  const A = group(unitsAt(data, a, trackerId, { powers }), visible);
  const B = group(unitsAt(data, b, trackerId, { powers }), visible);
  // A unit of the same name and level on both dates is one unit, even under two Wikidata items (OHM files Mexico's
  // successive republics as separate items): the reader sees one Mexico, so the diff does too.
  const levelKey = (k) => (k.startsWith('ohm:') ? k.slice(k.lastIndexOf(':')) : null);
  for (const [kb, gb] of B) {
    if (A.has(kb) || !levelKey(kb)) continue;
    for (const [ka, ga] of A) {
      if (B.has(ka) || levelKey(ka) !== levelKey(kb) || ga.label !== gb.label) continue;
      A.delete(ka); A.set(kb, ga);
      break;
    }
  }
  const minSr = minKm2 / KM2_PER_SR;
  const out = { trackerId, a, b, appeared: [], vanished: [], persisted: [], changed: [], small: { appeared: 0, vanished: 0, persisted: 0, changed: 0 }, us: null };
  const push = (bucket, x) => {
    if (!x.visible) return;
    x.km2 = Math.round(x.area * KM2_PER_SR);
    if (x.area < minSr && x.key !== 'us') { out.small[bucket]++; return; }
    out[bucket].push(x);
  };
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const within = (d) => d != null && d > lo && d <= hi;
  // Years only where the record dates the unit itself: Newberry (by statute) and Royce (by treaty). An OHM unit's
  // first record can be one of several Wikidata items for one country (Mexico's 1846 republic), so no year.
  const dated = (key) => key.startsWith('nb:') || key.startsWith('royce:');

  for (const [key, gb] of B) {
    const ga = A.get(key);
    if (!ga) {
      const sp = spanOf(data, trackerId, key);
      push('appeared', { key, label: gb.label, type: gb.type, power: gb.power, area: gb.area, visible: gb.visible, b: gb.items, since: dated(key) && within(sp?.s) ? sp.s : null });
      continue;
    }
    const x = { key, label: gb.label, type: gb.type, power: gb.power, area: Math.max(ga.area, gb.area), visible: ga.visible || gb.visible, a: ga.items, b: gb.items };
    if (ga.label !== gb.label) x.was = ga.label;
    if (key.startsWith('nb:')) {
      const va = ga.items.map((it) => it.p.v).join(','), vb = gb.items.map((it) => it.p.v).join(',');
      if (va !== vb) x.reshaped = true;
      if (ga.type !== gb.type) x.typeWas = ga.type;
    }
    if (key === 'us') {
      out.us = { a: ga.items, b: gb.items };
      const grew = gb.area - ga.area, minGrow = Math.max(minSr, 1000 / KM2_PER_SR);
      if (grew > minGrow) { x.note = 'gained land'; x.grew = true; push('changed', x); continue; }
      if (-grew > minGrow) { x.note = 'lost land'; x.shrank = true; push('changed', x); continue; }
    }
    // Changed hands: the same unit under another holder, only when the record names both (never "other").
    if (trackerId === 'nations' && ga.power !== gb.power && powers?.categories?.[ga.power]?.label && powers?.categories?.[gb.power]?.label) {
      x.from = ga.power; x.to = gb.power;
      x.note = `${powerLabel(powers, ga.power, a)} → ${powerLabel(powers, gb.power, b)}`;
      push('changed', x);
      continue;
    }
    push('persisted', x);
  }
  for (const [key, ga] of A) {
    if (B.has(key)) continue;
    const sp = spanOf(data, trackerId, key);
    const until = sp && sp.e < 99991231 ? sp.e : null;
    push('vanished', { key, label: ga.label, type: ga.type, power: ga.power, area: ga.area, visible: ga.visible, a: ga.items, until: dated(key) && within(until) ? until : null });
  }
  for (const k of ['appeared', 'vanished', 'persisted', 'changed']) out[k].sort((p, q) => (q.key === 'us') - (p.key === 'us') || q.area - p.area);
  if (trackerId === 'nations') for (const k of ['appeared', 'vanished', 'persisted', 'changed']) fold(out[k]);
  out.beforeRecord = trackerId === 'states' && Math.max(a, b) < US_FROM;
  return out;
}

// A province (OHM level 3 or 4) whose inside point lies in a larger unit of the same list is folded into it: the
// list names Mexico "with 14 provinces", not Mexico and its fourteen states. A test of a point, never a new shape.
const levelOf = (x) => { const m = /^ohm:.*:(\d)$/.exec(x.key); return m ? Number(m[1]) : 0; };
const boundsCache = new WeakMap();
const boundsOf = (f) => { let b = boundsCache.get(f); if (!b) { b = geoBounds(f); boundsCache.set(f, b); } return b; };
function inside(f, [x, y]) {
  const [[x0, y0], [x1, y1]] = boundsOf(f);
  if (y < y0 || y > y1 || (x0 <= x1 ? (x < x0 || x > x1) : (x < x0 && x > x1))) return false;
  return geoContains(f, [x, y]);
}
function repPoint(items) {
  let best = null, bestA = -1;
  for (const it of items) {
    const g = it.f.geometry;
    for (const coords of g?.type === 'Polygon' ? [g.coordinates] : g?.coordinates ?? []) {
      const poly = { type: 'Polygon', coordinates: coords };
      const a = geoArea(poly);
      if (a > bestA) { bestA = a; best = poly; }
    }
  }
  return best && geoCentroid(best);
}
function fold(list) {
  for (const x of list) {
    const lvl = levelOf(x);
    if (lvl < 3) continue;
    const pt = repPoint(x.a ?? x.b);
    if (!pt) continue;
    const host = list.find((y) => y !== x && !y.within && y.area > x.area && (levelOf(y) < lvl) && (y.b ?? y.a).some((it) => inside(it.f, pt)));
    if (host) { x.within = host.key; host.inner = (host.inner ?? 0) + 1; }
  }
}

// States admitted, territories created, other areas (the District of Columbia, Newberry's republics, joint and
// disputed areas): the states tracker's "appeared", by kind and in order.
export function byKind(items) {
  const kind = (x) => (x.type === 'State' ? 'state' : /Territory/.test(x.type ?? '') ? 'territory' : 'other');
  const out = { state: [], territory: [], other: [] };
  for (const x of items) out[kind(x)].push(x);
  for (const k of Object.keys(out)) out[k].sort((p, q) => (p.since ?? 0) - (q.since ?? 0) || q.area - p.area);
  return out;
}

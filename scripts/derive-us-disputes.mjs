#!/usr/bin/env node
// Parchment — derive-us-disputes.mjs
// Land that two of Newberry's U.S. polygons claimed at once: the Toledo Strip (Ohio and Michigan Territory),
// Connecticut's Western Reserve, the Alabama–Mississippi line, the Honey War strip, Greer County, Texas against Utah
// Territory, the Michigan–Wisconsin line. Newberry records each dispute as two overlapping polygons, one per claim;
// this script computes their intersection (a computed overlap of downloaded shapes, nothing drawn), one piece per
// pair of polygon versions alive together, for the stage to hatch as a dispute (grammar §5). Newberry's own "Other"
// areas (Vermont Republic, Oregon Country, Deseret...) are drawn as disputes already and are left out.
// Each piece carries the whole dispute's span and, in Newberry's words, how it ended: the `change` text of the
// polygon that begins the day after, for either claimant.
//
// Usage: node scripts/derive-us-disputes.mjs   (reads data/us/newberry.topojson, writes data/us/nb-disputes.json)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoBounds, geoDistance } from 'd3';
import { feature } from 'topojson-client';
import polygonClipping from 'polygon-clipping';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const topo = JSON.parse(readFileSync(join(ROOT, 'data', 'us', 'newberry.topojson'), 'utf8'));
const nb = feature(topo, topo.objects.states).features.filter((f) => f.properties.type !== 'Other');
const MIN_KM2 = 50; // one source, one topology: a shared border leaves no sliver; every real dispute is larger

const KM2 = 6371 * 6371;
const rings = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
// polygon-clipping returns exterior rings counter-clockwise; d3-geo wants them clockwise (a polygon smaller than a
// hemisphere), so every ring is turned round.
const forD3 = (mp) => mp.map((poly) => poly.map((r) => [...r].reverse()));
const round = (mp) => mp.map((poly) => poly.map((r) => r.map(([x, y]) => [Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4])));
const nextDay = (d) => { const t = new Date(Date.UTC(Math.trunc(d / 10000), (Math.trunc(d / 100) % 100) - 1, (d % 100) + 1)); return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate(); };
const prefix = (id) => id.split('_')[0];

const box = new Map(nb.map((f) => [f, geoBounds(f)]));
const pieces = [];
for (let i = 0; i < nb.length; i++) for (let j = i + 1; j < nb.length; j++) {
  let [a, b] = [nb[i], nb[j]];
  if (a.properties.id === b.properties.id) continue;
  const s = Math.max(a.properties.s, b.properties.s), e = Math.min(a.properties.e, b.properties.e);
  if (s > e) continue;
  const [[ax0, ay0], [ax1, ay1]] = box.get(a), [[bx0, by0], [bx1, by1]] = box.get(b);
  if (ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0) continue;
  let inter;
  try { inter = polygonClipping.intersection(rings(a), rings(b)); } catch { continue; }
  if (!inter.length) continue;
  const geometry = { type: 'MultiPolygon', coordinates: round(forD3(inter)) };
  const km2 = geoArea(geometry) * KM2;
  if (km2 < MIN_KM2 || km2 > 2 * Math.PI * KM2) continue; // (the second: a ring the wrong way round)
  if (a.properties.name > b.properties.name) [a, b] = [b, a];
  pieces.push({ a: a.properties, b: b.properties, s, e, km2: Math.round(km2), geometry });
}

// One dispute per pair of claimants: its span over every piece, and how it ended in Newberry's words.
const disputes = new Map();
for (const p of pieces) {
  const k = `${p.a.id}|${p.b.id}`;
  const d = disputes.get(k) ?? { s: p.s, e: p.e };
  d.s = Math.min(d.s, p.s); d.e = Math.max(d.e, p.e);
  disputes.set(k, d);
}
for (const [k, d] of disputes) {
  const [ia, ib] = k.split('|');
  const after = nb.filter((f) => f.properties.s === nextDay(d.e) && [prefix(ia), prefix(ib)].includes(prefix(f.properties.id)) && f.properties.change);
  // prefer the record that names the dispute or the overlap
  const best = after.find((f) => /disput|overlap|claim|Supreme Court|ceded|sold/i.test(f.properties.change)) ?? after[0];
  d.ended = best ? { text: best.properties.change, cite: best.properties.cite ?? null, id: best.properties.id, v: best.properties.v } : null;
}

const out = {
  type: 'FeatureCollection',
  _source: 'Computed by scripts/derive-us-disputes.mjs from data/us/newberry.topojson (The Newberry Library, Atlas of Historical County Boundaries): the intersections of U.S. polygons alive at the same time. Nothing drawn.',
  features: pieces.map((p) => {
    const d = disputes.get(`${p.a.id}|${p.b.id}`);
    return {
      type: 'Feature',
      properties: { a: p.a.id, av: p.a.v, an: p.a.full || p.a.name, b: p.b.id, bv: p.b.v, bn: p.b.full || p.b.name, s: p.s, e: p.e, ds: d.s, de: d.e, km2: p.km2, ended: d.ended },
      geometry: p.geometry,
    };
  }).sort((x, y) => x.properties.s - y.properties.s),
};
writeFileSync(join(ROOT, 'data', 'us', 'nb-disputes.json'), `${JSON.stringify(out)}\n`);
for (const [k, d] of [...disputes].sort((x, y) => x[1].s - y[1].s)) console.log(`${d.s}–${d.e}  ${k}  ended: ${d.ended ? d.ended.text.slice(0, 110) : '(no record)'}`);
console.log(`nb-disputes: ${pieces.length} pieces, ${disputes.size} disputes → data/us/nb-disputes.json`);

// ---------------------------------------------------------------- 2. the United States against Mexico's states
// The same method across two sources: land a U.S. state or territory (Newberry) and a Mexican state or territory
// (OpenHistoricalMap, admin level 3–4, Mexican at some point in its record) claimed on the same days. From the
// annexation of Texas (29 December 1845) to the Mexican Cession (2 February 1848) the state of Texas overlaps
// Tamaulipas and Coahuila (the land between the Nueces and the Rio Grande) and Chihuahua and Nuevo México (the upper
// Rio Grande). Two sources trace a shared border differently, so slivers are dropped as for OHM's own overlaps
// (scripts/derive-us.mjs): a piece must be larger than 3,000 km² and thicker than 12 km. Newberry's "Other" areas
// (the Republic of Texas) are left out: before annexation OHM records that land as its Joint Mexico-Texas Claim
// (2 March 1836 – 28 December 1845), which the page hatches already, so the two eras meet without a gap or a
// second hatch. Dates: Newberry's last day is in force, OHM's end_date is the day a polygon ceased, so a piece's
// last day (inclusive, as Newberry's) is the day before the OHM polygon's end.
// Each piece says how it ended, from the records themselves: the OHM polygon's end_event (with the Newberry record of
// that name, when there is one: "Mexican Cession" is Newberry's mx_cession, which cites the Treaty of
// Guadalupe-Hidalgo), and, where the next version of the Newberry polygon no longer holds the piece, that version's
// change (the 1850 sale of Texas's western claims, which set the Texas–New Mexico line).
//   reads also data/us/ohm.topojson and data/us/ohm-sources.json (scripts/derive-ohm-sources.mjs)
//   writes data/us/usmx-disputes.json
{
  const ohmTopo = JSON.parse(readFileSync(join(ROOT, 'data', 'us', 'ohm.topojson'), 'utf8'));
  const tags = JSON.parse(readFileSync(join(ROOT, 'data', 'us', 'ohm-sources.json'), 'utf8')).relations;
  const allNB = feature(topo, topo.objects.states).features;
  const usNB = allNB.filter((f) => f.properties.type !== 'Other');
  const mx = feature(ohmTopo, ohmTopo.objects.ohm).features
    .filter((f) => (f.properties.lvl === 3 || f.properties.lvl === 4) && (f.properties.pw ?? []).some(([, pw]) => pw === 'mexico'));
  const MIN_KM2_X = 3000, MIN_KM_X = 12;
  const perimeterKm = (poly) => poly.reduce((L, ring) => L + ring.reduce((l, p, i) => (i ? l + geoDistance(ring[i - 1], p) * 6371 : 0), 0), 0);
  const prevDay = (d) => { const t = new Date(Date.UTC(Math.trunc(d / 10000), (Math.trunc(d / 100) % 100) - 1, (d % 100) - 1)); return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate(); };
  const mexico = 'Mexico';
  const xbox = new Map([...usNB, ...mx].map((f) => [f, geoBounds(f)]));
  const found = [];
  for (const a of usNB) for (const b of mx) {
    const pa = a.properties, pb = b.properties;
    const s = Math.max(pa.s, pb.s), e = Math.min(pa.e, prevDay(pb.e));
    if (s > e) continue;
    const [[ax0, ay0], [ax1, ay1]] = xbox.get(a), [[bx0, by0], [bx1, by1]] = xbox.get(b);
    if (ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0) continue;
    let inter;
    try { inter = polygonClipping.intersection(rings(a), rings(b)); } catch { continue; }
    const kept = [];
    for (const poly of forD3(inter)) {
      const g = { type: 'Polygon', coordinates: poly };
      const km2 = geoArea(g) * KM2;
      if (km2 < MIN_KM2_X || km2 > 2 * Math.PI * KM2 || km2 / perimeterKm(poly) < MIN_KM_X / 2) continue;
      kept.push(poly);
    }
    if (!kept.length) continue;
    const geometry = { type: 'MultiPolygon', coordinates: round(kept) };
    found.push({ a, b, s, e, km2: Math.round(geoArea(geometry) * KM2), geometry });
  }
  // How each piece ended, from both sides' records.
  const nbByName = (name) => allNB.filter((f) => (f.properties.full || f.properties.name) === name).sort((x, y) => x.properties.s - y.properties.s)[0];
  const endings = (x) => {
    const out = [];
    const pa = x.a.properties, pb = x.b.properties, tb = tags[pb.rid] ?? {};
    if (pb.e === nextDay(x.e)) {
      const nbRec = tb.ee ? nbByName(tb.ee) : null;
      out.push({
        day: pb.e, side: 'b', claimant: pb.name,
        text: tb.ee ? `${pb.name}: ${tb.ee} (OpenHistoricalMap)` : `${pb.name}'s polygon ends (OpenHistoricalMap, no event recorded)`,
        record: nbRec ? { text: nbRec.properties.change, cite: nbRec.properties.cite ?? null, id: nbRec.properties.id, v: nbRec.properties.v, s: nbRec.properties.s } : null,
      });
    }
    // the next version of the U.S. polygon: does it still hold the piece?
    const next = allNB.find((f) => f.properties.id === pa.id && f.properties.v === pa.v + 1);
    if (next) {
      let kept = 0;
      try { const r = polygonClipping.intersection(x.geometry.coordinates.map((p) => p.map((ring) => [...ring].reverse())), rings(next)); kept = r.length ? geoArea({ type: 'MultiPolygon', coordinates: forD3(r) }) * KM2 : 0; } catch { kept = 0; }
      if (kept < x.km2 * 0.5) out.push({ day: next.properties.s, side: 'a', claimant: pa.full || pa.name, text: next.properties.change, cite: next.properties.cite ?? null, id: next.properties.id, v: next.properties.v });
    } else if (pa.e === x.e) {
      const after = allNB.find((f) => f.properties.s === nextDay(pa.e) && prefix(f.properties.id) === prefix(pa.id));
      if (after) out.push({ day: after.properties.s, side: 'a', claimant: pa.full || pa.name, text: after.properties.change, cite: after.properties.cite ?? null, id: after.properties.id, v: after.properties.v });
    }
    return out.sort((p, q) => p.day - q.day);
  };
  // One dispute per pair of claimants (the Newberry id and the OHM state, by Wikidata item or name): its whole span,
  // and how its last piece ended (an earlier piece "ends" only because a new version of a polygon began).
  const key = (x) => `${x.a.properties.id}|${x.b.properties.wd ?? x.b.properties.name}`;
  const span = new Map();
  for (const x of found) {
    const d = span.get(key(x)) ?? { s: x.s, e: x.e, last: x };
    d.s = Math.min(d.s, x.s); d.e = Math.max(d.e, x.e);
    if (x.e >= d.last.e) d.last = x;
    span.set(key(x), d);
  }
  for (const d of span.values()) d.ended = endings(d.last);
  // A side is named as a reader would say it: a state or territory by its name, unorganized land as the United States.
  const party = (p) => (p.type === 'Unorganized Territory' ? 'United States' : (p.full || p.name));
  const usmx = {
    type: 'FeatureCollection',
    _source: 'Computed by scripts/derive-us-disputes.mjs: the intersections of U.S. states and territories (The Newberry Library, Atlas of Historical County Boundaries; data/us/newberry.topojson) with Mexican states and territories (OpenHistoricalMap, CC0; data/us/ohm.topojson) alive on the same days, pieces over 3,000 km² and 12 km thick. Nothing drawn.',
    features: found.map((x) => {
      const pa = x.a.properties, pb = x.b.properties, d = span.get(key(x));
      return {
        type: 'Feature',
        properties: {
          id: `${pa.id}.${pa.v}~${pb.rid}`, a: pa.id, av: pa.v, an: pa.full || pa.name, atype: pa.type, b: pb.rid, bn: pb.name, bwd: pb.wd ?? null, bpower: 'mexico',
          parties: [party(pa), mexico], s: x.s, e: x.e, ds: d.s, de: d.e, km2: x.km2, ended: d.ended,
        },
        geometry: x.geometry,
      };
    }).sort((p, q) => p.properties.s - q.properties.s || q.properties.km2 - p.properties.km2),
  };
  writeFileSync(join(ROOT, 'data', 'us', 'usmx-disputes.json'), `${JSON.stringify(usmx)}\n`);
  for (const f of usmx.features) {
    const p = f.properties;
    console.log(`${p.s}–${p.e}  ${p.an} (${p.a} v${p.av}) × ${p.bn} (OHM ${p.b})  ${p.km2.toLocaleString('en-US')} km²  ended: ${p.ended.map((x) => `${x.day} ${x.text.slice(0, 60)}`).join(' | ')}`);
  }
  console.log(`usmx-disputes: ${usmx.features.length} pieces → data/us/usmx-disputes.json`);
}

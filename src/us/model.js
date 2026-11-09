// Parchment — North America stage: the data model, without any drawing (the tests load this alone).
// Every polygon carries its own dates (YYYYMMDD integers); a date selects what was alive on that day.

import { feature } from 'topojson-client';

export const US_FROM = 17830903; // Treaty of Paris: Newberry's first day

export function prepareData({ nbTopo, ohmTopo, cesTopo, natTopo, pop = null, landsTopo = null }) {
  const nbGeoms = nbTopo.objects.states.geometries;
  const nb = feature(nbTopo, nbTopo.objects.states).features.map((f, i) => ({ src: 'newberry', f, g: nbGeoms[i], p: f.properties }));
  const ohmGeoms = ohmTopo.objects.ohm.geometries;
  const ohm = feature(ohmTopo, ohmTopo.objects.ohm).features.map((f, i) => ({ src: 'ohm', f, g: ohmGeoms[i], p: f.properties }));
  const ces = cesTopo ? feature(cesTopo, cesTopo.objects.cessions).features.map((f) => ({ src: 'royce', f, p: f.properties })) : [];
  const nat = natTopo ? feature(natTopo, natTopo.objects.native).features.map((f) => ({ src: 'hb', f, p: f.properties })) : [];
  // Native population (census counts and estimates, data/us/native.json) and Native lands (today's areas, and the
  // lands the Indian Claims Commission found to be original tribal territory; data/us/native-lands.topojson).
  const aiannh = landsTopo ? feature(landsTopo, landsTopo.objects.aiannh).features.map((f) => ({ src: 'aiannh', f, p: f.properties })) : [];
  const icc = landsTopo ? feature(landsTopo, landsTopo.objects.icc).features.map((f) => ({ src: 'icc', f, p: f.properties })) : [];
  // Land held under U.S. treaty before Removal: each nation's land between two treaties (the union of the Royce areas
  // it had still to cede), and where two nations' lands overlap on the same days.
  const objs = landsTopo?.objects ?? {};
  const treaty = objs.treaty ? feature(landsTopo, objs.treaty).features.map((f) => ({ src: 'treaty', f, p: f.properties })) : [];
  const treatyX = objs.treatyX ? feature(landsTopo, objs.treatyX).features.map((f) => ({ src: 'treatyX', f, p: f.properties })) : [];
  for (const it of [...nb, ...ohm]) it.g.properties = it.p; // mesh filters read the same properties
  return { nbTopo, ohmTopo, nb, ohm, ces, nat, pop, aiannh, icc, treaty, treatyX };
}

// Treaty land on a date: both ends inclusive (e is the day before the next treaty).
export const aliveTreaty = (data, d) => (data.treaty ?? []).filter((it) => it.p.s <= d && d <= it.p.e);
export const aliveTreatyX = (data, d) => (data.treatyX ?? []).filter((it) => it.p.s <= d && d <= it.p.e);

// Today's Native lands are drawn from the Census Bureau's 2025 boundaries, for dates from 2020 on: earlier
// boundaries differ (trust land is still being added), so they are not carried back.
export const LANDS_FROM = 20200101;
// Held land only: the Census Bureau's statistical areas (Alaska Native villages, Oklahoma tribal areas, tribal- and
// state-designated areas) are drawn for counting, and no one holds them as land.
export const aliveLands = (data, d) => (d >= LANDS_FROM ? (data.aiannh ?? []).filter((it) => it.p.kind !== 'statistical') : []);
// The Indian Claims Commission's original territories: an outline from the first cession (1784) to its map (1978).
export const ICC_FROM = 17840101, ICC_TO = 19781231;
export const aliveICC = (data, d) => (d >= ICC_FROM && d <= ICC_TO ? data.icc ?? [] : []);

// The power holding an OHM polygon on a date: the last segment that has begun.
export function powerAt(p, d) {
  let pw = 'other';
  for (const [from, x] of p.pw ?? []) if (from <= d) pw = x;
  return pw;
}
// Newberry's end dates are inclusive (its last day in force); OHM's end_date is the day the thing ceased.
export const aliveNB = (data, d) => data.nb.filter((it) => it.p.s <= d && d <= it.p.e);
export const aliveOHM = (data, d) => data.ohm.filter((it) => it.p.s <= d && d < it.p.e && !(it.p.us && d >= US_FROM));
export const aliveNative = (data, d) => data.nat.filter((it) => it.p.s <= d && d < it.p.e);

// Newberry's own names: "Unorg. Fed. Terr." → its full name where it has one.
export const nbName = (p) => p.full || p.name;

// Labels drop the source's disambiguations: "(1492-1493)", "[Proposed State]", and scripts the typeface lacks.
export function cleanLabel(t) {
  if (!t) return t;
  return t.replace(/\s*\((?:-?\d{1,4})[^)]*\)\s*$/, '').replace(/\s*\[[^\]]*\]/g, '')
    .replace(/[^\u0000-ɏḀ-ỿ‘’ʻʼ]/g, '').replace(/\s{2,}/g, ' ').trim()
    .replace(/^[^\p{L}(]+/u, '').replace(/^\(([^)]*)\)$/, '$1').trim() || null;
}

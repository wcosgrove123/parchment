// Parchment — the Holy Roman Empire's outer border on the political map (owner, 2026-11-09)
// Cliopatria (src/render/states.js) draws the Empire as a whole made of its members until 1458; from 1459 the name
// covers only "Holy Roman Empire Minor States". OpenHistoricalMap (CC0; scripts/fetch-europe.mjs, derive-europe.mjs →
// data/base/derived/realms.topojson) has the Empire's outer border dated by treaty for 24 October 1648 – 7 November 1659
// and 17 September 1678 – 23 February 1766 (its other entries carry no border). The owner, on the proposal to draw
// that border dashed and log the rest as gaps: "That's fine with me". So the band follows:
//   - OpenHistoricalMap's border when one is in force on 1 July of the year (dashed: every relation is tagged "needs
//     source for boundary lines");
//   - else Cliopatria's whole Empire while it lists more than one member;
//   - else nothing (1459–1648 and 1659–1678): a gap, not a guess.
// Its look, a band along the inside of the line, is the one the owner kept ("i'm fine sticking with our current style").

import { feature } from 'topojson-client';
import { geoArea } from 'd3';
import { isWholeEmpire } from './states.js';

export const dateOf = (year, mmdd = '07-01') => year * 10000 + Number(mmdd.slice(0, 2)) * 100 + Number(mmdd.slice(3, 5));
const polygonsOf = (g) => (!g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);

// → { features, source: 'ohm' | 'cliopatria', certainty, label, rids?, start?, end?, from?, to? } or null.
export function empireBand(year, { realmsTopo = null, states = null, label = 'Holy Roman Empire' } = {}) {
  if (realmsTopo) {
    const date = dateOf(year);
    const ohm = feature(realmsTopo, realmsTopo.objects.realms).features
      .filter((f) => f.properties.realm === 'hre' && f.properties.s <= date && date < f.properties.e);
    if (ohm.length) return { features: ohm, source: 'ohm', certainty: 'approximate', label, rids: ohm.map((f) => f.properties.rid), start: ohm[0].properties.start_raw, end: ohm[0].properties.end_raw };
  }
  const whole = states?.wholes.filter(isWholeEmpire) ?? [];
  if (whole.length) return { features: whole, source: 'cliopatria', certainty: year >= 1648 ? 'legal' : 'approximate', label, from: whole[0].properties.f, to: whole[0].properties.t };
  return null;
}

// The Empire's pieces by size: the band runs round the large ones; an enclave smaller than this keeps only the line
// (after 1648 OpenHistoricalMap draws dozens of them in Alsace and Lorraine, and a band round each is a smudge).
export const BAND_MIN_KM2 = 1500;
export function bandParts(features) {
  const big = [], small = [];
  for (const f of features) {
    for (const poly of polygonsOf(f.geometry)) {
      const g = { type: 'Polygon', coordinates: poly };
      (geoArea(g) * 6371 ** 2 >= BAND_MIN_KM2 ? big : small).push(poly);
    }
  }
  const asFeature = (polys) => (polys.length ? { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: polys } } : null);
  return { big: asFeature(big), small: asFeature(small) };
}

// The Empire's name over the middle of its largest piece, in the spaced capitals of .label.polity.hre (16 px, 0.24 em):
// → { id, text, x, y, box } or null. Placed before the states' names, which keep clear of its box.
export const EMPIRE_LABEL = { size: 16, spacing: 0.24 };
export function placeEmpireLabel(band, { labelData, measure }) {
  if (!band) return null;
  const biggest = band.features.slice().sort((a, b) => geoArea(b) - geoArea(a))[0];
  const [l] = labelData([{ ...biggest, properties: { ...biggest.properties, cls: { label: band.label } } }]);
  if (!l) return null;
  const w = (measure ? measure(l.text, { size: EMPIRE_LABEL.size }) : l.text.length * EMPIRE_LABEL.size * 0.6) + l.text.length * EMPIRE_LABEL.size * EMPIRE_LABEL.spacing;
  return { id: `hre:${l.id}`, text: l.text, x: l.x, y: l.y, box: { x: l.x - w / 2 - 3, y: l.y - EMPIRE_LABEL.size * 0.7, w: w + 6, h: EMPIRE_LABEL.size * 1.4 } };
}

// Draw the band into a snapshot's groups (base.js showStates' overlay.over), so it crossfades with the map.
let clipSeq = 0;
export function drawEmpireBand(g, lg, band, { d, defs, labelData, landClip, measure }, label = placeEmpireLabel(band, { labelData, measure })) {
  if (!band) return;
  const bandG = g.append('g').attr('class', `hre ${band.source}`);
  const { big, small } = bandParts(band.features);
  if (big) {
    const id = `hre-clip-${++clipSeq}`;
    defs.append('clipPath').attr('id', id).attr('class', 'hre-clip').append('path').attr('d', d(big));
    // A wide stroke clipped to the Empire itself, so only its inner half shows, kept on land.
    const inner = bandG.append('g').attr('clip-path', landClip ? `url(#${landClip})` : null);
    inner.append('path').attr('class', 'hre-band').attr('clip-path', `url(#${id})`).attr('d', d(big));
    bandG.append('path').attr('class', `hre-line ${band.certainty}`).attr('d', d(big));
  }
  if (small) bandG.append('path').attr('class', `hre-line small ${band.certainty}`).attr('d', d(small));
  // Old clip paths go with the snapshot they served (the crossfade removes the group; the defs stay small).
  const keep = new Set([...defs.selectAll('clipPath.hre-clip').nodes()].slice(-4));
  defs.selectAll('clipPath.hre-clip').filter(function () { return !keep.has(this); }).remove();
  // The Empire's name over its middle, in the spaced capitals of a region.
  lg.append('g').attr('class', 'empire-label').selectAll('text').data(label ? [label] : [], (l) => l.id).join('text')
    .attr('class', 'label polity hre')
    .attr('x', (l) => l.x).attr('y', (l) => l.y)
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .text((l) => l.text);
}

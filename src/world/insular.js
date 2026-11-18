// Parchment — the world page's island-territory layer (statehood brief of 2026-11-18, item 7): the model, no drawing
// (the tests load it alone). The pieces are data/world/insular.topojson (scripts/derive-insular.mjs): downloaded shapes,
// each dated to the day, the month or the year its source gives, with the kind of hold its source describes.

import { feature } from 'topojson-client';

// How the United States held a piece, and its look (grammar §5: a fill is belonging; the hatch is a dispute):
//   territory     U.S. territory (sovereignty: the five inhabited territories, the minor islands, the Philippines)
//   trust         held in trust for the United Nations (the Trust Territory of the Pacific Islands)
//   administered  run under a treaty without sovereignty (the Canal Zone's rights; the Ryukyus and the Bonins)
//   claim         claimed, disputed, later given up (the islands of 1971 to 1983): the hatch alone
export const HOLDS = {
  territory: { fill: 'In', label: 'U.S. territory' },
  trust: { fill: 'T', label: 'Held in trust for the United Nations' },
  administered: { fill: 'E', label: 'Run by the United States under a treaty' },
  claim: { pattern: 'hatch', label: 'Claimed by the United States, and disputed' },
};

export function prepareInsular(topo) {
  if (!topo?.objects?.insular) return { items: [], source: null };
  const items = feature(topo, topo.objects.insular).features.map((f) => ({ src: 'insular', f, p: f.properties }));
  return { items, source: topo._source ?? null };
}

// The pieces held on a day (YYYYMMDD), both ends inclusive.
export const insularOn = (layer, d) => (layer?.items ?? []).filter((it) => it.p.s <= d && d <= it.p.e);

// Inside a stretch its source does not date to the day (a start known to the month, an end known to the year): the
// piece is drawn there dashed (grammar §5: outline style is certainty), and the slip says so.
export const fuzzyOn = (it, d) => (it.p.fuzzy ?? []).some(([a, b]) => a <= d && d <= b);

// What a highlight may name: the piece's own keys (ia:pr; ia:um and ia:um_wake; ia:ttpi), its id and its name.
export function insularKeys(it, slug) {
  const keys = new Set();
  for (const k of [...(it.p.keys ?? []), it.p.id, it.p.name]) { const s = slug(k); if (s) keys.add(s); }
  return keys;
}

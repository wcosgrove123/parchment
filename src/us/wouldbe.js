// Parchment — the would-be states of the North America page (statehood brief of 2026-11-18, item 8; the deck's
// Appendix A): the model, no drawing (the tests load it alone). The pieces are data/us/wouldbe.topojson
// (scripts/derive-wouldbe.mjs, from data/us/wouldbe-states.csv): each computed from downloaded shapes along the line its
// own document drew, dated to the day, the month or the year its source gives, and keyed for what it was ("Proposed
// state (not recognized)", "Confederate territory", "Planned state (Jefferson's report, 1784)", ...).
//
// A would-be state is drawn only where an order's highlight names it (wb:franklin, wb:jefferson_1784, wb:greater_idaho):
// hatched over the land it would have taken (grammar §5: hatch is overlap), its edge in rust, dashed while its date is
// known only to the month or year (dash is certainty). The would-be states with polygons of their own elsewhere are lit
// by those: Deseret nb:ds_deseret, Sequoyah nb:it_indianterr, the Vermont and Texas republics nb:vt_republic and
// nb:tx_republic, Indian Stream ohm:2698236, the Republic of West Florida ohm:2747197, Transylvania ohm:2832024.

import { feature } from 'topojson-client';

export function prepareWouldbe(topo) {
  if (!topo?.objects?.wouldbe) return null;
  const items = feature(topo, topo.objects.wouldbe).features.map((f) => ({ src: 'wouldbe', f, p: f.properties }));
  return { items, source: topo._source ?? null };
}

// The pieces in force on a day (YYYYMMDD), both ends inclusive.
export const wouldbeOn = (layer, d) => (layer?.items ?? []).filter((it) => it.p.s <= d && d <= it.p.e);

// Inside a stretch its source does not date to the day: drawn there with a dashed edge, and the slip says so.
export const wbFuzzy = (it, d) => (it.p.fuzzy ?? []).some(([a, b]) => a <= d && d <= b);
// ...and to what: the stretch's length in YYYYMMDD (a month's runs under 100, a year's over).
export const wbFuzzyUnit = (it, d) => { const s = (it.p.fuzzy ?? []).find(([a, b]) => a <= d && d <= b); return s ? (s[1] - s[0] > 100 ? 'year' : 'month') : null; };

// Does an order's highlight name a would-be state? (The layer is read only then.)
export const namesWouldbe = (highlight) => /(^|,)\s*wb:/i.test(String(highlight ?? ''));

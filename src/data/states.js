// Parchment — states
// A row's `where` names a place three ways, oldest last:
//   a state id from vocab.states (`ottoman`, `songhai`): stable, no year; resolved to base polygons by NAME per year
//   a Wikidata QID (`Q605321`): a point, position only
//   a base-unit id (`ottoman-empire@1600`): one polygon in one snapshot year; still accepted, no longer offered
// Keeping the base map's names out of the table is what lets the border source change without touching a row.

const isQID = (s) => /^Q\d+$/.test(s);

export function indexStates(vocab) {
  const byId = new Map((vocab.states ?? []).map((s) => [s.id, s]));
  const units = new Map((vocab.base_units ?? []).map((u) => [u.id, u]));
  return { byId, units };
}

// → { kind: 'state', state } | { kind: 'point', qid } | { kind: 'unit', unit } | null
export function resolveWhere(index, where) {
  if (!where) return null;
  if (isQID(where)) return { kind: 'point', qid: where };
  const state = index.byId.get(where);
  if (state) return { kind: 'state', state };
  const unit = index.units.get(where);
  if (unit) return { kind: 'unit', unit };
  return null;
}

// A test for base-map features: does this polygon belong to `where` in `year`?
export function featureMatcher(index, where, year) {
  const r = resolveWhere(index, where);
  if (!r) return () => false;
  if (r.kind === 'state') { const names = new Set(r.state.names); return (f) => names.has(f.properties.name); }
  if (r.kind === 'unit') return (f) => f.properties.id === r.unit.id;
  return () => false;
}

// The snapshot year to open a region row on: the row's start if the state appears then, else its first year.
export function yearFor(index, where, start, years) {
  const r = resolveWhere(index, where);
  const have = r?.kind === 'state' ? r.state.years : r?.kind === 'unit' ? r.unit.years : years;
  const sorted = [...years].sort((a, b) => a - b);
  return sorted.find((y) => y >= start && have.includes(y)) ?? have.find((y) => years.includes(y)) ?? sorted[0];
}

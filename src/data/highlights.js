// Parchment — which tracked state a base polygon belongs to (the extent tracker, src/trackers/extent.json)
// A polygon is highlighted when its NAME matches a highlight entry alive in that year. An entry lights on every stage
// unless it names its `stages` (the Europe stage's states, 2026-11-09): then it lights only there, so a stage added
// later never changes another stage's map; `stages: []` lights only when asked. ?focus= (a lesson map) lights exactly
// the entries it names, on any stage. Pure: the tests load it alone.

export function makeHighlighter(highlights, { stage = null, focus = new Set() } = {}) {
  const byName = new Map();
  for (const h of highlights) for (const n of h.names) byName.set(n, h);
  return (name, year) => {
    const h = byName.get(name);
    if (!h || year < h.start || year > h.end) return null;
    if (focus.size) return focus.has(h.id) ? h : null;
    return !h.stages || h.stages.includes(stage) ? h : null;
  };
}

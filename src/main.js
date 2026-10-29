// Parchment — entry point
import * as d3 from 'd3';
import { loadJSON } from './data/loader.js';
import { createStage } from './render/base.js';
import stageEqualEarth from './stages/afro-eurasia.json';
import stageLambert from './stages/afro-eurasia-lambert.json';
import extent from './trackers/extent.json';

const params = new URLSearchParams(location.search);
const START_YEAR = Number(params.get('year')) || 1450;
// ?stage=afro-eurasia-lambert shows the alternative projection for comparison.
const STAGES = { [stageEqualEarth.id]: stageEqualEarth, [stageLambert.id]: stageLambert };
const stage = STAGES[params.get('stage')] ?? stageEqualEarth;

// Extent tracker: a base polygon is highlighted when its NAME matches a highlight entry alive in that year.
const byName = new Map();
for (const h of extent.highlights) for (const n of h.names) byName.set(n, h);
function classifyExtent(f, year) {
  const h = byName.get(f.properties.name);
  if (h && year >= h.start && year <= h.end) return { status: 'highlight', key: h.id, label: h.label };
  return { status: 'muted' };
}

async function main() {
  const t0 = performance.now();
  const [calendar, ne, bathy] = await Promise.all([
    loadJSON('data/calendar.json'),
    loadJSON('data/base/derived/ne.topojson'),
    loadJSON('data/base/derived/bathymetry.topojson'),
  ]);
  const years = calendar.snapshots.map((s) => s.year);
  const bySnapshot = new Map(calendar.snapshots.map((s) => [s.year, s]));

  const svg = d3.select('#map');
  const atlas = createStage(svg, stage, { ne, bathy });
  console.log(`stage built in ${(performance.now() - t0).toFixed(0)} ms`);

  const snapshot = (year) => loadJSON(`data/base/derived/world_${year}.topojson`);

  let current = null;
  async function show(year) {
    if (!years.includes(year)) return;
    const topo = await snapshot(year);
    const t = performance.now();
    atlas.showSnapshot(year, topo, classifyExtent);
    current = year;
    const meta = bySnapshot.get(year);
    document.title = `Parchment · ${year}`;
    d3.select('#year-readout').text(meta.source_year !== year ? `${year} · base map ${meta.source_year}` : `${year}`);
    d3.selectAll('#years button').classed('active', function () { return Number(this.dataset.year) === year; });
    console.log(`snapshot ${year}: ${(performance.now() - t).toFixed(1)} ms`);
  }

  // Year buttons.
  d3.select('#years').selectAll('button').data(years).join('button')
    .attr('data-year', (y) => y).text((y) => y)
    .on('click', (_, y) => show(y));

  // Keyboard: ← → step through the calendar.
  window.addEventListener('keydown', (e) => {
    const i = years.indexOf(current);
    if (e.key === 'ArrowRight') show(years[Math.min(i + 1, years.length - 1)]);
    if (e.key === 'ArrowLeft') show(years[Math.max(i - 1, 0)]);
  });

  await show(START_YEAR);
  document.body.classList.add('ready');
  // Prefetch the rest so switching is instant.
  for (const y of years) snapshot(y);
}

main().catch((err) => {
  console.error(err);
  d3.select('#problems').classed('hidden', false).text(`Parchment could not start: ${err.message}`);
});

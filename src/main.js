// Parchment — entry point
import * as d3 from 'd3';
import { loadJSON } from './data/loader.js';
import { createStage } from './render/base.js';
import { renderPNG, renderSVG, download, exportName } from './export/export.js';
import stageEqualEarth from './stages/afro-eurasia.json';
import stageLambert from './stages/afro-eurasia-lambert.json';
import extent from './trackers/extent.json';

const params = new URLSearchParams(location.search);
const START_YEAR = Number(params.get('year')) || 1450;
const START_FROM = Number(params.get('from')) || null; // ?from=1450&year=1750 opens the Diff view
const PLAY_HOLD_MS = 1500;

// ?stage=afro-eurasia-lambert shows the alternative projection for comparison.
const STAGES = { [stageEqualEarth.id]: stageEqualEarth, [stageLambert.id]: stageLambert };
const stage = STAGES[params.get('stage')] ?? stageEqualEarth;

// Extent tracker: a base polygon is highlighted when its NAME matches a highlight entry alive in that year.
const byName = new Map();
for (const h of extent.highlights) for (const n of h.names) byName.set(n, h);
function matchHighlight(f, year) {
  const h = byName.get(f.properties.name);
  return h && year >= h.start && year <= h.end ? h : null;
}
function classifyExtent(f, year) {
  const h = matchHighlight(f, year);
  return h ? { status: 'highlight', key: h.id, label: h.label } : { status: 'muted' };
}
// Diff identity: a tracked state keeps its identity across renames (Muscovy → Russia). With scope 'tracked'
// (the default) only tracked states take part; with scope 'all' every named polygon does, by its name.
function identifyFor(scope) {
  return (f, year) => {
    const h = matchHighlight(f, year);
    if (h) return { key: `h:${h.id}`, label: h.label };
    return scope === 'all' ? { key: `n:${f.properties.name}`, label: f.properties.name } : null;
  };
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
  const snapshot = (year) => loadJSON(`data/base/derived/world_${year}.topojson`);

  const state = { mode: 'snapshot', scope: params.get('scope') === 'all' ? 'all' : 'tracked', year: START_YEAR, from: START_FROM ?? years[Math.max(0, years.indexOf(START_YEAR) - 1)], playing: null };

  const svg = d3.select('#map');
  const atlas = createStage(svg, stage, { ne, bathy }, { tracker: extent, years, onYear: (y) => setYear(y) });
  console.log(`stage built in ${(performance.now() - t0).toFixed(0)} ms`);

  async function render() {
    const t = performance.now();
    if (state.mode === 'diff') {
      const [a, b] = await Promise.all([snapshot(state.from), snapshot(state.year)]);
      const diff = atlas.showDiff({ year: state.from, topo: a }, { year: state.year, topo: b }, identifyFor(state.scope));
      atlas.setRange({ year: state.from, sourceYear: bySnapshot.get(state.from).source_year }, { year: state.year, sourceYear: bySnapshot.get(state.year).source_year });
      document.title = `Parchment · ${state.from} → ${state.year}`;
      console.log(`diff ${state.from} → ${state.year}: ${(performance.now() - t).toFixed(1)} ms; appeared ${diff.appeared.length}, vanished ${diff.vanished.length}, persisted ${diff.persisted.length}`);
    } else {
      const topo = await snapshot(state.year);
      atlas.showSnapshot(state.year, topo, classifyExtent);
      atlas.setYear(state.year, bySnapshot.get(state.year).source_year);
      document.title = `Parchment · ${state.year}`;
      console.log(`snapshot ${state.year}: ${(performance.now() - t).toFixed(1)} ms`);
    }
    document.body.classList.toggle('mode-diff', state.mode === 'diff');
    d3.selectAll('#toolbar [data-mode]').classed('active', function () { return this.dataset.mode === state.mode; });
    d3.selectAll('#years button').classed('active', function () { return Number(this.dataset.year) === state.year; });
    d3.selectAll('#years-a button').classed('active', function () { return Number(this.dataset.year) === state.from; });
  }

  function setYear(y) { if (years.includes(y)) { state.year = y; render(); } }
  function setFrom(y) { if (years.includes(y)) { state.from = y; render(); } }
  function setMode(m) { state.mode = m; if (m === 'diff' && state.from === state.year) state.from = years[Math.max(0, years.indexOf(state.year) - 1)]; render(); }
  function step(delta) {
    const i = years.indexOf(state.year);
    const j = Math.max(0, Math.min(years.length - 1, i + delta));
    if (j !== i) setYear(years[j]);
    return j !== i;
  }
  function togglePlay() {
    if (state.playing) { clearInterval(state.playing); state.playing = null; }
    else {
      if (years.indexOf(state.year) === years.length - 1) setYear(years[0]);
      state.playing = setInterval(() => { if (!step(1)) togglePlay(); }, PLAY_HOLD_MS);
    }
    d3.select('#play').classed('active', !!state.playing).text(state.playing ? '❚❚' : '▶');
  }

  // Toolbar.
  const tb = d3.select('#toolbar').html('');
  const seg = tb.append('span').attr('class', 'seg');
  seg.append('button').attr('data-mode', 'snapshot').text('Snapshot').on('click', () => setMode('snapshot'));
  seg.append('button').attr('data-mode', 'diff').text('Diff').on('click', () => setMode('diff'));
  const ya = tb.append('span').attr('id', 'years-a').attr('class', 'years');
  ya.append('label').text('from');
  ya.selectAll('button').data(years).join('button').attr('data-year', (y) => y).text((y) => y).on('click', (_, y) => setFrom(y));
  const yb = tb.append('span').attr('id', 'years').attr('class', 'years');
  yb.append('label').text('to');
  yb.selectAll('button').data(years).join('button').attr('data-year', (y) => y).text((y) => y).on('click', (_, y) => setYear(y));
  const scopeLabel = tb.append('label').attr('id', 'scope').attr('title', 'Compare every named polygon, not just the tracked states');
  scopeLabel.append('input').attr('type', 'checkbox').property('checked', state.scope === 'all')
    .on('change', function () { state.scope = this.checked ? 'all' : 'tracked'; render(); });
  scopeLabel.append('span').text('all states');
  tb.append('span').attr('class', 'sep');
  tb.append('button').attr('id', 'play').attr('title', 'Play (space)').text('▶').on('click', togglePlay);

  // Export: PNG at 1920×1080 or 3840×2160, or SVG, of exactly what is on the sheet. Transparent background is off by default.
  tb.append('span').attr('class', 'sep');
  const exportMenu = tb.append('span').attr('class', 'menu');
  const exportBtn = exportMenu.append('button').attr('id', 'export').attr('title', 'Export the current view (E)').text('Export ▾')
    .on('click', () => exportMenu.classed('open', !exportMenu.classed('open')));
  const pop = exportMenu.append('span').attr('class', 'popover');
  const exportOpts = { transparent: false };
  const describe = () => ({ stage: stage.id, year: state.year, from: state.mode === 'diff' ? state.from : null });
  let exporting = false;
  async function doExport(kind) {
    if (exporting) return;
    exporting = true;
    exportMenu.classed('open', false);
    exportBtn.text('Exporting…').attr('disabled', true);
    try {
      const svgNode = svg.node();
      const info = describe();
      if (kind === 'svg') download(await renderSVG(svgNode, exportOpts), exportName({ ...info, ext: 'svg' }));
      else if (kind === '4k') download(await renderPNG(svgNode, { width: 3840, height: 2160, ...exportOpts }), exportName({ ...info, size: '4k', ext: 'png' }));
      else download(await renderPNG(svgNode, { width: 1920, height: 1080, ...exportOpts }), exportName({ ...info, ext: 'png' }));
    } catch (err) {
      console.error(err);
      d3.select('#problems').classed('hidden', false).text(`Export failed: ${err.message}`);
    } finally {
      exporting = false;
      exportBtn.text('Export ▾').attr('disabled', null);
    }
  }
  pop.append('button').text('PNG · 1920 × 1080').on('click', () => doExport('png'));
  pop.append('button').text('PNG · 3840 × 2160').on('click', () => doExport('4k'));
  pop.append('button').text('SVG').on('click', () => doExport('svg'));
  const tr = pop.append('label');
  tr.append('input').attr('type', 'checkbox').on('change', function () { exportOpts.transparent = this.checked; });
  tr.append('span').text('transparent background');
  document.addEventListener('click', (e) => { if (!exportMenu.node().contains(e.target)) exportMenu.classed('open', false); });

  // For scripts and checks: window.parchment.render{PNG,SVG}() return blobs of the current view.
  window.parchment = {
    renderPNG: (opts) => renderPNG(svg.node(), opts),
    renderSVG: (opts) => renderSVG(svg.node(), opts),
    exportName: (opts) => exportName({ ...describe(), ...opts }),
    get state() { return { ...state }; },
  };

  // Keyboard: ← → step through the calendar; space plays; D toggles the Diff view.
  window.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'd' || e.key === 'D') setMode(state.mode === 'diff' ? 'snapshot' : 'diff');
    else if (e.key === 'e' || e.key === 'E') doExport(e.shiftKey ? '4k' : 'png');
  });

  if (START_FROM) state.mode = 'diff';
  await render();
  document.body.classList.add('ready');
  // Prefetch the rest so switching is instant.
  for (const y of years) snapshot(y);
}

main().catch((err) => {
  console.error(err);
  d3.select('#problems').classed('hidden', false).text(`Parchment could not start: ${err.message}`);
});

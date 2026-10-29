// Parchment — entry point
import * as d3 from 'd3';
import { loadJSON } from './data/loader.js';
import { loadRecordsText } from './data/source.js';
import { createStage } from './render/base.js';
import { renderPNG, renderSVG, download, exportName } from './export/export.js';
import { validateRecords, recordsFor } from './data/records.js';
import stageEqualEarth from './stages/afro-eurasia.json';
import stageLambert from './stages/afro-eurasia-lambert.json';
import extent from './trackers/extent.json';
import expansion from './trackers/expansion.json';

// v0 trackers. Extent highlights base polygons; expansion draws point records by shape.
const TRACKERS = { extent: { ...extent, id: 'extent' }, expansion };

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
  const [calendar, ne, bathy, vocab, source] = await Promise.all([
    loadJSON('data/calendar.json'),
    loadJSON('data/base/derived/ne.topojson'),
    loadJSON('data/base/derived/bathymetry.topojson'),
    loadJSON('data/vocab.json'),
    loadRecordsText(),
  ]);

  // Records: validated against vocab.json; bad rows are skipped and listed, never fatal.
  const checked = source.text == null
    ? { records: [], problems: [{ line: 0, id: '', message: 'data/records.csv could not be loaded' }], examples: 0, total: 0 }
    : validateRecords(source.text, vocab);
  const records = checked.records;
  const noCoords = records.filter((r) => r.kind === 'point' && (r.lon == null || r.lat == null));
  console.log(`records (${source.from}): ${checked.total} rows · ${records.length} render · ${checked.examples} examples · ${checked.problems.length} skipped`);
  showDataProblems(checked, noCoords, source);
  const years = calendar.snapshots.map((s) => s.year);
  const bySnapshot = new Map(calendar.snapshots.map((s) => [s.year, s]));
  const snapshot = (year) => loadJSON(`data/base/derived/world_${year}.topojson`);

  const state = { mode: 'snapshot', scope: params.get('scope') === 'all' ? 'all' : 'tracked', tracker: TRACKERS[params.get('tracker')] ? params.get('tracker') : 'extent', year: START_YEAR, from: START_FROM ?? years[Math.max(0, years.indexOf(START_YEAR) - 1)], playing: null };

  const svg = d3.select('#map');
  const atlas = createStage(svg, stage, { ne, bathy }, { tracker: TRACKERS[state.tracker], years, onYear: (y) => setYear(y) });
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
      atlas.setTracker(TRACKERS[state.tracker]);
      // Extent highlights the tracked states; expansion shows every polity muted and the point records on top.
      atlas.showSnapshot(state.year, topo, state.tracker === 'extent' ? classifyExtent : () => ({ status: 'muted' }));
      const n = atlas.showMarks(state.tracker === 'expansion' ? recordsFor(records, 'expansion', state.year, years) : []);
      atlas.setYear(state.year, bySnapshot.get(state.year).source_year);
      document.title = `Parchment · ${state.year}`;
      console.log(`snapshot ${state.year} (${state.tracker}): ${(performance.now() - t).toFixed(1)} ms${n ? `, ${n} marks` : ''}`);
    }
    if (state.mode === 'diff') atlas.showMarks([]);
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
  const trackerSel = tb.append('select').attr('id', 'tracker').attr('title', 'Tracker')
    .on('change', function () { state.tracker = this.value; render(); });
  trackerSel.selectAll('option').data(Object.values(TRACKERS)).join('option').attr('value', (t) => t.id).text((t) => t.title).property('selected', (t) => t.id === state.tracker);
  tb.append('span').attr('class', 'sep');
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
  // Teacher side: the admin page (table, problems, coverage, place finder). Chrome only, never exported.
  tb.append('a').attr('class', 'admin-link').attr('href', 'admin.html').attr('title', 'The record table, problems and coverage').text('Admin');
  // Credits: who made the atlas and where the data comes from, with the licence file. Site chrome only.
  const about = tb.append('span').attr('class', 'menu');
  about.append('button').attr('id', 'about').attr('title', 'About Parchment').text('ⓘ')
    .on('click', () => about.classed('open', !about.classed('open')));
  const ap = about.append('span').attr('class', 'popover about');
  ap.append('p').html('<b>Parchment</b> — a historical timeline atlas for the classroom.<br>Atlas, design and ideas: Wil Cosgrove.');
  ap.append('p').html('Borders: <a href="https://github.com/aourednik/historical-basemaps" target="_blank" rel="noopener">historical-basemaps</a> (GPL-3). Coast, rivers, relief: <a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a> (public domain). Place coordinates: Wikidata (CC0). Type: Libre Baskerville (OFL).');
  ap.append('p').html('<a href="https://github.com/wcosgrove123/parchment/blob/main/docs/DATA-LICENSES.md" target="_blank" rel="noopener">Data licences and attribution</a> · <a href="https://github.com/wcosgrove123/parchment" target="_blank" rel="noopener">Source</a> (MIT)');
  document.addEventListener('click', (e) => {
    if (!exportMenu.node().contains(e.target)) exportMenu.classed('open', false);
    if (!about.node().contains(e.target)) about.classed('open', false);
  });

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

// The data-problems panel: every skipped row with its line number and reason, plus point rows still waiting
// for coordinates. Chrome only; hidden in shots and never part of an export.
function showDataProblems({ problems, examples, total }, noCoords, source = {}) {
  const panel = d3.select('#data-problems');
  if (!problems.length && !noCoords.length && source.from !== 'fallback') { panel.classed('hidden', true); return; }
  panel.classed('hidden', false).html('');
  const h = panel.append('h2');
  h.append('span').text(`Data problems · ${problems.length} row${problems.length === 1 ? '' : 's'} skipped`);
  h.append('button').attr('title', 'Hide').text('×').on('click', () => panel.classed('hidden', true));
  const ol = panel.append('ol');
  ol.selectAll('li').data(problems).join('li').html((p) => `<b>line ${p.line}</b>${p.id ? ` (${p.id})` : ''}: ${escapeHTML(p.message)}`);
  if (noCoords.length) panel.append('p').attr('class', 'note').text(`${noCoords.length} point row${noCoords.length === 1 ? '' : 's'} waiting for coordinates (run node scripts/geocode.mjs): ${noCoords.map((r) => r.id).join(', ')}`);
  if (source.from === 'fallback') panel.append('p').attr('class', 'note').text(`The Google Sheet could not be reached (${source.error}); showing the saved copy of the table instead.`);
  const where = source.from === 'sheet' ? 'the Google Sheet' : 'records.csv';
  panel.append('p').attr('class', 'note').text(`${where}: ${total} rows, ${total - problems.length - examples} drawn, ${examples} examples not drawn.`);
}
const escapeHTML = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

main().catch((err) => {
  console.error(err);
  d3.select('#problems').classed('hidden', false).text(`Parchment could not start: ${err.message}`);
});

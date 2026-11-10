// Parchment — entry point
import * as d3 from 'd3';
import { loadJSON } from './data/loader.js';
import { loadRecordsText } from './data/source.js';
import { createStage } from './render/base.js';
import { renderPNG, renderSVG, download, exportName } from './export/export.js';
import { validateRecords, recordsFor, recordsInRange, resolveRecords } from './data/records.js';
import { routeLegend } from './render/routes.js';
import stageEqualEarth from './stages/afro-eurasia.json';
import stageLambert from './stages/afro-eurasia-lambert.json';
import stageWorld from './stages/world.json';
import stageWorldPacific from './stages/world-pacific.json';
import stageEurope from './stages/europe.json';
import { stageYears, snapYear } from './data/calendar.js';
import { makeHighlighter } from './data/highlights.js';
import extent from './trackers/extent.json';
import expansion from './trackers/expansion.json';
import routes from './trackers/routes.json';
import explorers from './trackers/explorers.json';
import { makeStatesSource, isRealmLine } from './render/states.js';
import { empireMarking, empireLegendRows, drawEmpireBand, placeEmpireLabel, placeMinorLabel, drawMinorLabel, MINOR_LABEL } from './render/realms.js';

// Trackers. Extent is the political map (owner, 2026-11-09): every state in force in the year shown, each in its own
// color, from Cliopatria; expansion draws point records by shape; routes draws path and arrow records through gazetteer
// waypoints with the points on them; explorers (owner, 2026-11-06) draws every expedition whose dates touch a typed
// range of years, colored by the state that sent it. Under the last three the states are drawn quiet, as ground.
const TRACKERS = { extent: { ...extent, id: 'extent' }, expansion, routes, explorers };

// The political map's legend: what is on this map only.
function statesLegend(year, view, marking) {
  const rows = [{ swatch: 'states', label: 'Each state in its own color' }];
  rows.push(year >= 1648 ? { swatch: 'line', style: 'solid', label: 'Documented border' } : { swatch: 'line', style: 'dashed', label: 'Approximate border' });
  if (view.wholes.some(isRealmLine)) rows.push({ swatch: 'whole', label: 'A realm around its members' });
  rows.push(...empireLegendRows(marking));
  return { ...TRACKERS.extent, title: 'States', legend: rows };
}

// A route layer's legend names only what is on the map: route classes (or sending states), point types, certainties.
function legendFor(tracker, rows) {
  const lines = rows.filter((r) => r.kind !== 'point');
  const points = rows.filter((r) => r.kind === 'point');
  const seen = new Set();
  const pointRows = [];
  for (const p of points) {
    const e = tracker.point_legend[p.value];
    if (e && !seen.has(e.label)) { seen.add(e.label); pointRows.push(e); }
  }
  const legend = [...routeLegend(lines), ...pointRows];
  return { ...tracker, legend: legend.length ? legend : tracker.legend };
}

const params = new URLSearchParams(location.search);
const START_YEAR = Number(params.get('year')) || 1450;
const START_FROM = Number(params.get('from')) || null; // ?from=1450&year=1750 opens the Diff view
const PLAY_HOLD_MS = 1500;

// ?stage=afro-eurasia-lambert shows the alternative projection for comparison. ?stage=world is the whole globe with the
// Atlantic in view (Unit 4 voyages); ?stage=world-pacific is the same globe centered on the Pacific (the owner asked for both).
// ?stage=europe is Europe for its own lessons, absolutism first (the owner asked for it on 2026-11-09).
const STAGES = Object.fromEntries([stageEqualEarth, stageLambert, stageWorld, stageWorldPacific, stageEurope].map((s) => [s.id, s]));
const stage = STAGES[params.get('stage')] ?? stageEqualEarth;
// ?band=focus|moss|rust|navy draws the Empire's band in another of the apparatus colors, for the owner to compare.
const BAND = params.get('band');
if (['navy', 'focus', 'moss', 'rust', 'steel'].includes(BAND)) document.documentElement.style.setProperty('--band', `var(--${BAND})`);

// Extent tracker: a base polygon is highlighted when its NAME matches a highlight entry alive in that year; an entry
// that names its stages lights only there (src/data/highlights.js).
// ?focus=ottoman,safavid,mughal,qing limits the highlights to those tracked states (ids from extent.json): a lesson map.
const FOCUS = new Set((params.get('focus') || '').split(',').map((s) => s.trim()).filter(Boolean));
const highlightFor = makeHighlighter(extent.highlights, { stage: stage.id, focus: FOCUS });
const matchHighlight = (f, year) => highlightFor(f.properties.name, year);
function classifyExtent(f, year) {
  const h = matchHighlight(f, year);
  return h ? { status: 'highlight', key: h.id, label: h.label } : { status: 'muted' };
}
// The political map: every state in force has its color ("every empire existing during whatever year is selected",
// owner, 2026-11-09); ?focus= keeps the named ones and quiets the rest. A tracked state is named as its entry says
// (the name of the time) on every stage; any other by Cliopatria's own name.
const entryByName = new Map(extent.highlights.flatMap((h) => h.names.map((n) => [n, h])));
const entryFor = (f, year) => { const h = entryByName.get(f.properties.name); return h && year >= h.start && year <= h.end ? h : null; };
function classifyState(f, year) {
  const h = entryFor(f, year);
  if (FOCUS.size && !(h && FOCUS.has(h.id))) return { status: 'muted', label: h?.label };
  return { status: 'state', key: h?.id, label: h?.label };
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
  const [calendar, ne, bathy, vocab, gazetteer, source, cliopatriaTopo, realmsTopo] = await Promise.all([
    loadJSON('data/calendar.json'),
    loadJSON('data/base/derived/ne.topojson'),
    loadJSON('data/base/derived/bathymetry.topojson'),
    loadJSON('data/vocab.json'),
    loadJSON('data/gazetteer.json').catch(() => ({})),
    loadRecordsText(),
    // Every state from 1200 to 2000 (Cliopatria; about 10 MB, 2 MB as served), and the Empire's dated outer border.
    loadJSON('data/base/derived/cliopatria.topojson'),
    loadJSON('data/base/derived/realms.topojson').catch(() => null),
    // The label pass measures text with the real font, so the four faces are loaded before the first render.
    document.fonts?.load ? Promise.all(['400', '700', 'italic 400', 'italic 700'].map((f) => document.fonts.load(`${f} 13px "Libre Baskerville"`).catch(() => null))) : null,
  ]);

  // Records: validated against vocab.json; bad rows are skipped and listed, never fatal. Routes and points take
  // their coordinates from the gazetteer (data/gazetteer.json, written by scripts/geocode.mjs).
  const checked = source.text == null
    ? { records: [], problems: [{ line: 0, id: '', message: 'data/records.csv could not be loaded' }], examples: 0, total: 0 }
    : validateRecords(source.text, vocab);
  const resolved = resolveRecords(checked.records, gazetteer);
  const records = resolved.records;
  const noCoords = resolved.waiting;
  console.log(`records (${source.from}): ${checked.total} rows · ${records.length} render · ${checked.examples} examples · ${checked.problems.length} skipped · ${noCoords.length} waiting for coordinates`);
  showDataProblems(checked, noCoords, source);
  // Any year (owner, 2026-11-09: "i want to be able to type in any year and see the geopolitical landscape of the
  // world"): every stage draws the states in force that year from one source, Cliopatria. The calendar's years are
  // suggestions (the year buttons, the dots on the strip, the steps of ← → and Play); any other year can be typed.
  const cliopatria = makeStatesSource(cliopatriaTopo);
  const years = calendar.suggested ?? stageYears(calendar, stage);
  const [spanMin, spanMax] = stage.span;
  const clampYear = (y) => Math.max(spanMin, Math.min(spanMax, Math.round(y)));
  const state = { mode: 'snapshot', scope: params.get('scope') === 'all' ? 'all' : 'tracked', tracker: TRACKERS[params.get('tracker')] ? params.get('tracker') : 'extent', year: clampYear(START_YEAR), from: null, playing: null };
  state.from = START_FROM ? clampYear(START_FROM) : ([...years].reverse().find((y) => y < state.year) ?? years[0]);
  // Explorers: a typed range of years, any years (?tracker=explorers&from=1492&year=1522), over the states of the range's end.
  state.span = { from: clampYear(START_FROM ?? 1492), to: clampYear(Number(params.get('year')) || 1522) };
  if (state.span.from > state.span.to) state.span = { from: state.span.to, to: state.span.from };
  let lastView = null;

  const svg = d3.select('#map');
  const atlas = createStage(svg, stage, { ne, bathy }, { tracker: TRACKERS[state.tracker], years, onYear: (y) => setYear(y) });
  console.log(`stage built in ${(performance.now() - t0).toFixed(0)} ms`);

  async function render() {
    const t = performance.now();
    for (const id of Object.keys(TRACKERS)) document.body.classList.toggle(`tracker-${id}`, id === state.tracker);
    d3.select('#year-in').property('value', state.year);
    const quiet = () => ({ status: 'muted' });
    if (state.tracker === 'explorers') {
      const { from, to } = state.span;
      const view = cliopatria.at(to);
      const rows = recordsInRange(records, 'explorers', from, to);
      atlas.setTracker(legendFor(explorers, rows));
      atlas.showStates(to, view, quiet);
      const n = atlas.showRecords({ points: rows.filter((r) => r.kind === 'point'), routes: rows.filter((r) => r.kind === 'path' || r.kind === 'arrow') });
      atlas.setSpan(from, to);
      document.title = `Parchment · ${from}–${to}`;
      document.body.classList.remove('mode-diff');
      const dropped = n.labels.filter((l) => l.dropped);
      console.log(`explorers ${from}–${to} over the states of ${to}: ${(performance.now() - t).toFixed(1)} ms, ${n.routes} lines, ${n.marks} marks${dropped.length ? `; labels not placed: ${dropped.map((l) => `${l.id} (${l.dropped})`).join(', ')}` : ''}`);
      return;
    }
    if (state.mode === 'diff') {
      const a = cliopatria.at(state.from), b = cliopatria.at(state.year);
      const diff = atlas.showDiff({ year: state.from, view: a }, { year: state.year, view: b }, identifyFor(state.scope));
      atlas.setRange({ year: state.from }, { year: state.year });
      document.title = `Parchment · ${state.from} → ${state.year}`;
      console.log(`diff ${state.from} → ${state.year}: ${(performance.now() - t).toFixed(1)} ms; appeared ${diff.appeared.length}, vanished ${diff.vanished.length}, persisted ${diff.persisted.length}`);
    } else {
      // The political map colors every state; expansion and routes draw them quiet with the records on top. The
      // Empire's band rides on the political map only.
      const view = cliopatria.at(state.year);
      const political = state.tracker === 'extent';
      // The Empire: its band where a source dates its border; in the years none does, its minor states named and a
      // legend line saying so (owner, 2026-11-10: "Yes, mark them"; src/render/realms.js).
      const marking = political ? empireMarking(state.year, { realmsTopo, states: view }) : { band: null, gap: false, minor: null };
      const band = marking.band;
      const rows = political ? [] : recordsFor(records, state.tracker, state.year, [...years, state.year]);
      atlas.setTracker(state.tracker === 'routes' ? legendFor(routes, rows) : political ? statesLegend(state.year, view, marking) : TRACKERS[state.tracker]);
      let empireName = null, minorName = null;
      const overlay = band
        ? { reserve: (ctx) => { empireName = placeEmpireLabel(band, ctx); return empireName ? [empireName.box] : []; }, over: (g, lg, ctx) => drawEmpireBand(g, lg, band, ctx, empireName) }
        : marking.minor
          ? { reserve: (ctx) => { minorName = placeMinorLabel(marking.minor, ctx); return minorName ? [minorName.box] : []; }, over: (g, lg) => drawMinorLabel(lg, minorName) }
          : null;
      // (In a gap year the minor states carry their name from the overlay, placed first; the label pass leaves them.)
      const classify = !political ? quiet : marking.minor ? (f, y) => ({ ...classifyState(f, y), ...(f === marking.minor ? { label: MINOR_LABEL, noLabel: true } : {}) }) : classifyState;
      atlas.showStates(state.year, view, classify, overlay);
      lastView = { year: state.year, states: view.states.map((f) => ({ name: f.properties.n, from: f.properties.f, to: f.properties.t, color: f.properties.c, status: f.properties.cls.status, label: f.properties.cls.label ?? null })), wholes: view.wholes.map((f) => f.properties.n), empire: band ? { source: band.source, rids: band.rids ?? null, from: band.from ?? band.start, to: band.to ?? band.end } : marking.gap ? { gap: true, minor: minorName?.text ?? null } : null };
      const n = atlas.showRecords({ points: rows.filter((r) => r.kind === 'point'), routes: rows.filter((r) => r.kind === 'path' || r.kind === 'arrow') });
      atlas.setYear(state.year);
      document.title = `Parchment · ${state.year}`;
      const dropped = n.labels.filter((l) => l.dropped);
      console.log(`snapshot ${state.year} (${state.tracker}): ${(performance.now() - t).toFixed(1)} ms${n.marks ? `, ${n.marks} marks` : ''}${n.routes ? `, ${n.routes} routes` : ''}${dropped.length ? `; labels not placed: ${dropped.map((l) => `${l.id} (${l.dropped})`).join(', ')}` : ''}`);
    }
    if (state.mode === 'diff') atlas.showRecords();
    document.body.classList.toggle('mode-diff', state.mode === 'diff');
    d3.selectAll('#toolbar [data-mode]').classed('active', function () { return this.dataset.mode === state.mode; });
    d3.selectAll('#years button').classed('active', function () { return Number(this.dataset.year) === state.year; });
    d3.selectAll('#years-a button').classed('active', function () { return Number(this.dataset.year) === state.from; });
  }

  function setYear(y) { const c = clampYear(y); if (Number.isFinite(c)) { state.year = c; render(); } }
  function setFrom(y) { const c = clampYear(y); if (Number.isFinite(c)) { state.from = c; render(); } }
  function setMode(m) { state.mode = m; if (m === 'diff' && state.from === state.year) state.from = [...years].reverse().find((y) => y < state.year) ?? years[0]; render(); }
  // ← → and Play step from the year shown to the next suggested year either way.
  function step(delta) {
    const next = delta > 0 ? years.find((y) => y > state.year) : [...years].reverse().find((y) => y < state.year);
    if (next != null) setYear(next);
    return next != null;
  }
  function togglePlay() {
    if (state.playing) { clearInterval(state.playing); state.playing = null; }
    else {
      if (state.year >= years[years.length - 1]) setYear(years[0]);
      state.playing = setInterval(() => { if (!step(1)) togglePlay(); }, PLAY_HOLD_MS);
    }
    d3.select('#play').classed('active', !!state.playing).text(state.playing ? '❚❚' : '▶');
  }

  // Toolbar.
  const tb = d3.select('#toolbar').html('');
  const trackerSel = tb.append('select').attr('id', 'tracker').attr('title', 'Tracker')
    .on('change', function () { state.tracker = this.value; render(); });
  trackerSel.selectAll('option').data(Object.values(TRACKERS)).join('option').attr('value', (t) => t.id).text((t) => t.title).property('selected', (t) => t.id === state.tracker);
  // Explorers: a range of years typed in (owner, 2026-11-06); Enter or leaving the box redraws. Shown only under Explorers.
  const spanBox = tb.append('span').attr('id', 'span').attr('title', 'Every expedition whose dates touch these years');
  spanBox.append('label').attr('for', 'span-from').text('from');
  const fromIn = spanBox.append('input').attr('id', 'span-from').attr('type', 'number').attr('step', 1).attr('min', spanMin).attr('max', spanMax);
  spanBox.append('label').attr('for', 'span-to').text('to');
  const toIn = spanBox.append('input').attr('id', 'span-to').attr('type', 'number').attr('step', 1).attr('min', spanMin).attr('max', spanMax);
  // The lesson ranges (src/trackers/explorers.json → ranges, owner 2026-11-06): one click each, for the Windows app,
  // which has no address bar. The one that matches the typed range is lit.
  const presets = spanBox.selectAll('button.span-preset').data(explorers.ranges ?? []).join('button').attr('class', 'span-preset')
    .attr('title', (r) => r.title ?? null).text((r) => `${r.from}–${r.to}`)
    .on('click', (_, r) => { const changed = r.from !== state.span.from || r.to !== state.span.to; state.span = { from: clampYear(r.from), to: clampYear(r.to) }; showSpan(); if (changed) render(); });
  const showSpan = () => {
    fromIn.property('value', state.span.from); toIn.property('value', state.span.to);
    presets.classed('active', (r) => r.from === state.span.from && r.to === state.span.to);
  };
  function setSpan() {
    const a = Number(fromIn.property('value')), b = Number(toIn.property('value'));
    if (!Number.isFinite(a) || !Number.isFinite(b) || fromIn.property('value') === '' || toIn.property('value') === '') { showSpan(); return; }
    const [from, to] = [clampYear(Math.min(a, b)), clampYear(Math.max(a, b))];
    const changed = from !== state.span.from || to !== state.span.to;
    state.span = { from, to };
    showSpan(); // shows the years as used: swapped if typed backwards, kept inside the stage's span
    if (changed) render();
  }
  for (const input of [fromIn, toIn]) input.on('change', setSpan).on('keydown', (e) => { if (e.key === 'Enter') setSpan(); });
  showSpan();
  // Any year typed in (owner, 2026-11-09); Enter or leaving the box redraws. Not under Explorers, which types a range.
  const yearBox = tb.append('span').attr('id', 'year-box').attr('title', 'Any year: every state in force that year (Cliopatria)');
  yearBox.append('label').attr('for', 'year-in').text('year');
  const yearIn = yearBox.append('input').attr('id', 'year-in').attr('type', 'number').attr('step', 1).attr('min', spanMin).attr('max', spanMax).property('value', state.year);
  function setTypedYear() {
    const raw = yearIn.property('value'), v = Number(raw);
    if (raw === '' || !Number.isFinite(v)) { yearIn.property('value', state.year); return; }
    const y = clampYear(v);
    yearIn.property('value', y);
    if (y !== state.year) { state.year = y; render(); }
  }
  yearIn.on('change', setTypedYear).on('keydown', (e) => { if (e.key === 'Enter') setTypedYear(); });
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
  // Export names: a year, a Diff's two years, or the Explorers layer's typed range (parchment-world-1492-1522.png).
  const describe = () => (state.tracker === 'explorers'
    ? { stage: stage.id, year: state.span.to, from: state.span.from }
    : { stage: stage.id, year: state.year, from: state.mode === 'diff' ? state.from : null });
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
  tb.append('a').attr('class', 'admin-link').attr('href', 'us.html').attr('title', 'The North America stage: 1492 to the present').text('North America');
  // The world stage and Afro-Eurasia link to each other (the same page, another ?stage=).
  // On the world stage, a switch between its Atlantic and Pacific views keeps the year, tracker and records file.
  const keep = (id) => { const q = new URLSearchParams(location.search); q.set('stage', id); q.set('year', state.year); q.set('tracker', state.tracker); return `?${q}`; };
  if (stage.id === 'world') tb.append('a').attr('class', 'admin-link').attr('href', keep('world-pacific')).attr('title', 'The same world centered on the Pacific').text('Pacific view').on('click', function () { this.href = keep('world-pacific'); });
  if (stage.id === 'world-pacific') tb.append('a').attr('class', 'admin-link').attr('href', keep('world')).attr('title', 'The same world with the Atlantic in view').text('Atlantic view').on('click', function () { this.href = keep('world'); });
  if (stage.id.startsWith('world')) tb.append('a').attr('class', 'admin-link').attr('href', '?').attr('title', 'The Afro-Eurasia stage').text('Afro-Eurasia');
  else tb.append('a').attr('class', 'admin-link').attr('href', '?stage=world').attr('title', 'The whole world: transoceanic voyages and exchanges').text('World');
  // Europe (2026-11-09) and Afro-Eurasia link to each other, keeping the year and tracker.
  if (stage.id === 'europe') tb.append('a').attr('class', 'admin-link').attr('href', '?').attr('title', 'The Afro-Eurasia stage').text('Afro-Eurasia');
  else tb.append('a').attr('class', 'admin-link').attr('href', keep('europe')).attr('title', 'Europe on its own: absolutism, the Reformation, the wars of religion').text('Europe').on('click', function () { this.href = keep('europe'); });
  // Credits: who made the atlas and where the data comes from, with the licence file. Site chrome only.
  const about = tb.append('span').attr('class', 'menu');
  about.append('button').attr('id', 'about').attr('title', 'About Parchment').text('ⓘ')
    .on('click', () => about.classed('open', !about.classed('open')));
  const ap = about.append('span').attr('class', 'popover about');
  ap.append('p').html('<b>Parchment</b> — a historical timeline atlas for the classroom.<br>Atlas, design and ideas: Wil Cosgrove.');
  ap.append('p').html('States: <a href="https://github.com/Seshat-Global-History-Databank/cliopatria" target="_blank" rel="noopener">Cliopatria</a>, Seshat Global History Databank (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>; simplified and colored for Parchment); the Holy Roman Empire\'s border from 1648: <a href="https://www.openhistoricalmap.org" target="_blank" rel="noopener">OpenHistoricalMap</a> (CC0). Coast, rivers, relief: <a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a> (public domain). Place coordinates: Wikidata (CC0). Type: Libre Baskerville (OFL).');
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
    // The political map: the states the last map drew (Cliopatria's names and years, color, status) and the Empire's line.
    get states() { return lastView; },
  };

  // Keyboard: ← → step through the calendar; space plays; D toggles the Diff view.
  window.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'e' || e.key === 'E') return doExport(e.shiftKey ? '4k' : 'png');
    if (state.tracker === 'explorers') return; // the Explorers layer is a typed range: no stepping, playing or Diff
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'd' || e.key === 'D') setMode(state.mode === 'diff' ? 'snapshot' : 'diff');
    else if (e.key === 'e' || e.key === 'E') doExport(e.shiftKey ? '4k' : 'png');
  });

  if (START_FROM && state.tracker !== 'explorers') state.mode = 'diff'; // under Explorers, from is the range's start
  await render();
  document.body.classList.add('ready');
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
  if (noCoords.length) panel.append('p').attr('class', 'note').text(`${noCoords.length} row${noCoords.length === 1 ? '' : 's'} waiting for coordinates (run node scripts/geocode.mjs): ${noCoords.map((r) => `${r.id} (${r.missing.join(', ')})`).join(', ')}`);
  if (source.from === 'fallback') panel.append('p').attr('class', 'note').text(`The Google Sheet could not be reached (${source.error}); showing the saved copy of the table instead.`);
  const where = source.from === 'sheet' ? 'the Google Sheet' : 'records.csv';
  panel.append('p').attr('class', 'note').text(`${where}: ${total} rows, ${total - problems.length - examples} drawn, ${examples} examples not drawn.`);
}
const escapeHTML = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

main().catch((err) => {
  console.error(err);
  d3.select('#problems').classed('hidden', false).text(`Parchment could not start: ${err.message}`);
});

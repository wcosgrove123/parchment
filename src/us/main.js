// Parchment — North America stage (1492 to the present), entry point.
// A continuous timeline: any year, or any day, since the sources are dated to the day. Five trackers (nations and
// empires, states and territories, Indian land cessions with treaty and present-day Native land, Native population,
// the Electoral College); a source card for whatever is clicked.

import * as d3 from 'd3';
import { loadJSON } from '../data/loader.js';
import { renderPNG, renderSVG, download, exportName } from '../export/export.js';
import stage from '../stages/north-america.json';
import powers from './powers.json';
import trackerDefs from './trackers.json';
import { createUSStage, prepareData, powerAt, nbName, US_FROM } from './stage.js';
import { parseDate, endOfYear, yearOf, longDate, isoDate, nextDay, OPEN } from './dates.js';
import { fmt as fmtN, pct as pctN } from './native.js';
import parties from './parties.json';
import { electionAt, electionDays, electionLooks, electoralCard, electionDiff } from './electoral.js';
import { prepareDisputes, prepareUSMX, applyOHMCuts } from './disputes.js';
import { loadText } from '../data/loader.js';
import { loadRecordsText } from '../data/source.js';
import { validateRecords, resolveRecords } from '../data/records.js';
import { routeLegend } from '../render/routes.js';
import routesTracker from '../trackers/routes.json';
import focusTable from '../focuses.json';
import { parseSize, sheetFor, resolveFrame, frameProjection, parseList, makeHighlight, slug, ORDER_PARAMS, queryToOrder } from './frames.js';
import { buildSlip } from './slip.js';
import { warById, warsOn, warTitle, membersOf } from '../military/wars.js';
import { eventsOf, eventsUpTo, sequenceFor, movementsOf, movementsSince, withSides } from '../military/events.js';

// The Military layer (brief of 2026-11-09) is a tracker here, off unless asked for: tracker=military&war=id&names=both.
const TRACKERS = { nations: trackerDefs.nations, states: trackerDefs.states, cessions: trackerDefs.cessions, population: trackerDefs.population, electoral: trackerDefs.electoral, military: trackerDefs.military };
const [SPAN_A, SPAN_B] = stage.span;
const params = new URLSearchParams(location.search);
const PLAY_MS = 450;

// A lesson map (src/us/frames.js): the address may frame the page on a focus or a box (frame=texas,
// frame=-107,24.5,-92.5,37.5), size the sheet for a slide (size=1600x1550, scale=1.25), light some polygons and drop
// the rest to paper (highlight=texas-republic,mexico), give the map a title, name rivers, and point at places and
// routes from the record table (places=Q…,record-id; routes=record-id). Each is the field of the same name in an
// order form (scripts/map.mjs). With none of them the page is exactly what it was.
const LESSON = ORDER_PARAMS.filter((k) => !['date', 'year', 'from', 'tracker', 'records'].includes(k)).some((k) => params.has(k));
const problems = [];
const frameParam = params.get('frame');
const frameFound = frameParam ? resolveFrame(frameParam, focusTable) : null;
if (frameParam && !frameFound) problems.push(`frame "${frameParam}" is neither a focus in src/focuses.json nor a box W,S,E,N; the continent is shown`);
const sizeParam = params.get('size');
const sizeFound = sizeParam ? parseSize(sizeParam) : null;
if (sizeParam && !sizeFound) problems.push(`size "${sizeParam}" is not WIDTHxHEIGHT between 800 and 3840 pixels wide; 1920x1080 is used`);
const SHEET = sheetFor(sizeFound, params.get('scale'));
const projectionMode = params.get('projection') === 'page' ? 'page' : 'auto';
if (params.get('projection') && !['page', 'auto'].includes(params.get('projection'))) problems.push(`projection "${params.get('projection')}" is not auto or page; auto is used`);

async function main() {
  const t0 = performance.now();
  const [ne, bathy, nbTopo, ohmTopo, cesTopo, natTopo, popData, landsTopo] = await Promise.all([
    loadJSON('data/base/derived/ne.topojson'),
    loadJSON('data/base/derived/bathymetry.topojson'),
    loadJSON('data/us/newberry.topojson'),
    loadJSON('data/us/ohm.topojson'),
    loadJSON('data/us/cessions.topojson'),
    loadJSON('data/us/native.topojson').catch(() => null),
    loadJSON('data/us/native.json').catch(() => null),
    loadJSON('data/us/native-lands.topojson').catch(() => null),
    document.fonts?.load ? Promise.all(['400', '700', 'italic 400', 'italic 700'].map((f) => document.fonts.load(`${f} 13px "Libre Baskerville"`).catch(() => null))) : null,
  ]);
  const data = prepareData({ nbTopo, ohmTopo, cesTopo, natTopo, pop: popData, landsTopo });
  // Land two U.S. polygons claimed at once (data/us/nb-disputes.json, scripts/derive-us-disputes.mjs).
  data.nbx = prepareDisputes(await loadJSON('data/us/nb-disputes.json').catch(() => null));
  // ...and land a U.S. state and a Mexican state claimed at once (data/us/usmx-disputes.json, the same script).
  data.usmx = prepareUSMX(await loadJSON('data/us/usmx-disputes.json').catch(() => null));
  // ...and the OpenHistoricalMap polygons the owner had cut at a river (data/us/ohm-cuts.json: the 1836–1845 joint
  // claim ends at the Nueces, as the 1846 strip does).
  applyOHMCuts(data, await loadJSON('data/us/ohm-cuts.json').catch(() => null));
  // A lesson map reads a little more: OpenHistoricalMap's own notes on each polygon (to find a Newberry polygon by the
  // name OHM's copy of it carries: the Republic of Texas is Newberry's tx_republic), and the 1:10m rivers of North
  // America (the Nueces is not in the 1:50m set).
  const riverNames = parseList(params.get('rivers'));
  const [ohmSources, riversNA, regional] = await Promise.all([
    LESSON && params.get('highlight') ? loadJSON('data/us/ohm-sources.json').catch(() => null) : null,
    LESSON && (frameFound || riverNames.length) ? loadJSON('data/base/derived/rivers-na.topojson').catch(() => null) : null,
    // relief for a frame: North America at Natural Earth's full resolution (scripts/relief-region.mjs), else the world
    LESSON ? loadJSON('assets/relief/north-america-plate-carree.json').catch(() => null) : null,
  ]);
  const within = (b, r) => b.west >= r.west && b.east <= r.east && b.south >= r.south && b.north <= r.north;
  const sharp = regional && within(frameFound?.box ?? stage.extent, regional.box) ? regional : null;
  if (riverNames.length && !riversNA) problems.push('the 1:10m rivers (data/base/derived/rivers-na.topojson) could not be read; rivers are named from the 1:50m set');
  let lesson = null;
  if (LESSON) {
    const twins = new Map();
    if (ohmSources) {
      const named = new Map(data.ohm.map((it) => [it.p.rid, it.p.name]));
      for (const [rid, s] of Object.entries(ohmSources.relations)) {
        if (!s.nb) continue;
        const list = twins.get(s.nb) ?? [];
        list.push(named.get(Number(rid)), s.en);
        twins.set(s.nb, list.filter(Boolean));
      }
    }
    const frame = frameFound ? { ...frameFound, projection: frameProjection(frameFound, projectionMode), legend: frameFound.focus?.legend ?? null, water: frameFound.focus?.water ?? [] } : null;
    lesson = {
      key: `${frameParam ?? 'continent'}-${projectionMode}-${SHEET.w}x${SHEET.h}`,
      sheet: { w: SHEET.w, h: SHEET.h },
      frame,
      title: params.get('title') || null,
      highlight: params.get('highlight') ? makeHighlight(params.get('highlight')) : null,
      twins,
      rivers: riverNames,
      // which of the 1:10m rivers a frame draws: finer frames show smaller rivers (Natural Earth's scalerank, 0 = largest)
      riverRank: frame ? riverRankFor(frame.box) : 0,
      reliefScale: params.has('shot') ? 1 : 0.5,
      reliefWorld: sharp ? `assets/${sharp.image}` : 'assets/relief/world-plate-carree.png',
      reliefBounds: sharp ? sharp.box : null,
      legendRows: (recs) => [...routeLegend(recs.routes), ...pointLegendRows(recs.points)],
    };
  }
  // The Electoral College (National Archives, data/us/electoral.json): each election's looks, worked out once.
  const ec = await loadJSON('data/us/electoral.json').catch(() => null);
  const ecLooks = new Map();
  const electoralFor = (d) => { const e = electionAt(ec, d); if (!e) return null; if (!ecLooks.has(e.year)) ecLooks.set(e.year, electionLooks(e, parties)); return ecLooks.get(e.year); };
  const electionNote = (e) => (e.year >= 1848 ? `Election Day, ${longDate(e.day)}` : `the electors voted ${longDate(e.day)}`);
  const ecDiffs = new Map();
  const electionDiffFor = (LA, LB) => {
    const k = `${LA.election.year}-${LB.election.year}`;
    if (!ecDiffs.has(k)) ecDiffs.set(k, electionDiff(data, LA, LB));
    return ecDiffs.get(k);
  };

  const today = new Date();
  const TODAY = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const clampDate = (d) => Math.max(SPAN_A * 10000 + 101, Math.min(Math.min(TODAY, SPAN_B * 10000 + 1231), d));
  const startDate = parseDate(params.get('date')) ?? (params.get('year') ? endOfYear(Number(params.get('year'))) : endOfYear(1803));
  // ?from=1783&year=1853 (or from=1783-09-03) opens the Diff view: what changed between the two dates.
  const startFrom = parseDate(params.get('from'));
  // (on the Military layer `from` is not a Diff: it means "movements since", the West Point convention; brief §6)
  const militaryStart = TRACKERS[params.get('tracker')] && params.get('tracker') === 'military';
  const state = {
    date: clampDate(startDate),
    exact: !!params.get('date'),
    tracker: TRACKERS[params.get('tracker')] ? params.get('tracker') : 'nations',
    mode: startFrom && !militaryStart ? 'diff' : 'snapshot',
    from: startFrom ? clampDate(startFrom) : null,
    since: startFrom && militaryStart ? clampDate(startFrom) : null,
    fromExact: /-/.test(params.get('from') ?? ''),
    playing: null,
    // the Military layer: which war (else the longest one alive on the date), and whose names print (a side's key, or both)
    war: params.get('war') || null,
    names: params.get('names') || 'both',
    // what of the layer to draw (empty: everything built), which events carry numerals, and the strip under the map
    show: parseList(params.get('show')),
    sequence: params.get('sequence') === 'false' ? false : params.get('sequence') && params.get('sequence') !== 'true' ? parseList(params.get('sequence')) : true,
    strip: params.get('strip') || 'war',
  };

  // The Military layer's data, read once when the layer is first shown: the wars of vocab.json and the membership
  // rows of the record table (the Sheet, or ?records= a file). Rows that fail validation are listed as problems.
  let milData = null;
  async function ensureMilitary() {
    if (milData) return milData;
    const [vocab, source, gazetteer] = await Promise.all([loadJSON('data/vocab.json'), loadRecordsText(), loadJSON('data/gazetteer.json').catch(() => ({}))]);
    const checked = source.text ? validateRecords(source.text, vocab) : { records: [], problems: [] };
    for (const p of checked.problems) if (/military|war|side|outcome/.test(p.message)) problems.push(`record table line ${p.line}${p.id ? ` (${p.id})` : ''}: ${p.message}`);
    const mil = checked.records.filter((r) => r.tracker === 'military');
    // events need a coordinate: the row's own (filled by geocode.mjs) or the gazetteer's for its Wikidata id
    const { records: pts, waiting } = resolveRecords(mil.filter((r) => r.kind === 'point'), gazetteer);
    for (const w of waiting) problems.push(`event ${w.id}: no coordinate for ${w.missing.join(', ')} (run npm run geocode); not drawn`);
    // movements: arrows through gazetteer places, as routes are; each keeps its places' names for a tab at the frame's edge
    const mv = resolveRecords(mil.filter((r) => r.kind === 'arrow' || r.kind === 'path'), gazetteer);
    for (const w of mv.waiting) problems.push(`movement ${w.id}: waypoints without coordinates (${w.missing.join(', ')}; run npm run geocode); not drawn`);
    const movements = mv.records.filter((r) => r.coords).map((r) => ({ ...r, placeNames: r.waypoints.map((q) => gazetteer[q]?.label ?? q) }));
    milData = { vocab, members: mil.filter((r) => r.kind === 'region'), events: pts.filter((r) => r.lon != null && r.lat != null), movements, file: source.from === 'file' ? (params.get('records') ?? 'data/records.csv') : source.from };
    if (!vocab.wars?.length) problems.push('vocab.json lists no wars yet; the Military layer has nothing to show');
    return milData;
  }
  let milWarned = false;
  // What the layer shows on a date: the war asked for, else the longest war alive that day; its members; its title.
  function militaryFor(date) {
    if (!milData) return null;
    const war = state.war ? warById(milData.vocab, state.war) : (warsOn(milData.vocab, date)[0] ?? null);
    if (!war) {
      if (!milWarned) { problems.push(state.war ? `war "${state.war}" is not in vocab.json's wars` : `no war in vocab.json is alive on ${longDate(date)}`); milWarned = true; }
      return { war: null, members: [], names: state.names, title: 'Military', file: milData.file };
    }
    const members = membersOf(milData.members, war.id);
    if (!members.length && !milWarned) { problems.push(`no membership rows for ${war.id} in ${milData.file}: every state is drawn as a non-member (paper)`); milWarned = true; }
    // the war's events: all of them for the strip; those begun by the date for the map, numbered as the order says
    const events = eventsOf(milData.events, war.id);
    const showEvents = !state.show.length || state.show.includes('events');
    const seqSpec = state.show.length && !state.show.includes('sequence') ? false : state.sequence;
    const shown = showEvents ? sequenceFor(eventsUpTo(events, date), seqSpec) : [];
    // movements since `from` (else the war's start) that have begun by the date, in their sides' colors
    const allMoves = withSides(movementsOf(milData.movements, war.id), war);
    // (without `from`, every movement begun by the date: an army's approach march before the first shot belongs on the map)
    const since = state.since ?? 0;
    const moves = !state.show.length || state.show.includes('movements') ? movementsSince(allMoves, since, date) : [];
    return { war, members, events, shown, moves, allMoves, since, names: state.names, title: warTitle(war, state.names), file: milData.file, strip: state.strip, show: state.show };
  }
  // The layer's events and movements join the order's places and routes on the sheet; set again only when they
  // change (a new date may add one).
  let recKey = null;
  function placeMilitaryRecords(mil) {
    const key = mil ? `${mil.war?.id}|${mil.shown.map((r) => `${r.id}:${r.seq ?? ''}`).join(',')}|${mil.moves.map((r) => r.id).join(',')}` : '';
    if (key === recKey) return;
    recKey = key;
    atlas.setRecords(mil ? { points: [...orderRecords.points, ...mil.shown], routes: [...orderRecords.routes, ...mil.moves] } : orderRecords);
  }
  if (state.tracker === 'military') await ensureMilitary();
  let milShown = null;
  // The earlier date when the Diff view opens without one: fifty years back, or the stage's first year.
  // (under the Electoral College: the election before the one shown)
  const defaultFrom = () => {
    if (state.tracker === 'electoral' && ec) { const days = electionDays(ec).filter((d) => d < state.date); if (days.length) return days.at(-1); }
    return endOfYear(Math.max(SPAN_A, yearOf(state.date) - 50));
  };

  // Days on which something in the record changed, for "previous / next change" and the strip's rug.
  const changeDays = buildChangeDays(data);
  changeDays.electoral = electionDays(ec);

  const svg = d3.select('#map');
  const atlas = createUSStage(svg, stage, { ne, bathy, riversNA }, {
    powers, trackers: TRACKERS,
    onPick: (it, date) => showInfo(it, date),
    onYear: (y, { live }) => { setDate(endOfYear(y), { exact: false, fade: live ? 0 : 250 }); },
    lesson,
  });
  // The records an order points at: points by Wikidata id or record id, routes by record id, from the record table
  // (the Sheet, or ?records=path.csv; an order rendered by scripts/map.mjs always names a file in the repository).
  const orderRecords = LESSON && (params.get('places') || params.get('routes')) ? await recordsForOrder(state.date) : { points: [], routes: [], warnings: [], file: null };
  problems.push(...orderRecords.warnings);
  if (lesson) atlas.setRecords(orderRecords);
  // (the Military layer adds the war's events to these in render(), placeMilitaryRecords)
  atlas.strip.setChanges([...new Set(data.nb.map((it) => yearOf(it.p.s)))]);
  console.log(`north-america stage built in ${(performance.now() - t0).toFixed(0)} ms; newberry ${data.nb.length}, ohm ${data.ohm.length}, cessions ${data.ces.length}`);

  let pending = null;
  function render({ fade = 300 } = {}) {
    // Live dragging asks for many dates a second; draw the latest one per frame.
    if (pending) { pending.fade = Math.min(pending.fade, fade); return; }
    pending = { fade };
    requestAnimationFrame(() => {
      const { fade: f } = pending; pending = null;
      const t = performance.now();
      // Electoral College: the latest election held by the date, shown on the map of its own day.
      const ecShown = state.mode !== 'diff' && state.tracker === 'electoral' ? electoralFor(state.date) : null;
      if (ecShown) { state.date = ecShown.election.day; state.exact = false; }
      // A Diff under the Electoral College compares two elections: both dates snap to their elections' days.
      const ecPair = state.mode === 'diff' && state.tracker === 'electoral' && ec
        ? [electoralFor(state.from) ?? electoralFor(ec.elections[0].day), electoralFor(state.date) ?? electoralFor(ec.elections[0].day)] : null;
      if (ecPair) { state.from = ecPair[0].election.day; state.date = ecPair[1].election.day; state.fromExact = false; state.exact = false; }
      const y = yearOf(state.date);
      const shown = (d, exact) => (exact ? longDate(d) : yearOf(d));
      milShown = state.tracker === 'military' ? militaryFor(state.date) : null;
      placeMilitaryRecords(milShown?.war ? milShown : null);
      if (state.mode === 'diff') {
        const ecDiff = ecPair ? electionDiffFor(ecPair[0], ecPair[1]) : null;
        // (a Diff under the Military layer is the nations' Diff for now: who held what; the war's own Diff is a later milestone)
        const diff = atlas.showDiff(data, state.from, state.date, state.tracker === 'military' ? 'nations' : state.tracker, { fade: f, electoralDiff: ecDiff });
        atlas.setRange(state.from, state.date, { exactA: state.fromExact, exactB: state.exact });
        if (ecPair) d3.select('.cartouche .base-note').text(`the elections of ${ecPair[0].election.year} and ${ecPair[1].election.year}`);
        document.title = `Parchment · North America · ${shown(state.from, state.fromExact)} → ${shown(state.date, state.exact)}`;
        console.log(`diff ${isoDate(state.from)} → ${isoDate(state.date)} (${state.tracker}): ${(performance.now() - t).toFixed(0)} ms; appeared ${diff.appeared.length}, changed ${diff.changed.length}, vanished ${diff.vanished.length}, persisted ${diff.persisted.length}`);
      } else {
        const n = atlas.show(data, state.date, state.tracker, { fade: f, electoral: ecShown, military: milShown });
        atlas.setDate(state.date, { exact: state.exact });
        if (ecShown) d3.select('.cartouche .base-note').text(electionNote(ecShown.election));
        document.title = `Parchment · North America · ${shown(state.date, state.exact)}`;
        console.log(`${isoDate(state.date)} (${state.tracker}): ${(performance.now() - t).toFixed(0)} ms; ${n.nb} U.S. polygons, ${n.ohm} others${n.cessions ? `, ${n.cessions} cessions` : ''}`);
      }
      d3.select('#year-input').property('value', state.exact ? isoDate(state.date) : y);
      if (state.from != null) d3.select('#from-input').property('value', state.fromExact ? isoDate(state.from) : yearOf(state.from));
      document.body.classList.toggle('mode-diff', state.mode === 'diff');
      document.body.classList.toggle('tracker-military', state.tracker === 'military');
      d3.selectAll('#toolbar [data-mode]').classed('active', function () { return this.dataset.mode === state.mode; });
      if (milShown) d3.select('#war').selectAll('option').property('selected', (w) => w.id === milShown.war?.id);
      const q = new URLSearchParams();
      if (state.mode === 'diff') q.set('from', state.fromExact ? isoDate(state.from) : yearOf(state.from));
      if (state.exact) q.set('date', isoDate(state.date)); else q.set('year', y);
      if (state.tracker !== 'nations') q.set('tracker', state.tracker);
      if (state.tracker === 'military') {
        if (state.war) q.set('war', state.war);
        if (state.names !== 'both') q.set('names', state.names);
        for (const k of ['show', 'sequence', 'strip']) if (params.has(k)) q.set(k, params.get(k));
      }
      // (a lesson map's own fields stay in the address, so it can be copied and opened again)
      for (const k of ORDER_PARAMS) if (!['date', 'year', 'from', 'tracker'].includes(k) && params.has(k)) q.set(k, params.get(k));
      history.replaceState(null, '', `?${q}`);
    });
  }

  function setDate(d, { exact = false, fade = 300 } = {}) {
    const nd = clampDate(d);
    if (nd === state.date && exact === state.exact) return;
    state.date = nd; state.exact = exact;
    render({ fade });
  }
  function setFrom(d, { exact = false } = {}) {
    const nd = clampDate(d);
    if (nd === state.from && exact === state.fromExact && state.mode === 'diff') return;
    state.from = nd; state.fromExact = exact; state.mode = 'diff';
    closeInfo();
    render();
  }
  // D, or the toolbar's Diff button: the change between an earlier date and the date shown.
  function setMode(m) {
    if (m === state.mode) return;
    state.mode = m;
    if (m === 'diff' && (state.from == null || state.from === state.date)) { state.from = defaultFrom(); state.fromExact = false; }
    closeInfo();
    render();
  }
  // (under the Electoral College, ← → go from election to election; Shift still moves ten years)
  const stepYear = (delta) => (state.tracker === 'electoral' && Math.abs(delta) === 1
    ? stepChange(delta) : setDate(endOfYear(yearOf(state.date) + delta)));
  function stepChange(dir) {
    const days = changeDays[state.tracker] ?? changeDays.nations;
    const d = dir > 0 ? days.find((x) => x > state.date) : [...days].reverse().find((x) => x < state.date);
    if (d) setDate(d, { exact: true });
  }
  function togglePlay() {
    if (state.playing) { clearInterval(state.playing); state.playing = null; }
    else {
      if (yearOf(state.date) >= SPAN_B) setDate(endOfYear(SPAN_A));
      state.playing = setInterval(() => {
        if (yearOf(state.date) >= Math.min(SPAN_B, yearOf(TODAY))) { togglePlay(); return; }
        setDate(endOfYear(yearOf(state.date) + 1), { fade: 200 });
      }, PLAY_MS);
    }
    d3.select('#play').classed('active', !!state.playing).text(state.playing ? '❚❚' : '▶');
  }

  // ------------------------------------------------------------ toolbar (chrome; never exported)
  const tb = d3.select('#toolbar').html('');
  const sel = tb.append('select').attr('id', 'tracker').attr('title', 'Tracker')
    .on('change', async function () { state.tracker = this.value; closeInfo(); if (state.tracker === 'military') { await ensureMilitary(); fillWarMenu(); } render(); });
  sel.selectAll('option').data(Object.values(TRACKERS)).join('option').attr('value', (t) => t.id).text((t) => t.title).property('selected', (t) => t.id === state.tracker);
  // The Military layer's war: shown only while that layer is on (us.css hides it otherwise).
  const warSel = tb.append('select').attr('id', 'war').attr('title', 'The war shown')
    .on('change', function () { state.war = this.value || null; milWarned = false; closeInfo(); render(); });
  function fillWarMenu() {
    const wars = milData?.vocab?.wars ?? [];
    warSel.selectAll('option').data([{ id: '', names: { '': 'War alive on the date' } }, ...wars], (w) => w.id).join('option').attr('value', (w) => w.id).text((w) => warTitle(w, state.names))
      .property('selected', (w) => w.id === (state.war ?? ''));
  }
  if (milData) fillWarMenu();
  tb.append('span').attr('class', 'sep');
  const seg = tb.append('span').attr('class', 'seg');
  seg.append('button').attr('data-mode', 'snapshot').attr('title', 'One date (D toggles)').text('Snapshot').on('click', () => setMode('snapshot'));
  seg.append('button').attr('data-mode', 'diff').attr('title', 'What changed between two dates (D)').text('Diff').on('click', () => setMode('diff'));
  tb.append('span').attr('class', 'range-label diff-only').text('from');
  tb.append('input').attr('id', 'from-input').attr('class', 'diff-only').attr('type', 'text').attr('spellcheck', 'false')
    .attr('title', 'The earlier date: a year (1783) or a day (1783-09-03); Enter to go')
    .on('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const raw = this.value.trim();
      const d = parseDate(raw);
      if (d) setFrom(d, { exact: /-/.test(raw) });
      this.blur();
    });
  tb.append('span').attr('class', 'range-label diff-only').text('to');
  tb.append('button').attr('title', 'Previous change in the record ([)').text('⇤').on('click', () => stepChange(-1));
  tb.append('button').attr('title', 'Back a year (←; Shift: ten)').text('◀').on('click', (e) => stepYear(e.shiftKey ? -10 : -1));
  tb.append('input').attr('id', 'year-input').attr('type', 'text').attr('spellcheck', 'false')
    .attr('title', 'A year (1803) or a day (1803-12-20); Enter to go')
    .on('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const raw = this.value.trim();
      const d = parseDate(raw);
      if (d) setDate(d, { exact: /-/.test(raw) });
      this.blur();
    });
  tb.append('button').attr('title', 'Forward a year (→; Shift: ten)').text('▶').attr('class', 'step').on('click', (e) => stepYear(e.shiftKey ? 10 : 1));
  tb.append('button').attr('title', 'Next change in the record (])').text('⇥').on('click', () => stepChange(1));
  tb.append('span').attr('class', 'sep');
  tb.append('button').attr('id', 'play').attr('title', 'Play, a year at a time (space)').text('▶').on('click', togglePlay);
  tb.append('span').attr('class', 'sep');

  const exportMenu = tb.append('span').attr('class', 'menu');
  const exportBtn = exportMenu.append('button').attr('id', 'export').attr('title', 'Export the current view (E)').text('Export ▾')
    .on('click', () => exportMenu.classed('open', !exportMenu.classed('open')));
  const pop = exportMenu.append('span').attr('class', 'popover');
  const exportOpts = { transparent: false };
  let exporting = false;
  async function doExport(kind) {
    if (exporting) return;
    exporting = true; exportMenu.classed('open', false); exportBtn.text('Exporting…').attr('disabled', true);
    try {
      const info = { stage: frameFound?.id ? `${stage.id}-${frameFound.id}` : stage.id, year: state.exact ? isoDate(state.date) : yearOf(state.date), from: state.mode === 'diff' ? (state.fromExact ? isoDate(state.from) : yearOf(state.from)) : null };
      // (a sheet sized for a slide exports at its own size; the default sheet at 1920×1080 and 3840×2160)
      const px = SHEET.px;
      if (kind === 'svg') download(await renderSVG(svg.node(), exportOpts), exportName({ ...info, ext: 'svg' }));
      else if (kind === '4k') download(await renderPNG(svg.node(), { width: px.width * 2, height: px.height * 2, ...exportOpts }), exportName({ ...info, size: '4k', ext: 'png' }));
      else download(await renderPNG(svg.node(), { width: px.width, height: px.height, ...exportOpts }), exportName({ ...info, ext: 'png' }));
    } catch (err) {
      console.error(err);
      d3.select('#problems').classed('hidden', false).text(`Export failed: ${err.message}`);
    } finally { exporting = false; exportBtn.text('Export ▾').attr('disabled', null); }
  }
  pop.append('button').text(`PNG · ${SHEET.px.width} × ${SHEET.px.height}`).on('click', () => doExport('png'));
  pop.append('button').text(`PNG · ${SHEET.px.width * 2} × ${SHEET.px.height * 2}`).on('click', () => doExport('4k'));
  pop.append('button').text('SVG').on('click', () => doExport('svg'));
  const tr = pop.append('label');
  tr.append('input').attr('type', 'checkbox').on('change', function () { exportOpts.transparent = this.checked; });
  tr.append('span').text('transparent background');

  tb.append('a').attr('class', 'admin-link').attr('href', 'index.html').attr('title', 'The Afro-Eurasia stage').text('Afro-Eurasia');
  const about = tb.append('span').attr('class', 'menu');
  about.append('button').attr('id', 'about').attr('title', 'About this map and its sources').text('ⓘ')
    .on('click', () => about.classed('open', !about.classed('open')));
  const ap = about.append('span').attr('class', 'popover about');
  ap.append('p').html('<b>Parchment</b> — a historical timeline atlas for the classroom.<br>Atlas, design and ideas: Wil Cosgrove.');
  ap.append('p').html('U.S. states and territories, 1783–2000, to the day: <a href="https://digital.newberry.org/ahcb/" target="_blank" rel="noopener">Atlas of Historical County Boundaries</a>, The Newberry Library. Held open to the present: no state boundary has changed since.');
  ap.append('p').html('Colonies, provinces, neighboring countries and Native nations: <a href="https://www.openhistoricalmap.org" target="_blank" rel="noopener">OpenHistoricalMap</a> contributors (CC0). Approximate before 1783.');
  ap.append('p').html('Indian land cessions, 1784–1894: U.S. Forest Service digitization of Charles C. Royce, <i>Indian Land Cessions in the United States</i> (1899).');
  ap.append('p').html('Electoral College, 1789–2024: <a href="https://www.archives.gov/electoral-college" target="_blank" rel="noopener">U.S. National Archives</a>, Electoral College box scores (public domain).');
  ap.append('p').html('Coast, rivers, relief: <a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a>. Type: Libre Baskerville (OFL). Click any area for its source.');
  ap.append('p').html('<a href="https://github.com/wcosgrove123/parchment/blob/main/docs/DATA-LICENSES.md" target="_blank" rel="noopener">Data licenses and attribution</a>');
  document.addEventListener('click', (e) => {
    if (!exportMenu.node().contains(e.target)) exportMenu.classed('open', false);
    if (!about.node().contains(e.target)) about.classed('open', false);
  });

  // ------------------------------------------------------------ source card for a clicked area
  const info = d3.select('#info');
  function closeInfo() { info.classed('hidden', true).html(''); }
  function showInfo(it, date) {
    const p = it.p;
    info.classed('hidden', false).html('');
    const head = info.append('div').attr('class', 'info-head');
    const close = head.append('button').attr('title', 'Close').text('×').on('click', closeInfo);
    const add = (label, html) => { if (!html) return; const r = info.append('div').attr('class', 'info-row'); r.append('span').attr('class', 'k').text(label); r.append('span').attr('class', 'v').html(html); };
    const link = (href, text) => (href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>` : '');
    if (it.src === 'newberry' && state.tracker === 'population' && it.popUnit) {
      // Native population: the count behind the shade, with what the census did and did not count that year.
      const u = it.popUnit;
      head.insert('h3', 'button').text(nbName(p));
      add('Counted', `${fmtN(u.aian)} American Indians, census of ${u.year}`);
      if (u.states.length > 1) add('Made of', esc(u.states.map((s) => `${s.state} ${fmtN(s.aian)}`).join(' · ')));
      if (u.items.length > 1) add('Shared with', esc(`${u.items.filter((x) => x !== it).map((x) => nbName(x.p)).join(', ')}: the census reported ${u.states.map((s) => s.state).join(' and ')} as one, so the count is spread over all of it`));
      add('Share', `${pctN(u.share)} of the ${fmtN(u.us)} counted in the United States`);
      add('Density', `${u.density.toFixed(u.density < 10 ? 1 : 0)} per 1,000 km² (${fmtN(Math.round(u.km2))} km²)`);
      add('What', esc(u.what));
      add('Source', esc(u.source));
    } else if (it.src === 'aiannh') {
      head.insert('h3', 'button').text(p.name);
      add('Kind', p.kind === 'hawaiian' ? 'Hawaiian home land' : 'Held land: reservation, trust land, rancheria, pueblo or colony');
      add('Shown', 'From 2020, with the Census Bureau’s 2025 boundaries; earlier boundaries differ and are not carried back.');
      add('Source', `${link('https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html', 'U.S. Census Bureau')}, cartographic boundary file, American Indian / Alaska Native / Native Hawaiian areas, 2025 (1:500,000) · GEOID ${esc(p.geoid)}`);
    } else if (it.src === 'treaty') {
      // Land held under U.S. treaty: computed from Royce's areas, dated by the treaties themselves.
      head.insert('h3', 'button').text(p.name);
      add('Kind', `Land the United States recognized by treaty as ${esc(p.name)}: what the nation had still to cede`);
      add('Boundary', `As set by the treaty of ${esc(longDate(p.s))}${p.place ? `, held at ${esc(p.place)}` : ''}; in force until the treaty of ${esc(longDate(p.next))}`);
      add('Area', `About ${(p.km2 * 247.105 / 1e6).toFixed(1)} million acres (${fmtN(p.km2)} km²)`);
      add('Certainty', 'Legal: each line was fixed by a treaty and later surveyed, so the edge is solid.');
      add('How', `Computed, not drawn: the union of the Royce areas this nation ceded after this date (areas ${esc(p.areas.split(' ').join(', '))}). A tract one treaty reserved and a later one ceded passes at the later.`);
      add('Source', `U.S. Forest Service, Office of Tribal Relations: Royce areas georeferenced from Royce, Indian Land Cessions in the United States (1899)${p.placeSrc ? `; the treaty's place from ${esc(p.placeSrc)}` : ''}.`);
    } else if (it.src === 'treatyX') {
      head.insert('h3', 'button').text('Claimed by two nations');
      add('Claimed by', esc(`${p.a[0].toUpperCase()}${p.a.slice(1)} and ${p.b[0].toUpperCase()}${p.b.slice(1)}`));
      add('These lines', `${esc(longDate(p.s))} – ${esc(longDate(p.e))}, between two treaties; step through the years to see the overlap begin and end`);
      add('Reading', 'Both nations’ treaty lands cover this ground: the United States later bought the same land from each. The hatch marks the overlap; neither nation is shown as holding it alone.');
      add('Source', 'The intersection of the two nations’ treaty lands (computed, not drawn), from the U.S. Forest Service’s Royce areas.');
    } else if (it.src === 'icc') {
      head.insert('h3', 'button').text(p.tribe);
      add('Kind', 'Original tribal territory, as proved before the Indian Claims Commission or the Court of Claims');
      add('Shown', '1784 to 1978 as an outline: the land a nation held before the cessions, as the courts later found it. The Commission paid money for such land; it returned none.');
      add('Source', `Indian Claims Commission, Indian Land Areas Judicially Established (map, 1978), catalog no. ${esc(p.cat)}; digitized by the National Park Service`);
    } else if (it.src === 'nbx') {
      // Land two U.S. polygons claimed at once (src/us/disputes.js): both claims, their dates, and how they ended.
      head.insert('h3', 'button').text('Disputed land');
      add('Claimed by', `${esc(p.an)} and ${esc(p.bn)}`);
      add('Both claims', `${esc(longDate(p.ds))} – ${esc(longDate(p.de))} (about ${fmtN(p.km2)} km²)`);
      add('Reading', 'The Newberry Library’s atlas gives this land to both, one polygon for each claim. The hatch marks the overlap; the two lines are the two claimed borders.');
      if (p.ended) add('The day after', `${esc(p.ended.text)}${p.ended.cite ? ` ${esc(p.ended.cite)}` : ''}`);
      add('Source', `${link('https://digital.newberry.org/ahcb/', 'Atlas of Historical County Boundaries')}, The Newberry Library · ids ${esc(p.a)} (version ${p.av}) and ${esc(p.b)} (version ${p.bv}); the overlap is computed from their outlines, not drawn`);
    } else if (it.src === 'newberry') {
      head.insert('h3', 'button').text(nbName(p));
      add('Kind', esc(p.type));
      add('In force', `${esc(longDate(p.s))} – ${p.e >= OPEN ? 'the present (Newberry\'s record ends 31 December 2000; no state boundary has changed since)' : esc(longDate(p.e))}`);
      add('What changed', esc(p.change ?? ''));
      add('Authority', esc(p.cite ?? ''));
      add('Source', `${link('https://digital.newberry.org/ahcb/', 'Atlas of Historical County Boundaries')}, The Newberry Library · id ${esc(p.id)}, version ${p.v}`);
      // Under the Electoral College: how this state's electors voted, in the National Archives' words.
      const ecL = state.tracker === 'electoral' ? electoralFor(date) : null;
      const ecName = p.type === 'Territory' ? p.name.replace(/ Territory$/, '') : p.name;
      const card = ecL && (p.type !== 'Territory' || ecL.states.has(ecName)) && /State|District|Territory/.test(p.type) ? electoralCard(ecL, ecName) : null;
      if (card) {
        // (Indiana 1816, Missouri 1820, Michigan 1836: the electors voted before the day Newberry gives for statehood)
        if (p.type === 'Territory') {
          const st = data.nb.filter((x) => x.p.name === ecName && x.p.type === 'State').sort((a, b) => a.p.s - b.p.s)[0];
          card.lines.unshift(`Its electors voted on ${longDate(date)}${st ? `, before statehood (${longDate(st.p.s)}, in Newberry's record)` : ''}; the National Archives counts their votes in the total.`);
        }
        add(card.head, card.lines.map(esc).join('<br>'));
        add('Votes from', link(card.url, `National Archives, Electoral College box scores, ${yearOf(date)}`));
      }
    } else if (it.src === 'ohm' && p.lvl === 'x') {
      head.insert('h3', 'button').text('Overlapping claims');
      add('Claimed by', esc(p.name.split(' / ').join(' and ')));
      add('Both alive', `${esc(longDate(p.s))} – ${esc(longDate(p.e))}`);
      add('Reading', 'Two powers’ polygons cover this land at once: a claim one side never conceded, or a frontier neither surveyed. The hatch marks the overlap; the land is not shown as either’s alone.');
      add('Source', `${link(`https://www.openhistoricalmap.org/relation/${p.a}`, `relation ${p.a}`)} ∩ ${link(`https://www.openhistoricalmap.org/relation/${p.b}`, `relation ${p.b}`)} (OpenHistoricalMap; the intersection is computed, not drawn)`);
    } else if (it.src === 'ohm') {
      head.insert('h3', 'button').text(p.name);
      if (p.local) add('Also', esc(p.local));
      const pw = powerAt(p, date);
      const cat = powers.categories[pw];
      add('Held by', esc(cat?.label ?? 'not assigned (shown without a fill)'));
      add('Dates', `${esc(p.start_raw ?? '')} – ${esc(p.end_raw ?? 'no end recorded')}`);
      add('Certainty', date < US_FROM ? 'Approximate: colonial claims and frontiers were not surveyed lines.' : 'Documented border.');
      add('Source', `${link(`https://www.openhistoricalmap.org/relation/${p.rid}`, `OpenHistoricalMap relation ${p.rid}`)}${p.wd ? ` · ${link(`https://www.wikidata.org/wiki/${p.wd}`, p.wd)}` : ''}`);
    } else if (it.src === 'hb') {
      head.insert('h3', 'button').text(p.name);
      add('Kind', 'Native homeland');
      add('Shown', `${p.y} to ${yearOf(p.e) - (p.e % 10000 === 101 ? 1 : 0)}, from the ${p.y} map`);
      add('Certainty', 'Approximate. Homelands overlapped and moved; no line was surveyed. Drawn soft, never as a border.');
      add('Source', `${link('https://github.com/aourednik/historical-basemaps', 'historical-basemaps')}, world_${p.y} (GPL-3.0)${p.y === 1492 ? '; its North American names follow Native Land Digital' : ''}`);
    } else {
      head.insert('h3', 'button').text(`Royce area ${p.n}`);
      add('Ceded by', esc(p.tribe ?? ''));
      add('Date', esc(longDate(p.d)));
      if (p.today) add('Tribes today', esc(p.today.length > 320 ? `${p.today.slice(0, 320)}…` : p.today));
      add('Treaty', [link(p.kappler, 'text (Kappler, Indian Affairs: Laws and Treaties)'), link(p.statute, 'statute'), link(p.eo, 'executive order')].filter(Boolean).join(' · '));
      add('Royce', [link(p.royce, 'schedule entry'), link(p.mapurl, `map ${p.map ?? ''}`)].filter(Boolean).join(' · '));
      add('Source', 'U.S. Forest Service, Office of Tribal Relations: Royce areas georeferenced from the 67 maps of Royce (1899).');
    }
  }

  // ------------------------------------------------------------ scripts and keys
  window.parchment = {
    renderPNG: (opts) => renderPNG(svg.node(), opts),
    renderSVG: (opts) => renderSVG(svg.node(), opts),
    exportName: (opts) => exportName({ stage: stage.id, year: yearOf(state.date), from: state.mode === 'diff' ? yearOf(state.from) : null, ...opts }),
    setDate: (s, opts) => setDate(parseDate(s), { exact: /-/.test(s), ...opts }),
    setFrom: (s) => setFrom(parseDate(s), { exact: /-/.test(s) }),
    setMode,
    get state() { return { ...state, iso: isoDate(state.date), fromIso: state.from != null ? isoDate(state.from) : null }; },
    // Resolves once the first picture is on the sheet, relief, fonts and all: what scripts/map.mjs waits for.
    ready: readyPromise,
    // The packing slip (src/us/slip.js): what this map shows, with dates and sources, as JSON.
    packingSlip: () => buildSlip({
      atlas, data, state, stage, powers, trackers: TRACKERS, params, sheet: SHEET, frame: lesson?.frame ?? null, projectionMode,
      lesson, records: orderRecords, problems, loadJSON, ec: state.tracker === 'electoral' ? electoralFor(state.date) : null,
      military: milShown,
    }),
    // The order this address is (the inverse of scripts/map.mjs's address).
    order: () => queryToOrder(new URLSearchParams(location.search)),
  };
  window.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') stepYear(e.shiftKey ? 10 : 1);
    else if (e.key === 'ArrowLeft') stepYear(e.shiftKey ? -10 : -1);
    else if (e.key === ']') stepChange(1);
    else if (e.key === '[') stepChange(-1);
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'Escape') closeInfo();
    else if (e.key === 'd' || e.key === 'D') setMode(state.mode === 'diff' ? 'snapshot' : 'diff');
    else if (e.key === 'e' || e.key === 'E') doExport(e.shiftKey ? '4k' : 'png');
  });

  render({ fade: 0 });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  document.body.classList.add('ready');
  // A reshaded relief arrives a moment later than the rest; the picture is ready when it is painted.
  await atlas.reliefReady;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  if (problems.length) console.warn(`lesson map: ${problems.join('; ')}`);
  resolveReady();

  // ?bench: time a year change (script and paint) at a few dates, twice; for checking speed in a headless browser.
  if (params.has('bench')) {
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const out = [];
    for (const pass of [1, 2]) {
      for (const y of [1650, 1754, 1803, 1861, 1912, 2026]) {
        const t = performance.now();
        setDate(endOfYear(y), { fade: 0 });
        await frame();
        out.push(`${y}#${pass} ${Math.round(performance.now() - t)} ms`);
      }
    }
    console.log(`bench: ${out.join(' · ')}`);
  }
}

// Change days per tracker: Newberry's start days and the day after its end days; for the colonial era, the start
// and end days of OHM polygons that carry a power; for cessions, the treaty days.
function buildChangeDays(data) {
  const nb = new Set();
  for (const it of data.nb) { nb.add(it.p.s); if (it.p.e < OPEN) nb.add(nextDay(it.p.e)); }
  const ohm = new Set();
  for (const it of data.ohm) {
    if (it.p.lvl !== 2 || (it.p.pw ?? []).every(([, pw]) => pw === 'other')) continue;
    if (it.p.s >= 14920101) ohm.add(it.p.s);
    if (it.p.e < OPEN) ohm.add(it.p.e);
  }
  const ces = new Set(data.ces.map((c) => c.p.d));
  const sort = (s) => [...s].filter((d) => d >= 14920101).sort((a, b) => a - b);
  return { nations: sort(new Set([...nb, ...ohm])), states: sort(nb), cessions: sort(ces) };
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// window.parchment.ready: resolved by main() once the first picture is painted, rejected if the page cannot start.
let resolveReady, rejectReady;
const readyPromise = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
readyPromise.catch(() => {});

// Which of Natural Earth's 1:10m rivers a frame draws (scalerank 0 is the largest river): a frame a few hundred
// kilometres across shows the smaller rivers too, the continent only the largest.
function riverRankFor(box) {
  const span = Math.max(box.east - box.west, (box.north - box.south) * 1.3);
  return span <= 12 ? 9 : span <= 20 ? 8 : span <= 32 ? 7 : 6;
}

// Legend rows for an order's places: one per point type on the map (grammar §5), as on the Routes layer.
function pointLegendRows(points) {
  const seen = new Set(), rows = [];
  for (const p of points) {
    if (p.tracker === 'military') continue; // the Military layer's events have their own legend rows (src/military/events.js)
    const e = routesTracker.point_legend[p.value];
    if (e && !seen.has(e.label)) { seen.add(e.label); rows.push(e); }
  }
  return rows;
}

// The records an order points at. A place is a record id, or the Wikidata id of a point record's `where`: when
// several records stand at that place, the one in force on the map's date (else the last before it, else the first).
// A route is the id of an arrow or path record. Every id that finds nothing is a warning on the packing slip.
async function recordsForOrder(date) {
  const warnings = [];
  const [vocab, gazetteer, source] = await Promise.all([loadJSON('data/vocab.json'), loadJSON('data/gazetteer.json').catch(() => ({})), loadRecordsText()]);
  if (!source.text) return { points: [], routes: [], warnings: ['the record table could not be read'], file: params.get('records') ?? null };
  const checked = validateRecords(source.text, vocab);
  for (const p of checked.problems) warnings.push(`record table line ${p.line}${p.id ? ` (${p.id})` : ''}: ${p.message}`);
  const { records, waiting } = resolveRecords(checked.records, gazetteer);
  // a record's first and last day (a year means all of it, a month all of that month)
  const first = (w) => (w ? w.year * 10000 + (w.month ?? 1) * 100 + (w.day ?? 1) : 0);
  const last = (w) => (w ? w.year * 10000 + (w.month ?? 12) * 100 + (w.day ?? 31) : 0);
  const pick = (cands) => {
    if (cands.length < 2) return cands[0];
    const alive = cands.filter((r) => first(r.startWhen) <= date && date <= last(r.endWhen));
    if (alive.length) return alive[0];
    const before = cands.filter((r) => first(r.startWhen) <= date).sort((a, b) => last(b.endWhen) - last(a.endWhen));
    return before[0] ?? cands[0];
  };
  const points = [], routes = [];
  for (const id of parseList(params.get('places'))) {
    const byId = records.find((r) => r.id === id && r.kind === 'point');
    const r = byId ?? pick(records.filter((x) => x.kind === 'point' && x.where === id));
    if (!r) { warnings.push(`place ${id}: no point record in the table${/^Q\d+$/.test(id) ? ' stands at that Wikidata id (places must be records with a source)' : ''}`); continue; }
    if (r.lon == null) { warnings.push(`place ${id}: record ${r.id} has no coordinate yet (run npm run geocode)`); continue; }
    if (!points.some((p) => p.id === r.id)) points.push({ ...r, asked: id, first: first(r.startWhen), last: last(r.endWhen) });
  }
  for (const id of parseList(params.get('routes'))) {
    const r = records.find((x) => x.id === id && (x.kind === 'arrow' || x.kind === 'path'));
    if (!r) { warnings.push(`route ${id}: no arrow or path record has that id`); continue; }
    if (!r.coords) { warnings.push(`route ${id}: waypoints without coordinates (${waiting.find((w) => w.id === id)?.missing.join(', ') ?? '?'}; run npm run geocode)`); continue; }
    routes.push({ ...r, asked: id, first: first(r.startWhen), last: last(r.endWhen) });
  }
  return { points, routes, warnings, file: source.from === 'file' ? (params.get('records') ?? 'data/records.csv') : source.from };
}

main().catch((err) => {
  console.error(err);
  rejectReady(err);
  d3.select('#problems').classed('hidden', false).text(`Parchment could not start: ${err.message}`);
});

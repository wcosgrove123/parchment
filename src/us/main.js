// Parchment — North America stage (1492 to the present), entry point.
// A continuous timeline: any year, or any day, since the sources are dated to the day. Five trackers (nations and
// empires, states and territories, Indian land cessions with treaty and present-day Native land, Native population,
// the Electoral College); a source card for whatever is clicked.

import * as d3 from 'd3';
import { loadJSON } from '../data/loader.js';
import { renderPNG, renderSVG, download, exportName, renderViewBitmap } from '../export/export.js';
import stage from '../stages/north-america.json';
import powers from './powers.json';
import trackerDefs from './trackers.json';
import { createUSStage, prepareData, powerAt, nbName, US_FROM, prepareRelief, freeFrame } from './stage.js';
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
import { filmById, chapterOn, frameAt, secondsAt, frameList, describeFilm } from '../military/play.js';
import { toInt as warDay } from '../military/wars.js';
import { battleById, battleRows, battlePositions, battleMoves, battleTerrain, strengthOf, phaseCovers } from '../military/events.js';
import { viewMembers } from '../military/wars.js';
import { eventsOf, eventsUpTo, sequenceFor, movementsOf, movementsSince, withSides, forcePositions, techFor, svgPath } from '../military/events.js';

// More events than this on a war's map, and only the war's key events carry a numeral (the Revolution has 170).
const MANY_EVENTS = 40;

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
// (the play run may set the frame from its chapter before the stage is built: see the start of main())
let frameParam = params.get('frame');
let frameFound = frameParam ? resolveFrame(frameParam, focusTable) : null;
let filmFrames = false; // true when the film's chapters choose the frame (no frame in the address)
if (frameParam && !frameFound) problems.push(`frame "${frameParam}" is neither a focus in src/focuses.json nor a box W,S,E,N; the continent is shown`);
const sizeParam = params.get('size');
const sizeFound = sizeParam ? parseSize(sizeParam) : null;
if (sizeParam && !sizeFound) problems.push(`size "${sizeParam}" is not WIDTHxHEIGHT between 800 and 3840 pixels wide; 1920x1080 is used`);
// (the classroom preset sets type larger: the sheet is drawn at 1.35, unless the address gives its own scale)
const SHEET = sheetFor(sizeFound, params.get('scale') ?? (params.get('preset') === 'classroom' ? '1.35' : null));
const projectionMode = params.get('projection') === 'page' ? 'page' : 'auto';
if (params.get('projection') && !['page', 'auto'].includes(params.get('projection'))) problems.push(`projection "${params.get('projection')}" is not auto or page; auto is used`);

async function main() {
  const t0 = performance.now();
  // The play run (?play=): without a frame in the address, the chapter's frame from vocab.json's films (the Texas
  // chapters on the Texas frame, the war on its theater); when a chapter with another frame begins, the page
  // re-frames itself (a reload on the chapter's first day). A frame in the address is kept for the whole film.
  // A battle frame (milestone 9): its focus, unless the address names a frame; the day of its phase as the date.
  if (params.get('battle') && !frameParam) {
    const vocab0 = await loadJSON('data/vocab.json').catch(() => null);
    const hit = vocab0 ? battleById(vocab0, params.get('battle')) : null;
    // (a battle may ask for its own sheet, nearer the shape of its field: the page takes it into its address first)
    if (hit?.battle.size && !params.has('size')) { const q = new URLSearchParams(location.search); q.set('size', hit.battle.size); location.replace(`?${q}`); return; }
    if (hit?.battle.frame) { frameParam = hit.battle.frame; frameFound = resolveFrame(frameParam, focusTable); }
  }
  if (params.get('play') && (!frameParam || !params.has('preset'))) {
    const vocab0 = await loadJSON('data/vocab.json').catch(() => null);
    const film0 = vocab0 ? filmById(vocab0, params.get('play')) : null;
    if (film0?.preset && !params.has('preset')) { const q = new URLSearchParams(location.search); q.set('preset', film0.preset); location.replace(`?${q}`); return; }
    if (film0) {
      const ch0 = chapterOn(film0, parseDate(params.get('date')) ?? film0.start);
      if (!frameParam) {
        frameParam = ch0?.frame ?? film0.frame ?? null;
        frameFound = frameParam ? resolveFrame(frameParam, focusTable) : null;
        filmFrames = !!frameFound;
      }
    }
  }
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
  let [ohmSources, riversNA, regional] = await Promise.all([
    LESSON && params.get('highlight') ? loadJSON('data/us/ohm-sources.json').catch(() => null) : null,
    LESSON && (frameFound || riverNames.length) ? loadJSON('data/base/derived/rivers-na.topojson').catch(() => null) : null,
    // relief for a frame: North America at Natural Earth's full resolution (scripts/relief-region.mjs), else the world
    LESSON ? loadJSON('assets/relief/north-america-plate-carree.json').catch(() => null) : null,
  ]);
  const within = (b, r) => b.west >= r.west && b.east <= r.east && b.south >= r.south && b.north <= r.north;
  // a focus may bring relief of its own (a battle frame's USGS hillshade, src/focuses.json "relief")
  const focusRelief = frameFound?.focus?.relief ? await loadJSON(`assets/${frameFound.focus.relief}`).catch(() => null) : null;
  const sharp = focusRelief && within(frameFound.box, focusRelief.box) ? focusRelief : regional && within(frameFound?.box ?? stage.extent, regional.box) ? regional : null;
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
    // An inset (the Military layer's test 1: Scott's campaign): a focus drawn in a box above the cartouche.
    let inset = null;
    if (params.get('inset')) {
      const f = resolveFrame(params.get('inset'), focusTable);
      if (!f) problems.push(`inset "${params.get('inset')}" is neither a focus in src/focuses.json nor a box W,S,E,N; no inset is drawn`);
      else {
        const w = Math.min(360, Math.round(SHEET.w * 0.2)), h = Math.round(w * 0.9);
        inset = { id: `inset-${f.id ?? 'box'}`, title: f.title ?? params.get('inset'), box: f.box, projection: frameProjection(f, 'auto'), at: [32 + 22, SHEET.h - 64 - 22 - 128 - 22 - h, w, h] };
      }
    }
    lesson = {
      key: `${frameParam ?? 'continent'}-${projectionMode}-${SHEET.w}x${SHEET.h}`,
      sheet: { w: SHEET.w, h: SHEET.h },
      frame,
      inset,
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
  // Pan and zoom (owner, 2026-11-10): the lesson for a view the reader moved to. `fr`: a frame (a free view from
  // stage.js freeFrame, or a focus), or null for the continent. What the page opened with (its title, highlight,
  // rivers, inset) is kept; only the frame, its relief and its rivers follow the view.
  const lesson0 = lesson;
  let tilesJob = null; // the finer reliefs some focuses bring (a battlefield's hillshade), read once
  const reliefTiles = () => (tilesJob ??= Promise.all((focusTable.focuses ?? []).filter((f) => f.relief)
    .map((f) => loadJSON(`assets/${f.relief}`).then((j) => ({ id: f.id, image: j.image, box: j.box })).catch(() => null))).then((l) => l.filter(Boolean)));
  async function lessonFor(fr) {
    if (!fr && !LESSON) return null;
    if (fr && (!riversNA || !regional)) {
      const [r, g] = await Promise.all([riversNA ?? loadJSON('data/base/derived/rivers-na.topojson').catch(() => null), regional ?? loadJSON('assets/relief/north-america-plate-carree.json').catch(() => null)]);
      riversNA = r; regional = g;
    }
    const tiles = fr ? await reliefTiles() : [];
    const box = fr?.box ?? stage.extent;
    const own = fr?.focus?.relief ? tiles.find((t) => t.id === fr.focus.id) : null;
    const base = own && within(box, own.box) ? own : regional && within(box, regional.box) ? regional : null;
    const reaches = (t) => t.box.west < box.east && t.box.east > box.west && t.box.south < box.north && t.box.north > box.south;
    // (a finer image is laid over the base where it reaches the view, once the view is close enough for it to tell)
    const over = fr ? tiles.filter((t) => t !== base && reaches(t) && (box.east - box.west) < 12 * (t.box.east - t.box.west)).map((t) => ({ url: `assets/${t.image}`, bounds: t.box })) : [];
    const frame = fr ? { ...fr, projection: fr.view ? fr.spec : frameProjection(fr, projectionMode), legend: fr.focus?.legend ?? (fr.view ? 'bottom-right' : null), water: fr.focus?.water ?? [] } : null;
    const kept = lesson0 ?? { sheet: { w: SHEET.w, h: SHEET.h }, inset: null, title: null, highlight: null, twins: new Map(), rivers: riverNames,
      reliefScale: params.has('shot') ? 1 : 0.5, legendRows: (recs) => [...routeLegend(recs.routes), ...pointLegendRows(recs.points)] };
    const name = fr?.view ? `view:${fr.view.center.map((x) => x.toFixed(4)).join(',')}@${fr.view.pxPerKm.toPrecision(5)}` : fr ? (fr.id ?? `${fr.box.west},${fr.box.south},${fr.box.east},${fr.box.north}`) : 'continent';
    return { ...kept, key: `${name}-${projectionMode}-${SHEET.w}x${SHEET.h}`, frame, riverRank: frame ? riverRankFor(frame.box) : 0,
      reliefWorld: base ? `assets/${base.image}` : 'assets/relief/world-plate-carree.png', reliefBounds: base ? base.box : null, reliefOver: over };
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
    tracker: params.get('play') || params.get('battle') ? 'military' : TRACKERS[params.get('tracker')] ? params.get('tracker') : 'nations',
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
    forces: parseList(params.get('forces')), // only these forces' movements (and events that name a force), to follow one campaign
    sequence: params.get('sequence') === 'false' ? false : params.get('sequence') && params.get('sequence') !== 'true' ? parseList(params.get('sequence')) : true,
    strip: params.get('strip') || 'war',
    film: params.get('play') || null, // the play run: a film id from vocab.json's films (brief §5)
    // the classroom preset (key events and forces, a short key, larger type, widths by numbers); width=strength on its
    // own; view=<side>: the map as that side saw it (vocab.json wars[].views)
    preset: params.get('preset') || null,
    width: params.get('width') || null,
    view: params.get('view') || null,
    battle: params.get('battle') || null, // a battle frame (milestone 9): a battle id from a war's battles, at a phase
    phase: Math.max(1, Number(params.get('phase')) || 1),
    detailPhase: null, // a battle seen by zooming in: the phase picked in its list (null: the whole battle, or the phase the date has reached)
  };

  // The Military layer's data, read once when the layer is first shown: the wars of vocab.json and the membership
  // rows of the record table (the Sheet, or ?records= a file). Rows that fail validation are listed as problems.
  let milData = null;
  async function ensureMilitary() {
    if (milData) return milData;
    // The war rows live in a table of their own, data/military.csv (brief, question 5: provisionally a separate
    // table, 2026-11-09), read whenever the layer is on; ?records= points at another file instead.
    const loadMilitaryText = async () => {
      if (params.get('records')) return loadRecordsText();
      const text = await loadText('data/military.csv').catch(() => null);
      return text != null ? { text, from: 'file', sheet: {} } : loadRecordsText();
    };
    const [vocab, source, gazetteer] = await Promise.all([loadJSON('data/vocab.json'), loadMilitaryText(), loadJSON('data/gazetteer.json').catch(() => ({}))]);
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
    // the tech catalog, the reviewed icons the wars' forces and lines may carry (their path data), and milsymbol for
    // the force frames (vendored, MIT; a script, so the page's bundle stays light)
    const tech = await loadJSON('data/tech.json').catch(() => ({ items: {} }));
    const keys = new Set(['fort']);
    for (const w of vocab.wars ?? []) { for (const f of w.forces ?? []) for (const k of f.tech ?? []) keys.add(k); for (const l of w.lines ?? []) if (l.tech) keys.add(l.tech); }
    for (const r of mil) if (r.tech) keys.add(r.tech.trim());
    const icons = {};
    await Promise.all([...keys].map(async (k) => { const it = tech.items?.[k]; if (!it) return; const svg = await loadText(it.icon.file).catch(() => null); if (svg) icons[k] = svgPath(svg); }));
    if (!globalThis.ms) await new Promise((ok) => { const s = document.createElement('script'); s.src = 'assets/vendor/milsymbol/milsymbol.js'; s.onload = () => ok(true); s.onerror = () => { problems.push('milsymbol did not load: force frames are drawn plain'); ok(false); }; document.head.appendChild(s); });
    milData = { vocab, tech, icons, members: mil.filter((r) => r.kind === 'region'), events: pts.filter((r) => r.lon != null && r.lat != null), movements, file: source.from === 'file' ? (params.get('records') ?? 'data/military.csv') : source.from };
    if (!vocab.wars?.length) problems.push('vocab.json lists no wars yet; the Military layer has nothing to show');
    return milData;
  }
  let milWarned = false;
  let filmRec = null; // the film being played, resolved (src/military/play.js), once ?play= names one
  let battleRec = null; // { war, battle } once ?battle= names one of a war's battles
  let battleGround = null; // its downloaded roads and streams (data/battles/<id>.json)
  // What the layer shows on a date: the war asked for, else the longest war alive that day; its members; its title.
  function militaryFor(date) {
    if (!milData) return null;
    // (under a film the chapter says which war's record is shown; the menu and the address's war wait)
    const chapter = filmRec ? chapterOn(filmRec, date) : null;
    const war = battleRec ? battleRec.war : chapter?.war ? warById(milData.vocab, chapter.war) : state.war ? warById(milData.vocab, state.war) : (warsOn(milData.vocab, date)[0] ?? null);
    if (battleRec && war) return battleFor(war, battleRec.battle);
    // A war is shown through its last day and no longer (owner, 2026-11-10: "the day after the treaty, it goes right
    // back to normal country map and removes the battle/war history"). A film's chapters still say what they show.
    const past = !!war && !chapter && date > warDay(war.end, true);
    if (!war || past) {
      if (!war && state.war && !milWarned) { problems.push(`war "${state.war}" is not in vocab.json's wars`); milWarned = true; }
      detailRec = null; detailId = null; state.detailPhase = null;
      return { war: null, members: [], names: state.names, title: 'Military', file: milData.file, after: past ? war.id : null };
    }
    // Close enough to one of the war's battles, the sheet shows that battle (detailFor, below)
    const det = chapter ? null : detailFor(war, date);
    detailRec = det ? { war, battle: det.battle } : null;
    if (det) return battleFor(war, det.battle, det);
    const viewRows = state.view ? viewMembers(war, state.view) : [];
    if (state.view && !viewRows.length && !milWarned) { problems.push(`view "${state.view}" is not one of ${war.id}'s (${Object.keys(war.views ?? {}).join(', ') || 'none yet'}); the map is drawn without it`); milWarned = true; }
    const members = [...viewRows, ...membersOf(milData.members, war.id)];
    // the classroom preset: the war's key events and key forces only (vocab.json), unless the order names forces
    const classroom = state.preset === 'classroom';
    const keyEvents = classroom && war.key_events?.length ? new Set(war.key_events) : null;
    const forcesWanted = state.forces.length ? state.forces : classroom && war.key_forces?.length ? war.key_forces : [];
    const widthMode = state.width === 'strength' || (classroom && state.width !== 'plain');
    if (!members.length && !milWarned) { problems.push(`no membership rows for ${war.id} in ${milData.file}: every state is drawn as a non-member (paper)`); milWarned = true; }
    // the war's events: all of them for the strip; those begun by the date for the map, numbered as the order says
    const events = eventsOf(milData.events, war.id);
    const showEvents = !state.show.length || state.show.includes('events');
    const seqSpec = state.show.length && !state.show.includes('sequence') ? false : state.sequence;
    const byForce = (r) => !state.forces.length || !r.force || state.forces.includes(r.force);
    const begun = showEvents ? eventsUpTo(events, date).filter(byForce).filter((r) => !keyEvents || keyEvents.has(r.id)) : [];
    // (a war with more events than a list can hold, the Revolution's 170: only its key events carry a numeral,
    // unless the order says which; without a key list, none does)
    const crowded = seqSpec === true && begun.length > MANY_EVENTS;
    const shown = sequenceFor(begun, crowded ? (war.key_events?.length ? war.key_events : false) : seqSpec);
    // movements since `from` (else the war's start) that have begun by the date, in their sides' colors
    const forceById = new Map((war.forces ?? []).map((f) => [f.id, f]));
    // (a battle's own marches, attacks and lines belong to the battle seen close, not to the war's map: detailFor)
    const allMoves = withSides(movementsOf(milData.movements, war.id).filter((r) => !r.battle), war).map((r) => (widthMode ? { ...r, strengthN: strengthOf(r, forceById.get(r.force)) } : r));
    // (without `from`, every movement begun by the date: an army's approach march before the first shot belongs on the map)
    const since = state.since ?? 0;
    // after the war's last day (a film's aftermath chapter, or any later date) the armies stand down: no movements or
    // stands are drawn; the events, the lines and the list stay
    const over = date > warDay(war.end, true);
    const moves = over ? [] : !state.show.length || state.show.includes('movements') ? movementsSince(allMoves, since, date).filter((r) => !forcesWanted.length || forcesWanted.includes(r.force)) : [];
    // where each force stands on the date (from every movement of its own, filtered only by `forces`), and whether
    // its equipment icon may draw: the row's tech, else the force's first, if the catalog's years cover the date
    const forcesOf = (war.forces ?? []).filter((f) => !forcesWanted.length || forcesWanted.includes(f.id)).map((f) => ({ ...f, sideColor: war.sides.find((s) => s.id === f.side)?.color ?? null }));
    const positions = over ? [] : !state.show.length || state.show.includes('forces') ? forcePositions(forcesOf, allMoves, date) : [];
    const checks = Object.fromEntries(positions.map((p) => [p.force.id, techFor(p.force, p.row, milData.tech, date)]));
    return { war, members, events, shown, moves, allMoves, since, positions, checks, tech: milData.tech, icons: milData.icons, forces: state.forces, names: state.names, title: chapter ? chapter.title : warTitle(war, state.names), file: milData.file, strip: state.strip, show: state.show,
      preset: state.preset, widthMode, view: viewRows.length ? state.view : null,
      film: chapter ? { id: filmRec.id, title: filmRec.title, chapter: { n: chapter.n, count: filmRec.chapters.length, title: chapter.title, pace: chapter.pace, war: chapter.war, from: chapter.from, to: chapter.to }, span: [chapter.fromInt, chapter.toInt], seconds: filmRec.seconds, at: secondsAt(filmRec, date) } : null };
  }
  // The layer's events and movements join the order's places and routes on the sheet; set again only when they
  // change (a new date may add one).
  let recKey = null;
  function placeMilitaryRecords(mil) {
    const key = mil ? `${mil.war?.id}|${mil.shown.map((r) => `${r.id}:${r.seq ?? ''}`).join(',')}|${mil.moves.map((r) => r.id).join(',')}|${mil.positions.map((p) => `${p.force.id}@${p.at.join(',')}:${p.earlier.length}`).join(';')}` : '';
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
  // (built again whenever the reader pans or zooms to a new view: see "pan and zoom" below)
  const buildStage = () => createUSStage(svg, stage, { ne, bathy, riversNA }, {
    powers, trackers: TRACKERS,
    onPick: (it, date) => showInfo(it, date),
    onYear: (y, { live }) => { setDate(endOfYear(y), { exact: false, fade: live ? 0 : 250 }); },
    onPhase: (n) => pickPhase(n),
    lesson,
  });
  let atlas = buildStage();
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
    requestAnimationFrame(() => { const { fade: f } = pending; pending = null; draw(f); });
  }
  // One picture of the state as it stands (render() asks for it on the next frame; a re-framed stage draws at once).
  function draw(f) {
    {
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
        // (the Military layer with no war on the date is the plain map of nations: see militaryFor)
        const plain = state.tracker === 'military' && !milShown?.war;
        const n = atlas.show(data, state.date, plain ? 'nations' : state.tracker, { fade: f, electoral: ecShown, military: plain ? null : milShown });
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
      if (milShown) d3.select('#war').selectAll('option').property('selected', (w) => w.id === (milShown.war?.id ?? state.war ?? ''));
      filmStatus();
      if (state.tracker === 'military') fillMilitaryTools();
      const q = new URLSearchParams();
      if (state.mode === 'diff') q.set('from', state.fromExact ? isoDate(state.from) : yearOf(state.from));
      if (state.exact) q.set('date', isoDate(state.date)); else q.set('year', y);
      if (state.tracker !== 'nations') q.set('tracker', state.tracker);
      if (state.tracker === 'military') {
        if (state.war) q.set('war', state.war);
        if (state.names !== 'both') q.set('names', state.names);
        for (const k of ['show', 'sequence', 'strip', 'forces']) if (params.has(k)) q.set(k, params.get(k));
      }
      // (a lesson map's own fields stay in the address, so it can be copied and opened again)
      for (const k of ORDER_PARAMS) if (!['date', 'year', 'from', 'tracker'].includes(k) && params.has(k)) q.set(k, params.get(k));
      if (battleRec) q.set('phase', String(state.phase));
      if (state.tracker === 'military' && state.view) q.set('view', state.view); else q.delete('view');
      history.replaceState(null, '', `?${q}`);
      staleProxy();
    }
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
  const stepYear = (delta) => (battleRec && Math.abs(delta) === 1 ? setPhase(state.phase + delta) : detailRec && Math.abs(delta) === 1 ? stepDetail(delta) : state.tracker === 'electoral' && Math.abs(delta) === 1
    ? stepChange(delta) : setDate(endOfYear(yearOf(state.date) + delta)));
  function stepChange(dir) {
    const days = changeDays[state.tracker] ?? changeDays.nations;
    const d = dir > 0 ? days.find((x) => x > state.date) : [...days].reverse().find((x) => x < state.date);
    if (d) setDate(d, { exact: true });
  }
  function togglePlay() {
    if (filmRec) return toggleFilm();
    if (battleRec) return toggleBattlePlay();
    if (detailRec && !state.playing) {
      // ▶ over a battle seen close: its phases, four seconds each, then the whole battle again
      pickPhase(1);
      state.playing = setInterval(() => { if (!detailRec || state.detailPhase == null) { togglePlay(); return; } stepDetail(1); if (state.detailPhase == null) togglePlay(); }, PHASE_MS);
      d3.select('#play').classed('active', true).text('❚❚');
      return;
    }
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
  // A battle frame (milestone 9): what the sheet shows in phase n of a battle. Rows that name the battle: the forces'
  // positions (the latest by the phase in full, earlier ones faded), the lines of battle and the attacks whose phase
  // covers n, the terrain the sources name. No side fills, no course list: the phases are the list and the strip.
  // `whole` (a battle already fought, seen by zooming in): every phase's marches and attacks at once, the forces where
  // the last phase left them (their earlier stands faded), the lines of battle of the last phase.
  function battleFor(war, battle, { n: asked = null, whole = false, ground = battleGround, auto = false } = {}) {
    const phases = battle.phases ?? [];
    const n = Math.min(Math.max(1, asked ?? state.phase), Math.max(1, phases.length));
    const phase = phases.find((p) => p.n === n) ?? { n, label: `phase ${n}`, at: `${n}`, when: battle.start };
    const rows = [...battleRows(milData.events, battle.id), ...battleRows(milData.movements, battle.id), ...battleRows(milData.members, battle.id)];
    const members = membersOf(milData.members, war.id);
    const forcesOf = (war.forces ?? []).filter((f) => !state.forces.length || state.forces.includes(f.id)).map((f) => ({ ...f, sideColor: war.sides.find((s) => s.id === f.side)?.color ?? null }));
    const show = state.show.length ? state.show : ['movements', 'forces', 'terrain'];
    const isLine = (r) => r.kind === 'path' || ['front', 'siege-line', 'fortified-line', 'armistice-line'].includes(r.value);
    const inPhase = whole ? rows.filter((r) => (r.kind === 'arrow' || r.kind === 'path') && r.coords && (isLine(r) ? phaseCovers(r, n) : true)) : battleMoves(rows, n);
    const moves = show.includes('movements') ? withSides(inPhase, war).filter((r) => !state.forces.length || !r.force || state.forces.includes(r.force)) : [];
    const positions = show.includes('forces') ? battlePositions(forcesOf, rows, n, phases) : [];
    const checks = Object.fromEntries(positions.map((p) => [p.force.id, techFor(p.force, p.row, milData.tech, state.date)]));
    const shown = show.includes('terrain') ? battleTerrain(rows).map((r) => ({ ...r, seq: null })) : [];
    return { war, members, events: [], shown, moves, allMoves: moves, since: 0, positions, checks, tech: milData.tech, icons: milData.icons, forces: state.forces, names: state.names,
      title: `${battle.label}, ${battle.dates}`, file: milData.file, strip: 'battle', show, film: null,
      battle: { id: battle.id, record: battle, label: battle.label, dates: battle.dates, frame: battle.frame, phase: { n, label: phase.label, at: phase.at, when: phase.when, count: phases.length }, source: battle.source, ground, whole, auto } };
  }
  // Detail by zoom (owner, 2026-11-10: "if i was zoomed in enough, it would show me the siege itself with different
  // icons and arrows. but then i pan upwards to new york and everything else is still there"). When the view is
  // close on one of the shown war's battles (most of its field on the sheet, and the field at least a fifth of the
  // sheet's width) and the battle has begun by the date, the sheet shows that battle: on a day of the battle, the
  // phase reached that day; afterwards, the whole battle. A phase picked in the list is shown alone.
  let detailRec = null, detailId = null;
  const grounds = new Map(); // battle id → its downloaded roads and streams (null until read)
  function groundOf(b) {
    if (!b.ground?.file) return null;
    if (!grounds.has(b.id)) { grounds.set(b.id, null); loadJSON(b.ground.file).then((g) => { grounds.set(b.id, g); render({ fade: 0 }); }).catch(() => {}); }
    return grounds.get(b.id);
  }
  function detailFor(war, date) {
    const v = frameFound?.box;
    let best = null;
    if (v) for (const b of war.battles ?? []) {
      if (!b.frame || date < warDay(b.start)) continue; // not yet fought
      const f = resolveFrame(b.frame, focusTable);
      if (!f) continue;
      const ow = Math.min(v.east, f.box.east) - Math.max(v.west, f.box.west), oh = Math.min(v.north, f.box.north) - Math.max(v.south, f.box.south);
      if (ow <= 0 || oh <= 0) continue;
      const onSheet = (ow * oh) / ((f.box.east - f.box.west) * (f.box.north - f.box.south)); // how much of the field the sheet holds
      const share = (f.box.east - f.box.west) / (v.east - v.west); // how much of the sheet's width the field takes
      if (onSheet < 0.35 || share < 0.2) continue;
      if (!best || onSheet * share > best.score) best = { battle: b, score: onSheet * share };
    }
    if (!best) { detailId = null; state.detailPhase = null; return null; }
    const b = best.battle, phases = b.phases ?? [];
    if (b.id !== detailId) { detailId = b.id; state.detailPhase = null; }
    const done = date > warDay(b.end, true);
    let reached = 1;
    for (const p of phases) if (p.when && warDay(p.when) <= date) reached = p.n;
    return { battle: b, n: state.detailPhase ?? (done ? Math.max(1, phases.length) : reached), whole: done && state.detailPhase == null, ground: groundOf(b), auto: true };
  }
  function pickPhase(n) {
    if (battleRec) { if (n != null) setPhase(n); return; }
    if (!detailRec) return;
    state.detailPhase = n;
    render({ fade: 0 });
  }
  function stepDetail(dir) {
    const count = detailRec?.battle.phases?.length ?? 0;
    if (!count) return;
    const next = state.detailPhase == null ? (dir > 0 ? 1 : count) : state.detailPhase + dir;
    pickPhase(next < 1 || next > count ? null : next);
  }
  function setPhase(n) {
    if (!battleRec) return;
    const phases = battleRec.battle.phases ?? [];
    const k = Math.min(Math.max(1, n), Math.max(1, phases.length));
    if (k === state.phase) return;
    state.phase = k;
    const p = phases.find((x) => x.n === k);
    if (p?.when) { state.date = clampDate(parseDate(p.when) ?? state.date); state.exact = true; }
    render({ fade: 0 });
  }
  // ▶ under a battle frame steps the phases, four seconds each
  const PHASE_MS = 4000;
  function toggleBattlePlay() {
    if (state.playing) { clearInterval(state.playing); state.playing = null; }
    else {
      const count = battleRec.battle.phases?.length ?? 1;
      if (state.phase >= count) setPhase(1);
      state.playing = setInterval(() => { if (state.phase >= count) { toggleBattlePlay(); return; } setPhase(state.phase + 1); }, PHASE_MS);
    }
    d3.select('#play').classed('active', !!state.playing).text(state.playing ? '❚❚' : '▶');
  }
  // The film's clock (brief §5): ▶ runs the chapters at their paces from the date shown (from the start once the end
  // is reached). The date is read off the clock each animation frame, so a slow machine draws fewer frames and the
  // film still keeps time; between the record's dates nothing slides (grammar: stepped, not morphed).
  let filmRun = null;
  function toggleFilm() {
    if (filmRun) { cancelAnimationFrame(filmRun.raf); filmRun = null; }
    else {
      let clock = secondsAt(filmRec, state.date);
      if (clock >= filmRec.seconds - 0.05) clock = 0;
      const t0 = performance.now() - clock * 1000;
      filmRun = { raf: 0 };
      const tick = () => {
        const fr = frameAt(filmRec, (performance.now() - t0) / 1000);
        // a chapter framed elsewhere: the page reloads on its first day, framed on it, and plays on
        if (filmFrames && fr.chapter.frame && fr.chapter.frame !== frameFound?.id && resolveFrame(fr.chapter.frame, focusTable)) {
          filmRun = null;
          const q = new URLSearchParams(location.search);
          q.delete('frame'); q.delete('year'); q.set('date', fr.chapter.from); q.set('autoplay', '1');
          location.replace(`?${q}`);
          return;
        }
        setDate(fr.date, { exact: true, fade: 0 });
        if (fr.done) { filmRun = null; filmStatus(); d3.select('#play').classed('active', false).text('▶'); return; }
        filmRun.raf = requestAnimationFrame(tick);
      };
      filmRun.raf = requestAnimationFrame(tick);
    }
    d3.select('#play').classed('active', !!filmRun).text(filmRun ? '❚❚' : '▶');
  }
  function filmStatus() {
    if (battleRec) { const n = battleRec.battle.phases?.length ?? 0; d3.select('#film-status').text(`Phase ${state.phase} of ${n}`); return; }
    if (detailRec) { const b = milShown?.battle; d3.select('#film-status').text(b ? (b.whole ? `${b.label}: the whole battle` : `${b.label}: phase ${b.phase.n} of ${b.phase.count}`) : ''); return; }
    if (!filmRec) { d3.select('#film-status').text(''); return; }
    const ch = chapterOn(filmRec, state.date);
    const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    d3.select('#film-status').text(ch ? `Chapter ${ch.n} of ${filmRec.chapters.length} · ${mmss(secondsAt(filmRec, state.date))} / ${mmss(filmRec.seconds)}` : '');
  }

  // ------------------------------------------------------------ pan and zoom (owner, 2026-11-10)
  // Drag to pan, wheel or pinch to zoom, double-click to step in. While the gesture runs the drawn map slides and
  // scales as it is; when it rests the stage is built again on the view it reached (a center and a scale: north up at
  // the middle of the sheet, relief reshaded, rivers by scale, names placed afresh), so every resting view is a map
  // the page could have opened on, and its address says so (frame=W,S,E,N). Zooming out to the continent's own scale
  // returns the continent as it opens, insets and all.
  const KM_CLOSEST = 5; // the closest view: about five kilometers across the sheet
  const midOf = ([ax, ay, bx, by]) => [(ax + bx) / 2, (ay + by) / 2];
  const scaleNow = () => { const g = atlas.geo; const c = g.projection.invert(midOf(g.inner)); return { center: c, k: g.pxPerKmAt(c) }; };
  // the continent's own scale (pixels per kilometer at its middle): measured, or reckoned from its extent when the page opened on a frame
  const continentK = !frameFound ? scaleNow().k
    : (atlas.geo.inner[2] - atlas.geo.inner[0]) / ((stage.extent.east - stage.extent.west) * Math.cos((((stage.extent.south + stage.extent.north) / 2) * Math.PI) / 180) * 111.195);
  let zoomT = d3.zoomIdentity, reframes = 0, resetting = false;
  // What slides during the gesture is a picture of the map, not the drawing itself (thousands of paths, clips and
  // hatches are slow to move; one picture is not). The picture is taken a moment after every redraw and laid under
  // the drawing, where it cannot be seen; the first movement of a gesture hides the drawing and slides the picture.
  // If a gesture begins before the picture is ready, the drawing itself slides.
  let proxy = null, proxyStamp = 0, proxyTimer = null, sliding = null;
  function staleProxy() {
    proxyStamp++;
    clearTimeout(proxyTimer);
    proxyTimer = setTimeout(makeProxy, 180);
  }
  async function makeProxy() {
    if (document.hidden || sliding || params.has('shot')) return;
    const stamp = proxyStamp, g = atlas.geo, [ax, ay, bx, by] = g.inner;
    const box = svg.node().getBoundingClientRect();
    const scale = Math.min(2, Math.max(0.5, (box.width / atlas.sheet.w) * (window.devicePixelRatio || 1)));
    let url = null;
    try { url = await renderViewBitmap(svg.node(), { rect: [ax, ay, bx - ax, by - ay], scale }); } catch { return; }
    if (stamp !== proxyStamp || sliding || g !== atlas.geo) { URL.revokeObjectURL(url); return; }
    if (proxy) { proxy.node.remove(); URL.revokeObjectURL(proxy.url); }
    const node = d3.select(g.node.parentNode).insert('image', '.view-main').attr('class', 'zoom-proxy')
      .attr('x', ax).attr('y', ay).attr('width', bx - ax).attr('height', by - ay).attr('preserveAspectRatio', 'none').attr('href', url).node();
    proxy = { url, node, stamp };
  }
  const zoomer = d3.zoom()
    .filter((ev) => !ev.button && (!ev.ctrlKey || ev.type === 'wheel') && !!ev.target.closest?.('.view-clip-main'))
    .on('zoom', (ev) => {
      if (resetting) return;
      zoomT = ev.transform;
      if (!sliding) {
        // (the picture, if it shows the map as it now stands; else the drawing)
        const fresh = proxy && proxy.stamp === proxyStamp && proxy.node.isConnected;
        sliding = fresh ? proxy.node : atlas.geo.node;
        if (fresh) atlas.geo.node.style.display = 'none';
        clearTimeout(proxyTimer);
        svg.select('g.stage').classed('zooming', true);
      }
      sliding.setAttribute('transform', zoomT.toString());
    })
    .on('end', () => { if (!resetting) settle(); });
  // (a gesture that ended where it began: the drawing as it was)
  function restView() {
    if (sliding) { sliding.removeAttribute('transform'); atlas.geo.node.style.display = ''; sliding = null; }
    svg.select('g.stage').classed('zooming', false);
  }
  function zoomLimits() {
    const g = atlas.geo, k = scaleNow().k, [ax, ay, bx, by] = g.inner;
    zoomer.extent([[ax, ay], [bx, by]])
      .scaleExtent([g.framed ? Math.min(1, continentK / k) : 1, Math.max(1, (bx - ax) / KM_CLOSEST / k)])
      .translateExtent(g.framed ? [[-1e7, -1e7], [1e7, 1e7]] : [[ax, ay], [bx, by]]);
  }
  const frameText = (fr) => { const [ax, ay, bx, by] = atlas.geo.inner; return fr.view ? (() => {
    // the address's box: the meridians at the middle of the left and right edges, the parallels at the middle of the top and bottom
    const p = freeProjection(fr); const l = p.invert([ax, (ay + by) / 2]), r = p.invert([bx, (ay + by) / 2]), t = p.invert([(ax + bx) / 2, ay]), b = p.invert([(ax + bx) / 2, by]);
    return [l[0], b[1], r[0], t[1]].map((x) => +x.toFixed(4)).join(',');
  })() : `${fr.box.west},${fr.box.south},${fr.box.east},${fr.box.north}`; };
  // (the free view's own projection, to read its edges)
  function freeProjection(fr) {
    const [ax, ay, bx, by] = atlas.geo.inner;
    const p = d3.geoAzimuthalEqualArea().rotate(fr.spec.rotate).scale(1000).translate([0, 0]);
    const a = p([fr.view.center[0], fr.view.center[1] - 0.005]), c = p([fr.view.center[0], fr.view.center[1] + 0.005]);
    p.scale((1000 * fr.view.pxPerKm) / (Math.hypot(c[0] - a[0], c[1] - a[1]) / (0.01 * 111.195))).translate([(ax + bx) / 2, (ay + by) / 2]);
    return p;
  }
  // Build the stage on a frame (null: the continent) and draw it at once. The relief is made first, so the swap is one step.
  async function applyFrame(fr, still = () => true) {
    const mine = ++reframes;
    const t0v = performance.now();
    const next = await lessonFor(fr);
    await prepareRelief(stage, next);
    if (mine !== reframes || !still()) return false; // the reader moved on; the view they rest on is drawn instead
    frameFound = fr;
    frameParam = fr ? (fr.id ?? frameText(fr)) : null;
    if (frameParam) params.set('frame', frameParam); else params.delete('frame');
    lesson = next;
    if (filmRec) filmFrames = false; // the reader has taken the frame from the film's chapters
    closeInfo();
    if (proxy) { URL.revokeObjectURL(proxy.url); proxy = null; }
    sliding = null;
    atlas = buildStage();
    if (lesson) atlas.setRecords(orderRecords);
    atlas.strip.setChanges([...new Set(data.nb.map((it) => yearOf(it.p.s)))]);
    recKey = null; milToolsKey = null;
    zoomT = d3.zoomIdentity;
    resetting = true; svg.call(zoomer.transform, d3.zoomIdentity); resetting = false;
    zoomLimits();
    draw(0);
    console.log(`view ${frameParam ?? 'continent'}: rebuilt in ${(performance.now() - t0v).toFixed(0)} ms`);
    return true;
  }
  function settle() {
    const t = zoomT;
    if (t.k === 1 && t.x === 0 && t.y === 0) { restView(); return; }
    const g = atlas.geo;
    let center = g.projection.invert(t.invert(midOf(g.inner)));
    if (!center || !center.every(Number.isFinite)) { resetting = true; svg.call(zoomer.transform, d3.zoomIdentity); resetting = false; zoomT = d3.zoomIdentity; restView(); return; }
    const k = g.pxPerKmAt(center) * t.k;
    const e = stage.extent;
    center = [Math.max(e.west, Math.min(e.east, center[0])), Math.max(e.south, Math.min(e.north, center[1]))];
    // (at the continent's own scale, or wider, the continent itself)
    applyFrame(k > continentK * 1.04 ? freeFrame(center, k, { w: SHEET.w, h: SHEET.h }) : null, () => zoomT === t);
  }
  svg.call(zoomer);
  zoomLimits();
  const zoomBy = (f) => svg.transition().duration(220).call(zoomer.scaleBy, f);
  const zoomHome = () => applyFrame(null);
  // (for scripts and tests: a view by its center and how many kilometers the sheet is wide; resolves once drawn)
  const zoomTo = async (center, kmWide) => {
    const [ax, , bx] = atlas.geo.inner;
    const ok = await applyFrame(freeFrame(center, (bx - ax) / kmWide, { w: SHEET.w, h: SHEET.h }));
    await atlas.reliefReady;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return ok;
  };

  // ------------------------------------------------------------ toolbar (chrome; never exported)
  const tb = d3.select('#toolbar').html('');
  const sel = tb.append('select').attr('id', 'tracker').attr('title', 'Tracker')
    .on('change', async function () { state.tracker = this.value; closeInfo(); if (state.tracker === 'military') { await ensureMilitary(); fillWarMenu(); milToolsKey = null; } render(); });
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
  // The Military layer's other doors (owner, 2026-11-10: the desktop app has no address bar, so what opened only
  // by address needs a control): a "Go to" menu (the war's theater, a film, a battle frame, back to the continent),
  // whose view of the land, and the classroom preset. Shown only while the layer is on. The frame and the sheet are
  // set when the page starts, so these open the page again at the new address; the view redraws in place.
  const openAt = (patch, { fresh = false } = {}) => {
    const q = fresh ? new URLSearchParams() : new URLSearchParams(location.search);
    for (const [k, v] of Object.entries(patch)) { if (v == null) q.delete(k); else q.set(k, v); }
    if (!q.has('play') && !q.has('battle')) q.set('tracker', 'military');
    location.assign(`?${q}`);
  };
  const goSel = tb.append('select').attr('id', 'mil-go').attr('class', 'mil-only').attr('title', 'Open the theater of this war, the film, or a battle')
    .on('change', function () {
      const v = this.value; this.value = '';
      const war = milShown?.war ?? null;
      if (v === 'theater' && war?.frame) openAt({ frame: war.frame, war: war.id, play: null, battle: null, phase: null, size: null, autoplay: null });
      else if (v.startsWith('film:')) openAt({ play: v.slice(5) }, { fresh: true });
      else if (v.startsWith('battle:')) openAt({ battle: v.slice(7), phase: '1' }, { fresh: true });
      else if (v === 'continent') openAt({ tracker: 'military', date: isoDate(state.date), ...(war ? { war: war.id } : {}) }, { fresh: true });
    });
  const viewSel = tb.append('select').attr('id', 'mil-view').attr('class', 'mil-only').attr('title', 'Whose view of the land the map draws')
    .on('change', function () { state.view = this.value || null; milWarned = false; closeInfo(); render(); });
  const classBtn = tb.append('button').attr('id', 'mil-classroom').attr('class', 'mil-only').attr('title', 'Classroom: the key events only, a short key, larger type, arrows as wide as each army')
    .text('Classroom').on('click', () => openAt({ preset: state.preset === 'classroom' ? 'full' : 'classroom', scale: null }));
  let milToolsKey = null;
  function fillMilitaryTools() {
    if (!milData) return;
    const war = milShown?.war ?? null;
    const framed = frameFound?.id ?? null;
    const key = [war?.id, framed, state.film, state.battle, state.view, state.preset].join('|');
    if (key === milToolsKey) return;
    milToolsKey = key;
    const node = goSel.node();
    node.textContent = '';
    const opt = (parent, value, text) => { const o = document.createElement('option'); o.value = value; o.textContent = text; parent.appendChild(o); return o; };
    const group = (label) => { const g = document.createElement('optgroup'); g.label = label; node.appendChild(g); return g; };
    opt(node, '', 'Go to…');
    if (war?.frame && (framed !== war.frame || state.film || state.battle)) opt(node, 'theater', 'The theater of this war');
    const films = milData.vocab.films ?? [];
    if (films.length) { const g = group('Films (press ▶ to play)'); for (const f of films) opt(g, `film:${f.id}`, f.title); }
    const battles = (milData.vocab.wars ?? []).flatMap((w) => (w.battles ?? []).map((b) => ({ ...b, war: w })));
    if (battles.length) { const g = group('Battles, phase by phase'); for (const b of battles) opt(g, `battle:${b.id}`, `${b.label}, ${b.dates}`); }
    if (framed || state.film || state.battle) opt(node, 'continent', 'The whole continent');
    node.value = '';
    // whose view: the war's own views, if it has any
    const views = Object.keys(war?.views ?? {});
    const vnode = viewSel.node();
    vnode.textContent = '';
    opt(vnode, '', 'As U.S. law drew it');
    for (const v of views) opt(vnode, v, `As ${war.sides.find((s) => s.id === v)?.label ?? v} saw it`);
    vnode.value = views.includes(state.view) ? state.view : '';
    viewSel.style('display', views.length && !state.battle ? null : 'none');
    classBtn.classed('active', state.preset === 'classroom').style('display', state.battle ? 'none' : null);
  }
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
  tb.append('span').attr('id', 'film-status').attr('class', 'film-status').attr('title', 'The play run: chapter, and where the film\'s clock stands');
  tb.append('span').attr('class', 'sep');

  tb.append('button').attr('id', 'zoom-out').attr('title', 'Zoom out (−)').text('−').on('click', () => zoomBy(1 / 1.8));
  tb.append('button').attr('id', 'zoom-in').attr('title', 'Zoom in (+). Or: wheel to zoom, drag to pan, double-click to step in').text('+').on('click', () => zoomBy(1.8));
  tb.append('button').attr('id', 'zoom-home').attr('title', 'The whole continent (0)').text('⌂').on('click', () => zoomHome());
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
    // The play run (src/military/play.js): the film, its frames for export at a given rate, and a seek that resolves
    // once the frame is painted (scripts/film.mjs).
    film: () => (filmRec ? { id: filmRec.id, title: filmRec.title, frame: filmRec.frame ?? null, frame_shown: frameFound?.id ?? null, chapters_frame: filmFrames, seconds: filmRec.seconds, chapters: filmRec.chapters.map((c) => ({ n: c.n, title: c.title, from: c.from, to: c.to, pace: c.pace, war: c.war, frame: c.frame ?? filmRec.frame ?? null, seconds: c.seconds })) } : null),
    filmFrames: (fps) => (filmRec ? frameList(filmRec, fps).map((f) => ({ index: f.index, at: f.at, date: isoDate(f.date), hold: f.hold, chapter: f.chapter.n, frame: f.chapter.frame ?? filmRec.frame ?? null })) : []),
    battle: () => (battleRec ? { id: battleRec.battle.id, label: battleRec.battle.label, war: battleRec.war.id, phase: state.phase, phases: battleRec.battle.phases } : null),
    setPhase: async (n) => { setPhase(Number(n)); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return state.phase; },
    filmSeek: async (s) => { setDate(parseDate(s), { exact: true, fade: 0 }); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return isoDate(state.date); },
    get state() { return { ...state, iso: isoDate(state.date), fromIso: state.from != null ? isoDate(state.from) : null }; },
    // Pan and zoom: the view shown, and a view by its center and width in kilometers (resolves once drawn).
    view: () => ({ frame: frameParam, box: frameFound?.box ?? null, center: scaleNow().center, pxPerKm: scaleNow().k, kmWide: (atlas.geo.inner[2] - atlas.geo.inner[0]) / scaleNow().k, detail: detailRec ? detailRec.battle.id : null, phase: milShown?.battle ? { n: milShown.battle.phase.n, whole: !!milShown.battle.whole } : null }),
    zoomTo: (center, kmWide) => zoomTo(center, kmWide),
    zoomHome: async () => { await zoomHome(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return true; },
    pickPhase: async (n) => { pickPhase(n); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return state.detailPhase; },
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
    else if (e.key === '+' || e.key === '=') zoomBy(1.8);
    else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.8);
    else if (e.key === '0') zoomHome();
    else if (e.key === 'd' || e.key === 'D') setMode(state.mode === 'diff' ? 'snapshot' : 'diff');
    else if (e.key === 'e' || e.key === 'E') doExport(e.shiftKey ? '4k' : 'png');
  });

  // The play run (brief §5): ?play=<film id> from vocab.json's films. The page opens on the film's first day unless a
  // date is given, the tracker is Military, each chapter names its war, and ▶ (space) runs the film.
  if (state.battle) {
    await ensureMilitary();
    battleRec = battleById(milData.vocab, state.battle);
    if (!battleRec) problems.push(`battle "${state.battle}" is not a battle of any war in vocab.json`);
    else {
      state.war = battleRec.war.id;
      if (battleRec.battle.ground?.file) battleGround = await loadJSON(battleRec.battle.ground.file).catch(() => { problems.push(`the ground of ${battleRec.battle.label} (${battleRec.battle.ground.file}) could not be read; the frame is drawn without roads and streams`); return null; });
      const phases = battleRec.battle.phases ?? [];
      state.phase = Math.min(Math.max(1, state.phase), Math.max(1, phases.length));
      const p = phases.find((x) => x.n === state.phase);
      if (!params.get('date') && !params.get('year') && p?.when) { state.date = clampDate(parseDate(p.when)); state.exact = true; }
      fillWarMenu();
      warSel.property('disabled', true).attr('title', 'A battle frame shows its own war');
      d3.select('#play').attr('title', `Step through the phases of ${battleRec.battle.label} (space; ← → one phase)`);
    }
  }
  if (state.film) {
    await ensureMilitary();
    filmRec = filmById(milData.vocab, state.film);
    if (!filmRec) problems.push(`play "${state.film}" is not a film in vocab.json (${(milData.vocab.films ?? []).map((f) => f.id).join(', ') || 'none yet'})`);
    else {
      if (!params.get('date') && !params.get('year')) { state.date = clampDate(filmRec.start); state.exact = true; }
      if (!params.get('names') && filmRec.names) state.names = filmRec.names;
      fillWarMenu();
      warSel.property('disabled', true).attr('title', 'Under a film each chapter names its war');
      d3.select('#play').attr('title', `Play the film (space): ${filmRec.title}`);
      console.log(describeFilm(filmRec));
    }
  }
  render({ fade: 0 });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  document.body.classList.add('ready');
  // A reshaded relief arrives a moment later than the rest; the picture is ready when it is painted.
  await atlas.reliefReady;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  if (problems.length) console.warn(`lesson map: ${problems.join('; ')}`);
  resolveReady();
  if (filmRec && params.has('autoplay')) toggleFilm();

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

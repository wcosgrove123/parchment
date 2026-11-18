// Parchment — North America page: the packing slip.
// Every picture an order renders (scripts/map.mjs) comes with a JSON sidecar that says what is on it: the order and
// how the page resolved it; the legend as drawn; every polygon on the map with its names, ids, dates, certainty and
// source; the places and routes with their records' sources; a Diff's change list; warnings (names dropped for room,
// ids that found nothing on the date, gaps the sources admit); draft alt text built from all this by a fixed
// template, never written by a model; and a one-line credit for the slide. It lets whoever builds the slide check
// that the map says what the slide says, cite it, and describe it without guessing.

import { geoArea, geoContains, geoCentroid } from 'd3';
import { isoDate, longDate, yearOf, OPEN } from './dates.js';
import { US_FROM, nbName, cleanLabel, powerAt, aliveNB } from './model.js';
import { covered, slaveryCount } from './slavery.js';
import { freeOn, SOURCE as FREE_SOURCE } from './freeblack.js';
import { queryToOrder, itemKeys, slug } from './frames.js';
import { CLASS_TRACKERS } from './classify.js';
import { wbFuzzy, wbFuzzyUnit } from './wouldbe.js';
import { courseList, outcomeText, EVENT_ICONS } from '../military/events.js';

export const SLIP_VERSION = 'parchment-packing-slip/1';
const KM2 = 6371 * 6371;
const COLOR_NAMES = { In: 'green', S: 'orange', P: 'blue', E: 'gold', C: 'purple', T: 'teal', N: 'gray', focus: 'gold',
  'side-a': 'blue (side A)', 'side-b': 'plum (side B)', 'side-c': 'teal (side C)', 'side-d': 'ochre (side D)', 'side-gray': 'gray', 'side-red': 'red',
  'side-a-dep': 'blue at 40 % (dependent of side A)', 'side-b-dep': 'plum at 40 % (dependent of side B)', 'side-c-dep': 'teal at 40 % (dependent of side C)', 'side-d-dep': 'ochre at 40 % (dependent of side D)' };
const iso = (d) => (d == null ? null : d >= OPEN ? 'present' : isoDate(d));

// The source of one polygon, by the layer it came from.
function sourceOf(it, tags) {
  const p = it.p;
  if (it.src === 'newberry') {
    return {
      dataset: 'Atlas of Historical County Boundaries (U.S. Historical States and Territories), The Newberry Library', url: 'https://digital.newberry.org/ahcb/',
      license: 'Newberry terms: any lawful purpose, no fees', record: { id: p.id, version: p.v, change: p.change ?? null, authority: p.cite ?? null },
    };
  }
  if (it.src === 'ohm' && p.lvl === 'x') {
    return { dataset: 'Computed by Parchment (scripts/derive-us.mjs): the overlap of two OpenHistoricalMap polygons; nothing drawn', from: [p.a, p.b].map((r) => ({ ohm: r, url: `https://www.openhistoricalmap.org/relation/${r}` })) };
  }
  if (it.src === 'ohm') {
    const t = tags[p.rid] ?? {};
    const notes = {};
    for (const [k, label] of [['se', 'start_event'], ['ee', 'end_event'], ['src', 'source'], ['srcName', 'source_name'], ['srcUrl', 'source_url'], ['cite', 'citation'], ['nbCite', 'newberry_citation'], ['sds', 'start_date_source'], ['eds', 'end_date_source'], ['note', 'note'], ['fixme', 'fixme'], ['est', 'estimated'], ['wp', 'wikipedia']]) if (t[k]) notes[label] = t[k];
    // (a polygon the owner had cut at a river: its shape here ends at that river, src/us/disputes.js applyOHMCuts)
    return { dataset: it.cut ? `OpenHistoricalMap, ending at the ${it.cut.river} (${it.cut.source}; ${it.cut.rule})` : 'OpenHistoricalMap', url: `https://www.openhistoricalmap.org/relation/${p.rid}`, license: 'CC0 1.0', wikidata: p.wd ?? null, notes, ...(it.cut ? { cut_at: it.cut } : {}) };
  }
  if (it.src === 'nbx') {
    return { dataset: 'Computed by Parchment (scripts/derive-us-disputes.mjs): the overlap of two Newberry polygons; nothing drawn', from: [{ newberry: p.a, version: p.av, name: p.an }, { newberry: p.b, version: p.bv, name: p.bn }], ended: p.ended ?? null };
  }
  if (it.src === 'usmx') {
    return {
      dataset: `Computed by Parchment (scripts/derive-us-disputes.mjs): the overlap of a Newberry U.S. polygon and an OpenHistoricalMap Mexican polygon alive on the same days${p.edge ? `, ending at the ${p.edge.river} (${p.edge.source}; ${p.edge.rule})` : ''}; nothing drawn`,
      from: [{ newberry: p.a, version: p.av, name: p.an }, { ohm: p.b, name: p.bn, url: `https://www.openhistoricalmap.org/relation/${p.b}` }], ended: p.ended ?? [],
      ...(p.edge ? { cut_at: p.edge } : {}),
    };
  }
  if (it.src === 'hb') return { dataset: `historical-basemaps, world_${p.y}`, url: 'https://github.com/aourednik/historical-basemaps', license: 'GPL-3.0', note: p.y === 1492 ? 'its North American names follow Native Land Digital' : null };
  if (it.src === 'royce') return { dataset: 'U.S. Forest Service, Royce areas (Royce, Indian Land Cessions in the United States, 1899)', royce: p.royce ?? null, treaty: p.kappler ?? null };
  if (it.src === 'treaty' || it.src === 'treatyX') return { dataset: 'Computed by Parchment (scripts/derive-native.mjs) from the U.S. Forest Service Royce areas; nothing drawn' };
  if (it.src === 'aiannh') return { dataset: 'U.S. Census Bureau, cartographic boundary file, AIANNH 2025', url: 'https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html' };
  if (it.src === 'icc') return { dataset: 'Indian Claims Commission, Indian Land Areas Judicially Established (1978), digitized by the National Park Service' };
  if (it.src === 'wouldbe') {
    return {
      dataset: 'Computed by Parchment (scripts/derive-wouldbe.mjs) from downloaded shapes, along the line the would-be state\'s own document drew; nothing drawn',
      base: p.base, counties: p.counties?.length ? p.counties : null, cut: p.cut || null, shapes_of: iso(p.on), cut_from: p.from ?? [],
      record: { id: p.id, kind: p.kind, start: p.start, end: p.end, source: p.source, note: p.note }, table: 'data/us/wouldbe-states.csv',
    };
  }
  if (it.src === 'piece') {
    return {
      dataset: 'Computed by Parchment (scripts/derive-pieces.mjs) from the Newberry Library\'s polygons: the land the U.S. polygons gained on the acquisition\'s day, outside the 1783 domain, credited to its last entry and still U.S. land on the map\'s date; nothing drawn',
      acquisition: { key: p.key, date: p.date ?? null, label: p.label ?? null, name: p.name ?? null, instrument: p.instrument ?? null, from: p.from ?? null, source: p.source ?? null, note: p.note ?? null },
      ...(it.clipped ? { clipped_to: 'the polygons the order lit' } : {}),
    };
  }
  return { dataset: it.src };
}

function layerOf(it) {
  if (it.src === 'ohm') return it.p.lvl === 'x' ? 'ohm-overlap' : 'openhistoricalmap';
  return { newberry: 'newberry', nbx: 'newberry-dispute', usmx: 'us-mexico-dispute', hb: 'native-homeland', royce: 'land-cession', treaty: 'treaty-land', treatyX: 'treaty-land-overlap', aiannh: 'native-land-today', icc: 'original-territory', piece: 'acquisition-piece', wouldbe: 'would-be-state' }[it.src] ?? it.src;
}
function nameOf(it) {
  const p = it.p;
  if (it.src === 'newberry') return nbName(p);
  if (it.src === 'piece') return p.name ?? p.key;
  if (it.src === 'nbx' || it.src === 'usmx') return `Claimed by both ${p.an} and ${p.bn}`;
  if (it.src === 'royce') return `Royce area ${p.n}${p.tribe ? ` (${p.tribe})` : ''}`;
  if (it.src === 'icc') return p.tribe;
  return p.name;
}
function datesOf(it) {
  const p = it.p;
  if (it.src === 'newberry' || it.src === 'nbx' || it.src === 'usmx' || it.src === 'treaty' || it.src === 'treatyX') return { start: iso(p.s), end: iso(p.e), end_is: 'last day in force' };
  if (it.src === 'ohm' || it.src === 'hb') return { start: iso(p.s), end: iso(p.e), end_is: 'the day it ceased' };
  if (it.src === 'royce') return { start: iso(p.d), end: null };
  if (it.src === 'piece') return { start: iso(p.s), end: iso(p.e), end_is: 'last day of the stretch on which the U.S. land is the same' };
  if (it.src === 'wouldbe') return { start: iso(p.s), end: iso(p.e), end_is: 'last day; a month or a year where the source gives no day', dated_as: { start: p.start, end: p.end } };
  return { start: null, end: null };
}
function idsOf(it) {
  const p = it.p;
  if (it.src === 'newberry') return { newberry: p.id, newberry_version: p.v };
  if (it.src === 'piece') return { acquisition: p.key };
  if (it.src === 'wouldbe') return { would_be: p.id, keys: p.keys ?? [] };
  if (it.src === 'ohm') return p.lvl === 'x' ? { ohm_overlap: p.rid, ohm: [p.a, p.b] } : { ohm: p.rid, wikidata: p.wd ?? null };
  if (it.src === 'nbx') return { newberry: [p.a, p.b] };
  if (it.src === 'usmx') return { computed: p.id, newberry: p.a, newberry_version: p.av, ohm: p.b };
  if (it.src === 'royce') return { royce: p.n };
  if (it.src === 'hb') return { historical_basemaps: `world_${p.y}` };
  return {};
}
function certaintyOf(it, date) {
  if (it.src === 'hb' || it.look?.pattern === 'stipple') return 'sphere';
  if (it.src === 'ohm') return date < US_FROM ? 'approximate' : 'legal';
  return 'legal';
}
function lookOf(it, fills) {
  const l = it.look ?? {};
  if (l.fill) return { kind: 'fill', key: l.fill, color: fills[l.fill] ?? null, name: COLOR_NAMES[l.fill] ?? l.fill };
  if (l.pattern && l.area) return { kind: 'pattern', pattern: `rust hatch (${l.area})` };
  if (l.pattern) return { kind: 'pattern', pattern: l.pattern === 'hatch' ? 'rust hatch (overlap or dispute)' : l.pattern === 'stipple' ? 'ink stipple, soft edge (approximate homeland)' : l.pattern === 'crosshatch' ? 'rust cross-hatch (in rebellion)' : l.pattern };
  if (l.seq) return { kind: 'sequence', step: l.seq, label: l.label ?? null };
  if (l.pop) return { kind: 'sequence', step: l.pop, label: l.label ?? null };
  if (l.land) return { kind: 'fill', key: `land-${l.land}` };
  return { kind: 'paper', note: 'no fill: border and name only' };
}

// The legend as drawn, read from the sheet itself: each row's label, the swatch's colour or pattern, and its role.
function legendAsDrawn(spec) {
  const out = [];
  const rows = typeof document !== 'undefined' ? [...document.querySelectorAll('#map .legend g.row')] : [];
  rows.forEach((row, i) => {
    const r = spec?.legend?.[i] ?? {};
    const sw = row.querySelector('rect, line, path');
    const cs = sw ? getComputedStyle(sw) : null;
    const fill = cs?.fill ?? null;
    const pattern = fill && /url\(/.test(fill) ? fill.replace(/^url\(["']?#?|["']?\)$/g, '').replace(/.*#/, '') : null;
    const role = r.role ?? (r.swatch === 'route' ? 'route' : r.swatch === 'shape' ? 'point type' : r.swatch === 'line' ? (/route/i.test(r.label ?? '') ? 'route certainty' : 'border certainty') : r.key === 'hatch' ? 'dispute or overlap' : r.key === 'stipple' ? 'native homeland' : r.swatch === 'none' ? 'note' : 'category');
    out.push({
      label: row.querySelector('text:not(.swatch-text)')?.textContent ?? r.label ?? '', swatch: r.swatch ?? null, key: r.key ?? null,
      fill: pattern || r.swatch === 'line' || r.swatch === 'route' || r.swatch === 'none' ? null : toHex(fill), pattern, stroke: r.swatch === 'line' || r.swatch === 'route' ? toHex(cs?.stroke) : null,
      dash: r.style ?? null, shape: r.shape ?? null, heads: r.heads ?? null, role,
    });
  });
  return { title: spec?.title ?? null, rows: out };
}
function toHex(c) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c ?? '');
  if (!m) return c && c !== 'none' ? c : null;
  return `#${[m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, '0')).join('')}`;
}

export async function buildSlip({ atlas, data, state, stage, powers, trackers, params, sheet, frame, projectionMode, lesson, records, problems, loadJSON, ec, military = null, underground = null }) {
  const cur = atlas.current ?? {};
  const tags = (await loadJSON('data/us/ohm-sources.json').catch(() => null))?.relations ?? {};
  const root = getComputedStyle(document.documentElement);
  const fills = Object.fromEntries(['In', 'S', 'P', 'E', 'C', 'T', 'N'].map((k) => [k, root.getPropertyValue(`--fill-${k}`).trim()]));
  fills.focus = root.getPropertyValue('--focus').trim();
  for (const k of ['a', 'b', 'c', 'd', 'gray', 'red']) { const v = root.getPropertyValue(`--side-${k}-fill`).trim(); if (v) { fills[`side-${k}`] = v; fills[`side-${k}-dep`] = v; } }
  const date = state.date;
  const diff = state.mode === 'diff';
  const tracker = trackers[state.tracker];
  const warnings = [...problems];
  const info = atlas.frameInfo();

  // ---- the order, as given and as resolved
  const order = queryToOrder(params);
  const proj = frame ? { name: frame.projection.projection, rotate: frame.projection.rotate ?? null, parallels: frame.projection.parallels ?? null, chosen_by: frame.projection.chosenBy === 'auto' ? 'chooseProjection (src/render/focus.js): projection follows the focus' : frame.projection.chosenBy === 'page' ? "the page's own Albers, re-fitted to the frame" : 'the focus names it' }
    : { name: 'albers', parallels: [29.5, 45.5], rotate: [96, 0], chosen_by: 'the North America stage (src/stages/north-america.json)' };
  const titleShown = document.querySelector('#map .cartouche .map-title')?.textContent ?? null;
  const resolved = {
    page: 'us.html',
    address: `us.html?${new URLSearchParams([...new URLSearchParams(location.search)].filter(([k]) => k !== 'shot'))}`,
    mode: diff ? 'diff' : 'snapshot',
    date: isoDate(date), date_text: state.exact ? longDate(date) : `${yearOf(date)} (as of ${longDate(date)})`,
    from: diff ? isoDate(state.from) : null,
    tracker: { id: state.tracker, title: tracker?.title ?? state.tracker },
    election: ec ? { year: ec.election.year, day: isoDate(ec.election.day) } : null,
    frame: frame ? { id: frame.id, title: frame.title, box: frame.box, from: frame.raw ? 'the order (a raw box)' : 'src/focuses.json' } : { id: null, title: 'North America (the whole sheet)', box: stage.extent, from: 'src/stages/north-america.json' },
    projection: proj,
    size: { width: sheet.px.width, height: sheet.px.height, sheet_units: [sheet.w, sheet.h], scale: sheet.scale },
    title: titleShown,
    highlight: lesson?.highlight ? { ids: lesson.highlight.ids, unmatched: lesson.highlight.unmatched() } : null,
    inset: lesson?.inset ? { id: lesson.inset.id, title: lesson.inset.title, box: lesson.inset.box, at: lesson.inset.at, projection: lesson.inset.projection?.projection ?? null } : null,
    // the stage's own insets on the sheet: Alaska and the Hawaiian Islands on the continent; on a frame, those the order named
    stage_insets: (atlas.stageInsets ?? []).map((s) => ({ id: s.id, title: s.title, at: s.box })),
    legend_corner: info.legend?.anchor ?? null,
    water_names: info.waterLabels,
    records_file: records?.file ?? null,
    // The slavery-status tracker: the table, the span it speaks for, and the count of states by status on the date.
    status: (state.tracker === 'slavery' || state.tracker === 'freeblack') && data.slavery ? { table: data.slavery.file, coverage: (tracker.coverage ?? []).map((d) => isoDate(d)), covered: covered(tracker, date), ...slaveryCount(data.slavery, tracker, aliveNB(data, date), date), note: 'counts are of every state in force on the date, on or off the sheet; territories without a row take one neutral fill; the District of Columbia and joint or disputed areas stay paper' } : null,
    // The Underground Railroad (owner, 2026-11-17): the table, the rule for which routes show, and the routes not on the map of this date.
    underground: underground ? { table: underground.file, rule: 'a route is drawn in the years its row gives, the years it was in use: from the first year a source documents it to the year a source says it stopped, or to 1865 where no source records an end (each note gives the last documented year); routes that share a leg are drawn as one line there', routes_shown: underground.routes.length, towns_shown: underground.points.length, routes_in_table: underground.all.length,
      not_yet_begun: underground.all.filter((r) => r.first > date).map((r) => ({ record: r.id, label: r.label, start: r.start })), no_longer_in_use: underground.all.filter((r) => r.last < date).map((r) => ({ record: r.id, label: r.label, end: r.end })),
      note: 'TEST ROWS until the owner reviews them; the research and every citation are in docs/UNDERGROUND-RAILROAD.md' } : null,
    // The Military layer (brief of 2026-11-09 §6): the war, its sides, and each member with its dates and role.
    war: military?.war ? {
      id: military.war.id, names: military.war.names, names_shown: military.names, start: military.war.start, end: military.war.end, source: military.war.source ?? null,
      sides: military.war.sides.map((s) => ({
        id: s.id, label: s.label, color: s.color, fill: root.getPropertyValue(`--side-${s.color}-fill`).trim() || null, line: root.getPropertyValue(`--side-${s.color}-line`).trim() || null, why: s.why ?? null,
        members: military.members.filter((m) => m.side === s.id).map((m) => ({ record: m.id, where: m.where, label: m.label, role: m.value, start: m.startWhen ? String(m.start_raw ?? '') || null : null, end: null, dates: `${m.startWhen?.year ?? ''}${m.startWhen?.month ? `-${String(m.startWhen.month).padStart(2, '0')}` : ''}${m.startWhen?.day ? `-${String(m.startWhen.day).padStart(2, '0')}` : ''} – ${m.endWhen?.year ?? ''}${m.endWhen?.month ? `-${String(m.endWhen.month).padStart(2, '0')}` : ''}${m.endWhen?.day ? `-${String(m.endWhen.day).padStart(2, '0')}` : ''}`, grade: m.grade, source: m.source, qc_status: m.qc_status || null })),
      })),
      // occupied land on the map's date (P2): the province, the occupier, the dates and the source of each row
      occupied: military.members.filter((m) => m.value === 'occupied' && (m.startWhen ? (m.startWhen.year * 10000 + (m.startWhen.month ?? 1) * 100 + (m.startWhen.day ?? 1)) <= state.date : true) && (m.endWhen ? (m.endWhen.year * 10000 + (m.endWhen.month ?? 12) * 100 + (m.endWhen.day ?? 31)) >= state.date : true))
        .map((m) => ({ record: m.id, where: m.where, label: m.label, by: m.side, start: m.start ?? null, end: m.end ?? null, grade: m.grade ?? null, source: m.source ?? null })),
      members_file: records?.file ?? military.file ?? null,
      // milestone 2: the events on the sheet and the course of the war as the margin list prints it; the strip
      events_on_sheet: (military.shown ?? []).map((r) => r.id), events_in_war: (military.events ?? []).length,
      course: courseList(military.shown ?? [], military.war), strip: military.strip ?? 'war', show: military.show?.length ? military.show : 'everything built',
      // milestone 3: movements since `from` (else the war's start) begun by the date
      movements_since: military.since ? isoDate(military.since) : null, movements_on_sheet: (military.moves ?? []).map((r) => r.id), movements_in_war: (military.allMoves ?? []).length,
      forces_shown: military.forces?.length ? military.forces : 'all',
      // milestone 5: where each force stands, its equipment and the catalog's verdict on it, and the icons drawn
      forces: (military.positions ?? []).map((p) => { const c = military.checks?.[p.force.id] ?? {}; return { id: p.force.id, label: p.force.label, commander: p.force.commander ?? null, side: p.force.side, type: p.force.type, echelon: p.force.echelon ?? null, at: { lon: p.at[0], lat: p.at[1] }, since: isoDate(p.since), moving: p.moving, from_row: p.row?.id ?? null, earlier_stands: p.earlier.length, strength: p.force.strength ?? null, tech: c.key ?? null, tech_drawn: !!c.ok, tech_note: c.why ?? null, source: p.force.source ?? null }; }),
      preset: military.preset ?? null, width: military.widthMode ? 'strength' : null,
      view: military.view ? { side: military.view, note: military.war.views?.[military.view]?.note ?? null, source: military.war.views?.[military.view]?.source ?? null } : null,
      battle: military.battle ? { id: military.battle.id, label: military.battle.label, dates: military.battle.dates, frame: military.battle.frame, phase: military.battle.phase, source: military.battle.source, ground: military.battle.ground?._source ? { roads: military.battle.ground._source.roads, streams: military.battle.ground._source.streams, fetched: military.battle.ground._source.fetched, counts: military.battle.ground._source.counts } : null, note: 'a battle frame (milestone 9): positions are the sources\' narrative read onto gazetteer places, each approximate; no side fills at this scale' } : null,
      film: military.film ? { id: military.film.id, title: military.film.title, chapter: military.film.chapter, chapter_span: military.film.span.map((d) => isoDate(d)), film_seconds: Math.round(military.film.seconds), at_second: Math.round(military.film.at), note: 'the play run: the chapter says which war is shown and what span the strip covers; press play on the live address, or npm run film' } : null,
      icons_used: [...new Set([...(military.positions ?? []).map((p) => military.checks?.[p.force.id]).filter((c) => c?.ok).map((c) => c.key), ...(military.lines ?? []).filter((l) => l.tech && military.icons?.[l.tech]).map((l) => l.tech), ...((military.shown ?? []).some((r) => r.value === 'fort') && military.icons?.fort ? ['fort'] : []), ...(military.shown ?? []).map((r) => EVENT_ICONS[r.value]).filter((k) => k && military.icons?.[k])])].map((k) => { const it = military.tech?.items?.[k]; return { key: k, depicts: it?.depicts ?? null, in_use: it?.in_use ?? null, file: it?.icon?.file ?? null, author: it?.icon?.author ?? null, license: it?.icon?.license ?? null, reference: it?.reference ?? null }; }),
      // milestone 4: the computed lines, each with how it was made (nothing drawn by hand)
      lines: (military.lines ?? []).map((l) => ({ id: l.id, kind: l.kind, label: l.label, side: l.side ?? null, computed_from: l.kind === 'blockade' ? `the coast of ${l.coast_of}'s polygons as drawn on ${isoDate(l.on_date)} (${l.polygons} polygon${l.polygons === 1 ? '' : 's'}), inside the window given, moved 14 px offshore` : `the edge of ${l.border_of}'s polygons as drawn on ${isoDate(l.on_date)} (${l.polygons} polygon${l.polygons === 1 ? '' : 's'}) where it meets ${l.against}'s land`, on: isoDate(l.on_date), window: l.window ?? null, runs: l.runs.length, length_px: l.length_px, source: l.source ?? null })),
    } : null,
  };
  // The statehood deck's classification trackers: the table or the computed pieces, and what the date holds.
  if (CLASS_TRACKERS.has(state.tracker)) {
    resolved.classification = classificationOf({ state, data, trackers, cur, date, frame, atlas });
    if (resolved.classification.note) warnings.push(resolved.classification.note);
  }
  for (const id of resolved.highlight?.unmatched ?? []) warnings.push(`highlight "${id}" lit nothing alive on ${longDate(date)}`);
  // A polygon the order lit that is alive on the date but not on this map (Alaska and Hawaii on a frame: a frame
  // draws no insets, src/us/stage.js). The highlight found it, so it is not "unmatched"; the slip says where it went.
  if (resolved.highlight) {
    resolved.highlight.off_frame = offFrame({ atlas, data, state, cur, frame, lesson, powers, stage });
    for (const o of resolved.highlight.off_frame) warnings.push(o.inset
      ? `${o.name} (${o.id}) is lit but not on this map: a frame draws no ${o.inset} inset, so ${o.name} is shown only on the whole continent (an order with no frame)`
      : `${o.name} (${o.id}) is lit but lies outside this ${frame ? 'frame' : 'map'}`);
  }

  // The free Black population tracker: the census, the counts by status, and every polygon's count, largest first.
  const fb = state.tracker === 'freeblack' && data.free ? freeOn(data.free, data.pop?.anchors, aliveNB(data, date), date, { slavery: data.slavery, tracker: trackers.slavery }) : null;
  if (fb) {
    resolved.census = {
      year: fb.census.year, day: isoDate(fb.census.day), table: data.free.file, source: FREE_SOURCE,
      free_black_people: fb.total, in_slave_states: fb.by.slave, in_free_states: fb.by.free, in_territories_and_dc: fb.by.elsewhere,
      counts: fb.ranked.map((u) => ({ polygon: u.id, name: u.name, status: u.status, free: u.free, slave: u.slave, badge: !!fb.badgeOf(u.it.p), census_rows: u.rows })),
      not_placed: fb.outside.map((s) => ({ state: s.state, free: s.free })),
      note: 'the paper counts each state within its present-day borders; a row is added onto the polygon of the date that holds a point inside that state',
    };
    if (fb.census.day !== date) warnings.push(`the counts are the census of ${longDate(fb.census.day)}, the latest taken by the map's date`);
    for (const s of fb.outside) if (s.free) warnings.push(`${s.state}'s ${s.free.toLocaleString('en-US')} free Black people (${fb.census.year} census) fall in no polygon of the date and are counted with the territories`);
  }

  // ---- the polygons on the map
  const labelOf = new Map((cur.polityLabels ?? []).filter((l) => l.it).map((l) => [l.it, l.text]));
  for (const l of cur.polityLabels ?? []) if (l.it && !labelOf.has(l.it)) labelOf.set(l.it, l.text);
  // A Diff's polygons are the units it compared: appeared, changed hands and persisted from the later date, vanished
  // from the earlier; each says which.
  const role = new Map();
  let pool = cur.items ?? [];
  if (diff && cur.diff) {
    const put = (units, side, r) => { for (const u of units) for (const it of u[side] ?? []) if (!role.has(it)) role.set(it, r); };
    put(cur.diff.appeared, 'b', 'appeared'); put(cur.diff.changed, 'b', 'changed hands'); put(cur.diff.vanished, 'a', 'vanished'); put(cur.diff.persisted, 'b', 'persisted');
    pool = [...role.keys()];
  }
  // (labels in a Diff are placed on copies of the units' polygons; match them back by polygon)
  const labelByF = new Map((cur.polityLabels ?? []).filter((l) => l.it?.f).map((l) => [l.it.f, l.text]));
  // (on a frame: inside it, or in the Alaska or Hawaii inset the order asked for)
  const shown = pool.filter((it) => it.f && (frame ? atlas.inFrame(it.f) || atlas.inInset(it.f) : atlas.shows(it.f)));
  // OpenHistoricalMap's copies of Newberry polygons (hidden on the page, which draws Newberry's own): listed with the
  // Newberry polygon they copy, so either id finds it (the Republic of Texas is Newberry tx_republic and OHM 2692792).
  const ohmById = new Map(data.ohm.map((it) => [it.p.rid, it]));
  const copies = new Map();
  for (const [rid, t] of Object.entries(tags)) {
    if (!t.nb) continue;
    const k = `${t.nb}.${t.nbv ?? ''}`;
    if (!copies.has(k)) copies.set(k, []);
    copies.get(k).push(Number(rid));
  }
  const copiesOf = (p) => [...(copies.get(`${p.id}.${p.v}`) ?? []), ...(copies.get(`${p.id}.`) ?? [])].map((rid) => {
    const o = ohmById.get(rid);
    return { ohm: rid, url: `https://www.openhistoricalmap.org/relation/${rid}`, name: o?.p.name ?? null, start: o ? iso(o.p.s) : null, end: o ? iso(o.p.e) : null, note: "OpenHistoricalMap's copy of this Newberry polygon (hidden on the page, which draws Newberry's own)" };
  });
  const features = shown.map((it) => {
    // (a Newberry polygon's category as drawn: the Republic of Texas takes its own where the map has room, stage.js ownFills)
    const pw = it.src === 'ohm' ? powerAt(it.p, date) : it.src === 'newberry' ? it.cat ?? it.p.power : it.cat ?? null;
    const c = pw ? powers.categories[pw] : null;
    let pl = c?.label ?? null;
    for (const [from, t] of c?.labels ?? []) if (date >= from) pl = t;
    const ids = idsOf(it);
    if (it.src === 'newberry') { const cp = copiesOf(it.p); if (cp.length) ids.also_in_ohm = cp; }
    const r = role.get(it) ?? null;
    const look = r ? (r === 'vanished' ? { kind: 'pattern', pattern: 'rust hatch, rust outline (vanished)' } : r === 'persisted' ? { kind: 'paper', note: 'persisted: border only' } : { kind: 'fill', key: 'focus', color: fills.focus, name: 'gold' }) : lookOf(it, fills);
    const label = labelOf.get(it) ?? labelByF.get(it.f) ?? null;
    return {
      layer: layerOf(it), name: cleanLabel(nameOf(it)) ?? nameOf(it), local: it.p.local ?? null, ids, ...datesOf(it),
      certainty: certaintyOf(it, date), power: pw, power_label: pl, look, diff_role: r, ...(it.look?.area && !r ? { keyed_as: it.look.area } : {}),
      ...(fb && it.src === 'newberry' && fb.unitOf(it.p) ? { free_black: { count: fb.unitOf(it.p).free, badge: !!fb.badgeOf(it.p), census_rows: fb.unitOf(it.p).rows } } : {}),
      ...((state.tracker === 'slavery' || state.tracker === 'freeblack') && it.src === 'newberry' ? { status: it.status ?? null, status_row: it.statusRow ? { id: it.statusRow.id, start: it.statusRow.start, end: it.statusRow.end, source: it.statusRow.source, note: it.statusRow.note } : null } : {}),
      ...((state.tracker === 'paths' || state.tracker === 'chapters') && it.src === 'newberry' ? { class: it.classRow ? { value: it.classRow.value, title: it.classRow.title, source: it.classRow.source, note: it.classRow.note } : null } : {}),
      ...(it.src === 'wouldbe' ? { would_be: { kind: it.p.kind, date_known_to_the_day_today: !wbFuzzy(it, date), known_to: wbFuzzyUnit(it, date) ?? 'day', edge: it.look?.dashed ? 'dashed' : 'solid' } } : {}),
      lit: diff ? null : it.lit ?? null, lit_by: diff ? null : it.litBy ?? null, lit_as_named: !diff && !!(it.lit && it.litBy && !atlas.isPowerKey(it.litBy, pw)), labeled: !!label, label, cut_by_frame: atlas.cutByFrame(it.f),
      km2: Math.round(geoArea(it.f) * KM2), source: sourceOf(it, tags),
    };
  }).sort((a, b) => (b.lit === true) - (a.lit === true) || b.labeled - a.labeled || b.km2 - a.km2);
  // A Diff's land that changed hands (states tracker): each piece is on the map in the focus color, with its source.
  if (diff && cur.diff?.handoffs?.length) {
    for (const h of cur.diff.handoffs) {
      const label = labelByF.get(h.f) ?? null;
      features.push({
        layer: 'changed-hands', name: `${nbName(h.from.p)} → ${nbName(h.to.p)}`, local: null,
        ids: { newberry: [h.from.p.id, h.to.p.id] }, start: isoDate(cur.diff.a), end: isoDate(cur.diff.b), end_is: 'the two dates compared',
        certainty: 'legal', power: 'us', power_label: powers.categories.us?.label ?? null, look: { kind: 'fill', key: 'focus', color: fills.focus, name: 'gold' }, diff_role: 'changed hands',
        lit: null, lit_by: null, lit_as_named: false, labeled: !!label, label, cut_by_frame: atlas.cutByFrame(h.f), km2: h.km2,
        source: handoffSource(h),
      });
    }
  }
  for (const f of features) {
    // (a polygon the order named by its own name; one lit only because its power was named need not carry a name)
    if (f.lit_as_named && !f.labeled && f.layer !== 'us-mexico-dispute' && f.layer !== 'newberry-dispute' && f.layer !== 'ohm-overlap') warnings.push(`${f.name} is lit but carries no name (no room for it)`);
    const n = f.source?.notes;
    if (n?.fixme && (f.lit || f.labeled)) warnings.push(`OpenHistoricalMap's own note on ${f.name}: ${n.fixme}`);
    if (n?.estimated === 'yes' && (f.lit || f.labeled)) warnings.push(`${f.name}: OpenHistoricalMap marks its dates as estimated${f.end ? ` (end ${f.end})` : ''}`);
    // a would-be state: a date known only to the month or year, and its record's caveats (what is not drawn, what a
    // bound rests on, what the source leaves open)
    if (f.would_be && f.lit) {
      const rec = f.source.record;
      if (!f.would_be.date_known_to_the_day_today) warnings.push(`${f.name}: on this date its record is known only to the ${f.would_be.known_to} (${rec.start}–${rec.end ?? 'present'}); its edge is dashed`);
      for (const s of String(rec.note ?? '').split(/(?<!U\.S)(?<=\.)\s+(?=[A-Z])/)) if (/not drawn|rests on|does not say|never fixed/i.test(s)) warnings.push(`${f.name}: ${s}`);
    }
  }
  if (resolved.status) {
    const rows = features.filter((f) => f.status_row);
    if (rows.length) warnings.push(`the status of ${rows.length} state${rows.length === 1 ? '' : 's'} on this map comes from TEST ROWS (${resolved.status.table}), not yet reviewed${rows.some((f) => /PENDING/.test(f.status_row.source ?? '')) ? '; their sources are PENDING OWNER' : ''}`);
    if (resolved.status.without_a_row.length) warnings.push(`no status row for ${resolved.status.without_a_row.join(', ')} on ${longDate(date)}: drawn as paper`);
    if (!resolved.status.covered) warnings.push(`the status table is entered for ${resolved.status.coverage.join(' to ')} only: no state is given a status on ${longDate(date)}`);
  }
  // Where the sources disagree about who held the land: the page draws the Newberry's U.S. polygon and hides
  // OpenHistoricalMap's polygon of the same land; when OHM has another power holding it on the date, say so (Florida,
  // 1819–1821: the Newberry dates the territory from the treaty's signing, and Spain held it until 1821).
  if (frame && !diff && date >= US_FROM) {
    const FOREIGN = new Set(['spain', 'britain', 'france', 'mexico', 'russia']);
    // (only a territory or other non-state area, and only an OHM polygon that is not its copy of a Newberry one: the
    // holders OHM's hidden copies of the states carry are not reliable; the smallest such polygon speaks for the land)
    const nbShown = shown.filter((it) => it.src === 'newberry' && it.p.type !== 'State');
    const hits = new Map();
    for (const o of data.ohm) {
      const p = o.p;
      if (!p.us || p.lvl === 'x' || tags[p.rid]?.nb || !(p.s <= date && date < p.e)) continue;
      const pw = powerAt(p, date);
      if (!FOREIGN.has(pw)) continue;
      const c = geoCentroid(o.f);
      const nbIt = nbShown.find((it) => geoContains(it.f, c));
      if (!nbIt) continue;
      const km2 = geoArea(o.f);
      if (!hits.has(nbIt) || hits.get(nbIt).km2 > km2) hits.set(nbIt, { o, pw, km2 });
    }
    for (const [nbIt, { o, pw }] of hits) {
      const p = o.p;
      let until = null;
      for (const [from, x] of p.pw ?? []) if (from > date && x !== pw) { until = from; break; }
      warnings.push(`the sources disagree on ${nbName(nbIt.p)}: the Newberry dates it from ${longDate(nbIt.p.s)}${nbIt.p.change ? ` ("${nbIt.p.change}")` : ''}, and OpenHistoricalMap has ${cleanLabel(p.name) ?? p.name} (relation ${p.rid}) held by ${powers.categories[pw]?.label ?? pw} on this date${until ? `, until ${longDate(until)}` : ''}; the map draws the Newberry's polygon`);
    }
  }
  if (date > 20001231) warnings.push("Newberry's record ends on 31 December 2000; its polygons in force that day are held open to the present");

  // ---- places, routes, rivers
  const rec = cur.records;
  const placedById = new Map((rec?.placed ?? []).map((p) => [p.id, p]));
  const points = (rec?.marks ?? []).map((m) => {
    const r = m.r, pl = placedById.get(r.id);
    return { record: r.id, asked: r.asked ?? null, label: r.label, value: r.value, where: r.where, lon: r.lon, lat: r.lat, start: formatWhenIso(r.startWhen), end: formatWhenIso(r.endWhen), grade: r.grade, certainty: r.certainty, source: r.source, qc_status: r.qc_status || null, labeled: !!pl?.box, dropped: pl?.dropped ?? null,
      ...(r.tracker === 'military' ? { war: r.war, side: r.side || null, outcome: r.outcome || null, outcome_text: outcomeText(r, military?.war) || null, seq: r.seq ?? null, ...(r.battle ? { battle: r.battle, phase: r.phase || null } : {}) } : {}) };
  });
  // A place whose record ended before the map's date stands on the map of a later day: say so, and say what the land
  // under it was called on its own day when the Newberry drew it otherwise (Louisiana was the Territory of Orleans in 1811).
  for (const m of rec?.marks ?? []) {
    const r = m.r;
    if (r.tracker === 'military' || !r.last || r.last >= date || diff) continue;
    const under = (d) => aliveNB(data, d).find((it) => geoContains(it.f, [r.lon, r.lat]));
    const then = under(r.first), now = under(date);
    const differs = then && now && then.p.id !== now.p.id;
    warnings.push(`${r.label} (${formatWhenIso(r.startWhen)}) predates the map's date, ${longDate(date)}${differs ? `: the land it stands on was ${nbName(then.p)} on its own day and is drawn as ${nbName(now.p)}` : ''}`);
  }
  for (const p of points) if (p.dropped) warnings.push(`place ${p.label} (${p.record}): name dropped (${p.dropped === 'ceiling' ? 'the ten-name limit' : p.dropped === 'no-room' ? 'no room' : p.dropped})`);
  // (the Military layer: an event of the course beyond the frame is listed but not drawn)
  if (resolved.war) for (const c of resolved.war.course) c.off = !points.some((p) => p.record === c.record);
  const routesOut = [...new Map((rec?.routes ?? []).map((d) => [d.r.id, d])).values()].map((d) => {
    const r = d.r, pl = placedById.get(`route-label-${r.id}`);
    return { record: r.id, label: r.label, kind: r.kind, value: r.value, class: d.style.classLabel, dash: d.style.dash, heads: d.style.heads, waypoints: r.waypoints, start: r.startWhen && formatWhenIso(r.startWhen), end: r.endWhen && formatWhenIso(r.endWhen), certainty: r.certainty, source: r.source, qc_status: r.qc_status || null, labeled: !!pl?.box, dropped: pl?.dropped ?? null,
      ...(d.style.trunk ? { places: r.placeNames ?? null, grade: r.grade, note: r.qc_note || null, legs: d.legs } : {}),
      ...(r.tracker === 'military' ? { strength: r.strengthN ?? null, width_px: r.strengthN ? Number(d.style.width.toFixed(1)) : null, war: r.war, side: r.side || null, force: r.force || null, color: d.style.color, hollow: !!d.style.hollow, landing: !!d.style.landing, places: r.placeNames ?? null } : {}) };
  });
  for (const r of routesOut) if (r.dropped) warnings.push(`route ${r.label} (${r.record}): name dropped (${r.dropped})`);
  const fine = !!frame;
  const rivers = (rec?.rivers ?? []).map((r) => {
    const pl = placedById.get(`river-label-${r.id}`);
    return { asked: r.asked, name: r.name, found: r.found > 0, drawn_px: Math.round(r.samples.reduce((L, p, i) => (i ? L + Math.hypot(p[0] - r.samples[i - 1][0], p[1] - r.samples[i - 1][1]) : 0), 0)), labeled: !!pl?.box, dropped: r.found ? (pl?.dropped ?? (pl ? null : 'too short on this map for its name')) : 'not in the data',
      source: fine ? 'Natural Earth 1:10m rivers, North America (public domain)' : 'Natural Earth 1:50m rivers and lake centerlines (public domain)' };
  });
  for (const r of rivers) if (!r.found) warnings.push(`river "${r.asked}" is not in Natural Earth's ${fine ? '1:10m North American' : '1:50m'} rivers`);
  else if (r.dropped) warnings.push(`river ${r.name}: name dropped (${r.dropped === 'ceiling' ? 'the ten-name limit' : r.dropped})`);
  for (const p of [...(records?.points ?? []), ...(records?.routes ?? [])]) {
    if (p.first > date) warnings.push(`${p.label} (${p.id}) begins ${formatWhenIso(p.startWhen)}, after the map's date: it is drawn because the order names it`);
  }

  // ---- a Diff's change list
  let changes = null;
  if (diff && cur.diff) {
    const u = (x) => ({ name: x.label, key: x.key, power: x.power ?? null, km2: x.km2 ?? null, since: x.since ? isoDate(x.since) : null, until: x.until ? isoDate(x.until) : null, note: x.note ?? null, within: x.within ?? null });
    const usUnit = cur.diff.changed.find((x) => x.key === 'us');
    changes = {
      from: isoDate(cur.diff.a), to: isoDate(cur.diff.b), tracker: state.tracker, scope: frame ? `inside the ${frame.title ?? 'framed'} box only` : 'the whole sheet',
      // (nations: a whole unit under a new power; states: land that moved from one polygon to another, src/us/diff.js)
      appeared: cur.diff.appeared.map(u), vanished: cur.diff.vanished.map(u), changed_hands: [...cur.diff.changed.filter((x) => x.key !== 'us').map(u), ...(cur.diff.handoffs ?? []).map(handoffEntry)],
      united_states: usUnit ? { grew: !!usUnit.grew, shrank: !!usUnit.shrank } : null,
      persisted: cur.diff.persisted.length, smaller_not_listed: cur.diff.small,
      as_listed: (cur.sections ?? []).map((s) => ({ title: s.title, items: (s.items ?? []).map((i) => ({ text: Array.isArray(i.text) ? i.text[0] : i.text, year: i.year ?? null, note: i.note ?? null })), count: s.count ?? null })),
    };
  }

  const legend = legendAsDrawn(cur.legend);
  const layout = layoutCheck(atlas, info);
  for (const t of layout.clipped_text) warnings.push(`the name "${t.text}" runs past the edge of the map`);
  let credit = creditLine(features, points, routesOut, rivers, state.tracker);
  // the Military layer: icons and the symbol frames carry their own credits (brief §6)
  if (resolved.war?.icons_used?.length) credit += '; icons: game-icons.net contributors (CC BY 3.0)';
  if (resolved.war?.forces?.length) credit += '; force frames: milsymbol (MIT)';
  const alt = altText({ resolved, legend, features, points, routes: routesOut, rivers, changes, frame, titleShown });
  return { parchment: SLIP_VERSION, order, resolved, legend, features, points, routes: routesOut, rivers, changes, layout, warnings: [...new Set(warnings)], alt_text: alt, credit };
}

// The classification trackers (src/us/classify.js). paths and chapters: the table, and every state in force on the
// date by its class (on or off the sheet). pieces: the stretch of days the pieces belong to, each acquisition on the
// sheet, and today's states by piece when the map is of today's states (scripts/derive-pieces.mjs computed them).
function classificationOf({ state, data, trackers, cur, date, frame, atlas }) {
  const id = state.tracker;
  const states = aliveNB(data, date).filter((it) => it.p.type === 'State' || it.p.type === 'District of Columbia');
  if (id === 'paths' || id === 'chapters') {
    const table = data.classes?.[id];
    const by = {};
    const without = [];
    for (const it of states) {
      const r = (table?.byId.get(it.p.id) ?? []).find((x) => (x.s == null || x.s <= date) && (x.e == null || date <= x.e));
      if (!r) { if (it.p.type === 'State') without.push(nbName(it.p)); continue; }
      (by[r.value] ??= []).push(nbName(it.p));
    }
    for (const k of Object.keys(by)) by[k].sort();
    const lit = id === 'chapters' ? [...new Set((cur.items ?? []).filter((it) => it.lit && it.classRow).map((it) => Number(it.classRow.value)))].sort((a, b) => a - b) : null;
    return {
      tracker: id, table: table?.file ?? trackers[id].table, by_class: by, without_a_row: without.sort(), ...(lit ? { chapters_lit: lit } : {}),
      note: `the classes on this map come from the statehood deck's outline (${table?.file ?? trackers[id].table}), not yet reviewed by the owner`,
    };
  }
  // pieces
  const shown = (cur.items ?? []).filter((it) => it.src === 'piece' && (frame ? atlas.inFrame(it.f) || atlas.inInset(it.f) : atlas.shows(it.f)));
  const all = (data.pieces?.items ?? []).filter((it) => it.p.s <= date && date <= it.p.e);
  const stretch = all.length ? { from: isoDate(all[0].p.s), to: all[0].p.e >= OPEN ? 'present' : isoDate(all[0].p.e) } : null;
  const today = data.nb.filter((it) => it.p.e >= 99991231 && it.p.type === 'State');
  const todays = today.length && date >= Math.max(...today.map((it) => it.p.s));
  const onSheet = new Set(states.filter((it) => (frame ? atlas.inFrame(it.f) || atlas.inInset(it.f) : atlas.shows(it.f))).map((it) => it.p.id));
  return {
    tracker: id, file: trackers.pieces.file, computed_by: 'scripts/derive-pieces.mjs', stretch,
    acquisitions: [...new Map(shown.map((it) => [it.p.key, { key: it.p.key, name: it.p.name ?? null, date: it.p.date ?? null, label: it.p.label ?? null, km2: it.p.km2 }])).values()].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')),
    shares: todays ? (data.pieces?.shares?.states ?? []).filter((s) => !frame || onSheet.has(s.id)).map((s) => ({ ...s, sq_mi: Math.round(s.km2 / 2.589988) })) : null,
    shares_note: todays ? 'each state\'s land by piece, today\'s states (scripts/derive-pieces.mjs; areas on the sphere)' : 'shares are computed for today\'s states only',
    note: 'the pieces are computed from the Newberry\'s polygons; their labels (Won, Bought, Split, Joined, Claimed) come from the statehood deck\'s outline (data/us/acquisitions.csv), not yet reviewed by the owner',
  };
}

// Land that changed hands (src/us/diff.js handoffsUS): both polygons, their versions, the area and how it was found.
function handoffSource(h) {
  return {
    dataset: 'Computed by Parchment (src/us/diff.js): the land the first polygon held on the earlier date and no longer held on the later one, inside the second polygon on the later date and not held by it before; from the Newberry polygons, nothing drawn',
    from: [{ newberry: h.from.p.id, version: h.from.p.v, version_after: h.fromB.p.v, name: nbName(h.from.p) }, { newberry: h.to.p.id, version: h.to.p.v, name: nbName(h.to.p), new_on_this_date: h.appeared }],
    record: { id: h.fromB.p.id, version: h.fromB.p.v, change: h.fromB.p.change ?? null, authority: h.fromB.p.cite ?? null },
  };
}
function handoffEntry(h) {
  return {
    name: `${nbName(h.from.p)} → ${nbName(h.to.p)}`, kind: 'land', key: h.key,
    from: { newberry: h.from.p.id, version: h.from.p.v, version_after: h.fromB.p.v, name: nbName(h.from.p) },
    to: { newberry: h.to.p.id, version: h.to.p.v, name: nbName(h.to.p), new_on_this_date: h.appeared },
    km2: h.km2, sq_mi: h.sqmi, note: h.fromB.p.change ?? null,
  };
}

// The polygons an order lit by their own name or id (not by a power: "mexico" lights provinces far off any frame) that
// are alive on the map's date, or on either date of a Diff, and are not on the sheet. `inset`: the stage's inset that
// would hold it on the whole continent (Alaska, Hawaiian Islands), when it is one of those.
function offFrame({ atlas, data, state, cur, frame, lesson, powers, stage }) {
  const hl = lesson?.highlight;
  if (!hl || hl.none) return [];
  const on = (f) => (frame ? atlas.inFrame(f) || atlas.inInset(f) : atlas.shows(f));
  const found = [];
  if (state.mode === 'diff') {
    const want = new Map(hl.ids.map((id) => [slug(id), id]));
    for (const d of [state.from, state.date]) for (const it of aliveNB(data, d)) {
      const k = [...itemKeys(it, { powers, twins: lesson.twins })].find((x) => want.has(x));
      if (k && !atlas.isPowerKey(want.get(k), it.p.power)) found.push(it);
    }
  } else {
    // (an id the order itself named: a dispute lit only because one of its sides is, "(a side is lit)", does not count)
    for (const it of cur.items ?? []) if (it.lit && it.f && hl.ids.includes(it.litBy) && !atlas.isPowerKey(it.litBy, it.cat ?? it.p?.power)) found.push(it);
  }
  const out = new Map();
  for (const it of found) {
    if (on(it.f)) continue;
    const id = it.src === 'newberry' ? `nb:${it.p.id}` : it.src === 'ohm' ? `ohm:${it.p.rid}` : nameOf(it);
    if (out.has(id)) continue;
    const [x, y] = geoCentroid(it.f);
    const inset = (stage.insets ?? []).find(({ extent: e }) => x >= e.west && x <= e.east && y >= e.south && y <= e.north);
    out.set(id, { id, name: cleanLabel(nameOf(it)) ?? nameOf(it), inset: frame && inset ? inset.title : null });
  }
  return [...out.values()];
}

// Where the apparatus sits and whether any name on the map runs past the frame's edge, measured on the sheet as
// drawn (sheet units: pixels of a 1920×1080 sheet, or of the slide size an order asked for).
function layoutCheck(atlas, info) {
  const svg = document.querySelector('#map');
  const ctm = svg?.getScreenCTM?.()?.inverse?.();
  const { x0, y0, x1, y1 } = info.inner;
  const inside = (b) => b.x >= x0 - 0.5 && b.y >= y0 - 0.5 && b.x + b.w <= x1 + 0.5 && b.y + b.h <= y1 + 0.5;
  const toSheet = (r) => {
    if (!ctm) return { x: r.left, y: r.top, w: r.width, h: r.height };
    const a = new DOMPoint(r.left, r.top).matrixTransform(ctm), b = new DOMPoint(r.right, r.bottom).matrixTransform(ctm);
    return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
  };
  const clipped = [];
  for (const t of document.querySelectorAll('#map .view-main text')) {
    const text = t.textContent.trim();
    if (!text) continue;
    const layer = t.closest('g.snap-labels, g.snap');
    if (layer && Number(getComputedStyle(layer).opacity) === 0) continue;
    // (a water name whose guide lies wholly off the sheet, Hudson Bay on the continent, has an empty path and draws
    // nothing; the box the browser gives it sits at the sheet's corner and means nothing)
    const tp = t.querySelector('textPath');
    if (tp) {
      const ref = (tp.getAttribute('href') ?? tp.getAttribute('xlink:href') ?? '').replace(/^#/, '');
      let len = 0;
      try { len = ref ? document.getElementById(ref)?.getTotalLength?.() ?? 0 : 0; } catch { len = 0; }
      if (!(len > 0)) continue;
    }
    const r = t.getBoundingClientRect();
    if (!r.width) continue;
    const b = toSheet(r);
    if (!inside(b)) clipped.push({ text, box: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) } });
  }
  const round = (b) => ({ x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) });
  const lb = atlas.legend.box(), cb = atlas.cartouche.box();
  return { frame: { x0, y0, x1, y1 }, legend: { ...round(lb), inside: inside(lb), corner: info.legend?.anchor ?? null }, cartouche: { ...round(cb), inside: inside(cb) }, clipped_text: clipped };
}

function formatWhenIso(w) {
  if (!w) return null;
  return `${w.year}${w.month ? `-${String(w.month).padStart(2, '0')}` : ''}${w.day ? `-${String(w.day).padStart(2, '0')}` : ''}`;
}

// One line for the slide: Parchment, then each source the map actually drew from, in a fixed order.
function creditLine(features, points, routes, rivers, trackerId) {
  const has = (l) => features.some((f) => f.layer === l);
  const boundaries = [];
  if (has('newberry') || has('newberry-dispute') || has('us-mexico-dispute')) boundaries.push('Newberry Library');
  if (has('openhistoricalmap') || has('ohm-overlap') || has('us-mexico-dispute')) boundaries.push('OpenHistoricalMap');
  const parts = ['Parchment'];
  if (boundaries.length) parts.push(`boundaries: ${boundaries.join(', ')}`);
  if (has('native-homeland')) parts.push('Native homelands: historical-basemaps');
  if (has('land-cession') || has('treaty-land')) parts.push('land cessions: U.S. Forest Service (Royce 1899)');
  if (trackerId === 'electoral') parts.push('votes: National Archives');
  if (trackerId === 'population') parts.push('counts: U.S. Census Bureau');
  if (trackerId === 'freeblack') parts.push('counts: U.S. Census Bureau', 'status of states: the Parchment status table (test rows)');
  if (trackerId === 'slavery') parts.push('status of states: the Parchment status table (test rows)');
  if (trackerId === 'paths' || trackerId === 'chapters') parts.push('classes: the statehood deck outline');
  if (trackerId === 'pieces') parts.push('pieces: computed from the Newberry Library polygons, labeled from the statehood deck outline');
  // (a would-be state cut from the Newberry's counties, the Census Bureau's, or along a river: src/us/wouldbe.js)
  const wb = features.filter((f) => f.layer === 'would-be-state');
  if (wb.length) {
    const from = [...new Set(wb.flatMap((f) => [/^nb/.test(f.source?.base ?? '') ? 'Newberry Library' : null, /^census/.test(f.source?.base ?? '') ? 'U.S. Census Bureau' : null]).filter(Boolean))];
    parts.push(`would-be states: computed${from.length ? ` from the ${from.join(' and the ')}` : ''} along their documents' lines`);
  }
  if (rivers.some((r) => r.found) || features.some((f) => f.source?.cut_at) || wb.some((f) => /river:/.test(f.source?.cut ?? ''))) parts.push('rivers: Natural Earth');
  if (points.length || routes.length) parts.push('places: the Parchment record table, coordinates from Wikidata');
  return parts.join('; ');
}

// Draft alt text from a fixed template (the same order of sentences every time; nothing is written by a model).
function altText({ resolved, legend, features, points, routes, rivers, changes, frame, titleShown }) {
  const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
  const s = [];
  const where = frame ? `framed on ${frame.title ?? 'a box of the continent'}` : 'North America';
  // (the tracker's title in running text: its first word in lower case unless it names a people or a body, the rest
  // as written: "how the land became U.S. land", "free Black population", "Indian land cessions")
  const tt = resolved.tracker.title.replace(/^(\S+)/, (w) => (/^(Indian|Native|Electoral)$/.test(w) ? w : w.toLowerCase()));
  if (changes) s.push(`Parchment map of change, ${changes.from} to ${changes.to}, ${tt}, ${where}${titleShown ? `, titled "${titleShown}"` : ''}.`);
  else s.push(`Parchment map, ${resolved.date_text}, ${tt}, ${where}${titleShown ? `, titled "${titleShown}"` : ''}.`);
  const fillRows = legend.rows.filter((r) => (r.role === 'category' || r.role === 'side') && r.key && COLOR_NAMES[r.key]);
  if (fillRows.length) s.push(`Shaded: ${list(fillRows.map((r) => `${r.label} in ${COLOR_NAMES[r.key]}`))}.`);
  const hatch = legend.rows.filter((r) => r.role === 'dispute' || r.role === 'dispute or overlap' || r.role === 'area');
  if (hatch.length) s.push(`Hatched in rust: ${list(hatch.map((r) => r.label.charAt(0).toLowerCase() + r.label.slice(1)))}.`);
  const native = features.filter((f) => f.layer === 'native-homeland' || (f.look.kind === 'pattern' && /stipple/.test(f.look.pattern))).map((f) => f.name);
  if (native.length) s.push(`Stippled, with soft edges: ${list([...new Set(native)].slice(0, 6))} (Native homelands, approximate).`);
  const named = features.filter((f) => f.labeled && f.lit !== false).map((f) => f.label);
  if (named.length) s.push(`Named on the map: ${list([...new Set(named)].slice(0, 12))}.`);
  if (changes) {
    if (changes.appeared.length) s.push(`Appeared: ${list(changes.appeared.map((u) => u.name).slice(0, 8))}.`);
    if (changes.changed_hands.length) s.push(`Changed hands: ${list(changes.changed_hands.map((u) => u.name).slice(0, 8))}.`);
    if (changes.vanished.length) s.push(`Vanished: ${list(changes.vanished.map((u) => u.name).slice(0, 8))}.`);
    if (changes.united_states?.grew) s.push('The United States grew (gold).');
  }
  if (points.length) s.push(`Marked places: ${list(points.map((p) => `${p.label}${p.start ? ` (${p.start === p.end || !p.end ? p.start : `${p.start} to ${p.end}`})` : ''}`))}.`);
  // the Military layer: the sides and the forces shown (brief §6)
  if (resolved.war) {
    s.push(`The war shown: ${resolved.title ?? resolved.war.id}, sides ${list(resolved.war.sides.map((x) => x.label))}.`);
    if (resolved.war.occupied?.length) s.push(`Hatched over its owner's color, land occupied on this date: ${list(resolved.war.occupied.map((o) => o.label))}.`);
    if (resolved.war.forces?.length) s.push(`Forces on the map: ${list(resolved.war.forces.map((f) => `${f.label} (${f.side}${f.tech_drawn ? `, ${f.tech}` : ''})`))}.`);
    if (resolved.war.lines?.length) s.push(`Lines: ${list(resolved.war.lines.map((l) => l.label))}.`);
  }
  if (routes.length) s.push(`Routes: ${list(routes.map((r) => `${r.label}, ${r.class.toLowerCase()}${r.heads && r.heads !== 'none' ? ' with arrowheads' : ''}`))}.`);
  const rv = rivers.filter((r) => r.labeled).map((r) => r.name);
  if (rv.length) s.push(`Rivers named: ${list(rv)}.`);
  // (a sentence whose last name ends in a period, "Unorg. Fed. Terr.", takes no second one)
  return s.map((x) => x.replace(/\.\.$/, '.')).join(' ');
}

// Parchment — North America page: the packing slip.
// Every picture an order renders (scripts/map.mjs) comes with a JSON sidecar that says what is on it: the order and
// how the page resolved it; the legend as drawn; every polygon on the map with its names, ids, dates, certainty and
// source; the places and routes with their records' sources; a Diff's change list; warnings (names dropped for room,
// ids that found nothing on the date, gaps the sources admit); draft alt text built from all this by a fixed
// template, never written by a model; and a one-line credit for the slide. It lets whoever builds the slide check
// that the map says what the slide says, cite it, and describe it without guessing.

import { geoArea } from 'd3';
import { isoDate, longDate, yearOf, OPEN } from './dates.js';
import { US_FROM, nbName, cleanLabel, powerAt } from './model.js';
import { queryToOrder } from './frames.js';
import { courseList, outcomeText } from '../military/events.js';

export const SLIP_VERSION = 'parchment-packing-slip/1';
const KM2 = 6371 * 6371;
const COLOR_NAMES = { In: 'green', S: 'orange', P: 'blue', E: 'gold', C: 'purple', T: 'teal', focus: 'gold',
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
  return { dataset: it.src };
}

function layerOf(it) {
  if (it.src === 'ohm') return it.p.lvl === 'x' ? 'ohm-overlap' : 'openhistoricalmap';
  return { newberry: 'newberry', nbx: 'newberry-dispute', usmx: 'us-mexico-dispute', hb: 'native-homeland', royce: 'land-cession', treaty: 'treaty-land', treatyX: 'treaty-land-overlap', aiannh: 'native-land-today', icc: 'original-territory' }[it.src] ?? it.src;
}
function nameOf(it) {
  const p = it.p;
  if (it.src === 'newberry') return nbName(p);
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
  return { start: null, end: null };
}
function idsOf(it) {
  const p = it.p;
  if (it.src === 'newberry') return { newberry: p.id, newberry_version: p.v };
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

export async function buildSlip({ atlas, data, state, stage, powers, trackers, params, sheet, frame, projectionMode, lesson, records, problems, loadJSON, ec, military = null }) {
  const cur = atlas.current ?? {};
  const tags = (await loadJSON('data/us/ohm-sources.json').catch(() => null))?.relations ?? {};
  const root = getComputedStyle(document.documentElement);
  const fills = Object.fromEntries(['In', 'S', 'P', 'E', 'C', 'T'].map((k) => [k, root.getPropertyValue(`--fill-${k}`).trim()]));
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
    legend_corner: info.legend?.anchor ?? null,
    water_names: info.waterLabels,
    records_file: records?.file ?? null,
    // The Military layer (brief of 2026-11-09 §6): the war, its sides, and each member with its dates and role.
    war: military?.war ? {
      id: military.war.id, names: military.war.names, names_shown: military.names, start: military.war.start, end: military.war.end, source: military.war.source ?? null,
      sides: military.war.sides.map((s) => ({
        id: s.id, label: s.label, color: s.color, fill: root.getPropertyValue(`--side-${s.color}-fill`).trim() || null, line: root.getPropertyValue(`--side-${s.color}-line`).trim() || null, why: s.why ?? null,
        members: military.members.filter((m) => m.side === s.id).map((m) => ({ record: m.id, where: m.where, label: m.label, role: m.value, start: m.startWhen ? String(m.start_raw ?? '') || null : null, end: null, dates: `${m.startWhen?.year ?? ''}${m.startWhen?.month ? `-${String(m.startWhen.month).padStart(2, '0')}` : ''}${m.startWhen?.day ? `-${String(m.startWhen.day).padStart(2, '0')}` : ''} – ${m.endWhen?.year ?? ''}${m.endWhen?.month ? `-${String(m.endWhen.month).padStart(2, '0')}` : ''}${m.endWhen?.day ? `-${String(m.endWhen.day).padStart(2, '0')}` : ''}`, grade: m.grade, source: m.source, qc_status: m.qc_status || null })),
      })),
      members_file: records?.file ?? military.file ?? null,
      // milestone 2: the events on the sheet and the course of the war as the margin list prints it; the strip
      events_on_sheet: (military.shown ?? []).map((r) => r.id), events_in_war: (military.events ?? []).length,
      course: courseList(military.shown ?? [], military.war), strip: military.strip ?? 'war', show: military.show?.length ? military.show : 'everything built',
      // milestone 3: movements since `from` (else the war's start) begun by the date
      movements_since: military.since ? isoDate(military.since) : null, movements_on_sheet: (military.moves ?? []).map((r) => r.id), movements_in_war: (military.allMoves ?? []).length,
      forces_shown: military.forces?.length ? military.forces : 'all',
      // milestone 5: where each force stands, its equipment and the catalog's verdict on it, and the icons drawn
      forces: (military.positions ?? []).map((p) => { const c = military.checks?.[p.force.id] ?? {}; return { id: p.force.id, label: p.force.label, commander: p.force.commander ?? null, side: p.force.side, type: p.force.type, echelon: p.force.echelon ?? null, at: { lon: p.at[0], lat: p.at[1] }, since: isoDate(p.since), moving: p.moving, from_row: p.row?.id ?? null, earlier_stands: p.earlier.length, strength: p.force.strength ?? null, tech: c.key ?? null, tech_drawn: !!c.ok, tech_note: c.why ?? null, source: p.force.source ?? null }; }),
      battle: military.battle ? { id: military.battle.id, label: military.battle.label, dates: military.battle.dates, frame: military.battle.frame, phase: military.battle.phase, source: military.battle.source, note: 'a battle frame (milestone 9): positions are the sources\' narrative read onto gazetteer places, each approximate; no side fills at this scale' } : null,
      film: military.film ? { id: military.film.id, title: military.film.title, chapter: military.film.chapter, chapter_span: military.film.span.map((d) => isoDate(d)), film_seconds: Math.round(military.film.seconds), at_second: Math.round(military.film.at), note: 'the play run: the chapter says which war is shown and what span the strip covers; press play on the live address, or npm run film' } : null,
      icons_used: [...new Set([...(military.positions ?? []).map((p) => military.checks?.[p.force.id]).filter((c) => c?.ok).map((c) => c.key), ...(military.lines ?? []).filter((l) => l.tech && military.icons?.[l.tech]).map((l) => l.tech), ...((military.shown ?? []).some((r) => r.value === 'fort') && military.icons?.fort ? ['fort'] : [])])].map((k) => { const it = military.tech?.items?.[k]; return { key: k, depicts: it?.depicts ?? null, in_use: it?.in_use ?? null, file: it?.icon?.file ?? null, author: it?.icon?.author ?? null, license: it?.icon?.license ?? null, reference: it?.reference ?? null }; }),
      // milestone 4: the computed lines, each with how it was made (nothing drawn by hand)
      lines: (military.lines ?? []).map((l) => ({ id: l.id, kind: l.kind, label: l.label, side: l.side ?? null, computed_from: l.kind === 'blockade' ? `the coast of ${l.coast_of}'s polygons as drawn on ${isoDate(l.on_date)} (${l.polygons} polygon${l.polygons === 1 ? '' : 's'}), inside the window given, moved 14 px offshore` : `the edge of ${l.border_of}'s polygons as drawn on ${isoDate(l.on_date)} (${l.polygons} polygon${l.polygons === 1 ? '' : 's'}) where it meets ${l.against}'s land`, on: isoDate(l.on_date), window: l.window ?? null, runs: l.runs.length, length_px: l.length_px, source: l.source ?? null })),
    } : null,
  };
  for (const id of resolved.highlight?.unmatched ?? []) warnings.push(`highlight "${id}" lit nothing alive on ${longDate(date)}`);

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
  const shown = pool.filter((it) => it.f && (frame ? atlas.inFrame(it.f) : atlas.shows(it.f)));
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
      certainty: certaintyOf(it, date), power: pw, power_label: pl, look, diff_role: r,
      lit: diff ? null : it.lit ?? null, lit_by: diff ? null : it.litBy ?? null, lit_as_named: !diff && !!(it.lit && it.litBy && !atlas.isPowerKey(it.litBy, pw)), labeled: !!label, label, cut_by_frame: atlas.cutByFrame(it.f),
      km2: Math.round(geoArea(it.f) * KM2), source: sourceOf(it, tags),
    };
  }).sort((a, b) => (b.lit === true) - (a.lit === true) || b.labeled - a.labeled || b.km2 - a.km2);
  for (const f of features) {
    // (a polygon the order named by its own name; one lit only because its power was named need not carry a name)
    if (f.lit_as_named && !f.labeled && f.layer !== 'us-mexico-dispute' && f.layer !== 'newberry-dispute' && f.layer !== 'ohm-overlap') warnings.push(`${f.name} is lit but carries no name (no room for it)`);
    const n = f.source?.notes;
    if (n?.fixme && (f.lit || f.labeled)) warnings.push(`OpenHistoricalMap's own note on ${f.name}: ${n.fixme}`);
    if (n?.estimated === 'yes' && (f.lit || f.labeled)) warnings.push(`${f.name}: OpenHistoricalMap marks its dates as estimated${f.end ? ` (end ${f.end})` : ''}`);
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
  for (const p of points) if (p.dropped) warnings.push(`place ${p.label} (${p.record}): name dropped (${p.dropped === 'ceiling' ? 'the ten-name limit' : p.dropped === 'no-room' ? 'no room' : p.dropped})`);
  // (the Military layer: an event of the course beyond the frame is listed but not drawn)
  if (resolved.war) for (const c of resolved.war.course) c.off = !points.some((p) => p.record === c.record);
  const routesOut = [...new Map((rec?.routes ?? []).map((d) => [d.r.id, d])).values()].map((d) => {
    const r = d.r, pl = placedById.get(`route-label-${r.id}`);
    return { record: r.id, label: r.label, kind: r.kind, value: r.value, class: d.style.classLabel, dash: d.style.dash, heads: d.style.heads, waypoints: r.waypoints, start: r.startWhen && formatWhenIso(r.startWhen), end: r.endWhen && formatWhenIso(r.endWhen), certainty: r.certainty, source: r.source, qc_status: r.qc_status || null, labeled: !!pl?.box, dropped: pl?.dropped ?? null,
      ...(r.tracker === 'military' ? { war: r.war, side: r.side || null, force: r.force || null, color: d.style.color, hollow: !!d.style.hollow, landing: !!d.style.landing, places: r.placeNames ?? null } : {}) };
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
      appeared: cur.diff.appeared.map(u), vanished: cur.diff.vanished.map(u), changed_hands: cur.diff.changed.filter((x) => x.key !== 'us').map(u),
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
  if (rivers.some((r) => r.found) || features.some((f) => f.source?.cut_at)) parts.push('rivers: Natural Earth');
  if (points.length || routes.length) parts.push('places: the Parchment record table, coordinates from Wikidata');
  return parts.join('; ');
}

// Draft alt text from a fixed template (the same order of sentences every time; nothing is written by a model).
function altText({ resolved, legend, features, points, routes, rivers, changes, frame, titleShown }) {
  const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
  const s = [];
  const where = frame ? `framed on ${frame.title ?? 'a box of the continent'}` : 'North America';
  if (changes) s.push(`Parchment map of change, ${changes.from} to ${changes.to}, ${resolved.tracker.title.toLowerCase()}, ${where}${titleShown ? `, titled "${titleShown}"` : ''}.`);
  else s.push(`Parchment map, ${resolved.date_text}, ${resolved.tracker.title.toLowerCase()}, ${where}${titleShown ? `, titled "${titleShown}"` : ''}.`);
  const fillRows = legend.rows.filter((r) => (r.role === 'category' || r.role === 'side') && r.key && COLOR_NAMES[r.key]);
  if (fillRows.length) s.push(`Shaded: ${list(fillRows.map((r) => `${r.label} in ${COLOR_NAMES[r.key]}`))}.`);
  const hatch = legend.rows.filter((r) => r.role === 'dispute' || r.role === 'dispute or overlap');
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
    if (resolved.war.forces?.length) s.push(`Forces on the map: ${list(resolved.war.forces.map((f) => `${f.label} (${f.side}${f.tech_drawn ? `, ${f.tech}` : ''})`))}.`);
    if (resolved.war.lines?.length) s.push(`Lines: ${list(resolved.war.lines.map((l) => l.label))}.`);
  }
  if (routes.length) s.push(`Routes: ${list(routes.map((r) => `${r.label}, ${r.class.toLowerCase()}${r.heads && r.heads !== 'none' ? ' with arrowheads' : ''}`))}.`);
  const rv = rivers.filter((r) => r.labeled).map((r) => r.name);
  if (rv.length) s.push(`Rivers named: ${list(rv)}.`);
  return s.join(' ');
}

// Parchment — the world page's packing slip (statehood brief of 2026-11-18, item 6): the JSON beside every picture a
// world order renders, as the North America page's is (src/us/slip.js): the order as given and as resolved, the key
// as drawn, every island piece and state on the sheet with its dates and sources, warnings, draft alt text from a fixed
// template, and a credit line for the slide.

import { HOLDS, fuzzyOn } from './insular.js';

export const SLIP_VERSION = 'parchment-packing-slip/1';
const COLOR_NAMES = { In: 'green', T: 'teal', E: 'gold' };
const iso = (d) => (d == null || d >= 99991231 ? null : `${String(d).slice(0, 4)}-${String(d).slice(4, 6)}-${String(d).slice(6, 8)}`);
const GAP = /not drawn|no part of the|is left out/i;
// a note's sentences (not broken at "U.S.")
const sentences = (text) => String(text ?? '').split(/(?<!U\.S)(?<=\.)\s+(?=[A-Z])/);
// A box in words: "68.1°W–64.4°W, 17.6°N–18.6°N".
const lonText = (x) => { const v = Math.round((((x + 540) % 360) - 180) * 100) / 100; return `${Math.abs(v)}°${v < 0 ? 'W' : v > 0 && v < 180 ? 'E' : ''}`; };
const latText = (y) => `${Math.abs(y)}°${y < 0 ? 'S' : y > 0 ? 'N' : ''}`;
export const boxText = (b) => `${lonText(b.west)}–${lonText(b.east)}, ${latText(b.south)}–${latText(b.north)}`;
const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

function legendAsDrawn(spec) {
  const rows = typeof document !== 'undefined' ? [...document.querySelectorAll('#map .legend g.row')] : [];
  return {
    title: spec?.title ?? null,
    rows: rows.map((row, i) => {
      const r = spec?.legend?.[i] ?? {};
      return { label: row.querySelector('text:not(.swatch-text)')?.textContent ?? r.label ?? '', swatch: r.swatch ?? null, key: r.key ?? null, style: r.style ?? null, role: r.role ?? (r.swatch === 'line' ? 'border certainty' : r.key === 'hatch' ? 'dispute or claim' : 'category') };
    }),
  };
}

function layoutCheck(sheetApi) {
  const svg = document.querySelector('#map');
  const ctm = svg?.getScreenCTM?.()?.inverse?.();
  const { x0, y0, x1, y1 } = sheetApi.frame;
  const inside = (b) => b.x >= x0 - 0.5 && b.y >= y0 - 0.5 && b.x + b.w <= x1 + 0.5 && b.y + b.h <= y1 + 0.5;
  const toSheet = (r) => {
    if (!ctm) return { x: r.left, y: r.top, w: r.width, h: r.height };
    const a = new DOMPoint(r.left, r.top).matrixTransform(ctm), b = new DOMPoint(r.right, r.bottom).matrixTransform(ctm);
    return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
  };
  const clipped = [];
  for (const t of document.querySelectorAll('#map .polity-labels text')) {
    const r = t.getBoundingClientRect();
    if (!r.width) continue;
    const b = toSheet(r);
    if (!inside(b)) clipped.push({ text: t.textContent, box: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) } });
  }
  const round = (b) => ({ x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) });
  const lb = sheetApi.legend.box(), cb = sheetApi.cartouche.box();
  return { frame: sheetApi.frame, legend: { ...round(lb), inside: inside(lb) }, cartouche: { ...round(cb), inside: inside(cb) }, clipped_text: clipped };
}

export function buildWorldSlip({ order, address, state, frame, projection, sheet, sheetApi, hl, yearStates, lastYear, pieces, states, legendSpec, problems, insularSource }) {
  const date = state.date;
  const warnings = [...problems];
  const resolved = {
    page: 'world.html', address,
    date: iso(date), date_text: state.dateText,
    tracker: { id: state.tracker, title: legendSpec?.title ?? state.tracker },
    states_year: { asked: Math.trunc(date / 10000), drawn: yearStates, note: yearStates !== Math.trunc(date / 10000) ? `Cliopatria's states end in ${lastYear}: the ground is drawn as it stands in ${yearStates}` : null },
    frame: frame ? { id: frame.id, title: frame.title, box: frame.box, from: frame.raw ? 'the order (a raw box)' : 'src/focuses.json' } : { id: 'world', title: 'The World (the whole sphere)', box: null, from: 'src/stages/world.json' },
    projection,
    size: { width: sheet.px.width, height: sheet.px.height, sheet_units: [sheet.w, sheet.h], scale: sheet.scale },
    title: (() => { const t = document.querySelector('#map .cartouche .map-title'); return t ? t.getAttribute('data-title') ?? t.textContent : null; })(),
    highlight: hl ? { ids: hl.ids, unmatched: hl.unmatched(), off_frame: [] } : null,
    islands_file: 'data/world/insular.topojson (scripts/derive-insular.mjs, from data/world/insular-areas.csv)',
  };
  if (resolved.states_year.note) warnings.push(resolved.states_year.note);
  for (const id of resolved.highlight?.unmatched ?? []) warnings.push(`highlight "${id}" lit nothing held or alive on ${state.dateText}`);

  const onSheet = (f) => sheetApi.shows(f);
  const features = [];
  for (const it of pieces) {
    const shown = onSheet(it.f);
    if (!shown) { if (it.lit) { resolved.highlight?.off_frame.push({ id: it.p.id, name: it.p.name }); warnings.push(`${it.p.name} (${it.p.keys[0] ?? it.p.id}) is lit but lies outside this frame`); } continue; }
    const fuzzy = fuzzyOn(it, date);
    features.push({
      layer: 'island-territory', id: it.p.id, keys: it.p.keys, name: it.p.name, hold: it.p.hold, hold_label: HOLDS[it.p.hold]?.label ?? null,
      start: it.p.start, end: it.p.end, date_known_to_the_day_today: !fuzzy,
      look: it.look.fill ? { kind: 'fill', key: it.look.fill, name: COLOR_NAMES[it.look.fill] ?? it.look.fill, dashed: !!it.look.dashed } : it.look.pattern ? { kind: 'pattern', pattern: 'rust hatch (claimed, disputed)', dashed: !!it.look.dashed } : { kind: 'paper', note: 'outline only: not lit' },
      lit: it.lit ?? null, labeled: !!it.label, label: it.label ?? null, km2: it.p.km2,
      occupied: it.p.occupied ?? null,
      source: { shape: it.p.shape, islands: it.p.islands, dates: it.p.source, note: it.p.note, computed_by: 'scripts/derive-insular.mjs' },
    });
    // (the stretch this date falls in: a month's runs under 100 in YYYYMMDD, a year's over)
    const stretch = fuzzy ? it.p.fuzzy.find(([a, b]) => a <= date && date <= b) : null;
    if (stretch) warnings.push(`${it.p.name}: on this date its record is known only to the ${stretch[1] - stretch[0] > 100 ? 'year' : 'month'} (${it.p.start}–${it.p.end ?? 'present'}); drawn dashed`);
    if (it.lit && it.labelDropped) warnings.push(`${it.p.name} is lit but carries no name (${it.labelDropped === 'ceiling' ? 'the ten-name limit' : 'no room for it'})`);
    const occ = it.p.occupied;
    if (occ && occ.s <= date && date <= occ.e) warnings.push(`${it.p.name}: occupied by ${occ.by} on this date (${occ.text}); the map draws U.S. sovereignty, which stood`);
    // (the sentences of the row's note that say part of the piece is missing from the map)
    const gaps = sentences(it.p.note).filter((x) => GAP.test(x));
    if (it.lit !== false && gaps.length) warnings.push(`${it.p.name}: ${gaps.join(' ')}`);
  }
  for (const f of states) {
    if (!onSheet(f)) continue;
    features.push({ layer: 'cliopatria', name: f.properties.n, years: [f.properties.f, f.properties.t], lit: f.properties.look?.fill ? true : (hl ? false : null), labeled: !!f.properties.labeled, label: f.properties.labeled ?? null, source: { dataset: 'Cliopatria v0.2.1, Seshat Global History Databank (CC BY 4.0)', id: f.properties.id ?? null, wikidata: f.properties.wd ?? null } });
  }

  const legend = legendAsDrawn(legendSpec);
  const layout = layoutCheck(sheetApi);
  for (const t of layout.clipped_text) warnings.push(`the name "${t.text}" runs past the edge of the map`);
  const islandsShown = features.filter((f) => f.layer === 'island-territory');
  const credit = ['Parchment', ...(islandsShown.length ? [`islands: ${[...new Set(islandsShown.map((f) => (/Census/.test(f.source.shape) ? 'U.S. Census Bureau' : /Cliopatria/.test(f.source.shape) ? 'Cliopatria (Seshat)' : 'Natural Earth')))].join(', ')}`] : []), 'states: Cliopatria (Seshat)', 'coast and relief: Natural Earth'].join('; ');
  // draft alt text, by a fixed template
  const s = [];
  s.push(`Parchment map, ${state.dateText}, ${(legendSpec?.title ?? 'the world').replace(/^U\.S\./, 'U.S.')}, ${frame ? `framed on ${frame.title ?? boxText(frame.box)}` : 'the whole world'}${resolved.title ? `, titled "${resolved.title}"` : ''}.`);
  const fills = legend.rows.filter((r) => r.role === 'category' && COLOR_NAMES[r.key]);
  if (fills.length) s.push(`Shaded: ${list(fills.map((r) => `${r.label} in ${COLOR_NAMES[r.key]}`))}.`);
  const hatch = legend.rows.filter((r) => r.key === 'hatch');
  if (hatch.length) s.push(`Hatched in rust: ${list(hatch.map((r) => r.label.charAt(0).toLowerCase() + r.label.slice(1)))}.`);
  const named = [...new Set(features.filter((f) => f.labeled && f.lit !== false).map((f) => f.label))];
  if (named.length) s.push(`Named on the map: ${list(named.slice(0, 12))}.`);
  return { parchment: SLIP_VERSION, page: 'world', order, resolved, legend, features, layout, warnings: [...new Set(warnings)], alt_text: s.map((x) => x.replace(/\.\.$/, '.')).join(' '), credit, islands_source: insularSource };
}

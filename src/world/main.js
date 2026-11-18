// Parchment — world.html: the world page's lesson maps (statehood brief of 2026-11-18, item 6). One order, one picture:
//   world.html?date=2026-01-01&frame=caribbean&highlight=ia:pr,ia:vi&title=…&size=1920x1080
// the same fields as the North America page's orders (docs/LESSON-MAPS.md): date or year, tracker (insular, the
// default: the U.S. island territories held on the day over the states of the year; or states: the political map),
// frame (a focus of src/focuses.json or a box W,S,E,N), highlight, title, size, scale, strip. scripts/map.mjs renders
// an order with "page": "world" here and keeps the packing slip (window.parchment.packingSlip()).

import { select as d3select } from 'd3';
import { loadJSON } from '../data/loader.js';
import { renderPNG, renderSVG } from '../export/export.js';
import stage from '../stages/world.json';
import focusTable from '../focuses.json';
import { makeStatesSource } from '../render/states.js';
import { normBox } from '../render/focus.js';
import { parseSize, sheetFor, resolveFrame, frameProjection, makeHighlight, slug, queryToOrder } from '../us/frames.js';
import { parseDate, endOfYear, longDate } from '../us/dates.js';
import { prepareInsular, insularOn, insularKeys, HOLDS } from './insular.js';
import { createWorldLesson, pieceLook } from './stage.js';
import { buildWorldSlip } from './slip.js';

const params = new URLSearchParams(location.search);
const problems = [];
let resolveReady, rejectReady;
const ready = new Promise((res, rej) => { resolveReady = res; rejectReady = rej; });
ready.catch(() => {});
// (scripts/map.mjs waits on this promise; the slip and the exports join it once the picture is drawn)
window.parchment = { ready };

// Which water names a frame shows: those of src/focuses.json whose place is inside the box, at the frame's level
// (a focus's own; a box's by its width, as the focus levels run).
function waterFor(box, level) {
  const b = normBox(box);
  const inBox = (lon, lat) => { let x = lon; while (x < b.west) x += 360; return x <= b.east && lat >= b.south && lat <= b.north; };
  return (focusTable.water ?? []).filter((w) => level >= w.min && level <= w.max && inBox(w.lon, w.lat)).map((w) => ({ text: w.text, lon: w.lon, lat: w.lat, kind: 'water', span: Math.min(26, (b.east - b.west) * 0.6) }));
}
const levelOf = (box) => { const w = normBox(box).east - normBox(box).west; return w >= 150 ? 1 : w >= 60 ? 2 : w >= 25 ? 3 : w >= 10 ? 4 : 5; };

async function main() {
  // ---- the order
  const dateParam = params.get('date'), yearParam = params.get('year');
  const date = parseDate(dateParam) ?? (yearParam ? endOfYear(Number(yearParam)) : 20261231);
  const dateText = dateParam ? longDate(date) : `${Math.trunc(date / 10000)} (as of ${longDate(date)})`;
  const tracker = params.get('tracker') === 'states' ? 'states' : 'insular';
  if (params.get('tracker') && !['insular', 'states'].includes(params.get('tracker'))) problems.push(`tracker "${params.get('tracker')}" is not one the world page draws (insular, states); insular is used`);
  const sizeFound = params.get('size') ? parseSize(params.get('size')) : null;
  if (params.get('size') && !sizeFound) problems.push(`size "${params.get('size')}" is not WIDTHxHEIGHT between 800 and 3840 pixels wide; 1920x1080 is used`);
  const sheet = sheetFor(sizeFound, params.get('scale'));
  const frameFound = params.get('frame') ? resolveFrame(params.get('frame'), focusTable) : null;
  if (params.get('frame') && !frameFound) problems.push(`frame "${params.get('frame')}" is neither a focus in src/focuses.json nor a box W,S,E,N; the whole world is shown`);
  const frame = frameFound ? { ...frameFound, projection: frameProjection(frameFound, 'auto'), legend: frameFound.focus?.legend ?? null } : null;
  const hl = params.get('highlight') ? makeHighlight(params.get('highlight')) : null;
  const noStrip = params.get('strip') === 'off';

  // ---- the data
  const [ne, bathy, cliopatriaTopo, insularTopo] = await Promise.all([
    loadJSON('data/base/derived/ne.topojson'),
    loadJSON('data/base/derived/bathymetry.topojson').catch(() => null),
    loadJSON('data/base/derived/cliopatria.topojson'),
    loadJSON('data/world/insular.topojson').catch(() => null),
    document.fonts?.load ? Promise.all(['400', '700', 'italic 400', 'italic 700'].map((f) => document.fonts.load(`${f} 13px "Libre Baskerville"`).catch(() => null))) : null,
  ]);
  if (!insularTopo) problems.push('data/world/insular.topojson could not be read (node scripts/derive-insular.mjs writes it); no island territories are drawn');
  const insular = prepareInsular(insularTopo);
  const cliopatria = makeStatesSource(cliopatriaTopo);
  // Cliopatria's states end where its rows end; a later date draws the ground of its last year, and the slip says so.
  const lastYear = Math.max(...cliopatriaTopo.objects.states.geometries.map((g) => g.properties.t ?? 0).filter((t) => t < 3000));
  const year = Math.trunc(date / 10000);
  const yearStates = Math.min(year, lastYear);
  const view = cliopatria.at(yearStates);

  // ---- the sheet
  const box = frame?.box ?? null;
  const water = box ? waterFor(box, frame.focus?.level ?? levelOf(box)) : [];
  // The islands' own outlines (any date) stand for Natural Earth's coarser land where they are the land; the Canal
  // Zone, cut from Cliopatria's coarser shape, does not. One copy of each outline (the Marianas' rows share theirs).
  const seen = new Set();
  const fineLand = insular.items.filter((it) => !/^Cliopatria/.test(it.p.shape)).filter((it) => {
    const sig = `${it.p.shape}|${(it.p.islands ?? []).join(',')}|${(it.p.drop_islands ?? []).join(',')}`;
    return !seen.has(sig) && seen.add(sig);
  }).map((it) => it.f);
  const sheetApi = createWorldLesson(d3select('#map'), {
    sheet, frame, layers: { ne, bathy, relief: 'assets/relief/world-plate-carree.png' },
    // (a box of the order's own has no title: under the island layer it takes the layer's)
    stage: { ...stage, title: params.get('title') || frame?.title || (frame && tracker === 'insular' ? 'U.S. Island Territories' : stage.title), span: [stage.span[0], Math.max(stage.span[1], year)] },
    noStrip, reliefScale: params.has('shot') ? 1 : 0.5, water, fineLand,
  });

  // ---- what is lit, and how each thing looks
  const held = insularOn(insular, date);
  for (const it of held) {
    it.lit = hl && !hl.none ? !!hl.has(insularKeys(it, slug)) : (hl?.none ? false : null);
    it.label = null; it.labelDropped = null;
    it.look = tracker === 'insular' || it.lit === true ? pieceLook(it, date, it.lit) : null;
  }
  // (on the political map an island piece is drawn only when the order lights it)
  const pieces = held.filter((it) => it.look);
  for (const f of view.states) {
    const keys = new Set([f.properties.n, f.properties.n.replace(/^\(|\)$/g, ''), f.properties.id, f.properties.wd, f.properties.id ? `cliopatria:${f.properties.id}` : null].filter(Boolean).map(slug));
    const lit = hl && !hl.none ? !!hl.has(keys) : null;
    f.properties.labeled = null;
    f.properties.look = (tracker === 'states' && lit !== false) || lit ? { fill: true } : null;
  }

  // ---- the key: the holds drawn, the states lit, the border's certainty, dashed dates
  const drawnLit = pieces.filter((it) => it.lit !== false && sheetApi.shows(it.f));
  const rows = [];
  for (const [k, h] of Object.entries(HOLDS)) {
    if (!drawnLit.some((it) => it.p.hold === k)) continue;
    rows.push(h.pattern ? { swatch: 'fill', key: 'hatch', label: h.label, role: 'dispute or claim' } : { swatch: 'fill', key: h.fill, label: h.label, role: 'category' });
  }
  const litStates = view.states.filter((f) => f.properties.look?.fill && sheetApi.shows(f));
  if (tracker === 'states') rows.push({ swatch: 'states', label: 'Each state in its own color' });
  else if (litStates.length) rows.push({ swatch: 'states', label: litStates.length > 3 ? `${litStates.slice(0, 2).map((f) => f.properties.n).join(', ')} and ${litStates.length - 2} more` : litStates.map((f) => f.properties.n).join(' and ') });
  // (the border's row only where a border between two states is drawn on the sheet)
  if (sheetApi.shows(view.border())) rows.push(yearStates >= 1648 ? { swatch: 'line', style: 'solid', label: 'Documented border' } : { swatch: 'line', style: 'dashed', label: 'Approximate border' });
  if (drawnLit.some((it) => it.look.dashed)) rows.push({ swatch: 'line', style: 'dashed', label: 'Held: the date known only to the month or year' });
  const legendSpec = { title: tracker === 'insular' ? 'U.S. island territories' : 'States', legend: rows };

  sheetApi.show({ states: view, pieces, date, legendSpec, certainty: yearStates >= 1648 ? 'legal' : 'approximate' });
  document.querySelector('#map .cartouche .base-note').textContent = dateParam ? longDate(date) : `as of ${longDate(date).replace(/ -?\d+$/, '')}`;
  await sheetApi.reliefReady;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const address = `world.html?${new URLSearchParams([...params].filter(([k]) => k !== 'shot'))}`;
  window.parchment = {
    ready,
    renderPNG: (opts) => renderPNG(document.querySelector('#map'), opts),
    renderSVG: (opts) => renderSVG(document.querySelector('#map'), opts),
    packingSlip: () => buildWorldSlip({
      order: { ...queryToOrder(params), page: 'world' }, address, state: { date, dateText, tracker }, frame,
      projection: frame ? { name: frame.projection.projection, rotate: frame.projection.rotate ?? null, parallels: frame.projection.parallels ?? null, chosen_by: frame.projection.chosenBy === 'auto' ? 'chooseProjection (src/render/focus.js): projection follows the frame' : 'the focus names it' } : { name: stage.projection, rotate: stage.rotate, chosen_by: 'the world stage (src/stages/world.json)' },
      sheet, sheetApi, hl, yearStates, lastYear, pieces, states: view.states, legendSpec, problems, insularSource: insular.source,
    }),
  };
  document.body.classList.add('ready');
  resolveReady(true);
}


main().catch((err) => {
  console.error(err);
  const p = document.querySelector('#problems');
  if (p) { p.classList.remove('hidden'); p.textContent = `Parchment could not start: ${err.message}`; }
  window.parchment = { ready };
  rejectReady(err);
});

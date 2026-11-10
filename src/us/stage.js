// Parchment — North America stage renderer
// One sheet (Albers equal-area, USGS parallels) with Alaska and Hawaii insets. For any date it draws the
// polygons alive on that day from three downloaded sources, each with its own certainty:
//   OpenHistoricalMap colonies, provinces, countries and Native nations (approximate before 1783, documented after);
//   Newberry U.S. states and territories (documented, dated to the day, statute cited), on top from 1783-09-03;
//   Royce land cessions (documented treaty areas) under the cessions tracker.
// Fills are opaque inside one translucent group, so overlapping polygons never darken or mix (overlapping claims
// of two powers carry a hatch instead). Nothing here moves a vertex; it only chooses, styles and projects.

import * as d3 from 'd3';
import { feature, mesh, meshArcs } from 'topojson-client';
import { assetURL } from '../data/loader.js';
import { paperDefs, drawPaper, drawPaperOverlay } from '../render/paper.js';
import { drawStageLabels, makeMeasure, layoutLabels } from '../render/labels.js';
import { createLegend } from '../render/legend.js';
import { createCartouche } from '../render/cartouche.js';
import { createDiffList } from '../render/difflist.js';
import { makeProjection, W as BASE_W, H as BASE_H, FRAME } from '../render/base.js';
import { buildProjection } from '../render/focus.js';
import { reliefFor } from '../render/relief-reproject.js';
import { routeDefs, drawRoutes } from '../render/routes.js';
import { drawMarks, MARK_RADIUS } from '../render/marks.js';
import { polylineHitsRect, APART } from '../render/placement.js';
import { claimLabel, slug, itemKeys } from './frames.js';
import { sideOf, lookFor as sideLook, militaryLegend, aliveOn as memberAlive } from '../military/wars.js';
import { eventLegend } from '../military/events.js';
import { decorateMarks, drawCourseList, drawWarStrip, drawEdgeTabs, drawLines, drawForceMarks, lineColorOf, drawPhaseList, drawPhaseStrip, drawGround } from '../military/draw.js';
import { forceLegend } from '../military/events.js';
import { linesOn, blockadeRuns, borderRuns, dedupeRuns, runsLength } from '../military/lines.js';
import { toInt as warInt } from '../military/wars.js';
import { longDate, yearOf, isEndOfYear } from './dates.js';
import { US_FROM, powerAt, aliveNB, aliveOHM, aliveNative, aliveTreaty, aliveTreatyX, aliveLands, aliveICC, nbName, cleanLabel } from './model.js';
import { diffUS, byKind } from './diff.js';
import { electoralLook, electoralLegend, someAbstained, resultFor } from './electoral.js';
import { aliveDisputes, aliveUSMX } from './disputes.js';
import { fitElectoralBadges, drawElectoralBadges } from './electoral-draw.js';
import { censusOn, unitsFor, estimatesOn, densityLabels, areaKm2, fmt, pct } from './native.js';

export { US_FROM, prepareData, powerAt, aliveNB, aliveOHM, nbName } from './model.js';
const FILL_OPACITY = 0.62;
let uid = 0;

// ---------------------------------------------------------------- the sheet
// `lesson` (src/us/frames.js, built by main.js from the address): a sheet sized for a slide ({ w, h } in sheet units),
// a frame ({ box, ... } with its projection), a title, a highlight, named rivers and the records to point at.
// Without it the page is exactly the 1920×1080 continent it has always been.
// The sheet and the projection a stage is built on: the 1920×1080 continent, the continent on a sheet of another
// shape, a frame fitted to its box, or a free view (pan and zoom: a center and a scale, src/us/main.js).
function stageGeometry(stage, lesson) {
  const W = lesson?.sheet?.w ?? BASE_W, H = lesson?.sheet?.h ?? BASE_H;
  const framed = !!lesson?.frame;
  const resized = W !== BASE_W || H !== BASE_H;
  const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
  // A frame re-fits the projection to its box (the projection the frame names, src/us/frames.js); a bare change of
  // size fits the continent to the new shape. Neither touches the 1920×1080 continent.
  const projection = framed ? fitFrame(lesson.frame.projection, lesson.frame.box, inner, lesson.frame.view ?? null)
    : resized ? fitContinent(stage, inner) : makeProjection(stage, inner);
  return { W, H, framed, resized, inner, projection };
}
const reliefJob = (lesson, projection, [[x0, y0], [x1, y1]]) => reliefFor(`na-${lesson.key}`, assetURL(lesson.reliefWorld ?? 'assets/relief/world-plate-carree.png'), projection, [x0, y0, x1, y1],
  { scale: lesson.reliefScale ?? 0.5, bounds: lesson.reliefBounds ?? null, trust: !!lesson.frame?.view, over: (lesson.reliefOver ?? []).map((o) => ({ url: assetURL(o.url), bounds: o.bounds })) });
// The relief of a view about to be shown, made before the stage is rebuilt on it (so the swap shows no bare land).
export function prepareRelief(stage, lesson) {
  if (!lesson || !(lesson.frame || lesson.sheet)) return Promise.resolve();
  const g = stageGeometry(stage, lesson);
  if (!(g.framed || g.resized)) return Promise.resolve();
  return reliefJob(lesson, g.projection, g.inner).catch(() => null);
}
// Sheet pixels per kilometer at a place (measured along its meridian).
export function pxPerKmAt(p, [lon, lat]) {
  const a = p([lon, lat - 0.005]), b = p([lon, lat + 0.005]);
  return a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) / (0.01 * 111.195) : NaN;
}
// A free view: where the sheet's middle looks and how close (pixels per kilometer). Lambert azimuthal equal-area
// centered on that point (north is up at the middle of the sheet at every zoom, and a zoom about the middle changes
// nothing but the scale). → a frame like resolveFrame's, with the box of longitude and latitude the sheet covers.
export function freeFrame(center, pxPerKm, sheet = null) {
  const W = sheet?.w ?? BASE_W, H = sheet?.h ?? BASE_H;
  const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
  const spec = { projection: 'lambertAzimuthalEqualArea', rotate: [-center[0], -center[1]], chosenBy: 'view' };
  const view = { center: [center[0], center[1]], pxPerKm };
  const p = fitFrame(spec, null, inner, view);
  const [[ax, ay], [bx, by]] = inner;
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    for (const pt of [[ax + (bx - ax) * t, ay], [ax + (bx - ax) * t, by], [ax, ay + (by - ay) * t], [bx, ay + (by - ay) * t]]) {
      const ll = p.invert(pt);
      if (!ll || !Number.isFinite(ll[0]) || !Number.isFinite(ll[1])) continue;
      // (longitudes are read on the center's side of the antimeridian)
      let lon = ll[0]; while (lon - center[0] > 180) lon -= 360; while (lon - center[0] < -180) lon += 360;
      west = Math.min(west, lon); east = Math.max(east, lon); south = Math.min(south, ll[1]); north = Math.max(north, ll[1]);
    }
  }
  const r = (x) => Math.round(x * 10000) / 10000;
  return { id: null, title: null, box: { west: r(west), south: r(Math.max(-85, south)), east: r(east), north: r(Math.min(85, north)) }, focus: null, raw: true, view, spec };
}

export function createUSStage(svg, stage, layers, { powers, trackers, onPick, onYear, onPhase = null, lesson = null }) {
  const { W, H, framed, resized, inner, projection } = stageGeometry(stage, lesson);
  const [[x0, y0], [x1, y1]] = inner;
  const frame = { x0, y0, x1, y1 };

  svg.attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet');
  svg.selectAll('*').remove();
  const defs = svg.append('defs');
  paperDefs(defs);
  patternDefs(defs);
  if (lesson) routeDefs(defs);

  const root = svg.append('g').attr('class', 'stage na');
  drawPaper(root, W, H);

  const ne = layers.ne;
  const land = feature(ne, ne.objects.land);
  const lakes = feature(ne, ne.objects.lakes);
  const rivers = feature(ne, ne.objects.rivers).features.filter((f) => (f.properties.scalerank ?? 0) <= 8);
  const coast = feature(ne, ne.objects.coastline);
  const bathy = feature(layers.bathy, layers.bathy.objects.bathymetry);
  // A frame draws Natural Earth's 1:10m North American rivers (the Nueces and the Sabine are not in the 1:50m set);
  // which of them depends on the frame's scale (scripts/derive-rivers.mjs). Rivers an order names are drawn a little
  // stronger and labelled.
  const fine = framed && layers.riversNA ? feature(layers.riversNA, layers.riversNA.objects.rivers).features : null;
  const named = new Set((lesson?.rivers ?? []).map(slug));
  const riverNames = (f) => [f.properties.name, f.properties.name_en, f.properties.name_alt].filter(Boolean).map(slug);
  const isNamed = (f) => named.size > 0 && riverNames(f).some((n) => named.has(n));

  // A view is one projection on the sheet: the main map, or an inset.
  function makeView(id, proj, box, { relief = null, reliefSlot = false, graticule = true, bathymetry = true } = {}) {
    // Cut every path to the view's own frame (plus a margin for strokes): the world's land outline and Russia's
    // Siberia never reach the paint step, and labels measure only the part that shows.
    const [cx0, cy0, cw, ch] = box;
    proj.clipExtent([[cx0 - 6, cy0 - 6], [cx0 + cw + 6, cy0 + ch + 6]]);
    const path = d3.geoPath(proj);
    const cache = new WeakMap();
    const d = (f) => { let s = cache.get(f); if (s === undefined) { s = path(f) || ''; cache.set(f, s); } return s; };
    const bcache = new WeakMap();
    const bounds = (f) => { let b = bcache.get(f); if (b === undefined) { b = path.bounds(f); bcache.set(f, b); } return b; };
    const [bx, by, bw, bh] = box;
    defs.append('clipPath').attr('id', `clip-${id}`).append('rect').attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh);
    defs.append('clipPath').attr('id', `land-${id}`).append('path').attr('d', d(land));
    // (the clip sits on an outer group, so a pan or a zoom can slide the map under it: src/us/main.js)
    const clipG = root.append('g').attr('class', `view-clip view-clip-${id}`).attr('clip-path', `url(#clip-${id})`);
    clipG.append('rect').attr('class', 'view-bg').attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh);
    const g = clipG.append('g').attr('class', `view view-${id}`);
    g.append('path').attr('class', 'ocean').attr('d', d({ type: 'Sphere' }));
    if (bathymetry) g.append('g').attr('class', 'bathymetry').selectAll('path').data(bathy.features).join('path').attr('d', d);
    g.append('path').attr('class', 'land').attr('d', d(land));
    let reliefImg = null;
    if (relief) {
      g.append('image').attr('class', 'relief').attr('clip-path', `url(#land-${id})`)
        .attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh).attr('preserveAspectRatio', 'none')
        .attr('href', assetURL(`assets/${relief}`));
    } else if (reliefSlot) {
      // (reshaded for this projection once the world relief has loaded: see reliefReady below)
      reliefImg = g.append('image').attr('class', 'relief').attr('clip-path', `url(#land-${id})`)
        .attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh).attr('preserveAspectRatio', 'none');
    }
    const snapshots = g.append('g').attr('class', id === 'main' ? 'snapshots' : 'inset-snapshots');
    const waterLines = id === 'main' && fine ? fine.filter((f) => isNamed(f) || f.properties.scalerank <= lesson.riverRank) : rivers;
    g.append('g').attr('class', 'rivers').selectAll('path').data(waterLines).join('path').attr('d', d)
      .classed('named', named.size ? isNamed : false);
    g.append('path').attr('class', 'lakes').attr('d', d(lakes));
    g.append('path').attr('class', 'coastline').attr('d', d(coast));
    if (graticule) g.append('path').attr('class', 'graticule').attr('d', d(d3.geoGraticule10()));
    const stageLabels = g.append('g').attr('class', 'stage-labels');
    const labels = g.append('g').attr('class', id === 'main' ? 'polity-labels' : 'inset-labels');
    // Does a feature reach into this view's box?
    const [vx, vy, vw, vh] = box;
    // (and is big enough to see: a speck of a far-off island does not put a power in the legend)
    const acache = new WeakMap();
    const area = (f) => { let a = acache.get(f); if (a === undefined) { a = path.area(f); acache.set(f, a); } return a; };
    const reaches = (f) => { const [[a, b], [c, e]] = bounds(f); return Number.isFinite(a) && c > vx && a < vx + vw && e > vy && b < vy + vh; };
    const shows = (f) => reaches(f) && area(f) >= 40;
    return { id, proj, path, d, box, g, snapshots, labels, stageLabels, shows, reaches, area, reliefImg };
  }

  // The stage's pre-rendered relief fits only the 1920×1080 continent; any other framing is reshaded in the browser
  // from the world relief (src/render/relief-reproject.js).
  const reshade = !!lesson && (framed || resized);
  const main = makeView('main', projection, [x0, y0, x1 - x0, y1 - y0], { relief: reshade ? null : stage.relief, reliefSlot: reshade });
  const reliefReady = main.reliefImg
    ? reliefJob(lesson, projection, inner).then((url) => { main.reliefImg.attr('href', url); }).catch((err) => console.warn(err.message))
    : Promise.resolve();
  // In a frame the water names are placed where their water shows: along their parallel, on the longest open stretch
  // inside the frame clear of the cartouche and legend, or left off (src/us/stage.js, frameWaterLabels).
  const land1 = framed ? rasterLand(projection, land, W, H) : null;
  const legendSpec = framed ? { anchor: lesson.frame.legend ?? quieterCorner(land1, frame), lift: 22 } : stage.legend;
  const stageLabelList = framed ? frameWaterLabels([...stage.labels, ...(lesson.frame.water ?? [])], projection, frame, land1, legendSpec, makeMeasure(), { near: lesson.frame.view ? 3 : null }) : stage.labels;
  drawStageLabels(main.stageLabels, defs, { ...stage, labels: stageLabelList }, main.path);
  // Water names change too: a stage label may list later names with the day each took effect (the Gulf of Mexico
  // is the Gulf of America in U.S. federal use from 7 February 2025). The sheet shows the name in force on its date.
  const waterNames = main.stageLabels.selectAll('text').nodes().map((node, i) => ({ node, l: stageLabelList[i] }));
  function setWaterNames(date) {
    let changed = false;
    for (const { node, l } of waterNames) {
      if (!l?.names) continue;
      let text = l.text;
      for (const n of l.names) if (date >= n.from) text = n.text;
      const tp = node.querySelector('textPath');
      if (tp && tp.textContent !== text) { tp.textContent = text; changed = true; }
    }
    if (changed) stageBoxes = null; // their reserved boxes are measured again
  }

  // Alaska and Hawaii belong to the continent: a frame has none. On a sheet of another size they keep their place
  // relative to the cartouche below them.
  const insets = (framed ? [] : stage.insets ?? []).map((s0) => {
    const s = resized ? { ...s0, box: [s0.box[0], s0.box[1] + (H - BASE_H), s0.box[2], s0.box[3]] } : s0;
    const [bx, by, bw, bh] = s.box;
    const proj = d3.geoConicEqualArea().parallels(s.parallels).rotate(s.rotate);
    proj.fitExtent([[bx + 8, by + 8], [bx + bw - 8, by + bh - 8]], extentPolygon(s.extent));
    const v = makeView(s.id, proj, s.box, { graticule: true, bathymetry: false });
    root.append('rect').attr('class', 'inset-frame').attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh);
    root.append('text').attr('class', 'inset-title').attr('x', bx + 8).attr('y', by + bh - 8).text(s.title);
    return { ...v, inset: s };
  });
  // A lesson map's own inset (the Military layer's test 1: Scott's campaign in the Valley of Mexico): a focus from
  // src/focuses.json fitted into a box on the sheet, drawn with the same fills, events and movements as the main map.
  if (lesson?.inset) {
    const f = lesson.inset;
    const [bx, by, bw, bh] = f.at;
    const proj = buildProjection(f.projection);
    proj.fitExtent([[bx + 8, by + 8], [bx + bw - 8, by + bh - 8]], extentPolygon(f.box, 0.1));
    const v = makeView(f.id, proj, f.at, { graticule: false, bathymetry: false });
    root.append('rect').attr('class', 'inset-frame').attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh);
    root.append('text').attr('class', 'inset-title').attr('x', bx + 8).attr('y', by + bh - 8).text(f.title);
    v.rec = { lines: v.g.append('g').attr('class', 'mil-lines'), routes: v.g.append('g').attr('class', 'routes'), marks: v.g.append('g').attr('class', 'marks'), forces: v.g.append('g').attr('class', 'mil-forces') };
    insets.push({ ...v, inset: f, lessonInset: true });
  }
  const views = [main, ...insets];

  drawPaperOverlay(root, W, H);
  root.append('path').attr('class', 'frame').attr('d', `M${x0},${y1}L${x0},${y0}L${x1},${y0}L${x1},${y1}`);
  // The legend sits where the stage says (bottom right, above the Caribbean): the top right stays clear for New
  // England and, in the Diff view, for the change list.
  // (a frame puts it in whichever right-hand corner holds less land: the Gulf of Mexico on the Texas map)
  const legend = createLegend(root, frame, lesson ? { ...legendSpec, fit: true } : legendSpec);
  // The cartouche's scale bar is measured at the middle of the frame, and an order may give the map its own title.
  const cartouche = createCartouche(root, frame, { ...stage, title: lesson?.title ?? stage.title, extent: framed ? lesson.frame.box : stage.extent }, projection);
  const titleOn = (date) => lesson?.title ?? (date >= 17760704 ? stage.title_us : stage.title);
  const strip = createTimeline(root, frame, stage, onYear);
  const diffList = createDiffList(root, frame);

  // Records an order points at (places, routes) and the rivers it names, in layers above the polity names; laid
  // out before the names on every redraw, so a polity's name moves out of their way, never the other way round.
  // (always made, since 2026-11-09: the Military layer draws its events through them on the live page too; empty
  // groups otherwise, so every other map is what it was)
  const recordLayers = {
    ground: main.g.append('g').attr('class', 'mil-ground'), // a battle frame's downloaded roads and streams, under everything
    lines: main.g.append('g').attr('class', 'mil-lines'), // the Military layer's computed lines, under the routes
    routes: main.g.append('g').attr('class', 'routes'),
    marks: main.g.append('g').attr('class', 'marks'),
    forces: main.g.append('g').attr('class', 'mil-forces'), // the Military layer's force marks, above the events
    labels: main.g.append('g').attr('class', 'record-labels'),
  };
  let records = { points: [], routes: [] };
  let recordLayout = null;
  let milNow = null, milListBox = null; // the Military layer as shown: its war and events, and the course list's box

  const measure = makeMeasure();
  let current = null;
  let currentKey = null;
  const cache = new Map(); // fingerprint → built layers, oldest first
  const CACHE_MAX = 24;

  // ------------------------------------------------------------ one date
  // `electoral`: under the Electoral College tracker, the looks of the election shown (src/us/electoral.js).
  // `military` (the Military layer, src/military/wars.js): { war, members, names, title }; a polygon takes its
  // side's fill while its state is a member on the date, and paper otherwise.
  function show(data, date, trackerId, { fade = 300, changes = [], electoral = null, military = null } = {}) {
    const tracker = trackerId === 'military' ? { ...trackers.military, mil: military } : trackers[trackerId];
    const nbAlive = aliveNB(data, date);
    const ohmAlive = aliveOHM(data, date);
    const cesAlive = trackerId === 'cessions' ? data.ces.filter((c) => c.p.d <= date) : [];
    const present = new Set();
    const items = [];
    const militaryLook = (it, pw) => {
      if (!military?.war) return { fill: null, label: null };
      if (military.show?.length && !military.show.includes('territory')) return { fill: null, label: null }; // a battle frame: no side fills
      const hit = sideOf(military.war, military.members, itemKeys(it, { power: pw, powers, twins: lesson?.twins }), date);
      return hit ? sideLook(hit) : { fill: null, label: null };
    };

    // Category of every alive polygon under this tracker: a fill key, a pattern, or muted.
    for (const it of ohmAlive) {
      const pw = powerAt(it.p, date);
      it.cat = pw;
      let look = categoryLook(powers, pw);
      if (trackerId !== 'nations' && look.fill) look = { fill: null, label: null };
      if (trackerId === 'cessions' && look.pattern) look = { fill: null, label: null };
      // (an election map keeps only the Confederacy's cross-hatch, which says why eleven states cast no vote in 1864)
      if (trackerId === 'electoral' && look.pattern && pw !== 'rebellion') look = { fill: null, label: null };
      if (trackerId === 'military' && !look.pattern) look = militaryLook(it, pw);
      it.look = look;
      items.push(it);
    }
    // Native population: the census on or before the date shades, from the first full count (1890), the states and
    // territories alive on the date by Native people per 1,000 km²; before that the scholarly estimates speak.
    const pop = trackerId === 'population' ? populationOn(data, date, nbAlive) : null;
    if (pop) for (const it of ohmAlive) it.look = { fill: null, label: null };
    for (const it of nbAlive) {
      it.cat = it.p.power;
      it.popUnit = pop?.units.get(it) ?? null;
      if (trackerId === 'states') {
        const t = tracker.types[it.p.type] ?? {};
        it.look = t.pattern ? { pattern: t.pattern, label: tracker.types.Other.label } : { fill: t.fill, label: t.label };
      } else if (trackerId === 'cessions') {
        it.look = { fill: null, label: null };
      } else if (trackerId === 'electoral') {
        it.look = electoralLook(electoral, it);
      } else if (pop) {
        it.look = pop.census?.full && it.popUnit ? { pop: it.popUnit.step, label: densityLabels()[it.popUnit.step - 1] } : { fill: null, label: null };
      } else if (trackerId === 'military') {
        it.look = militaryLook(it, it.p.power);
      } else it.look = categoryLook(powers, it.p.power);
      items.push(it);
    }
    // Land two U.S. polygons claimed at once (the Toledo Strip, Greer County...): hatched as a dispute under every
    // tracker but the Electoral College, where a hatch is a fifth candidate (src/us/disputes.js). Which pieces are
    // alive follows from nbAlive, so the cache key already covers them.
    if (trackerId !== 'electoral') {
      for (const it of aliveDisputes(data, date)) { it.look = { pattern: 'hatch', label: 'Disputed or overlapping claims' }; items.push(it); }
      // ...and land a U.S. state and a Mexican state claimed at once (the Nueces Strip and the upper Rio Grande,
      // 1845–1848; scripts/derive-us-disputes.mjs), the same way.
      for (const it of aliveUSMX(data, date)) {
        it.look = { pattern: 'hatch', label: 'Disputed or overlapping claims' };
        // The Military layer: a Mexican state's land that a U.S. claim lies over (New Mexico east of the Rio Grande,
        // which Texas claimed; the Nueces strip) is drawn as this disputed piece, the state's own polygon hidden.
        // If that state is occupied on the date, the piece carries the occupier's hatch and the state's name.
        if (trackerId === 'military' && military?.war && !(military.show?.length && !military.show.includes('territory'))) {
          const hit = sideOf(military.war, military.members, new Set([slug(it.p.bn), slug(it.p.bpower ?? '')].filter(Boolean)), date);
          if (hit?.role === 'occupied') { const l = sideLook(hit); it.look = { ...it.look, occ: l.occ, occBy: l.occBy, occLabel: l.occLabel, occName: l.occName }; }
        }
        items.push(it);
      }
    }
    // Native lands under the cessions tracker: today's held land from 2020 (Census 2025 boundaries), and the lands the
    // Indian Claims Commission later found to be each nation's original territory, outlined from 1784 to its 1978 map.
    const lands = trackerId === 'cessions' ? aliveLands(data, date) : [];
    for (const it of lands) it.look = { land: it.p.kind };
    const icc = trackerId === 'cessions' ? aliveICC(data, date) : [];
    // Land held under U.S. treaty, before Removal (solid: a treaty fixed its lines), and where two nations held the same.
    const treaty = trackerId === 'cessions' ? aliveTreaty(data, date) : [];
    for (const it of treaty) it.look = { land: 'treaty' };
    const treatyX = trackerId === 'cessions' ? aliveTreatyX(data, date) : [];
    for (const it of treatyX) it.look = { pattern: 'hatch' };
    for (const c of cesAlive) {
      const per = tracker.periods.findIndex(([a, b]) => c.p.d >= a && c.p.d <= b);
      c.look = { seq: per + 1, label: tracker.periods[per]?.[2] };
    }

    // Native homelands (historical-basemaps, colonial era): under every tracker but the cessions.
    const natAlive = trackerId === 'cessions' ? [] : aliveNative(data, date);
    for (const it of natAlive) { it.cat = 'native'; it.look = categoryLook(powers, 'native'); items.push(it); }
    // An order's highlight (lesson maps): the polygons it names keep their looks; everything else drops to paper.
    const hl = lesson?.highlight?.size && (trackerId === 'nations' || trackerId === 'states' || trackerId === 'military') ? applyHighlight(items) : null;
    if (!hl) for (const it of items) { it.lit = null; it.litBy = null; }
    // A Newberry "Other" area the owner gave a fill of its own (the Republic of Texas, 2026-11-09) takes it where the
    // map has room once the highlight has dropped the rest to paper: at most four fills with it, and no other power on
    // the map in its colour; elsewhere it keeps the hatch (grammar §5). The whole continent in 1836–1845 has five already.
    if (trackerId === 'nations') ownFills(items);

    // A fingerprint of what this date draws. Most years change nothing: then nothing is redrawn. A sheet drawn
    // a moment ago (scrubbing back and forth) comes back from the cache instead of being built again.
    const key = [fingerprint(trackerId, date, nbAlive, ohmAlive, cesAlive.length, natAlive), pop?.census?.year ?? '',
      (pop?.estimates.placed ?? []).concat(pop?.estimates.national ?? []).map((e) => e.id).join(','), lands.length, icc.length, electoral?.election.year ?? '',
      treaty.map((it) => `${it.p.nation}${it.p.s}`).join(','), treatyX.length, ...(lesson ? [items.filter((it) => it.src === 'usmx').map((it) => it.p.id).join(',')] : []),
      military?.war ? `mil:${military.war.id}:${military.members.filter((m) => memberAlive(m, date)).map((m) => m.id).join(',')}` : ''].join('|');
    const counts = { nb: nbAlive.length, ohm: ohmAlive.length, cessions: cesAlive.length };
    const before = current;
    current = { date, trackerId };
    diffList.hide();
    cartouche.setTitle(trackerId === 'military' && military?.war && !lesson?.title ? military.title : titleOn(date));
    // The Military layer's margin and strip (P8, P10): drawn on every date, before the layers (names keep clear of them).
    milNow = trackerId === 'military' ? military : null;
    milListBox = null;
    // (the list is drawn again once the legend of this date is set, so it folds against the legend it will sit beside)
    let drawMilList = null;
    if (milNow?.war) {
      const cornerNow = () => (legend.anchor === 'top-right' || legend.anchor === 'top-left' ? 'bottom-right' : 'top-right');
      const corner = cornerNow();
      const [vx, vy, vw, vh] = main.box;
      const flagged = (milNow.shown ?? []).map((r) => { const xy = r.lon != null ? projection([r.lon, r.lat]) : null; return { ...r, offSheet: !(xy && xy[0] >= vx && xy[0] <= vx + vw && xy[1] >= vy && xy[1] <= vy + vh) }; });
      if (milNow.battle) {
        // a battle frame (milestone 9): the phases in the margin and as the strip
        drawMilList = () => { milListBox = drawPhaseList(root, frame, milNow.battle.record, milNow.battle.phase.n, { corner: cornerNow(), avoid: legend.box(), whole: !!milNow.battle.whole, onPick: onPhase }); };
        drawMilList();
        root.classed('war-strip-on', true);
        drawPhaseStrip(root, frame, milNow.battle.record, milNow.battle.phase.n, { whole: !!milNow.battle.whole, onPick: onPhase });
        if (recordLayers.ground) drawGround(recordLayers.ground, defs, milNow.battle.ground ?? null, projection, main.box);
      } else {
        drawMilList = () => { milListBox = drawCourseList(root, frame, flagged, milNow.war, { corner: cornerNow(), title: milNow.war.list_title ?? 'The course of the war', avoid: legend.box() }); };
        drawMilList();
        root.classed('war-strip-on', milNow.strip !== 'stage');
        if (milNow.strip !== 'stage') drawWarStrip(root, frame, { war: milNow.war, members: milNow.members, events: milNow.events ?? [], moves: milNow.allMoves ?? [], date, span: milNow.film?.span ?? null, chapter: milNow.film?.chapter ?? null }); else root.selectAll('g.war-strip').remove();
      }
      // the computed lines of the war alive on the date (P7): blockades off the other side's coast, treaty lines, ghosts
      milNow.lines = (!milNow.show?.length || milNow.show.includes('lines')) ? computeLines(milNow, date, data) : [];
      drawLines(recordLayers.lines, defs, milNow.lines, milNow.icons ?? {});
    } else {
      root.classed('war-strip-on', false);
      root.selectAll('g.course-list, g.war-strip').remove();
      recordLayers.lines.selectAll('*').remove();
    }
    const milZones = milListBox ? [milListBox] : [];
    if (key === currentKey) { current = { ...before, date, trackerId }; return { ...counts, redrawn: false }; }

    // A lesson map is one picture: the legend first (only what is lit; a dispute by its sides), then the places,
    // routes and rivers the order points at, then the polity names, which keep clear of all of them.
    if (lesson) {
      for (const it of [...items, ...cesAlive, ...lands, ...treaty]) {
        if (!(it.look && (it.look.fill || it.look.pattern || it.look.seq || it.look.pop || it.look.land || it.look.occ))) continue;
        if (views.some((v) => v.shows(it.f))) addPresent(present, it.look);
      }
      if (icc.length) present.add('icc');
      if (treatyX.some((it) => views.some((v) => v.shows(it.f)))) present.add('treatyX');
      const base = trackerId === 'electoral'
        ? (electoral ? electoralLegend(electoral, { abstained: someAbstained(electoral, nbAlive) }) : { title: tracker.title, legend: [{ swatch: 'none', label: 'The first electors voted on 4 February 1789' }] })
        : legendFor(powers, tracker, trackerId, present, date, ohmAlive.length > 0, pop);
      const shownLegend = shortKey(lessonLegend(base, items, trackerId, hl), milNow);
      legend.set(shownLegend);
      if (drawMilList) { drawMilList(); milZones.length = 0; if (milListBox) milZones.push(milListBox); }
      recordLayout = layoutRecords(milZones);
      const layers = views.map((v) => drawView(v, data, date, { items, nbAlive, ohmAlive, cesAlive, trackerId, pop, lands, icc, electoral, treaty, treatyX,
        extraZones: v.id === 'main' ? recordLayout.zones : [], lines: v.id === 'main' ? recordLayout.lines : [] }));
      views.forEach((v, i) => swapIn(v, layers[i], fade));
      currentKey = key;
      current = { date, trackerId, mode: 'snapshot', items: [...items, ...cesAlive, ...lands, ...treaty, ...treatyX], polityLabels: layers.flatMap((l) => l.labels ?? []), legend: shownLegend, records: recordLayout, highlight: hl };
      return { ...counts, redrawn: true };
    }

    let entry = cache.get(key);
    if (entry) cache.delete(key);
    else {
      // The legend names only what reaches the sheet: the main map or an inset.
      for (const it of [...items, ...cesAlive, ...lands, ...treaty]) {
        if (!(it.look && (it.look.fill || it.look.pattern || it.look.seq || it.look.pop || it.look.land || it.look.occ))) continue;
        if (views.some((v) => v.shows(it.f))) addPresent(present, it.look);
      }
      if (icc.length) present.add('icc');
      if (treatyX.some((it) => views.some((v) => v.shows(it.f)))) present.add('treatyX');
      entry = {
        layers: views.map((v) => drawView(v, data, date, { items, nbAlive, ohmAlive, cesAlive, trackerId, pop, lands, icc, electoral, treaty, treatyX })),
        legend: trackerId === 'electoral'
          ? (electoral ? electoralLegend(electoral, { abstained: someAbstained(electoral, nbAlive) }) : { title: tracker.title, legend: [{ swatch: 'none', label: 'The first electors voted on 4 February 1789' }] })
          : legendFor(powers, tracker, trackerId, present, date, ohmAlive.length > 0, pop),
      };
    }
    cache.set(key, entry);
    while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    views.forEach((v, i) => swapIn(v, entry.layers[i], fade));
    legend.set(entry.legend);
    if (drawMilList) { drawMilList(); milZones.length = 0; if (milListBox) milZones.push(milListBox); }
    // (the live page: the Military layer's events, or the clearing of them when the layer goes off)
    if (milNow?.war || records.points.length || records.routes.length || recordLayout) recordLayout = layoutRecords(milZones);
    currentKey = key;
    // (what is on the sheet, for the packing slip: src/us/slip.js)
    current = { date, trackerId, mode: 'snapshot', items: [...items, ...cesAlive, ...lands, ...treaty, ...treatyX], polityLabels: entry.layers.flatMap((l) => l.labels ?? []), legend: entry.legend };
    return { ...counts, redrawn: true };
  }

  // Crossfade: the new layers fade in while the old fade out and leave the DOM (they stay in the cache).
  function swapIn(v, { g, lg }, fade) {
    for (const [parent, sel] of [[v.snapshots, g], [v.labels, lg]]) {
      const node = sel.node();
      parent.selectAll(':scope > g').filter(function () { return this !== node; })
        .interrupt().transition().duration(fade).style('opacity', 0).remove();
      sel.interrupt();
      if (node.parentNode !== parent.node()) sel.style('opacity', fade ? 0 : 1);
      parent.node().appendChild(node);
      if (fade) sel.transition().duration(fade).style('opacity', 1); else sel.style('opacity', 1);
    }
  }

  // Builds one view's layers for a date, detached; swapIn() puts them on the sheet.
  // extraZones, lines (lesson maps): the boxes of the order's places and their names, and its route lines, which the
  // polity names keep clear of.
  function drawView(v, data, date, { items, nbAlive, ohmAlive, cesAlive, trackerId, pop = null, lands = [], icc = [], electoral = null, treaty = [], treatyX = [], extraZones = [], lines = [] }) {
    const g = d3.create('svg:g').attr('class', 'snap');
    const lg = d3.create('svg:g').attr('class', v.id === 'main' ? 'snap-labels' : 'snap');
    const landClip = `url(#land-${v.id})`;
    const ohmItems = items.filter((it) => it.src === 'ohm');
    const nbItems = items.filter((it) => it.src === 'newberry');

    // Newberry's land, as a mask: OpenHistoricalMap fills never show through it. (Only when both are filled;
    // a mask is costly to paint.)
    const fills = g.append('g').attr('class', 'na-fills').attr('clip-path', landClip);
    const byKey = (list) => d3.groups(list.filter((it) => it.look.fill), (it) => it.look.fill);
    // Every fill is opaque inside one translucent group: where two claims overlap, one colour shows (the overlap
    // itself carries a hatch), never a muddy mix that no legend explains.
    const tint = fills.append('g').attr('class', 'na-tint').attr('opacity', FILL_OPACITY);
    const ohmFill = tint.append('g');
    if (nbItems.length && ohmItems.some((it) => it.look.fill)) {
      const maskId = `nbm-${v.id}-${++uid}`;
      const mask = g.insert('mask', ':first-child').attr('id', maskId).attr('maskUnits', 'userSpaceOnUse')
        .attr('x', 0).attr('y', 0).attr('width', W).attr('height', H);
      mask.append('rect').attr('width', W).attr('height', H).attr('fill', '#fff');
      mask.selectAll('path').data(nbItems).join('path').attr('d', (it) => v.d(it.f)).attr('fill', '#000');
      ohmFill.attr('mask', `url(#${maskId})`);
    }
    // 1. OHM fills, masked by the U.S.
    for (const [key, list] of byKey(ohmItems)) {
      ohmFill.append('g').attr('class', `na-fill k-${key}`)
        .selectAll('path').data(list).join('path').attr('d', (it) => v.d(it.f));
    }
    // 2. Newberry fills.
    for (const [key, list] of byKey(nbItems)) {
      tint.append('g').attr('class', `na-fill k-${key}`)
        .selectAll('path').data(list).join('path').attr('d', (it) => v.d(it.f));
    }
    // 2b. Native population: Native people per 1,000 km², in stepped shades (a sequential key, the same every year).
    const popItems = nbItems.filter((it) => it.look.pop);
    if (popItems.length) {
      fills.append('g').attr('class', 'na-pop').attr('opacity', 0.85)
        .selectAll('path').data(popItems).join('path')
        .attr('class', (it) => `pop pop-${it.look.pop}`).attr('d', (it) => v.d(it.f));
    }
    // 3. Land cessions, oldest first, in stepped shades by period.
    if (cesAlive.length) {
      fills.append('g').attr('class', 'na-cessions').attr('opacity', 0.85)
        .selectAll('path').data(cesAlive).join('path')
        .attr('class', (c) => `cession seq-${c.look.seq}`).attr('d', (c) => v.d(c.f));
    }
    // 3b. Native lands: the judicially established original territories as hairlines, and today's held land filled.
    if (icc.length) {
      fills.append('g').attr('class', 'na-icc').selectAll('path').data(icc).join('path').attr('class', 'icc-line').attr('d', (it) => v.d(it.f));
    }
    if (lands.length) {
      fills.append('g').attr('class', 'na-lands').selectAll('path').data(lands).join('path')
        .attr('class', (it) => `land-today ${it.look.land}`).attr('d', (it) => v.d(it.f));
    }
    // 3c. Land held under U.S. treaty (the same green as today's held land), its edge solid; where two nations held
    // the same land on the same day, a hatch over both.
    if (treaty.length) {
      fills.append('g').attr('class', 'na-treaty').attr('opacity', 0.55).selectAll('path').data(treaty).join('path')
        .attr('class', 'land-today treaty').attr('d', (it) => v.d(it.f));
      fills.append('g').attr('class', 'na-treaty-x').selectAll('path').data(treatyX).join('path')
        .attr('class', 'na-pattern p-hatch').attr('d', (it) => v.d(it.f));
    }
    // 4. Native nations: stipple with a soft edge ("sphere": the mask is blurred, never the dots).
    const stip = items.filter((it) => it.look.pattern === 'stipple');
    softLayer(g, fills, v, stip, 'na-stipple');
    // 5. Overlaps and disputes (hatch), rebellion (cross-hatch).
    const pats = items.filter((it) => it.look.pattern && it.look.pattern !== 'stipple' && it.src !== 'nbx' && it.src !== 'usmx');
    fills.append('g').attr('class', 'na-patterns').selectAll('path').data(pats).join('path')
      .attr('class', (it) => `na-pattern p-${it.look.pattern}`).attr('d', (it) => v.d(it.f));

    // 5b. Occupied land (the Military layer, P2): the occupier's hatch over the owner's fill.
    const occItems = items.filter((it) => it.look.occ);
    if (occItems.length) {
      for (const c of new Set(occItems.map((it) => it.look.occ))) {
        if (!defs.select(`#hatch-side-${c}`).empty()) continue;
        defs.append('pattern').attr('id', `hatch-side-${c}`).attr('patternUnits', 'userSpaceOnUse').attr('width', 8).attr('height', 8).attr('patternTransform', 'rotate(-45)')
          .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 8).attr('class', `hatch-side-line side-${c}`);
      }
      fills.append('g').attr('class', 'na-occupied').selectAll('path').data(occItems).join('path')
        .attr('class', (it) => `na-pattern p-occ side-${it.look.occ}`).attr('d', (it) => v.d(it.f))
        .append('title').text((it) => `Occupied by ${it.look.occLabel}`);
    }

    drawBorders(g, v, data, date, nbAlive, ohmAlive);
    // 6. Land two U.S. polygons claimed at once (src/us/disputes.js), over the borders: the Toledo Strip is a few
    // pixels wide, so its hatch carries a rust edge (as Newberry's own disputed areas do) or it would not show at all.
    const disputes = items.filter((it) => (it.src === 'nbx' || it.src === 'usmx') && it.look.pattern);
    g.append('g').attr('class', 'nb-disputes').attr('clip-path', `url(#land-${v.id})`)
      .selectAll('path').data(disputes).join('path').attr('class', 'na-pattern p-hatch nb-dispute').attr('d', (it) => v.d(it.f));

    // Hit areas: every alive polygon, topmost last, so a click finds the most specific thing under it.
    const hits = g.append('g').attr('class', 'na-hits');
    const order = [...stip, ...ohmItems.filter((it) => !it.look.pattern), ...nbItems.filter((it) => !it.look.pattern), ...icc, ...cesAlive, ...lands, ...treaty, ...treatyX, ...pats, ...disputes];
    hits.selectAll('path').data(order).join('path').attr('d', (it) => v.d(it.f))
      .on('click', (ev, it) => onPick && onPick(it, date))
      .append('title').text((it) => hoverText(it, date));

    // Labels. Number badges first (they are the point of the population map), then the names around them.
    // The badges claim their boxes first but are drawn after the names: the name join selects every text in the layer.
    const zones = [...reservedZones(v), ...extraZones];
    const badges = pop ? fitBadges(v, pop, zones) : [];
    zones.push(...badges.map((b) => b.box));
    // A colony's name goes where its own colour shows: not on a point another power's polygon also covers.
    const rivals = ohmItems.filter((it) => it.look.fill);
    const covered = (it, ll) => rivals.some((r) => r !== it && r.cat !== it.cat && containsLL(r.f, ll));
    // Electoral College: each voting state's badge ("OH 23") stands for its name; the rest keep their names.
    const ecBadges = electoral ? fitElectoralBadges(v, nbItems, (p) => resultFor(electoral, p), zones, measure) : [];
    zones.push(...ecBadges.map((b) => b.box));
    const named = electoral ? nbItems.filter((it) => !resultFor(electoral, it.p)?.badge) : nbItems;
    // (a battle frame names its hills and roads, not the state it lies in)
    const labels = milNow?.battle ? [] : placePolityLabels(lg, v, [...treaty, ...named, ...ohmItems, ...items.filter((it) => it.src === 'usmx' && it.look.occName), ...stip.filter((it) => it.src === 'hb')], zones, measure, date, trackerId, { covered, nolabel: powers.nolabel ?? [], lines });
    drawBadges(lg, badges);
    drawElectoralBadges(lg, ecBadges);

    return { g, lg, labels: labels.map((c) => ({ ...c, view: v.id })) };
  }

  // The population picture of a date: the census on or before it, its states added onto the polygons alive on the
  // date, and the estimates whose window holds it.
  function populationOn(data, date, nbAlive) {
    const census = censusOn(data.pop, date);
    const { units, outside } = census ? unitsFor(census, data.pop.anchors, nbAlive, data.pop.home) : { units: new Map(), outside: [] };
    for (const u of units.values()) { u.year = census.year; u.what = data.pop.what[census.what]; u.source = census.source; u.us = census.us; }
    return { census, full: !!census?.full, units, outside, estimates: estimatesOn(data.pop, date) };
  }

  // Number badges (grammar §5: a quantity is a number badge). Census years from 1890: the largest counts, under
  // the state's name. Before 1890: each placed estimate at its place, its range and year in italic beneath. A badge
  // is drawn only where it overlaps nothing else; its box is kept so the names keep clear of it.
  function fitBadges(v, pop, zones) {
    const main = v.id === 'main';
    const badges = [];
    if (pop.full) {
      // one badge per unit, on its largest polygon (Indian Territory and Oklahoma Territory share Oklahoma's count)
      const top = [...new Set(pop.units.values())].sort((a, b) => b.aian - a.aian).slice(0, main ? 9 : 1);
      for (const u of top) {
        const it = u.items.reduce((a, b) => (areaKm2(b.f) > areaKm2(a.f) ? b : a));
        const poly = largestPolygon(it.f);
        const [cx, cy] = poly ? v.path.centroid(poly) : [NaN, NaN];
        if (Number.isFinite(cx)) badges.push({ x: cx, y: cy + (main ? 22 : 14), text: fmt(u.aian) });
      }
    } else if (main) {
      for (const e of pop.estimates.placed) {
        const p = v.proj(e.at);
        if (!p) continue;
        const range = e.low != null && e.high != null && e.low !== e.high ? `${fmt(e.low)}–${fmt(e.high)}, ` : '';
        badges.push({ x: p[0], y: p[1], text: `${e.place} ${e.label}`, sub: `${range}${yearOf(e.s)} estimate` });
      }
    }
    const out = [];
    const [bx, by, bw, bh] = v.box;
    for (const b of badges) {
      const tw = measure(b.text, { size: 13, bold: true }) + 16;
      const sw = b.sub ? measure(b.sub, { size: 11, italic: true }) + 8 : 0;
      const w = Math.max(tw, sw), h = b.sub ? 36 : 20;
      const box = { x: b.x - w / 2, y: b.y - 10, w, h };
      if (box.x < bx + 2 || box.x + w > bx + bw - 2 || box.y < by + 2 || box.y + h > by + bh - 2) continue;
      if ([...zones, ...out.map((o) => o.box)].some((z) => overlaps(z, box, 3))) continue;
      out.push({ ...b, tw, box });
    }
    return out;
  }

  function drawBadges(lg, badges) {
    for (const b of badges) {
      const g = lg.append('g').attr('class', 'badge').attr('transform', `translate(${b.x.toFixed(1)},${b.y.toFixed(1)})`);
      g.append('rect').attr('x', -b.tw / 2).attr('y', -10).attr('width', b.tw).attr('height', 20).attr('rx', 10);
      g.append('text').attr('class', 'badge-n').attr('y', 0).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').text(b.text);
      if (b.sub) g.append('text').attr('class', 'badge-sub').attr('y', 19).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').text(b.sub);
    }
  }

  // A soft-edged area ("sphere" certainty): a rect painted through a blurred mask of the polygons, never a line.
  function softLayer(g, fills, v, items, cls) {
    if (!items.length) return;
    const sid = `soft-${v.id}-${++uid}`;
    g.append('mask').attr('id', sid).attr('maskUnits', 'userSpaceOnUse').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H)
      .append('g').attr('filter', 'url(#sphere-soft)')
      .selectAll('path').data(items).join('path').attr('d', (it) => v.d(it.f)).attr('fill', '#fff');
    fills.append('rect').attr('class', cls).attr('width', W).attr('height', H).attr('mask', `url(#${sid})`);
  }

  // Borders on a date. OHM: between neighbours of one level, or between different powers (not a province against
  // the colony that contains it, which would only redraw the coast). Approximate before the Treaty of Paris.
  function drawBorders(g, v, data, date, nbAlive, ohmAlive) {
    const borders = g.append('g').attr('class', 'na-borders').attr('clip-path', `url(#land-${v.id})`);
    if (ohmAlive.length) {
      const geoms = ohmAlive.filter((it) => it.p.lvl !== 'x').map((it) => it.g);
      const coll = { type: 'GeometryCollection', geometries: geoms };
      const between = (a, b) => a !== b && (powerAt(a.properties, date) !== powerAt(b.properties, date) || a.properties.lvl === b.properties.lvl);
      // (a polygon the owner had cut at a river loses the edges the cut moved off it: src/us/disputes.js applyOHMCuts)
      const drop = new Set(ohmAlive.flatMap((it) => it.dropArcs ?? []));
      const m = drop.size ? meshWithout(data.ohmTopo, coll, between, drop) : mesh(data.ohmTopo, coll, between);
      borders.append('path').attr('class', `na-border ohm ${date < US_FROM ? 'approximate' : 'legal'}`).attr('d', v.path(m));
    }
    if (nbAlive.length) {
      // The heavy line is the edge of the United States itself; Newberry's disputed and joint areas (Deseret over
      // Utah Territory, Oregon Country, the Republic of Texas) get a thin outline of their own.
      const us = { type: 'GeometryCollection', geometries: nbAlive.filter((it) => it.p.power === 'us').map((it) => it.g) };
      const other = { type: 'GeometryCollection', geometries: nbAlive.filter((it) => it.p.power !== 'us').map((it) => it.g) };
      borders.append('path').attr('class', 'na-border nb-inner legal').attr('d', v.path(mesh(data.nbTopo, us, (a, b) => a !== b)));
      borders.append('path').attr('class', 'na-border nb-outer legal').attr('d', v.path(mesh(data.nbTopo, us, (a, b) => a === b)));
      if (other.geometries.length) borders.append('path').attr('class', 'na-border nb-other legal').attr('d', v.path(mesh(data.nbTopo, other)));
    }
  }

  function fingerprint(trackerId, date, nbAlive, ohmAlive, nCessions, natAlive) {
    return [trackerId, date >= 17760704 ? 1 : 0, date >= US_FROM ? 1 : 0, labelFor(powers.categories.britain, date),
      nbAlive.map((it) => `${it.p.id}.${it.p.v}`).join(','), ohmAlive.map((it) => `${it.p.rid}:${powerAt(it.p, date)}`).join(','),
      nCessions, natAlive.length ? natAlive[0].p.y : 0].join('|');
  }

  // ------------------------------------------------------------ two dates (the Diff view)
  // B is the ground: its borders, nothing filled. Appeared, and under the nations tracker land that changed hands
  // (among it the United States' growth: B's U.S. land with A's masked out), in the focus color from B's polygons;
  // vanished hatched and outlined in rust from A's, the outline dashed when A's border was approximate; persisted
  // muted. Native nations are soft (no outline) in either color. The list under the legend names them.
  // `electoralDiff`: under the Electoral College, the comparison of two elections (electionDiff in electoral.js).
  function showDiff(data, a, b, trackerId, { fade = 300, electoralDiff = null } = {}) {
    const nbB = aliveNB(data, b), ohmB = aliveOHM(data, b);
    const natB = trackerId === 'cessions' ? [] : aliveNative(data, b);
    const nbA = aliveNB(data, a), ohmA = aliveOHM(data, a);
    const nCes = (d) => (trackerId === 'cessions' ? data.ces.filter((c) => c.p.d <= d).length : 0);
    const key = ['diff', yearOf(a), yearOf(b), fingerprint(trackerId, a, nbA, ohmA, nCes(a), []), fingerprint(trackerId, b, nbB, ohmB, nCes(b), natB)].join('#');
    current = { date: b, from: a, trackerId };
    cartouche.setTitle(titleOn(Math.max(a, b)));

    let entry = lesson ? null : cache.get(key);
    if (entry) cache.delete(key);
    else {
      const minKm2 = trackerId === 'nations' ? (stage.diff_min_km2 ?? 20000) : 0;
      // Nations: a far-off speck does not make the list. States and cessions: every one on the sheet does (the
      // District of Columbia is a few pixels across).
      const seen = trackerId === 'nations' ? (f) => views.some((v) => v.shows(f)) : (f) => views.some((v) => v.reaches(f));
      // A lesson map's Diff lists only what changed inside its frame, and only what its highlight names.
      const litF = lesson?.highlight?.size ? litFeature(data, a, b) : null;
      const visible = lesson ? (f) => seen(f) && inFrame(f) && (!litF || litF(f)) : seen;
      const diff = electoralDiff ?? diffUS(data, a, b, trackerId, { powers, visible, minKm2 });
      entry = { diff, sections: listSections(diff, trackerId), legend: diffLegendFor(diff, trackerId, { natB: natB.length > 0, anyOHM: ohmB.length > 0 }), layers: null };
      if (lesson) entry.legend = lessonLegend(entry.legend, [], trackerId, null);
    }
    legend.set(entry.legend);
    diffList.set({ sections: entry.sections }, legend.anchor === 'bottom-right' ? y0 + 22 : y0 + 22 + legend.height() + 14);
    if (lesson) recordLayout = layoutRecords([diffList.box()].filter(Boolean));
    if (!entry.layers) {
      entry.layers = views.map((v) => drawDiffView(v, data, entry.diff, { nbB, ohmB, natB, trackerId,
        extraZones: lesson && v.id === 'main' ? recordLayout.zones : [], lines: lesson && v.id === 'main' ? recordLayout.lines : [] }));
    }
    // (what is on the sheet, for the packing slip: src/us/slip.js)
    current = { ...current, mode: 'diff', diff: entry.diff, sections: entry.sections, legend: entry.legend, records: lesson ? recordLayout : null, items: [], polityLabels: entry.layers.flatMap((l) => l.labels ?? []) };
    cache.set(key, entry);
    while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    if (key !== currentKey) views.forEach((v, i) => swapIn(v, entry.layers[i], fade));
    currentKey = key;
    return entry.diff;
  }

  function drawDiffView(v, data, diff, { nbB, ohmB, natB, trackerId, extraZones = [], lines = [] }) {
    const { a, b } = diff;
    const g = d3.create('svg:g').attr('class', 'snap diff');
    const lg = d3.create('svg:g').attr('class', v.id === 'main' ? 'snap-labels' : 'snap');
    const fills = g.append('g').attr('class', 'na-fills').attr('clip-path', `url(#land-${v.id})`);
    const soft = (u) => u.power === 'native';
    const gold = [...diff.appeared, ...diff.changed.filter((u) => u.key !== 'us')];
    const gone = diff.vanished;

    // Focus color, opaque inside one translucent group (so nothing doubles where two appeared units overlap).
    const tint = fills.append('g').attr('class', 'na-tint').attr('opacity', FILL_OPACITY);
    tint.append('g').attr('class', 'na-fill k-focus').selectAll('path')
      .data(gold.filter((u) => !soft(u)).flatMap((u) => u.b)).join('path').attr('d', (it) => v.d(it.f));
    // The United States' growth or loss, from its polygons on both dates: one date's land painted through a mask
    // of the other's (the mask's edge widened a hair so the shared border leaves no seam). Nothing is computed.
    const us = diff.changed.find((u) => u.key === 'us');
    const masked = (layer, show, hide, cls) => {
      const id = `usm-${v.id}-${++uid}`;
      const m = g.insert('mask', ':first-child').attr('id', id).attr('maskUnits', 'userSpaceOnUse').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H);
      m.append('rect').attr('width', W).attr('height', H).attr('fill', '#fff');
      m.selectAll('path').data(hide).join('path').attr('d', (it) => v.d(it.f)).attr('fill', '#000').attr('stroke', '#000').attr('stroke-width', 1.5);
      layer.append('g').attr('class', cls).attr('mask', `url(#${id})`).selectAll('path').data(show).join('path').attr('d', (it) => v.d(it.f));
    };
    if (us?.grew) masked(tint, diff.us.b, diff.us.a, 'na-fill k-focus');
    softLayer(g, fills, v, gold.filter(soft).flatMap((u) => u.b), 'na-soft-focus');
    // Context: Native homelands on the later date (historical-basemaps; never compared, see diff.js).
    softLayer(g, fills, v, natB, 'na-stipple');
    // Vanished: rust hatch from the earlier date's polygons.
    const goneCrisp = gone.filter((u) => !soft(u)).flatMap((u) => u.a);
    fills.append('g').attr('class', 'na-vanished').selectAll('path').data(goneCrisp).join('path').attr('d', (it) => v.d(it.f));
    if (us?.shrank) masked(fills, diff.us.a, diff.us.b, 'na-vanished');
    softLayer(g, fills, v, gone.filter(soft).flatMap((u) => u.a), 'na-soft-vanished');

    drawBorders(g, v, data, b, nbB, ohmB);
    // The vanished outline, in rust, dashed where the earlier date's border was approximate (certainty is the dash).
    g.append('g').attr('class', 'na-vanished-edges').attr('clip-path', `url(#land-${v.id})`)
      .selectAll('path').data(goneCrisp).join('path')
      .attr('class', (it) => `na-vanished-edge ${it.src === 'ohm' && a < US_FROM ? 'approximate' : 'legal'}`)
      .attr('d', (it) => v.d(it.f));

    // Hit areas: the later date's polygons, then the vanished ones on top (their source card is of the earlier date).
    const pick = (list, date) => list.map((it) => ({ it, date }));
    const hitsB = trackerId === 'cessions' ? gold.flatMap((u) => u.b) : [...natB, ...ohmB.filter((it) => it.p.lvl !== 'x'), ...nbB];
    const order = [...pick(hitsB, b), ...pick(gone.flatMap((u) => u.a), a)];
    g.append('g').attr('class', 'na-hits').selectAll('path').data(order).join('path').attr('d', (h) => v.d(h.it.f))
      .on('click', (ev, h) => onPick && onPick(h.it, h.date))
      .append('title').text((h) => hoverText(h.it, h.date));

    // Labels: the units the list names (not the provinces folded into them, not the cessions, not the U.S. as a
    // whole), appeared in ink, vanished in rust italic.
    if (trackerId !== 'cessions') {
      const wrap = (u, it, cls) => ({ src: it.src, p: it.p, f: it.f, cat: u.power, look: soft(u) ? { pattern: 'stipple' } : { fill: 'focus' }, diffCls: cls });
      const named = (list, side, cls) => list.filter((u) => !u.within && u.key !== 'us').flatMap((u) => u[side].map((it) => wrap(u, it, cls)));
      const zones = [...reservedZones(v), ...extraZones];
      const box = v.id === 'main' && diffList.box();
      if (box) zones.push(box);
      const labels = placePolityLabels(lg, v, [...named(gold, 'b', 'appeared'), ...named(gone, 'a', 'vanished')], zones, measure, b, trackerId, { lines });
      return { g, lg, labels: labels.map((c) => ({ ...c, view: v.id })) };
    }
    return { g, lg };
  }

  // ------------------------------------------------------------ lesson maps (src/us/frames.js)
  // The highlight: a polygon is lit when one of its names is in the order (its power, its own name, its source id);
  // a dispute or overlap stays when the order names it or lights either of its sides. Everything else drops to paper.
  // (show) Newberry "Other" areas with a fill of their own (powers.json newberry_own), where the map has room.
  function ownFills(items) {
    const rules = powers.newberry_own ?? [];
    if (!rules.length) return;
    const shown = (it) => views.some((v) => v.shows(it.f));
    const fills = new Map();
    for (const it of items) if (it.look?.fill && shown(it)) fills.set(it.look.fill, it.look.cat ?? it.look.label);
    for (const it of items) {
      if (it.src !== 'newberry' || it.p.power !== powers.newberry_other || it.look?.pattern !== 'hatch' || !shown(it)) continue;
      const rule = rules.find((r) => new RegExp(r.match, 'i').test(it.p.full || it.p.name || ''));
      const look = rule ? categoryLook(powers, rule.power) : null;
      if (!look?.fill) continue;
      if ((fills.has(look.fill) && fills.get(look.fill) !== rule.power) || new Set([...fills.keys(), look.fill]).size > 4) continue;
      it.look = look;
      it.cat = rule.power;
      fills.set(look.fill, rule.power);
    }
  }

  function applyHighlight(items) {
    const hl = lesson.highlight;
    hl.reset();
    const sided = (it) => it.src === 'nbx' || it.src === 'usmx' || (it.src === 'ohm' && it.p.lvl === 'x');
    const litNB = new Set(), litOHM = new Set();
    let mexicoLit = false;
    for (const it of items) {
      if (sided(it)) continue;
      const by = hl.has(itemKeys(it, { power: it.cat, powers, twins: lesson.twins }));
      it.lit = !!by; it.litBy = by;
      if (!by) { it.look = { fill: null, label: null }; continue; }
      if (it.src === 'newberry') litNB.add(it.p.id); else if (it.src === 'ohm') litOHM.add(it.p.rid);
      if (it.cat === 'mexico') mexicoLit = true;
    }
    for (const it of items) {
      if (!sided(it)) continue;
      const by = hl.has(itemKeys(it, { powers }));
      const p = it.p;
      const side = it.src === 'nbx' ? litNB.has(p.a) || litNB.has(p.b)
        : it.src === 'usmx' ? litNB.has(p.a) || litOHM.has(p.b) || mexicoLit
          : litOHM.has(p.a) || litOHM.has(p.b);
      it.lit = !!by || side; it.litBy = by ?? (side ? '(a side is lit)' : null);
      if (!it.lit) it.look = { fill: null, label: null };
    }
    return hl;
  }

  // The legend of a lesson map. Under a highlight a fill names what is lit: the power when the order named the power,
  // else the polygons it named ("Coahuila y Tejas"). A hatch names the sides of the dispute it marks ("Claimed by
  // Texas and Mexico"), one line per dispute, from the records (a computed overlap knows its two polygons; a disputed
  // area OHM or Newberry draws whole takes its sides from powers.json's `claims`). Then the order's places and routes.
  function lessonLegend(base, items, trackerId, hl) {
    let rows = [...base.legend];
    const shown = items.filter((it) => it.look && views.some((v) => v.shows(it.f)));
    if (hl) {
      rows = rows.map((r) => {
        if (r.swatch !== 'fill' || !r.key || r.key === 'hatch' || r.key === 'stipple' || r.key === 'crosshatch') return r;
        const lit = shown.filter((it) => it.lit && it.look.fill === r.key);
        if (!lit.length || lit.some((it) => isPowerKey(it.litBy, it.cat))) return r;
        const names = [...new Set(lit.map((it) => cleanLabel(it.src === 'newberry' ? nbName(it.p) : it.p.name)).filter(Boolean))];
        return { ...r, label: names.length > 2 ? `${names.slice(0, 2).join(', ')} and ${names.length - 2} more` : names.join(' and ') };
      });
    }
    const hatched = shown.filter((it) => it.look.pattern === 'hatch');
    if (hatched.length && rows.some((r) => r.key === 'hatch')) {
      const groups = new Map();
      let unknown = false;
      for (const it of hatched) {
        const ps = partiesOf(it);
        if (!ps) { unknown = true; continue; }
        const k = [...ps].sort().join('|');
        if (!groups.has(k)) groups.set(k, ps);
      }
      if (groups.size && groups.size <= 3) {
        const claimRows = [...groups.values()].map((ps) => ({ swatch: 'fill', key: 'hatch', label: claimLabel(ps), role: 'dispute' }));
        if (unknown) claimRows.push({ swatch: 'fill', key: 'hatch', label: 'Other disputed or overlapping claims', role: 'dispute' });
        const at = rows.findIndex((r) => r.key === 'hatch');
        rows.splice(at, 1, ...claimRows);
      }
    }
    // the places and routes an order points at (grammar §5: shape is event type; colour and head say what moved)
    if (lesson.legendRows) rows.push(...lesson.legendRows(records));
    return { ...base, legend: rows };
  }
  // Did the order name the whole power ("mexico"), or one of its polygons?
  const isPowerKey = (by, pw) => {
    if (!by || !pw) return false;
    const k = slug(by), c = powers.categories[pw];
    return k === slug(pw) || k === slug(c?.label) || (c?.labels ?? []).some(([, t]) => slug(t) === k) || (pw === 'us' && /^(united-states|usa|united-states-of-america)$/.test(k));
  };
  // The sides of a hatched area, or null when the record does not say.
  function partiesOf(it) {
    const p = it.p;
    if (it.src === 'nbx') return [p.an, p.bn];
    if (it.src === 'usmx') return p.parties;
    if (it.src === 'ohm' && p.lvl === 'x') return p.name.split(' / ').map(cleanLabel);
    const name = it.src === 'newberry' ? nbName(p) : p.name;
    const rule = (powers.claims ?? []).find((r) => new RegExp(r.match, 'i').test(name ?? ''));
    return rule ? rule.parties : null;
  }

  // The order's places and routes (records), and the rivers it names, with their names placed by the label pass
  // (src/render/labels.js): no name on a name, a line, a mark or the apparatus; at most ten labelled places, rivers
  // counted among them; two marks that print as one dot name themselves on opposite sides (APART). → what was drawn,
  // what was dropped, and the boxes the polity names must keep clear of.
  function layoutRecords(extra = []) {
    if (!recordLayers) return null;
    const zones = [cartouche.box(), legend.box(), { x: x0, y: y1 - 14, w: x1 - x0, h: 40 }, ...stageLabelZones(), ...extra];
    const marksAt = new Map(records.points.filter((p) => p.shape).map((p) => [p.where, (MARK_RADIUS[p.shape] ?? 6) + 2]));
    // a mark at the same place under another id (a battle at a city) also keeps an arrowhead clear
    const markPts = records.points.filter((p) => p.shape && p.lon != null).map((p) => ({ xy: projection([p.lon, p.lat]), r: (MARK_RADIUS[p.shape] ?? 6) + 2 })).filter((m) => m.xy && Number.isFinite(m.xy[0]));
    const clearance = (qid, coord) => {
      if (marksAt.has(qid)) return marksAt.get(qid);
      const xy = coord ? projection(coord) : null;
      if (!xy) return 0;
      const near = markPts.find((m) => Math.hypot(m.xy[0] - xy[0], m.xy[1] - xy[1]) < 6);
      return near ? near.r : 0;
    };
    // the forces where they stand (milestone 5) go first: route names and place names keep clear of their boxes (the
    // label pass below); the lines themselves run under the marks, so the boxes are not zones here (a zone trims a
    // line, and at a continental scale a force's label box can cover a whole short march)
    const forceBoxes = milNow?.war ? drawForceMarks(recordLayers.forces, milNow.positions ?? [], projection, { icons: milNow.icons ?? {}, checks: milNow.checks ?? {}, box: main.box, compact: milNow.preset === 'classroom', big: !!milNow.battle }) : (recordLayers.forces.selectAll('*').remove(), []);
    const drawnRoutes = drawRoutes(recordLayers.routes, records.routes, projection, zones, clearance);
    drawEdgeTabs(recordLayers.labels, drawnRoutes, main.box);
    // (the Military layer's events beyond the frame, a declaration in Washington on a Texas map, are not drawn;
    // the course list says "off this map" for them)
    const [vx, vy, vw, vh] = main.box;
    const onSheet = (p) => { if (p.tracker !== 'military' || p.lon == null) return true; const xy = projection([p.lon, p.lat]); return xy && xy[0] >= vx && xy[0] <= vx + vw && xy[1] >= vy && xy[1] <= vy + vh; };
    const marks = drawMarks(recordLayers.marks, records.points.filter(onSheet), projection);
    const rivers = namedRiverLines();
    // The Military layer: battles colored by outcome, rings, and circled numerals (P5, P6, P8). A numbered event has
    // no name on the map (the list in the margin carries it), but its mark and numeral still keep names away.
    const markBoxes = marks.map((m) => ({ x: m.x - m.radius - 2, y: m.y - m.radius - 2, w: 2 * m.radius + 4, h: 2 * m.radius + 4 }));
    const numeralBoxes = milNow?.war ? decorateMarks(recordLayers.marks, marks, milNow.war, milNow.icons ?? {}) : [];
    const named = marks.filter((m) => m.r.seq == null);
    const numberedBoxes = marks.filter((m) => m.r.seq != null).map((m, i) => markBoxes[marks.indexOf(m)]);
    const placed = layoutLabels(recordLayers.labels, defs, { marks: named, routes: drawnRoutes, rivers, zones: [...zones, ...numeralBoxes, ...numberedBoxes, ...forceBoxes], frame, width: Math.max(W, 1920), measure, maxPlaces: lesson?.maxPlaces ?? 10, apart: APART });
    const boxes = placed.filter((p) => p.box).map((p) => p.box);
    // A lesson inset draws the same events and movements in its own projection, numerals included, names left to
    // the main map's list (the inset is small; its marks say which event is which through their numbers).
    for (const v of insets.filter((i) => i.rec)) {
      const [ix, iy, iw, ih] = v.box;
      const inInset = (p) => { if (p.lon == null) return false; const xy = v.proj([p.lon, p.lat]); return xy && xy[0] >= ix && xy[0] <= ix + iw && xy[1] >= iy && xy[1] <= iy + ih; };
      const im = drawMarks(v.rec.marks, records.points.filter(inInset), v.proj);
      if (milNow?.war) { decorateMarks(v.rec.marks, im, milNow.war, milNow.icons ?? {}); drawForceMarks(v.rec.forces, milNow.positions ?? [], v.proj, { icons: milNow.icons ?? {}, checks: milNow.checks ?? {}, box: v.box }); }
      const pts = records.points.filter((p) => p.shape && p.lon != null).map((p) => ({ xy: v.proj([p.lon, p.lat]), r: (MARK_RADIUS[p.shape] ?? 6) + 2 })).filter((m) => m.xy && Number.isFinite(m.xy[0]));
      drawRoutes(v.rec.routes, records.routes, v.proj, [], (qid, coord) => { const xy = coord ? v.proj(coord) : null; const near = xy && pts.find((m) => Math.hypot(m.xy[0] - xy[0], m.xy[1] - xy[1]) < 6); return near ? near.r : 0; });
    }
    return { marks, routes: drawnRoutes, rivers, placed, zones: [...boxes, ...markBoxes, ...numeralBoxes, ...forceBoxes], lines: drawnRoutes.map((d) => d.samples) };
  }

  // ---------- the Military layer's computed lines (src/military/lines.js) ----------
  // A side's land on a date: the alive polygons whose keys match any of its members' states (membership dates are
  // not asked here: a ghost border wants the border before the war began). Level-2 polygons where there are any,
  // so a country's own edge is sorted once, not once per province.
  let landMask = null;
  const maskCache = new Map(), linesCache = new Map();
  function sideFeatures(mil, sideId, on, dataRef) {
    const wheres = new Set(mil.members.filter((m) => m.side === sideId).map((m) => slug(m.where)));
    const alive = [...aliveNB(dataRef, on), ...aliveOHM(dataRef, on)];
    const mine = alive.filter((it) => { const pw = it.src === 'ohm' ? powerAt(it.p, on) : it.p.power; const keys = itemKeys(it, { power: pw, powers, twins: lesson?.twins }); return [...keys].some((k) => wheres.has(k)); });
    const top = mine.filter((it) => it.src === 'ohm' && it.p.lvl === 2);
    return { all: mine.map((it) => it.f), top: (top.length ? top : mine).map((it) => it.f) };
  }
  function maskOf(mil, sideId, on, dataRef) {
    const key = `${sideId}|${on}`;
    if (!maskCache.has(key)) maskCache.set(key, rasterLand(projection, { type: 'FeatureCollection', features: sideFeatures(mil, sideId, on, dataRef).all }, W, H, 3));
    return maskCache.get(key);
  }
  // every state's land on a date (any polygon alive), so a lagoon no polygon covers reads as sea
  function anyMask(on, dataRef) {
    const key = `any|${on}`;
    if (!maskCache.has(key)) maskCache.set(key, rasterLand(projection, { type: 'FeatureCollection', features: [...aliveNB(dataRef, on), ...aliveOHM(dataRef, on)].map((it) => it.f) }, W, H, 3));
    return maskCache.get(key);
  }
  function computeLines(mil, date, dataRef) {
    const specs = linesOn(mil.war, date);
    if (!specs.length) return [];
    landMask ??= land1 ?? rasterLand(projection, land, W, H, 3);
    const out = [];
    for (const spec of specs) {
      const on = spec.on ? warInt(spec.on) : date;
      const key = `${spec.id}|${on}|${mil.war.id}`;
      if (!linesCache.has(key)) {
        const holder = spec.coast_of ?? spec.border_of;
        // a blockade follows every polygon of the side (a province may reach the barrier islands its country's
        // polygon stops short of), and runs that retrace one another are dropped; a border takes the country's own edge
        const sf = sideFeatures(mil, holder, on, dataRef);
        const feats = spec.kind === 'blockade' ? sf.all : sf.top;
        const masks = { land: landMask.isLand, other: spec.against ? maskOf(mil, spec.against, on, dataRef).isLand : null, any: spec.kind === 'blockade' ? anyMask(on, dataRef).isLand : null };
        let runs = [];
        for (const f of feats) runs.push(...(spec.kind === 'blockade' ? blockadeRuns(f, projection, masks, { window: spec.window ?? null, box: main.box }) : borderRuns(f, projection, masks, { box: main.box })));
        linesCache.set(key, dedupeRuns(runs));
      }
      const runs = linesCache.get(key);
      const side = mil.war.sides.find((s) => s.id === spec.side);
      out.push({ ...spec, color: side?.color ?? null, runs, length_px: runsLength(runs), on_date: on, polygons: sideFeatures(mil, spec.coast_of ?? spec.border_of, on, dataRef).top.length });
    }
    return out.filter((l) => l.runs.length);
  }

  // Each named river as one line on the sheet: its Natural Earth pieces joined end to end, projected, cut to the
  // map, the longest stretch kept for the name. → [{ id, name, samples, found }]; a name not in the data is found: 0.
  function namedRiverLines() {
    const pool = fine ?? rivers;
    const [vx, vy, vw, vh] = main.box;
    const inside = (p) => p && p[0] >= vx + 2 && p[0] <= vx + vw - 2 && p[1] >= vy + 2 && p[1] <= vy + vh - 2;
    return (lesson?.rivers ?? []).map((name) => {
      const k = slug(name);
      const feats = pool.filter((f) => riverNames(f).includes(k));
      const lines = joinLines(feats.flatMap((f) => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.type === 'MultiLineString' ? f.geometry.coordinates : [])));
      let best = [];
      for (const line of lines) {
        let run = [];
        for (const c of line) {
          const p = projection(c);
          if (inside(p)) run.push(p);
          else { if (pathLength(run) > pathLength(best)) best = run; run = []; }
        }
        if (pathLength(run) > pathLength(best)) best = run;
      }
      const label = feats[0]?.properties.name ?? name;
      // the name follows a smoothed copy of the line (a river meanders; letters set along every bend would collide)
      return { id: k, name: label, asked: name, samples: smoothLine(best), found: feats.length };
    });
  }

  // The frame's own box on the sheet (the sheet may show more on either side of it): what "inside the frame" means for
  // the Diff list and the packing slip.
  let regionPath = null;
  function frameRegion() {
    if (regionPath) return regionPath;
    const [[a, b], [c, e]] = d3.geoPath(projection).bounds(extentPolygon(lesson.frame.box, 0.5));
    const r = [[Math.max(a, x0), Math.max(b, y0)], [Math.min(c, x1), Math.min(e, y1)]];
    const p = buildProjection({ ...lesson.frame.projection }).scale(projection.scale()).translate(projection.translate());
    if (projection.center && p.center) p.center(projection.center());
    if (projection.rotate && p.rotate) p.rotate(projection.rotate());
    if (projection.parallels && p.parallels) p.parallels(projection.parallels());
    p.clipExtent(r);
    regionPath = { path: d3.geoPath(p), rect: { x: r[0][0], y: r[0][1], w: r[1][0] - r[0][0], h: r[1][1] - r[0][1] } };
    return regionPath;
  }
  // Inside the frame: some 150 px² of the polygon lies in the frame's box (a sliver along the edge does not count).
  function inFrame(f) {
    if (!framed) return true;
    return frameRegion().path.area(f) >= 150;
  }
  // Under a highlight, does this polygon belong to something lit on either date?
  function litFeature(data, a, b) {
    const byF = new WeakMap();
    for (const it of [...data.nb, ...data.ohm]) byF.set(it.f, it);
    return (f) => {
      const it = byF.get(f);
      if (!it) return true;
      const powerA = it.src === 'ohm' ? powerAt(it.p, a) : it.p.power, powerB = it.src === 'ohm' ? powerAt(it.p, b) : it.p.power;
      return !!(lesson.highlight.has(itemKeys(it, { power: powerA, powers, twins: lesson.twins })) || lesson.highlight.has(itemKeys(it, { power: powerB, powers, twins: lesson.twins })));
    };
  }
  // Does a polygon run past the edge of the map (cut by the frame)?
  function cutByFrame(f) {
    const v = main;
    const [[a, b], [c, e]] = v.path.bounds(f);
    if (!Number.isFinite(a)) return false;
    const [vx, vy, vw, vh] = v.box;
    if (a > vx + 1 && b > vy + 1 && c < vx + vw - 1 && e < vy + vh - 1) return false; // wholly inside, clear of the edge
    const free = d3.geoPath(unclipped()).area(f);
    return free > v.path.area(f) + 1;
  }
  let freeProj = null;
  function unclipped() {
    if (freeProj) return freeProj;
    const spec = framed ? lesson.frame.projection : { projection: stage.projection };
    freeProj = buildProjection(spec).scale(projection.scale()).translate(projection.translate());
    if (projection.center && freeProj.center) freeProj.center(projection.center());
    if (projection.rotate && freeProj.rotate) freeProj.rotate(projection.rotate());
    if (projection.parallels && freeProj.parallels) freeProj.parallels(projection.parallels());
    return freeProj;
  }

  // The stage's water names are text too: their boxes are reserved (measured once, after the first layout).
  let stageBoxes = null;
  function stageLabelZones() {
    if (stageBoxes) return stageBoxes;
    const out = [];
    main.stageLabels.selectAll('text').each(function () { try { const b = this.getBBox(); if (b.width > 0) out.push({ x: b.x, y: b.y, w: b.width, h: b.height }); } catch { /* not laid out */ } });
    if (out.length) stageBoxes = out;
    return out;
  }

  // "The United States" and "1783 → 1853" share the cartouche's line: the title steps down a size when they meet.
  function fitTitle() {
    const t = root.select('.cartouche .map-title').style('font-size', null);
    try {
      const tb = t.node().getBBox(), yb = root.select('.cartouche .year').node().getBBox();
      const room = yb.x - 14 - tb.x;
      if (tb.width > room && room > 40) t.style('font-size', `${(parseFloat(getComputedStyle(t.node()).fontSize) * room / tb.width).toFixed(1)}px`);
    } catch { /* not laid out */ }
  }

  function reservedZones(v) {
    if (v.id !== 'main') return [];
    const z = [cartouche.box(), legend.box(), { x: x0, y: y1 - 14, w: x1 - x0, h: 40 }, ...stageLabelZones(), ...(milListBox ? [milListBox] : [])];
    for (const i of insets) { const [bx, by, bw, bh] = i.box; z.push({ x: bx - 4, y: by - 4, w: bw + 8, h: bh + 8 }); }
    return z;
  }

  return {
    projection, views, legend, cartouche, strip,
    show,
    showDiff,
    // Diff: "1783 → 1853" in the cartouche, the two days under it when either is a day, the range on the strip.
    setRange(a, b, { exactA = false, exactB = false } = {}) {
      cartouche.setRange({ year: yearOf(a) }, { year: yearOf(b) });
      const day = (d, exact) => (exact || !isEndOfYear(d) ? longDate(d) : String(yearOf(d)));
      root.select('.cartouche .base-note').text(!exactA && !exactB && isEndOfYear(a) && isEndOfYear(b) ? 'each as of 31 December' : `${day(a, exactA)} → ${day(b, exactB)}`);
      strip.setRange(yearOf(a), yearOf(b));
      setWaterNames(b);
      fitTitle();
    },
    setDate(date, { exact = false } = {}) {
      setWaterNames(date);
      cartouche.setYear(yearOf(date));
      // A bare year means its last day; the current year can only be shown as of today.
      root.select('.cartouche .base-note').text(exact ? longDate(date) : `as of ${longDate(date).replace(/ -?\d+$/, '')}`);
      strip.setYear(yearOf(date));
      fitTitle();
    },
    get current() { return current; },
    // Lesson maps: the records an order points at (validated rows with coordinates), drawn from the next redraw.
    setRecords({ points = [], routes = [] } = {}) { records = { points, routes }; currentKey = null; },
    // resolves once a reshaded relief is on the sheet (a picture taken earlier would lack it)
    reliefReady,
    // pan and zoom (src/us/main.js): the layer that slides, the projection on the sheet, and its scale at a place
    geo: { node: main.g.node(), projection, inner: [x0, y0, x1, y1], framed, pxPerKmAt: (ll) => pxPerKmAt(projection, ll), insets: insets.map((v) => v.g.node().parentNode) },
    sheet: { w: W, h: H },
    frameInfo: () => ({ framed, resized, legend: legendSpec, waterLabels: stageLabelList.map((l) => l.text), region: framed ? frameRegion().rect : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, inner: { x0, y0, x1, y1 }, insets: insets.map((i) => i.box) }),
    inFrame,
    cutByFrame,
    shows: (f) => views.some((v) => v.shows(f)),
    partiesOf,
    isPowerKey,
  };
}

// ---------------------------------------------------------------- lesson-map geometry (no state)
// A frame's box fitted to the sheet in its projection (src/us/frames.js), with a small margin so its edges show.
function fitFrame(spec, box, [[ax, ay], [bx, by]], view = null) {
  const p = buildProjection(spec);
  if (view) {
    // a free view (pan and zoom): a center on the middle of the sheet and a scale, not a box to fit
    p.scale(1000).translate([0, 0]);
    p.scale((1000 * view.pxPerKm) / pxPerKmAt(p, view.center));
    const c = p(view.center);
    p.translate([(ax + bx) / 2 - c[0], (ay + by) / 2 - c[1]]);
    // Only what lies near the sheet is worked: a circle about the center, a little wider than the sheet's corners.
    // (d3 refines every line to the scale before it cuts to the frame; at a battlefield's scale the whole world's
    // coast would be refined to the meter.)
    const reachKm = Math.hypot(bx - ax, by - ay) / 2 / view.pxPerKm;
    if (p.clipAngle) p.clipAngle(Math.min(90, Math.max(1.5, (reachKm / 111.195) * 1.2 + 0.5)));
    return p;
  }
  p.fitExtent([[ax + 10, ay + 10], [bx - 10, by - 10]], extentPolygon(box, 0.5));
  return p;
}
// The continent on a sheet of another shape: the stage's own projection, fitted, and slid right into the spare width
// as the 1920×1080 sheet is (stage.shift, at most), leaving the Pacific margin to Alaska and Hawaii.
function fitContinent(stage, inner) {
  const p = makeProjection({ ...stage, shift: null }, inner);
  const [[bx0], [bx1]] = d3.geoPath(p).bounds(extentPolygon(stage.extent));
  const spare = (inner[1][0] - inner[0][0]) - (bx1 - bx0);
  const dx = Math.max(0, Math.min(stage.shift?.[0] ?? 0, spare / 2));
  const [tx, ty] = p.translate();
  p.translate([tx + dx, ty]);
  return p;
}
// Land on the sheet as a coarse mask (one cell per 4 px), for choosing where the legend and the water names go.
function rasterLand(proj, land, w, h, k = 4) {
  const cw = Math.ceil(w / k), ch = Math.ceil(h / k);
  const canvas = globalThis.document?.createElement('canvas');
  const ctx = canvas?.getContext?.('2d', { willReadFrequently: true });
  if (!ctx) return { isLand: () => false, share: () => 0 };
  canvas.width = cw; canvas.height = ch;
  ctx.scale(1 / k, 1 / k);
  ctx.beginPath(); d3.geoPath(proj, ctx)(land); ctx.fill();
  const px = ctx.getImageData(0, 0, cw, ch).data;
  const at = (x, y) => { const i = Math.floor(y / k) * cw + Math.floor(x / k); return x >= 0 && y >= 0 && x < w && y < h && px[i * 4 + 3] > 127; };
  return {
    isLand: at,
    share({ x, y, w: rw, h: rh }) {
      let n = 0, l = 0;
      for (let yy = y; yy < y + rh; yy += k) for (let xx = x; xx < x + rw; xx += k) { n++; if (at(xx, yy)) l++; }
      return n ? l / n : 0;
    },
  };
}
// The legend's corner in a frame: whichever right-hand corner holds less land (open water is where a key belongs).
function quieterCorner(mask, { x1, y0, y1 }) {
  const w = 236, h = 260;
  const top = { x: x1 - 22 - w, y: y0 + 22, w, h }, bottom = { x: x1 - 22 - w, y: y1 - 22 - h, w, h };
  return mask.share(top) + 0.05 < mask.share(bottom) ? 'top-right' : 'bottom-right';
}
// Water names in a frame: each along its own parallel, on the longest stretch of open water inside the frame and
// clear of the cartouche and the legend's corner; left off where no stretch is long enough for the name.
// near (a free view, pan and zoom): the open stretch must reach within that many degrees of the name's own place,
// or the name is left off (the Atlantic's name, slid west along its parallel, would land in the Gulf of Mexico).
function frameWaterLabels(labels, proj, { x0, y0, x1, y1 }, mask, legendSpec, measure, { near = null } = {}) {
  const keep = [
    { x: x0, y: y1 - 22 - 150, w: 22 + 380 + 20, h: 150 + 22 }, // the cartouche
    // (a lesson map's legend widens to its longest line, up to 340 px: src/render/legend.js)
    legendSpec.anchor === 'top-right' ? { x: x1 - 22 - 340 - 16, y: y0, w: 340 + 38, h: 300 } : { x: x1 - 22 - 340 - 16, y: y1 - 22 - 300, w: 340 + 38, h: 322 },
  ];
  const blocked = (p) => keep.some((r) => p[0] >= r.x && p[0] <= r.x + r.w && p[1] >= r.y - 10 && p[1] <= r.y + r.h + 10);
  const out = [], seen = new Set();
  for (const l of labels) {
    if (seen.has(l.text)) continue;
    const names = [l.text, ...(l.names ?? []).map((n) => n.text)];
    const need = Math.max(...names.map((t) => measure(t, { size: 16, italic: true }) + t.length * 1.6)) + 30;
    // (only near its own place: a gulf's name slid far enough along its parallel lands in another gulf; its own
    // parallel first, then a degree or two either side when the cartouche or legend leaves no room on it)
    const reach = (l.span ?? 20) / 2 + 4;
    let found = null;
    for (const dLat of [0, 1, -1, 2, -2]) {
      const lat = l.lat + dLat;
      let best = null, run = null;
      const close = () => { if (run && (!best || run.len > best.len)) best = run; run = null; };
      for (let lon = l.lon - reach; lon <= l.lon + reach; lon += 0.2) {
        const p = proj([lon, lat]);
        const ok = p && p[0] > x0 + 8 && p[0] < x1 - 8 && p[1] > y0 + 14 && p[1] < y1 - 30
          && !mask.isLand(p[0], p[1]) && !mask.isLand(p[0], p[1] - 9) && !mask.isLand(p[0], p[1] + 9) && !blocked(p);
        if (!ok) { close(); continue; }
        if (!run) run = { a: lon, b: lon, pa: p, pb: p, len: 0 };
        else { run.len += Math.hypot(p[0] - run.pb[0], p[1] - run.pb[1]); run.b = lon; run.pb = p; }
      }
      close();
      if (best && best.len >= need && (near == null || (best.a - near <= l.lon && l.lon <= best.b + near))) { found = { ...best, lat }; break; }
    }
    if (!found) continue;
    seen.add(l.text);
    out.push({ ...l, lat: found.lat, lon: (found.a + found.b) / 2, span: Math.max(2, found.b - found.a) });
  }
  return out;
}
// River pieces joined end to end where they meet (Natural Earth splits a river where its rank changes).
function joinLines(lines) {
  const key = ([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`;
  const pool = lines.filter((l) => l.length > 1).map((l) => [...l]);
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < pool.length; i++) for (let j = 0; j < pool.length; j++) {
      if (i === j) continue;
      const a = pool[i], b = pool[j];
      let joined = null;
      if (key(a.at(-1)) === key(b[0])) joined = [...a, ...b.slice(1)];
      else if (key(a.at(-1)) === key(b.at(-1))) joined = [...a, ...[...b].reverse().slice(1)];
      else if (key(a[0]) === key(b.at(-1))) joined = [...b, ...a.slice(1)];
      else if (key(a[0]) === key(b[0])) joined = [...[...b].reverse(), ...a.slice(1)];
      if (joined) { pool.splice(Math.max(i, j), 1); pool.splice(Math.min(i, j), 1, joined); merged = true; break outer; }
    }
  }
  return pool;
}
const pathLength = (s) => s.reduce((L, p, i) => (i ? L + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0), 0);
// A line resampled every 4 px and averaged over 40 px either way: the guide a river's name is set along.
function smoothLine(s, step = 4, reach = 10) {
  if (s.length < 3) return s;
  const even = [s[0]];
  let carry = 0;
  for (let i = 1; i < s.length; i++) {
    const [ax, ay] = s[i - 1], [bx, by] = s[i];
    const seg = Math.hypot(bx - ax, by - ay);
    let t = step - carry;
    while (t <= seg) { even.push([ax + ((bx - ax) * t) / seg, ay + ((by - ay) * t) / seg]); t += step; }
    carry = seg - (t - step);
  }
  even.push(s[s.length - 1]);
  return even.map((_, i) => {
    const a = Math.max(0, i - reach), b = Math.min(even.length - 1, i + reach);
    let x = 0, y = 0;
    for (let j = a; j <= b; j++) { x += even[j][0]; y += even[j][1]; }
    return [x / (b - a + 1), y / (b - a + 1)];
  });
}

// A topology's mesh without some arcs: meshArcs' lines, split wherever a dropped arc falls (drawBorders).
function meshWithout(topology, object, filter, drop) {
  const lines = [];
  for (const line of meshArcs(topology, object, filter).arcs) {
    let run = [];
    for (const a of line) {
      if (drop.has(a < 0 ? ~a : a)) { if (run.length) lines.push(run); run = []; } else run.push(a);
    }
    if (run.length) lines.push(run);
  }
  return feature(topology, { type: 'MultiLineString', arcs: lines }).geometry;
}

// ---------------------------------------------------------------- looks and legend
function categoryLook(powers, key) {
  const c = powers.categories[key] ?? powers.categories.other;
  if (c.pattern) return { pattern: c.pattern, label: c.label };
  if (c.fill) return { fill: c.fill, label: c.label, cat: key };
  return { fill: null, label: null };
}
// The classroom preset's short key (owner's review, 2026-11-10): the sides, occupied land, how a battle and a place
// taken are marked, the armies and their retreat, and the width key when widths mean numbers. Everything else the
// full map's key explains (the numbered list, force frames and icons, computed lines, borders, Native nations,
// certainty) is left to the full map and the slip.
function shortKey(leg, mil) {
  if (mil?.battle && leg?.legend) return { ...leg, legend: leg.legend.filter((r) => r.label !== 'Documented border') };
  if (mil?.preset !== 'classroom' || !leg?.legend) return leg;
  const keep = (r) => r.role === 'side' || r.role === 'occupied' || r.role === 'view' || r.role === 'width'
    || (r.role === 'event' && (r.swatch === 'shape' || r.swatch === 'massacre'))
    || (r.swatch === 'route' && (/: an armed force$/.test(r.label) || /^Retreat/.test(r.label)));
  return { ...leg, legend: leg.legend.filter(keep) };
}
// (an occupied polygon is present twice: as its owner's fill, and as the occupier's hatch)
const addPresent = (present, l) => { present.add(lookKey(l)); if (l.occ) present.add(`occ:side-${l.occ}:${l.occBy}`); };
const lookKey = (l) => (l.seq ? `seq:${l.seq}` : l.pop ? `pop:${l.pop}` : l.land ? `land:${l.land}` : l.pattern ? `pat:${l.pattern}` : l.fill ? `fill:${l.fill}:${l.cat ?? l.label}` : 'none');

function labelFor(cat, date) {
  if (!cat.labels) return cat.label;
  let out = cat.label;
  for (const [from, text] of cat.labels) if (date >= from) out = text;
  return out;
}

function legendFor(powers, tracker, trackerId, present, date, anyOHM, pop = null) {
  const rows = [];
  if (trackerId === 'population') {
    const labels = densityLabels();
    for (let k = 1; k <= 5; k++) if (present.has(`pop:${k}`)) rows.push({ swatch: 'fill', key: `pop-${k}`, label: `${labels[k - 1]} per 1,000 km²` });
    if (pop?.full) rows.push({ swatch: 'none', label: `${pop.census.year} census: ${fmt(pop.census.us)}` });
    else rows.push({ swatch: 'none', label: pop?.census ? `${pop.census.year} census: most not counted` : 'No census count yet' });
    // the legend is narrow: a national estimate takes two lines, where and when, then how many
    for (const e of pop?.estimates.national ?? []) {
      rows.push({ swatch: 'none', label: `${e.place}:` });
      rows.push({ swatch: 'none', label: `${e.label} (${e.grade === 'uncertain' ? 'estimates' : 'estimate'})` });
    }
  }
  if (trackerId === 'nations') {
    for (const [key, c] of Object.entries(powers.categories)) {
      if (c.fill && present.has(`fill:${c.fill}:${key}`)) rows.push({ swatch: 'fill', key: c.fill, label: labelFor(c, date) });
    }
  } else if (trackerId === 'states') {
    const seen = new Set();
    for (const t of Object.values(tracker.types)) {
      if (!t.fill || seen.has(t.label)) continue;
      if (present.has(`fill:${t.fill}:${t.label}`)) { rows.push({ swatch: 'fill', key: t.fill, label: t.label }); seen.add(t.label); }
    }
  } else if (trackerId === 'cessions') {
    tracker.periods.forEach(([, , label], i) => { if (present.has(`seq:${i + 1}`)) rows.push({ swatch: 'fill', key: `seq-${i + 1}`, label: `Ceded ${label}` }); });
    if (!rows.length) rows.push({ swatch: 'fill', key: 'seq-1', label: 'No cession yet (first: 1784)' });
    if (present.has('land:treaty')) rows.push({ swatch: 'fill', key: 'land-treaty', label: 'Held under U.S. treaty' });
    if (present.has('treatyX')) rows.push({ swatch: 'hatch', label: 'Claimed by two nations' });
    if (present.has('land:held')) rows.push({ swatch: 'fill', key: 'land', label: 'Native land today' });
    if (present.has('land:hawaiian')) rows.push({ swatch: 'fill', key: 'land-hawaiian', label: 'Hawaiian home lands' });
    if (present.has('icc')) rows.push({ swatch: 'line', style: 'icc', label: 'Original territory, as judged' });
  } else if (trackerId === 'military') {
    // the sides of the war shown, each with its members when there are several (src/military/wars.js)
    const milRows = militaryLegend(tracker.mil?.war ?? null, tracker.mil?.members ?? [], present, date, tracker.mil?.names ?? 'both', tracker.mil?.view ?? null);
    // (a battle frame has no side fills: the sides are named by their lines and forces below, not by an empty member row)
    rows.push(...(tracker.mil?.battle ? milRows.filter((r) => r.role !== 'name' && !/^No member/.test(r.label)) : milRows));
    const icons = tracker.mil?.icons ?? {};
    const withIcon = (r) => (r.swatch === 'icon' ? { ...r, d: icons[r.icon]?.d ?? null } : r);
    rows.push(...eventLegend(tracker.mil?.shown ?? [], tracker.mil?.war ?? null, lineColorOf).map(withIcon));
    rows.push(...forceLegend(tracker.mil?.positions ?? [], tracker.mil?.checks ?? {}, tracker.mil?.tech).map(withIcon));
    for (const l of tracker.mil?.lines ?? []) {
      if (l.kind === 'blockade') rows.push({ swatch: 'line', style: `blockade side-${l.color ?? 'a'}`, label: l.label, role: 'line' });
      else rows.push({ swatch: 'line', style: l.kind === 'ghost' ? 'ghost' : 'treaty', label: l.label, role: 'line' });
    }
  }
  for (const [key, c] of Object.entries(powers.categories)) {
    if (c.pattern && present.has(`pat:${c.pattern}`)) rows.push({ swatch: 'fill', key: c.pattern, label: c.label });
  }
  if (present.has('pat:hatch') && trackerId === 'states' && !rows.some((r) => r.key === 'hatch')) rows.push({ swatch: 'fill', key: 'hatch', label: tracker.types.Other.label });
  if (date >= US_FROM) rows.push({ swatch: 'line', style: 'solid', label: 'Documented border' });
  if (anyOHM && date < US_FROM) rows.push({ swatch: 'line', style: 'dashed', label: 'Approximate border' });
  return { title: trackerId === 'military' ? 'Sides' : tracker.title, legend: rows };
}

// The Diff view's legend: the focus color, the hatch, and the later date's border certainty.
function diffLegendFor(diff, trackerId, { natB, anyOHM }) {
  const ya = yearOf(diff.a), yb = yearOf(diff.b);
  const rows = [];
  if (trackerId === 'cessions') rows.push({ swatch: 'fill', key: 'focus', label: `Ceded ${Math.min(ya, yb)}–${Math.max(ya, yb)}` });
  else if (trackerId === 'electoral') {
    // two elections: a state that voted for another party (or voted at all, newly) is the focus color
    rows.push({ swatch: 'fill', key: 'focus', label: diff.appeared.length ? 'Changed party or first vote' : 'Changed party' });
    if (diff.vanished.length) rows.push({ swatch: 'fill', key: 'hatch', label: 'Voted before, not now' });
    rows.push({ swatch: 'none', label: 'Unshaded: the same party' });
    return { title: `Elections ${ya} → ${yb}`, legend: rows };
  } else {
    rows.push({ swatch: 'fill', key: 'focus', label: trackerId === 'nations' ? 'Appeared or changed hands' : 'Appeared' });
    rows.push({ swatch: 'fill', key: 'hatch', label: 'Vanished' });
  }
  if (natB) rows.push({ swatch: 'fill', key: 'stipple', label: 'Native nations (approximate)' });
  if (diff.b >= US_FROM) rows.push({ swatch: 'line', style: 'solid', label: 'Documented border' });
  const dashedGone = diff.a < US_FROM && diff.vanished.some((u) => u.power !== 'native' && u.a.some((it) => it.src === 'ohm'));
  if ((anyOHM && diff.b < US_FROM) || dashedGone) rows.push({ swatch: 'line', style: 'dashed', label: 'Approximate border' });
  return { title: `Change ${ya} → ${yb}`, legend: rows };
}

// The list beside the legend. States: what was admitted and created, in order, with Newberry's years. Nations:
// the largest units first, provinces folded into the country that holds them. Cessions: the largest first.
function listSections(diff, trackerId) {
  const yr = (d) => (d ? String(yearOf(d)) : '');
  const named = (list) => list.filter((u) => !u.within);
  const provinces = (u) => (u.inner ? `${u.inner} province${u.inner > 1 ? 's' : ''}` : '');
  const sec = [];
  if (trackerId === 'states') {
    if (diff.beforeRecord) return [{ title: 'States and territories', cls: 'persisted', items: [], count: null, empty: 'The record begins on 3 September 1783.' }];
    const k = byKind(diff.appeared);
    // Newberry's full name, or its own shorter one ("Erie Tri. Unorg. FT") when the full one cannot fit a line.
    const names = (u) => [u.label, (u.b ?? u.a)?.[0]?.p.name];
    const flow = (title, cls, list, year) => { if (list.length) sec.push({ title, cls, flow: true, items: list.map((u) => ({ text: names(u), year: year(u) })) }); };
    flow('States admitted', 'appeared', k.state, (u) => yr(u.since));
    flow('Territories created', 'appeared', k.territory, (u) => yr(u.since));
    flow('Other areas', 'appeared', k.other, (u) => yr(u.since));
    flow('Vanished', 'vanished', [...diff.vanished].sort((p, q) => (p.until ?? 0) - (q.until ?? 0)), (u) => yr(u.until));
    const reshaped = diff.persisted.filter((u) => u.reshaped).length;
    if (diff.persisted.length) sec.push({ title: 'Persisted', cls: 'persisted', flow: true, note: reshaped ? `${reshaped} with new borders` : '', items: diff.persisted.map((u) => ({ text: names(u) })), maxLines: 4 });
  } else if (trackerId === 'electoral') {
    // Two elections: the states that changed party, grouped by direction ("Democratic → Republican"), the largest
    // group first; then first votes, votes again, votes lost, and how many stayed with their party.
    const groups = new Map();
    for (const u of diff.changed) { const g = groups.get(u.note) ?? []; g.push(u); groups.set(u.note, g); }
    for (const [dir, list] of [...groups].sort((p, q) => q[1].length - p[1].length)) {
      sec.push({ title: dir, cls: 'appeared', flow: true, maxLines: 4, items: list.map((u) => ({ text: [u.label] })) });
    }
    const first = diff.appeared.filter((u) => !u.again), again = diff.appeared.filter((u) => u.again);
    if (first.length) sec.push({ title: 'First vote', cls: 'appeared', flow: true, maxLines: 3, items: first.map((u) => ({ text: [u.label] })) });
    if (again.length) sec.push({ title: 'Voted again', cls: 'appeared', flow: true, maxLines: 3, items: again.map((u) => ({ text: [u.label] })) });
    if (diff.vanished.length) sec.push({ title: 'Cast no vote', cls: 'vanished', flow: true, maxLines: 3, items: diff.vanished.map((u) => ({ text: [u.label] })) });
    sec.push({ title: 'Same party', cls: 'persisted', items: [], count: diff.persisted.filter((u) => u.b.length && u.power).length });
  } else if (trackerId === 'cessions') {
    sec.push({ title: 'Ceded', cls: 'appeared', items: diff.appeared.map((u) => ({ text: [u.label], year: yr(u.since) })), small: diff.small.appeared, max: 9 });
    const before = diff.persisted.length + diff.small.persisted;
    if (before) sec.push({ title: `Ceded by ${yearOf(Math.min(diff.a, diff.b))}`, cls: 'persisted', items: [], count: before });
  } else {
    const cap = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);
    const line = (u, note) => ({ text: [u.label, cap(shortName(u.label))], note });
    const add = (title, cls, list, small, note, max) => { const l = named(list); if (l.length || small) sec.push({ title, cls, items: l.map((u) => line(u, note(u))), small, max }); };
    add('Appeared', 'appeared', diff.appeared, diff.small.appeared, provinces, 7);
    add('Changed hands', 'appeared', diff.changed, diff.small.changed, (u) => u.note, 5);
    add('Vanished', 'vanished', diff.vanished, diff.small.vanished, provinces, 7);
    add('Persisted', 'persisted', diff.persisted, diff.small.persisted, (u) => (u.was ? `was ${u.was}` : provinces(u)), 5);
  }
  if (!sec.length) sec.push({ title: 'No change in the record', cls: 'persisted', items: [], count: null });
  return sec;
}

function hoverText(it, date) {
  const p = it.p;
  if (it.src === 'nbx') return `Claimed by both ${p.an} and ${p.bn} · ${longDate(p.ds)} – ${longDate(p.de)}`;
  if (it.src === 'usmx') return `Claimed by both ${p.an} and ${p.bn} (${p.parties[1]}) · ${longDate(p.ds)} – ${longDate(p.de)}`;
  if (it.src === 'hb') return `${p.name} · Native homeland, approximate (historical-basemaps, ${p.y} map)`;
  if (it.src === 'ohm' && p.lvl === 'x') return `Overlapping claims: ${p.name} · ${longDate(p.s)} – ${longDate(p.e)}`;
  if (it.src === 'royce') return `${p.tribe ?? 'Cession'} · Royce area ${p.n} · ${longDate(p.d)}`;
  if (it.src === 'aiannh') return `${p.name} · Census Bureau boundaries, 2025`;
  if (it.src === 'icc') return `${p.tribe} · original territory as established before the Indian Claims Commission (map of 1978)`;
  if (it.src === 'treaty') return `${p.name} · land held under U.S. treaty, ${longDate(p.s)} – ${longDate(p.e)}`;
  if (it.src === 'treatyX') return `Claimed by two nations (${p.a}, ${p.b}): the United States bought this land from both`;
  if (it.src === 'newberry' && it.popUnit) return `${nbName(p)} · ${fmt(it.popUnit.aian)} American Indians counted in ${it.popUnit.year} (${pct(it.popUnit.share)} of the U.S.)`;
  if (it.src === 'newberry') return `${nbName(p)} (${p.type}) · ${longDate(p.s)} – ${longDate(p.e)}`;
  return `${p.name}${p.local ? ` (${p.local})` : ''} · ${p.start_raw ?? ''}${p.end_raw ? ` – ${p.end_raw}` : ''}`;
}

// ---------------------------------------------------------------- polity labels
// Largest polygon of each named thing, a name that fits inside it (full, short, abbreviation), placed only where
// it overlaps no other label and none of the apparatus. Bigger first; the U.S. before its neighbours. Under an order's
// highlight the lit names come first and the rest stay, paler, as context; `lines` (an order's routes) are kept clear.
// → the names placed.
function placePolityLabels(layer, v, items, zones, measure, date, trackerId, { covered = () => false, nolabel = [], lines = [] } = {}) {
  const main = v.id === 'main';
  const silent = (name) => nolabel.some((r) => new RegExp(r.match, 'i').test(name) && (!r.from || date >= r.from) && (!r.to || date < r.to));
  const minSize = main ? 10.5 : 8.5, maxSize = main ? 21 : 12;
  const cands = [];
  const seen = new Map();
  for (const it of items) {
    const p = it.p;
    const isNB = it.src === 'newberry';
    if (!isNB && it.look.pattern !== 'stipple' && it.cat === 'other' && trackerId === 'nations' && !main) continue;
    if (it.src === 'ohm' && (p.lvl === 'x' || silent(p.name))) continue; // overlaps carry a hatch, not a name
    // (occupied land prints the name its occupation row gives it: New Mexico, Mexico City)
    const texts = (it.src === 'usmx' ? [it.look.occName] : [...(it.look?.occName ? [it.look.occName] : []), ...(isNB ? [nbName(p), p.name, p.abbr] : [p.name, shortName(p.name)])]).map(cleanLabel);
    const poly = largestPolygon(it.f);
    if (!poly) continue;
    const [[bx0, by0], [bx1, by1]] = v.path.bounds(poly);
    const w = bx1 - bx0, h = by1 - by0;
    if (!(w > 18 && h > 9)) continue;
    let [cx, cy] = v.path.centroid(poly);
    if (!Number.isFinite(cx)) continue;
    // (occupied land keeps its name even where a U.S. claim lies over it: New Mexico east of the Rio Grande, which Texas claimed)
    if (it.src === 'ohm' && !it.look.pattern && !it.look.occName) {
      const ll = v.proj.invert([cx, cy]);
      if (!ll || covered(it, ll) || !d3.geoContains(poly, ll)) {
        const alt = betterPoint(v, poly, [cx, cy], (q) => !covered(it, q));
        if (!alt) continue;
        [cx, cy] = alt;
      }
    }
    const area = w * h;
    const key = texts[0];
    const prev = seen.get(key);
    if (prev && prev.area >= area) continue;
    // a nation's name, in italic (a Native nation an order did not light keeps its italic name, without the stipple)
    const native = it.look.pattern === 'stipple' || it.src === 'treaty' || (it.lit === false && (it.cat === 'native' || it.src === 'hb'));
    const rank = it.src === 'treaty' ? -1 : isNB ? 0 : native ? 2 : p.lvl === 2 ? 1 : 3;
    seen.set(key, { key, texts: [...new Set(texts.filter(Boolean))], cx, cy, w, h, area, rank: it.look?.occName ? 0.5 : rank, native, isNB, cls: it.diffCls, it, lit: it.lit ? 1 : 0, unlit: it.lit === false, poly, x0: bx0, y0: by0, occ: !!it.look?.occName });
  }
  for (const c of seen.values()) cands.push(c);
  cands.sort((a, b) => b.lit - a.lit || a.rank - b.rank || b.area - a.area);
  let natives = 0;
  const NATIVE_MAX = main ? 28 : 3;

  const placed = [...zones];
  const out = [];
  const [bx, by, bw, bh] = v.box;
  for (const c of cands) {
    let size = Math.max(minSize, Math.min(maxSize, Math.sqrt(c.area) / (main ? 14 : 10)));
    let pick = null;
    // Under the Military layer a name whose middle is taken (a march runs down the Rio Grande through the middle of
    // New Mexico) tries other places inside its polygon before it is given up (owner's review, 2026-11-10).
    const centers = [[c.cx, c.cy]];
    if (trackerId === 'military' && c.poly) {
      for (const [fx, fy] of [[0.5, 0.3], [0.5, 0.7], [0.3, 0.5], [0.7, 0.5], [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7], [0.5, 0.15], [0.5, 0.85]]) {
        const q = [c.x0 + c.w * fx, c.y0 + c.h * fy];
        const ll = v.proj.invert(q);
        if (ll && d3.geoContains(c.poly, ll)) centers.push(q);
      }
      // (occupied land that is a narrow strip on this frame may carry its name just beside it, west or east)
      if (c.occ) { const tw0 = textWidth(measure, c.texts[0], minSize, false); centers.push([c.x0 - tw0 / 2 - 6, c.y0 + c.h * 0.4], [c.x0 + c.w + tw0 / 2 + 6, c.y0 + c.h * 0.4], [c.x0 - tw0 / 2 - 6, c.y0 + c.h * 0.7], [c.x0 + c.w + tw0 / 2 + 6, c.y0 + c.h * 0.7]); }
    }
    for (const [ccx, ccy] of centers) {
      for (const t of c.texts) {
        for (let s = size; s >= minSize; s -= 1.5) {
          const tw = textWidth(measure, t, s, c.native), th = s * 1.05;
          if (tw > c.w * 1.05 && !(c.isNB && tw < 120 && c.w > 24) && !c.occ) continue;
          const box = { x: ccx - tw / 2, y: ccy - th / 2, w: tw, h: th };
          if (box.x < bx + 4 || box.x + box.w > bx + bw - 4 || box.y < by + 4 || box.y + box.h > by + bh - 4) continue;
          if (placed.some((z) => overlaps(z, box, 2))) continue;
          // (small caps are measured, not set: keep a few pixels more from an order's route lines)
          if (lines.length && lines.some((s) => polylineHitsRect(s, box, 6))) continue;
          pick = { t, s, box };
          break;
        }
        if (pick) break;
      }
      if (pick) { c.cx = ccx; c.cy = ccy; break; }
    }
    if (!pick) continue;
    if (c.native && ++natives > NATIVE_MAX) continue;
    placed.push(pick.box);
    out.push({ ...c, text: pick.t, size: pick.s, box: pick.box });
  }
  layer.selectAll('text').data(out).join('text')
    .attr('class', (c) => `label polity${c.native ? ' native' : ''}${c.isNB ? ' us' : ''}${c.cls ? ` ${c.cls}` : ''}${c.unlit ? ' unlit' : ''}`)
    .attr('x', (c) => c.cx).attr('y', (c) => c.cy).attr('font-size', (c) => c.size.toFixed(1))
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
    .text((c) => c.text);
  return out;
}

// A point inside the polygon where test() holds, nearest the centroid, from a 9×9 grid over its projected box.
function betterPoint(v, poly, [cx, cy], test) {
  const [[x0, y0], [x1, y1]] = v.path.bounds(poly);
  let best = null, bd = Infinity;
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
    const p = [x0 + ((x1 - x0) * (i + 0.5)) / 9, y0 + ((y1 - y0) * (j + 0.5)) / 9];
    const ll = v.proj.invert(p);
    if (!ll || !d3.geoContains(poly, ll) || !test(ll)) continue;
    const dd = (p[0] - cx) ** 2 + (p[1] - cy) ** 2;
    if (dd < bd) { bd = dd; best = p; }
  }
  return best;
}

// geoContains with a bounding-box check first (it walks every vertex).
const llBoxes = new WeakMap();
function containsLL(f, [x, y]) {
  let b = llBoxes.get(f);
  if (!b) { b = d3.geoBounds(f); llBoxes.set(f, b); }
  const [[x0, y0], [x1, y1]] = b;
  if (y < y0 || y > y1) return false;
  if (x0 <= x1 ? (x < x0 || x > x1) : (x < x0 && x > x1)) return false;
  return d3.geoContains(f, [x, y]);
}

const SHORT = /^(Crown Colony of |Colony of the |Colony of |Province of |Colonie d'|Colonie de |Captaincy General of |Viceroyalty of |Kingdom of |Republic of |Dominion of |Commission Government of |Settlement of )/;
const shortName = (n) => (n && SHORT.test(n) ? n.replace(SHORT, '') : null);

function textWidth(measure, text, size, italic) {
  // small caps with 0.12em tracking: measure the capitals at small-cap height, then add the tracking
  if (italic) return measure(text, { size, italic: true });
  return measure(text.toUpperCase(), { size: size * 0.8, bold: true }) + text.length * size * 0.12;
}
const overlaps = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

function largestPolygon(f) {
  const g = f.geometry;
  if (!g) return null;
  if (g.type === 'Polygon') return g;
  let best = null, bestA = -1;
  for (const coords of g.coordinates) {
    const poly = { type: 'Polygon', coordinates: coords };
    const a = d3.geoArea(poly);
    if (a > bestA) { bestA = a; best = poly; }
  }
  return best;
}

function extentPolygon({ west, south, east, north }, step = 1) {
  const ring = [];
  for (let x = west; x < east; x += step) ring.push([x, north]);
  for (let y = north; y > south; y -= step) ring.push([east, y]);
  for (let x = east; x > west; x -= step) ring.push([x, south]);
  for (let y = south; y < north; y += step) ring.push([west, y]);
  ring.push(ring[0]);
  return { type: 'Polygon', coordinates: [ring] };
}

// ---------------------------------------------------------------- patterns
function patternDefs(defs) {
  const hatch = (id, angle, cls) => defs.append('pattern').attr('id', id).attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 8).attr('height', 8).attr('patternTransform', `rotate(${angle})`)
    .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 8).attr('class', cls);
  hatch('hatch-rust', 45, 'hatch-line');
  const cross = defs.append('pattern').attr('id', 'crosshatch-rust').attr('patternUnits', 'userSpaceOnUse').attr('width', 9).attr('height', 9).attr('patternTransform', 'rotate(45)');
  cross.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 9).attr('class', 'hatch-line strong');
  cross.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 9).attr('y2', 0).attr('class', 'hatch-line strong');
  const dots = defs.append('pattern').attr('id', 'stipple-ink').attr('patternUnits', 'userSpaceOnUse').attr('width', 7).attr('height', 7);
  dots.append('circle').attr('cx', 1.8).attr('cy', 1.8).attr('r', 1.05).attr('class', 'stipple-dot');
  dots.append('circle').attr('cx', 5.3).attr('cy', 5.3).attr('r', 1.05).attr('class', 'stipple-dot');
  // "sphere" certainty: a soft edge, never a crisp border
  defs.append('filter').attr('id', 'sphere-soft').attr('x', '-5%').attr('y', '-5%').attr('width', '110%').attr('height', '110%')
    .append('feGaussianBlur').attr('stdDeviation', 3.5);
}

// ---------------------------------------------------------------- the timeline strip (continuous)
// The bottom edge of the frame: 1492 to the present, decades ticked, half-centuries named. Click or drag to
// move through time; the diamond is the year shown.
function createTimeline(root, { x0, x1, y1 }, stage, onYear) {
  const [a, b] = stage.span;
  const x = d3.scaleLinear().domain([a, b]).range([x0 + 10, x1 - 10]).clamp(true);
  const g = root.append('g').attr('class', 'strip na-strip');
  g.append('line').attr('class', 'baseline').attr('x1', x0).attr('x2', x1).attr('y1', y1).attr('y2', y1);
  const ticks = d3.range(Math.ceil(a / 10) * 10, b + 1, 10);
  g.selectAll('line.tick').data(ticks).join('line')
    .attr('class', (d) => `tick ${d % 50 === 0 ? 'major' : 'minor'}`)
    .attr('x1', (d) => x(d)).attr('x2', (d) => x(d)).attr('y1', y1).attr('y2', (d) => y1 + (d % 50 === 0 ? 9 : 4));
  const named = d3.range(1500, b + 1, 50);
  const tickLabels = g.selectAll('text.tick-label').data(named).join('text')
    .attr('class', 'tick-label').attr('x', (d) => x(d)).attr('y', y1 + 25).attr('text-anchor', 'middle').text((d) => d);
  const changes = g.append('g').attr('class', 'changes');
  // Diff: a bold segment between the two years, with a hollow marker at the earlier date.
  const range = g.append('line').attr('class', 'range hidden').attr('y1', y1).attr('y2', y1);
  const markerA = g.append('g').attr('class', 'marker start hidden');
  markerA.append('path').attr('d', 'M0,-9L8,0L0,9L-8,0Z');
  const markerALabel = markerA.append('text').attr('y', 30).attr('text-anchor', 'middle');
  const marker = g.append('g').attr('class', 'marker');
  marker.append('path').attr('d', 'M0,-9L8,0L0,9L-8,0Z');
  const markerLabel = marker.append('text').attr('y', 30).attr('text-anchor', 'middle');
  // the hit strip (chrome-like, but harmless in an export: it is transparent)
  let dragging = false;
  const hit = g.append('rect').attr('class', 'strip-hit').attr('x', x0).attr('y', y1 - 16).attr('width', x1 - x0).attr('height', 46);
  const yearAt = (ev) => Math.round(x.invert(d3.pointer(ev, root.node())[0]));
  hit.on('pointerdown', (ev) => { dragging = true; hit.node().setPointerCapture?.(ev.pointerId); onYear?.(yearAt(ev), { live: true }); })
    .on('pointermove', (ev) => { if (dragging) onYear?.(yearAt(ev), { live: true }); })
    .on('pointerup pointercancel', (ev) => { if (dragging) { dragging = false; onYear?.(yearAt(ev), { live: false }); } });
  return {
    x,
    setYear(year) {
      marker.attr('transform', `translate(${x(year)},${y1})`);
      markerLabel.text(year);
      range.classed('hidden', true);
      markerA.classed('hidden', true);
      tickLabels.classed('hidden', (d) => Math.abs(x(d) - x(year)) < 30);
    },
    setRange(a, b) {
      marker.attr('transform', `translate(${x(b)},${y1})`);
      markerLabel.text(b);
      markerA.attr('transform', `translate(${x(a)},${y1})`).classed('hidden', false);
      markerALabel.text(a).classed('hidden', Math.abs(x(a) - x(b)) < 40);
      range.attr('x1', x(Math.min(a, b))).attr('x2', x(Math.max(a, b))).classed('hidden', false);
      tickLabels.classed('hidden', (d) => Math.abs(x(d) - x(a)) < 30 || Math.abs(x(d) - x(b)) < 30);
    },
    // Days on which a boundary in the record changed: a fine rug above the baseline.
    setChanges(years) {
      changes.selectAll('line').data(years).join('line')
        .attr('x1', (d) => x(d)).attr('x2', (d) => x(d)).attr('y1', y1 - 6).attr('y2', y1 - 1);
    },
  };
}

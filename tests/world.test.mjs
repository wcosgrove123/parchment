// Parchment — world stage tests (node --test)
// The seam: a route that crosses the meridian opposite the map's center runs to one edge and carries on from the
// other, as the same curve it would be on an uncut globe; a route that does not cross is drawn exactly as before.
// The stage files: the Atlantic and Pacific views load, fit the whole globe, have their relief and their snapshot years.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import * as d3 from 'd3';
import { makeProjection, W, H, FRAME } from '../src/render/base.js';
import { makeSeam, unwrapLongitudes, splitAtSeam, routePieces, catmullRom, laneOffsets, stopStubs, routeStyle, routeLegend, SPONSORS } from '../src/render/routes.js';
import { stageYears, snapYear } from '../src/data/calendar.js';
import { parseCSV, validateRecords, resolveRecords, recordsInRange } from '../src/data/records.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const exists = (p) => existsSync(new URL(`../${p}`, import.meta.url));
const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
const WORLD = ['world', 'world-pacific'].map((id) => read(`src/stages/${id}.json`));
const calendar = read('data/calendar.json');

function setup(stage) {
  const projection = makeProjection(stage, inner);
  const seam = makeSeam(projection, d3.geoEqualEarthRaw, d3.geoRotation(projection.rotate()));
  return { projection, seam };
}
// The sheet's left and right edge at a latitude, from the projection itself.
function edges(projection, stage, lat) {
  const c = -stage.rotate[0];
  return [projection([c - 179.999, lat])[0], projection([c + 179.999, lat])[0]];
}
const maxStep = (s) => s.reduce((m, p, i) => (i ? Math.max(m, Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1])) : 0), 0);

// Coordinates as Wikidata gives them (P625), rounded: the test needs places, not the gazetteer.
const MANILA = [120.98, 14.6], GUAM = [144.75, 13.45], ACAPULCO = [-99.88, 16.86], MENDOCINO = [-124.41, 40.44];
const LISBON = [-9.14, 38.71], CAPE = [18.47, -34.36], CALICUT = [75.77, 11.25];
const TOKYO = [139.69, 35.69], HONOLULU = [-157.86, 21.31], SUVA = [178.44, -18.14];

test('the seam projects exactly as the stage projection does, inside −180°…180°', () => {
  for (const stage of WORLD) {
    const { projection, seam } = setup(stage);
    for (const ll of [MANILA, ACAPULCO, LISBON, CAPE, [0, 0], [-60, -40], [100, 60]]) {
      const [l, p] = seam.rotate(ll);
      const a = seam.toScreen(l, p), b = projection(ll);
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6, `${stage.id} ${ll}: ${a} vs ${b}`);
      const back = seam.fromScreen(...a);
      assert.ok(Math.abs(back[0] - l) < 1e-6 && Math.abs(back[1] - p) < 1e-6);
    }
  }
});

test('each leg takes the shorter way round: Manila → Acapulco runs east over the date line', () => {
  const u = unwrapLongitudes([MANILA, GUAM, ACAPULCO]);
  assert.equal(u[1][0], GUAM[0]);
  assert.ok(Math.abs(u[2][0] - (ACAPULCO[0] + 360)) < 1e-9, 'Acapulco is carried past 180°, not back across Asia');
  const v = unwrapLongitudes([ACAPULCO, MANILA]);
  assert.ok(Math.abs(v[1][0] - (MANILA[0] - 360)) < 1e-9, 'westbound the other way');
});

test('a Pacific crossing on the 11°E map is cut at the edge: two pieces, edge to edge, at one latitude', () => {
  const stage = WORLD[0];
  const { projection, seam } = setup(stage);
  const pieces = routePieces([ACAPULCO, GUAM, MANILA], projection, { seam });
  assert.equal(pieces.length, 2);
  assert.deepEqual(pieces.map((p) => [p.first, p.last]), [[true, false], [false, true]], 'heads belong to the true ends only');
  const [a, b] = pieces;
  const endA = a.samples[a.samples.length - 1], startB = b.samples[0];
  // Acapulco is west of the seam (169°W); the line leaves the left edge and comes back in at the right one.
  const lat = seam.fromScreen(...seam.toScreen(-180, 0))[1]; // just a sanity call
  assert.ok(Number.isFinite(lat));
  const latA = projection.invert(endA)[1];
  const [left, right] = edges(projection, stage, latA);
  assert.ok(Math.abs(endA[0] - left) < 1.5, `first piece ends on the left edge (${endA[0].toFixed(1)} vs ${left.toFixed(1)})`);
  assert.ok(Math.abs(startB[0] - right) < 1.5, `second piece starts on the right edge (${startB[0].toFixed(1)} vs ${right.toFixed(1)})`);
  assert.ok(Math.abs(endA[1] - startB[1]) < 0.5, 'both pieces meet the edge at the same height');
  for (const p of pieces) assert.ok(maxStep(p.samples) < 8, `no jump across the sheet (largest step ${maxStep(p.samples).toFixed(1)} px)`);
  const tip = b.samples[b.samples.length - 1], manila = projection(MANILA);
  assert.ok(Math.hypot(tip[0] - manila[0], tip[1] - manila[1]) < 0.5, 'the route ends at Manila');
});

test('a route that crosses out and back is three pieces; one that never crosses is the old curve exactly', () => {
  const stage = WORLD[0];
  const { projection, seam } = setup(stage);
  const loop = routePieces([TOKYO, HONOLULU, SUVA], projection, { seam });
  assert.equal(loop.length, 3, 'Tokyo → Honolulu crosses 169°W, Honolulu → Suva crosses back');
  const plain = routePieces([LISBON, CAPE, CALICUT], projection, { seam });
  assert.equal(plain.length, 1);
  assert.deepEqual(plain[0].samples, catmullRom([LISBON, CAPE, CALICUT].map((ll) => projection(ll))), 'same samples as before the seam existed');
});

test('on the Pacific view (150°E) the cut moves to the Atlantic: the galleons are whole, Columbus is cut', () => {
  const [, pacific] = WORLD;
  const { projection, seam } = setup(pacific);
  assert.equal(routePieces([ACAPULCO, GUAM, MANILA], projection, { seam }).length, 1, 'the whole Pacific lies on the Pacific view');
  assert.equal(routePieces([MANILA, MENDOCINO, ACAPULCO], projection, { seam }).length, 1);
  const GOMERA = [-17.11, 28.09], GUANAHANI = [-74.5, 24.04];
  const columbus = routePieces([GOMERA, GUANAHANI], projection, { seam });
  assert.equal(columbus.length, 2, 'an Atlantic crossing is cut at 30°W');
  const latA = projection.invert(columbus[0].samples[columbus[0].samples.length - 1])[1];
  const [left, right] = edges(projection, pacific, latA);
  assert.ok(Math.abs(columbus[0].samples[columbus[0].samples.length - 1][0] - left) < 1.5, 'leaves by the left edge (Africa side)');
  assert.ok(Math.abs(columbus[1].samples[0][0] - right) < 1.5, 'comes back in on the right edge (Americas side)');
  assert.equal(routePieces([LISBON, CAPE, CALICUT], projection, { seam }).length, 1, 'da Gama stays whole');
});

test('splitAtSeam leaves a curve that never reaches the seam alone', () => {
  const { projection, seam } = setup(WORLD[0]);
  const samples = catmullRom([LISBON, CAPE].map((ll) => projection(ll)));
  const out = splitAtSeam(samples, seam);
  assert.equal(out.length, 1);
  assert.equal(out[0].samples.length, samples.length);
});

test('the world stages load: Equal Earth, the whole globe, relief rendered, labels clear of the cut', () => {
  for (const stage of WORLD) {
    assert.equal(stage.projection, 'equalEarth');
    assert.equal(stage.fit, 'sphere');
    assert.ok(exists(`assets/${stage.relief}`), `${stage.relief} exists (node scripts/relief.mjs ${stage.id})`);
    const projection = makeProjection(stage, inner);
    const [[x0, y0], [x1, y1]] = d3.geoPath(projection).bounds({ type: 'Sphere' });
    assert.ok(x0 >= inner[0][0] - 0.5 && x1 <= inner[1][0] + 0.5 && y0 >= inner[0][1] - 0.5 && y1 <= inner[1][1] + 0.5, `${stage.id}: the globe fits inside the frame`);
    assert.ok(x1 - x0 > (inner[1][0] - inner[0][0]) * 0.99, `${stage.id}: the globe fills the frame's width`);
    const center = -stage.rotate[0];
    for (const l of stage.labels) {
      const half = (l.span ?? (l.kind === 'water' ? 50 : 70)) / 2;
      const off = ((l.lon - center + 540) % 360) - 180; // the label's longitude seen from the center
      assert.ok(Math.abs(off) + half < 180, `${stage.id}: "${l.text}" guide stays on one side of the cut`);
    }
  }
});

test('snapshot years per stage: both world views add 1530 and 1650; Afro-Eurasia keeps its eight', () => {
  const afro = read('src/stages/afro-eurasia.json');
  assert.deepEqual(stageYears(calendar, afro), [1200, 1450, 1500, 1600, 1700, 1750, 1900, 2000]);
  for (const stage of WORLD) assert.deepEqual(stageYears(calendar, stage), [1200, 1450, 1500, 1530, 1600, 1650, 1700, 1750, 1900, 2000]);
  for (const s of calendar.snapshots) assert.ok(exists(`data/base/derived/world_${s.year}.topojson`), `world_${s.year}.topojson derived`);
  const years = stageYears(calendar, WORLD[0]);
  assert.equal(snapYear(years, 1522), 1530, '?year=1522 opens the 1530 snapshot');
  assert.equal(snapYear(years, 1600), 1600);
  assert.equal(snapYear(years, 2050), 2000);
  assert.equal(snapYear(years, null, 1450), 1450);
});

// In headless Chrome, the way `npm run shot` draws it: the Explorers layer for 1519–1522 on the 1500 base map, with
// Magellan's Pacific leg in two pieces, solid, in Spain's color, the head on the second only, and a head at a stop.
// Skipped when no browser is installed or the draft file is missing.
const browser = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => existsSync(p));
const DRAFT = 'data/drafts/unit4-voyages.csv';
test('the Explorers layer draws in a shot: a typed range, color by state, a Pacific crossing in two pieces', { skip: !browser ? 'no Chrome or Edge installed' : !exists(DRAFT) ? `no ${DRAFT}` : false }, async () => {
  const { spawn, execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const ROOT = fileURLToPath(new URL('..', import.meta.url));
  const port = 8397;
  const server = spawn(process.execPath, ['scripts/build.mjs', '--serve'], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise((ok, fail) => {
      const onData = (b) => { if (String(b).includes(`:${port}/`)) ok(); };
      server.stdout.on('data', onData);
      server.stderr.on('data', onData);
      server.on('exit', (c) => fail(new Error(`dev server exited early (${c})`)));
      setTimeout(() => fail(new Error('dev server did not start')), 30000);
    });
    const url = `http://127.0.0.1:${port}/?shot=1&stage=world&tracker=explorers&from=1519&year=1522&records=${DRAFT}`;
    const dom = execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--window-size=1920,1080',
      '--virtual-time-budget=15000', '--timeout=30000', '--dump-dom', url], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000 });
    assert.match(dom, /<text class="map-title"[^>]*>The World<\/text>/);
    assert.match(dom, /<text class="year[^"]*"[^>]*>1519–1522<\/text>/, 'the cartouche shows the typed range');
    assert.match(dom, /<path class="polity state muted pol-\d+"/, 'the states of 1522 (Cliopatria, 2026-11-09), drawn quiet under the routes');
    assert.match(dom, /<text class="base-note"[^>]*><\/text>/, 'no base map stands in: every year is drawn as it was');
    assert.match(dom, /<body class="[^"]*tracker-explorers/);
    assert.match(dom, /<path class="route spain regular solid spain" id="route-magellan-1519-1" d="[^"]*" stroke-width="3">/, 'solid, Spain, the first piece runs to the edge with no head');
    assert.match(dom, /id="route-magellan-1519-2" d="[^"]*" stroke-width="3" marker-end="url\(#route-head-arrow-spain\)"/, 'the second piece carries the head');
    assert.doesNotMatch(dom, /id="route-magellan-1519-3"/);
    assert.match(dom, /<path class="route route-stop spain regular"[^>]*marker-end="url\(#route-head-arrow-spain\)"/, 'a head at a marked stop (Tidore, on Elcano\'s way home)');
    assert.doesNotMatch(dom, /id="route-columbus-1492"/, 'Columbus (1492–93) is outside 1519–1522');
    assert.match(dom, /Sent by Spain/);
    assert.match(dom, /<button class="span-preset"[^>]*>1492–1522<\/button>/, 'the lesson-range buttons are in the toolbar');
    assert.ok((dom.match(/<text class="route-label[^"]*"[^>]*><textPath[^>]*>Magellan 1519<\/textPath>/g) ?? []).length <= 1, 'never two names for the two pieces');
  } finally {
    server.kill();
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, stdio: 'ignore' });
  }
});

// Vassals and tribute on the political map (owner, 2026-11-10): stripes in the overlord's color, a legend line per
// overlord in the frame; crowns under one ruler inside a realm line.
test('the political map draws vassals striped in their overlord’s color and names each overlord in the legend', { skip: !browser ? 'no Chrome or Edge installed' : false }, async () => {
  const { spawn, execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const ROOT = fileURLToPath(new URL('..', import.meta.url));
  const port = 8398;
  const server = spawn(process.execPath, ['scripts/build.mjs', '--serve'], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  const dump = (q) => execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--window-size=1920,1080',
    '--virtual-time-budget=15000', '--timeout=30000', '--dump-dom', `http://127.0.0.1:${port}/?shot=1&${q}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000 });
  try {
    await new Promise((ok, fail) => {
      const onData = (b) => { if (String(b).includes(`:${port}/`)) ok(); };
      server.stdout.on('data', onData);
      server.stderr.on('data', onData);
      server.on('exit', (c) => fail(new Error(`dev server exited early (${c})`)));
      setTimeout(() => fail(new Error('dev server did not start')), 30000);
    });
    const d1400 = dump('stage=europe&year=1400');
    assert.match(d1400, /<pattern id="tie-11"/, 'a stripe pattern for every palette color');
    assert.match(d1400, /<path class="tie tribute" d="[^"]+" fill="url\(#tie-\d+\)"><title>Novgorod Republic · pays tribute to the Golden Horde, 1259–1478 \(sources in data\/tributaries\.json\)/);
    assert.match(d1400, /<path class="tie vassal"[^>]*><title>Kingdom of Georgia · vassal of the Timurid Empire, 1395–14\d\d \(Cliopatria\)/);
    assert.match(d1400, />Pays tribute to the Golden Horde<\/text>/);
    assert.match(d1400, />Vassal of the Timurid Empire<\/text>/);
    assert.doesNotMatch(d1400, /Owes allegiance to Ming China/, 'Joseon and the Ming are off the Europe sheet: no line for them');
    const d1500 = dump('stage=europe&year=1500');
    assert.doesNotMatch(d1500, /pays tribute to the Golden Horde/, '1500: the yoke ended in 1480');
    assert.doesNotMatch(d1500, />Vassal of the Vijayanagara Empire<\/text>/, 'Jaffna’s tie (to 1501) is off the Europe sheet: drawn under the clip, no legend line');
    assert.match(d1500, />A realm, or crowns under one ruler<\/text>/);
    assert.match(d1500, /<path class="whole approximate"[^>]*><title>Personal union of Crown of Aragon with Crown of Castile: two crowns, one ruler · 14\d\d–15\d\d \(Cliopatria\)/);
    const d1550 = dump('stage=europe&year=1550');
    assert.match(d1550, />Vassal, tributary or protectorate of the Ottoman Empire<\/text>/, 'one line for the Ottomans: Wallachia, Moldavia and eastern Hungary, Ragusa, the Crimea');
    assert.doesNotMatch(d1550, />Vassal of the Ottoman Empire<\/text>/);
    assert.match(d1550, /<title>Crimean Khanate · protectorate of the Ottoman Empire, 1475–1774 \(sources in data\/tributaries\.json\)/);
  } finally {
    server.kill();
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, stdio: 'ignore' });
  }
});

test('every draft row reads cleanly and every waypoint is in the gazetteer', () => {
  const vocab = read('data/vocab.json');
  const gazetteer = read('data/gazetteer.json');
  for (const file of ['unit4-voyages', 'unit4-exchange']) {
    const path = `data/drafts/${file}.csv`;
    if (!exists(path)) continue;
    const v = validateRecords(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), vocab);
    assert.deepEqual(v.problems.map((p) => `${p.line} ${p.id}: ${p.message}`), [], `${path} has no bad rows`);
    const r = resolveRecords(v.records, gazetteer);
    assert.deepEqual(r.waiting, [], `${path}: every id is geocoded (npm run geocode -- --file ${path})`);
    for (const rec of v.records) assert.equal(rec.qc_status, '', `${rec.id} is a draft: not marked reviewed`);
  }
});

test('the voyage rows (in the Sheet since 2026-11-06, unreviewed) are marked TO REVIEW and cite a published work', () => {
  const path = 'data/drafts/unit4-voyages.csv';
  if (!exists(path)) return;
  const rows = parseCSV(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  const h = rows[0];
  for (const r of rows.slice(1)) {
    const row = Object.fromEntries(h.map((k, i) => [k, r[i]]));
    assert.match(row.qc_note, /^TO REVIEW\. /, `${row.id}: marked to review`);
    assert.equal(row.qc_status, '', `${row.id}: left for the reviewer`);
    // author, title, then (publisher, year) in brackets
    assert.match(row.source, /^[A-Z][^,]+, .+\([^()]*\d{4}[^()]*\)/, `${row.id}: a full citation leads the source`);
  }
});

// ---------- the owner's answers of 2026-11-06: the Explorers layer, heads at stops, side-by-side strands ----------

test('Explorers: color is the state that sent it, one head at the end; the legend names the states on the map', () => {
  const r = (value, over = {}) => ({ id: `x-${value}`, tracker: 'explorers', kind: 'arrow', value, certainty: 'legal', ...over });
  for (const k of Object.keys(SPONSORS)) {
    const s = routeStyle(r(k));
    assert.equal(s.color, k);
    assert.deepEqual([s.markerStart, s.markerEnd, s.dash], [null, 'arrow', 'solid']);
  }
  assert.equal(routeStyle(r('england', { certainty: 'sphere' })).dash, 'dotted', 'a conjectured line (Cabot) stays dotted');
  const legend = routeLegend([r('portugal'), r('spain'), r('spain', { id: 'y' }), r('england', { certainty: 'sphere' })]);
  assert.deepEqual(legend.map((l) => l.label), ['Sent by Spain', 'Sent by Portugal', 'Sent by England', 'Documented route', 'Conjectured route']);
  assert.equal(routeStyle({ tracker: 'routes', kind: 'arrow', value: 'voyage', certainty: 'legal' }).color, 'steel', 'the Routes layer keeps color = what moved');
});

test('Explorers: a typed range takes every record whose dates touch it, either way round', () => {
  const rows = [
    { id: 'columbus', tracker: 'explorers', start: 1492, end: 1493 },
    { id: 'magellan', tracker: 'explorers', start: 1519, end: 1521 },
    { id: 'cartier', tracker: 'explorers', start: 1534, end: 1536 },
    { id: 'galleon', tracker: 'routes', start: 1565, end: 1815 },
  ];
  assert.deepEqual(recordsInRange(rows, 'explorers', 1492, 1522).map((r) => r.id), ['columbus', 'magellan']);
  assert.deepEqual(recordsInRange(rows, 'explorers', 1521, 1534).map((r) => r.id), ['magellan', 'cartier'], 'touching an end counts');
  assert.deepEqual(recordsInRange(rows, 'explorers', 1600, 1500).map((r) => r.id), ['magellan', 'cartier'], 'typed backwards');
  assert.deepEqual(recordsInRange(rows, 'explorers', 1494, 1518), []);
});

test('Explorers rows read: value is a sending state for a line, a point type for a stop', () => {
  const vocab = read('data/vocab.json');
  const head = 'id,course,unit,topic,kc,theme,tracker,kind,where,lon,lat,start,end,grade,value,certainty,label,source,qc_status,qc_by,qc_note';
  const v = validateRecords([head,
    'ok-line,apworld,4,,,GOV,explorers,arrow,Q597>Q1142979,,,1497,1498,exact,portugal,legal,da Gama,Subrahmanyam 1997,,,',
    'ok-stop,apworld,4,,,GOV,explorers,point,Q1142979,,,1498,1498,exact,port,legal,Calicut,Subrahmanyam 1997,,,',
    'bad-state,apworld,4,,,GOV,explorers,arrow,Q597>Q1142979,,,1497,1498,exact,voyage,legal,da Gama,Subrahmanyam 1997,,,',
    'bad-stop,apworld,4,,,GOV,explorers,point,Q1142979,,,1498,1498,exact,spain,legal,Calicut,Subrahmanyam 1997,,,',
  ].join('\n'), vocab);
  assert.deepEqual(v.records.map((r) => r.id), ['ok-line', 'ok-stop']);
  assert.deepEqual(v.problems.map((p) => p.id), ['bad-state', 'bad-stop']);
  assert.equal(v.records[1].shape, 'steel-circle');
});

test('side by side: routes sharing a leg take lanes either side of it; routes that share nothing keep zeros', () => {
  const lanes = laneOffsets([
    { id: 'gama', waypoints: ['Q1', 'Q2', 'Q3', 'Q4'] },
    { id: 'cabral', waypoints: ['Q9', 'Q2', 'Q3', 'Q4'] },
    { id: 'back', waypoints: ['Q4', 'Q3'] },
    { id: 'alone', waypoints: ['Q7', 'Q8'] },
  ], 5);
  assert.deepEqual(lanes.get('alone'), [0, 0]);
  const [g, c] = [lanes.get('gama'), lanes.get('cabral')];
  assert.equal(g[0], 0, 'Lisbon: not shared');
  assert.ok(g[1] !== 0 && g[1] === -c[1], 'where the two join the shared stretch they ease apart, one either side');
  assert.equal(Math.abs(g[3] - c[3]), 5, 'one gap apart at the shared end');
  // Q3–Q4 is shared three ways, once in the other direction: the reversed route's lane flips with its direction.
  const b = lanes.get('back');
  assert.equal(new Set([g[3], c[3], -b[0]]).size, 3, 'three distinct lanes on Q3–Q4');
});

test('heads at stops: a stub just before each marked stop, pointing into it; none where the line is too short', () => {
  const samples = Array.from({ length: 101 }, (_, i) => [i * 3, 0]); // a straight line, 300 px, east
  const stubs = stopStubs([{ samples }], [{ x: 150, y: 0, clear: 8 }, { x: 4, y: 0, clear: 8 }, { x: 150, y: 40, clear: 8 }]);
  assert.equal(stubs.length, 1, 'the stop near the start has no room; the one 40 px off the line is not on it');
  const [[fx, fy], [tx, ty]] = stubs[0];
  assert.ok(Math.abs(tx - 142) < 1e-9 && Math.abs(fx - 138) < 1e-9 && fy === 0 && ty === 0, 'ends 8 px short of the stop, 4 px long, heading east');
});

test('the lesson ranges (1492–1522, 1492–1600) are one-click buttons, inside every stage the layer runs on', () => {
  const { ranges } = read('src/trackers/explorers.json');
  assert.deepEqual(ranges.map((r) => [r.from, r.to]), [[1492, 1522], [1492, 1600]]);
  for (const stage of [...WORLD, read('src/stages/afro-eurasia.json')]) {
    for (const r of ranges) assert.ok(r.from < r.to && r.from >= stage.span[0] && r.to <= stage.span[1], `${stage.id}: ${r.from}–${r.to}`);
  }
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /explorers\.ranges/, 'the toolbar builds its buttons from the tracker file');
});

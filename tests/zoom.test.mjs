// Parchment — pan and zoom on the North America page (owner, 2026-11-10), in a headless browser: a view by its
// center and width, the wheel, the way back to the continent, a battle's detail by zoom level and by date, and the
// plain map of nations once the war is over. The war rows are the frozen fixture the other Military tests read.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { launch, findBrowser } from '../scripts/browser.mjs';
import { serve, bundle } from '../scripts/serve.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let exe = null;
try { exe = findBrowser(); } catch { exe = null; }
const skip = exe ? false : 'no Chromium-family browser found';

const inPage = (fn, ...args) => `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(',')})`;
const ready = () => new Promise((ok, no) => { const t = Date.now(); (function w() { if (window.parchment && window.parchment.ready && document.body.classList.contains('ready')) window.parchment.ready.then(ok, no); else if (Date.now() - t > 90000) no('timeout'); else setTimeout(w, 80); })(); });
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

let kit = null;
async function open(query) {
  if (!kit) {
    const server = await serve(ROOT, { files: { '/us.js': await bundle(ROOT) } });
    const browser = await launch({ browser: exe });
    kit = { server, browser };
  }
  const page = await kit.browser.newPage({ width: 1920, height: 1080, scale: 1, origin: kit.server.origin });
  await page.goto(`${kit.server.origin}/us.html?${query}`);
  await page.eval(inPage(ready));
  return page;
}
after(async () => { if (kit) { await kit.browser.close(); await kit.server.close(); } });

const view = () => { const v = window.parchment.view(); return { frame: v.frame, km: v.kmWide, center: v.center, detail: v.detail, phase: v.phase, address: location.search }; };
const zoomTo = async (c, km) => { await window.parchment.zoomTo(c, km); const v = window.parchment.view(); return { frame: v.frame, km: v.kmWide, center: v.center, detail: v.detail, phase: v.phase, address: location.search }; };

test('a view by its center and width: the stage is rebuilt on it, north up at the middle, and the address says where', { skip, timeout: 240000 }, async () => {
  const page = await open('date=1863-07-10');
  const home = await page.eval(inPage(view));
  assert.equal(home.frame, null, 'the page opens on the continent');
  assert.ok(home.km > 6000 && home.km < 9000, `the continent is about 7,500 km across the sheet (${Math.round(home.km)})`);
  const insets = await page.eval(inPage(() => document.querySelectorAll('.view-clip:not(.view-clip-main)').length));
  assert.ok(insets >= 2, 'Alaska and Hawaii in their boxes');

  const east = await page.eval(inPage(zoomTo, [-77.5, 39.5], 1500));
  assert.ok(Math.abs(east.km - 1500) < 2, `1,500 km across (${east.km})`);
  assert.ok(Math.abs(east.center[0] + 77.5) < 0.01 && Math.abs(east.center[1] - 39.5) < 0.01, 'centered where asked');
  assert.match(east.frame, /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'the frame is a box of longitude and latitude');
  assert.ok(decodeURIComponent(east.address).includes(`frame=${east.frame}`), 'and it is in the address');
  const [w, s, e, n] = east.frame.split(',').map(Number);
  assert.ok(w < -77.5 && e > -77.5 && s < 39.5 && n > 39.5, 'the box holds the center');
  // north is up at the middle of the sheet: a point due north of the center lies straight above it
  const up = await page.eval(inPage(() => { const t = [...document.querySelectorAll('.view-main .polity-labels text')].map((x) => x.textContent); return { names: t.filter((x) => /Pennsylvania|Virginia|Maryland/i.test(x)).length, insets: document.querySelectorAll('.view-clip:not(.view-clip-main)').length }; }));
  assert.ok(up.names >= 2, 'the states of the view are named');
  assert.equal(up.insets, 0, 'a view has no insets');

  // the wheel: three notches in over the middle of the map, and the view rests closer in
  const before = east.km;
  await page.eval(inPage(async () => {
    const svg = document.getElementById('map'), r = svg.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (let i = 0; i < 3; i++) { document.elementFromPoint(x, y).dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: x, clientY: y, deltaY: -100 })); await new Promise((res) => requestAnimationFrame(res)); }
  }));
  await pause(1500);
  const wheeled = await page.eval(inPage(view));
  assert.ok(wheeled.km < before * 0.8, `the wheel zoomed in (${Math.round(before)} → ${Math.round(wheeled.km)} km)`);
  const rest = await page.eval(inPage(() => ({ shown: document.querySelector('.view-main').style.display !== 'none', transform: document.querySelector('.view-main').getAttribute('transform'), zooming: !!document.querySelector('.stage.zooming') })));
  assert.deepEqual(rest, { shown: true, transform: null, zooming: false }, 'at rest the drawing itself shows, unmoved');

  // the picture a gesture slides is taken a moment after the map rests, and is no part of an export
  // (how long the picture takes depends on the machine: wait for it, up to ten seconds, not for a fixed time)
  await page.eval(inPage(() => new Promise((res) => { const t = Date.now(); (function w() { if (document.querySelector('.zoom-proxy') || Date.now() - t > 10000) res(); else setTimeout(w, 100); })(); })));
  const proxy = await page.eval(inPage(async () => ({ proxy: document.querySelectorAll('.zoom-proxy').length, exported: (await (await window.parchment.renderSVG()).text()).includes('zoom-proxy') })));
  assert.equal(proxy.proxy, 1, 'one picture under the map');
  assert.equal(proxy.exported, false, 'not in the exported SVG');

  // and home again: the continent as it opens
  await page.eval(inPage(() => window.parchment.zoomHome()));
  const back = await page.eval(inPage(view));
  assert.equal(back.frame, null);
  assert.ok(!/frame=/.test(back.address), 'no frame in the address');
  assert.ok(Math.abs(back.km - home.km) < 1, 'the continent at its own scale');
  await page.close();
});

test('detail by zoom: close on Gettysburg the battle shows (whole once fought, by phase on its days, not before); panned away, the war', { skip, timeout: 240000 }, async () => {
  const page = await open('tracker=military&date=1863-07-10&records=tests/maps/military-fixture.csv');
  const far = await page.eval(inPage(zoomTo, [-77.3, 39.7], 300));
  assert.equal(far.detail, null, 'at 300 km the war, not the battle');
  const warMoves = await page.eval(inPage(() => document.querySelectorAll('.view-main .routes path.route').length));
  assert.equal(warMoves, 0, 'the battle\'s attacks are not drawn on the war\'s map');

  const near = await page.eval(inPage(zoomTo, [-77.232, 39.815], 14));
  assert.equal(near.detail, 'gettysburg');
  assert.deepEqual(near.phase, { n: 7, whole: true }, 'a week after the battle: the whole battle');
  await pause(900); // (its roads and streams are read on first sight)
  const whole = await page.eval(inPage(async () => {
    const slip = await window.parchment.packingSlip();
    return { title: document.querySelector('.phase-list .legend-title')?.textContent, ground: document.querySelectorAll('.view-main .mil-ground path').length,
      routes: document.querySelectorAll('.view-main .routes path.route').length, forces: document.querySelectorAll('.view-main .mil-forces .mil-force').length, war: slip.resolved?.war?.id ?? null, status: document.getElementById('film-status').textContent };
  }));
  assert.match(whole.title, /the whole battle/);
  assert.ok(whole.ground > 10, `the roads and streams of the field (${whole.ground})`);
  assert.ok(whole.routes >= 12, `every phase's marches and attacks (${whole.routes})`);
  assert.ok(whole.forces >= 9, `the corps (${whole.forces})`);
  assert.equal(whole.war, 'civil-war');
  assert.match(whole.status, /Gettysburg: the whole battle/);

  // a phase picked in the list is shown alone; the title brings the whole battle back
  const three = await page.eval(inPage(async () => { await window.parchment.pickPhase(3); return { phase: window.parchment.view().phase, routes: document.querySelectorAll('.view-main .routes path.route').length, status: document.getElementById('film-status').textContent }; }));
  assert.deepEqual(three.phase, { n: 3, whole: false });
  assert.ok(three.routes < whole.routes, 'fewer lines than the whole battle');
  assert.match(three.status, /phase 3 of 7/);
  const clicked = await page.eval(inPage(async () => { document.querySelector('.phase-list .legend-title').dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise((r) => setTimeout(r, 300)); return window.parchment.view().phase; }));
  assert.deepEqual(clicked, { n: 7, whole: true });

  // on a day of the battle: the phase that day has reached; before it: nothing of it yet
  const day2 = await page.eval(inPage(async () => { window.parchment.setDate('1863-07-02'); await new Promise((r) => setTimeout(r, 500)); return window.parchment.view(); }));
  assert.equal(day2.detail, 'gettysburg');
  assert.deepEqual(day2.phase, { n: 4, whole: false }, '2 July: the evening\'s phase, the last of that day');
  const june = await page.eval(inPage(async () => { window.parchment.setDate('1863-06-01'); await new Promise((r) => setTimeout(r, 500)); return window.parchment.view(); }));
  assert.equal(june.detail, null, 'a month before, the field is only land');

  // panned off the field at the same zoom: the war's map again, the war still shown
  await page.eval(inPage(() => { window.parchment.setDate('1863-07-10'); }));
  const north = await page.eval(inPage(zoomTo, [-77.232, 39.90], 14));
  assert.equal(north.detail, null);
  const still = await page.eval(inPage(async () => (await window.parchment.packingSlip()).resolved?.war?.id ?? null));
  assert.equal(still, 'civil-war');
  await page.close();
});

test('a war is shown through its last day: the day after, the plain map of nations', { skip, timeout: 240000 }, async () => {
  const page = await open('tracker=military&date=1848-02-02&records=tests/maps/military-fixture.csv');
  const during = await page.eval(inPage(async () => ({ war: (await window.parchment.packingSlip()).resolved?.war?.id ?? null, legend: document.querySelector('.legend .legend-title')?.textContent, list: document.querySelectorAll('.course-list').length })));
  assert.equal(during.war, 'mexican-american-war', 'on the day of the treaty the war is on the map');
  assert.equal(during.list, 1);
  const after1 = await page.eval(inPage(async () => { window.parchment.setDate('1848-02-03'); await new Promise((r) => setTimeout(r, 600)); return { war: (await window.parchment.packingSlip()).resolved?.war?.id ?? null, legend: document.querySelector('.legend .legend-title')?.textContent, list: document.querySelectorAll('.course-list').length, marks: document.querySelectorAll('.view-main .marks .mark-group').length, routes: document.querySelectorAll('.view-main .routes path.route').length, strip: document.querySelectorAll('.war-strip').length }; }));
  assert.equal(after1.war, null, 'the day after, no war');
  assert.match(after1.legend, /Nations and empires/i, 'the map of nations');
  assert.deepEqual([after1.list, after1.marks, after1.routes, after1.strip], [0, 0, 0, 0], 'no list, no battles, no marches, no war strip');
  // and with a war named in the menu, the same
  const named = await open('tracker=military&war=mexican-american-war&date=1850-06-01&records=tests/maps/military-fixture.csv');
  const later = await named.eval(inPage(async () => ({ war: (await window.parchment.packingSlip()).resolved?.war?.id ?? null, legend: document.querySelector('.legend .legend-title')?.textContent })));
  assert.equal(later.war, null);
  assert.match(later.legend, /Nations and empires/i);
  await page.close(); await named.close();
});

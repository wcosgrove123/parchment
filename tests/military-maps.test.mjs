// The Military layer, rendered (brief of 2026-11-09, milestone 1): the two orders in tests/maps/military/ through
// scripts/map.mjs, checked against their packing slips; and the layer's promise that nothing else changes: the
// Texas 1846 lesson map with the old records draws its nations legend as before. Skipped without a browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findBrowser } from '../scripts/browser.mjs';
import { renderOrder } from '../scripts/map.mjs';

let browser = null;
try { browser = findBrowser(); } catch { browser = null; }
const skip = browser ? false : 'no Chromium-family browser found';
const order = (p) => JSON.parse(readFileSync(new URL(`./maps/${p}.json`, import.meta.url), 'utf8'));
const OUT = mkdtempSync(join(tmpdir(), 'parchment-military-'));
test.after(() => rmSync(OUT, { recursive: true, force: true }));
const render = (p, over = {}) => renderOrder({ ...order(p), ...over }, { out: join(OUT, p.replace(/\//g, '-')), base: OUT, browser });

test('Texas, 25 April 1846, with the Military layer on: fills by side, the dispute still hatched, Taylor\'s march as before', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/texas-1846-sides');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.resolved.tracker.id, 'military');
  assert.equal(s.resolved.war.id, 'mexican-american-war');
  assert.deepEqual(s.resolved.war.sides.map((x) => [x.id, x.members.length]), [['us', 1], ['mexico', 1]]);
  assert.equal(s.resolved.war.sides[0].fill, '#86a5de');
  const labels = s.legend.rows.map((r) => r.label);
  assert.deepEqual(labels.slice(0, 2), ['United States', 'Mexico']);
  assert.deepEqual(s.legend.rows.slice(0, 2).map((r) => r.fill), ['#86a5de', '#cb8eb6'], 'the two side fills, not the nations tracker\'s green and teal');
  assert.ok(labels.includes('Claimed by Texas and Mexico'), 'the dispute keeps its hatch');
  assert.ok(labels.includes('Mexico: La intervención estadounidense en México'), 'names=both: the other side\'s name in the legend');
  assert.equal(s.resolved.title, 'The Disputed Land, 1846', 'an order\'s title still wins');
  const march = s.routes.find((r) => r.record === 'test-mx-taylor-march');
  assert.ok(march && march.class === 'Army' && march.labeled, 'a routes row with value military keeps working');
  const tx = s.features.find((f) => f.ids.newberry === 'tx_state');
  assert.equal(tx.look.key, 'side-a', 'Texas takes the United States\' side fill');
  const tam = s.features.find((f) => f.name === 'Tamaulipas');
  assert.equal(tam.look.key, 'side-b');
  const it = s.features.find((f) => f.name === 'Indian Territory');
  assert.equal(it.look.key, 'side-a', 'U.S. territory is a member\'s land too');
});

test('the war with Mexico, 13 May 1846, on the mexico-war frame: the war\'s own name in the cartouche; non-members paper', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/mexico-war-1846');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.resolved.title, 'The War with Mexico', 'names=both prints the first side\'s name; the other goes to the legend');
  assert.equal(s.resolved.frame.id, 'mexico-war');
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside);
  const oregon = s.features.find((f) => /Oregon Country/.test(f.name));
  assert.ok(oregon && !oregon.look.key?.startsWith('side-'), 'the Oregon Country, held jointly, is no member: paper');
  const cuba = s.features.find((f) => /Cuba/.test(f.name));
  assert.ok(!cuba || !cuba.look.key?.startsWith('side-'), 'Spain\'s Cuba is paper');
  assert.ok(s.features.filter((f) => f.look.key === 'side-b').length > 10, 'Mexico\'s states take side B');
  const mx = await render('military/mexico-war-1846', { names: 'mexico' });
  assert.equal(mx.slip.resolved.title, 'La intervención estadounidense en México', 'names=mexico prints Mexico\'s name for the war');
  assert.ok(mx.slip.legend.rows.some((r) => r.label === 'Mexico') && !mx.slip.legend.rows.some((r) => /intervención/.test(r.label)));
});

test('the theater, 2 February 1848 (milestone 2): nineteen events by outcome, numbered, with the list and the war strip', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/mexico-war-1848');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.points.length, 19, 'every event of the war has begun by the treaty day');
  assert.ok(s.points.every((p) => p.seq >= 1 && p.seq <= 19 && !p.labeled), 'numbered events carry no name on the map: the list has it');
  assert.equal(s.resolved.war.course.length, 19);
  assert.equal(s.resolved.war.course[0].label, 'Fort Texas', 'the fort, begun 28 March 1846, heads the list');
  assert.equal(s.resolved.war.course[1].label, 'Thornton Affair');
  assert.equal(s.resolved.war.course[1].outcome, 'won by Mexico');
  assert.equal(s.resolved.war.course[18].label, 'Treaty of Guadalupe Hidalgo');
  assert.equal(s.resolved.war.strip, 'war');
  const labels = s.legend.rows.map((r) => r.label);
  for (const l of ['Battle won by United States', 'Battle won by Mexico', 'Both sides claimed victory', 'Siege (ring: the besieger)', 'Declaration of war, treaty', 'Place taken (ring: the captor)', 'The course of the war: see the list']) assert.ok(labels.includes(l), l);
  assert.ok(!labels.includes('Battle or siege') && !labels.includes('Treaty'), 'the routes layer\'s point legend does not repeat the events');
  const won = s.legend.rows.find((r) => r.label === 'Battle won by United States');
  assert.equal(won.fill, '#3057a3', 'the diamond\'s fill is the victor\'s line color');
  const palo = s.points.find((p) => p.record === 'test-mx-ev-palo-alto');
  assert.deepEqual([palo.outcome, palo.outcome_text], ['won:us', 'won by United States']);
  assert.ok(s.layout.legend.inside && s.layout.cartouche.inside && s.layout.clipped_text.length === 0);
  assert.match(s.alt_text, /Shaded: United States in blue \(side A\) and Mexico in plum \(side B\)/);
  // a date in the middle of the war shows only what has begun, numbered from one
  const mid = await render('military/mexico-war-1848', { date: '1846-09-25', out: undefined });
  assert.equal(mid.slip.points.length, 9, 'eight events begun by 25 September 1846, and the fort');
  assert.equal(mid.slip.resolved.war.course.at(-1).label, 'Monterrey');
  // events off, strip of the stage: the fills alone
  const bare = await render('military/mexico-war-1848', { show: ['territory'], strip: 'stage' });
  assert.equal(bare.slip.points.length, 0);
  assert.equal(bare.slip.resolved.war.course.length, 0);
  assert.equal(bare.slip.resolved.war.strip, 'stage');
});

test('the war in the north, 24 February 1847 (milestone 3): forces as arrows by side, hollow retreats, a landing, routes leaving the frame', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/texas-1847-movements');
  assert.deepEqual(s.render.page_errors, []);
  assert.equal(s.routes.length, 13, 'every movement begun by the date: Taylor\'s approach march too, Scott\'s landing and the Mexican retreats');
  const by = (id) => s.routes.find((r) => r.record === id);
  assert.deepEqual([by('test-mx-mv-taylor-1').color, by('test-mx-mv-taylor-1').class], ['side-a', 'Advance']);
  assert.deepEqual([by('test-mx-mv-arista-ret').color, by('test-mx-mv-arista-ret').hollow, by('test-mx-mv-arista-ret').class], ['side-b', true, 'Retreat or withdrawal']);
  assert.ok(by('test-mx-mv-scott-sea').landing);
  assert.deepEqual(by('test-mx-mv-kearny-2').places, ['Santa Fe', 'Battle of San Pasqual', 'San Diego'], 'waypoint names from the gazetteer, for the tab at the edge');
  assert.ok(!s.routes.some((r) => r.record === 'test-mx-mv-scott-land'), 'Scott\'s march inland begins in April: not yet');
  const labels = s.legend.rows.map((r) => r.label);
  for (const l of ['United States: an armed force', 'Mexico: an armed force', 'Retreat or withdrawal', 'Landing from the sea']) assert.ok(labels.includes(l), l);
  assert.ok(s.resolved.war.course.some((c) => c.label === 'United States declares war' && c.off), 'the declaration in Washington is listed as off this map');
  assert.equal(s.points.length, 11 - 3, 'the three events beyond the frame are not drawn (the fort is on it)');
  assert.equal(s.resolved.war.movements_on_sheet.length, 13);
  // `from` on this layer: movements since, not a Diff
  const since = await render('military/texas-1847-movements', { from: '1847-01-01' });
  assert.equal(since.slip.resolved.mode, 'snapshot');
  assert.equal(since.slip.resolved.war.movements_since, '1847-01-01');
  assert.deepEqual(since.slip.routes.map((r) => r.record).sort(), ['test-mx-mv-doniphan', 'test-mx-mv-santa-anna-adv', 'test-mx-mv-santa-anna-ret', 'test-mx-mv-scott-sea', 'test-mx-mv-taylor-3']);
});

test('the theater with its lines and inset (milestone 4): blockades off Mexico\'s coasts, the treaty line, a ghost border, Scott\'s campaign inset', { skip, timeout: 240000 }, async () => {
  const { slip: s } = await render('military/mexico-war-1848-full');
  assert.deepEqual(s.render.page_errors, []);
  const lines = s.resolved.war.lines;
  assert.deepEqual(lines.map((l) => l.id).sort(), ['guadalupe-hidalgo', 'gulf-blockade', 'mexico-1846', 'pacific-blockade']);
  for (const l of lines) { assert.ok(l.runs >= 1 && l.length_px > 100, `${l.id} was computed and drawn`); assert.match(l.computed_from, /polygon/); assert.ok(l.source); }
  assert.ok(lines.find((l) => l.id === 'guadalupe-hidalgo').computed_from.startsWith('the edge of mexico'));
  assert.ok(lines.find((l) => l.id === 'gulf-blockade').computed_from.includes('offshore'));
  const labels = s.legend.rows.map((r) => r.label);
  for (const l of ['Blockade of the Gulf ports, from 14 May 1846', 'Treaty of Guadalupe Hidalgo, 1848', 'Mexico, 24 April 1846']) assert.ok(labels.includes(l), l);
  assert.equal(s.resolved.inset.id, 'inset-mexico-city');
  assert.equal(s.resolved.inset.title, 'The Valley of Mexico');
  assert.equal(s.resolved.inset.at.length, 4);
  assert.equal(s.points.length, 19);
  // one campaign alone: Scott's two movements, and only the events that name his force (none do yet: all 18 stay)
  const scott = await render('military/mexico-war-1848-full', { forces: ['scott'], inset: undefined });
  assert.deepEqual(scott.slip.routes.map((r) => r.record).sort(), ['test-mx-mv-scott-land', 'test-mx-mv-scott-sea']);
  assert.deepEqual(scott.slip.resolved.war.forces_shown, ['scott']);
  // lines off, the stage's strip: the fills, events and movements alone
  const bare = await render('military/mexico-war-1848-full', { show: ['territory', 'events', 'movements'], inset: undefined });
  assert.deepEqual(bare.slip.resolved.war.lines, []);
  assert.ok(!bare.slip.legend.rows.some((r) => /Blockade/.test(r.label)));
});

test('force marks (milestone 5): each force where its movements put it, its icon when the catalog allows, a tank refused in 1846', { skip, timeout: 240000 }, async () => {
  const { slip: s } = await render('military/mexico-war-1848-full', { inset: undefined });
  assert.deepEqual(s.render.page_errors, []);
  const forces = s.resolved.war.forces;
  assert.equal(forces.length, 8);
  const by = (id) => forces.find((f) => f.id === id);
  assert.deepEqual([by('taylor').since, by('taylor').tech, by('taylor').tech_drawn, by('taylor').earlier_stands], ['1847-02-22', 'musket', true, 2]);
  assert.deepEqual([by('scott').since, by('scott').at.lat > 19 && by('scott').at.lat < 19.6], ['1847-09-14', true], 'Scott stands in Mexico City');
  assert.equal(by('kearny').tech, 'cavalry');
  assert.deepEqual(s.resolved.war.icons_used.map((i) => i.key).sort(), ['cavalry', 'fort', 'musket', 'paddle-steamer']);
  assert.ok(s.resolved.war.icons_used.every((i) => i.author && i.license === 'CC BY 3.0' && i.reference));
  assert.match(s.credit, /icons: game-icons\.net contributors \(CC BY 3\.0\); force frames: milsymbol \(MIT\)/);
  assert.match(s.alt_text, /Forces on the map: Taylor \(us, musket\)/);
  const labels = s.legend.rows.map((r) => r.label);
  assert.ok(labels.includes('A force: its type and size (XX a division)') && labels.includes('Fort (one mark in every era)') && labels.some((l) => /^musket, 1500–1860$/.test(l)));
  // the date check: a copy of the table with a tank on Taylor's march
  const csv = readFileSync(new URL('../data/military.csv', import.meta.url), 'utf8').replace(/(test-mx-mv-taylor-3,.*?,mexican-american-war,us,taylor,),,,$/m, '$1,,,tank-great-war');
  assert.ok(/taylor,,,,tank-great-war/.test(csv), 'the test row carries the tank');
  // the copy lives under the repository (the page fetches ?records= from the served folder) and is removed after
  const { writeFileSync, unlinkSync, mkdirSync } = await import('node:fs');
  const tankFile = new URL('../out/test-tank-records.csv', import.meta.url);
  mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
  writeFileSync(tankFile, csv);
  try {
    const tank = await renderOrder({ ...order('military/mexico-war-1848-full'), inset: undefined, records: 'out/test-tank-records.csv' }, { out: join(OUT, 'tank'), base: OUT, browser });
    const t = tank.slip.resolved.war.forces.find((f) => f.id === 'taylor');
    assert.equal(t.tech_drawn, false, 'no tank in 1848');
    assert.match(t.tech_note, /not in 1848/);
    assert.ok(!tank.slip.resolved.war.icons_used.some((i) => i.key === 'tank-great-war'));
  } finally { unlinkSync(tankFile); }
});

test('the play run (milestone 7): a film still in its chapter, the chapter’s war and strip; after the war the armies stand down', { skip, timeout: 240000 }, async () => {
  const { slip: s } = await render('military/texas-film', { date: '1836-04-21', out: undefined });
  assert.deepEqual(s.render.page_errors, []);
  assert.deepEqual([s.resolved.war.film.id, s.resolved.war.film.chapter.n, s.resolved.war.film.chapter.count, s.resolved.war.film.chapter.war], ['texas-1821-1854', 2, 5, 'texas-revolution']);
  assert.deepEqual(s.resolved.war.film.chapter_span, ['1835-10-02', '1836-05-14']);
  assert.equal(s.resolved.war.id, 'texas-revolution');
  assert.equal(s.resolved.title, 'The Texas Revolution, 1835–1836', 'the cartouche carries the chapter');
  assert.ok(s.points.length >= 9 && s.points.length <= 12, `the events begun by San Jacinto that fall on the Texas frame (${s.points.length}; Zacatecas and the Law of 1830 are off it)`);
  assert.equal(s.resolved.frame?.id ?? s.order.frame ?? 'texas', 'texas', 'the chapter brings the Texas frame');
  assert.ok(s.points.some((p) => p.record === 'test-tr-ev-goliad'));
  assert.equal(s.routes.length, 5, 'Cos, Santa Anna twice, Urrea and Houston; the retreat under Filisola begins five days later');
  const labels = s.legend.rows.map((r) => r.label);
  assert.ok(labels.includes('Texas') && labels.includes('Mexico') && labels.some((l) => /under review/.test(l)));
  assert.ok(s.resolved.war.forces.some((f) => f.id === 'houston' && f.since === '1836-04-20'));
  const after = await render('military/texas-film', { date: '1853-12-31', out: undefined });
  assert.deepEqual([after.slip.resolved.war.film.chapter.n, after.slip.resolved.war.id], [5, 'mexican-american-war']);
  assert.equal(after.slip.routes.length, 0, 'after the war the armies stand down');
  assert.equal(after.slip.resolved.war.forces.length, 0);
  assert.equal(after.slip.points.length, 22, 'the war and its three aftermath events');
  assert.equal(after.slip.resolved.war.course.at(-1).label, 'Gadsden Purchase treaty');
});

test('off by default: the same Texas order under the nations tracker is the nations map, legend and all', { skip, timeout: 180000 }, async () => {
  const { slip: s } = await render('military/texas-1846-sides', { layer: undefined, war: undefined, names: undefined, records: 'tests/maps/texas-records.csv', annotate: { rivers: ['Nueces', 'Rio Grande'], places: ['Q49242', 'Q738353', 'Q2613729', 'Q16868'], routes: ['test-tx-taylor-march'] } });
  assert.equal(s.resolved.tracker.id, 'nations');
  assert.equal(s.resolved.war, null);
  assert.deepEqual(s.legend.rows.slice(0, 2).map((r) => [r.label, r.fill]), [['United States', '#78b58a'], ['Mexico', '#58b4c3']]);
  assert.equal(s.resolved.address.includes('war='), false);
});

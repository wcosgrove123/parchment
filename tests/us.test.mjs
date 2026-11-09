// North America stage: the dates, and the derived data in data/us/ checked against what history allows.
// Each check is a mistake the stage once made, or one the sources could lead it into.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDate, longDate, nextDay, endOfYear, OPEN } from '../src/us/dates.js';
import { prepareData, aliveNB, aliveOHM, aliveNative, powerAt, US_FROM } from '../src/us/model.js';

const read = (f) => JSON.parse(readFileSync(new URL(`../data/us/${f}`, import.meta.url), 'utf8'));
const data = prepareData({ nbTopo: read('newberry.topojson'), ohmTopo: read('ohm.topojson'), cesTopo: read('cessions.topojson'), natTopo: read('native.topojson') });
const shown = (d) => aliveOHM(data, d).map((it) => ({ name: it.p.name, pw: powerAt(it.p, d) }));

test('dates: a bare year is its last day; a day is kept; leap years and month ends', () => {
  assert.equal(parseDate('1803'), 18031231);
  assert.equal(parseDate('1803-12-20'), 18031220);
  assert.equal(parseDate('1804-02'), 18040229);
  assert.equal(parseDate('1900-02-30'), 19000228);
  assert.equal(parseDate('nonsense'), null);
  assert.equal(longDate(18031220), '20 December 1803');
  assert.equal(longDate(OPEN), 'the present');
  assert.equal(nextDay(18041231), 18050101);
  assert.equal(endOfYear(1776), 17761231);
});

test('Newberry: the Treaty of Paris is the first day; one polygon per entity per day', () => {
  assert.equal(aliveNB(data, US_FROM - 1).length, 0);
  assert.ok(aliveNB(data, US_FROM).length > 10);
  for (const d of [17831231, 18031231, 18501231, 18611231, 19121231, 20261105]) {
    const ids = aliveNB(data, d).map((it) => it.p.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate Newberry ids on ${d}`);
  }
});

test('Newberry: today there are fifty states and the District of Columbia', () => {
  const now = aliveNB(data, 20261105);
  assert.equal(now.filter((it) => it.p.type === 'State').length, 50);
  assert.equal(now.filter((it) => it.p.type === 'District of Columbia').length, 1);
  assert.equal(now.length, 51);
});

test('no "Mexico" before independence (28 September 1821)', () => {
  for (const it of data.ohm) for (const [from, pw] of it.p.pw) {
    if (pw === 'mexico') assert.ok(from >= 18210928, `${it.p.name} is Mexican from ${from}`);
  }
  for (const d of [17541231, 18031231, 18201231]) assert.ok(!shown(d).some((x) => x.pw === 'mexico'), `Mexico shown on ${d}`);
});

test('the Confederacy ends: nothing is "in rebellion" before 20 December 1860 or after 1865', () => {
  assert.ok(shown(18611231).some((x) => x.pw === 'rebellion'), 'the Confederacy is on the 1861 map');
  for (const d of [18601219, 18661231, 19001231, 20261105]) {
    const r = shown(d).filter((x) => x.pw === 'rebellion');
    assert.equal(r.length, 0, `in rebellion on ${d}: ${r.map((x) => x.name).join(', ')}`);
  }
});

test('after the Treaty of Paris, OpenHistoricalMap never draws the United States (Newberry does)', () => {
  for (const d of [17831231, 18501231, 19501231, 20261105]) {
    const us = shown(d).filter((x) => x.pw === 'us');
    assert.equal(us.length, 0, `OHM draws the U.S. on ${d}: ${us.map((x) => x.name).join(', ')}`);
  }
});

test('1754: France, Spain and Britain hold land; the United States does not exist', () => {
  const pws = new Set(shown(17541231).map((x) => x.pw));
  for (const p of ['france', 'spain', 'britain']) assert.ok(pws.has(p), `no ${p} in 1754`);
  assert.ok(!pws.has('us'));
  assert.equal(aliveNB(data, 17541231).length, 0);
});

test('Native homelands: drawn from 1492 until the Treaty of Paris, never after', () => {
  assert.ok(aliveNative(data, 14921231).length > 100);
  assert.ok(aliveNative(data, 17821231).length > 10);
  assert.equal(aliveNative(data, US_FROM).length, 0);
});

test('no nation on the map before it existed: the Métis (1700s) are not on the 1492 or 1530 maps', () => {
  for (const d of [14921231, 15301231]) {
    const m = aliveNative(data, d).filter((it) => /Métis|Michif/i.test(it.p.name));
    assert.equal(m.length, 0, `on ${d}: ${m.map((it) => it.p.name).join(', ')}`);
  }
});

test('Royce cessions are dated within the schedule (1784–1894)', () => {
  assert.ok(data.ces.length > 700);
  for (const c of data.ces) assert.ok(c.p.d >= 17840101 && c.p.d <= 18941231, `Royce ${c.p.n} dated ${c.p.d}`);
});

test('overlapping claims join two different powers and live only while both do', () => {
  const byRid = new Map(data.ohm.map((it) => [String(it.p.rid), it.p]));
  const overlaps = data.ohm.filter((it) => it.p.lvl === 'x');
  for (const { p } of overlaps) {
    const a = byRid.get(String(p.a)), b = byRid.get(String(p.b));
    assert.ok(a && b, `overlap ${p.rid} names a missing polygon`);
    assert.ok(p.s >= Math.max(a.s, b.s) && p.e <= Math.min(a.e, b.e), `overlap ${p.rid} outlives its claims`);
    assert.notEqual(powerAt(a, p.s), powerAt(b, p.s), `overlap ${p.rid} joins one power to itself`);
  }
});

// ---------------------------------------------------------------- the Diff view (src/us/diff.js)
import { diffUS, byKind, unitsAt } from '../src/us/diff.js';
const powers = JSON.parse(readFileSync(new URL('../src/us/powers.json', import.meta.url), 'utf8'));
const keys = (list) => list.map((u) => u.key).sort();

test('Diff, states 1783 → 1853: states admitted and territories created, by Newberry id', () => {
  const d = diffUS(data, 17831231, 18531231, 'states', { powers });
  const k = byKind(d.appeared);
  assert.equal(k.state.length, 18, 'eighteen states admitted, Vermont to California');
  assert.equal(k.state[0].key, 'nb:vt_state');
  assert.equal(Math.trunc(k.state[0].since / 10000), 1791);
  assert.ok(k.state.some((u) => u.key === 'nb:ca_state' && Math.trunc(u.since / 10000) === 1850), 'California, 1850');
  assert.ok(k.territory.some((u) => u.key === 'nb:mn_terr'), 'Minnesota Territory created');
  assert.deepEqual(keys(d.vanished), ['nb:er_triangleuft', 'nb:vt_republic']);
  // a new version of an id is the same unit with new borders, not a vanished one and an appeared one
  const va = d.persisted.find((u) => u.key === 'nb:va_state');
  assert.ok(va?.reshaped, 'Virginia persists, with new borders');
  for (const u of d.appeared) assert.ok(!d.vanished.some((x) => x.key === u.key));
});

test('Diff, nations 1783 → 1853: a colony redrawn under a new OHM relation persists; the United States grows', () => {
  const d = diffUS(data, 17831231, 18531231, 'nations', { powers, minKm2: 20000 });
  const rl = d.persisted.find((u) => u.label === "Rupert's Land");
  assert.ok(rl, "Rupert's Land persists");
  assert.notEqual(rl.a[0].p.rid, rl.b[0].p.rid, 'though OpenHistoricalMap holds it as two relations');
  assert.ok(d.changed.find((u) => u.key === 'us')?.grew, 'the United States gained land');
  assert.ok(d.vanished.some((u) => u.label === 'Spanish Louisiana'));
  assert.ok(d.appeared.some((u) => u.label === 'Mexico'));
  assert.ok(d.changed.some((u) => u.from === 'spain' && u.to === 'mexico'), 'a Spanish province passes to Mexico');
  // no OHM unit is given a year: OHM's first record of a country can be a later regime (Mexico's starts in 1846)
  for (const u of [...d.appeared, ...d.vanished]) if (u.key.startsWith('ohm:')) assert.equal(u.since ?? u.until ?? null, null, u.label);
  // provinces fold into the country that holds them
  const mx = d.appeared.find((u) => u.label === 'Mexico');
  assert.ok(mx.inner >= 10 && d.appeared.some((u) => u.label === 'Sonora' && u.within === mx.key));
});

test('Diff against the same date is empty; reversed, appeared and vanished trade places', () => {
  for (const t of ['states', 'nations']) {
    const same = diffUS(data, 18031231, 18031231, t, { powers });
    assert.equal(same.appeared.length + same.vanished.length + same.changed.length, 0, t);
    const f = diffUS(data, 18031231, 18611231, t, { powers }), r = diffUS(data, 18611231, 18031231, t, { powers });
    assert.deepEqual(keys(f.appeared), keys(r.vanished), t);
    assert.deepEqual(keys(f.vanished), keys(r.appeared), t);
  }
});

test('Diff never compares Native homelands from historical-basemaps (its snapshots come from different sources)', () => {
  for (const d of [14921231, 16501231, 17541231]) assert.ok(unitsAt(data, d, 'nations', { powers }).every((u) => u.it.src !== 'hb'));
  // and the Confederacy (on the record from South Carolina's secession, 20 December 1860) is gone by 1866
  assert.ok(diffUS(data, 18591231, 18611231, 'nations', { powers }).appeared.some((u) => u.power === 'rebellion'));
  assert.ok(diffUS(data, 18611231, 18661231, 'nations', { powers }).vanished.some((u) => u.power === 'rebellion'));
});

// ---------------------------------------------------------------- Native population and Native lands (2026-11-06)
import { geoContains, geoCentroid } from 'd3';
import { censusOn, unitsFor, estimatesOn, densityStep } from '../src/us/native.js';
import { aliveLands, aliveICC, aliveTreaty, aliveTreatyX } from '../src/us/model.js';

const pop = read('native.json');
const ndata = prepareData({ nbTopo: read('newberry.topojson'), ohmTopo: read('ohm.topojson'), cesTopo: read('cessions.topojson'), natTopo: read('native.topojson'), pop, landsTopo: read('native-lands.topojson') });
const treatyOf = (nation) => ndata.treaty.filter((it) => it.p.nation === nation).sort((a, b) => a.p.s - b.p.s);

test('Native population: every count adds up, state by state, to the national figure the Census printed', () => {
  assert.equal(pop.census.length, 17);
  for (const c of pop.census) {
    const sum = c.states.reduce((a, s) => a + s.aian, 0);
    assert.equal(sum, c.us, `${c.year}: states add to ${sum}, the nation to ${c.us}`);
  }
  const by = Object.fromEntries(pop.census.map((c) => [c.year, c.us]));
  assert.equal(by[2000], 2475956);
  assert.equal(by[2010], 2932248);
  assert.equal(by[2020], 3727135);
});

test('Native population: nothing is shaded before the first full count (2 June 1890); the earlier counts left most out', () => {
  assert.equal(censusOn(pop, 18591231), null);
  assert.equal(censusOn(pop, 18900601).year, 1880);
  assert.equal(censusOn(pop, 18900601).full, false);
  assert.equal(censusOn(pop, 18900602).year, 1890);
  assert.ok(pop.census.every((c) => c.full === c.year >= 1890));
  assert.equal(densityStep(9.9), 1);
  assert.equal(densityStep(800), 5);
});

test('Native population: Oklahoma Territory and Indian Territory share the 1890 and 1900 counts for Oklahoma', () => {
  for (const d of [18900602, 19001231]) {
    const census = censusOn(pop, d);
    const alive = aliveNB(ndata, d);
    const { units, outside } = unitsFor(census, pop.anchors, alive, pop.home);
    assert.deepEqual(outside, [], `${census.year}: states with no polygon`);
    const it = alive.find((x) => x.p.id === 'it_indianterr');
    const ok = alive.find((x) => x.p.id === 'ok_terr');
    assert.ok(units.get(it) && units.get(it) === units.get(ok), `${census.year}: one unit for both territories`);
    assert.equal(units.get(it).aian, census.states.find((s) => s.state === 'Oklahoma').aian);
  }
});

test('Native population: every scholarly estimate is sourced and graded, its range holds its value, and windows never overlap', () => {
  for (const e of pop.estimates) {
    assert.ok(e.source && e.source.length > 20, `${e.id}: no source`);
    assert.ok(['exact', 'circa', 'uncertain'].includes(e.grade), `${e.id}: grade ${e.grade}`);
    if (e.value != null && e.low != null) assert.ok(e.low <= e.value && e.value <= e.high, `${e.id}: value outside its range`);
    assert.ok(e.s <= e.e);
  }
  for (const place of new Set(pop.estimates.map((e) => e.place))) {
    const list = pop.estimates.filter((e) => e.place === place).sort((a, b) => a.s - b.s);
    for (let i = 1; i < list.length; i++) assert.ok(list[i].s > list[i - 1].e, `${place}: ${list[i - 1].id} and ${list[i].id} overlap`);
  }
  assert.deepEqual(estimatesOn(pop, 18341231).placed.map((e) => e.id), ['california-1769']);
  assert.equal(estimatesOn(pop, 17681231).placed.length, 0);
});

test('Native lands today: held land from 2020 only; the statistical areas the Census draws for counting are never filled', () => {
  assert.equal(aliveLands(ndata, 20191231).length, 0);
  const now = aliveLands(ndata, 20261106);
  assert.ok(now.length > 300);
  assert.ok(now.every((it) => it.p.kind !== 'statistical'));
  assert.ok(ndata.aiannh.some((it) => it.p.kind === 'statistical'), 'the statistical areas are in the data, only not drawn');
});

test('original territories (Indian Claims Commission, 1978): outlined from the first cession (1784) to the map, never after', () => {
  assert.equal(aliveICC(ndata, 17831231).length, 0);
  assert.ok(aliveICC(ndata, 18401231).length > 250);
  assert.equal(aliveICC(ndata, 19790101).length, 0);
});

test('treaty land: each nation follows one boundary after another, day by day, shrinking at every treaty, until Removal', () => {
  const span = { cherokee: [17851128, 18351228], creek: [17900807, 18320323], choctaw: [17860103, 18300926], chickasaw: [17860110, 18321019], seminole: [18230918, 18320508] };
  for (const [nation, [first, last]] of Object.entries(span)) {
    const list = treatyOf(nation);
    assert.ok(list.length, `${nation}: no treaty land`);
    assert.equal(list[0].p.s, first, `${nation}: first day`);
    assert.equal(list[list.length - 1].p.e, last, `${nation}: last day`);
    for (let i = 1; i < list.length; i++) {
      assert.equal(list[i].p.s, nextDay(list[i - 1].p.e), `${nation}: gap or overlap before ${list[i].p.s}`);
      assert.ok(list[i].p.km2 < list[i - 1].p.km2, `${nation}: land grew on ${list[i].p.s}`);
    }
  }
  assert.ok(aliveTreaty(ndata, 18351228).some((it) => it.p.nation === 'cherokee'));
  assert.ok(!aliveTreaty(ndata, 18351229).some((it) => it.p.nation === 'cherokee'), 'the Treaty of New Echota (29 December 1835) ends it');
  assert.equal(aliveTreaty(ndata, 18400101).length, 0);
});

test('treaty land: ceded land is never held, and land reserved by one treaty passes only at the treaty that ceded it', () => {
  const area = (n) => ndata.ces.find((c) => c.p.n === String(n));
  const inside = (n) => { const f = area(n).f; const c = geoCentroid(f); assert.ok(geoContains(f, c), `area ${n}: centroid outside`); return c; };
  const cherokeeHolds = (d, pt) => aliveTreaty(ndata, d).some((it) => it.p.nation === 'cherokee' && geoContains(it.f, pt));
  // Hopewell (1785): area 3 was ceded by the very treaty that first set the boundary
  assert.ok(!cherokeeHolds(17851128, inside(3)));
  // Holston (2 July 1791): area 8 is Cherokee the day before, ceded that day
  assert.ok(cherokeeHolds(17910701, inside(8)));
  assert.ok(!cherokeeHolds(17910702, inside(8)));
  // Washington (7 January 1806): the Duck River tract passes in 1806; the treaty of 1807 only explained its line
  assert.ok(cherokeeHolds(18060106, inside(64)));
  assert.ok(!cherokeeHolds(18060107, inside(64)));
  // Doublehead's reserves of 1806 (areas 85, 86) were ceded on 8 July 1817
  assert.ok(cherokeeHolds(18170707, inside(86)));
  assert.ok(!cherokeeHolds(18170708, inside(86)));
});

test('treaty land: overlaps join two different nations and live only while both hold the land', () => {
  assert.ok(ndata.treatyX.length > 0);
  for (const x of ndata.treatyX) {
    assert.notEqual(x.p.a, x.p.b);
    for (const d of [x.p.s, x.p.e]) {
      const alive = aliveTreaty(ndata, d).map((it) => it.p.nation);
      assert.ok(alive.includes(x.p.a) && alive.includes(x.p.b), `${x.p.a}/${x.p.b} on ${d}`);
    }
  }
  assert.equal(aliveTreatyX(ndata, 18500101).length, 0);
});

test('treaty land: every Cherokee boundary names the place of its treaty (Royce, 1887)', () => {
  for (const it of treatyOf('cherokee')) assert.ok(it.p.place, `no place for the treaty of ${it.p.s}`);
});

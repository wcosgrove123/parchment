// North America stage: the Electoral College tracker. The votes are the National Archives' (data/us/electoral.json,
// written by scripts/fetch-electoral.mjs, which already checks each election against the page's own totals); these
// tests check what the map does with them, and that every state result lands on a Newberry state of its day.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareData, aliveNB } from '../src/us/model.js';
import { electionAt, electionLooks, electoralLegend, electoralLook, someAbstained, surname, resultFor } from '../src/us/electoral.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ec = read('data/us/electoral.json');
const parties = read('src/us/parties.json');
const nbTopo = read('data/us/newberry.topojson');
const data = prepareData({ nbTopo, ohmTopo: read('data/us/ohm.topojson'), cesTopo: null, natTopo: null });
const at = (y) => ec.elections.find((e) => e.year === y);
const looks = (y) => electionLooks(at(y), parties);
const fillOf = (L, name) => L.states.get(name)?.look?.fill ?? L.states.get(name)?.look?.pattern ?? null;

test('sixty elections, 1789–2024, each adding up: candidates, states and the national total', () => {
  assert.equal(ec.elections.length, 60);
  assert.deepEqual([ec.elections[0].year, ec.elections.at(-1).year], [1789, 2024]);
  for (const e of ec.elections) {
    const per = e.rule === 'two-votes' ? 2 : 1;
    for (const c of e.candidates) assert.equal(e.states.reduce((a, s) => a + (s.votes[c.id] ?? 0), 0), c.ev, `${e.year} ${c.name}`);
    for (const s of e.states) assert.ok(Object.values(s.votes).reduce((a, b) => a + b, 0) <= s.electors * per, `${e.year} ${s.name}`);
    const cast = e.states.reduce((a, s) => a + Object.values(s.votes).reduce((p, q) => p + q, 0), 0) / per;
    const uncounted = e.states.reduce((a, s) => a + (s.uncounted ?? 0), 0);
    assert.ok(cast === e.total || cast + uncounted === e.total, `${e.year}: ${cast} + ${uncounted} vs ${e.total}`);
  }
});

test('every state that voted lands on a Newberry polygon of its day; three voted as territories', () => {
  const early = [];
  for (const e of ec.elections) {
    const L = electionLooks(e, parties);
    const alive = aliveNB(data, e.day);
    for (const s of e.states) {
      if (s.absent) continue;
      const it = alive.find((x) => resultFor(L, x.p)?.s === s);
      assert.ok(it, `${e.year}: ${s.name} has no polygon on ${e.day}`);
      if (it.p.type === 'Territory') early.push(`${e.year} ${s.name}`);
    }
  }
  // electors who voted before the day Newberry gives for statehood
  assert.deepEqual(early, ['1816 Indiana', '1820 Missouri', '1836 Michigan']);
});

test('a date shows the latest election held by then (Election Day from 1848; the electors\' day before)', () => {
  assert.equal(electionAt(ec, 17890203), null);
  assert.equal(electionAt(ec, 17890204).year, 1789);
  assert.equal(electionAt(ec, 18601105).year, 1856);
  assert.equal(electionAt(ec, 18601106).year, 1860);
  assert.equal(at(1836).day, 18361207); // the first Wednesday of December 1836
  assert.equal(at(2024).day, 20241105);
});

test('1860: four candidates, four fills; Virginia for Bell, New Jersey divided 4+3', () => {
  const L = looks(1860);
  assert.deepEqual(L.carriers.map((c) => [surname(c.name), c.ev]), [['Lincoln', 180], ['Breckinridge', 72], ['Bell', 39], ['Douglas', 12]]);
  assert.equal(new Set(L.carriers.map((c) => L.looks.get(c.id).fill)).size, 4);
  assert.equal(L.states.get('Virginia').winner.name, 'John Bell');
  assert.equal(L.states.get('New Jersey').badge, '4+3');
  assert.equal(fillOf(L, 'New Jersey'), 'S'); // Lincoln's electors were the four
});

test('a party keeps its color: Democrats P, Republicans S, whenever they carry a state', () => {
  for (const e of ec.elections) {
    const L = electionLooks(e, parties);
    for (const c of L.carriers) {
      const look = L.looks.get(c.id);
      const first = L.carriers.find((k) => L.looks.get(k.id).party === look.party) === c;
      if (first && look.party === 'democratic') assert.equal(look.fill, 'P', `${e.year} ${c.name}`);
      if (first && look.party === 'republican') assert.equal(look.fill, 'S', `${e.year} ${c.name}`);
    }
    assert.ok(new Set(L.carriers.map((c) => L.looks.get(c.id).fill).filter(Boolean)).size <= 4, `${e.year}: more than four fills`);
  }
  assert.equal(L1836().looks.get(L1836().carriers[4].id).pattern, 'hatch', 'the fifth carrier of 1836 (Mangum) is hatched');
});
const L1836 = () => looks(1836);

test('states that cast no vote stay unfilled and are named in the legend: the Confederacy, 1864', () => {
  const L = looks(1864);
  const nb = aliveNB(data, at(1864).day);
  assert.ok(someAbstained(L, nb));
  const va = nb.find((it) => it.p.name === 'Virginia');
  assert.equal(electoralLook(L, va).fill, null);
  assert.ok(electoralLegend(L, { abstained: true }).legend.some((r) => r.label === 'Cast no electoral vote'));
  // territories have no electors
  const terr = nb.find((it) => it.p.type === 'Territory');
  assert.equal(electoralLook(L, terr).fill, null);
});

test('the record\'s own oddities are kept, not smoothed: 1868 Georgia contested, 1872 Greeley, 2000 a blank ballot, ties', () => {
  assert.equal(looks(1868).states.get('Georgia').badge, '(9)');
  assert.ok(at(1872).states.find((s) => s.name === 'Georgia').uncounted === 3);
  assert.ok(!at(1872).candidates.some((c) => /Greeley/.test(c.name)), 'Greeley died before the electors met; his votes were not counted');
  assert.equal(at(2000).states.find((s) => s.name === 'District of Columbia').uncounted, 1);
  assert.equal(looks(2016).states.get('Texas').badge, '36+1+1');
  assert.deepEqual(looks(1800).ties, ['Maryland']);
  assert.deepEqual(looks(1892).ties, ['North Dakota']);
  assert.ok(at(1800).states.find((s) => s.name === 'Virginia').erratum, 'the 1800 Virginia correction says why');
});

// ---------------------------------------------------------------- two elections (the Diff view)
import { electionDiff } from '../src/us/electoral.js';
const ediff = (a, b) => electionDiff(data, looks(a), looks(b));
const names = (list) => list.map((u) => u.label);

test('Diff of two elections, 2020 → 2024: the six states that changed party, all Democratic → Republican', () => {
  const d = ediff(2020, 2024);
  assert.deepEqual(names(d.changed), ['Arizona', 'Georgia', 'Michigan', 'Nevada', 'Pennsylvania', 'Wisconsin']);
  assert.ok(d.changed.every((u) => u.from === 'democratic' && u.to === 'republican'));
  assert.equal(d.appeared.length + d.vanished.length, 0);
  assert.equal(d.persisted.length, 45);
});

test('Diff of two elections, 1860 → 1864 → 1868: the Confederacy stops voting, new states vote, the South votes again', () => {
  const d1 = ediff(1860, 1864);
  assert.equal(d1.vanished.length, 11, 'the eleven Confederate states cast no vote in 1864');
  assert.deepEqual(names(d1.appeared.filter((u) => !u.again)), ['Kansas', 'Nevada', 'West Virginia']);
  const d2 = ediff(1864, 1868);
  assert.ok(d2.appeared.some((u) => u.label === 'Alabama' && u.again), 'Alabama voted again in 1868');
  assert.ok(d2.persisted.some((u) => u.label === 'Virginia' && !u.power), 'Virginia, not yet readmitted, voted in neither');
  // and the comparison runs backwards as well as forwards
  assert.deepEqual(names(ediff(1864, 1860).appeared).sort(), names(d1.vanished).sort());
});

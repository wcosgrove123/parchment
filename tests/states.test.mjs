// The political map from Cliopatria (owner, 2026-11-09): any year, every state in force, each in its own color with
// its neighbors in others, on every world-page stage from one file. src/render/states.js, scripts/derive-cliopatria.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoPath, geoEqualEarth } from 'd3';
import { makeStatesSource, isWholeEmpire, isRealmLine, placeStateLabels, tieLegendLabel, tieLegendRows } from '../src/render/states.js';
import { makeHighlighter } from '../src/data/highlights.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const topo = read('data/base/derived/cliopatria.topojson');
const src = makeStatesSource(topo);
const names = (y) => src.at(y).states.map((f) => f.properties.n);
const extent = read('src/trackers/extent.json');

test('one file covers every year the world page shows, 1200–2000', () => {
  assert.ok(src.span[0] <= 1200 && src.span[1] >= 2000, `span ${src.span}`);
  for (const y of [1200, 1250, 1453, 1750, 1900, 2000]) assert.ok(src.at(y).states.length > 60, `${y}: ${src.at(y).states.length} states`);
  const index = read('data/base/derived/index.json');
  assert.equal(index.layers.cliopatria.file, 'cliopatria.topojson');
  assert.match(index.layers.cliopatria.source, /Cliopatria v0\.2\.1/);
});

test('any year shows the shapes whose years include it, and only those', () => {
  for (const y of [1453, 1502, 1547, 1644, 1645, 1709]) {
    for (const f of src.at(y).states) assert.ok(f.properties.f <= y && y <= f.properties.t, `${y}: ${f.properties.n} ${f.properties.f}–${f.properties.t}`);
  }
  assert.ok(names(1453).includes('Ottoman Empire') && names(1453).includes('Timurid Empire'));
  assert.ok(names(1502).includes('Safavid Dynasty'), '1502: the Safavids (from 1502)');
  assert.ok(!names(1501).includes('Safavid Dynasty'), '1501: not yet');
  assert.ok(names(1547).includes('Tsardom of Russia') && !names(1547).includes('Grand Principality of Moscow'), '1547: Ivan IV crowned tsar');
  assert.ok(names(1644).includes('Ming Dynasty') && !names(1644).includes('Qing Dynasty'), '1644: Ming');
  assert.ok(names(1645).includes('Qing Dynasty') && !names(1645).includes('Ming Dynasty'), '1645: Qing (Cliopatria changes on its own grid)');
  assert.ok(names(1709).includes('Kingdom of Great Britain') && !names(1708).includes('Kingdom of Great Britain'), 'Great Britain first in 1709 on Cliopatria’s grid (the Union was 1 May 1707)');
});

test('neighbors in force at the same time never share a color', () => {
  const index = read('data/base/derived/index.json');
  assert.equal(index.layers.cliopatria.clashes, 0);
  for (const f of src.at(1600).states) assert.ok(Number.isInteger(f.properties.c) && f.properties.c >= 0 && f.properties.c < 12, `${f.properties.n}: color ${f.properties.c}`);
  const ottoman = (y) => src.at(y).states.find((f) => f.properties.n === 'Ottoman Empire').properties.c;
  assert.equal(ottoman(1453), ottoman(1700), 'a state keeps its color through time');
});

test('wholes: the Empire’s until 1458, then only its Minor States; realms around two or more members get a line', () => {
  const w = (y) => src.at(y).wholes;
  assert.ok(w(1300).some(isWholeEmpire) && w(1458).some(isWholeEmpire));
  assert.ok(!w(1459).some(isWholeEmpire) && !w(1600).some(isWholeEmpire));
  assert.ok(w(1300).filter(isRealmLine).some((f) => f.properties.n === '(Kingdom of France)'), 'France and its fiefs, 1300');
  assert.ok(!w(1600).filter(isRealmLine).some((f) => f.properties.n === '(Holy Roman Empire)'), 'a whole of one member gets no line');
});

test('tracked empires are found by Cliopatria’s names, and ?focus= still picks them', () => {
  const entry = new Map(extent.highlights.flatMap((h) => h.names.map((n) => [n, h])));
  const expect = { 1453: ['ottoman', 'ming', 'russia'], 1550: ['songhai'], 1600: ['ottoman', 'safavid', 'mughal', 'ming', 'morocco', 'russia', 'france', 'england'], 1700: ['qing', 'tokugawa', 'spain', 'habsburg', 'prussia', 'sweden', 'dutch-republic'], 1709: ['britain'] };
  for (const [y, ids] of Object.entries(expect)) {
    const found = new Set(src.at(Number(y)).states.map((f) => entry.get(f.properties.n)).filter((h) => h && y >= h.start && y <= h.end).map((h) => h.id));
    for (const id of ids) assert.ok(found.has(id), `${y}: ${id}`);
  }
  assert.ok(names(1600).includes('Iberian Union'), '1580–1640: Cliopatria draws Spain and Portugal as one Iberian Union, left under its own name');
  const match = makeHighlighter(extent.highlights, { focus: new Set(['ottoman']) });
  assert.equal(match('Ottoman Empire', 1600)?.id, 'ottoman');
  assert.equal(match('Safavid Dynasty', 1600), null, '?focus=ottoman lights only the Ottomans');
});

test('names are placed largest first, never over one another', () => {
  const path = geoPath(geoEqualEarth().fitExtent([[32, 32], [1888, 1016]], { type: 'Sphere' }));
  const view = src.at(1600);
  const measure = (text, { size }) => text.length * size * 0.62;
  const placed = placeStateLabels(view.states.map((f) => ({ f, text: f.properties.n })), { path, measure, frame: { x0: 32, y0: 32, x1: 1888, y1: 1016 } });
  assert.ok(placed.length >= 6, `${placed.length} names`);
  const box = (l) => { const w = l.text.length * l.size * 0.74 + 4; return [l.x - w / 2, l.y - l.size * 0.62, l.x + w / 2, l.y + l.size * 0.62]; };
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    const a = box(placed[i]), b = box(placed[j]);
    assert.ok(a[2] <= b[0] || b[2] <= a[0] || a[3] <= b[1] || b[3] <= a[1], `${placed[i].text} / ${placed[j].text}`);
  }
});

test('no piece is read inside out (simplifying can flip a tiny triangle; the derive winds it back)', async () => {
  const { geoArea } = await import('d3');
  const { feature } = await import('topojson-client');
  for (const g of topo.objects.states.geometries) {
    const f = feature(topo, g);
    const parts = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const p of parts) assert.ok(geoArea({ type: 'Polygon', coordinates: p }) <= 2 * Math.PI, `${g.properties.n} ${g.properties.f}–${g.properties.t}`);
  }
});

test('renamed with a source: no Golden Horde after 1501; Cliopatria’s 1547–1695 “Golden Horde” over Mongolia is the Khalkha', () => {
  const renames = JSON.parse(readFileSync(new URL('../data/cliopatria-renames.json', import.meta.url), 'utf8')).renames;
  assert.ok(renames.every((r) => r.reason && r.sources?.length && r.owner), 'every rename carries the owner’s word, a reason and sources');
  for (const y of [1502, 1547, 1600, 1650, 1690]) assert.ok(!names(y).includes('Golden Horde'), `${y}: no Golden Horde`);
  assert.ok(names(1450).includes('Golden Horde'), '1450: the Horde on the Volga stays as Cliopatria draws it');
  const k = src.at(1600).states.find((f) => f.properties.n === 'Khalkha');
  assert.ok(k, '1600: the Khalkha');
  assert.equal(k.properties.o, 'Golden Horde', 'Cliopatria’s own name is kept on the row');
  assert.equal(k.properties.wd, 'Q842323');
});

// Vassals and tribute (owner, 2026-11-10: "Yes, do that next", to "Do vassals and tribute next, including the Mongol
// yoke over Russia?"): Cliopatria's own vassalage and allegiance rows, and the ties it does not record, each sourced
// in data/tributaries.json; drawn as stripes in the overlord's color over the vassal.
const tie = (y, vassal) => src.at(y).ties.find((t) => t.vassal.properties.n === vassal || t.vassal.properties.n === `(${vassal})`);

test('the Mongol yoke: the Rus’ principalities pay the Horde, each to the year its sources give', () => {
  const tributaries = read('data/tributaries.json');
  for (const r of tributaries.ties) {
    assert.ok(r.why && r.sources.length, `${r.id}: a reason and sources`);
    for (const s of r.sources) assert.match(tributaries.sources[s]?.url ?? '', /^https:\/\//, `${r.id}: ${s} has a link`);
    assert.ok(topo.ties.some((t) => t.s === r.id && t.v === r.vassal && t.f === r.from && t.t === r.to), `${r.id} is in the derived file`);
  }
  for (const v of ['Grand Principality of Moscow', 'Principality of Vladimir-Suzdal', 'Tver', 'Novgorod Republic', 'Galicia-Volhynia', 'Nizhny Novgorod']) {
    const t = tie(1300, v);
    assert.ok(t, `1300: ${v} pays tribute`);
    assert.equal(t.over.properties.n, 'Golden Horde');
    assert.equal(t.kind, 'tribute');
  }
  assert.equal(tie(1290, 'Novgorod Republic')?.over.properties.n, 'Mongol Empire', '1290: Cliopatria draws the Horde inside the Mongol Empire, so the tribute goes there');
  assert.ok(tie(1480, 'Grand Principality of Moscow'), '1480: the stand on the Ugra, the last year of the yoke');
  assert.ok(!tie(1481, 'Grand Principality of Moscow'), '1481: Moscow pays no one');
  assert.ok(tie(1478, 'Novgorod Republic') && !tie(1479, 'Novgorod Republic'), 'Novgorod: annexed by Moscow in 1478, though Cliopatria draws it to 1481');
  assert.ok(tie(1349, 'Galicia-Volhynia') && !tie(1350, 'Galicia-Volhynia'), 'Galicia-Volhynia: the Polish conquest of 1349 ended its vassalage');
  assert.ok(!tie(1300, 'Pskov Republic'), 'Pskov is left out: no source found says it paid the Horde');
  assert.ok(tributaries.left_out.some((l) => l.state === 'Pskov Republic'), 'and the file says why');
});

test('Cliopatria’s vassalage and allegiance rows are ties, except the Empire’s, whose members its band already shows', () => {
  const rels = topo.objects.states.geometries.map((g) => g.properties).filter((p) => p.k === 'rel');
  let toEmpire = 0;
  for (const p of rels) {
    const m = p.n.match(/^\((Vassalage|Allegiance) of (.+) to (.+)\)$/);
    if (!m) continue;
    if (m[3] === 'Holy Roman Empire') {
      toEmpire++;
      for (let y = Math.max(p.f, 1200); y <= p.t; y++) {
        const v = src.at(y).states.find((f) => f.properties.n === m[2]);
        assert.ok(v && (v.properties.m ?? '').split(';').includes('(Holy Roman Empire)'), `${y}: ${m[2]} is a member of the Empire’s whole, inside its band`);
      }
      continue;
    }
    assert.ok(topo.ties.some((t) => t.s === 'cliopatria' && t.v === m[2] && t.o === m[3] && t.f === p.f && t.t === p.t), `${p.n} ${p.f}–${p.t} is a tie`);
  }
  assert.ok(toEmpire > 0);
  assert.ok(!topo.ties.some((t) => [].concat(t.o).includes('Holy Roman Empire')));
  const y1400 = src.at(1400);
  assert.equal(tie(1400, 'Joseon')?.over.properties.n, 'Ming Dynasty');
  assert.equal(tie(1400, 'Joseon')?.kind, 'allegiance');
  assert.equal(tie(1400, 'Kingdom of Georgia')?.over.properties.n, 'Timurid Empire');
  assert.equal(tie(1400, 'Kingdom of Georgia')?.kind, 'vassal');
  for (const t of y1400.ties) assert.ok(t.from <= 1400 && 1400 <= t.to && y1400.states.includes(t.over), `${t.vassal.properties.n}: in force, its overlord on the map`);
  assert.equal(tie(1300, 'Golden Horde')?.over.properties.n, 'Yuan Dynasty', '1300: the western khanates owe allegiance to the Great Khan');
});

test('the Ottomans’ and the Qing’s vassals, each to the years its sources give, breaks included', () => {
  const by = (y, v) => { const t = tie(y, v); return t ? `${t.kind} ${t.over.properties.n}` : null; };
  for (const v of ['Principality of Wallachia', 'Principality of Moldavia', 'Eastern Hungarian Kingdom']) assert.equal(by(1550, v), 'vassal Ottoman Empire', `1550: ${v}`);
  assert.equal(by(1550, 'Crimean Khanate'), 'protectorate Ottoman Empire', 'Crimea: a protectorate, which paid no tribute');
  assert.equal(by(1550, 'Republic of Ragusa'), 'tribute Ottoman Empire');
  assert.equal(by(1460, 'Principality of Wallachia'), null, 'Vlad III (1456–1462) refused the tribute');
  assert.ok(by(1455, 'Principality of Wallachia') && by(1463, 'Principality of Wallachia'));
  assert.ok(by(1600, 'Principality of Moldavia') && !by(1610, 'Principality of Moldavia') && by(1618, 'Principality of Moldavia'), 'Moldavia: a Polish vassal 1601–1618');
  assert.ok(by(1390, 'Byzantine Empire') && !by(1400, 'Byzantine Empire') && by(1430, 'Byzantine Empire'), 'Byzantium: a vassal 1371–1393, free 1394–1423, a vassal again from 1424');
  assert.ok(by(1690, 'Principality of Transylvania') && !by(1691, 'Principality of Transylvania'), 'Transylvania: under Vienna from 1690');
  assert.ok(by(1774, 'Crimean Khanate') && !by(1775, 'Crimean Khanate'), 'Crimea: to Küçük Kaynarca, 1774');
  assert.equal(by(1600, 'Joseon'), 'allegiance Ming Dynasty', '1600: Cliopatria’s own row ends in 1571; the sourced row carries it to 1636');
  assert.equal(tie(1600, 'Joseon').source, 'joseon-ming');
  assert.equal(by(1640, 'Joseon'), 'tribute Later Jin Dynasty', '1640: Cliopatria names the Qing state the Later Jin to 1644');
  assert.equal(by(1700, 'Joseon'), 'tribute Qing Dynasty');
  assert.equal(by(1693, 'Khalkha'), 'vassal Qing Dynasty', '1691: Dolon Nor');
  assert.equal(by(1690, 'Khalkha'), null);
  assert.equal(by(1750, 'Tibet'), 'protectorate Qing Dynasty');
  assert.equal(by(1719, 'Tibet'), null);
});

test('crowns under one ruler (Cliopatria’s personal unions) are drawn as a realm line round them', () => {
  const u = (y) => src.at(y).unions.map((f) => f.properties.n);
  assert.ok(u(1500).includes('(Personal union of Crown of Aragon with Crown of Castile)'), '1500: Ferdinand and Isabella');
  assert.ok(u(1500).includes('(Personal union of Kingdom of Bohemia with Kingdom of Hungary)'));
  assert.ok(u(1530).includes('(Personal union of Spanish Empire with Habsburg Monarchy)'), '1530: Charles V');
  assert.ok(!src.at(1500).rels.some((f) => f.properties.n.startsWith('(Personal union')), 'not left among the undrawn relation rows');
});

test('a tie in words: the legend line for each overlord, with “the” only before a title', () => {
  assert.equal(tieLegendLabel('tribute', 'Golden Horde'), 'Pays tribute to the Golden Horde');
  assert.equal(tieLegendLabel('vassal', 'Timurid Empire'), 'Vassal of the Timurid Empire');
  assert.equal(tieLegendLabel('allegiance', 'Ming China'), 'Owes allegiance to Ming China');
  assert.equal(tieLegendLabel('allegiance', 'Yuan Dynasty'), 'Owes allegiance to the Yuan Dynasty');
  assert.equal(tieLegendLabel('protectorate', 'Qing China'), 'Protectorate of Qing China');
  assert.equal(tieLegendLabel('protectorate', 'Ottoman Empire'), 'Protectorate of the Ottoman Empire');
  // One line per overlord (its stripes are one color whatever the tie); an allegiance keeps its own.
  const over = (n, c) => ({ properties: { n, c } });
  const ott = over('Ottoman Empire', 3), qing = over('Qing Dynasty', 8);
  const rows = tieLegendRows([
    { kind: 'vassal', over: ott, overName: 'Ottoman Empire' }, { kind: 'protectorate', over: ott, overName: 'Ottoman Empire' },
    { kind: 'tribute', over: ott, overName: 'Ottoman Empire' }, { kind: 'vassal', over: ott, overName: 'Ottoman Empire' },
    { kind: 'tribute', over: over('Golden Horde', 10), overName: 'Golden Horde' },
    { kind: 'protectorate', over: qing, overName: 'Qing China' }, { kind: 'tribute', over: qing, overName: 'Qing China' },
    { kind: 'allegiance', over: over('Yuan Dynasty', 8), overName: 'Yuan Dynasty' }, { kind: 'vassal', over: over('Yuan Dynasty', 8), overName: 'Yuan Dynasty' },
  ]);
  assert.deepEqual(rows.map((r) => r.label), ['Vassal, tributary or protectorate of the Ottoman Empire', 'Pays tribute to the Golden Horde', 'Tributary or protectorate of Qing China', 'Vassal of the Yuan Dynasty', 'Owes allegiance to the Yuan Dynasty']);
  assert.deepEqual(rows.map((r) => r.color), [3, 10, 8, 8, 8]);
});

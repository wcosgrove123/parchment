// The Holy Roman Empire's outer border on the political map (owner, 2026-11-09: OpenHistoricalMap's dated border
// "That's fine with me"; the years nobody has a border for are gaps). src/render/realms.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { empireBand, bandParts, dateOf, BAND_MIN_KM2, empireMarking, empireLegendRows, placeMinorLabel, MINOR_LABEL, GAP_LEGEND, EMPIRE_MINOR } from '../src/render/realms.js';
import { polityLabelData } from '../src/render/labels.js';
import { geoPath, geoAzimuthalEqualArea } from 'd3';
import { makeStatesSource, isRealmLine } from '../src/render/states.js';
import { feature } from 'topojson-client';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const realmsTopo = read('data/base/derived/realms.topojson');
const states = makeStatesSource(read('data/base/derived/cliopatria.topojson'));
const band = (year) => empireBand(year, { realmsTopo, states: states.at(year) });

test('the realms layer holds the Empire only: OpenHistoricalMap relations with dates', () => {
  const fs = feature(realmsTopo, realmsTopo.objects.realms).features;
  assert.ok(fs.length >= 10);
  for (const f of fs) {
    assert.equal(f.properties.realm, 'hre');
    assert.ok(f.properties.s < f.properties.e, `${f.properties.rid}: dates`);
  }
});

test('before 1459 the band is Cliopatria’s whole Empire (a whole of many members)', () => {
  for (const y of [1250, 1300, 1356, 1453, 1458]) {
    const b = band(y);
    assert.equal(b?.source, 'cliopatria', `${y}`);
    assert.equal(b.features[0].properties.n, '(Holy Roman Empire)');
  }
});

test('1459–1648 and 1659–1678: no line at all, a gap rather than a guess', () => {
  for (const y of [1459, 1500, 1536, 1600, 1619, 1620, 1621, 1647, 1660, 1677]) assert.equal(band(y), null, `${y}`);
});

test('from Westphalia the Empire is OpenHistoricalMap’s border, dated by treaty and drawn dashed', () => {
  assert.deepEqual(band(1650).rids, [2831515], '24 October 1648 – 7 November 1659');
  assert.deepEqual(band(1700).rids, [2831111], '1697–1713');
  assert.deepEqual(band(1715).rids, [2815489], '1713–1742');
  assert.deepEqual(band(1750).rids, [2815362], '1742–1766');
  assert.equal(band(1700).source, 'ohm');
  assert.equal(band(1700).certainty, 'approximate', 'tagged "needs source for boundary lines"');
  assert.equal(dateOf(1648), 16480701, 'a year is read on 1 July');
});

test('the band runs round the Empire’s large pieces; enclaves keep only the line', () => {
  const { big, small } = bandParts(band(1750).features);
  assert.ok(big.geometry.coordinates.length >= 2 && small.geometry.coordinates.length > 20, 'after 1648, dozens of enclaves');
  assert.ok(BAND_MIN_KM2 > 0);
});

test('1619–1621: Cliopatria’s two-member whole (the Minor States and a leaf holding Prague) is not drawn as the Empire', () => {
  const whole = states.at(1620).wholes.find((f) => f.properties.n === '(Holy Roman Empire)');
  assert.ok(whole && whole.properties.cn > 1, 'Cliopatria lists two members in 1620');
  assert.equal(band(1620), null, 'under half the Empire: a gap year, not a band');
  assert.ok(!states.at(1620).wholes.filter(isRealmLine).some((f) => f.properties.n === '(Holy Roman Empire)'), 'and no realm line round it either');
});

test('a gap year (1630) names the minor states and says in the legend that the border is not dated; a band year (1700) does not', () => {
  const m1630 = empireMarking(1630, { realmsTopo, states: states.at(1630) });
  assert.equal(m1630.band, null);
  assert.ok(m1630.gap, '1630: the Empire stood');
  assert.equal(m1630.minor?.properties.n, EMPIRE_MINOR);
  assert.deepEqual(empireLegendRows(m1630), [{ swatch: 'band', style: 'missing', label: GAP_LEGEND }]);
  const path = geoPath(geoAzimuthalEqualArea().rotate([-10, -52]).fitExtent([[32, 32], [1888, 1016]], { type: 'Polygon', coordinates: [[[-25, 71], [45, 71], [45, 34], [-25, 34], [-25, 71]]] }));
  const label = placeMinorLabel(m1630.minor, { labelData: (fs) => polityLabelData(fs, path, { minW: 10, minH: 5 }), measure: (t, { size }) => t.length * size * 0.62 });
  assert.equal(label?.text, MINOR_LABEL);
  assert.ok(!/^Holy Roman Empire$/.test(MINOR_LABEL), 'never read as the whole Empire');
  const m1700 = empireMarking(1700, { realmsTopo, states: states.at(1700) });
  assert.ok(m1700.band && !m1700.gap && !m1700.minor);
  assert.deepEqual(empireLegendRows(m1700).map((r) => r.label), ['Holy Roman Empire']);
  assert.ok(!empireLegendRows(m1700).some((r) => r.label === GAP_LEGEND));
  const m1300 = empireMarking(1300, { realmsTopo, states: states.at(1300) });
  assert.equal(m1300.band?.source, 'cliopatria');
  assert.ok(!m1300.gap);
});

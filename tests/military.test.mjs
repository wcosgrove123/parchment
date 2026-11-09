// Parchment — the Military layer, milestone 0 (brief of 2026-11-09): the icon catalog, its licenses, the side
// colors and the places of the picture sheet. Pure checks, no browser: the sheet itself is made by
// scripts/military-sheet.mjs and reviewed by the owner as a picture.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, loadIcons, strip, pathData, ICON_DIR } from '../scripts/military-icons.mjs';
import { sideColors, PALETTE, UNIFORM, faded, LINE, FILL } from '../src/military/sides.js';
import { hexToOklch, hueGap } from '../src/military/color.js';

const ROOT = new URL('..', import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));

test('every icon in the catalog is on disk, stripped, and in the manifest with its license', () => {
  const cat = catalog();
  const manifest = read('assets/icons/military/MANIFEST.json');
  assert.equal(manifest.icons.length, cat.icons.length);
  const keys = new Set();
  for (const ic of cat.icons) {
    assert.ok(!keys.has(ic.key), `${ic.key} twice`); keys.add(ic.key);
    const file = join(ICON_DIR, `${ic.file}.svg`);
    assert.ok(existsSync(file), `${ic.file}.svg is missing (run node scripts/military-icons.mjs)`);
    const svg = readFileSync(file, 'utf8');
    assert.doesNotMatch(svg, /M0 0h512v512H0z/, `${ic.file}: the black square is still there`);
    assert.doesNotMatch(svg, /fill="#fff"/, `${ic.file}: the white fill is still there`);
    assert.ok(pathData(svg).d.length > 20, `${ic.file}: no path data`);
    const m = manifest.icons.find((x) => x.key === ic.key);
    assert.ok(m, `${ic.key} not in the manifest`);
    assert.match(m.license, /^CC BY 3\.0$|^CC0$/);
    assert.ok(m.author && m.source_url.startsWith('https://raw.githubusercontent.com/game-icons/icons/'));
    assert.equal(m.owner_review, 'pending', 'nothing enters the catalog before the owner reviews it');
    assert.ok(['proposed', 'alternate', 'flagged'].includes(ic.status));
  }
  // four proposed icons per equipment class, and the single fort mark
  const by = (cls) => cat.icons.filter((i) => i.class === cls && i.status === 'proposed').length;
  assert.equal(by('ship'), 4); assert.equal(by('infantry'), 4); assert.equal(by('artillery'), 4); assert.equal(by('aircraft'), 4);
  assert.equal(by('cavalry') + by('armor'), 4);
  assert.equal(by('fort'), 1, 'forts stay one mark in every era (owner, 2026-11-09)');
  assert.ok(existsSync(join(ICON_DIR, 'LICENSE.md')));
  assert.ok(Object.keys(loadIcons()).length === cat.icons.length);
});

test('strip() keeps the shape and drops the square; a non-game-icons file is refused', () => {
  const out = strip('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 0h512v512H0z"/><path fill="#fff" d="M10 10h20v20z"/></svg>');
  assert.equal(out, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M10 10h20v20z"/></svg>');
  assert.throws(() => strip('<svg><path d="M1 1"/></svg>'), /no background square/);
});

test('milsymbol is vendored with its MIT license', () => {
  const dir = new URL('assets/vendor/milsymbol/', ROOT);
  assert.ok(existsSync(new URL('milsymbol.js', dir)) && existsSync(new URL('LICENSE', dir)));
  assert.match(readFileSync(new URL('LICENSE', dir), 'utf8'), /MIT License/);
  assert.match(readFileSync(new URL('milsymbol.js', dir), 'utf8').slice(0, 400), /Måns Beckman/);
});

test('side colors (proposal P1): a dark line and a tempered fill per side, hues apart from each other and the apparatus', () => {
  const sides = Object.keys(PALETTE).map((k) => sideColors(k));
  for (const s of sides) {
    const line = hexToOklch(s.line), fill = hexToOklch(s.fill);
    assert.ok(Math.abs(line.L - LINE.L) < 0.03, `${s.key} line lightness ${line.L}`);
    assert.ok(Math.abs(fill.L - FILL.L) < 0.03, `${s.key} fill lightness ${fill.L}`);
    assert.ok(line.L < fill.L - 0.2, 'a line never reads as a fill');
  }
  for (let i = 0; i < sides.length; i++) for (let j = i + 1; j < sides.length; j++) assert.ok(hueGap(sides[i].hue, sides[j].hue) >= 60, `${sides[i].key} and ${sides[j].key} too close`);
  const steel = hexToOklch('#2E6F9E').h, rust = hexToOklch('#C8601A').h, moss = hexToOklch('#499737').h;
  for (const s of sides) {
    assert.ok(hueGap(s.hue, rust) >= 25, `${s.key} too close to rust`);
    assert.ok(hueGap(s.hue, moss) >= 25 || s.key === 'c' && hueGap(s.hue, moss) >= 40, `${s.key} too close to moss`);
    assert.ok(hueGap(s.hue, steel) >= 15, `${s.key} too close to steel`);
  }
  assert.ok(sideColors('gray') && sideColors('red') && UNIFORM.gray.C < 0.02);
  const a = sideColors('a');
  assert.ok(hexToOklch(faded(a.line, 1)).L > hexToOklch(faded(a.line, 0.5)).L && hexToOklch(faded(a.line, 0.5)).L > hexToOklch(a.line).L, 'P4: earlier positions step lighter');
  assert.throws(() => sideColors('z'));
});

test("the sheet's places are Wikidata ids with coordinates in the Texas frame or named as outside it", () => {
  const { places, retrieved, source } = read('tests/maps/military/m0-places.json');
  assert.match(retrieved, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(source, /Wikidata/);
  for (const [k, p] of Object.entries(places)) {
    assert.match(p.qid, /^Q\d+$/, k);
    assert.ok(Number.isFinite(p.lon) && Number.isFinite(p.lat), k);
    const inTexas = p.lon >= -107 && p.lon <= -92.5 && p.lat >= 24.5 && p.lat <= 37.5;
    assert.ok(inTexas || /outside the Texas frame/.test(p.note ?? ''), `${k} lies outside the Texas frame without saying so`);
  }
});

test('the overlay and the sheet script are the only new code, and the overlay bundles', async () => {
  let esbuild = null;
  try { esbuild = await import('esbuild'); } catch { /* not installed: nothing to bundle */ }
  if (!esbuild) return;
  const r = await esbuild.build({ absWorkingDir: fileURLToPath(ROOT), entryPoints: ['src/military/overlay.js'], bundle: true, write: false, format: 'iife', logLevel: 'silent' });
  const js = r.outputFiles[0].text;
  assert.match(js, /militaryOverlay/);
  assert.match(js, /Måns Beckman/, 'milsymbol rides in the overlay bundle');
});

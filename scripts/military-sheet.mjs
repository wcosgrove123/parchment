#!/usr/bin/env node
// Parchment — military-sheet.mjs: milestone 0 of the Military layer (brief of 2026-11-09).
// One picture sheet for the owner: proposals P1–P10 and the force marks with their equipment icons, every one a
// mock-up drawn over a live render of the Texas 1846 lesson map, plus the icon catalog for review.
//   node scripts/military-sheet.mjs                 → docs/progress/<date>-military-sheet.png and -military-icons.png
//   node scripts/military-sheet.mjs --only P3,P5    → just those panels, to out/military/ (for iterating)
//   node scripts/military-sheet.mjs --out dir       → write everything there instead
// Each panel is the North America page opened with an order (the same addresses npm run map uses), with
// src/military/overlay.js injected after the page is ready to draw the proposal on top. Nothing in the page's own
// code changes; no file in src/ outside src/military/ is touched. Places come from tests/maps/military/m0-places.json
// (Wikidata coordinates); every date and number on the sheet is an illustration of a FORM and says so.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, findBrowser, NO_BROWSER } from './browser.mjs';
import { serve, bundle } from './serve.mjs';
import { orderToQuery } from '../src/us/frames.js';
import { loadIcons, catalog } from './military-icons.mjs';
import { sideColors, PALETTE, UNIFORM, PAPER } from '../src/military/sides.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NAVY = '#1F2A44', RUST = '#C8601A', GOLD = '#c8a65d', CREAM = '#F7F5EF';
const places = JSON.parse(readFileSync(join(ROOT, 'tests', 'maps', 'military', 'm0-places.json'), 'utf8')).places;
const icons = loadIcons();
const cat = catalog();
const S = Object.fromEntries(['a', 'b', 'c', 'd', 'gray', 'red'].map((k) => [k, sideColors(k)]));
const SIDES = { a: S.a, b: S.b, c: S.c, d: S.d, gray: S.gray, red: S.red };

// ---------------------------------------------------------------- the orders (what the page draws under each mock-up)
const BASE = { page: 'us', date: '1846-04-25', tracker: 'nations', records: 'tests/maps/texas-records.csv' };
const ANNOT = { rivers: ['Nueces', 'Rio Grande'], places: ['Q49242', 'Q738353', 'Q2613729', 'Q16868'], routes: ['test-tx-taylor-march'] };
const TX = { ...BASE, frame: 'texas', size: '1600x1550', title: 'The Disputed Land, 1846', annotate: ANNOT };
const D = { ...BASE, frame: '-102,24.6,-96.4,28.2', size: '1200x800', title: 'The Lower Rio Grande, 1846', annotate: { ...ANNOT, routes: [] } };
const E = { ...BASE, frame: '-98.6,25.4,-96.6,26.6', size: '1200x800', title: 'The Mouth of the Rio Grande, 1846', annotate: { rivers: ['Rio Grande'], places: ['Q738353'], routes: [] } };
const F = { ...BASE, date: '1847-02-23', frame: '-101.8,24.9,-99.4,26.6', size: '800x800', title: 'Buena Vista, 1847', annotate: { rivers: [], places: [], routes: [] } };

// Fills recolored by side, for P1 and P2 only (the layer is a proposal: the page's own CSS is untouched).
const recolor = `.na-fill.k-In path{fill:${S.a.fill}} .na-fill.k-T path{fill:${S.b.fill}}
.routes .route.rust{stroke:${S.a.line}} #route-head-barb-rust path{fill:${S.a.line}} .record-labels .route-label.rust{fill:${S.a.line}}`;

const ILLUSTRATION = 'Every mark is an illustration of a form. Dates and names are from the sources named in the hand-over note; numbers are examples. Real rows go through the owner and the teachers.';

// ---------------------------------------------------------------- the panels
const PANELS = [
  {
    id: 'today', order: TX, show: 880, spec: null,
    caption: { title: 'Today', body: ['The Texas 1846 lesson map as Parchment draws it now: fills mean who holds the land (the nations tracker), a rust diamond is a battle, a rust arrow with a closed barb is an army, hatch is a dispute.', 'Everything else on this sheet is a mock-up drawn over this map. Nothing is in the data or the grammar yet; the Military layer would be off by default and change no other layer.'] },
  },
  {
    id: 'P1', order: TX, show: 880,
    spec: { css: recolor, hideLegend: true, items: [
      { type: 'legend', title: 'P1 · Color means side (this layer only)', width: 330, rows: [
        { swatch: 'pair', side: 'a', label: 'United States · side A (blue)' },
        { swatch: 'pair', side: 'b', label: 'Mexico · side B (plum)' },
        { swatch: 'pair', side: 'c', label: 'side C (teal), for a third side', muted: true },
        { swatch: 'pair', side: 'd', label: 'side D (ochre), for a fourth', muted: true },
        { swatch: 'hatch', side: 'a', label: 'a fifth side: "other belligerents", hatched', muted: true },
        { swatch: 'text', label: 'Uniform colors, where they are apt:' },
        { swatch: 'pair', side: 'a', label: 'blue: Continental and Union armies' },
        { swatch: 'pair', side: 'gray', label: 'gray: the Confederacy' },
        { swatch: 'pair', side: 'red', label: 'red: British regulars, 1775–1815' },
        { swatch: 'text', label: 'Each pair: a dark line color (arrows, battles,' },
        { swatch: 'text', label: 'labels, force frames) and a tempered fill (land).' },
      ] },
    ] },
    caption: { title: 'P1 · Color means side', body: ['On the Military layer, and only there, a color is a side: a dark line color for its arrows, battles and labels, and a lighter fill for the land it holds. Members of one side share its color and are told apart by their labels. Up to four sides; a fifth becomes "other belligerents" (hatch) or a second panel.', 'Two ways to pick the colors: a fixed order (blue, plum, teal, ochre, in the order the war record lists the sides, so no hue ever means the enemy) or uniform colors where they fit (blue and gray; blue and red). Here Taylor’s arrow has already turned blue.'], ask: 'Question 1 (needed before milestone 2): uniform colors where they tell the sides apart, or one fixed palette for every war?' },
  },
  {
    id: 'P2', order: TX, show: 880,
    spec: { css: recolor, hideLegend: true, items: [
      { type: 'occupied', holder: 'a', claimant: 'b', near: 'laredo' },
      { type: 'legend', title: 'P2 · Degrees of belonging', width: 330, rows: [
        { swatch: 'fill', side: 'a', label: 'Full member: the side’s fill at 100 %' },
        { swatch: 'fill', side: 'b', label: 'Full member of the other side' },
        { swatch: 'fill', side: 'a', opacity: 0.4, label: 'Dependent or satellite: 40 % (§5: influence)' },
        { swatch: 'hatch', side: 'a', under: 'b', label: 'Held by one side, claimed by another:' },
        { swatch: 'text', label: 'holder’s hatch over claimant’s fill (the strip, Apr 1846)' },
        { swatch: 'paper', label: 'Neutral: paper (none in this frame)' },
      ] },
    ] },
    caption: { title: 'P2 · Degrees of belonging', body: ['From West Point’s "Napoleon’s Family System": a full member takes its side’s fill; a satellite takes it at 40 %, which the grammar already reads as influence or claim; land one side holds and another claims is hatched in the holder’s line color over the claimant’s fill (hatch already means dispute); neutrals are paper.', 'Here the land between the Nueces and the Rio Grande, where Taylor’s army stood on 25 April 1846, is hatched blue over Mexico’s plum.'] },
  },
  {
    id: 'P7', order: TX, show: 880,
    spec: { hideLegend: true, items: [
      { type: 'gains', side: 'a', near: 'laredo', at: [-98.9, 27.1], label: 'Taylor’s advance', sub: '8–28 March 1846' },
      { type: 'front', river: 'longest', window: { lon: [-98.5, -97.0], lat: [25.6, 26.4] }, left: 'a', right: 'b', date: '25 Apr 1846', dateAt: 'start' },
      { type: 'ghost', river: 'shortest', window: { lon: [-100.5, -97.0], lat: [27.0, 30.0] }, label: 'Tamaulipas · Tejas line, to 1836', labelAt: 0.55, dx: -30, dy: 20 },
      { type: 'treaty', river: 'longest', window: { lon: [-107, -97.0], lat: [24, 32] }, label: 'Treaty of Guadalupe Hidalgo, 1848', labelAt: 0.3, dx: 12, dy: -6 },
      { type: 'blockade', side: 'a', window: { lon: [-98.2, -96.4], lat: [24.5, 25.9] }, offset: 16, every: 64, label: 'Blockade of the Gulf ports', sub: 'from 14 May 1846 (Conner)', labelAt: 0.2 },
      { type: 'ring', at: 'fort-texas', side: 'b', r: 13 },
      { type: 'legend', title: 'P7 · Lines, each computed or a river stretch', width: 340, lift: 250, rows: [
        { swatch: 'front', sides: ['a', 'b'], label: 'Front on a date: two thin lines, one per side' },
        { swatch: 'hatch', side: 'a', label: 'Gains between two fronts: hatched, named, dated' },
        { swatch: 'blockade', side: 'a', label: 'Blockade: just offshore, with ship marks' },
        { swatch: 'ring', side: 'b', label: 'Siege line: the ring (Fort Texas, 3–9 May)' },
        { swatch: 'crenel', label: 'Fortified line: crenellated (downloaded data only)' },
        { swatch: 'treaty', label: 'Armistice or treaty line: navy, labeled' },
        { swatch: 'ghost', label: 'Ghost border: another date, navy at half strength' },
        { swatch: 'text', label: 'Parallels (38th, 17th): from the graticule' },
      ] },
    ] },
    caption: { title: 'P7 · Lines', body: ['Fronts, gains, blockades, siege lines, treaty lines and ghost borders, each one of three things: a stretch of a downloaded river or coast, a border computed on a date, or a path through places. Nothing is traced from another map.', 'Here: a front across the lower Rio Grande on 25 April 1846 (blue bank, plum bank); the strip hatched as Taylor’s gains of March 1846; a blockade line set off the Tamaulipas coast with ship marks; the 1848 treaty line along the river; the old Nueces line as a ghost.'] },
  },
  {
    id: 'P3', order: D, show: 1200,
    spec: { hideLegend: true, items: [
      { type: 'arrow', side: 'a', via: ['corpus-christi', 'port-isabel', 'fort-texas'], label: 'Taylor 1846', labelAt: '40%' },
      { type: 'arrow', side: 'b', kind: 'hollow', via: ['monterrey', 'saltillo'], label: 'Ampudia, Sept 1846', labelDy: -8 },
      { type: 'arrow', side: 'a', via: ['reynosa', 'monterrey'], shift: 2.5, label: 'Worth 1846', labelDy: -7 },
      { type: 'arrow', side: 'a', via: ['reynosa', 'monterrey'], shift: -2.5, label: 'Twiggs 1846', labelDy: 15 },
      { type: 'arrow', side: 'a', kind: 'sea', via: ['edge', 'brazos-santiago'], edge: [1, 0.12], landing: true, tab: 'from New Orleans', label: 'supplies, 1846', labelAt: '70%' },
      { type: 'arrow', side: 'a', kind: 'sea', via: ['brazos-santiago', 'edge'], edge: [0.42, 1], tab: 'to Veracruz', label: 'Scott, Feb 1847', labelAt: '35%', labelDy: 16 },
      { type: 'legend', title: 'P3 · Movements', width: 330, rows: [
        { swatch: 'arrow', side: 'a', label: 'Advance: closed barb (as now), side’s color' },
        { swatch: 'hollow', side: 'b', label: 'Retreat or withdrawal: hollow, never dashed' },
        { swatch: 'landing', side: 'a', label: 'Landing: the arrow ends at the coast with a tick' },
        { swatch: 'text', label: 'Forces sharing a leg run side by side, 5 px apart' },
        { swatch: 'text', label: 'Commander and year run along the line' },
        { swatch: 'text', label: 'A route that leaves the frame: a tab says where' },
        { swatch: 'swath', side: 'a', label: 'Lived off the land: a computed band, sourced width' },
        { swatch: 'width', side: 'a', w: 2, label: 'Strength mode only: width = strength,' },
        { swatch: 'width', side: 'a', w: 4.5, label: 'with its legend (Minard)' },
      ] },
    ] },
    caption: { title: 'P3 · Movements', body: ['The closed barb still means an armed force, now in its side’s color; fleets use the same over water. A retreat is a hollow arrow (outline only): dash stays reserved for uncertainty. A landing ends at the coast with a small tick. Forces that share a leg run side by side (Worth and Twiggs here, Reynosa to Monterrey). A route that leaves the frame stops at the edge with a tab saying where it went.', 'Tactics are kinds of movement: two arrows closing round a force is an envelopment, and the tactic’s name prints in small italics. No new arrow shapes beyond these.'], ask: 'Question 3 (needed before milestone 2): a hollow arrow for a retreat?' },
  },
  {
    id: 'P4', order: D, show: 1200,
    spec: { hideLegend: true, items: [
      { type: 'arrow', side: 'a', kind: 'none', width: 2, via: ['corpus-christi', 'port-isabel', 'fort-texas'] },
      { type: 'force', side: 'a', at: 'corpus-christi', glyph: 'infantry', echelon: 'XX', size: 28, fade: 1, dx: 60, dy: 30, leader: true, label: 'Taylor', date: '8 Mar', labelDx: 28, labelDy: 5, anchor: 'start' },
      { type: 'force', side: 'a', at: 'port-isabel', glyph: 'infantry', echelon: 'XX', size: 28, fade: 0.5, dx: 80, dy: -40, leader: true, label: 'Taylor', date: '24 Mar', labelDx: 28, labelDy: 5, anchor: 'start' },
      { type: 'force', side: 'a', at: 'fort-texas', glyph: 'infantry', echelon: 'XX', size: 28, fade: 0, dx: 90, dy: 40, leader: true, label: 'Taylor', date: '28 Mar 1846', labelDx: 28, labelDy: 5, anchor: 'start' },
      { type: 'legend', title: 'P4 · Earlier positions fade', width: 330, rows: [
        { swatch: 'force', side: 'a', glyph: 'infantry', echelon: 'XX', label: 'Where a force stands on the map’s date: full color' },
        { swatch: 'fade', side: 'a', label: 'Earlier positions: lighter steps, earliest lightest' },
        { swatch: 'text', label: 'Never dashed (West Point dashes; here dash = uncertain)' },
      ] },
    ] },
    caption: { title: 'P4 · Earlier positions fade', body: ['A situation map shows each force where it stands on the map’s date in full color, and its earlier positions in lighter steps of the same color, earliest lightest: a sequential scale of lightness, which the grammar already uses for periods. West Point dashes earlier positions; in Parchment a dash means uncertain, so positions fade instead.', 'Taylor’s army on its march from Corpus Christi: 8 March, 24 March (Point Isabel), 28 March on the Rio Grande.'] },
  },
  {
    id: 'P5', order: E, show: 1200,
    spec: { hideLegend: true, items: [
      { type: 'event', at: 'thornton-affair', outcome: 'won', winner: 'b', label: 'Thornton Affair', date: '25 Apr 1846', dx: -12, dy: -14, anchor: 'end' },
      { type: 'event', at: 'palo-alto', outcome: 'won', winner: 'a', label: 'Palo Alto', date: '8 May 1846', dx: 12, dy: -8 },
      { type: 'event', at: 'resaca-de-la-palma', outcome: 'won', winner: 'a', label: 'Resaca de la Palma', date: '9 May 1846', dx: 12, dy: 5 },
      { type: 'event', at: 'siege-of-fort-texas', outcome: 'won', winner: 'a', siege: true, ring: 'b', label: 'Siege of Fort Texas', date: '3–9 May 1846', dx: 18, dy: 20 },
      { type: 'legend', title: 'P5 · Battles by outcome', width: 340, corner: 'top-right', rows: [
        { swatch: 'diamond', side: 'a', label: 'Battle, won by the United States' },
        { swatch: 'diamond', side: 'b', label: 'Battle, won by Mexico' },
        { swatch: 'split', sides: ['a', 'b'], label: 'Both sides claimed victory (Buena Vista, 1847)' },
        { swatch: 'diamond', label: 'Inconclusive: rust outline on paper' },
        { swatch: 'siege', side: 'a', ring: 'b', label: 'Siege: the diamond inside the besieger’s ring' },
        { swatch: 'text', label: 'Naval battle: the same diamond, on water' },
        { swatch: 'text', label: 'Massacre, killing of prisoners: never a diamond.' },
        { swatch: 'mass-ring', label: 'candidate 1: navy ring with a rust dot' },
        { swatch: 'mass-x', label: 'candidate 2: a navy cross' },
        { swatch: 'mass-tri', label: 'candidate 3: an open navy triangle, point down' },
      ] },
    ] },
    caption: { title: 'P5 · Battles by outcome', body: ['The diamond stays; its fill becomes the victor’s line color. Inconclusive: a rust outline on paper. Both sides claimed victory: the diamond split in the two colors. A siege: the diamond inside a ring. A naval battle: the same diamond, on water. Who won is a claim from a source in the row ("inconclusive" and "both claimed" are allowed answers), never inferred from who held the field.', 'A massacre or the killing of prisoners never gets a battle diamond: three candidate marks are in the legend for the owner and the co-teachers to choose from (this closes the Goliad gap logged on 6 November).'], ask: 'Question 2 (needed before milestone 2): fill battles with the victor’s color? Show "both claimed victory" as a split diamond? And which mark for a massacre?' },
  },
  {
    id: 'P6', order: { ...D, date: '1846-09-25', annotate: { ...D.annotate, places: ['Q49242', 'Q16868'] } }, show: 1200,
    spec: { hideLegend: true, items: [
      { type: 'fort', at: 'fort-texas', label: 'Fort Texas', date: 'from 28 Mar 1846', dx: 16, dy: 4 },
      { type: 'capital', at: 'monterrey', captor: 'a', label: 'Monterrey', date: 'taken 24 Sept 1846', dx: 16, dy: 16 },
      { type: 'hq', at: 'monterrey', side: 'a', dx: 16, dy: -10, label: 'HQ Taylor', date: 'from 25 Sept 1846', color: 'a' },
      { type: 'hq', at: 'saltillo', side: 'b', label: 'HQ Ampudia', date: 'Sept 1846', dx: 16, dy: -10, color: 'b' },
      { type: 'legend', title: 'P6 · Places of war', width: 330, rows: [
        { swatch: 'fort', label: 'Fort: one navy mark in every era' },
        { swatch: 'fort', side: 'b', label: 'Fort taken: a ring in the captor’s color, from that date' },
        { swatch: 'hq', side: 'a', label: 'Headquarters: a pennant in the side’s color, dated' },
        { swatch: 'capital', side: 'a', label: 'Capital taken: the moss circle with the captor’s ring' },
      ] },
    ] },
    caption: { title: 'P6 · Places of war', body: ['A fort is one navy mark in every era (the owner’s rule of 9 November); a fort taken by the other side keeps the mark and gains a ring in the captor’s color from the date of capture. A headquarters is a small pennant in the side’s color, dated like everything else. A captured capital is the existing moss circle with the captor’s ring.', 'Shown on 25 September 1846: Fort Texas; Monterrey, capital of Nuevo León, taken the day before, with Taylor’s headquarters; Ampudia’s at Saltillo after the armistice. The fort mark is game-icons’ star fort, for review.'] },
  },
  {
    id: 'P8', order: { ...D, date: '1847-02-23', annotate: { ...D.annotate, places: ['Q16868', 'Q738353'] } }, show: 1200,
    spec: { hideLegend: true, items: [
      { type: 'event', at: 'thornton-affair', outcome: 'won', winner: 'b', seq: 1, seqDx: -14, seqDy: -12 },
      { type: 'event', at: 'palo-alto', outcome: 'won', winner: 'a', seq: 2, seqDx: 14, seqDy: -12 },
      { type: 'event', at: 'resaca-de-la-palma', outcome: 'won', winner: 'a', seq: 3, seqDx: 18, seqDy: 6 },
      { type: 'event', at: 'battle-of-monterrey', outcome: 'won', winner: 'a', seq: 4, seqDx: 16, seqDy: -12 },
      { type: 'event', at: 'buena-vista', outcome: 'both', sides: ['a', 'b'], seq: 5, seqDx: -16, seqDy: -12 },
      { type: 'list', title: 'The course of the war (to 23 Feb 1847)', width: 400, row: 32, rows: [
        { date: '25 Apr 1846', what: 'Thornton Affair', line: 'Mexican cavalry take Thornton’s dragoons north of the river.' },
        { date: '8 May 1846', what: 'Palo Alto', line: 'Taylor’s artillery holds the field against Arista.' },
        { date: '9 May 1846', what: 'Resaca de la Palma', line: 'Arista’s army retreats across the Rio Grande.' },
        { date: '21–24 Sept 1846', what: 'Monterrey', line: 'The city surrenders under an eight-week armistice.' },
        { date: '22–23 Feb 1847', what: 'Buena Vista · La Angostura', line: 'Both sides claim the victory; Santa Anna withdraws.' },
      ] },
      { type: 'legend', title: 'P8 · Sequence marks', width: 330, corner: 'bottom-right', rows: [
        { swatch: 'numeral', n: 1, label: 'Circled numeral, outlined (proposed)' },
        { swatch: 'numeral', n: 1, style: 'letter', label: 'Letters, if numerals confuse' },
        { swatch: 'numeral', n: 1, style: 'badge', label: 'Not this: the filled badge means quantity (§5)' },
        { swatch: 'text', label: 'Keyed to a list in the margin: date and one line,' },
        { swatch: 'text', label: 'in the sources’ words; it also holds dated callouts' },
      ] },
    ] },
    caption: { title: 'P8 · Sequence numerals, "the course of the war"', body: ['Small circled numerals in navy sit at the events, keyed to a numbered list in the margin: the date and one line, in the sources’ words (the lines here are placeholders). The grammar already uses filled number badges for quantity, so the numerals must look different: an outlined circle, or letters.', 'The list doubles as the place for dated callouts, like West Point’s "3,000 French troops from de Grasse’s fleet joined Lafayette on 5 September".'], ask: 'Question 4 (needed before milestone 2): circled numerals, letters, or dates only?' },
  },
  {
    id: 'P9a', order: F, show: 590,
    spec: { hideLegend: true, items: [
      { type: 'event', at: 'buena-vista', outcome: 'won', winner: 'a', label: 'Buena Vista', date: '22–23 Feb 1847', dx: 14, dy: 12 },
      { type: 'label', at: 'saltillo', text: 'Saltillo', dx: -10, dy: -6, anchor: 'end' },
      { type: 'note', title: 'After Taylor, report of 6 March 1847', lines: ['United States. The Americans hold the field;', 'Santa Anna withdraws toward San Luis Potosí.'] },
    ] },
    caption: null,
  },
  {
    id: 'P9b', order: F, show: 590,
    spec: { hideLegend: true, items: [
      { type: 'event', at: 'buena-vista', outcome: 'won', winner: 'b', label: 'La Angostura', date: '22–23 Feb 1847', dx: 14, dy: 12 },
      { type: 'label', at: 'saltillo', text: 'Saltillo', dx: -10, dy: -6, anchor: 'end' },
      { type: 'note', title: 'After Santa Anna, dispatches of 1847', lines: ['Mexico. A victory proclaimed, with captured', 'colors sent to the capital; the army retires.'] },
    ] },
    caption: { title: 'P9 · Accounts', body: ['Panels of one frame, each drawn only from one source’s rows and credited in the panel. The same battle, from Taylor’s report and from Santa Anna’s dispatches: each side’s name for the place, each side’s claim to the victory. Historiography, and the perspective of the people who were there, side by side.', 'Question 9 for later: which battle first? Little Bighorn from Lakota and Cheyenne accounts and Army records, or Lexington and Concord from both sides’ depositions?'] },
  },
  {
    id: 'P10', order: { ...D, annotate: { ...D.annotate, routes: ['test-tx-taylor-march'] } }, show: 1200, strip: true,
    spec: { hideLegend: false, items: [] },
    caption: { title: 'P10 · The war strip (and the play control)', body: ['Under a war map the strip spans the war, not the stage: ticks for years and months, events as small marks in the victor’s color, treaties as navy triangles, each force’s campaign as a thin bar in its side’s color, and above them each member’s time in the war ("who was fighting when"). The shown date is marked. On the live page the strip is the play control: a day, a week or a month per second; stepped, never morphed.', 'Below the map: the strip for 25 April 1846 to 2 February 1848, drawn beside the page for now. Force dates are examples.'] },
  },
  {
    id: 'forces', order: { ...D, date: '1846-05-08', annotate: { ...D.annotate, places: ['Q49242'] } }, show: 1200,
    spec: { hideLegend: true, items: [
      { type: 'force', side: 'a', at: 'palo-alto', glyph: 'infantry', echelon: 'XX', icon: 'musket', size: 30, dx: 95, dy: -55, leader: true, label: 'Taylor', sub: '≈2,300 · example', labelDy: 32 },
      { type: 'force', side: 'a', at: 'palo-alto', glyph: 'cavalry', echelon: 'X', icon: 'cavalry', size: 30, dx: 205, dy: -5, label: 'May', sub: 'dragoons', labelDy: 26 },
      { type: 'force', side: 'a', at: 'palo-alto', glyph: 'artillery', echelon: '', icon: 'cannon', size: 30, dx: 40, dy: 85, label: 'Ringgold', sub: 'flying artillery', labelDy: 32 },
      { type: 'force', side: 'b', at: 'palo-alto', glyph: 'infantry', echelon: 'XX', icon: 'musket', size: 30, dx: -210, dy: 10, leader: true, label: 'Arista', sub: '3,200–3,700 · example', labelDy: 26 },
      { type: 'force', side: 'b', at: 'palo-alto', glyph: 'cavalry', echelon: 'X', icon: 'cavalry', size: 30, dx: -320, dy: -50, label: 'Torrejón', sub: 'lancers', labelDy: 32 },
      { type: 'force', side: 'b', at: 'palo-alto', glyph: 'artillery', echelon: '', icon: 'cannon', size: 30, dx: -180, dy: 95, label: 'artillery', sub: '', labelDy: 32 },
      { type: 'force', side: 'a', ship: true, at: 'brazos-santiago', icon: 'paddle-steamer', size: 34, dx: 130, dy: 70, label: 'Conner', sub: 'Home Squadron', labelDy: 30 },
      { type: 'event', at: 'palo-alto', outcome: 'won', winner: 'a', label: 'Palo Alto', date: '8 May 1846', dx: -70, dy: 150, leader: true },
      { type: 'legend', title: 'Force marks: frame, glyph, icon, label', width: 360, rows: [
        { swatch: 'force', side: 'a', glyph: 'infantry', echelon: 'XX', label: 'Frame (milsymbol): the unit’s type and size' },
        { swatch: 'text', label: 'X brigade · XX division · XXX corps · XXXX army' },
        { swatch: 'icon', icon: 'musket', side: 'a', label: 'Equipment icon beside it, in the side’s color' },
        { swatch: 'text', label: 'Label: commander · strength, when sourced' },
        { swatch: 'icon', icon: 'paddle-steamer', side: 'a', size: 18, label: 'Fleet: the ship itself, no frame; a badge counts ships' },
        { swatch: 'icon', icon: 'tank-great-war', side: 'b', size: 18, strike: true, label: 'Tank in 1846: refused; the plain glyph draws' },
        { swatch: 'text', label: 'One frame for every side and era; the icon carries the era' },
      ] },
    ] },
    caption: { title: '§3 · Force marks and their equipment', body: ['A force mark has four parts: a frame from milsymbol (MIL-STD-2525: infantry, cavalry, artillery, armor, aviation, with X / XX / XXX size marks), the same rectangle for every side and era, in the side’s line color; a small equipment icon beside it that carries the era; and a label with the commander and the sourced strength. Fleets use the ship icon itself. A force’s equipment must be in use on the row’s dates, or the slip warns and the plain glyph draws.', 'The two armies at Palo Alto, 8 May 1846, with the Home Squadron off Brazos Santiago. Strengths are examples.'], ask: 'Question 6: milsymbol frames plus game-icons silhouettes as the base, with gaps filled from period references only with your approval? Period-correct flag chips beside members’ names, or no flags?' },
  },
];

// ---------------------------------------------------------------- the war strip under P10 (drawn in the sheet, not in the page)
function warStrip(width = 1200) {
  const t0 = Date.UTC(1846, 3, 25), t1 = Date.UTC(1848, 1, 2);
  const x = (d) => 120 + ((Date.UTC(...d) - t0) / (t1 - t0)) * (width - 150);
  const H = 196, base = 118;
  const ev = (d, side, name) => `<g transform="translate(${x(d).toFixed(1)},${base})"><path d="M0,-5L5,0L0,5L-5,0Z" fill="${side === 'both' ? S.a.line : S[side].line}"/>${side === 'both' ? `<path d="M0,-5L5,0L0,5Z" fill="${S.b.line}"/>` : ''}<title>${name}</title></g>`;
  const bar = (d0, d1, side, y, name) => { const x0 = Math.max(x(d0), 120); return `<rect x="${x0.toFixed(1)}" y="${y}" width="${(x(d1) - x0).toFixed(1)}" height="4" fill="${S[side].line}" rx="1"/><text x="${(x0 + 3).toFixed(1)}" y="${y - 2}" font-size="9" font-style="italic" fill="${S[side].line}">${name}</text>`; };
  const months = [];
  for (let y = 1846; y <= 1848; y++) for (let m = 0; m < 12; m++) { const d = Date.UTC(y, m, 1); if (d >= t0 && d <= t1) months.push([y, m]); }
  const yearTicks = [[1847, 0, 1], [1848, 0, 1]].map(([y, m, d]) => `<line x1="${x([y, m, d])}" x2="${x([y, m, d])}" y1="${base - 8}" y2="${base + 12}" stroke="${NAVY}" stroke-width="1.2"/><text x="${x([y, m, d])}" y="${base + 26}" text-anchor="middle" font-size="12" fill="${NAVY}">${y}</text>`).join('');
  const monthTicks = months.map(([y, m]) => `<line x1="${x([y, m, 1])}" x2="${x([y, m, 1])}" y1="${base}" y2="${base + 6}" stroke="${NAVY}" stroke-width="0.6"/>`).join('');
  const events = [
    ev([1846, 3, 25], 'b', 'Thornton Affair'), ev([1846, 4, 8], 'a', 'Palo Alto'), ev([1846, 4, 9], 'a', 'Resaca de la Palma'), ev([1846, 8, 23], 'a', 'Monterrey'),
    ev([1846, 7, 18], 'a', 'Santa Fe entered'), ev([1846, 11, 25], 'a', 'El Brazito'), ev([1847, 1, 23], 'both', 'Buena Vista'), ev([1847, 1, 28], 'a', 'Sacramento'),
    ev([1847, 2, 29], 'a', 'Veracruz (siege)'), ev([1847, 3, 18], 'a', 'Cerro Gordo'), ev([1847, 7, 20], 'a', 'Contreras and Churubusco'), ev([1847, 8, 8], 'a', 'Molino del Rey'), ev([1847, 8, 13], 'a', 'Chapultepec'),
  ].join('');
  const treaty = `<g transform="translate(${x([1848, 1, 2]).toFixed(1)},${base})"><path d="M0,-7L7,6H-7Z" fill="${NAVY}"/><title>Treaty of Guadalupe Hidalgo</title></g><text x="${(x([1848, 1, 2]) - 6).toFixed(1)}" y="${base - 12}" text-anchor="end" font-size="10" font-style="italic" fill="${NAVY}">Guadalupe Hidalgo, 2 Feb 1848</text>`;
  const members = bar([1846, 4, 13], [1848, 1, 2], 'a', 30, 'United States · declared war 13 May 1846') + bar([1846, 3, 23], [1848, 1, 2], 'b', 48, 'Mexico · defensive war proclaimed 23 Apr 1846');
  const forces = bar([1846, 2, 8], [1847, 10, 1], 'a', 70, 'Taylor') + bar([1847, 2, 9], [1847, 8, 14], 'a', 84, 'Scott') + bar([1846, 5, 30], [1847, 0, 13], 'a', 98, 'Kearny')
    + bar([1846, 3, 24], [1846, 4, 18], 'b', 70, 'Arista') + bar([1846, 7, 1], [1846, 8, 25], 'b', 84, 'Ampudia') + bar([1847, 0, 28], [1847, 8, 14], 'b', 98, 'Santa Anna');
  const shown = `<g transform="translate(${x([1846, 3, 25]).toFixed(1)},${base})"><path d="M0,-9L8,0L0,9L-8,0Z" fill="${GOLD}" stroke="${NAVY}" stroke-width="1"/></g><text x="${x([1846, 3, 25]).toFixed(1)}" y="${base + 40}" text-anchor="middle" font-size="12" font-weight="700" fill="${NAVY}">25 Apr 1846</text>`;
  const play = `<g transform="translate(16,${base - 14})"><rect width="26" height="26" rx="4" fill="${CREAM}" stroke="${NAVY}" stroke-width="0.9"/><path d="M9,6L20,13L9,20Z" fill="${NAVY}"/></g>` +
    ['day', 'week', 'month'].map((s, i) => `<g transform="translate(${48 + i * 0}, ${base - 34 + i * 18})"><rect width="54" height="15" rx="3" fill="${s === 'week' ? NAVY : CREAM}" stroke="${NAVY}" stroke-width="0.8"/><text x="27" y="11" text-anchor="middle" font-size="9.5" fill="${s === 'week' ? CREAM : NAVY}">${s} / s</text></g>`).join('');
  const labels = `<text x="16" y="24" font-size="10" font-variant="small-caps" letter-spacing="0.12em" fill="${NAVY}">members</text><text x="16" y="64" font-size="10" font-variant="small-caps" letter-spacing="0.12em" fill="${NAVY}">forces</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" font-family="Libre Baskerville, Georgia, serif" style="background:${CREAM}">
<rect x="0.5" y="0.5" width="${width - 1}" height="${H - 1}" fill="none" stroke="${GOLD}" stroke-width="1"/>
${labels}${members}${forces}
<line x1="120" x2="${width - 30}" y1="${base}" y2="${base}" stroke="${NAVY}" stroke-width="1.4"/>${monthTicks}${yearTicks}${events}${treaty}${shown}${play}
<text x="${width - 16}" y="${H - 10}" text-anchor="end" font-size="10" font-style="italic" fill="${NAVY}" fill-opacity="0.8">a mock-up: events dated from the sources in the hand-over note; force dates are examples · the strip is also the play control (§5)</text>
</svg>`;
}

// ---------------------------------------------------------------- the icon catalog (sheet HTML)
const iconSVG = (ic, size, fill) => `<svg width="${size}" height="${size}" viewBox="${ic.viewBox}"><path d="${ic.d}" fill="${fill}"/></svg>`;
function iconCatalog({ wide = true } = {}) {
  const classes = [
    ['Warships', ['galley', 'galleon', 'paddle-steamer', 'ironclad']],
    ['Mounted and armor', ['knight', 'cavalry', 'camel-troops', 'tank-great-war']],
    ['Artillery', ['trebuchet', 'cannon', 'machine-gun', 'missile-launcher']],
    ['Infantry', ['pikeman', 'bowman', 'musket', 'rifle-breech']],
    ['Air', ['airship', 'biplane', 'jet-fighter', 'helicopter']],
    ['Forts: one mark (first) and three alternates', ['fort', 'fort-hill', 'fort-castle', 'fortified-wall']],
    ['The human cost (§4)', ['dead-skull', 'dead-coffin', 'dead-grave', 'person']],
    ['Flagged by the brief: the names mislead (not for use)', ['x-rifle', 'x-bomber', 'x-drone', 'x-elephant', 'x-balloon']],
  ];
  const cell = (k) => {
    const ic = icons[k];
    if (!ic) return `<div class="ic missing">${k}: not fetched</div>`;
    const flagged = ic.status === 'flagged';
    return `<div class="ic${flagged ? ' flagged' : ''}">${iconSVG(ic, 84, flagged ? RUST : NAVY)}<div class="k">${ic.depicts}</div><div class="e">${ic.era || ''}</div><div class="a">${ic.file} · ${ic.author} · CC BY 3.0</div></div>`;
  };
  return `<div class="catalog">
<h2>Icons for review · four per class, from game-icons.net (CC BY 3.0), with milsymbol frames (MIT)</h2>
<p class="lead">Right in kind, not in every national detail. They come as white shapes on black squares; the square is stripped and the shape takes the side’s color on the map. Nothing enters the catalog before the owner has reviewed it; the dates shown are the brief’s starting points, each to be sourced in the catalog. Gaps so far: ${cat.gaps.join('; ')}.</p>
${classes.map(([title, keys]) => `<div class="row"><div class="rt">${title}</div>${keys.map(cell).join('')}</div>`).join('')}
<div class="row"><div class="rt">Frames (milsymbol, MIL-STD-2525): the same rectangle for every side and era</div><div class="ic frames" id="frames"></div></div>
</div>`;
}

// ---------------------------------------------------------------- the sheet
function sheetHTML(rendered, { date }) {
  const img = (p) => `<img src="data:image/png;base64,${rendered[p.id].png.toString('base64')}" width="${p.show}" alt="${p.id}">`;
  const cap = (p) => (p.caption ? `<div class="cap" style="width:${p.id === 'P9b' ? 1204 : p.show}px"><h3>${p.caption.title}</h3>${p.caption.body.map((b) => `<p>${b}</p>`).join('')}${p.caption.ask ? `<p class="ask">${p.caption.ask}</p>` : ''}</div>` : '');
  const by = Object.fromEntries(PANELS.map((p) => [p.id, p]));
  const panel = (id) => { const p = by[id]; return `<div class="panel">${img(p)}${p.strip ? warStrip(p.show) : ''}${cap(p)}</div>`; };
  const pair = `<div class="panel"><div class="pair">${img(by.P9a)}${img(by.P9b)}</div>${cap(by.P9b)}</div>`;
  const questions = `<div class="panel qbox"><h3>The four answers needed before milestone 2</h3>
<ol>
<li><b>Side colors</b> (P1): uniform colors where they tell the sides apart (blue and gray; blue and red), or one fixed palette for every war? <i>Proposed default: the fixed order, with uniform colors as a per-war override logged with its reason.</i></li>
<li><b>Battles</b> (P5): fill them with the victor’s color? Show "both claimed victory" as a split diamond? <i>Proposed: yes and yes; rust outline for inconclusive.</i> And which mark for a massacre or the killing of prisoners (three candidates in P5’s legend)?</li>
<li><b>Retreats</b> (P3): a hollow arrow? <i>Proposed: yes; dash stays reserved for uncertainty.</i></li>
<li><b>Sequence marks</b> (P8): circled numerals, letters, or dates only? <i>Proposed: outlined circled numerals.</i></li>
</ol>
<p>The brief’s other questions (the record table’s seven columns or a separate table; icons and flags; how a force moves during play; MP4 export; the first accounts panel; a Comanche and Apache force in 1846–48; current wars; who reviews sensitive events; force labels and the ten-label limit) come up as each milestone reaches them.</p>
<p class="small">${ILLUSTRATION}</p></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Parchment · the Military layer · picture sheet</title>
<link rel="stylesheet" href="/src/tokens.css">
<style>
@font-face { font-family: 'Libre Baskerville'; font-style: normal; font-weight: 400; src: url('/assets/fonts/libre-baskerville-latin-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'Libre Baskerville'; font-style: italic; font-weight: 400; src: url('/assets/fonts/libre-baskerville-latin-400-italic.woff2') format('woff2'); }
@font-face { font-family: 'Libre Baskerville'; font-style: normal; font-weight: 700; src: url('/assets/fonts/libre-baskerville-latin-700-normal.woff2') format('woff2'); }
body { margin: 0; background: ${CREAM}; color: ${NAVY}; font-family: 'Libre Baskerville', Georgia, serif; width: 3696px; }
header { padding: 36px 48px 10px; border-bottom: 2px solid ${GOLD}; }
header h1 { font-size: 40px; margin: 0 0 8px; font-weight: 700; letter-spacing: 0.02em; }
header h1 span { font-variant: small-caps; letter-spacing: 0.18em; font-weight: 400; margin-right: 18px; }
header p { font-size: 20px; margin: 4px 0; max-width: 3000px; }
.rowx { display: flex; gap: 24px; padding: 28px 24px 0; align-items: flex-start; }
.panel { background: ${CREAM}; }
.panel img, .panel svg { display: block; border: 1px solid ${GOLD}; }
.panel svg { border-top: none; }
.pair { display: flex; gap: 20px; }
.cap { padding: 10px 2px 0; font-size: 17px; line-height: 1.4; }
.cap h3 { font-size: 22px; margin: 6px 0 6px; }
.cap p { margin: 0 0 6px; }
.cap .ask { font-weight: 700; color: ${RUST}; }
.qbox { width: 1200px; font-size: 19px; line-height: 1.45; border: 1px solid ${GOLD}; padding: 18px 24px; box-sizing: border-box; background: #f3efe3; }
.qbox h3 { margin: 0 0 10px; font-size: 24px; }
.qbox li { margin-bottom: 10px; }
.qbox .small { font-size: 15px; font-style: italic; }
.catalog { margin: 36px 24px 0; border-top: 2px solid ${GOLD}; padding-top: 18px; }
.catalog h2 { font-size: 28px; margin: 0 0 8px; }
.catalog .lead { font-size: 17px; max-width: 2600px; margin: 0 0 14px; }
.catalog .row { display: flex; gap: 18px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #e2dcc8; }
.catalog .rt { width: 300px; font-weight: 700; font-size: 18px; padding-top: 24px; }
.catalog .ic { width: 300px; font-size: 13px; line-height: 1.3; }
.catalog .ic svg { display: block; margin-bottom: 4px; }
.catalog .ic .k { font-weight: 700; }
.catalog .ic .e { font-style: italic; }
.catalog .ic .a { opacity: 0.7; font-size: 11.5px; }
.catalog .ic.flagged .k { color: ${RUST}; }
.catalog .frames { width: auto; display: flex; gap: 28px; align-items: flex-end; }
.catalog .frames div { text-align: center; font-size: 12px; }
footer { padding: 20px 48px 40px; font-size: 15px; opacity: 0.85; }
</style></head><body>
<header><h1><span>Parchment</span>The Military layer · proposals P1–P10, for the owner</h1>
<p>Picture sheet of ${date}, milestone 0 of the brief "Parchment: the Military layer". Every panel is the live Texas 1846 lesson map with a proposal drawn on top. Nothing here is in the data, the grammar or any other layer; the Military layer is off by default. Four answers are needed before milestone 2 (the box at the bottom right); the other questions come as the milestones reach them.</p>
<p>The four red questions below are the ones to answer first.</p></header>
<div class="rowx">${panel('today')}${panel('P1')}${panel('P2')}${panel('P7')}</div>
<div class="rowx">${panel('P3')}${panel('P4')}${panel('P5')}</div>
<div class="rowx">${panel('P6')}${panel('P8')}${pair}</div>
<div class="rowx">${panel('P10')}${panel('forces')}${questions}</div>
${iconCatalog()}
<footer>Parchment, by Wil Cosgrove. Base map: boundaries Newberry Library and OpenHistoricalMap; rivers and coasts Natural Earth; places Wikidata (CC0). Icons: game-icons.net contributors (CC BY 3.0; authors under each icon; assets/icons/military/LICENSE.md). Force frames: milsymbol by Måns Beckman (MIT). Sources for dates: K. Jack Bauer, <i>The Mexican War, 1846–1848</i> (1974); National Park Service, Palo Alto Battlefield; West Point atlas, "The Mexican War" (reference only). Side colors are a proposal (src/military/sides.js).</footer>
<script src="/assets/vendor/milsymbol/milsymbol.js"></script>
<script src="/military-frames.js"></script>
</body></html>`;
}

// milsymbol frames drawn in the catalog, in the page (so the sheet shows the real library output).
const FRAMES_JS = `
(function(){ var el = document.getElementById('frames'); if (!el || !window.ms) return;
  var codes = [['SFG-UCI----I','infantry · XX'],['SFG-UCR----H','cavalry · X'],['SFG-UCF----G','artillery · regiment'],['SFG-UCA----H','armor · X'],['SFG-UCVF---H','aviation · X'],['SFG-UCI----J','infantry · XXX']];
  codes.forEach(function(c){ var s = new ms.Symbol(c[0], { size: 40, monoColor: '${S.a.line}', fill: false, strokeWidth: 4, infoFields: false }); var d = document.createElement('div'); d.innerHTML = s.asSVG() + '<div>' + c[1] + '</div>'; el.appendChild(d); });
})();`;

// ---------------------------------------------------------------- rendering
async function waitReady(page) {
  await page.eval(`new Promise((resolve, reject) => {
    const t0 = Date.now();
    (function wait() {
      const p = document.querySelector('#problems');
      if (window.parchment && window.parchment.ready) window.parchment.ready.then(() => resolve(true), (e) => reject(String(e && e.message || e)));
      else if (p && !p.classList.contains('hidden') && /could not start/.test(p.textContent)) reject(p.textContent);
      else if (Date.now() - t0 > 90000) reject('the page did not finish drawing in 90 s');
      else setTimeout(wait, 50);
    })();
  })`);
}

async function renderPanel(b, server, p, log) {
  const [w, h] = p.order.size.split('x').map(Number);
  const query = orderToQuery(p.order);
  query.set('shot', '1');
  const page = await b.newPage({ width: w, height: h, scale: 1, origin: server.origin });
  try {
    await page.goto(`${server.origin}/us.html?${query}`);
    await waitReady(page);
    let result = null;
    if (p.spec) {
      await page.eval(`new Promise((ok, fail) => { const s = document.createElement('script'); s.src = '/military-overlay.js'; s.onload = () => ok(true); s.onerror = () => fail(new Error('overlay did not load')); document.head.appendChild(s); })`);
      const spec = { ...p.spec, places, sides: SIDES, icons: Object.fromEntries(Object.entries(icons).map(([k, v]) => [k, { d: v.d, viewBox: v.viewBox }])) };
      result = await page.eval(`window.militaryOverlay(${JSON.stringify(spec)})`);
      await page.eval('document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 150)))');
      if (result.projectionError > 1) log(`  ${p.id}: projection rebuilt ${result.projectionError.toFixed(2)} px off the page's own marks`);
      for (const wmsg of result.warnings) log(`  ${p.id}: ${wmsg}`);
      if (page.errors.length) log(`  ${p.id}: page errors: ${page.errors.join(' | ')}`);
    }
    const png = await page.screenshot();
    return { png, result, errors: page.errors };
  } finally {
    await page.close();
  }
}

async function renderHTML(b, server, html, path, width, log) {
  const probe = await b.newPage({ width, height: 2000, scale: 1, origin: server.origin });
  await probe.goto(`${server.origin}${path}`);
  await probe.eval('document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 200)))');
  const height = await probe.eval('document.documentElement.scrollHeight');
  await probe.close();
  const page = await b.newPage({ width, height, scale: 1, origin: server.origin });
  await page.goto(`${server.origin}${path}`);
  await page.eval('document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 300)))');
  const png = await page.screenshot();
  if (page.errors.length) log(`  sheet page errors: ${page.errors.join(' | ')}`);
  await page.close();
  return { png, height };
}

export async function makeSheet({ only = null, outDir = null, log = console.log } = {}) {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dir = outDir ?? (only ? join(ROOT, 'out', 'military') : join(ROOT, 'docs', 'progress'));
  mkdirSync(dir, { recursive: true });
  const [us, overlay] = await Promise.all([bundle(ROOT), bundle(ROOT, join('src', 'military', 'overlay.js'))]);
  const files = { '/us.js': us, '/military-overlay.js': overlay, '/military-frames.js': Buffer.from(FRAMES_JS) };
  const server = await serve(ROOT, { files });
  const found = findBrowser();
  if (!found) { await server.close(); throw new Error(NO_BROWSER); }
  log(`browser: ${found.path} (${found.from})`);
  const b = await launch({ browser: found });
  const rendered = {};
  const written = [];
  try {
    const todo = PANELS.filter((p) => !only || only.includes(p.id));
    for (const p of todo) {
      const t = Date.now();
      rendered[p.id] = await renderPanel(b, server, p, log);
      log(`panel ${p.id}: ${p.order.size} in ${((Date.now() - t) / 1000).toFixed(1)} s`);
      if (only) { const f = join(dir, `${p.id}.png`); writeFileSync(f, rendered[p.id].png); written.push(f); }
    }
    if (!only) {
      files['/military-sheet.html'] = Buffer.from(sheetHTML(rendered, { date }));
      const sheet = await renderHTML(b, server, files['/military-sheet.html'], '/military-sheet.html', 3696, log);
      const f1 = join(dir, `${date}-military-sheet.png`);
      writeFileSync(f1, sheet.png); written.push(f1);
      log(`sheet: 3696×${sheet.height}, ${(sheet.png.length / 1e6).toFixed(1)} MB`);
      const iconsHtml = sheetHTML(rendered, { date }).replace(/<header>[\s\S]*<\/header>[\s\S]*?(<div class="catalog">)/, '$1').replace(/body \{ margin: 0;/, 'body { margin: 0; padding-bottom: 20px;').replace('width: 3696px;', 'width: 2400px;');
      files['/military-icons.html'] = Buffer.from(iconsHtml);
      const ic = await renderHTML(b, server, iconsHtml, '/military-icons.html', 2400, log);
      const f2 = join(dir, `${date}-military-icons.png`);
      writeFileSync(f2, ic.png); written.push(f2);
      log(`icons: 2400×${ic.height}, ${(ic.png.length / 1e6).toFixed(1)} MB`);
    }
  } finally {
    await b.close();
    await server.close();
  }
  return { written, rendered: Object.fromEntries(Object.entries(rendered).map(([k, v]) => [k, { result: v.result, errors: v.errors }])) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : null; };
  const only = flag('only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null;
  const outDir = flag('out') ? resolve(flag('out')) : null;
  makeSheet({ only, outDir }).then((r) => { console.log(`wrote:\n  ${r.written.join('\n  ')}`); }).catch((err) => { console.error(err.stack ?? err.message); process.exit(1); });
}

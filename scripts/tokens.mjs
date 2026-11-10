#!/usr/bin/env node
// Parchment — tokens.mjs
// Derives the color tokens in src/tokens.css from the seed hexes in the brief (§6).
// Theme fills (Set A) are tempered for parchment: same hue, OKLCH lightness 0.72, chroma 0.09.
// Marks (Set B) are used as given; moss is derived at rust's lightness and chroma.
// Usage: node scripts/tokens.mjs

import { writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- sRGB <-> OKLCH (Björn Ottosson's OKLab matrices) ---
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function hexToOklch(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
function oklchToHex({ L, C, h }) {
  const A = C * Math.cos((h * Math.PI) / 180), B = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.round(255 * Math.min(1, Math.max(0, gam(c)))));
  return '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');
}
const temper = (hex, L = 0.72, C = 0.09) => oklchToHex({ ...hexToOklch(hex), L, C });

// --- Set A: theme fills (seed → tempered) ---
const seeds = { In: '#35a360', S: '#e0862b', P: '#3b7ddd', E: '#d9a400', C: '#8e55d8', T: '#2aa3b4' };
const fills = Object.fromEntries(Object.entries(seeds).map(([k, v]) => [k, temper(v)]));

// --- Set B: marks ---
const navy = '#1F2A44', rust = '#C8601A', steel = '#2E6F9E', cream = '#F7F5EF';
const rustLC = hexToOklch(rust);
const moss = oklchToHex({ L: rustLC.L, C: rustLC.C, h: 140 });
// Land routes: umber, at navy's lightness toward hue 50, so a caravan road reads as apparatus beside steel sea lanes.
const navyLC = hexToOklch(navy);
const routeLand = oklchToHex({ L: navyLC.L + 0.18, C: 0.09, h: 50 });
const slateGold = oklchToHex({ L: 0.66, C: 0.1, h: 80 });
const gold = oklchToHex({ L: 0.74, C: 0.1, h: 85 });
const goldHair = oklchToHex({ L: 0.8, C: 0.07, h: 85 });
const ink = navy;
// Explorers layer (owner, 2026-11-06): the state that sent an expedition, as dark line colors at one lightness
// (well below the theme fills' 0.72, so a line never reads as a fill), hues spread round the wheel.
const sponsor = (h) => oklchToHex({ L: 0.5, C: 0.13, h });
const sponsors = { spain: sponsor(25), portugal: sponsor(150), england: sponsor(305), france: sponsor(262), netherlands: sponsor(200) };
// The Military layer (owner, 2026-11-09, taking the picture sheet's defaults for proposal P1): a pair per side, a
// dark line (L 0.47, C 0.13: below the sponsors' 0.50, so a blue army never looks like a blue voyage) and a fill
// tempered as Set A is (L 0.72, C 0.09). The fixed order a–d, then gray and red for the uniform scheme. The same
// numbers live in src/military/sides.js, which the tests hold to this file.
const sideHues = { a: 262, b: 340, c: 185, d: 85, gray: 260, red: 25 };
const sideC = (k) => (k === 'gray' ? 0.012 : null);
const sideLine = (k) => oklchToHex({ L: 0.47, C: sideC(k) ?? 0.13, h: sideHues[k] });
const sideFill = (k) => oklchToHex({ L: 0.72, C: sideC(k) ?? 0.09, h: sideHues[k] });
// The political map (owner, 2026-11-09: "use the color scheme to highlight countries/states/nations/etc like the
// other map does"): every state in force in the year shown has a color of its own, its neighbors another
// (scripts/derive-cliopatria.mjs assigns them). Six hues, each pale (L 0.86, C 0.055) and mid (L 0.77, C 0.07):
// tempered like Set A, lighter so names and borders read over them, and far from the apparatus's dark lines.
// The owner's choice (2026-11-10): he tried a bolder set (twelve hues, chroma 0.10; b079a7d) and kept this one.
const polHues = [25, 75, 120, 165, 215, 290];
const pol = [...polHues.map((h) => oklchToHex({ L: 0.86, C: 0.055, h })), ...polHues.map((h) => oklchToHex({ L: 0.77, C: 0.07, h }))];
// A vassal's stripes are its overlord's color, deep enough to read over any of the fills (2026-11-10): the same
// hues, the pale set's at L 0.56 and the mid set's at L 0.46, so two overlords of one hue still differ.
const polDeep = [...polHues.map((h) => oklchToHex({ L: 0.56, C: 0.1, h })), ...polHues.map((h) => oklchToHex({ L: 0.46, C: 0.1, h }))];
// Water: paper lightness, nudged toward blue.
const paperL = hexToOklch('#D9D6CC').L;
const ocean = oklchToHex({ L: paperL, C: 0.022, h: 235 });
const bathyLine = oklchToHex({ L: paperL - 0.07, C: 0.03, h: 235 });
const parchment = '#EFE7D2';
const parchmentDeep = oklchToHex({ ...hexToOklch(parchment), L: hexToOklch(parchment).L - 0.06 });

const css = `/* Generated by scripts/tokens.mjs — do not edit by hand. Seeds live in that script and in CLAUDE.md §6. */
:root {
  /* Set A — theme fills, tempered for parchment (OKLCH L 0.72, C 0.09, seed hue kept) */
  --fill-In: ${fills.In};   /* Environment  (seed #35a360) */
  --fill-S:  ${fills.S};   /* Social       (seed #e0862b) */
  --fill-P:  ${fills.P};   /* Political    (seed #3b7ddd) */
  --fill-E:  ${fills.E};   /* Economic     (seed #d9a400) */
  --fill-C:  ${fills.C};   /* Cultural     (seed #8e55d8) */
  --fill-T:  ${fills.T};   /* Technological(seed #2aa3b4) */

  /* Set B — marks (apparatus) */
  --navy:  ${navy};
  --rust:  ${rust};
  --steel: ${steel};
  --moss:  ${moss};   /* derived: rust's lightness and chroma, hue 140 */
  --route-land: ${routeLand};   /* umber: land trade routes; derived at navy's lightness (+0.18) toward hue 50 */
  --focus: ${slateGold};   /* slate-gold, the single focus color */
  --gold:  ${gold};   /* frame, cartouche, timeline strip */
  --gold-hair: ${goldHair};   /* graticule hairlines */
  --cream: ${cream};   /* paper, land at rest */
  --ink:   ${ink};

  /* Explorers layer: the state that sent the expedition (OKLCH L 0.50, C 0.13) */
${Object.entries(sponsors).map(([k, v]) => `  --sponsor-${k}: ${v};`).join('\n')}

  /* Military layer: the sides of a war (owner, 2026-11-09); line L 0.47 C 0.13, fill L 0.72 C 0.09 */
${Object.keys(sideHues).map((k) => `  --side-${k}-line: ${sideLine(k)};   --side-${k}-fill: ${sideFill(k)};`).join('\n')}

  /* Political map: a color per state, neighbors apart (owner, 2026-11-09); pale L 0.86 C 0.055, mid L 0.77 C 0.07 */
${pol.map((v, k) => `  --pol-${k}: ${v};`).join('\n')}
  /* …and each one's deep shade, for the stripes over a state's vassals (L 0.56 / 0.46, C 0.10) */
${polDeep.map((v, k) => `  --pol-${k}-deep: ${v};`).join('\n')}

  /* Ground and water */
  --parchment: ${parchment};
  --parchment-deep: ${parchmentDeep};
  --ocean: ${ocean};
  --bathy: ${bathyLine};
  --water-line: ${steel};
  --water-line-opacity: 0.6;

  --font: 'Libre Baskerville', 'Baskerville', 'Georgia', serif;
}
`;
await writeFile(join(ROOT, 'src', 'tokens.css'), css);
console.log(css);

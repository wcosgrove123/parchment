// Parchment — Military layer: the colors of the sides (proposal P1 of the brief of 2026-11-09).
// PROPOSAL, not yet grammar: nothing here reaches any other layer until the owner says yes (CLAUDE.md §5, §6).
//
// On the Military layer color means the side. Each side is a pair:
//   line  — a dark color for arrows, event fills, force frames and labels (OKLCH L 0.47, C 0.13: well below the
//           theme fills' 0.72, so a line never reads as a fill, and a shade darker than the Explorers layer's
//           sponsor colors (0.50) so a blue army and a blue voyage never share a map by accident);
//   fill  — the same hue tempered as Set A is (L 0.72, C 0.09) for the land the side holds.
// Two ways to assign them, for the owner to choose between:
//   the fixed order  — side A blue, B plum, C teal, D ochre, in the order the war's record lists its sides, the
//                      same for every war, so no hue ever means "us" or "the enemy";
//   uniform colors   — where they tell the sides apart and are what people saw then: Union blue and Confederate
//                      gray; Continental blue and British red. Blue is the fixed order's A; gray and red are extra.
// The hues keep clear of the apparatus (Set B): steel (sea, rivers; hue ≈ 245) sits between blue (262) and teal
// (185) by at least 17° and is lighter and thinner than any side line; rust (≈ 55) sits 30° from ochre (85) and
// stays the color of "inconclusive" and of every other layer's armies; moss (140) sits 45° from teal; navy (265)
// shares blue's hue but is half as light (L 0.25) and only ever a hairline or a letter.

import { oklchToHex, hexToOklch } from './color.js';

export const LINE = { L: 0.47, C: 0.13 };
export const FILL = { L: 0.72, C: 0.09 };

export const PALETTE = {
  a: { hue: 262, name: 'blue', why: 'first side; also the uniform blue of the Continental and Union armies' },
  b: { hue: 340, name: 'plum', why: 'second side; far from rust and from blue, and not the red of any uniform' },
  c: { hue: 185, name: 'teal', why: 'third side; between moss and steel in hue, darker than either' },
  d: { hue: 85, name: 'ochre', why: 'fourth side; 30° from rust, so an inconclusive battle still stands apart' },
};
// Extra pairs for the uniform scheme.
export const UNIFORM = {
  gray: { hue: 260, C: 0.012, name: 'gray', why: 'Confederate gray (and any side whose uniform was gray)' },
  red: { hue: 25, name: 'red', why: 'British red coats, 1775–83 and 1812–15' },
};

export const PAPER = '#F7F5EF';

// { line, fill, hue } for a palette key ('a'…'d'), a uniform key ('gray', 'red') or a hue.
export function sideColors(key) {
  const spec = typeof key === 'number' ? { hue: key } : (PALETTE[key] ?? UNIFORM[key]);
  if (!spec) throw new Error(`no side color "${key}"`);
  const c = spec.C ?? null;
  return {
    key: typeof key === 'number' ? `h${key}` : key,
    hue: spec.hue,
    line: oklchToHex({ L: LINE.L, C: c ?? LINE.C, h: spec.hue }),
    fill: oklchToHex({ L: FILL.L, C: c ?? FILL.C, h: spec.hue }),
    name: spec.name ?? `hue ${spec.hue}`,
  };
}

// Proposal P4: an earlier position fades. t = 0 is today (the full line color); t = 1 the earliest step, lightest.
// Lightness climbs toward the paper and chroma falls, never a dash.
export function faded(hex, t) {
  const c = hexToOklch(hex);
  return oklchToHex({ L: c.L + (0.84 - c.L) * t, C: c.C * (1 - 0.7 * t), h: c.h });
}

export const ALL = () => Object.fromEntries([...Object.keys(PALETTE), ...Object.keys(UNIFORM)].map((k) => [k, sideColors(k)]));

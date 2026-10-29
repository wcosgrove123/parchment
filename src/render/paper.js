// Parchment — paper
// Procedural parchment ground: fibre and grain from SVG turbulence (no stock textures), plus a soft vignette.

export function paperDefs(defs) {
  const grain = defs.append('filter').attr('id', 'paper-grain')
    .attr('x', '0%').attr('y', '0%').attr('width', '100%').attr('height', '100%')
    .attr('color-interpolation-filters', 'sRGB');
  // fine grain
  grain.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', '0.9').attr('numOctaves', 2).attr('seed', 11).attr('stitchTiles', 'stitch').attr('result', 'fine');
  // faint, long fibres (gentle: parchment, not wood)
  grain.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', '0.006 0.05').attr('numOctaves', 2).attr('seed', 4).attr('stitchTiles', 'stitch').attr('result', 'fibre');
  grain.append('feBlend').attr('in', 'fine').attr('in2', 'fibre').attr('mode', 'screen').attr('result', 'noise');
  grain.append('feColorMatrix').attr('in', 'noise').attr('type', 'saturate').attr('values', '0').attr('result', 'gray');
  // lift the gray close to white so the multiply only darkens a few percent, and flatten alpha
  const ct = grain.append('feComponentTransfer').attr('in', 'gray').attr('result', 'tex');
  ct.append('feFuncR').attr('type', 'linear').attr('slope', 0.22).attr('intercept', 0.8);
  ct.append('feFuncG').attr('type', 'linear').attr('slope', 0.22).attr('intercept', 0.8);
  ct.append('feFuncB').attr('type', 'linear').attr('slope', 0.22).attr('intercept', 0.8);
  ct.append('feFuncA').attr('type', 'table').attr('tableValues', '1 1');
  grain.append('feBlend').attr('in', 'SourceGraphic').attr('in2', 'tex').attr('mode', 'multiply');

  const vignette = defs.append('radialGradient').attr('id', 'paper-vignette').attr('cx', '50%').attr('cy', '50%').attr('r', '72%');
  vignette.append('stop').attr('offset', '55%').attr('stop-color', '#000').attr('stop-opacity', 0);
  vignette.append('stop').attr('offset', '100%').attr('stop-color', '#4a3a1c').attr('stop-opacity', 0.22);
}

// The paper itself: full-bleed parchment with grain.
export function drawPaper(root, W, H) {
  root.append('rect').attr('class', 'paper').attr('width', W).attr('height', H).attr('filter', 'url(#paper-grain)');
}

// Grain and vignette laid over the finished map so land and sea share the sheet.
export function drawPaperOverlay(root, W, H) {
  root.append('rect').attr('class', 'paper-overlay').attr('width', W).attr('height', H).attr('filter', 'url(#paper-grain)');
  root.append('rect').attr('class', 'paper-vignette').attr('width', W).attr('height', H).attr('fill', 'url(#paper-vignette)');
}

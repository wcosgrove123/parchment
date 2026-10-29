// Parchment — base renderer
// Builds the stage: projection, paper, ocean, bathymetry, relief, land, polities, water lines, coast, graticule,
// labels, legend, cartouche, timeline strip. All geometry comes from the downloaded layers; this file only
// projects and styles it.

import * as d3 from 'd3';
import { feature, mesh } from 'topojson-client';
import { assetURL } from '../data/loader.js';
import { paperDefs, drawPaper, drawPaperOverlay } from './paper.js';
import { drawStageLabels, polityLabelData, drawPolityLabels } from './labels.js';
import { createCartouche } from './cartouche.js';
import { createStrip } from './strip.js';
import { createLegend } from './legend.js';

export const W = 1920;
export const H = 1080;
// The gold ring. The bottom is deeper because it carries the timeline strip.
export const FRAME = { left: 32, right: 32, top: 32, bottom: 64 };

const PROJECTIONS = {
  equalEarth: () => d3.geoEqualEarth(),
  lambertAzimuthalEqualArea: () => d3.geoAzimuthalEqualArea(),
  albersUsa: () => d3.geoAlbersUsa(),
};

// A lon/lat box with its edges densified so fitExtent sees the box's curved outline in the projection.
// d3-geo treats spherical polygons by winding order: the exterior ring must run clockwise
// (west→east along the north edge first), or the "inside" becomes the rest of the globe.
function extentPolygon({ west, south, east, north }, step = 1) {
  const ring = [];
  for (let x = west; x < east; x += step) ring.push([x, north]);
  for (let y = north; y > south; y -= step) ring.push([east, y]);
  for (let x = east; x > west; x -= step) ring.push([x, south]);
  for (let y = south; y < north; y += step) ring.push([west, y]);
  ring.push(ring[0]);
  return { type: 'Polygon', coordinates: [ring] };
}

export function makeProjection(stage, inner) {
  const make = PROJECTIONS[stage.projection];
  if (!make) throw new Error(`Unknown projection ${stage.projection}`);
  const proj = make();
  if (stage.rotate && proj.rotate) proj.rotate(stage.rotate);
  proj.fitExtent(inner, extentPolygon(stage.extent));
  return proj;
}

export function createStage(svg, stage, layers, { tracker, years = [], onYear } = {}) {
  const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
  const [[x0, y0], [x1, y1]] = inner;
  const frame = { x0, y0, x1, y1 };
  const projection = makeProjection(stage, inner);
  const path = d3.geoPath(projection);

  // Projected path strings are cached per feature object: a snapshot switch only re-binds cached strings.
  const cache = new WeakMap();
  const d = (f) => {
    let s = cache.get(f);
    if (s === undefined) { s = path(f) || ''; cache.set(f, s); }
    return s;
  };

  svg.attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet');
  svg.selectAll('*').remove();

  const defs = svg.append('defs');
  paperDefs(defs);
  defs.append('clipPath').attr('id', 'frame-clip').append('rect')
    .attr('x', x0).attr('y', y0).attr('width', x1 - x0).attr('height', y1 - y0);

  const root = svg.append('g').attr('class', 'stage');
  drawPaper(root, W, H);

  const map = root.append('g').attr('class', 'map').attr('clip-path', 'url(#frame-clip)');
  // The ocean is the globe itself; anything beyond its edge stays paper.
  map.append('path').attr('class', 'ocean').attr('d', d({ type: 'Sphere' }));

  // Bathymetry: hairline contours in the ocean tone.
  const bathy = feature(layers.bathy, layers.bathy.objects.bathymetry);
  map.append('g').attr('class', 'bathymetry')
    .selectAll('path').data(bathy.features).join('path').attr('d', d);

  // Land at rest (cream), then relief (pre-rendered for this stage, when present), masked to land.
  const ne = layers.ne;
  const land = feature(ne, ne.objects.land);
  map.append('path').attr('class', 'land').attr('d', d(land));
  if (stage.relief) {
    defs.append('clipPath').attr('id', 'land-clip').append('path').attr('d', d(land));
    map.append('image').attr('class', 'relief')
      .attr('clip-path', 'url(#land-clip)')
      .attr('x', x0).attr('y', y0).attr('width', x1 - x0).attr('height', y1 - y0)
      .attr('preserveAspectRatio', 'none')
      .attr('href', assetURL(`assets/${stage.relief}`));
  }

  // Polities (filled per snapshot) and their interior borders.
  const polities = map.append('g').attr('class', 'polities');
  const borders = map.append('g').attr('class', 'borders');

  // Water lines and coast.
  const rivers = feature(ne, ne.objects.rivers);
  map.append('g').attr('class', 'rivers')
    .selectAll('path').data(rivers.features.filter((f) => (f.properties.scalerank ?? 0) <= 7)).join('path').attr('d', d);
  const lakes = feature(ne, ne.objects.lakes);
  map.append('path').attr('class', 'lakes').attr('d', d(lakes));
  map.append('path').attr('class', 'coastline').attr('d', d(feature(ne, ne.objects.coastline)));

  // Graticule: hairline gold, every 10°.
  map.append('path').attr('class', 'graticule').attr('d', d(d3.geoGraticule10()));

  // Labels: stage labels along their parallels, polity labels per snapshot.
  drawStageLabels(map.append('g').attr('class', 'stage-labels'), defs, stage, path);
  const polityLabels = map.append('g').attr('class', 'polity-labels');

  // Grain and vignette over the sheet, then the apparatus on top.
  drawPaperOverlay(root, W, H);

  // Frame: gold on three sides; the bottom edge is the timeline strip's baseline.
  root.append('path').attr('class', 'frame').attr('d', `M${x0},${y1}L${x0},${y0}L${x1},${y0}L${x1},${y1}`);

  const legend = createLegend(root, frame);
  if (tracker) legend.set(tracker);
  const cartouche = createCartouche(root, frame, stage, projection);
  const strip = createStrip(root, frame, stage, years, onYear);

  let currentYear = null;

  // classify(feature, year) → { status: 'highlight' | 'muted', key?, label? }
  function showSnapshot(year, topo, classify = () => ({ status: 'muted' })) {
    const fc = feature(topo, topo.objects.polities);
    const named = fc.features.filter((f) => f.properties.id);
    for (const f of named) f.properties.cls = classify(f, year);
    polities.selectAll('path')
      .data(named, (f) => f.properties.id)
      .join('path')
      .attr('class', (f) => `polity ${f.properties.certainty} ${f.properties.cls.status}`)
      .attr('d', d)
      .append('title').text((f) => f.properties.cls.label ?? f.properties.name);
    const interior = mesh(topo, topo.objects.polities, (a, b) => a !== b);
    const certainty = named[0]?.properties.certainty ?? 'approximate';
    borders.selectAll('path').data([interior]).join('path')
      .attr('class', `border ${certainty}`)
      .attr('d', d);
    drawPolityLabels(polityLabels, polityLabelData(named.filter((f) => f.properties.cls.status === 'highlight'), path));
    currentYear = year;
  }

  function setYear(year, sourceYear) {
    cartouche.setYear(year, sourceYear);
    strip.setYear(year);
  }

  return { projection, path, d, frame, showSnapshot, setYear, legend, cartouche, get year() { return currentYear; } };
}

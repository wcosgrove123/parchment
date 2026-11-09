#!/usr/bin/env node
// Parchment — relief-region.mjs
// A plate-carrée shaded relief of one region at the full resolution of Natural Earth SR_50M (30 pixels a degree),
// with the same contrast stretch as relief.mjs and relief-world.mjs, for frames drawn in the browser
// (src/render/relief-reproject.js). The world image (4320 wide, 12 pixels a degree) blurs at the scale of a state;
// this one keeps Texas's escarpments. A JSON beside the image gives its box.
//   node scripts/relief-region.mjs [--name north-america] [--box -135,12,-55,60]
//     → assets/relief/<name>-plate-carree.png and .json

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromFile } from 'geotiff';
import { PNG } from 'pngjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TIF = join(ROOT, 'data', 'base', 'raw', 'natural-earth', 'SR_50M', 'SR_50M.tif');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const name = arg('name', 'north-america');
const [west, south, east, north] = arg('box', '-135,12,-55,60').split(',').map(Number);

const image = await (await fromFile(TIF)).getImage();
const [sw, sh] = [image.getWidth(), image.getHeight()];
const [bx0, by0, bx1, by1] = image.getBoundingBox();
const raster = (await image.readRasters({ samples: [0] }))[0];
const pxPerDeg = sw / (bx1 - bx0);
console.log(`SR_50M ${sw}×${sh}, ${pxPerDeg.toFixed(1)} px/degree`);

// The stretch of relief-world.mjs, measured on the whole raster so a region matches the world image's tones.
const hist = new Uint32Array(256);
for (let k = 0; k < raster.length; k += 97) hist[raster[k]]++;
let acc = 0, flat = 255;
const total = hist.reduce((a, b) => a + b, 0);
for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.9) { flat = v; break; } }
const lut = new Uint8Array(256);
for (let v = 0; v < 256; v++) lut[v] = Math.round(255 * Math.min(1, Math.pow(v / flat, 1.35)));

// Crop at the source's own pixels (no resampling).
const x0 = Math.round((west - bx0) * pxPerDeg), x1 = Math.round((east - bx0) * pxPerDeg);
const y0 = Math.round((by1 - north) * pxPerDeg), y1 = Math.round((by1 - south) * pxPerDeg);
const OW = x1 - x0, OH = y1 - y0;
const png = new PNG({ width: OW, height: OH, colorType: 0, inputColorType: 0, bitDepth: 8, inputHasAlpha: false });
for (let y = 0; y < OH; y++) for (let x = 0; x < OW; x++) png.data[y * OW + x] = lut[raster[(y0 + y) * sw + (x0 + x)]];
const out = join(ROOT, 'assets', 'relief', `${name}-plate-carree.png`);
await mkdir(dirname(out), { recursive: true });
const buf = PNG.sync.write(png, { colorType: 0, inputColorType: 0, bitDepth: 8, inputHasAlpha: false });
await writeFile(out, buf);
const box = { west: bx0 + x0 / pxPerDeg, south: by1 - y1 / pxPerDeg, east: bx0 + x1 / pxPerDeg, north: by1 - y0 / pxPerDeg };
await writeFile(out.replace(/\.png$/, '.json'), `${JSON.stringify({ _source: 'Natural Earth SR_50M (public domain), cropped by scripts/relief-region.mjs', image: `relief/${name}-plate-carree.png`, width: OW, height: OH, box }, null, 2)}\n`);
console.log(`wrote assets/relief/${name}-plate-carree.png ${OW}×${OH}, ${(buf.length / 1024).toFixed(0)} KB, box ${Object.values(box).map((v) => v.toFixed(2)).join(',')}`);

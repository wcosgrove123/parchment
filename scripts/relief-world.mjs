#!/usr/bin/env node
// Parchment — relief-world.mjs
// One plate-carrée shaded-relief image of the whole world (Natural Earth SR_50M, the same contrast stretch as
// relief.mjs), from which the browser reprojects relief for any focus: a region, or an empire framed on the fly.
// The fixed stages keep their own sharper pre-rendered relief (relief.mjs).
//   node scripts/relief-world.mjs [--width 4320]      → assets/relief/world-plate-carree.png (grayscale)

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromFile } from 'geotiff';
import { PNG } from 'pngjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TIF = join(ROOT, 'data', 'base', 'raw', 'natural-earth', 'SR_50M', 'SR_50M.tif');
const i = process.argv.indexOf('--width');
const OW = i > -1 ? Number(process.argv[i + 1]) : 4320;
const OH = OW / 2;

const image = await (await fromFile(TIF)).getImage();
const [sw, sh] = [image.getWidth(), image.getHeight()];
const bbox = image.getBoundingBox();
const raster = (await image.readRasters({ samples: [0] }))[0];
console.log(`SR_50M ${sw}×${sh}, bbox ${bbox.map((v) => v.toFixed(1)).join(' ')}`);

// Same stretch as relief.mjs: the 90th-percentile gray (flat ground) becomes white.
const hist = new Uint32Array(256);
for (let k = 0; k < raster.length; k += 97) hist[raster[k]]++;
let acc = 0, flat = 255;
const total = hist.reduce((a, b) => a + b, 0);
for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.9) { flat = v; break; } }
const lut = new Uint8Array(256);
for (let v = 0; v < 256; v++) lut[v] = Math.round(255 * Math.min(1, Math.pow(v / flat, 1.35)));

// Area-average each output pixel over the source pixels it covers (the output is smaller than the source).
const png = new PNG({ width: OW, height: OH, colorType: 0, inputColorType: 0, bitDepth: 8, inputHasAlpha: false });
const fx = sw / OW, fy = sh / OH;
for (let y = 0; y < OH; y++) {
  const sy0 = Math.floor(y * fy), sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * fy));
  for (let x = 0; x < OW; x++) {
    const sx0 = Math.floor(x * fx), sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * fx));
    let s = 0, n = 0;
    for (let yy = sy0; yy < sy1 && yy < sh; yy++) for (let xx = sx0; xx < sx1 && xx < sw; xx++) { s += lut[raster[yy * sw + xx]]; n++; }
    png.data[y * OW + x] = n ? Math.round(s / n) : 255;
  }
}
const out = join(ROOT, 'assets', 'relief', 'world-plate-carree.png');
await mkdir(dirname(out), { recursive: true });
const buf = PNG.sync.write(png, { colorType: 0, inputColorType: 0, bitDepth: 8, inputHasAlpha: false });
await writeFile(out, buf);
console.log(`wrote assets/relief/world-plate-carree.png ${OW}×${OH}, ${(buf.length / 1024).toFixed(0)} KB (bbox ${bbox.join(',')})`);

#!/usr/bin/env node
// Parchment — relief.mjs
// Pre-renders Natural Earth shaded relief (SR_50M.tif, a plate-carrée grayscale raster) into each stage's
// projection, at twice the stage frame size so 4K exports stay crisp. Output: assets/relief/<stage>.png
// (8-bit grayscale; white = flat, darker = slope shadow). The browser masks it to land and multiplies it under the fills.
//   node scripts/relief.mjs [stage-id ...]

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromFile } from 'geotiff';
import { PNG } from 'pngjs';
import { makeProjection, W, H, FRAME } from '../src/render/base.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCALE = 2;
const TIF = join(ROOT, 'data', 'base', 'raw', 'natural-earth', 'SR_50M', 'SR_50M.tif');

const wanted = process.argv.slice(2);
const stageFiles = (await readdir(join(ROOT, 'src', 'stages'))).filter((f) => f.endsWith('.json'));
const stages = [];
for (const f of stageFiles) {
  const s = JSON.parse(await readFile(join(ROOT, 'src', 'stages', f), 'utf8'));
  if (!wanted.length || wanted.includes(s.id)) stages.push(s);
}

console.log(`reading ${basename(TIF)} …`);
const tiff = await fromFile(TIF);
const image = await tiff.getImage();
const [sw, sh] = [image.getWidth(), image.getHeight()];
const [bbox] = [image.getBoundingBox()]; // [west, south, east, north]
const raster = (await image.readRasters({ samples: [0] }))[0];
console.log(`  ${sw}×${sh}, bbox ${bbox.map((v) => v.toFixed(1)).join(' ')}`);

// Contrast: Natural Earth's flat land sits near one gray value; stretch so that value becomes white.
let hist = new Uint32Array(256);
for (let i = 0; i < raster.length; i += 97) hist[raster[i]]++;
let acc = 0, total = hist.reduce((a, b) => a + b, 0), flat = 255;
for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.9) { flat = v; break; } }
console.log(`  90th-percentile gray = ${flat} (treated as flat ground)`);
const lut = new Uint8Array(256);
for (let v = 0; v < 256; v++) lut[v] = Math.round(255 * Math.min(1, Math.pow(v / flat, 1.35)));

const sample = (lon, lat) => {
  // bilinear sample in source pixel space
  const fx = ((lon - bbox[0]) / (bbox[2] - bbox[0])) * sw - 0.5;
  const fy = ((bbox[3] - lat) / (bbox[3] - bbox[1])) * sh - 0.5;
  const x0 = Math.max(0, Math.min(sw - 1, Math.floor(fx))), y0 = Math.max(0, Math.min(sh - 1, Math.floor(fy)));
  const x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1);
  const tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0));
  const a = raster[y0 * sw + x0], b = raster[y0 * sw + x1], c = raster[y1 * sw + x0], d = raster[y1 * sw + x1];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
};

await mkdir(join(ROOT, 'assets', 'relief'), { recursive: true });
for (const stage of stages) {
  const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
  const projection = makeProjection(stage, inner);
  const [[x0, y0], [x1, y1]] = inner;
  const ow = Math.round((x1 - x0) * SCALE), oh = Math.round((y1 - y0) * SCALE);
  const png = new PNG({ width: ow, height: oh, colorType: 0, inputColorType: 0, bitDepth: 8, inputHasAlpha: false });
  const data = png.data;
  let outside = 0;
  for (let py = 0; py < oh; py++) {
    const sy = y0 + (py + 0.5) / SCALE;
    for (let px = 0; px < ow; px++) {
      const sx = x0 + (px + 0.5) / SCALE;
      const ll = projection.invert([sx, sy]);
      let v = 255;
      if (ll && Number.isFinite(ll[0]) && Number.isFinite(ll[1]) && Math.abs(ll[1]) <= 90) {
        // guard against invert() returning points off the globe (round-trip check)
        const back = projection(ll);
        if (back && Math.hypot(back[0] - sx, back[1] - sy) < 1) v = lut[Math.round(sample(ll[0], ll[1]))];
        else outside++;
      } else outside++;
      data[py * ow + px] = v;
    }
  }
  const out = join(ROOT, 'assets', stage.relief ?? `relief/${stage.id}.png`);
  await mkdir(dirname(out), { recursive: true });
  const buf = PNG.sync.write(png, { colorType: 0, inputColorType: 0, bitDepth: 8, inputHasAlpha: false });
  await writeFile(out, buf);
  console.log(`  ${stage.id}: ${ow}×${oh}, ${(buf.length / 1024).toFixed(0)} KB, ${outside} px off-globe → ${out.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
}

#!/usr/bin/env node
// Parchment — film.mjs: the play run as a video (brief §5).
// Takes an order like a lesson map's with "play": a film id from data/vocab.json's films, opens the North America
// page headless on the film, steps through its frames at the chapters' paces (a frame per 1/fps second of film
// time; the same frame the page would draw at that moment), saves each as a PNG and, when ffmpeg is on the PATH,
// writes an H.264 MP4 that plays inside PowerPoint. Nothing slides: a frame whose date did not change is held.
//   node scripts/film.mjs tests/maps/military/texas-film.json [--fps 6] [--out out/film/texas-1821-1854] [--no-mp4] [--limit 40] [--resume]
// Writes <out>/frames/f000001.png …, <out>/frames.txt (ffmpeg concat list), <out>.json (the film, its frames, the
// last frame's packing slip) and <out>.mp4.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { launch, findBrowser, NO_BROWSER } from './browser.mjs';
import { serve, bundle } from './serve.mjs';
import { orderToQuery, parseSize, sheetFor } from '../src/us/frames.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FPS = 24; // the video's frame rate; frames are held to fill it

// resume: keep frames already on disk (a run that stopped) and write only the missing ones; the browser is opened
// afresh every BATCH frames, which keeps memory flat over a long film.
const BATCH = 250;
export async function renderFilm(order, { out = null, fps = 6, mp4 = true, limit = 0, resume = false, base = process.cwd(), log = () => {}, browser = null } = {}) {
  if (!order.play) throw new Error('the order has no "play": the id of a film in data/vocab.json');
  const size = order.size ? parseSize(order.size) : { width: 1920, height: 1080 };
  if (!size) throw new Error(`size "${order.size}" must be WIDTHxHEIGHT`);
  const sheet = sheetFor(size, order.scale);
  const o = { ...order, layer: 'military' };
  const query = orderToQuery(o);
  query.set('shot', '1');
  const address = `us.html?${query}`;
  const target = resolve(base, out ?? order.out ?? join('out', 'film', String(order.play)));
  const framesDir = `${target}/frames`;
  if (!resume) rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const js = await bundle(ROOT).catch((err) => { log(`the page was not rebuilt from src/ (${err.message}); the committed us.js was used`); return null; });
  const server = await serve(ROOT, { files: js ? { '/us.js': js } : {} });
  const found = browser ?? findBrowser();
  if (!found) { await server.close(); throw new Error(NO_BROWSER); }
  let b = await launch({ browser: found });
  const t0 = Date.now();
  const READY = `new Promise((resolve, reject) => {
      const t0 = Date.now();
      (function wait() {
        if (window.parchment && window.parchment.ready) window.parchment.ready.then(() => resolve(true), (e) => reject(String(e && e.message || e)));
        else if (Date.now() - t0 > 90000) reject('the page did not finish drawing in 90 s');
        else setTimeout(wait, 50);
      })();
    })`;
  let page = null;
  const open = async (url) => {
    if (page) await page.close().catch(() => {});
    page = await b.newPage({ width: sheet.w, height: sheet.h, scale: sheet.scale, origin: server.origin });
    await page.goto(url);
    await page.eval(READY);
    return page;
  };
  try {
    await open(`${server.origin}/${address}`);
    const film = await page.eval('window.parchment.film()');
    if (!film) throw new Error(`the page found no film "${order.play}" (page errors: ${page.errors.slice(0, 2).join(' | ') || 'none'})`);
    let frames = await page.eval(`window.parchment.filmFrames(${Number(fps)})`);
    if (limit) frames = frames.slice(0, limit);
    log(`${film.title}: ${film.chapters.length} chapters, ${Math.round(film.seconds)} s of film; ${frames.length} distinct frames at ${fps}/s`);
    const list = [];
    let last = null;
    const fixedFrame = !!order.frame;
    let frameNow = film.frame_shown ?? null;
    let inBatch = 0;
    const pageFor = (fr) => { const q2 = new URLSearchParams(query); if (!fixedFrame && fr.frame) q2.set('frame', fr.frame); q2.set('date', fr.date); return `${server.origin}/us.html?${q2}`; };
    for (const fr of frames) {
      const name = `f${String(fr.index + 1).padStart(6, '0')}.png`;
      // (a kept frame does not move the page: frameNow is the frame the open page is on, nothing else. The first
      // resumed run forgot that and drew the rest of the war chapter on the first chapter's frame.)
      if (resume && existsSync(join(framesDir, name))) { list.push({ ...fr, shown: fr.date, file: `frames/${name}`, kept: true }); continue; }
      // a chapter framed elsewhere: open the page again on that frame (as the live page reloads itself); and a fresh
      // browser every BATCH frames, so a long film does not grow in memory
      if (inBatch >= BATCH) { await page.close().catch(() => {}); page = null; await b.close(); b = await launch({ browser: found }); inBatch = 0; await open(pageFor(fr)); frameNow = (!fixedFrame && fr.frame) ? fr.frame : frameNow; }
      else if (!page || (!fixedFrame && fr.frame && fr.frame !== frameNow)) { await open(pageFor(fr)); frameNow = (!fixedFrame && fr.frame) ? fr.frame : frameNow; log(`  chapter ${fr.chapter} on the ${frameNow ?? 'page'} frame`); }
      const shown = await page.eval(`window.parchment.filmSeek(${JSON.stringify(fr.date)})`);
      const png = await page.screenshot();
      writeFileSync(join(framesDir, name), png);
      list.push({ ...fr, shown, file: `frames/${name}` });
      inBatch += 1;
      if (fr.index % 50 === 0 || fr.index === frames.length - 1) log(`  frame ${fr.index + 1}/${frames.length} · ${fr.date} · chapter ${fr.chapter} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      last = fr;
    }
    const slip = await page.eval('window.parchment.packingSlip()');
    // ffmpeg's concat list: each frame held for its share of film time
    const concat = list.map((f) => `file '${f.file.replace(/'/g, "'\\''")}'\nduration ${(f.hold / fps).toFixed(4)}`).join('\n') + (list.length ? `\nfile '${list.at(-1).file}'\n` : '');
    writeFileSync(`${target}/frames.txt`, concat);
    let video = null;
    if (mp4 && list.length) {
      const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'frames.txt',
        '-vf', `fps=${OUT_FPS},format=yuv420p,scale=trunc(iw/2)*2:trunc(ih/2)*2`, '-c:v', 'libopenh264', '-b:v', '8M', '-movflags', '+faststart', `${target}.mp4`], { cwd: target, encoding: 'utf8' });
      if (r.error) log(`ffmpeg is not on the PATH (${r.error.message}): frames and frames.txt are written; make the video with ffmpeg -f concat -i frames.txt …`);
      else if (r.status !== 0) log(`ffmpeg failed: ${(r.stderr || '').trim().split('\n').slice(-3).join(' | ')}`);
      else video = `${target}.mp4`;
    }
    const manifest = {
      film, order, address, fps, output_fps: OUT_FPS, frames: list, video: video ? relative(base, video) : null,
      seconds: film.seconds, made_in_seconds: (Date.now() - t0) / 1000, credit: slip.credit, last_frame_slip: slip,
      page_errors: page.errors, warnings: slip.warnings,
    };
    writeFileSync(`${target}.json`, `${JSON.stringify(manifest, null, 2)}\n`);
    await page.close();
    return { json: `${target}.json`, video, frames: list.length, film, framesDir, slip };
  } finally {
    await b.close();
    await server.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (name) => { const i = args.indexOf(`--${name}`); return i > -1 ? args.splice(i, 2)[1] : null; };
  const noMp4 = args.includes('--no-mp4'); if (noMp4) args.splice(args.indexOf('--no-mp4'), 1);
  const resume = args.includes('--resume'); if (resume) args.splice(args.indexOf('--resume'), 1);
  const outArg = flag('out'), fpsArg = flag('fps'), limitArg = flag('limit');
  const file = args[0];
  if (!file) { console.error('usage: npm run film -- path/to/order.json [--fps 6] [--out out/film/name] [--no-mp4] [--limit N] [--resume]'); process.exit(2); }
  let order;
  try { order = JSON.parse(readFileSync(resolve(file), 'utf8')); } catch (err) { console.error(`could not read the order ${file}: ${err.message}`); process.exit(2); }
  try {
    const r = await renderFilm(order, { out: outArg, fps: fpsArg ? Number(fpsArg) : 6, mp4: !noMp4, limit: limitArg ? Number(limitArg) : 0, resume, log: (m) => console.log(m) });
    console.log(`wrote ${r.frames} frames to ${relative(process.cwd(), r.framesDir)}${r.video ? ` and ${relative(process.cwd(), r.video)}` : ''}; ${relative(process.cwd(), r.json)}`);
    if (r.slip.warnings?.length) console.log(`warnings (last frame):\n  - ${r.slip.warnings.join('\n  - ')}`);
  } catch (err) {
    console.error(`could not make the film: ${err.message}`);
    process.exit(1);
  }
}

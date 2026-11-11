#!/usr/bin/env node
// Parchment — military-icons.mjs
// Fetches the equipment icons the Military layer proposes (src/military/icons.json) from the game-icons.net
// repository, strips each one's black background square so the silhouette takes the side's color on the map, and
// writes them to assets/icons/military/<author>/<name>.svg with MANIFEST.json (source URL, author, license, date,
// what was changed) and LICENSE.md beside them. Nothing is traced or redrawn: the shapes are the authors' own.
//   node scripts/military-icons.mjs            fetch what is missing, rewrite the manifest
//   node scripts/military-icons.mjs --refresh  fetch everything again
// Also exports loadIcons() for the picture sheet (scripts/military-sheet.mjs): the stripped path data per key.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = join(ROOT, 'src', 'military', 'icons.json');
export const ICON_DIR = join(ROOT, 'assets', 'icons', 'military');
const RAW = 'https://raw.githubusercontent.com/game-icons/icons/master';
const SQUARE = /<path d="M0 0h512v512H0z"\s*\/>/;

export const catalog = () => JSON.parse(readFileSync(CATALOG, 'utf8'));

// A game-icons file is a white shape on a black 512×512 square. Keep the shape, drop the square and the white.
export function strip(svg) {
  if (!SQUARE.test(svg)) throw new Error('no background square found (not a game-icons file as published?)');
  const out = svg.replace(SQUARE, '').replace(/\s+fill="#fff"/g, '');
  if (!/<path /.test(out)) throw new Error('nothing left after the square was removed');
  return out;
}

// Every path's data in a stripped file, joined: one silhouette to draw with one fill.
export function pathData(svg) {
  const ds = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  const vb = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 512 512';
  return { d: ds.join(' '), viewBox: vb };
}

// { key → { d, viewBox, ...catalog entry, author } } from the files on disk (no network).
export function loadIcons() {
  const cat = catalog();
  const out = {};
  for (const ic of cat.icons) {
    const file = join(ICON_DIR, `${ic.file}.svg`);
    if (!existsSync(file)) continue;
    const [author] = ic.file.split('/');
    out[ic.key] = { ...ic, ...pathData(readFileSync(file, 'utf8')), author: cat.authors[author]?.name ?? author };
  }
  return out;
}

async function main() {
  const refresh = process.argv.includes('--refresh');
  const cat = catalog();
  const today = new Date().toISOString().slice(0, 10);
  const manifestFile = join(ICON_DIR, 'MANIFEST.json');
  const old = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : { icons: [] };
  const manifest = {
    _comment: 'Written by scripts/military-icons.mjs. Each icon is a game-icons.net silhouette with its black background square removed and its white fill dropped, so the map can color it; the shape itself is unchanged. Licenses: LICENSE.md beside this file. Nothing here is in the tech catalog until the owner has reviewed it (brief of 2026-11-09, §3).',
    source: 'https://github.com/game-icons/icons', license_file: cat.license_file, icons: [],
  };
  for (const ic of cat.icons) {
    const [author, name] = ic.file.split('/');
    const a = cat.authors[author];
    if (!a) throw new Error(`${ic.file}: author ${author} is not in icons.json's authors (license unknown)`);
    const dir = join(ICON_DIR, author);
    const file = join(dir, `${name}.svg`);
    const prev = old.icons.find((o) => o.file === ic.file);
    let retrieved = prev?.retrieved ?? null;
    if (refresh || !existsSync(file)) {
      const url = `${RAW}/${ic.file}.svg`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
      const svg = strip(await res.text());
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, svg);
      retrieved = today;
      console.log(`fetched ${ic.file} (${a.name}, ${a.license})`);
    }
    manifest.icons.push({
      key: ic.key, file: ic.file, source_url: `${RAW}/${ic.file}.svg`, page: `https://game-icons.net/1x1/${author}/${name}.html`,
      author: a.name, author_url: a.url, license: a.license,
      license_url: a.license === 'CC0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/licenses/by/3.0/',
      retrieved, changed: 'background square removed; fill left to the map',
      class: ic.class, domain: ic.domain, depicts: ic.depicts, era_starting_point: ic.era, status: ic.status, note: ic.note ?? null, owner_review: ic.review ?? 'pending', // (the owner's verdict as the catalog records it; a rerun must not wipe it)
    });
  }
  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  const authors = [...new Set(cat.icons.map((ic) => ic.file.split('/')[0]))].map((k) => cat.authors[k]);
  const lines = [
    '# Icon licenses', '',
    'The SVG files in this folder are silhouettes from [game-icons.net](https://game-icons.net), fetched from',
    `<${manifest.source}> by \`scripts/military-icons.mjs\` (each file's URL, author and retrieval date are in`,
    '`MANIFEST.json`). That project licenses them under **Creative Commons Attribution 3.0 Unported (CC BY 3.0)**,',
    '<https://creativecommons.org/licenses/by/3.0/>, except where its `license.txt` marks an author CC0.', '',
    'Authors of the icons in this folder:', '',
    ...authors.map((a) => `- ${a.name}${a.url ? ` (${a.url})` : ''}, ${a.license}`), '',
    '**What was changed:** each icon\'s black 512×512 background square was removed and its white fill dropped, so the',
    'map can draw the shape in the color of the side that used the equipment. The shapes themselves are unchanged.', '',
    '**Attribution on the map:** the packing slip of every map that draws an icon lists it with its author and license',
    '(brief of 2026-11-09, §6), and the credit line names game-icons.net. `docs/DATA-LICENSES.md` points here.', '',
    'Icons whose `status` is `flagged` in `MANIFEST.json` were fetched only so the owner can see why the brief',
    'passed them over (their names mislead); they are not for use on a map.', '',
  ];
  writeFileSync(join(ICON_DIR, 'LICENSE.md'), lines.join('\n'));
  console.log(`${manifest.icons.length} icons in ${manifestFile}`);
  const stray = [];
  for (const author of readdirSync(ICON_DIR, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of readdirSync(join(ICON_DIR, author.name))) if (!cat.icons.some((ic) => ic.file === `${author.name}/${f.replace(/\.svg$/, '')}`)) stray.push(`${author.name}/${f}`);
  }
  if (stray.length) console.log(`not in the catalog (delete or add): ${stray.join(', ')}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((err) => { console.error(err.message); process.exit(1); });

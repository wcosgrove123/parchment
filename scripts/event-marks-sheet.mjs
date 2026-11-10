#!/usr/bin/env node
// Parchment — event-marks-sheet.mjs
// A picture sheet for the owner (2026-11-10: "sieges, battles, naval battles, and other types of fighting encounters
// should have different icons"): candidate marks for each kind of event on the Military layer, as three sets, each
// shown large and then at map size on a live render of the war. Nothing in src/ changes and nothing enters the icon
// catalog: the candidates are fetched to out/event-marks/ and drawn over the page's own marks for the picture only.
// The silhouettes are game-icons.net's (CC BY 3.0), the library the layer's reviewed equipment icons come from.
//   node scripts/event-marks-sheet.mjs [--out docs/progress] [--date 1777-01-31] [--frame -75.4,39.9,-73.2,41.45]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, findBrowser, NO_BROWSER } from './browser.mjs';
import { serve, bundle } from './serve.mjs';
import { strip, pathData } from './military-icons.mjs';
import { sideColors } from '../src/military/sides.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const OUT = resolve(ROOT, arg('out', 'docs/progress'));
const DATE = arg('date', '1777-01-31');
const FRAME = arg('frame', '-75.4,39.9,-73.2,41.45');
const WAR = arg('war', 'american-revolution');
const TODAY = new Date().toISOString().slice(0, 10);
const CACHE = join(ROOT, 'out', 'event-marks');
const RAW = 'https://raw.githubusercontent.com/game-icons/icons/master';
const NAVY = '#1F2A44', RUST = '#C8601A', CREAM = '#F7F5EF', GOLD = '#c8a65d';

// kind → what it is, today's mark, and one candidate per set (author/name on game-icons.net)
const KINDS = [
  { kind: 'battle', label: 'Battle', today: 'diamond', sets: { A: 'lorc/crossed-swords', B: 'lorc/crossed-sabres', C: 'lorc/explosion-rays' } },
  { kind: 'siege', label: 'Siege', today: 'ringed diamond', sets: { A: 'delapouite/mortar', B: 'lorc/cannon-shot', C: 'lorc/tower-fall' } },
  { kind: 'naval-battle', label: 'Naval battle', today: 'diamond', sets: { A: 'lorc/anchor', B: 'delapouite/sinking-ship', C: 'pierre-leducq/shooner-sailboat' } },
  { kind: 'raid', label: 'Raid or skirmish', today: 'diamond', sets: { A: 'delapouite/torch', B: 'lorc/burning-embers', C: 'skoll/bayonet' } },
  { kind: 'landing', label: 'Landing', today: 'circle', sets: { A: 'pierre-leducq/small-fishing-sailboat', B: 'delapouite/sailboat', C: 'delapouite/ship-bow' } },
  { kind: 'surrender', label: 'Surrender', today: 'triangle', sets: { A: 'lorc/flying-flag', B: 'delapouite/flag-objective', C: 'lorc/black-flag' } },
  { kind: 'capture', label: 'Place taken', today: 'ringed circle', sets: { A: 'delapouite/tower-flag', B: 'lorc/guarded-tower', C: 'lorc/white-tower' } },
  { kind: 'fort', label: 'Fort', today: 'star fort (chosen 2026-11-09)', fixed: 'delapouite/military-fort' },
  { kind: 'headquarters', label: 'Camp or winter quarters', today: 'flag on a staff', sets: { A: 'delapouite/barracks-tent', B: 'delapouite/camping-tent', C: 'lorc/campfire' } },
  { kind: 'treaty', label: 'Treaty or declaration', today: 'triangle', sets: { A: 'delapouite/scroll-quill', B: 'lorc/quill-ink', C: 'lorc/wax-seal' } },
  { kind: 'blockade', label: 'Blockade', note: 'Already drawn, as a line and not an icon: it runs along the blockaded coast in the color of the side that keeps it, with ship marks (the Gulf ports, 1846).' },
  { kind: 'embargo', label: 'Embargo or sanctions', note: 'No mark yet. It is a law about a whole coast or country, so it would be a line or a shaded coast like the blockade, in its own style. For the owner to decide.' },
];

async function icon(file) {
  const at = join(CACHE, `${file}.svg`);
  if (!existsSync(at)) {
    const res = await fetch(`${RAW}/${file}.svg`);
    if (!res.ok) throw new Error(`${file}: ${res.status}`);
    mkdirSync(dirname(at), { recursive: true });
    writeFileSync(at, strip(await res.text()));
  }
  return pathData(readFileSync(at, 'utf8'));
}
const icons = {};
for (const k of KINDS) for (const f of [k.fixed, ...Object.values(k.sets ?? {})].filter(Boolean)) icons[f] = await icon(f);

const blue = sideColors('a').line, red = sideColors('red').line;
const glyph = (file, size, fill, x = 0, y = 0) => `<path d="${icons[file].d}" fill="${fill}" stroke="${CREAM}" stroke-width="${(1.6 * 512) / size}" paint-order="stroke" stroke-linejoin="round" transform="translate(${x - size / 2},${y - size / 2}) scale(${size / 512})"/>`;
const todayMark = (k, fill, s = 1) => {
  const r = 6 * s;
  if (k.kind === 'fort') return glyph(k.fixed, 20 * s, NAVY);
  if (k.today.includes('triangle')) return `<path d="M0,${-6 * s}L${5 * s},${4 * s}H${-5 * s}Z" fill="${NAVY}"/>`;
  if (k.kind === 'landing') return `<circle r="${3.5 * s}" fill="#2E6F9E"/>`;
  if (k.kind === 'capture') return `<circle r="${(6 + 5) * s / 1.4}" fill="none" stroke="${fill}" stroke-width="${2 * s}"/><circle r="${3.5 * s}" fill="#499737"/>`;
  if (k.kind === 'headquarters') return `<line y2="${-18 * s}" stroke="${NAVY}" stroke-width="${1.1 * s}"/><path d="M0,${-18 * s}L${14 * s},${-14 * s}L0,${-10 * s}Z" fill="${fill}"/><circle r="${1.6 * s}" fill="${NAVY}"/>`;
  return `${k.kind === 'siege' ? `<circle r="${r + 5 * s}" fill="none" stroke="${NAVY}" stroke-width="${2 * s}"/>` : ''}<path d="M0,${-r}L${r},0L0,${r}L${-r},0Z" fill="${fill}"/>`;
};

// ---------------------------------------------------------------- the catalog page
function catalogHTML() {
  const cellW = 300, big = 54, small = 18;
  const col = (file, k) => {
    const body = file
      ? `<svg width="${big + 10}" height="${big + 10}" viewBox="${-(big + 10) / 2} ${-(big + 10) / 2} ${big + 10} ${big + 10}">${glyph(file, big, NAVY)}</svg>
         <svg width="150" height="30" viewBox="-15 -15 150 30">${[blue, red, RUST].map((c, i) => `<g transform="translate(${i * 42},0)">${glyph(file, small, c)}</g>`).join('')}</svg>
         <div class="src">${file.replace('/', ' / ')}</div>`
      : `<svg width="${big + 10}" height="${big + 10}" viewBox="${-(big + 10) / 2} ${-(big + 10) / 2} ${big + 10} ${big + 10}"><g transform="scale(2.6)">${todayMark(k, RUST)}</g></svg>
         <svg width="150" height="30" viewBox="-15 -15 150 30">${[blue, red, RUST].map((c, i) => `<g transform="translate(${i * 42},0)">${todayMark(k, c)}</g>`).join('')}</svg>
         <div class="src">${k.today}</div>`;
    return `<td style="width:${cellW}px">${body}</td>`;
  };
  const rows = KINDS.map((k) => k.note ? `<tr><th>${k.label}</th><td colspan="4" class="note" style="padding:18px 0">${k.note}</td></tr>` : `<tr><th>${k.label}</th>${col(null, k)}${k.fixed ? `<td colspan="3" class="note">Already chosen: the star fort stays the one fort mark in every era.</td>` : ['A', 'B', 'C'].map((s) => col(k.sets[s], k)).join('')}</tr>`).join('');
  return `<!doctype html><meta charset="utf-8"><title>Event marks</title>
<link rel="stylesheet" href="src/tokens.css">
<style>
  body { margin: 0; background: ${CREAM}; color: ${NAVY}; font-family: 'Libre Baskerville', Georgia, serif; }
  main { width: 1560px; padding: 28px 36px 30px; border-top: 2px solid ${GOLD}; }
  h1 { font-size: 26px; margin: 0 0 6px; } p { font-size: 15px; line-height: 1.45; margin: 0 0 6px; max-width: 1480px; }
  table { border-collapse: collapse; margin-top: 14px; } th { text-align: left; font-size: 17px; width: 250px; vertical-align: middle; }
  thead th { font-size: 14px; font-weight: 400; font-style: italic; padding-bottom: 6px; }
  td { padding: 10px 0 8px; vertical-align: top; } tr + tr td, tr + tr th { border-top: 1px solid #d9d2bd; }
  td svg { display: block; } .src { font-size: 11.5px; color: #555c6e; margin-top: 2px; } .note { font-size: 14px; font-style: italic; vertical-align: middle; }
  .foot { font-size: 12px; color: #555c6e; margin-top: 16px; }
</style>
<main>
<h1>Marks for the kinds of fighting · three sets to choose from</h1>
<p>Each kind large, then at the size it has on the map in three colors: won by the blue side, won by the red side, and no winner recorded (rust). The color keeps its meaning (who won); the shape would now say what kind of fighting it was. Today's marks are in the first column.</p>
<table><thead><tr><th></th><th>Today</th><th>Set A</th><th>Set B</th><th>Set C</th></tr></thead><tbody>${rows}</tbody></table>
<div class="foot">Parchment, by Wil Cosgrove. Candidate silhouettes: game-icons.net contributors (Lorc, Delapouite, Skoll, Pierre Leducq), CC BY 3.0, the library the layer's reviewed equipment icons come from; each with its black square removed so the map can color it. None is in the catalog or on the map until chosen. The colors of the three samples show a form only, not any battle's result.</div>
</main>`;
}

// ---------------------------------------------------------------- the pictures
let exe = null;
try { exe = findBrowser(); } catch { console.error(NO_BROWSER); process.exit(1); }
const server = await serve(ROOT, { files: { '/us.js': await bundle(ROOT), '/out-event-marks.html': catalogHTML() } });
const browser = await launch({ browser: exe });
mkdirSync(OUT, { recursive: true });
const save = async (page, name) => { const f = join(OUT, `${TODAY}-${name}.png`); writeFileSync(f, await page.screenshot()); console.log(f); };
const inPage = (fn, ...args) => `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(',')})`;
const ready = () => new Promise((ok, no) => { const t = Date.now(); (function w() { if (window.parchment && window.parchment.ready && document.body.classList.contains('ready')) window.parchment.ready.then(ok, no); else if (Date.now() - t > 90000) no('timeout'); else setTimeout(w, 80); })(); });

try {
  const cat = await browser.newPage({ width: 1632, height: 1620, scale: 1, origin: server.origin });
  await cat.goto(`${server.origin}/out-event-marks.html`);
  await cat.eval(`document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 300)))`);
  await save(cat, 'event-marks-1-catalog');
  await cat.close();

  const page = await browser.newPage({ width: 1920, height: 1080, scale: 1, origin: server.origin });
  await page.goto(`${server.origin}/us.html?tracker=military&war=${WAR}&date=${DATE}&frame=${FRAME}&sequence=false&strip=false&shot=1`);
  await page.eval(inPage(ready));
  await page.eval(`new Promise((r) => setTimeout(r, 1200))`);
  await save(page, 'event-marks-2-map-today');
  for (const set of ['A', 'B', 'C']) {
    const byKind = Object.fromEntries(KINDS.filter((k) => k.sets).map((k) => [k.kind, icons[k.sets[set]].d]));
    const n = await page.eval(inPage((byKind, RUST, CREAM, NAVY, set) => {
      let n = 0;
      document.querySelectorAll('.event-marks-mock').forEach((e) => e.remove());
      for (const g of document.querySelectorAll('.view-main g.mark-group')) {
        const r = g.__data__?.r;
        const d = r && r.tracker === 'military' ? byKind[r.value === 'declaration' ? 'treaty' : r.value] : null;
        if (!d) continue;
        g.querySelectorAll('path.mark, .mil-ring').forEach((e) => { e.style.display = 'none'; });
        const size = r.value === 'raid' ? 15 : 18;
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('class', 'event-marks-mock'); p.setAttribute('d', d);
        p.setAttribute('fill', r.value === 'treaty' ? NAVY : RUST); p.setAttribute('stroke', CREAM); p.setAttribute('stroke-width', (1.6 * 512) / size); p.setAttribute('paint-order', 'stroke'); p.setAttribute('stroke-linejoin', 'round');
        p.setAttribute('transform', `translate(${-size / 2},${-size / 2}) scale(${size / 512})`);
        g.insertBefore(p, g.firstChild); n++;
      }
      const t = document.querySelector('.cartouche .map-title, .cartouche text');
      return n;
    }, byKind, RUST, CREAM, NAVY, set));
    console.log(`set ${set}: ${n} marks`);
    await save(page, `event-marks-${{ A: 3, B: 4, C: 5 }[set]}-map-set-${set.toLowerCase()}`);
  }
  await page.close();
} finally {
  await browser.close();
  await server.close();
}

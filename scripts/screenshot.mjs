#!/usr/bin/env node
// Parchment — screenshot.mjs
// Renders the atlas in a headless Chromium-family browser (PARCHMENT_BROWSER, Playwright's Chromium, Chrome or Edge;
// see scripts/browser.mjs) at 1920×1080 and saves a PNG to docs/progress/<date>-<year>.png.
// Starts its own dev server on a spare port, so nothing else needs to be running.
//   node scripts/screenshot.mjs [--page us] [--date 1803-12-20] [--year 1450] [--from 1450] [--stage id] [--scope all] [--tracker expansion] [--focus ottoman,safavid] [--records data/records.csv] [--labels naive] [--out path.png] [--size 1920x1080]
// --from opens the Diff view (from → year) on either page; --scope all compares every named polygon, not just tracked states.

import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser, NO_BROWSER } from './browser.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : dflt; };
const year = arg('year', '1450');
const from = arg('from', '');
const stage = arg('stage', '');
const scope = arg('scope', '');
const tracker = arg('tracker', '');
const focus = arg('focus', ''); // --focus ottoman,safavid,mughal,qing: only these tracked states
const records = arg('records', ''); // --records data/test.csv: a records file served from the repo instead of the Sheet
const labels = arg('labels', ''); // --labels naive: every name east of its dot with no checks, for before/after pictures
const size = arg('size', '1920x1080');
const page = arg('page', ''); // --page us: the North America stage (us.html); --date 1861-04-12 for a day
const now = new Date(); // the local day (an evening's pictures would otherwise carry tomorrow's UTC date)
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
// Pictures of the North America page (us.html) are named for its stage: 2026-11-05-na-1846.png, -na-diff-1783-1853.png.
const tag = page === 'us' ? 'na-' : page ? `${page}-` : '';
const defaultName = from ? `${date}-${tag}diff-${from}-${year}.png` : `${date}-${tag}${arg('date', '') || year}.png`;
const out = resolve(arg('out', join(ROOT, 'docs', 'progress', defaultName)));
const port = 8399;

// The browser: PARCHMENT_BROWSER, then Playwright's Chromium, then one on the PATH, the Windows installs last
// (scripts/browser.mjs). Playwright's headless shell has no --headless=new.
const found = findBrowser();
if (!found) { console.error(NO_BROWSER); process.exit(1); }
const browser = found.path;

mkdirSync(dirname(out), { recursive: true });
const server = spawn(process.execPath, [join(ROOT, 'scripts', 'build.mjs'), '--serve'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((resolveReady, reject) => {
  const onData = (b) => { if (String(b).includes(`:${port}/`)) resolveReady(); };
  server.stdout.on('data', onData);
  server.stderr.on('data', onData);
  server.on('exit', (c) => reject(new Error(`dev server exited early (${c})`)));
  setTimeout(() => reject(new Error('dev server did not start')), 30000);
});

const query = new URLSearchParams({ shot: '1', year });
if (arg('date', '')) { query.delete('year'); query.set('date', arg('date', '')); }
if (from) query.set('from', from);
if (stage) query.set('stage', stage);
if (scope) query.set('scope', scope);
if (tracker) query.set('tracker', tracker);
if (focus) query.set('focus', focus);
if (records) query.set('records', records);
if (labels) query.set('labels', labels);

try {
  execFileSync(browser, [
    /headless[_-]shell/i.test(browser) ? '--headless' : '--headless=new', '--disable-gpu',
    ...(process.platform === 'linux' ? ['--disable-dev-shm-usage', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : [])] : []), '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--window-size=${size.replace('x', ',')}`, '--force-device-scale-factor=1',
    '--virtual-time-budget=15000', '--timeout=30000',
    `--screenshot=${out}`,
    `http://127.0.0.1:${port}/${page ? `${page}.html` : ''}?${query}`,
  ], { stdio: 'ignore', timeout: 60000 });
  console.log(`wrote ${out}`);
} finally {
  server.kill();
  // The dev server writes app.js and admin.js unminified; put the committed (minified) build back.
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs')], { stdio: 'ignore' });
}

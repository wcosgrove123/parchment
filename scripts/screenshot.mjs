#!/usr/bin/env node
// Parchment — screenshot.mjs
// Renders the atlas in headless Chrome/Edge at 1920×1080 and saves a PNG to docs/progress/<date>-<year>.png.
// Starts its own dev server on a spare port, so nothing else needs to be running.
//   node scripts/screenshot.mjs [--year 1450] [--from 1450] [--stage id] [--scope all] [--out path.png] [--size 1920x1080]
// --from opens the Diff view (from → year); --scope all compares every named polygon, not just tracked states.

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : dflt; };
const year = arg('year', '1450');
const from = arg('from', '');
const stage = arg('stage', '');
const scope = arg('scope', '');
const size = arg('size', '1920x1080');
const date = new Date().toISOString().slice(0, 10);
const defaultName = from ? `${date}-diff-${from}-${year}.png` : `${date}-${year}.png`;
const out = resolve(arg('out', join(ROOT, 'docs', 'progress', defaultName)));
const port = 8399;

const browsers = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const browser = browsers.find((p) => existsSync(p));
if (!browser) { console.error('No Chrome or Edge found.'); process.exit(1); }

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
if (from) query.set('from', from);
if (stage) query.set('stage', stage);
if (scope) query.set('scope', scope);

try {
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--window-size=${size.replace('x', ',')}`, '--force-device-scale-factor=1',
    '--virtual-time-budget=15000', '--timeout=30000',
    `--screenshot=${out}`,
    `http://127.0.0.1:${port}/?${query}`,
  ], { stdio: 'ignore', timeout: 60000 });
  console.log(`wrote ${out}`);
} finally {
  server.kill();
}

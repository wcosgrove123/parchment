// Parchment — snapshot test (node --test)
// Starts the dev server, opens the routes tracker in headless Chrome or Edge the way `npm run shot` does, and
// reads the page back: the routes layer must hold the shipped routes with the right colour and dash, the marks
// their labels, and the legend its route rows. Skipped when no browser is installed.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => existsSync(p));

test('the routes layer draws in a shot', { skip: browser ? false : 'no Chrome or Edge installed' }, async () => {
  const port = 8398;
  const server = spawn(process.execPath, [join(ROOT, 'scripts', 'build.mjs'), '--serve'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise((ok, fail) => {
      const onData = (b) => { if (String(b).includes(`:${port}/`)) ok(); };
      server.stdout.on('data', onData);
      server.stderr.on('data', onData);
      server.on('exit', (c) => fail(new Error(`dev server exited early (${c})`)));
      setTimeout(() => fail(new Error('dev server did not start')), 30000);
    });
    const url = `http://127.0.0.1:${port}/?shot=1&year=1450&tracker=routes&records=data/records.csv`;
    const dom = execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--window-size=1920,1080',
      '--virtual-time-budget=15000', '--timeout=30000', '--dump-dom', url], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000 });
    assert.match(dom, /<g class="routes">/);
    assert.match(dom, /<path class="route steel regular dashed voyage" id="route-zheng-he-voyages"/, 'the main voyage: steel, regular width, dashed for approximate');
    assert.match(dom, /marker-end="url\(#route-head-arrow-steel\)"/, 'a voyage has one terminal head');
    assert.match(dom, /<path class="mark steel-circle"/, 'ports of call are drawn');
    assert.match(dom, /<text class="mark-label"[^>]*><tspan class="what">Calicut<\/tspan>/, 'Calicut is labelled');
    assert.match(dom, /<text class="route-label steel"/, 'a route name is set along its line');
    assert.match(dom, /<text x="32" y="11">Voyage<\/text>/, 'the legend has the voyage row');
    assert.doesNotMatch(dom, /<text class="mark-label"[^>]*><tspan class="what">Malindi<\/tspan>/, 'Malindi lies below the stage and gets no label');
  } finally {
    server.kill();
    execFileSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs')], { stdio: 'ignore' });
  }
});

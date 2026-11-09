// Parchment — browser.mjs
// Finds a Chromium-family browser and drives it headless over the DevTools protocol on a pipe: no npm package, no
// debugging port, nothing but node: modules, so it runs the same from a fresh clone on Linux as on the Windows laptop.
//
// Which browser, in order:
//   1. PARCHMENT_BROWSER, a path to chrome, chromium, msedge or Playwright's headless_shell;
//   2. Playwright's Chromium (PLAYWRIGHT_BROWSERS_PATH, else ~/.cache/ms-playwright, ~/Library/Caches/ms-playwright or
//      %LOCALAPPDATA%\ms-playwright), newest first: what Claude's cloud sessions have installed;
//   3. a chromium or google-chrome on the PATH;
//   4. the Windows paths of Chrome and Edge, last.

import { spawn } from 'node:child_process';
import { existsSync, readdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { delimiter, join } from 'node:path';

const WINDOWS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const ON_PATH = ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'chrome'];

const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

// Every Chromium build Playwright has installed, newest revision first; full Chromium before the headless shell.
export function playwrightBrowsers(env = process.env) {
  const roots = [
    env.PLAYWRIGHT_BROWSERS_PATH && env.PLAYWRIGHT_BROWSERS_PATH !== '0' ? env.PLAYWRIGHT_BROWSERS_PATH : null,
    join(homedir(), '.cache', 'ms-playwright'),
    join(homedir(), 'Library', 'Caches', 'ms-playwright'),
    env.LOCALAPPDATA ? join(env.LOCALAPPDATA, 'ms-playwright') : null,
  ].filter(Boolean);
  const inside = {
    chromium: [['chrome-linux64', 'chrome'], ['chrome-linux', 'chrome'], ['chrome-win64', 'chrome.exe'], ['chrome-win', 'chrome.exe'],
      ['chrome-mac-arm64', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'], ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium']],
    chromium_headless_shell: [['chrome-linux', 'headless_shell'], ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
      ['chrome-win', 'headless_shell.exe'], ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
      ['chrome-mac', 'headless_shell'], ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell']],
  };
  const out = [];
  for (const root of roots) {
    let dirs;
    try { dirs = readdirSync(root); } catch { continue; }
    for (const kind of ['chromium', 'chromium_headless_shell']) {
      const revs = dirs.map((d) => d.match(new RegExp(`^${kind}-(\\d+)$`))).filter(Boolean).sort((a, b) => Number(b[1]) - Number(a[1]));
      for (const m of revs) for (const parts of inside[kind]) {
        const p = join(root, m[0], ...parts);
        if (isFile(p)) out.push(p);
      }
    }
  }
  return out;
}

// → { path, from } or null. `from` says which rule found it, for the log.
export function findBrowser(env = process.env) {
  if (env.PARCHMENT_BROWSER) {
    if (isFile(env.PARCHMENT_BROWSER)) return { path: env.PARCHMENT_BROWSER, from: 'PARCHMENT_BROWSER' };
    throw new Error(`PARCHMENT_BROWSER is set to ${env.PARCHMENT_BROWSER}, which is not a file.`);
  }
  const pw = playwrightBrowsers(env)[0];
  if (pw) return { path: pw, from: "Playwright's Chromium" };
  for (const dir of (env.PATH ?? '').split(delimiter).filter(Boolean)) {
    for (const name of ON_PATH) for (const p of [join(dir, name), join(dir, `${name}.exe`)]) if (isFile(p)) return { path: p, from: 'PATH' };
  }
  const win = WINDOWS.find((p) => existsSync(p));
  if (win) return { path: win, from: 'Windows install' };
  return null;
}

export const NO_BROWSER = 'No Chromium-family browser found. Set PARCHMENT_BROWSER to a chrome, chromium or msedge executable, or install one with `npx playwright install chromium`.';

// Launches the browser headless with the DevTools protocol on fds 3 and 4 and returns a small client:
//   page = await browser.newPage({ width, height, scale, origin }); await page.goto(url); await page.eval(expr);
//   await page.screenshot() → PNG Buffer; browser.close().
// `origin`: requests to anywhere else are refused and listed in page.blocked (a render makes no network calls).
export async function launch({ browser = findBrowser(), timeout = 90000 } = {}) {
  if (!browser) throw new Error(NO_BROWSER);
  const exe = browser.path ?? browser;
  const profile = mkdtempSync(join(tmpdir(), 'parchment-browser-'));
  const shell = /headless[_-]shell/i.test(exe);
  const args = [
    shell ? '--headless' : '--headless=new', '--remote-debugging-pipe', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    '--disable-background-networking', '--disable-component-update', '--disable-default-apps', '--disable-sync',
    '--disable-extensions', '--disable-domain-reliability', '--metrics-recording-only', '--no-pings',
    '--disable-features=Translate,OptimizationHints,MediaRouter,DialMediaRouteProvider,AutofillServerCommunication',
    '--font-render-hinting=none', 'about:blank',
  ];
  if (process.platform === 'linux') args.push('--disable-dev-shm-usage', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []));
  const proc = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  let stderr = '';
  proc.stderr.on('data', (b) => { stderr = (stderr + b).slice(-4000); });
  const out = proc.stdio[3], inp = proc.stdio[4];
  let nextId = 1;
  const pending = new Map();
  const listeners = new Set();
  let buf = Buffer.alloc(0);
  inp.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    let i;
    while ((i = buf.indexOf(0)) !== -1) {
      const msg = JSON.parse(buf.subarray(0, i).toString('utf8'));
      buf = buf.subarray(i + 1);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message}${msg.error.data ? ` (${msg.error.data})` : ''}`)); else resolve(msg.result);
      } else for (const l of listeners) l(msg);
    }
  });
  let exited = false;
  const died = new Promise((_, reject) => proc.on('exit', (code) => {
    exited = true;
    const err = new Error(`The browser exited (${code}). ${stderr.trim().split('\n').slice(-3).join(' ')}`);
    for (const { reject: r } of pending.values()) r(err);
    pending.clear();
    reject(err);
  }));
  died.catch(() => {});
  proc.on('error', () => {});
  const send = (method, params = {}, sessionId) => {
    if (exited) return Promise.reject(new Error('The browser is not running.'));
    const id = nextId++;
    let timer;
    const p = new Promise((resolve, reject) => {
      timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, timeout);
      timer.unref?.();
      pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    });
    out.write(`${JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })}\0`);
    return Promise.race([p, died]);
  };
  await send('Browser.getVersion');

  async function newPage({ width = 1920, height = 1080, scale = 1, origin = null } = {}) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (method, params) => send(method, params, sessionId);
    const page = { console: [], errors: [], blocked: [] };
    listeners.add((msg) => {
      if (msg.sessionId !== sessionId) return;
      if (msg.method === 'Runtime.consoleAPICalled') page.console.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ')}`);
      else if (msg.method === 'Runtime.exceptionThrown') page.errors.push(msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text ?? 'error');
      else if (msg.method === 'Fetch.requestPaused') {
        const { requestId, request } = msg.params;
        const local = !origin || request.url.startsWith(origin) || /^(data|blob):/.test(request.url);
        if (local) s('Fetch.continueRequest', { requestId }).catch(() => {});
        else { page.blocked.push(request.url); s('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {}); }
      }
    });
    await s('Runtime.enable');
    await s('Page.enable');
    if (origin) await s('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
    await s('Emulation.setDeviceMetricsOverride', { width: Math.round(width), height: Math.round(height), deviceScaleFactor: scale, mobile: false });
    page.goto = async (url) => {
      const loaded = new Promise((resolve) => { const l = (msg) => { if (msg.sessionId === sessionId && msg.method === 'Page.loadEventFired') { listeners.delete(l); resolve(); } }; listeners.add(l); });
      const r = await s('Page.navigate', { url });
      if (r.errorText) throw new Error(`Could not open ${url}: ${r.errorText}`);
      await loaded;
    };
    // Evaluates an expression in the page (awaiting a promise) and returns its value as JSON.
    page.eval = async (expression, { await: wait = true } = {}) => {
      const r = await s('Runtime.evaluate', { expression, awaitPromise: wait, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      return r.result.value;
    };
    page.screenshot = async () => Buffer.from((await s('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })).data, 'base64');
    page.close = () => send('Target.closeTarget', { targetId }).catch(() => {});
    return page;
  }

  return {
    exe,
    newPage,
    async close() {
      if (!exited) { try { await Promise.race([send('Browser.close'), new Promise((r) => setTimeout(r, 3000))]); } catch { /* already gone */ } }
      if (!exited) proc.kill();
      await new Promise((r) => (exited ? r() : proc.once('exit', r)));
      for (const s of [out, inp, proc.stderr]) s?.destroy?.();
      // (Chrome may hold its profile for a moment after exit; a leftover folder in tmp is harmless)
      for (let k = 0; k < 5; k++) { try { rmSync(profile, { recursive: true, force: true }); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
    },
  };
}

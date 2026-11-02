// Parchment — desktop shell
// The same site, opened in a window of its own instead of a browser tab: no address bar, no tabs, works offline.
// Files are served from this folder over the app's own scheme (parchment://app/), so every relative path in the
// pages works exactly as it does on GitHub Pages. The Google Sheet is still read live when there is a network.
//   npm run app                      open the window
//   npm run app -- --shot out.png    open, draw the first map, save a picture, quit (for checks and progress pictures)
//   npm run app:build                dist/desktop/Parchment.exe, one file to copy to the classroom computer

const { app, BrowserWindow, protocol, net, shell, session } = require('electron');
const { join, extname, normalize, sep } = require('node:path');
const { existsSync, statSync } = require('node:fs');
const { pathToFileURL } = require('node:url');

const ROOT = join(__dirname, '..');
const SCHEME = 'parchment';
const HOST = 'app';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.topojson': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

const argv = process.argv.slice(1);
const arg = (name) => { const i = argv.indexOf(`--${name}`); return i > -1 ? argv[i + 1] : null; };
const shotPath = arg('shot');

protocol.registerSchemesAsPrivileged([{ scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);

// parchment://app/<path> → a file under ROOT. Anything outside ROOT, or missing, is a 404.
function fileFor(url) {
  const u = new URL(url);
  if (u.host !== HOST) return null;
  let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '');
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  const file = normalize(join(ROOT, rel));
  if (!file.startsWith(ROOT + sep)) return null;
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  return file;
}

async function serve(request) {
  const file = fileFor(request.url);
  if (!file) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
  const res = await net.fetch(pathToFileURL(file).toString());
  return new Response(res.body, { status: 200, headers: { 'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' } });
}

// Exports go straight to Downloads, as they do from a browser, with a numbered name if one exists already.
function routeDownloads(ses) {
  ses.on('will-download', (_e, item) => {
    const dir = app.getPath('downloads');
    const name = item.getFilename();
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let path = join(dir, name);
    for (let n = 2; existsSync(path); n++) path = join(dir, `${stem}-${n}${ext}`);
    item.setSavePath(path);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600, height: 900, minWidth: 1024, minHeight: 600,
    title: 'Parchment',
    icon: join(ROOT, 'assets', 'brand', 'parchment.ico'),
    backgroundColor: '#EFE7D2',
    autoHideMenuBar: true,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.removeMenu();
  win.once('ready-to-show', () => { if (shotPath) win.show(); else { win.maximize(); win.show(); } });
  win.on('page-title-updated', (e) => e.preventDefault());

  // F11 full screen, Esc leaves it. The page keeps its own keys (arrows, space, D, E).
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (input.key === 'Escape' && win.isFullScreen()) { win.setFullScreen(false); e.preventDefault(); }
  });

  // Links that leave the atlas (the data credits, the Sheet) open in the person's own browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(`${SCHEME}://${HOST}/`)) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); }
  });

  if (shotPath) {
    win.setSize(1920, 1080);
    win.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        const img = await win.webContents.capturePage();
        require('node:fs').writeFileSync(shotPath, img.toPNG());
        console.log(`wrote ${shotPath}`);
        app.quit();
      }, 6000);
    });
  }

  win.loadURL(`${SCHEME}://${HOST}/index.html`);
  return win;
}

app.whenReady().then(() => {
  protocol.handle(SCHEME, serve);
  routeDownloads(session.defaultSession);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => app.quit());

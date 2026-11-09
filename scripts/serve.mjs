// Parchment — serve.mjs
// A small static server for renders: the repository on 127.0.0.1 at a free port, read-only, nothing written. The
// page's bundle (us.js) is built in memory from src/ with esbuild when it is installed, so a render always shows
// the source as it stands and never rewrites the committed bundles; without esbuild the committed us.js is served.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.topojson': 'application/json; charset=utf-8',
  '.geojson': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
};

// Builds a page bundle (entry: src/us/main.js) in memory. → Buffer, or null when esbuild is not installed.
export async function bundle(root, entry = join('src', 'us', 'main.js')) {
  let esbuild;
  try { esbuild = await import('esbuild'); } catch { return null; }
  const r = await esbuild.build({
    absWorkingDir: root, entryPoints: [join(root, entry)], bundle: true, write: false, format: 'iife',
    target: ['chrome100', 'edge100'], minify: false, legalComments: 'none', logLevel: 'silent',
  });
  return Buffer.from(r.outputFiles[0].contents);
}

// → { origin, close() }. `files`: { '/us.js': Buffer } served in place of the file on disk.
export async function serve(root, { files = {} } = {}) {
  const base = resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (files[path]) { res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); res.end(files[path]); return; }
      const file = normalize(join(base, path === '/' ? 'index.html' : path));
      if (file !== base && !file.startsWith(base + sep)) { res.writeHead(403); res.end(); return; }
      const s = await stat(file).catch(() => null);
      if (!s?.isFile()) { res.writeHead(404); res.end(`not found: ${path}`); return; }
      res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(await readFile(file));
    } catch (err) {
      res.writeHead(500); res.end(String(err?.message ?? err));
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return { origin: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(() => r())) };
}

// Parchment — data loader
// Loads JSON and text either from an inlined <script type="application/json" data-path="…"> block
// (the offline single-file build) or by fetching it relative to the page (GitHub Pages / dev server).

const cache = new Map();

function inlined(path) {
  const sel = `script[type="application/json"][data-path="${CSS.escape(path)}"]`;
  const el = document.querySelector(sel);
  return el ? el.textContent : null;
}

export async function loadText(path) {
  const inl = inlined(path);
  if (inl !== null) return inl;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path} (HTTP ${res.status})`);
  return res.text();
}

export function loadJSON(path) {
  if (!cache.has(path)) cache.set(path, loadText(path).then((t) => JSON.parse(t)));
  return cache.get(path);
}

// URL for an asset (image). The offline build registers data: URLs in window.__PARCHMENT_ASSETS__.
export function assetURL(path) {
  const assets = globalThis.__PARCHMENT_ASSETS__;
  return (assets && assets[path]) || path;
}

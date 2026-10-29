// Parchment — data loader
// Loads JSON and text either from an inlined <script type="application/json" data-path="…"> block
// (the offline single-file build) or by fetching it relative to the page (GitHub Pages / dev server).

const cache = new Map();

// JSON files are inlined as they are; other text (records.csv) is inlined as a JSON string so that nothing an
// editor types, not even "</script>", can end the block early.
function inlined(path) {
  const el = document.querySelector(`script[data-path="${CSS.escape(path)}"]`);
  if (!el) return null;
  return el.dataset.encoding === 'json-string' ? JSON.parse(el.textContent) : el.textContent;
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

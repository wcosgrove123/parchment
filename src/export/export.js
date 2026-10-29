// Parchment — export
// Bakes the current view (map, legend, cartouche, timeline strip) into a PNG or an SVG that stands alone:
// the page styles, the Libre Baskerville fonts and the relief image are embedded, so nothing points back
// at the site. The toolbar lives outside the <svg>, so it is never part of an export.

import { W, H } from '../render/base.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const dataURLs = new Map();

// Fetch a URL once and keep it as a data: URL (fonts, relief).
function toDataURL(url) {
  if (url.startsWith('data:')) return Promise.resolve(url);
  if (!dataURLs.has(url)) {
    dataURLs.set(url, fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`Could not fetch ${url} (HTTP ${res.status})`);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });
    }));
  }
  return dataURLs.get(url);
}

// Rewrite every url(...) in a CSS rule to a data: URL, resolved against the stylesheet it came from.
async function inlineUrls(cssText, base) {
  const parts = [];
  const re = /url\((['"]?)([^'")]+)\1\)/g;
  let last = 0, m;
  while ((m = re.exec(cssText))) {
    parts.push(cssText.slice(last, m.index));
    const abs = new URL(m[2], base).href;
    parts.push(`url("${await toDataURL(abs)}")`);
    last = m.index + m[0].length;
  }
  parts.push(cssText.slice(last));
  return parts.join('');
}

// Every same-origin stylesheet rule on the page, with @font-face sources embedded. Rules that only matter
// to the page (body, toolbar) are harmless inside an SVG document.
async function collectCSS() {
  const out = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    const base = sheet.href || location.href;
    for (const rule of rules) {
      out.push(rule instanceof CSSFontFaceRule ? await inlineUrls(rule.cssText, base) : rule.cssText);
    }
  }
  return out.join('\n');
}

// A self-contained copy of the map as SVG text.
export async function snapshotSVG(svgNode, { transparent = false } = {}) {
  const clone = svgNode.cloneNode(true);
  clone.setAttribute('xmlns', SVG_NS);
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', W);
  clone.setAttribute('height', H);
  clone.removeAttribute('style');

  // A crossfade may be mid-flight: keep only the newest snapshot layer, fully opaque.
  for (const sel of ['g.snapshots > g.snap', 'g.polity-labels > g.snap-labels']) {
    const layers = clone.querySelectorAll(sel);
    layers.forEach((g, i) => { if (i < layers.length - 1) g.remove(); else g.style.opacity = 1; });
  }
  // Transparent background: no sheet, no grain, no vignette. Off by default.
  if (transparent) clone.querySelectorAll('.paper, .paper-overlay, .paper-vignette').forEach((e) => e.remove());

  for (const img of clone.querySelectorAll('image')) {
    const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    if (href) img.setAttribute('href', await toDataURL(new URL(href, location.href).href));
  }

  const style = document.createElementNS(SVG_NS, 'style');
  style.textContent = await collectCSS();
  clone.insertBefore(style, clone.firstChild);

  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The map image could not be rendered for export.'));
    img.src = url;
  });
}

// Render the current view to a PNG blob at the given pixel size (the sheet is 16:9; other sizes letterbox).
export async function renderPNG(svgNode, { width = 1920, height = 1080, transparent = false } = {}) {
  const xml = await snapshotSVG(svgNode, { transparent });
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const s = Math.min(width / W, height / H);
    const dw = W * s, dh = H * s;
    ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('The browser could not encode the PNG.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function renderSVG(svgNode, { transparent = false } = {}) {
  const xml = await snapshotSVG(svgNode, { transparent });
  return new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
}

export function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

// Export filenames: parchment-<stage>-<year>[-<to>][-4k].<ext>. Branded Parchment only.
export function exportName({ stage, year, from = null, size = '', ext }) {
  const span = from != null ? `${from}-${year}` : `${year}`;
  return `parchment-${stage}-${span}${size ? `-${size}` : ''}.${ext}`;
}

// Parchment — relief for any focus
// Fixed stages ship relief pre-rendered in their projection (scripts/relief.mjs). A focus (a region, or an empire
// framed on the fly) is reshaded here instead: every pixel of the frame is carried back through the projection to
// longitude and latitude and read from one plate-carrée world relief (scripts/relief-world.mjs). Rendered at half
// the frame's size (relief is soft; the browser scales it up), once per focus, and kept.

// (one decoded image per URL: the world relief, or a region's sharper one, scripts/relief-region.mjs)
const sources = new Map();
const made = new Map();

function loadSource(url) {
  let source = sources.get(url);
  if (!source) {
    source = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const rgba = ctx.getImageData(0, 0, img.width, img.height).data;
        const g = new Uint8Array(img.width * img.height);
        for (let i = 0; i < g.length; i++) g[i] = rgba[i * 4];
        resolve({ w: img.width, h: img.height, g });
      };
      img.onerror = () => reject(new Error(`Could not load the world relief (${url})`));
      img.src = url;
    });
    sources.set(url, source);
  }
  return source;
}

// key: a name for this framing (the focus id); url: the world relief; projection: fitted to the frame;
// box: [x0, y0, x1, y1] of the frame on the sheet. Resolves to a PNG data URL the size of the frame.
// bounds: { west, south, east, north } when the image is one region's (scripts/relief-region.mjs), not the world's;
// outside it the ground is flat.
// over: finer images of smaller regions ([{ url, bounds }], a battlefield's hillshade), laid over the base one where
// they reach and feathered into it at their edges.
const KEEP = 24; // views kept (a pan-and-zoom session makes one per view; the oldest are made again if asked for)
function sampleBox(src, b, ll) {
  const fx = ((ll[0] - b.west) / (b.east - b.west)) * src.w - 0.5, fy = ((b.north - ll[1]) / (b.north - b.south)) * src.h - 0.5;
  if (!(fx >= 0 && fy >= 0 && fx < src.w - 1 && fy < src.h - 1)) return null;
  const xa = Math.floor(fx), ya = Math.floor(fy), tx = fx - xa, ty = fy - ya, g = src.g, w = src.w;
  const v = (g[ya * w + xa] * (1 - tx) + g[ya * w + xa + 1] * tx) * (1 - ty) + (g[(ya + 1) * w + xa] * (1 - tx) + g[(ya + 1) * w + xa + 1] * tx) * ty;
  // how far inside the image, 0 at its edge to 1 a tenth of the way in
  const edge = Math.min(fx / src.w, 1 - fx / src.w, fy / src.h, 1 - fy / src.h);
  return { v, weight: Math.max(0, Math.min(1, edge / 0.1)) };
}
export async function reliefFor(key, url, projection, [x0, y0, x1, y1], { scale = 0.5, bounds = null, over = [], trust = false } = {}) {
  if (made.has(key)) return made.get(key);
  const job = Promise.all([loadSource(url), ...over.map((o) => loadSource(o.url).catch(() => null))]).then(([{ w, h, g }, ...tops]) => {
    const fine = over.map((o, i) => (tops[i] ? { ...tops[i], b: o.bounds } : null)).filter(Boolean);
    const ow = Math.round((x1 - x0) * scale), oh = Math.round((y1 - y0) * scale);
    const canvas = document.createElement('canvas');
    canvas.width = ow; canvas.height = oh;
    const ctx = canvas.getContext('2d');
    const out = ctx.createImageData(ow, oh);
    const d = out.data;
    for (let py = 0; py < oh; py++) {
      const sy = y0 + (py + 0.5) / scale;
      for (let px = 0; px < ow; px++) {
        const sx = x0 + (px + 0.5) / scale;
        let v = 255;
        const ll = projection.invert([sx, sy]);
        if (ll && Number.isFinite(ll[0]) && Number.isFinite(ll[1]) && Math.abs(ll[1]) <= 90) {
          // (trust: a free view lies well inside its projection, every pixel of it a real place; no need to check the way back)
          const back = trust ? [sx, sy] : projection(ll);
          if (bounds && back && Math.abs(back[0] - sx) < 1 && Math.abs(back[1] - sy) < 1) {
            // a region's image: bilinear inside its box, no wrapping
            const fx = ((ll[0] - bounds.west) / (bounds.east - bounds.west)) * w - 0.5, fy = ((bounds.north - ll[1]) / (bounds.north - bounds.south)) * h - 0.5;
            if (fx >= 0 && fy >= 0 && fx < w - 1 && fy < h - 1) {
              const xa = Math.floor(fx), ya = Math.floor(fy), tx = fx - xa, ty = fy - ya;
              v = (g[ya * w + xa] * (1 - tx) + g[ya * w + xa + 1] * tx) * (1 - ty) + (g[(ya + 1) * w + xa] * (1 - tx) + g[(ya + 1) * w + xa + 1] * tx) * ty;
            }
          } else if (back && Math.abs(back[0] - sx) < 1 && Math.abs(back[1] - sy) < 1) {
            // bilinear, wrapping in longitude
            const fx = ((((ll[0] + 180) / 360) * w) % w + w) % w - 0.5, fy = ((90 - ll[1]) / 180) * h - 0.5;
            const xa = Math.floor(fx), ya = Math.max(0, Math.min(h - 1, Math.floor(fy)));
            const tx = fx - xa, ty = Math.max(0, Math.min(1, fy - ya));
            const xl = (xa + w) % w, xr = (xa + 1) % w, yb = Math.min(h - 1, ya + 1);
            v = (g[ya * w + xl] * (1 - tx) + g[ya * w + xr] * tx) * (1 - ty) + (g[yb * w + xl] * (1 - tx) + g[yb * w + xr] * tx) * ty;
          }
          if (fine.length && back && Math.abs(back[0] - sx) < 1 && Math.abs(back[1] - sy) < 1) {
            for (const t of fine) {
              if (ll[0] <= t.b.west || ll[0] >= t.b.east || ll[1] <= t.b.south || ll[1] >= t.b.north) continue;
              const s = sampleBox(t, t.b, ll);
              if (s) { v = v * (1 - s.weight) + s.v * s.weight; break; }
            }
          }
        }
        const k = (py * ow + px) * 4;
        d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    return canvas.toDataURL('image/png');
  });
  made.set(key, job);
  while (made.size > KEEP) made.delete(made.keys().next().value);
  return job;
}

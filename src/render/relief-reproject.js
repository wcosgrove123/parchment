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
export async function reliefFor(key, url, projection, [x0, y0, x1, y1], { scale = 0.5, bounds = null } = {}) {
  if (made.has(key)) return made.get(key);
  const job = loadSource(url).then(({ w, h, g }) => {
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
          const back = projection(ll);
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
        }
        const k = (py * ow + px) * 4;
        d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    return canvas.toDataURL('image/png');
  });
  made.set(key, job);
  return job;
}

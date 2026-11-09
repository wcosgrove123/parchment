// Parchment — North America page: lesson maps. A lesson map is the page with a frame (a focus from src/focuses.json,
// or a raw box of longitude and latitude), a sheet sized for a slide, a highlight, and things to point at (rivers,
// places, routes). Every option is a URL parameter, so an order form (scripts/map.mjs) and an address are the same
// map. Pure functions, no DOM: the tests and the command-line tools load this alone.

import { chooseProjection, normBox } from '../render/focus.js';

export const SHEET = { w: 1920, h: 1080 };
export const SIZE_MIN = 800, SIZE_MAX = 3840;

// "1600x1550" → { width, height } in pixels; null when malformed or outside 800–3840 wide.
export function parseSize(s) {
  const m = /^\s*(\d{3,4})\s*[x×]\s*(\d{3,4})\s*$/i.exec(String(s ?? ''));
  if (!m) return null;
  const width = Number(m[1]), height = Number(m[2]);
  if (width < SIZE_MIN || width > SIZE_MAX || height < 400 || height > 4320) return null;
  return { width, height };
}

// The sheet a picture of `size` pixels is laid out on, in sheet units. Up to 1920×1080 one unit is one pixel: the
// legend, cartouche and strip keep their sizes and are placed for the picture's own shape (never a 1920×1080 sheet
// scaled down). A larger picture keeps the type of a 1920×1080 sheet and draws it finer: 3840×2160 is the 1920×1080
// sheet at twice the pixels, as the page's own 4K export is. An order may give its own scale (1.5: type half again
// as large on the slide).
export function sheetFor(size = null, scale = null) {
  const px = size ?? { width: SHEET.w, height: SHEET.h };
  const s = Number(scale) > 0 ? Math.min(4, Math.max(0.5, Number(scale))) : Math.max(1, Math.min(px.width / SHEET.w, px.height / SHEET.h));
  return { w: Math.round(px.width / s), h: Math.round(px.height / s), scale: s, px };
}
export const isDefaultSheet = (sheet) => !sheet || (sheet.w === SHEET.w && sheet.h === SHEET.h);

// A frame: a focus id from src/focuses.json, or "W,S,E,N" in degrees (west may be greater than east across the
// antimeridian). → { id, title, box, focus, raw } or null when the value names nothing.
export function resolveFrame(value, table) {
  const v = String(value ?? '').trim();
  if (!v) return null;
  const nums = v.split(',').map((x) => Number(x.trim()));
  if (nums.length === 4 && nums.every(Number.isFinite)) {
    const [west, south, east, north] = nums;
    if (!(south < north) || Math.abs(south) > 85 || Math.abs(north) > 85 || Math.abs(west) > 360 || Math.abs(east) > 360) return null;
    return { id: null, title: null, box: normBox({ west, south, east, north }), focus: null, raw: true };
  }
  const f = (table?.focuses ?? []).find((x) => x.id === v);
  if (!f) return null;
  return { id: f.id, title: f.title, box: normBox(f.extent), focus: f, raw: false };
}

// The frame's projection. 'auto' (the default): the focus's own, else the automatic choice of src/render/focus.js
// (projection follows the focus, docs/LAYERS.md): Lambert azimuthal centred on a compact frame such as Texas, an
// equal-area conic for a wide band. 'page': the page's own Albers (USGS parallels, centred 96°W), only re-fitted.
export function frameProjection(frame, mode = 'auto') {
  if (mode === 'page') return { projection: 'albers', chosenBy: 'page' };
  const f = frame?.focus;
  if (f?.projection) return { projection: f.projection, rotate: f.rotate, parallels: f.parallels, chosenBy: 'focus' };
  return { ...chooseProjection(frame.box), chosenBy: 'auto' };
}

// A comma list from an address or an order: "Nueces, Rio Grande" → ['Nueces', 'Rio Grande'].
export const parseList = (s) => (Array.isArray(s) ? s : String(s ?? '').split(',')).map((x) => String(x).trim()).filter(Boolean);

// Ids are compared as slugs: case, accents and punctuation do not matter ("Coahuila y Tejas" = coahuila-y-tejas).
export const slug = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/['’ʻ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Every name a polygon answers to in a highlight: its power (mexico, us, britain) and that power's labels
// (united-states, great-britain), its own names (coahuila-y-tejas, texas-republic), its source ids (ohm:2841297,
// nb:tx_republic) and its Wikidata item (q949898). `twins`: names of OpenHistoricalMap's copies of a Newberry
// polygon (the Republic of Texas is Newberry's tx_republic), so either name finds it.
export function itemKeys(it, { power = null, powers = null, twins = null } = {}) {
  const p = it.p ?? {};
  const keys = new Set();
  const add = (s) => { const k = slug(s); if (k) keys.add(k); };
  const pw = power ?? it.cat ?? p.power ?? null;
  if (pw) {
    add(pw);
    const c = powers?.categories?.[pw];
    if (c?.label) add(c.label);
    for (const [, t] of c?.labels ?? []) add(t);
    if (pw === 'us') { add('united-states'); add('usa'); add('united-states-of-america'); }
  }
  if (it.src === 'ohm') {
    add(`ohm:${p.rid}`); add(String(p.rid)); add(p.name); add(p.local); add(p.wd);
  } else if (it.src === 'newberry') {
    add(`nb:${p.id}`); add(p.id); add(p.name); add(p.full);
    for (const n of twins?.get(p.id) ?? []) add(n);
  } else if (it.src === 'nbx' || it.src === 'usmx') {
    add('disputes'); add('disputed'); add(p.name); add(p.id);
  } else if (it.src === 'hb') {
    add(p.name); add('native');
  } else if (p.name) add(p.name);
  return keys;
}

// A highlight: the ids an order names, and which of them found something. `has(keys)` → the id it matched, or null.
export function makeHighlight(ids) {
  const want = new Map(parseList(ids).map((id) => [slug(id), id]));
  const found = new Map();
  return {
    size: want.size,
    ids: [...want.values()],
    // (every id that names it counts as found: "mexico" and "coahuila-y-tejas" both light Coahuila y Tejas)
    has(keys) {
      let first = null;
      for (const k of keys) if (want.has(k)) { found.set(k, (found.get(k) ?? 0) + 1); first ??= want.get(k); }
      return first;
    },
    // ids that lit nothing on the date shown (for the packing slip's warnings)
    unmatched: () => [...want].filter(([k]) => !found.has(k)).map(([, id]) => id),
    reset() { found.clear(); },
  };
}

// The sides of a dispute, for the legend ("Claimed by Texas and Mexico"): two names, in the order given, without
// repeats; more than two are listed with commas.
export function claimLabel(parties) {
  const ps = [...new Set(parties.filter(Boolean))];
  if (!ps.length) return null;
  if (ps.length === 1) return `Claimed by ${ps[0]}`;
  return `Claimed by ${ps.slice(0, -1).join(', ')} and ${ps.at(-1)}`;
}

// An order (the JSON spec of scripts/map.mjs) as an address on us.html, and back. Every field has a parameter.
export const ORDER_PARAMS = ['date', 'year', 'from', 'tracker', 'frame', 'highlight', 'rivers', 'places', 'routes', 'title', 'size', 'scale', 'projection', 'records'];
export function orderToQuery(order) {
  const q = new URLSearchParams();
  const a = order.annotate ?? {};
  const put = (k, v) => { if (v != null && v !== '' && !(Array.isArray(v) && !v.length)) q.set(k, Array.isArray(v) ? v.join(',') : String(v)); };
  if (order.date && /-/.test(String(order.date))) put('date', order.date); else put('year', order.date ?? order.year);
  put('from', order.from);
  put('tracker', order.tracker);
  put('frame', Array.isArray(order.frame) ? order.frame.join(',') : order.frame);
  put('highlight', order.highlight);
  put('rivers', a.rivers ?? order.rivers);
  put('places', a.places ?? order.places);
  put('routes', a.routes ?? order.routes);
  put('title', order.title);
  put('size', order.size);
  put('scale', order.scale);
  put('projection', order.projection);
  put('records', order.records);
  return q;
}
export function queryToOrder(q) {
  const get = (k) => q.get(k) ?? undefined;
  const order = { page: 'us' };
  if (get('date') ?? get('year')) order.date = get('date') ?? get('year');
  for (const k of ['from', 'tracker', 'title', 'size', 'projection', 'records']) if (get(k)) order[k] = get(k);
  if (get('scale')) order.scale = Number(get('scale'));
  if (get('frame')) order.frame = get('frame');
  if (get('highlight')) order.highlight = parseList(get('highlight'));
  const annotate = {};
  for (const k of ['rivers', 'places', 'routes']) if (get(k)) annotate[k] = parseList(get(k));
  if (Object.keys(annotate).length) order.annotate = annotate;
  return order;
}

#!/usr/bin/env node
// Parchment — lookup.mjs: "what's here?" for the North America page, from the same data it draws.
//   npm run describe -- --page us --date 1836-06-01 --frame texas [--tracker nations] [--json]
//       every polygon alive in the frame that day: names, ids, dates, holder, certainty, area in the frame, source;
//       then the rivers in the frame and the records (places, routes) of the record table alive that day
//   npm run changes -- --page us --from 1821 --to 1848 --frame texas [--json]
//       every border change inside the frame between the two dates, in order, each with its source
//       ("1835-12-15: Coahuila y Tejas split into Coahuila and Texas (Tejas). OpenHistoricalMap: State gets split")
//   npm run search -- Nueces [--json]
//       anything on the page by name: polygons, disputes, rivers, records, gazetteer places, frames
// A frame is a focus id from src/focuses.json or a box W,S,E,N; without one, the whole North America sheet.
// No browser and no network: a fresh clone answers these from its own files.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoBounds } from 'd3';
import { feature } from 'topojson-client';
import polygonClipping from 'polygon-clipping';
import { prepareData, aliveNB, aliveOHM, aliveNative, powerAt, nbName, cleanLabel, US_FROM } from '../src/us/model.js';
import { prepareDisputes, aliveDisputes, prepareUSMX, aliveUSMX, applyOHMCuts } from '../src/us/disputes.js';
import { parseDate, isoDate, longDate, nextDay, OPEN } from '../src/us/dates.js';
import { resolveFrame, slug } from '../src/us/frames.js';
import { validateRecords, resolveRecords } from '../src/data/records.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const KM2 = 6371 * 6371;
const iso = (d) => (d == null ? null : d >= OPEN ? 'present' : isoDate(d));

// ---------------------------------------------------------------- data, loaded once
let cache = null;
export function loadAll() {
  if (cache) return cache;
  const stage = json('src/stages/north-america.json');
  const powers = json('src/us/powers.json');
  const data = prepareData({ nbTopo: json('data/us/newberry.topojson'), ohmTopo: json('data/us/ohm.topojson'), cesTopo: json('data/us/cessions.topojson'), natTopo: json('data/us/native.topojson') });
  data.nbx = prepareDisputes(json('data/us/nb-disputes.json'));
  data.usmx = existsSync(join(ROOT, 'data/us/usmx-disputes.json')) ? prepareUSMX(json('data/us/usmx-disputes.json')) : [];
  if (existsSync(join(ROOT, 'data/us/ohm-cuts.json'))) applyOHMCuts(data, json('data/us/ohm-cuts.json'));
  const tags = existsSync(join(ROOT, 'data/us/ohm-sources.json')) ? json('data/us/ohm-sources.json').relations : {};
  const rtopo = existsSync(join(ROOT, 'data/base/derived/rivers-na.topojson')) ? json('data/base/derived/rivers-na.topojson') : null;
  const rivers = rtopo ? feature(rtopo, rtopo.objects.rivers).features : [];
  const focuses = json('src/focuses.json');
  cache = { stage, powers, data, tags, rivers, focuses };
  return cache;
}
function loadRecords(file = 'data/records.csv') {
  const vocab = json('data/vocab.json');
  const gaz = existsSync(join(ROOT, 'data/gazetteer.json')) ? json('data/gazetteer.json') : {};
  const text = readFileSync(join(ROOT, file), 'utf8');
  const { records } = validateRecords(text, vocab);
  return { records: resolveRecords(records, gaz).records, gazetteer: gaz };
}

// ---------------------------------------------------------------- the frame
function frameOf(frame) {
  const { focuses, stage } = loadAll();
  if (!frame) return { id: null, title: 'North America (the whole sheet)', box: stage.extent };
  const f = resolveFrame(frame, focuses);
  if (!f) throw new Error(`frame "${frame}" is neither a focus in src/focuses.json nor a box W,S,E,N`);
  return { id: f.id, title: f.title ?? `the box ${frame}`, box: f.box };
}
const rings = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
const boxRing = ({ west, south, east, north }) => [[[[west, south], [east, south], [east, north], [west, north], [west, south]]]];
const forD3 = (mp) => mp.map((poly) => poly.map((r) => [...r].reverse()));
// km² of a polygon inside the frame's box (planar clip in degrees, then measured on the sphere); 0 when outside.
const insideCache = new Map();
function km2Inside(it, box) {
  const key = `${box.west},${box.south},${box.east},${box.north}`;
  let m = insideCache.get(key);
  if (!m) { m = new WeakMap(); insideCache.set(key, m); }
  if (m.has(it)) return m.get(it);
  let km2 = 0;
  const [[w, s], [e, n]] = geoBounds(it.f);
  const crosses = e < w; // across the antimeridian: test both halves the cheap way
  if (crosses || (e >= box.west && w <= box.east && n >= box.south && s <= box.north)) {
    try {
      const inter = polygonClipping.intersection(rings(it.f.geometry), boxRing(box));
      if (inter.length) { const a = geoArea({ type: 'MultiPolygon', coordinates: forD3(inter) }) * KM2; km2 = a > 2 * Math.PI * KM2 ? 0 : a; }
    } catch { km2 = 0; }
  }
  m.set(it, km2);
  return km2;
}

// ---------------------------------------------------------------- one polygon, described
function holder(it, date) {
  const { powers } = loadAll();
  const pw = it.src === 'ohm' ? powerAt(it.p, date) : it.src === 'newberry' ? it.p.power : it.src === 'hb' ? 'native' : null;
  const c = pw ? powers.categories[pw] : null;
  let label = c?.label ?? null;
  for (const [from, t] of c?.labels ?? []) if (date >= from) label = t;
  return { power: pw, label };
}
function sourceOf(it) {
  const { tags } = loadAll();
  const p = it.p;
  if (it.src === 'newberry') return { dataset: 'The Newberry Library, Atlas of Historical County Boundaries', url: 'https://digital.newberry.org/ahcb/', record: `${p.id} v${p.v}`, change: p.change ?? null, authority: p.cite ?? null };
  if (it.src === 'ohm' && p.lvl === 'x') return { dataset: 'computed: overlap of two OpenHistoricalMap polygons', from: [p.a, p.b].map((r) => `https://www.openhistoricalmap.org/relation/${r}`) };
  if (it.src === 'ohm') { const t = tags[p.rid] ?? {}; return { dataset: 'OpenHistoricalMap (CC0)', url: `https://www.openhistoricalmap.org/relation/${p.rid}`, wikidata: p.wd ?? null, start_event: t.se ?? null, end_event: t.ee ?? null, cites: [t.srcName, t.cite, t.src, t.nbCite].filter(Boolean) }; }
  if (it.src === 'nbx') return { dataset: 'computed: overlap of two Newberry polygons', from: [`${p.a} v${p.av}`, `${p.b} v${p.bv}`], ended: p.ended?.text ?? null };
  if (it.src === 'usmx') return { dataset: 'computed: overlap of a Newberry U.S. polygon and an OpenHistoricalMap Mexican polygon', from: [`newberry ${p.a} v${p.av}`, `https://www.openhistoricalmap.org/relation/${p.b}`], ended: (p.ended ?? []).map((x) => `${iso(x.day)}: ${x.text}${x.record ? ` (Newberry: ${x.record.text})` : ''}`) };
  if (it.src === 'hb') return { dataset: `historical-basemaps world_${p.y} (GPL-3.0)`, url: 'https://github.com/aourednik/historical-basemaps' };
  return { dataset: it.src };
}
function describeItem(it, date, box) {
  const p = it.p;
  const h = holder(it, date);
  const name = it.src === 'newberry' ? nbName(p) : it.src === 'nbx' || it.src === 'usmx' ? `Claimed by both ${p.an} and ${p.bn}` : p.name;
  const ids = it.src === 'newberry' ? { newberry: p.id, version: p.v } : it.src === 'ohm' ? { ohm: p.rid, wikidata: p.wd ?? null } : it.src === 'usmx' ? { computed: p.id } : it.src === 'nbx' ? { newberry: [p.a, p.b] } : {};
  return {
    layer: { newberry: 'Newberry (U.S.)', ohm: p.lvl === 'x' ? 'overlap (computed)' : `OpenHistoricalMap (level ${p.lvl})`, nbx: 'dispute (computed, Newberry)', usmx: 'dispute (computed, U.S.–Mexico)', hb: 'Native homeland (historical-basemaps)' }[it.src] ?? it.src,
    name: cleanLabel(name) ?? name, local: p.local ?? null, ids,
    start: iso(p.s), end: iso(p.e), end_is: it.src === 'ohm' || it.src === 'hb' ? 'the day it ceased' : 'last day in force',
    holder: h.label, certainty: it.src === 'hb' ? 'approximate homeland (sphere)' : it.src === 'ohm' && date < US_FROM ? 'approximate' : 'documented',
    km2_in_frame: Math.round(km2Inside(it, box)), source: sourceOf(it),
  };
}

// ---------------------------------------------------------------- describe
export function describe({ date, frame = null, tracker = 'nations', records = 'data/records.csv' } = {}) {
  const d = typeof date === 'number' ? date : parseDate(String(date));
  if (!d) throw new Error(`date "${date}" is not a year (1836) or a day (1836-06-01)`);
  const { data, rivers } = loadAll();
  const fr = frameOf(frame);
  const alive = [...aliveNB(data, d), ...aliveOHM(data, d), ...aliveDisputes(data, d), ...aliveUSMX(data, d), ...(tracker === 'cessions' ? [] : aliveNative(data, d))];
  const polygons = alive.map((it) => ({ it, km2: km2Inside(it, fr.box) })).filter((x) => x.km2 >= 100)
    .sort((a, b) => b.km2 - a.km2).map((x) => describeItem(x.it, d, fr.box));
  // rivers in the frame, by name (what an order can ask for), the larger first
  const named = new Map();
  for (const f of rivers) {
    const n = f.properties.name;
    if (!n) continue;
    const [[w, s], [e, nn]] = geoBounds(f);
    if (e < fr.box.west || w > fr.box.east || nn < fr.box.south || s > fr.box.north) continue;
    named.set(n, Math.min(named.get(n) ?? 99, f.properties.scalerank));
  }
  const riverList = [...named].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).map(([name, rank]) => ({ name, rank }));
  // records of the table alive that day inside the frame
  let recs = [];
  try {
    const { records: rs } = loadRecords(records);
    const inBox = (lon, lat) => lon >= fr.box.west && lon <= fr.box.east && lat >= fr.box.south && lat <= fr.box.north;
    const y = Math.trunc(d / 10000);
    recs = rs.filter((r) => r.start <= y && y <= r.end && (r.kind === 'point' ? r.lon != null && inBox(r.lon, r.lat) : r.coords?.some(([lon, lat]) => inBox(lon, lat))))
      .map((r) => ({ id: r.id, kind: r.kind, label: r.label, where: r.where, start: r.startWhen && `${r.startWhen.year}`, end: r.endWhen && `${r.endWhen.year}`, source: r.source }));
  } catch (err) { recs = [{ error: err.message }]; }
  return { page: 'us', date: isoDate(d), date_text: longDate(d), frame: fr, tracker, polygons, rivers: riverList, records: { file: records, alive: recs } };
}

// ---------------------------------------------------------------- changes
export function changes({ from, to, frame = null } = {}) {
  const a = parseDate(String(from)), b = parseDate(String(to));
  if (!a || !b) throw new Error('changes needs --from and --to (a year or a day each)');
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  const { data, tags } = loadAll();
  const fr = frameOf(frame);
  const within = (x) => x != null && x > lo && x <= hi;
  const events = [];
  // A dispute is computed in pieces, one per pair of polygon versions: it begins and ends once, on its own span.
  for (const it of [...data.nbx, ...data.usmx]) {
    const p = it.p;
    if (km2Inside(it, fr.box) < 100) continue;
    const name = `land claimed by both ${p.an} and ${p.bn}`;
    if (p.s === p.ds && within(p.ds)) events.push({ day: p.ds, kind: 'dispute', it, name: `${name} (from this day)`, why: null });
    if (p.e === p.de && within(nextDay(p.de))) {
      const why = Array.isArray(p.ended) ? p.ended.map((x) => x.text).join('; ') : p.ended?.text ?? null;
      events.push({ day: nextDay(p.de), kind: 'dispute', it, name: `${name} (ends)`, why, cite: Array.isArray(p.ended) ? null : p.ended?.cite ?? null });
    }
  }
  const pool = [...data.nb, ...data.ohm.filter((it) => it.p.lvl !== 'x')];
  for (const it of pool) {
    const p = it.p;
    const beginDay = p.s, endDay = it.src === 'ohm' ? p.e : (p.e >= OPEN ? null : nextDay(p.e));
    if (!within(beginDay) && !within(endDay)) continue;
    if (km2Inside(it, fr.box) < 100) continue;
    if (it.src === 'ohm' && p.us && beginDay >= US_FROM) continue; // OHM's copy of a Newberry polygon: Newberry speaks for it
    const name = cleanLabel(it.src === 'newberry' ? nbName(p) : p.name);
    const t = it.src === 'ohm' ? tags[p.rid] ?? {} : {};
    if (within(beginDay)) events.push({ day: beginDay, kind: 'began', it, name, why: it.src === 'newberry' ? p.change : it.src === 'ohm' ? t.se : null, cite: it.src === 'newberry' ? p.cite : null });
    if (within(endDay)) {
      const next = it.src === 'newberry' ? data.nb.find((x) => x.p.id === p.id && x.p.v === p.v + 1) : null;
      events.push({ day: endDay, kind: 'ended', it, name, why: it.src === 'ohm' ? t.ee : next ? next.p.change : null, cite: next?.p.cite ?? null });
    }
  }
  // holders that changed during the span (who holds an OHM polygon: src/us/powers.json, authored)
  for (const it of data.ohm) {
    if (it.p.lvl !== 2 || km2Inside(it, fr.box) < 100) continue;
    let prev = null;
    for (const [day, pw] of it.p.pw ?? []) {
      if (within(day) && prev && prev !== pw && day > it.p.s) events.push({ day, kind: 'holder', it, name: cleanLabel(it.p.name), why: `held by ${pw} (was ${prev})`, cite: 'src/us/powers.json (authored attribute)' });
      prev = pw;
    }
  }
  // one line per day: what ended, what began, and the record's own words for why
  const days = new Map();
  for (const e of events) { if (!days.has(e.day)) days.set(e.day, []); days.get(e.day).push(e); }
  const out = [];
  for (const [day, list0] of [...days].sort((x, y) => x[0] - y[0])) {
    // A unit that ends and begins the same day under the same name is a redrawn border, not a new unit; it counts
    // only when the border moved inside the frame (Mexico's gaining Central America in 1822 is not a Texas change).
    const names = (xs) => [...new Set(xs.map((e) => e.name))];
    const sameAll = names(list0.filter((e) => e.kind === 'ended')).filter((n) => names(list0.filter((e) => e.kind === 'began')).includes(n));
    const unmoved = new Set(sameAll.filter((n) => !movedInFrame(list0.filter((e) => e.name === n && e.kind === 'ended').map((e) => e.it), list0.filter((e) => e.name === n && e.kind === 'began').map((e) => e.it), fr.box)));
    const list = list0.filter((e) => !unmoved.has(e.name) || e.kind === 'dispute' || e.kind === 'holder');
    if (!list.length) continue;
    const ended = list.filter((e) => e.kind === 'ended'), began = list.filter((e) => e.kind === 'began'), held = list.filter((e) => e.kind === 'holder'), disputed = list.filter((e) => e.kind === 'dispute');
    const same = names(ended).filter((n) => names(began).includes(n));
    const goneN = names(ended).filter((n) => !same.includes(n)), newN = names(began).filter((n) => !same.includes(n));
    let text;
    if (goneN.length === 1 && newN.length >= 1) text = `${goneN[0]} became ${list2(newN)}`;
    else if (goneN.length > 1 && newN.length === 1) text = `${list2(goneN)} became ${newN[0]}`;
    else text = [newN.length ? `began: ${list2(newN)}` : null, goneN.length ? `ended: ${list2(goneN)}` : null].filter(Boolean).join('; ');
    if (same.length) text += `${text ? '; ' : ''}new borders inside the frame: ${list2(same)}`;
    for (const h of held) text += `${text ? '; ' : ''}${h.name} ${h.why}`;
    for (const x of disputed) text += `${text ? '; ' : ''}${x.name}`;
    const whys = [...new Set(list.map((e) => e.why).filter(Boolean))];
    out.push({
      day: isoDate(day), text, why: whys,
      records: list.map((e) => ({ kind: e.kind, name: e.name, start: iso(e.it.p.s), end: iso(e.it.p.e), source: sourceOf(e.it), cite: e.cite ?? null })),
    });
  }
  return { page: 'us', from: isoDate(lo), to: isoDate(hi), frame: fr, changes: out };
}
const list2 = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
// Did a redrawn unit's border move inside the frame? The two outlines, each clipped to the box, differ by 500 km² or more.
function movedInFrame(olds, news, box) {
  const clip = (its) => {
    let acc = [];
    for (const it of its) { try { acc = acc.length ? polygonClipping.union(acc, polygonClipping.intersection(rings(it.f.geometry), boxRing(box))) : polygonClipping.intersection(rings(it.f.geometry), boxRing(box)); } catch { /* skip */ } }
    return acc;
  };
  try {
    const x = polygonClipping.xor(clip(olds), clip(news));
    if (!x.length) return false;
    const a = geoArea({ type: 'MultiPolygon', coordinates: forD3(x) }) * KM2;
    return a < 2 * Math.PI * KM2 && a >= 500;
  } catch { return true; }
}

// ---------------------------------------------------------------- search
export function search(term, { records = 'data/records.csv' } = {}) {
  const k = slug(term);
  if (!k) throw new Error('search needs a word');
  const { data, tags, rivers, focuses } = loadAll();
  const hit = (...names) => names.some((n) => n && slug(n).includes(k));
  const out = [];
  const seenNB = new Set();
  for (const it of data.nb) if (hit(it.p.name, it.p.full, it.p.abbr, it.p.id)) out.push({ layer: 'Newberry (U.S.)', name: nbName(it.p), ids: { newberry: it.p.id, version: it.p.v }, start: iso(it.p.s), end: iso(it.p.e), source: 'https://digital.newberry.org/ahcb/' });
  for (const it of data.ohm) {
    const t = tags[it.p.rid] ?? {};
    if (it.p.lvl !== 'x' && hit(it.p.name, it.p.local, t.en)) out.push({ layer: `OpenHistoricalMap (level ${it.p.lvl})${it.p.us ? ', a copy of a Newberry polygon (hidden from 1783)' : ''}`, name: it.p.name, local: it.p.local ?? null, ids: { ohm: it.p.rid, wikidata: it.p.wd ?? null }, start: iso(it.p.s), end: iso(it.p.e), source: `https://www.openhistoricalmap.org/relation/${it.p.rid}` });
  }
  for (const it of [...data.nbx, ...data.usmx]) if (hit(it.p.an, it.p.bn)) out.push({ layer: 'dispute (computed)', name: `Claimed by both ${it.p.an} and ${it.p.bn}`, ids: { computed: it.p.id ?? `${it.p.a}|${it.p.b}` }, start: iso(it.p.s), end: iso(it.p.e) });
  for (const it of data.nat) if (hit(it.p.name)) out.push({ layer: `Native homeland (historical-basemaps ${it.p.y})`, name: it.p.name, start: iso(it.p.s), end: iso(it.p.e) });
  const rv = new Map();
  for (const f of rivers) if (hit(f.properties.name, f.properties.name_en, f.properties.name_alt)) {
    const n = f.properties.name; const b = geoBounds(f);
    const x = rv.get(n) ?? { layer: 'river (Natural Earth 1:10m)', name: n, pieces: 0, rank: 99, box: null };
    x.pieces++; x.rank = Math.min(x.rank, f.properties.scalerank);
    x.box = x.box ? [[Math.min(x.box[0][0], b[0][0]), Math.min(x.box[0][1], b[0][1])], [Math.max(x.box[1][0], b[1][0]), Math.max(x.box[1][1], b[1][1])]] : b;
    rv.set(n, x);
  }
  out.push(...[...rv.values()].map((x) => ({ ...x, box: x.box.map((p) => p.map((v) => Math.round(v * 100) / 100)) })));
  try {
    const { records: rs, gazetteer } = loadRecords(records);
    for (const r of rs) if (hit(r.label, r.id)) out.push({ layer: `record (${records})`, name: r.label, ids: { record: r.id, where: r.where }, kind: r.kind, start: r.startWhen && `${r.startWhen.year}`, end: r.endWhen && `${r.endWhen.year}`, source: r.source });
    for (const [q, g] of Object.entries(gazetteer)) if (hit(g.label)) out.push({ layer: 'gazetteer (Wikidata coordinate)', name: g.label, ids: { wikidata: q }, at: [g.lon, g.lat] });
  } catch { /* no table */ }
  for (const f of focuses.focuses) if (hit(f.id, f.title)) out.push({ layer: 'frame (src/focuses.json)', name: f.title, ids: { frame: f.id }, box: f.extent, page: f.page ?? null });
  return { term, found: out.length, results: out };
}

// ---------------------------------------------------------------- frames (for the MCP server)
export function listFrames() {
  const { focuses } = loadAll();
  return focuses.focuses.filter((f) => f.page === 'us.html').map((f) => ({ id: f.id, title: f.title, box: f.extent, level: f.level, parents: f.parents }));
}

// ---------------------------------------------------------------- the command
function printDescribe(r) {
  console.log(`${r.date_text}, framed on ${r.frame.title} (${Object.values(r.frame.box).join(', ')})`);
  for (const p of r.polygons) console.log(`  ${p.name}${p.local ? ` (${p.local})` : ''} · ${p.layer} · ${p.start} → ${p.end} · ${p.holder ?? 'no holder assigned'} · ${p.km2_in_frame.toLocaleString('en-US')} km² in frame · ${p.source.url ?? p.source.dataset}${p.source.start_event ? ` · began: ${p.source.start_event}` : ''}`);
  console.log(`rivers in the frame: ${r.rivers.map((x) => x.name).join(', ')}`);
  console.log(`records alive that day (${r.records.file}): ${r.records.alive.map((x) => x.label ?? x.error).join(', ') || 'none'}`);
}
function printChanges(r) {
  console.log(`${r.from} → ${r.to}, framed on ${r.frame.title}`);
  for (const c of r.changes) console.log(`  ${c.day}: ${c.text}${c.why.length ? `\n      ${c.why.join(' | ')}` : ''}\n      ${c.records.map((x) => x.source.url ?? x.source.dataset).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}`);
}
function printSearch(r) {
  console.log(`${r.found} found for "${r.term}"`);
  for (const x of r.results) console.log(`  ${x.name} · ${x.layer}${x.start ? ` · ${x.start} → ${x.end}` : ''}${x.ids ? ` · ${Object.entries(x.ids).map(([k, v]) => `${k} ${v}`).join(', ')}` : ''}${x.box ? ` · box ${JSON.stringify(x.box)}` : ''}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = (n) => { const i = rest.indexOf(`--${n}`); return i > -1 ? rest[i + 1] : null; };
  const asJSON = rest.includes('--json');
  try {
    if ((opt('page') ?? 'us') !== 'us') throw new Error('only the North America page (--page us) answers these for now');
    if (cmd === 'describe') { const r = describe({ date: opt('date') ?? opt('year'), frame: opt('frame'), tracker: opt('tracker') ?? 'nations', records: opt('records') ?? 'data/records.csv' }); asJSON ? console.log(JSON.stringify(r, null, 2)) : printDescribe(r); }
    else if (cmd === 'changes') { const r = changes({ from: opt('from'), to: opt('to') ?? opt('date'), frame: opt('frame') }); asJSON ? console.log(JSON.stringify(r, null, 2)) : printChanges(r); }
    else if (cmd === 'search') { const term = rest.filter((x, i) => !x.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--') && rest[i - 1] !== '--json')).join(' '); const r = search(term, { records: opt('records') ?? 'data/records.csv' }); asJSON ? console.log(JSON.stringify(r, null, 2)) : printSearch(r); }
    else if (cmd === 'frames') { const r = listFrames(); asJSON ? console.log(JSON.stringify(r, null, 2)) : r.forEach((f) => console.log(`  ${f.id} · ${f.title} · ${Object.values(f.box).join(', ')}`)); }
    else throw new Error('usage: lookup.mjs describe|changes|search|frames …');
  } catch (err) { console.error(err.message); process.exit(1); }
}

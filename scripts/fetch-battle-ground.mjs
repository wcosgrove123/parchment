#!/usr/bin/env node
// Parchment — fetch-battle-ground.mjs: the roads and streams under a battle frame, downloaded, never drawn.
//   node scripts/fetch-battle-ground.mjs gettysburg
// Roads: U.S. Census Bureau TIGER/Line through TIGERweb (public domain): the secondary roads inside the frame's box
// (today's roads; at Gettysburg they run on the lines of the ten roads of 1863) and any local road the battle's
// record names. Streams: USGS National Hydrography Dataset flowlines with a name (public domain). The battle's
// record in data/vocab.json (wars[].battles[].ground) says which box, which road names and period names, which
// streams. Writes data/battles/<id>.json: a GeoJSON FeatureCollection with a `_source` block (URLs, date, counts).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id) { console.error('usage: node scripts/fetch-battle-ground.mjs <battle id>'); process.exit(2); }
const vocab = JSON.parse(readFileSync(join(ROOT, 'data', 'vocab.json'), 'utf8'));
const battle = (vocab.wars ?? []).flatMap((w) => w.battles ?? []).find((b) => b.id === id);
if (!battle?.ground) { console.error(`battle "${id}" has no ground block in data/vocab.json`); process.exit(1); }
const g = battle.ground;
const box = g.box; // { west, south, east, north }
const env = `${box.west},${box.south},${box.east},${box.north}`;
const q = (where, fields) => `where=${encodeURIComponent(where)}&outFields=${fields}&geometry=${env}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson&returnGeometry=true`;
const TIGER = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation/MapServer';
const NHD = 'https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/6';
const get = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} ${url}`); const j = await r.json(); if (j.error) throw new Error(`${j.error.message} ${url}`); return j; };
const round = (c) => (Array.isArray(c[0]) ? c.map(round) : [Number(c[0].toFixed(5)), Number(c[1].toFixed(5))]);
const inBox = ([x, y]) => x >= box.west && x <= box.east && y >= box.south && y <= box.north;
// keep the parts of each line inside the box (whole vertices; the frame clips the rest)
const clip = (geom) => {
  const lines = geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates;
  const out = [];
  for (const l of lines) { let run = []; for (const p of l) { if (inBox(p)) run.push(p); else { if (run.length > 1) out.push(run); run = []; } } if (run.length > 1) out.push(run); }
  return out.map(round);
};

const urls = [];
const features = [];
// roads: the secondary layer, less the names the record leaves out; plus named local roads
const u1 = `${TIGER}/6/query?${q('1=1', 'NAME,MTFCC')}`; urls.push(u1);
const sec = await get(u1);
const skip = new Set(g.roads_skip ?? []);
const localNames = g.roads_local ?? [];
let local = { features: [] };
if (localNames.length) { const u2 = `${TIGER}/8/query?${q(`NAME IN (${localNames.map((n) => `'${n.replace(/'/g, "''")}'`).join(',')})`, 'NAME,MTFCC')}`; urls.push(u2); local = await get(u2); }
const period = g.road_names ?? {};
const byRoad = new Map();
for (const f of [...sec.features, ...local.features]) {
  const name = f.properties.NAME;
  if (!name || skip.has(name)) continue;
  const lines = clip(f.geometry);
  if (!lines.length) continue;
  const key = period[name] ?? name;
  if (!byRoad.has(key)) byRoad.set(key, { names: new Set(), lines: [], named: !!period[name] });
  const r = byRoad.get(key); r.names.add(name); r.lines.push(...lines);
}
for (const [name, r] of byRoad) features.push({ type: 'Feature', properties: { kind: 'road', name: r.named ? name : null, today: [...r.names].sort().join('; '), town: !r.named }, geometry: { type: 'MultiLineString', coordinates: r.lines } });
// streams
const streams = g.streams ?? [];
if (streams.length) {
  const u3 = `${NHD}/query?${q(`gnis_name IN (${streams.map((n) => `'${n.replace(/'/g, "''")}'`).join(',')})`, 'gnis_name,ftype')}`; urls.push(u3);
  const nhd = await get(u3);
  const byName = new Map();
  for (const f of nhd.features) { const n = f.properties.gnis_name ?? f.properties.GNIS_NAME; const lines = clip(f.geometry); if (!lines.length) continue; if (!byName.has(n)) byName.set(n, []); byName.get(n).push(...lines); }
  for (const [name, lines] of byName) features.push({ type: 'Feature', properties: { kind: 'stream', name }, geometry: { type: 'MultiLineString', coordinates: lines } });
}
const out = {
  type: 'FeatureCollection',
  _source: {
    battle: id, fetched: new Date().toISOString().slice(0, 10), box,
    roads: 'U.S. Census Bureau, TIGER/Line via TIGERweb (Transportation: secondary roads, and the local roads the record names); public domain. Today\'s roads: where the record gives a period name the road runs on the line of that 1863 road; the rest are the town\'s main streets.',
    streams: 'U.S. Geological Survey, National Hydrography Dataset (flowlines, large scale), via The National Map; public domain.',
    urls, by: 'scripts/fetch-battle-ground.mjs', note: 'Vertices outside the box are dropped and coordinates rounded to five places; nothing is redrawn.',
    counts: { roads: features.filter((f) => f.properties.kind === 'road').length, streams: features.filter((f) => f.properties.kind === 'stream').length },
  },
  features,
};
mkdirSync(join(ROOT, 'data', 'battles'), { recursive: true });
const file = join(ROOT, 'data', 'battles', `${id}.json`);
writeFileSync(file, `${JSON.stringify(out)}\n`);
console.log(`wrote data/battles/${id}.json: ${out._source.counts.roads} roads (${features.filter((f) => f.properties.kind === 'road' && f.properties.name).map((f) => f.properties.name).join(', ')}), ${out._source.counts.streams} streams (${features.filter((f) => f.properties.kind === 'stream').map((f) => f.properties.name).join(', ')}); ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);

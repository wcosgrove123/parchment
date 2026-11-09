#!/usr/bin/env node
// Parchment — MCP server (stdio). A thin wrapper, for Claude on Wil's laptop, around the same code the commands use:
//   list_frames     the North America page's frames (src/focuses.json)
//   describe        what is alive in a frame on a date            (npm run describe)
//   changes         every border change in a frame between dates  (npm run changes)
//   search          anything on the page by name                  (npm run search)
//   render          an order form → PNG path + packing slip      (npm run map)
// The commands work on their own from a GitHub clone; this server only saves a cloud session from shelling out when
// the laptop is on. JSON-RPC 2.0 over stdin/stdout, one message per line; nothing but replies goes to stdout.
// No SDK: the protocol's few methods are answered here (initialize, tools/list, tools/call, ping).
// Setup: README.md, "Lesson maps for slides" (Claude Code reads .mcp.json in this folder; Claude Desktop needs the
// absolute paths given there).

import { createInterface } from 'node:readline';
import { dirname, join, resolve, isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT); // orders name files relative to the repository (records, out)
const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const log = (...a) => process.stderr.write(`[parchment-mcp] ${a.join(' ')}\n`);

// The tools load their modules on first use, so the server starts at once even on a slow disk.
const lookup = () => import('../scripts/lookup.mjs');
const mapper = () => import('../scripts/map.mjs');

const ORDER_SCHEMA = {
  type: 'object',
  description: 'An order form (docs/LESSON-MAPS.md). Every field is also a parameter of us.html.',
  properties: {
    page: { type: 'string', enum: ['us'], description: 'The North America page (the only one that takes orders for now).' },
    date: { type: 'string', description: 'A year (1836) or a day (1836-06-01).' },
    from: { type: 'string', description: 'For a Diff (what changed between two dates): the earlier date.' },
    tracker: { type: 'string', enum: ['nations', 'states', 'cessions', 'population', 'electoral'] },
    frame: { type: 'string', description: 'A frame id (list_frames) or a box "W,S,E,N" in degrees.' },
    highlight: { type: 'array', items: { type: 'string' }, description: 'Ids to light: a power (mexico, united-states), a polygon by its name (coahuila-y-tejas, texas-republic) or its id (ohm:2841297, nb:tx_republic). Everything else drops to paper.' },
    annotate: {
      type: 'object',
      properties: {
        rivers: { type: 'array', items: { type: 'string' }, description: 'River names as Natural Earth gives them (Nueces, Rio Grande, Sabine).' },
        places: { type: 'array', items: { type: 'string' }, description: 'Point records by Wikidata id (their `where`) or record id.' },
        routes: { type: 'array', items: { type: 'string' }, description: 'Arrow or path records by id.' },
      },
    },
    title: { type: 'string', description: "The cartouche's title." },
    size: { type: 'string', description: 'WIDTHxHEIGHT in pixels, 800 to 3840 wide (default 1920x1080).' },
    scale: { type: 'number', description: 'Type scale (default: 1 up to 1920×1080, larger pictures keep the 1920×1080 type).' },
    projection: { type: 'string', enum: ['auto', 'page'], description: "auto: the frame's own projection (default); page: the page's Albers re-fitted." },
    records: { type: 'string', description: 'A records CSV in the repository (default data/records.csv).' },
    out: { type: 'string', description: 'Output path without extension, relative to the repository (default out/parchment-<frame>-<date>).' },
    svg: { type: 'boolean', description: 'Also write an SVG.' },
  },
  required: ['date'],
};

const TOOLS = [
  { name: 'list_frames', description: 'The frames the North America page can be framed on (focus ids with their boxes), for the `frame` of an order.', inputSchema: { type: 'object', properties: {} } },
  { name: 'describe', description: 'Every polygon alive inside a frame on a date (names, ids, dates, holder, certainty, area in the frame, source with URL), the rivers in the frame by name, and the records alive that day. Ask before choosing a date.', inputSchema: { type: 'object', properties: { date: { type: 'string' }, frame: { type: 'string' }, tracker: { type: 'string' }, records: { type: 'string' } }, required: ['date'] } },
  { name: 'changes', description: 'Every border change inside a frame between two dates, in order, each in its source\'s own words with links ("1835-12-15: Coahuila y Tejas became Texas and Coahuila").', inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, frame: { type: 'string' } }, required: ['from', 'to'] } },
  { name: 'search', description: 'Find anything on the North America page by name: polygons (Newberry, OpenHistoricalMap), computed disputes, Native homelands, rivers, records, gazetteer places, frames.', inputSchema: { type: 'object', properties: { term: { type: 'string' }, records: { type: 'string' } }, required: ['term'] } },
  { name: 'render', description: 'Render an order form to a slide-ready PNG (and its packing slip: what is on the map, with dates, sources, warnings, draft alt text and a credit line). Returns the file paths and the slip.', inputSchema: ORDER_SCHEMA },
];

async function call(name, args = {}) {
  if (name === 'list_frames') return (await lookup()).listFrames();
  if (name === 'describe') return (await lookup()).describe({ date: args.date, frame: args.frame ?? null, tracker: args.tracker ?? 'nations', records: args.records ?? 'data/records.csv' });
  if (name === 'changes') return (await lookup()).changes({ from: args.from, to: args.to, frame: args.frame ?? null });
  if (name === 'search') return (await lookup()).search(args.term, { records: args.records ?? 'data/records.csv' });
  if (name === 'render') {
    const out = args.out && isAbsolute(args.out) ? relative(ROOT, args.out) : args.out;
    const r = await (await mapper()).renderOrder({ page: 'us', ...args, out }, { base: ROOT, svg: !!args.svg, log });
    return { png: r.png, json: r.json, svg: r.svg, live_address: r.address, slip: r.slip };
  }
  throw Object.assign(new Error(`unknown tool ${name}`), { code: -32602 });
}

function reply(id, result) { process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`); }
function fail(id, code, message) { process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })}\n`); }

async function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;
  try {
    if (method === 'initialize') {
      const asked = params?.protocolVersion;
      return reply(id, { protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0], capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'parchment', title: 'Parchment lesson maps', version: VERSION },
        instructions: 'Parchment draws historical maps of North America from dated sources. Ask describe or changes before choosing a date; render returns a PNG and a packing slip to check the slide against.' });
    }
    if (method === 'ping') return isRequest && reply(id, {});
    if (method === 'tools/list') return reply(id, { tools: TOOLS });
    if (method === 'tools/call') {
      const { name, arguments: args } = params ?? {};
      if (!TOOLS.some((t) => t.name === name)) return fail(id, -32602, `unknown tool ${name}`);
      try {
        const result = await call(name, args ?? {});
        return reply(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], structuredContent: Array.isArray(result) ? { frames: result } : result, isError: false });
      } catch (err) {
        log(`${name} failed: ${err.message}`);
        return reply(id, { content: [{ type: 'text', text: err.message }], isError: true });
      }
    }
    if (method?.startsWith('notifications/')) return undefined; // initialized, cancelled: nothing to answer
    if (isRequest) fail(id, -32601, `method not found: ${method}`);
  } catch (err) {
    if (isRequest) fail(id, -32603, err.message);
  }
  return undefined;
}

const rl = createInterface({ input: process.stdin });
let pending = 0, closing = false;
rl.on('line', (line) => {
  const t = line.trim();
  if (!t) return;
  let msg;
  try { msg = JSON.parse(t); } catch { fail(null, -32700, 'parse error'); return; }
  pending++;
  Promise.resolve(handle(msg)).finally(() => { pending--; if (closing && !pending) process.exit(0); });
});
rl.on('close', () => { closing = true; if (!pending) process.exit(0); });
log(`ready (${ROOT})`);

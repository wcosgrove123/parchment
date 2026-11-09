#!/usr/bin/env node
// Parchment — MCP smoke test: starts mcp/server.mjs as Claude would, lists its tools and asks it a question.
//   npm run mcp:smoke                  initialize, tools/list, list_frames, describe (Texas, 1 June 1836)
//   npm run mcp:smoke -- --render      also renders tests/maps/texas-1836.json at 1200x1100 into out/
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const proc = spawn(process.execPath, [join(ROOT, 'mcp', 'server.mjs')], { stdio: ['pipe', 'pipe', 'inherit'] });
let buf = '';
const waiting = new Map();
proc.stdout.on('data', (b) => {
  buf += b;
  let i;
  while ((i = buf.indexOf('\n')) > -1) {
    const msg = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1);
    waiting.get(msg.id)?.(msg); waiting.delete(msg.id);
  }
});
let n = 0;
const ask = (method, params) => new Promise((res) => { const id = ++n; waiting.set(id, res); proc.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`); });
const init = await ask('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke', version: '0' } });
console.log(`initialize: ${init.result.serverInfo.name} ${init.result.serverInfo.version}, protocol ${init.result.protocolVersion}`);
proc.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
const tools = await ask('tools/list', {});
console.log(`tools: ${tools.result.tools.map((t) => t.name).join(', ')}`);
const frames = await ask('tools/call', { name: 'list_frames', arguments: {} });
console.log(`list_frames: ${JSON.parse(frames.result.content[0].text).map((f) => f.id).join(', ')}`);
const d = await ask('tools/call', { name: 'describe', arguments: { date: '1836-06-01', frame: 'texas' } });
const dr = JSON.parse(d.result.content[0].text);
console.log(`describe: ${dr.polygons.length} polygons in Texas on ${dr.date_text}; first: ${dr.polygons.slice(0, 3).map((p) => p.name).join(', ')}`);
if (process.argv.includes('--render')) {
  const order = JSON.parse(readFileSync(join(ROOT, 'tests', 'maps', 'texas-1836.json'), 'utf8'));
  const r = await ask('tools/call', { name: 'render', arguments: { ...order, size: '1200x1100', out: 'out/mcp-smoke-texas-1836' } });
  const rr = JSON.parse(r.result.content[0].text);
  console.log(r.result.isError ? `render failed: ${r.result.content[0].text}` : `render: ${rr.png} · ${rr.slip.features.length} polygons on the slip · ${rr.slip.credit}`);
}
proc.stdin.end();

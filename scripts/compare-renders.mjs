#!/usr/bin/env node
// Parchment — compare-renders.mjs: does a change leave the existing maps as they were?
//   node scripts/compare-renders.mjs [--ref HEAD] [--out dir] [orders.json ...]
// Renders each order twice, once from the commit `--ref` (default HEAD: the last commit, without the working tree's
// changes) and once from this folder as it stands, and compares the two pictures pixel by pixel and the two packing
// slips' legend lines, names, lit polygons and warnings. Without orders it takes every order in tests/maps/ (not its
// subfolders) and the 1844 continent under the nations tracker (us.html?date=1844-06-01&tracker=nations), the
// statehood brief's regression test (2026-11-18). The commit is checked out into a temporary git worktree that shares
// this folder's node_modules, and removed afterwards. A picture that differs by at most one shade per color channel
// is reported as such: the reshaded relief of some frames is not the same to the last bit from one run to the next
// (tests/maps/texas-1830.json flips between two such pictures with no change at all).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, mkdtempSync, symlinkSync, rmSync, existsSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name, dflt) => { const i = args.indexOf(`--${name}`); return i > -1 ? args.splice(i, 2)[1] : dflt; };
const ref = flag('ref', 'HEAD');
const OUT = resolve(flag('out', join('out', 'compare')));
mkdirSync(OUT, { recursive: true });

const orders = [];
if (args.length) for (const f of args) orders.push([basename(f, '.json'), JSON.parse(readFileSync(resolve(f), 'utf8'))]);
else {
  for (const f of readdirSync(join(ROOT, 'tests', 'maps')).filter((x) => x.endsWith('.json')).sort()) orders.push([basename(f, '.json'), JSON.parse(readFileSync(join(ROOT, 'tests', 'maps', f), 'utf8'))]);
  orders.push(['nations-1844-continent', { page: 'us', date: '1844-06-01', tracker: 'nations' }]);
}

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const sha = git('rev-parse', '--short', ref);
const wt = mkdtempSync(join(tmpdir(), `parchment-${sha}-`));
git('worktree', 'add', '--quiet', '--detach', wt, ref);
try {
  if (!existsSync(join(wt, 'node_modules'))) symlinkSync(join(ROOT, 'node_modules'), join(wt, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  const before = await import(pathToFileURL(join(wt, 'scripts', 'map.mjs')).href);
  const now = await import(pathToFileURL(join(ROOT, 'scripts', 'map.mjs')).href);
  const gist = (s) => ({ legend: s.legend.rows.map((r) => r.label), labels: s.features.filter((f) => f.labeled).map((f) => f.label).sort(), lit: s.features.filter((f) => f.lit).map((f) => f.name).sort(), warnings: s.warnings.filter((w) => !/request off this machine/.test(w)) });
  const report = [];
  console.log(`comparing ${orders.length} orders: ${ref} (${sha}) against this folder`);
  for (const [name, order] of orders) {
    const o = { ...order }; delete o.out;
    const a = await before.renderOrder(o, { out: join(OUT, `${name}.${sha}`), base: OUT });
    const b = await now.renderOrder(o, { out: join(OUT, `${name}.now`), base: OUT });
    const pa = PNG.sync.read(readFileSync(a.png)), pb = PNG.sync.read(readFileSync(b.png));
    let n = 0, max = 0;
    if (pa.width !== pb.width || pa.height !== pb.height) n = -1;
    else for (let i = 0; i < pa.data.length; i += 4) {
      const d = Math.max(Math.abs(pa.data[i] - pb.data[i]), Math.abs(pa.data[i + 1] - pb.data[i + 1]), Math.abs(pa.data[i + 2] - pb.data[i + 2]));
      if (d) { n++; max = Math.max(max, d); }
    }
    const ga = gist(a.slip), gb = gist(b.slip);
    const slip = Object.keys(ga).filter((k) => JSON.stringify(ga[k]) !== JSON.stringify(gb[k]));
    const pixels = n === 0 ? 'identical' : n < 0 ? 'a different size' : max <= 1 ? `${n} px within one shade` : `${n} px differ (up to ${max} shades)`;
    report.push({ name, pixels_differing: n, max_shade: max, slip_differs_in: slip, ...(slip.length ? { before: ga, now: gb } : {}) });
    console.log(`${name.padEnd(34)} picture: ${pixels.padEnd(34)} slip: ${slip.length ? `differs in ${slip.join(', ')}` : 'same'}`);
  }
  writeFileSync(join(OUT, 'compare.json'), `${JSON.stringify({ ref, sha, report }, null, 1)}\n`);
  console.log(`pictures and the report (compare.json) are in ${OUT}`);
} finally {
  // The link to this folder's node_modules goes first, on its own: a removal that followed it would empty the real one.
  // (unlink removes a symlink; rmdir without recursion removes a Windows junction and fails on a real folder)
  const link = join(wt, 'node_modules');
  try { unlinkSync(link); } catch { try { rmdirSync(link); } catch { /* not there */ } }
  if (existsSync(join(link, 'd3'))) throw new Error(`the node_modules link in ${wt} could not be removed; remove the worktree by hand (git worktree remove)`);
  try { git('worktree', 'remove', '--force', wt); } catch { rmSync(wt, { recursive: true, force: true }); try { git('worktree', 'prune'); } catch { /* nothing to prune */ } }
}

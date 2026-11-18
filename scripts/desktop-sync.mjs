#!/usr/bin/env node
// Parchment — desktop-sync.mjs: build the Windows app and put it where the Desktop shortcut and the classroom copy are.
//   npm run app:sync
// electron-builder writes dist/desktop-sync/: win-unpacked/ (the app as a folder) and Parchment.exe (the same app as one
// self-unpacking file). Then, with the app closed (a running copy locks its files):
//   dist/desktop/app/            the folder, which the Desktop shortcut opens: it starts in a few seconds
//   dist/desktop/Parchment.exe   the one file to copy to another computer: it unpacks itself into a temporary folder
//                                every time it opens, which took 35 s on this laptop (2026-11-18) against 4 s for the folder
// The app is the last commit: when the folder has changes not committed (another session's work in progress, files
// half made), it is built from a clean copy of HEAD in a temporary git worktree, so nothing unfinished goes into it.

import { spawnSync, execFileSync } from 'node:child_process';
import { existsSync, copyFileSync, mkdirSync, mkdtempSync, symlinkSync, unlinkSync, rmdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist', 'desktop-sync');
const DEST = join(ROOT, 'dist', 'desktop');
if (process.platform !== 'win32') { console.error('app:sync builds the Windows app; run it on Windows.'); process.exit(2); }

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const running = () => /Parchment\.exe/i.test(execFileSync('tasklist', ['/FI', 'IMAGENAME eq Parchment.exe'], { encoding: 'utf8' }));
const dirty = git('status', '--short');
let from = ROOT, wt = null;
if (dirty) {
  wt = mkdtempSync(join(tmpdir(), 'parchment-app-'));
  git('worktree', 'add', '--quiet', '--detach', wt, 'HEAD');
  symlinkSync(join(ROOT, 'node_modules'), join(wt, 'node_modules'), 'junction');
  from = wt;
  console.log(`the folder has changes not committed; building the last commit (${git('rev-parse', '--short', 'HEAD')}) from a clean copy`);
}
let b;
try {
  console.log('building the app (electron-builder, a few minutes)…');
  b = spawnSync('npx', ['electron-builder', '--win', 'portable', `--config.directories.output="${OUT}"`], { cwd: from, stdio: 'inherit', shell: true });
} finally {
  if (wt) {
    // (the node_modules link goes first, on its own: a removal that followed it would empty the real one)
    const link = join(wt, 'node_modules');
    try { unlinkSync(link); } catch { try { rmdirSync(link); } catch { /* gone */ } }
    if (!existsSync(join(link, 'd3'))) { try { git('worktree', 'remove', '--force', wt); } catch { rmSync(wt, { recursive: true, force: true }); try { git('worktree', 'prune'); } catch { /* nothing */ } } }
  }
}
if (b.status !== 0) { console.error('the build failed; dist/desktop is unchanged'); process.exit(b.status ?? 1); }
if (!existsSync(join(OUT, 'win-unpacked', 'Parchment.exe')) || !existsSync(join(OUT, 'Parchment.exe'))) { console.error('the build left no app in dist/desktop-sync'); process.exit(1); }
if (running()) {
  console.error('Parchment is open: close it and run this again (the build in dist/desktop-sync is kept; nothing was copied)');
  process.exit(3);
}
mkdirSync(DEST, { recursive: true });
// robocopy /MIR makes dist/desktop/app the same as win-unpacked (exit codes below 8 mean success)
const r = spawnSync('robocopy', [join(OUT, 'win-unpacked'), join(DEST, 'app'), '/MIR', '/NFL', '/NDL', '/NJH', '/NJS', '/NP'], { stdio: 'inherit' });
if (r.status == null || r.status >= 8) { console.error(`robocopy failed (${r.status})`); process.exit(1); }
copyFileSync(join(OUT, 'Parchment.exe'), join(DEST, 'Parchment.exe'));
console.log(`done:\n  ${join(DEST, 'app', 'Parchment.exe')}  (the Desktop shortcut opens this)\n  ${join(DEST, 'Parchment.exe')}  (one file, for another computer)`);

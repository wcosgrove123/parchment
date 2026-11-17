#!/usr/bin/env node
// Parchment — underground-doc.mjs: writes Part 1 of docs/UNDERGROUND-RAILROAD.md (the routes on the map) from the
// same list the table is written from (scripts/underground-rows.mjs), so the doc and the rows cannot drift apart.
// Everything outside the two markers in the doc is left as it is.
//   node scripts/underground-doc.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES, PLACES } from './underground-rows.mjs';

const FILE = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'docs', 'UNDERGROUND-RAILROAD.md');
const A = '<!-- routes:start (written by scripts/underground-doc.mjs) -->', B = '<!-- routes:end -->';
const line = { legal: 'solid (documented stops)', approximate: 'dashed (approximate)', sphere: 'dotted (a direction only)' };
const table = ROUTES.map(([id, label, where, start, end, grade, cert, source, note]) => [
  `### \`${id}\`: ${label}`, '',
  `- **Places, in order:** ${where.split('>').map((q) => `${PLACES[q][0]}${PLACES[q][1] === 'sea' ? ' (sea waypoint, not a stop)' : ''} \`${q}\``).join(' → ')}`,
  `- **On the map from** ${grade === 'circa' ? 'about ' : ''}${start}; last documented ${end}. **Line:** ${line[cert]}.`,
  `- **Source:** ${source}`,
  `- **Note:** ${note}`, '',
].join('\n')).join('\n');
const text = readFileSync(FILE, 'utf8');
const i = text.indexOf(A), j = text.indexOf(B);
if (i < 0 || j < 0) { console.error('docs/UNDERGROUND-RAILROAD.md has no routes markers'); process.exit(1); }
writeFileSync(FILE, `${text.slice(0, i + A.length)}\n\n${table}\n${text.slice(j)}`);
console.log(`docs/UNDERGROUND-RAILROAD.md: ${ROUTES.length} routes written`);

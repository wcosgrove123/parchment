#!/usr/bin/env node
// Parchment — licenses-native.mjs
// Writes the North America stage's Native population and Native lands sources into docs/DATA-LICENSES.md, as one
// block between two markers. fetch-base.mjs writes that file whole and carries this block over; fetch-us.mjs calls
// this at its end, after downloading the sources the block names. Usage: node scripts/licenses-native.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const START = '<!-- fetch-us:native:start -->';
export const END = '<!-- fetch-us:native:end -->';

const ROWS = [
  '| American Indian population by state, 1860–1990 | Campbell Gibson and Kay Jung, [*Historical Census Statistics on Population Totals by Race, 1790 to 1990, and by Hispanic Origin, 1970 to 1990, for the United States, Regions, Divisions, and States*](https://www.census.gov/content/dam/Census/library/working-papers/2002/demo/POP-twps0056.pdf), U.S. Census Bureau, Population Division Working Paper No. 56 (2002); read from the PDF by `scripts/census-wp56.py` | Public domain (U.S. Government work) | U.S. Census Bureau |',
  '| American Indian and Alaska Native population by state, 2000, 2010, 2020 | U.S. Census Bureau, [P.L. 94-171 redistricting data](https://www.census.gov/programs-surveys/decennial-census/about/rdo/summary-files.html), national files for 2000, 2010 and 2020 | Public domain (U.S. Government work) | U.S. Census Bureau |',
  '| American Indian, Alaska Native and Native Hawaiian areas today (from 2020) | U.S. Census Bureau, [cartographic boundary file](https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html) `cb_2025_us_aiannh_500k` (2025, 1:500,000) | Public domain (U.S. Government work) | U.S. Census Bureau |',
  '| Original tribal territories, as judicially established (1784–1978) | Indian Claims Commission, *Indian Land Areas Judicially Established* (map, 1978), as digitized by the National Park Service ([ArcGIS Online feature service](https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/Indian_Land_Areas_Judicially_Established_1978/FeatureServer/5)) | Public domain (U.S. Government work); the Park Service notes the areas are not legal documents | Indian Claims Commission (1978); National Park Service |',
  '| Land held under U.S. treaty, 1785–1835 (computed, not drawn) | The Royce areas above, joined by `scripts/derive-native.mjs`; the treaties\' places and first dates in `data/us/treaty-places.csv` from Charles C. Royce, *The Cherokee Nation of Indians*, 5th Annual Report of the Bureau of Ethnology (1887), and Royce (1899) | Public domain (U.S. Government works) | Charles C. Royce (1887, 1899); U.S. Forest Service |',
  '| Native population before the census (estimates) | Figures cited, each with its source, grade and range, in `data/us/native-estimates.csv`: S. F. Cook (1976), A. L. Kroeber (1925), B. Madley (2016), D. H. Ubelaker (1988) and R. Thornton (1987), the last two as reported by the National Research Council (2001) and by J. D. Hacker and M. R. Haines (NBER Working Paper 12572, 2006) | Cited figures; no text or map reproduced | The authors named |',
];

export function nativeLicenseBlock() {
  return [START, '', '### North America stage: Native population and Native lands', '',
    'Downloaded by `scripts/fetch-us.mjs` (URLs, dates and checksums in `data/base/MANIFEST-north-america.json`) and',
    'derived by `scripts/derive-native.mjs`.', '',
    '| layer | source | license | attribution |', '|---|---|---|---|', ...ROWS, '', END].join('\n');
}

// Replaces the block in the text, or adds it at the end.
export function withNativeBlock(text) {
  const block = nativeLicenseBlock();
  const at = text.indexOf(START), to = text.indexOf(END);
  if (at >= 0 && to > at) return text.slice(0, at) + block + text.slice(to + END.length);
  return `${text.trimEnd()}\n\n${block}\n`;
}

export async function writeNativeLicenses() {
  const path = join(ROOT, 'docs', 'DATA-LICENSES.md');
  const prev = await readFile(path, 'utf8').catch(() => '# Data licenses and attribution\n');
  await writeFile(path, withNativeBlock(prev));
  console.log('  wrote the Native population and lands block of docs/DATA-LICENSES.md');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await writeNativeLicenses();

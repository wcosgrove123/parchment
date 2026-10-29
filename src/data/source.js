// Parchment — where the record table comes from
// The Google Sheet when data/sheet.json names one (teachers edit there; read live, never cached), otherwise
// data/records.csv, which is also the fallback when the Sheet cannot be reached.

import { loadJSON, loadText } from './loader.js';

// → { text, from: 'sheet' | 'fallback' | 'file', sheet, error? }
export async function loadRecordsText() {
  const sheet = await loadJSON('data/sheet.json').catch(() => ({}));
  if (sheet.csv_url) {
    try {
      const res = await fetch(sheet.csv_url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.trim()) throw new Error('empty');
      return { text, from: 'sheet', sheet };
    } catch (err) {
      console.warn(`Sheet not reachable (${err.message}); using data/records.csv`);
      const text = await loadText('data/records.csv').catch(() => null);
      return { text, from: 'fallback', sheet, error: err.message };
    }
  }
  const text = await loadText('data/records.csv').catch((err) => { console.error(err); return null; });
  return { text, from: 'file', sheet };
}

// A link that opens one row of the Sheet, when the Sheet is known.
export function sheetRowURL(sheet, line) {
  if (!sheet?.edit_url) return null;
  return `${sheet.edit_url.replace(/[#?].*$/, '')}#gid=${sheet.gid ?? 0}&range=A${line}`;
}

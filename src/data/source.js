// Parchment — where the record table comes from
// The Google Sheet when data/sheet.json names one (teachers edit there; read live, never cached), otherwise
// data/records.csv, which is also the fallback when the Sheet cannot be reached.

import { loadJSON, loadText } from './loader.js';

const SHEET_WAIT_MS = 4000;

// → { text, from: 'sheet' | 'fallback' | 'file', sheet, error? }
export async function loadRecordsText() {
  // ?records=data/some.csv reads a file from the site instead of the Sheet: for trying rows before they go live.
  const override = new URLSearchParams(location.search).get('records');
  if (override && /^[\w./-]+\.csv$/.test(override) && !override.includes('..')) {
    const text = await loadText(override).catch((err) => { console.error(err); return null; });
    return { text, from: 'file', sheet: {} };
  }
  const sheet = await loadJSON('data/sheet.json').catch(() => ({}));
  if (sheet.csv_url) {
    // (the first map waits for the table: a network that does not answer gets SHEET_WAIT_MS, then the saved copy;
    // 2026-11-18, the app was slow to open)
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), SHEET_WAIT_MS);
    const late = (err) => { throw ctl.signal.aborted ? new Error(`no answer in ${SHEET_WAIT_MS / 1000} s`) : err; };
    try {
      const res = await fetch(sheet.csv_url, { cache: 'no-store', signal: ctl.signal }).catch(late);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text().catch(late);
      clearTimeout(timer);
      if (!text.trim()) throw new Error('empty');
      return { text, from: 'sheet', sheet };
    } catch (err) {
      clearTimeout(timer);
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

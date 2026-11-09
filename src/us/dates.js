// Parchment — North America stage: dates as YYYYMMDD integers (the sources are dated to the day).

export const OPEN = 99991231;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const yearOf = (d) => Math.trunc(d / 10000);
export const endOfYear = (y) => y * 10000 + 1231;

// "1803-12-20" or "1803" → 18031220 / 18031231 (a bare year means the map as of its last day).
export function parseDate(s) {
  const m = String(s ?? '').trim().match(/^(\d{3,4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
  if (!m) return null;
  const y = Number(m[1]);
  if (!m[2]) return endOfYear(y);
  const mo = Math.min(12, Math.max(1, Number(m[2])));
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const d = m[3] ? Math.min(last, Math.max(1, Number(m[3]))) : last;
  return y * 10000 + mo * 100 + d;
}

export const isoDate = (d) => `${yearOf(d)}-${String(Math.trunc(d / 100) % 100).padStart(2, '0')}-${String(d % 100).padStart(2, '0')}`;

// 18031220 → "20 December 1803"; open-ended → "the present".
export function longDate(d) {
  if (d == null) return '';
  if (d >= OPEN) return 'the present';
  const y = yearOf(d), mo = Math.trunc(d / 100) % 100, day = d % 100;
  if (y < 0) return `${-y} BCE`;
  return `${day} ${MONTHS[mo - 1]} ${y}`;
}

export const isEndOfYear = (d) => d % 10000 === 1231;

// The day after a YYYYMMDD date (for "the next change").
export function nextDay(d) {
  const t = new Date(Date.UTC(yearOf(d), (Math.trunc(d / 100) % 100) - 1, (d % 100) + 1));
  return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
}
export function prevDay(d) {
  const t = new Date(Date.UTC(yearOf(d), (Math.trunc(d / 100) % 100) - 1, (d % 100) - 1));
  return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
}

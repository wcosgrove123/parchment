// Parchment — the Military layer: wars, sides and members (brief of 2026-11-09, §1; milestone 1).
// Pure functions, no DOM: the page, the packing slip, the lookups and the tests share them.
//
// A war lives in data/vocab.json (`wars`): id, names (one per side where they differ), start, end, and its sides,
// each with an id, a label, a color (a key of the fixed order, src/military/sides.js: a, b, c, d, or gray, red for
// the uniform scheme) and the reason for that color. Membership is a `region` row under `tracker: military`:
// `where` the state id, `war` the war, `side` the side, `value` the role (belligerent, co-belligerent, associated,
// ally, auxiliary, dependent, satellite, occupied), `start`/`end` the dates it belonged. Who was on which side is
// then a claim with a source, reviewable like any other row.

import { slug } from '../us/frames.js';

// yyyymmdd integers, as the North America page keeps its dates.
export const toInt = (iso, end = false) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  return y * 10000 + (m || (end ? 12 : 1)) * 100 + (d || (end ? 31 : 1));
};
const first = (w) => (w ? w.year * 10000 + (w.month ?? 1) * 100 + (w.day ?? 1) : 0);
const last = (w) => (w ? w.year * 10000 + (w.month ?? 12) * 100 + (w.day ?? 31) : 99999999);

export const warById = (vocab, id) => (vocab?.wars ?? []).find((w) => w.id === id) ?? null;
// The wars alive on a date, longest first.
export const warsOn = (vocab, date) => (vocab?.wars ?? []).filter((w) => toInt(w.start) <= date && date <= toInt(w.end, true))
  .sort((a, b) => (toInt(b.end, true) - toInt(b.start)) - (toInt(a.end, true) - toInt(a.start)));

// The war's name as one side used it ('us', 'mexico': the keys of `names`). 'both' prints the first side's name in
// the cartouche (two names in one line shrink past reading) and the other names as rows of the legend (otherNames).
export function warTitle(war, names = 'both') {
  const n = war?.names ?? {};
  if (names && names !== 'both' && n[names]) return n[names];
  const firstSide = war?.sides?.[0]?.id;
  return n[firstSide] ?? Object.values(n)[0] ?? war?.id ?? '';
}
// The names the cartouche did not print, each with the side that used it: [{ side, label, name }].
export function otherNames(war, names = 'both') {
  const n = war?.names ?? {};
  const shown = warTitle(war, names);
  return (war?.sides ?? []).filter((s) => n[s.id] && n[s.id] !== shown).map((s) => ({ side: s.id, label: s.label, name: n[s.id] }));
}

// The membership rows of a war, from validated records (src/data/records.js carries the war and side columns).
export const membersOf = (records, warId) => (records ?? []).filter((r) => r.tracker === 'military' && r.kind === 'region' && r.war === warId);
export const aliveOn = (r, date) => first(r.startWhen) <= date && date <= last(r.endWhen);

// A polygon's side on a date: the first membership alive whose `where` is one of the polygon's keys (its power,
// the power's labels, its own names and ids: src/us/frames.js itemKeys). → { side, member, role } or null.
export function sideOf(war, members, keys, date) {
  if (!war) return null;
  for (const m of members) {
    if (!aliveOn(m, date) || !keys.has(slug(m.where))) continue;
    const side = war.sides.find((s) => s.id === m.side);
    if (side) return { side, member: m, role: m.value || 'belligerent' };
  }
  return null;
}

// Roles drawn at 40 % (grammar §5: influence or claim; proposal P2): dependents and satellites. (Occupied land,
// hatched in the holder's color over the claimant's fill, comes with the lines milestone.)
export const DEPENDENT = new Set(['dependent', 'satellite', 'occupied']);
export const sideFillKey = (side, role = 'belligerent') => `side-${side.color}${DEPENDENT.has(role) ? '-dep' : ''}`;

// The look a polygon takes on the Military layer: the side's fill (CSS: .na-fill.k-side-a), its label and id.
export const lookFor = ({ side, role }) => ({ fill: sideFillKey(side, role), label: side.label, cat: side.id, side: side.id, role });

// Legend rows: one per side on the sheet, then its members with their dates when a side has more than one, then the
// 40 % row where a dependent shows. `present` holds the look keys the sheet shows (src/us/stage.js lookKey).
export function militaryLegend(war, members, present, date, names = 'both') {
  const rows = [];
  if (!war) return [{ swatch: 'none', label: 'No war named for this date' }];
  const when = (m) => {
    const parts = [];
    if (first(m.startWhen) > toInt(war.start)) parts.push(`from ${fmtWhen(m.startWhen)}`);
    if (last(m.endWhen) < toInt(war.end, true)) parts.push(`to ${fmtWhen(m.endWhen)}`);
    return parts.join(', ');
  };
  for (const side of war.sides) {
    const full = `fill:side-${side.color}:${side.id}`, dep = `fill:side-${side.color}-dep:${side.id}`;
    if (!present.has(full) && !present.has(dep)) continue;
    rows.push({ swatch: 'fill', key: `side-${side.color}`, label: side.label, role: 'side' });
    const mine = members.filter((m) => m.side === side.id && aliveOn(m, date));
    if (mine.length > 1) for (const m of mine) rows.push({ swatch: 'none', label: `  ${m.label}${when(m) ? `, ${when(m)}` : ''}${m.value && m.value !== 'belligerent' ? ` (${m.value})` : ''}`, role: 'member' });
    if (present.has(dep)) rows.push({ swatch: 'fill', key: `side-${side.color}-dep`, label: `Dependent or satellite of ${side.label}`, role: 'side' });
  }
  if (!rows.length) rows.push({ swatch: 'none', label: 'No member of either side on this sheet' });
  // The perspective rule (brief, ground rules): the order chooses whose name prints; the other side's name is not lost.
  if (names === 'both') for (const o of otherNames(war, names)) rows.push({ swatch: 'none', label: `${o.label}: ${o.name}`, role: 'name' });
  return rows;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtWhen(w) {
  if (!w) return '';
  if (w.month == null) return String(w.year);
  if (w.day == null) return `${MONTHS[w.month - 1]} ${w.year}`;
  return `${w.day} ${MONTHS[w.month - 1]} ${w.year}`;
}

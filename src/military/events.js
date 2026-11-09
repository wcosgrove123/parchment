// Parchment — the Military layer: events (brief of 2026-11-09, §1 and P5, P8; milestone 2). Pure, no DOM.
// An event is a `point` row under `tracker: military`: battle, siege, naval-battle, raid, landing, surrender,
// capture, declaration, treaty, armistice, massacre, fort, headquarters; with `war`, optionally `side` (the besieger
// of a siege, the captor of a place, the side that declared) and `outcome`: `won:<side>`, `inconclusive` or
// `claimed:<side>;<side>`. Who won is a claim from the row's source, never inferred.

const first = (w) => (w ? w.year * 10000 + (w.month ?? 1) * 100 + (w.day ?? 1) : 0);
const last = (w) => (w ? w.year * 10000 + (w.month ?? 12) * 100 + (w.day ?? 31) : 99999999);
export const eventFirst = (r) => first(r.startWhen);
export const eventLast = (r) => last(r.endWhen);

export const eventsOf = (records, warId) => (records ?? []).filter((r) => r.tracker === 'military' && r.kind === 'point' && r.war === warId);

// Events that have begun by the date, in date order (the strip and the list keep every event of the war).
export const eventsUpTo = (events, date) => events.filter((r) => eventFirst(r) <= date).sort((a, b) => eventFirst(a) - eventFirst(b) || a.id.localeCompare(b.id));

// `won:us` → { kind: 'won', sides: ['us'] }; `inconclusive`; `claimed:us;mexico` → { kind: 'claimed', sides }. null when blank.
export function parseOutcome(s) {
  const v = String(s ?? '').trim();
  if (!v) return null;
  if (v === 'inconclusive') return { kind: 'inconclusive', sides: [] };
  let m = /^won:([a-z0-9-]+)$/.exec(v);
  if (m) return { kind: 'won', sides: [m[1]] };
  m = /^claimed:([a-z0-9-]+);([a-z0-9-]+)$/.exec(v);
  if (m) return { kind: 'claimed', sides: [m[1], m[2]] };
  return { kind: 'invalid', sides: [], raw: v };
}
// What the validator accepts: the sides must be the war's.
export function outcomeProblem(s, war) {
  const o = parseOutcome(s);
  if (!o) return null;
  if (o.kind === 'invalid') return `outcome "${o.raw}" should be won:<side>, inconclusive, or claimed:<side>;<side>`;
  const ids = (war?.sides ?? []).map((x) => x.id);
  const bad = o.sides.filter((x) => !ids.includes(x));
  if (bad.length) return `outcome names "${bad[0]}", which is not a side of ${war?.id ?? 'this war'} (${ids.join(', ')})`;
  if (o.kind === 'claimed' && o.sides[0] === o.sides[1]) return 'claimed:<side>;<side> needs two different sides';
  return null;
}

const DIAMONDS = new Set(['battle', 'siege', 'naval-battle', 'raid']);
const TRIANGLES = new Set(['declaration', 'treaty', 'armistice', 'surrender']);

// How an event draws on the Military layer (P5, P6): the mark's form and the sides that color it.
//   form: 'diamond' (fill = victor's line color; outline rust on paper when inconclusive; split when both claimed),
//         'triangle' (navy: declarations, treaties, armistices, surrenders), 'capital' (moss circle, the captor's ring),
//         'circle' (a landing), or null (forts, headquarters and massacres wait for their marks).
//   ring: the side whose ring surrounds the mark (a siege's besieger, a place's captor), or null.
export function eventLook(r, war) {
  const sideOf = (id) => (war?.sides ?? []).find((s) => s.id === id) ?? null;
  const o = parseOutcome(r.outcome);
  const base = { id: r.id, value: r.value, outcome: o, winner: null, claimed: [], ring: null, form: null };
  if (DIAMONDS.has(r.value)) {
    base.form = 'diamond';
    if (o?.kind === 'won') base.winner = sideOf(o.sides[0]);
    if (o?.kind === 'claimed') base.claimed = o.sides.map(sideOf).filter(Boolean);
    if (r.value === 'siege') base.ring = sideOf(r.side) ?? null;
  } else if (TRIANGLES.has(r.value)) base.form = 'triangle';
  else if (r.value === 'capture') { base.form = 'capital'; base.ring = sideOf(r.side); }
  else if (r.value === 'landing') base.form = 'circle';
  return base;
}

// The sequence (P8): which events carry a numeral, in date order. spec: true (every event), false (none), or an array
// of record ids (those, in that order). → the events with `seq` set (others unchanged).
export function sequenceFor(events, spec = true) {
  if (spec === false || spec === 'false') return events.map((r) => ({ ...r, seq: null }));
  if (Array.isArray(spec)) {
    const order = new Map(spec.map((id, i) => [id, i + 1]));
    return events.map((r) => ({ ...r, seq: order.get(r.id) ?? null }));
  }
  return events.map((r, i) => ({ ...r, seq: i + 1 }));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtWhen(w) {
  if (!w) return '';
  if (w.month == null) return String(w.year);
  if (w.day == null) return `${MONTHS[w.month - 1]} ${w.year}`;
  return `${w.day} ${MONTHS[w.month - 1]} ${w.year}`;
}
// "8 May 1846" · "3–9 May 1846" · "21–24 Sep 1846" · "Feb 1847 – Mar 1847"
export function eventDate(r) {
  const a = r.startWhen, b = r.endWhen;
  if (!a) return '';
  if (!b || (a.year === b.year && a.month === b.month && a.day === b.day)) return fmtWhen(a);
  if (a.year === b.year && a.month === b.month && a.day != null && b.day != null) return `${a.day}–${b.day} ${MONTHS[a.month - 1]} ${a.year}`;
  return `${fmtWhen(a)} – ${fmtWhen(b)}`;
}

export function outcomeText(r, war) {
  const l = eventLook(r, war);
  if (l.winner) return `won by ${l.winner.label}`;
  if (l.claimed.length === 2) return 'both sides claimed victory';
  if (l.outcome?.kind === 'inconclusive') return 'inconclusive';
  if (r.value === 'capture' && l.ring) return `taken by ${l.ring.label}`;
  if (r.value === 'declaration') return 'declaration of war';
  if (r.value === 'treaty') return 'treaty';
  if (r.value === 'armistice') return 'armistice';
  return '';
}

// The course of the war, as the margin list prints it: numbered events only, in sequence order.
export function courseList(events, war) {
  return events.filter((r) => r.seq != null).sort((a, b) => a.seq - b.seq)
    .map((r) => ({ n: r.seq, record: r.id, date: eventDate(r), label: r.label, outcome: outcomeText(r, war), value: r.value }));
}

// Legend rows for the events on the sheet (grammar §5 kept: the diamond stays; its fill is the victor's color).
// sides: { id → { color } } from the war; colors: (colorKey) → { line } (src/military/sides.js or the tokens).
export function eventLegend(events, war, colorOf) {
  const rows = [];
  const looks = events.map((r) => eventLook(r, war));
  const winners = [...new Map(looks.filter((l) => l.winner).map((l) => [l.winner.id, l.winner])).values()];
  for (const s of winners) rows.push({ swatch: 'shape', shape: 'rust-diamond', fill: colorOf(s.color).line, label: `Battle won by ${s.label}`, role: 'event' });
  const claimed = looks.find((l) => l.claimed.length === 2);
  if (claimed) rows.push({ swatch: 'shape', shape: 'rust-diamond', fill: colorOf(claimed.claimed[0].color).line, half: colorOf(claimed.claimed[1].color).line, label: 'Both sides claimed victory', role: 'event' });
  if (looks.some((l) => l.form === 'diamond' && l.outcome?.kind === 'inconclusive')) rows.push({ swatch: 'shape', shape: 'rust-diamond', outline: true, label: 'Inconclusive', role: 'event' });
  if (looks.some((l) => l.form === 'diamond' && !l.outcome)) rows.push({ swatch: 'shape', shape: 'rust-diamond', label: 'Battle, outcome not recorded', role: 'event' });
  const siege = looks.find((l) => l.value === 'siege');
  if (siege) rows.push({ swatch: 'shape', shape: 'rust-diamond', fill: siege.winner ? colorOf(siege.winner.color).line : null, ring: siege.ring ? colorOf(siege.ring.color).line : '#1F2A44', label: `Siege (ring: the besieger)`, role: 'event' });
  if (looks.some((l) => l.form === 'triangle')) rows.push({ swatch: 'shape', shape: 'navy-triangle', label: 'Declaration of war, treaty', role: 'event' });
  const cap = looks.find((l) => l.form === 'capital');
  if (cap) rows.push({ swatch: 'shape', shape: 'moss-circle', ring: cap.ring ? colorOf(cap.ring.color).line : '#1F2A44', label: 'Place taken (ring: the captor)', role: 'event' });
  if (events.some((r) => r.seq != null)) rows.push({ swatch: 'numeral', label: 'The course of the war: see the list', role: 'event' });
  return rows;
}

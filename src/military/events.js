// Parchment — the Military layer: events (brief of 2026-11-09, §1 and P5, P8; milestone 2). Pure, no DOM.
// An event is a `point` row under `tracker: military`: battle, siege, naval-battle, raid, landing, surrender,
// capture, declaration, treaty, armistice, massacre, fort, headquarters; with `war`, optionally `side` (the besieger
// of a siege, the captor of a place, the side that declared) and `outcome`: `won:<side>`, `inconclusive` or
// `claimed:<side>;<side>`. Who won is a claim from the row's source, never inferred.

const first = (w) => (w ? w.year * 10000 + (w.month ?? 1) * 100 + (w.day ?? 1) : 0);
const last = (w) => (w ? w.year * 10000 + (w.month ?? 12) * 100 + (w.day ?? 31) : 99999999);
export const eventFirst = (r) => first(r.startWhen);
export const eventLast = (r) => last(r.endWhen);

// (a battle frame's position and terrain points are not events: no diamond, no numeral, no place on the strip)
export const NOT_EVENTS = new Set(['position', 'terrain']);
export const eventsOf = (records, warId) => (records ?? []).filter((r) => r.tracker === 'military' && r.kind === 'point' && r.war === warId && !NOT_EVENTS.has(r.value) && !r.battle);

// Battle frames (milestone 9). A battle's rows name it in `battle` and the phase they belong to in `phase` (a
// number, or a range 3-5); a row with no phase stands through the whole battle.
export function parsePhase(s) {
  const m = /^(\d+)(?:-(\d+))?$/.exec(String(s ?? '').trim());
  return m ? { from: Number(m[1]), to: Number(m[2] ?? m[1]) } : null;
}
export const phaseCovers = (row, n) => { const p = parsePhase(row.phase); return !p || (p.from <= n && n >= p.from && n <= p.to); };
export const phaseFrom = (row) => parsePhase(row.phase)?.from ?? 1;
export const battleRows = (records, battleId) => (records ?? []).filter((r) => r.tracker === 'military' && r.battle === battleId);
export function battleById(vocab, id) {
  for (const w of vocab?.wars ?? []) { const b = (w.battles ?? []).find((x) => x.id === id); if (b) return { war: w, battle: b }; }
  return null;
}
// Where each force stands in phase n: its latest position row begun by n in full; its earlier positions faded (P4),
// earliest lightest. The shape is forcePositions': { force, side, at, since, moving, row, earlier }.
export function battlePositions(forces, rows, n, phases = []) {
  const out = [];
  const label = (k) => phases.find((p) => p.n === k)?.at ?? `phase ${k}`;
  for (const f of forces) {
    const mine = rows.filter((r) => r.kind === 'point' && r.value === 'position' && r.force === f.id && r.lon != null && phaseFrom(r) <= n).sort((a, b) => phaseFrom(a) - phaseFrom(b));
    if (!mine.length) continue;
    const now = mine[mine.length - 1];
    const earlier = mine.slice(0, -1).filter((r) => r.lon !== now.lon || r.lat !== now.lat).map((r) => ({ at: [r.lon, r.lat], label: r.label, date: label(phaseFrom(r)) }));
    out.push({ force: f, side: f.side, at: [now.lon, now.lat], since: now.start, moving: false, row: now, earlier, phase: phaseFrom(now) });
  }
  return out;
}
// The marches and attacks of phase n (arrows whose phase range covers n), and the lines of battle standing in it.
export const battleMoves = (rows, n) => rows.filter((r) => (r.kind === 'arrow' || r.kind === 'path') && r.coords && phaseCovers(r, n));
export const battleTerrain = (rows) => rows.filter((r) => r.kind === 'point' && r.value === 'terrain' && r.lon != null);

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

// Movements (milestone 3): `arrow` rows under the tracker. On a date the map shows the movements that have begun by
// it and had not ended before `since` (the order's `from`, else the war's start): "situation at date, movements
// since from" (the West Point convention, brief §6). Each is marked with its side's color key and label for the
// route renderer (src/render/routes.js routeStyle), and with its force id for the strip's bars.
export const movementsOf = (records, warId) => (records ?? []).filter((r) => r.tracker === 'military' && (r.kind === 'arrow' || r.kind === 'path') && r.war === warId);
export function movementsSince(moves, since, date) {
  return moves.filter((r) => eventFirst(r) <= date && eventLast(r) >= since).sort((a, b) => eventFirst(a) - eventFirst(b) || a.id.localeCompare(b.id));
}
export function withSides(rows, war) {
  return rows.map((r) => { const s = (war?.sides ?? []).find((x) => x.id === r.side); return s ? { ...r, sideColor: s.color, sideLabel: s.label } : { ...r }; });
}
// The forces on the strip: one bar per `force` id (else per label), spanning its movements, in its side's color.
export function forceBars(moves) {
  const by = new Map();
  for (const r of moves) {
    const k = r.force || r.label;
    const b = by.get(k) ?? { force: k, label: r.label, side: r.side, sideColor: r.sideColor, first: eventFirst(r), last: eventLast(r) };
    b.first = Math.min(b.first, eventFirst(r)); b.last = Math.max(b.last, eventLast(r));
    by.set(k, b);
  }
  return [...by.values()].sort((a, b) => a.first - b.first);
}

// Forces (milestone 5). Where a force stands on a date follows from its movements (stepped, not morphed; brief §5):
// at the end of its latest movement that has ended by the date; while a movement is under way and none has ended,
// at that movement's start (its last documented place); nowhere before its first movement begins. Its earlier
// stands (the ends of earlier movements) are kept for P4, each with the date it was reached.
export function forcePositions(forces, moves, date) {
  const out = [];
  for (const f of forces ?? []) {
    const mine = moves.filter((m) => m.force === f.id && m.coords?.length).sort((a, b) => eventFirst(a) - eventFirst(b));
    if (!mine.length) continue;
    const done = mine.filter((m) => eventLast(m) <= date);
    const going = mine.find((m) => eventFirst(m) <= date && eventLast(m) > date);
    let at = null, since = null, moving = null;
    if (done.length) { const last = done[done.length - 1]; at = last.coords[last.coords.length - 1]; since = eventLast(last); }
    if (going) { if (!done.length) { at = going.coords[0]; since = eventFirst(going); } moving = going; }
    if (!at) continue;
    const earlier = done.slice(0, -1).map((m) => ({ at: m.coords[m.coords.length - 1], date: eventLast(m), label: m.label }));
    const row = going ?? done[done.length - 1];
    out.push({ force: f, side: f.side, at, since, moving: !!moving, row, earlier });
  }
  return out;
}

// The equipment a force shows on a date: the row's own `tech` if it has one, else the force's first key; refused,
// with a reason, when the catalog's years do not cover the date (no tank in 1846). → { key, ok, why }
export function techFor(force, row, tech, date) {
  const key = (row?.tech || '').trim() || force?.tech?.[0] || null;
  if (!key) return { key: null, ok: false, why: null };
  const item = tech?.items?.[key];
  if (!item) return { key, ok: false, why: `"${key}" is not in the tech catalog (data/tech.json)` };
  const year = Math.floor(date / 10000);
  if (item.in_use && (year < item.in_use.from || year > item.in_use.to)) return { key, ok: false, why: `${key} was in use ${item.in_use.from}–${item.in_use.to} by the catalog, not in ${year}: the plain glyph draws` };
  return { key, ok: true, why: null, item };
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
  else if (r.value === 'fort') { base.form = 'fort'; base.ring = r.captor ? sideOf(r.captor) : null; } // P6: one navy mark; a ring in a captor's color
  else if (r.value === 'headquarters') { base.form = 'hq'; base.ring = sideOf(r.side); }
  else if (r.value === 'massacre') base.form = 'massacre';
  else if (r.value === 'terrain') base.form = 'terrain'; // a hill, ridge or place the sources name: a hollow dot and its name
  else if (r.value === 'position') base.form = 'position'; // a force's stand in a battle phase: the force mark alone
 // provisional: a navy ring with a rust dot (the sheet's first candidate) until the owner chooses
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
    .map((r) => ({ n: r.seq, record: r.id, date: eventDate(r), label: r.label, outcome: outcomeText(r, war), value: r.value, off: !!r.offSheet }));
}

// The path data of a game-icons file as the catalog keeps it (the square already stripped): every path's d, joined.
export function svgPath(svg) {
  const ds = [...String(svg).matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  return { d: ds.join(' '), viewBox: /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 512 512' };
}

// Legend rows for the forces on the sheet: the frame, each equipment icon in use (with its years), earlier stands.
export function forceLegend(positions, checks, tech) {
  if (!positions.length) return [];
  const rows = [{ swatch: 'force', label: 'A force: its type and size (XX a division)', role: 'force' }];
  const used = new Map();
  for (const p of positions) { const c = checks[p.force.id]; if (c?.ok && !used.has(c.key)) used.set(c.key, c.item); }
  for (const [key, item] of used) rows.push({ swatch: 'icon', icon: key, label: `${item.depicts}${item.in_use ? `, ${item.in_use.from < 0 ? '' : item.in_use.from}–${item.in_use.to > 2050 ? 'today' : item.in_use.to}` : ''}`, role: 'equipment' });
  if (positions.some((p) => p.earlier.length)) rows.push({ swatch: 'fade', label: 'Earlier stands: lighter, earliest lightest', role: 'force' });
  return rows;
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
  if (looks.some((l) => l.form === 'fort')) rows.push({ swatch: 'icon', icon: 'fort', label: 'Fort (one mark in every era)', role: 'event' });
  if (looks.some((l) => l.form === 'hq')) rows.push({ swatch: 'hq', label: 'Headquarters, dated', role: 'event' });
  if (looks.some((l) => l.form === 'massacre')) rows.push({ swatch: 'massacre', label: 'Killing of prisoners or civilians (row under review)', role: 'event' });
  if (looks.some((l) => l.form === 'terrain')) rows.push({ swatch: 'terrain', label: 'Hill, ridge or place the sources name', role: 'event' });
  if (events.some((r) => r.seq != null)) rows.push({ swatch: 'numeral', label: 'The course of the war: see the list', role: 'event' });
  return rows;
}

// Parchment — North America stage: the Electoral College tracker's model (no drawing; the tests load it alone).
// Votes are the National Archives' (data/us/electoral.json, scripts/fetch-electoral.mjs); parties and fills are
// authored in src/us/parties.json. A date shows the latest election held by then: from 1848 its Election Day,
// before that the day its electors voted (the rule is in the data file's `_rules`).

import { aliveNB } from './model.js';

export const electionAt = (ec, date) => {
  let out = null;
  for (const e of ec?.elections ?? []) if (e.day <= date) out = e;
  return out;
};
export const electionDays = (ec) => (ec?.elections ?? []).map((e) => e.day);

export function partyOf(c, year, parties) {
  const rule = parties.candidates.find((r) => r.name === c.name && (!r.year || r.year === year));
  return rule?.party ?? parties.codes[c.party_nara] ?? null;
}
// "Martin Van Buren" → "Van Buren", "Robert M. La Follette" → "La Follette", "Albert Gore, Jr." → "Gore"
export function surname(name) {
  const t = name.replace(/,? (Jr|Sr)\.?$/, '').trim().split(' ');
  return /^(La|Van|De|Di)$/.test(t.at(-2) ?? '') ? t.slice(-2).join(' ') : t.at(-1);
}

// A state's plurality candidate. A tie within one party goes to the larger national total (Jefferson and Burr, one
// ticket, tied in every state that voted for them in 1800); a tie between parties has no winner (Maryland, 1800:
// five electors for each side), and the state is left unfilled and named in the legend.
function winnerOf(e, s, parties) {
  const ranked = e.candidates.filter((c) => s.votes[c.id] > 0).sort((a, b) => s.votes[b.id] - s.votes[a.id]);
  const [top] = ranked;
  if (!top) return null;
  // (only two known, different parties make a tie: before 1804 every elector also gave a second vote, so Washington
  // and a second name, or two men of one ticket, are level in most states without dividing them)
  const level = ranked.filter((c) => s.votes[c.id] === s.votes[top.id]);
  const known = new Set(level.map((c) => partyOf(c, e.year, parties)).filter((p) => p && p !== 'none'));
  return known.size >= 2 ? 'tie' : top;
}

// The result for a Newberry polygon: its state's; or, for a territory whose electors voted before Newberry's day of
// statehood (Indiana 1816, Missouri 1820, Michigan 1836, all counted by Congress), the state's of that name.
export function resultFor(L, p) {
  if (!L) return null;
  if (p.type === 'State' || p.type === 'District of Columbia') return L.states.get(p.name) ?? null;
  if (p.type === 'Territory') return L.states.get(p.name.replace(/ Territory$/, '')) ?? null;
  return null;
}

// A Newberry polygon's fill under this tracker: its state's plurality candidate; territories and the District
// (before 1964) have no electors and stay muted, as does a state that cast no electoral vote.
export function electoralLook(L, it) {
  const r = resultFor(L, it.p);
  if (!r?.look) return { fill: null, label: null };
  return r.look.fill ? { fill: r.look.fill, label: r.winner.name, cat: r.winner.id } : { pattern: 'hatch', label: r.winner.name };
}
// Did a state alive on the day cast no electoral vote (not yet in the Union's count, or not certified)?
export const someAbstained = (L, nbAlive) => nbAlive.some((it) => it.p.type === 'State' && !L?.states.get(it.p.name)?.look && !L?.states.get(it.p.name)?.tie);

// The look of one election: each candidate who carried a state takes a fill (their party's, else the next free;
// a fifth carrier takes the hatch); each state its plurality candidate and its badge ("23", or "4+3" when its
// electors divided; "(9)" when Congress disputed them).
export function electionLooks(e, parties) {
  const carried = new Map();
  for (const s of e.states) { const w = winnerOf(e, s, parties); if (w && w !== 'tie') carried.set(w.id, (carried.get(w.id) ?? 0) + 1); }
  const carriers = e.candidates.filter((c) => carried.has(c.id));
  const taken = new Set();
  const looks = new Map();
  for (const c of carriers) {
    const party = partyOf(c, e.year, parties);
    const pref = parties.parties[party]?.fill;
    let fill = null;
    if (taken.size < 4) fill = pref && !taken.has(pref) ? pref : parties.free.find((k) => !taken.has(k));
    if (fill) taken.add(fill);
    looks.set(c.id, { ...(fill ? { fill } : { pattern: 'hatch' }), party, candidate: c });
  }
  const states = new Map();
  for (const s of e.states) {
    const w = winnerOf(e, s, parties);
    const tie = w === 'tie';
    const parts = Object.values(s.votes).filter((n) => n > 0).sort((a, b) => b - a);
    let badge = e.rule === 'two-votes' ? String(s.electors) : parts.join('+');
    if (s.contested) badge = `(${badge})`;
    states.set(s.name, { s, winner: tie ? null : w, tie, look: w && !tie ? looks.get(w.id) : null, badge: w ? badge : '' });
  }
  const ties = [...states.values()].filter((r) => r.tie).map((r) => r.s.name);
  const others = e.candidates.filter((c) => !carried.has(c.id)).reduce((a, c) => a + c.ev, 0);
  return { election: e, looks, states, carriers, others, ties, parties };
}

// Legend rows: a fill per candidate who carried a state, with party and electoral votes; the rest; the rule.
export function electoralLegend(L, { abstained = false } = {}) {
  const parties = L.parties;
  const e = L.election;
  const rows = L.carriers.map((c) => {
    const look = L.looks.get(c.id);
    const p = parties.parties[look.party];
    return { swatch: 'fill', key: look.fill ?? 'hatch', label: `${surname(c.name)}${p ? `, ${p.short ?? p.label}` : ''} · ${c.ev}` };
  });
  // Before 1804 a runner-up carried no state of their own but held many second votes (Burr's 73 in 1800): named.
  let rest = L.others;
  if (e.rule === 'two-votes') {
    for (const c of e.candidates.filter((k) => !L.looks.has(k.id) && k.ev >= e.total * 0.2)) {
      const p = parties.parties[partyOf(c, e.year, parties)];
      rows.push({ swatch: 'none', label: `${surname(c.name)}${p ? `, ${p.short ?? p.label}` : ''} · ${c.ev}` });
      rest -= c.ev;
    }
  }
  if (rest) rows.push({ swatch: 'none', label: `Others · ${rest}` });
  if (L.ties.length) rows.push({ swatch: 'none', label: `Divided equally: ${L.ties.join(', ')}` });
  if (abstained) rows.push({ swatch: 'fill', key: 'novote', label: 'Cast no electoral vote' });
  rows.push({ swatch: 'none', label: e.rule === 'two-votes' ? `${e.total} electors, two votes each` : `${e.total} votes · ${e.majority} to win` });
  return { title: `Election of ${e.year}`, legend: rows };
}

// A state's source-card rows: its electors and how they voted, in the Archives' words where it has a note.
export function electoralCard(L, stateName) {
  const r = L?.states.get(stateName);
  const e = L?.election;
  if (!e) return null;
  if (!r) return { head: `Election of ${e.year}`, lines: ['Cast no electoral vote.'], url: e.url };
  const lines = [];
  const votes = e.candidates.filter((c) => r.s.votes[c.id]).map((c) => `${c.name} ${r.s.votes[c.id]}`);
  lines.push(r.s.absent ? 'Cast no electoral vote.' : `${r.s.electors} electors${e.rule === 'two-votes' ? ', two votes each' : ''}: ${votes.join(', ')}${r.s.uncounted ? `; ${r.s.uncounted} not counted` : ''}.`);
  if (r.s.contested) lines.push('Contested: Congress did not agree whether to count these votes.');
  if (r.s.note) lines.push(r.s.note);
  if (r.s.erratum) lines.push(`Corrected here: ${r.s.erratum}`);
  return { head: `Election of ${e.year}`, lines, url: e.url };
}

// ---------------------------------------------------------------- two elections (the Diff view)
// Which states changed party between two elections. A state is one unit by name, whatever Newberry's version of its
// borders (a territory whose electors voted, Indiana in 1816, counts as its state). Each side is the state's winning
// party, "divided" for a tie between parties, or no vote (a state that cast none; the District before 1964 and the
// territories are not units at all). The shape is diffUS's (src/us/diff.js), so the Diff renderer draws it as it is:
//   changed  — voted on both days, for different parties (focus color, from the later map);
//   appeared — voted on the later day only: a new state's first vote, or a state voting again (focus color);
//   vanished — voted on the earlier day only (1864: the Confederacy) (rust hatch, from the earlier map);
//   persisted — the same party, or no vote on either day (muted).
export function electionDiff(data, LA, LB) {
  const partyLabel = (L, k) => (k === 'tie' ? 'Divided' : L.parties.parties[k]?.short ?? L.parties.parties[k]?.label ?? 'Unlabelled');
  const sideOf = (L) => {
    const m = new Map();
    for (const it of aliveNB(data, L.election.day)) {
      const r = resultFor(L, it.p);
      if (it.p.type === 'Territory' ? !r : !(it.p.type === 'State' || (it.p.type === 'District of Columbia' && r))) continue;
      const name = it.p.type === 'Territory' ? it.p.name.replace(/ Territory$/, '') : it.p.name;
      const voted = !!(r && (r.look || r.tie));
      const party = r?.tie ? 'tie' : r?.look?.party ?? null;
      const u = m.get(name) ?? { name, items: [], voted, party };
      u.items.push(it);
      m.set(name, u);
    }
    return m;
  };
  const A = sideOf(LA), B = sideOf(LB);
  const out = { trackerId: 'electoral', a: LA.election.day, b: LB.election.day, appeared: [], changed: [], vanished: [], persisted: [], small: { appeared: 0, changed: 0, vanished: 0, persisted: 0 }, us: null, years: [LA.election.year, LB.election.year] };
  const unit = (name, a, b, extra = {}) => ({ key: `st:${name}`, label: name, power: b?.party ?? a?.party ?? null, area: 1, visible: true, a: a?.items ?? [], b: b?.items ?? [], ...extra });
  for (const [name, b] of B) {
    const a = A.get(name);
    if (b.voted && a?.voted && a.party !== b.party) out.changed.push(unit(name, a, b, { from: a.party, to: b.party, note: `${partyLabel(LA, a.party)} → ${partyLabel(LB, b.party)}` }));
    else if (b.voted && !a?.voted) out.appeared.push(unit(name, a, b, { again: !!a, to: b.party }));
    else if (!b.voted && a?.voted) out.vanished.push(unit(name, a, b));
    else out.persisted.push(unit(name, a, b));
  }
  for (const [name, a] of A) if (!B.has(name) && a.voted) out.vanished.push(unit(name, a, null));
  for (const k of ['appeared', 'changed', 'vanished', 'persisted']) out[k].sort((p, q) => p.label.localeCompare(q.label));
  return out;
}

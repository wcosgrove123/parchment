// Parchment — the Military layer, play (brief §5; the owner's play run of 2026-11-09). Pure: the film's clock, its
// chapters and frames; the two war records added for the run; the massacre mark's provisional look.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filmById, resolveFilm, frameAt, chapterOn, secondsAt, frameList, paceDays, dayNumber, dateInt, describeFilm } from '../src/military/play.js';
import { validateRecords, resolveRecords } from '../src/data/records.js';
import { warById, membersOf } from '../src/military/wars.js';
import { eventsOf, eventsUpTo, movementsOf, eventLook, eventLegend, sequenceFor } from '../src/military/events.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vocab = JSON.parse(read('data/vocab.json'));
const gazetteer = JSON.parse(read('data/gazetteer.json'));
const checked = validateRecords(read('data/military.csv'), vocab);
const resolved = resolveRecords(checked.records, gazetteer).records;

test('paces and days: words to map days per second, dates to day numbers and back', () => {
  assert.deepEqual([paceDays('week'), paceDays('quarter'), paceDays('half-year'), paceDays(10), paceDays('10'), paceDays('nonsense')], [7, 91, 182, 10, 10, 7]);
  assert.equal(dateInt(dayNumber(18360421)), 18360421);
  assert.equal(dateInt(dayNumber(18360421) + 7), 18360428);
  assert.equal(dateInt(dayNumber(18351231) + 1), 18360101);
});

test('the film of the Texas question: five chapters in order, each with a war of the record, about four and a half minutes', () => {
  const film = filmById(vocab, 'texas-1821-1854');
  assert.ok(film, 'the film is in vocab.json');
  assert.equal(film.chapters.length, 5);
  assert.deepEqual(film.chapters.map((c) => c.war), ['texas-revolution', 'texas-revolution', 'texas-republic-mexico', 'mexican-american-war', 'mexican-american-war']);
  assert.deepEqual(film.chapters.map((c) => c.frame), ['texas', 'texas', 'texas', 'mexico-war', 'mexico-war'], 'the Texas chapters on the Texas frame, the war on its theater');
  const focuses = JSON.parse(read('src/focuses.json')).focuses.map((f) => f.id);
  for (const c of film.chapters) assert.ok(focuses.includes(c.frame), `${c.frame} is a focus`);
  for (const c of film.chapters) assert.ok(warById(vocab, c.war), `${c.war} is a war of the record`);
  for (let i = 1; i < film.chapters.length; i++) assert.ok(film.chapters[i].fromInt > film.chapters[i - 1].toInt, 'chapters follow each other without overlap');
  assert.deepEqual([film.start, film.end], [18210928, 18540630]);
  assert.ok(film.seconds > 200 && film.seconds < 330, `${film.seconds} s`);
  assert.match(describeFilm(film), /5 chapters, \d min \d\d s/);
  assert.equal(filmById(vocab, 'no-such-film'), null);
});

test('the clock: a chapter at a week per second moves seven days each second; the date never slides past a chapter\'s end', () => {
  const film = filmById(vocab, 'texas-1821-1854');
  const rev = film.chapters[1];
  assert.equal(frameAt(film, rev.startsAt).date, 18351002, 'the revolution chapter opens at Gonzales');
  assert.equal(frameAt(film, rev.startsAt + 1).date, 18351009);
  assert.equal(frameAt(film, rev.startsAt + 10).date, 18351211, 'ten seconds in: the day after Béxar fell');
  const lastOfRev = frameAt(film, rev.startsAt + rev.seconds - 0.001);
  assert.equal(lastOfRev.chapter.n, 2);
  assert.ok(lastOfRev.date <= 18360514);
  assert.equal(frameAt(film, rev.startsAt + rev.seconds + 0.001).chapter.n, 3, 'then the Republic chapter');
  const end = frameAt(film, film.seconds + 5);
  assert.deepEqual([end.done, end.date, end.chapter.n], [true, 18540630, 5]);
  assert.equal(frameAt(film, -3).date, 18210928, 'before the start: the first day');
  // a date back to the clock and forward again
  for (const d of [18300601, 18360306, 18420918, 18470223, 18531231]) {
    const s = secondsAt(film, d);
    const back = frameAt(film, s).date;
    assert.ok(Math.abs(dayNumber(back) - dayNumber(d)) <= 1, `${d} → ${s.toFixed(2)} s → ${back}`);
    assert.equal(chapterOn(film, d).n, frameAt(film, s).chapter.n);
  }
});

test('the frames for export: distinct dates in order, held frames counted, the whole film covered', () => {
  const film = filmById(vocab, 'texas-1821-1854');
  const frames = frameList(film, 6);
  assert.ok(frames.length > 800 && frames.length < 2000, `${frames.length} frames`);
  for (let i = 1; i < frames.length; i++) assert.ok(frames[i].date > frames[i - 1].date || frames[i].chapter.n > frames[i - 1].chapter.n, 'dates only move forward');
  assert.equal(frames[0].date, film.start);
  assert.equal(frames.at(-1).date, film.end);
  assert.equal(frames.reduce((a, f) => a + f.hold, 0), Math.ceil(film.seconds * 6) + 1, 'every tick of the clock is some frame\'s hold');
  const fast = frameList(resolveFilm({ id: 'x', chapters: [{ title: 'a', from: '1840', to: '1849', pace: 'year', war: 'texas-republic-mexico' }] }), 2);
  assert.ok(fast.every((f) => f.hold === 1) && fast.length >= 18 && fast.length <= 22, `a year per second at two frames a second: a frame every half year, none held (${fast.length})`);
});

test('the two records added for the run: the Texas Revolution and the Republic years, their members, events, forces and movements', () => {
  assert.deepEqual(checked.problems, [], JSON.stringify(checked.problems));
  const rev = warById(vocab, 'texas-revolution'), rep = warById(vocab, 'texas-republic-mexico');
  assert.deepEqual(rev.sides.map((s) => `${s.id}:${s.color}`), ['texas:c', 'mexico:b'], 'Texas teal, Mexico plum, as across the run');
  assert.deepEqual(rep.sides.map((s) => `${s.id}:${s.color}`), ['texas:c', 'mexico:b', 'us:a']);
  assert.equal(membersOf(checked.records.filter((r) => r.kind === 'region'), rev.id).length, 2);
  assert.equal(membersOf(checked.records.filter((r) => r.kind === 'region'), rep.id).length, 3);
  const revEvents = eventsOf(resolved.filter((r) => r.kind === 'point'), rev.id);
  assert.equal(revEvents.length, 13);
  assert.equal(eventsUpTo(revEvents, 18351001).length, 4, 'four causes before Gonzales');
  assert.ok(revEvents.every((r) => r.lon != null && r.lat != null && r.source && /Handbook of Texas|Hardin/.test(r.source)));
  const moves = movementsOf(resolved, rev.id);
  assert.equal(moves.length, 6);
  assert.ok(moves.every((m) => m.coords && rev.forces.some((f) => f.id === m.force)), 'every movement names a force of the record and has coordinates');
  assert.deepEqual(moves.filter((m) => m.value === 'retreat').map((m) => m.force).sort(), ['cos', 'filisola', 'houston']);
  const repEvents = eventsOf(resolved.filter((r) => r.kind === 'point'), rep.id);
  assert.equal(repEvents.length, 9);
  assert.ok(repEvents.every((r) => rep.sides.some((s) => s.id === r.side) || !r.side));
  // the aftermath of the war with Mexico
  const mx = eventsOf(resolved.filter((r) => r.kind === 'point'), 'mexican-american-war');
  const during = new Set(eventsUpTo(mx, 18480202).map((r) => r.id));
  assert.deepEqual(mx.filter((r) => !during.has(r.id)).map((r) => r.id), ['test-mx-ev-ratified', 'test-mx-ev-compromise-1850', 'test-mx-ev-gadsden']);
});

test('the massacre mark is provisional: a form of its own, a legend row that says the row is under review, no numeral lost', () => {
  const rev = warById(vocab, 'texas-revolution');
  const goliad = resolved.find((r) => r.id === 'test-tr-ev-goliad');
  assert.equal(goliad.value, 'massacre');
  assert.equal(eventLook(goliad, rev).form, 'massacre');
  assert.equal(vocab.trackers.military.point_shapes.massacre, 'steel-circle');
  const rows = eventLegend(sequenceFor(eventsUpTo(eventsOf(resolved, rev.id), 18360421), true), rev, (c) => ({ line: c }));
  assert.ok(rows.some((r) => r.swatch === 'massacre' && /under review/.test(r.label)));
  assert.match(goliad.qc_note, /co-teachers review/);
});

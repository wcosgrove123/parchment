// Parchment — the Military layer, play (brief §5; the owner's play run of 2026-11-09).
// Pure: a film is a list of chapters, each a span of dates, the war whose record is shown, and a pace in map days
// per real second. These functions turn elapsed seconds into a date and back, so the page and the film script
// (scripts/film.mjs) step through the same frames: stepped, never slid (grammar §1.5).
import { toInt } from './wars.js';

export const PACES = { day: 1, week: 7, fortnight: 14, month: 30, quarter: 91, 'half-year': 182, year: 365 };

// Days per second for a pace word or a number; unknown words fall back to a week.
export function paceDays(pace) {
  if (typeof pace === 'number' && pace > 0) return pace;
  const n = Number(pace);
  if (Number.isFinite(n) && n > 0) return n;
  return PACES[String(pace ?? '').trim()] ?? PACES.week;
}

// Dates as day numbers (days since 1970-01-01, UTC), from the record's YYYYMMDD integers, and back.
export const dayNumber = (d) => Date.UTC(Math.floor(d / 10000), Math.floor((d % 10000) / 100) - 1, d % 100) / 864e5;
export function dateInt(day) {
  const t = new Date(Math.round(day) * 864e5);
  return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
}

// A film by id from vocab.json's films, with its chapters resolved: day numbers, days per second, seconds each
// chapter runs, and where each starts on the film's clock.
export function filmById(vocab, id) {
  const f = (vocab?.films ?? []).find((x) => x.id === id);
  return f ? resolveFilm(f) : null;
}
export function resolveFilm(f) {
  let clock = 0;
  const chapters = (f.chapters ?? []).map((c, i) => {
    const from = dayNumber(toInt(c.from)), to = dayNumber(toInt(c.to, true));
    const dps = paceDays(c.pace);
    const seconds = Math.max(0, (to - from) / dps);
    const ch = { ...c, n: i + 1, fromDay: from, toDay: to, fromInt: toInt(c.from), toInt: toInt(c.to, true), daysPerSecond: dps, seconds, startsAt: clock };
    clock += seconds;
    return ch;
  });
  return { ...f, chapters, seconds: clock, start: chapters[0]?.fromInt ?? null, end: chapters.at(-1)?.toInt ?? null };
}

// Where the film is at a moment of its clock: the chapter and the date (the chapter's last day once it is past).
export function frameAt(film, seconds) {
  const chapters = film.chapters;
  if (!chapters.length) return null;
  const s = Math.max(0, seconds);
  let ch = chapters.find((c) => s < c.startsAt + c.seconds) ?? chapters.at(-1);
  const into = Math.min(ch.seconds, s - ch.startsAt);
  const day = Math.min(ch.toDay, ch.fromDay + into * ch.daysPerSecond);
  return { chapter: ch, date: dateInt(day), done: s >= film.seconds, progress: film.seconds ? Math.min(1, s / film.seconds) : 1 };
}

// The chapter a date falls in (the first whose span holds it; before the film, the first; after, the last).
export function chapterOn(film, date) {
  const chapters = film.chapters;
  return chapters.find((c) => date >= c.fromInt && date <= c.toInt) ?? (date < (chapters[0]?.fromInt ?? 0) ? chapters[0] : chapters.at(-1)) ?? null;
}

// The film's clock at a date (the start of that date's chapter plus its days at the chapter's pace).
export function secondsAt(film, date) {
  const ch = chapterOn(film, date);
  if (!ch) return 0;
  return ch.startsAt + Math.max(0, Math.min(ch.toDay, dayNumber(date)) - ch.fromDay) / ch.daysPerSecond;
}

// The frames of a film for export at `fps` pictures per second of film time: each frame's clock time, chapter and
// date, with runs of the same date collapsed to one frame that is held (hold = how many pictures it stands for).
export function frameList(film, fps = 6) {
  const out = [];
  const total = Math.ceil(film.seconds * fps);
  for (let i = 0; i <= total; i++) {
    const fr = frameAt(film, i / fps);
    if (!fr) break;
    const last = out.at(-1);
    if (last && last.date === fr.date && last.chapter.n === fr.chapter.n) { last.hold += 1; continue; }
    out.push({ index: out.length, at: i / fps, date: fr.date, chapter: fr.chapter, hold: 1 });
  }
  return out;
}

// One line about a film for the slip and the console.
export function describeFilm(film) {
  const mm = Math.floor(film.seconds / 60), ss = Math.round(film.seconds % 60);
  return `${film.title}: ${film.chapters.length} chapters, ${mm} min ${String(ss).padStart(2, '0')} s at the chapters' paces (${film.chapters.map((c) => `${c.title} · ${c.pace}`).join('; ')})`;
}

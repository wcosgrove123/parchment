// Parchment — which snapshot years a stage steps through
// data/calendar.json lists every snapshot. Most are shared by every stage; a snapshot with `stages` belongs only to
// the stages it names and their variants ("world" also covers "world-atlantic"), so a year added for one stage
// never changes another stage's map, its year buttons or where its records land.

export function stageYears(calendar, stage) {
  const mine = (s) => !s.stages || s.stages.some((id) => stage.id === id || stage.id.startsWith(`${id}-`));
  return calendar.snapshots.filter(mine).map((s) => s.year).sort((a, b) => a - b);
}

// A year that is not one of the stage's snapshots (?year=1522) opens the first snapshot at or after it, the rule a
// record's home snapshot follows; past the last snapshot, the last. Nothing given: the fallback.
export function snapYear(years, y, fallback = years[0]) {
  if (y == null || !Number.isFinite(y)) return fallback;
  if (years.includes(y)) return y;
  return years.find((s) => s >= y) ?? years[years.length - 1];
}

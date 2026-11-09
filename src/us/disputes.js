// Parchment — North America stage: land claimed by two polygons at once (the Toledo Strip, Greer County, the Nueces Strip...),
// computed by scripts/derive-us-disputes.mjs from Newberry's own overlapping polygons (data/us/nb-disputes.json).
// Hatched as a dispute (grammar §5) under every tracker but the Electoral College (where a hatch is a fifth
// candidate). No drawing here; the tests load it alone.

export const prepareDisputes = (fc) => (fc?.features ?? []).map((f) => ({ src: 'nbx', f, p: f.properties }));

// Newberry's dates are inclusive (the last day in force), so both ends count.
export const aliveDisputes = (data, d) => (data.nbx ?? []).filter((it) => it.p.s <= d && d <= it.p.e);

// Land a U.S. state (Newberry) and a Mexican state (OpenHistoricalMap) claimed on the same days: the Nueces Strip and
// the upper Rio Grande, 1845–1848, and the few others the same method finds (data/us/usmx-disputes.json, computed by
// scripts/derive-us-disputes.mjs). Each piece's last day is inclusive, as Newberry's.
export const prepareUSMX = (fc) => (fc?.features ?? []).map((f) => ({ src: 'usmx', f, p: f.properties }));
export const aliveUSMX = (data, d) => (data.usmx ?? []).filter((it) => it.p.s <= d && d <= it.p.e);

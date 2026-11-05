# Parchment — adding what the map shows (one page)

Parchment draws two kinds of things from one table: **states and regions** lit up on the base map, and **points**
such as battles, foundings and treaties. You add a row to the table; the map does the rest. No code, no files.

## Where the table lives

The table is a Google Sheet. Open it from the **Admin** page (the link in the map's toolbar) or from the Sheet
itself. The map reads the Sheet live, so a saved row appears the next time anyone opens the map.

## Adding a claim, step by step

1. **One row per claim.** Never edit the header row.
2. **id**: short, lowercase, words joined by hyphens, unique. `panipat-1526`, `safavid-isfahan-capital`.
3. **Pick from the dropdowns** wherever there is one: course, theme, tracker, kind, grade, certainty, value, review status.
4. **where**: for a state or region, pick an id from the `places` tab of the Sheet, such as `ottoman`, `songhai` or
   `mali`. The id has no year in it: the map finds that state in whichever year is shown, and it keeps working when the
   base maps change. For a point, type the Wikidata id of the place, such as `Q605321`. The Admin page's
   **Find a place** tab lets you search either kind and shows it on the map before you copy the id.
5. **start, end**: a year (`1526`), a month (`1526-04`) or a day (`1526-04-21`), as precise as the source is. The same
   value twice for a single moment. Negative years for BCE. Type them as text: if the Sheet turns `1526-04-21` into a
   date of its own, set the column's format to Plain text (Format → Number → Plain text) and the row will be read again.
6. **grade** is how sure the date is: `exact` shows `1526`, `circa` shows `~1526`, `uncertain` shows `1526?`.
7. **certainty** is how firm the territory is: `legal` draws a solid line, `approximate` a dashed line, `sphere` a soft
   edge with no line. Before 1648 most states are `approximate` or `sphere`.
8. **label**: what the map prints. Short.
9. **source**: the textbook page or framework line the claim rests on. Every row needs one.
10. Leave **lon** and **lat** blank. They are filled from the id.

## Reading the Admin page

- **Rows**: every row, with a dot. Green: reviewed and drawn. Gold: drawn, not yet reviewed. Red: skipped because
  something is wrong, or marked wrong. Blue: an example row, never drawn. Click a row to see it on the map.
- **Problems**: the skipped rows with the reason in plain words and the line number. Fix the row in the Sheet, then
  press Reload.
- **Coverage**: for the chosen unit, how many rows each topic has. Empty chips are the gaps.
- **Find a place**: search a state or region by name, or a point by name, see it on the map, copy the id.

## Adding a route or a voyage

A route is one row too. It can be a trade lane, a voyage, an army's advance or a migration. The map draws it as a
smooth line through the places you list, in the colour of what moved: steel blue for the sea, umber for land trade,
rust for armies and migrations.

1. **kind**: `path` for a route with no direction (goods went both ways), `arrow` for one that had a direction
   (a voyage, an army).
2. **tracker**: `routes`. **value**: what moved, from the dropdown: `sea-trade`, `land-trade`, `voyage`,
   `military`, `migration`.
3. **where**: the places the route passed, in order, each as a Wikidata id, joined by `>`:
   `Q16666>Q36081>Q61089>Q1142979` (Nanjing, Champa, Malacca, Calicut). Two places at least. To keep a sea route
   at sea, add a strait or a cape as a waypoint; a strait is a place with an id too (Bab-el-Mandeb is `Q83318`).
   To keep a caravan road on its corridor, add the caravan towns. Nothing is drawn by hand: the line is only the
   places you name, joined.
4. **certainty** is how firm the line is, drawn as for borders: `legal` solid (a documented lane or track),
   `approximate` dashed (the ports joined, not the ships' tracks), `sphere` dotted and faint (conjectured).
5. **start, end, grade, label, source** as for any row. The label is printed along the line, in its colour.
6. Leave **lon** and **lat** blank. Whoever keeps the site runs `npm run geocode`, which looks every id up once and
   keeps the answer in a list the map reads; a route with a place not yet looked up is listed on the Admin page's
   Problems tab as waiting, and draws as soon as it is.

**Places on a route** (ports of call, capitals, battles) are point rows with tracker `routes` and **value** `port`,
`capital`, `battle`, `siege`, `founding` or `treaty`. A port with one date (`1418` to `1418`) prints that date
beside its name; a port given the whole voyage's span prints its name alone, and the span stays in the hover.

The map places every name itself, so that no name sits on another, no line runs through a name, and nothing lands
on the legend or the cartouche. Capitals and the ends of routes are named first, then dated places, then the rest;
a map prints ten place names at most, and a name that fits nowhere near its dot gets a short leader line. On a small
screen the least important names are left off. If a name you expect is missing, the map had no room for it: fewer
rows on that map, or a shorter label, is the fix.

## Review

A second person sets **qc_status** to `ok`, `wrong` or `unsure`, signs **qc_by**, and may leave a **qc_note**.
Rows marked `wrong` stay in the table but stop drawing.

## Nothing you type can break the map

A row with a mistake is skipped and listed. The rest of the map draws as before.

## Opening it in class

The site works in any browser. For the classroom computer there is also `Parchment.exe`, a Windows app with its own
window and icon that needs no browser and works without a network. Copy the one file anywhere and double-click it;
`F11` fills the screen. It reads the Sheet live when the computer is online and shows the saved copy when it is not.

## When a point appears

A span (start to end) shows on every snapshot year inside it. A one-year event shows on the first snapshot year at
or after it, read as "since the last snapshot": a battle in 1526 appears on the 1600 map. The map prints the date as
given: `21 Apr 1526`, `Apr 1526` or `1526`. Days and months do not move a point between snapshot years yet; they are
kept so that finer-stepped maps can use them later.

---

### For whoever keeps the site (not the teachers)

- The live Sheet is "Parchment records" in the owner's Google Drive (its id is in `data/sheet.json`). To start over,
  `npm run sheet` writes `dist/parchment-records.xlsx` with the dropdowns; upload it to Google Drive and it opens as a
  Google Sheet and keeps the dropdowns (`-- --lite` makes a small version whose places tab imports `data/places.csv` from the site). Share it with the teachers as editors and with "Anyone with the link" as viewer.
- Put the Sheet's id into `data/sheet.json`: `csv_url` is
  `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=records`, `edit_url` is the Sheet's normal
  link, `gid` is the records tab's gid (0 for the first tab). Commit and push; the site now reads the Sheet live.
- `npm run pull` copies the Sheet into `data/records.csv` (for the offline file and the repository), `npm run geocode`
  fills coordinates from the ids, `npm run check` lists problems. Then `npm run offline` and commit.

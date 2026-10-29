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
4. **where**: for a state or region, pick an id from the `places` tab of the Sheet (the base map's own names, such as
   `ottoman-empire@1600`). For a point, type the Wikidata id of the place, such as `Q605321`. The Admin page's
   **Find a place** tab lets you search either kind and shows it on the map before you copy the id.
5. **start, end**: years. The same year for a single event. Negative for BCE.
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

## Review

A second person sets **qc_status** to `ok`, `wrong` or `unsure`, signs **qc_by**, and may leave a **qc_note**.
Rows marked `wrong` stay in the table but stop drawing.

## Nothing you type can break the map

A row with a mistake is skipped and listed. The rest of the map draws as before.

## When a point appears

A span (start to end) shows on every snapshot year inside it. A one-year event shows on the first snapshot year at
or after it, read as "since the last snapshot": a battle in 1526 appears on the 1600 map.

---

### For whoever keeps the site (not the teachers)

- `npm run sheet` writes `dist/parchment-records.xlsx` with the dropdowns. Upload it to Google Drive; it opens as a
  Google Sheet and keeps the dropdowns. Share it with the teachers as editors and with "Anyone with the link" as viewer.
- Put the Sheet's id into `data/sheet.json`: `csv_url` is
  `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=records`, `edit_url` is the Sheet's normal
  link, `gid` is the records tab's gid (0 for the first tab). Commit and push; the site now reads the Sheet live.
- `npm run pull` copies the Sheet into `data/records.csv` (for the offline file and the repository), `npm run geocode`
  fills coordinates from the ids, `npm run check` lists problems. Then `npm run offline` and commit.

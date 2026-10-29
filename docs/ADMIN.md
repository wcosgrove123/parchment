# The admin page (teacher side) — design note, 2026-10-29

Owner direction: a link from the map to a separate admin page where the record table lives inside Parchment
itself, so teachers who do not code can build the content. Not built yet; this is the design to react to.

## What the page is

One screen, same parchment look, reached from an "Admin" link in the map's toolbar (never shown in shots or exports).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PARCHMENT · Admin        Unit [3 ▾]  Topic [3.1 ▾]  Tracker [all ▾]  Problems (2)│
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Coverage  3.1 ●●●●○  3.2 ●●○○○  3.3 ○ │                                      │
│──────────────────────────────────────│        the map, live,                │
│ ● Panipat               1526  battle │   at the selected row's year,        │
│ ● Ottoman caliphal claim 1517–1750   │   with that row lit up               │
│ ○ Songhai (sphere)      1464–1591 ✎  │                                      │
│ ! Bad row               line 8  ⚠    │                                      │
│ + Add a claim                        │                                      │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ Row editor: dropdowns for every fixed value · place picker · year · grade · │
│ certainty · label · source · CED picker (unit → topic → key concept → theme)│
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Table on the left**, one row per claim, grouped by unit and topic. A dot shows status: drawn, has a problem,
  not yet reviewed. Clicking a row moves the map to its year and highlights it.
- **Map on the right** is the real atlas, so a teacher sees exactly what a student will see.
- **Row editor** below: no free typing where a vocabulary exists. Tracker, kind, grade, certainty, theme and review
  status are dropdowns from `data/vocab.json`. Places are picked, not typed: a search over the base map's own names
  for regions, and for points a name search that shows the dot on the map before the teacher accepts it.
- **CED picker**: unit → topic → key concept → theme, from a CED index file (`data/ced.json`). Picking fills the five
  tag columns. The tags drive filters and coverage here; they never reach the student-facing map or any export.
- **Coverage strip**: for the chosen unit, how many claims each topic has. This is what tells the team where the gaps are.
- **Problems tab**: the same checks as the map's data-problems panel, row by row, with a fix-it link to the editor.
- **Review**: a reviewer marks a row ok / wrong / unsure with a note (the `qc_*` columns). Rows marked wrong stay
  in the table but stop drawing.

## Where the rows are saved (the one real decision)

Parchment is a static site. A page can edit rows in the browser, but something has to keep them.

| Option | Teacher experience | Cost | Fits the brief |
|---|---|---|---|
| **A. Google Sheet as the store** | Teachers edit in the Sheet (dropdowns from the vocabulary); the admin page reads it live, validates it, previews it on the map, shows coverage, and has "open the Sheet" buttons. Editing is not inside the page. | Small. No accounts, no server. | Yes (brief v1). |
| **B. Edit in the page, save through a small service** | Everything inside Parchment: edit, see it on the map, save. A shared teacher passphrase. | A tiny backend (one file store and one endpoint), hosting, upkeep. | Changes "static, no backend". |
| **C. Edit in the page, save by download** | Edit inside the page, then download `records.csv` and send it to Wil to commit. | Small. | Yes, but one person stays the bottleneck. |

Recommendation: start with **A** (it gives the whole admin experience except in-page typing, in days not weeks),
and move to **B** only if the Sheet round-trip annoys the team. Either way the admin page is the same; only the
save button differs.

## What the teachers need to supply

1. **The claims.** One row each: what, where, when (start–end), how sure (exact / circa / uncertain), how firm the
   territory is (legal / approximate / sphere), and the source (textbook page or CED line). Unit 3 is likely
   30–60 rows. About two minutes a row once the pickers exist.
2. **The highlight lists per unit**: which states light up in the extent tracker for each unit.
3. **The tracker values for v1** (legitimation, administration, belief). Draft lists are in `data/vocab.json`;
   the teachers confirm or change the words.
4. **A reviewer pass.** Someone other than the author marks each row ok / wrong / unsure.
5. **The CED index** (`data/ced.json`): unit and topic numbers and titles, key-concept codes, theme codes. Entered
   once, from the CED. Codes and short titles only; no CED prose in the public repository.
6. **Answers to `docs/CO-TEACHERS.md`**, especially the highlight lists and the Sahel borders question.

## CED references

Yes, on the teacher side only. Every row carries course, unit, topic, key concept and theme. The admin page uses
them to filter, to show coverage, and to pick from. The map, legend, cartouche, exports and the offline file never
show them, by the brief's rule. The index holds codes and titles, not the CED's text.

## Order of work, if approved

1. `data/ced.json` for AP World Unit 3 (codes and titles) and the vocabulary dropdowns.
2. The admin page reading the current `records.csv`: table, map preview, problems, coverage, CED filters.
3. Place picker (base-map names; point search with the dot shown before accepting).
4. Save route A: the Sheet template with dropdowns and a pull step for site and offline builds.
5. One-page teacher guide with pictures; the review packet per unit.

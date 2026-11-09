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
  `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=records&headers=1` (`headers=1` tells
  Google the first row is the only header row; without it Google guesses, and it can guess wrong), `edit_url` is the Sheet's normal
  link, `gid` is the records tab's gid (0 for the first tab). Commit and push; the site now reads the Sheet live.
- `npm run pull` copies the Sheet into `data/records.csv` (for the offline file and the repository), `npm run geocode`
  fills coordinates from the ids, `npm run check` lists problems. Then `npm run offline` and commit.

## The North America map (1492 to today)

The **North America** link in the toolbar opens the United States stage. It has no table to fill: every border on
it comes from a dated source, and clicking any area opens a card with that source.

- **Moving through time.** Type a year (`1803`) or a day (`1803-12-20`) in the box and press Enter. `←` `→` move a
  year, `Shift` ten. `[` `]` jump to the previous or next day the record changed (a treaty, an admission, a new
  territory). Click or drag the timeline at the bottom. A year is shown as of its last day, 31 December.
- **Several maps in one.** *Nations and empires*: who held the land. *States and territories*: the United States as
  states, organized territories and unorganized land. *Indian land cessions*: the lands ceded by treaty up to the
  date shown, darker for later cessions (more on this map below).
- **The land a nation held (Indian land cessions).** From 1785 to Removal, green with a solid edge is the land the
  United States recognized by treaty as Cherokee, Creek, Choctaw, Chickasaw or Seminole on the date shown: what that
  nation had still to cede. It shrinks at each treaty; step through `us.html?year=1791&tracker=cessions`, 1819 and
  `?date=1835-12-28` to watch the Cherokee Nation shrink before New Echota. Rust hatching is land two nations held at once
  (the United States bought it from both). Thin lines from 1784 to 1978 are each nation's original territory as
  the Indian Claims Commission later found it. From 2020, green is the land Native nations hold today
  (reservations, trust land, rancherias, pueblos; Hawaiian home lands lighter).
- **Native population.** Choose *Native population* in the tracker menu. From 1890, the first census to count every
  Native person, each state is shaded by Native people per 1,000 km², on the same five steps every year, with the
  largest counts in badges. The counts of 1860–1880 left most Native people out, so they are not shaded. Before
  1890 a badge appears only where scholars give a figure for a place (California in 1769, 1846 and 1873, with its
  range), and the legend gives the national estimate. A card gives the count, the share of the national total, and
  what the census counted that year. Since 2000 the count is of people who gave only one race.
- **Reading the marks.** A solid line is a documented border; a dashed line an approximate one (all colonial
  borders before 1783). Rust hatching is land two powers claimed at once, or a joint or disputed area (Oregon
  Country, the Republic of Texas), or a strip two states or territories both claimed (the Toledo Strip between
  Ohio and Michigan, Greer County between Texas and Oklahoma), edged in rust so even a thin strip shows. Rust
  cross-hatching is the Confederacy. Fine dots with a soft edge are Native
  homelands, approximate by nature and never drawn as a border.
- **What changed between two dates (Diff).** Press `D`, or click **Diff**, and type the earlier date in the
  **from** box; the date box is the later one. Gold is what appeared by the later date (and, under *Nations and
  empires*, land that changed hands, such as the land that joined the United States); rust hatching is what had
  vanished; everything else is unchanged and left plain. The list beside the legend names them: under *States and
  territories*, the states admitted and territories created, each with its year. A link like
  `us.html?from=1783&year=1853` opens straight to it.
- **The Electoral College.** Choose *Electoral College* in the tracker menu. The map shows the latest presidential
  election held by the date, on the map of its own day: each state in the color of the candidate its electors
  chose, with a badge for its electoral votes ("OH 23"; "NJ 4+3" when its electors divided). The small eastern
  states are listed in the Atlantic with a line to each. `←` `→` step from election to election. A state left
  unshaded cast no vote (the Confederacy in 1864); territories had no electors. Click a state for how its electors voted, from
  the National Archives. Before 1804 each elector cast two votes, so the legend counts votes, not electors. A link
  like `us.html?year=1860&tracker=electoral` opens straight to an election.
  Press `D` (or **Diff**) to compare two elections: gold marks each state that voted for a different party (or
  voted for the first time), rust hatching a state that stopped voting, and the list groups the changes by
  direction ("Democratic → Republican"). The **from** box takes the earlier election; `←` `→` move the later one.
  `us.html?from=1856&year=1860&tracker=electoral` opens straight to a comparison.
- **What a card tells you.** For a U.S. state or territory: the dates it was in force, what changed and the law or
  treaty behind it (from the Newberry Library's atlas). For a cession: the nation that ceded it as Royce named it,
  the tribes today, the treaty date and links to the treaty text and Royce's map. For a nation's treaty land: the
  treaty that set the boundary, where it was held, the next treaty, the size in acres and the Royce areas it is
  made of. For a colony or country: its dates and its OpenHistoricalMap record.
- **A map for one slide.** Add a frame, a size and what to light to the address, and the map draws only that:
  `us.html?frame=texas&date=1836-06-01&highlight=texas-republic,mexico&size=1600x1550`. Frames: `texas`,
  `southwest`, `oregon-country`, `east`, `plains`, `border-states`. What is not lit drops to paper, its name kept
  pale. `rivers=Nueces,Rio Grande` names rivers; `places=` points at rows of the table by their Wikidata id;
  `title=` titles the map. On a Texas slide the Republic of Texas (1836–1845) has a color of its own, so the land
  Mexico still claimed inside it shows as a hatch. Export gives the picture at that size. Whoever keeps the site can
  make the same map from an order form, with a list of everything on it and its sources (docs/LESSON-MAPS.md).
- **Something looks wrong?** Note the year and the area and tell the person who keeps the site. Borders are not
  redrawn here; a wrong one is fixed in its source or set aside with a written reason.

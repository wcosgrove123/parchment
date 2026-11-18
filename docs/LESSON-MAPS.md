# Lesson maps on order

A lesson map is a picture of the North America page made for one slide: framed on a region, sized for the slide, with
the polygons the lesson is about lit and the rest dropped to paper, and the rivers, places and routes the lesson points
at. You (or a co-teacher, or Claude in a cloud session) fill in an **order form**; Parchment returns the picture and a
**packing slip**, a JSON file that says what is on the map, with dates and sources.

Built 2026-11-06 from the owner's brief "Parchment: lesson maps on order"; the owner's answers of 2026-11-09 are in.
Decisions: `docs/DECISIONS.md`, 2026-11-06 and 2026-11-09. Test orders: `tests/maps/`.

## The order form

```json
{
  "page": "us",
  "date": "1836-06-01",
  "tracker": "nations",
  "frame": "texas",
  "highlight": ["texas-republic", "joint-mexico-texas-claim"],
  "annotate": {
    "rivers": ["Nueces", "Rio Grande"],
    "places": ["Q235344", "Q841278"],
    "routes": []
  },
  "title": "The Texas Revolution, 1836",
  "size": "1600x1550",
  "records": "tests/maps/texas-records.csv",
  "out": "out/texas-1836"
}
```

```bash
npm run map -- tests/maps/texas-1836.json
```

writes `out/texas-1836.png`, `out/texas-1836.json` (the packing slip) and, with `--svg`, `out/texas-1836.svg`. It
prints the address of the same map (`us.html?…`) so it can be opened live. `--size 1920x1080` and `--out` override
the order.

| field | address | what it does |
|---|---|---|
| `page` | (the page) | `us`, the North America page; the only one that takes orders for now |
| `date` | `date=` or `year=` | a day (`1836-06-01`) or a year (`1836`, read as 31 December) |
| `from` | `from=` | makes a Diff: what changed from this date to `date` |
| `tracker` | `tracker=` | `nations` (default), `states`, `slavery` (free and slave states, below), `freeblack` (free Black population, below), `cessions`, `population`, `electoral` |
| `underground` | `underground=on` | `true` draws the Underground Railroad's escape routes in use on the date over the map, whatever the tracker (below) |
| `frame` | `frame=` | a frame id (below) or a box `W,S,E,N` in degrees; without one, the whole continent |
| `highlight` | `highlight=` | ids to light; everything else drops to paper (below) |
| `annotate.rivers` | `rivers=` | rivers to name, as Natural Earth spells them (`Nueces`, `Rio Grande`, `Sabine`) |
| `annotate.places` | `places=` | point records, by the Wikidata id in their `where` or by record id |
| `annotate.routes` | `routes=` | arrow or path records, by record id |
| `title` | `title=` | the cartouche's title |
| `size` | `size=` | `WIDTHxHEIGHT` in pixels, 800 to 3840 wide (default 1920x1080) |
| `scale` | `scale=` | type scale; by default 1 up to 1920×1080, and a larger picture keeps the 1920×1080 type, drawn finer |
| `projection` | `projection=` | `auto` (default: the frame's own, src/render/focus.js) or `page` (the page's Albers, re-fitted) |
| `records` | `records=` | a records CSV in this folder; `npm run map` reads `data/records.csv` when places or routes are named, never the Sheet |
| `strip` | `strip=` | `off` leaves the timeline strip off the picture (a slide with its own); the map takes its room |
| `out`, `svg` | | where to write, and whether to write an SVG too |

**Frames** (`src/focuses.json`, under North America): `texas` (−107, 24.5, −92.5, 37.5), `southwest` (−125, 25, −93, 43),
`oregon-country` (−126, 40, −108, 56), `east` (−95, 24, −66, 48), `south` (−107, 24, −74, 41: the cotton South, wide
enough for Texas), `southeast` (−93, 23.5, −74, 41: the old South and the sea road round Florida), `plains` (−105, 35, −89, 46), `border-states`
(−92, 35, −74, 41.5), and `north-america` (the continent's box). The legend goes in whichever right-hand corner holds
less land; water names are set where their water shows. Alaska and Hawaii are drawn on the continent; a frame draws
their insets only when the order names a polygon in one of them by its own name or id (`nb:ak_state`, `hawaii`; owner,
2026-11-18), stacked up the left edge above the cartouche.

**Highlight ids** are compared without case, accents or punctuation: a power (`mexico`, `united-states`, `britain`,
`spain`, `france`, `russia`, `native`), any polygon by its own name (`coahuila-y-tejas`, `texas-republic`,
`joint-mexico-texas-claim`), or by its id (`ohm:2841297`, `nb:tx_republic`, `Q949898`). A hatched dispute stays when
the order lights either side of it. Names of what is not lit stay on the map, paler, as context. A lit state too small
for its name carries its postal abbreviation (DE, RI), inside it where there is room, else just off its coast on open
water. A polygon lit by its own name or id that is alive on the date but not on the map (California on the `east`
frame) is listed on the slip under `resolved.highlight.off_frame`, with a warning. `npm run search`
finds ids. The one word `none` lights nothing: a quiet base of borders and names, for a map whose places carry it.

**States and territories** (`tracker: states`, the default for the statehood deck). Fills are Newberry's own kinds:
state, organized territory, unorganized territory. Newberry's "Other" areas are hatched; three are keyed for what they
were (2026-11-18): Deseret "Proposed state (not recognized)", the Vermont and Texas republics "Independent republic"
(`src/us/trackers.json` `other_areas`). In a Diff, land that moved from one polygon to another while both survive
(the Texas sale of 1850, the District's retrocession of 1846) is drawn in the focus color with the name of the polygon
that now holds it, keyed "Changed hands", and listed with both names and its area.

**Free and slave states** (`tracker: slavery`, 2026-11-16). Each state takes its status from a table,
`data/us/slavery-status.csv`: one row per Newberry polygon id (`al_state`) per status period, with `status` (`free` or
`slave`), `start` and `end` (blank: the polygon's own first and last day) and a `source`. The shapes stay the
Newberry's. Territories take the neutral gray (`--fill-N`) and the label "Territories" until a territory is given a row of its own;
the District of Columbia and joint or disputed areas stay paper. The key is the same on every date (free, slave,
territories), so two dates pair side by side. The table is entered for 1820 to 1860 only; outside those years no
state is given a status and the key says so. The packing slip counts the states by status on the date
(`resolved.status`) and each polygon carries its row. The rows are TEST ROWS until the owner reviews them.

**Free Black population** (`tracker: freeblack`, 2026-11-16). The same three fills, with a number badge ("MD 83,942")
on each of the ten states where the census on or before the date counted the most free Black people, and the
nation's count by where they lived as lines of the key ("In slave states: 250,787 (51%)"). Nothing is shaded by
amount. Counts: the Census Bureau's Working Paper No. 56, censuses of 1790 to 1860
(`data/us/census-free-slave-1790-1860.csv`, read from the paper by `scripts/census-wp56-free.mjs`). The paper counts
each state within its present-day borders, so a row is added onto the polygon of the date that holds it (Virginia in
1860 takes West Virginia's row). The packing slip lists every polygon's count and the census rows behind it
(`resolved.census`). Test order: `tests/maps/free-black-1860.json`.

**The Underground Railroad** (`underground: true`, 2026-11-17). The escape routes in use on the map's date, from a
table of their own, `data/us/underground-railroad.csv` (the record table's columns; the research behind every row,
with its citations, is `docs/UNDERGROUND-RAILROAD.md`). A route is an `arrow` with the value `escape`, on the map
from its `start` year (the first its sources document) to the end of 1865, `end` being the last year documented; a town is a `point` with the value `station`. Routes that share a leg are
drawn as one line there and part where their rows part (`docs/ROUTES-STYLE.md` §6): nothing is bent by hand. On the
page it is the "Underground Railroad" button beside the tracker, shown while Free and slave states (or Free Black
population) is the tracker. Every town is a dot; at most ten carry names (the ends of lines first), the rest give
their name, years and source on hover. To name particular towns on a lesson map, list them in `annotate.places` with
`records` set to the table. The packing slip lists each route's record id, waypoints (ids and names), years,
certainty and source, and under `resolved.underground` the routes that had not begun on the date and those last documented before it. The
rows are TEST ROWS until the owner reviews them. Test order: `tests/maps/underground-railroad-1860.json`.

**Texas, 1836–1848** (owner, 2026-11-09). Where the map has room for a fourth fill (a Texas or Southwest frame), the
Republic of Texas has a color of its own and the land Mexico still claimed inside it keeps the hatch; the whole
continent already shows five fills, so there the Republic stays hatched. From 1836 to the Mexican Cession the hatch
south of Texas is the land between the Nueces and the Rio Grande, edged by Natural Earth's Nueces: OpenHistoricalMap's
Joint Mexico-Texas Claim (1836–1845) is cut at the river (`data/us/ohm-cuts.json`) as the computed strip of 1846–1848
is, so the strip keeps its shape at annexation. Past the river's head both follow OpenHistoricalMap's Chihuahua and
Nuevo México lines (the upper Rio Grande claim).

**Places and routes** are records, as everywhere in Parchment: a `point` row with a Wikidata id in `where` and a
`source`; an `arrow` or `path` row through gazetteer ids. A Wikidata id with no record is not drawn (the slip says
so). A place whose record ended before the map's date gets a warning on the slip, with the name the land under it
had on its own day when that differs (Louisiana was Orleans Territory in 1811). A revolt or a conspiracy is a point
with the value `revolt`: the rust diamond of a conflict, with its own line in the key (test rows:
`tests/maps/antebellum-records.csv`). The domestic slave trade is an `arrow` with the value `forced-migration`: the
migration's line, keyed "Forced migration: the domestic slave trade", never "migration" alone. On a quiet base
(`highlight: none`) the key has no title. Test rows for the Texas maps: `tests/maps/texas-records.csv` (marked TEST ROW, not reviewed).

## The packing slip

Every render writes one, beside the picture:

- `order` and `resolved`: the order as given, and what the page made of it (date, tracker, frame box, projection and
  why, size, title, highlight ids that lit nothing, the legend's corner, the water names drawn).
- `legend`: each row as drawn, with its color or pattern and its role (category, dispute, border certainty, route,
  point type).
- `features`: every polygon in the frame, with its layer, names, ids (OpenHistoricalMap relation, Newberry id and
  version, and OHM's copies of a Newberry polygon), start and end, certainty, holder, look, whether it is lit,
  labeled, or cut by the frame's edge, its area, and its source with a URL and the source's own notes.
- `points`, `routes`, `rivers`: what was drawn and named, with each record's `source`.
- `changes` (a Diff): appeared, vanished, changed hands, and the list as printed on the map. Under the nations tracker
  a unit that changed hands is a whole polygon under a new power; under the states tracker it is a piece of land
  (`kind: "land"`): the polygon that gave it and the one that took it, their Newberry versions, the area in km² and
  square miles, and the Newberry record of the change. Each piece is also among the `features` (layer `changed-hands`).
- `layout`: where the legend and cartouche sit, and any name that runs past the edge (none, or a warning).
- `warnings`: names dropped for room or the ten-name limit, ids that found nothing on the date, polygons lit but not on
  the map (off the frame), the sources' own notes
  of doubt (an OHM `fixme`, estimated dates), requests refused.
- `alt_text`: a draft built by a fixed template from the above. `credit`: one line for the slide
  ("Parchment; boundaries: Newberry Library, OpenHistoricalMap; rivers: Natural Earth; …").

## What's here?

```bash
npm run describe -- --page us --date 1836-06-01 --frame texas
```

```bash
npm run changes -- --page us --from 1821 --to 1848 --frame texas
```

```bash
npm run search -- Nueces
```

`describe` lists the polygons alive in the frame that day (with dates, holder, area in the frame and source), the rivers
in the frame and the records alive that day. `changes` lists every border change inside the frame, dated, in the
sources' own words ("1835-12-15: Coahuila y Tejas became Texas and Coahuila"). `search` finds polygons, computed
disputes, rivers, records, gazetteer places and frames by name. Add `--json` for machine-readable output.

## Checking that a change leaves the maps as they were

```bash
npm run compare
```

renders every order in `tests/maps/` and the 1844 continent from the last commit (a temporary git worktree) and from
the folder as it stands, and reports for each whether the picture is identical and whether the packing slip's key,
names, lit polygons and warnings are the same. `npm run compare -- --ref 7b54a00 tests/maps/statehood/dc-1846.json`
compares other orders against another commit.

## Running it anywhere

The commands need Node 20 or later, `npm ci`, and a Chromium-family browser. The browser is found in this order:
`PARCHMENT_BROWSER` (a path), Playwright's Chromium (`~/.cache/ms-playwright`, or `PLAYWRIGHT_BROWSERS_PATH`), a
`chromium` or `google-chrome` on the PATH, then Chrome or Edge at their Windows paths. The page is served from this
folder on 127.0.0.1, its script is built from `src/` in memory, and any request off the machine is refused and listed
on the slip. In a cloud session where `npm ci` cannot download Electron's binary, `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci`
installs everything a lesson map needs.

## The MCP server

`mcp/server.mjs` gives Claude the same five tools on the laptop: `list_frames`, `describe`, `changes`, `search`, and
`render(order)`, which returns the PNG's path and the packing slip. Setup is in the README. A cloud session can reach it
only while the laptop is on; the commands above work on their own from a clone.

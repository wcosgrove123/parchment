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
| `tracker` | `tracker=` | `nations` (default), `states`, `cessions`, `population`, `electoral` |
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
| `out`, `svg` | | where to write, and whether to write an SVG too |

**Frames** (`src/focuses.json`, under North America): `texas` (−107, 24.5, −92.5, 37.5), `southwest` (−125, 25, −93, 43),
`oregon-country` (−126, 40, −108, 56), `east` (−95, 24, −66, 48), `plains` (−105, 35, −89, 46), `border-states`
(−92, 35, −74, 41.5), and `north-america` (the continent's box). The legend goes in whichever right-hand corner holds
less land; water names are set where their water shows; Alaska and Hawaii are drawn only on the continent.

**Highlight ids** are compared without case, accents or punctuation: a power (`mexico`, `united-states`, `britain`,
`spain`, `france`, `russia`, `native`), any polygon by its own name (`coahuila-y-tejas`, `texas-republic`,
`joint-mexico-texas-claim`), or by its id (`ohm:2841297`, `nb:tx_republic`, `Q949898`). A hatched dispute stays when
the order lights either side of it. Names of what is not lit stay on the map, paler, as context. `npm run search`
finds ids.

**Texas, 1836–1848** (owner, 2026-11-09). Where the map has room for a fourth fill (a Texas or Southwest frame), the
Republic of Texas has a color of its own and the land Mexico still claimed inside it keeps the hatch; the whole
continent already shows five fills, so there the Republic stays hatched. From annexation to the Mexican Cession the
hatch south of Texas is the land between the Nueces and the Rio Grande, edged by Natural Earth's Nueces; past the
river's head it follows OpenHistoricalMap's Chihuahua and Nuevo México (the upper Rio Grande claim).

**Places and routes** are records, as everywhere in Parchment: a `point` row with a Wikidata id in `where` and a
`source`; an `arrow` or `path` row through gazetteer ids. A Wikidata id with no record is not drawn (the slip says
so). Test rows for the Texas maps: `tests/maps/texas-records.csv` (marked TEST ROW, not reviewed).

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
- `changes` (a Diff): appeared, vanished, changed hands, and the list as printed on the map.
- `layout`: where the legend and cartouche sit, and any name that runs past the edge (none, or a warning).
- `warnings`: names dropped for room or the ten-name limit, ids that found nothing on the date, the sources' own notes
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

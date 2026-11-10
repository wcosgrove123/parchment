# The Military layer

Wars on the map: who fought whom, where the forces went, what happened where, and what it cost. Built from the
brief "Parchment: the Military layer" (2026-11-09) in milestones; this page says what is built and how to use it.
Decisions: `docs/DECISIONS.md`, 2026-11-09 on. Everything here is a layer that is **off by default**: no address,
order or map changes unless it asks for `layer: military`.

## Status

| milestone | what | state |
|---|---|---|
| 0 | the picture sheet of proposals P1–P10 and the icons for review (`docs/progress/2026-11-09-military-sheet.png`) | done; the owner took the defaults for P1, P3, P5 and P8 |
| 1 | wars, sides and members; the Military toggle and the side fills | done on the North America page (below); the world page's toggle and the 1914–18 test wait for the Europe-stage work there |
| 2 | events: battles by victor, sieges, places taken, declarations and the treaty; the numbered course of the war; the war strip | done (`tests/maps/military/mexico-war-1848.json`) |
| 3 | forces and movements: arrows by side, hollow retreats, landing ticks, side-by-side legs, tabs at the frame's edge, force bars on the strip | done (`tests/maps/military/texas-1847-movements.json`) |
| 4 | lines computed from the polygons: blockades off a coast, treaty lines, ghost borders; the `mexico-city` inset; `forces` to follow one campaign | done (`tests/maps/military/mexico-war-1848-full.json`); fronts, fortified lines and parallels wait for the maps that need them |
| 5 | force marks: milsymbol frames by type and size, the equipment icon when the catalog allows it on the date, earlier stands faded; the star fort; ship icons on blockades | done (`data/tech.json`; the owner reviewed the icons 2026-11-09) |
| 7 | play: films of chapters at their paces, ▶ on the page and an MP4 from `npm run film` (the owner asked for it on 2026-11-09, ahead of the human cost) | done (`tests/maps/military/texas-film.json`: Mexican Texas to the Gadsden Purchase, 1821–1854) |
| 10 | strength width: `width: strength`, with its key (part of the classroom preset) | done (review of 2026-11-10) |
| 9 | battle frames: a battle's phases on its own frame with USGS relief, lines of battle, attacks, the corps where they stood, the hills the sources name (the owner chose it before the human cost) | done (`tests/maps/military/gettysburg.json`: Gettysburg, 1–3 July 1863, seven phases) |
| 6 | the human cost | next |
| 8 | panels and accounts (a side's `view` is built; the two-panel accounts map is not) | |

## Turning it on

On the North America page: the **Military** entry of the tracker menu, with a second menu for the war (the one
alive on the date by default). Beside it, while the layer is on: **Go to…** (the theater of this war, a film, a battle
frame, the whole continent), whose view of the land (for a war with `views`), and **Classroom** (the classroom
preset, on or off); everything below that has an address has a control there. As an address: `us.html?tracker=military&war=mexican-american-war&date=1846-05-13`.
As an order (`npm run map`, the same form as a lesson map, `docs/LESSON-MAPS.md`):

```json
{
  "page": "us",
  "layer": "military",
  "war": "mexican-american-war",
  "names": "both",
  "date": "1846-05-13",
  "frame": "mexico-war",
  "size": "1920x1080",
  "records": "data/military.csv",
  "out": "out/military/mexico-war-1846"
}
```

| field | address | what it does |
|---|---|---|
| `layer` | `tracker=military` | turns the layer on |
| `war` | `war=` | which war (an id from `data/vocab.json`'s `wars`); without it, the longest war alive on the date |
| `names` | `names=` | whose name for the war prints in the cartouche: a side's id (`us`, `mexico`) or `both`, which prints the first side's name and lists the other side's name in the legend; the slip always carries every name |
| `show` | `show=` | what of the layer to draw: `territory`, `events`, `sequence` (default: everything built); `movements`, `lines`, `forts`, `losses` follow with their milestones |
| `sequence` | `sequence=` | `true` (every event begun by the date is numbered in date order, default), `false`, or a list of record ids to number in that order |
| `strip` | `strip=` | `war` (default: the war's own timeline under the map) or `stage` (the page's usual strip) |
| `inset` | `inset=` | a focus id (`mexico-city`) drawn as an inset above the cartouche, with the same fills, events and movements in its own projection |
| `forces` | `forces=` | force ids (`scott`, `taylor`): only those forces' movements, and the events that name a force, to follow one campaign |
| `highlight` | `highlight=` | as on a lesson map: light these polygons (a dispute, a state) and drop the rest to paper |
| `preset` | `preset=` | `classroom`: the war's key events and forces only (`key_events`, `key_forces` in its record), a short key, larger type, line widths by army size; one setting for a map read from the back of a room |
| `width` | `width=` | `strength`: each movement as wide as the square root of its numbers (the row's `strength`, else its force's), with a width key; `plain` turns it off under the classroom preset |
| `view` | `view=` | a side's id (`mexico`): the map as that side saw it, from the war's `views` (Texas as Mexico's own land, hatched in the color of whoever held it) |
| `battle`, `phase` | `battle=`, `phase=` | a battle frame at a phase (below) |
| `play` | `play=` | a film (below) |

Everything else (`frame`, `date`, `from`, `annotate`, `title`, `size`, `records`…) is as for a lesson map. Two new
frames: `mexico-war` (−125, 15, −88, 43) and `mexico-city` (−99.6, 18.9, −98.6, 19.8).

## Occupied land (the review of 2026-11-10)

A membership row with the role `occupied` shades what an army holds while the war is on: its `side` is the occupier,
its `where` a province or state the base map draws (`nuevo-mexico`, `alta-california`, `veracruz`,
`federal-district-of-mexico`), its dates the occupation's. The polygon keeps its owner's fill and takes a hatch in the
occupier's line color (proposal P2), slanted the other way from a dispute's rust hatch; the legend says "Occupied by
United States, in whole or in part", because the polygon is the whole province and the row's source says which part.
A port held alone is a place-taken mark, not a hatch. The slip lists every occupation on the map's date with its source.

## Battle frames (milestone 9)

A **battle** is an entry of a war's `battles` in `data/vocab.json`: label, dates, a frame (a focus of `src/focuses.json`,
which may carry fine relief of its own) and numbered phases, each with its day, a short name and a sentence. Rows of the
war table name the battle and a phase (`battle`, `phase`: a number or a range such as 4-5): `position` points stand a
force at a place for a phase, `front` paths are the lines of battle, arrows the attacks and marches, `terrain` points
the hills and places the sources name. `us.html?battle=gettysburg&phase=4` opens the frame on that phase; ▶ steps the
phases, ← → one at a time; an order with `battle` and `phase` renders a still. There are no side fills at this scale;
the force marks are compact; positions are the sources' narrative read onto gazetteer places and say so (approximate).
Gettysburg's relief is a USGS 3DEP hillshade (public domain, `assets/relief/gettysburg-plate-carree.json`).
Its ground is downloaded too (`scripts/fetch-battle-ground.mjs` → `data/battles/gettysburg.json`): today's roads from the
Census Bureau's TIGER/Line, named as in 1863 by a table in the battle's record, the town's main streets, and the named
streams of the USGS National Hydrography Dataset. A battle may ask for its own sheet size (`size` in its record).
Positions sit on the gazetteer places and monuments that mark where the commands stood.

## Play: films (milestone 7)

A **film** is an entry of `data/vocab.json`'s `films`: a title, a frame, and chapters, each with a title, a span of
dates, the war whose record is shown, and a pace in map days per real second (`week`, `month`, `quarter`,
`half-year`, `year`, or a number). On the page, `us.html?play=texas-1821-1854&frame=mexico-war&records=…` opens on
the film's first day with the Military tracker on; press ▶ or space. The date steps on the film's clock, the war strip
spans the chapter and names it, the cartouche's title is the chapter's, and each chapter's war brings its own fills,
events, forces and lines; after a war's last day its armies stand down. An order with `"play"` renders a still of any
date with `npm run map`, and `npm run film -- tests/maps/military/texas-film.json` writes every frame (six per second
of film time) and an MP4 for a slide (ffmpeg with H.264; the frames and a manifest stay beside it). The first film runs
from Mexican Texas through the Texas Revolution, the Republic's years and the war with Mexico to the Gadsden Purchase
in just under four minutes (3 min 53 s); the base map changes by its own sources' dates (Coahuila y Tejas, the Republic and
the joint claim, statehood, the cession, the 1850 line, the Gadsden strip).

## What it draws (milestone 1)

Color means the side (proposal P1, owner's defaults of 2026-11-09): each side of the war has a pair of colors, a dark
line color for its arrows, battles and labels and a lighter fill for the land it holds (`src/tokens.css`,
`--side-a-line` … `--side-red-fill`; the fixed order blue, plum, teal, ochre, then gray and red for the uniform
scheme). While the layer is on, every polygon whose state is a member of the war takes its side's fill; dependents
and satellites take it at 40 %; everything else is paper. Disputes keep their hatch and Native homelands their
stipple. The legend lists the sides on the sheet, their members with dates when a side has several, and the other
side's name for the war.

## The data

- **Wars** live in `data/vocab.json` under `wars`: id, `names` (one per side where they differ), `start`, `end`,
  `sides` (id, label, `color`, and `why` that color), a source. The first war is the war with Mexico, a test entry
  until the owner and the teachers review it.
- **Membership** is a `region` row of the record table under `tracker: military`: `where` the state id, `war` the
  war, `side` one of its sides, `value` the role (`belligerent`, `co-belligerent`, `associated`, `ally`, `auxiliary`,
  `dependent`, `satellite`, `occupied`), `start` and `end` the dates it belonged, `source` as always.
- **The war table.** The Military layer reads `data/military.csv` whenever it is on (the test rows for the war with Mexico, the Texas Revolution and the Republic years are there); `?records=` or an order's `records` points at another file. Whether these rows fold into `data/records.csv` is still the owner's call (question 5; a separate table for now, 2026-11-09).
- **Seven optional columns** (`war`, `side`, `force`, `outcome`, `strength`, `losses`, `tech`) go at the end of the
  table and are read only when the header has them; a table without them is read exactly as before. Whether they
  live in `data/records.csv` or in a table of their own is the owner's call (brief, question 5); the test rows are in
  `data/military.csv`.
- **Events** are `point` rows under the same tracker: `where` a Wikidata id (the coordinate from the gazetteer or
  `npm run geocode`), `value` the kind (`battle`, `siege`, `naval-battle`, `raid`, `landing`, `surrender`, `capture`,
  `declaration`, `treaty`, `armistice`, `massacre`, `fort`, `headquarters`), `war`, `side` where one side owns the
  event (a siege's besieger, a place's captor, the side that declared), `outcome` as `won:<side>`, `inconclusive` or
  `claimed:<side>;<side>`, dates, label and source. Who won is the row's claim, never inferred.
- **Tests and the live table.** `data/military.csv` is the owner's to edit; the tests read a frozen copy (`tests/maps/military-fixture.csv`) and check the live table only for soundness (`tests/military-war2.test.mjs`).
- **Movements** are `arrow` rows through gazetteer places (`where` as for any route: `Q49242>Q982504>Q2613729`), with
  `war`, `side`, `force` (one id for all of a force's rows: `taylor`, `santa-anna`), `value` the kind (`advance`,
  `retreat`, `flank-march`, `envelopment`, `feint`, `pursuit`, `raid`, `landing`, `breakthrough`, `naval-passage`,
  `air-route`, `supply-line`), dates, a label that is the commander and the year ("Taylor 1846"), and a source.
  Waypoints are the places the source names; `npm run geocode -- --file <table>` fills the gazetteer for them.
- **Lines** are not rows but entries in the war's record (`vocab.json`, `lines`), each computed on the page from the
  polygons alive on a date: `{ kind: blockade, side, coast_of, from, to, window, label, source }` runs off the
  blockaded side's own coast inside the window; `{ kind: treaty | armistice | ghost, border_of, against, on, from,
  label, source }` is one side's edge where it meets the other's land on the date `on`. Nothing is traced.

## What it draws (milestone 4)

A blockade is a line 14 px off the coast in the blockading side's color with small hull marks; a treaty line is
navy; a ghost border is navy at half strength, named with its date. Each is named along its longest run. The
packing slip says how each was computed (whose polygons, on what date, how many, which window). With `inset`, a
second small map of a focus sits above the cartouche; with `forces`, one campaign shows alone.

## What it draws (milestone 3)

A force's movement is an arrow in its side's line color with the closed barb that already means an armed force; a
retreat is hollow (outline only, never dashed); a landing ends at the coast with a short tick. The commander and
year run along the line as route names do. Forces that share a leg run side by side. A route that leaves the frame
stops at its edge with a tab saying where it went ("to San Diego"). Without `from`, every movement begun by the
date shows; with `from`, only those not over before it ("situation at `date`, movements since `from`"). On the
strip each force gets a hairline bar spanning its movements, in lanes by side.

## What it draws (milestone 2)

Battles keep the grammar's diamond; its fill is the victor's line color, a rust outline on paper when the row says
inconclusive, split in the two colors when both sides claimed victory. A siege's diamond sits in a ring in the
besieger's color; a place taken is the moss circle in the captor's ring; declarations, treaties and armistices are
the navy triangle. Every event begun by the map's date is numbered in date order and keyed to **The course of the
war**, a box in the corner the legend leaves free, with the date, the event and its outcome; a numbered event prints
no name on the map. Under the map the **war strip** replaces the stage's: the war's span, month and year ticks, each
member's bar in its side's color, every event as a small mark in the victor's color, and the shown date marked.

## What it draws (milestone 5)

Each force stands where its movements put it on the date: a milsymbol frame in the side's color showing its type
and size, the equipment icon beside it when `data/tech.json` says that equipment was in use that year (else the
plain frame, and a warning on the slip: no tank in 1846), the commander and strength below; its earlier stands fade
behind it, earliest lightest. The forces themselves (type, size, equipment, strength, each with a source) live in
the war's record in `vocab.json`; a movement row's own `tech` overrides the force's. The catalog's years are the
brief's starting points, each marked to be sourced. Icons are the owner-reviewed game-icons.net silhouettes (CC BY
3.0; `assets/icons/military/LICENSE.md`); the slip lists every one drawn with author, license and reference, and
the credit line names them.

## The packing slip

A render with the layer on adds `resolved.war`: the war, its names and which printed, each side with its colors and
its members (record id, state, role, dates, grade, source, review status), and the file the members came from.

## Code

`src/military/wars.js` (pure: wars, members, the side of a polygon, the legend rows), `src/military/sides.js` (the
colors), `src/us/stage.js` and `src/us/main.js` (the tracker on the page), `src/data/records.js` (the columns and what
a Military row must say). Tests: `tests/military*.test.mjs`. The picture sheet: `scripts/military-sheet.mjs`.

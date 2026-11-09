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
| 5 | icons and force marks with date checks | next |
| 6–10 | the human cost; play and video; panels and accounts; battle frames; strength width | |

## Turning it on

On the North America page: the **Military** entry of the tracker menu, with a second menu for the war (the one
alive on the date by default). As an address: `us.html?tracker=military&war=mexican-american-war&date=1846-05-13`.
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
  "records": "tests/maps/military-records.csv",
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

Everything else (`frame`, `date`, `from`, `annotate`, `title`, `size`, `records`…) is as for a lesson map. Two new
frames: `mexico-war` (−125, 15, −88, 43) and `mexico-city` (−99.6, 18.9, −98.6, 19.8).

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
- **Seven optional columns** (`war`, `side`, `force`, `outcome`, `strength`, `losses`, `tech`) go at the end of the
  table and are read only when the header has them; a table without them is read exactly as before. Whether they
  live in `data/records.csv` or in a table of their own is the owner's call (brief, question 5); the test rows are in
  `tests/maps/military-records.csv`.
- **Events** are `point` rows under the same tracker: `where` a Wikidata id (the coordinate from the gazetteer or
  `npm run geocode`), `value` the kind (`battle`, `siege`, `naval-battle`, `raid`, `landing`, `surrender`, `capture`,
  `declaration`, `treaty`, `armistice`, `massacre`, `fort`, `headquarters`), `war`, `side` where one side owns the
  event (a siege's besieger, a place's captor, the side that declared), `outcome` as `won:<side>`, `inconclusive` or
  `claimed:<side>;<side>`, dates, label and source. Who won is the row's claim, never inferred.
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

## The packing slip

A render with the layer on adds `resolved.war`: the war, its names and which printed, each side with its colors and
its members (record id, state, role, dates, grade, source, review status), and the file the members came from.

## Code

`src/military/wars.js` (pure: wars, members, the side of a polygon, the legend rows), `src/military/sides.js` (the
colors), `src/us/stage.js` and `src/us/main.js` (the tracker on the page), `src/data/records.js` (the columns and what
a Military row must say). Tests: `tests/military*.test.mjs`. The picture sheet: `scripts/military-sheet.mjs`.

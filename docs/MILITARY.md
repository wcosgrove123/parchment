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
| 3 | forces and movements | next |
| 4 | lines: fronts, blockades, treaty lines, ghost borders | |
| 5 | icons and force marks with date checks | |
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
- Movements (`arrow`) and lines (`path`) follow in milestones 3 and 4.

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

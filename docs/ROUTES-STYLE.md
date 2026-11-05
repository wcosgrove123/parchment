# Routes in Parchment — style (proposed and adopted 2026-11-05)

Adopted on the `routes` branch the same day; what differs from the proposal is listed at the end.

Trade routes, exploration voyages, migrations, campaigns and the carriers of diffusion, drawn from records, in one grammar that extends CLAUDE.md §5. Written after the Ming–Qing deck maps (11/5), where every route had to be composited outside the app because `arrow` and `path` records are not rendered.

## 1. Rules that extend the grammar

| channel | meaning (unchanged) | for routes |
|---|---|---|
| outline / line style | certainty | solid = documented lane or track; dashed = approximate; dotted, faint = conjectured. **Dash never encodes type.** (This retires "migration = dashed" from §5.) |
| color | belonging / apparatus | steel blue: sea trade and voyages · **umber** (new token, `--route-land`, derived at navy's lightness toward hue 50): land trade · rust: armies and migrations · the carrier of a diffusion takes the route's own color, never a theme fill |
| arrowhead | direction matters | none, or small heads at both ends: trade (goods went both ways) · one terminal head: a voyage · closed barb: an army · open chevron: a migration |
| width | quantity only with a legend | three categorical widths at most (2 / 3 / 4.5 px at 1920); default is the middle one |
| ticks | dates | a voyage carries a small tick and year at each dated port |

Diffusion of ideas and beliefs stays as §5 says: stepped shading by period (sequential palette), never an arrow. A map may show the carrier route beside the shading.

Max three route classes on one map. A fourth becomes a caption sentence.

## 2. Records

A route is a `path` (no direction) or `arrow` (directed) record in `data/records.csv`:

- `where`: an ordered list of gazetteer ids separated by `>` (`Q16666>Q36081>Q61089>…`), each resolved by `geocode.mjs` to lon/lat; a `data/gazetteer.json` cache keeps the resolved coordinates per QID so the CSV stays a list of ids. Waypoints at capes and straits keep sea routes off land; waypoints at caravan cities keep land routes on corridors. Nothing is traced by hand.
- `tracker: routes` (new in `vocab.json`), `value` one of `sea-trade`, `land-trade`, `voyage`, `migration`, `military`, `carrier`.
- `start`, `end`, `grade`, `certainty`, `label`, `source` as every record.
- Geometry: a Catmull-Rom spline through the projected waypoints (tension 0.5), clipped to the stage, drawn under marks and labels.

## 3. Labels, so that no text sits on text and no line runs through text

1. **Draw order:** fills → borders → routes → marks → labels. Fixed.
2. **Halos:** every label is painted with a 4 px stroke in the paper color under its fill (`paint-order: stroke`), so a line beneath is knocked out around the letters.
3. **Placement:** each point label tries eight positions in order (E, W, NE, NW, SE, SW, N, S) and takes the first that overlaps no placed label, no route line, no mark and no reserved zone; a label that finds none gets a leader line to the nearest free position, and the lowest-priority labels are dropped below 1366 px wide. Priority: capitals and route termini, then ports with dates, then the rest.
4. **Route names** are set on a `textPath` along the curve, above it, italic, in the line's color, on the longest stretch that crosses no label and lies over water or empty land.
5. **Reserved zones:** the cartouche, legend, scale bar and timeline strip; nothing is placed inside them, and a route that ends there is clipped short with its arrowhead kept.
6. **Three label classes only:** place (bold, date in italic beside it), region (spaced small capitals), water (steel italic). Sizes fixed per stage; no per-map tuning.
7. **Ceiling:** ten labeled places per map. Everything else goes to the caption or the hover.

## 4. Done looks like

- The three deck overlays of 11/5 (Zheng He's ports of call, the Manchu advance 1616–1644, the silver routes) rebuilt as rows in `records.csv` and rendered by Parchment itself with no hand placement, matching or beating the composited versions in `…\AP World\maps\`.
- `tests/`: a placement test with twelve crowded ports where no two label boxes overlap and no route crosses a label box; a certainty test (solid/dashed/dotted by grade); a snapshot test that `npm run shot` draws the routes layer.
- `CLAUDE.md` §5 updated (dash = certainty for lines too; the umber token in §6), `docs/DECISIONS.md` entries, `vocab.json` with the `routes` tracker, and `docs/TEACHER-GUIDE.md` showing how to add a route row.

Not in this piece: a Pacific or world stage (the silver map needs one; separate task), GIF export of a voyage, and route volume data.

## 5. As built (differences from the proposal)

- The cache is `data/gazetteer.json`, not `via.json`; it also feeds point rows, so a point needs no lon/lat in the CSV.
- Umber is derived at navy's lightness lifted by 0.18 (see DECISIONS); at navy's exact lightness it read as a border.
- Points on a route map (ports, capitals, battles) are point rows under the `routes` tracker with their own value list; port of call is a new small steel circle in §5.
- Widths: the three tiers exist in code; every class draws the middle one in v0, since no row can ask for another.
- Ticks and years at dated ports are not drawn; a port with one date prints the year beside its name instead.
- Route names try nine stretches of the line (not "the longest free stretch"), reserved zones include the stage's region and water names, and the Manchu map lands on the 1700 snapshot by the calendar rule.
- Not in this piece, as proposed: a Pacific or Indian Ocean stage (Malindi falls off the Afro-Eurasia sheet), GIF export, volume data.

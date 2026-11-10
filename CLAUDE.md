# Parchment — build brief

Parchment is a standalone historical timeline atlas for the classroom: a live map in the browser with fixed stages, any year from 1200 to 2000, thematic trackers, and a diff view for continuity and change over time. It exports slide-ready images. It is privately aligned to the AP World History (Fall 2026) and AP U.S. History course frameworks through data tags that never appear in the chrome. No course name, no teacher name, anywhere a student or reviewer sees.

Owner: Wil Cosgrove. Wil designs and decides; he does not read code. Explain choices in plain language, show results as pictures, and ask before any decision that is hard to reverse. Everything else: decide, note it in `docs/DECISIONS.md`, and keep moving.

Deadline for v0: Friday 2026-11-06 (classroom use). Ship something that renders by the end of day one, then improve it.

Attribution rule: the README and the site credit Wil for the atlas, its design and its ideas. Code contributions by an AI assistant may be noted in the README's credits line only; nothing may say the atlas was built, designed, or conceived by an AI.

---

## 1. Non-negotiable principles

1. **Never author geometry.** Every polygon, coastline, relief tile and point coordinate is downloaded from a source listed in §3. Do not draw, trace, or hand-adjust shapes. We author attributes (which downloaded polygon gets which category in which year) and point records whose coordinates come from a gazetteer.
2. **Certainty is a field.** Every polygon and record carries `certainty` ∈ {`legal`, `approximate`, `sphere`}. Rendering: legal = solid outline; approximate = dashed outline; sphere = soft blurred edge, no outline. Never render a pre-modern "sphere" as a crisp border.
3. **Every record is time-bounded** (`start`, `end`). The diff view is computed from these, nothing else.
4. **One grammar, many keys.** Visual channels never change meaning (see §5). Trackers only change legend labels and fill categories.
5. **Stepped, not morphed.** Any year can be shown (owner, 2026-11-09); each state takes the shape its source records for that year and changes only at the years the source records a change. The scrub steps through suggested years and crossfades between them. No polygon interpolation.
6. **Content people edit a table, never the code.** The record table (`data/records.csv`) is the only thing non-developers touch. Nothing they type may break the build; bad rows are reported, skipped, and listed.

## 2. Architecture

```
parchment/
  index.html            single-page app (also built to dist/parchment-offline.html)
  src/
    stages/             one JSON per stage: projection, extent, label set
    render/             D3 rendering: base, fills, marks, legend, cartouche, strip
    views/              snapshot, scrub, diff, compare
    export/             PNG (canvas), SVG, GIF
    data/               loaders, CSV→JSON validation, the calendar of suggested years
  data/
    base/               downloaded sources (Cliopatria, OpenHistoricalMap, historical-basemaps, Natural Earth), relief rasters
    records.csv         the record table (see §4) — the only hand-edited data file
    vocab.json          allowed values per column (trackers, categories, base-unit ids)
    calendar.json       suggested years (and the historical-basemaps snapshots the admin page still draws)
  docs/
    DECISIONS.md        every judgment call, one line each, dated
    DATA-LICENSES.md    per-source license and attribution text
    REVIEW-PACKET.md    template for content review (v1)
  scripts/
    fetch-base.mjs      downloads base data; records source URL + commit/date
    derive-cliopatria.mjs  the states of every year 1200–2000: simplified, rewound, colored so neighbors differ
    build-offline.mjs   inlines everything into one HTML file
```

- Static site, no backend. D3 (v7) for GeoJSON rendering. MapLibre only if/when OpenHistoricalMap tiles are added (v1+); not in v0.
- Hosting: GitHub Pages from the public repo `parchment` on Wil's GitHub account, **and** a single self-contained `dist/parchment-offline.html` that opens from a Windows laptop with no network (fonts, data and scripts inlined). Both outputs from one build.
- Repo license: MIT for code. Data stays under its own licenses; `docs/DATA-LICENSES.md` carries attribution and the site footer links to it.
- Fonts: Libre Baskerville (OFL), bundled, no runtime CDN.
- Targets: renders 1920×1080 full-screen with no scrolling on a Windows Dell in Chrome/Edge; also fits 1366×768 (Chromebook) without horizontal scroll. Must feel fast: pre-simplify GeoJSON (topojson, ~0.01° tolerance at world scale), cache projected paths per stage.

## 3. Data sources (download, attribute, never redraw)

| layer | source | license | notes |
|---|---|---|---|
| world polities by year (every world-page stage, since 2026-11-09) | Cliopatria v0.2.1, Seshat Global History Databank (https://github.com/Seshat-Global-History-Databank/cliopatria; Bennett et al., *Scientific Data* 12, 247, 2025) | CC BY 4.0 | One GeoJSON of dated rows: a row holds from `FromYear` to `ToYear` inclusive; a name in parentheses is a whole made of its `Components` (members carry `MemberOf`); `RELATION` rows are vassalage and unions. Rings follow RFC 7946: rewind them for d3. `scripts/derive-cliopatria.mjs` keeps 1200–2000. The owner chose it as the one source of truth for every stage ("they should all be based in the same single source of truth"). Borders before 1648 are `approximate`. |
| world polities by snapshot (until 2026-11-09; now the admin page only) | https://github.com/aourednik/historical-basemaps (`geojson/world_<year>.geojson`, `index.json`) | GPL-3 | Read `index.json` to list available years; pick nearest to each calendar snapshot. Keep `NAME`, `PARTOF`, `SUBJECTO`. Treat pre-1648 borders as `approximate` or `sphere` by default. Its files and scripts stay until the owner decides otherwise. |
| US states/territories 1783–2000 | Newberry Library, Atlas of Historical County Boundaries, "U.S. Historical States and Territories" (https://digital.newberry.org/ahcb/) | any lawful use, no fees (the Library's current terms; files still carry CC BY-NC-SA) | North America stage (`us.html`, 2026-11-05). Day-level `START_DATE`/`END_DATE`. Fetched by `scripts/fetch-us.mjs` with OpenHistoricalMap, the Forest Service's Royce cessions and historical-basemaps' Native homelands; see DECISIONS 2026-11-05. |
| relief, bathymetry, land cover | Natural Earth rasters (https://www.naturalearthdata.com) — shaded relief, ocean bottom, land cover | public domain | Use 1:50m for stages, 1:110m for `world`. Pre-render per stage to PNG tiles sized to the stage viewport. |
| coastlines, lakes, rivers, graticule | Natural Earth vectors (1:50m) | public domain | North America's rivers also at 1:10m with the North American supplement, for framed lesson maps (2026-11-06; `scripts/derive-rivers.mjs`). |
| supplementary boundaries (v1+) | OpenHistoricalMap vector tiles + Overpass API (https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Reuse) | public domain / CC0 | Date-filter with start/end decimal dates. Use only where coverage beats the main source. On the world page: the Holy Roman Empire's treaty-dated outer border, 1648–1766 (`scripts/fetch-europe.mjs`, `derive-europe.mjs`). |
| indigenous territories (v2) | Native Land (https://native-land.ca) GeoJSON | per site terms | |
| point coordinates | Wikidata (P625) or OHM Nominatim | CC0 | `scripts/geocode.mjs` fills `lon,lat` from a Wikidata QID in the record; never typed by hand. |

`scripts/fetch-base.mjs` downloads, records the exact URL and retrieval date into `data/base/MANIFEST.json`, and fails loudly if a source is unreachable. Do not vendor-modify downloaded geometry; derived simplifications are written to a separate `data/base/derived/` folder.

## 4. The record table (`data/records.csv`)

One row per record. Columns, in order:

| column | type | allowed values |
|---|---|---|
| `id` | string | unique, stable, kebab-case |
| `course` | enum | `apworld`, `apush`, `both` |
| `unit` | int | |
| `topic` | string | e.g. `3.1` |
| `kc` | string | e.g. `KC-4.3.II.B` |
| `theme` | enum | AP World: `ENV`,`CDI`,`GOV`,`ECN`,`SIO`,`TEC`; APUSH: `NAT`,`WXT`,`GEO`,`MIG`,`PCE`,`WOR`,`ARC`,`SOC` |
| `tracker` | enum | from `vocab.json` (v0: `extent`, `expansion`; v1: `legitimation`, `administration`, `belief`) |
| `kind` | enum | `region`, `point`, `arrow`, `path`, `value` |
| `where` | string | a state id (from `vocab.json` `states`: one stable id per state, no year, generated from the base layer's names) **or** a Wikidata QID for points; the older base-unit ids (`name@year`) are still read |
| `lon`, `lat` | number | filled by `geocode.mjs`, never by hand |
| `start`, `end` | when | a year (`1526`), a month (`1526-04`) or a day (`1526-04-21`); negative years for BCE; as precise as the source |
| `grade` | enum | `exact`, `circa`, `uncertain` (renders as `1526`, `~1526`, `1526?`) |
| `value` | string/number | category from that tracker's list in `vocab.json`, or a number for `value` kinds |
| `certainty` | enum | `legal`, `approximate`, `sphere` |
| `label` | string | short display label |
| `source` | string | citation or URL |
| `qc_status` | enum | blank, `ok`, `wrong`, `unsure` |
| `qc_by`, `qc_note` | string | reviewer columns |

Rules:
- The loader validates every row against `vocab.json`; invalid rows are skipped and listed in a visible "data problems" panel (dev mode) and in the build log. Never crash on bad data.
- `vocab.json` is the dropdown source for the future Google Sheet (v1). Keep it the single source of allowed values.
- Ship `data/records.csv` with **column headers, 5 fully worked example rows marked `id: example-*` (excluded from render), and no content claims**. Content rows come from the owner and reviewers.
- The CED tags (`course`, `unit`, `topic`, `kc`, `theme`) are filters and metadata only. They never render in the map chrome, legend, cartouche, or exports.

## 5. Visual grammar (constant across every map)

| channel | meaning |
|---|---|
| fill | belonging / category (on the political map: each state its own color, §6 Set C) |
| outline style | certainty (solid / dashed / none+blur) |
| fill opacity | 100% direct control, 40% influence or claim |
| hatch | overlap or dispute |
| point shape | event type: battle/siege = rust diamond; founding/capital = moss circle; monument = navy square; treaty = navy triangle; port of call = small steel circle |
| line style | certainty, for routes as for borders: solid = documented, dashed = approximate, dotted and faint = conjectured. **Dash never encodes type.** |
| route colour | what moved: steel blue = sea trade and voyages; umber (`--route-land`) = land trade; rust = armies and migrations; ink = the carrier of a diffusion. In the Explorers layer only: the state that sent the expedition (`--sponsor-*`, owner 2026-11-06) |
| arrowhead | direction and kind: none (a `path`) or small heads at both ends (trade went both ways); one terminal head = a voyage; closed barb = an army; open chevron = a migration. A one-way route is also tipped at each marked stop on the way, never partway along |
| route width | three categorical widths (2 / 3 / 4.5 px at 1920), the middle by default. Width never encodes volume unless the legend says so |
| number badge | quantity |

Routes are `path` (no direction) or `arrow` (directed) records whose `where` is an ordered list of gazetteer ids (`Q16666>Q36081>…`), splined through the resolved coordinates; the full style, including label placement, is in `docs/ROUTES-STYLE.md`. Labels: every name carries a cream halo; a name is placed only where it overlaps no other name, no route line, no mark and none of the apparatus; at most ten labelled places per map.

- Max **four** fills on any one map, except the political map (owner, 2026-11-09: "we can break the 1 color per empire thing we got going. use the color scheme to highlight countries/states/nations/etc like the other map does"): there every state in force has its own color from Set C, and neighbors never share one. On every other map a fifth category gets a hatch or a point shape.
- A realm built from member states (Cliopatria's wholes: France and its fiefs, England and its Irish earldoms) is a heavier navy line around its members, who keep their own colors; the Holy Roman Empire is a band along the inside of its outer border (Cliopatria's to 1458, OpenHistoricalMap's from 1648, dashed). In the years neither source dates its border (1459–1648, 1659–1678) no line is drawn: the small states Cliopatria groups as its minor states are named "Minor states of the Empire", and the legend says the border is not dated for that year (owner, 2026-11-10).
- Every fill has a grayscale fallback pattern (hatch or dots) selectable with a "print" toggle; P (blue) and T (teal) get the most distinct patterns.
- Diffusion (ideas, beliefs) is never an arrow: render as stepped shading by period (sequential palette).
- Palette grammar: qualitative for categories, sequential for period/intensity, diverging for two-sided splits.

## 6. Color tokens

Set A — theme fills (InSPECT / AP World themes). Tempered for parchment at build: convert to OKLCH, set L ≈ 0.72, C ≈ 0.09, keep hue; check contrast against relief; record the derived hexes in `src/tokens.css`.

| key | theme | seed hex |
|---|---|---|
| In | Environment (ENV) | `#35a360` |
| S | Social (SIO) | `#e0862b` |
| P | Political (GOV) | `#3b7ddd` |
| E | Economic (ECN) | `#d9a400` |
| C | Cultural (CDI) | `#8e55d8` |
| T | Technological (TEC) | `#2aa3b4` |

Set B — marks (apparatus): navy `#1F2A44` (borders, labels, legend frame, timeline baseline) · rust `#C8601A` (conflict, armies, migrations) · steel blue `#2E6F9E` (sea routes and voyages, coastlines, lakes, rivers; never ocean) · umber `--route-land` (land trade routes; derived in `scripts/tokens.mjs` from navy's OKLCH lightness, lifted 0.18 so it reads beside navy at line width, toward hue 50) · moss (founding/administration; derive at the same OKLCH L/C as navy and rust) · slate-gold (the single "focus" color) · cream `#F7F5EF` (paper, land at rest).

Set C — the political map (owner, 2026-11-09; kept over a bolder set, 2026-11-10): twelve state colors, six hues (OKLCH 25, 75, 120, 165, 215, 290), each pale (L 0.86, C 0.055) and mid (L 0.77, C 0.07), tempered like Set A and lighter so names and borders read over them; `--pol-0…11` in `src/tokens.css` (`scripts/tokens.mjs`). `scripts/derive-cliopatria.mjs` gives each state its color so that neighbors in force at the same time never share one and a state keeps its color through time.

Water: ocean = gray-blue at paper lightness (start from `#D9D6CC` nudged toward blue), hairline bathymetry; lakes/rivers = steel blue at 60%.

Rule to test visually: from any pixel a reader can tell a fill (Set A or Set C) from the apparatus (Set B) without the legend. Fills never draw lines or arrows; marks never fill regions.

## 7. Stage look

Antique-atlas register (parchment ground, muted fills, ink labels, gold border, cartouche) over shaded relief. Emulate the genre; do not copy any vendor's border art or cartouche.

- Paper: parchment ground with a procedural fiber texture (SVG filter or canvas noise; no stock texture images).
- Graticule: hairline gold. Bathymetry contours in the ocean tone.
- Relief under every fill; fills at 60–70% so terrain stays legible (the political map's state fills at 78%).
- Type: Libre Baskerville. Regions and seas in spaced small caps; water names italic; labels in navy ink with a thin cream halo.
- Cartouche (bottom-left, bracketed box): "PARCHMENT" wordmark · map title · year shown · scale bar. Nothing else.
- Border: the gold ring becomes the **timeline strip** along the bottom edge: the stage's full span with year ticks, the shown year marked, suggested years as dots.
- Land-cover layer available as a toggle; off by default.

Stages (each a JSON: projection, center, scale, extent, label list):
- `afro-eurasia` (v0): equal-area (Equal Earth or Lambert azimuthal equal-area centered ~45°N 60°E), extent from Morocco to Japan, from the Sahel to the Arctic coast.
- `world` (v2, started 2026-11-06 as `?stage=world`): Equal Earth fitted to the whole globe, in two views (owner, 2026-11-06): the Atlantic view centred 11°E and the Pacific view (`?stage=world-pacific`) centred 150°E. Routes that cross the cut run off one edge and on from the other.
- `north-america` (v2, started 2026-11-05 as `us.html`): Albers equal-area conic (USGS parallels) from Hudson Bay to central Mexico, with Alaska and Hawaii insets; continuous dates 1492–present. Owner to confirm the projection (the brief first said Albers USA, which cannot show New Spain or New France). Lesson maps (2026-11-06, `docs/LESSON-MAPS.md`): the page takes a frame (`?frame=texas`, a focus in `src/focuses.json`, or a box), a sheet size for a slide, a highlight, rivers, places and routes, each also a field of an order form that `npm run map` renders with a packing slip.
- `europe` (started 2026-11-09 as `?stage=europe`, the owner's absolutism lecture): Lambert azimuthal equal-area centered on 52°N 10°E (the EU's ETRS89-LAEA; kept by the owner after the 1715 pictures, 2026-11-09), framed on the `europe` focus. Like every world-page stage it shows any year from Cliopatria (2026-11-09).
- Later: `atlantic-world`, `indian-ocean`, `mediterranean`, `west-africa`.
- Region labels use the AP World framework's region names (its "World Regions" maps); the political map, which names states, hides them and keeps the seas.

## 8. Years and the calendar (`data/calendar.json`)

Any year from 1200 to 2000 can be shown on every world-page stage (owner, 2026-11-09: "i want to be able to type in any year and see the geopolitical landscape of the world"), from one source, Cliopatria (§3): a year box in the toolbar, or `?year=1536`. The calendar's `suggested` years (1200, 1250, 1300, 1400, 1450, 1500, 1530, 1600, 1650, 1700, 1750, 1900, 2000: the course years, Units 3 and 4, and the owner's 1250–1750 maps) are the year buttons, the strip's dots and the steps of the arrows and Play, the same on every stage. Its `snapshots` remain for the historical-basemaps derivation the admin page still draws: for each, which `world_<year>.geojson` was chosen as nearest and the gap in years.

## 9. Views

- **Snapshot**: one year (any year), one tracker, legend, cartouche, strip.
- **Scrub**: steps through the suggested years; crossfade 300 ms; keyboard ← → ; space to play (holds 1.5 s per year).
- **Diff**: any two years side by side (or toggle overlay). Unchanged = muted; appeared = focus color; vanished = outlined in rust with hatch; plus an auto-generated list: appeared / vanished / persisted, from `start`/`end` and base `NAME` changes. This is the CCOT view and the heart of the product.
- **Compare** (v2): select two polities → attribute table from the fill trackers.
- A "reading routine" panel (toggle) with four prompts: two observations, one context, one cause, one thing the map cannot support.

## 10. Exports

- PNG at 1920×1080 and 3840×2160 of the current view, with legend, cartouche and strip baked in; transparent-background option off by default.
- SVG of the current view.
- GIF of a scrub (v1): 1.5 s hold per snapshot, 300 ms fade.
- Every export is branded Parchment only.

## 11. v0 scope (ship by 2026-11-06)

1. `fetch-base.mjs`: download historical-basemaps `index.json` and the snapshots nearest 1450, 1500, 1600, 1700, 1750; Natural Earth 1:50m relief/bathymetry/coast/lakes/rivers/graticule. Write `MANIFEST.json` and `DATA-LICENSES.md`.
2. `afro-eurasia` stage with the full parchment look (§6–7).
3. Extent tracker: base polities rendered with certainty styling; the CED-named Unit 3 polities (Ottoman, Safavid, Mughal, Ming/Qing, Songhai, Morocco, Russia, Tokugawa Japan) highlighted; all others muted.
4. Expansion tracker: `point` records from `records.csv` rendered by shape; empty until rows exist.
5. Snapshot and Diff views; scrub without GIF.
6. PNG export.
7. GitHub Pages deploy + `dist/parchment-offline.html`.
8. `records.csv` template with examples; `vocab.json`; `docs/DECISIONS.md`.
9. Acceptance: open on the Dell at 1920×1080 full-screen, no scroll; switch 1450→1750 in under 200 ms; export a PNG that reads at slide size; the data-problems panel shows a deliberately bad row being skipped.

Order of work: get a plain Equal-Earth map of the 1450 snapshot on screen on day one (ugly is fine), then relief, then parchment, then trackers, then diff, then export, then offline bundle. Something must render at the end of every working session.

## 12. v1 / v2 (do not start without the owner)

- v1: fill trackers (legitimation, administration, belief) with diverging and sequential palettes; grayscale fallbacks; GIF export; Google Sheet → `records.csv` import (sheet uses `vocab.json` for dropdowns; "published to web" CSV, no OAuth); review-packet generator (PNG + rows + three questions).
- v2: `world` and `north-america` stages; Compare view; Newberry data; Native Land; OHM tiles where coverage is better; Diffusion Atlas (religion diffusion, Africa 1200–1450) as a tracker.

Owner direction from 2026-10-29 on nested focuses (stage → region → polity), projection per focus, and teacher-written reasoning-skill readings is in `docs/LAYERS.md`. Questions awaiting the co-teachers are in `docs/CO-TEACHERS.md`.

## 13. Working agreements

- Decide small things; log them. Ask about: projection choice per stage, any change to §5 or §6, anything that would show course or teacher names, anything that deletes data.
- Report in pictures: after each milestone, export a PNG and put it in `docs/progress/` with the date.
- Never fabricate a historical claim to fill a gap. If a polygon or date is missing, leave the gap and log it.
- Keep `README.md` short: what Parchment is, how to run it, how to add a row, data credits. Credits name the data sources and the owner.

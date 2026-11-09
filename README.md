# Parchment

A historical timeline atlas for the classroom. A live map in the browser with fixed stages, snapshot years,
thematic trackers and a diff view for continuity and change over time. It exports slide-ready images.

Parchment is designed and directed by Wil Cosgrove.

## Run it

- Online: https://wcosgrove123.github.io/parchment/
- As a Windows app: `Parchment.exe` (built by `npm run app:build` into `dist/desktop/`), one file to copy to any Windows
  computer. Its own window and icon, no browser, works offline; reads the Google Sheet when there is a network. The
  Desktop shortcut **Parchment** opens it. `F11` is full screen.
- Offline in a browser: open `dist/parchment-offline.html` in Chrome or Edge. No network needed.
- For working on it: `scripts/start-parchment.cmd` starts the dev server at http://127.0.0.1:8321 and opens a browser.
- Keys: `←` `→` step through the snapshot years; `space` plays; `D` toggles the Diff view; `E` exports a PNG (`Shift+E` at 4K).
- Lesson maps: add `?focus=ottoman,safavid,mughal,qing` to the address to light only those states (ids in `src/trackers/extent.json`).
- Trying rows: `?records=data/some-file.csv` reads a file from the site instead of the Sheet.
- Export: the toolbar's Export menu saves the current view as PNG (1920×1080 or 3840×2160) or SVG, with legend, cartouche and timeline baked in.

### The world (`?stage=world`)

The **World** link in the toolbar opens the whole globe (Equal Earth) for transoceanic voyages and exchanges, with
the same trackers, keys and exports, and two more snapshots (1530, 1650). A route that crosses the Pacific edge of
the map runs off one side and carries on from the other. Draft Unit 4 rows to try are in `data/drafts/` (see its
README). Two views: the Atlantic view (`?stage=world`) and the Pacific view (`?stage=world-pacific`); the toolbar switches
between them and keeps the year. The **Explorers** layer (any stage) takes a typed range of years and draws every
expedition whose dates touch it, colored by the state that sent it: `?tracker=explorers&from=1492&year=1522`.

### Europe (`?stage=europe`)

The **Europe** link opens Europe on its own, equal-area and centered on Germany, with two more snapshots (1650, 1715).
It lights France, Spain, the Habsburg Monarchy, Prussia, Sweden and Russia; `?focus=` picks what to light instead
(`?stage=europe&year=1715&focus=britain,dutch-republic` for the constitutional contrast). Use 1715 for the
eighteenth century: the 1700 base map folds Brandenburg and Austria into the Holy Roman Empire.

### North America, 1492 to the present (`us.html`)

The **North America** link in the toolbar opens the United States stage: any year from 1492 to today, or any day
(`us.html?date=1861-04-12`). Trackers: nations and empires, states and territories, Indian land cessions (with the
land each Southeastern nation held under U.S. treaty before Removal, original territories and today's Native land),
Native population, and the Electoral College. Click any area for its source: the record, its dates and the authority
behind it.

- Keys: `←` `→` a year (`Shift` ten); `[` `]` the previous or next change in the record; `space` plays; `E` exports.
  Click or drag the timeline along the bottom.
- Addresses: `?year=1803`, `?date=1803-12-20`, `?tracker=states`, `?tracker=cessions` or `?tracker=population`.
- Sources: U.S. states and territories from the Newberry Library's Atlas of Historical County Boundaries (dated to the
  day, 1783–2000, held open since); colonies, provinces, neighboring countries and some Native nations from
  OpenHistoricalMap; Native homelands 1492–1783 from historical-basemaps; Indian land cessions 1784–1894 from the
  Forest Service's digitization of Royce (1899). Native population: the Census Bureau's counts by state (Working
  Paper 56 for 1860–1990, the redistricting files for 2000–2020) and sourced scholarly estimates before 1890 (Cook,
  Madley, Thornton, Ubelaker). Native land: the Census Bureau's 2025 boundaries (from 2020), the Indian Claims
  Commission's 1978 map, and treaty land computed from Royce. How each is used: `docs/DECISIONS.md`, 2026-11-05 and
  2026-11-06.

### Lesson maps for slides

A small JSON **order form** (frame, date, highlight, rivers, places, size, title) becomes a slide-ready picture and a
**packing slip** listing what is on it, with dates and sources: `npm run map -- tests/maps/texas-1836.json`. Every
field is also an address: `us.html?frame=texas&date=1836-06-01&highlight=texas-republic&size=1600x1550`. Before
choosing a date, ask the data: `npm run describe`, `npm run changes`, `npm run search` (details and the fields in
[docs/LESSON-MAPS.md](docs/LESSON-MAPS.md)). Runs from a fresh clone on Linux or Windows with a Chromium-family browser
(`PARCHMENT_BROWSER`, else Playwright's Chromium, else Chrome or Edge); makes no network calls.

The same commands are tools for Claude through the MCP server `mcp/server.mjs` (`list_frames`, `describe`, `changes`,
`search`, `render`). Claude Code in this folder picks it up from `.mcp.json`; `npm run mcp:smoke` checks it
(`-- --render` also draws a map). Claude Desktop: Settings → Developer → Edit Config, add under `mcpServers` with the
full path to `mcp\server.mjs` in your copy, restart:

```json
"parchment": {
  "command": "C:\\Program Files\\nodejs\\node.exe",
  "args": ["C:\\path\\to\\parchment\\mcp\\server.mjs"]
}
```

It runs on the laptop, so a cloud session reaches it only while the laptop is on; the commands work on their own.

## Work on it

```
npm install          # once
npm run fetch        # download base data (records every source in data/base/MANIFEST.json)
npm run derive       # simplify it for the browser (data/base/derived/)
node scripts/relief.mjs   # pre-render shaded relief per stage (assets/relief/)
npm run dev          # http://localhost:8321/  (rebuilds on save)
npm run build        # app.js for GitHub Pages
npm run shot         # docs/progress/<date>-<year>.png  (-- --year 1700 --focus ottoman,safavid,mughal,qing for a lesson map)
npm run offline      # dist/parchment-offline.html, one file that needs no network
npm run app          # open the desktop window from this folder (-- --shot out.png saves a picture and quits)
npm run app:build    # dist/desktop/Parchment.exe, the Windows app as one file
npm run check        # list rows in data/records.csv that would be skipped, and why
npm run geocode      # fill blank lon/lat from Wikidata for rows whose `where` is a QID
npm run sheet        # dist/parchment-records.xlsx + data/places.csv; -- --lite makes the 12 KB version whose places tab imports itself
npm run pull         # copy the Google Sheet (data/sheet.json) into data/records.csv
npm run fetch:us     # North America sources (Newberry, OpenHistoricalMap, Royce, historical-basemaps); MANIFEST-north-america.json
npm run derive:us    # simplify them into data/us/ (about 4 minutes); then node scripts/relief.mjs north-america
npm run derive:native  # Native population and lands into data/us/ (after derive:us; Working Paper 56 is read by
                       # scripts/census-wp56.py, see its header, only when the PDF changes)
npm run shot -- --page us --year 1803     # a picture of the North America stage (--date 1861-04-12, --tracker cessions)
npm run map -- tests/maps/texas-1836.json # a lesson map from an order form: out/*.png + its packing slip (docs/LESSON-MAPS.md)
npm run describe -- --date 1836-06-01 --frame texas   # what is alive in a frame (also: changes, search)
npm run derive:sources   # OpenHistoricalMap's own source notes per polygon (data/us/ohm-sources.json; after fetch:us)
npm run derive:disputes  # land claimed twice: Newberry against Newberry, and U.S. against Mexican states (data/us/)
node scripts/derive-rivers.mjs   # Natural Earth 1:10m rivers of North America for frames (after fetch)
node scripts/relief-region.mjs   # full-resolution relief of North America for frames (assets/relief/)
```

## Add a row

Teachers: read `docs/TEACHER-GUIDE.md` (one page) and use the **Admin** link in the map's toolbar. The table lives in a
Google Sheet with dropdowns; the map reads it live. The Admin page shows every row beside the map, the rows that were
skipped and why, coverage by unit and topic, and a place finder that shows a place on the map before you copy its id.

Content lives in `data/records.csv`, one row per claim. Allowed values for each column are in `data/vocab.json`.
Rows that fail validation are skipped and listed, in the app's data-problems panel and by `npm run check`; nothing you
type can break the map. Rows whose `id` starts with `example-` are templates and never render.

Content comes from the course materials and the people who teach it: what happened, when, what to call it and the
`source` column are the editor's. The only thing looked up automatically is a dot's position on the map.
For a `point` row, put the place's Wikidata id in `where` (for example `Q605321`, the 1526 Battle of Panipat) and leave
`lon`,`lat` blank: `npm run geocode` fills them from Wikidata and prints the name it found, so a wrong id shows up at once.
A one-year event appears on the first snapshot at or after its year (a 1526 battle shows on the 1600 map), read as
"since the last snapshot"; a span (`start` to `end`) appears on every snapshot inside it.

## Credits

Atlas, design and ideas: Wil Cosgrove. Code written with the help of an AI assistant.
Map data: Historical Basemaps (GPL-3.0), Natural Earth (public domain); for North America also the Newberry Library's
Atlas of Historical County Boundaries, OpenHistoricalMap (CC0), the U.S. Forest Service's Royce land cessions, the U.S.
Census Bureau, and the National Park Service's digitization of the Indian Claims Commission's 1978 map.
Type: Libre Baskerville (OFL).
Full attribution and licenses: [docs/DATA-LICENSES.md](docs/DATA-LICENSES.md). Code: MIT.

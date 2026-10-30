# Parchment

A historical timeline atlas for the classroom. A live map in the browser with fixed stages, snapshot years,
thematic trackers and a diff view for continuity and change over time. It exports slide-ready images.

Parchment is designed and directed by Wil Cosgrove.

## Run it

- Online: https://wcosgrove123.github.io/parchment/
- On this computer: the Desktop shortcut **Parchment** (`scripts/start-parchment.cmd`) starts it at http://127.0.0.1:8321.
- Offline: open `dist/parchment-offline.html` in Chrome or Edge. No network needed.
- Keys: `←` `→` step through the snapshot years; `space` plays; `D` toggles the Diff view; `E` exports a PNG (`Shift+E` at 4K).
- Lesson maps: add `?focus=ottoman,safavid,mughal,qing` to the address to light only those states (ids in `src/trackers/extent.json`).
- Export: the toolbar's Export menu saves the current view as PNG (1920×1080 or 3840×2160) or SVG, with legend, cartouche and timeline baked in.

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
npm run check        # list rows in data/records.csv that would be skipped, and why
npm run geocode      # fill blank lon/lat from Wikidata for rows whose `where` is a QID
npm run sheet        # dist/parchment-records.xlsx + data/places.csv; -- --lite makes the 12 KB version whose places tab imports itself
npm run pull         # copy the Google Sheet (data/sheet.json) into data/records.csv
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
Map data: Historical Basemaps (GPL-3.0), Natural Earth (public domain). Type: Libre Baskerville (OFL).
Full attribution and licenses: [docs/DATA-LICENSES.md](docs/DATA-LICENSES.md). Code: MIT.

# Parchment

A historical timeline atlas for the classroom. A live map in the browser with fixed stages, snapshot years,
thematic trackers and a diff view for continuity and change over time. It exports slide-ready images.

Parchment is designed and directed by Wil Cosgrove.

## Run it

- Online: open the GitHub Pages site for this repository.
- Offline: open `dist/parchment-offline.html` in Chrome or Edge. No network needed.
- Keys: `←` `→` step through the snapshot years; `space` plays; `D` toggles the Diff view; `E` exports a PNG (`Shift+E` at 4K).
- Export: the toolbar's Export menu saves the current view as PNG (1920×1080 or 3840×2160) or SVG, with legend, cartouche and timeline baked in.

## Work on it

```
npm install          # once
npm run fetch        # download base data (records every source in data/base/MANIFEST.json)
npm run derive       # simplify it for the browser (data/base/derived/)
node scripts/relief.mjs   # pre-render shaded relief per stage (assets/relief/)
npm run dev          # http://localhost:8321/  (rebuilds on save)
npm run build        # app.js for GitHub Pages
npm run shot         # docs/progress/<date>-<year>.png
npm run offline      # dist/parchment-offline.html, one file that needs no network
npm run check        # list rows in data/records.csv that would be skipped, and why
npm run geocode      # fill blank lon/lat from Wikidata for rows whose `where` is a QID
```

## Add a row

Content lives in `data/records.csv`, one row per claim. Allowed values for each column are in `data/vocab.json`.
Rows that fail validation are skipped and listed, in the app's data-problems panel and by `npm run check`; nothing you
type can break the map. Rows whose `id` starts with `example-` are templates and never render.

For a `point` row, put the place's Wikidata id in `where` (for example `Q605321`, the 1526 Battle of Panipat) and leave
`lon`,`lat` blank: `npm run geocode` fills them from Wikidata and prints the name it found, so a wrong id shows up at once.
A one-year event appears on the first snapshot at or after its year (a 1526 battle shows on the 1600 map), read as
"since the last snapshot"; a span (`start` to `end`) appears on every snapshot inside it.

## Credits

Atlas, design and ideas: Wil Cosgrove. Code written with the help of an AI assistant.
Map data: Historical Basemaps (GPL-3.0), Natural Earth (public domain). Type: Libre Baskerville (OFL).
Full attribution and licenses: [docs/DATA-LICENSES.md](docs/DATA-LICENSES.md). Code: MIT.

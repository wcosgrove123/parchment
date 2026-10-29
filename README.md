# Parchment

A historical timeline atlas for the classroom. A live map in the browser with fixed stages, snapshot years,
thematic trackers and a diff view for continuity and change over time. It exports slide-ready images.

Parchment is designed and directed by Wil Cosgrove.

## Run it

- Online: open the GitHub Pages site for this repository.
- Offline: open `dist/parchment-offline.html` in Chrome or Edge. No network needed.
- Keys: `←` `→` step through the snapshot years.

## Work on it

```
npm install          # once
npm run fetch        # download base data (records every source in data/base/MANIFEST.json)
npm run derive       # simplify it for the browser (data/base/derived/)
node scripts/relief.mjs   # pre-render shaded relief per stage (assets/relief/)
npm run dev          # http://localhost:8321/  (rebuilds on save)
npm run build        # app.js for GitHub Pages
npm run shot         # docs/progress/<date>-<year>.png
```

## Add a row

Content lives in `data/records.csv`, one row per claim. Allowed values for each column are in `data/vocab.json`.
Rows that fail validation are skipped and listed; nothing you type can break the map. Rows whose `id` starts with
`example-` are templates and never render.

## Credits

Atlas, design and ideas: Wil Cosgrove. Code written with the help of an AI assistant.
Map data: Historical Basemaps (GPL-3.0), Natural Earth (public domain). Type: Libre Baskerville (OFL).
Full attribution and licenses: [docs/DATA-LICENSES.md](docs/DATA-LICENSES.md). Code: MIT.

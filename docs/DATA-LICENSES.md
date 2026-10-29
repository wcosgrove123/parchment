# Data licenses and attribution

Parchment draws no geometry of its own. Every polygon, coastline, relief tile and point coordinate is downloaded
from the sources below by `scripts/fetch-base.mjs`, which records the exact URL, retrieval date and checksum of each
file in `data/base/MANIFEST.json`. The atlas code is MIT-licensed; the data stays under the licenses listed here.

| layer | source | license | attribution |
|---|---|---|---|
| World polities by year | [historical-basemaps](https://github.com/aourednik/historical-basemaps) (commit `da7a4b7`, 2026-09-15) | GPL-3.0 | Historical Basemaps, Andrej Ourednik and contributors. Borders are approximate by nature; see that project's README. |
| Land, coastlines, lakes, rivers, bathymetry | [Natural Earth](https://www.naturalearthdata.com) vectors (1:50m; bathymetry 1:10m) | Public domain | Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com |
| Shaded relief | [Natural Earth](https://www.naturalearthdata.com) raster SR_50M | Public domain | Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com |
| Typeface | [Libre Baskerville](https://github.com/impallari/Libre-Baskerville) via @fontsource | SIL Open Font License 1.1 | Pablo Impallari and Rodrigo Fuenzalida |

Planned for later versions (not yet downloaded): Newberry Library Atlas of Historical County Boundaries (CC BY-NC-SA),
OpenHistoricalMap (CC0 / public domain), Native Land Digital (per site terms), Wikidata coordinates (CC0).

Last run of fetch-base.mjs: 2026-10-29.

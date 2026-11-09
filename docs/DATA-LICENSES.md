# Data licenses and attribution

Parchment draws no geometry of its own. Every polygon, coastline, relief tile and point coordinate is downloaded
from the sources below by `scripts/fetch-base.mjs`, which records the exact URL, retrieval date and checksum of each
file in `data/base/MANIFEST.json`. The atlas code is MIT-licensed; the data stays under the licenses listed here.

| layer | source | license | attribution |
|---|---|---|---|
| World polities by year | [historical-basemaps](https://github.com/aourednik/historical-basemaps) (commit `4b5039e`, 2026-11-02) | GPL-3.0 | Historical Basemaps, Andrej Ourednik and contributors. Borders are approximate by nature; see that project's README. |
| Land, coastlines, lakes, rivers, bathymetry | [Natural Earth](https://www.naturalearthdata.com) vectors (1:50m; bathymetry 1:10m; rivers of North America also 1:10m, with the North American supplement, for framed lesson maps) | Public domain | Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com |
| Shaded relief | [Natural Earth](https://www.naturalearthdata.com) raster SR_50M | Public domain | Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com |
| U.S. states and territories, 1783–2000, dated to the day (North America stage) | [Atlas of Historical County Boundaries](https://digital.newberry.org/ahcb/), The Newberry Library: U.S. Historical States and Territories, generalized 0.001° (2011) | Newberry terms: any lawful purpose, no fees ([rights and reproductions](https://www.newberry.org/rights-and-reproductions)); the files still carry the original CC BY-NC-SA 2.5 deed, which the Library says may be ignored | Atlas of Historical County Boundaries, ed. John H. Long; U.S. Historical States and Territories compiled by Peter Siczewicz and Emily Kelley. Chicago: The Newberry Library, 2011. |
| Colonies, provinces, neighboring countries, some Native nations, 1492 → (North America stage) | [OpenHistoricalMap](https://www.openhistoricalmap.org) via its Overpass API | CC0 1.0 | OpenHistoricalMap contributors |
| Indian land cessions, 1784–1894 (North America stage) | U.S. Forest Service, Office of Tribal Relations: [Indian Land Cessions in the United States](https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_TribalCessionLands_01/MapServer/0), digitized from the 67 maps of Charles C. Royce, comp., *Indian Land Cessions in the United States*, 18th Annual Report of the Bureau of American Ethnology, part 2 (1899) | U.S. Government work; catalog.data.gov lists CC BY 4.0 | U.S. Forest Service; Charles C. Royce (1899). |
| Typeface | [Libre Baskerville](https://github.com/impallari/Libre-Baskerville) via @fontsource | SIL Open Font License 1.1 | Pablo Impallari and Rodrigo Fuenzalida |

The North America stage's sources are downloaded by `scripts/fetch-us.mjs`, which records URLs, queries, dates and
checksums in `data/base/MANIFEST-north-america.json`. Point coordinates come from Wikidata (CC0) through
`scripts/geocode.mjs`. Planned, not yet downloaded: Native Land Digital (per site terms).

Last run of fetch-base.mjs: 2026-11-06.

<!-- fetch-us:native:start -->

### North America stage: Native population and Native lands

Downloaded by `scripts/fetch-us.mjs` (URLs, dates and checksums in `data/base/MANIFEST-north-america.json`) and
derived by `scripts/derive-native.mjs`.

| layer | source | license | attribution |
|---|---|---|---|
| American Indian population by state, 1860–1990 | Campbell Gibson and Kay Jung, [*Historical Census Statistics on Population Totals by Race, 1790 to 1990, and by Hispanic Origin, 1970 to 1990, for the United States, Regions, Divisions, and States*](https://www.census.gov/content/dam/Census/library/working-papers/2002/demo/POP-twps0056.pdf), U.S. Census Bureau, Population Division Working Paper No. 56 (2002); read from the PDF by `scripts/census-wp56.py` | Public domain (U.S. Government work) | U.S. Census Bureau |
| American Indian and Alaska Native population by state, 2000, 2010, 2020 | U.S. Census Bureau, [P.L. 94-171 redistricting data](https://www.census.gov/programs-surveys/decennial-census/about/rdo/summary-files.html), national files for 2000, 2010 and 2020 | Public domain (U.S. Government work) | U.S. Census Bureau |
| American Indian, Alaska Native and Native Hawaiian areas today (from 2020) | U.S. Census Bureau, [cartographic boundary file](https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html) `cb_2025_us_aiannh_500k` (2025, 1:500,000) | Public domain (U.S. Government work) | U.S. Census Bureau |
| Original tribal territories, as judicially established (1784–1978) | Indian Claims Commission, *Indian Land Areas Judicially Established* (map, 1978), as digitized by the National Park Service ([ArcGIS Online feature service](https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/Indian_Land_Areas_Judicially_Established_1978/FeatureServer/5)) | Public domain (U.S. Government work); the Park Service notes the areas are not legal documents | Indian Claims Commission (1978); National Park Service |
| Land held under U.S. treaty, 1785–1835 (computed, not drawn) | The Royce areas above, joined by `scripts/derive-native.mjs`; the treaties' places and first dates in `data/us/treaty-places.csv` from Charles C. Royce, *The Cherokee Nation of Indians*, 5th Annual Report of the Bureau of Ethnology (1887), and Royce (1899) | Public domain (U.S. Government works) | Charles C. Royce (1887, 1899); U.S. Forest Service |
| Native population before the census (estimates) | Figures cited, each with its source, grade and range, in `data/us/native-estimates.csv`: S. F. Cook (1976), A. L. Kroeber (1925), B. Madley (2016), D. H. Ubelaker (1988) and R. Thornton (1987), the last two as reported by the National Research Council (2001) and by J. D. Hacker and M. R. Haines (NBER Working Paper 12572, 2006) | Cited figures; no text or map reproduced | The authors named |

<!-- fetch-us:native:end -->

<!-- fetch-electoral:start -->

### North America stage: the Electoral College

Downloaded and checked by `scripts/fetch-electoral.mjs` (URLs, dates and checksums in `data/base/MANIFEST-electoral.json`).
Which party each candidate belongs to, where the Archives does not say, is authored in `src/us/parties.json`.

| layer | source | license | attribution |
|---|---|---|---|
| Electoral College, 1789–2024, state by state | U.S. National Archives and Records Administration, [Electoral College box scores](https://www.archives.gov/electoral-college), one page per election | Public domain (U.S. Government work) | U.S. National Archives and Records Administration |

<!-- fetch-electoral:end -->

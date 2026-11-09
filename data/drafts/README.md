# Draft rows (not live)

Candidate rows for the world stage's Unit 4 maps, drafted on 2026-11-06 for Wil's review. **The voyage rows are in the
live Google Sheet** (rows 7–36 of the records tab, owner's request, 2026-11-06), marked for review: `qc_status` blank,
`qc_note` starts "TO REVIEW". Each cites the published work it was drafted from (author, title, publisher, year) and
says in `qc_note` what the owner still has to decide (names, dates, which stops to show). Review them in the Sheet; this
file is the copy they were typed from. **The exchange rows are not in the Sheet.** What happened, when, what to call it and the source are the owner's and the textbook's: change
anything, delete anything.

| file | what | try it |
|---|---|---|
| `unit4-voyages.csv` | the Explorers layer (value = the state that sent them): Columbus, Cabot, da Gama, Cabral, Balboa, Magellan and Elcano, Cortés, Pizarro, Cartier, Cabrillo; plus Francis Xavier under Routes as a carrier of a belief | `index.html?stage=world&tracker=explorers&from=1492&year=1600&records=data/drafts/unit4-voyages.csv` (type any range) |
| `unit4-exchange.csv` | the Manila galleons, the silver roads, the forced migration of enslaved Africans, the British "triangular" legs | `…&records=data/drafts/unit4-exchange.csv&year=1600` (also 1650, 1700) |

For the Pacific view use `stage=world-pacific` (the galleons and Magellan's crossing whole; Atlantic crossings cut
at the map's edge instead). Pictures: `npm run shot -- --stage world --tracker explorers --from 1492 --year 1522
--records data/drafts/unit4-voyages.csv --out docs/progress/<name>.png`.

Places are Wikidata ids, looked up by name and checked against their description and coordinate, then resolved
into `data/gazetteer.json` by `npm run geocode -- --file data/drafts/<file>.csv`. Lines join ports and landfalls in
order; they are not the ships' tracks. Lines whose stops are documented are drawn solid (owner, 2026-11-06); Cabot's,
whose landfall is disputed, is dotted (conjectured).

Under Explorers a row shows when its dates touch the typed range. Under Routes (the exchange file) a record shows on
every snapshot inside its dates and on its home snapshot, the first at or after its start.

Not drafted: the Columbian Exchange's crops, animals and diseases. The grammar draws diffusion as stepped shading by
period, never an arrow, and the diffusion tracker is v2 work that waits for the owner (brief §12).

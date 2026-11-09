# The world stage: what is built, and what Wil decides

Started 2026-11-06 for Unit 4 (transoceanic voyages and exchanges, c. 1450–1750) and APUSH Period 1. Open it from
the **World** link in the toolbar, or `index.html?stage=world`. The decisions behind it are in `DECISIONS.md`
(2026-11-06); the draft rows are in `data/drafts/` (see its README).

## What is built

- The whole globe in Equal Earth, in the two views you asked for: the **Atlantic view** (centered 11°E, the cut
  down the Pacific) and the **Pacific view** (centered 150°E, the cut down the open Atlantic). The toolbar switches
  between them and keeps the year. Relief, the historical-basemaps polities, every layer, key and export, and two
  extra snapshots for this stage only: 1530 and 1650.
- The **Explorers** layer you asked for: pick *Explorers*, type a range of years (from, to), and every expedition
  whose dates touch that range is drawn, colored by the state that sent it (Spain, Portugal, England, France,
  the Dutch). The cartouche shows the range and the base map under it. Missionaries are not in it: cultural
  diffusion is not state exploration, so Xavier stays under Routes as the carrier of a belief.
- Lines as you decided: solid when the stops are documented (Cabot's disputed landfall stays dotted); arrowheads at
  the end and at each marked stop, never partway along; routes that share a stretch of sea run side by side; the
  base map steps back under route layers so the lines lead.
- Routes that cross the edge of the map run off one side and come back in on the other, at the same height.
- 30 explorer and conquest rows (with Xavier), in the live Sheet since 2026-11-06 and marked "TO REVIEW", and 14
  trade and exchange rows still only in `data/drafts/` (not in the Sheet), each with its scholarly source and a note
  saying what is still yours to decide. Where a straight line between
  two stops would cross land, a cape on the coast is added as a waypoint and the row says so.
- Pictures: `docs/progress/2026-11-06-world-explorers-1492-1522.png`, `-world-explorers-1492-1600.png`,
  `-world-pacific-explorers-1492-1600.png`, `-world-1650-exchange-solid.png`. The `-voyages` pictures from earlier
  the same day show the look before your answers, for comparison.

## Questions for Wil

1. **The rows, for class.** Your ranges (1492–1522 and 1492–1600) are one-click buttons under Explorers, and the 30
   voyage rows are in the Sheet (rows 7–36), each cited and marked "TO REVIEW". Review them there: set `qc_status` to
   ok, wrong or unsure and sign `qc_by`. A row marked wrong stops drawing. The public site reads them only once the
   one-line fix to `data/sheet.json` (`&headers=1`) is pushed; the app on this computer already does. One map per
   explorer, for the Monument Project, would still need a way to pick a single row.
2. **Names and dates.** Every name on a line is a placeholder in the textbook's "Name year" style ("da Gama 1497").
   Draw Columbus's return? Cabot's landfall at Cape Bonavista (Newfoundland's claim; dotted)? The silver roads'
   first and last years are marked uncertain in the rows.
3. **Colors per state** are a first choice (Spain red, Portugal green, England purple, France blue, the Dutch
   teal). Change any you like, as long as none is one of the fill colors.
4. **Two drawing choices left.** The galleons sailed out and home on different lanes: two lines with no heads (as
   drafted) or one line with heads at both ends? Balboa's overland party: a short line (as drafted) or a point?
5. **Zheng He in the Explorers layer?** His voyages were state-sponsored (Ming); they would need a sixth color. The
   comparison with da Gama is a natural use.
6. **The Columbian Exchange itself.** Crops, animals and disease are diffusion: the grammar shades regions by period
   and never draws an arrow, and that tracker is v2 work waiting for you. Which items, regions and periods
   (Richards' article, the textbook)?
7. **Rows taught in both courses** carry AP World's unit (4) and APUSH's key concept. The table has one unit column:
   keep it that way, or one row per course?
8. **Which states does the Extent layer highlight on the world map?** It still lights the Unit 3 land empires.
   Unit 4 is about the maritime empires; which ones, from when?
9. **Afro-Eurasia.** Add a 1650 snapshot there too, so the Manchu advance (1616–1644) lands closer to its dates?
   And the live Zheng He and Manchu rows are still dashed: make them solid under the new rule?

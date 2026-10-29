# Layers, focus and reasoning skills — design note

Owner direction captured 2026-10-29. This is the shape of v1 and v2; v0 (ships 2026-11-06) is unchanged.
Nothing here is built yet. Decisions that need a teacher are listed in `CO-TEACHERS.md`.

## 1. Focus levels

The map always shows one **focus**. A focus is what the brief calls a stage: a projection, an extent, a label set.
Focuses nest, and the user moves between them by zooming into a region, clicking a polity, or picking
"Switch map → Focus on …" in the settings panel.

| level | example | what is drawn | what is in the margin |
|---|---|---|---|
| **stage** | Afro-Eurasia, World, North America | base polities, highlights, marks | legend, cartouche, strip only |
| **region** | East Asia (the AP World region) | the region's polities, named; neighbours muted | reasoning-skill readings for that region and year |
| **polity** | Ming China, Tokugawa Japan | the polity's subdivisions: provinces, eyalets, subahs, domains | readings for that polity; the centralization panel |

Rules that carry over from the brief: one visual grammar at every level; certainty and time bounds on every
polygon; no geometry drawn by hand. Subdivision boundaries must come from a downloadable source per polity
(see `CO-TEACHERS.md` item 6); where none exists, the polity level shows no subdivisions and says so.

**Projection follows the focus.** Each focus file names its projection. Proposal: Equal Earth for wide east–west
bands, Lambert azimuthal equal-area for compact focuses (centred on the focus), Albers for mid-latitude bands.
"Focus on Africa" therefore switches to azimuthal centred on Africa without the user choosing a projection.
Switching focuses crossfades like a snapshot switch; nothing morphs.

**Zoom in the map itself** is not free panning. It snaps to the nearest focus (region, then polity) and announces
the switch in the cartouche. Panning freely breaks the cartouche, the scale bar and the strip, so it is off.

## 2. Centralization of authority

A tracker, not a label. The brief's v1 trackers already cover it: `legitimation` (how rule is justified: religious,
divine right, ritual, monument …) and `administration` (how rule is carried out: devshirme, salaried samurai,
zamindars, tax farming, tribute lists, hard currency, bureaucratic elites …). At the polity level the same trackers
colour subdivisions where the data supports it (which provinces were directly administered, which were tributary).
"Mandate of Heaven" and "divine right" are values of `legitimation`, so they appear in the legend of that tracker,
never as a label on the map.

Comparison across polities (Ming vs. Ottoman administration) is the Compare view in the brief (v2), fed by these
trackers.

## 3. Reasoning-skill readings

Students and teachers see three kinds of historical reasoning, and each has a different shape in data. These items
are **written by teachers** in a table, never generated. They appear **only at region and polity focus**, in the
margin around the map, the way a reference wall map puts its text around a clean map. The map itself stays
free of them; selecting a reading highlights its anchors on the map.

Working name for these items: *readings* (open: `CO-TEACHERS.md` item 8). On-map items stay *marks*.

| kind | shape | longitudinal? | anchors |
|---|---|---|---|
| **comparison** | two or more subjects, one aspect, one year or window | no | two or more records or polities |
| **continuity** | the same subject at t1 and t2; x1 is continuous with x2 | yes | two records (evidence pair) |
| **change** | the same subject; x at t1 became y at t2 | yes | two records |
| **causation** | cause x at t1 produced effect y at t2 ≥ t1 | the effect is | cause record(s), effect record(s) |

A comparison becomes longitudinal only when its aspect is itself a change, continuity, cause or effect; the table
allows that by letting a reading anchor another reading.

Proposed table, `data/readings.csv` (not built; columns to confirm with co-teachers):

| column | meaning |
|---|---|
| `id` | unique, kebab-case |
| `kind` | `comparison`, `continuity`, `change`, `causation` |
| `course`, `unit`, `topic`, `kc`, `theme` | CED tags, filters only, never shown (as in `records.csv`) |
| `focus` | region or polity id where it appears |
| `aspect` | the thing compared or traced, in a few words (e.g. "basis of legitimacy") |
| `start`, `end` | the window; a comparison usually has start = end |
| `anchors` | record ids or polity ids, separated by `;`, in order (cause before effect; t1 before t2) |
| `claim` | one sentence a student could defend |
| `evidence` | two or three sentences |
| `prompt` | the question put to students (optional) |
| `source`, `qc_status`, `qc_by`, `qc_note` | as in `records.csv` |

Validation follows the same rule as records: bad rows are skipped and listed, never fatal. A reading whose
anchors fall outside its focus or window is reported, not drawn.

## 4. How students play with it

- At region focus: pick a reading → its anchors light up in the focus colour, the rest mute; the margin shows claim,
  evidence and the prompt. Two readings of the same kind can be shown side by side for comparison practice.
- At polity focus: the centralization panel shows the active tracker's values for that polity, with the
  subdivisions coloured; switching the tracker (legitimation ↔ administration) re-colours without moving the map.
- Diff view works at every level; at polity level it diffs subdivisions.
- The reading-routine panel (four prompts) stays available at every level.
- Exports at region and polity focus include the margin text, so a reading can go straight onto a slide.

## 5. Order of work after v0

1. Focus files for the AP World regions over the Afro-Eurasia stage (projection per focus, crossfade switch,
   "Switch map" in settings). No new data needed.
2. `readings.csv` loader and the margin panel at region focus, with the v1 fill trackers.
3. Polity focus with subdivisions, one polity at a time, as data sources are found and licensed.
4. Compare view (already v2 in the brief).

Nothing in this list starts before the owner says so (brief §12).

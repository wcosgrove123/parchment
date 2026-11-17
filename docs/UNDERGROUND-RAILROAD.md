# The Underground Railroad layer: research, rows and what is not drawn

Written 2026-11-17 for the owner's request of that day ("a map of the underground railroad … a toggle button for the
slavery layer … it shows me all the paths for the year that i select. by 1865, it'll be all the roads … have it do
research on the towns it went through"). This file is the research behind every row of
`data/us/underground-railroad.csv`. The rows are TEST ROWS until the owner reviews them.

## How to read this file

1. **Part 1** lists the routes on the map, each with its places, years, line style, source and a note on what the
   source does and does not say. It is written out from the same list the table is (`scripts/underground-rows.mjs`,
   by `scripts/underground-doc.mjs`).
2. **Part 2** lists what the research found and the map does **not** draw, and why.
3. **Part 3** is the research file itself: every source read, with its address; the corridors as the sources give them;
   the Wikidata ids; the numbers; what historians warn about; how other publishers' maps describe themselves.

## What a reader should know before trusting any line

- **The lines are schematic.** The National Park Service's own study says no map with arrows could hold what happened,
  that there were "no predetermined trails", and that overland routes in the Northeast are "virtually impossible" to
  trace "with any precision" (NPS-THEME). Each line here joins places a source names; between them it is a computed
  curve, not a road. The key's dashes say how far each line can be trusted.
- **Most escapes were short and from the border states**; very few people escaped from the Deep South (HB-BORD,
  NPS-THEME). The map has no lines out of Mississippi or Alabama because no source read documents one.
- **Help came mainly from free Black communities**, and many people escaped with no help at all (NPS-THEME, NPS-FAQ).
- **Siebert (1898) overstated the organized network**; his town chains come from recollections gathered in the 1890s
  (Gara 1961, as reported in HB-CREW). Lines that rest on Siebert or on local tradition alone are dashed and say so.
- **How this was read.** The research was done by an AI research pass on 2026-11-17 that read the web pages listed in
  Part 3 through a tool that returns a digest of each page, not its raw text (the NPS theme study and one Florida
  article were read as text). **The books themselves (Foner, Baumgartner, Larson, Still, Coffin, Siebert in full) were
  not read**: they appear through their authors' essays in the NPS handbook and through reference pages. Short quoted
  phrases should be checked against the page before they are printed anywhere. This is the owner's review to make.
- **Years.** A route comes onto the map in the first year a source documents it (a founding, a dated escape) and stays
  to the end of 1865, as the owner asked ("by 1865, it'll be all the roads"). That first year is the first *documented*
  use, not the first use: people fled along most of these ways earlier than any record. Each row also keeps its last
  documented year; the Spanish Florida line, for one, was last used in 1763 and is still on the 1860 map under this
  rule. The NPS runs the Underground Railroad to the end of the Civil War (NPS-WHAT, NPS-FAQ).
- **Line style.** Solid: a chain of stops documented by the NPS handbook's essays or by dated cases. Dashed: the ends
  are documented and the way between is not, or the chain rests on later recollections. Dotted: a direction only (no
  source names any place on the way). Width is the same everywhere: **no source gives numbers by corridor** good enough
  to set widths (Part 3, section C.4), so the map does not use width the way National Geographic's does.
- **The South (added at the owner's word, 2026-11-17: "why is there nothing in the south?").** Six dotted lines,
  `ugrr-south-…`, draw the general pattern the NPS study states in words (north by land or water east of the
  mountains; across the Ohio out of Virginia, Kentucky and Tennessee; from Arkansas across Missouri). They are
  directions, not documented routes: no source names a place on them, their towns stand for regions, and each comes
  onto the map with the documented road it joins, having no year of its own. No line starts in Mississippi, Alabama or
  inland Georgia: the same sources say very few people escaped from there, and most who fled in Georgia and Florida
  went south. Three open rings mark places people fled to and stayed (the Great Dismal Swamp, the Okefenokee,
  Prospect Bluff); the Okefenokee's years are borrowed and marked uncertain.
- **Editor's choices, to check.** Where a source gives a region and not a town, a town stands for it and the row's note
  says so: Natchitoches, Houston and San Antonio (the Mexico lines), Charleston (Carolina), Urbana (the belt of
  settlements north of Cincinnati), Cassopolis (Cass County), and every waypoint at sea.

## Part 1. The routes on the map

<!-- routes:start (written by scripts/underground-doc.mjs) -->

### `ugrr-wilmington-philadelphia`: Wilmington to Philadelphia (Thomas Garrett)

- **Places, in order:** Wilmington `Q174224` → Philadelphia `Q1345`
- **On the map from** about 1822; last documented 1861. **Line:** solid (documented stops).
- **Source:** Foner, "Middle Atlantic", NPS Underground Railroad Handbook (Dickinson, HB-FONER); Wikipedia, "Thomas Garrett" (WP-GARRETT)
- **Note:** Garrett worked in Wilmington from 1822 and sent people on to the Philadelphia committee. 1861: J. Miller McKim's remark that the Underground Railroad was in effect over (HB-FONER); the NPS itself runs it to 1865.

### `ugrr-tubman-delmarva`: Eastern Shore of Maryland to Wilmington (Harriet Tubman's route)

- **Places, in order:** Preston `Q611879` → Sandtown `Q7416983` → Camden `Q754342` → Dover `Q33518` → Smyrna `Q755736` → New Castle `Q755393` → Wilmington `Q174224` → Philadelphia `Q1345`
- **On the map from** 1849; last documented 1860. **Line:** solid (documented stops).
- **Source:** NPS, Harriet Tubman Underground Railroad NHP, "Harriet Tubman" (NPS-TUB); Wikipedia, "Harriet Tubman", citing Larson 2004 and Clinton 2004 (WP-TUB)
- **Note:** Poplar Neck near Preston, then Sandtown, Camden (the Brinkleys and Abraham Gibbs), past Dover and Smyrna, New Castle, Wilmington (Garrett), Philadelphia (William Still). Her own escape, autumn 1849; return trips 1850 to 1860. This is the chain of her later trips as Larson reconstructs it: the way of her first escape is not known. East New Market (Sam Green) and Willow Grove are on the chain in the source and left off the line, which is too short to show them apart.

### `ugrr-philadelphia-new-york`: Philadelphia to New York

- **Places, in order:** Philadelphia `Q1345` → New York `Q60`
- **On the map from** 1835; last documented 1861. **Line:** solid (documented stops).
- **Source:** Foner, "Middle Atlantic" (HB-FONER); NPS handbook timeline (HB-TIME)
- **Note:** 1835: David Ruggles founds the New York Committee of Vigilance. By train and ferry across New Jersey; no source read names a New Jersey town except Siebert (1898), from recollections.

### `ugrr-new-york-canada`: New York to Canada by Albany, Syracuse and Niagara

- **Places, in order:** New York `Q60` → Albany `Q24861` → Syracuse `Q128069` → Rochester `Q49218` → Buffalo `Q40435` → Niagara Falls `Q128133` → St. Catharines `Q126805`
- **On the map from** about 1842; last documented 1861. **Line:** solid (documented stops).
- **Source:** Foner, "Middle Atlantic" (HB-FONER); Harrold, "Washington, Maryland, Virginia" (HB-HARROLD); NPS theme study, 2000 (NPS-THEME)
- **Note:** Albany (Stephen Myers), Syracuse (Jermain Loguen), Rochester (Frederick Douglass), Buffalo, the Niagara crossing, St. Catharines. 1842: Charles Torrey's party reaches Albany, the earliest dated use of the road north of New York in what was read; Sydney Howard Gay's record of 1855 to 1856 documents Syracuse best. The Albany leg is less fully attested than the Syracuse leg.

### `ugrr-new-york-springfield`: New York into New England

- **Places, in order:** New York `Q60` → Hartford `Q33486` → Springfield `Q49158`
- **On the map from** 1838; last documented 1842. **Line:** solid (documented stops).
- **Source:** Grover, "The New England Network to Freedom", NPS handbook (HB-GROVER)
- **Note:** James Lindsay Smith's journey of 1838: from Ruggles in New York by Hartford to Springfield, Massachusetts (he settled at Norwich, Connecticut, by 1842). One documented journey; many who reached New England stayed there.

### `ugrr-vermont`: Albany to Canada through Vermont

- **Places, in order:** Albany `Q24861` → Troy `Q600301` → Bennington `Q817921` → Rutland `Q25893` → Ferrisburgh `Q1874592` → Burlington `Q31058` → St. Albans `Q1787559` → Montreal `Q340`
- **On the map from** about 1838; last documented 1856. **Line:** dashed (approximate).
- **Source:** Siebert, The Underground Railroad from Slavery to Freedom (1898), ch. V (SIEBERT-V); Grover (HB-GROVER)
- **Note:** The town chain (Troy, Bennington, Rutland, Ferrisburgh, St. Albans) and Montreal as its end are Siebert's, gathered from recollections in the 1890s: dashed. Grover documents Ferrisburgh (Rowland T. Robinson, 1838), Burlington (Joshua Young) and St. Albans (people forwarded by train, 1854 and 1856), and warns that Vermont was less safe than tradition says.

### `ugrr-sea-norfolk-philadelphia`: By sea from Norfolk to Philadelphia

- **Places, in order:** Norfolk `Q49231` → Cape Henry (sea waypoint, not a stop) `Q1640805` → Cape Henlopen (sea waypoint, not a stop) `Q2903487` → Wilmington `Q174224` → Philadelphia `Q1345`
- **On the map from** 1854; last documented 1857. **Line:** solid (documented stops).
- **Source:** Newby-Alexander, "The Atlantic Coastal Freedom Network", NPS handbook (HB-NEWBY); Foner (HB-FONER); NPS theme study (NPS-THEME)
- **Note:** Dated cases 1854 to 1857 (John Atkinson, 1854; Captain Fountain's vessel, which often called at Wilmington, 1855 to 1856). The ports are documented; the line at sea is schematic, run by Cape Henry and Cape Henlopen to keep it off the land.

### `ugrr-sea-richmond-norfolk`: By water from Richmond

- **Places, in order:** Richmond `Q43421` → Norfolk `Q49231`
- **On the map from** about 1855; last documented 1857. **Line:** dashed (approximate).
- **Source:** Newby-Alexander (HB-NEWBY)
- **Note:** Captain Albert Fountain's packet took people aboard at Richmond as well as Norfolk. The line stands for the James River; it does not follow it.

### `ugrr-sea-norfolk-new-bedford`: By sea from Norfolk to New Bedford

- **Places, in order:** Norfolk `Q49231` → Cape Henry (sea waypoint, not a stop) `Q1640805` → Block Island (sea waypoint, not a stop) `Q884674` → New Bedford `Q49147`
- **On the map from** about 1842; last documented 1857. **Line:** solid (documented stops).
- **Source:** Newby-Alexander (HB-NEWBY); Grover (HB-GROVER); NPS theme study (NPS-THEME)
- **Note:** Vessels from Norfolk and Portsmouth, Virginia, for New Bedford and Boston. The ports are documented; the line at sea is schematic (by Cape Henry and Block Island).

### `ugrr-sea-norfolk-boston`: By sea from Norfolk to Boston

- **Places, in order:** Norfolk `Q49231` → Cape Henry (sea waypoint, not a stop) `Q1640805` → Block Island (sea waypoint, not a stop) `Q884674` → Nantucket (sea waypoint, not a stop) `Q49149` → Provincetown (sea waypoint, not a stop) `Q49154` → Boston `Q100`
- **On the map from** 1842; last documented 1857. **Line:** solid (documented stops).
- **Source:** NPS theme study (NPS-THEME); Newby-Alexander (HB-NEWBY)
- **Note:** George Latimer reached Boston from Norfolk in 1842. The line at sea is schematic (by Cape Henry, Block Island, Nantucket and Provincetown, round Cape Cod).

### `ugrr-sea-savannah-new-york`: By sea from Savannah to New York

- **Places, in order:** Savannah `Q83813` → Cape Hatteras (sea waypoint, not a stop) `Q978032` → Sandy Hook (sea waypoint, not a stop) `Q1028611` → New York `Q60`
- **On the map from** 1834; last documented 1834. **Line:** solid (documented stops).
- **Source:** Grover (HB-GROVER)
- **Note:** Moses Roper, by schooner, 1834: one documented voyage. Bordewich (NPS handbook) says the few who escaped the Deep South mostly hid on ships. The line at sea is schematic (by Cape Hatteras and Sandy Hook).

### `ugrr-washington-baltimore`: Washington and Baltimore to Philadelphia

- **Places, in order:** Washington `Q61` → Baltimore `Q5092` → Wilmington `Q174224` → Philadelphia `Q1345`
- **On the map from** 1842; last documented 1857. **Line:** solid (documented stops).
- **Source:** Harrold, "Escaping in and around Washington, D.C., Maryland, Virginia", NPS handbook (HB-HARROLD)
- **Note:** Thomas Smallwood and Charles Torrey's network, 1842 to 1846, by Baltimore (Jacob Gibbs) and Wilmington (Garrett backed the wagon trip of 1843); Jacob Bigelow with William Still, 1854 to 1857. The source names no stop between Washington and the Pennsylvania line, and none is drawn.

### `ugrr-columbia`: Across the Susquehanna at Columbia

- **Places, in order:** York `Q821105` → Columbia `Q1133892` → Philadelphia `Q1345`
- **On the map from** about 1838; last documented 1858. **Line:** dashed (approximate).
- **Source:** NPS theme study (NPS-THEME); Pennsylvania State Historic Preservation Office, "The Underground Railroad: Columbia, Lancaster County" (PA-SHPO)
- **Note:** York (William C. Goodridge, "reputed"), over the Columbia-Wrightsville bridge (1834), and from Columbia in Stephen Smith and William Whipper's rail cars to Philadelphia, from 1838 to the late 1850s. It rests largely on Whipper's own letter of 1871; the NPS calls Columbia a site of legend.

### `ugrr-elmira`: Philadelphia to Rochester by Harrisburg and Elmira

- **Places, in order:** Philadelphia `Q1345` → Harrisburg `Q25280` → Williamsport `Q1016159` → Elmira `Q934135` → Watkins Glen `Q2738851` → Canandaigua `Q1363104` → Rochester `Q49218`
- **On the map from** about 1851; last documented 1860. **Line:** dashed (approximate).
- **Source:** NPS theme study (NPS-THEME); Wikipedia, "John W. Jones (ex-slave)" (WP-JONES)
- **Note:** Harrisburg, Williamsport, Elmira (John W. Jones), Watkins Glen, Canandaigua, Rochester: the NPS gives the chain as "reputed to have been" and does not date it. Wikipedia has Jones an active agent from 1851 (its lead says from his arrival in 1844) and, after the Williamsport to Elmira track was finished in 1854, sending people on in a baggage car of the Northern Central Railway; it cites no source for that section.

### `ugrr-pittsburgh`: The Monongahela valley to Pittsburgh and Lake Erie

- **Places, in order:** Uniontown `Q1187047` → Pittsburgh `Q1342` → Cleveland `Q37320`
- **On the map from** about 1841; last documented 1847. **Line:** dashed (approximate).
- **Source:** Churchill, "The Underground Railroad in the Ohio River Valley", NPS handbook (HB-CHURCHILL)
- **Note:** Uniontown and Pittsburgh are documented (Black crowds rescued people at Pittsburgh four times, 1841 to 1847); from Pittsburgh the source says only "northwest to Cleveland and the Western Reserve".

### `ugrr-marietta`: Across the Ohio at Marietta

- **Places, in order:** Williamstown `Q2526491` → Marietta `Q985482` → Chesterhill `Q2669023` → Zanesville `Q146811`
- **On the map from** 1837; last documented 1847. **Line:** solid (documented stops).
- **Source:** Churchill (HB-CHURCHILL)
- **Note:** From the Virginia shore at Williamstown to Marietta (David Putnam Jr.), Chesterhill and Zanesville. Dated cases 1837 and 1846 to 1847.

### `ugrr-zanesville-reserve`: Zanesville to the Western Reserve

- **Places, in order:** Zanesville `Q146811` → Cleveland `Q37320`
- **On the map from** about 1837; last documented 1847. **Line:** dashed (approximate).
- **Source:** Churchill (HB-CHURCHILL)
- **Note:** The source says Zanesville was "linked by canal to the Western Reserve" and names no place on the way.

### `ugrr-ripley`: Across the Ohio at Ripley

- **Places, in order:** Ripley `Q2666983` → Sardinia `Q36879`
- **On the map from** 1822; last documented 1861. **Line:** solid (documented stops).
- **Source:** Churchill (HB-CHURCHILL); Wikipedia, "John Rankin (abolitionist)" (WP-RANKIN)
- **Note:** Ripley (John Rankin from 1822, John Parker) to Sardinia. The story of Rankin's lantern appears only in twentieth-century sources.

### `ugrr-ripley-north`: Sardinia to Lake Erie

- **Places, in order:** Sardinia `Q36879` → Urbana `Q1762816` → Sandusky `Q608207`
- **On the map from** about 1830; last documented 1861. **Line:** dashed (approximate).
- **Source:** Churchill (HB-CHURCHILL)
- **Note:** Northwest to join the Cincinnati road in the upper Miami valley, then by the Alum Creek Quaker settlement north of Columbus to Sandusky. The source dates these networks to "the late 1820s and early 1830s" and names a belt of settlements, not a list of towns: Urbana stands for the belt.

### `ugrr-cincinnati-north`: Cincinnati to Lake Erie

- **Places, in order:** Cincinnati `Q43196` → Lebanon `Q986776` → Urbana `Q1762816` → Sandusky `Q608207`
- **On the map from** about 1830; last documented 1861. **Line:** dashed (approximate).
- **Source:** Churchill (HB-CHURCHILL)
- **Note:** By farmers' wagons through the Quaker and free Black settlements between Lebanon and Urbana, then by Alum Creek to Sandusky and the Western Reserve. In use from about 1830, dense by about 1840; Levi Coffin moved to Cincinnati in 1847.

### `ugrr-lake-erie-sandusky`: Across Lake Erie from Sandusky

- **Places, in order:** Sandusky `Q608207` → Amherstburg `Q385335`
- **On the map from** about 1834; last documented 1861. **Line:** dashed (approximate).
- **Source:** Siebert 1898, ch. V (SIEBERT-V); NPS theme study (NPS-THEME)
- **Note:** Siebert names Sandusky among the lake ports and Amherstburg among the Canadian landings, from recollections. 1834: William Wells Brown begins work on the lake steamers, where he aided people waiting at Cleveland, Detroit and Buffalo.

### `ugrr-lake-erie-cleveland`: Across Lake Erie from Cleveland

- **Places, in order:** Cleveland `Q37320` → Port Stanley `Q7230953`
- **On the map from** about 1834; last documented 1861. **Line:** dashed (approximate).
- **Source:** Siebert 1898, ch. V (SIEBERT-V); NPS theme study (NPS-THEME)
- **Note:** Siebert names Cleveland among the lake ports and Port Stanley among the Canadian landings, from recollections; which port sent to which landing is not recorded.

### `ugrr-madison`: Across the Ohio at Madison

- **Places, in order:** Madison `Q990883` → Newport (Fountain City) `Q1439902`
- **On the map from** about 1826; last documented 1847. **Line:** dashed (approximate).
- **Source:** Churchill (HB-CHURCHILL); Wikipedia, "Levi Coffin" (WP-COFFIN)
- **Note:** Madison (George DeBaptiste, Elijah Anderson) to Levi Coffin at Newport, now Fountain City, where he lived from 1826 to 1847. The source gives the way between by county only.

### `ugrr-new-albany`: Across the Ohio at New Albany

- **Places, in order:** New Albany `Q1762878` → Canton `Q5033862` → Azalia `Q4832149` → Carthage `Q3293425` → Newport (Fountain City) `Q1439902`
- **On the map from** about 1826; last documented 1847. **Line:** solid (documented stops).
- **Source:** Churchill (HB-CHURCHILL); Wikipedia, "Levi Coffin" (WP-COFFIN)
- **Note:** New Albany and Jeffersonville, Canton, Farmington, Azalia, Carthage, Newport: the stops are the source's. The years are Coffin's at Newport; the source does not date this road itself.

### `ugrr-cincinnati-newport`: Cincinnati to Newport

- **Places, in order:** Cincinnati `Q43196` → Newport (Fountain City) `Q1439902`
- **On the map from** about 1826; last documented 1847. **Line:** dashed (approximate).
- **Source:** Wikipedia, "Levi Coffin" (WP-COFFIN)
- **Note:** Three roads met at Coffin's house: from Madison, from New Albany and from Cincinnati.

### `ugrr-newport-detroit`: Newport to Michigan

- **Places, in order:** Newport (Fountain City) `Q1439902` → Cassopolis `Q2373038` → Detroit `Q12439`
- **On the map from** about 1826; last documented 1847. **Line:** dashed (approximate).
- **Source:** Churchill (HB-CHURCHILL)
- **Note:** From Newport to Detroit, or to the free Black settlements of Cass County, Michigan (Cassopolis is its county seat and stands for them).

### `ugrr-detroit-river`: Across the Detroit River

- **Places, in order:** Detroit `Q12439` → Windsor `Q182625`
- **On the map from** 1833; last documented 1861. **Line:** solid (documented stops).
- **Source:** Barker, "Reconsidering the Underground Railroad in Canada West", NPS handbook (HB-BARKER); Johnson, "Escaping on the Northwestern Frontier" (HB-JOHNSON); Parks Canada, "Underground Railroad National Historic Event" (PC-UGRR)
- **Note:** 1833: the Blackburns are taken across to Windsor, the earliest dated crossing in what was read. John Brown's party crossed on 12 March 1859.

### `ugrr-detroit-amherstburg`: Detroit to Amherstburg

- **Places, in order:** Detroit `Q12439` → Amherstburg `Q385335`
- **On the map from** about 1850; last documented 1861. **Line:** dashed (approximate).
- **Source:** Wikipedia, "Underground Railroad" (WP-UGRR); Siebert 1898 (SIEBERT-V)
- **Note:** Amherstburg (Fort Malden) is called the chief place of entry after 1850; the NPS handbook's essay on Canada West does not name it.

### `ugrr-st-louis-springfield`: St. Louis to Springfield, Illinois

- **Places, in order:** St. Louis `Q38022` → Springfield `Q28515`
- **On the map from** 1850; last documented 1850. **Line:** solid (documented stops).
- **Source:** Johnson (HB-JOHNSON)
- **Note:** The "stampede" of about a dozen people from St. Louis, January 1850: Jameson Jenkins at Springfield gave them their first help. The source does not say which way they went on, so the line ends there.

### `ugrr-quincy-chicago`: Quincy to Chicago

- **Places, in order:** Quincy `Q575750` → Galesburg `Q782574` → Princeton `Q574878` → Ottawa `Q576209` → Chicago `Q1297`
- **On the map from** about 1842; last documented 1859. **Line:** dashed (approximate).
- **Source:** Johnson (HB-JOHNSON); NPS handbook timeline (HB-TIME); Illinois Office of Tourism, "Illinois Underground Railroad" (ENJOY-IL); Siebert 1898 (SIEBERT-V)
- **Note:** Thin. The NPS handbook attests Knox County (Galesburg; 1842), Chicago (1844) and Ottawa (1859); Quincy (Dr. Richard Eells) and Princeton (Owen Lovejoy) are from the state's tourism page; the order of the towns is local tradition descended from Siebert's informants.

### `ugrr-chicago-detroit`: Chicago to Detroit

- **Places, in order:** Chicago `Q1297` → Detroit `Q12439`
- **On the map from** 1843; last documented 1859. **Line:** dashed (approximate).
- **Source:** Johnson (HB-JOHNSON); PBS American Experience, "John Brown's Missouri raid" (PBS-BROWN)
- **Note:** Caroline Quarlls crossed Illinois, Indiana and Michigan to Detroit in 1843; John Brown's party went by rail in March 1859. Siebert also has lake vessels from Chicago. The ends are documented, the way between is not.

### `ugrr-kansas`: Kansas to Iowa

- **Places, in order:** Lawrence `Q493840` → Topeka `Q41057` → Nebraska City `Q286025` → Tabor `Q2240032`
- **On the map from** about 1857; last documented 1859. **Line:** dashed (approximate).
- **Source:** Mount Mitchell Prairie Guards, "The Lane Trail" (LANE); Johnson (HB-JOHNSON); PBS (PBS-BROWN)
- **Note:** Thin for Kansas and Nebraska: a local heritage page has freedom seekers on a branch of the Lane Trail from Lawrence, "escalated in 1857"; John Brown's party crossed Kansas from 20 January 1859 and the Missouri River at Nebraska City to reach Tabor.

### `ugrr-iowa`: Across Iowa to Chicago (John Brown, 1859)

- **Places, in order:** Tabor `Q2240032` → Lewis `Q1930350` → Des Moines `Q39709` → Grinnell `Q1903250` → Iowa City `Q487977` → Springdale `Q7580831` → West Liberty `Q2066047` → Chicago `Q1297`
- **On the map from** 1859; last documented 1859. **Line:** solid (documented stops).
- **Source:** PBS American Experience, "John Brown's Missouri raid" (PBS-BROWN); "John Brown and the Underground Railroad", Stories of Iowa (IOWA-SOI)
- **Note:** Tabor (first week of February 1859), Des Moines, Grinnell (25 February), Iowa City, Springdale, West Liberty (9 March, into a boxcar), Chicago. Lewis is from the Iowa school reader's list of towns, not from a dated stop.

### `ugrr-south-tennessee`: From Tennessee and Kentucky to the Ohio at Louisville

- **Places, in order:** Memphis `Q16563` → Nashville `Q23197` → Louisville `Q43668` → New Albany `Q1762878`
- **On the map from** 1826; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS, "Underground Railroad Resources in the U.S. Theme Study", 2000 (NPS-THEME)
- **Note:** A general direction, not a road, added at the owner's word (2026-11-17) so the map does not read as if no one fled the South. The NPS study gives the pattern in words: people west of the mountains had to cross the Ohio River out of Virginia, Kentucky or Tennessee; it warns that this is only suggestive and that routes "will generally remain unclear". No source names a place on this line: the towns stand for their regions and are the editor's choice. The same study and Bordewich say very few people escaped from the Deep South, which is why no line starts in Mississippi, Alabama or inland Georgia. The line has no year of its own: it comes onto the map with the New Albany road it joins (1826).

### `ugrr-south-kentucky-ripley`: From the Kentucky Bluegrass to the Ohio at Ripley

- **Places, in order:** Lexington `Q49241` → Maysville `Q478393` → Ripley `Q2666983`
- **On the map from** 1822; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS, "Underground Railroad Resources in the U.S. Theme Study", 2000 (NPS-THEME)
- **Note:** A general direction, not a road, added at the owner's word (2026-11-17) so the map does not read as if no one fled the South. The NPS study gives the pattern in words: people west of the mountains had to cross the Ohio River out of Virginia, Kentucky or Tennessee; it warns that this is only suggestive and that routes "will generally remain unclear". No source names a place on this line: the towns stand for their regions and are the editor's choice. The same study and Bordewich say very few people escaped from the Deep South, which is why no line starts in Mississippi, Alabama or inland Georgia. The line has no year of its own: it comes onto the map with the Ripley road it joins (1822).

### `ugrr-south-kentucky-cincinnati`: From the Kentucky Bluegrass to Cincinnati

- **Places, in order:** Lexington `Q49241` → Cincinnati `Q43196`
- **On the map from** 1830; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS, "Underground Railroad Resources in the U.S. Theme Study", 2000 (NPS-THEME)
- **Note:** A general direction, not a road, added at the owner's word (2026-11-17) so the map does not read as if no one fled the South. The NPS study gives the pattern in words: people west of the mountains had to cross the Ohio River out of Virginia, Kentucky or Tennessee; it warns that this is only suggestive and that routes "will generally remain unclear". No source names a place on this line: the towns stand for their regions and are the editor's choice. The same study and Bordewich say very few people escaped from the Deep South, which is why no line starts in Mississippi, Alabama or inland Georgia. The line has no year of its own: it comes onto the map with the Cincinnati road it joins (about 1830).

### `ugrr-south-virginia`: From North Carolina and Virginia north by land

- **Places, in order:** Raleigh `Q41087` → Richmond `Q43421` → Washington `Q61`
- **On the map from** 1842; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS, "Underground Railroad Resources in the U.S. Theme Study", 2000 (NPS-THEME)
- **Note:** A general direction, not a road, added at the owner's word (2026-11-17) so the map does not read as if no one fled the South. The NPS study gives the pattern in words: people east of the Appalachians tended to go "directly north by land or water" toward Pennsylvania, New York and the Boston area; it warns that this is only suggestive and that routes "will generally remain unclear". No source names a place on this line: the towns stand for their regions and are the editor's choice. The same study and Bordewich say very few people escaped from the Deep South, which is why no line starts in Mississippi, Alabama or inland Georgia. The line has no year of its own: it comes onto the map with the Washington road it joins (1842).

### `ugrr-south-arkansas`: From Arkansas across Missouri

- **Places, in order:** Little Rock `Q33405` → St. Louis `Q38022`
- **On the map from** 1850; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS, "Underground Railroad Resources in the U.S. Theme Study", 2000 (NPS-THEME)
- **Note:** A general direction, not a road, added at the owner's word (2026-11-17) so the map does not read as if no one fled the South. The NPS study gives the pattern in words: people from Arkansas and Texas might cross Missouri and Kansas and bear east to Indiana or Illinois; it warns that this is only suggestive and that routes "will generally remain unclear". No source names a place on this line: the towns stand for their regions and are the editor's choice. The same study and Bordewich say very few people escaped from the Deep South, which is why no line starts in Mississippi, Alabama or inland Georgia. The line has no year of its own: it comes onto the map with the St. Louis road it joins (1850).

### `ugrr-south-carolina-sea`: From the Carolina ports north by sea

- **Places, in order:** Charleston `Q47716` → Wilmington, N.C. `Q659400` → Cape Hatteras (sea waypoint, not a stop) `Q978032`
- **On the map from** 1834; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS, "Underground Railroad Resources in the U.S. Theme Study", 2000 (NPS-THEME); Newby-Alexander (HB-NEWBY)
- **Note:** A general direction, not a road, added at the owner's word (2026-11-17) so the map does not read as if no one fled the South. The NPS study gives the pattern in words: people east of the Appalachians tended to go "directly north by land or water"; Newby-Alexander lists Charleston and Wilmington, North Carolina, among the principal ports of departure and gives no dated case for either; it warns that this is only suggestive and that routes "will generally remain unclear". No source names a place on this line: the towns stand for their regions and are the editor's choice. The same study and Bordewich say very few people escaped from the Deep South, which is why no line starts in Mississippi, Alabama or inland Georgia. The line has no year of its own: it comes onto the map with the sea road from Savannah it joins (1834).

### `ugrr-louisiana-texas`: Louisiana to Mexican Texas

- **Places, in order:** Natchitoches `Q2278195` → Nacogdoches `Q970482` → San Antonio `Q975`
- **On the map from** 1822; last documented 1836. **Line:** dotted (a direction only).
- **Source:** Baumgartner, "Freedom Seekers on the Southwestern Frontier", NPS handbook (HB-BAUM); Wikipedia, "Underground Railroad" (WP-UGRR)
- **Note:** A direction, not a road. Nearly a hundred people left western Louisiana in the summer of 1822, across the Sabine (then the border) for Nacogdoches and San Antonio de Béxar. Natchitoches as the line's start is the editor's choice (WP-UGRR mentions a road from there); the escapes the source dates were from parishes farther south. Ends in 1836, when Texas left Mexico.

### `ugrr-texas-matamoros`: Texas to Matamoros

- **Places, in order:** Houston `Q16555` → Matamoros `Q738353`
- **On the map from** about 1837; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS (Audain), "Freedom Seekers in the Antebellum Texas-Mexico Borderlands" (NPS-MEX); Baumgartner (HB-BAUM)
- **Note:** A direction, not a road: across the Nueces Strip and the Rio Grande to Matamoros, where people found work. 1837: Mexico's Congress abolishes slavery (5 April). Baumgartner: no organized network, "only occasional allies". Houston as the line's start is the editor's choice (one dated case, 1858, began near it).

### `ugrr-texas-piedras-negras`: Texas to Piedras Negras

- **Places, in order:** Houston `Q16555` → San Antonio `Q975` → Piedras Negras `Q1856408`
- **On the map from** about 1850; last documented 1865. **Line:** dotted (a direction only).
- **Source:** NPS (Audain) (NPS-MEX); Baumgartner (HB-BAUM)
- **Note:** A direction, not a road: Piedras Negras, Coahuila, was "frequently" reached in the early 1850s. The way across Texas is not recorded; Houston and San Antonio are the editor's choices.

### `ugrr-carolina-florida`: Carolina to Spanish Florida

- **Places, in order:** Charleston `Q47716` → Fort Mose `Q549331`
- **On the map from** about 1687; last documented 1763. **Line:** dotted (a direction only).
- **Source:** NPS, "Fort Mose" (NPS-MOSE); Florida Museum, "Fort Mose" (FLMNH); Wikipedia, "Fort Mose" (WP-MOSE)
- **Note:** A direction, not a road: no source names a place between Carolina and St. Augustine. First arrivals by canoe in 1687 (Landers, by a search result only; Wikipedia has 1689); Charles II's edict of 1693; Fort Mose founded 1738, evacuated to Cuba in 1763. Charleston stands for Carolina.

### `ugrr-cape-florida`: Cape Florida to the Bahamas

- **Places, in order:** Cape Florida (Key Biscayne) `Q2689037` → Andros Island `Q514070`
- **On the map from** about 1821; last documented 1825. **Line:** dashed (approximate).
- **Source:** Wikipedia, "Saltwater Railroad" (WP-SALT); Baram, "Trail toward liberty", Journal of Florida Studies (BARAM)
- **Note:** From Cape Florida on Key Biscayne across the Gulf Stream to Andros Island (the Red Bays settlement): about 300 Black Seminoles in the early 1820s. The crossing is documented; where on Andros they landed is not in what was read. Sources disagree on how long it ran (to the mid-1820s; "1821-1837").

<!-- routes:end -->

## Part 2. Found in the research and not drawn

| What | Why it is not on the map |
|---|---|
| New Bedford → Valley Falls → Worcester → Vermont → Burlington (Elizabeth Buffum Chace's rail route; HB-GROVER, SIEBERT-V) | No source read gives it a year. A row needs one. |
| Portland, Maine → Canada by coasting vessel and the Grand Trunk Railroad; St. John, New Brunswick (HB-GROVER, SIEBERT-V) | Undated; the way beyond Portland is conjecture. |
| Halifax and Nova Scotia | Not a documented terminus of 1830 to 1860: the Black Loyalists (1783) and the refugees of the War of 1812 are earlier and different in kind. |
| Jacksonville → Martha's Vineyard and Bath, Maine (Edinbur Randall, 1854); New Bern (1842); Charleston and Wilmington, N.C., as ports | Single cases, or ports named with no case; left for the owner to ask for. |
| The *Pearl* (Washington, 1848) | It was captured at the mouth of the Potomac; the sources disagree on where it was bound. |
| Lake Ontario ports (Oswego, Cape Vincent → Kingston), Toledo, Painesville, Ashtabula, Erie | Siebert alone, undated. |
| Racine and Milwaukee → Canada by lake (Joshua Glover, 1854; WP-GLOVER) | The ports are documented; the way round the lakes and the landing are not. |
| Springfield, Illinois → onward; Alton, Chester, Cairo lines | The NPS handbook does not say which way the 1850 party went on; the town chains were seen only in search results. |
| West Liberty → Tipton → DeWitt → Clinton, Iowa (IOWA-SOI) | An undated list in a school reader. |
| Schoolcraft and Battle Creek, Michigan | Documented houses (NPS-PLACES, HB-JOHNSON), but no source read puts them in a chain. |
| Black Seminoles to Coahuila (1849 to 1852); New Orleans → Veracruz by sea (1831) | No gazetteer id found for El Nacimiento; one sea case. |
| Angola on the Manatee River, Seminole country, the bayous of southern Louisiana, the Everglades | Refuges with no gazetteer place or no date in what was read. Prospect Bluff, the Great Dismal Swamp and the Okefenokee are on the map as refuge marks (below). |
| California, the Pacific, Hawaii | The NPS documents events (Archy Lee, 1858), not a route with places and dates. |
| Flight to Union lines, 1861 to 1865 (Fort Monroe, Port Royal, Corinth and others) | The NPS counts it as part of the Underground Railroad (HB-MANNING). These are places people fled *to* from all around, not routes; they would be marks that appear from 1861. The owner's to ask for. |
| Haiti, Cuba, Jamaica | The NPS map draws lines there; no source read documents an escape route (what is documented is the emigration of free people to Haiti in the 1820s). |
| Harpers Ferry, Chambersburg, Gettysburg, Wheeling, Portsmouth (Ohio), Columbus, Evansville, Davenport, New Haven, Milton (Wisconsin) | Named on other publishers' maps or in the brief; not documented as stops in anything read. |

## Part 3. The research file

Compiled 2026-11-17. Rule followed: nothing here is invented. Every claim carries a source key; the key list
with URLs is in section 0. Where a claim rests on a search-result snippet rather than a page I read in full it is
marked **(snippet)**. Where it rests only on my memory it is marked **UNCONFIRMED (memory)**. Where a source
is itself built on late reminiscences (Siebert 1898, local tourism pages) it is marked **thin**.

How to read the place marks used in section A:

- **S** = documented stop: the source says people were sheltered, hidden or forwarded there.
- **X** = documented crossing, port or landing.
- **T** = terminus (place of settlement / end of flight).
- **P** = the source names the place as on the way, but does not say anyone was sheltered there.
- **R** = reminiscence-based only (Siebert's 1898 compilation or local tradition). Treat as thin.

---

### 0. Sources actually read (keys used below)

NPS and NPS-sponsored

- **[NPS-WHAT]** NPS, "What is the Underground Railroad?" https://www.nps.gov/subjects/undergroundrailroad/what-is-the-underground-railroad.htm
  Defines the UGRR as resistance to enslavement "through escape and flight" up to the end of the Civil War; lists
  destinations (Canada, Mexico, Spanish Florida, Indian territory, the West, Caribbean, Europe, Union lines).
- **[NPS-FAQ]** NPS, "Underground Railroad 101 (FAQ)" https://www.nps.gov/subjects/undergroundrailroad/frequently-asked-questions.htm
  Says the name dates to the 1840s, escapes go back to the 1600s, and it lasted at least to the 13th Amendment.
- **[NPS-MAP]** NPS Harpers Ferry Center, alt-text of the "Underground Railroad" Official Map and Guide map
  https://npgallery.nps.gov/HFC/GetAsset/25a41ab8-49ab-43c7-9e3f-a7bdc02df091/alttext.txt
  Text description of the NPS routes map (1860 boundaries; legend "approximate route of flight").
- **[GPO]** GPO Government Book Talk, posts tagged UGRR https://govbooktalk.gpo.gov/tag/ugrr/
  Describes the NPS Official Map and Guide as showing "the general direction of escape routes".
- **[NPS-THEME]** NPS, "Underground Railroad Resources in the U.S. Theme Study" (NHL/NRHP context, Sept. 2000; text read
  from the PDF copy at https://www.umassd.edu/media/umassdartmouth/underground-railroad/readings/theme_study.pdf ;
  same document listed at https://www.npshistory.com/publications/nhl/theme-studies/underground-railroad.pdf )
  The fullest NPS statement on numbers, routes and caveats that I could read in full.
- **[NPS-PLACES]** NPS, "The Places of the Underground Railroad" https://www.nps.gov/articles/000/the-places-of-the-underground-railroad.htm
- **[NPS-MEX]** NPS (M. Audain), "Freedom Seekers in the Antebellum Texas-Mexico Borderlands"
  https://www.nps.gov/articles/000/freedom-seekers-antebellum-texas-mexico-borderlands.htm
- **[NPS-TUB]** NPS, Harriet Tubman UGRR NHP, "Harriet Tubman" https://www.nps.gov/hatu/learn/historyculture/htubman.htm
- **[NPS-MOSE]** NPS, "Fort Mose" https://www.nps.gov/foma/learn/historyculture/fort-mose.htm
- **[NPS-WEST]** NPS, "Exploring the Underground Railroad in the West" https://www.nps.gov/articles/000/exploring-the-underground-railroad-in-the-west.htm
- **[NPS-HB]** NPS, "Underground Railroad Handbook" landing page https://www.nps.gov/subjects/undergroundrailroad/underground-railroad-handbook.htm
  (says the handbook was first issued in 1998 and updated for the Network to Freedom's 25th anniversary; essays hosted at Dickinson).

NPS / Dickinson College "Underground Railroad Online Handbook" (the updated NPS handbook), essays read in full:

- **[HB-FONER]** Eric Foner, Middle Atlantic https://housedivided.dickinson.edu/sites/ugrr/regional-essays/foner-on-middle-atlantic-region-foner/
- **[HB-HARROLD]** Stanley Harrold, Washington/Maryland/Virginia https://housedivided.dickinson.edu/sites/ugrr/regional-essays/escaping-in-and-around-washington-dc-maryland-virginia-harrold/
- **[HB-NEWBY]** Cassandra Newby-Alexander, Atlantic coast https://housedivided.dickinson.edu/sites/ugrr/regional-essays/the-atlantic-coastal-freedom-network-newby-alexander/
- **[HB-GROVER]** Kathryn Grover, New England https://housedivided.dickinson.edu/sites/ugrr/regional-essays/the-new-england-network-to-freedom-grover/
- **[HB-CHURCHILL]** Robert Churchill, Ohio River Valley https://housedivided.dickinson.edu/sites/ugrr/regional-essays/the-underground-railroad-in-the-ohio-river-valley-churchill/
- **[HB-JOHNSON]** Deanda Johnson, Northwestern Frontier https://housedivided.dickinson.edu/sites/ugrr/regional-essays/escaping-on-the-northwestern-frontier-johnson/
- **[HB-BAUM]** Alice Baumgartner, Southwestern Frontier https://housedivided.dickinson.edu/sites/ugrr/regional-essays/freedom-seekers-on-the-southwestern-frontier-baumgartner/
- **[HB-PARGAS]** Damian Pargas, Southern maroon communities https://housedivided.dickinson.edu/sites/ugrr/regional-essays/southern-maroon-communities-pargas/
- **[HB-BARKER]** Gordon Barker, Canada West https://housedivided.dickinson.edu/sites/ugrr/regional-essays/reconsidering-the-underground-railroad-in-canada-west-barker/
- **[HB-BORD]** Fergus Bordewich, Myths https://housedivided.dickinson.edu/sites/ugrr/thematic-essays/myths-of-the-underground-railroad-bordewich/
- **[HB-CREW]** Spencer Crew, Historiography https://housedivided.dickinson.edu/sites/ugrr/thematic-essays/underground-railroad-historiography-crew/
- **[HB-MANNING]** Chandra Manning, Civil War contraband camps https://housedivided.dickinson.edu/sites/ugrr/thematic-essays/civil-war-contraband-camps-manning/
- **[HB-LARSON]** Kate Clifford Larson, Women on the UGRR https://housedivided.dickinson.edu/sites/ugrr/thematic-essays/women-on-the-underground-railroad-larson/
- **[HB-PINSKER]** Matthew Pinsker, Introduction https://housedivided.dickinson.edu/sites/ugrr/overview-essays/introduction-pinsker/
- **[HB-TIME]** Handbook timeline https://housedivided.dickinson.edu/sites/ugrr/timeline/
- **[HB-MAPS]** Handbook Map Room https://housedivided.dickinson.edu/sites/ugrr/?p=1613
- **[HB-NTF]** Handbook "Network To Freedom" page https://housedivided.dickinson.edu/sites/ugrr/?p=1658 (over 700 listings in 39 states at the time of writing)

Older scholarship and maps

- **[SIEBERT-V]** Wilbur Siebert, *The Underground Railroad from Slavery to Freedom* (1898), ch. V "Study of the map", transcription at
  https://usgenealogyexpress.com/~bhist/hist_1898_underground/undergroundRaliroad_1898_pg_113_Chapt_V.htm
  (The Project Gutenberg copy returned HTTP 503 when I tried it; this transcription has OCR errors.)
- **[NEWBERRY]** Newberry Library, "Underground Railroad Routes to Canada, 1898" https://mappingmovement.newberry.org/mapping-migration/1898-underground-railroad-routes
- **[NGS-CAT]** Catalog record of the National Geographic map "The Underground Railroad" (July 1984) https://harriettubmanmonuments.slaverymonuments.org/items/show/45

Reference pages (secondary; used for dates and to cross-check)

- **[WP-UGRR]** https://en.wikipedia.org/wiki/Underground_Railroad
- **[WP-TUB]** https://en.wikipedia.org/wiki/Harriet_Tubman (route detail is cited there to Larson 2004 and Clinton 2004)
- **[WP-GARRETT]** https://en.wikipedia.org/wiki/Thomas_Garrett
- **[WP-STILL]** https://en.wikipedia.org/wiki/William_Still
- **[WP-RANKIN]** https://en.wikipedia.org/wiki/John_Rankin_(abolitionist)
- **[WP-COFFIN]** https://en.wikipedia.org/wiki/Levi_Coffin
- **[WP-JONES]** https://en.wikipedia.org/wiki/John_W._Jones_(ex-slave) (read 2026-11-17; its Underground Railroad section cites no source; the NPS page for Jones returned 404)
- **[WP-GLOVER]** https://en.wikipedia.org/wiki/Joshua_Glover
- **[WP-MOSE]** https://en.wikipedia.org/wiki/Fort_Mose
- **[WP-NEGROFORT]** https://en.wikipedia.org/wiki/Negro_Fort
- **[WP-MASCOGOS]** https://en.wikipedia.org/wiki/Mascogos
- **[WP-SALT]** https://en.wikipedia.org/wiki/Saltwater_Railroad
- **[WP-DISMAL]** https://en.wikipedia.org/wiki/Great_Dismal_Swamp_maroons
- **[WP-DAWN]** https://en.wikipedia.org/wiki/Dawn_settlement
- **[WP-ELGIN]** https://en.wikipedia.org/wiki/Elgin_settlement
- **[WP-PORTROYAL]** https://en.wikipedia.org/wiki/Port_Royal_Experiment
- **[FLMNH]** Florida Museum, "Fort Mose" https://www.floridamuseum.ufl.edu/histarch/research/st-augustine/fort-mose/
- **[BARAM]** Uzi Baram, "Trail toward liberty", *Journal of Florida Studies* https://www.journaloffloridastudies.org/files/vol0109/baram-trail-toward-liberty.pdf
  (read by text extraction; used for Prospect Bluff, Angola, Andros and the scholars named)
- **[PBS-BROWN]** PBS American Experience, "John Brown's Missouri raid" https://www.pbs.org/wgbh/americanexperience/features/brown-missouri-raid/
- **[IOWA-SOI]** "John Brown and the Underground Railroad", *Stories of Iowa*, Iowa History Project https://iagenweb.org/history/soi/soi37.htm
  (a school reader, undated; thin but it is the page that gives the Iowa town list)
- **[PA-SHPO]** Pennsylvania State Historic Preservation Office blog, "The Underground Railroad: Columbia, Lancaster County" https://pahistoricpreservation.com/the-underground-railroad-columbia-lancaster-county/
- **[ENJOY-IL]** Illinois Office of Tourism, "Illinois Underground Railroad" https://www.enjoyillinois.com/plan-your-trip/travel-inspiration/illinois-underground-railroad/ (tourism page; thin)
- **[NPS-LEE]** NPS, "Archy Lee" https://www.nps.gov/people/archy-lee.htm
- **[PC-UGRR]** Parks Canada, "Underground Railroad National Historic Event" https://parks.canada.ca/culture/designation/evenement-event/chemin-de-fer-clandestin-underground-railroad
  (plaque text: settlements along the Detroit and Niagara rivers were important terminals; about 30,000 freedom seekers in what is now Ontario by 1861).
  The Canadian Encyclopedia article and the Ontario Heritage Trust pages did not return readable text, so no claim rests on them.
- **[LANE]** Mount Mitchell Prairie Guards (Kansas local heritage group), "The Lane Trail" https://mountmitchellprairie.org/underground-railroad/the-lane-trail/ (thin)
- **[DICK-STATS]** Dickinson course page "Statistical Gateway" https://blogs.dickinson.edu/hist-288pinsker/2015/07/15/underground-railroad/

Pages I tried and could not read (so nothing below depends on them)

- NPS 1995 *Special Resource Study* PDF (https://www.nps.gov/orgs/1205/upload/UGRR-Resource-Study-reduced-size.pdf): HTTP 404 on both nps.gov and home.nps.gov.
- NPS "Aboard the Underground Railroad" itinerary (https://www.nps.gov/nr/travel/underground/): HTTP 404.
- NPS people pages for Thomas Garrett and William Still: HTTP 404.
- National Geographic's own map pages (media.nationalgeographic.org PDF and education.nationalgeographic.org/resource/undergroundrailroad/): redirect / 404.
- Blackpast "John Brown's Christmas Raid": HTTP 403.
- I did not read the books themselves (Foner 2015, Baumgartner 2020, Larson 2004, Griffler 2004, Bordewich 2005, Landers, Winsboro & Knetsch, Gara 1961,
  Still 1872, Coffin 1876). Where they appear below it is through the authors' own NPS handbook essays or through the pages listed above.

---

### A. Corridors

#### A.0 What the sources allow, in one paragraph

The NPS theme study gives the only general "schematic" I found in an NPS text: people east of the Appalachians tended to go
"directly north by land or water" to Pennsylvania, New York and the Boston area; people west of the mountains had to cross the
Ohio River out of Virginia, Kentucky or Tennessee; people from Arkansas and Texas might cross Missouri and Kansas and bear east
to Indiana or Illinois. The same passage warns that this is only suggestive and that routes "will generally remain unclear"
[NPS-THEME]. Everything below is therefore a set of documented chains of places, not surveyed roads.

#### A.1 Shared trunk legs (draw these once)

| Leg | From -> to | Corridors that use it | Best source |
|---|---|---|---|
| T1 | Wilmington DE -> Philadelphia | K1 (Delmarva overland), K5 (coastal vessels calling at Wilmington), K6 (Washington/Baltimore network, 1843 trip) | [HB-FONER] [WP-TUB] [HB-HARROLD] |
| T2 | Philadelphia -> New York City (rail and ferry across New Jersey) | K1, K2, K5, K6, K7 | [HB-FONER] |
| T3 | New York City -> Albany -> Syracuse | K2, K6 (Torrey's 1842 party went to Albany) | [HB-FONER] [HB-HARROLD] |
| T4 | Syracuse -> Rochester -> Buffalo / Niagara Falls -> Suspension Bridge -> St. Catharines | K2, and K7's northern branch joins at Rochester | [HB-FONER] [NPS-THEME] |
| T5 | Newport (Fountain City) IN -> Cass County MI / Detroit | all three Indiana feeders of K12 | [HB-CHURCHILL] [WP-COFFIN] |
| T6 | Upper Miami valley -> Alum Creek (north of Columbus) -> Sandusky / Western Reserve | K10 (Ripley) and K11 (Cincinnati) | [HB-CHURCHILL] |
| T7 | Cleveland and the Western Reserve lake shore -> across Lake Erie | K8 (Pittsburgh), K9 (Marietta-Zanesville), K11 | [HB-CHURCHILL] [SIEBERT-V] |
| T8 | Chicago -> Detroit (rail in 1859; lake vessels per Siebert) | K14 (Illinois), K16 (Kansas-Iowa) | [PBS-BROWN] [SIEBERT-V] |
| T9 | Detroit -> Windsor / Sandwich / Amherstburg (Detroit River) | K12, K13, K14, K16 | [HB-BARKER] [HB-JOHNSON] [WP-UGRR] |
| T10 | Tabor -> Lewis -> Des Moines -> Grinnell -> Iowa City -> West Liberty | K16 only, but it is the single Iowa trunk in the sources | [IOWA-SOI] [PBS-BROWN] |

#### K1. Delmarva overland: Maryland's Eastern Shore -> Delaware -> Wilmington -> Philadelphia

- **Places in order** (this exact chain is Tubman's, as reconstructed by Larson and reported in [WP-TUB]):
  Dorchester County MD, origin [NPS-TUB] -> Poplar Neck near Preston, Caroline County MD (**S**, hid near her parents' home; likely start of 1849 escape) ->
  East New Market MD (**S**, Sam Green's home) -> Sandtown DE (**P**) -> Willow Grove DE (**P**) -> Camden DE (**S**, agents William and Nat Brinkley and
  Abraham Gibbs guided her on) -> past Dover (**P**), Smyrna (**P**), Blackbird (**P**) -> across the Chesapeake and Delaware Canal (**X**) ->
  New Castle DE (**P**) -> Wilmington DE (**S**, Thomas Garrett) -> Philadelphia (**S**, William Still's office; first place of freedom).
- **Variant by water, December 1850:** Cambridge MD -> by log canoe about 60 miles to Baltimore (**X**) -> Philadelphia [WP-TUB, citing Larson] [NPS-THEME].
- **Variant into New Jersey:** NPS says Tubman stopped at Springtown, Greenwich Township NJ (Bethel AME Church), 1849-1853, on oral-history evidence only [NPS-PLACES].
- **Destination:** Philadelphia; after 1850 onward to Canada (St. Catharines) [NPS-TUB].
- **Years:** Garrett in Wilmington from 1822 [WP-GARRETT]. Tubman's own escape autumn 1849; return trips 1850-1860 [NPS-TUB]. Last documented
  rescue November 1860 [WP-TUB]. Still's journal 25 Dec 1852 - 22 Feb 1857 [NPS-THEME].
- **Dating:** exact for Tubman (1849, 1850-1860); exact for Garrett's arrival (1822); the corridor before 1849 is not dated town by town.
- **Path certainty:** documented stops for Tubman's later trips; her *first* route is unknown ("exact first route is unknown", via Clinton in [WP-TUB]).
  NPS theme study adds two other approaches to Philadelphia without towns: across the Susquehanna above Havre de Grace and northeast to
  Phoenixville; Baltimore to West Chester and Phoenixville; "through Delaware to Philadelphia" [NPS-THEME].
- **Disagreement:** number of Tubman trips and people - 13 trips, about 70 people [NPS-TUB] [WP-TUB]; "approximately fifteen" trips [NPS-THEME];
  "nearly 20 trips" and 300 people in the older NPS handbook as quoted by [GPO]. Use the NPS park figure.
- **Legs:** Poplar Neck -> East New Market -> Sandtown -> Willow Grove -> Camden -> Dover -> Smyrna -> Blackbird -> New Castle -> Wilmington -> (T1) Philadelphia.

#### K2. New York corridor: Philadelphia -> New York City -> Albany / Syracuse -> Rochester -> Niagara -> St. Catharines

- **Places in order:** Philadelphia (**S**, Still's Vigilance Committee) -> by train and ferry across New Jersey (**X**, ferry terminal in New Jersey or Manhattan,
  met by Louis Napoleon) -> New York City (**S**, Ruggles's Committee of Vigilance; Sydney Howard Gay's office on Nassau Street; Weeksville in Brooklyn sheltered people) ->
  Albany (**S**; Stephen Myers named there by [NPS-THEME]; Torrey's 1842 party went there [HB-HARROLD]) -> Syracuse (**S**, Jermain Loguen; Gay sent more people
  there than to all other destinations combined) -> Rochester (**S**, Frederick Douglass's house) -> Buffalo (**P**, last US stop) ->
  Niagara Falls Suspension Bridge (**X**) -> St. Catharines, Canada West (**T**) [HB-FONER] [HB-NEWBY].
- **New Jersey towns between Philadelphia and New York:** only Siebert names them (Camden, Burlington, Bordentown, Princeton, New Brunswick, Rahway,
  Jersey City; alternate New Brunswick -> Perth Amboy) [SIEBERT-V]. **R** - reminiscence-based; Foner's essay names no New Jersey town.
- **Other New York outlets (thin):** Siebert lists Lake Ontario ports Oswego, Port Ontario and Cape Vincent, linked to Kingston [SIEBERT-V] (**R**).
  [WP-UGRR] adds crossings at Ogdensburg and Lake Champlain, uncited in what I read.
- **Destination:** Canada West, chiefly St. Catharines; also upstate New York itself.
- **Years:** 1835 (Ruggles founds the New York Committee of Vigilance; it "survived until the Civil War") [HB-FONER] [HB-TIME]; 1838 Douglass passes through;
  1840s committees begin forwarding people from the upper South through Philadelphia and New York to Albany, Syracuse and Canada (**snippet** summary of
  Foner's book); Gay's Record of Fugitives 1855-1856; ends 1861, when McKim said the UGRR was effectively over [HB-FONER].
  Disagreement inside the handbook: Foner dates the second (Garrisonian) New York committee to 1840, the timeline to 1845.
- **Suspension Bridge date:** [WP-UGRR] says built by 1848 and a museum snippet speaks of "an 1848 suspension bridge". The rail deck opening in 1855 is
  UNCONFIRMED (memory). A snippet notes that Tubman's presence at Lewiston is disputed; I left Lewiston out.
- **Dating:** exact (1835, 1855-56, 1861). **Path:** documented stops; the Albany leg is less fully attested than the Syracuse leg in what I read.
- **Legs:** (T2) Philadelphia -> New York; (T3) New York -> Albany -> Syracuse; (T4) Syracuse -> Rochester -> Buffalo -> Suspension Bridge -> St. Catharines.

#### K3. New England branch: New York / coastal vessels -> southern New England -> Vermont -> Canada

- **Documented chains** [HB-GROVER]:
  - Virginia -> Philadelphia -> New York (Ruggles) -> Hartford (**P**) -> Springfield MA (**S**) -> Norwich CT (**T** for James Lindsay Smith, 1838-1842).
  - Valley Falls RI (**S**, Elizabeth Buffum Chace) -> by the Providence and Worcester Railroad -> "a Vermont road" -> Joshua Young at Burlington VT (**S**) -> Canada.
  - Boston (**S**, Hayden boardinghouse on Southac Street; Twelfth Baptist Church) -> Newton MA (**S**, William Jackson's house, reached by the Worcester Railroad).
  - Ferrisburgh VT (**S**, Rowland T. Robinson, "scores" sheltered) -> Montpelier (**S**, 1838).
  - St. Albans VT (**X**, 16 miles from the border): four people forwarded by express train March 1854; another moved north by sleigh and freight train May 1856;
    Lawrence Brainerd is said by his son to have used Lake Champlain steamboats and the Vermont and Canada Railroad.
  - Northampton / Florence MA (**S**/**T**, people settled openly; Erastus Hopkins used the Connecticut River Railroad).
  - New Bedford (**T**/**S**, Nathan and Polly Johnson sheltered Douglass in 1838; city poor relief aided fugitives) [HB-NEWBY] [HB-GROVER].
- **Siebert's Vermont lines (R, thin):** west: Bennington (from Troy NY) -> Manchester -> Wallingford -> Rutland -> Brandon -> Middlebury -> Vergennes -> Ferrisburgh ->
  North Ferrisburgh -> ... St. Albans (my reordering south-to-north; the transcription lists them north-to-south); east: Brattleboro -> Chester -> Woodstock ->
  Randolph -> Montpelier, then to Burlington, or via Morristown to Canada, or to Newport VT. Massachusetts: New Bedford -> Fall River -> Valley Falls ->
  Worcester -> Vermont [SIEBERT-V].
- **Destination:** many stayed in New England; otherwise "Canada" / "British ground". **Montreal:** Siebert lists Montreal among Canadian termini [SIEBERT-V];
  Grover's essay does not name it. **New Haven:** not named in any source I read - leave it off or mark unverified.
- **Years:** 1838 (Smith; Nelson at Ferrisburgh/Montpelier; Douglass to New Bedford) through 1856-1859 (St. Albans cases; Hopkins letter 1859). Boston Vigilance Committee
  founded 1841 [NPS-THEME, in the Torrey passage] or late 1842 [NPS-THEME, in the Boston passage] - the theme study contradicts itself.
- **Dating:** exact for individual cases; no start date for the corridor as a whole. **Path:** documented stops for the chains above; Siebert's town-by-town
  Vermont lines are approximate. Grover warns that Vermont was not as safe as tradition says.
- **Legs:** New York -> Hartford -> Springfield; Valley Falls -> Worcester -> (Vermont) -> Burlington -> Canada; Ferrisburgh -> Montpelier; St. Albans -> border.

#### K4. Maine and the Maritimes (weak)

- Portland ME (**S**, Brown Thurston sent people to Canada "by coasting vessels and the Grand Trunk Railroad", fares half or free) [HB-GROVER]. Bath ME was the
  destination of the bark *Franklin* carrying Edinbur Randall from Jacksonville in 1854 [HB-GROVER].
- Siebert lists St. John, New Brunswick among termini (**R**) [SIEBERT-V]. NPS map: the east-coast line runs "north past Maine into Canada" [NPS-MAP].
- **Nova Scotia / Halifax:** no source I read documents an antebellum UGRR route ending in Halifax. What is documented is earlier and different in kind:
  about 3,000-3,500 Black Loyalists to the Maritimes in 1783 and about 2,000-3,000 Chesapeake refugees with British forces in the War of 1812
  [NPS-THEME] [WP-UGRR]. Do not draw a Halifax terminus for the 1830-1860 network on this evidence.
- **Years:** Thurston undated in the essay (Grand Trunk implies 1850s - my inference, not the source's). **Path:** conjectural beyond Portland.

#### K5. Atlantic coast by sea: Virginia and Carolina ports -> Philadelphia, New York, New Bedford, Boston

- **Documented ports of departure (X):** Norfolk (John Atkinson 1854 on the *City of Richmond*; 20+ people undetected on one vessel 1855; Thomas Page 1856;
  "Captain Lee's skiff" 1857), Portsmouth VA (Elizabeth Barnes hid people on vessels for Boston and New Bedford [NPS-THEME]), Richmond (Captain Albert Fountain's
  packet; Henry Box Brown shipped by crate to Philadelphia, 1849), Alexandria (sloop *Regulator*, flour trade with New Bedford), New Bern NC (John Torrence, stowaway,
  about 1842 [NPS-THEME]), Savannah (Moses Roper by schooner to New York, 1834 [HB-GROVER]), Jacksonville (Edinbur Randall, 1854 [HB-GROVER]), an unnamed North
  Carolina port (Harriet Jacobs, 1842 [HB-TIME]). Eastern North Carolina people reached Norfolk harbor via the Great Dismal Swamp and Albemarle Sound [HB-NEWBY].
- **Ports listed as "principal departure points" but with no individual case in the essay:** Jacksonville, Savannah, Charleston, Wilmington NC, Baltimore [HB-NEWBY].
  Draw Charleston and Wilmington NC only as "named port, no documented case here".
- **Arrival ports (X/S):** Wilmington DE (Fountain's ship "often stopped" for people sheltered by Garrett; Winnie Patsy, May 1856) -> Philadelphia (landing at night
  at the foot of Broad Street) -> New York [HB-FONER] [HB-LARSON]; New Bedford; Boston (George Latimer from Norfolk 1842; Shadrach Minkins from Norfolk) [NPS-THEME];
  Martha's Vineyard (Randall, 1854) [HB-GROVER].
- **Destination:** northern ports; many went on to St. Catharines (Atkinson and others) [HB-NEWBY].
- **Years:** waterway escapes in newspaper notices from the late 1600s [HB-NEWBY]; documented cases 1834-1857; Still's records 1852-1857 (essay says to 1861; the journal itself
  ends February 1857 [NPS-THEME]).
- **Dating:** exact for cases. **Path:** ports are documented; the sea track between them is of course schematic.
- **Caveat:** Bordewich says the few who escaped from the Deep South "mostly hid on ships from southern ports" [HB-BORD]; Newby-Alexander says most Georgia and Florida
  escapees did not go north at all but to the Seminole, the Bahamas, the Everglades or the Pensacola area [HB-NEWBY].
- **Legs:** Norfolk/Portsmouth/Richmond -> Wilmington DE -> (T1) Philadelphia -> (T2) New York; Norfolk/Alexandria -> New Bedford; Norfolk/Portsmouth -> Boston;
  Savannah -> New York; Jacksonville -> Martha's Vineyard/New Bedford.

#### K6. Washington - Baltimore -> Pennsylvania -> Albany (Torrey and Smallwood), and the *Pearl*

- **Places:** Washington DC (**S**, Smallwood's and Torrey's network from 1842; unnamed "places of deposit" between Washington and the Mason-Dixon Line) ->
  Baltimore (**S**, Jacob Gibbs's related operation; also where ten were recaptured in 1843) -> Wilmington DE (Garrett supported the 1843 wagon trip) ->
  Philadelphia (**S**, Black-led Vigilant Association; Torrey's base after 1843) -> Albany (**T** of Torrey's August 1842 party) -> Toronto (**T**, Smallwood moved there 1843) [HB-HARROLD].
- **By water (failed):** the *Pearl*, 15 April 1848, Washington -> down the Potomac -> intended Chesapeake Bay -> Chesapeake and Delaware Canal -> Frenchtown NJ; captured near
  the mouth of the Potomac with 77 people [HB-HARROLD]. (The theme study says the intended landing was New York [NPS-THEME] - sources disagree on the destination.)
- **Other documented movements:** Baltimore -> Pennsylvania by train (Eglin and Giles) [HB-FONER]; Winchester VA family aided by Torrey [NPS-THEME]; Charles County MD,
  about 75 armed men heading for Pennsylvania, July 1845, intercepted [HB-HARROLD].
- **Years:** 1842-1846 (Torrey died in Baltimore jail May 1846); 1848 (*Pearl*); 1854-1857 (Jacob Bigelow with Still); wartime transport of "contrabands" north 1862-63.
- **Dating:** exact. **Path:** Washington, Baltimore, Philadelphia, Albany documented; intermediate stops not named by the source (do not invent them).
- **Harpers Ferry:** not in Harrold's essay. One individual, William George, left Harpers Ferry in 1851 and settled in St. Catharines [HB-NEWBY]. That is not enough to draw a route.
- **Legs:** Washington -> Baltimore -> (Wilmington) -> (T1) Philadelphia -> (T2) New York -> (T3) Albany.

#### K7. South-central Pennsylvania: Susquehanna crossings -> Philadelphia, and Philadelphia -> Harrisburg -> Elmira -> Niagara

- **Places:** Columbia PA (**S** by "legend" per NPS: a free Black town on the east bank of the Susquehanna about twenty miles north of Maryland), York PA (**S**, William C.
  Goodridge "reputed" to have sent many on to Still), Christiana PA (resistance 11 Sept 1851), Lewisburg PA ("another legendary site") [NPS-THEME]. The Pennsylvania
  SHPO blog adds: people crossed the Susquehanna from York County (Wrightsville) on the Columbia-Wrightsville Bridge, completed 1834 (**X**); Stephen Smith, then from the
  late 1830s William Whipper, sent them on from Columbia by their own rail freight cars to Philadelphia (reported from 1838 until the state took over the railroad in the
  late 1850s) or by canal boat toward Pittsburgh; this rests largely on Whipper's own 1871 letter to Still [PA-SHPO]. That the Philadelphia & Columbia Railroad is a
  Network to Freedom listing is a **snippet** only.
- **Northward chain** (NPS wording: "reputed to have been"): Philadelphia -> Harrisburg -> by foot or canal boat to Williamsport (**S**, David and Philip Roderick) ->
  Canton PA -> Alba PA -> Elmira NY (**S**, John W. Jones) -> Watkins Glen -> Canandaigua -> Rochester -> Buffalo -> Niagara Falls NY -> St. Catharines; people "often
  traveled by the local railroads" (Williamsport and Elmira; Northern Central) [NPS-THEME].
- **Years:** Columbia 1834 (bridge) / 1838 (rail cars) to the late 1850s [PA-SHPO]; Christiana 1851; the northward chain is not dated by NPS (the Williamsport and
  Elmira railroad implies the 1850s - my inference).
- **Dating:** circa for Columbia, uncertain for the northward chain. **Path:** approximate - NPS itself says it is "virtually impossible" to trace overland routes in the northeast "with any precision".
- **Chambersburg, Gettysburg:** not found in any source I read. Leave out, or mark unverified. Carlisle PA appears only for the 2 June 1847 rescue riot [HB-TIME].
- **Legs:** Columbia/York -> Philadelphia; Philadelphia -> Harrisburg -> Williamsport -> Elmira -> Canandaigua -> Rochester -> (T4).

#### K8. Western Pennsylvania: Monongahela valley -> Pittsburgh -> Lake Erie

- **Places:** Uniontown PA (**S**), Washington PA (**S**), Pittsburgh (**S**; Black crowds rescued people four times 1841-1847) -> either western New York, or northwest
  to Cleveland and the Western Reserve [HB-CHURCHILL].
- **Siebert (R):** Uniontown -> Pittsburgh by two courses; from Pittsburgh by rail to Cleveland; also Cumberland MD -> Bedford -> Pleasantville -> Altoona; Clearfield ->
  Shippenville -> Franklin -> Erie; terminals Erie and Buffalo [SIEBERT-V].
- **Years:** 1841-1847 documented rescues; networks in this borderland "dense by about 1840", in use since the late 1820s [HB-CHURCHILL].
- **Dating:** circa. **Path:** Uniontown-Washington-Pittsburgh documented; beyond Pittsburgh approximate; Erie only on Siebert's authority.
- **Wheeling:** not named in any source I read.

#### K9. Southeastern Ohio: Virginia shore -> Marietta / Gallipolis -> Zanesville -> Western Reserve

- **Places:** Williamstown, Virginia (now WV) (origin; Henderson plantation, opposite Marietta) -> about a dozen ferrying points between Gallipolis and Marietta (**X**) ->
  Marietta (**S**, David Putnam Jr.; record book of 1847) -> Chesterhill (**S**) -> Zanesville and Putnam OH (**S**), "linked by canal to the Western Reserve" [HB-CHURCHILL].
- **Years:** 1837 (Isaac's escape), 1846-1847 (Henderson escapes; Putnam standoff February 1847). **Dating:** exact for cases. **Path:** documented stops to Zanesville;
  canal leg stated but not itemised.
- **Portsmouth OH:** not named in any source I read.

#### K10. Ripley line: Kentucky shore -> Ripley -> Sardinia -> upper Miami valley

- **Places:** Ohio River at Ripley (**X**) -> Ripley (**S**, John Rankin, John Parker, John Hudson) -> Sardinia (**S**) -> northwest to join the Cincinnati network in the
  upper Miami valley [HB-CHURCHILL]. Red Oak OH and Adams County OH appear as scenes of violence in 1844.
- **Years:** Rankin moved to Ripley on the night of 31 Dec 1821 / 1 Jan 1822; hilltop house 1829; "over forty years" of sheltering [WP-RANKIN]. Start anchor: 1822.
- **Dating:** exact start. **Path:** documented stops Ripley and Sardinia; onward approximate.
- **Caveat:** the Rankin lantern story appears only in early twentieth-century sources [HB-CHURCHILL]. NPS notes Ripley was "by no means" an antislavery town [NPS-THEME].

#### K11. Cincinnati line: Cincinnati -> Quaker and free Black settlements -> Alum Creek -> Sandusky / Lake Erie

- **Places:** Cincinnati (**S**; Black and white activists; Levi Coffin there from 1847) -> by farmers' wagons through Quaker and free Black settlements between Lebanon and
  Urbana (**S**, named only as a belt) -> northeast across the Scioto to Alum Creek Quaker settlement, north of Columbus (**S**) -> Sandusky (**X**) and the Western Reserve [HB-CHURCHILL].
  Oberlin (**S**; "legitimately well-known as a haven"; rescue 13 Sept 1858) [NPS-THEME] [HB-TIME]. Mechanicsburg OH standoff 1857 [HB-CHURCHILL].
- **Lake Erie ports named by Siebert (R):** Toledo, Sandusky, Cleveland, Painesville, Ashtabula Harbor; boats also from Dunkirk, Buffalo and Black Rock NY [SIEBERT-V].
  William Wells Brown, working on lake steamers from 1834, aided people waiting at Cleveland, Detroit and Buffalo [NPS-THEME].
- **Canadian landings named by Siebert (R):** Amherstburg / Malden, Colchester, Kingsville, Port Stanley, Port Burwell, Long Point, Fort Erie [SIEBERT-V].
- **Years:** networks in use from the late 1820s-early 1830s, dense by about 1840 [HB-CHURCHILL]; Coffin in Cincinnati 1847 [WP-COFFIN] [HB-TIME]; about six rescues in
  Cincinnati in the 1840s-50s; Margaret Garner 1856.
- **Dating:** circa for the start. **Path:** approximate between Cincinnati and Sandusky (a belt of settlements, not a town list). Columbus itself is not named as a stop -
  only Alum Creek, north of it. Toledo, Ashtabula and Painesville rest on Siebert alone.

#### K12. Indiana: Ohio River towns -> Newport (Fountain City) -> Michigan

- **Madison line:** Kentucky shore -> Madison IN (**X**/**S**, organised by George DeBaptiste and Elijah Anderson) -> refuges in Jefferson, Ripley and Decatur counties ->
  Newport, Wayne County (**S**, Levi Coffin) [HB-CHURCHILL].
- **New Albany / Jeffersonville line:** New Albany and Jeffersonville (**X**/**S**, African American activists; opposite Louisville - the essay does not name Louisville) ->
  Canton, northwest of Salem (**S**, James L. Thompson) -> over the Muscatatuck to Farmington (**S**) -> Azalia (**S**, John Thomas) -> Carthage (**S**) -> east into Wayne
  County -> Newport [HB-CHURCHILL]. Free Black communities at Corydon, Beck's Mill and Lick Creek are named.
- **Cincinnati line:** Cincinnati -> Newport ([WP-COFFIN] says three routes met at Coffin's house: from Madison, New Albany and Cincinnati).
- **Onward:** Newport -> Detroit, or the free Black settlements of Cass County MI (**T**/**S**) [HB-CHURCHILL]. Cabin Creek, Randolph County IN (**S**, 1839). NPS also lists the
  Dr. Nathan Thomas house, Schoolcraft MI [NPS-PLACES], and Battle Creek MI (Erastus Hussey) [HB-JOHNSON].
- **Years:** Coffin at Newport 1826-1847 [WP-COFFIN] [HB-TIME] [NPS-THEME]; Madison network attacked by a mob 1846; "hundreds over several decades".
- **Dating:** exact (1826, 1847). **Path:** documented stops for the New Albany line; the Madison line is given by county only.
- **Evansville:** the essay's region ends at Evansville but it says there is "little reliable information" for southwestern Indiana. No documented stop. Siebert agrees southern
  Indiana has few known stations [SIEBERT-V]. Do not draw an Evansville route as documented.
- **Legs:** Madison -> (counties) -> Newport; New Albany/Jeffersonville -> Canton -> Farmington -> Azalia -> Carthage -> Newport; Cincinnati -> Newport; (T5) Newport -> Cass County / Detroit; (T9).

#### K13. Detroit River crossing: Detroit -> Windsor / Sandwich / Amherstburg

- **Places:** Detroit (**S**; its Black community praised in 1846 for aiding fugitives [HB-JOHNSON]; Second Baptist Church founded 1836, **snippet**) -> Detroit River (**X**) ->
  Windsor (**T**; the Blackburns taken there in 1833 [HB-BARKER]), Sandwich (**T**; Caroline Quarlls 1843 [HB-JOHNSON]; Bibb's *Voice of the Fugitive* 1851-52 [HB-BARKER]),
  Amherstburg / Fort Malden (**T**; called the "chief place of entry", about thirty a day after 1850, in [WP-UGRR], whose citation I did not check).
- **Years:** 1833 (Blackburn rescue) is the earliest dated crossing in what I read; in use to 1859 (John Brown's party crossed 12 March 1859 [PBS-BROWN]) and beyond.
  Legal anchors: Upper Canada's 1793 act; Chief Justice Robinson's 1819 ruling; imperial abolition effective 1 Aug 1834 [HB-BARKER] [HB-TIME].
- **Dating:** exact for cases. **Path:** documented crossing. Barker's essay does not name Amherstburg; that rests on [WP-UGRR] and Siebert.

#### K14. Illinois: Mississippi crossings -> Chicago -> lakes

- **Documented in the NPS handbook** [HB-JOHNSON]: St. Louis (origin of the January 1850 "stampede" of about a dozen and of Caroline Quarlls in 1843; Mary Meachum's attempted
  crossing to Illinois, May 1855 [HB-LARSON]) -> Springfield IL (**S**, Jameson Jenkins gave the 1850 group its first help; onward path not stated). Quarlls 1843: St. Louis ->
  steamboat to Illinois -> Illinois -> Indiana -> Michigan -> Detroit -> Sandwich. Randolph County IL -> Knox County (1842, Borders case; Knox "an abolitionist stronghold").
  Chicago: an 1844 "Liberty Line" advertisement. Ottawa IL: rescue of Jim Gray, 20 Oct 1859 [HB-TIME].
- **Siebert (R):** many stations in northern and west-central Illinois; a few Covenanter lines in the southwest; Chicago the chief point of embarkation for Missouri fugitives;
  lake vessels from Chicago to Detroit, Amherstburg or Collingwood; Philo Carpenter said to have guided "not less than two hundred" to vessels [SIEBERT-V].
- **State tourism page (read; thin):** Quincy (**S**, Dr. Richard Eells's house, the "first stop" for "several hundred" crossing from Missouri); Princeton (**S**, Owen Lovejoy
  Homestead, a National Historic Landmark, 1850s); Jacksonville, Alton, Oakland and suburban Chicago sites (Lombard, Oak Brook, Wheaton) listed without a route order [ENJOY-IL].
- **Town-by-town lines (snippets only, thin):** Quincy -> Mendon -> Plymouth -> Galesburg -> Princeton -> Ottawa -> Chicago; Chester and Cairo lines meeting at Centralia
  and going north; Alton as a crossing. I did not open those pages; treat the sequences as local tradition until checked against Network to Freedom listings.
- **Years:** 1842-1859 for dated cases. **Dating:** exact for cases, uncertain for lines. **Path:** conjectural between named towns; only Springfield, Knox County, Ottawa and Chicago
  are attested in the NPS handbook.
- **Legs:** St. Louis -> (Alton?) -> Springfield -> ... -> Chicago; Quincy -> Galesburg -> Princeton -> Ottawa -> Chicago (thin); (T8) Chicago -> Detroit; (T9).

#### K15. Wisconsin lake ports

- **Places:** Racine (**S**/**X**; Joshua Glover lived there, was seized 10 March 1854, freed from the Milwaukee jail 18 March, hidden, and shipped from Racine to Canada; settled
  in Etobicoke near Toronto) [WP-GLOVER]; Milwaukee (**S**, the rescue). Siebert names Milwaukee, Racine and Southport (Kenosha) as lake ports for people who avoided Chicago (**R**) [SIEBERT-V].
  Glover had escaped Missouri in May 1852 [WP-GLOVER].
- **Years:** 1852-1854 for Glover. **Dating:** exact. **Path:** ports documented; inland Wisconsin not.
- **Milton, Waukesha:** not in any source I read. Johnson's essay names the Stockbridge and Brothertown Indians as Wisconsin activists but no towns.

#### K16. Kansas - Nebraska - Iowa - Chicago (John Brown's 1858-59 route) and the Iowa line

- **Brown's party:** raid into Missouri December 1858 (Vernon County, about 20 December, **snippet**; 11 people freed, 12 with a child born on the way; PBS counts 13 at the end) ->
  through Kansas from 20 January 1859 [PBS-BROWN] -> crossed the Missouri River at Nebraska City about 4 February 1859 (**snippet**) -> Tabor IA, first week of February (**S**) ->
  Des Moines about 17 February (**snippet**) -> Grinnell, 25 February (**S**, J. B. Grinnell) [PBS-BROWN] -> Iowa City (**P**) and Springdale (**S**) [IOWA-SOI] -> West Liberty, 9 March,
  into a boxcar (**X**) -> Chicago (**S**, Allan Pinkerton raised money and a second car) -> Detroit -> ferry to Canada 12 March 1859 [PBS-BROWN]; Windsor named in a **snippet**.
- **The Iowa line as a list of towns:** Tabor, Lewis, Des Moines, Grinnell, Iowa City, West Liberty, Tipton, DeWitt, Low Moor, Clinton [IOWA-SOI] (a school reader - thin, but
  consistent with the dated Brown stops). Siebert says only southern Iowa lay on the main line of travel and names no towns [SIEBERT-V].
- **Kansas:** "depots" there "full to overflowing" in January 1859; Dr. John Doy and a party of freedom seekers captured 25 January 1859 [HB-JOHNSON] [HB-TIME]. The Lane Trail:
  a local heritage page (read; thin) says it was laid out in July 1856 as a free-state *emigrant* road from Nebraska City through southeast Nebraska to Topeka (Plymouth,
  Lexington, Holton, Topeka), with emigrants crossing Iowa and some stopping at Tabor; it describes freedom seekers (mainly from Missouri, Arkansas and Texas) on a separate
  "westernmost" branch: Lawrence -> Wakarusa River -> Bloomington -> near Auburn -> Mission Creek / Wabaunsee, joining the main trail near the Nebraska line; activity
  "escalated in 1857"; routes "fluctuated" [LANE]. It does not itself tie freedom seekers to the Nebraska or Iowa segments - that link comes from Brown's 1859 trip
  and from **snippets**. Mark approximate.
- **Wartime:** Missouri -> ferry over the Missouri River -> Leavenworth KS, 1864 (Henry Clay Bruce) [HB-JOHNSON].
- **Years:** 1856-57 (Lane Trail, thin) / 1858-1859 (documented) / 1864. **Dating:** exact for Brown's trip. **Path:** documented stops in Iowa; approximate in Kansas and Nebraska.
- **Davenport:** not named in any source I read.
- **Legs:** (Lawrence or Topeka) -> Nebraska City -> Tabor -> (T10) -> West Liberty -> Chicago -> (T8) Detroit -> (T9) Windsor; branch West Liberty -> Tipton -> DeWitt -> Low Moor -> Clinton.

#### K17. South to Mexico

- **Phase 1, Louisiana to Spanish/Mexican Texas:** western Louisiana (Atchafalaya; Grande Prairie; Vermilion Parish - nearly 100 escapes in summer 1822) -> across the Sabine River
  (then the border) -> Nacogdoches and San Antonio de Bexar (freedom suits 1831-1832) [HB-BAUM]. A Natchitoches -> Monclova route is mentioned in [WP-UGRR].
- **Phase 2, Texas to the Rio Grande (after 1836):** Texas (e.g. Big Cypress Creek near Houston, Sept 1858) -> across the Nueces Strip -> Rio Grande (**X**) ->
  Piedras Negras, Coahuila (**T**, "frequently" reached in the early 1850s; opposite Eagle Pass - the article names only Piedras Negras), Matamoros (**T**, people found work
  there), Reynosa (Mathilde Hennes, 1850), Coahuila towns Muzquiz and Nava (military colonies), Paso del Norte (1859) [NPS-MEX] [HB-BAUM]. Hidalgo County TX: Nathaniel Jackson's
  ranch (**S**) and John Webber's ferry (**X**) are stated as fact by [NPS-MEX] but called family lore by [HB-BAUM] - sources disagree on firmness.
- **By sea:** hiding aboard ships at New Orleans; canoes and flatboats from the Texas coast; cases at Veracruz (1831) and Campeche (1835) [HB-BAUM].
- **Black Seminoles:** Wild Cat entered Mexico "in 1849" with Seminoles, enslaved and free Black people [NPS-THEME]; the group settled at El Nacimiento, Coahuila, in 1852
  [WP-MASCOGOS]. The commonly given crossing date of 1850 at Eagle Pass is UNCONFIRMED (memory). A Mascogo settlement near Piedras Negras is noted by [NPS-MEX].
- **Legal anchors:** 1824 ban on importing slaves; 1829 Guerrero decree (Texas exempted, later partly reversed); abolition 5 April 1837; extradition talks failed 1850, 1851,
  1853, 1857 [HB-BAUM] [HB-TIME] [NPS-MEX].
- **Years:** 1822-1865. **Dating:** exact for laws and cases. **Path:** conjectural across Texas - Baumgartner says there was no organised network in Mexico, "only occasional allies",
  and found a single source using "Underground Railroad" for this route [HB-BAUM].

#### K18. Spanish Florida (two periods) and the Gulf coast maroon forts

- **Period 1, 1687-1763:** Carolina (later also Georgia) -> by land through swamps or by canoe -> St. Augustine (**T**) -> Fort Mose, Gracia Real de Santa Teresa de Mose, two miles
  north (**T**, founded 1738; captured 1740; rebuilt 1752; evacuated to Cuba 1763) [NPS-MOSE] [FLMNH] [WP-MOSE]. First arrivals 1687 by canoe (**snippet**; Landers's article is
  titled "Spanish Sanctuary: Fugitives in Florida, 1687-1790"); [WP-MOSE] gives 1689 for the first Spanish welcome; royal edict of Charles II 1693 [WP-MOSE] [BARAM].
  NPS theme study dates the offer of freedom to 1738 only [NPS-THEME] - it is simply less complete.
- **Period 2, 1784-1821:** Spain returned in 1784; sanctuary policy ended in 1790 under US pressure (**snippet**). Prospect Bluff / "Negro Fort" on the Apalachicola (**T**; built from
  May 1814, destroyed 27 July 1816; about 330 people present) -> survivors to the Suwannee valley, Tampa Bay and Angola on the Manatee River, some to the Bahamas [WP-NEGROFORT] [BARAM].
  First Seminole War 1817-18; US takes Florida 1819-1821 [HB-PARGAS] [NPS-THEME].
- **Destination:** St. Augustine/Fort Mose; later Seminole country.
- **Dating:** exact for 1693, 1738, 1740, 1763, 1814, 1816; the 1687 start is well attested in snippets but I did not read Landers directly.
- **Path:** conjectural - no source names intermediate places between Carolina and St. Augustine. Draw as a direction, not a road.

#### K19. Florida -> Bahamas ("Saltwater Railroad")

- **Places:** Cape Florida on Key Biscayne (**X**) -> across the Gulf Stream -> Andros Island (**T**; Red Bays settlement, per Rosalyn Howard as cited in [BARAM] and in snippets).
  About 300 Black Seminoles in the early 1820s [WP-SALT]; an 1820 traveller counted 60 "Indians", 60 "runaway slaves" and 27 Bahamian wreckers' boats at the cape [WP-SALT].
- **Other documented Bahamas-bound cases:** Jonathan Walker took four people from Pensacola in 1844, intercepted [NPS-THEME]; the *Creole* revolt ended at Nassau in 1841 [WP-UGRR] [HB-BARKER].
- **Legal anchors:** 1825 Colonial Office ruling that enslaved Americans reaching the Bahamas were free; 1834 abolition [HB-NEWBY].
- **Years:** 1819/1821 to the mid-1820s for Cape Florida (lighthouse begun 1825); the label "1821-1861" appears only in a citation title [WP-SALT]. Snippets disagree: 1821-1837
  with about 200 people; "nearly 300" in 27 vessels. Cape Florida became a Network to Freedom site in 2004 [WP-SALT].
- **Dating:** circa. **Path:** crossing documented; exact landing places on Andros not given in what I read.
- **Haiti and the rest of the Caribbean:** the NPS map draws lines to Cuba, Jamaica and Haiti [NPS-MAP], and [NPS-WHAT] lists Caribbean islands as destinations, but I found no documented
  escape route to Haiti. What is documented is organised *emigration* of free people to Haiti in the 1820s [NPS-THEME]. Leave Haiti off as a UGRR corridor.

#### K20. Great Dismal Swamp (destination, not corridor)

- Virginia - North Carolina border, between the James River near Norfolk and Albemarle Sound [WP-DISMAL]; "a common destination" for freedom seekers [HB-PARGAS]; the NPS map shows a
  spur "pointing toward the Great Dismal Swamp" [NPS-MAP]. Also used as a way to Norfolk harbor [HB-NEWBY].
- **Years:** about 1700 to the 1860s in the lead of [WP-DISMAL]; other studies there say 1630-1865. Canal built 1793-1805. Population: Aptheker (1939) "about two thousand";
  later studies "thousands". Pargas argues marronage probably helped more people than northern vigilance networks did (as reported in [HB-PINSKER]).
- Other maroon refuges named: Okefenokee, southern Louisiana, lowcountry swamps of South Carolina and Georgia [HB-PARGAS] [NPS-THEME] [NPS-MAP].

#### K21. The West (California, Pacific)

- NPS lists "the West" and the Pacific coast (linked to whaling) among destinations [NPS-WHAT]; the FAQ says some went by whaling ships to San Francisco and Hawaii [NPS-FAQ];
  the NPS map draws a line up the Pacific coast and a spur "To Hawaii" [NPS-MAP].
- Documented *events*, not routes: Archy Lee, brought from Mississippi to Sacramento in October 1857, arrested at the Hackett House in January 1858, freed 6 April 1858, later
  briefly in Canada [NPS-LEE] [HB-TIME] (the NPS biography does not itself use the words "Underground Railroad"; the Hackett House's Network to Freedom listing is a **snippet**);
  Barney Ford, Chicago to Denver [NPS-PLACES].
  [NPS-WEST] describes no routes at all.
- **Verdict:** NPS documents freedom-seeking in the West but gives no corridor with places and dates. If drawn, it should be a symbol at Sacramento/San Francisco (1858), not a line.

#### K22. Civil War: flight to Union lines (1861-1865)

- **How NPS treats it:** it is inside the Underground Railroad. [NPS-WHAT] names "the lines of the Union army" as a destination and runs the period to the end of the war; [NPS-FAQ] says
  it continued "through the Civil War" until at least the 13th Amendment; the handbook has a full essay arguing the UGRR "did not end" in 1861 but shifted and sped up [HB-MANNING]; the theme
  study has a section "Contrabands, Soldiers and Emancipation" [NPS-THEME]; the Corinth Contraband Camp is pictured on the handbook's Network to Freedom page [HB-NTF]. The opposing contemporary view is
  McKim's, that the UGRR was effectively over in 1861 [HB-FONER].
- **Dated places:** Fort Monroe VA, 23 May 1861 (Baker, Mallory, Townsend; Butler's "contraband" decision) [HB-MANNING] [HB-TIME]; Arlington VA, Nov 1861; Sea Islands / Port Royal SC
  captured 1861 (7 November is UNCONFIRMED (memory); [WP-PORTROYAL] gives only the year), about 10,000 people left behind; Beaufort SC 1862; Fredericksburg VA, Aug 1862;
  Cumberland Landing VA 1862; Helena AR 1863; Corinth MS 1863; LaGrange TN spring 1863; Washington DC (10,000 refugees by 1863 [WP-UGRR]); Leavenworth KS 1864 [HB-JOHNSON].
  Combahee River raid, 1 June 1863, more than 750 freed [NPS-TUB].
- **Numbers:** more than 400,000 (intro) or more than 474,000 (body) people spent time in contraband camps - the essay gives both [HB-MANNING].
- **Path:** these are points, not routes. Draw as destinations that appear in 1861-1865.

#### A.2 Canadian termini (for the end points of K2, K11, K12-K16)

| Place | What the source says | Date given | Source |
|---|---|---|---|
| St. Catharines | Destination of Tubman's parties and many Virginians; Salem Chapel | 1850s; parents brought 1857 | [NPS-TUB] [HB-NEWBY] [HB-BARKER] [WP-TUB] |
| Niagara (Niagara-on-the-Lake) | About 200 Black men rescued Solomon Moseby | 1837 | [HB-BARKER] |
| Toronto | Smallwood settled 1843; Glover near Toronto 1854 | 1843, 1854 | [HB-HARROLD] [WP-GLOVER] |
| Hamilton | Growing Black community | not dated | [HB-BARKER] |
| Windsor | Blackburns taken there | 1833 | [HB-BARKER] |
| Sandwich | Quarlls; *Voice of the Fugitive* | 1843; 1851-52 | [HB-JOHNSON] [HB-BARKER] |
| Amherstburg (Fort Malden) | "chief place of entry"; Refugee Home Society nearby | 1850s | [WP-UGRR] [NPS-THEME] |
| Chatham | *Provincial Freeman*; John Brown's convention | 1850s; May 1858 | [HB-BARKER] [WP-TUB] |
| Buxton (Elgin settlement, Raleigh Township) | Founded by Rev. William King | 1849 [WP-ELGIN]; "1850-1873" [NPS-THEME] | disagreement of one year |
| Dresden (Dawn settlement) | Josiah Henson; British-American Institute | 1841, institute 1842 [WP-DAWN]; "1843-1868" [NPS-THEME] | disagreement |
| Wilberforce (near London) | Founded after the 1829 Cincinnati riot | 1829 ("1829-1836" [NPS-THEME]) | [HB-BARKER] |
| Oro Township | Land grants to Black veterans of 1812 | not dated | [HB-BARKER] |
| Queen's Bush | Black settlement | 1839-1865 (from a book title) | [HB-BARKER] |
| Owen Sound, Collingwood | Listed by Siebert; Chicago vessels to Collingwood | - | [SIEBERT-V] (**R**) |
| Kingston, Prescott | Listed by Siebert | - | [SIEBERT-V] (**R**) |
| Montreal | Listed by Siebert | - | [SIEBERT-V] (**R**) |
| St. John NB | Listed by Siebert | - | [SIEBERT-V] (**R**) |
| Halifax / Nova Scotia | Not a documented antebellum terminus (see K4) | 1783; 1813-16 | [NPS-THEME] [WP-UGRR] |

Parks Canada names no individual town: its plaque says only that "settlements along the Detroit and Niagara rivers" were important terminals, from the early
nineteenth century to the Civil War [PC-UGRR]. That supports drawing two terminal zones (Detroit River; Niagara River) more firmly than any single town list.

NPS summary of settlement: most refugees lived in Canada West near "Toronto, Windsor, Niagara and St. Catherine's", and recent research shows many were "spread thinly" through villages and
farms rather than in the planned colonies [NPS-THEME].

#### A.3 Law dates used as anchors

| Date | Event | Source |
|---|---|---|
| 1693 | Charles II's edict: asylum in Florida for runaways who convert | [WP-MOSE] [BARAM] |
| 1787 | Northwest Ordinance bans slavery north of the Ohio | [HB-JOHNSON] [HB-TIME] |
| 12 Feb 1793 | First federal Fugitive Slave Act | [HB-TIME] |
| 1793 | Upper Canada's Act to Limit Slavery (gradual; bans importation) | [HB-BARKER] [HB-TIME] |
| 1819 | Upper Canada: Robinson rules people free on reaching Canadian soil | [HB-BARKER] [HB-TIME] |
| 1825 | Colonial Office: Americans reaching the Bahamas are free | [HB-NEWBY] |
| 1829 | Guerrero's abolition decree in Mexico (Texas exempted) | [NPS-MEX] [HB-BAUM] |
| 1 Aug 1834 | Abolition takes effect in the British Empire (act passed 1833) | [HB-BARKER] [HB-TIME] |
| 5 Apr 1837 | Mexico's Congress abolishes slavery | [HB-TIME] [NPS-MEX] |
| 18 Sept 1850 | Fugitive Slave Act of 1850 | [HB-TIME] |
| 23 May 1861 | Fort Monroe "contraband" decision | [HB-TIME] |
| 28 June 1864 | Congress repeals both Fugitive Slave Acts | [HB-TIME] |
| 18 Dec 1865 | 13th Amendment proclaimed in force | [HB-TIME] |

Term: first print use of "underground rail-road" documented for 10 August 1842 (Thomas Smallwood, in the *Tocsin of Liberty*, Albany) [WP-UGRR]; NPS says the name dates to the 1840s [NPS-FAQ].

---
### B. Wikidata QIDs

No QID below is from memory. Two live lookups were made on 2026-11-17:

- **Table B1** - the call you specified, `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=NAME&language=en&format=json`.
  The QID shown is the first hit whose description reads like a place; the label and description are copied from the response so you can check them.
  That endpoint began returning HTTP 429 (rate limit) part-way through, so the remaining names are in Table B2.
- **Table B2** - the Wikidata Query Service (`https://query.wikidata.org/sparql`), asking for the item linked to the English Wikipedia article of that exact title.
  This is a stricter match than a text search (the item is the one Wikipedia itself uses for that place), but it is not the wbsearchentities call.

Rows saying "QID not checked" returned nothing; do not fill them in by guesswork.

#### Table B1 (wbsearchentities)

| Search string | QID | Wikidata label | Wikidata description | Note |
|---|---|---|---|---|
| Cambridge, Maryland | Q755862 | Cambridge | city in Dorchester County, Maryland, United States |  |
| Preston, Maryland | Q611879 | Preston | human settlement in Caroline County, Maryland, United States of America |  |
| East New Market | Q754735 | East New Market | town in Dorchester County, Maryland, United States |  |
| Camden, Delaware | Q754342 | Camden | town in Delaware, United States |  |
| Dover, Delaware | Q33518 | Dover | capital city of the U.S. state of Delaware and seat of Kent County |  |
| Smyrna, Delaware | Q755736 | Smyrna | town in Delaware, United States |  |
| New Castle, Delaware | Q755393 | New Castle | city in New Castle County, Delaware, United States |  |
| Wilmington, Delaware | Q174224 | Wilmington | seat of New Castle County, and largest city in Delaware, United States |  |
| Philadelphia | Q1345 | Philadelphia | largest city in the U.S. state of Pennsylvania and seat of Philadelphia County |  |
| New York City | Q60 | New York City | most populous city in the United States |  |
| Albany, New York | Q24861 | Albany | capital city of the U.S. state of New York and seat of Albany County |  |
| Troy, New York | Q600301 | Troy | city in and county seat of Rensselaer County, New York, United States |  |
| Syracuse, New York | Q128069 | Syracuse | city in and county seat of Onondaga County, New York, United States |  |
| Rochester, New York | Q49218 | Rochester | county seat of Monroe County, New York, United States |  |
| Buffalo, New York | Q40435 | Buffalo | city and county seat of Erie County, New York, United States |  |
| Niagara Falls, New York | Q128133 | Niagara Falls | city in New York, United States |  |
| Niagara Falls Suspension Bridge | Q3397656 | Niagara Falls Suspension Bridge | defunct bridge spanning the Niagara River |  |
| St. Catharines | Q126805 | St. Catharines | city in Ontario, Canada |  |
| Auburn, New York | Q225519 | Auburn | city in Cayuga County, New York, United States |  |
| Elmira, New York | Q934135 | Elmira | city in Chemung County, New York, USA |  |
| Williamsport, Pennsylvania | Q1016159 | Williamsport | city in and county seat of Lycoming County, Pennsylvania, United States |  |
| Harrisburg | Q25280 | Harrisburg | capital city of the U.S. state of Pennsylvania and seat of Dauphin County |  |
| Columbia, Pennsylvania | QID not checked | Columbia, Pennsylvania | Wikimedia disambiguation page | first hit is not the place; see B2 |
| York, Pennsylvania | Q821105 | York | city in and county seat of York County, Pennsylvania, United States |  |
| Christiana, Pennsylvania | QID not checked | | | search returned nothing; see B2 |
| Baltimore | Q5092 | Baltimore | city in Maryland, United States |  |
| Washington, D.C. | Q61 | Washington, D.C. | capital city of the United States of America |  |
| Norfolk, Virginia | Q49231 | Norfolk | independent city in Virginia, United States |  |
| Portsmouth, Virginia | Q342803 | Portsmouth | independent city in Virginia, United States |  |
| Richmond, Virginia | Q43421 | Richmond | independent city in and capital of the U.S. state of Virginia |  |
| Wilmington, North Carolina | Q659400 | Wilmington | county seat city in New Hanover County, North Carolina, United States |  |
| Charleston, South Carolina | Q47716 | Charleston | largest city in the U.S. state of South Carolina |  |
| Savannah, Georgia | Q83813 | Savannah | city in and county seat of Chatham County, Georgia, United States |  |
| Jacksonville, Florida | Q16568 | Jacksonville | city in Duval County, and largest city in State of Florida, United States |  |
| New Bedford | Q49147 | New Bedford | city in Bristol County, Massachusetts, United States |  |
| Boston | Q100 | Boston | capital city of the U.S. state of Massachusetts and seat of Suffolk County |  |
| Hartford, Connecticut | Q33486 | Hartford | capital city of the U.S. state of Connecticut, located in Hartford County and the Capitol Planning Region |  |
| Springfield, Massachusetts | Q49158 | Springfield | county seat of Hampden County, Massachusetts, United States |  |
| Northampton, Massachusetts | Q49186 | Northampton | county seat of Hampshire County, Massachusetts, United States |  |
| Florence, Massachusetts | Q5460527 | Florence | village in Northampton, Massachusetts |  |
| Providence, Rhode Island | Q18383 | Providence | capital city of the U.S. state of Rhode Island and seat of Providence County |  |
| Valley Falls, Rhode Island | Q3476807 | Valley Falls | census-designated place in Rhode Island, United States |  |
| Worcester, Massachusetts | Q49179 | Worcester | county seat city in Worcester County, Massachusetts, United States |  |
| Portland, Maine | Q49201 | Portland | seat of Cumberland County, and largest city in State of Maine, United States |  |
| Brattleboro | Q899813 | Brattleboro | town in Windham County, Vermont, United States |  |
| Montpelier, Vermont | Q26426 | Montpelier | capital city of the U.S. state of Vermont and seat of Washington County |  |
| Burlington, Vermont | Q31058 | Burlington | city in Chittenden County, Vermont, United States |  |
| St. Albans, Vermont | Q1787559 | Saint Albans | city in, and county seat of, Franklin County, Vermont, United States |  |
| Ferrisburgh | Q1874592 | Ferrisburgh | town in the Vermont, United States |  |
| Bennington, Vermont | Q817921 | Bennington | town in Bennington County, Vermont, United States |  |
| Rutland, Vermont | Q25893 | Rutland | city in and county seat of Rutland County, Vermont, United States |  |
| Montreal | Q340 | Montreal | largest city in Quebec, Canada |  |
| Saint John, New Brunswick | Q203403 | Saint John | city in New Brunswick, Canada |  |
| Halifax, Nova Scotia | Q2141 | Halifax | municipality in the province of Nova Scotia, Canada |  |
| Uniontown, Pennsylvania | Q1187047 | Uniontown | city in Fayette County, Pennsylvania, United States |  |
| Washington, Pennsylvania | Q594697 | Washington | city in and the county seat of Washington County, Pennsylvania, United States |  |
| Pittsburgh | Q1342 | Pittsburgh | city and county seat in Allegheny County, Pennsylvania, United States | not the first hit; check |
| Erie, Pennsylvania | Q234061 | Erie | city on the south shore of Lake Erie and the county seat of Erie County, Pennsylvania, United States |  |
| Cleveland | Q37320 | Cleveland | city in and county seat of Cuyahoga County, Ohio, United States |  |
| Ripley, Ohio | Q2666983 | Ripley | village in Union Township, Brown County, Ohio, United States |  |
| Sardinia, Ohio | QID not checked | | | search returned nothing; see B2 |
| Cincinnati | Q43196 | Cincinnati | city in and seat of Hamilton County, Ohio, United States |  |
| Marietta, Ohio | Q985482 | Marietta | city in and county seat of Washington County, Ohio, United States |  |
| Gallipolis | Q176684 | Gallipolis | town in Ohio, United States |  |
| Zanesville | Q146811 | Zanesville | city in Muskingum County, Ohio, United States | not the first hit; check |
| Chesterhill, Ohio | QID not checked | | | search returned nothing; see B2 |
| Columbus, Ohio | Q16567 | Columbus | capital city of the U.S. state of Ohio and seat of Franklin County, also located in Delaware and Fairfield counties |  |
| Oberlin, Ohio | Q988384 | Oberlin | city in Lorain County, Ohio, United States |  |
| Sandusky, Ohio | Q608207 | Sandusky | seat of Erie County, Ohio, USA |  |
| Toledo, Ohio | Q49239 | Toledo | city in and county seat of Lucas County, Ohio, United States |  |
| Ashtabula, Ohio | Q726287 | Ashtabula | city in Ashtabula County, Ohio, USA |  |
| Painesville | Q998689 | Painesville | city in Lake County, Ohio, United States |  |
| Urbana, Ohio | Q1762816 | Urbana | city in Champaign County, Ohio, USA |  |
| Lebanon, Ohio | Q986776 | Lebanon | city and the county seat of Warren County, Ohio, United States |  |
| Madison, Indiana | Q990883 | Madison | county seat of Jefferson County, Indiana, United States |  |
| New Albany, Indiana | Q1762878 | New Albany | city in Floyd County, Indiana, United States |  |
| Jeffersonville, Indiana | Q977206 | Jeffersonville | city in Clark County, Indiana, United States |  |
| Fountain City, Indiana | Q1439902 | Fountain City | town in Indiana |  |
| Salem, Indiana | Q931178 | Salem | city in Washington Township, Washington County, Indiana, United States |  |
| Evansville | Q486459 | Evansville | county seat of Vanderburgh County, Indiana, United States |  |
| Cass County, Michigan | Q167583 | Cass County | county in Michigan, United States |  |
| Battle Creek | Q810998 | Battle Creek | city in Calhoun County, Michigan, United States |  |
| Schoolcraft, Michigan | Q2432061 | Schoolcraft | village in Kalamazoo County, Michigan, United States |  |
| Detroit | Q12439 | Detroit | city in and county seat of Wayne County, and largest city in State of Michigan, United States |  |
| Windsor, Ontario | Q182625 | Windsor | city in Essex County, Ontario, Canada |  |
| Sandwich, Ontario | Q7084898 | Old Sandwich Town | human settlement in Ontario, Canada |  |
| Amherstburg | Q385335 | Amherstburg | town in Essex County, Ontario, Canada |  |
| Chatham, Ontario | Q5087616 | Chatham | community in Ontario, Canada |  |
| North Buxton | Q7054337 | North Buxton | Southwestern Ontario community established by African-Americans who escaped slavery in the U.S. |  |
| Dresden, Ontario | Q1258446 | Dresden | community in Ontario, Canada |  |
| Toronto | Q172 | Toronto | capital and largest city of the province of Ontario, Canada |  |
| Hamilton, Ontario | Q133116 | Hamilton | city in Ontario, Canada |  |
| Niagara-on-the-Lake | QID not checked | | | search returned nothing; see B2 |
| Owen Sound | Q1017735 | Owen Sound | city in Ontario, Canada |  |
| Collingwood, Ontario | Q3501912 | Collingwood | town in Simcoe County, Ontario, Canada |  |
| London, Ontario | Q92561 | London | city in Ontario, Canada |  |
| Kingston, Ontario | Q202973 | Kingston | city in Ontario, Canada |  |
| St. Louis | Q38022 | St. Louis | independent city in Missouri, United States |  |
| Quincy, Illinois | Q575750 | Quincy | county seat of Adams County, Illinois, United States |  |
| Alton, Illinois | Q443852 | Alton | city in Madison County, Illinois, United States |  |
| Chester, Illinois | Q575518 | Chester | city in Illinois, United States |  |
| Cairo, Illinois | Q575306 | Cairo | city in Illinois, United States |  |
| Springfield, Illinois | Q28515 | Springfield | capital city of the U.S. state of Illinois and county seat of Sangamon County |  |
| Galesburg | Q782574 | Galesburg | county seat of Knox County, Illinois, United States |  |
| Princeton, Illinois | Q574878 | Princeton | city in and the county seat of Bureau County, Illinois, United States |  |
| Ottawa, Illinois | Q576209 | Ottawa | city in Illinois, United States |  |
| Chicago | Q1297 | Chicago | city and county seat of Cook County, and largest city in State of Illinois, United States of America |  |
| Racine, Wisconsin | Q40340 | Racine | city in and county seat of Racine County, Wisconsin, United States |  |
| Milwaukee | Q37836 | Milwaukee | city in and county seat of Milwaukee County, and largest city in State of Wisconsin, United States |  |
| Kenosha | Q462161 | Kenosha | city in and county seat of Kenosha County, Wisconsin and part of the Chicago metropolitan area, known as Chicagoland |  |
| Lawrence, Kansas | Q493840 | Lawrence | city in and county seat of Douglas County, Kansas, United States |  |
| Topeka | Q41057 | Topeka | capital city of the U.S. state of Kansas and seat of Shawnee County |  |
| Leavenworth, Kansas | Q1762867 | Leavenworth | city in and county seat of Leavenworth County, Kansas, United States |  |
| Osawatomie | Q2602955 | Osawatomie | city in Miami County, Kansas, United States of America |  |
| Nebraska City | Q286025 | Nebraska City | city and county seat of Otoe County, Nebraska, United States |  |
| Tabor, Iowa | Q2240032 | Tabor | city in Iowa |  |
| Lewis, Iowa | Q1930350 | Lewis | city in Cass County, Iowa, United States |  |
| Des Moines | Q39709 | Des Moines | capital city of the U.S. state of Iowa and seat of Polk County |  |
| Grinnell, Iowa | Q1903250 | Grinnell | city in Poweshiek County, Iowa, United States |  |
| Iowa City | Q487977 | Iowa City | city in and seat of Johnson County, Iowa, United States |  |
| Springdale, Iowa | Q7580831 | Springdale | human settlement in Iowa, United States of America |  |
| West Liberty, Iowa | Q2066047 | West Liberty | city in Muscatine County, Iowa |  |
| Tipton, Iowa | Q1925245 | Tipton | city in Iowa, United States |  |
| DeWitt, Iowa | Q990866 | DeWitt | city in Clinton County, Iowa |  |
| Low Moor, Iowa | Q994994 | Low Moor | city in Clinton County, Iowa, United States |  |
| Clinton, Iowa | Q676421 | Clinton | city in, and the county seat of, Clinton County, Iowa, United States |  |
| Houston | Q16555 | Houston | seat of Harris County, and largest city in State of Texas, United States |  |
| San Antonio | Q975 | San Antonio | city in Texas |  |
| Nacogdoches | Q970482 | Nacogdoches | city in and county seat of Nacogdoches County, Texas, United States |  |
| Brownsville, Texas | Q51693 | Brownsville | city in and county seat of Cameron County, Texas, United States |  |
| Matamoros | Q3850603 | Matamoros Municipality | municipality in the State of Coahuila, Mexico |  |
| Reynosa | Q3849133 | Reynosa Municipality | municipality in the State of Tamaulipas, Mexico | not the first hit; check |
| Eagle Pass | Q982486 | Eagle Pass | city in and the county seat of Maverick County, Texas, United States |  |
| Piedras Negras | Q2031261 | Piedras Negras | ruined city of pre-Columbian Maya civilization in Guatemala |  |
| Múzquiz | Q2466033 | Muzquiz Municipality | municipality in the State of Coahuila, Mexico |  |
| El Nacimiento | Q5822594 | Nacimiento | settlement in northern Mexico |  |
| Monclova | Q3849647 | Monclova Municipality | municipality in the State of Coahuila, Mexico |  |
| New Orleans | Q34404 | New Orleans | largest city of the state of Louisiana, United States |  |
| St. Augustine, Florida | Q487988 | St. Augustine | city in St. Johns County, Florida, United States |  |
| Fort Mose | Q549331 | Fort Mose Historic State Park | site of a former Spanish fort in St Augustine, Florida |  |
| Negro Fort | Q4871874 | Negro Fort | fort built by the British in 1814 in Spanish-Florida, US |  |
| Angola, Florida | Q54322404 | Angola, Florida | former prosperous community, in US, of escaped slaves |  |
| Cape Florida | QID not checked | SS Cape Florida | ship built in 1971 | first hit is not the place; see B2 |
| Key Biscayne | Q1650594 | Key Biscayne | village in Miami-Dade County, Florida, United States |  |
| Andros, Bahamas | QID not checked | Andros | archipelago of the Bahamas | first hit is not the place; see B2 |
| Red Bays | Q134455150 | Red Bays | village in Andros, The Bahamas |  |
| Nassau, Bahamas | Q2467 | Nassau | capital and largest city of the Bahamas |  |
| Pensacola | Q486306 | Pensacola | county seat of Escambia County, Florida, United States | not the first hit; check |
| Great Dismal Swamp | QID not checked | | | search returned nothing; see B2 |
| Fort Monroe | Q16981236 | Fort Monroe | historic site in Yosemite National Park | not the first hit; check |
| Port Royal, South Carolina | Q926275 | Port Royal | town in Beaufort County, South Carolina, United States |  |
| Beaufort, South Carolina | Q813376 | Beaufort | city in Beaufort County, South Carolina, United States |  |
| Hilton Head Island | Q1001134 | Hilton Head Island | resort town in South Carolina, USA |  |
| Corinth, Mississippi | Q1992093 | Corinth | city in Mississippi, United States |  |
| Sacramento | Q18013 | Sacramento | capital city of the U.S. state of California and seat of Sacramento County |  |
| San Francisco | Q62 | San Francisco | city and county in California, United States |  |
| Harpers Ferry | Q985289 | Harpers Ferry | town in West Virginia, United States |  |

#### Table B2 (query service, by English Wikipedia article title)

| English Wikipedia title | QID | Wikidata label | Wikidata description | Note |
|---|---|---|---|---|
| Matamoros, Tamaulipas | Q738353 | Heroica Matamoros | municipal seat of Matamoros, State of Tamaulipas, Mexico |  |
| Reynosa | Q738303 | Reynosa | municipal seat of Reynosa, State of Tamaulipas, Mexico |  |
| Piedras Negras, Coahuila | Q1856408 | Piedras Negras | municipal seat of Piedras Negras, State of Coahuila, Mexico |  |
| Monclova | Q990007 | Monclova | municipal seat of Monclova, State of Coahuila, Mexico |  |
| Cape Florida | QID not checked | | | no English Wikipedia article of this exact title |
| Key Biscayne | Q2689037 | Key Biscayne | island in Miami-Dade County, Florida, United States |  |
| Andros, Bahamas | QID not checked | | | no English Wikipedia article of this exact title |
| Red Bays | QID not checked | | | no English Wikipedia article of this exact title |
| Great Dismal Swamp | Q1544257 | Great Dismal Swamp | large swamp in the coastal plain region of southeastern Virginia and northeastern North Carolina |  |
| Fort Monroe | Q1438639 | Fort Monroe | former military installation in Hampton, Virginia, United States |  |
| Christiana, Pennsylvania | Q1133883 | Christiana | borough in eastern Lancaster County, Pennsylvania |  |
| Sardinia, Ohio | Q36879 | Sardinia | human settlement in Brown County, Ohio, United States of America |  |
| Chesterhill, Ohio | Q2669023 | Chesterhill | human settlement in Morgan County, Ohio, United States of America |  |
| Columbia, Pennsylvania | Q1133892 | Columbia | borough in western Lancaster County, Pennsylvania, United States |  |
| Fort Malden | Q5471580 | Fort Malden | history museum in Amherstburg, Ontario, Canada | not a settlement item; check before use |
| Canton, Indiana | Q5033862 | Canton | unincorporated community in Washington County, Indiana, United States |  |
| Azalia, Indiana | Q4832149 | Azalia | unincorporated community in Bartholomew County, Indiana |  |
| Carthage, Indiana | Q3293425 | Carthage | town in Indiana, United States |  |
| Williamstown, West Virginia | Q2526491 | Williamstown | human settlement in Wood County, West Virginia, United States |  |
| Willow Grove, Delaware | Q8022318 | Willow Grove | unincorporated community in Delaware |  |
| Sandtown, Delaware | Q7416983 | Sandtown | unincorporated community in Kent County, Delaware |  |
| Blackbird, Delaware | Q14685260 | Blackbird | unincorporated community in New Castle County, Delaware |  |
| Cassopolis, Michigan | Q2373038 | Cassopolis | village in Cass County, Michigan, United States |  |
| Buxton National Historic Site and Museum | Q5003272 | Buxton National Historic Site and Museum | open-air museum in Chatham-Kent, Ontario, Canada | not a settlement item; check before use |
| North Buxton, Ontario | QID not checked | | | no English Wikipedia article of this exact title |
| Wilberforce Colony | Q8000084 | Wilberforce Colony | colony in Ontario, Canada |  |
| Weeksville, Brooklyn | Q4163943 | Weeksville | neighborhood in Brooklyn, New York |  |
| Newton, Massachusetts | Q49196 | Newton | city in Massachusetts, United States |  |
| Norwich, Connecticut | Q631402 | Norwich | city in New London County, Connecticut, United States |  |
| Springtown, New Jersey | QID not checked | Springtown, New Jersey | Wikimedia disambiguation page | title resolves to a disambiguation page |
| Canandaigua, New York | Q1363104 | Canandaigua | city in Ontario County, New York, United States |  |
| Watkins Glen, New York | Q2738851 | Watkins Glen | Village and CDP in New York, US |  |
| Vernon County, Missouri | Q496440 | Vernon County | county in Missouri, United States |  |
| Sandwich, Ontario | QID not checked | | | no English Wikipedia article of this exact title |
| Chatham-Kent | Q113464 | Chatham-Kent | rural municipality in Ontario, Canada |  |
| Niagara-on-the-Lake | Q448372 | Niagara-on-the-Lake | town in Niagara Region, Ontario, Canada |  |
| Nacimiento de los Negros | QID not checked | | | no English Wikipedia article of this exact title |
| Putnam Historic District (Zanesville, Ohio) | QID not checked | | | no English Wikipedia article of this exact title |
| Mascogos | Q39056887 | Mascogos | afrodescendent group in Coahuila, Mexico | not a settlement item; check before use |


---

### C. Numbers

#### C.1 Totals and rates

| Figure | What it counts | Who says so | Source key |
|---|---|---|---|
| about 100,000 | successful escapes 1790-1860 ("many scholars") | NPS theme study; also Pargas | [NPS-THEME] [HB-PARGAS] |
| 1,000 a year, perhaps 1,500 | successful escapes per year (theme study raises the census-based 1,000 by half; cites Gara p. 32 for 1,500 in the late antebellum years) | NPS theme study | [NPS-THEME] |
| 1,010 (1850) and 803 (1860) | escapes "to free territory" recorded by the federal census in the preceding year, "principally from the border states" | Clement Eaton (1961), quoted by NPS | [NPS-THEME] |
| 1,011 for 1850 | the figure in your brief | UNCONFIRMED (memory) - I could not find it on a page; the NPS text has 1,010 | - |
| about 1,000 a year | "annual attempts at permanent escape"; also 100,000 a year "laying out" temporarily | Dickinson course page, unsourced there | [DICK-STATS] |
| 3,000+ | successful escapes recorded by vigilance committees in the 1850s | same | [DICK-STATS] |
| about 300 a year | escapes from Kentucky, from claims for stolen property | Harrison, via NPS | [NPS-THEME] |
| 500,000 or more | self-emancipations by the end of the Civil War (J. Blaine Hudson) | Wikipedia | [WP-UGRR] |
| 400,000+ / 474,000+ | people who reached Union contraband camps, 1861-65 (essay gives both) | Manning | [HB-MANNING] |
| "as many as one hundred thousand" | helped by the network | GPO blog on the NPS handbook | [GPO] |
| no total given | NPS's current public pages decline to give one; the new handbook says hard annual estimates are "largely absent" | NPS; Pinsker | [NPS-WHAT] [HB-PINSKER] |

Related enforcement counts: 332 people returned under the 1850 act in the 1850s (Campbell) and roughly 125 formal hearings [HB-PINSKER]; [WP-UGRR] gives 343 brought before commissioners, 332 returned.

#### C.2 By person, committee or place

| Figure | What | Source |
|---|---|---|
| 800+ accounts | people recorded in Still's 1872 book | [HB-CREW] |
| 995 | freedom seekers in the Kashatus/McGowan dataset from Still's journal, mapped in the handbook | [HB-MAPS] |
| about 100 a year | assisted by the Philadelphia committee in the 1850s, mostly young men from Virginia and Maryland | [NPS-THEME] |
| 649 / "as many as 800" | Still, per Wikipedia | [WP-STILL] |
| "well over two hundred" | arrivals in Gay's Record of Fugitives, New York, 1855-56; more than half via Philadelphia; nearly half from Maryland and Delaware | [HB-FONER] |
| 800+ by 1840 | claimed by the New York Committee of Vigilance | Foner's book, **snippet** |
| about 200 in 1855 | passing through Syracuse, "per one account" | [HB-FONER] |
| nearly 50 | sent by Garrett to New York (in Gay's record) | [HB-FONER] |
| about 2,700 / 2,500+ | Garrett's lifetime total (2,700 in Larson's essay; Wikipedia says 2,500+ and that the number "has sometimes been exaggerated") | [HB-LARSON] [WP-GARRETT] |
| about 3,000 / 2,000+ / 1,000+ | Coffin: 3,000 is his own estimate, he kept no records [WP-COFFIN]; "more than 2,000" [WP-UGRR]; "1,000+" over forty years in Bordewich's essay [HB-BORD] | disagreement |
| about 70 in 13 trips | Tubman | [NPS-TUB] |
| about 150 | sent north from Washington by Smallwood and Torrey, Aug-Oct 1842 | [HB-HARROLD] |
| "hundreds over several decades" | Madison, Indiana network | [HB-CHURCHILL] |
| 1,000-1,500 | the Thomas family, Schoolcraft MI (their own account) | [NPS-PLACES] |
| "not less than two hundred" | Philo Carpenter, Chicago, to lake vessels | [SIEBERT-V] |
| 3,000 | Louis Napoleon, New York (1875 newspaper claim) | [HB-FONER] |

#### C.3 By destination

| Destination | Figure | Source and caution |
|---|---|---|
| Canada | 30,000 reached Canada (Gay's post-war claim) | [HB-FONER], presented as a claim |
| Canada | Black population of Upper Canada about 30,000 in 1852 (Anti-Slavery Society of Canada); scholars still debate | [HB-BARKER] |
| Canada | about 30,000 freedom seekers living in what is now Ontario by 1861 (plaque text, no method given) | [PC-UGRR] |
| Canada | 20,000 African Americans, mostly western Ontario, in the 1850s (Michael Wayne, from the 1861 manuscript census) | [NPS-THEME] |
| Canada | 30,000-40,000 settled, about half 1850-60; elsewhere "30,000 to over 100,000"; US census counted only 6,000 | [WP-UGRR] (mixed sourcing) |
| Mexico | "as many as five thousand" across the southwestern border, 1836-1865 | [NPS-THEME] |
| Mexico | 3,000-5,000 (Baumgartner's book, from "scattered and incomplete" Mexican sources); later interview range 4,000-10,000 | reviews, **snippet**; her NPS essay gives no total [HB-BAUM] |
| Mexico | 2,500+ escapes documented from Texas runaway ads (Texas Runaway Slave Project) | [WP-UGRR] |
| Bahamas | over 6,000 received freedom there after 1834, "many" from the US (this includes ship cases, not only Florida) | [HB-NEWBY] |
| Bahamas via Cape Florida | about 300 Black Seminoles, early 1820s; snippets say about 200 (1821-37) or "nearly 300" | [WP-SALT] |
| Spanish Florida | Fort Mose about 100 people; 67 in 1759; about 400 free and enslaved Black people left for Cuba in 1763 | [NPS-MOSE] [FLMNH] [WP-MOSE] |
| Prospect Bluff | about 330 present in 1816 | [WP-NEGROFORT] |
| Great Dismal Swamp | "about two thousand" (Aptheker 1939) to "thousands" | [WP-DISMAL] |

#### C.4 Plain answer on line widths

**No per-corridor counts good enough to set line widths exist in anything I read.** What exists is:

1. totals that are themselves disputed (100,000 over seventy years; about 1,000-1,500 a year);
2. two office ledgers for two cities over a few years (Still 1852-57, Gay 1855-56);
3. self-reported lifetime claims by individual operators (Coffin, Garrett, Napoleon), which historians treat with caution;
4. destination-level ranges (Canada 20,000-40,000; Mexico 3,000-5,000 or more; Bahamas a few hundred to 6,000 depending on what is counted).

National Geographic's 1984 map says widths show "relative numbers" [NGS-CAT] but the catalog record gives no data source for them, and I could not reach National Geographic's own page.
If widths are wanted, the defensible choice is three ordinal classes backed by the qualitative statements above, labelled as editorial judgement:

- heavier: border-state corridors into Pennsylvania and across the Ohio (most escapes came from the border states [NPS-THEME] [HB-BORD]); Philadelphia -> New York -> Syracuse (the two ledgers);
- medium: coastal vessels from Virginia; Detroit River crossing; Texas -> Mexico;
- light: everything from the Deep South, the New England interior, Iowa-Kansas, the Bahamas crossing.

Otherwise use one uniform width and say so in the legend.

---

### D. What historians warn about

1. **Siebert overstated the organised network.** His 1898 map was "pieced together" from the reminiscences of abolitionists gathered in the 1890s; there were no contemporary maps to
   check against [NEWBERRY]. Siebert himself wrote that it "cannot ... be considered complete" and that evidence for regular lines in the South was insufficient [SIEBERT-V]. His focus on
   white conductors and stationmasters became the standard account for decades [HB-CREW]. NPS describes his book as the accounts of "aged white abolitionists or their children" [NPS-THEME].
2. **Gara's critique (*The Liberty Line*, 1961).** Freedom seekers got through the South largely on their own; organised help mattered mainly once they reached the North; Siebert's informants
   may have embellished [HB-CREW] [HB-TIME]. NPS cites Gara on "the logical inconsistencies" of the legend that hundreds used the same trails and hiding places again and again [NPS-THEME].
   Later work (Blockson, LaRoche, Griffler, Bordewich, Foner, Blackett) restored the organised side but centred it on Black communities and vigilance committees [HB-CREW].
3. **Most escapes were from the border states and were short.** "Extremely few enslaved people escaped from the Deep South" [HB-BORD]; most fugitives came from the Upper South and were
   young men; census-recorded escapes came "principally from the border states" [NPS-THEME]. A map with thick arrows out of Mississippi or Alabama misleads.
4. **Help came mainly from free Black people and fellow slaves.** "Free blacks played the most central role"; vigilance committees were mostly Black-led; in the South aid came from "free blacks
   and slaves"; Birney in Cincinnati said such matters were "almost uniformly managed by the colored people" [NPS-THEME]. Quakers were not the whole story and many did not take part [NPS-FAQ].
   Many people escaped with no help at all [NPS-PLACES] [NPS-FAQ].
5. **"Routes" are schematic.** NPS: "No maps with arrows pointing out trails" could encompass what happened; there were "no predetermined trails", which is why it worked; the general
   pattern is "suggestive" only; overland routes in the northeast are "virtually impossible" to trace "with any precision" [NPS-THEME]. The updated NPS handbook "largely omits" route maps
   on purpose and turns to people and relationships [HB-PINSKER]. Franklin and Schweninger: only a small share of runaways used the UGRR at all; most stayed near home and soon returned [HB-CREW].
6. **Not secret, not a single system.** A "loose web" with no centre; open in the upper North (Loguen advertised his house in Syracuse), cautious on the border [HB-BORD] [NPS-THEME].
   No tunnels, no quilt code, no coded songs [HB-BORD] [NPS-FAQ].
7. **Marronage and the southern directions are under-drawn.** Pargas argues marronage likely helped more people than northern vigilance networks [HB-PINSKER]; most Georgia and Florida
   escapees went south, not north [HB-NEWBY]. In Mexico there was no network, only occasional allies [HB-BAUM].
8. **Local tradition is uneven.** Many town-by-town lines (Illinois, Iowa, Kansas, Vermont) rest on county histories and tourism pages descended from Siebert's informants. The file marks these **R** or thin.
9. **Region mattered.** Ohio and Indiana river counties were largely proslavery in sentiment; southwestern Indiana has "little reliable information"; Vermont was less safe than tradition says
   [HB-CHURCHILL] [HB-GROVER].

---

### E. How the published maps describe themselves (wording only)

**NPS "Underground Railroad" Official Map and Guide map** (Harpers Ferry Center; alt-text read at [NPS-MAP]):

- Base: continental United States "in 1860", with 1860 state and territory boundaries.
- Legend, three entries: arrows = "approximate route of flight"; one colour = "Southern states permitting slavery in 1860"; another = "Northern states permitting slavery in 1790".
- Labelled places in the description: Savannah, Charleston, Wilmington DE, Washington DC, Baltimore, Philadelphia, New York City, New Bedford, Boston, Rochester, Cincinnati, Cleveland,
  Detroit, Chicago, St. Louis, Natchez, New Orleans; areas: Great Dismal Swamp, Okefenokee Swamp, Everglades, the "Bayous", Indian Territory, Kansas Territory, New Mexico Territory,
  Bahama Islands, Cuba, Jamaica, Haiti, Virgin Islands, Puerto Rico; one spur labelled "To Hawaii".
- GPO's description of the same publication: the map shows "the general direction of escape routes" [GPO].
- I could not open the 1995 Special Resource Study or the printed 1998 handbook, so I cannot quote the handbook map's own caption or confirm the titles "Routes to Freedom" or
  "Selected Routes of the Underground Railroad" (the latter appears only in a search snippet). The NPS web caption on a current article reads: a map showing the "differing routes that freedom
  seekers would take" [NPS-PLACES]. The theme study gives the handbook's date as February 1997, the NPS web page as 1998 [NPS-THEME] [NPS-HB] - a small disagreement.

**National Geographic, "The Underground Railroad"** (*National Geographic Magazine* vol. 166 no. 1, July 1984; catalog record [NGS-CAT]):

- "Arrows show major avenues of escape."
- "Widths of arrows indicate relative numbers of runaway slaves."
- Shows the eastern United States with free states, slave states and territories. Charles Blockson's article appeared in the same year [HB-CREW]. No statement of the data behind the widths is in the record.

**Siebert 1898** [NEWBERRY]: viewer caption "Underground routes to Canada: showing the lines of travel of fugitive slaves"; compiled from reminiscences; the page calls it the first comprehensive depiction.

**The NPS handbook's current "Map Room"** [HB-MAPS] no longer draws route arrows at all. It maps point datasets: 995 people from Still's journal with radial lines to the
Philadelphia office; Gay's 1855-56 record; Boston Vigilance Committee sites; nearly 200 "slave stampedes" 1847-1865 with dot size for group size; 300+ Missouri escapes 1840-1865.

Suggested legend wording for the atlas, in the same spirit: "Arrows show general directions of flight between documented places. They are not surveyed roads. Dashed = known only from later recollections."

---

### F. Gaps and things I could not confirm

- **Not found in any source read (do not draw as documented):** New Haven; Chambersburg; Gettysburg; Wheeling; Portsmouth OH; Columbus as a stop (only Alum Creek north of it); Evansville as a stop;
  Davenport; Milton WI; Waukesha; Halifax as an antebellum terminus; Haiti as an escape destination; Eagle Pass by name.
- **Rest on Siebert or local tradition only:** New Jersey towns between Philadelphia and New York; Vermont town chains; Toledo, Painesville, Ashtabula; Erie; Oswego and other Lake Ontario ports;
  Owen Sound, Collingwood, Kingston, Montreal, St. John; the Quincy-Galesburg-Princeton-Ottawa and Cairo/Chester-Centralia lines; the Iowa town list; the Lane Trail.
- **UNCONFIRMED (memory):** 1,011 as the 1850 census figure (NPS text has 1,010); 7 November 1861 for Port Royal; 1855 for the Suspension Bridge rail deck; 1850 at Eagle Pass for the Black Seminole crossing
  (NPS text says Wild Cat entered Mexico in 1849; settlement at Nacimiento 1852).
- **Snippet only (search result, page not opened):** 1687 first arrivals at St. Augustine and the 1790 end of sanctuary; Baumgartner's 3,000-5,000; New York committee's 800 by 1840;
  Brown's 4 February 1859 crossing at Nebraska City and the Vernon County date; Second Baptist Detroit 1836; Elgin's 28 November 1849; the Illinois town sequences and the Kansas Lane Trail;
  Network to Freedom status of the Philadelphia & Columbia Railroad and of Sacramento's Hackett House.
- **Internal disagreements worth showing students:** Dawn 1841 vs 1843; Elgin 1849 vs 1850; Tubman 13 vs 15 vs "nearly 20" trips; Coffin 1,000+ vs 2,000+ vs 3,000; second New York committee 1840 vs 1845;
  Boston Vigilance Committee 1841 vs 1842; *Pearl* bound for Frenchtown NJ vs New York; handbook 1997 vs 1998; Jackson ranch and Webber ferry stated as fact by one NPS page and as family lore by another.
- **One figure I distrust and did not use:** the Canada West essay as summarised to me gave "about 12,500 Black residents" for Toronto in 1841. That is almost certainly a misreading of the city's total
  population; check the essay before using any Toronto figure.
- **Method note:** web pages were read through a fetch tool that returns a model-written digest of each page, not the raw text (except the NPS theme study and the Baram article, which I read as extracted text).
  Short quoted phrases above were reported by that digest and should be re-checked against the page before being printed in the atlas.

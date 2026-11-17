#!/usr/bin/env node
// Parchment — underground-rows.mjs: writes data/us/underground-railroad.csv from the lists below.
// The lists are the research of docs/UNDERGROUND-RAILROAD.md set down as rows: every route is a chain of gazetteer
// ids (Wikidata), every town on a route a point. Nothing here is a coordinate: run `npm run geocode -- --file
// data/us/underground-railroad.csv` afterwards to fill the gazetteer and the points' lon/lat from Wikidata.
// The names beside the ids are checked against Wikidata's own labels by tests/underground.test.mjs, so a wrong id
// cannot pass for the right town. Source keys ([HB-FONER]…) are spelled out in the doc.
//   node scripts/underground-rows.mjs

import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// id → [name printed on the map, what it is to the routes] — sea: a waypoint that keeps a sea line off the land,
// never a stop, never marked.
export const PLACES = {
  Q611879: ['Preston', 'town'], Q7416983: ['Sandtown', 'town'], Q754342: ['Camden', 'town'], Q33518: ['Dover', 'town'], Q755736: ['Smyrna', 'town'],
  Q755393: ['New Castle', 'town'], Q174224: ['Wilmington', 'town'], Q1345: ['Philadelphia', 'town'], Q60: ['New York', 'town'], Q24861: ['Albany', 'town'],
  Q128069: ['Syracuse', 'town'], Q49218: ['Rochester', 'town'], Q40435: ['Buffalo', 'town'], Q128133: ['Niagara Falls', 'town'], Q126805: ['St. Catharines', 'town'],
  Q33486: ['Hartford', 'town'], Q49158: ['Springfield', 'town'], Q600301: ['Troy', 'town'], Q817921: ['Bennington', 'town'], Q25893: ['Rutland', 'town'],
  Q1874592: ['Ferrisburgh', 'town'], Q31058: ['Burlington', 'town'], Q1787559: ['St. Albans', 'town'], Q340: ['Montreal', 'town'],
  Q49231: ['Norfolk', 'town'], Q43421: ['Richmond', 'town'], Q83813: ['Savannah', 'town'], Q49147: ['New Bedford', 'town'], Q100: ['Boston', 'town'],
  Q1640805: ['Cape Henry', 'sea'], Q2903487: ['Cape Henlopen', 'sea'], Q884674: ['Block Island', 'sea'], Q49149: ['Nantucket', 'sea'], Q49154: ['Provincetown', 'sea'],
  Q978032: ['Cape Hatteras', 'sea'], Q1028611: ['Sandy Hook', 'sea'],
  Q61: ['Washington', 'town'], Q5092: ['Baltimore', 'town'], Q821105: ['York', 'town'], Q1133892: ['Columbia', 'town'],
  Q25280: ['Harrisburg', 'town'], Q1016159: ['Williamsport', 'town'], Q934135: ['Elmira', 'town'], Q2738851: ['Watkins Glen', 'town'], Q1363104: ['Canandaigua', 'town'],
  Q1187047: ['Uniontown', 'town'], Q1342: ['Pittsburgh', 'town'], Q37320: ['Cleveland', 'town'],
  Q2526491: ['Williamstown', 'town'], Q985482: ['Marietta', 'town'], Q2669023: ['Chesterhill', 'town'], Q146811: ['Zanesville', 'town'],
  Q2666983: ['Ripley', 'town'], Q36879: ['Sardinia', 'town'], Q1762816: ['Urbana', 'town'], Q608207: ['Sandusky', 'town'], Q43196: ['Cincinnati', 'town'], Q986776: ['Lebanon', 'town'],
  Q385335: ['Amherstburg', 'town'], Q7230953: ['Port Stanley', 'town'],
  Q990883: ['Madison', 'town'], Q1762878: ['New Albany', 'town'], Q5033862: ['Canton', 'town'], Q4832149: ['Azalia', 'town'], Q3293425: ['Carthage', 'town'],
  Q1439902: ['Newport (Fountain City)', 'town'], Q2373038: ['Cassopolis', 'town'], Q12439: ['Detroit', 'town'], Q182625: ['Windsor', 'town'],
  Q38022: ['St. Louis', 'town'], Q28515: ['Springfield', 'town'], Q575750: ['Quincy', 'town'], Q782574: ['Galesburg', 'town'], Q574878: ['Princeton', 'town'],
  Q576209: ['Ottawa', 'town'], Q1297: ['Chicago', 'town'],
  Q493840: ['Lawrence', 'town'], Q41057: ['Topeka', 'town'], Q286025: ['Nebraska City', 'town'], Q2240032: ['Tabor', 'town'], Q1930350: ['Lewis', 'town'],
  Q39709: ['Des Moines', 'town'], Q1903250: ['Grinnell', 'town'], Q487977: ['Iowa City', 'town'], Q7580831: ['Springdale', 'town'], Q2066047: ['West Liberty', 'town'],
  Q2278195: ['Natchitoches', 'town'], Q970482: ['Nacogdoches', 'town'], Q975: ['San Antonio', 'town'], Q16555: ['Houston', 'town'], Q738353: ['Matamoros', 'town'], Q1856408: ['Piedras Negras', 'town'],
  Q47716: ['Charleston', 'town'], Q549331: ['Fort Mose', 'town'], Q2689037: ['Cape Florida (Key Biscayne)', 'town'], Q514070: ['Andros Island', 'town'],
};

const TEST = 'TEST ROW for the Underground Railroad layer (owner\'s request of 2026-11-17); not reviewed. Research and full citations: docs/UNDERGROUND-RAILROAD.md.';

// [id, label, waypoints, start, end, grade, certainty, source, note]
// certainty: legal = a chain of stops the NPS handbook essays or a dated case document (solid line); approximate =
// the ends are documented, the way between is schematic, or the chain rests on later recollections (dashed);
// sphere = a direction only: no source names a place on the way (dotted).
export const ROUTES = [
  ['ugrr-wilmington-philadelphia', 'Wilmington to Philadelphia (Thomas Garrett)', 'Q174224>Q1345', 1822, 1861, 'circa', 'legal',
    'Foner, "Middle Atlantic", NPS Underground Railroad Handbook (Dickinson, HB-FONER); Wikipedia, "Thomas Garrett" (WP-GARRETT)',
    'Garrett worked in Wilmington from 1822 and sent people on to the Philadelphia committee. 1861: J. Miller McKim\'s remark that the Underground Railroad was in effect over (HB-FONER); the NPS itself runs it to 1865.'],
  ['ugrr-tubman-delmarva', 'Eastern Shore of Maryland to Wilmington (Harriet Tubman\'s route)', 'Q611879>Q7416983>Q754342>Q33518>Q755736>Q755393>Q174224>Q1345', 1849, 1860, 'exact', 'legal',
    'NPS, Harriet Tubman Underground Railroad NHP, "Harriet Tubman" (NPS-TUB); Wikipedia, "Harriet Tubman", citing Larson 2004 and Clinton 2004 (WP-TUB)',
    'Poplar Neck near Preston, then Sandtown, Camden (the Brinkleys and Abraham Gibbs), past Dover and Smyrna, New Castle, Wilmington (Garrett), Philadelphia (William Still). Her own escape, autumn 1849; return trips 1850 to 1860. This is the chain of her later trips as Larson reconstructs it: the way of her first escape is not known. East New Market (Sam Green) and Willow Grove are on the chain in the source and left off the line, which is too short to show them apart.'],
  ['ugrr-philadelphia-new-york', 'Philadelphia to New York', 'Q1345>Q60', 1835, 1861, 'exact', 'legal',
    'Foner, "Middle Atlantic" (HB-FONER); NPS handbook timeline (HB-TIME)',
    '1835: David Ruggles founds the New York Committee of Vigilance. By train and ferry across New Jersey; no source read names a New Jersey town except Siebert (1898), from recollections.'],
  ['ugrr-new-york-canada', 'New York to Canada by Albany, Syracuse and Niagara', 'Q60>Q24861>Q128069>Q49218>Q40435>Q128133>Q126805', 1842, 1861, 'circa', 'legal',
    'Foner, "Middle Atlantic" (HB-FONER); Harrold, "Washington, Maryland, Virginia" (HB-HARROLD); NPS theme study, 2000 (NPS-THEME)',
    'Albany (Stephen Myers), Syracuse (Jermain Loguen), Rochester (Frederick Douglass), Buffalo, the Niagara crossing, St. Catharines. 1842: Charles Torrey\'s party reaches Albany, the earliest dated use of the road north of New York in what was read; Sydney Howard Gay\'s record of 1855 to 1856 documents Syracuse best. The Albany leg is less fully attested than the Syracuse leg.'],
  ['ugrr-new-york-springfield', 'New York into New England', 'Q60>Q33486>Q49158', 1838, 1842, 'exact', 'legal',
    'Grover, "The New England Network to Freedom", NPS handbook (HB-GROVER)',
    'James Lindsay Smith\'s journey of 1838: from Ruggles in New York by Hartford to Springfield, Massachusetts (he settled at Norwich, Connecticut, by 1842). One documented journey; many who reached New England stayed there.'],
  ['ugrr-vermont', 'Albany to Canada through Vermont', 'Q24861>Q600301>Q817921>Q25893>Q1874592>Q31058>Q1787559>Q340', 1838, 1856, 'circa', 'approximate',
    'Siebert, The Underground Railroad from Slavery to Freedom (1898), ch. V (SIEBERT-V); Grover (HB-GROVER)',
    'The town chain (Troy, Bennington, Rutland, Ferrisburgh, St. Albans) and Montreal as its end are Siebert\'s, gathered from recollections in the 1890s: dashed. Grover documents Ferrisburgh (Rowland T. Robinson, 1838), Burlington (Joshua Young) and St. Albans (people forwarded by train, 1854 and 1856), and warns that Vermont was less safe than tradition says.'],
  ['ugrr-sea-norfolk-philadelphia', 'By sea from Norfolk to Philadelphia', 'Q49231>Q1640805>Q2903487>Q174224>Q1345', 1854, 1857, 'exact', 'legal',
    'Newby-Alexander, "The Atlantic Coastal Freedom Network", NPS handbook (HB-NEWBY); Foner (HB-FONER); NPS theme study (NPS-THEME)',
    'Dated cases 1854 to 1857 (John Atkinson, 1854; Captain Fountain\'s vessel, which often called at Wilmington, 1855 to 1856). The ports are documented; the line at sea is schematic, run by Cape Henry and Cape Henlopen to keep it off the land.'],
  ['ugrr-sea-richmond-norfolk', 'By water from Richmond', 'Q43421>Q49231', 1855, 1857, 'circa', 'approximate',
    'Newby-Alexander (HB-NEWBY)',
    'Captain Albert Fountain\'s packet took people aboard at Richmond as well as Norfolk. The line stands for the James River; it does not follow it.'],
  ['ugrr-sea-norfolk-new-bedford', 'By sea from Norfolk to New Bedford', 'Q49231>Q1640805>Q884674>Q49147', 1842, 1857, 'circa', 'legal',
    'Newby-Alexander (HB-NEWBY); Grover (HB-GROVER); NPS theme study (NPS-THEME)',
    'Vessels from Norfolk and Portsmouth, Virginia, for New Bedford and Boston. The ports are documented; the line at sea is schematic (by Cape Henry and Block Island).'],
  ['ugrr-sea-norfolk-boston', 'By sea from Norfolk to Boston', 'Q49231>Q1640805>Q884674>Q49149>Q49154>Q100', 1842, 1857, 'exact', 'legal',
    'NPS theme study (NPS-THEME); Newby-Alexander (HB-NEWBY)',
    'George Latimer reached Boston from Norfolk in 1842. The line at sea is schematic (by Cape Henry, Block Island, Nantucket and Provincetown, round Cape Cod).'],
  ['ugrr-sea-savannah-new-york', 'By sea from Savannah to New York', 'Q83813>Q978032>Q1028611>Q60', 1834, 1834, 'exact', 'legal',
    'Grover (HB-GROVER)',
    'Moses Roper, by schooner, 1834: one documented voyage. Bordewich (NPS handbook) says the few who escaped the Deep South mostly hid on ships. The line at sea is schematic (by Cape Hatteras and Sandy Hook).'],
  ['ugrr-washington-baltimore', 'Washington and Baltimore to Philadelphia', 'Q61>Q5092>Q174224>Q1345', 1842, 1857, 'exact', 'legal',
    'Harrold, "Escaping in and around Washington, D.C., Maryland, Virginia", NPS handbook (HB-HARROLD)',
    'Thomas Smallwood and Charles Torrey\'s network, 1842 to 1846, by Baltimore (Jacob Gibbs) and Wilmington (Garrett backed the wagon trip of 1843); Jacob Bigelow with William Still, 1854 to 1857. The source names no stop between Washington and the Pennsylvania line, and none is drawn.'],
  ['ugrr-columbia', 'Across the Susquehanna at Columbia', 'Q821105>Q1133892>Q1345', 1838, 1858, 'circa', 'approximate',
    'NPS theme study (NPS-THEME); Pennsylvania State Historic Preservation Office, "The Underground Railroad: Columbia, Lancaster County" (PA-SHPO)',
    'York (William C. Goodridge, "reputed"), over the Columbia-Wrightsville bridge (1834), and from Columbia in Stephen Smith and William Whipper\'s rail cars to Philadelphia, from 1838 to the late 1850s. It rests largely on Whipper\'s own letter of 1871; the NPS calls Columbia a site of legend.'],
  ['ugrr-elmira', 'Philadelphia to Rochester by Harrisburg and Elmira', 'Q1345>Q25280>Q1016159>Q934135>Q2738851>Q1363104>Q49218', 1851, 1860, 'circa', 'approximate',
    'NPS theme study (NPS-THEME); Wikipedia, "John W. Jones (ex-slave)" (WP-JONES)',
    'Harrisburg, Williamsport, Elmira (John W. Jones), Watkins Glen, Canandaigua, Rochester: the NPS gives the chain as "reputed to have been" and does not date it. Wikipedia has Jones an active agent from 1851 (its lead says from his arrival in 1844) and, after the Williamsport to Elmira track was finished in 1854, sending people on in a baggage car of the Northern Central Railway; it cites no source for that section.'],
  ['ugrr-pittsburgh', 'The Monongahela valley to Pittsburgh and Lake Erie', 'Q1187047>Q1342>Q37320', 1841, 1847, 'circa', 'approximate',
    'Churchill, "The Underground Railroad in the Ohio River Valley", NPS handbook (HB-CHURCHILL)',
    'Uniontown and Pittsburgh are documented (Black crowds rescued people at Pittsburgh four times, 1841 to 1847); from Pittsburgh the source says only "northwest to Cleveland and the Western Reserve".'],
  ['ugrr-marietta', 'Across the Ohio at Marietta', 'Q2526491>Q985482>Q2669023>Q146811', 1837, 1847, 'exact', 'legal',
    'Churchill (HB-CHURCHILL)',
    'From the Virginia shore at Williamstown to Marietta (David Putnam Jr.), Chesterhill and Zanesville. Dated cases 1837 and 1846 to 1847.'],
  ['ugrr-zanesville-reserve', 'Zanesville to the Western Reserve', 'Q146811>Q37320', 1837, 1847, 'circa', 'approximate',
    'Churchill (HB-CHURCHILL)',
    'The source says Zanesville was "linked by canal to the Western Reserve" and names no place on the way.'],
  ['ugrr-ripley', 'Across the Ohio at Ripley', 'Q2666983>Q36879', 1822, 1861, 'exact', 'legal',
    'Churchill (HB-CHURCHILL); Wikipedia, "John Rankin (abolitionist)" (WP-RANKIN)',
    'Ripley (John Rankin from 1822, John Parker) to Sardinia. The story of Rankin\'s lantern appears only in twentieth-century sources.'],
  ['ugrr-ripley-north', 'Sardinia to Lake Erie', 'Q36879>Q1762816>Q608207', 1830, 1861, 'circa', 'approximate',
    'Churchill (HB-CHURCHILL)',
    'Northwest to join the Cincinnati road in the upper Miami valley, then by the Alum Creek Quaker settlement north of Columbus to Sandusky. The source dates these networks to "the late 1820s and early 1830s" and names a belt of settlements, not a list of towns: Urbana stands for the belt.'],
  ['ugrr-cincinnati-north', 'Cincinnati to Lake Erie', 'Q43196>Q986776>Q1762816>Q608207', 1830, 1861, 'circa', 'approximate',
    'Churchill (HB-CHURCHILL)',
    'By farmers\' wagons through the Quaker and free Black settlements between Lebanon and Urbana, then by Alum Creek to Sandusky and the Western Reserve. In use from about 1830, dense by about 1840; Levi Coffin moved to Cincinnati in 1847.'],
  ['ugrr-lake-erie-sandusky', 'Across Lake Erie from Sandusky', 'Q608207>Q385335', 1834, 1861, 'circa', 'approximate',
    'Siebert 1898, ch. V (SIEBERT-V); NPS theme study (NPS-THEME)',
    'Siebert names Sandusky among the lake ports and Amherstburg among the Canadian landings, from recollections. 1834: William Wells Brown begins work on the lake steamers, where he aided people waiting at Cleveland, Detroit and Buffalo.'],
  ['ugrr-lake-erie-cleveland', 'Across Lake Erie from Cleveland', 'Q37320>Q7230953', 1834, 1861, 'circa', 'approximate',
    'Siebert 1898, ch. V (SIEBERT-V); NPS theme study (NPS-THEME)',
    'Siebert names Cleveland among the lake ports and Port Stanley among the Canadian landings, from recollections; which port sent to which landing is not recorded.'],
  ['ugrr-madison', 'Across the Ohio at Madison', 'Q990883>Q1439902', 1826, 1847, 'circa', 'approximate',
    'Churchill (HB-CHURCHILL); Wikipedia, "Levi Coffin" (WP-COFFIN)',
    'Madison (George DeBaptiste, Elijah Anderson) to Levi Coffin at Newport, now Fountain City, where he lived from 1826 to 1847. The source gives the way between by county only.'],
  ['ugrr-new-albany', 'Across the Ohio at New Albany', 'Q1762878>Q5033862>Q4832149>Q3293425>Q1439902', 1826, 1847, 'circa', 'legal',
    'Churchill (HB-CHURCHILL); Wikipedia, "Levi Coffin" (WP-COFFIN)',
    'New Albany and Jeffersonville, Canton, Farmington, Azalia, Carthage, Newport: the stops are the source\'s. The years are Coffin\'s at Newport; the source does not date this road itself.'],
  ['ugrr-cincinnati-newport', 'Cincinnati to Newport', 'Q43196>Q1439902', 1826, 1847, 'circa', 'approximate',
    'Wikipedia, "Levi Coffin" (WP-COFFIN)',
    'Three roads met at Coffin\'s house: from Madison, from New Albany and from Cincinnati.'],
  ['ugrr-newport-detroit', 'Newport to Michigan', 'Q1439902>Q2373038>Q12439', 1826, 1847, 'circa', 'approximate',
    'Churchill (HB-CHURCHILL)',
    'From Newport to Detroit, or to the free Black settlements of Cass County, Michigan (Cassopolis is its county seat and stands for them).'],
  ['ugrr-detroit-river', 'Across the Detroit River', 'Q12439>Q182625', 1833, 1861, 'exact', 'legal',
    'Barker, "Reconsidering the Underground Railroad in Canada West", NPS handbook (HB-BARKER); Johnson, "Escaping on the Northwestern Frontier" (HB-JOHNSON); Parks Canada, "Underground Railroad National Historic Event" (PC-UGRR)',
    '1833: the Blackburns are taken across to Windsor, the earliest dated crossing in what was read. John Brown\'s party crossed on 12 March 1859.'],
  ['ugrr-detroit-amherstburg', 'Detroit to Amherstburg', 'Q12439>Q385335', 1850, 1861, 'circa', 'approximate',
    'Wikipedia, "Underground Railroad" (WP-UGRR); Siebert 1898 (SIEBERT-V)',
    'Amherstburg (Fort Malden) is called the chief place of entry after 1850; the NPS handbook\'s essay on Canada West does not name it.'],
  ['ugrr-st-louis-springfield', 'St. Louis to Springfield, Illinois', 'Q38022>Q28515', 1850, 1850, 'exact', 'legal',
    'Johnson (HB-JOHNSON)',
    'The "stampede" of about a dozen people from St. Louis, January 1850: Jameson Jenkins at Springfield gave them their first help. The source does not say which way they went on, so the line ends there.'],
  ['ugrr-quincy-chicago', 'Quincy to Chicago', 'Q575750>Q782574>Q574878>Q576209>Q1297', 1842, 1859, 'circa', 'approximate',
    'Johnson (HB-JOHNSON); NPS handbook timeline (HB-TIME); Illinois Office of Tourism, "Illinois Underground Railroad" (ENJOY-IL); Siebert 1898 (SIEBERT-V)',
    'Thin. The NPS handbook attests Knox County (Galesburg; 1842), Chicago (1844) and Ottawa (1859); Quincy (Dr. Richard Eells) and Princeton (Owen Lovejoy) are from the state\'s tourism page; the order of the towns is local tradition descended from Siebert\'s informants.'],
  ['ugrr-chicago-detroit', 'Chicago to Detroit', 'Q1297>Q12439', 1843, 1859, 'exact', 'approximate',
    'Johnson (HB-JOHNSON); PBS American Experience, "John Brown\'s Missouri raid" (PBS-BROWN)',
    'Caroline Quarlls crossed Illinois, Indiana and Michigan to Detroit in 1843; John Brown\'s party went by rail in March 1859. Siebert also has lake vessels from Chicago. The ends are documented, the way between is not.'],
  ['ugrr-kansas', 'Kansas to Iowa', 'Q493840>Q41057>Q286025>Q2240032', 1857, 1859, 'circa', 'approximate',
    'Mount Mitchell Prairie Guards, "The Lane Trail" (LANE); Johnson (HB-JOHNSON); PBS (PBS-BROWN)',
    'Thin for Kansas and Nebraska: a local heritage page has freedom seekers on a branch of the Lane Trail from Lawrence, "escalated in 1857"; John Brown\'s party crossed Kansas from 20 January 1859 and the Missouri River at Nebraska City to reach Tabor.'],
  ['ugrr-iowa', 'Across Iowa to Chicago (John Brown, 1859)', 'Q2240032>Q1930350>Q39709>Q1903250>Q487977>Q7580831>Q2066047>Q1297', 1859, 1859, 'exact', 'legal',
    'PBS American Experience, "John Brown\'s Missouri raid" (PBS-BROWN); "John Brown and the Underground Railroad", Stories of Iowa (IOWA-SOI)',
    'Tabor (first week of February 1859), Des Moines, Grinnell (25 February), Iowa City, Springdale, West Liberty (9 March, into a boxcar), Chicago. Lewis is from the Iowa school reader\'s list of towns, not from a dated stop.'],
  ['ugrr-louisiana-texas', 'Louisiana to Mexican Texas', 'Q2278195>Q970482>Q975', 1822, 1836, 'exact', 'sphere',
    'Baumgartner, "Freedom Seekers on the Southwestern Frontier", NPS handbook (HB-BAUM); Wikipedia, "Underground Railroad" (WP-UGRR)',
    'A direction, not a road. Nearly a hundred people left western Louisiana in the summer of 1822, across the Sabine (then the border) for Nacogdoches and San Antonio de Béxar. Natchitoches as the line\'s start is the editor\'s choice (WP-UGRR mentions a road from there); the escapes the source dates were from parishes farther south. Ends in 1836, when Texas left Mexico.'],
  ['ugrr-texas-matamoros', 'Texas to Matamoros', 'Q16555>Q738353', 1837, 1865, 'circa', 'sphere',
    'NPS (Audain), "Freedom Seekers in the Antebellum Texas-Mexico Borderlands" (NPS-MEX); Baumgartner (HB-BAUM)',
    'A direction, not a road: across the Nueces Strip and the Rio Grande to Matamoros, where people found work. 1837: Mexico\'s Congress abolishes slavery (5 April). Baumgartner: no organized network, "only occasional allies". Houston as the line\'s start is the editor\'s choice (one dated case, 1858, began near it).'],
  ['ugrr-texas-piedras-negras', 'Texas to Piedras Negras', 'Q16555>Q975>Q1856408', 1850, 1865, 'circa', 'sphere',
    'NPS (Audain) (NPS-MEX); Baumgartner (HB-BAUM)',
    'A direction, not a road: Piedras Negras, Coahuila, was "frequently" reached in the early 1850s. The way across Texas is not recorded; Houston and San Antonio are the editor\'s choices.'],
  ['ugrr-carolina-florida', 'Carolina to Spanish Florida', 'Q47716>Q549331', 1687, 1763, 'circa', 'sphere',
    'NPS, "Fort Mose" (NPS-MOSE); Florida Museum, "Fort Mose" (FLMNH); Wikipedia, "Fort Mose" (WP-MOSE)',
    'A direction, not a road: no source names a place between Carolina and St. Augustine. First arrivals by canoe in 1687 (Landers, by a search result only; Wikipedia has 1689); Charles II\'s edict of 1693; Fort Mose founded 1738, evacuated to Cuba in 1763. Charleston stands for Carolina.'],
  ['ugrr-cape-florida', 'Cape Florida to the Bahamas', 'Q2689037>Q514070', 1821, 1825, 'circa', 'approximate',
    'Wikipedia, "Saltwater Railroad" (WP-SALT); Baram, "Trail toward liberty", Journal of Florida Studies (BARAM)',
    'From Cape Florida on Key Biscayne across the Gulf Stream to Andros Island (the Red Bays settlement): about 300 Black Seminoles in the early 1820s. The crossing is documented; where on Andros they landed is not in what was read. Sources disagree on how long it ran (to the mid-1820s; "1821-1837").'],
];

// Towns that get a mark: every route waypoint that is a town. A town's years are the earliest start and the latest
// end of the routes through it; its source is theirs.
const esc = (s) => (/[",\n\r]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
const HEAD = 'id,course,unit,topic,kc,theme,tracker,kind,where,lon,lat,start,end,grade,value,certainty,label,source,qc_status,qc_by,qc_note';

export function buildRows() {
  const rows = [];
  const towns = new Map();
  for (const [id, label, where, start, end, grade, certainty, source, note] of ROUTES) {
    const ids = where.split('>');
    for (const q of ids) if (!PLACES[q]) throw new Error(`${id}: ${q} is not in PLACES`);
    rows.push([id, 'apush', 5, '', '', 'MIG', 'routes', 'arrow', where, '', '', start, end, grade, 'escape', certainty, label, source, '', '', `${TEST} ${note} Places, in order: ${ids.map((q) => PLACES[q][0]).join(', ')}.`]);
    for (const q of ids) {
      if (PLACES[q][1] !== 'town') continue;
      const t = towns.get(q) ?? { start, end, routes: [], sources: new Set(), certain: false };
      t.start = Math.min(t.start, start); t.end = Math.max(t.end, end); t.routes.push(id); t.sources.add(source); t.certain ||= certainty === 'legal';
      towns.set(q, t);
    }
  }
  for (const [q, t] of towns) {
    const slug = PLACES[q][0].toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    rows.push([`ugrr-town-${slug}-${q.toLowerCase()}`, 'apush', 5, '', '', 'MIG', 'routes', 'point', q, '', '', t.start, t.end, 'circa', 'station', t.certain ? 'legal' : 'approximate', PLACES[q][0],
      [...t.sources].join('; '), '', '', `${TEST} A place on ${t.routes.length > 1 ? 'the routes' : 'the route'} ${t.routes.join(', ')}: what the sources say of it is in ${t.routes.length > 1 ? 'their notes' : 'its note'}. Its years are theirs.`]);
  }
  return rows;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rows = buildRows();
  writeFileSync(join(ROOT, 'data', 'us', 'underground-railroad.csv'), [HEAD, ...rows.map((r) => r.map(esc).join(','))].join('\n') + '\n');
  console.log(`wrote data/us/underground-railroad.csv: ${ROUTES.length} routes, ${rows.length - ROUTES.length} towns`);
}

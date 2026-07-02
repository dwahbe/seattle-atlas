import { NEIGHBORHOODS } from './neighborhoods';

export interface NeighborhoodHighlight {
  label: string;
  value: string;
}

export interface NeighborhoodPage {
  slug: string;
  /** Must match a `NEIGHBORHOODS` entry — bounds are joined by name. */
  name: string;
  /** Meta description, ~150 chars. */
  description: string;
  paragraphs: string[];
  highlights: NeighborhoodHighlight[];
}

export const NEIGHBORHOOD_PAGES: NeighborhoodPage[] = [
  {
    slug: 'capitol-hill',
    name: 'Capitol Hill',
    description:
      'Capitol Hill zoning on an interactive map: lowrise and midrise apartment blocks, the Broadway and Pike/Pine mixed-use corridors, and the 2026 rule changes.',
    paragraphs: [
      'Most of Capitol Hill is zoned Lowrise (LR1–LR3) and Midrise (MR) — small apartment buildings, townhomes, and midrise blocks — with Neighborhood Commercial (NC3) zoning along Broadway, the Pike/Pine corridor, and 15th Ave E, where apartments sit above storefronts. North of Volunteer Park the fabric shifts toward Neighborhood Residential.',
      'Capitol Hill Station puts much of the neighborhood within a short walk of Link light rail, and the First Hill Streetcar terminates at Broadway and Denny. Under the 2026 Neighborhood Residential reform, even the quietest blocks now allow multiplexes of up to six homes per lot.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'LR1–LR3 and MR, with NC3 corridors' },
      { label: 'Commercial Corridors', value: 'Broadway, Pike/Pine, 15th Ave E' },
      { label: 'Transit', value: 'Capitol Hill Link Station, First Hill Streetcar' },
    ],
  },
  {
    slug: 'ballard',
    name: 'Ballard',
    description:
      'Ballard zoning on an interactive map: the Market Street commercial core, lowrise apartment blocks, the maritime-industrial waterfront, and the 2026 rule changes.',
    paragraphs: [
      'The blocks around NW Market St and historic Ballard Ave NW carry Neighborhood Commercial (NC3) zoning and have filled in with mixed-use apartments over the past two decades, surrounded by Lowrise multifamily. Along Salmon Bay, Maritime Manufacturing/Logistics (MML) zoning protects the fishing fleet, boatyards, and marine suppliers, while the streets north toward Sunset Hill and Loyal Heights are Neighborhood Residential.',
      'RapidRide D connects Ballard to downtown today, and the planned Ballard Link Extension would add a light rail station near Market St. Under the 2026 reforms, Ballard’s NR blocks now allow up to six homes per lot.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NC3 core, LR surrounds, MML waterfront, NR north' },
      { label: 'Commercial Corridors', value: 'NW Market St, Ballard Ave NW, 15th Ave NW' },
      { label: 'Transit', value: 'RapidRide D, planned Ballard Link Extension' },
    ],
  },
  {
    slug: 'fremont',
    name: 'Fremont',
    description:
      'Fremont zoning on an interactive map: the Fremont Ave commercial center, canal-side jobs district, hillside residential blocks, and the 2026 rule changes.',
    paragraphs: [
      'Fremont’s commercial heart sits where Fremont Ave N meets N 36th St, zoned Neighborhood Commercial with apartments above storefronts. The flat blocks along the Ship Canal — once industrial — now host offices and studios, while Lowrise zoning climbs the slope and gives way to Neighborhood Residential toward upper Fremont.',
      'The Burke-Gilman Trail runs along the canal, frequent buses cross the Fremont Bridge, and RapidRide E runs on Aurora Ave N at the neighborhood’s eastern edge. The 2026 reforms legalized multiplexes of up to six homes across Fremont’s NR blocks.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NC center, LR slopes, NR above' },
      { label: 'Commercial Corridors', value: 'Fremont Ave N, N 36th St, Stone Way N' },
      { label: 'Transit', value: 'Fremont Bridge bus routes, RapidRide E (Aurora)' },
    ],
  },
  {
    slug: 'queen-anne',
    name: 'Queen Anne',
    description:
      'Queen Anne zoning on an interactive map: the residential hilltop, Uptown’s mixed-use blocks by Seattle Center, and what the 2026 rules allow.',
    paragraphs: [
      'The hilltop is largely Neighborhood Residential with a compact Neighborhood Commercial node along Queen Anne Ave N, while Uptown — at the hill’s southern base around Seattle Center and Climate Pledge Arena — is zoned Seattle Mixed for midrise housing and offices. Lowrise zoning wraps the hill’s lower slopes.',
      'Routes 2 and 13 climb the hill from downtown, and RapidRide D runs along the neighborhood’s western edge through Interbay. Under the 2026 rules, hilltop blocks that long allowed only one house now permit up to six homes per lot.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NR hilltop, SM in Uptown, LR slopes' },
      { label: 'Commercial Corridors', value: 'Queen Anne Ave N, Mercer St (Uptown)' },
      { label: 'Transit', value: 'Routes 2 and 13, RapidRide D (Interbay)' },
    ],
  },
  {
    slug: 'wallingford',
    name: 'Wallingford',
    description:
      'Wallingford zoning on an interactive map: streetcar-era residential blocks, the N 45th St commercial strip, Gas Works Park, and the 2026 rule changes.',
    paragraphs: [
      'Most of Wallingford is Neighborhood Residential and Lowrise, with Neighborhood Commercial (NC3) zoning along N 45th St and Stone Way N. Gas Works Park anchors the neighborhood’s Lake Union shoreline.',
      'Route 44 runs along N 45th St between Ballard and the U District Link station, and the Burke-Gilman Trail follows the lake. The 2026 reforms made sixplexes legal across the NR blocks of one of the city’s most-debated residential neighborhoods.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NR and LR, with NC3 on N 45th St' },
      { label: 'Commercial Corridors', value: 'N 45th St, Stone Way N' },
      { label: 'Transit', value: 'Route 44, Burke-Gilman Trail' },
    ],
  },
  {
    slug: 'university-district',
    name: 'University District',
    description:
      'University District zoning on an interactive map: the high-rise core around the Ave, the UW campus overlay, U District Station, and the 2026 rules.',
    paragraphs: [
      'A 2017 rezone brought Seattle Mixed zoning that allows high-rise towers to the blocks around University Way NE (“the Ave”) and Brooklyn Ave NE, and several have already been built. The UW campus itself is governed by a Major Institution Overlay (MIO), with Lowrise and Midrise residential filling out the surrounding streets.',
      'U District Station, opened in 2021, puts the neighborhood minutes from downtown by Link, with Route 44 and frequent buses feeding it. The district is one of Seattle’s designated urban centers, planned for continued growth.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'SM high-rise core, MIO (UW campus), LR/MR' },
      { label: 'Commercial Corridors', value: 'University Way NE, NE 45th St, Roosevelt Way NE' },
      { label: 'Transit', value: 'U District Link Station, Route 44' },
    ],
  },
  {
    slug: 'south-lake-union',
    name: 'South Lake Union',
    description:
      'South Lake Union zoning on an interactive map: the Seattle Mixed zones behind the tech and biotech district, plus streetcar and waterfront context.',
    paragraphs: [
      'Nearly all of South Lake Union is zoned Seattle Mixed (SM-SLU), which permits the office, lab, and residential towers that replaced the neighborhood’s low-slung warehouses. Lake Union Park and MOHAI anchor the waterfront at the north end.',
      'The South Lake Union Streetcar and frequent buses connect the district to downtown, and the blocks south of Denny Way blend into the Denny Triangle’s downtown zoning. Few Seattle neighborhoods show the link between rezoning and redevelopment this directly.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'SM-SLU mixed-use' },
      { label: 'Commercial Corridors', value: 'Westlake Ave N, Denny Way, Mercer St' },
      { label: 'Transit', value: 'South Lake Union Streetcar, frequent buses' },
    ],
  },
  {
    slug: 'downtown',
    name: 'Downtown',
    description:
      'Downtown Seattle zoning on an interactive map: the DOC office cores, retail core, residential towers, and Pike Place Market’s protective zoning.',
    paragraphs: [
      'Downtown Office Core zones (DOC1, DOC2) allow Seattle’s tallest buildings, ringed by Downtown Mixed Commercial (DMC) and Downtown Mixed Residential (DMR) zones and the Downtown Retail Core (DRC). Pike Place Market has its own protective zoning (PMM) that keeps the market’s scale and character intact.',
      'Link stations thread the downtown transit tunnel, buses converge from across the region, and ferries dock at Colman Dock. Unlike most of the city, downtown zones generally regulate height and floor area rather than unit counts — there is no residential density limit in much of the core.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'DOC1/DOC2, DMC, DMR, DRC, PMM' },
      { label: 'Commercial Corridors', value: '3rd Ave, Pike/Pine, 1st Ave' },
      { label: 'Transit', value: 'Downtown Link stations, regional bus hub, ferries' },
    ],
  },
  {
    slug: 'west-seattle',
    name: 'West Seattle',
    description:
      'West Seattle zoning on an interactive map: the Admiral, Alaska, and Morgan junctions, residential peninsula blocks, and planned light rail stations.',
    paragraphs: [
      'Most of West Seattle is Neighborhood Residential, with Neighborhood Commercial nodes at the Admiral, Alaska, and Morgan junctions along California Ave SW. The Alaska Junction is the largest, where mixed-use apartment blocks have grown around the commercial core.',
      'RapidRide C and H connect the peninsula to downtown, and the West Seattle Link Extension is planned to add stations at Delridge, Avalon, and the Alaska Junction — with station-area rezoning part of the city’s ongoing 2026 planning work. Lincoln Park and Alki Beach frame the peninsula’s shoreline.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NR peninsula, NC3 at the junctions' },
      { label: 'Commercial Corridors', value: 'California Ave SW, SW Alaska St' },
      { label: 'Transit', value: 'RapidRide C and H, planned Link stations' },
    ],
  },
  {
    slug: 'beacon-hill',
    name: 'Beacon Hill',
    description:
      'Beacon Hill zoning on an interactive map: residential blocks, the Beacon Ave commercial spine, Jefferson Park, and light rail station-area zoning.',
    paragraphs: [
      'The hill is predominantly Neighborhood Residential, with Lowrise and Neighborhood Commercial zoning concentrated along Beacon Ave S, especially around the light rail station at the north end. Jefferson Park’s golf course and playfields take up a large piece of the hill’s center.',
      'Beacon Hill Station — the deepest in the Link system — connects the neighborhood to downtown in minutes, and the blocks around it have seen steady mixed-use growth. The 2026 reforms allow multiplexes of up to six homes across the hill’s NR blocks.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NR, with LR and NC along Beacon Ave S' },
      { label: 'Commercial Corridors', value: 'Beacon Ave S, 15th Ave S' },
      { label: 'Transit', value: 'Beacon Hill Link Station, Route 36' },
    ],
  },
  {
    slug: 'columbia-city',
    name: 'Columbia City',
    description:
      'Columbia City zoning on an interactive map: the landmark-protected business district on Rainier Ave, light-rail growth on MLK, and the 2026 rules.',
    paragraphs: [
      'Columbia City’s historic business district along Rainier Ave S is a designated city landmark district zoned Neighborhood Commercial, with Lowrise apartments around it. Toward Martin Luther King Jr Way S, mixed-use buildings have grown up around the light rail line.',
      'Columbia City Station ties the neighborhood into the Link system, and the 2026 Neighborhood Residential reform opened the surrounding blocks to multiplexes of up to six homes. Genesee Park and the Rainier Playfield bracket the neighborhood’s edges.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NC historic core, LR surrounds, NR beyond' },
      { label: 'Commercial Corridors', value: 'Rainier Ave S, MLK Jr Way S' },
      { label: 'Transit', value: 'Columbia City Link Station, Route 7' },
    ],
  },
  {
    slug: 'greenwood',
    name: 'Greenwood',
    description:
      'Greenwood zoning on an interactive map: the Greenwood Ave and N 85th St commercial crossroads, surrounding residential blocks, and the 2026 rules.',
    paragraphs: [
      'Neighborhood Commercial (NC3) zoning lines Greenwood Ave N around the N 85th St crossroads, with Lowrise apartments nearby and Neighborhood Residential across most of the rest of the neighborhood.',
      'Route 5 runs the length of Greenwood Ave N and RapidRide E runs on Aurora Ave N at the neighborhood’s eastern edge. The 2026 reforms allow up to six homes per lot across Greenwood’s NR blocks — a substantial change for a neighborhood that was mostly zoned for single houses.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'NR, with NC3 at the crossroads' },
      { label: 'Commercial Corridors', value: 'Greenwood Ave N, N 85th St' },
      { label: 'Transit', value: 'Route 5, RapidRide E (Aurora)' },
    ],
  },
  {
    slug: 'first-hill',
    name: 'First Hill',
    description:
      'First Hill zoning on an interactive map: the Major Institution Overlays around its hospitals, highrise apartment towers, and the First Hill Streetcar.',
    paragraphs: [
      'First Hill — long nicknamed “Pill Hill” — is anchored by three major medical institutions: Swedish, Virginia Mason, and Harborview at its northern edge. Each grows under a Major Institution Overlay (Seattle Municipal Code Chapter 23.69) that governs how its campus can expand. Between the hospitals, the base zoning is Multifamily Highrise (HR) — one of the few places outside downtown where residential towers are allowed — with Midrise and Neighborhood Commercial filling in along the edges.',
      'The First Hill Streetcar runs through the neighborhood, built as Sound Transit’s substitute after a planned Link station here was dropped over the cost and risk of mining one so deep; it links Capitol Hill to Pioneer Square and the Chinatown-International District. In the One Seattle Plan, First Hill is grouped with Capitol Hill as a single designated regional center planned for continued density.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'Multifamily Highrise (HR), with Major Institution Overlays' },
      { label: 'Major Institutions', value: 'Swedish, Virginia Mason, Harborview' },
      { label: 'Transit', value: 'First Hill Streetcar, frequent buses' },
    ],
  },
  {
    slug: 'pioneer-square',
    name: 'Pioneer Square',
    description:
      'Pioneer Square zoning on an interactive map: the Pioneer Square Mixed zone, the city’s oldest preservation district, and its landmark brick blocks.',
    paragraphs: [
      'Pioneer Square is zoned Pioneer Square Mixed (PSM), a downtown designation written specifically for the neighborhood’s 19th-century brick-and-stone warehouses and the shops, galleries, offices, and housing inside them. The whole district sits within the Pioneer Square Preservation District — Seattle’s first local historic district, established in 1970 — so changes to buildings are reviewed to protect the area’s Richardsonian Romanesque character.',
      'Pioneer Square Station puts Link light rail (the 1 and 2 Lines) under the neighborhood, with King Street Station next door serving Amtrak and Sounder trains and the stadiums and ferry terminal a short walk south. Unlike Seattle’s residential neighborhoods, the rules here govern preservation and scale rather than how many homes a lot may hold.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'Pioneer Square Mixed (PSM)' },
      { label: 'Historic District', value: 'Pioneer Square Preservation District (1970)' },
      { label: 'Transit', value: 'Pioneer Square Link Station, King Street Station' },
    ],
  },
  {
    slug: 'chinatown-international-district',
    name: 'Chinatown-International District',
    description:
      'Chinatown-International District zoning on an interactive map: International District Mixed zones, the historic special-review district, and light rail.',
    paragraphs: [
      'The Chinatown-International District is zoned International District Mixed (IDM) and International District Residential (IDR) — downtown designations meant to keep ground-floor shops, community spaces, and housing layered together. Its three historic cores — Chinatown, Japantown (Nihonmachi), and Little Saigon — all sit within the International Special Review District, a preservation overlay established in 1973 that reviews new development to protect the neighborhood’s scale and character.',
      'The International District/Chinatown Link Station (the 1 and 2 Lines) and the First Hill Streetcar both stop at 5th Ave S and S Jackson St, with King Street Station and a dense web of bus routes alongside. The neighborhood remains at the center of debate over how nearby transit and downtown growth should — or shouldn’t — reshape one of Seattle’s most historically significant communities.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'International District Mixed (IDM) and Residential (IDR)' },
      { label: 'Historic District', value: 'International Special Review District (1973)' },
      { label: 'Transit', value: 'International District/Chinatown Link Station, Streetcar' },
    ],
  },
  {
    slug: 'belltown',
    name: 'Belltown',
    description:
      'Belltown zoning on an interactive map: the Downtown Mixed Residential highrise towers, frequent buses and the monorail, and waterfront edge.',
    paragraphs: [
      'Belltown is zoned mostly Downtown Mixed Residential (DMR), the downtown designation that emphasizes housing — which is why one of Seattle’s densest neighborhoods is a wall of residential highrises rather than office towers, with Downtown Mixed Commercial (DMC) along its eastern and southern edges. As across the rest of downtown, the rules regulate height and floor area rather than capping the number of homes.',
      'Belltown has no light rail station of its own, but it is well served by buses — including RapidRide lines on the 3rd Ave transit spine — and the Seattle Center Monorail crosses it on the way to Westlake Station, the busiest stop in the Link system, about a ten-minute walk away. The neighborhood runs from the edge of the downtown retail core down to the Elliott Bay waterfront.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'Downtown Mixed Residential (DMR), DMC at the edges' },
      { label: 'Commercial Corridors', value: '1st and 2nd Aves, Bell St' },
      { label: 'Transit', value: 'RapidRide and buses on 3rd Ave, Monorail, nearby Westlake Link' },
    ],
  },
  {
    slug: 'georgetown',
    name: 'Georgetown',
    description:
      'Georgetown zoning on an interactive map: industrial Maritime and Urban Industrial zones, the maker and arts district, and the Duwamish jobs core.',
    paragraphs: [
      'Georgetown is one of Seattle’s few predominantly industrial neighborhoods, sitting inside the Greater Duwamish Manufacturing/Industrial Center. The city’s 2023 Industrial and Maritime Strategy replaced the older industrial zones here with Maritime Manufacturing/Logistics (MML) and Urban Industrial (UI) — the latter written explicitly for the light-industry, makers, and creative-arts uses that fill Georgetown’s historic brickwork and the old Rainier Brewery.',
      'A commercial strip along Airport Way S — bars, galleries, and an artist live-work tradition dating to the 1980s — gives Georgetown a neighborhood center inside the jobs district. Metro routes (including the 124 and 131/132) connect it to downtown and to Link light rail at Tukwila; there is no light rail in Georgetown itself.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'Maritime Manufacturing/Logistics (MML) and Urban Industrial (UI)' },
      { label: 'Industrial Center', value: 'Greater Duwamish Manufacturing/Industrial Center' },
      { label: 'Transit', value: 'Metro routes 124 and 131/132; Link at Tukwila' },
    ],
  },
  {
    slug: 'northgate',
    name: 'Northgate',
    description:
      'Northgate zoning on an interactive map: the regional growth center around its light rail station, the redeveloped mall, and surrounding homes.',
    paragraphs: [
      'Northgate is a designated regional growth center built around its light rail station and bus hub. The blocks near the station carry mixed-use commercial and midrise zoning, stepping down to Lowrise and Neighborhood Residential across the surrounding streets. The former Northgate Mall — one of the country’s first — is being redeveloped into a mixed-use district, with the Kraken Community Iceplex, the NHL team’s practice facility, already open on the site.',
      'Northgate Station opened in October 2021 as part of the Northgate Link Extension, connecting the neighborhood to downtown and the University District in minutes, with a Metro bus hub feeding it. A Northgate regional-center plan is in progress to guide further growth and station-area rezoning.',
    ],
    highlights: [
      { label: 'Predominant Zoning', value: 'Mixed-use and midrise near the station, NR beyond' },
      { label: 'Designation', value: 'Regional Growth Center' },
      { label: 'Transit', value: 'Northgate Link Station, Metro bus hub' },
    ],
  },
];

export function getNeighborhoodPage(slug: string): NeighborhoodPage | undefined {
  return NEIGHBORHOOD_PAGES.find((page) => page.slug === slug);
}

export function getNeighborhoodBounds(
  page: NeighborhoodPage
): [number, number, number, number] | null {
  return NEIGHBORHOODS.find((n) => n.name === page.name)?.bounds ?? null;
}

// 1° of latitude spans ~1.48× the screen distance of 1° of longitude at
// Seattle's latitude (1 / cos 47.6°).
const LAT_LNG_SCREEN_RATIO = 1.48;

/** Deep link into the map, centered on the neighborhood's bounds. */
export function neighborhoodMapHref(page: NeighborhoodPage): string {
  const bounds = getNeighborhoodBounds(page);
  if (!bounds) return '/';
  const [west, south, east, north] = bounds;
  const lat = ((south + north) / 2).toFixed(4);
  const lng = ((west + east) / 2).toFixed(4);
  const span = Math.max(east - west, (north - south) * LAT_LNG_SCREEN_RATIO);
  const zoom = Math.min(15, Math.max(12, Math.log2(360 / span) - 0.5)).toFixed(1);
  return `/?lat=${lat}&lng=${lng}&z=${zoom}`;
}

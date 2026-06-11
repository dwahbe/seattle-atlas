/**
 * Seattle Zoning Information Library
 *
 * Maps zone codes to human-readable information based on Seattle Municipal Code Title 23.
 * Data derived from: https://library.municode.com/wa/seattle/codes/municipal_code?nodeId=TIT23LAUSCO
 */

export interface ZoneInfo {
  code: string;
  name: string;
  category: 'residential' | 'multifamily' | 'commercial' | 'mixed' | 'downtown' | 'industrial';
  summary: string;
  maxHeight: string;
  maxHeightFt: number;
  /** Height limit when the designation carries an MHA suffix — (M), (M1), (M2).
   * Only needed for zones whose designations have no numeric height suffix
   * (LR2, LR3, MR, HR); MHA rezones raised their height limits in 2019. */
  mhaMaxHeight?: string;
  mhaMaxHeightFt?: number;
  aduAllowed: number;
  lotCoverage: string;
  far: string;
  smcSection: string;
  smcLink: string;
  allowedUses: string[];
  notAllowedUses: string[];
  /** Use-specific conditions worth surfacing (e.g. NR corner-store hours). */
  useNotes?: string[];
}

const SMC_BASE_URL = 'https://library.municode.com/wa/seattle/codes/municipal_code';

/**
 * Comprehensive mapping of Seattle zone codes to human-readable information.
 * Heights and development standards from SMC Title 23.
 */
const ZONE_INFO_MAP: Record<string, ZoneInfo> = {
  // Neighborhood Residential — the previous NR1/NR2/NR3 sub-zones were
  // collapsed into a single NR zone by Ordinance 127376 (One Seattle Plan
  // state-zoning compliance), effective Jan 21, 2026. SMC Ch. 23.44 was
  // repealed and replaced in its entirety — the chapter number is unchanged
  // but its contents are new. Minimum lot size is now uniformly 5,000 sf,
  // and development standards are uniform across the old NR1/2/3 footprints.
  NR: {
    code: 'NR',
    name: 'Neighborhood Residential',
    category: 'residential',
    summary:
      'Houses, townhomes, and multiplexes up to 6 units (9 with stacked-flat bonuses). ADUs allowed and count toward density.',
    maxHeight: '32–42 ft',
    maxHeightFt: 42,
    aduAllowed: 2,
    lotCoverage: '50%',
    far: '0.6–1.6',
    smcSection: '23.44',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.44NERE`,
    allowedUses: [
      'Single-family homes',
      'Townhomes & rowhouses',
      'Multiplexes (up to 9 units)',
      'Cottage housing & stacked flats',
      'ADUs (up to 2)',
      'Corner stores & cafes',
      'Daycares',
      'Home businesses',
      'Religious institutions',
    ],
    notAllowedUses: ['Large retail', 'Office buildings', 'Industrial', 'Hotels', 'Drive-throughs'],
    useNotes: ['Shops and cafes may only operate between 6 AM and 10 PM.'],
  },
  // RSL is a legacy zone — rezoned to LR1 citywide under Ordinance 127376
  // (except in South Park, where RSL outside the new Neighborhood Center was
  // rezoned to NR). Kept here as a fallback for historical/PREV lookups and
  // any URL bookmarks referencing the old code.
  RSL: {
    code: 'RSL',
    name: 'Residential Small Lot',
    category: 'residential',
    summary:
      'Small-lot houses (legacy zone — rezoned to LR1 citywide Jan 21, 2026, except parts of South Park which became NR).',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    aduAllowed: 1,
    lotCoverage: '50%',
    far: '0.75',
    smcSection: '23.44',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.44NERE`,
    allowedUses: ['Small-lot houses', 'Duplexes', 'ADUs'],
    notAllowedUses: ['Large retail', 'Office buildings', 'Industrial'],
  },

  // Lowrise Multifamily
  LR1: {
    code: 'LR1',
    name: 'Lowrise 1',
    category: 'multifamily',
    summary: 'Townhouses and small apartments (up to 3 stories)',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    aduAllowed: 0,
    lotCoverage: '40%',
    far: '1.0–1.3',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Townhouses',
      'Small apartments (3 stories)',
      'Rowhouses',
      'Live-work units',
      'Daycares',
      'Street-level shops (select streets)',
    ],
    notAllowedUses: ['Large commercial', 'Offices', 'Industrial', 'Hotels'],
  },
  LR2: {
    code: 'LR2',
    name: 'Lowrise 2',
    category: 'multifamily',
    summary: 'Townhouses and apartments (3–4 stories)',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    mhaMaxHeight: '30–40 ft',
    mhaMaxHeightFt: 40,
    aduAllowed: 0,
    lotCoverage: '45%',
    far: '1.1–1.6',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Townhouses',
      'Apartments (3 stories)',
      'Rowhouses',
      'Live-work units',
      'Daycares',
      'Street-level shops (select streets)',
    ],
    notAllowedUses: ['Large commercial', 'Offices', 'Industrial', 'Hotels'],
  },
  LR3: {
    code: 'LR3',
    name: 'Lowrise 3',
    category: 'multifamily',
    summary: 'Apartments and townhouses (up to 5 stories)',
    maxHeight: '30–40 ft',
    maxHeightFt: 40,
    mhaMaxHeight: '40–50 ft',
    mhaMaxHeightFt: 50,
    aduAllowed: 0,
    lotCoverage: '50%',
    far: '1.2–2.3',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Apartments (4-5 stories)',
      'Townhouses',
      'Live-work units',
      'Ground-floor retail (select streets & centers)',
      'Restaurants',
      'Daycares',
    ],
    notAllowedUses: ['Large commercial', 'Offices', 'Industrial', 'Hotels'],
  },

  // Midrise and Highrise
  MR: {
    code: 'MR',
    name: 'Midrise',
    category: 'multifamily',
    summary: 'Mid-rise apartments (6-8 stories)',
    maxHeight: '60–75 ft',
    maxHeightFt: 75,
    mhaMaxHeight: '80 ft',
    mhaMaxHeightFt: 80,
    aduAllowed: 0,
    lotCoverage: '75%',
    far: '3.2–4.5',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Apartments (6-8 stories)',
      'Ground-floor retail',
      'Restaurants',
      'Services',
      'Daycares',
    ],
    notAllowedUses: ['Heavy industrial', 'Drive-throughs', 'Auto-oriented uses'],
  },
  HR: {
    code: 'HR',
    name: 'Highrise',
    category: 'multifamily',
    summary: 'Residential towers up to 44 stories, found only in the First Hill–Capitol Hill area',
    maxHeight: '300 ft',
    maxHeightFt: 300,
    mhaMaxHeight: '440 ft',
    mhaMaxHeightFt: 440,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '14–15 (with bonuses)',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'High-rise apartments',
      'Ground-floor retail',
      'Restaurants',
      'Offices',
      'Hotels',
    ],
    notAllowedUses: ['Heavy industrial', 'Drive-throughs', 'Auto sales/repair'],
  },

  // Neighborhood Commercial
  NC1: {
    code: 'NC1',
    name: 'Neighborhood Commercial 1',
    category: 'commercial',
    summary: 'Small shops with apartments above',
    maxHeight: '30–75 ft',
    maxHeightFt: 75,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '2.0',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Ground-floor shops & services',
      'Small restaurants & cafes',
      'Apartments above',
      'Services (salon, laundry)',
      'Daycares',
    ],
    notAllowedUses: [
      'Heavy industrial',
      'Auto-oriented uses',
      'Drive-throughs',
      'Large-format retail',
    ],
    useNotes: ['On the busiest walking streets, new buildings must include shops at street level.'],
  },
  NC2: {
    code: 'NC2',
    name: 'Neighborhood Commercial 2',
    category: 'commercial',
    summary: 'Shops and restaurants with apartments above',
    maxHeight: '30–75 ft',
    maxHeightFt: 75,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '3.0',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Ground-floor shops & services',
      'Restaurants & bars',
      'Apartments above',
      'Small offices',
      'Services & medical/dental',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Drive-throughs'],
    useNotes: ['On the busiest walking streets, new buildings must include shops at street level.'],
  },
  NC3: {
    code: 'NC3',
    name: 'Neighborhood Commercial 3',
    category: 'commercial',
    summary: 'Mixed-use: retail, office, and apartments',
    maxHeight: '40–200 ft',
    maxHeightFt: 200,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: '4.0',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Ground-floor shops & services',
      'Restaurants & bars',
      'Apartments above',
      'Offices',
      'Services & entertainment',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Drive-throughs'],
    useNotes: ['On the busiest walking streets, new buildings must include shops at street level.'],
  },

  // Commercial
  C1: {
    code: 'C1',
    name: 'Commercial 1',
    category: 'commercial',
    summary: 'Auto-oriented commercial and services',
    maxHeight: '30–200 ft',
    maxHeightFt: 200,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '2.5',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Retail & services',
      'Restaurants',
      'Auto sales & repair',
      'Gas stations',
      'Drive-throughs',
      'Housing (allowed)',
    ],
    notAllowedUses: ['Heavy industrial', 'Bulk warehousing'],
  },
  C2: {
    code: 'C2',
    name: 'Commercial 2',
    category: 'commercial',
    summary: 'General commercial with residential allowed',
    maxHeight: '30–75 ft',
    maxHeightFt: 75,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: '4.0',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Retail & restaurants',
      'Offices',
      'Housing',
      'Hotels',
      'Entertainment',
      'Services',
    ],
    notAllowedUses: ['Heavy industrial', 'Bulk warehousing'],
  },

  // Seattle Mixed — area-specific designations (SM-SLU, SM-U, SM-UP, SM-NG,
  // SM-NR, SM-RB, SM-D) carry their own height suffixes, from 55 ft in
  // Rainier Beach to 440 ft in South Lake Union. getZoneInfo() overrides
  // code/name/height from the full ZONING designation when available.
  SM: {
    code: 'SM',
    name: 'Seattle Mixed',
    category: 'mixed',
    summary:
      'Mixed-use districts near urban centers: housing, retail, office. Heights vary by area, from 55 ft up to 440 ft towers.',
    maxHeight: '55–440 ft by area',
    maxHeightFt: 440,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: '4.5',
    smcSection: '23.48',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.48SEMI`,
    allowedUses: [
      'Housing',
      'Retail & restaurants',
      'Offices',
      'Light manufacturing',
      'Hotels',
      'Entertainment',
    ],
    notAllowedUses: ['Heavy industrial', 'Hazardous materials'],
  },
  PSM: {
    code: 'PSM',
    name: 'Pioneer Square Mixed',
    category: 'downtown',
    summary: 'Historic Pioneer Square: ground-floor commercial, housing above',
    maxHeight: '85–245 ft',
    maxHeightFt: 245,
    aduAllowed: 0,
    lotCoverage: '100%',
    far: '6.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: [
      'Ground-floor commercial',
      'Housing above',
      'Restaurants & bars',
      'Offices',
      'Arts & cultural venues',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Drive-throughs'],
  },

  // Downtown
  DMC: {
    code: 'DMC',
    name: 'Downtown Mixed Commercial',
    category: 'downtown',
    summary: 'Downtown high-rise: office, retail, and housing',
    maxHeight: '240–400 ft',
    maxHeightFt: 400,
    aduAllowed: 0,
    lotCoverage: '100%',
    far: '14.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: ['Offices', 'Retail & restaurants', 'Housing', 'Hotels', 'Entertainment'],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses'],
  },
  DMR: {
    code: 'DMR',
    name: 'Downtown Mixed Residential',
    category: 'downtown',
    summary: 'Downtown high-rise residential towers',
    maxHeight: '240–400 ft',
    maxHeightFt: 400,
    aduAllowed: 0,
    lotCoverage: '95%',
    far: '12.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: [
      'High-rise housing',
      'Ground-floor retail',
      'Restaurants',
      'Hotels',
      'Some office',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses'],
  },
  DOC1: {
    code: 'DOC1',
    name: 'Downtown Office Core 1',
    category: 'downtown',
    summary: 'Downtown office towers with ground-floor retail',
    maxHeight: '450 ft',
    maxHeightFt: 450,
    aduAllowed: 0,
    lotCoverage: '100%',
    far: '20.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: ['Offices', 'Ground-floor retail (required)', 'Restaurants', 'Housing', 'Hotels'],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses'],
  },
  DOC2: {
    code: 'DOC2',
    name: 'Downtown Office Core 2',
    category: 'downtown',
    summary: 'Downtown office towers (tallest buildings allowed)',
    maxHeight: '500+ ft',
    maxHeightFt: 500,
    aduAllowed: 0,
    lotCoverage: '100%',
    far: '25.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: ['Offices', 'Ground-floor retail (required)', 'Restaurants', 'Housing', 'Hotels'],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses'],
  },
  DRC: {
    code: 'DRC',
    name: 'Downtown Retail Core',
    category: 'downtown',
    summary: 'Downtown retail district with upper-floor office/housing',
    maxHeight: '240 ft',
    maxHeightFt: 240,
    aduAllowed: 0,
    lotCoverage: '100%',
    far: '8.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: ['Retail (required ground floor)', 'Offices above', 'Housing', 'Entertainment'],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses'],
  },
  DH1: {
    code: 'DH1',
    name: 'Downtown Harborfront 1',
    category: 'downtown',
    summary: 'Waterfront mixed-use with public access requirements',
    maxHeight: '65 ft',
    maxHeightFt: 65,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '5.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: [
      'Waterfront commercial',
      'Restaurants',
      'Housing',
      'Public access areas',
      'Marine-related retail',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Large-format retail'],
  },
  DH2: {
    code: 'DH2',
    name: 'Downtown Harborfront 2',
    category: 'downtown',
    summary: 'Waterfront with larger-scale development',
    maxHeight: '85 ft',
    maxHeightFt: 85,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: '6.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: ['Waterfront commercial', 'Restaurants', 'Housing', 'Offices', 'Hotels'],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses'],
  },

  // Urban Industrial — created by the 2023 Industrial & Maritime Strategy
  // (effective Oct 23, 2023). The tileset's ZONELUT is "UX" but official map
  // designations read "UI" (e.g. "UI U/45") — the designation parser shows UI.
  UX: {
    code: 'UX',
    name: 'Urban Industrial',
    category: 'industrial',
    summary:
      'Industrial-to-residential transition areas for small-scale industry, arts, and limited housing — created by the 2023 Industrial & Maritime Strategy.',
    maxHeight: '30–85 ft',
    maxHeightFt: 85,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: 'Varies by use',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
    allowedUses: [
      'Light manufacturing & maker spaces',
      'Arts & creative industries',
      'Retail & restaurants',
      'Offices',
      'Housing (limited)',
    ],
    notAllowedUses: ['Heavy manufacturing', 'Large warehousing & logistics'],
  },

  // Industrial
  IC: {
    code: 'IC',
    name: 'Industrial Commercial',
    category: 'industrial',
    summary: 'Light industrial with commercial uses',
    maxHeight: '45–65 ft',
    maxHeightFt: 65,
    aduAllowed: 0,
    lotCoverage: '75%',
    far: '2.5',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
    allowedUses: ['Light manufacturing', 'Warehouses', 'Offices', 'Some retail', 'Tech & research'],
    notAllowedUses: ['Housing', 'Schools', 'Hospitals'],
  },
  IB: {
    code: 'IB',
    name: 'Industrial Buffer',
    category: 'industrial',
    summary: 'Buffer between industrial and residential areas',
    maxHeight: '45 ft',
    maxHeightFt: 45,
    aduAllowed: 0,
    lotCoverage: '65%',
    far: '1.5',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
    allowedUses: ['Light manufacturing', 'Warehouses', 'Some office', 'Transitional uses'],
    notAllowedUses: ['Housing', 'Schools', 'Large retail'],
  },
  MML: {
    code: 'MML',
    name: 'Maritime Manufacturing/Logistics',
    category: 'industrial',
    summary: 'Port and heavy industrial uses',
    maxHeight: '45–85 ft',
    maxHeightFt: 85,
    aduAllowed: 0,
    lotCoverage: '75%',
    far: '2.0',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
    allowedUses: [
      'Heavy manufacturing',
      'Port & maritime operations',
      'Warehouses & logistics',
      'Industrial services',
    ],
    notAllowedUses: ['Housing', 'Mini-storage', 'Big-box retail', 'Schools'],
  },
  II: {
    code: 'II',
    name: 'Industry & Innovation',
    category: 'industrial',
    summary: 'Industrial with tech and innovation uses',
    maxHeight: '85–240 ft',
    maxHeightFt: 240,
    aduAllowed: 0,
    lotCoverage: '75%',
    far: '2.5',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
    allowedUses: [
      'Manufacturing',
      'Tech & innovation',
      'Research & development',
      'Warehouses',
      'Some office & retail',
    ],
    notAllowedUses: ['Housing', 'Schools', 'Hospitals'],
  },
  IDM: {
    code: 'IDM',
    name: 'International District Mixed',
    category: 'downtown',
    summary: 'Chinatown-International District: mixed-use commercial and housing',
    maxHeight: '65–170 ft',
    maxHeightFt: 170,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '3.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: [
      'Ground-floor commercial',
      'Housing above',
      'Restaurants',
      'Small offices',
      'Community services',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Drive-throughs'],
  },
  IDR: {
    code: 'IDR',
    name: 'International District Residential',
    category: 'downtown',
    summary: 'Chinatown-International District: residential with ground-floor retail',
    maxHeight: '45–270 ft',
    maxHeightFt: 270,
    aduAllowed: 0,
    lotCoverage: '75%',
    far: '2.5',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: ['Housing', 'Ground-floor retail', 'Restaurants', 'Community services'],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Large offices'],
  },
  PMM: {
    code: 'PMM',
    name: 'Pike Market Mixed',
    category: 'downtown',
    summary: 'Pike Place Market area: market-compatible retail and housing',
    maxHeight: '85 ft',
    maxHeightFt: 85,
    aduAllowed: 0,
    lotCoverage: '100%',
    far: '5.0',
    smcSection: '23.49',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.49DOZO`,
    allowedUses: [
      'Market-compatible retail',
      'Restaurants',
      'Housing above',
      'Small offices',
      'Arts & crafts',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Large-format retail'],
  },

  // Major Institutions
  MIO: {
    code: 'MIO',
    name: 'Major Institution Overlay',
    category: 'industrial',
    summary: 'Hospitals, universities, and large institutions',
    maxHeight: 'Varies by master plan',
    maxHeightFt: 0,
    aduAllowed: 0,
    lotCoverage: 'Varies',
    far: 'Varies',
    smcSection: '23.69',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IVADUSRE_CH23.69MAIN`,
    allowedUses: [
      'Hospitals & medical',
      'Universities & research',
      'Student housing',
      'Supporting retail & services',
    ],
    notAllowedUses: ['General commercial', 'Industrial (outside plan)', 'Uses outside master plan'],
  },

  // Master Planned Community
  MPC: {
    code: 'MPC',
    name: 'Master Planned Community',
    category: 'mixed',
    summary: 'Large planned developments with mixed uses',
    maxHeight: 'Per master plan',
    maxHeightFt: 0,
    aduAllowed: 0,
    lotCoverage: 'Per plan',
    far: 'Per plan',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: ['Housing', 'Retail & services', 'Parks & open space', 'Community facilities'],
    notAllowedUses: ['Heavy industrial', 'Uses outside master plan'],
  },
};

/** Area names for Seattle Mixed designation prefixes (longest prefix first —
 * "SM-UP" must be checked before "SM-U"). */
const SM_AREA_NAMES: [string, string][] = [
  ['SM-SLU', 'Seattle Mixed — South Lake Union'],
  ['SM-UP', 'Seattle Mixed — Uptown'],
  ['SM-NG', 'Seattle Mixed — Northgate'],
  ['SM-NR', 'Seattle Mixed — North Rainier'],
  ['SM-RB', 'Seattle Mixed — Rainier Beach'],
  ['SM-D', 'Seattle Mixed — Dravus'],
  ['SM-U', 'Seattle Mixed — U District'],
];

/**
 * Derive the displayed code, name, and height limit from a full zoning
 * designation (the tileset's ZONING property), e.g. "SM-U 95-320 (M1)",
 * "SM-SLU 240/125-440", "NC3P-200 (M)", "DOC1 U/450-U", "MIO-160-HR (M)".
 *
 * Heights are the numeric tokens of the designation (the digit inside base
 * codes like NC3/DOC1 is never a standalone token, and no Seattle height
 * suffix is below 30). Industrial designations put FAR first ("MML U/45"),
 * but the max numeric token is still the height for every current value —
 * except MIO compounds, where the institution cap (the token right after
 * "MIO-") wins over the underlying zone's often-larger limit.
 */
function applyDesignation(base: ZoneInfo, designation: string): ZoneInfo {
  // MHA suffix — (M), (M1), (M2) — raises the height limit for zones whose
  // designations carry no numeric suffix (LR2/LR3/MR/HR). Detect before stripping.
  const hasMhaSuffix = /\(M\d?\)/.test(designation);

  // Strip parenthesized suffixes: MHA tiers "(M)", "(M1)" and FAR variants "(0.75)".
  const display = designation
    .replace(/\s*\([^)]*\)/g, '')
    .trim()
    .toUpperCase();
  if (!display) return base;

  // MIO compounds pair an institution height cap with the underlying zone
  // (e.g. "MIO-70-NC3P-200"). The displayed entry is the overlay, so the MIO
  // cap — not the underlying zone's (often larger) limit — is the height.
  const mioMatch = display.match(/^MIO-(\d+)/);
  if (mioMatch) {
    const cap = Number(mioMatch[1]);
    return { ...base, code: display, maxHeight: `${cap} ft`, maxHeightFt: cap };
  }

  const heights = (display.match(/\b\d+\b/g) ?? []).map(Number).filter((n) => n >= 30);
  if (heights.length === 0 && hasMhaSuffix && base.mhaMaxHeight && base.mhaMaxHeightFt) {
    return {
      ...base,
      code: display,
      maxHeight: base.mhaMaxHeight,
      maxHeightFt: base.mhaMaxHeightFt,
    };
  }
  if (display === base.code) return base;

  const maxHeightFt = heights.length > 0 ? Math.max(...heights) : base.maxHeightFt;
  // Downtown designations use "U" for unlimited height above the base limit
  // (e.g. DOC1 U/450-U). Elsewhere (industrial) "U" means unlimited FAR.
  const unlimited = base.category === 'downtown' && /\bU\b/.test(display);

  let maxHeight = base.maxHeight;
  if (heights.length > 0) {
    maxHeight = unlimited ? `${maxHeightFt}+ ft` : `${maxHeightFt} ft`;
  }

  let name = base.name;
  if (base.code === 'SM') {
    const area = SM_AREA_NAMES.find(([prefix]) => display.startsWith(prefix));
    if (area) name = area[1];
  }

  return { ...base, code: display, name, maxHeight, maxHeightFt };
}

/**
 * Get zone information for a zone code.
 *
 * `zoneCode` is the base code (the tileset's ZONELUT property, e.g. "SM",
 * "NC3") and resolves which ZONE_INFO_MAP entry applies; height suffix
 * variations (e.g. NC3-65) are also accepted. When `designation` (the
 * tileset's full ZONING property, e.g. "SM-U 95-320 (M1)") is provided, the
 * returned code, name, and height limit reflect that specific designation.
 */
export function getZoneInfo(zoneCode: string, designation?: string): ZoneInfo | null {
  if (!zoneCode) return null;

  // Normalize the code (uppercase, trim)
  const normalized = zoneCode.toUpperCase().trim();

  // Direct match
  if (ZONE_INFO_MAP[normalized]) {
    return designation
      ? applyDesignation(ZONE_INFO_MAP[normalized], designation)
      : ZONE_INFO_MAP[normalized];
  }

  // Handle height suffix (e.g., NC3-65 → NC3 base with 65ft height)
  const heightMatch = normalized.match(/^([A-Z]+\d?)[-/](\d+)$/);
  if (heightMatch) {
    const [, baseCode] = heightMatch;
    const baseInfo = ZONE_INFO_MAP[baseCode];
    if (baseInfo) {
      return applyDesignation(baseInfo, designation ?? normalized);
    }
  }

  // Handle (M) suffix for mixed-use designations
  const mixedMatch = normalized.match(/^([A-Z]+\d?)(?:\(M\))?$/);
  if (mixedMatch) {
    const baseCode = mixedMatch[1];
    if (ZONE_INFO_MAP[baseCode]) {
      return ZONE_INFO_MAP[baseCode];
    }
  }

  return null;
}

/**
 * Get all known zone codes. Only consumed by tests, which use it to validate
 * every ZONE_INFO_MAP entry.
 */
export function getAllZoneCodes(): string[] {
  return Object.keys(ZONE_INFO_MAP);
}

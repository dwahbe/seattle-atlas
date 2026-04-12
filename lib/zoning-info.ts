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
  aduAllowed: number;
  lotCoverage: string;
  far: string;
  smcSection: string;
  smcLink: string;
  allowedUses: string[];
  notAllowedUses: string[];
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
    maxHeight: '32 ft',
    maxHeightFt: 32,
    aduAllowed: 2,
    lotCoverage: '50%',
    far: '0.6–1.6',
    smcSection: '23.44',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.44NERE`,
    allowedUses: [
      'Single-family homes',
      'Duplexes & triplexes',
      'Multiplexes (up to 9 units)',
      'ADUs (up to 2)',
      'Small cafes & shops',
      'Daycares',
      'Home businesses',
      'Religious institutions',
    ],
    notAllowedUses: ['Large retail', 'Office buildings', 'Industrial', 'Hotels', 'Drive-throughs'],
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
    far: '1.0',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Townhouses',
      'Small apartments (3 stories)',
      'Rowhouses',
      'Live-work units',
      'Daycares',
      'Small retail',
    ],
    notAllowedUses: ['Large commercial', 'Offices', 'Industrial', 'Hotels'],
  },
  LR2: {
    code: 'LR2',
    name: 'Lowrise 2',
    category: 'multifamily',
    summary: 'Townhouses and apartments (up to 3 stories)',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    aduAllowed: 0,
    lotCoverage: '45%',
    far: '1.3',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Townhouses',
      'Apartments (3 stories)',
      'Rowhouses',
      'Live-work units',
      'Daycares',
      'Small retail',
    ],
    notAllowedUses: ['Large commercial', 'Offices', 'Industrial', 'Hotels'],
  },
  LR3: {
    code: 'LR3',
    name: 'Lowrise 3',
    category: 'multifamily',
    summary: 'Apartments and townhouses (up to 4 stories)',
    maxHeight: '40 ft',
    maxHeightFt: 40,
    aduAllowed: 0,
    lotCoverage: '50%',
    far: '1.6',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Apartments (4 stories)',
      'Townhouses',
      'Live-work units',
      'Ground-floor retail',
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
    summary: 'Mid-rise apartments (5-7 stories)',
    maxHeight: '60 ft',
    maxHeightFt: 60,
    aduAllowed: 0,
    lotCoverage: '75%',
    far: '3.2',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
    allowedUses: [
      'Apartments (5-7 stories)',
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
    summary: 'High-rise apartments (unlimited height)',
    maxHeight: '240+ ft',
    maxHeightFt: 240,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '6.0+',
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
    summary: 'Small shops with apartments above (up to 30 ft)',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '2.0',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Ground-floor retail (required)',
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
  },
  NC2: {
    code: 'NC2',
    name: 'Neighborhood Commercial 2',
    category: 'commercial',
    summary: 'Shops and restaurants with apartments above (up to 40 ft)',
    maxHeight: '40 ft',
    maxHeightFt: 40,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '3.0',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Ground-floor retail (required)',
      'Restaurants & bars',
      'Apartments above',
      'Small offices',
      'Services & medical/dental',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Drive-throughs'],
  },
  NC3: {
    code: 'NC3',
    name: 'Neighborhood Commercial 3',
    category: 'commercial',
    summary: 'Mixed-use: retail, office, and apartments (up to 65 ft)',
    maxHeight: '65 ft',
    maxHeightFt: 65,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: '4.0',
    smcSection: '23.47A',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.47ACORE`,
    allowedUses: [
      'Ground-floor retail (required)',
      'Restaurants & bars',
      'Apartments above',
      'Offices',
      'Services & entertainment',
    ],
    notAllowedUses: ['Heavy industrial', 'Auto-oriented uses', 'Drive-throughs'],
  },

  // Commercial
  C1: {
    code: 'C1',
    name: 'Commercial 1',
    category: 'commercial',
    summary: 'Auto-oriented commercial and services',
    maxHeight: '40 ft',
    maxHeightFt: 40,
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
    maxHeight: '65 ft',
    maxHeightFt: 65,
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

  // Seattle Mixed
  SM: {
    code: 'SM',
    name: 'Seattle Mixed',
    category: 'mixed',
    summary: 'Mixed-use: housing, retail, office, light industrial',
    maxHeight: '65-85 ft',
    maxHeightFt: 85,
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
    maxHeight: '85-245 ft',
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
    maxHeight: '240-400 ft',
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
    maxHeight: '240-400 ft',
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

  // Urban Center/Village
  UX: {
    code: 'UX',
    name: 'Urban Center/Village',
    category: 'mixed',
    summary: 'High-density mixed-use in urban villages',
    maxHeight: '75-125 ft',
    maxHeightFt: 125,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: '5.0',
    smcSection: '23.48',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.48SEMI`,
    allowedUses: [
      'Housing',
      'Retail & restaurants',
      'Offices',
      'Hotels',
      'Entertainment',
      'Services',
    ],
    notAllowedUses: ['Heavy industrial', 'Hazardous materials'],
  },

  // Industrial
  IC: {
    code: 'IC',
    name: 'Industrial Commercial',
    category: 'industrial',
    summary: 'Light industrial with commercial uses',
    maxHeight: '65 ft',
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
    maxHeight: '65 ft',
    maxHeightFt: 65,
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
    notAllowedUses: ['Housing', 'Retail', 'Schools', 'Offices (non-accessory)'],
  },
  II: {
    code: 'II',
    name: 'Industry & Innovation',
    category: 'industrial',
    summary: 'Industrial with tech and innovation uses',
    maxHeight: '65 ft',
    maxHeightFt: 65,
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
    maxHeight: '65-170 ft',
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
    maxHeight: '45-270 ft',
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

/**
 * Get zone information for a zone code.
 * Handles height suffix variations (e.g., NC3-65, NC3-85).
 */
export function getZoneInfo(zoneCode: string): ZoneInfo | null {
  if (!zoneCode) return null;

  // Normalize the code (uppercase, trim)
  const normalized = zoneCode.toUpperCase().trim();

  // Direct match
  if (ZONE_INFO_MAP[normalized]) {
    return ZONE_INFO_MAP[normalized];
  }

  // Handle height suffix (e.g., NC3-65 → NC3 base with 65ft height)
  const heightMatch = normalized.match(/^([A-Z]+\d?)[-/](\d+)$/);
  if (heightMatch) {
    const [, baseCode, heightSuffix] = heightMatch;
    const baseInfo = ZONE_INFO_MAP[baseCode];
    if (baseInfo) {
      return {
        ...baseInfo,
        code: normalized,
        maxHeight: `${heightSuffix} ft`,
        maxHeightFt: parseInt(heightSuffix, 10),
      };
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
 * Get a simplified category label for display.
 */
export function getCategoryLabel(category: ZoneInfo['category']): string {
  const labels: Record<ZoneInfo['category'], string> = {
    residential: 'Residential',
    multifamily: 'Multi-Family',
    commercial: 'Commercial',
    mixed: 'Mixed Use',
    downtown: 'Downtown',
    industrial: 'Industrial',
  };
  return labels[category] || category;
}

/**
 * Get all known zone codes.
 */
export function getAllZoneCodes(): string[] {
  return Object.keys(ZONE_INFO_MAP);
}

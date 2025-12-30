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
}

const SMC_BASE_URL = 'https://library.municode.com/wa/seattle/codes/municipal_code';

/**
 * Comprehensive mapping of Seattle zone codes to human-readable information.
 * Heights and development standards from SMC 23.
 */
const ZONE_INFO_MAP: Record<string, ZoneInfo> = {
  // Neighborhood Residential (formerly Single Family)
  NR1: {
    code: 'NR1',
    name: 'Neighborhood Residential 1',
    category: 'residential',
    summary: 'Houses, duplexes, triplexes, and ADUs allowed',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    aduAllowed: 2,
    lotCoverage: '35%',
    far: '0.5',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
  },
  NR2: {
    code: 'NR2',
    name: 'Neighborhood Residential 2',
    category: 'residential',
    summary: 'Houses, duplexes, triplexes, and ADUs allowed',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    aduAllowed: 2,
    lotCoverage: '35%',
    far: '0.5',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
  },
  NR3: {
    code: 'NR3',
    name: 'Neighborhood Residential 3',
    category: 'residential',
    summary: 'Houses, duplexes, triplexes, and ADUs allowed',
    maxHeight: '35 ft',
    maxHeightFt: 35,
    aduAllowed: 2,
    lotCoverage: '35%',
    far: '0.5',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
  },
  RSL: {
    code: 'RSL',
    name: 'Residential Small Lot',
    category: 'residential',
    summary: 'Small-lot houses and cottages',
    maxHeight: '30 ft',
    maxHeightFt: 30,
    aduAllowed: 1,
    lotCoverage: '50%',
    far: '0.75',
    smcSection: '23.45',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.45NERE`,
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
  },
  PSM: {
    code: 'PSM',
    name: 'Pike/Pine Seattle Mixed',
    category: 'mixed',
    summary: 'Capitol Hill mixed-use with arts/cultural focus',
    maxHeight: '65 ft',
    maxHeightFt: 65,
    aduAllowed: 0,
    lotCoverage: '85%',
    far: '4.0',
    smcSection: '23.48',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.48SEMI`,
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
  },
  IDM: {
    code: 'IDM',
    name: 'Industrial/Commercial',
    category: 'industrial',
    summary: 'International District mixed industrial/commercial',
    maxHeight: '65 ft',
    maxHeightFt: 65,
    aduAllowed: 0,
    lotCoverage: '80%',
    far: '3.0',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
  },
  IDR: {
    code: 'IDR',
    name: 'Industrial/Residential',
    category: 'industrial',
    summary: 'International District mixed industrial/residential',
    maxHeight: '65 ft',
    maxHeightFt: 65,
    aduAllowed: 0,
    lotCoverage: '75%',
    far: '2.5',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
  },
  PMM: {
    code: 'PMM',
    name: 'Port Maritime Manufacturing',
    category: 'industrial',
    summary: 'Heavy port and maritime industrial',
    maxHeight: '45 ft',
    maxHeightFt: 45,
    aduAllowed: 0,
    lotCoverage: '65%',
    far: '1.0',
    smcSection: '23.50',
    smcLink: `${SMC_BASE_URL}?nodeId=TIT23LAUSCO_SUBTITLE_IIILAUSRE_CH23.50INZO`,
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

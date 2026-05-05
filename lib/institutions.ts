/**
 * Canonical lookup for Seattle Major Institution Overlay (MIO) parcels.
 * Source: City of Seattle GIS — Major Institution Overlay tileset.
 * Keyed on the `OVERLAY` property from the tileset.
 */

export type InstitutionCategory = 'university' | 'college' | 'hospital';

export interface InstitutionInfo {
  code: string;
  name: string;
  category: InstitutionCategory;
  /** URL to the institution's master plan PDF, when published by the city. */
  masterPlanUrl: string | null;
}

const INSTITUTIONS: Record<string, InstitutionInfo> = {
  'MIO-UW': {
    code: 'MIO-UW',
    name: 'University of Washington',
    category: 'university',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/UniversityofWashington/FinalMasterPlan-2003-01-19.pdf',
  },
  'MIO-SU': {
    code: 'MIO-SU',
    name: 'Seattle University',
    category: 'university',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/SeattleUniversity/SU%20MIMP%202013.pdf',
  },
  'MIO-SPU': {
    code: 'MIO-SPU',
    name: 'Seattle Pacific University',
    category: 'university',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/SeattlePacificUniversity/FinalMasterPlan-2000-08.pdf',
  },
  'MIO-NSC': {
    code: 'MIO-NSC',
    name: 'North Seattle College',
    category: 'college',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/NorthSeattleCommunityCollege/FinalMasterPlan-2005-08.pdf',
  },
  'MIO-SCC': {
    code: 'MIO-SCC',
    name: 'Seattle Central College',
    category: 'college',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/SeattleCentralCommunityCollege/FinalMasterPlan-2002-10-07.pdf',
  },
  'MIO-SSC': {
    code: 'MIO-SSC',
    name: 'South Seattle College',
    category: 'college',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/SouthSeattleCommunityCollege/MIMP2007.pdf',
  },
  'MIO-CH': {
    code: 'MIO-CH',
    name: "Seattle Children's Hospital",
    category: 'hospital',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/SeattleChildrens/Compiled%20Final%20Master%20Plan%20-%20Approved%2005-12-10.pdf',
  },
  'MIO-HBV': {
    code: 'MIO-HBV',
    name: 'Harborview Medical Center',
    category: 'hospital',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/HarborviewMedCenter/MIMPNov121999.pdf',
  },
  'MIO-VMMC': {
    code: 'MIO-VMMC',
    // Source data spells "Virgina" — fixed here.
    name: 'Virginia Mason Medical Center',
    category: 'hospital',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/VirginiaMasonMedCenter/VMMIMPMasterplan2014.pdf',
  },
  'MIO-NWH': {
    code: 'MIO-NWH',
    name: 'UW Medicine — Northwest Hospital',
    category: 'hospital',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/NorthwestHospital/FinalMasterPlan-1991-02-04.pdf',
  },
  'MIO-KP': {
    code: 'MIO-KP',
    name: 'Kaiser Permanente — Capitol Hill',
    category: 'hospital',
    masterPlanUrl: null,
  },
  'MIO-VA': {
    code: 'MIO-VA',
    name: 'VA Puget Sound Health Care System',
    category: 'hospital',
    masterPlanUrl: null,
  },
  'MIO-SMC-FH': {
    code: 'MIO-SMC-FH',
    name: 'Swedish Medical Center — First Hill',
    category: 'hospital',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/SwedishFirstHill/FinalMasterPlan-2005-03-14.pdf',
  },
  'MIO-SMC-CH': {
    code: 'MIO-SMC-CH',
    name: 'Swedish Medical Center — Cherry Hill',
    category: 'hospital',
    masterPlanUrl:
      'https://www.seattle.gov/Documents/Departments/Neighborhoods/MajorInstitutions/SwedishCherryHill/Cherry%20HillCompiledMIMP_2016_07_08(0).pdf',
  },
  'MIO-SMC-B': {
    code: 'MIO-SMC-B',
    name: 'Swedish Medical Center — Ballard',
    category: 'hospital',
    masterPlanUrl: null,
  },
};

/**
 * Resolve canonical institution data from a feature's OVERLAY property.
 * Falls back to the raw DESCRIPTION when the code isn't in our table —
 * keeps the UI working if the city adds a new institution before we update.
 */
export function getInstitutionInfo(
  overlayCode: unknown,
  fallbackName?: unknown
): InstitutionInfo | null {
  if (typeof overlayCode !== 'string' || !overlayCode) return null;
  const known = INSTITUTIONS[overlayCode];
  if (known) return known;
  if (typeof fallbackName === 'string' && fallbackName) {
    return {
      code: overlayCode,
      name: fallbackName,
      category: 'university',
      masterPlanUrl: null,
    };
  }
  return null;
}

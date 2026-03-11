// ============================================================================
// Layer Types
// ============================================================================

export interface LegendItem {
  label: string;
  color: string;
  value: string;
  percentage?: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface LayerFilter {
  id: string;
  label: string;
  property: string;
  type: 'select' | 'multiselect' | 'range';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export type LayerType = 'fill' | 'line' | 'circle' | 'symbol';

export interface LayerConfig {
  id: string;
  name: string;
  group: 'base' | 'transit' | 'proposals' | 'derived' | 'planning' | 'bike';
  tileset: string;
  sourceLayer: string;
  type: LayerType;
  zOrder: number;
  defaultVisible: boolean;
  legend: LegendItem[];
  filters?: LayerFilter[];
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  colorProperty?: string;
  source: string;
  updated: string;
  description?: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface LayerGroup {
  id: string;
  name: string;
  layers: LayerConfig[];
}

// ============================================================================
// Proposal Types
// ============================================================================

export interface ProposalLink {
  title: string;
  url: string;
}

export type ProposalStatus = 'Draft' | 'Public Comment' | 'Under Review' | 'Adopted' | 'Rejected';

export interface Proposal {
  id: string;
  name: string;
  status: ProposalStatus;
  summary: string;
  links: ProposalLink[];
  layers: string[];
  effectiveDate?: string;
  jurisdiction: string;
}

// ============================================================================
// Map State Types
// ============================================================================

export interface MapViewState {
  lat: number;
  lng: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface FilterState {
  [layerId: string]: {
    [filterId: string]: string | string[] | [number, number];
  };
}

// ============================================================================
// Feature Types
// ============================================================================

export interface InspectedFeature {
  id: string | number;
  layerId: string;
  properties: Record<string, unknown>;
  geometry: GeoJSON.Geometry;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchResult {
  id: string;
  name: string;
  type: 'address' | 'neighborhood' | 'place';
  center: [number, number];
  bbox?: [number, number, number, number];
}

// ============================================================================
// Theme Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

// ============================================================================
// External API Types
// ============================================================================

export interface WalkScoreData {
  walkscore: number | null;
  description: string | null;
  transit_score: number | null;
  bike_score: number | null;
  logo_url: string;
  more_info_link: string;
  error?: string;
}

export interface PermitData {
  permit_number: string;
  permit_type: string;
  description: string;
  status: string;
  issue_date: string | null;
  address: string;
  value: number | null;
  link: string;
}

export interface PermitsData {
  permits: PermitData[];
  total: number;
  error?: string;
}

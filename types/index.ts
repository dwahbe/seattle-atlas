// NOTE: Do NOT import mapbox-gl types here directly - it breaks Turbopack
// because mapbox-gl has browser-only initialization code.
// Use inline types or import from 'mapbox-gl' only in 'use client' components.

// Minimal type aliases to avoid importing mapbox-gl in shared types
export type MapboxMap = unknown;
export type LngLatLike = [number, number] | { lng: number; lat: number };

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
  group: 'base' | 'transit' | 'proposals' | 'derived' | 'planning';
  tileset: string;
  sourceLayer: string;
  type: LayerType;
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

export interface MapState {
  view: MapViewState;
  layers: string[];
  filters: FilterState;
  inspectedFeatureId: string | null;
  compareMode: boolean;
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

export interface FeatureProperties {
  [key: string]: unknown;
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
// Component Props Types
// ============================================================================

export interface MapContainerProps {
  initialState?: Partial<MapState>;
}

export interface ControlPanelProps {
  layers: LayerConfig[];
  activeLayers: string[];
  filters: FilterState;
  onLayerToggle: (layerId: string) => void;
  onFilterChange: (layerId: string, filterId: string, value: string | string[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface InspectPanelProps {
  feature: InspectedFeature | null;
  proposals: Proposal[];
  onClose: () => void;
  isOpen: boolean;
}

export interface ShareBarProps {
  onCopy: () => void;
}

export interface LayerToggleProps {
  layer: LayerConfig;
  isActive: boolean;
  onToggle: () => void;
}

export interface LegendProps {
  layers: LayerConfig[];
  activeLayers: string[];
}

export interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseMapStateReturn {
  map: MapboxMap | null;
  setMap: (map: MapboxMap | null) => void;
  viewState: MapViewState;
  setViewState: (state: MapViewState) => void;
  flyTo: (center: LngLatLike, zoom?: number) => void;
}

export interface UseLayersReturn {
  layers: LayerConfig[];
  activeLayers: string[];
  toggleLayer: (layerId: string) => void;
  setActiveLayers: (layerIds: string[]) => void;
  getLayerById: (layerId: string) => LayerConfig | undefined;
  layerGroups: LayerGroup[];
}

export interface UseInspectReturn {
  inspectedFeature: InspectedFeature | null;
  setInspectedFeature: (feature: InspectedFeature | null) => void;
  relatedProposals: Proposal[];
}

// ============================================================================
// URL State Types
// ============================================================================

export interface UrlStateParams {
  lat: number;
  lng: number;
  z: number;
  layers: string;
  filters: string;
  inspect: string;
  compare: boolean;
}

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

export interface NearestTransit {
  distance: number;
  distanceMeters: number;
  stopName: string;
  stopId: string;
  routes?: string[];
}

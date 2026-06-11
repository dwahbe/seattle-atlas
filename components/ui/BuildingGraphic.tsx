'use client';

import {
  IconBuilding,
  IconBuildingCommunity,
  IconBuildingEstate,
  IconBuildingSkyscraper,
  IconBuildingStore,
  IconBuildingWarehouse,
  IconBuildings,
  IconHome,
  type Icon,
} from '@tabler/icons-react';

import type { ZoneInfo } from '@/lib/zoning-info';

interface BuildingGraphicProps {
  category: ZoneInfo['category'];
  maxHeightFt: number;
  code: string;
  landmark?: LandmarkType | null;
  className?: string;
  /**
   * 'block' (default) — full graphic with descriptive label below.
   * 'inline' — icon only, sized to sit beside a heading.
   */
  variant?: 'block' | 'inline';
}

type BuildingType =
  | 'house'
  | 'townhouse'
  | 'lowrise'
  | 'midrise'
  | 'highrise'
  | 'skyscraper'
  | 'shopfront'
  | 'mixeduse'
  | 'warehouse';

type LandmarkType = 'space-needle';

function getBuildingType(
  category: ZoneInfo['category'],
  maxHeightFt: number,
  code: string
): BuildingType {
  if (category === 'residential') {
    return 'house';
  }

  if (category === 'multifamily') {
    if (code.startsWith('LR')) return 'lowrise';
    if (code === 'MR' || maxHeightFt <= 85) return 'midrise';
    return 'highrise';
  }

  if (category === 'commercial') {
    if (maxHeightFt <= 40) return 'shopfront';
    return 'mixeduse';
  }

  if (category === 'downtown') {
    return 'skyscraper';
  }

  if (category === 'mixed') {
    // Tower-zoned Seattle Mixed designations (U District, South Lake Union,
    // Northgate) allow 240 ft+ — show a highrise, not a midrise mixed-use block.
    if (maxHeightFt >= 240) return 'highrise';
    return 'mixeduse';
  }

  if (category === 'industrial') {
    return 'warehouse';
  }

  return 'house';
}

const ICON_SIZE = 56;
const ICON_STROKE = 1.5;

const BUILDING_ICONS: Record<BuildingType, Icon> = {
  house: IconHome,
  townhouse: IconBuildingCommunity,
  lowrise: IconBuildingEstate,
  midrise: IconBuilding,
  highrise: IconBuildingSkyscraper,
  skyscraper: IconBuildingSkyscraper,
  shopfront: IconBuildingStore,
  mixeduse: IconBuildings,
  warehouse: IconBuildingWarehouse,
};

const BUILDING_LABELS: Record<BuildingType, string> = {
  house: 'Houses, Multiplexes & Small Shops',
  townhouse: 'Townhouses & Small Apartments',
  lowrise: 'Townhouses & Small Apartments',
  midrise: 'Mid-Rise Apartments & Mixed-Use',
  highrise: 'High-Rise Towers',
  skyscraper: 'Downtown Towers',
  shopfront: 'Shops With Apartments Above',
  mixeduse: 'Mixed-Use Buildings',
  warehouse: 'Industrial & Warehouse',
};

// Space Needle landmark — custom SVG; Tabler has no equivalent.
function SpaceNeedleGraphic() {
  const STROKE_COLOR = 'rgb(var(--text-primary))';
  return (
    <svg viewBox="0 0 1900 2386.4976" className="w-full h-full" aria-hidden="true">
      <g transform="translate(-23.87359,349.04765)">
        <path
          d="m 810.21784,-49.547399 120.80132,125.606446 195.56434,0.242389 86.1958,-126.193314 c 9.2891,-13.59947 -71.7513,-5.122509 -71.7513,-5.122509 l -0.4712,-31.927892 -91.9737,0 -31.778,-262.105371 -42.43304,260.768922 -96.23434,0.870763 -2.88891,32.393578 c 0,0 -80.83399,-9.984851 -65.03097,5.466988 z"
          fill={STROKE_COLOR}
        />
        <g transform="translate(1024,1024)">
          <g>
            <path
              d="m -35.1976,-494.315 0,1507.765 c 26.38585,0 35.809365,0 35.809365,0 l 0,-1507.765 c 0,0 -13.192965,0 -35.809365,0 z M -478.103,1013.45 c 246.896,0 371.287,0 429.7125,0 l 0,-1507.765 c -39.5788,0 -99.8895,0 -158.3155,0 C 32.6517,525.31 -402.715,922.982 -478.103,1013.45 Z m 399.5572,-64.082 -312.8602,0 c 20.731,-24.501 45.232,-54.657 69.734,-92.351 l 241.2415,0 0,92.351 1.8847,0 z m 0,-150.776 -205.4322,0 c 16.962,-28.271 33.924,-58.426 49.002,-92.351 l 156.4302,0 0,92.351 z m 0,-135.699 -135.6982,0 c 13.193,-28.271 24.501,-60.311 35.809,-92.35 l 101.7739,0 0,92.35 -1.8847,0 z m 0,-135.699 -88.5812,0 c 9.424,-30.155 16.963,-60.31 24.501,-92.35 l 64.0802,0 0,92.35 0,0 z m 0,-784.036 -50.8872,0 c -3.769,-30.155 -9.423,-60.311 -15.077,-92.351 l 65.9642,0 0,92.351 z m 0,-135.699 -75.3882,0 c -5.654,-30.155 -13.193,-60.31 -20.732,-92.35 l 94.2355,0 0,92.35 1.8847,0 z"
              fill="rgb(var(--text-secondary))"
            />
            <path
              d="m 36.4211,-494.315 0,1507.765 c -26.3858,0 -35.809333,0 -35.809333,0 l 0,-1507.765 c 0,0 13.192933,0 35.809333,0 z M 479.326,1013.45 c -246.896,0 -371.286,0 -429.712,0 l 0,-1507.765 c 39.5788,0 99.889,0 158.315,0 C -31.4282,525.31 403.938,922.982 479.326,1013.45 Z m -399.5567,-64.082 312.8607,0 c -20.732,-24.501 -45.233,-54.657 -69.734,-92.351 l -241.242,0 0,92.351 -1.8847,0 z m 0,-150.776 205.4327,0 C 268.24,770.321 251.277,740.166 236.2,706.241 l -156.4307,0 0,92.351 z m 0,-135.699 135.6987,0 c -13.193,-28.271 -24.501,-60.311 -35.809,-92.35 l -101.7744,0 0,92.35 1.8847,0 z m 0,-135.699 88.5807,0 c -9.423,-30.155 -16.962,-60.31 -24.501,-92.35 l -64.0797,0 0,92.35 0,0 z m 0,-784.036 50.8867,0 c 3.77,-30.155 9.424,-60.311 15.078,-92.351 l -65.9647,0 0,92.351 z m 0,-135.699 75.3877,0 c 5.655,-30.155 13.193,-60.31 20.732,-92.35 l -94.235,0 0,92.35 -1.8847,0 z"
              fill="rgb(var(--text-secondary))"
            />
            <path
              d="m 535.84412,-845.21029 -1075.37953,3.62729 c -25.67386,0.0866 -44.591,20.269 -44.591,44.591 0,25.673 20.268,44.591 44.591,44.591 l 89.54141,0 67.562,116.206 c 17.566,28.376 48.644,47.294 81.074,47.294 l 22.971,0 78.372,67.561 c 18.917,17.567 44.591,27.025 70.264,27.025 l 259.438,0 c 25.673,0 51.347,-9.458 70.264,-27.025 l 78.372,-67.561 22.971,0 c 33.781,0 64.86,-17.567 81.074,-47.294 l 67.562,-116.206 85.91412,-3.62729 c 25.65114,-1.08299 44.591,-20.269 44.591,-44.591 1.352,-24.322 -18.91714,-44.6776 -44.591,-44.591 z M 254.001,-746.996 l 0,133.772 -105.397,0 0,-133.772 z m -133.773,0 0,133.772 -105.3963,0 0,-133.772 z m -135.1235,0 0,133.772 -105.3965,0 0,-133.772 z m -135.1235,0 0,133.772 -105.397,0 0,-133.772 z m -135.124,135.124 -20.269,0 c -21.619,0 -40.537,-10.81 -51.347,-29.728 l -60.805,-105.396 132.421,0 z m 644.54,-29.728 c -10.81,17.566 -29.727,29.728 -51.347,29.728 l -20.268,0 0,-133.773 132.421,0 z m -5.405,-335.107 C 318.86,-1006.43 275.621,-1024 229.679,-1024 l -459.421,0 c -45.942,0 -90.533,16.21 -124.314,47.293 l -137.827,120.26 983.702,0 z"
              fill={STROKE_COLOR}
              fillOpacity={0.85}
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

const LANDMARK_COMPONENTS: Record<LandmarkType, React.FC> = {
  'space-needle': SpaceNeedleGraphic,
};

const LANDMARK_LABELS: Record<LandmarkType, string> = {
  'space-needle': 'Space Needle',
};

export function BuildingGraphic({
  category,
  maxHeightFt,
  code,
  landmark,
  className,
  variant = 'block',
}: BuildingGraphicProps) {
  const hasLandmark = Boolean(landmark && LANDMARK_COMPONENTS[landmark]);

  if (variant === 'inline') {
    if (hasLandmark) {
      const LandmarkComponent = LANDMARK_COMPONENTS[landmark as LandmarkType];
      return (
        <div className={`w-8 h-8 shrink-0 ${className || ''}`} aria-hidden="true">
          <LandmarkComponent />
        </div>
      );
    }
    const buildingType = getBuildingType(category, maxHeightFt, code);
    const IconComponent = BUILDING_ICONS[buildingType];
    return (
      <IconComponent
        size={32}
        stroke={ICON_STROKE}
        className={`shrink-0 text-text-primary ${className || ''}`}
        aria-hidden="true"
      />
    );
  }

  if (hasLandmark) {
    const LandmarkComponent = LANDMARK_COMPONENTS[landmark as LandmarkType];
    return (
      <div className={className || ''}>
        <div className="h-16 flex items-center justify-center">
          <LandmarkComponent />
        </div>
        <p className="text-xs text-text-secondary text-center mt-1">
          {LANDMARK_LABELS[landmark as LandmarkType]}
        </p>
      </div>
    );
  }

  const buildingType = getBuildingType(category, maxHeightFt, code);
  const IconComponent = BUILDING_ICONS[buildingType];

  return (
    <div className={className || ''}>
      <div className="h-16 flex items-center justify-center text-text-primary">
        <IconComponent size={ICON_SIZE} stroke={ICON_STROKE} aria-hidden="true" />
      </div>
      <p className="text-xs text-text-secondary text-center mt-1">
        {BUILDING_LABELS[buildingType]}
      </p>
    </div>
  );
}

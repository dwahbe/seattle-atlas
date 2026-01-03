'use client';

import type { ZoneInfo } from '@/lib/zoning-info';

interface BuildingGraphicProps {
  category: ZoneInfo['category'];
  maxHeightFt: number;
  code: string;
  className?: string;
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

function getBuildingType(
  category: ZoneInfo['category'],
  maxHeightFt: number,
  code: string
): BuildingType {
  // Residential zones
  if (category === 'residential') {
    return 'house';
  }

  // Multifamily - based on height
  if (category === 'multifamily') {
    if (code.startsWith('LR')) return 'lowrise';
    if (code === 'MR' || maxHeightFt <= 85) return 'midrise';
    return 'highrise';
  }

  // Commercial zones
  if (category === 'commercial') {
    if (maxHeightFt <= 40) return 'shopfront';
    return 'mixeduse';
  }

  // Downtown zones - tall towers
  if (category === 'downtown') {
    return 'skyscraper';
  }

  // Mixed use
  if (category === 'mixed') {
    return 'mixeduse';
  }

  // Industrial
  if (category === 'industrial') {
    return 'warehouse';
  }

  return 'house';
}

const STROKE_COLOR = 'rgb(var(--text-primary))';
const STROKE_WIDTH = 1.5;

// Small house with pitched roof
function HouseGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* House body */}
      <rect
        x="25"
        y="40"
        width="35"
        height="35"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Pitched roof */}
      <polyline
        points="20,40 42.5,20 65,40"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Door */}
      <rect
        x="37"
        y="55"
        width="10"
        height="20"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Window */}
      <rect
        x="30"
        y="47"
        width="8"
        height="8"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="47"
        y="47"
        width="8"
        height="8"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* ADU/small building */}
      <rect
        x="70"
        y="55"
        width="20"
        height="20"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <polyline
        points="67,55 80,45 93,55"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="76"
        y="62"
        width="8"
        height="8"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
    </svg>
  );
}

// Row of townhouses / lowrise apartments
function LowriseGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Building 1 - 3 story */}
      <rect
        x="10"
        y="30"
        width="30"
        height="45"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      {/* Windows */}
      {[35, 48, 61].map((y) => (
        <g key={y}>
          <rect
            x="14"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="28"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
        </g>
      ))}
      {/* Door */}
      <rect
        x="21"
        y="63"
        width="8"
        height="12"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Building 2 - 4 story */}
      <rect
        x="45"
        y="20"
        width="30"
        height="55"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      {/* Windows */}
      {[25, 38, 51, 64].map((y) => (
        <g key={y}>
          <rect
            x="49"
            y={y}
            width="8"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="63"
            y={y}
            width="8"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
        </g>
      ))}

      {/* Building 3 - 3 story */}
      <rect
        x="80"
        y="30"
        width="30"
        height="45"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      {/* Windows */}
      {[35, 48, 61].map((y) => (
        <g key={y}>
          <rect
            x="84"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="98"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

// Mid-rise apartment building (5-7 stories) with fire escape
function MidriseGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Main building */}
      <rect
        x="25"
        y="10"
        width="50"
        height="65"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Windows grid - 6 floors */}
      {[15, 25, 35, 45, 55, 65].map((y) => (
        <g key={y}>
          <rect
            x="30"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="46"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="62"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
        </g>
      ))}

      {/* Fire escape - zigzag stairs */}
      <g stroke={STROKE_COLOR} strokeWidth={1} fill="none">
        <line x1="78" y1="15" x2="85" y2="15" />
        <line x1="85" y1="15" x2="85" y2="25" />
        <line x1="78" y1="25" x2="85" y2="25" />
        <line x1="78" y1="25" x2="78" y2="35" />
        <line x1="78" y1="35" x2="85" y2="35" />
        <line x1="85" y1="35" x2="85" y2="45" />
        <line x1="78" y1="45" x2="85" y2="45" />
        <line x1="78" y1="45" x2="78" y2="55" />
        <line x1="78" y1="55" x2="85" y2="55" />
        <line x1="85" y1="55" x2="85" y2="65" />
        <line x1="78" y1="65" x2="85" y2="65" />
        <line x1="85" y1="65" x2="85" y2="75" />
      </g>

      {/* Entrance */}
      <rect
        x="43"
        y="63"
        width="14"
        height="12"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
    </svg>
  );
}

// High-rise apartment tower
function HighriseGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Main tower */}
      <rect
        x="35"
        y="5"
        width="40"
        height="70"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Rooftop structure */}
      <rect x="50" y="0" width="10" height="5" fill="none" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Windows grid - many floors */}
      {[10, 18, 26, 34, 42, 50, 58, 66].map((y) => (
        <g key={y}>
          <rect
            x="39"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.75}
          />
          <rect
            x="52"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.75}
          />
          <rect
            x="65"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.75}
          />
        </g>
      ))}

      {/* Entrance canopy */}
      <line x1="40" y1="70" x2="70" y2="70" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <rect x="48" y="70" width="14" height="5" fill="none" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Small adjacent building */}
      <rect
        x="80"
        y="50"
        width="20"
        height="25"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="84"
        y="55"
        width="5"
        height="4"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={0.75}
      />
      <rect
        x="91"
        y="55"
        width="5"
        height="4"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={0.75}
      />
      <rect
        x="84"
        y="63"
        width="5"
        height="4"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={0.75}
      />
      <rect
        x="91"
        y="63"
        width="5"
        height="4"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={0.75}
      />
    </svg>
  );
}

// Downtown skyscraper
function SkyscraperGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Main skyscraper */}
      <rect
        x="45"
        y="2"
        width="35"
        height="73"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Spire/antenna */}
      <line x1="62.5" y1="2" x2="62.5" y2="-5" stroke={STROKE_COLOR} strokeWidth={1} />
      <polygon points="59,2 62.5,-2 66,2" fill="none" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Window grid - many floors */}
      {[6, 14, 22, 30, 38, 46, 54, 62, 70].map((y) => (
        <g key={y}>
          <rect
            x="48"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
          <rect
            x="55"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
          <rect
            x="62"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
          <rect
            x="69"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
        </g>
      ))}

      {/* Shorter building behind/beside */}
      <rect
        x="10"
        y="35"
        width="25"
        height="40"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      {[40, 50, 60].map((y) => (
        <g key={y}>
          <rect
            x="14"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
          <rect
            x="25"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
        </g>
      ))}

      {/* Another building */}
      <rect
        x="90"
        y="45"
        width="20"
        height="30"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      {[50, 60].map((y) => (
        <g key={y}>
          <rect
            x="94"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
          <rect
            x="101"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
          />
        </g>
      ))}
    </svg>
  );
}

// Shopfront with apartments above
function ShopfrontGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Building */}
      <rect
        x="20"
        y="30"
        width="80"
        height="45"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Storefront windows - large */}
      <rect
        x="25"
        y="55"
        width="30"
        height="20"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <line x1="40" y1="55" x2="40" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Door */}
      <rect
        x="60"
        y="58"
        width="12"
        height="17"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Another storefront */}
      <rect
        x="77"
        y="55"
        width="18"
        height="20"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Awning */}
      <polyline
        points="25,55 27,50 53,50 55,55"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={1}
      />
      <polyline
        points="77,55 79,50 93,50 95,55"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={1}
      />

      {/* Upper floor windows */}
      {[35, 45].map((y) => (
        <g key={y}>
          <rect
            x="28"
            y={y}
            width="10"
            height="7"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="45"
            y={y}
            width="10"
            height="7"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="62"
            y={y}
            width="10"
            height="7"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="80"
            y={y}
            width="10"
            height="7"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

// Mixed-use mid-rise
function MixeduseGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Main building */}
      <rect
        x="15"
        y="15"
        width="50"
        height="60"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Ground floor retail */}
      <rect
        x="20"
        y="58"
        width="18"
        height="17"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="42"
        y="58"
        width="18"
        height="17"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Upper windows - residential */}
      {[20, 32, 44].map((y) => (
        <g key={y}>
          <rect
            x="20"
            y={y}
            width="8"
            height="8"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="36"
            y={y}
            width="8"
            height="8"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="52"
            y={y}
            width="8"
            height="8"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
        </g>
      ))}

      {/* Secondary building */}
      <rect
        x="70"
        y="30"
        width="35"
        height="45"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="75"
        y="60"
        width="12"
        height="15"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="90"
        y="60"
        width="10"
        height="15"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      {[35, 47].map((y) => (
        <g key={y}>
          <rect
            x="75"
            y={y}
            width="8"
            height="7"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
          <rect
            x="92"
            y={y}
            width="8"
            height="7"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

// Warehouse/industrial building
function WarehouseGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Main warehouse - wide and low */}
      <rect
        x="10"
        y="35"
        width="70"
        height="40"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Sawtooth roof */}
      <polyline
        points="10,35 25,25 25,35 45,25 45,35 65,25 65,35 80,35"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Large loading doors */}
      <rect
        x="20"
        y="50"
        width="18"
        height="25"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <line x1="29" y1="50" x2="29" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      <rect
        x="50"
        y="50"
        width="18"
        height="25"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <line x1="59" y1="50" x2="59" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Small windows */}
      <rect x="24" y="40" width="10" height="6" fill="none" stroke={STROKE_COLOR} strokeWidth={1} />
      <rect x="54" y="40" width="10" height="6" fill="none" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Smaller office/industrial building */}
      <rect
        x="85"
        y="45"
        width="25"
        height="30"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="90"
        y="60"
        width="15"
        height="15"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect x="90" y="50" width="6" height="6" fill="none" stroke={STROKE_COLOR} strokeWidth={1} />
      <rect x="99" y="50" width="6" height="6" fill="none" stroke={STROKE_COLOR} strokeWidth={1} />
    </svg>
  );
}

const BUILDING_COMPONENTS: Record<BuildingType, React.FC> = {
  house: HouseGraphic,
  townhouse: LowriseGraphic,
  lowrise: LowriseGraphic,
  midrise: MidriseGraphic,
  highrise: HighriseGraphic,
  skyscraper: SkyscraperGraphic,
  shopfront: ShopfrontGraphic,
  mixeduse: MixeduseGraphic,
  warehouse: WarehouseGraphic,
};

const BUILDING_LABELS: Record<BuildingType, string> = {
  house: 'Single-Family Homes, Duplexes & ADUs',
  townhouse: 'Townhouses & Small Apartments',
  lowrise: 'Townhouses & Low-Rise Apartments',
  midrise: 'Mid-Rise Apartments',
  highrise: 'High-Rise Apartments',
  skyscraper: 'Downtown Towers',
  shopfront: 'Shops With Apartments Above',
  mixeduse: 'Mixed-Use Buildings',
  warehouse: 'Industrial & Warehouse',
};

export function BuildingGraphic({ category, maxHeightFt, code, className }: BuildingGraphicProps) {
  const buildingType = getBuildingType(category, maxHeightFt, code);
  const BuildingComponent = BUILDING_COMPONENTS[buildingType];
  const label = BUILDING_LABELS[buildingType];

  return (
    <div className={`${className || ''}`}>
      <div className="h-16">
        <BuildingComponent />
      </div>
      <p className="text-xs text-[rgb(var(--text-secondary))] text-center mt-1">{label}</p>
    </div>
  );
}

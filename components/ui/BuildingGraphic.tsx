'use client';

import type { ZoneInfo } from '@/lib/zoning-info';

interface BuildingGraphicProps {
  category: ZoneInfo['category'];
  maxHeightFt: number;
  code: string;
  landmark?: LandmarkType | null;
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

type LandmarkType = 'space-needle';

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
const STROKE_WIDTH = 1.25;
const THIN_STROKE_WIDTH = 1;

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
        x="68"
        y="52"
        width="24"
        height="23"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <polyline
        points="66,52 80,40 94,52"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="74"
        y="60"
        width="12"
        height="10"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
    </svg>
  );
}

// Townhouses / small apartments - varied rooflines and stoops
function TownhouseGraphic() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />

      {/* Row of attached units */}
      {[10, 38, 66, 94].map((x, index) => (
        <g key={x}>
          <rect
            x={x}
            y={28}
            width={24}
            height={47}
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={STROKE_WIDTH}
          />
          {/* Alternating roofline */}
          {index % 2 === 0 ? (
            <polyline
              points={`${x - 2},28 ${x + 12},18 ${x + 26},28`}
              fill="none"
              stroke={STROKE_COLOR}
              strokeWidth={STROKE_WIDTH}
            />
          ) : (
            <line
              x1={x - 1}
              y1={28}
              x2={x + 25}
              y2={28}
              stroke={STROKE_COLOR}
              strokeWidth={STROKE_WIDTH}
            />
          )}
          {/* Door + window */}
          <rect
            x={x + 7}
            y={60}
            width={10}
            height={15}
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={STROKE_WIDTH}
          />
          <rect
            x={x + 6}
            y={40}
            width={12}
            height={10}
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
        </g>
      ))}
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
      {[33, 45, 57].map((y) => (
        <g key={y}>
          <rect
            x="14"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="28"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
        </g>
      ))}
      {/* Door */}
      <rect
        x="21"
        y="65"
        width="7"
        height="10"
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
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="63"
            y={y}
            width="8"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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
      {[33, 45, 57].map((y) => (
        <g key={y}>
          <rect
            x="84"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="98"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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

      {/* Windows grid - 5 floors */}
      {[16, 28, 40, 52].map((y) => (
        <g key={y}>
          <rect
            x="30"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="46"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="62"
            y={y}
            width="8"
            height="6"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
        </g>
      ))}

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
      <rect
        x="50"
        y="0"
        width="10"
        height="5"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
      />

      {/* Windows grid - many floors */}
      {[12, 22, 32, 42, 52, 62].map((y) => (
        <g key={y}>
          <rect
            x="39"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="52"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="65"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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
        strokeWidth={THIN_STROKE_WIDTH}
      />
      <rect
        x="91"
        y="55"
        width="5"
        height="4"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
      />
      <rect
        x="84"
        y="63"
        width="5"
        height="4"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
      />
      <rect
        x="91"
        y="63"
        width="5"
        height="4"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
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

      {/* Window grid - many floors */}
      {[8, 18, 28, 38, 48, 58, 68].map((y) => (
        <g key={y}>
          <rect
            x="48"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="55"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="62"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="69"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="25"
            y={y}
            width="6"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="101"
            y={y}
            width="5"
            height="5"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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

      {/* Awning */}
      <polyline
        points="25,55 27,50 53,50 55,55"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={1}
      />

      {/* Upper floor windows */}
      {[35].map((y) => (
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
      {[22, 36, 50].map((y) => (
        <g key={y}>
          <rect
            x="20"
            y={y}
            width="8"
            height="8"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="36"
            y={y}
            width="8"
            height="8"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="52"
            y={y}
            width="8"
            height="8"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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
        x="76"
        y="62"
        width="10"
        height="13"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="92"
        y="62"
        width="8"
        height="13"
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
            strokeWidth={THIN_STROKE_WIDTH}
          />
          <rect
            x="92"
            y={y}
            width="8"
            height="7"
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={THIN_STROKE_WIDTH}
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
      <rect
        x="24"
        y="40"
        width="10"
        height="6"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
      />
      <rect
        x="54"
        y="40"
        width="10"
        height="6"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
      />

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
      <rect
        x="90"
        y="50"
        width="6"
        height="6"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
      />
      <rect
        x="99"
        y="50"
        width="6"
        height="6"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={THIN_STROKE_WIDTH}
      />
    </svg>
  );
}

// Space Needle landmark (provided SVG with site colors)
function SpaceNeedleGraphic() {
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

const BUILDING_COMPONENTS: Record<BuildingType, React.FC> = {
  house: HouseGraphic,
  townhouse: TownhouseGraphic,
  lowrise: LowriseGraphic,
  midrise: MidriseGraphic,
  highrise: HighriseGraphic,
  skyscraper: SkyscraperGraphic,
  shopfront: ShopfrontGraphic,
  mixeduse: MixeduseGraphic,
  warehouse: WarehouseGraphic,
};

const LANDMARK_COMPONENTS: Record<LandmarkType, React.FC> = {
  'space-needle': SpaceNeedleGraphic,
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

const LANDMARK_LABELS: Record<LandmarkType, string> = {
  'space-needle': 'Space Needle',
};

export function BuildingGraphic({
  category,
  maxHeightFt,
  code,
  landmark,
  className,
}: BuildingGraphicProps) {
  const buildingType = getBuildingType(category, maxHeightFt, code);
  const hasLandmark = Boolean(landmark && LANDMARK_COMPONENTS[landmark]);
  const BuildingComponent = hasLandmark
    ? LANDMARK_COMPONENTS[landmark as LandmarkType]
    : BUILDING_COMPONENTS[buildingType];
  const label = hasLandmark
    ? LANDMARK_LABELS[landmark as LandmarkType]
    : BUILDING_LABELS[buildingType];

  return (
    <div className={`${className || ''}`}>
      <div className="h-16">
        <BuildingComponent />
      </div>
      <p className="text-xs text-text-secondary text-center mt-1">{label}</p>
    </div>
  );
}

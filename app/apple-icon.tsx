import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Space Needle icon built with divs (Satori-compatible)
function SpaceNeedleIcon({ iconSize = 100 }: { iconSize?: number }) {
  const scale = iconSize / 100;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Spire/top triangle */}
      <div
        style={{
          display: 'flex',
          width: 0,
          height: 0,
          borderLeft: `${10 * scale}px solid transparent`,
          borderRight: `${10 * scale}px solid transparent`,
          borderBottom: `${25 * scale}px solid #38BDF8`,
        }}
      />
      {/* Observation deck */}
      <div
        style={{
          display: 'flex',
          width: `${60 * scale}px`,
          height: `${9 * scale}px`,
          backgroundColor: '#38BDF8',
          borderRadius: `${5 * scale}px`,
        }}
      />
      {/* Shaft */}
      <div
        style={{
          display: 'flex',
          width: `${8 * scale}px`,
          height: `${70 * scale}px`,
          backgroundColor: '#38BDF8',
          borderRadius: `${4 * scale}px`,
        }}
      />
      {/* Base */}
      <div
        style={{
          display: 'flex',
          width: `${35 * scale}px`,
          height: `${10 * scale}px`,
          backgroundColor: '#38BDF8',
          borderRadius: `${5 * scale}px`,
          marginTop: `${-2 * scale}px`,
        }}
      />
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0F172A',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
      }}
    >
      <SpaceNeedleIcon iconSize={120} />
    </div>,
    {
      ...size,
    }
  );
}

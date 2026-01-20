import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Seattle Atlas - Seattle zoning, transit, and land use in one map';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Space Needle icon built with divs (Satori-compatible)
function SpaceNeedleIcon({ size = 200 }: { size?: number }) {
  const scale = size / 200;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: size,
        height: size * 1.4,
      }}
    >
      {/* Spire/top triangle */}
      <div
        style={{
          display: 'flex',
          width: 0,
          height: 0,
          borderLeft: `${20 * scale}px solid transparent`,
          borderRight: `${20 * scale}px solid transparent`,
          borderBottom: `${50 * scale}px solid #38BDF8`,
        }}
      />
      {/* Observation deck */}
      <div
        style={{
          display: 'flex',
          width: `${120 * scale}px`,
          height: `${18 * scale}px`,
          backgroundColor: '#38BDF8',
          borderRadius: `${9 * scale}px`,
        }}
      />
      {/* Shaft */}
      <div
        style={{
          display: 'flex',
          width: `${16 * scale}px`,
          height: `${140 * scale}px`,
          backgroundColor: '#38BDF8',
          borderRadius: `${8 * scale}px`,
        }}
      />
      {/* Base */}
      <div
        style={{
          display: 'flex',
          width: `${70 * scale}px`,
          height: `${20 * scale}px`,
          backgroundColor: '#38BDF8',
          borderRadius: `${10 * scale}px`,
          marginTop: `${-4 * scale}px`,
        }}
      />
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 100px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      }}
    >
      {/* Left side - Text content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: '#F8FAFC',
            marginBottom: '24px',
            lineHeight: 1.1,
          }}
        >
          Seattle Atlas
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#94A3B8',
            marginBottom: '48px',
            lineHeight: 1.5,
            maxWidth: '600px',
          }}
        >
          Seattle zoning, transit, and land use in one map
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#38BDF8',
            fontWeight: 600,
          }}
        >
          seattleatlas.org
        </div>
      </div>

      {/* Right side - Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '60px',
        }}
      >
        <SpaceNeedleIcon size={180} />
      </div>
    </div>,
    {
      ...size,
    }
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Seattle Atlas - Seattle zoning, transit, and land use in one map';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="512" height="512" rx="112" fill="#0F172A" />
          <path d="M256 92L300 188H212L256 92Z" fill="#38BDF8" />
          <rect x="236" y="188" width="40" height="192" rx="20" fill="#38BDF8" />
          <rect x="180" y="188" width="152" height="22" rx="11" fill="#38BDF8" />
          <rect x="212" y="372" width="88" height="26" rx="13" fill="#38BDF8" />
        </svg>
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#F8FAFC',
          marginBottom: '20px',
          lineHeight: 1.1,
        }}
      >
        Seattle Atlas
      </div>
      <div
        style={{
          fontSize: 36,
          color: '#94A3B8',
          marginBottom: '40px',
          lineHeight: 1.4,
        }}
      >
        Seattle zoning, transit, and land use in one map
      </div>
      <div
        style={{
          fontSize: 28,
          color: '#38BDF8',
          fontWeight: 600,
        }}
      >
        seattleatlas.org
      </div>
    </div>,
    {
      ...size,
    }
  );
}

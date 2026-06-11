import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Seattle Atlas - Seattle zoning, transit, and land use in one map';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Waterfront S brand icon (cobalt water + zoning parcels) with static colors for Satori
const iconSvg = `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#0B0C0E" />
  <rect x="150" y="80" width="278" height="142" rx="20" fill="#EF7036" />
  <rect x="150" y="240" width="278" height="90" rx="20" fill="#FFE9AE" />
  <rect x="150" y="348" width="278" height="84" rx="20" fill="#4E9D70" />
  <path d="M336 80C336 156 172 152 172 214C172 274 340 240 340 300C340 362 176 356 176 432L128 432Q84 432 84 388L84 124Q84 80 128 80Z" fill="#1D63ED" />
  <path d="M336 80C336 156 172 152 172 214C172 274 340 240 340 300C340 362 176 356 176 432" fill="none" stroke="#0B0C0E" stroke-width="48" stroke-linecap="round" />
</svg>`)}`;

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #0B0C0E 0%, #16181C 100%)',
        gap: '80px',
      }}
    >
      {/* Left side - Icon (larger for Twitter visibility) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={iconSvg} width={260} height={260} alt="" />
      </div>

      {/* Right side - Text content (bolder, simpler for Twitter) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: '#EDEFF3',
            marginBottom: '24px',
            lineHeight: 1.1,
          }}
        >
          Seattle Atlas
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#8B94A3',
            marginBottom: '32px',
            lineHeight: 1.4,
          }}
        >
          Zoning, transit & land use
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#5C95FF',
            fontWeight: 600,
          }}
        >
          seattleatlas.org
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}

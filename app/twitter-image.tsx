import { ImageResponse } from 'next/og';
import { BRAND_ICON_SVG } from '@/lib/brand-icon';

export const runtime = 'edge';

export const alt = 'Seattle Atlas - Seattle zoning, transit, and land use in one map';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const iconSvg = `data:image/svg+xml,${encodeURIComponent(BRAND_ICON_SVG)}`;

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

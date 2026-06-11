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
        justifyContent: 'space-between',
        padding: '80px 100px',
        background: 'linear-gradient(135deg, #0B0C0E 0%, #16181C 100%)',
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
            color: '#EDEFF3',
            marginBottom: '24px',
            lineHeight: 1.1,
          }}
        >
          Seattle Atlas
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#8B94A3',
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
            color: '#5C95FF',
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
        <img src={iconSvg} width={240} height={240} alt="" />
      </div>
    </div>,
    {
      ...size,
    }
  );
}

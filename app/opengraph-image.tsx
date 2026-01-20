import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Seattle Atlas - Seattle zoning, transit, and land use in one map';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Base64-encoded Space Needle SVG icon
const spaceNeedleSvg = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHJ4PSIxMTIiIGZpbGw9IiMwRjE3MkEiIC8+CiAgPHJlY3QgeD0iOTYiIHk9Ijk2IiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgcng9IjcyIiBzdHJva2U9IiMxRjI5MzciIHN0cm9rZS13aWR0aD0iMTAiIC8+CiAgPHBhdGggZD0iTTI1NiA5MkwzMDAgMTg4SDIxMkwyNTYgOTJaIiBmaWxsPSIjMzhCREY4IiAvPgogIDxyZWN0IHg9IjIzNiIgeT0iMTg4IiB3aWR0aD0iNDAiIGhlaWdodD0iMTkyIiByeD0iMjAiIGZpbGw9IiMzOEJERjgiIC8+CiAgPHJlY3QgeD0iMTgwIiB5PSIxODgiIHdpZHRoPSIxNTIiIGhlaWdodD0iMjIiIHJ4PSIxMSIgZmlsbD0iIzM4QkRGOCIgLz4KICA8cmVjdCB4PSIyMTIiIHk9IjM3MiIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjI2IiByeD0iMTMiIGZpbGw9IiMzOEJERjgiIC8+Cjwvc3ZnPg==`;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={spaceNeedleSvg} width={200} height={200} alt="" />
      </div>
    </div>,
    {
      ...size,
    }
  );
}

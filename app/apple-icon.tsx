import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Base64-encoded Space Needle SVG icon
const spaceNeedleSvg = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHJ4PSIxMTIiIGZpbGw9IiMwRjE3MkEiIC8+CiAgPHJlY3QgeD0iOTYiIHk9Ijk2IiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgcng9IjcyIiBzdHJva2U9IiMxRjI5MzciIHN0cm9rZS13aWR0aD0iMTAiIC8+CiAgPHBhdGggZD0iTTI1NiA5MkwzMDAgMTg4SDIxMkwyNTYgOTJaIiBmaWxsPSIjMzhCREY4IiAvPgogIDxyZWN0IHg9IjIzNiIgeT0iMTg4IiB3aWR0aD0iNDAiIGhlaWdodD0iMTkyIiByeD0iMjAiIGZpbGw9IiMzOEJERjgiIC8+CiAgPHJlY3QgeD0iMTgwIiB5PSIxODgiIHdpZHRoPSIxNTIiIGhlaWdodD0iMjIiIHJ4PSIxMSIgZmlsbD0iIzM4QkRGOCIgLz4KICA8cmVjdCB4PSIyMTIiIHk9IjM3MiIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjI2IiByeD0iMTMiIGZpbGw9IiMzOEJERjgiIC8+Cjwvc3ZnPg==`;

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={spaceNeedleSvg} width={160} height={160} alt="" />
    </div>,
    {
      ...size,
    }
  );
}

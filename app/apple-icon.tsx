import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Base64-encoded waterfront S SVG icon (cobalt water + zoning parcels, S in the negative space)
const iconSvg = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHJ4PSIxMTIiIGZpbGw9IiMwQjBDMEUiIC8+CiAgPHJlY3QgeD0iMTUwIiB5PSI4MCIgd2lkdGg9IjI3OCIgaGVpZ2h0PSIxNDIiIHJ4PSIyMCIgZmlsbD0iI0VGNzAzNiIgLz4KICA8cmVjdCB4PSIxNTAiIHk9IjI0MCIgd2lkdGg9IjI3OCIgaGVpZ2h0PSI5MCIgcng9IjIwIiBmaWxsPSIjRkZFOUFFIiAvPgogIDxyZWN0IHg9IjE1MCIgeT0iMzQ4IiB3aWR0aD0iMjc4IiBoZWlnaHQ9Ijg0IiByeD0iMjAiIGZpbGw9IiM0RTlENzAiIC8+CiAgPHBhdGggZD0iTTMzNiA4MEMzMzYgMTU2IDE3MiAxNTIgMTcyIDIxNEMxNzIgMjc0IDM0MCAyNDAgMzQwIDMwMEMzNDAgMzYyIDE3NiAzNTYgMTc2IDQzMkwxMjggNDMyUTg0IDQzMiA4NCAzODhMODQgMTI0UTg0IDgwIDEyOCA4MFoiIGZpbGw9IiMxRDYzRUQiIC8+CiAgPHBhdGggZD0iTTMzNiA4MEMzMzYgMTU2IDE3MiAxNTIgMTcyIDIxNEMxNzIgMjc0IDM0MCAyNDAgMzQwIDMwMEMzNDAgMzYyIDE3NiAzNTYgMTc2IDQzMiIgc3Ryb2tlPSIjMEIwQzBFIiBzdHJva2Utd2lkdGg9IjQ4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIC8+Cjwvc3ZnPgo=`;

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0B0C0E',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
      }}
    >
      <img src={iconSvg} width={180} height={180} alt="" />
    </div>,
    {
      ...size,
    }
  );
}

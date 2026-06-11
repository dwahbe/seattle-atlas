import { ImageResponse } from 'next/og';
import { BRAND_ICON_SVG } from '@/lib/brand-icon';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// The SVG draws its own rounded #0B0C0E tile, so the wrapper stays unstyled.
const iconSvg = `data:image/svg+xml;base64,${btoa(BRAND_ICON_SVG)}`;

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={iconSvg} width={180} height={180} alt="" />
    </div>,
    {
      ...size,
    }
  );
}

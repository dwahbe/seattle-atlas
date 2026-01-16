import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: '#0F172A',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
      }}
    >
      <svg
        width="140"
        height="140"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Needle top/spire */}
        <path d="M256 92L300 188H212L256 92Z" fill="#38BDF8" />
        {/* Needle shaft */}
        <rect x="236" y="188" width="40" height="192" rx="20" fill="#38BDF8" />
        {/* Observation deck */}
        <rect x="180" y="188" width="152" height="22" rx="11" fill="#38BDF8" />
        {/* Base */}
        <rect x="212" y="372" width="88" height="26" rx="13" fill="#38BDF8" />
      </svg>
    </div>,
    {
      ...size,
    }
  );
}

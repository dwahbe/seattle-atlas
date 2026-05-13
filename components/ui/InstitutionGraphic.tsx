'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { InstitutionInfo } from '@/lib/institutions';

interface InstitutionGraphicProps {
  institution: InstitutionInfo;
  className?: string;
  /**
   * 'block' (default) — full graphic with institution name below.
   * 'inline' — logo only, sized to sit beside a heading.
   */
  variant?: 'block' | 'inline';
}

// Maps an institution OVERLAY code to a bundled logo file in /public/institutions/.
// Swedish has one logo shared across its three campuses (FH/CH/B). Codes without
// an entry fall through to the category icon below.
const LOGOS: Record<string, string> = {
  'MIO-UW': '/institutions/mio-uw.png',
  'MIO-SU': '/institutions/mio-su.svg',
  'MIO-SPU': '/institutions/mio-spu.png',
  'MIO-NSC': '/institutions/mio-nsc.png',
  'MIO-SCC': '/institutions/mio-scc.png',
  'MIO-SSC': '/institutions/mio-ssc.png',
  'MIO-CH': '/institutions/mio-ch.png',
  'MIO-HBV': '/institutions/mio-hbv.png',
  'MIO-VMMC': '/institutions/mio-vmmc.webp',
  'MIO-NWH': '/institutions/mio-nwh.png',
  'MIO-KP': '/institutions/mio-kp.svg',
  'MIO-VA': '/institutions/mio-va.svg',
  'MIO-SMC-FH': '/institutions/mio-smc.png',
  'MIO-SMC-CH': '/institutions/mio-smc.png',
  'MIO-SMC-B': '/institutions/mio-smc.png',
};

const STROKE_COLOR = 'rgb(var(--text-primary))';
const STROKE_WIDTH = 1.25;

function UniversityIcon() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />
      <polyline
        points="40,32 60,22 80,32 60,42 40,32"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
      />
      <line x1="60" y1="42" x2="60" y2="55" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="50" y1="50" x2="70" y2="50" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="50" y1="50" x2="50" y2="60" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="70" y1="50" x2="70" y2="60" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="50" y1="60" x2="70" y2="60" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="80" y1="34" x2="80" y2="44" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <circle cx="80" cy="46" r="1.5" fill={STROKE_COLOR} />
    </svg>
  );
}

function CollegeIcon() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />
      <path
        d="M40,28 L80,28 L80,62 L40,62 Z"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <line x1="60" y1="28" x2="60" y2="62" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="46" y1="36" x2="55" y2="36" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="46" y1="42" x2="55" y2="42" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="46" y1="48" x2="55" y2="48" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="65" y1="36" x2="74" y2="36" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="65" y1="42" x2="74" y2="42" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <line x1="65" y1="48" x2="74" y2="48" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </svg>
  );
}

function HospitalIcon() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden="true">
      <line x1="0" y1="75" x2="120" y2="75" stroke={STROKE_COLOR} strokeWidth={1} />
      <rect
        x="38"
        y="22"
        width="44"
        height="40"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <line x1="60" y1="32" x2="60" y2="52" stroke={STROKE_COLOR} strokeWidth={2.5} />
      <line x1="50" y1="42" x2="70" y2="42" stroke={STROKE_COLOR} strokeWidth={2.5} />
      <rect
        x="44"
        y="56"
        width="6"
        height="6"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <rect
        x="70"
        y="56"
        width="6"
        height="6"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
    </svg>
  );
}

const ICONS = {
  university: UniversityIcon,
  college: CollegeIcon,
  hospital: HospitalIcon,
};

export function InstitutionGraphic({
  institution,
  className,
  variant = 'block',
}: InstitutionGraphicProps) {
  const logoSrc = LOGOS[institution.code];
  // If a bundled file fails to resolve at runtime (404 or decode error), fall
  // back to the category icon. This shouldn't happen with our bundled files
  // but covers cases where a file is renamed or removed.
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = logoSrc && !logoFailed;
  const Icon = ICONS[institution.category];

  if (variant === 'inline') {
    return (
      <div className={`h-10 w-16 shrink-0 flex items-center justify-end ${className || ''}`}>
        {showLogo ? (
          <Image
            src={logoSrc}
            alt={institution.name}
            width={120}
            height={64}
            className="h-full w-auto max-w-full object-contain"
            unoptimized
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <Icon />
        )}
      </div>
    );
  }

  return (
    <div className={className || ''}>
      <div className="h-16 flex items-center justify-center">
        {showLogo ? (
          <Image
            src={logoSrc}
            alt={institution.name}
            width={120}
            height={64}
            className="h-full w-auto max-w-full object-contain"
            unoptimized
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <Icon />
        )}
      </div>
      <p className="text-xs font-medium text-text-primary text-center mt-1">{institution.name}</p>
    </div>
  );
}

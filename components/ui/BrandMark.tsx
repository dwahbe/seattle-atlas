interface BrandMarkProps {
  /** Rendered width/height in px. */
  size?: number;
  className?: string;
}

/**
 * The Seattle Atlas brand mark — cobalt water and zoning-colored parcels with
 * an S-shaped channel of negative space between them. Mirrors app/icon.svg
 * and lib/brand-icon.ts; lib/__tests__/brand-icon.test.ts fails if the
 * copies drift. Decorative: always rendered next to the wordmark.
 */
export function BrandMark({ size = 24, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="512" height="512" rx="112" fill="#0B0C0E" />
      <rect x="150" y="80" width="278" height="142" rx="20" fill="#EF7036" />
      <rect x="150" y="240" width="278" height="90" rx="20" fill="#FFE9AE" />
      <rect x="150" y="348" width="278" height="84" rx="20" fill="#4E9D70" />
      <path
        d="M336 80C336 156 172 152 172 214C172 274 340 240 340 300C340 362 176 356 176 432L128 432Q84 432 84 388L84 124Q84 80 128 80Z"
        fill="#1D63ED"
      />
      <path
        d="M336 80C336 156 172 152 172 214C172 274 340 240 340 300C340 362 176 356 176 432"
        stroke="#0B0C0E"
        strokeWidth="48"
        strokeLinecap="round"
      />
    </svg>
  );
}

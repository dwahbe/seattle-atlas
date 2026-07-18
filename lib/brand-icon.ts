/**
 * Single source for the brand mark SVG (the "waterfront S"). Consumers that
 * import it: the apple-icon route and the social card baked by
 * scripts/generate-og-map.ts (re-run it after a brand tweak — the card PNG
 * is committed, not built). Two copies can't import it and are asserted
 * against it in lib/__tests__/brand-icon.test.ts instead: app/icon.svg
 * (must stay a real file for Next's metadata convention) and
 * components/ui/BrandMark.tsx (JSX). A brand tweak that misses one fails CI.
 */
export const BRAND_ICON_SVG = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#0B0C0E" />
  <rect x="150" y="80" width="278" height="142" rx="20" fill="#EF7036" />
  <rect x="150" y="240" width="278" height="90" rx="20" fill="#FFE9AE" />
  <rect x="150" y="348" width="278" height="84" rx="20" fill="#4E9D70" />
  <path d="M336 80C336 156 172 152 172 214C172 274 340 240 340 300C340 362 176 356 176 432L128 432Q84 432 84 388L84 124Q84 80 128 80Z" fill="#1D63ED" />
  <path d="M336 80C336 156 172 152 172 214C172 274 340 240 340 300C340 362 176 356 176 432" stroke="#0B0C0E" stroke-width="48" stroke-linecap="round" />
</svg>`;

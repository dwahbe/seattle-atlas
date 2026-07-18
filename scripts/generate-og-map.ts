/**
 * Render the social card (app/opengraph-image.png): the brand mark and
 * "Seattle Atlas" wordmark centered over the intro splash's aurora — soft
 * radial blobs of the simplified zoning palette on the light panel
 * background, mirroring components/ui/IntroHero.tsx so the card reads as
 * the first thing a visitor sees. Also writes app/opengraph-image.alt.txt
 * from OG_IMAGE (lib/og-image.ts), the single source for the card's URL,
 * dimensions, and alt text.
 *
 * Run: bun scripts/generate-og-map.ts
 *
 * Re-run (and commit the refreshed files) when the zoning legend palette
 * or the brand mark changes — the PNG is committed, not built.
 */
import { writeFile } from 'node:fs/promises';
import type { ReactElement } from 'react';
import { ImageResponse } from 'next/og';
import { getLegendCategories } from '../lib/layers';
import { BRAND_ICON_SVG } from '../lib/brand-icon';
import { OG_IMAGE } from '../lib/og-image';

const W = OG_IMAGE.width;
const H = OG_IMAGE.height;

/** Mirrors BLOB_LAYOUT in components/ui/IntroHero.tsx: same corner
 * placements, sizes as vmax fractions of the card's long edge, colored
 * i % palette in legend-category order, drawn at the splash's light-mode
 * 0.7 layer opacity. */
const BLOB_LAYOUT = [
  { top: -0.12 * H, left: -0.08 * W, size: 0.46 * W },
  { top: -0.18 * H, right: -0.1 * W, size: 0.42 * W },
  { bottom: -0.16 * H, left: 0.04 * W, size: 0.44 * W },
  { bottom: -0.2 * H, right: -0.06 * W, size: 0.4 * W },
  { top: 0.26 * H, left: -0.14 * W, size: 0.34 * W },
];

const palette = getLegendCategories('zoning').map((c) => c.color);
if (palette.length === 0) {
  console.error('zoning legend categories not found in data/layers.json');
  process.exit(1);
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** The wordmark uses the site's font (Instrument Sans, loaded in
 * app/layout.tsx via next/font). Satori needs raw font data, so fetch the
 * bold cut's TTF through the Google Fonts CSS endpoint (non-browser UAs are
 * served truetype URLs). */
async function loadInstrumentSansBold(): Promise<ArrayBuffer> {
  const cssRes = await fetch('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@700');
  if (!cssRes.ok) throw new Error(`Google Fonts CSS request failed: ${cssRes.status}`);
  const url = (await cssRes.text()).match(
    /src: url\((\S+?)\) format\('(?:truetype|opentype)'\)/
  )?.[1];
  if (!url)
    throw new Error('Could not resolve an Instrument Sans Bold truetype URL from Google Fonts');
  const fontRes = await fetch(url);
  if (!fontRes.ok) throw new Error(`Instrument Sans Bold download failed: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

// Satori accepts a plain {type, props} element tree, which keeps this file
// JSX-free; its TS types only declare the JSX form.
interface Node {
  type: string;
  props: Record<string, unknown>;
}

const blobs: Node[] = BLOB_LAYOUT.map((slot, i) => {
  const { size, ...offsets } = slot;
  const style: Record<string, unknown> = {
    position: 'absolute',
    width: size,
    height: size,
    // Approximates the splash's blur-[28px] softness with layered alpha
    // stops (satori has no blur filter).
    background:
      `radial-gradient(circle at 50% 50%, ${rgba(palette[i % palette.length], 0.85)} 0%, ` +
      `${rgba(palette[i % palette.length], 0.35)} 42%, ${rgba(palette[i % palette.length], 0)} 72%)`,
    display: 'flex',
  };
  for (const [side, value] of Object.entries(offsets)) {
    if (value !== undefined) style[side] = value;
  }
  return { type: 'div', props: { style } };
});

const card: Node = {
  type: 'div',
  props: {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: '#FFFFFF',
    },
    children: [
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: W,
            height: H,
            display: 'flex',
            opacity: 0.7,
          },
          children: blobs,
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: '34px' },
          children: [
            {
              type: 'img',
              props: {
                src: `data:image/svg+xml,${encodeURIComponent(BRAND_ICON_SVG)}`,
                width: 148,
                height: 148,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Instrument Sans',
                  fontSize: 92,
                  fontWeight: 700,
                  color: '#14171C',
                  display: 'flex',
                },
                children: 'Seattle Atlas',
              },
            },
          ],
        },
      },
    ],
  },
};

const image = new ImageResponse(card as unknown as ReactElement, {
  width: W,
  height: H,
  fonts: [
    { name: 'Instrument Sans', data: await loadInstrumentSansBold(), weight: 700, style: 'normal' },
  ],
});
const png = Buffer.from(await image.arrayBuffer());
await writeFile(new URL('../app/opengraph-image.png', import.meta.url), png);
// No trailing newline: next embeds the file's bytes verbatim in og:image:alt.
await writeFile(new URL('../app/opengraph-image.alt.txt', import.meta.url), OG_IMAGE.alt);
console.log(`Wrote app/opengraph-image.png (${(png.length / 1024).toFixed(0)} KB) + alt.txt`);

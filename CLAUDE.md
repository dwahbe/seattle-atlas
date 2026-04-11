# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seattle Atlas — an interactive map for exploring Seattle's zoning and transit data. Built with Next.js 16, React 19, Mapbox GL JS, and Tailwind CSS v4. Deployed on Vercel.

## Commands

- `bun dev` — start dev server (127.0.0.1)
- `bun run build` — production build
- `bun run lint` — ESLint (via `bunx`)
- `bun run format` — Prettier
- `bun test` — run all tests (Bun's built-in test runner)
- `bun test lib/__tests__/validation.test.ts` — run a single test file

## Tech Stack & Conventions

- **Next.js 16** with App Router. Uses `proxy.ts` at project root (not `middleware.ts`) for edge proxy — exported function must be named `proxy`.
- **React 19** — server components by default; add `'use client'` directive for client components.
- **Tailwind CSS v4** — theme tokens defined in `globals.css` via `@theme`. Use semantic classes (`text-text-primary`, `bg-panel-bg`, `border-border`), not raw `rgb(var(...))`.
- **Zod v4** — API route input validation via `lib/validation.ts`. Use `parseSearchParams()` helper; return consistent error shape `{ error, details: [{ field, message }] }` with 400 status.
- **nuqs** — all shareable UI state lives in URL query params, not React state.
- **Sonner** — toast notifications. Use `id` param to deduplicate.
- **vaul** — mobile drawer component.
- **mapbox-gl** — client-side only map rendering.
- **Prettier** — semicolons, single quotes, 2-space indent, trailing commas (ES5), 100 char width.
- **Bun** is the package manager.

## Architecture

### URL-Driven State

The URL is the source of truth for the map view. `useUrlState()` (via nuqs) syncs these query params:

- `lat`, `lng`, `z` — map position
- `layers` — comma-separated visible layer IDs
- `filters` — encoded filter expressions (`layerId.filterId:val1,val2`)
- `inspect` — inspected feature ID
- `compare` — compare mode toggle

Default center: Seattle (47.6062, -122.3321, zoom 12). Default layers: `zoning` + `parks_open_space` — parks is tied to the zoning toggle in `MapContainer.handleBaseLayerChange` and is not independently user-toggleable.

### Map & Layers

- Layer configuration lives in `/data/layers.json` — defines tileset sources, rendering type, paint/layout properties, filters, legends, and z-order.
- `MapContainer.tsx` is the main orchestrator (client component). It composes `MapGL`, `MapLayers`, panels, and controls.
- Feature-state expressions handle inspect highlighting (`HIGHLIGHT_COLOR = '#3B82F6'`).
- Layer groups (set per layer in `data/layers.json`): `base` (zoning + parks), `transit`, `planning`, `bike`.
- `zoning` and `zoning_detailed` are mutually exclusive (see `BASE_LAYER_IDS` in `lib/constants.ts`) — switch between them via `handleBaseLayerChange`, never by toggling individual layers.

### API Routes

`app/api/` holds server-side proxies for third-party data (parcel, permits, walkscore) — they exist to keep API keys server-side and bypass CORS. All follow the Zod validation convention above.

### Theming

Light/dark mode via `.dark` class on `<html>`. Design tokens are CSS custom properties (`--panel-bg`, `--text-primary`, `--accent`, etc.) mapped to Tailwind utilities in `globals.css`. Theme preference stored in localStorage (`civic-atlas-theme`); read before hydration to prevent flash.

## Environment Variables

- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox access token (public, required)
- `WALKSCORE_API_KEY` — Walk Score API key (server-side only)
- `NEXT_PUBLIC_SITE_URL` — optional site URL override for metadata

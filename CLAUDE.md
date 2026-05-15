# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seattle Atlas — an interactive map for exploring Seattle's zoning and transit data. Built with Next.js 16, React 19, Mapbox GL JS, and Tailwind CSS v4. Deployed on Vercel. Beyond the map at `/`, it ships SEO/marketing pages (`/about`, `/seattle-zoning`) and generated social/icon images.

## Commands

- `bun dev` — start dev server (127.0.0.1)
- `bun run build` — production build
- `bun run lint` — ESLint (via `bunx`)
- `bun run format` — Prettier
- `bun test` — run all tests (Bun's built-in test runner)
- `bun test lib/__tests__/validation.test.ts` — run a single test file

## Tech Stack & Conventions

- **Next.js 16** with App Router. No `proxy.ts` / `middleware.ts` — server-side work happens in `app/api/*/route.ts` handlers.
- **React 19** — server components by default; add `'use client'` for client components. Browser-state hooks (`useTheme`, `useMediaQuery`, `useIsMounted`) use `useSyncExternalStore` with explicit server snapshots to avoid hydration flashes; new hooks reading `localStorage` / `matchMedia` should follow this pattern. Prefer the "setState during render" pattern over `useEffect` for prop-derived state resets (see `useInspectData.ts`, `MobileDrawer.tsx`).
- **Tailwind CSS v4** — theme tokens defined in `globals.css` via `@theme`. Use semantic classes (`text-text-primary`, `bg-panel-bg`, `border-border`), not raw `rgb(var(...))`. **Touch-target gotcha:** a global `@media (hover: none) and (pointer: coarse)` rule in `globals.css` forces `min-height/min-width: 44px` on every `button`, `a`, and `[role="button"]`. This applies on touch devices only, so it silently inflates layout on mobile but not desktop. Fine-print / inline links (e.g. attributions) must add the `.touch-target-inline` escape-hatch class (also defined in that block) to opt out.
- **Zod v4** — API route input validation via `lib/validation.ts`. Use `parseSearchParams()` helper; return consistent error shape `{ error, details: [{ field, message }] }` with 400 status.
- **nuqs** — all shareable UI state lives in URL query params, not React state.
- **Sonner** — toast notifications. Use `id` param to deduplicate.
- **vaul** — mobile bottom-sheet drawer (see Mobile Drawer below — has load-bearing constraints).
- **mapbox-gl** — client-side only map rendering.
- **@tabler/icons-react** — the icon standard. Do not add inline `<svg>` for UI icons; inline SVG survives only in illustrative graphics (`BuildingGraphic`, `InstitutionGraphic`, `Donut`).
- **react-share** — social share UI, via `components/inspect/SharePopover.tsx` (wired into `InspectHeader`).
- **Prettier** — semicolons, single quotes, 2-space indent, trailing commas (ES5), 100 char width.
- **ESLint** — `react-hooks/set-state-in-effect` is intentionally downgraded to `warn`; setState in effects is used deliberately for data fetching and state resets.
- **Bun** is the package manager; tests use Bun's built-in `bun:test` runner.

## UI Copy

**Title Case for all labels.** Buttons, headings, panel/section titles, layer names, legend categories, menu items, toggle labels and descriptions, placeholders, tooltips, and `aria-label` attributes all use Title Case (e.g. `"What Can Be Built"`, `"Bus & Light Rail Routes"`, `"Close Panel"`, `"More Information"`). Lowercase short articles, prepositions, and conjunctions (`a`, `an`, `the`, `and`, `or`, `but`, `of`, `in`, `on`, `at`, `to`, `for`) unless they're the first word — e.g. `"Back to Layers"`.

**Sentence case only for full sentences.** Toast notifications, multi-sentence aria descriptions (`"Current theme: dark. Click to toggle."`), and status text (`"Loading..."`) are sentences, not labels — keep these in sentence case.

## Typography Scale

The standalone content/utility pages (`/about`, `/seattle-zoning`, `error.tsx`, `not-found.tsx`, `loading.tsx`) share one type scale. Match it when adding pages or sections — don't introduce one-off sizes.

| Role | Class | Notes |
| --- | --- | --- |
| Article page title (`h1`) | `text-3xl sm:text-4xl font-bold` | `/about`, `/seattle-zoning` — inside `<header className="mb-8 border-b border-border pb-8">` with the lede; the rule separates the standfirst from the body |
| Utility page title (`h1`) | `text-3xl font-bold` | Centered status cards (`error.tsx`, `not-found.tsx`); intentionally no `sm:` bump |
| Lede / deck | `text-lg text-text-secondary` | The single intro line directly under the `h1`, inside the `<header>` |
| Section heading (`h2`) | `text-xl font-semibold` | |
| Subheading (`h3`) | `font-medium` | Base 16px — do not add a size class |
| Body | (none) | Base 16px |
| Supporting text (captions, source/citation lists, FAQ answers, disclaimers) | `text-sm` | |

Buttons get their text size from `Button.tsx` (`sm` 12 / `md` 14 / `lg` 16px) — use the `Button` component, don't hand-roll button-styled links.

## Project Structure

- `components/` is grouped by surface: `map/` (MapGL, MapLayers, MapContainer orchestrator), `mobile/` (MobileDrawer), `panels/` (desktop ControlPanel/InspectPanel), `controls/` (Legend), `inspect/` (shared inspect sections), `search/` (CommandPalette), `ui/` (primitives, barrel-exported via `components/ui/index.ts`).
- **Inspect sections are shared between desktop and mobile** via a `compact` prop (`components/inspect/*`, barrel `components/inspect/index.ts`) — don't fork them per platform. Exception: `WalkScoreSection` takes no `compact` prop — it renders one intrinsically responsive layout (fixed donut size) identically on both surfaces.
- `hooks/` (barrel `hooks/index.ts`): `useUrlState` (URL ⇄ state), `useMapState`, `useLayers`, `useInspect`, `useInspectData` (inspect data fetching), `useTheme`, `useMediaQuery`/`useIsMobile`, `useIsMounted` (standard SSR/client-only & portal gate). `useFocusTrap` exists but is not in the barrel.
- `data/` static datasets: `layers.json` (layer config), `proposals.json`, `parks-stats.json`, `neighborhoods.ts`, `seattle-parks-clean.geojson`.

## Architecture

### URL-Driven State

The URL is the source of truth for the map view. `useUrlState()` (via nuqs) syncs these query params (canonical list: `MAP_STATE_PARAMS` in `lib/url-state.ts`):

- `lat`, `lng`, `z` — map position
- `layers` — comma-separated visible layer IDs
- `filters` — encoded filter expressions (`layerId.filterId:val1,val2`)
- `inspect` — inspected feature ID
- `compare` — compare mode toggle

Default center: Seattle (47.6062, -122.3321, zoom 12) and default layers `['zoning', 'parks_open_space', 'institutions']` are `SEATTLE_CENTER` / `DEFAULT_LAYERS` in `lib/url-state.ts`. Parks and the institutions overlay both ride along with the zoning toggle in `MapContainer.handleBaseLayerChange` and are not independently user-toggleable.

**Sync constraint:** the pre-hydration inline script in `app/layout.tsx` hand-mirrors `MAP_STATE_PARAMS` as a literal `mapKeys` array (it can't import). If you change `MAP_STATE_PARAMS`, update that array too (it's already commented as a mirror).

### Routes

- `/` — the map (`app/page.tsx`).
- `/about` — data sources / methodology (SEO page with JSON-LD).
- `/seattle-zoning` — zoning explainer (uses `[n]` footnote + JSON-LD/FAQ pattern).
- Cross-page navigation lives in `components/ui/NavMenu.tsx`.
- Generated: `opengraph-image.tsx`, `twitter-image.tsx`, `apple-icon.tsx`, `icon.svg`, `sitemap.ts`, `robots.ts`; plus `error.tsx`, `not-found.tsx`, `loading.tsx`.

### Map & Layers

- Layer configuration lives in `/data/layers.json` — defines tileset sources, rendering type, paint/layout properties, filters, legends, and z-order.
- `MapContainer.tsx` is the main orchestrator (client component). It composes `MapGL`, `MapLayers`, panels, and controls.
- Feature-state expressions handle inspect highlighting (`HIGHLIGHT_COLOR = '#3B82F6'` in `lib/constants.ts`).
- Layer groups (set per layer in `data/layers.json`): `base` (zoning + parks + institutions overlay), `transit` (routes + stops + light rail, bundled together via `TRANSIT_LAYER_IDS` in `lib/constants.ts`), `bike`.
- `zoning` and `zoning_detailed` are mutually exclusive (see `BASE_LAYER_IDS` in `lib/constants.ts`) — switch between them via `handleBaseLayerChange`, never by toggling individual layers.
- Both `zoning` (simplified) and `zoning_detailed` (technical) layers read `ZONELUT` from the same tileset. The simplified layer maps zone codes to 6 categories client-side via the legend config in `layers.json`; the technical layer maps each code to its own color. Adding or renaming simplified categories is a code-only change (no tileset re-upload).
- **The `Legend` doubles as the zoning filter UI**: clicking a legend row filters that zoning layer. `interactiveLayerIds` / `onFilterToggle` map rows to `ZONING_FILTER_IDS` (`lib/constants.ts`).
- `lib/zoning-info.ts` contains per-zone-code data including `allowedUses` / `notAllowedUses` arrays, rendered by the `AllowedUses` component in the inspect panel.
- The `institutions` layer is a silent enrichment source (fill-opacity 0, empty legend, no controls toggle). `MapGL.handleClick` runs a secondary `queryRenderedFeatures` against it and attaches matched institution data to the inspected feature, which `ZoningSummary` then uses to swap the building graphic for the institution's logo + name. Canonical data + logo lookup live in `lib/institutions.ts` and `components/ui/InstitutionGraphic.tsx`. Logos are bundled in `public/institutions/{lowercase-code}.{ext}` keyed on the tileset's `OVERLAY` code (e.g. `mio-uw.png`); codes without a logo fall back to a category icon (university/college/hospital). Swedish's three campuses share one logo file.

### Mobile Drawer

`components/mobile/MobileDrawer.tsx` is a vaul bottom sheet with three detents. These constraints are load-bearing — breaking them regresses scrolling, positioning, or layout:

- `SNAP_POINTS = [0.15, 0.5, 1]`; the **last must be `1`** — vaul only enables internal content scrolling at the topmost snap point.
- The active detent is tracked by **index** (`snapIndex`), not by snap value, so it survives content/mode changes.
- `Drawer.Content` **must be `h-full`** (with `max-h-[92dvh]`). vaul's snap positioning reveals the bottom N of a viewport-tall, bottom-anchored sheet; a content-hugged box gets mis-translated off-screen.
- The scroll container **toggles `overflow-y-auto` (full detent) vs `overflow-hidden` (lower detents)** — at non-top detents a drag must move the sheet between detents, not scroll content. Toggling overflow is layout-neutral (no reflow).
- The controls footer is pinned flush to the sheet bottom via `min-h-full` + a `flex-1` spacer, so short content reads as a bottom toolbar instead of leaving whitespace.
- Controls and inspect modes share **one** scroll container; its `scrollTop` is reset on mode swap via a `useLayoutEffect`.

### Intro Splash & Onboarding

- `components/ui/IntroHero.tsx` is a full-screen splash over the map (non-gating — the map mounts behind it). It self-skips when `atlas-intro-seen === '1'` or any map-state query param is present (deep links). The `app/layout.tsx` inline script adds `html.intro-seen` pre-hydration so CSS can hide it without a flash (`globals.css` `html.intro-seen #intro-hero`).
- `components/ui/OnboardingTour.tsx` is desktop-only, `dynamic()`-imported in `MapContainer`, gated on `!isMobile` and `atlas-onboarding-seen`.

### API Routes

`app/api/` holds server-side proxies for third-party data (`parcel`, `permits`, `walkscore`) — they exist to keep API keys server-side and bypass CORS. All follow the Zod `parseSearchParams` validation convention above.

### Storage & Theming

- **Touch `localStorage` only via `lib/storage.ts`** (`getStoredItem` / `setStoredItem`) — these swallow private-mode / quota exceptions. Exceptions that intentionally use raw `localStorage`: `useTheme` and the `app/layout.tsx` pre-hydration script. Keys: `civic-atlas-theme`, `atlas-intro-seen`, `atlas-onboarding-seen`.
- Light/dark mode via `.dark` class on `<html>`. Design tokens are CSS custom properties (`--panel-bg`, `--text-primary`, `--accent`, etc.) mapped to Tailwind utilities in `globals.css`. Theme preference stored in `localStorage` (`civic-atlas-theme`).
- **Pre-hydration handling** (easy to break, preserve when editing theme or map init): an inline script in `app/layout.tsx` sets `.dark` (and `intro-seen`) before React hydrates to prevent a flash. `MapGL.tsx` reads `document.documentElement.classList.contains('dark')` on mount instead of the `isDark` prop, because `useSyncExternalStore` returns the server snapshot on first render and would otherwise trigger a visible Mapbox style swap.

## Environment Variables

- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox access token (public, required)
- `WALKSCORE_API_KEY` — Walk Score API key (server-side only)
- `NEXT_PUBLIC_SITE_URL` — optional site URL override for metadata; falls back to `NEXT_PUBLIC_VERCEL_URL` (Vercel-injected) then a hardcoded default in `app/layout.tsx`, `robots.ts`, `sitemap.ts`

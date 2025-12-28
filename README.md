# Civic Atlas – Seattle

An interactive zoning, transit, and fiscal atlas for Seattle. Explore what can be built where, what changes are proposed, and what transit serves each area.

## Project Structure

```
atlas/
├── app/                    # Next.js App Router pages
│   ├── map/               # Main map view
│   ├── methodology/       # Data methodology page
│   └── about/             # About page
├── components/
│   ├── map/               # Map components (MapGL, MapLayers, etc.)
│   ├── panels/            # Panel components (Control, Inspect, Share)
│   ├── controls/          # Layer controls (Toggle, Filter, Legend)
│   ├── search/            # Search components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configs
├── data/                  # JSON data files
│   ├── layers.json        # Layer configurations
│   └── proposals.json     # Proposal metadata
└── types/                 # TypeScript type definitions
```

## Features

- **Interactive Map**: Full-screen Mapbox GL map with pan, zoom, and rotation
- **Layer Management**: Toggle layers, filter data, and view legends
- **Feature Inspection**: Click any feature to see detailed properties and related proposals
- **Search**: Find addresses and neighborhoods using Mapbox Geocoding
- **Shareable URLs**: Every map state generates a unique URL
- **Dark/Light Mode**: Automatic theme detection with manual override
- **Responsive Design**: Works on desktop and mobile devices

## Data Configuration

### Adding Layers

Edit `data/layers.json` to add new map layers. Each layer requires:

```json
{
  "id": "unique-layer-id",
  "name": "Display Name",
  "group": "base|transit|proposals|derived",
  "tileset": "mapbox://username.tileset-id",
  "sourceLayer": "layer-name-in-tileset",
  "type": "fill|line|circle|symbol",
  "defaultVisible": true,
  "legend": [{ "label": "Category", "color": "#hex", "value": "data-value" }],
  "source": "Data source attribution",
  "updated": "2025-01-01"
}
```

### Adding Proposals

Edit `data/proposals.json` to add tracked proposals:

```json
{
  "id": "proposal-id",
  "name": "Proposal Name",
  "status": "Draft|Public Comment|Under Review|Adopted|Rejected",
  "summary": "Brief description...",
  "links": [{ "title": "Link Text", "url": "https://..." }],
  "layers": ["related-layer-ids"],
  "jurisdiction": "City of Seattle"
}
```

## URL Parameters

The map state is fully serialized in the URL:

| Parameter | Description                     | Example                  |
| --------- | ------------------------------- | ------------------------ |
| `lat`     | Latitude                        | `47.6062`                |
| `lng`     | Longitude                       | `-122.3321`              |
| `z`       | Zoom level                      | `12`                     |
| `layers`  | Active layers (comma-separated) | `zoning,transit_stops`   |
| `filters` | Active filters                  | `zoning.zone_type:SF,MF` |
| `inspect` | Inspected feature ID            | `parcel_123`             |
| `compare` | Compare mode enabled            | `true`                   |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable
4. Deploy

### Other Platforms

```bash
bun run build
bun start
```

## Scripts

| Command            | Description               |
| ------------------ | ------------------------- |
| `bun dev`          | Start development server  |
| `bun build`        | Build for production      |
| `bun start`        | Start production server   |
| `bun lint`         | Run ESLint                |
| `bun format`       | Format code with Prettier |
| `bun format:check` | Check formatting          |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Maps**: Mapbox GL JS
- **State**: URL-based state with nuqs
- **Deployment**: Vercel

## License

MIT

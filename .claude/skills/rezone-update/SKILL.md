---
name: rezone-update
description: Update Seattle Atlas zoning data after the city adopts One Seattle Plan rezones (Centers & Corridors or the later regional-center legislation) — re-export the tileset, re-verify valueOverrides, update heights/FARs and proposals, and regenerate the static map style and social card.
---

# Rezone Update Checklist

Context: the One Seattle Plan "Centers & Corridors" legislation (transmitted to Council Jan 2026) and the later regional-center rezones (Downtown, U District, Northgate, etc.) will change LR/MR standards and rezone SM/NC areas. When either is adopted, run this checklist:

1. Re-export the city's "Current Land Use Zoning Detail" dataset to the Mapbox tileset.
2. Re-verify `valueOverrides.matchValues` in `data/layers.json` against the dataset's distinct `ZONING` values (ArcGIS REST query on the `Current_Land_Use_Zoning_Detail_2` FeatureServer). The `matchValues` strings must byte-match the tileset's `ZONING` values; `lib/__tests__/mapbox.test.ts` asserts each parses to a ≥240 ft SM designation.
3. Update heights/FARs in `lib/zoning-info.ts` and the proposal entries in `data/proposals.json`.
4. Re-run `bun scripts/generate-static-map-style.ts`, then `bun scripts/upload-static-map-style.ts` to push the style to Studio in place (the style id, `STATIC_MAP_STYLE`, does not change).
5. Re-run `bun scripts/generate-og-map.ts` to refresh the social-card render, and commit the PNG.

import type mapboxgl from 'mapbox-gl';
import type { LayerConfig, LegendItem } from '@/types';

/**
 * Pure builders for the data-driven Mapbox style expressions, plus the
 * JS-side legend resolver that mirrors their precedence. Shared by the
 * client map (lib/mapbox.ts), the static-map style generator
 * (scripts/generate-static-map-style.ts), and HoverTooltip — all
 * valueOverrides semantics live here so the GL and JS paths cannot drift.
 *
 * Must stay free of browser and mapbox-gl runtime imports so scripts and
 * tests can run it under Bun (the mapbox-gl import above is type-only).
 */

// Build a Mapbox expression for data-driven coloring
export function buildColorExpression(layer: LayerConfig): mapboxgl.Expression | string {
  // If colorProperty is specified but no legend, use the property value directly
  // This enables data-driven coloring from GeoJSON properties (e.g., transit route colors)
  if (layer.colorProperty && layer.legend.length === 0) {
    return ['get', layer.colorProperty] as mapboxgl.Expression;
  }

  if (layer.legend.length === 0) {
    // Use paint fill-color/line-color if specified, otherwise default
    return (
      (layer.paint?.['fill-color'] as string) ||
      (layer.paint?.['line-color'] as string) ||
      '#888888'
    );
  }

  if (layer.legend.length === 1) {
    return layer.legend[0].color;
  }

  // Use colorProperty if specified, otherwise try to infer from layer config
  const propertyName = layer.colorProperty || 'ZONELUT';

  const overrides = layer.valueOverrides ?? [];
  const overrideValues = new Set(overrides.map((o) => o.value));

  const matchExpression: mapboxgl.Expression = ['match', ['get', propertyName]];

  for (const item of layer.legend) {
    // Pseudo values (e.g. SM_HIGHRISE) match a different property — handled
    // by the case wrapper below, not the colorProperty match.
    if (overrideValues.has(item.value)) continue;
    matchExpression.push(item.value, item.color);
  }

  // Default color for unmatched values
  matchExpression.push('#9CA3AF');

  if (overrides.length === 0) {
    return matchExpression;
  }

  // Overrides take precedence over the base match, so e.g. tower-zoned SM
  // polygons color as Downtown & Highrise while ZONELUT still reads "SM".
  const caseExpression: mapboxgl.Expression = ['case'];
  for (const override of overrides) {
    const item = layer.legend.find((i) => i.value === override.value);
    if (!item) continue;
    caseExpression.push(
      ['in', ['get', override.property], ['literal', override.matchValues]],
      item.color
    );
  }
  // A 'case' needs at least one condition/output pair. If every override
  // points at a missing legend row (config drift), fall back to the base
  // match instead of emitting an expression Mapbox would reject.
  if (caseExpression.length === 1) {
    return matchExpression;
  }
  caseExpression.push(matchExpression);
  return caseExpression;
}

// Build filter expression from filter state
export function buildFilterExpression(
  layer: LayerConfig,
  filterState: Record<string, string[]>
): mapboxgl.Expression | null {
  if (!layer.filters || Object.keys(filterState).length === 0) {
    return null;
  }

  const conditions: mapboxgl.Expression[] = [];
  const overrides = layer.valueOverrides ?? [];

  for (const filter of layer.filters) {
    const values = filterState[filter.id];
    if (!values || values.length === 0) continue;

    // Only overrides offered by this filter's options participate; a pseudo
    // value like SM_HIGHRISE must not leak carve-outs into unrelated filters
    // on the same layer.
    const filterOverrides = overrides.filter((o) =>
      (filter.options ?? []).some((opt) => opt.value === o.value)
    );
    const overrideByValue = new Map(filterOverrides.map((o) => [o.value, o]));

    const plainValues = values.filter((v) => !overrideByValue.has(v));
    const selectedOverrides = values.flatMap((v) => overrideByValue.get(v) ?? []);

    const orConditions: mapboxgl.Expression[] = [];

    if (plainValues.length > 0) {
      // Build "in" expression for multiselect
      let inExpression: mapboxgl.Expression = [
        'in',
        ['get', filter.property],
        ['literal', plainValues],
      ];
      // Features claimed by an unselected override (e.g. tower-zoned SM)
      // must not ride along with their base value — keep filtering
      // consistent with the legend coloring. Selected overrides already
      // match via their own positive condition ((A && !B) || B === A || B),
      // so their carve-out is dropped.
      const unselectedOverrides = filterOverrides.filter((o) => !values.includes(o.value));
      if (unselectedOverrides.length > 0) {
        inExpression = [
          'all',
          inExpression,
          ...unselectedOverrides.map(
            (o): mapboxgl.Expression => [
              '!',
              ['in', ['get', o.property], ['literal', o.matchValues]],
            ]
          ),
        ];
      }
      orConditions.push(inExpression);
    }

    for (const override of selectedOverrides) {
      orConditions.push(['in', ['get', override.property], ['literal', override.matchValues]]);
    }

    if (orConditions.length === 1) {
      conditions.push(orConditions[0]);
    } else if (orConditions.length > 1) {
      conditions.push(['any', ...orConditions]);
    }
  }

  if (conditions.length === 0) {
    return null;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return ['all', ...conditions];
}

/**
 * Resolve the legend item a feature's properties color to — the JS-side
 * mirror of buildColorExpression's precedence (valueOverrides win over the
 * colorProperty lookup, e.g. tower-zoned SM → Downtown & Highrise).
 */
export function resolveLegendItem(
  layer: LayerConfig,
  properties: Record<string, unknown>
): LegendItem | null {
  const matchedOverride = (layer.valueOverrides ?? []).find((override) => {
    const overrideValue = properties[override.property];
    return typeof overrideValue === 'string' && override.matchValues.includes(overrideValue);
  });
  if (matchedOverride) {
    return layer.legend.find((item) => item.value === matchedOverride.value) ?? null;
  }

  const value = properties[layer.colorProperty ?? 'ZONELUT'];
  if (typeof value !== 'string') return null;
  return layer.legend.find((item) => item.value === value) ?? null;
}

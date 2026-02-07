'use client';

import type { InspectedFeature } from '@/types';

interface TransitInfoProps {
  feature: InspectedFeature;
  /** Compact mode for mobile */
  compact?: boolean;
}

export function TransitInfo({ feature, compact = false }: TransitInfoProps) {
  const props = feature.properties;
  const headingClass = compact
    ? 'text-base font-semibold text-text-primary mb-1'
    : 'text-lg font-semibold text-text-primary mb-2';

  // Transit stop
  if (feature.layerId === 'transit_stops') {
    return (
      <div>
        <h3 className={headingClass}>{String(props.stop_name || 'Transit Stop')}</h3>
        {props.routes != null && (
          <p className="text-sm text-text-secondary">
            Routes: {String(props.routes)}
          </p>
        )}
      </div>
    );
  }

  // Transit route
  if (feature.layerId === 'transit_routes') {
    return (
      <div>
        <h3 className={headingClass}>
          Route {String(props.route_short_name || props.route_id || '')}
        </h3>
        {props.route_long_name != null && (
          <p className="text-sm text-text-secondary">
            {String(props.route_long_name)}
          </p>
        )}
        {props.agency_name != null && (
          <p className="text-xs text-text-tertiary mt-1">
            {String(props.agency_name)}
          </p>
        )}
      </div>
    );
  }

  return null;
}

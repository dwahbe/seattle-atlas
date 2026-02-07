'use client';

import type { InspectedFeature } from '@/types';
import { getDisplayProperties } from '@/lib/property-display';

interface RawPropertiesProps {
  feature: InspectedFeature;
  /** Compact mode for mobile - grid layout, limited items */
  compact?: boolean;
}

export function RawProperties({ feature, compact = false }: RawPropertiesProps) {
  const properties = getDisplayProperties(feature.layerId, feature.properties);
  const displayProperties = compact ? properties.slice(0, 8) : properties;

  if (compact) {
    return (
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {displayProperties.map(({ key, label, value }) => (
          <div key={key}>
            <dt className="text-xs text-text-secondary truncate">{label}</dt>
            <dd className="text-sm font-medium text-text-primary truncate">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="space-y-2">
      {displayProperties.map(({ key, label, value }) => (
        <div key={key} className="flex justify-between gap-4">
          <dt className="text-sm text-text-secondary">{label}</dt>
          <dd className="text-sm font-medium text-text-primary text-right truncate max-w-[60%]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

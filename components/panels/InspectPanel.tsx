'use client';

import type { InspectedFeature, Proposal, LayerConfig } from '@/types';

interface InspectPanelProps {
  feature: InspectedFeature | null;
  proposals: Proposal[];
  onClose: () => void;
  isOpen: boolean;
  layerConfigs: LayerConfig[];
}

export function InspectPanel({
  feature,
  proposals,
  onClose,
  isOpen,
  layerConfigs,
}: InspectPanelProps) {
  if (!isOpen || !feature) return null;

  const layerConfig = layerConfigs.find((l) => l.id === feature.layerId);
  const layerName = layerConfig?.name || feature.layerId;

  // Find related proposals
  const relatedProposals = proposals.filter((p) => p.layers.includes(feature.layerId));

  // Format property values for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Get key properties to display
  const propertyEntries = Object.entries(feature.properties)
    .filter(([key]) => !key.startsWith('_') && key !== 'id')
    .slice(0, 12);

  return (
    <div
      className={`
        absolute right-0 top-0 bottom-0 w-96 z-10
        bg-[rgb(var(--panel-bg))] 
        border-l border-[rgb(var(--border-color))]
        shadow-lg
        transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 border-b border-[rgb(var(--border-color))]">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--accent))]">
            {layerName}
          </div>
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mt-1">
            Feature Details
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[rgb(var(--secondary-bg))] rounded-md transition-colors"
          aria-label="Close panel"
        >
          <svg
            className="w-5 h-5 text-[rgb(var(--text-secondary))]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Properties */}
        <div className="p-4 border-b border-[rgb(var(--border-color))]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
            Properties
          </h3>
          <dl className="space-y-2">
            {propertyEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <dt className="text-sm text-[rgb(var(--text-secondary))] capitalize">
                  {key.replace(/_/g, ' ')}
                </dt>
                <dd className="text-sm font-medium text-[rgb(var(--text-primary))] text-right truncate max-w-[60%]">
                  {formatValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Layer info */}
        {layerConfig && (
          <div className="p-4 border-b border-[rgb(var(--border-color))]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
              Layer Information
            </h3>
            <div className="space-y-2 text-sm">
              {layerConfig.description && (
                <p className="text-[rgb(var(--text-secondary))]">{layerConfig.description}</p>
              )}
              <div className="flex justify-between">
                <span className="text-[rgb(var(--text-secondary))]">Source</span>
                <span className="text-[rgb(var(--text-primary))]">{layerConfig.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--text-secondary))]">Last Updated</span>
                <span className="text-[rgb(var(--text-primary))]">{layerConfig.updated}</span>
              </div>
            </div>
          </div>
        )}

        {/* Related proposals */}
        {relatedProposals.length > 0 && (
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
              Related Proposals
            </h3>
            <div className="space-y-3">
              {relatedProposals.map((proposal) => (
                <div key={proposal.id} className="p-3 bg-[rgb(var(--secondary-bg))] rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {proposal.name}
                    </h4>
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap
                        ${
                          proposal.status === 'Adopted'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : proposal.status === 'Draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : proposal.status === 'Public Comment'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }
                      `}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-secondary))] mt-2 line-clamp-3">
                    {proposal.summary}
                  </p>
                  {proposal.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {proposal.links.slice(0, 2).map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[rgb(var(--accent))] hover:underline"
                        >
                          {link.title} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explain section */}
        <div className="p-4 bg-[rgb(var(--secondary-bg))]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-2">
            Understanding This Location
          </h3>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            This feature is part of the <strong>{layerName}</strong> layer.
            {layerConfig?.description && ` ${layerConfig.description}`}
          </p>
          <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
            Data sourced from {layerConfig?.source || 'public records'}.
          </p>
        </div>
      </div>
    </div>
  );
}

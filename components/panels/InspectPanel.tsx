'use client';

import { useState, useEffect, useMemo } from 'react';
import type { InspectedFeature, Proposal, LayerConfig, WalkScoreData, PermitsData } from '@/types';
import { getZoneInfo, getCategoryLabel, type ZoneInfo } from '@/lib/zoning-info';
import { getDisplayProperties, isZoningLayer, isTransitLayer } from '@/lib/property-display';
import { getRepresentativePoint } from '@/lib/spatial';
import { reverseGeocode } from '@/lib/mapbox';
import { BuildingGraphic, Donut } from '@/components/ui';

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
  const [walkScore, setWalkScore] = useState<WalkScoreData | null>(null);
  const [permits, setPermits] = useState<PermitsData | null>(null);
  const [location, setLocation] = useState<{ address: string; neighborhood?: string } | null>(null);
  const [isLoadingWalkScore, setIsLoadingWalkScore] = useState(false);
  const [isLoadingPermits, setIsLoadingPermits] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['rules']));

  const layerConfig = useMemo(
    () => layerConfigs.find((l) => l.id === feature?.layerId),
    [layerConfigs, feature?.layerId]
  );
  const layerName = layerConfig?.name || feature?.layerId || '';

  // Get zone info if this is a zoning layer
  const zoneInfo = useMemo<ZoneInfo | null>(() => {
    if (!feature || !isZoningLayer(feature.layerId)) return null;
    const zoneCode = feature.properties.ZONELUT as string;
    return getZoneInfo(zoneCode);
  }, [feature]);

  // Get representative point for API calls
  const featurePoint = useMemo<[number, number] | null>(() => {
    if (!feature?.geometry) return null;
    return getRepresentativePoint(feature.geometry);
  }, [feature?.geometry]);

  // Related proposals
  const relatedProposals = useMemo(
    () => (feature ? proposals.filter((p) => p.layers.includes(feature.layerId)) : []),
    [proposals, feature]
  );

  // Fetch Walk Score when feature changes
  useEffect(() => {
    if (!featurePoint || !isZoningLayer(feature?.layerId || '')) {
      setWalkScore(null);
      return;
    }

    const [lng, lat] = featurePoint;
    setIsLoadingWalkScore(true);

    fetch(`/api/walkscore?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => setWalkScore(data))
      .catch(() => setWalkScore(null))
      .finally(() => setIsLoadingWalkScore(false));
  }, [featurePoint, feature?.layerId]);

  // Fetch permits when feature changes
  useEffect(() => {
    if (!featurePoint || !isZoningLayer(feature?.layerId || '')) {
      setPermits(null);
      return;
    }

    const [lng, lat] = featurePoint;
    setIsLoadingPermits(true);

    fetch(`/api/permits?lat=${lat}&lng=${lng}&radius=300&limit=5`)
      .then((res) => res.json())
      .then((data) => setPermits(data))
      .catch(() => setPermits(null))
      .finally(() => setIsLoadingPermits(false));
  }, [featurePoint, feature?.layerId]);

  // Fetch location (reverse geocode) when feature changes
  useEffect(() => {
    if (!featurePoint || !isZoningLayer(feature?.layerId || '')) {
      setLocation(null);
      return;
    }

    const [lng, lat] = featurePoint;
    reverseGeocode(lng, lat)
      .then((result) => setLocation(result))
      .catch(() => setLocation(null));
  }, [featurePoint, feature?.layerId]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  if (!isOpen || !feature) return null;

  const isZoning = isZoningLayer(feature.layerId);
  const isTransit = isTransitLayer(feature.layerId);

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
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
            {isZoning && zoneInfo ? zoneInfo.name : layerName}
          </div>
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mt-1 truncate flex items-center gap-1.5">
            {isZoning && location && (
              <svg
                className="w-4 h-4 shrink-0 text-[rgb(var(--text-secondary))]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            )}
            <span className="truncate">
              {isZoning && location ? `Near ${location.address}` : 'Feature Details'}
            </span>
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
        {/* Zoning Summary - Only for zoning layers */}
        {isZoning && zoneInfo && (
          <div className="p-4 border-b border-[rgb(var(--border-color))]">
            {/* Building type graphic */}
            <BuildingGraphic
              category={zoneInfo.category}
              maxHeightFt={zoneInfo.maxHeightFt}
              code={zoneInfo.code}
              className="mb-4"
            />

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--secondary-bg))] rounded-lg p-3">
                <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">Max Height</div>
                <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  {zoneInfo.maxHeight}
                </div>
              </div>
              {zoneInfo.aduAllowed > 0 && (
                <div className="bg-[rgb(var(--secondary-bg))] rounded-lg p-3">
                  <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">ADUs Allowed</div>
                  <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {zoneInfo.aduAllowed}
                  </div>
                </div>
              )}
              {zoneInfo.aduAllowed === 0 && (
                <div className="bg-[rgb(var(--secondary-bg))] rounded-lg p-3">
                  <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">Category</div>
                  <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {getCategoryLabel(zoneInfo.category)}
                  </div>
                </div>
              )}
            </div>

            {/* Walk Score */}
            {(isLoadingWalkScore || walkScore) && (
              <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))]">
                {isLoadingWalkScore ? (
                  <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                    <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                    Loading scores...
                  </div>
                ) : walkScore && !walkScore.error ? (
                  <div>
                    <div className="flex justify-around">
                      {walkScore.walkscore !== null && (
                        <Donut
                          value={walkScore.walkscore}
                          max={100}
                          size={64}
                          strokeWidth={6}
                          label="Walk"
                          title={`Walk Score: ${walkScore.walkscore}`}
                        />
                      )}
                      {walkScore.transit_score !== null && (
                        <Donut
                          value={walkScore.transit_score}
                          max={100}
                          size={64}
                          strokeWidth={6}
                          label="Transit"
                          title={`Transit Score: ${walkScore.transit_score}`}
                        />
                      )}
                      {walkScore.bike_score !== null && (
                        <Donut
                          value={walkScore.bike_score}
                          max={100}
                          size={64}
                          strokeWidth={6}
                          label="Bike"
                          title={`Bike Score: ${walkScore.bike_score}`}
                        />
                      )}
                    </div>
                    <a
                      href={walkScore.more_info_link || 'https://www.walkscore.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
                    >
                      Scores by Walk Score®
                    </a>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Transit Info - Only for transit layers */}
        {isTransit && (
          <div className="p-4 border-b border-[rgb(var(--border-color))]">
            <TransitInfo feature={feature} />
          </div>
        )}

        {/* Development Rules - Collapsible */}
        {isZoning && zoneInfo && (
          <CollapsibleSection
            title="Development Rules"
            isExpanded={expandedSections.has('rules')}
            onToggle={() => toggleSection('rules')}
          >
            <dl className="space-y-3">
              <RuleRow
                label="Zone Code"
                value={zoneInfo.code}
                tooltip="The official zoning designation from Seattle Municipal Code. This code determines what can be built."
              />
              <RuleRow
                label="Lot Coverage"
                value={zoneInfo.lotCoverage}
                tooltip="Maximum percentage of the lot that can be covered by buildings and structures."
              />
              <RuleRow
                label="Floor Area Ratio"
                value={zoneInfo.far}
                tooltip="FAR is the ratio of total building floor area to lot size. A FAR of 1.0 means you can build floor area equal to the lot size."
              />
              <RuleRow
                label="Municipal Code"
                value={`SMC ${zoneInfo.smcSection}`}
                link={zoneInfo.smcLink}
              />
            </dl>
          </CollapsibleSection>
        )}

        {/* Raw Properties - For non-zoning layers or as fallback */}
        {!isZoning && (
          <div className="p-4 border-b border-[rgb(var(--border-color))]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
              Properties
            </h3>
            <dl className="space-y-2">
              {getDisplayProperties(feature.layerId, feature.properties).map(
                ({ key, label, value }) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-sm text-[rgb(var(--text-secondary))]">{label}</dt>
                    <dd className="text-sm font-medium text-[rgb(var(--text-primary))] text-right truncate max-w-[60%]">
                      {value}
                    </dd>
                  </div>
                )
              )}
            </dl>
          </div>
        )}

        {/* Nearby Permits - Only for zoning */}
        {isZoning && (
          <CollapsibleSection
            title="Nearby Activity"
            isExpanded={expandedSections.has('permits')}
            onToggle={() => toggleSection('permits')}
          >
            {isLoadingPermits ? (
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                Loading permits...
              </div>
            ) : permits && permits.permits.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-[rgb(var(--text-secondary))]">
                  {permits.total} permit{permits.total !== 1 ? 's' : ''} in last 2 years within 300m
                </p>
                {permits.permits.slice(0, 3).map((permit) => (
                  <div
                    key={permit.permit_number}
                    className="p-3 bg-[rgb(var(--secondary-bg))] rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-[rgb(var(--text-primary))]">
                        {permit.permit_type}
                      </span>
                      {permit.issue_date && (
                        <span className="text-xs text-[rgb(var(--text-secondary))]">
                          {new Date(permit.issue_date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 line-clamp-2">
                      {permit.description || permit.address}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                No recent permits found nearby
              </p>
            )}
          </CollapsibleSection>
        )}

        {/* Related Proposals */}
        {relatedProposals.length > 0 && (
          <CollapsibleSection
            title="Related Proposals"
            isExpanded={expandedSections.has('proposals')}
            onToggle={() => toggleSection('proposals')}
          >
            <div className="space-y-3">
              {relatedProposals.map((proposal) => (
                <div key={proposal.id} className="p-3 bg-[rgb(var(--secondary-bg))] rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {proposal.name}
                    </h4>
                    <StatusBadge status={proposal.status} />
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
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatusBadge({ status }: { status: Proposal['status'] }) {
  const colors: Record<string, string> = {
    Adopted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Public Comment': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Under Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
    >
      {status}
    </span>
  );
}

function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[rgb(var(--border-color))]">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[rgb(var(--secondary-bg))] transition-colors"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]">
          {title}
        </h3>
        <svg
          className={`w-4 h-4 text-[rgb(var(--text-secondary))] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function RuleRow({
  label,
  value,
  link,
  tooltip,
}: {
  label: string;
  value: string;
  link?: string;
  tooltip?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-sm text-[rgb(var(--text-secondary))] flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </dt>
      <dd className="text-sm font-medium text-[rgb(var(--text-primary))] text-right">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgb(var(--accent))] hover:underline"
          >
            {value} →
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Invisible expanded touch target for mobile */}
      <button
        type="button"
        className="touch-target-inline relative w-5 h-5 flex items-center justify-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More information"
      >
        {/* Expanded touch area (invisible) */}
        <span className="absolute inset-[-8px]" aria-hidden="true" />
        {/* Visual indicator */}
        <span className="w-4 h-4 rounded-full bg-[rgb(var(--text-tertiary))] text-[rgb(var(--panel-bg))] text-[10px] font-medium flex items-center justify-center hover:bg-[rgb(var(--text-secondary))] transition-colors pointer-events-none">
          ?
        </span>
      </button>
      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 text-xs text-[rgb(var(--text-primary))] bg-[rgb(var(--panel-bg))] border border-[rgb(var(--border-color))] rounded-lg shadow-lg z-50">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[rgb(var(--border-color))]" />
        </div>
      )}
    </span>
  );
}

function TransitInfo({ feature }: { feature: InspectedFeature }) {
  const props = feature.properties;

  // Transit stop
  if (feature.layerId === 'transit_stops') {
    return (
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
          {String(props.stop_name || 'Transit Stop')}
        </h3>
        {props.routes != null && (
          <p className="text-sm text-[rgb(var(--text-secondary))]">
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
        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
          Route {String(props.route_short_name || props.route_id || '')}
        </h3>
        {props.route_long_name != null && (
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            {String(props.route_long_name)}
          </p>
        )}
        {props.agency_name != null && (
          <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
            {String(props.agency_name)}
          </p>
        )}
      </div>
    );
  }

  return null;
}

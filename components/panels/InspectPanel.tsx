'use client';

import { useState } from 'react';
import type { InspectedFeature, Proposal, LayerConfig } from '@/types';
import { useInspectData } from '@/hooks/useInspectData';
import {
  InspectHeader,
  ZoningSummary,
  WalkScoreSection,
  DevelopmentRules,
  ParcelInfo,
  PermitsSection,
  ProposalsSection,
  TransitInfo,
  RawProperties,
  CollapsibleSection,
} from '@/components/inspect';

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['parcel', 'rules', 'permits', 'proposals'])
  );

  // Use shared data fetching hook
  const data = useInspectData(feature, layerConfigs, proposals);

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
      <InspectHeader
        zoneInfo={data.zoneInfo}
        layerName={data.layerName}
        location={data.location}
        isZoning={data.isZoning}
        onClose={onClose}
        variant="desktop"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
        {/* Zoning Summary */}
        {data.isZoning && data.zoneInfo && <ZoningSummary zoneInfo={data.zoneInfo} />}

        {/* Walk Score */}
        {data.isZoning && (
          <WalkScoreSection walkScore={data.walkScore} isLoading={data.isLoadingWalkScore} />
        )}

        {/* Parcel Info - Property details from King County */}
        {data.isZoning && (data.isLoadingParcel || data.parcelData) && (
          <CollapsibleSection
            title="Property Details"
            isExpanded={expandedSections.has('parcel')}
            onToggle={() => toggleSection('parcel')}
          >
            <ParcelInfo parcelData={data.parcelData} isLoading={data.isLoadingParcel} headless />
          </CollapsibleSection>
        )}

        {/* Transit Info */}
        {data.isTransit && feature && (
          <div className="p-4 border-b border-[rgb(var(--border-color))]">
            <TransitInfo feature={feature} />
          </div>
        )}

        {/* Development Rules - Collapsible */}
        {data.isZoning && data.zoneInfo && (
          <CollapsibleSection
            title="Development Rules"
            isExpanded={expandedSections.has('rules')}
            onToggle={() => toggleSection('rules')}
          >
            <DevelopmentRules zoneInfo={data.zoneInfo} />
          </CollapsibleSection>
        )}

        {/* Raw Properties - For non-zoning layers */}
        {!data.isZoning && feature && (
          <div className="p-4 border-b border-[rgb(var(--border-color))]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
              Properties
            </h3>
            <RawProperties feature={feature} />
          </div>
        )}

        {/* Nearby Permits - Collapsible */}
        {data.isZoning && (
          <CollapsibleSection
            title="Nearby Activity"
            isExpanded={expandedSections.has('permits')}
            onToggle={() => toggleSection('permits')}
          >
            <PermitsSection permits={data.permits} isLoading={data.isLoadingPermits} />
          </CollapsibleSection>
        )}

        {/* Related Proposals - Collapsible */}
        {data.relatedProposals.length > 0 && (
          <CollapsibleSection
            title="Related Proposals"
            isExpanded={expandedSections.has('proposals')}
            onToggle={() => toggleSection('proposals')}
          >
            <ProposalsSection proposals={data.relatedProposals} />
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}

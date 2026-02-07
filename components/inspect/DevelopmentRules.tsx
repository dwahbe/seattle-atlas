'use client';

import type { ZoneInfo } from '@/lib/zoning-info';
import { InfoTooltip } from './InfoTooltip';

interface DevelopmentRulesProps {
  zoneInfo: ZoneInfo;
  /** Compact mode for mobile - grid layout */
  compact?: boolean;
}

export function DevelopmentRules({ zoneInfo, compact = false }: DevelopmentRulesProps) {
  if (compact) {
    return (
      <div className="px-4 pt-2 pb-3 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
          Development Rules
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-text-secondary flex items-center gap-1">
              Zone Code
              <InfoTooltip text="Official zoning designation from Seattle Municipal Code." />
            </dt>
            <dd className="font-medium text-text-primary">{zoneInfo.code}</dd>
          </div>
          <div>
            <dt className="text-text-secondary flex items-center gap-1">
              Lot Coverage
              <InfoTooltip text="Max % of lot that can be covered by buildings." />
            </dt>
            <dd className="font-medium text-text-primary">{zoneInfo.lotCoverage}</dd>
          </div>
          <div>
            <dt className="text-text-secondary flex items-center gap-1">
              FAR
              <InfoTooltip text="Floor Area Ratio: total floor area ÷ lot size. FAR 1.0 = floor area equal to lot." />
            </dt>
            <dd className="font-medium text-text-primary">{zoneInfo.far}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Code</dt>
            <dd>
              <a
                href={zoneInfo.smcLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-medium"
              >
                SMC {zoneInfo.smcSection} →
              </a>
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  // Desktop: full width rows
  return (
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
      <dt className="text-sm text-text-secondary flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </dt>
      <dd className="text-sm font-medium text-text-primary text-right">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
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

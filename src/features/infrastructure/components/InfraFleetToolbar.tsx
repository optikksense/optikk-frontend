import { Filter } from "lucide-react";

import { Card, Input } from "@shared/components/primitives/ui";

import {
  INFRA_FILL,
  INFRA_GROUP,
  INFRA_LENS,
  INFRA_SIZE,
  type InfraFillMetric,
  type InfraGroupMode,
  type InfraLensId,
  type InfraSizeMetric,
} from "../constants";

interface InfraFleetToolbarProps {
  readonly lens: InfraLensId;
  readonly onLensChange: (v: InfraLensId) => void;
  readonly filterResourceLabel: string;
  readonly filterPlaceholder: string;
  readonly fill: InfraFillMetric;
  readonly onFillChange: (v: InfraFillMetric) => void;
  readonly size: InfraSizeMetric;
  readonly onSizeChange: (v: InfraSizeMetric) => void;
  readonly group: InfraGroupMode;
  readonly onGroupChange: (v: InfraGroupMode) => void;
  readonly filterText: string;
  readonly onFilterChange: (v: string) => void;
}

const selectClass =
  "h-9 min-w-[140px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 text-[12px] text-[var(--text-primary)]";

export default function InfraFleetToolbar({
  lens,
  onLensChange,
  filterResourceLabel,
  filterPlaceholder,
  fill,
  onFillChange,
  size,
  onSizeChange,
  group,
  onGroupChange,
  filterText,
  onFilterChange,
}: InfraFleetToolbarProps) {
  return (
    <Card padding="md" className="border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Resource
          <select
            className={selectClass}
            value={lens}
            onChange={(e) => onLensChange(e.target.value as InfraLensId)}
          >
            <option value={INFRA_LENS.host}>Host</option>
            <option value={INFRA_LENS.pod}>Pod</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Fill by
          <select
            className={selectClass}
            value={fill}
            onChange={(e) => onFillChange(e.target.value as InfraFillMetric)}
          >
            <option value={INFRA_FILL.error_rate}>Error rate</option>
            <option value={INFRA_FILL.avg_latency_ms}>Avg latency</option>
            <option value={INFRA_FILL.pod_count}>Pod count</option>
            <option value={INFRA_FILL.request_count}>Request count</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Size by
          <select
            className={selectClass}
            value={size}
            onChange={(e) => onSizeChange(e.target.value as InfraSizeMetric)}
          >
            <option value={INFRA_SIZE.uniform}>Uniform</option>
            <option value={INFRA_SIZE.request_count}>Request count</option>
            <option value={INFRA_SIZE.pod_count}>Pod count</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Group by
          <select
            className={selectClass}
            value={group}
            onChange={(e) => onGroupChange(e.target.value as InfraGroupMode)}
          >
            <option value={INFRA_GROUP.none}>None</option>
            <option value={INFRA_GROUP.health}>Health tier</option>
            <option value={INFRA_GROUP.host_prefix}>Host prefix</option>
          </select>
        </label>

        <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          <span className="inline-flex items-center gap-1">
            <Filter size={12} />
            {filterResourceLabel}
          </span>
          <Input
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder={filterPlaceholder}
            className="h-9"
          />
        </label>
      </div>
    </Card>
  );
}

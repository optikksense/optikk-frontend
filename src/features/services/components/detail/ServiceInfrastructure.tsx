import { Surface, Skeleton } from '@/components/ui';

import type { ServiceInfraMetrics } from '../../types';

function GaugeCard({
  label,
  value,
  unit,
  thresholds,
}: {
  label: string;
  value: number;
  unit: string;
  thresholds?: { warn: number; critical: number };
}) {
  const pct = Math.min(value, 100);
  const color =
    thresholds && value > thresholds.critical
      ? '#ff4d5a'
      : thresholds && value > thresholds.warn
        ? '#f7b63a'
        : '#35d68f';

  return (
    <Surface elevation={1} padding="sm" className="flex flex-col gap-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-light tabular-nums text-[var(--text-primary)]">
          {value.toFixed(1)}
        </span>
        <span className="mb-0.5 text-sm text-[var(--text-muted)]">{unit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </Surface>
  );
}

interface ServiceInfrastructureProps {
  infra: ServiceInfraMetrics | null;
  loading: boolean;
}

export default function ServiceInfrastructure({
  infra,
  loading,
}: ServiceInfrastructureProps) {
  if (loading) return <Skeleton count={4} />;

  if (!infra || infra.sampleCount === 0) {
    return (
      <div className="py-8 text-center text-sm text-[var(--text-muted)]">
        No infrastructure metrics available for this service
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span>
          Based on <strong className="text-[var(--text-primary)]">{infra.sampleCount.toLocaleString()}</strong> samples
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GaugeCard
          label="CPU Utilization"
          value={infra.avgCpuUtil}
          unit="%"
          thresholds={{ warn: 70, critical: 90 }}
        />
        <GaugeCard
          label="Memory Utilization"
          value={infra.avgMemoryUtil}
          unit="%"
          thresholds={{ warn: 75, critical: 90 }}
        />
        <GaugeCard
          label="Network Utilization"
          value={infra.avgNetworkUtil}
          unit="%"
          thresholds={{ warn: 60, critical: 85 }}
        />
        <GaugeCard
          label="Connection Pool"
          value={infra.avgConnPoolUtil}
          unit="%"
          thresholds={{ warn: 70, critical: 90 }}
        />
      </div>
    </div>
  );
}

import type { DashboardDataSources, StatCardSpec } from '@/types/dashboardConfig';

import StatCard from '@shared/components/ui/cards/StatCard';
import { getDashboardIcon } from './utils/dashboardUtils';

import { formatDuration, formatNumber } from '@shared/utils/formatters';

interface DashboardStatCardsProps {
  statCards: StatCardSpec[];
  dataSources: DashboardDataSources;
  isLoading?: boolean;
}

function resolveValue(spec: StatCardSpec, dataSources: DashboardDataSources): any {
  const raw = dataSources[spec.dataSource];
  const field = spec.valueField;

  if (field === '_count') {
    return Array.isArray(raw) ? raw.length : 0;
  }

  if (Array.isArray(raw)) {
    const first = raw[0];
    return first != null && typeof first === 'object' ? (first as any)[field] ?? 0 : 0;
  }

  if (raw != null && typeof raw === 'object') {
    return (raw as any)[field] ?? 0;
  }

  return 0;
}

function applyFormatter(spec: StatCardSpec): ((v: any) => string | number) | undefined {
  switch (spec.formatter) {
    case 'ms': return formatDuration;
    case 'number': return formatNumber;
    case 'percent1': return (v: any) => `${Number(v).toFixed(1)}%`;
    default: return undefined;
  }
}

export default function DashboardStatCards({
  statCards,
  dataSources,
  isLoading = false,
}: DashboardStatCardsProps) {
  if (statCards.length === 0) return null;

  const columnCount = Math.min(statCards.length, 4);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnCount}, 1fr)`, gap: 16, marginBottom: 16 }}>
      {statCards.map((spec) => {
        const value = resolveValue(spec, dataSources);
        const formatter = applyFormatter(spec);
        const icon = spec.icon ? getDashboardIcon(spec.icon, 20) : undefined;

        return (
          <div key={spec.title}>
            <StatCard
              metric={{
                title: spec.title,
                value: value,
                formatter: formatter,
              }}
              visuals={{
                icon: icon ?? undefined,
                loading: isLoading,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

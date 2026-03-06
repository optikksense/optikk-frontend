import { Col, Row } from 'antd';

import StatCard from '@components/common/cards/StatCard';
import { getDashboardIcon } from '@components/ui/dashboard/SpecializedRendererRegistry';
import type { DashboardDataSources, StatCardSpec } from '@/types/dashboardConfig';
import { formatDuration, formatNumber } from '@utils/formatters';

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

  const colSpan = Math.max(6, Math.floor(24 / statCards.length));

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {statCards.map((spec) => {
        const value = resolveValue(spec, dataSources);
        const formatter = applyFormatter(spec);
        const icon = spec.icon ? getDashboardIcon(spec.icon, 20) : undefined;

        return (
          <Col key={spec.title} xs={24} sm={12} lg={colSpan}>
            <StatCard
              title={spec.title}
              value={value}
              formatter={formatter}
              icon={icon ?? undefined}
              loading={isLoading}
            />
          </Col>
        );
      })}
    </Row>
  );
}

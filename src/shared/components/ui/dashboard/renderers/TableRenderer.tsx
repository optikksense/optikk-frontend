import { SimpleTable } from '@/components/ui';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import { buildInterpolatedPath } from '@shared/utils/placeholderInterpolation';

import { useDashboardData } from '../hooks/useDashboardData';

/**
 *
 */
export function TableRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    const baseColumns = Object.keys(rows[0])
      .slice(0, 8)
      .map((key) => ({
        title: key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim(),
        dataIndex: key,
        key,
        ellipsis: true,
        render: (val: any) => {
          if (val == null) return '—';
          if (typeof val === 'number') return Number.isInteger(val) ? val : Number(val).toFixed(2);
          return String(val);
        },
      }));
    if (!chartConfig.drilldownRoute) {
      return baseColumns;
    }

    return [
      ...baseColumns,
      {
        title: 'Details',
        key: '__details',
        align: 'right' as const,
        render: (_val: unknown, row: Record<string, unknown>) => {
          const href = buildInterpolatedPath(chartConfig.drilldownRoute as string, row);
          return href ? <Link to={href}>View</Link> : '—';
        },
      },
    ];
  }, [chartConfig.drilldownRoute, rows]);
  if (rows.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <SimpleTable
        dataSource={rows.map((r: any, i: number) => ({ ...r, _rowKey: r.id ?? r.key ?? i }))}
        columns={columns}
        rowKey="_rowKey"
        size="small"
      />
    </div>
  );
}

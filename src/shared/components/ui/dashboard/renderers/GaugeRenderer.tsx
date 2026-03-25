import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import GaugeChart from '@shared/components/ui/charts/micro/GaugeChart';

import { useDashboardData } from '../hooks/useDashboardData';

/**
 *
 */
export function GaugeRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);
  const valueKey = chartConfig.valueKey || 'value';
  const groupKey = chartConfig.groupByKey;

  if (rows.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }

  if (groupKey) {
    // Render multiple small gauges
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px 8px',
          padding: 8,
          overflowY: 'auto',
          maxHeight: '100%',
        }}
      >
        {rows.slice(0, 8).map((row: any, i: number) => {
          const val = Number(row[valueKey] ?? 0);
          const label = row[groupKey] || `Item ${i + 1}`;
          return (
            <div
              key={label}
              style={{
                textAlign: 'center',
                minWidth: 80,
                flex: '1 1 calc(25% - 8px)',
                overflow: 'hidden',
              }}
            >
              <GaugeChart value={Math.round(val * 100)} label={label} size={80} />
            </div>
          );
        })}
      </div>
    );
  }

  const val = Number(rows[0]?.[valueKey] ?? 0);
  return <GaugeChart value={Math.round(val * 100)} label={chartConfig.title ?? ''} />;
}

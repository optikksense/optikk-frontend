import { useMemo } from 'react';

import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import DonutChart from '@shared/components/ui/charts/micro/DonutChart';
import { getChartColor } from '@shared/utils/charting';
import { CHART_THEME_DEFAULTS } from '@shared/utils/chartTheme';

import { useDashboardData } from '../hooks/useDashboardData';

/**
 *
 */
export function PieRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const labelKey = chartConfig.labelKey || chartConfig.groupByKey || 'label';
  const valueKey = chartConfig.valueKey || 'value';

  const chartData = useMemo(() => {
    const filtered = rows.filter((row) => row != null);
    if (filtered.length === 0) return null;

    const segments = filtered.map((row, index) => {
      const value = Number(row[valueKey]);
      return {
        name: String(row[labelKey] ?? `Item ${index + 1}`),
        value: Number.isFinite(value) ? value : 0,
        color: getChartColor(index),
      };
    });

    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    if (total <= 0) return null;

    return {
      segments,
      total,
    };
  }, [labelKey, rows, valueKey]);

  if (!chartData) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }

  const textPrimary = CHART_THEME_DEFAULTS.textPrimary();
  const textSecondary = CHART_THEME_DEFAULTS.textSecondary();
  const borderColor = CHART_THEME_DEFAULTS.borderColor();

  return (
    <div className="flex h-full items-center gap-5 px-2 py-1">
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <DonutChart
          segments={chartData.segments.map((segment) => ({
            label: segment.name,
            value: segment.value,
            color: segment.color,
          }))}
          centerValue={String(chartData.total)}
          centerLabel={chartConfig.title ?? 'Total'}
        />
      </div>
      <div className="flex min-w-[160px] flex-col gap-2 overflow-y-auto pr-2">
        {chartData.segments.map((segment) => {
          const percent = chartData.total > 0 ? (segment.value / chartData.total) * 100 : 0;
          return (
            <div
              key={segment.name}
              className="flex items-center gap-3 rounded-[var(--card-radius)] border px-3 py-2"
              style={{ borderColor: `${borderColor}66` }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color, flexShrink: 0 }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[12px] font-medium"
                  style={{ color: textPrimary }}
                  title={segment.name}
                >
                  {segment.name}
                </div>
                <div className="text-[11px]" style={{ color: textSecondary }}>
                  {segment.value} ({percent.toFixed(1)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

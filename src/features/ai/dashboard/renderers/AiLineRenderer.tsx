import { useMemo } from 'react';
import uPlot from 'uplot';

import type {
  DashboardPanelSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import { getChartColor } from '@shared/utils/charting';
import { tsMs } from '@shared/utils/chartDataUtils';
import UPlotChart, { defaultAxes, uLine } from '@shared/components/ui/charts/UPlotChart';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

/**
 *
 */
export function AiLineRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const { alignedData, series, hasData } = useMemo(() => {
    const arr = Array.isArray(rows) ? rows : [];
    const metricKey = chartConfig.valueKey || 'value';
    const groupKey = chartConfig.groupByKey || 'model_name';
    const filterValue =
      typeof extraContext?.selectedModel === 'string' ? extraContext.selectedModel : null;
    const filtered = filterValue ? arr.filter((row) => row[groupKey] === filterValue) : arr;

    const tsSet = new Set<string>();
    const groupSet = new Set<string>();
    for (const row of filtered) {
      if (row[metricKey] != null && row[metricKey] !== '' && row[metricKey] !== 0) {
        tsSet.add(String(row.timestamp ?? row.time_bucket ?? row.timeBucket ?? ''));
        groupSet.add(String(row[groupKey] ?? 'unknown'));
      }
    }

    const timestamps = Array.from(tsSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const groups = Array.from(groupSet);

    if (groups.length === 0 || timestamps.length === 0) {
      return {
        alignedData: [[], []] as uPlot.AlignedData,
        series: [] as uPlot.Series[],
        hasData: false,
      };
    }

    // Build lookup: group -> timestamp -> value
    const lookup: Record<string, Record<string, number | null>> = {};
    for (const row of filtered) {
      const group = String(row[groupKey] ?? 'unknown');
      if (!lookup[group]) lookup[group] = {};
      const value = Number(row[metricKey]);
      const timestamp = String(row.timestamp ?? row.time_bucket ?? row.timeBucket ?? '');
      if (!timestamp) {
        continue;
      }
      lookup[group][timestamp] = Number.isNaN(value) ? null : Math.round(value * 100000) / 100000;
    }

    // Build AlignedData: [timestamps_seconds[], values1[], values2[], ...]
    const tsSecs = new Float64Array(timestamps.length);
    for (let i = 0; i < timestamps.length; i++) {
      tsSecs[i] = tsMs(timestamps[i]) / 1000;
    }

    const valuesArrays: (number | null)[][] = groups.map((group) =>
      timestamps.map((ts) => lookup[group]?.[ts] ?? null)
    );

    const alignedData: uPlot.AlignedData = [tsSecs as unknown as number[], ...valuesArrays];

    const seriesConfigs: uPlot.Series[] = groups.map((group, index) =>
      uLine(group, getChartColor(index), { fill: false })
    );

    return { alignedData, series: seriesConfigs, hasData: true };
  }, [rows, chartConfig.valueKey, chartConfig.groupByKey, extraContext?.selectedModel]);

  if (!hasData) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }

  const yAxisFormatter = chartConfig.yPrefix
    ? (self: uPlot, ticks: number[]) =>
        ticks.map((v) => `${chartConfig.yPrefix}${Number(v).toFixed(chartConfig.yDecimals ?? 2)}`)
    : undefined;

  const axes = defaultAxes();
  if (yAxisFormatter) {
    axes[1] = {
      ...axes[1],
      values: yAxisFormatter,
    };
  }

  const options: Omit<uPlot.Options, 'width' | 'height'> = {
    axes,
    series: [{}, ...series],
    legend: { show: series.length > 0 },
    scales: {
      y: { min: 0 },
    },
  };

  return <UPlotChart options={options} data={alignedData} className="w-full" />;
}

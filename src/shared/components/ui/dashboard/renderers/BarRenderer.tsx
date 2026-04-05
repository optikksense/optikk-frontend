import { useMemo } from 'react';
import uPlot from 'uplot';

import type { DashboardExtraContext } from '@/types/dashboardConfig';

import UPlotChart, { defaultAxes, uBars } from '@shared/components/ui/charts/UPlotChart';
import { getChartColor } from '@shared/utils/charting';

import { useDashboardData } from '../hooks/useDashboardData';
import ChartNoDataOverlay from '@shared/components/ui/feedback/ChartNoDataOverlay';

import type { DashboardPanelRendererProps } from '../dashboardPanelRegistry';

/**
 *
 */
export function BarRenderer({
  chartConfig,
  dataSources,
  extraContext,
  fillHeight = false,
}: DashboardPanelRendererProps) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const filterValue =
    typeof extraContext?.selectedModel === 'string' ? extraContext.selectedModel : null;
  const groupKey = chartConfig.groupByKey || 'model_name';
  const labelKey = chartConfig.labelKey || groupKey;
  const valueKey = chartConfig.valueKey || 'value';
  const stacked = chartConfig.stacked || false;

  const chartResult = useMemo(() => {
    const filtered = filterValue ? rows.filter((row) => row[groupKey] === filterValue) : rows;
    if (!filtered.length) return null;

    if (chartConfig.valueKeys && chartConfig.valueKeys.length > 0) {
      const labels: string[] = filtered.map((row) => String(row[labelKey] ?? 'unknown'));
      const xVals = labels.map((_: string, i: number) => i);
      const valArrays: (number | null)[][] = chartConfig.valueKeys.map((seriesValueKey: string) =>
        filtered.map((row) => {
          const raw = row[seriesValueKey];
          const value = typeof raw === 'number' ? raw : parseFloat(String(raw));
          return Number.isNaN(value) ? 0 : value;
        })
      );
      const seriesConfigs: uPlot.Series[] = chartConfig.valueKeys.map(
        (seriesValueKey: string, index: number) =>
          uBars(seriesValueKey.replace(/_/g, ' '), getChartColor(index))
      );
      const hasData = valArrays.some((arr) => arr.some((v) => v !== 0 && v !== null));
      return { xVals, valArrays, series: seriesConfigs, labels, hasData };
    }

    const bucketKey = chartConfig.bucketKey;
    if (bucketKey) {
      const groups: Record<string, Record<string, number>> = {};
      for (const row of filtered) {
        const group = String(row[groupKey] ?? 'unknown');
        if (!groups[group]) groups[group] = {};
        groups[group][String(row[bucketKey] ?? 'unknown')] = Number(row[valueKey]) || 0;
      }
      const allBuckets = Array.from(
        new Set(filtered.map((row) => String(row[bucketKey] ?? 'unknown')))
      ).sort((a, b) => Number(a) - Number(b));
      const labels = allBuckets.map((bucket) => `${bucket}ms`);
      const xVals = allBuckets.map((_: string, i: number) => i);
      const groupNames = Object.keys(groups);
      const valArrays: (number | null)[][] = groupNames.map((group) =>
        allBuckets.map((bucket) => groups[group][bucket] ?? 0)
      );
      const seriesConfigs: uPlot.Series[] = groupNames.map((group, index) =>
        uBars(group, getChartColor(index))
      );
      const hasData = valArrays.some((arr) => arr.some((v) => v !== 0 && v !== null));
      return { xVals, valArrays, series: seriesConfigs, labels, hasData };
    }

    const labels: string[] = filtered.map((row) => String(row[labelKey] ?? 'unknown'));
    const xVals = labels.map((_: string, i: number) => i);
    const color = chartConfig.color || getChartColor(0);
    const valArrays: (number | null)[][] = [
      filtered.map((row) => {
        const raw = row[valueKey];
        const value = typeof raw === 'number' ? raw : parseFloat(String(raw));
        return Number.isNaN(value) ? 0 : value;
      }),
    ];
    const seriesConfigs: uPlot.Series[] = [
      uBars(chartConfig.datasetLabel || valueKey || 'Value', color),
    ];
    const hasData = valArrays.some((arr) => arr.some((v) => Number(v) > 0));
    return { xVals, valArrays, series: seriesConfigs, labels, hasData };
  }, [rows, filterValue, groupKey, labelKey, stacked, chartConfig, valueKey]);

  const plot = useMemo(() => {
    if (!chartResult || !chartResult.hasData) return null;

    const { xVals, valArrays, series, labels } = chartResult;
    const alignedData: uPlot.AlignedData = [xVals, ...valArrays];
    const showLegend = stacked || series.length > 1;

    const yAxisFormatter = chartConfig.yPrefix
      ? (_self: uPlot, ticks: number[]) =>
          ticks.map((v) => `${chartConfig.yPrefix}${Number(v).toFixed(chartConfig.yDecimals ?? 4)}`)
      : undefined;

    const axes = defaultAxes();
    axes[0] = {
      ...axes[0],
      values: (_self: uPlot, splits: number[]) => splits.map((i) => labels[Math.round(i)] ?? ''),
    };

    if (yAxisFormatter) {
      axes[1] = {
        ...axes[1],
        values: yAxisFormatter,
      };
    }

    const options: Omit<uPlot.Options, 'width' | 'height'> = {
      axes,
      series: [{}, ...series],
      legend: { show: showLegend },
      scales: {
        x: { time: false, distr: 2 },
        y: { min: 0 },
      },
    };

    return { alignedData, options };
  }, [chartResult, stacked, chartConfig.yPrefix, chartConfig.yDecimals]);

  if (!plot) {
    return <ChartNoDataOverlay />;
  }

  return (
    <UPlotChart
      options={plot.options}
      data={plot.alignedData}
      className="w-full"
      fillHeight={fillHeight}
    />
  );
}

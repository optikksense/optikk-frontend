
import { useMemo, memo } from 'react';

import { useChartTimeBuckets } from '@shared/hooks/useChartTimeBuckets';
import { tsKey, tsMs, firstValue } from '@shared/utils/chartDataUtils';
import { CHART_COLORS } from '@config/constants';

import ObservabilityChart from '../ObservabilityChart';

type ChartRow = Record<string, unknown>;

interface RequestChartEndpoint {
  key?: string;
  endpoint?: string;
  seriesKey?: string;
  series_key?: string;
  service_name?: string;
  http_method?: string;
  httpMethod?: string;
  operation_name?: string;
  endpoint_name?: string;
}

interface RequestChartProps {
  data?: ChartRow[];
  endpoints?: RequestChartEndpoint[];
  selectedEndpoints?: string[];
  serviceTimeseriesMap?: Record<string, ChartRow[]>;
  height?: number;
  fillHeight?: boolean;
  datasetLabel?: string;
  color?: string;
  valueKey?: string;
}

function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

function formatAxisValue(value: any) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}K`;
  if (abs >= 10) return n.toFixed(0);
  if (abs >= 1) return n.toFixed(1);
  if (abs >= 0.1) return n.toFixed(2);
  if (abs > 0) return n.toFixed(3);
  return '0';
}

/**
 *
 * @param root0
 * @param root0.data
 * @param root0.endpoints
 * @param root0.selectedEndpoints
 * @param root0.serviceTimeseriesMap
 * @param root0.datasetLabel
 * @param root0.color
 * @param root0.valueKey
 */
export default memo(function RequestChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  height = 280,
  fillHeight = false,
  datasetLabel = 'Requests/min',
  color = CHART_COLORS[0],
  valueKey = 'request_count',
}: RequestChartProps) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets } = useChartTimeBuckets();

  const getSeriesRows = (seriesKey: string) => {
    if ((serviceTimeseriesMap)[seriesKey]) {
      return (serviceTimeseriesMap)[seriesKey];
    }

    if (!seriesKey.includes('::')) {
      return [];
    }

    const [queueName] = seriesKey.split('::');
    return (
      (serviceTimeseriesMap)[`${queueName}::unknown`] ||
      (serviceTimeseriesMap)[queueName] ||
      []
    );
  };

  const buildServiceDatasets = (endpointList: RequestChartEndpoint[]) => {
    const targetMap: Record<string, { label: string; seriesKey: string }> = {};
    for (const ep of endpointList) {
      const selectionKey = ep.key || firstValue(ep, ['service_name'], '');
      const seriesKey = ep.seriesKey || ep.series_key || selectionKey;
      const label = ep.endpoint || firstValue(ep, ['service_name'], '') || seriesKey;
      if (!targetMap[selectionKey]) targetMap[selectionKey] = { label, seriesKey };
    }

    const stepMs = timeBuckets.length >= 2
      ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
      : 60000;

    return Object.entries(targetMap).map(([, info], idx) => {
      const tsData = getSeriesRows(info.seriesKey);
      const tsMap: Record<string, number> = {};

      for (const row of tsData) {
        const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket'], '');
        if (!rowTimestamp) continue;
        const rowTime = tsMs(rowTimestamp);
        if (Number.isNaN(rowTime)) continue;
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        const value = Number(firstValue(row, [valueKey, 'request_count', 'value'], 0));
        tsMap[bucketKey] = (tsMap[bucketKey] || 0) + (Number.isFinite(value) ? value : 0);
      }

      const values = timeBuckets.map((d) => tsMap[tsKey(d)] ?? 0);
      return { label: info.label, values, color: getChartColor(idx), fill: false };
    });
  };

  const chartData = useMemo(() => {
    type SeriesEntry = { label: string; values: number[]; color: string; fill: boolean };
    let seriesList: SeriesEntry[];

    if (endpoints.length > 0) {
      const list = selectedEndpoints.length > 0
        ? endpoints.filter((ep) => {
          const key = ep.key || (() => {
            const method = String(firstValue(ep, ['http_method', 'httpMethod'], '')).toUpperCase();
            const op = String(firstValue(ep, ['operation_name', 'endpoint_name'], 'Unknown'));
            const cleanOp = op.startsWith(method + ' ') ? op.substring(method.length + 1) : op;
            const serviceName = firstValue(ep, ['service_name'], '');
            return `${method} ${cleanOp}_${serviceName}`;
          })();
          return selectedEndpoints.includes(key);
        })
        : endpoints;

      if (hasServiceData) {
        seriesList = buildServiceDatasets(list);
      } else {
        seriesList = list.map((ep, idx) => {
          const method = firstValue(ep, ['http_method'], 'N/A');
          const operation = firstValue(ep, ['operation_name', 'endpoint_name'], 'Unknown');
          return {
            label: `${method} ${operation}`,
            values: timeBuckets.map(() => 0),
            color: getChartColor(idx),
            fill: false,
          };
        });
      }
    } else if (hasServiceData) {
      const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;
      seriesList = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap: Record<string, number> = {};
        for (const row of rows) {
          const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket'], '');
          if (!rowTimestamp) continue;
          const rowTime = tsMs(rowTimestamp);
          if (Number.isNaN(rowTime)) continue;
          const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
          const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());
          const value = Number(firstValue(row, [valueKey, 'request_count', 'value'], 0));
          tsMap[bucketKey] = (tsMap[bucketKey] || 0) + (Number.isFinite(value) ? value : 0);
        }
        const values = timeBuckets.map((d) => tsMap[tsKey(d)] ?? 0);
        return { label: svcName, values, color: getChartColor(idx), fill: false };
      });
    } else {
      const dataMap: Record<string, number> = {};
      for (const d of data) {
        const ts = firstValue(d, ['timestamp', 'time_bucket'], '');
        dataMap[tsKey(ts)] = Number(firstValue(d, [valueKey, 'request_count', 'value'], 0));
      }
      seriesList = [{ label: datasetLabel, values: timeBuckets.map((ts) => dataMap[tsKey(ts)] ?? 0), color, fill: true }];
    }

    return seriesList;
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, timeBuckets]);

  const timestamps = useMemo(
    () => timeBuckets.map((t) => tsMs(t) / 1000),
    [timeBuckets],
  );

  const yAxisMax = useMemo(() => {
    let maxVal = 0;
    chartData.forEach((s) => {
      const dsMax = Math.max(...s.values.map((v) => Number(v) || 0), 0);
      if (dsMax > maxVal) maxVal = dsMax;
    });
    if (maxVal <= 0) return 1;
    if (maxVal < 1) return Math.max(Number((maxVal * 1.4).toFixed(3)), 0.05);
    if (maxVal < 10) return Math.max(Number((maxVal * 1.25).toFixed(2)), 1);
    return Math.max(Math.ceil(maxVal * 1.5), 1);
  }, [chartData]);

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>No request data in selected time range</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: fillHeight ? '100%' : '220px' }}>
      <ObservabilityChart
        timestamps={timestamps}
        series={chartData}
        yMin={0}
        yMax={yAxisMax}
        yFormatter={formatAxisValue}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
});

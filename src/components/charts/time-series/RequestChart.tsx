import { Empty } from 'antd';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';

// Normalize any timestamp string to a canonical key for lookups.
function tsKey(ts: any) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16);
}

// Parse timestamp values robustly across API formats.
function tsMs(ts: any) {
  if (!ts) return NaN;
  const raw = String(ts).trim();
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  const ms = new Date(hasTimezone ? normalized : `${normalized}Z`).getTime();
  return Number.isNaN(ms) ? NaN : ms;
}

function firstValue(row: any, keys: string[], fallback: any = 0) {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
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
export default function RequestChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  datasetLabel = 'Requests/min',
  color = '#5E60CE',
  valueKey = 'request_count',
}: any) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

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

  const buildServiceDatasets = (endpointList: any[]) => {
    const targetMap: Record<string, any> = {};
    for (const ep of endpointList) {
      const selectionKey = ep.key || firstValue(ep, ['service_name', 'serviceName', 'service'], '');
      const seriesKey = ep.seriesKey || ep.series_key || selectionKey;
      const label = ep.endpoint || firstValue(ep, ['service_name', 'serviceName', 'service'], '') || seriesKey;
      if (!targetMap[selectionKey]) targetMap[selectionKey] = { label, seriesKey };
    }

    const stepMs = timeBuckets.length >= 2
      ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
      : 60000;

    return Object.entries(targetMap).map(([, info]: [string, any], idx) => {
      const tsData = getSeriesRows(info.seriesKey);
      const tsMap: Record<string, number> = {};

      for (const row of tsData) {
        const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket', 'timeBucket'], '');
        if (!rowTimestamp) continue;
        const rowTime = tsMs(rowTimestamp);
        if (Number.isNaN(rowTime)) continue;
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        const value = Number(firstValue(row, [valueKey, 'request_count', 'requestCount', 'value'], 0));
        tsMap[bucketKey] = (tsMap[bucketKey] || 0) + (Number.isFinite(value) ? value : 0);
      }

      const values = timeBuckets.map((d) => tsMap[tsKey(d)] ?? 0);
      return createLineDataset(info.label, values, getChartColor(idx), false);
    });
  };

  const chartData = useMemo(() => {
    let datasets: any[];
    if (endpoints.length > 0) {
      const list = selectedEndpoints.length > 0
        ? (endpoints as any[]).filter((ep) => {
          const key = ep.key || (() => {
            const method = String(firstValue(ep, ['http_method', 'httpMethod'], '')).toUpperCase();
            const op = String(firstValue(ep, ['operation_name', 'operationName', 'endpoint_name', 'endpointName'], 'Unknown'));
            const cleanOp = op.startsWith(method + ' ') ? op.substring(method.length + 1) : op;
            const serviceName = firstValue(ep, ['service_name', 'serviceName'], '');
            return `${method} ${cleanOp}_${serviceName}`;
          })();
          return selectedEndpoints.includes(key);
        })
        : endpoints;

      if (hasServiceData) {
        datasets = buildServiceDatasets(list);
      } else {
        datasets = (list as any[]).map((ep, idx) => {
          const method = firstValue(ep, ['http_method', 'httpMethod'], 'N/A');
          const operation = firstValue(ep, ['operation_name', 'operationName', 'endpoint_name', 'endpointName'], 'Unknown');
          return createLineDataset(
            `${method} ${operation}`,
            timeBuckets.map(() => 0),
            getChartColor(idx),
            false,
          );
        });
      }
    } else if (hasServiceData) {
      const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows]: [string, any], idx) => {
        const tsMap: Record<string, number> = {};
        for (const row of rows) {
          const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket', 'timeBucket'], '');
          if (!rowTimestamp) continue;
          const rowTime = tsMs(rowTimestamp);
          if (Number.isNaN(rowTime)) continue;
          const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
          const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());
          const value = Number(firstValue(row, [valueKey, 'request_count', 'requestCount', 'value'], 0));
          tsMap[bucketKey] = (tsMap[bucketKey] || 0) + (Number.isFinite(value) ? value : 0);
        }
        const values = timeBuckets.map((d) => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      const dataMap: Record<string, number> = {};
      for (const d of data as any[]) {
        const ts = firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], '');
        dataMap[tsKey(ts)] = Number(firstValue(d, [valueKey, 'request_count', 'requestCount', 'value'], 0));
      }
      datasets = [createLineDataset(datasetLabel, timeBuckets.map((ts) => dataMap[tsKey(ts)] ?? 0), color, true)];
    }

    return { labels, datasets };
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, timeBuckets, labels]);

  const yAxisMax = useMemo(() => {
    let maxVal = 0;
    chartData.datasets.forEach((ds) => {
      const dsMax = Math.max(...ds.data.map((v: any) => Number(v) || 0), 0);
      if (dsMax > maxVal) maxVal = dsMax;
    });
    if (maxVal <= 0) return 1;
    if (maxVal < 1) return Math.max(Number((maxVal * 1.4).toFixed(3)), 0.05);
    if (maxVal < 10) return Math.max(Number((maxVal * 1.25).toFixed(2)), 1);
    return Math.max(Math.ceil(maxVal * 1.5), 1);
  }, [chartData]);

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.parsed.y;
            if (v == null) return null;
            return `${ctx.dataset.label}: ${formatAxisValue(v)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666',
          font: { size: 11 },
          callback: (value: any) => formatAxisValue(value),
        },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
        max: yAxisMax,
      },
    },
  });

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No request data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

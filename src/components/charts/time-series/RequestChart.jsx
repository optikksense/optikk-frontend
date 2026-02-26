import { useMemo } from 'react';
import { Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

// Normalize any timestamp string to a canonical key for lookups.
// Handles both "2024-01-01 10:05:00" and ISO "2024-01-01T10:05:00Z" formats.
function tsKey(ts) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16); // "YYYY-MM-DD HH:mm"
}

// Parse timestamp values robustly across API formats.
// If timezone is missing (e.g. "2026-02-24 10:25:00"), treat as UTC.
function tsMs(ts) {
  if (!ts) return NaN;
  const raw = String(ts).trim();
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  const ms = new Date(hasTimezone ? normalized : `${normalized}Z`).getTime();
  return Number.isNaN(ms) ? NaN : ms;
}

function firstValue(row, keys, fallback = 0) {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
}

function formatAxisValue(value) {
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

export default function RequestChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  datasetLabel = 'Requests/min',
  color = '#5E60CE',
  valueKey = 'request_count'
}) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

  // Build per-item datasets using real timeseries data
  const buildServiceDatasets = (endpointList) => {
    const targetMap = {};
    for (const ep of endpointList) {
      const selectionKey = ep.key || firstValue(ep, ['service_name', 'serviceName', 'service'], '');
      const seriesKey = ep.seriesKey || ep.series_key || selectionKey;
      const label = ep.endpoint || firstValue(ep, ['service_name', 'serviceName', 'service'], '') || seriesKey;
      if (!targetMap[selectionKey]) targetMap[selectionKey] = { label, seriesKey };
    }

    // Determine stepMs from the generated buckets to floor backend timestamps
    const stepMs = timeBuckets.length >= 2
      ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
      : 60000;

    return Object.entries(targetMap).map(([, info], idx) => {
      const tsData = serviceTimeseriesMap[info.seriesKey] || [];
      const tsMap = {};

      for (const row of tsData) {
        const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket', 'timeBucket'], '');
        if (!rowTimestamp) continue;
        const rowTime = tsMs(rowTimestamp);
        if (Number.isNaN(rowTime)) continue;
        // Floor to nearest bucket using stepMs
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        // Sum values if multiple rows fall into the same bucket (e.g. 1m data in 5m buckets)
        const value = Number(firstValue(row, [valueKey, 'request_count', 'requestCount', 'value'], 0));
        tsMap[bucketKey] = (tsMap[bucketKey] || 0) + (Number.isFinite(value) ? value : 0);
      }

      const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
      return createLineDataset(info.label, values, getChartColor(idx), false);
    });
  };

  const chartData = useMemo(() => {
    let datasets;
    if (endpoints.length > 0) {
      const list = selectedEndpoints.length > 0
        ? endpoints.filter(ep => {
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
        // Fallback to plotting zeros if no data available yet
        datasets = list.map((ep, idx) => {
          const method = firstValue(ep, ['http_method', 'httpMethod'], 'N/A');
          const operation = firstValue(ep, ['operation_name', 'operationName', 'endpoint_name', 'endpointName'], 'Unknown');
          return createLineDataset(
            `${method} ${operation}`,
            timeBuckets.map(() => 0),
            getChartColor(idx),
            false
          );
        });
      }
    } else if (hasServiceData) {
      // No endpoint filter — show one line per service
      const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap = {};
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
        const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      // Map data values onto full-range buckets
      const dataMap = {};
      for (const d of data) {
        const ts = firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], '');
        dataMap[tsKey(ts)] = firstValue(d, [valueKey, 'request_count', 'requestCount', 'value'], 0);
      }
      datasets = [createLineDataset(datasetLabel, timeBuckets.map(ts => dataMap[tsKey(ts)] ?? 0), color, true)];
    }

    return { labels, datasets };
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, timeBuckets, labels]);

  // Compute maximum value for relative Y-axis scaling
  const yAxisMax = useMemo(() => {
    let maxVal = 0;
    chartData.datasets.forEach(ds => {
      const dsMax = Math.max(...ds.data.map(v => Number(v) || 0), 0);
      if (dsMax > maxVal) maxVal = dsMax;
    });
    if (maxVal <= 0) return 1;
    if (maxVal < 1) {
      return Math.max(Number((maxVal * 1.4).toFixed(3)), 0.05);
    }
    if (maxVal < 10) {
      return Math.max(Number((maxVal * 1.25).toFixed(2)), 1);
    }
    return Math.max(Math.ceil(maxVal * 1.5), 1);
  }, [chartData]);

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
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
          callback: (value) => formatAxisValue(value),
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

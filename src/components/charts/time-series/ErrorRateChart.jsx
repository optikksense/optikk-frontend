import { useMemo } from 'react';
import { Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

// Normalize timestamps to "YYYY-MM-DD HH:mm" for reliable cross-source matching.
function tsKey(ts) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16);
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

export default function ErrorRateChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  targetThreshold = null,
  datasetLabel = 'Error Rate %',
  color = '#F04438'
}) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

  const buildServiceDatasets = (endpointList) => {
    const targetMap = {};
    for (const ep of endpointList) {
      const key = ep.key || firstValue(ep, ['service_name', 'serviceName', 'service'], '');
      const label = ep.endpoint || firstValue(ep, ['service_name', 'serviceName', 'service'], '') || key;
      if (!targetMap[key]) targetMap[key] = { label };
    }
    const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;

    return Object.entries(targetMap).map(([key, info], idx) => {
      const tsData = serviceTimeseriesMap[key] || [];
      const tsMap = {};
      for (const row of tsData) {
        const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket', 'timeBucket'], '');
        if (!rowTimestamp) continue;
        const rowTime = tsMs(rowTimestamp);
        if (Number.isNaN(rowTime)) continue;
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        const total = Number(firstValue(row, ['request_count', 'requestCount'], 0));
        const errors = Number(firstValue(row, ['error_count', 'errorCount'], 0));

        if (!tsMap[bucketKey]) {
          tsMap[bucketKey] = { total: 0, errors: 0 };
        }
        tsMap[bucketKey].total += total;
        tsMap[bucketKey].errors += errors;
      }

      const values = timeBuckets.map(d => {
        const bucket = tsMap[tsKey(d)];
        if (!bucket || bucket.total === 0) return 0;
        return (bucket.errors / bucket.total) * 100;
      });
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

          const total = Number(firstValue(row, ['request_count', 'requestCount'], 0));
          const errors = Number(firstValue(row, ['error_count', 'errorCount'], 0));

          if (!tsMap[bucketKey]) {
            tsMap[bucketKey] = { total: 0, errors: 0 };
          }
          tsMap[bucketKey].total += total;
          tsMap[bucketKey].errors += errors;
        }

        const values = timeBuckets.map(d => {
          const bucket = tsMap[tsKey(d)];
          if (!bucket || bucket.total === 0) return 0;
          return (bucket.errors / bucket.total) * 100;
        });
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      // Map data values onto full-range buckets
      const dataMap = {};
      for (const d of data) {
        const ts = firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], '');
        dataMap[tsKey(ts)] = Number(firstValue(d, ['value', 'error_rate', 'errorRate'], 0));
      }
      datasets = [createLineDataset(datasetLabel, timeBuckets.map(ts => dataMap[tsKey(ts)] ?? 0), color, true)];
    }

    // Add target threshold line if provided
    if (targetThreshold !== null) {
      const formattedLimit = Number.isInteger(Number(targetThreshold)) ? targetThreshold : Number(targetThreshold).toFixed(2).replace(/\.?0+$/, '');
      datasets.push({
        label: `Limit (${formattedLimit}%)`,
        data: timeBuckets.map(() => targetThreshold),
        borderColor: '#F79009',
        borderDash: [6, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }

    return { labels, datasets };
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, targetThreshold, timeBuckets, labels]);

  // Compute max from all data sources for relative Y-axis scaling
  const allDataValues = useMemo(() => {
    const vals = data.map(d => Number(firstValue(d, ['value', 'error_rate', 'errorRate'], 0)));
    if (Object.keys(serviceTimeseriesMap).length > 0) {
      Object.values(serviceTimeseriesMap).forEach(rows => {
        rows.forEach(r => {
          const total = Number(firstValue(r, ['request_count', 'requestCount'], 0));
          const errors = Number(firstValue(r, ['error_count', 'errorCount'], 0));
          if (total > 0) vals.push((errors / total) * 100);
        });
      });
    }
    endpoints.forEach(ep => {
      const requestCount = Number(firstValue(ep, ['request_count', 'requestCount'], 0));
      const errorCount = Number(firstValue(ep, ['error_count', 'errorCount'], 0));
      const explicitRate = firstValue(ep, ['error_rate', 'errorRate'], null);
      const rate = explicitRate != null ? Number(explicitRate)
        : (requestCount > 0 ? (errorCount / requestCount) * 100 : 0);
      if (rate > 0) vals.push(rate);
    });
    return vals;
  }, [data, serviceTimeseriesMap, endpoints]);
  const maxDataVal = Math.max(...allDataValues, targetThreshold || 0, 0);
  const yAxisMax = Math.max(Math.ceil(maxDataVal * 2.0), 1);

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y == null) return null;
            return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666',
          callback: (v) => {
            const num = Number(v);
            return Number.isInteger(num) ? `${num}%` : `${num.toFixed(1)}%`;
          }
        },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
        max: Math.max(yAxisMax, targetThreshold ? targetThreshold * 1.5 : 0),
      },
    },
  });

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No error data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

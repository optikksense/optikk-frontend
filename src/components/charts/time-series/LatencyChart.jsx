import { useMemo } from 'react';
import { Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

function tsKey(ts) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16);
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

export default function LatencyChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  targetThreshold = null,
  datasetLabel = 'Avg Latency (ms)',
  color = '#5E60CE'
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
        const rowTime = new Date(rowTimestamp).getTime();
        if (!Number.isFinite(rowTime)) continue;
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        const latency = Number(firstValue(row, ['avg_latency', 'avgLatency', 'value'], 0));
        tsMap[bucketKey] = Math.max(tsMap[bucketKey] || 0, Number.isFinite(latency) ? latency : 0);
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
          const rowTime = new Date(rowTimestamp).getTime();
          if (!Number.isFinite(rowTime)) continue;
          const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
          const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());
          const latency = Number(firstValue(row, ['avg_latency', 'avgLatency', 'value'], 0));
          tsMap[bucketKey] = Math.max(tsMap[bucketKey] || 0, Number.isFinite(latency) ? latency : 0);
        }
        const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      if (data.length > 0 && firstValue(data[0], ['value'], null) !== null) {
        // Show single line if `value` is present rather than percentiles
        const dataMap = {};
        for (const d of data) {
          const ts = firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], '');
          dataMap[tsKey(ts)] = Number(firstValue(d, ['value', 'avg_latency', 'avgLatency'], 0));
        }
        datasets = [createLineDataset(datasetLabel, timeBuckets.map(ts => dataMap[tsKey(ts)] ?? 0), color, true)];
      } else {
        // Show P50/P95/P99 lines mapped onto full-range buckets
        const p50Map = {}, p95Map = {}, p99Map = {};
        for (const d of data) {
          const key = tsKey(firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], ''));
          p50Map[key] = Number(firstValue(d, ['p50', 'p50_latency', 'p50Latency'], 0));
          p95Map[key] = Number(firstValue(d, ['p95', 'p95_latency', 'p95Latency'], 0));
          p99Map[key] = Number(firstValue(d, ['p99', 'p99_latency', 'p99Latency'], 0));
        }
        datasets = [
          createLineDataset('P50', timeBuckets.map(ts => p50Map[tsKey(ts)] ?? 0), '#73C991', false),
          createLineDataset('P95', timeBuckets.map(ts => p95Map[tsKey(ts)] ?? 0), '#F79009', false),
          createLineDataset('P99', timeBuckets.map(ts => p99Map[tsKey(ts)] ?? 0), '#F04438', false),
        ];
      }
    }

    if (targetThreshold !== null) {
      datasets.push({
        label: `Target (${targetThreshold}ms)`,
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

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y == null) return null;
            return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(0)}ms`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: '#666', callback: (v) => `${v}ms` },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No latency data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

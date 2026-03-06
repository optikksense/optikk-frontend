import { APP_COLORS } from '@config/colorLiterals';
import { Empty } from 'antd';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';

// Normalize timestamps to "YYYY-MM-DD HH:mm" for reliable cross-source matching.
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

/**
 *
 * @param root0
 * @param root0.data
 * @param root0.endpoints
 * @param root0.selectedEndpoints
 * @param root0.serviceTimeseriesMap
 * @param root0.targetThreshold
 * @param root0.datasetLabel
 * @param root0.color
 */
export default function ErrorRateChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  targetThreshold = null,
  datasetLabel = 'Error Rate %',
  color = APP_COLORS.hex_f04438,
}: any) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

  const buildServiceDatasets = (endpointList: any[]) => {
    const targetMap: Record<string, any> = {};
    for (const ep of endpointList) {
      const key = ep.key || firstValue(ep, ['service_name', 'serviceName', 'service'], '');
      const label = ep.endpoint || firstValue(ep, ['service_name', 'serviceName', 'service'], '') || key;
      if (!targetMap[key]) targetMap[key] = { label };
    }
    const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;

    return Object.entries(targetMap).map(([key, info]: [string, any], idx) => {
      const tsData = (serviceTimeseriesMap)[key] || [];
      const tsMap: Record<string, { total: number, errors: number }> = {};
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

      const values = timeBuckets.map((d) => {
        const bucket = tsMap[tsKey(d)];
        if (!bucket || bucket.total === 0) return 0;
        return (bucket.errors / bucket.total) * 100;
      });
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
        const tsMap: Record<string, { total: number, errors: number }> = {};
        for (const row of rows as any[]) {
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

        const values = timeBuckets.map((d) => {
          const bucket = tsMap[tsKey(d)];
          if (!bucket || bucket.total === 0) return 0;
          return (bucket.errors / bucket.total) * 100;
        });
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      const dataMap: Record<string, number> = {};
      for (const d of data as any[]) {
        const ts = firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], '');
        dataMap[tsKey(ts)] = Number(firstValue(d, ['value', 'error_rate', 'errorRate'], 0));
      }
      datasets = [createLineDataset(datasetLabel, timeBuckets.map((ts) => dataMap[tsKey(ts)] ?? 0), color, true)];
    }

    if (targetThreshold !== null) {
      const formattedLimit = Number.isInteger(Number(targetThreshold)) ? targetThreshold : Number(targetThreshold).toFixed(2).replace(/\.?0+$/, '');
      datasets.push({
        label: `Limit (${formattedLimit}%)`,
        data: timeBuckets.map(() => targetThreshold),
        borderColor: APP_COLORS.hex_f79009,
        borderDash: [6, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }

    return { labels, datasets };
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, targetThreshold, timeBuckets, labels]);

  const allDataValues = useMemo(() => {
    const vals: number[] = (data as any[]).map((d) => Number(firstValue(d, ['value', 'error_rate', 'errorRate'], 0)));
    if (Object.keys(serviceTimeseriesMap).length > 0) {
      Object.values(serviceTimeseriesMap).forEach((rows: any) => {
        rows.forEach((r: any) => {
          const total = Number(firstValue(r, ['request_count', 'requestCount'], 0));
          const errors = Number(firstValue(r, ['error_count', 'errorCount'], 0));
          if (total > 0) vals.push((errors / total) * 100);
        });
      });
    }
    (endpoints as any[]).forEach((ep) => {
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
          label: (ctx: any) => {
            if (ctx.parsed.y == null) return null;
            return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: APP_COLORS.hex_666,
          callback: (v: any) => {
            const num = Number(v);
            return Number.isInteger(num) ? `${num}%` : `${num.toFixed(1)}%`;
          },
        },
        grid: { color: APP_COLORS.hex_2d2d2d },
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

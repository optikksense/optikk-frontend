import { Empty } from 'antd';
import { useMemo, memo } from 'react';
import { Line } from 'react-chartjs-2';

import { useChartTimeBuckets } from '@shared/hooks/useChartTimeBuckets';

import { createChartOptions, createLineDataset, getChartColor } from '@shared/utils/chartHelpers';

import { APP_COLORS } from '@config/colorLiterals';

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
export default memo(function RequestChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  datasetLabel = 'Requests/min',
  color = APP_COLORS.hex_5e60ce,
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

  const options = useMemo(() => createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: (context: any) => {
          const { chart, tooltip } = context;
          let tooltipEl = chart.canvas.parentNode.querySelector('div.custom-tooltip');

          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'custom-tooltip';
            tooltipEl.style.background = 'rgba(26, 26, 26, 0.7)';
            tooltipEl.style.backdropFilter = 'blur(8px)';
            tooltipEl.style.border = `1px solid ${APP_COLORS.hex_2d2d2d}`;
            tooltipEl.style.borderRadius = '8px';
            tooltipEl.style.color = 'white';
            tooltipEl.style.opacity = 1;
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(-50%, 0)';
            tooltipEl.style.transition = 'all .1s ease';
            tooltipEl.style.zIndex = 100;
            tooltipEl.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
            tooltipEl.style.padding = '12px';
            tooltipEl.style.minWidth = '160px';
            chart.canvas.parentNode.appendChild(tooltipEl);
          }

          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map((b: any) => b.lines);

            let innerHtml = '<div style="margin-bottom: 8px; font-size: 13px; color: #aaa; font-weight: 500;">';
            titleLines.forEach((title: string) => {
              innerHtml += `<div>${title}</div>`;
            });
            innerHtml += '</div><div style="display: flex; flex-direction: column; gap: 6px;">';

            bodyLines.forEach((body: string, i: number) => {
              const colors = tooltip.labelColors[i];
              const val = tooltip.dataPoints[i].raw;
              const formattedVal = formatAxisValue(val);
              const label = tooltip.dataPoints[i].dataset.label;
              
              // Sparkline representation based on value magnitude vs max
              const maxVal = yAxisMax;
              const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              const barWidth = Math.max(Math.min(pct, 100), 2);

              innerHtml += `
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${colors.backgroundColor}; border: 1px solid ${colors.borderColor}"></span>
                    <span style="color: #eee; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 100px;">${label}</span>
                  </div>
                  <span style="font-weight: 600; font-family: monospace;">${formattedVal}</span>
                </div>
                <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 2px; margin-bottom: 4px; overflow: hidden;">
                  <div style="width: ${barWidth}%; height: 100%; background: ${colors.backgroundColor}; border-radius: 2px;"></div>
                </div>
              `;
            });
            innerHtml += '</div>';

            tooltipEl.innerHTML = innerHtml;
          }

          const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
          
          tooltipEl.style.opacity = 1;
          tooltipEl.style.left = positionX + tooltip.caretX + 'px';
          tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: APP_COLORS.hex_666,
          font: { size: 11 },
          count: 6,
          callback: (value: any) => formatAxisValue(value),
        },
        grid: { color: APP_COLORS.hex_2d2d2d },
        beginAtZero: true,
        max: yAxisMax,
        min: 0,
      },
    },
  }), [yAxisMax]);

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
);

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
    const serviceMap = {};
    for (const ep of endpointList) {
      const svc = ep.service_name || ep.service || '';
      if (!serviceMap[svc]) serviceMap[svc] = ep;
    }
    return Object.entries(serviceMap).map(([svcName], idx) => {
      const svcTimeseries = serviceTimeseriesMap[svcName] || [];
      const tsMap = {};
      for (const row of svcTimeseries) {
        const total = Number(row.request_count || 0);
        const errors = Number(row.error_count || 0);
        tsMap[tsKey(row.timestamp)] = row.error_rate !== undefined ? Number(row.error_rate) : (total > 0 ? (errors / total * 100) : 0);
      }
      const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
      return createLineDataset(svcName, values, getChartColor(idx), false);
    });
  };

  const chartData = useMemo(() => {
    let datasets;
    if (endpoints.length > 0) {
      const list = selectedEndpoints.length > 0
        ? endpoints.filter(ep => {
          const key = ep.key || `${ep.http_method || 'N/A'}_${ep.operation_name || ep.endpoint_name || 'Unknown'}_${ep.service_name || ''}`;
          return selectedEndpoints.includes(key);
        })
        : endpoints.filter(ep => {
          const rate = ep.request_count > 0 ? (ep.error_count / ep.request_count) * 100 : 0;
          return rate > 0;
        }).slice(0, 10);

      if (hasServiceData) {
        datasets = buildServiceDatasets(list);
      } else {
        datasets = list.map((ep, idx) => {
          const errorRate = ep.error_rate !== undefined ? Number(ep.error_rate) : (ep.request_count > 0 ? (ep.error_count / ep.request_count) * 100 : 0);
          return createLineDataset(
            `${ep.http_method || 'N/A'} ${ep.operation_name || ep.endpoint_name || 'Unknown'}`,
            timeBuckets.map(() => errorRate),
            getChartColor(idx),
            false
          );
        });
      }
    } else if (hasServiceData) {
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap = {};
        for (const row of rows) {
          const total = Number(row.request_count || 0);
          const errors = Number(row.error_count || 0);
          tsMap[tsKey(row.timestamp)] = row.error_rate !== undefined ? Number(row.error_rate) : (total > 0 ? (errors / total * 100) : 0);
        }
        const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      // Map data values onto full-range buckets
      const dataMap = {};
      for (const d of data) dataMap[tsKey(d.timestamp)] = d.value;
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

  const maxDataVal = Math.max(...data.map(d => d.value || 0), targetThreshold || 0);
  const maxVal = Math.max(maxDataVal, 1);
  const yAxisMax = datasetLabel.includes('%') && maxVal <= 100 ? 100 : Math.ceil(maxVal * 1.2);

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
        max: yAxisMax,
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

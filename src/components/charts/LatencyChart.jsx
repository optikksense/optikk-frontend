import { useMemo } from 'react';
import { Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

function tsKey(ts) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16);
}

export default function LatencyChart({ data = [], endpoints = [], selectedEndpoints = [], serviceTimeseriesMap = {} }) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

  const buildServiceDatasets = (endpointList) => {
    const serviceMap = {};
    for (const ep of endpointList) {
      const svc = ep.service_name || ep.service || 'unknown';
      if (!serviceMap[svc]) serviceMap[svc] = ep;
    }
    return Object.entries(serviceMap).map(([svcName], idx) => {
      const svcTimeseries = serviceTimeseriesMap[svcName] || [];
      const tsMap = {};
      for (const row of svcTimeseries) {
        tsMap[tsKey(row.timestamp)] = Number(row.avg_latency || 0);
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
        : endpoints
          .sort((a, b) => (b.avg_latency || b.p95_latency || 0) - (a.avg_latency || a.p95_latency || 0))
          .slice(0, 10);

      if (hasServiceData) {
        datasets = buildServiceDatasets(list);
      } else {
        datasets = list.map((ep, idx) => {
          const latency = ep.avg_latency || ep.p95_latency || 0;
          return createLineDataset(
            `${ep.http_method || 'N/A'} ${ep.operation_name || ep.endpoint_name || 'Unknown'}`,
            timeBuckets.map(() => latency),
            getChartColor(idx),
            false
          );
        });
      }
    } else if (hasServiceData) {
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap = {};
        for (const row of rows) tsMap[tsKey(row.timestamp)] = Number(row.avg_latency || 0);
        const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      // Show P50/P95/P99 lines mapped onto full-range buckets
      const p50Map = {}, p95Map = {}, p99Map = {};
      for (const d of data) {
        const key = tsKey(d.timestamp);
        p50Map[key] = d.p50 ?? 0;
        p95Map[key] = d.p95 ?? 0;
        p99Map[key] = d.p99 ?? 0;
      }
      datasets = [
        createLineDataset('P50', timeBuckets.map(ts => p50Map[tsKey(ts)] ?? 0), '#73C991', false),
        createLineDataset('P95', timeBuckets.map(ts => p95Map[tsKey(ts)] ?? 0), '#F79009', false),
        createLineDataset('P99', timeBuckets.map(ts => p99Map[tsKey(ts)] ?? 0), '#F04438', false),
      ];
    }
    return { labels, datasets };
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, timeBuckets, labels]);

  const options = createChartOptions({
    plugins: {
      legend: {
        display: chartData.datasets.length > 1,
        labels: { color: '#666', font: { size: 11 }, boxWidth: 16, padding: 10 },
      },
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
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No latency data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

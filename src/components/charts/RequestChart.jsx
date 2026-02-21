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

export default function RequestChart({ data = [], endpoints = [], selectedEndpoints = [], serviceTimeseriesMap = {} }) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

  // Build per-service datasets using real timeseries data
  const buildServiceDatasets = (endpointList) => {
    // Deduplicate by service name
    const serviceMap = {};
    for (const ep of endpointList) {
      const svc = ep.service_name || ep.service || 'unknown';
      if (!serviceMap[svc]) serviceMap[svc] = ep;
    }

    return Object.entries(serviceMap).map(([svcName], idx) => {
      const svcTimeseries = serviceTimeseriesMap[svcName] || [];
      // Build lookup by normalized timestamp key
      const tsMap = {};
      for (const row of svcTimeseries) {
        tsMap[tsKey(row.timestamp)] = Number(row.request_count || 0);
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
        : endpoints.slice(0, 10);

      if (hasServiceData) {
        datasets = buildServiceDatasets(list);
      } else {
        // Proportional split fallback — map onto full-range buckets
        const totalReqs = endpoints.reduce((sum, ep) => sum + (Number(ep.request_count) || 0), 0) || 1;
        const dataMap = {};
        for (const d of data) dataMap[tsKey(d.timestamp)] = d.value || 0;

        datasets = list.map((ep, idx) => {
          const share = (Number(ep.request_count) || 0) / totalReqs;
          return createLineDataset(
            `${ep.http_method || 'N/A'} ${ep.operation_name || ep.endpoint_name || 'Unknown'}`,
            timeBuckets.map(ts => (dataMap[tsKey(ts)] || 0) * share),
            getChartColor(idx),
            false
          );
        });
      }
    } else if (hasServiceData) {
      // No endpoint filter — show one line per service
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap = {};
        for (const row of rows) tsMap[tsKey(row.timestamp)] = Number(row.request_count || 0);
        const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      // Map data values onto full-range buckets
      const dataMap = {};
      for (const d of data) dataMap[tsKey(d.timestamp)] = d.value;
      datasets = [createLineDataset('Requests/min', timeBuckets.map(ts => dataMap[tsKey(ts)] ?? 0), '#5E60CE', true)];
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
            const v = ctx.parsed.y;
            if (v == null) return null;
            return `${ctx.dataset.label}: ${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666',
          font: { size: 11 },
          callback: (value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toFixed(0);
          },
        },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No request data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ height: '250px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

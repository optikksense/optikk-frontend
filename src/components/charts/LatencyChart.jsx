import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, formatChartLabels, getChartColor } from '@utils/chartHelpers';

export default function LatencyChart({ data = [], endpoints = [], selectedEndpoints = [], serviceTimeseriesMap = {} }) {
  // Build per-service datasets using real timeseries data
  const buildServiceDatasets = (endpointList) => {
    const serviceMap = {};
    for (const ep of endpointList) {
      const svc = ep.service_name || ep.service || 'unknown';
      if (!serviceMap[svc]) serviceMap[svc] = ep;
    }

    return Object.entries(serviceMap).map(([svcName, ep], idx) => {
      const svcTimeseries = serviceTimeseriesMap[svcName] || [];
      const tsMap = {};
      for (const row of svcTimeseries) {
        const ts = row.timestamp;
        tsMap[ts] = Number(row.avg_latency || 0);
      }

      const values = data.map(d => tsMap[d.timestamp] ?? 0);

      return createLineDataset(
        svcName,
        values,
        getChartColor(idx),
        false
      );
    });
  };

  const chartData = {
    labels: formatChartLabels(data),
    datasets: (() => {
      if (endpoints.length > 0) {
        const list = selectedEndpoints.length > 0
          ? endpoints.filter(ep => {
            const epKey = ep.key || `${ep.http_method || 'N/A'}_${ep.operation_name || ep.endpoint_name || 'Unknown'}_${ep.service_name || ''}`;
            return selectedEndpoints.includes(epKey);
          })
          : endpoints
            .sort((a, b) => (b.avg_latency || b.p95_latency || 0) - (a.avg_latency || a.p95_latency || 0))
            .slice(0, 10);

        if (Object.keys(serviceTimeseriesMap).length > 0) {
          return buildServiceDatasets(list);
        }
        // Fallback: flat line (old behavior)
        return list.map((endpoint, idx) => {
          const latency = endpoint.avg_latency || endpoint.p95_latency || 0;
          return createLineDataset(
            `${endpoint.http_method || 'N/A'} ${endpoint.operation_name || endpoint.endpoint_name || 'Unknown'}`,
            data.map(() => latency),
            getChartColor(idx),
            false
          );
        });
      }
      return [
        createLineDataset('P50', data.map(d => d.p50), '#73C991', false),
        createLineDataset('P95', data.map(d => d.p95), '#F79009', false),
        createLineDataset('P99', data.map(d => d.p99), '#F04438', false),
      ];
    })(),
  };

  const options = createChartOptions({
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(0)}ms`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666',
          callback: (value) => `${value}ms`,
        },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

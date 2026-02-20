import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, formatChartLabels, getChartColor } from '@utils/chartHelpers';

export default function ErrorRateChart({ data = [], endpoints = [], selectedEndpoints = [], serviceTimeseriesMap = {} }) {
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
        const total = Number(row.request_count || 0);
        const errors = Number(row.error_count || 0);
        tsMap[ts] = total > 0 ? (errors / total * 100) : 0;
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
          : endpoints.filter(ep => {
            const errorRate = ep.request_count > 0 ? (ep.error_count / ep.request_count) * 100 : 0;
            return errorRate > 0;
          }).slice(0, 10);

        if (Object.keys(serviceTimeseriesMap).length > 0) {
          return buildServiceDatasets(list);
        }
        // Fallback: flat line (old behavior)
        return list.map((endpoint, idx) => {
          const errorRate = endpoint.request_count > 0
            ? (endpoint.error_count / endpoint.request_count) * 100
            : 0;
          return createLineDataset(
            `${endpoint.http_method || 'N/A'} ${endpoint.operation_name || endpoint.endpoint_name || 'Unknown'}`,
            data.map(() => errorRate),
            getChartColor(idx),
            false
          );
        });
      }
      return [createLineDataset('Error Rate %', data.map(d => d.value), '#F04438', true)];
    })(),
  };

  const options = createChartOptions({
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666',
          callback: (value) => `${value}%`,
        },
        grid: {
          color: '#2D2D2D'
        },
        beginAtZero: true,
        max: Math.max(...data.map(d => d.value), 10) * 1.2,
      },
    },
  });

  return (
    <div style={{ height: '250px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

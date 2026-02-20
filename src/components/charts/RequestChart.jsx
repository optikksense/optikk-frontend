import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, formatChartLabels, getChartColor } from '@utils/chartHelpers';

export default function RequestChart({ data = [], endpoints = [], selectedEndpoints = [], serviceTimeseriesMap = {} }) {
  // Build per-service datasets using real timeseries data
  const buildServiceDatasets = (endpointList) => {
    // Group endpoints by service to avoid duplicate service lines
    const serviceMap = {};
    for (const ep of endpointList) {
      const svc = ep.service_name || ep.service || 'unknown';
      if (!serviceMap[svc]) serviceMap[svc] = ep;
    }

    return Object.entries(serviceMap).map(([svcName, ep], idx) => {
      const svcTimeseries = serviceTimeseriesMap[svcName] || [];
      // Build a lookup from timestamp -> request_count
      const tsMap = {};
      for (const row of svcTimeseries) {
        const ts = row.timestamp;
        tsMap[ts] = Number(row.request_count || 0);
      }

      // Map to the same time axis as the aggregated data
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
          : endpoints.slice(0, 10);

        if (Object.keys(serviceTimeseriesMap).length > 0) {
          return buildServiceDatasets(list);
        }
        // Fallback: proportional split (old behavior)
        return list.map((endpoint, idx) => {
          const endpointShare = endpoint.request_count / Math.max(
            endpoints.reduce((sum, ep) => sum + (ep.request_count || 0), 0), 1
          );
          return createLineDataset(
            `${endpoint.http_method || 'N/A'} ${endpoint.operation_name || endpoint.endpoint_name || 'Unknown'}`,
            data.map(d => (d.value || 0) * endpointShare),
            getChartColor(idx),
            false
          );
        });
      }
      return [createLineDataset('Requests/min', data.map(d => d.value), '#5E60CE', true)];
    })(),
  };

  const options = createChartOptions({
    plugins: {
      legend: {
        display: false,
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
        grid: {
          color: '#2D2D2D',
        },
        beginAtZero: true,
      },
    },
  });

  return (
    <div style={{ height: '250px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

import { Bar } from 'react-chartjs-2';
import { createChartOptions, createBarDataset, formatChartLabels } from '@utils/chartHelpers';

export default function LogHistogram({ data = [], height = 120 }) {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: formatChartLabels(data, 'timestamp'),
    datasets: [
      createBarDataset('Log Volume', data.map((d) => d.count || d.value || 0), '#5E60CE'),
    ],
  };

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} logs`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666', maxTicksLimit: 8, maxRotation: 0 },
      },
      y: {
        grid: { color: '#2D2D2D' },
        ticks: { color: '#666', maxTicksLimit: 3 },
        beginAtZero: true,
      },
    },
  });

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

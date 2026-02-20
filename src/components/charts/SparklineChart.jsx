import { Line } from 'react-chartjs-2';

const sparklineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  elements: {
    point: { radius: 0 },
    line: { borderWidth: 1.5 },
  },
};

export default function SparklineChart({
  data = [],
  color = '#5E60CE',
  fill = true,
  width = 60,
  height = 24,
}) {
  if (!data || data.length < 2) return null;

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        data,
        borderColor: color,
        backgroundColor: fill ? `${color}26` : 'transparent',
        fill,
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={{ width, height }}>
      <Line data={chartData} options={sparklineOptions} />
    </div>
  );
}

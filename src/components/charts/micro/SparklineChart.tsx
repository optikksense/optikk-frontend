import { APP_COLORS } from '@config/colorLiterals';
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

interface SparklineChartProps {
  data?: number[];
  color?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 *
 * @param root0
 * @param root0.data
 * @param root0.color
 * @param root0.fill
 * @param root0.width
 * @param root0.height
 */
export default function SparklineChart({
  data = [],
  color = APP_COLORS.hex_5e60ce,
  fill = true,
  width = 60,
  height = 24,
}: SparklineChartProps) {
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

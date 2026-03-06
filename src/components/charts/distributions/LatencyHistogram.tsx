import { APP_COLORS } from '@config/colorLiterals';
import type { TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { createChartOptions } from '@utils/chartHelpers';

const BUCKETS = [
  { label: '0-50ms', max: 50, color: APP_COLORS.hex_73c991 },
  { label: '50-100ms', max: 100, color: APP_COLORS.hex_73c991 },
  { label: '100-250ms', max: 250, color: APP_COLORS.hex_06aed5 },
  { label: '250-500ms', max: 500, color: APP_COLORS.hex_f79009 },
  { label: '500ms-1s', max: 1000, color: APP_COLORS.hex_f79009 },
  { label: '1s-5s', max: 5000, color: APP_COLORS.hex_f04438 },
  { label: '5s+', max: Infinity, color: APP_COLORS.hex_f04438 },
];

interface LatencyHistogramTrace {
  durationMs?: number;
  duration_ms?: number;
}

interface LatencyHistogramProps {
  traces?: LatencyHistogramTrace[];
  height?: number;
}

function bucketize(traces: LatencyHistogramTrace[]): number[] {
  const counts = BUCKETS.map(() => 0);
  for (const trace of traces) {
    const duration = trace.durationMs || trace.duration_ms || 0;
    for (let i = 0; i < BUCKETS.length; i++) {
      if (duration <= BUCKETS[i].max) {
        counts[i]++;
        break;
      }
    }
  }
  return counts;
}

/**
 *
 * @param props Component props.
 * @returns Histogram chart for trace latency buckets.
 */
export default function LatencyHistogram({
  traces = [],
  height = 120,
}: LatencyHistogramProps): JSX.Element | null {
  const counts = bucketize(traces);

  if (counts.every((c) => c === 0)) return null;

  const chartData = {
    labels: BUCKETS.map((b) => b.label),
    datasets: [
      {
        label: 'Traces',
        data: counts,
        backgroundColor: BUCKETS.map((b) => `${b.color}CC`),
        borderColor: BUCKETS.map((b) => b.color),
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `${context.parsed.y} traces`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: APP_COLORS.hex_666, maxRotation: 0, font: { size: 10 } },
      },
      y: {
        grid: { color: APP_COLORS.hex_2d2d2d },
        ticks: { color: APP_COLORS.hex_666, maxTicksLimit: 3 },
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

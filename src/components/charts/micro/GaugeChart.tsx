import { Doughnut } from 'react-chartjs-2';

interface GaugeChartProps {
  value?: number;
  label?: string;
  size?: number;
}

function getGaugeColor(value: number): string {
  if (value >= 80) return '#F04438';
  if (value >= 60) return '#F79009';
  return '#73C991';
}

/**
 *
 * @param props Component props.
 * @returns Semi-circle gauge for 0-100 values.
 */
export default function GaugeChart({
  value = 0,
  label = '',
  size = 120,
}: GaugeChartProps): JSX.Element {
  const clamped = Math.min(Math.max(value, 0), 100);
  const color = getGaugeColor(clamped);

  const chartData = {
    datasets: [
      {
        data: [clamped, 100 - clamped],
        backgroundColor: [`${color}CC`, '#2D2D2D'],
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div style={{ width: size, height: size / 2 + 20, position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color }}>{clamped.toFixed(0)}%</div>
        {label && (
          <div style={{ fontSize: 10, color: 'var(--text-muted, #666)', marginTop: 2 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

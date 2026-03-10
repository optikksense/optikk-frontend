import { Doughnut } from 'react-chartjs-2';

import { APP_COLORS } from '@config/colorLiterals';

interface GaugeChartProps {
  value?: number;
  label?: string;
  size?: number;
}

function getGaugeColor(value: number): string {
  // For Apdex: higher is better (green), lower is worse (red)
  if (value >= 90) return APP_COLORS.hex_73c991;
  if (value >= 70) return APP_COLORS.hex_f79009;
  return APP_COLORS.hex_f04438;
}

/**
 * @param props Component props.
 * @returns Premium semi-circle gauge for 0-100 values.
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
        backgroundColor: [color, `${APP_COLORS.hex_2d2d2d}99`],
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div style={{
      width: size,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '0 auto',
    }}>
      {/* The arc canvas — exactly half the height */}
      <div style={{ width: size, height: size / 2, flexShrink: 0 }}>
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Score + label sit clearly BELOW the arc */}
      <div style={{ marginTop: 10, textAlign: 'center', width: '100%' }}>
        <div style={{
          fontSize: Math.round(size * 0.24),
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: '-0.5px',
        }}>
          {clamped.toFixed(0)}
          <span style={{ fontSize: Math.round(size * 0.14), fontWeight: 500 }}>%</span>
        </div>
        {label && (
          <div style={{
            fontSize: Math.round(size * 0.1),
            color: 'var(--text-muted, #8e8e8e)',
            marginTop: 5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0 4px',
            maxWidth: size,
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

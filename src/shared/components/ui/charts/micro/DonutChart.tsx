import { CHART_THEME_DEFAULTS } from '@shared/utils/chartTheme';

export interface DonutChartSegment {
  readonly color: string;
  readonly label: string;
  readonly value: number;
}

interface DonutChartProps {
  readonly segments: readonly DonutChartSegment[];
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly centerLabel?: string;
  readonly centerValue?: string;
}

export default function DonutChart({
  segments,
  size = 160,
  strokeWidth = 18,
  centerLabel,
  centerValue,
}: DonutChartProps): JSX.Element {
  const safeSegments = segments.filter((segment) => segment.value > 0);
  const total = safeSegments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const trackColor = CHART_THEME_DEFAULTS.borderColor();
  const labelColor = CHART_THEME_DEFAULTS.textMuted();
  const valueColor = CHART_THEME_DEFAULTS.textPrimary();

  let runningLength = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={centerLabel ?? 'Donut chart'}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={`${trackColor}66`}
        strokeWidth={strokeWidth}
      />
      {safeSegments.map((segment) => {
        const segmentLength = total > 0 ? (segment.value / total) * circumference : 0;
        const circle = (
          <circle
            key={segment.label}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            strokeDashoffset={-runningLength}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />
        );
        runningLength += segmentLength;
        return circle;
      })}
      {centerValue ? (
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          fill={valueColor}
          fontSize="20"
          fontWeight="600"
        >
          {centerValue}
        </text>
      ) : null}
      {centerLabel ? (
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          fill={labelColor}
          fontSize="11"
        >
          {centerLabel}
        </text>
      ) : null}
    </svg>
  );
}

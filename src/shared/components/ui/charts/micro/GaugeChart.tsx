import { APP_COLORS } from "@config/colorLiterals";
import { CHART_THEME_DEFAULTS } from "@shared/utils/chartTheme";

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
  label = "",
  size = 120,
}: GaugeChartProps): JSX.Element {
  const clamped = Math.min(Math.max(value, 0), 100);
  const color = getGaugeColor(clamped);
  const trackColor = CHART_THEME_DEFAULTS.borderColor();
  const mutedText = CHART_THEME_DEFAULTS.textMuted();
  const strokeWidth = Math.max(Math.round(size * 0.1), 8);
  const radius = size / 2 - strokeWidth / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const progressLength = (clamped / 100) * halfCircumference;

  return (
    <div
      style={{
        width: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: size,
          height: size / 2 + strokeWidth / 2,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <svg
          width={size}
          height={size / 2 + strokeWidth / 2}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
          role="img"
          aria-label={label || "Gauge chart"}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`${trackColor}99`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${halfCircumference} ${circumference}`}
            transform={`rotate(180 ${center} ${center})`}
          />
          {progressLength > 0 ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${progressLength} ${circumference}`}
              transform={`rotate(180 ${center} ${center})`}
            />
          ) : null}
        </svg>
      </div>

      <div style={{ marginTop: 10, textAlign: "center", width: "100%" }}>
        <div
          style={{
            fontSize: Math.round(size * 0.24),
            fontWeight: 600,
            color,
            lineHeight: 1,
            letterSpacing: "-0.5px",
          }}
        >
          {clamped.toFixed(0)}
          <span style={{ fontSize: Math.round(size * 0.14), fontWeight: 500 }}>%</span>
        </div>
        {label && (
          <div
            style={{
              fontSize: Math.round(size * 0.1),
              color: mutedText,
              marginTop: 5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0 4px",
              maxWidth: size,
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

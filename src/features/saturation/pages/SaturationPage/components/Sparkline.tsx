import { memo, useMemo } from "react";

type Props = {
  series: number[];
  height?: number;
  color?: string;
  ariaLabel?: string;
};

const WIDTH = 200;
const DEFAULT_HEIGHT = 28;
const DEFAULT_COLOR = "var(--accent)";

function buildPath(series: number[], width: number, height: number): string {
  if (series.length === 0) return "";
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = Math.max(0.0001, max - min);
  return series
    .map((value, i) => {
      const x = (i / Math.max(1, series.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 2) - 1;
      const cmd = i === 0 ? "M" : "L";
      return `${cmd}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function SparklineImpl({
  series,
  height = DEFAULT_HEIGHT,
  color = DEFAULT_COLOR,
  ariaLabel,
}: Props): JSX.Element {
  const { line, area } = useMemo(() => {
    const path = buildPath(series, WIDTH, height);
    return { line: path, area: path ? `${path} L ${WIDTH} ${height} L 0 ${height} Z` : "" };
  }, [series, height]);

  if (series.length === 0) {
    return (
      <svg
        className="mt-1 block w-full"
        viewBox={`0 0 ${WIDTH} ${height}`}
        preserveAspectRatio="none"
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel ?? "No data"}
        style={{ height }}
      >
        <text
          x={WIDTH / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          opacity={0.35}
          fontSize={10}
        >
          No data
        </text>
      </svg>
    );
  }

  return (
    <svg
      className="mt-1 block w-full"
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="none"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      style={{ height }}
    >
      {area ? <path d={area} fill={color} opacity={0.16} /> : null}
      {line ? <path d={line} fill="none" stroke={color} strokeWidth={1.5} /> : null}
    </svg>
  );
}

export const Sparkline = memo(SparklineImpl);

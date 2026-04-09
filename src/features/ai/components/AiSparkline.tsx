interface AiSparklineProps {
  values: readonly number[];
  stroke?: string;
  fill?: string;
  height?: number;
}

export function AiSparkline({
  values,
  stroke = "var(--color-primary)",
  fill = "rgba(67, 109, 255, 0.12)",
  height = 56,
}: AiSparklineProps): JSX.Element {
  if (values.length === 0) {
    return (
      <div className="flex h-14 items-center justify-center text-[11px] text-[var(--text-muted)]">
        No trend data
      </div>
    );
  }

  const width = 280;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-14 w-full overflow-visible"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline points={areaPoints} fill={fill} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

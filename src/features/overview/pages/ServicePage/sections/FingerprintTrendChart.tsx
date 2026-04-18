import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { formatNumber } from "@shared/utils/formatters";

import { useFingerprintTrend } from "./useFingerprintTrend";

interface FingerprintTrendChartProps {
  readonly serviceName: string;
  readonly operationName: string;
  readonly exceptionType?: string;
  readonly statusMessage?: string;
  readonly label: string;
}

export default function FingerprintTrendChart({
  serviceName,
  operationName,
  exceptionType,
  statusMessage,
  label,
}: FingerprintTrendChartProps) {
  const { points, loading } = useFingerprintTrend({
    serviceName,
    operationName,
    exceptionType,
    statusMessage,
  });

  if (loading && points.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading trend…</div>;
  }

  if (points.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-muted)]">
        No trend data for this fingerprint in the current range.
      </div>
    );
  }

  const timestamps = points.map((point) => point.timestamp);
  const series = [
    {
      label,
      color: "var(--color-error)",
      values: points.map((point) => point.count),
    },
  ];

  return (
    <ObservabilityChart
      timestamps={timestamps}
      series={series}
      type="area"
      yFormatter={(value) => formatNumber(value)}
      yMin={0}
      height={200}
    />
  );
}

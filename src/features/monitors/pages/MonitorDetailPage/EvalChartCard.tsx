import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import type { ThresholdLine } from "@shared/components/ui/charts/uplotHelpers";
import { memo, useMemo } from "react";
import type { MonitorSeriesResponse } from "../../api/monitorsApi";

interface Props {
  readonly data: MonitorSeriesResponse | undefined;
  readonly loading: boolean;
}

function EvalChartCard({ data, loading }: Props) {
  const timestamps = useMemo(() => {
    if (!data?.points) return [];
    return data.points.map((p) => Math.floor(p.bucketMs / 1000));
  }, [data]);

  const series = useMemo<ObservabilityChartSeries[]>(() => {
    if (!data?.points) return [];
    return [
      {
        label: "Value",
        values: data.points.map((p) => p.value),
        color: "var(--color-error)",
        fill: true,
      },
    ];
  }, [data]);

  const thresholds = useMemo<ThresholdLine[]>(() => {
    if (!data) return [];
    const lines: ThresholdLine[] = [];
    if (data.warnThreshold !== undefined)
      lines.push({ value: data.warnThreshold, color: "var(--color-warning)" });
    if (data.alertThreshold !== undefined)
      lines.push({ value: data.alertThreshold, color: "var(--color-error)" });
    return lines;
  }, [data]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-medium text-foreground text-sm">Evaluation · last 1 hour</div>
          <div className="text-[11px] text-foreground-muted">
            line is monitor value · bands show thresholds
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-3 text-[11px] text-foreground-muted">
            {data.warnThreshold !== undefined && (
              <span className="font-mono">warn ≥ {data.warnThreshold}</span>
            )}
            {data.alertThreshold !== undefined && (
              <span className="font-mono">alert ≥ {data.alertThreshold}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 h-[180px] w-full">
        {loading && !data ? (
          <div className="flex h-full items-center justify-center text-foreground-muted text-xs">
            Loading…
          </div>
        ) : !data || data.points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-foreground-muted text-xs">
            No data yet for this monitor.
          </div>
        ) : (
          <ObservabilityChart
            type="area"
            timestamps={timestamps}
            series={series}
            thresholds={thresholds}
            height={180}
            fillHeight
          />
        )}
      </div>
    </div>
  );
}

export default memo(EvalChartCard);

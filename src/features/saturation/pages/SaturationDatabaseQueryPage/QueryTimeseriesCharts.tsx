import { useMemo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import type { QueryTimeseriesPoint } from "@/features/saturation/api/databaseQueryDetailApi";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

interface ChartSeries {
  readonly timestamps: number[];
  readonly avgMs: Array<number | null>;
  readonly p99Ms: Array<number | null>;
  readonly calls: number[];
}

function buildSeries(points: QueryTimeseriesPoint[]): ChartSeries {
  const rows = points
    .map((p) => ({ ts: Math.floor(new Date(p.time_bucket).getTime() / 1000), p }))
    .filter((r) => Number.isFinite(r.ts))
    .sort((a, b) => a.ts - b.ts);
  return {
    timestamps: rows.map((r) => r.ts),
    avgMs: rows.map((r) => r.p.avg_ms),
    p99Ms: rows.map((r) => r.p.p99_ms),
    calls: rows.map((r) => r.p.call_count),
  };
}

function Empty() {
  return (
    <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
      No samples in this window.
    </div>
  );
}

// Latency (avg + p99 lines) and call-volume (bars) charts from one series.
export function QueryTimeseriesCharts({ timeseries }: { timeseries: QueryTimeseriesPoint[] }) {
  const series = useMemo(() => buildSeries(timeseries), [timeseries]);
  const empty = series.timestamps.length === 0;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard title="Latency over time" subtitle="avg / p99">
        {empty ? (
          <Empty />
        ) : (
          <ObservabilityChart
            timestamps={series.timestamps}
            series={[
              { label: "avg", values: series.avgMs, color: "var(--color-info,#3b82f6)" },
              { label: "p99", values: series.p99Ms, color: "var(--color-error,#ef4444)" },
            ]}
            height={220}
            yFormatter={(v) => fmtMs(v)}
          />
        )}
      </PanelCard>
      <PanelCard title="Calls per interval" subtitle="bucketed call volume">
        {empty ? (
          <Empty />
        ) : (
          <ObservabilityChart
            timestamps={series.timestamps}
            series={[
              { label: "calls", values: series.calls, color: "var(--color-primary,#6366f1)" },
            ]}
            type="bar"
            height={220}
            yFormatter={(v) => fmtNum(v)}
          />
        )}
      </PanelCard>
    </div>
  );
}

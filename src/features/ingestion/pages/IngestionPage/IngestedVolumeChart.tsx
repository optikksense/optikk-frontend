import { useMemo, useState } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import type { TimeseriesSeries } from "../../api/ingestionApi";
import { useIngestionTimeseries } from "../../hooks/useIngestion";
import { SERVICE_PALETTE, SIGNAL_COLORS, fmtCount } from "../../utils/format";

type GroupBy = "type" | "service";

function dateToSeconds(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
}

function colorFor(series: TimeseriesSeries, index: number): string {
  return SIGNAL_COLORS[series.id] ?? SERVICE_PALETTE[index % SERVICE_PALETTE.length];
}

// Cumulatively stack the bands and draw largest first so smaller bands paint on
// top — uplot has no native stacking, so this fakes it with layered area fills.
function stackSeries(series: readonly TimeseriesSeries[]): ObservabilityChartSeries[] {
  const length = series[0]?.data.length ?? 0;
  const cumulative: number[][] = [];
  series.forEach((s, idx) => {
    cumulative[idx] = Array.from(
      { length },
      (_v, i) => (s.data[i] ?? 0) + (idx > 0 ? cumulative[idx - 1][i] : 0)
    );
  });
  return series
    .map((s, idx) => ({
      label: s.label,
      values: cumulative[idx],
      color: colorFor(s, idx),
      fill: true,
    }))
    .reverse();
}

const TOGGLE: { id: GroupBy; label: string }[] = [
  { id: "type", label: "By type" },
  { id: "service", label: "By service" },
];

export function IngestedVolumeChart() {
  const [groupBy, setGroupBy] = useState<GroupBy>("type");
  const { data, isPending, isError } = useIngestionTimeseries(groupBy);

  const timestamps = useMemo(() => (data?.dates ?? []).map(dateToSeconds), [data?.dates]);
  const series = useMemo(() => stackSeries(data?.series ?? []), [data?.series]);

  const toggle = (
    <div className="inline-flex gap-0.5 rounded-md bg-secondary p-0.5">
      {TOGGLE.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setGroupBy(opt.id)}
          className={`rounded px-2.5 py-1 font-semibold text-[12px] transition-colors ${
            groupBy === opt.id
              ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <PanelCard
      title="Ingested volume"
      subtitle="records per day · stacked · current month to date"
      action={toggle}
    >
      {isError ? (
        <div className="grid h-[320px] place-items-center text-[12px] text-foreground-muted">
          Could not load ingestion volume.
        </div>
      ) : isPending || timestamps.length === 0 ? (
        <div className="grid h-[320px] place-items-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No ingestion in this period."}
        </div>
      ) : (
        <>
          <ObservabilityChart
            timestamps={timestamps}
            series={series}
            type="area"
            height={320}
            yFormatter={fmtCount}
            xFormatter={(s) =>
              new Intl.DateTimeFormat(undefined, {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              }).format(new Date(s * 1000))
            }
          />
          <div className="mt-3 flex flex-wrap gap-4 border-border border-t pt-3">
            {(data?.series ?? []).map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: colorFor(s, idx) }}
                />
                <span className="text-[13px] text-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </PanelCard>
  );
}

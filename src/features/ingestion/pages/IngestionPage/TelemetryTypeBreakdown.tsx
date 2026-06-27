import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import type { IngestionSummary } from "../../api/ingestionApi";
import { SIGNAL_COLORS, fmtCount } from "../../utils/format";

interface Props {
  readonly summary: IngestionSummary | undefined;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}

// Share of total ingest per telemetry type, with the data-backed metrics
// cardinality footer replacing the mockup's (unbacked) indexed/retained note.
export function TelemetryTypeBreakdown({ summary }: Props) {
  return (
    <PanelCard title="By telemetry type" subtitle="share of total ingested this period">
      <div className="flex flex-col gap-4">
        {(summary?.byType ?? []).map((row) => (
          <div key={row.type}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-medium text-[13px] text-foreground">{row.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="mono font-semibold text-[13px] text-foreground">
                  {fmtCount(row.records)}
                </span>
                <span className="mono text-[12px] text-foreground-muted">
                  {Math.round(row.pct)}%
                </span>
              </div>
            </div>
            <Bar pct={row.pct} color={SIGNAL_COLORS[row.type] ?? "var(--color-info,#3b82f6)"} />
          </div>
        ))}
      </div>

      <div className="my-4 h-px bg-border" />

      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-foreground-muted">Active timeseries</span>
        <span className="mono text-[12.5px] text-foreground">
          {fmtCount(summary?.activeTimeseries)}
        </span>
      </div>
      <div className="mt-1.5 text-[12px] text-foreground-muted leading-relaxed">
        Top by cardinality:{" "}
        <span className="mono text-foreground">{summary?.topCardinalityMetric.name || "—"}</span> ·{" "}
        {fmtCount(summary?.topCardinalityMetric.timeseries)} series
      </div>
    </PanelCard>
  );
}

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

function dailyAvg(records: number | undefined, days: number | undefined): number {
  if (!records || !days) return 0;
  return records / days;
}

// Per-signal summary cards. Metrics is expressed in active timeseries (its real
// count) rather than datapoints, matching the mockup's framing.
export function SignalPillars({ summary }: Props) {
  const days = summary?.daysElapsed;
  const logs = summary?.byType.find((t) => t.type === "logs");
  const spans = summary?.byType.find((t) => t.type === "spans");
  const metrics = summary?.byType.find((t) => t.type === "metrics");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <PanelCard title="Logs" subtitle="record volume this period">
        <div className="mono mb-3 font-bold text-[20px] text-foreground">
          {fmtCount(logs?.records)}
        </div>
        <Bar pct={logs?.pct ?? 0} color={SIGNAL_COLORS.logs} />
        <div className="mt-3 flex justify-between text-[12px] text-foreground-muted">
          <span>{Math.round(logs?.pct ?? 0)}% of ingest</span>
          <span className="mono">{fmtCount(dailyAvg(logs?.records, days))} / day</span>
        </div>
      </PanelCard>

      <PanelCard title="Spans (APM)" subtitle="span volume this period">
        <div className="mono mb-3 font-bold text-[20px] text-foreground">
          {fmtCount(spans?.records)}
        </div>
        <Bar pct={spans?.pct ?? 0} color={SIGNAL_COLORS.spans} />
        <div className="mt-3 flex justify-between text-[12px] text-foreground-muted">
          <span>{Math.round(spans?.pct ?? 0)}% of ingest</span>
          <span className="mono">{fmtCount(dailyAvg(spans?.records, days))} / day</span>
        </div>
      </PanelCard>

      <PanelCard title="Custom metrics" subtitle="active timeseries & cardinality">
        <div className="mono mb-3 font-bold text-[20px] text-foreground">
          {fmtCount(summary?.activeTimeseries)}
        </div>
        <Bar pct={metrics?.pct ?? 0} color={SIGNAL_COLORS.metrics} />
        <div className="mt-3 flex justify-between text-[12px] text-foreground-muted">
          <span>{fmtCount(metrics?.records)} datapoints</span>
          <span className="mono">{Math.round(metrics?.pct ?? 0)}% of ingest</span>
        </div>
      </PanelCard>
    </div>
  );
}

import { DatabaseZap } from "lucide-react";

import { useIngestionServices, useIngestionSummary } from "../../hooks/useIngestion";
import { IngestedVolumeChart } from "./IngestedVolumeChart";
import { IngestionKpiStrip } from "./IngestionKpiStrip";
import { SignalPillars } from "./SignalPillars";
import { TelemetryTypeBreakdown } from "./TelemetryTypeBreakdown";
import { TopServicesTable } from "./TopServicesTable";

function PaceBadge({ onPace, pct }: { onPace: boolean; pct: number }) {
  const tone = onPace ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-[12px] ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {onPace ? "On pace" : "Over pace"} · {Math.round(pct)}% of commit
    </span>
  );
}

export default function IngestionPage(): JSX.Element {
  const summaryQ = useIngestionSummary();
  const servicesQ = useIngestionServices();
  const summary = summaryQ.data;

  return (
    <div className="flex min-w-0 flex-col gap-5 px-1 pt-1 pb-7">
      <header className="flex items-center gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-info-subtle text-info">
          <DatabaseZap size={20} />
        </span>
        <div className="min-w-0">
          <h1 className="font-bold text-[22px] text-foreground tracking-tight">Data Ingestion</h1>
          <p className="text-[13px] text-foreground-muted">
            Usage across logs, spans and custom metrics · current billing month · measured in record
            counts
          </p>
        </div>
        <div className="flex-1" />
        {summary && <PaceBadge onPace={summary.onPace} pct={summary.projectedPct} />}
      </header>

      {summaryQ.isError ? (
        <div
          className="rounded-lg border border-[color-mix(in_oklch,var(--color-error),transparent_65%)] bg-error-subtle px-3.5 py-2.5 text-[12.5px] text-error"
          role="alert"
        >
          Could not load ingestion summary: {summaryQ.error.message}
        </div>
      ) : null}

      <IngestionKpiStrip summary={summary} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.1fr_1fr]">
        <IngestedVolumeChart />
        <TelemetryTypeBreakdown summary={summary} />
      </div>

      <SignalPillars summary={summary} />

      <TopServicesTable data={servicesQ.data} isPending={servicesQ.isPending} />
    </div>
  );
}

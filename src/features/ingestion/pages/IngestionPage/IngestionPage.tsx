import { DatabaseZap } from "lucide-react";
import { useState } from "react";

import {
  useIngestionCost,
  useIngestionServices,
  useIngestionSummary,
} from "../../hooks/useIngestion";
import type { IngestionUnit } from "../../utils/format";
import { CostBreakdown } from "./CostBreakdown";
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

const UNITS: { id: IngestionUnit; label: string }[] = [
  { id: "records", label: "Records" },
  { id: "bytes", label: "Volume" },
];

function UnitToggle({
  unit,
  onChange,
}: { unit: IngestionUnit; onChange: (u: IngestionUnit) => void }) {
  return (
    <div className="inline-flex gap-0.5 rounded-md bg-secondary p-0.5">
      {UNITS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded px-2.5 py-1 font-semibold text-[12px] transition-colors ${
            unit === opt.id
              ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function IngestionPage(): JSX.Element {
  const [unit, setUnit] = useState<IngestionUnit>("records");
  const summaryQ = useIngestionSummary();
  const servicesQ = useIngestionServices();
  const costQ = useIngestionCost();
  const summary = summaryQ.data;

  const onPace = unit === "bytes" ? summary?.onPaceBytes : summary?.onPace;
  const pacePct = unit === "bytes" ? summary?.projectedBytesPct : summary?.projectedPct;

  return (
    <div className="flex min-w-0 flex-col gap-5 px-1 pt-1 pb-7">
      <header className="flex items-center gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-info-subtle text-info">
          <DatabaseZap size={20} />
        </span>
        <div className="min-w-0">
          <h1 className="font-bold text-[22px] text-foreground tracking-tight">Data Ingestion</h1>
          <p className="text-[13px] text-foreground-muted">
            Usage across logs, spans and custom metrics · current billing month
          </p>
        </div>
        <div className="flex-1" />
        <UnitToggle unit={unit} onChange={setUnit} />
        {summary && <PaceBadge onPace={Boolean(onPace)} pct={pacePct ?? 0} />}
      </header>

      {summaryQ.isError ? (
        <div
          className="rounded-lg border border-[color-mix(in_oklch,var(--color-error),transparent_65%)] bg-error-subtle px-3.5 py-2.5 text-[12.5px] text-error"
          role="alert"
        >
          Could not load ingestion summary: {summaryQ.error.message}
        </div>
      ) : null}

      <IngestionKpiStrip summary={summary} unit={unit} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.1fr_1fr]">
        <IngestedVolumeChart unit={unit} />
        <TelemetryTypeBreakdown summary={summary} unit={unit} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.1fr_1fr]">
        <CostBreakdown cost={costQ.data} />
      </div>

      <SignalPillars summary={summary} unit={unit} />

      <TopServicesTable data={servicesQ.data} isPending={servicesQ.isPending} unit={unit} />
    </div>
  );
}

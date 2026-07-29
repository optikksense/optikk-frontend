import { useState } from "react";

import { MetricSegmentedControl } from "@shared/metrics/components/MetricSegmentedControl";

import { useIngestionOverview } from "../../hooks/useIngestion";
import { CostBreakdown } from "./ingestion/CostBreakdown";
import { IngestedVolumeChart } from "./ingestion/IngestedVolumeChart";
import { IngestionKpiStrip } from "./ingestion/IngestionKpiStrip";
import { SignalPillars } from "./ingestion/SignalPillars";
import { TelemetryTypeBreakdown } from "./ingestion/TelemetryTypeBreakdown";
import { TopServicesTable } from "./ingestion/TopServicesTable";
import type { IngestionUnit } from "./ingestion/format";

const UNITS = [
  { value: "records", label: "Records" },
  { value: "bytes", label: "Volume" },
] as const satisfies ReadonlyArray<{ value: IngestionUnit; label: string }>;

export default function SettingsIngestionTab(): JSX.Element {
  const [unit, setUnit] = useState<IngestionUnit>("records");
  const overviewQ = useIngestionOverview();
  const overview = overviewQ.data;
  const summary = overview?.summary;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <header className="flex items-center gap-4">
        <p className="m-0 min-w-0 flex-1 text-[13px] text-foreground-muted">
          Estimated accepted usage across logs, spans and custom metrics · current billing month
        </p>
        <MetricSegmentedControl options={UNITS} value={unit} onChange={setUnit} size="sm" />
      </header>

      {overviewQ.isError ? (
        <div
          className="rounded-lg border border-[color-mix(in_oklch,var(--color-error),transparent_65%)] bg-error-subtle px-3.5 py-2.5 text-[12.5px] text-error"
          role="alert"
        >
          Could not load ingestion overview: {overviewQ.error.message}
        </div>
      ) : null}

      <IngestionKpiStrip summary={summary} unit={unit} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.1fr_1fr]">
        <IngestedVolumeChart
          unit={unit}
          byType={overview?.timeseriesByType}
          byService={overview?.timeseriesByService}
          isPending={overviewQ.isPending}
          isError={overviewQ.isError}
        />
        <TelemetryTypeBreakdown summary={summary} unit={unit} />
      </div>

      {/* Same column track as the chart above so the cards line up. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.1fr_1fr]">
        <CostBreakdown cost={overview?.cost} />
      </div>

      <SignalPillars summary={summary} unit={unit} />

      <TopServicesTable data={overview?.services} isPending={overviewQ.isPending} unit={unit} />
    </div>
  );
}

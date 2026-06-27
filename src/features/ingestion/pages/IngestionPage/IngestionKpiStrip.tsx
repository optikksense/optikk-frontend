import { KpiCard } from "@shared/components/ui/dashboard/KpiCard";

import type { IngestionSummary } from "../../api/ingestionApi";
import { fmtCount } from "../../utils/format";

interface Props {
  readonly summary: IngestionSummary | undefined;
}

function pctLabel(value: number | undefined): string {
  return value == null ? "—" : `${Math.round(value)}%`;
}

function peakDate(date: string | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

// Four data-backed tiles mirroring the mockup, denominated in record counts.
export function IngestionKpiStrip({ summary }: Props) {
  const projectionWarn = (summary?.projectedPct ?? 0) >= 90;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total ingested · this month"
        value={fmtCount(summary?.totals.records)}
        secondary="records"
        subtext="logs + spans + metric datapoints"
      />
      <KpiCard
        label="Projected month-end"
        value={fmtCount(summary?.projectedRecords)}
        secondary="records"
        subtext={`${pctLabel(summary?.projectedPct)} of ${fmtCount(summary?.commitmentRecords)} commitment`}
        tone={projectionWarn ? "warn" : "ok"}
      />
      <KpiCard
        label="Used of commitment"
        value={pctLabel(summary?.commitmentUsedPct)}
        subtext={
          summary
            ? `${fmtCount(summary.totals.records)} / ${fmtCount(summary.commitmentRecords)} · day ${summary.daysElapsed}/${summary.daysInMonth}`
            : undefined
        }
      />
      <KpiCard
        label="Daily average"
        value={fmtCount(summary?.dailyAverage)}
        secondary="records / day"
        subtext={
          summary
            ? `peak ${fmtCount(summary.peak.records)} · ${peakDate(summary.peak.date)}`
            : undefined
        }
      />
    </div>
  );
}

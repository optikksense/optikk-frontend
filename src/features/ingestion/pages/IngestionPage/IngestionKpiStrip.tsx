import { KpiCard } from "@shared/components/ui/dashboard/KpiCard";

import type { IngestionSummary } from "../../api/ingestionApi";
import { type IngestionUnit, fmtValue } from "../../utils/format";

interface Props {
  readonly summary: IngestionSummary | undefined;
  readonly unit: IngestionUnit;
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

// Four data-backed tiles, denominated in the active unit (records or volume).
export function IngestionKpiStrip({ summary, unit }: Props) {
  const bytes = unit === "bytes";
  const total = bytes ? summary?.totals.bytes : summary?.totals.records;
  const projected = bytes ? summary?.projectedBytes : summary?.projectedRecords;
  const projectedPct = bytes ? summary?.projectedBytesPct : summary?.projectedPct;
  const usedPct = bytes ? summary?.commitmentUsedBytesPct : summary?.commitmentUsedPct;
  const commitment = bytes ? summary?.commitmentBytes : summary?.commitmentRecords;
  const dailyAvg = bytes ? summary?.dailyAverageBytes : summary?.dailyAverage;
  const peak = bytes ? summary?.peak.bytes : summary?.peak.records;
  const secondary = bytes ? "ingested" : "records";
  const projectionWarn = (projectedPct ?? 0) >= 90;
  const fmt = (n: number | undefined) => fmtValue(unit, n);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total ingested · this month"
        value={fmt(total)}
        secondary={secondary}
        subtext="logs + spans + metric datapoints"
      />
      <KpiCard
        label="Projected month-end"
        value={fmt(projected)}
        secondary={secondary}
        subtext={`${pctLabel(projectedPct)} of ${fmt(commitment)} commitment · from last 7d`}
        tone={projectionWarn ? "warn" : "ok"}
      />
      <KpiCard
        label="Used of commitment"
        value={pctLabel(usedPct)}
        subtext={
          summary
            ? `${fmt(total)} / ${fmt(commitment)} · day ${summary.daysElapsed}/${summary.daysInMonth}`
            : undefined
        }
      />
      <KpiCard
        label="Daily average"
        value={fmt(dailyAvg)}
        secondary={bytes ? "ingested / day" : "records / day"}
        subtext={summary ? `peak ${fmt(peak)} · ${peakDate(summary.peak.date)}` : undefined}
      />
    </div>
  );
}

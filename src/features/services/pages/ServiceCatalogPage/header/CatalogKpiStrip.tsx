import { KpiCard, type KpiDelta, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";

import { fmtMs, fmtNum } from "../../ServiceDetailPage/formatters";
import type { CatalogAggregate } from "../hooks/useCatalogAggregate";

function toDelta(pct: number | null): KpiDelta | null {
  if (pct == null) return null;
  const v = pct * 100;
  if (Math.abs(v) < 0.5) return { label: "vs prev", direction: "flat" };
  return { label: `${v > 0 ? "+" : ""}${v.toFixed(1)}% vs prev`, direction: v > 0 ? "up" : "down" };
}

function p99Tone(ms: number): KpiTone {
  if (ms >= 1000) return "err";
  if (ms >= 500) return "warn";
  return "ok";
}

/** Catalog-level KPI strip — the 3 cards backed by RED telemetry. (Active-alerts
 *  and SLOs-at-risk from the design are omitted: no backend source.) */
export function CatalogKpiStrip({ aggregate }: { aggregate: CatalogAggregate }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard
        label="Services"
        value={String(aggregate.totalServices)}
        subtext={`${aggregate.healthy} healthy · ${aggregate.unhealthy} unhealthy`}
        tone="neutral"
      />
      <KpiCard
        label="Total request rate"
        value={fmtNum(aggregate.totalRps)}
        secondary="rps"
        delta={toDelta(aggregate.rpsDeltaPct)}
        tone="ok"
      />
      <KpiCard
        label="P99 (weighted)"
        value={fmtMs(aggregate.weightedP99Ms)}
        delta={toDelta(aggregate.p99DeltaPct)}
        tone={p99Tone(aggregate.weightedP99Ms)}
      />
    </div>
  );
}

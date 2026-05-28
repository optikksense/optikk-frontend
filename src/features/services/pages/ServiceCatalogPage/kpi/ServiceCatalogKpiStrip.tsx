import { KpiCard } from "@shared/components/ui/dashboard/KpiCard";

import { fmtMs, fmtNum } from "../../ServiceDetailPage/formatters";
import type { CatalogAggregate } from "../hooks/useCatalogAggregate";

interface ServiceCatalogKpiStripProps {
  readonly aggregate: CatalogAggregate;
}

function unhealthyText(aggregate: CatalogAggregate): string {
  const unhealthy = aggregate.warn + aggregate.error;
  return `${aggregate.healthy} healthy · ${unhealthy} unhealthy`;
}

export function ServiceCatalogKpiStrip({ aggregate }: ServiceCatalogKpiStripProps) {
  const p99Tone = aggregate.avgP99Ms >= 2000 ? "err" : aggregate.avgP99Ms >= 1000 ? "warn" : "ok";
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        label="Services"
        value={String(aggregate.totalServices)}
        subtext={unhealthyText(aggregate)}
      />
      <KpiCard label="Total request rate" value={fmtNum(aggregate.totalRps)} secondary="rps" />
      <KpiCard
        label="p99 (weighted)"
        value={fmtMs(aggregate.avgP99Ms)}
        tone={p99Tone}
        subtext="across fleet"
      />
      <KpiCard
        label="SLOs at risk"
        value={String(aggregate.slosAtRisk)}
        tone={aggregate.slosAtRisk > 0 ? "warn" : "ok"}
        subtext={`${aggregate.deploys24h} deploys · 24h`}
      />
      <KpiCard
        label="Deploys · 24h"
        value={String(aggregate.deploys24h)}
        subtext="latest per service"
      />
    </div>
  );
}

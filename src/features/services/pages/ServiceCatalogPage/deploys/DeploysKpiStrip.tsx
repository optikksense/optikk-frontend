import { KpiCard } from "@shared/components/ui/dashboard/KpiCard";

import type { DeploysData } from "./useDeploysData";

interface DeploysKpiStripProps {
  readonly data: DeploysData;
}

export function DeploysKpiStrip({ data }: DeploysKpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard
        label="Deploys · window"
        value={String(data.inWindowCount)}
        subtext="in selected range"
      />
      <KpiCard
        label="Services tracked"
        value={String(data.rows.length)}
        subtext="with deploy history"
      />
      <KpiCard
        label="Active versions"
        value={String(data.activeVersions)}
        subtext="currently live"
      />
    </div>
  );
}

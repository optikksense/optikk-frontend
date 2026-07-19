import { LatencyPercentilesChart } from "@/features/saturation/pages/SaturationDatabasePage/charts/LatencyPercentilesChart";
import { DatabaseKpiStrip } from "@/features/saturation/pages/SaturationDatabasePage/kpi/DatabaseKpiStrip";

import { QpsChart } from "../charts/QpsChart";

// Per-instance overview: headline KPIs plus latency + throughput trends, all
// scoped to this datastore via the dbSystem filter.
export function DatabaseOverviewTab({ system }: { system: string }) {
  return (
    <div className="flex flex-col gap-4">
      <DatabaseKpiStrip summary={undefined} system={system} />
      <LatencyPercentilesChart system={system} />
      <QpsChart system={system} />
    </div>
  );
}

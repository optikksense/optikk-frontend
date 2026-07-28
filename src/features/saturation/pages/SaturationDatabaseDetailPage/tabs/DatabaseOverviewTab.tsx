import { LatencyPercentilesChart } from "@/features/saturation/pages/SaturationDatabasePage/charts/LatencyPercentilesChart";
import { DatabaseKpiStrip } from "@/features/saturation/pages/SaturationDatabasePage/kpi/DatabaseKpiStrip";

import { QpsChart } from "../charts/QpsChart";

                                                                             
                                                    
export function DatabaseOverviewTab({ system }: { system: string }) {
  return (
    <div className="flex flex-col gap-4">
      <DatabaseKpiStrip summary={undefined} system={system} />
      <LatencyPercentilesChart system={system} />
      <QpsChart system={system} />
    </div>
  );
}

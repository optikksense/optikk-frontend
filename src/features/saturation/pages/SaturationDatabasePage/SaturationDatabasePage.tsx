import { PageShell } from "@shared/components/ui";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { LatencyPercentilesChart } from "./charts/LatencyPercentilesChart";
import { QpsChart } from "./charts/QpsChart";
import { DatabasePageHeader } from "./header/DatabasePageHeader";
import { useDatabaseSummary } from "./hooks/useDatabaseSummary";
import { DatabaseKpiStrip } from "./kpi/DatabaseKpiStrip";
import { SlowQueriesPreviewTable } from "./tables/SlowQueriesPreviewTable";
import { SystemsTable } from "./tables/SystemsTable";

export default function SaturationDatabasePage() {
  const summaryQ = useDatabaseSummary();
  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <DatabasePageHeader summary={summaryQ.data} />
        <SaturationSubnav
          active="database"
          counts={{ database: summaryQ.data?.database_systems }}
        />
        <DatabaseKpiStrip summary={summaryQ.data} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <QpsChart />
          <LatencyPercentilesChart />
        </div>
        <SystemsTable />
        <SlowQueriesPreviewTable />
      </div>
    </PageShell>
  );
}

import { PageShell } from "@shared/components/ui";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { LatencyPercentilesChart } from "./charts/LatencyPercentilesChart";
import { DatabasePageHeader } from "./header/DatabasePageHeader";
import { useDatabaseSummary } from "./hooks/useDatabaseSummary";
import { DatabaseKpiStrip } from "./kpi/DatabaseKpiStrip";
import { SlowQueriesPreviewTable } from "./tables/SlowQueriesPreviewTable";

const ERROR_RATE_DEGRADED = 0.01;
const P95_DEGRADED_MS = 1000;

export default function SaturationDatabasePage() {
  const summaryQ = useDatabaseSummary();
  const summary = summaryQ.data;
  const degraded =
    summary &&
    (summary.error_rate >= ERROR_RATE_DEGRADED || summary.p95_latency_ms >= P95_DEGRADED_MS)
      ? {
          label:
            summary.error_rate >= ERROR_RATE_DEGRADED
              ? `degraded · error rate ${(summary.error_rate * 100).toFixed(1)}%`
              : `degraded · p95 ${Math.round(summary.p95_latency_ms)}ms`,
        }
      : null;

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <DatabasePageHeader summary={summary} degraded={degraded} />
        <SaturationSubnav active="database" counts={{ database: summary?.database_systems }} />
        <DatabaseKpiStrip summary={summary} />
        <LatencyPercentilesChart />
        <SlowQueriesPreviewTable />
      </div>
    </PageShell>
  );
}

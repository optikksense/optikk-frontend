import { QueryPerformancePanel } from "../QueryPerformancePanel";

// Per-instance overview: headline KPIs plus latency + throughput trends, all
// scoped to this datastore via the dbSystem filter.
export function DatabaseOverviewTab({ system }: { system: string }) {
  return <QueryPerformancePanel system={system} />;
}

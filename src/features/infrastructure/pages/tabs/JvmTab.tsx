import { Card } from "@shared/components/primitives/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber, formatPercentage } from "@shared/utils/formatters";

import { infraGet } from "../../api/infrastructureApi";
import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";
import type { HistogramSummary, JvmCpuStats } from "../../types";

export default function JvmTab() {
  const gcQuery = useTimeRangeQuery<HistogramSummary>(
    "infra-jvm-gc-hist",
    async (teamId, start, end) => {
      if (!teamId) return { p50: 0, p95: 0, p99: 0, avg: 0 };
      return infraGet<HistogramSummary>(
        "/v1/infrastructure/jvm/gc-duration",
        teamId,
        Number(start),
        Number(end)
      );
    }
  );

  const jvmCpuQuery = useTimeRangeQuery<JvmCpuStats>(
    "infra-jvm-cpu",
    async (teamId, start, end) => {
      if (!teamId) return { cpu_time_value: 0, recent_utilization: 0 };
      return infraGet<JvmCpuStats>(
        "/v1/infrastructure/jvm/cpu",
        teamId,
        Number(start),
        Number(end)
      );
    }
  );

  const gc = gcQuery.data;
  const jcpu = jvmCpuQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            GC p95
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatNumber(gc?.p95 ?? 0)} ms
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            GC p99
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatNumber(gc?.p99 ?? 0)} ms
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            JVM CPU util
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatPercentage(jcpu?.recent_utilization ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            JVM CPU time (ns)
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatNumber(jcpu?.cpu_time_value ?? 0)}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-jvm-mem"
            endpoint="/v1/infrastructure/jvm/memory"
            title="JVM memory pools"
            groupByField="pool_name"
            valueField="used"
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-jvm-gc-collections"
            endpoint="/v1/infrastructure/jvm/gc-collections"
            title="GC collections"
            groupByField="collector"
            valueField="value"
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-jvm-threads"
            endpoint="/v1/infrastructure/jvm/threads"
            title="Threads"
            groupByField="daemon"
            valueField="value"
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-jvm-buffers"
            endpoint="/v1/infrastructure/jvm/buffers"
            title="Buffer pools"
            groupByField="pool_name"
            valueField="memory_usage"
          />
        </Card>
      </div>
    </div>
  );
}

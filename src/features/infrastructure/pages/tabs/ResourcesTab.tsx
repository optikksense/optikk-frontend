import { Card } from "@shared/components/primitives/ui";

import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";
import { InfraResourceSummaryStrip } from "../../components/InfraStatGrid";

export default function ResourcesTab() {
  return (
    <div className="flex flex-col gap-6">
      <InfraResourceSummaryStrip />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-cpu-usage-pct"
            endpoint="/v1/infrastructure/cpu/usage-percentage"
            title="CPU usage %"
            groupByField="pod"
            valueField="value"
            formatType="percentage"
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-mem-usage-pct"
            endpoint="/v1/infrastructure/memory/usage-percentage"
            title="Memory usage %"
            groupByField="pod"
            valueField="value"
            formatType="percentage"
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-disk-io"
            endpoint="/v1/infrastructure/disk/io"
            title="Disk I/O"
            groupByField="direction"
            valueField="value"
            formatType="bytes"
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-net-io"
            endpoint="/v1/infrastructure/network/io"
            title="Network I/O"
            groupByField="direction"
            valueField="value"
            formatType="bytes"
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-cpu-time"
            endpoint="/v1/infrastructure/cpu/time"
            title="CPU time by state"
            groupByField="state"
            valueField="value"
            formatType="duration"
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-mem-usage-state"
            endpoint="/v1/infrastructure/memory/usage"
            title="Memory by state"
            groupByField="state"
            valueField="value"
            formatType="bytes"
          />
        </Card>
      </div>
    </div>
  );
}

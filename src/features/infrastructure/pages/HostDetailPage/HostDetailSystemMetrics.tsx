import { Card } from "@shared/components/primitives/ui";

import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";

interface HostDetailSystemMetricsProps {
  readonly host: string;
}

export function HostDetailSystemMetrics({ host }: HostDetailSystemMetricsProps) {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <div className="font-semibold text-[13px] text-foreground">System metrics</div>
        <div className="text-[11px] text-foreground-muted">
          CPU · memory · disk · network — last 1 hour
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" className="min-h-[280px] border-border">
          <InfraMultiSeriesChart
            queryKey={`host-cpu-${host}`}
            endpoint="/v1/infrastructure/cpu/by-instance"
            title="CPU"
            groupByField="host"
            valueField="value"
            formatType="percentage"
            extraParams={{ host }}
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-border">
          <InfraMultiSeriesChart
            queryKey={`host-mem-${host}`}
            endpoint="/v1/infrastructure/memory/by-instance"
            title="Memory"
            groupByField="host"
            valueField="value"
            formatType="percentage"
            extraParams={{ host }}
          />
        </Card>
      </div>
    </section>
  );
}

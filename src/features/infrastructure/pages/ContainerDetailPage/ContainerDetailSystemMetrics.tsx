import { Card } from "@shared/components/primitives/ui";

import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";

interface ContainerDetailSystemMetricsProps {
  readonly container: string;
  readonly host: string;
  readonly serviceName: string;
}

export function ContainerDetailSystemMetrics({
  container,
  host,
  serviceName,
}: ContainerDetailSystemMetricsProps) {
  const extraParams = { host, pod: container, serviceName };
  return (
    <section className="flex flex-col gap-3">
      <header>
        <div className="font-semibold text-[13px] text-[var(--text-primary)]">Container metrics</div>
        <div className="text-[11px] text-[var(--text-muted)]">
          CPU · memory · network · disk — last 1 hour
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`container-cpu-${container}`}
            endpoint="/v1/infrastructure/cpu/by-instance"
            title="CPU"
            groupByField="pod"
            valueField="value"
            formatType="percentage"
            extraParams={extraParams}
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`container-mem-${container}`}
            endpoint="/v1/infrastructure/memory/by-instance"
            title="Memory"
            groupByField="pod"
            valueField="value"
            formatType="percentage"
            extraParams={extraParams}
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`container-net-${container}`}
            endpoint="/v1/infrastructure/network/by-instance"
            title="Network"
            groupByField="pod"
            valueField="value"
            formatType="bytes"
            extraParams={extraParams}
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`container-disk-${container}`}
            endpoint="/v1/infrastructure/disk/by-instance"
            title="Disk"
            groupByField="pod"
            valueField="value"
            formatType="percentage"
            extraParams={extraParams}
          />
        </Card>
      </div>
    </section>
  );
}

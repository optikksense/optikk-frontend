import { Card } from "@shared/components/primitives/ui";

import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";
import { InfraResourceSummaryStrip } from "../../components/InfraStatGrid";

interface PanelConfig {
  readonly queryKey: string;
  readonly endpoint: string;
  readonly title: string;
  readonly groupByField: string;
  readonly valueField?: string;
  readonly formatType?: "bytes" | "percentage" | "duration" | "number";
}

const PANELS: readonly PanelConfig[] = [
  {
    queryKey: "infra-cpu-usage-pct",
    endpoint: "/v1/infrastructure/cpu/usage-percentage",
    title: "CPU usage %",
    groupByField: "pod",
    formatType: "percentage",
  },
  {
    queryKey: "infra-cpu-process-count",
    endpoint: "/v1/infrastructure/cpu/process-count",
    title: "Process count",
    groupByField: "pod",
    formatType: "number",
  },
  {
    queryKey: "infra-mem-usage-pct",
    endpoint: "/v1/infrastructure/memory/usage-percentage",
    title: "Memory usage %",
    groupByField: "pod",
    formatType: "percentage",
  },
  {
    queryKey: "infra-mem-swap",
    endpoint: "/v1/infrastructure/memory/swap",
    title: "Swap usage",
    groupByField: "state",
    formatType: "bytes",
  },
  {
    queryKey: "infra-disk-io",
    endpoint: "/v1/infrastructure/disk/io",
    title: "Disk I/O",
    groupByField: "direction",
    formatType: "bytes",
  },
  {
    queryKey: "infra-disk-operations",
    endpoint: "/v1/infrastructure/disk/operations",
    title: "Disk operations",
    groupByField: "direction",
    formatType: "number",
  },
  {
    queryKey: "infra-disk-io-time",
    endpoint: "/v1/infrastructure/disk/io-time",
    title: "Disk I/O time",
    groupByField: "device",
    formatType: "duration",
  },
  {
    queryKey: "infra-disk-fs-usage",
    endpoint: "/v1/infrastructure/disk/filesystem-usage",
    title: "Filesystem usage",
    groupByField: "mountpoint",
    formatType: "bytes",
  },
  {
    queryKey: "infra-disk-fs-util",
    endpoint: "/v1/infrastructure/disk/filesystem-utilization",
    title: "Filesystem utilization",
    groupByField: "mountpoint",
    formatType: "percentage",
  },
  {
    queryKey: "infra-net-io",
    endpoint: "/v1/infrastructure/network/io",
    title: "Network I/O",
    groupByField: "direction",
    formatType: "bytes",
  },
  {
    queryKey: "infra-net-packets",
    endpoint: "/v1/infrastructure/network/packets",
    title: "Network packets",
    groupByField: "direction",
    formatType: "number",
  },
  {
    queryKey: "infra-net-errors",
    endpoint: "/v1/infrastructure/network/errors",
    title: "Network errors",
    groupByField: "direction",
    formatType: "number",
  },
  {
    queryKey: "infra-net-dropped",
    endpoint: "/v1/infrastructure/network/dropped",
    title: "Network dropped",
    groupByField: "direction",
    formatType: "number",
  },
  {
    queryKey: "infra-net-connections",
    endpoint: "/v1/infrastructure/network/connections",
    title: "Network connections",
    groupByField: "state",
    formatType: "number",
  },
  {
    queryKey: "infra-cpu-time",
    endpoint: "/v1/infrastructure/cpu/time",
    title: "CPU time by state",
    groupByField: "state",
    formatType: "duration",
  },
  {
    queryKey: "infra-mem-usage-state",
    endpoint: "/v1/infrastructure/memory/usage",
    title: "Memory by state",
    groupByField: "state",
    formatType: "bytes",
  },
];

export default function ResourcesTab() {
  return (
    <div className="flex flex-col gap-6">
      <InfraResourceSummaryStrip />

      <div className="grid gap-4 lg:grid-cols-2">
        {PANELS.map((p) => (
          <Card key={p.queryKey} padding="md" className="min-h-[300px] border-[var(--border-color)]">
            <InfraMultiSeriesChart
              queryKey={p.queryKey}
              endpoint={p.endpoint}
              title={p.title}
              groupByField={p.groupByField}
              valueField={p.valueField ?? "value"}
              formatType={p.formatType}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card } from "@shared/components/primitives/ui";

import { type HostMetricGroup, hostSeriesEndpoint } from "../../api/hostDetailApi";
import { type ChartDef, SeriesChartCard, availableCharts } from "../../components/SeriesChartCard";

interface HostDetailSystemMetricsProps {
  readonly host: string;
  /** Metric groups the host reports; null while the overview is loading. */
  readonly availableMetrics: readonly string[] | null;
}

const SYSTEM_CHARTS: readonly ChartDef<HostMetricGroup>[] = [
  { group: "cpu", title: "CPU utilization", label: "CPU %", format: "percentage" },
  { group: "load", title: "Load average", label: "Load", format: "number" },
  { group: "memory", title: "Memory usage", label: "Bytes", format: "bytes" },
  { group: "filesystem", title: "Filesystem usage", label: "Used %", format: "percentage" },
  { group: "disk_io", title: "Disk I/O", label: "Bytes/s", format: "bytes" },
];

export function HostDetailSystemMetrics({ host, availableMetrics }: HostDetailSystemMetricsProps) {
  const charts = availableCharts(SYSTEM_CHARTS, availableMetrics);
  return (
    <section className="flex flex-col gap-3">
      <header>
        <div className="font-semibold text-[13px] text-foreground">System metrics</div>
        <div className="text-[11px] text-foreground-muted">
          {charts.map((c) => c.title.toLowerCase()).join(" · ") || "no system metrics reported"}
        </div>
      </header>
      {charts.length === 0 ? (
        <Card padding="md" className="border-border">
          <div className="grid h-[120px] place-items-center text-center text-[12px] text-foreground-muted">
            <div>
              This host is not reporting system metrics in the selected range.
              <br />
              Enable the OpenTelemetry <code className="rounded bg-muted px-1">hostmetrics</code>{" "}
              receiver on its collector to populate CPU, memory, disk and network charts.
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {charts.map((def) => (
            <SeriesChartCard
              key={def.group}
              endpoint={hostSeriesEndpoint(host)}
              queryKeyPrefix={`host-detail.series.${host}`}
              def={def}
            />
          ))}
        </div>
      )}
    </section>
  );
}

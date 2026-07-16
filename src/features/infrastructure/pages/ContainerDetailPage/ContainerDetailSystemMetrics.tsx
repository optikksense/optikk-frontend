import { Card } from "@shared/components/primitives/ui";

import { type PodMetricGroup, podSeriesEndpoint } from "../../api/podDetailApi";
import { type ChartDef, SeriesChartCard, availableCharts } from "../../components/SeriesChartCard";

interface ContainerDetailSystemMetricsProps {
  readonly pod: string;
  /** Metric groups the pod reports; null while the overview is loading. */
  readonly availableMetrics: readonly string[] | null;
}

const POD_CHARTS: readonly ChartDef<PodMetricGroup>[] = [
  { group: "cpu", title: "CPU utilization", label: "CPU %", format: "percentage" },
  { group: "memory", title: "Memory", label: "Bytes", format: "bytes" },
  { group: "filesystem", title: "Filesystem", label: "Bytes", format: "bytes" },
  { group: "network_io", title: "Network traffic", label: "Bytes/s", format: "bytes" },
  { group: "network_errors", title: "Network errors", label: "Per second", format: "number" },
  { group: "restarts", title: "Container restarts", label: "Restarts", format: "number" },
  { group: "jvm_memory", title: "JVM memory", label: "Bytes", format: "bytes" },
];

export function ContainerDetailSystemMetrics({
  pod,
  availableMetrics,
}: ContainerDetailSystemMetricsProps) {
  const charts = availableCharts(POD_CHARTS, availableMetrics);
  return (
    <section className="flex flex-col gap-3">
      <header>
        <div className="font-semibold text-[13px] text-foreground">Container metrics</div>
        <div className="text-[11px] text-foreground-muted">
          {charts.map((c) => c.title.toLowerCase()).join(" · ") || "no container metrics reported"}
        </div>
      </header>
      {charts.length === 0 ? (
        <Card padding="md" className="border-border">
          <div className="grid h-[120px] place-items-center text-center text-[12px] text-foreground-muted">
            <div>
              This pod is not reporting container metrics in the selected range.
              <br />
              Enable the OpenTelemetry <code className="rounded bg-muted px-1">kubeletstats</code>{" "}
              receiver on the cluster collector to populate CPU, memory, filesystem and network
              charts.
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {charts.map((def) => (
            <SeriesChartCard
              key={def.group}
              endpoint={podSeriesEndpoint(pod)}
              queryKeyPrefix={`container-detail.series.${pod}`}
              def={def}
            />
          ))}
        </div>
      )}
    </section>
  );
}

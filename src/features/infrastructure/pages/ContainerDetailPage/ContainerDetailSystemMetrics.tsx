import { type PodMetricGroup, podSeriesEndpoint } from "../../api/podDetailApi";
import type { ChartDef } from "../../components/SeriesChartCard";
import { DetailMetricsSection } from "../../components/detail/DetailMetricsSection";

interface ContainerDetailSystemMetricsProps {
  readonly pod: string;
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
  return (
    <DetailMetricsSection
      title="Container metrics"
      charts={POD_CHARTS}
      availableMetrics={availableMetrics}
      endpoint={podSeriesEndpoint(pod)}
      queryKeyPrefix={`container-detail.series.${pod}`}
      emptyLabel="no container metrics reported"
      emptyState={
        <>
          This pod is not reporting container metrics in the selected range.
          <br />
          Enable the OpenTelemetry <code className="rounded bg-muted px-1">kubeletstats</code>{" "}
          receiver on the cluster collector to populate CPU, memory, filesystem and network charts.
        </>
      }
    />
  );
}
